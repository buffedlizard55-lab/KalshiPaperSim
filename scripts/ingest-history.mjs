#!/usr/bin/env node
/**
 * KalshiPaperSim — Daily History Ingest
 * =====================================================================
 * Recommended-work item #1: "accumulate history daily". This job appends each
 * day's REAL candlesticks (and, optionally, order-book snapshots) to a local
 * history store so a genuine multi-month dataset can grow over time. The
 * competition replay then has more than one window to work with.
 *
 * WHAT IT DOES
 *   1. For every tracked market ticker it reads the existing store
 *      (data/history/<ticker>.json) and asks Kalshi only for the bars NEWER
 *      than the newest bar already stored (incremental, cheap, idempotent).
 *   2. Merges by end_period_ts. Existing bars are NEVER overwritten: if a
 *      re-fetched bar disagrees with the stored one, the difference is recorded
 *      in the manifest as a CONFLICT for review and the stored value is kept.
 *   3. Optionally captures an order-book snapshot per market (--with-books),
 *      because candlesticks carry no depth and depth is the missing input for
 *      honest fill simulation.
 *   4. Writes data/history/_manifest.json with counts, source URLs and conflicts.
 *
 * WHAT IT NEVER DOES
 *   - It never invents a bar, fills a gap, or interpolates a missing session.
 *     A day with no trading simply produces no bar (verified: the live API omits
 *     OHLC entirely on no-trade periods, returning only previous_dollars).
 *   - It never rewrites history. Conflicts are flagged, not resolved silently.
 *
 * ENDPOINTS (official, documented)
 *   GET /series/{series_ticker}/markets/{ticker}/candlesticks?start_ts=&end_ts=&period_interval=1440
 *     https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *   GET /markets/{ticker}/orderbook
 *     https://docs.kalshi.com/getting_started/orderbook_responses
 *   GET /historical/cutoff   (how far back live data goes)
 *     https://docs.kalshi.com/getting_started/historical_data
 *   Rate limits (token bucket, 429 has no Retry-After → exponential backoff):
 *     https://docs.kalshi.com/getting_started/rate_limits
 *
 * USAGE
 *   node scripts/ingest-history.mjs                        # tracked universe, daily bars
 *   node scripts/ingest-history.mjs --tickers=A,B          # explicit tickers
 *   node scripts/ingest-history.mjs --series=KXNASDAQ100Y  # every market of a series
 *   node scripts/ingest-history.mjs --with-books           # also capture depth
 *   node scripts/ingest-history.mjs --days=120             # backfill window on a cold store
 *   node scripts/ingest-history.mjs --dry-run              # show what would be fetched
 *   node scripts/ingest-history.mjs --verify               # no network: audit the store
 *   node scripts/ingest-history.mjs --cutoff               # print the live retention cutoff
 *
 * NOTE ON THIS SANDBOX: direct TLS to *.kalshi.com is blocked from the build
 * container (see IRREGULARITIES.md #4), so this script cannot run here. It is
 * designed to run from any normal network, from cron, or from the included
 * GitHub Actions workflow (.github/workflows/daily-history.yml), which has
 * unrestricted egress and commits the growing dataset back to the repo.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { KALSHI_ENDPOINTS, KALSHI_PATHS, RATE_LIMITS } from '../src/kalshi-config.js';
import { deriveSeriesTicker } from '../src/kalshi-api.js';
import { CANDLESTICKS } from '../src/verified-snapshot.js';
import { EXTENDED_SERIES, getExtendedCandlesticks } from '../src/verified-candles.js';
import { stableEqual } from '../src/json-utils.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
const BASE = KALSHI_ENDPOINTS.rest.production;
const DAY = 86400;

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */
function parseArgs(argv) {
  const args = {
    tickers: null,
    series: null,
    days: 90,
    withBooks: false,
    // Capture GET /markets/{ticker} alongside the bars. The replay needs the real
    // market object (price_level_structure, strike, series, status) to build a
    // book for a market that is not in the in-repo snapshot — without it a newly
    // discovered market could never be replayed (recommended-work item #3).
    withMarket: true,
    minVolume: 0,
    maxMarkets: 0,
    dryRun: false,
    verify: false,
    cutoff: false,
    minIntervalMs: 250,
    timeoutMs: 15000
  };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'tickers') args.tickers = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === 'series') args.series = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === 'days') args.days = Number(v);
    else if (k === 'min-volume') args.minVolume = Number(v);
    else if (k === 'max-markets') args.maxMarkets = Number(v);
    else if (k === 'with-market') args.withMarket = v !== 'false';
    else if (k === 'with-books' || k === 'books') args.withBooks = v !== 'false';
    else if (k === 'dry-run') args.dryRun = v !== 'false';
    else if (k === 'verify') args.verify = v !== 'false';
    else if (k === 'cutoff') args.cutoff = v !== 'false';
    else if (k === 'min-interval-ms') args.minIntervalMs = Number(v);
    else if (k === 'timeout-ms') args.timeoutMs = Number(v);
    else if (k === 'help' || k === 'h') args.help = true;
  }
  return args;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const money = (n) => Number(n || 0).toLocaleString('en-US');

