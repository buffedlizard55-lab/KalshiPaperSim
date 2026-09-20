#!/usr/bin/env node
/**
 * KalshiPaperSim — run the Live Desk and audit it
 * =====================================================================
 * Places every desk strategy's paper orders against the REAL captured Kalshi
 * ladders at a point-in-time cut-off, walks forward through later real quotes,
 * real bars and the exchange's own settlements, and then RE-DERIVES every fill
 * from the source data. If a single price, size, fee or settlement disagrees
 * with the capture it came from, this script fails.
 *
 * OUTPUTS (all repo-tracked, all reproducible)
 *   data/reports/live-desk.json         results, explanations, coverage, audit
 *   data/reports/live-desk-ledger.jsonl one JSON object per order/fill/mark/settlement
 *   data/reports/live-desk-universe.json the tradeable universe at the cut-off
 *   data/reports/live-desk-cutoffs.json  which cut-offs have real ladders + settlements
 *
 * USAGE
 *   node scripts/run-live-desk.mjs [--as-of=2026-09-18T03:46:22Z] [--strategies=all]
 *                                  [--capital=100000] [--quiet]
 *
 * EXIT CODE: 0 when the audit passes, 1 when any check fails (so CI can gate on
 * it), 2 when the desk could not run at all (no ladder in range).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DESK_DATA } from '../src/desk-data.js';
import {
  buildDeskUniverse,
  runDeskSession,
  deskLedgerJsonl,
  summarizeDesk,
  describeAudit,
  DESK_LIMITS,
  auditorFacts
} from '../src/live-desk.js';
import { DESK_STRATEGIES } from '../src/desk-strategies.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'data', 'reports');

function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}
const QUIET = process.argv.includes('--quiet');
const log = (...a) => { if (!QUIET) console.log(...a); };

const asOf = arg('as-of', null);
const capital = Number(arg('capital', 100000));
const strategies = DESK_STRATEGIES;

fs.mkdirSync(REPORTS, { recursive: true });

/* ------------------------------------------------------------------ *
 * 1. Cut-off analytics — which cut-offs actually have real ladders?
 * ------------------------------------------------------------------ */

const newest = DESK_DATA.coverage?.newestCapture || null;
const newestMs = newest ? Date.parse(newest) : null;
const CUTOFFS = [
  { label: 'live (newest capture)', asOf: newest },
  ...(Number.isFinite(newestMs)
    ? [6, 12, 15, 24, 48, 96, 240].map((h) => ({
        label: `-${h}h`,
        asOf: new Date(newestMs - h * 3600 * 1000).toISOString()
      }))
    : [])
];

const cutoffReport = [];
for (const c of CUTOFFS) {
  const u = buildDeskUniverse({ asOf: c.asOf });
  const tradeable = u.markets.filter((m) => m.tradeable);
  const settlements = u.markets.filter((m) => m.isFinal && m.settlementTs && Date.parse(m.settlementTs) > Date.parse(c.asOf));
  cutoffReport.push({
    label: c.label,
    asOf: u.asOf,
    tradeable: tradeable.length,
    withRealResultAfter: settlements.length,
    settlementTickers: settlements.slice(0, 10).map((m) => m.ticker),
    sampleTickers: tradeable.slice(0, 10).map((m) => m.ticker),
    note: tradeable.length
      ? 'a real captured ladder exists at or before this cut-off for every ticker listed'
      : 'no market has a captured ladder before this cut-off in the current store — the desk refuses to price anything here (it will not use a later ladder)'
  });
}

/* ------------------------------------------------------------------ *
 * 2. Run the desk
 * ------------------------------------------------------------------ */

const chosen = asOf || newest;
let desk;
try {
  desk = runDeskSession({ data: DESK_DATA, strategies, asOf: chosen, startingCapital: capital });
} catch (err) {
  console.error(`live-desk: could not run at ${chosen}: ${err.message}`);
  process.exit(2);
}

const universe = buildDeskUniverse({ asOf: chosen });
const summary = summarizeDesk(desk);
const audit = desk.audit;

/* ------------------------------------------------------------------ *
 * 3. Write the artifacts
 * ------------------------------------------------------------------ */

