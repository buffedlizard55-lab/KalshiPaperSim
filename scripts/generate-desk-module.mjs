#!/usr/bin/env node
/**
 * KalshiPaperSim — Live Desk data module generator
 * =====================================================================
 * Writes `src/desk-data.js`: the browser-safe, deterministic input for the
 * Live Desk (the place where paper orders are placed on REAL Kalshi OPEN
 * event contracts, at the exchange's own captured prices, sizes and dates).
 *
 * WHY A GENERATED MODULE
 *   The desk must compute identically in server mode and in the static
 *   GitHub-Pages build (docs/), exactly like the rest of this app. Reading
 *   the history JSON files at run time is fine on the server and impossible
 *   in a browser, so the same numbers are compiled into one ES module. The
 *   generator is deterministic: run it twice on the same store and the
 *   output is byte-identical except for `generatedAt`.
 *
 * WHAT IT CARRIES (and what it refuses to carry)
 *   • Every tracked market that has at least one REAL captured order-book
 *     ladder (GET /markets/{ticker}/orderbook — see data/history/*.json
 *     `books[]`), with the capture timestamp and the exact URL per ladder.
 *   • The newest captured market object per ticker (GET /markets/{ticker} or
 *     the discovery pass): real open_time / close_time / expiration_time,
 *     status, result (when finalized), settlement value, quotes, volume,
 *     open interest, price_ranges and the fee-relevant series.
 *   • The newest real quoted bars per market (yes_bid/yes_ask/trade/volume),
 *     which is what a RESTING (maker) paper order is filled against later:
 *     a maker fill requires a later real quote to cross the resting price and
 *     is capped by that period's real traded volume.
 *   • Open contracts that were discovered with real quotes but NO captured
 *     ladder, clearly marked `tradeable: false` with the reason and the exact
 *     command that captures a ladder for them. They are visible, never
 *     tradeable — an order cannot be priced without a real ladder.
 *
 *   Nothing is interpolated, re-anchored or invented. Levels are stored in
 *   integer milli-dollars (tenths of a cent — the finest grid Kalshi publishes,
 *   so a 0.1450 deci-cent price never collides with a 0.1500 cent price), with
 *   their real contract counts; the desk converts back.
 *
 * USAGE
 *   node scripts/generate-desk-module.mjs [--max-markets=200] [--max-levels=40]
 *                                         [--max-captures=12] [--max-bars=72]
 *                                         [--max-quoted=250] [--out=src/desk-data.js]
 *
 * The capture selection is deliberately time-diverse (see HORIZON_HOURS): a
 * forward test needs a real ladder captured AT its cut-off, not just today's.
 *
 * WHY THE CAPS ARE WHAT THEY ARE (2026-09-18, request 10)
 *   `--max-markets` used to be 80, which was above the 68 laddered markets the
 *   store held — so it never bound. The moment the 120 quoted-only open
 *   contracts get their ladders captured (the ingest command each one is listed
 *   with), 188 markets have real depth and a cap of 80 would silently drop 108
 *   of them from the desk. The cap is a BROWSER-PAYLOAD bound, not a honesty
 *   bound, so it is set above the whole laddered universe and `droppedForCap`
 *   is published in the module either way. Same reasoning for `--max-quoted`:
 *   the quoted-only list must never be shorter than reality without saying so,
 *   so `quotedSeen` (everything discovery really returned) is published next to
 *   `quotedWithoutLadder` (what the module carries).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HISTORY_DIR = path.join(ROOT, 'data', 'history');
const DISCOVERED_DIR = path.join(ROOT, 'data', 'discovered', 'markets');

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}
const MAX_MARKETS = Number(arg('max-markets', 200));
const MAX_LEVELS = Number(arg('max-levels', 40));
const MAX_CAPTURES = Number(arg("max-captures", 12));
const MAX_BARS = Number(arg('max-bars', 72));
const MAX_QUOTED = Number(arg('max-quoted', 250));
const OUT = path.resolve(ROOT, arg('out', 'src/desk-data.js'));

/* ------------------------------------------------------------------ *
 * Small, strict readers
 * ------------------------------------------------------------------ */

