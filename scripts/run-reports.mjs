#!/usr/bin/env node
/**
 * KalshiPaperSim — Build-time report generator
 * =====================================================================
 * Everything the site shows must be COMPUTED from real data, but the GitHub
 * Pages build runs in a browser and a full forward test takes ~15 seconds there.
 * So this script computes the heavy reports once, in Node, from the same modules
 * the browser imports, and writes them to data/reports/ (canonical) and
 * docs/data/reports/ (served by GitHub Pages). The UI displays the precomputed
 * numbers and offers a "recompute live" button for anyone who wants to watch the
 * engine do it in front of them.
 *
 * REPORTS
 *   forward-test.json    backtest vs strict forward window vs labelled held-out window
 *   depth-comparison.json the same roster on MODELLED depth vs REAL captured ladders
 *   flights.json         the daily flight and the hourly flight, side by side
 *   calendar-audit.json  every gap in the stored bars, classified (holiday / DST /
 *                        unexplained) — no gap is ever filled or interpolated
 *
 * NOTE: no network. Everything comes from data/history/ + the in-repo captures.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { STRATEGIES } from '../src/strategies.js';
import { runCompetition, runCompetitionFlights, getCapturedDepthProfiles, getIntradayCoverage, getCandleCoverage } from '../src/strategy-runner.js';
import { runForwardTest, defaultSplitTs } from '../src/forward-test.js';
import { CAPTURED_DEPTH } from '../src/captured-depth.js';
import { ACCUMULATED_HISTORY } from '../src/accumulated-history.js';
import { getCapturedDepthTickers } from '../src/captured-depth.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'data', 'reports');
const DOCS_DIR = path.join(ROOT, 'docs', 'data', 'reports');

const write = (name, obj) => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DOCS_DIR, { recursive: true });
  const body = `${JSON.stringify(obj, null, 2)}\n`;
  fs.writeFileSync(path.join(OUT_DIR, name), body);
  fs.writeFileSync(path.join(DOCS_DIR, name), body);
  const kb = (Buffer.byteLength(body) / 1024).toFixed(1);
  console.log(`  ✓ ${name} (${kb} KB)`);
};

/* ------------------------------------------------------------------ *
 * 1. Calendar audit — every gap in the stored daily bars
 * ------------------------------------------------------------------ */
function calendarAudit() {
  const markets = [];
  for (const [ticker, block] of Object.entries(ACCUMULATED_HISTORY.markets || {})) {
    const bars = block.tuples.map((t) => t[0]).sort((a, b) => a - b);
    const period = Number(block.period_interval || 1440) * 60;
    const gaps = [];
    for (let i = 1; i < bars.length; i++) {
      const delta = bars[i] - bars[i - 1];
      if (delta === period) continue;
      const d = new Date(bars[i - 1] * 1000);
      const etHour = Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: '2-digit', hour12: false }).format(d));
      gaps.push({
        from: bars[i - 1],
        to: bars[i],
        fromIso: new Date(bars[i - 1] * 1000).toISOString(),
        toIso: new Date(bars[i] * 1000).toISOString(),
        deltaSeconds: delta,
        missingBars: Math.round(delta / period) - 1,
        // Classification, stated as a rule rather than a guess:
        classification:
          delta % period === 0
            ? `WHOLE-BAR GAP: ${Math.round(delta / period) - 1} bar(s) absent from the API response for this window`
            : `OFF-GRID DELTA: not a whole multiple of ${period}s — the bar boundary moved (US Eastern DST shifts each daily bar by one hour; verified 2026-03-10, delta 82800s)`
      });
    }
    markets.push({
      ticker,
      bars: bars.length,
      first: new Date(bars[0] * 1000).toISOString(),
      last: new Date(bars[bars.length - 1] * 1000).toISOString(),
      gaps: gaps.length,
      gapDetail: gaps,
      noTradeBars: block.tuples.filter((t) => t[3][3] === null).length
    });
  }
  const totalGaps = markets.reduce((s, m) => s + m.gaps, 0);
  return {
    generatedAt: new Date().toISOString(),
    method:
      'For each stored market, every pair of consecutive end_period_ts values is compared with the documented period length. A difference that is not an exact ' +
      'period is recorded here with both timestamps. Nothing is filled, interpolated or shifted.',
    evidence: {
      holiday: {
        claim: 'A day on which the market had NO quotes at all produces NO candlestick.',
        verifiedBy:
          'Live re-fetch of the window 2025-12-26T00:00:00Z → 2025-12-27T23:00:00Z returned a single bar (end_period_ts 1766811600 = 2025-12-27T05:00:00Z); ' +
          'the ET day 2025-12-25 (Christmas) is absent from the API response itself, not from our store. URL is recorded in data/reports/store-verification.json.',
        url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1766707200&end_ts=1766880000&period_interval=1440'
      },
      dst: {
        claim: 'Daily bar boundaries follow US Eastern time, so the UTC timestamp moves by one hour at each DST change.',
        observed: '2026-03-09T05:00:00Z → 2026-03-10T04:00:00Z (delta 82,800 s = 23 h), present in both KXNASDAQ100Y and KXBTCY series'
      }
    },
    totals: { markets: markets.length, gaps: totalGaps, marketsWithWholeBarGaps: markets.filter((m) => m.gapDetail.some((g) => g.deltaSeconds % 86400 === 0)).length },
    markets
  };
}

