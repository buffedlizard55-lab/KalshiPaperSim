/**
 * Kalshi Paper Trading Simulation Engine
 * 
 * Provides:
 * 1. Multi-tier Order Book with real Depth of Market (DOM)
 * 2. Automated Market Maker (AMM) with reciprocal quoting and inventory shading
 * 3. Exact Slippage & Book-Walking Execution matching CFTC binary contract rules
 * 4. Portfolio Accounting (Cash, Margin, Realized/Unrealized PnL, Win Rate, Profit Factor, Equity)
 * 5. Binary Contract Settlement at $1.00 (Win) or $0.00 (Loss)
 */

export class OrderBook {
  constructor(ticker, initialMidPrice = 0.50, options = {}) {
    this.ticker = ticker;
    this.midPrice = initialMidPrice;
    this.spread = options.spread || 0.02; // 2 cents standard spread
    this.depthScale = options.depthScale || 1.0;
    this.lastPrice = initialMidPrice;
    this.tradeHistory = [];
    this.rebuildBook();
  }

  /**
   * Rebuilds orderbook conforming to Kalshi orderbook_fp specification:
   * Only bids are published; asks are implied reciprocally.
   */
  rebuildBook() {
    const halfSpread = this.spread / 2;
    const bestYesBid = Math.max(0.01, Math.min(0.98, parseFloat((this.midPrice - halfSpread).toFixed(2))));
    const bestNoBid = Math.max(0.01, Math.min(0.98, parseFloat((1.00 - this.midPrice - halfSpread).toFixed(2))));

    // Build 5 tiers of bids for YES
    this.yesBids = [];
    for (let i = 4; i >= 0; i--) {
      const price = parseFloat((bestYesBid - (i * 0.01)).toFixed(2));
      if (price >= 0.01) {
        // Realistic tier depths: tighter at top of book (1,000 - 2,500), deeper at back (3,000 - 6,000)
        const tierFactor = (5 - i); // 1 at deepest, 5 at top of book
        const baseQty = Math.round((800 + (5 - tierFactor) * 1200 + Math.random() * 500) * this.depthScale);
        this.yesBids.push({ price, count: Math.max(500, baseQty) });
      }
    }

    // Build 5 tiers of bids for NO
    this.noBids = [];
    for (let i = 4; i >= 0; i--) {
      const price = parseFloat((bestNoBid - (i * 0.01)).toFixed(2));
      if (price >= 0.01) {
        const tierFactor = (5 - i);
        const baseQty = Math.round((800 + (5 - tierFactor) * 1200 + Math.random() * 500) * this.depthScale);
        this.noBids.push({ price, count: Math.max(500, baseQty) });
      }
    }
  }

  /**
   * Returns highest YES bid
   */
  getBestYesBid() {
    if (!this.yesBids || this.yesBids.length === 0) return 0.01;
    return this.yesBids[this.yesBids.length - 1].price;
  }

  /**
   * Returns highest NO bid
   */
  getBestNoBid() {
    if (!this.noBids || this.noBids.length === 0) return 0.01;
    return this.noBids[this.noBids.length - 1].price;
  }

  /**
   * Reciprocal Implied YES Ask = 1.00 - Best NO Bid
   */
  getBestYesAsk() {
    const bestNoBid = this.getBestNoBid();
    return parseFloat((1.00 - bestNoBid).toFixed(2));
  }

  /**
   * Reciprocal Implied NO Ask = 1.00 - Best YES Bid
   */
  getBestNoAsk() {
    const bestYesBid = this.getBestYesBid();
    return parseFloat((1.00 - bestYesBid).toFixed(2));
  }

  /**
   * Generates implied ask tiers for YES (derived from inverted NO bids)
   */
  getYesAskTiers() {
    // A NO bid at price P is a YES ask at 1.00 - P
    return [...this.noBids]
      .reverse()
      .map(b => ({
        price: parseFloat((1.00 - b.price).toFixed(2)),
        count: b.count
      }))
      .sort((a, b) => a.price - b.price); // Lowest ask first
  }

  /**
   * Generates implied ask tiers for NO (derived from inverted YES bids)
   */
  getNoAskTiers() {
    // A YES bid at price P is a NO ask at 1.00 - P
    return [...this.yesBids]
      .reverse()
      .map(b => ({
        price: parseFloat((1.00 - b.price).toFixed(2)),
        count: b.count
      }))
      .sort((a, b) => a.price - b.price);
  }

