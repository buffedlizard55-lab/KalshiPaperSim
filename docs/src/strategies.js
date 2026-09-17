/**
 * KalshiPaperSim — Competition Strategy Roster (EXECUTABLE)
 * =====================================================================
 * MANDATE (from the project brief):
 *   "Usernames/strategies should not focus on risk management, but should aim
 *    for the highest returns. This is a paper trading simulator so we want the
 *    highest returns only."
 * Every strategy below therefore runs with `riskManagement: 'NONE (by mandate)'`
 * and aggressive position sizing.
 *
 * CRITICAL INTEGRITY CHANGE vs. the previous revision
 * ---------------------------------------------------
 * The previous revision hard-coded results such as "+842.6% | Rank 1", invented
 * trade journals, and invented 52-week equity curves, and attached them to
 * tickers that DO NOT EXIST on Kalshi (KXSP500 / KXNVDA / KXAAPL / KXNDX —
 * verified 404s recorded in src/verified-snapshot.js SERIES_NOT_FOUND).
 *
 * Those numbers were HALLUCINATED PERFORMANCE and have been REMOVED.
 * In this revision:
 *   - `decide(ctx)` is REAL, EXECUTABLE strategy logic.
 *   - Performance is COMPUTED by src/backtest-replay.js from fills against real
 *     captured Kalshi candlestick quotes.
 *   - Rankings are COMPUTED, not asserted.
 *   - Post-mortems are GENERATED from computed statistics by src/analysis.js.
 * What remains authored (and is labelled as such) is DESIGN INTENT ONLY:
 *   - username / avatar / title / thesis / rules  = how the strategy is designed
 *   These are design statements, not claims about market outcomes.
 */

import { round2, round6, clamp } from './simulation-engine.js';
import { snapToGrid } from './price-grid.js';
import { rawQuadraticFee } from './kalshi-fees.js';

/** Series that were VERIFIED to exist on Kalshi on 2026-09-17. */
export const VERIFIED_SERIES = Object.freeze({
  KXINXY: 'S&P 500 yearly range (Financials / Indices)',
  KXNASDAQ100Y: 'Nasdaq-100 yearly range (verified live markets captured)',
  KXTSLA: 'Tesla KPI — company quarterly KPI, settlement source Fiscal.ai',
  KXFA: 'Ford Annual KPI — company annual KPI, settlement source Fiscal.ai',
  KXABNBA: 'Airbnb Annual KPI',
  KXKLAR: 'Klarna KPI',
  KXRELYA: 'Remitly annual KPI',
  KXGRAB: 'Grab Holdings KPI',
  KXTOLA: 'Toll Brothers Annual KPI',
  KXCPIYOY: 'CPI inflation YoY (Bureau of Labor Statistics settlement)',
  KXFEDDECISION: 'Fed meeting rate decision (mutually exclusive buckets)',
  KXBTCY: 'BTC price range EOY (CF Benchmarks BRTI settlement)'
});

/** Series verified NOT to exist — do not re-introduce (see IRREGULARITIES.md #1). */
export const REJECTED_FABRICATED_TICKERS = Object.freeze(['KXSP500', 'KXNVDA', 'KXAAPL', 'KXNDX']);

/**
 * Size an aggressive position as a fraction of available cash, leaving room for
 * the official quadratic taker fee, and capped by visible book depth so the
 * fill model stays honest about liquidity.
 * @param {object} ctx
 * @param {number} pricePct        fraction of cash to deploy (mandate: ~1.0)
 * @param {number} [maxParticipation=3] multiple of visible ask depth allowed
 * @param {'YES'|'NO'} [side='YES']
 */
