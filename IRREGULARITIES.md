# Flagged Irregularities

**Generated:** 2026-09-22 by `scripts/render-docs.js` from `src/verification-data.js`.
**62 irregularities** flagged during this build: 18 high, 29 medium,
12 low, 2 informational.

Every entry records **what was assumed**, **what is actually true**, **the evidence**, **what the code does
about it**, and **what you should do**. Nothing here is speculation: each item was found by comparing an
assumption against an official document or a real API response.

---

## #1 — The previous market catalog was fabricated — four series tickers do not exist

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That KXSP500, KXNVDA, KXAAPL and KXNDX were real Kalshi series usable as a market catalog. |
| **Verified truth** | All four return {"error":{"code":"not_found","message":"not found"}} from the production API. Real series use different naming (KXINXY for the S&P 500 yearly range, KXNASDAQ100Y for the Nasdaq-100) and real markets are event-scoped tickers such as KXINXY-27DEC31H1600-T4600. |
| **What the code does** | The fabricated catalog was deleted. Every market and series in this app now comes from a captured live response, and the rejected tickers are kept in an explicit deny-list so they can never silently return. |
| **What you should do** | Open the 404 links yourself, then compare with the captured series in src/verified-snapshot.js. |

**Evidence**

- 404 proof: <https://external-api.kalshi.com/trade-api/v2/series/KXNVDA>
- Real series list: <https://external-api.kalshi.com/trade-api/v2/series?category=Companies>
- Recorded in code — `src/verified-snapshot.js → SERIES_NOT_FOUND; src/strategies.js → REJECTED_FABRICATED_TICKERS`

---

## #2 — The fee model was wrong — Kalshi fees are quadratic, not a flat 0.5% per contract

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | A flat fee of 0.5% of contract value. |
| **Verified truth** | The official schedule is taker = round up(M × 0.07 × C × P × (1−P)) and maker = round up(M × 0.0175 × C × P × (1−P)), with M read from series.fee_multiplier. The fee is largest at P = 0.50 (1.75¢ per contract for a taker) and falls toward the extremes. |
| **What the code does** | Replaced with the official formula, including the round-up-to-the-cent rule, per-series multipliers and separate maker/taker coefficients. Fees are itemised per fill and attributed in the post-mortems. |
| **What you should do** | Check any fill in the trade log: fee = round up(0.07 × contracts × P × (1−P)) for a taker. |

**Evidence**

- Official fee schedule (PDF): <https://kalshi.com/docs/kalshi-fee-schedule.pdf>
- Implementation — `src/kalshi-fees.js — computeKalshiFee(), roundUpToIncrement(), rawQuadraticFee()`

---

## #3 — A browser cannot use Kalshi’s WebSocket — signed headers are required at handshake

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | The front end could open wss://external-api-ws.kalshi.com/trade-api/ws/v2 directly for real-time prices. |
| **Verified truth** | Kalshi requires KALSHI-ACCESS-KEY / -SIGNATURE / -TIMESTAMP on the handshake, and the browser WebSocket API cannot set request headers. A server-side relay is mandatory, and the relay needs an API key. |
| **What the code does** | Built a server relay with an RFC 6455 client that signs the handshake. Without credentials the app serves a labelled SIMULATED market-maker feed and says so in the header pill, the feed panel and the API response. |
| **What you should do** | Set KALSHI_API_KEY_ID and KALSHI_API_PRIVATE_KEY, restart the server, and the feed pill switches from SIMULATED to LIVE. |

**Evidence**

- WebSocket guide: <https://docs.kalshi.com/getting_started/quick_start_websockets>
- API keys & signing: <https://docs.kalshi.com/getting_started/api_keys>
- Relay implementation — `src/ws-lite.js (zero-dependency client that CAN set headers) + server.js /ws/feed`

---

## #7 — Browser JavaScript cannot be truly sandboxed — the Strategy Lab is an isolation layer, not a security boundary

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That user-supplied strategy code could be safely executed. |
| **Verified truth** | Compiling user code with new Function() in a page cannot prevent a determined author from reaching page globals. True isolation needs an iframe with a strict CSP, a hardened worker realm, or a separate server runtime such as isolated-vm. |
| **What the code does** | Applied defence in depth: static deny-list (fetch, WebSocket, eval, document, window, localStorage, privateKey, …), no globals injected, whitelisted frozen ctx, validated actions, capped actions per period, and runtime errors captured instead of thrown. Server-side execution of user code is DISABLED by default (ALLOW_USER_CODE=false). |
| **What you should do** | Do not expose the Lab to untrusted users without a real isolation runtime. This is listed as remaining work. |

**Evidence**

- Statement in code — `src/strategy-sandbox.js header — HONEST SECURITY STATEMENT`

---

## #8 — KXBTCY has fee_multiplier 0 — assuming M = 1 everywhere overcharged every BTC trade

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | A fee multiplier of 1 for all markets. |
| **Verified truth** | The captured series object for KXBTCY returns fee_type "quadratic" with fee_multiplier 0, so the official formula yields $0.00 fees on that series, while KXNASDAQ100Y returns fee_multiplier 1 with quadratic_with_maker_fees. |
| **What the code does** | Fees are now resolved per series from the captured Series objects; ReplayEngine passes no global multiplier, and each competition result records the feeConfiguration it actually used. |
| **What you should do** | Open /api/run-competition and read competition.dataProvenance.feeConfiguration — KXBTCY shows fee_multiplier 0. |

**Evidence**

- KXBTCY series: <https://external-api.kalshi.com/trade-api/v2/series/KXBTCY>
- KXNASDAQ100Y series: <https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y>

---

## #11 — Candlesticks carry no depth, so fills behind the touch cannot be verified

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That historical replay could reproduce real execution quality. |
| **Verified truth** | A candlestick gives OHLC of the trade price plus OHLC of the yes_bid and yes_ask, and volume/open interest — but no size at any level. Any fill that walks beyond the touch is a model, not an observation. |
| **What the code does** | The replay drives each period from the REAL bid/ask/trade range (resting bids fill only when the period low reaches them, asks only when the high does), and reports depth-model assumptions in competition.dataProvenance.depthModelNote. Anything beyond captured depth is disclosed, never presented as observed. |
| **What you should do** | Read the depth note under any strategy detail — it states exactly which part of the fill is modelled. |

**Evidence**

- Candlestick schema: <https://docs.kalshi.com/api-reference/market/get-market-candlesticks>

---

## #12 — The engine used to invent an execution price beyond the book, and that invention dominated results

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That an order larger than all depth should fill at "the last level plus 5 ticks". |
| **Verified truth** | Kalshi does not execute beyond available depth. With 100%-of-cash sizing the invented penalty fill accounted for −$76,966 of one strategy’s −$66,578 equity change — i.e. the headline result was mostly an artefact of our own model, not of the market. |
| **What the code does** | exhaustionPolicy now defaults to "partial": only real depth fills, the remainder is reported as UNFILLED, and the leaderboard discloses unfilled contracts per strategy. The legacy "penalty" mode still exists for stress tests, is opt-in, and is labelled as an invented price wherever it appears. |
| **What you should do** | Compare the Unfilled column on the leaderboard with each strategy’s attribution — no fabricated price appears anywhere. |

**Evidence**

- Attribution before the fix — `factors listed "Liquidity shortfall (book exhausted)" as the largest term for 6 of 8 strategies`

---

## #20 — The "verbatim" comparison used by the expander oracle was shallow — it never compared prices

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That JSON.stringify(bar, Object.keys(sample).sort()) proves an expanded tuple equals the captured bar field-for-field. |
| **Verified truth** | The array form of the replacer argument filters property names at EVERY depth, so nested price / yes_bid / yes_ask objects serialise as {}. Two bars with completely different prices compared equal, meaning the expander oracle (and the ingest merge check) could not have detected a transcription error in any price field. |
| **What the code does** | Added src/json-utils.js with stableStringify/stableEqual (recursive, sorted keys) and switched every deep comparison — the expander oracle, the ingest merge conflict check and test 14 / test 54 — to it. Re-running the strict comparison on the existing captures found zero differences, so no stored bar was wrong, but the earlier "verified" claim was weaker than stated. |
| **What you should do** | Run test 51 and 54; both now compare every nested field. Any future "verbatim" check must use stableEqual, never the key-array replacer. |

**Evidence**

- MDN: the replacer parameter: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter>
- Fix + regression test — `src/json-utils.js → stableStringify(); test 51 asserts the naive comparison is blind and stableEqual is not`

---

## #21 — A regime sweep over the replay would require inventing price history

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That a 10 strategies × 6 regimes × N seeds matrix could be run against the captured candlesticks. |
| **Verified truth** | Regime presets change how prices evolve. Applying them to a replay means overwriting real captured bars with synthetic bull/bear/volatile paths — fabricating history, which this repository forbids. The runner has always stated that the replay uses real candles UNMODIFIED. |
| **What the code does** | Built a sensitivity sweep that varies only what is ours to vary — the seed (modelled depth behind the touch), the market universe, the settlement scenario and the exhaustion policy — and reports the result in SENSITIVITY.md. Every cell replays the same real bars. |
| **What you should do** | Read SENSITIVITY.md. Treat the hypothetical settlement rows as scenarios, not outcomes: none of these contracts had resolved at capture time. |

**Evidence**

- Runner disclosure — `src/strategy-runner.js → competition.regimeNote: "This replay always uses the REAL captured candlesticks UNMODIFIED"`
- Honest replacement — `scripts/sensitivity-sweep.mjs: 10 strategies × 3 seeds × 3 universes × 3 settlement scenarios = 270 strategy runs`

---

## #26 — The replay window was capped at 61 bars by our own start_ts, not by Kalshi — the real window was 268

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That live market candlesticks only go back to the /historical/cutoff date (2026-07-19), so a 61-bar window was the most the public API would give. |
| **Verified truth** | The cutoff bounds the *historical tier* datasets (market_positions, market_settled, orders, trades), not candlesticks. Probing the same market with a one-day window at 2026-01-01, 2026-03-01 and 2026-05-01 each returned a real daily bar, and a full backfill from each market’s open_time returned 263 bars for T33000 (2025-12-24 → 2026-09-17). The 61-bar series was an artefact of the start_ts we asked for. |
| **What the code does** | The ingest job now backfills from each market’s real open_time (--days=0, paged in 180-day windows) instead of a fixed 90-day window, and the replay reads the longer stored series wherever it is a verified superset of the capture. Only the market’s own open_time bounds the series. |
| **What you should do** | Run `node scripts/ingest-history.mjs --verify` to see each market’s real window, or open data/history/_manifest.json. Do not assume any window length — read the coverage table. |

**Evidence**

