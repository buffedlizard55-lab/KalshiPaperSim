#!/usr/bin/env node
/**
 * KalshiPaperSim — Curate the intraday store (with a full audit ledger)
 * =====================================================================
 * WHY THIS EXISTS
 *   The first intraday run inherited the daily workflow's `--series=` flag and
 *   ingested EVERY open market of three series at 60-minute granularity: 117
 *   markets / 40,039 bars / 22 MB, refreshed on every future run (≈1.3 MB per
 *   day of growth, ~630 HTTP requests per run). Most of those markets never
 *   traded a single contract.
 *
 *   This script restricts the intraday store to the markets named in
 *   data/history/_ingest-request.json → intraday.tickers and writes
 *   data/history/intraday/<period>m/_prune-ledger.json recording, for every
 *   removed market: the ticker, the bars removed, their real timestamp range,
 *   the store file, and the exact URLs that can restore them.
 *
 *   Nothing is discovered, inferred or "cleaned": the ledger is a complete
 *   list of what was dropped, so a reviewer can see exactly what is missing
 *   and re-fetch it in one command.
 *
 * USAGE
 *   node scripts/prune-intraday.mjs --period=60            # apply the request's tickers
 *   node scripts/prune-intraday.mjs --period=60 --dry-run  # show what would be removed
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { periodDir, readIngestRequest, windowDaysFor } from './ingest-history.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  const args = { period: 60, dryRun: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'period') args.period = Number(v);
    else if (k === 'dry-run') args.dryRun = v !== 'false';
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const dir = periodDir(args.period);
  if (!fs.existsSync(dir)) {
    console.error(`No intraday store at ${path.relative(ROOT, dir)} — nothing to prune.`);
    return 0;
  }
  const request = readIngestRequest();
  const keep = new Set(request?.intraday?.tickers || []);
  if (keep.size === 0) {
    console.error(
      'data/history/_ingest-request.json → intraday.tickers is empty. Refusing to prune: without an explicit ' +
        'curated list this script would delete either everything or nothing, and neither is obviously right.'
    );
    return 1;
  }

  const removed = [];
  const kept = [];
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    const full = path.join(dir, file);
    let store = null;
    try {
      store = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (err) {
      console.error(`⚠ ${file}: unreadable (${err.message}) — left in place for review, never guessed`);
      continue;
    }
    const ticker = store.ticker || file.replace(/\.json$/, '');
    const bars = store.candlesticks || [];
    if (keep.has(ticker)) {
      kept.push({ ticker, bars: bars.length, file: path.relative(ROOT, full) });
      continue;
    }
    const volume = Number(store.market?.volume_fp ?? 0);
    removed.push({
      ticker,
      bars: bars.length,
      first_ts: bars.length ? Number(bars[0].end_period_ts) : null,
      first_bar: bars.length ? new Date(Number(bars[0].end_period_ts) * 1000).toISOString() : null,
      last_bar: bars.length ? new Date(Number(bars[bars.length - 1].end_period_ts) * 1000).toISOString() : null,
      period_interval: store.period_interval ?? args.period,
      lifetime_volume_fp: Number.isFinite(volume) ? volume : null,
      file: path.relative(ROOT, full),
      store_url: store.last_ingest_url || null,
      restore_with:
        `node scripts/ingest-history.mjs --period=${store.period_interval ?? args.period} --with-market=true ` +
        `--days=${windowDaysFor(store.period_interval ?? args.period)} --tickers=${ticker} --max-bars=${request?.intraday?.max_bars ?? 0}`
    });
    if (!args.dryRun) fs.rmSync(full);
  }

  const ledgerPath = path.join(dir, '_prune-ledger.json');
  let previous = [];
  if (fs.existsSync(ledgerPath)) {
    try {
      previous = JSON.parse(fs.readFileSync(ledgerPath, 'utf8')).removed || [];
    } catch {
      previous = [];
    }
  }
  const ledger = {
    updatedAt: new Date().toISOString(),
    reason:
      'The intraday pass of 2026-09-18 inherited the daily workflow\'s --series flag and ingested every open market of ' +
      'KXINXY/KXNASDAQ100Y/KXBTCY (117 markets, 40,039 bars, 22 MB, mostly zero-volume strikes). The intraday store is ' +
      'now restricted to the explicit curated list in data/history/_ingest-request.json → intraday.tickers.',
    curatedTickers: [...keep].sort(),
    keptCount: kept.length,
    kept,
    removedCount: removed.length,
    removedBars: removed.reduce((s, r) => s + r.bars, 0),
    removed,
    previouslyRemoved: previous,
    restoreNote:
      'Every removed market can be re-fetched from the official API with the `restore_with` command recorded next to it. ' +
      'These are real bars that were captured; nothing about them was invalid, they are simply outside the curated universe.'
  };
  if (!args.dryRun) fs.writeFileSync(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);

  console.log(
    `${args.dryRun ? '[dry-run] ' : ''}kept ${kept.length} curated market(s); ` +
      `${args.dryRun ? 'would remove' : 'removed'} ${removed.length} market(s) / ${ledger.removedBars} bar(s)` +
      (args.dryRun ? '' : ` → ${path.relative(ROOT, ledgerPath)}`)
  );
  for (const k of kept) console.log(`  ✓ ${k.ticker}: ${k.bars} bar(s)`);
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`prune-intraday failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { main };
