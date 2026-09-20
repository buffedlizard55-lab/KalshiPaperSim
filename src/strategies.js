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
import {
  universeRangeCaption,
  intradayFacts,
  classSampleCaption,
  forecastCaption,
  seriesSummary,
  dailyFacts,
  moderateFavPremiseCaption
} from './store-facts.js';

/**
 * STORE-DERIVED CAPTIONS (2026-09-18).
 *
 * Several entries below state a fact ABOUT THE STORED DATA — sample sizes, how
 * many markets the exchange had finalized, the price range the universe spans.
 * Those sentences are now COMPUTED from the store on every load (src/store-facts.js)
 * instead of written as literals, because a literal is a claim that silently
 * becomes false the next time the ingest job appends a bar. IRREGULARITY #31 is
 * exactly that failure: a caption asserting "no contract above 28c" while the
 * store held 47 of them. A computed sentence cannot drift away from the data,
 * and the automated test that guards it (test 77) proves the sentence CHANGES
 * when the store changes rather than merely matching a remembered number.
 */
const STORE_FACTS_60M = intradayFacts(undefined, 60);
const STORE_FACTS_1M = intradayFacts(undefined, 1);
/** Daily store facts (the 1440-minute flight universe: indices, crypto, and
 *  since 2026-09-18 the FDA ladders and CEO-succession markets). */
const STORE_FACTS_DAILY = dailyFacts();
import { snapToGrid } from './price-grid.js';
import { rawQuadraticFee } from './kalshi-fees.js';

/**
 * Series this build holds REAL bars for, derived from the store itself.
 *
 * WHY DERIVED: the roster check (test 21) refuses to let a strategy name a
 * series nobody verified. Written as a hand-maintained list that check went
 * stale the moment the ingest job expanded the universe — it failed the build
 * with "universe references unverified series KXHIGHLAX" even though 166 M
 * contracts of KXHIGHLAX were sitting in the store, fetched from the official
 * candlesticks endpoint. A series with captured bars IS verified: the bars are
 * the evidence. Hand-verified entries stay below and take precedence for the
 * human-readable reason.
 */
const STORE_VERIFIED_SERIES = (() => {
  const out = {};
  const add = (series, why) => {
    if (!series || out[series]) return;
    out[series] = why;
  };
  for (const s of Object.keys(dailyFacts().bySeries)) {
    add(s, 'real daily candlesticks in the accumulated store (data/history/)');
  }
  for (const period of [60, 1]) {
    const facts = intradayFacts(undefined, period);
    for (const [s, row] of Object.entries(facts.bySeries)) {
      add(
        s,
        `real ${period}-minute candlesticks in the accumulated store` +
          (row.settled ? ` (${row.settled} market(s) finalized with the exchange's own result)` : '')
      );
    }
  }
  return out;
})();

