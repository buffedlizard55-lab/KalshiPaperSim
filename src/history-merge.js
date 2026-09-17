/**
 * KalshiPaperSim — Accumulated-history merge rules
 * =====================================================================
 * Recommended-work item #3: the accumulated store (data/history/, grown daily
 * from the official Kalshi API by scripts/ingest-history.mjs and compiled into
 * src/accumulated-history.js) has to feed the replay WITHOUT ever being allowed
 * to overwrite, silently repair or contradict the in-repo verified captures.
 *
 * These are pure functions — no filesystem, no network, no Node built-ins — so
 * the browser build, the server and the tests all apply the exact same rules.
 *
 * THE RULE, IN ONE SENTENCE
 *   A stored series is used only when it is a VERIFIED SUPERSET of the in-repo
 *   capture: every bar the two share must be identical field-for-field, and the
 *   stored series must add at least one bar. Anything else keeps the capture and
 *   flags the difference.
 *
 * Why so strict: the in-repo captures were transcribed from live responses and
 * checked bar-for-bar against a verbatim sample (see src/verified-candles.js and
 * test/simulation.test.js). If a later fetch disagrees with one of them, the
 * disagreement is a fact about the data — a restated bar, a different endpoint
 * window, or a capture error — and it belongs in IRREGULARITIES.md, not in a
 * silently rewritten history.
 */

import { stableEqual } from './json-utils.js';

/** Where the bars a replay used actually came from. */
export const CANDLE_ORIGIN = Object.freeze({
  /** In-repo verified capture (src/verified-snapshot.js / src/verified-candles.js). */
  REPO: 'repo_capture',
  /** Accumulated store, accepted because it is a verified superset of the capture. */
  STORE: 'accumulated_store',
  /** Accumulated store only — this market does not exist in the in-repo captures. */
  STORE_ONLY: 'accumulated_store_only',
  /** Capture kept because a stored bar disagreed with it (conflict is reported). */
  REPO_AFTER_CONFLICT: 'repo_capture_store_conflict',
  /** No bars anywhere. */
  NONE: 'none'
});

/**
 * A market must have at least this many stored daily bars before the replay will
 * trade it. Below it, per-market statistics (win rate, drawdown, correlation)
 * are computed on a sample too small to mean anything, and a "highest return"
 * mandate would happily size a whole account off three prints. Markets beneath
 * the floor are still tracked and still shown — they are simply not replayed.
 */
export const MIN_REPLAY_BARS = 10;

/**
 * Choose the series of bars a replay may use for one market.
 *
 * @param {string} ticker
 * @param {Array}  repoBars    bars from the in-repo verified capture (may be empty)
 * @param {Array}  storedBars  bars from the accumulated store (may be empty)
 * @returns {{ticker:string, bars:Array, origin:string, reason:string,
 *            repoBarCount:number, storedBarCount:number,
 *            barsOnlyInStore:number, barsOnlyInRepo:number, conflicts:Array}}
 */
export function chooseCandleSeries(ticker, repoBars = [], storedBars = []) {
  const repo = Array.isArray(repoBars) ? repoBars : [];
  const stored = Array.isArray(storedBars) ? storedBars : [];

  const repoByTs = new Map(repo.map((b) => [Number(b.end_period_ts), b]));
  const storedByTs = new Map(stored.map((b) => [Number(b.end_period_ts), b]));
  const barsOnlyInStore = [...storedByTs.keys()].filter((ts) => !repoByTs.has(ts)).length;
  const barsOnlyInRepo = [...repoByTs.keys()].filter((ts) => !storedByTs.has(ts)).length;

  const base = { ticker, repoBarCount: repo.length, storedBarCount: stored.length, barsOnlyInStore, barsOnlyInRepo };

  if (stored.length === 0 && repo.length === 0) {
    return { ...base, bars: [], origin: CANDLE_ORIGIN.NONE, reason: 'No bars in the capture or the accumulated store.', conflicts: [] };
  }
  if (stored.length === 0) {
    return {
      ...base,
      bars: repo,
      origin: CANDLE_ORIGIN.REPO,
      reason: 'Accumulated store holds nothing for this market — the in-repo capture is used unchanged.',
      conflicts: []
    };
  }
  if (repo.length === 0) {
    return {
      ...base,
      bars: stored,
      origin: CANDLE_ORIGIN.STORE_ONLY,
      reason: 'Market exists only in the accumulated store (discovered by a live series scan), so its stored bars are used.',
      conflicts: []
    };
  }

  // Deep compare every bar the two sources share. stableEqual (not
  // JSON.stringify with a key array) — the latter silently skipped every nested
  // price object and made different bars look identical (Irregularity #20).
  const conflicts = [];
  for (const [ts, storedBar] of storedByTs) {
    const repoBar = repoByTs.get(ts);
    if (!repoBar) continue;
    if (!stableEqual(repoBar, storedBar)) conflicts.push({ end_period_ts: ts, repo: repoBar, stored: storedBar });
  }

  if (conflicts.length > 0) {
    return {
      ...base,
      bars: repo,
      origin: CANDLE_ORIGIN.REPO_AFTER_CONFLICT,
      reason:
        `${conflicts.length} stored bar(s) disagree with the in-repo capture for the same period. ` +
        'The capture is kept and every disagreement is reported (never averaged, never overwritten).',
      conflicts
    };
  }
  if (stored.length > repo.length) {
    return {
      ...base,
      bars: stored,
      origin: CANDLE_ORIGIN.STORE,
      reason: `Accumulated store is a verified superset: all ${repo.length} captured bar(s) matched field-for-field, plus ${stored.length - repo.length} newer bar(s).`,
      conflicts: []
    };
  }
  return {
    ...base,
    bars: repo,
    origin: CANDLE_ORIGIN.REPO,
    reason: 'Accumulated store adds no bar the capture does not already have, so the capture is used.',
    conflicts: []
  };
}

