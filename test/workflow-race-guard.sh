#!/usr/bin/env bash
#
# test/workflow-race-guard.sh — verifies scripts/push-with-race-guard.sh
# against a real git remote (a bare repository), reproducing every history the
# bot workflows can end up in, including the exact push-race that killed the
# 2026-09-18 post-merge ingest run on main (IRREGULARITIES.md #41) and the
# generated-docs race that killed the 2026-09-19 scheduled weather capture
# (IRREGULARITIES.md #51).
#
# Run directly:  bash test/workflow-race-guard.sh
# (chained into test/simulation.test.js as test 121)
#
# Scenarios:
#   1. clean push (no race)
#   2. nothing to commit -> no commit is created
#   3. race, disjoint files -> rebase resolves it, both commits land
#   4. race + conflict on a GENERATED module -> regeneration resolves it,
#      no conflict markers ever reach the remote
#   5. race + conflict on a DATA file -> the run aborts the rebase and exits
#      non-zero (the job must be re-run; data is re-fetched from the exchange)
#   6. REGRESSION for the 2026-09-18 failure: a tracked file the old workflow
#      forgot to `git add` (src/forecast-data.js then, src/generated.js here)
#      must now be committed by the guard, so the rebase can start at all.
#   7. REGRESSION for the 2026-09-19 failure (#51): a race whose conflict is
#      in the DOCUMENTED surface — a render-docs-style AUTO block in README.md
#      and a build.js-style copy under docs/ — resolved by regenerating the
#      merged tree, with both hand-written lines preserved and no markers
#      committed.
#   8. the auto-resolve path must REFUSE a file regeneration cannot clean:
#      a hand-written line collided, markers survive regeneration, the guard
#      exits non-zero and NOTHING reaches the remote.
#
# Fixture layout: src/generated.js is a generated module (a pure function of
# data/*.txt), README.md carries an AUTO block between render-docs-style
# markers, and docs/generated.js is the build.js-style copy. regen.sh at the
# fixture root (outside the runner tree, never committed by `git add -A`)
# regenerates all three from the MERGED data tree, exactly like the repo's
# regeneration chain.

set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SCRIPT="${ROOT}/scripts/push-with-race-guard.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PASS=0
FAIL=0
ok()   { PASS=$((PASS + 1)); echo "  ok   - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL - $1"; }
check() { # check <description> <command...>
  local desc="$1"; shift
  if "$@" >/dev/null 2>&1; then ok "$desc"; else fail "$desc"; fi
}

# ---------------------------------------------------------------------------
# Fixture: origin (bare "GitHub"), bot (the racing workflow), runner (ours).
# ---------------------------------------------------------------------------
make_fixture() {
  rm -rf "$TMP/origin" "$TMP/bot" "$TMP/runner" "$TMP/regen.sh"
  git init --bare -q -b main "$TMP/origin"
  git clone -q "$TMP/origin" "$TMP/bot"
  git -C "$TMP/bot" config user.email bot@example.com
  git -C "$TMP/bot" config user.name bot
  mkdir -p "$TMP/bot/data" "$TMP/bot/src" "$TMP/bot/docs"
  printf 'base-source\n'   > "$TMP/bot/data/source.txt"
  printf 'base-other\n'    > "$TMP/bot/data/other.txt"
  printf 'base-source\nbase-other\n' > "$TMP/bot/src/generated.js"
  cp "$TMP/bot/src/generated.js" "$TMP/bot/docs/generated.js"
  {
    printf 'hand-line\n'
    printf '<!-- AUTO:COUNTS-START (regenerated — do not edit) -->\n'
    printf 'auto:base-source base-other\n'
    printf '<!-- AUTO:COUNTS-END -->\n'
    printf 'tail-line\n'
  } > "$TMP/bot/README.md"
  git -C "$TMP/bot" add -A
  git -C "$TMP/bot" commit -qm 'base'
  git -C "$TMP/bot" push -q origin main

  git clone -q "$TMP/origin" "$TMP/runner"
  git -C "$TMP/runner" config user.email runner@example.com
  git -C "$TMP/runner" config user.name runner
  # regen.sh lives OUTSIDE the runner tree (it must never be committed by the
  # guard's `git add -A`) and regenerates the module, the README AUTO block
  # and the docs/ copy from the MERGED data tree — the fixture stand-in for
  # `generate-history-module && generate-desk-module && render-docs && build`.
  cat > "$TMP/regen.sh" <<'REGEN'
#!/usr/bin/env bash
set -euo pipefail
cat data/source.txt data/other.txt > src/generated.js
cp src/generated.js docs/generated.js 2>/dev/null || { mkdir -p docs; cp src/generated.js docs/generated.js; }
AUTO="auto:$(tr '\n' ' ' < data/source.txt)$(tr '\n' ' ' < data/other.txt)"
awk -v auto="$AUTO" '
  /AUTO:COUNTS-START/ { print; print auto; skip=1; next }
  skip && /AUTO:COUNTS-END/ { print; skip=0; next }
  skip { next }
  { print }
' README.md > README.md.tmp && mv README.md.tmp README.md
REGEN
  chmod +x "$TMP/regen.sh"
}

