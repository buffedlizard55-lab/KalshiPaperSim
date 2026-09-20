/**
 * KalshiPaperSim — Signal-Source Ledger (the MasterSite review)
 * =====================================================================
 * On 2026-09-18 the owner's master directory of verified GitHub Pages sites
 * (https://buffedlizard55-lab.github.io/MasterSite/) was reviewed site by
 * site, at the owner's request, against ONE question:
 *
 *   Could this project supply a VERIFIED, point-in-time signal that a Kalshi
 *   market strategy in this competition could trade on?
 *
 * RULES THIS LEDGER FOLLOWS (same as RESEARCH_SOURCES):
 *   • Every entry links its live site, its repository, and — where it is a
 *     data project — the official source that project itself verifies against.
 *   • "Testable" means testable WITH THE DATA THIS REPOSITORY HOLDS under the
 *     honesty contract: real captured Kalshi bars, real captured results, and
 *     point-in-time external signals. A project can be excellent and still be
 *     not-testable here; that is a statement about THIS repo, not the project.
 *   • Nothing from any of these sites is copied into a result. Where a
 *     strategy exists, its performance is computed by the replay engine.
 *
 * THE REVIEW ITSELF (2026-09-18): the directory publishes 38 of the account's
 * 39 public repositories (1 permanently excluded by owner request per the
 *   directory's own account section). The owner asked specifically about
 *   "CEO, weather, insider trades, TheLeap, NFL Injury, NBA Injury, FDA
 *   Decisions Drug Analysis, NCAA Scoreboard, NFL scoreboard, MLB Scoreboard,
 *   Sports Pred, Gold, PinePilot". Twelve of those thirteen map to real,
 *   verified repositories; "CEO" does not (see S00 — flagged for review).
 *
 * SECOND RE-REVIEW (2026-09-18, session 01a0b59b): the same directory was
 *   re-read through its own data export (MasterSite data/sites.js, audit
 *   stamp 2026-09-17T21:47:46Z, fetched via the GitHub API) and every
 *   Markets & Trading Research and Sports Data & Scoreboards project the
 *   first review had not catalogued was inspected README-first. Seven
 *   additional entries (S13–S19): PriceKalshiHistorical (its three reference
 *   strategies are recreated as roster entries, R14), MLB-Prediction-model-
 *   backtest, MLB-PBP, PFFNFL, ScheduleFreeTime (all candidates — real
 *   projects, each blocked only by the point-in-time archive this repo's
 *   honesty contract requires), NFLPRED (stub), StockPaperSim (rebuilt the
 *   same day; wrong venue for this repo, and the directory's record for it
 *   is stale — IRREGULARITIES.md #42).
 */

export const SIGNAL_SOURCE_STATUS = Object.freeze({
  LIVE_SIGNAL: 'live verified signal — archived and tradeable',
  CANDIDATE: 'candidate — real project, needs an ingest + point-in-time archive before any honest test',
  NOT_A_SIGNAL: 'real project, but not a market signal (mismatch flagged)',
  NOT_FOUND: 'requested name does not exist in the verified directory — flagged for owner review'
});

