/**
 * KalshiPaperSim — Simulation Engine (Order Book, Market Making, Execution, Portfolio)
 * =====================================================================
 * Models Kalshi market mechanics using the VERIFIED rules:
 *
 *  - Reciprocal book: only bids are published; asks are implied.
 *      YES BID @ X  == NO ASK @ (1 - X)
 *      NO  BID @ Y  == YES ASK @ (1 - Y)
 *    https://docs.kalshi.com/getting_started/orderbook_responses
 *
 *  - Binary settlement: winning contracts pay notional_value_dollars (verified
 *    "1.0000" on every captured binary market); losers pay $0.00. There is NO
 *    settlement fee ("There is no settlement fee." — official fee schedule PDF).
 *
 *  - Fees: official quadratic schedule, per fill tier, rounded up so that
 *    fee + positionCost lands on a centicent. See src/kalshi-fees.js.
 *
 *  - Price grid: quotes/orders snap to the market's price_ranges step.
 *    See src/price-grid.js.
 *
 *  - Fractional contracts: minimum granularity 0.01 contracts (verified).
 *    https://docs.kalshi.com/getting_started/fixed_point_migration
 *
 * DETERMINISM: all randomness flows through a seeded PRNG (mulberry32) so a
 * backtest re-run reproduces identical results. Nothing here fabricates
 * performance numbers — PnL is computed from fills.
 *
 * DEPTH CALIBRATION (evidence-based):
 *   The real captured book for KXNASDAQ100Y-26DEC31H1600-T33000 (2026-09-17)
 *   has 9 YES levels and 35 NO levels, with sizes ranging from 3.43 to
 *   100,242.25 contracts and enormous size concentrated at the touch
 *   (100,242.25 YES @ 0.12; 100,076.49 NO @ 0.83). Real Kalshi depth is
 *   sparse and barbell-shaped, NOT a uniform ladder. `buildSyntheticDepth`
 *   reproduces that shape when live depth is unavailable, and is always
 *   labelled SIMULATED in the UI.
 */

import { computeKalshiFee, computeFeeForFills } from './kalshi-fees.js';
import { snapToGrid, tickSizeAt, resolvePriceGrid, minTick, dollarsToNumber } from './price-grid.js';
import { parseKalshiOrderbook } from './kalshi-api.js';
import { FIXED_POINT } from './kalshi-config.js';
import { seriesFeeConfig } from './verified-snapshot.js';

/* ------------------------------------------------------------------ *
 * Deterministic PRNG
 * ------------------------------------------------------------------ */

