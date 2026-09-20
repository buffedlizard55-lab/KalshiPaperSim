/**
 * KalshiPaperSim — Point-in-Time Forecast Store (read side)
 * =====================================================================
 * The query layer over the archive that scripts/archive-forecasts.mjs grows.
 * Browser-safe (no node: imports) so the static GitHub Pages build can run the
 * same point-in-time logic the server and the reports run.
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   A forecast is knowable at time T only if a snapshot captured at or before T
 *   contains it. `forecastHighAt()` therefore walks snapshots from NEWEST to
 *   OLDEST and stops at the first one with captured_at <= T that still lists
 *   the requested date. If none exists it returns null — and a strategy that
 *   receives null ABSTAINS. No fallback, no interpolation, no "current"
 *   forecast for a past decision: that would be a lookahead.
 *
 * SOURCE OF THE DATA
 *   data/forecasts/<location>.json, written by the weather-signals workflow
 *   from the official NWS API (api.weather.gov). The browser copy is generated
 *   into src/forecast-data.js by scripts/generate-history-module.mjs (newest
 *   snapshots only, bounded), so the static site computes with the same
 *   archive the Node reports read.
 */

import { FORECAST_DATA } from './forecast-data.js';

/**
 * The calendar date a KXHIGH* event measures, parsed from the event ticker
 * (KXHIGHNY-26SEP07 → '2026-09-07'). Verified against every captured weather
 * market: the title says "…on Sep 7, 2026?" and close_time is 05:00Z the next
 * day, so the ticker's date is the measurement day. Lives here (not in the
 * runner) so the browser desk can use it without loading the history module.
 */
const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
export function weatherEventDate(eventTicker) {
  const m = /^KXHIGH\w*-(\d{2})([A-Z]{3})(\d{2})(?:-|$)/.exec(String(eventTicker || ''));
  if (!m) return null;
  const month = MONTHS[m[2]];
  if (!month) return null;
  return `20${m[1]}-${month}-${m[3]}`;
}

/** Every archived location, keyed as in data/forecasts/. */
export function forecastLocations() {
  const locations = (FORECAST_DATA && FORECAST_DATA.locations) || {};
  return Object.entries(locations).map(([key, store]) => ({
    key,
    ...((store && store.location) || {}),
    snapshots: (store && store.snapshots) || []
  }));
}

/** ISO "2026-09-18T03:20:00.000Z" -> unix seconds, or null. */
function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/**
 * The newest snapshot (as of `tsSeconds`) that carries a forecast for `date`.
 * @param {Array}  snapshots  the location's snapshot list (any order; sorted here)
 * @param {string} date       'YYYY-MM-DD' local calendar date of the market
 * @param {number} tsSeconds  the decision time, unix seconds
 * @returns {object|null} { highF, capturedAt, periodName, snapshotIndex } or null
 */
export function forecastHighAt(snapshots, date, tsSeconds) {
  if (!Array.isArray(snapshots) || snapshots.length === 0 || !date || !Number.isFinite(tsSeconds)) return null;
  const ts = Number(tsSeconds);
  // Newest first, so the first hit is the freshest forecast known at ts.
  const ordered = [...snapshots].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
  for (let i = 0; i < ordered.length; i++) {
    const snapTs = isoToSeconds(ordered[i].captured_at);
    if (snapTs === null || snapTs > ts) continue; // captured after the decision: not knowable
    const day = (ordered[i].days || []).find((d) => d.date === date && Number.isFinite(Number(d.highF)));
    if (day) return { highF: Number(day.highF), capturedAt: ordered[i].captured_at, periodName: day.periodName || null, snapshotIndex: i };
  }
  return null;
}

/** First snapshot timestamp known for a location (for coverage tables). */
export function forecastCoverage() {
  return forecastLocations().map((loc) => {
    const snaps = loc.snapshots || [];
    const dayRows = snaps.reduce((a, s) => a + (s.days || []).length, 0);
    const dates = new Set();
    for (const s of snaps) for (const d of s.days || []) dates.add(d.date);
    return {
      key: loc.key,
      city: loc.city || null,
      series: loc.series || null,
      snapshots: snaps.length,
      firstCapturedAt: snaps[0]?.captured_at || null,
      lastCapturedAt: snaps[snaps.length - 1]?.captured_at || null,
      dayRows,
      distinctDates: dates.size
    };
  });
}

/** True when at least one location has at least one snapshot (else: signal dark). */
export function hasForecastArchive() {
  return forecastLocations().some((l) => (l.snapshots || []).length > 0);
}
