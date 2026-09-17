#!/usr/bin/env node
/**
 * KalshiPaperSim — Sensitivity Sweep
 * =====================================================================
 * Recommended-work item #7 asked for a "regime sweep (10 strategies × 6 regimes
 * × N seeds)". Implemented literally, that would mean RE-PRICING the real
 * captured candlesticks into bull/bear/volatile paths — i.e. inventing
 * historical prices, which is exactly what this repository's honesty contract
 * forbids (IRREGULARITIES.md, "regimeNote" in src/strategy-runner.js).
 *
 * So this sweep varies everything that is legitimately OURS to vary, and leaves
 * the exchange's real prices untouched:
 *
 *   • seed          — the draw of the modelled depth BEHIND the quoted touch
 *                     (candlesticks carry no depth; this is the model, not data)
 *   • market universe — single market / same-event pair / the full 3-market set
 *   • settlement scenario — mark-to-market, or resolve YES, or resolve NO
 *                     (both settlement outcomes are labelled hypothetical:
 *                      none of these contracts had resolved at capture time)
 *   • exhaustion policy — 'partial' (default, honest) vs 'penalty' (stress mode
 *                      that fills at an invented price; clearly labelled)
 *
 * The candles themselves are identical in every cell of the matrix.
 *
 * USAGE
 *   node scripts/sensitivity-sweep.mjs                 # full sweep
 *   node scripts/sensitivity-sweep.mjs --seeds=1,2,3   # custom seeds
 *   node scripts/sensitivity-sweep.mjs --quick         # one seed, no settlement scenarios
 *   node scripts/sensitivity-sweep.mjs --no-publish    # skip the docs/ copy
 *
 * OUTPUT
 *   data/reports/sensitivity-sweep.json   machine-readable matrix
 *   SENSITIVITY.md                        readable summary (committed)
 *   docs/data/sensitivity.json            copy for the static GitHub Pages site
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { STRATEGIES } from '../src/strategies.js';
import { runCompetition, getReplayableMarkets, getVerifiedCandleMap, getCandleCoverage } from '../src/strategy-runner.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORT_DIR = path.join(ROOT, 'data', 'reports');
const DOCS_DATA_DIR = path.join(ROOT, 'docs', 'data');
const T33000 = 'KXNASDAQ100Y-26DEC31H1600-T33000';
const T19000 = 'KXNASDAQ100Y-26DEC31H1600-T19000';

const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

function parseArgs(argv) {
  const args = { seeds: [20260917, 7, 42], quick: false, publish: true };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'seeds') args.seeds = v.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
    else if (k === 'quick') { args.quick = v !== 'false'; if (args.quick) args.seeds = [20260917]; }
    else if (k === 'publish' || k === 'no-publish') args.publish = k === 'publish' ? v !== 'false' : false;
  }
  return args;
}

/** Named market universes, all built only from markets with real captured bars. */
function universes() {
  const all = getReplayableMarkets();
  const has = (t) => all.find((m) => m.ticker === t) || null;
  const single = [has(T33000)].filter(Boolean);
  const pair = [has(T33000), has(T19000)].filter(Boolean);
  return [
    { id: 'single_T33000', label: `1 market (${T33000})`, markets: single },
    { id: 'same_event_pair', label: `2 markets, same event (${T33000} + ${T19000})`, markets: pair },
    { id: 'full_universe', label: `${all.length} markets (everything with real bars)`, markets: all }
  ];
}

/** Settlement scenarios. YES/NO are explicitly hypothetical. */
function scenarios(quick) {
  if (quick) return [{ id: 'mark_to_market', label: 'Mark to last real quote', settleAtEnd: false, finalResult: null, hypothetical: false }];
  return [
    { id: 'mark_to_market', label: 'Mark to last real quote (observed)', settleAtEnd: false, finalResult: null, hypothetical: false },
    { id: 'settle_yes', label: 'Hypothetical: every contract resolves YES', settleAtEnd: true, finalResult: 'YES', hypothetical: true },
    { id: 'settle_no', label: 'Hypothetical: every contract resolves NO', settleAtEnd: true, finalResult: 'NO', hypothetical: true }
  ];
}

