#!/usr/bin/env node
/**
 * KalshiPaperSim — Live store verification (store vs the official API, field by field)
 * =====================================================================
 * WHY THIS EXISTS
 *   Every number this project computes comes from bars in data/history/. Those
 *   bars were fetched once, by a bot, and stored. A stored bar is a CLAIM about
 *   what the exchange said. This script re-asks the exchange and compares.
 *
 * WHAT IT DOES
 *   1. Reads the stored series (daily: data/history/*.json, intraday:
 *      data/history/intraday/<period>m/*.json).
 *   2. Picks markets and date windows DETERMINISTICALLY (seeded by --seed, default
 *      the date), so a run is reproducible and a later run can re-check the same
 *      windows.
 *   3. Re-fetches each window from the official endpoint
 *        GET /series/{series_ticker}/markets/{ticker}/candlesticks
 *            ?start_ts=&end_ts=&period_interval=
 *      https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *   4. Compares every overlapping bar with stableEqual() — a DEEP comparison.
 *      JSON.stringify with a key array would silently skip every nested price
 *      object (Irregularity #20), so it is not used here.
 *   5. Classifies each window: MATCH / MISMATCH / MISSING_IN_API / NOT_YET_STORED
 *      and writes data/reports/store-verification.json with the exact URLs.
 *
 * EXIT CODE
 *   0  every compared bar matched (bars the store lacks because they are newer
 *      are reported as NOT_YET_STORED and do not fail the run)
 *   1  at least one bar disagreed, or the API omitted a stored bar
 *
 * USAGE
 *   node scripts/verify-store-live.mjs                  # 5 markets, 2 windows each, daily
 *   node scripts/verify-store-live.mjs --all            # every stored market
 *   node scripts/verify-store-live.mjs --period=60      # verify the intraday store
 *   node scripts/verify-store-live.mjs --seed=20260917  # pin the sample
 *
 * NOTE: this script needs network access to *.kalshi.com. It cannot run inside
 * the build sandbox (TLS is blocked there — IRREGULARITIES.md #4); the GitHub
 * Actions workflow runs it on a runner with unrestricted egress.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { KALSHI_ENDPOINTS, KALSHI_PATHS } from '../src/kalshi-config.js';
import { deriveSeriesTicker } from '../src/kalshi-api.js';
import { stableEqual } from '../src/json-utils.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
const OUT_FILE = path.join(ROOT, 'data', 'reports', 'store-verification.json');
const BASE = KALSHI_ENDPOINTS.rest.production;
const DAY = 86400;

function parseArgs(argv) {
  const args = { markets: 5, windows: 2, period: 1440, seed: null, all: false, timeoutMs: 20000, minIntervalMs: 250, barsPerWindow: 60 };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'markets') args.markets = Number(v);
    else if (k === 'windows') args.windows = Number(v);
    else if (k === 'period') args.period = Number(v);
    else if (k === 'seed') args.seed = Number(v);
    else if (k === 'all') args.all = v !== 'false';
    else if (k === 'bars-per-window') args.barsPerWindow = Number(v);
    else if (k === 'timeout-ms') args.timeoutMs = Number(v);
    else if (k === 'min-interval-ms') args.minIntervalMs = Number(v);
  }
  return args;
}

/** mulberry32 — the same deterministic PRNG the engine uses, so samples repeat. */
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function storeDir(period) {
  return Number(period) === 1440 ? DATA_DIR : path.join(DATA_DIR, 'intraday', `${Number(period)}m`);
}

function loadStores(period) {
  const dir = storeDir(period);
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    const full = path.join(dir, file);
    try {
      const store = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (!store || typeof store.ticker !== 'string') continue;
      const bars = (store.candlesticks || []).slice().sort((a, b) => Number(a.end_period_ts) - Number(b.end_period_ts));
      if (bars.length === 0) continue;
      out.push({ file: path.relative(ROOT, full), ticker: store.ticker, series: store.series_ticker || deriveSeriesTicker(store.ticker), bars, period_interval: store.period_interval || period });
    } catch (err) {
      out.push({ file: path.relative(ROOT, full), ticker: null, error: `unreadable: ${err.message}`, bars: [] });
    }
  }
  return out;
}

