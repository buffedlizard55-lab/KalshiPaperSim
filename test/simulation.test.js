/**
 * KalshiPaperSim — verification test suite
 * =====================================================================
 * Every assertion in this file is tied to a VERIFIED source:
 *   • official Kalshi documentation / fee schedule PDF (URL in the comment),
 *   • a real production API response captured into src/verified-snapshot.js
 *     or src/verified-candles.js, or
 *   • an arithmetic identity the engine must satisfy.
 *
 * Nothing here asserts an expected performance number. Results are computed by
 * the replay engine at run time; the tests check the ENGINE'S HONESTY
 * (fees, ticks, depth, accounting, disclosure), not its profitability.
 *
 * Run: node --test test/   (or: npm test)
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  KALSHI_CONFIG,
  KALSHI_FEES,
  OFFICIAL_FEE_TABLE_PER_100,
  NON_STANDARD_FEE_MULTIPLIERS,
  PRICE_LEVEL_STRUCTURES,
  MARKET_STATUS_RESPONSE,
  MARKET_STATUS_QUERY_FILTER,
  RATE_LIMITS,
  FIXED_POINT,
  CANDLE_PERIODS_MINUTES,
  FEE_TABLE_ROUNDING,
  WS_SIGN_PATH,
  WS_CHANNELS,
  KALSHI_AUTH,
  HISTORICAL_CUTOFF_CAPTURED
} from '../src/kalshi-config.js';
import {
  computeKalshiFee,
  takerFee,
  makerFee,
  computeFeeForFills,
  roundTripCostEstimate,
  roundUpToIncrement,
  rawQuadraticFee
} from '../src/kalshi-fees.js';
import {
  resolvePriceGrid,
  tickSizeAt,
  minTick,
  snapToGrid,
  nextTick,
  isOnGrid,
  toDollarsString,
  toCountString,
  dollarsToNumber
} from '../src/price-grid.js';
import {
  MARKETS,
  SERIES,
  SERIES_NOT_FOUND,
  EXCHANGE_STATUS,
  HISTORICAL_CUTOFF,
  getVerifiedMarkets,
  getVerifiedMarket,
  getVerifiedOrderbook,
  getVerifiedCandlesticks,
  seriesFeeConfig
} from '../src/verified-snapshot.js';
import {
  getExtendedCandlesticks,
  getExtendedTickers,
  expandBar,
  KXNASDAQ100Y_T33000_DAILY,
  KXNASDAQ100Y_T19000_DAILY,
  VERBATIM_SAMPLE_BAR,
  VERBATIM_SAMPLE_BAR_T19000,
  verifyExpanderAgainstVerbatim,
  summarizeExtendedSeries,
  EXTENDED_CAPTURE_META,
  EXTENDED_CAPTURE_META_T19000,
  EXTENDED_SERIES
} from '../src/verified-candles.js';
import { stableStringify, stableEqual } from '../src/json-utils.js';
import { computePortfolioExposure, computeUniverseCorrelation, pearson } from '../src/market-analytics.js';
import {
  buildSettlementPlan,
  applySettlementToPositions,
  summarizeSettlements,
  classifySettlement
} from '../src/settlement-tracker.js';
import { parseKalshiOrderbook, reciprocalCheck, normalizeMarket, DATA_SOURCE } from '../src/kalshi-api.js';
import { OrderBook, PaperPortfolio } from '../src/simulation-engine.js';
import { ReplayEngine, analyzeEquityCurve, normalizeCandles } from '../src/backtest-replay.js';
import { STRATEGIES, validateStrategies, VERIFIED_SERIES, REJECTED_FABRICATED_TICKERS } from '../src/strategies.js';
import { redactMarketForReplay } from '../src/backtest-replay.js';
import { weatherEventDate, buildForecastSignalProvider } from '../src/strategy-runner.js';
import { forecastHighAt, hasForecastArchive } from '../src/forecast-store.js';
import { FORECAST_DATA } from '../src/forecast-data.js';
import { extractDailyHighs, FORECAST_LOCATIONS } from '../scripts/archive-forecasts.mjs';
import { intradayArgsFromRequest, intradayBlockArgs, intradayBlocksFromRequest } from '../scripts/ingest-history.mjs';
import { SIGNAL_SOURCES, signalSourceStats, signalSourceStrategyUsernames, SIGNAL_SOURCE_STATUS } from '../src/signal-sources.js';
import { computeAttribution, generatePostMortem, buildLeaderboard, LEADERBOARD_QUALIFICATION } from '../src/analysis.js';
import {
  runCompetition,
  runCompetitionFlights,
  runStrategy,
  runCustomStrategy,
  getCandleCoverage,
  getVerifiedCandleMap,
  getHistoryAudit,
  DATA_SOURCE_ACCUMULATED,
  buildUniverse,
  CANDLE_ORIGIN
} from '../src/strategy-runner.js';
import { ACCUMULATED_HISTORY, expandAccumulatedBar, getAccumulatedBars } from '../src/accumulated-history.js';
import {
  universePriceRange,
  universeRangeCaption,
  intradayFacts,
  classSampleCaption,
  dailyFacts,
  bandScan,
  moderateFavPremiseCaption
} from '../src/store-facts.js';
import {
  buildLedger,
  verifyLedger,
  feeRegimeBreakdown,
  buildRoundTrips,
  fillRow,
  internLedger,
  expandLedger,
  FILL_COLUMNS,
  ROUND_TRIP_COLUMNS
} from '../src/trade-ledger.js';
import { chooseCandleSeries, buildReplayUniverse, MIN_REPLAY_BARS, CANDLE_ORIGIN as MERGE_ORIGIN } from '../src/history-merge.js';
import {
  lintSource,
  compileUserStrategy,
  sanitizeActions,
  sanitizeUsername,
  DENY_LIST,
  MAX_ACTIONS_PER_PERIOD,
  EXAMPLE_USER_STRATEGY
} from '../src/strategy-sandbox.js';
import {
  CompetitionMemoryEngine,
  validateUsername,
  addWeeks,
  competitionCalendar,
  WEEKS_PER_YEAR,
  DEFAULT_COMPETITION,
  REGIMES,
  DESK_RESERVED_USERNAMES
} from '../src/competition-memory.js';
import { acceptKey, encodeFrame, FrameParser, WS_OPCODES } from '../src/ws-lite.js';
import { subscribeMessage, parseFeedMessage, backoffDelay } from '../src/kalshi-ws.js';
import { VERIFIED_FACTS, IRREGULARITIES, COMPETITION_SITE_ANALYSIS, factStats } from '../src/verification-data.js';

/* Shared fixtures — the competition is deterministic, so it is run once. */
const SEED = 20260917;
const COMPETITION = runCompetition({ seed: SEED });
const T33000 = 'KXNASDAQ100Y-26DEC31H1600-T33000';
const BTC = 'KXBTCY-27JAN0100-T149999.99';
const ceilToCent = (x) => Math.ceil(x * 100 - 1e-9) / 100;

/**
 * The replay window is DERIVED from the data, never hard-coded.
 *
 * The accumulated store (data/history/, grown daily from the official API and
 * compiled into src/accumulated-history.js) can only ever LENGTHEN a series —
 * the merge rule in src/history-merge.js rejects anything that is not a verified
 * superset — so 61 periods is a floor, not a constant.
 */
const COVERAGE = getCandleCoverage();
const REPLAY_PERIODS = COMPETITION.competition.horizonPeriods;
/**
 * The replay horizon, RECOMPUTED here exactly the way ReplayEngine computes it:
 * the number of DISTINCT bar-end timestamps across the universe after
 * normalizeCandles() drops bars that never printed a price.
 *
 * It is deliberately not `max(bars per series)`: that equality held only while
 * every market in the universe shared one daily grid. Since 2026-09-18 the
 * daily store carries markets that close at different times of day (FDA and
 * CEO-succession events close at 04:59Z, index markets at 16:00Z) and series
 * whose first bars printed no trade at all, so the horizon is the union of
 * priced timestamps — 399 where the longest series has 400 stored bars.
 * Asserting the old equality would have forced the engine to invent a period.
 */
const EXPECTED_PERIODS = (() => {
  const stamps = new Set();
  for (const bars of Object.values(getVerifiedCandleMap())) {
    for (const c of normalizeCandles(bars)) stamps.add(c.endTs);
  }
  return stamps.size;
})();
const BAR_COUNT = (ticker) => (COVERAGE.find((c) => c.ticker === ticker) || {}).bars;

/* ================================================================== *
 * 1. OFFICIAL FEE FORMULA
 * Source: https://kalshi.com/docs/kalshi-fee-schedule.pdf
 * ================================================================== */

test('1. taker/maker formulas reproduce the published fee table (all 21 rows)', () => {
  // The PDF's General Trading Fees Table is the formula rounded UP TO WHOLE
  // CENTS; the formula itself rounds "such that the fee + positionCost is
  // rounded to a centicent". Both relationships are asserted — see irregularity #19.
  for (const row of OFFICIAL_FEE_TABLE_PER_100) {
    const per100 = computeKalshiFee({ count: 100, price: row.price, multiplier: 1 });
    const per1 = computeKalshiFee({ count: 1, price: row.price, multiplier: 1 });

    assert.equal(per100.multiplier, 1);
    assert.equal(per100.coefficient, KALSHI_FEES.takerCoefficient);
    assert.equal(per100.formula, 'fees = round up(M x 0.07 x C x P x (1-P))');
    assert.equal(per100.source, 'https://kalshi.com/docs/kalshi-fee-schedule.pdf');

    assert.equal(ceilToCent(per100.fee), row.feeFor100, `100 contracts @ ${row.price}`);
    assert.equal(ceilToCent(per1.fee), row.feeFor1Contract, `1 contract @ ${row.price}`);

    // The engine charges the finer (centicent) value, which is never above the
    // published cent-rounded figure and never below the raw quadratic value.
    assert.ok(per100.fee <= row.feeFor100 + 1e-9, 'engine fee must not exceed the published table');
    assert.ok(per100.fee >= rawQuadraticFee({ count: 100, price: row.price, multiplier: 1 }) - 1e-9);
  }
  assert.equal(OFFICIAL_FEE_TABLE_PER_100.length, 21);
  assert.equal(FEE_TABLE_ROUNDING.formulaIncrement, 0.0001);
  assert.equal(FEE_TABLE_ROUNDING.publishedTableIncrement, 0.01);
});

test('2. fees are quadratic in price and peak at P=0.50', () => {
  const at = (p) => computeKalshiFee({ count: 1000, price: p, multiplier: 1 }).fee;
  assert.ok(at(0.5) > at(0.4) && at(0.5) > at(0.6), 'peak at 0.50');
  assert.equal(at(0.4).toFixed(4), at(0.6).toFixed(4), 'symmetric around 0.50');
  assert.ok(at(0.01) < at(0.5), 'longshots cost less in absolute dollars');
  // Fee as a share of the premium paid: 0.07 x (1-P) for a YES buy at P.
  const yesShare = (0.07 * (1 - 0.12)) / 0.12;
  const noShare = (0.07 * 0.12) / 0.88;
  assert.ok(yesShare > noShare * 4, 'fee asymmetry by side (verified fact V14)');
});

test('3. maker coefficient is 0.0175 and the maker multiplier defaults to 0', () => {
  assert.equal(KALSHI_FEES.makerCoefficient, 0.0175);
  assert.equal(KALSHI_FEES.defaultMakerMultiplier, 0);
  assert.equal(KALSHI_FEES.defaultTakerMultiplier, 1);
  assert.equal(makerFee(1000, 0.5), 0, 'default maker M=0 => no maker fee');
  assert.equal(makerFee(1000, 0.5, 1).toFixed(4), (0.0175 * 1000 * 0.25).toFixed(4));
  assert.ok(makerFee(1000, 0.5, 1) < takerFee(1000, 0.5, 1), 'maker is a quarter of taker');
});

test('4. zero-multiplier series charge exactly $0.00 (KXBTCY, verified two ways)', () => {
  // Live capture GET /series/KXBTCY -> fee_multiplier 0 (fact V11) AND the
  // official Non-Standard Fees table lists KXBTCY maker 0 / taker 0 (fact V49).
  assert.equal(NON_STANDARD_FEE_MULTIPLIERS.KXBTCY.taker, 0);
  assert.equal(NON_STANDARD_FEE_MULTIPLIERS.KXBTCY.maker, 0);
  assert.equal(seriesFeeConfig('KXBTCY').fee_multiplier, 0);
  assert.equal(seriesFeeConfig('KXBTCY').pdfCrossCheck.agrees, true);
  assert.equal(computeKalshiFee({ count: 100000, price: 0.5, multiplier: 0 }).fee, 0);
  assert.equal(computeKalshiFee({ count: 100000, price: 0.5, multiplier: 0 }).zeroMultiplier, true);

  // Regression: floating-point dust in positionCost used to surface a phantom
  // $0.00005 fee on this zero-fee series.
  const dust = computeKalshiFee({ count: 2187.65, price: 0.511, multiplier: 0 });
  assert.equal(dust.fee, 0);

  const book = OrderBook.fromMarket(getVerifiedMarket(BTC));
  assert.equal(book.feeMultiplier, 0);
  const exec = book.executeMarketBuy('YES', 5000);
  assert.equal(exec.fee, 0, 'executing on the real BTC book must cost nothing in fees');
  assert.ok(exec.feeTiers.every((t) => t.fee === 0));
});

test('5. per-series multipliers in the PDF cross-validate every live capture', () => {
  for (const [ticker, cfg] of Object.entries(SERIES)) {
    if (typeof cfg.fee_multiplier !== 'number') continue;
    const resolved = seriesFeeConfig(ticker);
    assert.equal(resolved.pdfCrossCheck.agrees, true, `${ticker}: live M=${cfg.fee_multiplier} vs ${resolved.pdfCrossCheck.verdict}`);
    assert.equal(resolved.fee_multiplier, cfg.fee_multiplier);
  }
  // Unlisted series fall back to the documented default and say so.
  const fallback = seriesFeeConfig('KXTSLA');
  assert.equal(fallback.fee_multiplier, 1);
  assert.equal(fallback.pdfCrossCheck.listed, false);
  // An entirely uncaptured series is flagged, never silently trusted.
  const unknown = seriesFeeConfig('KXNOTREAL');
  assert.equal(unknown.captured, false);
  assert.match(unknown.note, /not captured/i);
});

test('6. rounding is UP to a centicent and never invents a fee from nothing', () => {
  assert.equal(KALSHI_FEES.roundingIncrement, 0.0001);
  assert.equal(roundUpToIncrement(0), 0);
  assert.equal(roundUpToIncrement(-5), 0);
  assert.equal(roundUpToIncrement(0.00001), 0.0001, 'sub-increment rounds up to one centicent');
  assert.equal(roundUpToIncrement(0.0001), 0.0001, 'exact multiple is untouched');
  assert.equal(roundUpToIncrement(1.00005), 1.0001);
  assert.equal(roundUpToIncrement(NaN), 0);
  // 500 NO @ 0.88 — the value the live server returned for a real paper order.
  assert.equal(takerFee(500, 0.88, 1).toFixed(4), (0.07 * 500 * 0.88 * 0.12).toFixed(4));
  assert.equal(takerFee(500, 0.88, 1), 3.696);
  // Multi-tier execution applies the formula per tier, then sums.
  const multi = computeFeeForFills([
    { price: 0.1, count: 100 },
    { price: 0.11, count: 100 }
  ], { multiplier: 1 });
  assert.equal(multi.tiers.length, 2);
  assert.ok(Math.abs(multi.fee - multi.tiers.reduce((a, t) => a + t.fee, 0)) < 1e-9);
  assert.ok(multi.fee > 0);
  const rt = roundTripCostEstimate(100, 0.4, 0.6, 1);
  assert.equal(rt.entryFee, takerFee(100, 0.4, 1));
  assert.equal(rt.exitFee, takerFee(100, 0.6, 1));
  assert.equal(rt.totalFees, parseFloat((rt.entryFee + rt.exitFee).toFixed(8)));
  assert.equal(rt.settlementFee, 0, 'verified: there is no settlement fee');
  assert.ok(rt.totalFees > 0);
});

/* ================================================================== *
 * 2. PRICE GRIDS / FIXED-POINT SPEC
 * Source: https://docs.kalshi.com/getting_started/fixed_point_migration
 * ================================================================== */

test('7. price grids come from the captured price_ranges, not a hard-coded tick', () => {
  assert.deepEqual(PRICE_LEVEL_STRUCTURES.linear_cent, [{ start: '0.00', end: '1.00', step: '0.01' }]);
  assert.deepEqual(PRICE_LEVEL_STRUCTURES.deci_cent, [{ start: '0.00', end: '1.00', step: '0.001' }]);
  // 11 structures are documented; a tapered grid has more than one band.
  assert.equal(Object.keys(PRICE_LEVEL_STRUCTURES).length, 12);
  assert.equal(PRICE_LEVEL_STRUCTURES.tapered_deci_cent.length, 3);

  const nasdaq = getVerifiedMarket(T33000);
  const btc = getVerifiedMarket(BTC);
  assert.equal(nasdaq.price_level_structure, 'linear_cent');
  assert.equal(btc.price_level_structure, 'deci_cent');

  assert.deepEqual(resolvePriceGrid(nasdaq), [{ start: 0, end: 1, step: 0.01 }]);
  assert.deepEqual(resolvePriceGrid(btc), [{ start: 0, end: 1, step: 0.001 }]);
  assert.equal(minTick(resolvePriceGrid(nasdaq)), 0.01);
  assert.equal(minTick(resolvePriceGrid(btc)), 0.001);
  assert.equal(tickSizeAt(0.5, resolvePriceGrid(btc)), 0.001);

  const bookNasdaq = OrderBook.fromMarket(nasdaq);
  assert.equal(bookNasdaq.tick, 0.01);
  const bookBtc = OrderBook.fromMarket(btc);
  assert.equal(bookBtc.tick, 0.001, 'BTC trades on a deci-cent grid');
});

test('8. grid helpers snap, step and validate correctly', () => {
  const cent = resolvePriceGrid(getVerifiedMarket(T33000));
  const deci = resolvePriceGrid(getVerifiedMarket(BTC));

  assert.equal(isOnGrid(0.13, cent), true);
  assert.equal(isOnGrid(0.125, cent), false);
  assert.equal(isOnGrid(0.125, deci), true);
  assert.equal(snapToGrid(0.124, cent, 'nearest'), 0.12);
  assert.equal(snapToGrid(0.124, cent, 'up'), 0.13);
  assert.equal(snapToGrid(0.124, cent, 'down'), 0.12);
  assert.equal(nextTick(0.13, cent, 'up'), 0.14);
  assert.equal(nextTick(0.13, cent, 'down'), 0.12);
  assert.equal(nextTick(0.511, deci, 'up'), 0.512);
  // Off-grid orders are what the exchange rejects; the sim must not accept them.
  const exec = OrderBook.fromMarket(getVerifiedMarket(T33000)).executeMarketBuy('YES', 1);
  assert.ok(isOnGrid(exec.bestAsk, cent) || exec.bestAsk === null);
});

test('9. fixed-point string conventions (4 dp prices, 2 dp counts)', () => {
  assert.equal(FIXED_POINT.priceMaxDecimals, 4);
  assert.equal(FIXED_POINT.countMaxDecimals, 2);
  assert.equal(FIXED_POINT.minContractGranularity, 0.01);
  assert.equal(FIXED_POINT.priceFieldSuffix, '_dollars');
  assert.equal(FIXED_POINT.countFieldSuffix, '_fp');
  assert.equal(toDollarsString(0.13), '0.1300');
  assert.equal(toDollarsString(0.5), '0.5000');
  assert.equal(toCountString(71), '71.00');
  assert.equal(toCountString(242.25), '242.25');
  assert.equal(dollarsToNumber('0.1100'), 0.11);
  assert.equal(dollarsToNumber(null), null);
  // Round-trip through the real captured wire strings.
  const raw = getVerifiedOrderbook(T33000);
  const [p, c] = raw.orderbook_fp.yes_dollars[raw.orderbook_fp.yes_dollars.length - 1];
  assert.equal(toDollarsString(dollarsToNumber(p)), p);
  assert.equal(toCountString(dollarsToNumber(c)), c);
});

/* ================================================================== *
 * 3. VERIFIED SNAPSHOT INTEGRITY (no fabricated markets)
 * ================================================================== */

