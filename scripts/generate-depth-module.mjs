#!/usr/bin/env node
/**
 * KalshiPaperSim — Captured order-book snapshots → browser-safe ES module
 * =====================================================================
 * Recommended-work item #5: "Replace modelled depth with captured depth."
 *
 * INPUT (all real, all with a URL):
 *   • data/history/<ticker>.json → `books[]` — snapshots written by
 *     scripts/ingest-history.mjs --with-books from
 *     GET /markets/{ticker}/orderbook
 *     https://docs.kalshi.com/getting_started/orderbook_responses
 *   • src/verified-snapshot.js → ORDERBOOKS — the in-repo transcripts
 *
 * OUTPUT: src/captured-depth.js — for every market with a captured ladder, a
 * DEPTH PROFILE: the tick-distance of each level from the captured touch plus the
 * real contract count at that distance, together with the capture timestamp and
 * the exact URL. Compact tuples keep the module small enough for the browser.
 *
 * WHAT IS NEVER DONE HERE
 *   • No level is smoothed, averaged, interpolated or duplicated.
 *   • A level that arrives with a count of 0 is dropped (it is not liquidity).
 *   • Levels are NOT rounded to the display grid — they are already on it, and
 *     the run asserts that (a mis-aligned level would be a capture bug).
 *   • Nothing is generated for a market with no captured ladder: it simply has
 *     no profile, and the replay falls back to the modelled ladder, LABELLED as
 *     modelled.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { dollarsToNumber, resolvePriceGrid, minTick } from '../src/price-grid.js';
import { parseDepthLevels } from '../src/depth-profile.js';
import { ORDERBOOKS, MARKETS } from '../src/verified-snapshot.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'history');
const OUT_FILE = path.join(ROOT, 'src', 'captured-depth.js');
const MAX_LEVELS_PER_SIDE = 40;

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch (err) {
    console.error(`⚠ unreadable ${path.relative(ROOT, p)}: ${err.message} — skipped, never guessed`);
    return null;
  }
}

function tickForMarket(ticker, market) {
  if (market?.price_ranges?.length) return minTick(resolvePriceGrid(market.price_ranges));
  const snapshot = MARKETS?.[ticker]?.market || MARKETS?.[ticker];
  if (snapshot?.price_ranges?.length) return minTick(resolvePriceGrid(snapshot.price_ranges));
  return null;
}

/**
 * The newest captured ladder for a ticker, from whichever source has one.
 * "Newest" is by the recorded capture timestamp; a snapshot without one is used
 * only if nothing else exists (and then the module says so).
 */
function newestSnapshot(ticker, store) {
  const candidates = [];
  for (const b of store?.books || []) {
    candidates.push({ at: b.captured_at || null, url: b.url || null, orderbook: b.orderbook ?? b, origin: 'data/history store' });
  }
  const inRepo = ORDERBOOKS?.[ticker];
  if (inRepo?.orderbook || inRepo?.orderbook_fp || inRepo?.yes_dollars) {
    candidates.push({
      at: inRepo._provenance?.capturedAt || null,
      url: inRepo._provenance?.url || null,
      orderbook: inRepo.orderbook || inRepo,
      origin: 'src/verified-snapshot.js'
    });
  }
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  return candidates[0];
}

function profileFrom(ticker, snapshot, tick, market) {
  const { yes, no } = parseDepthLevels(snapshot.orderbook);
  const side = (levels) => {
    const sorted = levels.slice().sort((a, b) => b.price - a.price);
    if (sorted.length === 0) return null;
    const touch = sorted[0].price;
    const kept = sorted.slice(0, MAX_LEVELS_PER_SIDE);
    for (const l of kept) {
      // The exchange publishes on-grid prices. If one is not on the grid, the
      // capture (or our tick resolution) is wrong and we refuse to write it.
      const ticks = (touch - l.price) / tick;
      if (Math.abs(ticks - Math.round(ticks)) > 1e-6) {
        throw new Error(
          `${ticker}: captured level ${l.price} is not an integer number of ticks (${tick}) below the touch ${touch}. ` +
            'Refusing to write a profile whose offsets would have to be rounded.'
        );
      }
    }
    return {
      touch,
      levels: kept.map((l) => [Math.round((touch - l.price) / tick), l.count]),
      levelCount: sorted.length,
      totalCount: sorted.reduce((s, l) => s + l.count, 0)
    };
  };
  const yesSide = side(yes);
  const noSide = side(no);
  if (!yesSide && !noSide) return null;
  return {
    ticker,
    series_ticker: market?.series_ticker || ticker.split('-')[0],
    capturedAt: snapshot.at,
    url: snapshot.url,
    origin: snapshot.origin,
    tick,
    notional: dollarsToNumber(market?.notional_value_dollars) ?? 1,
    yes: yesSide,
    no: noSide,
    maxLevelsPerSide: MAX_LEVELS_PER_SIDE
  };
}

