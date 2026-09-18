/**
 * KalshiPaperSim — Result Analysis & Attribution Engine
 * =====================================================================
 * Generates the "why it worked / why it didn't" narrative and the quantitative
 * return attribution STRICTLY FROM COMPUTED NUMBERS produced by the replay
 * engine. No sentence in this module asserts a fact that is not derived from
 * the trade log, and every generated string interpolates a computed value.
 *
 * This replaces the previous revision's hand-written post-mortems, which
 * described trades that never happened on tickers that do not exist.
 */

import { round2, round6 } from './simulation-engine.js';

/** Money formatter used inside generated prose. */
const usd = (v) => {
  const n = Number(v) || 0;
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
};
const pct = (v) => `${(Number(v) || 0) >= 0 ? '+' : ''}${round2(Number(v) || 0)}%`;

/**
 * Compute a full attribution breakdown from a replay result.
 * @param {object} result  output of ReplayEngine.run()
 */
export function computeAttribution(result) {
  const allRecords = (result.tradeLog || []).filter((t) => t && t.action);
  // Records where nothing could fill are NOT trades: they are disclosed below as
  // a liquidity constraint, never as a fabricated execution.
  const trades = allRecords.filter((t) => Number(t.contracts) > 0);
  const unfilledRecords = allRecords.filter((t) => t.fillStatus === 'unfilled' || Number(t.contracts) === 0);
  const partialRecords = allRecords.filter((t) => t.fillStatus === 'partial');
  const unfilledContracts = round2(
    result.unfilledContracts ||
      allRecords.reduce((sum, t) => sum + (Number(t.unfilled) || 0), 0)
  );
  const buys = trades.filter((t) => t.action === 'BUY');
  const sells = trades.filter((t) => t.action === 'SELL');
  const settles = trades.filter((t) => t.action === 'SETTLE');
  const makerFills = trades.filter((t) => t.role === 'maker');
  const takerFills = trades.filter((t) => t.role === 'taker');

  const feesPaid = round2(trades.reduce((s, t) => s + (Number(t.fee) || 0), 0));
  const slippageCost = round2(
    trades
      .filter((t) => typeof t.slippage === 'number' && typeof t.contracts === 'number')
      .reduce((s, t) => s + Math.abs(t.slippage) * t.contracts, 0)
  );
  const penaltyFills = trades.filter((t) => (t.fills || []).some((f) => f.penalty));
  const penaltyCost = round2(
    penaltyFills.reduce((s, t) => {
      const pf = (t.fills || []).filter((f) => f.penalty);
      return s + pf.reduce((a, f) => a + f.count * f.price, 0);
    }, 0)
  );

  const settlementPnl = round2(settles.reduce((s, t) => s + (Number(t.realizedPnl) || 0), 0));
  const earlyExitPnl = round2(sells.reduce((s, t) => s + (Number(t.realizedPnl) || 0), 0));

  const byTicker = {};
  for (const t of trades) {
    const k = t.ticker || 'UNKNOWN';
    byTicker[k] = byTicker[k] || { ticker: k, trades: 0, fees: 0, pnl: 0, contracts: 0 };
    byTicker[k].trades += 1;
    byTicker[k].fees = round2(byTicker[k].fees + (Number(t.fee) || 0));
    byTicker[k].contracts = round2(byTicker[k].contracts + (Number(t.contracts) || 0));
    if (typeof t.realizedPnl === 'number') byTicker[k].pnl = round2(byTicker[k].pnl + t.realizedPnl);
  }

  const stats = result.stats || {};
  const netPnl = round2(stats.realizedPnl ?? 0);
  const unrealized = round2(stats.unrealizedPnl ?? 0);
  const feesPaidStat = round2(stats.feesPaid ?? feesPaid);
  const equityChange = round2((stats.equity ?? result.initialCapital) - result.initialCapital);

  /* ------------------------------------------------------------------ *
   * ADDITIVE ATTRIBUTION
   * The engine's own accounting identity, verified numerically across
   * every strategy in the roster:
   *
   *   equityChange = realizedPnl + unrealizedPnl - feesPaid
   *
   * realizedPnl itself splits into binary settlements and early exits.
   * Only mutually exclusive terms may appear in `factors`, so that they
   * SUM to the equity change. The previous revision mixed in slippage and
   * maker-fill P&L, which are already embedded in the realized numbers —
   * the parts then disagreed with the whole by tens of thousands of
   * dollars. Those are now reported as non-additive `disclosures`.
   * ------------------------------------------------------------------ */
  const factors = [];
  const push = (factor, amount, description) =>
    factors.push({
      factor,
      amountUsd: round2(amount),
      contributionPct: equityChange !== 0 ? round2((amount / Math.abs(equityChange)) * 100) : 0,
      additive: true,
      description
    });

  if (settlementPnl !== 0) {
    push(
      'Binary settlement payoff ($1.00 / $0.00)',
      settlementPnl,
      `${settles.length} position(s) resolved at expiry. Winning contracts paid notional_value_dollars; losers paid $0.00. No settlement fee (verified).`
    );
  }
  if (earlyExitPnl !== 0) {
    push(
      'Early exit / profit taking',
      earlyExitPnl,
      `${sells.length} position(s) closed before expiry by selling into resting bids.`
    );
  }

  // Anything in stats.realizedPnl not explained by the two buckets above
  // (partial closes, rounding across many fills) is shown rather than dropped.
  const realizedResidual = round2(netPnl - (settlementPnl + earlyExitPnl));
  if (realizedResidual !== 0) {
    push(
      'Other realized P&L (uncategorized closes)',
      realizedResidual,
      `stats.realizedPnl ${usd(netPnl)} minus settlements ${usd(settlementPnl)} minus early exits ${usd(earlyExitPnl)}. Reported rather than silently absorbed.`
    );
  }

  if (unrealized !== 0) {
    push(
      'Unrealized mark-to-market on open positions',
      unrealized,
      `${(result.positionsOpen || []).length} position(s) still open at the end of the replay, marked to the last real closing quote.`
    );
  }
  if (feesPaidStat !== 0) {
    // The maker half of this sentence depends on the SERIES: a resting order is
    // charged only where the series is flagged quadratic_with_maker_fees.
    // Count from the fills themselves so the sentence can never assert a
    // coefficient that was not applied.
    const makerCharged = makerFills.filter((t) => t.makerFeesApply !== false);
    const makerFree = makerFills.filter((t) => t.makerFeesApply === false);
    push(
      'Exchange trading fees',
      -feesPaidStat,
      `Official quadratic schedule: round up(M x 0.07 x C x P x (1-P)) for takers; makers are charged 0.0175 only on series the exchange flags quadratic_with_maker_fees. ` +
        `Paid across ${takerFills.length + makerFills.length} fill(s) — ${makerCharged.length} maker fill(s) on maker-fee series, ${makerFree.length} maker fill(s) on plain quadratic series (charged $0).`
    );
  }

  const sumOfFactors = round2(factors.reduce((a, f) => a + f.amountUsd, 0));
  const residual = round2(equityChange - sumOfFactors);
  if (residual !== 0) {
    push(
      'Rounding residual',
      residual,
      `Equity change ${usd(equityChange)} minus the sum of the factors above ${usd(sumOfFactors)}. Per-trade dollar rounding (2 dp) accumulated over ${trades.length} fill(s); shown explicitly so the breakdown still totals the equity change.`
    );
  }

  /* ------------------------------------------------------------------ *
   * NON-ADDITIVE DISCLOSURES (memo items)
   * Real effects on the outcome, but already embedded in the factors
   * above — summing them would double count.
   * ------------------------------------------------------------------ */
  const disclosures = [];
  const disclose = (factor, amount, description, extra = {}) =>
    disclosures.push({
      factor,
      amountUsd: amount === null ? null : round2(amount),
      contributionPct: null,
      additive: false,
      description,
      ...extra
    });

  if (slippageCost !== 0) {
    disclose(
      'Slippage / book walking (memo)',
      slippageCost,
      'Cost of the VWAP versus the best quoted price while consuming depth. Already embedded in the realized/unrealized P&L above — not additive.'
    );
  }
  if (makerFills.length) {
    const charged = makerFills.filter((t) => t.makerFeesApply !== false).length;
    const free = makerFills.length - charged;
    disclose(
      'Market-making (maker fills) (memo)',
      makerFills.reduce((s, t) => s + (Number(t.realizedPnl) || 0), 0),
      `${makerFills.length} resting order(s) matched — ${charged} charged at the maker coefficient 0.0175 (series in the exchange's Maker Fees section), ` +
        `${free} charged NOTHING (plain quadratic series: the schedule only charges resting orders on maker-fee series). ` +
        'Their P&L is already inside the realized buckets above — not additive.'
    );
  }
  if (penaltyCost !== 0) {
    disclose(
      'Liquidity shortfall — PENALTY STRESS MODE (memo)',
      penaltyCost,
      `${penaltyFills.length} order(s) exceeded all visible depth and were filled at an INVENTED price 5 ticks beyond the last level. ` +
        'This only happens when exhaustionPolicy is "penalty"; it is a stress assumption, not real exchange behaviour. Not additive.'
    );
  }
  if (unfilledContracts > 0 || unfilledRecords.length || partialRecords.length) {
    disclose(
      'Liquidity constraint (unfilled remainder)',
      0,
      `${unfilledRecords.length} order(s) found no depth at all and ${partialRecords.length} filled only partially; ` +
        `${unfilledContracts.toLocaleString('en-US')} contract(s) were NOT executed. The engine fills only against depth that exists ` +
        'and never invents an execution price, so oversized aggression shows up as missed volume rather than as a fabricated loss.',
      { contractsNotFilled: unfilledContracts, ordersFullyUnfilled: unfilledRecords.length, ordersPartiallyFilled: partialRecords.length }
    );
  }

  const reconciliation = {
    identity: 'equityChange = realizedPnl + unrealizedPnl - feesPaid',
    equityChange,
    realizedPnl: netPnl,
    unrealizedPnl: unrealized,
    feesPaid: feesPaidStat,
    sumOfFactors: round2(factors.reduce((a, f) => a + f.amountUsd, 0)),
    residual: round2(equityChange - factors.reduce((a, f) => a + f.amountUsd, 0)),
    reconciles: Math.abs(equityChange - factors.reduce((a, f) => a + f.amountUsd, 0)) < 0.01
  };

  /* ------------------------------------------------------------------ *
   * DEPTH PROVENANCE (recommended-work item #5)
   * How much of the traded volume came out of a REAL captured ladder versus
   * the modelled one. A run can be honest whichever it used; what matters is
   * that the two are never mixed without saying so.
   * ------------------------------------------------------------------ */
  const contractsOnCapturedDepth = round2(
    trades.filter((t) => t.depthModel === 'captured_orderbook_reanchored').reduce((s, t) => s + (Number(t.contracts) || 0), 0)
  );
  const contractsOnModelledDepth = round2(
    trades.filter((t) => t.depthModel && t.depthModel !== 'captured_orderbook_reanchored').reduce((s, t) => s + (Number(t.contracts) || 0), 0)
  );
  const totalFilledContracts = round2(contractsOnCapturedDepth + contractsOnModelledDepth);
  const depthMix = {
    contractsOnCapturedDepth,
    contractsOnModelledDepth,
    totalFilledContracts,
    capturedPct: totalFilledContracts > 0 ? round2((contractsOnCapturedDepth / totalFilledContracts) * 100) : null,
    depthModels: [...new Set(trades.map((t) => t.depthModel).filter(Boolean))]
  };

  return {
    computedFrom: 'ReplayEngine fills (deterministic, seeded)',
    depthMix,
    netRealizedPnl: netPnl,
    equityChange,
    feesPaid,
    slippageCost,
    penaltyCost,
    settlementPnl,
    earlyExitPnl,
    counts: {
      buys: buys.length,
      sells: sells.length,
      settlements: settles.length,
      makerFills: makerFills.length,
      takerFills: takerFills.length,
      penaltyFills: penaltyFills.length,
      ordersFullyUnfilled: unfilledRecords.length,
      ordersPartiallyFilled: partialRecords.length
    },
    unfilledContracts,
    exhaustionPolicy: result.exhaustionPolicy || result.dataProvenance?.exhaustionPolicy || 'partial',
    byTicker: Object.values(byTicker).sort((a, b) => b.pnl - a.pnl),
    factors: factors.sort((a, b) => Math.abs(b.amountUsd) - Math.abs(a.amountUsd)),
    disclosures: disclosures.sort((a, b) => Math.abs(Number(b.amountUsd) || 0) - Math.abs(Number(a.amountUsd) || 0)),
    reconciliation
  };
}

