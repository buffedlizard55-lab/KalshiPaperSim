#!/usr/bin/env bash
#
# scripts/push-with-race-guard.sh — commit everything this workflow run changed
# and push it to the branch the run was started on, SURVIVING a push race with
# the other bot workflows.
#
# WHY THIS SCRIPT EXISTS
# ----------------------
# Four data bots commit to the same branch (the daily/on-demand history ingest,
# the NWS forecast archive, the FDA archive and the MLB game-state archive), so
# a run can be rejected at `git push` because another bot (or a human merge)
# landed a commit while this run was working. Two real failures are on record:
#
#   #41 — 2026-09-18, run 35352002809 (post-merge ingest): the run committed
#     `data/ src/accumulated-history.js docs/data` but NOT the regenerated
#     `src/forecast-data.js`. A tracked-but-unstaged file made `git rebase`
#     refuse to start (exit 128); the failure branch's `git rebase --abort`
#     also exited 128; under `bash -e` that killed the step and the whole
#     ingest of bars was discarded.
#
#   #51 — 2026-09-19, run 35470529935 (scheduled weather capture, main): the
#     capture and audit steps SUCCEEDED, but while the job sat in the queue the
#     ingest bot pushed its own regenerated `src/desk-data.js`, `index.html`,
#     `docs/` and AUTO doc blocks. The weather run's rebase hit those files,
#     the old GENERATED_PATHS list only covered `src/accumulated-history.js
#     src/forecast-data.js`, so the run exited 1 and the freshly captured
#     forecast snapshots were lost with the runner. The guard now auto-resolves
#     EVERY file the workflows' regeneration step rewrites, and only ever by
#     re-running that same regeneration chain over the merged tree.
#
# What is enforced here:
#   - commit EVERYTHING the run changed (`git add -A`, with run scratch like
#     ingest.log git-ignored), so the tree is clean and rebase can start;
#   - rebase conflicts are only auto-resolved for GENERATED files
#     (the five browser modules, the three generated docs, index.html, docs/)
#     by RE-RUNNING the repo's regeneration chain over the merged data tree —
#     never by hand-editing and never by staging conflict markers;
#   - after regeneration, if any conflicted file STILL contains conflict
#     markers (e.g. a hand-written README section collided), the run aborts —
#     a marker must never reach the remote through the auto-resolve path;
#   - a conflict on any non-generated file (e.g. two ingests appending to the
#     same data/history/*.json) is NOT resolvable locally — the run aborts the
#     rebase and exits non-zero so the job is simply re-run (the exchange is
#     the source of truth; a re-run re-fetches the bars it missed);
#   - `git rebase --abort` failures can never terminate the script mid-logic.
#
# Usage (from a workflow `run:` step, after the run's writes are complete):
#   bash scripts/push-with-race-guard.sh "<commit message>" [branch]
# branch defaults to ${GITHUB_REF_NAME}. The push target is HEAD:<branch>.
#
# Environment overrides (used by test/workflow-race-guard.sh):
#   REGENERATE_CMD  command that regenerates the generated files from data/
#                   (default: the exact chain every data workflow runs before
#                   this script: generate-history, generate-desk, render-docs,
#                   build)
#   GENERATED_PATHS space-separated list of paths REGENERATE_CMD rewrites.
#                   An entry ending in `/` is a directory PREFIX: every
#                   conflicted file under it is regenerable.
#   GIT_REMOTE      remote to push to (default: origin)
#   FETCH_DEEPEN    deepen count for shallow checkouts (default: 100)
#   BOT_NAME/BOT_EMAIL  committer identity (default: kalshi-history-bot)
#
# The GENERATED_PATHS default below MUST stay in sync with every workflow's
# "Regenerate the browser-safe modules and the Pages bundle" step; the unit
# test "every data workflow regenerates the same files the push guard may
# auto-resolve" (test/simulation.test.js) asserts that from the YAML and from
# the generator scripts, and test/workflow-race-guard.sh scenarios 7/8
# exercise the resolution logic itself.

set -uo pipefail

MESSAGE="${1:?usage: push-with-race-guard.sh <commit message> [branch]}"
BRANCH="${2:-${GITHUB_REF_NAME:-}}"
BRANCH="${BRANCH:?no branch: pass it as \$2 or set GITHUB_REF_NAME}"
REMOTE="${GIT_REMOTE:-origin}"
REGENERATE_CMD="${REGENERATE_CMD:-node scripts/generate-history-module.mjs && node scripts/generate-desk-module.mjs && node scripts/render-docs.js && node build.js}"
GENERATED_PATHS="${GENERATED_PATHS:-src/accumulated-history.js src/forecast-data.js src/fda-signal-data.js src/mlb-signal-data.js src/desk-data.js README.md VERIFICATION.md IRREGULARITIES.md index.html docs/}"
DEEPEN="${FETCH_DEEPEN:-100}"

echo "push-with-race-guard: branch=${BRANCH} remote=${REMOTE}"

