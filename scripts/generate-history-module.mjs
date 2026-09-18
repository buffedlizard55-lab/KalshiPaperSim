#!/usr/bin/env node
/**
 * KalshiPaperSim — Accumulated-history → browser-safe ES module
 * =====================================================================
 * Recommended-work item #3: make the accumulated store usable by the replay.
 *
 * `scripts/ingest-history.mjs` grows `data/history/*.json` one day at a time
 * from the official Kalshi API. Node can read those files directly, but the
 * GitHub Pages build runs in a browser with no filesystem, and `fetch()` of a
 * relative path breaks anyone who opens `docs/index.html` from disk.
 *
 * So this script compiles the store into `src/accumulated-history.js` — a
 * dependency-free ES module that both environments import synchronously. That
 * keeps `runCompetition()` synchronous (and therefore keeps the server, the
 * tests, the sensitivity sweep and the static build computing from exactly the
 * same inputs).
 *
 * RULES
 *   • Bars are copied VERBATIM from the store. No rounding, no re-ordering, no
 *     de-duplication beyond a stable sort by end_period_ts.
 *   • Order-book snapshots are NOT copied. They are large and only the Node
 *     server uses them; they stay in data/history/.
 *   • When there is no store, a module that reports `present: false` is still
 *     written, so an import can never fail.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
const OUT_FILE = path.join(ROOT, 'src', 'accumulated-history.js');
const MANIFEST = path.join(DATA_DIR, '_manifest.json');

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(`⚠ unreadable ${path.relative(ROOT, p)}: ${err.message} — skipped, never guessed`);
    return null;
  }
}

/**
 * Compact tuple for one bar.
 *
 * WHY: the verbatim store is ~600 bytes per bar, and a full backfill of 30
 * markets is ~7,500 bars — a 4.5 MB module is not something to ship to a
 * browser. The tuple below is ~100 bytes. Values are encoded as INTEGERS:
 * Kalshi's FixedPointDollars are always 4 decimal places and its *_fp fields
 * always 2 (verified across all 33,562 price values in the store at the time
 * this was written), so `1300` means "0.1300" and `16331988` means "163319.88".
 * The encoder ASSERTS those decimal counts and refuses to write a file if any
 * value deviates, so an unexpected precision can never be silently rounded.
 *
 * Layout: [ end_period_ts, open_interest_fp, volume_fp,
 *           price[open, high, low, close, mean, previous],
 *           yes_bid[open, high, low, close],
 *           yes_ask[open, high, low, close] ]
 * A price that the exchange did not report (a no-trade period returns only
 * previous_dollars, verified in data/history/) is stored as null and omitted
 * again on expansion, so the round trip is lossless.
 *
 * `expandAccumulatedBar()` is the inverse, and every market also ships a
 * `verbatim_sample_bar`: one bar kept character-for-character as the API sent
 * it. test/simulation.test.js asserts tuple → expand reproduces that sample
 * exactly, so a compaction bug shows up as a test failure rather than as a
 * silently altered price. Belt and braces: if a round trip ever did alter a
 * bar, the merge rule in src/history-merge.js would reject the stored series
 * and fall back to the in-repo capture.
 */
/** Fail the whole build rather than silently round a value we did not expect. */
function assertDecimals(value, places, where) {
  const s = String(value);
  const dot = s.indexOf('.');
  const seen = dot === -1 ? 0 : s.length - dot - 1;
  if (seen !== places) {
    throw new Error(
      `${where}: expected ${places} decimal place(s) but got ${seen} in "${s}". ` +
        'The compact encoder refuses to guess — fix the encoder or keep this field as a string.'
    );
  }
  return Math.round(Number(s) * 10 ** places);
}

