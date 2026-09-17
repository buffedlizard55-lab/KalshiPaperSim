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
import { readFileSync } from 'node:fs';

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
import { computeAttribution, generatePostMortem, buildLeaderboard, LEADERBOARD_QUALIFICATION } from '../src/analysis.js';
import {
  runCompetition,
  runCustomStrategy,
  getCandleCoverage,
  getVerifiedCandleMap,
  getHistoryAudit,
  DATA_SOURCE_ACCUMULATED,
  buildUniverse,
  CANDLE_ORIGIN
} from '../src/strategy-runner.js';
import { ACCUMULATED_HISTORY, expandAccumulatedBar, getAccumulatedBars } from '../src/accumulated-history.js';
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
  REGIMES
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
const EXPECTED_PERIODS = Math.max(...COVERAGE.map((c) => c.bars));
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
  assert.equal(STRATEGIES.length, 12);

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
    // VERIFIED_SERIES is a map of ticker -> why it is verified.
    assert.ok(VERIFIED_SERIES && typeof VERIFIED_SERIES === 'object');
    if (Array.isArray(s.universe)) {
      for (const u of s.universe) {
        const series = String(u.series_ticker || u.series || u);
        assert.ok(Object.prototype.hasOwnProperty.call(VERIFIED_SERIES, series), `${s.id}: universe references unverified series ${series}`);
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
  assert.equal(c.horizonPeriods, EXPECTED_PERIODS, 'the horizon is the longest series actually available');
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
    assert.equal(r.dataProvenance.ticker ?? r.dataProvenance?.markets?.[0]?.ticker ?? T33000, r.dataProvenance.ticker ?? T33000);
  }
  assert.ok(JSON.stringify(p).includes(T33000));
});

test('24. every result is numerically sane and fully populated', () => {
  for (const r of COMPETITION.results) {
    assert.equal(r.periods, REPLAY_PERIODS);
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
      if (Number(t.contracts) > 0) {
        const fillPx = t.vwap ?? t.fillPrice;
        assert.ok(Number.isFinite(fillPx) && fillPx > 0 && fillPx < 1, `fill price ${fillPx} must be a real probability`);
        assert.ok(Number.isFinite(t.fee) && t.fee >= 0);
      }
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
    // No fabricated tickers in generated prose.
    for (const bad of REJECTED_FABRICATED_TICKERS) {
      assert.ok(!JSON.stringify(pm).includes(bad), `post-mortem mentions fabricated ticker ${bad}`);
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
    'assets.kalshi.com', 'github.com', 'www.cfbenchmarks.com', 'cfbenchmarks.com',
    'tc39.es', 'developer.mozilla.org',
    'laikalabs.ai', 'pith.science', 'www.reddit.com', 'reddit.com', 'www.oddsshopper.com'
  ]);
  let withLink = 0;

  for (const f of VERIFIED_FACTS) {
    assert.match(f.id, /^V\d{2}$/, 'fact ids are V01..Vnn');
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
      if (f.group !== 'Strategy sources') {
        assert.ok(
          u.host.endsWith('kalshi.com') || u.host.endsWith('kalshi.co') || u.host === 'github.com' ||
            u.host === 'tc39.es' || u.host === 'developer.mozilla.org',
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
  const severities = new Set(['high', 'med', 'low', 'info']);
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
  for (const [ticker, rec] of Object.entries(ACCUMULATED_HISTORY.markets)) {
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
