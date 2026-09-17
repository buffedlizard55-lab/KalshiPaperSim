/**
 * KalshiPaperSim — Candlestick Backtest / Replay Engine
 * =====================================================================
 * Replays REAL Kalshi candlestick history and computes strategy performance
 * from actual fills. No performance number in this project is invented: every
 * return, win rate, drawdown and profit factor is computed here.
 *
 * DATA SOURCE (verified endpoint):
 *   GET /series/{series_ticker}/markets/{ticker}/candlesticks
 *       ?start_ts=&end_ts=&period_interval={1|60|1440}
 *   Schema: https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *   Each MarketCandlestick has:
 *     end_period_ts, volume_fp, open_interest_fp,
 *     price.{open,high,low,close,mean,previous}_dollars,
 *     yes_bid.{open,high,low,close}_dollars,
 *     yes_ask.{open,high,low,close}_dollars
 *
 * RETENTION LIMIT (verified): the live candlestick endpoint only serves data
 * newer than the historical cutoff; older data requires
 *   GET /historical/markets/{ticker}/candlesticks
 * Live cutoff captured 2026-09-17: market_settled_ts = 2026-07-19T00:00:00Z
 * "The target window for live data is 3 months."
 *   https://docs.kalshi.com/getting_started/historical_data
 * => A full 52-week replay of REAL data therefore requires multiple historical
 *    fetches. See IRREGULARITIES.md #5 and README "Limitations".
 *
 * BOOK CONSTRUCTION: for each candle we rebuild an order book whose touch
 * matches the candle's REAL yes_bid.close / yes_ask.close. Because Kalshi only
 * publishes bids, the best NO bid is set to notional - yes_ask so that the
 * implied YES ask reproduces the observed ask exactly. Depth BEHIND the touch
 * is modelled (labelled SIMULATED) because candlesticks do not carry depth.
 */

import { OrderBook, PaperPortfolio, round2, round6, clamp, mulberry32, seedFromString } from './simulation-engine.js';
import { dollarsToNumber, snapToGrid, resolvePriceGrid } from './price-grid.js';
import { computeKalshiFee } from './kalshi-fees.js';
import { seriesFeeConfig } from './verified-snapshot.js';

/** Parse one raw Kalshi candlestick into plain numbers. */
export function parseCandle(c) {
  const d = (obj, k) => (obj && obj[k] !== undefined ? dollarsToNumber(obj[k]) : null);
  return {
    endTs: Number(c.end_period_ts),
    endDate: new Date(Number(c.end_period_ts) * 1000).toISOString(),
    volume: dollarsToNumber(c.volume_fp) ?? 0,
    openInterest: dollarsToNumber(c.open_interest_fp) ?? 0,
    trade: {
      open: d(c.price, 'open_dollars'),
      high: d(c.price, 'high_dollars'),
      low: d(c.price, 'low_dollars'),
      close: d(c.price, 'close_dollars'),
      mean: d(c.price, 'mean_dollars'),
      previous: d(c.price, 'previous_dollars')
    },
    yesBid: {
      open: d(c.yes_bid, 'open_dollars'),
      high: d(c.yes_bid, 'high_dollars'),
      low: d(c.yes_bid, 'low_dollars'),
      close: d(c.yes_bid, 'close_dollars')
    },
    yesAsk: {
      open: d(c.yes_ask, 'open_dollars'),
      high: d(c.yes_ask, 'high_dollars'),
      low: d(c.yes_ask, 'low_dollars'),
      close: d(c.yes_ask, 'close_dollars')
    },
    raw: c
  };
}

/**
 * A candle can omit OHLC entirely when nothing traded in the period
 * (verified in the real capture: {"price":{"previous_dollars":"0.0300"}} with
 * volume_fp "0.00"). Fill gaps from the previous close so replays stay honest.
 */
