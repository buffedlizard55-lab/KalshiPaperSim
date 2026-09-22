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
  API_FILE: 'GitHub REST API raw-file fetch — the document was loaded and read in full (the sandbox cannot open TLS to github.io, so the Pages render was not fetched)',
  /* Added 2026-09-20 (irregularity #53): two entries merged by a parallel
     session carried a SEARCH-RESULTS page as their URL and a "quote" that no
     specific video or post could be found for. They are kept — the strategy
     designs named after them exist and are measured — but labelled with this
     method so nobody mistakes the quoted text for a transcription. */
  UNATTRIBUTED: 'unattributed — the recorded URL is a search-results page, not a document; the quoted text could not be traced to a specific video or post and must be read as a paraphrase of a genre, not a quotation'
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
  },

  /* ── 15. Tested: the 75–80¢ high-probability scalp (r/KalshiBTCUporDown15) ── */
  {
    id: 'R15',
    title: 'My complete strategy for BTC Up or Down 15 (subreddit pinned write-up)',
    host: 'reddit.com/r/KalshiBTCUporDown15',
    url: 'https://www.reddit.com/r/KalshiBTCUporDown15/',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-19',
    claim:
      '"my philosophy on predictive markets is to find high probability positions that are undervalued. For BTC Up or Down 15, I wait until one side has reached 80% market ' +
      'probability. If I feel there is good value at 75-80 cents, I invest then. If I am not yet convinced that the 80% probability is accurate, I wait. Once I have an ' +
      'accepted bid, I immediately set a take profit limit order for 95 cents." — "Take a side with a high probability of winning and exit with 15-20 cents profit as soon ' +
      'and as often as possible." The same write-up describes reading the chart with Bollinger bands and a discretionary stop expressed as a BITCOIN price level ("I am ' +
      'getting out if it ever reaches +25"), not as a contract price.',
    taken:
      'The two mechanical rules: (1) enter the high-probability side while it is quoted 75–80¢; (2) take profit at 95¢. Both are contract-price rules, so they translate ' +
      'directly onto this repository\'s real 1-minute candlesticks (yes_bid/yes_ask per bar).',
    testable: true,
    testedBy: ['HighProb_Scalp8095'],
    howTested:
      'HighProb_Scalp8095 replays the real 1-minute stores of KXBTC15M/KXETH15M/KXSOL15M/KXGOLD15M: buy YES when the YES ask is 0.75–0.80, buy NO when the NO ask is ' +
      '0.75–0.80, sell the position when its price reaches the source\'s 0.95 take-profit, otherwise hold to the exchange\'s real settlement. Official quadratic fees, ' +
      'real per-bar volume bounds and captured-ladder depth apply like every roster entry.',
    caveat:
      'reddit.com returns HTTP 403 to this sandbox, so the write-up was read through the search engine\'s full-text excerpt of the subreddit\'s pinned post (the same ' +
      'capture method as R01), not a page fetch. Three parts of the source design are NOT recreated and the entry says so: (1) the discretionary filter ("IF I FEEL there ' +
      'is good value") is a human judgement this replay cannot have — the recreation takes every mechanical 75–80¢ occurrence; (2) the stop-loss is a BITCOIN price level ' +
      'and this store holds no BTC spot feed, so positions that never reach 95¢ ride to the exchange\'s real settlement instead; (3) the source names no position size — ' +
      'the 25%-of-cash sizing is this repository\'s own choice and is labelled as such on the strategy.'
  },

  /* ── 16. UNATTRIBUTED genre reference: passive maker grids (merged by a parallel session, PR #17) ── */
  {
    id: 'R16',
    title: 'Kalshi "AMM" / passive maker-grid tutorials (genre reference — no specific video or post could be attributed)',
    host: 'youtube.com / x.com (search pages)',
    url: 'https://www.youtube.com/results?search_query=kalshi+market+maker+strategy',
    capturedVia: RESEARCH_CAPTURE_METHODS.UNATTRIBUTED,
    verifiedOn: '2026-09-20',
    claim:
      'RECORDED BY A PARALLEL SESSION (PR #17, 2026-09-19) as a quotation: "Automated market making on Kalshi lets you provide passive liquidity on both YES and NO sides when spreads ' +
      'widen to 3–5 cents. By resting bids at the inside touch you pay 0% maker fees on fee-free series like KXBTCY and discounted maker fees across index markets, capturing the ' +
      'spread rebate when taker flow crosses your orders." On 2026-09-20 this text could not be traced to any specific video or post — the recorded URL is a YouTube search page — ' +
      'so it is kept here ONLY as a description of a genre of tutorial, not as a quotation from one (irregularity #53). One part of it IS independently true in this repository: ' +
      'KXBTCY is fee-free per the captured fee schedule (data/discovered/series-fees.json), and maker orders are charged per the official schedule (V-table).',
    taken:
      'Nothing verbatim. The design named after it (GridMM_MultiTier) is this repository\'s own: rest ONE maker bid one tick above the best bid when the captured spread is ≥ 3¢ and offer every fill back at cost + 3 ticks.',
    testable: true,
    testedBy: ['GridMM_MultiTier'],
    howTested:
      'GridMM_MultiTier replays the KXNASDAQ100Y / KXBTCY / KXINXY daily stores with MAKER orders only (type limit, direction bid/ask): a resting order fills only when a LATER real bar trades through its price, capped by that bar\'s real volume, and the official maker fee regime of each series applies. (The version merged in PR #17 described maker orders but sent taker market buys — corrected 2026-09-20.)',
    caveat:
      'Unattributed source: no performance claim, no parameter and no quotation from it may be relied on. If a specific tutorial is later identified, this entry should be re-captured with its URL and re-labelled.'
  },

  /* ── 17. UNATTRIBUTED genre reference: KXFED "rate-cut sniping" threads (merged by a parallel session, PR #17) ── */
  {
    id: 'R17',
    title: 'Kalshi Fed-decision (KXFED) "implied probability sniping" threads (genre reference — no specific post could be attributed)',
    host: 'x.com / reddit.com (search pages)',
    url: 'https://x.com/search?q=kalshi+fed+rate+cut',
    capturedVia: RESEARCH_CAPTURE_METHODS.UNATTRIBUTED,
    verifiedOn: '2026-09-20',
    claim:
      'RECORDED BY A PARALLEL SESSION (PR #17, 2026-09-19) as a quotation: "Kalshi Fed interest rate contracts (KXFED) often lag CME FedWatch futures implied odds ahead of FOMC ' +
      'meetings. When the consensus 25bps or 50bps cut strike is priced between 30c and 65c, buying YES offers asymmetric upside as prediction market liquidity converges to ' +
      'institutional rate probabilities." On 2026-09-20 this text could not be traced to any specific post — the recorded URL is an X search page — so it is kept ONLY as a ' +
      'description of a genre, not as a quotation (irregularity #53). The "lag CME FedWatch" claim is UNVERIFIED here: this repository holds no futures-implied feed and does not test it.',
    taken:
      'Nothing verbatim. The design named after it (FOMC_ProbabilitySniper) is this repository\'s own price-only rule: buy any KXFED bracket whose daily YES ask closes between 0.30 and 0.65 and hold to the FOMC settlement.',
    testable: true,
    testedBy: ['FOMC_ProbabilitySniper'],
    howTested:
      'FOMC_ProbabilitySniper replays the real KXFED daily store: buys YES on every bracket priced 0.30–0.65 (it does NOT identify a modal strike and reads no external probability) and holds to the official decision settlement ($1.00/$0.00). Official fees, volume bounds and captured depth apply.',
    caveat:
      'Unattributed source, and the strategy is not the strategy the genre describes (no FedWatch comparison, no modal-strike selection). Its result measures the price band alone.'
  },

  /* ── 18. Reference table for the MLB in-play entries (2026-09-20) ─────── */
  {
    id: 'R18',
    title: 'Chance of Winning a Baseball Game — home-team win expectancy by inning and run differential (probability theory)',
    host: 'tangotiger.net',
    url: 'https://tangotiger.net/innwin.html',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-20',
    claim:
      '"The chance of the home team winning, at the start of each inning (or bases empty with no outs), based on probability theory. Assumptions: Both teams are equals at every ' +
      'point in the game. No Home Field Advantage exists. Based on a 4.3 Runs-per-game environment." Read cells (home score differential in columns −4..+4): top of the 6th ' +
      '+2 = 0.790, +3 = 0.873; bottom of the 6th +2 = 0.853; top of the 7th +2 = 0.826, −1 = 0.299; top of the 8th +2 = 0.872, −1 = 0.247; top of the 9th +2 = 0.930, ' +
      '−1 = 0.158; bottom of the 9th −1 = 0.194. The page links an empirical companion table (innwin2.html) and a with-home-field-advantage variant (innwin3.html).',
    taken:
      'The innings-6-to-9 rows, transcribed verbatim into src/strategies.js (TANGO_HOME_WIN_EXPECTANCY) as the THEORETICAL REFERENCE PRICE the two MLB entries compare a ' +
      'contract\'s ask against. Nothing else: the table is not a prediction of any real game and never enters a result except through a fill against real captured bars.',
    testable: true,
    testedBy: ['MLBLead_InPlay', 'MLBTrail_Comeback'],
    howTested:
      'Both entries read the point-in-time OFFICIAL MLB game state (data/mlb-signals/, statsapi.mlb.com, archived every 20 minutes) joined to the KXMLBGAME contract by ' +
      'first-pitch instant + away code + home code (fact V113), then buy YES only when the real 1-minute ask is at least 2¢ below the table\'s equal-teams probability ' +
      'for that half-inning and lead (leader ≥ 2 runs from the 6th; trailer by exactly 1 from the 7th). Fills, official fees (KXMLBGAME multiplier 0.5), per-bar volume ' +
      'bounds and the exchange\'s real settlement apply as for every roster entry. Forward test by construction: no state row exists before the first workflow run.',
    caveat:
      'The table is a THEORY under stated assumptions (equal teams, no home-field advantage, 4.3 runs per game), not an observation, and the with-HFA variant on the same ' +
      'site gives different numbers (e.g. top of the 6th +2 = 0.810). The entries state this on the strategy card: a real favourite\'s lead is worth more than the table ' +
      'says and a real underdog\'s less, so the 2¢ margin is a fee buffer, not an edge estimate. The archive samples the game every ~20 minutes, so the state a decision ' +
      'reads can lag the field by up to that much — the lag is what the forward test measures.'
  },
  {
    id: 'R19',
    title: 'I built a +39% Kalshi trading bot to exploit World Cup market panics ("Shock-Timing" — full strategy + code, WITH the author\'s negative post-mortem)',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1u3rn8s/i_built_a_39_kalshi_trading_bot_to_exploit_world/',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-21',
    claim: '"Detect the shock: max drawdown inside a 2-minute sliding window; fire when the drop is ≥ 15% of the peak AND ≥ 8¢ absolute. Ladder in: four laddered limit buy orders at increasing depths ... $P_50$ Order: 10% of allocated capital. $P_75$ Order: 20% ... Orders stay active for 60 seconds. To exit, the bot places a resting limit sell order slightly above the panic price to capture a quick 4¢ to 6¢ profit per contract as the spread normalizes. Keeping both entry and exit on resting limit orders completely sidesteps Kalshi\'s fee drag." In-play windowing: "Kalshi closes each market at the final whistle, so I used that to anchor a [close − 150min, close] window and throw away everything outside it." The SAME post\'s TL;DR then says, of a ~1.5M-trade backtest plus the full 2022 World Cup out of sample: "It doesn\'t work."',
    taken: 'The four-rung maker ladder (P50 10% / P75 20% / P90 30% / P95 40%), the dual threshold (≥15% of peak AND ≥8¢ inside 2 minutes), the 4-6¢ maker exit and the [close−150min, close] entry window are already represented in this repository by PanicDip_ShockTiming (three-rung variant, period-low ≤ 0.70 × 5-period mean). This row pins the EXACT v1 parameters and the author\'s own out-of-sample verdict, so any future four-rung refinement must cite BOTH the parameters and "It doesn\'t work" rather than the +39% headline. No new entry was created for the four-rung variant: it differs from PanicDip_ShockTiming only in rung count and detector constants, and one honest recreation plus one honest post-mortem is worth more than two overlapping usernames.',
    testable: true,
    testedBy: ['PanicDip_ShockTiming'],
    howTested: 'PanicDip_ShockTiming runs the same shock-then-maker-ladder shape on the real 1-minute store (KXBTC15M/KXETH15M/KXSOL15M/KXGOLD15M) with official fees and real settlements; its verdict string is computed from those fills. The [close−150min, close] windowing is not reproducible on the 15-minute crypto contracts (their whole life is shorter than the window) and is only meaningful on match markets once the game-series 1-minute capture (data/history/_ingest-request.json minute-mlb-game-lines / minute-nfl-game-lines) produces bars.',
    caveat: 'The headline "+39%" is a pre-post-mortem figure; the same author, testing ~1.5M real trades + the entire 2022 World Cup out of sample, concludes "It doesn\'t work." Treat the parameters as measured and the profitability as REFUTED by its own source until a forward test on captured game-window ladders (the 00:30/02:30 UTC daily-history passes added 2026-09-21) says otherwise.'
  },
  {
    id: 'R20',
    title: 'People who actually WIN MONEY on Kalshi: what\'s your secret? (retail practitioner thread — resting-order discipline, longshot scalps, spread flipping)',
    host: 'reddit.com/r/Kalshi',
    url: 'https://www.reddit.com/r/Kalshi/comments/1qd4ubf/people_who_actually_win_money_on_kalshi_whats/',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-21',
    claim: 'Snoo-77724: "simple, never use market order, always use limit orders below the price usually 5-15 cents lower than current price and set a bunch of them out there and let them come to you, when whales have capital flying around you\'ll hit the natural dips ... hint: don\'t trade the event, trade the orderbook wall". Big_Buy_7252: "if you throw around a little for these underdog/longshots it can pay out big ... throw a buck on a hundred contracts of a longshot and potentially win $100 ... I\'ve pushed 100 contracts from one to ten a bunch, that\'s an easy 9x on a dollar sometimes". Ecstatic_Soft5023: "Buy low at 20-30 percent and sell at halftime when the numbers closer to 50 percent." LupineChemist: "in some low liquidity markets, you can make a couple percent just on spreads. Just have a ton of resting buy orders and then immediately flip them to resting sell orders where the market is." Joethecoew adds the failure mode the entry must respect: "check order book if doing quick sell ... make sure you don\'t sell enough to get slammed down to the next two price tiers".',
    taken: 'Two recreations, each with one named rule: OrderbookWall_3Rung (the Snoo-77724 5-15¢ resting-bid wall + the LupineChemist fill-and-flip spread capture, on spreads ≥ 3 ticks) and LongshotScalp_9x (the Big_Buy_7252 hundred-contracts-from-1¢-to-10¢ longshot scalp). The Ecstatic_Soft5023 halftime swing is NOT recreated: it needs sell-at-halftime clock data this store does not archive.',
    testable: true,
    testedBy: ['OrderbookWall_3Rung', 'LongshotScalp_9x'],
    howTested: 'Both run on the real captured bars with official fee schedules and real settlements. OrderbookWall_3Rung rests three maker bids 5¢/10¢/15¢ under the touch only when the captured spread is ≥ 3 ticks (the thread\'s own "low liquidity" qualifier) and flips each fill to a maker offer at cost + 2¢ ("a couple percent"). LongshotScalp_9x buys 100 contracts only at a captured ask ≤ 2¢ and rests its exit at 10¢ — the thread\'s own 1-to-10 band — or holds to the exchange\'s real result.',
    caveat: 'An anonymous thread is anecdotes, not evidence: no fills, no dates, no sample. Reaper_1492\'s reply in the same thread is the standing counter ("the ability to trade OUT at relative value is non-existent, even in markets with high liquidity"), and Joethecoew reports being "wiped out before by being arrogant on a safe bet". The recreations therefore compute their verdicts from real fills only; the quotes above are transcribed as DESIGN INTENT, never as a claimed edge.'
  },
  {
    id: 'R21',
    title: 'Kalshi Weather Contracts: The Complete 2026 Trading Guide (forecast-skill decay, model divergence, NHC track convergence)',
    host: 'reddit.com/r/PredictionsMarkets',
    url: 'https://www.reddit.com/r/PredictionsMarkets/comments/1rxxte0/kalshi_weather_contracts_the_complete_2026/',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-21',
    claim: '"A temperature forecast for tomorrow is accurate to within roughly 1 to 2 degrees Fahrenheit ... For near-term contracts, the edge window collapses as the resolution date approaches ... that window is typically 24 to 72 hours for temperature contracts, longer for seasonal aggregates." "When Kalshi prices a two-week-out temperature contract as confidently as a two-day contract, that is a mispricing. The market is not correctly accounting for forecast skill decay." Edge 1: "When the European model and the GFS disagree significantly ... and Kalshi is pricing as if consensus exists, that divergence is an opportunity." Hurricane deep dive: "The market consistently lags model convergence by 4 to 12 hours ... That lag is the edge window."',
    taken: 'Documented as measured guidance for the weather flight (S04-S09 family): the 24-72h edge window and the skill-decay claim are recorded here. NOT recreated as a strategy this session: the tradeable forms need inputs this store does not archive — (a) two-model divergence requires Euro AND GFS forecast rows side by side (the forecast archive stores one series per city), and (b) skill decay by lead time requires the lead-time band of each quoted contract, which the current measurement rows do not pin. Recreating it on price alone ("far date + confident price") would fabricate the direction the source gets from model divergence — refused under the honesty rule.',
    testable: false,
    notTestableReason: 'Blocked pending (1) a second forecast model column in data/forecasts/ (Euro or GFS alongside the archived series) and (2) lead-days on each archived prediction row (the archive-forecasts run computes horizon already — surfacing it in each row would unblock both this and the skill-decay rule). Tracked in RESEARCH_GAPS.',
    testedBy: [],
    howTested: 'Not testable here until the two archive fields above exist; the blockers are the RESEARCH_GAPS rows this source added.',
    caveat: 'A guide post (merchant-adjacent — it shares its site\'s funnel with the Candlecharts contest stack, R27), not a peer-reviewed measurement. Its numbers (1-2°F one-day skill, 4-12h market lag) are its own; nothing here is a price or a settlement input.'
  },
  {
    id: 'R22',
    title: 'Best Kalshi Strategies? (retail thread — swing-range scalping, favourites discipline, in-play longshots)',
    host: 'reddit.com/r/Kalshi',
    url: 'https://www.reddit.com/r/Kalshi/comments/1obxdcl/best_kalshi_strategies/',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-21',
    claim: 'kashola17: "purchase markets that tend to swing up and down. Buy low and hedge at a 15% gain and get out. For example; close tennis matches go from 30-70% the entire match depending how close it is." Educatedadam: "the only option ... is to make small slow bets on favorites ... go with heavy favorites and play the long game." EntertainmentWild291: "the loser by a few points has a 4% buy small shares" (in-play cheap side). InfamousRain9827: "Find markets where asymmetric information can be found ... and be EARLY."',
    taken: 'Recreated as SwingRange_Scalp (the kashola17 rule verbatim: detect an oscillating range, buy its low end, exit at +15% of cost and get out). The Educatedadam favourites rule is the documented premise of Favourite_BaseRate (S13) and is re-cited there; the EntertainmentWild291 cheap-side rule is LiveCheapBracket_Ladder\'s premise on the desk.',
    testable: true,
    testedBy: ['SwingRange_Scalp'],
    howTested: 'SwingRange_Scalp runs on the real 1-minute store (KXBTC15M/KXETH15M/KXSOL15M/KXGOLD15M): a market qualifies when the 20-bar mid range spans ≥ 30¢ (the source\'s 30-70 oscillation), the entry fires at the range\'s low end (≤ 25% up from the range low) when a side still asks ≤ 35¢, and the exit is a resting maker offer at cost × 1.15 — the source\'s "hedge at a 15% gain and get out". Official maker fees and real settlements apply. The tennis example itself cannot be tested here (no tennis series on Kalshi / none captured); the crypto 15-minute contracts are the captured oscillating instruments.',
    caveat: 'Same thread as R20: anecdotes only. "Tennis matches go from 30-70%" describes tennis MATCH odds on a betting venue, not a Kalshi contract class — the recreation ports the RANGE rule to captured Kalshi oscillators and says so on the card. kashola17\'s "hedge at a 15% gain" is implemented as a flat exit, not a hedge leg (single-contract replay).'
  },
  {
    id: 'R23',
    title: 'Trading Strategies for Prediction Markets — a synthesis of academic papers on the favourite-longshot bias and buy-NO mechanics on Kalshi',
    host: 'medium.com/@FrenzyCapital',
    url: 'https://medium.com/@FrenzyCapital/trading-strategies-for-prediction-markets-4025a050e2e2',
    capturedVia: RESEARCH_CAPTURE_METHODS.SEARCH_EXCERPT,
    verifiedOn: '2026-09-21',
    claim: '"Longshot fading via \'Buy No\': ... When a Yes contract is overpriced at $0.15 (implying 15% probability for something that is truly a 10% event), you do not need to short the Yes. Instead, buy the corresponding No contract ... Buying No on overpriced longshots is the single highest-edge strategy in the literature." The synthesis also lists "passive liquidity underwriting on Kalshi" among its reviewed edges.',
    taken: 'Cited as the academic frame for LongshotFader_FLB (S19)\'s 30-45¢ band buy-NO rule (S19 was built from the sweep-family detectors; this paper is the literature statement of the same mechanism). "Passive liquidity underwriting" is the documented premise of the desk\'s LiveMakerTouch. No third recreation: the paper\'s own worked example (YES 15¢ vs true 10%) needs a true-probability model per market — with only prices, that example reduces to S19\'s band rule already implemented.',
    testable: true,
    testedBy: ['LongshotFader_FLB'],
    howTested: 'S19 buys NO in the 30-45¢ longshot band on real captured bars and holds to real settlements (its box-hit rates are computed from those fills: 0 of 10, 1 of 8 and 2 of 10 settle in the money — a measured NEGATIVE longshot win-rate, exactly the favourite-longshot bias this source describes). LiveMakerTouch underwrites captured depth on the live desk.',
    caveat: 'A Medium post summarising papers this sandbox cannot open (paywalled/SSRN); the synthesis\'s characterisations are second-hand. The favourite-longshot bias itself is well established in the racing literature, but the claim "single highest-edge strategy" is the author\'s ranking, not a measurement — our own S19 fills currently show the bias as LOSING for longshot YES boxes and are being tested on the NO side precisely to quantify it with real simulated money.'
  },
  {
    id: 'R24',
    title: 'Kalshi homepage — live market board (odds formats, series taxonomy, the NYG@LAR Monday-night market, macro headlines) (first chunk(s) of the board; the rest is pagination)',
    host: 'kalshi.com',
    url: 'https://kalshi.com/',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-21',
    claim: 'The board renders each contract as "Pays out | Odds" pairs — e.g. NY Giants 3.29x / 29%, LA Rams 1.36x / 71% on KXNFLGAME-26SEP21NYGLAR ("$38,600,150 vol", "Kickoff is at 8:15 PM ET, airing on ESPN and ABC" at SoFi Stadium). Category URLs follow /category/{economics|sports|culture|politics|elections|mentions|commodities}/... and market URLs /markets/{series}/{slug}/{ticker} with tickers WITHOUT the yes-code suffix shown in the API (kxnflgame-26sep21nyglar vs the API\'s KXNFLGAME-26SEP21NYGLAR-LAR). Series observed live: KXSUPERBOWLHEADLINE, KXRATEHIKE ("Number of rate hikes in 2026? Exactly 2 = 1.62x/58%"), KXTRUMPMENTION, KXEARNINGSMENTION{COST,NKE}, KXVMA, KXBIGBROTHER, KXPAYROLLS, KXBRPRES, KXCPI, KXCRYPTOSTRUCTURE, KXTRDBAN, KXDEBTGROWTH. The board\'s news block states: "The Federal Reserve raised its benchmark interest rate by a quarter point to a range of 3.75% to 4.00%, its first increase since 2023, according to CNBC ... under Chair Kevin Warsh."',
    taken: '(1) The frontend\'s odds display (payout multiple + implied %) is mirrored in the site docs so a reader can reconcile our cents-against-$1 quotes with what kalshi.com shows; (2) the ticker canonical form WITHOUT the yes-code suffix is now the documented URL↔API join rule for official links on every review row; (3) the NYG@LAR lines (29% / 71% at fetch time) are the public board\'s read of the SAME market our ESPN fixture (401872947) and game-window capture plan target — kept as CONTEXT ONLY (it is a rendered marketing board, not the API); (4) the Fed-hike headline is flagged in IRREGULARITIES for macro-series readers because it moves KXRATEHIKE/KXINXY-class series and this repo trades those.',
    testable: false,
    notTestableReason: 'Not a price source (honesty contract: prices come from the Kalshi API stores only). The URL/ticker join rule IS exercised by every official link the review rows emit; the fixture coincidence (NYG@LAR) is asserted in test 131 against the API-shaped capture, not against this board.',
    testedBy: [],
    howTested: 'Not a price source (honesty contract: prices come from the Kalshi API stores only). The URL/ticker join rule IS exercised by every official link the review rows emit; the fixture coincidence (NYG@LAR) is asserted in test 131 against the API-shaped capture, not against this board.',
    caveat: 'A marketing page, fetched once, not archived as data. Marketing boards can lag the book and round ("29% / 71%" is 2-significant-figure rounding of API cents). The Fed line is a news blurb citing CNBC — a third-hand statement kept as a dated observation, never as a price or a rule input.'
  },
  {
    id: 'R25',
    title: 'The Leap — TradingView\'s paper-trading competition platform (formats, cadence, champions disclosure) (chunk 1 of 3; the remainder is the past-champions list)',
    host: 'tradingview.com/the-leap',
    url: 'https://www.tradingview.com/the-leap/',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-21',
    claim: '"Risk-free trading competitions with real-money prizes and real practice up for grabs." Cadence: roughly monthly themed contests across futures/forex/stocks/crypto/multi-asset with 36k-108k traders each (e.g. "The Leap by AMP Futures — Sep 1-30, 2026 — 102,034 traders — $50K prize pool and 250 plans"). Champions are published with exactly two performance numbers: "Net profit +155.95%" and "Profitable trades 65%" (July 2026 futures, 107,677 traders), "+271.78% / 77%" (crypto), "+17.58% / 95%" (stocks), "+308.07% / 52%" (multi-asset) — each linking a contest-results post "to see who took home the prizes and learn about their winning strategies".',
    taken: 'Design review of our yearly competition (request #6): (1) The Leap\'s champions disclosure is exactly two numbers (net profit % + profitable-trade %) plus a strategy write-up — our standings table leads with totalReturns + winRate + a card link, matching this format; (2) their per-asset monthly cadence is mirrored by our flight/season structure; (3) their "contest results" posts are our competition-memory store (every strategy\'s trades kept as memory for future analysis). Field applied: the standings/review tables pair every username\'s return with its win rate and its verdict/caveat link, the same two-number + story disclosure The Leap uses.',
    testable: false,
    notTestableReason: 'Competitive-design review only (request #7: reverse-engineer the four competition sites). No price or rule is taken from a competitor\'s page; the fields we borrow are presentation and disclosure structure.',
    testedBy: [],
    howTested: 'Competitive-design review only (request #7: reverse-engineer the four competition sites). No price or rule is taken from a competitor\'s page; the fields we borrow are presentation and disclosure structure.',
    caveat: 'Marketing copy and winners\' showcase — survivorship by construction (losers are not profiled). The spectacular +271%/+308% monthly numbers are top-of-100k-leaderboard outliers over ~1 month; they are not comparable to a year-long all-strategy roster and must never be cited as an expected return.'
  },
  {
    id: 'R26',
    title: 'Trade-Ideas PM Challenge — daily paper-trading competition (leaderboard schema, trade ticket, Money Machine tournaments)',
    host: 'trade-ideas.com/stock-trading-competition',
    url: 'https://trade-ideas.com/stock-trading-competition/',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-21',
    claim: 'The "PM Challenge Leaderboard" schema is exactly: "Rank | User | Total Profit | Open Profit | Close Profit | Total Trades | Open Trades | Closed Trades | Account Value | Average Profit/Trade". Tournaments ("Money Machine Trades / PMC", "Battle of the Bears", "$4000 PRIZE") run alongside; the trade ticket exposes "SWING EXIT / SMART STOP / PROFIT TGT" one-click exits and a "1.3 MIN RACE / Stock Race Replay Today" gamification strip. The page states "Notice: Data delayed by 15 minutes."',
    taken: 'The leaderboard schema is the trade-tracking schema the request asks for (#4: "readable review of all placed trades AND all upcoming trades"): the unified trade review (data/reports/trades-review-*.md + data/ledger/unified-trades.csv, generated by scripts/export-ledger.mjs --review) reports, per username, exactly these columns — total/open/closed profit, total/open/closed trade counts, account value and average profit per trade — plus the Kalshi-specific fields our honesty contract demands (fees, slippage vs captured ask, depth consumed). Their SWING EXIT / PROFIT TGT buttons are the mechanism SwingRange_Scalp automates.',
    testable: false,
    notTestableReason: 'Design review (request #7). The adopted schema is asserted by the export script\'s own output headers and the review tables it renders; every number in them is computed from our ledgers, never from this page.',
    testedBy: [],
    howTested: 'Design review (request #7). The adopted schema is asserted by the export script\'s own output headers and the review tables it renders; every number in them is computed from our ledgers, never from this page.',
    caveat: 'The live leaderboard is behind a login ("Login to see contest results"), so the sample rows visible publicly are zeroed/placeholder — the schema was readable, the actual standings were not. "Data delayed by 15 minutes" on their quotes is the standard equities convention and is NOT acceptable here: our review rows carry the capture instant of every quote instead.'
  },
  {
    id: 'R27',
    title: 'The Candlecharts Paper Trading Showdown 2026 — one-week contest run on TradingView Community Competitions ($50k paper account, top-3 prizes, journal + wrap-up)',
    host: 'specials.candlecharts.com/contest',
    url: 'https://specials.candlecharts.com/contest/',
    capturedVia: RESEARCH_CAPTURE_METHODS.FETCHED,
    verifiedOn: '2026-09-21',
    claim: '"Trade a $50,000 paper account in any market, climb the live leaderboard, and compete for prizes—without risking real money. Starts September 20 at 5 PM Eastern — Ends September 25 at 5 PM Eastern." "We\'ll use the final leaderboard posted on the TradingView Community Showdown page. The top three finishers will receive the prizes." The mandated stack: a TradingView paper account, Market Central analysis, the Nison Candle Scanner ("scan, highlight, and receive alerts for candlestick signals") and the Candlecharts Journal ("Document your plan, execution, and lessons so every contest trade becomes part of a more repeatable process"). Every participant is invited to a "Post-Showdown Wrap-Up Session".',
    taken: 'Design review (request #7): (1) their WEEKLY cadence + "trade any market" maps to our flights and the unified trade review\'s per-day tables; (2) "document plan, execution and lessons for every trade" is exactly the per-strategy why-it-worked/didn\'t memory the request demands (#6) — our competition-memory store + the verdict/limitation strings on every card are that journal, and the trades review now carries each fill\'s reason string verbatim as the plan/execution note; (3) the Post-Showdown wrap-up maps to the year-end review this competition publishes at each season close. Field applied: the trade review renders each row\'s verbatim decision reason (the journal entry) next to the fill.',
    testable: false,
    notTestableReason: 'Design review (request #7). Nothing numeric is taken from the page.',
    testedBy: [],
    howTested: 'Design review (request #7). Nothing numeric is taken from the page.',
    caveat: 'A marketing funnel for the Candlecharts tool stack (journal/scanner trials) built on TradingView\'s community-competition plumbing; the contest itself ran Sep 20-25, 2026 and its leaderboard lives on tradingview.com/community-competitions/... (not fetched). Prize structure (1st lifetime journal, 2nd/3rd store credit) is their commercial arrangement and is not a performance claim.'
  },

]);