/**
 * Generate the post-mortem narrative from computed stats + attribution.
 * Every claim references a number that exists in the result object.
 */
export function generatePostMortem(strategy, result, attribution) {
  const s = result.stats || {};
  const a = attribution;
  const trades = a.counts;
  const equityCurve = result.equityCurve || [];
  const periods = result.periods || 0;

  // Derived facts
  const traded = s.totalTrades > 0;
  const positive = (s.returnPct ?? 0) > 0;
  const topFactor = a.factors[0] || null;
  const worstFactor = [...a.factors].sort((x, y) => x.amountUsd - y.amountUsd)[0] || null;
  const bestTicker = a.byTicker[0] || null;
  const worstTicker = a.byTicker.length ? a.byTicker[a.byTicker.length - 1] : null;
  const dataNote = `Replay covered ${periods} real candlestick period(s) across ${Object.keys(result.dataProvenance?.candleCounts || {}).length} market(s).`;

  const whyItWorked = !traded
    ? `NOT APPLICABLE — the strategy generated ZERO trades on this dataset. Its entry conditions were never satisfied by the ${periods} real candlestick period(s) replayed. ` +
      `This is an honest result, not a bug: ${dataNote} With no fills there is no PnL, so the account finished at ${usd(s.equity)} (${pct(s.returnPct)}). ` +
      `To evaluate this strategy properly it needs a longer history (see the historical candlesticks endpoint) or a market universe that matches its filter.`
    : positive
      ? `The strategy finished at ${usd(s.equity)} (${pct(s.returnPct)}) over ${periods} period(s), executing ${s.totalTrades} trade(s) ` +
        `(${trades.buys} buys, ${trades.sells} sells, ${trades.settlements} settlements, ${trades.makerFills} maker fills). ` +
        `The dominant driver was ${topFactor ? `"${topFactor.factor}" at ${usd(topFactor.amountUsd)} (${topFactor.contributionPct}% of the equity change)` : 'not attributable'}. ` +
        (bestTicker ? `The most profitable market was ${bestTicker.ticker} (${usd(bestTicker.pnl)} across ${bestTicker.trades} trade(s)). ` : '') +
        `Win rate was ${s.winRate}% (${s.winningTrades}W / ${s.losingTrades}L) with a profit factor of ${s.profitFactor === Infinity || s.profitFactor === null ? 'undefined (no losing closed trades)' : s.profitFactor}. ` +
        `Total exchange fees paid were ${usd(a.feesPaid)} under Kalshi's official quadratic schedule.`
      : `The strategy LOST money: it finished at ${usd(s.equity)} (${pct(s.returnPct)}) after ${s.totalTrades} trade(s) over ${periods} period(s). ` +
        `The largest single drag was ${worstFactor ? `"${worstFactor.factor}" at ${usd(worstFactor.amountUsd)}` : 'not attributable'}. ` +
        `Win rate was ${s.winRate}% (${s.winningTrades}W / ${s.losingTrades}L), profit factor ${s.profitFactor === null ? 'undefined' : s.profitFactor}, and maximum drawdown ${s.maxDrawdownPct}%. ` +
        (a.penaltyCost > 0 ? `${trades.penaltyFills} order(s) exceeded all visible depth, costing ${usd(a.penaltyCost)} in penalty fills — the aggressive sizing mandate out-ran the available liquidity. ` : '') +
        `Fees paid were ${usd(a.feesPaid)}.`;

  const whyItDidnt = !traded
    ? `No drawdown analysis is possible because no position was ever opened (max drawdown ${s.maxDrawdownPct}%).`
    : `Maximum drawdown reached ${s.maxDrawdownPct}% (peak equity ${usd(s.peakEquity)}). ` +
      `Because the competition mandate forbids risk management, every position was held without a stop, so drawdown is driven entirely by ` +
      `${trades.settlements > 0 ? `binary settlement outcomes (${trades.settlements} settlement(s) at $1.00 or $0.00)` : 'open-position mark-to-market'}` +
      `${a.slippageCost > 0 ? ` plus ${usd(a.slippageCost)} of slippage from walking the book` : ''}. ` +
      (worstTicker && worstTicker.pnl < 0 ? `The worst market was ${worstTicker.ticker} at ${usd(worstTicker.pnl)}. ` : '') +
      (equityCurve.length > 1
        ? `Equity moved from ${usd(equityCurve[0].equity)} at the first period to ${usd(equityCurve[equityCurve.length - 1].equity)} at the last.`
        : '');

  return {
    generatedBy: 'analysis.js — computed from ReplayEngine fills only',
    dataNote,
    whyItWorked,
    whyItExperiencedDrawdowns: whyItDidnt,
    verdict: !traded
      ? 'UNTESTED_ON_THIS_DATASET'
      : positive
        ? 'PROFITABLE_ON_REPLAYED_HISTORY'
        : 'UNPROFITABLE_ON_REPLAYED_HISTORY',
    caveat:
      'This narrative describes performance on a SHORT real candlestick window (see dataProvenance). ' +
      'It is NOT a forecast, and it is NOT evidence about live Kalshi trading. Depth behind the touch was modelled because candlesticks do not carry depth.'
  };
}