export function normalizeCandles(rawCandles) {
  // Accept a bare array OR a capture object ({ticker, candlesticks, _provenance})
  // — both shapes exist in this repository's verified data, and silently
  // returning [] for the wrong shape would look like "no trades, 0% return".
  const list = Array.isArray(rawCandles)
    ? rawCandles
    : Array.isArray(rawCandles?.candlesticks)
      ? rawCandles.candlesticks
      : null;
  if (list === null) {
    if (rawCandles === undefined || rawCandles === null) return [];
    throw new Error('normalizeCandles: expected an array of candlesticks or a capture object with a candlesticks[] field');
  }
  const parsed = list.map(parseCandle).sort((a, b) => a.endTs - b.endTs);
  let lastClose = null;
  for (const c of parsed) {
    if (c.trade.close === null) c.trade.close = lastClose;
    if (c.trade.open === null) c.trade.open = c.trade.close;
    if (c.trade.high === null) c.trade.high = c.trade.close;
    if (c.trade.low === null) c.trade.low = c.trade.close;
    if (c.trade.mean === null) c.trade.mean = c.trade.close;
    if (c.yesBid.close === null) c.yesBid.close = c.trade.close;
    if (c.yesAsk.close === null) c.yesAsk.close = c.trade.close !== null ? round6(1 - c.trade.close) : null;
    c.noTrade = (c.volume ?? 0) === 0;
    if (c.trade.close !== null) lastClose = c.trade.close;
  }
  return parsed.filter((c) => c.trade.close !== null);
}

/**
 * Build an OrderBook whose touch reproduces a candle's real quoted bid/ask.
 * @param {object} market  normalized market (needs ticker, price_ranges, series)
 * @param {object} candle  parsed candle
 * @param {object} [opts]  { depthScale, seed, feeMultiplier, notional }
 */
export function bookFromCandle(market, candle, opts = {}) {
  if (!market || !market.ticker) {
    throw new Error('bookFromCandle: a normalized market object with a ticker is required');
  }
  if (!candle || typeof candle !== 'object' || !candle.trade || !candle.yesBid || !candle.yesAsk) {
    throw new Error(
      'bookFromCandle: expected a NORMALIZED candle ({trade, yesBid, yesAsk, endTs}) — call normalizeCandles() on the raw capture first'
    );
  }
  const notional = opts.notional ?? market.notional_value ?? 1.0;
  const grid = resolvePriceGrid(market.price_ranges?.length ? market.price_ranges : market.price_level_structure);
  const tick = Math.min(...grid.map((b) => b.step));

  const yesBid = candle.yesBid.close !== null ? snapToGrid(candle.yesBid.close, grid, 'down') : null;
  const yesAsk = candle.yesAsk.close !== null ? snapToGrid(candle.yesAsk.close, grid, 'up') : null;

  // Kalshi publishes bids only: best NO bid = notional - YES ask.
  const noBid = yesAsk !== null ? clamp(round6(notional - yesAsk), tick, notional - tick) : null;
  const mid = yesBid !== null && yesAsk !== null ? round6((yesBid + yesAsk) / 2) : candle.trade.close ?? 0.5;

  const book = new OrderBook(market.ticker, {
    midPrice: mid ?? 0.5,
    priceRanges: market.price_ranges,
    priceLevelStructure: market.price_level_structure,
    notional,
    // Fee config is resolved PER SERIES from the captured Series objects — never
    // assumed. KXBTCY legitimately has fee_multiplier 0 (zero fees), while
    // KXNASDAQ100Y has fee_multiplier 1 with quadratic_with_maker_fees.
    feeMultiplier: opts.feeMultiplier ?? market.fee_multiplier ?? seriesFeeConfig(market.series_ticker).fee_multiplier,
    feeType: market.fee_type || seriesFeeConfig(market.series_ticker).fee_type,
    exhaustionPolicy: opts.exhaustionPolicy || 'partial',
    spread: yesBid !== null && yesAsk !== null ? Math.max(tick, round6(yesAsk - yesBid)) : 2 * tick,
    depthScale: opts.depthScale ?? 1,
    seed: opts.seed ?? seedFromString(`${market.ticker}:${candle.endTs}`),
    source: opts.source || market.source || 'replay'
  });

  if (yesBid !== null) book.anchorTouch('yes', yesBid, opts.topSize ?? 2500);
  if (noBid !== null) book.anchorTouch('no', noBid, opts.topSize ?? 2500);
  return book;
}

/**
 * Replay engine: runs one or more strategies over candlestick history.
 */
