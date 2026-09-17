/**
 * KalshiPaperSim — Kalshi Trade API v2 Client
 * =====================================================================
 * Rewritten 2026-09-17 to match the LIVE, VERIFIED Kalshi API contract.
 *
 * What changed vs. the previous revision (all corrections are evidence-based):
 *  1. Market fields now use Kalshi's CURRENT fixed-point names
 *     (yes_bid_dollars / yes_ask_dollars / no_bid_dollars / no_ask_dollars /
 *      last_price_dollars / volume_fp / volume_24h_fp / open_interest_fp),
 *     verified in the Market schema and in live responses. The legacy integer
 *     names (yes_bid, volume, ...) are still accepted by the normalizer.
 *     Source: https://docs.kalshi.com/api-reference/market/get-markets
 *  2. Candlesticks path corrected to
 *     GET /series/{series_ticker}/markets/{ticker}/candlesticks
 *     with REQUIRED start_ts, end_ts, period_interval (1|60|1440).
 *     Source: https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *  3. Historical tier endpoints added (/historical/cutoff, /historical/...).
 *     Source: https://docs.kalshi.com/getting_started/historical_data
 *  4. WebSocket base URLs corrected to the RECOMMENDED hosts.
 *     Source: https://docs.kalshi.com/getting_started/api_environments
 *  5. The fabricated market catalog was REMOVED and replaced by real captured
 *     data in src/verified-snapshot.js (see SERIES_NOT_FOUND for the 404 proof).
 *  6. `title`, `subtitle` and `expiration_time` are flagged as DEPRECATED by
 *     the schema; the normalizer prefers yes_sub_title / no_sub_title /
 *     latest_expiration_time while preserving the deprecated values.
 */

import {
  KALSHI_ENDPOINTS,
  KALSHI_PATHS,
  CANDLE_PERIODS_MINUTES,
  MARKET_STATUS_QUERY_FILTER,
  RATE_LIMITS
} from './kalshi-config.js';
import { dollarsToNumber, resolvePriceGrid, toDollarsString, toCountString } from './price-grid.js';
import { getVerifiedMarkets, getVerifiedOrderbook, getVerifiedCandlesticks, CAPTURE_META } from './verified-snapshot.js';

/** Data-source labels surfaced in the UI so users always know what is real. */
export const DATA_SOURCE = Object.freeze({
  LIVE: 'live_kalshi_api',
  PROXY: 'kalshi_via_local_proxy',
  VERIFIED_SNAPSHOT: 'verified_snapshot_2026_09_17',
  SIMULATED: 'local_simulation'
});

/**
 * Normalize ANY Kalshi market object (live, proxied, or captured) into a single
 * internal shape with numeric prices, while retaining the raw response.
 *
 * Reciprocal identity enforced/verified here:
 *   yes_ask_dollars == 1 - no_bid_dollars
 *   no_ask_dollars  == 1 - yes_bid_dollars
 * Verified live 2026-09-17 on KXNASDAQ100Y-26DEC31H1600-T33000:
 *   yes_ask 0.1300 == 1 - no_bid 0.8700 ; no_ask 0.8800 == 1 - yes_bid 0.1200
 */
