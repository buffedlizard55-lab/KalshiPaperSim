/**
 * KalshiPaperSim — Real Settlement Tracking
 * =====================================================================
 * Recommended-work item #3: settle positions from the exchange's ACTUAL
 * outcome instead of a hypothetical scenario.
 *
 * The core of this module is pure and offline-testable; the network call is
 * isolated in `fetchMarketSettlements()` and takes an injectable fetcher so the
 * tests can exercise the parsing without touching the internet (which the build
 * sandbox cannot reach anyway — see IRREGULARITIES.md #4).
 *
 * OFFICIAL FACTS THIS MODULE RELIES ON
 * ------------------------------------
 * 1. A market object carries `status` and `result`. Captured live markets on
 *    2026-09-17 had status "active" and result "" (empty = not yet resolved).
 *    https://docs.kalshi.com/api-reference/market/get-markets
 * 2. Status vocabulary returned by the API is
 *    initialized | inactive | active | closed | determined | disputed |
 *    amended | finalized — while the GET /markets *filter* accepts
 *    unopened | open | paused | closed | settled. Two different vocabularies for
 *    the same concept (IRREGULARITIES.md #9); this module reads the response
 *    vocabulary and never sends a response status as a filter.
 * 3. A binary contract pays notional_value_dollars ($1.00 on every market
 *    captured here) if it resolves in the holder's favour and $0.00 otherwise.
 * 4. "There is no settlement fee." — Kalshi fee schedule (effective 2026-07-07)
 *    https://kalshi.com/docs/kalshi-fee-schedule.pdf
 *
 * WHAT IT REFUSES TO DO
 * ---------------------
 * `determined` means a result has been declared but is not yet final
 * (it can still be disputed/amended). The tracker therefore treats only
 * `finalized` with a yes/no result as SETTLED, reports `determined` as
 * PENDING_FINAL, and never books a payout on an empty result.
 */

import { round2, round6 } from './simulation-engine.js';

/** Statuses the API returns (response vocabulary, not the filter vocabulary). */
export const MARKET_STATUS_RESPONSE_VOCAB = Object.freeze([
  'initialized', 'inactive', 'active', 'closed', 'determined', 'disputed', 'amended', 'finalized'
]);

/** Statuses accepted by the GET /markets `status` query filter. */
export const MARKET_STATUS_FILTER_VOCAB = Object.freeze([
  'unopened', 'open', 'paused', 'closed', 'settled'
]);

/** Statuses that mean "a result exists but is not yet final". */
export const PENDING_FINAL_STATUSES = Object.freeze(['determined', 'disputed', 'amended']);

/** The only status this module books a payout on. */
export const FINAL_STATUS = 'finalized';

export const SETTLEMENT_FEE_USD = 0;

/**
 * Classify a market object's settlement state.
 * @param {object} market  raw or normalized market ({status, result})
 * @returns {{state:'SETTLED'|'PENDING_FINAL'|'UNRESOLVED'|'UNKNOWN_INPUT', result:'YES'|'NO'|null, reason:string}}
 */
export function classifySettlement(market) {
  if (!market || typeof market !== 'object') {
    return { state: 'UNKNOWN_INPUT', result: null, reason: 'no market object supplied' };
  }
  const status = String(market.status || '').toLowerCase();
  const raw = String(market.result ?? '').trim();
  const result = raw.toLowerCase() === 'yes' ? 'YES' : raw.toLowerCase() === 'no' ? 'NO' : null;

  if (status === FINAL_STATUS) {
    if (result) return { state: 'SETTLED', result, reason: `status=finalized, result=${result}` };
    return { state: 'UNRESOLVED', result: null, reason: 'status is finalized but the result field is empty — nothing to book' };
  }
  if (PENDING_FINAL_STATUSES.includes(status)) {
    return {
      state: 'PENDING_FINAL',
      result,
      reason: `status=${status}: a result has been declared but can still be disputed or amended, so no payout is booked`
    };
  }
  if (!status) return { state: 'UNKNOWN_INPUT', result: null, reason: 'market object carries no status field' };
  return { state: 'UNRESOLVED', result, reason: `status=${status}: the market has not reached a final result` };
}

/**
 * Build a settlement plan for the positions we actually hold.
 *
 * @param {Array} markets   market objects (need ticker, status, result, notional_value_dollars)
 * @param {Array} positions open positions ({ticker, side, count, avgCost})
 * @param {object} [opts]   { notional = 1 }
 * @returns {{settled:Array, pending:Array, unresolved:Array, totals:object}}
 */
