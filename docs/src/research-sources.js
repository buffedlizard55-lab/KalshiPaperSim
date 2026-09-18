/**
 * KalshiPaperSim — Public strategy research ledger
 * =====================================================================
 * Every external strategy claim this project has looked at, with the URL it was
 * read from, HOW it was read, what was taken from it, and whether the data this
 * repository holds can actually test it.
 *
 * WHY "HOW IT WAS READ" IS A FIELD
 *   reddit.com returns HTTP 403 to this sandbox, so those threads could not be
 *   loaded directly. They were read through the search engine's full-text excerpt
 *   of the thread, which reproduces the posts. That is weaker evidence than a page
 *   fetch, and the ledger says so per entry instead of implying every source was
 *   loaded. Everything marked `page fetch` was loaded and read in full.
 *
 * THE RULE
 *   A third-party write-up is a HYPOTHESIS, never a fact about the exchange. No
 *   number from any source is copied into a result: sources supply the design, and
 *   src/backtest-replay.js computes what the design actually did on real Kalshi
 *   bars. Every entry declares whether it was tested and by which strategy.
 *
 * Quotes below are transcribed from the excerpts that were read on the dates
 * given. They are quoted BECAUSE they are the claim being tested or rejected —
 * quoting a claim is not endorsing it.
 */

export const RESEARCH_CAPTURE_METHODS = Object.freeze({
  FETCHED: 'page fetch — loaded and read in full',
  SEARCH_EXCERPT: 'search-engine full-text excerpt — the page itself returns HTTP 403 to this sandbox, so the thread was read through the excerpt of it',
  /* Added 2026-09-18 for R14: the sandbox cannot open TLS to github.io, but
     the SAME repository content is served by the official GitHub REST API
     (api.github.com/repos/{owner}/{repo}/readme), which the sandbox CAN
     reach. Reading the raw file through the API is a full read of the
     document, not an excerpt of it. */
  API_FILE: 'GitHub REST API raw-file fetch — the document was loaded and read in full (the sandbox cannot open TLS to github.io, so the Pages render was not fetched)'
});

