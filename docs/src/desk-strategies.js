/**
 * KalshiPaperSim — Live Desk entrants
 * =====================================================================
 * Each entry is a full strategy definition (thesis, rules, sizing) plus one
 * executable function: `decide(view)`. It receives a POINT-IN-TIME view of the
 * desk (only data captured at or before the cut-off) and returns order intents
 * that the desk prices against the REAL captured ladder via placeDeskOrder().
 *
 * THE MANDATE (from the competition rules): highest return only. None of these
 * entries carries a stop-loss, a position cap or a volatility target. That is
 * the brief, not an oversight — and the desk publishes what it costs.
 *
 * WHAT MAKES THESE HONEST
 *   • A strategy can only see `view.markets[].quote`, `.ladder`, `.bars`,
 *     `.closeTime` and the real liquidity numbers. There is no future data in
 *     the view, and the desk refuses any order whose ladder post-dates it.
 *   • A strategy never asserts a result. Results come from fills against real
 *     captured ladders and from the exchange's own settlements.
 *   • Strategies that cannot act are not hidden: an entry that places no order
 *     is reported with the reason (NO_LADDER / MARKET_FINALIZED / ...).
 *
 * SOURCES (official, and the reason each rule exists)
 *   • Order-book shape and reciprocal pricing:
 *     https://docs.kalshi.com/getting_started/orderbook_responses
 *   • Candlestick fields (yes_bid / yes_ask / price / volume_fp):
 *     https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *   • Fee schedule (quadratic taker fee, maker fee, no settlement fee):
 *     https://kalshi.com/docs/kalshi-fee-schedule.pdf
 *   • Market lifecycle and dates (open_time / close_time / expiration_time):
 *     https://docs.kalshi.com/api-reference/market/get-market
 *
 * The behavioural ideas (favourite–longshot bias, panic fade, expiry harvest,
 * maker spread capture) are catalogued with the public sources that describe
 * them in src/research-sources.js — this file only adapts them to the desk's
 * point-in-time interface.
 */

import { DESK_LIMITS } from './live-desk.js';
import { forecastLocations, forecastHighAt, weatherEventDate } from './forecast-store.js';

const MIN_TICK_MOVE = (market, ticks) => market.tick * ticks;

/* ------------------------------------------------------------------ *
 * Selection helpers (pure, testable)
 * ------------------------------------------------------------------ */

export function tradeableMarkets(view) {
  return (view.markets || []).filter((m) => m.tradeable && m.ladder);
}

/** The point-in-time touch (market object quote, else the captured ladder). */
export function touchOf(market) {
  return market.touch || market.quote || {};
}

/** Favourite side and the price to pay for it, from the real captured quote. */
export function favouriteOf(market) {
  const q = touchOf(market);
  const yes = q.yesAsk ?? q.mid ?? q.last;
  if (yes === null || yes === undefined) {
    const no = q.noAsk;
    return no === null || no === undefined ? null : { side: 'no', price: no };
  }
  if (yes >= 0.5) return { side: 'yes', price: q.yesAsk ?? market.ladder?.yesAsks?.[0]?.price ?? null };
  const noAsk = q.noAsk ?? market.ladder?.noAsks?.[0]?.price ?? null;
  return noAsk === null ? null : { side: 'no', price: noAsk };
}

/** Everything inside the ladder walk up to `ticks` of slippage from the touch. */
export function depthWithin(market, ticks, { action = 'buy', side = 'yes' } = {}) {
  const ladder = market.ladder;
  if (!ladder) return 0;
  const tiers = action === 'buy'
    ? (side === 'yes' ? ladder.yesAsks : ladder.noAsks).slice().sort((a, b) => a.price - b.price)
    : (side === 'yes' ? ladder.yes.levels : ladder.no.levels).slice().sort((a, b) => b.price - a.price);
  if (!tiers.length) return 0;
  const touch = tiers[0].price;
  return tiers
    .filter((t) => Math.abs(t.price - touch) <= market.tick * ticks + 1e-9)
    .reduce((s, t) => s + t.count, 0);
}

function sizeFromCash(view, price, fraction) {
  if (!(price > 0)) return 0;
  return Math.max(DESK_LIMITS.minContracts, Math.floor((view.cash * fraction) / price));
}

/**
 * SIZE TO THE BOOK, NOT TO A WISH.
 *
 * Every desk entry sizes against the REAL captured ladder: `shareOfDepth` of
 * the contracts resting within `ticks` of the touch, never more than the cash
 * fraction allows. This is the "bid sizing" a trader does before sending an
 * order, and it is why the desk's fill rates are high while an over-requesting
 * entry (LiveDepthSweep_Taker) still reports real unfilled size.
 */
export function sizeToDepth(view, market, { side, price, cashFraction, ticks = 2, shareOfDepth = 1 }) {
  if (!(price > 0)) return 0;
  const depth = depthWithin(market, ticks, { action: 'buy', side });
  const byDepth = Math.floor(depth * shareOfDepth);
  const byCash = Math.floor((view.cash * cashFraction) / price);
  return Math.max(0, Math.min(byDepth, byCash));
}

function openEventGroups(view) {
  const groups = new Map();
  for (const market of tradeableMarkets(view)) {
    const event = String(market.ticker).split('-').slice(0, 2).join('-');
    if (!groups.has(event)) groups.set(event, []);
    groups.get(event).push(market);
  }
  return groups;
}

function lastBars(market, n) {
  return (market.bars || []).slice(-n);
}

/* ------------------------------------------------------------------ *
 * The entrants
 * ------------------------------------------------------------------ */

