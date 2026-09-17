/**
 * KalshiPaperSim — Strategy Runner (computes the competition leaderboard)
 * =====================================================================
 * Runs every executable strategy in src/strategies.js over REAL captured Kalshi
 * candlestick data and produces COMPUTED results + rankings + generated
 * post-mortems. This is the single source of truth for every performance number
 * shown in the UI. Nothing is hard-coded.
 */

import { STRATEGIES, getStrategy } from './strategies.js';
import { ReplayEngine, analyzeEquityCurve } from './backtest-replay.js';
import { computeAttribution, generatePostMortem, buildLeaderboard } from './analysis.js';
import { computePortfolioExposure, computeCompetitionMarketStats } from './market-analytics.js';
import { normalizeMarket, DATA_SOURCE } from './kalshi-api.js';
import { getVerifiedMarkets, getVerifiedCandlesticks, CANDLESTICKS, CAPTURE_META, seriesFeeConfig } from './verified-snapshot.js';
import {
  EXTENDED_CAPTURE_META, getExtendedCandlesticks, summarizeExtendedSeries, EXTENDED_SERIES
} from './verified-candles.js';
import { ACCUMULATED_HISTORY, getAccumulatedBars } from './accumulated-history.js';
import { buildReplayUniverse, summarizeUniverse, MIN_REPLAY_BARS, CANDLE_ORIGIN } from './history-merge.js';

/** Data-source label for bars that came from the daily ingest job, not a capture. */
export const DATA_SOURCE_ACCUMULATED = 'accumulated_history_store';

/**
 * The in-repo verified captures, before any accumulated history is considered.
 * Kept separate so tests and docs can always compare "what we captured" with
 * "what the daily job has since added".
 */
export function getRepoCandleMap(tickers = null) {
  const out = {};
  for (const [ticker, block] of Object.entries(CANDLESTICKS)) {
    if (tickers && !tickers.includes(ticker)) continue;
    out[ticker] = getExtendedCandlesticks(ticker) || block.candlesticks;
  }
  return out;
}

/**
 * The accumulated store with its compact tuples expanded back into real bars.
 * Built once and reused: the competition, the coverage table and the audit all
 * ask for it, and re-expanding thousands of bars on every call is wasteful.
 */
let __accumulatedView = null;
export function accumulatedView() {
  if (__accumulatedView) return __accumulatedView;
  const markets = {};
  for (const [ticker, m] of Object.entries(ACCUMULATED_HISTORY.markets || {})) {
    markets[ticker] = { ...m, bars: getAccumulatedBars(ticker) || [] };
  }
  __accumulatedView = { ...ACCUMULATED_HISTORY, markets };
  return __accumulatedView;
}

/**
 * The replay universe.
 *
 * Recommended-work item #3: this is where the accumulated store finally feeds
 * the competition. `buildReplayUniverse()` applies the strict rule in
 * src/history-merge.js — a stored series is used only when it is a verified
 * superset of the in-repo capture — so growing the dataset can lengthen a
 * window but can never rewrite one.
 */
export function buildUniverse(options = {}) {
  return buildReplayUniverse({
    verifiedMarkets: getVerifiedMarkets(),
    repoCandles: getRepoCandleMap(),
    accumulated: options.accumulated || accumulatedView(),
    minBars: options.minBars ?? MIN_REPLAY_BARS
  });
}

/** Markets that may be traded in the replay: in-repo captures + accumulated store. */
export function getReplayableMarkets(options = {}) {
  return buildUniverse(options).entries.map((e) =>
    normalizeMarket(e.market, {
      source: e.marketSource === 'verified_snapshot' ? DATA_SOURCE.VERIFIED_SNAPSHOT : DATA_SOURCE_ACCUMULATED,
      source_url: e.market_url,
      captured_at: e.market_captured_at,
      candle_origin: e.origin,
      stored_bar_count: e.storedBarCount,
      repo_bar_count: e.repoBarCount
    })
  );
}