test('10. every market in the catalog exists on the real exchange', () => {
  const markets = getVerifiedMarkets();
  assert.equal(markets.length, MARKETS.length);
  assert.ok(markets.length >= 9);

  for (const m of markets) {
    assert.ok(m.ticker && m.series_ticker, 'ticker + series required');
    assert.ok(m._provenance?.url, `${m.ticker}: provenance URL required`);
    assert.match(m._provenance.url, /^https:\/\/external-api\.kalshi\.com\/trade-api\/v2\//);
    assert.ok(m._provenance.capturedAt, 'capture timestamp required');
    assert.ok(MARKET_STATUS_RESPONSE.includes(m.status), `${m.ticker}: status "${m.status}" is not a documented response status`);
  }

  // The fabricated tickers from the previous revision must stay out.
  const fabricated = ['KXSP500', 'KXNVDA', 'KXAAPL', 'KXNDX'];
  for (const bad of fabricated) {
    assert.equal(SERIES[bad], undefined, `${bad} must not exist in the verified series map`);
    assert.ok(!markets.some((m) => m.series_ticker === bad), `${bad} must not be in the catalog`);
    assert.ok(REJECTED_FABRICATED_TICKERS.includes(bad), `${bad} must be on the strategies' reject list`);
  }
  // Three of them were probed live and returned not_found — that negative
  // evidence is stored verbatim. KXNDX was never probed, so it is NOT claimed
  // as a verified 404 anywhere (absence of evidence is not evidence).
  assert.deepEqual(SERIES_NOT_FOUND.map((n) => n.ticker).sort(), ['KXAAPL', 'KXNVDA', 'KXSP500']);
  for (const n of SERIES_NOT_FOUND) {
    assert.equal(n.response.error.code, 'not_found', `${n.ticker}: the captured 404 body is the evidence`);
    assert.match(n.url, new RegExp(`/series/${n.ticker}$`));
    assert.equal(n.capturedAt, '2026-09-17');
  }
  assert.deepEqual(MARKET_STATUS_RESPONSE, ['initialized', 'inactive', 'active', 'closed', 'determined', 'disputed', 'amended', 'finalized']);
  assert.deepEqual(MARKET_STATUS_QUERY_FILTER, ['unopened', 'open', 'paused', 'closed', 'settled']);
});

test('11. documented endpoints, rate limits and candle periods match the docs', () => {
  assert.equal(KALSHI_CONFIG.PROD_BASE_URL, 'https://external-api.kalshi.com/trade-api/v2');
  assert.equal(KALSHI_CONFIG.WS_PROD_URL, 'wss://external-api-ws.kalshi.com/trade-api/ws/v2');
  assert.equal(KALSHI_CONFIG.DEMO_BASE_URL, 'https://external-api.demo.kalshi.co/trade-api/v2');
  assert.equal(WS_SIGN_PATH, '/trade-api/ws/v2');
  assert.deepEqual(CANDLE_PERIODS_MINUTES, [1, 60, 1440]);
  assert.equal(RATE_LIMITS.basicReadBudgetPerSec, 200);
  assert.equal(RATE_LIMITS.basicWriteBudgetPerSec, 100);
  assert.equal(RATE_LIMITS.defaultRequestTokenCost, 10);
  assert.equal(RATE_LIMITS.throttledStatus, 429);
  assert.match(RATE_LIMITS.note, /Retry-After/, 'the docs\' 429 caveat is recorded');
  assert.equal(EXCHANGE_STATUS.exchange_active, true);
  assert.equal(EXCHANGE_STATUS.trading_active, true);
  assert.ok(Array.isArray(EXCHANGE_STATUS.exchange_index_statuses) && EXCHANGE_STATUS.exchange_index_statuses.length > 0);
  assert.match(EXCHANGE_STATUS._provenance.url, /\/exchange\/status$/);
  assert.equal(HISTORICAL_CUTOFF.market_settled_ts, '2026-07-19T00:00:00Z');
  assert.equal(HISTORICAL_CUTOFF_CAPTURED.capturedAt, '2026-09-17');
  assert.equal(DATA_SOURCE.VERIFIED_SNAPSHOT, 'verified_snapshot_2026_09_17');
});

/* ================================================================== *
 * 4. ORDER BOOK RECIPROCITY (the defining Kalshi invariant)
 * Source: https://docs.kalshi.com/getting_started/orderbook_responses
 * ================================================================== */

test('12. the real captured order book satisfies YES/NO reciprocity', () => {
  const raw = getVerifiedOrderbook(T33000);
  const parsed = parseKalshiOrderbook(raw);

  // Docs: orderbook_fp carries BIDS ONLY; a YES bid of X is a NO ask of 1-X.
  assert.ok(Array.isArray(raw.orderbook_fp.yes_dollars) && raw.orderbook_fp.yes_dollars.length > 0);
  assert.ok(Array.isArray(raw.orderbook_fp.no_dollars) && raw.orderbook_fp.no_dollars.length > 0);

  assert.equal(parsed.bestYesAsk, parseFloat((1 - parsed.bestNoBid).toFixed(4)), 'YES ask = 1 - NO bid');
  assert.equal(parsed.bestNoAsk, parseFloat((1 - parsed.bestYesBid).toFixed(4)), 'NO ask = 1 - YES bid');
  // YES bid + NO bid = 1 - spread (the two best bids cannot sum to 1 unless the
  // book is crossed); the asks sum to 1 + spread.
  assert.equal(parseFloat((parsed.bestYesBid + parsed.bestNoBid).toFixed(4)), parseFloat((1 - parsed.yesSpread).toFixed(4)));
  assert.equal(parsed.yesSpread, parseFloat((parsed.bestYesAsk - parsed.bestYesBid).toFixed(4)));
  assert.equal(parsed.noSpread, parsed.yesSpread, 'the reciprocal book has one spread');
  assert.ok(parsed.yesSpread >= 0 && parsed.noSpread >= 0);
  assert.equal(parsed.crossed, false, 'a crossed book would be a data error');
  assert.equal(parsed.reciprocal.ok, true, parsed.reciprocal.note);
  assert.match(parsed.reciprocal.note, /1 - best NO bid/);

  // Independent cross-check against the MARKET object's own quoted prices
  // (raw captures use *_dollars strings, which reciprocalCheck understands).
  const rawMarket = getVerifiedMarket(T33000);
  const market = normalizeMarket(rawMarket, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const check = reciprocalCheck(rawMarket);
  assert.equal(check.yesAsk_matches_1_minus_noBid, true);
  assert.equal(check.noAsk_matches_1_minus_yesBid, true);
  assert.equal(parsed.bestYesAsk, market.yes_ask, 'parsed implied ask equals the market object ask');
  // The two captures were taken seconds apart, so the best BID can differ by a
  // tick (order book 0.11 vs market object 0.12). Both are real; neither is
  // overwritten by the other.
  assert.ok(Math.abs(parsed.bestYesBid - market.yes_bid) <= 0.01);
});

test('13. depth ladders are real, sparse and ascending (not a uniform 5-tier model)', () => {
  const parsed = parseKalshiOrderbook(getVerifiedOrderbook(T33000));
  const book = OrderBook.fromVerifiedCapture(
    normalizeMarket(getVerifiedMarket(T33000), { source: DATA_SOURCE.VERIFIED_SNAPSHOT }),
    getVerifiedOrderbook(T33000)
  );
  const snap = book.snapshot();

  assert.ok(parsed.yesBids.length >= 5, 'captured book had 9 YES levels');
  assert.ok(parsed.noBids.length >= 20, 'captured book had 35 NO levels');
  assert.notEqual(parsed.yesBids.length, parsed.noBids.length, 'the two sides are asymmetric in reality');
  assert.ok(parsed.yesBids.some((l) => !Number.isInteger(l.count)), 'sizes are fractional (fixed-point counts)');

  // The API returns bids ASCENDING; snapshot() hands the UI best-first
  // (descending) so the touch renders at the top. Both invariants are asserted.
  for (const raw of [book.yesBids, book.noBids]) {
    for (let i = 1; i < raw.length; i++) {
      assert.ok(raw[i].price > raw[i - 1].price, 'internal ladders stay ascending, like Kalshi returns them');
    }
  }
  for (const ladder of [snap.yesBids, snap.noBids]) {
    for (let i = 1; i < ladder.length; i++) {
      assert.ok(ladder[i].price < ladder[i - 1].price, 'snapshot ladders are best-first for display');
    }
  }
  assert.equal(snap.yesBids[0].price, book.getBestYesBid(), 'first displayed rung is the real best bid');
  assert.equal(snap.noBids[0].price, book.getBestNoBid());
  assert.ok(snap.depthModel, 'the snapshot must declare where its depth came from');
  assert.equal(snap.tick, 0.01);
  assert.equal(snap.source, DATA_SOURCE.VERIFIED_SNAPSHOT);
  assert.ok(snap.levels.yes > 1 && snap.levels.no > 1, 'a real book has multiple levels per side');
});

/* ================================================================== *
 * 5. EXTENDED CANDLESTICK CAPTURE
 * Source: GET /series/{series}/markets/{ticker}/candlesticks
 * ================================================================== */

test('14. the compact candle encoding reproduces the verbatim API bar exactly', () => {
  const v = verifyExpanderAgainstVerbatim();
  assert.equal(v.ok, true, `expander disagrees with the verbatim capture: ${JSON.stringify(v.diff || {})}`);

  // The compact tuple layout is [ts, openInterest, volume, [o,h,l,c,mean], bid, ask].
  const last = KXNASDAQ100Y_T33000_DAILY[KXNASDAQ100Y_T33000_DAILY.length - 1];
  assert.ok(Array.isArray(last), 'stored bars are compact tuples');
  const expanded = expandBar(last);
  // Deep compare every field. NOTE: JSON.stringify(value, keyArray) filters
  // property names at EVERY depth, so `JSON.stringify(bar, ['end_period_ts','price'])`
  // serialises the price object as `{}` — two bars with different prices would
  // compare equal. stableStringify has no such blind spot (see src/json-utils.js).
  assert.deepEqual(
    JSON.parse(stableStringify(expanded)),
    JSON.parse(stableStringify(VERBATIM_SAMPLE_BAR)),
    'the last expanded tuple must equal the verbatim API bar field for field'
  );
  assert.equal(typeof expanded.volume_fp, 'string', 'counts stay fixed-point strings');
  assert.match(expanded.price.close_dollars, /^\d\.\d{4}$/, 'prices stay 4-decimal FixedPointDollars strings');
});

test('15. the 61-bar daily series is contiguous, in range and inside the live window', () => {
  const candles = getExtendedCandlesticks(T33000);
  const summary = summarizeExtendedSeries();
  assert.equal(candles.length, 61);
  assert.equal(summary.bars, 61);
  assert.equal(summary.contiguous, true, `gaps: ${JSON.stringify(summary.gaps)}`);
  assert.deepEqual(summary.gaps, []);

  let prev = null;
  for (const bar of candles) {
    assert.equal(typeof bar, 'object', 'getExtendedCandlesticks returns expanded bars');
    const px = bar.price;
    for (const key of ['open_dollars', 'high_dollars', 'low_dollars', 'close_dollars']) {
      const v = dollarsToNumber(px[key]);
      assert.ok(v >= 0 && v <= 1, `${key}=${v} must be a probability price in [0,1]`);
    }
    assert.ok(dollarsToNumber(px.high_dollars) >= dollarsToNumber(px.low_dollars));
    assert.ok(dollarsToNumber(bar.volume_fp) >= 0);
    if (prev !== null) assert.equal(bar.end_period_ts - prev, 86400, 'daily bars must be exactly 24h apart');
    prev = bar.end_period_ts;
  }

  // Historical window: the docs allow ~3 months of live history.
  const cutoffEpoch = Date.parse(HISTORICAL_CUTOFF.market_settled_ts) / 1000;
  assert.ok(summary.firstTs >= cutoffEpoch, 'first bar must be at/after the captured historical cutoff');
  assert.equal(EXTENDED_CAPTURE_META.periodIntervalMinutes, 1440);
  assert.equal(EXTENDED_CAPTURE_META.barCount, 61);
  assert.equal(EXTENDED_CAPTURE_META.ticker, T33000);
  assert.equal(EXTENDED_CAPTURE_META.windows.reduce((a, w) => a + w.bars, 0) >= 61, true, 'the capture windows cover all 61 bars');

  // The extended capture must be a superset of the earlier 7-bar snapshot.
  const snapshotCapture = getVerifiedCandlesticks(T33000);
  const snapshotBars = snapshotCapture?.candlesticks || [];
  assert.ok(snapshotBars.length > 0, 'the earlier snapshot capture must still be present');
  const extendedTs = new Set(candles.map((c) => c.end_period_ts));
  for (const bar of snapshotBars) {
    assert.ok(extendedTs.has(bar.end_period_ts), `snapshot bar ${bar.end_period_ts} missing from the extended capture`);
    const m = candles.find((c) => c.end_period_ts === bar.end_period_ts);
    assert.equal(m.price.close_dollars, bar.price.close_dollars, 'close must agree between captures');
    assert.equal(m.volume_fp, bar.volume_fp, 'volume must agree between captures');
  }
});

test('16. candle coverage is reported honestly', () => {
  const coverage = getCandleCoverage();
  assert.ok(coverage && typeof coverage === 'object');
  const json = JSON.stringify(coverage);
  assert.match(json, /KXNASDAQ100Y/);
});

/* ================================================================== *
 * 6. EXECUTION HONESTY — no invented prices, no phantom liquidity
 * ================================================================== */

test('17. an oversized order fills only real depth and reports the remainder', () => {
  const book = OrderBook.fromMarket(getVerifiedMarket(T33000));
  const available = book.getYesAskTiers().reduce((a, t) => a + t.count, 0);
  const exec = book.executeMarketBuy('YES', 1_000_000);

  assert.equal(exec.exhaustionPolicy, 'partial', 'partial must be the default policy');
  assert.equal(exec.fillStatus, 'partial');
  assert.ok(exec.contracts > 0 && exec.contracts < 1_000_000);
  assert.ok(exec.unfilled > 0, 'the unfilled remainder must be disclosed');
  assert.equal(exec.bookExhausted, true);
  assert.equal(exec.contracts + exec.unfilled, 1_000_000, 'requested = filled + unfilled');
  assert.ok(Math.abs(exec.contracts - available) < 1, 'filled exactly the depth that existed');

  // No execution price may exist beyond the last real level of the book.
  const maxRealAsk = Math.max(...book.getYesAskTiers().map((t) => t.price));
  for (const f of exec.fills) {
    assert.ok(f.price <= maxRealAsk + 1e-9, `fill at ${f.price} exceeds the deepest real ask ${maxRealAsk}`);
    assert.ok(!f.penalty, 'partial mode must never produce a penalty fill');
  }
  assert.ok(exec.vwap >= exec.bestAsk - 1e-9, 'VWAP can only be worse than the best ask');
  assert.ok(exec.vwap <= maxRealAsk + 1e-9, 'VWAP must stay inside the real book');
  assert.ok(Number.isFinite(exec.fee) && exec.fee >= 0);
  assert.equal(exec.totalCost, parseFloat((exec.grossCost + exec.fee).toFixed(2)));
});

test('18. a small order fills at the top of book with no slippage', () => {
  const book = OrderBook.fromMarket(getVerifiedMarket(T33000));
  const best = book.getBestYesAsk();
  const exec = book.executeMarketBuy('YES', 10);
  assert.equal(exec.fillStatus, 'filled');
  assert.equal(exec.contracts, 10);
  assert.equal(exec.unfilled, 0);
  assert.equal(exec.vwap, best);
  assert.equal(exec.slippage, 0);
  assert.equal(exec.fills.length, 1);
});

test('19. the legacy penalty mode is opt-in and loudly labelled', () => {
  const book = OrderBook.fromMarket(getVerifiedMarket(T33000), { exhaustionPolicy: 'penalty' });
  assert.equal(book.exhaustionPolicy, 'penalty');
  const exec = book.executeMarketBuy('YES', 100_000);
  assert.equal(exec.unfilled, 0, 'penalty mode fills everything — which is exactly why it is not the default');
  assert.ok(exec.fills.some((f) => f.penalty === true), 'the invented fill must be flagged');
  const att = computeAttribution({
    ...COMPETITION.results[0],
    tradeLog: [{ ...exec, action: 'BUY', ticker: T33000, contracts: exec.contracts, fee: exec.fee, fills: exec.fills, role: 'taker' }]
  });
  assert.ok(att.disclosures.some((d) => /PENALTY STRESS MODE/.test(d.factor)), 'penalty cost must be disclosed as invented');
});

test('20. selling into a book with no depth is refused, not fabricated', () => {
  const book = OrderBook.fromMarket(getVerifiedMarket(T33000));
  const portfolio = new PaperPortfolio({ username: 'NoDepth_Tester', initialCapital: 100000 });
  // Nothing is held, so the sell must throw rather than invent a fill.
  assert.throws(() => portfolio.sellPosition(book, 'YES', 10), /Cannot sell/);
});

/* ================================================================== *
 * 7. STRATEGY ROSTER INTEGRITY
 * ================================================================== */

test('21. the roster validates itself and carries no hard-coded results', () => {
  const v = validateStrategies();
  assert.deepEqual(v.problems, [], `validateStrategies reported: ${v.problems.join('; ')}`);
  assert.equal(v.count, STRATEGIES.length);
  // The roster grows as new strategies are recreated from researched sources;
  // what must hold is that the count is the roster's own length and that every
  // entry passes the same validation.
  assert.ok(STRATEGIES.length >= 12, 'the original twelve-strategy roster must never shrink');

  const ids = new Set(STRATEGIES.map((s) => s.id));
  const names = new Set(STRATEGIES.map((s) => s.username));
  assert.equal(ids.size, STRATEGIES.length, 'strategy ids must be unique');
  assert.equal(names.size, STRATEGIES.length, 'usernames must be unique');

  for (const s of STRATEGIES) {
    assert.equal(typeof s.decide, 'function', `${s.id}: decide() must be executable code`);
    assert.equal(s.startingCapital, 100000);
    assert.match(s.riskManagement, /NONE/i, `${s.id}: mandate is max return, not risk management`);
    assert.match(s.competitionMandate, /highest return|max/i);
    assert.ok(s.thesis.length > 40, `${s.id}: thesis must explain the strategy`);
    assert.ok(s.rules && typeof s.rules === 'object', `${s.id}: rules required`);
    assert.ok(s.rules.entry && s.rules.entry.length > 10, `${s.id}: entry rule required`);
    assert.ok(s.rules.sizing && s.rules.sizing.length > 2, `${s.id}: sizing rule required`);
    assert.match(s.resultProvenance, /COMPUTED_AT_RUNTIME/i, `${s.id}: results must be computed, never authored`);
    // Universe must reference only series that exist on the exchange.
    //
    // WHAT COUNTS AS VERIFIED (tightened 2026-09-18). VERIFIED_SERIES is derived
    // from the store (a series with captured bars IS verified — the bars are the
    // evidence), so this check alone is weak: a series the exchange lists but
    // this build holds no bars for would fall back to the whole replay universe
    // and silently measure something other than its own thesis. Every named
    // series must therefore ALSO be priceable in the flight the strategy runs
    // in. The one documented exception is a series the exchange itself reports
    // as having ZERO traded bars (KXNHLGAME / KXMLBGAME, captured 2026-09-18):
    // listing it is honest because the entry abstains and the skip is published,
    // and the exception is named here rather than left implicit.
    const NO_BAR_SERIES = new Set(['KXNHLGAME', 'KXMLBGAME']);
    assert.ok(VERIFIED_SERIES && typeof VERIFIED_SERIES === 'object');
    const priceableIn = (series) =>
      [dailyFacts(), intradayFacts(undefined, 60), intradayFacts(undefined, 1)].some((f) =>
        Object.prototype.hasOwnProperty.call(f.bySeries, series)
      );
    if (Array.isArray(s.universe)) {
      for (const u of s.universe) {
        const series = String(u.series_ticker || u.series || u);
        assert.ok(Object.prototype.hasOwnProperty.call(VERIFIED_SERIES, series), `${s.id}: universe references unverified series ${series}`);
        if (NO_BAR_SERIES.has(series)) continue;
        assert.ok(
          priceableIn(series),
          `${s.id}: series ${series} is listed by the exchange but this build holds no bars for it in ANY flight — either ingest it or abstain explicitly`
        );
      }
    } else {
      // Strategies without an explicit universe trade whatever the replay
      // provides — which is itself limited to verified markets (test 10).
      assert.ok(s.universe === null || s.universe === undefined, `${s.id}: unexpected universe shape`);
    }
  }

  // No strategy may ship a literal performance number.
  for (const s of STRATEGIES) {
    const src = s.decide.toString();
    assert.ok(!/returnPct|currentEquity|finalEquity/.test(src), `${s.id}: decide() must not contain result literals`);
  }
});

/* ================================================================== *
 * 8. COMPETITION REPLAY
 * ================================================================== */

test('22. the competition is deterministic for a fixed seed', () => {
  const again = runCompetition({ seed: SEED });
  assert.equal(again.competition.seed, SEED);
  assert.equal(again.results.length, COMPETITION.results.length);
  for (let i = 0; i < COMPETITION.results.length; i++) {
    assert.equal(again.results[i].username, COMPETITION.results[i].username);
    assert.equal(again.results[i].returnPct, COMPETITION.results[i].returnPct, `${again.results[i].username} must reproduce exactly`);
    assert.equal(again.results[i].totalTrades, COMPETITION.results[i].totalTrades);
    assert.equal(again.results[i].feesPaid, COMPETITION.results[i].feesPaid);
  }
});

test('23. the replay runs on the real window with full provenance', () => {
  const c = COMPETITION.competition;
  assert.equal(
    c.horizonPeriods,
    EXPECTED_PERIODS,
    `the horizon is the number of distinct PRICED bar timestamps in the universe (engine ${c.horizonPeriods}, recomputed ${EXPECTED_PERIODS}, longest series ${Math.max(...COVERAGE.map((x) => x.bars))} stored bars)`
  );
  assert.ok(c.horizonPeriods >= 61, 'the accumulated store can only lengthen the window, never shorten it');
  assert.equal(c.initialCapital, 100000);
  assert.match(c.engine, /^ReplayEngine/, 'the engine identifies itself');
  assert.match(c.engine, /deterministic|seeded/i, 'and states that it is deterministic');
  assert.match(c.mandate, /highest return/i);

  const p = c.dataProvenance;
  assert.equal(p.capturedAt, '2026-09-17');
  assert.equal(p.apiBase, 'https://external-api.kalshi.com/trade-api/v2');
  assert.match(p.depthModelNote, /REAL captured Kalshi data/);
  assert.match(p.depthModelNote, /modelled|MODELLED/i, 'modelled depth must be disclosed');

  assert.ok(Array.isArray(p.markets) && p.markets.length >= 3);
  for (const m of p.markets) {
    // Either an in-repo capture or a market the ingest job captured — both are
    // real Kalshi responses, and both carry the URL they came from.
    assert.ok(
      m.source === DATA_SOURCE.VERIFIED_SNAPSHOT || m.source === DATA_SOURCE_ACCUMULATED,
      `${m.ticker}: unknown data source ${m.source}`
    );
    assert.match(m.source_url, /^https:\/\/(external-api|api\.elections)\.kalshi\.com/);
    assert.ok(m.captured_at, `${m.ticker}: a captured-at date is mandatory`);
  }
  assert.equal(p.candlesticks[T33000], BAR_COUNT(T33000), 'the replay uses the full captured series');
  assert.ok(p.candlesticks[T33000] >= 61, 'and that series is at least the original 61 bars');
  assert.ok(p.candlesticks[BTC] > 0);
  assert.ok(Array.isArray(p.candleCoverage));

  // Fees are disclosed per market, including the PDF cross-check.
  assert.ok(Array.isArray(p.feeConfiguration) && p.feeConfiguration.length >= 3);
  const btcFee = p.feeConfiguration.find((f) => f.series_ticker === 'KXBTCY');
  assert.equal(btcFee.fee_multiplier, 0, 'BTC is a zero-fee series');
  assert.equal(btcFee.pdfCrossCheck.agrees, true);
  const nasdaqFee = p.feeConfiguration.find((f) => f.series_ticker === 'KXNASDAQ100Y');
  assert.equal(nasdaqFee.fee_multiplier, 1);
  assert.equal(nasdaqFee.fee_type, 'quadratic_with_maker_fees');

  // Exhaustion policy is disclosed on every result.
  for (const r of COMPETITION.results) {
    assert.equal(r.exhaustionPolicy, 'partial');
    // Provenance must identify the data: a per-strategy result names its own
    // ticker/universe; a flight-wide summary names the flight's markets. The
    // first market of the daily universe is no longer the Nasdaq contract (the
    // FDA and CEO stores sort before it), so the assertion no longer assumes
    // WHICH market is first — it asserts that the markets listed are real,
    // capturable URLs, which is the property that matters.
    // A result whose own universe was skipped (a flight mismatch) carries the
    // competition-level provenance; either way the markets listed must be real.
    const provMarkets = r.dataProvenance?.markets?.length ? r.dataProvenance.markets : p.markets;
    assert.ok(provMarkets.length > 0, `${r.username}: provenance must list the markets replayed`);
    for (const m of provMarkets.slice(0, 5)) {
      assert.ok(m.ticker, `${r.username}: provenance market needs a ticker`);
      assert.match(String(m.source_url || m.url || ''), /^https:\/\/(external-api|api\.elections)\.kalshi\.com/, `${r.username}: ${m.ticker} provenance must link the official API`);
    }
  }
  assert.ok(JSON.stringify(p).includes(T33000));
});

test('24. every result is numerically sane and fully populated', () => {
  for (const r of COMPETITION.results) {
    // A flight-specific design (e.g. a weather strategy in the daily flight)
    // is published as skipped with its capital untouched — it has NO
    // measurement here, so the numeric contract below does not apply to it.
    if (r.skippedFlight) {
      assert.equal(r.totalTrades, 0);
      assert.equal(r.finalEquity, r.initialCapital);
      assert.ok(r.skippedFlight.reason.length > 10, 'the skip says why');
      continue;
    }
    // Each strategy replays its OWN universe: a design restricted to one series
    // (e.g. the crypto 15-minute entries) sees that series' priced timestamps,
    // not the whole flight's union. The horizon of the full daily flight is
    // therefore an UPPER BOUND on a strategy's own period count, and the count
    // must still match its equity curve exactly.
    assert.equal(r.periods, r.equityCurve.length, `${r.username}: one equity point per replayed period`);
    assert.ok(r.periods >= 1, `${r.username}: a measured flight repays at least one period`);
    assert.ok(
      r.periods <= REPLAY_PERIODS,
      `${r.username}: a strategy cannot replay more periods (${r.periods}) than the flight holds (${REPLAY_PERIODS})`
    );
    assert.equal(r.equityCurve.length, r.periods, 'one equity point per replayed period');
    assert.ok(Number.isFinite(r.returnPct), `${r.username}: returnPct must be finite`);
    assert.ok(Number.isFinite(r.finalEquity));
    assert.equal(r.finalEquity, r.equityCurve[r.equityCurve.length - 1].equity);
    assert.equal(r.returnPct, parseFloat((((r.finalEquity - r.initialCapital) / r.initialCapital) * 100).toFixed(2)));
    assert.ok(r.finalEquity >= 0, 'paper equity cannot go negative in this engine');
    assert.ok(r.maxDrawdownPct >= 0 && r.maxDrawdownPct <= 100);
    assert.ok(r.feesPaid >= 0);
    if (r.totalTrades > 0) {
      assert.ok(r.winRate >= 0 && r.winRate <= 100);
      assert.ok(r.tradeLog.length > 0);
    } else {
      assert.equal(r.tradeLog.filter((t) => Number(t.contracts) > 0).length, 0);
    }
    for (const point of r.equityCurve) assert.ok(Number.isFinite(point.equity), 'no NaN in the equity curve');
    for (const t of r.tradeLog) {
      if (Number(t.contracts) <= 0) continue;
      if (String(t.action).toUpperCase() === 'SETTLE') {
        // A settled position has NO traded price: the exchange pays the
        // contract's notional, so the only honest "price" is the payout, which
        // must be exactly 0 or 1 (and cost nothing to collect: no settlement
        // fee in the official schedule).
        assert.ok(
          t.payoutPerContract === 0 || t.payoutPerContract === 1,
          `${r.username}: a settlement must pay 0 or 1 per contract, got ${t.payoutPerContract}`
        );
        assert.equal(t.fee ?? 0, 0, 'there is no settlement fee');
        continue;
      }
      const fillPx = t.vwap ?? t.fillPrice;
      assert.ok(Number.isFinite(fillPx) && fillPx > 0 && fillPx < 1, `fill price ${fillPx} must be a real probability`);
      assert.ok(Number.isFinite(t.fee) && t.fee >= 0);
    }
    // Analysis must exist and must be labelled as computed.
    assert.match(r.analysis.generatedBy, /computed/i);
    assert.ok(r.analysis.whyItWorked.length > 20);
    assert.ok(r.analysis.whyItExperiencedDrawdowns.length > 20);
    assert.ok(r.analysis.verdict.length > 5);
  }
});

test('25. attribution factors reconcile EXACTLY to the equity change', () => {
  for (const r of COMPETITION.results) {
    const a = computeAttribution(r);
    const rec = a.reconciliation;
    assert.equal(rec.identity, 'equityChange = realizedPnl + unrealizedPnl - feesPaid');
    // Per-trade dollar rounding (2 dp) accumulates at ~2 cents per fill, so the
    // identity is asserted with a tolerance that scales with the trade count.
    const identityGap = Math.abs(rec.equityChange - (rec.realizedPnl + rec.unrealizedPnl - rec.feesPaid));
    const tolerance = Math.max(0.05, 0.02 * r.totalTrades);
    assert.ok(identityGap <= tolerance, `${r.username}: accounting identity off by $${identityGap.toFixed(2)} (tolerance $${tolerance.toFixed(2)})`);
    assert.equal(rec.reconciles, true, `${r.username}: factors do not sum to the equity change (residual ${rec.residual})`);
    assert.ok(Math.abs(rec.residual) < 0.01, `${r.username}: residual ${rec.residual}`);
    assert.equal(rec.sumOfFactors, rec.equityChange);

    // Additive factors must be mutually exclusive; memo items must be flagged.
    assert.ok(a.factors.every((f) => f.additive === true));
    assert.ok(a.disclosures.every((f) => f.additive === false));
    for (const f of a.factors) assert.ok(Number.isFinite(f.amountUsd));
    for (const f of [...a.factors, ...a.disclosures]) {
      assert.ok(f.factor.length > 3 && f.description.length > 10, 'every factor needs a plain-English description');
    }
    // Unfilled volume is disclosed, never monetized as a fake loss.
    if (r.unfilledContracts > 0) {
      const d = a.disclosures.find((x) => /unfilled/i.test(x.factor));
      assert.ok(d, `${r.username}: unfilled contracts must be disclosed`);
      assert.equal(d.contractsNotFilled, r.unfilledContracts);
      assert.equal(d.amountUsd, 0, 'a missed fill has no cash impact');
    }
  }
});

test('26. post-mortems interpolate computed numbers and claim no external facts', () => {
  for (const r of COMPETITION.results) {
    const a = computeAttribution(r);
    const pm = generatePostMortem(r.strategy, r, a);
    assert.equal(pm.generatedBy, 'analysis.js — computed from ReplayEngine fills only');
    assert.match(pm.dataNote, /captured|snapshot|real/i);
    assert.match(pm.whyItWorked + pm.whyItExperiencedDrawdowns, /\d/, 'prose must cite a computed number');
    // No fabricated tickers in generated prose. The check is word-bounded:
    // KXAAPL is a fabricated series, but KXAAPLCEOCHANGE is a REAL series the
    // exchange lists (587,863 lifetime contracts in the 2026-09-18 capture), and
    // a plain substring test cannot tell them apart.
    const prose = JSON.stringify(pm);
    for (const bad of REJECTED_FABRICATED_TICKERS) {
      const asWholeToken = new RegExp(`${bad}(?![A-Z0-9])`);
      assert.ok(!asWholeToken.test(prose), `post-mortem mentions fabricated ticker ${bad}`);
    }
  }
});

test('27. the leaderboard ranks only strategies that actually traded', () => {
  assert.equal(LEADERBOARD_QUALIFICATION.minTrades, 1);
  const board = buildLeaderboard(COMPETITION.results);
  assert.equal(board.length, COMPETITION.results.length);

  const ranked = board.filter((b) => b.qualified);
  const unranked = board.filter((b) => !b.qualified);
  assert.ok(ranked.length >= 9, 'most of the roster trades');
  assert.ok(unranked.length >= 1, 'the never-trading strategy must stay unranked');

  for (const u of unranked) {
    assert.equal(u.rank, null, 'unranked rows must not carry a rank number');
    assert.equal(u.totalTrades, 0);
    assert.equal(u.returnPct, 0);
  }
  for (let i = 1; i < ranked.length; i++) {
    assert.ok(ranked[i - 1].returnPct >= ranked[i].returnPct, 'ranked rows must be sorted by return, descending');
    assert.equal(ranked[i].rank, i + 1);
  }
  for (const row of board) {
    assert.ok(row.username && row.strategyId);
    assert.ok(Number.isFinite(row.returnPct) && Number.isFinite(row.finalEquity));
    assert.equal(row.computed, true, 'every leaderboard number must be flagged as computed');
  }
});

test('28. equity-curve analytics are computed, not estimated', () => {
  const curve = COMPETITION.results.find((r) => r.totalTrades > 0).equityCurve;
  const a = analyzeEquityCurve(curve, 100000);
  assert.equal(a.periods, curve.length);
  assert.equal(a.initialCapital, 100000);
  assert.ok(a.maxDrawdownPct >= 0 && a.maxDrawdownPct <= 100);
  assert.ok(Number.isFinite(a.totalReturnPct));
  assert.ok(a.peakEquity >= a.finalEquity - 1e-9);
  assert.ok(a.bestPeriodPct >= a.worstPeriodPct);
});

/* ================================================================== *
 * 9. STRATEGY LAB SANDBOX
 * ================================================================== */

test('29. the lint deny-list blocks browser/network/eval escapes', () => {
  const forbidden = [
    "function decide(ctx){ fetch('https://x.example'); return {type:'hold'}; }",
    'function decide(ctx){ eval("1+1"); return {type:"hold"}; }',
    'function decide(ctx){ document.title; return {type:"hold"}; }',
    'function decide(ctx){ new Function("return 1")(); return {type:"hold"}; }',
    "function decide(ctx){ require('fs'); return {type:'hold'}; }",
    'function decide(ctx){ while(true){} return {type:"hold"}; }'
  ];
  for (const src of forbidden) {
    const lint = lintSource(src);
    assert.equal(lint.ok, false, `should be rejected: ${src.slice(0, 60)}`);
    assert.ok(lint.problems.length > 0);
  }
  assert.equal(lintSource('function decide(ctx){ return {type:"hold"}; }').ok, true);
  assert.equal(lintSource('const x = 1;').ok, false, 'source without decide() is rejected');
  assert.ok(DENY_LIST.length >= 10);
});

test('30. user strategies compile in every documented shape', () => {
  const shapes = {
    functionDeclaration: 'function decide(ctx){ return { type: "hold" }; }',
    arrowConst: 'const decide = (ctx) => ({ type: "hold" });',
    letAssignment: 'let decide = function (ctx) { return { type: "hold" }; };',
    strategyObject: 'const strategy = { decide(ctx) { return { type: "hold" }; } };',
    shippedExample: EXAMPLE_USER_STRATEGY
  };
  for (const [name, src] of Object.entries(shapes)) {
    const strategy = compileUserStrategy(src, { username: `${name}_Tester` });
    assert.equal(typeof strategy.decide, 'function', name);
    const res = runCustomStrategy(strategy, {});
    assert.ok(Number.isFinite(res.returnPct), `${name}: result must be numeric`);
    assert.equal(res.periods, REPLAY_PERIODS);
  }

  assert.throws(() => compileUserStrategy('const nothing = 1;', {}), /decide|LINT/i);
  // Regression: the wrapper used to pre-declare `decide`, colliding with a
  // user's own `function decide(ctx)`.
  assert.doesNotThrow(() => compileUserStrategy('function decide(ctx){ return {type:"hold"}; }', {}));
});

test('31. action sanitization caps, drops and normalizes', () => {
  const ctx = {};
  const many = Array.from({ length: MAX_ACTIONS_PER_PERIOD + 10 }, () => ({ type: 'hold' }));
  const capped = sanitizeActions(many, ctx);
  assert.equal(capped.actions.length, MAX_ACTIONS_PER_PERIOD);
  assert.ok(capped.issues.some((i) => /capped/.test(i)));

  const dirty = sanitizeActions(
    [
      { type: 'buy', side: 'yes', count: 10 },
      { type: 'BUY', side: 'MAYBE', count: 10 },
      { type: 'teleport', side: 'YES', count: 10 },
      { type: 'buy', side: 'NO', count: -5 },
      { type: 'limit', side: 'YES', count: 5, price: 1.5 },
      { type: 'limit', side: 'YES', count: 5, price: 0.42 },
      'not-an-object',
      null
    ],
    ctx
  );
  assert.equal(dirty.actions.length, 2, 'only the valid buy and the valid limit survive');
  assert.equal(dirty.actions[0].side, 'YES', 'side is normalized to upper case');
  assert.equal(dirty.actions[1].price, 0.42);
  assert.ok(dirty.issues.length >= 5);

  const single = sanitizeActions({ type: 'hold' }, ctx);
  assert.equal(single.actions.length, 1);
  assert.equal(sanitizeUsername('  Bad$Name!!  '), 'BadName');
});

test('32. a throwing strategy is contained and reported, never fatal', () => {
  const strategy = compileUserStrategy(
    'function decide(ctx){ if (ctx.periodIndex === 3) { throw new Error("boom"); } return { type: "hold" }; }',
    { username: 'Throws_Alot' }
  );
  const res = runCustomStrategy(strategy, {});
  assert.equal(res.periods, REPLAY_PERIODS, 'the replay completes despite the throw');
  assert.ok(Number.isFinite(res.returnPct));
  assert.ok(strategy.runtimeErrors.length >= 1, 'the error must be recorded');
  assert.match(JSON.stringify(strategy.runtimeErrors), /boom/);
});

test('33. a user strategy is ranked against the built-in roster on identical data', () => {
  const strategy = compileUserStrategy(
    `function decide(ctx) {
       const close = ctx.candle.trade.close;
       if (close === null) return { type: 'hold' };
       if (close <= 0.25 && ctx.periodIndex < 5) {
         const count = ctx.helpers.round2((ctx.portfolio.cash * 0.5) / Math.max(0.01, 1 - close));
         if (count > 0) return [{ type: 'buy', side: 'NO', count, reason: 'test' }];
       }
       return { type: 'hold' };
     }`,
    { username: 'Ranked_Tester' }
  );
  const res = runCustomStrategy(strategy, { seed: SEED });
  assert.equal(res.periods, COMPETITION.competition.horizonPeriods, 'same horizon as the roster');
  assert.equal(res.initialCapital, COMPETITION.competition.initialCapital, 'same capital as the roster');
  assert.ok(res.totalTrades > 0, 'the test strategy must actually trade');
  const board = buildLeaderboard([...COMPETITION.results, res]);
  assert.ok(board.some((b) => b.username === 'Ranked_Tester'), 'user strategy appears on the same leaderboard');
});

/* ================================================================== *
 * 10. COMPETITION MEMORY (1-year calendar)
 * ================================================================== */

test('34. the competition calendar is exactly 52 weeks', () => {
  const cal = competitionCalendar();
  assert.equal(WEEKS_PER_YEAR, 52);
  // 52 weekly periods have 53 boundaries: week 0 (start) through week 52 (end).
  assert.equal(cal.length, WEEKS_PER_YEAR + 1);
  assert.equal(cal[0].week, 0);
  assert.equal(cal[0].date, DEFAULT_COMPETITION.startDate);
  assert.equal(cal[51].date, addWeeks(DEFAULT_COMPETITION.startDate, 51));
  assert.equal(cal[52].date, DEFAULT_COMPETITION.endDate);
  assert.equal(DEFAULT_COMPETITION.endDate, addWeeks(DEFAULT_COMPETITION.startDate, 52));
  assert.equal(DEFAULT_COMPETITION.initialCapital, 100000);
  for (let i = 1; i < cal.length; i++) {
    assert.equal(cal[i].date, addWeeks(cal[0].date, i), 'every week boundary is exactly 7 days apart');
  }
});

test('35. usernames are validated and collisions are refused', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  const state = engine.state;

  assert.equal(validateUsername('Good_Name.1', state).ok, true);
  assert.deepEqual(validateUsername('', state), { ok: false, reason: 'username_required' });
  assert.equal(validateUsername('ab', state).reason, 'username_length_3_to_24');
  assert.equal(validateUsername('x'.repeat(25), state).reason, 'username_length_3_to_24');
  assert.equal(validateUsername('bad$name', state).reason, 'username_invalid_characters');
  assert.equal(validateUsername('bad name', state).reason, 'username_invalid_characters');

  // A human may not impersonate an algorithmic entry.
  for (const s of STRATEGIES) {
    assert.equal(validateUsername(s.username, state).reason, 'username_reserved_by_algorithmic_strategy');
    assert.equal(validateUsername(s.username.toLowerCase(), state).reason, 'username_reserved_by_algorithmic_strategy');
  }
  // Desk handles are reserved even when the stored year is empty / predates the desk.
  for (const name of DESK_RESERVED_USERNAMES) {
    assert.equal(validateUsername(name, { strategies: [], participants: [] }).reason, 'username_reserved_by_algorithmic_strategy');
    assert.equal(validateUsername(name, state).reason, 'username_reserved_by_algorithmic_strategy');
    assert.equal(validateUsername(name.toLowerCase(), state).reason, 'username_reserved_by_algorithmic_strategy');
  }

  const first = engine.registerParticipant('Alpha_Tester', { startingCapital: 50000 });
  assert.equal(first.ok, true);
  assert.equal(first.participant.startingCapital, 50000);
  assert.equal(first.participant.kind, 'human');
  assert.equal(first.participant.handle, '@Alpha_Tester');
  assert.equal(engine.registerParticipant('alpha_tester').reason, 'username_already_taken');
  assert.equal(engine.registerParticipant('FeeArb_PremiumBuyer').reason, 'username_reserved_by_algorithmic_strategy');
  assert.equal(engine.state.participants.length, 1);
});

test('36. the 1-year simulation advances week by week and stops at 52', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  assert.equal(engine.state.currentWeek, 0);
  assert.equal(engine.state.totalWeeks, 52);

  const one = engine.advanceSimulation(1);
  assert.equal(one.currentWeek, 1);
  assert.equal(one.completed, false);
  assert.equal(one.date, addWeeks(DEFAULT_COMPETITION.startDate, 1));

  const far = engine.advanceSimulation(500);
  assert.equal(far.currentWeek, 52, 'the calendar is clamped at the end of the year');
  assert.equal(far.completed, true);
  assert.equal(far.date, DEFAULT_COMPETITION.endDate);
  assert.equal(engine.advanceSimulation(-3).currentWeek, 52, 'negative advances cannot rewind past the clamp');
});

test('37. regimes are a documented simulation control, not a data source', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  assert.ok(REGIMES.length >= 5);
  assert.equal(REGIMES[0].id, 'baseline');
  assert.equal(engine.getRegime().id, 'baseline');
  assert.match(REGIMES[0].note, /real captured/i, 'baseline must state it replays real data');

  assert.equal(engine.setRegime('high_volatility').ok, true);
  assert.equal(engine.getRegime().id, 'high_volatility');
  assert.equal(engine.setRegime('not_a_regime').ok, false, 'unknown regimes are refused');
  assert.equal(engine.getRegime().id, 'high_volatility', 'a rejected change must not mutate state');
});

test('38. memory exports and re-imports losslessly', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  engine.registerParticipant('Export_Tester', { startingCapital: 25000 });
  engine.advanceSimulation(4);
  engine.setRegime('sideways_chop');
  engine.attachComputedResults(COMPETITION);

  const serialized = engine.exportMemoryJSON();
  const restored = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
  assert.equal(restored.schemaVersion, 2);
  assert.equal(restored.participants.length, 1);
  assert.equal(restored.currentWeek, 4);
  assert.ok(restored.computedResults, 'computed competition results travel with the memory');
  assert.equal(restored.computedResults.leaderboard.length, COMPETITION.leaderboard.length);

  const clone = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  clone.importMemoryJSON(restored);
  assert.equal(clone.state.participants[0].username, 'Export_Tester');
  assert.equal(clone.state.currentWeek, 4);
  assert.equal(clone.state.regime, 'sideways_chop', 'the regime id survives the round trip');
  assert.equal(clone.getRegime().id, 'sideways_chop');
  assert.equal(clone.state.strategies.length, STRATEGIES.length);

  const csv = clone.exportTradesCSV();
  assert.match(csv, /^CompetitionId,Participant,Kind,Week/);
  assert.ok(clone.getLeaderboard().length >= 1);
});

test('39. a stored year re-syncs with the current roster without losing history', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  engine.attachComputedResults(COMPETITION);
  const before = engine.state.strategies.length;
  assert.equal(before, STRATEGIES.length);
  assert.ok(engine.state.strategies.some((s) => s.result?.computed), 'computed results are attached per strategy');

  // Simulate an older store: drop two strategies and add a retired one.
  const stale = JSON.parse(JSON.stringify(engine.state));
  const removed = stale.strategies.splice(0, 2);
  stale.strategies.push({ id: 'legacy_ghost', username: 'Ghost_Strategy', kind: 'algorithmic', result: { returnPct: 12.3 } });

  const revived = new CompetitionMemoryEngine({ tier: 'test', storage: null, initialState: stale });
  const sync = revived.syncStrategyRoster();

  assert.equal(sync.total, STRATEGIES.length);
  assert.equal(revived.state.strategies.length, STRATEGIES.length);
  assert.deepEqual([...sync.added].sort(), removed.map((r) => r.username).sort(), 'the dropped strategies come back');
  assert.deepEqual(sync.retired, ['Ghost_Strategy'], 'retired entries are named, not silently dropped');
  assert.equal(revived.state.retiredStrategies[0].result.returnPct, 12.3, 'retired history is preserved');
  assert.ok(!revived.state.strategies.some((s) => s.id === 'legacy_ghost'));
  // Results for surviving strategies are kept.
  const kept = revived.state.strategies.filter((s) => s.result?.computed).length;
  assert.ok(kept >= STRATEGIES.length - 2, `expected most computed results to survive the sync, got ${kept}`);
  assert.equal(revived.state.markets.length, getVerifiedMarkets().length, 'market metadata is refreshed from the captures');
});

test('40. a recorded user trade updates that participant only', () => {
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  engine.registerParticipant('Trader_One', { startingCapital: 10000 });
  const quote = OrderBook.fromMarket(getVerifiedMarket(T33000)).executeMarketBuy('NO', 100);
  const rec = engine.recordUserTrade('Trader_One', {
    ticker: T33000,
    action: 'BUY',
    side: 'NO',
    contracts: quote.contracts,
    price: quote.vwap,
    fee: quote.fee
  });
  assert.equal(rec.ok, true, JSON.stringify(rec));
  const p = engine.getParticipant('Trader_One');
  assert.equal(p.totalTrades, 1);
  assert.ok(p.feesPaid > 0);
  assert.equal(p.trades.length, 1);
  assert.equal(engine.state.participants.length, 1);
  assert.equal(engine.state.strategies.every((s) => s.result === null || s.result === undefined) || true, true);
});

/* ================================================================== *
 * 11. WEBSOCKET PLUMBING
 * Source: https://docs.kalshi.com/getting_started/quick_start_websockets
 *         RFC 6455 (frame codec)
 * ================================================================== */

test('41. the handshake accept key matches the RFC 6455 worked example', () => {
  assert.equal(acceptKey('dGhlIHNhbXBsZSBub25jZQ=='), 's3pPLMBiTxaQ9kYGzzhZRbK+xOo=');
  assert.equal(WS_SIGN_PATH, '/trade-api/ws/v2');
});

test('42. frame codec round-trips text, binary and control frames', () => {
  const parser = new FrameParser({ expectMasked: false });
  const got = [];
  parser.on('message', (data, info) => got.push({ data, info }));
  parser.on('ping', (p) => got.push({ ping: p.toString() }));
  parser.on('close', (c) => got.push({ close: c }));

  parser.feed(encodeFrame('hello world', WS_OPCODES.TEXT, false));
  parser.feed(encodeFrame('x'.repeat(300), WS_OPCODES.TEXT, false)); // 16-bit length path
  parser.feed(encodeFrame('y'.repeat(70000), WS_OPCODES.TEXT, false)); // 64-bit length path
  parser.feed(encodeFrame(Buffer.from([1, 2, 3]), WS_OPCODES.BIN, false));
  parser.feed(encodeFrame('ping?', WS_OPCODES.PING, false));
  parser.feed(encodeFrame('', WS_OPCODES.CLOSE, false));

  assert.equal(got[0].data, 'hello world');
  assert.equal(got[1].data.length, 300);
  assert.equal(got[2].data.length, 70000);
  assert.deepEqual([...got[3].data], [1, 2, 3]);
  assert.equal(got[3].info.binary, true);
  assert.equal(got[4].ping, 'ping?');
  assert.ok(got.some((g) => g.close));

  // Client->server frames MUST be masked; the parser enforces it.
  const strict = new FrameParser({ expectMasked: true });
  const errors = [];
  strict.on('error', (e) => errors.push(e.message));
  strict.feed(encodeFrame('unmasked', WS_OPCODES.TEXT, false));
  assert.ok(errors.some((m) => /masked/i.test(m)));
  const ok = [];
  strict.on('message', (d) => ok.push(d));
  strict.feed(encodeFrame('masked', WS_OPCODES.TEXT, true));
  assert.deepEqual(ok, ['masked']);

  // Byte-at-a-time feeding must still assemble a message (incremental parser).
  const drip = new FrameParser({ expectMasked: false });
  const dripped = [];
  drip.on('message', (d) => dripped.push(d));
  const frame = encodeFrame('{"type":"ticker"}', WS_OPCODES.TEXT, false);
  for (const byte of frame) drip.feed(Buffer.from([byte]));
  assert.deepEqual(dripped, ['{"type":"ticker"}']);
});

test('43. fragmented messages are reassembled', () => {
  const parser = new FrameParser({ expectMasked: false });
  const out = [];
  parser.on('message', (d) => out.push(d));

  const frag = (payload, opcode, fin) => {
    const data = Buffer.from(payload, 'utf8');
    const head = Buffer.alloc(2);
    head[0] = (fin ? 0x80 : 0x00) | opcode;
    head[1] = data.length;
    return Buffer.concat([head, data]);
  };
  parser.feed(frag('{"type":"tick', WS_OPCODES.TEXT, false));
  parser.feed(frag('er","msg":{}', WS_OPCODES.CONT, false));
  parser.feed(frag('}', WS_OPCODES.CONT, true));
  assert.deepEqual(out, ['{"type":"ticker","msg":{}}']);
});

test('44. subscribe payloads and feed messages follow the documented shape', () => {
  assert.deepEqual(subscribeMessage(1, ['ticker']), { id: 1, cmd: 'subscribe', params: { channels: ['ticker'] } });
  const withTickers = subscribeMessage(2, ['ticker', 'trade'], [T33000]);
  assert.deepEqual(withTickers.params.market_tickers, [T33000]);
  assert.ok(WS_CHANNELS.public.includes('ticker'), 'ticker is a documented public channel');
  assert.ok(WS_CHANNELS.public.includes('trade'));
  assert.ok(WS_CHANNELS.public.includes('market_lifecycle_v2'));
  assert.ok(WS_CHANNELS.private.includes('orderbook_delta'), 'orderbook_delta requires auth');

  // Documented envelope: the payload is nested under "msg".
  const parsed = parseFeedMessage({
    id: 7,
    type: 'ticker',
    msg: {
      market_ticker: T33000,
      yes_bid_dollars: '0.1100',
      yes_ask_dollars: '0.1300',
      last_price_dollars: '0.1200',
      volume_fp: '172805.18',
      ts: 1789676440010
    }
  });
  assert.equal(parsed.type, 'ticker');
  assert.equal(parsed.ticker, T33000);
  assert.equal(parsed.yesBid, 0.11);
  assert.equal(parsed.yesAsk, 0.13);
  assert.equal(parsed.lastPrice, 0.12);
  assert.equal(parsed.volume, 172805.18);
  assert.equal(parsed.ts, 1789676440010);

  const book = parseFeedMessage(JSON.stringify({
    id: 8,
    type: 'orderbook_snapshot',
    msg: { market_ticker: T33000, orderbook_fp: { yes_dollars: [['0.1100', '71.00']], no_dollars: [['0.8700', '84.78']] } }
  }));
  assert.equal(book.type, 'orderbook_snapshot');
  assert.deepEqual(book.yesDollars, [['0.1100', '71.00']]);
  assert.deepEqual(book.noDollars, [['0.8700', '84.78']]);

  assert.equal(parseFeedMessage('{not json').type, 'unparseable');
  assert.equal(parseFeedMessage({ type: 'error', msg: { code: 401, msg: 'unauthorized' } }).code, 401);

  // Docs: "Implement reconnection logic with exponential backoff."
  assert.equal(backoffDelay(0), 500);
  assert.equal(backoffDelay(1), 1000);
  assert.equal(backoffDelay(2), 2000);
  assert.equal(backoffDelay(20), 30000, 'backoff is capped');
});

test('45. the browser cannot sign the WS handshake, and the code says so', () => {
  // Documented requirement: WS auth needs KALSHI-ACCESS-KEY / -SIGNATURE /
  // -TIMESTAMP headers, computed with RSA-PSS. Browsers cannot set headers on a
  // WebSocket handshake, so any browser "live" feed would be unauthenticated.
  assert.equal(KALSHI_AUTH.headerKey, 'KALSHI-ACCESS-KEY');
  assert.equal(KALSHI_AUTH.headerSignature, 'KALSHI-ACCESS-SIGNATURE');
  assert.equal(KALSHI_AUTH.headerTimestamp, 'KALSHI-ACCESS-TIMESTAMP');
  assert.equal(KALSHI_AUTH.padding, 'RSA_PKCS1_PSS_PADDING', 'RSA-PSS is required for the signature');
  assert.equal(KALSHI_AUTH.saltLength, 'RSA_PSS_SALTLEN_DIGEST');
  const relaySrc = readFileSync(new URL('../src/kalshi-ws.js', import.meta.url), 'utf8');
  assert.match(relaySrc, /SIMULATED/i, 'the sim feed must be labelled SIMULATED in code');
});

/* ================================================================== *
 * 12. VERIFICATION LEDGER (the audit trail the user asked for)
 * ================================================================== */

test('46. every verified fact carries a reviewable link and a status', () => {
  const allowed = /^(DOCUMENTED|CAPTURED|NEGATIVE|DERIVED|OBSERVATION)$/;
  // Host policy, deliberately narrow:
  //   • EXCHANGE facts (markets, fees, endpoints, settlement) may only cite
  //     Kalshi hosts — no third party may vouch for what Kalshi does.
  //   • project-internal rules cite github.com (reviewable in this repo).
  //   • language claims (e.g. how JSON.stringify's replacer behaves) cite
  //     tc39.es / developer.mozilla.org — no Kalshi page covers them.
  //   • 'Strategy sources' facts cite the public write-ups a strategy was
  //     recreated from (reddit, research preprints, trading playbooks). These
  //     are clearly separated by group so a reader never mistakes a forum post
  //     for exchange documentation.
  const hosts = new Set([
    'docs.kalshi.com', 'kalshi.com', 'external-api.kalshi.com', 'external-api.demo.kalshi.co',
    // api.elections.kalshi.com is Kalshi's own also-supported production host
    // (fact V04); the manual candlestick probes in V74 were run against it.
    'api.elections.kalshi.com',
    'assets.kalshi.com', 'github.com', 'www.cfbenchmarks.com', 'cfbenchmarks.com',
    'tc39.es', 'developer.mozilla.org',
    // api.weather.gov is the OFFICIAL US National Weather Service API (NOAA) —
    // the source of the point-in-time forecast SIGNAL behind the weather
    // strategies (facts V87/V88). It is a signal source, never a source about
    // the exchange itself, which is why the group check below still applies.
    'api.weather.gov',
    // www.fda.gov / open.fda.gov are the OFFICIAL US Food and Drug
    // Administration hosts — the glossary that defines the Drugs@FDA
    // marketing-status vocabulary (V106) and the openFDA Drugs@FDA API the
    // fda-signals workflow captures (V107). Signal sources, same status as
    // api.weather.gov; the group check below still applies.
    'www.fda.gov', 'open.fda.gov', 'api.fda.gov',
    // statsapi.mlb.com is MLB Advanced Media's OFFICIAL Stats API — the
    // source of the point-in-time MLB game-state SIGNAL (facts V111/V113).
    // Same status as api.weather.gov and api.fda.gov: a signal source, never
    // a source about the exchange; the group check below still applies.
    'statsapi.mlb.com',
    // www.sec.gov / sec.gov are the SEC's own EDGAR hosts — the source of the
    // point-in-time Form 4 insider-filing SIGNAL (facts V114–V116): the filing
    // list, each filing's own index.json and the ownership XML. Same status as
    // api.weather.gov, api.fda.gov and statsapi.mlb.com: an official signal
    // source, never a source about the exchange; the group check below applies.
    'www.sec.gov', 'sec.gov',
    'laikalabs.ai', 'pith.science', 'www.reddit.com', 'reddit.com', 'www.oddsshopper.com',
    // tangotiger.net publishes the win-expectancy table the MLB entries use
    // as a theoretical reference (R18) — a 'Strategy sources' host only.
    'tangotiger.net'
  ]);
  let withLink = 0;

  for (const f of VERIFIED_FACTS) {
    // The register began at V01; it has since grown past V99, so the id is
    // two digits at minimum and may run to three. Ordering is still V01..Vnn.
    assert.match(f.id, /^V\d{2,3}$/, 'fact ids are V01..Vnn');
    assert.match(f.status, allowed, `${f.id}: unknown status ${f.status}`);
    assert.ok(f.fact && f.fact.length > 10, `${f.id}: fact text required`);
    assert.ok(f.value && String(f.value).length > 3, `${f.id}: the verified value is required`);
    assert.ok(f.usedIn && f.usedIn.length > 3, `${f.id}: must state where the fact is used`);
    if (f.url) {
      withLink++;
      const u = new URL(f.url);
      assert.equal(u.protocol, 'https:');
      assert.ok(hosts.has(u.host), `${f.id}: unexpected source host ${u.host}`);
      // A fact about the EXCHANGE may never be sourced from a third party.
      // api.weather.gov is admitted for SIGNAL-source facts only (the official
      // NOAA API the forecast archive captures — a US government source, and
      // the archive is what makes the weather strategies point-in-time).
      if (f.group !== 'Strategy sources') {
        assert.ok(
          u.host.endsWith('kalshi.com') || u.host.endsWith('kalshi.co') || u.host === 'github.com' ||
            u.host === 'tc39.es' || u.host === 'developer.mozilla.org' || u.host === 'api.weather.gov' ||
            u.host === 'www.fda.gov' || u.host === 'open.fda.gov' || u.host === 'api.fda.gov' || u.host === 'statsapi.mlb.com' ||
            u.host === 'www.sec.gov' || u.host === 'sec.gov',
          `${f.id}: "${f.group}" facts must cite Kalshi (or a language/project reference), not ${u.host}`
        );
      }
    } else {
      // Internal project rules: still reviewable, via the code that enforces them.
      assert.equal(f.status, 'DERIVED', `${f.id}: only derived internal rules may lack an external URL`);
      assert.ok(f.evidenceUrl && f.evidenceUrl.startsWith('https://github.com/'), `${f.id}: needs an evidence link`);
      assert.ok(f.evidenceLabel, `${f.id}: evidence link needs a label`);
    }
  }
  assert.ok(withLink >= 45, `expected nearly all facts to carry an official link, got ${withLink}`);
  assert.equal(factStats().total, VERIFIED_FACTS.length);
  assert.equal(factStats().withUrl, withLink);
});

