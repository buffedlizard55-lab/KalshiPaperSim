/**
 * KalshiPaperSim — Strategy Runner (computes the competition leaderboard)
 * =====================================================================
 * Runs every executable strategy in src/strategies.js over REAL captured Kalshi
 * candlestick data and produces COMPUTED results + rankings + generated
 * post-mortems. This is the single source of truth for every performance number
 * shown in the UI. Nothing is hard-coded.
 */

import { STRATEGIES, getStrategy } from './strategies.js';

// Re-exported for callers (server.js, the static-site runtime) that build a
// flight-specific roster from the same declaration the runner itself uses.
export { STRATEGIES };
import { ReplayEngine, analyzeEquityCurve } from './backtest-replay.js';
import { computeAttribution, generatePostMortem, buildLeaderboard } from './analysis.js';
import { computePortfolioExposure, computeCompetitionMarketStats } from './market-analytics.js';
import { normalizeMarket, DATA_SOURCE } from './kalshi-api.js';
import { getVerifiedMarkets, getVerifiedCandlesticks, CANDLESTICKS, CAPTURE_META, seriesFeeConfig } from './verified-snapshot.js';
import {
  EXTENDED_CAPTURE_META, getExtendedCandlesticks, summarizeExtendedSeries, EXTENDED_SERIES
} from './verified-candles.js';
import { ACCUMULATED_HISTORY, getAccumulatedBars, ACCUMULATED_INTRADAY, getIntradayBars, getIntradayPeriods, getIntradayMarket } from './accumulated-history.js';
import { buildReplayUniverse, summarizeUniverse, MIN_REPLAY_BARS, CANDLE_ORIGIN } from './history-merge.js';
import { CAPTURED_DEPTH, getCapturedDepthProfile, getCapturedDepthTickers } from './captured-depth.js';
import { forecastLocations, forecastHighAt } from './forecast-store.js';

/** Data-source label for bars that came from the daily ingest job, not a capture. */
export const DATA_SOURCE_ACCUMULATED = 'accumulated_history_store';

/* ------------------------------------------------------------------ *
 * POINT-IN-TIME EXTERNAL SIGNALS (roadmap item #3 — weather)
 * ------------------------------------------------------------------ */

/**
 * The calendar date a KXHIGHNY event measures, parsed from the event ticker
 * (KXHIGHNY-26SEP07 → '2026-09-07'). Verified against every captured weather
 * market: the title says "…on Sep 7, 2026?" and close_time is 05:00Z the next
 * day, so the ticker's date is the measurement day.
 */
const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
export function weatherEventDate(eventTicker) {
  const m = /^KXHIGH\w*-(\d{2})([A-Z]{3})(\d{2})(?:-|$)/.exec(String(eventTicker || ''));
  if (!m) return null;
  const month = MONTHS[m[2]];
  if (!month) return null;
  return `20${m[1]}-${month}-${m[3]}`;
}

/**
 * Build the engine's signal provider from the point-in-time forecast archive.
 * A provider is built ONCE per competition and is pure: given a ticker, its
 * market and a decision timestamp it returns the newest NWS forecast snapshot
 * captured at or before that time for the market's measurement date — or null.
 *
 * The provider knows about weather brackets only; every other series gets null
 * (which makes a signal-dependent strategy abstain there — by design, not by
 * accident).
 */
export function buildForecastSignalProvider() {
  const bySeries = new Map();
  for (const loc of forecastLocations()) {
    if (!loc.series || !(loc.snapshots || []).length) continue;
    bySeries.set(loc.series, loc);
  }
  if (bySeries.size === 0) return null;
  return (ticker, market, tsSeconds) => {
    const series = (market && market.series_ticker) || String(ticker || '').split('-')[0];
    const loc = bySeries.get(series);
    if (!loc) return null;
    const eventDate = weatherEventDate((market && market.event_ticker) || ticker);
    if (!eventDate) return null;
    const hit = forecastHighAt(loc.snapshots, eventDate, tsSeconds);
    if (!hit) return null;
    return { kind: 'nws-forecast-high', series, eventDate, highF: hit.highF, capturedAt: hit.capturedAt, periodName: hit.periodName, source: 'api.weather.gov point-in-time archive (data/forecasts)' };
  };
}

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
      // WHERE THE PRICES CAME FROM. Distinct from source_url (which documents
      // the market OBJECT): this is the candlestick endpoint URL the ingest job
      // actually fetched the bars with, recorded in the store per market. The
      // trade ledger links each fill to this URL so a reader can fetch the same
      // bar the fill was priced on (see OrderBook.setClock).
      candle_source_url: ACCUMULATED_HISTORY.markets[e.ticker]?.last_ingest_url || null,
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
/**
 * INTRADAY CANDLE MAP (recommended-work item #2).
 *
 * The ingest job stores 60-minute (and optionally 1-minute) bars under
 * data/history/intraday/<period>m/, compiled into ACCUMULATED_INTRADAY. They have
 * no in-repo capture to be a superset of, so they are used as they are — labelled
 * with the store URL per market.
 */