async function getJson(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { ok: false, status: res.status, error: `http_${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true, status: res.status, json: await res.json() };
  } catch (err) {
    clearTimeout(timer);
    return { ok: false, status: 0, error: String(err && err.message ? err.message : err) };
  }
}

/** Deterministic, non-overlapping windows of stored bars. */
function pickWindows(bars, count, barsPerWindow) {
  const windows = [];
  const span = Math.max(1, Math.min(barsPerWindow, bars.length));
  if (bars.length <= span) return [[0, bars.length - 1]];
  const stride = Math.max(1, Math.floor((bars.length - span) / Math.max(1, count)));
  for (let i = 0; i < count; i++) {
    const start = Math.min(bars.length - span, i * stride);
    windows.push([start, start + span - 1]);
  }
  return windows;
}

async function verifyWindow(store, from, to, args) {
  const bars = store.bars.slice(from, to + 1);
  const startTs = Number(bars[0].end_period_ts);
  const endTs = Number(bars[bars.length - 1].end_period_ts) + 1;
  const url = `${BASE}${KALSHI_PATHS.candlesticks(store.series, store.ticker)}?start_ts=${startTs}&end_ts=${endTs}&period_interval=${store.period_interval}`;
  const res = await getJson(url, args.timeoutMs);
  if (!res.ok) return { url, from: startTs, to: endTs, status: 'REQUEST_FAILED', error: res.error, compared: 0 };
  const returned = new Map((res.json.candlesticks || []).map((b) => [Number(b.end_period_ts), b]));
  const mismatches = [];
  let matched = 0;
  for (const bar of bars) {
    const ts = Number(bar.end_period_ts);
    const live = returned.get(ts);
    if (!live) {
      mismatches.push({ end_period_ts: ts, kind: 'MISSING_IN_API', stored: bar });
      continue;
    }
    if (!stableEqual(bar, live)) {
      mismatches.push({ end_period_ts: ts, kind: 'FIELD_MISMATCH', stored: bar, live });
    } else {
      matched += 1;
    }
  }
  const storedTs = new Set(bars.map((b) => Number(b.end_period_ts)));
  const notYetStored = [...returned.keys()].filter((ts) => !storedTs.has(ts));
  return {
    url,
    from: startTs,
    to: endTs,
    firstBar: new Date(startTs * 1000).toISOString(),
    lastBar: new Date(Number(bars[bars.length - 1].end_period_ts) * 1000).toISOString(),
    status: mismatches.length ? 'MISMATCH' : 'MATCH',
    compared: bars.length,
    matched,
    returnedByApi: returned.size,
    notYetStored: notYetStored.length,
    mismatches: mismatches.slice(0, 10)
  };
}

async function main() {
  const args = parseArgs(process.argv);
  const seed = args.seed ?? Number(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const rng = mulberry32(seed);

  const stores = loadStores(args.period).filter((s) => s.bars.length > 0);
  if (stores.length === 0) {
    console.error(`No stored bars found for period ${args.period} (looked in ${path.relative(ROOT, storeDir(args.period))}/).`);
    return 1;
  }
  // Deterministic market sample: seeded shuffle, then take N.
  const shuffled = stores.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selected = args.all ? shuffled : shuffled.slice(0, Math.min(args.markets, shuffled.length));

  console.log(`Verifying ${selected.length}/${stores.length} stored ${args.period}-minute market(s) against ${BASE}`);
  console.log(`seed=${seed} windows/market=${args.windows} bars/window=${args.barsPerWindow}\n`);

  const results = [];
  let mismatchedWindows = 0;
  let comparedBars = 0;
  let matchedBars = 0;

  for (const store of selected) {
    const windows = pickWindows(store.bars, args.windows, args.barsPerWindow);
    for (const [from, to] of windows) {
      const row = await verifyWindow(store, from, to, args);
      row.ticker = store.ticker;
      row.storeFile = store.file;
      results.push(row);
      comparedBars += row.compared || 0;
      matchedBars += row.matched || 0;
      if (row.status !== 'MATCH') mismatchedWindows += 1;
      const icon = row.status === 'MATCH' ? '✓' : row.status === 'REQUEST_FAILED' ? '✗' : '⚠';
      console.log(
        `${icon} ${store.ticker} ${row.firstBar?.slice(0, 10)} → ${row.lastBar?.slice(0, 10)}: ` +
          `${row.status} (${row.matched}/${row.compared} bars identical` +
          (row.notYetStored ? `, ${row.notYetStored} bar(s) newer than the store` : '') +
          (row.error ? `, ${row.error}` : '') + ')'
      );
      for (const m of row.mismatches || []) {
        console.log(`    ${m.kind} @ ${m.end_period_ts} (${new Date(m.end_period_ts * 1000).toISOString()})`);
        if (m.live) console.log(`      stored: ${JSON.stringify(m.stored)}\n      live:   ${JSON.stringify(m.live)}`);
      }
      await sleep(args.minIntervalMs);
    }
  }

  const report = {
    verifiedAt: new Date().toISOString(),
    endpoint: `${BASE}${KALSHI_PATHS.candlesticks('{series_ticker}', '{ticker}')}?start_ts=&end_ts=&period_interval=`,
    docs: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
    periodIntervalMinutes: args.period,
    seed,
    marketsStored: stores.length,
    marketsVerified: selected.length,
    windows: results.length,
    windowsMismatched: mismatchedWindows,
    barsCompared: comparedBars,
    barsIdentical: matchedBars,
    verdict: mismatchedWindows === 0
      ? 'Every stored bar re-fetched from the official API matched FIELD-FOR-FIELD.'
      : `${mismatchedWindows} window(s) did not match. See results[].mismatches for the stored and live values — nothing is averaged or ignored.`,
    integrity:
      'Deep comparison via stableEqual(). A stored bar that disagrees with the live API is reported, never silently rewritten; the ingest job keeps the stored bar and records a CONFLICT.',
    results
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, `${JSON.stringify(report, null, 2)}\n`);

  console.log(
    `\n${matchedBars}/${comparedBars} bars identical across ${results.length} window(s) · ` +
      `${mismatchedWindows} window(s) not matching → ${path.relative(ROOT, OUT_FILE)}`
  );
  return mismatchedWindows === 0 ? 0 : 1;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code)).catch((err) => {
    console.error(`verify-store-live failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}
