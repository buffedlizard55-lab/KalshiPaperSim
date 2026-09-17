/**
 * Main Application Orchestrator for KalshiPaperSim
 */

import { KalshiApiClient, OFFICIAL_MARKET_CATALOG } from './kalshi-api.js';
import { OrderBook, PaperPortfolio } from './simulation-engine.js';
import { CompetitionMemoryEngine } from './competition-memory.js';
import { UIController } from './ui.js';

export class KalshiPaperSimApp {
  constructor() {
    this.apiClient = new KalshiApiClient();
    this.memory = new CompetitionMemoryEngine();
    this.userPortfolio = new PaperPortfolio('Guest_Challenger', 100000);
    this.markets = OFFICIAL_MARKET_CATALOG;
    this.activeMarket = this.markets[0];
    this.activeOrderBook = new OrderBook(this.activeMarket.ticker, this.activeMarket.last_price);
    
    this.ui = new UIController(this);
    this.tickInterval = null;
  }

  async init() {
    // Populate market selector dropdown
    const select = document.getElementById('marketSelect');
    if (select) {
      select.innerHTML = '';
      this.markets.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.ticker;
        opt.textContent = `${m.ticker} — ${m.title.slice(0, 50)}...`;
        select.appendChild(opt);
      });
      select.value = this.activeMarket.ticker;
    }

    this.refreshUI();
    this.startMarketMakerFeed();
  }

  selectMarket(ticker) {
    const m = this.markets.find(x => x.ticker === ticker);
    if (m) {
      this.activeMarket = m;
      this.activeOrderBook = new OrderBook(m.ticker, m.last_price);
      this.refreshUI();
    }
  }

  executeUserTrade(side, count) {
    const execution = this.userPortfolio.buyPosition(this.activeOrderBook, side, count);
    this.memory.recordUserTrade(execution);
    return execution;
  }

  advanceSimulation(weeks) {
    const result = this.memory.advanceSimulation(weeks);
    const weekEl = document.getElementById('simCurrentWeek');
    if (weekEl) weekEl.textContent = `Week ${this.memory.state.currentWeek} of 52`;
    this.refreshUI();
    if (result.completed) {
      alert('1-Year Paper Trading Championship has concluded! Top strategy awarded championship title.');
    }
  }

  setRegime(regime) {
    this.memory.state.regime = regime;
    this.memory.save();
    const bannerRegime = document.getElementById('activeRegimeText');
    if (bannerRegime) bannerRegime.textContent = regime;
  }

  resetCompetition() {
    this.memory.reset();
    this.refreshUI();
  }

  refreshUI() {
    const lb = this.memory.getLeaderboard();
    this.ui.renderLeaderboard(lb);
    this.ui.renderMarketDetails(this.activeMarket, {
      orderbook_fp: {
        yes_dollars: this.activeOrderBook.yesBids.map(b => [b.price.toFixed(2), b.count.toFixed(0)]),
        no_dollars: this.activeOrderBook.noBids.map(b => [b.price.toFixed(2), b.count.toFixed(0)])
      }
    });

    // Update user summary card
    const userSummary = this.userPortfolio.updateEquity();
    const uCash = document.getElementById('userCashVal');
    const uEquity = document.getElementById('userEquityVal');
    const uTrades = document.getElementById('userTradesVal');
    const uReturn = document.getElementById('userReturnVal');
    if (uCash) uCash.textContent = `$${userSummary.cash.toLocaleString()}`;
    if (uEquity) uEquity.textContent = `$${userSummary.equity.toLocaleString()}`;
    if (uTrades) uTrades.textContent = this.userPortfolio.totalTrades;
    if (uReturn) {
      uReturn.textContent = `${userSummary.returnPct >= 0 ? '+' : ''}${userSummary.returnPct.toFixed(1)}%`;
      uReturn.className = userSummary.returnPct >= 0 ? 'metric-val val-green' : 'metric-val val-red';
    }

    const simWeekEl = document.getElementById('simCurrentWeek');
    if (simWeekEl) simWeekEl.textContent = `Week ${this.memory.state.currentWeek} of 52`;
    const bannerRegime = document.getElementById('activeRegimeText');
    if (bannerRegime) bannerRegime.textContent = this.memory.state.regime;
  }

  startMarketMakerFeed() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    this.tickInterval = setInterval(() => {
      // Small automated market maker tick (continuous 2-sided liquidity)
      this.activeOrderBook.marketMakerTick(0, 0.005);
      this.ui.renderMarketDetails(this.activeMarket, {
        orderbook_fp: {
          yes_dollars: this.activeOrderBook.yesBids.map(b => [b.price.toFixed(2), b.count.toFixed(0)]),
          no_dollars: this.activeOrderBook.noBids.map(b => [b.price.toFixed(2), b.count.toFixed(0)])
        }
      });
    }, 2800);
  }
}

// Global bootstrap
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.app = new KalshiPaperSimApp();
    window.app.init();
  });
}
