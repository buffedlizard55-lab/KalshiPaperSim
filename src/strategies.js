/**
 * High-Return Stock Strategies & Usernames for 1-Year Kalshi Competition
 * 
 * In accordance with prompt requirements:
 * - Focus strictly on highest returns (no risk management drag; maximum alpha seeking)
 * - Unique username and custom strategy identity
 * - Detailed explanation on why it worked or why it didn't work
 * - In-depth attribution analysis explaining results and return drivers
 * - Complete trade logs and 52-week equity curve memory data
 */

export const STRATEGIES_DATA = [
  {
    id: 'strat_alpha_apex',
    username: 'AlphaApex_Momentum',
    rank: 1,
    avatar: '🚀',
    title: 'Maximum Convexity Momentum Chaser',
    category: 'Convexity Momentum',
    tagline: 'Aggressive 100% position sizing on OTM breakout contracts aiming for 5x–10x payoffs',
    startingCapital: 100000,
    currentEquity: 942600,
    realizedPnl: 842600,
    returnPct: 842.6,
    winRate: 46.2,
    totalTrades: 39,
    winningTrades: 18,
    losingTrades: 21,
    profitFactor: 5.82,
    bestTrade: 382400,
    worstTrade: -95000,
    maxDrawdownPct: 62.4,
    status: 'ACTIVE_LEADER',

    thesis: `Pure convexity seeking with zero risk dampening. Targets deeply mispriced out-of-the-money (OTM) binary contracts (priced 10¢–20¢) when stock indices (S&P 500, Nasdaq) or high-beta tech equities experience a sudden 3x volume explosion and momentum surge. Deploys 90%–100% of available account equity into the single breakout setup to achieve mathematical maximum compounding when contracts settle to $1.00.`,
    
    rules: {
      entry: 'Market order buy YES when contract trades between 10¢ and 22¢, 24h volume expands >300%, and underlying equity index hits a 20-day high.',
      sizing: '100% of available liquid cash into the breakout setup (unhedged full-tilt).',
      exit: 'Hold through settlement ($1.00 payout) or sell if contract reaches 85¢ before settlement to free liquidity for the next runner.',
      riskManagement: 'NONE. No stop losses. Accepts 100% total loss on failures to preserve upside convex payoff.'
    },

    whyItWorked: `The strategy dominated the 1-year competition because 2026 featured three violent upward momentum expansions in Mega-Cap tech and equity index milestones. In Q2 and Q3, contracts for KXSP500-26DEC31-T6000 and KXNVDA-26DEC31-T150 experienced parabolic re-pricings from 14¢ to 95¢+. By refusing to hedge or size down, each winning trade delivered returns of +450% to +614% on total invested capital. The exponential compounding of three consecutive asymmetric wins catapulted the account from $100k to nearly $1 million.`,

    whyItExperiencedDrawdowns: `In Q1, the market traded in a choppy sideways range. The strategy suffered four consecutive 100% losses on OTM strike expirations, generating a severe peak-to-trough drawdown of -62.4%. Traditional risk-managed funds would have halted trading or cut position size; however, maintaining 100% capital commitment allowed the subsequent winner to recover the entire drawdown within 72 hours.`,

    returnAttribution: [
      { factor: 'Asymmetric Convexity Payoff (10¢ -> $1.00 wins)', contributionPct: 76.5, description: 'Direct gain from binary contracts settling at $1.00 after buying under 20¢.' },
      { factor: 'Parabolic Tech Momentum Continuation', contributionPct: 15.2, description: 'Early exits at 85¢–90¢ ahead of expiry during rapid momentum sweeps.' },
      { factor: 'Compounding Velocity (All-in Sizing)', contributionPct: 8.3, description: 'Re-investing 100% of previous winnings into subsequent setups.' },
      { factor: 'Slippage & Taker Execution Drag', contributionPct: -6.4, description: 'Book-walking cost when aggressively consuming thin OTM order book depth.' }
    ],

    tradeHistory: [
      { id: 'T01', date: '2026-02-12', ticker: 'KXSP500-26DEC31-T6000', side: 'YES', count: 650000, fillPrice: 0.15, cost: 97500, exitPrice: 0.00, pnl: -97500, outcome: 'EXPIRED_LOSS', note: 'Q1 false breakout, expired worthless' },
      { id: 'T02', date: '2026-03-24', ticker: 'KXNVDA-26DEC31-T150', side: 'YES', count: 480000, fillPrice: 0.18, cost: 86400, exitPrice: 0.88, pnl: 336000, outcome: 'EARLY_EXIT_WIN', note: 'AI GTC keynote momentum sweep' },
      { id: 'T03', date: '2026-05-18', ticker: 'KXNDX-26DEC31-T21000', side: 'YES', count: 1800000, fillPrice: 0.19, cost: 342000, exitPrice: 0.00, pnl: -342000, outcome: 'EXPIRED_LOSS', note: 'Tech pullback flush out' },
      { id: 'T04', date: '2026-07-09', ticker: 'KXSP500-26DEC31-T6000', side: 'YES', count: 420000, fillPrice: 0.16, cost: 67200, exitPrice: 1.00, pnl: 352800, outcome: 'SETTLED_WIN', note: 'S&P 500 milestone achieved at 6,012' },
      { id: 'T05', date: '2026-08-28', ticker: 'KXNVDA-26DEC31-T150', side: 'YES', count: 950000, fillPrice: 0.22, cost: 209000, exitPrice: 1.00, pnl: 741000, outcome: 'SETTLED_WIN', note: 'Earnings blowout + guidance beat' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 4, date: '2026-02-02', equity: 114000 },
      { week: 8, date: '2026-03-02', equity: 37600 },
      { week: 13, date: '2026-04-06', equity: 373600 },
      { week: 20, date: '2026-05-25', equity: 142000 },
      { week: 26, date: '2026-07-06', equity: 494800 },
      { week: 35, date: '2026-09-07', equity: 942600 }
    ]
  },

  {
    id: 'strat_gamma_whale',
    username: 'GammaWhale_Squeeze',
    rank: 2,
    avatar: '🐋',
    title: 'High-Gamma Short Squeeze & Volatility Breakout',
    category: 'High-Gamma Catalysts',
    tagline: 'Concentrated bets 48h before earnings & delivery releases to catch short-covering meltups',
    startingCapital: 100000,
    currentEquity: 714200,
    realizedPnl: 614200,
    returnPct: 614.2,
    winRate: 58.3,
    totalTrades: 24,
    winningTrades: 14,
    losingTrades: 10,
    profitFactor: 4.15,
    bestTrade: 312000,
    worstTrade: -82000,
    maxDrawdownPct: 41.5,
    status: 'ACTIVE_CONTENDER',

    thesis: `Focuses on binary contracts tied to high short interest, retail sentiment frenzy, and high implied volatility events (Tesla delivery reports, chip earnings, short squeeze rallies). Trades right before the catalyst when liquidity providers widen spreads and underprice tail movement.`,

    rules: {
      entry: 'Buy contracts with >50% short interest underlying stocks when implied volatility surges into catalyst date.',
      sizing: '85% allocation per event.',
      exit: 'Sell immediately into the initial post-announcement liquidity spike.',
      riskManagement: 'Zero stops. Rides full gamma wave.'
    },

    whyItWorked: `Caught the immense Q3 short squeeze in Tesla vehicle delivery contracts (KXTSLA-26Q4-DELIV450K), entering at 26¢ and exiting at 91¢ after a surprise delivery beat. Also captured major returns on chip earnings releases where market makers had underpriced upside strikes.`,

    whyItExperiencedDrawdowns: `Two major tech earnings reports missed expectations, resulting in 100% loss of the invested capital on those events.`,

    returnAttribution: [
      { factor: 'Gamma Expansion & Volatility Spike', contributionPct: 64.2, description: 'Rapid repricing of contracts as probability shifted from 25% to 90% in hours.' },
      { factor: 'Short Squeeze Momentum Spillover', contributionPct: 28.5, description: 'Underlying equity rally forced institutional hedging in Kalshi markets.' },
      { factor: 'Execution Slippage on Fast Breakouts', contributionPct: -4.8, description: 'Spread widening at announcement time caused high taker costs.' }
    ],

    tradeHistory: [
      { id: 'T11', date: '2026-01-20', ticker: 'KXTSLA-26Q4-DELIV450K', side: 'YES', count: 320000, fillPrice: 0.26, cost: 83200, exitPrice: 0.91, pnl: 208000, outcome: 'EARLY_EXIT_WIN', note: 'Delivery surprise squeeze' },
      { id: 'T12', date: '2026-04-18', ticker: 'KXAAPL-26DEC31-T260', side: 'YES', count: 500000, fillPrice: 0.35, cost: 175000, exitPrice: 0.10, pnl: -125000, outcome: 'EARLY_EXIT_LOSS', note: 'Supply chain rumor dip' },
      { id: 'T13', date: '2026-07-22', ticker: 'KXNVDA-26DEC31-T150', side: 'YES', count: 700000, fillPrice: 0.38, cost: 266000, exitPrice: 0.96, pnl: 406000, outcome: 'EARLY_EXIT_WIN', note: 'Data center AI chip demand surge' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 8, date: '2026-03-02', equity: 308000 },
      { week: 16, date: '2026-04-27', equity: 183000 },
      { week: 24, date: '2026-06-22', equity: 385000 },
      { week: 35, date: '2026-09-07', equity: 714200 }
    ]
  },

  {
    id: 'strat_contrarian_100x',
    username: 'ContrarianKing_100x',
    rank: 3,
    avatar: '👑',
    title: 'Deep OTM Tail Event Hunter (100x Mispriced Events)',
    category: 'Tail Convexity',
    tagline: 'Exploiting consensus herd complacency by sweeping 2¢–8¢ longshots with outsized stakes',
    startingCapital: 100000,
    currentEquity: 628900,
    realizedPnl: 528900,
    returnPct: 528.9,
    winRate: 23.5,
    totalTrades: 51,
    winningTrades: 12,
    losingTrades: 39,
    profitFactor: 3.88,
    bestTrade: 462000,
    worstTrade: -24000,
    maxDrawdownPct: 54.2,
    status: 'ACTIVE_CONTENDER',

    thesis: `Markets severely suffer from overconfidence bias. Extreme outlier events are systematically priced at 2¢ to 7¢ despite having a true probability of 15%–20%. By accumulating large baskets of underdog binary contracts without stop-losses, the mathematical payoff ratio (15x to 40x on winning strikes) easily overcompensates for frequent low-dollar losses.`,

    rules: {
      entry: 'Buy contracts priced between 3¢ and 7¢ where public sentiment consensus is >93% on the opposing side.',
      sizing: 'Full available cash split across 2–3 simultaneous extreme outlier candidates.',
      exit: 'Hold to settlement ($1.00 payout). No discretionary early exits.',
      riskManagement: 'Zero hedge. Embraces low win rates for massive payout skew.'
    },

    whyItWorked: `Two extreme tail events settled YES during the competition: an unexpected 50bps emergency rate cut proposal contract and a surprise semiconductor policy shift contract. These generated 1,600% and 1,900% returns on their respective allocations, turning a low 23.5% win rate into a top-3 leaderboard finish.`,

    whyItExperiencedDrawdowns: `Suffered an agonizing 11-trade losing streak during the summer when markets behaved orderly. Total equity fell from $420k to $192k before the massive macro breakout.`,

    returnAttribution: [
      { factor: 'Extreme Payout Asymmetry (Average win 16.4x average loss)', contributionPct: 88.0, description: 'Payoff skew mathematically dominating loss frequency.' },
      { factor: 'Consensus Complacency Mispricing', contributionPct: 18.2, description: 'Capturing structural underestimation of tail risk by market makers.' },
      { factor: 'Loss Drag from 39 Worthless Expirations', contributionPct: -22.4, description: 'Accumulated cost of expiring 0¢ positions during calm regimes.' }
    ],

    tradeHistory: [
      { id: 'T21', date: '2026-02-04', ticker: 'KXINFL-26Q4-SUB2PCT', side: 'YES', count: 400000, fillPrice: 0.05, cost: 20000, exitPrice: 0.00, pnl: -20000, outcome: 'EXPIRED_LOSS', note: 'Inflation sticky in Q1' },
      { id: 'T22', date: '2026-05-11', ticker: 'KXFED-26DEC-CUT50', side: 'YES', count: 500000, fillPrice: 0.06, cost: 30000, exitPrice: 1.00, pnl: 470000, outcome: 'SETTLED_WIN', note: 'Emergency dovish shift shock' },
      { id: 'T23', date: '2026-08-14', ticker: 'KXTSLA-26Q4-DELIV450K', side: 'NO', count: 600000, fillPrice: 0.07, cost: 42000, exitPrice: 0.00, pnl: -42000, outcome: 'EXPIRED_LOSS', note: 'Deliveries beat consensus' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 10, date: '2026-03-16', equity: 74000 },
      { week: 19, date: '2026-05-18', equity: 544000 },
      { week: 28, date: '2026-07-20', equity: 320000 },
      { week: 35, date: '2026-09-07', equity: 628900 }
    ]
  },

  {
    id: 'strat_yield_vulture',
    username: 'YieldVulture_Arb',
    rank: 4,
    avatar: '🦅',
    title: 'Aggressive High-Yield Expiry Sweeper',
    category: 'High-Probability Compounding',
    tagline: 'Maximum leverage sweeps of 88¢–94¢ favorites in final 72h to harvest rapid compounding',
    startingCapital: 100000,
    currentEquity: 482400,
    realizedPnl: 382400,
    returnPct: 382.4,
    winRate: 88.9,
    totalTrades: 63,
    winningTrades: 56,
    losingTrades: 7,
    profitFactor: 2.94,
    bestTrade: 42000,
    worstTrade: -110000,
    maxDrawdownPct: 44.8,
    status: 'ACTIVE_CONTENDER',

    thesis: `High turnover velocity. In the final 72 hours before contract settlement, probability tends to concentrate around 90¢–94¢. Sweeping the remaining 6¢–10¢ risk premium with 100% account leverage produces 8%–12% return per trade. Compounding this 50+ times per year yields massive exponential growth.`,

    rules: {
      entry: 'Buy contracts priced at 88¢–93¢ with less than 3 days to expiry.',
      sizing: '100% of portfolio capital deployed per sweep.',
      exit: 'Hold to settlement ($1.00 payout).',
      riskManagement: 'None. Sells nothing early, takes full catastrophic downside on upsets.'
    },

    whyItWorked: `56 winning settlements out of 63 trades provided rapid compounding of account capital. During stable months, capital grew at over 25% per month due to near-continuous capital re-deployment.`,

    whyItHadCrashes: `The fatal flaw of unhedged favorite sweeping is the "steamroller" risk: two unexpected late upsets (including a surprise CPI inflation print that resolved NO when priced at 92¢) wiped out 100% of the invested position on those trades, producing severe vertical drops.`,

    returnAttribution: [
      { factor: 'High Win Rate Compounding (88.9% wins)', contributionPct: 82.4, description: 'Rapid turnover of 8¢–10¢ margins compounded over 60+ trades.' },
      { factor: 'Time Decay (Theta) Acceleration', contributionPct: 24.1, description: 'Final 72-hour premium collapse towards 100¢.' },
      { factor: 'Tail Upset Destruction (-100% wipeouts on 7 trades)', contributionPct: -48.2, description: 'Catastrophic losses when 90¢+ contracts suddenly collapsed.' }
    ],

    tradeHistory: [
      { id: 'T31', date: '2026-01-29', ticker: 'KXSP500-26DEC31-T6000', side: 'YES', count: 120000, fillPrice: 0.91, cost: 109200, exitPrice: 1.00, pnl: 10800, outcome: 'SETTLED_WIN', note: 'Year-end index strike settlement' },
      { id: 'T32', date: '2026-03-14', ticker: 'KXINFL-26Q4-SUB2PCT', side: 'NO', count: 150000, fillPrice: 0.93, cost: 139500, exitPrice: 0.00, pnl: -139500, outcome: 'EXPIRED_LOSS', note: 'Sudden CPI benchmark upset wipeout' },
      { id: 'T33', date: '2026-06-25', ticker: 'KXBTC-26DEC31-T100K', side: 'YES', count: 350000, fillPrice: 0.89, cost: 311500, exitPrice: 1.00, pnl: 38500, outcome: 'SETTLED_WIN', note: 'Bitcoin holding $100k line' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 9, date: '2026-03-09', equity: 220000 },
      { week: 10, date: '2026-03-16', equity: 80500 },
      { week: 22, date: '2026-06-08', equity: 340000 },
      { week: 35, date: '2026-09-07', equity: 482400 }
    ]
  },

  {
    id: 'strat_fed_pivot',
    username: 'FedPivotSniper',
    rank: 5,
    avatar: '🎯',
    title: 'Macro Liquidity & FOMC Rate Decision Maximizer',
    category: 'Macro & Fed',
    tagline: 'Aggressive frontrunning of Kalshi Fed interest rate and inflation series',
    startingCapital: 100000,
    currentEquity: 412000,
    realizedPnl: 312000,
    returnPct: 312.0,
    winRate: 64.7,
    totalTrades: 34,
    winningTrades: 22,
    losingTrades: 12,
    profitFactor: 3.25,
    bestTrade: 198000,
    worstTrade: -65000,
    maxDrawdownPct: 38.6,
    status: 'ACTIVE_CONTENDER',

    thesis: `Equity markets move on Fed liquidity. Trades binary contracts in the KXFED and KXINFL series by tracking Fed Funds futures and Treasury curve steepening. When market consensus lags dovish rate cut expectations, takes aggressive unhedged YES positions.`,

    rules: {
      entry: 'Buy YES on rate cut contracts when SOFR spreads predict cuts not yet priced in Kalshi odds.',
      sizing: '80%–90% allocation on FOMC decision weeks.',
      exit: 'Exit at 95¢ or settlement.',
      riskManagement: 'Zero stops.'
    },

    whyItWorked: `Accurately anticipated the Fed's 50bps rate cut in late summer, buying KXFED-26DEC-CUT50 at 38¢ before it rallied to 95¢+, producing over $200k in clean profit.`,

    whyItSuffered: `An unexpected mid-spring inflation spike caused two high-conviction CPI bets to collapse to zero.`,

    returnAttribution: [
      { factor: 'FOMC Dovish Cycle Capture', contributionPct: 71.4, description: 'Rate cut probability surges directly translating to binary contract gains.' },
      { factor: 'Macro Liquidity Sentiment Spillover', contributionPct: 22.1, description: 'Rallies in high-growth tech binary contracts.' },
      { factor: 'False Pivot Drawdowns', contributionPct: -18.5, description: 'Hawkish Fed commentary shocks causing temporary contract collapses.' }
    ],

    tradeHistory: [
      { id: 'T41', date: '2026-03-18', ticker: 'KXFED-26DEC-CUT50', side: 'YES', count: 250000, fillPrice: 0.32, cost: 80000, exitPrice: 0.85, pnl: 132500, outcome: 'EARLY_EXIT_WIN', note: 'Dovish FOMC press conference sweep' },
      { id: 'T42', date: '2026-05-02', ticker: 'KXINFL-26Q4-SUB2PCT', side: 'YES', count: 400000, fillPrice: 0.28, cost: 112000, exitPrice: 0.00, pnl: -112000, outcome: 'EXPIRED_LOSS', note: 'CPI higher than forecast' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 11, date: '2026-03-23', equity: 232500 },
      { week: 18, date: '2026-05-11', equity: 120500 },
      { week: 27, date: '2026-07-13', equity: 285000 },
      { week: 35, date: '2026-09-07', equity: 412000 }
    ]
  },

  {
    id: 'strat_vol_arb_mm',
    username: 'VolatilityArb_MM',
    rank: 6,
    avatar: '⚡',
    title: 'High-Spread Liquidity Harvester (Aggressive Market Making)',
    category: 'Market Making / Scalping',
    tagline: 'High-frequency two-sided spread extraction inside wide event contract order books',
    startingCapital: 100000,
    currentEquity: 348500,
    realizedPnl: 248500,
    returnPct: 248.5,
    winRate: 72.8,
    totalTrades: 420,
    winningTrades: 306,
    losingTrades: 114,
    profitFactor: 2.18,
    bestTrade: 8400,
    worstTrade: -14500,
    maxDrawdownPct: 22.4,
    status: 'ACTIVE_CONTENDER',

    thesis: `Prediction markets have wider spreads than equities (often 2¢–6¢ wide). By posting reciprocal bids on YES and NO simultaneously inside the spread, this strategy collects taker fees and spread margin continuously without betting on directional market outcome.`,

    rules: {
      entry: 'Quote best bid on YES and best bid on NO simultaneously when spread is >= 3¢.',
      sizing: 'Deploy full balance across 8 active Kalshi books.',
      exit: 'Continuous turnover. Flat inventory before settlement.',
      riskManagement: 'Inventory skew quote shading.'
    },

    whyItWorked: `Steady equity curve without binary 100% loss risks. Executed over 400 round-trip spread captures during high-volatility trading sessions.`,

    whyItRankedLowerThanTop3: `Adverse selection during sharp news breakouts: When sudden breaking news hit, aggressive takers swept the MM's resting limit bids before the MM could cancel, causing inventory hangover losses.`,

    returnAttribution: [
      { factor: 'Bid-Ask Spread Capture (Avg 3.2¢ per contract)', contributionPct: 86.4, description: 'Harvesting taker flow across all 8 market books.' },
      { factor: 'Liquidity Maker Rebates', contributionPct: 12.1, description: 'Clearing exchange incentive fee offsets.' },
      { factor: 'Adverse Selection Leakage', contributionPct: -23.5, description: 'Filled on wrong side of fast directional news moves.' }
    ],

    tradeHistory: [
      { id: 'T51', date: '2026-08-01', ticker: 'KXSP500-26DEC31-T6000', side: 'YES', count: 50000, fillPrice: 0.58, cost: 29000, exitPrice: 0.62, pnl: 2000, outcome: 'SPREAD_HARVEST', note: 'Spread capture during market open' },
      { id: 'T52', date: '2026-08-15', ticker: 'KXNVDA-26DEC31-T150', side: 'YES', count: 80000, fillPrice: 0.42, cost: 33600, exitPrice: 0.46, pnl: 3200, outcome: 'SPREAD_HARVEST', note: 'High volume midday scalp' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 10, date: '2026-03-16', equity: 154000 },
      { week: 20, date: '2026-05-25', equity: 228000 },
      { week: 30, date: '2026-08-03', equity: 302000 },
      { week: 35, date: '2026-09-07', equity: 348500 }
    ]
  },

  {
    id: 'strat_trend_fulltilt',
    username: 'TrendRide_FullTilt',
    rank: 7,
    avatar: '📈',
    title: 'Trend-Following Pyramider (No Stop Loss)',
    category: 'Trend Following',
    tagline: 'Buys at 50¢ parity and aggressively pyramids extra contracts at 65¢ and 80¢',
    startingCapital: 100000,
    currentEquity: 285300,
    realizedPnl: 185300,
    returnPct: 185.3,
    winRate: 51.5,
    totalTrades: 33,
    winningTrades: 17,
    losingTrades: 16,
    profitFactor: 2.05,
    bestTrade: 142000,
    worstTrade: -78000,
    maxDrawdownPct: 49.3,
    status: 'ACTIVE_CONTENDER',

    thesis: `Once an event contract crosses 50¢ with rising volume, statistical momentum favors a continuation toward $1.00. The strategy buys an initial stake at 50¢ and pyramids additional tranches using paper trading gains as the price rallies to 65¢ and 80¢.`,

    rules: {
      entry: 'Initial buy YES at 50¢ crossing. Add tranche 2 at 65¢. Add tranche 3 at 80¢.',
      sizing: 'Full account leverage utilized at each pyramiding step.',
      exit: 'Hold to final settlement ($1.00).',
      riskManagement: 'No trailing stops. High risk of giving back paper gains.'
    },

    whyItWorked: `When a trend went straight to $1.00 (such as the S&P 500 milestone), pyramiding maximized contract quantity, resulting in outsized nominal profits.`,

    whyItUnderperformed: `Pyramiding moves average cost basis higher. When a contract reached 78¢ and reversed back to 0¢, the entire pyramided position collapsed, erasing what had been substantial unrealized profit.`,

    returnAttribution: [
      { factor: 'Pyramiding Compounding on Clear Trends', contributionPct: 75.0, description: 'Maximizing exposure on winning trends.' },
      { factor: 'Parity Breakout Edge', contributionPct: 20.2, description: 'Favorable drift above 50¢.' },
      { factor: 'Whipsaw Giveback on Reversals', contributionPct: -41.2, description: 'High cost basis liquidation on failed breakouts.' }
    ],

    tradeHistory: [
      { id: 'T61', date: '2026-04-10', ticker: 'KXSP500-26DEC31-T6000', side: 'YES', count: 180000, fillPrice: 0.52, cost: 93600, exitPrice: 1.00, pnl: 86400, outcome: 'SETTLED_WIN', note: 'Trend continuation to parity' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 12, date: '2026-03-30', equity: 145000 },
      { week: 24, date: '2026-06-22', equity: 235000 },
      { week: 35, date: '2026-09-07', equity: 285300 }
    ]
  },

  {
    id: 'strat_event_catalyst',
    username: 'EventCatalyst_Max',
    rank: 8,
    avatar: '🔬',
    title: 'Tech Earnings & Regulatory Verdict Frontrunner',
    category: 'Event Driven',
    tagline: 'High-conviction concentrated bets on single-stock antitrust and regulatory milestones',
    startingCapital: 100000,
    currentEquity: 242100,
    realizedPnl: 142100,
    returnPct: 142.1,
    winRate: 53.8,
    totalTrades: 26,
    winningTrades: 14,
    losingTrades: 12,
    profitFactor: 1.84,
    bestTrade: 115000,
    worstTrade: -58000,
    maxDrawdownPct: 35.8,
    status: 'ACTIVE_CONTENDER',

    thesis: `Focuses on non-financial technical catalysts: DOJ antitrust lawsuits, FTC rulings, EU regulatory approvals, and tech company IP disputes. Markets miscalculate legal timelines and binary settlement criteria.`,

    rules: {
      entry: 'Take position based on court docket tracking and regulatory filings.',
      sizing: '75%–85% allocation per case.',
      exit: 'Exit upon verdict release or settlement.',
      riskManagement: 'Zero stop losses.'
    },

    whyItWorked: `Won high-profile predictions on DOJ antitrust timeline delays and AI chip export license rulings.`,

    whyItUnderperformed: `Several unexpected judicial postponements tied up capital for months without returns, dampening total annual velocity.`,

    returnAttribution: [
      { factor: 'Regulatory Docket Analysis', contributionPct: 68.0, description: 'Accurate prediction of judicial rulings and agency decisions.' },
      { factor: 'Earnings Beat Spillover', contributionPct: 22.4, description: 'Catalyst trades on tech product releases.' },
      { factor: 'Opportunity Cost of Judicial Delays', contributionPct: -16.2, description: 'Capital locked in stalled litigation contracts.' }
    ],

    tradeHistory: [
      { id: 'T71', date: '2026-05-04', ticker: 'KXAAPL-26DEC31-T260', side: 'YES', count: 210000, fillPrice: 0.46, cost: 96600, exitPrice: 0.94, pnl: 100800, outcome: 'EARLY_EXIT_WIN', note: 'App Store regulatory settlement win' }
    ],

    equityCurve: [
      { week: 0, date: '2026-01-05', equity: 100000 },
      { week: 14, date: '2026-04-13', equity: 162000 },
      { week: 25, date: '2026-06-29', equity: 198000 },
      { week: 35, date: '2026-09-07', equity: 242100 }
    ]
  }
];
