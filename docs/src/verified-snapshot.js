/**
 * KalshiPaperSim — VERIFIED LIVE KALSHI DATA SNAPSHOT
 * =====================================================================
 * Every object in this file is a VERBATIM capture from the LIVE Kalshi
 * production Trade API, retrieved on 2026-09-17 (UTC) from:
 *
 *     https://external-api.kalshi.com/trade-api/v2
 *
 * Nothing in this file is invented, interpolated, or estimated. Where a
 * capture returned an error, the error is recorded verbatim as evidence
 * (see `seriesNotFound`) — this is how fabricated tickers were detected.
 *
 * Per-endpoint provenance is attached to each block via `_provenance`.
 * Full audit trail: data/kalshi-verified/PROVENANCE.md
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The previous revision of this repository shipped a hand-written
 * "OFFICIAL_MARKET_CATALOG" containing tickers such as `KXSP500-26DEC31-T6000`,
 * `KXNVDA-26DEC31-T150`, `KXAAPL-26DEC31-T260` and `KXNDX-26DEC31-T21000`.
 * Those series DO NOT EXIST on Kalshi — verified by live API 404s recorded
 * below. They were hallucinations. This file replaces them with real data.
 * See IRREGULARITIES.md items #1 and #2.
 */

/** Capture metadata shared by every block below. */
import { NON_STANDARD_FEE_MULTIPLIERS, NON_STANDARD_FEE_TABLE_SOURCE } from './kalshi-config.js';
import { SERIES_FEE_REGISTRY, FEE_REGISTRY_PROVENANCE } from './series-fee-registry.js';

/**
 * Cross-check a live-captured series fee_multiplier against the official
 * "Non-Standard Fees" table in https://kalshi.com/docs/kalshi-fee-schedule.pdf
 * (effective 2026-07-07). Two independent sources, so a disagreement is loud.
 */
function pdfFeeCrossCheck(seriesTicker, capturedMultiplier, capturedFeeType = null) {
  const row = NON_STANDARD_FEE_MULTIPLIERS[seriesTicker];
  if (!row) {
    // ABSENT FROM **OUR TRANSCRIPTION** IS NOT THE SAME AS ABSENT FROM THE PDF.
    // NON_STANDARD_FEE_MULTIPLIERS is a subset (the series relevant to this
    // universe plus every zero-fee row); the real table is ~90 rows of
    // sports/awards markets. An earlier version of this function reported
    // "documented default applies; live capture agrees" for any absent series,
    // which asserted a maker multiplier of 0 for series the live API marks
    // quadratic_with_maker_fees (e.g. KXNFLGAME). It now says only what is
    // known, and records what the live capture says about maker fees.
    return {
      listed: false,
      transcribed: false,
      agrees: capturedMultiplier === NON_STANDARD_FEE_TABLE_SOURCE.defaultWhenAbsent.taker,
      pdfTaker: NON_STANDARD_FEE_TABLE_SOURCE.defaultWhenAbsent.taker,
      pdfMaker: null,
      makerFeesApplyPerLiveCapture: capturedFeeType === 'quadratic_with_maker_fees',
      verdict:
        capturedMultiplier === 1
          ? 'row not transcribed in this repo\'s subset of the Non-Standard Fees table => the documented default taker M=1 applies; the live capture agrees on the taker value'
          : `row not transcribed in this repo's subset of the Non-Standard Fees table (documented default taker M=1) but the live capture says M=${capturedMultiplier} — INVESTIGATE`,
      note:
        capturedFeeType === 'quadratic_with_maker_fees'
          ? 'This series carries maker fees (fee_type=quadratic_with_maker_fees), so the maker coefficient applies to resting orders; its maker multiplier is taken as the captured fee_multiplier and labelled as such.'
          : 'This series is plain quadratic: a resting (maker) order pays NOTHING per the fee schedule quote at the top of src/kalshi-fees.js.',
      source: NON_STANDARD_FEE_TABLE_SOURCE.sourceUrl
    };
  }
  return {
    listed: true,
    agrees: row.taker === capturedMultiplier,
    pdfTaker: row.taker,
    pdfMaker: row.maker,
    label: row.label,
    verdict: row.taker === capturedMultiplier
      ? `official table lists taker M=${row.taker} / maker M=${row.maker}; live capture (M=${capturedMultiplier}) agrees`
      : `official table lists taker M=${row.taker} but live capture says M=${capturedMultiplier} — DISAGREEMENT`,
    source: NON_STANDARD_FEE_TABLE_SOURCE.sourceUrl
  };
}

export const CAPTURE_META = Object.freeze({
  capturedAt: '2026-09-17',
  capturedAtNote: 'Date of capture in UTC. Prices are a point-in-time snapshot and are NOT live quotes.',
  apiBase: 'https://external-api.kalshi.com/trade-api/v2',
  transportNote:
    'Captured through the agent HTTP fetch path. Direct TLS connections from this sandbox to *.kalshi.com are dropped at handshake (see IRREGULARITIES.md #4); the captures below were obtained successfully and are reproducible from any unrestricted network.',
  dataStatus: 'REAL_EXCHANGE_DATA_POINT_IN_TIME',
  license: 'Kalshi market data reproduced for research/verification of a paper-trading simulator. Kalshi is not affiliated with this project.'
});

/* ------------------------------------------------------------------ *
 * 1. GET /exchange/status
 * ------------------------------------------------------------------ */
export const EXCHANGE_STATUS = Object.freeze({
  _provenance: {
    url: 'https://external-api.kalshi.com/trade-api/v2/exchange/status',
    doc: 'https://docs.kalshi.com/api-reference/exchange/get-exchange-status',
    capturedAt: '2026-09-17'
  },
  exchange_active: true,
  exchange_index_statuses: [
    { description: 'Default', exchange_active: true, exchange_index: 0, intra_exchange_transfers_active: true, trading_active: true },
    { description: 'Combos', exchange_active: true, exchange_index: 1, intra_exchange_transfers_active: true, trading_active: true },
    { description: 'Crypto & Commodities', exchange_active: true, exchange_index: 2, intra_exchange_transfers_active: true, trading_active: true },
    { description: 'Tennis, Baseball, Basketball', exchange_active: true, exchange_index: 3, intra_exchange_transfers_active: true, trading_active: true }
  ],
  intra_exchange_transfers_active: true,
  trading_active: true
});

/* ------------------------------------------------------------------ *
 * 2. GET /historical/cutoff
 * ------------------------------------------------------------------ */
export const HISTORICAL_CUTOFF = Object.freeze({
  _provenance: {
    url: 'https://external-api.kalshi.com/trade-api/v2/historical/cutoff',
    doc: 'https://docs.kalshi.com/getting_started/historical_data',
    capturedAt: '2026-09-17'
  },
  market_positions_last_updated_ts: '2026-07-19T00:00:00Z',
  market_settled_ts: '2026-07-19T00:00:00Z',
  orders_updated_ts: '2026-07-19T00:00:00Z',
  trades_created_ts: '2026-07-19T00:00:00Z'
});

/* ------------------------------------------------------------------ *
 * 3. GET /series/{ticker}  — real Series objects (carry fee_multiplier)
 * ------------------------------------------------------------------ */
