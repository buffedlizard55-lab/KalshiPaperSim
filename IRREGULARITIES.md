# Flagged Irregularities

**Generated:** 2026-09-17 by `scripts/render-docs.js` from `src/verification-data.js`.
**25 irregularities** flagged during this build: 9 high, 10 medium,
5 low, 1 informational.

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

