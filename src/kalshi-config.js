/**
 * KalshiPaperSim — Verified Kalshi Configuration Constants
 * =====================================================================
 * Every value in this file was verified line-by-line against OFFICIAL
 * Kalshi documentation or the LIVE Kalshi production API on 2026-09-17.
 * No value here is invented. Provenance links are attached to each block.
 *
 * PRIMARY SOURCES (official):
 *  - API Environments & Endpoints : https://docs.kalshi.com/getting_started/api_environments
 *  - Orderbook Responses          : https://docs.kalshi.com/getting_started/orderbook_responses
 *  - Fixed-Point Representation   : https://docs.kalshi.com/getting_started/fixed_point_migration
 *  - Historical Data              : https://docs.kalshi.com/getting_started/historical_data
 *  - Quick Start: WebSockets      : https://docs.kalshi.com/getting_started/quick_start_websockets
 *  - API Keys (request signing)   : https://docs.kalshi.com/getting_started/api_keys
 *  - Rate Limits & Tiers          : https://docs.kalshi.com/getting_started/rate_limits
 *  - Get Market Candlesticks      : https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *  - Get Markets (Market schema)  : https://docs.kalshi.com/api-reference/market/get-markets
 *  - Get Market Orderbook         : https://docs.kalshi.com/api-reference/market/get-market-orderbook
 *  - Official Fee Schedule (PDF)  : https://kalshi.com/docs/kalshi-fee-schedule.pdf
 *  - Fee schedule landing page    : https://kalshi.com/fee-schedule
 */

/**
 * REST + WebSocket base URLs.
 * Verified: https://docs.kalshi.com/getting_started/api_environments
 *
 * NOTE (verified 2026-09-17): the docs state the `external-api*` hosts are the
 * RECOMMENDED hosts, and the `api.elections.kalshi.com` / `demo-api.kalshi.co`
 * hosts are "also supported" for backward compatibility. The docs also state
 * that despite the "elections" subdomain, the production Trade API serves ALL
 * Kalshi markets, not only elections.
 */
export const KALSHI_ENDPOINTS = {
  rest: {
    production: 'https://external-api.kalshi.com/trade-api/v2',
    productionAlsoSupported: 'https://api.elections.kalshi.com/trade-api/v2',
    demo: 'https://external-api.demo.kalshi.co/trade-api/v2',
    demoAlsoSupported: 'https://demo-api.kalshi.co/trade-api/v2'
  },
  websocket: {
    production: 'wss://external-api-ws.kalshi.com/trade-api/ws/v2',
    productionAlsoSupported: 'wss://api.elections.kalshi.com/trade-api/ws/v2',
    demo: 'wss://external-api-ws.demo.kalshi.co/trade-api/ws/v2',
    demoAlsoSupported: 'wss://demo-api.kalshi.co/trade-api/ws/v2'
  }
};

/**
 * Backwards-compatible alias used by the original codebase.
 * @deprecated Prefer KALSHI_ENDPOINTS.
 */
export const KALSHI_CONFIG = {
  PROD_BASE_URL: KALSHI_ENDPOINTS.rest.production,
  ELECTIONS_BASE_URL: KALSHI_ENDPOINTS.rest.productionAlsoSupported,
  DEMO_BASE_URL: KALSHI_ENDPOINTS.rest.demo,
  WS_PROD_URL: KALSHI_ENDPOINTS.websocket.production,
  WS_DEMO_URL: KALSHI_ENDPOINTS.websocket.demo
};

/**
 * Verified endpoint paths.
 * All paths below are relative to a REST base URL.
 */
export const KALSHI_PATHS = {
  exchangeStatus: '/exchange/status',
  markets: '/markets',
  market: (ticker) => `/markets/${encodeURIComponent(ticker)}`,
  // Verified: the orderbook guide documents GET /markets/{ticker}/orderbook
  // https://docs.kalshi.com/getting_started/orderbook_responses
  orderbook: (ticker) => `/markets/${encodeURIComponent(ticker)}/orderbook`,
  series: (seriesTicker) => `/series/${encodeURIComponent(seriesTicker)}`,
  seriesList: '/series',
  /**
   * VERIFIED CORRECTION (2026-09-17): candlesticks live under the SERIES path,
   * NOT under /markets/{ticker}/candlesticks.
   * OpenAPI path: get /series/{series_ticker}/markets/{ticker}/candlesticks
   * Source: https://docs.kalshi.com/api-reference/market/get-market-candlesticks
   */
  candlesticks: (seriesTicker, ticker) =>
    `/series/${encodeURIComponent(seriesTicker)}/markets/${encodeURIComponent(ticker)}/candlesticks`,
  /**
   * Historical tier endpoints.
   * Source: https://docs.kalshi.com/getting_started/historical_data
   */
  historicalCutoff: '/historical/cutoff',
  historicalMarkets: '/historical/markets',
  historicalMarket: (ticker) => `/historical/markets/${encodeURIComponent(ticker)}`,
  historicalCandlesticks: (ticker) =>
    `/historical/markets/${encodeURIComponent(ticker)}/candlesticks`,
  historicalTrades: '/historical/trades',
  trades: '/markets/trades'
};

