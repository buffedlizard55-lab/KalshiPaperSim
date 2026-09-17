/**
 * KalshiPaperSim — Multi-Market Portfolio Accounting
 * =====================================================================
 * The replay engine already trades several markets at once; what was missing
 * was the ACCOUNTING for that: how much of a strategy's capital sat in each
 * market, how concentrated it was, and how the markets it traded actually
 * moved relative to one another.
 *
 * Everything here is computed from two inputs only:
 *   1. the replay's own trade log / open positions (already computed), and
 *   2. the REAL captured candlesticks of the competition universe.
 *
 * Nothing is modelled, and where a statistic cannot be computed honestly
 * (not enough overlapping periods, no trades) the function returns null with a
 * reason instead of a number.
 */

import { round2, round6 } from './simulation-engine.js';

/* ------------------------------------------------------------------ *
 * 1. Cross-market correlation from REAL candlesticks
 * ------------------------------------------------------------------ */

/** Pearson correlation of two equal-length numeric vectors. */
export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return null;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx;
    const b = ys[i] - my;
    num += a * b;
    dx += a * a;
    dy += b * b;
  }
  if (dx === 0 || dy === 0) return null; // constant series — correlation undefined
  return round6(num / Math.sqrt(dx * dy));
}

/**
 * Per-market close series keyed by end_period_ts (nulls on no-trade periods are
 * preserved so they can be excluded from every statistic rather than counted).
 */
export function closeSeriesByTicker(candlesByTicker) {
  const out = {};
  for (const [ticker, bars] of Object.entries(candlesByTicker || {})) {
    const list = Array.isArray(bars) ? bars : bars?.candlesticks || [];
    const map = new Map();
    for (const b of list) {
      const raw = b?.price?.close_dollars;
      map.set(Number(b.end_period_ts), raw === undefined || raw === null ? null : Number(raw));
    }
    out[ticker] = map;
  }
  return out;
}

/**
 * Pairwise correlation of DAILY CLOSE-TO-CLOSE CHANGES across the competition
 * universe, computed only on periods where BOTH markets printed a trade.
 *
 * Why absolute (dollar) changes and not percentage returns: these contracts
 * trade between $0.01 and $0.99, so a 1-tick move is a 100% return at $0.01 and
 * a 1% return at $1.00. Percentage returns would make the deepest
 * out-of-the-money markets look infinitely volatile. Dollar changes are the
 * economically meaningful unit for a $1-notional binary contract.
 *
 * @param {Object} candlesByTicker  { ticker: [rawCandlestick] }
 * @param {Object} [opts] { minOverlap = 20 }
 */
export function computeUniverseCorrelation(candlesByTicker, opts = {}) {
  const minOverlap = opts.minOverlap ?? 20;
  const series = closeSeriesByTicker(candlesByTicker);
  const tickers = Object.keys(series).sort();
  const pairs = [];
  const matrix = {};

  for (const a of tickers) {
    matrix[a] = {};
    matrix[a][a] = 1;
  }

  for (let i = 0; i < tickers.length; i++) {
    for (let j = i + 1; j < tickers.length; j++) {
      const A = series[tickers[i]];
      const B = series[tickers[j]];
      const stamps = [...A.keys()].filter((ts) => B.has(ts)).sort((x, y) => x - y);

      const da = [];
      const db = [];
      let prevA = null;
      let prevB = null;
      for (const ts of stamps) {
        const ca = A.get(ts);
        const cb = B.get(ts);
        // A null close means nothing traded that period: there is no observed
        // change to correlate, so the period is skipped rather than filled in.
        if (ca !== null && cb !== null && prevA !== null && prevB !== null) {
          da.push(round6(ca - prevA));
          db.push(round6(cb - prevB));
        }
        if (ca !== null) prevA = ca;
        if (cb !== null) prevB = cb;
      }

      const overlap = stamps.length;
      const usable = da.length;
      let correlation = null;
      let note;
      if (usable < minOverlap) {
        note = `Not computed: only ${usable} overlapping period(s) with an observed close-to-close change (minimum ${minOverlap}). No value is reported rather than extrapolating one.`;
      } else {
        correlation = pearson(da, db);
        note = correlation === null
          ? 'Not computed: one series was constant over the overlap, so correlation is mathematically undefined.'
          : `Pearson correlation of daily close-to-close dollar changes over ${usable} overlapping real period(s).`;
      }
      pairs.push({
        a: tickers[i],
        b: tickers[j],
        overlappingPeriods: overlap,
        usablePeriods: usable,
        correlation,
        note
      });
      matrix[tickers[i]][tickers[j]] = correlation;
      matrix[tickers[j]][tickers[i]] = correlation;
    }
  }

  return {
    method: 'Pearson correlation of daily close-to-close CHANGES (dollars) in the real captured candlesticks',
    minOverlap,
    markets: tickers,
    pairs,
    matrix,
    computedFrom: 'REAL_CANDLESTICKS_ONLY',
    note:
      'Correlation is measured on real captured closes. It describes the historical window only — it is not a forecast of future co-movement.'
  };
}

/* ------------------------------------------------------------------ *
 * 2. Per-market exposure accounting from a computed replay result
 * ------------------------------------------------------------------ */

/**
 * Per-market breakdown of a single strategy's replay result.
 *
 * Definitions (all from computed numbers):
 *   contractsTraded   — sum of filled contracts on that market
 *   costBasisAtRisk   — contracts still open × average cost (capital tied up now)
 *   peakExposureUsd   — largest cost basis that market ever held during the replay
 *   feesUsd           — exchange fees paid on that market
 *   realizedPnlUsd    — closed-trade P&L on that market (gross of fees)
 *   openPnlUsd        — mark-to-market P&L of positions still open at the end
 *
 * @param {object} result  output of ReplayEngine.run()
 */
