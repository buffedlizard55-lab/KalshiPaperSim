#!/usr/bin/env bash
#
# scripts/push-with-race-guard.sh — commit everything this workflow run changed
# and push it to the branch the run was started on, SURVIVING a push race with
# the other bot workflow.
#
# WHY THIS SCRIPT EXISTS
# ----------------------
# Two scheduled bots commit to the same branch (the history ingest and the
# NWS forecast archive), so a run can be rejected at `git push` because the
# other bot landed a commit while this run was working. The first post-merge
# run on main (2026-09-18, run 35352002809) died exactly there and lost a full
# ingest of bars:
#
#   1. ingest-now.yml committed `data/ src/accumulated-history.js docs/data`
#      but NOT `src/forecast-data.js`, which the module-regeneration step had
#      just rewritten -> the working tree kept a tracked-but-unstaged file.
#   2. `git push` was rejected (the forecast bot had pushed meanwhile).
#   3. `git rebase origin/<branch>` refuses to start with unstaged changes
#      (exit 128), so the failure branch ran, and `git rebase --continue`
#      / `git rebase --abort` both failed with "no rebase in progress"
#      (exit 128). GitHub runs `run:` steps with `bash -e`, so the abort's
#      exit code 128 terminated the step and the whole ingest was discarded.
#
# The fix, all enforced here:
#   - commit EVERYTHING the run changed (`git add -A`, with run scratch like
#     ingest.log git-ignored), so the tree is clean and rebase can start;
#   - rebase conflicts are only auto-resolved for GENERATED modules
#     (src/accumulated-history.js, src/forecast-data.js) by REGENERATING them
#     from the merged data tree — never by hand-editing and never by staging
#     conflict markers;
#   - a conflict on any other file (e.g. two ingests appending to the same
#     data/history/*.json) is NOT resolvable locally — the run aborts the
#     rebase and exits non-zero so the job is simply re-run (the exchange is
#     the source of truth; a re-run re-fetches the bars it missed);
#   - `git rebase --abort` failures can never terminate the script mid-logic.
#
# Usage (from a workflow `run:` step, after the run's writes are complete):
#   bash scripts/push-with-race-guard.sh "<commit message>" [branch]
# branch defaults to ${GITHUB_REF_NAME}. The push target is HEAD:<branch>.
#
# Environment overrides (used by test/workflow-race-guard.sh):
#   REGENERATE_CMD  command that regenerates the generated modules from data/
#                   (default: node scripts/generate-history-module.mjs)
#   GENERATED_PATHS space-separated list of paths that REGENERATE_CMD rewrites
#   GIT_REMOTE      remote to push to (default: origin)
#   FETCH_DEEPEN    deepen count for shallow checkouts (default: 100)
#   BOT_NAME/BOT_EMAIL  committer identity (default: kalshi-history-bot)

set -uo pipefail

MESSAGE="${1:?usage: push-with-race-guard.sh <commit message> [branch]}"
BRANCH="${2:-${GITHUB_REF_NAME:-}}"
BRANCH="${BRANCH:?no branch: pass it as \$2 or set GITHUB_REF_NAME}"
REMOTE="${GIT_REMOTE:-origin}"
REGENERATE_CMD="${REGENERATE_CMD:-node scripts/generate-history-module.mjs}"
GENERATED_PATHS="${GENERATED_PATHS:-src/accumulated-history.js src/forecast-data.js}"
DEEPEN="${FETCH_DEEPEN:-100}"

echo "push-with-race-guard: branch=${BRANCH} remote=${REMOTE}"

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
# refuse to start and killed the 2026-09-18 run.
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

  # Only generated modules may be auto-resolved, and only by regeneration.
  RESOLVABLE=1
  for f in ${UNMERGED}; do
    case " ${GENERATED_PATHS} " in
      *" ${f} "*) ;;
      *) RESOLVABLE=0; echo "::error::conflict in ${f} is not a generated module — cannot resolve locally" ;;
    esac
  done

  if [ "${RESOLVABLE}" = "1" ] && [ -n "${UNMERGED}" ]; then
    # Generated modules are a pure function of data/: regenerate them from the
    # merged data tree instead of hand-merging conflict markers.
    if ${REGENERATE_CMD}; then
      # shellcheck disable=SC2086  # GENERATED_PATHS is a deliberate word list
      git add ${GENERATED_PATHS}
      if GIT_EDITOR=true git rebase --continue; then
        continue  # conflict resolved — retry the push
      fi
    fi
    echo "::error::regeneration did not resolve the rebase — aborting"
  fi

  # Not resolvable here: restore the pre-rebase state and fail the job so it
  # can simply be re-run (a re-run re-fetches whatever it missed from the
  # exchange — the source of truth — so nothing is lost but time).
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
