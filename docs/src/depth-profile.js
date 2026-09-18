/**
 * KalshiPaperSim — Captured depth profiles (REAL order-book ladders)
 * =====================================================================
 * Recommended-work item #5: "Replace modelled depth with captured depth."
 *
 * THE PROBLEM
 *   A candlestick carries OHLC, quotes and volume — but NO depth. So a replay
 *   that needs to fill an order larger than the touch has to invent the size
 *   sitting behind it. This project has always labelled that invention
 *   (depthModel: 'anchored_synthetic'), but a label is not liquidity.
 *
 * THE INPUT WE ACTUALLY HAVE
 *   GET /markets/{ticker}/orderbook returns the complete bid ladder:
 *     { "orderbook_fp": { "yes_dollars": [["0.1100","35.00"], …],
 *                         "no_dollars":  [["0.8700","98.88"], …] } }
 *   https://docs.kalshi.com/getting_started/orderbook_responses
 *   The ingest job (scripts/ingest-history.mjs --with-books) stores snapshots of
 *   that response in data/history/<ticker>.json under `books[]`, each with the
 *   exact URL and capture time.
 *
 * WHAT THIS MODULE DOES
 *   Turns a real ladder into a DEPTH PROFILE: the distance of every level from
 *   the captured touch, measured in ticks, with the real contract count at that
 *   distance. A profile is then re-anchored to any period's real quoted touch,
 *   which reproduces a ladder with the real SHAPE and the real SIZES, moved to
 *   the price that actually traded.
 *
 * WHAT IT IS NOT
 *   It is not a claim that the same liquidity was resting at that price on that
 *   date. Kalshi publishes a snapshot, not a history of the book. Every book
 *   built this way therefore carries `source: 'captured_orderbook_reanchored'`,
 *   the capture timestamp and the URL, and the engine reports how much of a run's
 *   volume filled against captured ladders versus modelled ones.
 */

import { dollarsToNumber } from './price-grid.js';

/** One level as it arrives from the API: [priceString, countString]. */
function level(raw) {
  if (Array.isArray(raw)) return { price: dollarsToNumber(raw[0]), count: dollarsToNumber(raw[1]) };
  if (raw && typeof raw === 'object') return { price: dollarsToNumber(raw.price), count: dollarsToNumber(raw.count) };
  return { price: null, count: null };
}

/** Parse the wire orderbook (orderbook_fp) or an already-parsed {yesBids,noBids}. */
export function parseDepthLevels(orderbook) {
  const wire = orderbook?.orderbook_fp || orderbook?.orderbook || orderbook;
  const yesRaw = wire?.yes_dollars || wire?.yes || orderbook?.yesBids || [];
  const noRaw = wire?.no_dollars || wire?.no || orderbook?.noBids || [];
  const clean = (arr) =>
    (arr || [])
      .map(level)
      .filter((l) => l.price !== null && l.count !== null && l.count > 0)
      .sort((a, b) => a.price - b.price);
  return { yes: clean(yesRaw), no: clean(noRaw) };
}

/**
 * Build a depth profile from one captured ladder.
 *
 * @param {object} input
 * @param {string} input.ticker
 * @param {object} input.orderbook   the captured response ({orderbook_fp}|{yes_dollars}|{yesBids,noBids})
 * @param {number} input.tick        the market's tick size (from its price_ranges)
 * @param {number} input.notional    notional_value_dollars (1.0000 on every captured binary market)
 * @param {string} [input.capturedAt]
 * @param {string} [input.url]       the URL the ladder came from — kept for review
 * @param {number} [input.maxLevels] cap on levels kept per side (deep tails are noise)
 * @returns {object|null}
 */
export function buildDepthProfile({ ticker, orderbook, tick, notional = 1, capturedAt = null, url = null, maxLevels = 40 }) {
  if (!ticker) throw new Error('buildDepthProfile: ticker is required');
  if (!(tick > 0)) throw new Error('buildDepthProfile: a positive tick size is required (from the market\'s price_ranges)');
  const { yes, no } = parseDepthLevels(orderbook);
  if (yes.length === 0 && no.length === 0) return null;

  const side = (levels) => {
    const sorted = levels.slice().sort((a, b) => b.price - a.price); // nearest the touch first
    const touch = sorted.length ? sorted[0].price : null;
    // Keep the levels closest to the touch; the far tail of a real ladder is
    // mostly dust (verified: levels of 3.43 contracts at 20+ ticks away).
    const kept = sorted.slice(0, maxLevels).map((l) => ({
      offsetTicks: Math.round((touch - l.price) / tick),
      price: l.price,
      count: l.count
    }));
    return {
      touch,
      levels: kept,
      levelCount: sorted.length,
      keptCount: kept.length,
      totalCount: sorted.reduce((s, l) => s + l.count, 0),
      keptCountSum: kept.reduce((s, l) => s + l.count, 0),
      deepestOffsetTicks: kept.length ? kept[kept.length - 1].offsetTicks : 0
    };
  };

  const yesSide = side(yes);
  const noSide = side(no);
  return {
    ticker,
    tick,
    notional,
    capturedAt,
    url,
    yes: yesSide,
    no: noSide,
    totalContracts: yesSide.totalCount + noSide.totalCount,
    source: 'captured_orderbook',
    note:
      'REAL ladder captured from GET /markets/{ticker}/orderbook. Re-anchored to each period\'s real quoted touch: ' +
      'shape and sizes are the captured ones; the price level is the period\'s real quote.'
  };
}

/**
 * Re-anchor a profile to a touch price, producing ladder levels for one side.
 * Ticks are integers and the touch is already on the grid, so every produced
 * price stays on the grid — no re-snapping, no invented levels.
 *
 * @param {object} profileSide  profile.yes | profile.no
 * @param {number} touch        this period's real quoted touch for that side
 * @param {number} tick
 * @param {number} notional
 * @param {number} [sizeScale=1]
 * @returns {Array<{price:number,count:number}>} ascending by price
 */
export function reanchorSide(profileSide, touch, tick, notional = 1, sizeScale = 1) {
  if (!profileSide || profileSide.touch === null || !profileSide.levels?.length) return [];
  if (!(touch > 0)) return [];
  const out = [];
  for (const lv of profileSide.levels) {
    const price = Number((touch - lv.offsetTicks * tick).toFixed(10));
    if (!(price >= tick)) break; // a ladder cannot go below one tick
    if (price > notional - tick) continue;
    const count = lv.count * sizeScale;
    if (!(count > 0)) continue;
    out.push({ price: Number(price.toFixed(6)), count: Number(count.toFixed(2)) });
  }
  return out.sort((a, b) => a.price - b.price);
}