/* ------------------------------------------------------------------ *
 * Store I/O
 * ------------------------------------------------------------------ */
function storePath(ticker) {
  return path.join(DATA_DIR, `${ticker.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
}

function readStore(ticker) {
  const p = storePath(ticker);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`Corrupt history store ${p}: ${err.message} — refusing to guess its contents`);
  }
}

function writeJson(p, obj) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, `${JSON.stringify(obj, null, 2)}\n`);
}

/**
 * The tracked universe:
 *   1. every market the repository already holds real data for (in-repo captures);
 *   2. every market already in the accumulated store — so the universe is
 *      SELF-GROWING. A market discovered by a `--series=` run on day 1 keeps
 *      receiving bars on day 2 without anyone re-listing it.
 */
function defaultUniverse() {
  const tickers = new Set(Object.keys(CANDLESTICKS));
  for (const t of Object.keys(EXTENDED_SERIES)) tickers.add(t);
  if (fs.existsSync(DATA_DIR)) {
    for (const file of fs.readdirSync(DATA_DIR)) {
      if (!file.endsWith('.json') || file.startsWith('_')) continue;
      try {
        const store = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
        if (store && typeof store.ticker === 'string' && store.ticker) tickers.add(store.ticker);
      } catch {
        console.error(`⚠ unreadable store file ${file} — skipped, never guessed`);
      }
    }
  }
  return [...tickers].sort();
}

/** Lifetime volume in contracts, read from the live market object. */
function marketVolume(m) {
  const raw = m.volume_fp ?? m.volume ?? m.volume_24h_fp ?? 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

/** Seed a cold store from the verified in-repo captures (so nothing is lost). */
function seedFromRepo(ticker) {
  const ext = getExtendedCandlesticks(ticker);
  const bars = ext || CANDLESTICKS[ticker]?.candlesticks || null;
  if (!bars || bars.length === 0) return null;
  return {
    ticker,
    series_ticker: deriveSeriesTicker(ticker),
    period_interval: 1440,
    source: ext ? 'repo_extended_capture' : 'repo_snapshot_capture',
    seeded_from: ext ? EXTENDED_SERIES[ticker].meta.url : CANDLESTICKS[ticker]?._provenance?.url || null,
    captured_at: ext ? EXTENDED_SERIES[ticker].meta.capturedAt : CANDLESTICKS[ticker]?._provenance?.capturedAt || null,
    candlesticks: bars
  };
}

/* ------------------------------------------------------------------ *
 * HTTP (no dependencies; 429 → exponential backoff, per the rate-limit docs)
 * ------------------------------------------------------------------ */
async function getJson(url, { timeoutMs = 15000, retries = 3 } = {}) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === RATE_LIMITS.throttledStatus) {
        // Verified: 429 carries no Retry-After header → back off ourselves.
        lastErr = new Error('rate_limited (429, no Retry-After header)');
        await sleep(500 * 2 ** attempt);
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        return { ok: false, status: res.status, error: text.slice(0, 300) || `http_${res.status}` };
      }
      return { ok: true, status: res.status, json: await res.json() };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) await sleep(400 * 2 ** attempt);
    }
  }
  return { ok: false, status: 0, error: String(lastErr && lastErr.message ? lastErr.message : lastErr) };
}

/* ------------------------------------------------------------------ *
 * Merge
 * ------------------------------------------------------------------ */
/**
 * Merge newly fetched bars into the stored bars.
 * Returns { bars, added, conflicts } — conflicts are flagged, never resolved.
 */
export function mergeBars(storedBars, newBars) {
  const byTs = new Map(storedBars.map((b) => [Number(b.end_period_ts), b]));
  let added = 0;
  const conflicts = [];
  for (const bar of newBars) {
    const ts = Number(bar.end_period_ts);
    const existing = byTs.get(ts);
    if (!existing) {
      byTs.set(ts, bar);
      added += 1;
      continue;
    }
    // Deep compare with sorted keys: JSON.stringify's key-array replacer would
    // drop every nested price field and make different bars look identical.
    if (!stableEqual(existing, bar)) {
      // Kalshi can restate a bar (late prints). We keep the stored value and
      // report the difference rather than silently rewriting history.
      conflicts.push({ end_period_ts: ts, stored: existing, fetched: bar });
    }
  }
  const merged = [...byTs.values()].sort((x, y) => Number(x.end_period_ts) - Number(y.end_period_ts));
  return { bars: merged, added, conflicts };
}

/* ------------------------------------------------------------------ *
 * Commands
 * ------------------------------------------------------------------ */
async function fetchCutoff(args) {
  const url = `${BASE}${KALSHI_PATHS.historicalCutoff}`;
  const res = await getJson(url, { timeoutMs: args.timeoutMs });
  if (!res.ok) {
    console.error(`✗ GET ${url} failed: ${res.error}`);
    return 1;
  }
  console.log(JSON.stringify({ url, response: res.json }, null, 2));
  return 0;
}

function verifyStore(tickers) {
  const rows = [];
  for (const ticker of tickers) {
    const store = readStore(ticker);
    if (!store) {
      rows.push({ ticker, bars: 0, status: 'NO_STORE' });
      continue;
    }
    const bars = store.candlesticks || [];
    const gaps = [];
    for (let i = 1; i < bars.length; i++) {
      const delta = Number(bars[i].end_period_ts) - Number(bars[i - 1].end_period_ts);
      if (delta !== DAY) gaps.push({ from: bars[i - 1].end_period_ts, to: bars[i].end_period_ts, deltaSeconds: delta });
    }
    const noTrade = bars.filter((b) => !b.price || b.price.close_dollars === undefined).length;
    rows.push({
      ticker,
      series: store.series_ticker,
      bars: bars.length,
      first: bars[0] ? new Date(bars[0].end_period_ts * 1000).toISOString() : null,
      last: bars.length ? new Date(bars[bars.length - 1].end_period_ts * 1000).toISOString() : null,
      noTradePeriods: noTrade,
      gapCount: gaps.length,
      gaps: gaps.slice(0, 5),
      books: store.books ? store.books.length : 0
    });
  }
  console.log(JSON.stringify({ verifiedAt: new Date().toISOString(), markets: rows }, null, 2));
  return 0;
}

/**
 * Expand a series into its open markets, keeping only markets with real traded
 * volume. A prediction-market series routinely lists dozens of strikes that have
 * never traded (verified: KXINXY-27DEC31H1600-T4600 has volume_fp 0.00); ingesting
 * those would add empty series and dilute every statistic computed from them.
 *
 * Selection is by LIFETIME CONTRACT VOLUME reported by the exchange itself —
 * not by any preference of ours — and every rejected market is logged so the
 * filter is auditable.
 */
async function discoverSeriesMarkets(seriesTicker, args) {
  const url = `${BASE}${KALSHI_PATHS.markets}?series_ticker=${encodeURIComponent(seriesTicker)}&status=open&limit=200`;
  if (args.dryRun) {
    console.log(`[dry-run] would GET ${url}`);
    return [];
  }
  const res = await getJson(url, { timeoutMs: args.timeoutMs });
  if (!res.ok) {
    console.error(`✗ market discovery failed for ${seriesTicker}: ${res.error}`);
    return [];
  }
  const markets = res.json.markets || [];
  const ranked = markets
    .map((m) => ({ ticker: m.ticker, volume: marketVolume(m), liquidity: Number(m.liquidity_dollars ?? 0) || 0 }))
    .sort((a, b) => b.volume - a.volume);
  const kept = ranked.filter((r) => r.volume >= args.minVolume).slice(0, args.maxMarkets > 0 ? args.maxMarkets : ranked.length);
  console.log(
    `• discovered ${seriesTicker}: ${markets.length} open market(s), ` +
      `${kept.length} with volume ≥ ${args.minVolume} contracts` +
      (args.maxMarkets > 0 ? ` (capped at ${args.maxMarkets})` : '')
  );
  for (const r of kept) console.log(`    ✓ ${r.ticker}  volume=${r.volume} contracts, liquidity=$${r.liquidity}`);
  if (kept.length < ranked.length) {
    const dropped = ranked.slice(kept.length);
    console.log(`    ✗ ${dropped.length} market(s) below the volume floor — e.g. ${dropped.slice(0, 3).map((r) => `${r.ticker}(${r.volume})`).join(', ')}`);
  }
  return kept.map((r) => r.ticker);
}

async function ingestMarket(ticker, args) {
  const seriesTicker = deriveSeriesTicker(ticker);
  let store = readStore(ticker);
  if (!store) {
    store = seedFromRepo(ticker) || {
      ticker,
      series_ticker: seriesTicker,
      period_interval: 1440,
      source: 'live_api',
      candlesticks: [],
      books: []
    };
    if (store.candlesticks.length > 0) {
      console.log(`• ${ticker}: seeded ${store.candlesticks.length} bar(s) from the verified in-repo capture`);
    }
  }

  const last = store.candlesticks.length ? Number(store.candlesticks[store.candlesticks.length - 1].end_period_ts) : null;
  const endTs = Math.floor(Date.now() / 1000);
  const startTs = last ? last + 1 : endTs - args.days * DAY;

  if (startTs >= endTs) {
    return { ticker, series: seriesTicker, added: 0, total: store.candlesticks.length, skipped: 'store_already_current' };
  }

  const url =
    `${BASE}${KALSHI_PATHS.candlesticks(seriesTicker, ticker)}` +
    `?start_ts=${startTs}&end_ts=${endTs}&period_interval=1440`;

  if (args.dryRun) {
    console.log(`[dry-run] ${ticker}: would GET ${url} (store has ${store.candlesticks.length} bar(s), last ${last ? new Date(last * 1000).toISOString() : 'none'})`);
    return { ticker, series: seriesTicker, added: 0, total: store.candlesticks.length, skipped: 'dry_run', url };
  }

  const res = await getJson(url, { timeoutMs: args.timeoutMs });
  if (!res.ok) {
    return { ticker, series: seriesTicker, error: res.error, url, total: store.candlesticks.length };
  }

  const fetched = res.json.candlesticks || [];
  const { bars, added, conflicts } = mergeBars(store.candlesticks, fetched);

  // Real market object for this ticker. Candlesticks alone are not enough to
  // replay a market: the engine needs price_level_structure, strike, series and
  // status, and none of those are in a bar. Captured from the official endpoint
  // and stored verbatim; a failure is recorded, never guessed.
  let marketCaptured = false;
  if (args.withMarket) {
    const marketUrl = `${BASE}${KALSHI_PATHS.market(ticker)}`;
    const marketRes = await getJson(marketUrl, { timeoutMs: args.timeoutMs });
    if (marketRes.ok && marketRes.json?.market) {
      store.market = marketRes.json.market;
      store.market_url = marketUrl;
      store.market_captured_at = new Date().toISOString();
      if (store.market.result) store.result = store.market.result;
      if (store.market.status) store.status = store.market.status;
      marketCaptured = true;
    } else {
      store.marketErrors = [
        ...(store.marketErrors || []),
        { at: new Date().toISOString(), url: marketUrl, error: marketRes.ok ? 'no market object in response' : marketRes.error }
      ];
    }
    await sleep(args.minIntervalMs);
  }

  store.candlesticks = bars;
  store.series_ticker = seriesTicker;
  store.period_interval = 1440;
  store.last_ingested_at = new Date().toISOString();
  store.last_ingest_url = url;
  store.source = store.source === 'repo_extended_capture' || store.source === 'repo_snapshot_capture'
    ? `${store.source}+live_api`
    : 'live_api';

  if (conflicts.length > 0) {
    store.conflicts = [...(store.conflicts || []), ...conflicts.map((c) => ({ detected_at: new Date().toISOString(), ...c }))];
  }

  // Optional depth capture — candlesticks carry no order book, and depth is the
  // one input the honest fill simulator cannot reconstruct from a bar.
  if (args.withBooks) {
    const bookUrl = `${BASE}${KALSHI_PATHS.orderbook(ticker)}`;
    const bookRes = await getJson(bookUrl, { timeoutMs: args.timeoutMs });
    if (bookRes.ok) {
      store.books = [
        ...(store.books || []),
        { captured_at: new Date().toISOString(), url: bookUrl, orderbook: bookRes.json.orderbook ?? bookRes.json }
      ];
      // Bound the depth log: last 400 snapshots is months of daily captures.
      if (store.books.length > 400) store.books = store.books.slice(-400);
    } else {
      store.bookErrors = [...(store.bookErrors || []), { at: new Date().toISOString(), url: bookUrl, error: bookRes.error }];
    }
    await sleep(args.minIntervalMs);
  }

  writeJson(storePath(ticker), store);
  return {
    ticker,
    series: seriesTicker,
    added,
    total: bars.length,
    conflicts: conflicts.length,
    books: (store.books || []).length,
    market: marketCaptured ? 'captured' : (args.withMarket ? 'FAILED' : 'not_requested'),
    status: store.status || null,
    result: store.result || null,
    url
  };
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
    return 0;
  }
  fs.mkdirSync(DATA_DIR, { recursive: true });

  if (args.cutoff) return fetchCutoff(args);

  let tickers = args.tickers ? [...args.tickers] : defaultUniverse();
  if (args.series) {
    for (const s of args.series) tickers.push(...(await discoverSeriesMarkets(s, args)));
    tickers = [...new Set(tickers)];
  }
  if (args.verify) return verifyStore(tickers);

  console.log(`Ingesting ${tickers.length} market(s) from ${BASE}`);
  const summary = [];
  let failures = 0;

  for (const ticker of tickers) {
    const row = await ingestMarket(ticker, args);
    summary.push(row);
    if (row.error) {
      failures += 1;
      console.error(`✗ ${ticker}: ${row.error}`);
    } else if (row.skipped) {
      console.log(`• ${ticker}: ${row.skipped} (${money(row.total)} bar(s) stored)`);
    } else {
      console.log(
        `✓ ${ticker}: +${row.added} new bar(s), ${money(row.total)} total` +
          (row.conflicts ? `, ${row.conflicts} CONFLICT(S) flagged` : '') +
          (row.books ? `, ${row.books} book snapshot(s)` : '')
      );
    }
    await sleep(args.minIntervalMs);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    apiBase: BASE,
    endpoints: {
      candlesticks: 'GET /series/{series_ticker}/markets/{ticker}/candlesticks (period_interval=1440)',
      orderbook: 'GET /markets/{ticker}/orderbook',
      cutoff: 'GET /historical/cutoff'
    },
    docs: {
      candlesticks: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
      orderbook: 'https://docs.kalshi.com/getting_started/orderbook_responses',
      historical: 'https://docs.kalshi.com/getting_started/historical_data',
      rateLimits: 'https://docs.kalshi.com/getting_started/rate_limits'
    },
    markets: summary,
    totals: {
      markets: summary.length,
      barsAdded: summary.reduce((s, r) => s + (r.added || 0), 0),
      barsStored: summary.reduce((s, r) => s + (r.total || 0), 0),
      conflicts: summary.reduce((s, r) => s + (r.conflicts || 0), 0),
      failures
    },
    integrity:
      'Bars are stored verbatim from the live API. Existing bars are never overwritten; a re-fetched bar that differs is recorded as a conflict. No gap is filled and no bar is interpolated.'
  };
  writeJson(path.join(DATA_DIR, '_manifest.json'), manifest);

  console.log(`\nBars added: ${manifest.totals.barsAdded} · stored: ${manifest.totals.barsStored} · conflicts: ${manifest.totals.conflicts} · failures: ${failures}`);
  if (failures === summary.length && summary.length > 0) {
    console.error(
      '\nEvery request failed. If this machine is the build sandbox, direct TLS to *.kalshi.com is blocked ' +
        'there (IRREGULARITIES.md #4) — run this script from a normal network, from cron, or via the ' +
        'GitHub Actions workflow in .github/workflows/daily-history.yml.'
    );
    return 1;
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code)).catch((err) => {
    console.error(`ingest-history failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}
