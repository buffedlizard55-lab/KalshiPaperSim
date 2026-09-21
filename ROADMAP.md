# Roadmap — what is done, what is next, and what is blocked

This file is the honest queue for KalshiPaperSim. Every item says what it would
change, what it needs, and how a reader could check it. Nothing here is a
promise; items leave this file only when the work is committed **and** measured.

Last reviewed: 2026-09-21 (the Arena session on branch
`arena/01a0c21e-kalshipapersim` — this session **found the test suite red on
main and fixed it** (#56: a syntax error at test/simulation.test.js:3672 stopped
all 134 tests from executing, and test 118 asserted on a Promise), shipped the
**insider half of the point-in-time signal archive** on SEC EDGAR itself
(Next #3(b) — Form 4 filings, with the first desk entrant that reads an external
archive through the shared signal hook, Next #10's second half), and stopped
short of the ESPN half with the reason and the verified endpoint paths recorded
below (#58). Previous review 2026-09-20: the MLB half of the archive, the PR #17
audit (#53), research-gap statuses (#52), the desk-season schedule fix (#54).

## Shipped (with the evidence a reader can rerun)

| # | Item | Evidence |
|---|------|----------|
| 1 | Daily bars accumulated by a GitHub-hosted ingest job (the sandbox cannot reach `*.kalshi.com` — Irregularity #4) | `data/history/*.json`, `data/history/_last-run.log`, workflow `ingest-now.yml` |
| 2 | Store verified against the live API, field-for-field, on every run | `scripts/verify-store-live.mjs` → `data/reports/store-verification.json` |
| 3 | Intraday 60-minute store, bounded by `--max-bars` with every trim recorded | `data/history/intraday/60m/` (52 markets incl. 40 weather brackets), `trims[]` in each store file |
| 4 | Walk-forward split (in-sample vs post-split) in the engine | `src/forward-test.js`, `noTradeBeforeTs` in `src/backtest-replay.js`, `--oos-split` in `scripts/strategy-sweep.mjs` |
| 5 | Family sweeps with every variant published, losers included | `data/reports/strategy-sweep-{1440,60}m-{captured,modelled}.json`, `sweep-summary.json` |
| 6 | Research ledger: every public source, how it was read, what was taken, what cannot be tested | `src/research-sources.js` → Research tab |
| 7 | Liquidity measured from the real captured ladders (no impact model) | `data/reports/liquidity-depth.json`, `src/captured-depth.js` |
| 8 | Four flights (daily, hourly, hourly-error) with promotion rules | `data/reports/flights.json`, `runCompetitionFlights` |
| 9 | **Weather markets (was the #1 next item).** KXHIGHNY brackets ingested at 60-minute resolution INCLUDING settled markets with the exchange's own results (39 of 40 finalized) | `data/history/intraday/60m/KXHIGHNY-*.json`, ingest block `hourly-weather-settled` in `data/history/_ingest-request.json`, VERIFICATION facts V82–V85 |
| 10 | **One-minute candles (was the #4 next item).** KXGOLD15M 15-minute gold markets at 1-minute resolution (8 settled contracts, 128 bars) | `data/history/intraday/1m/`, ingest block `minute-gold-15m-markets`, fact V86 |
| 11 | **Real settlements inside the replay (was the #6 next item, early).** Any captured market that is finalized with a result settles open positions at its real close_time for $1.00/$0.00 — and strategies can never see `market.result` before settlement (redaction + test) | `src/backtest-replay.js` realSettlements; tests 70–72; facts V89, V90-adjacent |
| 12 | **Point-in-time forecast archive.** The official NWS point forecast for Central Park captured ~5×/day, each snapshot time-stamped; queries refuse any snapshot captured after the decision bar | `scripts/archive-forecasts.mjs`, workflow `weather-signals.yml`, `data/forecasts/nyc-central-park.json`, `src/forecast-store.js` (facts V87, V88, V90) |
| 13 | **MasterSite signal-source review.** All 13 projects the owner asked about (CEO … PinePilot) catalogued with links, testability verdicts and flags (CEO missing, GOLD is rings) | `src/signal-sources.js` → Research tab; irregularities #32, #33; test 76 |
| 14 | Third flight: MICRO (period_interval 1) so 15-minute-market strategies are judged at their own granularity | `runCompetitionFlights` micro; `flights.json` |
| 15 | **Nine-city forecast archive (was Next #2/#3).** All nine KXHIGH* cities archived ~5×/day, each store carrying the NWS identity (grid office, grid x/y, zone, time zone) that the live API answered for its coordinates, cross-checked against the configuration on every capture and against the captured forecast URL in the offline audit | `data/forecasts/*.json`, `nwsGrid` in `scripts/archive-forecasts.mjs`, facts V98–V100, irregularity #40, test 90 |
| 16 | **Per-series fee registry, incl. every weather city and KXGOLD15M** (was Next #4). Fee multiplier is now the captured one, not a default | `src/series-fee-registry.js` (47 priceable series), `data/discovered/series-fees.json` (14,154 series) |
| 17 | **The data pipeline survived its first real push race and was repaired** (2026-09-18, session 01a0b59b). The post-merge ingest run on main died at its commit step and silently discarded every bar it fetched (#41: a tracked-but-unstaged `src/forecast-data.js` made `git rebase` refuse to start, and `git rebase --abort`'s exit 128 killed the step under `bash -e`). All three bot workflows now share ONE locally-tested push script | `scripts/push-with-race-guard.sh`, `test/workflow-race-guard.sh` (21 checks incl. a replay of the exact race), recovered run [35377388737](https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35377388737) vs the failed [35352002809](https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35352002809) |
| 18 | **Mid-day order-book capture scheduled** (was Next #5, partially). A second daily-history run at 16:40 UTC captures `with_books=true` so the quoted touch becomes point-in-time, not just the single ladder of the last on-demand run | cron `40 16 * * *` in `.github/workflows/daily-history.yml`; the request-9 run alone left 280 captured KXHIGHNY ladders |
| 19 | **The owner's own PriceKalshiHistorical reference strategies recreated** (`mee`/`fade`/`mom` → `MEE_BoardSum` / `FadeSpike_Micro` / `MomTick_Micro`), every granularity adaptation labelled on the entry; first measured results: MEE +1.18% (hourly flight, rank 5), FadeSpike **+76.57%** (micro flight, rank 1, 43 real settlements), MomTick −7.60% | `src/strategies.js`, `src/research-sources.js` R14, `data/reports/flights.json`, test 91 |
| 20 | **Second MasterSite re-review: seven more projects catalogued** (S13–S19: PriceKalshiHistorical, MLB-Prediction-model-backtest, MLB-PBP, PFFNFL, ScheduleFreeTime, NFLPRED, StockPaperSim), each with its verifiable claim, Kalshi market class and exact blocker; found the directory's StockPaperSim record stale (#42) and the exchange's duplicate dead Tesla-CEO series (#43) | `src/signal-sources.js`, `src/verification-data.js` V101–V103, tests 76/91, IRREGULARITIES.md #42/#43 |

| 21 | **The Live Desk (new tab).** A separate section that PLACES paper orders on real **OPEN** Kalshi contracts at a point in time: an order ticket priced from the captured ladder (fill, VWAP, slippage in ticks and $, official fee, unfilled remainder, liquidity cap), the desk competition, per-entrant explanations, the open-contract universe with its ladders and reasons, and a verified fill log. A ladder captured **after** the order time is refused (`LOOK_AHEAD_LADDER`); an order larger than the real book reports the rest UNFILLED; every fill and settlement carries the ladder/market URL and capture timestamp it came from | `src/live-desk.js`, `src/desk-strategies.js`, `src/desk-data.js`, `scripts/run-live-desk.mjs`, `data/reports/live-desk*.{json,jsonl}`, tests 92–103 |
| 22 | **Desk parity between server and static builds.** One report builder (`buildDeskReport`) is used by `server.js` (`/api/live-desk`, `/cutoffs`, `/universe`, `/ticket`, `/order`, `/orders`, `/ledger.jsonl`, `/fills.csv`) and by the browser build, so the two modes cannot disagree; the desk audit (D1–D13, each with its official source) is re-run in the browser and printed on the tab | `server.js`, `src/app.js` desk renderers, `test/ui-smoke.mjs` desk assertions |
| 23 | **Desk session in the one-year memory (partial Next #9).** `attachDeskSession()` copies compact results + FILL/SETTLE rows into `deskMemory` / `tradeLog` (`kind: 'desk'`). Server `/api/live-desk` and the static Live Desk tab both attach; a year reset clears the desk cache so the next run re-attaches. Desk usernames are reserved even against a stale store (`DESK_RESERVED_USERNAMES`, set-equal to `DESK_STRATEGIES` by test 104). One session per asOf — not a running multi-day book | `src/competition-memory.js`, `server.js`, `src/app.js` `renderMemory`, tests 35 / 76 / 87 / 104 |
| 24 | **Desk Season — the running multi-round book (was Next #9).** One carried portfolio per season entrant across every REAL capture batch: cash, positions, resting orders and the cumulative 10% liquidity cap carry; the real events between rounds (later captured ladders, later candlestick quotes, the exchange's own settlements) are walked before the next decision; each round publishes its own instrumentation (quotes walked, settlements applied, carried maker fills) so a dead window is visible. A season fill/settlement/mark ledger, a per-round equity curve, a coverage row per entrant with the reason it did not trade, its own 27-check audit (the 13 desk invariants D1–D13 re-run over the whole season plus S1–S12), a CLI (`scripts/run-desk-season.mjs`), five server routes, its own tab, and the season attached to the one-year memory (`attachDeskSeason`, `kind: 'desk-season'`). Three real bugs were found and closed by its own tests: the forward walk read a bar list that stops at the cut-off (irregularity #46 — no maker fill was possible) and a reserved season username was longer than the platform limit, so the reservation never applied (irregularity #47), and the desk let a paper account borrow cash and sell contracts it did not hold (irregularity #49 — now capped and re-derived by S12) | `src/desk-season.js`, `src/desk-season-strategies.js`, `scripts/run-desk-season.mjs`, `data/reports/desk-season*.json`, `server.js` (`/api/desk-season*`), `index.html` + `src/app.js` (Desk Season tab), tests 105–112 |
| 25 | **Three desk defects found and closed on the 2026-09-19 store** (session 01a0bad9). (a) The cash cap kept a flat 2% fee reserve, but the quadratic fee is up to 6.93% of gross at 9¢ — a $500 account could book $520.87 of cost (the #49 class again); the cap now walks the ladder with the EXACT per-tier official fee from `computeKalshiFee`, in both the taker and the maker-crossing paths. (b) The cap's own binary search could spin forever once its float midpoint stopped shrinking; it now runs in integer 0.01-contract units. (c) The desk module had ZERO settled contracts (open contracts filled the whole 80-market cap), degrading settlement to fixtures; the generator now reserves up to 6 finalized-with-result contracts ON TOP of the open budget, and season rounds are seeded only by the open board so the finals' historical instants cannot silently un-trade season entrants | `src/live-desk.js` (cash caps), `scripts/generate-desk-module.mjs` (finalized reserve), `src/desk-season.js` (`seasonSchedule` open-board seeds), tests 100/108/113/114 on the 2026-09-19 store; 122/122 + UI smoke + 13 desk checks + 27 season checks |
| 26 | **The FDA half of the point-in-time signal archive (was Next #3).** The official openFDA Drugs@FDA API (FDA's own database, keyless) is captured four times a day by a new workflow: one subject per tracked FDA-approval market, with each subject's search query taken verbatim from the market's own `rules_primary`; snapshots are append-only with the verbatim response meta and marketing statuses, the derived `approved` flag uses the OFFICIAL four-value marketing-status vocabulary (glossary-verified, fails closed), and `src/fda-signal-store.js` enforces the same no-lookahead rule as the forecast store. Two series are deliberately excluded with published reasons (KXFDAANNOUNCE = an announcement, not an application record; KXFDAAPPROVALPSYCHEDELIC = a composite). The first strategy on it, `FDAEdge_DrugsFDA`, is a genuine forward test: it abstains (`UNTESTED_ON_THIS_DATASET`) until an approval flip overlaps a live market. First capture pending the workflow's first run (trigger file `.github/triggers/fda.json`) | `scripts/archive-fda-signals.mjs`, `.github/workflows/fda-signals.yml`, `src/fda-signal-store.js`, `src/fda-signal-data.js` (generated), strategy + `buildFdaSignalProvider`/`composeSignalProviders`, facts V106–V107, tests 115–117 |
| 27 | **A new externally-sourced roster entry from fresh social-media research (R15).** The r/KalshiBTCUporDown15 pinned write-up ("buy the side priced 75–80¢, take profit at 95¢") is recreated mechanically as `HighProb_Scalp8095` on the real 1-minute KXBTC15M/KXETH15M/KXSOL15M/KXGOLD15M stores. Its discretionary value filter and its BITCOIN-price stop are NOT recreated (no judgement and no spot feed in this store) and the entry says so. Measured on the 2026-09-19 store: 83 trades, −65.03%, 23 real settlements — the losing tail the source's stop was meant to cut is visible in the ledger instead of hidden | `src/research-sources.js` R15 (SEARCH_EXCERPT, quoted claim), `src/strategies.js` HighProb_Scalp8095, `data/reports/flights.json` micro flight |
| 28 | **The commit-step push race that lost a scheduled weather capture, closed** (session 01a0bc0a, merged here). `scripts/push-with-race-guard.sh` auto-resolves EVERY regenerated file by regeneration only, every data bot fast-forwards onto the branch tip before capturing, weather/FDA/MLB archives upload their store as an artifact on failure, `daily-history.yml` joined the shared queue; Irregularity #51 registered; the race-guard test grew to 8 scenarios / 34 checks | `scripts/push-with-race-guard.sh`; `test/workflow-race-guard.sh`; unit test "every data workflow regenerates the same files the push guard may auto-resolve" |
| 29 | **The sports half of the point-in-time signal archive (was Next #3) — MLB, from the official MLB Stats API.** `scripts/archive-mlb-signals.mjs` captures `statsapi.mlb.com` (schedule + linescore + team codes + probable pitchers) every 20 minutes through the playing day into `data/mlb-signals/games/<ET date>.json` — one state row per change with the instant first seen, every capture instant listed, the MLBAM copyright verbatim; `src/mlb-signal-store.js` answers "what was knowable at T" and joins a `KXMLBGAME` ticker to its official game by first-pitch instant + away + home codes (all 9 finalized contracts in the store verified, V113); `minute-mlb-game-lines` ingests `KXMLBGAME` at period_interval=1; `MLBLead_InPlay` / `MLBTrail_Comeback` (R18, Tangotiger win-expectancy table) are forward tests by construction; S09 → live signal, S15 testable; the Research tab shows the FDA + MLB archive status and the per-ticker join report | `.github/workflows/mlb-signals.yml`; `data/mlb-signals/_teams.json`; tests 121–125; `node scripts/archive-mlb-signals.mjs --verify` |
| 30 | **Parallel-session PR #17 merged and audited line by line** (Irregularity #53). Kept: the placed-trades ledger, the desk UI tables, 5 roster + 3 desk usernames. Corrected: every card now says exactly what its code reads (insider / Leap / FedWatch / forecast claims removed or implemented — `LiveWeather_ForecastEdge` now really reads the NWS archive at the cut-off; `GridMM_MultiTier` now really rests maker orders); R16/R17 re-labelled UNATTRIBUTED (search-page URLs); V109/V110 re-worded; S02/S03 restored; the synthesised "upcoming trades" replaced by a list compiled only from ORDER/FILL/REST records; new test 126 fails when a card names a signal its `decide()` does not import | `src/strategies.js`; `src/desk-strategies.js`; `src/live-desk.js#buildUpcomingTrades`; `src/research-sources.js` |
| 31 | **Stale prose about the store made computed or dated** (Irregularity #52): `RESEARCH_GAPS` carry status / closedBy (4 of 5 cards had been false for two days), S09/S10/S14/S15/S17 re-worded, the Research tab shows the status badges | `src/research-sources.js`; `src/app.js#renderResearchGaps` |
| 32 | **Desk-season rounds no longer require a first-ever ladder** (Irregularity #54): a round is any capture batch with a (re)captured ladder, batch window 20 min → on the pre-merge store 6 rounds instead of 3, on the merged 2026-09-20 (16:00Z) store 7 rounds over ~53 h; 27 season checks pass | `src/desk-season.js#seasonSchedule`; `data/reports/desk-season-schedule.json` |
| 33 | **The insider half of the point-in-time signal archive (was Next #3(b)) — SEC EDGAR Form 4, official and keyless.** Three verified EDGAR steps (Atom filing list → the filing's own `index.json` → the ownership XML, element names from the SEC's own spec) archived one record per accession number with EDGAR's `acceptedAt` kept separate from this archive's `first_seen_at`; a real filing is archived verbatim as the parser fixture. Because a filing does not decay, this archive answers a **past** bar — so `InsiderFlow_Form4` is a genuine backtest on the store's real daily CEO-change bars (incl. `KXAAPLCEOCHANGE-26`, finalized by the exchange with result **yes**), not a forward test. S02 → LIVE_SIGNAL; the two price-only entries become the control. EDGAR's Atom `type=4`/`count` filters proved unreliable (#58) and are handled in code with `formsSeen` published per run | `scripts/archive-form4-signals.mjs`; `src/form4-signal-store.js`; `src/form4-signal-data.js` (generated); `.github/workflows/form4-signals.yml`; `data/form4-signals/fixtures/`; facts V114–V116; tests 127–129 |
| 34 | **The desk signal hook now has a reader (was Next #10).** `buildDeskSignalsAsync()` grew a `form4` provider beside `mlb`/`forecast`/`fda`, and `LiveInsider_Form4Flow` is the first desk entrant that opens an external point-in-time archive instead of only the captured ladders; test 126 was extended so a desk card naming insider filings must show `view.signals.form4` in its `decide()`. The 80-market cap turned out NOT to be dropping the game ladders (per-series reserves shipped earlier: KXNBAGAME 6/6, KXNCAAFGAME 4/20 kept) — what is missing is the **ladders themselves**: `data/history/` holds zero `KXMLBGAME`/`KXNFLGAME` stores, so those reserves keep 0 slots (`available: 0`) | `src/live-desk.js#buildDeskSignalsAsync`; `src/desk-strategies.js`; `src/competition-memory.js` reserved usernames; test 130 |
| 35 | **A red test suite on main, found and fixed** (Irregularity #56). At the branch point `npm test` reported ONE failure and executed NONE of the 134 tests: a syntax error (`await` in a non-async callback, test 100) killed the file at import; behind it, test 118 called the async `buildDeskReport()` without `await` and asserted on the Promise. Both came in with PR #17. The suite ran 134/134 green after the fix, before this session's four new tests | `test/simulation.test.js` tests 100/118; `npm test` |

## Next, in priority order

1. **Keep widening the forecast-archive ↔ weather-bar overlap, then measure.**
   The overlap now EXISTS (NYC snapshots from 2026-09-18T03:19Z, the other
   eight cities from 13:24Z, bars through the same day) and both forecast
   strategies replay it — but no forecast-vs-market divergence has met their
   entry conditions yet (0 fills, `UNTESTED_ON_THIS_DATASET`, reason
   published). *Needs:* the scheduled workflows only, then re-run the reports.
   *Check:* `data/reports/flights.json` → `forecastArchive` + the hourly
   leaderboard's unranked entries.
2. **True forward windows for the original roster.** `designedAt` is
   2026-09-17/18, so bars from 2026-09-18/19 onward are genuinely
   out-of-sample for every entry: the strict forward window held 2 real bars
   on the 2026-09-19 store (20 of 29 measured designs) and grows one bar per
   daily ingest — still below the 20-bar floor, so the numbers stay labelled
   directional. *Check:* `data/reports/forward-test.json` →
   `method.strictForwardBars`.
3. **The remaining signal archives.** Weather, FDA, MLB (#29) and now the
   insider half (SEC EDGAR Form 4, #33) are closed with official sources.
   Still open, in order of value:

   **(a) NFL / NBA / NCAA live state + injury reports — ESPN's public JSON, a
   TRUSTED BUT NOT OFFICIAL source that must be labelled as such.** What this
   session verified live on 2026-09-21 (so the next one does not re-derive it):
   * `GET https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries`
     → `{timestamp, status, season{year,type,name,displayName}, injuries:[{id
     (team id), displayName (team), injuries:[{id, longComment, shortComment,
     status ("Active" seen), date ("2026-09-21T03:12Z"), athlete:{firstName,
     lastName, displayName, shortName, position:{id,name,displayName,
     abbreviation}, team:{id, uid, slug, name, abbreviation ("ARI"),
     displayName}}}]}]}`. Keyless, no auth, one request per league.
   * `GET …/basketball/mens-college-basketball/scoreboard?dates=YYYYMMDD` →
     `{leagues:[{id,uid,name,abbreviation,season,logos,calendar…}], groups,
     events:[], provider, eventsDate:{date,seasonType}}` — the envelope is
     confirmed; **the per-event shape (competitions[].competitors[].score,
     status.type.state/clock) was NOT retrievable from this sandbox** (#58),
     so no scoreboard parser was written from memory.
   * The ticker join must be evidence-based, like MLB's: Kalshi game tickers
     are `KX<NFL|NBA|NCAAF|NCAAMB>GAME-<yyMONdd><AWAY><HOME>-<YES>` (date +
     team pair, NO time, unlike KXMLBGAME) and each market's `rules_primary`
     carries the exchange's own codes and names ("the DET Lions vs BUF Bills
     Pro Football game"). ESPN's team table must be archived per league and
     matched on code **and** name; NBA differs (Kalshi `NYK`/`SAS` vs ESPN
     `NY`/`SA`) so an unverified mapping would silently trade the wrong game.
   * *Needs:* one real scoreboard capture from a runner with egress, kept as a
     labelled fixture; a 1-minute ingest block for the game series; and the
     "not official" label on every card that reads it.

   **(b) ~~SEC EDGAR Form 4~~ — CLOSED 2026-09-21 (#33).**

   **(c) The owner's MLB model's pre-game probability (S14)** captured before
   first pitch — the schedule half already exists in `data/mlb-signals/`.

   *First check after merge:* `gh run list --workflow=form4-signals.yml` and
   `--workflow=mlb-signals.yml` (schedules only run on `main`); then
   `data/form4-signals/companies/TSLA.json` should hold filings back to
   ~2026-02 and `node scripts/archive-form4-signals.mjs --verify` should pass;
   after that the daily flight should rank `InsiderFlow_Form4` instead of
   listing it unranked, and the desk should show `LiveInsider_Form4Flow` fills.
4. **Point-in-time depth on every fill.** A mid-day books capture is now
   scheduled (16:40 UTC daily) and the request-9 run re-captured every ladder;
   the depth *behind* the touch is still re-anchored between snapshots.
   *Needs:* more scheduled capture density; the machinery is already running.
5. **Authenticated WebSocket smoke test.** `KALSHI_API_KEY_ID` /
   `KALSHI_API_PRIVATE_KEY` are not configured here, so the private channels
   are documented but untested. *Needs:* an RSA key in the runner environment.
6. **A browser-level UI test.** No headless browser can be installed in this
   environment, so `test/ui-smoke.mjs` exercises `src/app.js` against a DOM
   stub. *Needs:* a runner with network access to a browser download.
7. **Second venue for cross-venue arbitrage.** Every arbitrage source reviewed
   trades two venues; this project holds Kalshi only, deliberately.
   *Needs:* a second venue feed with the same verification standard.

8. **More captured ladders, at more cut-offs.** The desk can only price a
   contract when a ladder was captured at or before the cut-off. The
   scheduled 16:40 UTC `with_books=true` run adds one capture batch per day;
   the on-demand trigger (`.github/triggers/ingest.json`, bump `request`)
   re-captures the whole tracked universe when asked. *Needs:* nothing but
   time and the existing workflow.
9. **A longer season.** The carried book now exists (`src/desk-season.js`):
   one portfolio, many rounds, real settlements inside the season, 27-check
   audit. The merged 2026-09-20 (16:00Z) store yields 7 real open-board rounds
   across ~53 hours (after #32 fixed the schedule rule that had ignored re-captures).
   *Needs:* nothing but the scheduled captures continuing; `seasonSchedule`
   picks up every new capture batch automatically. *Check:*
   `node scripts/run-desk-season.mjs` → the round count and the window in
   `data/reports/desk-season-schedule.json`.
10. **MLB / NFL ladders on the desk (the hook itself is done).** The cap is no
    longer the problem: `generate-desk-module.mjs` reserves slots per series
    (KXMLBGAME 6, KXNFLGAME 4, KXNBAGAME 6, KXNCAAFGAME 4, KXNHLGAME 4, the
    nine weather series, three FDA series, three CEO series) and `deskView`
    already carries the shared `signals` provider — #34 added its first reader
    (`LiveInsider_Form4Flow`). What is missing is the DATA: `data/history/`
    holds **zero** `KXMLBGAME` and `KXNFLGAME` stores, so those reserves keep
    0 slots (`available: 0` in `data/reports/…` and `src/desk-data.js`), and no
    desk entrant can read the MLB archive at a cut-off that has no ladder.
    *Needs:* an ingest block that captures `with_books=true` ladders for
    `KXMLBGAME` (and `KXNFLGAME`) during a live game window — the same
    `minute-mlb-game-lines` block already exists for 1-minute bars; a desk MLB
    entrant reading `view.signals.mlb` is ~40 lines once the ladders land.
    *Check:* `src/desk-data.js` → `rule.seriesReserves[].available` for
    KXMLBGAME must become > 0.
11. **Process: one writer per repository at a time.** A concurrent session
    merged PR #17 to `main` while this branch was open (Irregularity #53).
    Every session must merge `main` before writing, and must not merge to
    `main` while another Arena branch is active.

## Known limitations (kept in sync with the README)

- Depth behind the touch is modelled unless a captured ladder exists, and the
  label travels with every number that uses it.
- The weather universe is the top-40 KXHIGHNY brackets by exchange-reported
  lifetime volume plus the 60-minute stores for the other eight cities (2–3
  bands per event each), not the full ~15-band board a live trader could buy —
  measured on a sample, stated on the strategy.
- `ForecastEdge_MultiCity` is a genuine forward test: the archive begins
  2026-09-18 and the ingested bars end the same day, so it reports
  `UNTESTED_ON_THIS_DATASET` (0 fills) rather than a fabricated backtest number.
- The archived point is the NWS forecast grid for the city; Kalshi settles on
  The Weather Company observations (Irregularity #34). The basis is real and
  published on the strategy, never netted out of the numbers.
- The forecast signal (NWS) and the settlement source (The Weather Company)
  are different providers (Irregularity #34) — real noise, published.
- The fee multiplier now comes from the captured Series object for every
  priceable series (irregularity #36 is closed for those). A series absent from
  the registry still falls back to the documented M=1, and the fill records
  which regime it used.
- The gold micro-flight sample is 12 settled KXGOLD15M contracts (192 one-minute
  bars) as of the 2026-09-18 evening ingest — the post-mortem computes the count
  from the store, so it updates as more settle every day the ingest runs.
- The desk is a paper simulator: no order is transmitted to Kalshi, and a desk
  fill is a claim about the captured ladder, not about a real account's fill.
- The desk prices only contracts with a captured ladder (68 of 287 tracked
  markets on the 2026-09-18 capture); 120 open contracts carry real quotes but
  no ladder and are listed as **not priceable** with the ingest command that
  would fix each one.
- The Desk Season is as long as the capture density allows: 7 rounds across ~53 h on the merged
  2026-09-20 (16:00Z) store (R01 2026-09-18T07:04Z → R07 2026-09-20T11:34Z), because a round is a moment
  this repository really queried the order book. The
  machinery picks up every new capture batch automatically, but a calendar year of continuous paper
  trading needs a year of scheduled captures — that is a clock problem, not a modelling one.
- Season marks between rounds are the last captured quote/ladder/settlement; a position with no
  captured mark in a given round is carried at cost (`NO_CAPTURED_MARK_CARRIED_AT_COST`) and the
  snapshot says so. No price is interpolated.
- The season's cash/position guards (irregularity #49) cap an order to what the account can pay for
  at the OFFICIAL fee; the 2% budget reserve is a bound on the quadratic taker fee, not a fee model
  of its own — the fee charged is still the one the schedule computes.
- A captured ladder is a snapshot, not a stream: the desk never re-anchors it,
  so an old book is priced at the prices it showed and the capture time travels
  with every fill.
- Human participants are paper-only: the store is a single-process JSON file
  (`data/store/`, git-ignored).
- The MLB game-state archive samples the official linescore every ~20 minutes (GitHub's schedule
  granularity plus queue delay), so the state a decision reads can lag the field by up to that much;
  the two MLB entries price that lag (entry only below the equal-teams table) rather than hide it,
  and both abstain until the archive overlaps a 1-minute `KXMLBGAME` bar (none existed on 2026-09-20).
- Tangotiger's win-expectancy table (R18) is a THEORY under stated assumptions (equal teams, no
  home-field advantage, 4.3 runs per game), used only as a reference price — never as data about a game.
- Five roster entries and three desk entrants merged from PR #17 are price-only rules that carry the
  name of a MasterSite project or a social-media genre; their cards say so, and test 126 fails if any
  card ever names a signal its `decide()` does not import.
- The Form 4 archive treats a filing as knowable from **EDGAR's own acceptance
  instant** (`acceptedAt`), not from when this repository captured it
  (`first_seen_at`, published alongside). That is the publisher's timestamp, not
  a measurement of publication latency made here — it is printed as `assumption`
  in every store file and returned by `form4Assumption()`.
- EDGAR's browse-edgar Atom feed ignores its own `type=4` and `count` filters
  (verified 2026-09-21: the same query returned 424B2 rows for another CIK and 10
  entries for `count=5`), so the archive filters client-side on the parsed form
  type and publishes `formsSeen` per issuer (irregularity #58).
- EDGAR's feed page size (40 entries) bounds how far back ONE capture reaches per
  issuer: months for Tesla, weeks for a filer with many insiders. The archive is
  append-only, so it grows forward on every run; walking EDGAR's older-filings
  JSON would backfill it.
- `KXOPENAICEOCHANGE` can never receive an insider signal — OpenAI is a private
  company with no Section 16 filers (irregularity #57). That contract is skipped
  with the reason published, not silently.
- The causal link between a Section 16 filing and a CEO change is **weak and
  unproven**: a departure is announced by 8-K, not by a Form 4. The two gated
  entries measure whether gating the longshot fade on real filing evidence
  changes its outcome; their cards say so and neither claims to predict a
  departure.
- No ESPN scoreboard parser exists yet: the per-event scoreboard shape could not
  be retrieved from this sandbox, and writing one from memory is exactly the
  guess the honesty contract forbids (irregularity #58). The injuries endpoint
  IS verified and its paths are recorded in Next #3(a).
