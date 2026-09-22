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

import { resolveMarketStatus, MARKET_STATUS_RULE } from '../src/market-status.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const HISTORY_DIR = path.join(ROOT, 'data', 'history');
const DISCOVERED_DIR = path.join(ROOT, 'data', 'discovered', 'markets');

function arg(name, fallback) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}
const MAX_MARKETS = Number(arg('max-markets', 100));
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
      periods: [],
      // Point-in-time status photographs across every store file for this
      // ticker, resolved once by src/market-status.js after the walk
      // (irregularity #66). Never serialized as-is: replaced by statusEvidence.
      observations: [],
      marketCapturedMs: null
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
  const rel = path.relative(ROOT, file);
  rec.source = rec.source || rel;
  /**
   * ONE TICKER, SEVERAL POINT-IN-TIME FILES (irregularity #66).
   *
   * walkHistory() reads data/history/*.json FIRST and the intraday buckets
   * LAST, which is not chronological order: the daily file is the freshest
   * market object (it is re-queried on every ingest) while a 60-minute file can
   * be days older. Letting the last file win therefore wrote a STALE `status`
   * over a settled one while `result` was kept from the settled file, producing
   * 3 contradictory records in src/desk-data.js (`status: "active"` with
   * `result: "yes"|"no"`) — 2 of which held KXNCAAFSPREAD reserve slots.
   * Every file is now kept as an observation and src/market-status.js resolves
   * the ticker once, after the walk: settlement is monotone, otherwise the
   * NEWEST market_captured_at wins. The market OBJECT (volume, quotes, times)
   * is chosen the same way, so ranking and close_time cannot come from the
   * older photograph either.
   */
  const capturedAt = store.market_captured_at || null;
  const capturedMs = capturedAt ? Date.parse(capturedAt) : NaN;
  rec.observations.push({ status: store.status ?? null, result: store.result ?? null, marketCapturedAt: capturedAt, source: rel });
  if (store.market && Number.isFinite(capturedMs) && (rec.marketCapturedMs === null || capturedMs >= rec.marketCapturedMs)) {
    rec.market = store.market;
    rec.marketCapturedMs = capturedMs;
  } else if (store.market && rec.marketCapturedMs === null && !rec.market) {
    rec.market = store.market;
  }
  rec.marketCapturedAt = capturedAt || rec.marketCapturedAt || null;
  rec.marketUrl = store.market_url || rec.marketUrl || null;
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
 * RESOLVE EACH TICKER'S STATUS ONCE (irregularity #66).
 *
 * Every store file for a ticker was pushed onto `rec.observations` above; the
 * rule in src/market-status.js now decides what the exchange says the contract
 * is: settlement is monotone (a finalized-with-result photograph beats any
 * later `active` one, because a settled contract never reopens), otherwise the
 * newest `market_captured_at` wins. Before this, the last file read in
 * walkHistory() order won, and because the daily store is read BEFORE the
 * intraday buckets, an older `active` photograph overwrote a settled one while
 * the settled `result` was kept — 3 contradictory records survived into
 * src/desk-data.js and 2 of them held reserve slots.
 *
 * The raw observations are replaced by a compact, serializable summary
 * (`statusEvidence`) so the module carries the evidence without the bulk.
 */
const statusResolution = {
  rule: MARKET_STATUS_RULE,
  tickers: markets.size,
  settledTickers: 0,
  openTickers: 0,
  unknownTickers: 0,
  multiFileTickers: 0,
  filesDisagreeingWithResolution: 0,
  conflicts: [],
  settledFromStaleFile: []
};
for (const rec of markets.values()) {
  const resolved = resolveMarketStatus(rec.observations, { ticker: rec.ticker });
  const observations = rec.observations;
  rec.status = resolved.status;
  rec.result = resolved.result;
  rec.settled = resolved.settled;
  rec.statusEvidence = {
    observations: observations.length,
    settledObservations: resolved.settledObservations,
    sources: observations.map((o) => `${o.source}@${o.marketCapturedAt || 'undated'}=${o.status}${o.result ? '/' + o.result : ''}`),
    chosenSource: resolved.source,
    chosenCapturedAt: resolved.marketCapturedAt,
    rule: resolved.rule,
    why: resolved.why
  };
  delete rec.observations;
  delete rec.marketCapturedMs;
  if (observations.length > 1) statusResolution.multiFileTickers += 1;
  if (resolved.settled) statusResolution.settledTickers += 1;
  else if (resolved.openForTrading) statusResolution.openTickers += 1;
  else statusResolution.unknownTickers += 1;
  const wrong = observations.filter((o) => o.status !== resolved.status);
  statusResolution.filesDisagreeingWithResolution += wrong.length;
  if (resolved.settled && wrong.length) {
    statusResolution.settledFromStaleFile.push({
      ticker: rec.ticker,
      resolved: { status: resolved.status, result: resolved.result, source: resolved.source, marketCapturedAt: resolved.marketCapturedAt },
      staleFiles: wrong.map((o) => ({ source: o.source, marketCapturedAt: o.marketCapturedAt, status: o.status }))
    });
  }
  if (resolved.conflict) statusResolution.conflicts.push({ ticker: rec.ticker, ...resolved.conflictDetail });
  if (String(resolved.status || '') === 'finalized' && !resolved.settled) {
    statusResolution.finalizedWithoutResult = (statusResolution.finalizedWithoutResult || 0) + 1;
  }
}

