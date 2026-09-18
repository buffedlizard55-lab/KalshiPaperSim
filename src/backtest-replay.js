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
import { classifySettlement } from './settlement-tracker.js';

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
    // CAPTURED DEPTH (recommended-work item #5): when a real ladder was captured
    // for this market the book trades against that real shape instead of the
    // modelled one, and says so in depthModel/depthModelNote.
    depthProfile: opts.depthProfile || null,
    depthProfileScale: opts.depthProfileScale ?? 1,
    seed: opts.seed ?? seedFromString(`${market.ticker}:${candle.endTs}`),
    source: opts.source || market.source || 'replay'
  });

  if (yesBid !== null) book.anchorTouch('yes', yesBid, opts.topSize ?? 2500);
  if (noBid !== null) book.anchorTouch('no', noBid, opts.topSize ?? 2500);
  return book;
}

/**
 * Copy of a market object with every outcome-revealing field removed.
 *
 * WHY: ctx.market is handed to every strategy on every bar. A captured market
 * of a SETTLED series carries `result` ('yes'/'no') — if that field reached
 * decide(), a strategy could simply buy the known winner one bar early and the
 * whole replay would be a lookahead artifact. The engine settles real results
 * itself at the market's close time; the strategy only ever sees the redacted
 * copy. (Kept as a copy so the engine's own settlement map is untouched.)
 */