export function normalizeMarket(raw, extra = {}) {
  if (!raw || typeof raw !== 'object') return null;

  const pick = (...names) => {
    for (const n of names) {
      if (raw[n] !== undefined && raw[n] !== null && raw[n] !== '') return raw[n];
    }
    return undefined;
  };

  const yesBid = dollarsToNumber(pick('yes_bid_dollars', 'yes_bid'));
  const yesAsk = dollarsToNumber(pick('yes_ask_dollars', 'yes_ask'));
  const noBid = dollarsToNumber(pick('no_bid_dollars', 'no_bid'));
  const noAsk = dollarsToNumber(pick('no_ask_dollars', 'no_ask'));
  const lastPrice = dollarsToNumber(pick('last_price_dollars', 'last_price'));
  const notional = dollarsToNumber(pick('notional_value_dollars')) ?? 1.0;

  // Reciprocal fallbacks (documented rule) when a side is missing from the book.
  const derivedYesAsk = yesAsk ?? (noBid !== null ? parseFloat((notional - noBid).toFixed(6)) : null);
  const derivedNoAsk = noAsk ?? (yesBid !== null ? parseFloat((notional - yesBid).toFixed(6)) : null);

  const grid = resolvePriceGrid(raw.price_ranges?.length ? raw.price_ranges : raw.price_level_structure);

  const yesBidSize = dollarsToNumber(pick('yes_bid_size_fp', 'yes_bid_size'));
  const yesAskSize = dollarsToNumber(pick('yes_ask_size_fp', 'yes_ask_size'));

  const mid =
    yesBid !== null && derivedYesAsk !== null
      ? parseFloat(((yesBid + derivedYesAsk) / 2).toFixed(6))
      : lastPrice;

  return {
    // identity
    ticker: raw.ticker,
    event_ticker: raw.event_ticker,
    series_ticker: raw.series_ticker || extra.series_ticker || deriveSeriesTicker(raw.ticker),
    market_type: raw.market_type || 'binary',

    // human-readable (schema marks title/subtitle DEPRECATED; keep both)
    title: raw.title || raw.yes_sub_title || raw.ticker,
    subtitle: raw.subtitle || '',
    yes_sub_title: raw.yes_sub_title || '',
    no_sub_title: raw.no_sub_title || '',
    deprecated_title: raw.title ?? null,
    deprecated_subtitle: raw.subtitle ?? null,

    // lifecycle
    status: raw.status || 'active', // response enum: active/closed/determined/...
    statusFilterEquivalent: mapStatusToFilter(raw.status),
    can_close_early: Boolean(raw.can_close_early),
    early_close_condition: raw.early_close_condition || null,
    open_time: raw.open_time || null,
    close_time: raw.close_time || null,
    expected_expiration_time: raw.expected_expiration_time || null,
    latest_expiration_time: raw.latest_expiration_time || null,
    deprecated_expiration_time: raw.expiration_time ?? null,
    settlement_timer_seconds: raw.settlement_timer_seconds ?? null,
    result: raw.result || '',
    expiration_value: raw.expiration_value || '',
    settlement_value_dollars: raw.settlement_value_dollars ?? null,
    exchange_index: raw.exchange_index ?? 0,

    // strike / rules
    strike_type: raw.strike_type || null,
    floor_strike: raw.floor_strike ?? null,
    cap_strike: raw.cap_strike ?? null,
    custom_strike: raw.custom_strike || null,
    rules_primary: raw.rules_primary || '',
    rules_secondary: raw.rules_secondary || '',

    // pricing (numeric, dollars)
    yes_bid: yesBid,
    yes_ask: derivedYesAsk,
    no_bid: noBid,
    no_ask: derivedNoAsk,
    last_price: lastPrice,
    previous_yes_bid: dollarsToNumber(raw.previous_yes_bid_dollars),
    previous_yes_ask: dollarsToNumber(raw.previous_yes_ask_dollars),
    previous_price: dollarsToNumber(raw.previous_price_dollars),
    notional_value: notional,

    // sizes / activity
    yes_bid_size: yesBidSize,
    yes_ask_size: yesAskSize,
    volume: dollarsToNumber(pick('volume_fp', 'volume')) ?? 0,
    volume_24h: dollarsToNumber(pick('volume_24h_fp', 'volume_24h')) ?? 0,
    open_interest: dollarsToNumber(pick('open_interest_fp', 'open_interest')) ?? 0,

    // derived
    mid_price: mid,
    spread: yesBid !== null && derivedYesAsk !== null ? parseFloat((derivedYesAsk - yesBid).toFixed(6)) : null,
    reciprocalCheck: reciprocalCheck(raw, notional),

    // price grid
    price_level_structure: raw.price_level_structure || null,
    price_ranges: raw.price_ranges || null,
    grid,
    tick_size: grid[grid.length - 1].step,

    // provenance
    source: extra.source || DATA_SOURCE.LIVE,
    source_url: extra.source_url || null,
    captured_at: extra.captured_at || null,
    raw
  };
}

/** Verify the reciprocal identity on a raw market object; returns diagnostics. */
export function reciprocalCheck(raw, notional = 1.0) {
  const yesBid = dollarsToNumber(raw.yes_bid_dollars ?? raw.yes_bid);
  const yesAsk = dollarsToNumber(raw.yes_ask_dollars ?? raw.yes_ask);
  const noBid = dollarsToNumber(raw.no_bid_dollars ?? raw.no_bid);
  const noAsk = dollarsToNumber(raw.no_ask_dollars ?? raw.no_ask);
  const EPS = 1e-6;

  const yesAskFromNoBid = noBid !== null ? notional - noBid : null;
  const noAskFromYesBid = yesBid !== null ? notional - yesBid : null;

  return {
    yesAsk_matches_1_minus_noBid:
      yesAsk === null || yesAskFromNoBid === null ? null : Math.abs(yesAsk - yesAskFromNoBid) <= EPS,
    noAsk_matches_1_minus_yesBid:
      noAsk === null || noAskFromYesBid === null ? null : Math.abs(noAsk - noAskFromYesBid) <= EPS,
    yesBidSum: yesBid !== null && noBid !== null ? parseFloat((yesBid + noBid).toFixed(6)) : null
  };
}