/* ------------------------------------------------------------------ *
 * 2. Depth comparison — modelled vs real captured ladders
 * ------------------------------------------------------------------ */
function depthComparison() {
  const strategies = STRATEGIES.filter((s) => (s.flight || 'daily') !== 'hourly');
  const run = (depthMode) => {
    const comp = runCompetition({ strategies, depthMode, periodIntervalMinutes: 1440 });
    return {
      depthMode,
      depthModeNote: comp.competition.depthModeNote,
      rows: comp.leaderboard.map((r) => ({
        rank: r.rank,
        username: r.username,
        returnPct: r.returnPct,
        finalEquity: r.finalEquity,
        totalTrades: r.totalTrades,
        maxDrawdownPct: r.maxDrawdownPct,
        feesPaid: r.feesPaid,
        unfilledContracts: r.unfilledContracts,
        capturedDepthPct: r.depthMix?.capturedPct ?? null
      }))
    };
  };
  const modelled = run('modelled');
  const captured = run('captured');
  const byName = new Map(modelled.rows.map((r) => [r.username, r]));
  const deltas = captured.rows.map((r) => {
    const m = byName.get(r.username) || {};
    return {
      username: r.username,
      modelledPct: m.returnPct ?? null,
      capturedPct: r.returnPct,
      deltaPct: m.returnPct === undefined ? null : Number((r.returnPct - m.returnPct).toFixed(2)),
      modelledTrades: m.totalTrades ?? null,
      capturedTrades: r.totalTrades
    };
  }).sort((a, b) => Math.abs(b.deltaPct ?? 0) - Math.abs(a.deltaPct ?? 0));

  return {
    generatedAt: new Date().toISOString(),
    why:
      'Depth behind a candlestick is not published, so a replay must either model it or use a real captured ladder. This report runs the SAME roster over the SAME ' +
      'real bars twice and reports both, because the difference is a measure of how much the depth assumption matters.',
    capturedDepthSource: {
      marketsWithCapturedLadder: getCapturedDepthTickers().length,
      endpoint: CAPTURED_DEPTH.endpoint,
      docs: CAPTURED_DEPTH.docs,
      maxLevelsPerSide: CAPTURED_DEPTH.maxLevelsPerSide,
      capturedAt: [...new Set(CAPTURED_DEPTH.sources.map((s) => s.capturedAt))].sort().slice(-1)[0] || null,
      sources: CAPTURED_DEPTH.sources
    },
    modelled,
    captured,
    deltas
  };
}


/* ------------------------------------------------------------------ *
 * 3. Liquidity & impact — measured from the REAL captured ladders
 * ------------------------------------------------------------------ */
/**
 * How much real size sits near the touch, and what a market order would cost.
 *
 * The walk is done on the CAPTURED ladder only: levels are taken in ascending
 * distance from the captured touch and consumed in order until the requested
 * size is filled (or the ladder runs out). The VWAP of that walk IS the modelled
 * market impact — there is no impact model here, only the real ladder.
 */