/**
 * "0.4700" -> 470 (integer MILLI-DOLLARS = tenths of a cent). Returns null for
 * anything unparseable.
 *
 * WHY MILLI-DOLLARS AND NOT CENTS: Kalshi publishes prices on several grids
 * (src/kalshi-config.js PRICE_LEVEL_STRUCTURES) — `linear_cent` steps 0.01 but
 * `deci_cent` steps 0.001. Rounding a real 0.1450 quote into integer cents
 * would collide with a real 0.1500 quote and silently merge two distinct
 * ladder levels. Storing thousandths preserves every published price exactly
 * while keeping the module small and integer-comparable.
 */
function dollarsToMills(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 1000);
}

/** "1234.56" -> 1234.56 numerics, null-safe. */
function num(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** One wire level ["0.4700","1234.00"] -> [470, 1234] (mills, contracts) or null. */
function level(raw) {
  const p = dollarsToMills(raw?.[0]);
  const c = num(raw?.[1]);
  if (p === null || c === null || c <= 0) return null;
  return [p, Number(c.toFixed(2))];
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/** Compact one captured ladder, keeping the price levels closest to the touch. */
function compactLadder(book) {
  const wire = book?.orderbook?.orderbook_fp || book?.orderbook_fp || book?.orderbook;
  if (!wire) return null;
  const side = (raw) => {
    const levels = (raw || []).map(level).filter(Boolean);
    if (!levels.length) return [];
    // Nearest the touch first: YES bids highest price first, NO bids highest
    // price first (Kalshi publishes bids on both sides).
    levels.sort((a, b) => b[0] - a[0]);
    return levels.slice(0, MAX_LEVELS);
  };
  const yes = side(wire.yes_dollars || wire.yes);
  const no = side(wire.no_dollars || wire.no);
  if (!yes.length && !no.length) return null;
  return {
    at: book.captured_at || book.capturedAt || null,
    url: book.url || null,
    yes,
    no
  };
}

/** Newest real quoted bars for one store, oldest -> newest, compacted. */
function compactBars(candlesticks, period) {
  const out = [];
  for (const c of candlesticks || []) {
    const endTs = num(c.end_period_ts);
    if (endTs === null) continue;
    out.push({
      endTs: Math.round(endTs),
      yesBid: dollarsToMills(c.yes_bid?.close_dollars),
      yesAsk: dollarsToMills(c.yes_ask?.close_dollars),
      trade: dollarsToMills(c.price?.close_dollars ?? c.price?.mean_dollars),
      volume: num(c.volume_fp),
      openInterest: num(c.open_interest_fp)
    });
  }
  out.sort((a, b) => a.endTs - b.endTs);
  return out.slice(-MAX_BARS).map((b) => ({ ...b, period }));
}

/* ------------------------------------------------------------------ *
 * Market identities
 * ------------------------------------------------------------------ */

const markets = new Map();

function ensureMarket(ticker, seriesTicker) {
  if (!markets.has(ticker)) {
    markets.set(ticker, {
      ticker,
      seriesTicker: seriesTicker || String(ticker).split('-')[0] || null,
      source: null,
      market: null,
      quotes: null,
      captures: [],
      bars: [],
      periods: []
    });
  }
  return markets.get(ticker);
}

function ingestStore(file, period) {
  const store = readJson(file);
  if (!store || !store.ticker) return false;
  const rec = ensureMarket(store.ticker, store.series_ticker);
  rec.source = rec.source || path.relative(ROOT, file);
  if (store.market) rec.market = store.market;
  rec.marketCapturedAt = store.market_captured_at || rec.marketCapturedAt || null;
  rec.marketUrl = store.market_url || rec.marketUrl || null;
  rec.status = store.status || rec.status || null;
  rec.result = store.result ?? rec.result ?? null;
  rec.lastIngestedAt = store.last_ingested_at || rec.lastIngestedAt || null;

  for (const book of store.books || []) {
    const c = compactLadder(book);
    if (c && c.at) rec.captures.push(c);
  }
  const bars = compactBars(store.candlesticks, period);
  if (bars.length) {
    rec.bars.push(...bars);
    rec.periods.push(period);
  }
  return true;
}

function walkHistory() {
  let stores = 0;
  for (const entry of fs.readdirSync(HISTORY_DIR, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.json') && !entry.name.startsWith('_')) {
      if (ingestStore(path.join(HISTORY_DIR, entry.name), 1440)) stores += 1;
    }
  }
  const intradayDir = path.join(HISTORY_DIR, 'intraday');
  if (fs.existsSync(intradayDir)) {
    for (const bucket of fs.readdirSync(intradayDir, { withFileTypes: true })) {
      if (!bucket.isDirectory()) continue;
      const period = Number(String(bucket.name).replace(/[^0-9]/g, '')) || null;
      const dir = path.join(intradayDir, bucket.name);
      for (const f of fs.readdirSync(dir)) {
        if (!f.endsWith('.json') || f.startsWith('_')) continue;
        if (ingestStore(path.join(dir, f), period || null)) stores += 1;
      }
    }
  }
  return stores;
}

/* ------------------------------------------------------------------ *
 * Quoted-but-not-depth-captured open contracts (discovery pass)
 * ------------------------------------------------------------------ */

function readQuotedUniverse() {
  const quoted = [];
  if (!fs.existsSync(DISCOVERED_DIR)) return quoted;
  const files = fs.readdirSync(DISCOVERED_DIR).filter((f) => f.endsWith('.json'));
  const asOf = new Date().toISOString();
  for (const f of files) {
    const doc = readJson(path.join(DISCOVERED_DIR, f));
    if (!doc || !Array.isArray(doc.markets)) continue;
    const prov = doc._provenance || {};
    for (const m of doc.markets) {
      if (!m || !m.ticker) continue;
      const open = m.status === 'active' || m.status === 'initialized';
      if (!open) continue;
      quoted.push({
        ticker: m.ticker,
        series: m.series_ticker || path.basename(f, '.json'),
        seriesTicker: doc.series_ticker || path.basename(f, '.json'),
        title: m.title || doc.series_title || null,
        status: m.status,
        openTime: m.open_time || null,
        closeTime: m.close_time || null,
        expirationTime: m.expiration_time || null,
        yesBid: dollarsToMills(m.yes_bid_dollars),
        yesAsk: dollarsToMills(m.yes_ask_dollars),
        noBid: dollarsToMills(m.no_bid_dollars),
        noAsk: dollarsToMills(m.no_ask_dollars),
        lastPrice: dollarsToMills(m.last_price_dollars),
        volume: num(m.volume_fp),
        volume24h: num(m.volume_24h_fp),
        openInterest: num(m.open_interest_fp),
        liquidity: num(m.liquidity_dollars),
        priceLevelStructure: m.price_level_structure || null,
        priceRanges: m.price_ranges || null,
        rulesPrimary: m.rules_primary || null,
        marketUrl: prov.url || null,
        capturedAt: prov.capturedAt || null,
        _discoveryFile: path.relative(ROOT, path.join(DISCOVERED_DIR, f)),
        _asOf: asOf
      });
    }
  }
  quoted.sort((a, b) => (b.volume || 0) - (a.volume || 0) || a.ticker.localeCompare(b.ticker));
  return quoted;
}

/* ------------------------------------------------------------------ *
 * Build
 * ------------------------------------------------------------------ */

const storeCount = walkHistory();

/**
 * WHICH LADDERS TO KEEP.
 *
 * Keeping only the newest N would make every older desk cut-off untradeable —
 * the desk would have no real ladder captured before that time and would
 * (correctly) refuse to price anything. So the selection keeps BOTH:
 *   • the newest MAX_CAPTURES ladders (the "live now" state), and
 *   • the newest ladder at or before each horizon mark (6h, 12h, 24h, 48h,
 *     96h and 10d before the newest capture), which is what a forward test
 *     needs to place an order at that cut-off and then walk forward into
 *     real quotes and real settlements.
 * A ladder without a timestamp is dropped: an undated ladder cannot be
 * verified point-in-time, so the desk will not price from it.
 */
const HORIZON_HOURS = [6, 12, 24, 48, 96, 240];
const newestOverall = markets.size
  ? [...markets.values()].flatMap((m) => m.captures.map((c) => c.at)).filter(Boolean).sort().pop()
  : null;
const newestMs = newestOverall ? Date.parse(newestOverall) : null;

function selectCaptures(captures) {
  const dated = captures.filter((c) => c.at).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const chosen = new Map();
  for (const c of dated.slice(0, MAX_CAPTURES)) chosen.set(c.at + '|' + JSON.stringify(c).length, c);
  if (Number.isFinite(newestMs)) {
    for (const hours of HORIZON_HOURS) {
      const mark = newestMs - hours * 3600 * 1000;
      const hit = dated.find((c) => Date.parse(c.at) <= mark);
      if (hit) chosen.set(hit.at + '|' + JSON.stringify(hit).length, hit);
    }
  }
  return [...chosen.values()].sort((a, b) => String(b.at).localeCompare(String(a.at))).slice(0, MAX_CAPTURES + HORIZON_HOURS.length);
}

for (const rec of markets.values()) {
  rec.captures = selectCaptures(rec.captures);
  // Bars: the desk prefers the finest period available per market, newest N.
  const byPeriod = new Map();
  for (const b of rec.bars) {
    if (!byPeriod.has(b.period)) byPeriod.set(b.period, []);
    byPeriod.get(b.period).push(b);
  }
  const finest = [...byPeriod.keys()].filter((p) => p).sort((a, b) => a - b)[0];
  rec.bars = finest ? byPeriod.get(finest).sort((a, b) => a.endTs - b.endTs).slice(-MAX_BARS) : [];
  rec.barPeriodMinutes = finest || null;
  delete rec.periods;
  rec.lastBarTs = rec.bars.length ? rec.bars[rec.bars.length - 1].endTs : null;
}

const all = [...markets.values()].filter((m) => m.captures.length > 0 || m.market);
const withLadder = all.filter((m) => m.captures.length > 0);

/**
 * THE SELECTION RULE (stated, not implied):
 *   1. every market with at least one real captured ladder is included — the
 *      desk can price an order against real depth there;
 *   2. if that exceeds `--max-markets`, keep the open contracts first (real
 *      close_time after the newest capture) and then the highest real
 *      lifetime volume, and RECORD how many were dropped and why.
 */
const newestCaptureTs = withLadder
  .map((m) => m.captures[0].at)
  .filter(Boolean)
  .sort()
  .pop() || null;
const asOfMs = newestCaptureTs ? Date.parse(newestCaptureTs) : Date.now();

function isOpen(m) {
  const close = m.market?.close_time || m.market?.expiration_time;
  if (!close) return false;
  const t = Date.parse(close);
  if (!Number.isFinite(t)) return false;
  return t > asOfMs && String(m.status || '') !== 'finalized';
}

withLadder.sort((a, b) => {
  const oa = isOpen(a) ? 1 : 0;
  const ob = isOpen(b) ? 1 : 0;
  if (oa !== ob) return ob - oa;
  const va = num(a.market?.volume_fp) || 0;
  const vb = num(b.market?.volume_fp) || 0;
  if (va !== vb) return vb - va;
  return a.ticker.localeCompare(b.ticker);
});
const kept = withLadder.slice(0, MAX_MARKETS);
const dropped = withLadder.slice(MAX_MARKETS);

const quoted = readQuotedUniverse();
const quotedKept = quoted
  .filter((q) => !kept.some((m) => m.ticker === q.ticker))
  .slice(0, MAX_QUOTED);

const output = {
  generatedAt: new Date().toISOString(),
  sourceDir: 'data/history',
  discoveredDir: 'data/discovered/markets',
  apiBase: 'https://external-api.kalshi.com/trade-api/v2',
  endpoints: {
    market: 'GET /markets/{ticker}',
    orderbook: 'GET /markets/{ticker}/orderbook',
    candlesticks: 'GET /series/{series_ticker}/markets/{ticker}/candlesticks',
    marketsSearch: 'GET /markets?series_ticker=&status=&limit='
  },
  docs: {
    market: 'https://docs.kalshi.com/api-reference/market/get-market',
    orderbook: 'https://docs.kalshi.com/getting_started/orderbook_responses',
    candlesticks: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
    markets: 'https://docs.kalshi.com/api-reference/market/get-markets',
    feeSchedule: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf'
  },
  rule: {
    inclusion: 'every tracked market with >=1 real captured order-book ladder (captures[].at + captures[].url recorded per ladder)',
    ordering: 'open contracts first (close_time after the newest capture), then real lifetime volume_fp descending, then ticker',
    cap: MAX_MARKETS,
    droppedForCap: dropped.length,
    maxLevelsPerSide: MAX_LEVELS,
    maxCapturesPerMarket: MAX_CAPTURES,
    captureSelection: `newest ${MAX_CAPTURES} ladders PLUS the newest ladder at or before each of ${HORIZON_HOURS.map((h) => h + 'h').join(', ')} before the newest capture (so an older desk cut-off still has a real point-in-time ladder)`,
    horizonHoursKept: HORIZON_HOURS,
    maxBarsPerMarket: MAX_BARS,
    quotedWithoutLadder: quotedKept.length,
    quotedSeen: quoted.length,
    quotedCap: MAX_QUOTED,
    quotedRule: 'discovered markets with status active/initialized and real quotes but no captured ladder — listed, never priceable',
    note: 'Levels are integer MILLI-DOLLARS (1/1000 $, i.e. tenths of a cent — the finest grid Kalshi publishes); counts are the exchange-reported contract counts verbatim. Nothing is re-anchored or interpolated.'
  },
  coverage: {
    storesRead: storeCount,
    marketsTracked: all.length,
    marketsWithLadder: withLadder.length,
    marketsInModule: kept.length,
    openAtCapture: kept.filter(isOpen).length,
    finalizedAtCapture: kept.filter((m) => String(m.status) === 'finalized').length,
    withRealResult: kept.filter((m) => m.result === 'yes' || m.result === 'no').length,
    ladderCaptures: kept.reduce((s, m) => s + m.captures.length, 0),
    bars: kept.reduce((s, m) => s + m.bars.length, 0),
    newestCapture: newestCaptureTs
  },
  markets: kept,
  quoted: quotedKept
};

const header = `/**
 * KalshiPaperSim — Live Desk data (GENERATED — do not edit by hand)
 * =====================================================================
 * Produced by scripts/generate-desk-module.mjs from the repository's own
 * captured Kalshi data:
 *   • ladders  : GET /markets/{ticker}/orderbook            (data/history/** "books[]")
 *   • markets  : GET /markets/{ticker}                      (data/history/** "market")
 *   • quotes   : GET /series/{s}/markets/{t}/candlesticks    (data/history/** "candlesticks")
 *   • universe : GET /markets?series_ticker=                (data/discovered/markets/*.json)
 * Every ladder carries its capture timestamp and the exact URL it came from.
 * Nothing here is modelled: prices are integer cents, counts are the
 * exchange-reported contract counts. Regenerate with \`npm run desk:data\`.
 *
 * generatedAt: ${output.generatedAt}
 * markets in module: ${output.coverage.marketsInModule} (${output.coverage.openAtCapture} open at capture, ${output.coverage.finalizedAtCapture} finalized)
 * ladder captures: ${output.coverage.ladderCaptures} · bars: ${output.coverage.bars} · quoted without ladder: ${output.coverage.quotedWithoutLadder}
 */

`;

fs.mkdirSync(path.dirname(OUT), { recursive: true });
const json = JSON.stringify(output, null, 0);
fs.writeFileSync(OUT, `${header}export const DESK_DATA = ${json};\n`);

const bytes = fs.statSync(OUT).size;
console.log(`desk-data: ${kept.length} markets (${output.coverage.openAtCapture} open) · ${output.coverage.ladderCaptures} ladder captures · ${output.coverage.bars} bars · ${quotedKept.length} quoted-only · ${(bytes / 1024).toFixed(0)} KB → ${path.relative(ROOT, OUT)}`);
if (dropped.length) console.log(`desk-data: ${dropped.length} laddered market(s) dropped by --max-markets=${MAX_MARKETS} (the rule is recorded in the module's coverage block)`);