run_guard() { # run_guard <commit message> — module-only generated set (scenarios 1-6)
  ( cd "$TMP/runner" &&
    REGENERATE_CMD="$TMP/regen.sh" \
    GENERATED_PATHS="src/generated.js" \
    GIT_REMOTE=origin \
    bash "$SCRIPT" "$1" main ) >>"$TMP/guard.log" 2>&1
}

run_guard_full() { # run_guard_full <commit message> — docs+copies generated set (scenarios 7-8)
  ( cd "$TMP/runner" &&
    REGENERATE_CMD="$TMP/regen.sh" \
    GENERATED_PATHS="src/generated.js README.md docs/" \
    GIT_REMOTE=origin \
    bash "$SCRIPT" "$1" main ) >>"$TMP/guard.log" 2>&1
}

origin_head() { git -C "$TMP/origin" rev-parse main; }
runner_head() { git -C "$TMP/runner" rev-parse HEAD; }
origin_file() { git -C "$TMP/origin" show "main:$1" 2>/dev/null; }

echo "1. clean push (no race)"
make_fixture
BEFORE="$(origin_head)"
printf 'new-source\n' > "$TMP/runner/data/source.txt"
if run_guard 'runner commit'; then
  ok "guard exits 0"
else
  fail "guard exits 0"
fi
check "origin advanced by exactly one commit" test "$(git -C "$TMP/origin" rev-list --count main)" = 2
check "origin carries the runner's data" test "$(origin_file data/source.txt)" = "new-source"
check "runner HEAD == origin main" test "$(runner_head)" = "$(origin_head)"

echo "2. nothing to commit"
make_fixture
if run_guard 'should not exist'; then
  ok "guard exits 0"
else
  fail "guard exits 0"
fi
check "no commit was created" test "$(git -C "$TMP/origin" rev-list --count main)" = 1

echo "3. race with disjoint files -> rebase resolves"
make_fixture
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
# the OTHER bot pushes while our run is working
printf 'bot-other\n' > "$TMP/bot/data/other.txt"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
if run_guard 'runner commit'; then
  ok "guard exits 0 after the race"
else
  fail "guard exits 0 after the race"
fi
check "both commits landed" test "$(git -C "$TMP/origin" rev-list --count main)" = 3
check "origin has the runner's data" test "$(origin_file data/source.txt)" = "runner-source"
check "origin has the bot's data" test "$(origin_file data/other.txt)" = "bot-other"

echo "4. race + conflict on the generated module -> regeneration resolves it"
make_fixture
# our run changes data and the module step regenerates the module from it
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
printf 'runner-source\nbase-other\n' > "$TMP/runner/src/generated.js"
# the other bot changes DIFFERENT data and regenerates the same module
printf 'bot-other\n' > "$TMP/bot/data/other.txt"
printf 'base-source\nbot-other\n' > "$TMP/bot/src/generated.js"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
if run_guard 'runner commit'; then
  ok "guard exits 0 after the conflict"
else
  fail "guard exits 0 after the conflict"
fi
check "both commits landed" test "$(git -C "$TMP/origin" rev-list --count main)" = 3
check "origin module regenerated from merged data (no markers)" \
  test "$(origin_file src/generated.js)" = "runner-source
bot-other"
check "origin has the bot's data too" test "$(origin_file data/other.txt)" = "bot-other"

echo "5. race + conflict on a DATA file -> abort, exit non-zero"
make_fixture
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
printf 'bot-source\n' > "$TMP/bot/data/source.txt"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
BEFORE="$(origin_head)"
if run_guard 'runner commit'; then
  fail "guard exits non-zero on an unresolvable data conflict"
else
  ok "guard exits non-zero on an unresolvable data conflict"
fi
check "origin untouched by the failed run" test "$(origin_head)" = "$BEFORE"
check "runner left with its own commit intact (rebase aborted cleanly)" \
  test "$(git -C "$TMP/runner" log --format=%s -1)" = "runner commit"
check "no conflict markers committed anywhere" \
  test -z "$(git -C "$TMP/origin" show main:data/source.txt | grep -F '<<<' || true)"

echo "6. regression 2026-09-18: tracked-but-unstaged file must not block the rebase"
make_fixture
# the run rewrote data AND a tracked module but NOTHING is committed yet —
# the old workflow committed only `data/`, leaving the module unstaged
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
printf 'runner-source\nbase-other\n' > "$TMP/runner/src/generated.js"
# the other bot races us with a disjoint change
printf 'bot-other\n' > "$TMP/bot/data/other.txt"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
if run_guard 'runner commit'; then
  ok "guard survives the exact 2026-09-18 race"
