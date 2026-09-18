/**
 * KalshiPaperSim — Recreated strategy FAMILIES (parameter sweeps)
 * =====================================================================
 * WHY FAMILIES AND NOT SINGLE STRATEGIES
 *   The most useful public research found for this project (see
 *   src/research-sources.js → R01, R06, R08) did not test one strategy. It swept
 *   a whole parameter family and published the DISTRIBUTION: how many variants
 *   made money, the median, the best and the worst. A single backtest cannot
 *   distinguish a real edge from the luckiest setting in a grid, and the same
 *   issue is raised in R08 ("the Deflated Sharpe warning says the winner was not
 *   distinguishable from the luckiest result expected across a sweep this size").
 *
 *   So each family here is a parameterised strategy builder. scripts/strategy-sweep.mjs
 *   runs every variant over the same real bars, and the report publishes the
 *   distribution instead of a hero number.
 *
 * TRANSLATION RULES (stated because a recreation is never an exact copy):
 *   • SIZING. The source sized in fixed contract counts (fade_size=100). This
 *     project sizes as a fraction of equity, so a variant is comparable on the
 *     competition's capital and is scale-free. Every size below is a percentage
 *     of available cash.
 *   • EXITS. The source's exits (+4¢ to +6¢ take-profit, "hold" otherwise) are
 *     reproduced as resting maker offers at cost + N ticks, cancelled and
 *     re-quoted on the next period. A take-profit that would price above the
 *     contract's $1 maximum is skipped, never clamped.
 *   • FEES. Maker vs taker is decided by the engine: a resting order that fills
 *     is charged the maker coefficient, an order that crosses the spread is
 *     charged the taker coefficient, exactly as the official schedule states.
 *
 * Nothing in this file knows the outcome of any run. It only builds objects with
 * a decide(ctx) function; the engine computes everything else.
 */

import { snapToGrid } from './price-grid.js';

const round2 = (n) => Math.round(n * 100) / 100;
const round6 = (n) => Math.round(n * 1e6) / 1e6;

/** Shared snapshot taken from BASE in src/strategies.js (kept local to avoid a cycle). */
const SWEEP_BASE = {
  startingCapital: 100000,
  competitionMandate: 'MAXIMUM RETURN. No stop-losses, no position caps, no volatility targeting.',
  riskManagement: 'NONE (by mandate)',
  universe: null,
  resultProvenance: 'COMPUTED_AT_RUNTIME_BY_ReplayEngine — never hard-coded',
  designedAt: '2026-09-18',
  designSource: 'Recreated from a public source (see src/research-sources.js)',
  designSourceUrl: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
  flight: 'hourly',
  preferredPeriodMinutes: 60
};

/** Rest a maker offer at cost + target for every open position in this market. */
function restingTakeProfit(ctx, targetProbability) {
  const { book, portfolio, ticker } = ctx;
  const actions = [];
  for (const pos of portfolio.positions.values()) {
    if (pos.ticker !== ticker || pos.side !== 'YES' || pos.count <= 0) continue;
    const target = snapToGrid(Number(pos.avgCost) + targetProbability, book.grid, 'up');
    if (!(target > 0) || target >= book.notional) continue;
    if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
    actions.push({
      type: 'limit',
      direction: 'ask',
      side: 'YES',
      count: pos.count,
      price: target,
      reason: `maker take-profit at cost ${round6(pos.avgCost)} + ${targetProbability}`
    });
  }
  return actions;
}

/* ------------------------------------------------------------------ *
 * FAMILY 1 — panic_fade  (R01's only profitable archetype)
 * ------------------------------------------------------------------ */

/**
 * @param {object} p
 * @param {number} p.threshold  absolute probability drop in one bar that counts as a panic
 * @param {number} p.sizePct    fraction of available cash deployed when the panic fires
 * @param {'hold'|number} p.exit 'hold' to the end of the window, or a take-profit offset
 * @param {number} [p.phaseShift] placebo knob: evaluate the signal N periods later than it fired
 */
