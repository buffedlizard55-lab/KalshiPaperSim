/**
 * KalshiPaperSim — Verification Ledger & Irregularity Register
 * =====================================================================
 * SINGLE SOURCE OF TRUTH for the "Verification" and "Irregularities" tabs and
 * for VERIFICATION.md / IRREGULARITIES.md. Every entry carries the URL that a
 * human can open to check the claim manually.
 *
 * Status vocabulary (deliberately narrow — nothing is marked verified unless it
 * was read from an official page or a real API response):
 *   DOCUMENTED     the specification says so (docs.kalshi.com / kalshi.com PDF)
 *   CAPTURED       a real response from the live production API on 2026-09-17
 *   NEGATIVE       a real response that DISPROVED an assumption (e.g. 404)
 *   DERIVED        arithmetic on a documented formula — the inputs are official,
 *                  the conclusion is ours and is labelled as such
 *   OBSERVATION    something noticed in captured data that is not explained by
 *                  any official document (flagged, not assumed away)
 */

const D = 'https://docs.kalshi.com';

export const VERIFICATION_STATUS = Object.freeze({
  DOCUMENTED: 'DOCUMENTED',
  CAPTURED: 'CAPTURED',
  NEGATIVE: 'NEGATIVE',
  DERIVED: 'DERIVED',
  OBSERVATION: 'OBSERVATION'
});