/** Series that were VERIFIED to exist on Kalshi (store first, then captures). */
export const VERIFIED_SERIES = Object.freeze({
  ...STORE_VERIFIED_SERIES,
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
  KXGOLD15M: 'Gold 15-minute up/down markets (target-price settlement; captured from the live API 2026-09-18, data/history/intraday/1m/)',
  /* LISTED BUT UNTRADEABLE, and recorded as such rather than dropped.
     GET /series on 2026-09-18 returned KXNHLGAME ("NHL Game") with 1,567,230,249
     lifetime contracts, but every one of its sampled markets carries volume_fp 0
     (the 2026 NHL season had not started), so this build holds NO bars for it.
     A universe that names it therefore cannot trade, and the entries that do name
     it publish that as a skip instead of a 0% result. */
  KXNHLGAME: 'Listed by the exchange (1.57 B lifetime contracts) but every sampled market reports volume_fp 0 on 2026-09-18 — verified to exist, verified to have no traded bars to replay'
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

/**
 * Small local helpers for the entries added on 2026-09-18. They are defined here
 * (rather than imported from the engine) so a strategy file never quietly
 * depends on engine internals that a refactor could change under it.
 */
function round6Local(v) {
  return Number.isFinite(Number(v)) ? parseFloat(Number(v).toFixed(6)) : null;
}

/**
 * How much cheaper the later-dated contract must be than the earlier one BEFORE
 * the dominance trade fires. 3c is not a modelling choice about the FDA: it is
 * the smallest gap that still clears the round-trip cost of the two legs at
 * typical prices under the official quadratic fee schedule, so a 1c flicker in
 * an illiquid ladder cannot trigger a trade that loses money after fees.
 */
const MIN_DOMINANCE_EDGE = 0.03;

/**
 * TANGOTIGER "CHANCE OF WINNING A BASEBALL GAME" (RESEARCH_SOURCES R18).
 * https://tangotiger.net/innwin.html — the home team's chance of winning at
 * the START of each half-inning by home run differential, "based on
 * probability theory" under the page's stated assumptions: "Both teams are
 * equals at every point in the game. No Home Field Advantage exists. Based on
 * a 4.3 Runs-per-game environment." Transcribed 2026-09-20 for innings 6–9
 * (the only rows the two MLB entries read); differentials −4..+4, columns in
 * that order. This is a THEORETICAL REFERENCE the strategies compare a market
 * price against — it is not data about any real game, and it never enters a
 * result except through a fill against real captured bars.
 */
export const TANGO_HOME_WIN_EXPECTANCY = Object.freeze({
  source: 'https://tangotiger.net/innwin.html',
  assumptions: 'Both teams are equals at every point in the game. No Home Field Advantage exists. Based on a 4.3 Runs-per-game environment.',
  differentials: [-4, -3, -2, -1, 0, 1, 2, 3, 4],
  rows: {
    '6:Top': [0.073, 0.127, 0.21, 0.333, 0.5, 0.667, 0.79, 0.873, 0.927],
    '6:Bottom': [0.087, 0.15, 0.246, 0.386, 0.574, 0.747, 0.853, 0.919, 0.957],
    '7:Top': [0.052, 0.097, 0.174, 0.299, 0.5, 0.701, 0.826, 0.903, 0.948],
    '7:Bottom': [0.063, 0.116, 0.207, 0.353, 0.587, 0.795, 0.894, 0.947, 0.974],
    '8:Top': [0.031, 0.064, 0.128, 0.247, 0.5, 0.753, 0.872, 0.936, 0.969],
    '8:Bottom': [0.038, 0.078, 0.155, 0.297, 0.605, 0.872, 0.943, 0.975, 0.99],
    '9:Top': [0.013, 0.03, 0.07, 0.158, 0.5, 0.842, 0.93, 0.97, 0.987],
    // The page's bottom-9th row is blank for a home lead (the game is over)
    // and reads 0.016/0.038/0.086/0.194/0.634 for −4..0. Leads are filled
    // with 1.0 ONLY so the lookup is total; a Final game never reaches the
    // rule (the entries require abstractGameState === 'Live').
    '9:Bottom': [0.016, 0.038, 0.086, 0.194, 0.634, 1, 1, 1, 1]
  }
});

/**
 * The theoretical win probability of the YES team from an archived state row.
 * `inningState` Top/Bottom map to the table's half-inning rows; 'Middle' (the
 * break after the top half) reads the Bottom row, 'End' (after the bottom
 * half) reads the next inning's Top row — both are the START of the half that
 * comes next, which is what the table tabulates. Innings after the 9th reuse
 * the 9th rows; differentials beyond ±4 clamp to the ±4 column. Returns null
 * for anything outside innings 6+, so the entries abstain early in a game.
 */
export function tangoYesWinProbability({ yesIsHome, inning, inningState, homeDifferential }) {
  if (!Number.isFinite(Number(inning)) || !Number.isFinite(Number(homeDifferential))) return null;
  let inn = Number(inning);
  let half = String(inningState || '');
  if (half === 'Middle') half = 'Bottom';
  else if (half === 'End') {
    half = 'Top';
    inn += 1;
  }
  if (half !== 'Top' && half !== 'Bottom') return null;
  if (inn < 6) return null;
  const rowKey = `${Math.min(inn, 9)}:${half}`;
  const row = TANGO_HOME_WIN_EXPECTANCY.rows[rowKey];
  if (!row) return null;
  const d = Math.max(-4, Math.min(4, Math.round(Number(homeDifferential))));
  const pHome = row[TANGO_HOME_WIN_EXPECTANCY.differentials.indexOf(d)];
  if (!Number.isFinite(pHome)) return null;
  return yesIsHome ? pHome : round6Local(1 - pHome);
}

/** The archived MLB state is usable only when it is LIVE and freshly observed. */
const MLB_MAX_STALE_SECONDS = 30 * 60;
function usableMlbSignal(signal) {
  if (!signal || signal.kind !== 'mlb-game-state') return false;
  if (signal.abstractGameState !== 'Live') return false;
  if (!Number.isFinite(Number(signal.lead)) || signal.lead === null) return false;
  if (!Number.isFinite(Number(signal.staleSeconds)) || signal.staleSeconds > MLB_MAX_STALE_SECONDS) return false;
  return true;
}

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
      'and the favourite leg needs a close of 0.85 or higher: ' +
      // COMPUTED from the loaded store (src/store-facts.js) — never a literal.
      universeRangeCaption(),
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
      'DESIGN INTENT: panics in near-favourites are the ones that bounce, because the pre-shock price already encoded a high probability. WHY IT IS A CONTROL: the ' +
      'filter is a precondition, so the trigger count is the finding. When this entry was written the premise was that no captured contract ever traded near 0.80; ' +
      'the sentence below is now MEASURED from the store on every build, so the claim cannot go stale — and it reports the opposite outcome after the FDA and ' +
      'CEO-succession markets landed in the daily store and traded through the band. That is the same shape of finding the R04 replication reported for its own ' +
      'dataset, reached independently here: a filter that looks harmless in one universe is testable in the next.',
    rules: {
      entry: 'Buy YES only when the 5-period mean close is between 0.76 and 0.85 AND the bar low is at or below 70% of that mean.',
      sizing: '100% of available cash (one bucket, per the source\'s weighting).',
      exit: 'Rest a maker offer at cost + 0.05 (the source\'s 4-6 cent bounce target); hold if it never trades.',
      riskManagement: 'NONE (by mandate)'
    },
    control: {
      claim: 'The 0.76-0.85 precondition is a FILTER, and the trigger count is the finding — measured from the daily store below',
      premise: moderateFavPremiseCaption(),
      falsifiedIf: 'the band count changes from zero to non-zero (or back) — the universe then contains (or no longer contains) a favourite-priced contract, and the filter must be re-evaluated'
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
      'DESIGN INTENT: exactly one 2°F band of a KXHIGHNY daily event can settle YES (verified from the captured market objects: strike_type "between" with floor/cap, e.g. KXHIGHNY-26SEP07-B77.5 = "77° to 78°"; the "less" tail markets cover "X° or below"). ' +
      'SAMPLE, COMPUTED FROM THE STORE ON THIS BUILD: ' + seriesSummary(STORE_FACTS_60M, 'KXHIGHNY') + '. ' +
      'A ladder of cheap bands bought early therefore costs a few cents per rung and pays $1.00 on the rung that contains the observed high — the R03 claim, on the exact market class the claim was made about. ' +
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
      'POINT-IN-TIME RULE: the forecast is read through src/forecast-store.js, which only returns a snapshot captured at or before the decision bar — no snapshot, no trade. ' +
      // COMPUTED from the shipped archive (src/forecast-data.js): the "archive
      // began on <date>" claim used to be a literal that would survive a
      // re-capture of the store; now it is read from the store itself.
      'ARCHIVE AS SHIPPED IN THIS BUILD: ' + forecastCaption() + '. Every settled bracket whose bars end before the first snapshot honestly produces NO trades for this strategy: it is a forward test by construction, and it stays unranked (0 trades, reason published) until the archive and the live markets overlap. ' +
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
      'WHAT THIS IS NOT: it uses NO external gold data (no COMEX, no LBMA fix, no TradingView) — the only input is the market\'s own price path, so it is a market-microstructure bet on early-leader persistence. ' +
      // COMPUTED sample size: grows with every ingest, so this sentence cannot
      // go stale (it said "8 settled contracts" as a literal before).
      'SAMPLE ON THIS BUILD: ' + classSampleCaption(STORE_FACTS_1M, ['KXGOLD15M']) + '.',
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
  },

  /* ════════════════════════════════════════════════════════════════════ *
   * 2026-09-18 (session 01a0b330) — UNIVERSE EXPANSION SET
   *
   * Every series named below was returned by the exchange itself in
   * scripts/discover-universe.mjs's capture of GET /series
   * (data/discovered/series-list.json, data/discovered/matches.json) — the
   * lifetime-volume figure quoted in each entry is that file's `volume_fp`
   * for the series, and the fee multiplier is its `fee_multiplier`. The
   * BARS come from scripts/ingest-history.mjs runs on a GitHub-hosted runner
   * (the build sandbox cannot open TLS to *.kalshi.com, IRREGULARITIES #4),
   * and every ingested market is finalized (`status: "all"` in
   * data/history/_ingest-request.json), so each strategy below is settled by
   * the exchange's own result rather than marked to a last quote.
   *
   * A strategy whose series has no bars yet reports itself UNRANKED with the
   * reason published (see runCompetition's skippedFlight path); it never
   * invents a 0% result.
   * ════════════════════════════════════════════════════════════════════ */

  {
    ...BASE,
    id: 'weather_ladder_multicity',
    username: 'WeatherLadder_MultiCity',
    handle: '@WeatherLadder_MultiCity',
    avatar: '🌎',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    // The eight highest-volume KXHIGH* series measured by the exchange's own
    // lifetime contract volume (data/discovered/matches.json, 2026-09-18).
    universe: ['KXHIGHNY', 'KXHIGHLAX', 'KXHIGHCHI', 'KXHIGHMIA', 'KXHIGHAUS', 'KXHIGHDEN', 'KXHIGHPHIL', 'KXHIGHTPHX', 'KXHIGHTSEA'],
    title: 'Multi-City Cheap Weather-Bracket Ladder',
    category: 'Weather / Ladder (multi-city)',
    tagline:
      'Buys the cheapest bracket of every ingested city every day and holds to the exchange result — the R03 ladder, replicated across eight real temperature markets instead of one.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from the r/PredictionsMarkets temperature-laddering thread (RESEARCH_SOURCES R03), generalised to every weather series the discovery run verified',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1s4n4wp/what_are_the_best_strategies_youve_seen_or_used/',
    sourceNote:
      'R03: "Laddering – buying multiple adjacent brackets cheap (like 2-15c) rather than picking one." The eight cities are the top of the 54 KXHIGH* series GET /series returned on 2026-09-18 (KXHIGHLAX 166,216,368 lifetime contracts; KXHIGHNY 144,574,090; KXHIGHCHI 110,129,301; KXHIGHMIA 98,546,964; KXHIGHAUS 77,183,792; KXHIGHDEN 50,834,860; KXHIGHPHIL 41,451,374; KXHIGHTPHX 16,776,008; KXHIGHTSEA 16,499,470 — data/discovered/matches.json). All carry fee_multiplier 1 (data/discovered/series-fees.json), i.e. the documented fee model is their real config.',
    thesis:
      'DESIGN INTENT: exactly one band per event can settle YES, so a ladder of cheap bands is a convexity bet whose cost is known at entry and whose payoff is the exchange\'s own $1.00. Running the same rule in eight cities multiplies the number of independent settlement events per day — the R03 mechanism, measured on real bars rather than asserted. ' +
      'HONEST LIMITS: (1) the ingested universe is the top-10 brackets per city BY EXCHANGE-REPORTED LIFETIME VOLUME, not the full board a live trader could buy, so this measures the idea on a sample; (2) entry timing is the bracket\'s own bar clock (its first hours), point-in-time by construction; (3) the strategy uses NO forecast — it is the multi-city version of the dumb-ladder control.',
    rules: {
      entry: 'Within the first 4 hourly bars of a bracket\'s life: buy YES when the YES ask ≤ 0.15, once per market.',
      sizing: '25% of available cash per rung, capped at 3x visible ask depth.',
      exit: 'None — hold to the exchange\'s real settlement (status=finalized, result yes/no → $1.00/$0.00, no settlement fee).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, periodIndex } = ctx;
      if (periodIndex > 3) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.15) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `multi-city ladder rung: hour ${periodIndex}, YES ask ${ask} ≤ 0.15 → hold to real settlement` }];
    }
  },

  {
    ...BASE,
    id: 'weather_favourite_decay',
    username: 'WeatherFavourite_Decay',
    handle: '@WeatherFavourite_Decay',
    avatar: '🔥',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXHIGHNY', 'KXHIGHLAX', 'KXHIGHCHI', 'KXHIGHMIA', 'KXHIGHAUS', 'KXHIGHDEN', 'KXHIGHPHIL', 'KXHIGHTPHX', 'KXHIGHTSEA'],
    title: 'Weather Favourite Longshot-Fader (buys the likely band, sells the tail)',
    category: 'Weather / Favourite–Longshot',
    tagline:
      'Buys the highest-priced band of a day\'s event once it is ≥ 0.60 — the band the market itself says is most likely — and takes the exchange result.',
    sizingPct: 0.35,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Favorite–longshot bias literature as recorded in RESEARCH_SOURCES R02/R06, applied to the weather brackets the discovery run verified',
    designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1tko1iw/i_backtested_500_weather_kalshi_bots_the_best_bot/',
    sourceNote:
      'R06 measured that weather bots which CONFIRM what the market already leans toward beat bots that fight it. This entry tests that claim with no external data at all: the only input is the market\'s own quoted ask.',
    thesis:
      'DESIGN INTENT: prediction-market favourites are historically under-priced relative to their true probability (the favourite–longshot bias), and a weather band that the market has already priced at ≥ 0.60 has survived the information flow of the day. Buying it and holding to the exchange\'s real settlement harvests that bias with a real, verifiable payout. ' +
      'HONEST LIMITS: the ingested universe is the top-10 brackets per city by exchange lifetime volume; the strategy cannot see the whole board, and it deliberately ignores any forecast, so it is directly comparable with ForecastEdge_Weather (NYC) and WeatherLadder_MultiCity (cheap tail) on the same bars.',
    rules: {
      entry: 'Buy YES when the YES ask is between 0.60 and 0.90, once per market, at any hour of the bracket\'s life.',
      sizing: '35% of available cash per confirmed favourite, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker } = ctx;
      const ask = book.getBestYesAsk();
      if (ask === null || ask < 0.6 || ask > 0.9) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `favourite band priced ${ask} (0.60–0.90) → hold to the exchange's real settlement` }];
    }
  },

  {
    ...BASE,
    id: 'sports_favourite_hold',
    username: 'SportsFavourite_Settle',
    handle: '@SportsFavourite_Settle',
    avatar: '🏟️',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXNFLGAME', 'KXMLBGAME', 'KXNBAGAME', 'KXNHLGAME', 'KXNCAAFGAME', 'KXWNBAGAME', 'KXUFCFIGHT'],
    title: 'Game-Line Favourite, Held to Settlement',
    category: 'Sports / Favourite–Longshot',
    tagline:
      'Buys the favourite of a real game market (YES ask 0.55–0.85) in its first traded hour and holds it to the exchange\'s own result.',
    sizingPct: 0.5,
    maxParticipation: 2,
    designedAt: '2026-09-18',
    designSource: 'Favourite–longshot bias (RESEARCH_SOURCES R02/R06 pattern) applied to the sports series the discovery run verified on 2026-09-18',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series',
    sourceNote:
      'The seven series here are the highest-volume game market classes GET /markets reported lifetime volume for on 2026-09-18: KXNBAGAME 11,676,027,344 contracts, KXMLBGAME 9,801,983,745, KXNFLGAME 6,010,901,748, KXNCAAFGAME 4,775,918,610, KXNHLGAME 1,567,230,249, KXUFCFIGHT 1,281,831,821, KXWNBAGAME 1,084,083,079 (data/discovered/matches.json). The MLB series carry the REAL fee multiplier 0.5 (data/discovered/series-fees.json) — half the taker fee of the others, applied per series by the fee engine.',
    thesis:
      'DESIGN INTENT: a game favourite is the cleanest favourite–longshot expression on the exchange: a liquid two-sided market with a published result within hours. The strategy buys ~0.55–0.85 and never sells, so it collects the settlement the exchange paid ($1.00 or $0.00) — no mark-to-market fiction, no early-exit discretion. ' +
      'HONEST LIMITS: (1) the ingested games are the top-8 by exchange lifetime volume per series and are mostly FINALIZED games (status=all), so the sample is a real but bounded set of settled events; (2) the strategy has NO external model — it never reads a score, an injury report or a line history, so it is a pure market-pricing bet and is labelled as such; (3) games trade in bursts, so fills are capped by the bar\'s real traded volume (10%) and by visible depth.',
    rules: {
      entry: 'In the market\'s first 3 hourly bars: buy YES when the YES ask is 0.55–0.85, once per market.',
      sizing: '50% of available cash, capped at 2x visible ask depth (game books are thinner than index books).',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, periodIndex } = ctx;
      if (periodIndex > 2) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask < 0.55 || ask > 0.85) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `game favourite at ${ask} in its first hours → hold to the exchange's real result` }];
    }
  },

  {
    ...BASE,
    id: 'sports_underdog_sweep',
    username: 'SportsUnderdog_Sweep',
    handle: '@SportsUnderdog_Sweep',
    avatar: '🎯',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXNFLGAME', 'KXMLBGAME', 'KXNBAGAME', 'KXNHLGAME', 'KXNCAAFGAME', 'KXWNBAGAME', 'KXUFCFIGHT'],
    title: 'Cheap-Underdog Convexity Sweep',
    category: 'Sports / Tail Convexity',
    tagline:
      'Buys every game-side priced at 0.08–0.25 and holds to the exchange result — the maximum-return convexity bet on real game markets.',
    sizingPct: 0.2,
    maxParticipation: 2,
    designedAt: '2026-09-18',
    designSource: 'Original design in this repository, built on the sports series the discovery run verified (data/discovered/matches.json)',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-markets',
    sourceNote:
      'No external tipster, model or social-media source was used: the rule is a pure price-band rule on the market\'s own quoted ask, and the payoff is the exchange\'s own settled result. The series list and volumes come from the 2026-09-18 GET /series capture.',
    thesis:
      'DESIGN INTENT: a 0.10 contract pays 10x when it wins. The mandate is highest return with no risk management, so this entry buys the convex tail across EVERY ingested game market rather than picking one — the whole point is that a single winner pays for many losers. ' +
      'HONEST LIMITS: this is the design the longshot-bias literature says should LOSE on average (RESEARCH_SOURCES R02), which is exactly why it is in the roster: it is the falsifiable control for SportsFavourite_Settle. Both are settled on the same real results, so the comparison is measured, not argued. The 0.5 fee multiplier on MLB series applies.',
    rules: {
      entry: 'At any hour: buy YES when the YES ask is 0.08–0.25, once per market (a sweep across the whole ingested slate).',
      sizing: '20% of available cash per leg, capped at 2x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker } = ctx;
      const ask = book.getBestYesAsk();
      if (ask === null || ask < 0.08 || ask > 0.25) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `cheap underdog at ${ask} → convexity leg, settled by the exchange's own result` }];
    }
  },

  {
    ...BASE,
    id: 'sports_line_momentum',
    username: 'SportsLine_Momentum',
    handle: '@SportsLine_Momentum',
    avatar: '📈',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXNFLGAME', 'KXMLBGAME', 'KXNBAGAME', 'KXNHLGAME', 'KXNCAAFGAME', 'KXWNBAGAME', 'KXUFCFIGHT'],
    title: 'In-Play Line-Move Follower',
    category: 'Sports / Momentum',
    tagline:
      'When a game market re-prices upward between two real hourly bars, buys the side that moved and holds it to the exchange result.',
    sizingPct: 0.4,
    maxParticipation: 2,
    designedAt: '2026-09-18',
    designSource: 'Original design in this repository (momentum family, R01/R07 "trade the repricing" reading), on the verified sports series',
    designSourceUrl: 'https://www.botforkalshi.com/blog/kalshi-trading-strategies-guide',
    sourceNote:
      'The rule reads only the market\'s own bar-over-bar moves: previous close vs current close. No score feed, no injury feed and no external model is used, so nothing here depends on data this repository has not captured.',
    thesis:
      'DESIGN INTENT: in-play game lines re-price as the game unfolds; a sustained upward re-pricing is the market discovering news, and following it (rather than fading it) is the momentum hypothesis in its cheapest form. The position is held to the exchange result, so the payoff is settled cash rather than a mark. ' +
      'HONEST LIMIT: hourly bars are coarse for a game that lives ~3 hours, so the "momentum" this measures is a per-hour re-pricing, not a tick-by-tick move; the post-mortem reports how many legs actually fired.',
    rules: {
      entry: 'Buy YES when this bar\'s close exceeds the previous bar\'s close by ≥ 0.05 AND the current ask ≤ 0.80, once per market.',
      sizing: '40% of available cash, capped at 2x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const prev = history.length >= 2 ? history[history.length - 2].trade.close : null;
      if (prev === null || prev === undefined) return [];
      if (!(close - prev >= 0.05)) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.8) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `line moved +${round6(close - prev)} bar-over-bar (${prev} → ${close}), ask ${ask} → follow to settlement` }];
    }
  },

  {
    ...BASE,
    id: 'sports_steam_fade',
    username: 'SportsSteam_Fade',
    handle: '@SportsSteam_Fade',
    avatar: '🧊',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXNFLGAME', 'KXMLBGAME', 'KXNBAGAME', 'KXNHLGAME', 'KXNCAAFGAME', 'KXWNBAGAME', 'KXUFCFIGHT'],
    title: 'Steam Fader (buys the side the market just dumped)',
    category: 'Sports / Mean Reversion',
    tagline:
      'Buys the side of a game market that fell ≥ 0.15 in one hour, betting the in-play overreaction mean-reverts before settlement.',
    sizingPct: 0.3,
    maxParticipation: 2,
    designedAt: '2026-09-18',
    designSource: 'Original design in this repository (panic-fade family, RESEARCH_SOURCES R01/R07), on the verified sports series',
    designSourceUrl: 'https://www.botforkalshi.com/blog/kalshi-trading-strategies-guide',
    sourceNote:
      'The panic-fade family is the most-reported retail pattern in the research ledger (R01: buy the dump, sell the bounce). This entry applies it to game markets, where the dump is an in-play event and the exit is the exchange\'s own result.',
    thesis:
      'DESIGN INTENT: an in-play collapse of 15 cents in one hour is usually real news (a score) — but the R01 source argues these moves overshoot. Buying the dumped side at a discount and holding to settlement is the direct test: if the move was news, the leg loses $1.00; if it overshot, the bounce is settled in cash. ' +
      'HONEST LIMIT: the literature is split on this rule (R06 found fighting the market was the LOSING family in weather), which is why it is measured here on the same bars as the momentum entry — the pair is a controlled test of "fade vs follow" on identical data.',
    rules: {
      entry: 'Buy YES when this bar\'s close is ≥ 0.15 below the previous bar\'s close AND the current ask ≤ 0.60, once per market.',
      sizing: '30% of available cash, capped at 2x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const prev = history.length >= 2 ? history[history.length - 2].trade.close : null;
      if (prev === null || prev === undefined) return [];
      if (!(prev - close >= 0.15)) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.6) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `the market dumped this side ${round6(prev - close)} in one bar (${prev} → ${close}) → fade it to settlement` }];
    }
  },

  {
    ...BASE,
    id: 'crypto15m_early_leader',
    username: 'Crypto15M_EarlyLeader',
    handle: '@Crypto15M_EarlyLeader',
    avatar: '⚡',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXBTC15M', 'KXETH15M', 'KXSOL15M'],
    title: '15-Minute Crypto Early-Leader Ride (BTC · ETH · SOL)',
    category: 'Crypto / Short-Horizon Momentum',
    tagline:
      'On 1-minute bars, buys whichever side a 15-minute crypto market says is winning after five minutes and rides it to the exchange result.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'The same design as GoldBracket_EarlyLeader, run on the three highest-volume 15-minute crypto series the discovery run verified',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series',
    sourceNote:
      'KXBTC15M (18,154,658,182 lifetime contracts), KXETH15M (972,223,912) and KXSOL15M (346,881,317) are the three largest 15-minute crypto series in the 2026-09-18 GET /series capture (data/discovered/matches.json). All three carry fee_multiplier 1 (data/discovered/series-fees.json). The strategy reads ONLY the market\'s own quoted prices — no exchange feed, no spot price, no external data.',
    thesis:
      'DESIGN INTENT: a 15-minute up/down contract that is already trading at 0.55+ five minutes in has revealed where the underlying went; the remaining ten minutes usually confirm. Three markets mean three times the settlement events per day compared with the gold-only version. ' +
      'HONEST LIMIT: this measures early-leader PERSISTENCE, not any view on crypto. If the market\'s five-minute read were noise, the strategy loses; the ledger records every leg so the answer is measurable rather than asserted.',
    rules: {
      entry: 'Bars 0–4 of the contract: close ≥ 0.55 → buy YES; close ≤ 0.45 → buy NO. Once per market.',
      sizing: '50% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
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
      return [{ type: 'buy', side, count, reason: `early leader: minute ${periodIndex} close ${close} → buy ${side} at ${ask}, ride to the exchange's real settlement` }];
    }
  },

  {
    ...BASE,
    id: 'crypto15m_cheap_tail',
    username: 'Crypto15M_CheapTail',
    handle: '@Crypto15M_CheapTail',
    avatar: '🎲',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXBTC15M', 'KXETH15M', 'KXSOL15M'],
    title: '15-Minute Crypto Cheap-Tail Buyer',
    category: 'Crypto / Tail Convexity',
    tagline:
      'With five minutes left, buys the side the market has priced at ≤ 0.15 — a 6x+ payoff if the last minutes move — and settles on the exchange result.',
    sizingPct: 0.15,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Original design in this repository, on the real 15-minute crypto series verified by the discovery run',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-markets',
    sourceNote:
      'The convexity band is taken from the market\'s own quoted ask; the payout is the exchange\'s settled result. No external price feed is consulted, so the entry cannot be contaminated by lookahead in a spot series.',
    thesis:
      'DESIGN INTENT: the last five minutes of a 15-minute contract are the most volatile window in the whole market, and the losing side is priced accordingly. Buying the 0.10–0.15 tail repeatedly across three crypto markets is the maximum-return way to own that volatility — each leg risks pennies to make dollars, and the mandate explicitly forbids risk management. ' +
      'HONEST LIMIT: this is a negative-expectation bet under most probability models, and the roster says so; it is present because it is the convexity control for the early-leader entry, and its ledger will show exactly how often a tail actually paid.',
    rules: {
      entry: 'Bars 10–14 of the contract (the last five minutes): buy YES when the YES ask ≤ 0.15; buy NO when the NO ask ≤ 0.15. Once per market.',
      sizing: '15% of available cash per tail, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker, periodIndex, periodCount } = ctx;
      const nearEnd = periodCount ? periodIndex >= periodCount - 5 : periodIndex >= 10;
      if (!nearEnd) return [];
      if (candle.trade.close === null) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const yesAsk = book.getBestYesAsk();
      const noAsk = book.getBestNoAsk();
      let side = null;
      let ask = null;
      if (yesAsk !== null && yesAsk <= 0.15) {
        side = 'YES';
        ask = yesAsk;
      } else if (noAsk !== null && noAsk <= 0.15) {
        side = 'NO';
        ask = noAsk;
      }
      if (!side) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [{ type: 'buy', side, count, reason: `last five minutes, ${side} offered at ${ask} ≤ 0.15 → cheap tail, settled by the exchange` }];
    }
  },

  {
    ...BASE,
    id: 'highprob_scalp8095',
    username: 'HighProb_Scalp8095',
    handle: '@HighProb_Scalp8095',
    avatar: '🎯',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXBTC15M', 'KXETH15M', 'KXSOL15M', 'KXGOLD15M'],
    title: '75–80¢ High-Probability Scalp with a 95¢ Take-Profit (R15)',
    category: 'Short-Horizon / High-probability scalp',
    tagline:
      'Buys the side the market prices at 75–80¢ and takes profit at 95¢ — the r/KalshiBTCUporDown15 pinned write-up, recreated mechanically on the real 1-minute stores.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-19',
    designSource: 'Recreated from the r/KalshiBTCUporDown15 pinned strategy write-up (RESEARCH_SOURCES R15)',
    designSourceUrl: 'https://www.reddit.com/r/KalshiBTCUporDown15/',
    sourceNote:
      'The source\'s two mechanical rules, quoted in R15: "I wait until one side has reached 80% market probability. If I feel there is good value at 75-80 cents, I invest ' +
      'then … I immediately set a take profit limit order for 95 cents" and "exit with 15-20 cents profit as soon and as often as possible". Both are contract-price rules, ' +
      'so they map one-to-one onto the real captured bid/ask of the 1-minute bars. The discretionary value filter and the BITCOIN-price stop-loss are NOT recreated (no ' +
      'human judgement and no BTC spot feed exist in this store) and the entry says so.',
    thesis:
      'DESIGN INTENT: buying an 75–80¢ favourite and selling at 95¢ converts 15–20¢ of high-probability drift into cash repeatedly; on a 15-minute contract the remaining ' +
      '5–25¢ is the residual probability of an upset the market says is small. The recreation takes EVERY mechanical 75–80¢ occurrence across four real 15-minute series ' +
      'and exits at the source\'s 95¢ target or at the exchange\'s own settlement. ' +
      'HONEST LIMITS: (1) the source\'s discretionary filter ("IF I FEEL there is good value") cannot be recreated — this entry trades the rule, not the judgement, and the ' +
      'measured result is therefore the rule\'s unfiltered expectancy; (2) the source\'s stop-loss is a BTC spot level and this store holds no spot feed, so a position that ' +
      'never reaches 0.95 rides to the real $1.00/$0.00 result (the losing tail the stop was meant to cut is reported in the ledger instead); (3) the source names no ' +
      'position size — the 25%-of-cash fraction is this repository\'s choice, labelled here.',
    rules: {
      entry: 'On 1-minute bars: buy YES when the YES ask is 0.75–0.80; otherwise buy NO when the NO ask is 0.75–0.80. Enter whenever flat in the contract — the source re-enters "as often as possible".',
      sizing: '25% of available cash, capped at 3x visible depth (repo-assigned; the source names no size).',
      exit: 'Sell when the position\'s mark reaches 0.95 (the source\'s take-profit limit); otherwise hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate). The source\'s stop-loss is a BTC price level this store cannot see; it is deliberately NOT simulated with an invented feed.'
    },
    decide(ctx) {
      const { book, portfolio, ticker } = ctx;
      const actions = [];
      // EXIT — the source's 95¢ take-profit. The mark is the real quoted price;
      // the sell itself is filled with the replay's usual fill realism.
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ticker || !(pos.count > 0)) continue;
        const mark = Number(pos.currentPrice);
        if (Number.isFinite(mark) && mark >= 0.95) {
          actions.push({ type: 'sell', side: pos.side, count: pos.count, reason: `take-profit 0.95 (R15): position marked ${round6(mark)}` });
        }
      }
      // ENTRY — the high-probability side at 75–80¢, only while flat here.
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (!held) {
        const yesAsk = book.getBestYesAsk();
        const noAsk = book.getBestNoAsk();
        let side = null;
        let ask = null;
        if (yesAsk !== null && yesAsk >= 0.75 && yesAsk <= 0.8) {
          side = 'YES';
          ask = yesAsk;
        } else if (noAsk !== null && noAsk >= 0.75 && noAsk <= 0.8) {
          side = 'NO';
          ask = noAsk;
        }
        if (side) {
          const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
          if (count > 0) {
            actions.push({ type: 'buy', side, count, reason: `${side} offered at ${ask} — inside the source's 75–80¢ band; 95¢ take-profit set (R15)` });
          }
        }
      }
      return actions;
    }
  },

  {
    ...BASE,
    id: 'fed_bucket_ladder',
    username: 'FedBucket_Ladder',
    handle: '@FedBucket_Ladder',
    avatar: '🏛️',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXFEDDECISION'],
    title: 'Fed-Decision Bucket Ladder',
    category: 'Macro / Event Ladder',
    tagline:
      'Buys the cheap buckets of a Fed meeting event and holds to the exchange\'s real result — the same ladder mechanism, on a published official number.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Original design in this repository, on the Fed series the discovery run verified (611,697,574 lifetime contracts)',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series',
    sourceNote:
      'KXFEDDECISION is the largest macro series GET /series returned on 2026-09-18 (611,697,574 lifetime contracts, fee_multiplier 1). Its buckets are mutually exclusive and exhaustive — exactly one settles yes — which is the property the ladder needs; the rules text captured with each market names the settlement source.',
    thesis:
      'DESIGN INTENT: a mutually-exclusive bucket set is the cleanest ladder on the exchange: one bucket must settle at $1.00. Buying every bucket that the market prices cheaply (≤ 0.20) before the meeting converts a low-probability-per-bucket spread into a guaranteed single payout when the whole set is bought — and the exchange\'s own result books it. ' +
      'HONEST LIMIT: the ingested universe is the top-8 KXFEDDECISION markets by exchange lifetime volume, so a "full set" here means every ingested bucket, not necessarily every bucket the event listed; the post-mortem reports how many legs fired and what they cost.',
    rules: {
      entry: 'Buy YES when the YES ask ≤ 0.20, once per market (a ladder across the ingested buckets).',
      sizing: '25% of available cash per bucket, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker } = ctx;
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.2) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `Fed bucket offered at ${ask} ≤ 0.20 → ladder leg, held to the exchange's real result` }];
    }
  },

  {
    ...BASE,
    id: 'cpi_print_fade',
    username: 'CPI_PrintFade',
    handle: '@CPI_PrintFade',
    avatar: '📊',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXCPIYOY'],
    title: 'CPI-Print Panic Fade',
    category: 'Macro / Mean Reversion',
    tagline:
      'When an inflation market dumps ≥ 0.15 in one hour, buys the dumped side and holds it to the official BLS result.',
    sizingPct: 0.3,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'The panic-fade reading of RESEARCH_SOURCES R01/R07, applied to the inflation series the discovery run verified',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series',
    sourceNote:
      'KXCPIYOY (36,140,966 lifetime contracts, fee_multiplier 1 in the 2026-09-18 GET /series capture) settles on the Bureau of Labor Statistics release, an official and unambiguous number. The strategy reads only the market\'s own bars.',
    thesis:
      'DESIGN INTENT: inflation markets are thin and event-driven; a one-hour 15-cent collapse is usually positioning ahead of a print rather than information, and the R01 pattern (buy the dump) is directly testable on a market whose settlement is a government statistic. ' +
      'HONEST LIMIT: the ingested KXCPIYOY markets are the top-8 by lifetime volume, and CPI prints are monthly, so the sample grows slowly — the ledger reports the traded count so the reader can judge whether the result is informative yet.',
    rules: {
      entry: 'Buy YES when this bar\'s close is ≥ 0.15 below the previous bar\'s close AND the current ask ≤ 0.60, once per market.',
      sizing: '30% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement (BLS release).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history, book, portfolio, ticker } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const prev = history.length >= 2 ? history[history.length - 2].trade.close : null;
      if (prev === null || prev === undefined) return [];
      if (!(prev - close >= 0.15)) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.6) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [{ type: 'buy', side: 'YES', count, reason: `CPI market dumped ${round6(prev - close)} in one bar → fade it to the official BLS settlement` }];
    }
  }