else
  fail "guard survives the exact 2026-09-18 race"
fi
check "the once-forgotten module is committed too" \
  test "$(origin_file src/generated.js)" = "runner-source
base-other"
check "both commits landed" test "$(git -C "$TMP/origin" rev-list --count main)" = 3

echo "7. regression 2026-09-19 (#51): README AUTO block + docs/ copy race -> regeneration resolves it"
make_fixture
# our run: new data, and its regen step already rewrote README/docs from the
# merged-at-that-moment tree (which does NOT yet contain the other bot's data)
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
printf 'runner-source\nbase-other\n' > "$TMP/runner/src/generated.js"
cp "$TMP/runner/src/generated.js" "$TMP/runner/docs/generated.js"
# a HAND-WRITTEN line above the AUTO block, unique to this run
printf 'hand-line\nrunner hand line\n' > "$TMP/runner/README.new"
tail -n +2 "$TMP/runner/README.md" >> "$TMP/runner/README.new" && mv "$TMP/runner/README.new" "$TMP/runner/README.md"
# the other bot: different data, same files regenerated, hand-written line
# appended at the BOTTOM of README (git auto-merges that region)
printf 'bot-other\n' > "$TMP/bot/data/other.txt"
printf 'base-source\nbot-other\n' > "$TMP/bot/src/generated.js"
cp "$TMP/bot/src/generated.js" "$TMP/bot/docs/generated.js"
printf 'bot hand line\n' >> "$TMP/bot/README.md"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
if run_guard_full 'runner commit'; then
  ok "guard exits 0 after the docs race"
else
  fail "guard exits 0 after the docs race"
fi
check "both commits landed" test "$(git -C "$TMP/origin" rev-list --count main)" = 3
README_ORIGIN="$(origin_file README.md || true)"
if printf '%s' "$README_ORIGIN" | grep -qF 'auto:runner-source bot-other'; then ok "README AUTO regenerated from the merged data"; else fail "README AUTO regenerated from the merged data: $(printf '%s' "$README_ORIGIN" | head -5 | tr '\n' '|')"; fi
if printf '%s' "$README_ORIGIN" | grep -qF 'runner hand line'; then ok "runner hand line preserved"; else fail "runner hand line preserved"; fi
if printf '%s' "$README_ORIGIN" | grep -qF 'bot hand line'; then ok "bot hand line preserved"; else fail "bot hand line preserved"; fi
if printf '%s' "$README_ORIGIN" | grep -qE '^<<<<<<< |^>>>>>>> '; then fail "no conflict markers reached the remote README"; else ok "no conflict markers reached the remote README"; fi
check "docs/ copy regenerated from merged data too" \
  test "$(origin_file docs/generated.js)" = "runner-source
bot-other"
check "origin has the runner's data" test "$(origin_file data/source.txt)" = "runner-source"
check "origin has the bot's data" test "$(origin_file data/other.txt)" = "bot-other"

echo "8. auto-resolve refuses what regeneration cannot clean (hand-written collision)"
make_fixture
# both runs rewrite the SAME hand-written line above the AUTO block -> the
# marker survives in that region no matter how often the AUTO block regenerates.
# The DATA changes stay disjoint, so the only conflicted file is the generated
# README itself — the exact case the marker scan must refuse to auto-resolve.
printf 'runner-source\n' > "$TMP/runner/data/source.txt"
awk 'NR==1{print "runner head"; next} {print}' "$TMP/runner/README.md" > "$TMP/runner/README.new" && mv "$TMP/runner/README.new" "$TMP/runner/README.md"
printf 'bot-other\n' > "$TMP/bot/data/other.txt"
awk 'NR==1{print "bot head"; next} {print}' "$TMP/bot/README.md" > "$TMP/bot/README.new" && mv "$TMP/bot/README.new" "$TMP/bot/README.md"
printf 'base-source\nbot-other\n' > "$TMP/bot/src/generated.js"
cp "$TMP/bot/src/generated.js" "$TMP/bot/docs/generated.js"
git -C "$TMP/bot" add -A && git -C "$TMP/bot" commit -qm 'bot commit'
git -C "$TMP/bot" push -q origin main
BEFORE="$(origin_head)"
if run_guard_full 'runner commit'; then
  fail "guard exits non-zero when markers survive regeneration"
else
  ok "guard exits non-zero when markers survive regeneration"
fi
check "origin untouched" test "$(origin_head)" = "$BEFORE"
if grep -q 'refusing to commit' "$TMP/guard.log"; then ok "guard log reports the marker refusal"; else fail "guard log reports the marker refusal: $(tail -3 "$TMP/guard.log" | tr '\n' '|')"; fi
check "rebase cleaned up on the runner" \
  test -z "$(git -C "$TMP/runner" diff --name-only --diff-filter=U)"

echo
echo "passed ${PASS}, failed ${FAIL}"
[ "$FAIL" = 0 ]