/** mulberry32 — small, fast, deterministic 32-bit PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Hash a string into a 32-bit seed (stable across runs/platforms). */
export function seedFromString(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const MIN_COUNT = FIXED_POINT.minContractGranularity; // 0.01 contracts

/* ------------------------------------------------------------------ *
 * Order Book
 * ------------------------------------------------------------------ */

export class OrderBook {
  /**
   * @param {string} ticker
   * @param {object} [options]
   * @param {number} [options.midPrice=0.5]
   * @param {Array}  [options.priceRanges]     Kalshi price_ranges (source of truth)
   * @param {string} [options.priceLevelStructure]
   * @param {number} [options.notional=1.0]
   * @param {number} [options.feeMultiplier=1] series fee_multiplier
   * @param {string} [options.feeType]         series fee_type
   * @param {number} [options.seed]            deterministic RNG seed
   * @param {number} [options.spread=0.02]     target spread in dollars
   * @param {number} [options.depthScale=1]
   * @param {'partial'|'penalty'} [options.exhaustionPolicy='partial']
   *        What happens when an order is larger than ALL available depth.
   *        'partial' (default, realistic): fill only what exists and report the
   *          remainder as UNFILLED. Kalshi does not invent an execution price
   *          beyond the book, so neither does this engine.
   *        'penalty' (legacy stress mode): fill the remainder at an invented
   *          price 5 ticks beyond the last level, flagged `penalty: true`.
   *          Kept only for liquidity stress-testing; it is NOT exchange behaviour.
   */
  constructor(ticker, options = {}) {
    this.ticker = ticker;
    this.series_ticker = options.seriesTicker || null;
    this.notional = options.notional ?? 1.0;
    this.feeMultiplier = options.feeMultiplier ?? 1;
    this.feeType = options.feeType || 'quadratic';
    this.exhaustionPolicy = options.exhaustionPolicy === 'penalty' ? 'penalty' : 'partial';
    this.grid = resolvePriceGrid(options.priceRanges?.length ? options.priceRanges : options.priceLevelStructure);
    this.tick = minTick(this.grid);
    this.rng = mulberry32(options.seed ?? seedFromString(ticker));

    this.midPrice = clamp(options.midPrice ?? 0.5, this.tick, this.notional - this.tick);
    this.targetSpread = options.spread ?? 0.02;
    this.depthScale = options.depthScale ?? 1;
    this.source = options.source || 'simulation';

    /** @type {Array<{price:number,count:number,orderId?:string}>} ascending */
    this.yesBids = [];
    /** @type {Array<{price:number,count:number,orderId?:string}>} ascending */
    this.noBids = [];
    /** @type {Array} resting maker orders (paper) */
    this.restingOrders = [];
    this.tradeHistory = [];
    this.lastPrice = this.midPrice;
    this.inventory = 0; // AMM net YES inventory (contracts), drives quote skew
    this.quoteCount = 0;

    /**
     * Where the depth in this book came from. The UI shows it, because a
     * modelled ladder must never be presented as captured liquidity:
     *   captured_orderbook  - real levels from GET /markets/{ticker}/orderbook
     *   anchored_synthetic  - real quoted touch, modelled depth behind it
     *   unpriced_synthetic  - no captured quote at all (labelled, never hidden)
     */
    this.depthModel = options.depthModel || (options.yesBids && options.noBids ? 'captured_orderbook' : 'synthetic');
    this.depthModelNote = options.depthModelNote || null;
    /**
     * Provenance of MUTATION. A book built from a real capture keeps that label
     * only until something changes it; the first market-maker tick re-labels the
     * book as simulated and remembers what it was seeded from, so the UI can
     * never present modelled prices as captured ones.
     */
    this.ticksApplied = 0;
    this.seededFrom = null;

    if (options.yesBids && options.noBids) {
      this.setBids(options.yesBids, options.noBids);
    } else {
      this.rebuildBook();
    }
  }

  /** Build a book directly from a Kalshi `orderbook_fp` wire object (real data). */
  static fromWire(ticker, wire, options = {}) {
    const parsed = parseKalshiOrderbook(wire, options.notional ?? 1.0);
    const seriesTicker = options.seriesTicker || String(ticker || '').split('-')[0] || null;
    const feeCfg = seriesFeeConfig(seriesTicker);
    const book = new OrderBook(ticker, {
      ...options,
      seriesTicker,
      midPrice: parsed.yesMid ?? options.midPrice ?? 0.5,
      priceLevelStructure: options.priceLevelStructure,
      feeMultiplier: options.feeMultiplier ?? feeCfg.fee_multiplier,
      feeType: options.feeType || feeCfg.fee_type,
      depthModel: 'captured_orderbook',
      depthModelNote: 'Real captured order book: every level and size came from GET /markets/{ticker}/orderbook.',
      source: options.source || 'verified_snapshot'
    });
    book.setBids(parsed.yesBids, parsed.noBids);
    return book;
  }

  /**
   * Prefer the REAL captured order book for a ticker; fall back to a
   * quote-anchored modelled book when no order book was captured.
   * @param {object} market           raw or normalized market object
   * @param {object|null} orderbook   captured orderbook response (or null)
   */
  static fromVerifiedCapture(market, orderbook, options = {}) {
    const wire = orderbook && (orderbook.orderbook_fp || orderbook.yes_dollars) ? orderbook : null;
    if (wire) {
      return OrderBook.fromWire(market.ticker, wire, {
        ...options,
        seriesTicker: market.series_ticker,
        priceRanges: market.price_ranges,
        priceLevelStructure: market.price_level_structure,
        notional: market.notional_value ?? 1.0,
        source: market.source || options.source || 'verified_snapshot'
      });
    }
    return OrderBook.fromMarket(market, options);
  }

  /** Build a book from a normalized market object (real quotes + modelled depth). */
  static fromMarket(market, options = {}) {
    if (!market || typeof market !== 'object' || !market.ticker) {
      throw new Error('OrderBook.fromMarket: a market object with a ticker is required');
    }
    // Kalshi's RAW captures use fixed-point string fields (*_dollars / *_fp);
    // normalizeMarket() produces plain numbers. Accept BOTH. Defaulting the mid
    // to 0.50 for a market whose real quotes we hold would fabricate a book
    // around a price that never existed.
    const num = (...vals) => {
      for (const v of vals) {
        const n = dollarsToNumber(v);
        if (n !== null && Number.isFinite(n)) return n;
      }
      return null;
    };
    const yesBid = num(market.yes_bid_dollars, market.yes_bid);
    const yesAsk = num(market.yes_ask_dollars, market.yes_ask);
    const noBid = num(market.no_bid_dollars, market.no_bid);
    const last = num(market.last_price_dollars, market.last_price);
    const quotedMid = num(market.mid_price_dollars, market.mid_price);
    const mid = quotedMid ?? last ?? (yesBid !== null && yesAsk !== null ? round6((yesBid + yesAsk) / 2) : null);
    const priced = mid !== null;

    const book = new OrderBook(market.ticker, {
      ...options,
      seriesTicker: market.series_ticker,
      midPrice: priced ? mid : 0.5,
      priceRanges: market.price_ranges,
      priceLevelStructure: market.price_level_structure,
      notional: market.notional_value ?? 1.0,
      // Resolve fees from the CAPTURED Series object (KXBTCY is genuinely 0).
      feeMultiplier: options.feeMultiplier ?? market.fee_multiplier ?? seriesFeeConfig(market.series_ticker).fee_multiplier,
      feeType: options.feeType || market.fee_type || seriesFeeConfig(market.series_ticker).fee_type,
      spread: market.spread ?? options.spread ?? 0.02,
      depthModel: priced ? 'anchored_synthetic' : 'unpriced_synthetic',
      depthModelNote: priced
        ? 'Top of book anchored on the real captured quote; depth behind the touch is MODELLED (candlesticks and market objects carry no depth).'
        : 'No captured quote exists for this market. The whole ladder is MODELLED around 0.50 and must be labelled synthetic.',
      source: market.source || options.source || (priced ? 'simulation' : 'synthetic_unpriced')
    });
    // Anchor the top of book on the market's REAL quoted bids and sizes.
    if (yesBid !== null) book.anchorTouch('yes', yesBid, num(market.yes_bid_size_fp, market.yes_bid_size));
    if (noBid !== null) book.anchorTouch('no', noBid, num(market.yes_ask_size_fp, market.yes_ask_size));
    return book;
  }

  /** Replace both bid ladders (ascending sort enforced, like Kalshi). */
  setBids(yesBids, noBids) {
    const norm = (arr) => {
      const clean = (arr || [])
        .map((l) => ({ price: Number(l.price), count: Number(l.count), orderId: l.orderId }))
        .filter((l) => Number.isFinite(l.price) && Number.isFinite(l.count) && l.count > 0)
        .sort((a, b) => a.price - b.price);
      // Kalshi's orderbook_fp reports ONE row per price level, so merge any
      // duplicates (modelled refreshes can produce them) by summing size.
      const merged = [];
      for (const level of clean) {
        const top = merged[merged.length - 1];
        if (top && Math.abs(top.price - level.price) < 1e-9) top.count = round2(top.count + level.count);
        else merged.push({ ...level });
      }
      return merged;
    };
    this.yesBids = norm(yesBids);
    this.noBids = norm(noBids);
  }

  /**
   * Update this book to a new period's REAL quoted touch while PRESERVING
   * resting maker orders and their displayed levels.
   *
   * Kalshi publishes bids only, so a real observed YES ask is reproduced by
   * anchoring the best NO bid at (notional - yesAsk).
   *
   * @param {object} q
   * @param {number|null} q.yesBid   real best YES bid for the period
   * @param {number|null} q.yesAsk   real best YES ask for the period
   * @param {number|null} [q.mid]    fair value (defaults to the quote mid)
   * @param {number} [q.topSize]     displayed size to anchor at the touch
   */
  applyQuotes({ yesBid = null, yesAsk = null, mid = null, topSize = 2500 } = {}) {
    const grid = this.grid;
    const tick = this.tick;
    const lo = tick;
    const hi = this.notional - tick;

    const snappedBid = yesBid !== null && yesBid !== undefined ? clamp(snapToGrid(yesBid, grid, 'down'), lo, hi) : null;
    const snappedAsk = yesAsk !== null && yesAsk !== undefined ? clamp(snapToGrid(yesAsk, grid, 'up'), lo, hi) : null;
    const noBidFromAsk = snappedAsk !== null ? clamp(round6(this.notional - snappedAsk), lo, hi) : null;

    // Rebuild the modelled ladder around the new fair value...
    const newMid =
      mid !== null && mid !== undefined
        ? mid
        : snappedBid !== null && snappedAsk !== null
          ? round6((snappedBid + snappedAsk) / 2)
          : snappedBid !== null
            ? round6(snappedBid + tick)
            : this.midPrice;
    this.midPrice = clamp(round6(newMid), lo, hi);
    this.targetSpread = snappedBid !== null && snappedAsk !== null ? Math.max(tick, round6(snappedAsk - snappedBid)) : this.targetSpread;
    this.rebuildBook();

    // ...then pin the touch to the REAL observed quotes and sizes.
    if (snappedBid !== null) this.anchorTouch('yes', snappedBid, topSize);
    if (noBidFromAsk !== null) this.anchorTouch('no', noBidFromAsk, topSize);

    // Re-display any still-resting maker bids (they survive the rebuild).
    for (const order of this.restingOrders) {
      if (order.direction === 'bid' && order.status === 'resting') {
        this._addBidLevel(order.outcome.toLowerCase(), order.price, round2(order.count - order.filled), order.orderId);
      }
    }
    return this.snapshot();
  }

  /** Force the best bid on one side to a real observed price/size. */
  anchorTouch(side, price, size) {
    const p = snapToGrid(Number(price), this.grid, 'down');
    if (!Number.isFinite(p) || p <= 0 || p >= this.notional) return;
    const levels = side === 'yes' ? this.yesBids : this.noBids;
    const sizeNum = Number(size);
    const count = Number.isFinite(sizeNum) && sizeNum > 0 ? round2(sizeNum) : null;
    const existingAtTouch = levels.find((l) => Math.abs(l.price - p) < 1e-9);

    // Drop every level at or above the real touch. A modelled bid ABOVE the
    // captured best bid would be a crossed, impossible book — and selling into
    // it would manufacture liquidity (and profit) that does not exist.
    let kept = levels.filter((l) => l.price < p - 1e-9);
    kept.push({ price: p, count: count ?? (existingAtTouch ? existingAtTouch.count : MIN_COUNT) });

    // If the modelled ladder sat entirely above the real touch, rebuild it
    // downwards from the touch so the shape stays realistic but never crossed.
    if (kept.length < 2) {
      kept = buildSyntheticDepth(p, this.grid, this.tick, this.rng, this.depthScale, this.notional);
      const top = kept[kept.length - 1];
      if (top && count) top.count = count;
    }

    kept.sort((a, b) => a.price - b.price); // ascending invariant, as Kalshi returns them
    if (side === 'yes') this.yesBids = kept;
    else this.noBids = kept;
  }

  getBestYesBid() {
    return this.yesBids.length ? this.yesBids[this.yesBids.length - 1].price : null;
  }
  getBestNoBid() {
    return this.noBids.length ? this.noBids[this.noBids.length - 1].price : null;
  }
  /** Implied YES ask = notional - best NO bid (verified reciprocal rule). */
  getBestYesAsk() {
    const b = this.getBestNoBid();
    return b === null ? null : round6(this.notional - b);
  }
  /** Implied NO ask = notional - best YES bid. */
  getBestNoAsk() {
    const b = this.getBestYesBid();
    return b === null ? null : round6(this.notional - b);
  }
  getMid() {
    const bid = this.getBestYesBid();
    const ask = this.getBestYesAsk();
    if (bid === null || ask === null) return this.midPrice;
    return round6((bid + ask) / 2);
  }
  getSpread() {
    const bid = this.getBestYesBid();
    const ask = this.getBestYesAsk();
    return bid === null || ask === null ? null : round6(ask - bid);
  }

  /** Implied YES ask ladder (from inverted NO bids), ascending by ask price. */
  getYesAskTiers() {
    return [...this.noBids]
      .map((l) => ({ price: round6(this.notional - l.price), count: l.count, fromNoBid: l.price }))
      .sort((a, b) => a.price - b.price);
  }
  /** Implied NO ask ladder (from inverted YES bids), ascending by ask price. */
  getNoAskTiers() {
    return [...this.yesBids]
      .map((l) => ({ price: round6(this.notional - l.price), count: l.count, fromYesBid: l.price }))
      .sort((a, b) => a.price - b.price);
  }
  getBidTiers(side) {
    const arr = side === 'yes' ? this.yesBids : this.noBids;
    return [...arr].sort((a, b) => b.price - a.price); // best (highest) first
  }

  /** Total displayed depth on one side (contracts). */
  depth(side) {
    const arr = side === 'yes' ? this.yesBids : this.noBids;
    return round2(arr.reduce((s, l) => s + l.count, 0));
  }

  /**
   * Rebuild a sparse, barbell-shaped ladder calibrated to the real captured
   * Kalshi book shape. LABELLED AS SIMULATED — real depth replaces this when
   * a live/snapshot orderbook is available.
   */
  rebuildBook() {
    const halfSpread = Math.max(this.tick, this.targetSpread / 2);
    const bestYesBid = clamp(snapToGrid(this.midPrice - halfSpread, this.grid, 'down'), this.tick, this.notional - this.tick);
    const bestNoBid = clamp(snapToGrid(this.notional - this.midPrice - halfSpread, this.grid, 'down'), this.tick, this.notional - this.tick);

    this.yesBids = buildSyntheticDepth(bestYesBid, this.grid, this.tick, this.rng, this.depthScale, this.notional);
    this.noBids = buildSyntheticDepth(bestNoBid, this.grid, this.tick, this.rng, this.depthScale, this.notional);
  }

  /* ---------------------------------------------------------------- *
   * MARKET MAKING
   * ---------------------------------------------------------------- */

  /**
   * Continuous two-sided market-maker quote update.
   *
   * Model (documented assumptions, not exchange rules):
   *  - Quotes are placed on the market's price grid (verified requirement).
   *  - Inventory skew: a long YES inventory shades the YES bid DOWN and the
   *    NO bid UP to attract offsetting flow (standard Avellaneda-style skew).
   *  - Depth is replenished toward a target top-of-book size each tick.
   *
   * @param {object} [opts]
   * @param {number} [opts.drift=0]        deterministic mid drift this tick
   * @param {number} [opts.volatility]     random mid volatility (dollars)
   * @param {number} [opts.targetTopSize]  top-of-book contracts to replenish to
   * @param {number} [opts.maxSkewTicks]   max inventory skew in ticks
   * @returns {{mid:number,bestYesBid:number|null,bestNoBid:number|null,spread:number|null,inventory:number,quotesPlaced:number}}
   */
  marketMakerTick(opts = {}) {
    const drift = Number(opts.drift) || 0;
    const volatility = Number.isFinite(opts.volatility) ? opts.volatility : this.tick * 2;
    const targetTopSize = opts.targetTopSize ?? 2500 * this.depthScale;
    const maxSkewTicks = opts.maxSkewTicks ?? 3;

    // Random-walk the fair mid, bounded strictly inside (0, notional).
    const shock = (this.rng() - 0.5) * 2 * volatility + drift;
    this.midPrice = clamp(round6(this.midPrice + shock), this.tick * 2, this.notional - this.tick * 2);

    // Inventory skew in ticks (long YES inventory -> shade YES bid down).
    const invNorm = Math.max(-1, Math.min(1, this.inventory / Math.max(1, targetTopSize * 4)));
    const skewTicks = Math.round(invNorm * maxSkewTicks);
    const halfSpread = Math.max(this.tick, this.targetSpread / 2);

    const rawYesBid = this.midPrice - halfSpread - skewTicks * this.tick;
    const rawNoBid = this.notional - this.midPrice - halfSpread + skewTicks * this.tick;

    const bestYesBid = clamp(snapToGrid(rawYesBid, this.grid, 'down'), this.tick, this.notional - this.tick);
    const bestNoBid = clamp(snapToGrid(rawNoBid, this.grid, 'down'), this.tick, this.notional - this.tick);

    // Replenish top-of-book depth; keep deeper levels sparse (real shape).
    this.yesBids = refreshLadder(this.yesBids, bestYesBid, this.grid, this.tick, this.rng, targetTopSize, this.notional);
    this.noBids = refreshLadder(this.noBids, bestNoBid, this.grid, this.tick, this.rng, targetTopSize, this.notional);

    this.quoteCount += 2;
    if (this.ticksApplied === 0) {
      this.seededFrom = this.source;
      this.source = 'simulated_market_maker';
    }
    this.ticksApplied += 1;
    return {
      mid: round6(this.midPrice),
      source: this.source,
      seededFrom: this.seededFrom,
      ticksApplied: this.ticksApplied,
      bestYesBid: this.getBestYesBid(),
      bestNoBid: this.getBestNoBid(),
      bestYesAsk: this.getBestYesAsk(),
      bestNoAsk: this.getBestNoAsk(),
      spread: this.getSpread(),
      inventory: round2(this.inventory),
      quotesPlaced: this.quoteCount,
      tick: this.tick
    };
  }

  /* ---------------------------------------------------------------- *
   * EXECUTION
   * ---------------------------------------------------------------- */

  /**
   * Market BUY (taker): walks the implied ask ladder tier by tier, computing a
   * volume-weighted average price, slippage vs the best ask, and the OFFICIAL
   * per-tier Kalshi fee.
   *
   * @param {'yes'|'no'} side
   * @param {number} contracts
   * @returns {object} execution report
   */
  executeMarketBuy(side, contracts) {
    const s = String(side).toLowerCase();
    if (s !== 'yes' && s !== 'no') throw new Error(`side must be 'yes' or 'no', got '${side}'`);
    const qty = round2(Number(contracts));
    if (!(qty > 0)) throw new Error('Contract count must be greater than zero');

    const askTiers = s === 'yes' ? this.getYesAskTiers() : this.getNoAskTiers();
    if (!askTiers.length) {
      throw new Error(`No offers available on the ${s.toUpperCase()} side (empty ${s === 'yes' ? 'NO' : 'YES'} bid book)`);
    }
    const bestAsk = askTiers[0].price;

    let remaining = qty;
    let grossCost = 0;
    const fills = [];

    for (const tier of askTiers) {
      if (remaining <= MIN_COUNT / 2) break;
      const fillQty = round2(Math.min(remaining, tier.count));
      if (fillQty <= 0) continue;
      fills.push({ price: tier.price, count: fillQty, tierCost: round6(fillQty * tier.price) });
      grossCost += fillQty * tier.price;
      tier.count = round2(tier.count - fillQty);
      remaining = round2(remaining - fillQty);
      // Consume from the underlying bid level that produced this implied ask.
      this._consumeUnderlyingBid(s, tier, fillQty);
    }

    let exhausted = false;
    let unfilled = 0;
    if (remaining > MIN_COUNT / 2) {
      exhausted = true;
      if (this.exhaustionPolicy === 'penalty') {
        // LEGACY stress mode: invented price 5 ticks beyond the last level.
        const last = askTiers[askTiers.length - 1].price;
        const penaltyPrice = clamp(snapToGrid(last + 5 * this.tick, this.grid, 'up'), this.tick, this.notional - this.tick);
        fills.push({ price: penaltyPrice, count: remaining, tierCost: round6(remaining * penaltyPrice), penalty: true });
        grossCost += remaining * penaltyPrice;
        remaining = 0;
      } else {
        // DEFAULT: only real depth can fill. The remainder is reported as
        // unfilled rather than executed at a fabricated price.
        unfilled = round2(remaining);
        remaining = 0;
      }
    }

    const filled = round2(qty - unfilled);
    const vwap = filled > 0 ? round6(grossCost / filled) : null;
    const slippage = vwap === null ? 0 : round6(vwap - bestAsk);
    const feeResult = computeFeeForFills(fills, { isMaker: false, multiplier: this.feeMultiplier });
    const fee = round6(feeResult.fee);
    const totalCost = round2(grossCost + fee);

    if (filled > 0) {
      this.lastPrice = vwap;
      this.inventory = round2(this.inventory + (s === 'yes' ? filled : -filled));
      // Price impact: aggressive buying nudges the mid toward the traded side.
      this.midPrice = clamp(round6(this.midPrice + (s === 'yes' ? 1 : -1) * this.tick), this.tick * 2, this.notional - this.tick * 2);
    }
    this.rebuildBook();

    const report = {
      timestamp: new Date().toISOString(),
      ticker: this.ticker,
      action: 'BUY',
      side: s.toUpperCase(),
      requested: qty,
      contracts: filled,
      unfilled,
      fillStatus: filled <= 0 ? 'unfilled' : unfilled > 0 ? 'partial' : 'filled',
      bestAsk,
      vwap,
      slippage,
      grossCost: round6(grossCost),
      fee,
      feeTiers: feeResult.tiers,
      feeFormula: 'fees = round up(M x 0.07 x C x P x (1-P))',
      feeMultiplier: this.feeMultiplier,
      totalCost,
      fills,
      bookExhausted: exhausted,
      exhaustionPolicy: this.exhaustionPolicy,
      maker: false,
      bookSource: this.source,
      priceGridTick: this.tick
    };
    this.tradeHistory.unshift(report);
    return report;
  }

  /**
   * Market SELL (taker): walks the resting bid ladder for the same side.
   * A YES holder sells into YES bids; a NO holder sells into NO bids.
   */
  executeMarketSell(side, contracts) {
    const s = String(side).toLowerCase();
    if (s !== 'yes' && s !== 'no') throw new Error(`side must be 'yes' or 'no', got '${side}'`);
    const qty = round2(Number(contracts));
    if (!(qty > 0)) throw new Error('Contract count must be greater than zero');

    const bidTiers = this.getBidTiers(s); // highest first
    if (!bidTiers.length) throw new Error(`No bids available on the ${s.toUpperCase()} side`);
    const bestBid = bidTiers[0].price;

    let remaining = qty;
    let grossProceeds = 0;
    const fills = [];

    for (const tier of bidTiers) {
      if (remaining <= MIN_COUNT / 2) break;
      const fillQty = round2(Math.min(remaining, tier.count));
      if (fillQty <= 0) continue;
      fills.push({ price: tier.price, count: fillQty, tierProceeds: round6(fillQty * tier.price) });
      grossProceeds += fillQty * tier.price;
      tier.count = round2(tier.count - fillQty);
      remaining = round2(remaining - fillQty);
    }

    let exhausted = false;
    let unfilled = 0;
    if (remaining > MIN_COUNT / 2) {
      exhausted = true;
      if (this.exhaustionPolicy === 'penalty') {
        const last = bidTiers[bidTiers.length - 1].price;
        const penaltyPrice = clamp(snapToGrid(last - 5 * this.tick, this.grid, 'down'), this.tick, this.notional - this.tick);
        fills.push({ price: penaltyPrice, count: remaining, tierProceeds: round6(remaining * penaltyPrice), penalty: true });
        grossProceeds += remaining * penaltyPrice;
        remaining = 0;
      } else {
        unfilled = round2(remaining);
        remaining = 0;
      }
    }

    // Remove emptied levels from the live ladder.
    const arr = s === 'yes' ? this.yesBids : this.noBids;
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].count <= MIN_COUNT / 2) arr.splice(i, 1);

    const filled = round2(qty - unfilled);
    const vwap = filled > 0 ? round6(grossProceeds / filled) : null;
    const slippage = vwap === null ? 0 : round6(bestBid - vwap); // positive == worse than best bid
    const feeResult = computeFeeForFills(fills, { isMaker: false, multiplier: this.feeMultiplier });
    const fee = round6(feeResult.fee);
    const netProceeds = round2(grossProceeds - fee);

    if (filled > 0) {
      this.lastPrice = vwap;
      this.inventory = round2(this.inventory - (s === 'yes' ? filled : -filled));
      this.midPrice = clamp(round6(this.midPrice + (s === 'yes' ? -1 : 1) * this.tick), this.tick * 2, this.notional - this.tick * 2);
    }

    const report = {
      timestamp: new Date().toISOString(),
      ticker: this.ticker,
      action: 'SELL',
      side: s.toUpperCase(),
      requested: qty,
      contracts: filled,
      unfilled,
      fillStatus: filled <= 0 ? 'unfilled' : unfilled > 0 ? 'partial' : 'filled',
      bestBid,
      vwap,
      slippage,
      grossProceeds: round6(grossProceeds),
      fee,
      feeTiers: feeResult.tiers,
      feeFormula: 'fees = round up(M x 0.07 x C x P x (1-P))',
      feeMultiplier: this.feeMultiplier,
      netProceeds,
      fills,
      bookExhausted: exhausted,
      exhaustionPolicy: this.exhaustionPolicy,
      maker: false,
      bookSource: this.source,
      priceGridTick: this.tick
    };
    this.tradeHistory.unshift(report);
    return report;
  }

  /**
   * Place a resting LIMIT order (maker). Maker fee coefficient 0.0175 applies
   * only when it ultimately executes — verified: "These fees are only charged
   * when a trade is ultimately executed, there are no fees associated with
   * canceling a resting order."
   *
   * Queue position is modelled as the resting size ahead of the order at that
   * price level (mirrors Kalshi's documented price-time priority queue
   * position endpoints).
   */
  placeLimitOrder({ side, outcome, count, price, orderId = null }) {
    const s = String(side).toLowerCase(); // 'bid' (buy) or 'ask' (sell)
    const o = String(outcome).toLowerCase(); // 'yes' or 'no'
    if (!['bid', 'ask', 'buy', 'sell'].includes(s)) throw new Error(`side must be bid/ask, got '${side}'`);
    if (!['yes', 'no'].includes(o)) throw new Error(`outcome must be yes/no, got '${outcome}'`);
    const qty = round2(Number(count));
    if (!(qty > 0)) throw new Error('count must be > 0');

    const snapped = snapToGrid(Number(price), this.grid, 'nearest');
    const dir = s === 'buy' ? 'bid' : s === 'sell' ? 'ask' : s;

    const ahead = this._queueAhead(o, snapped, dir);
    const order = {
      orderId: orderId || `P${Date.now().toString(36)}${Math.floor(this.rng() * 1e6).toString(36)}`,
      ticker: this.ticker,
      outcome: o.toUpperCase(),
      direction: dir,
      price: snapped,
      count: qty,
      filled: 0,
      placedAt: new Date().toISOString(),
      queuePositionAhead: round2(ahead),
      status: 'resting',
      onGrid: snapped === round6(Number(price))
    };
    this.restingOrders.push(order);

    // A resting BID adds displayed depth to that side of the book.
    if (dir === 'bid') this._addBidLevel(o, snapped, qty, order.orderId);

    return order;
  }

  /** Cancel a resting order. Verified: no fee for cancelling a resting order. */
  cancelOrder(orderId) {
    const idx = this.restingOrders.findIndex((o) => o.orderId === orderId);
    if (idx === -1) return { cancelled: false, reason: 'not_found', fee: 0 };
    const [order] = this.restingOrders.splice(idx, 1);
    if (order.direction === 'bid') this._removeBidLevel(order.outcome.toLowerCase(), order.price, order.orderId);
    return { cancelled: true, orderId, fee: 0, note: 'No fee is charged for cancelling a resting order (official fee schedule).' };
  }

  /**
   * Attempt to fill resting maker orders.
   *
   * Two fill models:
   *  1. TOUCH-CROSSING (default, no range supplied): a resting BID fills when
   *     the implied ask <= bid price; a resting ASK fills when the best bid >=
   *     ask price. Correct for a live tick loop.
   *  2. RANGE-BASED (used by the candlestick replay): a resting order fills if
   *     the period's REAL traded price range reached through it — a BID at P
   *     fills when the period low <= P, an ASK at P fills when the period high
   *     >= P. Candlesticks carry OHLC of traded YES prices, so intra-period
   *     liquidity events that never show up in the closing touch are captured.
   *     For NO-side orders the range is inverted (NO price = notional - YES).
   *
   * Maker fee (coefficient 0.0175) is charged only on execution — verified:
   * "there are no fees associated with canceling a resting order."
   *
   * @param {{low?:number|null, high?:number|null}|null} [range]
   */
  /**
   * @param {object} [range]          {low, high} — the period's REAL traded range
   * @param {number} [maxContracts]   hard ceiling on contracts filled by THIS call.
   *   The replay passes the share of the period's REAL traded volume a strategy is
   *   allowed to take: you cannot buy 250,000 contracts in a day the whole market
   *   traded 400. Without it, modelled depth behind the touch let a strategy take
   *   unlimited size at an intraday low and be marked at the close, which produced
   *   returns like +2,005% (see IRREGULARITIES.md #29).
   */
  processRestingFills(range = null, maxContracts = Infinity) {
    const results = [];
    let budget = Number.isFinite(maxContracts) ? maxContracts : Infinity;
    for (const order of [...this.restingOrders]) {
      if (order.status !== 'resting') continue;
      const o = order.outcome.toLowerCase();
      let fillPrice = null;

      if (range && (range.low !== null && range.low !== undefined || range.high !== null && range.high !== undefined)) {
        // Invert the YES traded range for NO-side orders.
        let lo = range.low;
        let hi = range.high;
        if (o === 'no') {
          const invLo = lo !== null && lo !== undefined ? round6(this.notional - lo) : null;
          const invHi = hi !== null && hi !== undefined ? round6(this.notional - hi) : null;
          lo = invHi;
          hi = invLo;
        }
        if (order.direction === 'bid' && lo !== null && lo !== undefined && lo <= order.price + 1e-9) fillPrice = order.price;
        if (order.direction === 'ask' && hi !== null && hi !== undefined && hi >= order.price - 1e-9) fillPrice = order.price;
      } else if (order.direction === 'bid') {
        const ask = o === 'yes' ? this.getBestYesAsk() : this.getBestNoAsk();
        if (ask !== null && ask <= order.price + 1e-9) fillPrice = order.price;
      } else {
        const bid = o === 'yes' ? this.getBestYesBid() : this.getBestNoBid();
        if (bid !== null && bid >= order.price - 1e-9) fillPrice = order.price;
      }

      if (fillPrice === null) continue;

      const remaining = round2(order.count - order.filled);
      if (remaining <= MIN_COUNT / 2) {
        order.status = 'executed';
        continue;
      }
      if (budget <= 0) break; // no traded volume left to match against this period
      // A resting order may fill PARTIALLY against the period's real volume.
      const qty = budget >= remaining ? remaining : round2(Math.floor(budget * 100) / 100);
      budget = round2(budget - qty);
      const feeInfo = computeKalshiFee({ count: qty, price: fillPrice, multiplier: this.feeMultiplier, isMaker: true });
      order.filled = round2((order.filled || 0) + qty);
      order.status = order.filled >= order.count - MIN_COUNT / 2 ? 'executed' : 'resting';
      order.filledAt = new Date().toISOString();
      if (order.direction === 'bid') this._removeBidLevel(o, order.price, order.orderId);

      results.push({
        timestamp: order.filledAt,
        ticker: this.ticker,
        orderId: order.orderId,
        action: order.direction === 'bid' ? 'BUY' : 'SELL',
        side: order.outcome,
        contracts: qty,
        fillPrice,
        maker: true,
        fee: feeInfo.fee,
        feeFormula: feeInfo.formula,
        feeMultiplier: this.feeMultiplier,
        gross: round6(qty * fillPrice),
        queuePositionAhead: order.queuePositionAhead,
        partial: qty < remaining - 1e-9,
        volumeLimited: budget <= 0 && qty < remaining - 1e-9
      });
    }
    this.restingOrders = this.restingOrders.filter((o) => o.status === 'resting');
    for (const r of results) this.tradeHistory.unshift(r);
    return results;
  }

  /* ---- internal helpers ---- */

  _consumeUnderlyingBid(buySide, tier, qty) {
    // Buying YES consumes NO bids (the implied ask source), and vice versa.
    const arr = buySide === 'yes' ? this.noBids : this.yesBids;
    const sourcePrice = buySide === 'yes' ? tier.fromNoBid : tier.fromYesBid;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (Math.abs(arr[i].price - sourcePrice) < 1e-9) {
        arr[i].count = round2(arr[i].count - qty);
        if (arr[i].count <= MIN_COUNT / 2) arr.splice(i, 1);
        break;
      }
    }
  }

  _addBidLevel(outcome, price, qty, orderId) {
    const arr = outcome === 'yes' ? this.yesBids : this.noBids;
    const existing = arr.find((l) => Math.abs(l.price - price) < 1e-9 && l.orderId === orderId);
    if (existing) existing.count = round2(existing.count + qty);
    else arr.push({ price, count: qty, orderId });
    arr.sort((a, b) => a.price - b.price);
  }

  _removeBidLevel(outcome, price, orderId) {
    const arr = outcome === 'yes' ? this.yesBids : this.noBids;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (Math.abs(arr[i].price - price) < 1e-9 && arr[i].orderId === orderId) arr.splice(i, 1);
    }
  }

  _queueAhead(outcome, price, direction) {
    if (direction !== 'bid') return 0;
    const arr = outcome === 'yes' ? this.yesBids : this.noBids;
    return arr.filter((l) => Math.abs(l.price - price) < 1e-9).reduce((s, l) => s + l.count, 0);
  }

  /** Snapshot in Kalshi wire format for display/export. */
  toWire() {
    return {
      orderbook_fp: {
        yes_dollars: this.yesBids.map((l) => [l.price.toFixed(4), l.count.toFixed(2)]),
        no_dollars: this.noBids.map((l) => [l.price.toFixed(4), l.count.toFixed(2)])
      }
    };
  }

  snapshot() {
    return {
      ticker: this.ticker,
      source: this.source,
      mid: this.getMid(),
      bestYesBid: this.getBestYesBid(),
      bestYesAsk: this.getBestYesAsk(),
      bestNoBid: this.getBestNoBid(),
      bestNoAsk: this.getBestNoAsk(),
      spread: this.getSpread(),
      tick: this.tick,
      priceLevelStructure: this.grid,
      yesDepth: this.depth('yes'),
      noDepth: this.depth('no'),
      levels: { yes: this.yesBids.length, no: this.noBids.length },
      // Full ladders (best first) so the UI can render real depth, not a summary.
      yesBids: this.getBidTiers('yes'),
      noBids: this.getBidTiers('no'),
      inventory: this.inventory,
      restingOrders: this.restingOrders.length,
      quotesPlaced: this.quoteCount,
      depthModel: this.depthModel,
      depthModelNote: this.depthModelNote,
      ticksApplied: this.ticksApplied,
      seededFrom: this.seededFrom,
      mutated: this.ticksApplied > 0,
      feeMultiplier: this.feeMultiplier,
      feeType: this.feeType
    };
  }
}

