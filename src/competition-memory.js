/**
 * Kalshi Competition Memory & State Engine
 * 
 * Manages:
 * - 1-Year Competition Lifecycle (Week 1 to Week 52)
 * - Persistent memory storage via localStorage / in-memory cache
 * - Simulation time advancing, market regime shifts, and strategy evaluation
 * - Full JSON/CSV Export and Import for future testing and evaluation
 */

import { STRATEGIES_DATA } from './strategies.js';
import { OFFICIAL_MARKET_CATALOG } from './kalshi-api.js';

const STORAGE_KEY = 'KALSHI_COMPETITION_MEMORY_V1';

export class CompetitionMemoryEngine {
  constructor() {
    this.state = this.loadInitialState();
  }

  /**
   * Loads state from localStorage or initializes default 1-year championship
   */
  loadInitialState() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.strategies && parsed.strategies.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }

    return this.createDefaultCompetitionState();
  }

  /**
   * Creates a fresh 1-year competition state
   */
  createDefaultCompetitionState(year = '2026-2027') {
    return {
      competitionId: `KALSHI-CHAMPIONSHIP-${year}`,
      title: `Kalshi Annual Paper Championship (${year})`,
      durationDays: 365,
      currentWeek: 35,
      totalWeeks: 52,
      startDate: '2026-01-05',
      endDate: '2027-01-04',
      currentDate: '2026-09-17',
      regime: 'Bull Momentum & Tech Squeeze',
      markets: JSON.parse(JSON.stringify(OFFICIAL_MARKET_CATALOG)),
      strategies: JSON.parse(JSON.stringify(STRATEGIES_DATA)),
      userTrader: {
        username: 'Guest_Challenger',
        rank: 9,
        startingCapital: 100000,
        currentEquity: 100000,
        cash: 100000,
        realizedPnl: 0,
        returnPct: 0.0,
        winRate: 0.0,
        totalTrades: 0,
        positions: [],
        tradeHistory: [],
        equityCurve: [{ week: 0, date: '2026-01-05', equity: 100000 }]
      },
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Saves current state to localStorage
   */
  save() {
    this.state.lastUpdated = new Date().toISOString();
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      }
    } catch {
      // Storage unavailable or quota exceeded
    }
  }

  /**
   * Resets competition with specified settings
   */
  reset(options = {}) {
    const year = options.year || '2026-2027';
    this.state = this.createDefaultCompetitionState(year);
    if (options.regime) {
      this.state.regime = options.regime;
    }
    this.save();
    return this.state;
  }

  /**
   * Get all ranked participants including user trader
   */
  getLeaderboard() {
    const list = [...this.state.strategies];
    if (this.state.userTrader) {
      list.push({
        id: 'user_challenger',
        username: this.state.userTrader.username,
        avatar: '👤',
        title: 'Discretionary Paper Trader',
        category: 'Discretionary / Manual',
        returnPct: this.state.userTrader.returnPct,
        currentEquity: this.state.userTrader.currentEquity,
        realizedPnl: this.state.userTrader.realizedPnl,
        winRate: this.state.userTrader.winRate,
        totalTrades: this.state.userTrader.totalTrades,
        profitFactor: this.state.userTrader.totalTrades > 0 ? 1.5 : 1.0,
        bestTrade: 0,
        maxDrawdownPct: 0,
        status: 'USER_ACCOUNT',
        thesis: 'Interactive manual paper trading against live Kalshi order books and liquidity pools.',
        whyItWorked: 'Dynamic discretionary execution based on real-time market opportunities.',
        whyItExperiencedDrawdowns: 'Execution slippage and binary contract timing volatility.',
        returnAttribution: [
          { factor: 'Manual Execution & Timing', contributionPct: 100, description: 'Discretionary trades placed via terminal.' }
        ],
        tradeHistory: this.state.userTrader.tradeHistory,
        equityCurve: this.state.userTrader.equityCurve
      });
    }

    // Sort descending by highest return % (pure alpha focus)
    list.sort((a, b) => b.returnPct - a.returnPct);

    // Assign rank
    return list.map((item, idx) => ({ ...item, rank: idx + 1 }));
  }

  /**
   * Advance simulation time (e.g. 1 week or 1 month)
   */
  advanceSimulation(weeks = 1, regime = null) {
    if (this.state.currentWeek >= this.state.totalWeeks) {
      return { completed: true, message: 'Competition has reached 1-year conclusion (Week 52).' };
    }

    const newWeek = Math.min(this.state.totalWeeks, this.state.currentWeek + weeks);
    this.state.currentWeek = newWeek;
    if (regime) this.state.regime = regime;

    // Simulate incremental trade activity and price drift for strategies
    for (const strat of this.state.strategies) {
      const volatility = strat.category.includes('Convexity') ? 0.08 : 0.03;
      const alphaDrift = Math.random() * 0.06 - 0.015;
      const weekReturn = (alphaDrift * (strat.returnPct / 100 + 1));
      const equityDelta = Math.round(strat.startingCapital * weekReturn);
      strat.currentEquity = Math.max(10000, strat.currentEquity + equityDelta);
      strat.realizedPnl = strat.currentEquity - strat.startingCapital;
      strat.returnPct = parseFloat((((strat.currentEquity - strat.startingCapital) / strat.startingCapital) * 100).toFixed(1));

      // Append equity curve point
      strat.equityCurve.push({
        week: newWeek,
        date: `Week ${newWeek}`,
        equity: strat.currentEquity
      });
    }

    this.save();
    return { completed: newWeek >= this.state.totalWeeks, currentWeek: newWeek };
  }

  /**
   * Record a user execution in state
   */
  recordUserTrade(execution) {
    if (!this.state.userTrader) return;
    const u = this.state.userTrader;
    u.cash -= execution.totalCost;
    u.totalTrades += 1;
    u.tradeHistory.unshift(execution);

    // Update equity
    u.currentEquity = parseFloat((u.cash).toFixed(2));
    u.realizedPnl = parseFloat((u.currentEquity - u.startingCapital).toFixed(2));
    u.returnPct = parseFloat((((u.currentEquity - u.startingCapital) / u.startingCapital) * 100).toFixed(2));

    u.equityCurve.push({
      week: this.state.currentWeek,
      date: new Date().toISOString().split('T')[0],
      equity: u.currentEquity
    });

    this.save();
  }

  /**
   * Export all data as JSON
   */
  exportMemoryJSON() {
    return JSON.stringify(this.state, null, 2);
  }

  /**
   * Export all trade histories across all strategies as CSV
   */
  exportTradesCSV() {
    const headers = ['CompetitionId', 'Strategy', 'TradeId', 'Date', 'Ticker', 'Side', 'Contracts', 'FillPrice', 'Cost', 'Outcome', 'RealizedPnL', 'Notes'];
    const rows = [headers.join(',')];

    for (const strat of this.state.strategies) {
      if (strat.tradeHistory) {
        for (const t of strat.tradeHistory) {
          rows.push([
            `"${this.state.competitionId}"`,
            `"${strat.username}"`,
            `"${t.id || ''}"`,
            `"${t.date || ''}"`,
            `"${t.ticker || ''}"`,
            `"${t.side || ''}"`,
            t.count || t.contracts || 0,
            t.fillPrice || 0,
            t.cost || 0,
            `"${t.outcome || ''}"`,
            t.pnl || 0,
            `"${(t.note || '').replace(/"/g, '""')}"`
          ].join(','));
        }
      }
    }

    return rows.join('\n');
  }

  /**
   * Import memory JSON
   */
  importMemoryJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && parsed.competitionId && parsed.strategies) {
        this.state = parsed;
        this.save();
        return { success: true };
      }
      return { success: false, error: 'Invalid competition schema' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