export function buildSettlementPlan(markets, positions, opts = {}) {
  const notional = opts.notional ?? 1;
  const marketByTicker = new Map((markets || []).map((m) => [m.ticker, m]));
  const settled = [];
  const pending = [];
  const unresolved = [];

  for (const pos of positions || []) {
    const market = marketByTicker.get(pos.ticker);
    if (!market) {
      unresolved.push({ ...pos, reason: 'no market object supplied for this ticker — outcome unknown' });
      continue;
    }
    const cls = classifySettlement(market);
    const marketNotional = Number(market.notional_value_dollars ?? notional) || notional;
    const count = Number(pos.count) || 0;
    const avgCost = Number(pos.avgCost) || 0;
    const costBasis = round6(count * avgCost);

    if (cls.state === 'SETTLED') {
      const won = String(pos.side).toUpperCase() === cls.result;
      const payoutPerContract = won ? marketNotional : 0;
      const payout = round2(count * payoutPerContract);
      settled.push({
        ticker: pos.ticker,
        side: String(pos.side).toUpperCase(),
        result: cls.result,
        contracts: round2(count),
        avgCost: round6(avgCost),
        costBasis: round2(costBasis),
        payoutPerContract,
        payout,
        realizedPnl: round2(payout - costBasis),
        settlementFee: SETTLEMENT_FEE_USD,
        status: 'SETTLED',
        source: cls.reason
      });
    } else if (cls.state === 'PENDING_FINAL') {
      pending.push({ ticker: pos.ticker, side: String(pos.side).toUpperCase(), contracts: round2(count), declaredResult: cls.result, reason: cls.reason });
    } else {
      unresolved.push({ ticker: pos.ticker, side: String(pos.side).toUpperCase(), contracts: round2(count), reason: cls.reason });
    }
  }

  return { settled, pending, unresolved, totals: summarizeSettlements(settled) };
}

/** Aggregate a list of settled rows (all numbers computed, never assumed). */
export function summarizeSettlements(settledRows) {
  const rows = settledRows || [];
  const contracts = round2(rows.reduce((s, r) => s + Number(r.contracts || 0), 0));
  const costBasis = round2(rows.reduce((s, r) => s + Number(r.costBasis || 0), 0));
  const payout = round2(rows.reduce((s, r) => s + Number(r.payout || 0), 0));
  const realizedPnl = round2(rows.reduce((s, r) => s + Number(r.realizedPnl || 0), 0));
  const wins = rows.filter((r) => Number(r.payoutPerContract) > 0).length;
  return {
    positions: rows.length,
    contracts,
    costBasis,
    payout,
    realizedPnl,
    winningPositions: wins,
    losingPositions: rows.length - wins,
    settlementFees: round2(rows.reduce((s, r) => s + Number(r.settlementFee || 0), 0)),
    note: 'Settlement pays notional_value_dollars per winning contract and $0.00 per losing contract. There is no settlement fee (verified).'
  };
}

/**
 * Apply a settlement plan to a portfolio-like object.
 * Pure: it mutates nothing and returns what SHOULD be booked, so a caller can
 * audit it before committing.
 *
 * @param {Array} positions open positions
 * @param {object} plan     output of buildSettlementPlan()
 * @returns {{closes:Array, realizedPnl:number, cashDelta:number, remainingPositions:Array}}
 */
export function applySettlementToPositions(positions, plan) {
  const settledTickers = new Set((plan?.settled || []).map((s) => `${s.ticker}|${s.side}`));
  const closes = [];
  const remaining = [];
  let cash = 0;
  let realized = 0;

  for (const pos of positions || []) {
    const key = `${pos.ticker}|${String(pos.side).toUpperCase()}`;
    const row = (plan?.settled || []).find((s) => `${s.ticker}|${s.side}` === key);
    if (settledTickers.has(key) && row) {
      closes.push(row);
      cash = round2(cash + row.payout);
      realized = round2(realized + row.realizedPnl);
    } else {
      remaining.push(pos);
    }
  }

  return { closes, realizedPnl: realized, cashDelta: cash, remainingPositions: remaining };
}

/* ------------------------------------------------------------------ *
 * Network layer (isolated, injectable)
 * ------------------------------------------------------------------ */

/**
 * Poll the official endpoint for the settlement state of tracked markets.
 *
 *   GET /markets/{ticker} — https://docs.kalshi.com/api-reference/market/get-market
 *   (market data is public; no authentication is required for reads)
 *
 * @param {Array}  tickers
 * @param {object} [opts] { baseUrl, fetchImpl = globalThis.fetch, minIntervalMs = 250, timeoutMs = 10000 }
 * @returns {Promise<{markets:Array, errors:Array, checkedAt:string, endpoint:string}>}
 */
export async function fetchMarketSettlements(tickers, opts = {}) {
  const base = opts.baseUrl || 'https://external-api.kalshi.com/trade-api/v2';
  const fetchImpl = opts.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    return { markets: [], errors: tickers.map((t) => ({ ticker: t, error: 'fetch_unavailable' })), checkedAt: new Date().toISOString(), endpoint: base };
  }

  const markets = [];
  const errors = [];
  for (const ticker of tickers) {
    const url = `${base}/markets/${encodeURIComponent(ticker)}`;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10000);
      const res = await fetchImpl(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) {
        errors.push({ ticker, url, status: res.status, error: `http_${res.status}` });
      } else {
        const json = await res.json();
        const market = json.market || json;
        markets.push({
          ticker: market.ticker || ticker,
          status: market.status ?? null,
          result: market.result ?? null,
          notional_value_dollars: market.notional_value_dollars ?? '1.0000',
          close_time: market.close_time ?? null,
          settlement_value: market.settlement_value ?? null,
          classification: classifySettlement(market),
          url,
          raw: market
        });
      }
    } catch (err) {
      errors.push({ ticker, url, error: String(err && err.message ? err.message : err) });
    }
    if (opts.minIntervalMs) await new Promise((r) => setTimeout(r, opts.minIntervalMs));
  }
  return { markets, errors, checkedAt: new Date().toISOString(), endpoint: base };
}
