#!/usr/bin/env node
/**
 * KalshiPaperSim — run the Desk SEASON and audit it
 * =====================================================================
 * The Live Desk runs one session at one cut-off. This script runs the CARRIED
 * book: every round is a real capture batch from the store, cash and positions
 * carry between them, resting orders stay alive across rounds, and the book is
 * marked at every boundary and settled by the exchange where a contract really
 * finalized.
 *
 * Every fill is then RE-DERIVED from the source data by the season audit
 * (26 checks: the 13 single-session desk invariants D1–D13 plus S1–S11, which
 * only a carried book can violate). If a single price, size, fee, mark or
 * settlement disagrees with the capture it came from, this script fails.
 *
 * OUTPUTS (all repo-tracked, all reproducible)
 *   data/reports/desk-season.json          rounds, results, equity curves, explanations, audit
 *   data/reports/desk-season-ledger.jsonl  one JSON object per order/rest/fill/mark/settlement/cancel
 *   data/reports/desk-season-schedule.json the rounds (real capture instants) and the rule set
 *
 * USAGE
 *   node scripts/run-desk-season.mjs [--capital=100000] [--max-rounds=12]
 *                                    [--spacing-minutes=0] [--batch-minutes=5] [--quiet]
 *
 * EXIT CODE: 0 when the audit passes, 1 when any check fails (so CI can gate on
 * it), 2 when no round could be built at all (the store holds no ladders).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { DESK_DATA } from '../src/desk-data.js';
import { SEASON_STRATEGIES } from '../src/desk-season-strategies.js';
import {
  runDeskSeason,
  seasonSchedule,
  seasonLedgerJsonl,
  seasonAuditorFacts,
  describeSeasonAudit,
  SEASON_RULE,
  SEASON_VERSION
} from '../src/desk-season.js';
import { auditorFacts } from '../src/live-desk.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REPORTS = path.join(ROOT, 'data', 'reports');

function arg(name, fallback = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split('=').slice(1).join('=') : fallback;
}
const QUIET = process.argv.includes('--quiet');
const log = (...a) => { if (!QUIET) console.log(...a); };

const capital = Number(arg('capital', 100000));
const maxRounds = Number(arg('max-rounds', 12));
const minSpacingMinutes = Number(arg('spacing-minutes', 0));
const batchMinutes = Number(arg('batch-minutes', 5));

fs.mkdirSync(REPORTS, { recursive: true });

let schedule;
try {
  schedule = seasonSchedule({ data: DESK_DATA, minSpacingMinutes, maxRounds, batchMinutes });
} catch (err) {
  console.error(`desk-season: could not build a schedule: ${err.message}`);
  process.exit(2);
}
if (!schedule.rounds.length) {
  console.error('desk-season: no capture instant in the store can host a round (no ladders captured)');
  process.exit(2);
}

let season;
try {
  season = runDeskSeason({
    data: DESK_DATA,
    strategies: SEASON_STRATEGIES,
    rounds: schedule.rounds,
    startingCapital: capital,
    minSpacingMinutes,
    maxRounds
  });
} catch (err) {
  console.error(`desk-season: could not run the season: ${err.message}`);
  process.exit(2);
}

const report = {
  generatedAt: new Date().toISOString(),
  seasonVersion: SEASON_VERSION,
  dataGeneratedAt: DESK_DATA.generatedAt,
  dataCoverage: DESK_DATA.coverage,
  newestCapture: season.newestCapture,
  startingCapital: capital,
  rule: SEASON_RULE,
  docs: DESK_DATA.docs,
  endpoints: DESK_DATA.endpoints,
  schedule: {
    derived: Boolean(schedule.derived),
    rounds: season.rounds.map((r) => ({
      index: r.index,
      label: r.label,
      asOf: r.asOf,
      tradeable: r.universe?.tradeable ?? null,
      notTradeable: r.universe?.notTradeable ?? null,
      marketsWithLadder: r.marketsWithLadder,
      newLadderCaptures: r.newLadderCaptures,
      gapHoursFromPrev: r.gapHoursFromPrev,
      isNewestCapture: Boolean(r.isNewestCapture),
      eventsApplied: r.eventsApplied,
      settlementsInWindow: r.settlementsInWindow,
      makerFillsCarriedIn: r.makerFillsCarriedIn
    })),
    rule: season.schedule.rule,
    batches: season.schedule.batches,
    consideredInstants: season.schedule.consideredInstants,
    candidateRounds: season.schedule.candidateRounds,
    thinned: season.schedule.thinned
  },
  results: season.results,
  summary: {
    totals: season.audit.totals,
    ranked: season.results.filter((r) => r.fills > 0 || r.settlementPnl !== 0).length,
    unranked: season.results.filter((r) => !(r.fills > 0 || r.settlementPnl !== 0)).length
  },
  explanations: season.explanations,
  coverage: season.coverage,
  audit: {
    ok: season.audit.ok,
    checkedAt: season.audit.checkedAt,
    totals: season.audit.totals,
    checks: season.audit.checks,
    mismatches: season.audit.mismatches
  }
};

fs.writeFileSync(path.join(REPORTS, 'desk-season.json'), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(REPORTS, 'desk-season-ledger.jsonl'), seasonLedgerJsonl(season.records));
fs.writeFileSync(
  path.join(REPORTS, 'desk-season-schedule.json'),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      newestCapture: season.newestCapture,
      rounds: report.schedule.rounds,
      rule: SEASON_RULE,
      deskFacts: auditorFacts(),
      seasonFacts: seasonAuditorFacts()
    },
    null,
    2
  )
);

log(`desk-season · ${season.rounds.length} real capture round(s) · ${season.newestCapture} newest capture`);
for (const r of season.rounds) {
  log(
    `  ${r.label} ${r.asOf}  tradeable=${String(r.universe?.tradeable ?? '—').padStart(3)}  ` +
    `newLadders=${String(r.newLadderCaptures ?? '—').padStart(3)}  events=${String(r.eventsApplied?.quotes ?? 0).padStart(4)} quote(s) ` +
    `+ ${r.eventsApplied?.settlements ?? 0} settlement(s)  carriedMakerFills=${r.makerFillsCarriedIn ?? 0}`
  );
}
for (const res of season.results) {
  log(
    `  ${res.strategy.padEnd(26)} ${(res.returnPct >= 0 ? '+' : '') + res.returnPct.toFixed(4)}%  ` +
    `equity=$${res.equity.toFixed(2)} fills=${String(res.fills).padStart(3)} rounds=${res.roundsTraded}/${season.rounds.length} ` +
    `settle=$${res.settlementPnl.toFixed(2)} unreal=$${res.unrealizedPnl.toFixed(2)} fees=$${res.feesPaid.toFixed(4)} dd=${res.maxDrawdownPct.toFixed(3)}%`
  );
}
log(describeSeasonAudit(season.audit));
if (!season.audit.ok) {
  for (const m of season.audit.mismatches) console.error(`  FAILED: ${m.name} — ${m.detail}`);
  process.exit(1);
}
log(
  `wrote data/reports/desk-season.json, desk-season-ledger.jsonl (${season.records.length} records), ` +
  'desk-season-schedule.json'
);