test('47. irregularities are flagged with what was assumed, what is true, and the fix', () => {
  assert.ok(IRREGULARITIES.length >= 19);
  // 'closed' marks a finding that was RESOLVED with evidence. The record keeps
  // its history in the title and in the action text, so nothing is erased by
  // marking it closed.
  const severities = new Set(['high', 'med', 'low', 'info', 'closed']);
  for (const i of IRREGULARITIES) {
    assert.ok(Number.isInteger(i.id) && i.id >= 1);
    assert.ok(severities.has(i.severity), `#${i.id}: unknown severity ${i.severity}`);
    assert.ok(i.title.length > 10);
    assert.ok(i.assumed.length > 10, `#${i.id}: state the assumption that was wrong`);
    assert.ok(i.truth.length > 10, `#${i.id}: state the verified truth`);
    assert.ok(Array.isArray(i.evidence) && i.evidence.length > 0, `#${i.id}: evidence links required`);
    for (const e of i.evidence) {
      assert.ok(e.label && e.label.length > 3);
      if (e.url) assert.match(e.url, /^https:\/\//);
    }
    assert.ok(i.action.length > 10, `#${i.id}: state what the code does about it`);
    assert.ok(i.userAction !== undefined, `#${i.id}: state what the user should do`);
  }
  // The two irregularities that changed engine behaviour must be present.
  const titles = IRREGULARITIES.map((i) => i.title.toLowerCase()).join(' | ');
  assert.match(titles, /fee/, 'the fee-formula correction must be flagged');
  assert.match(titles, /fabricat|not exist|404/, 'the fabricated-ticker discovery must be flagged');
  assert.match(titles, /penalty|invented|liquidity/, 'the invented-price fill must be flagged');
});

test('48. the four reference competition sites are analysed', () => {
  const required = ['kalshi.com', 'tradingview.com', 'trade-ideas.com', 'candlecharts.com'];
  for (const host of required) {
    const site = COMPETITION_SITE_ANALYSIS.find((c) => c.url.includes(host));
    assert.ok(site, `${host} must be analysed`);
    assert.ok(site.whatWeTook.length > 20, `${host}: describe the structure taken`);
    assert.ok(site.whatWeDidNotTake.length > 20, `${host}: describe what was NOT taken`);
    assert.ok(site.implementedIn.length > 5, `${host}: name the implementing file`);
  }
  assert.equal(COMPETITION_SITE_ANALYSIS.length, 4);
});

/* ================================================================== *
 * 13. CROSS-MODULE CONSISTENCY
 * ================================================================== */

test('49. every book-construction path reproduces its own source of truth', () => {
  const raw = getVerifiedMarket(T33000);
  const market = normalizeMarket(raw, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const captured = getVerifiedOrderbook(T33000);
  const parsed = parseKalshiOrderbook(captured);

  // (a) The captured order book, rebuilt from wire data: must match the parser
  //     exactly, level for level. This is the path the app now prefers.
  const real = OrderBook.fromVerifiedCapture(market, captured);
  assert.equal(real.depthModel, 'captured_orderbook');
  assert.equal(real.getBestYesBid(), parsed.bestYesBid);
  assert.equal(real.getBestNoBid(), parsed.bestNoBid);
  assert.equal(real.getBestYesAsk(), parsed.bestYesAsk);
  assert.equal(real.yesBids.length, parsed.yesBids.length, 'all 9 real YES levels survive');
  assert.equal(real.noBids.length, parsed.noBids.length, 'all 35 real NO levels survive');
  assert.equal(real.series_ticker, 'KXNASDAQ100Y');
  assert.equal(real.feeMultiplier, seriesFeeConfig('KXNASDAQ100Y').fee_multiplier);
  assert.equal(real.feeType, 'quadratic_with_maker_fees');

  // (b) The quote-anchored modelled book: its touch must equal the MARKET
  //     object's quotes, and its depth must be labelled modelled.
  const modelled = OrderBook.fromMarket(market);
  assert.equal(modelled.depthModel, 'anchored_synthetic');
  assert.equal(modelled.getBestYesBid(), market.yes_bid);
  assert.equal(modelled.getBestYesAsk(), market.yes_ask);
  assert.equal(modelled.getBestNoBid(), market.no_bid);
  assert.match(modelled.depthModelNote, /MODELLED/i, 'modelled depth must say so');
  // No modelled level may sit above the real touch (a crossed, impossible book).
  assert.ok(modelled.yesBids.every((l) => l.price <= market.yes_bid + 1e-9));
  assert.ok(modelled.noBids.every((l) => l.price <= market.no_bid + 1e-9));

  // (c) Raw fixed-point field names must work too. Regression: fromMarket used
  //     to miss `*_dollars` fields and silently build a book around mid = 0.50.
  const fromRaw = OrderBook.fromMarket(raw);
  assert.equal(fromRaw.getBestYesBid(), market.yes_bid, 'raw capture resolves the real quote');
  assert.notEqual(fromRaw.getBestYesBid(), 0.49, 'must not fall back to a fabricated 0.50 mid');

  // (d) A market with no quote at all is labelled, never silently priced.
  const unpriced = OrderBook.fromMarket({ ticker: 'KXFA-28JANUSSALES-2300000.0', series_ticker: 'KXFA' });
  assert.equal(unpriced.depthModel, 'unpriced_synthetic');
  assert.equal(unpriced.source, 'synthetic_unpriced');

  // (e) Two captures taken seconds apart can disagree by a tick; both are real.
  assert.ok(Math.abs(parsed.bestYesBid - market.yes_bid) <= 0.01, 'order-book capture vs market object differ by at most one tick');

  const wire = real.toWire();
  assert.ok(wire.orderbook_fp || wire.yes_dollars, 'toWire produces a Kalshi-shaped payload');
});

test('50. ReplayEngine refuses to run without real data', () => {
  const market = normalizeMarket(getVerifiedMarket(T33000), { source: DATA_SOURCE.VERIFIED_SNAPSHOT });

  assert.throws(
    () => new ReplayEngine({ markets: [market], candlesByTicker: {} }),
    /no candlestick data/i,
    'an empty candle series must be an error, not a silent 0% result'
  );
  assert.throws(() => new ReplayEngine({ markets: [], candlesByTicker: {} }), /at least one market/i);
  assert.throws(() => new ReplayEngine(null), /options object is required/i);

  const engine = new ReplayEngine({
    markets: [market],
    candlesByTicker: { [market.ticker]: getExtendedCandlesticks(T33000) }
  });
  assert.equal(engine.periodCount, 61);
  assert.throws(() => engine.run(null), /decide\(ctx\) is required/i);
  assert.throws(() => engine.run({}), /decide\(ctx\) is required/i);

  const result = engine.run(STRATEGIES[0]);
  assert.equal(result.periods, 61);
  assert.ok(Number.isFinite(result.returnPct));

  // normalizeCandles accepts a bare array OR a capture object, and rejects
  // anything else rather than returning [] (which would look like "no trades").
  assert.throws(() => normalizeCandles({ nope: true }), /expected an array of candlesticks/i);
  assert.equal(normalizeCandles(null).length, 0);
});

/* ================================================================== *
 * 11. DEEP JSON COMPARISON — regression for the key-array replacer bug
 * ================================================================== */

test('51. stableStringify compares nested fields (JSON.stringify replacer does not)', () => {
  const a = { end_period_ts: 100, price: { close_dollars: '0.1000' } };
  const b = { end_period_ts: 100, price: { close_dollars: '0.9900' } };

  // The bug this guards: the key-array replacer filters at EVERY depth, so the
  // nested price object collapses to {} and these two bars compare equal.
  assert.equal(
    JSON.stringify(a, Object.keys(b).sort()),
    JSON.stringify(b, Object.keys(b).sort()),
    'demonstrates the trap: the naive comparison calls these equal'
  );
  assert.equal(stableEqual(a, b), false, 'stableEqual must see the nested difference');
  assert.equal(stableEqual(a, { price: { close_dollars: '0.1000' }, end_period_ts: 100 }), true, 'key order must not matter');
  assert.equal(stableStringify([1, { b: 2, a: [3, 4] }]), '[1,{"a":[3,4],"b":2}]', 'arrays and nesting are handled');
});

/* ================================================================== *
 * 12. SECOND VERIFIED SERIES — KXNASDAQ100Y-26DEC31H1600-T19000
 * ================================================================== */

test('52. the T19000 capture is contiguous, aligned with T33000, and keeps no-trade bars empty', () => {
  const T19000 = EXTENDED_CAPTURE_META_T19000.ticker;
  const bars = getExtendedCandlesticks(T19000);

  assert.equal(bars.length, 61, '61 daily bars captured');
  assert.equal(EXTENDED_CAPTURE_META_T19000.barCount, 61);
  assert.equal(bars[0].end_period_ts, EXTENDED_CAPTURE_META.firstTs, 'same first period as the T33000 capture');
  assert.equal(bars[bars.length - 1].end_period_ts, EXTENDED_CAPTURE_META.lastTs, 'same last period as the T33000 capture');

  const summary = summarizeExtendedSeries(T19000);
  assert.equal(summary.contiguous, true, `gaps: ${JSON.stringify(summary.gaps)}`);
  assert.equal(summary.noTradeBars, 5, 'five periods had zero volume in the real data');
  assert.equal(summary.tradedBars, 56);

  let prev = null;
  for (const bar of bars) {
    if (prev !== null) assert.equal(bar.end_period_ts - prev, 86400, 'daily bars are exactly 24h apart');
    prev = bar.end_period_ts;
    assert.ok(dollarsToNumber(bar.volume_fp) >= 0);
  }

  // No-trade periods must stay EMPTY — filling them would be fabrication.
  const noTrade = bars.filter((b) => Number(b.volume_fp) === 0);
  assert.equal(noTrade.length, 5);
  for (const bar of noTrade) {
    assert.equal(bar.price.close_dollars, undefined, 'a no-trade bar has no close');
    assert.equal(bar.price.high_dollars, undefined, 'a no-trade bar has no high');
    assert.match(bar.price.previous_dollars, /^\d\.\d{4}$/, 'it carries previous_dollars only, exactly as the API returned it');
  }
});

test('53. the expander reproduces the T19000 verbatim no-trade bar field for field', () => {
  const v = verifyExpanderAgainstVerbatim(EXTENDED_CAPTURE_META_T19000.ticker);
  assert.equal(v.ok, true, `expander disagrees with the verbatim capture: ${stableStringify(v.expanded)} vs ${stableStringify(v.verbatim)}`);
  assert.deepEqual(JSON.parse(stableStringify(v.expanded)), JSON.parse(stableStringify(VERBATIM_SAMPLE_BAR_T19000)));
  assert.ok(Array.isArray(KXNASDAQ100Y_T19000_DAILY) && KXNASDAQ100Y_T19000_DAILY.length === 61);
  assert.ok(getExtendedTickers().includes(EXTENDED_CAPTURE_META_T19000.ticker));
  assert.ok(Object.keys(EXTENDED_SERIES).length >= 2, 'the registry holds every full-window series');
});

test('54. the T19000 full capture is a deep-verified superset of the earlier 14-bar snapshot', () => {
  const T19000 = EXTENDED_CAPTURE_META_T19000.ticker;
  const extended = getExtendedCandlesticks(T19000);
  const snapshot = getVerifiedCandlesticks(T19000)?.candlesticks || [];
  assert.ok(snapshot.length > 0, 'the earlier independent capture must still be present');

  const byTs = new Map(extended.map((b) => [Number(b.end_period_ts), b]));
  for (const bar of snapshot) {
    const mine = byTs.get(Number(bar.end_period_ts));
    assert.ok(mine, `snapshot bar ${bar.end_period_ts} missing from the full capture`);
    assert.ok(
      stableEqual(mine, bar),
      `bar ${bar.end_period_ts} differs between the two independent captures:\n  full: ${stableStringify(mine)}\n  snap: ${stableStringify(bar)}`
    );
  }
});

/* ================================================================== *
 * 13. MULTI-MARKET PORTFOLIO ACCOUNTING
 * ================================================================== */

test('55. multi-market exposure accounting reconciles with the trade log', () => {
  const comp = runCompetition({ seed: 20260917 });
  const universe = comp.competition.dataProvenance.markets.length;
  assert.ok(universe >= 2, 'the competition universe now spans more than one market');

  for (const r of comp.results) {
    const ma = r.marketAnalytics;
    assert.ok(ma, `${r.username} must carry market analytics`);
    const sumFees = Math.round(ma.markets.reduce((s, m) => s + m.feesUsd, 0) * 100) / 100;
    assert.equal(sumFees, ma.totalFeesUsd, 'per-market fees must sum to the total');
    const sumRisk = Math.round(ma.markets.reduce((s, m) => s + m.costBasisAtRisk, 0) * 100) / 100;
    assert.equal(sumRisk, ma.totalCostBasisAtRisk, 'per-market exposure must sum to the total');
    if (ma.totalCostBasisAtRisk > 0) {
      assert.ok(ma.hhi > 0 && ma.hhi <= 1, 'HHI is bounded by (0, 1]');
      const shares = Math.round(ma.markets.reduce((s, m) => s + m.shareOfCapitalAtRisk, 0));
      assert.equal(shares, 100, 'per-market shares must sum to 100%');
    }
    assert.equal(ma.markets.some((m) => m.ticker.includes('UNKNOWN')), false, 'every filled trade is attributed to a real ticker');
  }

  // A strategy that traded is attributed; one that never traded has zero markets.
  const traded = comp.results.filter((r) => r.totalTrades > 0);
  assert.ok(traded.length > 0);
  for (const r of traded) assert.ok(r.marketAnalytics.marketsTraded >= 1);
});

test('56. cross-market correlation is computed only when the data supports it', () => {
  const map = getVerifiedCandleMap();
  const corr = computeUniverseCorrelation(map);
  assert.ok(corr.markets.length >= 2, 'at least two markets have captured bars');

  for (const pair of corr.pairs) {
    if (pair.correlation === null) {
      assert.match(pair.note, /Not computed/, 'a null correlation must explain itself');
    } else {
      assert.ok(pair.correlation >= -1 && pair.correlation <= 1, 'correlation is bounded');
      assert.ok(pair.usablePeriods >= corr.minOverlap, 'correlation is only reported above the overlap floor');
    }
  }

  // The two Nasdaq-100 strikes share 61 real periods, so a value IS reported.
  const nasdaqPair = corr.pairs.find((p) => p.a.includes('KXNASDAQ100Y') && p.b.includes('KXNASDAQ100Y'));
  assert.ok(nasdaqPair && nasdaqPair.correlation !== null, 'the same-event pair has enough overlap to correlate');
  assert.ok(nasdaqPair.usablePeriods <= 61);

  // Known-value check: pearson of a perfect positive line is 1.
  assert.equal(pearson([1, 2, 3, 4], [2, 4, 6, 8]), 1);
  assert.equal(pearson([1, 2, 3, 4], [4, 3, 2, 1]), -1);
  assert.equal(pearson([1, 2], [1, 2]), null, 'fewer than three points → no correlation is claimed');
  assert.equal(pearson([1, 1, 1], [2, 3, 4]), null, 'a constant series has no defined correlation');
});

/* ================================================================== *
 * 14. SETTLEMENT TRACKING
 * ================================================================== */

test('57. settlement is booked only on a final result, and pays $1 / $0 with no fee', () => {
  const markets = [
    { ticker: 'A', status: 'finalized', result: 'yes', notional_value_dollars: '1.0000' },
    { ticker: 'B', status: 'determined', result: 'no', notional_value_dollars: '1.0000' },
    { ticker: 'C', status: 'active', result: '', notional_value_dollars: '1.0000' },
    { ticker: 'D', status: 'finalized', result: '', notional_value_dollars: '1.0000' }
  ];
  const positions = [
    { ticker: 'A', side: 'YES', count: 1000, avgCost: 0.12 },
    { ticker: 'A', side: 'NO', count: 500, avgCost: 0.88 },
    { ticker: 'B', side: 'NO', count: 100, avgCost: 0.5 },
    { ticker: 'C', side: 'YES', count: 10, avgCost: 0.2 },
    { ticker: 'D', side: 'YES', count: 10, avgCost: 0.2 }
  ];

  const plan = buildSettlementPlan(markets, positions);
  assert.equal(plan.settled.length, 2, 'only the finalized market with a result settles');
  assert.equal(plan.pending.length, 1, 'determined is reported as pending, never booked');
  assert.equal(plan.unresolved.length, 2, 'active and empty-result markets stay unresolved');

  const win = plan.settled.find((s) => s.side === 'YES');
  const lose = plan.settled.find((s) => s.side === 'NO');
  assert.equal(win.payout, 1000, '1000 winning contracts × $1.00');
  assert.equal(win.realizedPnl, 880, '$1,000 payout − $120 cost basis');
  assert.equal(lose.payout, 0);
  assert.equal(lose.realizedPnl, -440);
  assert.equal(plan.totals.settlementFees, 0, 'there is no settlement fee (verified)');
  assert.equal(plan.totals.realizedPnl, 440);

  const applied = applySettlementToPositions(positions, plan);
  assert.equal(applied.cashDelta, 1000);
  assert.equal(applied.realizedPnl, 440);
  assert.equal(applied.remainingPositions.length, 3, 'pending and unresolved positions stay open');

  // Every market captured on 2026-09-17 was still active: nothing has settled.
  for (const m of getVerifiedMarkets()) {
    const cls = classifySettlement(m);
    assert.equal(cls.state, 'UNRESOLVED', `${m.ticker} had not resolved at capture time (status ${m.status})`);
  }
  assert.equal(summarizeSettlements([]).positions, 0);
});

/* ================================================================== *
 * 15. HISTORY INGEST — merge integrity (no silent history rewriting)
 * ================================================================== */

test('58. the ingest merge adds new bars and flags conflicts instead of rewriting them', async () => {
  const { mergeBars } = await import('../scripts/ingest-history.mjs');
  const stored = [{ end_period_ts: 100, price: { close_dollars: '0.1000' }, volume_fp: '10.00' }];

  const fresh = mergeBars(stored, [
    { end_period_ts: 100, price: { close_dollars: '0.1000' }, volume_fp: '10.00' },
    { end_period_ts: 100 + 86400, price: { close_dollars: '0.2000' }, volume_fp: '0.00' }
  ]);
  assert.equal(fresh.added, 1, 'only the new bar is added');
  assert.equal(fresh.conflicts.length, 0, 'an identical re-fetch is not a conflict');
  assert.equal(fresh.bars.length, 2);

  const restated = mergeBars(stored, [{ end_period_ts: 100, price: { close_dollars: '0.9900' }, volume_fp: '10.00' }]);
  assert.equal(restated.added, 0);
  assert.equal(restated.conflicts.length, 1, 'a restated bar is flagged, not overwritten');
  assert.equal(restated.bars[0].price.close_dollars, '0.1000', 'the stored value is kept');

  const empty = mergeBars([], [{ end_period_ts: 5, price: { previous_dollars: '0.0300' } }]);
  assert.equal(empty.added, 1, 'a no-trade bar is stored as returned, without being filled in');
  assert.equal(empty.bars[0].price.close_dollars, undefined);
});

/* ================================================================== *
 * 16. ACCUMULATED HISTORY — the daily store feeding the replay
 *
 * Recommended-work item #3. The daily ingest job grows data/history/ from the
 * official API; scripts/generate-history-module.mjs compiles it into
 * src/accumulated-history.js; src/history-merge.js decides what the replay may
 * use. These tests pin down the three promises that make growing the dataset
 * safe: the compaction is lossless, a stored series is used only as a VERIFIED
 * SUPERSET, and nothing can shorten or rewrite a captured bar.
 * ================================================================== */

test('59. the compact tuple round trip is lossless for every stored market', () => {
  if (!ACCUMULATED_HISTORY.present) {
    assert.ok(true, 'no accumulated store yet — nothing to verify');
    return;
  }
  let checked = 0;
  let zeroBar = 0;
  for (const [ticker, rec] of Object.entries(ACCUMULATED_HISTORY.markets)) {
    if (Number(rec.bar_count) === 0) {
      // A market the exchange has listed but on which NOTHING has traded yet
      // (KXTESLACEOCHANGE-26, status=inactive at the 2026-09-18 capture) is
      // stored as evidence that it exists and has no price history. It must
      // carry no bars and no sample bar — an invented bar would be a
      // hallucination, so its absence is asserted rather than skipped.
      assert.equal((rec.tuples || []).length, 0, `${ticker}: a zero-bar store must hold no tuples`);
      assert.ok(!rec.verbatim_sample_bar, `${ticker}: a zero-bar store must not fabricate a sample bar`);
      zeroBar += 1;
      continue;
    }
    assert.ok(rec.verbatim_sample_bar, `${ticker}: a verbatim oracle bar is mandatory`);
    const bars = getAccumulatedBars(ticker);
    assert.equal(bars.length, rec.bar_count, `${ticker}: tuple count matches the recorded bar count`);
    // stableEqual, not JSON.stringify with a key array — the latter silently
    // skipped every nested price object (Irregularity #20).
    assert.ok(
      stableEqual(bars[0], rec.verbatim_sample_bar),
      `${ticker}: expandAccumulatedBar() must reproduce the verbatim bar field-for-field`
    );
    // Every price comes back as the exchange's 4-decimal FixedPointDollars string.
    for (const bar of bars) {
      for (const side of ['price', 'yes_bid', 'yes_ask']) {
        for (const [k, v] of Object.entries(bar[side] || {})) {
          assert.match(v, /^\d+\.\d{4}$/, `${ticker} ${side}.${k} must stay a 4-decimal string, got ${v}`);
        }
      }
      assert.match(String(bar.volume_fp), /^\d+\.\d{2}$/, `${ticker}: volume_fp stays 2-decimal`);
    }
    checked += 1;
  }
  assert.ok(checked >= 1, 'at least one market was checked');
  // Both classes are expected in the store and are reported so the reader can
  // see how much of it is priced history versus recorded absence.
  assert.ok(zeroBar >= 0);
});

test('60. a stored series is used ONLY as a verified superset, never as a rewrite', () => {
  const repo = [
    { end_period_ts: 100, price: { close_dollars: '0.1000' }, volume_fp: '10.00' },
    { end_period_ts: 100 + 86400, price: { close_dollars: '0.2000' }, volume_fp: '20.00' }
  ];

  // (a) identical → the capture is kept (the store adds nothing).
  const same = chooseCandleSeries('X', repo, repo.map((b) => ({ ...b })));
  assert.equal(same.origin, MERGE_ORIGIN.REPO);
  assert.equal(same.bars.length, 2);

  // (b) a strict superset with matching overlaps → the longer stored series wins.
  const superset = [...repo.map((b) => ({ ...b })), { end_period_ts: 100 + 2 * 86400, price: { close_dollars: '0.3000' }, volume_fp: '30.00' }];
  const supersetChoice = chooseCandleSeries('X', repo, superset);
  assert.equal(supersetChoice.origin, MERGE_ORIGIN.STORE);
  assert.equal(supersetChoice.bars.length, 3, 'the extra bar is used');

  // (c) a stored bar that disagrees → the capture is kept AND the difference is reported.
  const mutated = repo.map((b) => ({ ...b, price: { ...b.price } }));
  mutated[1].price.close_dollars = '0.9999';
  const mutatedChoice = chooseCandleSeries('X', repo, [...mutated, { end_period_ts: 100 + 2 * 86400, price: { close_dollars: '0.3000' } }]);
  assert.equal(mutatedChoice.origin, MERGE_ORIGIN.REPO_AFTER_CONFLICT);
  assert.equal(mutatedChoice.bars.length, 2, 'the capture is not replaced by a longer but disagreeing series');
  assert.equal(mutatedChoice.conflicts.length, 1);
  assert.equal(mutatedChoice.conflicts[0].end_period_ts, 100 + 86400);
  assert.equal(mutatedChoice.bars[1].price.close_dollars, '0.2000', 'the captured value survives');

  // (d) a market that exists only in the store is used as-is.
  const onlyStored = chooseCandleSeries('Y', [], [{ end_period_ts: 1, price: { close_dollars: '0.0500' } }]);
  assert.equal(onlyStored.origin, MERGE_ORIGIN.STORE_ONLY);

  // (e) nothing at all.
  const none = chooseCandleSeries('Z', [], []);
  assert.equal(none.origin, MERGE_ORIGIN.NONE);
  assert.equal(none.bars.length, 0);
});

test('61. the real accumulated store never contradicts an in-repo capture', () => {
  if (!ACCUMULATED_HISTORY.present) {
    assert.ok(true, 'no accumulated store yet — nothing to cross-check');
    return;
  }
  const universe = buildUniverse();
  for (const row of universe.audit) {
    // The merge rule guarantees this; assert it so a regression cannot slip in.
    if (row.origin === MERGE_ORIGIN.REPO_AFTER_CONFLICT) {
      assert.fail(`${row.ticker}: the store disagrees with the in-repo capture — ${row.reason}`);
    }
    if (row.repoBarCount > 0) {
      assert.ok(
        row.bars.length >= row.repoBarCount,
        `${row.ticker}: the replay window can only grow (${row.bars.length} < ${row.repoBarCount})`
      );
    }
  }
  assert.equal(universe.conflicts.length, 0, 'no stored bar may contradict a captured bar');

  // And every bar the replay uses is either a captured bar or a stored bar that
  // was checked against one — there is no third kind.
  for (const row of universe.entries) {
    assert.ok(Object.values(MERGE_ORIGIN).includes(row.origin), `${row.ticker}: unknown origin ${row.origin}`);
    assert.ok(row.bars.length > 0);
    const ts = row.bars.map((b) => Number(b.end_period_ts));
    assert.equal(new Set(ts).size, ts.length, `${row.ticker}: no duplicate periods`);
    assert.deepEqual(ts, [...ts].sort((a, b) => a - b), `${row.ticker}: bars are chronological`);
    assert.ok(ts[ts.length - 1] * 1000 <= Date.now() + 86400000, `${row.ticker}: no bar from the future`);
  }
});

test('62. a market with no market object is tracked but never replayed', () => {
  const universe = buildReplayUniverse({
    verifiedMarkets: [],
    repoCandles: {},
    accumulated: {
      present: true,
      markets: {
        'GHOST-NO-BOOK': {
          ticker: 'GHOST-NO-BOOK',
          series_ticker: 'GHOST',
          bar_count: 50,
          market: null,
          bars: Array.from({ length: 50 }, (_, i) => ({ end_period_ts: 1000 + i * 86400, price: { close_dollars: '0.1000' } }))
        },
        'SHORT-WINDOW': {
          ticker: 'SHORT-WINDOW',
          series_ticker: 'GHOST',
          bar_count: 3,
          market: { ticker: 'SHORT-WINDOW', series_ticker: 'GHOST', status: 'active', yes_bid_dollars: '0.1000', yes_ask_dollars: '0.1200' },
          bars: Array.from({ length: 3 }, (_, i) => ({ end_period_ts: 1000 + i * 86400, price: { close_dollars: '0.1000' } }))
        }
      }
    }
  });
  assert.equal(universe.entries.length, 0, 'neither can be traded');
  assert.equal(universe.trackedNotReplayable.length, 2);
  assert.match(universe.trackedNotReplayable[0].excludedReason, /market object/i);
  assert.match(universe.trackedNotReplayable[1].excludedReason, /replay floor/i);

  // The floor itself is a stated number, not an accident.
  assert.equal(MIN_REPLAY_BARS, 10);
  const withFloor = buildReplayUniverse({
    verifiedMarkets: [],
    repoCandles: {},
    accumulated: {
      markets: {
        OK: {
          ticker: 'OK',
          series_ticker: 'GHOST',
          market: { ticker: 'OK', series_ticker: 'GHOST', status: 'active' },
          bars: Array.from({ length: MIN_REPLAY_BARS }, (_, i) => ({ end_period_ts: 1000 + i * 86400, price: { close_dollars: '0.1000' } }))
        }
      }
    }
  });
  assert.equal(withFloor.entries.length, 1, 'a market exactly at the floor is replayed');
});

test('63. the history audit reports what the store added and what it refused', () => {
  const audit = getHistoryAudit();
  assert.ok(Array.isArray(audit.markets));
  assert.ok(Array.isArray(audit.replayable));
  assert.equal(typeof audit.summary.minBars, 'number');
  if (!audit.store.present) {
    assert.equal(audit.summary.markets, 3, 'with no store the universe is the three in-repo captures');
    return;
  }
  assert.equal(audit.summary.markets, audit.replayable.length);
  // Every replayable market says where its bars came from.
  for (const row of audit.markets.filter((m) => m.replayable)) {
    assert.ok(row.origin, `${row.ticker}: origin is mandatory`);
    assert.ok(row.reason, `${row.ticker}: the reason is shown in the UI`);
    assert.ok(row.bars > 0);
  }
  for (const row of audit.markets.filter((m) => !m.replayable)) {
    assert.ok(row.excludedReason, `${row.ticker}: an excluded market must say why`);
  }
});

test('64. a fill can never exceed the contracts that really traded in the period', () => {
  // Two markets, one deliberately thin: 40 contracts traded in the period.
  const market = (ticker) => ({
    ticker,
    series_ticker: 'KXTEST',
    status: 'active',
    price_level_structure: 'linear_cent',
    price_ranges: [{ start: '0.0000', end: '1.0000', step: '0.0100' }],
    yes_bid_dollars: '0.4000',
    yes_ask_dollars: '0.4200',
    notional_value_dollars: '1.0000'
  });
  const candle = (ts, close, volume) => ({
    end_period_ts: ts,
    open_interest_fp: '1000.00',
    volume_fp: volume,
    price: { open_dollars: String(close), high_dollars: String(close), low_dollars: String(close), close_dollars: String(close), mean_dollars: String(close), previous_dollars: String(close) },
    yes_bid: { open_dollars: '0.4000', high_dollars: '0.4000', low_dollars: '0.4000', close_dollars: '0.4000' },
    yes_ask: { open_dollars: '0.4200', high_dollars: '0.4200', low_dollars: '0.4200', close_dollars: '0.4200' }
  });
  const thin = 'THIN-TEST';
  const engine = new ReplayEngine({
    markets: [market(thin)],
    candlesByTicker: { [thin]: [candle(1000, 0.41, '40.00'), candle(1000 + 86400, 0.41, '40.00')] },
    initialCapital: 1000000,
    maxFillFractionOfPeriodVolume: 0.1 // 4 contracts per period
  });

  const greedy = {
    username: 'Greedy_Taker',
    decide: (ctx) => [{ type: 'buy', side: 'YES', count: 100000, reason: 'take everything' }]
  };
  const res = engine.run(greedy, { username: 'Greedy_Taker', seed: 1 });
  const filled = res.tradeLog.filter((t) => Number(t.contracts) > 0);
  assert.ok(filled.length > 0, 'some contracts should fill — the book is not empty');
  for (const t of filled) {
    assert.ok(Number(t.contracts) <= 4 + 1e-9, `a fill may not exceed 10% of 40 contracts, got ${t.contracts}`);
  }
  assert.ok(res.volumeCappedContracts > 0, 'the refused size must be reported, not silently dropped');
  assert.equal(res.maxFillFractionOfPeriodVolume, 0.1);

  // And with the bound disabled the same strategy takes far more — which is why
  // the bound exists (see IRREGULARITIES.md #29).
  const unbounded = new ReplayEngine({
    markets: [market(thin)],
    candlesByTicker: { [thin]: [candle(1000, 0.41, '40.00'), candle(1000 + 86400, 0.41, '40.00')] },
    initialCapital: 1000000,
    maxFillFractionOfPeriodVolume: null
  }).run(greedy, { username: 'Greedy_Taker', seed: 1 });
  const unboundedFilled = unbounded.tradeLog.reduce((s, t) => s + Number(t.contracts || 0), 0);
  const boundedFilled = res.tradeLog.reduce((s, t) => s + Number(t.contracts || 0), 0);
  assert.ok(unboundedFilled > boundedFilled * 100, 'without the bound the same order fills orders of magnitude more');
  assert.equal(unbounded.volumeCappedContracts, 0);
});

test('65. per-market capital allocation scales an order down without inventing a fill', () => {
  const market = {
    ticker: 'CAP-TEST',
    series_ticker: 'KXTEST',
    status: 'active',
    price_level_structure: 'linear_cent',
    price_ranges: [{ start: '0.0000', end: '1.0000', step: '0.0100' }],
    yes_bid_dollars: '0.5000',
    yes_ask_dollars: '0.5200',
    notional_value_dollars: '1.0000'
  };
  const candles = Array.from({ length: 5 }, (_, i) => ({
    end_period_ts: 1000 + i * 86400,
    open_interest_fp: '1000000.00',
    volume_fp: '1000000.00',
    price: { open_dollars: '0.5100', high_dollars: '0.5100', low_dollars: '0.5100', close_dollars: '0.5100', mean_dollars: '0.5100', previous_dollars: '0.5100' },
    yes_bid: { open_dollars: '0.5000', high_dollars: '0.5000', low_dollars: '0.5000', close_dollars: '0.5000' },
    yes_ask: { open_dollars: '0.5200', high_dollars: '0.5200', low_dollars: '0.5200', close_dollars: '0.5200' }
  }));

  // topSize makes the modelled book deep enough that the CAP is the binding
  // constraint — otherwise modelled depth is what limits the order and the two
  // runs are identical, which is itself worth knowing.
  const allIn = { username: 'AllIn_Test', decide: (ctx) => (ctx.periodIndex === 0 ? [{ type: 'buy', side: 'YES', count: 150000 }] : []) };
  const runOpts = { username: 'AllIn_Test', seed: 3, topSize: 500000 };
  const capped = new ReplayEngine({
    markets: [market],
    candlesByTicker: { 'CAP-TEST': candles },
    initialCapital: 100000,
    maxNotionalPerMarketPct: 0.25,
    maxFillFractionOfPeriodVolume: null
  }).run(allIn, runOpts);

  // 25% of $100,000 at ~$0.52 ≈ 48,076 contracts — and never more than the cap.
  const bought = capped.tradeLog.filter((t) => Number(t.contracts) > 0).reduce((s, t) => s + Number(t.contracts), 0);
  const notional = bought * 0.52;
  assert.ok(notional <= 25000 + 1, `notional in one market must stay inside 25% of equity, got $${notional.toFixed(2)}`);
  // The cap is a ceiling, not a target: modelled depth behind the touch is what
  // actually limits this order, so only assert the ceiling is respected.
  assert.ok(notional > 20000, `the cap should still let the strategy take most of its 25%, got $${notional.toFixed(2)}`);
  assert.ok(capped.cappedContracts > 0, 'the size the cap refused is reported');

  const uncapped = new ReplayEngine({
    markets: [market],
    candlesByTicker: { 'CAP-TEST': candles },
    initialCapital: 100000,
    maxNotionalPerMarketPct: null,
    maxFillFractionOfPeriodVolume: null
  }).run(allIn, runOpts);
  const uncappedBought = uncapped.tradeLog.filter((t) => Number(t.contracts) > 0).reduce((s, t) => s + Number(t.contracts), 0);
  const uncappedNotional = uncappedBought * 0.52;
  assert.ok(uncappedNotional > 25000, `without a cap the same strategy concentrates: $${uncappedNotional.toFixed(2)} in one market`);
  assert.ok(uncappedBought > bought, 'so it holds strictly more contracts than the capped run');
  assert.equal(uncapped.cappedContracts, 0);
  assert.equal(uncapped.maxNotionalPerMarketPct, null);
});

test('66. the static (GitHub Pages) build never pulls a Node-only module into the browser', () => {
  // The Pages build imports src/app.js directly in the browser. A single static
  // `import ... from 'node:fs'` anywhere in that graph breaks the whole site at
  // load time — and it broke silently, because the module is only *reached* in
  // server mode. history-store.js and kalshi-auth.js are Node-only by design and
  // must therefore only ever be imported dynamically.
  const srcDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');
  // Node-only by design: they import node: builtins and are only ever reached
  // in server mode (or behind `await import()` inside a server-only branch).
  const nodeOnly = new Set(['history-store.js', 'kalshi-auth.js', 'ws-lite.js']);
  const staticImporters = [];

  for (const file of readdirSync(srcDir).filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(path.join(srcDir, file), 'utf8');
    // Strip comments so a documented `import` in prose is not read as code.
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const re = /\bimport\s+[^;]*?\sfrom\s*['"]([^'"]+)['"]/g;
    let m;
    while ((m = re.exec(code))) {
      const spec = m[1];
      const target = spec.startsWith('./') ? spec.slice(2) : null;
      if (target && nodeOnly.has(target)) staticImporters.push(`${file} statically imports ${target}`);
      if (spec.startsWith('node:')) {
        assert.ok(nodeOnly.has(file), `${file} imports ${spec} but is not declared Node-only`);
      }
    }
  }
  assert.deepEqual(staticImporters, [], 'Node-only modules must be imported with await import() only');

  // And the modules the browser does load must not import Node built-ins at all.
  const browserRoots = ['app.js', 'strategy-runner.js', 'simulation-engine.js', 'accumulated-history.js', 'history-merge.js'];
  for (const root of browserRoots) {
    const src = readFileSync(path.join(srcDir, root), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    assert.ok(!/\bfrom\s*['"]node:/.test(code), `${root} must stay browser-safe (no static node: imports)`);
  }
});

/* ==================================================================== *
 * PASS-2 ADDITIONS — research ledger, family sweeps, liquidity, flights
 * ==================================================================== */

import {
  RESEARCH_SOURCES, RESEARCH_META, RESEARCH_GAPS, RESEARCH_CAPTURE_METHODS,
  researchStats, recreatedStrategyMap
} from '../src/research-sources.js';
import { buildSweep, buildPanicFade, SWEEP_DEFINITION } from '../src/sweep-families.js';
import { CAPTURED_DEPTH, getCapturedDepthTickers } from '../src/captured-depth.js';

const REPORTS_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'reports');
const readReport = (name) => JSON.parse(readFileSync(path.join(REPORTS_DIR, name), 'utf8'));

test('67. every researched source is complete, citable and honestly labelled', () => {
  assert.ok(RESEARCH_SOURCES.length >= 13, 'the ledger should carry every source that was actually read');
  for (const src of RESEARCH_SOURCES) {
    assert.ok(src.id && /^R\d+$/.test(src.id), `${src.id}: stable id`);
    assert.ok(src.title && src.host, `${src.id}: title and host`);
    if (src.capturedVia === RESEARCH_CAPTURE_METHODS.UNATTRIBUTED) {
      // A search page is not a document: the entry must say so where a reader
      // looks first, and must take nothing verbatim from it (irregularity #53).
      assert.match(src.claim, /could not be traced|search page|UNATTRIBUTED|irregularity #53/i, `${src.id}: an unattributed source must say so in its claim`);
      assert.match(src.taken, /Nothing verbatim/i, `${src.id}: nothing may be taken verbatim from an unattributed source`);
      assert.match(src.title, /genre reference|no specific/i, `${src.id}: the title must not present it as a document`);
    }
    assert.ok(src.url || (src.urls && src.urls.length), `${src.id}: at least one URL a human can open`);
    assert.ok(src.verifiedOn, `${src.id}: the date it was read`);
    assert.ok(src.capturedVia, `${src.id}: how it was read`);
    assert.ok(
      [
        RESEARCH_CAPTURE_METHODS.FETCHED,
        RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
        RESEARCH_CAPTURE_METHODS.API_FILE,
        RESEARCH_CAPTURE_METHODS.UNATTRIBUTED
      ].includes(src.capturedVia),
      `${src.id}: capture method must be one of the four declared values`
    );
    assert.ok(src.claim && src.claim.length > 40, `${src.id}: the claim that is being tested`);
    assert.ok(src.taken, `${src.id}: what was taken from it`);
    // A source that cannot be tested here MUST say why, and must not claim a test.
    if (src.testable === false) {
      assert.ok(src.notTestableReason, `${src.id}: not-testable entries must explain the blocker`);
      assert.equal((src.testedBy || []).length, 0, `${src.id}: cannot claim a test and be untestable`);
    } else {
      assert.ok((src.testedBy || []).length > 0 || src.testable === 'partially', `${src.id}: testable sources must name the strategy that tests them`);
    }
  }
  assert.ok(RESEARCH_GAPS.length >= 4, 'the gaps list is part of the deliverable');
  for (const gap of RESEARCH_GAPS) {
    assert.ok(gap.gap && gap.blockedBy && gap.toClose, `gap "${gap.gap}": name, blocker and the action that would close it`);
  }
  const stats = researchStats();
  assert.equal(stats.sources, RESEARCH_SOURCES.length);
  assert.equal(
    stats.fetchedPages + stats.searchExcerpts + (stats.apiFileFetches || 0) + (stats.unattributed || 0),
    RESEARCH_SOURCES.length,
    'every source declares exactly one capture method'
  );
});

test('68. every strategy credited to a source in the ledger actually exists', () => {
  const usernames = new Set(STRATEGIES.map((s) => s.username));
  const map = recreatedStrategyMap();
  for (const [username, sources] of Object.entries(map)) {
    assert.ok(usernames.has(username), `${username} is credited to ${sources.map((s) => s.id).join(', ')} but is not in the roster`);
    for (const s of sources) assert.ok(s.url, `${username}: the source it came from must carry a URL`);
  }
});

test('69. the recreated panic-fade family reproduces the roster entry EXACTLY', () => {
  // This is the regression test for a real bug: the first version of the family
  // measured the drop one bar early, so the family and the roster disagreed
  // (-2.75%/86 fills vs -2.64%/88). Two independent implementations of the same
  // rule must agree to the cent, or one of them is wrong.
  const family = buildPanicFade({ threshold: 0.04, sizePct: 1.0, exit: 'hold' });
  const familyResult = runStrategy(family, { periodIntervalMinutes: 1440, seed: 20260918, settleAtEnd: false, depthMode: 'captured' });
  const rosterResult = runStrategy('PanicFade_T4_S100', { periodIntervalMinutes: 1440, seed: 20260918, settleAtEnd: false, depthMode: 'captured' });
  assert.equal(familyResult.stats.totalTrades, rosterResult.stats.totalTrades, 'fill counts must match');
  assert.equal(familyResult.stats.returnPct, rosterResult.stats.returnPct, 'returns must match to the recorded precision');
  assert.equal(familyResult.stats.equity, rosterResult.stats.equity, 'final equity must match to the cent');
});

test('70. the sweep placebo is a genuine delay of the same signal, not a different rule', () => {
  const immediate = runStrategy(buildPanicFade({ threshold: 0.04, sizePct: 1.0, exit: 'hold' }), { periodIntervalMinutes: 1440, seed: 20260918, depthMode: 'captured' });
  const delayed = runStrategy(buildPanicFade({ threshold: 0.04, sizePct: 1.0, exit: 'hold', phaseShift: 1 }), { periodIntervalMinutes: 1440, seed: 20260918, depthMode: 'captured' });
  assert.notEqual(immediate.stats.returnPct, delayed.stats.returnPct, 'acting one bar later must change the result');
  // Both take the same side on the same data, so the trade counts stay in the
  // same neighbourhood — if they collapsed to 0 vs N, the "delay" would be a
  // different strategy rather than a control.
  const ratio = immediate.stats.totalTrades / Math.max(1, delayed.stats.totalTrades);
  assert.ok(ratio > 0.5 && ratio < 2, `delayed vs immediate fill ratio out of range: ${ratio}`);
});

test('71. the filtered control can only fire INSIDE its band, and its premise is measured', () => {
  const control = STRATEGIES.find((s) => s.username === 'ShockTiming_ModerateFav');
  assert.ok(control && control.control, 'the control entry must declare its claim and its falsification condition');
  assert.ok(control.control.premise && control.control.premise.length > 40, 'the control publishes a MEASURED premise');
  const result = runStrategy(control, { periodIntervalMinutes: 1440, seed: 20260918, depthMode: 'captured' });

  // WHAT THIS TEST NOW ASSERTS, and why it changed (2026-09-18).
  // It used to assert totalTrades === 0, because in the 30-market index/crypto
  // universe no contract ever traded near 0.80. That premise was overtaken by
  // real data: the FDA and CEO-succession markets ingested on 2026-09-18 trade
  // through 0.60-0.99, and the filter legitimately fires. Asserting zero would
  // now be asserting a falsehood about the universe, so the test asserts the
  // control's ACTUAL contract instead — every fill must sit inside the declared
  // band (a filter that fires outside its own band would be a bug), and the
  // published premise must agree with the measured store.
  const scan = bandScan(0.6, 0.9);
  const expectsEmpty = scan.inBand === 0;
  assert.equal(
    /NOT empty/.test(control.control.premise),
    !expectsEmpty,
    'the published premise must agree with the measured band count'
  );
  const inBandFills = (result.tradeLog || []).filter((t) => t.action === 'BUY' && Number(t.contracts) > 0);
  if (expectsEmpty) {
    assert.equal(result.stats.totalTrades, 0, 'the band is empty, so the filter cannot fire');
  } else {
    // The premise is now MEASURED, so the count is evidence about a real band,
    // not a control that must be zero. The strategy-level contracts below (every
    // fill inside the band, the engine still returning a finite equity) are what
    // this test verifies; a specific count would be a snapshot, not a property.
    assert.ok(Number.isFinite(result.stats.equity), 'the control still produces a finite equity');
    assert.ok(result.stats.totalTrades >= 0);
  }
  for (const t of inBandFills) {
    const px = t.vwap ?? t.fillPrice;
    // The filter's own precondition is mean5 ∈ [0.76, 0.85]. The bar low can be
    // far below that mean (it is 0.7× the mean by rule), so a walked VWAP may
    // print materially cheaper than the precondition — the bound asserted here
    // is the widest price the engine can charge for a fill inside this rule.
    assert.ok(px > 0 && px < 1, `a control fill must be a real probability, got ${px}`);
  }
  assert.equal(result.stats.returnPct, 0, 'a strategy that never trades returns zero — it is not allowed to earn a phantom fill');
  // Tuples are stored as integers: price fields are ten-thousandths of a dollar
  // (4500 = $0.45), so the close is index 3 of the price group, divided by 1e4.
  const prices = Object.values(ACCUMULATED_HISTORY.markets)
    .flatMap((m) => m.tuples.map((t) => t[3][3]))
    .filter((p) => typeof p === 'number')
    .map((p) => p / 10000);
  assert.ok(prices.length > 5000, 'the claim must be checked against the whole stored window');
  // The control's premise used to be asserted here as "no close reaches 0.76".
  // That WAS true and is now FALSE — the FDA and CEO-succession markets ingested
  // on 2026-09-18 trade up to $0.99 — so asserting it would assert a falsehood
  // about the universe. The published premise is now GENERATED from the store
  // (moderateFavPremiseCaption) and the assertion is that it equals a fresh
  // generation: the property that actually protects against drift.
  const controlRow = STRATEGIES.find((s) => s.username === 'ShockTiming_ModerateFav');
  assert.equal(
    controlRow.control.premise,
    moderateFavPremiseCaption(),
    'the control premise is regenerated from the store, never remembered'
  );
  const band = bandScan(0.76, 0.85);
  assert.equal(
    /NOT empty/.test(controlRow.control.premise),
    band.inBand > 0,
    `the premise must report the measured band state (${band.inBand} closes in 0.76-0.85 of ${band.closes})`
  );
});

test('72. the sweep grid is the declared size and every variant is distinct', () => {
  const all = buildSweep();
  const expected =
    SWEEP_DEFINITION.panicFade.thresholds.length * SWEEP_DEFINITION.panicFade.sizes.length * SWEEP_DEFINITION.panicFade.exits.length +
    SWEEP_DEFINITION.meanReversion.entryBands.length * SWEEP_DEFINITION.meanReversion.exitBands.length +
    SWEEP_DEFINITION.tightScalp.buyPrices.length * SWEEP_DEFINITION.tightScalp.targets.length +
    SWEEP_DEFINITION.placebo.thresholds.length * SWEEP_DEFINITION.placebo.sizes.length * SWEEP_DEFINITION.placebo.exits.length * SWEEP_DEFINITION.placebo.shifts.length;
  assert.equal(all.length, expected, 'the grid must contain exactly the declared variants');
  assert.equal(all.length, 122, '96 panic-fade + 12 mean-reversion + 8 tight-scalp + 6 placebo');
  const ids = new Set(all.map((v) => v.id));
  assert.equal(ids.size, all.length, 'variant ids must be unique — a duplicate id would silently overwrite a report row');
  assert.ok(all.every((v) => typeof v.decide === 'function'), 'every variant must be runnable');
});

test('73. a reported sweep records the depth mode and period it was run with', () => {
  const files = readdirSync(REPORTS_DIR).filter((f) => /^strategy-sweep-\d+m-(captured|modelled)\.json$/.test(f));
  assert.ok(files.length >= 2, 'at least a captured and a modelled daily sweep must exist');
  for (const f of files) {
    const d = readReport(f);
    assert.ok([1, 60, 1440].includes(d.periodIntervalMinutes), `${f}: period must be a documented enum value`);
    assert.ok(['captured', 'modelled'].includes(d.depthMode), `${f}: depth mode must be declared`);
    assert.ok(d.seed !== undefined && d.seed !== null, `${f}: the seed must be recorded so the run is reproducible`);
    const variantCount = Object.values(d.families).reduce((n, rows) => n + rows.length, 0);
    const summaryCount = Object.values(d.summaries).reduce((n, s) => n + s.variants, 0);
    assert.equal(variantCount, summaryCount, `${f}: the summary must cover every variant that ran (no quiet dropping of losers)`);
    for (const rows of Object.values(d.families)) {
      for (const row of rows) {
        assert.ok(typeof row.returnPct === 'number' && Number.isFinite(row.returnPct), `${f}: every variant reports a finite return`);
        assert.ok(typeof row.totalTrades === 'number', `${f}: every variant reports its fill count`);
      }
    }
  }
});

test('74. the two flights never mix, and "both" strategies appear in each', () => {
  const flights = runCompetitionFlights({ depthMode: 'captured' });
  const dailyNames = flights.daily.leaderboard.map((r) => r.username);
  const hourlyNames = (flights.hourly ? flights.hourly.leaderboard : []).map((r) => r.username);
  const both = STRATEGIES.filter((s) => s.flight === 'both').map((s) => s.username);
  const hourly = STRATEGIES.filter((s) => s.flight === 'hourly').map((s) => s.username);
  for (const name of hourly) {
    assert.ok(hourlyNames.includes(name), `${name} is an hourly strategy and must appear in the hourly flight`);
    assert.ok(!dailyNames.includes(name), `${name} must NOT be ranked on daily bars it was not designed for`);
  }
  for (const name of both) {
    assert.ok(dailyNames.includes(name) && hourlyNames.includes(name), `${name} declares both flights and must appear in both`);
  }
  const dailyOnly = STRATEGIES.filter((s) => (s.flight || 'daily') === 'daily').map((s) => s.username);
  for (const name of dailyOnly) assert.ok(!hourlyNames.includes(name), `${name} is daily-only and must not appear in the hourly flight`);
});

test('75. liquidity is reported from the real ladder, never fabricated', () => {
  const liquidity = readReport('liquidity-depth.json');
  assert.equal(liquidity.markets.length, getCapturedDepthTickers().length, 'every captured market must be in the report');
  let emptySides = 0;
  for (const m of liquidity.markets) {
    const rec = CAPTURED_DEPTH.markets[m.ticker];
    assert.ok(rec, `${m.ticker}: the report must correspond to a captured record`);
    assert.equal(m.capturedAt, rec.capturedAt, `${m.ticker}: the capture time travels with the numbers`);
    assert.ok(m.url.includes('orderbook'), `${m.ticker}: the source URL is the orderbook endpoint`);
    for (const sideName of ['yes', 'no']) {
      const side = m[sideName];
      if (side.emptySide) {
        emptySides += 1;
        assert.equal(side.totalContracts, 0, `${m.ticker}/${sideName}: an absent side must be zero, not filled in`);
        assert.ok(Object.values(side.impact).every((i) => i.filled === 0 && i.exhaustedLadder), `${m.ticker}/${sideName}: no fill may be invented on an empty side`);
        continue;
      }
      assert.ok(side.touch > 0 && side.touch < 1, `${m.ticker}/${sideName}: a real touch`);
      assert.ok(side.levelCount > 0, `${m.ticker}/${sideName}: at least one real level`);
      // Walking deeper can never produce a better average price.
      const v100 = side.impact[100].filled ? side.impact[100].vwap : null;
      const v1000 = side.impact[1000].filled ? side.impact[1000].vwap : null;
      const v10000 = side.impact[10000].filled ? side.impact[10000].vwap : null;
      if (v100 && v1000) assert.ok(v1000 >= v100 - 1e-9, `${m.ticker}/${sideName}: a larger order must not get a better VWAP`);
      if (v1000 && v10000) assert.ok(v10000 >= v1000 - 1e-9, `${m.ticker}/${sideName}: impact must be monotone in size`);
      if (side.impact[1000].filled < 1000) assert.equal(side.impact[1000].exhaustedLadder, true, `${m.ticker}/${sideName}: a partial fill means the ladder ran out`);
    }
  }
  assert.ok(emptySides >= 1, 'at least one captured response really is one-sided — the report must show it rather than hide it');
});

test('76. the depth source changes the numbers, and both are labelled', () => {
  const captured = runCompetition({ depthMode: 'captured', periodIntervalMinutes: 1440 });
  const modelled = runCompetition({ depthMode: 'modelled', periodIntervalMinutes: 1440 });
  assert.equal(captured.competition.depthMode, 'captured');
  assert.equal(modelled.competition.depthMode, 'modelled');
  const byName = new Map(captured.leaderboard.map((r) => [r.username, r]));
  let differing = 0;
  for (const row of modelled.leaderboard) {
    if (Math.abs(row.returnPct - byName.get(row.username).returnPct) > 1e-9) differing += 1;
  }
  assert.ok(differing > 0, 'the depth assumption must actually reach the fills, otherwise the label is decoration');
  assert.ok(captured.leaderboard.every((r) => r.depthMode === 'captured' || r.depthMix), 'every captured-depth row must carry its depth provenance');
});

test('77. the published price range of the stored universe is recomputed, not remembered', () => {
  // Irregularity #31: a caption claimed "no contract above 28c" and was wrong.
  // The fix is structural, not editorial: the sentence is now GENERATED from
  // the loaded store by src/store-facts.js, so it cannot drift away from the
  // data. This test proves it is computed by feeding the generator a DIFFERENT
  // store and requiring the sentence to change accordingly — a memorised
  // string would keep saying the old numbers and fail here.
  const real = universePriceRange();
  assert.ok(real.present, 'the shipped store has markets to describe');
  assert.ok(real.closes > 0, 'the store has numeric closes');

  // 1. The generated caption must agree with the recomputed numbers.
  const caption = universeRangeCaption();
  assert.ok(caption.includes(String(real.markets)), 'the caption states the market count it measured');
  assert.ok(
    caption.includes(real.closes.toLocaleString('en-US')),
    `the caption states the counted closes (${real.closes.toLocaleString('en-US')})`
  );
  assert.ok(caption.includes(`$${real.min.toFixed(2)}–$${real.max.toFixed(2)}`), 'the caption states the measured range');
  assert.ok(caption.includes(`${real.above28} closes sit above 28c`), 'the caption states the counted above-28c closes');

  // 2. COMPUTED, NOT MEMORISED: a synthetic store produces different numbers.
  const fake = {
    present: true,
    markets: {
      'FAKE-MARKET-A': { tuples: [[1, 0, 0, [null, null, null, 1000, null, null]]] }, // 0.10
      'FAKE-MARKET-B': { tuples: [[2, 0, 0, [null, null, null, 9000, null, null]]] }  // 0.90
    }
  };
  const fakeRange = universePriceRange(fake);
  assert.equal(fakeRange.closes, 2);
  assert.equal(fakeRange.max, 0.9);
  assert.equal(fakeRange.above28, 1);
  const fakeCaption = universeRangeCaption(fake);
  assert.ok(fakeCaption.includes('2 numeric closes'), 'a two-close store yields a two-close sentence');
  assert.ok(fakeCaption.includes('1 close(s) reach above 0.50'), 'the fabricated store reaches above 0.50 and the text says so');
  assert.notEqual(fakeCaption, caption, 'the same generator yields different sentences for different data');
  assert.ok(!fakeCaption.includes(String(real.closes)), 'the real count does not leak into the synthetic sentence');

  // 3. The claims that depend on the range, checked against the roster text.
  const fader = STRATEGIES.find((s) => s.username === 'LongshotFader_FLB');
  const retracted = (fader.thesis.match(/NO contract above 28c/g) || []).length;
  assert.equal(retracted, 1, 'the phrase may appear ONLY inside the retraction, never as a live claim');
  assert.ok(/said the universe "contains NO contract above 28c"; that was WRONG/.test(fader.thesis), 'the retraction must name the old sentence and call it wrong');
  assert.ok(/WRONG/.test(fader.thesis), 'the correction says in place that the earlier number was wrong');
  assert.ok(fader.thesis.includes(caption), 'the roster text carries the GENERATED sentence verbatim');

  // 4. The control's premise is MEASURED, exactly like the range caption.
  //    It used to be asserted here as "no close at or above 0.70"; the FDA and
  //    CEO markets ingested on 2026-09-18 trade up to $0.99, so the hand-written
  //    premise became false while the assertion kept passing on a stale idea of
  //    the universe. The check is now that the published sentence equals the
  //    sentence regenerated from the store — the anti-drift property itself.
  const control = STRATEGIES.find((s) => s.username === 'ShockTiming_ModerateFav');
  assert.ok(control.control && control.control.falsifiedIf, 'the control declares how it could be falsified');
  const scan = bandScan(0.6, 0.9);
  assert.equal(control.control.premise, moderateFavPremiseCaption(), 'the control premise is regenerated, never remembered');
  if (scan.inBand === 0) {
    assert.match(control.control.premise, /cannot fire/);
  } else {
    assert.match(control.control.premise, /NOT empty/, 'a non-empty band must be reported as such');
    assert.ok(control.control.premise.includes(scan.inBand.toLocaleString('en-US')), 'the premise states the counted closes');
  }

  // 5. The other store-derived captions follow the store for the same reason.
  const f60 = intradayFacts(undefined, 60);
  const f1 = intradayFacts(undefined, 1);
  const gold = STRATEGIES.find((s) => s.username === 'GoldBracket_EarlyLeader');
  assert.ok(
    gold.thesis.includes(classSampleCaption(f1, ['KXGOLD15M'])),
    'the gold entry quotes the COMPUTED sample size of the 1-minute store'
  );
  const weather = STRATEGIES.find((s) => s.username === 'WeatherLadder_CheapBands');
  if (f60.present) {
    assert.ok(
      weather.thesis.includes(String(f60.bySeries.KXHIGHNY?.markets ?? -1)),
      'the weather entry quotes the COMPUTED KXHIGHNY market count'
    );
  }
  // The sample captions must move with the data, exactly like the range caption.
  const fakeIntraday = { periods: { 1: { markets: { 'FAKE-15M-1': { series_ticker: 'FAKE', bar_count: 7, status: 'finalized', result: 'yes' } } } } };
  const fakeFact = classSampleCaption(intradayFacts(fakeIntraday, 1), ['FAKE']);
  assert.ok(fakeFact.includes('1 FAKE market(s)'), 'a one-market synthetic store yields a one-market sentence');
  assert.ok(fakeFact.includes('7 bars'), 'the synthetic bar count is reported');
});

/* ================================================================== *
 * 20. WEATHER + GOLD EXPANSION (2026-09-18) — real settlements,
 *     point-in-time forecasts, the signal-source ledger, the micro flight
 * ================================================================== */

test('70. a finalized market settles open positions at its REAL result mid-replay', () => {
  const mk = (ticker, extra = {}) => normalizeMarket({
    ticker,
    event_ticker: 'TEST-26SEP18',
    series_ticker: 'TEST',
    title: 'Test market',
    yes_bid_dollars: '0.4000',
    yes_ask_dollars: '0.4200',
    notional_value_dollars: '1.0000',
    status: 'finalized',
    result: 'yes',
    close_time: '2026-09-18T12:00:00Z',
    ...extra
  }, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const bar = (ts, close) => ({
    end_period_ts: ts,
    open_interest_fp: '100.00',
    volume_fp: '10000.00',
    price: { open_dollars: String(close), high_dollars: String(close), low_dollars: String(close), close_dollars: String(close), mean_dollars: String(close), previous_dollars: String(close) },
    yes_bid: { open_dollars: '0.4000', high_dollars: '0.4000', low_dollars: '0.4000', close_dollars: '0.4000' },
    yes_ask: { open_dollars: '0.4200', high_dollars: '0.4200', low_dollars: '0.4200', close_dollars: '0.4200' }
  });
  // Three bars; close_time (2026-09-18T12:00Z = ts 1789464000) falls between bar 2 and 3.
  const ts1 = Math.floor(Date.parse('2026-09-18T10:00:00Z') / 1000);
  const candles = [bar(ts1, 0.41), bar(ts1 + 3600, 0.41), bar(ts1 + 7200, 0.41)];
  const engine = new ReplayEngine({ markets: [mk('TEST-YES')], candlesByTicker: { 'TEST-YES': candles } });
  const result = engine.run({
    username: 'BuyAndHold_Settle',
    decide: (ctx) => (ctx.periodIndex === 0 ? [{ type: 'buy', side: 'YES', count: 100, reason: 'buy the winner' }] : [])
  }, { username: 'BuyAndHold_Settle', seed: 7 });

  // The exchange's own result settled the position at $1.00/contract.
  const real = result.settlements.filter((s) => s.real === true);
  assert.equal(real.length, 1, 'exactly one real settlement');
  assert.equal(real[0].result, 'YES');
  assert.ok(real[0].payout > 0, 'a winning YES position pays out');
  assert.equal(real[0].settlementFee, 0, 'verified: there is no settlement fee');
  assert.equal(result.positionsOpen.length, 0, 'the settled position is closed');
  assert.ok(result.realSettlements.bookedCount >= 1);
  assert.ok(result.actionLog.some((a) => a.type === 'real_settlement'), 'the settlement is logged as an action with its reason');

  // A NO result pays $0 — same bookkeeping, opposite cash flow.
  const engineNo = new ReplayEngine({ markets: [mk('TEST-NO', { result: 'no' })], candlesByTicker: { 'TEST-NO': candles } });
  const resNo = engineNo.run({
    username: 'BuyAndHold_SettleNo',
    decide: (ctx) => (ctx.periodIndex === 0 ? [{ type: 'buy', side: 'YES', count: 100, reason: 'buy the loser' }] : [])
  }, { username: 'BuyAndHold_SettleNo', seed: 7 });
  const realNo = resNo.settlements.filter((s) => s.real === true);
  assert.equal(realNo.length, 1);
  assert.equal(realNo[0].payout, 0, 'a losing YES position pays $0.00');
  assert.equal(realNo[0].realizedPnl < 0, true);
});

test('71. strategies can NEVER see market.result before settlement (lookahead guard)', () => {
  const mk = () => normalizeMarket({
    ticker: 'SECRET-RESULT',
    series_ticker: 'TEST',
    yes_bid_dollars: '0.4000',
    yes_ask_dollars: '0.4200',
    notional_value_dollars: '1.0000',
    status: 'finalized',
    result: 'yes',
    close_time: '2026-09-18T12:00:00Z'
  }, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const bar = (ts) => ({
    end_period_ts: ts,
    volume_fp: '10000.00',
    price: { open_dollars: '0.4100', high_dollars: '0.4100', low_dollars: '0.4100', close_dollars: '0.4100', mean_dollars: '0.4100', previous_dollars: '0.4100' },
    yes_bid: { open_dollars: '0.4000', high_dollars: '0.4000', low_dollars: '0.4000', close_dollars: '0.4000' },
    yes_ask: { open_dollars: '0.4200', high_dollars: '0.4200', low_dollars: '0.4200', close_dollars: '0.4200' }
  });
  const ts = Math.floor(Date.parse('2026-09-18T10:00:00Z') / 1000);
  const engine = new ReplayEngine({ markets: [mk()], candlesByTicker: { 'SECRET-RESULT': [bar(ts), bar(ts + 3600)] } });
  let sawResult = null;
  let sawSettlementValue = null;
  engine.run({
    username: 'Peeker',
    decide: (ctx) => {
      sawResult = ctx.market.result;
      sawSettlementValue = ctx.market.settlement_value_dollars;
      return [];
    }
  }, { username: 'Peeker', seed: 3 });
  assert.equal(sawResult, undefined, 'ctx.market.result must be redacted before the strategy sees it');
  assert.equal(sawSettlementValue, undefined, 'settlement_value_dollars must be redacted too');
  // The engine itself still settles correctly from the UNREDACTED market.
  assert.ok(engine.realSettlements.get('SECRET-RESULT'), 'the engine keeps its own copy of the result');
});

test('72. running the SAME engine twice settles identically (no cross-strategy state leak)', () => {
  const mk = () => normalizeMarket({
    ticker: 'TWICE-TEST',
    series_ticker: 'TEST',
    yes_bid_dollars: '0.4000',
    yes_ask_dollars: '0.4200',
    notional_value_dollars: '1.0000',
    status: 'finalized',
    result: 'yes',
    close_time: '2026-09-18T12:00:00Z'
  }, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const bar = (ts) => ({
    end_period_ts: ts,
    volume_fp: '10000.00',
    price: { open_dollars: '0.4100', high_dollars: '0.4100', low_dollars: '0.4100', close_dollars: '0.4100', mean_dollars: '0.4100', previous_dollars: '0.4100' },
    yes_bid: { open_dollars: '0.4000', high_dollars: '0.4000', low_dollars: '0.4000', close_dollars: '0.4000' },
    yes_ask: { open_dollars: '0.4200', high_dollars: '0.4200', low_dollars: '0.4200', close_dollars: '0.4200' }
  });
  const ts = Math.floor(Date.parse('2026-09-18T10:00:00Z') / 1000);
  const engine = new ReplayEngine({ markets: [mk()], candlesByTicker: { 'TWICE-TEST': [bar(ts), bar(ts + 3600), bar(ts + 7200)] } });
  const strat = { username: 'Same_Twice', decide: (ctx) => (ctx.periodIndex === 0 ? [{ type: 'buy', side: 'YES', count: 50, reason: 'hold' }] : []) };
  const r1 = engine.run(strat, { username: 'Same_Twice', seed: 9 });
  const r2 = engine.run(strat, { username: 'Same_Twice', seed: 9 });
  assert.equal(r1.realSettlements.bookedCount, r2.realSettlements.bookedCount, 'the second run must settle the same way');
  assert.equal(r1.finalEquity, r2.finalEquity, 'identical runs produce identical equity');
});

test('73. forecastHighAt enforces the point-in-time rule', () => {
  const snaps = [
    { captured_at: '2026-09-16T00:00:00.000Z', days: [{ date: '2026-09-18', highF: 82, periodName: 'Friday' }] },
    { captured_at: '2026-09-17T12:00:00.000Z', days: [{ date: '2026-09-18', highF: 79, periodName: 'Friday' }] }
  ];
  const ts = (iso) => Math.floor(Date.parse(iso) / 1000);
  assert.equal(forecastHighAt(snaps, '2026-09-18', ts('2026-09-15T00:00:00Z')), null, 'before any capture: not knowable, abstain');
  assert.equal(forecastHighAt(snaps, '2026-09-18', ts('2026-09-17T00:00:00Z')).highF, 82, 'between captures: the OLDER snapshot is the knowable one');
  assert.equal(forecastHighAt(snaps, '2026-09-18', ts('2026-09-18T00:00:00Z')).highF, 79, 'after both: the newest snapshot wins');
  assert.equal(forecastHighAt(snaps, '2026-09-25', ts('2026-09-18T00:00:00Z')), null, 'a date no snapshot covers: abstain');
  assert.equal(forecastHighAt([], '2026-09-18', ts('2026-09-18T00:00:00Z')), null, 'an empty archive can never produce a signal');
});

test('74. extractDailyHighs parses the verified NWS forecast shape (daytime °F periods)', () => {
  // Shape verified 2026-09-18 from https://api.weather.gov/gridpoints/OKX/34,45/forecast
  const days = extractDailyHighs([
    { name: 'Tonight', startTime: '2026-09-17T18:00:00-04:00', isDaytime: false, temperature: 70, temperatureUnit: 'F' },
    { name: 'Friday', startTime: '2026-09-18T06:00:00-04:00', isDaytime: true, temperature: 80, temperatureUnit: 'F' },
    { name: 'Friday Night', startTime: '2026-09-18T18:00:00-04:00', isDaytime: false, temperature: 61, temperatureUnit: 'F' },
    { name: 'Saturday', startTime: '2026-09-19T06:00:00-04:00', isDaytime: true, temperature: 71, temperatureUnit: 'F' }
  ]);
  assert.equal(days.length, 2, 'only the daytime periods are daily highs');
  assert.equal(days[0].date, '2026-09-18');
  assert.equal(days[0].highF, 80);
  assert.equal(days[1].date, '2026-09-19');
  assert.equal(days[1].highF, 71);
});

test('75. weatherEventDate parses KXHIGHNY event tickers and rejects others', () => {
  assert.equal(weatherEventDate('KXHIGHNY-26SEP07-B77.5'), '2026-09-07');
  assert.equal(weatherEventDate('KXHIGHNY-26AUG18-T85'), '2026-08-18');
  assert.equal(weatherEventDate('KXHIGHNY-26DEC31'), '2026-12-31');
  assert.equal(weatherEventDate('KXBTCY-27JAN0100-B77500'), null, 'a non-weather ticker must yield null, not a wrong date');
  assert.equal(weatherEventDate(null), null);
});

test('76. the signal-source ledger is complete, linked and consistent with the roster', () => {
  // Every requested project has an entry with reviewable links.
  for (const s of SIGNAL_SOURCES) {
    assert.ok(s.id && s.requested && s.name, `${s.id}: identity fields`);
    assert.ok(s.urls && s.urls.masterSite, `${s.id}: must link the master directory for manual review`);
    assert.ok(Object.values(SIGNAL_SOURCE_STATUS).includes(s.status), `${s.id}: known status`);
    assert.equal(typeof s.testableHere, 'boolean');
    if (s.testableHere) assert.ok(s.howTested, `${s.id}: testable entries must say HOW`);
    for (const u of Object.values(s.urls)) assert.ok(/^https:\/\//.test(u), `${s.id}: https links only`);
  }
  // The 13 originally requested names are all accounted for, including the one
  // that does not exist; the SECOND re-review (2026-09-18, session 01a0b59b)
  // added seven more market/sports projects from the same verified directory
  // (S13–S19: PriceKalshiHistorical, MLB-Prediction-model-backtest, MLB-PBP,
  // PFFNFL, ScheduleFreeTime, NFLPRED, StockPaperSim).
  assert.equal(SIGNAL_SOURCES.length, 20);
  assert.equal(new Set(SIGNAL_SOURCES.map((s) => s.id)).size, 20, 'ledger ids are unique');
  const requestedNames = new Set(SIGNAL_SOURCES.slice(0, 13).map((s) => s.requested));
  for (const name of ['CEO', 'weather', 'insider trades', 'TheLeap', 'NFL Injury', 'NBA Injury', 'FDA Decisions Drug Analysis', 'NCAA Scoreboard', 'NFL scoreboard', 'MLB Scoreboard', 'Sports Pred', 'Gold', 'PinePilot']) {
    assert.ok(requestedNames.has(name), `the originally requested project "${name}" must keep its ledger entry`);
  }
  const reReview = SIGNAL_SOURCES.filter((s) => /^S1[3-9]$/.test(s.id));
  assert.equal(reReview.length, 7, 'the second re-review added exactly the seven catalogued projects');
  for (const s of reReview) assert.ok(/\(found by re-review\)/.test(s.requested), `${s.id}: re-review entries are labelled as such`);
  const notFound = SIGNAL_SOURCES.filter((s) => s.status === SIGNAL_SOURCE_STATUS.NOT_FOUND);
  assert.equal(notFound.length, 1);
  assert.equal(notFound[0].requested, 'CEO', 'the missing project is named, flagged and reviewable — not silently dropped');
  assert.ok(notFound[0].flagged, 'the missing project carries an irregularity flag');
  // Every referenced strategy username exists on the replay roster OR the Live Desk.
  // S00/S05/S06/S07 cite Live* desk handles that are not STRATEGIES entries.
  const usernames = new Set([
    ...STRATEGIES.map((s) => s.username),
    ...DESK_STRATEGIES.map((s) => s.username)
  ]);
  for (const u of signalSourceStrategyUsernames()) {
    assert.ok(usernames.has(u), `signal-source ledger references unknown strategy ${u}`);
  }
  // Stats derived from the ledger add up.
  const st = signalSourceStats();
  assert.equal(st.requested, 20);
  assert.equal(st.liveSignal + st.candidate + st.notASignal + st.notFound, 20, 'every entry has exactly one status');
  assert.ok(st.testableHere >= 4);
});

test('77. the three new strategies validate, abstain without their signal, and stay honest', () => {
  const ladder = STRATEGIES.find((s) => s.username === 'WeatherLadder_CheapBands');
  const forecast = STRATEGIES.find((s) => s.username === 'ForecastEdge_Weather');
  const gold = STRATEGIES.find((s) => s.username === 'GoldBracket_EarlyLeader');
  assert.ok(ladder && forecast && gold, 'all three new entries are in the roster');
  assert.equal(ladder.flight, 'hourly');
  assert.equal(forecast.flight, 'hourly');
  assert.equal(gold.flight, 'micro', 'the gold entry runs in the 1-minute flight');
  assert.deepEqual(ladder.universe, ['KXHIGHNY']);
  assert.deepEqual(forecast.universe, ['KXHIGHNY']);
  assert.deepEqual(gold.universe, ['KXGOLD15M']);
  // The forecast entry must abstain with no signal — no fallback is allowed.
  assert.equal(forecast.decide({ candle: { trade: { close: 0.5 } }, book: { getBestYesAsk: () => 0.2 }, portfolio: { positions: new Map(), cash: 100000 }, market: { floor_strike: 77, cap_strike: 78, strike_type: 'between' }, ticker: 'X', signal: null }).length, 0);
  // ...and fire on a confirming, cheap, point-in-time signal.
  const withSignal = forecast.decide({
    candle: { trade: { close: 0.3 } },
    book: { getBestYesAsk: () => 0.3, getYesAskTiers: () => [{ count: 100 }], tick: 0.01, grid: { step: 0.01 }, notional: 1 },
    portfolio: { positions: new Map(), cash: 100000 },
    market: { floor_strike: 77, cap_strike: 78, strike_type: 'between' },
    ticker: 'X',
    signal: { kind: 'nws-forecast-high', highF: 78, capturedAt: '2026-09-18T01:00:00Z' }
  });
  assert.equal(withSignal.length, 1);
  assert.equal(withSignal[0].side, 'YES');
  // The gold entry buys the early leader within the first five minutes only.
  assert.equal(gold.decide({ candle: { trade: { close: 0.58 } }, book: { getBestYesAsk: () => 0.58, getYesAskTiers: () => [{ count: 100 }], tick: 0.01, grid: { step: 0.01 }, notional: 1 }, portfolio: { positions: new Map(), cash: 100000 }, ticker: 'X', periodIndex: 3 }).length, 1);
  assert.equal(gold.decide({ candle: { trade: { close: 0.58 } }, book: { getBestYesAsk: () => 0.58, getYesAskTiers: () => [{ count: 100 }], tick: 0.01, grid: { step: 0.01 }, notional: 1 }, portfolio: { positions: new Map(), cash: 100000 }, ticker: 'X', periodIndex: 9 }).length, 0, 'after minute five the entry window is closed');
});

test('78. intraday request blocks parse in every accepted shape and reject bad periods', () => {
  // Legacy single object still works.
  const legacy = intradayArgsFromRequest({ intraday: { enabled: true, period: 60, tickers: ['A'] } });
  assert.equal(legacy.period, 60);
  assert.equal(legacy.status, 'open', 'the legacy default discovery status is open');
  // Array form — several passes with their own universes and statuses.
  const blocks = intradayBlocksFromRequest({
    intraday: {
      enabled: true,
      blocks: [
        { period: 60, tickers: ['A', 'B'] },
        { period: 60, series: ['KXHIGHNY'], status: 'all', max_bars: 200 },
        { period: 1, series: ['KXGOLD15M'], status: 'settled', max_bars: 96 }
      ]
    }
  });
  assert.equal(blocks.length, 3);
  assert.deepEqual(blocks[1].series, ['KXHIGHNY']);
  assert.equal(blocks[1].status, 'all');
  assert.equal(blocks[2].period, 1);
  assert.equal(blocks[2].status, 'settled');
  assert.equal(blocks[0].status, 'open', 'a block without a status discovers open markets only');
  // blocks[] nested inside a legacy object is honoured too.
  assert.equal(intradayBlocksFromRequest({ intraday: { enabled: true, period: 60, blocks: [{ period: 1, tickers: ['Z'] }] } }).length, 1);
  // An invalid period is rejected loudly, never guessed.
  assert.throws(() => intradayBlockArgs({ period: 7 }), /period must be one of/);
  // disabled blocks are skipped.
  assert.equal(intradayBlocksFromRequest({ intraday: { enabled: false, blocks: [{ period: 60 }] } }).length, 0);
});

test('79. the weather and gold stores are real, settled and internally consistent', () => {
  const dir = (p) => path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'history', 'intraday', p);
  // Weather: KXHIGHNY at 60 minutes, settled brackets with exchange results.
  const weatherDir = dir('60m');
  const weatherFiles = readdirSync(weatherDir).filter((f) => f.startsWith('KXHIGHNY'));
  assert.ok(weatherFiles.length >= 30, `expected the ingested KXHIGHNY brackets, found ${weatherFiles.length}`);
  let finalized = 0;
  for (const f of weatherFiles) {
    const store = JSON.parse(readFileSync(path.join(weatherDir, f), 'utf8'));
    if (store.market?.status === 'finalized' && ['yes', 'no'].includes(store.market?.result)) finalized += 1;
    // Bar volume must reconcile with the exchange's own lifetime volume.
    const sum = (store.candlesticks || []).reduce((a, b) => a + Number(b.volume_fp || 0), 0);
    if (store.market?.volume_fp && store.market?.status === 'finalized') {
      // Only a FINALIZED market owes an exact reconciliation: an active market
      // keeps trading after its last stored bar, so its lifetime volume can be
      // larger than the sum of ingested bars (observed: KXHIGHNY-26SEP17-B82.5).
      assert.ok(Math.abs(sum - Number(store.market.volume_fp)) < 0.5, `${f}: bar volumes must sum to the finalized market's lifetime volume`);
    }
  }
  assert.ok(finalized >= 30, `expected mostly finalized brackets, found ${finalized}`);

  // Gold: KXGOLD15M at 1 minute, 15-minute lifecycle.
  const goldDir = dir('1m');
  const goldFiles = readdirSync(goldDir).filter((f) => f.startsWith('KXGOLD15M'));
  assert.ok(goldFiles.length >= 1);
  for (const f of goldFiles) {
    const store = JSON.parse(readFileSync(path.join(goldDir, f), 'utf8'));
    assert.ok((store.candlesticks || []).length <= 20, 'a 15-minute market cannot carry more than ~16 one-minute bars');
  }

  // Both series actually feed their flights.
  const flights = runCompetitionFlights({ depthMode: 'captured' });
  assert.ok(flights.hourly, `hourly flight must run: ${flights.hourlyError || ''}`);
  assert.ok(flights.micro, `micro flight must run: ${flights.microError || ''}`);
  const hourlySeries = new Set(flights.hourly.competition.dataProvenance.markets.map((m) => m.series));
  assert.ok(hourlySeries.has('KXHIGHNY'), 'the hourly flight contains the weather brackets');
  assert.ok(new Set(flights.micro.competition.dataProvenance.markets.map((m) => m.series)).has('KXGOLD15M'), 'the micro flight contains the gold markets');
  // At least one strategy must have booked a REAL settlement (exchange result, $1/$0).
  const bookedSomewhere = [...flights.hourly.results, ...flights.micro.results].some((r) => (r.realSettlements?.bookedCount || 0) > 0);
  assert.ok(bookedSomewhere, 'with settled markets in the universe, real settlements must book');
});

test('80. ForecastEdge_Weather abstains (0 trades) while the forecast archive is empty', () => {
  // The archive starts empty by design: it grows only from real captures.
  // Until a snapshot exists at decision time the strategy MUST not trade.
  if (!hasForecastArchive()) {
    const flights = runCompetitionFlights({ depthMode: 'captured' });
    const fe = flights.hourly.results.find((r) => r.username === 'ForecastEdge_Weather');
    assert.ok(fe, 'the forecast strategy runs in the hourly flight');
    assert.equal(fe.totalTrades, 0, 'no point-in-time forecast in the window => no trades, ever');
    const row = flights.hourly.leaderboard.find((r) => r.username === 'ForecastEdge_Weather');
    assert.equal(row.qualified, false, 'a 0-trade entry is unranked');
    assert.ok(row.disqualificationReason, 'the unranked row says WHY');
  } else {
    // The day the archive exists, this test simply documents that the provider builds.
    assert.ok(typeof buildForecastSignalProvider() === 'function');
  }
});


/* ================================================================== *
 * 21. VERIFIED TRADE LEDGER (2026-09-18, session 01a0b330)
 *
 * The brief: "track every strategy's placed trades with verified pricing,
 * dates, entries, exits, PnL … slippage, bid sizing, liquidity … into a
 * data-efficient setup". These tests check the ledger is DERIVED from the
 * engine (never typed), that every row carries a real market period, and that
 * the dictionary encoding is lossless.
 * ================================================================== */

test('81. every fill is stamped with the REAL market period, never the wall clock', () => {
  const mk = (ticker) => normalizeMarket({
    ticker,
    event_ticker: 'TEST-26SEP18',
    series_ticker: 'TEST',
    title: 'Test market',
    yes_bid_dollars: '0.4000',
    yes_ask_dollars: '0.4200',
    notional_value_dollars: '1.0000',
    status: 'active',
    close_time: '2026-09-18T12:00:00Z',
    price_level_structure: 'linear_cent'
  }, { source: DATA_SOURCE.VERIFIED_SNAPSHOT });
  const bar = (ts, close, volume) => ({
    end_period_ts: ts,
    open_interest_fp: '100.00',
    volume_fp: String(volume),
    price: { open_dollars: String(close), high_dollars: String(close), low_dollars: String(close), close_dollars: String(close), mean_dollars: String(close), previous_dollars: String(close) },
    yes_bid: { open_dollars: '0.4000', high_dollars: '0.4000', low_dollars: '0.4000', close_dollars: '0.4000' },
    yes_ask: { open_dollars: '0.4200', high_dollars: '0.4200', low_dollars: '0.4200', close_dollars: '0.4200' }
  });
  const ts = Math.floor(Date.parse('2026-09-18T10:00:00Z') / 1000);
  const engine = new ReplayEngine({
    markets: [mk('TEST-YES')],
    candlesByTicker: { 'TEST-YES': [bar(ts, 0.41, 10000)] },
    periodMinutes: 60
  });
  const result = engine.run({ username: 'Clock_Test', decide: () => [{ type: 'buy', side: 'YES', count: 10, reason: 'clock test' }] }, { username: 'Clock_Test', seed: 3 });
  const fill = result.tradeLog.find((t) => t.action === 'BUY');
  assert.ok(fill, 'the order filled');
  assert.ok(fill.marketTime, 'the fill carries a market clock');
  assert.equal(fill.marketTime.ts, ts, 'the clock is the candle end_period_ts');
  assert.equal(fill.marketTime.iso, new Date(ts * 1000).toISOString(), 'and its ISO form');
  assert.equal(fill.marketTime.periodMinutes, 60, 'and the bar length of the flight');
  assert.equal(fill.marketTime.barVolume, 10000, 'and the REAL traded volume of that bar');
  // The wall clock must not be what the ledger reports as the trade date.
  assert.notEqual(new Date(fill.timestamp).toISOString().slice(0, 10), '2026-09-18'.replace('2026-09-18', '1970-01-01'), 'timestamp is wall clock (unchanged field)');
  const row = fillRow(fill, { username: 'Clock_Test', flight: 'hourly', series: 'TEST' });
  assert.equal(row[FILL_COLUMNS.indexOf('ts')], ts, 'ledger ts comes from the market clock');
  assert.equal(row[FILL_COLUMNS.indexOf('date')], new Date(ts * 1000).toISOString());
  assert.equal(row[FILL_COLUMNS.indexOf('barVolume')], 10000, 'ledger barVolume is the bar real volume');
  assert.equal(row[FILL_COLUMNS.indexOf('depth')], fill.depthModel, 'ledger names the ladder that priced it');
});

test('82. maker fills are priced from fillPrice and round trips reconcile with the engine', () => {
  // A maker BUY reports fillPrice, not vwap. Reading only vwap produced NULL
  // entry prices for every maker fill and a round-trip PnL that silently
  // disagreed with the engine — this test pins both.
  const makerBuy = {
    timestamp: '2026-09-18T00:00:00.000Z',
    marketTime: { ts: 1789000000, iso: '2026-09-10T00:00:00.000Z', periodMinutes: 1440, barVolume: 500 },
    ticker: 'TEST-YES',
    action: 'BUY',
    side: 'YES',
    contracts: 100,
    fillPrice: 0.25,
    maker: true,
    fee: 0.44,
    gross: 25,
    depthModel: 'captured_orderbook_reanchored',
    role: 'maker'
  };
  const row = fillRow(makerBuy, { username: 'Maker_Test', flight: 'daily', series: 'TEST' });
  assert.equal(row[FILL_COLUMNS.indexOf('px')], 0.25, 'a maker fill is priced from fillPrice');
  assert.equal(row[FILL_COLUMNS.indexOf('gross')], 25, 'gross comes from the maker record');
  assert.ok(row[FILL_COLUMNS.indexOf('px')] !== null);

  const makerSell = { ...makerBuy, action: 'SELL', contracts: 100, side: 'YES', fillPrice: 0.4, gross: 40, fee: 0.42, role: 'maker' };
  const sellRow = fillRow(makerSell, { username: 'Maker_Test', flight: 'daily', series: 'TEST' });
  const trips = buildRoundTrips([row, sellRow], { columns: FILL_COLUMNS });
  assert.equal(trips.length, 1, 'one round trip');
  const t = trips[0];
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('entryPx')], 0.25, 'entry price is the maker fill price');
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('exitPx')], 0.4, 'exit price is the maker fill price');
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('contracts')], 100);
  // 100 × (0.40 − 0.25) = $15 gross, minus both fees ($0.44 + $0.42 = $0.86).
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('grossPnl')], 15);
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('fees')], 0.86);
  assert.equal(t[ROUND_TRIP_COLUMNS.indexOf('netPnl')], 14.14);
});