export class ReplayEngine {
  /**
   * @param {object} options
   * @param {Array}  options.markets      normalized markets (>=1)
   * @param {Object} options.candlesByTicker  { ticker: [rawCandlestick,...] }
   * @param {number} [options.initialCapital=100000]
   * @param {number|null} [options.feeMultiplier=null]
   *        null (default) => resolve the multiplier PER SERIES from the captured
   *        Series objects (KXBTCY = 0, KXNASDAQ100Y = 1). Passing a number
   *        overrides every market and is only for controlled experiments.
   * @param {boolean}[options.settleAtEnd=false] resolve final positions at $1/$0
   * @param {'YES'|'NO'}[options.finalResult]    required when settleAtEnd
   */
  constructor(options) {
    if (!options || typeof options !== 'object') {
      throw new Error('ReplayEngine: an options object is required');
    }
    this.markets = options.markets || [];
    if (!Array.isArray(this.markets) || this.markets.length === 0) {
      throw new Error('ReplayEngine: at least one market is required');
    }
    this.candlesByTicker = options.candlesByTicker || {};
    this.initialCapital = options.initialCapital ?? 100000;
    this.feeMultiplier = options.feeMultiplier ?? null; // null => per-series resolution
    /**
     * 'partial' (default): orders bigger than all visible depth fill only what
     * exists; the remainder is reported as UNFILLED. No price is invented.
     * 'penalty': legacy stress mode that fills the remainder 5 ticks beyond the
     * last level. Not real exchange behaviour — used only for stress tests.
     */
    this.exhaustionPolicy = options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial';
    this.settleAtEnd = Boolean(options.settleAtEnd);
    this.finalResult = options.finalResult || null;
    this.notional = options.notional ?? 1.0;

    /**
     * PER-MARKET CAPITAL ALLOCATION (recommended-work item #7).
     *
     * null (the competition default) = no cap: the brief is "highest return
     * only", so every strategy may put the whole account into one market.
     * A number (0.25 = 25% of equity) caps the notional any single market may
     * hold — positions, plus resting orders that could fill — so the same
     * strategies can be measured with and without concentration limits.
     *
     * The cap NEVER invents a fill: it reduces the order size before execution.
     * Whatever it refuses to trade is counted and reported, exactly like an
     * unfilled remainder.
     */
    this.maxNotionalPerMarketPct = options.maxNotionalPerMarketPct ?? null;

    /** Normalized, time-merged timeline across all markets. */
    this.timeline = this._buildTimeline();
    if (this.timeline.length === 0) {
      // Refuse rather than silently reporting 0%: an empty replay would look
      // like a strategy that traded nothing and broke even.
      throw new Error(
        `ReplayEngine: no candlestick data for ${this.markets.map((m) => m.ticker).join(', ')} — cannot replay an empty timeline`
      );
    }
  }

  _buildTimeline() {
    const rows = [];
    for (const market of this.markets) {
      const candles = normalizeCandles(this.candlesByTicker[market.ticker] || []);
      candles.forEach((candle, i) => rows.push({ market, candle, indexInSeries: i, seriesLength: candles.length }));
    }
    rows.sort((a, b) => a.candle.endTs - b.candle.endTs || a.market.ticker.localeCompare(b.market.ticker));
    return rows;
  }

  get periodCount() {
    const stamps = new Set(this.timeline.map((r) => r.candle.endTs));
    return stamps.size;
  }