- Cutoff endpoint (the date we trusted): <https://api.elections.kalshi.com/trade-api/v2/historical/cutoff> — `market_positions_last_updated_ts / market_settled_ts / orders_updated_ts / trades_created_ts = 2026-07-19T00:00:00Z`
- One-day probe at 2026-01-01 — a REAL bar came back: <https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1767225600&end_ts=1767312000&period_interval=1440> — `end_period_ts 1767243600, close_dollars 0.0700, volume_fp 247.00`
- One-day probe at 2026-03-01 — a REAL bar came back: <https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1772323200&end_ts=1772409600&period_interval=1440>
- One-day probe at 2026-05-01 — a REAL bar came back: <https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1777593600&end_ts=1777680000&period_interval=1440>
- Resulting store — `data/history/_manifest.json — 30 markets, 7,189 bars, 4,666 added in one run, 0 conflicts`

---

## #29 — Modelled depth let a strategy "buy" 250,000 contracts on a 400-contract day and book +2,005%

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That a fill only had to respect the order book — so if the book (whose size behind the touch is MODELLED, because candlesticks carry no depth) offered size at the period’s low, taking all of it was a legitimate trade. |
| **Verified truth** | The bar for that day records the contracts that actually traded. KXINXY-26DEC31H1600-B6900 traded 389 contracts on a median day; the replay was filling orders of 250,000 at the intraday low and then marking them at the close. Under the first 30-market, 268-period run this produced PanicDip_ShockTiming +2,005.93% (+146,402% under a 50% per-market cap), 19 single-day equity moves above 20%, and one of +63.95%. Those numbers were an artefact of our modelled depth, not an edge anyone could trade. |
| **What the code does** | Fills are now bounded by the period’s REAL traded volume: no order — taker or resting maker — may take more than maxFillFractionOfPeriodVolume (default 10%) of the contracts that traded in that bar, and a resting order can fill partially against it. Whatever the bound refuses is counted and reported (volumeCappedContracts) exactly like an unfilled remainder. The same roster on the same data now returns between +9.25% and -16.30%. |
| **What you should do** | Treat any double-digit-percent-per-DAY compounding in a result as a modelling artefact until you have checked volumeCappedContracts for that strategy. The bound is a parameter, not a law: `--max-fill-fraction=null` restores the old behaviour for stress tests. |

**Evidence**

- Bar volume is the period’s traded contracts: <https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-B6900/candlesticks?start_ts=1781841600&end_ts=1789689600&period_interval=1440> — `median daily volume_fp 389.00 across 264 bars`
- The run that exposed it — `seed 20260917, 268 periods, 30 markets: PanicDip_ShockTiming +2005.93%, 1,027 trades, 19 days with >20% equity moves`

---

## #37 — Maker fees were charged on series that do not have them — the maker/taker split is a PER-SERIES property the engine ignored

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That any resting order pays the maker coefficient: fees = round up(M x 0.0175 x C x P x (1-P)). KALSHI_FEES.makerCoefficient was applied unconditionally in OrderBook.processRestingFills(). |
| **Verified truth** | The official schedule charges a resting order only if the series is in its Maker Fees section: "Trading fees are only charged for orders that are immediately matched with orders sitting on the orderbook. Trading fees are not charged for orders placed that are not immediately matched and are instead left as resting orders on the orderbook unless they are included in our Maker Fees section." The live Series object marks exactly those series with fee_type = "quadratic_with_maker_fees". In the 2026-09-18 capture of 14,154 series, KXNFLGAME, KXMLBGAME, KXNBAGAME, KXWNBAGAME, KXNCAAFGAME, KXFEDDECISION, KXCPIYOY, KXINXY and KXNASDAQ100Y carry that flag, while every KXHIGH* weather series (and KXGOLD15M, KXBTC15M, KXETH15M, KXSOL15M, KXUFCFIGHT) is plain "quadratic" and pays NOTHING for a resting order. The same capture also shows multipliers that are not 1: the MLB series 0.5, KXBTCY 0. |
| **What the code does** | Fees are resolved per series from a capture, and every fill states the regime that produced its fee. Maker strategies that traded plain-quadratic series were being over-charged before this fix; the ledger, the reports and the Pages data were regenerated. Any strategy text that asserted "the maker coefficient is a quarter of the taker fee" was corrected to the per-series rule. |
| **What you should do** | Open the Trade Ledger tab: the Fee Regimes table counts the fills and dollars under each rule, and any row can be traced back to its series ticker in src/series-fee-registry.js. |

**Evidence**

- Official fee schedule (PDF) — the sentence quoted above: <https://kalshi.com/docs/kalshi-fee-schedule.pdf>
- The real per-series configuration — `data/discovered/series-fees.json (GET /series?include_volume=true, capturedAt 2026-09-18T06:42:31Z) -> src/series-fee-registry.js`
- Endpoint documentation: <https://docs.kalshi.com/api-reference/market/get-series-list>
- The fix — `src/simulation-engine.js -> OrderBook.makerFeesApply (set from the series fee_type); a plain-quadratic maker fill now records fee 0 and puts the rule that produced it in feeFormula`
- The guard — `test 86 proves both branches: $0.00 on a plain-quadratic series, exactly $0.42 on 100 contracts at $0.40 for a maker-fee series`
- Visible per fill — `src/trade-ledger.js -> feeRegime column (taker_0.07 | taker_zero | maker_0.0175 | maker_free | settlement) and the Fee Regimes table on the Trade Ledger tab`

---

## #41 — A push race silently discarded an entire ingest run's data (the bot committed nothing and exited 128)

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That the inline push-race guard in the three bot workflows could always recover from losing a push race by rebasing on the remote tip. |
| **Verified truth** | The first post-merge ingest run on main (2026-09-18, run 35352002809) fetched a full universe of bars and then died at its "Commit the new history" step with exit code 128, so EVERY bar, book snapshot and settlement check that run collected was discarded — the runner's disk is thrown away. Root cause, three stacked bugs: (1) ingest-now.yml's commit step added data/, src/accumulated-history.js and docs/data but NOT src/forecast-data.js, which the module-regeneration step had just rewritten — the tree kept a tracked-but-unstaged file; (2) the forecast bot won the push race meanwhile, and `git rebase` refuses to start with unstaged changes (its own exit 128); (3) the failure branch then ran `git rebase --continue` and `git rebase --abort` — both fail with "no rebase in progress" (exit 128) — and because GitHub runs run: steps with bash -e, the abort's exit code terminated the step before the ::error message could be emitted. The daily-history.yml copy of the guard had already been fixed for exactly this race; ingest-now.yml had not. |
| **What the code does** | All three workflows (ingest-now.yml, daily-history.yml, weather-signals.yml) now call the shared script. The lost bars were not lost permanently — the exchange is the source of truth and the request-9 re-run re-fetched the same windows — but the 14:45–18:00 UTC window on 2026-09-18 had no ingest commit until the re-run landed, and any analysis run in that window saw a store that lagged reality by hours. |
| **What you should do** | Open the two run links and compare their Commit steps; then run `bash test/workflow-race-guard.sh` locally to watch the exact failure mode and its fix execute. |

**Evidence**

- The failed run (job log shows all steps green until "Commit the new history"): <https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35352002809>
- The recovered re-run (same universe, committed by the new guard): <https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35377388737>
- The fix — one shared, locally-tested script — `scripts/push-with-race-guard.sh: commits EVERYTHING the run changed (git add -A, run logs now git-ignored), rebases with --autostash, auto-resolves rebase conflicts ONLY for generated modules and ONLY by regeneration, aborts cleanly on any other conflict, and never lets a `git rebase --abort` failure terminate the script.`
- The regression test — `test/workflow-race-guard.sh — 21 checks against a real bare-repo remote, including a replay of the exact 2026-09-18 race (tracked-but-unstaged module + concurrent bot push) and the data-conflict case, which must fail the job rather than commit conflict markers.`

---