/**
 * Build a sparse barbell-shaped ladder, calibrated to the real captured Kalshi
 * book (few levels, huge size at the touch, thin size deeper).
 * SIMULATED depth — used only when real depth is unavailable.
 */
export function buildSyntheticDepth(bestBid, grid, tick, rng, depthScale = 1, notional = 1.0) {
  const levels = [];
  const levelCount = 5 + Math.floor(rng() * 5); // 5..9 levels (real capture: 9 YES / 35 NO)
  let price = bestBid;
  for (let i = 0; i < levelCount; i++) {
    if (price < tick) break;
    // Real capture: 100,242 contracts at the touch vs 3-800 deeper.
    const isWall = i === 0 && rng() < 0.35;
    const base = isWall ? 40000 + rng() * 60000 : 200 + rng() * 2500;
    const count = round2(Math.max(MIN_COUNT, base * depthScale));
    levels.push({ price: round6(price), count });
    const step = tick * (1 + Math.floor(rng() * 3)); // uneven spacing, like real books
    price = round6(price - step);
    price = snapToGrid(price, grid, 'down');
  }
  return levels.sort((a, b) => a.price - b.price);
}

/** Refresh a ladder toward a new best bid, keeping the sparse shape. */
function refreshLadder(existing, newBestBid, grid, tick, rng, targetTopSize, notional) {
  const kept = existing.filter((l) => l.price < newBestBid - 1e-9 && l.count > MIN_COUNT / 2);
  const topCount = round2(Math.max(MIN_COUNT, targetTopSize * (0.6 + rng() * 0.8)));
  const levels = [...kept, { price: round6(newBestBid), count: topCount }];
  // Occasionally add one intermediate level for realistic sparseness.
  if (rng() < 0.5 && newBestBid - tick * 2 >= tick) {
    levels.push({
      price: round6(snapToGrid(newBestBid - tick * (1 + Math.floor(rng() * 2)), grid, 'down')),
      count: round2(100 + rng() * 900)
    });
  }
  const clean = levels
    .filter((l) => l.price >= tick && l.price <= notional - tick)
    .sort((a, b) => a.price - b.price);
  // One row per price, like the exchange reports.
  const merged = [];
  for (const l of clean) {
    const top = merged[merged.length - 1];
    if (top && Math.abs(top.price - l.price) < 1e-9) top.count = round2(top.count + l.count);
    else merged.push({ ...l });
  }
  return merged;
}