function stats(values) {
  const xs = values.filter((v) => Number.isFinite(v));
  if (xs.length === 0) return { n: 0, mean: null, min: null, max: null, stdev: null };
  const mean = xs.reduce((a, b) => a + b, 0) / xs.length;
  const variance = xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length;
  return {
    n: xs.length,
    mean: round2(mean),
    min: round2(Math.min(...xs)),
    max: round2(Math.max(...xs)),
    stdev: round2(Math.sqrt(variance)),
    positiveCells: xs.filter((v) => v > 0).length,
    positivePct: round2((xs.filter((v) => v > 0).length / xs.length) * 100)
  };
}

function main() {
  const args = parseArgs(process.argv);
  const unis = universes();
  const scen = scenarios(args.quick);
  const seeds = args.seeds;

  console.log(
    `Sensitivity sweep: ${STRATEGIES.length} strategies × ${seeds.length} seed(s) × ${unis.length} universe(s) × ${scen.length} scenario(s) = ` +
      `${STRATEGIES.length * seeds.length * unis.length * scen.length} strategy runs across ${seeds.length * unis.length * scen.length} competitions`
  );

  const cells = [];
  const perStrategy = new Map(
    STRATEGIES.map((s) => [s.username, { username: s.username, title: s.title, returns: [], ranks: [], fees: [], drawdowns: [], trades: [], byScenario: {} }])
  );

  for (const universe of unis) {
    for (const scenario of scen) {
      for (const seed of seeds) {
        const comp = runCompetition({
          seed,
          markets: universe.markets,
          candlesByTicker: getVerifiedCandleMap(universe.markets.map((m) => m.ticker)),
          settleAtEnd: scenario.settleAtEnd,
          finalResult: scenario.finalResult
        });
        const cell = {
          universe: universe.id,
          universeLabel: universe.label,
          scenario: scenario.id,
          scenarioLabel: scenario.label,
          hypothetical: scenario.hypothetical,
          seed,
          horizonPeriods: comp.competition.horizonPeriods,
          results: comp.leaderboard.map((r) => ({
            rank: r.rank,
            username: r.username,
            returnPct: round2(r.returnPct),
            finalEquity: round2(r.finalEquity),
            trades: r.totalTrades,
            feesPaid: round2(r.feesPaid),
            maxDrawdownPct: round2(r.maxDrawdownPct),
            qualified: r.qualified
          }))
        };
        cells.push(cell);
        for (const r of cell.results) {
          const agg = perStrategy.get(r.username);
          if (!agg) continue;
          agg.byScenario[scenario.id] = agg.byScenario[scenario.id] || { scenario: scenario.id, label: scenario.label, hypothetical: scenario.hypothetical, returns: [] };
          agg.byScenario[scenario.id].returns.push(r.returnPct);
          agg.returns.push(r.returnPct);
          agg.fees.push(r.feesPaid);
          agg.drawdowns.push(r.maxDrawdownPct);
          agg.trades.push(r.trades);
          if (r.qualified && r.rank) agg.ranks.push(r.rank);
        }
      }
    }
  }

  // Penalty-policy stress row: fills beyond depth at an INVENTED price. It is
  // reported separately and never mixed into the headline statistics.
  const stress = runCompetition({ seed: seeds[0], exhaustionPolicy: 'penalty' });
  const stressRows = stress.leaderboard.map((r) => ({
    username: r.username,
    returnPctPartial: null,
    returnPctPenalty: round2(r.returnPct),
    note: 'STRESS ONLY: the unfilled remainder executes at an invented price. Not real exchange behaviour.'
  }));
  const baseline = runCompetition({ seed: seeds[0] });
  for (const row of stressRows) {
    const base = baseline.leaderboard.find((r) => r.username === row.username);
    row.returnPctPartial = base ? round2(base.returnPct) : null;
    row.differencePct = row.returnPctPartial === null ? null : round2(row.returnPctPenalty - row.returnPctPartial);
  }

  const summary = [...perStrategy.values()].map((a) => {
    const s = stats(a.returns);
    return {
      username: a.username,
      title: a.title,
      cells: s.n,
      meanReturnPct: s.mean,
      worstReturnPct: s.min,
      bestReturnPct: s.max,
      stdevReturnPct: s.stdev,
      profitableCells: s.positiveCells,
      profitablePct: s.positivePct,
      bestRank: a.ranks.length ? Math.min(...a.ranks) : null,
      worstRank: a.ranks.length ? Math.max(...a.ranks) : null,
      byScenario: Object.values(a.byScenario).map((b) => ({ scenario: b.scenario, label: b.label, hypothetical: b.hypothetical, ...stats(b.returns) })),
      meanFeesUsd: stats(a.fees).mean,
      meanMaxDrawdownPct: stats(a.drawdowns).mean,
      meanTrades: stats(a.trades).mean,
      classification:
        s.positivePct >= 80 ? 'STRUCTURAL_EDGE_ON_THIS_WINDOW'
          : s.positivePct > 20 ? 'CONDITIONAL'
            : 'NOT_PROFITABLE_ON_ANY_TESTED_CONFIGURATION'
    };
  }).sort((a, b) => (b.meanReturnPct ?? -Infinity) - (a.meanReturnPct ?? -Infinity));

  const report = {
    generatedAt: new Date().toISOString(),
    method:
      'Deterministic replay over the REAL captured candlesticks. Only the seed (modelled depth behind the touch), ' +
      'the market universe, the settlement scenario and the exhaustion policy are varied. Prices are never re-generated.',
    matrix: {
      strategies: STRATEGIES.length,
      seeds,
      universes: unis.map((u) => ({ id: u.id, label: u.label, markets: u.markets.map((m) => m.ticker) })),
      scenarios: scen.map((s) => ({ id: s.id, label: s.label, hypothetical: s.hypothetical })),
      cells: cells.length
    },
    dataProvenance: {
      candleCoverage: getCandleCoverage(),
      capturedAt: '2026-09-17',
      note: 'Every cell replays the same real bars. Nothing is bootstrapped, re-sampled or synthetically generated.'
    },
    summary,
    stressTest: {
      policy: 'penalty (invented fill price beyond modelled depth) vs partial (honest)',
      rows: stressRows,
      note: 'Included so the cost of the depth model is visible. Penalty numbers are NOT presented as achievable results.'
    },
    cells
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'sensitivity-sweep.json');
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`);
  if (args.publish) {
    fs.mkdirSync(DOCS_DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DOCS_DATA_DIR, 'sensitivity.json'), `${JSON.stringify(report, null, 2)}\n`);
  }

  /* ---------------- markdown summary ---------------- */
  const md = [];
  md.push('# Sensitivity sweep');
  md.push('');
  md.push(`Generated \`${report.generatedAt}\` by \`scripts/sensitivity-sweep.mjs\`.`);
  md.push('');
  md.push(
    'The previous session suggested a **regime sweep** (strategies × market regimes). Implemented literally that would\n' +
      're-price the real captured candlesticks into synthetic bull/bear/volatile paths — inventing history, which this\n' +
      "repository's honesty contract forbids. This sweep instead varies only what is legitimately ours to vary:\n" +
      'the **seed** (the modelled depth behind the touch), the **market universe**, the **settlement scenario** and the\n' +
      '**exhaustion policy**. The candles are byte-identical in every cell.'
  );
  md.push('');
  md.push(`Matrix: ${report.matrix.strategies} strategies × ${seeds.length} seed(s) × ${unis.length} universe(s) × ${scen.length} scenario(s) = **${cells.length} competitions / ${cells.length * report.matrix.strategies} strategy runs**.`);
  md.push('');
  md.push(
    '> ⚠️ **Read the per-scenario tables before quoting any number from the table below.** The mean column averages\n' +
      'across all three settlement scenarios, and two of them are **hypothetical** — every contract forced to resolve\n' +
      'YES, or forced to resolve NO. A strategy that buys YES convexity therefore prints a four-figure mean that is\n' +
      'purely an artefact of the "resolves YES" cell. The only **observed** row is\n' +
      '[Mark to last real quote](#mark-to-last-real-quote-observed), where every position is valued at the last real\n' +
      'captured price because none of these contracts had resolved when the data was captured.'
  );
  md.push('');
  md.push('| # | Username | Mean return (mixes hypothetical scenarios) | Best | Worst | σ | Profitable cells | Best rank | Worst rank | Mean max DD |');
  md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  summary.forEach((s, i) => {
    md.push(
      `| ${i + 1} | **${s.username}** | ${s.meanReturnPct}% | ${s.bestReturnPct}% | ${s.worstReturnPct}% | ${s.stdevReturnPct}% | ` +
        `${s.profitableCells}/${s.cells} (${s.profitablePct}%) | ${s.bestRank ?? '—'} | ${s.worstRank ?? '—'} | ${s.meanMaxDrawdownPct}% |`
    );
  });
  md.push('');
  md.push('## Returns by settlement scenario');
  md.push('');
  md.push(
    'The settlement scenarios dominate the spread, so they are separated out. Both settlement outcomes are ' +
    '**hypothetical**: none of these contracts had resolved when the data was captured on 2026-09-17 ' +
    '(status `active`, `result: ""`).'
  );
  md.push('');
  for (const sc of scen) {
    md.push(`### ${sc.label}${sc.hypothetical ? ' _(hypothetical)_' : ''}`);
    md.push('');
    md.push('| Username | Mean return | Best | Worst | Profitable cells |');
    md.push('| --- | --- | --- | --- | --- |');
    for (const s of summary) {
      const b = s.byScenario.find((x) => x.scenario === sc.id);
      if (!b) continue;
      md.push(`| ${s.username} | ${b.mean}% | ${b.max}% | ${b.min}% | ${b.positiveCells}/${b.n} |`);
    }
    md.push('');
  }
  md.push('');
  const structural = summary.filter((s) => s.classification === 'STRUCTURAL_EDGE_ON_THIS_WINDOW');
  const conditional = summary.filter((s) => s.classification === 'CONDITIONAL');
  const never = summary.filter((s) => s.classification === 'NOT_PROFITABLE_ON_ANY_TESTED_CONFIGURATION');
  md.push(
    `- **${structural.length}** strateg${structural.length === 1 ? 'y' : 'ies'} profitable in ≥80% of tested configurations: ${structural.map((s) => s.username).join(', ') || 'none'}.`
  );
  md.push(`- **${conditional.length}** conditional: ${conditional.map((s) => s.username).join(', ') || 'none'}.`);
  md.push(`- **${never.length}** unprofitable in every tested configuration: ${never.map((s) => s.username).join(', ') || 'none'}.`);
  md.push('');
  md.push(
    'This measures robustness **within one 61-period window of real data**. It is not a forecast, and a different\n' +
      'window could reorder every row — which is precisely why `scripts/ingest-history.mjs` exists to lengthen the window.'
  );
  md.push('');
  md.push('## Stress test: how much the depth model matters');
  md.push('');
  md.push('| Username | Return (partial, honest) | Return (penalty, invented fills) | Difference |');
  md.push('| --- | --- | --- | --- |');
  for (const r of stressRows) {
    md.push(`| ${r.username} | ${r.returnPctPartial}% | ${r.returnPctPenalty}% | ${r.differencePct}% |`);
  }
  md.push('');
  md.push('_Penalty mode executes the unfilled remainder at a price invented by the model; it is a stress diagnostic, never a result._');
  md.push('');
  md.push('## Reproduce');
  md.push('');
  md.push('```bash');
  md.push('node scripts/sensitivity-sweep.mjs            # full sweep');
  md.push('node scripts/sensitivity-sweep.mjs --quick    # one seed, mark-to-market only');
  md.push('```');
  md.push('');
  fs.writeFileSync(path.join(ROOT, 'SENSITIVITY.md'), md.join('\n'));

  console.log(`\nWrote ${path.relative(ROOT, jsonPath)} and SENSITIVITY.md (${cells.length} runs)`);
  for (const s of summary) {
    console.log(`  ${s.username.padEnd(24)} mean ${String(s.meanReturnPct).padStart(8)}%  profitable ${s.profitableCells}/${s.cells}  ${s.classification}`);
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`sensitivity-sweep failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}