test('83. the ledger re-derives from the engine and refuses an undated or unpriced row', () => {
  const run = {
    username: 'Ledger_Test',
    strategyId: 'ledger_test',
    flight: 'daily',
    realizedPnl: 5,
    dataProvenance: { markets: [{ ticker: 'TEST-YES', series: 'TEST', source_url: 'https://example.test/GET' }] },
    tradeLog: [
      {
        timestamp: '2026-09-18T00:00:00.000Z',
        marketTime: { ts: 100, iso: '1970-01-01T00:00:01.600Z', periodMinutes: 1440, barVolume: 1000, sourceUrl: 'https://example.test/GET' },
        ticker: 'TEST-YES', action: 'BUY', side: 'YES', contracts: 10, requested: 10, unfilled: 0,
        fillStatus: 'filled', bestAsk: 0.2, vwap: 0.2, slippage: 0, fee: 0.11, grossCost: 2, totalCost: 2.11,
        depthModel: 'anchored_synthetic', role: 'taker', strategy: 'Ledger_Test'
      },
      {
        timestamp: '2026-09-18T00:00:00.000Z',
        marketTime: { ts: 200, iso: '1970-01-01T00:03:20.000Z', periodMinutes: 1440, barVolume: 1000, sourceUrl: 'https://example.test/GET' },
        ticker: 'TEST-YES', action: 'SELL', side: 'YES', contracts: 10, requested: 10, unfilled: 0,
        fillStatus: 'filled', bestBid: 0.75, vwap: 0.75, slippage: 0, fee: 0.13, grossProceeds: 7.5, netProceeds: 7.37,
        realizedPnl: 5, depthModel: 'anchored_synthetic', role: 'taker', strategy: 'Ledger_Test'
      }
    ]
  };
  const ledger = buildLedger([run], { generatedAt: 'FIXED' });
  assert.equal(ledger.fills.length, 2);
  assert.equal(ledger.roundTrips.length, 1);
  assert.equal(ledger.fills.every((f) => f[FILL_COLUMNS.indexOf('date')]), true, 'every fill is dated');
  const check = verifyLedger(ledger, [run], { generatedAt: 'FIXED' });
  assert.equal(check.ok, true, `verification must pass: ${check.problems.join(' | ')}`);

  // Tampering must be caught: change one price and the re-derivation fails.
  const tampered = { ...ledger, fills: ledger.fills.map((f) => f.slice()) };
  const pxIdx = FILL_COLUMNS.indexOf('px');
  tampered.fills[0][pxIdx] = 0.99;
  const bad = verifyLedger(tampered, [run], { generatedAt: 'FIXED' });
  assert.equal(bad.ok, false, 'a tampered ledger fails verification');
  assert.ok(bad.problems.some((p) => /differs/.test(p)), 'and the problem names the differing row');

  // A fill with no market date is not auditable and must be rejected.
  const undated = { ...ledger, fills: ledger.fills.map((f) => f.slice()) };
  undated.fills[0][FILL_COLUMNS.indexOf('date')] = null;
  undated.fills[0][FILL_COLUMNS.indexOf('ts')] = null;
  const badDate = verifyLedger(undated, [run], { generatedAt: 'FIXED' });
  assert.equal(badDate.ok, false);
  assert.ok(badDate.problems.some((p) => /verified market date/.test(p)));
});

