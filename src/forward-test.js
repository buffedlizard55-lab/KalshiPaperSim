/**
 * KalshiPaperSim — Backtest / Forward-test split
 * =====================================================================
 * THE REQUIREMENT
 *   "Backtest if possible using only real verified pricing, and then forward
 *    test … using official verified pricing and dates."
 *
 * THE PROBLEM WITH ALMOST EVERY "BACKTEST"
 *   A strategy designed in September 2026 can be "tested" on January 2026 data
 *   and look brilliant, because the designer already knew what happened. The
 *   numbers are real; the claim is not. The only way to tell the two apart is to
 *   name a DATE and be explicit about which side of it a number came from.
 *
 * WHAT THIS MODULE DOES
 *   Every strategy carries `designedAt` and the source it came from
 *   (src/strategies.js). Two measurements follow, and they are never mixed:
 *
 *   1. STRICT FORWARD TEST — bars AFTER max(designedAt). A fresh account that is
 *      forbidden to trade before that timestamp (ReplayEngine.noTradeBeforeTs),
 *      so nothing in the forward result can be manufactured by in-sample
 *      activity. On 2026-09-17 this window is EMPTY, and the module says so
 *      instead of printing a 0.00% that looks like a result. It fills in
 *      automatically as the daily ingest stores new real bars.
 *
 *   2. HELD-OUT WINDOW (labelled) — an explicit date chosen to leave the most
 *      recent N real bars untouched, so there is something to look at today. It
 *      is NOT a clean forward test: this repository's designs were written with
 *      the whole window in front of them. It is reported as a robustness check
 *      and carries that warning in the data, the UI and the docs.
 *
 *   Both are computed from the same real bars, the same official fee schedule,
 *   the same real-volume fill bound and the same depth source. Nothing is fitted:
 *   no strategy in this repository has a parameter that was optimised on the
 *   window (enforced by test 21/validateStrategies and by design).
 */

import { ReplayEngine } from './backtest-replay.js';
import { computeAttribution, generatePostMortem } from './analysis.js';
import { round2 } from './simulation-engine.js';
import { STRATEGIES } from './strategies.js';
import { getReplayableMarkets, getVerifiedCandleMap, getCapturedDepthProfiles } from './strategy-runner.js';

const DAY = 86400;

/**
 * The default strict split: the LATEST `designedAt` across the roster.
 * The latest date is the conservative choice — every strategy's forward window
 * then begins after every strategy was designed.
 */
export function defaultSplitTs(strategies = STRATEGIES) {
  const dates = strategies.map((s) => s.designedAt).filter(Boolean).map((d) => Date.parse(d));
  if (dates.length === 0) return null;
  return Math.floor(Math.max(...dates) / 1000);
}

/** Split an equity curve into two segments on real timestamps. */
export function splitEquityCurve(equityCurve, splitTs, initialCapital) {
  const before = equityCurve.filter((p) => p.ts <= splitTs);
  const after = equityCurve.filter((p) => p.ts > splitTs);
  const anchor = before.length ? before[before.length - 1] : { ts: splitTs, equity: initialCapital, returnPct: 0 };
  const last = after.length ? after[after.length - 1] : anchor;
  let peak = anchor.equity;
  let maxDd = 0;
  for (const p of after) {
    if (p.equity > peak) peak = p.equity;
    const dd = peak > 0 ? ((peak - p.equity) / peak) * 100 : 0;
    if (dd > maxDd) maxDd = dd;
  }
  return {
    inSample: {
      points: before.length,
      startTs: before[0]?.ts ?? null,
      endTs: anchor.ts,
      equityAtSplit: anchor.equity,
      returnPct: initialCapital > 0 ? round2(((anchor.equity - initialCapital) / initialCapital) * 100) : 0
    },
    forward: {
      points: after.length,
      startTs: after[0]?.ts ?? null,
      endTs: last.ts,
      equityAtStart: anchor.equity,
      equityAtEnd: last.equity,
      returnPct: after.length ? round2(((last.equity - anchor.equity) / anchor.equity) * 100) : null,
      maxDrawdownPct: after.length ? round2(maxDd) : null
    }
  };
}

/** Bars after a split timestamp — the real measure of whether a window exists. */
export function barsAfter(candlesByTicker, splitTs) {
  const stamps = new Set();
  for (const bars of Object.values(candlesByTicker)) {
    for (const b of bars || []) if (Number(b.end_period_ts) > splitTs) stamps.add(Number(b.end_period_ts));
  }
  return [...stamps].sort((a, b) => a - b);
}

