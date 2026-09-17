/**
 * KalshiPaperSim — Price Grid (price_ranges / price_level_structure)
 * =====================================================================
 * Verified source: https://docs.kalshi.com/getting_started/fixed_point_migration
 *
 * Quoted: "`price_ranges` — an array of { start, end, step } bands in
 * fixed-point dollars. This is the source of truth for valid prices: any price
 * on the grid is valid, and any off-grid price is rejected. Consume it
 * dynamically per market and snap order and quote prices to the relevant
 * band's `step`."
 *
 * Quoted: "`price_level_structure` — a human-readable label for the grid.
 * Do not key pricing logic off this name; new structures are introduced over
 * time, and a client that reads `price_ranges` is automatically compatible
 * with all of them."
 *
 * This module therefore ALWAYS resolves the grid from `price_ranges` when it is
 * present, and only falls back to the published structure table when a market
 * object omits it.
 */

import { PRICE_LEVEL_STRUCTURES } from './kalshi-config.js';

/** Convert a fixed-point dollar string ("0.0100") to a Number (0.01). */
export function dollarsToNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

/**
 * Normalize a price grid from either:
 *   - a Market object  ({ price_ranges, price_level_structure })
 *   - a raw price_ranges array
 *   - a structure label string ("linear_cent")
 * @returns {Array<{start:number,end:number,step:number}>} ascending bands
 */
export function resolvePriceGrid(source) {
  let ranges = null;
  let label = null;

  if (Array.isArray(source)) {
    ranges = source;
  } else if (typeof source === 'string') {
    label = source;
  } else if (source && typeof source === 'object') {
    ranges = source.price_ranges || source.priceRanges || null;
    label = source.price_level_structure || source.priceLevelStructure || null;
  }

  if (!ranges || !Array.isArray(ranges) || ranges.length === 0) {
    ranges = (label && PRICE_LEVEL_STRUCTURES[label]) || PRICE_LEVEL_STRUCTURES.linear_cent;
  }

  const bands = ranges
    .map((r) => ({
      start: dollarsToNumber(r.start),
      end: dollarsToNumber(r.end),
      step: dollarsToNumber(r.step)
    }))
    .filter((b) => b.start !== null && b.end !== null && b.step !== null && b.step > 0)
    .sort((a, b) => a.start - b.start);

  return bands.length > 0 ? bands : [{ start: 0, end: 1, step: 0.01 }];
}

/** Smallest tick size that applies at a given price. */
export function tickSizeAt(price, grid) {
  const bands = resolvePriceGrid(grid);
  const p = Number(price) || 0;
  for (const b of bands) {
    if (p >= b.start - 1e-12 && p < b.end - 1e-12) return b.step;
  }
  // At or beyond the last band boundary, use the final band's step.
  return bands[bands.length - 1].step;
}

/** Minimum tick across the whole grid (the finest step). */
export function minTick(grid) {
  const bands = resolvePriceGrid(grid);
  return Math.min(...bands.map((b) => b.step));
}

/** Number of decimals implied by a step size (0.01 -> 2, 0.001 -> 3, 0.0001 -> 4). */
export function decimalsForStep(step) {
  const s = Number(step) || 0.01;
  const str = s.toString();
  if (str.includes('e-')) return Math.min(6, parseInt(str.split('e-')[1], 10));
  const idx = str.indexOf('.');
  return idx === -1 ? 0 : Math.min(6, str.length - idx - 1);
}

/**
 * Snap a price ONTO the grid.
 * @param {number} price
 * @param {object|Array|string} grid
 * @param {'down'|'up'|'nearest'} [direction]
 * @returns {number} a valid on-grid price clamped into the grid bounds
 */
export function snapToGrid(price, grid, direction = 'nearest') {
  const bands = resolvePriceGrid(grid);
  const lo = bands[0].start;
  const hi = bands[bands.length - 1].end;
  let p = Number(price);
  if (!Number.isFinite(p)) p = lo;
  p = Math.max(lo, Math.min(hi, p));

  // Walk bands from the grid floor, stepping within each band.
  let cursor = lo;
  for (const band of bands) {
    const bandEnd = band.end;
    if (p < bandEnd - 1e-12 || band === bands[bands.length - 1]) {
      const steps = (p - band.start) / band.step;
      const dec = decimalsForStep(band.step);
      let snapped;
      if (direction === 'down') snapped = Math.floor(steps + 1e-9);
      else if (direction === 'up') snapped = Math.ceil(steps - 1e-9);
      else snapped = Math.round(steps);
      const candidate = parseFloat((band.start + snapped * band.step).toFixed(dec + 2));
      cursor = Math.max(lo, Math.min(hi, candidate));
      break;
    }
    cursor = bandEnd;
  }
  return parseFloat(cursor.toFixed(6));
}

/** Advance one tick in the given direction, staying on-grid. */
export function nextTick(price, grid, direction = 'up') {
  const step = tickSizeAt(price, grid);
  const dec = decimalsForStep(step);
  const target = direction === 'up' ? Number(price) + step : Number(price) - step;
  return snapToGrid(target, grid, direction === 'up' ? 'up' : 'down') ||
    parseFloat(Math.max(0, target).toFixed(dec + 2));
}

/** True when the price is exactly representable on the grid. */
export function isOnGrid(price, grid) {
  const bands = resolvePriceGrid(grid);
  const p = Number(price);
  if (!Number.isFinite(p)) return false;
  for (const b of bands) {
    if (p < b.start - 1e-12) continue;
    if (p > b.end + 1e-12) continue;
    const steps = (p - b.start) / b.step;
    if (Math.abs(steps - Math.round(steps)) < 1e-6) return true;
  }
  return false;
}

/**
 * Format a price as a Kalshi fixed-point dollar string.
 * Verified: "*_dollars fields are fixed-point dollar strings with up to 4
 * decimal places" and "responses emit up to 6".
 * Live captures show 4 decimals (e.g. "0.1200"), so 4 is the default.
 */
export function toDollarsString(price, decimals = 4) {
  const n = Number(price) || 0;
  return n.toFixed(decimals);
}

/**
 * Format a contract count as a Kalshi fixed-point count string.
 * Verified: "*_fp fields are strings ... responses always emit 2 decimals".
 */
export function toCountString(count, decimals = 2) {
  const n = Number(count) || 0;
  return n.toFixed(decimals);
}