export const SERIES = Object.freeze({
  _provenance: {
    urls: [
      'https://external-api.kalshi.com/trade-api/v2/series/KXINXY',
      'https://external-api.kalshi.com/trade-api/v2/series/KXTSLA',
      'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y',
      'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY'
    ],
    doc: 'https://docs.kalshi.com/api-reference/market/get-series',
    capturedAt: '2026-09-17'
  },
  KXINXY: {
    additional_prohibitions: [
      'Persons who are employed by any of the Source Agencies are not permitted to trade on the Contract.',
      'Persons who hold any material, non-public information on the Underlying are not permitted to trade on the Contract.'
    ],
    categories: ['Financials'],
    category: 'Financials',
    contract_terms_url: 'https://assets.kalshi.com/contract_terms/INX.pdf',
    contract_url: 'https://assets.kalshi.com/regulatory/product-certifications/INX.pdf',
    exchange_index: 0,
    fee_multiplier: 1,
    fee_type: 'quadratic_with_maker_fees',
    frequency: 'annual',
    last_updated_ts: '2026-09-16T19:07:56.29021Z',
    settlement_sources: [{ name: 'For example, Google Finance', url: 'https://www.google.com/finance/quote/.INX:INDEXSP?hl=en' }],
    tags: ['Markets', 'Indices'],
    ticker: 'KXINXY',
    title: 'S&P 500 yearly range'
  },
  KXTSLA: {
    additional_prohibitions: [
      'Persons who are employed by any of the Source Agencies are not permitted to trade on the Contract.',
      'Persons who hold any material, non-public information on the Underlying are not permitted to trade on the Contract.'
    ],
    categories: ['Financials', 'Companies'],
    category: 'Financials',
    contract_terms_url: 'https://assets.kalshi.com/contract_terms/QUARTERKPI.pdf',
    contract_url: 'https://assets.kalshi.com/regulatory/product-certifications/QUARTERKPI.pdf',
    exchange_index: 0,
    fee_multiplier: 1,
    fee_type: 'quadratic',
    frequency: 'one_off',
    last_updated_ts: '2026-09-16T19:07:33.395265Z',
    product_metadata: { scope: 'Quarter KPI' },
    settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }],
    tags: ['Companies', 'KPIs'],
    ticker: 'KXTSLA',
    title: 'Tesla KPI'
  },
  /**
   * VERBATIM live capture, 2026-09-17.
   * This is the series that owns KXNASDAQ100Y-26DEC31H1600-T33000 — the market
   * with the 61-bar extended candlestick capture in src/verified-candles.js.
   * fee_multiplier 1 + fee_type quadratic_with_maker_fees means BOTH taker and
   * maker fees apply here.
   */
  KXNASDAQ100Y: {
    additional_prohibitions: [
      'Persons who are employed by any of the Source Agencies are not permitted to trade on the Contract.',
      'Persons who hold any material, non-public information on the Underlying are not permitted to trade on the Contract.'
    ],
    categories: ['Financials'],
    category: 'Financials',
    contract_terms_url: 'https://assets.kalshi.com/contract_terms/NASDAQ100.pdf',
    contract_url: 'https://assets.kalshi.com/regulatory/product-certifications/NASDAQ100.pdf',
    exchange_index: 0,
    fee_multiplier: 1,
    fee_type: 'quadratic_with_maker_fees',
    frequency: 'annual',
    last_updated_ts: '2026-09-16T19:07:47.2981Z',
    settlement_sources: [{ name: 'For example, Google Finance', url: 'https://www.google.com/finance/quote/NDX:INDEXNASDAQ?hl=en' }],
    tags: ['Markets', 'Indices'],
    ticker: 'KXNASDAQ100Y',
    title: 'Nasdaq yearly range',
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y', capturedAt: '2026-09-17' }
  },
  /**
   * VERBATIM live capture, 2026-09-17.
   * ⚠ FEE IRREGULARITY (flagged, not assumed): fee_multiplier is 0 for this
   * series, so with the official formula  fees = round_up(M × 0.07 × C × P × (1−P))
   * every fee on KXBTCY markets computes to $0.00 — taker AND maker. This is
   * real exchange configuration, reproduced exactly. The simulation therefore
   * charges NO fees on KXBTCY-27JAN0100-T149999.99, which materially changes
   * strategy results versus the naive "M = 1 everywhere" assumption.
   * Recorded in IRREGULARITIES.md.
   */
  KXBTCY: {
    additional_prohibitions: [
      'Persons who are employed by any of the Source Agencies are not permitted to trade on the Contract.',
      'Persons who hold any material, non-public information on the Underlying are not permitted to trade on the Contract.'
    ],
    categories: ['Crypto'],
    category: 'Crypto',
    contract_terms_url: 'https://assets.kalshi.com/contract_terms/CRYPTO.pdf',
    contract_url: 'https://assets.kalshi.com/regulatory/product-certifications/CRYPTO.pdf',
    exchange_index: 2,
    fee_multiplier: 0,
    fee_type: 'quadratic',
    frequency: 'annual',
    last_updated_ts: '2026-08-24T16:04:34.852557Z',
    settlement_sources: [{ name: 'CF Benchmarks', url: 'https://www.cfbenchmarks.com/' }],
    tags: ['BTC'],
    ticker: 'KXBTCY',
    title: 'BTC price range EOY',
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY', capturedAt: '2026-09-17' }
  }
});

/**
 * Resolve the fee configuration for a market from its SERIES metadata.
 * Falls back to the documented defaults (taker M = 1) when a series has not
 * been captured — and says so, rather than guessing silently.
 */
export function seriesFeeConfig(seriesTicker) {
  const s = SERIES[seriesTicker];
  if (!s || typeof s.fee_multiplier !== 'number') {
    // Second source: the fee configuration of every series the exchange lists,
    // captured by the ingest job with GET /series?include_volume=true and
    // narrowed to this build's tradeable universe by
    // scripts/generate-fee-registry.mjs. It is a LATER capture than the
    // snapshot (2026-09-18 vs 2026-09-17) and covers 47 series instead of 4.
    const reg = SERIES_FEE_REGISTRY[seriesTicker];
    if (reg && typeof reg.fee_multiplier === 'number') {
      return {
        series_ticker: seriesTicker,
        fee_multiplier: reg.fee_multiplier,
        fee_type: reg.fee_type || 'quadratic',
        captured: true,
        captureSource: 'discovered_series_list',
        zeroFee: reg.fee_multiplier === 0,
        makerFeesApply: reg.fee_type === 'quadratic_with_maker_fees',
        category: reg.category ?? null,
        title: reg.title ?? null,
        seriesVolumeFp: reg.volume_fp ?? null,
        pdfCrossCheck: pdfFeeCrossCheck(seriesTicker, reg.fee_multiplier, reg.fee_type),
        url: FEE_REGISTRY_PROVENANCE.docs || `https://external-api.kalshi.com/trade-api/v2/series/${seriesTicker}`
      };
    }
    return {
      series_ticker: seriesTicker,
      fee_multiplier: 1,
      fee_type: 'quadratic',
      captured: false,
      captureSource: 'documented_default',
      zeroFee: false,
      makerFeesApply: false,
      // Absent from BOTH captures. The registry names it in
      // FEE_REGISTRY_COVERAGE.missing when the build knows the build could
      // trade it, which is the honest way to show a gap.
      note: 'Series object not captured in either the 2026-09-17 snapshot or the 2026-09-18 GET /series capture — using the documented taker default M=1. Verify with GET /series/{ticker}.',
      pdfCrossCheck: pdfFeeCrossCheck(seriesTicker, 1)
    };
  }
  return {
    series_ticker: seriesTicker,
    fee_multiplier: s.fee_multiplier,
    fee_type: s.fee_type || 'quadratic',
    captured: true,
    captureSource: 'snapshot_2026-09-17',
    zeroFee: s.fee_multiplier === 0,
    makerFeesApply: s.fee_type === 'quadratic_with_maker_fees',
    pdfCrossCheck: pdfFeeCrossCheck(seriesTicker, s.fee_multiplier, s.fee_type),
    url: s._provenance?.url || `https://external-api.kalshi.com/trade-api/v2/series/${seriesTicker}`
  };
}

/* ------------------------------------------------------------------ *
 * 4. NEGATIVE EVIDENCE — series tickers that DO NOT EXIST
 *    These 404s are the proof that the previous catalog was fabricated.
 * ------------------------------------------------------------------ */
