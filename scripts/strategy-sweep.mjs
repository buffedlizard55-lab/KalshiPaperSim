#!/usr/bin/env node
/**
 * KalshiPaperSim — Family sweep runner
 * =====================================================================
 * Runs every variant built by src/sweep-families.js over the SAME real bars and
 * writes the DISTRIBUTION to data/reports/strategy-sweep.json.
 *
 * WHY A DISTRIBUTION AND NOT A WINNER
 *   With N variants, the best one is expected to look good by luck alone — the
 *   public sources this sweep is modelled on say so themselves (R01 publishes
 *   4,904 variants; R08 reports a Deflated Sharpe warning and an upper-tail
 *   p-value of 0.040 for its best run). So the report contains, per family:
 *     • how many variants made money and how many did not
 *     • median / best / worst return
 *     • the luck benchmark: the best return vs the 95th percentile of the family's
 *       own distribution, and (for panic_fade) the PLACEBO family, which trades
 *       the same rule with the signal delayed by one and four bars
 *     • per-variant rows so any single number can be checked
 *
 * The placebo is the important control: if "fade the panic" is a timing edge,
 * firing the same signal late must do worse. If it does not, the family's result
 * is drift, not skill.
 *
 * USAGE
 *   node scripts/strategy-sweep.mjs                       # all families, hourly store
 *   node scripts/strategy-sweep.mjs --period=1440         # daily store instead
 *   node scripts/strategy-sweep.mjs --family=tight_scalp  # one family
 *   node scripts/strategy-sweep.mjs --depth-mode=captured  # real ladders (competition default)
 *   node scripts/strategy-sweep.mjs --json                # print, do not write
 *
 * DEPTH MODE IS RECORDED, NOT ASSUMED
 *   The depth behind a candlestick is not published. Running the same variant on
 *   the modelled ladder and on the real captured ladder gives different numbers
 *   (the reported comparison is in data/reports/depth-comparison.json), so the
 *   mode is part of the file name and of every row's metadata. A sweep result
 *   without its depth mode is not a result.
 *
 * No network. Everything is computed from data/history/.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildSweep } from '../src/sweep-families.js';
import { runStrategy, getIntradayCoverage } from '../src/strategy-runner.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const args = process.argv.slice(2);
const getArg = (name, fallback = null) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  if (hit) return hit.slice(name.length + 3);
  return args.includes(`--${name}`) ? true : fallback;
};

const periodIntervalMinutes = Number(getArg('period', 60));
const depthMode = String(getArg('depth-mode', 'captured'));
if (!['modelled', 'captured'].includes(depthMode)) throw new Error(`depth-mode must be modelled or captured, got "${depthMode}"`);
const familyFilter = getArg('family', null);
const writeReport = !getArg('json', false);
const seed = Number(getArg('seed', 20260918));
// SPLIT-WINDOW EVALUATION (added in pass 2). --oos-split=YYYY-MM-DD runs every
// variant a SECOND time with the engine's noTradeBeforeTs gate set to that date:
// every bar is still replayed (so the strategy's own history is real and warm)
// but no order can execute before the split, and the account keeps its opening
// capital. The result is a post-split number, not a true forward test: these
// designs were written on 2026-09-17/18 with the whole window in front of them,
// which is exactly why the report labels it as a stability check and keeps the
// real forward window (post-designedAt, still empty) in src/forward-test.js.
const oosSplitArg = getArg('oos-split', null);
const oosSplitTs = oosSplitArg ? Math.floor(Date.parse(`${oosSplitArg}T00:00:00Z`) / 1000) : null;
if (oosSplitArg && !Number.isFinite(oosSplitTs)) throw new Error(`--oos-split="${oosSplitArg}" is not a date`);

function quantile(sorted, q) {
  if (!sorted.length) return null;
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  return sorted[base];
}

function summarize(rows) {
  const returns = rows.map((r) => r.returnPct).sort((a, b) => a - b);
  const profitable = returns.filter((r) => r > 0).length;
  const flat = returns.filter((r) => r === 0).length;
  return {
    variants: rows.length,
    profitable,
    notProfitable: rows.length - profitable,
    flat,
    medianReturnPct: Number(quantile(returns, 0.5).toFixed(4)),
    meanReturnPct: Number((returns.reduce((a, b) => a + b, 0) / returns.length).toFixed(4)),
    bestReturnPct: Number(returns[returns.length - 1].toFixed(4)),
    worstReturnPct: Number(returns[0].toFixed(4)),
    p95ReturnPct: Number(quantile(returns, 0.95).toFixed(4)),
    profitablePct: Number(((profitable / rows.length) * 100).toFixed(2)),
    // The luck benchmark, stated as a rule rather than a vibe: a family whose best
    // variant only just beats the family's own 95th percentile and whose median is
    // negative is a sweep artifact, not an edge.
    luckBenchmark:
      `best ${Number(returns[returns.length - 1].toFixed(2))}% vs the family's own p95 of ${Number(quantile(returns, 0.95).toFixed(2))}%` +
      ` and a median of ${Number(quantile(returns, 0.5).toFixed(2))}% across ${rows.length} variants`
  };
}

function main() {
  const all = buildSweep();
  const variants = familyFilter ? all.filter((s) => s.sweep.family === familyFilter) : all;
  if (!variants.length) throw new Error(`no variants matched family="${familyFilter}"`);

  const coverage = periodIntervalMinutes === 60 ? getIntradayCoverage(60) : null;
  if (periodIntervalMinutes === 60 && (!coverage || !coverage.present)) {
    throw new Error('the intraday store is empty — run the 60-minute ingest before sweeping the hourly flight');
  }

  console.log(
    `Sweeping ${variants.length} variants on period_interval=${periodIntervalMinutes}, depth=${depthMode}` +
      (coverage ? ` (${coverage.marketCount} markets / ${coverage.barCount} bars)` : ' (daily store)') +
      '…'
  );

  const started = Date.now();
  const rows = [];
  for (const [i, strategy] of variants.entries()) {
    const result = runStrategy(strategy, { periodIntervalMinutes, seed, settleAtEnd: false, depthMode });
    const st = result.stats;
    const winRatePct = st.winRate === null || st.winRate === undefined ? null : Number((st.winRate <= 1 ? st.winRate * 100 : st.winRate).toFixed(2));
    let oos = null;
    if (oosSplitTs) {
      const post = runStrategy(strategy, { periodIntervalMinutes, seed, settleAtEnd: false, depthMode, noTradeBeforeTs: oosSplitTs });
      oos = {
        splitDate: oosSplitArg,
        returnPct: Number(post.stats.returnPct.toFixed(4)),
        finalEquity: Number(post.stats.equity.toFixed(2)),
        totalTrades: post.stats.totalTrades,
        feesPaid: Number((post.stats.feesPaid ?? 0).toFixed(4)),
        maxDrawdownPct: Number((post.stats.maxDrawdownPct ?? 0).toFixed(4))
      };
    }
    rows.push({
      oos,
      id: strategy.id,
      username: strategy.username,
      family: strategy.sweep.family,
      params: strategy.sweep,
      returnPct: Number(st.returnPct.toFixed(4)),
      finalEquity: Number(st.equity.toFixed(2)),
      totalTrades: st.totalTrades,
      wins: st.winningTrades ?? null,
      losses: st.losingTrades ?? null,
      winRatePct,
      feesPaid: Number((st.feesPaid ?? 0).toFixed(4)),
      maxDrawdownPct: Number((st.maxDrawdownPct ?? 0).toFixed(4)),
      unrealizedPnl: Number((st.unrealizedPnl ?? 0).toFixed(4)),
      openPositions: st.openPositions ?? null
    });
    if ((i + 1) % 20 === 0 || i === variants.length - 1) {
      console.log(`  ${i + 1}/${variants.length} variants (${((Date.now() - started) / 1000).toFixed(1)}s)`);
    }
  }

  const families = {};
  for (const row of rows) {
    families[row.family] = families[row.family] || [];
    families[row.family].push(row);
  }
  const summaries = Object.fromEntries(Object.entries(families).map(([k, v]) => [k, summarize(v)]));
  // Post-split distributions: how each family behaves on bars AFTER the split,
  // with the pre-split bars suppressed. Reported for every variant, losers included.
  const oosSummaries = oosSplitTs
    ? Object.fromEntries(
        Object.entries(families).map(([k, v]) => [
          k,
          summarize(v.map((r) => ({ returnPct: r.oos ? r.oos.returnPct : 0 })))
        ])
      )
    : null;
  const tradedOos = oosSplitTs ? rows.filter((r) => r.oos && r.oos.totalTrades > 0).length : null;

  // Ranking inside a family, so the promoted variant in the roster can point at
  // the exact row in this file.
  for (const [k, v] of Object.entries(families)) {
    v.sort((a, b) => b.returnPct - a.returnPct);
    v.forEach((r, idx) => { r.rankInFamily = idx + 1; });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    periodIntervalMinutes,
    depthMode,
    seed,
    capital: 100000,
    oosSplit: oosSplitTs
      ? {
          date: oosSplitArg,
          splitTs: oosSplitTs,
          label: 'POST-SPLIT WINDOW (stability check, not a forward test)',
          why:
            'Every bar is still replayed so the strategy has real, warm history, but no order may execute before this date and the account keeps its opening capital. ' +
            'This shows whether a family that looked good over the whole window also held up on the later bars. It is NOT evidence of out-of-sample skill: these designs ' +
            'were written after this date existed in the store. The only true forward window is post-designedAt and is reported by src/forward-test.js.',
          variantsTradedAfterSplit: tradedOos,
          variantsWithNoPostSplitTrade: oosSplitTs ? rows.length - tradedOos : null
        }
      : null,
    dataSource:
      periodIntervalMinutes === 60
        ? {
            store: 'data/history/intraday/60m (curated)',
            markets: coverage.marketCount,
            bars: coverage.barCount,
            firstDate: coverage.markets.map((m) => m.firstDate).sort()[0],
            lastDate: coverage.markets.map((m) => m.lastDate).sort().slice(-1)[0]
          }
        : { store: 'data/history (daily)', note: 'daily bars for every replayable market' },
    method:
      'Every variant is a separate replay of the same stored bars with the same fees and the same volume-bounded fills. Nothing is tuned after seeing the result: ' +
      'the grids are fixed in src/sweep-families.js → SWEEP_DEFINITION, and the report contains every variant that was run, including the ones that lost.',
    translatedFrom: {
      source: 'R01 — "Backtested 5,000 Strategies on Kalshi 15-min BTC Markets" (see src/research-sources.js)',
      sizeNote:
        'The source sized in fixed contract counts (fade_size=100). Sizes here are fractions of available cash so a variant is scale-free and comparable on the ' +
        'competition\'s capital. This is a translation, not a copy, and the two sets of numbers are not comparable.',
      seriesNote: 'The source traded KXBTC15M; this sweep runs on the series actually stored in this repository.'
    },
    summaries,
    oosSummaries,
    best: rows.slice().sort((a, b) => b.returnPct - a.returnPct).slice(0, 5),
    worst: rows.slice().sort((a, b) => a.returnPct - b.returnPct).slice(0, 3),
    families,
    verdicts: {
      panicFadeVsPlacebo: buildPlaceboVerdict(summaries),
      interpretationRule:
        'A family is only reported as a candidate edge when its median is positive AND its best variant is meaningfully above the family p95. Otherwise the family is ' +
        'reported as a distribution in which some settings happened to win.'
    },
    elapsedSeconds: Number(((Date.now() - started) / 1000).toFixed(1))
  };

  if (writeReport) {
    const body = `${JSON.stringify(report, null, 2)}\n`;
    const name = `strategy-sweep-${periodIntervalMinutes}m-${depthMode}.json`;
    fs.mkdirSync(path.join(ROOT, 'data', 'reports'), { recursive: true });
    fs.mkdirSync(path.join(ROOT, 'docs', 'data', 'reports'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'data', 'reports', name), body);
    fs.writeFileSync(path.join(ROOT, 'docs', 'data', 'reports', name), body);
    console.log(`  ✓ ${name} (${(Buffer.byteLength(body) / 1024).toFixed(1)} KB) in ${report.elapsedSeconds}s`);
  }

  console.log('\nSummaries:');
  for (const [family, s] of Object.entries(summaries)) {
    console.log(
      `  ${family.padEnd(20)} ${String(s.profitable).padStart(3)}/${String(s.variants).padEnd(3)} profitable · median ${String(s.medianReturnPct).padStart(8)}% · ` +
        `best ${String(s.bestReturnPct).padStart(8)}% · worst ${String(s.worstReturnPct).padStart(8)}%`
    );
  }
  if (oosSummaries) {
    console.log(`\nPost-split distributions (${oosSplitArg}; ${tradedOos}/${rows.length} variants trade after the split):`);
    for (const [family, s] of Object.entries(oosSummaries)) {
      console.log(
        `  ${family.padEnd(20)} ${String(s.profitable).padStart(3)}/${String(s.variants).padEnd(3)} profitable · median ${String(s.medianReturnPct).padStart(8)}% · ` +
          `best ${String(s.bestReturnPct).padStart(8)}% · worst ${String(s.worstReturnPct).padStart(8)}%`
      );
    }
  }
  if (report.verdicts.panicFadeVsPlacebo) console.log(`\nPlacebo: ${report.verdicts.panicFadeVsPlacebo}`);
  if (getArg('print', false)) console.log(JSON.stringify(report.summaries, null, 2));
  return 0;
}

function buildPlaceboVerdict(summaries) {
  const real = summaries.panic_fade;
  const placebo = summaries.panic_fade_placebo;
  if (!real || !placebo) return null;
  const delta = Number((real.bestReturnPct - placebo.bestReturnPct).toFixed(2));
  return (
    `best panic_fade ${real.bestReturnPct}% (median ${real.medianReturnPct}%) vs best delayed-signal placebo ${placebo.bestReturnPct}% ` +
    `(median ${placebo.medianReturnPct}%): the real-timing family's best variant is ${delta >= 0 ? 'ahead by' : 'behind by'} ${Math.abs(delta)} percentage points`
  );
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`strategy-sweep failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { summarize, main };
