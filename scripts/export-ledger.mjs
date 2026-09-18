#!/usr/bin/env node
/**
 * KalshiPaperSim — Export the Verified Trade Ledger
 * =====================================================================
 * Runs the competition (all flights, deterministic seed), builds the ledger
 * of every fill and every round trip, VERIFIES it against the engine's own
 * output, and writes it to disk in the compact tuple form documented in
 * src/trade-ledger.js.
 *
 * Outputs
 *   data/ledger/ledger-<seed>.json     the full ledger (fills + round trips)
 *   data/ledger/summary.json           per-strategy totals + the verification
 *                                      result, for quick reading and diffs
 *   docs/data/ledger.json              browser-safe slice for the Pages site
 *
 * WHAT IT REFUSES TO DO
 *   • It never writes a ledger row the engine did not produce.
 *   • It never writes a ledger whose rows cannot be re-derived (verifyLedger
 *     throws, the script exits non-zero, and nothing is written).
 *   • It never trims silently: every capped section records what was dropped.
 *
 * USAGE
 *   node scripts/export-ledger.mjs                 # seed 20260917, all flights
 *   node scripts/export-ledger.mjs --seed=7 --max-fills=20000
 *   node scripts/export-ledger.mjs --verify-only   # re-verify a stored ledger
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runCompetition, runCompetitionFlights } from '../src/strategy-runner.js';
import { STRATEGIES } from '../src/strategies.js';
import {
  buildLedger,
  verifyLedger,
  summarizeLedger,
  feeRegimeBreakdown,
  internLedger,
  expandLedger,
  FILL_COLUMNS,
  ROUND_TRIP_COLUMNS,
  LEDGER_VERSION
} from '../src/trade-ledger.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER_DIR = path.join(ROOT, 'data', 'ledger');
const DOCS_FILE = path.join(ROOT, 'docs', 'data', 'ledger.json');

function parseArgs(argv) {
  const args = { seed: 20260917, maxFills: 40000, maxTrips: 20000, verifyOnly: false, flights: true, quiet: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'seed') args.seed = Number(v);
    else if (k === 'max-fills') args.maxFills = Number(v);
    else if (k === 'max-trips') args.maxTrips = Number(v);
    else if (k === 'verify-only') args.verifyOnly = v !== 'false';
    else if (k === 'flights') args.flights = v !== 'false';
    else if (k === 'quiet') args.quiet = v !== 'false';
  }
  return args;
}

/**
 * Pretty JSON for anything a human reads; COMPACT JSON for the ledger itself.
 * A fill row is a tuple — indenting 30,000 tuples turns a ~5 MB dataset into a
 * ~19 MB file that diffs horribly. The ledger is data, so it is stored dense
 * and left to the schema header (FILL_COLUMNS) to explain itself.
 */
function writeJson(file, obj, { pretty = true } = {}) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, pretty ? `${JSON.stringify(obj, null, 1)}\n` : `${JSON.stringify(obj)}\n`);
}

/** Collect every run (with its flight label) from a flights object. */
function collectRuns(flights, dailyCompetition) {
  const runs = [];
  const add = (comp, flight) => {
    for (const r of comp?.results || []) runs.push({ ...r, flight });
  };
  if (dailyCompetition) add(dailyCompetition, 'daily');
  if (flights) {
    // runCompetitionFlights returns the daily competition too; keep each run
    // once, labelled with the flight it was judged in.
    if (flights.hourly && !dailyCompetition) add(flights.hourly, 'hourly');
    else if (flights.hourly) add(flights.hourly, 'hourly');
    if (flights.micro) add(flights.micro, 'micro');
  }
  return runs;
}