/* ------------------------------------------------------------------ *
 * Paper Portfolio
 * ------------------------------------------------------------------ */

/**
 * Paper-trading account for one competitor (human user or algorithmic strategy).
 * All PnL is COMPUTED from fills and settlements — never hard-coded.
 */
export class PaperPortfolio {
  /**
   * @param {string} username
   * @param {number} [initialCapital=100000]
   * @param {object} [options]
   * @param {number} [options.feeMultiplier=1]
   * @param {number} [options.notional=1.0]
   */
  constructor(username, initialCapital = 100000, options = {}) {
    this.username = username;
    this.initialCapital = Number(initialCapital);
    this.cash = Number(initialCapital);
    this.notional = options.notional ?? 1.0;
    this.feeMultiplier = options.feeMultiplier ?? 1;

    /** @type {Map<string,{ticker:string,side:string,count:number,avgCost:number,currentPrice:number,openedAt:string,feesPaid:number}>} */
    this.positions = new Map();
    this.tradeHistory = [];
    this.settlements = [];
    this.equityHistory = [];

    this.totalRealizedPnl = 0;
    this.totalFeesPaid = 0;
    this.totalTrades = 0;
    this.winningTrades = 0;
    this.losingTrades = 0;
    this.grossProfit = 0;
    this.grossLoss = 0;
    this.peakEquity = this.initialCapital;
    this.maxDrawdownPct = 0;
    this.maxDrawdownAt = null;

    this.recordSnapshot(new Date().toISOString().slice(0, 10));
  }

