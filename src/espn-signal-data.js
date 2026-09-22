/**
 * KalshiPaperSim — Point-in-Time ESPN Game-State + Injury Archive (GENERATED)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/espn-signals/,
 * which scripts/archive-espn-signals.mjs grows from ESPN's public JSON
 * (site.web.api.espn.com) on the espn-signals workflow schedule.
 *
 * TRUST: ESPN PUBLIC JSON — TRUSTED BUT NOT OFFICIAL. ESPN is a public
 * aggregator, not a league's official data feed. Every consumer must surface
 * the label (src/espn-signal-store.js#espnAssumption).
 *
 * Each row is VERBATIM what the archive derived from the response at
 * captured_at. Read it only through src/espn-signal-store.js, which refuses
 * any row captured AFTER the decision time (the anti-lookahead rule).
 *
 * 1 league(s) · 0 event(s) · generated 2026-09-22T01:48:35.637Z
 */

export const ESPN_SIGNAL_DATA = {
 "generatedAt": "2026-09-22T01:48:35.637Z",
 "present": true,
 "trust": "ESPN PUBLIC JSON — TRUSTED BUT NOT OFFICIAL (aggregator, not a league feed)",
 "endpoints": {
  "scoreboard": "https://site.web.api.espn.com/apis/site/v2/sports/{sport}/{slug}/scoreboard?dates=YYYYMMDD",
  "injuries": "https://site.web.api.espn.com/apis/site/v2/sports/{sport}/{slug}/injuries",
  "teams": "https://site.web.api.espn.com/apis/site/v2/sports/{sport}/{slug}/teams"
 },
 "droppedOldestDates": 0,
 "codeMap": {
  "rows": []
 },
 "leagues": {
  "fixtures": {
   "label": "fixtures",
   "teams": [],
   "teamsCapturedAt": null,
   "dates": {}
  }
 }
};
