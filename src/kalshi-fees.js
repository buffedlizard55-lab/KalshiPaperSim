/**
 * KalshiPaperSim — Official Kalshi Fee Engine
 * =====================================================================
 * Implements the fee formulas EXACTLY as published in Kalshi's official
 * Fee Schedule (last updated and effective July 7, 2026).
 *
 * SOURCE (official PDF): https://kalshi.com/docs/kalshi-fee-schedule.pdf
 * Landing page:          https://kalshi.com/fee-schedule
 *
 * Quoted verbatim from the PDF:
 *   "Trading fees are only charged for orders that are immediately matched
 *    with orders sitting on the orderbook. Trading fees are not charged for
 *    orders placed that are not immediately matched and are instead left as
 *    resting orders on the orderbook unless they are included in our
 *    'Maker Fees' section."
 *
 *   General (taker): fees = round up(M x 0.07   x C x P x (1-P))
 *   Maker:           fees = round up(M x 0.0175 x C x P x (1-P))
 *     P = the price of a contract in dollars (50 cents is 0.5)
 *     C = the number of contracts being traded
 *     M = the multiplier for each contract (default is 1 unless otherwise
 *         indicated)  [maker default is 0 unless otherwise indicated]
 *     round up = rounds up such that the fee + positionCost is rounded to a
 *                centicent
 *
 *   "There is no settlement fee."
 *   "There is no membership fee."
 *
 * The per-series multiplier M is published by the live API on the Series
 * object as `fee_multiplier` alongside `fee_type`:
 *   GET /series/KXINXY -> fee_multiplier: 1, fee_type: "quadratic_with_maker_fees"
 *   GET /series/KXTSLA -> fee_multiplier: 1, fee_type: "quadratic"
 *   GET /series/KXBTCY -> fee_multiplier: 0, fee_type: "quadratic"
 * (captured 2026-09-17; see src/verified-snapshot.js)
 */

import { KALSHI_FEES } from './kalshi-config.js';

const ROUNDING_INCREMENT = KALSHI_FEES.roundingIncrement; // $0.0001 = one centicent

/**
 * Round a dollar amount UP to the given increment (default: one centicent).
 * Uses integer arithmetic on the increment to avoid binary float drift.
 * @param {number} value
 * @param {number} [increment]
 * @returns {number}
 */
export function roundUpToIncrement(value, increment = ROUNDING_INCREMENT) {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  const steps = Math.ceil(value / increment - 1e-9);
  return parseFloat((steps * increment).toFixed(8));
}

/**
 * Raw (unrounded) quadratic fee for C contracts at price P with multiplier M.
 * fee = M * coefficient * C * P * (1 - P)
 * @param {object} args
 * @param {number} args.count          C — number of contracts (fractional allowed, min granularity 0.01)
 * @param {number} args.price          P — contract price in dollars (0.5 == 50 cents)
 * @param {number} [args.multiplier]   M — series fee multiplier
 * @param {number} [args.coefficient]  0.07 taker / 0.0175 maker
 * @returns {number} unrounded fee in dollars
 */
export function rawQuadraticFee({ count, price, multiplier = 1, coefficient = KALSHI_FEES.takerCoefficient }) {
  const C = Number(count);
  const P = Number(price);
  const M = Number(multiplier);
  if (!Number.isFinite(C) || C <= 0) return 0;
  if (!Number.isFinite(P) || P <= 0 || P >= 1) {
    // Outside the (0,1) open interval the quadratic term is <= 0.
    return 0;
  }
  if (!Number.isFinite(M) || M <= 0) return 0;
  return M * coefficient * C * P * (1 - P);
}

/**
 * Official Kalshi fee, applying the documented rounding rule:
 *   "round up = rounds up such that the fee + positionCost is rounded to a centicent"
 *
 * @param {object} args
 * @param {number} args.count         C
 * @param {number} args.price         P
 * @param {number} [args.multiplier]  M (series fee_multiplier)
 * @param {boolean} [args.isMaker]    true => use the maker coefficient (0.0175)
 * @returns {{fee:number, positionCost:number, feePlusPositionCost:number, coefficient:number, multiplier:number, formula:string}}
 */
