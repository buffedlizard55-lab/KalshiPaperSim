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
    flagged: 'IRREGULARITIES.md — "CEO" project requested but not found in the verified directory; owner review needed (rename? the excluded repo?).',
    strategyUsername: null
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
      'Company-event markets (e.g. a CEO-departure or company-KPI market on Kalshi). NOTE: this repository holds NO company-event market — its universe is index/BTC range strikes, weather brackets and gold.',
    testableHere: false,
    blockedBy:
      'Two gaps: (1) no Kalshi market of this class is ingested (which series would need to be chosen and captured); (2) no point-in-time Form 4 archive in this repo. Both are ingest problems, not strategy problems — the honest test would be: archive Form 4 filings daily, ingest the matching Kalshi markets, then replay "buy after a material insider buy/sell" with fills and fees exactly as the roster does.',
    strategyUsername: null
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
    blockedBy:
      'The Leap\'s own strategies run on intraday futures data with leverage this venue does not offer, and its repo publishes verdicts, not a tradeable point-in-time signal feed. Any recreation here would be a NEW design wearing its name — the honest version is what the existing momentum/trend roster entries already measure on the real Kalshi bars.',
    strategyUsername: null
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
      'No sports series is ingested in this repository, and the R04 replication already showed the shock-timing archetype fails on real data. An honest test would need: an NFL series ingested at fine granularity + the injury feed archived point-in-time + a design that trades "the market has not priced a key absence".',
    strategyUsername: null
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
    kalshiMarketClass: 'Kalshi NBA game/championship markets.',
    testableHere: false,
    blockedBy: 'Same as S04: no NBA series in this repository\'s universe yet. The signal source is real and archived by that project; the Kalshi leg is the missing half.',
    strategyUsername: null
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
    kalshiMarketClass: 'Kalshi FDA-approval / biotech-event markets, when listed.',
    testableHere: false,
    blockedBy:
      'No FDA/biotech Kalshi market is in this repository\'s universe, and such markets are event-specific (one market per drug-decision) rather than a standing series — the ingest would need a discovery path by category, plus the DrugAnalysis dates mirrored into a point-in-time archive. The design is ready the moment the data is: "buy the approval-side contract that is cheap relative to the base rate for its PDUFA window" is exactly the kind of hypothesis this platform measures.',
    strategyUsername: null
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
    kalshiMarketClass: 'Kalshi NCAA game markets.',
    testableHere: false,
    blockedBy: 'No NCAA series ingested; in-play shock strategies also need sub-hour bars AND the R04 independent replication is evidence against that family on real data. Documented, not silently skipped.',
    strategyUsername: null
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
    blockedBy: 'Same as S07 — the Kalshi leg (an ingested NFL series at game-time granularity) is the missing half.',
    strategyUsername: null
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