,
  /* ------------------------------------------------------------------ *
   * FDA + CEO SET (2026-09-18, request 8)
   *
   * These two families are named in the project brief ("FDA Decisions Drug
   * Analysis" and "CEO"), and until request 8 the store held no bars for
   * either — so a strategy would have been a design with nothing to trade.
   * The ingest job has now captured them from the official candlesticks
   * endpoint, WITH the exchange's own results on the markets that have
   * already finalized. Both entries read only those bars.
   *
   * The sample sizes in the text below are COMPUTED from the loaded store
   * (classSampleCaption), so they follow the data instead of going stale.
   * ------------------------------------------------------------------ */

  {
    ...BASE,
    id: 'fda_ladder_dominance',
    username: 'FDALadder_Dominance',
    handle: '@FDALadder_Dominance',
    avatar: '💊',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXFDARETATRUTIDE', 'KXFDAAPPROVALDATECMPS', 'KXFDAANNOUNCE'],
    title: 'FDA Cumulative-Ladder Dominance',
    category: 'FDA / No-Arbitrage Ladder',
    tagline:
      'Inside one FDA event, a "before <later date>" contract must be worth at least as much as the "before <earlier date>" contract. When the later one is offered cheaper than the earlier one bids, buy the later one and hold it to the FDA result.',
    sizingPct: 0.35,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Original design on the FDA cumulative-date ladders captured by request 8 (series returned by GET /series with lifetime volume in data/discovered/series-fees.json)',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    sourceNote:
      'Every leg of this strategy is read from the exchange\'s own contract rules. Example, captured verbatim with the market object in data/history/KXFDARETATRUTIDE-RET-27JAN01.json: "If the FDA approves retatrutide (LY3437943) for marketing before Jan 1, 2027, then the market resolves to Yes." The Jul 1, 2027 bucket of the same event carries the same sentence with a later date. An approval before Jan 1 2027 therefore settles BOTH yes, which is what makes the later contract dominate.',
    thesis:
      'DESIGN INTENT: the dominance relation is not a forecast, it is arithmetic on the contract wording. If the earlier contract can be sold at 0.42 while the later one can be bought at 0.35, buying the later one costs 7c less for a claim that pays in every state where the earlier one pays — so the trade needs no view on the FDA at all. ' +
      'COMPUTED SAMPLE (from the store on this build): ' + classSampleCaption(STORE_FACTS_DAILY, ['KXFDARETATRUTIDE', 'KXFDAAPPROVALDATECMPS', 'KXFDAANNOUNCE']) + '. ' +
      'HONEST LIMITS, stated up front: (1) the two legs are quoted in different markets, so the entry is a single-legged buy of the cheap contract rather than a true two-legged arbitrage — the simulator cannot short the rich leg, and the ledger says so on every row; (2) an FDA approval is a binary event, so the strategy concentrates rather than diversifies, which is acceptable only because the mandate is highest return, not risk-adjusted return; (3) the dominance argument assumes both markets settle on the same underlying approval, which the rules text confirms for the ingested events.',
    rules: {
      entry:
        'BUY YES on the LATER-dated contract of the same event only when its ask is at least 3c BELOW the earlier contract\'s YES bid (a dominance violation), once per market.',
      sizing: '35% of available cash per leg, capped at 3x visible depth.',
      exit: 'None — held to the exchange\'s real FDA settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, books, market, allMarkets, portfolio, ticker } = ctx;
      if (!book || !market) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask <= 0 || ask > 0.98) return [];
      const rules = String(market.rules_primary || market.rules || '');
      // Only cumulative "before <date>" contracts have the dominance relation.
      if (!/\bbefore\b/i.test(rules)) return [];
      const mineClose = Date.parse(market.close_time || '');
      if (!Number.isFinite(mineClose)) return [];
      const siblings = (allMarkets || []).filter(
        (m) => m && m.ticker !== ticker && m.event_ticker && m.event_ticker === market.event_ticker
      );
      if (!siblings.length) return [];
      let trigger = null;
      for (const sib of siblings) {
        if (!/\bbefore\b/i.test(String(sib.rules_primary || sib.rules || ''))) continue;
        const sibClose = Date.parse(sib.close_time || '');
        // The sibling must settle EARLIER: its YES implies this market's YES.
        if (!Number.isFinite(sibClose) || sibClose >= mineClose) continue;
        const sibBook = books ? books[sib.ticker] : null;
        if (!sibBook || typeof sibBook.getBestYesBid !== 'function') continue;
        const sibBid = sibBook.getBestYesBid();
        if (sibBid === null) continue;
        const edge = round6Local(sibBid - ask);
        if (edge >= MIN_DOMINANCE_EDGE) {
          trigger = { ticker: sib.ticker, bid: sibBid, edge, closes: sib.close_time };
          break;
        }
      }
      if (!trigger) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason:
            `dominance violation: this contract (settles ${String(market.close_time).slice(0, 10)}) offered at ${ask.toFixed(2)} ` +
            `while the earlier contract ${trigger.ticker} bids ${trigger.bid.toFixed(2)} (edge ${trigger.edge.toFixed(2)}) — ` +
            `the earlier contract settling yes forces this one yes, so the cheaper claim is bought and held to settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'ceo_exit_drift',
    username: 'CEOExit_Drift',
    handle: '@CEOExit_Drift',
    avatar: '🏢',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXAAPLCEOCHANGE', 'TESLACEOCHANGE', 'KXOPENAICEOCHANGE'],
    title: 'CEO-Exit News Drift',
    category: 'CEO / Event Drift',
    tagline:
      'Buys YES on a "leaves as CEO before <date>" market once its price has advanced at least 15c off its own 20-bar low, and holds it to the exchange\'s real result.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Original design on the CEO-succession series captured by request 8 (KXAAPLCEOCHANGE 587,863 and KXTESLACEOCHANGE 512,304 lifetime contracts in the 2026-09-18 GET /series capture)',
    designSourceUrl: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    sourceNote:
      'The rules text travels with every market in the store. Captured verbatim: KXAAPLCEOCHANGE-26 — "If Tim Cook is no longer CEO of Apple before Jan 1, 2027, then the market resolves to Yes." (the exchange finalized this market YES); TESLACEOCHANGE-26 — "If Elon Musk is no longer CEO of Tesla by Dec 31, 2026, then the market resolves to Yes." These are event markets whose information arrives in discrete news bursts, which is the mechanism the drift rule tries to capture.',
    thesis:
      'DESIGN INTENT: corporate-succession news arrives in bursts, and a market that has already re-rated 15c off its own low is the observable trace of that arrival — the rule buys the re-rating rather than trying to predict the news. It is a momentum rule with a settlement-priced endpoint, so the outcome is measured, not argued. ' +
      'COMPUTED SAMPLE (from the store on this build): ' + classSampleCaption(STORE_FACTS_DAILY, ['KXAAPLCEOCHANGE', 'TESLACEOCHANGE', 'KXOPENAICEOCHANGE']) + '. ' +
      'HONEST LIMITS: this is the smallest sample in the roster — 3 markets, one of which the exchange has already finalized (KXAAPLCEOCHANGE yes) — so the result is an observation with a wide error bar, not a validated edge. KXTESLACEOCHANGE-26 was ingested with zero traded bars (the exchange reported no volume) and is therefore untradeable here; it stays in the store as evidence rather than being quietly dropped.',
    rules: {
      entry:
        'BUY YES when the bar close is at least 0.15 above the 20-bar low AND the close is between 0.20 and 0.90, once per market.',
      sizing: '50% of available cash, capped at 3x visible depth.',
      exit: 'None — held to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, history, portfolio, ticker } = ctx;
      if (!candle || !candle.trade || !book) return [];
      const close = candle.trade.close;
      if (typeof close !== 'number') return [];
      const bars = Array.isArray(history) ? history : [];
      if (bars.length < 20) return [];
      const lows = bars
        .slice(-20)
        .map((b) => (b && b.trade ? b.trade.low : null))
        .filter((v) => typeof v === 'number');
      if (!lows.length) return [];
      const low = Math.min(...lows);
      const advance = round6Local(close - low);
      if (advance < 0.15) return [];
      if (close < 0.2 || close > 0.9) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason:
            `succession drift: close ${close.toFixed(2)} is ${advance.toFixed(2)} above the 20-bar low ${low.toFixed(2)} ` +
            `— buying the burst and holding to the exchange's real result`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'forecast_edge_multicity',
    username: 'ForecastEdge_MultiCity',
    handle: '@ForecastEdge_MultiCity',
    avatar: '🛰️',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXHIGHNY', 'KXHIGHLAX', 'KXHIGHCHI', 'KXHIGHMIA', 'KXHIGHAUS', 'KXHIGHDEN', 'KXHIGHPHIL', 'KXHIGHTPHX', 'KXHIGHTSEA'],
    title: 'Multi-City Point-in-Time Forecast Confirmation',
    category: 'Weather / Model vs Market (multi-city)',
    tagline:
      'The single-city forecast-confirmation rule, run across every archived city at once so that each independent NWS point forecast is a separate, point-in-time test.',
    sizingPct: 0.35,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource:
      'Generalisation of the R06 winner pattern (weather-model confirmation) across the 9 cities this repository archives; the archive is grown by .github/workflows/weather-signals.yml',
    designSourceUrl: 'https://api.weather.gov/',
    sourceNote:
      'The signal is the official NWS gridded point forecast, archived point-in-time by scripts/archive-forecasts.mjs at https://api.weather.gov/points/{lat},{lon}. Each location is a published reporting site (the city airport, where the official climate record is kept): KXHIGHLAX 33.9425,-118.4081; KXHIGHCHI 41.9786,-87.9048; KXHIGHMIA 25.7959,-80.2870; KXHIGHAUS 30.1975,-97.6664; KXHIGHDEN 39.8561,-104.6737; KXHIGHPHIL 39.8729,-75.2437; KXHIGHTPHX 33.4342,-112.0116; KXHIGHTSEA 47.4502,-122.3088, plus the original Central Park point. The coordinates are CLAIMS until the workflow resolves them and writes the NWS identity (grid office, grid x/y, forecast zone) into data/forecasts/<key>.json — an unresolvable point fails the capture and stores nothing.',
    thesis:
      'DESIGN INTENT: the single-city entry proves the mechanism once; this entry multiplies the number of independent settlement events per day by the number of archived cities, which is the only honest way to find out whether a weather edge survives a bigger sample. It reads ctx.signal exactly as the single-city entry does — a snapshot captured at or before the decision bar, or nothing. ' +
      'COMPUTED ARCHIVE COVERAGE (this build): ' + forecastCaption() + '. ' +
      'WHERE THE SAMPLE COMES FROM: each city\'s archive begins when the weather-signals workflow first captures it; only markets still trading after that instant can trade here, and every earlier bracket abstains. ' +
      'HONEST LIMITS, stated up front: (1) the settlement source is The Weather Company\'s city observation while the signal is an NWS point forecast — different providers, so the strategy is measuring a real basis mismatch, not a synthetic one (IRREGULARITIES.md #34); (2) an entry is only possible while a bracket is trading, so a city whose brackets all settle intraday contributes few decisions; (3) the coordinates for the eight added cities were supplied by this build and are marked PENDING until the workflow resolves them — a wrong point would trade a real but different city, which is why the resolved identity is written into the store and shown on the site.',
    rules: {
      entry:
        'ctx.signal carries the newest NWS forecast high F for THIS city, captured at or before this bar. Buy YES when the bracket contains F (band: F ∈ [floor-1, cap+1]; lower tail: F ≤ cap-2) and the ask ≤ 0.40, once per market.',
      sizing: '35% of available cash per confirmed bracket, capped at 3x visible ask depth.',
      exit: "None — hold to the exchange's real settlement.",
      noSignalRule: 'signal === null (no snapshot for this city captured by this bar) → abstain. The current forecast is never substituted for a past decision.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, market, signal } = ctx;
      if (!signal || signal.kind !== 'nws-forecast-high') return [];
      const f = Number(signal.highF);
      if (!Number.isFinite(f)) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.4) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const floor = Number(market.floor_strike);
      const cap = Number(market.cap_strike);
      let confirmed = false;
      let why = '';
      if (Number.isFinite(floor) && Number.isFinite(cap)) {
        confirmed = f >= floor - 1 && f <= cap + 1;
        why = `NWS high ${f}F inside bracket ${floor}-${cap}`;
      } else if (Number.isFinite(cap)) {
        confirmed = f <= cap - 2;
        why = `NWS high ${f}F at or below the ${cap} tail threshold`;
      }
      if (!confirmed) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `${why} (snapshot ${signal.capturedAt} for ${signal.eventDate}, captured before this bar) → ask ${ask} ≤ 0.40, held to the exchange's real result`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'fda_edge_drugsfda',
    username: 'FDAEdge_DrugsFDA',
    handle: '@FDAEdge_DrugsFDA',
    avatar: '💊',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXFDAAPPROVALDATECMPS', 'KXFDARETATRUTIDE', 'KXFDAAPPROVE'],
    title: 'Drugs@FDA Approval-Record Follower (point-in-time)',
    category: 'FDA / Official-record vs Market',
    tagline:
      'Buys a tracked FDA-approval market\'s YES when the official Drugs@FDA record — captured point-in-time by the fda-signals workflow — shows an approved product and the market still prices it at ≤ 0.97. Abstains whenever no snapshot existed at the decision bar.',
    sizingPct: 0.4,
    maxParticipation: 3,
    designedAt: '2026-09-19',
    designSource:
      'Original design in this repository: the point-in-time external-signal architecture of ForecastEdge_Weather (NWS archive) applied to the official openFDA Drugs@FDA database (data/fda-signals/, grown by .github/workflows/fda-signals.yml)',
    designSourceUrl: 'https://open.fda.gov/apis/drug/drugsfda/',
    sourceNote:
      'The signal source is FDA\'s own database: GET api.fda.gov/drug/drugsfda.json (Drugs@FDA). Each tracked market\'s subject and search query are taken from the market\'s OWN rules_primary text (quoted in scripts/archive-fda-signals.mjs). KXFDAANNOUNCE (BPC-157 Bulk Drug Substances reclassification — an announcement, not an application record) and KXFDAAPPROVALPSYCHEDELIC (a composite) are deliberately NOT covered; the exclusions and their reasons are recorded in the archive script.',
    thesis:
      'DESIGN INTENT: when FDA\'s own database shows an approved marketed product for a drug whose Kalshi approval markets are still open below 99¢, the market is lagging the official record — buy YES and let the exchange\'s own settlement pay $1.00. ' +
      'POINT-IN-TIME RULE: the record is read through src/fda-signal-store.js, which only returns a snapshot captured at or before the decision bar — no snapshot, no trade. ' +
      'FORWARD TEST BY CONSTRUCTION: the archive begins with the first scheduled capture after 2026-09-19, so every bar before that honestly produces NO trades for this strategy; it stays unranked (0 fills, reason published) until an approval flip overlaps a live market. The still-open targets are the 2027+ COMP360 and retatrutide brackets and KXFDAAPPROVE-CYT-26OCT01. ' +
      'BASIS MISMATCH (flagged): the market rules resolve on the FDA\'s approval/announcement, while this archive holds the Drugs@FDA database record, which FDA staff update after the fact — a real lag the archive timestamps and the strategy prices (entry ≤ 0.97) rather than hides.',
    rules: {
      entry:
        'ctx.signal carries the newest Drugs@FDA state for this market\'s drug captured at or before this bar. Buy YES when signal.approved is true (any product\'s verbatim marketing_status contains "approved") and the YES ask ≤ 0.97. Once per market.',
      sizing: '40% of available cash per confirmed market, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00 at the market\'s real result).',
      noSignalRule: 'ctx.signal === null (no snapshot captured by this bar, or the market is one of the deliberately excluded series) → abstain. Never substitute today\'s database state for a past decision.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, signal } = ctx;
      if (!signal || signal.kind !== 'fda-drugsfda-state') return [];
      if (!signal.approved) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > 0.97) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `Drugs@FDA snapshot ${signal.capturedAt} shows an approved marketed product for ${signal.label ?? signal.slug} (state ${signal.state}) while the market still prices ${ask} ≤ 0.97 — buy YES, held to the exchange's real result`
        }
      ];
    }
  },

  /* ════════════════════════════════════════════════════════════════════ *
   * 2026-09-18 (session 01a0b59b) — RECREATED FROM THE OWNER'S OWN
   * PriceKalshiHistorical REFERENCE STRATEGIES (RESEARCH_SOURCES R14)
   *
   * The sibling project github.com/buffedlizard55-lab/PriceKalshiHistorical
   * ships a book-walking backtester with three reference strategies
   * (backtest/strategy_example.py): `mee`, `fade`, `mom`. All three are
   * recreated below on THIS repository's verified bars. Each entry states
   * exactly where the granularity of this store forced an adaptation —
   * the source ran on its own 5s/15s snapshot database, this store holds
   * official candlesticks at 60m (hourly flight) and 1m (micro flight).
   * ════════════════════════════════════════════════════════════════════ */

  {
    ...BASE,
    id: 'mee_board_sum',
    username: 'MEE_BoardSum',
    handle: '@MEE_BoardSum',
    avatar: '🎯',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXHIGHNY', 'KXBTCY'],
    title: 'Mutually-Exclusive-Event Board Sum (R14 `mee`)',
    category: 'Cross-market / Board mean reversion',
    tagline:
      'When the YES asks of one event\'s whole bracket board sum to ≤ 0.975, buys the cheapest leg; when the bids sum to ≥ 1.025, buys NO on the richest leg — the sibling collector project\'s `mee` reference strategy, recreated on real boards.',
    sizingPct: 0.4,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from PriceKalshiHistorical backtest/strategy_example.py strategy `mee` (RESEARCH_SOURCES R14) — the owner\'s own Kalshi collector/backtester project',
    designSourceUrl: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
    sourceNote:
      'R14 `mee`: "|Σ mids -1|>2.5¢ on mutually_exclusive events → Buy cheapest / sell richest leg. Pure cross-market mean reversion." Both universes are verified mutually-exclusive boards from the exchange\'s own market objects: KXHIGHNY brackets ("Will the maximum temperature be 87-88°…", "<85°" tails) and KXBTCY strike_type between/greater ranges ("45,000 to 49,999.99", "150,000 or above" — data/history/intraday/60m/*.json market.yes_sub_title, market.strike_type).',
    thesis:
      'DESIGN INTENT: exactly one band of a mutually-exclusive board settles $1.00, so the asks of the whole board should sum to ≈ 1.00; a sum visibly below (above) 1 means the board is collectively under-(over-)priced, and the cheapest (richest) leg carries the most extreme mispricing. This entry recreates the sibling project\'s `mee` rule on the real captured boards, using each band\'s REAL hourly YES ask/bid quotes. ' +
      'HONEST LIMITS: (1) the trigger uses ASK (bid) sums, not the source\'s mid sum, because a replay can only buy at the ask — a strictly harder threshold than the original; ' +
      '(2) the ingested board is the SAMPLE the store holds (top brackets by exchange lifetime volume), not the full board a live trader could see, so a cheap sum does NOT make the position risk-free — the band that actually settles may be one the store never ingested, and the position is a bet, not an arb; ' +
      '(3) sibling quotes are read point-in-time (historyAll at the current bar, staleness-guarded to 3 hours) but different bands\' hourly bars can end within the same hour, so the "board" is the freshest snapshot each band had, not one atomic timestamp; ' +
      '(4) the taker fee is paid on every leg at each series\' real captured fee multiplier (KXBTCY 0, KXHIGHNY 1 — data/discovered/series-fees.json).',
    rules: {
      entry:
        'Per event (series + date prefix of the ticker): collect every sibling band\'s latest hourly YES ask/bid (≤ 3 h stale). If ≥ 3 bands are priced and Σ asks ≤ 0.975 → buy YES of the CHEAPEST band, once per market. If Σ bids ≥ 1.025 → buy NO of the RICHEST band, once per market.',
      sizing: '40% of available cash on the selected leg, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { ticker, timestamp, portfolio } = ctx;
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      // Event prefix: KXHIGHNY-26AUG18-B87.5 → KXHIGHNY-26AUG18 (series+date).
      const parts = ticker.split('-');
      if (parts.length < 3) return [];
      const prefix = parts.slice(0, 2).join('-') + '-';

      // Point-in-time board: every sibling band's LATEST bar at or before this
      // bar's end, staleness-guarded. historyAll only contains bars the replay
      // has already processed, so no band can quote its own future.
      const STALENESS_S = 3 * 3600;
      const board = [];
      for (const [t, bars] of Object.entries(ctx.historyAll)) {
        if (!t.startsWith(prefix)) continue;
        const last = bars[bars.length - 1];
        if (!last || last.endTs > timestamp) continue;
        if (timestamp - last.endTs > STALENESS_S) continue;
        const ask = last.yesAsk.close;
        const bid = last.yesBid.close;
        if (ask === null || ask <= 0 || bid === null) continue; // unpriced band: cannot include it
        board.push({ ticker: t, ask, bid });
      }
      if (board.length < 3) return [];
      const sumAsk = round6Local(board.reduce((s, b) => s + b.ask, 0));
      const sumBid = round6Local(board.reduce((s, b) => s + b.bid, 0));

      let side = null;
      let why = '';
      if (sumAsk <= 0.975) {
        // Board collectively cheap → the source buys the CHEAPEST leg.
        const cheapest = board.reduce((a, b) => (b.ask < a.ask ? b : a));
        if (cheapest.ticker !== ticker) return [];
        side = 'YES';
        why = `board of ${board.length} bands sums to Σask ${sumAsk.toFixed(3)} ≤ 0.975 and this is the cheapest leg (ask ${cheapest.ask})`;
      } else if (sumBid >= 1.025) {
        // Board collectively rich → the source sells the RICHEST leg (buy NO).
        const richest = board.reduce((a, b) => (b.bid > a.bid ? b : a));
        if (richest.ticker !== ticker) return [];
        side = 'NO';
        why = `board of ${board.length} bands sums to Σbid ${sumBid.toFixed(3)} ≥ 1.025 and this is the richest leg (bid ${richest.bid})`;
      } else {
        return [];
      }

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [{ type: 'buy', side, count, reason: `R14 mee: ${why} → buy ${side}, hold to the exchange's real settlement` }];
    }
  },

  {
    ...BASE,
    id: 'fade_spike_micro',
    username: 'FadeSpike_Micro',
    handle: '@FadeSpike_Micro',
    avatar: '↩️',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXBTC15M', 'KXETH15M', 'KXSOL15M', 'KXGOLD15M'],
    title: '5-Minute Spike Fade on 1-Minute Bars (R14 `fade`)',
    category: 'Short-Horizon / Mean reversion',
    tagline:
      'Fades any 5¢ mid move over 5 minutes when the quoted spread is ≤ 3¢ — the sibling collector project\'s `fade` reference strategy, recreated with its exact trigger and window on the real 1-minute store.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from PriceKalshiHistorical backtest/strategy_example.py strategy `fade` (RESEARCH_SOURCES R14)',
    designSourceUrl: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
    sourceNote:
      'R14 `fade`: "|mid(t)-mid(t-5m)|≥5¢ + spread≤3 ticks → Fade the spike (buy dip). Needs 5s snapshots." The window (5 minutes) and trigger (5¢) are the source\'s own; the spread filter (≤3 ticks = ≤3¢ at Kalshi\'s 1¢ tick) is the source\'s own. This store\'s 1-minute bars (KXBTC15M/KXETH15M/KXSOL15M/KXGOLD15M) carry real yes_bid/yes_ask per minute, so the mid and the spread are both real captured quotes.',
    thesis:
      'DESIGN INTENT: a fast ±5¢ move on a 15-minute contract is usually an overreaction to a spot wobble rather than information about the 15-minute outcome; fading it when the book is tight (≤3¢ spread) buys the dislocation and lets the contract settle back. The entry fires on the source\'s exact 5-minute/5¢ trigger, computed from the real 1-minute bid/ask closes of each captured contract. ' +
      'HONEST LIMITS: (1) the source computed mids from 5-SECOND snapshots; this store\'s finest granularity is 1 minute, so the "5-minute move" here is close(t) − close(t−5 bars) of real 1-minute mids — the same window, coarser sampling, and short spikes that appear and revert inside one minute are invisible; ' +
      '(2) entries are buys only (the replay has no short entry), so fading an UP-spike is expressed as buying NO; ' +
      '(3) the exit is the exchange\'s own settlement — the source\'s strategy is flat-to-flat intraday, so this recreation holds the fade to the real $1.00/$0.00 result instead of an invented intraday exit.',
    rules: {
      entry:
        'On 1-minute bars: if the current bar\'s mid is ≥ 5¢ BELOW the mid 5 bars earlier AND ask − bid ≤ 3¢ → buy YES (fade the dip). If the mid is ≥ 5¢ ABOVE the mid 5 bars earlier AND ask − bid ≤ 3¢ → buy NO (fade the spike up). Once per market.',
      sizing: '50% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement (these 15-minute contracts finalize within minutes).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker, history, periodIndex } = ctx;
      if (periodIndex < 5) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const bid = candle.yesBid.close;
      const ask = candle.yesAsk.close;
      if (bid === null || ask === null || ask <= bid) return [];
      const spread = round6Local(ask - bid);
      if (spread > 0.03) return [];

      const midNow = round6Local((bid + ask) / 2);
      const past = history[history.length - 6];
      if (!past || past.yesBid.close === null || past.yesAsk.close === null) return [];
      const midThen = round6Local((past.yesBid.close + past.yesAsk.close) / 2);
      const move = round6Local(midNow - midThen);

      let side = null;
      if (move <= -0.05) side = 'YES';
      else if (move >= 0.05) side = 'NO';
      if (!side) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side,
          count,
          reason: `R14 fade: mid moved ${move.toFixed(3)} over 5 minutes with ${spread.toFixed(2)} spread → fade by buying ${side}, hold to the exchange's real settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'mom_tick_micro',
    username: 'MomTick_Micro',
    handle: '@MomTick_Micro',
    avatar: '➡️',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXBTC15M', 'KXETH15M', 'KXSOL15M', 'KXGOLD15M'],
    title: '1-Minute Momentum Follow (R14 `mom`, adapted)',
    category: 'Short-Horizon / Momentum',
    tagline:
      'Follows a ≥ 2¢ one-minute mid move when the spread is ≤ 3¢ — the sibling project\'s `mom` reference strategy, adapted to the finest granularity this store can verify.',
    sizingPct: 0.5,
    maxParticipation: 3,
    designedAt: '2026-09-18',
    designSource: 'Recreated from PriceKalshiHistorical backtest/strategy_example.py strategy `mom` (RESEARCH_SOURCES R14), ADAPTED: the source\'s 20-second window is shorter than this store\'s finest bar',
    designSourceUrl: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
    sourceNote:
      'R14 `mom`: "mid(t)-mid(t-20) > 2¢ + tight spread → Follow momentum. Candles + snapshots." The trigger (2¢) and the tight-spread filter (≤3¢) are the source\'s own; the window is NOT — the source measured a 20-SECOND move and this store\'s finest real granularity is 1 minute, so the entry below follows a 1-MINUTE move. It is labelled an adaptation, not the source\'s signal.',
    thesis:
      'DESIGN INTENT: a decisive one-minute move on a 15-minute up/down contract is the spot market voting early; following it while the book is tight buys persistence into the settlement. ' +
      'WHAT THIS IS NOT: the source\'s 20-second momentum cannot be formed from 1-minute bars — any sub-minute momentum that appears and reverts inside a bar is invisible here. The recreation therefore measures a coarser (1-minute) version of the same idea, and its result is evidence about the ADAPTED rule only, not about the source\'s 20-second rule. ' +
      'The direction is expressed as YES after an up-move and NO after a down-move, and the position is held to the exchange\'s own $1.00/$0.00 settlement.',
    rules: {
      entry:
        'On 1-minute bars: mid − mid(previous bar) ≥ 2¢ with ask − bid ≤ 3¢ → buy YES; ≤ −2¢ with ask − bid ≤ 3¢ → buy NO. Once per market.',
      sizing: '50% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, portfolio, ticker, history, periodIndex } = ctx;
      if (periodIndex < 1) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const bid = candle.yesBid.close;
      const ask = candle.yesAsk.close;
      if (bid === null || ask === null || ask <= bid) return [];
      const spread = round6Local(ask - bid);
      if (spread > 0.03) return [];

      const midNow = round6Local((bid + ask) / 2);
      const past = history[history.length - 2];
      if (!past || past.yesBid.close === null || past.yesAsk.close === null) return [];
      const midThen = round6Local((past.yesBid.close + past.yesAsk.close) / 2);
      const move = round6Local(midNow - midThen);

      let side = null;
      if (move >= 0.02) side = 'YES';
      else if (move <= -0.02) side = 'NO';
      if (!side) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, side);
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side,
          count,
          reason: `R14 mom (adapted to 1-minute bars): 1-minute mid move ${move.toFixed(3)} with ${spread.toFixed(2)} spread → follow by buying ${side}, hold to the exchange's real settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'the_leap_breakout_rank',
    username: 'TheLeap_BreakoutRank',
    handle: '@TheLeap_BreakoutRank',
    avatar: '🚀',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXNASDAQ100Y', 'KXINXY', 'KXBTCY'],
    title: 'The Leap Index Breakout Momentum',
    category: 'Index / Momentum Breakout',
    tagline:
      'Buys a cheap out-of-the-money index or crypto strike (YES ask 0.05–0.20) after three rising daily yes_ask closes and holds it for the convex payoff. Named after the S03 TradingView The Leap archetype; nothing from that project is read.',
    sizingPct: 0.6,
    maxParticipation: 3,
    designedAt: '2026-09-19',
    designSource: 'Original momentum-longshot design of this repository, NAMED for the MasterSite S03 TradingView The Leap project; The Leap publishes contest facts and verdicts, not strategy rules or a feed, so nothing from it enters the rule',
    designSourceUrl: 'https://buffedlizard55-lab.github.io/TradingViewTheLeap/',
    sourceNote:
      'What the rule reads: the contract\'s own daily yes_ask closes (four bars) on KXNASDAQ100Y / KXINXY / KXBTCY strikes. No futures price, no contest data. The first merged wording asserted how The Leap champions trade; that claim was unverified and was removed (irregularity #53). The S03 ledger entry records that its own research layer reports no tested strategy with a positive daily compounding rate.',
    thesis:
      'DESIGN INTENT: in a competition judged solely on highest return, a 5–20¢ strike that resolves in the money pays 5×–20×. The hypothesis is that three consecutive rising yes_ask closes mark a strike the market is re-rating upward; buy it and hold. The favourite–longshot bias (R02/R05) predicts the opposite — that cheap strikes are overpriced — so the measured result is informative either way. Nothing here is a claim about how any Leap participant trades.',
    rules: {
      entry: 'When contract YES ask is 0.05 to 0.20 and closing price has risen over the previous 3 daily bars: buy YES, once per market.',
      sizing: '60% of available cash, capped at 3x visible depth.',
      exit: 'None — hold to settlement or expiration for maximum return.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, portfolio, ticker, history, periodIndex } = ctx;
      if (periodIndex < 3) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const ask = candle.yesAsk.close;
      if (ask === null || ask < 0.05 || ask > 0.20) return [];

      const c0 = candle.yesAsk.close;
      const c1 = history[history.length - 2]?.yesAsk?.close;
      const c2 = history[history.length - 3]?.yesAsk?.close;
      const c3 = history[history.length - 4]?.yesAsk?.close;
      if (c1 === null || c2 === null || c3 === null) return [];
      if (!(c0 >= c1 && c1 >= c2 && c2 >= c3)) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `cheap OTM strike re-rating: 3 consecutive rising daily yes_ask closes, ask ${ask.toFixed(2)} in 0.05–0.20 → buy YES, hold for the convex payoff (price-only rule)`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'insider_filing_drift',
    username: 'InsiderFiling_Drift',
    handle: '@InsiderFiling_Drift',
    avatar: '🕵️',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['TESLACEOCHANGE', 'JPMCEOCHANGE', 'KXOPENAICEOCHANGE', 'KXAAPLCEOCHANGE', 'KXFDAAPPROVE', 'KXFDAAPPROVALDATECMPS'],
    title: 'Company-Event YES Drift Fade — price-only (Form 4 archive still absent)',
    category: 'Corporate Events / Longshot fade (price-only)',
    tagline:
      'Buys NO on a company-event contract whose cheap YES ask has stopped rising over three daily bars. PRICE-ONLY: no SEC Form 4 data is read — the S02 Insider-trades signal is still a candidate (no point-in-time filing archive exists here). The username records the signal this rule is meant to receive.',
    sizingPct: 0.45,
    maxParticipation: 2,
    designedAt: '2026-09-19',
    designSource: 'Original price-only design of this repository, NAMED for the MasterSite S02 Insider-trades project it is meant to be upgraded with; nothing from that project (or from SEC EDGAR) is read',
    designSourceUrl: 'https://buffedlizard55-lab.github.io/Insider-trades/',
    sourceNote:
      'What the rule actually reads: the contract\'s own daily yes_ask closes (three bars). What it does NOT read: any SEC Form 4 filing, insider transaction or holding — the honesty contract forbids describing a signal the code does not have (the first merged wording did; irregularity #53). The S02 ledger entry states what a real Form 4 archive would need.',
    thesis:
      'DESIGN INTENT: long-dated company-event YES contracts (CEO departures, dated FDA approvals) are longshots, and the favourite–longshot bias (R02/R05) says a cheap YES tends to be overpriced; when its ask has stopped rising for three daily bars, buying NO at 0.65–0.90 and holding to settlement collects the premium if the event does not happen. This is a HYPOTHESIS measured on real bars, not an observed drift. It has no insider input of any kind.',
    rules: {
      entry: 'On company-event and CEO-change contracts: buy NO when the YES ask close is between 0.10 and 0.35 and has not increased over the last 3 daily bars (c0 ≤ c1 ≤ c2). Once per market. No external data.',
      sizing: '45% of available cash, capped at 2x visible depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, portfolio, ticker, history, periodIndex } = ctx;
      if (periodIndex < 3) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const yesAsk = candle.yesAsk.close;
      if (yesAsk === null || yesAsk < 0.10 || yesAsk > 0.35) return [];

      const c0 = candle.yesAsk.close;
      const c1 = history[history.length - 2]?.yesAsk?.close;
      const c2 = history[history.length - 3]?.yesAsk?.close;
      if (c1 === null || c2 === null) return [];
      if (c0 > c1 || c1 > c2) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'NO');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'NO',
          count,
          reason: `price-only fade: YES ask ${yesAsk.toFixed(2)} in 0.10–0.35 and not rising over 3 daily bars → buy NO, hold to settlement (no insider data is read)`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'ncaaf_game_favourite',
    username: 'NCAAF_GameFavourite',
    handle: '@NCAAF_GameFavourite',
    avatar: '🏈',
    flight: 'hourly',
    preferredPeriodMinutes: 60,
    universe: ['KXNCAAFGAME', 'KXNCAAFSPREAD', 'KXNCAAFTOTAL'],
    title: 'NCAA Football Game Favourite, Held to Settle',
    category: 'Sports / NCAA Scoreboard',
    tagline:
      'Buys heavy college football favourites in their opening trading window and holds to real game settlement (MasterSite S07).',
    sizingPct: 0.5,
    maxParticipation: 2,
    designedAt: '2026-09-19',
    designSource: 'Favourite–longshot bias (R02/R05 pattern) on the NCAA football series the store holds; NAMED for the MasterSite S07 Ncaa-football-alerts project, whose live-score feed is NOT read (not archived here point-in-time)',
    designSourceUrl: 'https://github.com/buffedlizard55-lab/ncaa-football-alerts',
    sourceNote:
      'COMPUTED SAMPLE (from the store on this build): ' + classSampleCaption(STORE_FACTS_60M, ['KXNCAAFGAME', 'KXNCAAFSPREAD', 'KXNCAAFTOTAL']) + '. The rule reads only the contract\'s own hourly yes_ask. Whether 0.60–0.85 favourites settle YES more often than their price implies is the HYPOTHESIS this entry measures on those bars — the first merged wording stated it as a fact, without a source; that sentence was removed (irregularity #53).',
    thesis:
      'DESIGN INTENT: college football match outcomes have wide talent disparities. Buying game favourites in the first 4 hourly bars and holding to final settlement captures the favourite premium.',
    rules: {
      entry: 'In the first 4 hourly bars: buy YES when YES ask is 0.60 to 0.85, once per market.',
      sizing: '50% of available cash, capped at 2x visible depth.',
      exit: 'None — hold to final exchange settlement ($1.00/$0.00).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, portfolio, ticker, periodIndex } = ctx;
      if (periodIndex > 3) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const ask = candle.yesAsk.close;
      if (ask === null || ask < 0.60 || ask > 0.85) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `NCAAF favourite: hour ${periodIndex} YES ask ${ask.toFixed(2)} in 0.60–0.85 favourite band → buy YES, hold to game settlement`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'grid_mm_multitier',
    username: 'GridMM_MultiTier',
    handle: '@GridMM_MultiTier',
    avatar: '📐',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXNASDAQ100Y', 'KXBTCY', 'KXINXY'],
    title: 'Multi-Level AMM Liquidity Grid',
    category: 'Market Making / Liquidity Provision',
    tagline:
      'When the captured spread is ≥ 3¢, rests ONE maker bid one tick above the best bid and offers every fill back three ticks above cost — maker orders only, so the official maker fee regime applies. R16 records the genre this design is named after; the source could not be attributed to a specific video or post (irregularity #53).',
    sizingPct: 0.35,
    maxParticipation: 3,
    designedAt: '2026-09-19',
    designSource: 'YouTube and X prediction market AMM tutorials (RESEARCH_SOURCES R16)',
    designSourceUrl: 'https://www.youtube.com/results?search_query=kalshi+market+maker+strategy', // a SEARCH page, not a source — see R16 and irregularity #53
    sourceNote:
      'The design is this repository\'s own reading of a well-known genre (passive maker grids on wide spreads); R16 could not attribute it to a specific tutorial, so no claim from any tutorial is repeated here. What is real: the maker fee regime per series comes from the captured fee schedule (KXBTCY fee-free; index series per data/discovered/series-fees.json), and every resting order is filled only when a LATER real bar trades through it (src/backtest-replay.js), capped by that bar\'s real volume.',
    thesis:
      'DESIGN INTENT: on a wide spread a resting bid one tick inside the touch is filled only by a seller who crosses to it; the fill is then offered back three ticks higher. The edge, if any, is the spread minus the maker fee. NOTE ON THE FIRST MERGED VERSION: its rules said "rest a limit buy" while its code sent a taker market buy at the ask with no exit — the code was rewritten on 2026-09-20 to do what the rules say (irregularity #53).',
    rules: {
      entry: 'When the captured YES ask − YES bid ≥ 0.03 and nothing is held or resting on the market: rest ONE maker bid on YES at best bid + 1 tick (must remain below the ask).',
      sizing: '35% of cash at the resting price; a resting order fills only up to the real traded volume of the bar that crosses it.',
      exit: 'Every filled lot is offered as a maker ask at cost + 3 ticks; unfilled offers ride to the exchange settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio, ticker } = ctx;
      const actions = [];
      const tick = book.tick || 0.01;
      // 1. Every held lot is offered back to the book as a MAKER offer three
      //    ticks above its cost (never a taker sale) — the "flip" leg.
      for (const pos of [...portfolio.positions.values()].filter((p) => p.ticker === ticker && p.side === 'YES' && p.count > 0)) {
        const offer = snapToGrid(Math.min(0.99, (pos.avgPrice || pos.avgCost || 0) + 3 * tick), tick);
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && o.status === 'resting' && Math.abs(o.price - offer) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: offer, reason: `maker offer at cost + 3 ticks (${offer})` });
      }
      // 2. When the captured spread is ≥ 3¢, rest ONE maker bid one tick above
      //    the best bid (still inside the spread, never crossing the ask).
      const bid = candle.yesBid.close;
      const ask = candle.yesAsk.close;
      if (bid === null || ask === null || ask <= bid) return actions;
      const spread = round6Local(ask - bid);
      if (spread < 0.03) return actions;
      const restingBids = book.restingOrders.filter((o) => o.direction === 'bid' && o.outcome === 'YES' && o.status === 'resting').length;
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (restingBids > 0 || held) return actions;
      const price = snapToGrid(bid + tick, tick);
      if (!(price < ask)) return actions;
      const count = Math.floor(((portfolio.cash * this.sizingPct) / price) * 100) / 100;
      if (count > 0) actions.push({ type: 'limit', direction: 'bid', side: 'YES', count, price, reason: `spread ${spread.toFixed(2)} ≥ 0.03 → rest maker bid one tick above the best bid (${price}); fills only if a later real bar trades through it` });
      return actions;
    }
  },

  {
    ...BASE,
    id: 'fomc_probability_sniper',
    username: 'FOMC_ProbabilitySniper',
    handle: '@FOMC_ProbabilitySniper',
    avatar: '🏛️',
    flight: 'daily',
    preferredPeriodMinutes: 1440,
    universe: ['KXFED'],
    title: 'FOMC Implied Probability Sniper',
    category: 'Macro / Interest Rates',
    tagline:
      'Buys ANY KXFED bracket whose daily YES ask closes between 0.30 and 0.65 and holds it to the FOMC settlement. It does not identify a modal strike and reads no futures-implied probability; R17 records the genre this design is named after (the source could not be attributed — irregularity #53).',
    sizingPct: 0.45,
    maxParticipation: 2,
    designedAt: '2026-09-19',
    designSource: 'X (Twitter) and Reddit macro trading community discussions on Kalshi KXFED rate cut pricing (RESEARCH_SOURCES R17)',
    designSourceUrl: 'https://x.com/search?q=kalshi+fed+rate+cut', // a SEARCH page, not a source — see R17 and irregularity #53
    sourceNote:
      'What the rule reads: the KXFED contract\'s own daily yes_ask close. What it does NOT read: CME FedWatch, any futures price, or any external probability — the first merged wording asserted a FedWatch divergence and a "modal strike" the code never computes; both were removed (irregularity #53). The KXFED market rules and the exchange\'s settlement are the only inputs.',
    thesis:
      'DESIGN INTENT: a Fed-decision bracket asked at 0.30–0.65 is the market\'s middle ground; the hypothesis is that these mid-priced brackets resolve YES more often than their price implies (the mirror image of the favourite–longshot bias at the centre of the distribution). Because every bracket in that band is bought, the entry can hold mutually exclusive brackets of the same meeting — that is a property of the rule, measured, not a claim of edge.',
    rules: {
      entry: 'On KXFED markets: buy YES when YES ask is 0.30 to 0.65, once per market.',
      sizing: '45% of available cash, capped at 2x visible depth.',
      exit: 'None — hold to FOMC rate decision settlement.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, portfolio, ticker } = ctx;
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];

      const ask = candle.yesAsk.close;
      if (ask === null || ask < 0.30 || ask > 0.65) return [];

      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `KXFED bracket asked ${ask.toFixed(2)} inside 0.30–0.65 → buy YES, hold to the exchange's FOMC settlement (price-only rule; no futures-implied input)`
        }
      ];
    }
  },

  /* ════════════════════════════════════════════════════════════════════ *
   * 2026-09-20 (session 01a0bca9) — THE SPORTS HALF OF THE POINT-IN-TIME
   * SIGNAL ARCHIVE (ROADMAP Next #3). Both entries read ctx.signal from the
   * official MLB Stats API archive (data/mlb-signals/, statsapi.mlb.com,
   * captured every 20 minutes by .github/workflows/mlb-signals.yml) joined to
   * the KXMLBGAME contract by first-pitch instant + away code + home code
   * (fact V113), and compare the market's price with Tangotiger's
   * equal-teams win-expectancy table (R18). They are FORWARD TESTS BY
   * CONSTRUCTION: no state row exists before the first workflow run, so every
   * earlier bar abstains and the entries stay unranked until the archive
   * overlaps a captured 1-minute KXMLBGAME bar.
   * ════════════════════════════════════════════════════════════════════ */

  {
    ...BASE,
    id: 'mlb_lead_inplay',
    username: 'MLBLead_InPlay',
    handle: '@MLBLead_InPlay',
    avatar: '⚾',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXMLBGAME'],
    title: 'Official-Linescore Late Lead vs Market (point-in-time)',
    category: 'Sports / Model vs Market (in-play)',
    tagline:
      'From the 6th inning on, buys the side the OFFICIAL archived linescore shows leading by 2+ runs whenever the market still asks less than the equal-teams theoretical win probability for that half-inning and lead. Abstains without a fresh point-in-time state row.',
    sizingPct: 0.4,
    maxParticipation: 3,
    designedAt: '2026-09-20',
    designSource:
      'Original design in this repository: the point-in-time external-signal architecture of ForecastEdge_Weather applied to the official MLB Stats API game state (data/mlb-signals/, grown by .github/workflows/mlb-signals.yml), with Tangotiger\'s published win-expectancy table (RESEARCH_SOURCES R18) as the theoretical reference price',
    designSourceUrl: 'https://tangotiger.net/innwin.html',
    sourceNote:
      'SIGNAL: GET statsapi.mlb.com/api/v1/schedule?sportId=1&hydrate=linescore,probablePitcher,team — MLB Advanced Media\'s official Stats API; status (Preview/Live/Final), current inning, inning state and runs per side are archived as one row per change with the instant they were first seen (V111/V112). JOIN: the KXMLBGAME ticker\'s US-Eastern first pitch, away code and home code must all equal the official game\'s (verified on all 9 finalized contracts in the store, V113). REFERENCE: tangotiger.net/innwin.html, "the chance of the home team winning, at the start of each inning … based on probability theory", assumptions "Both teams are equals … No Home Field Advantage exists … 4.3 Runs-per-game" — e.g. home +2 at the top of the 6th = 0.790, top of the 7th = 0.826, top of the 8th = 0.872. KXMLBGAME carries the REAL fee multiplier 0.5 (data/discovered/series-fees.json).',
    thesis:
      'DESIGN INTENT: a two-run lead in the late innings is worth roughly 0.79–0.94 to the leading side under the equal-teams theory. If the market still asks LESS than that number while the official linescore already shows the lead, buy the leader and hold to the exchange\'s own settlement — the strategy trades the gap between the archived official state and the contract price, never a prediction of its own. ' +
      'POINT-IN-TIME RULE: ctx.signal is the newest archived state captured at or before the bar (src/mlb-signal-store.js); the archive\'s freshest capture instant must be within 30 minutes of the bar, otherwise the observation is stale and the entry abstains. The current box score is never substituted for a past decision. ' +
      'FORWARD TEST BY CONSTRUCTION: the archive begins with the first mlb-signals run on 2026-09-20, and the 1-minute KXMLBGAME bars (ingest block minute-mlb-game-lines) begin with the next ingest, so every earlier bar honestly produces no trades; the entry stays unranked (0 fills, reason published) until archive and bars overlap. ' +
      'HONEST LIMITS, stated up front: (1) the table assumes equal teams with no home-field advantage — a real favourite\'s lead is worth more, a real underdog\'s less; (2) the archive samples the game every ~20 minutes, so the state it shows can be up to 20 minutes (plus queue delay) behind the field and the market usually knows first — that lag is exactly what the entry measures; (3) the table is for the START of a half-inning with bases empty; a mid-inning capture with runners on is approximated by that start value.',
    rules: {
      entry:
        'ctx.signal (kind mlb-game-state) shows abstractGameState Live, inning ≥ 6, the YES team leading by ≥ 2 runs, and staleSeconds ≤ 1800. Let p = Tangotiger equal-teams win probability of the YES team for that half-inning and home differential. Buy YES when the YES ask ≤ p − 0.02. Once per market.',
      sizing: '40% of available cash per confirmed contract, capped at 3x visible ask depth.',
      exit: 'None — hold to the exchange\'s real settlement ($1.00/$0.00 at the market\'s real result).',
      noSignalRule: 'signal === null (no archived state captured by this bar, ticker not joinable to an official game, or the archive is dark) → abstain. Never substitute a later capture for an earlier decision.',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, signal } = ctx;
      if (!usableMlbSignal(signal)) return [];
      if (Number(signal.inning) < 6 || Number(signal.lead) < 2) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const p = tangoYesWinProbability(signal);
      if (p === null) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > p - 0.02) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `official linescore (captured ${signal.capturedAt}, observed ${signal.observedAt}) shows ${signal.yesTeam} ${signal.runsYes}-${signal.runsOpp} ${signal.inningState} ${signal.inning} (${signal.lead >= 0 ? '+' : ''}${signal.lead}) → equal-teams win probability ${p.toFixed(3)} vs ask ${ask} — buy YES, held to the exchange's real result`
        }
      ];
    }
  },

  {
    ...BASE,
    id: 'mlb_trail_comeback',
    username: 'MLBTrail_Comeback',
    handle: '@MLBTrail_Comeback',
    avatar: '🧢',
    flight: 'micro',
    preferredPeriodMinutes: 1,
    universe: ['KXMLBGAME'],
    title: 'Official-Linescore One-Run Deficit, Bought Below Theory (point-in-time)',
    category: 'Sports / Favourite–Longshot control (in-play)',
    tagline:
      'The longshot side of the same archive: from the 7th inning on, buys the team the official linescore shows trailing by exactly one run when the market asks less than the equal-teams theoretical comeback probability. The favourite–longshot literature (R02/R05) predicts this loses; the ledger will say.',
    sizingPct: 0.25,
    maxParticipation: 3,
    designedAt: '2026-09-20',
    designSource:
      'Original design in this repository — the deliberate counterpart of MLBLead_InPlay, reading the same official MLB Stats API archive and the same Tangotiger table (RESEARCH_SOURCES R18) from the trailing side',
    designSourceUrl: 'https://tangotiger.net/innwin.html',
    sourceNote:
      'Same signal, join and reference as MLBLead_InPlay. The relevant table cells: home team down one at the top of the 7th = 0.299, top of the 8th = 0.247, top of the 9th = 0.158, bottom of the 9th = 0.194 (tangotiger.net/innwin.html, equal teams, no home-field advantage). An away team down one reads 1 − the home cell for the mirrored differential.',
    thesis:
      'DESIGN INTENT: if the market systematically overprices longshots (the favourite–longshot bias), the trailing side of a late one-run game should usually ask MORE than its theoretical comeback probability, and this entry should rarely trigger — and lose when it does. The entry exists to measure that, with the same point-in-time discipline as its counterpart: it only ever buys when the ask is at or below theory minus a 2¢ margin. ' +
      'POINT-IN-TIME RULE and FORWARD-TEST STATUS: identical to MLBLead_InPlay — no archived state at or before the bar (or a stale one, > 30 minutes) means no trade, and the entry is unranked until the archive overlaps 1-minute KXMLBGAME bars. ' +
      'HONEST LIMIT: the table is the equal-teams theory; a real underdog trailing by one is worth less than the table says, so a trigger here is more likely to be a mispriced signal than a mispriced market. That asymmetry is stated, and the maximum-return mandate is why the entry still takes the trade rather than sitting out.',
    rules: {
      entry:
        'ctx.signal shows Live, inning ≥ 7, the YES team trailing by exactly 1 run, staleSeconds ≤ 1800. Let p = Tangotiger equal-teams win probability of the YES team for that half-inning. Buy YES when the YES ask ≤ p − 0.02. Once per market.',
      sizing: '25% of available cash per contract, capped at 3x visible ask depth.',
      exit: 'None — hold to the exchange\'s real settlement.',
      noSignalRule: 'signal === null → abstain (same rule as MLBLead_InPlay).',
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio, ticker, signal } = ctx;
      if (!usableMlbSignal(signal)) return [];
      if (Number(signal.inning) < 7 || Number(signal.lead) !== -1) return [];
      const held = [...portfolio.positions.values()].some((p) => p.ticker === ticker && p.count > 0);
      if (held) return [];
      const p = tangoYesWinProbability(signal);
      if (p === null) return [];
      const ask = book.getBestYesAsk();
      if (ask === null || ask > p - 0.02) return [];
      const count = aggressiveSize(ctx, this.sizingPct, this.maxParticipation, 'YES');
      if (count <= 0) return [];
      return [
        {
          type: 'buy',
          side: 'YES',
          count,
          reason: `official linescore (captured ${signal.capturedAt}) shows ${signal.yesTeam} trailing ${signal.runsYes}-${signal.runsOpp} ${signal.inningState} ${signal.inning} → equal-teams comeback probability ${p.toFixed(3)} vs ask ${ask} — buy YES below theory, held to the exchange's real result`
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