/**
 * Map a response `status` (active/closed/...) to the GET /markets query-filter
 * vocabulary (open/closed/settled/...). The two vocabularies are DIFFERENT —
 * verified: https://docs.kalshi.com/api-reference/market/get-markets
 */
export function mapStatusToFilter(status) {
  switch (status) {
    case 'active':
    case 'initialized':
    case 'inactive':
      return 'open';
    case 'closed':
      return 'closed';
    case 'determined':
    case 'finalized':
    case 'amended':
    case 'disputed':
      return 'settled';
    default:
      return null;
  }
}

/** KXNASDAQ100Y-26DEC31H1600-T33000 -> KXNASDAQ100Y (best-effort derivation). */
export function deriveSeriesTicker(ticker) {
  if (!ticker) return null;
  const m = String(ticker).match(/^([A-Z0-9]+?)-/);
  return m ? m[1] : String(ticker);
}

/**
 * Parse a Kalshi orderbook response (`orderbook_fp` with yes_dollars/no_dollars)
 * into bids + RECIPROCALLY IMPLIED asks.
 *
 * Verified rule (https://docs.kalshi.com/getting_started/orderbook_responses):
 *   "Kalshi's orderbook only returns bids, not asks."
 *   "A YES BID at price X is equivalent to a NO ASK at price ($1.00 - X)"
 *   "A NO BID at price Y is equivalent to a YES ASK at price ($1.00 - Y)"
 *   Arrays are sorted ascending; the best (highest) bid is the LAST element.
 */
export function parseKalshiOrderbook(orderbook, notional = 1.0) {
  const empty = {
    bestYesBid: null, bestNoBid: null, bestYesAsk: null, bestNoAsk: null,
    yesSpread: null, noSpread: null, yesMid: null, noMid: null,
    yesBids: [], noBids: [], yesAsks: [], noAsks: [],
    reciprocal: { ok: null, note: '' }
  };
  if (!orderbook) return empty;

  const ob = orderbook.orderbook_fp || orderbook.orderbook || orderbook;
  const toLevels = (arr) =>
    (arr || [])
      .map(([p, c]) => ({ price: dollarsToNumber(p), count: dollarsToNumber(c) }))
      .filter((l) => l.price !== null && l.count !== null)
      .sort((a, b) => a.price - b.price); // ascending; last == best bid

  const yesBids = toLevels(ob.yes_dollars || ob.yes || []);
  const noBids = toLevels(ob.no_dollars || ob.no || []);

  const bestYesBid = yesBids.length ? yesBids[yesBids.length - 1].price : null;
  const bestNoBid = noBids.length ? noBids[noBids.length - 1].price : null;

  // Implied asks from the opposite side's bids (documented reciprocal rule).
  const bestYesAsk = bestNoBid !== null ? parseFloat((notional - bestNoBid).toFixed(6)) : null;
  const bestNoAsk = bestYesBid !== null ? parseFloat((notional - bestYesBid).toFixed(6)) : null;

  // Full implied ask ladders: invert and re-sort ascending (lowest ask first).
  const yesAsks = noBids
    .map((l) => ({ price: parseFloat((notional - l.price).toFixed(6)), count: l.count, fromNoBid: l.price }))
    .sort((a, b) => a.price - b.price);
  const noAsks = yesBids
    .map((l) => ({ price: parseFloat((notional - l.price).toFixed(6)), count: l.count, fromYesBid: l.price }))
    .sort((a, b) => a.price - b.price);

  const yesSpread = bestYesAsk !== null && bestYesBid !== null ? parseFloat((bestYesAsk - bestYesBid).toFixed(6)) : null;
  const noSpread = bestNoAsk !== null && bestNoBid !== null ? parseFloat((bestNoAsk - bestNoBid).toFixed(6)) : null;
  const yesMid = yesSpread !== null ? parseFloat(((bestYesAsk + bestYesBid) / 2).toFixed(6)) : null;
  const noMid = noSpread !== null ? parseFloat(((bestNoAsk + bestNoBid) / 2).toFixed(6)) : null;

  return {
    bestYesBid, bestNoBid, bestYesAsk, bestNoAsk,
    yesSpread, noSpread, yesMid, noMid,
    yesBids, noBids, yesAsks, noAsks,
    yesDepth: yesBids.reduce((s, l) => s + l.count, 0),
    noDepth: noBids.reduce((s, l) => s + l.count, 0),
    crossed: bestYesBid !== null && bestNoBid !== null ? bestYesBid + bestNoBid > notional + 1e-9 : null,
    reciprocal: {
      ok: true,
      note: `YES ask ${bestYesAsk} = ${notional} - best NO bid ${bestNoBid}`
    }
  };
}