  static posKey(ticker, side) {
    return `${ticker}_${String(side).toUpperCase()}`;
  }

  /** Buy (taker) through an order book. */
  buyPosition(orderbook, side, count, meta = {}) {
    const execution = orderbook.executeMarketBuy(side, count);
    if (!(execution.contracts > 0)) {
      // Nothing could fill: the order was larger than all available depth.
      // No position, no fee, no trade counted — the shortfall is reported.
      const record = { ...execution, role: 'taker', strategy: meta.strategy || this.username, note: meta.note || '' };
      this.unfilledOrders = (this.unfilledOrders || 0) + 1;
      this.unfilledContracts = round2((this.unfilledContracts || 0) + (execution.unfilled || execution.requested || 0));
      this.tradeHistory.unshift(record);
      this.updateEquity();
      return record;
    }
    if (execution.totalCost > this.cash + 1e-9) {
      throw new Error(
        `Insufficient funds: required $${execution.totalCost.toFixed(2)}, available $${this.cash.toFixed(2)}`
      );
    }
    this.cash = round2(this.cash - execution.totalCost);
    this.totalFeesPaid = round6(this.totalFeesPaid + execution.fee);

    const key = PaperPortfolio.posKey(execution.ticker, execution.side);
    const existing = this.positions.get(key);
    if (existing) {
      const totalContracts = round2(existing.count + execution.contracts);
      const totalCostBasis = existing.count * existing.avgCost + execution.contracts * execution.vwap;
      existing.avgCost = round10(totalCostBasis / totalContracts);
      existing.count = totalContracts;
      existing.currentPrice = execution.vwap;
      existing.feesPaid = round6(existing.feesPaid + execution.fee);
    } else {
      this.positions.set(key, {
        ticker: execution.ticker,
        side: execution.side,
        count: execution.contracts,
        avgCost: execution.vwap,
        currentPrice: execution.vwap,
        openedAt: execution.timestamp,
        feesPaid: execution.fee
      });
    }

    if (execution.unfilled > 0) {
      this.unfilledOrders = (this.unfilledOrders || 0) + 1;
      this.unfilledContracts = round2((this.unfilledContracts || 0) + execution.unfilled);
    }
    this.totalTrades += 1;
    const record = { ...execution, role: 'taker', strategy: meta.strategy || this.username, note: meta.note || '' };
    this.tradeHistory.unshift(record);
    this.updateEquity();
    return record;
  }

