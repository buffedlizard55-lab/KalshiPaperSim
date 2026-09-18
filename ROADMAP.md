# Roadmap — what is done, what is next, and what is blocked

This file is the honest queue for KalshiPaperSim. Every item says what it would
change, what it needs, and how a reader could check it. Nothing here is a
promise; items leave this file only when the work is committed **and** measured.

Last reviewed: 2026-09-18 (the Arena session on branch
`arena/01a0b59b-kalshipapersim` — this session repaired the data pipeline after
a push race discarded a whole ingest run (#41), re-ran and recovered that data,
recreated the owner's PriceKalshiHistorical reference strategies as R14 roster
entries, catalogued seven more MasterSite projects (S13–S19), and scheduled a
mid-day order-book capture).

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
   2026-09-17/18, so bars from 2026-09-19 onward are genuinely out-of-sample
   for every entry. *Check:* `data/reports/forward-test.json` →
   `strictForward.bars`.
3. **A point-in-time signal archive for a sports or FDA project.** The Kalshi
   side is DONE: FDA (six series), CEO (six series) and seven sports series are
   ingested with settled results and real settlements. The remaining gap is
   the owner's own projects — the MLB model's pre-game probabilities, the FDA
   PDUFA calendar, injury reports — archived with capture timestamps the way
   `data/forecasts/` archives NWS (S14–S16 state each one's exact blocker and
   closing action).
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
   contract when a ladder was captured at or before the cut-off, so the oldest
   cut-offs price nothing: at the 2026-09-18T18:46Z capture, live/−6h/−12h/−15h
   had 62/62/48/19 tradeable contracts and −24h and older had **0**. The
   scheduled 16:40 UTC `with_books=true` run is the fix, one capture per day.
   *Needs:* nothing but time and the existing workflow.
9. **A running multi-day desk book.** Desk fills now attach to the one-year
   memory (`attachDeskSession`, one session per asOf, FILL/SETTLE rows in
   `tradeLog` with `kind: 'desk'`). What remains is carrying OPEN positions
   across cut-offs so a desk trader has a continuous year rather than a
   sequence of independent sessions. *Needs:* a persistence decision for
   resting inventory between as-of instants.

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
- A captured ladder is a snapshot, not a stream: the desk never re-anchors it,
  so an old book is priced at the prices it showed and the capture time travels
  with every fill.
- Human participants are paper-only: the store is a single-process JSON file
  (`data/store/`, git-ignored).