# Is $1 covered by the generated-paths list? Exact match, or prefix match when
# the entry ends in '/' (directory of generated files, e.g. docs/).
is_generated_path() {
  local f="$1" g
  for g in ${GENERATED_PATHS}; do
    case "${g}" in
      */) [[ "${f}" == "${g}"* ]] && return 0 ;;
      *)  [ "${f}" = "${g}" ] && return 0 ;;
    esac
  done
  return 1
}

# Does the file contain unresolved conflict markers? Only the 7-marker corner
# cases are matched (git writes exactly '<<<<<<< ', possibly with a branch
# suffix, and '>>>>>>> '); '=======' alone is legitimate markdown.
has_conflict_markers() {
  local f="$1"
  [ -f "${f}" ] || return 1
  grep -qE '^(<{7}( |$)|>{7}( |$)|\|{7}( |$))' "${f}"
}

# ---------------------------------------------------------------------------
# 0. Nothing to commit? Then this run adds no commit at all.
# ---------------------------------------------------------------------------
if [ -z "$(git status --porcelain)" ]; then
  echo "push-with-race-guard: working tree clean — nothing to commit."
  exit 0
fi

git config user.name  "${BOT_NAME:-kalshi-history-bot}"
git config user.email "${BOT_EMAIL:-kalshi-history-bot@users.noreply.github.com}"

# Commit EVERYTHING this run changed. The checkout was clean when the run
# started, so `git add -A` is exactly the run's own writes (scratch files are
# git-ignored). Leaving any tracked file unstaged is what made `git rebase`
# refuse to start and killed the 2026-09-18 run (#41).
git add -A
git commit -m "${MESSAGE}"

# ---------------------------------------------------------------------------
# 1. Push, and on rejection sync with the remote tip and retry.
# ---------------------------------------------------------------------------
pushed=0
for attempt in 1 2 3; do
  if git push "${REMOTE}" "HEAD:${BRANCH}"; then
    pushed=1
    break
  fi
  echo "::warning::push rejected (attempt ${attempt}) — syncing with ${REMOTE}/${BRANCH} and retrying"

  # Shallow checkouts (actions/checkout defaults to depth 1) need their
  # boundary deepened before a rebase onto the remote tip can work.
  if [ "$(git rev-parse --is-shallow-repository)" = "true" ]; then
    git fetch "--deepen=${DEEPEN}" "${REMOTE}" "${BRANCH}" || git fetch "${REMOTE}" "${BRANCH}"
  else
    git fetch "${REMOTE}" "${BRANCH}"
  fi

  if git rebase "${REMOTE}/${BRANCH}"; then
    continue  # rebase was clean — retry the push
  fi

  # Rebase stopped on a conflict. Which files are unmerged?
  UNMERGED="$(git diff --name-only --diff-filter=U || true)"
  echo "push-with-race-guard: rebase conflict in: ${UNMERGED:-<none>}"

  # Only generated files may be auto-resolved, and only by regeneration.
  RESOLVABLE=1
  for f in ${UNMERGED}; do
    if ! is_generated_path "${f}"; then
      RESOLVABLE=0; echo "::error::conflict in ${f} is not a generated file — cannot resolve locally"
    fi
  done

  if [ "${RESOLVABLE}" = "1" ] && [ -n "${UNMERGED}" ]; then
    # Generated files are a pure function of the tracked source + data/:
    # regenerate them from the merged tree instead of hand-merging markers.
    if ${REGENERATE_CMD}; then
      # Stage the formerly conflicted files and every tracked file the
      # regeneration rewrote (docs/ copies, README AUTO blocks, ...).
      for f in ${UNMERGED}; do git add -- "${f}"; done
      git add -u
      # The one hard rule: regeneration must have produced MARKER-FREE files.
      # If any conflicted file still carries conflict markers (a hand-written
      # section collided, not an AUTO block), the auto-resolve path refuses to
      # commit it — scenario 8 of test/workflow-race-guard.sh locks this in.
      MARKERED=""
      for f in ${UNMERGED}; do
        if has_conflict_markers "${f}"; then MARKERED="${MARKERED} ${f}"; fi
      done
      if [ -n "${MARKERED}" ]; then
        echo "::error::regeneration left conflict markers in:${MARKERED} — refusing to commit"
      elif GIT_EDITOR=true git rebase --continue; then
        continue  # conflict resolved — retry the push
      fi
    fi
    echo "::error::regeneration did not resolve the rebase — aborting"
  fi

  # Not resolvable here: restore the pre-rebase state and fail the job so it
  # can simply be re-run (a re-run re-fetches whatever it missed from the
  # exchange / NWS / FDA / MLB — the sources of truth — so nothing is lost but
  # time).
  git rebase --abort 2>/dev/null || true
  echo "::error::could not sync with ${REMOTE}/${BRANCH} — re-run this job"
  exit 1
done

if [ "${pushed}" = "1" ]; then
  echo "push-with-race-guard: pushed to ${BRANCH}"
  exit 0
fi

echo "::error::push still rejected after 3 attempts"
exit 1
