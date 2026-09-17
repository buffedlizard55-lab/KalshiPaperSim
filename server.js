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
import { runCompetition, getReplayableMarkets, getVerifiedCandleMap, getHistoryAudit } from './src/strategy-runner.js';
import { CompetitionMemoryEngine, REGIMES, validateUsername } from './src/competition-memory.js';
import { OrderBook, PaperPortfolio, round2 } from './src/simulation-engine.js';
import { computeKalshiFee } from './src/kalshi-fees.js';
import { attachWebSocketServer } from './src/ws-lite.js';
import { UpstreamFeedManager, FEED_MODE, parseFeedMessage } from './src/kalshi-ws.js';
import { compileUserStrategy, lintSource } from './src/strategy-sandbox.js';
import { credentialsFromEnv, buildAuthHeaders } from './src/kalshi-auth.js';
import { classifySettlement, buildSettlementPlan, fetchMarketSettlements, FINAL_STATUS, PENDING_FINAL_STATUSES, SETTLEMENT_FEE_USD } from './src/settlement-tracker.js';
import { readHistoryManifest, HISTORY_DIR } from './src/history-store.js';

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

let competitionCache = null;
let competitionCacheKey = null;

function getCompetition(options = {}) {
  const key = JSON.stringify({
    seed: options.seed ?? 20260917,
    settleAtEnd: Boolean(options.settleAtEnd),
    finalResult: options.finalResult || null,
    regime: options.regime || 'baseline',
    capital: options.initialCapital ?? 100000
  });
  if (competitionCache && competitionCacheKey === key) return competitionCache;
  const result = runCompetition(options);
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
      const comp = getCompetition({
        seed: Number(body.seed ?? 20260917),
        settleAtEnd: Boolean(body.settleAtEnd),
        finalResult: body.finalResult || null,
        initialCapital: Number(body.initialCapital ?? 100000),
        regime: body.regime || memory.state.regime,
        // Per-market capital allocation (item #7): null = no cap (the
        // competition default). A number caps each market's notional as a
        // fraction of equity, e.g. 0.25.
        maxNotionalPerMarketPct: body.maxNotionalPerMarketPct ?? null
      });
      return sendJSON(res, 200, {
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