export function buildPanicFade({ threshold, sizePct, exit, phaseShift = 0, label = null }) {
  const username = label || `PanicFade_t${String(threshold).replace('0.', '')}_s${Math.round(sizePct * 100)}${exit === 'hold' ? '_hold' : `_tp${Math.round(exit * 100)}`}${phaseShift ? `_shift${phaseShift}` : ''}`;
  return {
    ...SWEEP_BASE,
    id: `sweep_panic_fade_${threshold}_${Math.round(sizePct * 100)}_${exit}_${phaseShift}`,
    username,
    handle: `@${username}`,
    avatar: '🌊',
    title: `Panic fade (threshold ${threshold}, size ${Math.round(sizePct * 100)}% of cash, exit ${exit === 'hold' ? 'hold to window end' : `${exit} above cost`})`,
    category: 'Intraday Mean Reversion',
    tagline: `Fades a ${threshold} one-bar drop with ${Math.round(sizePct * 100)}% of cash.`,
    sizingPct: sizePct,
    maxParticipation: 3,
    thesis:
      'Fade a violent one-bar repricing and take the bounce. The mechanism the source proposes is liquidity withdrawal rather than information, so the first bars after a ' +
      'shock are oversold. This variant uses the source\'s own absolute threshold rule; nothing is tuned to this data.',
    rules: {
      entry: `Buy YES when the bar closes at least ${threshold} below the previous bar's close.`,
      sizing: `${Math.round(sizePct * 100)}% of available cash, capped at 3x visible depth.`,
      exit: exit === 'hold' ? 'Hold to the end of the window.' : `Rest a maker offer at cost + ${exit}; re-quote each period.`,
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, history } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      // WHICH BAR PANICKED?
      //   phaseShift 0  → the CURRENT bar (history ends with the current candle),
      //                   so the drop is prevClose − close, exactly the source rule.
      //   phaseShift k  → the bar k periods back, so the same trigger is acted on
      //                   k periods LATE. That is the placebo: identical rule,
      //                   delayed execution, used to test whether the result comes
      //                   from the timing of the signal or from drift.
      const currentIdx = history.length - 1;
      const panicIdx = currentIdx - phaseShift;
      if (panicIdx < 1) return [];
      const panickedClose = history[panicIdx].trade.close;
      const priorClose = history[panicIdx - 1].trade.close;
      if (panickedClose === null || panickedClose === undefined || priorClose === null || priorClose === undefined) return [];
      const drop = priorClose - panickedClose;
      const actions = [];
      if (exit !== 'hold') actions.push(...restingTakeProfit(ctx, exit));
      if (drop >= threshold) {
        const count = countFor(ctx, sizePct);
        if (count > 0) {
          actions.push({
            type: 'buy',
            side: 'YES',
            count,
            reason:
              phaseShift === 0
                ? `panic fade: close ${round6(panickedClose)} is ${round6(drop)} below previous close ${round6(priorClose)} (t${ctx.periodIndex})`
                : `panicked ${phaseShift} bar(s) ago (drop ${round6(drop)} >= ${threshold}), entering ${round6(panickedClose)} late (t${ctx.periodIndex})`
          });
        }
      }
      return actions;
    },
    sweep: { family: phaseShift ? 'panic_fade_placebo' : 'panic_fade', threshold, sizePct, exit, phaseShift }
  };
}

/* ------------------------------------------------------------------ *
 * FAMILY 2 — mean_reversion  (R01 measured this family as 0-for-432)
 * ------------------------------------------------------------------ */

