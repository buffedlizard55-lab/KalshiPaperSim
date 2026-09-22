/**
 * KalshiPaperSim — Point-in-Time MLB Pre-Game Model Probability Archive
 * (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/mlb-pregame/,
 * which scripts/archive-mlb-pregame.mjs grows from the OWNER'S Monte Carlo
 * model outputs (MasterSite S14, MLB-Prediction-model-backtest). Each row is
 * the model's own {pHome, …} with the instant it was captured; a row captured
 * AFTER its game's first pitch is marked untimely and is never a pre-game
 * signal. Read only through src/mlb-pregame-store.js.
 *
 * NO PREDICTIONS YET — the model-snapshot capture (scripts/archive-mlb-pregame.mjs) has not produced a pre-game snapshot; MLBPreGame_ModelEdge abstains. · generated 2026-09-22T23:35:40.827Z
 */

export const MLB_PREGAME_DATA = {
 "generatedAt": "2026-09-22T23:35:40.827Z",
 "present": false,
 "assumption": {
  "what": "Point-in-time snapshot of the owner's MLB Monte Carlo model (MasterSite S14, MLB-Prediction-model-backtest): its own pre-game P(home win) per official gamePk.",
  "knowableFrom": "the capture instant the snapshot was recorded (capturedAt) — the model run's own timestamp, never this archive's write time",
  "timelyRule": "a row is a PRE-GAME signal only when capturedAt < firstPitchAt. Walk-forward rows (mode \"walk-forward measurement\") are computed after their games and carry timely:false — real data, never a tradable pre-game signal.",
  "modelRepo": "https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest",
  "modelCliStatus": "No `predict` subcommand exists in the model CLI as of 2026-09-21 (verified by reading mlb_predict/cli.py through the GitHub API). The plan below is the exact chain that becomes runnable the moment the model can emit today's slate.",
  "jargon": {
   "pHome": "the model's calibrated probability that the home team wins (logistic blend of Monte Carlo sim_p_home + correlation-filtered features)",
   "gamePk": "the official MLB Stats API game id — the same id data/mlb-signals/ archives"
  }
 },
 "droppedOldestDates": 0,
 "dates": {}
};