  /**
   * Run a strategy over the timeline.
   * @param {object} strategy  must expose decide(ctx) -> Array<action>
   * @param {object} [opts]    { username, capital, seed, verbose }
   * @returns {object} computed result (stats + equity curve + trade log)
   */
  run(strategy, opts = {}) {
    if (!strategy || typeof strategy.decide !== 'function') {
      throw new Error('ReplayEngine.run: a strategy exposing decide(ctx) is required');
    }
    const username = opts.username || strategy.username || 'strategy';
    const capital = opts.capital ?? this.initialCapital;
    const portfolio = new PaperPortfolio(username, capital, {
      feeMultiplier: this.feeMultiplier,
      notional: this.notional
    });

    const history = {}; // ticker -> parsed candles seen so far
    const books = {};   // ticker -> PERSISTENT OrderBook (resting orders survive)
    const equityCurve = [];
    const periodLog = [];
    const actionsLog = [];
    let lastTs = null;

    // One book per market for the whole replay, so resting maker orders persist
    // across periods exactly as they would on a live exchange.
    for (const market of this.markets) {
      const first = normalizeCandles(this.candlesByTicker[market.ticker] || [])[0];
      books[market.ticker] = bookFromCandle(market, first || { trade: { close: 0.5 }, yesBid: { close: 0.49 }, yesAsk: { close: 0.51 }, endTs: 0 }, {
        feeMultiplier: this.feeMultiplier,
        exhaustionPolicy: this.exhaustionPolicy,
        notional: this.notional,
        seed: (opts.seed ?? 12345) + market.ticker.length
      });
    }

    for (const row of this.timeline) {
      const { market, candle } = row;
      const t = market.ticker;
      history[t] = history[t] || [];
      history[t].push(candle);

      // Move the persistent book to this period's REAL quoted touch.
      books[t].applyQuotes({
        yesBid: candle.yesBid.close,
        yesAsk: candle.yesAsk.close,
        mid: candle.trade.close,
        topSize: opts.topSize ?? 2500
      });

      // Mark all open positions to this period's real closing quotes.
      const priceMap = {};
      for (const [key, pos] of portfolio.positions.entries()) {
        const h = history[pos.ticker];
        const last = h ? h[h.length - 1] : null;
        if (last) {
          priceMap[key] = pos.side === 'YES' ? last.trade.close : round6(this.notional - (last.trade.close ?? 0));
        }
      }
      portfolio.markToMarket(priceMap);

      // Settle resting maker orders using THIS market's REAL traded range.
      // (Each book is processed on its own market's period, so a NO-side or
      //  cross-market order is never matched against the wrong price series.)
      for (const fill of books[t].processRestingFills({ low: candle.trade.low, high: candle.trade.high })) {
        portfolio.applyMakerFill(fill, { strategy: username });
      }

      const ctx = {
        strategy,
        username,
        portfolio,
        stats: portfolio.updateEquity(),
        market,
        ticker: t,
        candle,
        history: history[t],
        historyAll: history,
        books,
        book: books[t],
        allMarkets: this.markets,
        periodIndex: row.indexInSeries,
        periodCount: row.seriesLength,
        timestamp: candle.endTs,
        date: candle.endDate,
        isLast: row.indexInSeries === row.seriesLength - 1,
        helpers: { round2, round6, clamp, computeKalshiFee, snapToGrid, mulberry32 }
      };

      let actions = [];
      try {
        actions = strategy.decide(ctx) || [];
      } catch (err) {
        actionsLog.push({ period: candle.endTs, ticker: t, error: String(err && err.message ? err.message : err) });
      }
      if (!Array.isArray(actions)) actions = [actions];

      for (const action of actions) {
        if (!action || !action.type) continue;
        const outcome = this._applyAction(action, ctx, portfolio, books);
        if (outcome) {
          actionsLog.push({
            period: candle.endTs,
            date: candle.endDate,
            ticker: t,
            ...summarizeAction(action),
            result: outcome.status,
            ...(outcome.detail || {})
          });
        }
      }

      if (lastTs !== candle.endTs) {
        lastTs = candle.endTs;
        const s = portfolio.updateEquity();
        equityCurve.push({ ts: candle.endTs, date: candle.endDate, equity: s.equity, returnPct: s.returnPct, trades: s.totalTrades, drawdownPct: s.maxDrawdownPct });
        periodLog.push({ ts: candle.endTs, date: candle.endDate, stats: s });
      }
    }

    /**
     * Land the equity curve on the FINAL equity.
     *
     * The timeline is ordered by (timestamp, ticker), so the last timestamp can
     * cover several markets: the curve point pushed mid-loop is written when the
     * first market of that timestamp is processed and can pre-date the last
     * market's marks and fills. Without this correction the curve would end
     * somewhere other than finalEquity (it did — by $9,086.73 on a two-market
     * universe), which would make every headline number disagree with the chart.
     */
    const finalRow = this.timeline[this.timeline.length - 1];
    const finalStats = portfolio.updateEquity();
    const finalPoint = {
      ts: finalRow.candle.endTs,
      date: finalRow.candle.endDate,
      equity: finalStats.equity,
      returnPct: finalStats.returnPct,
      trades: finalStats.totalTrades,
      drawdownPct: finalStats.maxDrawdownPct
    };
    if (equityCurve.length > 0 && equityCurve[equityCurve.length - 1].ts === finalPoint.ts) {
      equityCurve[equityCurve.length - 1] = finalPoint;
    } else {
      equityCurve.push(finalPoint);
    }
    const lastTsFinal = finalPoint.ts;

    // Final settlement (optional) — pays notional for winners, $0 for losers.
    let settlementDetail = null;
    if (this.settleAtEnd && this.finalResult) {
      const settled = [];
      for (const market of this.markets) {
        const outcome = this.finalResult[market.ticker] || this.finalResult;
        if (outcome === 'YES' || outcome === 'NO') {
          settled.push(...portfolio.settleMarket(market.ticker, outcome, { notional: this.notional }));
        }
      }
      settlementDetail = settled;
      const s = portfolio.updateEquity();
      equityCurve.push({ ts: lastTsFinal, date: 'SETTLEMENT', equity: s.equity, returnPct: s.returnPct, trades: s.totalTrades, drawdownPct: s.maxDrawdownPct, settlement: true });
    }

    const stats = portfolio.updateEquity();
    return {
      strategyId: strategy.id || username,
      username,
      strategyTitle: strategy.title || '',
      initialCapital: capital,
      dataProvenance: {
        markets: this.markets.map((m) => ({ ticker: m.ticker, source: m.source, source_url: m.source_url || m._provenance?.url || null })),
        candleCounts: Object.fromEntries(Object.entries(this.candlesByTicker).map(([k, v]) => [k, (v || []).length])),
        note: 'Performance is COMPUTED from fills against real captured candlestick quotes. Depth behind the touch is modelled and labelled SIMULATED.',
        exhaustionPolicy: this.exhaustionPolicy,
        exhaustionPolicyNote: this.exhaustionPolicy === 'partial'
          ? 'Orders larger than all modelled depth fill only what exists; the remainder is reported as UNFILLED. No execution price is invented.'
          : 'STRESS MODE: the unfilled remainder is executed at an invented price 5 ticks beyond the last level. Not real exchange behaviour.'
      },
      periods: this.periodCount,
      exhaustionPolicy: this.exhaustionPolicy,
      unfilledOrders: portfolio.unfilledOrders || 0,
      unfilledContracts: portfolio.unfilledContracts || 0,
      // Per-market capital allocation (item #7): how much the cap refused.
      maxNotionalPerMarketPct: this.maxNotionalPerMarketPct,
      cappedOrders: portfolio.cappedOrders || 0,
      cappedContracts: portfolio.cappedContracts || 0,
      stats,
      finalEquity: stats.equity,
      returnPct: stats.returnPct,
      totalTrades: stats.totalTrades,
      winRate: stats.winRate,
      profitFactor: stats.profitFactor === Infinity ? null : stats.profitFactor,
      maxDrawdownPct: stats.maxDrawdownPct,
      feesPaid: stats.feesPaid,
      realizedPnl: stats.realizedPnl,
      equityCurve,
      tradeLog: portfolio.tradeHistory.slice().reverse(),
      actionLog: actionsLog,
      settlements: settlementDetail || portfolio.settlements,
      positionsOpen: [...portfolio.positions.values()],
      portfolio
    };
  }

