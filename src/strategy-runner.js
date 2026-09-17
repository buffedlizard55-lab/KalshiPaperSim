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
import { normalizeMarket, DATA_SOURCE } from './kalshi-api.js';
import { getVerifiedMarkets, getVerifiedCandlesticks, CANDLESTICKS, CAPTURE_META, seriesFeeConfig } from './verified-snapshot.js';
import { EXTENDED_CAPTURE_META, getExtendedCandlesticks, summarizeExtendedSeries } from './verified-candles.js';

/** Markets in the verified snapshot that actually have candlestick history. */
export function getReplayableMarkets() {
  return getVerifiedMarkets()
    .filter((m) => CANDLESTICKS[m.ticker])
    .map((m) => normalizeMarket(m, { source: DATA_SOURCE.VERIFIED_SNAPSHOT, source_url: m._provenance?.url, captured_at: m._provenance?.capturedAt }));
}

/**
 * Build the { ticker: candlesticks } map from the verified captures.
 *
 * The extended capture is preferred when one exists: it is a verified SUPERSET
 * of the original short capture — every overlapping bar was compared
 * field-by-field and matched exactly (see test/simulation.test.js
 * "extended candle capture is a verified superset of the snapshot capture").
 */
export function getVerifiedCandleMap(tickers = null) {
  const out = {};
  for (const [ticker, block] of Object.entries(CANDLESTICKS)) {
    if (tickers && !tickers.includes(ticker)) continue;
    out[ticker] = getExtendedCandlesticks(ticker) || block.candlesticks;
  }
  return out;
}

/** Provenance + bar counts per replayable market (shown in the UI and docs). */
export function getCandleCoverage() {
  const map = getVerifiedCandleMap();
  return Object.entries(map).map(([ticker, bars]) => ({
    ticker,
    bars: bars.length,
    firstTs: bars[0]?.end_period_ts ?? null,
    lastTs: bars[bars.length - 1]?.end_period_ts ?? null,
    firstDate: bars[0] ? new Date(bars[0].end_period_ts * 1000).toISOString() : null,
    lastDate: bars.length ? new Date(bars[bars.length - 1].end_period_ts * 1000).toISOString() : null,
    periodIntervalMinutes: ticker === EXTENDED_CAPTURE_META.ticker ? EXTENDED_CAPTURE_META.periodIntervalMinutes : 1440,
    source: ticker === EXTENDED_CAPTURE_META.ticker ? 'extended_capture_61_bars' : 'snapshot_capture',
    url: ticker === EXTENDED_CAPTURE_META.ticker ? EXTENDED_CAPTURE_META.url : CANDLESTICKS[ticker]?._provenance?.url || null
  }));
}

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
    finalResult: options.finalResult || null
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
            finalResult: options.finalResult || null
          });

    const result = universeEngine.run(strategy, { username: strategy.username, capital: initialCapital, seed });
    const attribution = computeAttribution(result);
    const analysis = generatePostMortem(strategy, result, attribution);
    const curve = analyzeEquityCurve(result.equityCurve, initialCapital);

    return {
      ...result,
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

  return {
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
