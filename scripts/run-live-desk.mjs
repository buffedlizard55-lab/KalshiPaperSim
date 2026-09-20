#!/usr/bin/env node
/**
 * KalshiPaperSim — run the Live Desk and audit it
 * =====================================================================
 * Places every desk strategy's paper orders against the REAL captured Kalshi
 * ladders at a point-in-time cut-off, walks forward through later real quotes,
 * real bars and the exchange's own settlements, and then RE-DERIVES every fill
 * from the source data. If a single price, size, fee or settlement disagrees
 * with the capture it came from, this script fails.
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
  auditorFacts,
  buildDeskSignalsAsync
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

async function main() {
  /* ------------------------------------------------------------------ *
   * 1. Cut-off analytics
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
        : 'no market has a captured ladder before this cut-off in the current store — the desk refuses to price anything here'
    });
  }

  /* ------------------------------------------------------------------ *
   * 2. Run the desk (async — builds the point-in-time signal providers)
   * ------------------------------------------------------------------ */

  const chosen = asOf || newest;
  let desk;
  try {
    const asOfMs = chosen ? Date.parse(chosen) : null;
    const signals = Number.isFinite(asOfMs) ? await buildDeskSignalsAsync(asOfMs) : {};
    desk = await runDeskSession({ data: DESK_DATA, strategies, asOf: chosen, startingCapital: capital, signals });
  } catch (err) {
    console.error(`live-desk: could not run at ${chosen}: ${err.message}`);
    console.error(err.stack);
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
    for (const f of ['live-desk.json', 'live-desk-placed-trades.json', 'live-desk-upcoming-trades.json']) {
      fs.copyFileSync(path.join(REPORTS, f), path.join(DOCS_REPORTS, f));
    }
  }

  log(`live-desk: ${summary.totals.orders} orders · ${summary.totals.fills} fills · ${summary.totals.settlements} settlements · $${summary.totals.fees.toFixed(4)} fees`);
  log(describeAudit(audit));
  if (!audit.ok) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