/**
 * Candlestick period_interval valid values (minutes).
 * Verified enum [1, 60, 1440]:
 * https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 */
export const CANDLE_PERIODS_MINUTES = Object.freeze([1, 60, 1440]);

/**
 * WebSocket channel names.
 * Verified: https://docs.kalshi.com/getting_started/quick_start_websockets
 *   Private channels : orderbook_delta, fill, market_positions, communications,
 *                      order_group_updates
 *   Public market-data channels (no extra per-channel auth): ticker, trade,
 *                      market_lifecycle_v2, multivariate_market_lifecycle,
 *                      multivariate
 * IMPORTANT (verified): the WebSocket SESSION itself still requires
 * authenticated headers, so a browser cannot connect to Kalshi directly —
 * a server-side relay is required. See IRREGULARITIES.md item #3.
 */
export const WS_CHANNELS = Object.freeze({
  public: ['ticker', 'trade', 'market_lifecycle_v2', 'multivariate_market_lifecycle', 'multivariate'],
  private: ['orderbook_delta', 'fill', 'market_positions', 'communications', 'order_group_updates']
});

/** Path signed for the WebSocket handshake.
 *  Verified: timestamp + "GET" + "/trade-api/ws/v2"
 *  https://docs.kalshi.com/getting_started/quick_start_websockets */
export const WS_SIGN_PATH = '/trade-api/ws/v2';

/**
 * Request signing algorithm.
 * Verified: https://docs.kalshi.com/getting_started/api_keys
 *   msg  = <timestamp_ms> + <HTTP_METHOD> + <path without query string>
 *   sig  = base64( RSA-PSS(SHA-256, saltLength = digest length) )
 *   headers = KALSHI-ACCESS-KEY / KALSHI-ACCESS-SIGNATURE / KALSHI-ACCESS-TIMESTAMP
 */
export const KALSHI_AUTH = Object.freeze({
  headerKey: 'KALSHI-ACCESS-KEY',
  headerSignature: 'KALSHI-ACCESS-SIGNATURE',
  headerTimestamp: 'KALSHI-ACCESS-TIMESTAMP',
  algorithm: 'RSA-SHA256',
  padding: 'RSA_PKCS1_PSS_PADDING',
  saltLength: 'RSA_PSS_SALTLEN_DIGEST'
});

/**
 * Official Kalshi fee schedule.
 * Verified against the official PDF (last updated and effective July 7, 2026):
 *   https://kalshi.com/docs/kalshi-fee-schedule.pdf
 *
 *   Taker (immediately matched): fees = round up(M x 0.07   x C x P x (1-P))
 *   Maker (resting order)      : fees = round up(M x 0.0175 x C x P x (1-P))
 *   P = price of a contract in dollars (50 cents is 0.5)
 *   C = number of contracts being traded
 *   M = the multiplier for each contract (default 1 unless otherwise indicated;
 *       for MAKER fees the default is 0 unless otherwise indicated)
 *   round up = rounds up such that the fee + positionCost is rounded to a centicent
 *
 * Also verified from the PDF: "There is no settlement fee." and
 * "There is no membership fee."
 *
 * The per-series multiplier M is published live by the API on the Series object
 * as `fee_multiplier`, together with `fee_type`. Verified live on 2026-09-17:
 *   GET /series/KXINXY -> {"fee_multiplier":1,"fee_type":"quadratic_with_maker_fees"}
 *   GET /series/KXTSLA -> {"fee_multiplier":1,"fee_type":"quadratic"}
 */
export const KALSHI_FEES = Object.freeze({
  takerCoefficient: 0.07,
  makerCoefficient: 0.0175,
  defaultTakerMultiplier: 1,
  defaultMakerMultiplier: 0,
  settlementFee: 0,
  membershipFee: 0,
  /** "centicent" = 1/100 of one cent = $0.0001 (verified wording in fee PDF). */
  roundingIncrement: 0.0001,
  sourceUrl: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
  effective: '2026-07-07'
});