  /** Sell (taker) into resting bids. */
  sellPosition(orderbook, side, count, meta = {}) {
    const s = String(side).toUpperCase();
    const key = PaperPortfolio.posKey(orderbook.ticker, s);
    const pos = this.positions.get(key);
    const want = round2(Number(count));
    if (!pos || pos.count + 1e-9 < want) {
      throw new Error(`Cannot sell ${want}: held ${pos ? pos.count : 0} of ${key}`);
    }

    const execution = orderbook.executeMarketSell(side, want);
    if (!(execution.contracts > 0)) {
      // No bids deep enough to take any of the order: position is unchanged.
      const record = { ...execution, role: 'taker', strategy: meta.strategy || this.username, note: meta.note || '' };
      this.unfilledOrders = (this.unfilledOrders || 0) + 1;
      this.unfilledContracts = round2((this.unfilledContracts || 0) + (execution.unfilled || execution.requested || 0));
      this.tradeHistory.unshift(record);
      this.updateEquity();
      return record;
    }
    // Cash receives the NET proceeds (real money movement), but realizedPnl is
    // reported GROSS of fees. Reporting it net AND separately summing
    // totalFeesPaid double-counted the fee: the attribution identity
    // equityChange = realizedPnl + unrealizedPnl - feesPaid only holds with a
    // gross figure. Caught by the reconciliation test in test/simulation.test.js.
    const proceeds = execution.netProceeds;
    const costBasis = round6(execution.contracts * pos.avgCost);
    const realizedPnl = round2(execution.grossProceeds - costBasis);

    this.cash = round2(this.cash + proceeds);
    this.totalFeesPaid = round6(this.totalFeesPaid + execution.fee);
    this.totalRealizedPnl = round2(this.totalRealizedPnl + realizedPnl);
    this._tallyClosedTrade(realizedPnl);

    pos.count = round2(pos.count - execution.contracts);
    if (execution.vwap !== null && execution.vwap !== undefined) pos.currentPrice = execution.vwap;
    if (pos.count <= MIN_COUNT / 2) this.positions.delete(key);
    if (execution.unfilled > 0) {
      this.unfilledOrders = (this.unfilledOrders || 0) + 1;
      this.unfilledContracts = round2((this.unfilledContracts || 0) + execution.unfilled);
    }

    this.totalTrades += 1;
    const record = {
      ...execution,
      role: 'taker',
      realizedPnl,
      pnlBasis: 'gross_of_fees',
      costBasis,
      strategy: meta.strategy || this.username,
      note: meta.note || ''
    };
    this.tradeHistory.unshift(record);
    this.updateEquity();
    return record;
  }