function aggressiveSize(ctx, pricePct, maxParticipation = 3, side = 'YES') {
  const { portfolio, book } = ctx;
  const cash = portfolio.cash;
  if (!(cash > 0)) return 0;
  const isYes = String(side).toUpperCase() === 'YES';
  const ask = isYes ? book.getBestYesAsk() : book.getBestNoAsk();
  const refPrice = ask !== null && ask > 0 ? ask : Math.max(book.tick, 0.01);
  // Reserve ~5% for the quadratic taker fee (peaks at 1.75c/contract at P=0.50)
  // plus slippage from walking the book.
  const budget = cash * pricePct;
  let count = Math.floor((budget / (refPrice * 1.05)) * 100) / 100;
  const visibleDepth = (isYes ? book.getYesAskTiers() : book.getNoAskTiers()).reduce((s, t) => s + t.count, 0);
  if (visibleDepth > 0) count = Math.min(count, round2(visibleDepth * maxParticipation));
  return Math.max(0, round2(count));
}

/** Rolling mean of a field over the last n candles. */
function rollingMean(history, accessor, n) {
  const slice = history.slice(Math.max(0, history.length - n));
  const vals = slice.map(accessor).filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Highest trade-price high over the last n candles (excluding the current one). */
function priorHigh(history, n) {
  const slice = history.slice(Math.max(0, history.length - 1 - n), Math.max(0, history.length - 1));
  const vals = slice.map((c) => c.trade.high).filter((v) => typeof v === 'number');
  return vals.length ? Math.max(...vals) : null;
}
function priorLow(history, n) {
  const slice = history.slice(Math.max(0, history.length - 1 - n), Math.max(0, history.length - 1));
  const vals = slice.map((c) => c.trade.low).filter((v) => typeof v === 'number');
  return vals.length ? Math.min(...vals) : null;
}

const BASE = {
  startingCapital: 100000,
  competitionMandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
  riskManagement: 'NONE (by mandate)',
  /** Universe filter: which verified series this strategy trades. */
  universe: null, // null == all markets in the replay universe
  resultProvenance: 'COMPUTED_AT_RUNTIME_BY_ReplayEngine — never hard-coded'
};

export const STRATEGIES = [
  {
    ...BASE,
    id: 'alpha_apex_momentum',
    username: 'AlphaApex_Momentum',
    handle: '@AlphaApex_Momentum',
    avatar: '🚀',
    title: 'Maximum Convexity Momentum Chaser',
    category: 'Convexity Momentum',
    tagline: 'Buys cheap YES contracts the moment price momentum turns positive, then compounds 100% of equity into the next setup.',
    sizingPct: 1.0,
    maxParticipation: 4,
    thesis:
      'DESIGN INTENT: binary contracts priced in the 1-25 cent band carry the largest convex payoff per dollar of premium ($0.10 -> $1.00 is a 10x). ' +
      'This strategy waits for the trade price to close above its own rolling mean, which is the cheapest available momentum confirmation, and then deploys ' +
      'essentially the entire account. Convexity plus full compounding is the mathematical maximum-return configuration for a paper account.',
    rules: {
      entry: 'Buy YES when candle close > rolling 3-period mean close AND close <= 0.35 (cheap convex band).',
      sizing: '100% of available cash, capped at 4x visible ask depth (excess fills are flagged as book-exhausted penalty fills).',
      exit: 'Hold to settlement. Take profit early only if the contract reaches >= 0.90 (liquidity is recycled into the next runner).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, portfolio, book } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const mean3 = rollingMean(history, (c) => c.trade.close, 3);
      const actions = [];

      // Recycle liquidity from near-certain winners.
      for (const pos of portfolio.positions.values()) {
        if (pos.side === 'YES' && pos.currentPrice >= 0.9 && pos.count > 0) {
          actions.push({ type: 'sell', ticker: pos.ticker, side: 'YES', count: pos.count, reason: 'take profit >= 0.90 to recycle capital' });
        }
      }
      if (mean3 !== null && close > mean3 && close <= 0.35) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
        if (count > 0) {
          actions.push({ type: 'buy', side: 'YES', count, reason: `close ${close} > 3-period mean ${round6(mean3)} in convex band` });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'gamma_whale_squeeze',
    username: 'GammaWhale_Squeeze',
    handle: '@GammaWhale_Squeeze',
    avatar: '🐋',
    title: 'High-Gamma Volume-Spike Breakout',
    category: 'Gamma / Volume Shock',
    tagline: 'Chases periods where traded volume explodes versus its own average — the signature of a repricing event.',
    sizingPct: 0.85,
    maxParticipation: 3,
    thesis:
      'DESIGN INTENT: on Kalshi a catalyst (a KPI release, a CPI print, an index move) shows up first as a volume spike and a widening intraday range. ' +
      'Buying the direction of that repricing while the contract is still cheap captures the gamma of the move rather than its tail.',
    rules: {
      entry: 'Buy YES when volume > 2x the 5-period mean volume AND the candle range (high-low) >= 2 ticks AND close < 0.50.',
      sizing: '85% of cash (leaves a margin buffer only because the fee model is quadratic and peaks at P=0.50).',
      exit: 'Sell the entire position into strength when close >= 0.75, otherwise hold to settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, portfolio } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const meanVol = rollingMean(history, (c) => c.volume, 5);
      const range = (candle.trade.high ?? close) - (candle.trade.low ?? close);
      const actions = [];

      for (const pos of portfolio.positions.values()) {
        if (pos.side === 'YES' && pos.currentPrice >= 0.75 && pos.count > 0) {
          actions.push({ type: 'sell', ticker: pos.ticker, side: 'YES', count: pos.count, reason: 'exit into strength >= 0.75' });
        }
      }
      if (meanVol && candle.volume > meanVol * 2 && range >= 2 * ctx.book.tick && close < 0.5) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
        if (count > 0) {
          actions.push({ type: 'buy', side: 'YES', count, reason: `volume ${round2(candle.volume)} > 2x mean ${round2(meanVol)}, range ${round6(range)}` });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'contrarian_king_100x',
    username: 'ContrarianKing_100x',
    handle: '@ContrarianKing_100x',
    avatar: '👑',
    title: 'Deep-OTM Longshot Convexity Hunter',
    category: 'Tail Convexity',
    tagline: 'Sweeps 1-10 cent contracts after a flush, accepting a low hit rate in exchange for 10x-100x payoffs.',
    sizingPct: 0.9,
    maxParticipation: 5,
    thesis:
      'DESIGN INTENT: expected value on a binary contract is (p_payoff x $1) - price. When the market flushes a contract to the 1-10 cent band, ' +
      'the payoff multiple rises faster than the probability typically falls, so a return-maximising mandate prefers to be long the flush. ' +
      'Hit rate is expected to be LOW; that is accepted by design because the payoff asymmetry dominates.',
    rules: {
      entry: 'Buy YES when close <= 0.10 AND close < previous candle close (still flushing) OR close is at the 5-period low.',
      sizing: '90% of cash, capped at 5x visible ask depth.',
      exit: 'Hold to settlement; never stop out (a stop on a 2 cent contract destroys the convexity thesis).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history } = ctx;
      const close = candle.trade.close;
      if (close === null || close > 0.1) return [];
      const prev = history.length > 1 ? history[history.length - 2].trade.close : null;
      const low5 = priorLow(history, 5);
      const flushing = prev !== null && close <= prev;
      const atLow = low5 !== null && Math.abs(close - low5) < 1e-9;
      if (!flushing && !atLow) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `deep-OTM longshot at ${close} (flushing=${flushing}, atLow5=${atLow})` }];
    }
  },

  {
    ...BASE,
    id: 'yield_vulture_arb',
    username: 'YieldVulture_Arb',
    handle: '@YieldVulture_Arb',
    avatar: '🦅',
    title: 'Late-Stage High-Probability Sweep',
    category: 'Expiry Harvest',
    tagline: 'Buys 85-97 cent contracts in the final periods and collects the last cents into settlement.',
    sizingPct: 0.95,
    maxParticipation: 2,
    thesis:
      'DESIGN INTENT: a contract trading at 0.93 that settles YES returns 7.5% on premium in the remaining time, and the fee formula ' +
      'M x 0.07 x P x (1-P) is at its SMALLEST near the extremes (0.93 -> 0.65 cents per 100 contracts vs 1.75 cents at 0.50). ' +
      'Late-stage favourites therefore carry the best fee-adjusted carry per unit of time on the exchange.',
    rules: {
      entry: 'In the final 40% of the series, buy YES when 0.85 <= close <= 0.97.',
      sizing: '95% of cash, capped at 2x visible depth (high-probability books are usually thinner on the offer).',
      exit: 'Hold to settlement and collect notional_value_dollars ($1.00 verified).',
      riskManagement: 'NONE (by mandate) — accepts full loss of premium if the favourite fails.'
    },
    decide(ctx) {
      const { candle, periodIndex, periodCount } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const progress = periodCount > 1 ? periodIndex / (periodCount - 1) : 1;
      if (progress < 0.6) return [];
      if (close < 0.85 || close > 0.97) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `late-stage favourite at ${close} (series progress ${Math.round(progress * 100)}%)` }];
    }
  },

  {
    ...BASE,
    id: 'fed_pivot_sniper',
    username: 'FedPivotSniper',
    handle: '@FedPivotSniper',
    avatar: '🏛️',
    title: 'Macro Print Mean-Reversion Sniper',
    category: 'Macro / Event',
    tagline: 'Fades overshoots in macro (Fed / CPI) contracts, where mutually exclusive buckets overreact to a single print.',
    sizingPct: 0.8,
    maxParticipation: 3,
    universe: ['KXFEDDECISION', 'KXCPIYOY', 'KXINXY', 'KXNASDAQ100Y'],
    thesis:
      'DESIGN INTENT: Kalshi documents that Fed-decision buckets are MUTUALLY EXCLUSIVE ("Only one bucket, at maximum, can resolve to Yes" — captured verbatim ' +
      'in rules_secondary for KXFEDDECISION-28JAN-H25). When one bucket overshoots on a single data print, the complementary buckets are structurally ' +
      'underpriced, so fading the overshoot is a return-maximising macro expression.',
    rules: {
      entry: 'Buy YES when close is >= 25% below its own 5-period mean (an overshoot flush) in a macro series.',
      sizing: '80% of cash.',
      exit: 'Sell when price recovers to within 5% of the 5-period mean; otherwise hold to settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { market, candle, history, portfolio } = ctx;
      const series = market.series_ticker || '';
      if (this.universe && !this.universe.includes(series)) return [];
      const close = candle.trade.close;
      if (close === null) return [];
      const mean5 = rollingMean(history, (c) => c.trade.close, 5);
      if (mean5 === null || mean5 <= 0) return [];
      const actions = [];

      for (const pos of portfolio.positions.values()) {
        if (pos.ticker === market.ticker && pos.side === 'YES' && pos.currentPrice >= mean5 * 0.95) {
          actions.push({ type: 'sell', ticker: pos.ticker, side: 'YES', count: pos.count, reason: `mean reversion complete (${pos.currentPrice} vs mean ${round6(mean5)})` });
        }
      }
      if (close <= mean5 * 0.75) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
        if (count > 0) actions.push({ type: 'buy', side: 'YES', count, reason: `macro overshoot: ${close} <= 0.75 x 5-period mean ${round6(mean5)}` });
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'volatility_arb_mm',
    username: 'VolatilityArb_MM',
    handle: '@VolatilityArb_MM',
    avatar: '⚖️',
    title: 'Two-Sided Spread Harvester (Market Maker)',
    category: 'Market Making',
    tagline: 'Rests bids and asks around the touch and earns the spread with the reduced maker fee coefficient (0.0175).',
    sizingPct: 0.25,
    quoteTicks: 1,
    maxParticipation: 1,
    thesis:
      'DESIGN INTENT: Kalshi charges makers on a DIFFERENT, lower coefficient — maker fee = round up(M x 0.0175 x C x P x (1-P)) versus the taker ' +
      '0.07 (official fee schedule PDF, effective 2026-07-07), and "there are no fees associated with canceling a resting order". ' +
      'Quoting two-sided therefore earns the spread at roughly one quarter of the taker fee load, which is the highest-Sharpe way to compound on the exchange.',
    rules: {
      entry: 'Every period, cancel stale quotes then rest a bid and an ask 1 tick either side of the mid.',
      sizing: '25% of available cash per side, sized off the quoted price (inventory accumulates naturally from adverse selection).',
      exit: 'Resting orders are matched by the engine when the period traded range reaches through them; inventory is held to settlement.',
      riskManagement: 'NONE (by mandate) — no inventory cap, no hedging, no quote pull on volatility.'
    },
    decide(ctx) {
      const { book, portfolio } = ctx;
      const mid = book.getMid();
      if (mid === null || !(mid > 0)) return [];
      const cash = portfolio.cash;
      if (cash <= 0) return [];

      const bidPx = snapToGrid(mid - this.quoteTicks * book.tick, book.grid, 'down');
      const askPx = snapToGrid(mid + this.quoteTicks * book.tick, book.grid, 'up');
      if (!(bidPx >= book.tick) || !(askPx <= book.notional - book.tick)) return [];

      // Size off the real quoted prices, at 0.01-contract granularity (verified
      // minimum), leaving headroom so both sides can fund simultaneously.
      const budgetPerSide = cash * this.sizingPct;
      const qty = round2(Math.min(
        Math.floor((budgetPerSide / bidPx) * 100) / 100,
        Math.floor((budgetPerSide / Math.max(book.tick, book.notional - askPx)) * 100) / 100
      ));
      if (!(qty > 0)) return [];

      return [
        { type: 'quote', side: 'YES', count: qty, cancelExisting: true, spreadTicks: this.quoteTicks, reason: `two-sided quote ${bidPx} / ${askPx} around mid ${round6(mid)}` }
      ];
    }
  },

  {
    ...BASE,
    id: 'trend_ride_full_tilt',
    username: 'TrendRide_FullTilt',
    handle: '@TrendRide_FullTilt',
    avatar: '📈',
    title: 'Trend-Following Pyramider',
    category: 'Trend / Pyramiding',
    tagline: 'Adds to a winning position every period the uptrend persists, so winners grow geometrically.',
    sizingPct: 0.5,
    maxParticipation: 3,
    thesis:
      'DESIGN INTENT: pyramiding into strength is the only sizing scheme that makes a paper account grow geometrically rather than arithmetically. ' +
      'Each add is sized at 50% of remaining cash, so a trend that persists for k periods multiplies exposure by roughly 1.5^k. ' +
      'The mandate explicitly forbids the drawdown control that would normally cap this.',
    rules: {
      entry: 'Buy YES when close > previous close for two consecutive periods (confirmed uptrend).',
      sizing: 'Add 50% of remaining cash each confirmation, capped at 3x visible depth per add.',
      exit: 'Hold to settlement; pyramided positions are never trimmed.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history } = ctx;
      const close = candle.trade.close;
      if (close === null || history.length < 3) return [];
      const p1 = history[history.length - 2].trade.close;
      const p2 = history[history.length - 3].trade.close;
      if (p1 === null || p2 === null) return [];
      if (!(close > p1 && p1 > p2)) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `pyramid: ${p2} -> ${p1} -> ${close}` }];
    }
  },

  {
    ...BASE,
    id: 'event_catalyst_max',
    username: 'EventCatalyst_Max',
    handle: '@EventCatalyst_Max',
    avatar: '⚡',
    title: 'Range-Breakout Catalyst Frontrunner',
    category: 'Breakout / Catalyst',
    tagline: 'Buys the break of the prior 5-period high, going full tilt on the first candle that clears it.',
    sizingPct: 1.0,
    maxParticipation: 4,
    thesis:
      'DESIGN INTENT: Kalshi company-KPI contracts carry an explicit early-close mechanic — captured verbatim as ' +
      '"This market will close and expire early if the event occurs." (early_close_condition on KXTSLA-26OCTPROD-500000). ' +
      'A breakout toward the strike can therefore realise the full $1.00 payoff BEFORE expiry, so buying the first clear of the prior range high ' +
      'front-runs both the repricing and the early settlement.',
    rules: {
      entry: 'Buy YES when candle high > the highest high of the prior 5 periods.',
      sizing: '100% of cash, capped at 4x visible ask depth.',
      exit: 'Hold to settlement or early close.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history } = ctx;
      const high = candle.trade.high;
      if (high === null || history.length < 6) return [];
      const prior = priorHigh(history, 5);
      if (prior === null || high <= prior) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation);
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `range breakout: high ${high} > prior 5-period high ${prior}` }];
    }
  },

  /* ────────────────────────────────────────────────────────────────────
   * The two strategies below trade the NO side. They exist because the REAL
   * captured replay universe is made of deep out-of-the-money contracts, and
   * Kalshi's official fee formula makes the cheap side structurally expensive
   * to own. Derivation (algebra on the published formula, not an assumption):
   *
   *   taker fee per contract = round_up(M × 0.07 × C × P × (1−P))
   *   → buying YES at price P costs  fee/premium = 0.07 × (1−P)
   *   → buying NO  at price 1−P costs fee/premium = 0.07 × P
   *
   * At the YES prices actually observed in the extended capture (0.06–0.28),
   * buying YES costs 5.0%–6.6% of the capital deployed in fees alone, while
   * buying the same contract's NO side costs 0.4%–2.0%. Fee schedule source:
   * https://kalshi.com/docs/kalshi-fee-schedule.pdf
   * Observed price range source: src/verified-candles.js (61 real daily bars,
   * KXNASDAQ100Y-26DEC31H1600-T33000, 2026-07-19 → 2026-09-17).
   * ──────────────────────────────────────────────────────────────────── */
  {
    ...BASE,
    id: 'theta_harvest_short_otm',
    username: 'ThetaHarvest_ShortOTM',
    handle: '@ThetaHarvest_ShortOTM',
    avatar: '⏳',
    title: 'Deep-OTM Decay Harvester (buys NO)',
    category: 'Theta / Short Convexity',
    tagline: 'Buys NO on longshots the market already prices under 25c and pyramids while they keep decaying.',
    sizingPct: 1.0,
    maxParticipation: 4,
    thesis:
      'DESIGN INTENT: the verified replay universe is composed of deep out-of-the-money contracts. A longshot priced at 12c must either ' +
      'collapse toward 0 or rally ~8x. Buying NO collects the collapse while paying the smallest possible share of the quadratic taker fee ' +
      '(0.07 × P, where P is the longshot price). There are no stops and no profit targets — the mandate is maximum return, so the position is ' +
      'held to settlement and added to whenever decay accelerates.',
    rules: {
      entry: 'Buy NO when YES close <= 0.25 AND YES close <= its 5-period mean (decay confirmed).',
      sizing: '100% of cash, capped at 4x visible NO ask depth.',
      pyramid: 'Add another full-size NO position when YES close <= 0.85 x its 5-period mean.',
      exit: 'None. Held to settlement (no stop-loss, by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null || close > 0.25) return [];
      const mean5 = rollingMean(history, (c) => c.trade.close, 5);
      if (mean5 === null) return [];
      const decaying = close <= mean5;
      if (!decaying) return [];
      const noAsk = book.getBestNoAsk();
      if (noAsk === null) return [];

      const heldNo = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.side === 'NO' && p.count > 0);
      const isPyramid = close <= mean5 * 0.85;
      if (heldNo && !isPyramid) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'NO');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'NO',
          count,
          reason: `${heldNo ? 'pyramid' : 'harvest'} decay: YES ${close} <= 5-period mean ${round6(mean5)} → buy NO at ${noAsk}`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'fee_aware_premium_buyer',
    username: 'FeeArb_PremiumBuyer',
    handle: '@FeeArb_PremiumBuyer',
    avatar: '🧮',
    title: 'Fee-Optimal Favourite Buyer',
    category: 'Fee Structure / Favourite',
    tagline: 'Computes both sides of Kalshi’s quadratic fee and always owns the side that costs the least per dollar deployed.',
    sizingPct: 1.0,
    maxParticipation: 4,
    thesis:
      'DESIGN INTENT: Kalshi’s taker fee is symmetric in price — M × 0.07 × C × P × (1−P) — so a YES at 0.12 and its NO at 0.88 incur the SAME ' +
      'absolute fee, but that fee is 6.2% of the YES buyer’s capital and only 0.8% of the NO buyer’s. This strategy evaluates the fee ratio for ' +
      'both sides with the official formula at runtime and buys whichever side is cheaper to own, provided one side is a clear favourite ' +
      '(>= 0.60). It is a direct, arithmetic exploitation of the published fee schedule.',
    rules: {
      entry: 'Buy the side whose fee/premium ratio (0.07 × opposite price) is lower, only when that side prices >= 0.60.',
      sizing: '100% of cash, capped at 4x visible ask depth on the chosen side.',
      exit: 'None. Held to settlement (no stop-loss, by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book } = ctx;
      const close = candle.trade.close;
      if (close === null || close <= 0 || close >= 1) return [];

      const pYes = clamp(close, 0.01, 0.99);
      const pNo = clamp(round6(1 - close), 0.01, 0.99);
      // Raw (pre-rounding) fee so the decision is not distorted by the
      // round-up-to-the-nearest-cent rule at 1-contract granularity.
      const feeYes = rawQuadraticFee({ count: 1, price: pYes, multiplier: 1 });
      const feeNo = rawQuadraticFee({ count: 1, price: pNo, multiplier: 1 });
      const ratioYes = feeYes / pYes; // = 0.07 × (1 − P)
      const ratioNo = feeNo / pNo; //   = 0.07 × P

      const side = ratioNo < ratioYes ? 'NO' : 'YES';
      const favPrice = side === 'YES' ? pYes : pNo;
      if (favPrice < 0.60) return [];

      const ask = side === 'YES' ? book.getBestYesAsk() : book.getBestNoAsk();
      if (ask === null) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side,
          count,
          reason:
            `fee-optimal side ${side}: fee/premium ${round6(side === 'NO' ? ratioNo : ratioYes)} vs ` +
            `${round6(side === 'NO' ? ratioYes : ratioNo)} on the other side — buy at ${ask}`
        }
      ];
    }
  }
];