function liquidityDepth() {
  const sizes = [100, 1000, 10000];
  const records = Array.isArray(CAPTURED_DEPTH.markets) ? CAPTURED_DEPTH.markets : Object.values(CAPTURED_DEPTH.markets);
  const markets = records.map((rec) => {
    const tick = rec.tick;
    const side = (s) => {
      if (!rec[s]) {
        // A one-sided capture is a REAL observation, not an error: the response
        // contained no levels on that side at capture time. It is reported as
        // empty rather than filled with a fabricated ladder.
        return {
          touch: null,
          levelCount: 0,
          totalContracts: 0,
          contractsWithinTicks: { 1: 0, 2: 0, 5: 0, 10: 0 },
          impact: Object.fromEntries(sizes.map((size) => [size, { requested: size, filled: 0, unfilled: size, exhaustedLadder: true, note: 'no levels on this side in the captured response' }])),
          emptySide: true
        };
      }
      const levels = (rec[s]?.levels || []).slice().sort((a, b) => a[0] - b[0]);
      const within = (ticks) => levels.filter((l) => l[0] <= ticks).reduce((sum, l) => sum + l[1], 0);
      const impacts = {};
      for (const size of sizes) {
        let remaining = size;
        let cost = 0;
        let filled = 0;
        let deepestTick = 0;
        for (const [offset, count] of levels) {
          if (remaining <= 0) break;
          const take = Math.min(count, remaining);
          cost += take * (rec[s].touch + offset * tick);
          filled += take;
          remaining -= take;
          deepestTick = offset;
        }
        impacts[size] = filled > 0
          ? {
              requested: size,
              filled: Number(filled.toFixed(2)),
              unfilled: Number((size - filled).toFixed(2)),
              vwap: Number((cost / filled).toFixed(6)),
              slippageTicksFromTouch: Number((((cost / filled) - rec[s].touch) / tick).toFixed(2)),
              slippageProbability: Number(((cost / filled) - rec[s].touch).toFixed(6)),
              deepestLevelTicks: deepestTick,
              exhaustedLadder: filled < size
            }
          : { requested: size, filled: 0, unfilled: size, exhaustedLadder: true, note: 'no levels on this side' };
      }
      return {
        touch: rec[s].touch,
        levelCount: levels.length,
        totalContracts: Number(levels.reduce((x, l) => x + l[1], 0).toFixed(2)),
        contractsWithinTicks: { 1: Number(within(1).toFixed(2)), 2: Number(within(2).toFixed(2)), 5: Number(within(5).toFixed(2)), 10: Number(within(10).toFixed(2)) },
        impact: impacts
      };
    };
    return {
      ticker: rec.ticker,
      series_ticker: rec.series_ticker,
      tick,
      capturedAt: rec.capturedAt,
      url: rec.url,
      origin: rec.origin,
      yes: side('yes'),
      no: side('no')
    };
  });

  const byTicker = {};
  for (const m of markets) byTicker[m.ticker] = m;
  const yesTotal = markets.map((m) => m.yes.totalContracts);
  return {
    generatedAt: new Date().toISOString(),
    source:
      'GET /markets/{ticker}/orderbook — real captured ladders (orderbook_fp with dollar strings). One ladder is stored per market; the ' +
      'capture timestamp and URL are on every row so a human can re-check it.',
    docs: CAPTURED_DEPTH.docs,
    endpoint: CAPTURED_DEPTH.endpoint,
    maxLevelsPerSideKept: CAPTURED_DEPTH.maxLevelsPerSide,
    method:
      'Levels are consumed in ascending distance from the captured touch until the requested size is filled. The VWAP of that walk is the quoted impact. ' +
      'If the ladder runs out, the remainder is reported as unfilled rather than filled at a fabricated price.',
    aggregate: {
      markets: markets.length,
      totalYesContracts: Number(yesTotal.reduce((a, b) => a + b, 0).toFixed(2)),
      medianYesContractsWithin1Tick: median(markets.map((m) => m.yes.contractsWithinTicks[1])),
      medianYesContractsWithin5Ticks: median(markets.map((m) => m.yes.contractsWithinTicks[5])),
      marketsExhaustedBy1000Contracts: markets.filter((m) => m.yes.impact[1000]?.exhaustedLadder).length,
      marketsExhaustedBy10000Contracts: markets.filter((m) => m.yes.impact[10000]?.exhaustedLadder).length
    },
    markets,
    byTicker
  };
}

function median(values) {
  const sorted = values.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));
}

/* ------------------------------------------------------------------ *
 * 4. Sweep summary — the family distributions, compact
 * ------------------------------------------------------------------ */
/**
 * The sweep files are ~80 KB each because they contain every variant. The site
 * needs the DISTRIBUTION and the notable rows, not every row, so this reduces
 * them to a summary the browser can load quickly. The full files stay in
 * data/reports/ for anyone who wants to check a specific variant.
 */
