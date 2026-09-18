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
 *   node scripts/ingest-history.mjs --days=120             # backfill a fixed 120-day window
 *                                                          # (--days=0, the default, backfills from
 *                                                          #  the market's real open_time, capped by
 *                                                          #  --max-backfill-days=400)
 *   node scripts/ingest-history.mjs --period=60            # 60-MINUTE bars (recommended-work
 *                                                          #  item #2) stored separately under
 *                                                          #  data/history/intraday/60m/
 *   node scripts/ingest-history.mjs --period=60 --days=14  # a two-week intraday window
 *   node scripts/ingest-history.mjs --status=settled       # DISCOVER settled markets of a
 *                                                          #  series (real exchange result +
 *                                                          #  complete bar lifecycle) — the
 *                                                          #  honest way to backfill series
 *                                                          #  whose markets expire in days
 *   node scripts/ingest-history.mjs --status=all           # discover open AND settled
 *   node scripts/ingest-history.mjs --dry-run              # show what would be fetched
 *   node scripts/ingest-history.mjs --verify               # no network: audit the store
 *   node scripts/ingest-history.mjs --full-backfill        # re-read the whole history from each
 *                                                          #  market's open_time (merge is additive)
 *   node scripts/ingest-history.mjs --cutoff               # print the live retention cutoff
 *
 * THE INGEST REQUEST FILE (data/history/_ingest-request.json)
 *   Anything that must be configured without editing a workflow lives in that
 *   repo-tracked JSON file, because the automation token used by this repository
 *   is not permitted to modify workflow files:
 *     { "intraday": { "enabled": true, "period": 60, "days": 14,
 *                     "series": ["KXNASDAQ100Y"], "min_volume": 20000,
 *                     "max_markets": 6, "max_bars": 2000, "with_books": false,
 *                     "with_market": false } }
 *   When `intraday.enabled` is true, EVERY daily run also performs an intraday
 *   pass with its own settings, its own directory and its own manifest. The
 *   daily pass is never affected by it.
 *
 *   Since 2026-09-18 the file may instead carry SEVERAL intraday passes:
 *     { "intraday": { "enabled": true, "blocks": [
 *         { "period": 60, "tickers": ["KXBTCY-..."],  "max_bars": 336 },
 *         { "period": 60, "series": ["KXHIGHNY"], "status": "all",
 *           "min_volume": 1000, "max_markets": 40, "days": 0,
 *           "max_backfill_days": 60, "max_bars": 200, "with_books": true },
 *         { "period": 1,  "series": ["KXGOLD15M"], "status": "all",
 *           "min_volume": 1000, "max_markets": 8, "days": 2, "max_bars": 96 }
 *       ] } }
 *   Each block becomes its own pass with its own universe and settings, in file
 *   order; a pass with period=60 writes to intraday/60m/ and one with period=1
 *   writes to intraday/1m/. `status` per block selects the GET /markets
 *   discovery filter ('open' by default; 'settled'/'all' also ingest finalized
 *   markets so their REAL result travels with the bars).
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

import { KALSHI_ENDPOINTS, KALSHI_PATHS, RATE_LIMITS, CANDLE_PERIODS_MINUTES } from '../src/kalshi-config.js';
import { deriveSeriesTicker } from '../src/kalshi-api.js';
import { CANDLESTICKS } from '../src/verified-snapshot.js';
import { EXTENDED_SERIES, getExtendedCandlesticks } from '../src/verified-candles.js';
import { stableEqual } from '../src/json-utils.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
/** Repo-tracked settings for anything that cannot be passed by the workflow. */
const REQUEST_FILE = path.join(DATA_DIR, '_ingest-request.json');
const BASE = KALSHI_ENDPOINTS.rest.production;
const DAY = 86400;

/**
 * Where a period's bars live. Daily bars (1440) keep the historical path so
 * nothing that already reads data/history/<ticker>.json has to change; intraday
 * bars get their own tree so a finer series can never be mistaken for the daily
 * one (or merged into it).
 */