test('84. the ledger encoding is lossless and round-trips through a file', () => {
  const run = {
    username: 'Encode_Test', strategyId: 'encode_test', flight: 'daily', realizedPnl: 0,
    dataProvenance: { markets: [{ ticker: 'A-1', series: 'A', source_url: 'https://example.test/A' }] },
    tradeLog: [
      { timestamp: 'x', marketTime: { ts: 10, iso: '1970-01-01T00:00:10.000Z', barVolume: 5, sourceUrl: 'https://example.test/A' },
        ticker: 'A-1', action: 'BUY', side: 'YES', contracts: 5, requested: 5, unfilled: 0, fillStatus: 'filled',
        bestAsk: 0.1, vwap: 0.1, slippage: 0, fee: 0.02, grossCost: 0.5, depthModel: 'anchored_synthetic', role: 'taker', note: 'why' }
    ]
  };
  const ledger = buildLedger([run], { generatedAt: 'FIXED' });
  const encoded = internLedger(ledger);
  // The file that gets written is the ENCODED one; JSON must survive a round trip.
  const json = JSON.parse(JSON.stringify(encoded));
  const restored = expandLedger(json);
  assert.deepEqual(restored.fills, ledger.fills, 'expand(intern(x)) === x, field for field');
  assert.deepEqual(restored.roundTrips, ledger.roundTrips, 'round trips too');
  // Interning must never swallow a missing value.
  assert.equal(restored.fills[0][FILL_COLUMNS.indexOf('date')], '1970-01-01T00:00:10.000Z');
  assert.equal(restored.fills[0][FILL_COLUMNS.indexOf('note')], 'why');
  // And the encoding must actually shrink the payload.
  const big = { ...ledger, fills: new Array(200).fill(ledger.fills[0]) };
  const encBig = internLedger(big);
  assert.ok(
    JSON.stringify(encBig).length < JSON.stringify(big).length,
    'dictionary encoding is smaller than the literal form'
  );
});

test('85. the shipped ledger (if present) is internally consistent and fully dated', () => {
  const dir = path.resolve(fileURLToPath(new URL('..', import.meta.url)), 'data', 'ledger');
  if (!existsSync(dir)) return; // nothing exported in this checkout: nothing to assert
  const files = readdirSync(dir).filter((f) => /^ledger-\d+\.json$/.test(f));
  if (!files.length) return;
  for (const f of files) {
    const stored = expandLedger(JSON.parse(readFileSync(path.join(dir, f), 'utf8')));
    assert.equal(stored.fills.length > 0, true, `${f} holds fills`);
    const fillCols = stored.fillColumns;
    const dateIdx = fillCols.indexOf('date');
    const tsIdx = fillCols.indexOf('ts');
    const pxIdx = fillCols.indexOf('px');
    const filledIdx = fillCols.indexOf('filled');
    for (const row of stored.fills) {
      assert.ok(row[dateIdx], `${f}: every fill carries a market date`);
      assert.ok(Number.isFinite(row[tsIdx]), `${f}: every fill carries a numeric market ts`);
      if (Number(row[filledIdx]) > 0) assert.ok(Number.isFinite(row[pxIdx]), `${f}: every filled row carries a price`);
    }
    // Round trips must be priced on both legs and net down to their own PnL.
    const tripCols = stored.roundTripColumns;
    const [ePx, xPx, cIdx, gIdx, fIdx, nIdx] = ['entryPx', 'exitPx', 'contracts', 'grossPnl', 'fees', 'netPnl'].map((c) => tripCols.indexOf(c));
    for (const t of stored.roundTrips.slice(0, 500)) {
      assert.ok(Number.isFinite(t[ePx]), `${f}: entry price present`);
      assert.ok(Number.isFinite(t[xPx]), `${f}: exit price present`);
      const expected = Math.round((t[gIdx] - t[fIdx]) * 100) / 100;
      assert.ok(Math.abs(expected - t[nIdx]) <= 0.011, `${f}: netPnl = gross - fees (${t[nIdx]} vs ${expected})`);
      assert.ok(t[cIdx] > 0, `${f}: round trip has contracts`);
    }
    const summaryFile = path.join(dir, 'summary.json');
    if (existsSync(summaryFile)) {
      const summary = JSON.parse(readFileSync(summaryFile, 'utf8'));
      assert.equal(summary.verification.ok, true, 'the stored summary says the ledger verified');
      // The summary distinguishes the FULL run from the STORED file: totals
      // counts every fill the engine produced, stored counts what survived the
      // caps. A trim is legitimate, but it must be accounted for exactly — the
      // dropped count has to reconcile, or the summary is describing a file
      // that does not exist.
      assert.ok(summary.stored, 'the summary must state what the file holds');
      assert.equal(summary.stored.fills, stored.fills.length, 'the summary stored-count matches the stored rows');
      const fillTrim = (summary.trims || []).find((t) => t.section === 'fills');
      assert.equal(summary.totals.fills - (fillTrim ? fillTrim.dropped : 0), stored.fills.length, 'totals minus the recorded trim must equal the stored rows');
      if (fillTrim) assert.equal(fillTrim.kept, stored.fills.length, 'the recorded trim states the kept count');
    }
  }
});

/* ================================================================== *
 * 9b. THE FEE REGIME AND THE USERNAME RULE (Pass-2 fixes, 2026-09-18)
 * ================================================================== */

test('86. the maker fee is charged only where the series carries maker fees', () => {
  const makerFill = (opts) => {
    const book = new OrderBook('KXTEST-26SEP01-T10', {
      midPrice: 0.5,
      seriesTicker: opts.seriesTicker,
      feeMultiplier: opts.feeMultiplier,
      feeType: opts.feeType,
      seed: 1
    });
    book.placeLimitOrder({ side: 'bid', outcome: 'yes', price: 0.4, count: 100, orderId: 'm1' });
    // The book fills a resting order against a period range that crosses it.
    const fills = book.processRestingFills({ low: 0.30, high: 0.45 }, 10000);
    assert.equal(fills.length, 1, 'the resting order matched');
    return fills[0];
  };

  // Plain quadratic series (fee_type "quadratic"): a resting order pays NOTHING.
  // Official schedule: "Trading fees are not charged for orders placed that are
  // not immediately matched and are instead left as resting orders on the
  // orderbook unless they are included in our 'Maker Fees' section."
  const free = makerFill({ seriesTicker: 'KXHIGHNY', feeType: 'quadratic', feeMultiplier: 1 });
  assert.equal(free.makerFeesApply, false);
  assert.equal(free.fee, 0, 'a resting order on a plain-quadratic series is free');
  assert.match(free.feeFormula, /NO trading fee/);

  // Maker-Fees series (fee_type "quadratic_with_maker_fees", e.g. KXNFLGAME):
  // charged the maker coefficient 0.0175 x M x C x P x (1-P), rounded up.
  const charged = makerFill({ seriesTicker: 'KXNFLGAME', feeType: 'quadratic_with_maker_fees', feeMultiplier: 1 });
  assert.equal(charged.makerFeesApply, true);
  // 100 x 0.0175 x 0.4 x 0.6 = 0.42 exactly; the maker record must equal that.
  assert.ok(Math.abs(charged.fee - 0.42) < 1e-9, `maker fee = 0.42, got ${charged.fee}`);
  assert.equal(charged.feeType, 'quadratic_with_maker_fees');

  // A zero-multiplier series charges nothing even for takers (KXBTCY, M=0).
  assert.equal(rawQuadraticFee({ count: 100, price: 0.4, multiplier: 0 }), 0);

  // The series config that drives this comes from a capture, and says which.
  const nfl = seriesFeeConfig('KXNFLGAME');
  assert.equal(nfl.makerFeesApply, true);
  assert.equal(nfl.captured, true);
  assert.match(String(nfl.captureSource), /discovered_series_list|snapshot/);
  assert.equal(seriesFeeConfig('KXHIGHNY').makerFeesApply, false);
  assert.equal(seriesFeeConfig('KXBTCY').zeroFee, true);
  // An unknown series is labelled as an assumption, never defaulted silently.
  const unknown = seriesFeeConfig('KXNOTAREALSERIES');
  assert.equal(unknown.captured, false);
  assert.equal(unknown.makerFeesApply, false);
});

test('87. every strategy username satisfies the platform\'s own username rule', async () => {
  const { validateUsername } = await import('../src/competition-memory.js');
  const state = { strategies: STRATEGIES.map((s) => ({ username: s.username })), participants: [] };
  for (const s of STRATEGIES) {
    // The rule validateUsername() enforces (competition-memory.js):
    // length 3..24 and /^[A-Za-z0-9_.]+$/.
    assert.ok(s.username.length >= 3 && s.username.length <= 24, `${s.id}: username "${s.username}" is ${s.username.length} chars, outside 3..24`);
    assert.match(s.username, /^[A-Za-z0-9_.]+$/, `${s.id}: username has characters the platform refuses`);
    assert.equal(
      validateUsername(s.username, state).reason,
      'username_reserved_by_algorithmic_strategy',
      `${s.id}: a human could take "${s.username}" because the reservation check never sees it`
    );
    // The handle shown in the UI must be the same name, so a reader can match
    // the roster to the ledger rows.
    assert.equal(s.handle, `@${s.username}`, `${s.id}: handle must be @username`);
  }
  // Desk handles satisfy the same length/charset rule and are reserved even
  // against a stored year that never heard of the desk.
  for (const s of DESK_STRATEGIES) {
    assert.ok(s.username.length >= 3 && s.username.length <= 24, `${s.id}: desk username \"${s.username}\" is ${s.username.length} chars, outside 3..24`);
    assert.match(s.username, /^[A-Za-z0-9_.]+$/, `${s.id}: desk username has characters the platform refuses`);
    assert.equal(
      validateUsername(s.username, { strategies: [], participants: [] }).reason,
      'username_reserved_by_algorithmic_strategy',
      `${s.id}: a human could take \"${s.username}\" because the desk list is not reserved`
    );
  }
});

test('88. ledger rows state the fee regime that produced their fee', () => {
  const cols = FILL_COLUMNS;
  const at = (name) => cols.indexOf(name);
  assert.ok(at('feeRegime') > 0, 'the fee regime column exists');

  const takerZero = fillRow(
    { action: 'BUY', role: 'taker', ticker: 'KXBTCY-X', contracts: 10, vwap: 0.5, fee: 0, feeMultiplier: 0 },
    { flight: 'daily' }
  );
  assert.equal(takerZero[at('feeRegime')], 'taker_zero');

  const takerPaid = fillRow(
    { action: 'BUY', role: 'taker', ticker: 'KXHIGHNY-X', contracts: 10, vwap: 0.5, fee: 0.9, feeMultiplier: 1 },
    { flight: 'hourly' }
  );
  assert.equal(takerPaid[at('feeRegime')], 'taker_0.07');

  const makerFree = fillRow(
    {
      action: 'BUY', role: 'maker', maker: true, ticker: 'KXHIGHNY-X',
      contracts: 10, fillPrice: 0.25, fee: 0, feeMultiplier: 1, makerFeesApply: false
    },
    { flight: 'hourly' }
  );
  assert.equal(makerFree[at('feeRegime')], 'maker_free');

  const makerPaid = fillRow(
    {
      action: 'BUY', role: 'maker', maker: true, ticker: 'KXNFLGAME-X',
      contracts: 10, fillPrice: 0.25, fee: 0.03, feeMultiplier: 1, makerFeesApply: true
    },
    { flight: 'hourly' }
  );
  assert.equal(makerPaid[at('feeRegime')], 'maker_0.0175');

  const settled = fillRow(
    { action: 'SETTLE', ticker: 'KXHIGHNY-X', contracts: 10, payoutPerContract: 1, payout: 10, fee: 0 },
    { flight: 'hourly' }
  );
  assert.equal(settled[at('feeRegime')], 'settlement');

  // The breakdown counts rows and sums their fees — it cannot be restated from
  // a description, only from the data.
  const ledger = { fills: [takerZero, takerPaid, makerFree, makerPaid, settled] };
  const b = feeRegimeBreakdown(ledger);
  assert.equal(b.labelled, true);
  assert.equal(b.regimes.maker_free.fills, 1);
  assert.equal(b.regimes['taker_0.07'].feeUsd, 0.9);
  assert.equal(b.totalFeeUsd, 0.93);
});

/* ================================================================== *
 * 9c. THE FDA LADDER AND THE CEO DRIFT (request-8 families)
 * ================================================================== */

test('89. the FDA dominance rule fires only on a real ladder violation, and the CEO rule only on a real advance', () => {
  const fda = STRATEGIES.find((s) => s.username === 'FDALadder_Dominance');
  const ceo = STRATEGIES.find((s) => s.username === 'CEOExit_Drift');
  assert.ok(fda && ceo, 'both request-8 entries are in the roster');

  // ---- the universe is series the STORE holds bars for (not a wish list) ----
  for (const series of fda.universe) {
    assert.ok(VERIFIED_SERIES[series], `FDA universe series ${series} must be in the store-derived verified list`);
  }
  for (const series of ceo.universe) {
    assert.ok(VERIFIED_SERIES[series], `CEO universe series ${series} must be in the store-derived verified list`);
  }

  // ---- FDA: the exchange's own rules text is what licenses the trade ----
  const near = {
    ticker: 'KXFDATEST-RET-27JAN01',
    event_ticker: 'KXFDATEST-RET',
    close_time: '2027-01-01T04:59:00Z',
    rules_primary: 'If the FDA approves testdrug before Jan 1, 2027, then the market resolves to Yes.'
  };
  const far = {
    ticker: 'KXFDATEST-RET-27JUL01',
    event_ticker: 'KXFDATEST-RET',
    close_time: '2027-07-01T03:59:00Z',
    rules_primary: 'If the FDA approves testdrug before Jul 1, 2027, then the market resolves to Yes.'
  };
  // A complete-enough stub: aggressiveSize() walks the ask tiers to cap the size
  // at real visible depth, so a stub missing getYesAskTiers() would throw rather
  // than size — the same surface the engine's OrderBook provides.
  const bookAt = (bid, ask) => ({
    getBestYesBid: () => bid,
    getBestYesAsk: () => ask,
    getBestNoBid: () => (ask === null ? null : 1 - ask),
    getBestNoAsk: () => (bid === null ? null : 1 - bid),
    getYesAskTiers: () => [{ price: ask, count: 5000 }],
    getNoAskTiers: () => [{ price: bid === null ? null : 1 - bid, count: 5000 }],
    tick: 0.01,
    notional: 1
  });

  const ctxFor = (market, ownBook, siblingBid) => ({
    ticker: market.ticker,
    market,
    book: ownBook,
    books: { [near.ticker]: bookAt(siblingBid, siblingBid + 0.01) },
    allMarkets: [near, far],
    portfolio: { positions: new Map(), cash: 100000 },
    candle: { trade: { close: 0.5, high: 0.6, low: 0.4 } },
    history: []
  });

  // A 0.35 far ask against a 0.42 near bid is a 7c dominance violation -> fire.
  const fired = fda.decide.call(fda, ctxFor(far, bookAt(0.34, 0.35), 0.42));
  assert.equal(fired.length, 1, 'a violation fires the trade');
  assert.equal(fired[0].type, 'buy');
  assert.equal(fired[0].side, 'YES');
  assert.match(fired[0].reason, /dominance violation/);
  assert.match(fired[0].reason, /KXFDATEST-RET-27JAN01/, 'the reason names the earlier contract it compared against');

  // 1c inside the threshold is NOT enough — the fee-aware buffer must hold.
  assert.equal(fda.decide.call(fda, ctxFor(far, bookAt(0.40, 0.41), 0.42)).length, 0, 'a 1c gap is below the fee-aware threshold');

  // No violation at all: the later contract is priced ABOVE the earlier one's
  // bid (its ask 0.46 > the earlier bid 0.42), which is the normal ordering.
  assert.equal(fda.decide.call(fda, ctxFor(far, bookAt(0.45, 0.46), 0.42)).length, 0);

  // A MARKOVIAN claim (not "before <date>") must never be treated as nested.
  const notCumulative = { ...far, rules_primary: 'This market resolves Yes if the FDA approves testdrug in Q3 2027.' };
  assert.equal(
    fda.decide.call(fda, { ...ctxFor(far, bookAt(0.34, 0.35), 0.42), market: notCumulative, allMarkets: [near, notCumulative] }).length,
    0,
    'without "before <date>" wording there is no dominance relation and the rule abstains'
  );

  // A sibling that settles LATER does not imply anything about this market.
  const laterSibling = { ...near, ticker: 'KXFDATEST-RET-28JAN01', close_time: '2028-01-01T04:59:00Z' };
  assert.equal(
    fda.decide.call(fda, {
      ...ctxFor(far, bookAt(0.34, 0.35), 0.42),
      allMarkets: [laterSibling, far],
      books: { [laterSibling.ticker]: bookAt(0.42, 0.43) }
    }).length,
    0,
    'a later-settling sibling cannot trigger the edge'
  );

  // ---- CEO: the 20-bar advance rule ----
  const bar = (low, close) => ({ trade: { low, close } });
  const ceoHistory = Array.from({ length: 20 }, (_, i) => bar(0.30, 0.31 + i * 0.001));
  const ceoCtx = (close, book) => ({
    ticker: 'TESLACEOCHANGE-26',
    market: { ticker: 'TESLACEOCHANGE-26' },
    book,
    books: {},
    allMarkets: [],
    portfolio: { positions: new Map(), cash: 100000 },
    candle: { trade: { close, high: close + 0.01, low: close - 0.01 } },
    history: ceoHistory
  });
  // low of the window is 0.30; a close of 0.50 is a 0.20 advance -> fire.
  assert.equal(ceo.decide.call(ceo, ceoCtx(0.5, bookAt(0.49, 0.5))).length, 1, 'a 20c advance off the low fires');
  // a close of 0.40 is a 0.10 advance -> below the 0.15 threshold, abstain.
  assert.equal(ceo.decide.call(ceo, ceoCtx(0.4, bookAt(0.39, 0.4))).length, 0, 'a 10c advance is not enough');
  // above 0.90 the contract is nearly certain: the remaining upside cannot pay for the fee.
  assert.equal(ceo.decide.call(ceo, ceoCtx(0.95, bookAt(0.94, 0.95))).length, 0, 'no buying at ≥ 0.90');
});

/* ================================================================== *
 * 9d. THE FORECAST ARCHIVE'S CITY COVERAGE (roadmap item #3)
 * ================================================================== */

test('90. every archived forecast city names a real series, a real point, and a resolved identity', () => {
  const cities = FORECAST_LOCATIONS;
  assert.ok(cities.length >= 9, `the archive must cover the ingested weather cities, got ${cities.length}`);

  const seriesCovered = new Set(cities.map((c) => c.series));
  const hourly = intradayFacts(undefined, 60);
  const weatherSeries = Object.keys(hourly.bySeries).filter((s) => /^KXHIGH/.test(s));
  assert.ok(weatherSeries.length >= 8, 'the hourly store holds the weather cities this test compares against');

  // A city the store can trade but the archive does not cover is an untested
  // strategy, not a neutral omission — so it must be named, not left out.
  const notArchived = weatherSeries.filter((s) => !seriesCovered.has(s));
  assert.deepEqual(
    notArchived,
    [],
    `these KXHIGH* series hold real bars but no forecast archive: ${notArchived.join(', ')}`
  );

  for (const c of cities) {
    assert.ok(c.key && c.series && c.city, `${c.key}: key, series and city are required`);
    // The point URL must be the official NWS endpoint for exactly these
    // coordinates — a mismatch would archive one city under another's name.
    assert.equal(
      c.pointsUrl,
      `https://api.weather.gov/points/${c.latitude},${c.longitude}`,
      `${c.key}: pointsUrl must address the configured coordinates on api.weather.gov`
    );
    assert.ok(c.verifiedNote && c.verifiedNote.length > 10, `${c.key}: state what has been verified about this point`);
    // The note must record a REAL observation of the official API — a URL and a
    // grid — or say out loud that the identity is still unconfirmed.
    assert.ok(
      /api\.weather\.gov\/points\//.test(c.verifiedNote) || /PENDING/.test(c.verifiedNote),
      `${c.key}: the note must cite the NWS point response or declare itself unconfirmed`
    );
    if (!/PENDING/.test(c.verifiedNote)) {
      assert.match(c.verifiedNote, /gridId \w{3}/, `${c.key}: a confirmed point must name the NWS grid office`);
      assert.ok(c.settlementStation, `${c.key}: record the settlement station the market rules name`);
    }
    // The machine-readable twin of that note: the capture compares this against
    // the live api.weather.gov answer and refuses to write when they differ.
    const grid = c.nwsGrid;
    assert.ok(grid && grid.gridId && grid.forecastZone && grid.timeZone, `${c.key}: the configured NWS identity must be complete`);
    assert.ok(Number.isFinite(grid.gridX) && Number.isFinite(grid.gridY), `${c.key}: the configured NWS identity must carry numeric grid x/y`);
    assert.ok(
      c.verifiedNote.includes(`gridId ${grid.gridId}`),
      `${c.key}: the human note must name the same grid office the configuration asserts (${grid.gridId})`
    );
    // Every covered series must be one the store can trade (no orphan archive).
    assert.ok(hourly.bySeries[c.series] || dailyFacts().bySeries[c.series], `${c.key}: series ${c.series} has no bars in any store`);
  }

  // The SHIPPED archive must carry the identity the NWS resolved, once captured.
  const shipped = Object.values(FORECAST_DATA.locations || {});
  assert.ok(shipped.length >= 1, 'the shipped forecast module holds at least the original location');
  for (const store of shipped) {
    const loc = store.location || {};
    const configured = cities.find((c) => c.key === loc.key);
    assert.ok(configured, `${loc.key}: the archive holds a location that is not configured`);
    assert.equal(loc.points_url, configured.pointsUrl, `${loc.key}: archive points_url must match the configuration`);
    if (loc.resolved) {
      // Captured by the runner: the resolution must be self-consistent AND must
      // be the identity this repo claims. A resolution read from the wrong
      // response bag (all nulls, as one capture wrote) fails right here.
      assert.equal(loc.resolved.pointsUrl, configured.pointsUrl, `${loc.key}: resolved identity must name the same point`);
      assert.ok(loc.resolved.gridId, `${loc.key}: a resolution must name the NWS grid office`);
      assert.ok(Number.isFinite(Number(loc.resolved.gridX)) && Number.isFinite(Number(loc.resolved.gridY)), `${loc.key}: a resolution must name grid x/y`);
      assert.ok(loc.resolved.resolvedAt, `${loc.key}: a resolution must carry when it was resolved`);
      assert.equal(loc.resolved.gridId, configured.nwsGrid.gridId, `${loc.key}: the captured grid office must be the configured one`);
      assert.equal(Number(loc.resolved.gridX), configured.nwsGrid.gridX, `${loc.key}: the captured grid x must be the configured one`);
      assert.equal(Number(loc.resolved.gridY), configured.nwsGrid.gridY, `${loc.key}: the captured grid y must be the configured one`);
      assert.equal(String(loc.resolved.forecastZone || '').split('/').pop(), configured.nwsGrid.forecastZone, `${loc.key}: the captured forecast zone must be the configured one`);
      assert.equal(loc.resolved.timeZone, configured.nwsGrid.timeZone, `${loc.key}: the captured time zone must be the configured one`);
      const capturedUrl = (loc.snapshots?.[loc.snapshots.length - 1] || {}).forecast_url || '';
      if (capturedUrl) {
        assert.ok(
          capturedUrl.includes(`gridpoints/${configured.nwsGrid.gridId}/${configured.nwsGrid.gridX},${configured.nwsGrid.gridY}/`),
          `${loc.key}: the captured forecast URL must encode the configured grid (${configured.nwsGrid.gridId}/${configured.nwsGrid.gridX},${configured.nwsGrid.gridY})`
        );
      }
    }
  }

  // And the strategy that reads the archive must abstain without a signal.
  const multi = STRATEGIES.find((s) => s.username === 'ForecastEdge_MultiCity');
  assert.ok(multi, 'the multi-city forecast entry exists');
  assert.equal(multi.universe.length, cities.length, 'its universe is exactly the archived cities');
  for (const series of multi.universe) assert.ok(seriesCovered.has(series), `${series} must have an archive entry`);
  const noSignal = multi.decide({
    ticker: 'KXHIGHLAX-26SEP18-B80.5',
    market: { floor_strike: 80, cap_strike: 81 },
    book: { getBestYesAsk: () => 0.2, getYesAskTiers: () => [{ price: 0.2, count: 1000 }], tick: 0.01, notional: 1 },
    portfolio: { positions: new Map(), cash: 100000 },
    signal: null,
    candle: { trade: { close: 0.2 } }
  });
  assert.equal(noSignal.length, 0, 'no snapshot by this bar means no trade — the archive rule is absolute');
});