/** Legacy export name kept for compatibility with server.js and older tests. */
export const STRATEGIES_DATA = STRATEGIES;

/** Look up a strategy by id or username (case-insensitive). */
export function getStrategy(idOrUsername) {
  const q = String(idOrUsername || '').toLowerCase();
  return STRATEGIES.find((s) => s.id === q || s.username.toLowerCase() === q || s.handle.toLowerCase() === q) || null;
}

/** Sanity checks that run at import time in tests. */
export function validateStrategies() {
  const problems = [];
  const usernames = new Set();
  for (const s of STRATEGIES) {
    if (!s.username) problems.push(`${s.id}: missing username`);
    if (usernames.has(s.username)) problems.push(`duplicate username ${s.username}`);
    usernames.add(s.username);
    if (typeof s.decide !== 'function') problems.push(`${s.id}: decide() is not executable`);
    if (s.riskManagement !== 'NONE (by mandate)') problems.push(`${s.id}: risk management must be NONE per mandate`);
    if (/^\+?\d+(\.\d+)?%$/.test(String(s.returnPct ?? ''))) problems.push(`${s.id}: hard-coded returnPct detected (must be computed)`);
    if (s.currentEquity !== undefined) problems.push(`${s.id}: hard-coded currentEquity detected (must be computed)`);
  }
  return { count: STRATEGIES.length, problems };
}
