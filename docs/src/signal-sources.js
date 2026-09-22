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
 *
 * THIRD PASS (2026-09-20, session 01a0bca9): the MLB half of the sports gap
 *   closed. The OFFICIAL source the owner's MLB-Live-PBP / MLB-PBP projects
 *   verify against (statsapi.mlb.com, MLB Advanced Media) is now archived
 *   here point-in-time every 20 minutes (scripts/archive-mlb-signals.mjs,
 *   data/mlb-signals/) and joined to KXMLBGAME contracts by first-pitch
 *   instant + team codes (fact V113); two roster entries trade it
 *   (MLBLead_InPlay, MLBTrail_Comeback, R16). S09 → LIVE_SIGNAL, S15 →
 *   testable; S10 / S14 / S17 re-worded to the store as it is today (their
 *   2026-09-18 "no sports series ingested" wording had gone stale the same
 *   day the hourly sports blocks landed — IRREGULARITIES.md #52).
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
    status: SIGNAL_SOURCE_STATUS.LIVE_SIGNAL,
    whatItIs: 'SEC EDGAR Form 4 insider-transaction dashboard and Python analysis toolkit that backtests insider signal rules against local verified filing data.',
    verifiableClaim: 'Form 4 filings are official (SEC EDGAR, sec.gov) and carry EDGAR\'s exact acceptance instant, so a point-in-time archive is not only possible but can answer a PAST bar — a filing does not decay.',
    kalshiMarketClass:
      'Company-event markets (e.g. a CEO-departure or company-KPI market on Kalshi). THIS repository now holds FDA (KXFDA*) and CEO-change (TESLACEOCHANGE / JPMCEOCHANGE / KXOPENAICEOCHANGE) series with captured bars AND Live Desk ladders — those are company-event markets. The remaining gap is the Form 4 archive, not the Kalshi leg.',
    testableHere: false,
    howTested:
      'CLOSED 2026-09-21 (ROADMAP Next #3(b)). This repository now archives SEC Form 4 filings point-in-time from EDGAR itself: scripts/archive-form4-signals.mjs reads the browse-edgar Atom list for each tracked issuer, opens each new filing\'s own index.json, and parses the ownership XML with the SEC\'s documented element names into data/form4-signals/companies/<SYMBOL>.json (one record per accession number, with EDGAR\'s acceptedAt AND this archive\'s first_seen_at kept apart). src/form4-signal-store.js answers "what did EDGAR hold at T", and two entries read it: InsiderFlow_Form4 (daily replay, ctx.signal) and LiveInsider_Form4Flow (Live Desk, view.signals.form4) — the first desk entrant that reads an external archive at all. The workflow .github/workflows/form4-signals.yml captures twice a day; the parser is tested against a REAL filing archived verbatim (Tesla accession 0001104659-26-106432, tests 127–130). The two older entries keep their price-only cards and now serve as the CONTROL the gated fade is compared against.',
    blockedBy:
      'The archive is dark until the form4-signals workflow runs (sec.gov is not reachable from the build sandbox — irregularity #4), so both entries currently abstain everywhere and report why. Two stated limits travel with every number: (1) EDGAR\'s feed page size (40 entries per issuer per run) bounds how far back one capture reaches — months for Tesla, weeks for a filer with many insiders; (2) KXOPENAICEOCHANGE can NEVER receive this signal, because OpenAI is a private company with no Section 16 filers (irregularity #57). The causal link between a Section 16 filing and a CEO change is also weak and unproven, and both cards say so: the entries measure whether GATING the longshot fade on real filing evidence changes its outcome.',
    strategyUsername: ['InsiderFlow_Form4', 'LiveInsider_Form4Flow', 'InsiderFiling_Drift', 'LiveInsider_FilingFader']
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
    testableHere: false,
    howTested:
      'NOT tested as a Leap signal — there is none to test. Two entries carry its name: TheLeap_BreakoutRank (daily replay: cheap OTM index/crypto strike after three rising yes_ask closes) and LiveTheLeap_Momentum (Live Desk: cheap OTM strike sweep). Both are original price-only designs of this repository that read nothing from The Leap project; the merged 2026-09-19 wording that attributed "champion" behaviour to them was unverified and was corrected (irregularity #53).',
    blockedBy:
      'Unchanged since 2026-09-18: The Leap\'s own strategies run on intraday futures data with leverage this venue does not offer, and its repo publishes verdicts, not a tradeable point-in-time signal feed. Any recreation here is a NEW design wearing its name — which is exactly what the two named entries are, and what their cards now say.',
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
    status: SIGNAL_SOURCE_STATUS.LIVE_SIGNAL,
    whatItIs: 'Live baseball scoreboard and real-time play-by-play visualizer powered by OFFICIAL MLB Gameday feed data with game-state tracking.',
    verifiableClaim: 'Official MLB Gameday feed — arguably the most official live sports source among these projects.',
    kalshiMarketClass: 'KXMLBGAME — game-winner contracts ("<Team> wins"), ingested hourly with settled results since 2026-09-18 and at 1-minute resolution from 2026-09-20 (ingest block minute-mlb-game-lines).',
    testableHere: true,
    howTested:
      'The same OFFICIAL source this project reads (statsapi.mlb.com — MLB Advanced Media\'s Stats API) is archived here point-in-time every 20 minutes through the playing day by scripts/archive-mlb-signals.mjs (data/mlb-signals/: status, inning, inning state, runs — one row per change, with the instant first seen). Each KXMLBGAME contract is joined to its official game by first-pitch instant + away code + home code (fact V113). MLBLead_InPlay buys the leader from the 6th inning when the market asks less than Tangotiger\'s equal-teams win probability (R16); MLBTrail_Comeback is its trailing-side control. Both are forward tests by construction: no state row exists before the first workflow run on 2026-09-20.',
    flagged:
      'The project\'s own scoreboard is NOT read — its data is the official feed, and the archive reads that feed directly so the provenance chain is one hop. Basis: the market settles on the official result; the archive holds the official live linescore sampled every ~20 minutes, so the state a decision reads can lag the field by up to that much (stated on both strategy cards).',
    strategyUsername: ['MLBLead_InPlay', 'MLBTrail_Comeback']
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
    kalshiMarketClass: 'Kalshi sports markets generally — seven game-line series (KXNFLGAME, KXMLBGAME, KXNBAGAME, KXNHLGAME, KXNCAAFGAME, KXWNBAGAME, KXUFCFIGHT) are ingested hourly with settled results since 2026-09-18.',
    testableHere: false,
    blockedBy: 'The market-data half exists (the seven hourly sports series, and KXMLBGAME at 1-minute resolution). What is still missing is the hub\'s own PREDICTIONS archived point-in-time with capture timestamps before each game — the same rule the NWS and MLB archives follow. Without that archive a "SportsPred edge" cannot be measured honestly; RESEARCH_GAPS lists the concrete workflow that would close it.',
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
      'The model must RUN to produce a prediction, and its predictions are not archived anywhere with timestamps. An honest test needs the model\'s pre-game probability captured BEFORE each game\'s market close — the same point-in-time discipline data/forecasts/ enforces for NWS. Since 2026-09-20 two of the three pieces exist here: the official schedule (gamePk, first pitch, probable pitchers) is archived every 20 minutes in data/mlb-signals/, and the KXMLBGAME ticker → official game join is verified (V113) and wired into the replay\'s signal provider. The remaining piece is a scheduled workflow that runs the model and appends {capturedAt, gamePk, sim_p_home} to a store before first pitch; a strategy would then trade only where such a snapshot exists. Until then, nothing from this project enters a result.',
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
    testableHere: true,
    howTested:
      'Both gaps named on 2026-09-18 are closed as of 2026-09-20: (1) the official statsapi.mlb.com state is now captured AS games run, every 20 minutes, with the instant each state was first seen (data/mlb-signals/ — the same provenance discipline as this project, one hop from the same source); (2) KXMLBGAME is ingested at period_interval=1 (block minute-mlb-game-lines). MLBLead_InPlay / MLBTrail_Comeback replay the 1-minute bars against the archived state (R16).',
    blockedBy:
      'The PROJECT\'s retrospective archive (2014 →) is still not used, and cannot be: it proves what happened, not what was knowable at a bar. It remains valuable as an independent cross-check of the live archive\'s Final rows (same gamePk, same source) — a reconciliation job that has not been written yet.',
    strategyUsername: ['MLBLead_InPlay', 'MLBTrail_Comeback']
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
      'The calendar is a web app, not an archived feed: no point-in-time machine-readable schedule export with capture timestamps is published. For MLB the gap closed from the other side on 2026-09-20 — the official schedule (gameDate per gamePk) is archived with every mlb-signals capture, and the KXMLBGAME ticker itself encodes first pitch (V113) — so an in-play-window timing rule is testable on MLB bars today; for NFL / NBA the archived schedule still does not exist here.',
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
  },

  /* ══════════════════════════════════════════════════════════════════════════
   * FOURTH PASS — 2026-09-22 (session 01a0cb4e). The directory now publishes
   * 52 of the account's 53 public repositories (1 permanently excluded by owner
   * request, the directory's own account section) and the account has grown a
   * family of SIBLING paper-trading competition projects since the first
   * review. Every one of the 52 sites is now catalogued here: the ones that can
   * carry a market signal, the ones that are competition-format research, and —
   * for completeness, in one grouped entry — the ones that are not market
   * signals at all.
   *
   * Evidence for every claim below: the repository README read through the
   * official GitHub contents API on 2026-09-22 (Accept: application/vnd.github.raw)
   * plus GET /repos/buffedlizard55-lab/<repo>, both fetched in this session. The
   * directory's own data export (MasterSite data/sites.js, generated
   * 2026-09-21T23:07:59Z) supplied the site list and the audit counts.
   * ══════════════════════════════════════════════════════════════════════════ */

  {
    id: 'S20',
    requested: 'Commodities — Kalshi Research Exchange (found by fourth pass)',
    name: 'Commodities — the owner\'s own Kalshi paper-trading lab',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/Commodities/',
      repo: 'https://github.com/buffedlizard55-lab/Commodities',
      strategySource: 'https://github.com/buffedlizard55-lab/Commodities/blob/main/scripts/forward_strategies.py'
    },
    status: SIGNAL_SOURCE_STATUS.LIVE_SIGNAL,
    whatItIs:
      'A second, owner-run Kalshi paper-trading lab: 24 return-seeking forward-test personas (+4 gated) trading open contracts twice an hour from a scheduled read-only collector, an archive backtest over the collector\'s own official candle archive with a walk-forward split, an execution-realism check that re-reads every simulated fill against Kalshi\'s published trade tape (GET /markets/trades), a tape-validated maker quote model, a per-strategy page, and a browser simulator ("place simulated trades on open event contracts"). README read in full 2026-09-22.',
    verifiableClaim:
      'Its HeatConfirm persona re-creates a rule from a THIRD-PARTY social post with the literals HEAT_CONFIRM_FORECAST_F = 77.0, HEAT_CONFIRM_MAX_ASK = 0.42, HEAT_CONFIRM_MAX_SPREAD = 0.08 and the exit "if the forecast cooled, it got out", and labels it forward-recreation rather than evidence. This repository adopted exactly those literals: HeatConfirm_500Bots (roster, hourly KXHIGHNY replay) and LiveHeatConfirm_Weather (Live Desk, open KXHIGH* brackets with captured ladders).',
    kalshiMarketClass: 'KXHIGHNY / KXHIGH* weather brackets — and the whole open board in that lab',
    testableHere: true,
    howTested:
      'The rule is tested here, not copied: the forecast is this repository\'s NWS archive (data/forecasts/), the prices and spreads are the captured ladders (60-minute store and the desk module), and the outcome is the exchange\'s own settlement. Two independent implementations of the same rule in two repositories is the strongest check either can get.',
    flagged:
      'Cross-lab caveat, stated rather than hidden: that lab trades a WIDER universe (its collector discovers its own markets) and files its own fees/queue assumptions; where the two labs disagree on a market, the disagreement is data coverage (which markets each captured), not a difference in the rule.',
    strategyUsername: ['HeatConfirm_500Bots', 'LiveHeatConfirm_Weather']
  },

  {
    id: 'S21',
    requested: 'KalshiPaperSim (this repository, as the directory records it)',
    name: 'KalshiPaperSim — this competition platform, audited from the outside',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/KalshiPaperSim/',
      repo: 'https://github.com/buffedlizard55-lab/KalshiPaperSim'
    },
    status: SIGNAL_SOURCE_STATUS.LIVE_SIGNAL,
    whatItIs:
      'The directory lists this repository in Markets & Trading Research with its Pages site built. Recorded here as an outside-in check: the directory\'s own export (generated 2026-09-21T23:07:59Z) describes the repository independently of anything written in it, and the two descriptions have to agree.',
    verifiableClaim:
      'GET https://api.github.com/repos/buffedlizard55-lab/KalshiPaperSim on 2026-09-22: default branch main, Pages built, size 57,900 KB, last push 2026-09-22T22:55:48Z — i.e. the repository the directory points at is the one this session is working in, still moving.',
    kalshiMarketClass: 'Kalshi event contracts (this platform)',
    testableHere: true,
    howTested:
      'Self-referential by construction, so nothing here is treated as evidence about this repository: the claims in this ledger are the external ones (the directory, the GitHub API).',
    flagged:
      'A directory entry about this repository cannot verify this repository. Recorded to close the coverage list, and to keep the direction of checking one-way: external sources judge this repo, never the reverse.',
    strategyUsername: null
  },

  {
    id: 'S22',
    requested: 'MLBComp (found by fourth pass)',
    name: 'MLBComp — autonomous MLB research and paper competition',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MLBComp/',
      repo: 'https://github.com/buffedlizard55-lab/MLBComp'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'The MLB sibling of this platform: a versioned 68-entry research catalog (baselines, starters, bullpens, lineups/injuries, Statcast, pitch mix, park/weather, umpires, rest/travel, market movement, totals, first-five, run line, props, live, futures, exchange and prediction-market hypotheses), separate regular-season and postseason environments (REG, POST, WC, DS, LCS, WS, ALL) with per-environment model versions, and point-in-time feature/series-state contracts. README read 2026-09-22.',
    verifiableClaim:
      'Its separation of environments is the discipline this repository applies to its own forward test: a postseason result is never blended into a regular-season number, and "ALL" is a view, not a score — the same reason this repo publishes backtest, strict forward and held-out windows side by side instead of one headline.',
    kalshiMarketClass: 'KXMLBGAME / KXMLB* series (baseball)',
    testableHere: false,
    blockedBy:
      'Its catalog is a research index, not a captured price store: nothing in it can price a Kalshi contract on its own. This repository already captures what it needs for baseball (data/mlb-signals/ + KXMLBGAME ladders); the catalog is useful as a LIST OF HYPOTHESES to check against that store, and is recorded as such.',
    flagged:
      'Candidate, not signal. Where a hypothesis in its catalog matches a Kalshi series this repo captures, the honest next step is a new roster entry that states the hypothesis and lets the replay measure it — not an import of any number.',
    strategyUsername: null
  },

  {
    id: 'S23',
    requested: 'NBAComp (found by fourth pass)',
    name: 'NBAComp — autonomous NBA strategy research & paper-trading competition',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NBAComp/',
      repo: 'https://github.com/buffedlizard55-lab/NBAComp'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'An autonomous NBA laboratory on a 6-hourly scheduled loop (collect → verify → model → backtest → forward test → paper trade → measure → analyse → repeat) that collects ESPN schedule/scores/odds and injury board, Kalshi markets/order books/candlesticks/results, and NBA.com advanced stats, logging every fetch with its HTTP status and recording failures rather than papering over them. README read 2026-09-22.',
    verifiableClaim:
      'Its fetch-log discipline ("every fetch is logged with HTTP status; failures are recorded, never papered over") is the same rule this repository enforces in IRREGULARITIES.md: a failed capture becomes a published fact, never a silent gap — which is why this repo\'s own API failures are numbered irregularities instead of being hidden.',
    kalshiMarketClass: 'KXNBAGAME / KXNBA series (basketball)',
    testableHere: false,
    blockedBy:
      'Same as S22: an autonomous competitor is not a price archive. This repository\'s KXNBAGAME ladders (6 open contracts in the desk module at this build) and its ESPN archive are what can be traded here.',
    flagged: null,
    strategyUsername: null
  },

  {
    id: 'S24',
    requested: 'NFLComp (found by fourth pass)',
    name: 'NFLComp — NFL strategy research, walk-forward testing and paper competition',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NFLComp/',
      repo: 'https://github.com/buffedlizard55-lab/NFLComp'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A paper-trading NFL research prototype whose README reports, as of 2026-09-21: 33/33 audit checks passed, 70 strategy personas, 7,548 tracked NFL games, and a ledger of 31,502 published / 97,218 all-time entries, with multi-version strategy lineages (v1 → v2 → v3), strict zero-lookahead walk-forward execution and paper trading of the 2026 season slate. README read 2026-09-22.',
    verifiableClaim:
      'It states the same constraint this repository\'s replay engine implements and tests: strict zero-lookahead. Here that is enforced by construction (a bar may only read captures taken at or before its own instant — tests 62/63 and the point-in-time rules in IRREGULARITIES #60/#74-style failures), and it is the reason a later capture can never price an earlier order.',
    kalshiMarketClass: 'KXNFLGAME / KXNFL* series (football)',
    testableHere: false,
    blockedBy:
      'Its numbers are ITS OWN ledger, computed under ITS fee, liquidity and queue assumptions. Nothing from that ledger enters a result here; only the discipline transfers, and the transferable part — zero-lookahead execution — is already implemented and tested in this repo.',
    flagged:
      'Persona counts are not evidence of edge, in either repository. Recorded so a reader does not read 70 personas as 70 profitable strategies.',
    strategyUsername: null
  },

  {
    id: 'S25',
    requested: 'NHLComp (found by fourth pass)',
    name: 'NHLComp — autonomous NHL research, backtest, forward test and paper trading',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/NHLComp/',
      repo: 'https://github.com/buffedlizard55-lab/NHLComp'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'An autonomous NHL platform whose README states two rules this repository shares and one operational fact worth recording: "BACKTEST and FORWARD TEST are never merged" (test_mode is one or the other, shown side by side, never added), backtest prices are real timestamped Kalshi hourly candles drawn from the live tier or the /historical tier, and Kalshi\'s /historical/cutoff is currently 2026-07-22 (i.e. contracts settled before that date are served from the historical tier). README read 2026-09-22.',
    verifiableClaim:
      'The "never merged" rule and the historical-tier cutoff are both checkable operational claims: this repository captures candlesticks from the same API and stores the tier it came from, and src/accumulated-history.js + the ingest logs record which markets are served from which tier.',
    kalshiMarketClass: 'KXNHLGAME / KXNHL* series (hockey)',
    testableHere: false,
    blockedBy:
      'A sibling competitor\'s ledger again. The useful transferable item is its candle-tier disclosure, which this repository already follows by storing captured_at + source per bar rather than a merged series.',
    flagged:
      'The /historical/cutoff date moves as Kalshi ages contracts; a repo that hard-codes it goes stale silently. This repository records the capture instant per bar instead, which is why its own backtest can state the window it covers (see VERIFICATION.md V-series facts).',
    strategyUsername: null
  },

  {
    id: 'S26',
    requested: 'OLBG-Competition (found by fourth pass)',
    name: 'Northstar Competition Lab (OLBG-Competition) — walk-forward betting research with multiplicity control',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/OLBG-Competition/',
      repo: 'https://github.com/buffedlizard55-lab/OLBG-Competition'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A source-first paper-trading research desk that collects tipster selections, verifies results through permissioned/reference adapters and backtests sport-specific strategies walk-forward with strict time cutoffs. README (2026-09-22): a 27-match Bundesliga 2024/25 pilot with 27/27 dual-source result agreement; thirteen strategies across 1X2, O/U 2.5 and Asian handicap, twelve negative, and the one positive desk (+9.8u, ROI +44.7%) NOT significant after Holm correction (p = 0.0715, family m = 13) — with the note that the adjusted p ROSE when two more desks joined the family, "which is the correction working".',
    verifiableClaim:
      'This is the clearest statement in the owner\'s account of the multiple-testing problem this repository also has: a roster of dozens of strategies will show positive results by chance. Recording it here is what makes this repo\'s own sweep results (scripts/sensitivity-sweep.mjs, data/reports/strategy-sweep-*.json) readable as a family of tests rather than as independent discoveries.',
    kalshiMarketClass: 'None directly — football/hockey/darts betting markets, not Kalshi contracts',
    testableHere: false,
    blockedBy:
      'Different instruments and a licensing-gated odds path (its own README says hockey/darts PnL is UNAVAILABLE, never zero). Nothing in it prices a Kalshi contract.',
    flagged:
      'The transferable lesson, recorded because it cuts against this repository\'s own optimism: the more strategies a competition runs, the more its best-looking number is a maximum over noise. This repo\'s mitigation is to publish the whole sweep and label unranked/untested entries instead of promoting the best of them.',
    strategyUsername: null
  },

  {
    id: 'S27',
    requested: 'MLBRainDelay (found by fourth pass)',
    name: 'MLBRainDelay — live MLB delay, postponement and ballpark-weather tracker',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MLBRainDelay/',
      repo: 'https://github.com/buffedlizard55-lab/MLBRainDelay'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A zero-dependency site that reads the public MLB StatsAPI plus government weather sources and publishes, per game: the forecast-risk picture for the game window, active weather alerts, and the OFFICIAL delay facts (reason, official minutes, the play-by-play status timeline, makeup date). README (2026-09-22) states its own rule explicitly: delay/postponement rows are produced ONLY from official MLB status and advisory data, a game MLB has not officially delayed never appears as a delay row, and expected start/restart times are never inferred.',
    verifiableClaim:
      'The same source this repository already trusts for game state (statsapi.mlb.com, archived in data/mlb-signals/) carries the delay status; the project demonstrates the official fields exist and are usable point-in-time.',
    kalshiMarketClass: 'KXMLBGAME — game timing (when a market\'s tradeable window actually ends)',
    testableHere: false,
    blockedBy:
      'No delay/postponement feed is archived in THIS repository yet (data/mlb-signals/games carries state, not the delay narrative), and Kalshi publishes no dedicated rain-delay series here — so there is nothing to price against. It is recorded as the named unblocker for the game-window join gap (ROADMAP Next #11): an official event-time source, which is exactly what the audit\'s TRADEABLE_EVENT_UNVERIFIED rows are missing.',
    flagged:
      'Not a price signal. It is a TIMING signal: if it were archived point-in-time, a delayed game\'s real start instant would let the audit classify IN_PLAY ladders that today must stay UNVERIFIED (irregularities #60, #65).',
    strategyUsername: null
  },

  {
    id: 'S28',
    requested: 'Elections (found by fourth pass)',
    name: 'Elections — civic data registry with a LIVE 2026 paper contest on open Kalshi election markets',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/Elections/',
      repo: 'https://github.com/buffedlizard55-lab/Elections'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A collect/analyse/project/estimate research project on civic data (267 sources, 80 irregularities, 156 tests per its README, 2026-09-22) whose README announces a running contest: "12 entrants, unique usernames, unique theses, $100,000 each, scored every day on OPEN Kalshi election markets".',
    verifiableClaim:
      'It is a working, live example — in the owner\'s own account — of exactly the format this repository implements: one paper account per distinctly-named strategy, scored on OPEN Kalshi contracts. Its existence is the strongest available confirmation that the format is buildable end-to-end on Kalshi\'s public API, and it is cited here as a FORMAT reference (with kalshi.com, The Leap, Trade-Ideas and Candlecharts contest pages, RESEARCH_SOURCES R24–R27).',
    kalshiMarketClass: 'Kalshi election series (2026 contests) — NOT yet captured by this repository',
    testableHere: false,
    blockedBy:
      'Coverage, not capability: this repository\'s ingest universe is configured with three series per scheduled run (KXNASDAQ100Y, KXBTCY, KXINXY) plus the sport/weather/FDA/CEO pipelines, and it holds no election tickers, so the desk has nothing to price. An election series ticker must be DISCOVERED from the live API (scripts/discover-universe.mjs) — never guessed — before an election entrant could be added honestly.',
    flagged:
      'Recorded as a named coverage gap: the platform supports the format, the store simply has no election contracts. ROADMAP "Next" carries the discovery step.',
    strategyUsername: null
  },

  {
    id: 'S29',
    requested: 'GEMSDOE (found by fourth pass)',
    name: 'GEMSDOE — Geologic Enhanced Mapping System prize challenge',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/GEMSDOE/',
      repo: 'https://github.com/buffedlizard55-lab/GEMSDOE'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs:
      'A competition-submission project (a geologic mapping prize challenge) whose own README is unusually explicit about what is finished and what is human-only: the submission file, its sha256 re-hashed at build time, regeneration routes, and a readiness gate in which "the human-only steps are labelled HUMAN rather than counted as done".',
    verifiableClaim:
      'Its "HUMAN rather than counted as done" gate is the same accounting rule this repository applies to its own unfinished work: an unverifiable step is published as unfinished (ROADMAP "Next", irregularity entries) instead of being marked complete.',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy: 'No market: a geoscience prize submission has no tradeable contract.',
    flagged: null,
    strategyUsername: null
  },

  {
    id: 'S30',
    requested: 'MasterSelfLearn (found by fourth pass)',
    name: 'MasterSelfLearn — autonomous, evidence-first research engine',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/MasterSelfLearn/',
      repo: 'https://github.com/buffedlizard55-lab/MasterSelfLearn'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A timed autonomous research engine (*/30 * * * *) that reads official public data, expands a topic library, has competing personas predict what happens next, scores them against what actually happened, and prints a link a human can open for every number it prints.',
    verifiableClaim:
      'Its output contract — every printed number carries an openable source link — is the same rule this repository\'s VERIFICATION.md follows, and it is the mechanism that makes the "no hallucinations" requirement checkable rather than aspirational.',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy:
      'It produces scored predictions about general topics, not prices for Kalshi contracts; no point-in-time market series is emitted here.',
    flagged: null,
    strategyUsername: null
  },

  {
    id: 'S31',
    requested: 'SelfLearn (found by fourth pass)',
    name: 'SelfLearn — autonomous claim-verification research engine',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/SelfLearn/',
      repo: 'https://github.com/buffedlizard55-lab/SelfLearn'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'An autonomous engine that "will not publish a sentence it cannot quote from a document it actually retrieved": it plans reading, fetches registered sources, cuts candidate claims, verifies each against its own document, has six researchers build answers, attacks them with eleven deterministic critic rules, scores them on nine published criteria and publishes claims, sources, criticisms, contradictions, refusals and open irregularities as JSON + a static site.',
    verifiableClaim:
      'Its refusal mechanism (publish the refusal, not a guess) is structurally the same as this repository\'s abstain-with-a-reason behaviour: a strategy with no signal publishes why instead of fabricating a trade (ForecastEdge_Weather\'s UNTESTED_ON_THIS_DATASET, LiveHeatConfirm_Weather\'s "0 of 106 contracts match").',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy: 'Same as S30: no market series, no price.',
    flagged: null,
    strategyUsername: null
  },

  {
    id: 'S32',
    requested: 'SocialMediaComp (found by fourth pass)',
    name: 'SocialMediaComp — cited leaderboard of high-reach social accounts and communities',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/SocialMediaComp/',
      repo: 'https://github.com/buffedlizard55-lab/SocialMediaComp'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs:
      'An 80-entry, dated-snapshot leaderboard of TikTok/Instagram/Facebook/Reddit/YouTube/X/Twitch accounts and communities, with a profile_url and a source_url on every row and a verification log recording which table cell each figure was read from. Its own README states it is "Not live follower counts" and "not a guide to buying engagement".',
    verifiableClaim:
      'Its dated-snapshot discipline is the rule this repository applies to social discovery (RESEARCH_SOURCES R01–R23): a social claim is recorded with its URL and its date and is treated as a HYPOTHESIS, never as a price or a result.',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy:
      'Reach figures are not market data. The strategy-mining side of social discovery is already carried by RESEARCH_SOURCES; this project is the account-side catalogue.',
    flagged: null,
    strategyUsername: null
  },

  {
    id: 'S33',
    requested: 'VacationSchedule (found by fourth pass)',
    name: 'VacationSchedule — sports-free time planner with a committed MLB fixture snapshot',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      live: 'https://buffedlizard55-lab.github.io/VacationSchedule/',
      repo: 'https://github.com/buffedlizard55-lab/VacationSchedule'
    },
    status: SIGNAL_SOURCE_STATUS.CANDIDATE,
    whatItIs:
      'A 2026–2029 planner that compares three definitions of sports-free vacation time and, in its 2026-09-21 pass, added MLB 2026 & 2027 fixture tabs: "every fixture the league has scheduled, all 30 clubs: Spring Training, regular season, All-Star Game and postseason, from the committed Stats API snapshot", each row carrying the league\'s own game_pk.',
    verifiableClaim:
      'A committed Stats-API fixture snapshot with game_pk per row is exactly the object this repository\'s game-window audit is missing for its TRADEABLE_EVENT_UNVERIFIED rows: an OFFICIAL schedule with the league\'s game identifier, joinable to KXMLBGAME tickers by the same game_pk rule used in data/mlb-signals/.',
    kalshiMarketClass: 'KXMLBGAME — event start times (the join gap in ROADMAP Next #11)',
    testableHere: false,
    blockedBy:
      'A committed SNAPSHOT is not a point-in-time archive: the audit may only use what was knowable at the ladder\'s capture instant, so a single late snapshot of the schedule cannot retro-classify old ladders. It names a real, cheap unblocker (archive the schedule on the same cadence as data/mlb-signals/) rather than a shortcut.',
    flagged:
      'The distinction matters and is recorded deliberately: a CURRENT schedule is not an event window AS KNOWN AT THE TIME. Using it to classify historical ladders would import knowledge the trader did not have.',
    strategyUsername: null
  },

  {
    id: 'S34',
    requested: 'The remaining sites in the directory (fourth-pass completeness entry)',
    name: 'Travel & Korea Trip (11), SF Local Guides (6), Health & Personal Guides (1), Gaming & Guides (1) and the remaining directory/meta sites — audited, not market signals',
    urls: {
      masterSite: 'https://buffedlizard55-lab.github.io/MasterSite/',
      directory: 'https://api.github.com/users/buffedlizard55-lab/repos?per_page=100'
    },
    status: SIGNAL_SOURCE_STATUS.NOT_A_SIGNAL,
    whatItIs:
      'One grouped entry so the coverage claim is exact rather than implied: the directory publishes 52 of the account\'s 53 public repositories (1 permanently excluded by owner request — its account section names the exclusion and never the repository), and every site is now catalogued in this ledger. The sites in this group are: AirPremia, BathTubOverflowSF, BusanL7HaeundaeLotteHotelStay, CruiseDeals, HongdaeStay, HotelSeoulRoughdraft1, Itinerary-Korea, Korea, Korea-emergency, KoreaHotels, Leg3SeoulTrip, PlumbingSF, SFLateNight, ShoulderPain, StanfordStay, TinoLunchSpecial, VapePods, WoWForever, plus the Directory & Meta trio (MasterSite itself and the two engines above).',
    verifiableClaim:
      'The classification is checkable from the directory\'s own category labels and the repositories themselves: none of these projects publishes a price series, a market datum, or an event outcome that a Kalshi contract settles on. Two of them touch markets only through scheduling (a trip planner avoiding game days), which is covered by S33.',
    kalshiMarketClass: null,
    testableHere: false,
    blockedBy:
      'No market claim exists to test: there is no instrument to price and no settlement to verify.',
    flagged: null,
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