export function computeKalshiFee({ count, price, multiplier = null, isMaker = false }) {
  const C = Number(count) || 0;
  const P = Number(price) || 0;

  const coefficient = isMaker ? KALSHI_FEES.makerCoefficient : KALSHI_FEES.takerCoefficient;
  // Documented defaults: taker M defaults to 1, maker M defaults to 0
  // ("default is 0 unless otherwise indicated" in the Maker Fees section).
  const defaultM = isMaker ? KALSHI_FEES.defaultMakerMultiplier : KALSHI_FEES.defaultTakerMultiplier;
  const M = multiplier === null || multiplier === undefined ? defaultM : Number(multiplier);

  const positionCost = C * P;
  const raw = rawQuadraticFee({ count: C, price: P, multiplier: M, coefficient });

  // Zero-multiplier series (verified: KXBTCY has fee_multiplier 0) have a raw
  // fee of exactly 0. Running the documented "round up fee + positionCost to a
  // centicent" step over a zero fee would surface floating-point dust in
  // positionCost (e.g. $0.00005 on a 2,187-contract fill) as a phantom fee on a
  // zero-fee market. Guard it: raw 0 => fee 0.
  if (!(raw > 0)) {
    const pc = parseFloat(positionCost.toFixed(8));
    return {
      fee: 0,
      positionCost: pc,
      feePlusPositionCost: pc,
      coefficient,
      multiplier: M,
      isMaker: Boolean(isMaker),
      formula: isMaker
        ? 'fees = round up(M x 0.0175 x C x P x (1-P))'
        : 'fees = round up(M x 0.07 x C x P x (1-P))',
      source: KALSHI_FEES.sourceUrl,
      zeroMultiplier: M === 0
    };
  }

  const feePlusPositionCost = roundUpToIncrement(raw + positionCost, ROUNDING_INCREMENT);
  const fee = parseFloat(Math.max(0, feePlusPositionCost - positionCost).toFixed(8));

  return {
    fee,
    positionCost: parseFloat(positionCost.toFixed(8)),
    feePlusPositionCost,
    coefficient,
    multiplier: M,
    isMaker: Boolean(isMaker),
    formula: isMaker
      ? 'fees = round up(M x 0.0175 x C x P x (1-P))'
      : 'fees = round up(M x 0.07 x C x P x (1-P))',
    source: KALSHI_FEES.sourceUrl
  };
}

/** Convenience: taker fee in dollars. */
export function takerFee(count, price, multiplier = 1) {
  return computeKalshiFee({ count, price, multiplier, isMaker: false }).fee;
}

/** Convenience: maker fee in dollars. */
export function makerFee(count, price, multiplier = 0) {
  return computeKalshiFee({ count, price, multiplier, isMaker: true }).fee;
}

/**
 * Fee for a multi-tier execution: the official formula is applied per fill tier
 * (each tier has its own price P), then summed. This is how a book-walking
 * market order is actually charged — the quadratic term is price-dependent.
 * @param {Array<{price:number,count:number}>} fills
 * @param {object} [opts]
 * @returns {{fee:number, tiers:Array}}
 */
export function computeFeeForFills(fills, opts = {}) {
  const isMaker = Boolean(opts.isMaker);
  const multiplier = opts.multiplier === undefined ? null : opts.multiplier;
  const tiers = [];
  let fee = 0;
  for (const f of fills) {
    const r = computeKalshiFee({ count: f.count, price: f.price, multiplier, isMaker });
    tiers.push({ price: f.price, count: f.count, fee: r.fee });
    fee += r.fee;
  }
  return { fee: parseFloat(fee.toFixed(8)), tiers };
}

/**
 * Round-trip cost estimate (buy as taker, later sell as taker) — surfaced in the
 * UI order ticket so users see the real all-in cost, not an invented flat rate.
 */
export function roundTripCostEstimate(count, entryPrice, exitPrice, multiplier = 1) {
  const entry = computeKalshiFee({ count, price: entryPrice, multiplier, isMaker: false });
  const exit = computeKalshiFee({ count, price: exitPrice, multiplier, isMaker: false });
  return {
    entryFee: entry.fee,
    exitFee: exit.fee,
    totalFees: parseFloat((entry.fee + exit.fee).toFixed(8)),
    settlementFee: KALSHI_FEES.settlementFee // verified: "There is no settlement fee."
  };
}