/** Buy the band, sell the band: "entry bands from 0.10 to 0.40 against exits at 0.50 to 0.90". */
export function buildMeanReversion({ entryBand, exitBand, sizePct = 0.5, cooldown = 0, label = null }) {
  const username = label || `MeanRev_e${Math.round(entryBand * 100)}_x${Math.round(exitBand * 100)}`;
  return {
    ...SWEEP_BASE,
    id: `sweep_mean_rev_${entryBand}_${exitBand}`,
    username,
    handle: `@${username}`,
    avatar: '↔️',
    title: `Mean reversion (enter ≤ ${entryBand}, exit ≥ ${exitBand})`,
    category: 'Mean Reversion',
    tagline: `Buys below ${entryBand} and sells above ${exitBand}.`,
    sizingPct: sizePct,
    maxParticipation: 3,
    thesis:
      'The price drifts away and comes back, so buying the low band and selling the high band collects the round trip. The public sweep this is recreated from measured ' +
      'every variant of this shape losing money on 15-minute markets and gave a structural reason: "the price does not have time to do that" inside a short-dated market.',
    rules: {
      entry: `Buy YES when the close is at or below ${entryBand}.`,
      sizing: `${Math.round(sizePct * 100)}% of available cash per signal.`,
      exit: `Rest a maker offer at ${exitBand} or better; hold to the end of the window if it never trades.`,
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { candle, book, portfolio } = ctx;
      const close = candle.trade.close;
      if (close === null) return [];
      const actions = [];
      // Exit leg first: a resting offer at the exit band for anything held.
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const target = Math.max(snapToGrid(exitBand, book.grid, 'up'), snapToGrid(Number(pos.avgCost), book.grid, 'up'));
        if (!(target > 0) || target >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - target) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: target, reason: `mean reversion exit at ${target}` });
      }
      const cooling = cooldown > 0 && ctx.history.slice(-cooldown - 1, -1).some((c) => c.trade.close !== null && c.trade.close <= entryBand);
      if (!cooling && close <= entryBand) {
        const count = countFor(ctx, sizePct);
        if (count > 0) actions.push({ type: 'buy', side: 'YES', count, reason: `entry band: close ${close} <= ${entryBand}` });
      }
      return actions;
    },
    sweep: { family: 'mean_reversion', entryBand, exitBand, sizePct, cooldown }
  };
}

/* ------------------------------------------------------------------ *
 * FAMILY 3 — tight_scalp  (R01: "eaten alive by fees and slippage")
 * ------------------------------------------------------------------ */

/** Rest a bid at a fixed price, flip it to a resting offer a couple of ticks higher. */
export function buildTightScalp({ buyAt, target, sizePct = 0.25, label = null }) {
  const username = label || `TightScalp_${Math.round(buyAt * 100)}to${Math.round((buyAt + target) * 100)}`;
  return {
    ...SWEEP_BASE,
    id: `sweep_tight_scalp_${buyAt}_${target}`,
    username,
    handle: `@${username}`,
    avatar: '✂️',
    title: `Tight scalp: bid ${buyAt}, offer ${round2(buyAt + target)}`,
    category: 'Spread Scalping',
    tagline: `Rests a bid at ${buyAt} and flips any fill to a maker offer ${Math.round(target * 100)}¢ higher.`,
    sizingPct: sizePct,
    maxParticipation: 3,
    thesis:
      'Collect the spread: pay the bid, sell the offer. The public sweep this is recreated from measured high-turnover tight-band variants at 62-63% win rates that still lost ' +
      '75-78% of the window, attributing it to fees and slippage. This family re-measures that on bars from a different series and a different period length.',
    rules: {
      entry: `Rest a maker bid at ${buyAt} on every tracked market, every period.`,
      sizing: `${Math.round(sizePct * 100)}% of cash per rung.`,
      exit: `Rest a maker offer at ${round2(buyAt + target)} for any filled contract.`,
      riskManagement: 'NONE (by mandate)'
    },
    decide(ctx) {
      const { book, portfolio } = ctx;
      const actions = [];
      for (const pos of portfolio.positions.values()) {
        if (pos.ticker !== ctx.ticker || pos.side !== 'YES' || pos.count <= 0) continue;
        const offer = snapToGrid(buyAt + target, book.grid, 'up');
        if (!(offer > 0) || offer >= book.notional) continue;
        if (book.restingOrders.some((o) => o.direction === 'ask' && o.outcome === 'YES' && Math.abs(o.price - offer) < 1e-9)) continue;
        actions.push({ type: 'limit', direction: 'ask', side: 'YES', count: pos.count, price: offer, reason: `flip to maker offer at ${offer}` });
      }
      const bid = snapToGrid(buyAt, book.grid, 'down');
      const resting = book.restingOrders.filter((o) => o.direction === 'bid' && o.outcome === 'YES').length;
      if (resting < 2 && bid >= book.tick) {
        const count = countFor(ctx, sizePct);
        if (count > 0) actions.push({ type: 'limit', direction: 'bid', side: 'YES', count, price: bid, reason: `rest bid at ${buyAt}` });
      }
      return actions;
    },
    sweep: { family: 'tight_scalp', buyAt, target, sizePct }
  };
}