export const RESEARCH_SOURCES = Object.freeze([
  /* ── 1. Tested: intraday panic fade (the sweep family) ─────────────── */
  {
    id: 'R01',
    title: 'Backtested 5,000 Strategies on Kalshi 15-min BTC Markets',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1szxy8h/backtested_5000_strategies_on_kalshi_15min_btc/',
    published: '2026-04-30',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '"4,904 strategies. 102 made money." — "Median ROI was -14.53% on a $10,000 notional. The best strategy returned +18.32%. The worst returned -77.73%". ' +
      '"panic_fade was 93 of 96 profitable. Mean ROI +4.90%. The 3 losers all came in at -0.12%. Best variant +18.32%, on panic_threshold=0.04 with fade_size=100". ' +
      '"mean_reversion was 0 for 432. Not a single variant made money." — "the bottom 10 strategies in this run are all tight-band price-threshold variants ... ' +
      '7,000+ trades each, 62-63% win rate, and still losing 75-78% over the window. They are being eaten alive by fees and slippage on a 2-cent target". ' +
      'Method note in the same post: "Backtests use historical orderbook snapshots. Live execution hits slippage, venue hiccups, and liquidity that moves under you."',
    taken:
      'The METHOD and the archetypes: run a whole family of parameter variants instead of one, then look at the distribution rather than the winner. The three families ' +
      'named in the post (panic fade, mean reversion, tight price-threshold scalping) are recreated as a ~100-variant sweep in scripts/strategy-sweep.mjs and measured on ' +
      'this repository\'s own real bars.',
    testable: true,
    testedBy: ['PanicFade_HourlyVol', 'PanicFade_T4_S100', 'MeanRev_CheapBand', 'TightScalp_Fixed5', 'PanicFadeDeep_T6_TP6'],
    howTested:
      'Sweep over the real 60-minute store (12 curated markets, 4,032 bars) and the real daily store (30 markets). Every variant trades the same data, pays the same ' +
      'official fees, and is bounded by the same real volume and captured depth as the roster.',
    caveat:
      'The source traded KXBTC15M (15-minute crypto brackets) — a series this repository does not hold. The transfer is a hypothesis, results are ours, and the two ' +
      'numbers are NOT comparable. The post also warns that the same archetype that won a week earlier was the worst one a week later ("Strategies are regime-dependent").'
  },

  /* ── 2. Tested: order-book-wall maker laddering ───────────────────── */
  {
    id: 'R02',
    title: 'People who actually WIN MONEY on Kalshi: what\'s your secret?',
    host: 'reddit.com/r/Kalshi',
    url: 'https://www.reddit.com/r/Kalshi/comments/1qd4ubf/people_who_actually_win_money_on_kalshi_whats/',
    published: '2026-01-15',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '(Snoo-77724) "simple, never use market order, always use limit orders below the price usually 5-15 cents lower than current price and set a bunch of them out there ' +
      'and let them come to you, when whales have capital flying around you\'ll hit the natural dips when their bots are shifting capital. hint: don\'t trade the event, trade ' +
      'the orderbook wall". (LupineChemist) "in some low liquidity markets, you can make a couple percent just on spreads. Just have a ton of resting buy orders and then ' +
      'immediately flip them to resting sell orders where the market is ... if you can get a market that moves from 3 cents to 4 cents, that\'s a 33% return."',
    taken:
      'The maker-only multi-rung bid ladder (BookWall_BidLadder) and the buy-then-flip maker spread harvest (MakerFlip_SpreadHarvest). Nothing is taken from the thread\'s ' +
      'anecdotal bankroll claims.',
    testable: true,
    testedBy: ['BookWall_BidLadder', 'MakerFlip_SpreadHarvest'],
    howTested:
      'Both replayed on the daily window across all 30 markets, with maker fees charged on execution per the official schedule and fills bounded by each bar\'s real traded ' +
      'volume and the real captured ladder.',
    caveat: 'A resting order only fills if the period\'s real high/low reaches it. The engine never assumes a fill it cannot justify from the bar.'
  },

  /* ── 3. Tested: adjacent-strike laddering ─────────────────────────── */
  {
    id: 'R03',
    title: 'What are the best strategies you\'ve seen (or used) for temperature markets on Kalshi?',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1s4n4wp/what_are_the_best_strategies_youve_seen_or_used/',
    published: '2026-03-26',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '(Substantial-Fox1019) "Laddering – The most consistent approach I\'ve seen is buying multiple adjacent brackets cheap (like 2-15c) rather than picking one. If the ' +
      'final temp lands anywhere in your spread, one or two contracts pay out big and cover the rest." (TexForager) "Biggest edge I\'ve found honestly isn\'t the forecast ' +
      'itself — it\'s the DST timing gap. Most casual traders don\'t realize NWS climate reports use local standard time, not clock time."',
    taken:
      'The ladder band (2-15c) and the ladder shape, applied to the adjacent index strikes this repository actually holds (AdjacentStrike_Ladder). The DST observation is ' +
      'not a strategy here — it is a data-integrity issue, and it is recorded in data/reports/calendar-audit.json, which classifies a real 82,800-second bar-boundary shift.',
    testable: 'partially',
    testedBy: ['AdjacentStrike_Ladder'],
    howTested: 'Daily replay buying the three cheapest strikes ≤ 0.15 in each series and holding to the end of the window.',
    caveat:
      'The source trades temperature brackets that are mutually exclusive and expire at the same hour. The index strikes here are not mutually exclusive, so a ladder can ' +
      'win several rungs or none. The source\'s own exit note is liquidity-dependent ("the price will hit 70-80c by morning") and is NOT reproduced: this roster has no ' +
      'fast-exit variant for that claim.'
  },

  /* ── 4. Tested: the shock-timing archetype, claim vs replication ──── */
  {
    id: 'R04',
    title: 'I built a +39% Kalshi trading bot to exploit World Cup market panics — and the out-of-sample replication posted in the replies',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/',
    published: '2026-06-12',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      'Spec: "It drops four laddered limit buy orders into the Kalshi order book at increasing depths, weighting the capital heavier toward the deepest levels ... ' +
      '$P_{50}$ Order: Shallowest depth. Gets 10% of allocated capital ... Orders stay active for 60 seconds ... To exit, the bot places a resting limit sell order slightly ' +
      'above the panic price to capture a quick 4¢ to 6¢ profit per contract as the spread normalizes." ' +
      'Reply (RockyRoadn), an independent out-of-sample test: "Backtested it against ~1.5M real trades plus the entire 2022 World Cup as an out-of-sample test. It doesn\'t ' +
      'work." — "The headline config never fires. Across 39 detected in-play shocks, only 2 teams were priced in that 76–85¢ band when they got shocked, and neither ladder ' +
      'filled. The claimed 241-trade sample just doesn\'t exist in real data" — "+40% in-sample collapses to −8% on held-out matches" — "Fade win rate (measured from the ' +
      'floor — i.e. a best-case, perfect entry): ~53%. A coin flip." — sell-the-bounce table: "46–48%" win rate, "−12% to −25%" ROI — "The comeback model\'s Brier score ' +
      'was 0.244 vs the market\'s 0.103."',
    taken:
      'All three recreation targets: the entry ladder (PanicDip_ShockTiming), the documented exits (ShockTiming_StopOut), and the source\'s own filter bucket ' +
      '(ShockTiming_ModerateFav, teams priced 76-85¢ before the shock) as a control that can be compared with the replication\'s finding that the bucket almost never occurs.',
    testable: true,
    testedBy: ['PanicDip_ShockTiming', 'ShockTiming_StopOut', 'ShockTiming_ModerateFav'],
    howTested:
      'All three replayed on the same daily bars, same fees, same volume limits. ShockTiming_ModerateFav demands a pre-shock price of 0.76-0.85, which is reported whether ' +
      'or not it ever triggers in this universe — the count of triggers is the finding.',
    caveat:
      'The source thread contains a POSITIVE original claim and a NEGATIVE independent replication of the same idea. Both are replayed; the roster publishes whichever the ' +
      'real bars support, including "no triggers", rather than picking the story.'
  },

  /* ── 5. Tested: the same archetype at a median threshold ───────────── */
  {
    id: 'R05',
    title: 'Maker spread capture, quick flips, and a 30¢→40¢ live scalp (r/Kalshi strategies thread)',
    host: 'reddit.com/r/Kalshi',
    url: 'https://www.reddit.com/r/Kalshi/comments/1qd4ubf/people_who_actually_win_money_on_kalshi_whats/',
    published: '2026-01-15',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '(GuiltyJackfruit7146) "I also skim money off the live matches by taking a player at 30 cents and set a limit order to sell at 40 cents". (Long-Stranger9666) "Wait ' +
      'till its almost over and take the small gains. I typically only bet the last few minutes and it has to be 75% win or higher ... A win of 1.05-1.25 multiplier is still ' +
      'a 5-25 percent profit". (La-_Gioconda, on pricing a real edge) "When you set 10 bets on 80%, which were actually 90%, you\'ll win 9 out of 10 of them ... you won $1 ' +
      'on your $8 in bets, a 12.5% return on investment".',
    taken:
      'The resting-sell scalp: enter on the bid, exit on a resting offer above it (MakerFlip_SpreadHarvest, and the tight_scalp family behind TightScalp_Fixed5). The "almost ' +
      'over, 75% or higher" and "80% that is really 90%" variants need contracts priced near certainty, which this universe does not contain — so they are NOT recreated as ' +
      'separate entries; the same leg exists inside LongshotFader_FLB and never fires, which is reported on that strategy.',
    testable: 'partially',
    testedBy: ['MakerFlip_SpreadHarvest', 'TightScalp_Fixed5', 'LongshotFader_FLB'],
    notTestableReason: 'Near-certainty contracts (75¢+) do not exist in the tracked universe: every captured strike trades below ~28¢. The high-probability legs are therefore coded but silent, and the research gap is listed in ROADMAP.md.'
  },

  /* ── 6. Read; the one family with a falsifiable external model ─────── */
  {
    id: 'R06',
    title: 'I backtested 500 Weather Kalshi Bots. The best bot was the simplest.',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1tko1iw/i_backtested_500_weather_kalshi_bots_the_best_bot/',
    published: '2026-05-22',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '"Only 70 out of 500 finished positive, and the median ROI was -41.61% ... the strategies that did best ... used weather data to confirm a heat trade that the market had ' +
      'not fully priced yet. The strategies that did worst tried to fight the market because one weather variable looked bearish."',
    taken: 'Nothing for the roster. Recorded because it is the same methodology as R01 (sweep a family, publish the distribution) and the same lesson, on the series this repository does not hold.',
    testable: false,
    testedBy: [],
    notTestableReason: 'No weather series is ingested (this universe is KXINXY, KXNASDAQ100Y, KXBTCY) and no point-in-time forecast archive is available to this project. Closing that gap is the top item in ROADMAP.md.'
  },

  /* ── 7. Read; can not fire in this universe ───────────────────────── */
  {
    id: 'R07',
    title: 'Built an automated sports prediction market bot: 20 trades, 0 losses, 5.8% ROI in 10 hours',
    host: 'reddit.com/r/ClaudeCode',
    url: 'https://www.reddit.com/r/ClaudeCode/comments/1scxr78/built_an_automated_sports_prediction_market_bot/',
    published: '2026-04-05',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '"buy YES contracts when a team is winning by a safe margin in the final minutes. You pay 92-99c, collect $1 at settlement. Repeat." — "The edge is tiny (4.9c avg per ' +
      'contract) but extremely consistent. You\'re not predicting outcomes — you\'re collecting a premium for waiting until the outcome is nearly certain."',
    taken:
      'NOT recreated as its own roster entry: a 92-99¢ entry cannot be priced off any contract in this universe, so a dedicated strategy would report a permanent 0.00% ' +
      'without adding information. The equivalent "near-certainty" leg exists inside LongshotFader_FLB (which is measured) and it never fires — the same finding, published ' +
      'on a strategy that also does something.',
    testable: false,
    testedBy: [],
    notTestableReason: 'Requires near-certain contracts (92-99¢). Every captured strike in this universe trades below ~28¢, verified from the stored bars.'
  },

  /* ── 8. Read; timing signal needs an external feed ─────────────────── */
  {
    id: 'R08',
    title: 'Coinbase momentum on 100 Kalshi 15-minute SOL bots (posted to r/PredictionsMarkets)',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/',
    published: '2025-11-03',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '"I tested Coinbase momentum on 100 Kalshi 15 minute SOL bots. 79 finished profitable ... The best returned 177.84% ROI and +$88.92 with a 61.7% win rate, 146 trades, a ' +
      '0.36 Sharpe, and -$30.16 max drawdown ... I also ran 100 permutation re-sweeps with the Coinbase edge-feed timing scrambled. The real winner\'s +$88.92 beat 96.0% of ' +
      'those runs, giving an upper-tail p-value of 0.040 ... the report\'s Deflated Sharpe warning says the winner was not distinguishable from the luckiest result expected ' +
      'across a sweep this size".',
    taken:
      'The self-reported caution, which this project copies into its own sweep output: with N variants, the best one is expected to look good by luck, so the sweep report ' +
      'publishes the whole distribution and a luck benchmark rather than a winner.',
    testable: false,
    testedBy: [],
    notTestableReason: 'Needs (a) a SOL series, (b) 15-minute bars, and (c) a Coinbase trade feed as the timing signal. The feed is the actual edge in that post; without it a recreation would be a different strategy wearing the same name.'
  },

  /* ── 9. Read; a real premium-collection idea, unmeasurable here ────── */
  {
    id: 'R09',
    title: 'Kalshi front page: delay-market and stale-win-total examples',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/',
    published: '2026-08-20',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim:
      '"The Return: 93¢ to $1.00 is a 7.53% net return in 54 days (~50% annualized) for taking almost zero real delay risk." and, on a stale line, "I have a win total that ' +
      'hasn\'t been updated yet ... 70% probability according to the books, able to buy it at 55% probability. The market is pretty illiquid (probably why it hasn\'t updated ' +
      'prices yet)".',
    taken: 'The pattern (buy deep favourites late, or buy a line that has not repriced) is recorded as a roadmap item; no roster entry is created from a screenshot-style claim.',
    testable: false,
    testedBy: [],
    notTestableReason: 'Both examples are markets outside this universe (a hardware-shipping market and a season win total). Measuring them would need those series ingested and, for the second, an external book of record to prove the price was stale.'
  },

  /* ── 10. Fetched in full; the taxonomy used to classify the roster ── */
  {
    id: 'R10',
    title: 'Kalshi Trading Strategies 2026: The Complete Guide',
    host: 'botforkalshi.com',
    url: 'https://www.botforkalshi.com/blog/kalshi-trading-strategies-guide',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-18',
    claim:
      'A strategy map (weather model divergence, sports value, economic-release reaction, market making, cross-market checks, risk-sized directional) with worked examples, and ' +
      'the market-making rule that a quote is only worth posting when the spread covers the fee plus fair-value uncertainty plus model error.',
    taken:
      'The taxonomy used to classify this roster\'s entries, and the market-making condition implemented as VolatilityArb_MM\'s spread rule. Its sizing advice (half-Kelly, hard ' +
      'daily loss caps) was deliberately NOT taken: the competition brief forbids risk management.',
    testable: 'partially',
    testedBy: ['VolatilityArb_MM'],
    notTestableReason: 'Weather and sports variants need series this repository does not hold (see R06/R07).'
  },

  /* ── 11. Fetched in full; why no cross-venue leg is in the roster ──── */
  {
    id: 'R11',
    title: 'Systematic Edges in Prediction Markets',
    host: 'quantpedia.com',
    url: 'https://quantpedia.com/systematic-edges-in-prediction-markets/',
    published: '2025-11-27',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-18',
    claim:
      'A review of inter-exchange arbitrage, intra-exchange mispricing and the longshot bias, with the arbitrage caveat that the opportunity exists only briefly and that ' +
      '"transaction costs significantly reduce the potential profits".',
    taken:
      'The intra-market check (YES + NO against $1.00) is implemented as a documented reciprocal-book rule in the Verification tab. No cross-venue leg is added to the roster, ' +
      'and the reason is stated instead of hidden.',
    testable: false,
    testedBy: [],
    notTestableReason: 'Cross-venue arbitrage requires a second venue\'s prices. A paper competition on one venue cannot settle a two-venue pair, so the leg stays out.'
  },

  /* ── 12. Read; the counter-weight to every arbitrage design ────────── */
  {
    id: 'R12',
    title: 'You Can Make Free Money on Polymarket. If You Know Math.',
    host: 'nytimes.com (interactive)',
    url: 'https://www.nytimes.com/interactive/2026/06/12/upshot/kalshi-polymarket-prediction-markets-arbitrage.html',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-18',
    claim: 'Reports that prediction-market arbitrage is now bot-dominated and fee-sensitive, quoting practitioners who stopped when fees rose.',
    taken: 'Only the caveat. It is the reason every recreated design in this project is replayed with the real fee schedule charged on every fill.',
    testable: false,
    testedBy: [],
    notTestableReason: 'Journalism about a second venue this project does not hold.'
  },

  /* ── 13. Read; favourite/longshot bias, with its own contradiction ─── */
  {
    id: 'R13',
    title: 'Favourite–longshot bias reading (as summarised in the search results for Kalshi longshot strategy)',
    host: 'laikalabs.ai / pith.science',
    urls: [
      'https://laikalabs.ai/prediction-markets/kalshi-prediction-market-trading-strategies',
      'https://pith.science/paper/2609.12878'
    ],
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-17',
    claim:
      'Two practitioner summaries of the same academic result: fade longshots priced 5-15¢, buy favourites 85-95¢; and the paper\'s own caveat that the sign of the effect ' +
      'depends on how contracts are aggregated (longshots lose when weighted equally, gain when grouped by parent event).',
    taken: 'The 5-15¢ fade band, implemented as LongshotFader_FLB, with the aggregation caveat recorded because it decides whether the effect is real.',
    testable: 'partially',
    testedBy: ['LongshotFader_FLB'],
    notTestableReason: 'The aggregation dimension needs parent-event grouping across many markets; this universe has three series and no cross-series event structure.'
  },

  /* ── 14. Tested: the owner's own Kalshi collector/backtester (MasterSite) ── */
  {
    id: 'R14',
    title: 'PriceKalshiHistorical — Autonomous Kalshi collector + backtester (3 reference strategies)',
    host: 'github.com/buffedlizard55-lab',
    url: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
    urls: [
      'https://github.com/buffedlizard55-lab/PriceKalshiHistorical',
      'https://buffedlizard55-lab.github.io/PriceKalshiHistorical/'
    ],
    capturedVia: RESEARCH_CAPTURE_METHODS.API_FILE,
    verifiedOn: '2026-09-18',
    claim:
      'The project\'s README documents three reference strategies shipped with its book-walking backtester (backtest/strategy_example.py): ' +
      '`mee` — "|Σ mids -1|>2.5¢ on mutually_exclusive events → Buy cheapest / sell richest leg; Pure cross-market mean reversion"; ' +
      '`fade` — "|mid(t)-mid(t-5m)|≥5¢ + spread≤3 ticks → Fade the spike (buy dip)"; ' +
      '`mom` — "mid(t)-mid(t-20) > 2¢ + tight spread → Follow momentum". ' +
      'The same README states the fee model "0.07*p*(1-p)" and that "Official API has no retroactive orderbook — this collector creates the history you need by polling live", ' +
      'which independently corroborates this repository\'s decision to capture order books with the ingest job rather than assume them.',
    taken:
      'All three reference strategies, recreated on THIS repository\'s verified bars with the granularity difference stated per entry: `mee` as MEE_BoardSum on the real ' +
      'KXHIGHNY/KXBTCY bracket boards (hourly bars, YES asks per band), `fade` as FadeSpike_Micro on 1-minute bars with the source\'s exact 5-minute lookback and 5¢ trigger ' +
      'and its spread≤3¢ filter, `mom` as MomTick_Micro on 1-minute bars (the source\'s 20-second window is shorter than one bar, so the closest testable analogue is the ' +
      '1-minute mid change ≥ 2¢ — labelled as an adaptation, not the source\'s signal).',
    testable: true,
    testedBy: ['MEE_BoardSum', 'FadeSpike_Micro', 'MomTick_Micro'],
    howTested:
      'The roster replays each entry against the real captured candlesticks (yes_bid/yes_ask per bar), pays the official quadratic fee with each series\' REAL captured ' +
      'fee multiplier, and bounds every fill by the bar\'s real traded volume and the captured ladder depth — the same fill realism the source project advocates.',
    caveat:
      'The source ran its strategies on ITS OWN 5-second/15-second snapshot database of live-polled books; this repository holds official candlesticks at 60m/1m granularity. ' +
      'The `mom` entry in particular is an adaptation (20-second momentum cannot be formed from 1-minute bars), and no performance number from the source is reused — ' +
      'the README reports none for these three strategies, only their rules.'
  }
]);


