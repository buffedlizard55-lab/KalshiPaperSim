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
 *   node scripts/generate-desk-module.mjs [--max-markets=80] [--max-levels=40]
 *                                         [--max-captures=12] [--max-bars=72]
 *                                         [--max-quoted=120] [--out=src/desk-data.js]
 *
 * The capture selection is deliberately time-diverse (see HORIZON_HOURS): a
 * forward test needs a real ladder captured AT its cut-off, not just today's.
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
const MAX_MARKETS = Number(arg('max-markets', 80));
const MAX_LEVELS = Number(arg('max-levels', 40));
const MAX_CAPTURES = Number(arg("max-captures", 12));
const MAX_BARS = Number(arg('max-bars', 72));
const MAX_QUOTED = Number(arg('max-quoted', 120));
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

/* ------------------------------------------------------------------ *
 * Capture-bound accounting — published as coverage.captureEviction
 * ------------------------------------------------------------------ *
 * This module is a WINDOW on data/history/**, not a copy of it:
 *   • selectCaptures() keeps the newest MAX_CAPTURES ladders per market (plus
 *     one per horizon mark), and
 *   • the market cap then drops whole contracts (`dropped`).
 * Both bounds are MODULE-side. Nothing is deleted from data/history/** — but a
 * desk-season round whose batch this module no longer carries cannot be walked
 * again, so the season re-reports FEWER rounds than it already measured
 * (irregularity #64). These counters make that visible in the artifact itself.
 */
const storeLadderStats = { ladders: 0, nonEmpty: 0, empty: 0, instants: new Set(), nonEmptyInstants: new Set() };

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
    // Count what the STORE holds before any module-side selection: an empty
    // book is still a capture (and evidence for irregularity #60), it just
    // cannot price an order, so compactLadder() drops it.
    const atMs = Date.parse(book?.captured_at || '');
    const wire = book?.orderbook?.orderbook_fp || book?.orderbook_fp || book?.orderbook;
    const levels = (Array.isArray(wire?.yes_dollars) ? wire.yes_dollars.length : 0) +
      (Array.isArray(wire?.no_dollars) ? wire.no_dollars.length : 0);
    storeLadderStats.ladders += 1;
    if (Number.isFinite(atMs)) storeLadderStats.instants.add(atMs);
    if (levels > 0) {
      storeLadderStats.nonEmpty += 1;
      if (Number.isFinite(atMs)) storeLadderStats.nonEmptyInstants.add(atMs);
    } else storeLadderStats.empty += 1;
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