export const SERIES_NOT_FOUND = Object.freeze([
  { ticker: 'KXNVDA', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNVDA', response: { error: { code: 'not_found', message: 'not found' } }, capturedAt: '2026-09-17' },
  { ticker: 'KXSP500', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXSP500', response: { error: { code: 'not_found', message: 'not found' } }, capturedAt: '2026-09-17' },
  { ticker: 'KXAAPL', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXAAPL', response: { error: { code: 'not_found', message: 'not found' } }, capturedAt: '2026-09-17' }
]);

/* ------------------------------------------------------------------ *
 * 5. GET /series?category=Companies — real single-company series
 *    (subset captured; response was paginated/chunked)
 * ------------------------------------------------------------------ */
export const COMPANY_SERIES = Object.freeze({
  _provenance: {
    url: 'https://external-api.kalshi.com/trade-api/v2/series?category=Companies&limit=100',
    doc: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    capturedAt: '2026-09-17',
    note: 'Subset of the returned array, transcribed verbatim.'
  },
  series: [
    { ticker: 'KXABNBA', title: 'Airbnb Annual KPI', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXKLAR', title: 'Klarna KPI', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['Companies', 'KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXRELYA', title: 'Remitly annual kpi', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXGRAB', title: 'Grab Holdings KPI', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['Companies', 'KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXTOLA', title: 'Toll Brothers Annual KPI', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXFA', title: 'Ford Annual KPI', category: 'Companies', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'KXTSLA', title: 'Tesla KPI', category: 'Financials', categories: ['Financials', 'Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'one_off', tags: ['Companies', 'KPIs'], settlement_sources: [{ name: 'Fiscal.ai', url: 'https://fiscal.ai' }] },
    { ticker: 'OPENAIBOARD', title: 'OpenAI board members leaving', category: 'Companies', categories: ['Companies'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'custom', tags: ['GPT'], settlement_sources: [{ name: 'Bloomberg', url: 'https://www.bloomberg.com/' }, { name: 'OpenAI', url: 'https://openai.com/' }] },
    { ticker: 'SWITCH2', title: 'New Nintendo Console announced', category: 'Companies', categories: ['Companies', 'Entertainment'], fee_multiplier: 1, fee_type: 'quadratic', frequency: 'custom', tags: ['Product launches', 'Video games'], settlement_sources: [{ name: 'Nintendo', url: 'https://www.nintendo.com/us/' }] }
  ]
});

/* ------------------------------------------------------------------ *
 * 6. GET /markets?series_ticker=...&status=open  — REAL market objects
 *    Transcribed VERBATIM (all fields present in the live response).
 * ------------------------------------------------------------------ */
export const MARKETS = Object.freeze([
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2026-12-31T21:00:00Z', created_time: '2025-12-22T20:38:41.755047Z',
    event_ticker: 'KXNASDAQ100Y-26DEC31H1600', exchange_index: 0, expected_expiration_time: '2026-12-31T21:00:00Z',
    expiration_time: '2027-01-08T00:00:00Z', expiration_value: '', floor_strike: 33000,
    last_price_dollars: '0.1300', latest_expiration_time: '2027-01-08T00:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.8800', no_bid_dollars: '0.8700', no_sub_title: '33,000.01 or above',
    notional_value_dollars: '1.0000', open_interest_fp: '162977.28', open_time: '2025-12-23T15:00:00Z',
    previous_price_dollars: '0.0900', previous_yes_ask_dollars: '0.0900', previous_yes_bid_dollars: '0.0800',
    price_level_structure: 'linear_cent', price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }],
    result: '',
    rules_primary: 'If the Nasdaq 100 index value on Dec 31, 2026 at 4pm EST is above 33000, then the market resolves to Yes.',
    rules_secondary: 'The market will close on December 31, 2026. The market will expire at the sooner of the first release of the data, or one week after December 31, 2026.\n\nPursuant to the Kalshi Rulebook, the Exchange has modified the Source Agency and Underlying for indices markets. See the rules for more information.',
    settlement_timer_seconds: 60, status: 'active', strike_type: 'greater', subtitle: '33,000.01 or above',
    ticker: 'KXNASDAQ100Y-26DEC31H1600-T33000',
    title: 'Will the Nasdaq-100 be above 33000 at the end of Dec 31, 2026 at 4pm EST?',
    updated_time: '2026-04-09T09:41:46.616883Z', volume_24h_fp: '6987.01', volume_fp: '395554.67',
    yes_ask_dollars: '0.1300', yes_ask_size_fp: '30.75', yes_bid_dollars: '0.1200', yes_bid_size_fp: '100160.14',
    yes_sub_title: '33,000.01 or above', series_ticker: 'KXNASDAQ100Y'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, cap_strike: 19000, close_time: '2026-12-31T21:00:00Z', created_time: '2025-12-22T20:38:41.755047Z',
    event_ticker: 'KXNASDAQ100Y-26DEC31H1600', exchange_index: 0, expected_expiration_time: '2026-12-31T21:00:00Z',
    expiration_time: '2027-01-08T00:00:00Z', expiration_value: '',
    last_price_dollars: '0.0400', latest_expiration_time: '2027-01-08T00:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9700', no_bid_dollars: '0.9600', no_sub_title: '18,999.99 or below',
    notional_value_dollars: '1.0000', open_interest_fp: '1112968.95', open_time: '2025-12-23T15:00:00Z',
    previous_price_dollars: '0.0300', previous_yes_ask_dollars: '0.0400', previous_yes_bid_dollars: '0.0300',
    price_level_structure: 'linear_cent', price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }],
    result: '',
    rules_primary: 'If the Nasdaq 100 index value on Dec 31, 2026 at 4pm EST is below 19000, then the market resolves to Yes.',
    rules_secondary: 'The market will close on December 31, 2026. The market will expire at the sooner of the first release of the data, or one week after December 31, 2026.\n\nPursuant to the Kalshi Rulebook, the Exchange has modified the Source Agency and Underlying for indices markets. See the rules for more information.',
    settlement_timer_seconds: 60, status: 'active', strike_type: 'less', subtitle: '18,999.99 or below',
    ticker: 'KXNASDAQ100Y-26DEC31H1600-T19000',
    title: 'Will the Nasdaq-100 be below 19000 at the end of Dec 31, 2026 at 4pm EST?',
    updated_time: '2026-04-09T09:41:43.666782Z', volume_24h_fp: '1.00', volume_fp: '1269612.01',
    yes_ask_dollars: '0.0400', yes_ask_size_fp: '659.00', yes_bid_dollars: '0.0300', yes_bid_size_fp: '100584.42',
    yes_sub_title: '18,999.99 or below', series_ticker: 'KXNASDAQ100Y'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXINXY&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, cap_strike: 4600, close_time: '2027-12-31T21:00:00Z', created_time: '2026-08-17T14:31:24.178023Z',
    custom_strike: { Index: 'S&P 500' }, event_ticker: 'KXINXY-27DEC31H1600', exchange_index: 0,
    expected_expiration_time: '2027-12-31T21:00:00Z', expiration_time: '2028-01-08T00:00:00Z', expiration_value: '',
    last_price_dollars: '0.0000', latest_expiration_time: '2028-01-08T00:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9900', no_bid_dollars: '0.9400', no_sub_title: '4,599.99 or below',
    notional_value_dollars: '1.0000', occurrence_datetime: '2027-12-31T21:00:00Z', open_interest_fp: '0.00',
    open_time: '2026-08-17T16:00:00Z', previous_price_dollars: '0.0000', previous_yes_ask_dollars: '0.0500',
    previous_yes_bid_dollars: '0.0200', price_level_structure: 'linear_cent',
    price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }], result: '',
    rules_primary: 'If the S&P 500 index value on Dec 31, 2027 at 4pm EST is below 4600, then the market resolves to Yes.',
    rules_secondary: 'The market will close on December 31, 2027. The market will expire at the sooner of the first release of the data, or one week after December 31, 2027.\n\nPursuant to the Kalshi Rulebook, the Exchange has modified the Source Agency and Underlying for indices markets. See the rules for more information.',
    settlement_timer_seconds: 60, status: 'active', strike_type: 'less', subtitle: '4,599.99 or below',
    ticker: 'KXINXY-27DEC31H1600-T4600',
    title: 'Will the S&P 500 be below 4600 on Dec 31, 2027 at 4pm EST?',
    updated_time: '2026-08-17T16:00:01.542069Z', volume_24h_fp: '0.00', volume_fp: '0.00',
    yes_ask_dollars: '0.0600', yes_ask_size_fp: '260.00', yes_bid_dollars: '0.0100', yes_bid_size_fp: '10.00',
    yes_sub_title: '4,599.99 or below', series_ticker: 'KXINXY'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXTSLA&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2027-01-30T04:00:00Z', created_time: '2026-07-09T19:43:22.004525Z',
    custom_strike: { company: '9d576d30-5833-560b-bf9a-9b7a1acb57dc' },
    early_close_condition: 'This market will close and expire early if the event occurs.',
    event_ticker: 'KXTSLA-26OCTPROD', exchange_index: 0, expected_expiration_time: '2027-01-30T04:00:00Z',
    expiration_time: '2027-01-30T04:00:00Z', expiration_value: '', floor_strike: 500000,
    last_price_dollars: '0.1400', latest_expiration_time: '2027-01-30T04:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9800', no_bid_dollars: '0.8900', no_sub_title: 'Above 500000',
    notional_value_dollars: '1.0000', occurrence_datetime: '2026-10-04T04:00:00Z', open_interest_fp: '13.83',
    open_time: '2026-07-09T20:43:00Z', previous_price_dollars: '0.1400', previous_yes_ask_dollars: '0.1300',
    previous_yes_bid_dollars: '0.0400', price_level_structure: 'linear_cent',
    price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }], result: '',
    rules_primary: 'If Tesla Inc. reports Above 500000 total production in Q3 2026, then the market resolves to Yes.',
    rules_secondary: 'Kalshi is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the underlying company. All trademarks, logos, and brand names are the property of their respective owners.',
    settlement_timer_seconds: 1800, status: 'active', strike_type: 'greater',
    ticker: 'KXTSLA-26OCTPROD-500000',
    title: 'Will Tesla Inc. report Above 500000 total production in Q3 2026?',
    updated_time: '2026-08-04T18:47:36.451419Z', volume_24h_fp: '0.00', volume_fp: '23.83',
    yes_ask_dollars: '0.1100', yes_ask_size_fp: '200.00', yes_bid_dollars: '0.0200', yes_bid_size_fp: '5.00',
    yes_sub_title: 'Above 500000', no_sub_title_verbatim: 'Above 500000', series_ticker: 'KXTSLA'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXTSLA&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2027-01-30T04:00:00Z', created_time: '2026-07-09T19:43:22.004525Z',
    custom_strike: { company: '9d576d30-5833-560b-bf9a-9b7a1acb57dc' },
    early_close_condition: 'This market will close and expire early if the event occurs.',
    event_ticker: 'KXTSLA-26OCTPROD', exchange_index: 0, expected_expiration_time: '2027-01-30T04:00:00Z',
    expiration_time: '2027-01-30T04:00:00Z', expiration_value: '', floor_strike: 505000,
    last_price_dollars: '0.0400', latest_expiration_time: '2027-01-30T04:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9300', no_bid_dollars: '0.9100', no_sub_title: 'Above 505000',
    notional_value_dollars: '1.0000', occurrence_datetime: '2026-10-04T04:00:00Z', open_interest_fp: '40.00',
    open_time: '2026-07-09T20:43:00Z', previous_price_dollars: '0.0400', previous_yes_ask_dollars: '0.1100',
    previous_yes_bid_dollars: '0.0700', price_level_structure: 'linear_cent',
    price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }], result: '',
    rules_primary: 'If Tesla Inc. reports Above 505000 total production in Q3 2026, then the market resolves to Yes.',
    rules_secondary: 'Kalshi is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the underlying company. All trademarks, logos, and brand names are the property of their respective owners.',
    settlement_timer_seconds: 1800, status: 'active', strike_type: 'greater',
    ticker: 'KXTSLA-26OCTPROD-505000',
    title: 'Will Tesla Inc. report Above 505000 total production in Q3 2026?',
    updated_time: '2026-08-04T18:47:36.451419Z', volume_24h_fp: '0.00', volume_fp: '40.01',
    yes_ask_dollars: '0.0900', yes_ask_size_fp: '1.00', yes_bid_dollars: '0.0700', yes_bid_size_fp: '35.00',
    yes_sub_title: 'Above 505000', series_ticker: 'KXTSLA'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXFA&status=open&limit=2', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2028-03-31T05:00:00Z', created_time: '2026-06-09T21:18:07.083508Z',
    custom_strike: { company: '615f70db-6503-59fc-8c08-f8221dcd5bb7' },
    early_close_condition: 'This market will close and expire early if the event occurs.',
    event_ticker: 'KXFA-28JANUSSALES', exchange_index: 0, expected_expiration_time: '2028-01-31T21:00:00Z',
    expiration_time: '2028-03-31T05:00:00Z', expiration_value: '', floor_strike: 2300000,
    last_price_dollars: '0.0200', latest_expiration_time: '2028-03-31T05:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '1.0000', no_bid_dollars: '0.9800', no_sub_title: 'Above 2.3 million',
    notional_value_dollars: '1.0000', occurrence_datetime: '2028-01-31T21:00:00Z', open_interest_fp: '2697.31',
    open_time: '2026-06-09T22:17:00Z', previous_price_dollars: '0.0200', previous_yes_ask_dollars: '0.0200',
    previous_yes_bid_dollars: '0.0000', price_level_structure: 'linear_cent',
    price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }], result: '',
    rules_primary: 'If Ford Motor Company reports Above 2300000.0 u.s. vehicle sales volume in 2026, then the market resolves to Yes.',
    rules_secondary: 'Kalshi is not affiliated, associated, authorized, endorsed by, or in any way officially connected with the underlying company. All trademarks, logos, and brand names are the property of their respective owners.',
    settlement_timer_seconds: 1800, status: 'active', strike_type: 'greater',
    ticker: 'KXFA-28JANUSSALES-2300000.0',
    title: 'Will Ford Motor Company report Above 2.3 million u.s. vehicle sales volume in 2026?',
    updated_time: '2026-08-04T18:47:36.451419Z', volume_24h_fp: '0.00', volume_fp: '3216.12',
    yes_ask_dollars: '0.0200', yes_ask_size_fp: '1000.00', yes_bid_dollars: '0.0000', yes_bid_size_fp: '0.00',
    yes_sub_title: 'Above 2.3 million', series_ticker: 'KXFA'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXCPIYOY&status=open&limit=3', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2027-01-13T13:29:00Z', created_time: '2026-09-17T15:48:49.138627Z',
    event_ticker: 'KXCPIYOY-26DEC', exchange_index: 0, expected_expiration_time: '2027-01-13T15:00:00Z',
    expiration_time: '2027-04-14T15:00:00Z', expiration_value: '', floor_strike: 4.9,
    last_price_dollars: '0.9400', latest_expiration_time: '2027-04-14T15:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9200', no_bid_dollars: '0.3100', no_sub_title: 'Above 4.9%',
    notional_value_dollars: '1.0000', occurrence_datetime: '2027-01-13T15:00:00Z', open_interest_fp: '1280.00',
    open_time: '2026-09-17T16:30:00Z', previous_price_dollars: '0.0000', previous_yes_ask_dollars: '0.0000',
    previous_yes_bid_dollars: '0.0000', price_level_structure: 'linear_cent',
    price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }], result: '',
    rules_primary: 'If the Consumer Price Index (CPI) increases by more than 4.9% in the twelve months ending December 2026 (as represented by the one-decimal place value reported by the Bureau of Labor Statistics), then the market resolves to Yes.',
    rules_secondary: "In the case of a delay in data caused by a federal government shutdown impacting the reliability of the Source Agency, the market's latest Expiration Date will be extended to the sooner of the release of the Underlying or six months after the end of the government shutdown",
    settlement_timer_seconds: 300, status: 'active', strike_type: 'greater', subtitle: '4.9',
    ticker: 'KXCPIYOY-26DEC-T4.9',
    title: 'Will the rate of CPI inflation be above 4.9% for the year ending in December 2026?',
    updated_time: '2026-09-17T16:30:01.049641Z', volume_24h_fp: '1930.00', volume_fp: '1930.00',
    yes_ask_dollars: '0.6900', yes_ask_size_fp: '16.00', yes_bid_dollars: '0.0800', yes_bid_size_fp: '25.00',
    yes_sub_title: 'Above 4.9%', series_ticker: 'KXCPIYOY'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXFEDDECISION&status=open&limit=2', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2028-01-26T18:59:00Z', created_time: '2025-10-02T21:53:09.691882Z',
    custom_strike: { Hike: '25' }, event_ticker: 'KXFEDDECISION-28JAN', exchange_index: 0,
    expected_expiration_time: '2028-01-26T19:05:00Z', expiration_time: '2028-04-26T19:01:00Z', expiration_value: '',
    last_price_dollars: '0.1900', latest_expiration_time: '2028-04-26T19:01:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.8900', no_bid_dollars: '0.7100', no_sub_title: 'Hike 25bps',
    notional_value_dollars: '1.0000', open_interest_fp: '180.00', open_time: '2025-10-06T14:00:00Z',
    previous_price_dollars: '0.1900', previous_yes_ask_dollars: '0.2600', previous_yes_bid_dollars: '0.1200',
    price_level_structure: 'linear_cent', price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0100' }],
    result: '',
    rules_primary: 'If the Federal Reserve does a Hike of 25bps on January 26, 2028, then the market resolves to Yes.',
    rules_secondary: 'This market is mutually exclusive. Therefore, if the Federal Reserve hikes by 50bps, the 50bps market will resolve to Yes and the 25bps market will resolve to No. Only one bucket, at maximum, can resolve to Yes. Note 4/28/25: For the markets beginning after the May meeting, if a scheduled FOMC meeting is canceled and does not occur on its scheduled date, then the strike for "Fed maintains rate" will resolve to Yes and all others will resolve to No.',
    settlement_timer_seconds: 297, status: 'active', strike_type: 'custom', subtitle: 'Hike 25bps',
    ticker: 'KXFEDDECISION-28JAN-H25',
    title: 'Will the Federal Reserve Hike rates by 25bps at their January 2028 meeting?',
    updated_time: '2026-04-09T14:07:31.543143Z', volume_24h_fp: '0.00', volume_fp: '598.70',
    yes_ask_dollars: '0.2900', yes_ask_size_fp: '18.00', yes_bid_dollars: '0.1100', yes_bid_size_fp: '38.00',
    yes_sub_title: 'Hike 25bps', series_ticker: 'KXFEDDECISION'
  },
  {
    _provenance: { url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXBTCY&status=open&limit=2', capturedAt: '2026-09-17' },
    can_close_early: true, close_time: '2027-01-01T05:00:00Z', created_time: '2026-02-25T23:22:31.120692Z',
    event_ticker: 'KXBTCY-27JAN0100', exchange_index: 0, expected_expiration_time: '2027-01-01T05:05:00Z',
    expiration_time: '2027-01-08T05:00:00Z', expiration_value: '', floor_strike: 149999.99,
    last_price_dollars: '0.0160', latest_expiration_time: '2027-01-08T05:00:00Z', liquidity_dollars: '0.0000',
    market_type: 'binary', no_ask_dollars: '0.9850', no_bid_dollars: '0.9840', no_sub_title: '150,000 or above',
    notional_value_dollars: '1.0000', open_interest_fp: '434414.96', open_time: '2026-02-25T23:25:29Z',
    previous_price_dollars: '0.0160', previous_yes_ask_dollars: '0.0160', previous_yes_bid_dollars: '0.0130',
    price_level_structure: 'deci_cent', price_ranges: [{ end: '1.0000', start: '0.0000', step: '0.0010' }],
    result: '',
    rules_primary: "If the simple average of the sixty seconds of CF Benchmarks' BRTI before 12 AM EST is above 149999.99 at 12 AM EST on Jan 1, 2027, then the market resolves to Yes.",
    rules_secondary: "Not all cryptocurrency price data is the same. While checking a source like Google or Coinbase may help guide your decision, the price used to determine this market is based on CF Benchmarks' corresponding Real Time Index (RTI). At the last minute before expiration, 60 RTI prices are collected. The official and final value is the average of these prices.",
    settlement_timer_seconds: 60, status: 'active', strike_type: 'greater',
    ticker: 'KXBTCY-27JAN0100-T149999.99',
    title: 'BTC price  on Jan 1, 2027?',
    updated_time: '2026-04-09T10:28:28.983572Z', volume_24h_fp: '4616.52', volume_fp: '2032361.22',
    yes_ask_dollars: '0.0160', yes_ask_size_fp: '2471.53', yes_bid_dollars: '0.0150', yes_bid_size_fp: '14.31',
    yes_sub_title: '150,000 or above', series_ticker: 'KXBTCY'
  }
]);

