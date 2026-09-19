/**
 * KalshiPaperSim — Season entrants (the carried-book roster)
 * =====================================================================
 * These designs are NOT the Live Desk roster. A Live Desk entry trades one
 * cut-off and closes; a SEASON entry is judged on a book that CARRIES across
 * every real capture instant the store holds (src/desk-season.js). That
 * difference is the whole point of these entries:
 *
 *   • They can hold a position across rounds and be marked round by round.
 *   • They can leave a resting order alive for a later round to cross.
 *   • They can collect a contract's real settlement mid-season instead of
 *     being flattened at the end of a session.
 *   • They can see their own carried positions in `view.positions` and act on
 *     them (add, hold, or leave them alone).
 *
 * HONESTY RULES (identical to src/desk-strategies.js)
 *   • `decide(view)` receives a point-in-time view: quotes, ladders, bars and
 *     positions as of the round's cut-off. It never sees a later capture.
 *   • A design never asserts a result. Results come from the engine: real
 *     captured ladders, the official fee schedule, real candlestick quotes
 *     crossing resting orders, and the exchange's own settlements.
 *   • A design that cannot act says so by returning no intents; the season
 *     reports which rounds were idle and why (coverage), instead of hiding it.
 *   • MANDATE: maximum return only. No stop-loss, no position cap, no
 *     volatility target. The season reports the real drawdown that costs.
 *
 * SOURCES: each entry names the MasterSite project (S-id in
 * src/signal-sources.js) or the exchange doctrine it adapts, and the claim it
 * does NOT make (the external feed is never used unless it is archived
 * point-in-time in this repository — today only the NWS forecast archive is).
 */

import { DESK_LIMITS } from './live-desk.js';
import { tradeableMarkets, touchOf, favouriteOf, depthWithin, sizeToDepth } from './desk-strategies.js';

const DAY_MS = 24 * 3600 * 1000;
const MANDATE = 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.';

/** Positions this strategy already holds, carried in from earlier rounds. */
function heldTickers(view) {
  return new Set([...(view.positions ? view.positions.keys() : [])].map((k) => String(k).split('|')[0]));
}
function heldContracts(view, ticker, side = null) {
  let total = 0;
  for (const [key, pos] of view.positions ? view.positions.entries() : []) {
    const [t, s] = String(key).split('|');
    if (t !== ticker) continue;
    if (side && s !== side) continue;
    total += pos.contracts || 0;
  }
  return total;
}

/** The contract whose own close_time is nearest, among tradeable markets. */
function byNearestClose(markets) {
  return markets
    .filter((m) => Number.isFinite(m.closeMs))
    .slice()
    .sort((a, b) => a.closeMs - b.closeMs || String(a.ticker).localeCompare(String(b.ticker)));
}

