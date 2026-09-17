# KalshiPaperSim 🚀

[![Platform](https://img.shields.io/badge/Platform-Kalshi%20Binary%20Event%20Simulation-blue.svg)](https://kalshi.com)
[![CFTC Compliant Logic](https://img.shields.io/badge/CFTC-Binary%20Option%20Pricing-emerald.svg)](https://www.cftc.gov/)
[![Tests](https://img.shields.io/badge/Unit%20Tests-6%2F6%20Passing-brightgreen.svg)](test/simulation.test.js)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-success.svg)](docs/)

A high-fidelity **Paper Trading Kalshi Simulation Competition Platform** featuring real-time event pricing, reciprocal order book liquidity, automated market making, and 1-year strategy performance tracking.

Built by reverse-engineering the core mechanics of premier trading competition platforms:
* [TradingView The Leap](https://www.tradingview.com/the-leap/)
* [Trade-Ideas Stock Trading Competition](https://www.trade-ideas.com/stock-trading-competition/)
* [Candlecharts Trading Contest](https://specials.candlecharts.com/contest/)
* [Kalshi Official Exchange](https://kalshi.com)

---

## 🌟 Key Features

1. **CFTC Binary Event Contract Engine**:
   * Binary outcomes settling at **$1.00 (YES)** or **$0.00 (NO)**.
   * Reciprocal pricing enforcement: $P(\text{YES}) + P(\text{NO}) = 1.00$ ($100¢$).
   * Implied asks derived from opposing bids: $\text{Ask}(\text{YES}) = 1.00 - \text{Bid}(\text{NO})$.

2. **Realistic Liquidity Depth & Slippage Simulation**:
   * Multi-tier Depth of Market (DOM) ladder.
   * Orders walk the book tier-by-tier with volume-weighted average price (VWAP) and price impact.

3. **Continuous Automated Market Making (AMM)**:
   * Dynamic two-sided quotation maintaining tight spreads (2¢–4¢).
   * Inventory skew quote shading and depth replenishment.

4. **8 High-Return Stock Strategies & Unique Usernames**:
   * **Mandate:** Focus purely on highest returns (no stop-loss drag; maximum convex compounding).
   * **Usernames:**
     1. `@AlphaApex_Momentum` (+842.6% | Rank 1) — Maximum Convexity Momentum Chaser
     2. `@GammaWhale_Squeeze` (+614.2% | Rank 2) — High-Gamma Short Squeeze & Volatility Breakout
     3. `@ContrarianKing_100x` (+528.9% | Rank 3) — Deep OTM Tail Event Hunter
     4. `@YieldVulture_Arb` (+382.4% | Rank 4) — Aggressive Expiry Sweeper
     5. `@FedPivotSniper` (+312.0% | Rank 5) — FOMC Rate Decision & Macro Liquidity Maximizer
     6. `@VolatilityArb_MM` (+248.5% | Rank 6) — High-Spread Liquidity Harvester (AMM)
     7. `@TrendRide_FullTilt` (+185.3% | Rank 7) — Trend-Following Pyramider
     8. `@EventCatalyst_Max` (+142.1% | Rank 8) — Single-Stock Regulatory & Earnings Frontrunner
   * Each strategy features:
     * Full trading rules and sizing specifications.
     * Analytical post-mortem ("Why It Worked" / "Why It Experienced Drawdowns").
     * Quantitative return attribution breakdown.
     * Complete historical trade journal.
     * Interactive 52-week vector equity curve.

5. **1-Year Competition Memory Engine**:
   * 52-week calendar tracking with simulation time controllers (+1 week, +4 weeks, jump to week 52).
   * Market regime stress tester (Bull Momentum, High Volatility, Macro Shock, Sideways Chop).
   * Persistent browser memory (`localStorage`) with full state JSON and CSV trade exports.

6. **Interactive Paper Trading Terminal**:
   * Live event markets: S&P 500, Nvidia, Tesla, Fed 50bps Cut, Apple, CPI Inflation, Bitcoin, Nasdaq-100.
   * Real-time DOM ladder with live depth bars.
   * Interactive order execution ticket with instant VWAP and slippage estimates.

---

## 🚀 Quick Start & Installation

### 1. Run the Development Server
```bash
# Clone the repository
git clone https://github.com/buffedlizard55-lab/KalshiPaperSim.git
cd KalshiPaperSim

# Start the server (binds to 0.0.0.0:3000)
npm start
```
Open your browser at `http://localhost:3000`.

### 2. Run the Verification Test Suite
```bash
npm test
```
All unit tests verify reciprocal order book formulas, multi-tier slippage calculations, portfolio accounting, and memory serialization.

### 3. Deploying to GitHub Pages
The project is pre-configured for GitHub Pages:
* Push to your repository.
* Go to **Settings** > **Pages**.
* Under **Branch**, select `main` (or `gh-pages`) and choose `/docs` (or `/root`).
* Save and view your live site at `https://<username>.github.io/KalshiPaperSim/`.

---

## 📁 Repository Structure

```
KalshiPaperSim/
├── index.html                   # Root entry point for web app & GitHub Pages
├── docs/                        # Static distribution mirror for GitHub Pages
│   ├── index.html
│   └── src/
├── src/
│   ├── kalshi-api.js            # Kalshi API client, catalog, and reciprocal book parser
│   ├── simulation-engine.js     # OrderBook, AMM, slippage calculation, and PaperPortfolio
│   ├── strategies.js            # 8 aggressive strategy profiles, attribution, and journals
│   ├── competition-memory.js    # 1-year competition state manager, persistence, JSON/CSV exports
│   ├── ui.js                    # UI controller, DOM ladder, modals, and vector equity curves
│   ├── app.js                   # Main application wiring and market tick loop
│   └── styles.css               # Modern dark-mode terminal stylesheet
├── server.js                    # Node.js dev server with CORS enabled (0.0.0.0:3000)
├── test/
│   └── simulation.test.js       # Comprehensive unit tests (node --test)
├── build.js                     # Sync build script for docs/ folder
├── package.json                 # Project configuration and test scripts
├── VERIFICATION.md              # Line-by-line verification against official sources
└── README.md                    # Project documentation
```

---

## 🔍 Official Verified Trusted Sources

| Source | Resource Description | Verified Link |
| :--- | :--- | :--- |
| **Kalshi** | Official Exchange Website | [kalshi.com](https://kalshi.com) |
| **Kalshi Docs** | Official API Reference & Endpoints | [docs.kalshi.com](https://docs.kalshi.com/) |
| **Kalshi Orderbook** | Orderbook Responses & Reciprocal Pricing | [Orderbook Guide](https://docs.kalshi.com/getting_started/orderbook_responses) |
| **CFTC** | Binary Event Contract Rule Filings | [cftc.gov](https://www.cftc.gov/) |
| **TradingView** | The Leap Paper Trading Competition | [TradingView The Leap](https://www.tradingview.com/the-leap/) |
| **Trade-Ideas** | Portfolio Master Challenge & Leaderboard | [Trade-Ideas PMC](https://www.trade-ideas.com/pmc/) |
| **Candlecharts** | Contest & Paper Trading Rules | [Candlecharts Contest](https://specials.candlecharts.com/contest/) |

---

## 🛠️ Suggestions for Future Work & Project Limitations

### Identified Limitations:
1. **Cloudflare WAF / TLS Handshake Restrictions**:
   * Direct server-side HTTP connections from cloud datacenter IP ranges to `api.elections.kalshi.com` are blocked during TLS handshake (`SSL_ERROR_SYSCALL`).
   * *Mitigation implemented:* Client-side hybrid model with automatic fallback to high-fidelity synchronized Kalshi market catalog and local AMM simulation.
2. **CORS Restrictions on Browser Direct REST Calls**:
   * Standard browser security blocks cross-origin fetch from GitHub Pages to Kalshi API unless an authenticated proxy or browser extension is used.
3. **Binary Outcome Settlement Lag**:
   * Real event contracts require external resolution sources (e.g. BLS CPI release, S&P Dow Jones official close). The simulator models these through scheduled settlement triggers.

### Recommended Next Steps for Future Sessions:
1. **WebSocket Real-Time Feed Integration**:
   * Add support for Kalshi's WebSocket API (`wss://api.elections.kalshi.com/trade-api/ws/v2`) for live order book level-2 streaming.
2. **Backtesting Replay Engine**:
   * Ingest historical 1-minute candlestick data via `/markets/{ticker}/candlesticks` to allow historic replay of past market years.
3. **Multi-User Multiplayer Mode**:
   * Add a backend database (PostgreSQL / SQLite) allowing multiple human participants to register unique usernames and compete against the 8 algorithmic strategies.
4. **Custom Strategy Scripting Sandboxing**:
   * Provide an in-browser code editor allowing users to write custom JavaScript / Python trading algorithms and backtest them across the 1-year competition dataset.

---

## ⚖️ License
MIT License. Developed for research, testing, and algorithmic trading simulation.
