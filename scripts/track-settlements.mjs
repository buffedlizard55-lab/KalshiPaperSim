#!/usr/bin/env node
/**
 * KalshiPaperSim — Settlement Tracker CLI
 * =====================================================================
 * Recommended-work item #3: poll Kalshi for the markets this competition holds
 * and report/settle them from the exchange's OWN status + result fields.
 *
 *   GET /markets/{ticker}   https://docs.kalshi.com/api-reference/market/get-market
 *   Market data is public; no API key is required for reads.
 *
 * Booking rule (conservative on purpose):
 *   finalized  + result yes/no  → SETTLED, payout $1.00 / $0.00 per contract
 *   determined/disputed/amended → PENDING_FINAL, nothing booked (a declared
 *                                 result can still be disputed or amended)
 *   anything else              → UNRESOLVED
 *   There is no settlement fee: https://kalshi.com/docs/kalshi-fee-schedule.pdf
 *
 * USAGE
 *   node scripts/track-settlements.mjs                    # tracked universe
 *   node scripts/track-settlements.mjs --tickers=A,B
 *   node scripts/track-settlements.mjs --positions=file.json   # also plan P&L
 *   node scripts/track-settlements.mjs --offline          # classify the captures
 *   node scripts/track-settlements.mjs --write            # save data/settlements.json
 *
 * NOTE: the build sandbox cannot open TLS connections to *.kalshi.com
 * (IRREGULARITIES.md #4). Use --offline there; run the live poll from a normal
 * network, cron, or the GitHub Actions workflow.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fetchMarketSettlements, buildSettlementPlan, classifySettlement, SETTLEMENT_FEE_USD } from '../src/settlement-tracker.js';
import { getVerifiedMarkets, CANDLESTICKS } from '../src/verified-snapshot.js';
import { EXTENDED_SERIES } from '../src/verified-candles.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILE = path.join(ROOT, 'data', 'settlements.json');

function parseArgs(argv) {
  const args = { tickers: null, positions: null, offline: false, write: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'tickers') args.tickers = v.split(',').map((s) => s.trim()).filter(Boolean);
    else if (k === 'positions') args.positions = v;
    else if (k === 'offline') args.offline = v !== 'false';
    else if (k === 'write') args.write = v !== 'false';
    else if (k === 'help' || k === 'h') args.help = true;
  }
  return args;
}

/** Every market the repository holds real data for. */
function trackedUniverse() {
  const tickers = new Set(Object.keys(CANDLESTICKS));
  for (const t of Object.keys(EXTENDED_SERIES)) tickers.add(t);
  // 2026-09-18: the ingest store is part of the universe too — including the
  // intraday weather brackets (KXHIGHNY) and 15-minute gold markets
  // (KXGOLD15M), which settle daily and are the repository's first markets
  // with real results. Without this, the settlement poll would miss them.
  for (const dir of [path.join(ROOT, 'data', 'history'), path.join(ROOT, 'data', 'history', 'intraday', '60m'), path.join(ROOT, 'data', 'history', 'intraday', '1m')]) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json') || file.startsWith('_')) continue;
      try {
        const store = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
        if (store && typeof store.ticker === 'string' && store.ticker) tickers.add(store.ticker);
      } catch {
        console.error(`⚠ unreadable store ${file} — skipped, never guessed`);
      }
    }
  }
  return [...tickers].sort();
}

/** A market object from the accumulated store, for tickers outside the snapshot. */
function storedMarket(ticker) {
  for (const dir of [path.join(ROOT, 'data', 'history'), path.join(ROOT, 'data', 'history', 'intraday', '60m'), path.join(ROOT, 'data', 'history', 'intraday', '1m')]) {
    const p = path.join(dir, `${ticker.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
    if (!fs.existsSync(p)) continue;
    try {
      const store = JSON.parse(fs.readFileSync(p, 'utf8'));
      if (store && store.market) return store.market;
    } catch {
      return null;
    }
  }
  return null;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('*/')[0]);
    return 0;
  }

  const tickers = args.tickers || trackedUniverse();
  let positions = [];
  if (args.positions) {
    positions = JSON.parse(fs.readFileSync(path.resolve(ROOT, args.positions), 'utf8'));
    if (!Array.isArray(positions)) throw new Error('--positions file must contain a JSON array of {ticker, side, count, avgCost}');
  }

  let report;
  if (args.offline) {
    const rows = tickers.map((t) => {
      const m = getVerifiedMarkets().find((x) => x.ticker === t) || storedMarket(t);
      return m
        ? { ticker: t, status: m.status, result: m.result, close_time: m.close_time, classification: classifySettlement(m), source: getVerifiedMarkets().some((x) => x.ticker === t) ? 'VERIFIED_SNAPSHOT' : 'ACCUMULATED_STORE' }
        : { ticker: t, error: 'not in the verified snapshot or the store', source: null };
    });
    report = { source: 'VERIFIED_SNAPSHOT', checkedAt: new Date().toISOString(), markets: rows, errors: [] };
  } else {
    report = await fetchMarketSettlements(tickers);
    report.source = report.errors.length === tickers.length ? 'LIVE_FAILED' : 'LIVE';
  }

  const plan = buildSettlementPlan(report.markets, positions);
  report.settlementPlan = plan;
  report.settlementFeeUsd = SETTLEMENT_FEE_USD;

  console.log(`\nSettlement status @ ${report.checkedAt} (source: ${report.source})`);
  for (const m of report.markets) {
    const c = m.classification || classifySettlement(m);
    console.log(`  ${m.ticker}\n     status=${m.status} result=${JSON.stringify(m.result)} → ${c.state}${c.result ? ` (${c.result})` : ''}\n     ${c.reason}`);
  }
  for (const e of report.errors) console.log(`  ✗ ${e.ticker}: ${e.error}`);

  if (positions.length) {
    console.log(`\nP&L plan for ${positions.length} supplied position(s):`);
    console.log(`  settled ${plan.totals.positions} position(s) · payout $${plan.totals.payout.toLocaleString('en-US', { minimumFractionDigits: 2 })} · realized P&L $${plan.totals.realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}`);
    console.log(`  pending-final ${plan.pending.length} · unresolved ${plan.unresolved.length} · settlement fees $${plan.totals.settlementFees}`);
  }

  if (args.write) {
    fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
    fs.writeFileSync(OUT_FILE, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`\nWrote ${path.relative(ROOT, OUT_FILE)}`);
  }

  if (report.source === 'LIVE_FAILED') {
    console.error(
      '\nEvery live request failed. If this is the build sandbox, direct TLS to *.kalshi.com is blocked there ' +
        '(IRREGULARITIES.md #4): run with --offline, or run the live poll from a normal network.'
    );
    return 1;
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => process.exit(code)).catch((err) => {
    console.error(`track-settlements failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}