function barToTuple(b) {
  const where = `bar end_period_ts=${b.end_period_ts}`;
  const enc = (v, places, field) => (v === undefined || v === null ? null : assertDecimals(v, places, `${where} ${field}`));
  const p = b.price || {};
  const bid = b.yes_bid || {};
  const ask = b.yes_ask || {};
  const six = (o, side) => [
    enc(o.open_dollars, 4, `${side}.open_dollars`),
    enc(o.high_dollars, 4, `${side}.high_dollars`),
    enc(o.low_dollars, 4, `${side}.low_dollars`),
    enc(o.close_dollars, 4, `${side}.close_dollars`),
    enc(o.mean_dollars, 4, `${side}.mean_dollars`),
    enc(o.previous_dollars, 4, `${side}.previous_dollars`)
  ];
  const four = (o, side) => [
    enc(o.open_dollars, 4, `${side}.open_dollars`),
    enc(o.high_dollars, 4, `${side}.high_dollars`),
    enc(o.low_dollars, 4, `${side}.low_dollars`),
    enc(o.close_dollars, 4, `${side}.close_dollars`)
  ];
  return [
    Number(b.end_period_ts),
    enc(b.open_interest_fp, 2, 'open_interest_fp'),
    enc(b.volume_fp, 2, 'volume_fp'),
    six(p, 'price'),
    four(bid, 'yes_bid'),
    four(ask, 'yes_ask')
  ];
}

function buildMarkets(dir = DATA_DIR, { maxBars = 0 } = {}) {
  if (!fs.existsSync(dir)) return { markets: {}, files: 0 };
  const markets = {};
  let files = 0;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    const store = readJsonSafe(path.join(dir, file));
    if (!store || typeof store.ticker !== 'string') continue;
    const allBars = Array.isArray(store.candlesticks) ? store.candlesticks.slice() : [];
    allBars.sort((a, b) => Number(a.end_period_ts) - Number(b.end_period_ts));
    // An explicit browser cap (intraday only) keeps the shipped module small. It
    // drops the OLDEST bars and says so: bars_in_store and browser_bar_cap record
    // exactly how many exist and how many are shipped, so a truncated module can
    // never be mistaken for a complete series. The Node server and the tests read
    // the full store from data/history/, where nothing is capped.
    const bars = maxBars > 0 && allBars.length > maxBars ? allBars.slice(allBars.length - maxBars) : allBars;
    const tuples = bars.map(barToTuple);
    markets[store.ticker] = {
      // One bar kept exactly as the exchange sent it — the oracle for expandAccumulatedBar().
      verbatim_sample_bar: tuples.length ? JSON.parse(JSON.stringify(bars[0])) : null,
      tuples,
      ticker: store.ticker,
      series_ticker: store.series_ticker || null,
      period_interval: store.period_interval ?? 1440,
      source: store.source || 'live_api',
      seeded_from: store.seeded_from || null,
      captured_at: store.captured_at || null,
      last_ingested_at: store.last_ingested_at || null,
      last_ingest_url: store.last_ingest_url || null,
      first_ts: bars.length ? Number(bars[0].end_period_ts) : null,
      last_ts: bars.length ? Number(bars[bars.length - 1].end_period_ts) : null,
      bar_count: bars.length,
      bars_in_store: allBars.length,
      browser_bar_cap: maxBars || null,
      truncated: bars.length < allBars.length,
      trims: Array.isArray(store.trims) ? store.trims.length : 0,
      // The real market object captured by the ingest job. Without it a market
      // that is not in the in-repo snapshot could never be replayed.
      market: store.market || null,
      market_url: store.market_url || null,
      market_captured_at: store.market_captured_at || null,
      status: store.status || store.market?.status || null,
      result: store.result || store.market?.result || null,
      conflict_count: Array.isArray(store.conflicts) ? store.conflicts.length : 0,
      conflicts: (store.conflicts || []).slice(-10),
      book_snapshots: Array.isArray(store.books) ? store.books.length : 0
    };
    files += 1;
  }
  return { markets, files };
}

/** Trailing-bar cap for the intraday module shipped to browsers (see buildMarkets). */
const MAX_BROWSER_INTRADAY_BARS = 400;