/**
 * Official published General Trading Fees table (fee per 100 contracts),
 * transcribed verbatim from https://kalshi.com/docs/kalshi-fee-schedule.pdf
 * (effective 2026-07-07). Used by the unit tests as an independent oracle so
 * our formula implementation is checked against Kalshi's own published numbers.
 */
export const OFFICIAL_FEE_TABLE_PER_100 = Object.freeze([
  { price: 0.01, feeFor1Contract: 0.01, priceFor100: 1.0, feeFor100: 0.07 },
  { price: 0.05, feeFor1Contract: 0.01, priceFor100: 5.0, feeFor100: 0.34 },
  { price: 0.10, feeFor1Contract: 0.01, priceFor100: 10.0, feeFor100: 0.63 },
  { price: 0.15, feeFor1Contract: 0.01, priceFor100: 15.0, feeFor100: 0.90 },
  { price: 0.20, feeFor1Contract: 0.02, priceFor100: 20.0, feeFor100: 1.12 },
  { price: 0.25, feeFor1Contract: 0.02, priceFor100: 25.0, feeFor100: 1.32 },
  { price: 0.30, feeFor1Contract: 0.02, priceFor100: 30.0, feeFor100: 1.47 },
  { price: 0.35, feeFor1Contract: 0.02, priceFor100: 35.0, feeFor100: 1.60 },
  { price: 0.40, feeFor1Contract: 0.02, priceFor100: 40.0, feeFor100: 1.68 },
  { price: 0.45, feeFor1Contract: 0.02, priceFor100: 45.0, feeFor100: 1.74 },
  { price: 0.50, feeFor1Contract: 0.02, priceFor100: 50.0, feeFor100: 1.75 },
  { price: 0.55, feeFor1Contract: 0.02, priceFor100: 55.0, feeFor100: 1.74 },
  { price: 0.60, feeFor1Contract: 0.02, priceFor100: 60.0, feeFor100: 1.68 },
  { price: 0.65, feeFor1Contract: 0.02, priceFor100: 65.0, feeFor100: 1.60 },
  { price: 0.70, feeFor1Contract: 0.02, priceFor100: 70.0, feeFor100: 1.47 },
  { price: 0.75, feeFor1Contract: 0.02, priceFor100: 75.0, feeFor100: 1.32 },
  { price: 0.80, feeFor1Contract: 0.02, priceFor100: 80.0, feeFor100: 1.12 },
  { price: 0.85, feeFor1Contract: 0.01, priceFor100: 85.0, feeFor100: 0.90 },
  { price: 0.90, feeFor1Contract: 0.01, priceFor100: 90.0, feeFor100: 0.63 },
  { price: 0.95, feeFor1Contract: 0.01, priceFor100: 95.0, feeFor100: 0.34 },
  { price: 0.99, feeFor1Contract: 0.01, priceFor100: 99.0, feeFor100: 0.07 }
]);

/**
 * The published General Trading Fees Table is a CENT-ROUNDED illustration.
 * Verified by arithmetic on all 21 rows (test 2): for every row,
 *   tableFee = ceil_up_to_whole_cent( round_up_to_centicent(M x 0.07 x C x P x (1-P)) )
 * e.g. 100 contracts at $0.01: formula = $0.0693, table = $0.07.
 * The formula (centicent rounding) is what this simulation charges; the table is
 * what the PDF displays. Flagged as irregularity #19 — we do not silently pick.
 */
export const FEE_TABLE_ROUNDING = Object.freeze({
  formulaIncrement: 0.0001,   // "rounded to a centicent" — verbatim from the PDF
  publishedTableIncrement: 0.01, // the PDF table's values are whole cents
  example: { price: 0.01, contracts: 100, formulaFee: 0.0693, publishedTableFee: 0.07 },
  sourceUrl: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf'
});

/**
 * Non-Standard Fees table, transcribed from
 * https://kalshi.com/docs/kalshi-fee-schedule.pdf (effective 2026-07-07).
 * Independent second source for the per-series multipliers we captured live from
 * GET /series/{ticker}. A series ABSENT from this table uses the documented
 * defaults (taker M = 1, maker M = 0).
 *
 * Only the series relevant to this simulation's universe plus every zero-fee
 * series are listed; the full table is ~90 rows of sports/awards markets.
 */
