/**
 * KalshiPaperSim — Point-in-Time FDA Signal Store (read side)
 * =====================================================================
 * The query layer over the Drugs@FDA archive that
 * scripts/archive-fda-signals.mjs grows. Browser-safe (no node: imports) so
 * the static GitHub Pages build runs the same point-in-time logic the server
 * and the reports run.
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   An approval is knowable at time T only if a snapshot CAPTURED at or before
 *   T shows it. `stateAtOrBefore()` walks snapshots NEWEST to OLDEST and stops
 *   at the first one with captured_at <= T. If none exists it returns null —
 *   and a strategy that receives null ABSTAINS. No fallback, no "current"
 *   Drugs@FDA state for a past decision: that would be a lookahead, because
 *   the database is re-read, not re-run.
 *
 * SOURCE OF THE DATA
 *   data/fda-signals/<slug>.json, written by the fda-signals workflow from the
 *   official openFDA Drugs@FDA API (api.open.fda.gov/drug/drugsfda.json —
 *   FDA's own Drugs@FDA database). The browser copy is generated into
 *   src/fda-signal-data.js by scripts/generate-history-module.mjs, so the
 *   static site computes with the same archive the Node reports read.
 *
 * BASIS MISMATCH, STATED UP FRONT
 *   Kalshi's FDA markets resolve on the FDA's approval/announcement; this
 *   archive holds the Drugs@FDA DATABASE record of that approval. The database
 *   is updated by humans after the decision, so a flip can lag the news. The
 *   lag is a real property of the signal — published on the strategy, never
 *   netted out of the numbers.
 */

import { FDA_SIGNAL_DATA } from './fda-signal-data.js';

/** Every archived subject, keyed as in data/fda-signals/. */
export function fdaSubjects() {
  const subjects = (FDA_SIGNAL_DATA && FDA_SIGNAL_DATA.subjects) || {};
  return Object.entries(subjects).map(([slug, store]) => ({
    slug,
    ...((store && store.subject) || {}),
    snapshots: (store && store.snapshots) || []
  }));
}

/** ISO "2026-09-19T07:10:00.000Z" -> unix seconds, or null. */
function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/**
 * The newest snapshot of `slug` captured at or before `tsSeconds`.
 * @returns {object|null} { state, approved, capturedAt, total, marketingStatuses, source } or null
 */
export function stateAtOrBefore(snapshots, tsSeconds) {
  if (!Array.isArray(snapshots) || snapshots.length === 0 || !Number.isFinite(tsSeconds)) return null;
  const ordered = [...snapshots].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
  for (const snap of ordered) {
    const snapTs = isoToSeconds(snap.captured_at);
    if (snapTs === null || snapTs > tsSeconds) continue; // captured after the decision: not knowable
    return {
      state: snap.state || null,
      approved: Boolean(snap.approved),
      capturedAt: snap.captured_at,
      total: snap.total ?? null,
      marketingStatuses: snap.marketingStatuses || [],
      source: snap.url || null
    };
  }
  return null;
}

/**
 * The approval FLIP for a subject: the first snapshot pair where the state
 * went from "no approved product" to "approved product", with the capture
 * time the flip became knowable (the snapshot's own captured_at). Returns
 * null while every archived snapshot shows the same state on both sides —
 * which, until an approval actually lands, is the honest answer.
 */
export function approvalFlip(snapshots) {
  if (!Array.isArray(snapshots) || snapshots.length < 1) return null;
  const ordered = [...snapshots].sort((a, b) => (a.captured_at < b.captured_at ? -1 : 1));
  for (let i = 1; i < ordered.length; i++) {
    if (ordered[i].approved && !ordered[i - 1].approved) {
      return { flippedAt: ordered[i].captured_at, priorCapturedAt: ordered[i - 1].captured_at };
    }
  }
  return null;
}

/** Per-subject coverage row for the reports/UI. */
export function fdaSignalCoverage() {
  return fdaSubjects().map((s) => {
    const snaps = s.snapshots || [];
    const flip = approvalFlip(snaps);
    return {
      slug: s.slug,
      label: s.label || null,
      query: s.query || null,
      markets: s.markets || [],
      excludedNote: s.excludedNote || null,
      snapshots: snaps.length,
      firstCapturedAt: snaps[0]?.captured_at || null,
      lastCapturedAt: snaps[snaps.length - 1]?.captured_at || null,
      currentState: snaps.length ? snaps[snaps.length - 1].state : null,
      approvalFlip: flip
    };
  });
}

/** True when at least one subject has at least one snapshot (else: signal dark). */
export function hasFdaSignalArchive() {
  return fdaSubjects().some((s) => (s.snapshots || []).length > 0);
}