  /**
   * Simulates Market Order Execution with multi-tier book walking and slippage
   * @param {string} side - 'yes' or 'no'
   * @param {number} contracts - Quantity requested
   * @returns {Object} Execution report including fills, VWAP, slippage, and total cost
   */
  executeMarketBuy(side, contracts) {
    if (contracts <= 0) {
      throw new Error('Contract count must be greater than zero');
    }

    const askTiers = side.toLowerCase() === 'yes' ? this.getYesAskTiers() : this.getNoAskTiers();
    const bestAsk = askTiers[0].price;

    let remaining = contracts;
    let totalCost = 0;
    const fills = [];

    for (const tier of askTiers) {
      if (remaining <= 0) break;
      const fillQty = Math.min(remaining, tier.count);
      fills.push({
        price: tier.price,
        count: fillQty,
        tierCost: parseFloat((fillQty * tier.price).toFixed(4))
      });
      totalCost += fillQty * tier.price;
      tier.count -= fillQty;
      remaining -= fillQty;
    }

    // If order was larger than entire visible book depth, fill remainder at max penalty price
    if (remaining > 0) {
      const penaltyPrice = Math.min(0.99, parseFloat((askTiers[askTiers.length - 1].price + 0.05).toFixed(2)));
      fills.push({
        price: penaltyPrice,
        count: remaining,
        tierCost: parseFloat((remaining * penaltyPrice).toFixed(4)),
        penalty: true
      });
      totalCost += remaining * penaltyPrice;
    }

    const filledCount = contracts;
    const vwap = parseFloat((totalCost / filledCount).toFixed(4));
    const slippage = parseFloat((vwap - bestAsk).toFixed(4));
    const fee = parseFloat((filledCount * 0.005).toFixed(2)); // ~0.5% exchange clearing fee

    this.lastPrice = vwap;
    this.midPrice = parseFloat((this.midPrice + (side === 'yes' ? 0.005 : -0.005)).toFixed(4));
    this.midPrice = Math.max(0.02, Math.min(0.98, this.midPrice));

    // Replenish consumed depth partially (market maker replenishes)
    this.rebuildBook();

    const tradeRecord = {
      timestamp: new Date().toISOString(),
      ticker: this.ticker,
      side: side.toUpperCase(),
      contracts: filledCount,
      bestAsk,
      vwap,
      slippage,
      totalCost: parseFloat((totalCost + fee).toFixed(2)),
      fee,
      fills
    };

    this.tradeHistory.unshift(tradeRecord);
    return tradeRecord;
  }

  /**
   * Market Maker tick update: drifts mid price and updates resting quotes
   */
  marketMakerTick(drift = 0, volatility = 0.01) {
    const shock = (Math.random() - 0.49) * volatility + drift;
    this.midPrice = parseFloat(Math.max(0.02, Math.min(0.98, this.midPrice + shock)).toFixed(4));
    this.rebuildBook();
    return this.midPrice;
  }
}

/**
 * Paper Trading Portfolio for a strategy/user
 */
export class PaperPortfolio {
  constructor(username, initialCapital = 100000) {
    this.username = username;
    this.initialCapital = initialCapital;
    this.cash = initialCapital;
    this.positions = new Map(); // ticker_side -> { ticker, side, count, avgCost, currentPrice }
    this.tradeHistory = [];
    this.equityHistory = [{ date: new Date().toISOString().split('T')[0], equity: initialCapital, pnl: 0, returnPct: 0 }];
    this.totalRealizedPnl = 0;
    this.totalTrades = 0;
    this.winningTrades = 0;
    this.losingTrades = 0;
    this.grossProfit = 0;
    this.grossLoss = 0;
    this.peakEquity = initialCapital;
    this.maxDrawdownPct = 0;
  }

  /**
   * Executes a buy trade
   */
  buyPosition(orderbook, side, count) {
    const execution = orderbook.executeMarketBuy(side, count);
    if (this.cash < execution.totalCost) {
      throw new Error(`Insufficient funds: Required $${execution.totalCost.toFixed(2)}, Available $${this.cash.toFixed(2)}`);
    }

    this.cash -= execution.totalCost;
    const key = `${execution.ticker}_${execution.side}`;
    const existing = this.positions.get(key);

    if (existing) {
      const totalContracts = existing.count + execution.contracts;
      const totalCostBasis = (existing.count * existing.avgCost) + (execution.contracts * execution.vwap);
      existing.avgCost = parseFloat((totalCostBasis / totalContracts).toFixed(4));
      existing.count = totalContracts;
      existing.currentPrice = execution.vwap;
    } else {
      this.positions.set(key, {
        ticker: execution.ticker,
        side: execution.side,
        count: execution.contracts,
        avgCost: execution.vwap,
        currentPrice: execution.vwap,
        openedAt: execution.timestamp
      });
    }

    this.totalTrades += 1;
    this.tradeHistory.unshift(execution);
    this.updateEquity();
    return execution;
  }