  /** Notional already committed to one market: open positions + resting orders. */
  _marketExposure(ticker, portfolio, books) {
    let notional = 0;
    for (const pos of portfolio.positions.values()) {
      if (pos.ticker !== ticker) continue;
      notional += Number(pos.count || 0) * Number(pos.currentPrice || 0);
    }
    for (const o of books[ticker]?.restingOrders || []) {
      notional += Number(o.count || 0) * Number(o.price || 0);
    }
    return notional;
  }

  /**
   * Scale an order down to the per-market cap, if one is configured.
   * @returns {{count:number, capped:boolean, cappedFrom:number, headroom:number|null, capPct:number|null}}
   */
  _applyMarketCap(requestedCount, price, ticker, ctx, books) {
    const capPct = this.maxNotionalPerMarketPct;
    if (!capPct || !(requestedCount > 0)) return { count: requestedCount, capped: false, cappedFrom: requestedCount, headroom: null, capPct: capPct ?? null };
    const equity = Number(ctx.stats?.equity ?? ctx.portfolio.cash ?? 0);
    const cap = capPct * equity;
    const headroom = cap - this._marketExposure(ticker, ctx.portfolio, books);
    if (!(headroom > 0) || !(price > 0)) return { count: 0, capped: true, cappedFrom: requestedCount, headroom: Math.max(0, headroom), capPct };
    // Floor to the cent of a contract — never round a capped size UP.
    const allowed = Math.floor((headroom / price) * 100) / 100;
    if (requestedCount <= allowed) return { count: requestedCount, capped: false, cappedFrom: requestedCount, headroom, capPct };
    return { count: allowed, capped: true, cappedFrom: requestedCount, headroom, capPct };
  }

