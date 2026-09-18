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
  KXBTCY: 'BTC price range EOY (CF Benchmarks BRTI settlement)',
  /* Verified 2026-09-18 when the ingest job captured them from the live API:
     KXHIGHNY is the series Kalshi's own quick-start documents; the captures
     (data/history/intraday/60m/KXHIGHNY-*.json) hold the real market objects
     with rules, strikes and — for 39 of 40 — the exchange's final result. */
  KXHIGHNY: 'NYC daily high-temperature brackets (Central Park; the series documented by the official API quick-start: https://docs.kalshi.com/getting_started/quick_start_market_data)',
  KXGOLD15M: 'Gold 15-minute up/down markets (target-price settlement; captured from the live API 2026-09-18, data/history/intraday/1m/)'
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
  resultProvenance: 'COMPUTED_AT_RUNTIME_BY_ReplayEngine — never hard-coded',
  /**
   * WHEN THE DESIGN EXISTED. This is what makes a forward test mean anything:
   * bars before this date are IN-SAMPLE (the design could have been informed by
   * them), bars after it are FORWARD (they did not exist when the design was
   * written). src/forward-test.js splits on the LATEST designedAt in the roster.
   *
   * For a recreated public strategy the date is the day its source was captured
   * and read (recorded in src/research-sources.js as a numbered RESEARCH_SOURCES
   * entry with its URL), not the day the article was published — the conservative
   * choice.
   */
  designedAt: '2026-09-17',
  designSource: 'Original design in this repository (no external strategy source)',
  designSourceUrl: null,
  /**
   * WHICH FLIGHT THIS ENTRY RUNS IN.
   *   'daily'  — the 1440-minute competition window (the long-history flight)
   *   'hourly' — the 60-minute store (a shorter, finer window)
   *   'both'   — eligible for either
   * A strategy that needs intraday bars cannot be judged on daily bars, and a
   * ladder that rests for weeks does not need hourly ones; keeping them in
   * separate flights stops the two from being ranked against each other.
   */
  flight: 'daily',
  preferredPeriodMinutes: 1440
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
    flight: 'both',
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
  },

  {
    ...BASE,
    id: 'longshot_fader_flb',
    username: 'LongshotFader_FLB',
    handle: '@LongshotFader_FLB',
    avatar: '🎯',
    title: 'Favorite–Longshot Bias Fader',
    category: 'Behavioral / Bias Harvest',
    tagline: 'Systematically fades the 5c–15c longshot band and buys heavy favorites at 85c+ — the two bands the bias literature says are mispriced in opposite directions.',
    sizingPct: 1.0,
    maxParticipation: 4,
    designedAt: '2026-09-17',
    designSource: 'Recreated from published favorite-longshot-bias (FLB) material (third-party sources — see RESEARCH_SOURCES in src/research-sources.js)',
    designSourceUrl: 'https://laikalabs.ai/prediction-markets/kalshi-prediction-market-trading-strategies',
    sourceNote:
      'Recreated from published favorite-longshot-bias (FLB) material: laikalabs.ai ("Filter Kalshi markets for contracts priced between 5c and 15c ... place limit sell orders on overpriced Yes contracts"; "Buy Heavy Favorites ... 85c to 95c"), ' +
      'the Polymarket FLB study (longshots lose 6.3c per dollar when contracts are weighted equally but GAIN 4.1c when grouped by parent event — the sign is aggregation-dependent) and the Grokipedia FLB overview ' +
      '("high-price contracts resolve favorably more frequently than their trading prices imply"). Links are listed in the Verification tab and in README "Strategy sources".',
    thesis:
      'DESIGN INTENT: the FLB literature claims low-price contracts win less often than their price implies and high-price contracts win more often. ' +
      'This entry operationalises exactly that: short the 5c–15c band by buying NO, and buy YES outright in the 85c+ band. ' +
      'HONEST CAVEAT, stated up front: the Polymarket study found the sign of the effect depends on how contracts are aggregated, so this is a hypothesis under test, not a proven edge — ' +
      'and the favourite leg needs a close of 0.85 or higher: across all 30 stored markets (5,762 numeric closes, $0.01–$0.45) NO close reaches even 0.50, so that leg cannot fire here. A first draft of this note said the universe "contains NO contract above 28c"; that was WRONG and is corrected in place — 47 closes sit above 28c, all of them in two Nasdaq-100 strikes (KXNASDAQ100Y-26DEC31H1600-T33000, 45 bars up to $0.45; T19000, 2 bars up to $0.40). The rule is unaffected, the published reason for it was not.',
    rules: {
      entry: 'YES close in [0.05, 0.15] → buy NO (fade the overpriced longshot). YES close >= 0.85 → buy YES (underpriced favorite).',
      sizing: '100% of available cash, capped at 4x visible depth on the traded side.',
      exit: 'None. Both legs are held to settlement (no stop-loss, by mandate).',
      untestedLeg: 'The >= 0.85 favorite leg has no eligible market in the captured universe; it is coded and will fire on a future universe, but it contributes nothing to this result.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];

      // Leg 1 — fade the longshot band.
      if (close >= 0.05 && close <= 0.15) {
        const noAsk = book.getBestNoAsk();
        if (noAsk === null) return [];
        const heldNo = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.side === 'NO' && p.count > 0);
        if (heldNo) return [];
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'NO');
        if (count <= 0) return [];
        return [
          {
            type: 'buy',
            side: 'NO',
            count,
            reason: `FLB fade: YES ${close} is in the 5c-15c longshot band → buy NO at ${noAsk}`
          }
        ];
      }

      // Leg 2 — buy the heavy favorite band (no eligible market in this universe).
      if (close >= 0.85) {
        const yesAsk = book.getBestYesAsk();
        if (yesAsk === null) return [];
        const heldYes = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.side === 'YES' && p.count > 0);
        if (heldYes) return [];
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
        if (count <= 0) return [];
        return [
          {
            type: 'buy',
            side: 'YES',
            count,
            reason: `FLB favorite: YES ${close} >= 0.85 → buy YES at ${yesAsk}`
          }
        ];
      }

      return [];
    }
  },

  {
    ...BASE,
    id: 'panic_dip_shock_timing',
    username: 'PanicDip_ShockTiming',
    flight: 'both',
    handle: '@PanicDip_ShockTiming',
    avatar: '🪂',
    title: 'Shock-Timing Panic-Dip Buyer (maker ladder)',
    category: 'Shock / Mean Reversion (maker)',
    tagline: 'Waits for a violent intraperiod dump, then rests a three-rung maker bid ladder under the panic low and exits with a resting offer 5c higher.',
    sizingPct: 0.6,
    maxParticipation: 3,
    designedAt: '2026-09-17',
    designSource: 'Recreated from a public r/PredictionsMarkets build log (third-party source — see RESEARCH_SOURCES in src/research-sources.js)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/',
    sourceNote:
      'Recreated from a r/PredictionsMarkets build log ("rest limit buys below the pre-shock price at the historical P50/P75/P90 drop depths ... exit with a resting limit sell 4-6c higher ... ' +
      'keeping both entry and exit on resting limit orders completely sidesteps the fee drag") and the OddsHopper Kalshi playbook ("rest limit orders instead of paying the spread", "take profit by selling your position before settlement"). ' +
      'Links are listed in the Verification tab and in README "Strategy sources".',
    thesis:
      'DESIGN INTENT: violent repricings overshoot because liquidity thins out exactly when it is needed. A resting maker bid under the panic low gets filled by the overshoot itself and pays the MAKER fee ' +
      '(0.0175 x P x (1-P) vs the taker 0.07 x P x (1-P) — a 4x discount under the official schedule), which is the only structural edge in this universe that does not depend on predicting direction. ' +
      'The exit is also a resting offer, so the round trip is maker→maker. HONEST CAVEAT: fills behind the touch depend on the modelled depth ladder, and a daily candle cannot show the intraperiod path, so a resting bid is ' +
      'marked as filled only if the period low actually reached it.',
    rules: {
      entry: 'Shock = period low <= 0.70 x the prior 5-period mean close. Then rest three maker bids one grid step apart starting 2 ticks under the panic low.',
      sizing: '60% of cash split across three rungs (25% / 35% / 40%, deepest rung largest, as in the source build log), capped at 3x visible depth.',
      exit: 'Rest a maker offer 5c above the position average cost; cancel and re-quote each period. No stop-loss (by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const actions = [];

      // Exit first: a resting offer 5c above cost closes a filled dip buy as maker.
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        if (book.cancelExisting) book.cancelExisting();
        const target = snapToGrid(Number(pos.avgCost) + 0.05, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        actions.push({
          type: 'limit',
          direction: 'ask',
          side: 'YES',
          count: pos.count,
          price: target,
          reason: `shock exit: rest a maker offer at ${target} (cost ${round6(pos.avgCost)} + 5c)`
        });
      }

      const close = candle.trade.close;
      const low = candle.trade.low;
      if (close === null || low === null) return actions;
      const mean5 = rollingMean(history.slice(0, -1), (c) => c.trade.close, 5);
      if (mean5 === null || mean5 <= 0) return actions;

      const shock = low <= round6(mean5 * 0.7);
      if (!shock) return actions;

      // Three-rung maker ladder under the panic low.
      const rungs = [
        { frac: 0.25, offset: 1 },
        { frac: 0.35, offset: 2 },
        { frac: 0.40, offset: 3 }
      ];
      for (const rung of rungs) {
        const price = snapToGrid(low - rung.offset * book.tick, book.grid, 'down');
        if (!(price > 0)) continue;
        const cashSlice = portfolio.cash * this.sizingPct * rung.frac;
        const count = Math.floor((cashSlice / price) * 100) / 100;
        if (!(count > 0)) continue;
        actions.push({
          type: 'limit',
          direction: 'bid',
          side: 'YES',
          count: round2(count),
          price,
          reason: `shock dip: low ${low} <= 0.70 x 5-period mean ${round6(mean5)} → rest maker bid ${count} @ ${price}`
        });
      }
      return actions;
    }
  },

  /* ==================================================================== *
   * RECREATED FROM PUBLIC SOURCES — session 2026-09-18
   * --------------------------------------------------------------------
   * Each entry below was recreated from a PUBLIC write-up, quoted in
   * src/research-sources.js with the URL it was read from and how it was
   * captured. None of them is a claim that the source makes money: they are
   * hypotheses that this engine tests on real Kalshi bars, and the results are
   * computed like everyone else's.
   * ==================================================================== */

  {
    ...BASE,
    id: 'panic_fade_hourly_vol',
    username: 'PanicFade_HourlyVol',
    handle: '@PanicFade_HourlyVol',
    avatar: '🌊',
    title: 'Hourly Panic-Fade Volatility Reversion',
    category: 'Intraday Mean Reversion',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    tagline: 'On 60-minute bars, buys the other side of a violent hourly repricing and exits on the bounce with a resting maker offer.',
    sizingPct: 0.6,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from a public r/PredictionsMarkets backtest write-up (panic_fade archetype)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    sourceNote:
      'Recreated from "Backtested 5,000 Strategies on Kalshi 15-min BTC Markets" (r/PredictionsMarkets): of 4,904 strategies, 102 made money and ' +
      '"panic_fade was 93 of 96 profitable. Mean ROI +4.90% ... Best variant +18.32%", while "mean_reversion was 0 for 432" and tight 2-cent ' +
      'scalps were "eaten alive by fees and slippage". The design takes the profitable archetype (fade a violent move, take the bounce) and avoids ' +
      'the archetype the same source measured as losing (buy cheap and wait for a slow bounce / tight price targets). Third-party claim, not exchange ' +
      'documentation — see src/research-sources.js.',
    thesis:
      'DESIGN INTENT: an intraday shock is mostly liquidity withdrawal, not information, so the first 60-minute bar after a violent drop is systematically ' +
      'oversold and reverts. The source measured this on 15-minute BTC markets; this entry tests the same idea on the real 60-minute bars of the ' +
      'highest-volume markets in this repository (data/history/intraday/60m/). HONEST CAVEAT: a 60-minute bar hides its own path, so a buy is marked ' +
      'filled at the bar close rather than at the panic low, which biases the entry AGAINST the strategy.',
    rules: {
      entry: 'Buy YES when the bar closes at least 4 cents AND at least 15% below the previous 60-minute close, and the close is below 0.50.',
      sizing: '60% of cash per signal, capped at 3x visible depth; only one entry per market per bar.',
      exit: 'Rest a maker offer 4 cents above average cost (the source documents a 4-6c take-profit); cancel and re-quote daily. No stop-loss (by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null || history.length < 2) return [];
      const prev = history[history.length - 2].trade.close;
      if (prev === null || prev === undefined) return [];
      const actions = [];

      // Exit leg: a resting maker offer 4c above cost (the source's take-profit).
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = snapToGrid(Number(pos.avgCost) + 0.04, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        const already = book.restingOrders.some((o) => o.direction === 'ask' && Math.abs(o.price - target) < 1e-9 && o.outcome === 'YES');
        if (already) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `take profit +0.04 over cost ${round6(pos.avgCost)}` });
      }

      const drop = prev - close;
      const relative = prev > 0 ? drop / prev : 0;
      if (drop >= 0.04 && relative >= 0.15 && close < 0.50) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
        if (count > 0) {
          actions.push({
            type: 'buy',
            side: 'YES',
            count,
            reason: `hourly panic: close ${close} is ${round6(drop)} (${(relative * 100).toFixed(1)}%) below previous close ${prev}`
          });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'book_wall_bid_ladder',
    username: 'BookWall_BidLadder',
    handle: '@BookWall_BidLadder',
    avatar: '🧱',
    title: 'Order-Book Wall Maker Ladder',
    category: 'Liquidity Provision',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    tagline: 'Never takes a price: rests three maker bids 4/8/12 cents under the touch and waits for the book to come to it.',
    sizingPct: 1.0,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from a public r/Kalshi thread on what winning traders actually do',
    designSourceUrl: 'https://www.reddit.com/r/Kalshi/comments/1qd4ubf/people_who_actually_win_money_on_kalshi_whats/',
    sourceNote:
      'Recreated from the r/Kalshi thread "People who actually WIN MONEY on Kalshi: what\'s your secret?": "never use market order, always use limit orders ' +
      'below the price usually 5-15 cents lower than current price and set a bunch of them out there and let them come to you, when whales have capital flying ' +
      'around you\'ll hit the natural dips ... don\'t trade the event, trade the orderbook wall". Third-party claim, not exchange documentation.',
    thesis:
      'DESIGN INTENT: the only fee asymmetry the official schedule guarantees is taker vs maker (0.07 vs 0.0175 of P(1-P)), so an entry that never crosses the ' +
      'spread is structurally cheaper regardless of direction. Deep resting bids also get filled by exactly the liquidity the source describes: large orders ' +
      'walking the book. HONEST CAVEAT: a resting bid only fills if the period low reaches it, and it is filled at the resting price — the engine will not ' +
      'pretend it filled at a better one.',
    rules: {
      entry: 'Rest three maker bids at (best YES bid - 4c), (- 8c) and (- 12c) on every tracked market, every period.',
      sizing: '20% / 30% / 50% of available cash across the three rungs (deepest rung largest).',
      exit: 'Rest a maker offer 3 cents above average cost; hold if it never fills. No stop-loss (by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker } = ctx;
      const best = book.getBestYesBid();
      if (best === null) return [];
      const actions = [];

      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = snapToGrid(Number(pos.avgCost) + 0.03, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `maker exit +0.03 over cost ${round6(pos.avgCost)}` });
      }

      // One ladder per market, not one per bar: if rungs are already resting, skip.
      const restingBids = book.restingOrders.filter((o) => o.direction === 'bid' && o.outcome === 'YES' && o.status === 'resting');
      if (restingBids.length >= 3) return actions;

      const rungs = [
        { frac: 0.20, offset: 4 },
        { frac: 0.30, offset: 8 },
        { frac: 0.50, offset: 12 }
      ];
      for (const rung of rungs) {
        const price = snapToGrid(best - rung.offset * book.tick, book.grid, 'down');
        if (!(price > 0) || price >= best) continue;
        const slice = portfolio.cash * this.sizingPct * rung.frac;
        const count = round2(Math.floor((slice / price) * 100) / 100);
        if (!(count > 0)) continue;
        actions.push({
          type: 'limit',
          direction: 'bid',
          side: 'YES',
          count,
          price,
          reason: `wall rung ${rung.offset} ticks under best bid ${best} (maker-only, per source)`
        });
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'adjacent_strike_ladder',
    username: 'AdjacentStrike_Ladder',
    handle: '@AdjacentStrike_Ladder',
    avatar: '🪜',
    title: 'Adjacent-Strike Cheap Bracket Ladder',
    category: 'Bracket Laddering',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    tagline: 'Buys several cheap adjacent strikes instead of one, so any resolution inside the ladder pays for the rest.',
    sizingPct: 0.9,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from a public r/PredictionsMarkets thread on temperature-market laddering',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1s4n4wp/what_are_the_best_strategies_youve_seen_or_used/',
    sourceNote:
      'Recreated from the r/PredictionsMarkets thread on temperature markets, where the most-consistent approach reported is laddering: "buying multiple ' +
      'adjacent brackets cheap (like 2-15c) rather than picking one. If the final temp lands anywhere in your spread, one or two contracts pay out big and ' +
      'cover the rest". Third-party claim, not exchange documentation.',
    thesis:
      'DESIGN INTENT: a single deep out-of-the-money binary is a lottery; a ladder of adjacent strikes converts the same premium into a covered band. In this ' +
      'universe the ladder is built from the cheapest adjacent strikes of one series (verified KXBTCY / KXNASDAQ100Y / KXINXY strikes; the stored window prints closes from $0.01 to $0.45, and every close above $0.28 belongs to two Nasdaq-100 strikes), ' +
      'which contains the 2-15c band the source describes but is far from limited to it. HONEST CAVEAT: the source trades temperature brackets that all expire at the same hour; the ' +
      'index strikes here expire together but are not mutually exclusive, so the ladder can win on several rungs at once or none.',
    rules: {
      entry: 'In each series, buy YES on the three cheapest strikes priced at or below 0.15, equal cash per strike.',
      sizing: '90% of cash split evenly across the three rungs; re-ladder when a rung is no longer the cheapest.',
      exit: 'Hold to settlement (the source holds to the outcome). No stop-loss (by mandate).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker, allMarkets, historyAll } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const series = book.series_ticker || ticker.split('-')[0];
      const candidates = (allMarkets || [])
        .filter((m) => (m.series_ticker || m.ticker.split('-')[0]) === series)
        .map((m) => {
          const h = historyAll?.[m.ticker];
          const last = h && h.length ? h[h.length - 1].trade.close : null;
          return { ticker: m.ticker, close: last };
        })
        .filter((c) => typeof c.close === 'number' && c.close > 0 && c.close <= 0.15)
        .sort((a, b) => a.close - b.close)
        .slice(0, 3);

      if (!candidates.some((c) => c.ticker === ticker)) return [];
      const held = portfolio.positions.get(`${ticker}:YES`) || portfolio.positions.get(`YES:${ticker}`);
      if (held && held.count > 0) return [];
      const slice = (portfolio.cash * this.sizingPct) / 3;
      const price = book.getBestYesAsk();
      if (price === null || !(price > 0)) return [];
      const count = round2(Math.floor((slice / (price * 1.05)) * 100) / 100);
      if (!(count > 0)) return [];
      return [{
        type: 'buy',
        side: 'YES',
        count,
        reason: `cheapest-3 ladder rung: ${series} strike at ${close} (slice ${round2(slice)})`
      }];
    }
  },

  {
    ...BASE,
    id: 'shock_timing_stopout',
    username: 'ShockTiming_StopOut',
    handle: '@ShockTiming_StopOut',
    avatar: '🛑',
    title: 'Shock-Timing with the Source\'s Stop-Out',
    category: 'Shock / Mean Reversion (stopped)',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    tagline: 'The same panic-dip entry as PanicDip_ShockTiming, but with the source\'s documented exits: take profit at +20c, stop out at -10c.',
    sizingPct: 0.8,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from the public out-of-sample replication of a "shock-timing" bot on r/PredictionsMarkets',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/',
    sourceNote:
      'Recreated from the r/PredictionsMarkets thread where the original "shock-timing" spec claimed "135% ROI, 71.8% win rate across 241 trades", and a ' +
      'replication in the same thread re-tested it out-of-sample against the completed 2022 World Cup and reported the bounce variants at "46-48%" win rate ' +
      'and "-12% to -25%" ROI. The replication also states the exit rules it tested: take profit at +20c, stop out at -10c. This entry tests that exit ' +
      'mechanism on real Kalshi bars instead of asserting either outcome.',
    thesis:
      'DESIGN INTENT: PanicDip_ShockTiming holds to settlement. The public counter-evidence says the profit-taking and stop-out are part of the spec, and that ' +
      'the bounce decays. This entry is the control experiment: identical entry, exits at +20c / -10c. Whichever way it lands, the engine computes it from ' +
      'real bars and the comparison is the finding. HONEST CAVEAT: a stop-out on a daily bar is executed at the bar close, because a daily candle ' +
      'for daily bars), so a stop is filled at or worse than the modelled trigger, never at a better price.',
    rules: {
      entry: 'Buy YES when the period low <= 0.70 x the prior 5-period mean close (same shock definition as PanicDip_ShockTiming).',
      sizing: '80% of cash, capped at 3x visible depth.',
      exit: 'Rest a maker offer at cost + 0.20; if the close falls to cost - 0.10, sell the position as a taker (the source\'s stop-out).',
      riskManagement: 'NONE (by mandate) — the stop is part of the recreated rule, not portfolio risk management'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const actions = [];

      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const cost = Number(pos.avgCost);
        if (close <= cost - 0.10) {
          actions.push({ type: 'sell', side: 'YES', count: pos.count, reason: `stop-out: close ${close} <= cost ${round6(cost)} - 0.10` });
          continue;
        }
        const target = snapToGrid(cost + 0.20, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `take profit at cost + 0.20 (${target})` });
      }

      const mean5 = rollingMean(history, (c) => c.trade.close, 5);
      const low = candle.trade.low;
      if (mean5 !== null && low !== null && low <= 0.70 * mean5) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
        if (count > 0) {
          actions.push({ type: 'buy', side: 'YES', count, reason: `shock: low ${low} <= 0.70 x 5-period mean ${round6(mean5)}` });
        }
      }
      return actions;
    }
  },

  /* ==================================================================== *
   * PROMOTED FROM THE FAMILY SWEEP — session 2026-09-18
   * --------------------------------------------------------------------
   * scripts/strategy-sweep.mjs ran 122 parameter variants over the real bars
   * and published EVERY result (data/reports/strategy-sweep-*.json). Four of
   * those variants are registered here so they trade in the live competition
   * instead of only in a report.
   *
   * MEASURED DISTRIBUTIONS (corrected run, seed 20260918, $100,000 capital)
   *
   *   period  depth      family            variants  profitable    median      best     worst
   *   1440m   captured   panic_fade              96       0        -1.575%    -0.86%    -5.50%
   *   1440m   captured   panic_fade_placebo       6       0        -3.025%    -1.26%    -8.38%
   *   1440m   captured   mean_reversion          12       3       -11.965%    +4.52%   -12.42%
   *   1440m   captured   tight_scalp              8       2       -38.045%    +4.07%   -61.45%
   *   1440m   modelled   panic_fade              96       0        -1.270%    -0.03%    -4.41%
   *   1440m   modelled   mean_reversion          12       3        -2.210%   +15.28%    -3.15%
   *    60m    captured   panic_fade              96       0         0.000%     0.00%     0.00%
   *    60m    captured   mean_reversion          12      12        +0.610%    +0.61%    +0.22%
   *    60m    captured   tight_scalp              8       0        -2.320%    -0.44%    -5.99%
   *
   * WHAT THAT MEANS, STATED PLAINLY
   *   On the daily flight NO parameterisation of the panic-fade archetype made
   *   money under either depth assumption, and the delayed-signal placebo was
   *   worse than the real signal (-3.03% vs -1.58% median), so the signal does
   *   carry information — the information is just not enough to overcome these
   *   markets' structure and fees. The public source this family recreates
   *   reported the opposite (+4.90% mean on KXBTC15M). That disagreement is the
   *   finding, and it is published rather than tuned away.
   *
   *   The hourly flight disagrees with the daily one for mean_reversion only,
   *   and by a trivial amount (+0.61% over 586 periods).
   *
   * SO EVERY ENTRY BELOW IS LABELLED FOR WHAT IT ACTUALLY IS
   *   • PanicFade_T4_S100        CONTROL — the source's own best parameterisation,
   *                              measured as losing on this data.
   *   • PanicFadeDeep_T6_TP6     CONTROL — the least-bad variant of a family that
   *                              never made money in any of its 96 settings.
   *   • MeanRev_CheapBand        SWEEP ARTIFACT SUSPECT — best of a family whose
   *                              median is -11.97%; promoted so it can be judged
   *                              prospectively with frozen parameters.
   *   • TightScalp_Fixed5        CONTROL — the fee thesis is confirmed on this data:
   *                              2 of 8 settings positive, median -38%.
   *   None of them is presented as an edge. A control that is measured live is
   *   worth more than a backtest that flatters itself.
   * ==================================================================== */

  {
    ...BASE,
    id: 'panic_fade_t4_s100',
    username: 'PanicFade_T4_S100',
    handle: '@PanicFade_T4_S100',
    avatar: '🌀',
    title: 'Panic Fade — the source\'s own best configuration',
    category: 'Intraday Mean Reversion',
    tagline: 'The exact parameterisation a public sweep reported as its best: fade a 4-cent one-bar drop with full size.',
    sizingPct: 1.0,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from R01 — a public 4,904-strategy sweep on Kalshi 15-minute BTC markets',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    sourceNote:
      'R01 reports "panic_fade was 93 of 96 profitable. Mean ROI +4.90% ... Best variant +18.32%, on panic_threshold=0.04 with fade_size=100". This entry is that ' +
      'exact configuration: a 4-cent absolute drop, full size, hold. Size is translated from 100 contracts to 100% of available cash because the competition sizes ' +
      'every strategy fractionally on the same bankroll — a translation, recorded in the sweep report, not a copy.',
    thesis:
      'DESIGN INTENT: a one-bar 4-cent drop in a cheap contract is mostly liquidity, not information, so the next bars recover part of it. WHY THE RESULT IS WHAT IT IS: ' +
      'the sweep measured this parameterisation on the daily store and on the hourly store, and the two tell different stories — see the family row for panic_fade in ' +
      'data/reports/strategy-sweep-1440m.json and strategy-sweep-60m.json. Both numbers are computed by the engine, and the sweep also runs a delayed-signal placebo so ' +
      'a reader can tell a timing edge apart from ordinary drift.',
    rules: {
      entry: 'Buy YES when a bar closes at least 0.04 below the previous bar\'s close.',
      sizing: '100% of available cash, capped at 3x visible depth.',
      exit: 'Hold to the end of the window (the source\'s best variant held).',
      riskManagement: 'NONE (by mandate)'
    },
    control: {
      claim: 'Recreated faithfully and measured: loses money on this universe',
      measured: '0 of 96 panic_fade variants were profitable on the daily store (captured depth); this parameterisation returned -2.64% with 88 fills',
      falsifiedIf: 'the live competition turns this specific parameterisation positive over a window it has not traded yet'
    },
    sweepRef: { family: 'panic_fade', params: { threshold: 0.04, sizePct: 1.0, exit: 'hold' }, reports: ['data/reports/strategy-sweep-1440m-captured.json', 'data/reports/strategy-sweep-1440m-modelled.json', 'data/reports/strategy-sweep-60m-captured.json'] },
    decide(ctx) {
      const { candle, history } = ctx;
      const close = candle.trade.close;
      if (close === null || history.length < 2) return [];
      const prev = history[history.length - 2].trade.close;
      if (prev === null || prev === undefined) return [];
      if (prev - close < 0.04) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (!(count > 0)) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `panic fade t4 s100: drop ${round6(prev - close)} >= 0.04` }];
    }
  },

  {
    ...BASE,
    id: 'panic_fade_deep_t6_tp6',
    username: 'PanicFadeDeep_T6_TP6',
    handle: '@PanicFadeDeep_T6_TP6',
    avatar: '🌪️',
    title: 'Deep Panic Fade with a 6-cent Take-Profit',
    category: 'Intraday Mean Reversion',
    tagline: 'Waits for a bigger 6-cent drop and takes profit 6 cents above cost on a resting maker offer.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Promoted from this repository\'s own family sweep (a recreation of R01\'s archetype)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    sourceNote:
      'Not from a source directly: this is the best-performing variant of the panic_fade family that src/sweep-families.js builds from R01\'s archetype. Its exact ' +
      'parameter set and rank are in data/reports/strategy-sweep-1440m.json → families.panic_fade.',
    thesis:
      'DESIGN INTENT: a bigger drop (6 cents) is a bigger dislocation, and taking profit on a resting offer means the exit pays the maker fee instead of the taker fee. ' +
      'WHY IT IS LABELLED A CANDIDATE AND NOT AN EDGE: in the daily sweep this variant was the family\'s best, but the family median was near zero and the best sat only ' +
      'marginally above the family\'s own 95th percentile — the sweep report\'s interpretation rule says that pattern is a sweep artifact, not an edge. It is promoted so ' +
      'it can be judged prospectively, with its parameters frozen at the date recorded in designedAt.',
    rules: {
      entry: 'Buy YES when a bar closes at least 0.06 below the previous bar\'s close.',
      sizing: '25% of available cash, capped at 3x visible depth.',
      exit: 'Rest a maker offer at cost + 0.06; re-quote every period. No stop.',
      riskManagement: 'NONE (by mandate)'
    },
    control: {
      claim: 'Least-bad setting of a family that was never profitable',
      measured: 'family best was -0.86% (captured depth) across all 96 settings; this variant ranked in the same band',
      falsifiedIf: 'it produces a positive live window'
    },
    sweepRef: { family: 'panic_fade', params: { threshold: 0.06, sizePct: 0.25, exit: 0.06 }, reports: ['data/reports/strategy-sweep-1440m-captured.json', 'data/reports/strategy-sweep-1440m-modelled.json'] },
    decide(ctx) {
      const { candle, history, book, portfolio } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const actions = [];
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = snapToGrid(Number(pos.avgCost) + 0.06, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `deep fade take-profit at cost + 0.06` });
      }
      if (history.length >= 2) {
        const prev = history[history.length - 2].trade.close;
        if (prev !== null && prev !== undefined && prev - close >= 0.06) {
          const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
          if (count > 0) actions.push({ type: 'buy', side: 'YES', count, reason: `deep panic: drop ${round6(prev - close)} >= 0.06` });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'mean_rev_cheap_band',
    username: 'MeanRev_CheapBand',
    handle: '@MeanRev_CheapBand',
    avatar: '🪙',
    title: 'Cheap-Band Mean Reversion (enter ≤ 0.10, exit ≥ 0.50)',
    category: 'Mean Reversion',
    tagline: 'Buys the cheapest band in the universe and rests an offer at 50 cents.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from R01\'s mean_reversion family (the archetype the source measured as 0-for-432)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    sourceNote:
      'R01 tested "entry bands from 0.10 to 0.40 against exits at 0.50 to 0.90" and reported "mean_reversion was 0 for 432. Not a single variant made money", ' +
      'with the structural reason that a short-dated market "does not have time" for a drift-away-and-return. This entry is the 0.10/0.50 corner of that grid, ' +
      'which is the only corner where this repository\'s daily bars disagree with the source.',
    thesis:
      'DESIGN INTENT: buy the cheapest contracts and let them mean-revert to a mid-band price. WHY IT MATTERS: this is the clearest disagreement between a public ' +
      'source and this data — the source\'s family was 0-for-432, while on this universe the cheap-band corner is the family\'s best and the wider bands lose. The ' +
      'mechanism that would explain it is the universe itself: these are far-out-of-the-money year-end index brackets, so "cheap" here is a 1-8 cent contract with ' +
      'many months left, not a 15-minute binary. That difference is stated rather than smoothed over, and the sweep report\'s luck rule still classes the result as a ' +
      'sweep artifact because the family median is negative.',
    rules: {
      entry: 'Buy YES when a bar closes at or below 0.10.',
      sizing: '50% of available cash per signal.',
      exit: 'Rest a maker offer at 0.50 or better; hold to the end of the window if it never trades.',
      riskManagement: 'NONE (by mandate)'
    },
    control: {
      claim: 'Best variant of a family with a strongly negative median — a sweep artifact until proved otherwise',
      measured: 'families.mean_reversion: 3 of 12 profitable, median -11.97%, best +4.52% (captured depth)',
      falsifiedIf: 'it holds up on bars after its designedAt date, which is what the forward test measures'
    },
    sweepRef: { family: 'mean_reversion', params: { entryBand: 0.1, exitBand: 0.5 }, rankInFamily: 1, reports: ['data/reports/strategy-sweep-1440m-captured.json', 'data/reports/strategy-sweep-1440m-modelled.json', 'data/reports/strategy-sweep-60m-captured.json'] },
    decide(ctx) {
      const { candle, book, portfolio } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const actions = [];
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = Math.max(snapToGrid(0.5, book.grid, 'up'), snapToGrid(Number(pos.avgCost), book.grid, 'up'));
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `mean-reversion exit at ${target}` });
      }
      if (close <= 0.10) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
        if (count > 0) actions.push({ type: 'buy', side: 'YES', count, reason: `cheap band: close ${close} <= 0.10` });
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'tight_scalp_fixed5',
    username: 'TightScalp_Fixed5',
    handle: '@TightScalp_Fixed5',
    avatar: '🪒',
    title: 'Tight Scalp — the family\'s best setting, promoted as a control',
    category: 'Spread Scalping',
    tagline: 'Rests a 5-cent bid everywhere and flips every fill to a 7-cent offer. Promoted because the family lost, to be measured live.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from R01\'s tight-band price-threshold family',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    sourceNote:
      'R01 measured this shape and rejected it: "the bottom 10 strategies in this run are all tight-band price-threshold variants ... 7,000+ trades each, 62-63% win ' +
      'rate, and still losing 75-78% over the window. They are being eaten alive by fees and slippage on a 2-cent target". This entry is the 5-cent/2-cent corner of ' +
      'that family — the best of its eight settings on this repository\'s daily bars, which is exactly why it is promoted as a CONTROL rather than as a candidate.',
    thesis:
      'DESIGN INTENT (what the design claims): buy the bid, sell a couple of ticks higher, repeat at high frequency. WHY THE SWEEP SAYS IT DOES NOT WORK HERE: fees are ' +
      'quadratic in price and charged on every execution, so high turnover multiplies a small per-trade cost; the family\'s median return is strongly negative and the ' +
      'worst settings lose more than half the bankroll. Its win rate is 100% of CLOSED trades while the return is negative, because the positions that hurt are the ones ' +
      'still open and marked down — the same pattern the source describes when it notes that a high win rate still lost badly.',
    rules: {
      entry: 'Rest a maker bid at 0.05 on every tracked market, every period.',
      sizing: '25% of cash per rung, at most two rungs per market.',
      exit: 'Flip every fill to a resting maker offer at 0.07.',
      riskManagement: 'NONE (by mandate)'
    },
    sweepRef: { family: 'tight_scalp', params: { buyAt: 0.05, target: 0.02 }, rankInFamily: 2, reports: ['data/reports/strategy-sweep-1440m-captured.json', 'data/reports/strategy-sweep-1440m-modelled.json', 'data/reports/strategy-sweep-60m-captured.json'] },
    control: {
      claim: 'Negative expectation once fees are charged',
      measured: 'families.tight_scalp: 2 of 8 settings profitable, median -38.05%, worst -61.45% (captured depth)',
      falsifiedIf: 'the live competition result is positive after at least 200 fills'
    },
    decide(ctx) {
      const { book, portfolio } = ctx;
      const actions = [];
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const offer = snapToGrid(0.07, book.grid, 'up');
        if (!(offer > 0) || offer >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - offer) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: offer, reason: 'scalp flip to 0.07' });
      }
      const restingBids = book.restingOrders.filter((o) => o.direction === 'bid' && o.outcome === 'YES' && o.status === 'resting').length;
      if (restingBids < 2) {
        const bid = snapToGrid(0.05, book.grid, 'down');
        if (bid >= book.tick) {
          const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
          if (count > 0) actions.push({ type: 'limit', direction: 'bid', side: 'YES', count, price: bid, reason: 'rest 5-cent bid' });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'maker_flip_spread_harvest',
    username: 'MakerFlip_SpreadHarvest',
    handle: '@MakerFlip_SpreadHarvest',
    avatar: '🔁',
    title: 'Maker Flip — rest the bid, flip the fill to the offer',
    category: 'Spread Harvest',
    flight: 'both',
    preferredPeriodMinutes: 1440,
    tagline: 'One resting bid one tick under the touch; every fill becomes a resting offer one tick over it.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from R02 — a public r/Kalshi thread on what consistently profitable traders actually do',
    designSourceUrl: 'https://www.reddit.com/r/Kalshi/comments/1qd4ubf/people_who_actually_win_money_on_kalshi_whats/',
    sourceNote:
      'R02 (LupineChemist): "in some low liquidity markets, you can make a couple percent just on spreads. Just have a ton of resting buy orders and then immediately ' +
      'flip them to resting sell orders where the market is ... if you can get a market that moves from 3 cents to 4 cents, that\'s a 33% return." The same thread gives ' +
      'the entry rule this implements (Snoo-77724): limit orders "5-15 cents lower than current price ... let them come to you".',
    thesis:
      'DESIGN INTENT: on a thin book the only structural advantage a small participant has is the maker/taker fee asymmetry, and the widest relative spreads in this ' +
      'universe are in the cheapest contracts — 1 cent of spread on a 4-cent contract is 25% of the price. WHY IT IS MEASURABLE HERE: the engine charges the maker ' +
      'coefficient only on execution, so the strategy\'s whole result is the difference between what it paid on the bid and what it received on the offer, minus fees and ' +
      'minus whatever it is still holding.',
    rules: {
      entry: 'Rest a maker bid at best YES bid − 1 tick (never cross the spread).',
      sizing: '25% of available cash per rung, at most two rungs per market.',
      exit: 'Rest a maker offer at best YES ask + 1 tick, or cost + 2 ticks, whichever is higher.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio } = ctx;
      const actions = [];
      const bestAsk = book.getBestYesAsk();
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const floorPrice = Number(pos.avgCost) + 2 * book.tick;
        const base = bestAsk !== null && bestAsk > 0 ? Math.max(bestAsk + book.tick, floorPrice) : floorPrice;
        const offer = snapToGrid(base, book.grid, 'up');
        if (!(offer > 0) || offer >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - offer) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: offer, reason: `flip fill to maker offer ${offer}` });
      }
      const bestBid = book.getBestYesBid();
      if (bestBid === null) return actions;
      const restingBids = book.restingOrders.filter((o) => o.direction === 'bid' && o.outcome === 'YES' && o.status === 'resting').length;
      if (restingBids < 2) {
        const bid = snapToGrid(bestBid - book.tick, book.grid, 'down');
        if (bid >= book.tick) {
          const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
          if (count > 0) actions.push({ type: 'limit', direction: 'bid', side: 'YES', count, price: bid, reason: `rest bid one tick under the touch ${bestBid}` });
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'shock_timing_moderate_fav',
    username: 'ShockTiming_ModerateFav',
    handle: '@ShockTiming_ModerateFav',
    avatar: '🧪',
    title: 'Shock Timing — the source\'s favourite-bucket filter, as a measured control',
    category: 'Shock / Mean Reversion (control)',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    tagline: 'Only fades a panic in a contract that was priced 76-85 cents beforehand. Expected to never fire here — and the trigger count is the finding.',
    sizingPct: 1.0,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from R04 — the "moderate_fav" filter in a public shock-timing bot spec, disputed by an out-of-sample replication in the same thread',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/',
    sourceNote:
      'R04 spec: the bot\'s best configuration filtered shocks to teams "priced 76–85¢ before the shock" (the moderate_fav bucket). The replication posted in the same ' +
      'thread reports: "The headline config never fires. Across 39 detected in-play shocks, only 2 teams were priced in that 76–85¢ band when they got shocked, and ' +
      'neither ladder filled." This entry recreates the filter exactly so this repository can report its own trigger count instead of repeating either claim.',
    thesis:
      'DESIGN INTENT: panics in near-favourites are the ones that bounce, because the pre-shock price already encoded a high probability. WHY IT IS A CONTROL: every ' +
      'captured strike in this universe trades below ~0.28, so a 0.76-0.85 precondition cannot be satisfied — the engine should report zero triggers, and any non-zero ' +
      'count means the universe changed and needs review. That is the same shape of finding the replication reported for its own dataset, reached independently here.',
    rules: {
      entry: 'Buy YES only when the 5-period mean close is between 0.76 and 0.85 AND the bar low is at or below 70% of that mean.',
      sizing: '100% of available cash (one bucket, per the source\'s weighting).',
      exit: 'Rest a maker offer at cost + 0.05 (the source\'s 4-6 cent bounce target); hold if it never trades.',
      riskManagement: 'NONE (by mandate)'
    },
    control: {
      claim: 'Zero triggers, because no tracked contract trades near 0.80',
      falsifiedIf: 'any trigger fires — the universe then contains a favourite-priced contract and the filter should be re-evaluated'
    },
    decide(ctx) {
      const { candle, history, book, portfolio } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const actions = [];
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = snapToGrid(Number(pos.avgCost) + 0.05, book.grid, 'up');
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: 'bounce target cost + 0.05' });
      }
      const mean5 = rollingMean(history, (c) => c.trade.close, 5);
      const low = candle.trade.low;
      if (mean5 !== null && mean5 >= 0.76 && mean5 <= 0.85 && low !== null && low <= 0.7 * mean5) {
        const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
        if (count > 0) actions.push({ type: 'buy', side: 'YES', count, reason: `moderate_fav bucket: mean5 ${round6(mean5)} in [0.76,0.85], low ${low}` });
      }
      return actions;
    }
  },

  /* ════════════════════════════════════════════════════════════════════ *
   * 2026-09-18 — WEATHER + GOLD expansion (roadmap items #3 and #4, and
   * the MasterSite signal-source review: SFWeather → KXHIGHNY, GOLD →
   * KXGOLD15M). All three trade ONLY the newly ingested real bars, and two
   * of them settle against the exchange's own results (see
   * src/backtest-replay.js "REAL MID-REPLAY SETTLEMENTS").
   * ════════════════════════════════════════════════════════════════════ */

  {
    ...BASE,
    id: 'weather_ladder_cheapbrackets',
    username: 'WeatherLadder_CheapBands',
    handle: '@WeatherLadder_CheapBands',
    avatar: '🌡️',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXHIGHNY'],
    title: 'Cheap Weather-Bracket Ladder (settles for real)',
    category: 'Weather / Ladder',
    tagline:
      'Buys every cheap NYC high-temperature bracket in the first hours of each daily event and holds to the exchange\'s real settlement — the R03 ladder idea on the market class it was actually written for.',
    sizingPct: 0.3,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Recreated from the r/PredictionsMarkets temperature-laddering thread (RESEARCH_SOURCES R03, third-party source) + the SFWeather project\'s official-source weather pipeline (MasterSite signal-source ledger)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1s4n4wp/what_are_the_best_strategies_youve_seen_or_used/',
    sourceNote:
      'R03: "Laddering – The most consistent approach I\'ve seen is buying multiple adjacent brackets cheap (like 2-15c) rather than picking one. If the final temp lands anywhere in your spread, one or two contracts pay out big and cover the rest." The SFWeather project (https://buffedlizard55-lab.github.io/SFWeather/) verified the official-source weather pipeline that motivated ingesting this series at all. KXHIGHNY is the series Kalshi\'s own API quick-start documents (https://docs.kalshi.com/getting_started/quick_start_market_data).',
    thesis:
      'DESIGN INTENT: exactly one 2°F band of a KXHIGHNY daily event can settle YES (verified from the captured market objects: strike_type "between" with floor/cap, e.g. KXHIGHNY-26SEP07-B77.5 = "77° to 78°"; the "less" tail markets cover "X° or below"). A ladder of cheap bands bought early therefore costs a few cents per rung and pays $1.00 on the rung that contains the observed high — the R03 claim, on the exact market class the claim was made about. ' +
      'HONEST LIMITS, stated up front: (1) the replay universe holds the top-40 KXHIGHNY brackets by exchange-reported lifetime volume — 2-3 bands per event, not the full ~15-band ladder a live trader could buy, so this measures the idea on a sample, not the whole board; (2) entry timing is the market\'s own bar clock (first 6 hourly bars of the bracket\'s life, i.e. roughly the day before the measured day) — point-in-time by construction; (3) the strategy does NOT use any forecast: it is the "dumb ladder" control that the forecast strategy (ForecastEdge_Weather) must beat.',
    rules: {
      entry: 'Within the first 6 hourly bars of a bracket\'s life: buy YES when the YES ask ≤ 0.15 (the R03 "2-15c" band), once per market.',
      sizing: '30% of available cash per rung (aggressive laddering across the 2-3 ingested bands of an event), capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement (status=finalized, result yes/no books $1.00/$0.00; no settlement fee).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker, periodIndex } = ctx;
      if (periodIndex > 5) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.15) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `weather ladder: hour ${periodIndex} of the bracket's life, YES ask ${ask} ≤ 0.15 (R03 cheap band) → buy the rung, hold to real settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'forecast_edge_weather',
    username: 'ForecastEdge_Weather',
    handle: '@ForecastEdge_Weather',
    avatar: '🌦️',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXHIGHNY'],
    title: 'Point-in-Time Forecast-Divergence Buyer',
    category: 'Weather / Model vs Market',
    tagline:
      'Reads the archived NWS point forecast for Central Park AS KNOWN AT DECISION TIME and buys the bracket the forecast confirms when the market has not priced it — the R06 winner pattern. Abstains whenever no forecast snapshot existed.',
    sizingPct: 0.4,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Recreated from the 500-weather-bot backtest post (RESEARCH_SOURCES R06) + the botforkalshi weather-model-divergence taxonomy (R10) + the SFWeather project (MasterSite signal-source ledger)',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1tko1iw/i_backtested_500_weather_kalshi_bots_the_best_bot/',
    sourceNote:
      'R06: "the strategies that did best … used weather data to confirm a heat trade that the market had not fully priced yet. The strategies that did worst tried to fight the market because one weather variable looked bearish." R10 (https://www.botforkalshi.com/blog/kalshi-trading-strategies-guide): weather model divergence is a primary strategy family. The signal source is the official NWS API archived point-in-time by scripts/archive-forecasts.mjs (api.weather.gov, grid OKX 34,45 for Central Park).',
    thesis:
      'DESIGN INTENT: only the CONFIRMING side is traded — buy the band that contains the NWS forecast high, or the lower tail when the forecast sits clearly below its threshold, when the market still prices it cheap. Fighting the market on a bearish reading is explicitly not recreated (it was the losing family in R06). ' +
      'POINT-IN-TIME RULE: the forecast is read through src/forecast-store.js, which only returns a snapshot captured at or before the decision bar — no snapshot, no trade. The archive began on 2026-09-18, so every settled bracket ingested before that date honestly produces NO trades for this strategy: this is a forward test by construction, and it will stay unranked (0 trades, reason published) until the archive and the live markets overlap. ' +
      'BASIS MISMATCH (flagged, IRREGULARITIES.md): KXHIGHNY settles on The Weather Company data for New York City (CLINYC) per the market rules, while the signal is the NWS gridded forecast for the same point — different providers, a real source of noise the replay measures rather than hides.',
    rules: {
      entry:
        'ctx.signal carries the newest NWS forecast high F captured at or before this bar. Band bracket (floor f, cap c): buy YES when F ∈ [f-1, c+1] and ask ≤ 0.45. Lower tail ("X° or below", cap X): buy YES when F ≤ X-2 and ask ≤ 0.45. Once per market.',
      sizing: '40% of available cash per confirmed bracket, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00 at the market\'s real result).',
      noSignalRule: 'ctx.signal === null (no snapshot captured by this bar) → abstain. Never substitute the current forecast for a past decision.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, market, signal, candle } = ctx;
      if (!signal || signal.kind !== 'nws-forecast-high') return [];
      const f = Number(signal.highF);
      if (!Number.isFinite(f)) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.45) return [];

      // Band bracket: floor_strike..cap_strike (verified: 2°F bands, e.g. 77-78).
      const floor = Number(market.floor_strike);
      const cap = Number(market.cap_strike);
      const isBand = Number.isFinite(floor) && Number.isFinite(cap) && cap > floor;
      // Lower tail: strike_type 'less' with a cap_strike only ("X° or below").
      const isLowerTail = String(market.strike_type || '') === 'less' && Number.isFinite(cap);

      let fire = false;
      let why = '';
      if (isBand && f >= floor - 1 && f <= cap + 1) {
        fire = true;
        why = `NWS forecast high ${f}°F lands in band ${floor}-${cap}°F (market ask ${ask} ≤ 0.45)`;
      } else if (isLowerTail && f <= cap - 2) {
        fire = true;
        why = `NWS forecast high ${f}°F is ≥2°F below the tail threshold ${cap}°F ("${cap - 1}° or below", ask ${ask} ≤ 0.45)`;
      }
      if (!fire) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `forecast-confirm: ${why} — snapshot captured ${signal.capturedAt} (point-in-time), holding to real settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'gold_bracket_earlyleader',
    username: 'GoldBracket_EarlyLeader',
    handle: '@GoldBracket_EarlyLeader',
    avatar: '🥇',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXGOLD15M'],
    title: '15-Minute Gold Early-Leader Ride',
    category: 'Gold / Short-Horizon Momentum',
    tagline:
      'On 1-minute bars of Kalshi\'s 15-minute gold markets, buys whichever side the market itself says is winning after the first five minutes and rides it to the exchange\'s real settlement.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Original design in this repository, built on the roadmap item #4 one-minute store; market semantics verified from the captured market objects (MasterSite signal-source ledger: GOLD project)',
    designSourceUrl: 'https://buffedlizard55-lab.github.io/GOLD/',
    sourceNote:
      'The KXGOLD15M series and its heavy trading were verified from third-party archives (cryptostruct.com topic page listing 3,000-7,000 trades per 15-minute contract); the contracts themselves, their "Gold price up in next 15 mins?" question and target-price settlement were then captured from the official Kalshi API by the ingest job (data/history/intraday/1m/). The MasterSite GOLD project is a solid-gold RING directory — it is NOT a gold-price signal (flagged in the signal-source ledger) and contributes nothing to this strategy\'s inputs; its link is kept only because it prompted the gold-market review.',
    thesis:
      'DESIGN INTENT: a 15-minute up/down market that has already moved to 0.55+ (or 0.45−) by minute five is telling you where spot gold went; the remaining ten minutes mostly confirm. Buying the early leader and holding to settlement converts that persistence into settlement cash — and because every KXGOLD15M contract captured so far is finalized with a real exchange result, the payout is the exchange\'s own $1.00/$0.00, not a mark. ' +
      'WHAT THIS IS NOT: it uses NO external gold data (no COMEX, no LBMA fix, no TradingView) — the only input is the market\'s own price path, so it is a market-microstructure bet on early-leader persistence, measured on 8 settled contracts (16 one-minute bars each) so far. The sample is small and the post-mortem says so.',
    rules: {
      entry: 'Bars 0-4 of the contract (the first five minutes): close ≥ 0.55 → buy YES; close ≤ 0.45 → buy NO. Once per market.',
      sizing: '50% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker, periodIndex } = ctx;
      if (periodIndex > 4) return [];
      const close = candle.trade.close;
      if (close === null) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      let side = null;
      if (close >= 0.55) side = 'YES';
      else if (close <= 0.45) side = 'NO';
      if (!side) return [];
      const ask = side === 'YES' ? book.getBestYesAsk() : book.getBestNoAsk();
      if (ask === null) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side,
          count,
          reason: `early leader: minute ${periodIndex} close ${close} ${side === 'YES' ? '≥ 0.55' : '≤ 0.45'} → buy ${side} at ${ask}, ride to real settlement`
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