/**
 * The competition's candle map: in-repo captures, upgraded in place by the
 * accumulated store wherever the store is a verified superset.
 *
 * The extended capture is preferred over the short snapshot capture for the same
 * reason: it is a verified SUPERSET — every overlapping bar was compared
 * field-by-field and matched exactly (see test/simulation.test.js
 * "extended candle capture is a verified superset of the snapshot capture").
 */
export function getVerifiedCandleMap(tickers = null) {
  const universe = buildUniverse();
  const out = {};
  for (const e of universe.entries) {
    if (tickers && !tickers.includes(e.ticker)) continue;
    out[e.ticker] = e.bars;
  }
  return out;
}

/** Provenance + bar counts per replayable market (shown in the UI and docs). */
export function getCandleCoverage() {
  const universe = buildUniverse();
  return universe.entries.map((e) => {
    const bars = e.bars;
    const ext = EXTENDED_SERIES[e.ticker]?.meta || null;
    return {
      ticker: e.ticker,
      bars: bars.length,
      firstTs: bars[0]?.end_period_ts ?? null,
      lastTs: bars[bars.length - 1]?.end_period_ts ?? null,
      firstDate: bars[0] ? new Date(bars[0].end_period_ts * 1000).toISOString() : null,
      lastDate: bars.length ? new Date(bars[bars.length - 1].end_period_ts * 1000).toISOString() : null,
      periodIntervalMinutes: ext ? ext.periodIntervalMinutes : 1440,
      // Where these bars came from — displayed verbatim in the UI so a lengthened
      // window is never mistaken for the original 2026-09-17 capture.
      origin: e.origin,
      source:
        e.origin === CANDLE_ORIGIN.STORE || e.origin === CANDLE_ORIGIN.STORE_ONLY
          ? 'accumulated_history_store'
          : ext
            ? 'extended_capture_61_bars'
            : 'snapshot_capture',
      repoBars: e.repoBarCount,
      storedBars: e.storedBarCount,
      barsAddedByIngest: Math.max(0, bars.length - e.repoBarCount),
      url: e.origin === CANDLE_ORIGIN.STORE || e.origin === CANDLE_ORIGIN.STORE_ONLY
        ? ACCUMULATED_HISTORY.markets[e.ticker]?.last_ingest_url || e.market_url
        : ext
          ? ext.url
          : CANDLESTICKS[e.ticker]?._provenance?.url || null,
      capturedAt: ext ? ext.capturedAt : CANDLESTICKS[e.ticker]?._provenance?.capturedAt || null,
      lastIngestedAt: ACCUMULATED_HISTORY.markets[e.ticker]?.last_ingested_at || null,
      noTradeBars: bars.filter((b) => !b.price || b.price.close_dollars === undefined).length,
      conflicts: (e.conflicts || []).length
    };
  });
}

/**
 * The audit trail for the accumulated store: what it added, what it could not
 * use and why. Surfaced in the UI and VERIFICATION.md so the growing dataset is
 * as reviewable as the captures it extends.
 */
export function getHistoryAudit() {
  const universe = buildUniverse();
  return {
    store: {
      present: Boolean(ACCUMULATED_HISTORY.present),
      generatedAt: ACCUMULATED_HISTORY.generatedAt,
      marketCount: ACCUMULATED_HISTORY.marketCount,
      barCount: ACCUMULATED_HISTORY.barCount,
      lastManifest: ACCUMULATED_HISTORY.manifestGeneratedAt,
      manifestTotals: ACCUMULATED_HISTORY.manifestTotals
    },
    summary: summarizeUniverse(universe),
    replayable: universe.replayableTickers,
    markets: universe.audit.map((e) => ({
      ticker: e.ticker,
      series: e.series_ticker,
      replayable: e.replayable,
      bars: e.bars.length,
      origin: e.origin,
      reason: e.reason,
      excludedReason: e.excludedReason,
      repoBars: e.repoBarCount,
      storedBars: e.storedBarCount,
      conflicts: (e.conflicts || []).length,
      status: e.status,
      result: e.result,
      marketSource: e.marketSource
    })),
    conflicts: universe.conflicts
  };
}