/** Serialize a book back into Kalshi's wire format (fixed-point strings). */
export function toKalshiOrderbookWire(yesBids, noBids) {
  return {
    orderbook_fp: {
      yes_dollars: [...yesBids]
        .sort((a, b) => a.price - b.price)
        .map((l) => [toDollarsString(l.price), toCountString(l.count)]),
      no_dollars: [...noBids]
        .sort((a, b) => a.price - b.price)
        .map((l) => [toDollarsString(l.price), toCountString(l.count)])
    }
  };
}

/**
 * Client for Kalshi's public + authenticated REST endpoints.
 *
 * Transport order (configurable):
 *   1. Local proxy   (`/api/kalshi/*` served by server.js) — avoids browser CORS
 *                     and lets the server attach auth headers.
 *   2. Direct fetch  — works from Node, or from a browser if CORS permits.
 *   3. Verified snapshot fallback — real captured data from 2026-09-17 so the
 *                     simulator is never showing invented numbers.
 */
export class KalshiApiClient {
  constructor(options = {}) {
    this.baseUrl = options.baseUrl || KALSHI_ENDPOINTS.rest.production;
    this.demoBaseUrl = options.demoBaseUrl || KALSHI_ENDPOINTS.rest.demo;
    this.proxyBase = options.proxyBase ?? '/api/kalshi';
    this.useProxy = options.useProxy !== false;
    this.useSnapshotFallback = options.useSnapshotFallback !== false;
    this.timeoutMs = options.timeoutMs ?? 6000;
    this.environment = options.environment || 'production';
    /** @type {Array} audit log of every transport attempt (for the UI + tests) */
    this.transportLog = [];
  }

  get rootBase() {
    return this.environment === 'demo' ? this.demoBaseUrl : this.baseUrl;
  }

  _log(entry) {
    this.transportLog.push({ at: new Date().toISOString(), ...entry });
    if (this.transportLog.length > 200) this.transportLog.shift();
    return entry;
  }

