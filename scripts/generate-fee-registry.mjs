#!/usr/bin/env node
/**
 * KalshiPaperSim — generate src/series-fee-registry.js
 * =====================================================================
 * WHY THIS FILE EXISTS
 * --------------------
 * Every fill in this simulation is charged the fee the OFFICIAL Kalshi
 * schedule says applies to the series it traded. Until 2026-09-18 the only
 * captured Series objects were the four in the hand-made snapshot
 * (src/verified-snapshot.js), so every other series fell back to the
 * documented taker default M=1 — and the maker/resting-order rule
 * ("Trading fees are only charged for orders that are immediately matched …
 * unless they are included in our Maker Fees section") could not be applied
 * per series at all. IRREGULARITY #36 recorded exactly that gap.
 *
 * The on-demand ingest job now captures the fee configuration of EVERY series
 * the exchange lists (GET /series?include_volume=true, see
 * scripts/discover-universe.mjs -> data/discovered/series-fees.json). This
 * script narrows that capture down to the series this build can actually
 * trade, and emits it as a module the simulation can import.
 *
 * WHAT IT DOES NOT DO
 * -------------------
 * It never invents a fee. A series with no captured row is REPORTED as missing
 * (FEE_REGISTRY_COVERAGE.missing) and the caller falls back to the documented
 * default, labelled as an assumption. It also fails loudly if the capture file
 * exists but holds no entries.
 *
 * Run: node scripts/generate-fee-registry.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'data', 'discovered', 'series-fees.json');
const OUT = path.join(ROOT, 'src', 'series-fee-registry.js');

const CAPTURE_DOCS = 'https://docs.kalshi.com/api-reference/market/get-series-list';
const SERIES_DOC = 'https://docs.kalshi.com/api-reference/market/get-series';

/** Every series ticker this build could conceivably price a fill for. */
async function neededSeries() {
  const needed = new Map(); // ticker -> why we need it
  const add = (t, why) => {
    const ticker = String(t || '').trim();
    if (!/^[A-Z0-9]+$/.test(ticker)) return;
    if (!needed.has(ticker)) needed.set(ticker, why);
  };

  // 1. The captured snapshot series (point-in-time GET /series/{ticker}).
  const snap = await import(pathToFileURL(path.join(ROOT, 'src', 'verified-snapshot.js')).href);
  for (const t of Object.keys(snap.SERIES)) add(t, 'verified snapshot capture');

  // 2. Every series held in the accumulated store (daily + intraday).
  const store = await import(pathToFileURL(path.join(ROOT, 'src', 'accumulated-history.js')).href);
  for (const [ticker, m] of Object.entries(store.ACCUMULATED_HISTORY?.markets || {})) {
    add(m.series_ticker || String(ticker).split('-')[0], 'daily store');
  }
  const periods = store.ACCUMULATED_INTRADAY?.periods || {};
  for (const [period, slice] of Object.entries(periods)) {
    for (const [ticker, m] of Object.entries(slice?.markets || {})) {
      add(m.series_ticker || String(ticker).split('-')[0], `${period}-minute store`);
    }
  }

  // 3. Series the strategies name (universe entries are code, not data, so
  //    read them as source text rather than guessing what decide() will pick).
  const strategiesSrc = fs.readFileSync(path.join(ROOT, 'src', 'strategies.js'), 'utf8');
  for (const token of new Set(strategiesSrc.match(/\bKX[A-Z0-9]+\b/g) || [])) {
    add(token, 'referenced by src/strategies.js');
  }

  // 4. Series the fee PDF transcription covers (so the cross-check can run).
  const cfg = await import(pathToFileURL(path.join(ROOT, 'src', 'kalshi-config.js')).href);
  for (const t of Object.keys(cfg.NON_STANDARD_FEE_MULTIPLIERS || {})) add(t, 'PDF non-standard fee table');

  return needed;
}

function jsValue(v) {
  return JSON.stringify(v);
}