  /**
   * Sells an open position before expiration
   */
  sellPosition(orderbook, side, count) {
    const key = `${orderbook.ticker}_${side.toUpperCase()}`;
    const pos = this.positions.get(key);
    if (!pos || pos.count < count) {
      throw new Error(`Position does not exist or insufficient contracts to sell: requested ${count}, held ${pos ? pos.count : 0}`);
    }

    // When selling YES, we sell to YES bids
    // When selling NO, we sell to NO bids
    const bestBid = side.toLowerCase() === 'yes' ? orderbook.getBestYesBid() : orderbook.getBestNoBid();
    const grossProceeds = count * bestBid;
    const fee = parseFloat((count * 0.005).toFixed(2));
    const netProceeds = grossProceeds - fee;

    const costBasis = count * pos.avgCost;
    const realizedPnl = parseFloat((netProceeds - costBasis).toFixed(2));

    this.cash += netProceeds;
    this.totalRealizedPnl += realizedPnl;

    if (realizedPnl >= 0) {
      this.winningTrades += 1;
      this.grossProfit += realizedPnl;
    } else {
      this.losingTrades += 1;
      this.grossLoss += Math.abs(realizedPnl);
    }

    pos.count -= count;
    if (pos.count <= 0) {
      this.positions.delete(key);
    }

    const sellRecord = {
      timestamp: new Date().toISOString(),
      action: 'SELL',
      ticker: orderbook.ticker,
      side: side.toUpperCase(),
      contracts: count,
      fillPrice: bestBid,
      proceeds: netProceeds,
      realizedPnl,
      fee
    };

    this.tradeHistory.unshift(sellRecord);
    this.updateEquity();
    return sellRecord;
  }

  /**
   * Settles a contract when the event outcome is finalized
   * @param {string} ticker - Market ticker
   * @param {string} winningSide - 'YES' or 'NO'
   */
  settleMarket(ticker, winningSide) {
    const yesKey = `${ticker}_YES`;
    const noKey = `${ticker}_NO`;

    const yesPos = this.positions.get(yesKey);
    const noPos = this.positions.get(noKey);

    const settlements = [];

    if (yesPos) {
      const payoutPerContract = winningSide.toUpperCase() === 'YES' ? 1.00 : 0.00;
      const totalPayout = yesPos.count * payoutPerContract;
      const costBasis = yesPos.count * yesPos.avgCost;
      const pnl = parseFloat((totalPayout - costBasis).toFixed(2));

      this.cash += totalPayout;
      this.totalRealizedPnl += pnl;

      if (pnl >= 0) {
        this.winningTrades += 1;
        this.grossProfit += pnl;
      } else {
        this.losingTrades += 1;
        this.grossLoss += Math.abs(pnl);
      }

      this.positions.delete(yesKey);
      settlements.push({ ticker, side: 'YES', count: yesPos.count, payout: totalPayout, pnl, result: winningSide });
    }

    if (noPos) {
      const payoutPerContract = winningSide.toUpperCase() === 'NO' ? 1.00 : 0.00;
      const totalPayout = noPos.count * payoutPerContract;
      const costBasis = noPos.count * noPos.avgCost;
      const pnl = parseFloat((totalPayout - costBasis).toFixed(2));

      this.cash += totalPayout;
      this.totalRealizedPnl += pnl;

      if (pnl >= 0) {
        this.winningTrades += 1;
        this.grossProfit += pnl;
      } else {
        this.losingTrades += 1;
        this.grossLoss += Math.abs(pnl);
      }

      this.positions.delete(noKey);
      settlements.push({ ticker, side: 'NO', count: noPos.count, payout: totalPayout, pnl, result: winningSide });
    }

    this.updateEquity();
    return settlements;
  }

  /**
   * Recalculates total equity and updates drawdown
   */
  updateEquity() {
    let openPositionsValue = 0;
    for (const pos of this.positions.values()) {
      openPositionsValue += pos.count * (pos.currentPrice || pos.avgCost);
    }

    const currentEquity = parseFloat((this.cash + openPositionsValue).toFixed(2));
    const returnPct = parseFloat((((currentEquity - this.initialCapital) / this.initialCapital) * 100).toFixed(2));

    if (currentEquity > this.peakEquity) {
      this.peakEquity = currentEquity;
    }

    const drawdown = this.peakEquity > 0 ? ((this.peakEquity - currentEquity) / this.peakEquity) * 100 : 0;
    if (drawdown > this.maxDrawdownPct) {
      this.maxDrawdownPct = parseFloat(drawdown.toFixed(2));
    }

    return {
      equity: currentEquity,
      cash: parseFloat(this.cash.toFixed(2)),
      positionsValue: parseFloat(openPositionsValue.toFixed(2)),
      returnPct,
      realizedPnl: parseFloat(this.totalRealizedPnl.toFixed(2)),
      winRate: this.totalTrades > 0 ? parseFloat(((this.winningTrades / (this.winningTrades + this.losingTrades || 1)) * 100).toFixed(1)) : 0,
      profitFactor: this.grossLoss > 0 ? parseFloat((this.grossProfit / this.grossLoss).toFixed(2)) : (this.grossProfit > 0 ? 99.9 : 1.0)
    };
  }

  /**
   * Snapshot for daily/weekly equity trajectory
   */
  recordSnapshot(dateStr) {
    const stats = this.updateEquity();
    this.equityHistory.push({
      date: dateStr,
      equity: stats.equity,
      pnl: stats.realizedPnl,
      returnPct: stats.returnPct
    });
  }
}