function sweepSummary() {
  const dir = path.join(ROOT, 'data', 'reports');
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => /^strategy-sweep-\d+m-(captured|modelled)\.json$/.test(f)).sort()
    : [];
  const runs = files.map((f) => {
    const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const families = {};
    for (const [family, rows] of Object.entries(d.families || {})) {
      const sorted = rows.slice().sort((a, b) => b.returnPct - a.returnPct);
      const oos = d.oosSummaries?.[family] || null;
      const withOos = rows.filter((r) => r.oos).slice().sort((a, b) => b.oos.returnPct - a.oos.returnPct);
      families[family] = {
        variants: rows.length,
        profitable: rows.filter((r) => r.returnPct > 0).length,
        medianReturnPct: d.summaries?.[family]?.medianReturnPct ?? null,
        best: sorted[0] ? { username: sorted[0].username, returnPct: sorted[0].returnPct, trades: sorted[0].totalTrades, params: sorted[0].params } : null,
        worst: sorted.length ? { username: sorted[sorted.length - 1].username, returnPct: sorted[sorted.length - 1].returnPct, params: sorted[sorted.length - 1].params } : null,
        luckBenchmark: d.summaries?.[family]?.luckBenchmark ?? null,
        // Post-split (stability) distribution when the sweep was run with one.
        // It is deliberately NOT labelled out-of-sample — see the sweep's own
        // oosSplit.why note, which is carried through here.
        postSplit: oos
          ? {
              profitable: oos.profitable,
              medianReturnPct: oos.medianReturnPct,
              best: withOos[0] ? { username: withOos[0].username, returnPct: withOos[0].oos.returnPct, trades: withOos[0].oos.totalTrades } : null,
              worst: withOos.length ? { username: withOos[withOos.length - 1].username, returnPct: withOos[withOos.length - 1].oos.returnPct } : null,
              variantsTraded: rows.filter((r) => r.oos && r.oos.totalTrades > 0).length,
              ofVariants: rows.length
            }
          : null
      };
    }
    return {
      file: `data/reports/${f}`,
      periodIntervalMinutes: d.periodIntervalMinutes,
      depthMode: d.depthMode,
      seed: d.seed,
      elapsedSeconds: d.elapsedSeconds,
      dataSource: d.dataSource,
      families,
      verdicts: d.verdicts,
      oosSplit: d.oosSplit || null,
      translatedFrom: d.translatedFrom
    };
  });
  return {
    generatedAt: new Date().toISOString(),
    note:
      'Series of controlled family experiments. Every variant is a separate replay of the SAME real bars with the same fees; the distributions are published instead of a ' +
      'single hero number because the best of N variants is expected to look good by luck. Rows marked postSplit come from a second run in which no order could execute ' +
      'before the split date (the account keeps its opening capital) — a stability check on the later bars, NOT evidence of out-of-sample skill, because the designs were ' +
      'written after that date existed in the store. Full per-variant rows are in the referenced files.',
    runs
  };
}

/* ------------------------------------------------------------------ *
 * main
 * ------------------------------------------------------------------ */
function main() {
  console.log('Generating reports (offline, from stored data)…');

  const forward = runForwardTest({ depthMode: 'captured' });
  forward.splitDefaultSource = `max(designedAt) across the roster = ${new Date(defaultSplitTs() * 1000).toISOString()}`;
  write('forward-test.json', forward);

  const depth = depthComparison();
  write('depth-comparison.json', depth);

  const flights = runCompetitionFlights({ depthMode: 'captured' });
  write('flights.json', {
    generatedAt: new Date().toISOString(),
    note:
      'Two flights, two windows. DAILY = period_interval 1440 over the full stored history. HOURLY = period_interval 60 over the curated intraday store. ' +
      'They are reported separately and are never merged into one ranking, because a strategy that needs intraday bars cannot be judged on daily ones.',
    intradayCoverage: getIntradayCoverage(60),
    daily: flights.daily
      ? {
          periodIntervalMinutes: 1440,
          horizonPeriods: flights.daily.competition.horizonPeriods,
          markets: flights.daily.competition.dataProvenance.markets.length,
          leaderboard: flights.daily.leaderboard,
          postMortems: flights.daily.results.map((r) => ({ username: r.username, verdict: r.analysis?.verdict, summary: r.analysis?.summary }))
        }
      : null,
    hourly: flights.hourly
      ? {
          periodIntervalMinutes: 60,
          horizonPeriods: flights.hourly.competition.horizonPeriods,
          markets: flights.hourly.competition.dataProvenance.markets.length,
          leaderboard: flights.hourly.leaderboard,
          postMortems: flights.hourly.results.map((r) => ({ username: r.username, verdict: r.analysis?.verdict, summary: r.analysis?.summary }))
        }
      : null,
    hourlyError: flights.hourlyError
  });

  write('calendar-audit.json', calendarAudit());

  write('liquidity-depth.json', liquidityDepth());

  write('sweep-summary.json', sweepSummary());

  write('candle-coverage.json', {
    generatedAt: new Date().toISOString(),
    markets: getCandleCoverage(),
    accumulated: {
      present: ACCUMULATED_HISTORY.present,
      marketCount: ACCUMULATED_HISTORY.marketCount,
      barCount: ACCUMULATED_HISTORY.barCount,
      generatedAt: ACCUMULATED_HISTORY.generatedAt
    }
  });

  console.log('Reports written to data/reports/ and docs/data/reports/.');
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    process.exit(main());
  } catch (err) {
    console.error(`run-reports failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  }
}

export { main, calendarAudit, depthComparison, liquidityDepth, sweepSummary };
