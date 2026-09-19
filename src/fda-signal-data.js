/**
 * KalshiPaperSim — Point-in-Time FDA Signal Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/fda-signals/*.json,
 * which scripts/archive-fda-signals.mjs grows from the official openFDA
 * Drugs@FDA API (api.fda.gov/drug/drugsfda.json — FDA's own database) on
 * the fda-signals workflow schedule.
 *
 * Each snapshot is VERBATIM what the archive derived from the official
 * response at captured_at — the point-in-time record an FDA strategy is
 * allowed to read. Read it only through src/fda-signal-store.js, which
 * refuses any snapshot captured AFTER the decision time (the anti-lookahead
 * rule).
 *
 * NO ARCHIVE YET — no snapshots have been captured; every FDA-signal-dependent strategy abstains until the archive exists. · generated 2026-09-19T20:52:46.514Z
 */

export const FDA_SIGNAL_DATA = {
 "generatedAt": "2026-09-19T20:52:46.514Z",
 "present": false,
 "subjects": {}
};