export function computePortfolioExposure(result) {
  const trades = (result.tradeLog || []).filter((t) => t && Number(t.contracts) > 0);
  const open = (result.positionsOpen || []).filter(Boolean);
  const finalEquity = Number(result.finalEquity ?? result.stats?.equity ?? result.initialCapital) || 0;

  const byTicker = new Map();
  const bump = (ticker) => {
    const k = ticker || 'UNKNOWN';
    if (!byTicker.has(k)) {
      byTicker.set(k, {
        ticker: k,
        trades: 0,
        contractsTraded: 0,
        buys: 0,
        sells: 0,
        settlements: 0,
        feesUsd: 0,
        realizedPnlUsd: 0,
        openContracts: 0,
        costBasisAtRisk: 0,
        openPnlUsd: 0,
        peakExposureUsd: 0
      });
    }
    return byTicker.get(k);
  };

  for (const t of trades) {
    const row = bump(t.ticker);
    row.trades += 1;
    row.contractsTraded = round2(row.contractsTraded + (Number(t.contracts) || 0));
    row.feesUsd = round2(row.feesUsd + (Number(t.fee) || 0));
    if (t.action === 'BUY') row.buys += 1;
    else if (t.action === 'SELL') row.sells += 1;
    else if (t.action === 'SETTLE') row.settlements += 1;
    if (typeof t.realizedPnl === 'number') row.realizedPnlUsd = round2(row.realizedPnlUsd + t.realizedPnl);
  }

  for (const p of open) {
    const row = bump(p.ticker);
    const count = Number(p.count) || 0;
    const avgCost = Number(p.avgCost) || 0;
    const last = Number(p.currentPrice ?? p.markPrice ?? avgCost) || avgCost;
    row.openContracts = round2(row.openContracts + count);
    row.costBasisAtRisk = round2(row.costBasisAtRisk + count * avgCost);
    row.openPnlUsd = round2(row.openPnlUsd + (last - avgCost) * count);
    row.peakExposureUsd = Math.max(row.peakExposureUsd, row.costBasisAtRisk);
  }

  const markets = [...byTicker.values()].sort((a, b) => b.costBasisAtRisk - a.costBasisAtRisk);
  const totalAtRisk = round2(markets.reduce((s, m) => s + m.costBasisAtRisk, 0));
  const totalFees = round2(markets.reduce((s, m) => s + m.feesUsd, 0));

  for (const m of markets) {
    m.exposurePctOfEquity = finalEquity > 0 ? round2((m.costBasisAtRisk / finalEquity) * 100) : 0;
    m.shareOfCapitalAtRisk = totalAtRisk > 0 ? round2((m.costBasisAtRisk / totalAtRisk) * 100) : 0;
  }

  // Herfindahl–Hirschman index over the share of capital tied up per market.
  // 1.00 = everything in one market; lower = more spread.
  const hhi = totalAtRisk > 0
    ? round6(markets.reduce((s, m) => s + (m.costBasisAtRisk / totalAtRisk) ** 2, 0))
    : null;

  const tradedMarkets = markets.filter((m) => m.trades > 0).length;
  const universeSize = Number(result.dataProvenance?.markets?.length || markets.length) || markets.length;

  let concentrationNote;
  if (totalAtRisk === 0) {
    concentrationNote = 'No capital is tied up: every position was closed before the end of the replay.';
  } else if (tradedMarkets <= 1) {
    concentrationNote = `All open capital sits in a single market (${markets[0].ticker}), so the result carries full single-market concentration risk — there is no diversification offset anywhere in the account.`;
  } else {
    concentrationNote =
      `Capital is spread across ${tradedMarkets} market(s); HHI ${hhi} over capital at risk ` +
      `(1.00 = one market, 1/n = perfectly even across ${tradedMarkets}). ` +
      `Largest single-market share is ${markets[0].shareOfCapitalAtRisk}% in ${markets[0].ticker}.`;
  }

  return {
    generatedBy: 'market-analytics.js — computed from the replay trade log and open positions',
    universeSize,
    marketsTraded: tradedMarkets,
    singleMarket: tradedMarkets <= 1,
    totalCostBasisAtRisk: totalAtRisk,
    totalFeesUsd: totalFees,
    hhi,
    hhiNote: 'Herfindahl–Hirschman index of capital at risk across markets (1.00 = fully concentrated).',
    markets,
    concentrationNote,
    note:
      'Exposure is measured as the cost basis of positions still open at the end of the replay. ' +
      'Fees are itemised per market from Kalshi\'s official quadratic schedule.'
  };
}

/**
 * Cross-market analytics for a WHOLE competition run (not one strategy):
 * how many strategies traded more than one market, and the correlation of the
 * markets they traded.
 */
export function computeCompetitionMarketStats(results, candlesByTicker, opts = {}) {
  const perStrategy = (results || []).map((r) => ({
    username: r.username,
    marketsTraded: computePortfolioExposure(r).marketsTraded
  }));
  const multi = perStrategy.filter((s) => s.marketsTraded > 1);
  const correlation = computeUniverseCorrelation(candlesByTicker, opts);
  return {
    strategies: perStrategy.length,
    multiMarketStrategies: multi.length,
    singleMarketStrategies: perStrategy.length - multi.length,
    correlation,
    note:
      'A strategy counts as multi-market only if it filled orders in more than one market during the replay.'
  };
}