  /** Record a maker fill produced by OrderBook.processRestingFills(). */
  applyMakerFill(fill, meta = {}) {
    const s = String(fill.side).toUpperCase();
    const key = PaperPortfolio.posKey(fill.ticker, s);
    const isBuy = fill.action === 'BUY';
    const gross = round6(fill.contracts * fill.fillPrice);

    if (isBuy) {
      const cost = round2(gross + fill.fee);
      if (cost > this.cash + 1e-9) return null; // cannot fund the fill
      this.cash = round2(this.cash - cost);
      const existing = this.positions.get(key);
      if (existing) {
        const totalContracts = round2(existing.count + fill.contracts);
        existing.avgCost = round10((existing.count * existing.avgCost + gross) / totalContracts);
        existing.count = totalContracts;
        existing.currentPrice = fill.fillPrice;
        existing.feesPaid = round6(existing.feesPaid + fill.fee);
      } else {
        this.positions.set(key, {
          ticker: fill.ticker, side: s, count: fill.contracts,
          avgCost: fill.fillPrice, currentPrice: fill.fillPrice,
          openedAt: fill.timestamp, feesPaid: fill.fee
        });
      }
    } else {
      const pos = this.positions.get(key);
      if (!pos || pos.count + 1e-9 < fill.contracts) return null;
      const proceeds = round2(gross - fill.fee);
      const costBasis = round6(fill.contracts * pos.avgCost);
      // Gross of fees — see the note in sellPosition().
      const realizedPnl = round2(gross - costBasis);
      this.cash = round2(this.cash + proceeds);
      this.totalRealizedPnl = round2(this.totalRealizedPnl + realizedPnl);
      this._tallyClosedTrade(realizedPnl);
      pos.count = round2(pos.count - fill.contracts);
      if (pos.count <= MIN_COUNT / 2) this.positions.delete(key);
      Object.assign(fill, { realizedPnl, pnlBasis: 'gross_of_fees', costBasis });
    }

    this.totalFeesPaid = round6(this.totalFeesPaid + fill.fee);
    this.totalTrades += 1;
    const record = { ...fill, role: 'maker', strategy: meta.strategy || this.username };
    this.tradeHistory.unshift(record);
    this.updateEquity();
    return record;
  }