/**
 * The gaps that matter: what this project CANNOT test with the data it holds,
 * and the concrete action that would close each one. Published so a missing
 * test is never mistaken for a passed one. ROADMAP.md tracks these in order.
 */
export const RESEARCH_GAPS = Object.freeze([
  {
    gap: 'Weather markets (daily high temperature, precipitation)',
    why:
      'The single most-reported retail edge in the sources above, and the only one with a genuinely falsifiable external model: compare forecast probability with the market price, then trade the gap (R06: "70 out of 500 finished positive" on a 500-bot sweep).',
    blockedBy: 'No weather series is ingested — this universe is KXINXY, KXNASDAQ100Y and KXBTCY — and there is no point-in-time forecast archive in the repo.',
    toClose: 'Add a liquid daily-high series to the ingest (series path or explicit tickers), capture its daily bars, then pair it with an archived forecast so the model input is what was known at the time, not what is known now.'
  },
  {
    gap: 'Sports and event markets (in-play repricing)',
    why:
      'Every shock-timing and in-play scalp source trades these, and they reprice in seconds — which is what the panic-fade archetype actually needs (R04, R07).',
    blockedBy: 'No sports series is ingested, and 60-minute bars cannot represent an in-play shock.',
    toClose: 'Ingest one liquid sports series at period_interval=1 for a bounded window, then replay the intraday families on it. The intraday machinery (store, trim ledger, hourly flight) already exists.'
  },
  {
    gap: 'Cross-venue arbitrage (Kalshi vs Polymarket)',
    why: 'Reported by every arbitrage source reviewed, including the paper QuantPedia summarises (R11) and the NYT reporting (R12).',
    blockedBy: 'This project deliberately holds Kalshi data only, and a paper competition on one venue cannot settle a two-venue pair.',
    toClose: 'Add a second venue feed with the same verification standard, plus a settlement-equivalence check so both legs provably reference the same outcome.'
  },
  {
    gap: 'One-minute candles',
    why: 'The pale-fade source measured 15-minute markets; hourly bars cannot reproduce that resolution, and the hourly sweep showed the family never even triggers (0 of 96 variants traded).',
    blockedBy: 'The intraday store is configured for period_interval=60.',
    toClose: 'Add a second intraday block at period=1 for two or three markets with a bounded --max-bars trim, exactly as the 60-minute store was added.'
  },
  {
    gap: 'Live trading and real settlements',
    why: 'Nothing in the tracked universe has finalised yet, so every open position is marked to the last real quote rather than to $1 or $0.',
    blockedBy: 'Every tracked market resolves on or after 2026-12-31 (verified status=active, result="" from the live markets endpoint).',
    toClose: 'The settlement job polls daily. The first real cash settlement will book itself when a tracked market finalises; until then the leaderboard must keep saying "marked to last real quote".'
  }
]);