export function getIntradayCandleMap(period = 60, tickers = null) {
  const block = ACCUMULATED_INTRADAY.periods?.[String(period)];
  const out = {};
  if (!block) return out;
  for (const t of Object.keys(block.markets)) {
    if (tickers && !tickers.includes(t)) continue;
    const bars = getIntradayBars(t, period);
    if (bars && bars.length) out[t] = bars;
  }
  return out;
}

/** Coverage + provenance of the intraday store, for the UI and the docs. */
export function getIntradayCoverage(period = 60) {
  const block = ACCUMULATED_INTRADAY.periods?.[String(period)];
  if (!block) {
    return {
      present: false,
      periodIntervalMinutes: period,
      note: 'No intraday store yet. It is produced by the daily ingest when data/history/_ingest-request.json enables the intraday pass.',
      markets: []
    };
  }
  return {
    present: true,
    periodIntervalMinutes: block.periodIntervalMinutes,
    storeDir: block.storeDir,
    browserBarCap: block.browserBarCap,
    marketCount: block.marketCount,
    barCount: block.barCount,
    markets: Object.values(block.markets).map((m) => ({
      ticker: m.ticker,
      bars: m.bar_count,
      barsInStore: m.bars_in_store,
      truncated: m.truncated,
      firstDate: m.first_ts ? new Date(m.first_ts * 1000).toISOString() : null,
      lastDate: m.last_ts ? new Date(m.last_ts * 1000).toISOString() : null,
      lastIngestedAt: m.last_ingested_at,
      url: m.last_ingest_url,
      bookSnapshots: m.book_snapshots,
      periodIntervalMinutes: m.period_interval
    }))
  };
}

/**
 * The captured-ladder map used when a caller asks for depthMode 'captured'
 * (recommended-work item #5). Only markets with a REAL captured order book get a
 * profile; the rest keep the modelled ladder and are reported as such in
 * `depthCoverage`.
 */
export function getCapturedDepthProfiles(tickers = null) {
  const out = {};
  for (const t of getCapturedDepthTickers()) {
    if (tickers && !tickers.includes(t)) continue;
    const profile = getCapturedDepthProfile(t);
    if (profile) out[t] = profile;
  }
  return out;
}

