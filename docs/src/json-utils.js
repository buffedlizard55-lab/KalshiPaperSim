/**
 * KalshiPaperSim — Deterministic JSON comparison helper
 * =====================================================================
 * WHY THIS EXISTS (found during the 2026-09-17 audit of the audit):
 *
 * The obvious way to compare two Kalshi wire objects is
 *
 *     JSON.stringify(a, Object.keys(b).sort())
 *
 * but the array form of the `replacer` argument filters property names at EVERY
 * depth, not just the top level. For a candlestick bar that means the nested
 * price / yes_bid / yes_ask objects are serialised as `{}`, so two bars with
 * completely different prices compare EQUAL:
 *
 *     JSON.stringify({end_period_ts:1, price:{close_dollars:'0.10'}}, ['end_period_ts','price'])
 *       → '{"end_period_ts":1,"price":{}}'
 *     JSON.stringify({end_period_ts:1, price:{close_dollars:'0.99'}}, ['end_period_ts','price'])
 *       → '{"end_period_ts":1,"price":{}}'      ← identical, wrongly
 *
 * Every "verbatim" comparison in this repository therefore has to use
 * `stableStringify`, which serialises the whole tree with sorted keys.
 */

/**
 * Serialise any JSON value deterministically (object keys sorted at every depth).
 * @param {unknown} value
 * @returns {string}
 */
export function stableStringify(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const keys = Object.keys(value).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

/**
 * Deep-equality check for two JSON values, independent of key order.
 * @param {unknown} a
 * @param {unknown} b
 * @returns {boolean}
 */
export function stableEqual(a, b) {
  return stableStringify(a) === stableStringify(b);
}