  /** Execute one strategy action against the paper portfolio. */
  _applyAction(action, ctx, portfolio, books) {
    const ticker = action.ticker || ctx.ticker;
    const book = books[ticker] || ctx.book;
    if (!book) return { status: 'no_book' };
    const side = String(action.side || 'YES').toLowerCase();
    const count = round2(Number(action.count || 0));
    const capPct = this.maxNotionalPerMarketPct;

    try {
      switch (String(action.type).toLowerCase()) {
        case 'buy':
        case 'market_buy': {
          if (count <= 0) return { status: 'skipped_zero_size' };
          const touch = side === 'yes' ? book.getBestYesAsk() : book.getBestNoAsk();
          const cap = this._applyMarketCap(count, touch ?? 0.5, ticker, ctx, books);
          if (cap.count <= 0) {
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + count);
            return { status: 'capped_no_headroom', detail: { requested: count, capPct, capReason: 'per-market capital limit reached' } };
          }
          const exec = portfolio.buyPosition(book, side, cap.count, { strategy: ctx.username, note: action.reason || '' });
          if (cap.capped) {
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + (count - cap.count));
          }
          const status = exec.fillStatus === 'unfilled' ? 'unfilled_no_depth' : exec.fillStatus === 'partial' ? 'partial_fill' : 'filled';
          return { status, detail: { requested: exec.requested, contracts: exec.contracts, unfilled: exec.unfilled, vwap: exec.vwap, fee: exec.fee, slippage: exec.slippage, totalCost: exec.totalCost, bookExhausted: exec.bookExhausted, capped: cap.capped, cappedFrom: cap.capped ? cap.cappedFrom : undefined, capPct: cap.capped ? capPct : undefined } };
        }
        case 'sell':
        case 'market_sell': {
          if (count <= 0) return { status: 'skipped_zero_size' };
          const exec = portfolio.sellPosition(book, side, count, { strategy: ctx.username, note: action.reason || '' });
          const status = exec.fillStatus === 'unfilled' ? 'unfilled_no_depth' : exec.fillStatus === 'partial' ? 'partial_fill' : 'filled';
          return { status, detail: { requested: exec.requested, contracts: exec.contracts, unfilled: exec.unfilled, vwap: exec.vwap, fee: exec.fee, realizedPnl: exec.realizedPnl } };
        }
        case 'limit':
        case 'limit_order': {
          if (count <= 0) return { status: 'skipped_zero_size' };
          const limitPrice = action.price ?? (action.direction === 'ask' ? book.getBestYesAsk() : book.getBestYesBid());
          const cap = this._applyMarketCap(count, limitPrice ?? 0.5, ticker, ctx, books);
          if (cap.count <= 0) {
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + count);
            return { status: 'capped_no_headroom', detail: { requested: count, capPct, capReason: 'per-market capital limit reached' } };
          }
          const order = book.placeLimitOrder({
            side: action.direction || 'bid',
            outcome: side,
            count: cap.count,
            price: limitPrice
          });
          if (cap.capped) {
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + (count - cap.count));
          }
          return { status: 'resting', detail: { orderId: order.orderId, price: order.price, queueAhead: order.queuePositionAhead, onGrid: order.onGrid, capped: cap.capped, cappedFrom: cap.capped ? cap.cappedFrom : undefined, capPct: cap.capped ? capPct : undefined } };
        }
        case 'cancel': {
          const r = book.cancelOrder(action.orderId);
          return { status: r.cancelled ? 'cancelled' : 'cancel_failed', detail: { orderId: action.orderId } };
        }
        case 'quote': {
          // Two-sided market making: rest a bid and an ask around the touch.
          if (action.cancelExisting) {
            for (const o of book.restingOrders.map((x) => x.orderId)) book.cancelOrder(o);
          }
          const spreadTicks = Number(action.spreadTicks || 2);
          const mid = book.getMid();
          const bidPx = snapToGrid(mid - spreadTicks * book.tick, book.grid, 'down');
          const askPx = snapToGrid(mid + spreadTicks * book.tick, book.grid, 'up');
          let qty = round2(Number(action.count || count || 100));
          if (!(qty > 0) || !(bidPx >= book.tick) || !(askPx <= book.notional - book.tick)) {
            return { status: 'quote_skipped', detail: { bidPx, askPx, qty } };
          }
          // A two-sided quote can fill on EITHER side, so both count against the
          // per-market cap — otherwise a market maker could be 2x over it.
          const cap = this._applyMarketCap(qty * 2, askPx ?? 0.5, ticker, ctx, books);
          let quoteCapped = false;
          let qtyRequested = qty;
          if (cap.count <= 0) {
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + qty * 2);
            return { status: 'capped_no_headroom', detail: { requested: qty * 2, capPct, capReason: 'per-market capital limit reached' } };
          }
          if (cap.capped) {
            quoteCapped = true;
            qty = Math.floor((cap.count / 2) * 100) / 100;
            ctx.portfolio.cappedOrders = (ctx.portfolio.cappedOrders || 0) + 1;
            ctx.portfolio.cappedContracts = round2((ctx.portfolio.cappedContracts || 0) + (qtyRequested * 2 - cap.count));
          }
          const bid = book.placeLimitOrder({ side: 'bid', outcome: side, count: qty, price: bidPx });
          const ask = book.placeLimitOrder({ side: 'ask', outcome: side, count: qty, price: askPx });
          return { status: 'quoting', detail: { bidPrice: bid.price, askPrice: ask.price, qty, bidOrderId: bid.orderId, askOrderId: ask.orderId, queueAhead: bid.queuePositionAhead, capped: quoteCapped, cappedFrom: quoteCapped ? qtyRequested * 2 : undefined, capPct: quoteCapped ? capPct : undefined } };
        }
        case 'hold':
        default:
          return { status: 'hold' };
      }
    } catch (err) {
      return { status: 'rejected', detail: { error: String(err && err.message ? err.message : err) } };
    }
  }
}