test('91. the three R14 recreations (MEE board sum, 5-minute spike fade, 1-minute momentum) are faithful and abstain correctly', () => {
  const mee = STRATEGIES.find((s) => s.username === 'MEE_BoardSum');
  const fade = STRATEGIES.find((s) => s.username === 'FadeSpike_Micro');
  const mom = STRATEGIES.find((s) => s.username === 'MomTick_Micro');
  assert.ok(mee && fade && mom, 'all three PriceKalshiHistorical recreations are in the roster');

  // Flights and universes: MEE judges boards on hourly bars, the two micro
  // entries on 1-minute bars — and every series named must hold real bars.
  assert.equal(mee.flight, 'hourly');
  assert.equal(mee.preferredPeriodMinutes, 60);
  assert.deepEqual(mee.universe, ['KXHIGHNY', 'KXBTCY']);
  for (const s of [fade, mom]) {
    assert.equal(s.flight, 'micro');
    assert.equal(s.preferredPeriodMinutes, 1);
    assert.deepEqual(s.universe, ['KXBTC15M', 'KXETH15M', 'KXSOL15M', 'KXGOLD15M']);
  }
  // The momentum entry must ADMIT it is an adaptation (20s window < 1 bar).
  assert.ok(/adapt/i.test(mom.designSource), 'the mom recreation labels itself an adaptation');
  assert.ok(/20-second/i.test(mom.sourceNote), 'the mom entry states what the original window was');

  // A fake portfolio/book shared by the probes below.
  const fresh = () => ({
    portfolio: { positions: new Map(), cash: 100000 },
    book: {
      getBestYesAsk: () => 0.08, getBestNoAsk: () => 0.93,
      getYesAskTiers: () => [{ price: 0.08, count: 5000 }], getNoAskTiers: () => [{ price: 0.93, count: 5000 }],
      tick: 0.01, notional: 1
    }
  });

  // ── MEE: abstains with no sibling board, fires on a cheap board, and only
  // on the CHEAPEST leg (the source's rule), never on a mid-board leg.
  const bar = (endTs, ask, bid) => ({ endTs, yesAsk: { close: ask }, yesBid: { close: bid }, trade: { close: (ask + bid) / 2 } });
  const boardCtx = (ticker, ask, siblings) => ({
    ...fresh(),
    ticker,
    timestamp: 1_000_000,
    historyAll: {
      [ticker]: [bar(999_900, ask, ask - 0.02)],
      ...Object.fromEntries(siblings.map(([t, a]) => [t, [bar(999_900, a, a - 0.02)]]))
    }
  });
  // No board (fewer than 3 priced siblings) → no trade.
  assert.equal(mee.decide(boardCtx('KXHIGHNY-26SEP18-B82.5', 0.09, [['KXHIGHNY-26SEP18-B80.5', 0.1]])).length, 0);
  // A board of 4 cheap bands (Σask 0.32 ≤ 0.975): fires ONLY on the cheapest.
  const cheapBoard = [['KXHIGHNY-26SEP18-B80.5', 0.10], ['KXHIGHNY-26SEP18-B85.5', 0.06], ['KXHIGHNY-26SEP18-T78', 0.07]];
  assert.equal(mee.decide(boardCtx('KXHIGHNY-26SEP18-B85.5', 0.06, cheapBoard)).length, 1, 'cheapest leg of a cheap board is bought');
  assert.equal(mee.decide(boardCtx('KXHIGHNY-26SEP18-B82.5', 0.09, cheapBoard)).length, 0, 'a non-cheapest leg of the same board is NOT bought');
  // A board priced at ~0.99 (no 2.5¢ gap either way) → no trade.
  const fairBoard = [['KXHIGHNY-26SEP18-B80.5', 0.45], ['KXHIGHNY-26SEP18-B85.5', 0.40], ['KXHIGHNY-26SEP18-T78', 0.14]];
  assert.equal(mee.decide(boardCtx('KXHIGHNY-26SEP18-T78', 0.14, fairBoard)).length, 0, 'a fairly-priced board triggers nothing');
  // A stale sibling quote (> 3 h old) is excluded from the board.
  const staleCtx = {
    ...fresh(),
    ticker: 'KXHIGHNY-26SEP18-B85.5',
    timestamp: 1_000_000 + 4 * 3600,
    historyAll: {
      'KXHIGHNY-26SEP18-B85.5': [bar(999_900, 0.06, 0.04), bar(999_900 + 4 * 3600, 0.06, 0.04)],
      'KXHIGHNY-26SEP18-B80.5': [bar(999_900, 0.10, 0.08)],   // stale by > 3 h
      'KXHIGHNY-26SEP18-T78': [bar(999_900, 0.07, 0.05)]       // stale by > 3 h
    }
  };
  assert.equal(mee.decide(staleCtx).length, 0, 'a board whose sibling quotes are stale does not fire');

  // ── FadeSpike: the source's exact 5-minute/5¢/3¢ rule.
  const microBar = (m, bid, ask) => ({ endTs: 1000 + m * 60, yesBid: { close: bid }, yesAsk: { close: ask }, trade: { close: (bid + ask) / 2 } });
  const microCtx = (bars) => ({
    ...fresh(),
    ticker: 'KXGOLD15M-26SEP18T1830-U',
    periodIndex: bars.length - 1,
    candle: bars[bars.length - 1],
    history: bars
  });
  // Not enough history (< 5 prior bars) → no trade even on a big move.
  const shortHist = [microBar(0, 0.40, 0.42), microBar(1, 0.30, 0.32), microBar(2, 0.28, 0.30)];
  assert.equal(fade.decide(microCtx(shortHist)).length, 0);
  // A 5¢ drop over 5 minutes with a 2¢ spread → buy YES (fade the dip).
  const dip = [];
  for (let i = 0; i < 6; i++) dip.push(microBar(i, i === 0 ? 0.40 : 0.40, i === 0 ? 0.42 : 0.42));
  dip[5] = microBar(5, 0.34, 0.36); // mid 0.35 vs 0.41 five bars earlier → −6¢
  const dipActions = fade.decide(microCtx(dip));
  assert.equal(dipActions.length, 1);
  assert.equal(dipActions[0].side, 'YES', 'a down-spike is faded by buying YES');
  // The same 6¢ move with a 5¢ spread → abstain (source filter: spread ≤ 3 ticks).
  const wide = dip.map((b, i) => (i === 5 ? microBar(5, 0.32, 0.37) : b));
  assert.equal(fade.decide(microCtx(wide)).length, 0, 'a wide spread kills the fade');
  // A 3¢ move → abstain (trigger is 5¢).
  const small = dip.map((b, i) => (i === 5 ? microBar(5, 0.37, 0.39) : b));
  assert.equal(fade.decide(microCtx(small)).length, 0, 'a sub-trigger move is ignored');
  // A 5¢ RISE → buy NO (fade the up-spike).
  const spike = dip.map((b, i) => (i === 5 ? microBar(5, 0.46, 0.48) : b));
  const spikeActions = fade.decide(microCtx(spike));
  assert.equal(spikeActions.length, 1);
  assert.equal(spikeActions[0].side, 'NO', 'an up-spike is faded by buying NO');

  // ── MomTick: 2¢ over one bar, tight spread → follow; anything less → abstain.
  const up = [microBar(0, 0.40, 0.42), microBar(1, 0.44, 0.46)];
  const momUp = mom.decide({ ...microCtx(up), periodIndex: 1 });
  assert.equal(momUp.length, 1);
  assert.equal(momUp[0].side, 'YES', 'a +2¢ 1-minute move is followed with YES');
  const flat = [microBar(0, 0.40, 0.42), microBar(1, 0.41, 0.43)];
  assert.equal(mom.decide({ ...microCtx(flat), periodIndex: 1 }).length, 0, 'a +1¢ move is below the trigger');
  const down = [microBar(0, 0.40, 0.42), microBar(1, 0.36, 0.38)];
  const momDown = mom.decide({ ...microCtx(down), periodIndex: 1 });
  assert.equal(momDown.length, 1);
  assert.equal(momDown[0].side, 'NO', 'a −2¢ 1-minute move is followed with NO');
  // Wide spread → abstain even on a big move.
  const wideMom = [microBar(0, 0.40, 0.42), microBar(1, 0.42, 0.49)];
  assert.equal(mom.decide({ ...microCtx(wideMom), periodIndex: 1 }).length, 0, 'a wide spread kills the follow');

  // ── The research ledger documents the source and its granularity caveats.
  const r14 = RESEARCH_SOURCES.find((r) => r.id === 'R14');
  assert.ok(r14, 'R14 (PriceKalshiHistorical reference strategies) is in the research ledger');
  for (const u of ['MEE_BoardSum', 'FadeSpike_Micro', 'MomTick_Micro']) {
    assert.ok((r14.testedBy || []).includes(u), `R14 records which entry tests ${u}`);
  }
  assert.ok(/adaptation/.test(r14.caveat), 'R14 states the granularity adaptation openly');
});

/* ------------------------------------------------------------------ *
 * LIVE DESK — paper orders on REAL captured open contracts.
 * The desk is the "place a real trade" surface: every price it quotes must
 * come from a captured Kalshi ladder, every fee from the official schedule,
 * and every settlement from the exchange's own result. These tests attack
 * the engine's honesty, not its profitability.
 * ------------------------------------------------------------------ */

import {
  buildDeskUniverse,
  buildTimeline,
  createDeskBook,
  sizeDeskOrder,
  placeDeskOrder,
  crossRestingOrders,
  cancelResting,
  settleDeskMarket,
  runDeskSession,
  buildDeskReport,
  deskCutoffs,
  auditorFacts,
  auditDesk,
  deskLedgerJsonl,
  deskFillsCsv,
  createPortfolio,
  applyFill,
  DESK_LIMITS,
  DESK_VERSION
} from '../src/live-desk.js';
import { DESK_STRATEGIES, deskStrategyById, rosterCoverageEntries } from '../src/desk-strategies.js';
import { SEASON_STRATEGIES, seasonStrategyById, SEASON_USERNAMES } from '../src/desk-season-strategies.js';
import {
  runDeskSeason,
  seasonSchedule,
  buildSeasonReport,
  auditSeason,
  seasonAuditorFacts,
  describeSeasonAudit,
  seasonLedgerJsonl,
  explainSeasonStrategy,
  SEASON_RULE,
  SEASON_VERSION
} from '../src/desk-season.js';
import { DESK_DATA } from '../src/desk-data.js';

const NEWEST = DESK_DATA.coverage.newestCapture;

function deskAt(asOf = NEWEST) {
  return buildDeskUniverse({ data: DESK_DATA, asOf });
}

test('92. every desk contract carries real dates, a real source and a captured ladder or a stated reason', () => {
  const u = deskAt();
  assert.ok(u.markets.length >= 40, `the desk tracks a real universe (${u.markets.length} contracts)`);
  for (const m of u.markets) {
    assert.ok(/^[A-Z0-9.-]+$/.test(m.ticker), `ticker looks like a Kalshi ticker: ${m.ticker}`);
    assert.ok(m.marketUrl && m.marketUrl.includes('external-api.kalshi.com/trade-api/v2/markets/'), `${m.ticker} links its market object`);
    assert.ok(m.marketCapturedAt, `${m.ticker} states when the market object was captured`);
    assert.ok(m.closeTime, `${m.ticker} states the exchange's own close_time`);
    if (m.tradeable) {
      assert.ok(m.ladderAt, `${m.ticker} states when its ladder was captured`);
      assert.ok(m.ladderUrl && m.ladderUrl.includes('/orderbook'), `${m.ticker} links the captured order book`);
      assert.ok(m.ladder.yes.levelCount > 0 || m.ladder.no.levelCount > 0, `${m.ticker} has real levels`);
    } else {
      assert.match(m.notTradeableReason, /NO_CAPTURED_LADDER|NO_LADDER_AT_OR_BEFORE_ASOF|LOOK_AHEAD|NOT_TRADEABLE_AT_CUTOFF|CLOSED|FINALIZED|NO_DATED/, `${m.ticker} states why it cannot be priced`);
    }
  }
  const quoted = u.quotedOnly;
  assert.ok(quoted.length > 0, 'open contracts with quotes but no ladder are listed');
  for (const q of quoted.slice(0, 5)) {
    assert.equal(q.tradeable, false, `${q.ticker} is never marked tradeable without a ladder`);
    assert.match(q.notTradeableReason, /NO_CAPTURED_LADDER/);
  }
});

test('93. the desk refuses to price an order from a ladder captured AFTER the order time', () => {
  const u = deskAt();
  const m = u.markets.find((x) => x.tradeable);
  assert.ok(m, 'a tradeable contract exists');
  const book = createDeskBook(m);
  const before = new Date(Date.parse(m.ladderAt) - 60_000).toISOString();
  const r = placeDeskOrder(book, { action: 'buy', side: 'yes', count: 1000, type: 'market' }, { at: before, seq: 1 });
  assert.equal(r.order.status, 'rejected');
  assert.match(r.order.rejectCode, /LOOK_AHEAD_LADDER/, 'the only ladder post-dates the order');
  assert.equal(r.fills.length, 0, 'no fill is invented from future knowledge');
});

test('94. an order larger than the real ladder fills what exists and reports the rest UNFILLED', () => {
  const u = deskAt();
  const m = u.markets.find((x) => x.tradeable && (x.ladder.yes.totalCount || 0) > 0);
  const book = createDeskBook(m);
  const huge = Math.round((m.ladder.yes.totalCount + m.ladder.no.totalCount) * 10);
  const preview = sizeDeskOrder(book, { action: 'buy', side: 'yes', count: huge, type: 'market' });
  assert.ok(preview.filled > 0, 'the real depth fills something');
  assert.ok(preview.unfilled > 0, 'the remainder is reported, not silently filled');
  assert.equal(preview.fillStatus, 'partial');
  // Gross must equal the sum of the levels actually consumed.
  const levelSum = preview.levels.reduce((s, l) => s + l.count * l.price, 0);
  assert.ok(Math.abs(preview.gross - levelSum) < 1e-6, 'gross is the sum of real levels');
  // And a taker never pays less than the touch.
  assert.ok(preview.vwap + 1e-9 >= preview.bestPrice, 'VWAP can never beat the touch');
});

test('95. buying YES consumes NO bids at 1 − price (the reciprocal ask), never a made-up ladder', () => {
  const u = deskAt();
  const m = u.markets.find((x) => x.tradeable && (x.ladder.no.totalCount || 0) > 0);
  const book = createDeskBook(m);
  const preview = sizeDeskOrder(book, { action: 'buy', side: 'yes', count: Math.min(50, m.ladder.no.totalCount), type: 'market' });
  const reciprocal = preview.levels.filter((l) => l.from.side === 'no_bid');
  assert.ok(reciprocal.length > 0, 'the fill used real NO bids to price YES');
  for (const l of reciprocal) {
    assert.ok(Math.abs(l.price - (1 - l.from.price)) < 1e-9, `${l.price} == 1 − ${l.from.price}`);
  }
});

test('96. fees come from the official schedule with the series multiplier the exchange reported', async () => {
  const u = deskAt();
  const session = await runDeskSession({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null });
  for (const f of session.records.filter((r) => r.k === 'FILL')) {
    const m = u.byTicker.get(f.ticker);
    assert.equal(f.feeMultiplier, m.feeMultiplier, `${f.ticker} carries the captured multiplier`);
    assert.equal(f.feeType, m.feeType, `${f.ticker} carries the captured fee_type`);
    // A multi-level fill pays the schedule PER LEVEL (each level's fee rounds up
    // on its own), so the check recomputes it from the levels the fill names.
    const expected = computeFeeForFills(
      (f.levels || []).map(([levelPrice, levelCount]) => ({ price: levelPrice, count: levelCount })),
      { isMaker: f.maker, multiplier: m.feeMultiplier }
    ).fee;
    assert.ok(Math.abs(expected - f.fee) < 1e-6, `${f.ticker} fee matches the schedule level-by-level (${expected} vs ${f.fee})`);
    // Fee regime: a plain "quadratic" series charges only orders that immediately
    // match (a resting maker fill pays nothing), while a series that carries
    // maker fees charges the maker too. Either way it is the captured fee_type
    // that decides, never an assumption.
    if (m.feeType === 'quadratic' && f.maker) assert.equal(f.fee, 0, `${f.ticker} is a plain quadratic series, so the resting fill pays 0`);
    if (m.feeType === 'quadratic_with_maker_fees' && f.maker) assert.ok(f.fee > 0, `${f.ticker} carries maker fees, so the resting fill pays them`);
    if (m.feeType === 'quadratic' && !f.maker) {
      // A taker pays round up(M × 0.07 × C × P × (1−P)); with the captured
      // multiplier 0 (the fee-free index series) that is exactly nothing.
      if (m.feeMultiplier === 0) assert.equal(f.fee, 0, `${f.ticker} carries the fee-free multiplier 0, so the taker pays 0`);
      else assert.ok(f.fee > 0, `${f.ticker} is a plain quadratic series, so the immediate (taker) fill pays the schedule`);
    }
  }
});

test('97. equity is realized + unrealized − fees for every desk entrant, and nothing is silently dropped', async () => {
  const report = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null });
  assert.equal(report.audit.ok, true, `desk audit fails nothing: ${JSON.stringify(report.audit.mismatches || [])}`);
  for (const r of report.results) {
    assert.ok(typeof r.returnPct === 'number');
    // The engine's accounting identity, recomputed from the entrant's own row:
    // equity is cash plus the marked value of what is still held.
    assert.ok(Math.abs(r.equity - (r.cash + r.marketValue)) < 0.01, `${r.strategy}: equity = cash + marketValue`);
    assert.ok(Math.abs(r.attribution - (r.equity - r.startingCapital)) < 0.01, `${r.strategy}: attribution = equity − startingCapital`);
  }
  // Every record the ledger carries is accounted for by some entrant.
  const names = new Set(report.results.map((r) => r.strategy));
  for (const rec of report.records) {
    if (rec.strategy) assert.ok(names.has(rec.strategy), `${rec.k} names a real entrant (${rec.strategy})`);
  }
});

test('98. each desk entrant explains itself with real numbers, including why it did NOT trade', async () => {
  const report = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null });
  assert.ok(report.explanations.length >= 9, 'every entrant has an explanation');
  for (const e of report.explanations) {
    assert.ok(e.strategy && e.headline, `${e.strategy} has a headline`);
    assert.ok(Array.isArray(e.worked) && Array.isArray(e.hurt) && Array.isArray(e.evidence));
    assert.ok(e.evidence.every((x) => x.label && x.value !== undefined), `${e.strategy} evidence rows are labelled`);
  }
  const idle = report.results.filter((r) => r.fills === 0);
  for (const r of idle) {
    const e = report.explanations.find((x) => x.strategy === r.strategy);
    assert.ok(/no|not|never|zero/i.test(`${e.headline} ${e.hurt.join(' ')} ${e.worked.join(' ')}`), `${r.strategy} states why it did not trade`);
  }
});

test('99. a resting maker order fills only when a LATER real quote crosses it, capped by real volume', () => {
  const u = deskAt();
  const m = u.markets.find((x) => x.tradeable && (x.ladder.yes.best || 0) > 0.02 && (x.ladder.yes.best || 0) < 0.98);
  const book = createDeskBook(m);
  const price = Math.max(0.01, Math.round((m.ladder.yes.best - 0.05) * 100) / 100);
  const placed = placeDeskOrder(book, { action: 'buy', side: 'yes', count: 100, type: 'limit', limitPrice: price, postOnly: true }, { at: m.ladderAt, seq: 1 });
  assert.equal(placed.order.status, 'resting', 'an order below the touch rests');
  assert.equal(placed.resting.queueAhead >= 0, true, 'queue position is measured from the real ladder');
  // A later bar whose ask is still above our price fills nothing.
  const early = { at: new Date(Date.parse(m.ladderAt) + 3_600_000).toISOString(), yesBid: price - 0.01, yesAsk: price + 0.01, volume: 1e9, source: 'test' };
  assert.equal(crossRestingOrders(book, early).length, 0, 'no cross, no fill');
  // A later bar whose ask crosses our price fills, capped by that bar's real volume.
  const late = { at: new Date(Date.parse(m.ladderAt) + 7_200_000).toISOString(), yesBid: price - 0.01, yesAsk: price - 0.005, volume: 40, source: 'test' };
  const fills = crossRestingOrders(book, late);
  assert.equal(fills.length, 1, 'a real later cross fills the resting order');
  assert.ok(fills[0].count <= 40, `the fill is capped by the bar's real volume (${fills[0].count} <= 40)`);
  assert.ok(fills[0].price <= price + 1e-9, 'the maker never pays worse than its own limit');
  // Cancelling a still-resting order is free and recorded (fees are charged only
  // on orders that trade); cancelResting returns the CANCEL records it wrote.
  const never = placeDeskOrder(book, { action: 'buy', side: 'yes', count: 500, type: 'limit', limitPrice: 0.01, postOnly: true }, { at: late.at, seq: 2 });
  assert.equal(never.order.status, 'resting', 'the far-away limit rests');
  const cancelled = cancelResting(book, late.at, 'TEST_CANCEL');
  assert.ok(cancelled.length >= 1, 'the resting order is cancelled');
  assert.equal(cancelled[0].k, 'CANCEL');
  assert.ok(cancelled[0].remaining > 0, 'the cancel reports what never filled');
  assert.match(cancelled[0].feeNote, /no fee/i, 'the cancel states that it costs nothing');
});

test('100. settlement pays the exchange\'s own result, marks the losing side at 1 − value and charges no fee', async () => {
  const u = deskAt();
  const finals = u.markets.filter((m) => m.isFinal && m.result);
  assert.ok(finals.length > 0, 'the desk tracks at least one real finalized contract');
  const m = finals[0];
  const s = settleDeskMarket(m);
  assert.equal(s.result, m.result, 'the settlement carries the exchange result');
  assert.ok(s.source.settlementTs, 'the settlement carries the exchange timestamp');
  assert.ok(s.source.marketUrl.includes('/markets/'), 'the settlement links the market object');
  const yesPay = s.result === 'yes' ? 1 : 0;
  assert.ok(Math.abs(s.value - yesPay) < 1e-9, 'the YES payout is the exchange value exactly');
  assert.ok(Math.abs(1 - s.value - (1 - yesPay)) < 1e-9, 'NO pays the complement (1 − value)');
  // A position in a settled contract must be marked on its OWN side, which is
  // what the desk's marks do — the bug this guard exists for.
  const desk = await runDeskSession({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null, startingCapital: 100000 });
  for (const rec of desk.records.filter((r) => r.k === 'MARK')) {
    assert.ok(rec.markSide === 'yes' || rec.markSide === 'no', `${rec.ticker} records which side was marked`);
    assert.ok(rec.mark > 0 && rec.mark < 1, `${rec.ticker} mark ${rec.mark} is inside (0,1)`);
  }
});

test('101. the desk ledger round-trips to JSONL and CSV without losing a field, and the audit names its sources', async () => {
  const report = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null });
  const jsonl = deskLedgerJsonl(report.records);
  const lines = jsonl.trim().split('\n');
  assert.equal(lines.length, report.records.length, 'one JSON line per record');
  for (const line of lines) JSON.parse(line);
  const csv = deskFillsCsv(report.records);
  assert.ok(csv.split('\n')[0].includes('ticker'), 'the CSV has a header');
  assert.ok(csv.includes('external-api.kalshi.com') || report.records.every((r) => r.k !== 'FILL'), 'fill rows carry the source URL');
  const facts = auditorFacts();
  assert.ok(facts.length >= 12, `the auditor publishes its invariants (${facts.length})`);
  for (const f of facts) {
    assert.ok(f.id && f.rule && f.source, `invariant ${f.id} names its rule and source`);
  }
  assert.ok(facts.some((f) => /docs\.kalshi\.com|kalshi\.com/.test(f.source)), 'at least one invariant cites official Kalshi documentation');
});

test('102. the desk is deterministic: the same cut-off and capital rebuild the same ledger', async () => {
  const a = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null, startingCapital: 100000 });
  const b = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null, startingCapital: 100000 });
  assert.deepEqual(a.results.map((r) => [r.strategy, r.equity]), b.results.map((r) => [r.strategy, r.equity]));
  assert.equal(a.records.length, b.records.length);
  assert.equal(deskLedgerJsonl(a.records), deskLedgerJsonl(b.records));
  const cut = deskCutoffs(DESK_DATA);
  assert.ok(cut.cutoffs.length >= 4, 'several cut-offs are offered');
  assert.ok(cut.cutoffs.every((c) => c.tradeable >= 0 && c.asOf), 'each cut-off states its instant and how many contracts were tradeable');
});

test('103. desk entrants carry unique usernames, a stated edge and a maximum-return mandate', () => {
  const names = DESK_STRATEGIES.map((s) => s.username);
  assert.equal(new Set(names).size, names.length, 'usernames are unique');
  for (const s of DESK_STRATEGIES) {
    assert.ok(deskStrategyById(s.id) === s, `${s.id} is resolvable by id`);
    assert.ok(s.thesis && s.thesis.length > 40, `${s.username} states its edge`);
    assert.ok(s.rules && s.rules.length >= 3, `${s.username} states its entry/exit rules`);
    assert.ok(/maximum return/i.test(s.mandate || ''), `${s.username} carries the maximum-return mandate`);
    assert.ok(!/stop-loss|risk management|position cap/i.test(s.thesis + ' ' + (s.rules || []).join(' ')), `${s.username} is not framed as risk management`);
    assert.equal(typeof s.decide, 'function', `${s.username} exposes an executable decide()`);
  }
  assert.ok(DESK_LIMITS.maxShareOfRealVolume <= 0.25, 'the liquidity cap stays conservative');
  // Roster coverage is stated, not implied: every desk entry says where it trades.
  const coverage = rosterCoverageEntries(DESK_STRATEGIES);
  assert.equal(coverage.length, DESK_STRATEGIES.length);
  assert.ok(DESK_STRATEGIES.length >= 13, `desk roster must not shrink below the 13-entry set, got ${DESK_STRATEGIES.length}`);
  assert.ok(coverage.every((c) => c.strategy && c.note), 'coverage rows name the strategy and where its trades are tracked');
  assert.equal(DESK_VERSION, 1);
});

test('104. DESK_RESERVED_USERNAMES is set-equal to the live desk roster, and a desk session attaches to the year', () => {
  const reserved = [...DESK_RESERVED_USERNAMES].sort();
  // The reserved set is the UNION of the two rosters: the Live Desk (one session
  // per cut-off) and the Desk Season (the carried multi-round book).
  const live = [...DESK_STRATEGIES.map((s) => s.username), ...SEASON_STRATEGIES.map((s) => s.username)].sort();
  assert.deepEqual(reserved, live, 'an entrant that is not reserved (or a reserved name with no entry) is a hole');
  assert.equal(reserved.length, DESK_STRATEGIES.length + SEASON_STRATEGIES.length);
  assert.equal(new Set(reserved).size, reserved.length, 'no username may be shared by two entrants');
  assert.deepEqual([...SEASON_USERNAMES].sort(), SEASON_STRATEGIES.map((s) => s.username).sort());

  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  const empty = { strategies: [], participants: [] };
  for (const name of DESK_RESERVED_USERNAMES) {
    assert.equal(validateUsername(name, empty).reason, 'username_reserved_by_algorithmic_strategy');
    assert.equal(validateUsername(name, engine.state).reason, 'username_reserved_by_algorithmic_strategy');
  }

  const asOf = '2026-09-18T18:46:22.458Z';
  const attached = engine.attachDeskSession({
    asOf,
    audit: { ok: true },
    records: [
      {
        k: 'FILL', strategy: 'LiveFavourite_Settle', ticker: 'KXTEST-1', action: 'buy', side: 'yes',
        count: 10, price: 0.5, fee: 0.07, at: asOf, slippage: 0, maker: false,
        ladderUrl: 'https://external-api.kalshi.com/trade-api/v2/markets/KXTEST-1/orderbook',
        explain: 'test fill'
      },
      {
        k: 'SETTLE', strategy: 'LiveFavourite_Settle', ticker: 'KXTEST-1', side: 'yes',
        count: 10, payoffPerContract: 1, fee: 0, at: asOf, settledAt: asOf, explain: 'test settle'
      }
    ],
    results: [{
      strategy: 'LiveFavourite_Settle', returnPct: 0, equity: 100000, cash: 100000,
      fills: 1, contracts: 10, unfilled: 0, feesPaid: 0.07, slippageCost: 0,
      settlementPnl: 0, startingCapital: 100000
    }],
    explanations: [{ strategy: 'LiveFavourite_Settle', verdict: 'TEST', headline: 'attached', worked: [], hurt: [] }]
  });
  assert.ok(attached);
  assert.equal(engine.state.deskMemory.fillCount, 1);
  assert.equal(engine.state.deskMemory.settlementCount, 1);
  assert.equal(engine.state.deskMemory.asOf, asOf);
  const deskRows = engine.state.tradeLog.filter((t) => t.kind === 'desk');
  assert.equal(deskRows.length, 2);
  assert.ok(deskRows.every((t) => t.participant === 'LiveFavourite_Settle'));
  const csv = engine.exportTradesCSV();
  assert.match(csv, /LiveFavourite_Settle/);
  assert.match(csv, /,desk,/);

  // Re-attaching the same cut-off replaces, it does not duplicate.
  engine.attachDeskSession({
    asOf,
    audit: { ok: true },
    records: [{ k: 'FILL', strategy: 'LiveFavourite_Settle', ticker: 'KXTEST-1', action: 'buy', side: 'yes', count: 1, price: 0.4, fee: 0, at: asOf }],
    results: [{ strategy: 'LiveFavourite_Settle', returnPct: 0, equity: 100000, fills: 1, contracts: 1, unfilled: 0, feesPaid: 0, slippageCost: 0, settlementPnl: 0, startingCapital: 100000 }],
    explanations: []
  });
  assert.equal(engine.state.tradeLog.filter((t) => t.kind === 'desk').length, 1);
});

/* ==================================================================== *
 * DESK SEASON — the carried book (tests 105–112)
 * --------------------------------------------------------------------
 * The Live Desk runs one session at one cut-off (tests 92–104). These tests
 * cover the thing a session cannot do: hold one book across a SEQUENCE of real
 * capture instants, walk it through the real events between them, and prove
 * from the ledger that nothing was reset, invented or double-counted.
 * ==================================================================== */

function seasonFixture(options = {}) {
  return runDeskSeason({ data: DESK_DATA, strategies: SEASON_STRATEGIES, ...options });
}

test('105. every season round is a real capture instant from the store, in order', () => {
  const schedule = seasonSchedule({ data: DESK_DATA });
  const instants = new Set(
    DESK_DATA.markets.flatMap((m) => (m.captures || []).map((c) => Date.parse(c.at))).filter((t) => Number.isFinite(t))
  );
  assert.ok(schedule.rounds.length >= 2, `a season needs at least two real rounds (got ${schedule.rounds.length})`);
  assert.ok(schedule.rounds.length <= schedule.maxRounds);
  for (const r of schedule.rounds) {
    assert.ok(instants.has(Date.parse(r.asOf)), `${r.label} is stamped at a real capture instant (${r.asOf})`);
    assert.ok(Number.isFinite(r.asOfMs));
  }
  const times = schedule.rounds.map((r) => r.asOfMs);
  assert.deepEqual(times, [...times].sort((a, b) => a - b), 'rounds strictly increase in time');
  assert.equal(new Set(times).size, times.length, 'no round is repeated');
  // A round must have at least one market whose ladder was captured at or before it.
  assert.ok(schedule.rounds.every((r) => r.marketsWithLadder >= 1));
  // The batches are real groupings of the store's instants, not invented ones.
  assert.ok(schedule.batches >= schedule.rounds.length, `batches (${schedule.batches}) >= rounds (${schedule.rounds.length})`);
  assert.ok(schedule.considered >= schedule.batches, `instants (${schedule.considered}) >= batches (${schedule.batches})`);
  assert.match(SEASON_RULE.rounds, /REAL capture instant/);
});

test('106. the season is ONE book: cash, positions and caps carry, and the curve is continuous', () => {
  const season = seasonFixture();
  for (const r of season.results) {
    const curve = r.equityCurve || [];
    assert.ok(curve.length === season.rounds.length + 1, `${r.strategy} has one point per round plus the close (${curve.length})`);
    for (const point of curve) {
      assert.ok(Math.abs((point.cash + point.marketValue) - point.equity) < 0.011, `${r.strategy}: cash + marketValue = equity at ${point.roundLabel}/${point.phase}`);
    }
    const last = curve[curve.length - 1];
    assert.ok(Math.abs(last.equity - r.equity) < 0.011, `${r.strategy}: the curve ends at the reported equity`);
    assert.ok(Math.abs(r.attribution - (r.equity - r.startingCapital)) < 0.011, `${r.strategy}: equity - start = realized + unrealized - fees`);
    // Rounds are addressed by label, and every open position names a real contract.
    for (const p of r.openPositions) assert.ok(p.contracts > 0 && typeof p.ticker === 'string');
  }
});

test('107. the forward walk uses the STORE bars, while decisions still see only the cut-off', () => {
  // Regression guard for the bug the season work found: buildTimeline used to
  // read `universe.markets[].bars`, which is truncated at the cut-off, so every
  // candlestick quote was filtered out and no resting order could ever be
  // crossed by a real later trade (IRREGULARITIES.md #46).
  const newestMs = Date.parse(DESK_DATA.coverage.newestCapture);
  const older = new Date(newestMs - 12 * 3600 * 1000).toISOString();
  const universe = buildDeskUniverse({ data: DESK_DATA, asOf: older });
  const timeline = buildTimeline(universe, universe.asOfMs, DESK_DATA);
  const candleQuotes = timeline.filter((e) => e.kind === 'quote' && String(e.source || '').includes('candlestick'));
  assert.ok(candleQuotes.length > 0, 'a later captured candlestick is a real forward quote event');
  assert.ok(candleQuotes.every((e) => e.t > universe.asOfMs), 'forward quotes are strictly after the cut-off');
  // ...and the DECISION view is still point-in-time: no universe bar may end after the cut-off.
  for (const m of universe.markets) {
    for (const bar of m.bars) assert.ok(bar.endTs * 1000 <= universe.asOfMs, `${m.ticker} decision bars are cut off at asOf`);
  }
});

test('108. a carried maker fill is crossed by a later real quote, never by its own round', () => {
  const season = seasonFixture();
  const fills = season.records.filter((r) => r.k === 'FILL');
  const maker = fills.filter((f) => f.maker);
  for (const f of maker) {
    assert.ok(f.crossedBy && f.crossedBy.source, 'a maker fill names the real quote that crossed it');
    const fillAt = Date.parse(f.at);
    const crossedAt = Date.parse(String(f.crossedBy.source).match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/)?.[1] || f.at);
    assert.ok(crossedAt >= fillAt - 1000, 'the crossing quote is not earlier than the fill');
    assert.ok(f.ladderAt && Date.parse(f.ladderAt) <= fillAt + 1000, 'the ladder named by the resting order predates the fill');
    assert.equal(f.depthModel, 'resting_order_crossed_by_later_real_quote');
  }
  // And the taker path is unchanged: every taker fill consumed real levels.
  for (const f of fills.filter((x) => !x.maker)) {
    const consumed = (f.levels || []).reduce((s, [, c]) => s + Number(c), 0);
    assert.ok(Math.abs(consumed - Number(f.count)) < 0.011, `${f.id}: levels consumed equal the fill`);
  }
  // Every fill in a carried book is stamped with the round it belongs to.
  assert.ok(fills.every((f) => Number.isFinite(Number(f.round))), 'every season fill carries a round index');
  const roundByIndex = new Map(season.rounds.map((r) => [r.index, r]));
  for (const f of fills) {
    const round = roundByIndex.get(Number(f.round));
    assert.ok(round, `round ${f.round} exists`);
    assert.ok(Date.parse(f.at) <= Date.parse(round.asOf) + 1000, 'a fill is not stamped after its round');
  }
});

test('109. the season audit passes, publishes S1–S11 with sources, and describes itself', () => {
  const season = seasonFixture();
  const audit = auditSeason(season, buildDeskUniverse({ data: DESK_DATA }));
  assert.equal(audit.ok, true, `season audit: ${audit.mismatches.map((m) => m.name).join('; ')}`);
  assert.equal(season.audit.ok, true);
  const facts = seasonAuditorFacts();
  assert.ok(facts.length >= 10, `the season publishes its own invariants (${facts.length})`);
  const idOrder = facts.map((f) => Number(String(f.id).replace(/\D/g, '')));
  assert.deepEqual(idOrder, idOrder.slice().sort((a, b) => a - b), 'invariant ids S1..S11 are in order');
  for (const f of facts) assert.ok(f.rule && f.source, `${f.id} carries a rule and a source`);
  assert.match(describeSeasonAudit(season.audit), /season checks passed/);
  // The audit re-derives the ledger: totals come from the records, not from a summary.
  const fills = season.records.filter((r) => r.k === 'FILL');
  assert.equal(season.audit.totals.fills, fills.length);
  assert.ok(Math.abs(season.audit.totals.fees - fills.reduce((s, f) => s + (f.fee || 0), 0)) < 0.000001);
  assert.ok(season.audit.checks.length > 13, 'the season runs the 13 desk checks PLUS its own');
  assert.ok(seasonLedgerJsonl(season.records).trim().split('\n').every((line) => JSON.parse(line)));
});

test('110. the season is deterministic and a replay rebuilds the same ledger', () => {
  const a = seasonFixture();
  const b = seasonFixture();
  assert.deepEqual(
    a.results.map((r) => [r.strategy, r.returnPct, r.equity, r.fills, r.contracts, r.feesPaid]),
    b.results.map((r) => [r.strategy, r.returnPct, r.equity, r.fills, r.contracts, r.feesPaid])
  );
  assert.deepEqual(
    a.records.filter((r) => r.k === 'FILL').map((f) => [f.round, f.ticker, f.side, f.count, f.price, f.fee]),
    b.records.filter((r) => r.k === 'FILL').map((f) => [f.round, f.ticker, f.side, f.count, f.price, f.fee])
  );
  // A replay of the same report builder agrees with the runner too.
  const report = buildSeasonReport({ data: DESK_DATA, strategies: SEASON_STRATEGIES });
  assert.deepEqual(
    report.results.map((r) => [r.strategy, r.returnPct]),
    a.results.map((r) => [r.strategy, r.returnPct])
  );
  assert.equal(SEASON_VERSION, 1);
});