/**
 * Decide the replay universe from three inputs:
 *   • the in-repo verified markets (real captured market objects)
 *   • the in-repo candlestick captures
 *   • the accumulated store (bars + the market object the ingest captured)
 *
 * @param {object} options
 * @param {Array}  options.verifiedMarkets  raw captured market objects
 * @param {Object} options.repoCandles      { ticker: bars } from the in-repo captures
 * @param {Object} options.accumulated      ACCUMULATED_HISTORY from src/accumulated-history.js
 * @param {number} [options.minBars]        replay floor (default MIN_REPLAY_BARS)
 * @returns {{
 *   entries: Array<{ticker:string, market:object, bars:Array, origin:string, reason:string,
 *                   fromStore:boolean, conflicts:Array, storedBarCount:number, repoBarCount:number}>,
 *   audit: Array, replayableTickers: string[], trackedNotReplayable: Array, conflicts: Array
 * }}
 */
export function buildReplayUniverse({ verifiedMarkets = [], repoCandles = {}, accumulated = null, minBars = MIN_REPLAY_BARS } = {}) {
  const store = accumulated && accumulated.markets ? accumulated.markets : {};
  const byTicker = new Map();
  for (const m of verifiedMarkets) byTicker.set(m.ticker, m);

  // Order: the in-repo capture order first (stable, matches VERIFICATION.md),
  // then any market the store added, alphabetically. Never reshuffles a market
  // that already had a place in the roster.
  const tickers = [...byTicker.keys()];
  for (const t of [...Object.keys(store), ...Object.keys(repoCandles)].sort()) {
    if (!tickers.includes(t)) tickers.push(t);
  }

  const entries = [];
  const audit = [];
  const trackedNotReplayable = [];
  const conflicts = [];

  for (const ticker of tickers) {
    const verified = byTicker.get(ticker) || null;
    const stored = store[ticker] || null;
    const repoBars = repoCandles[ticker] || (verified ? [] : []);
    const storedBars = stored ? stored.bars || [] : [];
    const choice = chooseCandleSeries(ticker, repoBars, storedBars);

    // A market object is mandatory: the engine needs price_level_structure,
    // strike, series and status to build a book. Prefer the in-repo capture
    // (already provenance-stamped); fall back to the object the ingest captured.
    const market = verified || (stored && stored.market ? stored.market : null);
    const marketSource = verified
      ? 'verified_snapshot'
      : stored && stored.market
        ? 'accumulated_store_market_capture'
        : null;

    const row = {
      ticker,
      bars: choice.bars,
      origin: choice.origin,
      reason: choice.reason,
      market,
      marketSource,
      market_url: verified?._provenance?.url || stored?.market_url || null,
      market_captured_at: verified?._provenance?.capturedAt || stored?.market_captured_at || null,
      series_ticker: market?.series_ticker || stored?.series_ticker || null,
      status: stored?.status || market?.status || null,
      result: stored?.result || market?.result || null,
      repoBarCount: choice.repoBarCount,
      storedBarCount: choice.storedBarCount,
      barsOnlyInStore: choice.barsOnlyInStore,
      barsOnlyInRepo: choice.barsOnlyInRepo,
      conflicts: choice.conflicts || []
    };

    if (!market) {
      row.replayable = false;
      row.excludedReason = 'No market object for this ticker, so no book can be built. Bars are tracked but cannot be traded.';
      trackedNotReplayable.push(row);
      audit.push(row);
      continue;
    }
    if (row.bars.length < minBars) {
      row.replayable = false;
      row.excludedReason =
        `Only ${row.bars.length} daily bar(s) stored, below the ${minBars}-bar replay floor — ` +
        'per-market statistics on a window that short would not mean anything.';
      trackedNotReplayable.push(row);
      audit.push(row);
      continue;
    }
    if (row.conflicts.length > 0) conflicts.push(...row.conflicts.map((c) => ({ ticker, ...c })));

    row.replayable = true;
    row.excludedReason = null;
    entries.push(row);
    audit.push(row);
  }

  return {
    entries,
    audit,
    replayableTickers: entries.map((e) => e.ticker),
    trackedNotReplayable,
    conflicts,
    minBars,
    generatedAt: new Date().toISOString()
  };
}

/** One-line provenance summary suitable for the UI and the docs. */
export function summarizeUniverse(universe) {
  const byOrigin = {};
  for (const e of universe.entries) byOrigin[e.origin] = (byOrigin[e.origin] || 0) + 1;
  const bars = universe.entries.reduce((s, e) => s + e.bars.length, 0);
  return {
    markets: universe.entries.length,
    bars,
    byOrigin,
    trackedNotReplayable: universe.trackedNotReplayable.length,
    conflicts: universe.conflicts.length,
    minBars: universe.minBars
  };
}