export function runCompetition(options = {}) {
  const strategies = options.strategies || STRATEGIES;
  // REPLAY GRANULARITY: 1440 = the daily competition window (default), 60 or 1 =
  // replay the intraday store instead. Everything downstream (fees, fills, the
  // volume bound, attribution) is identical — only the bar length changes.
  const periodIntervalMinutes = Number(options.periodIntervalMinutes ?? 1440);
  const intradayMap = periodIntervalMinutes !== 1440 ? getIntradayCandleMap(periodIntervalMinutes, options.tickers || null) : null;
  const allMarkets = options.markets || getReplayableMarkets();
  let markets = intradayMap
    ? allMarkets.filter((m) => intradayMap[m.ticker])
    : allMarkets;

  /**
   * INTRADAY-ONLY MARKETS (2026-09-18). The weather brackets (KXHIGHNY) and
   * the 15-minute gold markets (KXGOLD15M) live ONLY in the intraday store —
   * they have no daily file and were therefore absent from the daily replay
   * universe, which used to make every intraday flight that needed them fail
   * with "no markets". Their shipped intraday record carries the SAME captured
   * market object the daily store does, so they are normalized here and added
   * to the flight. Nothing is invented: source, URL and capture time travel
   * with each market exactly as elsewhere.
   */
  if (intradayMap) {
    const known = new Set(markets.map((m) => m.ticker));
    for (const ticker of Object.keys(intradayMap)) {
      if (known.has(ticker)) continue;
      const record = getIntradayMarket(ticker, periodIntervalMinutes);
      if (!record || !record.market) continue;
      const normalized = normalizeMarket(record.market, {
        source: DATA_SOURCE_ACCUMULATED,
        source_url: record.market_url || null,
        candle_source_url: record.last_ingest_url || null,
        captured_at: record.market_captured_at || null,
        candle_origin: 'intraday_store',
        stored_bar_count: record.bar_count
      });
      if (normalized) markets.push(normalized);
    }
  }
  const candlesByTicker = options.candlesByTicker || (intradayMap ? intradayMap : getVerifiedCandleMap(markets.map((m) => m.ticker)));
  const initialCapital = options.initialCapital ?? 100000;
  if (markets.length === 0) {
    throw new Error(
      `runCompetition: no markets for period_interval=${periodIntervalMinutes}. ` +
        (intradayMap
          ? `The intraday store holds ${Object.keys(intradayMap).length} market(s); none of them has a market object in the replay universe.`
          : 'The replay universe is empty.')
    );
  }
  const seed = options.seed ?? 20260917;
  const depthMode = options.depthMode === 'captured' ? 'captured' : 'modelled';
  const depthProfiles = options.depthProfiles || (depthMode === 'captured' ? getCapturedDepthProfiles() : null);

  const signalProvider = options.signalProvider !== undefined ? options.signalProvider : buildForecastSignalProvider();
  const engine = new ReplayEngine({
    markets,
    candlesByTicker,
    initialCapital,
    feeMultiplier: options.feeMultiplier ?? null, // null => resolve per series from captured Series objects
    notional: options.notional ?? 1.0,
    settleAtEnd: options.settleAtEnd ?? false,
    finalResult: options.finalResult || null,
    signalProvider,
    // Per-market capital allocation (item #7). null = the competition default:
    // the brief is "highest return only", so no cap is imposed unless asked for.
    maxNotionalPerMarketPct: options.maxNotionalPerMarketPct ?? null,
    // 'captured' fills against REAL captured order-book ladders re-anchored to
    // each period's real quote; 'modelled' (default) uses the synthetic ladder.
    depthMode,
    depthProfiles,
    depthProfileScale: options.depthProfileScale ?? 1,
    // WALK-FORWARD / OUT-OF-SAMPLE GATE. A unix-seconds split: every bar before
    // it is still replayed (so indicators are warm and history is real) but no
    // order may execute. Passing it produces an out-of-sample number from a
    // fresh account — the only honest way to quote one. See src/forward-test.js.
    noTradeBeforeTs: options.noTradeBeforeTs ?? null,
    // 'partial' (default) fills only real depth and reports the rest as unfilled.
    // 'penalty' is a STRESS mode that invents a price beyond the book; it is
    // never used for headline results and is labelled wherever it appears.
    exhaustionPolicy: options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial',
    // The bar length of this flight (1440 / 60 / 1). Used only to stamp every
    // fill with the real market period it traded in (OrderBook.setClock) so a
    // trade log carries an auditable date instead of the replay's wall clock.
    periodMinutes: periodIntervalMinutes
  });

  const results = strategies.map((strategy) => {
    const universeMarkets = strategy.universe
      ? markets.filter((m) => strategy.universe.includes(m.series_ticker))
      : markets;

    /**
     * A strategy whose universe has NO market in this flight cannot trade here.
     * That is a fact to publish (the design is flight-specific — e.g. a weather
     * bracket strategy in the daily index/BTC flight), never a crash and never
     * a fabricated 0% result pretending to be a measurement. The entry is
     * returned with zero trades, its capital untouched, and skippedFlight
     * carrying the reason; buildLeaderboard keeps it unranked.
     */
    if (universeMarkets.length === 0) {
      const skippedResult = {
        strategyId: strategy.id || strategy.username,
        username: strategy.username,
        strategyTitle: strategy.title || '',
        initialCapital,
        skippedFlight: {
          universe: strategy.universe,
          reason: `no ${strategy.universe ? strategy.universe.join(' / ') : ''} market in this flight's universe — this design cannot trade here`,
          periodIntervalMinutes
        },
        dataProvenance: { markets: [], candles: {} },
        periods: 0,
        noTradeBeforeTs: null,
        suppressedActions: 0,
        exhaustionPolicy: 'partial',
        unfilledOrders: 0,
        unfilledContracts: 0,
        maxNotionalPerMarketPct: null,
        cappedOrders: 0,
        cappedContracts: 0,
        maxFillFractionOfPeriodVolume: null,
        volumeCappedOrders: 0,
        volumeCappedContracts: 0,
        stats: { equity: initialCapital, returnPct: 0, totalTrades: 0, winRate: 0, profitFactor: null, maxDrawdownPct: 0, feesPaid: 0, realizedPnl: 0 },
        finalEquity: initialCapital,
        returnPct: 0,
        totalTrades: 0,
        winRate: 0,
        profitFactor: null,
        maxDrawdownPct: 0,
        feesPaid: 0,
        realizedPnl: 0,
        equityCurve: [{ ts: 0, date: 'SKIPPED', equity: initialCapital, returnPct: 0, trades: 0, drawdownPct: 0 }],
        tradeLog: [],
        actionLog: [],
        settlements: [],
        realSettlements: { eligibleMarkets: [], bookedCount: 0, bookedPayout: 0, lateWindowSettlements: 0 },
        positionsOpen: []
      };
      const attribution = computeAttribution(skippedResult);
      return {
        ...skippedResult,
        marketAnalytics: computePortfolioExposure(skippedResult),
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
        analysis: generatePostMortem(strategy, skippedResult, attribution),
        curveAnalysis: analyzeEquityCurve(skippedResult.equityCurve, initialCapital),
        dataProvenance: {
          markets: [],
          candles: {},
          capturedAt: CAPTURE_META.capturedAt,
          apiBase: CAPTURE_META.apiBase
        },
        recentTrades: []
      };
    }

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
            signalProvider,
            maxNotionalPerMarketPct: options.maxNotionalPerMarketPct ?? null,
            depthMode,
            depthProfiles,
            depthProfileScale: options.depthProfileScale ?? 1,
            noTradeBeforeTs: options.noTradeBeforeTs ?? null,
            exhaustionPolicy: options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial',
            periodMinutes: periodIntervalMinutes
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
      periodIntervalMinutes,
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
      depthMode: engine.depthMode,
      depthCoverage: engine.depthCoverage,
      depthModeNote:
        engine.depthMode === 'captured'
          ? 'Depth came from REAL captured order-book ladders (GET /markets/{ticker}/orderbook), re-anchored to each period\'s real quoted touch. Markets without a captured ladder fell back to the modelled ladder — see depthCoverage per market.'
          : 'Depth behind each bar\'s real quoted touch is MODELLED (candlesticks carry no depth). Every fill from it is labelled depthModel=anchored_synthetic. Run with depthMode "captured" to trade against real captured ladders instead.',
      barLengthNote:
        periodIntervalMinutes === 1440
          ? 'Daily bars (period_interval=1440): each bar is one real Kalshi daily candle.'
          : `${periodIntervalMinutes}-minute bars from the intraday store: a finer window over a shorter period, so the same strategies can be compared on intraday rather than daily fills.`,
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

/**
 * THE THREE FLIGHTS.
 *
 * DAILY (period_interval 1440): every strategy flagged 'daily' (or unflagged)
 *   or 'both', on the full captured history (2025-12-24 → the newest bar).
 * HOURLY (period_interval 60): every strategy flagged 'hourly' or 'both', on
 *   the curated intraday 60-minute store — which since 2026-09-18 also holds
 *   the settled KXHIGHNY weather brackets, each with its real exchange result.
 * MICRO (period_interval 1): every strategy flagged 'micro', on the 1-minute
 *   store (the KXGOLD15M 15-minute gold markets, ~15 bars per market). Added
 *   2026-09-18 because the R01 source traded 15-minute markets and hourly bars
 *   cannot represent them.
 *
 * The three are reported separately and never merged into one ranking, because
 * a strategy's edge can live at one granularity only.
 */
export function runCompetitionFlights(options = {}) {
  const all = options.strategies || STRATEGIES;
  const dailyStrategies = all.filter((s) => !s.flight || s.flight === 'daily' || s.flight === 'both');
  const hourlyStrategies = all.filter((s) => s.flight === 'hourly' || s.flight === 'both');
  const microStrategies = all.filter((s) => s.flight === 'micro');

  const daily = dailyStrategies.length
    ? runCompetition({ ...options, strategies: dailyStrategies, periodIntervalMinutes: 1440 })
    : null;
  let hourly = null;
  let hourlyError = null;
  if (hourlyStrategies.length) {
    try {
      hourly = runCompetition({ ...options, strategies: hourlyStrategies, periodIntervalMinutes: 60 });
    } catch (err) {
      // An empty intraday store is not a failure of the app: it means the ingest
      // has not run the intraday pass yet. Say so instead of inventing a flight.
      hourlyError = String(err && err.message ? err.message : err);
    }
  }
  let micro = null;
  let microError = null;
  if (microStrategies.length) {
    try {
      micro = runCompetition({ ...options, strategies: microStrategies, periodIntervalMinutes: 1 });
    } catch (err) {
      microError = String(err && err.message ? err.message : err);
    }
  }
  return {
    daily,
    hourly,
    hourlyError,
    micro,
    microError,
    flights: { daily: dailyStrategies.length, hourly: hourlyStrategies.length, micro: microStrategies.length }
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