  /** Raw GET with timeout; returns {ok, status, json, error, via}. */
  async _get(url, { via, headers = {} } = {}) {
    if (typeof fetch !== 'function') {
      return this._log({ ok: false, via, url, error: 'fetch_unavailable' });
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', ...headers },
        signal: controller.signal
      });
      clearTimeout(timer);
      if (res.status === RATE_LIMITS.throttledStatus) {
        // Verified: 429 body is {"error": "too many requests"} and carries no
        // Retry-After header; docs say to apply exponential backoff.
        return this._log({ ok: false, via, url, status: 429, error: 'rate_limited_backoff' });
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return this._log({ ok: false, via, url, status: res.status, error: text.slice(0, 300) });
      }
      const json = await res.json();
      return this._log({ ok: true, via, url, status: res.status, json });
    } catch (err) {
      clearTimeout(timer);
      return this._log({ ok: false, via, url, error: String(err && err.message ? err.message : err) });
    }
  }

  /**
   * GET a Trade API path, trying the local proxy first (browser-safe) then the
   * upstream host directly (Node / permissive CORS).
   * @param {string} path e.g. '/markets?limit=5'
   */
  async get(path) {
    const attempts = [];
    if (this.useProxy && this.proxyBase) {
      const proxyUrl = `${this.proxyBase}${path.startsWith('/') ? '' : '/'}${path}`;
      const r = await this._get(proxyUrl, { via: 'proxy' });
      attempts.push({ via: 'proxy', url: proxyUrl, ok: r.ok, status: r.status, error: r.error });
      if (r.ok) return { source: DATA_SOURCE.PROXY, url: this.rootBase + path, proxyUrl, data: r.json, attempts };
    }
    const directUrl = this.rootBase + path;
    const r2 = await this._get(directUrl, { via: 'direct' });
    attempts.push({ via: 'direct', url: directUrl, ok: r2.ok, status: r2.status, error: r2.error });
    if (r2.ok) return { source: DATA_SOURCE.LIVE, url: directUrl, data: r2.json, attempts };

    return { source: null, url: directUrl, data: null, attempts, error: 'all_transports_failed' };
  }

  /** GET /markets — normalized. Falls back to the verified snapshot. */
  async getMarkets(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(Math.min(1000, Math.max(1, params.limit))));
    if (params.status) {
      if (!MARKET_STATUS_QUERY_FILTER.includes(params.status)) {
        throw new Error(`Invalid status filter "${params.status}". Allowed: ${MARKET_STATUS_QUERY_FILTER.join(', ')}`);
      }
      qs.set('status', params.status);
    }
    if (params.series_ticker) qs.set('series_ticker', params.series_ticker);
    if (params.event_ticker) qs.set('event_ticker', params.event_ticker);
    if (params.tickers) qs.set('tickers', params.tickers);
    if (params.cursor) qs.set('cursor', params.cursor);
    if (params.min_close_ts) qs.set('min_close_ts', String(params.min_close_ts));
    if (params.max_close_ts) qs.set('max_close_ts', String(params.max_close_ts));

    const path = `${KALSHI_PATHS.markets}${qs.toString() ? `?${qs}` : ''}`;
    const res = await this.get(path);

    if (res.data && Array.isArray(res.data.markets)) {
      return {
        source: res.source,
        url: res.url,
        cursor: res.data.cursor || '',
        markets: res.data.markets.map((m) => normalizeMarket(m, { source: res.source, source_url: res.url })),
        attempts: res.attempts
      };
    }

    if (this.useSnapshotFallback) {
      return {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        url: path,
        capturedAt: CAPTURE_META.capturedAt,
        notice:
          'Live transport unavailable from this environment. Showing REAL Kalshi market objects captured 2026-09-17 from external-api.kalshi.com (point-in-time, not live quotes).',
        markets: getVerifiedMarkets().map((m) =>
          normalizeMarket(m, {
            source: DATA_SOURCE.VERIFIED_SNAPSHOT,
            source_url: m._provenance?.url,
            captured_at: m._provenance?.capturedAt
          })
        ),
        attempts: res.attempts
      };
    }
    return { source: null, url: res.url, markets: [], attempts: res.attempts, error: res.error };
  }

  /** GET /markets/{ticker}/orderbook — parsed with reciprocal asks. */
  async getOrderbook(ticker) {
    const path = KALSHI_PATHS.orderbook(ticker);
    const res = await this.get(path);

    if (res.data && (res.data.orderbook_fp || res.data.orderbook)) {
      return {
        source: res.source,
        url: res.url,
        ticker,
        wire: res.data,
        parsed: parseKalshiOrderbook(res.data),
        attempts: res.attempts
      };
    }

    const snap = getVerifiedOrderbook(ticker);
    if (this.useSnapshotFallback && snap) {
      return {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        url: ORDERBOOKS_URL(ticker),
        ticker,
        capturedAt: CAPTURE_META.capturedAt,
        wire: snap,
        parsed: parseKalshiOrderbook(snap),
        attempts: res.attempts
      };
    }
    return { source: null, url: res.url, ticker, wire: null, parsed: parseKalshiOrderbook(null), attempts: res.attempts };
  }

  /**
   * GET /series/{series_ticker}/markets/{ticker}/candlesticks
   * CORRECTED PATH (previously documented wrongly as /markets/{ticker}/candlesticks).
   * start_ts, end_ts and period_interval are REQUIRED by the OpenAPI spec.
   */
  async getCandlesticks({ series_ticker, ticker, start_ts, end_ts, period_interval = 1440, include_latest_before_start = false, historical = false }) {
    if (!ticker) throw new Error('candlesticks: ticker is required');
    if (!Number.isFinite(Number(start_ts)) || !Number.isFinite(Number(end_ts))) {
      throw new Error('candlesticks: start_ts and end_ts are REQUIRED Unix timestamps');
    }
    const interval = Number(period_interval);
    if (!CANDLE_PERIODS_MINUTES.includes(interval)) {
      throw new Error(`candlesticks: period_interval must be one of ${CANDLE_PERIODS_MINUTES.join(', ')} (minutes)`);
    }

    let path;
    if (historical) {
      // Verified: markets settled before the cutoff are ONLY available here.
      path = `${KALSHI_PATHS.historicalCandlesticks(ticker)}?start_ts=${start_ts}&end_ts=${end_ts}&period_interval=${interval}`;
    } else {
      if (!series_ticker) series_ticker = deriveSeriesTicker(ticker);
      path = `${KALSHI_PATHS.candlesticks(series_ticker, ticker)}?start_ts=${start_ts}&end_ts=${end_ts}&period_interval=${interval}`;
    }
    if (include_latest_before_start) path += '&include_latest_before_start=true';

    const res = await this.get(path);
    if (res.data && Array.isArray(res.data.candlesticks)) {
      return { source: res.source, url: res.url, ticker, period_interval: interval, candlesticks: res.data.candlesticks, attempts: res.attempts };
    }

    const snap = getVerifiedCandlesticks(ticker);
    if (this.useSnapshotFallback && snap) {
      return {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        url: snap._provenance?.url,
        ticker,
        period_interval: snap._provenance?.periodIntervalMinutes ?? interval,
        capturedAt: CAPTURE_META.capturedAt,
        candlesticks: snap.candlesticks,
        attempts: res.attempts
      };
    }
    return { source: null, url: res.url, ticker, candlesticks: [], attempts: res.attempts, error: res.error };
  }

  /** GET /historical/cutoff — live/historical partition timestamps. */
  async getHistoricalCutoff() {
    const res = await this.get(KALSHI_PATHS.historicalCutoff);
    if (res.data) return { source: res.source, url: res.url, cutoff: res.data };
    return { source: DATA_SOURCE.VERIFIED_SNAPSHOT, url: this.rootBase + KALSHI_PATHS.historicalCutoff, cutoff: { ...CAPTURE_SNAPSHOT_CUTOFF } };
  }

  /** GET /exchange/status */
  async getExchangeStatus() {
    const res = await this.get(KALSHI_PATHS.exchangeStatus);
    if (res.data) return { source: res.source, url: res.url, status: res.data };
    return { source: null, url: res.url, status: null, attempts: res.attempts };
  }

  /** GET /series/{ticker} — includes fee_multiplier + fee_type used for fees. */
  async getSeries(seriesTicker) {
    const res = await this.get(KALSHI_PATHS.series(seriesTicker));
    if (res.data && res.data.series) return { source: res.source, url: res.url, series: res.data.series };
    return { source: null, url: res.url, series: null, attempts: res.attempts };
  }

  /** GET /markets/trades — public tape. */
  async getTrades(params = {}) {
    const qs = new URLSearchParams();
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.ticker) qs.set('ticker', params.ticker);
    if (params.cursor) qs.set('cursor', params.cursor);
    const res = await this.get(`${KALSHI_PATHS.trades}${qs.toString() ? `?${qs}` : ''}`);
    return { source: res.source, url: res.url, trades: res.data?.trades || [], cursor: res.data?.cursor || '', attempts: res.attempts };
  }

  /** Transport health summary for the UI status badge. */
  transportSummary() {
    const last = this.transportLog.slice(-8);
    return {
      ok: last.some((l) => l.ok),
      lastSource: last.find((l) => l.ok)?.via || null,
      attempts: last,
      proxyEnabled: this.useProxy,
      endpoints: KALSHI_ENDPOINTS
    };
  }
}

function ORDERBOOKS_URL(ticker) {
  return `${KALSHI_ENDPOINTS.rest.production}${KALSHI_PATHS.orderbook(ticker)}`;
}

const CAPTURE_SNAPSHOT_CUTOFF = Object.freeze({
  market_positions_last_updated_ts: '2026-07-19T00:00:00Z',
  market_settled_ts: '2026-07-19T00:00:00Z',
  orders_updated_ts: '2026-07-19T00:00:00Z',
  trades_created_ts: '2026-07-19T00:00:00Z',
  capturedAt: '2026-09-17'
});

/**
 * Backwards-compatible export name for the pre-existing codebase/tests.
 * IMPORTANT: this is REAL captured data now, not an invented catalog.
 * @deprecated import { getVerifiedMarkets } from './verified-snapshot.js'
 */
export const OFFICIAL_MARKET_CATALOG = getVerifiedMarkets();
