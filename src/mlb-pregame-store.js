/**
 * KalshiPaperSim — Point-in-Time MLB Pre-Game Model Probability Store
 * =====================================================================
 * The query layer over data/mlb-pregame/ (grown by
 * scripts/archive-mlb-pregame.mjs from the OWNER'S Monte Carlo model —
 * MasterSite S14, buffedlizard55-lab/MLB-Prediction-model-backtest).
 * Browser-safe (no node: imports).
 *
 * WHAT A ROW IS
 *   { capturedAt, gamePk, firstPitchAt (UTC), pHome, total, side, source }
 *   — the model's OWN output as it was at `capturedAt`, keyed to the official
 *   gamePk from the MLB Stats API schedule (data/mlb-signals/). Nothing is
 *   interpolated between snapshots and a missing prediction stays missing.
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   A prediction is a PRE-GAME signal at bar T only if (a) a row exists with
 *   capturedAt <= T and (b) that row was captured BEFORE its game's first
 *   pitch. A row captured after first pitch (e.g. ingested from the model's
 *   walk-forward report, which computes after the fact) is REAL DATA but is
 *   NOT tradable at any pre-game bar: it carries `timely: false` and
 *   `preGamePredictionAtOrBefore` will not return it. That asymmetry —
 *   measurement rows vs trading rows — is the difference between "the model
 *   was right" and "the model said it first".
 */

import { MLB_PREGAME_DATA } from './mlb-pregame-data.js';

function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** The published assumption/contract of the archive (empty before first run). */
export function preGameAssumption() {
  return (MLB_PREGAME_DATA && MLB_PREGAME_DATA.assumption) || {
    what: 'Point-in-time snapshot of the owner\'s MLB-Prediction-model-backtest output (MasterSite S14)',
    knowableFrom: 'the capture instant the snapshot was recorded (capturedAt)',
    timelyRule: 'a row is a pre-game signal only when capturedAt < firstPitchAt; walk-forward rows captured after their game are measurement-only',
    source: 'https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest'
  };
}

/** True when at least one prediction row exists. */
export function hasPreGameArchive() {
  return Boolean(MLB_PREGAME_DATA && MLB_PREGAME_DATA.present) &&
    preGameRows().length > 0;
}

/** Every archived prediction row, flattened (with its date file). */
export function preGameRows() {
  const dates = (MLB_PREGAME_DATA && MLB_PREGAME_DATA.dates) || {};
  const out = [];
  for (const [date, store] of Object.entries(dates)) {
    for (const [gamePk, p] of Object.entries((store && store.predictions) || {})) {
      for (const row of (p.rows || [])) {
        out.push({ ...row, gamePk: Number(gamePk), date, firstPitchAt: p.firstPitchAt || row.firstPitchAt || null });
      }
    }
  }
  return out;
}

/** The rows for one official gamePk ([] when none). */
export function preGameRowsForGame(gamePk) {
  return preGameRows().filter((r) => r.gamePk === Number(gamePk));
}

/**
 * The newest PRE-GAME prediction row for a game knowable at `tsSeconds`:
 * capturedAt <= tsSeconds AND capturedAt < firstPitchAt. Returns null when no
 * timely row exists (a walk-forward row never answers here).
 */
export function preGamePredictionAtOrBefore(gamePk, tsSeconds) {
  if (!Number.isFinite(tsSeconds)) return null;
  const rows = preGameRowsForGame(gamePk)
    .map((r) => {
      const capT = isoToSeconds(r.capturedAt);
      const firstT = isoToSeconds(r.firstPitchAt);
      return { ...r, capT, firstT, timely: capT !== null && firstT !== null && capT < firstT };
    })
    .filter((r) => r.timely && r.capT <= tsSeconds)
    .sort((a, b) => (a.capturedAt < b.capturedAt ? 1 : -1));
  if (!rows.length) return null;
  const row = rows[0];
  return {
    kind: 'mlb-pregame-model',
    gamePk: row.gamePk,
    pHome: row.pHome,
    total: row.total != null ? row.total : null,
    side: row.side || null,
    capturedAt: row.capturedAt,
    firstPitchAt: row.firstPitchAt,
    staleSeconds: Math.max(0, tsSeconds - row.capT),
    model: row.model || null,
    source: row.source || (preGameAssumption() || {}).source || null
  };
}

/** Measurement view: EVERY row (including untimely walk-forward rows) for one
 *  game, so "the model was right / wrong" can be measured on real games. */
export function preGameMeasurementRows(gamePk) {
  return preGameRowsForGame(gamePk).map((r) => {
    const capT = isoToSeconds(r.capturedAt);
    const firstT = isoToSeconds(r.firstPitchAt);
    return { ...r, timely: capT !== null && firstT !== null && capT < firstT };
  });
}

/** Coverage summary for the UI / reports (computed, never typed). */
export function preGameCoverage() {
  const rows = preGameRows();
  const games = new Set(rows.map((r) => r.gamePk));
  const timely = rows.filter((r) => {
    const capT = isoToSeconds(r.capturedAt);
    const firstT = isoToSeconds(r.firstPitchAt);
    return capT !== null && firstT !== null && capT < firstT;
  });
  return {
    present: hasPreGameArchive(),
    rows: rows.length,
    games: games.size,
    timelyRows: timely.length,
    untimelyRows: rows.length - timely.length,
    assumption: preGameAssumption()
  };
}