/** Shared sizing helper: fraction of cash, capped by visible depth and a 5% fee reserve. */
function countFor(ctx, sizePct) {
  const { book, portfolio } = ctx;
  const ask = book.getBestYesAsk();
  const ref = ask !== null && ask > 0 ? ask : Math.max(book.tick, 0.01);
  const budget = portfolio.cash * sizePct;
  let count = Math.floor((budget / (ref * 1.05)) * 100) / 100;
  const depth = book.getYesAskTiers().reduce((s, t) => s + t.count, 0);
  if (depth > 0) count = Math.min(count, round2(depth * 3));
  return Math.max(0, round2(count));
}

/* ------------------------------------------------------------------ *
 * The grid — every variant the sweep report runs
 * ------------------------------------------------------------------ */

export const SWEEP_DEFINITION = Object.freeze({
  /**
   * panic_fade: 6 thresholds x 4 sizes x 4 exits = 96 variants.
   * 96 is deliberate: the source that documented this archetype ran 96 variants
   * of it, so the count of profitable variants is comparable as a METHOD, not as
   * a number (different series, different period, different capital).
   */
  panicFade: {
    thresholds: [0.02, 0.03, 0.04, 0.06, 0.08, 0.1],
    sizes: [0.25, 0.5, 0.75, 1.0],
    exits: ['hold', 0.02, 0.04, 0.06]
  },
  /** mean_reversion: 4 entry bands x 3 exit bands = 12 variants (source: 432). */
  meanReversion: {
    entryBands: [0.1, 0.2, 0.3, 0.4],
    exitBands: [0.5, 0.7, 0.9]
  },
  /** tight_scalp: 4 prices x 2 targets = 8 variants. */
  tightScalp: {
    buyPrices: [0.05, 0.1, 0.15, 0.2],
    targets: [0.02, 0.04]
  },
  /**
   * PLACEBO. The same panic-fade rule, but the signal is evaluated `shift`
   * periods LATE — the entry happens after the panicking bar, not on it. If the
   * archetype's result comes from the timing of the signal rather than from
   * general drift in these markets, the placebo must degrade. Published next to
   * the real family so a reader can compare.
   */
  placebo: {
    thresholds: [0.02, 0.04, 0.06],
    sizes: [1.0],
    exits: ['hold'],
    shifts: [1, 4]
  }
});

export function buildSweep() {
  const out = [];
  const d = SWEEP_DEFINITION;
  for (const threshold of d.panicFade.thresholds) {
    for (const sizePct of d.panicFade.sizes) {
      for (const exit of d.panicFade.exits) out.push(buildPanicFade({ threshold, sizePct, exit }));
    }
  }
  for (const entryBand of d.meanReversion.entryBands) {
    for (const exitBand of d.meanReversion.exitBands) out.push(buildMeanReversion({ entryBand, exitBand }));
  }
  for (const buyAt of d.tightScalp.buyPrices) {
    for (const target of d.tightScalp.targets) out.push(buildTightScalp({ buyAt, target }));
  }
  for (const threshold of d.placebo.thresholds) {
    for (const sizePct of d.placebo.sizes) {
      for (const exit of d.placebo.exits) {
        for (const phaseShift of d.placebo.shifts) out.push(buildPanicFade({ threshold, sizePct, exit, phaseShift }));
      }
    }
  }
  return out;
}

export { SWEEP_BASE, restingTakeProfit, countFor };