const report = {
  generatedAt: new Date().toISOString(),
  deskVersion: desk.version,
  asOf: desk.asOf,
  startingCapital: capital,
  limits: DESK_LIMITS,
  dataGeneratedAt: DESK_DATA.generatedAt,
  dataCoverage: DESK_DATA.coverage,
  rule: DESK_DATA.rule,
  docs: DESK_DATA.docs,
  endpoints: DESK_DATA.endpoints,
  universe: {
    inUniverse: universe.markets.length,
    tradeable: universe.markets.filter((m) => m.tradeable).length,
    notTradeable: universe.markets.filter((m) => !m.tradeable).length,
    openAtAsOf: universe.markets.filter((m) => m.isOpen).length,
    ladderCaptures: universe.markets.reduce((s, m) => s + m.captureCount, 0),
    totalRealYesDepth: Math.round(universe.markets.reduce((s, m) => s + (m.ladder?.yes?.totalCount || 0), 0)),
    totalRealNoDepth: Math.round(universe.markets.reduce((s, m) => s + (m.ladder?.no?.totalCount || 0), 0)),
    quotedWithoutLadder: universe.quotedOnly.length,
    markets: universe.markets.map((m) => ({
      ticker: m.ticker,
      series: m.seriesTicker,
      title: m.title,
      status: m.status,
      isOpen: m.isOpen,
      closeTime: m.closeTime,
      expirationTime: m.expirationTime,
      tradeable: m.tradeable,
      notTradeableReason: m.notTradeableReason,
      feeMultiplier: m.feeMultiplier,
      feeType: m.feeType,
      tick: m.tick,
      ladderAt: m.ladderAt,
      ladderUrl: m.ladderUrl,
      marketCapturedAt: m.marketCapturedAt,
      marketUrl: m.marketUrl,
      lookAheadFields: m.lookAheadFields,
      yesBest: m.ladder?.yes?.best ?? null,
      noBest: m.ladder?.no?.best ?? null,
      yesDepth: m.ladder?.yes?.totalCount ?? null,
      noDepth: m.ladder?.no?.totalCount ?? null,
      volume24h: m.volume24h,
      openInterest: m.openInterest,
      lifetimeVolume: m.volume
    }))
  },
  cutoffAnalytics: cutoffReport,
  summary,
  results: desk.results,
  explanations: desk.explanations,
  placedTrades: desk.placedTrades || [],
  upcomingTrades: desk.upcomingTrades || [],
  coverage: desk.coverage,
  audit: {
    ok: audit.ok,
    checkedAt: audit.checkedAt,
    totals: audit.totals,
    checks: audit.checks,
    mismatches: audit.mismatches
  }
};

fs.writeFileSync(path.join(REPORTS, 'live-desk.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(REPORTS, 'live-desk-placed-trades.json'), JSON.stringify(desk.placedTrades || [], null, 2));
fs.writeFileSync(path.join(REPORTS, 'live-desk-upcoming-trades.json'), JSON.stringify(desk.upcomingTrades || [], null, 2));
fs.writeFileSync(path.join(REPORTS, 'live-desk-ledger.jsonl'), deskLedgerJsonl(desk.records));
fs.writeFileSync(
  path.join(REPORTS, 'live-desk-universe.json'),
  JSON.stringify({ asOf: universe.asOf, coverage: universe.coverage, markets: report.universe.markets, quotedOnly: universe.quotedOnly }, null, 2)
);
fs.writeFileSync(path.join(REPORTS, 'live-desk-cutoffs.json'), JSON.stringify({ newestCapture: newest, cutoffs: cutoffReport, audits: auditorFacts() }, null, 2));

const DOCS_REPORTS = path.join(ROOT, 'docs', 'data', 'reports');
if (fs.existsSync(DOCS_REPORTS)) {
  fs.copyFileSync(path.join(REPORTS, 'live-desk.json'), path.join(DOCS_REPORTS, 'live-desk.json'));
  fs.copyFileSync(path.join(REPORTS, 'live-desk-placed-trades.json'), path.join(DOCS_REPORTS, 'live-desk-placed-trades.json'));
  fs.copyFileSync(path.join(REPORTS, 'live-desk-upcoming-trades.json'), path.join(DOCS_REPORTS, 'live-desk-upcoming-trades.json'));
  fs.copyFileSync(path.join(REPORTS, 'live-desk-universe.json'), path.join(DOCS_REPORTS, 'live-desk-universe.json'));
  fs.copyFileSync(path.join(REPORTS, 'live-desk-cutoffs.json'), path.join(DOCS_REPORTS, 'live-desk-cutoffs.json'));
}

/* ------------------------------------------------------------------ *
 * 4. Report
 * ------------------------------------------------------------------ */

log(`live-desk · cut-off ${desk.asOf} · ${report.universe.tradeable}/${report.universe.inUniverse} contracts tradeable on real captured ladders`);
log(`positions: ${summary.totals.orders} order(s), ${summary.totals.fills} fill(s), ${summary.totals.settlements} real settlement(s), ${summary.totals.cancels} unfilled resting order(s) cancelled`);
for (const r of desk.results) {
  log(
    `  ${r.strategy.padEnd(24)} ${(r.returnPct >= 0 ? '+' : '') + r.returnPct.toFixed(4)}%  ` +
    `fills=${String(r.fills).padStart(3)} contracts=${String(r.contracts).padStart(10)} unfilled=${String(r.unfilled).padStart(10)} ` +
    `fees=$${r.feesPaid.toFixed(4)} settle=$${r.settlementPnl.toFixed(2)}`
  );
}
log(describeAudit(audit));
if (!audit.ok) {
  for (const m of audit.mismatches) console.error(`  FAILED: ${m.name} — ${m.detail}`);
  process.exit(1);
}
log(`wrote data/reports/live-desk.json, live-desk-ledger.jsonl (${desk.records.length} records), live-desk-universe.json, live-desk-cutoffs.json`);
