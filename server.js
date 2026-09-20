/**
 * KalshiPaperSim — Node server (zero runtime dependencies)
 * =====================================================================
 * Serves:
 *   - the static app (index.html + src/) for local dev and the live preview
 *   - a Kalshi REST proxy at /api/kalshi/*  (solves browser CORS + lets the
 *     server attach signed auth headers, which browsers cannot do)
 *   - a WebSocket relay at /ws/feed         (browsers cannot set Kalshi's
 *     required handshake headers, so live WS data must be relayed)
 *   - the multiplayer paper-trading store   (shared leaderboard, trades, PnL)
 *
 * IMPORTANT — HONEST DEGRADATION
 *   If the host cannot reach Kalshi (e.g. a datacenter IP whose TLS handshake is
 *     dropped — see IRREGULARITIES.md #4), or if no API credentials are set,
 *     every endpoint still responds using the REAL captured snapshot from
 *     2026-09-17 and labels it as such. It never silently invents live data.
 *
 * SECURITY
 *   User-supplied strategy code is NOT executed on the server by default
 *   (ALLOW_USER_CODE=false). See src/strategy-sandbox.js for why.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { KALSHI_ENDPOINTS, KALSHI_PATHS, CANDLE_PERIODS_MINUTES, RATE_LIMITS } from './src/kalshi-config.js';
import { KalshiApiClient, normalizeMarket, DATA_SOURCE, parseKalshiOrderbook } from './src/kalshi-api.js';
import { getVerifiedMarkets, getVerifiedCandlesticks, CAPTURE_META, EXCHANGE_STATUS, HISTORICAL_CUTOFF, SERIES, getVerifiedOrderbook } from './src/verified-snapshot.js';
import { runCompetition, runCompetitionFlights, getReplayableMarkets, getVerifiedCandleMap, getHistoryAudit , STRATEGIES } from './src/strategy-runner.js';
import { CompetitionMemoryEngine, REGIMES, validateUsername } from './src/competition-memory.js';
import { OrderBook, PaperPortfolio, round2 } from './src/simulation-engine.js';
import { computeKalshiFee } from './src/kalshi-fees.js';
import { attachWebSocketServer } from './src/ws-lite.js';
import { UpstreamFeedManager, FEED_MODE, parseFeedMessage } from './src/kalshi-ws.js';
import { compileUserStrategy, lintSource } from './src/strategy-sandbox.js';
import { credentialsFromEnv, buildAuthHeaders } from './src/kalshi-auth.js';
import { classifySettlement, buildSettlementPlan, fetchMarketSettlements, FINAL_STATUS, PENDING_FINAL_STATUSES, SETTLEMENT_FEE_USD } from './src/settlement-tracker.js';
import { readHistoryManifest, HISTORY_DIR } from './src/history-store.js';
import {
  DESK_DATA
} from './src/desk-data.js';
import {
  buildDeskUniverse, runDeskSession, createDeskBook, placeDeskOrder, sizeDeskOrder,
  deskLedgerJsonl, deskFillsCsv, summarizeDesk, explainDeskStrategy, auditDesk,
  auditorFacts, describeAudit, DESK_LIMITS, DESK_VERSION, buildDeskReport, deskCutoffs,
  buildDeskSignalsAsync
} from './src/live-desk.js';
import { DESK_STRATEGIES, deskStrategyById } from './src/desk-strategies.js';
import { SEASON_STRATEGIES, seasonStrategyById } from './src/desk-season-strategies.js';
import {
  buildSeasonReport, seasonSchedule, seasonLedgerJsonl, seasonAuditorFacts,
  describeSeasonAudit, SEASON_RULE, SEASON_VERSION
} from './src/desk-season.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0'; // must be 0.0.0.0 for the live preview
const ALLOW_USER_CODE = String(process.env.ALLOW_USER_CODE || 'false') === 'true';
const STORE_DIR = path.join(__dirname, 'data', 'store');
const STORE_FILE = path.join(STORE_DIR, 'competition-state.json');

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.md': 'text/markdown; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=UTF-8'
};

/* ------------------------------------------------------------------ *
 * Multiplayer store (file-backed, no database dependency)
 * ------------------------------------------------------------------ */

let memory = new CompetitionMemoryEngine({ tier: 'memory', storage: null });

function loadStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
      if (parsed && parsed.state && parsed.state.schemaVersion === 2) {
        memory = new CompetitionMemoryEngine({ tier: 'server', storage: null, initialState: parsed.state });
        // A stored year can outlive the code: re-sync the roster so new
        // strategies appear and retired ones are recorded, not silently dropped.
        const sync = memory.syncStrategyRoster();
        return { ok: true, participants: (parsed.state.participants || []).length, roster: sync };
      }
      return { ok: false, reason: 'schema_mismatch' };
    }
  } catch (err) {
    return { ok: false, reason: String(err && err.message ? err.message : err) };
  }
  return { ok: false, reason: 'no_store_file' };
}

let storeWritePending = false;
function persistStore() {
  if (storeWritePending) return;
  storeWritePending = true;
  // Debounce writes so a burst of trades does not thrash the disk.
  setTimeout(() => {
    storeWritePending = false;
    try {
      fs.mkdirSync(STORE_DIR, { recursive: true });
      fs.writeFileSync(STORE_FILE, JSON.stringify({ savedAt: new Date().toISOString(), state: memory.state }, null, 2));
    } catch (err) {
      console.error('[store] persist failed:', err.message);
    }
  }, 250);
}

/* ------------------------------------------------------------------ *
 * Computed competition results (cached)
 * ------------------------------------------------------------------ */

const FLIGHTS = ['daily', 'hourly', 'micro']; // replay stores: daily | 60m | 1m
let competitionCache = null;
let competitionCacheKey = null;

function getCompetition(options = {}) {
  // Every option that changes the numbers must be in this key, or a request for
  // an unusual configuration is silently answered with the default run. The two
  // replay bounds are the important ones: `null` means "disabled" and must not
  // be folded into the default by `??`.
  const key = JSON.stringify({
    depthMode: options.depthMode === 'modelled' ? 'modelled' : 'captured',
    seed: options.seed ?? 20260917,
    settleAtEnd: Boolean(options.settleAtEnd),
    finalResult: options.finalResult || null,
    regime: options.regime || 'baseline',
    capital: options.initialCapital ?? 100000,
    maxNotionalPerMarketPct: options.maxNotionalPerMarketPct === undefined ? 'default' : options.maxNotionalPerMarketPct,
    maxFillFractionOfPeriodVolume:
      options.maxFillFractionOfPeriodVolume === undefined ? 'default' : options.maxFillFractionOfPeriodVolume,
    flight: FLIGHTS.includes(options.flight) ? options.flight : 'daily'
  });
  if (competitionCache && competitionCacheKey === key) return competitionCache;
  // The flight selects the store the replay runs on: 'daily' is the original
  // 30-market daily universe; 'hourly' (60m) and 'micro' (1m) run the intraday
  // stores — which is where the settling weather brackets and 15-minute gold
  // markets live. Flights are reported separately and never merged. Only the
  // requested flight is computed (runCompetitionFlights would run all three).
  const FLIGHT_INTERVAL = { hourly: 60, micro: 1 };
  // Same roster filtering runCompetitionFlights applies: 'both' means
  // daily+hourly (the two flights that existed when those designs were
  // declared); the micro flight is the declared-'micro' roster only. A
  // strategy outside its flight is absent from that leaderboard, not shown at 0%.
  const flightRoster = (flight, roster) =>
    flight === 'hourly'
      ? roster.filter((st) => st.flight === 'hourly' || st.flight === 'both')
      : roster.filter((st) => st.flight === 'micro');
  const result = FLIGHT_INTERVAL[options.flight]
    ? runCompetition({
        ...options,
        periodIntervalMinutes: FLIGHT_INTERVAL[options.flight],
        strategies: flightRoster(options.flight, options.strategies || STRATEGIES)
      })
    : runCompetition(options);
  competitionCache = result;
  competitionCacheKey = key;
  memory.attachComputedResults(result);
  persistStore();
  return result;
}