/**
 * The gaps that matter: what this project CANNOT test with the data it holds,
 * and the concrete action that would close each one. Published so a missing
 * test is never mistaken for a passed one. ROADMAP.md tracks these in order.
 */
export const RESEARCH_GAPS = Object.freeze([
  /* STATUS DISCIPLINE (2026-09-20): a gap is kept on this list after it closes,
     marked status 'closed' with what closed it, so the site never shows a
     stale "cannot test yet" card (IRREGULARITIES.md #52 — four of the five
     cards below were shown as open for two days after the store had closed
     them). `blockedBy` is written in the tense the status implies. */
  {
    gap: 'Weather markets (daily high temperature, precipitation)',
    status: 'closed',
    why:
      'The single most-reported retail edge in the sources above, and the only one with a genuinely falsifiable external model: compare forecast probability with the market price, then trade the gap (R06: "70 out of 500 finished positive" on a 500-bot sweep).',
    blockedBy: 'WAS: no weather series ingested and no point-in-time forecast archive in the repo (as of 2026-09-17).',
    toClose: 'Add a liquid daily-high series to the ingest, capture its bars, then pair it with an archived forecast so the model input is what was known at the time.',
    closedBy:
      'CLOSED 2026-09-18: nine KXHIGH* series ingested at 60-minute resolution with settled results (data/history/intraday/60m/), and the NWS point forecast archived five times a day per city (data/forecasts/, weather-signals.yml). Tested by ForecastEdge_Weather / ForecastEdge_MultiCity (point-in-time) and the WeatherLadder_* controls. Still open inside it: the archive↔bar overlap is only days old (ROADMAP Next #1).'
  },
  {
    gap: 'Sports and event markets (in-play repricing)',
    status: 'partially closed',
    why:
      'Every shock-timing and in-play scalp source trades these, and they reprice in seconds — which is what the panic-fade archetype actually needs (R04, R07).',
    blockedBy:
      'WAS: no sports series ingested and 60-minute bars cannot represent an in-play shock. NOW: seven game-line series are ingested hourly with settled results, but only MLB has (a) a 1-minute ingest block and (b) a point-in-time official game-state archive; NFL / NBA / NCAA / NHL have no archived live state and no 1-minute bars.',
    toClose: 'For each remaining league: an official or clearly-labelled live-state feed archived with capture timestamps, plus a 1-minute ingest block for its game series — the MLB pattern (scripts/archive-mlb-signals.mjs + minute-mlb-game-lines) is the template.',
    closedBy:
      'PARTIALLY CLOSED 2026-09-20: KXMLBGAME at period_interval=1 (ingest block minute-mlb-game-lines) joined to the official MLB Stats API linescore archived every 20 minutes (data/mlb-signals/, mlb-signals.yml). Tested by MLBLead_InPlay and MLBTrail_Comeback (R16) — forward tests that abstain until archive and bars overlap.'
  },
  {
    gap: 'Cross-venue arbitrage (Kalshi vs Polymarket)',
    status: 'open',
    why: 'Reported by every arbitrage source reviewed, including the paper QuantPedia summarises (R11) and the NYT reporting (R12).',
    blockedBy: 'This project deliberately holds Kalshi data only, and a paper competition on one venue cannot settle a two-venue pair.',
    toClose: 'Add a second venue feed with the same verification standard, plus a settlement-equivalence check so both legs provably reference the same outcome (ROADMAP Next #7).'
  },
  {
    gap: 'One-minute candles',
    status: 'closed',
    why: 'The pale-fade source measured 15-minute markets; hourly bars cannot reproduce that resolution, and the hourly sweep showed the family never even triggers (0 of 96 variants traded).',
    blockedBy: 'WAS: the intraday store was configured for period_interval=60 only (as of 2026-09-17).',
    toClose: 'Add a second intraday block at period=1 for a few markets with a bounded --max-bars trim, exactly as the 60-minute store was added.',
    closedBy:
      'CLOSED 2026-09-18: 1-minute blocks for KXGOLD15M, KXBTC15M / KXETH15M / KXSOL15M (and, from 2026-09-20, KXMLBGAME) feed the micro flight (data/history/intraday/1m/); FadeSpike_Micro is the R14 `fade` recreation on those bars.'
  },
  {
    gap: 'Live trading and real settlements',
    status: 'closed',
    why: 'Without finalised markets every open position is marked to the last real quote rather than to $1 or $0.',
    blockedBy: 'WAS: every tracked market resolved on or after 2026-12-31 (verified status=active, result="" from the live markets endpoint, 2026-09-17).',
    toClose: 'Ingest series whose markets expire in days with status=all so the exchange\'s real result is stored with the bars.',
    closedBy:
      'CLOSED 2026-09-18: status=all ingest blocks store FINALIZED markets with the exchange\'s own result (weather brackets, game lines, 15-minute crypto/gold, FDA, macro), and the replay books real $1.00/$0.00 settlements (src/backtest-replay.js); the Live Desk settles at the exchange result too. The daily settlement job still polls the long-dated index/BTC markets, which remain marked to the last real quote.'
  },
  {
    gap: 'Pre-game model probabilities archived point-in-time (S14 MLB-Prediction-model, S10 SportsPred)',
    status: 'closed (2026-09-21: data/mlb-pregame/ + archive-mlb-pregame.mjs + the strategy and desk hooks ship this session (V118); the SportsPred hub half and the model CLI `predict` command remain open — tracked in the mlb-pregame-signals workflow plan)',
    why: 'The owner\'s MLB prediction model and SportsPred hub produce pre-game win probabilities — the "independent estimate vs market price" architecture that ForecastEdge_Weather uses, but for sports.',
    blockedBy: 'Neither model\'s outputs are archived anywhere with capture timestamps; the model must RUN to produce a number, and running it inside this repository would be a new build, not a capture.',
    toClose: 'A scheduled workflow that runs the model against official schedule data and appends {capturedAt, gamePk, p_home} to a store BEFORE first pitch; the MLB game join (fact V113) and the signal-provider hook already exist.'
  },
  {
    gap: 'Tick/1-minute game-series bars with real ladders (the R19 shock window and any in-play scalp on KX*NFL/MLB/NBA*GAME)',
    status: 'open (capture PLANNED 2026-09-21: minute-mlb-game-lines + minute-nfl-game-lines ingest blocks are in data/history/_ingest-request.json and the 00:30/02:30 UTC daily-history crons capture game-window books; bars appear after the first runs)',
    why: 'Every game-series ladder stored before 2026-09-21 was captured AFTER settlement and the exchange returns an empty book then, so the desk kept 0 tradeable slots in those series. The 2-minute shock detector of R19 additionally needs 1-minute (or finer) closes inside a live game.',
    blockedBy: 'Time: the first game-window capture runs 2026-09-22 00:30 UTC.',
    toClose: 'Confirm a NON-empty orderbook in data/history/KXNFLGAME-*/KXMLBGAME-* after the 00:30 UTC run (irregularity #60 test), then let the minute bars accumulate for the R19 window and any in-play scalp.'
  },
  {
    gap: 'Second forecast model column (Euro vs GFS divergence) + lead-days per archived prediction row (R21 skill-decay + divergence edges)',
    status: 'open',
    why: 'R21\'s two tradeable edges both need inputs the forecast archive does not pin: side-by-side model disagreement, and the lead-time band of each quoted contract. Recreating either on price alone would fabricate direction — refused under the honesty rule (see R21 taken/howTested).',
    blockedBy: 'Archive schema work: a second model series in data/forecasts/ + surfacing the existing horizon computation on each row.',
    toClose: 'Add the Euro (or GFS) column to the forecast capture and a leadDays field on each prediction row, then recreate the R21 divergence and skill-decay rules against both.'
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
    unattributed: RESEARCH_SOURCES.filter((s) => s.capturedVia === RESEARCH_CAPTURE_METHODS.UNATTRIBUTED).length,
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