export const NON_STANDARD_FEE_MULTIPLIERS = Object.freeze({
  // ── series in our verified snapshot ──────────────────────────────────
  KXBTCY:          { maker: 0, taker: 0, label: 'BTC price range EOY' },
  KXNASDAQ100Y:    { maker: 1, taker: 1, label: 'Nasdaq yearly range' },
  KXINXY:          { maker: 1, taker: 1, label: 'S&P 500 yearly range' },
  KXFEDDECISION:   { maker: 1, taker: 1, label: 'Fed meeting' },
  KXCPIYOY:        { maker: 1, taker: 1, label: 'Inflation' },
  KXCPI:           { maker: 1, taker: 1, label: 'CPI' },
  KXFED:           { maker: 1, taker: 1, label: 'Fed funds rate' },
  KXGDP:           { maker: 1, taker: 1, label: 'US GDP growth' },
  KXPAYROLLS:      { maker: 1, taker: 1, label: 'Jobs numbers' },
  KXU3:            { maker: 1, taker: 1, label: 'Unemployment' },
  KXRATECUTCOUNT:  { maker: 1, taker: 1, label: 'Number of rate cuts' },
  // KXTSLA, KXFA, KXABNBA, KXKLAR, KXGRAB, KXRELYA, KXTOLA are NOT listed in
  // the table => documented defaults (taker M = 1, maker M = 0).
  // ── other zero-fee series (for completeness) ─────────────────────────
  KXETHY:              { maker: 0, taker: 0, label: 'ETH price EOY' },
  KXCITRINI:           { maker: 0, taker: 0, label: 'Will the Citrini scenario materialize?' },
  KXDOED:              { maker: 0, taker: 0, label: 'DOE eliminated' },
  KXELECTIRAN:         { maker: 0, taker: 0, label: 'Will Iran hold a presidential election?' },
  KXGAMBLINGREPEAL:    { maker: 0, taker: 0, label: 'Gambling Repeal' },
  KXGREENLAND:         { maker: 0, taker: 0, label: 'Greenland purchase' },
  KXIRANDEMOCRACY:     { maker: 0, taker: 0, label: 'Will Iran become a democracy in 2026?' },
  KXLAYOFFSYINFO:      { maker: 0, taker: 0, label: 'Tech layoffs' },
  KXPAHLAVIHEAD:       { maker: 0, taker: 0, label: 'Will Pahlavi lead Iran?' }
});

/** Provenance for NON_STANDARD_FEE_MULTIPLIERS (kept out of the lookup map). */
export const NON_STANDARD_FEE_TABLE_SOURCE = Object.freeze({
  sourceUrl: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
  section: 'Non-Standard Fees',
  effective: '2026-07-07',
  defaultWhenAbsent: { taker: 1, maker: 0, basis: 'PDF: "M = the multiplier for each contract (default is 1 unless otherwise indicated)" for takers, "(default is 0 unless otherwise indicated)" for makers' }
});

/**
 * Price level structures and their tick grids.
 * Verified table: https://docs.kalshi.com/getting_started/fixed_point_migration
 *
 * The docs state: "`price_ranges` — an array of { start, end, step } bands ...
 * This is the source of truth for valid prices: any price on the grid is valid,
 * and any off-grid price is rejected. Consume it dynamically per market."
 * and "Do not key pricing logic off this name".
 *
 * Verified live 2026-09-17:
 *   KXNASDAQ100Y / KXINXY / KXTSLA / KXFA / KXCPIYOY -> "linear_cent"
 *     price_ranges: [{"start":"0.0000","end":"1.0000","step":"0.0100"}]
 *   KXBTCY -> "deci_cent"
 *     price_ranges: [{"start":"0.0000","end":"1.0000","step":"0.0010"}]
 */
export const PRICE_LEVEL_STRUCTURES = Object.freeze({
  linear_cent: [{ start: '0.00', end: '1.00', step: '0.01' }],
  deci_cent: [{ start: '0.00', end: '1.00', step: '0.001' }],
  tapered_deci_cent: [
    { start: '0.00', end: '0.10', step: '0.001' },
    { start: '0.10', end: '0.90', step: '0.01' },
    { start: '0.90', end: '1.00', step: '0.001' }
  ],
  center_whole_edge_half_cent: [
    { start: '0.00', end: '0.10', step: '0.005' },
    { start: '0.10', end: '0.90', step: '0.01' },
    { start: '0.90', end: '1.00', step: '0.005' }
  ],
  center_whole_edge_quint_cent: [
    { start: '0.00', end: '0.10', step: '0.002' },
    { start: '0.10', end: '0.90', step: '0.01' },
    { start: '0.90', end: '1.00', step: '0.002' }
  ],
  center_half_edge_half_cent: [{ start: '0.00', end: '1.00', step: '0.005' }],
  center_half_edge_quint_cent: [
    { start: '0.00', end: '0.10', step: '0.002' },
    { start: '0.10', end: '0.90', step: '0.005' },
    { start: '0.90', end: '1.00', step: '0.002' }
  ],
  center_half_edge_deci_cent: [
    { start: '0.00', end: '0.10', step: '0.001' },
    { start: '0.10', end: '0.90', step: '0.005' },
    { start: '0.90', end: '1.00', step: '0.001' }
  ],
  center_quint_edge_quint_cent: [{ start: '0.00', end: '1.00', step: '0.002' }],
  center_quint_edge_deci_cent: [
    { start: '0.00', end: '0.10', step: '0.001' },
    { start: '0.10', end: '0.90', step: '0.002' },
    { start: '0.90', end: '1.00', step: '0.001' }
  ],
  center_centi_edge_centi_cent: [{ start: '0.00', end: '1.00', step: '0.0001' }],
  center_deci_edge_centi_cent: [
    { start: '0.00', end: '0.01', step: '0.0001' },
    { start: '0.01', end: '0.99', step: '0.001' },
    { start: '0.99', end: '1.00', step: '0.0001' }
  ]
});