export const DESK_STRATEGIES = Object.freeze([
  {
    id: 'live_favourite_settle',
    username: 'LiveFavourite_Settle',
    name: 'Desk: Favourite Buy-and-Settle',
    category: 'Favourite / Settlement',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
    thesis:
      'Buy the side the market already prices at or above 0.75 and hold it to the exchange’s own settlement. On Kalshi prices ARE probabilities, so this is the closest thing to a "carry" trade the desk has — it wins often and loses the whole stake when it is wrong.',
    rules: [
      'Universe: every OPEN contract with a REAL captured ladder at the cut-off.',
      'Trigger: the captured ask on the favourite side is between 0.75 and 0.97.',
      'Entry: taker buy of the favourite, sized to 35% of cash, capped by real depth within 2 ticks.',
      'Exit: none. The position is held until the exchange finalizes the contract and pays $1.00 or $0.00.'
    ],
    sizing: '35% of cash per entry, bounded by the real ladder and the 10% liquidity cap',
    decide(view) {
      const out = [];
      const markets = tradeableMarkets(view)
        .filter((m) => m.quote?.yesAsk !== null && m.quote?.yesAsk !== undefined)
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of markets.slice(0, 3)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null) continue;
        if (fav.price < 0.75 || fav.price > 0.97) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.35, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `favourite at ${fav.price} (real captured quote, ladder ${market.ladderAt}); holding to settlement`
        });
      }
      return out;
    }
  },
  {
    id: 'live_tail_premium_no',
    username: 'LiveTailPremium_NO',
    name: 'Desk: Longshot Premium Collector (buys the favourite)',
    category: 'Fee structure / Favourite',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'When the market prices an outcome at 0.10 or below, the opposite side is a 0.90+ favourite: pay ~0.94, collect 1.00 at settlement, and pay very little fee because C·P·(1−P) is small at the extremes of the price range. This is the fee-optimal favourite trade; it wins small and often, and loses the whole stake the once the longshot lands.',
    rules: [
      'Trigger: the real captured ladder offers the NO side at 0.90–0.985 (equivalently YES is priced 0.015–0.10).',
      'Entry: taker buy of NO, sized to the real NO-side depth within 3 ticks, capped at 25% of cash.',
      'Exit: hold to the exchange settlement — $1.00 if the longshot fails, $0.00 if it lands.'
    ],
    sizing: '25% of cash, up to three legs, each bounded by the real ladder',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .map((m) => ({ market: m, noAsk: m.ladder?.noAsks?.[0]?.price ?? touchOf(m).noAsk }))
        .filter((c) => c.noAsk !== null && c.noAsk !== undefined && c.noAsk >= 0.9 && c.noAsk <= 0.985)
        .sort((a, b) => a.noAsk - b.noAsk || (b.market.volume || 0) - (a.market.volume || 0));
      for (const { market, noAsk } of candidates.slice(0, 3)) {
        const count = sizeToDepth(view, market, { side: 'no', price: noAsk, cashFraction: 0.25, ticks: 3 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'no',
          action: 'buy',
          type: 'market',
          count,
          reason: `the real ladder offers NO at ${noAsk} (YES priced ${(1 - noAsk).toFixed(4)}) — paying ${noAsk} to collect 1.00 at settlement`
        });
      }
      return out;
    }
  },
  {
    id: 'live_longshot_convexity',
    username: 'LiveLongshot_Convexity',
    name: 'Desk: Cheap-Tail Convexity (lottery tickets)',
    category: 'Tail convexity',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'The mirror image of the premium collector: buy the cheapest real offer on EITHER side (≤ 0.05) when the ladder actually shows size there. Most of these expire worthless — that is the point of a convexity sleeve — and the desk reports the hit rate and the fee drag rather than hiding them.',
    rules: [
      'Trigger: the real captured ladder offers YES or NO at 0.05 or less, on the side with the deeper book.',
      'Entry: taker buy of the cheap side, sized to that real depth within 2 ticks, capped at 8% of cash.',
      'Exit: hold to settlement.'
    ],
    sizing: '8% of cash per tail, up to three tails',
    decide(view) {
      const out = [];
      const candidates = [];
      for (const market of tradeableMarkets(view)) {
        const yesAsk = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
        const noAsk = market.ladder?.noAsks?.[0]?.price ?? touchOf(market).noAsk;
        if (yesAsk !== null && yesAsk !== undefined && yesAsk <= 0.05) candidates.push({ market, side: 'yes', price: yesAsk });
        if (noAsk !== null && noAsk !== undefined && noAsk <= 0.05) candidates.push({ market, side: 'no', price: noAsk });
      }
      candidates.sort((a, b) => a.price - b.price || String(a.market.ticker).localeCompare(String(b.market.ticker)));
      for (const { market, side, price } of candidates.slice(0, 3)) {
        const count = sizeToDepth(view, market, { side, price, cashFraction: 0.08, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side,
          action: 'buy',
          type: 'market',
          count,
          reason: `${side.toUpperCase()} offered at ${price} on a real ladder — a convexity ticket, expected to expire worthless most of the time`
        });
      }
      return out;
    }
  },
  {
    id: 'live_cheap_bracket_ladder',
    username: 'LiveCheapBracket_Ladder',
    name: 'Desk: Cheap-Bracket Event Ladder',
    category: 'Event ladder / Convexity',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'Event boards (weather buckets, game lines) price a set of mutually exclusive outcomes. The desk buys the three cheapest real brackets in the largest open event board: each leg is convex (a 5-cent contract pays $1.00) and, because the legs are mutually exclusive, at most one of them can win — but the board as a whole rarely prices the tail cheaply enough for the market’s own sum.',
    rules: [
      'Universe: the open event group with the most contracts carrying a REAL captured ladder.',
      'Entry: taker buy of the three cheapest YES brackets with real depth, each sized to 8% of cash.',
      'Exit: hold to settlement; the desk reports the board sum it paid against the $1.00 that the winning leg pays.'
    ],
    sizing: '8% of cash per leg, three legs',
    decide(view) {
      const groups = [...openEventGroups(view).values()].filter((g) => g.length >= 2);
      if (!groups.length) return [];
      groups.sort((a, b) => b.length - a.length || String(a[0].ticker).localeCompare(String(b[0].ticker)));
      const group = groups[0];
      const legs = group
        .filter((m) => touchOf(m).yesAsk !== null && touchOf(m).yesAsk !== undefined && touchOf(m).yesAsk <= 0.25)
        .sort((a, b) => (touchOf(a).yesAsk - touchOf(b).yesAsk) || String(a.ticker).localeCompare(String(b.ticker)))
        .slice(0, 3);
      return legs.map((market) => {
        const count = sizeToDepth(view, market, { side: 'yes', price: touchOf(market).yesAsk, cashFraction: 0.08, ticks: 2 });
        return {
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `cheapest leg of the ${group.length}-contract event board at ${touchOf(market).yesAsk}`
        };
      }).filter((o) => o.count >= DESK_LIMITS.minContracts);
    }
  },
  {
    id: 'live_depth_sweep_taker',
    username: 'LiveDepthSweep_Taker',
    name: 'Desk: Deepest-Ladder Taker Sweep',
    category: 'Liquidity / Impact',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'Liquidity is not evenly distributed: a handful of open contracts show real two-sided ladders hundreds of ticks deep. This desk entry measures the visible ladder at the cut-off, buys the YES side of the contract with the deepest book within two ticks of the touch, and pays the taker fee for immediacy — the point is to make the desk pay the cost of size rather than assume it.',
    rules: [
      'Rank every open contract by real contracts available within 2 ticks of the YES touch.',
      'Entry: one taker buy on the deepest, sized to 20% of cash and capped by that same depth.',
      'Exit: hold to settlement; slippage and fees are reported per fill.'
    ],
    sizing: '20% of cash, single leg',
    decide(view) {
      const ranked = tradeableMarkets(view)
        .map((m) => ({ market: m, depth: depthWithin(m, 2, { action: 'buy', side: 'yes' }) }))
        .filter((r) => r.depth > 0)
        .sort((a, b) => b.depth - a.depth || String(a.market.ticker).localeCompare(String(b.market.ticker)));
      if (!ranked.length) return [];
      const { market, depth } = ranked[0];
      const price = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
      if (price === null || price === undefined) return [];
      // 1.25x the visible depth: an aggressive order that CANNOT be filled in
      // full. The desk reports the shortfall instead of inventing a price.
      const count = Math.min(sizeFromCash(view, price, 0.20), Math.ceil(depth * 1.25));
      if (count < DESK_LIMITS.minContracts) return [];
      return [{
        ticker: market.ticker,
        side: 'yes',
        action: 'buy',
        type: 'market',
        count,
        reason: `deepest real YES ladder at the cut-off (${depth} contracts within 2 ticks); deliberately over-sized to 1.25x to show what the real book cannot absorb`
      }];
    }
  },
  {
    id: 'live_maker_touch',
    username: 'LiveMakerTouch',
    name: 'Desk: Touch Maker (post-only)',
    category: 'Liquidity provision',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'Resting orders pay the maker fee (a quarter of the taker rate) and on plain-quadratic series they pay nothing at all. This entry posts one tick better than the best real bid on the tightest-spread open contract, never crossing, and lets a LATER real quote cross it. The fill is capped by that period’s real traded volume, so the desk never books more liquidity than the market actually did.',
    rules: [
      'Pick the open contract with the tightest real quoted spread.',
      'Entry: post-only buy one tick inside the touch (never crossing the ask).',
      'Fill: only when a later captured quote crosses the resting price, up to the real traded volume of that period.'
    ],
    sizing: '30% of cash, single leg',
    decide(view) {
      const candidates = tradeableMarkets(view)
        .filter((m) => touchOf(m).yesBid !== null && touchOf(m).yesAsk !== null)
        .map((m) => ({ market: m, bid: touchOf(m).yesBid, ask: touchOf(m).yesAsk, spreadTicks: Math.round((touchOf(m).yesAsk - touchOf(m).yesBid) / m.tick) }))
        .filter((c) => c.spreadTicks >= 2)
        .sort((a, b) => a.spreadTicks - b.spreadTicks || String(a.market.ticker).localeCompare(String(b.market.ticker)));
      if (!candidates.length) return [];
      const { market, bid, ask } = candidates[0];
      const price = Number((bid + market.tick).toFixed(6));
      if (price >= ask) return [];
      // Post-only: size to the size resting at and above the real touch, so the
      // order is one a real counterparty could actually cross.
      const count = sizeToDepth(view, market, { side: 'yes', price, cashFraction: 0.30, ticks: 1 });
      if (count < DESK_LIMITS.minContracts) return [];
      return [{
        ticker: market.ticker,
        side: 'yes',
        action: 'buy',
        type: 'limit',
        limitPrice: price,
        postOnly: true,
        count,
        reason: `post-only bid one tick above the real touch (${bid}) on a ${candidates[0].spreadTicks}-tick spread`
      }];
    }
  },
  {
    id: 'live_momentum_bars',
    username: 'LiveMomentum_Bars',
    name: 'Desk: Captured-Bar Momentum',
    category: 'Short-horizon momentum',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'Using only the market’s OWN captured bars (real quoted bid/ask and real traded price per period), this entry follows a market whose traded price has risen in each of the last three periods and is above its 12-period mean. Momentum in prediction markets is usually thin — the desk measures whether the move continued to settlement instead of assuming it does.',
    rules: [
      'Signal: last three real traded closes strictly rising AND the last close above the 12-period mean.',
      'Entry: taker buy YES, 15% of cash, capped by real depth within 2 ticks.',
      'Exit: hold to settlement.'
    ],
    sizing: '15% of cash, single leg',
    decide(view) {
      const out = [];
      for (const market of tradeableMarkets(view)) {
        const bars = lastBars(market, 12).filter((b) => b.trade !== null && b.trade !== undefined);
        if (bars.length < 6) continue;
        const last3 = bars.slice(-3);
        const rising = last3[1].trade > last3[0].trade && last3[2].trade > last3[1].trade;
        const mean = bars.reduce((s, b) => s + b.trade, 0) / bars.length;
        const last = bars[bars.length - 1].trade;
        if (!rising || last <= mean) continue;
        const price = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
        if (price === null || price === undefined) continue;
        const count = sizeToDepth(view, market, { side: 'yes', price, cashFraction: 0.15, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `three rising captured closes (${last3.map((b) => b.trade).join(' → ')}) above the 12-period mean ${mean.toFixed(4)}`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  },
  {
    id: 'live_meanrev_spike',
    username: 'LiveMeanRev_Spike',
    name: 'Desk: Captured-Bar Spike Fade',
    category: 'Short-horizon mean reversion',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'The R14 source strategy `fade` (PriceKalshiHistorical) fades a sharp mid move rather than following it. On the desk the same rule runs on captured bars: a ≥4-tick move in one period is faded by buying the side that became cheap — the desk then reports whether the fade paid or the move continued.',
    rules: [
      'Signal: |last close − previous close| ≥ 4 ticks in the captured bars.',
      'Entry: buy the side that moved DOWN (YES if the price fell, NO if it rose), 15% of cash, real depth within 2 ticks.',
      'Exit: hold to settlement.'
    ],
    sizing: '15% of cash, one leg',
    decide(view) {
      for (const market of tradeableMarkets(view)) {
        const bars = lastBars(market, 6).filter((b) => b.trade !== null && b.trade !== undefined);
        if (bars.length < 2) continue;
        const prev = bars[bars.length - 2].trade;
        const last = bars[bars.length - 1].trade;
        const move = last - prev;
        if (Math.abs(move) < MIN_TICK_MOVE(market, 4)) continue;
        const side = move < 0 ? 'yes' : 'no';
        const price = side === 'yes'
          ? market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk
          : market.ladder?.noAsks?.[0]?.price ?? touchOf(market).noAsk;
        if (price === null || price === undefined) continue;
        const count = sizeToDepth(view, market, { side, price, cashFraction: 0.15, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        return [{
          ticker: market.ticker,
          side,
          action: 'buy',
          type: 'market',
          count,
          reason: `${move > 0 ? 'rise' : 'fall'} of ${Math.abs(move).toFixed(3)} (${Math.round(Math.abs(move) / market.tick)} ticks) in the last captured period — fading it`
        }];
      }
      return [];
    }
  },
  {
    id: 'live_expiry_harvest',
    username: 'LiveExpiryHarvest',
    name: 'Desk: Near-Expiry Favourite Harvest',
    category: 'Expiry harvest',
    source: 'desk',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'A contract that closes soon and trades at 0.90+ is the desk’s cheapest way to buy a near-certain dollar: the fee curve is small near the extremes and the holding period is short, so the annualised cost of being wrong is concentrated into a few days. The desk reports the real close_time it used and the exchange’s settlement when it lands.',
    rules: [
      'Trigger: real close_time within 14 days of the desk cut-off AND YES ask ≥ 0.90 with real depth.',
      'Entry: taker buy YES, 30% of cash, capped by real depth within 1 tick.',
      'Exit: hold to settlement.'
    ],
    sizing: '30% of cash, up to two legs',
    decide(view) {
      const out = [];
      const horizon = view.asOfMs + 14 * 24 * 3600 * 1000;
      const candidates = tradeableMarkets(view)
        .filter((m) => {
          const close = m.closeMs;
          const ask = touchOf(m).yesAsk;
          return Number.isFinite(close) && close <= horizon && ask !== null && ask !== undefined && ask >= 0.9;
        })
        .sort((a, b) => (a.closeMs - b.closeMs) || (touchOf(b).yesAsk - touchOf(a).yesAsk));
      for (const market of candidates.slice(0, 2)) {
        const price = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
        const count = sizeToDepth(view, market, { side: 'yes', price, cashFraction: 0.30, ticks: 1 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `closes ${market.closeTime} at ${touchOf(market).yesAsk} — collecting the last few cents to settlement`
        });
      }
      return out;
    }
  },
  /* ------------------------------------------------------------------ *
   * PROJECT-MAPPED ENTRIES
   * Each of these adapts one of the owner's own MasterSite projects to a
   * Kalshi market class the desk can actually price. The mapping, the
   * project and its catalogue entry are stated on the strategy so a reader
   * can check it in the Research tab (src/signal-sources.js).
   * ------------------------------------------------------------------ */
  {
    id: 'live_fda_decision_premium',
    username: 'LiveFDA_DecisionPremium',
    name: 'Desk: FDA decision favourite (MasterSite DrugAnalysis → KXFDA*)',
    category: 'Event-driven / FDA decisions',
    source: 'desk · MasterSite DrugAnalysis (S06) + FDA calendar',
    mandate: "MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.",
    thesis:
      "The owner's DrugAnalysis project tracks FDA decision calendars; Kalshi lists the same events as date-bracketed contracts (KXFDAAPPROVE, KXFDAANNOUNCE, KXFDAAPPROVALDATECMPS, KXFDARETATRUTIDE). A decision that has already effectively happened, or is priced as near-certain, trades as a 0.80–0.96 favourite, and the quadratic fee is small there because C·P·(1−P) is tiny. Buy that favourite and hold it to the exchange's own settlement.",
    rules: [
      'Universe: every KXFDA* contract with a real captured ladder at the cut-off.',
      'Trigger: the captured ask on the favourite side is 0.80–0.96 (the desk prices the reciprocal NO bid when buying YES).',
      'Entry: taker buy of the favourite, sized to the real ladder within 3 ticks, capped at 30% of cash, up to 3 legs.',
      'Exit: none — hold to the exchange settlement ($1.00 / $0.00), which the desk books from settlement_value_dollars.'
    ],
    sizing: '30% of cash per leg, max 3 legs, each bounded by the real ladder within 3 ticks',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => String(m.seriesTicker || '').startsWith('KXFDA'))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 12)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.8 || fav.price > 0.96) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.3, ticks: 3 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `FDA decision at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to the exchange settlement`
        });
        if (out.length >= 3) break;
      }
      return out;
    }
  },
  {
    id: 'live_ncaa_favourite_hold',
    username: 'LiveNCAA_GameFavourite',
    name: 'Desk: NCAA game favourite (MasterSite NCAA scoreboard → KXNCAAFGAME)',
    category: 'Sports / scoreboard',
    source: 'desk · MasterSite Ncaa-football-alerts (S07) + NCAA scoreboard',
    mandate: "MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.",
    thesis:
      'The NCAA scoreboard and injury projects feed a simple market fact: in a two-outcome game contract the exchange prices one side as a heavy favourite (0.90–0.99) and the other as a longshot. The favourite costs a few cents of premium and pays $1.00 at settlement; the fee is tiny at P≈0.97 because the quadratic term nearly vanishes. This is the highest-expected-value side of a sports book when the market has already done the handicapping.',
    rules: [
      'Universe: every KXNCAAFGAME contract with a real captured ladder at the cut-off.',
      'Trigger: the captured ask on the favourite side is 0.90–0.99.',
      'Entry: taker buy of the favourite, sized to the real ladder within 2 ticks, capped at 20% of cash, up to 3 legs.',
      'Exit: none — hold to the exchange settlement, which pays $1.00 / $0.00 on the real result.'
    ],
    sizing: '20% of cash per leg, max 3 legs, each bounded by the real ladder within 2 ticks',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => String(m.seriesTicker || '') === 'KXNCAAFGAME')
        .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
      for (const market of candidates.slice(0, 8)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.9 || fav.price > 0.99) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.2, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `NCAA game favourite at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to settlement`
        });
        if (out.length >= 3) break;
      }
      return out;
    }
  },
  {
    id: 'live_nba_favourite_hold',
    username: 'LiveNBA_GameFavourite',
    name: 'Desk: NBA game favourite (MasterSite NBA Injury → KXNBAGAME)',
    category: 'Sports / scoreboard',
    source: 'desk · MasterSite NBAInjuryReport (S05) + NBA scoreboard',
    mandate: "MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.",
    thesis:
      'The NBA injury monitor is a real project (S05) whose feed is not archived here point-in-time, so this entry does NOT trade on injury designations. What THIS repository does hold is the exchange\'s own KXNBAGAME ladders. In a two-outcome game contract the book prices one side as a heavy favourite; the quadratic fee is tiny there. Buy that favourite against the captured ladder and hold it to the exchange settlement. The injury project remains a candidate signal (blockedBy in S05) — this is the Kalshi-price half that is testable today.',
    rules: [
      'Universe: every KXNBAGAME contract with a real captured ladder at the cut-off.',
      'Trigger: the captured ask on the favourite side is 0.90–0.99.',
      'Entry: taker buy of the favourite, sized to the real ladder within 2 ticks, capped at 20% of cash, up to 3 legs.',
      'Exit: none — hold to the exchange settlement, which pays $1.00 / $0.00 on the real result.'
    ],
    sizing: '20% of cash per leg, max 3 legs, each bounded by the real ladder within 2 ticks',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => String(m.seriesTicker || '') === 'KXNBAGAME')
        .sort((a, b) => (b.volume24h || 0) - (a.volume24h || 0));
      for (const market of candidates.slice(0, 8)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.9 || fav.price > 0.99) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.2, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `NBA game favourite at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to settlement`
        });
        if (out.length >= 3) break;
      }
      return out;
    }
  },
  {
    id: 'live_ceo_change_fav',
    username: 'LiveCEO_ChangeFav',
    name: 'Desk: CEO-change favourite (exchange series, not a MasterSite project)',
    category: 'Event-driven / CEO',
    source: 'desk · Kalshi CEO-change series (TESLACEOCHANGE / JPMCEOCHANGE / KXOPENAICEOCHANGE) — S00 project NOT FOUND',
    mandate: "MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.",
    thesis:
      'The owner asked for a strategy from a "CEO" project. No such repository exists (S00, Irregularity #32). What DOES exist on the exchange — and is captured here with real ladders — are CEO-change contracts (TESLACEOCHANGE, JPMCEOCHANGE, KXOPENAICEOCHANGE). This entry trades those markets on the desk using only the exchange\'s own prices, the same series CEOExit_Drift already replays on daily bars. It does not pretend the missing project supplied a signal.',
    rules: [
      'Universe: every open contract whose series ticker matches /CEOCHANGE/, with a real captured ladder at the cut-off.',
      'Trigger: the captured ask on the favourite side is 0.80–0.97.',
      'Entry: taker buy of the favourite, sized to the real ladder within 3 ticks, capped at 30% of cash, up to 2 legs.',
      'Exit: none — hold to the exchange settlement.'
    ],
    sizing: '30% of cash per leg, max 2 legs, each bounded by the real ladder within 3 ticks',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => /CEOCHANGE/i.test(String(m.seriesTicker || '')) || /CEOCHANGE/i.test(String(m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 6)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.8 || fav.price > 0.97) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.3, ticks: 3 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `CEO-change favourite at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to settlement. Not sourced from a MasterSite CEO project (S00 not found).`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  },
  {
    id: 'live_mlb_favourite_hold',
    username: 'LiveMLB_GameFavourite',
    name: 'Desk: MLB favourite buy-and-settle (MasterSite S09, MLB-Live-PBP)',
    category: 'Sports / Favourite',
    watch: /^KXMLB/i,
    source: 'S09 · MLB-Live-PBP (MasterSite) — the Kalshi MLB markets are official and captured here; the project side still needs a point-in-time play-by-play archive',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'Baseball is the sport where the pre-game favourite is most often priced near its true probability, which is exactly the shape this desk can price honestly: buy the side the real ladder already calls the favourite (0.75–0.97) and hold it to the exchange\'s own settlement. S09 (MLB-Live-PBP) supplies the scoreboard side of the idea; the tradeable half is the official Kalshi market, and this entry refuses to act until that market has a CAPTURED LADDER — the MLB series were quoted-only on the 2026-09-18 store, and the on-demand ingest was pointed at them for exactly this reason.',
    rules: [
      'Universe: every OPEN KXMLB* contract with a real captured ladder at the cut-off (game, series and season-long markets).',
      'Trigger: the captured ask on the favourite side is 0.75–0.97.',
      'Entry: taker buy of the favourite, sized to the real ladder within 2 ticks, capped at 30% of cash, up to 3 legs.',
      'Exit: none — hold to the exchange settlement.'
    ],
    sizing: '30% of cash per leg, max 3 legs, each bounded by the real captured depth',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => /^KXMLB/i.test(String(m.seriesTicker || '')) || /^KXMLB/i.test(String(m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 6)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.75 || fav.price > 0.97) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.3, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `MLB favourite at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to the exchange settlement`
        });
        if (out.length >= 3) break;
      }
      return out;
    }
  },
  {
    id: 'live_nfl_favourite_hold',
    username: 'LiveNFL_GameFavourite',
    name: 'Desk: NFL favourite buy-and-settle (MasterSite S08, NFL-scoreboard)',
    category: 'Sports / Favourite',
    watch: /^KXNFL/i,
    source: 'S08 · NFL-scoreboard (MasterSite) — the Kalshi NFL markets are official and captured here; the project side still needs a point-in-time scoreboard archive',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting. Sizing is a fixed fraction of cash, bounded by the real captured ladder.',
    thesis:
      'The NFL is the deepest sports franchise on Kalshi, and the favourite–longshot bias is at its most visible in game and division markets. This entry buys the side the captured ladder already prices at 0.75–0.97 and holds it to settlement. Like the MLB entrant it is a MasterSite-derived idea whose Kalshi half is official: NFL series were quoted-only on the 2026-09-18 store, so it abstains (with the reason published) until a real ladder exists for them.',
    rules: [
      'Universe: every OPEN KXNFL* contract with a real captured ladder at the cut-off (game, spread, total, division and conference markets).',
      'Trigger: the captured ask on the favourite side is 0.75–0.97.',
      'Entry: taker buy of the favourite, sized to the real ladder within 2 ticks, capped at 30% of cash, up to 3 legs.',
      'Exit: none — hold to the exchange settlement.'
    ],
    sizing: '30% of cash per leg, max 3 legs, each bounded by the real captured depth',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => /^KXNFL/i.test(String(m.seriesTicker || '')) || /^KXNFL/i.test(String(m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 6)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price === undefined) continue;
        if (fav.price < 0.75 || fav.price > 0.97) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.3, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `NFL favourite at ${fav.price} (real captured touch, ladder ${market.ladderAt}); closes ${market.closeTime}; holding to the exchange settlement`
        });
        if (out.length >= 3) break;
      }
      return out;
    }
  },
  {
    id: 'live_the_leap_momentum',
    username: 'LiveTheLeap_Momentum',
    name: 'Desk: cheap out-of-the-money index/crypto strike sweep (named after the S03 archetype)',
    category: 'Index & Crypto / Convex longshot',
    watch: /^KX(NASDAQ100|INX|BTC)/i,
    source: 'S03 · TradingView The Leap — NAME ONLY. The project publishes contest facts and verdicts, not a signal feed; nothing from it is read here. This is an original longshot design of this repository that trades the exchange\'s own captured ladders.',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
    thesis:
      'A cheap out-of-the-money index or crypto strike pays 4×–20× if the range resolves its way, which is the convexity a maximum-return mandate asks for. The favourite–longshot literature (R02/R05) predicts these strikes are OVERPRICED on average, so this entry is as much a control as a bet: it buys open KXNASDAQ100Y / KXINXY / KXBTC* contracts whose captured YES ask is 0.05–0.25 and holds them to settlement. It does not read The Leap\'s competition data, any futures price, or any breakout signal — the earlier wording that attributed "champion" behaviour to it was removed (irregularity #53).',
    rules: [
      'Universe: open KXNASDAQ100Y, KXINXY and KXBTC* contracts with captured ladders.',
      'Trigger: captured YES ask between 0.05 and 0.25 (no quote → no trade; a price is never assumed).',
      'Entry: taker buy of YES, sized to 35% of cash, bounded by real depth within 2 ticks; at most 2 legs per cut-off.',
      'Exit: none — hold to settlement.'
    ],
    sizing: '35% of cash per leg, max 2 legs, bounded by real depth',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => /^KX(NASDAQ100|INX|BTC)/i.test(String(m.seriesTicker || m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 4)) {
        const touch = touchOf(market);
        const ask = touch.yesAsk ?? market.ladder?.yesAsks?.[0]?.price ?? null;
        if (ask === null || ask < 0.05 || ask > 0.25) continue;
        const count = sizeToDepth(view, market, { side: 'yes', price: ask, cashFraction: 0.35, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `cheap OTM strike: captured YES ask ${ask} in 0.05–0.25 (ladder ${market.ladderAt}) → buy YES, hold to settlement (convex longshot; no external signal)`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  },
  {
    id: 'live_insider_filing_fader',
    username: 'LiveInsider_FilingFader',
    name: 'Desk: CEO-change NO buyer — price-only (a Form 4 archive now exists; this entry still does not read it)',
    category: 'Corporate Events / Longshot fade',
    watch: /CEOCHANGE|KXFDA/i,
    source: 'S02 · Insider-trades (MasterSite) — NOT USED by this entry. A point-in-time SEC Form 4 archive now EXISTS in this repository (data/form4-signals/, sec.gov, grown by .github/workflows/form4-signals.yml) and the desk entrant LiveInsider_Form4Flow reads it; THIS entry still reads NO insider data and trades only the exchange\'s own captured ladders on CEO-change contracts. The username records the signal it was named for.',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
    thesis:
      'CEO-departure contracts (TESLACEOCHANGE, JPMCEOCHANGE, KXOPENAICEOCHANGE) are long-dated longshots: the favourite–longshot bias (R02/R05) says the YES side of a rumour tends to be overpriced, so buying NO when YES asks ≤ 0.35 and holding to settlement is the mechanical bet. That is the entire rule. It is NOT an insider-filing strategy: nothing here knows whether an insider bought or sold — the earlier wording ("when insiders maintain their equity holdings") described data the desk does not have and was removed (irregularity #53). The upgrade S02 asked for now exists as a SEPARATE entry — LiveInsider_Form4Flow reads the real Form 4 archive through the desk signal hook — so this one stays as the price-only control the two can be compared against.',
    rules: [
      'Universe: open CEO-change contracts with captured ladders.',
      'Trigger: captured YES ask ≤ 0.35 AND a captured NO ask between 0.65 and 0.95 (no quote → no trade; a price is never assumed).',
      'Entry: taker buy of NO, sized to 30% of cash, bounded by real ladder depth within 2 ticks; at most 2 legs.',
      'Exit: hold to real settlement.'
    ],
    sizing: '30% of cash per leg, max 2 legs, bounded by real depth',
    decide(view) {
      const out = [];
      const candidates = tradeableMarkets(view)
        .filter((m) => /CEOCHANGE/i.test(String(m.seriesTicker || m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 3)) {
        const touch = touchOf(market);
        const yesAsk = touch.yesAsk ?? null;
        const noAsk = touch.noAsk ?? market.ladder?.noAsks?.[0]?.price ?? null;
        if (yesAsk === null || noAsk === null) continue; // no captured quote → abstain, never assume one
        if (yesAsk > 0.35 || noAsk > 0.95 || noAsk < 0.65) continue;
        const count = sizeToDepth(view, market, { side: 'no', price: noAsk, cashFraction: 0.3, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'no',
          action: 'buy',
          type: 'market',
          count,
          reason: `CEO-change longshot fade (price-only, no insider data): captured YES ask ${yesAsk} ≤ 0.35, NO ask ${noAsk} (ladder ${market.ladderAt}) → buy NO, hold to settlement`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  },
  {
    id: 'live_insider_form4_flow',
    username: 'LiveInsider_Form4Flow',
    name: 'Desk: CEO-change NO buyer GATED by the point-in-time SEC Form 4 archive (S02, live signal)',
    category: 'Corporate Events / Longshot fade gated by an official filing archive',
    watch: /CEOCHANGE/i,
    source:
      'S02 · Insider-trades (MasterSite) — LIVE SIGNAL. Reads the repository\'s point-in-time SEC Form 4 archive (data/form4-signals/, captured from EDGAR itself by .github/workflows/form4-signals.yml) through the desk signal hook view.signals.form4, exactly as the replay reads it through ctx.signal. Nothing is quoted that the archive does not hold.',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
    thesis:
      'The desk half of InsiderFlow_Form4, and the first desk entrant that reads an external point-in-time signal archive instead of only the captured ladders. For every open CEO-change contract with a captured ladder, it asks the archive what EDGAR held at the cut-off: how many Form 4s were accepted for that issuer in the 90 days before it, and whether ANY of them was filed by an officer whose title says CEO. Only when the answer is "filings exist and none is a CEO\'s" does it buy NO — the favourite–longshot fade, gated by real Section 16 evidence rather than by price alone. ' +
      'HONEST LIMITS, stated on the card: (1) the causal link between Section 16 filings and a CEO change is weak and unproven — a departure is announced by 8-K, not by a Form 4 — so this measures whether the gate changes the fade, it does not predict departures; (2) a filing is knowable from EDGAR\'s OWN acceptance instant (the assumption is published with every answer); (3) KXOPENAICEOCHANGE can NEVER receive this signal because OpenAI is a private company with no Section 16 filers, so that contract is skipped with the reason published; (4) if the archive is dark (the workflow has not run yet) the entry places nothing at all, and says so.',
    rules: [
      'Universe: open CEO-change contracts with captured ladders whose series the Form 4 archive tracks (TESLACEOCHANGE, KXTESLACEOCHANGE, JPMCEOCHANGE, KXAAPLCEOCHANGE).',
      'Signal: view.signals.form4 available AND the issuer has at least one filing EDGAR accepted at or before the cut-off AND zero filings by a CEO-titled officer in the 90 days before it.',
      'Trigger: captured YES ask between 0.02 and 0.35 and a captured NO ask between 0.65 and 0.95 (no quote → no trade; a price is never assumed).',
      'Entry: taker buy of NO, sized to 35% of cash, bounded by real ladder depth within 2 ticks; at most 2 legs per cut-off.',
      'Exit: hold to real settlement.'
    ],
    sizing: '35% of cash per leg, max 2 legs, bounded by real depth',
    decide(view) {
      const out = [];
      const form4Signal = (view.signals && view.signals.form4) || null;
      if (!form4Signal || !form4Signal.available) return out; // archive dark → abstain entirely, and the coverage row says why
      const cutoffSeconds = Math.floor((view.asOfMs || Date.parse(view.asOf || '')) / 1000);
      if (!Number.isFinite(cutoffSeconds)) return out;
      const candidates = tradeableMarkets(view)
        .filter((m) => /CEOCHANGE/i.test(String(m.seriesTicker || m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates) {
        const join = form4Signal.issuerFor(market.ticker);
        if (!join.ok) continue; // series the archive does not track (OpenAI: private company) — reason published
        const state = form4Signal.insiderStateAt(join.issuer);
        if (!state) continue; // no filing accepted by the cut-off → no evidence, no trade
        if (Number(state.ceoFilings) > 0) continue; // a CEO's own filing inside the window: stand aside
        const touch = touchOf(market);
        const yesAsk = touch.yesAsk ?? null;
        const noAsk = touch.noAsk ?? market.ladder?.noAsks?.[0]?.price ?? null;
        if (yesAsk === null || noAsk === null) continue; // no captured quote → abstain, never assume one
        if (yesAsk < 0.02 || yesAsk > 0.35 || noAsk > 0.95 || noAsk < 0.65) continue;
        const count = sizeToDepth(view, market, { side: 'no', price: noAsk, cashFraction: 0.35, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        const flow = state.openMarket || { shares: 0, buys: 0, sells: 0 };
        out.push({
          ticker: market.ticker,
          side: 'no',
          action: 'buy',
          type: 'market',
          count,
          reason: `SEC Form 4 archive (EDGAR, knowable from its own acceptance instant): ${state.filingsInWindow} filing(s) for ${state.symbol} in the ${state.windowDays} days to the cut-off, newest ${state.newestAcceptedAt}, NONE by a CEO-titled officer, net open-market flow ${flow.shares >= 0 ? '+' : ''}${flow.shares} shares → captured YES ask ${yesAsk} / NO ask ${noAsk} (ladder ${market.ladderAt}) — buy NO, hold to settlement`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  },
  {
    id: 'live_weather_forecast_edge',
    username: 'LiveWeather_ForecastEdge',
    name: 'Desk: NWS point-in-time forecast confirmation on open weather brackets (MasterSite S01)',
    category: 'Weather / NWS Forecast vs Board',
    watch: /^KXHIGH/i,
    source: 'S01 · SFWeather (MasterSite) + this repository\'s NWS point-forecast archive (data/forecasts/, api.weather.gov, archived five times a day). The desk reads ONLY snapshots captured at or before the cut-off.',
    mandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
    thesis:
      'The desk version of ForecastEdge_MultiCity: for every open KXHIGH* bracket with a captured ladder, look up the newest NWS forecast high for that city and measurement date that was captured AT OR BEFORE the cut-off; if the forecast falls inside the bracket (F within [floor − 1, cap + 1]; lower tail F ≤ cap − 2) and the captured YES ask is ≤ 0.45, buy YES and hold to the exchange settlement. No snapshot at or before the cut-off → no trade for that bracket (the reason is published). The first merged version of this entry claimed to read the forecast but bought any cheap bracket; it was rewritten to actually read the archive (irregularity #53). Basis mismatch stated: KXHIGH* settle on The Weather Company city observations while the signal is the NWS point forecast (IRREGULARITIES.md #34).',
    rules: [
      'Universe: open KXHIGH* brackets with captured ladders AND an archived NWS forecast for the bracket\'s city captured at or before the cut-off.',
      'Trigger: the point-in-time NWS forecast high confirms the bracket (band: F ∈ [floor − 1, cap + 1]; lower tail: F ≤ cap − 2) and the captured YES ask ≤ 0.45.',
      'Entry: taker buy of YES, sized to 35% of cash, bounded by real depth within 2 ticks; at most 2 legs per cut-off.',
      'Exit: hold to real settlement.'
    ],
    sizing: '35% of cash per bracket, bounded by real ladder depth',
    decide(view) {
      const out = [];
      const bySeries = new Map();
      for (const loc of forecastLocations()) if (loc.series && (loc.snapshots || []).length) bySeries.set(loc.series, loc);
      if (!bySeries.size) return out; // archive dark → abstain
      const cutoffSeconds = Math.floor((view.asOfMs || Date.parse(view.asOf || '')) / 1000);
      if (!Number.isFinite(cutoffSeconds)) return out;
      const candidates = tradeableMarkets(view)
        .filter((m) => /^KXHIGH/i.test(String(m.seriesTicker || m.ticker || '')))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates) {
        const loc = bySeries.get(market.seriesTicker);
        if (!loc) continue;
        const eventDate = weatherEventDate(market.eventTicker || market.ticker);
        if (!eventDate) continue;
        const hit = forecastHighAt(loc.snapshots, eventDate, cutoffSeconds);
        if (!hit) continue; // nothing knowable at the cut-off for this date
        const f = Number(hit.highF);
        const floor = Number(market.floorStrike);
        const cap = Number(market.capStrike);
        let confirmed = false;
        let why = '';
        if (Number.isFinite(floor) && Number.isFinite(cap)) {
          confirmed = f >= floor - 1 && f <= cap + 1;
          why = `NWS high ${f}F inside bracket ${floor}-${cap}`;
        } else if (Number.isFinite(cap)) {
          confirmed = f <= cap - 2;
          why = `NWS high ${f}F at or below the ${cap} tail threshold`;
        }
        if (!confirmed) continue;
        const touch = touchOf(market);
        const ask = touch.yesAsk ?? market.ladder?.yesAsks?.[0]?.price ?? null;
        if (ask === null || ask > 0.45 || ask < 0.02) continue;
        const count = sizeToDepth(view, market, { side: 'yes', price: ask, cashFraction: 0.35, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `${why} (NWS snapshot ${hit.capturedAt} for ${eventDate}, captured before the cut-off) → captured YES ask ${ask} ≤ 0.45 (ladder ${market.ladderAt}), buy YES, hold to settlement`
        });
        if (out.length >= 2) break;
      }
      return out;
    }
  }
]);

export function deskStrategyById(idOrUsername) {
  return DESK_STRATEGIES.find((s) => s.id === idOrUsername || s.username === idOrUsername) || null;
}

/** Every roster entry, described honestly: where its trades are tracked. */
export function rosterCoverageEntries(strategies = []) {
  return strategies.map((s) => ({
    strategy: s.username || s.id,
    name: s.name || s.username || s.id,
    source: 'roster (replay engine)',
    deskTracked: false,
    note:
      'Tracks every fill in the replay Trade Ledger (real captured bars, real ladders, real results). ' +
      'It is not a desk entry because its decision function reads a bar-by-bar replay context, not a single point-in-time snapshot.'
  }));
}