function main() {
  const markets = {};
  const skipped = [];
  const sources = [];

  if (fs.existsSync(DATA_DIR)) {
    for (const file of fs.readdirSync(DATA_DIR).sort()) {
      if (!file.endsWith('.json') || file.startsWith('_')) continue;
      const store = readJsonSafe(path.join(DATA_DIR, file));
      if (!store || typeof store.ticker !== 'string') continue;
      const ticker = store.ticker;
      const snapshot = newestSnapshot(ticker, store);
      if (!snapshot) {
        skipped.push({ ticker, reason: 'no captured order-book snapshot (run the ingest with --with-books)' });
        continue;
      }
      const tick = tickForMarket(ticker, store.market);
      if (!tick) {
        skipped.push({ ticker, reason: 'the market object carries no price_ranges, so no tick size is verified — refusing to guess one' });
        continue;
      }
      const profile = profileFrom(ticker, snapshot, tick, store.market);
      if (!profile) {
        skipped.push({ ticker, reason: 'captured ladder had no usable levels' });
        continue;
      }
      markets[ticker] = profile;
      sources.push({ ticker, url: profile.url, capturedAt: profile.capturedAt, origin: profile.origin, levels: {
        yes: profile.yes?.levelCount || 0, no: profile.no?.levelCount || 0
      } });
    }
  }

  const tickers = Object.keys(markets);
  const body = `/**
 * KalshiPaperSim — Captured Kalshi order-book ladders (GENERATED — DO NOT EDIT)
 * =====================================================================
 * Generated by scripts/generate-depth-module.mjs from real captured order books
 * (GET /markets/{ticker}/orderbook — https://docs.kalshi.com/getting_started/orderbook_responses).
 *
 * THIS IS REAL DEPTH. Each entry is a ladder the exchange actually published,
 * stored as [offsetInTicksFromTheCapturedTouch, contractCount] pairs plus the
 * capture timestamp and the URL it came from. src/depth-profile.js re-anchors a
 * ladder onto any period's real quoted touch, so a replay can trade against the
 * real SHAPE and SIZES of liquidity instead of a modelled ladder.
 *
 * It is NOT a claim that the same orders rested at that price on that date: it
 * is a snapshot moved to the period's real price, and every book built from it is
 * labelled 'captured_orderbook_reanchored' with the capture time.
 *
 * ${tickers.length} market(s) with captured depth · generated ${new Date().toISOString()}
 */

export const CAPTURED_DEPTH = ${JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      present: tickers.length > 0,
      maxLevelsPerSide: MAX_LEVELS_PER_SIDE,
      endpoint: 'GET /markets/{ticker}/orderbook',
      docs: 'https://docs.kalshi.com/getting_started/orderbook_responses',
      marketCount: tickers.length,
      sources: sources.sort((a, b) => a.ticker.localeCompare(b.ticker)),
      skipped: skipped.sort((a, b) => a.ticker.localeCompare(b.ticker)),
      markets
    },
  )};

/** Raw generated record for one ticker (offsets + counts + provenance), or null. */
export function getCapturedDepthRecord(ticker) {
  return CAPTURED_DEPTH.markets[ticker] || null;
}

/** Tickers that have a captured ladder, sorted. */
export function getCapturedDepthTickers() {
  return Object.keys(CAPTURED_DEPTH.markets).sort();
}

/**
 * Rebuild the profile object src/depth-profile.js consumes, from the compact
 * tuples in this module. Levels are returned as {offsetTicks, count}.
 */
export function getCapturedDepthProfile(ticker) {
  const m = CAPTURED_DEPTH.markets[ticker];
  if (!m) return null;
  const side = (s) =>
    s
      ? {
          touch: s.touch,
          levels: s.levels.map(([offsetTicks, count]) => ({ offsetTicks, count, price: Number((s.touch - offsetTicks * m.tick).toFixed(6)) })),
          levelCount: s.levelCount,
          totalCount: s.totalCount,
          keptCount: s.levels.length,
          keptCountSum: s.levels.reduce((sum, [, c]) => sum + c, 0),
          deepestOffsetTicks: s.levels.length ? s.levels[s.levels.length - 1][0] : 0
        }
      : null;
  return {
    ticker: m.ticker,
    tick: m.tick,
    notional: m.notional,
    capturedAt: m.capturedAt,
    url: m.url,
    origin: m.origin,
    yes: side(m.yes),
    no: side(m.no),
    totalContracts: (m.yes?.totalCount || 0) + (m.no?.totalCount || 0),
    source: 'captured_orderbook',
    note:
      'REAL ladder captured from GET /markets/{ticker}/orderbook, re-anchored to the real quoted touch of each period ' +
      '(sizes and shape captured; the price level is the real quote for that period).'
  };
}
`;

  fs.writeFileSync(OUT_FILE, body);
  const kb = (fs.statSync(OUT_FILE).size / 1024).toFixed(1);
  console.log(`✓ src/captured-depth.js — ${tickers.length} market(s) with captured depth, ${kb} KB`);
  for (const s of sources) console.log(`    ${s.ticker}: yes=${s.levels.yes} no=${s.levels.no} levels @ ${s.capturedAt || 'unrecorded time'}`);
  if (skipped.length) {
    console.log(`    ${skipped.length} market(s) without a captured ladder (they replay on the MODELLED ladder, labelled as such):`);
    for (const s of skipped.slice(0, 8)) console.log(`      • ${s.ticker}: ${s.reason}`);
    if (skipped.length > 8) console.log(`      … and ${skipped.length - 8} more`);
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`generate-depth-module failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { main };