/** Strategies that were recreated from a public source, and which source. */
export function recreatedStrategyMap() {
  const out = {};
  for (const s of RESEARCH_SOURCES) {
    for (const username of s.testedBy || []) {
      out[username] = out[username] || [];
      // Some entries carry a single `url`, others a `urls` array; the caller
      // (UI + test) must always receive something a human can open.
      const url = s.url || (s.urls && s.urls[0]) || null;
      out[username].push({ id: s.id, title: s.title, url, urls: s.urls || [], capturedVia: s.capturedVia, host: s.host });
    }
  }
  return out;
}

/** Headline counts for the UI, derived from the ledger (never typed by hand). */
export function researchStats() {
  const testedStrategies = new Set(RESEARCH_SOURCES.flatMap((s) => s.testedBy || []));
  return {
    sources: RESEARCH_SOURCES.length,
    fetchedPages: RESEARCH_SOURCES.filter((s) => s.capturedVia === RESEARCH_CAPTURE_METHODS.FETCHED).length,
    searchExcerpts: RESEARCH_SOURCES.filter((s) => s.capturedVia === RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT).length,
    apiFileFetches: RESEARCH_SOURCES.filter((s) => s.capturedVia === RESEARCH_CAPTURE_METHODS.API_FILE).length,
    sourcesWithAReplay: RESEARCH_SOURCES.filter((s) => (s.testedBy || []).length > 0).length,
    strategiesRecreated: testedStrategies.size,
    notTestableHere: RESEARCH_SOURCES.filter((s) => s.testable === false).length,
    partial: RESEARCH_SOURCES.filter((s) => s.testable === 'partially').length
  };
}

export const RESEARCH_META = Object.freeze({
  capturedOn: '2026-09-18',
  venuesSearched: [
    'reddit.com — r/Kalshi, r/PredictionsMarkets, r/PredictionMarkets, r/ClaudeCode',
    'web search — strategy guides, papers, GitHub, news',
    'kalshi.com / docs.kalshi.com — official, recorded in src/verification-data.js'
  ],
  note:
    'Two sources were loaded and read in full (botforkalshi.com, quantpedia.com). The Reddit threads could not be fetched (HTTP 403 to this sandbox) and were read through ' +
    'the search engine\'s full-text excerpt of the thread; every entry says which method was used. No source is treated as documentation of the exchange itself, and no ' +
    'source\'s performance number is reused as a result of this project.'
});