/** Every external fact this app relies on. */
export const VERIFIED_FACTS = Object.freeze([
  /* ── 1. Endpoints & environments ─────────────────────────────────── */
  {
    id: 'V01', group: 'Endpoints & environments', status: 'DOCUMENTED',
    fact: 'Production REST base URL',
    value: 'https://external-api.kalshi.com/trade-api/v2',
    url: `${D}/getting_started/api_environments`,
    usedIn: 'src/kalshi-config.js → KALSHI_ENDPOINTS.rest.production'
  },
  {
    id: 'V02', group: 'Endpoints & environments', status: 'DOCUMENTED',
    fact: 'Production WebSocket URL',
    value: 'wss://external-api-ws.kalshi.com/trade-api/ws/v2',
    url: `${D}/getting_started/api_environments`,
    usedIn: 'src/kalshi-config.js → KALSHI_ENDPOINTS.websocket.production'
  },
  {
    id: 'V03', group: 'Endpoints & environments', status: 'DOCUMENTED',
    fact: 'Demo environment REST base URL',
    value: 'https://external-api.demo.kalshi.co/trade-api/v2',
    url: `${D}/getting_started/api_environments`,
    usedIn: 'src/kalshi-config.js; selectable via KALSHI_ENVIRONMENT=demo'
  },
  {
    id: 'V04', group: 'Endpoints & environments', status: 'DOCUMENTED',
    fact: 'Also-supported legacy host (REST and WS)',
    value: 'api.elections.kalshi.com / demo-api.kalshi.co',
    url: `${D}/getting_started/api_environments`,
    usedIn: 'src/kalshi-config.js → *AlsoSupported fields'
  },
  {
    id: 'V05', group: 'Endpoints & environments', status: 'CAPTURED',
    fact: 'Exchange status is live and all four exchange indices are trading',
    value: 'exchange_active=true; indices 0 Default, 1 Combos, 2 Crypto & Commodities, 3 Tennis/Baseball/Basketball',
    url: 'https://external-api.kalshi.com/trade-api/v2/exchange/status',
    doc: `${D}/api-reference/exchange/get-exchange-status`,
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → EXCHANGE_STATUS; shown in the Verification tab'
  },

  /* ── 2. Fees ─────────────────────────────────────────────────────── */
  {
    id: 'V06', group: 'Fees', status: 'DOCUMENTED',
    fact: 'Taker fee formula',
    value: 'fees = round up(M × 0.07 × C × P × (1−P))',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/kalshi-fees.js → computeKalshiFee({isMaker:false})'
  },
  {
    id: 'V07', group: 'Fees', status: 'DOCUMENTED',
    fact: 'Maker fee formula',
    value: 'fees = round up(M × 0.0175 × C × P × (1−P))',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/kalshi-fees.js → makerFee(); applied to resting-order fills'
  },
  {
    id: 'V08', group: 'Fees', status: 'DOCUMENTED',
    fact: 'Multiplier defaults: taker M = 1, maker M = 0 unless the series says otherwise',
    value: 'M is taken from series.fee_multiplier; the maker default is 0',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/kalshi-fees.js; per-series resolution in src/backtest-replay.js'
  },
  {
    id: 'V09', group: 'Fees', status: 'DOCUMENTED',
    fact: 'No settlement fee and no membership fee',
    value: 'settlement fee = $0.00',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/simulation-engine.js → settleMarket() charges nothing; stated in /api/settle'
  },
  {
    id: 'V10', group: 'Fees', status: 'CAPTURED',
    fact: 'KXNASDAQ100Y series fee configuration',
    value: 'fee_type="quadratic_with_maker_fees", fee_multiplier=1 → taker AND maker fees apply',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → SERIES.KXNASDAQ100Y'
  },
  {
    id: 'V11', group: 'Fees', status: 'CAPTURED',
    fact: 'KXBTCY series fee configuration — ZERO fees',
    value: 'fee_type="quadratic", fee_multiplier=0 → every fee computes to $0.00',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → SERIES.KXBTCY; drives the replay fee config',
    irregularity: '#8'
  },
  {
    id: 'V12', group: 'Fees', status: 'CAPTURED',
    fact: 'KXINXY (S&P 500 yearly range) fee configuration',
    value: 'fee_type="quadratic_with_maker_fees", fee_multiplier=1',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXINXY',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → SERIES.KXINXY'
  },
  {
    id: 'V13', group: 'Fees', status: 'CAPTURED',
    fact: 'KXTSLA (Tesla KPI) fee configuration',
    value: 'fee_type="quadratic", fee_multiplier=1 → taker fees only, maker default 0',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXTSLA',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → SERIES.KXTSLA'
  },
  {
    id: 'V14', group: 'Fees', status: 'DERIVED',
    fact: 'Fee as a fraction of capital deployed differs by side',
    value: 'buying YES at P costs 0.07×(1−P) of premium in fees; buying NO at (1−P) costs 0.07×P',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/strategies.js → FeeArb_PremiumBuyer entry rule (algebra on the official formula)',
    note: 'DERIVED by us from the published formula, not stated verbatim in any Kalshi document.'
  },
  {
    id: 'V15', group: 'Fees', status: 'DERIVED',
    fact: 'Fee burden on the captured replay universe',
    value: 'At the observed YES prices (0.06–0.28) a taker pays 5.0%–6.6% of premium in fees buying YES, versus 0.4%–2.0% buying NO',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'Strategy theses in src/strategies.js; post-mortems in src/analysis.js'
  },
  {
    id: 'V47', group: 'Fees', status: 'DOCUMENTED',
    fact: 'The official definition of "round up" in the fee formula',
    value: '"round up = rounds up such that the fee + positionCost is rounded to a centicent" — verbatim, stated identically under both the taker and maker formulas',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'src/kalshi-fees.js roundUpToIncrement(ROUNDING_INCREMENT = 0.0001)'
  },
  {
    id: 'V48', group: 'Fees', status: 'DERIVED',
    fact: 'The published General Trading Fees Table is the formula rounded UP to whole cents, not to a centicent',
    value: 'All 21 rows satisfy tableFee = ceil_to_cent(formulaFee). Example: 100 contracts at $0.01 → formula $0.0693, table $0.07. 100 at $0.25 → $1.3125 vs $1.32.',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'test/simulation.test.js test 2 (oracle: OFFICIAL_FEE_TABLE_PER_100); src/kalshi-config.js FEE_TABLE_ROUNDING',
    irregularity: '#19'
  },
  {
    id: 'V49', group: 'Fees', status: 'DOCUMENTED',
    fact: 'KXBTCY is listed in the official "Non-Standard Fees" table with maker 0 / taker 0',
    value: 'Second, independent confirmation of the zero-fee BTC series (the first is the live GET /series/KXBTCY capture, V11)',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'src/kalshi-config.js NON_STANDARD_FEE_MULTIPLIERS; seriesFeeConfig().pdfCrossCheck'
  },
  {
    id: 'V50', group: 'Fees', status: 'DOCUMENTED',
    fact: 'KXNASDAQ100Y, KXINXY, KXFEDDECISION and KXCPIYOY are all listed maker 1 / taker 1',
    value: 'Matches the live fee_multiplier = 1 captured per series (V10, V12)',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'seriesFeeConfig().pdfCrossCheck — every simulated series resolves to "agrees"'
  },
  {
    id: 'V51', group: 'Fees', status: 'DOCUMENTED',
    fact: 'KXTSLA and KXFA are ABSENT from the Non-Standard Fees table, so the documented defaults apply',
    value: '"M = the multiplier for each contract (default is 1 unless otherwise indicated)" for takers, "(default is 0 unless otherwise indicated)" for makers — consistent with the live fee_multiplier = 1 on both series (V13)',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'src/kalshi-fees.js computeKalshiFee() defaultM branch'
  },
  {
    id: 'V52', group: 'Fees', status: 'DOCUMENTED',
    fact: 'When fees are and are not charged',
    value: '"Trading fees are only charged for orders that are immediately matched with orders sitting on the orderbook." Resting orders are charged maker fees only when ultimately executed; "there are no fees associated with canceling a resting order."',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'src/simulation-engine.js — maker fills charged at 0.0175 coefficient only on execution; cancelOrder() charges nothing'
  },
  {
    id: 'V53', group: 'Fees', status: 'DOCUMENTED',
    fact: 'Fee schedule version in force',
    value: '"Last updated and effective: July 7, 2026" — appears on every page of the PDF',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    capturedAt: '2026-09-17',
    usedIn: 'src/kalshi-config.js KALSHI_FEES.effective'
  },

  /* ── 3. Prices, ticks & the order book ───────────────────────────── */
  {
    id: 'V16', group: 'Prices & order book', status: 'DOCUMENTED',
    fact: 'Prices are FixedPointDollars strings with 4 decimals',
    value: 'e.g. "0.1200" = 12 cents',
    url: `${D}/getting_started/fixed_point_migration`,
    usedIn: 'src/price-grid.js → dollarsToNumber/toDollarsString'
  },
  {
    id: 'V17', group: 'Prices & order book', status: 'DOCUMENTED',
    fact: 'Tick size comes from each market’s price_ranges array — never hard-coded',
    value: 'price_ranges: [{start, end, step}] with step "0.0100" (linear_cent) or "0.0010" (deci_cent)',
    url: `${D}/getting_started/fixed_point_migration`,
    usedIn: 'src/price-grid.js → resolvePriceGrid(); src/kalshi-config.js → PRICE_LEVEL_STRUCTURES',
    irregularity: '#6'
  },
  {
    id: 'V18', group: 'Prices & order book', status: 'DOCUMENTED',
    fact: 'The order book publishes BIDS ONLY, and a YES bid at X is the same liquidity as a NO ask at 1−X',
    value: 'orderbook_fp: { yes_dollars: [[price, count], …], no_dollars: [[price, count], …] }',
    url: `${D}/getting_started/orderbook_responses`,
    usedIn: 'src/kalshi-api.js → parseKalshiOrderbook(); src/simulation-engine.js → OrderBook (reciprocal)',
    irregularity: '#10'
  },
  {
    id: 'V19', group: 'Prices & order book', status: 'CAPTURED',
    fact: 'A real order book is sparse and fractional, not a uniform 5-tier ladder',
    value: 'KXNASDAQ100Y-26DEC31H1600-T33000: 9 YES levels, 35 NO levels, sizes from 3.43 to 4991.32 contracts',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → ORDERBOOKS (capture-2, primary)'
  },
  {
    id: 'V20', group: 'Prices & order book', status: 'DERIVED',
    fact: 'Reciprocal check passes on the captured book',
    value: 'best NO bid 0.8700 ⇒ implied YES ask 0.1300, which matches yes_ask_dollars "0.1300" on the market object; YES mid 0.1200 + NO mid 0.8800 = 1.0000',
    url: `${D}/getting_started/orderbook_responses`,
    usedIn: 'src/kalshi-api.js → reciprocalCheck(); asserted in test/simulation.test.js'
  },
  {
    id: 'V21', group: 'Prices & order book', status: 'CAPTURED',
    fact: 'Book arrays are returned ASCENDING by price',
    value: 'the best bid is the LAST element of yes_dollars / no_dollars',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook',
    capturedAt: '2026-09-17',
    usedIn: 'src/kalshi-api.js → parseKalshiOrderbook() sorts before computing best/mid'
  },

  /* ── 4. Markets, series & candlesticks ───────────────────────────── */
  {
    id: 'V22', group: 'Markets & history', status: 'DOCUMENTED',
    fact: 'Candlesticks live under the SERIES path, not under /markets/{ticker}',
    value: 'GET /series/{series_ticker}/markets/{ticker}/candlesticks?start_ts&end_ts&period_interval',
    url: `${D}/api-reference/market/get-market-candlesticks`,
    usedIn: 'src/kalshi-config.js → KALSHI_PATHS.candlesticks(); src/kalshi-api.js',
    irregularity: '#5'
  },
  {
    id: 'V23', group: 'Markets & history', status: 'DOCUMENTED',
    fact: 'period_interval enum is minutes: 1, 60 or 1440',
    value: '[1, 60, 1440]',
    url: `${D}/api-reference/market/get-market-candlesticks`,
    usedIn: 'src/kalshi-config.js → CANDLE_PERIODS_MINUTES; validated by /api/candlesticks'
  },
  {
    id: 'V24', group: 'Markets & history', status: 'DOCUMENTED',
    fact: 'Live candlestick history only covers roughly the last 3 months; older data needs the historical endpoints',
    value: 'GET /historical/cutoff reports the boundary; GET /historical/markets/{ticker}/candlesticks serves older data',
    url: `${D}/getting_started/historical_data`,
    usedIn: 'src/kalshi-api.js → getCandlesticks({historical:true}); IRREGULARITIES #13',
    irregularity: '#13'
  },
  {
    id: 'V25', group: 'Markets & history', status: 'CAPTURED',
    fact: 'Historical cutoff on the capture date',
    value: '2026-07-19T00:00:00Z (all four timestamps identical)',
    url: 'https://external-api.kalshi.com/trade-api/v2/historical/cutoff',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → HISTORICAL_CUTOFF; explains why the 61-bar series starts 2026-07-19'
  },
  {
    id: 'V26', group: 'Markets & history', status: 'CAPTURED',
    fact: '61 contiguous real daily bars for KXNASDAQ100Y-26DEC31H1600-T33000',
    value: 'end_period_ts 1784433600 → 1789617600 (2026-07-19 → 2026-09-17), every step exactly 86400 s, closes 0.0600–0.2800, total volume 172,805.18 contracts',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-candles.js → KXNASDAQ100Y_T33000_DAILY (primary replay series)'
  },
  {
    id: 'V27', group: 'Markets & history', status: 'CAPTURED',
    fact: 'Candlestick response schema (real fields)',
    value: 'end_period_ts, open_interest_fp, volume_fp, price{open,high,low,close,mean,previous}_dollars, yes_bid{open,high,low,close}_dollars, yes_ask{…}',
    url: `${D}/api-reference/market/get-market-candlesticks`,
    capturedAt: '2026-09-17',
    usedIn: 'src/backtest-replay.js → parseCandle()'
  },
  {
    id: 'V28', group: 'Markets & history', status: 'CAPTURED',
    fact: 'Market status vocabulary in RESPONSES',
    value: 'initialized, inactive, active, closed, determined, disputed, amended, finalized',
    url: `${D}/api-reference/market/get-markets`,
    usedIn: 'src/kalshi-config.js → MARKET_STATUS_RESPONSE',
    irregularity: '#9'
  },
  {
    id: 'V29', group: 'Markets & history', status: 'DOCUMENTED',
    fact: 'Market status vocabulary in QUERY FILTERS is different',
    value: 'unopened, open, paused, closed, settled — an "active" market is queried with status=open',
    url: `${D}/api-reference/market/get-markets`,
    usedIn: 'src/kalshi-api.js → mapStatusToFilter()',
    irregularity: '#9'
  },
  {
    id: 'V30', group: 'Markets & history', status: 'CAPTURED',
    fact: 'Real, currently-listed series tickers',
    value: 'KXINXY, KXNASDAQ100Y, KXFEDDECISION, KXTSLA, KXFA, KXCPIYOY, KXBTCY, KXABNBA, KXKLAR, KXGRAB, KXRELYA, KXTOLA',
    url: 'https://external-api.kalshi.com/trade-api/v2/series?category=Companies',
    capturedAt: '2026-09-17',
    usedIn: 'src/strategies.js → VERIFIED_SERIES'
  },
  {
    id: 'V31', group: 'Markets & history', status: 'CAPTURED',
    fact: 'Real market ticker formats (event-scoped, not bare series names)',
    value: 'KXNASDAQ100Y-26DEC31H1600-T33000 · KXINXY-27DEC31H1600-T4600 · KXTSLA-26OCTPROD-510000 · KXBTCY-27JAN0100-T149999.99 · KXCPIYOY-26DEC-T4.9',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → MARKETS'
  },
  {
    id: 'V32', group: 'Markets & history', status: 'NEGATIVE',
    fact: 'KXSP500, KXNVDA, KXAAPL and KXNDX DO NOT EXIST',
    value: 'each returns {"error":{"code":"not_found","message":"not found"}}',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNVDA',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-snapshot.js → SERIES_NOT_FOUND; src/strategies.js → REJECTED_FABRICATED_TICKERS',
    irregularity: '#1'
  },

  /* ── 5. WebSocket & authentication ───────────────────────────────── */
  {
    id: 'V33', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'WebSocket connections require authentication during the handshake',
    value: 'headers KALSHI-ACCESS-KEY, KALSHI-ACCESS-SIGNATURE, KALSHI-ACCESS-TIMESTAMP',
    url: `${D}/getting_started/quick_start_websockets`,
    usedIn: 'src/kalshi-auth.js → buildWsAuthHeaders(); src/kalshi-ws.js → UpstreamFeedManager',
    irregularity: '#3'
  },
  {
    id: 'V34', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'Signature scheme',
    value: 'RSA-PSS, SHA-256, salt length = digest length; message = timestamp_ms + METHOD + path_without_query; for WS the path is "/trade-api/ws/v2"',
    url: `${D}/getting_started/api_keys`,
    usedIn: 'src/kalshi-auth.js → signPssText(); src/kalshi-config.js → KALSHI_AUTH, WS_SIGN_PATH'
  },
  {
    id: 'V35', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'Subscribe command shape',
    value: '{"id":1,"cmd":"subscribe","params":{"channels":["ticker"],"market_tickers":["…"]}}',
    url: `${D}/getting_started/quick_start_websockets`,
    usedIn: 'src/kalshi-ws.js → subscribeMessage()'
  },
  {
    id: 'V36', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'Channel names',
    value: 'public: ticker, trade, market_lifecycle_v2, multivariate, multivariate_market_lifecycle · private: orderbook_delta, fill, market_positions, communications, order_group_updates',
    url: `${D}/getting_started/quick_start_websockets`,
    usedIn: 'src/kalshi-config.js → WS_CHANNELS; channel picker in the UI'
  },
  {
    id: 'V37', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'Clients must implement reconnection with exponential backoff',
    value: '“Handle Disconnects: Implement reconnection logic with exponential backoff.”',
    url: `${D}/getting_started/quick_start_websockets`,
    usedIn: 'src/kalshi-ws.js → backoffDelay() (500 ms × 2^n, capped 30 s)'
  },
  {
    id: 'V38', group: 'WebSocket & auth', status: 'DOCUMENTED',
    fact: 'Rate limits are token-based and 429 carries no Retry-After header',
    value: '10 tokens per request; basic tier 200 reads/s and 100 writes/s; burst window 2 s',
    url: `${D}/getting_started/rate_limits`,
    usedIn: 'src/kalshi-config.js → RATE_LIMITS; src/kalshi-api.js treats 429 as backoff',
    irregularity: '#16'
  },
  {
    id: 'V39', group: 'WebSocket & auth', status: 'DERIVED',
    fact: 'A browser can never connect to Kalshi’s WebSocket directly',
    value: 'the WebSocket API cannot set request headers, and Kalshi requires signed headers at handshake',
    url: `${D}/getting_started/quick_start_websockets`,
    usedIn: 'server.js /ws/feed relay; src/kalshi-ws.js → RelayFeedClient',
    irregularity: '#3'
  },

  /* ── 6. Observations that are not explained by any document ──────── */
  {
    id: 'V40', group: 'Observations', status: 'OBSERVATION',
    fact: 'liquidity_dollars is "0.0000" on active markets that have real volume and open interest',
    value: 'e.g. KXNASDAQ100Y-26DEC31H1600-T33000: liquidity_dollars "0.0000" with volume_fp 395554.67 and open_interest_fp 162977.28',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12',
    capturedAt: '2026-09-17',
    usedIn: 'Not used for any calculation. Displayed raw, as captured.',
    irregularity: '#15'
  },
  {
    id: 'V41', group: 'Observations', status: 'OBSERVATION',
    fact: 'Two depth sizes in an earlier capture could not be re-confirmed and contradicted the market object',
    value: 'capture-1 reported YES 0.1200 @ 100242.25 while the market object reported yes_bid_size_fp "242.25" at the same price',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook',
    capturedAt: '2026-09-17',
    usedIn: 'Archived as evidence only; the simulator uses capture-2',
    irregularity: '#17'
  },
  {
    id: 'V42', group: 'Observations', status: 'OBSERVATION',
    fact: 'updated_time on active markets can be months older than the live quote',
    value: 'KXNASDAQ100Y-26DEC31H1600-T33000: updated_time 2026-04-09 while last_price_dollars changes intraday',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12',
    capturedAt: '2026-09-17',
    usedIn: 'Never treated as a quote timestamp; provenance uses our own capture time',
    irregularity: '#18'
  },

  /* ── 7. Rules of this project (self-imposed, verifiable in code) ─── */
  {
    id: 'V43', group: 'Project rules', status: 'DERIVED',
    fact: 'No performance number is hard-coded anywhere',
    value: 'validateStrategies() rejects any strategy carrying a literal returnPct or currentEquity',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/strategies.js',
    evidenceLabel: 'validateStrategies() in src/strategies.js — reviewable in the repository',
    usedIn: 'src/strategies.js → validateStrategies(); asserted in test/simulation.test.js'
  },
  {
    id: 'V44', group: 'Project rules', status: 'DERIVED',
    fact: 'Every strategy carries riskManagement: "NONE (by mandate)"',
    value: 'asserted at import time; no stop-loss, position cap or volatility target exists in any decide()',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/strategies.js',
    evidenceLabel: 'riskManagement field on the entire roster — reviewable in the repository',
    usedIn: 'src/strategies.js; competition metadata in src/strategy-runner.js'
  },
  {
    id: 'V45', group: 'Project rules', status: 'DERIVED',
    fact: 'Post-mortem prose interpolates computed values only',
    value: 'generatePostMortem() reads result.stats and the attribution object; it has no literal performance strings',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/analysis.js',
    evidenceLabel: 'generatePostMortem() in src/analysis.js — reviewable in the repository',
    usedIn: 'src/analysis.js'
  },
  {
    id: 'V46', group: 'Project rules', status: 'DERIVED',
    fact: 'Oversized orders are never filled at an invented price',
    value: 'exhaustionPolicy defaults to "partial": the remainder is reported as unfilled; the legacy "penalty" mode is opt-in and labelled',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/simulation-engine.js',
    evidenceLabel: 'exhaustionPolicy in src/simulation-engine.js — reviewable in the repository',
    usedIn: 'src/simulation-engine.js; src/backtest-replay.js',
    irregularity: '#12'
  },

  /* ── 9. Second verified market (session 2 capture) ───────────────── */
  {
    id: 'V60', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXNASDAQ100Y-26DEC31H1600-T19000 has a full 61-bar daily window, aligned period-for-period with T33000',
    value: '61 daily bars, 1784433600 (2026-07-19) → 1789617600 (2026-09-17), 86400 s apart with no gaps; 5 no-trade periods',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
    doc: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-candles.js → KXNASDAQ100Y_T19000_DAILY / EXTENDED_CAPTURE_META_T19000'
  },
  {
    id: 'V61', group: 'Captured market data', status: 'CAPTURED',
    fact: 'The new 61-bar capture is a deep-verified superset of the earlier 14-bar snapshot of the same market',
    value: 'All 14 overlapping bars match field-for-field (end_period_ts, open_interest_fp, volume_fp, price.*, yes_bid.*, yes_ask.*) under a sorted-key deep comparison',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440',
    capturedAt: '2026-09-17',
    usedIn: 'test/simulation.test.js → test 54 ("deep-verified superset")'
  },
  {
    id: 'V62', group: 'Captured market data', status: 'CAPTURED',
    fact: 'A period with no trades returns an empty price object — only previous_dollars',
    value: '{"price":{"previous_dollars":"0.0300"},"volume_fp":"0.00"} — 5 of 61 bars in the T19000 capture',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
    capturedAt: '2026-09-17',
    usedIn: 'src/verified-candles.js → expandBar() null handling; src/backtest-replay.js → normalizeCandles()'
  },
  {
    id: 'V63', group: 'Captured market data', status: 'DERIVED',
    fact: 'Cross-market correlation of the two Nasdaq-100 strikes over the shared window',
    value: 'Pearson ρ = +0.147 on 55 usable daily close-to-close dollar changes (61 shared periods, 5 no-trade periods excluded)',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T19000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
    usedIn: 'src/market-analytics.js → computeUniverseCorrelation(); test 56'
  },
  {
    id: 'V64', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXBTCY has only 14 captured daily bars, so its correlation with the Nasdaq markets is NOT reported',
    value: '11–13 usable overlapping periods vs the 20-period minimum; the pair is reported as "not computed" rather than extrapolated',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440',
    capturedAt: '2026-09-17',
    usedIn: 'src/market-analytics.js → computeUniverseCorrelation() minOverlap guard'
  },
  {
    id: 'V65', group: 'Engine correctness', status: 'DERIVED',
    fact: 'Rounding the average cost to 6 decimals breaks the accounting identity on large positions',
    value: '0.5e-6 × ~900,000 contracts ≈ $0.45 of phantom cost basis per position, compounding across fills — measured identity error $2.16 on ContrarianKing_100x',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/simulation-engine.js',
    evidenceLabel: 'round10() in src/simulation-engine.js — reviewable in the repository',
    usedIn: 'src/simulation-engine.js → round10() applied to avgCost only; test 25'
  },
  {
    id: 'V66', group: 'Engine correctness', status: 'DERIVED',
    fact: 'JSON.stringify(value, keyArray) filters nested objects, so "verbatim" comparisons of candlestick bars were silently shallow',
    value: 'JSON.stringify(bar, ["end_period_ts","price"]) serialises the nested price object as {} — two bars with different prices compare equal',
    url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter',
    usedIn: 'src/json-utils.js → stableStringify/stableEqual'
  },
  {
    id: 'V67', group: 'Engine correctness', status: 'DERIVED',
    fact: 'The equity curve now always terminates at finalEquity even when the last timestamp spans several markets',
    value: 'Before the fix the two-market universe ended the curve $9,086.73 away from finalEquity (36,789.43 vs 27,702.70)',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/backtest-replay.js',
    evidenceLabel: 'final curve point reconciliation in src/backtest-replay.js — reviewable in the repository',
    usedIn: 'src/backtest-replay.js → final curve point reconciliation'
  },
  {
    id: 'V68', group: 'Settlement', status: 'DOCUMENTED',
    fact: 'A binary contract pays notional_value_dollars ($1.00) to the winning side and $0.00 to the losing side, with no settlement fee',
    value: '"There is no settlement fee." — fee schedule effective 2026-07-07',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/settlement-tracker.js → buildSettlementPlan(); SETTLEMENT_FEE_USD = 0'
  },
  {
    id: 'V70', group: 'Strategy sources', status: 'DOCUMENTED',
    fact: 'Favorite-longshot bias: "fade the longshot" is a published retail/systematic approach on Kalshi',
    value: 'Filter contracts priced 5c-15c and sell/Yes-fade them as maker; buy heavy favorites in the 85c-95c band',
    url: 'https://laikalabs.ai/prediction-markets/kalshi-prediction-market-trading-strategies',
    usedIn: 'src/strategies.js → longshot_fader_flb (LongshotFader_FLB)'
  },
  {
    id: 'V71', group: 'Strategy sources', status: 'DOCUMENTED',
    fact: 'The favorite-longshot bias is aggregation-dependent — the sign of longshot returns flips between weighting schemes',
    value: 'Polymarket study (588M trades): longshots lose 6.3c per dollar weighted per contract, but gain 4.1c per dollar when grouped by parent event',
    url: 'https://pith.science/paper/2609.12878',
    usedIn: 'src/strategies.js → longshot_fader_flb thesis (stated as a caveat, not a proven edge)'
  },
  {
    id: 'V72', group: 'Strategy sources', status: 'DOCUMENTED',
    fact: 'Shock-timing: rest limit buys below the pre-shock price at historical drop depths and exit with a resting offer 4-6c higher',
    value: 'r/PredictionsMarkets build log — "keeping both entry and exit on resting limit orders completely sidesteps the fee drag"',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/',
    usedIn: 'src/strategies.js → panic_dip_shock_timing (PanicDip_ShockTiming)'
  },
  {
    id: 'V73', group: 'Strategy sources', status: 'DOCUMENTED',
    fact: 'Maker orders are the recommended way to avoid paying the spread, and exiting before settlement is the recommended exit',
    value: 'OddsHopper Kalshi playbook: "rest limit orders instead of paying the spread", "take profit by selling your position before settlement"',
    url: 'https://www.oddsshopper.com/articles/prediction-markets/kalshi-trading-strategy',
    usedIn: 'src/strategies.js → panic_dip_shock_timing exit rule (resting maker offer 5c above cost)'
  },
  {
    id: 'V69', group: 'Settlement', status: 'CAPTURED',
    fact: 'Every market captured on 2026-09-17 was still unresolved (status "active", result "")',
    value: 'KXNASDAQ100Y-26DEC31H1600-T33000 / -T19000 and KXBTCY-27JAN0100-T149999.99 all return status=active, result="" ',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000',
    capturedAt: '2026-09-17',
    usedIn: 'src/settlement-tracker.js → classifySettlement(); test 57 asserts nothing is booked'
  },
  {
    id: 'V74', group: 'Historical data', status: 'CAPTURED',
    fact: 'Market candlesticks go back far beyond the /historical/cutoff date — the cutoff does NOT bound them',
    value: 'GET /historical/cutoff returns 2026-07-19T00:00:00Z for market_positions / market_settled / orders / trades, but the SAME market\u2019s candlesticks are served back to its open_time: a 1-day probe at 2026-01-01 (start_ts=1767225600&end_ts=1767312000) on KXNASDAQ100Y-26DEC31H1600-T33000 returned a real bar (end_period_ts 1767243600, close 0.0700, volume 247.00). Probes at 2026-03-01 and 2026-05-01 also returned real bars.',
    url: 'https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1767225600&end_ts=1767312000&period_interval=1440',
    doc: 'https://docs.kalshi.com/getting_started/historical_data',
    capturedAt: '2026-09-17',
    usedIn: 'scripts/ingest-history.mjs (--days=0 backfills from each market\u2019s open_time); see IRREGULARITIES.md #26'
  },
  {
    id: 'V75', group: 'Historical data', status: 'CAPTURED',
    fact: 'The daily ingest job ran against production and grew the dataset to 30 markets / 7,189 daily bars with zero conflicts',
    value: 'GET /series/{series}/markets/{ticker}/candlesticks paged in 180-day windows from each market\u2019s open_time: 4,666 bars added in one run, 7,189 stored, 0 conflicts between the re-fetched bars and the in-repo 2026-09-17 captures, 0 failed requests. Window 2025-12-24 \u2192 2026-09-17 (268 daily periods vs the 61 the in-repo captures held).',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1766524800&end_ts=1789689600&period_interval=1440',
    doc: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
    capturedAt: '2026-09-17',
    usedIn: 'data/history/*.json + data/history/_manifest.json; src/accumulated-history.js (generated); src/history-merge.js'
  },
  {
    id: 'V76', group: 'Historical data', status: 'CAPTURED',
    fact: 'A no-trade period returns the resting quotes but NO OHLC — only price.previous_dollars',
    value: 'Bar end_period_ts 1781928000 on KXINXY-26DEC31H1600-T4000: {price:{previous_dollars:"0.0200"}, volume_fp:"0.00", yes_bid:{...0.0200}, yes_ask:{...0.0300}} — no open/high/low/close/mean. 352 of the 7,189 stored bars (4.9%) are of this kind.',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440',
    capturedAt: '2026-09-17',
    usedIn: 'scripts/ingest-history.mjs (stores the bar as returned); src/accumulated-history.js expandAccumulatedBar() omits unreported prices; getCandleCoverage().noTradeBars'
  },
  {
    id: 'V77', group: 'Historical data', status: 'OBSERVATION',
    fact: 'Fixed-point precision is consistent across every stored bar — 4 decimals for dollars, 2 for *_fp',
    value: '33,562 price values across 2,523 bars were all exactly 4 decimal places and every open_interest_fp / volume_fp exactly 2. No counter-example was found, which is what makes the compact integer encoding in src/accumulated-history.js lossless. Flagged as an OBSERVATION because Kalshi does not publish this guarantee: the encoder asserts it on every value and refuses to write the file if it ever fails.',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
    doc: 'https://docs.kalshi.com/getting_started/fixed_point_migration',
    capturedAt: '2026-09-17',
    usedIn: 'scripts/generate-history-module.mjs → assertDecimals() throws if this ever stops being true'
  },
  {
    id: 'V78', group: 'Engine correctness', status: 'DERIVED',
    fact: 'A stored series is admitted to the replay only as a verified superset of the in-repo capture',
    value: 'For every bar the store and the capture share, all 16 fields must match (stableEqual, not JSON.stringify with a key array). Only then may the stored series replace the capture, and only when it is longer. Otherwise the capture is kept and the disagreement is reported. On the 2026-09-17 data this promoted T33000 to 263 bars, T19000 to 264 and KXBTCY to 204, with 0 conflicts.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/history-merge.js',
    evidenceLabel: 'src/history-merge.js → chooseCandleSeries()',
    usedIn: 'src/history-merge.js → chooseCandleSeries(); tests 60 and 61'
  },
  {
    id: 'V80', group: 'Historical data', status: 'DERIVED',
    fact: 'A candlestick\u2019s volume_fp is the contracts traded in that period — proven by summing them',
    value: 'Summing the 204 daily volume_fp values of KXBTCY-27JAN0100-T149999.99 gives 2,032,361.22, exactly the market\u2019s lifetime volume_fp (2,032,361.22). KXINXY-26DEC31H1600-B6900: 294,789.96 = 294,789.96. KXNASDAQ100Y-26DEC31H1600-T33000: 394,165.05 vs 395,852.67 — the 1,687.62 difference is the trading done since the last bar closed. No fill may therefore exceed the contracts that actually changed hands in a period.',
    url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1771975529&end_ts=1789689600&period_interval=1440',
    doc: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
    capturedAt: '2026-09-17',
    usedIn: 'src/backtest-replay.js → ReplayEngine.maxFillFractionOfPeriodVolume (default 0.10 of the period\u2019s real volume)'
  },
  {
    id: 'V79', group: 'Engine correctness', status: 'DERIVED',
    fact: 'Per-market capital allocation is an OPTION, off by default, and the cap never invents a fill',
    value: 'maxNotionalPerMarketPct caps the notional one market may hold (positions + resting orders) at that fraction of equity. Orders are scaled down before execution; whatever the cap refuses is counted (cappedOrders / cappedContracts) and reported next to the unfilled remainder. Default null, because the competition brief is highest-return-only.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/backtest-replay.js',
    evidenceLabel: 'src/backtest-replay.js → ReplayEngine._applyMarketCap()',
    usedIn: 'src/backtest-replay.js → ReplayEngine._applyMarketCap(); scripts/cap-comparison.mjs'
  },
  {
    id: 'V81', group: 'Prices', status: 'DERIVED',
    fact: 'Traded price range of the stored universe (what strategies can actually touch)',
    value: 'The 30 stored markets hold 5,762 numeric closes spanning $0.01 to $0.45; NO close reaches $0.50; only two markets ever print above $0.28 (KXNASDAQ100Y-26DEC31H1600-T33000: 45 bars, max $0.45; T19000: 2 bars, max $0.40). Reported highs reach $0.99 on T33000, but a high is not a tradeable close and is not treated as one.',
    url: `${D}/api-reference/market/get-market-candlesticks`,
    doc: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/calendar-audit.json',
    derivation: 'Min/max over price.close in every tuple of src/accumulated-history.js (markets[*].tuples[*][3][3] / 10000), every tuple being a verbatim response from the official candlesticks endpoint above; reproducible offline and re-asserted by test 77.',
    usedIn: 'src/strategies.js -> LongshotFader_FLB thesis and AdjacentStrike_Ladder thesis; test 77 in test/simulation.test.js',
    note: 'This fact exists because a sentence in src/strategies.js said the universe "contains NO contract above 28c" — it was wrong. See Irregularity #31.'
  },

  /* ── Weather & gold expansion — captured 2026-09-18 ──────────────── */
  {
    id: 'V82', group: 'Markets & history', status: 'DOCUMENTED',
    fact: 'KXHIGHNY is the NYC daily high-temperature series, documented by Kalshi\u2019s own API quick-start',
    value: 'The quick-start fetches series KXHIGHNY, "Highest temperature in NYC today?" — this series tracks the highest temperature recorded in Central Park, New York on a given day.',
    url: 'https://docs.kalshi.com/getting_started/quick_start_market_data',
    usedIn: 'data/history/_ingest-request.json (intraday block hourly-weather-settled); src/strategies.js → VERIFIED_SERIES.KXHIGHNY'
  },
  {
    id: 'V83', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXHIGHNY brackets are 2\u00b0F bands plus a lower tail, and exactly one band settles YES per event',
    value: 'Captured market objects: KXHIGHNY-26SEP07-B77.5 = strike_type "between", floor 77, cap 78, title "Will the maximum temperature be 77-78\u00b0 on Sep 7, 2026?"; KXHIGHNY-26SEP01-T83 = strike_type "less", cap 83, subtitle "82\u00b0 or below". Across the 22 captured events, exactly one band or tail holds result "yes" per event (e.g. 26AUG21: B79.5 yes, B77.5 no, T77 no).',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP07-B77.5',
    capturedAt: '2026-09-18',
    usedIn: 'src/strategies.js → WeatherLadder_CheapBands thesis; src/backtest-replay.js real settlements'
  },
  {
    id: 'V84', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXHIGHNY settles on The Weather Company data for New York City (CLINYC), not on NOAA',
    value: 'rules_primary of the captured brackets: "If the maximum temperature recorded at New York City (CLINYC) for Sep 3, 2026, is less than 83\u00b0 fahrenheit according to The Weather Company, then the market resolves to Yes." (structure quoted from the captured market object of the same series).',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP07-B77.5',
    capturedAt: '2026-09-18',
    usedIn: 'The basis mismatch is flagged on ForecastEdge_Weather and in Irregularity #34 — the NWS archive is the SIGNAL, The Weather Company is the SETTLEMENT.'
  },
  {
    id: 'V85', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXHIGHNY brackets close at 05:00 UTC (1am ET) the day after the measured day',
    value: 'Captured close_time of the Aug 18 event brackets: 2026-08-19T05:00:00Z; hourly bars run from ~15:00Z two days before the measured day to 06:00Z after it (37-40 bars per bracket).',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26AUG18-B87.5',
    capturedAt: '2026-09-18',
    usedIn: 'src/backtest-replay.js → real settlements fire at the market\u2019s close_time'
  },
  {
    id: 'V86', group: 'Captured market data', status: 'CAPTURED',
    fact: 'KXGOLD15M markets are 15-minute gold up/down contracts that settle against a target price',
    value: 'Captured market object KXGOLD15M-26SEP162030-30: title "Gold price up in next 15 mins?", yes_sub_title "Target Price: $4,285.55", strike_type "greater_or_equal", floor_strike 4285.55, open_time 2026-09-17T00:15:00Z, close_time 2026-09-17T00:30:00Z, status finalized, result "no". 16 one-minute bars; their volume_fp sums to exactly the lifetime volume_fp 429,657.71.',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXGOLD15M-26SEP162030-30',
    capturedAt: '2026-09-18',
    usedIn: 'src/strategies.js → GoldBracket_EarlyLeader; the micro (1-minute) flight'
  },
  {
    id: 'V87', group: 'Markets & history', status: 'CAPTURED',
    fact: 'The NWS point API resolves Central Park to gridpoint OKX 34,45 with a daily forecast resource',
    value: 'GET api.weather.gov/points/40.7829,-73.9654 → properties.forecast = https://api.weather.gov/gridpoints/OKX/34,45/forecast, forecastZone NYZ072 (Manhattan), relativeLocation New York NY, timeZone America/New_York.',
    url: 'https://api.weather.gov/points/40.7829,-73.9654',
    capturedAt: '2026-09-18',
    usedIn: 'scripts/archive-forecasts.mjs → FORECAST_LOCATIONS (the point-in-time signal archive)'
  },
  {
    id: 'V88', group: 'Markets & history', status: 'CAPTURED',
    fact: 'NWS forecast periods carry the daily HIGH in \u00b0F on daytime periods with local timestamps',
    value: 'GET api.weather.gov/gridpoints/OKX/34,45/forecast → properties.periods[] e.g. {name "Friday", startTime "2026-09-18T06:00:00-04:00", isDaytime true, temperature 80, temperatureUnit "F", probabilityOfPrecipitation {value 2}}; night periods carry the low (isDaytime false, temperature 70).',
    url: 'https://api.weather.gov/gridpoints/OKX/34,45/forecast',
    capturedAt: '2026-09-18',
    usedIn: 'scripts/archive-forecasts.mjs → extractDailyHighs(); src/forecast-store.js'
  },
  {
    id: 'V89', group: 'Settlement', status: 'CAPTURED',
    fact: '39 of the 40 captured KXHIGHNY brackets are finalized with the exchange\u2019s own result — real settlements now exist in this repository',
    value: 'The 2026-09-18 ingest captured 40 KXHIGHNY brackets (22 events, Aug 18 → Sep 17): 39 status "finalized" with result yes/no, 1 active. Every KXGOLD15M contract captured (8) is finalized. The replay books these results as real $1.00/$0.00 settlements with no settlement fee.',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXHIGHNY&limit=200',
    doc: 'https://docs.kalshi.com/api-reference/market/get-markets',
    capturedAt: '2026-09-18',
    usedIn: 'src/backtest-replay.js → ReplayEngine.realSettlements; test 70 (settlement bookkeeping); test 79 (store reconciliation)'
  },
  {
    id: 'V90', group: 'Project rules', status: 'DERIVED',
    fact: 'A point-in-time forecast query can never see the future — enforced by code, tested',
    value: 'forecastHighAt(snapshots, date, ts) walks snapshots newest-first and returns the first with captured_at <= ts that lists the date; anything captured after ts is invisible. Test 73 asserts: before any capture → null; between captures → the older value; after both → the newer; unknown date → null.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/forecast-store.js',
    evidenceLabel: 'src/forecast-store.js → forecastHighAt()',
    derivation: 'Point-in-time rule of scripts/archive-forecasts.mjs; asserted by test 73 in test/simulation.test.js.',
    usedIn: 'src/strategy-runner.js → buildForecastSignalProvider(); src/strategies.js → ForecastEdge_Weather'
  },
  {
    id: 'V91', group: 'Fees & series', status: 'CAPTURED',
    fact: 'The exchange lists every series WITH its fee configuration in a single call',
    value: 'GET /series?include_volume=true returned 14,154 series on 2026-09-18T06:42:31Z, each with fee_type, fee_multiplier, category and lifetime volume_fp (data/discovered/series-fees.json)',
    url: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    capturedAt: '2026-09-18T06:42:31.141Z',
    usedIn: 'data/discovered/series-fees.json -> scripts/generate-fee-registry.mjs -> src/series-fee-registry.js -> seriesFeeConfig()',
    irregularity: '#36'
  },
  {
    id: 'V92', group: 'Fees & series', status: 'CAPTURED',
    fact: 'Fee multipliers in the tradeable universe are NOT all 1, and the maker flag is PER SERIES',
    value: 'MLB series (KXMLBGAME and family) 0.5 / quadratic_with_maker_fees; KXBTCY 0 / quadratic; maker fees apply on KXNFLGAME, KXMLBGAME, KXNBAGAME, KXWNBAGAME, KXNCAAFGAME, KXFEDDECISION, KXCPIYOY, KXINXY, KXNASDAQ100Y; every KXHIGH* weather series plus KXGOLD15M, KXBTC15M, KXETH15M, KXSOL15M and KXUFCFIGHT are plain quadratic, so a resting order there is FREE',
    url: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    capturedAt: '2026-09-18T06:42:31.141Z',
    usedIn: 'src/series-fee-registry.js (47 series) -> seriesFeeConfig() -> OrderBook.makerFeesApply',
    irregularity: '#37'
  },
  {
    id: 'V93', group: 'Fees & series', status: 'DOCUMENTED',
    fact: 'A resting order is charged ONLY on series in the Maker Fees section',
    value: '"Trading fees are only charged for orders that are immediately matched with orders sitting on the orderbook. Trading fees are not charged for orders placed that are not immediately matched and are instead left as resting orders on the orderbook unless they are included in our Maker Fees section."',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/kalshi-fees.js (quoted verbatim), OrderBook.makerFeesApply, ledger column feeRegime',
    irregularity: '#37'
  },
  {
    id: 'V94', group: 'Markets & history', status: 'CAPTURED',
    fact: 'How many weather-city series exist and how liquid each is',
    value: '54 KXHIGH* series, all fee_multiplier 1 / quadratic. Lifetime contracts: KXHIGHLAX 166.2M, KXHIGHNY 144.6M, KXHIGHCHI 110.1M, KXHIGHMIA 98.5M, KXHIGHAUS 77.2M, KXHIGHDEN 50.8M, KXHIGHTBOS 30.0M, KXHIGHTATL 27.6M, KXHIGHTSEA 25.6M, KXHIGHTPHX 24.8M',
    url: 'https://docs.kalshi.com/api-reference/market/get-series-list',
    capturedAt: '2026-09-18T06:42:31.141Z',
    usedIn: 'data/history/intraday/60m/ (194 markets across 20 series) - the universe of the weather entries in src/strategies.js'
  },
  {
    id: 'V95', group: 'Ingest & verification', status: 'OBSERVATION',
    fact: 'Kalshi rate-limits the settlement tracker mid-pass (HTTP 429)',
    value: 'The 2026-09-18 06:33Z settlement pass logged http_429 for 13 markets (KXINXY-26DEC31H1600-T4000, six KXNASDAQ100Y strikes, KXNCAAFGAME-26SEP26ILLOSU-OSU, KXNFLGAME-26SEP10SFLAR-SF, two KXUFCFIGHT, KXWNBAGAME-26AUG10CHISEA-CHI) after the candlestick passes had already made hundreds of requests in the same run',
    url: 'https://docs.kalshi.com/getting_started/rate_limits',
    capturedAt: '2026-09-18',
    usedIn: 'data/history/_last-run.log (committed with the data) - scripts/track-settlements.mjs',
    irregularity: '#38'
  },
  {
    id: 'V96', group: 'Markets & history', status: 'CAPTURED',
    fact: 'A series ticker that 404s is usually a PREFIX of real series, not a wrong URL',
    value: 'KXSP500, KXNVDA, KXAAPL and KXNDX each 404 as series, yet KXSP500ADDQ, KXNVDAMENTION, KXAAPLPRICEFOLD and KXNDXADDQ are real listed series in the same 2026-09-18 capture',
    url: 'https://docs.kalshi.com/api-reference/market/get-series',
    capturedAt: '2026-09-18T06:42:31.141Z',
    usedIn: 'src/strategies.js -> REJECTED_FABRICATED_TICKERS; scripts/generate-fee-registry.mjs prefix detection',
    irregularity: '#1'
  },
  {
    id: 'V97', group: 'Trade ledger', status: 'DERIVED',
    fact: 'Ledger v2 records the fee regime that produced every fill fee',
    value: 'feeRegime is one of taker_0.07, taker_zero, maker_0.0175, maker_free, settlement; the 2026-09-18 export counted 14,062 maker_free fills ($0.00), 9,645 maker_0.0175 fills ($16,279.65), 9,458 taker_0.07 fills ($22,730.39), 4,111 taker_zero fills ($0.00) and 629 settlements ($0.00)',
    url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf',
    usedIn: 'src/trade-ledger.js -> feeRegimeBreakdown(); data/ledger/summary.json; Trade Ledger tab'
  },
  {
    id: 'V98', group: 'Weather signals', status: 'CAPTURED',
    fact: 'All nine weather cities this repo trades have a VERIFIED NWS point identity',
    value: 'GET https://api.weather.gov/points/{lat},{lon} fetched live 2026-09-18 -> KXHIGHNY 40.7829,-73.9654 = OKX grid 34,45 / zone NYZ072; KXHIGHLAX 33.9425,-118.4081 = LOX 148,41 / CAZ366; KXHIGHCHI 41.7868,-87.7522 (Midway) = LOT 72,69 / ILZ104; KXHIGHMIA 25.7959,-80.287 = MFL 106,51 / FLZ074; KXHIGHAUS 30.3167,-97.7667 (Camp Mabry) = EWX 155,93 / TXZ192; KXHIGHDEN 39.8561,-104.6737 = BOU 74,66 / COZ040; KXHIGHPHIL 39.8729,-75.2437 = PHI 48,75 / PAZ070; KXHIGHTPHX 33.4342,-112.0116 = PSR 161,57 / AZZ543; KXHIGHTSEA 47.4502,-122.3088 = SEW 124,61 / WAZ316.',
    url: 'https://api.weather.gov/points/40.7829,-73.9654',
    capturedAt: '2026-09-18',
    usedIn: 'scripts/archive-forecasts.mjs -> FORECAST_LOCATIONS[].verifiedNote; test 90 asserts every note cites the point response and names the grid',
    irregularity: '#39'
  },
  {
    id: 'V99', group: 'Weather signals', status: 'CAPTURED',
    fact: 'Kalshi names the settlement station for every weather market and it is not always the city airport',
    value: 'Captured rules text: KXHIGHCHI settles on "the maximum temperature recorded at Chicago (CLIMDW)" - Midway, not O\'Hare; the full set is CLINYC, CLILAX, CLIMDW, CLIMIA, CLIAUS, CLIDEN, CLIPHL, CLIPHX, CLISEA, all "according to The Weather Company". The archive now follows the settlement station, and cites its exact rules string in verifiedNote.',
    url: 'https://api.weather.gov/points/41.7868,-87.7522',
    capturedAt: '2026-09-18',
    usedIn: 'scripts/archive-forecasts.mjs -> FORECAST_LOCATIONS[].settlementStation; IRREGULARITIES.md #39',
    irregularity: '#39'
  },
  {
    id: 'V100', group: 'Weather signals', status: 'CAPTURED',
    fact: 'Every captured forecast URL independently confirms the grid identity of the archived city',
    value: 'The nine stores captured on 2026-09-18 all point at the grid configured in scripts/archive-forecasts.mjs -> nwsGrid: NYC OKX 34,45; LAX LOX 148,41; CHI LOT 72,69; MIA MFL 106,51; AUS EWX 155,93; DEN BOU 74,66; PHL PHI 48,75; PHX PSR 161,57; SEA SEW 124,61. That cross-check is what exposed the null-resolved-identity bug (#40): the forecast URL had always encoded the right grid, so the identity was available all along and the nulls could only come from reading the wrong response body.',
    url: 'https://api.weather.gov/gridpoints/MFL/106,51/forecast',
    capturedAt: '2026-09-18',
    usedIn: 'scripts/archive-forecasts.mjs -> verifyStore() grid cross-check; test 90 asserts the shipped forecast_url encodes the configured grid',
    irregularity: '#40'
  },

  {
    id: 'V101', group: 'Research sources', status: 'CAPTURED',
    fact: 'The owner\'s own PriceKalshiHistorical project documents three reference strategies, and its README was read in full',
    value: 'The README of github.com/buffedlizard55-lab/PriceKalshiHistorical (fetched through the GitHub REST API on 2026-09-18 because the sandbox cannot open TLS to github.io) documents its backtest/strategy_example.py reference set verbatim: `mee` "|Σ mids -1|>2.5¢ on mutually_exclusive events → Buy cheapest / sell richest leg"; `fade` "|mid(t)-mid(t-5m)|≥5¢ + spread≤3 ticks → Fade the spike (buy dip)"; `mom` "mid(t)-mid(t-20) > 2¢ + tight spread → Follow momentum". It also states the fee model "0.07*p*(1-p)" and that the "Official API has no retroactive orderbook" — both independently corroborated by this repository\'s own captured fee schedule and book captures. The three strategies are recreated as MEE_BoardSum, FadeSpike_Micro and MomTick_Micro (RESEARCH_SOURCES R14).',
    url: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
    capturedAt: '2026-09-18',
    usedIn: 'src/research-sources.js R14; src/strategies.js MEE_BoardSum / FadeSpike_Micro / MomTick_Micro; signal-source ledger S13'
  },
  {
    id: 'V102', group: 'Research sources', status: 'CAPTURED',
    fact: 'The MasterSite directory was re-reviewed project by project a second time, and seven more market/sports projects were catalogued',
    value: 'The directory\'s own data export (MasterSite repo, data/sites.js, audit stamp 2026-09-17T21:47:46Z, fetched via the GitHub API on 2026-09-18) lists 38 verified sites. Every Markets & Trading Research and Sports Data & Scoreboards project not yet in the signal-source ledger was then inspected README-first through the GitHub API: PriceKalshiHistorical, MLB-Prediction-model-backtest, MLB-PBP, PFFNFL, ScheduleFreeTime, NFLPRED, StockPaperSim. Each became a ledger entry (S13–S19) with its verifiable claim, its Kalshi market class, and the exact blocker that keeps it untestable here — no invented testability either way.',
    url: 'https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js',
    capturedAt: '2026-09-18',
    usedIn: 'src/signal-sources.js S13–S19; Research tab of the site'
  },
  {
    id: 'V103', group: 'Pipeline', status: 'CAPTURED',
    fact: 'The request-9 ingest re-ran the universe the failed main run lost, and committed it through the new race-guard',
    value: 'GitHub Actions run 35377388737 (on-demand Kalshi history ingest, branch arena/01a0b59b-kalshipapersim, 2026-09-18) completed in 9m2s and committed "chore(history): append real Kalshi candlesticks 2026-09-18": daily bars for the 54 tracked markets, hourly bars through 2026-09-18T18:00:00Z (newest bar KXNBAGAME-26OCT20BOSDET-BOS), fresh order-book snapshots (KXHIGHNY alone now carries 280 captured ladders across its 40 brackets), and 284 tracked markets of which 221 are finalized with the exchange\'s own result. This is the data the failed run 35352002809 fetched and then discarded at its commit step (irregularity #41).',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35377388737',
    capturedAt: '2026-09-18',
    usedIn: 'data/history/ (the commit it pushed); IRREGULARITIES.md #41',
    irregularity: '#41'
  },
  {
    id: 'V104', group: 'Project rules', status: 'DERIVED',
    fact: 'Desk usernames are reserved even when the stored year is stale, and a desk session attaches to one-year memory',
    value: 'validateUsername() always unions STRATEGIES + DESK_RESERVED_USERNAMES (13 Live* handles, kept in sync with DESK_STRATEGIES by test 104). attachDeskSession() copies the compact results + FILL/SETTLE rows into competition-memory with kind:\'desk\'. Positions are still not carried across cut-offs.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/competition-memory.js',
    evidenceLabel: 'validateUsername() + DESK_RESERVED_USERNAMES + attachDeskSession() — reviewable in the repository',
    usedIn: 'src/competition-memory.js; server.js deskSession(); src/app.js static liveDesk(); tests 35, 87, 104',
    irregularity: '#45'
  },
  {
    id: 'V105', group: 'Research sources', status: 'CAPTURED',
    fact: 'The MasterSite directory card for THIS repository (KalshiPaperSim) is stale relative to the in-repo AUTO counts',
    value: 'MasterSite (fetched 2026-09-18) listed KalshiPaperSim as 53 facts / 19 irregularities / 10 strategies / 9 markets / 61 candles / 50 tests. The in-repo AUTO block at the same date is 97 facts / 43 irregularities / 41 strategies / 9 markets / 10,905 candles / 111 tests (plus the Live Desk). Same class of directory drift as StockPaperSim (#42), but for this project.',
    url: 'https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js',
    capturedAt: '2026-09-18',
    usedIn: 'IRREGULARITIES.md #44; README AUTO:COUNTS; src/verification-data.js',
    irregularity: '#44'
  },
  {
    id: 'V106', group: 'FDA signals', status: 'DOCUMENTED',
    fact: 'The official Drugs@FDA marketing-status vocabulary is a fixed four-value list, and the archive derives `approved` from it exactly',
    value: 'The Drugs@FDA Glossary of Terms (fda.gov) defines Marketing Status as: "Drug products in Drugs@FDA are identified as: Prescription, Over-the-counter, Discontinued, None (tentatively approved)". The Orange Book preface confirms the Prescription and OTC lists are the approved, marketed "Active Section" and that a tentative approval "is not an approved drug product". The archive therefore derives approved = any product marketing_status is exactly Prescription or Over-the-counter (case-insensitive); Discontinued (approved but not marketed, which per the same glossary also covers withdrawn approvals) and None (tentative) do NOT count, and unknown strings fail closed. Tests 115-117 assert the derivation, the point-in-time read rule and the forward-test abstention.',
    url: 'https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-glossary-terms',
    capturedAt: '2026-09-19',
    usedIn: 'scripts/archive-fda-signals.mjs APPROVED_MARKETING_STATUSES; src/fda-signal-store.js; src/strategies.js FDAEdge_DrugsFDA'
  },
  {
    id: 'V107', group: 'FDA signals', status: 'DOCUMENTED',
    fact: 'The FDA signal source is the official openFDA Drugs@FDA API at https://api.fda.gov — keyless and machine-readable, with a documented maximum page size of 99 — and every tracked KXFDA market is either mapped from its own rule text or deliberately excluded with a reason',
    value: "Endpoint GET https://api.fda.gov/drug/drugsfda.json?search=<query>&limit=99 (openFDA, FDA's own Drugs@FDA database; no key required). The base URL and the \"maximum limit allowed is 99\" cap are stated by the endpoint's official how-to page. Host history recorded honestly: the first deployed version pointed at api.open.fda.gov (ENOTFOUND from runners, irregularity #50) — corrected after the how-to page was read. Response shape (meta.disclaimer / meta.last_updated / meta.results.total; results[].application_number, sponsor_name, products[].marketing_status, submissions[].submission_status_date) verified against openFDA's published API documentation and two independent integrations of it on 2026-09-19. Subject queries are taken verbatim from each tracked market's own rules_primary: COMP360 psilocybin (sponsor \"compass pathways\"), retatrutide, camizestrant, cytisinicline, gedatolisib, midomafetamine. Two tracked FDA series are deliberately NOT covered, with reasons recorded in the archive script: KXFDAANNOUNCE (an FDA announcement, not an application record) and KXFDAAPPROVALPSYCHEDELIC (a composite). Basis mismatch published: the database record can lag the announcement the market resolves on.",
    url: 'https://open.fda.gov/apis/drug/drugsfda/how-to-use-the-endpoint/',
    capturedAt: '2026-09-19',
    usedIn: 'scripts/archive-fda-signals.mjs; .github/workflows/fda-signals.yml; src/fda-signal-store.js; strategy FDAEdge_DrugsFDA'
  },
  {
    id: 'V108', group: 'Project rules', status: 'DERIVED',
    fact: 'The Live Desk explicitly separates and tracks placed paper orders versus upcoming planned strategy setups with verified pricing, dates, and liquidity',
    value: 'runDeskSession() generates placedTrades[] (compiled from ORDER/FILL/REST/SETTLE records with VWAP, slippage, official quadratic fees, and source URLs) and upcomingTrades[] (compiled from strategy upcoming() setups on open event contracts with trigger types, price targets, and visible ladder depth). Both are exposed via server REST endpoints and static JSON exports.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js',
    evidenceLabel: 'buildPlacedTrades() and buildUpcomingTrades() in src/live-desk.js',
    usedIn: 'src/live-desk.js; server.js /api/live-desk/placed-trades & /upcoming-trades; src/app.js'
  },
  {
    id: 'V109', group: 'Research sources', status: 'CAPTURED',
    fact: 'Every one of the 13 MasterSite project names the owner asked about now maps to at least one roster or desk entry that trades the RELATED Kalshi series — but only two of those projects supply a signal that is actually read (weather via the NWS archive, MLB via the official MLB Stats API archive); the rest are price-only entries that carry the project\'s name, and "CEO" is not a project at all',
    value: 'Review of https://buffedlizard55-lab.github.io/MasterSite/ (S00–S19): CEO → no repository (S00, irregularity #32; CEOExit_Drift / LiveCEO_ChangeFav trade the CEO-change series price-only); weather → ForecastEdge_Weather / ForecastEdge_MultiCity / LiveWeather_ForecastEdge READ the point-in-time NWS archive; insider trades → InsiderFiling_Drift / LiveInsider_FilingFader are price-only (no Form 4 archive, S02); TheLeap → TheLeap_BreakoutRank / LiveTheLeap_Momentum are price-only (S03); NFL Injury / NFL scoreboard → SportsFavourite_Settle / LiveNFL_GameFavourite price-only (S04/S08); NBA Injury → LiveNBA_GameFavourite price-only (S05); FDA → FDAEdge_DrugsFDA READS the point-in-time Drugs@FDA archive, FDALadder_Dominance / LiveFDA_DecisionPremium price-only (S06); NCAA Scoreboard → LiveNCAA_GameFavourite / NCAAF_GameFavourite price-only (S07); MLB Scoreboard → MLBLead_InPlay / MLBTrail_Comeback READ the point-in-time official MLB game-state archive, LiveMLB_GameFavourite price-only (S09); Sports Pred → SportsLine_Momentum / SportsSteam_Fade / SportsUnderdog_Sweep price-only (S10); Gold → GoldBracket_EarlyLeader price-only (S11, the project is a ring directory); PinePilot → TrendRide_FullTilt / AlphaApex_Momentum / MeanRev_CheapBand (S12, TA archetypes). The 2026-09-19 wording of this fact ("all 13 … mapped to concrete, executable trading strategies with verified pricing") over-claimed; corrected 2026-09-20 (irregularity #53).',
    url: 'https://github.com/buffedlizard55-lab/MasterSite',
    capturedAt: '2026-09-20',
    usedIn: 'src/signal-sources.js; src/strategies.js; src/desk-strategies.js; README.md'
  },
  {
    id: 'V110', group: 'Research sources', status: 'DOCUMENTED',
    fact: 'Two research entries added on 2026-09-19 (R16 maker-grid tutorials, R17 KXFED "sniping" threads) point at SEARCH-RESULTS pages, not at documents; they are kept as labelled genre references, and the two strategies named after them are this repository\'s own price-only rules replayed with the official fee schedule',
    value: 'R16 url https://www.youtube.com/results?search_query=kalshi+market+maker+strategy and R17 url https://x.com/search?q=kalshi+fed+rate+cut are search pages; on 2026-09-20 neither recorded "quotation" could be traced to a specific video or post, so both entries carry capturedVia UNATTRIBUTED and their text is marked as a paraphrase of a genre (irregularity #53). GridMM_MultiTier now rests MAKER orders (its merged version described maker orders but sent taker buys) and FOMC_ProbabilitySniper buys any KXFED bracket asked 0.30–0.65 (it never identified a "modal strike" or read CME FedWatch). Both run against the real daily stores with the official quadratic maker/taker schedule and per-series multipliers (V-table), real volume bounds and captured depth.',
    url: 'https://docs.kalshi.com/getting_started/orderbook_responses',
    capturedAt: '2026-09-20',
    usedIn: 'src/research-sources.js R16/R17; src/strategies.js GridMM_MultiTier, FOMC_ProbabilitySniper'
  },
  {
    id: 'V111', group: 'MLB signals', status: 'CAPTURED',
    fact: 'The MLB signal source is the official MLB Stats API (statsapi.mlb.com, MLB Advanced Media) — keyless and machine-readable — and its schedule endpoint returns per-game status, linescore, team abbreviations and probable pitchers in the exact shape the archive parses',
    value: 'GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-09-19&hydrate=linescore,probablePitcher,team&fields=... fetched by hand on 2026-09-20: HTTP 200, copyright "Copyright 2026 MLB Advanced Media, L.P. Use of any content on this page acknowledges agreement to the terms posted here http://gdx.mlb.com/components/copyright.txt"; dates[0].date "2026-09-19"; first game gamePk 824545, gameDate "2026-09-19T18:10:00Z", officialDate "2026-09-19", status {abstractGameState "Final", codedGameState "F", detailedState "Final", statusCode "F"}, teams.away.team {id 116, abbreviation "DET"} score 1 isWinner false, teams.home.team {id 145, abbreviation "CWS"} score 3 isWinner true, probablePitcher away {id 695549, fullName "Jackson Jobe"} / home {id 680732, "Sean Burke"}, linescore {currentInning 9, inningState "Top", teams.home.runs 3, teams.away.runs 1}. A not-yet-started game (2026-09-20, gamePk 823570 PHI @ NYM 17:10Z) returned abstractGameState "Preview", detailedState "Scheduled" and an empty linescore (innings [], teams {home {}, away {}}). The `fields` filter returned exactly the named keys at any depth. GET /api/v1/teams?sportId=1&season=2026 returned all 30 clubs with their abbreviations (V113).',
    url: 'https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=2026-09-19&hydrate=linescore,probablePitcher,team',
    capturedAt: '2026-09-20',
    usedIn: 'scripts/archive-mlb-signals.mjs (parseGame / parseSchedule, the strict shape check); .github/workflows/mlb-signals.yml; src/mlb-signal-store.js'
  },
  {
    id: 'V112', group: 'MLB signals', status: 'DERIVED',
    fact: 'The MLB archive is point-in-time by construction: one state row per CHANGE with the capture instant it was first seen, every run instant listed per date, and the read side refuses any row captured after the decision time',
    value: 'data/mlb-signals/games/<officialDate>.json: games[gamePk].states[] rows carry captured_at (first seen) and last_seen_at; a row is appended only when (abstractGameState, detailedState, inning, inningState, runs.away, runs.home, winner) differs from the previous row; captures[] lists every run instant that read the date. src/mlb-signal-store.js#gameStateAtOrBefore(game, T) returns the newest row with captured_at <= T and reports observedAt = the newest captures[] instant <= T (never last_seen_at, which later runs advance) and staleSeconds = T − observedAt; the two MLB strategies abstain above 1800 s. Verified by the unit tests "the MLB archive collapses unchanged states…" and "the MLB signal store is point-in-time…".',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/mlb-signal-store.js',
    evidenceLabel: 'src/mlb-signal-store.js — gameStateAtOrBefore() and matchMlbGame()',
    capturedAt: '2026-09-20',
    usedIn: 'src/mlb-signal-store.js; src/strategy-runner.js buildMlbSignalProvider(); strategies MLBLead_InPlay / MLBTrail_Comeback'
  },
  {
    id: 'V113', group: 'MLB signals', status: 'CAPTURED',
    fact: 'KXMLBGAME tickers encode the first pitch in US Eastern time followed by the official MLB AWAY then HOME abbreviations, and the exchange result equals the official winner — verified on all 9 finalized KXMLBGAME contracts in the store (6 distinct games)',
    value: 'GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=2026-09-13&endDate=2026-09-17&hydrate=team (fetched 2026-09-20) against the stored market objects: KXMLBGAME-26SEP131920SDSF-SF ↔ gamePk 823171 gameDate 2026-09-13T23:20:00Z (= 19:20 EDT), away SD, home SF, SD won 6-4, exchange result no ✓; KXMLBGAME-26SEP142140MIAAZ-AZ ↔ 825034 2026-09-15T01:40Z, MIA @ AZ, AZ won 8-7, result yes ✓; KXMLBGAME-26SEP152140MIAAZ-AZ / -MIA ↔ 825030 2026-09-16T01:40Z, MIA won 4-2, results no / yes ✓; KXMLBGAME-26SEP161340NYYMIN-MIN / -NYY ↔ 823655 2026-09-16T17:40Z, MIN won 5-4, results yes / no ✓; KXMLBGAME-26SEP161840LADCIN-LAD ↔ 824467 2026-09-16T22:40Z, CIN won 6-2, result no ✓; KXMLBGAME-26SEP172138MINLAA-LAA / -MIN ↔ 823978 2026-09-18T01:38Z, LAA won 5-4, results yes / no ✓. Each market\'s own rules_primary agrees ("… originally scheduled for Sep 17, 2026 at 9:38 PM EDT"). All 12 distinct team codes seen in KXMLBGAME tickers (SD SF MIA AZ BAL NYM NYY MIN LAD CIN SEA LAA) are official abbreviations from GET /api/v1/teams?sportId=1&season=2026 (30 clubs; note AZ not ARI, ATH for the Athletics, CWS, KC, TB, WSH). src/mlb-signal-store.js#matchMlbGame therefore requires the ET instant (converted with America/New_York rules), the AWAY code and the HOME code to ALL equal the official game\'s before it returns a game.',
    url: 'https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026',
    capturedAt: '2026-09-20',
    usedIn: 'src/mlb-signal-store.js parseMlbGameTicker() / splitTeamPair() / easternToUtcSeconds() / matchMlbGame(); data/mlb-signals/_teams.json; unit test "every finalized KXMLBGAME contract in the store joins the official game…"'
  },
  {
    id: 'V114', group: 'Form 4 signals', status: 'CAPTURED',
    fact: 'The insider signal source is SEC EDGAR itself — official, keyless, machine-readable — and all three of its steps were verified live on 2026-09-21: the Atom filing list, the filing\'s own index.json, and the Form 4 ownership XML',
    value: 'GET https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom → HTTP 200, company "Tesla, Inc. (0001318605)", 10 <entry> rows all titled "4 - Statement of changes in beneficial ownership of securities", filed 2026-09-09 / 06-17 / 06-09 / 05-15 / 05-04 / 04-23 / 04-02 / 04-01 / 03-09 / 02-27, each <id> "urn:tag:sec.gov,2008:accession-number=…" and <updated> an acceptance instant (e.g. 2026-09-09T19:00:10-04:00). The SAME query for CIK 00019617 returned "JPMORGAN CHASE & CO (0000019617)" with 10 entries whose form is 424B2, not 4 — so the feed IGNORED both the type=4 filter and count=5, and the archive therefore parses every entry\'s form type and keeps only form 4 (publishing the forms it saw). GET https://www.sec.gov/Archives/edgar/data/1318605/000110465926106432/index.json → 4 items, exactly one .xml: tm2625055d1_4seq1.xml (8817 bytes) — the primary document is READ, never guessed. The submission text (…/0001104659-26-106432.txt) carries ACCEPTANCE-DATETIME 20260909190010, CONFORMED SUBMISSION TYPE 4, CONFORMED PERIOD OF REPORT 20260905, FILED AS OF DATE 20260909. Its ownership XML: schemaVersion X0609, documentType 4, issuerCik 0001318605 / issuerName "Tesla, Inc." / issuerTradingSymbol TSLA, rptOwnerCik 0001771340 "Taneja Vaibhav", isDirector 0 / isOfficer 1 / isTenPercentOwner 0 / isOther 0, officerTitle "Chief Financial Officer", aff10b5One 0, Table I rows [code M 6539 shares A, post 28578] and [code S 2605.75 @ 360.134 D, post 25972.25], a nonDerivativeHolding of 111000 shares indirect ("See Footnote"), and a Table II Restricted Stock Unit row (code M, 6539, D). That filing is archived verbatim as the parser fixture (data/form4-signals/fixtures/, with its truncation documented in _PROVENANCE.md). Element names are the SEC\'s own (sec.gov/info/edgar/ownershipxmltechspec-v3.pdf).',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom',
    capturedAt: '2026-09-21',
    usedIn: 'scripts/archive-form4-signals.mjs (parseAtomFeed / primaryXmlFromIndex / parseOwnershipDocument); .github/workflows/form4-signals.yml; data/form4-signals/fixtures/0001104659-26-106432.xml; tests 127–129'
  },
  {
    id: 'V115', group: 'Form 4 signals', status: 'DERIVED',
    fact: 'The Form 4 archive is point-in-time on EDGAR\'s OWN acceptance instant, which is what lets it answer a PAST bar — unlike the forecast, FDA and MLB archives, which can only run forward from their first capture',
    value: 'A filing does not decay: a Form 4 accepted 2026-04-23T20:08:52Z was on EDGAR from that instant on. Each record therefore stores acceptedAt (EDGAR\'s instant, from the feed entry\'s <updated>, equal to the submission\'s ACCEPTANCE-DATETIME header) AND first_seen_at (the instant this repository captured it); src/form4-signal-store.js#filingsAtOrBefore keeps only acceptedAt <= T and insiderStateAtOrBefore derives the window facts from those, publishing observedAt (the newest capture at or before T) and archiveStaleSeconds — null, not 0, when the archive had not yet looked at that instant. The stated assumption (EDGAR published at acceptance; latency not measured by this repository) is printed in every store file and returned by form4Assumption(). Derived facts a strategy may read: filingsEver / filingsInWindow / ceoFilings (reporting owner isOfficer AND officerTitle says CEO) / openMarket net shares and dollars (SEC codes P and S ONLY — awards, vestings, gifts and tax withholdings are archived verbatim but never move the number) / codesInWindow. Refusals, all unit-tested: a filing accepted after T is invisible; a document whose <documentType> is not 4 throws; a document whose issuer trading symbol is not the tracked symbol throws; a row with no <transactionCode> throws; an issuer with nothing accepted by T answers null.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/form4-signal-store.js',
    evidenceLabel: 'src/form4-signal-store.js — filingsAtOrBefore() / insiderStateAtOrBefore()',
    capturedAt: '2026-09-21',
    usedIn: 'src/form4-signal-store.js; src/strategy-runner.js buildForm4SignalProvider() / form4JoinReport(); src/live-desk.js buildDeskSignalsAsync().form4; tests 127–130'
  },
  {
    id: 'V116', group: 'Form 4 signals', status: 'DERIVED',
    fact: 'The issuer↔contract mapping is taken from each tracked market\'s OWN rules_primary text, and the store already holds real daily bars for all of them — including one contract the exchange finalized with its own result',
    value: 'data/history/: TESLACEOCHANGE-26 "If Elon Musk is no longer CEO of Tesla by Dec 31, 2026…" (400 daily bars, period_interval 1440, 24 captured ladders, active, close 2027-01-01T04:59Z); KXTESLACEOCHANGE-26 same rules, status inactive; JPMCEOCHANGE-27 "If Jamie Dimon is no longer CEO of JPMorgan Chase by Jan 1, 2027…" (285 daily bars, 24 ladders, active); KXAAPLCEOCHANGE-26 "If Tim Cook is no longer CEO of Apple before Jan 1, 2027…" — status finalized, the exchange\'s own result "yes", 289 daily bars, 14 ladders, close_time 2026-09-03T17:48:18Z. The archive script tracks TSLA / JPM / AAPL by SYMBOL (never a hard-coded CIK) and requires each filing\'s own <issuerTradingSymbol> to equal the tracked symbol, so a wrong EDGAR resolution fails loudly. KXOPENAICEOCHANGE-26 is deliberately excluded with the reason published: OpenAI is a private company, so it has no Section 16 reporting persons and EDGAR holds no Form 4 for it (irregularity #57). Because EDGAR publishes history, InsiderFlow_Form4 is a BACKTEST on these real bars, not a forward test — bounded by EDGAR\'s feed page size (40 entries per run per issuer), which is months for Tesla and weeks for a filer with many insiders.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-form4-signals.mjs',
    evidenceLabel: 'scripts/archive-form4-signals.mjs TRACKED_ISSUERS / EXCLUDED_ISSUERS (rules_primary quoted verbatim)',
    capturedAt: '2026-09-21',
    usedIn: 'scripts/archive-form4-signals.mjs; src/form4-signal-data.js (generated); strategies InsiderFlow_Form4 / LiveInsider_Form4Flow'
  },
  {
    id: 'V117', group: 'Process', status: 'DERIVED',
    fact: 'On the branch point of this session the whole test suite failed to parse, and one more test was silently asserting on a Promise — so no test had actually been running on main',
    value: 'Reproducible in this repository with `npm test`. node --test test/simulation.test.js at commit e86cb9b: "SyntaxError: Unexpected reserved word" at test/simulation.test.js:3672 — test 100 awaited runDeskSession() inside a non-async callback, which kills the file at import time, so all 134 tests reported as one failure and none executed. After making the callback async, one test still failed: test 118 called the ASYNC buildDeskReport() without await and asserted report.ok on the resulting Promise (expected true, got undefined); the same call awaited builds cleanly (84 records). Both defects came in with PR #17\'s test code (irregularity #56). Fixed on this branch; the suite then ran 134/134 green before the four new Form 4 tests were added.',
    url: null,
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js',
    evidenceLabel: 'test/simulation.test.js — tests 100 and 118',
    capturedAt: '2026-09-21',
    usedIn: 'test/simulation.test.js; IRREGULARITIES.md #56'
  },
  {
    id: 'V118',
    group: 'Signals',
    status: 'CAPTURED',
    fact: 'The ESPN public JSON per-event scoreboard and injuries shapes are pinned by live captures, parsed strictly (a missing key throws), stored one row per CHANGE with every capture instant kept, and joined to Kalshi tickers only through evidence - and ESPN is labelled TRUSTED BUT NOT OFFICIAL everywhere it travels',
    value: 'Fixtures captured 2026-09-21 (data/espn-signals/fixtures/, each file with _provenance): scoreboard events[0] id 401872947 NYG @ LAR, date 2026-09-22T00:15Z, ET date 2026-09-21, competitor scores arrive as numeric STRINGS ("0"), status.type.state "pre" / STATUS_SCHEDULED / completed false / period 0 / clock 0; injuries envelope shared across leagues with each player status verbatim ("Out"). The join = ET date + away code + home code; the Kalshi-to-ESPN code map is built ONLY from each contract own rules_primary text (pair+date+yes-code ticker grammar, e.g. KXNCAAFGAME-26SEP26CARKFSU-FSU) plus captured ESPN team tables, with qualifier-letter disambiguation (New York G vs New York J) and published UNMATCHED/AMBIGUOUS reasons - an unmapped ticker is never traded. Reads are point-in-time: rows captured after the decision are invisible and staleness comes from the capture list, never last_seen_at.',
    url: 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=20260921',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/espn-signals/fixtures/_PROVENANCE.md',
    evidenceLabel: 'data/espn-signals/fixtures/_PROVENANCE.md + the two fixture files (verbatim captures) + scripts/archive-espn-signals.mjs',
    capturedAt: '2026-09-21',
    usedIn: 'tests 131-133; strategies NFLInjury_AvailGap, NBAInjury_AvailGap, NFLState_4Q_Leader, NCAAFState_4Q_Leader, NBAState_FinalMinutes; src/espn-signal-store.js; .github/workflows/espn-signals.yml'
  },
  {
    id: 'V119',
    group: 'Signals',
    status: 'DERIVED',
    fact: 'The S14 pre-game model hook is point-in-time and honest about what the model can and cannot do today: a row is a pre-game signal only if it was captured BEFORE first pitch, and the model CLI still has no predict command',
    value: 'data/mlb-pregame/predictions/<ET-date>.json rows are {capturedAt, gamePk, firstPitchAt, pHome}; TIMELY iff capturedAt < firstPitchAt - a later row for the same game is measurement data and can never answer a pre-game bar (preGamePredictionAtOrBefore returns timely rows only). The gamePk join is the official MLB game id via the same ticker join fact V113 verifies. The owner model repository (MLB-Prediction-model-backtest, mlb_predict/cli.py) exposes collect / ingest-page / ingest-scores / build-dataset / build-pitcher-features / backtest / demo - NO predict command (verified 2026-09-21 by reading the CLI), so scripts/archive-mlb-pregame.mjs --from-walkforward is the data path (firstPitchAt bound from data/mlb-signals/games, or REJECT NO_OFFICIAL_FIRST_PITCH_FOR_GAMEPK) until the model grows one. MLBPreGame_ModelEdge is UNTESTED_ON_THIS_DATASET until timely snapshots exist.',
    url: 'https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-mlb-pregame.mjs',
    evidenceLabel: 'scripts/archive-mlb-pregame.mjs + src/mlb-pregame-store.js + .github/workflows/mlb-pregame-signals.yml (its plan names the missing predict explicitly)',
    capturedAt: '2026-09-21',
    usedIn: 'strategy MLBPreGame_ModelEdge; tests 134-135; desk provider signals.mlbPregame'
  },
  {
    id: 'V120',
    group: 'Capture',
    status: 'CAPTURED',
    fact: 'Every game-series order book stored before 2026-09-21 was captured AFTER settlement and is empty (0 levels) - the capture timing, not the capture code, was wrong, and the fix is scheduled',
    value: 'All 28 KXMLBGAME history files (2026-09-19/20) hold empty orderbooks because the 06:15/16:40 UTC daily-history crons run after games end and the exchange returns an empty book then; generate-desk-module.mjs drops 0-level ladders, so the desk kept 0 tradeable game-series slots. Fix shipped 2026-09-21: daily-history.yml gains 00:30 + 02:30 UTC with_books crons inside live game windows (the WITH_BOOKS cron case list updated) and data/history/_ingest-request.json gains a minute-nfl-game-lines block (period 1, KXNFLGAME, 3 days, 480 max bars, 500 min volume, 24 markets, with_books, 300ms) alongside minute-mlb-game-lines - 11 ingest blocks now.',
    url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNFLGAME-26SEP21NYGLAR-LAR/orderbook',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.github/workflows/daily-history.yml',
    evidenceLabel: '.github/workflows/daily-history.yml (crons + WITH_BOOKS case) + data/history/_ingest-request.json + the 28 empty-book files',
    capturedAt: '2026-09-21',
    usedIn: 'desk game-series reserves; RESEARCH_GAPS (1-minute game bars); tests 124-125 conventions'
  },
  {
    id: 'V121',
    group: 'Strategy sources',
    status: 'DOCUMENTED',
    fact: 'The four competition sites are reverse-engineered with their own words and the social/longform pass landed R19-R27 with verbatim claims - including one source that refutes its own headline',
    value: 'R25 TradingView The Leap: champions disclosed as exactly two numbers (Net profit +155.95% / Profitable trades 65%, July 2026 futures; +271.78%/77% crypto) plus a strategy write-up - the disclosure format our standings mirror. R26 Trade-Ideas PM Challenge leaderboard schema is exactly "Rank | User | Total Profit | Open Profit | Close Profit | Total Trades | Open Trades | Closed Trades | Account Value | Average Profit/Trade" - adopted as the trade review schema (V122). R27 Candlecharts Showdown: "$50,000 paper account ... Document your plan, execution, and lessons so every contest trade becomes part of a more repeatable process" - the journal discipline our per-fill reason strings implement. R24 kalshi.com: market URLs carry tickers WITHOUT the yes-code suffix (kxnflgame-26sep21nyglar vs API KXNFLGAME-26SEP21NYGLAR-LAR) - the official-link join rule; the board showed the NYG@LAR market at 29%/71% ($38.6M vol) as CONTEXT ONLY. R19-R23 (reddit/medium): shock-timing parameters with the author-own "It does not work" post-mortem; resting-order 5-15c walls; 1c-to-10c longshot packages; the 30-70 swing-range rule; the academic "buying No on overpriced longshots is the single highest-edge strategy in the literature" frame. Three recreations cite exact source numbers: SwingRange_Scalp (R22), OrderbookWall_3Rung (R20), LongshotScalp_9x (R20).',
    url: 'https://www.tradingview.com/the-leap/',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/research-sources.js',
    evidenceLabel: 'src/research-sources.js R19-R27 (claim = verbatim quotes, taken = what was adopted, caveat = what was refused)',
    capturedAt: '2026-09-21',
    usedIn: 'strategies SwingRange_Scalp, OrderbookWall_3Rung, LongshotScalp_9x; scripts/trades-review.mjs (R26 schema); README standings disclosure'
  },
  {
    id: 'V122',
    group: 'Strategy sources',
    status: 'DERIVED',
    fact: 'Every placed trade and every upcoming trade now has one readable review and one unified CSV, in the R26 schema, with cells that have no backing field marked instead of guessed',
    value: 'node scripts/trades-review.mjs reads only the verified stores (data/ledger/summary.json + ledger-20260917.json, data/reports/live-desk-placed-trades.json (28 orders), live-desk-upcoming-trades.json (31 plans)) and writes data/ledger/unified-trades.csv (20,059 rows: every replay round trip + every desk order + every desk plan, with fee, slippage, depth at capture and verbatim explain strings) and data/reports/trades-review-2026-09-21.md (per-username scoreboard in the Trade-Ideas schema, every desk trade verbatim, every upcoming trade with its trigger and rationale). Open Profit cells read "not marked in this store" because the stores settle only - no mark is invented. Every price row keeps its capture instant (depthCapturedAt / ladderCaptureAt) and the desk rows keep their Kalshi API ladderSourceUrl for manual review.',
    url: 'https://trade-ideas.com/stock-trading-competition/',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/trades-review-2026-09-21.md',
    evidenceLabel: 'scripts/trades-review.mjs + data/reports/trades-review-2026-09-21.md + data/ledger/unified-trades.csv',
    capturedAt: '2026-09-21',
    usedIn: 'request #4 (track every trade); README; the Pages site data docs'
  },
  {
    id: 'V123',
    group: 'Capture',
    status: 'DERIVED',
    fact: 'ROADMAP Next #1 is answered OFFLINE by a committed audit: none of the store\'s 151 game-series stores holds a ladder captured inside a verified event window, and the audit refuses to call its 1031 non-empty tradeable-window ladders "in-play"',
    value: 'scripts/verify-game-window.mjs reads only committed files (no network): 968 store files walked, 151 game-series stores / 100 distinct contracts (KXBUNDESLIGAGAME 3, KXMLBGAME 43, KXNBAGAME 18, KXNCAAFGAME 41, KXNFLGAME 10, KXNHLGAME 28, KXWNBAGAME 8), 1544 captured ladders, 1031 non-empty. Phases: PRE_OPEN 0, TRADEABLE_PRE_EVENT 0, IN_PLAY 0, TRADEABLE_POST_EVENT 0, TRADEABLE_EVENT_UNVERIFIED 1031, POST_CLOSE 513 (0 of those non-empty). Store verdicts: POST_CLOSE_ONLY 70, TRADEABLE_LADDER_EVENT_UNVERIFIED 81. The tradeable window is the market object\'s own open_time → close_time; occurrence_datetime equals expected_expiration_time on 144 of the 151 stores, differs on 7, and equals close_time on none — so the event window comes only from data/mlb-signals/ (official gamePk, scheduled first pitch, observed Final) or data/espn-signals/ (observed pre/in/post transitions; ESPN publishes NO start time and stays labelled TRUSTED BUT NOT OFFICIAL), each evaluated point-in-time at the ladder\'s own instant. Joins: KXMLBGAME 7 of 43 stores join OFFICIAL_MLB_SCHEDULE and 36 do not (25 NO_ARCHIVED_GAME, 11 TEAMS_MATCH_BUT_TIME_DIFFERS); KXNBAGAME 18 NO_ARCHIVED_EVENT; KXNCAAFGAME 41 CODE_UNMAPPED_TO_ESPN; KXNFLGAME 7 NO_ARCHIVED_EVENT + 3 TEAM_CODE_NOT_IN_MAP; KXNHLGAME 28 NO_ARCHIVED_EVENT; KXWNBAGAME 5 CODE_UNMAPPED_TO_ESPN + 2 NO_ARCHIVED_EVENT + 1 TEAM_CODE_NOT_IN_MAP; KXBUNDESLIGAGAME 3 NO_EVENT_SOURCE_FOR_SERIES. Desk reserves explained by name: KXNBAGAME 6 of 6 kept, KXNCAAFGAME 4 of 4 kept (25 open contracts with usable ladders), KXNHLGAME 0 of 4 with 2 OPEN contracts of 10 usable ladders each absent from the module, KXMLBGAME 0 of 6 and KXNFLGAME 0 of 4 because every contract is already finalized.',
    url: 'https://docs.kalshi.com/getting_started/orderbook_responses',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/game-window-captures.json',
    evidenceLabel: 'scripts/verify-game-window.mjs + data/reports/game-window-captures.json (generatedAt 2026-09-22T07:02:38.685Z, offline: true)',
    capturedAt: '2026-09-22',
    usedIn: 'ROADMAP Next #1; irregularities #60 and #65; the desk game-series reserves; test 138'
  },
  {
    id: 'V124',
    group: 'Pipeline',
    status: 'OBSERVATION',
    fact: 'Three 2026-09-22 workflow runs captured data and then died at their commit step, and GitHub\'s own concurrency docs explain both the cause and the fix — `queue: single` cancels a pending run, `queue: max` queues up to 100',
    value: 'Verified from the GitHub API. Weather run 35676454906 (created 2026-09-22T01:37:38Z, group data-pipeline-main): "Capture the point-in-time NWS forecast", "Audit the forecast store (no network)" and "Regenerate the browser-safe modules and the Pages bundle" all SUCCESS, "Commit the new snapshots" FAILURE — while the MLB-signals run created in the same second (35676455303, its own group) succeeded and pushed 07d329875 at 01:38:31Z. mlb-pregame runs 35677025646 (01:46:38Z) and 35677673624 (01:57:22Z) failed identically at "Commit the measurement rows + status" after a fully successful capture/audit/regenerate chain; 35677673624 was created one second before PR #22 merged (6213ae348, 01:57:18Z). Consequence on the tree: all nine data/forecasts/*.json stores still end at captured_at 2026-09-21T22:36:56.809Z (last forecast commit 9a3d93b73, 2026-09-21T22:37:51Z) and data/mlb-pregame/predictions/ holds 0 files. The four 20-minute archives had been kept OUT of the shared group on purpose, because the documented default keeps ONE pending run per group and cancels the previous one; the documented `queue: max` (up to 100 pending, FIFO, incompatible with cancel-in-progress: true) removes that trade-off. All eight pushing workflows now share group data-pipeline-${{ github.ref }} with queue: max and cancel-in-progress: false, each quoting the documentation, and scripts/push-with-race-guard.sh retries 6 times (PUSH_ATTEMPTS) with a jittered backoff (PUSH_BACKOFF_SCALE for tests) and stages `git add -A` after a regeneration. Verified locally: test/workflow-race-guard.sh 34/34 checks, test 125 reads the eight YAML files, test 140 reads the guard.',
    url: 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35676454906',
    evidenceLabel: 'Actions runs 35676454906 (weather) / 35677025646 + 35677673624 (mlb-pregame) step conclusions, commits 07d329875 and 6213ae348, and data/forecasts/*.json on main',
    capturedAt: '2026-09-22',
    usedIn: 'irregularity #63; ROADMAP Next #9; tests 125 and 140; the concurrency block of all eight .github/workflows/*.yml'
  },
  {
    id: 'V125',
    group: 'Capture',
    status: 'DERIVED',
    fact: 'The desk module publishes its own capture bound — coverage.captureEviction — and decomposes it exactly; since 2026-09-22 the season-side part is CLOSED by ROUND ANCHORS, so a round the store can host is never evicted from the module',
    value: 'From src/desk-data.js after the 2026-09-22 (second) regeneration: storeLadderCaptures 13865 (storeNonEmptyLadders 8145 + storeEmptyLadders 5720) across 21 twenty-minute batches; laddersBeforeCaptureSelection 8145 → evictedByCaptureCap 6188 → laddersAfterCaptureSelection 1957; evictedByMarketCap 960 across marketsDroppedByCap 103; moduleLadderCaptures 997→1187 after ROUND ANCHORS added 190 anchor captures and 0 anchor markets on top of the cap. 8145 − 6188 = 1957 and 1957 − 960 = 997, so the two bounds still account for every ladder the classing drops. The round-stamp side is now decomposed: seasonRoundStamps 21, seasonRoundStampsHostableByModule 21, seasonRoundStampsEvicted 0, while seasonRoundStampsExactInstantInModule is 14 (7 stamps are captured at an instant whose book is empty — the strict measure can never reach 21 and is published beside the window measure for exactly that reason). storeBatchesRepresentedInModule 21, storeBatchesNotRepresented 0, captureInstantsEvictedFromModule 12677 of which 7148 non-empty, roundAnchors.batchesWithAnchor 21/21, anchorMarketsKeptOnTopOfCap 0 (every anchor market was already kept; the anchors exist to pin the INSTANT, not the market). Tests 139 and 141 recompute both sides independently from data/history/**.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/generate-desk-module.mjs',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-data.js',
    evidenceLabel: 'src/desk-data.js coverage.captureEviction + scripts/generate-desk-module.mjs selectCaptures()/ROUND ANCHORS + tests 139 and 141',
    capturedAt: '2026-09-22',
    usedIn: 'irregularities #64 and #66; the desk-season reproducibility note; ROADMAP Next #10; tests 139 and 141'
  },
  {
    id: 'V126',
    group: 'Trade ledger',
    status: 'DERIVED',
    fact: 'ROADMAP Next #6 is done: the ledger, the live desk, the desk season and the trade review were all re-run against the merged tree and every audit passes',
    value: 'data/ledger/summary.json generatedAt 2026-09-22T07:01:17.325Z, verification.ok true on 4 checks (every fill re-derived from the engine trade log field for field, every round trip re-derived by FIFO lot matching, every fill carries a verified market period, realized PnL per strategy reconciles within $0.02); totals 52 strategies / 60,646 fills / 31,413 round trips over flights daily=31, hourly=19, micro=13, with the store bounded and every drop recorded in trims[] (fills kept 40,000 dropped 20,646 via --max-fills=40000; roundTrips kept 20,000 dropped 11,413 via --max-trips=20000). data/ledger/unified-trades.csv 20,064 rows and data/reports/trades-review-2026-09-22.md regenerated from those stores. data/reports/live-desk.json generatedAt 2026-09-22T07:00:12.696Z, audit.ok true, 13 checks pass; totals 29 orders / 28 fills / 0 rejects / 1 cancel / 28 marks / fees $2,367.96629 / contracts 519,562.19 / slippage cost $3,279.082753 / unfilled 158,984.81 / 29 placed trades / 35 upcoming plans; top desk result LiveFDA_DecisionPremium +0.056749% on 3 fills. data/reports/desk-season.json generatedAt 2026-09-22T07:00:31.472Z, audit.ok true, 27 checks pass; 5 rounds / 12 orders / 12 fills / 48 marks / 7,259 contracts / fees $0.4552 / 4,329 events walked; best SeasonIndex_CarryHold +0.007392% (equity $100,007.39151, 1 fill, 207 contracts of KXBTCY-27JAN0100-B77500 "no" at cost $178.28749, slippage $0.060444, attributionOk true), worst SeasonBoardSum_Ladder −0.185761% on 10 fills over 3 rounds.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/export-ledger.mjs',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/trades-review-2026-09-22.md',
    evidenceLabel: 'data/ledger/summary.json + data/ledger/unified-trades.csv (20,064 rows) + data/reports/{live-desk,desk-season,trades-review-2026-09-22}',
    capturedAt: '2026-09-22',
    usedIn: 'ROADMAP Next #6 (done); request #4 (track every strategy\'s trades); the Pages site data docs'
  },

  {
    id: 'V127',
    group: 'Capture',
    status: 'DERIVED',
    fact: 'One ticker carries several point-in-time store files whose status legitimately disagrees; src/market-status.js resolves it once (settlement is monotone, otherwise newest wins) and every caller that called a single file\'s status "the status" was wrong on the committed store',
    value: 'The store holds 1045 files for 663 tickers. 22 tickers have files that disagree: the daily store (newest, e.g. KXNHLGAME-26SEP19VGKLA-VGK market_captured_at 2026-09-22T19:56:00.271Z, status finalized, result yes) against the 1-minute store (2026-09-20T03:39:00.150Z, status active, no result) — the 1m photograph was taken while the game was live, 52 minutes before the contract\'s own close_time 2026-09-20T04:31:47Z. Resolution under market-status-v1: 527 tickers settled, 135 open, 1 unknown; 201 tickers have more than one file; 42 file-photographs disagree with the resolution; 0 irreconcilable conflicts. The two former defects: scripts/generate-desk-module.mjs merged files in readdir order (daily first, intraday last) so an older active photograph overwrote the settled status while the settled result was kept, leaving 3 contradictory records in src/desk-data.js (KXNFLSPREAD-26SEP20MIASF-SF14 result yes; KXNCAAFSPREAD-26SEP19TNSTFAMU-FAMU5 result no; KXNCAAFSPREAD-26SEP19ALCNUNA-UNA15 result yes — the last two held BOTH KXNCAAFSPREAD reserve slots); scripts/verify-game-window.mjs decided open/settled per file and published 2 settled KXNHLGAME contracts as open tradeable slots. After the fix: 0 contradictory records, and the audit\'s KXNHLGAME reserve reads openLadderContracts 0 with settledContractsWithAStaleOpenFile 2 naming the 1m files.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/market-status.js',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/game-window-captures.json',
    evidenceLabel: 'src/market-status.js MARKET_STATUS_RULE + src/desk-data.js coverage.statusResolution + data/reports/game-window-captures.json statusReconciliation + test 141',
    capturedAt: '2026-09-22',
    usedIn: 'irregularity #66; the desk module\'s statusEvidence; the game-window audit\'s statusReconciliation; test 141'
  },
  {
    id: 'V128',
    group: 'Desk',
    status: 'DERIVED',
    fact: 'ROUND ANCHORS keep one open-board capture per real capture batch on top of the market cap, so the desk season re-walks every round the store can host instead of re-reporting fewer rounds each regeneration',
    value: 'Measured before the rule (2026-09-22, same store): 21 capture batches, 14 round stamps evicted from the module, and the season re-reported 5 rounds / 12 fills / 4329 walked events where the 2026-09-21 season had measured 9 rounds / 17 fills / 6448 events. Of those 14, seven had NO non-empty ladder at the stamp (the batch closed on empty post-close books) and seven were a pure module bound — the store held non-empty ladders inside those batches, from markets the module even kept, but the per-market capture window kept a different instant. After the rule: 21/21 batches carry a module capture in their window, seasonRoundStampsEvicted 0, and node scripts/run-desk-season.mjs reports 12 rounds (the CLI\'s --max-rounds default thins 21 candidates evenly, keeping first and last), 34 fills of which 22 are carried maker fills, 0 real settlements, 7771 real events walked, and 27/27 season checks plus 13/13 desk checks passing.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/generate-desk-module.mjs',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/desk-season.json',
    evidenceLabel: 'src/desk-data.js coverage.captureEviction.roundAnchors + data/reports/desk-season.json summary/audit + test 139',
    capturedAt: '2026-09-22',
    usedIn: 'ROADMAP Next #10 (closed); irregularities #64/#66; tests 139 and 141'
  },

  {
    id: 'V129',
    group: 'Strategies',
    status: 'DERIVED',
    fact: 'A rule that a third-party social post reported as the survivor of 500 weather bots is re-implemented here mechanically on official prices, and the honest outcome of doing so is published',
    value: 'The source is r/PredictionsMarkets "I backtested 500 Weather Kalshi Bots" (RESEARCH_SOURCES R06, third-party): the best bot "waited for a forecast high above 77 degrees, a YES price below 42 cents, and a reasonably tight spread" and "if the forecast cooled, it got out", while the MEDIAN of the 500 was -41.61%. The owner\'s Kalshi lab (MasterSite Commodities, scripts/forward_strategies.py -> entry_heat_confirm) re-creates it with the literals 77.0 / 0.42 / 0.08 and labels it forward-recreation; this repository now carries the same three literals in two places (HeatConfirm_500Bots, hourly, KXHIGHNY; LiveHeatConfirm_Weather, the Live Desk, open KXHIGH* brackets with captured ladders). MEASURED on this build: the roster twin evaluated 1782 hourly bars of which 187 carried a point-in-time NWS snapshot, 27 had a forecast above the 77F gate, and 0 of those forecasts fell inside a bracket this replay universe captured - so the strategy has 0 fills and the audit publishes verdict UNTESTED_ON_THIS_DATASET with that reason; the desk entrant has 0 fills because 0 of the 106 desk contracts match KXHIGH* at this cut-off. A 0-trade verdict here is the exchange\'s own data refusing the trade, not a missing signal.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/strategies.js',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/Commodities/blob/main/scripts/forward_strategies.py',
    evidenceLabel: 'src/strategies.js HeatConfirm_500Bots (the three literals) + src/desk-strategies.js LiveHeatConfirm_Weather + data/reports/flights.json postMortems. The third-party post itself is cited in RESEARCH_SOURCES R06 and in the strategy\'s designSourceUrl — a social post is a DISCOVERY, never a price source, so it is not the URL of a Strategies fact.',
    capturedAt: '2026-09-22',
    usedIn: 'MasterSite signal-source ledger S20; ROADMAP Shipped #48; RESEARCH_SOURCES R06'
  },
  {
    id: 'V130',
    group: 'Strategies',
    status: 'CAPTURED',
    fact: 'The MasterSite directory publishes 52 of the owner account\'s 53 public repositories, and all 52 are now catalogued in the signal-source ledger, including a live sibling competition that scores daily on OPEN Kalshi election markets',
    value: 'Directory export (MasterSite data/sites.js, generated 2026-09-21T23:07:59Z): counts {sites: 52, apps: 46, stubs: 6, pagesBuilt: 52, publicRepos: 53, excluded: ["ProjX"]}, categories Travel & Korea Trip 11, SF Local Guides 6, Markets & Trading Research 9, Sports Data & Scoreboards 18, Directory & Meta 3, plus one each of Elections / Science & ML / Health / Social / Gaming. GET /repos/buffedlizard55-lab/<repo> on 2026-09-22 confirms every newly catalogued repository exists with Pages built (e.g. Commodities 3607 KB pushed 2026-09-22T23:02:53Z; Elections 25679 KB pushed 2026-09-22T18:02:44Z). The Elections README (read via the contents API) announces a running contest: "12 entrants, unique usernames, unique theses, $100,000 each, scored every day on OPEN Kalshi election markets" - i.e. a live instance, in the owner\'s own account, of the format this platform implements. The ledger grew from 20 entries (S00-S19) to 35 (S00-S34) in this pass and every strategy username it references resolves to a real roster or desk entry.',
    url: 'https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/signal-sources.js',
    evidenceLabel: 'src/signal-sources.js S20-S34 + signalSourceStats() (35 entries, 5 live-signal, 23 candidate, 6 not-a-signal, 1 not-found)',
    capturedAt: '2026-09-22',
    usedIn: 'ROADMAP Shipped #48; MasterSite review (fourth pass)'
  },
  {
    id: 'V131',
    group: 'Strategies',
    status: 'DERIVED',
    fact: 'Adding a strategy designed today resets the roster-wide strict forward window (it is max(designedAt)), so the previous measurement is now published beside it under its own label instead of being silently erased',
    value: 'Before the 2026-09-22 addition the latest designedAt in the roster was 2026-09-21; HeatConfirm_500Bots is dated 2026-09-22, so the strict forward split (max over the roster) moved to 2026-09-22T00:00Z and the strict window now holds 1 real bar. data/reports/forward-test.json therefore also publishes method.previousDesignSplit + rankedPreviousDesignSplit: the same replay with noTradeBeforeTs moved back to the second-latest distinct designedAt, labelled as a SUPERSET that shares bars with the newest design\'s in-sample period and must never be quoted as a strict forward result. Both windows are reported side by side; neither replaces the other.',
    url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/forward-test.js',
    evidenceUrl: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/forward-test.json',
    evidenceLabel: 'src/forward-test.js defaultSplitTs + previousDesignTs derivation; data/reports/forward-test.json method.previousDesignSplit',
    capturedAt: '2026-09-22',
    usedIn: 'ROADMAP Shipped #48; ROADMAP Next #3'
  },
]);