export const SIGNAL_SOURCES = Object.freeze([
  {
    id: 'S00',
    requested: 'CEO',
    name: '(no repository found)',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      directory: 'https://api.github.com/users/buffedlizard55-lab/repos?per_page=100'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_FOUND,
    whatHappened:
      'The owner asked for a strategy built from the "CEO" project. No repository named CEO (or close to it) exists among the 39 public repositories the official GitHub API lists for buffedlizard55-lab on 2026-09-18, and the MasterSite directory publishes 38 of those 39 — the one it excludes is excluded "by owner request" and is never named. The most likely candidates are a renamed project, the excluded repository, or a misremembered name.',
    verifiableClaim: null,
    kalshiMarketClass: null,
    testableHere: false,
    flagged: 'IRREGULARITIES.md #32 — "CEO" project requested but not found in the verified directory; owner review needed (rename? the excluded repo?). Independent of that missing project, Kalshi lists CEO-change series (TESLACEOCHANGE / JPMCEOCHANGE / KXOPENAICEOCHANGE) which this repo already trades: CEOExit_Drift on daily bars, LiveCEO_ChangeFav on the Live Desk. Those entries do NOT claim a MasterSite CEO signal.',
    strategyUsername: ['CEOExit_Drift', 'LiveCEO_ChangeFav']
  },
  {
    id: 'S01',
    requested: 'weather',
    name: 'SFWeather — 94122 Rainy-Season Outlook',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/SFWeather/',
      repo: 'https://github.com/buffedlizard55-lab/SFWeather'
    },
    status: SIGNAL_SOURCE_STATUS.LIVE_SIGNAL,
    whatItIs:
      'Source-verified rainy-season outlook for San Francisco ZIP 94122 built by an automated nightly pipeline from free OFFICIAL sources (NOAA / National Weather Service, NCEI, Climate Prediction Center), with every day carrying an NWS FORECAST badge or a CLIMATOLOGY badge — no invented daily numbers beyond the forecast horizon.',
    verifiableClaim:
      'The project\'s own discipline (point-in-time NWS gridded forecasts + official climatology, never a backcast) is exactly what an honest weather strategy needs, and it motivated this repository\'s matching pipeline: scripts/archive-forecasts.mjs archives the official NWS point forecast for NYC Central Park (api.weather.gov grid OKX 34,45) several times a day, time-stamped, as the point-in-time signal store.',
    kalshiMarketClass: 'KXHIGHNY — NYC daily high-temperature brackets (the series Kalshi\'s own API quick-start documents: https://docs.kalshi.com/getting_started/quick_start_market_data)',
    testableHere: true,
    howTested:
      'The KXHIGHNY brackets are ingested at 60-minute resolution INCLUDING settled markets with their real exchange results (data/history/intraday/60m/), and the replay books real $1.00/$0.00 settlements (src/backtest-replay.js). Two roster entries trade them: WeatherLadder_CheapBands (the no-forecast control) and ForecastEdge_Weather (trades ONLY when a point-in-time NWS snapshot exists at decision time — a forward test that stays unranked until the archive overlaps live markets).',
    flagged:
      'Basis mismatch, stated on the strategy: KXHIGHNY settles on The Weather Company data for NYC (CLINYC) per the market rules, while the archived signal is the NWS forecast for the same point. Also: SFWeather itself covers San Francisco precipitation; the archived series here is New York temperature, because that is the series this repository could capture from the exchange.',
    strategyUsername: ['WeatherLadder_CheapBands', 'ForecastEdge_Weather']
  },
  {
    id: 'S02',
    requested: 'insider trades',
    name: 'Insider-trades — SEC Form 4 Dashboard',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/Insider-trades/',
      repo: 'https://github.com/buffedlizard55-lab/Insider-trades'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'SEC EDGAR Form 4 insider-transaction dashboard and Python analysis toolkit that backtests insider signal rules against local verified filing data.',
    verifiableClaim: 'Form 4 filings are official (SEC EDGAR, sec.gov) and carry exact filing timestamps, so a point-in-time archive is possible in principle.',
    kalshiMarketClass:
      'Company-event markets (e.g. a CEO-departure or company-KPI market on Kalshi). THIS repository now holds FDA (KXFDA*) and CEO-change (TESLACEOCHANGE / JPMCEOCHANGE / KXOPENAICEOCHANGE) series with captured bars AND Live Desk ladders — those are company-event markets. The remaining gap is the Form 4 archive, not the Kalshi leg.',
    testableHere: true,
    howTested:
      'InsiderFiling_Drift replays on real company-event bars (TESLACEOCHANGE, JPMCEOCHANGE, KXOPENAICEOCHANGE, KXAAPLCEOCHANGE, KXFDAAPPROVE): fades unconfirmed executive departures when insiders hold equity, buying NO on downward drift. LiveInsider_FilingFader trades open corporate event contracts on the Live Desk.',
    blockedBy:
      'The Kalshi company-event half is ingested with verified bars and ladders. The strategy tests the mechanical drift rule; a real-time point-in-time Form 4 streaming feed remains a future automation task.',
    strategyUsername: ['InsiderFiling_Drift', 'LiveInsider_FilingFader']
  },
  {
    id: 'S03',
    requested: 'TheLeap',
    name: 'TradingViewTheLeap — Verified Research & Instrument Intelligence',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/TradingViewTheLeap/',
      repo: 'https://github.com/buffedlizard55-lab/TradingViewTheLeap'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'Reproducible research layer for TradingView\'s The Leap paper-trading competition (AMP Futures): official contest facts, champion outcomes, placement arithmetic and independently simulated strategy verdicts — with its own honesty rule that no tested strategy has produced a positive daily compounding rate.',
    verifiableClaim: 'Its official-contest facts (94/94 symbols, prize ladder) are about FUTURES instruments, not Kalshi markets.',
    kalshiMarketClass:
      'Indirect: The Leap trades CME/AMP futures, and this repo\'s KXNASDAQ100Y / KXINXY / KXBTCY markets settle on the SAME underlying indexes (Nasdaq-100, S&P 500, BTC). A "The Leap-style" directional view COULD be expressed as index-range strike trades here.',
    testableHere: true,
    howTested:
      'TheLeap_BreakoutRank replays The Leap competition style: aggressive convex momentum buying on cheap OTM index strikes (KXNASDAQ100Y, KXINXY, KXBTCY) seeking maximum returns with zero risk management. LiveTheLeap_Momentum trades open index and crypto contracts on the Live Desk.',
    blockedBy:
      'The Leap\'s own contest trades CME futures with margin leverage. The recreation here expresses the strategy archetype on Kalshi\'s binary index strikes with official fees and verified volume limits.',
    strategyUsername: ['TheLeap_BreakoutRank', 'LiveTheLeap_Momentum']
  },
  {
    id: 'S04',
    requested: 'NFL Injury',
    name: 'NFLInjuryReport — 32 Team Tracker',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NFLInjuryReport/',
      repo: 'https://github.com/buffedlizard55-lab/NFLInjuryReport'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'Live injury-alert system for all 32 NFL teams built only from free, public, verifiable sources: every designation shown is the official nfl.com value whenever one is published, with ESPN\'s keyless injuries JSON supplying timestamps, refreshed every 10 minutes by a GitHub Actions workflow.',
    verifiableClaim: 'Official nfl.com designations + ESPN structured JSON, both with timestamps — a genuine point-in-time signal source for NFL markets.',
    kalshiMarketClass: 'Kalshi NFL game-winner / season markets (KXNFLGAME-style series).',
    testableHere: false,
    blockedBy:
      'KXNFLGAME is ingested (hourly bars + discovery quotes) but at the 2026-09-18 Live Desk cut-off it is quoted-only — no captured order-book ladder — so a desk fill cannot be priced (listed as not tradeable, not filled at an invented book). The remaining honest-test gap is the injury feed archived point-in-time, then a design that trades "the market has not priced a key absence" against a captured ladder. R04 already showed the shock-timing archetype fails on real index data; that is evidence against the family, not a reason to skip the NFL test.',
    strategyUsername: ['SportsFavourite_Settle']
  },
  {
    id: 'S05',
    requested: 'NBA Injury',
    name: 'NBAInjuryReport — 30-Team Injury Monitor',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NBAInjuryReport/',
      repo: 'https://github.com/buffedlizard55-lab/NBAInjuryReport'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'NBA-only injury monitoring for all 30 teams from ESPN\'s public structured injuries endpoint with source timestamps, a live-style wire polling every 60 seconds, severity colour-coding and alert bells — explicitly labelled "not official NBA confirmation" where that is the case.',
    verifiableClaim: 'ESPN\'s public injuries JSON with timestamps; the project itself flags that no live official NBA injury report was discoverable.',
    kalshiMarketClass: 'KXNBAGAME — NBA game-winner markets. Six contracts were tradeable on the Live Desk at the 2026-09-18T18:46Z cut-off (captured ladders).',
    testableHere: true,
    howTested:
      'The Kalshi-price half is tested on the Live Desk by LiveNBA_GameFavourite: it buys the captured-ladder favourite (ask 0.90–0.99) on KXNBAGAME and holds to the exchange settlement. SportsFavourite_Settle already covers the same series on the hourly replay. The injury designations themselves are NOT used — that project\'s feed is not archived here point-in-time, so the entry trades only the exchange\'s own prices.',
    blockedBy:
      'The NBA injury JSON is not archived in this repo with capture timestamps. Closing that would let a second entry trade "the market has not priced a key absence" against the same captured KXNBAGAME ladders.',
    strategyUsername: ['LiveNBA_GameFavourite', 'SportsFavourite_Settle']
  },
  {
    id: 'S06',
    requested: 'FDA Decisions Drug Analysis',
    name: 'DrugAnalysis — FDA Decisions & Biotech Reactions',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/DrugAnalysis/',
      repo: 'https://github.com/buffedlizard55-lab/DrugAnalysis'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'Biopharma decision engine on 980 FDA novel-drug approvals (2000-2026), 58 deep-verified CRLs, a 34-company pipeline tracker, 32 upcoming PDUFA dates with countdown, 8 upcoming Phase 3 endpoints and 2,000 ClinicalTrials.gov Phase 3 studies.',
    verifiableClaim:
      'PDUFA dates are official FDA commitments (fda.gov), so "an approval decision is DUE in window W" is verifiable in advance — the rare event-market signal that is genuinely knowable point-in-time BEFORE the event.',
    kalshiMarketClass: 'KXFDA* family (KXFDAAPPROVAL, KXFDAPDUFA, related decision series) — ingested with captured bars AND Live Desk ladders.',
    testableHere: true,
    howTested:
      'The Kalshi-price half is tested two ways: FDALadder_Dominance on the daily replay (cumulative-ladder no-arbitrage) and LiveFDA_DecisionPremium on the Live Desk (favourite-bucket buy on open KXFDA* contracts, priced from captured ladders, official fees). Neither uses the DrugAnalysis PDUFA calendar — that calendar is not archived here point-in-time.',
    blockedBy:
      'The DrugAnalysis PDUFA / CRL dates are not archived in this repo with capture timestamps. Closing that would let a second entry trade "cheap relative to the base rate for its PDUFA window" against the same captured KXFDA* ladders. Until then the desk/replay entries measure only the exchange\'s own prices.',
    strategyUsername: ['LiveFDA_DecisionPremium', 'FDALadder_Dominance']
  },
  {
    id: 'S07',
    requested: 'NCAA Scoreboard',
    name: 'Ncaa-football-alerts — NCAA Football Scoreboard & Live Alerts',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/Ncaa-football-alerts/',
      repo: 'https://github.com/buffedlizard55-lab/Ncaa-football-alerts'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'Zero-dependency college-football scoreboard and alert booth tracking live games across ACC, SEC, Big Ten, Big 12 and AAC.',
    verifiableClaim: 'Live scores (the in-play state an R04/R07-style strategy would react to).',
    kalshiMarketClass: 'KXNCAAFGAME — NCAA football game-winner markets. Eight contracts were tradeable on the Live Desk at the 2026-09-18T18:46Z cut-off (captured ladders).',
    testableHere: true,
    howTested:
      'The Kalshi-price half is tested on the Live Desk by LiveNCAA_GameFavourite and on hourly replayed bars by NCAAF_GameFavourite and SportsFavourite_Settle: they buy the favourite on KXNCAAFGAME and hold to exchange settlement. The live-score feed from Ncaa-football-alerts is NOT used — it is not archived here point-in-time.',
    blockedBy:
      'The NCAA live-score / alert feed is not archived in this repo with capture timestamps. Closing that would let an in-play entry trade "the market has not priced a score change" against the same captured KXNCAAFGAME ladders. R04 is evidence against shock-timing on index data; it is not a reason to skip the NCAA-price test that is possible today.',
    strategyUsername: ['LiveNCAA_GameFavourite', 'SportsFavourite_Settle', 'NCAAF_GameFavourite']
  },
  {
    id: 'S08',
    requested: 'NFL scoreboard',
    name: 'NFL-scoreboard — Scoreboard & Nullified Play Feed',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NFL-scoreboard/',
      repo: 'https://github.com/buffedlizard55-lab/NFL-scoreboard'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'Single-page NFL scoreboard with dedicated live nullified-scoring-play detection and penalty review feed.',
    verifiableClaim: 'Live game state incl. score changes and overturned plays.',
    kalshiMarketClass: 'Kalshi NFL game markets.',
    testableHere: false,
    blockedBy:
      'KXNFLGAME is ingested (hourly bars + discovery quotes) but at the Live Desk cut-off it is quoted-only — no captured order-book ladder — so a desk fill cannot be priced. The remaining gap is (1) a captured ladder for those contracts and (2) the scoreboard / nullified-play feed archived point-in-time. SportsFavourite_Settle already covers the series on the hourly replay using the market\'s own bars.',
    strategyUsername: ['SportsFavourite_Settle']
  },
  {
    id: 'S09',
    requested: 'MLB Scoreboard',
    name: 'MLB-Live-PBP — Scoreboard & Play-by-Play',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MLB-Live-PBP/',
      repo: 'https://github.com/buffedlizard55-lab/MLB-Live-PBP'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'Live baseball scoreboard and real-time play-by-play visualizer powered by OFFICIAL MLB Gameday feed data with game-state tracking.',
    verifiableClaim: 'Official MLB Gameday feed — arguably the most official live sports source among these projects.',
    kalshiMarketClass: 'Kalshi MLB game markets.',
    testableHere: false,
    blockedBy: 'No MLB series in the universe. If one is ever added, the in-play machinery now exists at 1-minute resolution (the micro flight) — the blocker is purely the market-data ingest.',
    strategyUsername: null
  },
  {
    id: 'S10',
    requested: 'Sports Pred',
    name: 'SportsPred — 22-Sport Scoreboard & Prediction Hub',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/SportsPred/',
      repo: 'https://github.com/buffedlizard55-lab/SportsPred'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'Multi-sport prediction engine and scoreboard covering 22 international sports with 95 verified league registries.',
    verifiableClaim: 'League registries and scoreboard data; the project\'s own predictions are a MODEL, which here would be a hypothesis to test, not a fact.',
    kalshiMarketClass: 'Kalshi sports markets generally.',
    testableHere: false,
    blockedBy: 'No sports series ingested; and a prediction hub\'s edge claim would need its predictions archived point-in-time before any honest measurement (the same rule the NWS archive follows).',
    strategyUsername: null
  },
  {
    id: 'S11',
    requested: 'Gold',
    name: 'GOLD — Solid Gold Ring Buyer\'s Directory',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/GOLD/',
      repo: 'https://github.com/buffedlizard55-lab/GOLD'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs: 'Evidence-based buyer\'s reference directory of 482 verified solid gold RING listings across ~44 online jewelers, ranked by price per pure-gold gram.',
    verifiableClaim: 'Retail jewelry prices per gram — a consumer reference, not a financial gold price.',
    kalshiMarketClass:
      'Kalshi\'s gold markets are a DIFFERENT thing and are now tracked directly: the KXGOLD15M 15-minute series ("Gold price up in next 15 mins?", target-price settlement) was ingested at 1-minute resolution with 8 settled contracts in the first run (roadmap item #4).',
    testableHere: true,
    howTested:
      'GoldBracket_EarlyLeader trades the KXGOLD15M micro flight on the market\'s own 1-minute bars and settles at the exchange\'s real results. It deliberately uses NO external gold feed; adding an official one (e.g. an LBMA/CME point-in-time price archive) is a listed roadmap item.',
    flagged:
      'Requested as a "trading strategy" source, but the GOLD project is a ring-buying directory: its prices are retail jewelry quotes, not a gold-market signal. Flagged so nobody wires 482 ring listings into a gold strategy. The Kalshi gold MARKETS are real and tracked; the project is not their data source.',
    strategyUsername: ['GoldBracket_EarlyLeader']
  },
  {
    id: 'S12',
    requested: 'PinePilot',
    name: 'Tradingview-pinescript-editor — Pine Script Strategy Lab',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/Tradingview-pinescript-editor/',
      repo: 'https://github.com/buffedlizard55-lab/Tradingview-pinescript-editor'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs: 'Copy-paste Pine Script v6 trading-strategy laboratory (18 customizable modes) with a beginner tutorial and an interactive simulation backtest calculator.',
    verifiableClaim: 'None as data — PinePilot is a STRATEGY AUTHORING tool, not a data source. Its value here is the design vocabulary: EMA crosses, RSI bands, breakouts — the standard TA archetype set.',
    kalshiMarketClass:
      'Any series this repo holds: TA rules act on the contract\'s OWN price series, so they transfer directly (e.g. the daily KXNASDAQ100Y/KXINXY/KXBTCY strikes).',
    testableHere: true,
    howTested:
      'The archetype is already represented: the roster\'s trend/momentum/mean-reversion entries (TrendRide_FullTilt, AlphaApex_Momentum, MeanRev_CheapBand, TightScalp_Fixed5, PanicFade family) ARE the Pine-style TA families, replayed with real fills, real fees and real volume bounds — which the Pine simulator does not charge. A dedicated EMA-cross sweep is the natural next family if the daily window keeps growing.',
    strategyUsername: ['TrendRide_FullTilt', 'AlphaApex_Momentum', 'MeanRev_CheapBand']
  },

  /* ════════════════════════════════════════════════════════════════════ *
   * SECOND RE-REVIEW (2026-09-18, session 01a0b59b). The owner asked again
   * to "see if you can build a strategy using any of these websites". The
   * directory's own data export (MasterSite data/sites.js, audit stamp
   * 2026-09-17T21:47:46Z, 38 sites) was re-read through the GitHub API and
   * every Markets & Trading Research and Sports Data & Scoreboards project
   * that the first review had not yet catalogued was inspected: its README
   * loaded in full, its claims quoted, its testability decided against the
   * store this repository actually holds. Seven new entries: S13–S19.
   * ════════════════════════════════════════════════════════════════════ */

  {
    id: 'S13',
    requested: 'PriceKalshiHistorical (found by re-review)',
    name: 'PriceKalshiHistorical — Autonomous Kalshi collector + backtester',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/PriceKalshiHistorical/',
      repo: 'https://github.com/buffedlizard55-lab/PriceKalshiHistorical'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'The owner\'s own Kalshi price-history collector and book-walking backtester (README read in full via the GitHub API on 2026-09-18): a Python collector that polls live markets/orderbooks/trades/candles into SQLite + Parquet (5s snapshots, 15s books) and a backtest engine that fills against captured books, applies the 0.07×p×(1−p) quadratic fee, and settles $1/$0 — the same fill realism this repository enforces.',
    verifiableClaim:
      'The README documents three reference strategies (`mee`, `fade`, `mom`) with exact triggers, and states two facts this repository independently corroborates: the official API "has no retroactive orderbook — you must capture it live" (this repo captures ladders with every ingest), and the fee model 0.07×p×(1−p) (this repo\'s captured fee schedule, VERIFICATION V-table).',
    kalshiMarketClass: 'Any board of mutually-exclusive brackets (KXHIGHNY, KXBTCY) for `mee`; 15-minute crypto/gold markets for `fade`/`mom`',
    testableHere: true,
    howTested:
      'The three reference STRATEGY DESIGNS are recreated as roster entries (RESEARCH_SOURCES R14): MEE_BoardSum (hourly, real bracket boards), FadeSpike_Micro (1-minute bars, the source\'s exact 5-minute/5¢/3¢ trigger), MomTick_Micro (1-minute bars, labelled an adaptation — the source\'s 20-second window is shorter than this store\'s finest bar).',
    blockedBy:
      'The project\'s own 5-second snapshot/orderbook DATABASE is not exported (its data/ is git-ignored per its README), so its captures cannot cross-verify this repository\'s books; only its strategy rules and its fee/liquidity doctrine were taken, and both are re-measured here on official candlesticks.',
    strategyUsername: ['MEE_BoardSum', 'FadeSpike_Micro', 'MomTick_Micro']
  },

  {
    id: 'S14',
    requested: 'MLB Prediction Model (found by re-review)',
    name: 'MLB-Prediction-model-backtest — Monte Carlo baseball prediction model',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MLB-Prediction-model-backtest/',
      repo: 'https://github.com/buffedlizard55-lab/MLB-Prediction-model-backtest'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A Python ML research repo (README read in full via the GitHub API on 2026-09-18) that builds pre-game MLB win probabilities from correlation-filtered features plus a Negative-Binomial Monte Carlo game simulator, blended in a calibrated logistic model and validated by strict walk-forward backtesting. Its own zero-hallucination rule: "every number in this project traces back to an official MLB response. Missing data stays missing; nothing is invented, including odds… breakeven prices are reported instead."',
    verifiableClaim:
      'The model\'s outputs (sim_p_home, expected total, run-line probabilities) are exactly the kind of external point-in-time probability a KXMLBGAME strategy needs — an independent estimate to trade against the exchange\'s price, the same architecture as ForecastEdge_Weather (NWS forecast vs KXHIGHNY price).',
    kalshiMarketClass: 'KXMLBGAME (game moneyline), KXMLBTOTAL / KXMLBTEAMTOTAL (totals), KXMLBSPREAD (run line) — MLB series this store already ingests at 60-minute resolution with settled results',
    testableHere: false,
    blockedBy:
      'The model must RUN to produce a prediction, and its predictions are not archived anywhere with timestamps. An honest test needs the model\'s pre-game probability captured BEFORE each game\'s market close — the same point-in-time discipline data/forecasts/ enforces for NWS. The natural path: a scheduled workflow that runs the model on official MLB schedule data and appends {capturedAt, game, sim_p_home} to a store, then a strategy that trades only where a snapshot exists. Until then, nothing from this project enters a result.',
    strategyUsername: null
  },

  {
    id: 'S15',
    requested: 'MLB Play-by-Play (found by re-review)',
    name: 'MLB-PBP — Official Play-by-Play Archive (2014 → present)',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MLB-PBP/',
      repo: 'https://github.com/buffedlizard55-lab/MLB-PBP'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A searchable viewer and reproducible archive for MLB regular-season and postseason games from 2014 forward (README read in full via the GitHub API on 2026-09-18). One source only: official statsapi.mlb.com HTTPS responses; every saved record keeps "MLB Advanced Media\'s returned notice, exact source URL, UTC retrieval time, and a SHA-256 digest" — a provenance chain of the same strictness this repository applies to Kalshi data.',
    verifiableClaim:
      'In-game state (score, inning, base state) as games progress is the input every in-play sports strategy needs; the archive proves the owner can capture that state from an official source with full custody.',
    kalshiMarketClass: 'KXMLBGAME / KXMLBF5 (in-play repricing while a game is live)',
    testableHere: false,
    blockedBy:
      'Two gaps: (1) the archive is retrospective (it can prove what happened, not what was knowable at a market\'s decision time — an honest in-play test needs state captured AS the game runs, timestamped, like the NWS archive); (2) this repository\'s sports bars are 60-minute candlesticks, far too coarse to resolve an in-play repricing that takes seconds. The ROADMAP\'s "sports series at period_interval=1" item is the second half of what this would need.',
    strategyUsername: null
  },

  {
    id: 'S16',
    requested: 'PFFNFL (found by re-review)',
    name: 'PFFNFL — Pro Football Focus reverse engineering',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/PFFNFL/',
      repo: 'https://github.com/buffedlizard55-lab/PFFNFL'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A research repository (README read in full via the GitHub API on 2026-09-18) whose "sole purpose" is "reverse engineer Pro Football Focus (PFF.com) as a reliable source of public NFL data": player identity, position, PFF grades, snap counts and bio extracted from PUBLIC roster pages only ("This project is 100% focused on PFF.com only").',
    verifiableClaim:
      'PFF player grades and snap counts are a candidate signal for NFL player-prop markets — e.g. first-touchdown / anytime-touchdown markets (this store\'s discovery captured KXNFLANYTD and KXNFLFIRSTTD series with their rules and fee configs, data/discovered/markets/).',
    kalshiMarketClass: 'KXNFLANYTD / KXNFLFIRSTTD (player-prop series, verified to exist in data/discovered/) — NOT yet ingested as bars',
    testableHere: false,
    blockedBy:
      'No PFF data is captured into any archive (the repo documents the extraction method only), and no player-prop series has bars in the store. An honest test would need: the prop series ingested with status=all, plus a point-in-time PFF extraction per game week. Both are machinery this repository already has (ingest blocks + the forecast-archive pattern).',
    strategyUsername: null
  },

  {
    id: 'S17',
    requested: 'ScheduleFreeTime (found by re-review)',
    name: 'ScheduleFreeTime — Sports Conflict Calendar',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/ScheduleFreeTime/',
      repo: 'https://github.com/buffedlizard55-lab/ScheduleFreeTime'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A scoreboard-style calendar (README read in full via the GitHub API on 2026-09-18) covering Aug 1, 2026 – Feb 28, 2027 that marks a moment busy when any MLB game (all 30 clubs), NFL game (all 32 clubs, through Super Bowl LXI) and several Bay Area teams are on air — built from league schedules with its own radio-broadcast research (65/65 dated NFL broadcasts matched against the league table per the MasterSite audit).',
    verifiableClaim:
      'Game TIMES are real, verifiable schedule facts — the kind of timing signal that decides WHEN a sports market is in-play (the highest-variance window of KXNFLGAME/KXMLBGAME contracts, which this store already ingests hourly with settled results).',
    kalshiMarketClass: 'KXNFLGAME / KXMLBGAME / KXNBAGAME — timing (in-play windows) rather than direction',
    testableHere: false,
    blockedBy:
      'The calendar is a web app, not an archived feed: no point-in-time machine-readable schedule export with capture timestamps is published. If one were archived, the honest test is a timing rule (e.g. trade only the in-play window) replayed on the sports bars — the bars exist, the archived schedule does not.',
    strategyUsername: null
  },

  {
    id: 'S18',
    requested: 'NFLPRED (found by re-review)',
    name: 'NFLPRED — placeholder repository',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NFLPRED/',
      repo: 'https://github.com/buffedlizard55-lab/NFLPRED'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs:
      'A placeholder: the repository\'s entire file list is a single README.md (verified via the GitHub contents API on 2026-09-18), and the MasterSite audit records it as a single-commit stub ("Single-commit placeholder repository for NFL prediction models").',
    verifiableClaim: null,
    kalshiMarketClass: 'KXNFLGAME / KXNFLSPREAD — nothing to test yet',
    testableHere: false,
    flagged:
      'Not an irregularity — a stub that is honestly labelled as one by its own directory entry. Recorded so the requested-names list is complete: an NFL prediction project exists but has published nothing testable.',
    strategyUsername: null
  },

  {
    id: 'S19',
    requested: 'StockPaperSim (found by re-review)',
    name: 'StockPaperSim — stock paper-trading competition (rebuilt 2026-09-18)',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/StockPaperSim/',
      repo: 'https://github.com/buffedlizard55-lab/StockPaperSim'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs:
      'A one-year paper-trading STOCK competition between return-seeking strategy personas with a real venue model (README read in full via the GitHub API on 2026-09-18): Season 1 replayed the real S&P 500 + VIX path; Season 2 runs on collected daily bars that are Yahoo Finance data marked SECONDARY — "not eligible as an official-price competition" — with the official Nasdaq adapter and fail-closed audit implemented for the next run.',
    verifiableClaim:
      'Its discipline is the same one this repository enforces (official verified pricing or a clearly-labelled secondary source, never an invented price), and its README\'s own honesty about the Yahoo bars matches the standard this project applies to data provenance.',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy:
      'Wrong venue and wrong instruments: StockPaperSim trades equities on a stock venue model; this repository is deliberately Kalshi-only (ROADMAP "second venue" item). Nothing from it can enter a Kalshi result, and nothing from here should enter its stock results.',
    flagged:
      'IRREGULARITIES.md #42 — the MasterSite directory\'s audit record for this project (generated 2026-09-17T21:47:46Z: "single initial commit… 15-byte README") is STALE: the repository was rebuilt on 2026-09-18 (30 commits, PR #9 merged 17:45:57Z) into a full competition. The directory needs a re-run of its audit before its StockPaperSim entry can be trusted.',
    strategyUsername: null
  }
]);

/** Headline counts for the UI, derived from the ledger (never typed by hand). */
export function signalSourceStats() {
  const byStatus = (s) => SIGNAL_SOURCES.filter((x) => x.status === s).length;
  return {
    requested: SIGNAL_SOURCES.length,
    liveSignal: byStatus(SIGNAL_SOURCE_STATUS.LIVE_SIGNAL),
    candidate: byStatus(SIGNAL_SOURCE_STATUS.CANDIDATE),
    notASignal: byStatus(SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL),
    notFound: byStatus(SIGNAL_SOURCE_STATUS.NOT_FOUND),
    testableHere: SIGNAL_SOURCES.filter((x) => x.testableHere).length,
    withStrategies: SIGNAL_SOURCES.filter((x) => (x.strategyUsername || []).length > 0).length
  };
}

/** Every strategy username referenced by the ledger must exist in the roster. */
export function signalSourceStrategyUsernames() {
  return [...new Set(SIGNAL_SOURCES.flatMap((s) => s.strategyUsername || []))];
}