export function redactMarketForReplay(market) {
  if (!market || typeof market !== 'object') return market;
  const { result, settlement_value_dollars, expiration_value, ...safe } = market;
  return safe;
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
     * REAL MID-REPLAY SETTLEMENTS (2026-09-18, roadmap item #6).
     *
     * A market whose CAPTURED object says status=finalized with result yes/no
     * has already resolved on the real exchange. Any position still open when
     * the timeline passes that market's close_time is settled at the REAL
     * outcome: $1.00 per winning contract, $0.00 per losing contract, no
     * settlement fee (verified fee schedule). This is not a scenario — the
     * result is the exchange's own field, captured from GET /markets/{ticker}.
     *
     * Rules, deliberately conservative:
     *   • Only status=finalized books a payout. `determined`/`disputed`/
     *     `amended` results can still change (see src/settlement-tracker.js),
     *     so they mark to the last real quote instead.
     *   • Settlement happens at the market's real close_time when the capture
     *     carries one, else at the market's last stored bar. A market that is
     *     due but never reached in the timeline settles at the end of the run.
     *   • A result is NEVER shown to the strategy before settlement time:
     *     ctx.market is a copy with the outcome fields removed (see
     *     redactMarketForReplay), so no decide() can trade on the answer.
     */
    this.realSettlements = new Map();
    for (const m of this.markets) {
      const cls = classifySettlement(m);
      if (cls.state !== 'SETTLED') continue;
      const closeTs = m.close_time ? Math.floor(new Date(m.close_time).getTime() / 1000) : null;
      this.realSettlements.set(m.ticker, {
        result: cls.result,
        closeTs,
        due: false, // set to true once the timeline has passed the due time
        reason: cls.reason,
        status: m.status,
        source: m.source_url || m._provenance?.url || null
      });
    }

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

    /**
     * VOLUME-BOUNDED FILLS (see IRREGULARITIES.md #29).
     *
     * A candlestick's volume_fp is the number of contracts traded in that period
     * (verified by arithmetic: the bar volumes of KXBTCY-27JAN0100-T149999.99 sum
     * to exactly its lifetime volume_fp of 2,032,361.22). So no order — taker or
     * maker — may fill more than a fraction of the period's REAL traded volume.
     * Default 0.10. Set null to disable (stress mode only; it is what let a
     * strategy book +2,005% by "buying" 250,000 contracts on a 400-contract day).
     */
    // NB: `?? 0.1` would treat an explicit null (disable) as "not supplied" and
    // silently keep the cap. undefined => default; null => disabled.
    this.maxFillFractionOfPeriodVolume =
      options.maxFillFractionOfPeriodVolume !== undefined ? options.maxFillFractionOfPeriodVolume : 0.1;

    /**
     * DEPTH SOURCE (recommended-work item #5).
     *
     *   'modelled' (default) — the ladder behind each bar's real quoted touch is
     *      synthetic, shaped to the calibration in simulation-engine.js, and
     *      labelled SIMULATED wherever a fill from it is reported.
     *   'captured' — the ladder is a REAL captured order book (GET
     *      /markets/{ticker}/orderbook, stored by the ingest job) re-anchored to
     *      each period's real quote; markets without a capture fall back to
     *      'modelled' individually and are reported as such.
     *
     * `depthProfiles` is a { ticker: profile } map (see src/depth-profile.js).
     */
    /**
     * FORWARD TESTING (walk-forward).
     *
     * A number (unix seconds) means: the strategy sees every bar (so its
     * indicators are warm and its history is real) but NO ORDER may be executed
     * before that timestamp. Everything before the split is therefore reported
     * as suppressed intent, and the account starts the forward window with its
     * full opening capital and no inherited position.
     *
     * That is the difference between "performance on data I could see when I
     * designed this" (in-sample) and "performance on data that did not exist
     * yet" (forward). See src/forward-test.js.
     */
    this.noTradeBeforeTs = options.noTradeBeforeTs ?? null;
    this.suppressedActions = 0;
    this.suppressedBeforeTs = this.noTradeBeforeTs;

    this.depthMode = options.depthMode === 'captured' ? 'captured' : 'modelled';
    this.depthProfiles = options.depthProfiles || null;
    this.depthProfileScale = options.depthProfileScale ?? 1;
    /**
     * Candlestick period length in MINUTES for this run (1 | 60 | 1440), used
     * only to stamp each fill with the period it traded in (see setClock).
     * null when the caller did not say — never guessed from the bars.
     */
    this.periodMinutes = options.periodMinutes ?? null;

    /**
     * POINT-IN-TIME EXTERNAL SIGNALS (2026-09-18, roadmap item #3).
     *
     * An optional `signalProvider(ticker, market, tsSeconds)` returns whatever
     * VERIFIED external information was knowable at `tsSeconds` for a market —
     * for now the NWS forecast snapshot behind a weather bracket — or null when
     * nothing was captured yet. The provider is the ONLY way a strategy sees
     * external data: it must implement the point-in-time rule itself (see
     * src/forecast-store.js, which refuses any snapshot captured after the
     * decision time). ctx.signal carries the result; a strategy that gets null
     * abstains.
     */
    this.signalProvider = typeof options.signalProvider === 'function' ? options.signalProvider : null;
    /** Which markets in this run actually traded on a captured ladder. */
    this.depthCoverage = this.markets.map((m) => ({
      ticker: m.ticker,
      depthModel: this.depthMode === 'captured' && this.depthProfiles?.[m.ticker] ? 'captured_orderbook_reanchored' : 'anchored_synthetic',
      capturedAt: this.depthProfiles?.[m.ticker]?.capturedAt || null,
      url: this.depthProfiles?.[m.ticker]?.url || null
    }));

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

    /**
     * Per-run copy of the real-settlement map: this engine instance is REUSED
     * across strategies (runCompetition runs every roster entry through the same
     * engine), and the due flags are run state. Copying per run keeps every
     * strategy's settlements identical and independent.
     */
    const realSettlements = new Map(
      [...this.realSettlements.entries()].map(([ticker, r]) => [ticker, { ...r }])
    );

    // One book per market for the whole replay, so resting maker orders persist
    // across periods exactly as they would on a live exchange.
    const profileFor = (ticker) => (this.depthMode === 'captured' ? this.depthProfiles?.[ticker] || null : null);
    for (const market of this.markets) {
      const first = normalizeCandles(this.candlesByTicker[market.ticker] || [])[0];
      books[market.ticker] = bookFromCandle(market, first || { trade: { close: 0.5 }, yesBid: { close: 0.49 }, yesAsk: { close: 0.51 }, endTs: 0 }, {
        feeMultiplier: this.feeMultiplier,
        exhaustionPolicy: this.exhaustionPolicy,
        notional: this.notional,
        depthProfile: profileFor(market.ticker),
        depthProfileScale: this.depthProfileScale,
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

      // VERIFIED TRADE CLOCK (2026-09-18): every fill made in this period is
      // stamped with the real period it happened in — the candlestick's own
      // end_period_ts, its ISO date, the period length and the exact API URL
      // the bar came from. Without this a trade log could only say WHEN THE
      // REPLAY RAN, which is not an auditable date.
      books[t].setClock({
        ts: candle.endTs,
        iso: candle.endDate,
        periodMinutes: this.periodMinutes ?? null,
        index: row.indexInSeries,
        // The REAL liquidity of this bar: contracts that traded (volume_fp) and
        // contracts still open (open_interest_fp). Both are exchange fields on
        // the very candlestick that prices this period, so a fill can state
        // exactly what share of the real market it consumed.
        barVolume: candle.volume,
        barOpenInterest: candle.openInterest,
        // Prefer the CANDLESTICK endpoint the bars came from (the price
        // source); fall back to the market-object URL, which documents the
        // market rather than the bar, and is labelled as such in the ledger.
        sourceUrl: market.candle_source_url || market.source_url || market._provenance?.url || null,
        sourceKind: market.candle_source_url ? 'candlesticks_endpoint' : 'market_object_endpoint'
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
      //
      // The fill is bounded by the period's REAL traded volume: a resting order
      // cannot take more contracts than actually changed hands.
      let volumeLeft = this.maxFillFractionOfPeriodVolume === null
        ? Infinity
        : round2(Number(candle.volume || 0) * this.maxFillFractionOfPeriodVolume);
      const makerFills = books[t].processRestingFills({ low: candle.trade.low, high: candle.trade.high }, volumeLeft);
      for (const fill of makerFills) {
        portfolio.applyMakerFill(fill, { strategy: username });
        volumeLeft = round2(volumeLeft - fill.contracts);
      }

      const ctx = {
        strategy,
        username,
        portfolio,
        stats: portfolio.updateEquity(),
        market: redactMarketForReplay(market),
        ticker: t,
        candle,
        // Point-in-time external signal for THIS market at THIS bar's end, or
        // null when nothing verified was captured by then (see signalProvider).
        signal: this.signalProvider ? this.signalProvider(t, market, candle.endTs) : null,
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
        // Shared, mutable budget for this (market, period): contracts that may
        // still be filled before the period's real traded volume runs out.
        volumeLeft,
        helpers: { round2, round6, clamp, computeKalshiFee, snapToGrid, mulberry32 }
      };

      let actions = [];
      try {
        actions = strategy.decide(ctx) || [];
      } catch (err) {
        actionsLog.push({ period: candle.endTs, ticker: t, error: String(err && err.message ? err.message : err) });
      }
      if (!Array.isArray(actions)) actions = [actions];

      // FORWARD TEST gate: before the split, orders are counted and dropped —
      // never executed, never partially filled, never marked to market.
      if (this.noTradeBeforeTs !== null && candle.endTs < this.noTradeBeforeTs) {
        const wanted = actions.filter((a) => a && a.type && String(a.type).toLowerCase() !== 'hold');
        this.suppressedActions += wanted.length;
        if (wanted.length) {
          actionsLog.push({
            period: candle.endTs,
            date: candle.endDate,
            ticker: t,
            suppressed: true,
            reason: `before the forward-test split ${new Date(this.noTradeBeforeTs * 1000).toISOString()}`,
            requested: wanted.length
          });
        }
        actions = [];
      }

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

      // REAL SETTLEMENT (see constructor): when the timeline has passed a
      // finalized market's close — or reached its last stored bar — any open
      // position pays out at the exchange's own result. Runs AFTER this bar's
      // actions so a fill on the final bar can still settle, and never before,
      // so no strategy can buy a result it should not know yet.
      const real = realSettlements.get(t);
      if (real && !real.due) {
        const isLastBar = row.indexInSeries === row.seriesLength - 1;
        const dueNow = (real.closeTs !== null && candle.endTs >= real.closeTs) || isLastBar;
        if (dueNow) {
          real.due = true;
          const settledHere = portfolio.settleMarket(t, real.result, {
            notional: this.notional,
            settledAt: candle.endDate,
            // The MARKET's real close when it is known — that is the instant
            // the exchange resolved it — else the bar the payout was booked on.
            marketTime: {
              ts: real.closeTs ?? candle.endTs,
              iso: real.closeTs !== null && real.closeTs !== undefined ? new Date(real.closeTs * 1000).toISOString() : candle.endDate,
              kind: real.closeTs !== null && real.closeTs !== undefined ? 'market_close_time' : 'last_stored_bar',
              sourceUrl: real.source
            }
          });
          if (settledHere.length) {
            for (const s of settledHere) s.real = true;
            actionsLog.push({
              period: candle.endTs,
              date: candle.endDate,
              ticker: t,
              type: 'real_settlement',
              result: real.result,
              contracts: settledHere.reduce((acc, s) => acc + s.contracts, 0),
              payout: settledHere.reduce((acc, s) => round2(acc + s.payout), 0),
              reason: `market finalized on the exchange (status=${real.status}, result=${real.result}) — positions settled at $1.00/$0.00, no settlement fee`,
              source: real.source
            });
            // Keep the equity curve honest if this timestamp was already
            // plotted: a settlement moves equity and the chart must show it.
            const sNow = portfolio.updateEquity();
            const lastPoint = equityCurve[equityCurve.length - 1];
            if (lastPoint && lastPoint.ts === candle.endTs) {
              lastPoint.equity = sNow.equity;
              lastPoint.returnPct = sNow.returnPct;
              lastPoint.trades = sNow.totalTrades;
              lastPoint.drawdownPct = sNow.maxDrawdownPct;
            }
          }
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
     * Catch-up for real settlements the timeline never reached: a finalized
     * market whose stored bars stop before its close_time (ingest lag) still
     * owes its holders the real payout. Settle at the run's final timestamp so
     * the book closes on the exchange's own result, never on a stale quote.
     */
    const lateSettlements = [];
    for (const [ticker, real] of realSettlements.entries()) {
      if (real.due) continue;
      const settledHere = portfolio.settleMarket(ticker, real.result, {
        notional: this.notional,
        settledAt: 'END-OF-WINDOW'
      });
      if (settledHere.length) {
        real.due = true;
        lateSettlements.push(...settledHere);
        for (const s of settledHere) s.real = true;
        actionsLog.push({
          period: null,
          date: 'END-OF-WINDOW',
          ticker,
          type: 'real_settlement',
          result: real.result,
          contracts: settledHere.reduce((acc, s) => acc + s.contracts, 0),
          payout: settledHere.reduce((acc, s) => round2(acc + s.payout), 0),
          reason: `market finalized on the exchange (status=${real.status}, result=${real.result}) but the stored bars stop before its close_time — positions settled at the run boundary so the book closes on the real result`,
          source: real.source
        });
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
        depthMode: this.depthMode,
        depthCoverage: this.depthCoverage,
        note:
          this.depthMode === 'captured'
            ? 'Performance is COMPUTED from fills against real captured candlestick quotes. Depth comes from REAL captured order-book ladders re-anchored to each period\'s real quoted touch; markets without a captured ladder fall back to the MODELLED ladder and are labelled per market in depthCoverage.'
            : 'Performance is COMPUTED from fills against real captured candlestick quotes. Depth behind the touch is modelled and labelled SIMULATED.',
        exhaustionPolicy: this.exhaustionPolicy,
        exhaustionPolicyNote: this.exhaustionPolicy === 'partial'
          ? 'Orders larger than all modelled depth fill only what exists; the remainder is reported as UNFILLED. No execution price is invented.'
          : 'STRESS MODE: the unfilled remainder is executed at an invented price 5 ticks beyond the last level. Not real exchange behaviour.'
      },
      periods: this.periodCount,
      noTradeBeforeTs: this.noTradeBeforeTs,
      suppressedActions: this.suppressedActions,
      exhaustionPolicy: this.exhaustionPolicy,
      unfilledOrders: portfolio.unfilledOrders || 0,
      unfilledContracts: portfolio.unfilledContracts || 0,
      // Per-market capital allocation (item #7): how much the cap refused.
      maxNotionalPerMarketPct: this.maxNotionalPerMarketPct,
      cappedOrders: portfolio.cappedOrders || 0,
      cappedContracts: portfolio.cappedContracts || 0,
      maxFillFractionOfPeriodVolume: this.maxFillFractionOfPeriodVolume,
      volumeCappedOrders: portfolio.volumeCappedOrders || 0,
      volumeCappedContracts: portfolio.volumeCappedContracts || 0,
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
      /**
       * Real mid-replay settlements booked during this run: every market whose
       * CAPTURED object is finalized with a result, whether it paid, and from
       * which URL the result came. Zero entries means nothing in this universe
       * had finalized at capture time — the leaderboard then keeps marking to
       * the last real quote and says so.
       */
      realSettlements: {
        eligibleMarkets: [...this.realSettlements.entries()].map(([ticker, r]) => ({
          ticker,
          result: r.result,
          status: r.status,
          closeTs: r.closeTs,
          reason: r.reason,
          source: r.source
        })),
        bookedCount: portfolio.settlements.filter((s) => s.real === true).length,
        bookedPayout: round2(portfolio.settlements.filter((s) => s.real === true).reduce((acc, s) => acc + s.payout, 0)),
        lateWindowSettlements: lateSettlements.length
      },
      positionsOpen: [...portfolio.positions.values()],
      portfolio
    };
  }

  /**
   * Cap an order by the contracts that actually traded in this period.
   * Whatever it refuses is reported as VOLUME-capped, not as a fill.
   */
  _applyVolumeCap(requestedCount, ticker, ctx) {
    if (this.maxFillFractionOfPeriodVolume === null || !(requestedCount > 0)) {
      return { count: requestedCount, volumeCapped: false };
    }
    const left = ctx.volumeLeft ?? 0;
    if (!(left > 0)) {
      ctx.portfolio.volumeCappedOrders = (ctx.portfolio.volumeCappedOrders || 0) + 1;
      ctx.portfolio.volumeCappedContracts = round2((ctx.portfolio.volumeCappedContracts || 0) + requestedCount);
      return { count: 0, volumeCapped: true };
    }
    if (requestedCount <= left) {
      ctx.volumeLeft = round2(left - requestedCount);
      return { count: requestedCount, volumeCapped: false };
    }
    ctx.volumeLeft = 0;
    ctx.portfolio.volumeCappedOrders = (ctx.portfolio.volumeCappedOrders || 0) + 1;
    ctx.portfolio.volumeCappedContracts = round2((ctx.portfolio.volumeCappedContracts || 0) + (requestedCount - left));
    return { count: left, volumeCapped: true };
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
          const vol = this._applyVolumeCap(count, ticker, ctx);
          const cap = this._applyMarketCap(vol.count, touch ?? 0.5, ticker, ctx, books);
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
          const sellVol = this._applyVolumeCap(count, ticker, ctx);
          const exec = sellVol.count > 0
            ? portfolio.sellPosition(book, side, sellVol.count, { strategy: ctx.username, note: action.reason || '' })
            : { fillStatus: 'unfilled', requested: count, contracts: 0, unfilled: count, vwap: null, fee: 0, realizedPnl: 0 };
          if (sellVol.volumeCapped && sellVol.count === 0) return { status: 'capped_no_volume', detail: { requested: count, capReason: 'the period\'s real traded volume was already taken' } };
          const status = exec.fillStatus === 'unfilled' ? 'unfilled_no_depth' : exec.fillStatus === 'partial' ? 'partial_fill' : 'filled';
          return { status, detail: { requested: exec.requested, contracts: exec.contracts, unfilled: exec.unfilled, vwap: exec.vwap, fee: exec.fee, realizedPnl: exec.realizedPnl } };
        }
        case 'limit':
        case 'limit_order': {
          if (count <= 0) return { status: 'skipped_zero_size' };
          const limitPrice = action.price ?? (action.direction === 'ask' ? book.getBestYesAsk() : book.getBestYesBid());
          // A resting order is only an INTENT to trade; it is still bounded by the
          // period's real volume when it fills (see processRestingFills).
          const volLimit = this._applyVolumeCap(count, ticker, ctx);
          const cap = this._applyMarketCap(volLimit.count, limitPrice ?? 0.5, ticker, ctx, books);
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