function summarizeAction(action) {
  return {
    type: action.type,
    side: action.side || null,
    count: action.count ?? null,
    price: action.price ?? null,
    reason: action.reason || ''
  };
}

/**
 * Compute drawdown series + additional risk/return analytics from an equity curve.
 * Used by the analysis module to explain WHAT drove the computed result.
 */
export function analyzeEquityCurve(equityCurve, initialCapital = 100000) {
  if (!equityCurve || equityCurve.length === 0) {
    return { periods: 0, totalReturnPct: 0, maxDrawdownPct: 0, peak: initialCapital, trough: initialCapital, worstPeriodPct: 0, bestPeriodPct: 0 };
  }
  let peak = -Infinity;
  let maxDD = 0;
  let maxDDDate = null;
  let best = -Infinity;
  let worst = Infinity;
  let bestDate = null;
  let worstDate = null;

  for (let i = 0; i < equityCurve.length; i++) {
    const eq = equityCurve[i].equity;
    if (eq > peak) peak = eq;
    const dd = peak > 0 ? ((peak - eq) / peak) * 100 : 0;
    if (dd > maxDD) {
      maxDD = dd;
      maxDDDate = equityCurve[i].date;
    }
    if (i > 0) {
      const prev = equityCurve[i - 1].equity;
      const chg = prev > 0 ? ((eq - prev) / prev) * 100 : 0;
      if (chg > best) { best = chg; bestDate = equityCurve[i].date; }
      if (chg < worst) { worst = chg; worstDate = equityCurve[i].date; }
    }
  }
  const finalEquity = equityCurve[equityCurve.length - 1].equity;
  return {
    periods: equityCurve.length,
    initialCapital,
    finalEquity,
    totalReturnPct: initialCapital > 0 ? ((finalEquity - initialCapital) / initialCapital) * 100 : 0,
    peakEquity: peak,
    maxDrawdownPct: maxDD,
    maxDrawdownDate: maxDDDate,
    bestPeriodPct: best === -Infinity ? 0 : best,
    bestPeriodDate: bestDate,
    worstPeriodPct: worst === Infinity ? 0 : worst,
    worstPeriodDate: worstDate
  };
}