## #46 — The forward walk read a bar list that stops at the cut-off, so a resting order could never be crossed by a real trade

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That buildTimeline() could see later candlestick quotes because it filtered events by `endTs > asOfMs` and the desk publishes the bar walk as live instrumentation. |
| **Verified truth** | It read `universe.markets[].bars`, and buildDeskUniverse deliberately truncates every bar list AT the cut-off — that truncation is what keeps a DECISION point-in-time. The `endTs > asOfMs` filter could therefore never admit a bar, at any cut-off. Measured on the 2026-09-18 store: bars after the cut-off inside the decision view = 0 at live/−6h/−12h/−24h, while the store itself held 185/272/513 later ladder captures at those cut-offs. Result: a resting (maker) order could only be crossed by a sparse later ladder snapshot, never by a real traded candlestick, and no paper position could be resolved by a later real trade. The Live Desk reported 0 maker fills at every cut-off it was asked about. |
| **What the code does** | buildTimeline() now walks the raw store bars (data.markets[].bars) and filters by `endTs > asOfMs` itself, while the universe handed to strategies keeps truncating at the cut-off. After the fix the −6h cut-off walks 338 candlestick quotes + 4 real settlements (342 events), −12h walks 568 and −24h walks 1172; the newest capture honestly walks 0 because the store ends there. A carried maker order now fills at the −15h cut-off (1 maker fill) and the season book is crossed by later real quotes. |
| **What you should do** | Open the Live Desk tab at the −6h cut-off: "events walked" must be non-zero, and every maker fill must name the later real quote that crossed it (irregularity #46 is what made that number zero). |

**Evidence**

- buildTimeline() — now reads the RAW store bars and filters by endTs itself (commented in place): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js>
- buildDeskUniverse() truncation — the reason the decision view must NOT see later bars: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js>
- Regression test 107 pins both halves (non-zero forward quotes; no decision bar after asOf): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js>

---

## #49 — The desk let a paper account borrow cash and sell contracts it did not hold

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That a strategy sizing from `view.cash` could never spend more than it had, so the desk needed no cash rule of its own. |
| **Verified truth** | placeDeskOrder() sized against the captured LADDER and the 10% liquidity cap, and never against the portfolio. An entrant that emitted three 35%-of-cash legs (or a carried season entrant re-spending its cash every round) could spend more than 100% of it, and a `sell` intent with no position was booked as a naked short — both on a venue that settles in cash and does not offer margin or shorting. The desk audit could not catch it either: the equity identity (equity − starting = realized + unrealized − fees) closes just as neatly on a −$80,000 cash balance as on a real one. |
| **What the code does** | Both runners now pass their portfolio into placeDeskOrder(). A BUY is re-sized to what the cash can pay for including the official fee (a 2% budget reserve covers the quadratic taker fee) and the reduction is recorded as `cashCapped` on the ORDER and the FILL, with the original requested size preserved and the shortfall reported as unfilled. A SELL with no position is rejected (NO_POSITION_TO_SELL) instead of opening a negative one, and a SELL larger than the position is capped to the held size (`positionCapped`). A crossed resting BUY is capped the same way at the crossing instant, because a carried book may have spent the cash in between. auditSeason() adds S12: no round snapshot may show negative cash and no SELL fill may exceed what that entrant had already bought. |
| **What you should do** | Read any FILL with `cashCapped` > 0 or any REJECT with NO_POSITION_TO_SELL in data/reports/desk-season-ledger.jsonl: the ledger must show a smaller order (or a refusal), never a negative balance. |

**Evidence**

- placeDeskOrder — now carries the cash/position guards and records them on the order and the fill: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js>
- Season audit S12 re-derives both rules from the ledger alone: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season.js>
- Test 114 — borrow, naked short and over-sized sell all refused or capped: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js>

---

## #51 — A successful scheduled weather capture was lost at the commit step: the push guard could only auto-resolve two of the files the bots regenerate

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That the push guard's auto-resolve list (src/accumulated-history.js, src/forecast-data.js) covered every file a data bot's regenerate step rewrites, so a queued run that rebased onto another bot's commit would always be able to finish. |
| **Verified truth** | Scheduled "Weather signal archive" run 35470529935 on main (2026-09-19, job 105974446303): the capture, audit and regenerate steps SUCCEEDED, then "Commit the new snapshots" failed with the annotations "conflict in src/fda-signal-data.js / src/desk-data.js / docs/src/forecast-data.js / docs/src/fda-signal-data.js is not a generated module — cannot resolve locally" and "could not sync with origin/main — re-run this job". While the run sat in the data-pipeline queue the ingest bot had pushed its own regenerated desk / FDA modules and docs/ copies; the old GENERATED_PATHS list did not name them, so the guard treated real generated files as hand-written and aborted. The freshly captured NWS snapshots existed only on the runner and were discarded with it — no false data was written, but a real capture was lost. |
| **What the code does** | scripts/push-with-race-guard.sh now lists every file the workflows' regenerate step rewrites (the five browser modules, README/VERIFICATION/IRREGULARITIES, index.html, docs/) and resolves a conflict on them ONLY by re-running the same regeneration chain over the merged tree, then refuses to commit if any conflict marker survives; every data bot fast-forwards onto the branch tip BEFORE capturing; the weather, FDA and MLB workflows upload their store directory as an artifact when a run fails so a capture can no longer die with the runner; daily-history.yml joined the shared per-ref queue. A unit test checks the guard's list against the generator scripts and every workflow's regenerate step. The lost capture itself is not recoverable — the archive simply has no 2026-09-19 ~21:4x snapshot, which the coverage table shows. |
| **What you should do** | Open the run link: the capture step is green and the commit step red with the quoted annotations. Then compare data/forecasts/*.json captured_at values around 2026-09-19T21:40Z — there is none, and there should be none. |

**Evidence**

- The failed run (annotations on the commit step): <https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35470529935>
- The fix (commit 885e3fa): every regenerated file auto-resolvable, only by regeneration: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/push-with-race-guard.sh>
- test/workflow-race-guard.sh — scenarios 7 and 8 reproduce the race and the refusal: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/workflow-race-guard.sh>

---

## #53 — A parallel session merged PR #17 with strategy cards that described signals the code does not read, two "sources" that are search pages, and a fabricated "upcoming trades" list

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That everything merged to main under the honesty contract had been checked line by line against the code: that a card saying "when insiders hold equity" reads insider data, that a quoted source can be opened, that an "upcoming trade" is a strategy decision. |
| **Verified truth** | PR #17 (commit cf4e116, merged 2026-09-20T03:08Z by a concurrent session while this one was working on the same repository) added: (1) InsiderFiling_Drift / LiveInsider_FilingFader, whose text claimed Form 4 / insider-retention signals while the code reads only the contract's own prices (and the desk version assumed a YES ask of 0.20 when no quote existed); (2) TheLeap_BreakoutRank / LiveTheLeap_Momentum, attributing "champion" behaviour to The Leap without a source; (3) LiveWeather_ForecastEdge, whose card and order reasons said "reads the point-in-time NWS forecast" while the code bought any KXHIGH bracket asked ≤ 0.45 without opening the archive; (4) GridMM_MultiTier, whose rules said "rest a limit buy … sell at +3 ticks" while decide() sent a taker market buy with no exit; (5) FOMC_ProbabilitySniper, whose text cited CME FedWatch divergence and a "modal strike" the code never computes; (6) NCAAF_GameFavourite, stating as fact that 0.60–0.85 favourites "settle YES at a frequency exceeding implied probability" with no source; (7) research entries R16/R17 whose URLs are a YouTube search page and an X search page, with "quotations" that cannot be attributed; (8) fact V109 claiming all 13 MasterSite projects were "mapped to concrete, executable trading strategies with verified pricing"; (9) a Live Desk "upcoming trades" builder that, for entrants without a declared plan, INVENTED rows from regex matches on the strategy id, a default price of 0.50 and generated trigger text ("Enter order when contract conditions align with …") — shown on the site as READY setups. Its placed-trades ledger, the UI tables and the new tests were sound. |
| **What the code does** | Nothing was deleted and no username changed (they are the competition's identities): every card was rewritten to say exactly what its code reads; LiveWeather_ForecastEdge was rewritten to actually read the NWS archive at the cut-off (the desk market view now exposes the bracket strikes it needs); GridMM_MultiTier was rewritten to rest maker orders as its rules state; the desk entrant that assumed a 0.20 quote now abstains without one; R16/R17 carry a new capture method UNATTRIBUTED and their strategies are labelled original designs; V109/V110 were re-worded; S02/S03 were restored to not-testable-as-a-signal with the entries listed as price-only; buildUpcomingTrades now compiles ONLY from the desk's own ORDER/FILL/REST records (open positions awaiting settlement, working maker orders, unfilled remainders) and the fabricated per-entrant upcoming() hooks were removed. A new test asserts that no strategy text names a signal source its code does not import. Process finding: two sessions on one repository must merge each other's branch before writing — this session did (its first commit is that merge), the other did not. |
| **What you should do** | Open PR #17's diff for src/desk-strategies.js and compare LiveWeather_ForecastEdge.decide() there (no forecast read) with the current file (forecastHighAt at the cut-off). Then open the Live Desk tab: every upcoming-trade row now names the ORDER record it came from (id UPC-<orderId>-…). |

**Evidence**

- PR #17 as merged: <https://github.com/buffedlizard55-lab/KalshiPaperSim/pull/17>
- The corrected entries (src/strategies.js, src/desk-strategies.js) and the record-derived buildUpcomingTrades (src/live-desk.js): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js>
- R16 / R17 re-labelled UNATTRIBUTED in src/research-sources.js: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/research-sources.js>

---

## #56 — The test suite was RED ON MAIN and had been for at least one merge: a syntax error stopped every test from running, and a second test asserted on a Promise

**Severity:** `HIGH`

| | |
| --- | --- |
| **We assumed** | That `npm test` passing 122/122 (as the previous session's ROADMAP claimed) still described main, and that a merged PR's new tests had been executed at least once before the merge. |
| **Verified truth** | At commit e86cb9b, `node --test test/simulation.test.js` failed at import time with "SyntaxError: Unexpected reserved word" at line 3672: test 100 ("settlement pays the exchange's own result…") awaited `runDeskSession(...)` inside a non-async `() => {}` callback. A syntax error kills the whole file, so the runner reported ONE failed test and executed NONE of the 134. Making the callback async exposed a second defect: test 118 called the async `buildDeskReport(...)` without `await`, so `assert.ok(report.ok)` tested a Promise (undefined) and failed with "desk report builds cleanly" — the same call awaited returns 84 records and passes. Both came in with PR #17 (irregularity #53 already covers its prose). No shipped number depended on either test — but a suite that cannot parse is a suite that verifies nothing, and every claim of "122/122 green" made after that merge was unverifiable. |
| **What the code does** | Test 100's callback is now `async () => {}`; test 118 awaits buildDeskReport() and carries a comment explaining that the un-awaited call asserted on a Promise. The suite ran 134/134 green after the two fixes, before this session's four Form 4 tests were added. |
| **What you should do** | Treat any claim of a green suite as unverified unless `npm test` was run in that session. If a future merge adds a test, the merge itself must show the runner output — a suite that cannot parse reports one failure and verifies nothing. |

**Evidence**

- The failing run at the branch point — `node --test test/simulation.test.js at e86cb9b → "SyntaxError: Unexpected reserved word" at test/simulation.test.js:3672; # tests 1, # fail 1, nothing executed`
- test/simulation.test.js (tests 100 and 118): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js>
- The awaited call, verified in isolation — `await buildDeskReport({data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null}) → ok, 84 records`

---

## #4 — Direct TLS connections to *.kalshi.com are dropped from this sandbox

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That curl/fetch from the build host would reach the API. |
| **Verified truth** | Handshakes to external-api.kalshi.com fail from this datacenter IP (edge security), so the server’s live path returns "fetch failed" here while the same code works from a normal network. All captures in this repo were obtained through the agent fetch path and are reproducible. |
| **What the code does** | Every endpoint degrades explicitly: it returns the real captured snapshot, labels it VERIFIED_SNAPSHOT, and includes the upstream error. Nothing silently pretends to be live. |
| **What you should do** | Run `npm start` on your own machine and open /api/transport — upstreamReachable should be true there. |

**Evidence**

- Live check endpoint — `GET /api/transport reports upstreamReachable, the exact error and the fallback used`

---

## #5 — The candlestick path was wrong

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | GET /markets/{ticker}/candlesticks. |
| **Verified truth** | The documented path is GET /series/{series_ticker}/markets/{ticker}/candlesticks — the series ticker is mandatory. |
| **What the code does** | Corrected in KALSHI_PATHS.candlesticks() and in every fetch the app makes. |
| **What you should do** | Compare the URL in /api/candlesticks responses with the reference page. |

**Evidence**

- Candlesticks reference: <https://docs.kalshi.com/api-reference/market/get-market-candlesticks>

---

## #6 — A single 0.01 tick size is wrong — the grid is per market

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | DEFAULT_TICK_SIZE = 0.01 everywhere. |
| **Verified truth** | Tick size comes from each market’s price_ranges. Captured markets use linear_cent (step 0.0100) while KXBTCY uses deci_cent (step 0.0010), so a hard-coded cent grid mis-prices BTC markets by 10x. |
| **What the code does** | resolvePriceGrid() reads price_ranges first and only falls back to price_level_structure; snapToGrid/nextTick/isOnGrid enforce it, and limit orders are validated against the grid. |
| **What you should do** | Open a KXBTCY market in the Markets tab — the ladder increments by 0.001, not 0.01. |

**Evidence**

- Fixed-point & price grid: <https://docs.kalshi.com/getting_started/fixed_point_migration>
- Captured structures — `src/kalshi-config.js → PRICE_LEVEL_STRUCTURES (11 structures)`

---

## #10 — Real books are sparse and fractional; a uniform 5-tier model was unrealistic

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | Five symmetric tiers per side with round sizes. |
| **Verified truth** | The captured book has 9 YES levels and 35 NO levels with sizes ranging from 3.43 to 4991.32 contracts, at irregular price points (0.01, 0.04, 0.06, 0.13, 0.17 …). |
| **What the code does** | OrderBook is built from the real levels and keeps reciprocity (YES bid X ≡ NO ask 1−X). Synthetic depth is only added BEHIND the captured touch, is labelled SIMULATED, and is scaled by topSize/depthScale. |
| **What you should do** | The Markets tab shows the real ladder; the badge states which part is captured and which is modelled. |

**Evidence**

- Captured order book: <https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook>

---

## #13 — The live candlestick window is only ~3 months, which caps how long a replay can be

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a full year of daily history was available from the standard endpoint. |
| **Verified truth** | GET /historical/cutoff returned 2026-07-19T00:00:00Z, and the longest contiguous daily series obtainable on the capture date is 61 bars (2026-07-19 → 2026-09-17). Older history requires the separate historical endpoints. |
| **What the code does** | The replay uses all 61 available bars and states the horizon in every result. The 52-week competition calendar is a memory/tracking structure, not a claim that 52 weeks of candlesticks were replayed. Historical-endpoint ingestion is listed as remaining work. |
| **What you should do** | The leaderboard header shows "61 real daily periods" — that number comes from the data, not from a config constant. |

**Evidence**

- Historical data guide: <https://docs.kalshi.com/getting_started/historical_data>
- Cutoff capture: <https://external-api.kalshi.com/trade-api/v2/historical/cutoff>

---

## #14 — None of the captured contracts had settled, so no real settlement outcome can be used

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That final positions could be resolved to $1.00 / $0.00 from observed results. |
| **Verified truth** | KXNASDAQ100Y-26DEC31H1600-T33000 closes 2026-12-31 and KXBTCY-27JAN0100-T149999.99 closes 2027-01-01 — both after the capture date, with result "" and status "active". |
| **What the code does** | By default the replay marks open positions at the last REAL captured quote and reports them as unrealized. Settlement is an explicit opt-in (settleAtEnd + finalResult) and the UI labels any settled run as a hypothetical scenario, never as an observed outcome. |
| **What you should do** | Tick "Settle at end" and choose an outcome — the banner states that the outcome is hypothetical. |

**Evidence**

- Market object: <https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000>

---

## #17 — Two depth values in the first order-book capture could not be re-confirmed

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That the first captured book was accurate as transcribed. |
| **Verified truth** | Capture 1 showed YES 0.1200 @ 100242.25 and NO 0.8300 @ 100076.49. A second capture of the same endpoint the same day showed no 0.1200 YES level at all and NO 0.8300 @ 81.49, while the market object reported yes_bid_size_fp "242.25" at 0.1200 — contradicting 100242.25 at the same price. |
| **What the code does** | Capture 1 is archived, marked usedBySimulator:false, and replaced by capture 2, which passes a reciprocal cross-check against the market object (best NO bid 0.8700 ⇒ implied YES ask 0.1300 = the market’s yes_ask_dollars). The discrepancy is recorded rather than silently resolved. |
| **What you should do** | Depth is time-varying: re-fetch the endpoint and compare with capture-2’s _capture metadata. |

**Evidence**

- Endpoint (re-fetch it yourself): <https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook>
- Both captures retained — `src/verified-snapshot.js → ORDERBOOKS (capture-2 primary, capture-1 archived as evidence)`

---

## #22 — Average cost rounded to 6 decimals broke the accounting identity on 900k-contract positions

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That round6 (1e-6) precision on a position's average cost is far below any material amount. |
| **Verified truth** | avgCost is re-rounded on every fill and then multiplied by the contract count. On a 873,542.98-contract position, 0.5e-6 of rounding is up to $0.44 of phantom cost basis, and it compounds across fills: the identity equityChange = realizedPnl + unrealizedPnl − feesPaid was off by $2.16 on ContrarianKing_100x once the market universe was broadened. |
| **What the code does** | avgCost now uses 10 decimals while all money stays rounded to cents. The identity gap fell to ≤ $0.05 across every strategy, and the settlement/payout code reuses the same helper. |
| **What you should do** | Run test 25; the worst identity gap across the roster is now under five cents. |

**Evidence**

- Measured before the fix — `identityGap = $2.16 vs a $1.04 tolerance (test 25)`
- Fix in src/simulation-engine.js — `round10() applied to avgCost only; money values stay at cents for display`

---

## #23 — The equity curve could end somewhere other than finalEquity once more than one market shared the last timestamp

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That the last equity-curve point always equals the reported final equity. |
| **Verified truth** | The replay timeline is ordered by (timestamp, ticker) and a curve point is written only when the timestamp changes. With the broadened universe the final timestamp spans two markets, so the curve was written before the second market was marked: the curve ended at $27,702.70 while finalEquity was $36,789.43. |
| **What the code does** | The curve is now reconciled to the final equity before settlement, so the chart and the headline number can never disagree. |
| **What you should do** | Compare the last sparkline point with the "Final equity" stat for any strategy — they match. |

**Evidence**

- Detected by test 24 — `assert.equal(r.finalEquity, last curve point) — expected 27702.7, actual 36789.43`
- Fix in src/backtest-replay.js — `the curve always terminates on the final equity (update-in-place when the last point shares the final timestamp)`

---

## #24 — The daily-history ingest job cannot run from this sandbox

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a scheduled job could append each day's candles from the build environment. |
| **Verified truth** | Direct TLS to *.kalshi.com is dropped from this datacenter IP (irregularity #4). The script works from any normal network and is shipped with a GitHub Actions workflow, which has unrestricted egress, but it has never completed a live run here — so data/history/ is empty and every result still comes from the 2026-09-17 captures. |
| **What the code does** | The script refuses to fabricate: on total failure it records the error per market in data/history/_manifest.json and exits non-zero. A --verify mode audits an existing store with no network at all, and --dry-run prints the exact URLs it would call for manual review. |
| **What you should do** | Run `node scripts/ingest-history.mjs --dry-run` to see the URLs, then run it (or let the workflow run it) from a network that can reach external-api.kalshi.com. |

**Evidence**

- Live failure — `node scripts/ingest-history.mjs → "fetch failed" for all 3 markets; the script exits 1 with the sandbox explanation`
- Workflow — `.github/workflows/daily-history.yml runs it daily at 06:15 UTC and commits data/history/`

---

## #27 — Two of our own failures hid behind a green CI step

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a successful GitHub Actions step means the ingest actually ran. |
| **Verified truth** | (a) scripts/ingest-history.mjs threw ReferenceError: url is not defined after the windowed-backfill refactor, so it aborted before writing its manifest; (b) the workflow ran `node ... | tee log` without `set -o pipefail`, so the non-zero exit still reported success. One run therefore ingested nothing and looked fine. |
| **What the code does** | Fixed the stale variable, added `set -o pipefail` to the workflow step, and the job now commits its log to data/history/_last-run.log so every run is auditable after the fact. |
| **What you should do** | After any scheduled run, read data/history/_last-run.log — a run that added no bars says so explicitly. |

**Evidence**

- The run that ingested nothing — `commit 9ceb180 changed only data/settlements.json and src/accumulated-history.js — no bars`
- The crash — `ingest-history failed: ReferenceError: url is not defined at ingestMarket (scripts/ingest-history.mjs)`

---

## #30 — A market-making quote still pays no attention to whether the market is open or how wide the spread is

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a two-sided quote placed on every period is a fair test of a market-making strategy. |
| **Verified truth** | VolatilityArb_MM places 4,358 trades across 268 periods and 30 markets, including 352 no-trade bars where no price was printed at all. On those bars the book is anchored on the last real quote, so a "fill" can occur against a stale touch. The strategy still finishes first (+9.25%), which is plausible for a spread harvester, but its trade count is inflated by quotes that no one could have hit. |
| **What the code does** | No-trade bars are counted and displayed per market, and resting orders still fill only within the period’s real traded range (which is empty on those bars, so the volume bound now blocks the fill). The remaining exposure is that the touch itself is carried forward from the last real quote. |
| **What you should do** | When reading a market-maker’s trade count, compare it with the no-trade bars of the markets it quoted. |

**Evidence**

- No-trade bar shape: <https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440> — `price.previous_dollars only — no OHLC`
- Counts — `GET /api/history → markets[].noTradeBars; 352 of 7,189 stored bars (4.9%)`

---

## #31 — A published claim about the traded price range was wrong ("no contract above 28c")

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That no contract in the captured universe trades above 28 cents, so the favourite leg of the longshot-bias rule and the near-certainty entries provably cannot fire. |
| **Verified truth** | The stored window contains 47 closes above 28c, all of them in two Nasdaq-100 strikes (KXNASDAQ100Y-26DEC31H1600-T33000: 45 bars, max close $0.45; T19000: 2 bars, max $0.40). The published sentence was false. The CONCLUSION it supported survives a stronger test: across all 30 markets and 5,762 numeric closes the maximum close is $0.45, so no close reaches the 0.85+ band the favourite leg needs and none reaches the 0.92-0.99 band a near-certainty entry needs. |
| **What the code does** | The sentence and two related captions were rewritten to state the measured range, and to say in place that the earlier number was wrong (src/strategies.js). Test 77 recomputes the range from the store on every run so the claim cannot drift again, and the range is now a published fact (V81). |
| **What you should do** | When a caption quotes a range, re-run the count before relying on it — and read the retraction next to the corrected sentence, not only the headline number. |

**Evidence**

- Counted from the store, not from an opinion — `node -e over src/accumulated-history.js: 5,762 closes, min $0.01, max $0.45, 47 above $0.28, 0 above $0.50`
- The bars are real API responses — `data/history/KXNASDAQ100Y-26DEC31H1600-T33000.json (263 bars) + data/reports/store-verification.json (re-fetched from the official endpoint, compared field-for-field)`
- Official endpoint the closes come from: <https://docs.kalshi.com/api-reference/market/get-market-candlesticks>

---

## #32 — The requested "CEO" project does not exist in the verified directory

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a project named "CEO" exists among the owner’s GitHub Pages sites and could supply a trading signal. |
| **Verified truth** | The official GitHub API lists 39 public repositories for buffedlizard55-lab on 2026-09-18; none is named CEO or close to it. The MasterSite directory publishes 38 of the 39 and states that one repository is "permanently excluded by owner request" without naming it. The requested project is therefore either renamed, the excluded repository, or a misremembered name. |
| **What the code does** | The review records S00 with status NOT_FOUND and a flag instead of silently skipping the request. No strategy was invented from a project that could not be examined. Independent of that missing project, Kalshi lists CEO-change series which this repo already trades (CEOExit_Drift on daily bars; LiveCEO_ChangeFav on the Live Desk) — those entries cite the exchange, not a MasterSite CEO repo. |
| **What you should do** | Owner review needed: rename the repo, confirm the excluded repository is the one meant, or correct the name. |

**Evidence**

- Official repository list (39, no CEO): <https://api.github.com/users/buffedlizard55-lab/repos?per_page=100>
- MasterSite directory (38 published, 1 excluded by owner request): <https://buffedlizard55-lab.github.io/MasterSite/>
- Recorded in the ledger — `src/signal-sources.js → S00 (status NOT_FOUND, flagged); test 76 asserts the missing project is named and flagged`

---

## #34 — Weather basis mismatch: the archived signal is NWS, the settlement is The Weather Company

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a forecast from the National Weather Service and the market’s settlement source measure the same number. |
| **Verified truth** | KXHIGHNY rules name "The Weather Company" data for New York City (CLINYC) as the settlement source (V84). The point-in-time archive holds the NWS gridded forecast for Central Park (V87/V88) — a different provider. On most days the two agree closely, but they are not the same measurement, and on disagreement days a forecast-confirming strategy loses even when its forecast was "right". |
| **What the code does** | The mismatch is published on the strategy, in the forecast-status panel and here. It is a real source of noise the forward test will measure, not something to hide. If The Weather Company ever exposes a free point-in-time API, the archive can add it as a second provider. |
| **What you should do** | When reading ForecastEdge_Weather results, remember the signal and the settlement come from different providers. |

**Evidence**

- Settlement source (captured rules): <https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP07-B77.5>
- Signal source (NWS point forecast): <https://api.weather.gov/gridpoints/OKX/34,45/forecast>
- Stated on the strategy — `src/strategies.js → ForecastEdge_Weather thesis (BASIS MISMATCH paragraph); the UI Research tab repeats it`

---

## #39 — The weather archive was pointed at the wrong airport for Chicago, and Austin has two plausible stations

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That "the city temperature" is the temperature at the city's main airport, so the archive was first configured with O'Hare (41.9786,-87.9048) for KXHIGHCHI. |
| **Verified truth** | Kalshi names the settlement station in the market rules, and for Chicago it is CLIMDW - Midway - about 30 km south of O'Hare with a different NWS grid (LOT 72,69 vs LOT 66,77). Reading the captured rules text caught the error before any market was traded on it. Austin has no unique answer: the rules say only "Austin (CLIAUS)", which can be Camp Mabry (30.3167,-97.7667) or Austin-Bergstrom (30.1975,-97.6664); the archive uses Camp Mabry and records the alternative so the choice is auditable rather than invisible. Separately, every one of these markets settles on The Weather Company observations while the archive stores National Weather Service forecasts - the genuine basis mismatch recorded as #34. |
| **What the code does** | The archive point for every city is now the point named by that market's own settlement rules. Chicago moved to Midway, Austin is recorded as an explicit, documented choice, and test 90 requires each entry to carry the NWS point response it was verified against - a note that cites no observation fails the build. |
| **What you should do** | Open the two Chicago links and compare their relativeLocation fields: 41.7868,-87.7522 answers "Chicago, IL" on grid LOT 72,69 because Midway is the station Kalshi settles on. |

**Evidence**

- KXHIGHCHI point (Midway) - resolved: <https://api.weather.gov/points/41.7868,-87.7522>
- O'Hare, the wrong point the first draft used: <https://api.weather.gov/points/41.9786,-87.9048>
- Austin alternative (Bergstrom): <https://api.weather.gov/points/30.1975,-97.6664>
- Station list in the captured rules — `data/history/.../rules_primary: KXHIGH* markets name CLINYC/CLILAX/CLIMDW/CLIMIA/CLIAUS/CLIDEN/CLIPHL/CLIPHX/CLISEA`

---

## #40 — The first nine-city capture stored a full set of nulls under the name "resolved identity"

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That reading gridId/gridX/gridY/forecastZone/timeZone off the response used to build a snapshot was enough to record what api.weather.gov said the point is. |
| **Verified truth** | The capture fetched two different documents: GET /points/{lat},{lon} (which carries the identity) and GET {properties.forecast} (which carries only the forecast). captureLocation() returned the FORECAST document under the name properties, and the resolved block read identity fields out of it - so every store written by commit ae16030 recorded gridId/gridX/gridY/forecastZone/county/relativeLocation/timeZone as null while still stamping resolvedAt: it claimed a resolution it had not stored. The forecast rows themselves were correct; the identity metadata was not. |
| **What the code does** | captureLocation() now returns the two documents separately (pointProperties vs forecastProperties) and identity is read from the point document only. Three guards make the failure mode impossible to repeat silently: the capture compares the live identity against the nwsGrid written in the configuration and refuses to write on a mismatch; the offline audit (--verify) fails on an incomplete or mismatched resolution and on a forecast URL that encodes a different grid; and test 90 asserts the shipped module agrees with the configuration field for field. The workflow now runs the audit under set -o pipefail and fails the run when any location did not capture. |
| **What you should do** | Compare data/forecasts/miami-mia.json with the two links: the forecast URL always said MFL/106,51, which is exactly what the point response says and what the store now records instead of nulls. |

**Evidence**

- The capture that wrote the nulls: <https://github.com/buffedlizard55-lab/KalshiPaperSim/commit/ae16030>
- Point response that carries the identity (Miami): <https://api.weather.gov/points/25.7959,-80.287>
- Forecast response the code was reading instead: <https://api.weather.gov/gridpoints/MFL/106,51/forecast>
- What the store showed — `data/forecasts/miami-mia.json (ae16030): location.resolved = { gridId: null, gridX: null, gridY: null, forecastZone: null, county: null, relativeLocation: null, timeZone: null, resolvedAt: "2026-09-18T13:24:29.350Z" } while snapshots[0].forecast_url = ".../gridpoints/MFL/106,51/forecast"`

---

## #43 — The exchange lists TWO Tesla-CEO series with the same question — one has traded, one never has

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a series ticker uniquely identifies a question, so ingesting the KXTESLACEOCHANGE series the discovery run returned would capture the Tesla CEO-exit market. |
| **Verified truth** | Two distinct series exist for the SAME question "Musk out as Tesla CEO before 2026?": TESLACEOCHANGE-26 (series TESLACEOCHANGE) — active, 88,884.37 contracts of lifetime volume, 399 stored daily bars from a 2024-05-15 open; and KXTESLACEOCHANGE-26 (series KXTESLACEOCHANGE) — inactive, volume_fp 0.00, and an EMPTY candlestick response for its whole life window. Both were captured from the official API on 2026-09-18 (data/history/TESLACEOCHANGE-26.json, data/history/KXTESLACEOCHANGE-26.json). The KX-prefixed twin looks like a re-listed or re-namespaced copy that never attracted flow. |
| **What the code does** | The CEO strategy (CEOExit_Drift) trades TESLACEOCHANGE — the series with real bars — and its universe names that ticker explicitly. The empty twin is kept in the store as captured (deleting it would hide the fact) and the calendar audit now REPORTS zero-bar stores instead of crashing on them (`emptyStores` in data/reports/calendar-audit.json; the crash was found when the request-9 ingest introduced the empty market). |
| **What you should do** | Open both market links and compare volume_fp; a strategy that discovered "the Tesla CEO market" by keyword alone could easily trade the dead twin, so universe choices cite their bars. |

**Evidence**

- The market that trades (88,884 contracts, 399 bars): <https://external-api.kalshi.com/trade-api/v2/markets/TESLACEOCHANGE-26>
- The market that never traded (volume 0, no bars): <https://external-api.kalshi.com/trade-api/v2/markets/KXTESLACEOCHANGE-26>
- Its empty candlestick response: <https://external-api.kalshi.com/trade-api/v2/series/KXTESLACEOCHANGE/markets/KXTESLACEOCHANGE-26/candlesticks?period_interval=1440>

---

## #44 — The MasterSite directory card for THIS repository (KalshiPaperSim) is stale

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That the MasterSite directory would stay current with this repository as the project grew, so a reader of the owner's directory would see the same counts the repo publishes. |
| **Verified truth** | Fetched 2026-09-18, the MasterSite card listed KalshiPaperSim as 53 facts / 19 irregularities / 10 strategies / 9 markets / 61 candles / 50 tests. The in-repo AUTO block at the same date is 97 facts / 43 irregularities / 41 strategies / 9 markets / 10,905 candles / 111 tests (plus the Live Desk). Same class of directory drift as StockPaperSim (#42), but for this project. |
| **What the code does** | Flagged as V105. The directory is a sibling project this repo does not write to; the honest action is to name the drift so a reader is not shown the 10-strategy card as current. Updating MasterSite is the owner's directory pipeline, not a KalshiPaperSim code change. |
| **What you should do** | Open the MasterSite directory and this repository's README AUTO:COUNTS block and compare the published numbers. |

**Evidence**

- MasterSite sites.js (the directory export): <https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js>
- This repository AUTO:COUNTS (regenerated, never typed): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/README.md>

---

## #45 — Desk usernames were not reserved, so a human could impersonate a Live Desk entry

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That validateUsername() reserved every algorithmic handle because it walked the stored year's strategies array. |
| **Verified truth** | Desk entrants live in DESK_STRATEGIES, not STRATEGIES. A stored year that predated the desk had no Live* rows, so a human could register LiveFavourite_Settle. The Live Desk also did not attach its session to the one-year memory, so desk fills were not in the exportable year. |
| **What the code does** | validateUsername() now always unions STRATEGIES + DESK_RESERVED_USERNAMES (kept set-equal to DESK_STRATEGIES by test 104) plus any stored deskMemory.results. attachDeskSession() copies compact results and FILL/SETTLE rows into the year with kind desk. Positions are still not carried across cut-offs — that remaining gap is stated on the README. |
| **What you should do** | Try registering LiveFavourite_Settle as a human participant; the platform must refuse it as reserved. |

**Evidence**

- validateUsername + DESK_RESERVED_USERNAMES (reviewable in this repo): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/competition-memory.js>
- Desk roster (13 Live* usernames): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-strategies.js>

---

## #47 — A reserved season username was longer than the platform limit, so the reservation never applied to it

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That adding a handle to DESK_RESERVED_USERNAMES was enough to stop a human claiming it. |
| **Verified truth** | validateUsername() checks username_length_3_to_24 BEFORE the reserved set, and the season handle `SeasonWeather_SettleCarry` is 25 characters. For that exact name the reserved-name branch was unreachable: the validator returned username_length_3_to_24. Test 112 — written with the season — asserts every roster username satisfies the same 3–24 and allowed-character rules the platform enforces, and it failed on its first run. A user could not have impersonated the entrant (the name was rejected), but the reservation the roster claimed to hold did not exist. |
| **What the code does** | Renamed to SeasonWeather_Carry (20 characters) in src/desk-season-strategies.js and src/competition-memory.js. Test 112 now asserts the length + character rules over every season entrant, and test 104 asserts DESK_RESERVED_USERNAMES is exactly the union of the desk AND season rosters, with no duplicate handle between them. |
| **What you should do** | Try to register SeasonWeather_SettleCarry: the platform refuses it for LENGTH, not because it is reserved — that was the hole the rename closed. |

**Evidence**

- validateUsername() — length check precedes the reserved set: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/competition-memory.js>
- Season roster — now SeasonWeather_Carry (20 chars): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season-strategies.js>
- Test 112 — enforces the platform rules over the season roster: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js>

---

## #48 — A superseded ingest request could not be cancelled, so two ingests ran against the same branch

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That an automation which can START a workflow run (by committing .github/triggers/ingest.json) can also stop one. |
| **Verified truth** | gh run cancel 35421506770 → HTTP 403 "Resource not accessible by integration": the GitHub App token this repository is automated with has no actions:write. A second trigger commit therefore started a second run while the first was still fetching, and nothing the automation holds can stop either. Run 35420823590 (188 tickers) and the duplicate 35421506770 (181 tickers, a strict subset) then raced to commit to the same branch. |
| **What the code does** | Both runs were allowed to finish: the ingest is additive and scripts/push-with-race-guard.sh is the tested rebase-and-retry path for exactly this race (the duplicate cost only exchange API budget and runner minutes). ingest-now.yml now declares a per-ref concurrency group with cancel-in-progress: false, so a later request QUEUES behind the run in flight instead of racing it — the only brake available when cancelling is not permitted. |
| **What you should do** | Push two ingest requests back to back and watch the Actions tab: the second run must show as queued, not running in parallel. |

**Evidence**

- ingest-now.yml — the trigger mechanism and its push-race guard step: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.github/workflows/ingest-now.yml>
- IRR #41 — the same race, previously lost by an inline git add: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/IRREGULARITIES.md>

---

## #50 — The FDA archive was deployed against an API hostname that does not exist, with an over-limit page size

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That the openFDA Drugs@FDA endpoint lived at api.open.fda.gov (conflating the open.fda.gov website with the API host) and that limit=1000 was inside the published cap. |
| **Verified truth** | The official how-to page states the base endpoint is https://api.fda.gov/drug/drugsfda.json and that "the maximum limit allowed is 99". The first two scheduled runs therefore could never have fetched anything: GitHub-hosted runners resolved api.open.fda.gov with ENOTFOUND (recorded per-subject in data/fda-signals/_fda-last-run.json, whose probe table showed api.weather.gov reachable and download.open.fda.gov returning HTTP 200 from the same runner). No snapshot was fabricated and no false data was committed — the store was simply dark, which is the honest failure mode the point-in-time design requires. |
| **What the code does** | ENDPOINT corrected to https://api.fda.gov/drug/drugsfda.json, the page size corrected to the documented maximum of 99 (with truncation made visible: the snapshot stores both the full `total` and the archived `applications` count), the reachability probe kept in every run report, and the host history recorded in the script header. This register entry exists so the wrong-host period is part of the audit trail, not silently rewritten. |
| **What you should do** | Compare any committed _fda-last-run.json probe table against the snapshots that follow it: every capture after the correction must carry http_status 200 against https://api.fda.gov URLs. |

**Evidence**

- The endpoint's official how-to page (base URL and the limit<=99 cap): <https://open.fda.gov/apis/drug/drugsfda/how-to-use-the-endpoint/>
- The corrected ENDPOINT, probe table and host history in scripts/archive-fda-signals.mjs: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-fda-signals.mjs>

---

## #52 — The site's "what this project cannot test yet" cards and three MasterSite ledger entries kept saying no sports series / no 1-minute bars / no settlements existed — two days after the store had all three

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That the research-gap cards (src/research-sources.js RESEARCH_GAPS) and the S09 / S10 / S17 ledger texts were still true, because nobody re-read them after the store grew. |
| **Verified truth** | Written on 2026-09-17 against a store of three daily index/BTC series, four of the five gap cards had become false by 2026-09-18 and were still published on 2026-09-20: "no weather series is ingested" (nine KXHIGH* series plus the NWS archive shipped 09-18), "no sports series is ingested" (seven hourly game-line series shipped 09-18), "the intraday store is configured for period 60" (1-minute blocks shipped 09-18), "nothing in the tracked universe has finalised yet" (status=all blocks store exchange results and the replay books them). S09 said "No MLB series in the universe" while nine finalized KXMLBGAME contracts sat in data/history/intraday/60m/. None of these sentences affected a number — they were prose about the store — but a "cannot test" card that is false hides a test that is possible, which is the opposite of the honesty contract. |
| **What the code does** | RESEARCH_GAPS entries now carry status (open / partially closed / closed) and closedBy with the date and the artefacts that closed them; closed gaps stay on the list so the history is visible, and the Research tab shows the status badge. S09, S10, S14, S15 and S17 were re-worded to the store as it is on 2026-09-20 (S09 is now a live signal via the official MLB Stats API archive). The general rule is the same one the store-facts captions follow: a sentence about the store must either be computed from the store or carry the date it was true. |
| **What you should do** | Open the Research tab: every gap card shows a status badge, and a closed card names what closed it. Grep the repository for "No sports series" — it must appear only inside the WAS: history of a closed gap or in this register. |

**Evidence**

- RESEARCH_GAPS with status/closedBy fields (each closed gap keeps its original wording as WAS:): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/research-sources.js>
- The store that contradicted the cards: data/history/intraday/60m/ (sports, weather, settled results) and intraday/1m/: <https://github.com/buffedlizard55-lab/KalshiPaperSim/tree/main/data/history/intraday>

---

## #54 — The desk-season schedule only counted a capture batch as a round if some contract got its FIRST-EVER ladder in it — so re-capturing an unchanged universe (ingest request 14) added no round at all

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That every new ingest pass adds a season round ("a new scheduled ingest adds a round", the schedule's own comment), and that ingest request 14 — requested on 2026-09-19 precisely to add one — had done so. |
| **Verified truth** | seasonSchedule() defaulted minNewLadders to 1: a batch qualified only when a market's first-ever ladder fell inside it. Request 14 re-queried exactly the request-13 universe at 2026-09-20T00:40Z (732 captures across 80 open contracts) and produced zero rounds; the 2026-09-19T21:57Z re-capture was dropped for the same reason. The season therefore stopped at R03 (2026-09-19T15:34Z) while the store held two later full boards. A second, smaller flaw: the 5-minute batch window split one ingest pass into two rounds (2026-09-19T11:02Z with 12 ladders and 11:08Z with 3), because a pass pauses for more than five minutes between blocks. |
| **What the code does** | A round is now any capture batch in which at least one tracked contract's ladder was (re)captured (minFreshLadders = 1); first-ever novelty is no longer required (minNewLadders = 0); the batch window is 20 minutes. On the pre-merge store rounds went from 3 to 6 (2026-09-18T00:03Z → 2026-09-20T00:40Z); on the merged 2026-09-20 store (both branches' captures) the old rule gives 4 and the corrected rule 5 (2026-09-18T02:46Z → 2026-09-20T03:53Z, the 21:53Z re-capture being the round the old rule dropped). The 27 season checks still pass, and each round row now publishes freshLadderCaptures next to newLadderCaptures so the difference is visible in the schedule file and on the Desk Season tab. |
| **What you should do** | In data/reports/desk-season-schedule.json, R04 (2026-09-19T21:53Z) has newLadderCaptures 0 and freshLadderCaptures 76: a full re-capture of the open board that the old rule would have skipped. |

**Evidence**

- seasonSchedule() — minNewLadders / minFreshLadders / batchMinutes and the HISTORY note: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season.js>
- The regenerated schedule (data/reports/desk-season-schedule.json): six rounds, R05 21:57Z and R06 00:40Z now present: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/desk-season-schedule.json>

---

## #58 — Two source behaviours could not be verified from this sandbox: EDGAR's Atom filters are unreliable, and the ESPN scoreboard shape was never retrieved

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a documented query parameter does what it says (EDGAR's `type=4`, `count=5`), and that every endpoint named in the ROADMAP could be fetched and read from the working environment. |
| **Verified truth** | (1) EDGAR: the same browse-edgar Atom query returned form 4 rows for CIK 0001318605 but 424B2 rows for CIK 0000019617, and returned 10 entries for both despite count=5 — so the feed's filters cannot be trusted. The archive parses every entry's form type, keeps only form 4, and publishes `formsSeen` per issuer in the run report so an ignored filter is visible. (2) ESPN: the injuries endpoint WAS verified live (GET https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries → {timestamp, status, season, injuries:[{id, displayName, injuries:[{id, longComment, shortComment, status, date, athlete:{firstName, lastName, displayName, shortName, position:{abbreviation}, team:{id, uid, slug, name, abbreviation, displayName}}}]}]}), and the scoreboard envelope was verified for NCAA men's basketball ({leagues[], groups, events[], provider, eventsDate{date, seasonType}}), but the per-EVENT scoreboard structure (competitions[].competitors[].score, status.type.state/clock) could not be retrieved — the fetch tool repeatedly rewrote that request to an unreachable proxy URL. No scoreboard parser was written from memory: shipping one would have been exactly the guess the honesty contract forbids. |
| **What the code does** | The Form 4 archive parses every feed entry's form type, keeps only form 4, and publishes formsSeen per issuer in data/form4-signals/_form4-last-run.json; a form the archive did not expect is visible, never silently dropped. NO ESPN scoreboard parser was written: the injuries half (verified) and the scoreboard half (not verified) are recorded in ROADMAP "Next #1" with the exact verified JSON paths, so the next session builds on evidence instead of re-deriving the shape from memory. |
| **What you should do** | Before shipping an ESPN archive, capture one real scoreboard response from a runner with egress and keep it as a labelled fixture the parser is tested against — the same discipline that produced data/form4-signals/fixtures/ and data/mlb-signals. Do not write the parser first. |

**Evidence**

- EDGAR Atom feed, Tesla (type=4 → 10 form-4 rows): <https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom>
- The SAME query for JPMorgan (type=4 → 10 rows of form 424B2): <https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=00019617&type=4&dateb=&owner=include&count=5&output=atom> — `the filter is ignored; count=5 returned 10 entries in both cases`
- ESPN public injuries JSON, verified live 2026-09-21: <https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries>
- ESPN scoreboard envelope, verified live 2026-09-21 (NCAA men's basketball, empty events[]): <https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=20260920>

---

## #59 — The first live Form 4 capture was refused by EDGAR with HTTP 403 — the same failure class as #50

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a declared User-Agent with contact information was enough for EDGAR to answer an automated client, because the same browse-edgar Atom page had been retrieved successfully from the build sandbox earlier the same day. |
| **Verified truth** | The workflow's first run (2026-09-21T04:52:48Z) was answered **HTTP 403** for all three issuers, with an XHTML error page in the body. The request that was refused carried User-Agent "KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim; research contact: …)" — a URL in parentheses, whereas EDGAR's own guidance states the format "Sample Company Name AdminContact@<sample company domain>". The root cause is NOT yet proven: 403 from EDGAR can also mean rate limiting or an IP-range block on the runner, and the run report at the time kept only 160 characters of the body and no headers, so the reason could not be told from the repository. This is the exact pattern of irregularity #50, where an archive was designed and shipped against a source that had never been reached. **RESOLVED DIAGNOSIS (the 2026-09-21T07:49Z run on main, with the new diagnostics):** still `HTTP 403 Forbidden` with the corrected agent string, but now carrying `server: AkamaiGHost`, `content-type: text/html` and NO `retry-after` or rate-limit header. An XHTML page from SEC's CDN edge means the request is refused before EDGAR's application sees it — so the User-Agent is NOT the cause, and the likeliest one is the runner's IP range being blocked at the edge (the same URL answered a different client on 2026-09-21, fact V114). **PROBE ANSWERED IT (run 2026-09-21T07:58:11Z):** both SEC hosts refused the same documented path — www.sec.gov 403 Forbidden (AkamaiGHost, 1925 bytes) and data.sec.gov 403 Forbidden (AkamaiGHost, 4815 bytes). The whole of sec.gov is unreachable from a GitHub-hosted runner, so the documented submissions API would be refused too: no code change can fix this, only a different network. |
| **What the code does** | Nothing was invented: the run failed loudly, `failures: 3` is committed, no companies/*.json was written, and both strategies abstained everywhere with the reason published — the archive's honest-failure mode worked exactly as designed. Three changes: (1) the default User-Agent now follows EDGAR's stated shape exactly ("KalshiPaperSim research buffedlizard55-lab@users.noreply.github.com") and can be overridden with EDGAR_USER_AGENT; (2) a refused request now records its status, statusText and any retry-after / rate-limit headers, and the run report records the agent actually sent, so the NEXT failure is diagnosable from the repository; (3) the trigger file requests another run immediately after merge. The parser and the point-in-time store are unaffected — they are tested against a real archived filing (tests 127–129). A follow-up commit adds an **edge probe** (`probeEdge`, recorded as `edgeProbe` in the run report) that records only the HTTP status and `server` header of one documented request per SEC host — `www.sec.gov` and `data.sec.gov`, same path — and parses nothing: it distinguishes "all of sec.gov is blocked for this runner" from "only browse-edgar is", which is the question the fallback choice depends on. |
| **What you should do** | **The probe has answered: both hosts report 403/AkamaiGHost, so the archive needs a network other than a GitHub-hosted runner — a self-hosted runner or the owner's own machine. No code change will fix it, and the documented submissions API would be refused for the same reason.** If `data.sec.gov` answers 200 while `www.sec.gov` does not, switch the archive to the documented submissions endpoint https://data.sec.gov/submissions/CIK##########.json with the ticker→CIK map from https://data.sec.gov/files/company_tickers.json; its JSON shape was NOT verified in this session, so capture one real response and archive it as a fixture first, the way data/form4-signals/fixtures/ fixed the XML. Until either is true, both insider entries abstain and say so — no result in this repository depends on a filing that was never read. |

**Evidence**

- The first live capture, committed by the workflow itself: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/form4-signals/_form4-last-run.json> — `"errors": ["EDGAR atom feed for TSLA: HTTP 403 — body head: <!DOCTYPE html …"] — filingsSeen 0, formsSeen {}, failures 3`
- EDGAR's own fair-access guidance (the User-Agent format it states): <https://www.sec.gov/os/accessing-edgar-data> — `"Sample Company Name AdminContact@<sample company domain>"; no more than 10 requests per second`
- The same endpoint, retrieved successfully from a different client 2026-09-21 (fact V114): <https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom>

---

## #60 — Every game-series order book captured before 2026-09-21 is empty - the crons captured AFTER settlement

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | That a with_books ingest run at 06:15 or 16:40 UTC stores a usable ladder for game series whenever it runs. |
| **Verified truth** | MLB/NBA/NFL game contracts have no book after they settle. The 28 KXMLBGAME history files from 2026-09-19/20 all hold 0-level orderbooks, generate-desk-module.mjs drops empty ladders, and the Live Desk therefore kept 0 tradeable game-series slots (its series reserves read 0). The capture CODE is fine - the capture TIMING was post-settlement. |
| **What the code does** | Fixed 2026-09-21: daily-history.yml adds 00:30 + 02:30 UTC with_books crons INSIDE live game windows (the WITH_BOOKS cron case list covers all three), and data/history/_ingest-request.json adds minute-nfl-game-lines beside minute-mlb-game-lines so 1-minute game bars start accumulating (fact V120). |
| **What you should do** | After the 2026-09-22 00:30 UTC run, check data/history/KXMLBGAME-* / KXNFLGAME-* for a NON-empty orderbook before trusting any game-series desk slot; the first honest in-game ladder is the milestone. |

**Evidence**

- data/history/KXMLBGAME-*.json — 28 files, every book with 0 levels: <https://github.com/buffedlizard55-lab/KalshiPaperSim/tree/main/data/history>
- .github/workflows/daily-history.yml — the pre-fix crons 06:15/16:40 UTC + the 2026-09-21 game-window fix: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.github/workflows/daily-history.yml>
- src/desk-data.js — game-series reserves at 0 on the 2026-09-21 build

---

## #62 — kalshi.com own board (2026-09-21) reports a Fed RATE HIKE to 3.75-4.00% under Chair Warsh - macro series this repo trades will move on it

**Severity:** `MED`

| | |
| --- | --- |
| **We assumed** | Nothing in this repository reads news; but a reader comparing our macro-flight marks to the market may not know a same-day macro shock is on the wire. |
| **Verified truth** | The homepage news block states: "The Federal Reserve raised its benchmark interest rate by a quarter point to a range of 3.75% to 4.00%, its first increase since 2023, according to CNBC ... under Chair Kevin Warsh." KXRATEHIKE 2026 "Exactly 2" traded 1.62x/58% on the same board. This repo trades only from captured Kalshi API prices (never from this headline), but KXINXY/KXNASDAQ100Y/KXRATEHIKE-class series are in the macro flight and the daily bars will show the move. |
| **What the code does** | Recorded in R24 (claim verbatim, marked CONTEXT ONLY) and here so macro-flight readers can reconcile bars from 2026-09-21 onward. |
| **What you should do** | When reviewing macro-flight PnL around 2026-09-21, read it against this dated observation; the news blurb is third-hand (CNBC via kalshi.com) and is not a price input. |

**Evidence**

- research-sources R24 — the kalshi.com board fetched 2026-09-21, news block quoted verbatim (CONTEXT ONLY): <https://kalshi.com/>

---

## #9 — Two different status vocabularies for the same concept

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That a market’s status value could be used as a query filter. |
| **Verified truth** | Responses use initialized/inactive/active/closed/determined/disputed/amended/finalized, while the GET /markets filter accepts unopened/open/paused/closed/settled. Passing "active" as a filter is invalid. |
| **What the code does** | mapStatusToFilter() translates between the two, and both enums are exported from src/kalshi-config.js. |
| **What you should do** | Filter the Markets tab — the UI only ever sends valid filter values. |

**Evidence**

- get-markets reference: <https://docs.kalshi.com/api-reference/market/get-markets>

---

## #15 — liquidity_dollars reads "0.0000" on markets that clearly have liquidity

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That liquidity_dollars could be used to rank markets by depth. |
| **Verified truth** | Captured active markets return liquidity_dollars "0.0000" while reporting volume_fp of 395,554.67 and open_interest_fp of 162,977.28. No document explains this field’s semantics. |
| **What the code does** | The field is displayed raw with a "not used in calculations" note. Liquidity in this app is measured from the captured order book and from volume/open interest only. |
| **What you should do** | Ask Kalshi support what liquidity_dollars measures; until then treat it as unexplained. |

**Evidence**

- Market list capture: <https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12>

---

## #16 — 429 responses carry no Retry-After header

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That a throttled response would tell the client when to retry. |
| **Verified truth** | The rate-limit documentation describes a token bucket (10 tokens per request, 200 reads/s and 100 writes/s on the basic tier, 2 s burst) and a 429 body of {"error":"too many requests"} with no Retry-After. |
| **What the code does** | The client applies its own exponential backoff on 429 and records every transport attempt in an audit log surfaced by /api/transport. |
| **What you should do** | None required; just do not expect a server-provided retry hint. |

**Evidence**

- Rate limits: <https://docs.kalshi.com/getting_started/rate_limits>

---

## #19 — Kalshi’s own fee table does not match Kalshi’s own fee formula

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That the "General Trading Fees Table" in the fee schedule PDF is the literal amount charged. |
| **Verified truth** | The table is the formula rounded UP to whole cents. The formula rounds "such that the fee + positionCost is rounded to a centicent" ($0.0001). For 100 contracts at $0.01 the formula gives $0.0693 while the table prints $0.07; at $0.25 it gives $1.3125 vs $1.32. All 21 published rows follow the cent-rounding rule exactly. |
| **What the code does** | The engine charges the FORMULA value (centicent rounding), because that is the rule stated for the calculation itself, and asserts the cent-rounding relationship against all 21 published rows so neither number is invented. Both values are shown side by side in the Verification tab. |
| **What you should do** | Expect fees a fraction of a cent BELOW the published table on small orders. If Kalshi states the table is authoritative, flip FEE_TABLE_ROUNDING.publishedTableIncrement handling in src/kalshi-fees.js. |

**Evidence**

- Fee schedule PDF (formula + table, same document): <https://kalshi.com/docs/kalshi-fee-schedule.pdf>
- Transcribed oracle used by the test suite: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/kalshi-config.js> — `OFFICIAL_FEE_TABLE_PER_100 / FEE_TABLE_ROUNDING`

---

## #25 — KXBTCY has only 14 captured bars, so it joins the replay part-way through

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That every market in the universe covers the same window. |
| **Verified truth** | KXBTCY-27JAN0100-T149999.99 has 14 daily bars (2026-09-03 → 2026-09-17) while both Nasdaq-100 strikes have 61. In the merged timeline the BTC market simply appears in the final 14 periods; it is not back-filled. |
| **What the code does** | Per-market bar counts are shown in the competition universe panel and in every result's dataProvenance, so a shorter window is visible rather than hidden. |
| **What you should do** | Compare the "Bars" column in the Competition universe panel before reading any cross-market comparison. |

**Evidence**

- Coverage — `GET /api/history and GET /api/market-stats both report per-market bar counts`
- Window: <https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440>

---

## #28 — The competition universe grew from 3 markets to 30, so per-market statistics now rest on very unequal samples

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That every market in the universe offers a comparable amount of data. |
| **Verified truth** | After the backfill the 30 replayable markets hold between 204 and 268 bars (7,189 total), and 352 of those bars (4.9%) are no-trade periods with no OHLC at all. Two KXINXY strikes are no-trade in roughly half their bars. Correlations and win rates computed across markets therefore rest on unequal samples. |
| **What the code does** | Every market reports its own bar count, no-trade count and origin in the competition universe panel and in each result’s dataProvenance; markets with fewer than 10 bars (or no captured market object) are tracked but never replayed, and the reason is shown. |
| **What you should do** | Read the Bars / no-trade columns before comparing two markets, and check the "tracked, not replayable" list — it is not an error, it is the floor doing its job. |

**Evidence**

- Per-market coverage — `GET /api/history → markets[].bars, .noTradeBars, .origin, .excludedReason`
- No-trade bar shape: <https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440>

---

## #33 — The "Gold" project is a ring buyer’s directory, not a gold-market signal (name collision)

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That the GOLD project could supply gold-price information for a Kalshi gold strategy. |
| **Verified truth** | GOLD is an evidence-based buyer’s reference for solid gold RINGS — 482 jewelry listings ranked by price per pure-gold gram. Retail jewelry quotes are not a financial gold price, and wiring them into a market strategy would be a category error. Kalshi’s actual gold markets (KXGOLD15M and siblings) are now tracked directly from the exchange. |
| **What the code does** | The mismatch is flagged on the signal-source ledger and on the strategy itself. The gold strategy uses only the exchange’s own captured bars and results. |
| **What you should do** | If a gold-price signal is wanted later, the source must be an official price (e.g. LBMA/CME archive), not a jewelry directory. |

**Evidence**

- GOLD project (rings): <https://buffedlizard55-lab.github.io/GOLD/>
- The real gold market, captured from the exchange: <https://external-api.kalshi.com/trade-api/v2/markets/KXGOLD15M-26SEP162030-30>
- Recorded in the ledger — `src/signal-sources.js → S11 (status NOT_A_SIGNAL, flagged); GoldBracket_EarlyLeader sourceNote states the project contributes nothing to its inputs`

---

## #35 — An ACTIVE market’s lifetime volume can exceed the sum of its stored bars — only finalized markets reconcile exactly

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That summing a market’s stored volume_fp always reproduces its lifetime volume_fp (V80). |
| **Verified truth** | For FINALIZED markets the sum reconciles exactly (all 39 settled weather brackets and all 8 gold contracts do). For an ACTIVE market the market object is captured at a different instant than the last stored bar, and trading continues after it — observed: KXHIGHNY-26SEP17-B82.5 (status active) whose stored bars sum to less than its lifetime volume at capture. |
| **What the code does** | The store audit and test 79 assert exact reconciliation for finalized markets only, and treat an active market’s shortfall as expected ongoing trading rather than data corruption. |
| **What you should do** | None — this is a documented property of capturing a moving market, not an error. |

**Evidence**

- The active bracket that exposed it: <https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP17-B82.5>
- The exact-reconciliation rule for finalized markets — `test 79 in test/simulation.test.js reconciles only status=finalized stores`

---

## #38 — The settlement tracker was rate-limited (HTTP 429) partway through the 2026-09-18 pass

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That every tracked market could be re-checked for its final result in the same run as hundreds of candlestick requests. |
| **Verified truth** | data/history/_last-run.log (committed with the data) records http_429 for 13 markets — KXINXY-26DEC31H1600-T4000, six KXNASDAQ100Y strikes, KXNCAAFGAME-26SEP26ILLOSU-OSU, KXNFLGAME-26SEP10SFLAR-SF, two KXUFCFIGHT and KXWNBAGAME-26AUG10CHISEA-CHI — after the candlestick passes had already issued hundreds of requests. The markets are neither settled nor marked settled by the run; the fetch simply failed. No price or result is guessed to cover it. |
| **What the code does** | The failures are logged and committed instead of hidden. Closing this needs a slower cadence (min_interval_ms) or a settlement pass in its own run — both are one-line changes to the request file. |
| **What you should do** | Open data/history/_last-run.log and search for http_429: each line names a market whose settlement check did not complete. |

**Evidence**

- The run log committed with the data — `data/history/_last-run.log — "✗ <ticker>: http_429"`
- Rate-limit documentation: <https://docs.kalshi.com/getting_started/rate_limits>
- Implementation — `scripts/track-settlements.mjs (retries via scripts/kalshi-http.mjs; failures are reported, never invented)`

---

## #42 — The MasterSite directory's audit record for StockPaperSim is stale — the repository was rebuilt after the audit

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That the directory's per-site audit records (categories, descriptions, commit counts, flags) describe the current state of each repository. |
| **Verified truth** | The directory data (MasterSite data/sites.js, audit stamp 2026-09-17T21:47:46Z) records StockPaperSim as a "README-only placeholder… a single initial commit containing only a 15-byte README.md". The repository was rebuilt the next day: as of 2026-09-18T17:45:57Z it has 30 commits (PR #9 merged) and a full README describing a one-year paper-trading stock competition with two seasons, a venue model and its own secondary-source honesty labels. The directory entry is factually wrong about the repository it points at — not because the audit lied, but because it has not been re-run. |
| **What the code does** | Recorded in the signal-source ledger (S19) so no one cites the directory's placeholder description as current. This repository's own S19 entry describes the project as it is now. The directory itself needs its audit re-run (tools/build_data.py) to refresh the record — that is an action for the MasterSite repository, not this one. |
| **What you should do** | Re-run the MasterSite audit (its tools/build_data.py) and check whether any other entry also drifted — a directory of 38 sites audited once will drift again. |

**Evidence**

- The stale audit record (fetched via the GitHub API 2026-09-18): <https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js>
- The repository the record describes (now 30 commits): <https://github.com/buffedlizard55-lab/StockPaperSim>
- The rebuild merge: <https://github.com/buffedlizard55-lab/StockPaperSim/pull/9>

---

## #18 — updated_time is not a quote timestamp

**Severity:** `INFO`

| | |
| --- | --- |
| **We assumed** | That a market’s updated_time indicated when its price last changed. |
| **Verified truth** | Captured active markets show updated_time 2026-04-09T09:41:46Z while their last_price_dollars, yes_bid and yes_ask change intraday. |
| **What the code does** | All freshness indicators in this app use our own capture timestamp and the candlestick end_period_ts, never updated_time. |
| **What you should do** | None — informational. |

**Evidence**

- Market list capture: <https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12>

---

## #36 — RESOLVED 2026-09-18 — KXHIGHNY / KXGOLD15M fee multipliers were uncaptured; the fee configuration of ALL 14,154 series is now captured

**Severity:** `CLOSED`

| | |
| --- | --- |
| **We assumed** | That the fee multiplier of the two new series is known from a captured Series object (as it is for KXBTCY=0, V11). |
| **Verified truth** | The ingest captures MARKET objects, not SERIES objects, so seriesFeeConfig() falls back to the documented default multiplier M=1 (taker 0.07×P×(1−P)) with a "captured: false" note. If either series carries a non-standard multiplier in the official Non-Standard Fees table, fees for those flights would be over- or under-charged. |
| **What the code does** | CLOSED 2026-09-18. The on-demand ingest job now runs scripts/discover-universe.mjs, which calls GET /series?include_volume=true and stores the fee configuration of every series the exchange lists (14,154 series) in data/discovered/series-fees.json. scripts/generate-fee-registry.mjs narrows that to the 47 series this build can price a fill for and emits src/series-fee-registry.js; seriesFeeConfig() now resolves snapshot -> registry -> documented default and labels which one it used (captureSource). MEASURED ANSWERS: KXHIGHNY fee_multiplier 1 / quadratic and KXGOLD15M fee_multiplier 1 / quadratic — the documented default was right for both, but it is now a capture rather than an assumption. The same capture exposed a real, material bug: irregularity #37. |
| **What you should do** | Open https://docs.kalshi.com/api-reference/market/get-series-list, call it with include_volume=true, and compare any ticker against src/series-fee-registry.js. |

**Evidence**

- Fee schedule (check the Non-Standard table for these series): <https://kalshi.com/docs/kalshi-fee-schedule.pdf>
- The honest fallback — `src/verified-snapshot.js → seriesFeeConfig() "Series object not captured — using the documented taker default M=1"`

---

## #55 — The FDA and MLB archive workflows committed their raw capture logs to the repository root on every run

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That every bot's scratch log was covered by .gitignore, as ingest.log and forecast.log are, so the race guard's `git add -A` could never sweep one into a data commit. |
| **Verified truth** | Only /ingest.log and /forecast.log were ignored. fda-signals.log has been committed by every FDA run since 2026-09-19 (it is in main's tree), and the first MLB run on 2026-09-20 (run 35491621248) committed mlb-signals.log the same way. No data was affected — the logs duplicate what the runner already uploads as an artifact — but a tracked log file changes on every run, which makes every bot commit larger than its data and would let two bots conflict on a file nobody needs. |
| **What the code does** | /fda-signals.log and /mlb-signals.log added to .gitignore and both files removed from the tree (git rm --cached). The logs remain available as workflow artifacts (fda-signals-log / mlb-signals-log) and the per-run JSON reports (_fda-last-run.json / _mlb-last-run.json) stay committed, which is the diagnosable record the design wants. |
| **What you should do** | After this PR merges, no *.log file should appear at the repository ROOT in any bot commit: `git ls-files "*.log" | grep -v ^data/` on main must be empty (data/history/_last-run.log is the ingest's deliberately committed copy and stays). |

**Evidence**

- .gitignore (the two new entries): <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.gitignore>
- The first MLB capture run, whose commit carried mlb-signals.log: <https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35491621248>

---

## #61 — A research source headline profitability is refuted by the same post-own post-mortem (R19)

**Severity:** `LOW`

| | |
| --- | --- |
| **We assumed** | That the r/PredictionsMarkets "+39% Kalshi trading bot" post is a profitability claim one could cite. |
| **Verified truth** | The same post TL;DR says, of a ~1.5M-real-trade backtest plus the entire 2022 World Cup out of sample: "It does not work." The +39% figure is pre-post-mortem. The PARAMETERS (2-minute shock window, at least 15% of peak AND at least 8 cents, P50/P75/P90/P95 maker ladder, 4-6 cent maker exit, [close-150min, close] windowing) are measured and worth keeping; the return is not. |
| **What the code does** | Both the parameters and the refutation are pinned in R19; any future four-rung PanicLadder refinement must cite both. PanicDip_ShockTiming (the three-rung sibling) measures its own verdict from its own fills. |
| **What you should do** | Never cite the +39% figure without "It does not work" beside it. |

**Evidence**

- research-sources R19 — the post quoted verbatim, parameters and post-mortem: <https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/>

---

## #57 — One tracked CEO-change contract can NEVER receive an insider signal: OpenAI is a private company, so EDGAR holds no Form 4 for it

**Severity:** `INFO`

| | |
| --- | --- |
| **We assumed** | That every tracked company-event contract maps to an SEC filer, because the other four (Tesla ×2, JPMorgan, Apple) do. |
| **Verified truth** | KXOPENAICEOCHANGE-26 asks "If OpenAI's CEO (including an interim CEO) changes by Dec 31, 2026…". Section 16 applies to issuers with a class of equity securities registered under the Exchange Act; OpenAI is private, has no ticker and no CIK, so there is no Form 4 population to archive and no honest insider signal for that contract. It is recorded in EXCLUDED_ISSUERS with this reason rather than left as a silent gap, and both the roster entry and the desk entrant say so on their cards: for that ticker the signal is null, the trade is skipped, and the skip reason is published by form4JoinReport() / the desk coverage row. |
| **What the code does** | KXOPENAICEOCHANGE is listed in EXCLUDED_ISSUERS with this reason, published in the trigger file, on both strategy cards, and by form4JoinReport() as SERIES_NOT_TRACKED_BY_FORM4_ARCHIVE. Neither entry trades it and neither pretends to have a signal for it. |
| **What you should do** | Nothing to fix — this is a property of the market. If Kalshi lists a company-event contract on another private company, the same rule applies: no EDGAR filer, no Form 4 signal, abstain with the reason published. |

**Evidence**

- The contract's own rules_primary in the store — `data/history/KXOPENAICEOCHANGE-26.json → "If OpenAI's CEO (including an interim CEO) changes by Dec 31, 2026, then the market resolves to Yes." (status active, 14 captured ladders, no EDGAR filer)`
- EXCLUDED_ISSUERS, where the exclusion and its reason live: <https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-form4-signals.mjs>

