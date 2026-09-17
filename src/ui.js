/**
 * UI Controller & Rendering Engine for KalshiPaperSim
 */

import { parseKalshiOrderbook } from './kalshi-api.js';

export class UIController {
  constructor(app) {
    this.app = app;
    this.activeStrategyId = null;
    this.selectedSide = 'YES';
    this.initEventListeners();
  }

  initEventListeners() {
    // Navigation tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetId = e.currentTarget.getAttribute('data-tab');
        this.switchTab(targetId);
      });
    });

    // Market selector
    const marketSelect = document.getElementById('marketSelect');
    if (marketSelect) {
      marketSelect.addEventListener('change', (e) => {
        this.app.selectMarket(e.target.value);
      });
    }

    // Side buttons (YES / NO)
    const btnYes = document.getElementById('btnSideYes');
    const btnNo = document.getElementById('btnSideNo');
    if (btnYes && btnNo) {
      btnYes.addEventListener('click', () => this.setOrderSide('YES'));
      btnNo.addEventListener('click', () => this.setOrderSide('NO'));
    }

    // Contract quantity input
    const contractsInput = document.getElementById('orderContracts');
    if (contractsInput) {
      contractsInput.addEventListener('input', () => this.updateOrderTicketCalculations());
    }

    // Place trade button
    const btnPlaceOrder = document.getElementById('btnPlaceOrder');
    if (btnPlaceOrder) {
      btnPlaceOrder.addEventListener('click', () => this.handlePlaceOrder());
    }

    // Modal close button & backdrop
    const modalClose = document.getElementById('modalCloseBtn');
    const modalOverlay = document.getElementById('strategyModal');
    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeStrategyModal());
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) this.closeStrategyModal();
      });
    }

    // Modal internal tabs
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pane = e.currentTarget.getAttribute('data-pane');
        this.switchModalPane(pane);
      });
    });

    // Simulation advance buttons
    const btnAdv1W = document.getElementById('btnAdv1W');
    const btnAdv4W = document.getElementById('btnAdv4W');
    const btnAdvFull = document.getElementById('btnAdvFull');
    if (btnAdv1W) btnAdv1W.addEventListener('click', () => this.app.advanceSimulation(1));
    if (btnAdv4W) btnAdv4W.addEventListener('click', () => this.app.advanceSimulation(4));
    if (btnAdvFull) btnAdvFull.addEventListener('click', () => this.app.advanceSimulation(17));

    // Regime selector
    const regimeSelect = document.getElementById('regimeSelect');
    if (regimeSelect) {
      regimeSelect.addEventListener('change', (e) => {
        this.app.setRegime(e.target.value);
      });
    }

    // Export & Import buttons
    const btnExportJSON = document.getElementById('btnExportJSON');
    const btnExportCSV = document.getElementById('btnExportCSV');
    const btnResetComp = document.getElementById('btnResetComp');
    if (btnExportJSON) btnExportJSON.addEventListener('click', () => this.downloadJSON());
    if (btnExportCSV) btnExportCSV.addEventListener('click', () => this.downloadCSV());
    if (btnResetComp) btnResetComp.addEventListener('click', () => {
      if (confirm('Reset the 1-year paper trading competition to Week 1?')) {
        this.app.resetCompetition();
      }
    });
  }

  switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const panel = document.getElementById(tabId);
    if (btn && panel) {
      btn.classList.add('active');
      panel.classList.add('active');
    }
  }

  setOrderSide(side) {
    this.selectedSide = side;
    const btnYes = document.getElementById('btnSideYes');
    const btnNo = document.getElementById('btnSideNo');
    if (side === 'YES') {
      btnYes.classList.add('active');
      btnNo.classList.remove('active');
    } else {
      btnNo.classList.add('active');
      btnYes.classList.remove('active');
    }
    this.updateOrderTicketCalculations();
  }

  renderLeaderboard(leaderboardData) {
    const tbody = document.getElementById('leaderboardBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    leaderboardData.forEach(item => {
      const tr = document.createElement('tr');
      const rankClass = item.rank === 1 ? 'rank-1' : item.rank === 2 ? 'rank-2' : item.rank === 3 ? 'rank-3' : 'rank-default';
      const returnClass = item.returnPct >= 0 ? 'val-green' : 'val-red';

      tr.innerHTML = `
        <td><span class="rank-badge ${rankClass}">#${item.rank}</span></td>
        <td>
          <div class="user-cell">
            <div class="user-avatar">${item.avatar || '🤖'}</div>
            <div>
              <div class="username-tag">@${item.username}</div>
              <div class="strat-title">${item.title}</div>
            </div>
          </div>
        </td>
        <td><span class="category-pill">${item.category}</span></td>
        <td class="return-badge ${returnClass}">+${item.returnPct.toFixed(1)}%</td>
        <td class="num-mono">$${Math.round(item.currentEquity).toLocaleString()}</td>
        <td class="num-mono ${returnClass}">+$${Math.round(item.realizedPnl).toLocaleString()}</td>
        <td class="num-mono">${item.winRate.toFixed(1)}%</td>
        <td class="num-mono">${item.profitFactor.toFixed(2)}</td>
        <td class="num-mono">-${item.maxDrawdownPct ? item.maxDrawdownPct.toFixed(1) : '0.0'}%</td>
        <td>
          <button class="btn btn-secondary btn-sm inspect-strat-btn" data-id="${item.id || item.username}">
            Inspect Strategy & Analysis
          </button>
        </td>
      `;

      tr.querySelector('.inspect-strat-btn').addEventListener('click', () => {
        this.openStrategyModal(item);
      });

      tbody.appendChild(tr);
    });

    // Update hero banner metrics
    const top = leaderboardData[0];
    if (top) {
      const heroTop = document.getElementById('heroTopTrader');
      const heroReturn = document.getElementById('heroTopReturn');
      if (heroTop) heroTop.textContent = `@${top.username}`;
      if (heroReturn) heroReturn.textContent = `+${top.returnPct.toFixed(1)}%`;
    }
  }

  renderMarketDetails(market, orderbookObj) {
    const titleEl = document.getElementById('activeMarketTitle');
    const tickerEl = document.getElementById('activeMarketTicker');
    const expEl = document.getElementById('activeMarketExpiry');
    const volEl = document.getElementById('activeMarketVolume');

    if (titleEl) titleEl.textContent = market.title;
    if (tickerEl) tickerEl.textContent = market.ticker;
    if (expEl) expEl.textContent = new Date(market.expiration_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    if (volEl) volEl.textContent = market.volume.toLocaleString();

    // Render Orderbook DOM
    const parsed = parseKalshiOrderbook(orderbookObj);
    const tbody = document.getElementById('orderbookDomBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    // Kalshi Reciprocal Order Book View:
    // Ask YES is derived from NO bids: Ask = 1 - Bid(NO)
    const askPrice = parsed.bestYesAsk !== null ? (parsed.bestYesAsk * 100).toFixed(0) : '--';
    const bidPrice = parsed.bestYesBid !== null ? (parsed.bestYesBid * 100).toFixed(0) : '--';
    const spread = (parsed.yesSpread !== null) ? `${(parsed.yesSpread * 100).toFixed(0)}¢` : '--';

    const spreadRow = document.createElement('tr');
    spreadRow.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    spreadRow.innerHTML = `
      <td colspan="4" style="text-align: center; font-size: 0.72rem; color: var(--gold-rank); font-weight: 700; padding: 0.3rem;">
        SPREAD: ${spread} | RECIPROCAL KALSHI AMM DEPTH
      </td>
    `;

    // Render 3 ask tiers (inverted from NO bids)
    if (parsed.noBids && parsed.noBids.length > 0) {
      const askTiers = [...parsed.noBids].reverse().slice(0, 3).map(b => ({
        price: parseFloat((1.00 - b.price).toFixed(2)),
        count: b.count
      })).reverse();

      askTiers.forEach(tier => {
        const tr = document.createElement('tr');
        tr.className = 'dom-row-ask';
        tr.innerHTML = `
          <td><span style="color: var(--red-loss); font-weight: 700;">ASK (YES)</span></td>
          <td style="color: var(--red-loss);">${(tier.price * 100).toFixed(0)}¢ ($${tier.price.toFixed(2)})</td>
          <td>${tier.count.toLocaleString()}</td>
          <td><div class="depth-bar-container"><div class="depth-bar-fill-ask" style="width: ${Math.min(100, tier.count / 300)}%;"></div></div></td>
        `;
        tbody.appendChild(tr);
      });
    }

    tbody.appendChild(spreadRow);

    // Render 3 bid tiers
    if (parsed.yesBids && parsed.yesBids.length > 0) {
      const topBids = [...parsed.yesBids].slice(-3).reverse();
      topBids.forEach(tier => {
        const tr = document.createElement('tr');
        tr.className = 'dom-row-bid';
        tr.innerHTML = `
          <td><span style="color: var(--green-win); font-weight: 700;">BID (YES)</span></td>
          <td style="color: var(--green-win);">${(tier.price * 100).toFixed(0)}¢ ($${tier.price.toFixed(2)})</td>
          <td>${tier.count.toLocaleString()}</td>
          <td><div class="depth-bar-container"><div class="depth-bar-fill-bid" style="width: ${Math.min(100, tier.count / 300)}%;"></div></div></td>
        `;
        tbody.appendChild(tr);
      });
    }

    this.updateOrderTicketCalculations();
  }

  updateOrderTicketCalculations() {
    const input = document.getElementById('orderContracts');
    const contracts = parseInt(input ? input.value : '1000', 10) || 1000;
    const side = this.selectedSide;

    const book = this.app.activeOrderBook;
    if (!book) return;

    const askTiers = side === 'YES' ? book.getYesAskTiers() : book.getNoAskTiers();
    const bestAsk = askTiers[0].price;

    let remaining = contracts;
    let totalCost = 0;
    for (const tier of askTiers) {
      if (remaining <= 0) break;
      const fillQty = Math.min(remaining, tier.count);
      totalCost += fillQty * tier.price;
      remaining -= fillQty;
    }
    if (remaining > 0) {
      totalCost += remaining * Math.min(0.99, askTiers[askTiers.length - 1].price + 0.05);
    }

    const vwap = totalCost / contracts;
    const slippage = vwap - bestAsk;
    const fee = contracts * 0.005;
    const finalCost = totalCost + fee;
    const maxPayout = contracts * 1.00;
    const netProfit = maxPayout - finalCost;
    const roiPct = (netProfit / finalCost) * 100;

    const elVwap = document.getElementById('calcVwap');
    const elCost = document.getElementById('calcCost');
    const elPayout = document.getElementById('calcPayout');
    const elRoi = document.getElementById('calcRoi');
    const elSlipNotice = document.getElementById('slippageNotice');

    if (elVwap) elVwap.textContent = `${(vwap * 100).toFixed(1)}¢ ($${vwap.toFixed(4)})`;
    if (elCost) elCost.textContent = `$${finalCost.toFixed(2)}`;
    if (elPayout) elPayout.textContent = `$${maxPayout.toFixed(2)}`;
    if (elRoi) {
      elRoi.textContent = `+${roiPct.toFixed(1)}%`;
      elRoi.className = roiPct >= 0 ? 'val-green' : 'val-red';
    }

    if (elSlipNotice) {
      if (slippage > 0.005) {
        elSlipNotice.style.display = 'block';
        elSlipNotice.textContent = `⚠️ High Volume Notice: Consumes multiple book tiers. Slippage impact: +${(slippage * 100).toFixed(1)}¢ per contract.`;
      } else {
        elSlipNotice.style.display = 'none';
      }
    }
  }

  handlePlaceOrder() {
    const input = document.getElementById('orderContracts');
    const contracts = parseInt(input ? input.value : '1000', 10) || 1000;
    const side = this.selectedSide;

    try {
      const execution = this.app.executeUserTrade(side, contracts);
      alert(`Trade Executed!\nBought ${execution.contracts} ${execution.side} contracts at average price ${(execution.vwap * 100).toFixed(1)}¢ ($${execution.vwap.toFixed(4)}).\nTotal Cost: $${execution.totalCost.toFixed(2)} (Slippage: +${(execution.slippage * 100).toFixed(2)}¢).`);
      this.app.refreshUI();
    } catch (err) {
      alert(`Execution Error: ${err.message}`);
    }
  }

  openStrategyModal(strategy) {
    this.activeStrategyId = strategy.id;
    const modal = document.getElementById('strategyModal');
    if (!modal) return;

    document.getElementById('modalStratTitle').textContent = `${strategy.avatar || '🤖'} @${strategy.username} — ${strategy.title}`;
    document.getElementById('modalRankTag').textContent = `RANK #${strategy.rank}`;
    document.getElementById('modalReturnTag').textContent = `+${strategy.returnPct.toFixed(1)}% RETURN`;
    document.getElementById('modalEquityTag').textContent = `$${Math.round(strategy.currentEquity).toLocaleString()} EQUITY`;

    // Pane 1: Thesis & Rules
    document.getElementById('paneThesisContent').innerHTML = `
      <div style="background-color: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); margin-bottom: 1rem; border-left: 4px solid var(--accent-blue);">
        <h4 style="margin-bottom: 0.5rem; color: #60a5fa;">Core Investment Thesis (Highest Returns Focus)</h4>
        <p style="color: var(--text-primary); font-size: 0.92rem; line-height: 1.6;">${strategy.thesis}</p>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;">
        <div style="background-color: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.35rem;">ENTRY TRIGGER</div>
          <div style="font-size: 0.85rem; color: var(--text-primary);">${strategy.rules.entry}</div>
        </div>
        <div style="background-color: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.35rem;">POSITION SIZING (ALL-IN FOCUS)</div>
          <div style="font-size: 0.85rem; color: #34d399; font-weight: 600;">${strategy.rules.sizing}</div>
        </div>
        <div style="background-color: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.35rem;">EXIT / RESOLUTION LOGIC</div>
          <div style="font-size: 0.85rem; color: var(--text-primary);">${strategy.rules.exit}</div>
        </div>
        <div style="background-color: var(--bg-secondary); padding: 1rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <div style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 0.35rem;">RISK MANAGEMENT POLICY</div>
          <div style="font-size: 0.85rem; color: #f87171; font-weight: 600;">${strategy.rules.riskManagement}</div>
        </div>
      </div>
    `;

    // Pane 2: Post-Mortem ("Why It Worked / Why It Failed")
    document.getElementById('panePostMortemContent').innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--green-win); font-size: 1.05rem; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>✅</span> Detailed Post-Mortem: Why It Worked
        </h4>
        <div style="background: rgba(16, 185, 129, 0.08); border-left: 4px solid var(--green-win); padding: 1rem 1.25rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.9rem; color: #d1fae5; line-height: 1.6;">
          ${strategy.whyItWorked}
        </div>
      </div>

      <div>
        <h4 style="color: var(--red-loss); font-size: 1.05rem; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem;">
          <span>⚠️</span> Analysis of Drawdowns & Structural Fragility: Why It Experienced Drawdowns
        </h4>
        <div style="background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--red-loss); padding: 1rem 1.25rem; border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 0.9rem; color: #fee2e2; line-height: 1.6;">
          ${strategy.whyItExperiencedDrawdowns || 'The aggressive position sizing produces high return volatility and steep drawdowns during choppy market regimes.'}
        </div>
      </div>
    `;

    // Pane 3: Return Attribution Breakdown
    const attrContainer = document.getElementById('paneAttributionContent');
    attrContainer.innerHTML = `
      <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.25rem;">
        Attribution model dissecting the source of net returns over the 1-year paper trading championship:
      </p>
    `;
    if (strategy.returnAttribution) {
      strategy.returnAttribution.forEach(attr => {
        const isPos = attr.contributionPct >= 0;
        const barClass = isPos ? 'attribution-fill' : 'attribution-fill-neg';
        const color = isPos ? 'var(--green-win)' : 'var(--red-loss)';
        const el = document.createElement('div');
        el.className = 'attribution-bar-item';
        el.innerHTML = `
          <div class="attribution-header">
            <span style="font-weight: 600; color: var(--text-primary);">${attr.factor}</span>
            <span style="font-family: var(--font-mono); font-weight: 700; color: ${color};">${isPos ? '+' : ''}${attr.contributionPct.toFixed(1)}%</span>
          </div>
          <div class="attribution-track">
            <div class="${barClass}" style="width: ${Math.min(100, Math.abs(attr.contributionPct))}%;"></div>
          </div>
          <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.25rem;">${attr.description}</div>
        `;
        attrContainer.appendChild(el);
      });
    }

    // Pane 4: Executed Trade Journal
    const journalTbody = document.getElementById('paneTradesContent');
    journalTbody.innerHTML = '';
    if (strategy.tradeHistory && strategy.tradeHistory.length > 0) {
      strategy.tradeHistory.forEach(t => {
        const tr = document.createElement('tr');
        const isWin = (t.pnl || 0) >= 0;
        const pnlColor = isWin ? 'val-green' : 'val-red';
        tr.innerHTML = `
          <td>${t.date || '2026'}</td>
          <td style="font-weight: 600; font-family: var(--font-mono);">${t.ticker}</td>
          <td><span class="category-pill">${t.side}</span></td>
          <td class="num-mono">${(t.count || t.contracts || 0).toLocaleString()}</td>
          <td class="num-mono">${t.fillPrice ? `${(t.fillPrice * 100).toFixed(0)}¢` : '--'}</td>
          <td class="num-mono">${t.exitPrice !== undefined ? `${(t.exitPrice * 100).toFixed(0)}¢` : '--'}</td>
          <td class="num-mono ${pnlColor}">${isWin ? '+' : ''}$${Math.round(t.pnl || 0).toLocaleString()}</td>
          <td><span class="category-pill" style="font-size: 0.65rem;">${t.outcome || 'FILLED'}</span></td>
        `;
        journalTbody.appendChild(tr);
      });
    } else {
      journalTbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-muted);">No trades recorded in journal yet.</td></tr>`;
    }

    // Pane 5: Equity Curve SVG
    this.renderEquityCurveSVG(strategy.equityCurve || []);

    modal.classList.add('open');
    this.switchModalPane('thesis');
  }

  closeStrategyModal() {
    const modal = document.getElementById('strategyModal');
    if (modal) modal.classList.remove('open');
  }

  switchModalPane(paneId) {
    document.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.modal-pane').forEach(p => p.style.display = 'none');

    const btn = document.querySelector(`.modal-tab-btn[data-pane="${paneId}"]`);
    const pane = document.getElementById(`modalPane-${paneId}`);
    if (btn && pane) {
      btn.classList.add('active');
      pane.style.display = 'block';
    }
  }

  renderEquityCurveSVG(curveData) {
    const container = document.getElementById('modalEquityCurveContainer');
    if (!container || !curveData || curveData.length < 2) return;

    const width = 800;
    const height = 220;
    const padding = 35;

    const equities = curveData.map(d => d.equity);
    const minVal = Math.min(...equities) * 0.9;
    const maxVal = Math.max(...equities) * 1.1;

    const points = curveData.map((d, idx) => {
      const x = padding + (idx / (curveData.length - 1)) * (width - 2 * padding);
      const y = height - padding - ((d.equity - minVal) / (maxVal - minVal)) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');

    const areaPoints = `${padding},${height - padding} ` + points + ` ${width - padding},${height - padding}`;

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" style="width: 100%; height: 100%; overflow: visible;">
        <defs>
          <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
          </linearGradient>
        </defs>

        <!-- Grid Lines -->
        <line x1="${padding}" y1="${padding}" x2="${width - padding}" y2="${padding}" stroke="#1e293b" stroke-dasharray="4"/>
        <line x1="${padding}" y1="${height / 2}" x2="${width - padding}" y2="${height / 2}" stroke="#1e293b" stroke-dasharray="4"/>
        <line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="#334155"/>

        <!-- Area Fill -->
        <polygon points="${areaPoints}" fill="url(#curveGradient)" />

        <!-- Line -->
        <polyline fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${points}" />

        <!-- Data Labels -->
        <text x="${padding}" y="${padding - 8}" fill="#94a3b8" font-size="11" font-family="monospace">Peak: $${Math.round(maxVal).toLocaleString()}</text>
        <text x="${padding}" y="${height - padding + 20}" fill="#94a3b8" font-size="11" font-family="monospace">Start: $100k</text>
        <text x="${width - padding}" y="${height - padding + 20}" text-anchor="end" fill="#10b981" font-weight="bold" font-size="12" font-family="monospace">Final: $${Math.round(equities[equities.length - 1]).toLocaleString()}</text>
      </svg>
    `;
  }

  downloadJSON() {
    const data = this.app.memory.exportMemoryJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KalshiPaperSim_CompetitionMemory_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadCSV() {
    const csv = this.app.memory.exportTradesCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KalshiPaperSim_TradesJournal_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
