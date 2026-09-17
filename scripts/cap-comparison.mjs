#!/usr/bin/env node
/**
 * KalshiPaperSim — Per-market capital allocation comparison
 * =====================================================================
 * Recommended-work item #7: "cross-market exposure is now measured; the next
 * step is to compare how the 'highest return' mandate behaves with and without
 * per-market caps."
 *
 * This job replays the whole roster under several per-market notional caps and
 * reports what the cap costs (or saves) each strategy. It writes
 * data/reports/cap-comparison.json and prints a table.
 *
 * Everything here is COMPUTED by the same deterministic replay engine the site
 * uses (src/backtest-replay.js); nothing is hard-coded. The cap is OFF by
 * default in the competition itself because the brief is "highest return only"
 * — this script exists to quantify what that mandate leaves on the table.
 *
 * USAGE
 *   node scripts/cap-comparison.mjs                  # default caps and seeds
 *   node scripts/cap-comparison.mjs --caps=1,0.25    # explicit caps (1 = no cap)
 *   node scripts/cap-comparison.mjs --seeds=20260917
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { runCompetition, getCandleCoverage, getHistoryAudit } from '../src/strategy-runner.js';
import { STRATEGIES } from '../src/strategies.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'data', 'reports', 'cap-comparison.json');

function parseArgs(argv) {
  const args = { caps: [null, 0.5, 0.25, 0.1], seeds: [20260917, 7, 42], quiet: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'caps') args.caps = v.split(',').map((s) => (s.trim() === '1' || s.trim() === 'none' ? null : Number(s)));
    else if (k === 'seeds') args.seeds = v.split(',').map((s) => Number(s.trim()));
    else if (k === 'quiet') args.quiet = v !== 'false';
  }
  return args;
}

const money = (n) => `$${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const pct = (n) => `${Number(n || 0) >= 0 ? '+' : ''}${Number(n || 0).toFixed(2)}%`;

function main() {
  const args = parseArgs(process.argv);
  const coverage = getCandleCoverage();
  const audit = getHistoryAudit();
  const rows = [];

  for (const cap of args.caps) {
    for (const seed of args.seeds) {
      const t0 = Date.now();
      const comp = runCompetition({ seed, maxNotionalPerMarketPct: cap });
      for (const r of comp.results) {
        rows.push({
          cap: cap === null ? null : cap,
          capLabel: cap === null ? 'no cap' : `${Math.round(cap * 100)}% per market`,
          seed,
          username: r.username,
          returnPct: r.returnPct,
          finalEquity: r.finalEquity,
          maxDrawdownPct: r.maxDrawdownPct,
          trades: r.totalTrades,
          feesPaid: r.feesPaid,
          unfilledContracts: r.unfilledContracts,
          cappedOrders: r.cappedOrders || 0,
          cappedContracts: r.cappedContracts || 0,
          periods: r.periods,
          ranked: comp.leaderboard.find((l) => l.username === r.username)?.rank ?? null
        });
      }
      if (!args.quiet) {
        console.log(`cap=${cap === null ? 'none' : cap} seed=${seed}: ${comp.results.length} strategies in ${Date.now() - t0} ms`);
      }
    }
  }

  // Per-strategy comparison against the uncapped baseline on the same seed.
  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.username)) byUser.set(r.username, []);
    byUser.get(r.username).push(r);
  }
  const strategies = [];
  for (const [username, list] of byUser) {
    const baseline = list.filter((r) => r.cap === null);
    const summary = { username, runs: list.length, baseline: null, caps: [] };
    if (baseline.length) {
      summary.baseline = {
        returnPct: avg(baseline.map((r) => r.returnPct)),
        maxDrawdownPct: avg(baseline.map((r) => r.maxDrawdownPct)),
        trades: avg(baseline.map((r) => r.trades))
      };
    }
    for (const cap of args.caps.filter((c) => c !== null)) {
      const runs = list.filter((r) => r.cap === cap);
      if (!runs.length) continue;
      summary.caps.push({
        cap,
        capLabel: `${Math.round(cap * 100)}%`,
        returnPct: avg(runs.map((r) => r.returnPct)),
        maxDrawdownPct: avg(runs.map((r) => r.maxDrawdownPct)),
        trades: avg(runs.map((r) => r.trades)),
        cappedContracts: avg(runs.map((r) => r.cappedContracts)),
        deltaReturnVsNoCap: summary.baseline ? avg(runs.map((r) => r.returnPct)) - summary.baseline.returnPct : null,
        deltaDrawdownVsNoCap: summary.baseline ? avg(runs.map((r) => r.maxDrawdownPct)) - summary.baseline.maxDrawdownPct : null
      });
    }
    strategies.push(summary);
  }
  strategies.sort((a, b) => (b.baseline?.returnPct ?? -Infinity) - (a.baseline?.returnPct ?? -Infinity));

  const report = {
    generatedAt: new Date().toISOString(),
    computedBy: 'ReplayEngine (deterministic) — src/backtest-replay.js',
    universe: {
      markets: coverage.length,
      periods: coverage.length ? Math.max(...coverage.map((c) => c.bars)) : 0,
      bars: coverage.reduce((s, c) => s + c.bars, 0),
      replayable: audit.replayable.length,
      trackedNotReplayable: audit.summary.trackedNotReplayable
    },
    caps: args.caps.map((c) => (c === null ? 'none' : c)),
    seeds: args.seeds,
    runs: rows.length,
    strategies
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);

  if (!args.quiet) {
    console.log(`\n${report.universe.markets} markets · ${report.universe.periods} periods · ${rows.length} strategy runs`);
    console.log('Average across seeds (return / max drawdown):\n');
    const head = ['Username'.padEnd(24), 'no cap'.padStart(16), ...args.caps.filter((c) => c !== null).map((c) => `${Math.round(c * 100)}% cap`.padStart(16))];
    console.log(head.join(' '));
    for (const s of strategies) {
      const base = s.baseline ? `${pct(s.baseline.returnPct)} ${s.baseline.maxDrawdownPct.toFixed(1)}%dd` : '—';
      const cells = s.caps.map((c) => `${pct(c.returnPct)} ${c.maxDrawdownPct.toFixed(1)}%dd`);
      console.log([s.username.padEnd(24), base.padStart(16), ...cells.map((c) => c.padStart(16))].join(' '));
    }
    console.log(`\nWritten to ${path.relative(ROOT, OUT)}`);
  }
  return 0;
}

const avg = (list) => (list.length ? list.reduce((a, b) => a + b, 0) / list.length : null);

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`cap-comparison failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { main };