  /**
   * Settle a market at expiry. Winning contracts pay notional_value_dollars
   * (verified "1.0000"); losing contracts pay $0.00. NO settlement fee.
   * @param {string} ticker
   * @param {'YES'|'NO'} winningSide
   * @param {object} [opts] { notional, result, settledAt }
   */
  settleMarket(ticker, winningSide, opts = {}) {
    const notional = opts.notional ?? this.notional;
    const winner = String(winningSide).toUpperCase();
    if (winner !== 'YES' && winner !== 'NO') throw new Error(`winningSide must be YES or NO, got '${winningSide}'`);

    const outcomes = [];
    for (const s of ['YES', 'NO']) {
      const key = PaperPortfolio.posKey(ticker, s);
      const pos = this.positions.get(key);
      if (!pos) continue;
      const payoutPerContract = s === winner ? notional : 0;
      const payout = round2(pos.count * payoutPerContract);
      const costBasis = round6(pos.count * pos.avgCost);
      const pnl = round2(payout - costBasis);

      this.cash = round2(this.cash + payout);
      this.totalRealizedPnl = round2(this.totalRealizedPnl + pnl);
      this._tallyClosedTrade(pnl);
      this.positions.delete(key);

      const settlement = {
        timestamp: opts.settledAt || new Date().toISOString(),
        ticker,
        side: s,
        contracts: pos.count,
        avgCost: pos.avgCost,
        costBasis: round2(costBasis),
        payoutPerContract,
        payout,
        realizedPnl: pnl,
        result: winner,
        settlementFee: 0, // verified: "There is no settlement fee."
        notional
      };
      this.settlements.push(settlement);
      this.tradeHistory.unshift({ ...settlement, action: 'SETTLE' });
      outcomes.push(settlement);
    }
    this.updateEquity();
    return outcomes;
  }

  _tallyClosedTrade(pnl) {
    if (pnl >= 0) {
      this.winningTrades += 1;
      this.grossProfit = round2(this.grossProfit + pnl);
    } else {
      this.losingTrades += 1;
      this.grossLoss = round2(this.grossLoss + Math.abs(pnl));
    }
  }

  /** Mark open positions to a price map { `${ticker}_${SIDE}`: price }. */
  markToMarket(priceMap = {}) {
    for (const [key, pos] of this.positions.entries()) {
      const p = priceMap[key];
      if (typeof p === 'number' && Number.isFinite(p)) pos.currentPrice = p;
    }
    return this.updateEquity();
  }

  /** Recompute equity, drawdown and performance statistics. */
  updateEquity() {
    let openValue = 0;
    for (const pos of this.positions.values()) {
      openValue += pos.count * (Number.isFinite(pos.currentPrice) ? pos.currentPrice : pos.avgCost);
    }
    const equity = round2(this.cash + openValue);
    const returnPct = this.initialCapital > 0 ? round2(((equity - this.initialCapital) / this.initialCapital) * 100) : 0;

    if (equity > this.peakEquity) this.peakEquity = equity;
    const drawdown = this.peakEquity > 0 ? ((this.peakEquity - equity) / this.peakEquity) * 100 : 0;
    if (drawdown > this.maxDrawdownPct) {
      this.maxDrawdownPct = round2(drawdown);
      this.maxDrawdownAt = new Date().toISOString();
    }

    const closed = this.winningTrades + this.losingTrades;
    return {
      equity,
      cash: round2(this.cash),
      positionsValue: round2(openValue),
      openPositions: this.positions.size,
      returnPct,
      realizedPnl: round2(this.totalRealizedPnl),
      unrealizedPnl: round2(openValue - [...this.positions.values()].reduce((s, p) => s + p.count * p.avgCost, 0)),
      feesPaid: round2(this.totalFeesPaid),
      totalTrades: this.totalTrades,
      winningTrades: this.winningTrades,
      losingTrades: this.losingTrades,
      winRate: closed > 0 ? round1((this.winningTrades / closed) * 100) : 0,
      profitFactor: this.grossLoss > 0 ? round2(this.grossProfit / this.grossLoss) : this.grossProfit > 0 ? Infinity : 0,
      grossProfit: round2(this.grossProfit),
      grossLoss: round2(this.grossLoss),
      peakEquity: round2(this.peakEquity),
      maxDrawdownPct: this.maxDrawdownPct
    };
  }

  /** Append a point to the equity curve (used for the 52-week competition). */
  recordSnapshot(dateStr, extra = {}) {
    const stats = this.updateEquity();
    const point = {
      date: dateStr,
      equity: stats.equity,
      cash: stats.cash,
      realizedPnl: stats.realizedPnl,
      returnPct: stats.returnPct,
      drawdownPct: stats.maxDrawdownPct,
      trades: stats.totalTrades,
      ...extra
    };
    const last = this.equityHistory[this.equityHistory.length - 1];
    if (last && last.date === dateStr) this.equityHistory[this.equityHistory.length - 1] = point;
    else this.equityHistory.push(point);
    return point;
  }

  /** Plain-object serialization for memory export/import. */
  toJSON() {
    return {
      username: this.username,
      initialCapital: this.initialCapital,
      cash: this.cash,
      positions: [...this.positions.entries()].map(([key, p]) => ({ key, ...p })),
      tradeHistory: this.tradeHistory,
      settlements: this.settlements,
      equityHistory: this.equityHistory,
      totalRealizedPnl: this.totalRealizedPnl,
      totalFeesPaid: this.totalFeesPaid,
      totalTrades: this.totalTrades,
      winningTrades: this.winningTrades,
      losingTrades: this.losingTrades,
      grossProfit: this.grossProfit,
      grossLoss: this.grossLoss,
      peakEquity: this.peakEquity,
      maxDrawdownPct: this.maxDrawdownPct,
      stats: this.updateEquity()
    };
  }

  static fromJSON(obj) {
    const p = new PaperPortfolio(obj.username, obj.initialCapital);
    p.cash = obj.cash;
    p.positions = new Map((obj.positions || []).map(({ key, ...rest }) => [key, rest]));
    p.tradeHistory = obj.tradeHistory || [];
    p.settlements = obj.settlements || [];
    p.equityHistory = obj.equityHistory || [];
    p.totalRealizedPnl = obj.totalRealizedPnl || 0;
    p.totalFeesPaid = obj.totalFeesPaid || 0;
    p.totalTrades = obj.totalTrades || 0;
    p.winningTrades = obj.winningTrades || 0;
    p.losingTrades = obj.losingTrades || 0;
    p.grossProfit = obj.grossProfit || 0;
    p.grossLoss = obj.grossLoss || 0;
    p.peakEquity = obj.peakEquity || p.initialCapital;
    p.maxDrawdownPct = obj.maxDrawdownPct || 0;
    return p;
  }
}

/* ------------------------------------------------------------------ *
 * helpers
 * ------------------------------------------------------------------ */
export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}
export function round6(v) {
  return Number.isFinite(v) ? parseFloat(v.toFixed(6)) : 0;
}
/**
 * Ten decimal places, for AVERAGE COST only.
 *
 * Why not round6: avgCost is re-rounded on every fill and then multiplied by a
 * contract count that can exceed 900,000 in this competition. 0.5e-6 of rounding
 * on a 900k-contract position is up to $0.45 of phantom cost basis per position,
 * and the error compounds across fills — broad enough to break the accounting
 * identity (equityChange = realizedPnl + unrealizedPnl − feesPaid) by whole
 * dollars on the most aggressive strategies. Ten decimals keeps the residual
 * below 1e-4 dollars while leaving money values rounded to cents for display.
 */
export function round10(v) {
  return Number.isFinite(v) ? parseFloat(v.toFixed(10)) : 0;
}
export function round2(v) {
  return Number.isFinite(v) ? parseFloat(v.toFixed(2)) : 0;
}
export function round1(v) {
  return Number.isFinite(v) ? parseFloat(v.toFixed(1)) : 0;
}
