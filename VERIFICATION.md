# Line-by-Line Verification Audit

**Generated:** 2026-09-18 by `scripts/render-docs.js` from `src/verification-data.js`
**Standard:** every claim below is either (a) quoted from official Kalshi documentation, (b) copied from a real
production API response captured on 2026-09-17, or (c) derived by arithmetic on (a)/(b).
Nothing is inferred from a language model's memory of Kalshi.

| Status | Meaning | Count |
| --- | --- | --- |
| `DOCUMENTED` | Quoted from official Kalshi docs / the fee schedule PDF | 32 |
| `CAPTURED` | Copied from a real production API response | 21 |
| `NEGATIVE` | A verified 404 / contradiction (proof something is NOT true) | 1 |
| `DERIVED` | Computed by arithmetic on official formulas | 17 |
| `OBSERVATION` | Seen in real data, not explained by any document | 4 |
| **Total** | 67 of 75 carry a URL you can open yourself | **75** |

---

## 1. The audit trail, fact by fact

### Endpoints & environments

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V01` | DOCUMENTED | Production REST base URL | https://external-api.kalshi.com/trade-api/v2 | [docs.kalshi.com/getting_started/api_environments](https://docs.kalshi.com/getting_started/api_environments) | `src/kalshi-config.js → KALSHI_ENDPOINTS.rest.production` |
| `V02` | DOCUMENTED | Production WebSocket URL | wss://external-api-ws.kalshi.com/trade-api/ws/v2 | [docs.kalshi.com/getting_started/api_environments](https://docs.kalshi.com/getting_started/api_environments) | `src/kalshi-config.js → KALSHI_ENDPOINTS.websocket.production` |
| `V03` | DOCUMENTED | Demo environment REST base URL | https://external-api.demo.kalshi.co/trade-api/v2 | [docs.kalshi.com/getting_started/api_environments](https://docs.kalshi.com/getting_started/api_environments) | `src/kalshi-config.js; selectable via KALSHI_ENVIRONMENT=demo` |
| `V04` | DOCUMENTED | Also-supported legacy host (REST and WS) | api.elections.kalshi.com / demo-api.kalshi.co | [docs.kalshi.com/getting_started/api_environments](https://docs.kalshi.com/getting_started/api_environments) | `src/kalshi-config.js → *AlsoSupported fields` |
| `V05` | CAPTURED | Exchange status is live and all four exchange indices are trading | exchange_active=true; indices 0 Default, 1 Combos, 2 Crypto & Commodities, 3 Tennis/Baseball/Basketball | [external-api.kalshi.com/trade-api/v2/exchange/status](https://external-api.kalshi.com/trade-api/v2/exchange/status) | `src/verified-snapshot.js → EXCHANGE_STATUS; shown in the Verification tab` |

### Fees

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V06` | DOCUMENTED | Taker fee formula | fees = round up(M × 0.07 × C × P × (1−P)) | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-fees.js → computeKalshiFee({isMaker:false})` |
| `V07` | DOCUMENTED | Maker fee formula | fees = round up(M × 0.0175 × C × P × (1−P)) | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-fees.js → makerFee(); applied to resting-order fills` |
| `V08` | DOCUMENTED | Multiplier defaults: taker M = 1, maker M = 0 unless the series says otherwise | M is taken from series.fee_multiplier; the maker default is 0 | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-fees.js; per-series resolution in src/backtest-replay.js` |
| `V09` | DOCUMENTED | No settlement fee and no membership fee | settlement fee = $0.00 | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/simulation-engine.js → settleMarket() charges nothing; stated in /api/settle` |
| `V10` | CAPTURED | KXNASDAQ100Y series fee configuration | fee_type="quadratic_with_maker_fees", fee_multiplier=1 → taker AND maker fees apply | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y) | `src/verified-snapshot.js → SERIES.KXNASDAQ100Y` |
| `V11` | CAPTURED | KXBTCY series fee configuration — ZERO fees | fee_type="quadratic", fee_multiplier=0 → every fee computes to $0.00 | [external-api.kalshi.com/trade-api/v2/series/KXBTCY](https://external-api.kalshi.com/trade-api/v2/series/KXBTCY) | `src/verified-snapshot.js → SERIES.KXBTCY; drives the replay fee config` |
| `V12` | CAPTURED | KXINXY (S&P 500 yearly range) fee configuration | fee_type="quadratic_with_maker_fees", fee_multiplier=1 | [external-api.kalshi.com/trade-api/v2/series/KXINXY](https://external-api.kalshi.com/trade-api/v2/series/KXINXY) | `src/verified-snapshot.js → SERIES.KXINXY` |
| `V13` | CAPTURED | KXTSLA (Tesla KPI) fee configuration | fee_type="quadratic", fee_multiplier=1 → taker fees only, maker default 0 | [external-api.kalshi.com/trade-api/v2/series/KXTSLA](https://external-api.kalshi.com/trade-api/v2/series/KXTSLA) | `src/verified-snapshot.js → SERIES.KXTSLA` |
| `V14` | DERIVED | Fee as a fraction of capital deployed differs by side | buying YES at P costs 0.07×(1−P) of premium in fees; buying NO at (1−P) costs 0.07×P | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/strategies.js → FeeArb_PremiumBuyer entry rule (algebra on the official formula)` |
| `V15` | DERIVED | Fee burden on the captured replay universe | At the observed YES prices (0.06–0.28) a taker pays 5.0%–6.6% of premium in fees buying YES, versus 0.4%–2.0% buying NO | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `Strategy theses in src/strategies.js; post-mortems in src/analysis.js` |
| `V47` | DOCUMENTED | The official definition of "round up" in the fee formula | "round up = rounds up such that the fee + positionCost is rounded to a centicent" — verbatim, stated identically under both the taker and maker formulas | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-fees.js roundUpToIncrement(ROUNDING_INCREMENT = 0.0001)` |
| `V48` | DERIVED | The published General Trading Fees Table is the formula rounded UP to whole cents, not to a centicent | All 21 rows satisfy tableFee = ceil_to_cent(formulaFee). Example: 100 contracts at $0.01 → formula $0.0693, table $0.07. 100 at $0.25 → $1.3125 vs $1.32. | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `test/simulation.test.js test 2 (oracle: OFFICIAL_FEE_TABLE_PER_100); src/kalshi-config.js FEE_TABLE_ROUNDING` |
| `V49` | DOCUMENTED | KXBTCY is listed in the official "Non-Standard Fees" table with maker 0 / taker 0 | Second, independent confirmation of the zero-fee BTC series (the first is the live GET /series/KXBTCY capture, V11) | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-config.js NON_STANDARD_FEE_MULTIPLIERS; seriesFeeConfig().pdfCrossCheck` |
| `V50` | DOCUMENTED | KXNASDAQ100Y, KXINXY, KXFEDDECISION and KXCPIYOY are all listed maker 1 / taker 1 | Matches the live fee_multiplier = 1 captured per series (V10, V12) | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `seriesFeeConfig().pdfCrossCheck — every simulated series resolves to "agrees"` |
| `V51` | DOCUMENTED | KXTSLA and KXFA are ABSENT from the Non-Standard Fees table, so the documented defaults apply | "M = the multiplier for each contract (default is 1 unless otherwise indicated)" for takers, "(default is 0 unless otherwise indicated)" for makers — consistent with the live fee_multiplier = 1 on both series (V13) | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-fees.js computeKalshiFee() defaultM branch` |
| `V52` | DOCUMENTED | When fees are and are not charged | "Trading fees are only charged for orders that are immediately matched with orders sitting on the orderbook." Resting orders are charged maker fees only when ultimately executed; "there are no fees associated with canceling a resting order." | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/simulation-engine.js — maker fills charged at 0.0175 coefficient only on execution; cancelOrder() charges nothing` |
| `V53` | DOCUMENTED | Fee schedule version in force | "Last updated and effective: July 7, 2026" — appears on every page of the PDF | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/kalshi-config.js KALSHI_FEES.effective` |

### Prices & order book

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V16` | DOCUMENTED | Prices are FixedPointDollars strings with 4 decimals | e.g. "0.1200" = 12 cents | [docs.kalshi.com/getting_started/fixed_point_migration](https://docs.kalshi.com/getting_started/fixed_point_migration) | `src/price-grid.js → dollarsToNumber/toDollarsString` |
| `V17` | DOCUMENTED | Tick size comes from each market’s price_ranges array — never hard-coded | price_ranges: [{start, end, step}] with step "0.0100" (linear_cent) or "0.0010" (deci_cent) | [docs.kalshi.com/getting_started/fixed_point_migration](https://docs.kalshi.com/getting_started/fixed_point_migration) | `src/price-grid.js → resolvePriceGrid(); src/kalshi-config.js → PRICE_LEVEL_STRUCTURES` |
| `V18` | DOCUMENTED | The order book publishes BIDS ONLY, and a YES bid at X is the same liquidity as a NO ask at 1−X | orderbook_fp: { yes_dollars: [[price, count], …], no_dollars: [[price, count], …] } | [docs.kalshi.com/getting_started/orderbook_responses](https://docs.kalshi.com/getting_started/orderbook_responses) | `src/kalshi-api.js → parseKalshiOrderbook(); src/simulation-engine.js → OrderBook (reciprocal)` |
| `V19` | CAPTURED | A real order book is sparse and fractional, not a uniform 5-tier ladder | KXNASDAQ100Y-26DEC31H1600-T33000: 9 YES levels, 35 NO levels, sizes from 3.43 to 4991.32 contracts | [external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26](https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook) | `src/verified-snapshot.js → ORDERBOOKS (capture-2, primary)` |
| `V20` | DERIVED | Reciprocal check passes on the captured book | best NO bid 0.8700 ⇒ implied YES ask 0.1300, which matches yes_ask_dollars "0.1300" on the market object; YES mid 0.1200 + NO mid 0.8800 = 1.0000 | [docs.kalshi.com/getting_started/orderbook_responses](https://docs.kalshi.com/getting_started/orderbook_responses) | `src/kalshi-api.js → reciprocalCheck(); asserted in test/simulation.test.js` |
| `V21` | CAPTURED | Book arrays are returned ASCENDING by price | the best bid is the LAST element of yes_dollars / no_dollars | [external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26](https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook) | `src/kalshi-api.js → parseKalshiOrderbook() sorts before computing best/mid` |

### Markets & history

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V22` | DOCUMENTED | Candlesticks live under the SERIES path, not under /markets/{ticker} | GET /series/{series_ticker}/markets/{ticker}/candlesticks?start_ts&end_ts&period_interval | [docs.kalshi.com/api-reference/market/get-market-candlesticks](https://docs.kalshi.com/api-reference/market/get-market-candlesticks) | `src/kalshi-config.js → KALSHI_PATHS.candlesticks(); src/kalshi-api.js` |
| `V23` | DOCUMENTED | period_interval enum is minutes: 1, 60 or 1440 | [1, 60, 1440] | [docs.kalshi.com/api-reference/market/get-market-candlesticks](https://docs.kalshi.com/api-reference/market/get-market-candlesticks) | `src/kalshi-config.js → CANDLE_PERIODS_MINUTES; validated by /api/candlesticks` |
| `V24` | DOCUMENTED | Live candlestick history only covers roughly the last 3 months; older data needs the historical endpoints | GET /historical/cutoff reports the boundary; GET /historical/markets/{ticker}/candlesticks serves older data | [docs.kalshi.com/getting_started/historical_data](https://docs.kalshi.com/getting_started/historical_data) | `src/kalshi-api.js → getCandlesticks({historical:true}); IRREGULARITIES #13` |
| `V25` | CAPTURED | Historical cutoff on the capture date | 2026-07-19T00:00:00Z (all four timestamps identical) | [external-api.kalshi.com/trade-api/v2/historical/cutoff](https://external-api.kalshi.com/trade-api/v2/historical/cutoff) | `src/verified-snapshot.js → HISTORICAL_CUTOFF; explains why the 61-bar series starts 2026-07-19` |
| `V26` | CAPTURED | 61 contiguous real daily bars for KXNASDAQ100Y-26DEC31H1600-T33000 | end_period_ts 1784433600 → 1789617600 (2026-07-19 → 2026-09-17), every step exactly 86400 s, closes 0.0600–0.2800, total volume 172,805.18 contracts | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440) | `src/verified-candles.js → KXNASDAQ100Y_T33000_DAILY (primary replay series)` |
| `V27` | CAPTURED | Candlestick response schema (real fields) | end_period_ts, open_interest_fp, volume_fp, price{open,high,low,close,mean,previous}_dollars, yes_bid{open,high,low,close}_dollars, yes_ask{…} | [docs.kalshi.com/api-reference/market/get-market-candlesticks](https://docs.kalshi.com/api-reference/market/get-market-candlesticks) | `src/backtest-replay.js → parseCandle()` |
| `V28` | CAPTURED | Market status vocabulary in RESPONSES | initialized, inactive, active, closed, determined, disputed, amended, finalized | [docs.kalshi.com/api-reference/market/get-markets](https://docs.kalshi.com/api-reference/market/get-markets) | `src/kalshi-config.js → MARKET_STATUS_RESPONSE` |
| `V29` | DOCUMENTED | Market status vocabulary in QUERY FILTERS is different | unopened, open, paused, closed, settled — an "active" market is queried with status=open | [docs.kalshi.com/api-reference/market/get-markets](https://docs.kalshi.com/api-reference/market/get-markets) | `src/kalshi-api.js → mapStatusToFilter()` |
| `V30` | CAPTURED | Real, currently-listed series tickers | KXINXY, KXNASDAQ100Y, KXFEDDECISION, KXTSLA, KXFA, KXCPIYOY, KXBTCY, KXABNBA, KXKLAR, KXGRAB, KXRELYA, KXTOLA | [external-api.kalshi.com/trade-api/v2/series?category=Compani](https://external-api.kalshi.com/trade-api/v2/series?category=Companies) | `src/strategies.js → VERIFIED_SERIES` |
| `V31` | CAPTURED | Real market ticker formats (event-scoped, not bare series names) | KXNASDAQ100Y-26DEC31H1600-T33000 · KXINXY-27DEC31H1600-T4600 · KXTSLA-26OCTPROD-510000 · KXBTCY-27JAN0100-T149999.99 · KXCPIYOY-26DEC-T4.9 | [external-api.kalshi.com/trade-api/v2/markets?series_ticker=K](https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12) | `src/verified-snapshot.js → MARKETS` |
| `V32` | NEGATIVE | KXSP500, KXNVDA, KXAAPL and KXNDX DO NOT EXIST | each returns {"error":{"code":"not_found","message":"not found"}} | [external-api.kalshi.com/trade-api/v2/series/KXNVDA](https://external-api.kalshi.com/trade-api/v2/series/KXNVDA) | `src/verified-snapshot.js → SERIES_NOT_FOUND; src/strategies.js → REJECTED_FABRICATED_TICKERS` |

### WebSocket & auth

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V33` | DOCUMENTED | WebSocket connections require authentication during the handshake | headers KALSHI-ACCESS-KEY, KALSHI-ACCESS-SIGNATURE, KALSHI-ACCESS-TIMESTAMP | [docs.kalshi.com/getting_started/quick_start_websockets](https://docs.kalshi.com/getting_started/quick_start_websockets) | `src/kalshi-auth.js → buildWsAuthHeaders(); src/kalshi-ws.js → UpstreamFeedManager` |
| `V34` | DOCUMENTED | Signature scheme | RSA-PSS, SHA-256, salt length = digest length; message = timestamp_ms + METHOD + path_without_query; for WS the path is "/trade-api/ws/v2" | [docs.kalshi.com/getting_started/api_keys](https://docs.kalshi.com/getting_started/api_keys) | `src/kalshi-auth.js → signPssText(); src/kalshi-config.js → KALSHI_AUTH, WS_SIGN_PATH` |
| `V35` | DOCUMENTED | Subscribe command shape | {"id":1,"cmd":"subscribe","params":{"channels":["ticker"],"market_tickers":["…"]}} | [docs.kalshi.com/getting_started/quick_start_websockets](https://docs.kalshi.com/getting_started/quick_start_websockets) | `src/kalshi-ws.js → subscribeMessage()` |
| `V36` | DOCUMENTED | Channel names | public: ticker, trade, market_lifecycle_v2, multivariate, multivariate_market_lifecycle · private: orderbook_delta, fill, market_positions, communications, order_group_updates | [docs.kalshi.com/getting_started/quick_start_websockets](https://docs.kalshi.com/getting_started/quick_start_websockets) | `src/kalshi-config.js → WS_CHANNELS; channel picker in the UI` |
| `V37` | DOCUMENTED | Clients must implement reconnection with exponential backoff | “Handle Disconnects: Implement reconnection logic with exponential backoff.” | [docs.kalshi.com/getting_started/quick_start_websockets](https://docs.kalshi.com/getting_started/quick_start_websockets) | `src/kalshi-ws.js → backoffDelay() (500 ms × 2^n, capped 30 s)` |
| `V38` | DOCUMENTED | Rate limits are token-based and 429 carries no Retry-After header | 10 tokens per request; basic tier 200 reads/s and 100 writes/s; burst window 2 s | [docs.kalshi.com/getting_started/rate_limits](https://docs.kalshi.com/getting_started/rate_limits) | `src/kalshi-config.js → RATE_LIMITS; src/kalshi-api.js treats 429 as backoff` |
| `V39` | DERIVED | A browser can never connect to Kalshi’s WebSocket directly | the WebSocket API cannot set request headers, and Kalshi requires signed headers at handshake | [docs.kalshi.com/getting_started/quick_start_websockets](https://docs.kalshi.com/getting_started/quick_start_websockets) | `server.js /ws/feed relay; src/kalshi-ws.js → RelayFeedClient` |

### Observations

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V40` | OBSERVATION | liquidity_dollars is "0.0000" on active markets that have real volume and open interest | e.g. KXNASDAQ100Y-26DEC31H1600-T33000: liquidity_dollars "0.0000" with volume_fp 395554.67 and open_interest_fp 162977.28 | [external-api.kalshi.com/trade-api/v2/markets?series_ticker=K](https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12) | `Not used for any calculation. Displayed raw, as captured.` |
| `V41` | OBSERVATION | Two depth sizes in an earlier capture could not be re-confirmed and contradicted the market object | capture-1 reported YES 0.1200 @ 100242.25 while the market object reported yes_bid_size_fp "242.25" at the same price | [external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26](https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook) | `Archived as evidence only; the simulator uses capture-2` |
| `V42` | OBSERVATION | updated_time on active markets can be months older than the live quote | KXNASDAQ100Y-26DEC31H1600-T33000: updated_time 2026-04-09 while last_price_dollars changes intraday | [external-api.kalshi.com/trade-api/v2/markets?series_ticker=K](https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12) | `Never treated as a quote timestamp; provenance uses our own capture time` |

### Project rules

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V43` | DERIVED | No performance number is hard-coded anywhere | validateStrategies() rejects any strategy carrying a literal returnPct or currentEquity | [validateStrategies() in src/strategies.js — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/strategies.js) | `src/strategies.js → validateStrategies(); asserted in test/simulation.test.js` |
| `V44` | DERIVED | Every strategy carries riskManagement: "NONE (by mandate)" | asserted at import time; no stop-loss, position cap or volatility target exists in any decide() | [riskManagement field on all 10 strategies — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/strategies.js) | `src/strategies.js; competition metadata in src/strategy-runner.js` |
| `V45` | DERIVED | Post-mortem prose interpolates computed values only | generatePostMortem() reads result.stats and the attribution object; it has no literal performance strings | [generatePostMortem() in src/analysis.js — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/analysis.js) | `src/analysis.js` |
| `V46` | DERIVED | Oversized orders are never filled at an invented price | exhaustionPolicy defaults to "partial": the remainder is reported as unfilled; the legacy "penalty" mode is opt-in and labelled | [exhaustionPolicy in src/simulation-engine.js — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/simulation-engine.js) | `src/simulation-engine.js; src/backtest-replay.js` |

### Captured market data

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V60` | CAPTURED | KXNASDAQ100Y-26DEC31H1600-T19000 has a full 61-bar daily window, aligned period-for-period with T33000 | 61 daily bars, 1784433600 (2026-07-19) → 1789617600 (2026-09-17), 86400 s apart with no gaps; 5 no-trade periods | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440) | `src/verified-candles.js → KXNASDAQ100Y_T19000_DAILY / EXTENDED_CAPTURE_META_T19000` |
| `V61` | CAPTURED | The new 61-bar capture is a deep-verified superset of the earlier 14-bar snapshot of the same market | All 14 overlapping bars match field-for-field (end_period_ts, open_interest_fp, volume_fp, price.*, yes_bid.*, yes_ask.*) under a sorted-key deep comparison | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440) | `test/simulation.test.js → test 54 ("deep-verified superset")` |
| `V62` | CAPTURED | A period with no trades returns an empty price object — only previous_dollars | {"price":{"previous_dollars":"0.0300"},"volume_fp":"0.00"} — 5 of 61 bars in the T19000 capture | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440) | `src/verified-candles.js → expandBar() null handling; src/backtest-replay.js → normalizeCandles()` |
| `V63` | DERIVED | Cross-market correlation of the two Nasdaq-100 strikes over the shared window | Pearson ρ = +0.147 on 55 usable daily close-to-close dollar changes (61 shared periods, 5 no-trade periods excluded) | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440) | `src/market-analytics.js → computeUniverseCorrelation(); test 56` |
| `V64` | CAPTURED | KXBTCY has only 14 captured daily bars, so its correlation with the Nasdaq markets is NOT reported | 11–13 usable overlapping periods vs the 20-period minimum; the pair is reported as "not computed" rather than extrapolated | [external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/K](https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440) | `src/market-analytics.js → computeUniverseCorrelation() minOverlap guard` |

### Engine correctness

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V65` | DERIVED | Rounding the average cost to 6 decimals breaks the accounting identity on large positions | 0.5e-6 × ~900,000 contracts ≈ $0.45 of phantom cost basis per position, compounding across fills — measured identity error $2.16 on ContrarianKing_100x | [round10() in src/simulation-engine.js — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/simulation-engine.js) | `src/simulation-engine.js → round10() applied to avgCost only; test 25` |
| `V66` | DERIVED | JSON.stringify(value, keyArray) filters nested objects, so "verbatim" comparisons of candlestick bars were silently shallow | JSON.stringify(bar, ["end_period_ts","price"]) serialises the nested price object as {} — two bars with different prices compare equal | [developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Gl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter) | `src/json-utils.js → stableStringify/stableEqual` |
| `V67` | DERIVED | The equity curve now always terminates at finalEquity even when the last timestamp spans several markets | Before the fix the two-market universe ended the curve $9,086.73 away from finalEquity (36,789.43 vs 27,702.70) | [final curve point reconciliation in src/backtest-replay.js — reviewable in the repository](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/backtest-replay.js) | `src/backtest-replay.js → final curve point reconciliation` |
| `V78` | DERIVED | A stored series is admitted to the replay only as a verified superset of the in-repo capture | For every bar the store and the capture share, all 16 fields must match (stableEqual, not JSON.stringify with a key array). Only then may the stored series replace the capture, and only when it is longer. Otherwise the capture is kept and the disagreement is reported. On the 2026-09-17 data this promoted T33000 to 263 bars, T19000 to 264 and KXBTCY to 204, with 0 conflicts. | [src/history-merge.js → chooseCandleSeries()](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/history-merge.js) | `src/history-merge.js → chooseCandleSeries(); tests 60 and 61` |
| `V79` | DERIVED | Per-market capital allocation is an OPTION, off by default, and the cap never invents a fill | maxNotionalPerMarketPct caps the notional one market may hold (positions + resting orders) at that fraction of equity. Orders are scaled down before execution; whatever the cap refuses is counted (cappedOrders / cappedContracts) and reported next to the unfilled remainder. Default null, because the competition brief is highest-return-only. | [src/backtest-replay.js → ReplayEngine._applyMarketCap()](https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/backtest-replay.js) | `src/backtest-replay.js → ReplayEngine._applyMarketCap(); scripts/cap-comparison.mjs` |

### Settlement

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V68` | DOCUMENTED | A binary contract pays notional_value_dollars ($1.00) to the winning side and $0.00 to the losing side, with no settlement fee | "There is no settlement fee." — fee schedule effective 2026-07-07 | [kalshi.com/docs/kalshi-fee-schedule.pdf](https://kalshi.com/docs/kalshi-fee-schedule.pdf) | `src/settlement-tracker.js → buildSettlementPlan(); SETTLEMENT_FEE_USD = 0` |
| `V69` | CAPTURED | Every market captured on 2026-09-17 was still unresolved (status "active", result "") | KXNASDAQ100Y-26DEC31H1600-T33000 / -T19000 and KXBTCY-27JAN0100-T149999.99 all return status=active, result=""  | [external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26](https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000) | `src/settlement-tracker.js → classifySettlement(); test 57 asserts nothing is booked` |

### Strategy sources

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V70` | DOCUMENTED | Favorite-longshot bias: "fade the longshot" is a published retail/systematic approach on Kalshi | Filter contracts priced 5c-15c and sell/Yes-fade them as maker; buy heavy favorites in the 85c-95c band | [laikalabs.ai/prediction-markets/kalshi-prediction-market-tra](https://laikalabs.ai/prediction-markets/kalshi-prediction-market-trading-strategies) | `src/strategies.js → longshot_fader_flb (LongshotFader_FLB)` |
| `V71` | DOCUMENTED | The favorite-longshot bias is aggregation-dependent — the sign of longshot returns flips between weighting schemes | Polymarket study (588M trades): longshots lose 6.3c per dollar weighted per contract, but gain 4.1c per dollar when grouped by parent event | [pith.science/paper/2609.12878](https://pith.science/paper/2609.12878) | `src/strategies.js → longshot_fader_flb thesis (stated as a caveat, not a proven edge)` |
| `V72` | DOCUMENTED | Shock-timing: rest limit buys below the pre-shock price at historical drop depths and exit with a resting offer 4-6c higher | r/PredictionsMarkets build log — "keeping both entry and exit on resting limit orders completely sidesteps the fee drag" | [www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built](https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/) | `src/strategies.js → panic_dip_shock_timing (PanicDip_ShockTiming)` |
| `V73` | DOCUMENTED | Maker orders are the recommended way to avoid paying the spread, and exiting before settlement is the recommended exit | OddsHopper Kalshi playbook: "rest limit orders instead of paying the spread", "take profit by selling your position before settlement" | [www.oddsshopper.com/articles/prediction-markets/kalshi-tradi](https://www.oddsshopper.com/articles/prediction-markets/kalshi-trading-strategy) | `src/strategies.js → panic_dip_shock_timing exit rule (resting maker offer 5c above cost)` |

### Historical data

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V74` | CAPTURED | Market candlesticks go back far beyond the /historical/cutoff date — the cutoff does NOT bound them | GET /historical/cutoff returns 2026-07-19T00:00:00Z for market_positions / market_settled / orders / trades, but the SAME market’s candlesticks are served back to its open_time: a 1-day probe at 2026-01-01 (start_ts=1767225600&end_ts=1767312000) on KXNASDAQ100Y-26DEC31H1600-T33000 returned a real bar (end_period_ts 1767243600, close 0.0700, volume 247.00). Probes at 2026-03-01 and 2026-05-01 also returned real bars. | [api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/ma](https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1767225600&end_ts=1767312000&period_interval=1440) | `scripts/ingest-history.mjs (--days=0 backfills from each market’s open_time); see IRREGULARITIES.md #26` |
| `V75` | CAPTURED | The daily ingest job ran against production and grew the dataset to 30 markets / 7,189 daily bars with zero conflicts | GET /series/{series}/markets/{ticker}/candlesticks paged in 180-day windows from each market’s open_time: 4,666 bars added in one run, 7,189 stored, 0 conflicts between the re-fetched bars and the in-repo 2026-09-17 captures, 0 failed requests. Window 2025-12-24 → 2026-09-17 (268 daily periods vs the 61 the in-repo captures held). | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1766524800&end_ts=1789689600&period_interval=1440) | `data/history/*.json + data/history/_manifest.json; src/accumulated-history.js (generated); src/history-merge.js` |
| `V76` | CAPTURED | A no-trade period returns the resting quotes but NO OHLC — only price.previous_dollars | Bar end_period_ts 1781928000 on KXINXY-26DEC31H1600-T4000: {price:{previous_dollars:"0.0200"}, volume_fp:"0.00", yes_bid:{...0.0200}, yes_ask:{...0.0300}} — no open/high/low/close/mean. 352 of the 7,189 stored bars (4.9%) are of this kind. | [external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/K](https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440) | `scripts/ingest-history.mjs (stores the bar as returned); src/accumulated-history.js expandAccumulatedBar() omits unreported prices; getCandleCoverage().noTradeBars` |
| `V77` | OBSERVATION | Fixed-point precision is consistent across every stored bar — 4 decimals for dollars, 2 for *_fp | 33,562 price values across 2,523 bars were all exactly 4 decimal places and every open_interest_fp / volume_fp exactly 2. No counter-example was found, which is what makes the compact integer encoding in src/accumulated-history.js lossless. Flagged as an OBSERVATION because Kalshi does not publish this guarantee: the encoder asserts it on every value and refuses to write the file if it ever fails. | [external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/mar](https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440) | `scripts/generate-history-module.mjs → assertDecimals() throws if this ever stops being true` |
| `V80` | DERIVED | A candlestick’s volume_fp is the contracts traded in that period — proven by summing them | Summing the 204 daily volume_fp values of KXBTCY-27JAN0100-T149999.99 gives 2,032,361.22, exactly the market’s lifetime volume_fp (2,032,361.22). KXINXY-26DEC31H1600-B6900: 294,789.96 = 294,789.96. KXNASDAQ100Y-26DEC31H1600-T33000: 394,165.05 vs 395,852.67 — the 1,687.62 difference is the trading done since the last bar closed. No fill may therefore exceed the contracts that actually changed hands in a period. | [external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/K](https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1771975529&end_ts=1789689600&period_interval=1440) | `src/backtest-replay.js → ReplayEngine.maxFillFractionOfPeriodVolume (default 0.10 of the period’s real volume)` |

### Prices

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
| `V81` | DERIVED | Traded price range of the stored universe (what strategies can actually touch) | The 30 stored markets hold 5,762 numeric closes spanning $0.01 to $0.45; NO close reaches $0.50; only two markets ever print above $0.28 (KXNASDAQ100Y-26DEC31H1600-T33000: 45 bars, max $0.45; T19000: 2 bars, max $0.40). Reported highs reach $0.99 on T33000, but a high is not a tradeable close and is not treated as one. | [docs.kalshi.com/api-reference/market/get-market-candlesticks](https://docs.kalshi.com/api-reference/market/get-market-candlesticks) | `src/strategies.js -> LongshotFader_FLB thesis and AdjacentStrike_Ladder thesis; test 77 in test/simulation.test.js` |

---

## 2. Official sources used

| Source | URL |
| --- | --- |
| REST API (production) | https://external-api.kalshi.com/trade-api/v2 |
| WebSocket (production) | wss://external-api-ws.kalshi.com/trade-api/ws/v2 |
| Demo / sandbox API | https://external-api.demo.kalshi.co/trade-api/v2 |
| API documentation | https://docs.kalshi.com/ |
| Fee schedule (effective 2026-07-07) | https://kalshi.com/docs/kalshi-fee-schedule.pdf |
| Exchange status capture | https://external-api.kalshi.com/trade-api/v2/exchange/status |
| Historical cutoff capture | https://external-api.kalshi.com/trade-api/v2/historical/cutoff |
| Order book response format | https://docs.kalshi.com/getting_started/orderbook_responses |
| Fixed-point migration guide | https://docs.kalshi.com/getting_started/fixed_point_migration |
| Candlesticks endpoint | https://docs.kalshi.com/api-reference/market/get-market-candlesticks |
| WebSocket quick start | https://docs.kalshi.com/getting_started/quick_start_websockets |
| API keys & RSA-PSS signing | https://docs.kalshi.com/getting_started/api_keys |
| Rate limits | https://docs.kalshi.com/getting_started/rate_limits |
| Historical data policy | https://docs.kalshi.com/getting_started/historical_data |

### Negative evidence (verified 404s)

These series **do not exist**. They were requested from the production API and the
`not_found` responses are stored verbatim in `src/verified-snapshot.js`:

- `KXNVDA` — [https://external-api.kalshi.com/trade-api/v2/series/KXNVDA](https://external-api.kalshi.com/trade-api/v2/series/KXNVDA) → `not_found` (captured 2026-09-17)
- `KXSP500` — [https://external-api.kalshi.com/trade-api/v2/series/KXSP500](https://external-api.kalshi.com/trade-api/v2/series/KXSP500) → `not_found` (captured 2026-09-17)
- `KXAAPL` — [https://external-api.kalshi.com/trade-api/v2/series/KXAAPL](https://external-api.kalshi.com/trade-api/v2/series/KXAAPL) → `not_found` (captured 2026-09-17)
- `KXNDX` — rejected from earlier drafts; **never probed**, so no 404 is claimed for it

---

## 3. Fee engine oracle

The implementation in `src/kalshi-fees.js` is checked against Kalshi's own published table
(21 rows) by `test/simulation.test.js` test 1.

- Taker: `fees = round up(M x 0.07 x C x P x (1-P))`
- Maker: `fees = round up(M x 0.0175 x C x P x (1-P))`
- Rounding, verbatim from the PDF: *"round up = rounds up such that the fee + positionCost is rounded to a centicent"*
- No settlement fee. No membership fee.

**Known discrepancy (Irregularity #19):** the PDF's *General Trading Fees Table* prints the formula
rounded **up to whole cents**, while the formula itself rounds to a **centicent**. For 100 contracts at
$0.01 the formula gives $0.0693 and the table prints $0.07. This app charges the formula value and
asserts the cent-rounding relationship for all 21 rows, so neither number is invented.

Per-series multipliers are cross-checked against **two** independent sources — the live
`GET /series/{ticker}` capture and the PDF's *Non-Standard Fees* table:

| Series | Live capture M | PDF taker M | PDF maker M | Agree? |
| --- | --- | --- | --- | --- |
| `KXBTCY` | 0 | 0 | 0 | ✅ |
| `KXNASDAQ100Y` | 1 | 1 | 1 | ✅ |
| `KXINXY` | 1 | 1 | 1 | ✅ |
| `KXFEDDECISION` | 1 | 1 | 1 | ✅ |
| `KXCPIYOY` | 1 | 1 | 1 | ✅ |
| `KXTSLA`, `KXFA` | 1 | *(not listed → default 1)* | *(not listed → default 0)* | ✅ |

---

## 4. Data captures behind the simulation

| Capture | Detail |
| --- | --- |
| Markets | 9 real markets across 7 series, captured 2026-09-17 |
| Order book | `KXNASDAQ100Y-26DEC31H1600-T33000` — 9 YES levels / 35 NO levels, dual-capture (see Irregularity #17) |
| Candlesticks | `KXNASDAQ100Y-26DEC31H1600-T33000` — 61 daily bars, 2026-07-19 → 2026-09-17 |
| Historical cutoff | 2026-07-19T00:00:00Z (live window ≈ 3 months) |
| Exchange status | `exchange_active: true`, `trading_active: true` |

---

## 5. Competition-site structure we reverse-engineered

Structure and interaction patterns only. **No data, copy or branding was taken from any of these sites.**

| Site | What we took | What we did NOT take | Implemented in |
| --- | --- | --- | --- |
| [kalshi.com](https://kalshi.com/) | Market-card layout (YES/NO price pair, volume, open interest), the order-book depth ladder, the trade ticket with explicit fee preview, and the reciprocal YES/NO framing. | No market data, copy or branding. All prices shown here come from captured API responses or are labelled simulations. | `Markets & Depth tab (src/app.js renderMarkets), OrderBook reciprocity (src/simulation-engine.js)` |
| [tradingview.com/the-leap](https://www.tradingview.com/the-leap/) | A ranked leaderboard with participant identity, a podium for the top three, a fixed competition window, and rules/eligibility presented next to the standings. | No participant data or branding. | `Leaderboard tab: podium, qualification rule, mandate notice, competition window` |
| [trade-ideas.com stock trading competition](https://www.trade-ideas.com/stock-trading-competition/) | Registration with a unique username, a starting-capital allowance, periodic (daily/weekly) standings snapshots, and a published result history. | No participant data or branding. | `Competition Memory tab: registration, 52-week calendar, weekly snapshots, export/import` |
| [specials.candlecharts.com/contest](https://specials.candlecharts.com/contest) | A contest calendar with entry periods and a scoring summary per entrant. | No entries or branding. | `Calendar strip + per-trader computed stats (return, drawdown, fees, unfilled)` |

---

## 6. Self-imposed rules, and the test that enforces each

| Rule | Enforced by |
| --- | --- |
| No performance number is hard-coded anywhere | `validateStrategies()` → 0 problems; test 21 |
| Every strategy carries `riskManagement: NONE (by mandate)` | test 21 |
| Post-mortem prose interpolates computed values only | `generatePostMortem()`; test 26 |
| Oversized orders are never filled at an invented price | `exhaustionPolicy: 'partial'`; tests 17–19 |
| Attribution factors sum exactly to the equity change | test 25 (residual < $0.01 for all 22 strategies) |
| A strategy that never traded is not ranked | `LEADERBOARD_QUALIFICATION.minTrades = 1`; test 27 |
| Fabricated tickers cannot re-enter the catalog | test 10 |