/* ------------------------------------------------------------------ *
 * Live paper-trading books for human participants
 * ------------------------------------------------------------------ */

const liveBooks = new Map(); // ticker -> OrderBook

function getLiveBook(ticker) {
  const market = getVerifiedMarkets().find((m) => m.ticker === ticker);
  if (!market) return null;
  if (!liveBooks.has(ticker)) {
    const normalized = normalizeMarket(market, { source: DATA_SOURCE.VERIFIED_SNAPSHOT, source_url: market._provenance?.url });
    const seriesMeta = SERIES[market.series_ticker] || {};
    // Prefer the REAL captured order book (sparse, fractional, asymmetric) over
    // a modelled ladder. Only markets without a captured book fall back to a
    // quote-anchored simulation, and the book itself records which it is.
    const captured = getVerifiedOrderbook(ticker);
    liveBooks.set(ticker, OrderBook.fromVerifiedCapture(normalized, captured, {
      feeMultiplier: typeof seriesMeta.fee_multiplier === 'number' ? seriesMeta.fee_multiplier : 1,
      feeType: seriesMeta.fee_type || 'quadratic',
      source: DATA_SOURCE.VERIFIED_SNAPSHOT,
      topSize: 2500
    }));
  }
  return liveBooks.get(ticker);
}

const userPortfolios = new Map(); // username -> PaperPortfolio
function getUserPortfolio(username) {
  if (!userPortfolios.has(username)) {
    const p = memory.getParticipant(username);
    userPortfolios.set(username, new PaperPortfolio(username, p?.startingCapital ?? memory.state.initialCapital));
  }
  return userPortfolios.get(username);
}

/* ------------------------------------------------------------------ *
 * Kalshi REST proxy
 * ------------------------------------------------------------------ */

const apiClient = new KalshiApiClient({ useProxy: false, timeoutMs: 8000 });
const credentials = credentialsFromEnv(process.env);

async function proxyKalshi(pathname, search) {
  // Kalshi's base URL already contains the /trade-api/v2 prefix, so the ORIGIN
  // is used here and the full path (prefix included) is what gets signed.
  const origin = new URL(KALSHI_ENDPOINTS.rest.production).origin;
  const upstreamPath = `/trade-api/v2${pathname}`;
  const url = `${origin}${upstreamPath}${search || ''}`;
  const headers = { Accept: 'application/json' };

  // Attach signed auth headers ONLY when credentials are configured.
  let signed = false;
  if (credentials.configured) {
    try {
      const { headers: authHeaders } = buildAuthHeaders({
        keyId: credentials.keyId,
        privateKeyPem: credentials.privateKeyPem,
        method: 'GET',
        path: upstreamPath
      });
      Object.assign(headers, authHeaders);
      signed = true;
    } catch (err) {
      return { ok: false, status: 500, error: `signing_failed: ${err.message}`, url };
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    clearTimeout(timer);
    const text = await res.text();
    let json = null;
    try { json = JSON.parse(text); } catch { /* non-JSON */ }
    return {
      ok: res.ok,
      status: res.status,
      url,
      signed,
      rateLimited: res.status === RATE_LIMITS.throttledStatus,
      data: json,
      text: json ? undefined : text.slice(0, 500)
    };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, url, signed, error: String(err && err.message ? err.message : err) };
  }
}

/* ------------------------------------------------------------------ *
 * WebSocket relay
 * ------------------------------------------------------------------ */

const upstream = new UpstreamFeedManager({
  credentials,
  channels: ['ticker'],
  tickers: getReplayableMarkets().map((m) => m.ticker),
  connectImpl: null // injected below (Node-only dynamic import keeps browser builds clean)
});

let wsHandle = null;
let simTimer = null;

function broadcast(obj) {
  if (wsHandle) return wsHandle.broadcast(obj);
  return 0;
}

function startSimulationFeed(intervalMs = 2000) {
  if (simTimer) clearInterval(simTimer);
  simTimer = setInterval(() => {
    const events = [];
    for (const [ticker, book] of liveBooks.entries()) {
      const regime = REGIMES.find((r) => r.id === memory.state.regime) || REGIMES[0];
      const q = book.marketMakerTick({
        drift: regime.drift || 0,
        volatility: (regime.volatility || 1) * book.tick * 2
      });
      events.push({
        type: 'ticker',
        ticker,
        yesBid: q.bestYesBid,
        yesAsk: q.bestYesAsk,
        lastPrice: book.lastPrice,
        volume: null,
        ts: Date.now(),
        source: 'SIMULATED_AMM',
        mid: q.mid,
        spread: q.spread,
        inventory: q.inventory,
        quotesPlaced: q.quotesPlaced
      });
    }
    if (events.length) {
      broadcast({ type: 'sim_batch', msg: { events, mode: FEED_MODE.SIM, at: new Date().toISOString() } });
    }
  }, intervalMs);
}

/* ------------------------------------------------------------------ *
 * HTTP helpers
 * ------------------------------------------------------------------ */

function sendJSON(res, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(body);
}

function readBody(req, limitBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error('payload_too_large'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (err) { reject(new Error(`invalid_json: ${err.message}`)); }
    });
    req.on('error', reject);
  });
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

/* ------------------------------------------------------------------ *
 * Live Desk — paper orders on real captured open contracts
 * ------------------------------------------------------------------ */

/**
 * The desk is DETERMINISTIC and computed on demand: the same cut-off and
 * capital always produce the same ledger. Sessions are cached per cut-off so a
 * browser tab can re-read it without re-running the tournament.
 *
 * The desk runs the SAME report builder the static build uses
 * (src/live-desk.js buildDeskReport), so server mode and GitHub Pages mode can
 * never disagree about a number. Sessions are cached per (cut-off, capital).
 */
const deskSessionCache = new Map();
const DESK_MAX_CACHED = 8;
const DESK_ORDER_LOG = path.join(STORE_DIR, 'live-desk-orders.jsonl');