let laddersBeforeCaptureSelection = 0;
let laddersAfterCaptureSelection = 0;
for (const rec of markets.values()) {
  laddersBeforeCaptureSelection += rec.captures.length;
  rec.captures = selectCaptures(rec.captures);
  laddersAfterCaptureSelection += rec.captures.length;
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
/**
 * THE FINALIZED RESERVE. Open contracts sort first, so once the store holds
 * more laddered markets than --max-markets, every settled contract is pushed
 * out of the module and the desk loses the exchange's own settled results —
 * the real $1.00/$0.00 settlement path (and its tests) degrade to fixtures
 * only (found 2026-09-19: 157 laddered markets, 80 open ones filled the cap,
 * 0 finalized kept). The selection therefore RESERVES up to
 * --finalized-reserve slots for settled contracts that carry the exchange's
 * own result, taken by real lifetime volume, ON TOP of the open-contract
 * budget (the cap is a budget for OPEN contracts; bumping settled ones in
 * would otherwise evict exactly the open contracts the desk entrants trade —
 * the first cut of this fix did that and the season lost six of its seven
 * active books). Settlement examples are part of what the desk is for.
 */
const FINALIZED_RESERVE = Number(arg('finalized-reserve', 6));

/**
 * THE SERIES RESERVE (2026-09-20, Irregularity #55 follow-up).
 *
 * The desk universe was being sorted purely by lifetime volume_fp, which
 * pushed out every game contract (KXMLBGAME/KXNFLGAME/KXNBAGAME/KXNCAAFGAME/
 * KXNCAAFSPREAD/...) and weather brackets from non-NYC cities once the index
 * and crypto series filled the cap. The desk entrants LiveMLB_GameFavourite
 * and LiveNFL_GameFavourite then reported "no ladder" despite those ladders
 * existing in the store, and the desk signal hook for MLB/NFL/NBA/NCAA could
 * never fire. The fix reserves a small number of slots per priority series
 * ON TOP of the open-contract cap and the finalized reserve, ranked by
 * volume within each reserved series so the most-liquid contracts are kept
 * first. The cap for unreserved open contracts is reduced accordingly.
 *
 * Reserved slots per series are small — not every contract is kept — so an
 * entrant that trades many legs may still abstain on less-liquid contracts.
 * That is honest (a real desk would see the same thin book). The coverage
 * block records how many were reserved vs how many existed.
 */
const SERIES_RESERVES = [
  // In-play game markets — the highest-signal sports contracts. Reserve per series.
  { prefix: 'KXMLBGAME', slots: 6, reason: 'MLB in-play games — desk MLB signal hook targets these (Tangotiger WE, R18)' },
  { prefix: 'KXNFLGAME', slots: 4, reason: 'NFL Sunday/Monday game contracts — LiveNFL_GameFavourite' },
  { prefix: 'KXNBAGAME', slots: 6, reason: 'NBA game contracts — LiveNBA_GameFavourite' },
  { prefix: 'KXNCAAFGAME', slots: 4, reason: 'NCAA football game contracts — LiveNCAA_GameFavourite' },
  { prefix: 'KXNCAAFSPREAD', slots: 2, reason: 'NCAA spread contracts — test coverage for point-in-time joins' },
  { prefix: 'KXNHLGAME', slots: 4, reason: 'NHL game contracts — sports-favourite coverage' },
  // Signal archive: weather and FDA.
  { prefix: 'KXHIGHNY', slots: 12, reason: 'NYC high-temp brackets — ForecastEdge_Weather signal target' },
  { prefix: 'KXHIGHLAX', slots: 3, reason: 'LA weather brackets — ForecastEdge_MultiCity' },
  { prefix: 'KXHIGHCHI', slots: 3, reason: 'Chicago weather brackets' },
  { prefix: 'KXHIGHMIA', slots: 3, reason: 'Miami weather brackets' },
  { prefix: 'KXHIGHAUS', slots: 3, reason: 'Austin weather brackets' },
  { prefix: 'KXHIGHDEN', slots: 3, reason: 'Denver weather brackets' },
  { prefix: 'KXHIGHPHIL', slots: 3, reason: 'Philly weather brackets' },
  { prefix: 'KXHIGHTPHX', slots: 3, reason: 'Phoenix weather brackets' },
  { prefix: 'KXHIGHTSEA', slots: 3, reason: 'Seattle weather brackets' },
  { prefix: 'KXFDAAPPROVE', slots: 3, reason: 'FDA approval brackets — LiveFDA_DecisionPremium' },
  { prefix: 'KXFDARETATRUTIDE', slots: 3, reason: 'FDA retatrutide brackets' },
  { prefix: 'KXFDAAPPROVALDATECMPS', slots: 3, reason: 'FDA date-bracket composites' },
  // Event-driven CEO series.
  { prefix: 'TESLACEOCHANGE', slots: 2, reason: 'Tesla CEO-change contracts — LiveCEO_ChangeFav' },
  { prefix: 'KXOPENAICEOCHANGE', slots: 2, reason: 'OpenAI CEO-change contracts' },
  { prefix: 'JPMCEOCHANGE', slots: 2, reason: 'JPMorgan CEO-change contracts' }
];

function seriesOf(m) {
  return String(m.seriesTicker || m.ticker || '').split('-')[0];
}

const isFinalWithResult = (m) =>
  String(m.status || '') === 'finalized' && (m.result === 'yes' || m.result === 'no');
const finalizedRanked = withLadder
  .filter(isFinalWithResult)
  .sort((a, b) => (num(b.market?.volume_fp) || 0) - (num(a.market?.volume_fp) || 0) || a.ticker.localeCompare(b.ticker));
const finalizedKept = finalizedRanked.slice(0, FINALIZED_RESERVE);
const keptTickers = new Set(finalizedKept.map((m) => m.ticker));
const reservedBySeries = [];
let reservedCount = 0;
for (const rule of SERIES_RESERVES) {
  const candidates = withLadder
    .filter((m) => !keptTickers.has(m.ticker) && seriesOf(m) === rule.prefix && !isFinalWithResult(m))
    .sort((a, b) => (num(b.market?.volume_fp) || 0) - (num(a.market?.volume_fp) || 0) || a.ticker.localeCompare(b.ticker));
  const picked = candidates.slice(0, rule.slots);
  for (const m of picked) keptTickers.add(m.ticker);
  reservedBySeries.push({
    prefix: rule.prefix,
    slots: rule.slots,
    kept: picked.length,
    available: candidates.length,
    reason: rule.reason,
    tickers: picked.map((m) => m.ticker)
  });
  reservedCount += picked.length;
}
const openRemainingBudget = Math.max(0, MAX_MARKETS - reservedCount);
const openFirst = withLadder.filter((m) => !keptTickers.has(m.ticker) && !isFinalWithResult(m));
const unreservedOpen = openFirst.slice(0, openRemainingBudget);
for (const m of unreservedOpen) keptTickers.add(m.ticker);
const kept = [...finalizedKept, ...withLadder.filter((m) => keptTickers.has(m.ticker) && !finalizedKept.includes(m))];
const dropped = withLadder.filter((m) => !keptTickers.has(m.ticker));

/* The capture bound, measured — same 20-minute batch rule src/desk-season.js
 * uses to stamp a round (a round is stamped at the LAST instant of its batch). */
const iso = (t) => (Number.isFinite(t) ? new Date(t).toISOString() : null);
function captureBatches(instants, minutes = 20) {
  const sorted = [...instants].sort((a, b) => a - b);
  const gapMs = minutes * 60 * 1000;
  const out = [];
  for (const t of sorted) {
    const cur = out[out.length - 1];
    if (cur && t - cur.last <= gapMs) { cur.last = t; cur.instants += 1; }
    else out.push({ first: t, last: t, instants: 1 });
  }
  return out;
}
const moduleInstants = new Set();
for (const m of kept) for (const c of m.captures || []) {
  const t = Date.parse(c.at);
  if (Number.isFinite(t)) moduleInstants.add(t);
}
const storeBatches = captureBatches(storeLadderStats.instants);
const moduleBatches = captureBatches(moduleInstants);
const representedBatches = storeBatches.filter((b) => [...moduleInstants].some((t) => t >= b.first && t <= b.last));
const unrepresentedBatches = storeBatches.filter((b) => !representedBatches.includes(b));
const seasonRoundStamps = storeBatches.map((b) => b.last);
const evictedRoundStamps = seasonRoundStamps.filter((t) => !moduleInstants.has(t));
const moduleInstantList = [...moduleInstants].sort((a, b) => a - b);
const captureEviction = {
  rule: `data/history/** holds every captured ladder; THIS MODULE carries a window on it. selectCaptures() keeps the newest ${MAX_CAPTURES} ladders per market plus one per horizon mark (${HORIZON_HOURS.map((h) => h + 'h').join(', ')}), and the market cap (${MAX_MARKETS}) then drops whole contracts. Ladders outside that window are EVICTED FROM THIS MODULE, never from data/history.`,
  effect: 'a desk-season round whose batch this module no longer carries cannot be walked again, so the season re-reports FEWER rounds than it already measured; the desk loses the older cut-offs it could once price. The ladders are still in data/history/** — nothing was deleted.',
  reproduce: `node scripts/generate-desk-module.mjs --max-captures 40 --out src/desk-data.js   # then node scripts/run-desk-season.mjs`,
  batchMinutes: 20,
  batchRule: 'the same rule src/desk-season.js uses: capture instants are grouped while the gap to the batch\'s last instant is <= 20 minutes, and a round is stamped at the LAST instant of its batch',
  storeLadderCaptures: storeLadderStats.ladders,
  storeNonEmptyLadders: storeLadderStats.nonEmpty,
  storeEmptyLadders: storeLadderStats.empty,
  storeCaptureInstants: storeLadderStats.instants.size,
  storeNonEmptyCaptureInstants: storeLadderStats.nonEmptyInstants.size,
  storeCaptureBatches: storeBatches.length,
  laddersBeforeCaptureSelection,
  laddersAfterCaptureSelection,
  evictedByCaptureCap: laddersBeforeCaptureSelection - laddersAfterCaptureSelection,
  evictedByMarketCap: dropped.reduce((n, m) => n + (m.captures || []).length, 0),
  marketsDroppedByCap: dropped.length,
  moduleLadderCaptures: kept.reduce((n, m) => n + (m.captures || []).length, 0),
  moduleCaptureInstants: moduleInstants.size,
  moduleCaptureBatches: moduleBatches.length,
  moduleEarliestCapture: iso(moduleInstantList[0]),
  moduleNewestCapture: iso(moduleInstantList[moduleInstantList.length - 1]),
  storeBatchesRepresentedInModule: representedBatches.length,
  storeBatchesNotRepresented: unrepresentedBatches.length,
  storeBatchesNotRepresentedList: unrepresentedBatches.map((b) => ({ first: iso(b.first), last: iso(b.last), instants: b.instants })),
  seasonRoundStamps: seasonRoundStamps.length,
  seasonRoundStampsEvicted: evictedRoundStamps.length,
  seasonRoundStampsEvictedList: evictedRoundStamps.map(iso).sort(),
  captureInstantsEvictedFromModule: [...storeLadderStats.instants].filter((t) => !moduleInstants.has(t)).length,
  nonEmptyCaptureInstantsEvictedFromModule: [...storeLadderStats.nonEmptyInstants].filter((t) => !moduleInstants.has(t)).length,
  nothingDeletedFrom: 'data/history/** (the store is append-only; only this generated module is a window on it)'
};

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
    ordering: `up to ${FINALIZED_RESERVE} FINALIZED contracts carrying the exchange's own result first (real lifetime volume_fp descending); then SERIES RESERVES per priority prefix (game, weather, FDA, CEO contracts kept so signal-driven desk entrants have ladders to read); then remaining open contracts by real lifetime volume_fp descending; the cap of ${MAX_MARKETS} is the TARGET size for open contracts (reserved series slots count against it)`,
    finalizedReserve: FINALIZED_RESERVE,
    finalizedAvailable: finalizedRanked.length,
    seriesReserves: reservedBySeries,
    reservedCount,
    openRemainingBudget,
    cap: MAX_MARKETS,
    droppedForCap: dropped.length,
    maxLevelsPerSide: MAX_LEVELS,
    maxCapturesPerMarket: MAX_CAPTURES,
    captureSelection: `newest ${MAX_CAPTURES} ladders PLUS the newest ladder at or before each of ${HORIZON_HOURS.map((h) => h + 'h').join(', ')} before the newest capture (so an older desk cut-off still has a real point-in-time ladder)`,
    horizonHoursKept: HORIZON_HOURS,
    maxBarsPerMarket: MAX_BARS,
    quotedWithoutLadder: quotedKept.length,
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
    reservedBySeries,
    ladderCaptures: kept.reduce((s, m) => s + m.captures.length, 0),
    bars: kept.reduce((s, m) => s + m.bars.length, 0),
    newestCapture: newestCaptureTs,
    captureEviction
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
console.log(`desk-data: capture bound — the store holds ${captureEviction.storeLadderCaptures} ladders (${captureEviction.storeNonEmptyLadders} non-empty) in ${captureEviction.storeCaptureBatches} batches; this module keeps ${captureEviction.moduleLadderCaptures} ladders in ${captureEviction.moduleCaptureBatches} batches (${captureEviction.storeBatchesRepresentedInModule} store batch(es) represented, ${captureEviction.storeBatchesNotRepresented} not) — ${captureEviction.seasonRoundStampsEvicted} season round stamp(s) and ${captureEviction.captureInstantsEvictedFromModule} capture instant(s) are evicted from the MODULE, never from data/history; listed in coverage.captureEviction`);