function main() {
  const { markets, files } = buildMarkets(DATA_DIR);
  const manifest = fs.existsSync(MANIFEST) ? readJsonSafe(MANIFEST) : null;
  const tickers = Object.keys(markets);
  const totalBars = tickers.reduce((s, t) => s + markets[t].bar_count, 0);

  // ------------------------------------------------------------------
  // INTRADAY (recommended-work item #2)
  //   Same tuples, same expander, one module. Bounded per market so the
  //   browser build stays a few hundred KB; the Node server reads the full
  //   store (data/history/intraday/<period>m/) with src/history-store.js.
  // ------------------------------------------------------------------
  const intradayPeriods = {};
  if (fs.existsSync(path.join(DATA_DIR, 'intraday'))) {
    for (const dir of fs.readdirSync(path.join(DATA_DIR, 'intraday')).sort()) {
      const full = path.join(DATA_DIR, 'intraday', dir);
      if (!fs.statSync(full).isDirectory()) continue;
      const period = Number(String(dir).replace(/m$/, ''));
      const built = buildMarkets(full, { maxBars: MAX_BROWSER_INTRADAY_BARS });
      const t = Object.keys(built.markets);
      const bars = t.reduce((s, k) => s + built.markets[k].bar_count, 0);
      if (t.length === 0) continue;
      intradayPeriods[String(period)] = {
        periodIntervalMinutes: period,
        storeDir: `data/history/intraday/${dir}`,
        marketCount: t.length,
        barCount: bars,
        browserBarCap: MAX_BROWSER_INTRADAY_BARS,
        markets: built.markets
      };
    }
  }
  const intradayMarketCount = Object.values(intradayPeriods).reduce((s, p) => s + p.marketCount, 0);
  const intradayBarCount = Object.values(intradayPeriods).reduce((s, p) => s + p.barCount, 0);

  const body = `/**
 * KalshiPaperSim — Accumulated Kalshi history (GENERATED — DO NOT EDIT)
 * =====================================================================
 * Generated by scripts/generate-history-module.mjs from data/history/*.json —
 * the store written by scripts/ingest-history.mjs from the official Kalshi API.
 * Run \`npm run build\` or the ingest workflow to regenerate it.
 *
 * Bars are stored as COMPACT TUPLES and expanded by expandAccumulatedBar(); every
 * price is the exact FixedPointDollars string the exchange returned — nothing is
 * parsed, rounded or interpolated. Each market also carries a
 * verbatim_sample_bar (one bar, character-for-character as received) and a test
 * asserts the expander reproduces it exactly.
 *
 * Two granularities ship here:
 *   ACCUMULATED_HISTORY  — daily bars (period_interval 1440), the competition window
 *   ACCUMULATED_INTRADAY — hourly/minute bars (period_interval 60 or 1), capped to
 *                          the newest ${MAX_BROWSER_INTRADAY_BARS} bars per market for the browser.
 *                          Each market reports bars_in_store and truncated, so a
 *                          capped module can never be mistaken for a full series;
 *                          the Node server reads the uncapped store from
 *                          data/history/intraday/<period>m/ (src/history-store.js).
 *
 * Order-book snapshots are deliberately excluded (they stay in data/history/ for
 * the Node server; they are far too large for a browser module).
 *
 * ${tickers.length} market(s) · ${totalBars} daily bar(s) · ${intradayMarketCount} intraday market(s) · ${intradayBarCount} intraday bar(s) · generated ${new Date().toISOString()}
 */

export const ACCUMULATED_HISTORY = ${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      present: tickers.length > 0,
      sourceDir: 'data/history',
      sourceFiles: files,
      marketCount: tickers.length,
      barCount: totalBars,
      manifestGeneratedAt: manifest?.generatedAt || null,
      manifestTotals: manifest?.totals || null,
      markets
    },
  )};

export const ACCUMULATED_INTRADAY = ${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      present: intradayMarketCount > 0,
      periods: intradayPeriods
    },
  )};

/**
 * The inverse of the tuple layout above. A price the exchange did not report is
 * null and is omitted from the rebuilt object, so a no-trade bar comes back with
 * the same shape it arrived in (price.previous_dollars only).
 */
export function expandAccumulatedBar(t) {
  const [ts, oi, vol, p, bid, ask] = t;
  const px = (n) => (n === null || n === undefined ? null : (n / 10000).toFixed(4));
  const fp = (n) => (n === null || n === undefined ? null : (n / 100).toFixed(2));
  const price = {};
  if (p[3] !== null) price.close_dollars = px(p[3]);
  if (p[1] !== null) price.high_dollars = px(p[1]);
  if (p[2] !== null) price.low_dollars = px(p[2]);
  if (p[4] !== null) price.mean_dollars = px(p[4]);
  if (p[0] !== null) price.open_dollars = px(p[0]);
  if (p[5] !== null) price.previous_dollars = px(p[5]);
  const side = (a) => {
    const o = {};
    if (a[0] !== null) o.open_dollars = px(a[0]);
    if (a[1] !== null) o.high_dollars = px(a[1]);
    if (a[2] !== null) o.low_dollars = px(a[2]);
    if (a[3] !== null) o.close_dollars = px(a[3]);
    return o;
  };
  return {
    end_period_ts: ts,
    open_interest_fp: fp(oi),
    price,
    volume_fp: fp(vol),
    yes_ask: side(ask),
    yes_bid: side(bid)
  };
}

/** Every bar stored for one ticker, or null when that market is not tracked. */
export function getAccumulatedBars(ticker) {
  const m = ACCUMULATED_HISTORY.markets[ticker];
  return m ? m.tuples.map(expandAccumulatedBar) : null;
}

/** The raw stored record for one ticker (bars + captured market object). */
export function getAccumulatedMarket(ticker) {
  return ACCUMULATED_HISTORY.markets[ticker] || null;
}

/** Tickers with at least \`minBars\` stored daily bars, sorted. */
export function getAccumulatedTickers(minBars = 0) {
  return Object.values(ACCUMULATED_HISTORY.markets)
    .filter((m) => m.bar_count >= minBars)
    .map((m) => m.ticker)
    .sort();
}

/* ------------------------------------------------------------------ *
 * INTRADAY ACCESSORS
 * ------------------------------------------------------------------ */

/** Periods (in minutes) that ship an intraday series, e.g. [60]. */
export function getIntradayPeriods() {
  return Object.keys(ACCUMULATED_INTRADAY.periods || {}).map(Number).sort((a, b) => a - b);
}

/** Every shipped bar for one ticker at one intraday period, or null. */
export function getIntradayBars(ticker, period = 60) {
  const p = ACCUMULATED_INTRADAY.periods?.[String(period)];
  if (!p) return null;
  const m = p.markets[ticker];
  return m ? m.tuples.map(expandAccumulatedBar) : null;
}

/** Raw shipped record (bar counts, truncation flag, source URLs). */
export function getIntradayMarket(ticker, period = 60) {
  return ACCUMULATED_INTRADAY.periods?.[String(period)]?.markets?.[ticker] || null;
}
`;

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, body);
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✓ src/accumulated-history.js — ${tickers.length} market(s), ${totalBars} bar(s), ${kb} KB`);
  for (const t of tickers) {
    const m = markets[t];
    console.log(
      `    ${t}: ${m.bar_count} bar(s)` +
        (m.market ? ' + market object' : ' (NO market object — cannot be replayed)') +
        (m.conflict_count ? `, ${m.conflict_count} CONFLICT(S)` : '')
    );
  }
  if (tickers.length === 0) console.log('    (no accumulated history yet — the replay will use the in-repo captures)');
  for (const [period, p] of Object.entries(intradayPeriods)) {
    console.log(
      `    intraday ${period}m: ${p.marketCount} market(s), ${p.barCount} shipped bar(s) ` +
        `(cap ${p.browserBarCap}/market) from ${p.storeDir}`
    );
  }
  if (Object.keys(intradayPeriods).length === 0) {
    console.log('    (no intraday store yet — enable it in data/history/_ingest-request.json)');
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`generate-history-module failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { main };