async function deskSession(asOf, capital) {
  const key = `${asOf || 'live'}|${capital}`;
  let payload = deskSessionCache.get(key);
  if (!payload) {
    const asOfMs = asOf ? Date.parse(asOf) : (DESK_DATA.coverage?.newestCapture ? Date.parse(DESK_DATA.coverage.newestCapture) : Date.now());
    const signals = Number.isFinite(asOfMs) ? await buildDeskSignalsAsync(asOfMs) : {};
    payload = await buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: asOf || null, startingCapital: capital, signals });
    if (deskSessionCache.size >= DESK_MAX_CACHED) deskSessionCache.delete(deskSessionCache.keys().next().value);
    deskSessionCache.set(key, payload);
  }
  try {
    memory.attachDeskSession(payload);
    persistStore();
  } catch (err) {
    console.error('[desk] attach to competition memory failed:', err && err.message ? err.message : err);
  }
  return payload;
}

/**
 * The SEASON is the carried book: every round is a real capture batch, cash and
 * positions carry between rounds. It is deterministic too, so it is cached per
 * (maxRounds, capital) and attached to the one-year memory on every read —
 * including cache hits, exactly like the desk session.
 */
const seasonCache = new Map();
function seasonPayload(maxRounds, capital) {
  const key = `${maxRounds}|${capital}`;
  let payload = seasonCache.get(key);
  if (!payload) {
    payload = buildSeasonReport({ data: DESK_DATA, strategies: SEASON_STRATEGIES, startingCapital: capital, maxRounds });
    if (seasonCache.size >= DESK_MAX_CACHED) seasonCache.delete(seasonCache.keys().next().value);
    seasonCache.set(key, payload);
  }
  try {
    memory.attachDeskSeason(payload);
    persistStore();
  } catch (err) {
    console.error('[desk-season] attach to competition memory failed:', err && err.message ? err.message : err);
  }
  return payload;
}

const deskRecordCache = new Map();
async function deskCacheRecords(key) {
  if (!deskRecordCache.has(key)) {
    const [asOfPart, capitalPart] = key.split('|');
    const asOfMs = asOfPart === 'live' ? (DESK_DATA.coverage?.newestCapture ? Date.parse(DESK_DATA.coverage.newestCapture) : Date.now()) : Date.parse(asOfPart);
    const signals = Number.isFinite(asOfMs) ? await buildDeskSignalsAsync(asOfMs) : {};
    const desk = await runDeskSession({
      data: DESK_DATA,
      strategies: DESK_STRATEGIES,
      asOf: asOfPart === 'live' ? null : asOfPart,
      startingCapital: Number(capitalPart),
      signals
    });
    deskRecordCache.set(key, desk.records);
    if (deskRecordCache.size > DESK_MAX_CACHED) deskRecordCache.delete(deskRecordCache.keys().next().value);
  }
  return deskRecordCache.get(key);
}

/** The cut-offs the UI may offer: only ones with a real captured ladder. */
function deskCutoffList() {
  return deskCutoffs(DESK_DATA);
}