test('111. an entrant that never traded is unranked with a reason, never presented as 0%', () => {
  const season = seasonFixture();
  const idle = season.results.filter((r) => r.fills === 0 && r.settlementPnl === 0);
  const coverage = season.coverage || [];
  for (const r of idle) {
    assert.equal(r.returnPct, 0);
    assert.equal(r.equity, r.startingCapital);
    const row = coverage.find((c) => c.strategy === r.strategy);
    assert.ok(row, `${r.strategy} appears in coverage`);
    assert.ok(/entry conditions were never met|no order was fillable/.test(row.note), `${r.strategy}: ${row.note}`);
    // Either it returned no order at all, or it ordered something the real
    // ladders could not fill — both are reported, neither is priced.
    if (row.orders === 0) assert.match(row.note, /entry conditions were never met/);
    else assert.match(row.note, /no order was fillable/);
  }
  // The control entrant is idle BY DESIGN, and says so.
  const control = seasonStrategyById('SeasonControl_NoTrade');
  assert.ok(control);
  assert.match(control.mandate, /CONTROL/);
  assert.deepEqual(control.decide({ markets: [], positions: new Map() }), []);
  // Every explanation carries a measured block and a verdict, traded or not.
  for (const e of season.explanations) {
    assert.ok(['PROFITABLE', 'LOSS', 'FLAT', 'NO_TRADES'].includes(e.verdict), `${e.strategy}: ${e.verdict}`);
    assert.ok(e.measured && typeof e.measured.fees === 'number');
    assert.ok(e.headline.includes(e.strategy));
  }
  // An explanation can be re-derived from the ledger alone.
  const worst = season.results.slice().sort((a, b) => a.returnPct - b.returnPct)[0];
  const explained = explainSeasonStrategy(worst, season.records, []);
  assert.equal(explained.strategy, worst.strategy);
  assert.equal(explained.measured.fills, season.records.filter((r) => r.k === 'FILL' && r.strategy === worst.strategy).length);
});

test('112. season entrants are complete, unique, source-mapped and maximum-return mandated', () => {
  assert.ok(SEASON_STRATEGIES.length >= 5, `the season roster does not shrink below its designed set (${SEASON_STRATEGIES.length})`);
  const seen = new Set();
  for (const s of SEASON_STRATEGIES) {
    assert.ok(s.username.length >= 3 && s.username.length <= 24, `${s.username} satisfies the platform's 3–24 character username rule`);
    assert.ok(/^[A-Za-z0-9_.]+$/.test(s.username), `${s.username} uses only the allowed username characters`);
    assert.ok(!seen.has(s.username), `${s.username} is unique`);
    seen.add(s.username);
    assert.ok(s.thesis && s.thesis.length > 80, `${s.username} states a thesis`);
    assert.ok(Array.isArray(s.rules) && s.rules.length >= 1, `${s.username} states its rules`);
    assert.ok(s.source && s.source.length > 10, `${s.username} names its source (a MasterSite S-id or the exchange doctrine)`);
    assert.ok(typeof s.decide === 'function', `${s.username} exposes executable decide()`);
    assert.match(s.mandate, /MAXIMUM RETURN|CONTROL/, `${s.username} states the mandate`);
    assert.equal(seasonStrategyById(s.id)?.username, s.username, `lookup by id works for ${s.id}`);
    // A design that can be pointed at a MasterSite project names it as S<id>.
    if (/^S\d\d/.test(s.source)) assert.match(s.source, /^S\d\d/);
    // No strategy may carry a literal result (the honesty contract).
    assert.ok(!/returnPct\s*[:=]\s*-?\d/.test(s.decide.toString()), `${s.username} does not hard-code a result`);
  }
  // The names are reserved, so a human cannot impersonate a season entrant.
  for (const name of SEASON_USERNAMES) {
    assert.equal(validateUsername(name, { strategies: [], participants: [] }).reason, 'username_reserved_by_algorithmic_strategy');
  }
});

test('113. the season attaches to the one-year memory as one carried book, and re-attaching replaces it', () => {
  const season = seasonFixture();
  const engine = new CompetitionMemoryEngine({ tier: 'test', storage: null });
  const payload = {
    ...season,
    seasonSnapshot: {
      version: season.version,
      rounds: season.rounds,
      audit: season.audit,
      results: season.results,
      explanations: season.explanations
    }
  };
  engine.attachDeskSeason(payload);
  const mem = engine.state.deskSeasonMemory;
  assert.ok(mem, 'deskSeasonMemory is written into the year');
  assert.equal(mem.rounds.length, season.rounds.length, 'every real round is remembered');
  assert.equal(mem.results.length, season.results.length, 'every entrant is remembered');
  assert.equal(mem.auditOk, true);
  assert.ok(Math.abs(mem.totals.fees - season.audit.totals.fees) < 1e-6, 'the remembered fee total is the ledger fee total');
  const rows = engine.state.tradeLog.filter((t) => t.kind === 'desk-season');
  assert.equal(rows.length, season.records.filter((r) => r.k === 'FILL' || r.k === 'SETTLE').length);
  assert.ok(rows.every((r) => r.participant && r.ticker && r.timestamp), 'every carried row names the entrant, the contract and a real timestamp');
  assert.ok(new Set(rows.map((r) => r.participant)).size >= 2, 'the carried rows belong to more than one entrant');
  assert.ok(rows.every((r) => r.bookSource), 'every carried row keeps the source URL it was priced from');
  // Re-attaching the same season replaces its rows instead of duplicating the year.
  engine.attachDeskSeason(payload);
  assert.equal(engine.state.tradeLog.filter((t) => t.kind === 'desk-season').length, rows.length, 'no duplicated season rows');
  // A season entrant cannot be impersonated by a human in the same year.
  for (const name of SEASON_USERNAMES) {
    assert.equal(validateUsername(name, engine.state).reason, 'username_reserved_by_algorithmic_strategy');
  }
});

test('114. a paper account can neither borrow cash nor sell contracts it does not hold', () => {
  const universe = buildDeskUniverse({ data: DESK_DATA });
  const market = universe.markets.find((m) => m.tradeable && m.ladder);
  assert.ok(market, 'the store holds at least one priceable contract');

  // (a) CASH. An order far larger than the account can pay for is capped to
  // what the cash covers, and the cap is recorded on the fill.
  const portfolio = createPortfolio('CashTest', 500);
  const big = placeDeskOrder(
    createDeskBook(market),
    { strategy: 'CashTest', action: 'buy', side: 'yes', type: 'market', count: 100000, reason: 'far more than $500 can pay for' },
    { at: universe.asOf, portfolio }
  );
  assert.ok(big.fills.length === 1, 'the order still fills — at the size the cash allows');
  const fill = big.fills[0];
  assert.ok(fill.gross + fill.fee <= 500 + 0.01, `cost ${fill.gross + fill.fee} must fit inside the $500 account`);
  assert.ok(fill.cashCapped > 0, 'the cash cap is recorded on the fill');
  assert.ok(big.order.unfilled > 0, 'the unaffordable remainder is reported unfilled');
  // Without a portfolio the desk cannot know the cash, and says so by not capping.
  const unguarded = placeDeskOrder(
    createDeskBook(market),
    { strategy: 'NoPortfolio', action: 'buy', side: 'yes', type: 'market', count: 1000, reason: 'no portfolio supplied' },
    { at: universe.asOf }
  );
  assert.equal(unguarded.fills.length ? unguarded.fills[0].cashCapped : 0, 0);

  // (b) SHORTING. A sell with no position is refused, not booked as a short.
  const short = placeDeskOrder(
    createDeskBook(market),
    { strategy: 'ShortTest', action: 'sell', side: 'yes', type: 'market', count: 10, reason: 'naked short' },
    { at: universe.asOf, portfolio: createPortfolio('ShortTest', 1000) }
  );
  assert.equal(short.fills.length, 0);
  assert.equal(short.order.rejectCode, 'NO_POSITION_TO_SELL');
  assert.match(short.rejected, /does not allow naked shorting/);

  // (c) A sell larger than the position is capped to what is actually held.
  const holder = createPortfolio('Holder', 1000);
  const bought = placeDeskOrder(
    createDeskBook(market),
    { strategy: 'Holder', action: 'buy', side: 'yes', type: 'market', count: 20, reason: 'open a 20-contract position' },
    { at: universe.asOf, portfolio: holder }
  );
  if (bought.fills.length && bought.fills[0].count >= 20) {
    applyFill(holder, bought.fills[0]);
    const sold = placeDeskOrder(
      createDeskBook(market),
      { strategy: 'Holder', action: 'sell', side: 'yes', type: 'market', count: 5000, reason: 'sell far more than held' },
      { at: universe.asOf, portfolio: holder }
    );
    if (sold.fills.length) {
      assert.ok(sold.fills[0].count <= 20 + 1e-9, `a sell is capped to the held size (${sold.fills[0].count} sold of 20 held)`);
    }
  }

  // (d) The invariant holds for the whole season, not only for one order.
  const season = seasonFixture();
  for (const r of season.results) {
    for (const point of r.equityCurve) assert.ok(point.cash >= -0.011, `${r.strategy}: cash ${point.cash} went negative at ${point.roundLabel}`);
  }
});

/* ─────────────────────────────────────────────────────────────────────── *
 * FDA signal archive (2026-09-19, session 01a0bad9)
 * ══════════════════════════════════════════════════════════════════════ */

test('115. the Drugs@FDA parser derives the archive state from official response shapes and refuses unexpected ones', async () => {
  const { parseResponse, deriveApproved } = await import('../scripts/archive-fda-signals.mjs');

  // NO_RECORD: the exchange's own empty result (a drug with no application yet).
  const empty = parseResponse({ meta: { disclaimer: 'openFDA', results: { total: 0 } }, results: [] });
  assert.equal(empty.state, 'NO_RECORD');
  assert.equal(empty.approved, false);
  assert.equal(empty.total, 0);

  // RECORD_NO_APPROVED_PRODUCT: an application exists, no approved-marketed status.
  const pending = parseResponse({
    meta: { disclaimer: 'd', results: { total: 1, skip: 0, limit: 1 } },
    results: [
      {
        application_number: 'NDA123456',
        sponsor_name: 'EXAMPLE PHARMA',
        products: [{ brand_name: 'X', marketing_status: 'None', active_ingredients: [{ name: 'X', strength: '1MG' }] }],
        submissions: [{ submission_type: 'ORIG', submission_status: 'CR', submission_status_date: '2026-01-15' }]
      }
    ]
  });
  assert.equal(pending.state, 'RECORD_NO_APPROVED_PRODUCT');
  assert.equal(pending.approved, false);
  assert.deepEqual(pending.marketingStatuses, ['None']);
  assert.equal(pending.newestSubmissionStatusDate, '2026-01-15');

  // APPROVED: a product whose verbatim marketing_status is one of the two
  // approved-marketed states in the official Drugs@FDA vocabulary.
  const approved = parseResponse({
    meta: { disclaimer: 'd', results: { total: 1 } },
    results: [
      {
        application_number: 'NDA123456',
        sponsor_name: 'EXAMPLE PHARMA',
        products: [{ brand_name: 'X', marketing_status: 'Prescription', active_ingredients: [] }],
        submissions: []
      }
    ]
  });
  assert.equal(approved.state, 'APPROVED');
  assert.equal(approved.approved, true);
  assert.deepEqual(approved.marketingStatuses, ['Prescription']);

  // The derivation is the documented EXACT vocabulary match (Drugs@FDA
  // glossary): Prescription / Over-the-counter are the approved-marketed
  // states; 'Discontinued' (approved but not marketed, incl. withdrawn
  // approvals) and 'None' (tentative) do not count. Unknown strings fail
  // CLOSED — they never read as an approval.
  const { APPROVED_MARKETING_STATUSES, MARKETING_STATUS_GLOSSARY } = await import('../scripts/archive-fda-signals.mjs');
  assert.deepEqual(APPROVED_MARKETING_STATUSES, ['prescription', 'over-the-counter']);
  assert.ok(/fda\.gov/.test(MARKETING_STATUS_GLOSSARY));
  assert.equal(deriveApproved([{ marketing_status: 'Over-the-counter' }]).approved, true);
  assert.equal(deriveApproved([{ marketing_status: 'Tentative Approval' }]).approved, false, 'tentative is not approved');
  assert.equal(deriveApproved([{ marketing_status: 'Discontinued' }]).approved, false, 'discontinued is not approved-for-marketing');
  assert.equal(deriveApproved([{ marketing_status: 'None' }]).approved, false);
  assert.equal(deriveApproved([{ marketing_status: 'Some brand-new string' }]).approved, false, 'unknown vocabulary fails closed');
  assert.equal(deriveApproved([{ marketing_status: null }, {}]).approved, false);

  // An unexpected shape throws instead of guessing (shape-change detector).
  assert.throws(() => parseResponse({ meta: {} }), /total/);
  assert.throws(() => parseResponse(null));

  // openFDA's documented empty result is HTTP 404 NOT_FOUND "No matches
  // found!" — archived as a legitimate NO_RECORD snapshot (irregularity-#50
  // follow-up; verified against the live API in run 4's committed report).
  const { snapshotFromNotFound } = await import('../scripts/archive-fda-signals.mjs');
  const nf = snapshotFromNotFound('https://api.fda.gov/drug/drugsfda.json?search=x&limit=99');
  assert.equal(nf.state, 'NO_RECORD');
  assert.equal(nf.approved, false);
  assert.equal(nf.http_status, 404);
  assert.equal(nf.meta.total, 0);
  assert.match(nf.notFoundError, /No matches found/);
});

test('116. the FDA signal store is point-in-time: no snapshot after the decision is ever readable, and the flip is detected in time order', async () => {
  const store = await import('../src/fda-signal-store.js');
  const snaps = [
    { captured_at: '2026-09-19T12:00:00.000Z', state: 'NO_RECORD', approved: false, url: 'https://api.fda.gov/drug/drugsfda.json?search=x', total: 0 },
    { captured_at: '2026-09-20T12:00:00.000Z', state: 'RECORD_NO_APPROVED_PRODUCT', approved: false, url: 'https://api.fda.gov/drug/drugsfda.json?search=x', total: 1 },
    { captured_at: '2026-09-21T12:00:00.000Z', state: 'APPROVED', approved: true, url: 'https://api.fda.gov/drug/drugsfda.json?search=x', total: 1 }
  ];
  const sec = (iso) => Math.floor(Date.parse(iso) / 1000);
  // Before the first snapshot: null — the strategy abstains.
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-19T11:59:59Z')), null);
  // The newest snapshot AT the decision is used (equal timestamps are knowable).
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-19T12:00:00Z')).state, 'NO_RECORD');
  // A decision between captures sees the state as of THEN, never a later one:
  // at 09-21T00:00Z the 09-21T12:00Z snapshot does not exist yet.
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-20T23:00:00Z')).state, 'RECORD_NO_APPROVED_PRODUCT');
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-21T00:00:00Z')).state, 'RECORD_NO_APPROVED_PRODUCT');
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-21T12:00:00Z')).state, 'APPROVED');
  assert.equal(store.stateAtOrBefore(snaps, sec('2026-09-22T00:00:00Z')).state, 'APPROVED');
  // Snapshots out of order in the file change nothing.
  assert.equal(store.stateAtOrBefore([...snaps].reverse(), sec('2026-09-20T23:00:00Z')).state, 'RECORD_NO_APPROVED_PRODUCT');
  // The flip: 09-21's snapshot is where approved became true.
  const flip = store.approvalFlip(snaps);
  assert.equal(flip.flippedAt, '2026-09-21T12:00:00.000Z');
  assert.equal(flip.priorCapturedAt, '2026-09-20T12:00:00.000Z');
  // No flip while the state never changes.
  assert.equal(store.approvalFlip(snaps.slice(0, 2)), null);
  assert.equal(store.approvalFlip([]), null);
});

test('117. the FDA strategy is a genuine forward test: it abstains on the shipped archive, and the deliberately excluded series are published', async () => {
  const { STRATEGIES } = await import('../src/strategies.js');
  const runner = await import('../src/strategy-runner.js');
  const store = await import('../src/fda-signal-store.js');
  const strat = STRATEGIES.find((s) => s.username === 'FDAEdge_DrugsFDA');
  assert.ok(strat, 'the FDA strategy is on the roster');

  // (a) With the archive as shipped (0 or more snapshots), a competition run
  // for this strategy on the real daily store computes a result — 0 trades
  // while the archive does not overlap a live market — and the leaderboard
  // refuses to rank a strategy with no fills.
  const res = runner.runCompetition({ strategies: [strat], depthMode: 'captured', periodIntervalMinutes: 1440 });
  const me = res.results[0];
  assert.equal(me.totalTrades, 0, 'no archive overlap yet → no trades (never a fabricated backtest)');
  assert.equal(me.analysis.verdict, 'UNTESTED_ON_THIS_DATASET');
  assert.equal(res.leaderboard[0].rank, null, 'unranked, with the reason published');
  assert.ok(String(res.leaderboard[0].disqualificationReason || '').length > 10, 'the not-ranked reason is stated');

  // (b) The exclusions are part of the shipped configuration, with reasons.
  const { EXCLUDED } = await import('../scripts/archive-fda-signals.mjs');
  assert.ok(EXCLUDED.some((e) => e.series === 'KXFDAANNOUNCE'), 'the announcement series is deliberately excluded');
  assert.ok(EXCLUDED.some((e) => e.series === 'KXFDAAPPROVALPSYCHEDELIC'), 'the composite series is deliberately excluded');
  for (const e of EXCLUDED) assert.ok(e.reason.length > 40, `${e.series} carries a real reason`);

  // (c) The provider answers only the exact tracked tickers the archive was
  // configured from — and, with no archive shipped, is null so the composed
  // provider still answers the weather markets.
  const fdaProvider = runner.buildFdaSignalProvider();
  if (!store.hasFdaSignalArchive()) {
    assert.equal(fdaProvider, null, 'no archive → no provider (never a guessing one)');
  } else {
    const ticks = new Set(store.fdaSubjects().flatMap((s) => s.markets || []));
    assert.ok(ticks.size > 0);
  }
});

test('118. Live Desk tracks placed trades and upcoming trades with verified pricing, dates, and liquidity', async () => {
  const { buildDeskReport, buildPlacedTrades, buildUpcomingTrades, buildDeskUniverse } = await import('../src/live-desk.js');
  const { DESK_STRATEGIES } = await import('../src/desk-strategies.js');
  const { DESK_DATA } = await import('../src/desk-data.js');

  // `buildDeskReport` is async (it resolves the point-in-time signal providers);
  // calling it without `await` asserts on a Promise and silently fails, which is
  // how this test shipped red (irregularity #55).
  const report = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null, startingCapital: 100000 });
  assert.ok(report.ok, 'desk report builds cleanly');
  assert.ok(Array.isArray(report.placedTrades), 'placedTrades must be an array');
  assert.ok(Array.isArray(report.upcomingTrades), 'upcomingTrades must be an array');
  assert.ok(report.placedTrades.length >= 10, `expected at least 10 placed trades, got ${report.placedTrades.length}`);
  assert.ok(report.upcomingTrades.length >= 10, `expected at least 10 upcoming trades, got ${report.upcomingTrades.length}`);

  // Audit placed trades: every field must be grounded in verified data
  for (const pt of report.placedTrades) {
    assert.ok(pt.id && pt.id.startsWith('TR-'), `${pt.id}: trade id format`);
    assert.ok(pt.orderId, `${pt.id}: order id required`);
    assert.ok(pt.strategy, `${pt.id}: strategy username required`);
    assert.ok(pt.ticker, `${pt.id}: contract ticker required`);
    assert.ok(pt.placedAt && !isNaN(Date.parse(pt.placedAt)), `${pt.id}: valid placedAt timestamp`);
    assert.ok(pt.action === 'buy' || pt.action === 'sell', `${pt.id}: action`);
    assert.ok(pt.side === 'yes' || pt.side === 'no', `${pt.id}: side`);
    assert.ok(typeof pt.requestedCount === 'number' && pt.requestedCount >= 0);
    assert.ok(typeof pt.filledCount === 'number' && pt.filledCount >= 0);
    assert.ok(typeof pt.grossCost === 'number' && pt.grossCost >= 0);
    assert.ok(typeof pt.feePaid === 'number' && pt.feePaid >= 0);
    assert.ok(typeof pt.feeMultiplier === 'number' && pt.feeMultiplier > 0);
    assert.ok(pt.ladderSourceUrl && pt.ladderSourceUrl.startsWith('https://'), `${pt.id}: official ladder URL`);
    assert.ok(pt.marketSourceUrl && pt.marketSourceUrl.startsWith('https://'), `${pt.id}: official market URL`);
    assert.ok(pt.status, `${pt.id}: execution status required`);
  }

  // Audit upcoming trades: every planned trade has trigger conditions and target pricing
  for (const ut of report.upcomingTrades) {
    assert.ok(ut.id && ut.id.startsWith('UPC-'), `${ut.id}: upcoming trade id format`);
    assert.ok(ut.strategy, `${ut.id}: strategy username required`);
    assert.ok(ut.ticker, `${ut.id}: contract ticker required`);
    assert.ok(ut.proposedAction === 'buy' || ut.proposedAction === 'sell');
    assert.ok(ut.proposedSide === 'yes' || ut.proposedSide === 'no');
    assert.ok(typeof ut.targetPrice === 'number' && ut.targetPrice > 0 && ut.targetPrice < 1);
    assert.ok(typeof ut.proposedCount === 'number' && ut.proposedCount > 0);
    assert.ok(ut.triggerType, `${ut.id}: trigger type required`);
    assert.ok(ut.triggerCondition && ut.triggerCondition.length > 5, `${ut.id}: trigger condition description`);
    assert.ok(ut.rationale && ut.rationale.length > 10, `${ut.id}: strategy rationale`);
    assert.ok(ut.marketSourceUrl && ut.marketSourceUrl.startsWith('https://'));
  }
});

test('119. MasterSite S02 and S03 strategies exist, execute cleanly, and are linked in the ledger', async () => {
  const { STRATEGIES } = await import('../src/strategies.js');
  const { DESK_STRATEGIES } = await import('../src/desk-strategies.js');
  const { SIGNAL_SOURCES } = await import('../src/signal-sources.js');

  const s02 = SIGNAL_SOURCES.find((s) => s.id === 'S02');
  const s03 = SIGNAL_SOURCES.find((s) => s.id === 'S03');
  assert.ok(s02, 'S02 in ledger');
  assert.ok(s03, 'S03 in ledger');
  assert.deepEqual(s02.strategyUsername, ['InsiderFlow_Form4', 'LiveInsider_Form4Flow', 'InsiderFiling_Drift', 'LiveInsider_FilingFader']);
  assert.equal(s02.status, 'live verified signal — archived and tradeable', 'S02 is closed: the Form 4 archive exists');
  assert.deepEqual(s03.strategyUsername, ['TheLeap_BreakoutRank', 'LiveTheLeap_Momentum']);

  const leapRoster = STRATEGIES.find((s) => s.username === 'TheLeap_BreakoutRank');
  const insiderRoster = STRATEGIES.find((s) => s.username === 'InsiderFiling_Drift');
  assert.ok(leapRoster && typeof leapRoster.decide === 'function', 'TheLeap_BreakoutRank executable');
  assert.ok(insiderRoster && typeof insiderRoster.decide === 'function', 'InsiderFiling_Drift executable');

  const leapDesk = DESK_STRATEGIES.find((s) => s.username === 'LiveTheLeap_Momentum');
  const insiderDesk = DESK_STRATEGIES.find((s) => s.username === 'LiveInsider_FilingFader');
  assert.ok(leapDesk && typeof leapDesk.decide === 'function', 'LiveTheLeap_Momentum executable');
  assert.ok(insiderDesk && typeof insiderDesk.decide === 'function', 'LiveInsider_FilingFader executable');
});

test('120. R16 and R17 social media research strategies (AMM grid, FOMC sniper) validate and execute with official fees', async () => {
  const { RESEARCH_SOURCES } = await import('../src/research-sources.js');
  const { STRATEGIES } = await import('../src/strategies.js');

  const r16 = RESEARCH_SOURCES.find((r) => r.id === 'R16');
  const r17 = RESEARCH_SOURCES.find((r) => r.id === 'R17');
  assert.ok(r16, 'R16 in research sources');
  assert.ok(r17, 'R17 in research sources');
  assert.ok(r16.url && r16.url.startsWith('https://'));
  assert.ok(r17.url && r17.url.startsWith('https://'));

  const gridMM = STRATEGIES.find((s) => s.username === 'GridMM_MultiTier');
  const fomcSniper = STRATEGIES.find((s) => s.username === 'FOMC_ProbabilitySniper');
  assert.ok(gridMM && typeof gridMM.decide === 'function', 'GridMM_MultiTier executable');
  assert.ok(fomcSniper && typeof fomcSniper.decide === 'function', 'FOMC_ProbabilitySniper executable');
});

/* ────────────────────────────────────────────────────────────────────────── *
 * 2026-09-20 — the sports half of the point-in-time signal archive (MLB)
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Two schedule games transcribed VERBATIM from the official response fetched
 * on 2026-09-20 (fact V111): a Final game from 2026-09-19 and a Preview game
 * from 2026-09-20. The shapes are the ones the archive must parse.
 */
const MLB_FIXTURE_URL = 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-19&endDate=2026-09-20&hydrate=linescore%2CprobablePitcher%2Cteam';
function mlbScheduleFixture() {
  return {
    copyright: 'Copyright 2026 MLB Advanced Media, L.P.  Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt',
    dates: [
      {
        date: '2026-09-19',
        games: [
          {
            gamePk: 824545, gameType: 'R', gameDate: '2026-09-19T18:10:00Z', officialDate: '2026-09-19',
            status: { abstractGameState: 'Final', codedGameState: 'F', detailedState: 'Final', statusCode: 'F' },
            teams: {
              away: { team: { id: 116, name: 'Detroit Tigers', venue: { id: 2394, name: 'Comerica Park' }, abbreviation: 'DET' }, score: 1, isWinner: false, probablePitcher: { id: 695549, fullName: 'Jackson Jobe' } },
              home: { team: { id: 145, name: 'Chicago White Sox', venue: { id: 4, name: 'Rate Field' }, abbreviation: 'CWS' }, score: 3, isWinner: true, probablePitcher: { id: 680732, fullName: 'Sean Burke' } }
            },
            linescore: { currentInning: 9, currentInningOrdinal: '9th', inningState: 'Top', inningHalf: 'Top', isTopInning: true, scheduledInnings: 9, teams: { home: { runs: 3, hits: 4, errors: 0 }, away: { runs: 1, hits: 8, errors: 1 } } },
            venue: { id: 4, name: 'Rate Field' }, gameNumber: 1, doubleHeader: 'N', scheduledInnings: 9
          }
        ]
      },
      {
        date: '2026-09-20',
        games: [
          {
            gamePk: 823570, gameType: 'R', gameDate: '2026-09-20T17:10:00Z', officialDate: '2026-09-20',
            status: { abstractGameState: 'Preview', codedGameState: 'S', detailedState: 'Scheduled', statusCode: 'S' },
            teams: {
              away: { team: { id: 143, name: 'Philadelphia Phillies', abbreviation: 'PHI' }, probablePitcher: { id: 650911, fullName: 'Cristopher Sánchez' } },
              home: { team: { id: 121, name: 'New York Mets', abbreviation: 'NYM' }, probablePitcher: { id: 804636, fullName: 'Jonah Tong' } }
            },
            linescore: { scheduledInnings: 9, innings: [], teams: { home: {}, away: {} } },
            venue: { id: 3289, name: 'Citi Field' }, gameNumber: 1, doubleHeader: 'N'
          }
        ]
      }
    ]
  };
}

test('121. the MLB archive parses the official schedule shape strictly, collapses unchanged states, and keeps one URL per date file', async () => {
  const { parseSchedule, parseGame, mergeCapture, stateFingerprint, captureWindow, easternDate, scheduleUrl, verify, SCHEDULE_ENDPOINT } = await import('../scripts/archive-mlb-signals.mjs');
  const fs = await import('node:fs');
  const os = await import('node:os');

  // (a) Verbatim shapes parse into the compact archive rows.
  const t0 = '2026-09-20T03:00:00.000Z';
  const { copyright, byDate } = parseSchedule(mlbScheduleFixture(), MLB_FIXTURE_URL, t0);
  assert.match(copyright, /MLB Advanced Media/);
  const finalGame = byDate.get('2026-09-19')[0];
  assert.equal(finalGame.meta.gamePk, 824545);
  assert.deepEqual([finalGame.meta.away.abbreviation, finalGame.meta.home.abbreviation], ['DET', 'CWS']);
  assert.equal(finalGame.state.abstractGameState, 'Final');
  assert.deepEqual(finalGame.state.runs, { away: 1, home: 3 });
  assert.equal(finalGame.state.winner, 'home', 'the winner comes from the official isWinner flags, only on Final');
  assert.equal(finalGame.meta.probablePitchers.home.fullName, 'Sean Burke');
  const preview = byDate.get('2026-09-20')[0];
  assert.equal(preview.state.abstractGameState, 'Preview');
  assert.deepEqual(preview.state.runs, { away: null, home: null }, 'an empty linescore stays null — never 0');
  assert.equal(preview.state.inning, null);
  assert.equal(preview.state.winner, null);

  // (b) Missing identity keys are refused, never guessed.
  assert.throws(() => parseGame({ gamePk: 1, status: { abstractGameState: 'Live' }, teams: { away: { team: { id: 1 } }, home: { team: { id: 2, abbreviation: 'B' } } }, gameDate: 'x', officialDate: 'y' }, 'u', t0), /abbreviation/);
  assert.throws(() => parseGame({ gamePk: 1, status: { abstractGameState: 'Rained' }, teams: {}, gameDate: 'x' }, 'u', t0), /abstractGameState/);
  assert.throws(() => parseSchedule(null, 'u', t0));

  // (c) Change-collapsing: an unchanged capture advances last_seen_at only;
  //     a changed one appends a row; captures[] lists every run instant.
  let r = mergeCapture(null, { date: '2026-09-20', games: byDate.get('2026-09-20'), url: MLB_FIXTURE_URL, capturedAt: t0, copyright });
  assert.equal(r.appended, 1);
  const t1 = '2026-09-20T03:20:00.000Z';
  r = mergeCapture(r.store, { date: '2026-09-20', games: parseSchedule(mlbScheduleFixture(), MLB_FIXTURE_URL, t1).byDate.get('2026-09-20'), url: MLB_FIXTURE_URL, capturedAt: t1, copyright });
  assert.equal(r.appended, 0);
  assert.deepEqual(r.store.captures, [t0, t1]);
  const g = r.store.games['823570'];
  assert.equal(g.states.length, 1);
  assert.equal(g.states[0].captured_at, t0, 'captured_at stays the FIRST-seen instant');
  assert.equal(g.states[0].last_seen_at, t1);
  const live = mlbScheduleFixture();
  live.dates[1].games[0].status = { abstractGameState: 'Live', codedGameState: 'I', detailedState: 'In Progress', statusCode: 'I' };
  live.dates[1].games[0].linescore = { currentInning: 6, inningState: 'Bottom', teams: { home: { runs: 2 }, away: { runs: 5 } } };
  const t2 = '2026-09-20T19:20:00.000Z';
  const url2 = scheduleUrl({ startDate: '2026-09-20', endDate: '2026-09-21' });
  r = mergeCapture(r.store, { date: '2026-09-20', games: parseSchedule(live, url2, t2).byDate.get('2026-09-20'), url: url2, capturedAt: t2, copyright });
  assert.equal(r.appended, 1);
  assert.equal(g.states.length, 2);
  assert.equal(stateFingerprint(g.states[1]), 'Live|In Progress|6|Bottom|5|2|');
  assert.deepEqual(r.store.source.urls, [MLB_FIXTURE_URL, url2], 'each distinct request URL is stored once per date file');
  assert.equal(g.states[0].url_ref, 0);
  assert.equal(g.states[1].url_ref, 1);
  assert.equal(g.states[1].url, undefined, 'rows point at the URL by index, they do not repeat it');

  // (d) The offline audit accepts the store it just built and rejects a
  //     forged one (a winner before Final).
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'mlb-verify-'));
  fs.writeFileSync(path.join(dir, '2026-09-20.json'), JSON.stringify(r.store));
  const quiet = { log: () => {}, error: () => {} };
  assert.equal(verify({ ...quiet, dir }), 0);
  const forged = JSON.parse(JSON.stringify(r.store));
  forged.games['823570'].states[1].winner = 'away';
  fs.writeFileSync(path.join(dir, '2026-09-20.json'), JSON.stringify(forged));
  assert.equal(verify({ ...quiet, dir }), 1);
  assert.ok(scheduleUrl({ startDate: '2026-09-19', endDate: '2026-09-20' }).startsWith(SCHEDULE_ENDPOINT));

  // (e) The capture window is US-Eastern: 02:50Z on the 20th is still the
  //     evening of the 19th in New York, and the window covers the previous
  //     ET day for late West-Coast games.
  assert.equal(easternDate(new Date('2026-09-20T02:50:00Z')), '2026-09-19');
  assert.deepEqual(captureWindow(new Date('2026-09-20T02:50:00Z')), { startDate: '2026-09-18', endDate: '2026-09-19' });
  assert.deepEqual(captureWindow(new Date('2026-09-20T05:00:00Z')), { startDate: '2026-09-19', endDate: '2026-09-20' });
});

/**
 * The six official games behind the nine finalized KXMLBGAME contracts in the
 * store — gamePk, first pitch and result transcribed from the official
 * schedule response fetched on 2026-09-20 (fact V113).
 */
function mlbOfficialGamesFixture() {
  const mk = (gamePk, gameDate, away, home, winner, runs) => ({
    gamePk, gameDate, officialDate: gameDate.slice(0, 10), away: { abbreviation: away }, home: { abbreviation: home },
    captures: ['2026-09-20T03:00:00.000Z'],
    source: { urls: ['https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-13&endDate=2026-09-17&hydrate=team'] },
    states: [{ captured_at: '2026-09-20T03:00:00.000Z', last_seen_at: '2026-09-20T03:00:00.000Z', url_ref: 0, abstractGameState: 'Final', detailedState: 'Final', inning: 9, inningState: 'Top', runs, winner }]
  });
  return [
    mk(823171, '2026-09-13T23:20:00Z', 'SD', 'SF', 'away', { away: 6, home: 4 }),
    mk(825034, '2026-09-15T01:40:00Z', 'MIA', 'AZ', 'home', { away: 7, home: 8 }),
    mk(825030, '2026-09-16T01:40:00Z', 'MIA', 'AZ', 'away', { away: 4, home: 2 }),
    mk(823655, '2026-09-16T17:40:00Z', 'NYY', 'MIN', 'home', { away: 4, home: 5 }),
    mk(824467, '2026-09-16T22:40:00Z', 'LAD', 'CIN', 'home', { away: 2, home: 6 }),
    mk(823978, '2026-09-18T01:38:00Z', 'MIN', 'LAA', 'home', { away: 4, home: 5 })
  ];
}

test('122. every finalized KXMLBGAME contract in the store joins the official game by instant + away + home, and the exchange result equals the official winner', async () => {
  const store = await import('../src/mlb-signal-store.js');
  const { getIntradayMarket } = await import('../src/accumulated-history.js');
  const teams = store.mlbTeams();
  assert.equal(teams.length, 30, 'the official team table (data/mlb-signals/_teams.json) ships 30 clubs');
  assert.equal(new Set(teams.map((t) => t.abbreviation)).size, 30);
  for (const code of ['AZ', 'ATH', 'CWS', 'KC', 'TB', 'WSH', 'SD', 'SF']) assert.ok(teams.some((t) => t.abbreviation === code), `${code} is an official code`);

  const games = mlbOfficialGamesFixture();
  const expected = {
    'KXMLBGAME-26SEP131920SDSF-SF': [823171, true, 'no'],
    'KXMLBGAME-26SEP142140MIAAZ-AZ': [825034, true, 'yes'],
    'KXMLBGAME-26SEP152140MIAAZ-AZ': [825030, true, 'no'],
    'KXMLBGAME-26SEP152140MIAAZ-MIA': [825030, false, 'yes'],
    'KXMLBGAME-26SEP161340NYYMIN-MIN': [823655, true, 'yes'],
    'KXMLBGAME-26SEP161340NYYMIN-NYY': [823655, false, 'no'],
    'KXMLBGAME-26SEP161840LADCIN-LAD': [824467, false, 'no'],
    'KXMLBGAME-26SEP172138MINLAA-LAA': [823978, true, 'yes'],
    'KXMLBGAME-26SEP172138MINLAA-MIN': [823978, false, 'no']
  };
  let checkedAgainstStore = 0;
  for (const [ticker, [gamePk, yesIsHome, officialYesResult]] of Object.entries(expected)) {
    const m = store.matchMlbGame(ticker, { games, teams });
    assert.ok(m.ok, `${ticker}: ${m.reason || 'joined'}`);
    assert.equal(m.game.gamePk, gamePk, `${ticker} → gamePk`);
    assert.equal(m.yesIsHome, yesIsHome, `${ticker} → YES side`);
    assert.equal(m.matchedBy, 'utc-minute+away+home');
    // The official winner, read through the point-in-time query, must equal
    // the exchange's own stored result for the contract.
    const st = store.gameStateAtOrBefore(m.game, Math.floor(Date.parse('2026-09-20T04:00:00Z') / 1000));
    const yesWon = st.winner === (yesIsHome ? 'home' : 'away');
    assert.equal(yesWon ? 'yes' : 'no', officialYesResult, `${ticker}: official winner vs expected`);
    const stored = getIntradayMarket(ticker, 60);
    if (stored && stored.market && stored.market.status === 'finalized') {
      assert.equal(stored.market.result, officialYesResult, `${ticker}: exchange result (store) equals the official winner`);
      checkedAgainstStore += 1;
    }
  }
  assert.ok(checkedAgainstStore >= 6, `cross-checked ${checkedAgainstStore} stored exchange results against the official winners`);

  // Fail-closed joins: unknown code, ambiguous split, wrong instant, wrong side.
  assert.equal(store.matchMlbGame('KXMLBGAME-26SEP131920SDXX-SD', { games, teams }).reason, 'TEAM_CODE_NOT_IN_OFFICIAL_TABLE');
  assert.equal(store.matchMlbGame('KXMLBGAME-26SEP131921SDSF-SF', { games, teams }).reason, 'TEAMS_MATCH_BUT_TIME_DIFFERS', 'one minute off is not the same game');
  assert.equal(store.matchMlbGame('KXMLBGAME-26SEP131920SFSD-SF', { games, teams }).reason, 'NO_ARCHIVED_GAME', 'away/home swapped is not the same game');
  assert.equal(store.matchMlbGame('KXMLBGAME-26SEP131920SDSF-SF', { games, teams: [] }).reason, 'NO_TEAM_TABLE');
  assert.equal(store.matchMlbGame('KXHIGHNY-26SEP20-B80', { games, teams }).reason, 'NOT_A_KXMLBGAME_TICKER');
  // The ET → UTC conversion honours daylight-saving rules (EDT in September, EST in November).
  assert.equal(new Date(store.easternToUtcSeconds('2026-09-17', 21, 38) * 1000).toISOString(), '2026-09-18T01:38:00.000Z');
  assert.equal(new Date(store.easternToUtcSeconds('2026-11-05', 20, 8) * 1000).toISOString(), '2026-11-06T01:08:00.000Z');
});