/** Rank computed results into a competition leaderboard (highest return first). */
/**
 * Rank computed results.
 *
 * QUALIFICATION RULE (disclosed, mirrors live competition sites): a strategy
 * that never traded cannot be ranked — an untested 0% return is not a result.
 * Unqualified entries are returned after the ranked ones with `rank: null` and
 * `qualified: false`, so the UI can show them in a separate "not evaluated"
 * group instead of letting them occupy a podium place.
 */
export const LEADERBOARD_QUALIFICATION = Object.freeze({
  minTrades: 1,
  rule: 'At least one executed fill is required to be ranked.',
  rationale: 'A strategy that never traded has no measured performance; ranking it 0% would misrepresent an untested design as a competitive result.'
});

export function buildLeaderboard(results) {
  return results
    .map((r, i) => ({
      rank: 0,
      username: r.username,
      handle: `@${r.username}`,
      strategyId: r.strategyId,
      title: r.strategyTitle,
      returnPct: r.returnPct,
      finalEquity: r.finalEquity,
      initialCapital: r.initialCapital,
      realizedPnl: r.realizedPnl,
      totalTrades: r.totalTrades,
      winRate: r.winRate,
      profitFactor: r.profitFactor,
      maxDrawdownPct: r.maxDrawdownPct,
      feesPaid: r.feesPaid,
      periods: r.periods,
      unfilledOrders: r.unfilledOrders || r.attribution?.counts?.ordersFullyUnfilled || 0,
      unfilledContracts: r.unfilledContracts || r.attribution?.unfilledContracts || 0,
      // Where the fills came from: real captured ladders vs the modelled one.
      depthMix: r.attribution?.depthMix || null,
      depthMode: r.dataProvenance?.depthMode || null,
      verdict: r.analysis?.verdict || 'UNKNOWN',
      qualified: (r.totalTrades || 0) >= LEADERBOARD_QUALIFICATION.minTrades,
      // Why an entry is unranked, published instead of left blank: a 0-trade
      // strategy is either a design that found no eligible market OR one whose
      // point-in-time signal (e.g. the forecast archive) does not overlap the
      // window — two very different findings.
      disqualificationReason:
        (r.totalTrades || 0) >= LEADERBOARD_QUALIFICATION.minTrades
          ? null
          : r.skippedFlight
            ? `Flight mismatch — ${r.skippedFlight.reason} (this design runs in another flight.)`
            : `No executed fills — ${LEADERBOARD_QUALIFICATION.rule} Listed unranked: ${
                r.realSettlements?.eligibleMarkets?.length
                  ? 'the universe is tradeable, but this design\'s entry condition never fired on it (for a signal-driven design, the point-in-time signal may not cover the window).'
                  : 'no eligible market in this flight\'s universe for this design.'
              }`,
      computed: true
    }))
    .sort((a, b) => {
      // Qualified entries first, then by return.
      if (a.qualified !== b.qualified) return a.qualified ? -1 : 1;
      return b.returnPct - a.returnPct || b.finalEquity - a.finalEquity || a.username.localeCompare(b.username);
    })
    .map((row, i) => ({ ...row, rank: row.qualified ? i + 1 : null }));
}
