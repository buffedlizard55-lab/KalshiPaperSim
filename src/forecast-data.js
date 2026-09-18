/**
 * KalshiPaperSim — Point-in-Time Forecast Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/forecasts/*.json,
 * which scripts/archive-forecasts.mjs grows from the official NWS API
 * (api.weather.gov) on the weather-signals workflow schedule.
 *
 * Each snapshot is VERBATIM what api.weather.gov returned at captured_at —
 * the point-in-time record a weather strategy is allowed to read. Read it
 * only through src/forecast-store.js, which refuses any snapshot captured
 * AFTER the decision time (the anti-lookahead rule).
 *
 * NO ARCHIVE YET — no snapshots have been captured; every forecast-dependent strategy abstains until the archive exists. · generated 2026-09-18T02:49:06.477Z
 */

export const FORECAST_DATA = {
 "generatedAt": "2026-09-18T02:49:06.477Z",
 "present": false,
 "locations": {}
};