async function main() {
  const needed = await neededSeries();
  const present = fs.existsSync(SRC);
  const capture = present ? JSON.parse(fs.readFileSync(SRC, 'utf8')) : null;
  const fees = capture?.fees || {};

  if (present && Object.keys(fees).length === 0) {
    console.error('✗ data/discovered/series-fees.json exists but holds no series — refusing to write an empty registry.');
    process.exit(1);
  }

  const rows = [];
  const missing = [];
  const prefixes = [];
  const allCaptured = Object.keys(fees);
  for (const [ticker, why] of [...needed.entries()].sort()) {
    const hit = fees[ticker];
    if (!hit) {
      // A bare PREFIX of real series is not a series: strategies.js tests
      // tickers with e.g. startsWith('KXHIGH'). Report it as a prefix so the
      // missing list stays a list of genuine gaps.
      const isPrefix = allCaptured.some((t) => t !== ticker && t.startsWith(ticker));
      if (isPrefix) prefixes.push({ ticker, why, example: allCaptured.find((t) => t.startsWith(ticker)) });
      else missing.push({ ticker, why });
      continue;
    }
    rows.push({
      ticker,
      fee_type: hit.fee_type ?? null,
      fee_multiplier: typeof hit.fee_multiplier === 'number' ? hit.fee_multiplier : null,
      category: hit.category ?? null,
      title: hit.title ?? null,
      // volume_fp is the exchange's own lifetime volume for the series — the
      // number a reader can use to check "is this series liquid enough that a
      // fee capture is meaningful".
      volume_fp: hit.volume_fp ?? null,
      why
    });
  }

  const provenance = capture?._provenance || null;
  const body = `/**
 * KalshiPaperSim — Series Fee Registry (GENERATED — do not edit by hand)
 * =====================================================================
 * Source: data/discovered/series-fees.json — the capture written by
 * scripts/discover-universe.mjs from the OFFICIAL endpoint
 *   GET /series?include_volume=true
 *   ${CAPTURE_DOCS}
 * capturedAt: ${provenance?.capturedAt || 'NOT CAPTURED IN THIS BUILD'}
 *
 * Regenerate with: node scripts/generate-fee-registry.mjs
 *
 * SCOPE: only the series this build can actually price a fill for — every
 * series in the accumulated store (daily + intraday), every series named by a
 * strategy, the snapshot series, and the PDF non-standard table. A series that
 * is missing here was NOT captured; callers fall back to the documented
 * default and label it as an assumption (see seriesFeeConfig in
 * src/verified-snapshot.js).
 *
 * WHY fee_type MATTERS AS MUCH AS fee_multiplier
 * ----------------------------------------------
 * The official schedule charges NOTHING for a resting (maker) order unless the
 * series is in the Maker Fees section:
 *   "Trading fees are only charged for orders that are immediately matched
 *    with orders sitting on the orderbook. Trading fees are not charged for
 *    orders placed that are not immediately matched and are instead left as
 *    resting orders on the orderbook unless they are included in our 'Maker
 *    Fees' section."
 *   ${'https://kalshi.com/docs/kalshi-fee-schedule.pdf'}
 * The live Series object marks exactly those series with
 * fee_type = "quadratic_with_maker_fees"; everything else is plain "quadratic"
 * and pays the maker coefficient ONLY when that flag is set.
 */

export const FEE_REGISTRY_PROVENANCE = Object.freeze(${jsValue({
    generatedFrom: 'data/discovered/series-fees.json',
    endpoint: provenance?.endpoint || null,
    docs: CAPTURE_DOCS,
    seriesDocs: SERIES_DOC,
    capturedAt: provenance?.capturedAt || null,
    present: Boolean(capture),
    note: provenance?.note || null
  }, null, 2)});

/** ticker -> captured fee configuration (official GET /series). */
export const SERIES_FEE_REGISTRY = Object.freeze({
${rows
  .map(
    (r) =>
      `  ${r.ticker}: ${jsValue(
        {
          fee_type: r.fee_type,
          fee_multiplier: r.fee_multiplier,
          category: r.category,
          title: r.title,
          volume_fp: r.volume_fp
        },
        null,
        0
      ).replace(/"/g, '"')},`
  )
  .join('\n')}
});

/** What was asked for, what was captured, what is missing — computed, not stored. */
export const FEE_REGISTRY_COVERAGE = Object.freeze(${jsValue({
    requested: needed.size,
    captured: rows.length,
    missing: missing.map((m) => m.ticker),
    capturedSeries: rows.map((r) => r.ticker),
    missingDetail: missing,
    prefixPatterns: prefixes
  }, null, 2)});

export default SERIES_FEE_REGISTRY;
`;

  fs.writeFileSync(OUT, body);
  console.log(`  wrote src/series-fee-registry.js — ${rows.length}/${needed.size} series with captured fees`);
  if (prefixes.length) {
    console.log(`  ticker prefixes in source (not series): ${prefixes.map((p) => p.ticker).join(', ')}`);
  }
  if (missing.length) {
    console.log(`  NOT captured (documented default applies, labelled): ${missing.map((m) => m.ticker).join(', ')}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