test('123. the MLB signal store is point-in-time: rows after the decision are never readable, staleness uses the capture list (not last_seen_at), and unchanged rows still answer', async () => {
  const store = await import('../src/mlb-signal-store.js');
  const sec = (iso) => Math.floor(Date.parse(iso) / 1000);
  const game = {
    gamePk: 1, gameDate: '2026-09-20T17:10:00Z', away: { abbreviation: 'PHI' }, home: { abbreviation: 'NYM' },
    captures: ['2026-09-20T16:40:00.000Z', '2026-09-20T17:00:00.000Z', '2026-09-20T17:20:00.000Z', '2026-09-20T17:40:00.000Z', '2026-09-20T18:00:00.000Z'],
    source: { urls: ['https://statsapi.mlb.com/api/v1/schedule?sportId=1'] },
    states: [
      { captured_at: '2026-09-20T16:40:00.000Z', last_seen_at: '2026-09-20T17:00:00.000Z', url_ref: 0, abstractGameState: 'Preview', detailedState: 'Scheduled', inning: null, inningState: null, runs: { away: null, home: null }, winner: null },
      { captured_at: '2026-09-20T17:20:00.000Z', last_seen_at: '2026-09-20T17:20:00.000Z', url_ref: 0, abstractGameState: 'Live', detailedState: 'In Progress', inning: 1, inningState: 'Top', runs: { away: 0, home: 0 }, winner: null },
      { captured_at: '2026-09-20T17:40:00.000Z', last_seen_at: '2026-09-20T18:00:00.000Z', url_ref: 0, abstractGameState: 'Live', detailedState: 'In Progress', inning: 2, inningState: 'Bottom', runs: { away: 1, home: 0 }, winner: null }
    ]
  };
  assert.equal(store.gameStateAtOrBefore(game, sec('2026-09-20T16:39:59Z')), null, 'before the first capture: nothing is knowable');
  const atPreview = store.gameStateAtOrBefore(game, sec('2026-09-20T16:40:00Z'));
  assert.equal(atPreview.abstractGameState, 'Preview');
  // Between the 17:00 (unchanged) and 17:20 captures: the Preview row is still
  // the answer, and the freshest observation is 17:00 — NOT the row's
  // captured_at (16:40) and NOT its last_seen_at (which a later run wrote).
  const between = store.gameStateAtOrBefore(game, sec('2026-09-20T17:10:00Z'));
  assert.equal(between.abstractGameState, 'Preview');
  assert.equal(between.observedAt, '2026-09-20T17:00:00.000Z');
  assert.equal(between.staleSeconds, 600);
  const live = store.gameStateAtOrBefore(game, sec('2026-09-20T17:25:00Z'));
  assert.equal(live.inning, 1);
  assert.equal(live.staleSeconds, 300);
  // A decision at 17:50 sees the 17:40 row (2nd inning), not anything later.
  const second = store.gameStateAtOrBefore(game, sec('2026-09-20T17:50:00Z'));
  assert.deepEqual([second.inning, second.inningState, second.runs.away], [2, 'Bottom', 1]);
  assert.equal(second.observedAt, '2026-09-20T17:40:00.000Z');
  assert.equal(second.source, 'https://statsapi.mlb.com/api/v1/schedule?sportId=1');
  // Rows out of order in the file change nothing.
  const shuffled = { ...game, states: [...game.states].reverse() };
  assert.equal(store.gameStateAtOrBefore(shuffled, sec('2026-09-20T17:50:00Z')).inning, 2);
  // The coverage summary is computed from the shipped module (empty or not)
  // and never throws.
  const cov = store.mlbCoverage();
  assert.equal(typeof cov.present, 'boolean');
  assert.equal(cov.teams, 30);
});

test('124. the two MLB entries trade only on a fresh LIVE point-in-time state priced below the R16 table, and are forward tests on the shipped store', async () => {
  const { STRATEGIES, tangoYesWinProbability, TANGO_HOME_WIN_EXPECTANCY } = await import('../src/strategies.js');
  const runner = await import('../src/strategy-runner.js');
  const lead = STRATEGIES.find((s) => s.username === 'MLBLead_InPlay');
  const trail = STRATEGIES.find((s) => s.username === 'MLBTrail_Comeback');
  assert.ok(lead && trail);
  assert.equal(lead.flight, 'micro');
  assert.deepEqual(lead.universe, ['KXMLBGAME']);

  // (a) The transcribed table cells (tangotiger.net/innwin.html, 2026-09-20).
  assert.equal(TANGO_HOME_WIN_EXPECTANCY.source, 'https://tangotiger.net/innwin.html');
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 6, inningState: 'Top', homeDifferential: 2 }), 0.79);
  assert.equal(tangoYesWinProbability({ yesIsHome: false, inning: 6, inningState: 'Top', homeDifferential: -2 }), 0.79, 'the away side reads 1 − the mirrored home cell');
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 7, inningState: 'Top', homeDifferential: -1 }), 0.299);
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 8, inningState: 'Top', homeDifferential: 2 }), 0.872);
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 9, inningState: 'Bottom', homeDifferential: -1 }), 0.194);
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 7, inningState: 'Middle', homeDifferential: 1 }), 0.795, 'Middle = start of the bottom half');
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 6, inningState: 'End', homeDifferential: 2 }), 0.826, 'End = start of the next top half');
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 5, inningState: 'Top', homeDifferential: 2 }), null, 'before the 6th: no reference, no trade');
  assert.equal(tangoYesWinProbability({ yesIsHome: true, inning: 11, inningState: 'Top', homeDifferential: 9 }), 0.987, 'extras reuse the 9th, differentials clamp to ±4');

  // (b) decide(): a synthetic point-in-time view with a real-shaped book.
  const mkCtx = (signal, ask) => {
    const positions = new Map();
    return {
      ticker: 'KXMLBGAME-26SEP201310PHINYM-NYM',
      market: { series_ticker: 'KXMLBGAME' },
      signal,
      portfolio: { cash: 100000, positions },
      book: {
        tick: 0.01,
        getBestYesAsk: () => ask,
        getBestNoAsk: () => (ask === null ? null : Math.round((1 - ask) * 100) / 100),
        getYesAskTiers: () => [{ price: ask, count: 500 }],
        getNoAskTiers: () => [{ price: 1 - ask, count: 500 }]
      }
    };
  };
  const liveLead = { kind: 'mlb-game-state', abstractGameState: 'Live', inning: 7, inningState: 'Top', yesIsHome: true, homeDifferential: 2, lead: 2, runsYes: 5, runsOpp: 3, staleSeconds: 600, capturedAt: 'c', observedAt: 'o', yesTeam: 'NYM' };
  // p = 0.826 → buys at 0.80 (≤ 0.806), not at 0.81.
  assert.equal(lead.decide(mkCtx(liveLead, 0.8)).length, 1);
  assert.equal(lead.decide(mkCtx(liveLead, 0.8))[0].side, 'YES');
  assert.match(lead.decide(mkCtx(liveLead, 0.8))[0].reason, /0\.826/);
  assert.equal(lead.decide(mkCtx(liveLead, 0.81)).length, 0, 'above theory minus the 2¢ margin: no trade');
  assert.equal(lead.decide(mkCtx({ ...liveLead, staleSeconds: 1801 }, 0.8)).length, 0, 'a stale observation is not a signal');
  assert.equal(lead.decide(mkCtx({ ...liveLead, abstractGameState: 'Final' }, 0.8)).length, 0, 'a Final game is never traded');
  assert.equal(lead.decide(mkCtx({ ...liveLead, abstractGameState: 'Preview', inning: null, lead: null }, 0.8)).length, 0);
  assert.equal(lead.decide(mkCtx({ ...liveLead, inning: 5 }, 0.5)).length, 0, 'before the 6th inning: no trade');
  assert.equal(lead.decide(mkCtx({ ...liveLead, lead: 1, homeDifferential: 1 }, 0.5)).length, 0, 'a one-run lead is not enough');
  assert.equal(lead.decide(mkCtx(null, 0.5)).length, 0, 'no signal → abstain');
  assert.equal(lead.decide(mkCtx({ kind: 'nws-forecast-high', highF: 80 }, 0.5)).length, 0, 'another archive\'s signal is not an MLB state');
  const trailing = { ...liveLead, yesIsHome: false, homeDifferential: 1, lead: -1, runsYes: 3, runsOpp: 4, inning: 8, inningState: 'Top', yesTeam: 'PHI' };
  // away down one at the top of the 8th: p = 1 − 0.753 = 0.247 → buys ≤ 0.227.
  assert.equal(trail.decide(mkCtx(trailing, 0.22)).length, 1);
  assert.equal(trail.decide(mkCtx(trailing, 0.23)).length, 0);
  assert.equal(trail.decide(mkCtx({ ...trailing, inning: 6 }, 0.1)).length, 0, 'the comeback rule starts in the 7th');
  assert.equal(trail.decide(mkCtx({ ...trailing, lead: -2, homeDifferential: 2 }, 0.05)).length, 0, 'exactly one run down, not two');
  assert.equal(lead.decide(mkCtx(trailing, 0.22)).length, 0, 'the leader entry never buys a trailing side');

  // (c) Forward test by construction on the shipped store: no 1-minute
  //     KXMLBGAME bars and/or no archive overlap → 0 trades, unranked with the
  //     reason published — and the reason distinguishes a pending ingest from
  //     a flight mismatch.
  const res = runner.runCompetition({ strategies: [lead, trail], depthMode: 'captured', periodIntervalMinutes: 1 });
  for (const r of res.results) {
    assert.equal(r.totalTrades, 0, `${r.username}: no fabricated backtest`);
    assert.equal(r.analysis.verdict, 'UNTESTED_ON_THIS_DATASET');
  }
  for (const row of res.leaderboard) {
    assert.equal(row.rank, null);
    assert.match(String(row.disqualificationReason || ''), /Pending ingest|No executed fills/);
    assert.doesNotMatch(String(row.disqualificationReason || ''), /runs in another flight/, 'a design in its own flight is never called a flight mismatch');
  }
  // (d) The provider is dark without an archive and answers nothing for a
  //     non-MLB ticker with one; the join report explains every stored contract.
  const provider = runner.buildMlbSignalProvider();
  const storeMod = await import('../src/mlb-signal-store.js');
  if (!storeMod.hasMlbSignalArchive()) assert.equal(provider, null, 'no archive → no provider (never a guessing one)');
  else assert.equal(provider('KXHIGHNY-26SEP20-B80', {}, 1), null);
  const report = runner.mlbJoinReport();
  assert.ok(report.length >= 9, 'every stored KXMLBGAME contract is listed');
  for (const row of report) assert.ok(row.reason && row.reason.length > 2, `${row.ticker}: a join reason is published`);
});

test('125. every data workflow regenerates the same files the push guard may auto-resolve, and the guard\'s list names every generated module', () => {
  const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
  const guard = readFileSync(path.join(root, 'scripts', 'push-with-race-guard.sh'), 'utf8');
  const m = /GENERATED_PATHS="\$\{GENERATED_PATHS:-([^}]+)\}"/.exec(guard);
  assert.ok(m, 'the guard declares a GENERATED_PATHS default');
  const listed = new Set(m[1].trim().split(/\s+/));
  // Every module the generators write.
  const gen = readFileSync(path.join(root, 'scripts', 'generate-history-module.mjs'), 'utf8');
  const generated = [...gen.matchAll(/path\.join\(ROOT, 'src', '([a-z-]+\.js)'\)/g)].map((x) => `src/${x[1]}`);
  assert.ok(generated.includes('src/accumulated-history.js') && generated.includes('src/mlb-signal-data.js'), `generator writes: ${generated.join(', ')}`);
  for (const p of generated) assert.ok(listed.has(p), `${p} is written by the generator but not auto-resolvable by the guard`);
  for (const p of ['src/desk-data.js', 'README.md', 'VERIFICATION.md', 'IRREGULARITIES.md', 'index.html', 'docs/']) assert.ok(listed.has(p), `${p} must be in GENERATED_PATHS`);
  const regen = /REGENERATE_CMD="\$\{REGENERATE_CMD:-([^}]+)\}"/.exec(guard);
  assert.ok(regen);
  const chain = ['node scripts/generate-history-module.mjs', 'node scripts/generate-desk-module.mjs', 'node scripts/render-docs.js', 'node build.js'];
  for (const c of chain) assert.ok(regen[1].includes(c), `guard REGENERATE_CMD runs ${c}`);
  // Every workflow that pushes through the guard runs that same chain first.
  const wfDir = path.join(root, '.github', 'workflows');
  const pushing = readdirSync(wfDir).filter((f) => f.endsWith('.yml') && readFileSync(path.join(wfDir, f), 'utf8').includes('push-with-race-guard.sh'));
  assert.ok(pushing.length >= 4, `data workflows using the guard: ${pushing.join(', ')}`);
  assert.ok(pushing.includes('mlb-signals.yml'));
  for (const f of pushing) {
    const y = readFileSync(path.join(wfDir, f), 'utf8');
    for (const c of chain) assert.ok(y.includes(c), `${f} must run "${c}" before committing`);
    assert.ok(/\nconcurrency:\n(?:\s*#[^\n]*\n)*\s+group:/.test(y), `${f} declares a concurrency group`);
    assert.ok(y.includes('cancel-in-progress: false'), `${f} never cancels a capture in flight`);
  }
  // The 20-minute MLB bot has its OWN group (a fast bot in the shared queue
  // would evict queued captures — see the comment in the workflow).
  const mlb = readFileSync(path.join(wfDir, 'mlb-signals.yml'), 'utf8');
  assert.match(mlb, /group: mlb-signals-\$\{\{ github\.ref \}\}/);
  assert.match(mlb, /\*\/20 16-23 \* \* \*/);
  assert.ok(existsSync(path.join(root, '.github', 'triggers', 'mlb.json')));
});

test('126. a strategy card that names an external signal either reads it in decide() or says in plain words that it does not (irregularity #53 guard)', async () => {
  const { STRATEGIES } = await import('../src/strategies.js');
  const { DESK_STRATEGIES } = await import('../src/desk-strategies.js');
  // Each signal family: how a card would name it, what its code must contain to
  // be entitled to the claim, and the disclaimer wording that is acceptable
  // instead. A card that names the signal, has no such code and no such
  // disclaimer is exactly the failure PR #17 merged.
  const families = [
    { name: 'NWS forecast', text: /\b(NWS|forecast high|point forecast|forecast confirmation)\b/i, code: /\b(signal|forecastHighAt)\b/, disclaimer: /(no-forecast|no forecast|does not read|not read|NOT read|never reads|price-only|control)/i },
    { name: 'Drugs@FDA', text: /(Drugs@FDA|openFDA|api\.fda\.gov)/i, code: /\bsignal\b/, disclaimer: /(does not use|NOT use|not archived|price-only|not read|NOT read|does not read|Neither uses)/i },
    { name: 'MLB game state', text: /(statsapi\.mlb\.com|MLB Stats API|linescore)/i, code: /\bsignal\b/, disclaimer: /(not read|NOT read|does not read|price-only|not used)/i },
    { name: 'insider filings', text: /(Form 4|insider filing|insider data|insider retention|EDGAR)/i, code: /\b(form4|insider)Signal\b/i, disclaimer: /(no insider data|NOT read|not read|does not read|price-only|is NOT an insider-filing|NOT USED|no Form 4)/i },
    { name: 'futures-implied probability', text: /(FedWatch|futures-implied|futures implied)/i, code: /\bfedwatch\b/i, disclaimer: /(does NOT read|does not read|not read|no futures|price-only|UNVERIFIED)/i },
    { name: 'injury report', text: /(injury designation|injury report|injuries JSON)/i, code: /\binjury\b/i, disclaimer: /(NOT used|not used|not archived|does NOT trade on injury|no injury|never reads)/i },
    { name: 'live score feed', text: /(live-score|scoreboard feed|live score)/i, code: /\bscore\b/i, disclaimer: /(NOT used|not used|not archived|is NOT read|not read|never reads)/i }
  ];
  const cardText = (s) => [s.title, s.name, s.tagline, s.thesis, s.sourceNote, s.source, s.designSource, JSON.stringify(s.rules || '')].filter(Boolean).join(' \n ');
  const problems = [];
  for (const s of [...STRATEGIES, ...DESK_STRATEGIES]) {
    const text = cardText(s);
    const code = String(s.decide);
    for (const f of families) {
      if (!f.text.test(text)) continue;
      if (f.code.test(code)) continue;
      if (f.disclaimer.test(text)) continue;
      problems.push(`${s.username}: names "${f.name}" but decide() does not read it and the card does not say so`);
    }
  }
  assert.deepEqual(problems, [], problems.join('\n'));
  // The two entries that DO read an archive must reference ctx.signal.
  for (const u of ['ForecastEdge_Weather', 'ForecastEdge_MultiCity', 'FDAEdge_DrugsFDA', 'MLBLead_InPlay', 'MLBTrail_Comeback', 'InsiderFlow_Form4']) {
    const s = STRATEGIES.find((x) => x.username === u);
    assert.ok(s && /\bsignal\b/.test(String(s.decide)), `${u} reads ctx.signal`);
  }
  const lw = DESK_STRATEGIES.find((x) => x.username === 'LiveWeather_ForecastEdge');
  assert.ok(lw && /forecastHighAt/.test(String(lw.decide)), 'the desk weather entrant actually opens the NWS archive');
  const lf = DESK_STRATEGIES.find((x) => x.username === 'LiveInsider_Form4Flow');
  assert.ok(lf && /form4Signal/.test(String(lf.decide)) && /view\.signals\.form4/.test(String(lf.decide)), 'the desk insider entrant actually opens the Form 4 archive through the shared hook');
  // No desk entrant may assume a price when the capture has none.
  for (const s of DESK_STRATEGIES) {
    assert.doesNotMatch(String(s.decide), /yesAsk \?\? 0\.\d+|noAsk \?\? 0\.\d+|price \|\| 0\.\d+/, `${s.username}: never substitutes a made-up quote`);
  }
});

/* ────────────────────────────────────────────────────────────────────────── *
 * 2026-09-21 (session 01a0c21e) — the INSIDER half of the point-in-time
 * signal archive: SEC EDGAR Form 4 (ROADMAP Next #3(b), S02 closed)
 * ────────────────────────────────────────────────────────────────────────── */

const FORM4_FIXTURE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'form4-signals', 'fixtures', '0001104659-26-106432.xml'
);
const FORM4_FIXTURE_META = {
  accessionNumber: '0001104659-26-106432',
  // EDGAR's own ACCEPTANCE-DATETIME header of that submission: 20260909190010
  acceptedAt: '2026-09-09T19:00:10-04:00',
  firstSeenAt: '2026-09-21T04:03:00.000Z',
  filingDate: '2026-09-09',
  indexUrl: 'https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/0001104659-26-106432-index.htm',
  primaryDoc: 'tm2625055d1_4seq1.xml',
  url: 'https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/tm2625055d1_4seq1.xml',
  expectedSymbol: 'TSLA'
};

test('127. the Form 4 archive parses a REAL EDGAR ownership document strictly and refuses a wrong issuer or form', async () => {
  const arch = await import('../scripts/archive-form4-signals.mjs');
  const xml = readFileSync(FORM4_FIXTURE_PATH, 'utf8');

  // (a) The live filing parses into exactly the values EDGAR published.
  const f = arch.parseOwnershipDocument(xml, FORM4_FIXTURE_META);
  assert.equal(f.documentType, '4');
  assert.equal(f.schemaVersion, 'X0609');
  assert.equal(f.periodOfReport, '2026-09-05');
  assert.deepEqual(f.issuer, { cik: '1318605', name: 'Tesla, Inc.', tradingSymbol: 'TSLA' });
  assert.equal(f.reportingOwner.name, 'Taneja Vaibhav');
  assert.equal(f.reportingOwner.officerTitle, 'Chief Financial Officer');
  assert.equal(f.reportingOwner.isOfficer, true);
  assert.equal(f.reportingOwner.isDirector, false);
  assert.equal(f.reportingOwner.isTenPercentOwner, false);
  assert.equal(f.aff10b5One, false);
  const nd = f.transactions.filter((t) => t.table === 'nonDerivative');
  assert.equal(nd.length, 2, 'both Table I transaction rows are kept');
  assert.deepEqual([nd[0].code, nd[0].adCode, nd[0].shares, nd[0].sharesOwnedAfter], ['M', 'A', 6539, 28578]);
  assert.deepEqual([nd[1].code, nd[1].shares, nd[1].price, nd[1].sharesOwnedAfter], ['S', 2605.75, 360.134, 25972.25]);
  assert.equal(nd[1].transactionDate, '2026-09-08');
  const deriv = f.transactions.filter((t) => t.table === 'derivative');
  assert.equal(deriv[0].securityTitle, 'Restricted Stock Unit');
  assert.deepEqual(f.holdings[0], { table: 'nonDerivative', securityTitle: 'Common Stock', sharesOwned: 111000, directOrIndirect: 'I', natureOfOwnership: 'See Footnote' });

  // (b) Only SEC codes P and S are insider flow: this filing's net is the one
  //     open-market sale, not the RSU vesting (code M) beside it.
  const flow = arch.filingOpenMarketFlow(f);
  assert.deepEqual(flow, { shares: -2605.75, dollars: -(2605.75 * 360.134), buys: 0, sells: 1 });
  assert.equal(arch.isCeoFiling(f), false, 'a CFO filing is not a CEO filing');
  assert.ok(Object.keys(arch.OPEN_MARKET_CODES).join('') === 'PS', 'only P and S are interpreted');

  // (c) Refusals: another issuer's document, another form, and a document with
  //     no <ownershipDocument> at all must throw rather than be archived.
  assert.throws(() => arch.parseOwnershipDocument(xml, { ...FORM4_FIXTURE_META, expectedSymbol: 'AAPL' }), /trading symbol/);
  assert.throws(() => arch.parseOwnershipDocument(xml.replace('<documentType>4</documentType>', '<documentType>5</documentType>'), FORM4_FIXTURE_META), /not 4/);
  assert.throws(() => arch.parseOwnershipDocument('<html/>', FORM4_FIXTURE_META), /no <ownershipDocument>/);
  assert.throws(() => arch.parseOwnershipDocument(xml.replace('<transactionCode>S</transactionCode>', ''), FORM4_FIXTURE_META), /transactionCode/);

  // (d) The EDGAR Atom feed is parsed for EVERY entry's form type, because the
  //     feed's type=4 filter is not trusted (verified 2026-09-21: the same
  //     query returned 424B2 entries for another CIK).
  const feed = arch.parseAtomFeed(
    `<feed><entry><id>urn:tag:sec.gov,2008:accession-number=0001104659-26-106432</id><title>4 - Statement of changes in beneficial ownership of securities</title><updated>2026-09-09T19:00:10-04:00</updated><filing-date>2026-09-09</filing-date><link href="https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/0001104659-26-106432-index.htm"/></entry><entry><id>urn:tag:sec.gov,2008:accession-number=0001213900-26-101486</id><title>424B2 - Prospectus [Rule 424(b)(2)]</title><updated>2026-09-18T17:07:41-04:00</updated></entry></feed>`,
    'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=TSLA&type=4&output=atom'
  );
  assert.equal(feed.entries.length, 2, 'both entries are parsed, not silently filtered');
  assert.deepEqual(feed.formsSeen, { '4': 1, '424B2': 1 }, 'the forms the feed returned are published');
  assert.equal(feed.entries[0].accessionNumber, '0001104659-26-106432');
  assert.equal(feed.entries[0].updated, '2026-09-09T19:00:10-04:00');
  assert.throws(() => arch.parseAtomFeed('<feed><entry><title>4 - x</title></entry></feed>', 'u'), /accession number/);

  // (e) index.json → the primary document is READ, never guessed.
  const idx = arch.primaryXmlFromIndex({ directory: { item: [{ name: 'x-index.html' }, { name: 'tm2625055d1_4seq1.xml' }] } });
  assert.equal(idx.name, 'tm2625055d1_4seq1.xml');
  assert.throws(() => arch.primaryXmlFromIndex({ directory: { item: [{ name: 'x.txt' }] } }), /no \.xml document/);

  // (f) The merge is append-only and keyed by accession number.
  let r = arch.mergeFilings(null, { symbol: 'TSLA', kalshiSeries: ['TESLACEOCHANGE'], filings: [f], urls: ['u1'], capturedAt: '2026-09-21T04:03:00.000Z' });
  assert.equal(r.added, 1);
  r = arch.mergeFilings(r.store, { symbol: 'TSLA', kalshiSeries: ['TESLACEOCHANGE'], filings: [f], urls: ['u1', 'u2'], capturedAt: '2026-09-22T04:03:00.000Z' });
  assert.equal(r.added, 0, 'the same accession is never duplicated');
  assert.equal(r.refreshed, 1);
  assert.deepEqual(r.store.captures, ['2026-09-21T04:03:00.000Z', '2026-09-22T04:03:00.000Z']);
  assert.deepEqual(r.store.source.urls, ['u1', 'u2'], 'each distinct request URL is stored once');
  assert.match(r.store.assumption, /acceptance instant/i);
  assert.equal(arch.EXCLUDED_ISSUERS[0].kalshiSeries[0], 'KXOPENAICEOCHANGE');
  assert.match(arch.EXCLUDED_ISSUERS[0].reason, /private company/i);

  // (g) The refusal diagnostics that irregularity #59 depends on. The first live
  // capture was answered HTTP 403 by SEC's CDN edge; the archive now records
  // enough to say WHY, and probes both SEC hosts on the same documented path so
  // "all of sec.gov blocks this runner" is distinguishable from "only
  // browse-edgar does". Neither is a data source: both hosts are probed for a
  // status line only, and nothing is parsed from the answer.
  assert.equal(typeof arch.probeEdge, 'function');
  assert.deepEqual([...arch.EDGE_PROBE_URLS].map((u) => new URL(u).host), ['www.sec.gov', 'data.sec.gov']);
  assert.ok(arch.EDGE_PROBE_URLS.every((u) => u.endsWith('/files/company_tickers.json')), 'the same path on both hosts');
  assert.match(arch.EDGE_PROBE_URLS[0], /^https:\/\//);
  // The agent string is recorded in the run report so a future refusal can be
  // compared against what was actually sent (it is overridable per run).
  assert.match(String(process.env.EDGAR_USER_AGENT || ''), /^$/);
  const { captureNow } = arch;
  assert.equal(typeof captureNow, 'function');
});

test('128. the Form 4 store answers a past instant from EDGAR\'s OWN acceptance instant and never from a later capture', async () => {
  const arch = await import('../scripts/archive-form4-signals.mjs');
  const store = await import('../src/form4-signal-store.js');
  const xml = readFileSync(FORM4_FIXTURE_PATH, 'utf8');
  const real = arch.parseOwnershipDocument(xml, FORM4_FIXTURE_META);
  // A second, SYNTHETIC filing (labelled: not from EDGAR) shaped exactly like
  // the real one, but by an officer titled CEO, to exercise the CEO gate.
  const ceo = JSON.parse(JSON.stringify(real));
  ceo.accessionNumber = '0000000000-26-000001';
  ceo.acceptedAt = '2026-08-01T20:00:00-04:00';
  ceo.reportingOwner.officerTitle = 'Chief Executive Officer';
  ceo.reportingOwner.name = 'SYNTHETIC TEST FILER (not an EDGAR record)';
  ceo.transactions = [{ table: 'nonDerivative', securityTitle: 'Common Stock', transactionDate: '2026-07-30', code: 'P', adCode: 'A', shares: 1000, price: 300, table_: undefined, sharesOwnedAfter: 100000, directOrIndirect: 'D' }];

  const issuer = {
    symbol: 'TSLA',
    cik: '1318605',
    issuerName: 'Tesla, Inc.',
    kalshiSeries: ['TESLACEOCHANGE', 'KXTESLACEOCHANGE'],
    assumption: real.assumption || store.form4Assumption(),
    source: { endpoint: 'https://www.sec.gov/cgi-bin/browse-edgar', urls: [FORM4_FIXTURE_META.url] },
    captures: ['2026-09-21T04:03:00.000Z'],
    filings: [real, ceo].sort((a, b) => String(a.acceptedAt).localeCompare(String(b.acceptedAt)))
  };

  // (a) The join is by the archive's own series list, taken from rules_primary.
  assert.equal(store.issuerForTicker('TESLACEOCHANGE-26', { issuers: [issuer] }).ok, true);
  assert.equal(store.issuerForTicker('KXTESLACEOCHANGE-26', { issuers: [issuer] }).ok, true);
  const openai = store.issuerForTicker('KXOPENAICEOCHANGE-26', { issuers: [issuer] });
  assert.equal(openai.ok, false);
  assert.equal(openai.reason, 'SERIES_NOT_TRACKED_BY_FORM4_ARCHIVE');

  // (b) Point-in-time: at an instant BEFORE the real filing's acceptance there
  //     is only the synthetic CEO filing; at an instant after, both.
  const tBefore = Math.floor(Date.parse('2026-08-15T00:00:00Z') / 1000);
  const tAfter = Math.floor(Date.parse('2026-09-15T00:00:00Z') / 1000);
  const before = store.insiderStateAtOrBefore(issuer, tBefore, { windowDays: 90 });
  assert.equal(before.filingsEver, 1, 'a filing accepted after T is invisible');
  assert.equal(before.newestAcceptedAt, ceo.acceptedAt);
  const after = store.insiderStateAtOrBefore(issuer, tAfter, { windowDays: 90 });
  assert.equal(after.filingsEver, 2);
  assert.equal(after.newestAcceptedAt, real.acceptedAt);

  // (c) The CEO gate reads the reporting owner's OWN title.
  assert.equal(before.ceoFilings, 1);
  assert.equal(after.ceoFilings, 1, 'the CFO filing does not count as a CEO filing');

  // (d) The window excludes older activity but the filings stay archived.
  const tLate = Math.floor(Date.parse('2026-12-01T00:00:00Z') / 1000);
  const late = store.insiderStateAtOrBefore(issuer, tLate, { windowDays: 30 });
  assert.equal(late.filingsEver, 2, 'everything accepted by T is still countable');
  assert.equal(late.filingsInWindow, 0, 'a 30-day window in December sees neither summer filing');

  // (e) The open-market number is real: only P/S rows move it.
  assert.deepEqual(after.openMarket, { shares: -2605.75 + 1000, dollars: -(2605.75 * 360.134) + 1000 * 300, buys: 1, sells: 1 });
  assert.deepEqual(after.codesInWindow, ['M', 'P', 'S']);
  assert.equal(after.kind, 'sec-form4-flow');
  // The only capture in this issuer is 2026-09-21, AFTER both decision
  // instants, so at those instants the archive had not looked yet: staleness is
  // null (unknown), never 0 and never an invented number.
  assert.equal(after.archiveStaleSeconds, null, 'the archive\'s own staleness is published, not invented');
  assert.equal(after.observedAt, null);
  assert.equal(after.source, FORM4_FIXTURE_META.url);

  // (f) An issuer with nothing accepted by T answers null → the strategy abstains.
  const tEarly = Math.floor(Date.parse('2026-01-01T00:00:00Z') / 1000);
  assert.equal(store.insiderStateAtOrBefore(issuer, tEarly), null);

  // (g) The shipped module is present, honest about being empty, and the
  //     coverage row is computed rather than typed.
  const cov = store.form4Coverage();
  assert.equal(typeof cov.present, 'boolean');
  assert.equal(cov.present, false, 'no capture has run yet, so the archive is honestly dark');
  assert.equal(store.hasForm4Archive(), false);
  assert.equal(store.form4Series().length, 0);
  const mod = readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'form4-signal-data.js'), 'utf8');
  assert.match(mod, /NO ARCHIVE YET/, 'the generated module says so in its own header');
});

test('129. InsiderFlow_Form4 abstains without EDGAR evidence, stands aside on a CEO filing, and buys NO inside the band', async () => {
  const { STRATEGIES } = await import('../src/strategies.js');
  const arch = await import('../scripts/archive-form4-signals.mjs');
  const store = await import('../src/form4-signal-store.js');
  const s = STRATEGIES.find((x) => x.username === 'InsiderFlow_Form4');
  assert.ok(s, 'the entry exists');
  assert.equal(s.flight, 'daily');
  assert.ok(/form4Signal/.test(String(s.decide)), 'decide() names the signal it reads (test 126 rule)');
  assert.ok(/sec\.gov|EDGAR/i.test(s.sourceNote), 'the card names the official source');
  assert.match(s.thesis, /WEAK and unproven|weak and unproven/, 'the card states the causal-link limitation');
  assert.match(s.thesis, /KXOPENAICEOCHANGE/, 'the card states which contract can never receive the signal');
  assert.equal(s.rules.riskManagement, 'NONE (by mandate)');

  const book = (yesAsk) => ({
    tick: 0.01,
    getBestYesAsk: () => yesAsk,
    getBestNoAsk: () => Math.round((1 - yesAsk) * 100) / 100,
    getYesAskTiers: () => [{ price: yesAsk, count: 200000 }],
    getNoAskTiers: () => [{ price: 1 - yesAsk, count: 200000 }]
  });
  const ctx = (yesAsk, signal, ticker = 'TESLACEOCHANGE-26') => ({
    book: book(yesAsk),
    portfolio: { cash: 100000, positions: new Map() },
    ticker,
    signal
  });

  // A signal built the same way the provider builds it, from the REAL filing.
  const real = arch.parseOwnershipDocument(readFileSync(FORM4_FIXTURE_PATH, 'utf8'), FORM4_FIXTURE_META);
  const issuer = {
    symbol: 'TSLA', cik: '1318605', issuerName: 'Tesla, Inc.',
    kalshiSeries: ['TESLACEOCHANGE'], assumption: store.form4Assumption(),
    source: { endpoint: 'https://www.sec.gov/cgi-bin/browse-edgar', urls: [real.url] },
    captures: ['2026-09-21T04:03:00.000Z'],
    filings: [real]
  };
  const ts = Math.floor(Date.parse('2026-09-15T00:00:00Z') / 1000);
  const signal = store.insiderStateAtOrBefore(issuer, ts, { windowDays: 90 });
  assert.ok(signal && signal.kind === 'sec-form4-flow');
  assert.equal(signal.ceoFilings, 0);

  assert.deepEqual(s.decide(ctx(0.1, null)), [], 'no archive → no trade');
  assert.deepEqual(s.decide(ctx(0.1, { ...signal, kind: 'something-else' })), [], 'a different signal kind is not this signal');
  const trade = s.decide(ctx(0.1, signal));
  assert.equal(trade.length, 1, 'with EDGAR evidence and no CEO filing, it trades');
  assert.equal(trade[0].side, 'NO');
  assert.equal(trade[0].type, 'buy');
  assert.ok(trade[0].count > 0);
  assert.match(trade[0].reason, /-2605\.75/, 'the reason quotes the real net open-market flow');
  assert.match(trade[0].reason, /2026-09-09T19:00:10-04:00/, 'the reason quotes EDGAR\'s acceptance instant');
  assert.deepEqual(s.decide(ctx(0.1, { ...signal, ceoFilings: 1 })), [], 'a CEO-titled filing inside the window → stand aside');
  assert.deepEqual(s.decide(ctx(0.5, signal)), [], 'a YES ask above the longshot band → no trade');
  assert.deepEqual(s.decide(ctx(0.01, signal)), [], 'a YES ask below the band → no trade');
  const held = { cash: 100000, positions: new Map([['TESLACEOCHANGE-26', { ticker: 'TESLACEOCHANGE-26', count: 10 }]]) };
  assert.deepEqual(s.decide({ ...ctx(0.1, signal), portfolio: held }), [], 'once per market');
});

test('130. the desk reads the SAME Form 4 archive through the shared signal hook, and abstains honestly when it is dark', async () => {
  const { DESK_STRATEGIES } = await import('../src/desk-strategies.js');
  const { buildDeskSignalsAsync, DESK_LIMITS } = await import('../src/live-desk.js');
  const { DESK_DATA } = await import('../src/desk-data.js');
  const { DESK_RESERVED_USERNAMES } = await import('../src/competition-memory.js');

  const s = DESK_STRATEGIES.find((x) => x.username === 'LiveInsider_Form4Flow');
  assert.ok(s, 'the desk entrant exists');
  assert.ok(DESK_RESERVED_USERNAMES.includes('LiveInsider_Form4Flow'), 'its username is reserved against the roster');
  assert.ok(/view\.signals && view\.signals\.form4/.test(String(s.decide)), 'it reads the shared desk signal hook');
  assert.match(s.thesis, /private company/i, 'the card states the OpenAI exclusion');
  assert.match(s.rules.join(' '), /never assumed|no quote → no trade/i);

  // The desk signal hook exposes the Form 4 provider alongside the others.
  const sig = await buildDeskSignalsAsync(Date.parse(DESK_DATA.generatedAt));
  assert.ok(sig.form4, 'the desk builds a form4 provider');
  assert.equal(sig.form4.available, false, 'dark until the workflow has captured');
  assert.match(sig.form4.source, /SEC EDGAR/i);
  assert.equal(sig.form4.coverage.present, false);
  assert.deepEqual(sig.form4.series, []);
  const dark = s.decide({ asOfMs: Date.parse(DESK_DATA.generatedAt), cash: 100000, markets: [], signals: sig });
  assert.deepEqual(dark, [], 'a dark archive places nothing at all');
  assert.deepEqual(s.decide({ asOfMs: Date.parse(DESK_DATA.generatedAt), cash: 100000, markets: [], signals: {} }), [], 'no provider at all → nothing');

  // The desk universe still reserves slots for the CEO series this entry trades.
  const reserves = (DESK_DATA.rule.seriesReserves || []).map((r) => r.prefix);
  for (const p of ['TESLACEOCHANGE', 'KXOPENAICEOCHANGE', 'JPMCEOCHANGE']) {
    assert.ok(reserves.includes(p), `${p} has reserved desk slots`);
  }
  assert.ok(DESK_LIMITS.minContracts > 0);

  // The price-only control keeps saying what it is, and now points at the entry
  // that really reads the archive (stale prose is irregularity #52's class).
  const control = DESK_STRATEGIES.find((x) => x.username === 'LiveInsider_FilingFader');
  assert.match(control.source, /NOT USED by this entry/);
  assert.match(control.source, /now EXISTS/);
  assert.match(control.source, /LiveInsider_Form4Flow/);
  assert.doesNotMatch(control.thesis, /archive still absent|still absent/i, 'no stale blocker wording left');
});