/* ------------------------------------------------------------------ *
 * 7. GET /markets/{ticker}/orderbook — REAL full depth
 *    Verbatim. Note the sparse, uneven ladder and fractional sizes —
 *    this is what real Kalshi liquidity looks like, and it is what the
 *    simulator's book model is calibrated against.
 * ------------------------------------------------------------------ */
export const ORDERBOOKS = Object.freeze({
  _provenance: {
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook',
    doc: 'https://docs.kalshi.com/getting_started/orderbook_responses',
    capturedAt: '2026-09-17',
    captures: 2,
    note:
      'Two separate live captures of the SAME endpoint on 2026-09-17. Capture 2 is the primary reference book; ' +
      'capture 1 is archived below because two of its size values could not be re-confirmed (see IRREGULARITIES.md #17).'
  },

  /**
   * CAPTURE 2 (PRIMARY) — verbatim live response, 2026-09-17 (~19:40 UTC).
   * Arrays are ASCENDING by price, exactly as Kalshi returns them: the best
   * (highest) YES bid is the LAST yes_dollars entry, and the best NO bid is the
   * LAST no_dollars entry. parseKalshiOrderbook() sorts before use.
   *
   * RECIPROCAL CROSS-CHECK (passes):
   *   best NO bid 0.8700  =>  implied YES ask 1 - 0.8700 = 0.1300
   *   the market object captured minutes earlier reports yes_ask_dollars "0.1300"  ✓
   *   best YES bid 0.1100 =>  implied NO ask 0.8900; YES spread 0.1100/0.1300 = 2 ticks,
   *   consistent with price_level_structure "linear_cent" (step 0.0100)  ✓
   */
  'KXNASDAQ100Y-26DEC31H1600-T33000': {
    _capture: {
      id: 'capture-2',
      role: 'primary',
      capturedAt: '2026-09-17',
      capturedAtUtcApprox: '2026-09-17T19:40Z',
      url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook',
      yesLevels: 9,
      noLevels: 35,
      bestYesBid: '0.1100',
      bestNoBid: '0.8700',
      reciprocalCheck: 'PASS — implied YES ask 0.1300 matches the market object captured the same session'
    },
    orderbook_fp: {
      no_dollars: [
        ['0.0100', '491.86'], ['0.0400', '15.01'], ['0.0600', '26.68'], ['0.1300', '10.00'],
        ['0.1700', '119.74'], ['0.1800', '62.48'], ['0.2100', '792.19'], ['0.2200', '80.40'],
        ['0.2500', '307.03'], ['0.2600', '5.44'], ['0.2700', '8.68'], ['0.3100', '99.13'],
        ['0.3400', '57.20'], ['0.4000', '79.54'], ['0.4200', '10.44'], ['0.4300', '159.05'],
        ['0.4400', '18.32'], ['0.4600', '10.69'], ['0.4700', '21.47'], ['0.4900', '15.11'],
        ['0.5200', '3.88'], ['0.5500', '62.92'], ['0.6100', '72.50'], ['0.6200', '21.47'],
        ['0.6400', '7.83'], ['0.6800', '3.43'], ['0.7600', '80.00'], ['0.7700', '42.86'],
        ['0.7800', '5.00'], ['0.8100', '25.00'], ['0.8300', '81.49'], ['0.8400', '395.00'],
        ['0.8500', '10.00'], ['0.8600', '4991.32'], ['0.8700', '84.78']
      ],
      yes_dollars: [
        ['0.0100', '391.61'], ['0.0200', '143.00'], ['0.0300', '109.14'], ['0.0400', '113.00'],
        ['0.0500', '47.86'], ['0.0600', '60.73'], ['0.0800', '80.00'], ['0.0900', '133.28'],
        ['0.1100', '71.00']
      ]
    }
  },

  /**
   * CAPTURE 1 (ARCHIVED) — earlier live response for the same endpoint, 2026-09-17.
   * Retained verbatim as evidence for IRREGULARITIES.md #17: two sizes
   * (YES 0.1200 @ 100242.25 and NO 0.8300 @ 100076.49) could not be re-confirmed,
   * and the market object captured the same session reported yes_bid_size_fp
   * "242.25" at 0.1200 — contradicting 100242.25 at the same price level.
   * This capture is NOT used by the simulator.
   */
  'KXNASDAQ100Y-26DEC31H1600-T33000@capture-1': {
    _capture: {
      id: 'capture-1',
      role: 'archived_evidence',
      capturedAt: '2026-09-17',
      usedBySimulator: false,
      reason: 'Two depth values unverifiable and contradicted by the market object; superseded by capture-2.',
      irregularity: '#17'
    },
    orderbook_fp: {
      no_dollars: [
        ['0.0100', '656.86'], ['0.0400', '15.01'], ['0.0600', '26.68'], ['0.1300', '10.00'],
        ['0.1700', '119.74'], ['0.1800', '62.48'], ['0.2100', '792.19'], ['0.2200', '80.40'],
        ['0.2500', '307.03'], ['0.2600', '5.44'], ['0.2700', '8.68'], ['0.3100', '99.13'],
        ['0.3400', '57.20'], ['0.4000', '79.54'], ['0.4200', '10.44'], ['0.4300', '159.05'],
        ['0.4400', '18.32'], ['0.4600', '10.69'], ['0.4700', '7.69'], ['0.4900', '15.11'],
        ['0.5200', '3.88'], ['0.5500', '62.92'], ['0.6100', '72.50'], ['0.6200', '7.69'],
        ['0.6400', '7.83'], ['0.6800', '3.43'], ['0.7600', '80.00'], ['0.7700', '15.36'],
        ['0.7800', '5.00'], ['0.8100', '25.00'], ['0.8300', '100076.49'], ['0.8400', '545.00'],
        ['0.8500', '58.00'], ['0.8600', '4896.32'], ['0.8700', '30.75']
      ],
      yes_dollars: [
        ['0.0100', '584.61'], ['0.0200', '140.00'], ['0.0300', '96.00'], ['0.0500', '22.51'],
        ['0.0600', '60.73'], ['0.0800', '80.00'], ['0.0900', '9.66'], ['0.1100', '435.00'],
        ['0.1200', '100242.25']
      ]
    }
  }
});