export function periodDir(period = 1440) {
  return Number(period) === 1440 ? DATA_DIR : path.join(DATA_DIR, 'intraday', `${Number(period)}m`);
}

/** How many days one HTTP window may span for a given period. */
export function windowDaysFor(period = 1440) {
  if (Number(period) === 1440) return 180;
  if (Number(period) === 60) return 30;
  return 1; // 1-minute bars: one day per request
}

/** Documented enum of period_interval values, in minutes. */
const VALID_PERIODS = CANDLE_PERIODS_MINUTES;

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */
function parseArgs(argv) {
  const args = {
    tickers: null,
    series: null,
    days: 0, // 0 = backfill from the market's real open_time (see WINDOW_DAYS)
    // Discovery status filter sent to GET /markets. 'open' keeps the historical
    // behaviour (only markets that can still trade). 'settled'/'all' exist for
    // series whose markets expire in DAYS (weather brackets, 15-minute gold):
    // a settled market is the only one that carries the exchange's REAL result
    // (status=finalized, result yes/no) and a COMPLETE bar lifecycle, which is
    // what an honest backtest of a daily-settling series needs.
    status: 'open',
    maxBackfillDays: 400,
    fullBackfill: false,
    withBooks: false,
    // Candlestick granularity in MINUTES: 1440 daily (default), 60 hourly, 1 minute.
    // Documented enum (verified): period_interval ∈ {1, 60, 1440}.
    //   https://docs.kalshi.com/api-reference/market/get-market-candlesticks
    period: 1440,
    // Keep only the newest N bars per market (0 = keep everything). Intraday
    // storage would otherwise grow without bound; trimming is EXPLICIT and
    // recorded in the store (never a silent rewrite — see trimStore()).
    maxBars: 0,
    // Read data/history/_ingest-request.json for settings the workflow cannot pass.
    request: true,
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
    else if (k === 'status') args.status = String(v).toLowerCase();
    else if (k === 'days') args.days = Number(v);
    else if (k === 'max-backfill-days') args.maxBackfillDays = Number(v);
    else if (k === 'full-backfill') args.fullBackfill = v !== 'false';
    else if (k === 'min-volume') args.minVolume = Number(v);
    else if (k === 'max-markets') args.maxMarkets = Number(v);
    else if (k === 'period' || k === 'period-interval') args.period = Number(v);
    else if (k === 'max-bars') args.maxBars = Number(v);
    else if (k === 'trim-only') args.trimOnly = v !== 'false';
    else if (k === 'request') args.request = v !== 'false';
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

/**
 * Read data/history/_ingest-request.json — the repo-tracked place to configure
 * runs the workflow cannot describe on its own (the automation token may not
 * edit .github/workflows/*). Returns {} when the file is absent or disabled.
 */
export function readIngestRequest(file = REQUEST_FILE) {
  if (!fs.existsSync(file)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (err) {
    throw new Error(`Unreadable ingest request ${file}: ${err.message} — refusing to guess its contents`);
  }
}

/**
 * Turn the request file's intraday block into ingest arguments.
 * Returns null when nothing was requested or `enabled` is false.
 */
/**
 * Translate ONE intraday block from data/history/_ingest-request.json into the
 * args of a single intraday pass.
 *
 * A block may be the legacy `intraday: {...}` object or an item of the newer
 * `intraday.blocks: [...]` array (2026-09-18), which allows several intraday
 * passes with different periods AND different universes — e.g. 60-minute bars
 * of the index/BTC strikes, 60-minute bars of settled weather brackets, and
 * 1-minute bars of 15-minute gold markets, each with its own volume floor and
 * bar cap. Every field of a block is optional except `period`.
 *
 * IMPORTANT: the daily pass and an intraday pass must not fight over the same
 * universe. The workflow passes --series/--tickers for the DAILY run; if an
 * intraday block did not ask for a universe of its own, the pass would silently
 * ingest every open market of those series (observed: 117 markets x 24 bars/day
 * instead of the 6 requested). So:
 *   • block.tickers  → use exactly those;
 *   • block.series   → discover within those series only;
 *   • neither        → inherit the CLI universe ONLY when inherit_cli_universe
 *                      is explicitly true; otherwise request nothing new.
 *
 * `block.status` (default 'open') selects the GET /markets discovery filter for
 * block.series — 'settled' or 'all' are what let a short-lived series (weather
 * brackets, 15-minute gold) be ingested WITH its real exchange result.
 */
export function intradayBlockArgs(block, baseArgs = {}) {
  if (!block || typeof block !== 'object' || block.enabled === false) return null;
  const period = Number(block.period ?? 60);
  if (!VALID_PERIODS.includes(period)) {
    throw new Error(`intraday block period must be one of ${VALID_PERIODS.join(', ')} (minutes), got ${block.period}`);
  }
  const hasOwnUniverse = (Array.isArray(block.tickers) && block.tickers.length > 0) || (Array.isArray(block.series) && block.series.length > 0);
  return {
    ...baseArgs,
    period,
    status: String(block.status ?? 'open').toLowerCase(),
    days: Number(block.days ?? 14),
    maxBackfillDays: Number(block.max_backfill_days ?? Math.max(1, Number(block.days ?? 14))),
    fullBackfill: block.full_backfill === true,
    withBooks: block.with_books === true,
    withMarket: block.with_market !== false,
    maxBars: Number(block.max_bars ?? 2000),
    minVolume: Number(block.min_volume ?? 0),
    maxMarkets: Number(block.max_markets ?? 0),
    series: Array.isArray(block.series) && block.series.length ? block.series : block.inherit_cli_universe === true ? baseArgs.series : null,
    tickers: Array.isArray(block.tickers) && block.tickers.length
      ? block.tickers
      : block.inherit_cli_universe === true
        ? baseArgs.tickers
        : hasOwnUniverse
          ? null
          : baseArgs.tickers,
    // --trim-only must survive the request-file translation: it means "no network".
    trimOnly: baseArgs.trimOnly === true,
    minIntervalMs: Number(block.min_interval_ms ?? baseArgs.minIntervalMs ?? 250)
  };
}

/**
 * Every intraday pass requested by data/history/_ingest-request.json, in file
 * order. Accepted shapes (checked in this order):
 *   { intraday: { ... } }               legacy single block (one pass)
 *   { intraday: [ {...}, {...} ] }      array of blocks (several passes)
 *   { intraday: { ..., blocks: [...] } } legacy object that also carries blocks
 * Returns [] when nothing is requested.
 */
export function intradayBlocksFromRequest(request, baseArgs = {}) {
  const raw = request?.intraday;
  if (!raw || raw.enabled === false) return [];
  const blocks = Array.isArray(raw) ? raw : Array.isArray(raw.blocks) && raw.blocks.length ? raw.blocks : [raw];
  const out = [];
  for (const b of blocks) {
    const args = intradayBlockArgs(b, baseArgs);
    if (args) out.push(args);
  }
  return out;
}

/** Backwards-compatible single-block accessor (the first requested pass). */
export function intradayArgsFromRequest(request, baseArgs = {}) {
  const blocks = intradayBlocksFromRequest(request, baseArgs);
  return blocks.length ? blocks[0] : null;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const money = (n) => Number(n || 0).toLocaleString('en-US');

/* ------------------------------------------------------------------ *
 * Store I/O
 * ------------------------------------------------------------------ */
function storePath(ticker, period = 1440) {
  return path.join(periodDir(period), `${ticker.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
}

function readStore(ticker, period = 1440) {
  const p = storePath(ticker, period);
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    throw new Error(`Corrupt history store ${p}: ${err.message} — refusing to guess its contents`);
  }
}

/**
 * Bound a store's size by dropping the OLDEST bars — and record exactly what was
 * dropped. A silent truncation would be indistinguishable from history that never
 * existed, so the store carries a `trims[]` ledger with the count, the timestamp
 * range and the time it happened.
 */
export function trimStore(store, maxBars) {
  const bars = store.candlesticks || [];
  if (!maxBars || bars.length <= maxBars) return { store, trimmed: 0 };
  const dropped = bars.slice(0, bars.length - maxBars);
  const kept = bars.slice(bars.length - maxBars);
  const record = {
    at: new Date().toISOString(),
    dropped: dropped.length,
    dropped_from_ts: dropped[0]?.end_period_ts ?? null,
    dropped_to_ts: dropped[dropped.length - 1]?.end_period_ts ?? null,
    kept: kept.length,
    reason: `--max-bars=${maxBars}: the store keeps the newest ${maxBars} bar(s) so an intraday series cannot grow without bound. Oldest bars are dropped and recorded here, never silently.`
  };
  return { store: { ...store, candlesticks: kept, trims: [...(store.trims || []), record] }, trimmed: dropped.length };
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
    const expected = Number(store.period_interval || 1440) * 60;
    const gaps = [];
    for (let i = 1; i < bars.length; i++) {
      const delta = Number(bars[i].end_period_ts) - Number(bars[i - 1].end_period_ts);
      if (delta !== expected) gaps.push({ from: bars[i - 1].end_period_ts, to: bars[i].end_period_ts, deltaSeconds: delta });
    }
    const noTrade = bars.filter((b) => !b.price || b.price.close_dollars === undefined).length;
    rows.push({
      ticker,
      series: store.series_ticker,
      period_interval: store.period_interval || 1440,
      bars: bars.length,
      first: bars[0] ? new Date(bars[0].end_period_ts * 1000).toISOString() : null,
      last: bars.length ? new Date(bars[bars.length - 1].end_period_ts * 1000).toISOString() : null,
      noTradePeriods: noTrade,
      gapCount: gaps.length,
      gaps: gaps.slice(0, 5),
      books: store.books ? store.books.length : 0,
      trims: store.trims ? store.trims.length : 0
    });
  }
  console.log(JSON.stringify({ verifiedAt: new Date().toISOString(), markets: rows }, null, 2));
  return 0;
}

/** Same audit as verifyStore(), for every intraday period directory present. */
function verifyIntradayStores(tickers) {
  const base = path.join(DATA_DIR, 'intraday');
  const out = { verifiedAt: new Date().toISOString(), periods: {} };
  if (!fs.existsSync(base)) {
    out.note = 'No intraday store yet (data/history/intraday/ does not exist).';
    return out;
  }
  for (const dir of fs.readdirSync(base).sort()) {
    const full = path.join(base, dir);
    if (!fs.statSync(full).isDirectory()) continue;
    const period = Number(String(dir).replace(/m$/, ''));
    const rows = [];
    for (const file of fs.readdirSync(full).sort()) {
      if (!file.endsWith('.json') || file.startsWith('_')) continue;
      let store = null;
      try {
        store = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'));
      } catch (err) {
        rows.push({ file, status: 'UNREADABLE', error: err.message });
        continue;
      }
      const bars = store.candlesticks || [];
      const expected = period * 60;
      let gaps = 0;
      for (let i = 1; i < bars.length; i++) {
        if (Number(bars[i].end_period_ts) - Number(bars[i - 1].end_period_ts) !== expected) gaps += 1;
      }
      rows.push({
        ticker: store.ticker,
        bars: bars.length,
        first: bars[0] ? new Date(bars[0].end_period_ts * 1000).toISOString() : null,
        last: bars.length ? new Date(bars[bars.length - 1].end_period_ts * 1000).toISOString() : null,
        gapCount: gaps,
        noTradePeriods: bars.filter((b) => !b.price || b.price.close_dollars === undefined).length,
        trims: (store.trims || []).length
      });
    }
    out.periods[`${period}m`] = { at: full, markets: rows.length, rows };
  }
  console.log(JSON.stringify(out, null, 2));
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
 *
 * STATUS FILTER (2026-09-18): the GET /markets `status` QUERY parameter uses the
 * FILTER vocabulary {unopened, open, paused, closed, settled} — NOT the response
 * vocabulary {active, closed, determined, ...} (see src/settlement-tracker.js,
 * IRREGULARITIES.md #9). The default 'open' keeps the historical behaviour.
 * 'all' sends no status filter so a series page can rank BOTH tradable and
 * settled markets by volume; 'settled' asks the exchange for finalized ones
 * directly. Settled markets are the only source of the exchange's REAL result,
 * which is what makes a settled-market backtest honest.
 */
async function discoverSeriesMarkets(seriesTicker, args) {
  const status = String(args.status || 'open').toLowerCase();
  const VALID = ['unopened', 'open', 'paused', 'closed', 'settled', 'all'];
  if (!VALID.includes(status)) {
    throw new Error(`--status must be one of ${VALID.join(', ')} (the GET /markets filter vocabulary), got '${status}'`);
  }
  const url =
    `${BASE}${KALSHI_PATHS.markets}?series_ticker=${encodeURIComponent(seriesTicker)}` +
    (status === 'all' ? '' : `&status=${status}`) +
    '&limit=200';
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
    .map((m) => ({ ticker: m.ticker, volume: marketVolume(m), liquidity: Number(m.liquidity_dollars ?? 0) || 0, status: m.status || null, result: m.result || null }))
    .sort((a, b) => b.volume - a.volume);
  const kept = ranked.filter((r) => r.volume >= args.minVolume).slice(0, args.maxMarkets > 0 ? args.maxMarkets : ranked.length);
  const settledKept = kept.filter((r) => r.status === 'finalized' && (r.result === 'yes' || r.result === 'no')).length;
  console.log(
    `• discovered ${seriesTicker} (status=${status}): ${markets.length} market(s), ` +
      `${kept.length} with volume ≥ ${args.minVolume} contracts` +
      (args.maxMarkets > 0 ? ` (capped at ${args.maxMarkets})` : '') +
      (settledKept > 0 ? ` — ${settledKept} already finalized with an exchange result` : '')
  );
  for (const r of kept) {
    console.log(
      `    ✓ ${r.ticker}  volume=${r.volume} contracts, liquidity=$${r.liquidity}` +
        (r.status && r.status !== 'active' ? `, status=${r.status}${r.result ? ` result=${r.result}` : ''}` : '')
    );
  }
  if (kept.length < ranked.length) {
    const dropped = ranked.slice(kept.length);
    console.log(`    ✗ ${dropped.length} market(s) below the volume floor — e.g. ${dropped.slice(0, 3).map((r) => `${r.ticker}(${r.volume})`).join(', ')}`);
  }
  return kept.map((r) => r.ticker);
}

/**
 * Backfill in bounded windows. No bar cap is documented for the candlesticks
 * endpoint, so rather than assume one we page through fixed windows and let the
 * merge de-duplicate. Verified: the previous session's 61-bar T33000 series was
 * not the API's limit — it was the start_ts that was asked for. Probing the same
 * market with a 1-day window at 2026-01-01, 2026-03-01 and 2026-05-01 each
 * returned a real bar, all of them BEFORE the /historical/cutoff date of
 * 2026-07-19 (see src/verified-history-window.js).
 */
const WINDOW_DAYS = 180;

/**
 * --trim-only: apply --max-bars to the stored series WITHOUT any network access.
 * Used to bound a store that a previous run made larger than intended; the trim
 * ledger in each store records exactly which bars were dropped and why.
 */
/** Every ticker with a store file in a period's directory (offline). */
function storeTickersIn(period) {
  const dir = periodDir(period);
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    try {
      const store = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (store && typeof store.ticker === 'string') out.push(store.ticker);
    } catch {
      console.error(`⚠ ${file}: unreadable — not trimmed, never guessed`);
    }
  }
  return out;
}

async function trimOnly(ticker, args) {
  const period = Number(args.period || 1440);
  const store = readStore(ticker, period);
  if (!store) return { ticker, period, skipped: 'no_store' };
  const before = (store.candlesticks || []).length;
  const trimmed = trimStore(store, args.maxBars);
  if (trimmed.trimmed > 0) {
    writeJson(storePath(ticker, period), trimmed.store);
    console.log(`✓ ${ticker}: trimmed ${trimmed.trimmed} oldest ${period}-minute bar(s), kept ${(trimmed.store.candlesticks || []).length} (ledger entry added)`);
  } else {
    console.log(`• ${ticker}: ${before} bar(s), nothing to trim`);
  }
  return { ticker, period, before, added: 0, total: (trimmed.store.candlesticks || []).length, trimmed: trimmed.trimmed || 0, kept: (trimmed.store.candlesticks || []).length };
}

async function ingestMarket(ticker, args) {
  const period = Number(args.period || 1440);
  const windowDays = windowDaysFor(period);
  const seriesTicker = deriveSeriesTicker(ticker);
  let store = readStore(ticker, period);
  if (!store) {
    // The in-repo captures are DAILY bars. Seeding an intraday store from them
    // would silently put 1440-minute bars into a 60-minute series, so seeding is
    // only ever done for the daily period.
    const seeded = period === 1440 ? seedFromRepo(ticker) : null;
    store =
      seeded || {
        ticker,
        series_ticker: seriesTicker,
        period_interval: period,
        source: 'live_api',
        candlesticks: [],
        books: []
      };
    if (store.candlesticks.length > 0) {
      console.log(`• ${ticker}: seeded ${store.candlesticks.length} bar(s) from the verified in-repo capture`);
    }
  }
  if (Number(store.period_interval || period) !== period) {
    throw new Error(
      `${ticker}: ${storePath(ticker, period)} holds period_interval=${store.period_interval} but this run is period=${period}. ` +
        'Refusing to mix two granularities in one file — pass --max-bars/--period to the matching store or move the file.'
    );
  }

  // Real market object FIRST: candlesticks alone cannot be replayed (the engine
  // needs price_level_structure, strike, series and status), and the market's
  // open_time is what a full backfill starts from.
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

  const last = store.candlesticks.length ? Number(store.candlesticks[store.candlesticks.length - 1].end_period_ts) : null;
  const endTs = Math.floor(Date.now() / 1000);
  const openTs = store.market?.open_time ? Math.floor(new Date(store.market.open_time).getTime() / 1000) : null;
  const capTs = endTs - args.maxBackfillDays * DAY;
  // Backfill start: newest stored bar + 1 (incremental), else the market's real
  // open time, else args.days, else the cap.
  let startTs;
  if (last && !args.fullBackfill) startTs = last + 1;
  else if (args.days > 0) startTs = endTs - args.days * DAY;
  else if (openTs) startTs = Math.max(openTs - DAY, capTs);
  else startTs = capTs;

  if (args.fullBackfill && last) {
    console.log(`• ${ticker}: --full-backfill — re-reading from ${new Date(startTs * 1000).toISOString()} (store keeps its ${store.candlesticks.length} bar(s); the merge never overwrites one)`);
  }

  if (startTs >= endTs) {
    return { ticker, series: seriesTicker, added: 0, total: store.candlesticks.length, skipped: 'store_already_current', market: marketCaptured ? 'captured' : (args.withMarket ? 'FAILED' : 'not_requested') };
  }

  const windows = [];
  for (let w = startTs; w < endTs; w += windowDays * DAY) {
    windows.push([w, Math.min(w + windowDays * DAY - 1, endTs)]);
  }

  if (args.dryRun) {
    console.log(
      `[dry-run] ${ticker}: would GET ${windows.length} window(s) of ${period}-minute bars from ` +
        `${new Date(startTs * 1000).toISOString()} (store has ${store.candlesticks.length} bar(s)` +
        `${openTs ? `, market opened ${new Date(openTs * 1000).toISOString()}` : ''})`
    );
    for (const [a, b] of windows) {
      console.log(`    ${`${BASE}${KALSHI_PATHS.candlesticks(seriesTicker, ticker)}`}?start_ts=${a}&end_ts=${b}&period_interval=${period}`);
    }
    return { ticker, series: seriesTicker, period, added: 0, total: store.candlesticks.length, skipped: 'dry_run', windows: windows.length };
  }

  let added = 0;
  let conflicts = [];
  let bars = store.candlesticks;
  let firstError = null;
  let lastUrl = null;

  for (const [a, b] of windows) {
    const url =
      `${BASE}${KALSHI_PATHS.candlesticks(seriesTicker, ticker)}` +
      `?start_ts=${a}&end_ts=${b}&period_interval=${period}`;
    lastUrl = url;
    const res = await getJson(url, { timeoutMs: args.timeoutMs });
    if (!res.ok) {
      firstError = res.error;
      store.fetchErrors = [...(store.fetchErrors || []), { at: new Date().toISOString(), url, error: res.error }];
      await sleep(args.minIntervalMs);
      continue;
    }
    const merge = mergeBars(bars, res.json.candlesticks || []);
    bars = merge.bars;
    added += merge.added;
    conflicts = conflicts.concat(merge.conflicts);
    await sleep(args.minIntervalMs);
  }

  if (conflicts.length > 0) {
    store.conflicts = [...(store.conflicts || []), ...conflicts.map((c) => ({ detected_at: new Date().toISOString(), ...c }))];
  }

  if (firstError && added === 0 && store.candlesticks.length === 0) {
    return { ticker, series: seriesTicker, error: firstError, url: lastUrl, total: store.candlesticks.length, market: marketCaptured ? 'captured' : 'FAILED' };
  }

  store.candlesticks = bars;
  store.series_ticker = seriesTicker;
  store.period_interval = period;
  store.last_ingested_at = new Date().toISOString();
  store.last_ingest_url = lastUrl;
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

  const trimmed = trimStore(store, args.maxBars);
  store = trimmed.store;
  if (trimmed.trimmed > 0) {
    console.log(`  ⚠ ${ticker}: trimmed ${trimmed.trimmed} oldest ${period}-minute bar(s) to honour --max-bars=${args.maxBars} (recorded in store.trims)`);
  }
  writeJson(storePath(ticker, period), store);
  return {
    ticker,
    series: seriesTicker,
    period,
    added,
    total: bars.length,
    kept: (store.candlesticks || []).length,
    trimmed: trimmed.trimmed || 0,
    conflicts: conflicts.length,
    books: (store.books || []).length,
    market: marketCaptured ? 'captured' : (args.withMarket ? 'FAILED' : 'not_requested'),
    status: store.status || null,
    result: store.result || null,
    windows: windows.length,
    error: firstError || null,
    url: lastUrl
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

  const request = args.request ? readIngestRequest() : {};

  let tickers = args.tickers ? [...args.tickers] : defaultUniverse();
  if (args.series) {
    for (const s of args.series) tickers.push(...(await discoverSeriesMarkets(s, args)));
    tickers = [...new Set(tickers)];
  }
  if (args.verify) {
    const code = verifyStore(tickers);
    verifyIntradayStores(tickers);
    return code;
  }

  if (args.trimOnly) {
    // Offline: bound the requested period's whole store and stop. No HTTP at all.
    const inStore = storeTickersIn(args.period);
    console.log(`Trimming ${inStore.length} stored ${args.period}-minute series to --max-bars=${args.maxBars} (no network)`);
    return runPass(inStore, { ...args, trimOnly: true });
  }

  const dailyCode = await runPass(tickers, args);
  if (dailyCode !== 0) return dailyCode;

  // ---------------------------------------------------------------------
  // INTRADAY PASS(ES) (recommended-work items #2 and #4)
  //   Configured in data/history/_ingest-request.json because the automation
  //   token may not edit .github/workflows/*. Runs AFTER the daily pass, writes
  //   to data/history/intraday/<period>m/, and can never touch daily bars.
  //   Since 2026-09-18 the request file may list SEVERAL blocks — e.g. a
  //   60-minute pass for the index/BTC strikes, a 60-minute pass that backfills
  //   SETTLED weather brackets with their real exchange results, and a
  //   1-minute pass for 15-minute gold markets — each with its own universe,
  //   volume floor and bar cap.
  // ---------------------------------------------------------------------
  const intradayBlocks = intradayBlocksFromRequest(request, args);
  for (const intraday of intradayBlocks) {
    console.log(
      `\n— Intraday pass requested by data/history/_ingest-request.json: ${intraday.period}-minute bars, ` +
        `${intraday.days} day(s), max ${intraday.maxBars} bar(s)/market, discovery status=${intraday.status} —`
    );
    let iTickers = intraday.tickers ? [...intraday.tickers] : args.tickers ? [...args.tickers] : [];
    if (intraday.series) {
      for (const s of intraday.series) iTickers.push(...(await discoverSeriesMarkets(s, intraday)));
    }
    if (iTickers.length === 0) iTickers = tickers;
    iTickers = [...new Set(iTickers)];
    const code = await runPass(iTickers, intraday);
    if (code !== 0) return code;
  }
  return 0;
}

/** One ingest pass (one period_interval) with its own directory and manifest. */
async function runPass(tickers, args) {
  const period = Number(args.period || 1440);
  if (Array.isArray(tickers) && tickers.length === 0 && !args.trimOnly) {
    console.log('\n(no markets requested for this pass — nothing to do)');
    return 0;
  }
  const dir = periodDir(period);
  fs.mkdirSync(dir, { recursive: true });
  console.log(
    `\n=== ${period === 1440 ? 'DAILY' : `${period}-MINUTE`} ${args.trimOnly ? 'TRIM (offline)' : 'PASS'} — ` +
      `${tickers.length} market(s) ${args.trimOnly ? '' : `from ${BASE} `}→ ${path.relative(ROOT, dir)}/ ===`
  );
  const summary = [];
  let failures = 0;

  for (const ticker of tickers) {
    const row = args.trimOnly ? await trimOnly(ticker, args) : await ingestMarket(ticker, args);
    summary.push(row);
    if (row.error && !row.added) {
      failures += 1;
      console.error(`✗ ${ticker}: ${row.error}`);
    } else if (row.error && row.added) {
      // Some windows succeeded and some did not: say so, do not hide it.
      failures += 0;
      console.error(`⚠ ${ticker}: +${row.added} bar(s) stored, but ${row.error} (see store.fetchErrors)`);
    } else if (row.skipped) {
      console.log(`• ${ticker}: ${row.skipped} (${money(row.total ?? row.before ?? 0)} bar(s) stored)`);
    } else {
      console.log(
        `✓ ${ticker}: +${row.added} new bar(s), ${money(row.total)} total` +
          (row.trimmed ? `, ${money(row.trimmed)} oldest trimmed` : '') +
          (row.conflicts ? `, ${row.conflicts} CONFLICT(S) flagged` : '') +
          (row.books ? `, ${row.books} book snapshot(s)` : '')
      );
    }
    await sleep(args.minIntervalMs);
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    apiBase: BASE,
    periodIntervalMinutes: period,
    storeDir: path.relative(ROOT, dir),
    endpoints: {
      candlesticks: `GET /series/{series_ticker}/markets/{ticker}/candlesticks (period_interval=${period})`,
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
      barsKept: summary.reduce((s, r) => s + (r.kept ?? r.total ?? 0), 0),
      barsTrimmed: summary.reduce((s, r) => s + (r.trimmed || 0), 0),
      conflicts: summary.reduce((s, r) => s + (r.conflicts || 0), 0),
      failures
    },
    integrity:
      'Bars are stored verbatim from the live API. Existing bars are never overwritten; a re-fetched bar that differs is recorded as a conflict. No gap is filled and no bar is interpolated. Trimming (--max-bars) drops the OLDEST bars and writes a ledger entry in store.trims.'
  };
  writeJson(path.join(dir, '_manifest.json'), manifest);

  console.log(
    `\n${period === 1440 ? 'Daily' : `${period}-minute`} bars added: ${manifest.totals.barsAdded} · stored: ${manifest.totals.barsStored} · ` +
      `conflicts: ${manifest.totals.conflicts} · failures: ${failures}`
  );
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