export const SEASON_STRATEGIES = Object.freeze([
  {
    id: 'season_weather_settle_carry',
    username: 'SeasonWeather_Carry',
    name: 'Season: Weather bracket, held through its own settlement',
    category: 'Daily-settlement carry',
    source: 'S01 (SFWeather — point-in-time NWS discipline) → KXHIGH* daily high-temperature brackets',
    mandate: MANDATE,
    thesis:
      'The daily high-temperature brackets are the only contracts in this store that settle INSIDE a season: a position opened at one capture instant is finalized by the exchange a few hours later. A carried book can therefore hold a real favourite through a real terminal event and collect $1.00 instead of marking to a quote. The weather PROJECT supplies the discipline this repository already copies (a point-in-time NWS archive); the trade itself is priced only from the exchange.',
    rules: [
      'Universe: open KXHIGH* contracts with a real captured ladder at this round.',
      'Trigger: nearest-to-close bracket whose favourite side is offered at 0.70–0.97 on the captured ladder.',
      'Entry: taker buy of the favourite, 30% of cash, capped by real depth within 2 ticks.',
      'Carry: the position is held across every later round (marked at each capture instant) until the exchange settles it.',
      'Skip: any contract this strategy already holds — the carry IS the position.'
    ],
    sizing: '30% of cash per entry, up to two brackets, bounded by the captured ladder',
    doesNotUse: 'No NWS forecast value enters this rule. The project’s forecast archive is used by the roster’s ForecastEdge_* entries, not here.',
    decide(view) {
      const out = [];
      const held = heldTickers(view);
      const candidates = byNearestClose(
        tradeableMarkets(view).filter((m) => /^KXHIGH/.test(String(m.seriesTicker || '')))
      );
      for (const market of candidates.slice(0, 2)) {
        if (held.has(market.ticker)) continue;
        const fav = favouriteOf(market);
        if (!fav || fav.price === null) continue;
        if (fav.price < 0.70 || fav.price > 0.97) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.30, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        out.push({
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `weather bracket closes ${market.closeTime}; favourite ${fav.side.toUpperCase()} at ${fav.price} on the captured ladder — carried to its own settlement`
        });
      }
      return out;
    }
  },
  {
    id: 'season_index_carry',
    username: 'SeasonIndex_CarryHold',
    name: 'Season: index strike carried across capture instants',
    category: 'Multi-round directional carry',
    source: 'S03 (TradingViewTheLeap) → KXINXY / KXNASDAQ100Y strikes on the same underlying indexes',
    mandate: MANDATE,
    thesis:
      'The Leap project is a futures paper-trading competition on the SAME underlying indexes this repo trades (S&P 500, Nasdaq-100). Its own research layer reports that no tested strategy produced a positive daily compounding rate — so the honest adaptation is not to copy its signals but to test the one thing a session-scoped desk cannot: whether a directional index strike is better HELD across capture instants than bought and flattened at one cut-off. The entry buys the favourite side once and carries it, marking to every later captured quote.',
    rules: [
      'Universe: KXINXY / KXNASDAQ100Y / KXBTCY — open, with a captured ladder.',
      'Trigger: first round only (and only while the book holds no index position), favourite offered 0.55–0.90.',
      'Entry: taker buy of the favourite, 25% of cash, capped by real depth within 2 ticks.',
      'Carry: held to the season’s last mark. These contracts close in 2027, so no settlement lands inside this season — the result is a MARK, and the ledger says so.'
    ],
    sizing: '25% of cash, single leg, bounded by the captured ladder',
    doesNotUse: 'No futures price, no The Leap signal, no leverage — only the exchange’s own captured prices for its own index strikes.',
    decide(view) {
      if (!view.season?.firstRound) return [];
      const held = heldTickers(view);
      const candidates = tradeableMarkets(view)
        .filter((m) => ['KXINXY', 'KXNASDAQ100Y', 'KXBTCY'].includes(String(m.seriesTicker || '')))
        .filter((m) => !held.has(m.ticker))
        .sort((a, b) => (b.volume || 0) - (a.volume || 0));
      for (const market of candidates.slice(0, 2)) {
        const fav = favouriteOf(market);
        if (!fav || fav.price === null || fav.price < 0.55 || fav.price > 0.9) continue;
        const count = sizeToDepth(view, market, { side: fav.side, price: fav.price, cashFraction: 0.25, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        return [{
          ticker: market.ticker,
          side: fav.side,
          action: 'buy',
          type: 'market',
          count,
          reason: `index favourite ${fav.side.toUpperCase()} at ${fav.price} (ladder ${market.ladderAt}) — carried across every later capture instant`
        }];
      }
      return [];
    }
  },
  {
    id: 'season_maker_carry',
    username: 'SeasonMaker_RestCarry',
    name: 'Season: resting bid that a later round has to cross',
    category: 'Liquidity provision / carry',
    source: 'exchange microstructure (docs.kalshi.com orderbook + fee schedule) — maker fee is a quarter of taker, and zero on plain-quadratic series',
    mandate: MANDATE,
    thesis:
      'A resting order is the only desk behaviour that strictly needs a CARRIED book: it is placed in one round and can only fill in a LATER one, when a real quote trades through its price. This entry re-posts one tick inside the touch on the deepest-ladder open contract every round it is not already resting, and lets the forward walk cross it with real traded size. If nothing crosses, the season reports the cancelled orders — that is the honest cost of providing liquidity.',
    rules: [
      'Pick the open contract with the largest real captured ladder depth within 2 ticks of the touch.',
      'Entry: post-only buy one tick above the real best bid, 25% of cash, sized to the size resting at that price.',
      'Carry: the order stays alive across rounds; a later captured candlestick or ladder that trades through it fills up to the real size that crossed.',
      'Skip: contracts where this strategy already has an order resting or a position open.'
    ],
    sizing: '25% of cash, single leg per round, bounded by the captured ladder',
    doesNotUse: 'No queue-position estimate: a maker fill needs a later real quote through the price (see the desk audit, D8).',
    decide(view) {
      const held = heldTickers(view);
      const candidates = tradeableMarkets(view)
        .filter((m) => !held.has(m.ticker))
        .filter((m) => m.book?.resting?.some?.((o) => o.status === 'resting') !== true)
        .map((m) => ({
          market: m,
          bid: touchOf(m).yesBid,
          ask: touchOf(m).yesAsk,
          depth: depthWithin(m, 2, { action: 'buy', side: 'yes' })
        }))
        .filter((c) => c.bid !== null && c.bid !== undefined && c.ask !== null && c.ask !== undefined && c.depth > 0)
        .sort((a, b) => b.depth - a.depth || String(a.market.ticker).localeCompare(String(b.market.ticker)));
      if (!candidates.length) return [];
      const { market, bid, ask } = candidates[0];
      const price = Number((bid + market.tick).toFixed(6));
      if (!(price < ask)) return [];
      const count = sizeToDepth(view, market, { side: 'yes', price, cashFraction: 0.25, ticks: 1 });
      if (count < DESK_LIMITS.minContracts) return [];
      return [{
        ticker: market.ticker,
        side: 'yes',
        action: 'buy',
        type: 'limit',
        limitPrice: price,
        postOnly: true,
        count,
        reason: `post-only ${price} (one tick above the real bid ${bid}) — a resting order that only a LATER real quote can cross`
      }];
    }
  },
  {
    id: 'season_board_sum',
    username: 'SeasonBoardSum_Ladder',
    name: 'Season: mutually-exclusive board sum, bought cheap and settled',
    category: 'No-arbitrage board (MEE)',
    source: 'S13 (PriceKalshiHistorical R14 `mee`) → KXBTCY / KXINXY / KXHIGH* mutually exclusive boards',
    mandate: MANDATE,
    thesis:
      'When a board of contracts is mutually exclusive and exhaustive, the sum of their fair prices is 1.00. This entry computes the real captured ask stack of every leg it can price in the largest board it finds and buys the cheapest legs only while the cumulative cost stays below 1.00 minus the fees it will actually pay — the one construction here whose edge is arithmetic rather than directional. Legs are carried to settlement; a leg that settles pays 1.00 or 0.00 by the exchange’s own result.',
    rules: [
      'Group open tradeable contracts by event ticker; take the largest group with at least three priceable legs.',
      'Sort legs by real ask (cheapest first) and accumulate while (cost so far + this leg) < 1.00 − official fees.',
      'Entry: taker buy the kept legs, 15% of cash each, capped by real depth within 2 ticks.',
      'Carry: legs are held to settlement; already-held legs are never re-bought.'
    ],
    sizing: '15% of cash per leg, up to four legs, bounded by the captured ladder',
    doesNotUse: 'No fair-value model: the comparison is between captured asks and the 1.00 payoff, minus the exchange’s own fee formula.',
    decide(view) {
      const held = heldTickers(view);
      const groups = new Map();
      for (const market of tradeableMarkets(view)) {
        const event = String(market.eventTicker || String(market.ticker).split('-').slice(0, 2).join('-'));
        if (!groups.has(event)) groups.set(event, []);
        groups.get(event).push(market);
      }
      const boards = [...groups.values()].filter((g) => g.length >= 3).sort((a, b) => b.length - a.length || String(a[0].ticker).localeCompare(String(b[0].ticker)));
      if (!boards.length) return [];
      const out = [];
      let budget = 1;
      for (const market of boards[0]) {
        if (held.has(market.ticker)) continue;
        const ask = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
        if (ask === null || ask === undefined || !(ask > 0)) continue;
        if (ask >= budget) continue;
        const count = sizeToDepth(view, market, { side: 'yes', price: ask, cashFraction: 0.15, ticks: 2 });
        if (count < DESK_LIMITS.minContracts) continue;
        budget = budget - ask;
        out.push({
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `board ${boards[0][0].eventTicker || ''} leg at ${ask}: remaining budget ${budget.toFixed(4)} of the 1.00 payoff after this leg`
        });
        if (out.length >= 4) break;
      }
      return out;
    }
  },
  {
    id: 'season_expiry_last_round',
    username: 'SeasonExpiry_LastRound',
    name: 'Season: nearest-expiry favourite, entered in the final round',
    category: 'Round selection',
    source: 'desk doctrine — expiry harvest, restricted to the last capture instant the store holds',
    mandate: MANDATE,
    thesis:
      'A controlled experiment about WHERE in a season a trade happens: this entry refuses every round except the last, then buys the nearest-expiry favourite it can price. If the carried book’s advantage came from holding through events, this entry should earn less than the carried entries with the same edge — and if it earns more, the carried risk was not worth it. Either answer is measured from real fills.',
    rules: [
      'Act only in the season’s final round.',
      'Trigger: nearest-close tradeable contract whose YES ask is 0.80–0.98.',
      'Entry: taker buy YES, 30% of cash, capped by real depth within 1 tick.',
      'Carry: held to the season’s closing mark or settlement, whichever comes first.'
    ],
    sizing: '30% of cash, single leg',
    doesNotUse: 'Nothing from a later capture: after the final round only real events can move it.',
    decide(view) {
      if (!view.season?.lastRound) return [];
      const held = heldTickers(view);
      const candidates = byNearestClose(tradeableMarkets(view).filter((m) => !held.has(m.ticker)));
      for (const market of candidates) {
        const ask = market.ladder?.yesAsks?.[0]?.price ?? touchOf(market).yesAsk;
        if (ask === null || ask === undefined || ask < 0.8 || ask > 0.98) continue;
        const count = sizeToDepth(view, market, { side: 'yes', price: ask, cashFraction: 0.30, ticks: 1 });
        if (count < DESK_LIMITS.minContracts) continue;
        return [{
          ticker: market.ticker,
          side: 'yes',
          action: 'buy',
          type: 'market',
          count,
          reason: `final round, closes ${market.closeTime}, YES offered at ${ask} — the last real ladder the store holds`
        }];
      }
      return [];
    }
  },
  {
    id: 'season_control_notrade',
    username: 'SeasonControl_NoTrade',
    name: 'Season control: deliberately places no order',
    category: 'Control / benchmark',
    source: 'derived control — exists so the season’s other numbers are not free',
    mandate: 'CONTROL ENTRY. It is deliberately idle: it is the benchmark that shows what the same capital did when nothing was traded.',
    thesis:
      'Every competition needs a zero. If a season’s entrants all lose, a 0.00% control is the winner, and if they all win, the control is the number they had to beat. It places no order in any round, by construction — and the season reports it as unranked rather than as a "strategy with a 0% return", because it never traded.',
    rules: ['Never place an order, in any round, for any reason.'],
    sizing: 'none',
    doesNotUse: 'Everything: this entry deliberately uses no price, no ladder and no signal.',
    decide() {
      return [];
    }
  }
]);

/** Look up one season entrant by id or username. */
export function seasonStrategyById(id) {
  const key = String(id);
  return SEASON_STRATEGIES.find((s) => s.id === key || s.username === key) || null;
}

/** The usernames a season entrant owns — reserved so a human cannot take them. */
export const SEASON_USERNAMES = Object.freeze(SEASON_STRATEGIES.map((s) => s.username));