/* ------------------------------------------------------------------ *
 * 8. Candlesticks — REAL OHLC history (period_interval=1440 = daily)
 *    Endpoint (verified): GET /series/{series_ticker}/markets/{ticker}/candlesticks
 *    Schema doc: https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 * ------------------------------------------------------------------ */
export const CANDLESTICKS = Object.freeze({
  'KXBTCY-27JAN0100-T149999.99': {
    _provenance: {
      url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440',
      capturedAt: '2026-09-17',
      periodIntervalMinutes: 1440,
      windowHuman: '2026-09-03 .. 2026-09-17 (14 daily candles)'
    },
    ticker: 'KXBTCY-27JAN0100-T149999.99',
    candlesticks: [
      { end_period_ts: 1788408000, open_interest_fp: '403280.10', volume_fp: '3241.20', price: { close_dollars: '0.0160', high_dollars: '0.0280', low_dollars: '0.0160', mean_dollars: '0.0199', open_dollars: '0.0270', previous_dollars: '0.0190' }, yes_ask: { close_dollars: '0.0200', high_dollars: '0.0280', low_dollars: '0.0190', open_dollars: '0.0270' }, yes_bid: { close_dollars: '0.0160', high_dollars: '0.0200', low_dollars: '0.0160', open_dollars: '0.0190' } },
      { end_period_ts: 1788494400, open_interest_fp: '411687.27', volume_fp: '8483.14', price: { close_dollars: '0.0260', high_dollars: '0.0290', low_dollars: '0.0160', mean_dollars: '0.0254', open_dollars: '0.0160', previous_dollars: '0.0160' }, yes_ask: { close_dollars: '0.0260', high_dollars: '0.0290', low_dollars: '0.0190', open_dollars: '0.0200' }, yes_bid: { close_dollars: '0.0170', high_dollars: '0.0230', low_dollars: '0.0160', open_dollars: '0.0160' } },
      { end_period_ts: 1788580800, open_interest_fp: '413901.14', volume_fp: '2248.55', price: { close_dollars: '0.0280', high_dollars: '0.0280', low_dollars: '0.0220', mean_dollars: '0.0258', open_dollars: '0.0220', previous_dollars: '0.0260' }, yes_ask: { close_dollars: '0.0270', high_dollars: '0.0280', low_dollars: '0.0250', open_dollars: '0.0260' }, yes_bid: { close_dollars: '0.0240', high_dollars: '0.0250', low_dollars: '0.0170', open_dollars: '0.0170' } },
      { end_period_ts: 1788667200, open_interest_fp: '414118.60', volume_fp: '3231.27', price: { close_dollars: '0.0240', high_dollars: '0.0280', low_dollars: '0.0160', mean_dollars: '0.0210', open_dollars: '0.0250', previous_dollars: '0.0280' }, yes_ask: { close_dollars: '0.0240', high_dollars: '0.0280', low_dollars: '0.0180', open_dollars: '0.0270' }, yes_bid: { close_dollars: '0.0180', high_dollars: '0.0240', low_dollars: '0.0160', open_dollars: '0.0240' } },
      { end_period_ts: 1788753600, open_interest_fp: '417976.43', volume_fp: '4950.92', price: { close_dollars: '0.0270', high_dollars: '0.0290', low_dollars: '0.0170', mean_dollars: '0.0258', open_dollars: '0.0240', previous_dollars: '0.0240' }, yes_ask: { close_dollars: '0.0240', high_dollars: '0.0290', low_dollars: '0.0190', open_dollars: '0.0240' }, yes_bid: { close_dollars: '0.0210', high_dollars: '0.0210', low_dollars: '0.0170', open_dollars: '0.0180' } },
      { end_period_ts: 1788840000, open_interest_fp: '421075.47', volume_fp: '3125.68', price: { close_dollars: '0.0210', high_dollars: '0.0290', low_dollars: '0.0210', mean_dollars: '0.0236', open_dollars: '0.0210', previous_dollars: '0.0270' }, yes_ask: { close_dollars: '0.0210', high_dollars: '0.0290', low_dollars: '0.0210', open_dollars: '0.0240' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0220', low_dollars: '0.0200', open_dollars: '0.0210' } },
      { end_period_ts: 1788926400, open_interest_fp: '421076.63', volume_fp: '6.16', price: { close_dollars: '0.0270', high_dollars: '0.0280', low_dollars: '0.0270', mean_dollars: '0.0273', open_dollars: '0.0270', previous_dollars: '0.0210' }, yes_ask: { close_dollars: '0.0270', high_dollars: '0.0280', low_dollars: '0.0210', open_dollars: '0.0210' }, yes_bid: { close_dollars: '0.0190', high_dollars: '0.0270', low_dollars: '0.0180', open_dollars: '0.0200' } },
      { end_period_ts: 1789012800, open_interest_fp: '417475.47', volume_fp: '6569.30', price: { close_dollars: '0.0100', high_dollars: '0.0280', low_dollars: '0.0100', mean_dollars: '0.0142', open_dollars: '0.0270', previous_dollars: '0.0270' }, yes_ask: { close_dollars: '0.0170', high_dollars: '0.0280', low_dollars: '0.0110', open_dollars: '0.0270' }, yes_bid: { close_dollars: '0.0100', high_dollars: '0.0230', low_dollars: '0.0100', open_dollars: '0.0190' } },
      { end_period_ts: 1789099200, open_interest_fp: '417475.47', volume_fp: '2038.12', price: { close_dollars: '0.0110', high_dollars: '0.0170', low_dollars: '0.0110', mean_dollars: '0.0111', open_dollars: '0.0170', previous_dollars: '0.0100' }, yes_ask: { close_dollars: '0.0140', high_dollars: '0.0180', low_dollars: '0.0110', open_dollars: '0.0170' }, yes_bid: { close_dollars: '0.0110', high_dollars: '0.0110', low_dollars: '0.0100', open_dollars: '0.0100' } },
      { end_period_ts: 1789185600, open_interest_fp: '417351.55', volume_fp: '387.37', price: { close_dollars: '0.0100', high_dollars: '0.0160', low_dollars: '0.0100', mean_dollars: '0.0122', open_dollars: '0.0140', previous_dollars: '0.0110' }, yes_ask: { close_dollars: '0.0140', high_dollars: '0.0170', low_dollars: '0.0140', open_dollars: '0.0140' }, yes_bid: { close_dollars: '0.0110', high_dollars: '0.0130', low_dollars: '0.0100', open_dollars: '0.0110' } },
      { end_period_ts: 1789272000, open_interest_fp: '417655.82', volume_fp: '421.44', price: { close_dollars: '0.0130', high_dollars: '0.0190', low_dollars: '0.0110', mean_dollars: '0.0163', open_dollars: '0.0140', previous_dollars: '0.0100' }, yes_ask: { close_dollars: '0.0180', high_dollars: '0.0190', low_dollars: '0.0140', open_dollars: '0.0140' }, yes_bid: { close_dollars: '0.0100', high_dollars: '0.0180', low_dollars: '0.0100', open_dollars: '0.0110' } },
      { end_period_ts: 1789358400, open_interest_fp: '419575.85', volume_fp: '2124.71', price: { close_dollars: '0.0110', high_dollars: '0.0200', low_dollars: '0.0110', mean_dollars: '0.0166', open_dollars: '0.0140', previous_dollars: '0.0130' }, yes_ask: { close_dollars: '0.0140', high_dollars: '0.0200', low_dollars: '0.0140', open_dollars: '0.0180' }, yes_bid: { close_dollars: '0.0100', high_dollars: '0.0150', low_dollars: '0.0100', open_dollars: '0.0100' } },
      { end_period_ts: 1789444800, open_interest_fp: '426637.95', volume_fp: '7322.89', price: { close_dollars: '0.0110', high_dollars: '0.0150', low_dollars: '0.0100', mean_dollars: '0.0141', open_dollars: '0.0140', previous_dollars: '0.0110' }, yes_ask: { close_dollars: '0.0140', high_dollars: '0.0160', low_dollars: '0.0110', open_dollars: '0.0140' }, yes_bid: { close_dollars: '0.0120', high_dollars: '0.0150', low_dollars: '0.0100', open_dollars: '0.0100' } },
      { end_period_ts: 1789531200, open_interest_fp: '429133.95', volume_fp: '2501.00', price: { close_dollars: '0.0190', high_dollars: '0.0190', low_dollars: '0.0120', mean_dollars: '0.0143', open_dollars: '0.0140', previous_dollars: '0.0110' }, yes_ask: { close_dollars: '0.0160', high_dollars: '0.0200', low_dollars: '0.0130', open_dollars: '0.0140' }, yes_bid: { close_dollars: '0.0140', high_dollars: '0.0160', low_dollars: '0.0120', open_dollars: '0.0120' } }
    ]
  },
  'KXNASDAQ100Y-26DEC31H1600-T33000': {
    _provenance: {
      url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1788998400&end_ts=1789603200&period_interval=1440',
      capturedAt: '2026-09-17',
      periodIntervalMinutes: 1440,
      windowHuman: '2026-09-10 .. 2026-09-17 (7 daily candles)'
    },
    ticker: 'KXNASDAQ100Y-26DEC31H1600-T33000',
    candlesticks: [
      { end_period_ts: 1789012800, open_interest_fp: '163829.39', volume_fp: '1191.60', price: { close_dollars: '0.1600', high_dollars: '0.1800', low_dollars: '0.1400', mean_dollars: '0.1769', open_dollars: '0.1600', previous_dollars: '0.1600' }, yes_ask: { close_dollars: '0.1800', high_dollars: '0.1800', low_dollars: '0.1600', open_dollars: '0.1600' }, yes_bid: { close_dollars: '0.1600', high_dollars: '0.1600', low_dollars: '0.1100', open_dollars: '0.1400' } },
      { end_period_ts: 1789099200, open_interest_fp: '163793.48', volume_fp: '544.68', price: { close_dollars: '0.1500', high_dollars: '0.1800', low_dollars: '0.1200', mean_dollars: '0.1438', open_dollars: '0.1800', previous_dollars: '0.1600' }, yes_ask: { close_dollars: '0.1500', high_dollars: '0.1800', low_dollars: '0.1500', open_dollars: '0.1800' }, yes_bid: { close_dollars: '0.1200', high_dollars: '0.1600', low_dollars: '0.1100', open_dollars: '0.1600' } },
      { end_period_ts: 1789185600, open_interest_fp: '163745.41', volume_fp: '258.35', price: { close_dollars: '0.1400', high_dollars: '0.1500', low_dollars: '0.1300', mean_dollars: '0.1404', open_dollars: '0.1500', previous_dollars: '0.1500' }, yes_ask: { close_dollars: '0.1500', high_dollars: '0.1600', low_dollars: '0.1400', open_dollars: '0.1500' }, yes_bid: { close_dollars: '0.1400', high_dollars: '0.1500', low_dollars: '0.1200', open_dollars: '0.1200' } },
      { end_period_ts: 1789272000, open_interest_fp: '163769.95', volume_fp: '258.86', price: { close_dollars: '0.1400', high_dollars: '0.1600', low_dollars: '0.1400', mean_dollars: '0.1505', open_dollars: '0.1400', previous_dollars: '0.1400' }, yes_ask: { close_dollars: '0.1600', high_dollars: '0.1600', low_dollars: '0.1500', open_dollars: '0.1500' }, yes_bid: { close_dollars: '0.1400', high_dollars: '0.1400', low_dollars: '0.1400', open_dollars: '0.1400' } },
      { end_period_ts: 1789358400, open_interest_fp: '162466.87', volume_fp: '2765.34', price: { close_dollars: '0.0600', high_dollars: '0.1500', low_dollars: '0.0600', mean_dollars: '0.1279', open_dollars: '0.1400', previous_dollars: '0.1400' }, yes_ask: { close_dollars: '0.1100', high_dollars: '0.1600', low_dollars: '0.1100', open_dollars: '0.1600' }, yes_bid: { close_dollars: '0.1000', high_dollars: '0.1400', low_dollars: '0.0600', open_dollars: '0.1400' } },
      { end_period_ts: 1789444800, open_interest_fp: '162281.82', volume_fp: '882.23', price: { close_dollars: '0.1200', high_dollars: '0.1400', low_dollars: '0.1000', mean_dollars: '0.1089', open_dollars: '0.1100', previous_dollars: '0.0600' }, yes_ask: { close_dollars: '0.1200', high_dollars: '0.1400', low_dollars: '0.1000', open_dollars: '0.1100' }, yes_bid: { close_dollars: '0.1100', high_dollars: '0.1200', low_dollars: '0.0700', open_dollars: '0.1000' } },
      { end_period_ts: 1789531200, open_interest_fp: '163049.45', volume_fp: '2458.84', price: { close_dollars: '0.0800', high_dollars: '0.1700', low_dollars: '0.0700', mean_dollars: '0.1200', open_dollars: '0.1100', previous_dollars: '0.1200' }, yes_ask: { close_dollars: '0.1000', high_dollars: '0.1700', low_dollars: '0.1000', open_dollars: '0.1200' }, yes_bid: { close_dollars: '0.0800', high_dollars: '0.1300', low_dollars: '0.0700', open_dollars: '0.1100' } }
    ]
  },
  'KXNASDAQ100Y-26DEC31H1600-T19000': {
    _provenance: {
      url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440',
      capturedAt: '2026-09-17',
      periodIntervalMinutes: 1440,
      windowHuman: '2026-09-03 .. 2026-09-17 (14 daily candles)'
    },
    ticker: 'KXNASDAQ100Y-26DEC31H1600-T19000',
    candlesticks: [
      { end_period_ts: 1788408000, open_interest_fp: '1103262.39', volume_fp: '2656.00', price: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0300', mean_dollars: '0.0300', open_dollars: '0.0300', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0300', low_dollars: '0.0200', open_dollars: '0.0300' } },
      { end_period_ts: 1788494400, open_interest_fp: '1104086.52', volume_fp: '833.16', price: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', mean_dollars: '0.0400', open_dollars: '0.0400', previous_dollars: '0.0400' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0200', open_dollars: '0.0200' } },
      { end_period_ts: 1788580800, open_interest_fp: '1104892.70', volume_fp: '989.82', price: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', mean_dollars: '0.0387', open_dollars: '0.0400', previous_dollars: '0.0400' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', open_dollars: '0.0300' } },
      { end_period_ts: 1788667200, open_interest_fp: '1104962.23', volume_fp: '338.50', price: { close_dollars: '0.0200', high_dollars: '0.0400', low_dollars: '0.0200', mean_dollars: '0.0338', open_dollars: '0.0400', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0300', low_dollars: '0.0200', open_dollars: '0.0300' } },
      { end_period_ts: 1788753600, open_interest_fp: '1106142.13', volume_fp: '1254.93', price: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', mean_dollars: '0.0314', open_dollars: '0.0300', previous_dollars: '0.0200' }, yes_ask: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0300' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0200', low_dollars: '0.0200', open_dollars: '0.0200' } },
      { end_period_ts: 1788840000, open_interest_fp: '1106088.72', volume_fp: '106.53', price: { close_dollars: '0.0200', high_dollars: '0.0400', low_dollars: '0.0200', mean_dollars: '0.0240', open_dollars: '0.0200', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0300' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0200', low_dollars: '0.0200', open_dollars: '0.0200' } },
      { end_period_ts: 1788926400, open_interest_fp: '1110982.72', volume_fp: '6358.14', price: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0200', mean_dollars: '0.0378', open_dollars: '0.0300', previous_dollars: '0.0200' }, yes_ask: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0300' }, yes_bid: { close_dollars: '0.0100', high_dollars: '0.0300', low_dollars: '0.0100', open_dollars: '0.0200' } },
      { end_period_ts: 1789012800, open_interest_fp: '1110983.84', volume_fp: '1025.15', price: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', mean_dollars: '0.0300', open_dollars: '0.0300', previous_dollars: '0.0400' }, yes_ask: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', open_dollars: '0.0300' }, yes_bid: { close_dollars: '0.0200', high_dollars: '0.0300', low_dollars: '0.0100', open_dollars: '0.0100' } },
      { end_period_ts: 1789099200, open_interest_fp: '1113087.95', volume_fp: '2136.57', price: { close_dollars: '0.0700', high_dollars: '0.0700', low_dollars: '0.0300', mean_dollars: '0.0411', open_dollars: '0.0300', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0600', high_dollars: '0.0700', low_dollars: '0.0300', open_dollars: '0.0300' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0200', open_dollars: '0.0200' } },
      { end_period_ts: 1789185600, open_interest_fp: '1113087.95', volume_fp: '154.61', price: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0300', mean_dollars: '0.0330', open_dollars: '0.0400', previous_dollars: '0.0700' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0600', low_dollars: '0.0400', open_dollars: '0.0600' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0400', low_dollars: '0.0200', open_dollars: '0.0300' } },
      { end_period_ts: 1789272000, open_interest_fp: '1113037.95', volume_fp: '50.00', price: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', mean_dollars: '0.0300', open_dollars: '0.0300', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', open_dollars: '0.0300' } },
      { end_period_ts: 1789358400, open_interest_fp: '1113037.95', volume_fp: '0.00', price: { previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', open_dollars: '0.0300' } },
      { end_period_ts: 1789444800, open_interest_fp: '1112967.95', volume_fp: '70.00', price: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', mean_dollars: '0.0300', open_dollars: '0.0300', previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', open_dollars: '0.0300' } },
      { end_period_ts: 1789531200, open_interest_fp: '1112967.95', volume_fp: '0.00', price: { previous_dollars: '0.0300' }, yes_ask: { close_dollars: '0.0400', high_dollars: '0.0400', low_dollars: '0.0400', open_dollars: '0.0400' }, yes_bid: { close_dollars: '0.0300', high_dollars: '0.0300', low_dollars: '0.0300', open_dollars: '0.0300' } }
    ]
  }
});

/* ------------------------------------------------------------------ *
 * Convenience accessors
 * ------------------------------------------------------------------ */

/** Deep-clone the verified markets (so callers can mutate freely). */
export function getVerifiedMarkets() {
  return JSON.parse(JSON.stringify(MARKETS.map(({ _provenance, ...m }) => ({ ...m, _provenance }))));
}

/** Look up a verified market by ticker. */
export function getVerifiedMarket(ticker) {
  return MARKETS.find((m) => m.ticker === ticker) || null;
}

/** Real captured orderbook for a ticker, or null. */
export function getVerifiedOrderbook(ticker) {
  return ORDERBOOKS[ticker] ? JSON.parse(JSON.stringify(ORDERBOOKS[ticker])) : null;
}

/** Real captured candlesticks for a ticker, or null. */
export function getVerifiedCandlesticks(ticker) {
  return CANDLESTICKS[ticker] ? JSON.parse(JSON.stringify(CANDLESTICKS[ticker])) : null;
}

/** fee_multiplier for a series, from the live Series object when captured. */
export function getSeriesFeeMultiplier(seriesTicker) {
  const s = SERIES[seriesTicker];
  return s && typeof s.fee_multiplier === 'number' ? s.fee_multiplier : null;
}

/** Tickers that were verified NOT to exist (used to block re-introduction). */
export function getNonexistentSeriesTickers() {
  return SERIES_NOT_FOUND.map((s) => s.ticker);
}