/**
 * Run the backtest + both forward measurements for the whole roster.
 *
 * @param {object} [options]
 * @param {number} [options.splitTs]        strict forward split (default: latest designedAt)
 * @param {number|null} [options.heldOutTs] held-out split; null disables it
 * @param {Array}  [options.strategies]
 * @param {Array}  [options.markets]
 * @param {Object} [options.candlesByTicker]
 * @param {number} [options.initialCapital=100000]
 * @param {'modelled'|'captured'} [options.depthMode='captured']
 * @param {number} [options.maxFillFractionOfPeriodVolume]
 */
export function runForwardTest(options = {}) {
  const strategies = options.strategies || STRATEGIES;
  const markets = options.markets || getReplayableMarkets();
  const candlesByTicker = options.candlesByTicker || getVerifiedCandleMap(markets.map((m) => m.ticker));
  const initialCapital = options.initialCapital ?? 100000;
  const depthMode = options.depthMode === 'modelled' ? 'modelled' : 'captured';
  const depthProfiles = options.depthProfiles || getCapturedDepthProfiles();
  const splitTs = options.splitTs ?? defaultSplitTs(strategies);
  if (!splitTs) {
    throw new Error(
      'runForwardTest: no split date. Pass splitTs, or give the strategies a designedAt date — ' +
        'a forward test without a date to split on would just be a backtest wearing a different label.'
    );
  }

  const allTs = Object.values(candlesByTicker).flat().map((c) => Number(c.end_period_ts));
  const windowStart = Math.min(...allTs);
  const windowEnd = Math.max(...allTs);

  // Held-out window: the most recent N real bars, only when that still leaves a
  // meaningful in-sample segment and the strict window has nothing in it yet.
  const heldOutDays = options.heldOutDays ?? 84;
  // A strict forward window only replaces the held-out view once it is long
  // enough to say something (MIN_MEANINGFUL_FORWARD_BARS). Until then both are
  // computed, and the strict one carries a significance note.
  const MIN_MEANINGFUL_FORWARD_BARS = 20;
  const heldOutTs =
    options.heldOutTs !== undefined
      ? options.heldOutTs
      : barsAfter(candlesByTicker, splitTs).length >= MIN_MEANINGFUL_FORWARD_BARS
        ? null
        : windowEnd - heldOutDays * DAY;

  const engineCommon = {
    markets,
    candlesByTicker,
    initialCapital,
    notional: options.notional ?? 1.0,
    settleAtEnd: false,
    maxFillFractionOfPeriodVolume: options.maxFillFractionOfPeriodVolume,
    depthMode,
    depthProfiles,
    exhaustionPolicy: 'partial'
  };

  const strictBars = barsAfter(candlesByTicker, splitTs);

  const rows = strategies.map((strategy) => {
    const universeMarkets = strategy.universe ? markets.filter((m) => strategy.universe.includes(m.series_ticker)) : markets;
    const universeCandles = {};
    for (const m of universeMarkets) if (candlesByTicker[m.ticker]) universeCandles[m.ticker] = candlesByTicker[m.ticker];
    if (universeMarkets.length === 0) return null;

    const base = { ...engineCommon, markets: universeMarkets, candlesByTicker: universeCandles };

    // (a) full-window backtest
    const backtest = new ReplayEngine(base).run(strategy, { username: strategy.username, capital: initialCapital, seed: options.seed ?? 20260917 });
    const segments = splitEquityCurve(backtest.equityCurve, splitTs, initialCapital);

    const summaryOf = (run) => {
      const attribution = computeAttribution(run);
      const analysis = generatePostMortem(strategy, run, attribution);
      return {
        finalEquity: run.finalEquity,
        returnPct: run.returnPct,
        totalTrades: run.totalTrades,
        winRate: run.winRate,
        maxDrawdownPct: run.maxDrawdownPct,
        feesPaid: run.feesPaid,
        unfilledContracts: run.unfilledContracts,
        suppressedActions: run.suppressedActions,
        depthMix: attribution.depthMix,
        verdict: analysis.verdict,
        why: analysis.summary
      };
    };

    // (b) strict forward test — may have no bars at all; then no run is done and
    //     the row says so rather than reporting a fabricated zero.
    let strictForward = null;
    if (strictBars.length > 0) {
      const run = new ReplayEngine({ ...base, noTradeBeforeTs: splitTs }).run(strategy, {
        username: `${strategy.username}#forward`,
        capital: initialCapital,
        seed: options.seed ?? 20260917
      });
      strictForward = { ...summaryOf(run), bars: strictBars.length };
    }

    // (c) held-out window (labelled: not a clean forward test)
    let heldOut = null;
    if (heldOutTs) {
      const bars = barsAfter(candlesByTicker, heldOutTs);
      const run = new ReplayEngine({ ...base, noTradeBeforeTs: heldOutTs }).run(strategy, {
        username: `${strategy.username}#heldout`,
        capital: initialCapital,
        seed: options.seed ?? 20260917
      });
      heldOut = { ...summaryOf(run), bars: bars.length };
    }

    return {
      username: strategy.username,
      strategyId: strategy.id,
      title: strategy.title,
      category: strategy.category,
      designedAt: strategy.designedAt || null,
      designSource: strategy.designSource || null,
      designSourceUrl: strategy.designSourceUrl || null,
      universeMarkets: universeMarkets.map((m) => m.ticker),
      depthMode,
      backtest: summaryOf(backtest),
      inSample: segments.inSample,
      strictForward,
      heldOut: heldOut
        ? {
            ...heldOut,
            label:
              'HELD-OUT WINDOW — NOT a clean forward test. The bars in this window predate the design date, so a designer with the full history in front of them could have been influenced by them. It is a robustness check on real, untouched-recent data, nothing more.'
          }
        : null
    };
  }).filter(Boolean);

  const byForward = rows
    .filter((r) => r.strictForward && r.strictForward.totalTrades >= 1)
    .sort((a, b) => b.strictForward.returnPct - a.strictForward.returnPct);
  const byHeldOut = rows
    .filter((r) => r.heldOut && r.heldOut.totalTrades >= 1)
    .sort((a, b) => b.heldOut.returnPct - a.heldOut.returnPct);

  return {
    generatedAt: new Date().toISOString(),
    method: {
      splitTs,
      forwardStart: new Date(splitTs * 1000).toISOString(),
      strictForwardBars: strictBars.length,
      strictForwardStart: strictBars.length ? new Date(strictBars[0] * 1000).toISOString() : null,
      strictForwardEnd: strictBars.length ? new Date(strictBars[strictBars.length - 1] * 1000).toISOString() : null,
      heldOutTs: heldOutTs || null,
      heldOutStart: heldOutTs ? new Date(heldOutTs * 1000).toISOString() : null,
      windowStart: new Date(windowStart * 1000).toISOString(),
      windowEnd: new Date(windowEnd * 1000).toISOString(),
      rule:
        'STRICT FORWARD = bars strictly after max(designedAt), replayed on a fresh account forbidden to trade before that timestamp. ' +
        'HELD-OUT = a later real window, labelled as a robustness check because the designs were authored with knowledge of it.',
      minMeaningfulForwardBars: MIN_MEANINGFUL_FORWARD_BARS,
      strictForwardNote:
        strictBars.length === 0
          ? 'The strict forward window is EMPTY.'
          : strictBars.length < MIN_MEANINGFUL_FORWARD_BARS
            ? `The strict forward window holds ${strictBars.length} real bar(s) — below the ${MIN_MEANINGFUL_FORWARD_BARS}-bar floor this project uses for per-market statistics, so treat those numbers as directional only. It grows by one real bar per daily ingest run.`
            : `The strict forward window holds ${strictBars.length} real bar(s).`,
      emptyForwardExplanation:
        strictBars.length === 0
          ? `No real bar exists after ${new Date(splitTs * 1000).toISOString().slice(0, 10)} yet: this build's stored window ends ` +
            `${new Date(windowEnd * 1000).toISOString().slice(0, 10)}. The daily ingest (scripts/ingest-history.mjs) appends one real day per run, ` +
            'so this window fills itself in from the first new bar onward. Reporting 0.00% here would be a fabricated result, so no forward number is shown until a bar exists.'
          : null,
      depthMode,
      feeSchedule: 'Kalshi quadratic schedule, effective 2026-07-07 (https://kalshi.com/docs/kalshi-fee-schedule.pdf)',
      volumeBound:
        options.maxFillFractionOfPeriodVolume === undefined
          ? "Each fill is capped at 10% of the bar's real traded volume (default) — no order may consume more liquidity than actually traded."
          : `Each fill is capped at ${options.maxFillFractionOfPeriodVolume} of the bar's real traded volume.`,
      isLiveTrading: false,
      limitation:
        'Neither measurement is live trading. Both replay real stored bars; the strict forward window simply contains bars that did not exist when the design was written.'
    },
    totals: {
      strategies: rows.length,
      strictForwardMeasured: byForward.length,
      heldOutMeasured: byHeldOut.length,
      bestStrictForward: byForward[0] ? { username: byForward[0].username, returnPct: byForward[0].strictForward.returnPct } : null,
      bestHeldOut: byHeldOut[0] ? { username: byHeldOut[0].username, returnPct: byHeldOut[0].heldOut.returnPct } : null
    },
    rows,
    rankedStrictForward: byForward.map((r) => ({ username: r.username, returnPct: r.strictForward.returnPct, trades: r.strictForward.totalTrades })),
    rankedHeldOut: byHeldOut.map((r) => ({ username: r.username, returnPct: r.heldOut.returnPct, trades: r.heldOut.totalTrades }))
  };
}