export { ACCUMULATED_HISTORY, summarizeUniverse, MIN_REPLAY_BARS, CANDLE_ORIGIN };

export { EXTENDED_CAPTURE_META, summarizeExtendedSeries, seriesFeeConfig };

/**
 * Run the full competition.
 * @param {object} [options]
 * @param {Array}  [options.strategies]      default: all STRATEGIES
 * @param {Array}  [options.markets]         default: replayable verified markets
 * @param {Object} [options.candlesByTicker] default: verified candlesticks
 * @param {number} [options.initialCapital=100000]
 * @param {number} [options.seed=20260917]   deterministic seed
 * @param {boolean}[options.settleAtEnd=false]
 * @param {Object} [options.finalResult]     { ticker: 'YES'|'NO' }
 */
export function runCompetition(options = {}) {
  const strategies = options.strategies || STRATEGIES;
  const markets = options.markets || getReplayableMarkets();
  const candlesByTicker = options.candlesByTicker || getVerifiedCandleMap(markets.map((m) => m.ticker));
  const initialCapital = options.initialCapital ?? 100000;
  const seed = options.seed ?? 20260917;

  const engine = new ReplayEngine({
    markets,
    candlesByTicker,
    initialCapital,
    feeMultiplier: options.feeMultiplier ?? null, // null => resolve per series from captured Series objects
    notional: options.notional ?? 1.0,
    settleAtEnd: options.settleAtEnd ?? false,
    finalResult: options.finalResult || null,
    // Per-market capital allocation (item #7). null = the competition default:
    // the brief is "highest return only", so no cap is imposed unless asked for.
    maxNotionalPerMarketPct: options.maxNotionalPerMarketPct ?? null,
    // 'partial' (default) fills only real depth and reports the rest as unfilled.
    // 'penalty' is a STRESS mode that invents a price beyond the book; it is
    // never used for headline results and is labelled wherever it appears.
    exhaustionPolicy: options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial'
  });

  const results = strategies.map((strategy) => {
    const universeMarkets = strategy.universe
      ? markets.filter((m) => strategy.universe.includes(m.series_ticker))
      : markets;
    const universeCandles = {};
    for (const m of universeMarkets) if (candlesByTicker[m.ticker]) universeCandles[m.ticker] = candlesByTicker[m.ticker];

    const universeEngine =
      universeMarkets.length === markets.length
        ? engine
        : new ReplayEngine({
            markets: universeMarkets,
            candlesByTicker: universeCandles,
            initialCapital,
            feeMultiplier: options.feeMultiplier ?? null, // null => resolve per series from captured Series objects
            notional: options.notional ?? 1.0,
            settleAtEnd: options.settleAtEnd ?? false,
            finalResult: options.finalResult || null,
            maxNotionalPerMarketPct: options.maxNotionalPerMarketPct ?? null,
            exhaustionPolicy: options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial'
          });

    const result = universeEngine.run(strategy, { username: strategy.username, capital: initialCapital, seed });
    const attribution = computeAttribution(result);
    const analysis = generatePostMortem(strategy, result, attribution);
    const curve = analyzeEquityCurve(result.equityCurve, initialCapital);
    // Multi-market accounting: per-market exposure, fees and concentration,
    // computed from this strategy's own trade log (never hard-coded).
    const marketAnalytics = computePortfolioExposure(result);

    return {
      ...result,
      marketAnalytics,
      strategy: {
        id: strategy.id,
        username: strategy.username,
        handle: strategy.handle,
        avatar: strategy.avatar,
        title: strategy.title,
        category: strategy.category,
        tagline: strategy.tagline,
        thesis: strategy.thesis,
        rules: strategy.rules,
        sizingPct: strategy.sizingPct,
        universe: strategy.universe
      },
      attribution,
      analysis,
      curveAnalysis: curve,
      dataProvenance: {
        markets: universeMarkets.map((m) => ({ ticker: m.ticker, series: m.series_ticker, source: m.source, source_url: m.source_url })),
        candles: Object.fromEntries(universeMarkets.map((m) => [m.ticker, (universeCandles[m.ticker] || []).length])),
        capturedAt: CAPTURE_META.capturedAt,
        apiBase: CAPTURE_META.apiBase
      },
      // The trade log can be huge; keep a bounded copy for the UI.
      recentTrades: (result.tradeLog || []).slice(-40)
    };
  });

  const leaderboard = buildLeaderboard(results.map((r) => ({ ...r, analysis: r.analysis })));
  const marketStats = computeCompetitionMarketStats(results, candlesByTicker);

  return {
    marketStats,
    competition: {
      id: `KALSHI-PAPER-CHAMPIONSHIP-${new Date().toISOString().slice(0, 4)}`,
      engine: 'ReplayEngine (deterministic, seeded)',
      seed,
      initialCapital,
      horizonPeriods: engine.periodCount,
      generatedAt: new Date().toISOString(),
      dataProvenance: {
        markets: engine.markets.map((m) => ({
          ticker: m.ticker,
          series: m.series_ticker,
          source: m.source,
          source_url: m.source_url,
          captured_at: CAPTURE_META.capturedAt
        })),
        candlesticks: Object.fromEntries(Object.entries(candlesByTicker).map(([k, v]) => [k, v.length])),
        candleCoverage: getCandleCoverage(),
        // Fee configuration resolved per series from the CAPTURED Series objects.
        // KXBTCY: fee_multiplier 0 => zero fees (real exchange config, flagged).
        feeConfiguration: engine.markets.map((m) => ({ ticker: m.ticker, ...seriesFeeConfig(m.series_ticker) })),
        capturedAt: CAPTURE_META.capturedAt,
        apiBase: CAPTURE_META.apiBase,
        depthModelNote:
          'Prices/quotes are REAL captured Kalshi data. Depth BEHIND the quoted touch is modelled because candlesticks do not carry depth; those fills are labelled SIMULATED.'
      },
      exhaustionPolicy: engine.exhaustionPolicy,
      maxNotionalPerMarketPct: engine.maxNotionalPerMarketPct ?? null,
      maxFillFractionOfPeriodVolume: engine.maxFillFractionOfPeriodVolume,
      mandate: 'Highest return only. No risk management, per the competition brief.',
      regime: options.regime || 'baseline',
      regimeNote:
        'Market regimes affect the LIVE simulated feed and the 1-year memory simulation only. ' +
        'This replay always uses the REAL captured candlesticks UNMODIFIED, so a regime can never fabricate historical prices.'
    },
    leaderboard,
    results
  };
}

/** Run a single strategy by id/username. */
export function runStrategy(idOrUsername, options = {}) {
  const strategy = typeof idOrUsername === 'object' ? idOrUsername : getStrategy(idOrUsername);
  if (!strategy) throw new Error(`Unknown strategy: ${idOrUsername}`);
  const comp = runCompetition({ ...options, strategies: [strategy] });
  return comp.results[0];
}

/**
 * Run a USER-SUPPLIED strategy function (Strategy Lab / custom scripting).
 * The function is executed inside a constrained context — see strategy-sandbox.js.
 */
export function runCustomStrategy(userStrategy, options = {}) {
  if (!userStrategy || typeof userStrategy.decide !== 'function') {
    throw new Error('Custom strategy must expose decide(ctx)');
  }
  const comp = runCompetition({ ...options, strategies: [userStrategy] });
  return comp.results[0];
}