function readDeskOrderLog() {
  try {
    if (!fs.existsSync(DESK_ORDER_LOG)) return [];
    return fs.readFileSync(DESK_ORDER_LOG, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

function appendDeskOrders(records) {
  fs.mkdirSync(STORE_DIR, { recursive: true });
  fs.appendFileSync(DESK_ORDER_LOG, records.map((r) => JSON.stringify(r)).join('\n') + '\n');
}

/* ------------------------------------------------------------------ *
 * Server
 * ------------------------------------------------------------------ */

const server = http.createServer(async (req, res) => {
  for (const [k, v] of Object.entries(CORS)) res.setHeader(k, v);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const p = url.pathname;

  try {
    /* ---------------- API ---------------- */

    if (p === '/api/health') {
      return sendJSON(res, 200, {
        status: 'ok',
        service: 'KalshiPaperSim',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        endpoints: KALSHI_ENDPOINTS,
        credentialsConfigured: credentials.configured,
        environment: credentials.environment,
        allowUserCode: ALLOW_USER_CODE,
        store: { file: path.relative(__dirname, STORE_FILE), participants: memory.state.participants.length },
        verifiedSnapshot: { capturedAt: CAPTURE_META.capturedAt, apiBase: CAPTURE_META.apiBase }
      });
    }

    if (p === '/api/markets') {
      const source = url.searchParams.get('source') || 'verified';
      if (source === 'live') {
        const r = await apiClient.getMarkets({ limit: Number(url.searchParams.get('limit') || 20), status: url.searchParams.get('status') || undefined, series_ticker: url.searchParams.get('series_ticker') || undefined });
        return sendJSON(res, 200, { source: r.source, url: r.url, attempts: r.attempts, markets: r.markets, notice: r.notice || null });
      }
      const markets = getVerifiedMarkets().map((m) => normalizeMarket(m, { source: DATA_SOURCE.VERIFIED_SNAPSHOT, source_url: m._provenance?.url, captured_at: m._provenance?.capturedAt }));
      return sendJSON(res, 200, {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        capturedAt: CAPTURE_META.capturedAt,
        apiBase: CAPTURE_META.apiBase,
        notice: 'REAL Kalshi market objects captured 2026-09-17. Point-in-time, not live quotes.',
        count: markets.length,
        markets
      });
    }

    if (p === '/api/orderbook') {
      const ticker = url.searchParams.get('ticker');
      if (!ticker) return sendJSON(res, 400, { error: 'ticker query parameter is required' });
      const live = url.searchParams.get('source') === 'live' ? await apiClient.getOrderbook(ticker) : null;
      if (live && live.wire) return sendJSON(res, 200, live);
      const book = getLiveBook(ticker);
      const wire = book ? book.toWire() : null;
      return sendJSON(res, 200, {
        source: book ? book.source : null,
        ticker,
        wire,
        parsed: wire ? parseKalshiOrderbook(wire) : parseKalshiOrderbook(null),
        snapshot: book ? book.snapshot() : null,
        notice: 'Depth is modelled around REAL captured quotes when a live book is unavailable.'
      });
    }

    if (p === '/api/candlesticks') {
      const ticker = url.searchParams.get('ticker');
      const series = url.searchParams.get('series_ticker');
      const startTs = url.searchParams.get('start_ts');
      const endTs = url.searchParams.get('end_ts');
      const interval = Number(url.searchParams.get('period_interval') || 1440);
      if (!ticker) return sendJSON(res, 400, { error: 'ticker is required' });
      if (!CANDLE_PERIODS_MINUTES.includes(interval)) {
        return sendJSON(res, 400, { error: `period_interval must be one of ${CANDLE_PERIODS_MINUTES.join(', ')} (minutes)`, doc: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks' });
      }
      if (url.searchParams.get('source') === 'live' && startTs && endTs) {
        const r = await apiClient.getCandlesticks({ series_ticker: series, ticker, start_ts: Number(startTs), end_ts: Number(endTs), period_interval: interval, historical: url.searchParams.get('historical') === 'true' });
        return sendJSON(res, 200, r);
      }
      const snap = getVerifiedCandlesticks(ticker);
      if (!snap) return sendJSON(res, 404, { error: 'no verified candlestick capture for this ticker', available: Object.keys(getVerifiedCandleMap()) });
      return sendJSON(res, 200, {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        capturedAt: CAPTURE_META.capturedAt,
        url: snap._provenance?.url,
        ticker,
        period_interval: snap._provenance?.periodIntervalMinutes,
        count: snap.candlesticks.length,
        candlesticks: snap.candlesticks,
        retentionNote: 'Live candlesticks only serve data newer than the historical cutoff; older data requires GET /historical/markets/{ticker}/candlesticks.'
      });
    }

    /* Real settlement tracking: reads the exchange's OWN status/result fields
       for the markets this competition trades. Only `finalized` + yes/no books a
       payout; `determined`/`disputed`/`amended` are reported as PENDING_FINAL.
       https://docs.kalshi.com/api-reference/market/get-market */
    if (p === '/api/settlements') {
      const tracked = getReplayableMarkets().map((m) => m.ticker);
      const tickers = url.searchParams.get('tickers')
        ? url.searchParams.get('tickers').split(',').map((t) => t.trim()).filter(Boolean)
        : tracked;
      if (url.searchParams.get('source') !== 'live') {
        // Offline: classify the CAPTURED market objects. Honest and instant.
        const local = tickers.map((t) => {
          const m = getVerifiedMarkets().find((x) => x.ticker === t);
          return m
            ? { ticker: t, status: m.status, result: m.result, close_time: m.close_time, classification: classifySettlement(m), source: DATA_SOURCE.VERIFIED_SNAPSHOT, capturedAt: m._provenance?.capturedAt || CAPTURE_META.capturedAt }
            : { ticker: t, error: 'not present in the verified snapshot' };
        });
        return sendJSON(res, 200, {
          source: DATA_SOURCE.VERIFIED_SNAPSHOT,
          checkedAt: new Date().toISOString(),
          markets: local,
          settlementFeeUsd: SETTLEMENT_FEE_USD,
          note: 'Classified from the captured market objects (status/result). Every captured market was still active on 2026-09-17, so nothing has settled yet. Use ?source=live to poll the exchange now.'
        });
      }
      const polled = await fetchMarketSettlements(tickers);
      return sendJSON(res, 200, {
        source: polled.errors.length === tickers.length ? 'LIVE_FAILED' : 'LIVE',
        checkedAt: polled.checkedAt,
        endpoint: polled.endpoint,
        markets: polled.markets,
        errors: polled.errors,
        settlementFeeUsd: SETTLEMENT_FEE_USD,
        finalStatus: FINAL_STATUS,
        pendingStatuses: PENDING_FINAL_STATUSES,
        note: 'A payout is booked only for status=finalized with result yes/no. No settlement fee (verified).'
      });
    }

    /* Multi-market portfolio accounting for the current competition run. */
    if (p === '/api/market-stats') {
      const comp = getCompetition({ regime: memory.state.regime });
      return sendJSON(res, 200, {
        competition: { id: comp.competition.id, seed: comp.competition.seed, horizonPeriods: comp.competition.horizonPeriods },
        marketStats: comp.marketStats,
        perStrategy: comp.results.map((r) => ({
          username: r.username,
          marketAnalytics: r.marketAnalytics
        }))
      });
    }

    /* The accumulated history store written by scripts/ingest-history.mjs. */
    if (p === '/api/history') {
      const manifest = readHistoryManifest();
      if (!manifest) {
        return sendJSON(res, 200, {
          present: false,
          dir: HISTORY_DIR,
          note: 'No accumulated history yet. Run `node scripts/ingest-history.mjs` from a network that can reach external-api.kalshi.com (the build sandbox cannot — IRREGULARITIES.md #4), or let .github/workflows/daily-history.yml run it daily.'
        });
      }
      return sendJSON(res, 200, { present: true, dir: HISTORY_DIR, manifest });
    }

    /* What the daily ingest has added, what it may use and what it refused. */
    if (p === '/api/history-audit') {
      return sendJSON(res, 200, getHistoryAudit());
    }

    if (p === '/api/leaderboard') {
      const comp = getCompetition({ regime: memory.state.regime });
      return sendJSON(res, 200, {
        competition: comp.competition,
        leaderboard: memory.getLeaderboard(),
        computedLeaderboard: comp.leaderboard,
        provenance: comp.competition.dataProvenance
      });
    }

    if (p === '/api/run-competition' && req.method === 'POST') {
      const body = await readBody(req);

      // Fill realism (Irregularity #29). Every fill — taker or resting maker —
      // is bounded by the contracts that really traded in that daily bar, 10% by
      // default. `null` switches the bound off and is accepted deliberately, so
      // the artefact it removes can be reproduced; the response says so.
      let fillBound;
      if (body.maxFillFractionOfPeriodVolume !== undefined && body.maxFillFractionOfPeriodVolume !== null) {
        fillBound = Number(body.maxFillFractionOfPeriodVolume);
        if (!Number.isFinite(fillBound) || fillBound <= 0 || fillBound > 1) {
          return sendJSON(res, 400, { error: 'maxFillFractionOfPeriodVolume must be null or a number in (0, 1]' });
        }
      } else if (body.maxFillFractionOfPeriodVolume === null) {
        fillBound = null;
      }

      // Depth source (pass 3): the captured ladder is the REAL book, so it is the
      // default everywhere results are published. 'modelled' is kept as an
      // explicit comparison and is always labelled wherever it is used.
      const depthMode = body.depthMode === undefined ? 'captured' : String(body.depthMode);
      if (!['captured', 'modelled'].includes(depthMode)) {
        return sendJSON(res, 400, { error: 'depthMode must be "captured" or "modelled"' });
      }

      // Flight (2026-09-18): which replay store the competition runs on.
      // 'daily' (default) is the original daily-bar universe; 'hourly' and
      // 'micro' run the 60-minute and 1-minute intraday stores — separate
      // leaderboards, never merged into one ranking.
      const flight = body.flight === undefined ? 'daily' : String(body.flight);
      if (!['daily', 'hourly', 'micro'].includes(flight)) {
        return sendJSON(res, 400, { error: 'flight must be "daily", "hourly" or "micro"' });
      }

      const comp = getCompetition({
        flight,
        depthMode,
        seed: Number(body.seed ?? 20260917),
        settleAtEnd: Boolean(body.settleAtEnd),
        finalResult: body.finalResult || null,
        initialCapital: Number(body.initialCapital ?? 100000),
        regime: body.regime || memory.state.regime,
        // Per-market capital allocation (item #7): null = no cap (the
        // competition default). A number caps each market's notional as a
        // fraction of equity, e.g. 0.25.
        maxNotionalPerMarketPct: body.maxNotionalPerMarketPct ?? null,
        maxFillFractionOfPeriodVolume: fillBound
      });
      return sendJSON(res, 200, {
        notice:
          comp.competition.maxFillFractionOfPeriodVolume === null
            ? 'The volume bound is OFF. Fills are then limited only by modelled depth, which reproduces the artefact recorded as Irregularity #29 (returns of +2,005% that the real order book would never have paid). Every number in this response is unrealistic.'
            : null,
        competition: comp.competition,
        leaderboard: comp.leaderboard,
        marketStats: comp.marketStats,
        results: comp.results.map((r) => ({
          username: r.username,
          strategyId: r.strategyId,
          strategy: r.strategy,
          stats: r.stats,
          returnPct: r.returnPct,
          finalEquity: r.finalEquity,
          periods: r.periods,
          attribution: r.attribution,
          analysis: r.analysis,
          curveAnalysis: r.curveAnalysis,
          equityCurve: r.equityCurve,
          recentTrades: r.recentTrades,
          // Multi-market accounting for this one entry (per-market exposure,
          // fees and concentration), computed from its own trade log.
          marketAnalytics: r.marketAnalytics,
          unfilledContracts: r.unfilledContracts,
          actionLogCount: (r.actionLog || []).length
        }))
      });
    }

    if (p === '/api/regimes') return sendJSON(res, 200, { regimes: REGIMES, active: memory.state.regime });

    if (p === '/api/state' && req.method === 'GET') {
      return sendJSON(res, 200, { ok: true, storage: memory.storageInfo(), state: memory.state });
    }
    if (p === '/api/state' && req.method === 'POST') {
      const body = await readBody(req, 8 * 1024 * 1024);
      if (!body.state) return sendJSON(res, 400, { ok: false, error: 'state is required' });
      try {
        memory.importMemoryJSON(body.state);
        persistStore();
        return sendJSON(res, 200, { ok: true, participants: memory.state.participants.length });
      } catch (err) {
        return sendJSON(res, 400, { ok: false, error: err.message });
      }
    }

    if (p === '/api/register' && req.method === 'POST') {
      const body = await readBody(req);
      const check = validateUsername(String(body.username || '').trim(), memory.state);
      if (!check.ok) return sendJSON(res, 409, { ok: false, reason: check.reason, rules: '3-24 chars, [A-Za-z0-9_.], must be unique and not an algorithmic strategy handle' });
      const r = memory.registerParticipant(check.username, {
        avatar: body.avatar,
        strategyNote: body.strategyNote,
        startingCapital: Number(body.startingCapital ?? memory.state.initialCapital)
      });
      persistStore();
      getUserPortfolio(r.participant.username);
      return sendJSON(res, 201, { ok: true, participant: r.participant, leaderboard: memory.getLeaderboard() });
    }

    if (p === '/api/trade' && req.method === 'POST') {
      const body = await readBody(req);
      const username = String(body.username || '').trim();
      const participant = memory.getParticipant(username);
      if (!participant) return sendJSON(res, 404, { ok: false, error: 'participant_not_found', hint: 'POST /api/register first' });

      const ticker = String(body.ticker || '');
      const book = getLiveBook(ticker);
      if (!book) return sendJSON(res, 404, { ok: false, error: 'unknown_ticker', available: getVerifiedMarkets().map((m) => m.ticker) });

      const side = String(body.side || 'YES').toUpperCase();
      if (!['YES', 'NO'].includes(side)) return sendJSON(res, 400, { ok: false, error: "side must be 'YES' or 'NO'" });
      const count = round2(Number(body.count));
      if (!(count > 0)) return sendJSON(res, 400, { ok: false, error: 'count must be > 0 (fractional to 0.01 contracts is allowed)' });

      const portfolio = getUserPortfolio(username);
      const action = String(body.action || 'buy').toLowerCase();
      try {
        const exec = action === 'sell'
          ? portfolio.sellPosition(book, side, count, { strategy: username })
          : portfolio.buyPosition(book, side, count, { strategy: username });
        const stats = portfolio.updateEquity();
        memory.recordUserTrade(username, { ...exec, stats });
        persistStore();
        return sendJSON(res, 200, { ok: true, execution: exec, stats, participant: memory.getParticipant(username), leaderboard: memory.getLeaderboard() });
      } catch (err) {
        return sendJSON(res, 400, { ok: false, error: err.message });
      }
    }

    if (p === '/api/quote' && req.method === 'GET') {
      const ticker = url.searchParams.get('ticker');
      const book = getLiveBook(ticker);
      if (!book) return sendJSON(res, 404, { error: 'unknown_ticker' });
      const side = String(url.searchParams.get('side') || 'YES').toLowerCase();
      const count = round2(Number(url.searchParams.get('count') || 100));
      if (!(count > 0)) return sendJSON(res, 400, { error: 'count must be > 0' });
      const tiers = side === 'yes' ? book.getYesAskTiers() : book.getNoAskTiers();

      // Estimate WITHOUT mutating the live book, using the same policy as the
      // engine: fill only against depth that exists, report the rest as unfilled.
      let remaining = count;
      let cost = 0;
      const fills = [];
      for (const t of tiers) {
        if (remaining <= 0.005) break;
        const q = Math.min(remaining, t.count);
        if (q <= 0) continue;
        fills.push({ price: t.price, count: q });
        cost += q * t.price;
        remaining -= q;
      }
      const unfilled = remaining > 0.005 ? round2(remaining) : 0;
      const filled = round2(count - unfilled);
      const vwap = filled > 0 ? cost / filled : null;
      const bestAsk = tiers[0]?.price ?? null;
      const feeInfo = computeKalshiFee({
        count: filled,
        price: vwap === null ? 0.5 : vwap,
        multiplier: book.feeMultiplier,
        isMaker: false
      });
      return sendJSON(res, 200, {
        ticker: book.ticker,
        side: side.toUpperCase(),
        count,
        filled,
        unfilled,
        fillStatus: filled <= 0 ? 'unfilled' : unfilled > 0 ? 'partial' : 'filled',
        bestAsk,
        vwap: vwap === null ? null : Number(vwap.toFixed(6)),
        slippage: vwap !== null && bestAsk !== null ? Number((vwap - bestAsk).toFixed(6)) : null,
        fills,
        bookExhausted: unfilled > 0,
        depthAvailable: round2(tiers.reduce((s, t) => s + t.count, 0)),
        fee: feeInfo.fee,
        feeFormula: feeInfo.formula,
        feeMultiplier: feeInfo.multiplier,
        feeSource: feeInfo.source,
        totalCost: Number((cost + feeInfo.fee).toFixed(2)),
        note: unfilled > 0
          ? `${unfilled} contract(s) could NOT fill: only ${filled} were available across ${tiers.length} level(s). No execution price is invented beyond the book.`
          : null,
        bookSnapshot: book.snapshot()
      });
    }

    if (p === '/api/settle' && req.method === 'POST') {
      const body = await readBody(req);
      const ticker = String(body.ticker || '');
      const result = String(body.result || '').toUpperCase();
      if (!['YES', 'NO'].includes(result)) return sendJSON(res, 400, { ok: false, error: "result must be 'YES' or 'NO'" });
      const settled = [];
      for (const [username, portfolio] of userPortfolios.entries()) {
        const outcomes = portfolio.settleMarket(ticker, result);
        if (outcomes.length) {
          const stats = portfolio.updateEquity();
          const participant = memory.getParticipant(username);
          if (participant) {
            participant.cash = stats.cash;
            participant.equity = stats.equity;
            participant.realizedPnl = stats.realizedPnl;
            participant.returnPct = stats.returnPct;
            participant.maxDrawdownPct = stats.maxDrawdownPct;
            participant.winningTrades = stats.winningTrades;
            participant.losingTrades = stats.losingTrades;
            participant.feesPaid = stats.feesPaid;
          }
          settled.push({ username, outcomes, stats });
        }
      }
      memory.save();
      persistStore();
      return sendJSON(res, 200, { ok: true, ticker, result, settled, settlementFee: 0, note: 'Verified: "There is no settlement fee." (official Kalshi fee schedule)' });
    }

    if (p === '/api/advance' && req.method === 'POST') {
      const body = await readBody(req);
      const r = memory.advanceSimulation(Number(body.weeks ?? 1));
      persistStore();
      return sendJSON(res, 200, { ok: true, ...r, leaderboard: memory.getLeaderboard() });
    }

    if (p === '/api/regime' && req.method === 'POST') {
      const body = await readBody(req);
      const r = memory.setRegime(String(body.regime || ''));
      if (!r.ok) return sendJSON(res, 400, r);
      competitionCache = null; // regime changes invalidate cached results
      persistStore();
      return sendJSON(res, 200, { ok: true, regime: r.regime });
    }

    if (p === '/api/reset' && req.method === 'POST') {
      const body = await readBody(req).catch(() => ({}));
      memory.reset({ year: body.year, regime: body.regime });
      userPortfolios.clear();
      liveBooks.clear();
      competitionCache = null;
      deskSessionCache.clear();
      deskRecordCache.clear();
      seasonCache.clear();
      persistStore();
      return sendJSON(res, 200, { ok: true, state: memory.state });
    }

    if (p === '/api/export/json') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=UTF-8', 'Content-Disposition': 'attachment; filename="kalshi-competition-memory.json"', ...CORS });
      return res.end(memory.exportMemoryJSON());
    }

    if (p === '/api/export/csv') {
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=UTF-8', 'Content-Disposition': 'attachment; filename="kalshi-competition-trades.csv"', ...CORS });
      return res.end(memory.exportTradesCSV());
    }

    if (p === '/api/backtest' && req.method === 'POST') {
      const body = await readBody(req);
      const lint = lintSource(String(body.source || ''));
      if (!ALLOW_USER_CODE) {
        return sendJSON(res, 403, {
          ok: false,
          error: 'server_side_user_code_disabled',
          lint,
          detail:
            'Running untrusted JavaScript inside the Node server process is disabled by default. ' +
            'Set ALLOW_USER_CODE=true to enable it for a trusted local environment. Real isolation requires a separate sandboxed runtime (see IRREGULARITIES.md #7). ' +
            'The Strategy Lab in the browser runs your code client-side, which needs no server execution.'
        });
      }
      if (!lint.ok) return sendJSON(res, 400, { ok: false, error: 'lint_failed', problems: lint.problems });
      try {
        const strategy = compileUserStrategy(body.source, { username: body.username, title: body.title });
        const { runCustomStrategy } = await import('./src/strategy-runner.js');
        const result = runCustomStrategy(strategy, { settleAtEnd: Boolean(body.settleAtEnd), finalResult: body.finalResult || null });
        return sendJSON(res, 200, {
          ok: true,
          username: strategy.username,
          stats: result.stats,
          returnPct: result.returnPct,
          finalEquity: result.finalEquity,
          periods: result.periods,
          attribution: result.attribution,
          analysis: result.analysis,
          equityCurve: result.equityCurve,
          recentTrades: result.recentTrades,
          runtimeErrors: strategy.runtimeErrors,
          dataProvenance: result.dataProvenance
        });
      } catch (err) {
        return sendJSON(res, 400, { ok: false, error: err.message, code: err.code || null });
      }
    }

    /* ---------------- Live Desk (paper orders on real open contracts) ---------------- */

    if (p === '/api/live-desk' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const capital = Number(url.searchParams.get('capital') || 100000);
      return sendJSON(res, 200, await deskSession(asOf, capital));
    }

    if (p === '/api/live-desk/cutoffs') {
      return sendJSON(res, 200, { ok: true, ...deskCutoffList() });
    }

    /* ---------------- Desk SEASON (the carried multi-round book) ---------------- */

    if (p === '/api/desk-season' && req.method === 'GET') {
      const maxRounds = Number(url.searchParams.get('maxRounds') || 12);
      const capital = Number(url.searchParams.get('capital') || 100000);
      const payload = seasonPayload(maxRounds, capital);
      const { records, ...rest } = payload;
      return sendJSON(res, 200, { ...rest, recordCount: (records || []).length, ok: payload.audit?.ok });
    }

    if (p === '/api/desk-season/schedule') {
      const maxRounds = Number(url.searchParams.get('maxRounds') || 12);
      const schedule = seasonSchedule({ data: DESK_DATA, maxRounds });
      return sendJSON(res, 200, { ok: true, ...schedule, rule: SEASON_RULE, deskFacts: auditorFacts(), seasonFacts: seasonAuditorFacts() });
    }

    if (p === '/api/desk-season/strategies') {
      return sendJSON(res, 200, {
        ok: true,
        version: SEASON_VERSION,
        count: SEASON_STRATEGIES.length,
        strategies: SEASON_STRATEGIES.map((s) => ({
          id: s.id, username: s.username, name: s.name, category: s.category, source: s.source,
          thesis: s.thesis, rules: s.rules, sizing: s.sizing, mandate: s.mandate, doesNotUse: s.doesNotUse || null
        }))
      });
    }

    if (p === '/api/desk-season/ledger.jsonl') {
      const maxRounds = Number(url.searchParams.get('maxRounds') || 12);
      const capital = Number(url.searchParams.get('capital') || 100000);
      const payload = seasonPayload(maxRounds, capital);
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=UTF-8', 'Content-Disposition': 'attachment; filename="kalshi-desk-season-ledger.jsonl"', ...CORS });
      return res.end(seasonLedgerJsonl(payload.records));
    }

    if (p === '/api/desk-season/audit') {
      const maxRounds = Number(url.searchParams.get('maxRounds') || 12);
      const payload = seasonPayload(maxRounds, Number(url.searchParams.get('capital') || 100000));
      return sendJSON(res, 200, {
        ok: payload.audit.ok,
        checkedAt: payload.audit.checkedAt,
        totals: payload.audit.totals,
        checks: payload.audit.checks,
        mismatches: payload.audit.mismatches,
        facts: seasonAuditorFacts(),
        deskFacts: auditorFacts(),
        summary: describeSeasonAudit(payload.audit)
      });
    }

    if (p === '/api/live-desk/universe' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const u = buildDeskUniverse({ asOf });
      return sendJSON(res, 200, {
        ok: true,
        asOf: u.asOf,
        coverage: u.coverage,
        rule: u.rule,
        docs: u.docs,
        markets: u.markets.map((m) => ({
          ticker: m.ticker, series: m.seriesTicker, title: m.title, status: m.status, isOpen: m.isOpen,
          closeTime: m.closeTime, expirationTime: m.expirationTime, tradeable: m.tradeable,
          notTradeableReason: m.notTradeableReason, feeMultiplier: m.feeMultiplier, feeType: m.feeType,
          tick: m.tick, quote: m.quote, touch: m.touch, ladderAt: m.ladderAt, ladderUrl: m.ladderUrl,
          marketCapturedAt: m.marketCapturedAt, marketUrl: m.marketUrl, lookAheadFields: m.lookAheadFields,
          yesLevels: m.ladder?.yes?.levelCount ?? 0, noLevels: m.ladder?.no?.levelCount ?? 0,
          yesDepth: m.ladder?.yes?.totalCount ?? null, noDepth: m.ladder?.no?.totalCount ?? null,
          bestYesBid: m.ladder?.yes?.best ?? null, bestNoBid: m.ladder?.no?.best ?? null,
          volume24h: m.volume24h, openInterest: m.openInterest, lifetimeVolume: m.volume,
          liquidity: m.liquidityBase
        })),
        quotedOnly: u.quotedOnly
      });
    }

    if (p === '/api/live-desk/ticket' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const ticker = url.searchParams.get('ticker');
      const u = buildDeskUniverse({ asOf });
      const market = u.byTicker.get(ticker);
      if (!market) return sendJSON(res, 404, { ok: false, error: 'unknown_ticker', ticker });
      if (!market.ladder) return sendJSON(res, 200, { ok: false, error: 'no_captured_ladder', reason: market.notTradeableReason, ticker });
      const book = createDeskBook(market);
      const preview = sizeDeskOrder(book, {
        action: url.searchParams.get('action') || 'buy',
        side: url.searchParams.get('side') || 'yes',
        count: Number(url.searchParams.get('count') || 10),
        type: url.searchParams.get('type') || 'market',
        limitPrice: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : undefined
      });
      return sendJSON(res, 200, { ok: true, ticker, asOf: u.asOf, market: { ticker, closeTime: market.closeTime, feeType: market.feeType, feeMultiplier: market.feeMultiplier, ladderAt: market.ladderAt, ladderUrl: market.ladderUrl }, preview });
    }

    if (p === '/api/live-desk/order' && req.method === 'POST') {
      const body = await readBody(req);
      const asOf = body.asOf || null;
      const strategy = body.strategy || 'Manual_Desk_Ticket';
      const u = buildDeskUniverse({ asOf });
      const market = u.byTicker.get(body.ticker);
      if (!market) return sendJSON(res, 404, { ok: false, error: 'unknown_ticker', ticker: body.ticker });
      const book = createDeskBook(market);
      const seq = readDeskOrderLog().filter((r) => r.k === 'ORDER').length + 1;
      const result = placeDeskOrder(book, {
        strategy,
        action: body.action || 'buy',
        side: body.side || 'yes',
        count: body.count,
        type: body.type || 'market',
        limitPrice: body.limit,
        postOnly: Boolean(body.postOnly),
        reason: body.reason || 'placed from the Live Desk order ticket'
      }, { seq, at: u.asOf });
      const records = [result.order, ...result.fills];
      appendDeskOrders(records);
      return sendJSON(res, 200, {
        ok: !result.rejected,
        rejected: result.rejected || null,
        order: result.order,
        fills: result.fills,
        preview: result.preview,
        note:
          'This order is recorded against the newest real captured ladder at or before the cut-off. ' +
          'It is NOT sent to Kalshi: the desk holds paper positions only, and every price it quotes came from the captured book.'
      });
    }

    if (p === '/api/live-desk/orders' && req.method === 'GET') {
      const records = readDeskOrderLog();
      return sendJSON(res, 200, { ok: true, count: records.length, records });
    }

    if (p === '/api/live-desk/orders' && req.method === 'DELETE') {
      if (fs.existsSync(DESK_ORDER_LOG)) fs.unlinkSync(DESK_ORDER_LOG);
      return sendJSON(res, 200, { ok: true, cleared: true });
    }

    if (p === '/api/live-desk/ledger.jsonl') {
      const capital = Number(url.searchParams.get('capital') || 100000);
      const asOf = url.searchParams.get('asOf') || null;
      const key = `${asOf || 'live'}|${capital}`;
      if (!deskSessionCache.has(key)) await deskSession(asOf, capital);
      res.writeHead(200, { 'Content-Type': 'application/x-ndjson; charset=UTF-8', 'Content-Disposition': 'attachment; filename="kalshi-live-desk-ledger.jsonl"', ...CORS });
      return res.end(deskLedgerJsonl(await deskCacheRecords(key)));
    }

    if (p === '/api/live-desk/fills.csv') {
      const capital = Number(url.searchParams.get('capital') || 100000);
      const asOf = url.searchParams.get('asOf') || null;
      const key = `${asOf || 'live'}|${capital}`;
      if (!deskSessionCache.has(key)) await deskSession(asOf, capital);
      res.writeHead(200, { 'Content-Type': 'text/csv; charset=UTF-8', 'Content-Disposition': 'attachment; filename="kalshi-live-desk-fills.csv"', ...CORS });
      return res.end(deskFillsCsv(await deskCacheRecords(key)));
    }

    if (p === '/api/live-desk/placed-trades' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const capital = Number(url.searchParams.get('capital') || 100000);
      const session = await deskSession(asOf, capital);
      let list = session.placedTrades || [];
      const strat = url.searchParams.get('strategy');
      const ticker = url.searchParams.get('ticker');
      const status = url.searchParams.get('status');
      if (strat) list = list.filter((t) => t.strategy.toLowerCase() === strat.toLowerCase());
      if (ticker) list = list.filter((t) => t.ticker.toLowerCase() === ticker.toLowerCase());
      if (status) list = list.filter((t) => t.status.toLowerCase() === status.toLowerCase());
      return sendJSON(res, 200, { ok: true, asOf: session.asOf, count: list.length, totalPlaced: (session.placedTrades || []).length, placedTrades: list });
    }

    if (p === '/api/live-desk/upcoming-trades' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const capital = Number(url.searchParams.get('capital') || 100000);
      const session = await deskSession(asOf, capital);
      let list = session.upcomingTrades || [];
      const strat = url.searchParams.get('strategy');
      const ticker = url.searchParams.get('ticker');
      const trigger = url.searchParams.get('triggerType');
      if (strat) list = list.filter((t) => t.strategy.toLowerCase() === strat.toLowerCase());
      if (ticker) list = list.filter((t) => t.ticker.toLowerCase() === ticker.toLowerCase());
      if (trigger) list = list.filter((t) => t.triggerType.toLowerCase() === trigger.toLowerCase());
      return sendJSON(res, 200, { ok: true, asOf: session.asOf, count: list.length, totalUpcoming: (session.upcomingTrades || []).length, upcomingTrades: list });
    }

    if (p === '/api/live-desk/trades.json' && req.method === 'GET') {
      const asOf = url.searchParams.get('asOf') || null;
      const capital = Number(url.searchParams.get('capital') || 100000);
      const session = await deskSession(asOf, capital);
      return sendJSON(res, 200, {
        ok: true,
        asOf: session.asOf,
        placedCount: (session.placedTrades || []).length,
        upcomingCount: (session.upcomingTrades || []).length,
        placedTrades: session.placedTrades || [],
        upcomingTrades: session.upcomingTrades || []
      });
    }

    /* ---------------- Kalshi REST proxy ---------------- */

    if (p.startsWith('/api/kalshi/')) {
      const upstreamPath = p.replace(/^\/api\/kalshi/, '');
      const r = await proxyKalshi(upstreamPath, url.search);
      if (r.ok) return sendJSON(res, 200, { ok: true, source: DATA_SOURCE.LIVE, url: r.url, signed: r.signed, data: r.data });
      return sendJSON(res, 200, {
        ok: false,
        source: null,
        url: r.url,
        signed: r.signed,
        status: r.status,
        error: r.error || r.text || `http_${r.status}`,
        rateLimited: Boolean(r.rateLimited),
        fallback: {
          source: DATA_SOURCE.VERIFIED_SNAPSHOT,
          capturedAt: CAPTURE_META.capturedAt,
          note: 'Upstream unreachable from this host. Serving the REAL captured snapshot instead so no invented data is shown.'
        },
        diagnostics: {
          hint: 'A TLS handshake failure from a datacenter IP is a known Kalshi edge-security behaviour (see IRREGULARITIES.md #4). Run this server from a residential/office network to reach the live API.'
        }
      });
    }

    if (p === '/api/transport') {
      const live = await proxyKalshi(KALSHI_PATHS.exchangeStatus, '');
      return sendJSON(res, 200, {
        credentialsConfigured: credentials.configured,
        environment: credentials.environment,
        allowUserCode: ALLOW_USER_CODE,
        upstreamReachable: Boolean(live.ok),
        upstream: { url: live.url, status: live.status, error: live.error || null, data: live.ok ? live.data : null },
        verifiedSnapshot: {
          capturedAt: CAPTURE_META.capturedAt,
          apiBase: CAPTURE_META.apiBase,
          exchangeStatus: EXCHANGE_STATUS,
          historicalCutoff: HISTORICAL_CUTOFF
        },
        feedMode: upstream.conn ? FEED_MODE.UPSTREAM : FEED_MODE.SIM,
        feedStatus: { connected: Boolean(upstream.conn), stats: upstream.stats, credentialsConfigured: credentials.configured }
      });
    }

    if (p === '/api/verified') {
      return sendJSON(res, 200, {
        captureMeta: CAPTURE_META,
        exchangeStatus: EXCHANGE_STATUS,
        historicalCutoff: HISTORICAL_CUTOFF,
        series: SERIES,
        marketCount: getVerifiedMarkets().length,
        candlestickTickers: Object.keys(getVerifiedCandleMap()),
        replayableMarkets: getReplayableMarkets().map((m) => m.ticker)
      });
    }

    /* ---------------- static ---------------- */

    let pathname = p === '/' ? '/index.html' : p;
    const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
    const filePath = path.join(__dirname, safe);
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end('403 Forbidden');
    }

    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
        return res.end('404 Not Found');
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Content-Length': stats.size,
        'Cache-Control': 'no-cache'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (err) {
    sendJSON(res, 500, { ok: false, error: String(err && err.message ? err.message : err) });
  }
});

/* ---------------- WebSocket relay ---------------- */

wsHandle = attachWebSocketServer(server, {
  path: '/ws/feed',
  onConnection: (conn) => {
    conn.send(JSON.stringify({
      type: 'feed_status',
      msg: {
        mode: upstream.conn ? FEED_MODE.UPSTREAM : FEED_MODE.SIM,
        upstreamConnected: Boolean(upstream.conn),
        credentialsConfigured: credentials.configured,
        kalshiWsUrl: KALSHI_ENDPOINTS.websocket.production,
        note: upstream.conn
          ? 'Relaying authenticated Kalshi WebSocket messages.'
          : 'Kalshi WebSocket requires signed handshake headers; browsers cannot send them, and no server credentials are configured. Serving the SIMULATED market-maker feed. This is NOT live Kalshi data.',
        doc: 'https://docs.kalshi.com/getting_started/quick_start_websockets',
        markets: getReplayableMarkets().map((m) => m.ticker)
      }
    }));

    conn.on('message', async (raw) => {
      const evt = parseFeedMessage(raw);
      if (evt.type === 'unparseable') return;
      // Let clients (re)subscribe; if upstream is live, forward the request.
      let parsed = null;
      try { parsed = JSON.parse(raw); } catch { return; }
      if (parsed && parsed.cmd === 'subscribe') {
        if (upstream.conn) {
          upstream.conn.send(raw);
        } else {
          conn.send(JSON.stringify({ type: 'feed_status', msg: { subscribed: parsed.params || null, mode: FEED_MODE.SIM, note: 'Subscription accepted locally; upstream Kalshi WS is not connected.' } }));
        }
      }
    });
  }
});

// Wire the zero-dependency upstream client into the feed manager (Node only).
(async () => {
  try {
    const { connectUpstream } = await import('./src/ws-lite.js');
    upstream.connectImpl = connectUpstream;
    if (credentials.configured) {
      upstream.onEvent = (evt) => broadcast(evt);
      upstream.onStatus = (s) => broadcast({ type: 'feed_status', msg: s });
      await upstream.connect();
    } else {
      console.log('[feed] KALSHI_API_KEY_ID / KALSHI_API_PRIVATE_KEY not set — live WebSocket relay disabled.');
      console.log('       The Kalshi WebSocket requires signed handshake headers (browsers cannot send them).');
      console.log('       Serving the labelled SIMULATED market-maker feed instead.');
    }
  } catch (err) {
    console.error('[feed] upstream init failed:', err.message);
  }
})();

const storeStatus = loadStore();
getCompetition({}); // warm the cache and populate computed results
startSimulationFeed();

server.listen(PORT, HOST, () => {
  console.log('──────────────────────────────────────────────────────────────');
  console.log(' KalshiPaperSim v2 — paper trading competition platform');
  console.log(`   http://${HOST}:${PORT}   (preview: bound to 0.0.0.0)`);
  console.log('──────────────────────────────────────────────────────────────');
  console.log(` store      : ${path.relative(__dirname, STORE_FILE)} (${storeStatus.ok ? 'loaded' : storeStatus.reason})`);
  if (storeStatus.roster) {
    console.log(` roster     : ${storeStatus.roster.total} strategies synced` +
      (storeStatus.roster.added.length ? ` (added: ${storeStatus.roster.added.join(', ')})` : '') +
      (storeStatus.roster.retired.length ? ` (retired: ${storeStatus.roster.retired.join(', ')})` : ''));
  }
  console.log(` credentials: ${credentials.configured ? `configured (${credentials.environment})` : 'not configured'}`);
  console.log(` user code  : server-side execution ${ALLOW_USER_CODE ? 'ENABLED' : 'DISABLED (default)'}`);
  console.log(` snapshot   : real Kalshi data captured ${CAPTURE_META.capturedAt}`);
  console.log(` websocket  : /ws/feed  (relay ${upstream.conn ? 'LIVE' : 'SIMULATED'})`);
  console.log('──────────────────────────────────────────────────────────────');
});

process.on('SIGTERM', () => {
  try { upstream.disconnect(); } catch { /* noop */ }
  if (simTimer) clearInterval(simTimer);
  if (wsHandle) wsHandle.closeAll();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500);
});

export { server, memory, getCompetition };