async function main() {
  const args = parseArgs(process.argv);
  const generatedAt = new Date().toISOString();

  if (args.verifyOnly) {
    const file = path.join(LEDGER_DIR, `ledger-${args.seed}.json`);
    if (!fs.existsSync(file)) {
      console.error(`✗ no stored ledger at ${path.relative(ROOT, file)} — run without --verify-only first`);
      return 1;
    }
    const stored = expandLedger(JSON.parse(fs.readFileSync(file, 'utf8')));
    console.log(`Ledger ${path.relative(ROOT, file)}: ${stored.fills.length} fills, ${stored.roundTrips.length} round trips`);
    const withDates = stored.fills.filter((f) => f[8]).length;
    const withPx = stored.fills.filter((f) => Number(f[12]) > 0 && f[17] != null).length;
    const priced = stored.fills.filter((f) => Number(f[12]) > 0).length;
    console.log(`  fills carrying a verified market date: ${withDates}/${stored.fills.length}`);
    console.log(`  filled rows carrying an executed price: ${withPx}/${priced}`);
    if (withDates !== stored.fills.length) {
      console.error('✗ some fills carry no verified market date — the ledger is not auditable');
      return 1;
    }
    if (withPx !== priced) {
      console.error('✗ some filled rows carry no executed price — the ledger is not auditable');
      return 1;
    }
    console.log('✓ every fill carries a real market period (ts + ISO date) and a price');
    return 0;
  }

  console.log(`Running the competition (seed ${args.seed}) to build the trade ledger…`);
  const flights = runCompetitionFlights({ seed: args.seed });
  const daily = flights.daily;
  const runs = collectRuns(flights, daily);
  console.log(
    `  flights: daily=${flights.daily ? flights.daily.results.length : 0}` +
      `, hourly=${flights.hourly ? flights.hourly.results.length : 0}` +
      `, micro=${flights.micro ? flights.micro.results.length : 0}` +
      (flights.hourlyError ? ` (hourly unavailable: ${flights.hourlyError})` : '') +
      (flights.microError ? ` (micro unavailable: ${flights.microError})` : '')
  );

  const provenance = {
    seed: args.seed,
    generatedAt,
    engine: 'ReplayEngine (deterministic, seeded)',
    flights: {
      daily: daily ? { period: 1440, strategies: daily.results.length, markets: daily.competition.dataProvenance.markets.length } : null,
      hourly: flights.hourly ? { period: 60, strategies: flights.hourly.results.length } : null,
      micro: flights.micro ? { period: 1, strategies: flights.micro.results.length } : null
    },
    sources: {
      candlesticks: 'GET /series/{series_ticker}/markets/{ticker}/candlesticks',
      candlesticksDocs: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
      orderbook: 'GET /markets/{ticker}/orderbook',
      orderbookDocs: 'https://docs.kalshi.com/getting_started/orderbook_responses',
      fees: 'https://docs.kalshi.com/getting_started/fee_schedule'
    },
    dateRule:
      'Every fill is stamped with the REAL market period it traded in (the candlestick end_period_ts of the bar the replay was standing on), not with the wall-clock time of the run.',
    liquidityRule:
      'barVolume is the contracts that really traded in that bar (volume_fp). The engine caps every fill at maxFillFractionOfPeriodVolume (default 10%) of it; the remainder is reported as unfilled.'
  };

  const ledger = buildLedger(runs, { generatedAt, provenance });
  console.log(`  ${ledger.fills.length} fills, ${ledger.roundTrips.length} round trips`);

  // The anti-hallucination gate: re-derive everything and compare.
  const verification = verifyLedger(ledger, runs, { generatedAt, provenance });
  if (!verification.ok) {
    console.error('✗ LEDGER VERIFICATION FAILED — nothing written:');
    for (const p of verification.problems.slice(0, 10)) console.error(`   ${p}`);
    return 1;
  }
  console.log('✓ ledger re-derived from the engine trade logs, field for field');

  // Bounded storage: keep the newest N of each, and RECORD what was dropped.
  const trims = [];
  if (ledger.fills.length > args.maxFills) {
    const dropped = ledger.fills.length - args.maxFills;
    trims.push({ section: 'fills', kept: args.maxFills, dropped, reason: `--max-fills=${args.maxFills}` });
    ledger.fills = ledger.fills.slice(0, args.maxFills);
  }
  if (ledger.roundTrips.length > args.maxTrips) {
    const dropped = ledger.roundTrips.length - args.maxTrips;
    trims.push({ section: 'roundTrips', kept: args.maxTrips, dropped, reason: `--max-trips=${args.maxTrips}` });
    ledger.roundTrips = ledger.roundTrips.slice(0, args.maxTrips);
  }
  ledger.trims = trims;

  const summary = {
    ledgerVersion: LEDGER_VERSION,
    generatedAt,
    seed: args.seed,
    provenance,
    verification: {
      ok: verification.ok,
      problems: verification.problems,
      checks: [
        'every fill re-derived from the engine trade log, field for field',
        'every round trip re-derived by FIFO lot matching',
        'every fill carries a verified market period (ts + ISO date)',
        'realized PnL per strategy reconciles with the engine within $0.02'
      ]
    },
    trims,
    columns: { fills: FILL_COLUMNS, roundTrips: ROUND_TRIP_COLUMNS },
    totals: ledger.totals,
    feeRegimes: feeRegimeBreakdown(ledger),
    strategies: summarizeLedger(ledger)
  };
  // Dictionary-encode the repetitive string columns before writing (measured
  // ~14 MB → a few MB with no information lost; see INTERN_FILL_COLUMNS).
  const encoded = internLedger(ledger);
  writeJson(path.join(LEDGER_DIR, `ledger-${args.seed}.json`), encoded, { pretty: false });
  writeJson(path.join(LEDGER_DIR, 'summary.json'), summary);

  // Browser-safe slice: the summary plus a bounded sample of round trips so the
  // Pages site can show real trades without shipping megabytes.
  const sample = ledger.roundTrips.slice(0, 1500);
  writeJson(DOCS_FILE, {
    ledgerVersion: LEDGER_VERSION,
    generatedAt,
    seed: args.seed,
    columns: { roundTrips: ROUND_TRIP_COLUMNS },
    sampleSize: sample.length,
    sampleTruncated: ledger.roundTrips.length > sample.length,
    roundTrips: sample,
    strategies: summary.strategies,
    feeRegimes: summary.feeRegimes,
    verification: summary.verification,
    provenance
  });

  const withDates = ledger.fills.filter((f) => f[8]).length;
  console.log(`✓ ${withDates}/${ledger.fills.length} fills carry a verified market date`);
  console.log(`Wrote ${path.relative(ROOT, path.join(LEDGER_DIR, 'summary.json'))} and ${path.relative(ROOT, DOCS_FILE)}`);
  if (trims.length) console.log(`  (bounded: ${JSON.stringify(trims)})`);
  return 0;
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`✗ ledger export crashed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