/**
 * Market lifecycle `status` enum from the Market schema (response values).
 * Verified: https://docs.kalshi.com/api-reference/market/get-markets
 *   status enum: initialized | inactive | active | closed | determined |
 *                disputed | amended | finalized
 *
 * IMPORTANT DISTINCTION (verified): the GET /markets `status` QUERY FILTER uses a
 * different vocabulary: unopened | open | paused | closed | settled.
 * Real live responses return status:"active" for tradable markets — they do NOT
 * return "open". The previous revision of this repo conflated the two; that is
 * recorded in IRREGULARITIES.md item #2.
 */
export const MARKET_STATUS_RESPONSE = Object.freeze([
  'initialized', 'inactive', 'active', 'closed', 'determined', 'disputed', 'amended', 'finalized'
]);
export const MARKET_STATUS_QUERY_FILTER = Object.freeze([
  'unopened', 'open', 'paused', 'closed', 'settled'
]);

/**
 * Binary vs scalar markets.
 * Verified: Market.market_type enum is [binary, scalar].
 * https://docs.kalshi.com/api-reference/market/get-markets
 * Binary contracts carry notional_value_dollars — verified "1.0000" on every
 * live binary market captured on 2026-09-17 (KXINXY, KXNASDAQ100Y, KXTSLA,
 * KXFA, KXCPIYOY, KXFEDDECISION, KXBTCY).
 */
export const MARKET_TYPES = Object.freeze(['binary', 'scalar']);

/** Rate limits (token buckets). Verified: https://docs.kalshi.com/getting_started/rate_limits */
export const RATE_LIMITS = Object.freeze({
  defaultRequestTokenCost: 10,
  batchCreateOrdersTokenCostEach: 10,
  batchCancelOrdersTokenCostEach: 2,
  basicReadBudgetPerSec: 200,
  basicWriteBudgetPerSec: 100,
  throttledStatus: 429,
  throttledBody: '{"error": "too many requests"}',
  note: '429 responses do not currently include Retry-After or X-RateLimit-* headers. Apply exponential backoff on 429.'
});

/** Fixed-point conventions. Verified: https://docs.kalshi.com/getting_started/fixed_point_migration */
export const FIXED_POINT = Object.freeze({
  priceFieldSuffix: '_dollars',
  priceMaxDecimals: 4,
  countFieldSuffix: '_fp',
  countMaxDecimals: 2,
  minContractGranularity: 0.01,
  note: '*_dollars are fixed-point dollar strings up to 4 decimals; *_fp are contract counts up to 2 decimals (fractional contracts supported, min granularity 0.01).'
});

/** Live-data retention window / historical cutoff.
 *  Verified: https://docs.kalshi.com/getting_started/historical_data
 *  "The target window for live data is 3 months."
 *  Live value captured 2026-09-17 from GET /historical/cutoff:
 *    market_settled_ts / trades_created_ts / orders_updated_ts /
 *    market_positions_last_updated_ts = "2026-07-19T00:00:00Z" */
export const HISTORICAL_CUTOFF_CAPTURED = Object.freeze({
  capturedAt: '2026-09-17',
  sourceUrl: 'https://external-api.kalshi.com/trade-api/v2/historical/cutoff',
  market_settled_ts: '2026-07-19T00:00:00Z',
  trades_created_ts: '2026-07-19T00:00:00Z',
  orders_updated_ts: '2026-07-19T00:00:00Z',
  market_positions_last_updated_ts: '2026-07-19T00:00:00Z'
});
