import test from 'node:test';
import assert from 'node:assert/strict';

import { OFFICIAL_MARKET_CATALOG, parseKalshiOrderbook } from '../src/kalshi-api.js';
import { OrderBook, PaperPortfolio } from '../src/simulation-engine.js';
import { STRATEGIES_DATA } from '../src/strategies.js';
import { CompetitionMemoryEngine } from '../src/competition-memory.js';

test('1. Kalshi Reciprocal Order Book Parsing & Formulas', () => {
  const sampleMarket = OFFICIAL_MARKET_CATALOG[0]; // S&P 500 contract
  const parsed = parseKalshiOrderbook(sampleMarket.orderbook_fp);

  assert.ok(parsed.bestYesBid > 0, 'Must have valid YES bid');
  assert.ok(parsed.bestNoBid > 0, 'Must have valid NO bid');
  assert.equal(typeof parsed.bestYesAsk, 'number', 'Implied YES ask must be a number');
  assert.equal(typeof parsed.bestNoAsk, 'number', 'Implied NO ask must be a number');

  // Verify Kalshi Reciprocal Theorem: Implied YES Ask = 1.00 - Best NO Bid
  const expectedYesAsk = parseFloat((1.00 - parsed.bestNoBid).toFixed(4));
  assert.equal(parsed.bestYesAsk, expectedYesAsk, 'Implied YES Ask must equal 1.00 - Best NO Bid');

  // Verify Implied NO Ask = 1.00 - Best YES Bid
  const expectedNoAsk = parseFloat((1.00 - parsed.bestYesBid).toFixed(4));
  assert.equal(parsed.bestNoAsk, expectedNoAsk, 'Implied NO Ask must equal 1.00 - Best YES Bid');

  // Verify Positive Spread
  assert.ok(parsed.yesSpread > 0, 'Spread must be positive');
});

test('2. Multi-tier Order Book Walking & Slippage Calculation', () => {
  const book = new OrderBook('TEST-TICKER', 0.50, { spread: 0.04 });
  const bestAsk = book.getBestYesAsk();

  // Buy a small quantity (within level 1)
  const smallBuy = book.executeMarketBuy('YES', 500);
  assert.equal(smallBuy.contracts, 500);
  assert.equal(smallBuy.vwap, bestAsk, 'Small order at level 1 should execute at best ask');
  assert.equal(smallBuy.slippage, 0, 'No slippage for small order within level 1');

  // Buy a massive quantity that sweeps multiple book tiers
  const largeBuy = book.executeMarketBuy('YES', 15000);
  assert.equal(largeBuy.contracts, 15000);
  assert.ok(largeBuy.fills.length > 1, 'Large order must fill across multiple tiers');
  assert.ok(largeBuy.vwap >= bestAsk, 'VWAP must be at least best ask');
  assert.ok(largeBuy.slippage >= 0, 'Slippage must be non-negative');
});

test('3. Paper Portfolio Trading & Accounting', () => {
  const portfolio = new PaperPortfolio('TestUser', 100000);
  const book = new OrderBook('TEST-STOCK', 0.40);

  assert.equal(portfolio.cash, 100000);
  assert.equal(portfolio.totalTrades, 0);

  // Buy 1,000 contracts
  const execution = portfolio.buyPosition(book, 'YES', 1000);
  assert.equal(portfolio.totalTrades, 1);
  assert.ok(portfolio.cash < 100000, 'Cash must decrease by order cost + fee');
  assert.equal(portfolio.positions.get('TEST-STOCK_YES').count, 1000);

  // Sell 500 contracts
  const sellRecord = portfolio.sellPosition(book, 'YES', 500);
  assert.equal(sellRecord.contracts, 500);
  assert.equal(portfolio.positions.get('TEST-STOCK_YES').count, 500);
  assert.equal(typeof sellRecord.realizedPnl, 'number');
});

test('4. Binary Contract Settlement Logic ($1.00 vs $0.00)', () => {
  const portfolio = new PaperPortfolio('WinnerBot', 10000);
  const book = new OrderBook('EVENT-CAT', 0.20);

  // Buy 1,000 YES contracts at roughly 22¢ each
  portfolio.buyPosition(book, 'YES', 1000);
  const invested = 10000 - portfolio.cash;

  // Settle YES: Every contract pays $1.00 ($1,000 total)
  const settlements = portfolio.settleMarket('EVENT-CAT', 'YES');
  assert.equal(settlements.length, 1);
  assert.equal(settlements[0].payout, 1000.00, '1000 winning contracts must pay $1,000.00');
  assert.ok(portfolio.cash > 10000, 'Winning settlement must increase total cash above starting capital');
  assert.ok(portfolio.totalRealizedPnl > 0, 'Realized PnL must be positive on winning settlement');
});

test('5. Verify 8 High-Return Strategies & Unique Usernames', () => {
  assert.equal(STRATEGIES_DATA.length, 8, 'Must have exactly 8 strategies');

  const usernames = new Set();
  for (const s of STRATEGIES_DATA) {
    assert.ok(s.username, 'Strategy must have unique username');
    assert.ok(!usernames.has(s.username), `Username ${s.username} must be unique`);
    usernames.add(s.username);

    // Verify requirements:
    // "Usernames/strategies should not focus on risk management, but should aim for the highest returns."
    assert.ok(s.returnPct > 100, `Strategy ${s.username} must target high returns (>100%)`);
    assert.ok(s.whyItWorked && s.whyItWorked.length > 50, `Strategy ${s.username} must include explanation on why it worked`);
    assert.ok(s.returnAttribution && s.returnAttribution.length >= 2, `Strategy ${s.username} must have return attribution analysis`);
    assert.ok(s.tradeHistory && s.tradeHistory.length > 0, `Strategy ${s.username} must have trade history`);
    assert.ok(s.equityCurve && s.equityCurve.length > 0, `Strategy ${s.username} must have 1-year equity curve`);
  }
});

test('6. 1-Year Competition Memory, Export & Import', () => {
  const memory = new CompetitionMemoryEngine();
  const lb = memory.getLeaderboard();

  assert.ok(lb.length >= 8, 'Leaderboard must contain strategies');
  assert.equal(lb[0].rank, 1, 'Top strategy must be rank 1');
  assert.ok(lb[0].returnPct >= lb[1].returnPct, 'Leaderboard must be sorted descending by highest return %');

  // Verify memory JSON export
  const jsonExport = memory.exportMemoryJSON();
  assert.ok(jsonExport.includes('KALSHI-CHAMPIONSHIP'), 'Export must contain competition ID');

  // Verify CSV export
  const csvExport = memory.exportTradesCSV();
  assert.ok(csvExport.includes('CompetitionId,Strategy,TradeId'), 'CSV export must include trade headers');

  // Verify advancing simulation
  const initialWeek = memory.state.currentWeek;
  const advance = memory.advanceSimulation(2);
  assert.equal(memory.state.currentWeek, initialWeek + 2, 'Simulation must advance weeks');
});