/* ------------------------------------------------------------------ *
 * Capture batches (one look at the book) — the unit a season round uses
 * ------------------------------------------------------------------ *
 * The 20-minute batch rule below is the SAME rule src/desk-season.js uses to
 * stamp a round (a round is stamped at the LAST instant of its batch). It is
 * computed here, before any selection, because the selection has to protect it:
 * see ROUND ANCHORS.
 */
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
const STORE_BATCHES = captureBatches(storeLadderStats.instants);

/* ------------------------------------------------------------------ *
 * Ladder selection
 * ------------------------------------------------------------------ */

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

function selectCaptures(captures, anchors) {
  const dated = captures.filter((c) => c.at).sort((a, b) => String(b.at).localeCompare(String(a.at)));
  const chosen = new Map();
  for (const c of dated.slice(0, MAX_CAPTURES)) chosen.set(c.at + '|' + JSON.stringify(c).length, c);
  // ROUND ANCHORS: a capture a season round is stamped at is never evicted by
  // the capture window, because the season's rounds must stay re-walkable.
  if (anchors && anchors.size) {
    for (const c of dated) if (anchors.has(c.at)) chosen.set(c.at + '|' + JSON.stringify(c).length, c);
  }
  if (Number.isFinite(newestMs)) {
    for (const hours of HORIZON_HOURS) {
      const mark = newestMs - hours * 3600 * 1000;
      const hit = dated.find((c) => Date.parse(c.at) <= mark);
      if (hit) chosen.set(hit.at + '|' + JSON.stringify(hit).length, hit);
    }
  }
  const sorted = [...chosen.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
  // ROUND ANCHORS are protected from the final trim as well. Without this the
  // slice below could drop an anchor capture whose instant is older than the
  // newest MAX_CAPTURES + HORIZON_HOURS.length captures of the market — the
  // anchor would then be missing exactly where it is supposed to be pinned, and
  // src/desk-season.js could not seed that round. Anchors are added on TOP of the
  // window (the same rule as the finalized reserve in the market cap), so the
  // window itself is unchanged for every market with no anchor.
  if (!anchors || !anchors.size) return sorted.slice(0, MAX_CAPTURES + HORIZON_HOURS.length);
  const pinned = sorted.filter((c) => anchors.has(c.at));
  const rest = sorted.filter((c) => !anchors.has(c.at)).slice(0, MAX_CAPTURES + HORIZON_HOURS.length);
  return [...pinned, ...rest].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

/**
 * ROUND ANCHORS — a capture bound the module refuses to break (roadmap Next #10).
 *
 * The measured problem: `coverage.captureEviction.seasonRoundStampsEvicted` was
 * 14 of 21. Two different causes hid behind one number. Seven stamps are simply
 * not representable — the store's LAST capture of that batch was an empty book
 * (a post-close capture; irregularity #60), so no ladder exists at that instant
 * anywhere. The other seven WERE representable — the store holds non-empty
 * ladders inside those batches, from markets the module even keeps — but the
 * per-market capture window (newest 12/40 ladders + horizon marks) dropped the
 * instants a round is stamped at, so src/desk-season.js could not seed those
 * rounds and the season re-reported 5 rounds out of 21 batches.
 *
 * The fix is a reservation, not a bigger number: for EVERY store batch, the
 * module keeps the newest capture that batch holds for an OPEN-board market, and
 * that market is kept even if the market cap would drop it (the anchor reserve
 * sits on top of the cap, like the finalized reserve). The season's own seed
 * rule is mirrored here (`seedsOpenBoard`, identical to src/desk-season.js) so an
 * anchor is always a market that can actually seed a round.
 */
const horizonMs = [...markets.values()].reduce((acc, m) => {
  for (const c of m.captures || []) {
    const t = Date.parse(c.at);
    if (Number.isFinite(t) && (acc === null || t > acc)) acc = t;
  }
  return acc;
}, null);
const seedsOpenBoard = (m) => {
  if (String(m.status || '') === 'finalized') return false;
  const close = m.market?.close_time || m.market?.expiration_time;
  const closeMs = close ? Date.parse(close) : null;
  if (horizonMs !== null && Number.isFinite(closeMs) && closeMs <= horizonMs) return false;
  return true;
};
const roundAnchors = [];
for (const batch of STORE_BATCHES) {
  const holders = [];
  for (const m of markets.values()) {
    if (!seedsOpenBoard(m)) continue;
    const inBatch = (m.captures || [])
      .map((c) => ({ at: c.at, ms: Date.parse(c.at) }))
      .filter((c) => Number.isFinite(c.ms) && c.ms >= batch.first && c.ms <= batch.last)
      .sort((a, b) => b.ms - a.ms);
    if (inBatch.length) holders.push({ ticker: m.ticker, at: inBatch[0].at, ms: inBatch[0].ms, volume: num(m.market?.volume_fp) || 0 });
  }
  holders.sort((a, b) => b.ms - a.ms || b.volume - a.volume || a.ticker.localeCompare(b.ticker));
  roundAnchors.push({
    stamp: iso(batch.last),
    batchFirst: iso(batch.first),
    instantsInBatch: batch.instants,
    candidates: holders.length,
    anchor: holders[0] || null
  });
}
const anchorByTicker = new Map();
for (const a of roundAnchors) {
  if (!a.anchor) continue;
  if (!anchorByTicker.has(a.anchor.ticker)) anchorByTicker.set(a.anchor.ticker, new Set());
  anchorByTicker.get(a.anchor.ticker).add(a.anchor.at);
}


let laddersBeforeCaptureSelection = 0;
let laddersAfterCaptureSelection = 0;
for (const rec of markets.values()) {
  laddersBeforeCaptureSelection += rec.captures.length;
  rec.captures = selectCaptures(rec.captures, anchorByTicker.get(rec.ticker));
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
  // A settled contract is never open, whatever a stale photograph said
  // (irregularity #66): `m.settled` comes from src/market-status.js.
  if (m.settled === true || String(m.status || '') === 'finalized') return false;
  const close = m.market?.close_time || m.market?.expiration_time;
  if (!close) return false;
  const t = Date.parse(close);
  if (!Number.isFinite(t)) return false;
  return t > asOfMs;
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
  // In-play game markets — the highest-signal sports contracts. `slots` is the
  // floor (kept even when the series is quiet); `maxSlots` (2026-09-22, follows
  // the audit finding) lets a series that really has that many OPEN laddered
  // contracts keep them, so the 80-market volume cap can never again crowd an
  // open game contract out of the desk (KXNCAAFGAME had 26 such contracts and
  // kept 4). The audit cross-check `deskReserves` in
  // data/reports/game-window-captures.json re-measures this from the store.
  { prefix: 'KXMLBGAME', slots: 6, maxSlots: 10, reason: 'MLB in-play games — desk MLB signal hook targets these (Tangotiger WE, R18)' },
  { prefix: 'KXNFLGAME', slots: 4, maxSlots: 10, reason: 'NFL Sunday/Monday game contracts — LiveNFL_GameFavourite' },
  { prefix: 'KXNBAGAME', slots: 6, maxSlots: 10, reason: 'NBA game contracts — LiveNBA_GameFavourite' },
  { prefix: 'KXNCAAFGAME', slots: 4, maxSlots: 20, reason: 'NCAA football game contracts — LiveNCAA_GameFavourite' },
  { prefix: 'KXNCAAFSPREAD', slots: 2, maxSlots: 4, reason: 'NCAA spread contracts — test coverage for point-in-time joins' },
  { prefix: 'KXNHLGAME', slots: 4, maxSlots: 8, reason: 'NHL game contracts — sports-favourite coverage' },
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

/**
 * "The exchange has settled this contract." `m.settled` is set by the resolver
 * in src/market-status.js (finalized + result yes/no). A contract that is merely
 * `finalized` with NO result is neither tradeable nor settleable, so it enters
 * neither pool below — it is dropped, and `statusResolution.finalizedWithoutResult`
 * publishes how many there were.
 */
const isFinalWithResult = (m) => m.settled === true;
const finalizedRanked = withLadder
  .filter(isFinalWithResult)
  .sort((a, b) => (num(b.market?.volume_fp) || 0) - (num(a.market?.volume_fp) || 0) || a.ticker.localeCompare(b.ticker));
const finalizedKept = finalizedRanked.slice(0, FINALIZED_RESERVE);
const keptTickers = new Set(finalizedKept.map((m) => m.ticker));
const reservedBySeries = [];
let reservedCount = 0;
for (const rule of SERIES_RESERVES) {
  const ceiling = Math.max(rule.slots, rule.maxSlots ?? rule.slots);
  const candidates = withLadder
    .filter((m) => !keptTickers.has(m.ticker) && seriesOf(m) === rule.prefix && !isFinalWithResult(m))
    .sort((a, b) => (num(b.market?.volume_fp) || 0) - (num(a.market?.volume_fp) || 0) || a.ticker.localeCompare(b.ticker));
  const picked = candidates.slice(0, ceiling);
  for (const m of picked) keptTickers.add(m.ticker);
  reservedBySeries.push({
    prefix: rule.prefix,
    slots: rule.slots,
    maxSlots: ceiling,
    kept: picked.length,
    available: candidates.length,
    droppedBySeriesCeiling: Math.max(0, candidates.length - picked.length),
    reason: rule.reason,
    tickers: picked.map((m) => m.ticker)
  });
  reservedCount += picked.length;
}
const openRemainingBudget = Math.max(0, MAX_MARKETS - reservedCount);
const openFirst = withLadder.filter((m) => !keptTickers.has(m.ticker) && !isFinalWithResult(m));
const unreservedOpen = openFirst.slice(0, openRemainingBudget);
for (const m of unreservedOpen) keptTickers.add(m.ticker);
/**
 * THE ANCHOR RESERVE — on top of the cap, like the finalized reserve.
 *
 * Every store batch that has an open-board market with a real ladder gets that
 * market kept, even when the market cap would drop it, so the season can seed a
 * round at that batch's stamp. The set is bounded by the number of batches.
 */
const anchorTickers = new Set(roundAnchors.filter((a) => a.anchor).map((a) => a.anchor.ticker));
const anchorMarketsKept = withLadder.filter((m) => anchorTickers.has(m.ticker) && !keptTickers.has(m.ticker));
for (const m of anchorMarketsKept) keptTickers.add(m.ticker);
const kept = [...finalizedKept, ...withLadder.filter((m) => keptTickers.has(m.ticker) && !finalizedKept.includes(m))];
const dropped = withLadder.filter((m) => !keptTickers.has(m.ticker));

/* The capture bound, measured — same 20-minute batch rule src/desk-season.js
 * uses to stamp a round (a round is stamped at the LAST instant of its batch). */
const moduleInstants = new Set();
for (const m of kept) for (const c of m.captures || []) {
  const t = Date.parse(c.at);
  if (Number.isFinite(t)) moduleInstants.add(t);
}
const storeBatches = STORE_BATCHES;
const moduleBatches = captureBatches(moduleInstants);
/**
 * TWO MEASUREMENTS, BOTH PUBLISHED (roadmap Next #10, 2026-09-22).
 *
 *   • WINDOW rule (what a round needs): the module holds a capture INSIDE the
 *     batch window [first, last]. This is the rule src/desk-season.js uses when
 *     it decides whether a batch can host a round (freshLadders >= 1), so it is
 *     the honest measure of "can the season re-walk this round".
 *   • EXACT-INSTANT rule (the older, stricter measure): the module holds a
 *     capture at the batch's stamp instant exactly. It is reported separately
 *     because a stamp whose last capture was an EMPTY book can never satisfy it
 *     (irregularity #60) — reporting only this number made a fixable module
 *     bound look like an unfixable data bound.
 */
const representedBatches = storeBatches.filter((b) => [...moduleInstants].some((t) => t >= b.first && t <= b.last));
const unrepresentedBatches = storeBatches.filter((b) => !representedBatches.includes(b));
const seasonRoundStamps = storeBatches.map((b) => b.last);
const evictedRoundStamps = seasonRoundStamps.filter((t) => !moduleInstants.has(t));
const seasonRoundStampsExactInstantInModule = seasonRoundStamps.filter((t) => moduleInstants.has(t));
const evictedRoundStampDetails = unrepresentedBatches.map((b) => {
  const anchorRow = roundAnchors.find((a) => a.batchFirst === iso(b.first) && a.stamp === iso(b.last));
  const inWindow = [...storeLadderStats.nonEmptyInstants].some((t) => t >= b.first && t <= b.last);
  return {
    stamp: iso(b.last),
    batchFirst: iso(b.first),
    instantsInBatch: b.instants,
    reason: inWindow
      ? 'the module carries no capture inside this batch window even though the store holds a non-empty ladder in it — a module-side loss (ROUND ANCHORS should prevent this; if it appears, the anchor for this batch had no open-board market)'
      : 'the store holds NO non-empty ladder inside this batch window, so no module can host a round here (the batch closed on empty post-close books — irregularity #60)',
    storeHasNonEmptyLadderInWindow: inWindow,
    anchorTicker: anchorRow && anchorRow.anchor ? anchorRow.anchor.ticker : null
  };
});
const moduleInstantList = [...moduleInstants].sort((a, b) => a - b);
const captureEviction = {
  rule: `data/history/** holds every captured ladder; THIS MODULE carries a window on it. selectCaptures() keeps the newest ${MAX_CAPTURES} ladders per market plus one per horizon mark (${HORIZON_HOURS.map((h) => h + 'h').join(', ')}), and the market cap (${MAX_MARKETS}) then drops whole contracts. Ladders outside that window are EVICTED FROM THIS MODULE, never from data/history.`,
  effect: 'a desk-season round whose batch this module no longer carries cannot be walked again, so the season re-reports FEWER rounds than it already measured; the desk loses the older cut-offs it could once price. The ladders are still in data/history/** — nothing was deleted. ROUND ANCHORS make this a measured, hopefully empty list: seasonRoundStampsEvicted names every stamp the module cannot host and why (module bound vs no non-empty ladder in the store window at all).',
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
  seasonRoundStampsHostableByModule: representedBatches.length,
  seasonRoundStampsEvicted: unrepresentedBatches.length,
  seasonRoundStampsEvictedList: evictedRoundStampDetails.map((d) => d.stamp).sort(),
  seasonRoundStampsEvictedDetails: evictedRoundStampDetails,
  seasonRoundStampsExactInstantInModule: seasonRoundStampsExactInstantInModule.length,
  seasonRoundStampsMissingExactInstant: evictedRoundStamps.length,
  seasonRoundStampsMissingExactInstantList: evictedRoundStamps.map(iso).sort(),
  roundAnchors: {
    rule: 'one open-board market per store batch is kept — with the newest capture that batch holds for it — on top of the market cap, so src/desk-season.js can seed a round at that batch stamp',
    batches: roundAnchors.length,
    batchesWithAnchor: roundAnchors.filter((a) => a.anchor).length,
    batchesWithoutAnchor: roundAnchors.filter((a) => !a.anchor).map((a) => ({ stamp: a.stamp, reason: a.candidates === 0 ? 'no open-board market has a capture inside this batch' : 'unknown' })),
    anchorMarketsKeptOnTopOfCap: anchorMarketsKept.length,
    rows: roundAnchors.map((a) => ({ stamp: a.stamp, candidates: a.candidates, ticker: a.anchor ? a.anchor.ticker : null, captureAt: a.anchor ? a.anchor.at : null }))
  },
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
    ordering: `up to ${FINALIZED_RESERVE} FINALIZED contracts carrying the exchange's own result first (real lifetime volume_fp descending); then SERIES RESERVES per priority prefix (game, weather, FDA, CEO contracts kept so signal-driven desk entrants have ladders to read) up to each rule's maxSlots; then remaining open contracts by real lifetime volume_fp descending; the cap of ${MAX_MARKETS} is the TARGET size for open contracts (reserved series slots count against it)`,
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
    // `openAtCapture` is a READER-FACING label kept for compatibility; with
    // src/market-status.js it means "the exchange's newest record for this
    // ticker is a tradeable status AND the contract's close_time is in the
    // future of the module's newest ladder". Settled contracts can never appear
    // here (irregularity #66).
    openAtCapture: kept.filter(isOpen).length,
    tradeableInModule: kept.filter(isOpen).length,
    finalizedAtCapture: kept.filter((m) => String(m.status) === 'finalized').length,
    withRealResult: kept.filter((m) => m.result === 'yes' || m.result === 'no').length,
    statusResolution,
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