/** Numbered irregularity register. Severity: high | med | low | info. */
export const IRREGULARITIES = Object.freeze([
  {
    id: 1, severity: 'high',
    title: 'The previous market catalog was fabricated — four series tickers do not exist',
    assumed: 'That KXSP500, KXNVDA, KXAAPL and KXNDX were real Kalshi series usable as a market catalog.',
    truth: 'All four return {"error":{"code":"not_found","message":"not found"}} from the production API. Real series use different naming (KXINXY for the S&P 500 yearly range, KXNASDAQ100Y for the Nasdaq-100) and real markets are event-scoped tickers such as KXINXY-27DEC31H1600-T4600.',
    evidence: [
      { label: '404 proof', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNVDA' },
      { label: 'Real series list', url: 'https://external-api.kalshi.com/trade-api/v2/series?category=Companies' },
      { label: 'Recorded in code', url: null, text: 'src/verified-snapshot.js → SERIES_NOT_FOUND; src/strategies.js → REJECTED_FABRICATED_TICKERS' }
    ],
    action: 'The fabricated catalog was deleted. Every market and series in this app now comes from a captured live response, and the rejected tickers are kept in an explicit deny-list so they can never silently return.',
    userAction: 'Open the 404 links yourself, then compare with the captured series in src/verified-snapshot.js.'
  },
  {
    id: 2, severity: 'high',
    title: 'The fee model was wrong — Kalshi fees are quadratic, not a flat 0.5% per contract',
    assumed: 'A flat fee of 0.5% of contract value.',
    truth: 'The official schedule is taker = round up(M × 0.07 × C × P × (1−P)) and maker = round up(M × 0.0175 × C × P × (1−P)), with M read from series.fee_multiplier. The fee is largest at P = 0.50 (1.75¢ per contract for a taker) and falls toward the extremes.',
    evidence: [
      { label: 'Official fee schedule (PDF)', url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf' },
      { label: 'Implementation', url: null, text: 'src/kalshi-fees.js — computeKalshiFee(), roundUpToIncrement(), rawQuadraticFee()' }
    ],
    action: 'Replaced with the official formula, including the round-up-to-the-cent rule, per-series multipliers and separate maker/taker coefficients. Fees are itemised per fill and attributed in the post-mortems.',
    userAction: 'Check any fill in the trade log: fee = round up(0.07 × contracts × P × (1−P)) for a taker.'
  },
  {
    id: 3, severity: 'high',
    title: 'A browser cannot use Kalshi’s WebSocket — signed headers are required at handshake',
    assumed: 'The front end could open wss://external-api-ws.kalshi.com/trade-api/ws/v2 directly for real-time prices.',
    truth: 'Kalshi requires KALSHI-ACCESS-KEY / -SIGNATURE / -TIMESTAMP on the handshake, and the browser WebSocket API cannot set request headers. A server-side relay is mandatory, and the relay needs an API key.',
    evidence: [
      { label: 'WebSocket guide', url: 'https://docs.kalshi.com/getting_started/quick_start_websockets' },
      { label: 'API keys & signing', url: 'https://docs.kalshi.com/getting_started/api_keys' },
      { label: 'Relay implementation', url: null, text: 'src/ws-lite.js (zero-dependency client that CAN set headers) + server.js /ws/feed' }
    ],
    action: 'Built a server relay with an RFC 6455 client that signs the handshake. Without credentials the app serves a labelled SIMULATED market-maker feed and says so in the header pill, the feed panel and the API response.',
    userAction: 'Set KALSHI_API_KEY_ID and KALSHI_API_PRIVATE_KEY, restart the server, and the feed pill switches from SIMULATED to LIVE.'
  },
  {
    id: 4, severity: 'med',
    title: 'Direct TLS connections to *.kalshi.com are dropped from this sandbox',
    assumed: 'That curl/fetch from the build host would reach the API.',
    truth: 'Handshakes to external-api.kalshi.com fail from this datacenter IP (edge security), so the server’s live path returns "fetch failed" here while the same code works from a normal network. All captures in this repo were obtained through the agent fetch path and are reproducible.',
    evidence: [
      { label: 'Live check endpoint', url: null, text: 'GET /api/transport reports upstreamReachable, the exact error and the fallback used' }
    ],
    action: 'Every endpoint degrades explicitly: it returns the real captured snapshot, labels it VERIFIED_SNAPSHOT, and includes the upstream error. Nothing silently pretends to be live.',
    userAction: 'Run `npm start` on your own machine and open /api/transport — upstreamReachable should be true there.'
  },
  {
    id: 5, severity: 'med',
    title: 'The candlestick path was wrong',
    assumed: 'GET /markets/{ticker}/candlesticks.',
    truth: 'The documented path is GET /series/{series_ticker}/markets/{ticker}/candlesticks — the series ticker is mandatory.',
    evidence: [{ label: 'Candlesticks reference', url: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks' }],
    action: 'Corrected in KALSHI_PATHS.candlesticks() and in every fetch the app makes.',
    userAction: 'Compare the URL in /api/candlesticks responses with the reference page.'
  },
  {
    id: 6, severity: 'med',
    title: 'A single 0.01 tick size is wrong — the grid is per market',
    assumed: 'DEFAULT_TICK_SIZE = 0.01 everywhere.',
    truth: 'Tick size comes from each market’s price_ranges. Captured markets use linear_cent (step 0.0100) while KXBTCY uses deci_cent (step 0.0010), so a hard-coded cent grid mis-prices BTC markets by 10x.',
    evidence: [
      { label: 'Fixed-point & price grid', url: 'https://docs.kalshi.com/getting_started/fixed_point_migration' },
      { label: 'Captured structures', url: null, text: 'src/kalshi-config.js → PRICE_LEVEL_STRUCTURES (11 structures)' }
    ],
    action: 'resolvePriceGrid() reads price_ranges first and only falls back to price_level_structure; snapToGrid/nextTick/isOnGrid enforce it, and limit orders are validated against the grid.',
    userAction: 'Open a KXBTCY market in the Markets tab — the ladder increments by 0.001, not 0.01.'
  },
  {
    id: 7, severity: 'high',
    title: 'Browser JavaScript cannot be truly sandboxed — the Strategy Lab is an isolation layer, not a security boundary',
    assumed: 'That user-supplied strategy code could be safely executed.',
    truth: 'Compiling user code with new Function() in a page cannot prevent a determined author from reaching page globals. True isolation needs an iframe with a strict CSP, a hardened worker realm, or a separate server runtime such as isolated-vm.',
    evidence: [{ label: 'Statement in code', url: null, text: 'src/strategy-sandbox.js header — HONEST SECURITY STATEMENT' }],
    action: 'Applied defence in depth: static deny-list (fetch, WebSocket, eval, document, window, localStorage, privateKey, …), no globals injected, whitelisted frozen ctx, validated actions, capped actions per period, and runtime errors captured instead of thrown. Server-side execution of user code is DISABLED by default (ALLOW_USER_CODE=false).',
    userAction: 'Do not expose the Lab to untrusted users without a real isolation runtime. This is listed as remaining work.'
  },
  {
    id: 8, severity: 'high',
    title: 'KXBTCY has fee_multiplier 0 — assuming M = 1 everywhere overcharged every BTC trade',
    assumed: 'A fee multiplier of 1 for all markets.',
    truth: 'The captured series object for KXBTCY returns fee_type "quadratic" with fee_multiplier 0, so the official formula yields $0.00 fees on that series, while KXNASDAQ100Y returns fee_multiplier 1 with quadratic_with_maker_fees.',
    evidence: [
      { label: 'KXBTCY series', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY' },
      { label: 'KXNASDAQ100Y series', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y' }
    ],
    action: 'Fees are now resolved per series from the captured Series objects; ReplayEngine passes no global multiplier, and each competition result records the feeConfiguration it actually used.',
    userAction: 'Open /api/run-competition and read competition.dataProvenance.feeConfiguration — KXBTCY shows fee_multiplier 0.'
  },
  {
    id: 9, severity: 'low',
    title: 'Two different status vocabularies for the same concept',
    assumed: 'That a market’s status value could be used as a query filter.',
    truth: 'Responses use initialized/inactive/active/closed/determined/disputed/amended/finalized, while the GET /markets filter accepts unopened/open/paused/closed/settled. Passing "active" as a filter is invalid.',
    evidence: [{ label: 'get-markets reference', url: 'https://docs.kalshi.com/api-reference/market/get-markets' }],
    action: 'mapStatusToFilter() translates between the two, and both enums are exported from src/kalshi-config.js.',
    userAction: 'Filter the Markets tab — the UI only ever sends valid filter values.'
  },
  {
    id: 10, severity: 'med',
    title: 'Real books are sparse and fractional; a uniform 5-tier model was unrealistic',
    assumed: 'Five symmetric tiers per side with round sizes.',
    truth: 'The captured book has 9 YES levels and 35 NO levels with sizes ranging from 3.43 to 4991.32 contracts, at irregular price points (0.01, 0.04, 0.06, 0.13, 0.17 …).',
    evidence: [{ label: 'Captured order book', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook' }],
    action: 'OrderBook is built from the real levels and keeps reciprocity (YES bid X ≡ NO ask 1−X). Synthetic depth is only added BEHIND the captured touch, is labelled SIMULATED, and is scaled by topSize/depthScale.',
    userAction: 'The Markets tab shows the real ladder; the badge states which part is captured and which is modelled.'
  },
  {
    id: 11, severity: 'high',
    title: 'Candlesticks carry no depth, so fills behind the touch cannot be verified',
    assumed: 'That historical replay could reproduce real execution quality.',
    truth: 'A candlestick gives OHLC of the trade price plus OHLC of the yes_bid and yes_ask, and volume/open interest — but no size at any level. Any fill that walks beyond the touch is a model, not an observation.',
    evidence: [{ label: 'Candlestick schema', url: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks' }],
    action: 'The replay drives each period from the REAL bid/ask/trade range (resting bids fill only when the period low reaches them, asks only when the high does), and reports depth-model assumptions in competition.dataProvenance.depthModelNote. Anything beyond captured depth is disclosed, never presented as observed.',
    userAction: 'Read the depth note under any strategy detail — it states exactly which part of the fill is modelled.'
  },
  {
    id: 12, severity: 'high',
    title: 'The engine used to invent an execution price beyond the book, and that invention dominated results',
    assumed: 'That an order larger than all depth should fill at "the last level plus 5 ticks".',
    truth: 'Kalshi does not execute beyond available depth. With 100%-of-cash sizing the invented penalty fill accounted for −$76,966 of one strategy’s −$66,578 equity change — i.e. the headline result was mostly an artefact of our own model, not of the market.',
    evidence: [{ label: 'Attribution before the fix', url: null, text: 'factors listed "Liquidity shortfall (book exhausted)" as the largest term for 6 of 8 strategies' }],
    action: 'exhaustionPolicy now defaults to "partial": only real depth fills, the remainder is reported as UNFILLED, and the leaderboard discloses unfilled contracts per strategy. The legacy "penalty" mode still exists for stress tests, is opt-in, and is labelled as an invented price wherever it appears.',
    userAction: 'Compare the Unfilled column on the leaderboard with each strategy’s attribution — no fabricated price appears anywhere.'
  },
  {
    id: 13, severity: 'med',
    title: 'The live candlestick window is only ~3 months, which caps how long a replay can be',
    assumed: 'That a full year of daily history was available from the standard endpoint.',
    truth: 'GET /historical/cutoff returned 2026-07-19T00:00:00Z, and the longest contiguous daily series obtainable on the capture date is 61 bars (2026-07-19 → 2026-09-17). Older history requires the separate historical endpoints.',
    evidence: [
      { label: 'Historical data guide', url: 'https://docs.kalshi.com/getting_started/historical_data' },
      { label: 'Cutoff capture', url: 'https://external-api.kalshi.com/trade-api/v2/historical/cutoff' }
    ],
    action: 'The replay uses all 61 available bars and states the horizon in every result. The 52-week competition calendar is a memory/tracking structure, not a claim that 52 weeks of candlesticks were replayed. Historical-endpoint ingestion is listed as remaining work.',
    userAction: 'The leaderboard header shows "61 real daily periods" — that number comes from the data, not from a config constant.'
  },
  {
    id: 14, severity: 'med',
    title: 'None of the captured contracts had settled, so no real settlement outcome can be used',
    assumed: 'That final positions could be resolved to $1.00 / $0.00 from observed results.',
    truth: 'KXNASDAQ100Y-26DEC31H1600-T33000 closes 2026-12-31 and KXBTCY-27JAN0100-T149999.99 closes 2027-01-01 — both after the capture date, with result "" and status "active".',
    evidence: [{ label: 'Market object', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000' }],
    action: 'By default the replay marks open positions at the last REAL captured quote and reports them as unrealized. Settlement is an explicit opt-in (settleAtEnd + finalResult) and the UI labels any settled run as a hypothetical scenario, never as an observed outcome.',
    userAction: 'Tick "Settle at end" and choose an outcome — the banner states that the outcome is hypothetical.'
  },
  {
    id: 15, severity: 'low',
    title: 'liquidity_dollars reads "0.0000" on markets that clearly have liquidity',
    assumed: 'That liquidity_dollars could be used to rank markets by depth.',
    truth: 'Captured active markets return liquidity_dollars "0.0000" while reporting volume_fp of 395,554.67 and open_interest_fp of 162,977.28. No document explains this field’s semantics.',
    evidence: [{ label: 'Market list capture', url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12' }],
    action: 'The field is displayed raw with a "not used in calculations" note. Liquidity in this app is measured from the captured order book and from volume/open interest only.',
    userAction: 'Ask Kalshi support what liquidity_dollars measures; until then treat it as unexplained.'
  },
  {
    id: 16, severity: 'low',
    title: '429 responses carry no Retry-After header',
    assumed: 'That a throttled response would tell the client when to retry.',
    truth: 'The rate-limit documentation describes a token bucket (10 tokens per request, 200 reads/s and 100 writes/s on the basic tier, 2 s burst) and a 429 body of {"error":"too many requests"} with no Retry-After.',
    evidence: [{ label: 'Rate limits', url: 'https://docs.kalshi.com/getting_started/rate_limits' }],
    action: 'The client applies its own exponential backoff on 429 and records every transport attempt in an audit log surfaced by /api/transport.',
    userAction: 'None required; just do not expect a server-provided retry hint.'
  },
  {
    id: 17, severity: 'med',
    title: 'Two depth values in the first order-book capture could not be re-confirmed',
    assumed: 'That the first captured book was accurate as transcribed.',
    truth: 'Capture 1 showed YES 0.1200 @ 100242.25 and NO 0.8300 @ 100076.49. A second capture of the same endpoint the same day showed no 0.1200 YES level at all and NO 0.8300 @ 81.49, while the market object reported yes_bid_size_fp "242.25" at 0.1200 — contradicting 100242.25 at the same price.',
    evidence: [
      { label: 'Endpoint (re-fetch it yourself)', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXNASDAQ100Y-26DEC31H1600-T33000/orderbook' },
      { label: 'Both captures retained', url: null, text: 'src/verified-snapshot.js → ORDERBOOKS (capture-2 primary, capture-1 archived as evidence)' }
    ],
    action: 'Capture 1 is archived, marked usedBySimulator:false, and replaced by capture 2, which passes a reciprocal cross-check against the market object (best NO bid 0.8700 ⇒ implied YES ask 0.1300 = the market’s yes_ask_dollars). The discrepancy is recorded rather than silently resolved.',
    userAction: 'Depth is time-varying: re-fetch the endpoint and compare with capture-2’s _capture metadata.'
  },
  {
    id: 20, severity: 'high',
    title: 'The "verbatim" comparison used by the expander oracle was shallow — it never compared prices',
    assumed: 'That JSON.stringify(bar, Object.keys(sample).sort()) proves an expanded tuple equals the captured bar field-for-field.',
    truth: 'The array form of the replacer argument filters property names at EVERY depth, so nested price / yes_bid / yes_ask objects serialise as {}. Two bars with completely different prices compared equal, meaning the expander oracle (and the ingest merge check) could not have detected a transcription error in any price field.',
    evidence: [
      { label: 'MDN: the replacer parameter', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#the_replacer_parameter' },
      { label: 'Fix + regression test', url: null, text: 'src/json-utils.js → stableStringify(); test 51 asserts the naive comparison is blind and stableEqual is not' }
    ],
    action: 'Added src/json-utils.js with stableStringify/stableEqual (recursive, sorted keys) and switched every deep comparison — the expander oracle, the ingest merge conflict check and test 14 / test 54 — to it. Re-running the strict comparison on the existing captures found zero differences, so no stored bar was wrong, but the earlier "verified" claim was weaker than stated.',
    userAction: 'Run test 51 and 54; both now compare every nested field. Any future "verbatim" check must use stableEqual, never the key-array replacer.'
  },
  {
    id: 21, severity: 'high',
    title: 'A regime sweep over the replay would require inventing price history',
    assumed: 'That a 10 strategies × 6 regimes × N seeds matrix could be run against the captured candlesticks.',
    truth: 'Regime presets change how prices evolve. Applying them to a replay means overwriting real captured bars with synthetic bull/bear/volatile paths — fabricating history, which this repository forbids. The runner has always stated that the replay uses real candles UNMODIFIED.',
    evidence: [
      { label: 'Runner disclosure', url: null, text: 'src/strategy-runner.js → competition.regimeNote: "This replay always uses the REAL captured candlesticks UNMODIFIED"' },
      { label: 'Honest replacement', url: null, text: 'scripts/sensitivity-sweep.mjs: 10 strategies × 3 seeds × 3 universes × 3 settlement scenarios = 270 strategy runs' }
    ],
    action: 'Built a sensitivity sweep that varies only what is ours to vary — the seed (modelled depth behind the touch), the market universe, the settlement scenario and the exhaustion policy — and reports the result in SENSITIVITY.md. Every cell replays the same real bars.',
    userAction: 'Read SENSITIVITY.md. Treat the hypothetical settlement rows as scenarios, not outcomes: none of these contracts had resolved at capture time.'
  },
  {
    id: 22, severity: 'med',
    title: 'Average cost rounded to 6 decimals broke the accounting identity on 900k-contract positions',
    assumed: 'That round6 (1e-6) precision on a position\'s average cost is far below any material amount.',
    truth: 'avgCost is re-rounded on every fill and then multiplied by the contract count. On a 873,542.98-contract position, 0.5e-6 of rounding is up to $0.44 of phantom cost basis, and it compounds across fills: the identity equityChange = realizedPnl + unrealizedPnl − feesPaid was off by $2.16 on ContrarianKing_100x once the market universe was broadened.',
    evidence: [
      { label: 'Measured before the fix', url: null, text: 'identityGap = $2.16 vs a $1.04 tolerance (test 25)' },
      { label: 'Fix in src/simulation-engine.js', url: null, text: 'round10() applied to avgCost only; money values stay at cents for display' }
    ],
    action: 'avgCost now uses 10 decimals while all money stays rounded to cents. The identity gap fell to ≤ $0.05 across every strategy, and the settlement/payout code reuses the same helper.',
    userAction: 'Run test 25; the worst identity gap across the roster is now under five cents.'
  },
  {
    id: 23, severity: 'med',
    title: 'The equity curve could end somewhere other than finalEquity once more than one market shared the last timestamp',
    assumed: 'That the last equity-curve point always equals the reported final equity.',
    truth: 'The replay timeline is ordered by (timestamp, ticker) and a curve point is written only when the timestamp changes. With the broadened universe the final timestamp spans two markets, so the curve was written before the second market was marked: the curve ended at $27,702.70 while finalEquity was $36,789.43.',
    evidence: [
      { label: 'Detected by test 24', url: null, text: 'assert.equal(r.finalEquity, last curve point) — expected 27702.7, actual 36789.43' },
      { label: 'Fix in src/backtest-replay.js', url: null, text: 'the curve always terminates on the final equity (update-in-place when the last point shares the final timestamp)' }
    ],
    action: 'The curve is now reconciled to the final equity before settlement, so the chart and the headline number can never disagree.',
    userAction: 'Compare the last sparkline point with the "Final equity" stat for any strategy — they match.'
  },
  {
    id: 24, severity: 'med',
    title: 'The daily-history ingest job cannot run from this sandbox',
    assumed: 'That a scheduled job could append each day\'s candles from the build environment.',
    truth: 'Direct TLS to *.kalshi.com is dropped from this datacenter IP (irregularity #4). The script works from any normal network and is shipped with a GitHub Actions workflow, which has unrestricted egress, but it has never completed a live run here — so data/history/ is empty and every result still comes from the 2026-09-17 captures.',
    evidence: [
      { label: 'Live failure', url: null, text: 'node scripts/ingest-history.mjs → "fetch failed" for all 3 markets; the script exits 1 with the sandbox explanation' },
      { label: 'Workflow', url: null, text: '.github/workflows/daily-history.yml runs it daily at 06:15 UTC and commits data/history/' }
    ],
    action: 'The script refuses to fabricate: on total failure it records the error per market in data/history/_manifest.json and exits non-zero. A --verify mode audits an existing store with no network at all, and --dry-run prints the exact URLs it would call for manual review.',
    userAction: 'Run `node scripts/ingest-history.mjs --dry-run` to see the URLs, then run it (or let the workflow run it) from a network that can reach external-api.kalshi.com.'
  },
  {
    id: 25, severity: 'low',
    title: 'KXBTCY has only 14 captured bars, so it joins the replay part-way through',
    assumed: 'That every market in the universe covers the same window.',
    truth: 'KXBTCY-27JAN0100-T149999.99 has 14 daily bars (2026-09-03 → 2026-09-17) while both Nasdaq-100 strikes have 61. In the merged timeline the BTC market simply appears in the final 14 periods; it is not back-filled.',
    evidence: [
      { label: 'Coverage', url: null, text: 'GET /api/history and GET /api/market-stats both report per-market bar counts' },
      { label: 'Window', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXBTCY/markets/KXBTCY-27JAN0100-T149999.99/candlesticks?start_ts=1788393600&end_ts=1789603200&period_interval=1440' }
    ],
    action: 'Per-market bar counts are shown in the competition universe panel and in every result\'s dataProvenance, so a shorter window is visible rather than hidden.',
    userAction: 'Compare the "Bars" column in the Competition universe panel before reading any cross-market comparison.'
  },
  {
    id: 18, severity: 'info',
    title: 'updated_time is not a quote timestamp',
    assumed: 'That a market’s updated_time indicated when its price last changed.',
    truth: 'Captured active markets show updated_time 2026-04-09T09:41:46Z while their last_price_dollars, yes_bid and yes_ask change intraday.',
    evidence: [{ label: 'Market list capture', url: 'https://external-api.kalshi.com/trade-api/v2/markets?series_ticker=KXNASDAQ100Y&status=open&limit=12' }],
    action: 'All freshness indicators in this app use our own capture timestamp and the candlestick end_period_ts, never updated_time.',
    userAction: 'None — informational.'
  },
  {
    id: 19, severity: 'low',
    title: 'Kalshi’s own fee table does not match Kalshi’s own fee formula',
    assumed: 'That the "General Trading Fees Table" in the fee schedule PDF is the literal amount charged.',
    truth: 'The table is the formula rounded UP to whole cents. The formula rounds "such that the fee + positionCost is rounded to a centicent" ($0.0001). For 100 contracts at $0.01 the formula gives $0.0693 while the table prints $0.07; at $0.25 it gives $1.3125 vs $1.32. All 21 published rows follow the cent-rounding rule exactly.',
    evidence: [
      { label: 'Fee schedule PDF (formula + table, same document)', url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf' },
      { label: 'Transcribed oracle used by the test suite', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/kalshi-config.js', text: 'OFFICIAL_FEE_TABLE_PER_100 / FEE_TABLE_ROUNDING' }
    ],
    action: 'The engine charges the FORMULA value (centicent rounding), because that is the rule stated for the calculation itself, and asserts the cent-rounding relationship against all 21 published rows so neither number is invented. Both values are shown side by side in the Verification tab.',
    userAction: 'Expect fees a fraction of a cent BELOW the published table on small orders. If Kalshi states the table is authoritative, flip FEE_TABLE_ROUNDING.publishedTableIncrement handling in src/kalshi-fees.js.'
  },
  {
    id: 26, severity: 'high',
    title: 'The replay window was capped at 61 bars by our own start_ts, not by Kalshi — the real window was 268',
    assumed: 'That live market candlesticks only go back to the /historical/cutoff date (2026-07-19), so a 61-bar window was the most the public API would give.',
    truth: 'The cutoff bounds the *historical tier* datasets (market_positions, market_settled, orders, trades), not candlesticks. Probing the same market with a one-day window at 2026-01-01, 2026-03-01 and 2026-05-01 each returned a real daily bar, and a full backfill from each market\u2019s open_time returned 263 bars for T33000 (2025-12-24 \u2192 2026-09-17). The 61-bar series was an artefact of the start_ts we asked for.',
    evidence: [
      { label: 'Cutoff endpoint (the date we trusted)', url: 'https://api.elections.kalshi.com/trade-api/v2/historical/cutoff', text: 'market_positions_last_updated_ts / market_settled_ts / orders_updated_ts / trades_created_ts = 2026-07-19T00:00:00Z' },
      { label: 'One-day probe at 2026-01-01 — a REAL bar came back', url: 'https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1767225600&end_ts=1767312000&period_interval=1440', text: 'end_period_ts 1767243600, close_dollars 0.0700, volume_fp 247.00' },
      { label: 'One-day probe at 2026-03-01 — a REAL bar came back', url: 'https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1772323200&end_ts=1772409600&period_interval=1440' },
      { label: 'One-day probe at 2026-05-01 — a REAL bar came back', url: 'https://api.elections.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1777593600&end_ts=1777680000&period_interval=1440' },
      { label: 'Resulting store', url: null, text: 'data/history/_manifest.json — 30 markets, 7,189 bars, 4,666 added in one run, 0 conflicts' }
    ],
    action: 'The ingest job now backfills from each market\u2019s real open_time (--days=0, paged in 180-day windows) instead of a fixed 90-day window, and the replay reads the longer stored series wherever it is a verified superset of the capture. Only the market\u2019s own open_time bounds the series.',
    userAction: 'Run `node scripts/ingest-history.mjs --verify` to see each market\u2019s real window, or open data/history/_manifest.json. Do not assume any window length — read the coverage table.'
  },
  {
    id: 27, severity: 'med',
    title: 'Two of our own failures hid behind a green CI step',
    assumed: 'That a successful GitHub Actions step means the ingest actually ran.',
    truth: '(a) scripts/ingest-history.mjs threw ReferenceError: url is not defined after the windowed-backfill refactor, so it aborted before writing its manifest; (b) the workflow ran `node ... | tee log` without `set -o pipefail`, so the non-zero exit still reported success. One run therefore ingested nothing and looked fine.',
    evidence: [
      { label: 'The run that ingested nothing', url: null, text: 'commit 9ceb180 changed only data/settlements.json and src/accumulated-history.js — no bars' },
      { label: 'The crash', url: null, text: 'ingest-history failed: ReferenceError: url is not defined at ingestMarket (scripts/ingest-history.mjs)' }
    ],
    action: 'Fixed the stale variable, added `set -o pipefail` to the workflow step, and the job now commits its log to data/history/_last-run.log so every run is auditable after the fact.',
    userAction: 'After any scheduled run, read data/history/_last-run.log — a run that added no bars says so explicitly.'
  },
  {
    id: 28, severity: 'low',
    title: 'The competition universe grew from 3 markets to 30, so per-market statistics now rest on very unequal samples',
    assumed: 'That every market in the universe offers a comparable amount of data.',
    truth: 'After the backfill the 30 replayable markets hold between 204 and 268 bars (7,189 total), and 352 of those bars (4.9%) are no-trade periods with no OHLC at all. Two KXINXY strikes are no-trade in roughly half their bars. Correlations and win rates computed across markets therefore rest on unequal samples.',
    evidence: [
      { label: 'Per-market coverage', url: null, text: 'GET /api/history → markets[].bars, .noTradeBars, .origin, .excludedReason' },
      { label: 'No-trade bar shape', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440' }
    ],
    action: 'Every market reports its own bar count, no-trade count and origin in the competition universe panel and in each result\u2019s dataProvenance; markets with fewer than 10 bars (or no captured market object) are tracked but never replayed, and the reason is shown.',
    userAction: 'Read the Bars / no-trade columns before comparing two markets, and check the "tracked, not replayable" list — it is not an error, it is the floor doing its job.'
  },
  {
    id: 29, severity: 'high',
    title: 'Modelled depth let a strategy "buy" 250,000 contracts on a 400-contract day and book +2,005%',
    assumed: 'That a fill only had to respect the order book — so if the book (whose size behind the touch is MODELLED, because candlesticks carry no depth) offered size at the period\u2019s low, taking all of it was a legitimate trade.',
    truth: 'The bar for that day records the contracts that actually traded. KXINXY-26DEC31H1600-B6900 traded 389 contracts on a median day; the replay was filling orders of 250,000 at the intraday low and then marking them at the close. Under the first 30-market, 268-period run this produced PanicDip_ShockTiming +2,005.93% (+146,402% under a 50% per-market cap), 19 single-day equity moves above 20%, and one of +63.95%. Those numbers were an artefact of our modelled depth, not an edge anyone could trade.',
    evidence: [
      { label: 'Bar volume is the period\u2019s traded contracts', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-B6900/candlesticks?start_ts=1781841600&end_ts=1789689600&period_interval=1440', text: 'median daily volume_fp 389.00 across 264 bars' },
      { label: 'The run that exposed it', url: null, text: 'seed 20260917, 268 periods, 30 markets: PanicDip_ShockTiming +2005.93%, 1,027 trades, 19 days with >20% equity moves' }
    ],
    action: 'Fills are now bounded by the period\u2019s REAL traded volume: no order — taker or resting maker — may take more than maxFillFractionOfPeriodVolume (default 10%) of the contracts that traded in that bar, and a resting order can fill partially against it. Whatever the bound refuses is counted and reported (volumeCappedContracts) exactly like an unfilled remainder. The same roster on the same data now returns between +9.25% and -16.30%.',
    userAction: 'Treat any double-digit-percent-per-DAY compounding in a result as a modelling artefact until you have checked volumeCappedContracts for that strategy. The bound is a parameter, not a law: `--max-fill-fraction=null` restores the old behaviour for stress tests.'
  },
  {
    id: 30, severity: 'med',
    title: 'A market-making quote still pays no attention to whether the market is open or how wide the spread is',
    assumed: 'That a two-sided quote placed on every period is a fair test of a market-making strategy.',
    truth: 'VolatilityArb_MM places 4,358 trades across 268 periods and 30 markets, including 352 no-trade bars where no price was printed at all. On those bars the book is anchored on the last real quote, so a "fill" can occur against a stale touch. The strategy still finishes first (+9.25%), which is plausible for a spread harvester, but its trade count is inflated by quotes that no one could have hit.',
    evidence: [
      { label: 'No-trade bar shape', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXINXY/markets/KXINXY-26DEC31H1600-T4000/candlesticks?start_ts=1781841600&end_ts=1781928000&period_interval=1440', text: 'price.previous_dollars only — no OHLC' },
      { label: 'Counts', url: null, text: 'GET /api/history → markets[].noTradeBars; 352 of 7,189 stored bars (4.9%)' }
    ],
    action: 'No-trade bars are counted and displayed per market, and resting orders still fill only within the period\u2019s real traded range (which is empty on those bars, so the volume bound now blocks the fill). The remaining exposure is that the touch itself is carried forward from the last real quote.',
    userAction: 'When reading a market-maker\u2019s trade count, compare it with the no-trade bars of the markets it quoted.'
  },
  {
    id: 31, severity: 'med',
    title: 'A published claim about the traded price range was wrong ("no contract above 28c")',
    assumed: 'That no contract in the captured universe trades above 28 cents, so the favourite leg of the longshot-bias rule and the near-certainty entries provably cannot fire.',
    truth: 'The stored window contains 47 closes above 28c, all of them in two Nasdaq-100 strikes (KXNASDAQ100Y-26DEC31H1600-T33000: 45 bars, max close $0.45; T19000: 2 bars, max $0.40). The published sentence was false. The CONCLUSION it supported survives a stronger test: across all 30 markets and 5,762 numeric closes the maximum close is $0.45, so no close reaches the 0.85+ band the favourite leg needs and none reaches the 0.92-0.99 band a near-certainty entry needs.',
    evidence: [
      { label: 'Counted from the store, not from an opinion', url: null, text: 'node -e over src/accumulated-history.js: 5,762 closes, min $0.01, max $0.45, 47 above $0.28, 0 above $0.50' },
      { label: 'The bars are real API responses', url: null, text: 'data/history/KXNASDAQ100Y-26DEC31H1600-T33000.json (263 bars) + data/reports/store-verification.json (re-fetched from the official endpoint, compared field-for-field)' },
      { label: 'Official endpoint the closes come from', url: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks' }
    ],
    action: 'The sentence and two related captions were rewritten to state the measured range, and to say in place that the earlier number was wrong (src/strategies.js). Test 77 recomputes the range from the store on every run so the claim cannot drift again, and the range is now a published fact (V81).',
    userAction: 'When a caption quotes a range, re-run the count before relying on it — and read the retraction next to the corrected sentence, not only the headline number.'
  },

  {
    id: 32, severity: 'med',
    title: 'The requested "CEO" project does not exist in the verified directory',
    assumed: 'That a project named "CEO" exists among the owner\u2019s GitHub Pages sites and could supply a trading signal.',
    truth: 'The official GitHub API lists 39 public repositories for buffedlizard55-lab on 2026-09-18; none is named CEO or close to it. The MasterSite directory publishes 38 of the 39 and states that one repository is "permanently excluded by owner request" without naming it. The requested project is therefore either renamed, the excluded repository, or a misremembered name.',
    evidence: [
      { label: 'Official repository list (39, no CEO)', url: 'https://api.github.com/users/buffedlizard55-lab/repos?per_page=100' },
      { label: 'MasterSite directory (38 published, 1 excluded by owner request)', url: 'https://buffedlizard55-lab.github.io/MasterSite/' },
      { label: 'Recorded in the ledger', url: null, text: 'src/signal-sources.js → S00 (status NOT_FOUND, flagged); test 76 asserts the missing project is named and flagged' }
    ],
    action: 'The review records S00 with status NOT_FOUND and a flag instead of silently skipping the request. No strategy was invented from a project that could not be examined. Independent of that missing project, Kalshi lists CEO-change series which this repo already trades (CEOExit_Drift on daily bars; LiveCEO_ChangeFav on the Live Desk) — those entries cite the exchange, not a MasterSite CEO repo.',
    userAction: 'Owner review needed: rename the repo, confirm the excluded repository is the one meant, or correct the name.'
  },
  {
    id: 33, severity: 'low',
    title: 'The "Gold" project is a ring buyer\u2019s directory, not a gold-market signal (name collision)',
    assumed: 'That the GOLD project could supply gold-price information for a Kalshi gold strategy.',
    truth: 'GOLD is an evidence-based buyer\u2019s reference for solid gold RINGS — 482 jewelry listings ranked by price per pure-gold gram. Retail jewelry quotes are not a financial gold price, and wiring them into a market strategy would be a category error. Kalshi\u2019s actual gold markets (KXGOLD15M and siblings) are now tracked directly from the exchange.',
    evidence: [
      { label: 'GOLD project (rings)', url: 'https://buffedlizard55-lab.github.io/GOLD/' },
      { label: 'The real gold market, captured from the exchange', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXGOLD15M-26SEP162030-30' },
      { label: 'Recorded in the ledger', url: null, text: 'src/signal-sources.js → S11 (status NOT_A_SIGNAL, flagged); GoldBracket_EarlyLeader sourceNote states the project contributes nothing to its inputs' }
    ],
    action: 'The mismatch is flagged on the signal-source ledger and on the strategy itself. The gold strategy uses only the exchange\u2019s own captured bars and results.',
    userAction: 'If a gold-price signal is wanted later, the source must be an official price (e.g. LBMA/CME archive), not a jewelry directory.'
  },
  {
    id: 34, severity: 'med',
    title: 'Weather basis mismatch: the archived signal is NWS, the settlement is The Weather Company',
    assumed: 'That a forecast from the National Weather Service and the market\u2019s settlement source measure the same number.',
    truth: 'KXHIGHNY rules name "The Weather Company" data for New York City (CLINYC) as the settlement source (V84). The point-in-time archive holds the NWS gridded forecast for Central Park (V87/V88) — a different provider. On most days the two agree closely, but they are not the same measurement, and on disagreement days a forecast-confirming strategy loses even when its forecast was "right".',
    evidence: [
      { label: 'Settlement source (captured rules)', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP07-B77.5' },
      { label: 'Signal source (NWS point forecast)', url: 'https://api.weather.gov/gridpoints/OKX/34,45/forecast' },
      { label: 'Stated on the strategy', url: null, text: 'src/strategies.js → ForecastEdge_Weather thesis (BASIS MISMATCH paragraph); the UI Research tab repeats it' }
    ],
    action: 'The mismatch is published on the strategy, in the forecast-status panel and here. It is a real source of noise the forward test will measure, not something to hide. If The Weather Company ever exposes a free point-in-time API, the archive can add it as a second provider.',
    userAction: 'When reading ForecastEdge_Weather results, remember the signal and the settlement come from different providers.'
  },
  {
    id: 35, severity: 'low',
    title: 'An ACTIVE market\u2019s lifetime volume can exceed the sum of its stored bars — only finalized markets reconcile exactly',
    assumed: 'That summing a market\u2019s stored volume_fp always reproduces its lifetime volume_fp (V80).',
    truth: 'For FINALIZED markets the sum reconciles exactly (all 39 settled weather brackets and all 8 gold contracts do). For an ACTIVE market the market object is captured at a different instant than the last stored bar, and trading continues after it — observed: KXHIGHNY-26SEP17-B82.5 (status active) whose stored bars sum to less than its lifetime volume at capture.',
    evidence: [
      { label: 'The active bracket that exposed it', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXHIGHNY-26SEP17-B82.5' },
      { label: 'The exact-reconciliation rule for finalized markets', url: null, text: 'test 79 in test/simulation.test.js reconciles only status=finalized stores' }
    ],
    action: 'The store audit and test 79 assert exact reconciliation for finalized markets only, and treat an active market\u2019s shortfall as expected ongoing trading rather than data corruption.',
    userAction: 'None — this is a documented property of capturing a moving market, not an error.'
  },
  {
    id: 36, severity: 'closed',
    title: 'RESOLVED 2026-09-18 — KXHIGHNY / KXGOLD15M fee multipliers were uncaptured; the fee configuration of ALL 14,154 series is now captured',
    assumed: 'That the fee multiplier of the two new series is known from a captured Series object (as it is for KXBTCY=0, V11).',
    truth: 'The ingest captures MARKET objects, not SERIES objects, so seriesFeeConfig() falls back to the documented default multiplier M=1 (taker 0.07\u00d7P\u00d7(1\u2212P)) with a "captured: false" note. If either series carries a non-standard multiplier in the official Non-Standard Fees table, fees for those flights would be over- or under-charged.',
    evidence: [
      { label: 'Fee schedule (check the Non-Standard table for these series)', url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf' },
      { label: 'The honest fallback', url: null, text: 'src/verified-snapshot.js → seriesFeeConfig() "Series object not captured — using the documented taker default M=1"' }
    ],
    action:
      'CLOSED 2026-09-18. The on-demand ingest job now runs scripts/discover-universe.mjs, which calls GET /series?include_volume=true and stores the fee configuration of every series the exchange lists (14,154 series) in data/discovered/series-fees.json. scripts/generate-fee-registry.mjs narrows that to the 47 series this build can price a fill for and emits src/series-fee-registry.js; seriesFeeConfig() now resolves snapshot -> registry -> documented default and labels which one it used (captureSource). MEASURED ANSWERS: KXHIGHNY fee_multiplier 1 / quadratic and KXGOLD15M fee_multiplier 1 / quadratic — the documented default was right for both, but it is now a capture rather than an assumption. The same capture exposed a real, material bug: irregularity #37.',
    userAction:
      'Open https://docs.kalshi.com/api-reference/market/get-series-list, call it with include_volume=true, and compare any ticker against src/series-fee-registry.js.'
  },
  {
    id: 37, severity: 'high',
    title: 'Maker fees were charged on series that do not have them — the maker/taker split is a PER-SERIES property the engine ignored',
    assumed: 'That any resting order pays the maker coefficient: fees = round up(M x 0.0175 x C x P x (1-P)). KALSHI_FEES.makerCoefficient was applied unconditionally in OrderBook.processRestingFills().',
    truth:
      'The official schedule charges a resting order only if the series is in its Maker Fees section: "Trading fees are only charged for orders that are immediately matched with orders sitting on the orderbook. Trading fees are not charged for orders placed that are not immediately matched and are instead left as resting orders on the orderbook unless they are included in our Maker Fees section." The live Series object marks exactly those series with fee_type = "quadratic_with_maker_fees". In the 2026-09-18 capture of 14,154 series, KXNFLGAME, KXMLBGAME, KXNBAGAME, KXWNBAGAME, KXNCAAFGAME, KXFEDDECISION, KXCPIYOY, KXINXY and KXNASDAQ100Y carry that flag, while every KXHIGH* weather series (and KXGOLD15M, KXBTC15M, KXETH15M, KXSOL15M, KXUFCFIGHT) is plain "quadratic" and pays NOTHING for a resting order. The same capture also shows multipliers that are not 1: the MLB series 0.5, KXBTCY 0.',
    evidence: [
      { label: 'Official fee schedule (PDF) — the sentence quoted above', url: 'https://kalshi.com/docs/kalshi-fee-schedule.pdf' },
      { label: 'The real per-series configuration', url: null, text: 'data/discovered/series-fees.json (GET /series?include_volume=true, capturedAt 2026-09-18T06:42:31Z) -> src/series-fee-registry.js' },
      { label: 'Endpoint documentation', url: 'https://docs.kalshi.com/api-reference/market/get-series-list' },
      { label: 'The fix', url: null, text: 'src/simulation-engine.js -> OrderBook.makerFeesApply (set from the series fee_type); a plain-quadratic maker fill now records fee 0 and puts the rule that produced it in feeFormula' },
      { label: 'The guard', url: null, text: 'test 86 proves both branches: $0.00 on a plain-quadratic series, exactly $0.42 on 100 contracts at $0.40 for a maker-fee series' },
      { label: 'Visible per fill', url: null, text: 'src/trade-ledger.js -> feeRegime column (taker_0.07 | taker_zero | maker_0.0175 | maker_free | settlement) and the Fee Regimes table on the Trade Ledger tab' }
    ],
    action:
      'Fees are resolved per series from a capture, and every fill states the regime that produced its fee. Maker strategies that traded plain-quadratic series were being over-charged before this fix; the ledger, the reports and the Pages data were regenerated. Any strategy text that asserted "the maker coefficient is a quarter of the taker fee" was corrected to the per-series rule.',
    userAction:
      'Open the Trade Ledger tab: the Fee Regimes table counts the fills and dollars under each rule, and any row can be traced back to its series ticker in src/series-fee-registry.js.'
  },
  {
    id: 38, severity: 'low',
    title: 'The settlement tracker was rate-limited (HTTP 429) partway through the 2026-09-18 pass',
    assumed: 'That every tracked market could be re-checked for its final result in the same run as hundreds of candlestick requests.',
    truth:
      'data/history/_last-run.log (committed with the data) records http_429 for 13 markets — KXINXY-26DEC31H1600-T4000, six KXNASDAQ100Y strikes, KXNCAAFGAME-26SEP26ILLOSU-OSU, KXNFLGAME-26SEP10SFLAR-SF, two KXUFCFIGHT and KXWNBAGAME-26AUG10CHISEA-CHI — after the candlestick passes had already issued hundreds of requests. The markets are neither settled nor marked settled by the run; the fetch simply failed. No price or result is guessed to cover it.',
    evidence: [
      { label: 'The run log committed with the data', url: null, text: 'data/history/_last-run.log — "✗ <ticker>: http_429"' },
      { label: 'Rate-limit documentation', url: 'https://docs.kalshi.com/getting_started/rate_limits' },
      { label: 'Implementation', url: null, text: 'scripts/track-settlements.mjs (retries via scripts/kalshi-http.mjs; failures are reported, never invented)' }
    ],
    action:
      'The failures are logged and committed instead of hidden. Closing this needs a slower cadence (min_interval_ms) or a settlement pass in its own run — both are one-line changes to the request file.',
    userAction: 'Open data/history/_last-run.log and search for http_429: each line names a market whose settlement check did not complete.'
  },
  {
    id: 39, severity: 'med',
    title: 'The weather archive was pointed at the wrong airport for Chicago, and Austin has two plausible stations',
    assumed: 'That "the city temperature" is the temperature at the city\'s main airport, so the archive was first configured with O\'Hare (41.9786,-87.9048) for KXHIGHCHI.',
    truth: 'Kalshi names the settlement station in the market rules, and for Chicago it is CLIMDW - Midway - about 30 km south of O\'Hare with a different NWS grid (LOT 72,69 vs LOT 66,77). Reading the captured rules text caught the error before any market was traded on it. Austin has no unique answer: the rules say only "Austin (CLIAUS)", which can be Camp Mabry (30.3167,-97.7667) or Austin-Bergstrom (30.1975,-97.6664); the archive uses Camp Mabry and records the alternative so the choice is auditable rather than invisible. Separately, every one of these markets settles on The Weather Company observations while the archive stores National Weather Service forecasts - the genuine basis mismatch recorded as #34.',
    evidence: [
      { label: 'KXHIGHCHI point (Midway) - resolved', url: 'https://api.weather.gov/points/41.7868,-87.7522' },
      { label: 'O\'Hare, the wrong point the first draft used', url: 'https://api.weather.gov/points/41.9786,-87.9048' },
      { label: 'Austin alternative (Bergstrom)', url: 'https://api.weather.gov/points/30.1975,-97.6664' },
      { label: 'Station list in the captured rules', url: null, text: 'data/history/.../rules_primary: KXHIGH* markets name CLINYC/CLILAX/CLIMDW/CLIMIA/CLIAUS/CLIDEN/CLIPHL/CLIPHX/CLISEA' }
    ],
    action: 'The archive point for every city is now the point named by that market\'s own settlement rules. Chicago moved to Midway, Austin is recorded as an explicit, documented choice, and test 90 requires each entry to carry the NWS point response it was verified against - a note that cites no observation fails the build.',
    userAction: 'Open the two Chicago links and compare their relativeLocation fields: 41.7868,-87.7522 answers "Chicago, IL" on grid LOT 72,69 because Midway is the station Kalshi settles on.'
  },
  {
    id: 40, severity: 'med',
    title: 'The first nine-city capture stored a full set of nulls under the name "resolved identity"',
    assumed: 'That reading gridId/gridX/gridY/forecastZone/timeZone off the response used to build a snapshot was enough to record what api.weather.gov said the point is.',
    truth: 'The capture fetched two different documents: GET /points/{lat},{lon} (which carries the identity) and GET {properties.forecast} (which carries only the forecast). captureLocation() returned the FORECAST document under the name properties, and the resolved block read identity fields out of it - so every store written by commit ae16030 recorded gridId/gridX/gridY/forecastZone/county/relativeLocation/timeZone as null while still stamping resolvedAt: it claimed a resolution it had not stored. The forecast rows themselves were correct; the identity metadata was not.',
    evidence: [
      { label: 'The capture that wrote the nulls', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/commit/ae16030' },
      { label: 'Point response that carries the identity (Miami)', url: 'https://api.weather.gov/points/25.7959,-80.287' },
      { label: 'Forecast response the code was reading instead', url: 'https://api.weather.gov/gridpoints/MFL/106,51/forecast' },
      { label: 'What the store showed', url: null, text: 'data/forecasts/miami-mia.json (ae16030): location.resolved = { gridId: null, gridX: null, gridY: null, forecastZone: null, county: null, relativeLocation: null, timeZone: null, resolvedAt: "2026-09-18T13:24:29.350Z" } while snapshots[0].forecast_url = ".../gridpoints/MFL/106,51/forecast"' }
    ],
    action: 'captureLocation() now returns the two documents separately (pointProperties vs forecastProperties) and identity is read from the point document only. Three guards make the failure mode impossible to repeat silently: the capture compares the live identity against the nwsGrid written in the configuration and refuses to write on a mismatch; the offline audit (--verify) fails on an incomplete or mismatched resolution and on a forecast URL that encodes a different grid; and test 90 asserts the shipped module agrees with the configuration field for field. The workflow now runs the audit under set -o pipefail and fails the run when any location did not capture.',
    userAction: 'Compare data/forecasts/miami-mia.json with the two links: the forecast URL always said MFL/106,51, which is exactly what the point response says and what the store now records instead of nulls.'
  },

  {
    id: 41, severity: 'high',
    title: 'A push race silently discarded an entire ingest run\'s data (the bot committed nothing and exited 128)',
    assumed: 'That the inline push-race guard in the three bot workflows could always recover from losing a push race by rebasing on the remote tip.',
    truth: 'The first post-merge ingest run on main (2026-09-18, run 35352002809) fetched a full universe of bars and then died at its "Commit the new history" step with exit code 128, so EVERY bar, book snapshot and settlement check that run collected was discarded — the runner\'s disk is thrown away. Root cause, three stacked bugs: (1) ingest-now.yml\'s commit step added data/, src/accumulated-history.js and docs/data but NOT src/forecast-data.js, which the module-regeneration step had just rewritten — the tree kept a tracked-but-unstaged file; (2) the forecast bot won the push race meanwhile, and `git rebase` refuses to start with unstaged changes (its own exit 128); (3) the failure branch then ran `git rebase --continue` and `git rebase --abort` — both fail with "no rebase in progress" (exit 128) — and because GitHub runs run: steps with bash -e, the abort\'s exit code terminated the step before the ::error message could be emitted. The daily-history.yml copy of the guard had already been fixed for exactly this race; ingest-now.yml had not.',
    evidence: [
      { label: 'The failed run (job log shows all steps green until "Commit the new history")', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35352002809' },
      { label: 'The recovered re-run (same universe, committed by the new guard)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35377388737' },
      { label: 'The fix — one shared, locally-tested script', url: null, text: 'scripts/push-with-race-guard.sh: commits EVERYTHING the run changed (git add -A, run logs now git-ignored), rebases with --autostash, auto-resolves rebase conflicts ONLY for generated modules and ONLY by regeneration, aborts cleanly on any other conflict, and never lets a `git rebase --abort` failure terminate the script.' },
      { label: 'The regression test', url: null, text: 'test/workflow-race-guard.sh — 21 checks against a real bare-repo remote, including a replay of the exact 2026-09-18 race (tracked-but-unstaged module + concurrent bot push) and the data-conflict case, which must fail the job rather than commit conflict markers.' }
    ],
    action: 'All three workflows (ingest-now.yml, daily-history.yml, weather-signals.yml) now call the shared script. The lost bars were not lost permanently — the exchange is the source of truth and the request-9 re-run re-fetched the same windows — but the 14:45–18:00 UTC window on 2026-09-18 had no ingest commit until the re-run landed, and any analysis run in that window saw a store that lagged reality by hours.',
    userAction: 'Open the two run links and compare their Commit steps; then run `bash test/workflow-race-guard.sh` locally to watch the exact failure mode and its fix execute.'
  },

  {
    id: 42, severity: 'low',
    title: 'The MasterSite directory\'s audit record for StockPaperSim is stale — the repository was rebuilt after the audit',
    assumed: 'That the directory\'s per-site audit records (categories, descriptions, commit counts, flags) describe the current state of each repository.',
    truth: 'The directory data (MasterSite data/sites.js, audit stamp 2026-09-17T21:47:46Z) records StockPaperSim as a "README-only placeholder… a single initial commit containing only a 15-byte README.md". The repository was rebuilt the next day: as of 2026-09-18T17:45:57Z it has 30 commits (PR #9 merged) and a full README describing a one-year paper-trading stock competition with two seasons, a venue model and its own secondary-source honesty labels. The directory entry is factually wrong about the repository it points at — not because the audit lied, but because it has not been re-run.',
    evidence: [
      { label: 'The stale audit record (fetched via the GitHub API 2026-09-18)', url: 'https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js' },
      { label: 'The repository the record describes (now 30 commits)', url: 'https://github.com/buffedlizard55-lab/StockPaperSim' },
      { label: 'The rebuild merge', url: 'https://github.com/buffedlizard55-lab/StockPaperSim/pull/9' }
    ],
    action: 'Recorded in the signal-source ledger (S19) so no one cites the directory\'s placeholder description as current. This repository\'s own S19 entry describes the project as it is now. The directory itself needs its audit re-run (tools/build_data.py) to refresh the record — that is an action for the MasterSite repository, not this one.',
    userAction: 'Re-run the MasterSite audit (its tools/build_data.py) and check whether any other entry also drifted — a directory of 38 sites audited once will drift again.'
  },

  {
    id: 43, severity: 'med',
    title: 'The exchange lists TWO Tesla-CEO series with the same question — one has traded, one never has',
    assumed: 'That a series ticker uniquely identifies a question, so ingesting the KXTESLACEOCHANGE series the discovery run returned would capture the Tesla CEO-exit market.',
    truth: 'Two distinct series exist for the SAME question "Musk out as Tesla CEO before 2026?": TESLACEOCHANGE-26 (series TESLACEOCHANGE) — active, 88,884.37 contracts of lifetime volume, 399 stored daily bars from a 2024-05-15 open; and KXTESLACEOCHANGE-26 (series KXTESLACEOCHANGE) — inactive, volume_fp 0.00, and an EMPTY candlestick response for its whole life window. Both were captured from the official API on 2026-09-18 (data/history/TESLACEOCHANGE-26.json, data/history/KXTESLACEOCHANGE-26.json). The KX-prefixed twin looks like a re-listed or re-namespaced copy that never attracted flow.',
    evidence: [
      { label: 'The market that trades (88,884 contracts, 399 bars)', url: 'https://external-api.kalshi.com/trade-api/v2/markets/TESLACEOCHANGE-26' },
      { label: 'The market that never traded (volume 0, no bars)', url: 'https://external-api.kalshi.com/trade-api/v2/markets/KXTESLACEOCHANGE-26' },
      { label: 'Its empty candlestick response', url: 'https://external-api.kalshi.com/trade-api/v2/series/KXTESLACEOCHANGE/markets/KXTESLACEOCHANGE-26/candlesticks?period_interval=1440' }
    ],
    action: 'The CEO strategy (CEOExit_Drift) trades TESLACEOCHANGE — the series with real bars — and its universe names that ticker explicitly. The empty twin is kept in the store as captured (deleting it would hide the fact) and the calendar audit now REPORTS zero-bar stores instead of crashing on them (`emptyStores` in data/reports/calendar-audit.json; the crash was found when the request-9 ingest introduced the empty market).',
    userAction: 'Open both market links and compare volume_fp; a strategy that discovered "the Tesla CEO market" by keyword alone could easily trade the dead twin, so universe choices cite their bars.'
  },
  {
    id: 44, severity: 'med',
    title: 'The MasterSite directory card for THIS repository (KalshiPaperSim) is stale',
    assumed: 'That the MasterSite directory would stay current with this repository as the project grew, so a reader of the owner\'s directory would see the same counts the repo publishes.',
    truth: 'Fetched 2026-09-18, the MasterSite card listed KalshiPaperSim as 53 facts / 19 irregularities / 10 strategies / 9 markets / 61 candles / 50 tests. The in-repo AUTO block at the same date is 97 facts / 43 irregularities / 41 strategies / 9 markets / 10,905 candles / 111 tests (plus the Live Desk). Same class of directory drift as StockPaperSim (#42), but for this project.',
    evidence: [
      { label: 'MasterSite sites.js (the directory export)', url: 'https://github.com/buffedlizard55-lab/MasterSite/blob/main/data/sites.js' },
      { label: 'This repository AUTO:COUNTS (regenerated, never typed)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/README.md' }
    ],
    action: 'Flagged as V105. The directory is a sibling project this repo does not write to; the honest action is to name the drift so a reader is not shown the 10-strategy card as current. Updating MasterSite is the owner\'s directory pipeline, not a KalshiPaperSim code change.',
    userAction: 'Open the MasterSite directory and this repository\'s README AUTO:COUNTS block and compare the published numbers.'
  },
  {
    id: 45, severity: 'med',
    title: 'Desk usernames were not reserved, so a human could impersonate a Live Desk entry',
    assumed: 'That validateUsername() reserved every algorithmic handle because it walked the stored year\'s strategies array.',
    truth: 'Desk entrants live in DESK_STRATEGIES, not STRATEGIES. A stored year that predated the desk had no Live* rows, so a human could register LiveFavourite_Settle. The Live Desk also did not attach its session to the one-year memory, so desk fills were not in the exportable year.',
    evidence: [
      { label: 'validateUsername + DESK_RESERVED_USERNAMES (reviewable in this repo)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/competition-memory.js' },
      { label: 'Desk roster (13 Live* usernames)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-strategies.js' }
    ],
    action: 'validateUsername() now always unions STRATEGIES + DESK_RESERVED_USERNAMES (kept set-equal to DESK_STRATEGIES by test 104) plus any stored deskMemory.results. attachDeskSession() copies compact results and FILL/SETTLE rows into the year with kind desk. Positions are still not carried across cut-offs — that remaining gap is stated on the README.',
    userAction: 'Try registering LiveFavourite_Settle as a human participant; the platform must refuse it as reserved.'
  },
  {
    id: 46, severity: 'high',
    title: 'The forward walk read a bar list that stops at the cut-off, so a resting order could never be crossed by a real trade',
    assumed: 'That buildTimeline() could see later candlestick quotes because it filtered events by `endTs > asOfMs` and the desk publishes the bar walk as live instrumentation.',
    truth: 'It read `universe.markets[].bars`, and buildDeskUniverse deliberately truncates every bar list AT the cut-off — that truncation is what keeps a DECISION point-in-time. The `endTs > asOfMs` filter could therefore never admit a bar, at any cut-off. Measured on the 2026-09-18 store: bars after the cut-off inside the decision view = 0 at live/−6h/−12h/−24h, while the store itself held 185/272/513 later ladder captures at those cut-offs. Result: a resting (maker) order could only be crossed by a sparse later ladder snapshot, never by a real traded candlestick, and no paper position could be resolved by a later real trade. The Live Desk reported 0 maker fills at every cut-off it was asked about.',
    evidence: [
      { label: 'buildTimeline() — now reads the RAW store bars and filters by endTs itself (commented in place)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js' },
      { label: 'buildDeskUniverse() truncation — the reason the decision view must NOT see later bars', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js' },
      { label: 'Regression test 107 pins both halves (non-zero forward quotes; no decision bar after asOf)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js' }
    ],
    action: 'buildTimeline() now walks the raw store bars (data.markets[].bars) and filters by `endTs > asOfMs` itself, while the universe handed to strategies keeps truncating at the cut-off. After the fix the −6h cut-off walks 338 candlestick quotes + 4 real settlements (342 events), −12h walks 568 and −24h walks 1172; the newest capture honestly walks 0 because the store ends there. A carried maker order now fills at the −15h cut-off (1 maker fill) and the season book is crossed by later real quotes.',
    userAction: 'Open the Live Desk tab at the −6h cut-off: "events walked" must be non-zero, and every maker fill must name the later real quote that crossed it (irregularity #46 is what made that number zero).'
  },
  {
    id: 47, severity: 'med',
    title: 'A reserved season username was longer than the platform limit, so the reservation never applied to it',
    assumed: 'That adding a handle to DESK_RESERVED_USERNAMES was enough to stop a human claiming it.',
    truth: 'validateUsername() checks username_length_3_to_24 BEFORE the reserved set, and the season handle `SeasonWeather_SettleCarry` is 25 characters. For that exact name the reserved-name branch was unreachable: the validator returned username_length_3_to_24. Test 112 — written with the season — asserts every roster username satisfies the same 3–24 and allowed-character rules the platform enforces, and it failed on its first run. A user could not have impersonated the entrant (the name was rejected), but the reservation the roster claimed to hold did not exist.',
    evidence: [
      { label: 'validateUsername() — length check precedes the reserved set', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/competition-memory.js' },
      { label: 'Season roster — now SeasonWeather_Carry (20 chars)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season-strategies.js' },
      { label: 'Test 112 — enforces the platform rules over the season roster', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js' }
    ],
    action: 'Renamed to SeasonWeather_Carry (20 characters) in src/desk-season-strategies.js and src/competition-memory.js. Test 112 now asserts the length + character rules over every season entrant, and test 104 asserts DESK_RESERVED_USERNAMES is exactly the union of the desk AND season rosters, with no duplicate handle between them.',
    userAction: 'Try to register SeasonWeather_SettleCarry: the platform refuses it for LENGTH, not because it is reserved — that was the hole the rename closed.'
  },
  {
    id: 48, severity: 'med',
    title: 'A superseded ingest request could not be cancelled, so two ingests ran against the same branch',
    assumed: 'That an automation which can START a workflow run (by committing .github/triggers/ingest.json) can also stop one.',
    truth: 'gh run cancel 35421506770 → HTTP 403 "Resource not accessible by integration": the GitHub App token this repository is automated with has no actions:write. A second trigger commit therefore started a second run while the first was still fetching, and nothing the automation holds can stop either. Run 35420823590 (188 tickers) and the duplicate 35421506770 (181 tickers, a strict subset) then raced to commit to the same branch.',
    evidence: [
      { label: 'ingest-now.yml — the trigger mechanism and its push-race guard step', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.github/workflows/ingest-now.yml' },
      { label: 'IRR #41 — the same race, previously lost by an inline git add', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/IRREGULARITIES.md' }
    ],
    action: 'Both runs were allowed to finish: the ingest is additive and scripts/push-with-race-guard.sh is the tested rebase-and-retry path for exactly this race (the duplicate cost only exchange API budget and runner minutes). ingest-now.yml now declares a per-ref concurrency group with cancel-in-progress: false, so a later request QUEUES behind the run in flight instead of racing it — the only brake available when cancelling is not permitted.',
    userAction: 'Push two ingest requests back to back and watch the Actions tab: the second run must show as queued, not running in parallel.'
  },
  {
    id: 49, severity: 'high',
    title: 'The desk let a paper account borrow cash and sell contracts it did not hold',
    assumed: 'That a strategy sizing from `view.cash` could never spend more than it had, so the desk needed no cash rule of its own.',
    truth: 'placeDeskOrder() sized against the captured LADDER and the 10% liquidity cap, and never against the portfolio. An entrant that emitted three 35%-of-cash legs (or a carried season entrant re-spending its cash every round) could spend more than 100% of it, and a `sell` intent with no position was booked as a naked short — both on a venue that settles in cash and does not offer margin or shorting. The desk audit could not catch it either: the equity identity (equity − starting = realized + unrealized − fees) closes just as neatly on a −$80,000 cash balance as on a real one.',
    evidence: [
      { label: 'placeDeskOrder — now carries the cash/position guards and records them on the order and the fill', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js' },
      { label: 'Season audit S12 re-derives both rules from the ledger alone', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season.js' },
      { label: 'Test 114 — borrow, naked short and over-sized sell all refused or capped', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js' }
    ],
    action: 'Both runners now pass their portfolio into placeDeskOrder(). A BUY is re-sized to what the cash can pay for including the official fee (a 2% budget reserve covers the quadratic taker fee) and the reduction is recorded as `cashCapped` on the ORDER and the FILL, with the original requested size preserved and the shortfall reported as unfilled. A SELL with no position is rejected (NO_POSITION_TO_SELL) instead of opening a negative one, and a SELL larger than the position is capped to the held size (`positionCapped`). A crossed resting BUY is capped the same way at the crossing instant, because a carried book may have spent the cash in between. auditSeason() adds S12: no round snapshot may show negative cash and no SELL fill may exceed what that entrant had already bought.',
    userAction: 'Read any FILL with `cashCapped` > 0 or any REJECT with NO_POSITION_TO_SELL in data/reports/desk-season-ledger.jsonl: the ledger must show a smaller order (or a refusal), never a negative balance.'
  },
  {
    id: 50, severity: 'med',
    title: 'The FDA archive was deployed against an API hostname that does not exist, with an over-limit page size',
    assumed: 'That the openFDA Drugs@FDA endpoint lived at api.open.fda.gov (conflating the open.fda.gov website with the API host) and that limit=1000 was inside the published cap.',
    truth: 'The official how-to page states the base endpoint is https://api.fda.gov/drug/drugsfda.json and that "the maximum limit allowed is 99". The first two scheduled runs therefore could never have fetched anything: GitHub-hosted runners resolved api.open.fda.gov with ENOTFOUND (recorded per-subject in data/fda-signals/_fda-last-run.json, whose probe table showed api.weather.gov reachable and download.open.fda.gov returning HTTP 200 from the same runner). No snapshot was fabricated and no false data was committed — the store was simply dark, which is the honest failure mode the point-in-time design requires.',
    evidence: [
      { label: "The endpoint's official how-to page (base URL and the limit<=99 cap)", url: 'https://open.fda.gov/apis/drug/drugsfda/how-to-use-the-endpoint/' },
      { label: 'The corrected ENDPOINT, probe table and host history in scripts/archive-fda-signals.mjs', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-fda-signals.mjs' }
    ],
    action: 'ENDPOINT corrected to https://api.fda.gov/drug/drugsfda.json, the page size corrected to the documented maximum of 99 (with truncation made visible: the snapshot stores both the full `total` and the archived `applications` count), the reachability probe kept in every run report, and the host history recorded in the script header. This register entry exists so the wrong-host period is part of the audit trail, not silently rewritten.',
    userAction: 'Compare any committed _fda-last-run.json probe table against the snapshots that follow it: every capture after the correction must carry http_status 200 against https://api.fda.gov URLs.'
  },
  {
    id: 51, severity: 'high',
    title: 'A successful scheduled weather capture was lost at the commit step: the push guard could only auto-resolve two of the files the bots regenerate',
    assumed: 'That the push guard\'s auto-resolve list (src/accumulated-history.js, src/forecast-data.js) covered every file a data bot\'s regenerate step rewrites, so a queued run that rebased onto another bot\'s commit would always be able to finish.',
    truth: 'Scheduled "Weather signal archive" run 35470529935 on main (2026-09-19, job 105974446303): the capture, audit and regenerate steps SUCCEEDED, then "Commit the new snapshots" failed with the annotations "conflict in src/fda-signal-data.js / src/desk-data.js / docs/src/forecast-data.js / docs/src/fda-signal-data.js is not a generated module — cannot resolve locally" and "could not sync with origin/main — re-run this job". While the run sat in the data-pipeline queue the ingest bot had pushed its own regenerated desk / FDA modules and docs/ copies; the old GENERATED_PATHS list did not name them, so the guard treated real generated files as hand-written and aborted. The freshly captured NWS snapshots existed only on the runner and were discarded with it — no false data was written, but a real capture was lost.',
    evidence: [
      { label: 'The failed run (annotations on the commit step)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35470529935' },
      { label: 'The fix (commit 885e3fa): every regenerated file auto-resolvable, only by regeneration', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/push-with-race-guard.sh' },
      { label: 'test/workflow-race-guard.sh — scenarios 7 and 8 reproduce the race and the refusal', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/workflow-race-guard.sh' }
    ],
    action: 'scripts/push-with-race-guard.sh now lists every file the workflows\' regenerate step rewrites (the five browser modules, README/VERIFICATION/IRREGULARITIES, index.html, docs/) and resolves a conflict on them ONLY by re-running the same regeneration chain over the merged tree, then refuses to commit if any conflict marker survives; every data bot fast-forwards onto the branch tip BEFORE capturing; the weather, FDA and MLB workflows upload their store directory as an artifact when a run fails so a capture can no longer die with the runner; daily-history.yml joined the shared per-ref queue. A unit test checks the guard\'s list against the generator scripts and every workflow\'s regenerate step. The lost capture itself is not recoverable — the archive simply has no 2026-09-19 ~21:4x snapshot, which the coverage table shows.',
    userAction: 'Open the run link: the capture step is green and the commit step red with the quoted annotations. Then compare data/forecasts/*.json captured_at values around 2026-09-19T21:40Z — there is none, and there should be none.'
  },
  {
    id: 52, severity: 'med',
    title: 'The site\'s "what this project cannot test yet" cards and three MasterSite ledger entries kept saying no sports series / no 1-minute bars / no settlements existed — two days after the store had all three',
    assumed: 'That the research-gap cards (src/research-sources.js RESEARCH_GAPS) and the S09 / S10 / S17 ledger texts were still true, because nobody re-read them after the store grew.',
    truth: 'Written on 2026-09-17 against a store of three daily index/BTC series, four of the five gap cards had become false by 2026-09-18 and were still published on 2026-09-20: "no weather series is ingested" (nine KXHIGH* series plus the NWS archive shipped 09-18), "no sports series is ingested" (seven hourly game-line series shipped 09-18), "the intraday store is configured for period 60" (1-minute blocks shipped 09-18), "nothing in the tracked universe has finalised yet" (status=all blocks store exchange results and the replay books them). S09 said "No MLB series in the universe" while nine finalized KXMLBGAME contracts sat in data/history/intraday/60m/. None of these sentences affected a number — they were prose about the store — but a "cannot test" card that is false hides a test that is possible, which is the opposite of the honesty contract.',
    evidence: [
      { label: 'RESEARCH_GAPS with status/closedBy fields (each closed gap keeps its original wording as WAS:)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/research-sources.js' },
      { label: 'The store that contradicted the cards: data/history/intraday/60m/ (sports, weather, settled results) and intraday/1m/', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/tree/main/data/history/intraday' }
    ],
    action: 'RESEARCH_GAPS entries now carry status (open / partially closed / closed) and closedBy with the date and the artefacts that closed them; closed gaps stay on the list so the history is visible, and the Research tab shows the status badge. S09, S10, S14, S15 and S17 were re-worded to the store as it is on 2026-09-20 (S09 is now a live signal via the official MLB Stats API archive). The general rule is the same one the store-facts captions follow: a sentence about the store must either be computed from the store or carry the date it was true.',
    userAction: 'Open the Research tab: every gap card shows a status badge, and a closed card names what closed it. Grep the repository for "No sports series" — it must appear only inside the WAS: history of a closed gap or in this register.'
  },
  {
    id: 53, severity: 'high',
    title: 'A parallel session merged PR #17 with strategy cards that described signals the code does not read, two "sources" that are search pages, and a fabricated "upcoming trades" list',
    assumed: 'That everything merged to main under the honesty contract had been checked line by line against the code: that a card saying "when insiders hold equity" reads insider data, that a quoted source can be opened, that an "upcoming trade" is a strategy decision.',
    truth: 'PR #17 (commit cf4e116, merged 2026-09-20T03:08Z by a concurrent session while this one was working on the same repository) added: (1) InsiderFiling_Drift / LiveInsider_FilingFader, whose text claimed Form 4 / insider-retention signals while the code reads only the contract\'s own prices (and the desk version assumed a YES ask of 0.20 when no quote existed); (2) TheLeap_BreakoutRank / LiveTheLeap_Momentum, attributing "champion" behaviour to The Leap without a source; (3) LiveWeather_ForecastEdge, whose card and order reasons said "reads the point-in-time NWS forecast" while the code bought any KXHIGH bracket asked ≤ 0.45 without opening the archive; (4) GridMM_MultiTier, whose rules said "rest a limit buy … sell at +3 ticks" while decide() sent a taker market buy with no exit; (5) FOMC_ProbabilitySniper, whose text cited CME FedWatch divergence and a "modal strike" the code never computes; (6) NCAAF_GameFavourite, stating as fact that 0.60–0.85 favourites "settle YES at a frequency exceeding implied probability" with no source; (7) research entries R16/R17 whose URLs are a YouTube search page and an X search page, with "quotations" that cannot be attributed; (8) fact V109 claiming all 13 MasterSite projects were "mapped to concrete, executable trading strategies with verified pricing"; (9) a Live Desk "upcoming trades" builder that, for entrants without a declared plan, INVENTED rows from regex matches on the strategy id, a default price of 0.50 and generated trigger text ("Enter order when contract conditions align with …") — shown on the site as READY setups. Its placed-trades ledger, the UI tables and the new tests were sound.',
    evidence: [
      { label: 'PR #17 as merged', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/pull/17' },
      { label: 'The corrected entries (src/strategies.js, src/desk-strategies.js) and the record-derived buildUpcomingTrades (src/live-desk.js)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/live-desk.js' },
      { label: 'R16 / R17 re-labelled UNATTRIBUTED in src/research-sources.js', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/research-sources.js' }
    ],
    action: 'Nothing was deleted and no username changed (they are the competition\'s identities): every card was rewritten to say exactly what its code reads; LiveWeather_ForecastEdge was rewritten to actually read the NWS archive at the cut-off (the desk market view now exposes the bracket strikes it needs); GridMM_MultiTier was rewritten to rest maker orders as its rules state; the desk entrant that assumed a 0.20 quote now abstains without one; R16/R17 carry a new capture method UNATTRIBUTED and their strategies are labelled original designs; V109/V110 were re-worded; S02/S03 were restored to not-testable-as-a-signal with the entries listed as price-only; buildUpcomingTrades now compiles ONLY from the desk\'s own ORDER/FILL/REST records (open positions awaiting settlement, working maker orders, unfilled remainders) and the fabricated per-entrant upcoming() hooks were removed. A new test asserts that no strategy text names a signal source its code does not import. Process finding: two sessions on one repository must merge each other\'s branch before writing — this session did (its first commit is that merge), the other did not.',
    userAction: 'Open PR #17\'s diff for src/desk-strategies.js and compare LiveWeather_ForecastEdge.decide() there (no forecast read) with the current file (forecastHighAt at the cut-off). Then open the Live Desk tab: every upcoming-trade row now names the ORDER record it came from (id UPC-<orderId>-…).'
  },
  {
    id: 54, severity: 'med',
    title: 'The desk-season schedule only counted a capture batch as a round if some contract got its FIRST-EVER ladder in it — so re-capturing an unchanged universe (ingest request 14) added no round at all',
    assumed: 'That every new ingest pass adds a season round ("a new scheduled ingest adds a round", the schedule\'s own comment), and that ingest request 14 — requested on 2026-09-19 precisely to add one — had done so.',
    truth: 'seasonSchedule() defaulted minNewLadders to 1: a batch qualified only when a market\'s first-ever ladder fell inside it. Request 14 re-queried exactly the request-13 universe at 2026-09-20T00:40Z (732 captures across 80 open contracts) and produced zero rounds; the 2026-09-19T21:57Z re-capture was dropped for the same reason. The season therefore stopped at R03 (2026-09-19T15:34Z) while the store held two later full boards. A second, smaller flaw: the 5-minute batch window split one ingest pass into two rounds (2026-09-19T11:02Z with 12 ladders and 11:08Z with 3), because a pass pauses for more than five minutes between blocks.',
    evidence: [
      { label: 'seasonSchedule() — minNewLadders / minFreshLadders / batchMinutes and the HISTORY note', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-season.js' },
      { label: 'The regenerated schedule (data/reports/desk-season-schedule.json): six rounds, R05 21:57Z and R06 00:40Z now present', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/desk-season-schedule.json' }
    ],
    action: 'A round is now any capture batch in which at least one tracked contract\'s ladder was (re)captured (minFreshLadders = 1); first-ever novelty is no longer required (minNewLadders = 0); the batch window is 20 minutes. On the pre-merge store rounds went from 3 to 6 (2026-09-18T00:03Z → 2026-09-20T00:40Z); on the merged 2026-09-20 store (both branches\' captures) the old rule gives 4 and the corrected rule 5 (2026-09-18T02:46Z → 2026-09-20T03:53Z, the 21:53Z re-capture being the round the old rule dropped). The 27 season checks still pass, and each round row now publishes freshLadderCaptures next to newLadderCaptures so the difference is visible in the schedule file and on the Desk Season tab.',
    userAction: 'In data/reports/desk-season-schedule.json, R04 (2026-09-19T21:53Z) has newLadderCaptures 0 and freshLadderCaptures 76: a full re-capture of the open board that the old rule would have skipped.'
  },
  {
    id: 55, severity: 'low',
    title: 'The FDA and MLB archive workflows committed their raw capture logs to the repository root on every run',
    assumed: 'That every bot\'s scratch log was covered by .gitignore, as ingest.log and forecast.log are, so the race guard\'s `git add -A` could never sweep one into a data commit.',
    truth: 'Only /ingest.log and /forecast.log were ignored. fda-signals.log has been committed by every FDA run since 2026-09-19 (it is in main\'s tree), and the first MLB run on 2026-09-20 (run 35491621248) committed mlb-signals.log the same way. No data was affected — the logs duplicate what the runner already uploads as an artifact — but a tracked log file changes on every run, which makes every bot commit larger than its data and would let two bots conflict on a file nobody needs.',
    evidence: [
      { label: '.gitignore (the two new entries)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.gitignore' },
      { label: 'The first MLB capture run, whose commit carried mlb-signals.log', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35491621248' }
    ],
    action: '/fda-signals.log and /mlb-signals.log added to .gitignore and both files removed from the tree (git rm --cached). The logs remain available as workflow artifacts (fda-signals-log / mlb-signals-log) and the per-run JSON reports (_fda-last-run.json / _mlb-last-run.json) stay committed, which is the diagnosable record the design wants.',
    userAction: 'After this PR merges, no *.log file should appear at the repository ROOT in any bot commit: `git ls-files "*.log" | grep -v ^data/` on main must be empty (data/history/_last-run.log is the ingest\'s deliberately committed copy and stays).'
  }
,
  {
    id: 56, severity: 'high',
    title: 'The test suite was RED ON MAIN and had been for at least one merge: a syntax error stopped every test from running, and a second test asserted on a Promise',
    assumed: 'That `npm test` passing 122/122 (as the previous session\'s ROADMAP claimed) still described main, and that a merged PR\'s new tests had been executed at least once before the merge.',
    truth: 'At commit e86cb9b, `node --test test/simulation.test.js` failed at import time with "SyntaxError: Unexpected reserved word" at line 3672: test 100 ("settlement pays the exchange\'s own result…") awaited `runDeskSession(...)` inside a non-async `() => {}` callback. A syntax error kills the whole file, so the runner reported ONE failed test and executed NONE of the 134. Making the callback async exposed a second defect: test 118 called the async `buildDeskReport(...)` without `await`, so `assert.ok(report.ok)` tested a Promise (undefined) and failed with "desk report builds cleanly" — the same call awaited returns 84 records and passes. Both came in with PR #17 (irregularity #53 already covers its prose). No shipped number depended on either test — but a suite that cannot parse is a suite that verifies nothing, and every claim of "122/122 green" made after that merge was unverifiable.',
    evidence: [
      { label: 'The failing run at the branch point', url: null, text: 'node --test test/simulation.test.js at e86cb9b → "SyntaxError: Unexpected reserved word" at test/simulation.test.js:3672; # tests 1, # fail 1, nothing executed' },
      { label: 'test/simulation.test.js (tests 100 and 118)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/test/simulation.test.js' },
      { label: 'The awaited call, verified in isolation', url: null, text: 'await buildDeskReport({data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null}) → ok, 84 records' }
    ],
    action: 'Test 100\'s callback is now `async () => {}`; test 118 awaits buildDeskReport() and carries a comment explaining that the un-awaited call asserted on a Promise. The suite ran 134/134 green after the two fixes, before this session\'s four Form 4 tests were added.',
    userAction: 'Treat any claim of a green suite as unverified unless `npm test` was run in that session. If a future merge adds a test, the merge itself must show the runner output — a suite that cannot parse reports one failure and verifies nothing.'
  },
  {
    id: 57, severity: 'info',
    title: 'One tracked CEO-change contract can NEVER receive an insider signal: OpenAI is a private company, so EDGAR holds no Form 4 for it',
    assumed: 'That every tracked company-event contract maps to an SEC filer, because the other four (Tesla ×2, JPMorgan, Apple) do.',
    truth: 'KXOPENAICEOCHANGE-26 asks "If OpenAI\'s CEO (including an interim CEO) changes by Dec 31, 2026…". Section 16 applies to issuers with a class of equity securities registered under the Exchange Act; OpenAI is private, has no ticker and no CIK, so there is no Form 4 population to archive and no honest insider signal for that contract. It is recorded in EXCLUDED_ISSUERS with this reason rather than left as a silent gap, and both the roster entry and the desk entrant say so on their cards: for that ticker the signal is null, the trade is skipped, and the skip reason is published by form4JoinReport() / the desk coverage row.',
    evidence: [
      { label: 'The contract\'s own rules_primary in the store', url: null, text: 'data/history/KXOPENAICEOCHANGE-26.json → "If OpenAI\'s CEO (including an interim CEO) changes by Dec 31, 2026, then the market resolves to Yes." (status active, 14 captured ladders, no EDGAR filer)' },
      { label: 'EXCLUDED_ISSUERS, where the exclusion and its reason live', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/archive-form4-signals.mjs' }
    ],
    action: 'KXOPENAICEOCHANGE is listed in EXCLUDED_ISSUERS with this reason, published in the trigger file, on both strategy cards, and by form4JoinReport() as SERIES_NOT_TRACKED_BY_FORM4_ARCHIVE. Neither entry trades it and neither pretends to have a signal for it.',
    userAction: 'Nothing to fix — this is a property of the market. If Kalshi lists a company-event contract on another private company, the same rule applies: no EDGAR filer, no Form 4 signal, abstain with the reason published.'
  },
  {
    id: 58, severity: 'med',
    title: 'Two source behaviours could not be verified from this sandbox: EDGAR\'s Atom filters are unreliable, and the ESPN scoreboard shape was never retrieved',
    assumed: 'That a documented query parameter does what it says (EDGAR\'s `type=4`, `count=5`), and that every endpoint named in the ROADMAP could be fetched and read from the working environment.',
    truth: '(1) EDGAR: the same browse-edgar Atom query returned form 4 rows for CIK 0001318605 but 424B2 rows for CIK 0000019617, and returned 10 entries for both despite count=5 — so the feed\'s filters cannot be trusted. The archive parses every entry\'s form type, keeps only form 4, and publishes `formsSeen` per issuer in the run report so an ignored filter is visible. (2) ESPN: the injuries endpoint WAS verified live (GET https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries → {timestamp, status, season, injuries:[{id, displayName, injuries:[{id, longComment, shortComment, status, date, athlete:{firstName, lastName, displayName, shortName, position:{abbreviation}, team:{id, uid, slug, name, abbreviation, displayName}}}]}]}), and the scoreboard envelope was verified for NCAA men\'s basketball ({leagues[], groups, events[], provider, eventsDate{date, seasonType}}), but the per-EVENT scoreboard structure (competitions[].competitors[].score, status.type.state/clock) could not be retrieved — the fetch tool repeatedly rewrote that request to an unreachable proxy URL. No scoreboard parser was written from memory: shipping one would have been exactly the guess the honesty contract forbids.',
    evidence: [
      { label: 'EDGAR Atom feed, Tesla (type=4 → 10 form-4 rows)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom' },
      { label: 'The SAME query for JPMorgan (type=4 → 10 rows of form 424B2)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=00019617&type=4&dateb=&owner=include&count=5&output=atom', text: 'the filter is ignored; count=5 returned 10 entries in both cases' },
      { label: 'ESPN public injuries JSON, verified live 2026-09-21', url: 'https://site.web.api.espn.com/apis/site/v2/sports/football/nfl/injuries' },
      { label: 'ESPN scoreboard envelope, verified live 2026-09-21 (NCAA men\'s basketball, empty events[])', url: 'https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?dates=20260920' }
    ],
    action: 'The Form 4 archive parses every feed entry\'s form type, keeps only form 4, and publishes formsSeen per issuer in data/form4-signals/_form4-last-run.json; a form the archive did not expect is visible, never silently dropped. NO ESPN scoreboard parser was written: the injuries half (verified) and the scoreboard half (not verified) are recorded in ROADMAP "Next #1" with the exact verified JSON paths, so the next session builds on evidence instead of re-deriving the shape from memory.',
    userAction: 'Before shipping an ESPN archive, capture one real scoreboard response from a runner with egress and keep it as a labelled fixture the parser is tested against — the same discipline that produced data/form4-signals/fixtures/ and data/mlb-signals. Do not write the parser first.'
  },
  {
    id: 59, severity: 'med',
    title: 'The first live Form 4 capture was refused by EDGAR with HTTP 403 — the same failure class as #50',
    assumed: 'That a declared User-Agent with contact information was enough for EDGAR to answer an automated client, because the same browse-edgar Atom page had been retrieved successfully from the build sandbox earlier the same day.',
    truth: 'The workflow\'s first run (2026-09-21T04:52:48Z) was answered **HTTP 403** for all three issuers, with an XHTML error page in the body. The request that was refused carried User-Agent "KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim; research contact: …)" — a URL in parentheses, whereas EDGAR\'s own guidance states the format "Sample Company Name AdminContact@<sample company domain>". The root cause is NOT yet proven: 403 from EDGAR can also mean rate limiting or an IP-range block on the runner, and the run report at the time kept only 160 characters of the body and no headers, so the reason could not be told from the repository. This is the exact pattern of irregularity #50, where an archive was designed and shipped against a source that had never been reached. **RESOLVED DIAGNOSIS (the 2026-09-21T07:49Z run on main, with the new diagnostics):** still `HTTP 403 Forbidden` with the corrected agent string, but now carrying `server: AkamaiGHost`, `content-type: text/html` and NO `retry-after` or rate-limit header. An XHTML page from SEC\'s CDN edge means the request is refused before EDGAR\'s application sees it — so the User-Agent is NOT the cause, and the likeliest one is the runner\'s IP range being blocked at the edge (the same URL answered a different client on 2026-09-21, fact V114). **PROBE ANSWERED IT (run 2026-09-21T07:58:11Z):** both SEC hosts refused the same documented path — www.sec.gov 403 Forbidden (AkamaiGHost, 1925 bytes) and data.sec.gov 403 Forbidden (AkamaiGHost, 4815 bytes). The whole of sec.gov is unreachable from a GitHub-hosted runner, so the documented submissions API would be refused too: no code change can fix this, only a different network.',
    evidence: [
      { label: 'The first live capture, committed by the workflow itself', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/form4-signals/_form4-last-run.json', text: '"errors": ["EDGAR atom feed for TSLA: HTTP 403 — body head: <!DOCTYPE html …"] — filingsSeen 0, formsSeen {}, failures 3' },
      { label: 'EDGAR\'s own fair-access guidance (the User-Agent format it states)', url: 'https://www.sec.gov/os/accessing-edgar-data', text: '"Sample Company Name AdminContact@<sample company domain>"; no more than 10 requests per second' },
      { label: 'The same endpoint, retrieved successfully from a different client 2026-09-21 (fact V114)', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001318605&type=4&dateb=&owner=include&count=5&output=atom' }
    ],
    action: 'Nothing was invented: the run failed loudly, `failures: 3` is committed, no companies/*.json was written, and both strategies abstained everywhere with the reason published — the archive\'s honest-failure mode worked exactly as designed. Three changes: (1) the default User-Agent now follows EDGAR\'s stated shape exactly ("KalshiPaperSim research buffedlizard55-lab@users.noreply.github.com") and can be overridden with EDGAR_USER_AGENT; (2) a refused request now records its status, statusText and any retry-after / rate-limit headers, and the run report records the agent actually sent, so the NEXT failure is diagnosable from the repository; (3) the trigger file requests another run immediately after merge. The parser and the point-in-time store are unaffected — they are tested against a real archived filing (tests 127–129). A follow-up commit adds an **edge probe** (`probeEdge`, recorded as `edgeProbe` in the run report) that records only the HTTP status and `server` header of one documented request per SEC host — `www.sec.gov` and `data.sec.gov`, same path — and parses nothing: it distinguishes "all of sec.gov is blocked for this runner" from "only browse-edgar is", which is the question the fallback choice depends on.',
    userAction: '**The probe has answered: both hosts report 403/AkamaiGHost, so the archive needs a network other than a GitHub-hosted runner — a self-hosted runner or the owner\'s own machine. No code change will fix it, and the documented submissions API would be refused for the same reason.** If `data.sec.gov` answers 200 while `www.sec.gov` does not, switch the archive to the documented submissions endpoint https://data.sec.gov/submissions/CIK##########.json with the ticker→CIK map from https://data.sec.gov/files/company_tickers.json; its JSON shape was NOT verified in this session, so capture one real response and archive it as a fixture first, the way data/form4-signals/fixtures/ fixed the XML. Until either is true, both insider entries abstain and say so — no result in this repository depends on a filing that was never read.'
  },
  {
    id: 60,
    severity: 'med',
    title: 'Every game-series order book captured before 2026-09-21 is empty - the crons captured AFTER settlement',
    assumed: 'That a with_books ingest run at 06:15 or 16:40 UTC stores a usable ladder for game series whenever it runs.',
    truth: 'MLB/NBA/NFL game contracts have no book after they settle. The 28 KXMLBGAME history files from 2026-09-19/20 all hold 0-level orderbooks, generate-desk-module.mjs drops empty ladders, and the Live Desk therefore kept 0 tradeable game-series slots (its series reserves read 0). The capture CODE is fine - the capture TIMING was post-settlement.',
    evidence: [
      { label: 'data/history/KXMLBGAME-*.json — 28 files, every book with 0 levels', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/tree/main/data/history' },
      { label: '.github/workflows/daily-history.yml — the pre-fix crons 06:15/16:40 UTC + the 2026-09-21 game-window fix', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/.github/workflows/daily-history.yml' },
      { label: 'src/desk-data.js — game-series reserves at 0 on the 2026-09-21 build' }
    ],
    action: 'Fixed 2026-09-21: daily-history.yml adds 00:30 + 02:30 UTC with_books crons INSIDE live game windows (the WITH_BOOKS cron case list covers all three), and data/history/_ingest-request.json adds minute-nfl-game-lines beside minute-mlb-game-lines so 1-minute game bars start accumulating (fact V120).',
    userAction: 'After the 2026-09-22 00:30 UTC run, check data/history/KXMLBGAME-* / KXNFLGAME-* for a NON-empty orderbook before trusting any game-series desk slot; the first honest in-game ladder is the milestone.'
  },
  {
    id: 61,
    severity: 'low',
    title: 'A research source headline profitability is refuted by the same post-own post-mortem (R19)',
    assumed: 'That the r/PredictionsMarkets "+39% Kalshi trading bot" post is a profitability claim one could cite.',
    truth: 'The same post TL;DR says, of a ~1.5M-real-trade backtest plus the entire 2022 World Cup out of sample: "It does not work." The +39% figure is pre-post-mortem. The PARAMETERS (2-minute shock window, at least 15% of peak AND at least 8 cents, P50/P75/P90/P95 maker ladder, 4-6 cent maker exit, [close-150min, close] windowing) are measured and worth keeping; the return is not.',
    evidence: [
      { label: 'research-sources R19 — the post quoted verbatim, parameters and post-mortem', url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/' }
    ],
    action: 'Both the parameters and the refutation are pinned in R19; any future four-rung PanicLadder refinement must cite both. PanicDip_ShockTiming (the three-rung sibling) measures its own verdict from its own fills.',
    userAction: 'Never cite the +39% figure without "It does not work" beside it.'
  },
  {
    id: 62,
    severity: 'med',
    title: 'kalshi.com own board (2026-09-21) reports a Fed RATE HIKE to 3.75-4.00% under Chair Warsh - macro series this repo trades will move on it',
    assumed: 'Nothing in this repository reads news; but a reader comparing our macro-flight marks to the market may not know a same-day macro shock is on the wire.',
    truth: 'The homepage news block states: "The Federal Reserve raised its benchmark interest rate by a quarter point to a range of 3.75% to 4.00%, its first increase since 2023, according to CNBC ... under Chair Kevin Warsh." KXRATEHIKE 2026 "Exactly 2" traded 1.62x/58% on the same board. This repo trades only from captured Kalshi API prices (never from this headline), but KXINXY/KXNASDAQ100Y/KXRATEHIKE-class series are in the macro flight and the daily bars will show the move.',
    evidence: [
      { label: 'research-sources R24 — the kalshi.com board fetched 2026-09-21, news block quoted verbatim (CONTEXT ONLY)', url: 'https://kalshi.com/' }
    ],
    action: 'Recorded in R24 (claim verbatim, marked CONTEXT ONLY) and here so macro-flight readers can reconcile bars from 2026-09-21 onward.',
    userAction: 'When reviewing macro-flight PnL around 2026-09-21, read it against this dated observation; the news blurb is third-hand (CNBC via kalshi.com) and is not a price input.'
  },
  {
    id: 63,
    severity: 'med',
    title: 'Four data bots sat outside the shared push queue; on 2026-09-22 three runs captured data that never landed because their commit step lost the race',
    assumed: 'That a per-workflow concurrency group plus a retrying push guard was enough to keep five bots from destroying each other\'s commits.',
    truth: 'Verified from the GitHub API on 2026-09-22. Weather run 35676454906 (created 01:37:38Z, group data-pipeline-main) ran "Capture the point-in-time NWS forecast", "Audit the forecast store (no network)" and "Regenerate the browser-safe modules and the Pages bundle" to SUCCESS and then FAILED at "Commit the new snapshots" — while the MLB-signals run created in the same second (35676455303, its own group) succeeded and pushed 07d329875 at 01:38:31Z. Two mlb-pregame runs failed identically at "Commit the measurement rows + status": 35677025646 (01:46:38Z) and 35677673624 (01:57:22Z) — the latter created one second before PR #22 merged (6213ae348, 01:57:18Z), so that run was racing a human merge; the ESPN runs created at both of those instants succeeded. Net effect on the tree: all nine forecast stores still end at captured_at 2026-09-21T22:36:56.809Z (the last forecast commit is 9a3d93b73 at 2026-09-21T22:37:51Z), so the 01:37Z NWS snapshots were captured, audited and then thrown away with the runner, and data/mlb-pregame/predictions/ holds 0 files. The four out-of-group bots (espn/fda/form4/mlb-pregame) were kept out of the shared group deliberately, because GitHub\'s documented default keeps ONE pending run per group and cancels the previous one — a 20-minute archive would have been evicted by the 5-minute bots.',
    evidence: [
      { label: 'weather run 35676454906 (created 2026-09-22T01:37:38Z) — capture, audit and regenerate all SUCCESS, "Commit the new snapshots" FAILURE', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35676454906', text: 'Job "archive", conclusion failure. Steps: "Set up job" success, "Run actions/checkout@v4" success, "Run actions/setup-node@v4" success, "Sync with the branch tip (best-effort)" success, "Capture the point-in-time NWS forecast" success, "Audit the forecast store (no network)" success, "Regenerate the browser-safe modules and the Pages bundle" success, "Commit the new snapshots" FAILURE. The MLB signal archive run 35676455303 created at the same 01:37:38Z succeeded and pushed commit 07d329875 (committer date 2026-09-22T01:38:31Z).' },
      { label: 'mlb-pregame runs 35677025646 (01:46:38Z) and 35677673624 (01:57:22Z), both failing at the commit step after a successful capture chain', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/actions/runs/35677673624', text: 'Job "model-chain" of run 35677673624: every step through "Ingest the walk-forward predictions as measurement rows", "Audit the pre-game store (no network)" and "Regenerate the browser-safe modules and the Pages bundle" SUCCESS, then "Commit the measurement rows + status" FAILURE. Run 35677025646 failed the same way 11 minutes earlier. The ESPN runs created at 01:46:38Z (35677025673) and 01:57:22Z (35677673680) both succeeded; PR #22 merged as 6213ae348 at 01:57:18Z.' },
      { label: 'GitHub documentation: a concurrency group\'s default queue is `single` — one pending run, and a newer run cancels the previous one; `queue: max` allows up to 100 pending runs', url: 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency', text: '"single (default): At most one job or workflow run can be pending in the concurrency group. When a new job or workflow run is queued, any existing pending job or workflow run in the same group is canceled and replaced." / "max: Up to 100 jobs or workflow runs can be pending in the concurrency group." / "The combination of queue: max and cancel-in-progress: true is not allowed."' },
      { label: 'the capture that was thrown away — all nine forecast stores still end at the previous run\'s snapshot', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/tree/main/data/forecasts', text: 'data/forecasts/{nyc-central-park,austin-camp-mabry,chicago-midway,denver-den,los-angeles-lax,miami-mia,philadelphia-phl,phoenix-phx,seattle-sea}.json: newest snapshot captured_at = 2026-09-21T22:36:56.809Z in all nine (23 snapshots for NYC, 21 for the others), i.e. the 2026-09-22T01:37Z capture is absent from main even though that run audited it successfully. data/mlb-pregame/predictions/ contains 0 files.' }
    ],
    action: 'All eight pushing workflows (daily-history, ingest-now and the six 20-minute signal archives) now share group data-pipeline-${{ github.ref }} with queue: max and cancel-in-progress: false, each carrying a comment quoting the documentation — so a 20-minute archive queues behind the 5-minute bots instead of being evicted, and no run cancels another. scripts/push-with-race-guard.sh retries 6 times (PUSH_ATTEMPTS) with a growing, jittered backoff (PUSH_BACKOFF_SCALE for tests) because a competitor\'s run lasts ~90s, and after a regeneration it stages with `git add -A` instead of `git add -u` so a path the other bot created cannot be left behind. Test 125 asserts the arrangement by reading all eight YAML files; test 140 reads the guard; test/workflow-race-guard.sh replays the races against a real bare remote (34 checks).',
    userAction: 'Run `gh run list --limit 12` after the next scheduled runs and confirm no bot fails at its commit step; then bump .github/triggers/forecast.json once to re-run the weather capture so the lost 01:37Z snapshots are replaced, and check `data/mlb-pregame/predictions/` for its first file.'
  },
  {
    id: 64,
    severity: 'med',
    title: 'The desk module\'s per-market capture cap silently shrank the measured desk-season from 9 rounds to 5 — CLOSED 2026-09-22 by ROUND ANCHORS',
    assumed: 'That regenerating src/desk-data.js on newer data could only ADD desk-season rounds.',
    truth: 'selectCaptures() kept the newest 12 ladders per market plus one per horizon mark, and the market cap dropped whole contracts, so the module is a sliding WINDOW on data/history/**. The season at commit 4e85c80 measured 9 rounds, 17 fills and 6448 walked events; regenerated on 2026-09-22 it re-reported 5 rounds, 12 fills and 4329 events — a round whose batch the module no longer carries cannot be walked again. The 2026-09-22 pass decomposed the loss instead of hiding it: of the 14 evicted round stamps on the current store, SEVEN have no non-empty ladder at the stamp anywhere (the batch closed on empty post-close books — irregularity #60) and SEVEN were a pure module bound (the store held non-empty ladders inside those batches, from markets the module even kept). ROUND ANCHORS now keep one open-board capture per capture batch on top of the market cap: seasonRoundStampsEvicted 0, and the season reports 12 rounds / 34 fills / 7771 events with all 27 checks passing. The stricter exact-instant measure (14 of 21) is still published as seasonRoundStampsExactInstantInModule because 7 stamps can never satisfy it.',
    evidence: [
      { label: 'the eviction audit the generator publishes — src/desk-data.js coverage.captureEviction', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-data.js', text: 'storeLadderCaptures 13865, storeNonEmptyLadders 8145, storeCaptureBatches 21, laddersBeforeCaptureSelection 8145, evictedByCaptureCap 6188, laddersAfterCaptureSelection 1957, evictedByMarketCap 960, marketsDroppedByCap 103, moduleLadderCaptures 1187, moduleCaptureBatches 21, storeBatchesRepresentedInModule 21, storeBatchesNotRepresented 0, seasonRoundStamps 21, seasonRoundStampsHostableByModule 21, seasonRoundStampsEvicted 0, seasonRoundStampsExactInstantInModule 14, roundAnchors.batchesWithAnchor 21.' },
      { label: 'the season after the fix — data/reports/desk-season.json', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/desk-season.json', text: 'summary.totals.rounds 12, fills 34 (makerFills 22), eventsWalked 7771, and the audit block 27/27 checks passing; the pre-fix run on the same store re-reported 5 rounds / 12 fills / 4329 events.' },
      { label: 'the reservation itself — scripts/generate-desk-module.mjs ROUND ANCHORS + selectCaptures(captures, anchors)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/scripts/generate-desk-module.mjs', text: 'For every capture batch, the newest capture that batch holds for an open-board market is pinned into that market\'s window, and the market is kept even if the cap would drop it. Test 139 re-derives the batching from data/history/** and asserts the module holds a capture inside every window the store can host a round in.' }
    ],
    action: 'coverage.captureEviction publishes both measures (window vs exact instant), names which evictions are a module bound and which are a store bound, lists the anchors, and keeps the reproduction command (`node scripts/generate-desk-module.mjs --max-captures 40 --out src/desk-data.js`). ROUND ANCHORS make the window measure 0 by construction; test 139 fails if it ever stops being true.',
    userAction: 'Read coverage.captureEviction.roundAnchors and seasonRoundStampsEvictedDetails before comparing two season runs. seasonRoundStampsEvicted 0 means every round the store can host is re-walkable; the 7 exact-instant misses are documented as an empty-book capture-timing fact, not a code limitation.'
  },
  {
    id: 65,
    severity: 'low',
    title: 'ROADMAP #34 said "data/history holds zero KXMLBGAME/KXNFLGAME stores" — it does not; and the audit called 2 SETTLED NHL contracts OPEN because it read one file\'s status as the status (corrected 2026-09-22, see #66)',
    assumed: 'As recorded in ROADMAP row 34: that the desk\'s game-series reserves were 0 because the store held no game stores.',
    truth: 'The store holds 43 KXMLBGAME and 10 KXNFLGAME stores (53 stores, 272 captured ladders: 160 + 112) across data/history/ and data/history/intraday/{60m,1m}/. Every one of those ladders was captured after its contract\'s own close_time — the exchange\'s actual trading end — where the official API returns an empty orderbook (irregularity #60), so the desk module correctly keeps nothing and both reserves read 0. The audit also pins why occurrence_datetime cannot stand in for an event time: it equals expected_expiration_time on 144 of the 151 game stores (and differs on 7, where expected_expiration_time is hours later than the scheduled start), and it equals close_time on none. CORRECTED 2026-09-22 (irregularity #66): the two KXNHLGAME contracts this entry called OPEN — KXNHLGAME-26SEP19VGKLA-VGK and KXNHLGAME-26SEP20WSHBOS-WSH — are SETTLED (finalized with result yes / no in the daily store); only their older 1-minute photographs said active, and the audit was reading one file\'s status as the status. They were never tradeable slots waiting to be let in: the reserve read 0 because every contract in the series was settled, which the audit now states.',
    evidence: [
      { label: 'the committed audit — data/reports/game-window-captures.json series roll-up', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/game-window-captures.json', text: 'KXMLBGAME: 43 stores (0 open / 43 settled), 160 ladders, 0 non-empty, all POST_CLOSE. KXNFLGAME: 10 stores (0 open / 10 settled), 112 ladders, 0 non-empty, all POST_CLOSE. Totals across all seven game series: 151 stores, 100 distinct contracts, 1544 ladders, 1031 non-empty, phases IN_PLAY 0 / TRADEABLE_EVENT_UNVERIFIED 1031 / POST_CLOSE 513 (0 of those non-empty); store verdicts POST_CLOSE_ONLY 70, TRADEABLE_LADDER_EVENT_UNVERIFIED 81.' },
      { label: 'the reserve explanation the audit publishes for KXNHLGAME', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/game-window-captures.json', text: 'deskReserves[KXNHLGAME]: deskSlots 4, deskKept 0, openContractsWithUsableLadder 2, ofThoseInDeskModule 0, openLadderContractsNotInModule ["KXNHLGAME-26SEP19VGKLA-VGK","KXNHLGAME-26SEP20WSHBOS-WSH"], each with usableLadders 10 — "the module\'s own rule caps open contracts at 80 by real lifetime volume, and its series reserve for KXNHLGAME then found nothing to keep".' },
      { label: 'occurrence_datetime is not an event bound — measured over all 151 stores', url: 'https://docs.kalshi.com/api-reference/market/get-market', text: 'totals.occurrenceEqualsExpectedExpiration 144, occurrenceDiffersFromExpectedExpiration 7, occurrenceEqualsCloseTime 0, storesWithMarketObject 151. Example of the 7: KXNFLGAME-26SEP09NESEA-NE carries occurrence_datetime 2026-09-10T03:20:00Z, expected_expiration_time 2026-09-10T06:20:00Z and close_time 2026-09-10T03:28:38Z — the exchange closed it early, before its own expected expiration.' }
    ],
    action: 'ROADMAP row 34 is corrected in place and the audit itself is the correction: scripts/verify-game-window.mjs (a committed continue-on-error step in daily-history.yml and ingest-now.yml) reports per-store phases with examples, per-series roll-ups with a join-reason code per store, and per-series reserve explanations naming which open contracts are absent from the module.',
    userAction: 'Read data/reports/game-window-captures.json — totals, series and deskReserves — and note that the TRADEABLE_EVENT_UNVERIFIED ladders are tradeable-window ladders whose event window could not be joined, not in-play ladders. The desk-reserve side is now measured against RESOLVED statuses: deskReserves[KXNHLGAME] reads openLadderContracts 0 with settledContractsWithAStaleOpenFile 2, and the game-series reserves carry a floor (slots) and a ceiling (maxSlots) so an open series with many laddered contracts — KXNCAAFGAME had 26 — keeps up to its ceiling instead of 4.'
  },

  {
    id: 66,
    severity: 'med',
    title: 'One ticker lives in up to three store files and they disagree — reading ONE file\'s status as "the status" published 2 settled NHL contracts as open tradeable slots and put 3 settled contracts inside the desk (2 of them in a reserve)',
    assumed: 'That a ticker has one status, so whichever store file a script happened to read carried it. Both the desk-module generator and the game-window audit were written on that assumption.',
    truth: 'A store file is a point-in-time photograph: data/history/<t>.json is re-captured on every ingest (newest), while data/history/intraday/60m/ and /1m/ hold the market object as it was hours or days earlier. On the committed store 22 of 663 tickers have files that disagree, always the same way — an older `active` against a newer `finalized` with a result. Two measured consequences. (1) scripts/verify-game-window.mjs classified each file on its own, so KXNHLGAME-26SEP19VGKLA-VGK and KXNHLGAME-26SEP20WSHBOS-WSH (both SETTLED: finalized yes / no at 2026-09-22T19:56Z, closed 2026-09-20T04:31:47Z and 2026-09-21T00:39:39Z) were reported as OPEN with 10 usable ladders each — openLadderContracts 2, "absent from src/desk-data.js" — and ROADMAP Next #12 repeated that claim. (2) scripts/generate-desk-module.mjs merged the files in readdir order (daily first, intraday last), so the older photograph overwrote the status while the newer file\'s result survived (`rec.status = store.status || rec.status`, `rec.result = store.result ?? rec.result`), leaving 3 internally contradictory records in src/desk-data.js: status active WITH result yes/no. Two of the three (KXNCAAFSPREAD-26SEP19TNSTFAMU-FAMU5, KXNCAAFSPREAD-26SEP19ALCNUNA-UNA15) were the ENTIRE KXNCAAFSPREAD reserve — the desk was holding settled contracts as open slots.',
    evidence: [
      { label: 'the proved contradiction on the committed module — src/desk-data.js markets before the fix', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/desk-data.js', text: 'KXNFLSPREAD-26SEP20MIASF-SF14 status "active" result "yes"; KXNCAAFSPREAD-26SEP19TNSTFAMU-FAMU5 status "active" result "no"; KXNCAAFSPREAD-26SEP19ALCNUNA-UNA15 status "active" result "yes". The store files for the same tickers: data/history/<t>.json finalized / 2026-09-22T19:55Z, data/history/intraday/60m/<t>.json active / 2026-09-20T03:42Z, data/history/intraday/1m/<t>.json active / 2026-09-20T03:38Z.' },
      { label: 'the false open claim the audit published — data/reports/game-window-captures.json (pre-fix copy)', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/game-window-captures.json', text: 'deskReserves[KXNHLGAME]: openLadderContracts 2, openContractsWithUsableLadder 2, ofThoseInDeskModule 0, openLadderContractsNotInModule ["KXNHLGAME-26SEP19VGKLA-VGK","KXNHLGAME-26SEP20WSHBOS-WSH"], each "10 usable ladder(s)", with the explanation "the module\'s own rule caps open contracts at 80 by real lifetime volume". After the fix the same row reads openLadderContracts 0, settledContractsWithAStaleOpenFile 2, listing the two 1m files and the resolution finalized+yes / finalized+no.' },
      { label: 'the rule now shared by both callers — src/market-status.js MARKET_STATUS_RULE', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/market-status.js', text: 'R1 every observation is kept and disagreements are published; R2 settlement is monotone (a finalized-with-result photograph beats any newer active one, because a settled contract cannot reopen); R3 otherwise newest market_captured_at wins, ties broken by source path. Measured on the store: 527 settled, 135 open, 1 unknown, 201 tickers with >1 file, 42 disagreeing photographs, 0 irreconcilable conflicts. coverage.statusResolution publishes the whole reconciliation inside the module.' }
    ],
    action: 'src/market-status.js is the single resolver; scripts/generate-desk-module.mjs collects one observation per store file and resolves each ticker once AFTER the walk (the market OBJECT is also chosen by newest market_captured_at, so volume and close_time cannot come from the older photograph), publishes coverage.statusResolution + per-market statusEvidence (including settledFromStaleFile, 22 tickers) and counts finalizedWithoutResult; scripts/verify-game-window.mjs resolves per ticker, publishes statusReconciliation and staleOpenPhotographs, counts openStoresByNewestRecord (60) beside openStoresByTheirOwnFileStatus (62), and every desk reserve row lists settledContractsWithAStaleOpenFile. Test 141 unit-tests the rule (including the pathological newer-active-vs-settled case) and re-resolves every market in the committed module from data/history/**.',
    userAction: 'Never read a single store file\'s `status` as the contract\'s status: call resolveMarketStatus()/resolveStoreStatuses() or read coverage.statusResolution. KXNCAAFSPREAD now keeps 0 contracts because every contract in that series is settled — that is the correct reading, not a loss of coverage; the open series KXNCAAFGAME keeps 20 of its 26 laddered contracts under its new ceiling.'
  },

  {
    id: 67,
    severity: 'low',
    title: 'The strict forward window is max(designedAt) over the WHOLE roster, so adding one strategy designed today silently shrank every other strategy\'s forward measurement from 2 real bars to 1',
    assumed: 'That "bars after max(designedAt)" measures the roster as a whole and can be read from one number each day. It does — for the NEWEST design. For every other strategy it is a superset that grows only when nothing new is designed.',
    truth: 'Adding HeatConfirm_500Bots (designedAt 2026-09-22) moved the split from 2026-09-21T00:00Z to 2026-09-22T00:00Z, so method.strictForwardBars fell 2 → 1 and the strict leaderboard became a 1-bar table (bestStrictForward YieldVulture_Arb 0.00%, 1 trade). Nothing was wrong with the numbers — the same rule that makes a forward test honest (a design cannot claim credit for bars that existed while it was being written) had simply reset the window because of an addition, and the only visible symptom was a number getting smaller with no explanation attached.',
    evidence: [
      { label: 'the split rule itself — src/forward-test.js defaultSplitTs()', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/src/forward-test.js', text: 'export function defaultSplitTs(strategies = STRATEGIES) { … return Math.floor(Math.max(...dates) / 1000); } — one maximum over the whole roster, published as method.splitTs and used as noTradeBeforeTs for every strategy.' },
      { label: 'the measured effect in the regenerated report — data/reports/forward-test.json', url: 'https://github.com/buffedlizard55-lab/KalshiPaperSim/blob/main/data/reports/forward-test.json', text: 'method.forwardStart 2026-09-22T00:00:00.000Z, method.strictForwardBars 1, totals.strictForwardMeasured 17, totals.bestStrictForward {YieldVulture_Arb, 0}. Beside it: method.previousDesignSplit {splitTs 1789948800, forwardStart 2026-09-21T00:00:00.000Z, bars 2}, totals.previousDesignSplitMeasured 23, totals.bestPreviousDesignSplit {MakerFlip_SpreadHarvest, 0.19}, with the label stating it shares bars with the newest design\'s in-sample period and must never be quoted as a strict forward result.' }
    ],
    action: 'src/forward-test.js now derives the second-latest DISTINCT designedAt as well and publishes both windows in every row and in the method block: strictForward (unchanged semantics) and previousDesignSplit (labelled a SUPERSET, with its own rankedPreviousDesignSplit leaderboard). The strict window keeps its meaning and is never widened; the earlier measurement stays visible beside it, and a reader can see exactly why the strict number moved.',
    userAction: 'Read both: data/reports/forward-test.json → method.strictForwardBars (strict, currently 1 bar — directional only, below the 20-bar floor) and method.previousDesignSplit (2 bars, 23 strategies measured, NOT a strict result for the newest design). If a future design date moves the split again, the same two numbers will show it.'
  },
]);

/** Reverse-engineered structure of the reference competition sites. */
export const COMPETITION_SITE_ANALYSIS = Object.freeze([
  {
    site: 'kalshi.com',
    url: 'https://kalshi.com/',
    whatWeTook: 'Market-card layout (YES/NO price pair, volume, open interest), the order-book depth ladder, the trade ticket with explicit fee preview, and the reciprocal YES/NO framing.',
    whatWeDidNotTake: 'No market data, copy or branding. All prices shown here come from captured API responses or are labelled simulations.',
    implementedIn: 'Markets & Depth tab (src/app.js renderMarkets), OrderBook reciprocity (src/simulation-engine.js)'
  },
  {
    site: 'tradingview.com/the-leap',
    url: 'https://www.tradingview.com/the-leap/',
    whatWeTook: 'A ranked leaderboard with participant identity, a podium for the top three, a fixed competition window, and rules/eligibility presented next to the standings.',
    whatWeDidNotTake: 'No participant data or branding.',
    implementedIn: 'Leaderboard tab: podium, qualification rule, mandate notice, competition window'
  },
  {
    site: 'trade-ideas.com stock trading competition',
    url: 'https://www.trade-ideas.com/stock-trading-competition/',
    whatWeTook: 'Registration with a unique username, a starting-capital allowance, periodic (daily/weekly) standings snapshots, and a published result history.',
    whatWeDidNotTake: 'No participant data or branding.',
    implementedIn: 'Competition Memory tab: registration, 52-week calendar, weekly snapshots, export/import'
  },
  {
    site: 'specials.candlecharts.com/contest',
    url: 'https://specials.candlecharts.com/contest',
    whatWeTook: 'A contest calendar with entry periods and a scoring summary per entrant.',
    whatWeDidNotTake: 'No entries or branding.',
    implementedIn: 'Calendar strip + per-trader computed stats (return, drawdown, fees, unfilled)'
  }
]);

/** Group facts for rendering. */
export function groupFacts(facts = VERIFIED_FACTS, filter = '') {
  const q = String(filter || '').trim().toLowerCase();
  const groups = new Map();
  for (const f of facts) {
    if (q) {
      const hay = `${f.id} ${f.group} ${f.fact} ${f.value} ${f.url || ''} ${f.usedIn || ''}`.toLowerCase();
      if (!hay.includes(q)) continue;
    }
    if (!groups.has(f.group)) groups.set(f.group, []);
    groups.get(f.group).push(f);
  }
  return [...groups.entries()].map(([group, items]) => ({ group, items }));
}

/** Counts by status, for the summary line. */
export function factStats(facts = VERIFIED_FACTS) {
  const out = { total: facts.length };
  for (const s of Object.values(VERIFICATION_STATUS)) {
    out[s] = facts.filter((f) => f.status === s).length;
  }
  out.withUrl = facts.filter((f) => f.url).length;
  return out;
}
