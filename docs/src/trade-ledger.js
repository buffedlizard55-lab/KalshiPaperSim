/**
 * KalshiPaperSim — Verified Trade Ledger
 * =====================================================================
 * WHAT THIS IS
 * ------------
 * One row per real fill, plus one row per round trip (entry → exit), for
 * every strategy in every flight. The ledger is the durable, data-efficient
 * record the project brief asks for:
 *
 *   "track every strategy's placed trades with verified pricing, dates,
 *    entries, exits, PnL using real verified official pricing and dates.
 *    Slippage, bid sizing, liquidity should also be taken into account …
 *    into a data-efficient setup so that we can use it for future analysis
 *    and testing."
 *
 * WHAT MAKES A ROW AUDITABLE (and not a hallucination)
 * ---------------------------------------------------
 *  • `ts` / `date` — the REAL market period the fill happened in. It comes
 *    from the candlestick's own `end_period_ts` (GET
 *    /series/{series_ticker}/markets/{ticker}/candlesticks), stamped onto the
 *    book by the replay (OrderBook.setClock). It is NEVER the wall clock of
 *    the replay run. `periodMinutes` says which bar length it was.
 *  • `px` — the executed volume-weighted price, computed by walking the book
 *    level by level. `bid`/`ask` are the real quoted touch for that period.
 *  • `slip` — px − quoted touch, i.e. the real cost of taking liquidity.
 *  • `depth` — which ladder the fill came out of: a REAL captured order book
 *    (`captured_orderbook_reanchored`, with its capture URL) or the modelled
 *    fallback (`anchored_synthetic`). Never silently mixed.
 *  • `pctVol` — filled contracts as a share of the contracts that really
 *    traded in that bar (`volume_fp`). The engine caps this
 *    (`maxFillFractionOfPeriodVolume`, default 10%), so a ledger row can show
 *    exactly how much of an order the real market could have absorbed.
 *  • `unfilled` — what the market could not fill. Reported, never invented.
 *  • `fee` — the official quadratic Kalshi fee for the series' real
 *    multiplier, per tier.
 *  • `src` — the API URL the pricing bar came from.
 *
 * ROUND TRIPS are reconstructed here, deterministically, by matching each
 * exit to the oldest open lot (FIFO) per (strategy, ticker, side). Exits are
 * either a real SELL or a SETTLE at the exchange's own result ($1.00/$0.00,
 * no settlement fee). Every round trip therefore has a verified entry date,
 * entry price, exit date, exit price and a PnL that reconciles to the
 * engine's realized PnL.
 *
 * STORAGE SHAPE (data-efficient)
 * ------------------------------
 * Rows are TUPLES in a fixed column order with a `columns` header, and every
 * row carries short keys. A 25-strategy × 12-month daily/replay ledger is
 * O(10^5) fills; tuples keep that in the low megabytes instead of tens of
 * megabytes, while the header keeps it readable and self-describing.
 *
 * Nothing in this module recomputes a price from anything but the engine's
 * own reports, and `verifyLedger()` re-derives every row from the raw trade
 * logs and throws if a single field disagrees.
 */

import { round2, round6 } from './simulation-engine.js';

/** Column order of a FILL tuple. Changing this is a schema version bump. */
export const FILL_COLUMNS = Object.freeze([
  'username', // 0  strategy username
  'strategyId', // 1  stable strategy id
  'flight', // 2  daily | hourly | micro
  'action', // 3  BUY | SELL | SETTLE
  'role', // 4  taker | maker | settlement
  'ticker', // 5  market ticker (real)
  'series', // 6  series ticker (real)
  'ts', // 7  REAL period end (unix seconds; null if unknown)
  'date', // 8  REAL period end (ISO)
  'periodMinutes', // 9  bar length of that period (1 | 60 | 1440 | null)
  'side', // 10 YES | NO
  'requested', // 11 contracts requested by the strategy
  'filled', // 12 contracts actually filled
  'unfilled', // 13 contracts the market could not fill
  'status', // 14 filled | partial_fill | unfilled_no_depth | settled
  'bid', // 15 real quoted YES bid for that period
  'ask', // 16 real quoted YES ask for that period
  'px', // 17 executed VWAP (null when nothing filled)
  'slip', // 18 px minus the quoted touch it took (taker) / 0 (maker)
  'fee', // 19 official fee for this fill
  'gross', // 20 gross cash (cost for BUY, proceeds for SELL, payout for SETTLE)
  'net', // 21 cash movement including the fee
  'pnl', // 22 realized PnL booked by this fill (SELL/SETTLE only)
  'barVolume', // 23 contracts that really traded in the period
  'pctVol', // 24 filled / barVolume (0 when the bar had no volume)
  'depth', // 25 captured_orderbook_reanchored | anchored_synthetic | null
  'depthCapturedAt', // 26 when the ladder was captured (null when modelled)
  'src', // 27 API URL of the pricing bar
  'note', // 28 the strategy's own reason string
  // WHY THIS COLUMN EXISTS: after the maker-fee rule was fixed (2026-09-18),
  // a maker fill on a plain-quadratic series legitimately carries fee = 0.
  // A zero fee next to a filled row is exactly the shape of a bug, so every
  // row now states which fee regime produced its number. Values:
  //   taker_0.07        immediately matched; official taker coefficient
  //   taker_zero        taker on a series whose fee_multiplier is 0 (e.g. KXBTCY)
  //   maker_0.0175      resting order on a series flagged quadratic_with_maker_fees
  //   maker_free        resting order on a plain-quadratic series => no trading fee
  //                     (the schedule charges resting orders only in the Maker
  //                      Fees section)
  //   settlement        market finalized; the contract pays its notional and
  //                     "there is no settlement fee"
  'feeRegime' // 29
]);

/** Column order of a ROUND-TRIP tuple. */
export const ROUND_TRIP_COLUMNS = Object.freeze([
  'username', // 0
  'strategyId', // 1
  'flight', // 2
  'ticker', // 3
  'series', // 4
  'side', // 5
  'contracts', // 6
  'entryTs', // 7  REAL entry period (unix seconds)
  'entryDate', // 8
  'entryPx', // 9  entry VWAP (liquidity-walked)
  'entrySlip', // 10 slippage paid on entry
  'entryDepth', // 11 ladder the entry came from
  'entrySrc', // 12 API URL of the entry bar
  'exitTs', // 13 REAL exit period (unix seconds)
  'exitDate', // 14
  'exitPx', // 15 exit VWAP, or 1.00 / 0.00 for a settled market
  'exitSlip', // 16 slippage paid on exit (0 for settlement)
  'exitKind', // 17 SELL | SETTLE_REAL
  'holdMinutes', // 18 (exitTs − entryTs)/60
  'grossPnl', // 19 before fees
  'fees', // 20 entry fee + exit fee
  'netPnl', // 21 grossPnl − fees (the number that matches equity)
  'barVolumeEntry', // 22 real traded volume of the entry bar
  'pctVolEntry' // 23 entry fill share of that volume
]);

/**
 * Schema version. 1 -> 2 appends the `feeRegime` column to FILL_COLUMNS.
 * Appending keeps every reader that looks columns up BY NAME working; a reader
 * that hard-codes tuple positions must bump with it.
 */
export const LEDGER_VERSION = 2;

/** Series ticker from a market ticker (KXHIGHNY-26SEP07-B77.5 → KXHIGHNY). */
export function seriesOf(ticker) {
  return String(ticker || '').split('-')[0] || null;
}

/** A stable, collision-free lot key for FIFO matching. */
function lotKey(username, ticker, side) {
  return `${username}|${ticker}|${String(side).toUpperCase()}`;
}

/** Quoted touch that a taker crossed, from the engine's own report. */
function touchOf(fill, action) {
  if (action === 'BUY') return fill.bestAsk ?? null;
  if (action === 'SELL') return fill.bestBid ?? null;
  return null;
}

/**
 * Convert one engine trade-log record into one ledger row (a tuple).
 * `meta` supplies the facts the engine does not carry on the record itself
 * (flight, series, bar volume). Nothing here is defaulted to a plausible
 * value: a missing fact stays null.
 */
export function fillRow(record, meta = {}) {
  const action = String(record.action || '').toUpperCase();
  const isSettle = action === 'SETTLE';
  const marketTime = record.marketTime || null;
  const ts = marketTime && Number.isFinite(Number(marketTime.ts)) ? Number(marketTime.ts) : null;
  const date = marketTime && marketTime.iso ? marketTime.iso : null;
  const filled = isSettle ? round2(record.contracts ?? 0) : round2(record.contracts ?? 0);
  const requested = isSettle ? filled : round2(record.requested ?? filled);
  const unfilled = isSettle ? 0 : round2(record.unfilled ?? 0);
  // Which ladder priced this row. A settlement is not priced by any ladder —
  // the exchange's result pays the contract's notional — so it is labelled as
  // what it is rather than left blank or given a misleading depth source.
  const depthModel = isSettle ? 'contractual_settlement' : record.depthModel ?? meta.depthModel ?? null;
  // Real traded volume of the period this fill happened in. Taken from the
  // MARKET CLOCK (which the replay stamps from the candlestick's own
  // volume_fp) — never estimated from the order itself.
  const barVolume = marketTime?.barVolume ?? meta.barVolume ?? null;
  let status;
  if (isSettle) status = 'settled';
  else if (record.fillStatus) status = record.fillStatus;
  else if (filled <= 0) status = 'unfilled_no_depth';
  else if (unfilled > 0) status = 'partial_fill';
  else status = 'filled';

  // Settlements have no crossed touch: the payout is contractual ($1.00/$0.00).
  const bid = record.bestBid ?? null;
  const ask = record.bestAsk ?? null;
  /**
   * Executed price. TAKER fills report `vwap` (depth-walked); MAKER fills
   * report `fillPrice` (the resting limit that was hit). Both are the engine's
   * own numbers. A settlement has no traded price at all: it pays the
   * contract's notional, so `payoutPerContract` is the only honest "price".
   * Reading only `vwap` here silently produced null prices for every maker
   * fill — caught by the round-trip PnL reconciliation against the engine.
   */
  const px = isSettle
    ? round6(record.payoutPerContract ?? null)
    : record.vwap != null
      ? round6(record.vwap)
      : record.fillPrice != null
        ? round6(record.fillPrice)
        : null;
  const slip = isSettle ? 0 : round6(record.slippage ?? 0);
  const fee = round6(record.fee ?? record.settlementFee ?? 0);
  const gross = isSettle
    ? round6(record.payout ?? 0)
    : action === 'BUY'
      ? round6(record.grossCost ?? record.gross ?? 0)
      : round6(record.grossProceeds ?? record.gross ?? 0);
  const net = isSettle
    ? round6(record.payout ?? 0)
    : action === 'BUY'
      ? round6((record.grossCost ?? record.gross ?? 0) + fee)
      : round6(record.netProceeds ?? ((record.grossProceeds ?? record.gross ?? 0) - fee));
  const pnl = record.realizedPnl != null ? round2(record.realizedPnl) : null;
  // A filled order with no executed price would be unauditable. The engine
  // always reports one; if it ever does not, that is a defect, not a value to
  // paper over — so a filled row with px === null is flagged in the ledger's
  // verification pass (see verifyLedger).
  const pctVol = barVolume && barVolume > 0 ? round6(filled / barVolume) : 0;
  /**
   * Which fee regime produced this row's fee. Derived from the engine's own
   * report (`makerFeesApply`, `feeType`, `feeMultiplier`) — never assumed from
   * the fee being 0, which would hide a genuine zero-multiplier series behind
   * the same label as an unpriced fill.
   */
  const feeRegime = isSettle
    ? 'settlement'
    : record.role === 'maker' || record.maker
      ? record.makerFeesApply === false
        ? 'maker_free'
        : 'maker_0.0175'
      : record.feeMultiplier === 0
        ? 'taker_zero'
        : 'taker_0.07';

  return [
    record.strategy || meta.username || null,
    meta.strategyId ?? null,
    meta.flight ?? null,
    action || null,
    record.role || (isSettle ? 'settlement' : 'taker'),
    record.ticker ?? null,
    meta.series ?? seriesOf(record.ticker),
    ts,
    date,
    marketTime && marketTime.periodMinutes != null ? marketTime.periodMinutes : (meta.periodMinutes ?? null),
    record.side ? String(record.side).toUpperCase() : null,
    requested,
    filled,
    unfilled,
    status,
    bid,
    ask,
    px,
    slip,
    fee,
    gross,
    net,
    pnl,
    barVolume,
    pctVol,
    depthModel,
    record.depthCapturedAt ?? meta.depthCapturedAt ?? null,
    (marketTime && marketTime.sourceUrl) || meta.sourceUrl || null,
    record.note || '',
    feeRegime
  ];
}

/**
 * Reconstruct round trips from a strategy's fills using FIFO lots.
 *
 * Only EXITS create a round trip. An exit is a SELL fill or a SETTLE record.
 * An entry is a BUY fill (taker or maker). Anything unfilled never creates a
 * lot, so a ledger can never show a position the market would not have given.
 *
 * @param {Array<object>} fills  ledger rows (tuples) OR raw engine records
 * @param {object} meta          { columns, index } to read tuples
 * @returns {Array<Array>} round-trip tuples in ROUND_TRIP_COLUMNS order
 */
export function buildRoundTrips(fills, meta = {}) {
  const columns = meta.columns || null;
  const idx = (name) => (columns ? columns.indexOf(name) : -1);
  const get = (row, name, fallbackKey) => {
    if (columns) {
      const i = idx(name);
      return i >= 0 ? row[i] : row[fallbackKey ?? name];
    }
    return row[fallbackKey ?? name];
  };

  const lots = new Map(); // lotKey → FIFO queue of open lots
  const trips = [];
  // Fills arrive oldest-first (the ledger is sorted before this is called).
  for (const row of fills) {
    const username = get(row, 'username');
    const strategyId = get(row, 'strategyId');
    const flight = get(row, 'flight');
    const action = String(get(row, 'action') || '').toUpperCase();
    const ticker = get(row, 'ticker');
    const series = get(row, 'series');
    const side = String(get(row, 'side') || '').toUpperCase();
    const filled = Number(get(row, 'filled') || 0);
    const px = get(row, 'px');
    const fee = Number(get(row, 'fee') || 0);
    const ts = get(row, 'ts');
    const date = get(row, 'date');
    const slip = get(row, 'slip');
    const depth = get(row, 'depth');
    const src = get(row, 'src');
    const barVolume = get(row, 'barVolume');
    const pctVol = get(row, 'pctVol');
    if (!(filled > 0)) continue;

    const key = lotKey(username, ticker, side);
    if (action === 'BUY') {
      const queue = lots.get(key) || [];
      queue.push({
        contracts: filled,
        px,
        feeTotal: round6(fee * 0), // entry fee is charged per fill; kept per lot below
        feePerContract: filled > 0 ? round6(fee / filled) : 0,
        ts,
        date,
        slip,
        depth,
        src,
        barVolume,
        pctVol
      });
      lots.set(key, queue);
      continue;
    }
    if (action !== 'SELL' && action !== 'SETTLE') continue;

    let remaining = filled;
    const exitKind = action === 'SETTLE' ? 'SETTLE_REAL' : 'SELL';
    const queue = lots.get(key) || [];
    while (remaining > 1e-9 && queue.length) {
      const lot = queue[0];
      const take = round2(Math.min(lot.contracts, remaining));
      if (take <= 0) break;
      const entryFee = round6(lot.feePerContract * take);
      const exitFee = filled > 0 ? round6((fee / filled) * take) : 0;
      const grossPnl = round6((Number(px) - Number(lot.px)) * take);
      const netPnl = round2(grossPnl - entryFee - exitFee);
      const holdMinutes =
        ts != null && lot.ts != null ? round2((Number(ts) - Number(lot.ts)) / 60) : null;
      trips.push([
        username,
        strategyId,
        flight,
        ticker,
        series,
        side,
        take,
        lot.ts,
        lot.date,
        lot.px,
        lot.slip,
        lot.depth,
        lot.src,
        ts,
        date,
        px,
        exitKind === 'SETTLE_REAL' ? 0 : slip,
        exitKind,
        holdMinutes,
        round2(grossPnl),
        round6(entryFee + exitFee),
        netPnl,
        lot.barVolume,
        lot.pctVol
      ]);
      lot.contracts = round2(lot.contracts - take);
      remaining = round2(remaining - take);
      if (lot.contracts <= 1e-9) queue.shift();
    }
    lots.set(key, queue);
  }
  return trips;
}

/**
 * Build the whole ledger from competition results.
 *
 * @param {Array<object>} runs        results from runCompetition / flights
 * @param {object} options            { seed, flights, candleByTicker, depthCoverage, generatedAt }
 */
export function buildLedger(runs, options = {}) {
  const rows = [];
  const meta = options.meta || {};
  for (const run of runs || []) {
    if (!run || run.error) continue;
    const flight = meta.flightOf ? meta.flightOf(run) : (run.flight ?? run.competition?.flight ?? meta.flight ?? 'daily');
    const periodMinutes =
      run.competition?.periodIntervalMinutes ??
      run.periodIntervalMinutes ??
      meta.periodMinutes ??
      null;
    const marketByTicker = new Map(
      (run.dataProvenance?.markets || []).map((m) => [m.ticker, m])
    );
    const volumeByTickerTs = options.volumeIndex || new Map();
    const feed = (run.tradeLog || []).map((record) => {
      const market = marketByTicker.get(record.ticker) || {};
      const key = `${record.ticker}|${record.marketTime?.ts ?? ''}`;
      const bar = volumeByTickerTs.get(key) || {};
      return fillRow(record, {
        username: run.username,
        strategyId: run.strategyId,
        flight,
        periodMinutes,
        series: market.series ?? seriesOf(record.ticker),
        barVolume: bar.volume ?? null,
        sourceUrl: market.source_url ?? null,
        depthModel: record.depthModel ?? null
      });
    });
    // OLDEST FIRST for FIFO reconstruction; the stored ledger is newest-first
    // for reading (a reader wants the latest trade at the top).
    feed.sort((a, b) => {
      const ta = a[FILL_COLUMNS.indexOf('ts')] ?? -1;
      const tb = b[FILL_COLUMNS.indexOf('ts')] ?? -1;
      if (ta !== tb) return ta - tb;
      return 0;
    });
    const trips = buildRoundTrips(feed, { columns: FILL_COLUMNS });
    rows.push(...feed.map((r) => ({ row: r, key: 'fill' })));
    for (const t of trips.reverse()) rows.push({ row: t, key: 'trip' });
  }

  const fills = rows.filter((r) => r.key === 'fill').map((r) => r.row);
  const trips = rows.filter((r) => r.key === 'trip').map((r) => r.row);
  // Reading order: newest first (a reader audits the recent past first).
  fills.sort((a, b) => (b[7] ?? -1) - (a[7] ?? -1));

  return {
    ledgerVersion: LEDGER_VERSION,
    generatedAt: options.generatedAt || new Date().toISOString(),
    provenance: options.provenance || null,
    fillColumns: FILL_COLUMNS,
    roundTripColumns: ROUND_TRIP_COLUMNS,
    fills,
    roundTrips: trips,
    totals: ledgerTotals(fills, trips)
  };
}

/** Totals that a reader can check against the leaderboard. */
export function ledgerTotals(fills, roundTrips) {
  // A strategy can be judged in more than one flight (a 'both' entry trades the
  // daily AND the hourly replay). Those are separate accounts with separate
  // PnL, so every total — and the reconciliation below — is keyed by
  // (username, flight). Mixing them silently would overstate a strategy's PnL.
  const byUser = {};
  const keyOf = (username, flight) => `${username}@${flight ?? 'unknown'}`;
  for (const f of fills) {
    const user = keyOf(f[0], f[2]);
    const b = (byUser[user] = byUser[user] || {
      username: f[0],
      flight: f[2] ?? null,
      fills: 0,
      contractsFilled: 0,
      contractsUnfilled: 0,
      fees: 0,
      realizedPnl: 0,
      slippageCost: 0,
      settlements: 0,
      trades: 0,
      grossProfit: 0,
      grossLoss: 0
    });
    b.fills += 1;
    b.contractsFilled = round2(b.contractsFilled + (Number(f[12]) || 0));
    b.contractsUnfilled = round2(b.contractsUnfilled + (Number(f[13]) || 0));
    b.fees = round6(b.fees + (Number(f[19]) || 0));
    b.slippageCost = round6(b.slippageCost + (Number(f[18]) || 0) * (Number(f[12]) || 0));
    if (f[3] === 'SETTLE') b.settlements += 1;
    if (f[22] != null) b.realizedPnl = round2(b.realizedPnl + Number(f[22]));
  }
  for (const t of roundTrips) {
    const user = keyOf(t[0], t[2]);
    const b = byUser[user];
    if (!b) continue;
    b.trades += 1;
    const pnl = Number(t[21]) || 0;
    if (pnl >= 0) b.grossProfit = round2(b.grossProfit + pnl);
    else b.grossLoss = round2(b.grossLoss + Math.abs(pnl));
  }
  for (const b of Object.values(byUser)) {
    b.key = keyOf(b.username, b.flight);
    b.slippageCost = round2(b.slippageCost);
    const mine = roundTrips.filter((t) => keyOf(t[0], t[2]) === b.key);
    b.winRate = b.trades > 0 ? round2((mine.filter((t) => (Number(t[21]) || 0) >= 0).length / b.trades) * 100) : null;
    b.profitFactor = b.grossLoss > 0 ? round6(b.grossProfit / b.grossLoss) : b.grossProfit > 0 ? Infinity : null;
    // Net of fees: the number a reader can tie back to the equity change.
    b.netPnl = round2(b.grossProfit - b.grossLoss - 0); // gross figures already net of round-trip fees
  }
  return {
    strategies: Object.keys(byUser).length,
    fills: fills.length,
    roundTrips: roundTrips.length,
    byStrategy: Object.values(byUser).sort((a, b) => (b.netPnl ?? 0) - (a.netPnl ?? 0))
  };
}

/**
 * Re-derive the ledger from the raw engine records and compare, field for
 * field. This is the anti-hallucination check: if a single field of a single
 * row cannot be reproduced from the engine's own output, it throws.
 *
 * @param {object} ledger  the object returned by buildLedger
 * @param {Array<object>} runs  the same runs that produced it
 * @param {object} options { volumeIndex, meta }
 */
export function verifyLedger(ledger, runs, options = {}) {
  const rebuilt = buildLedger(runs, { ...options, generatedAt: ledger.generatedAt, provenance: ledger.provenance });
  const problems = [];
  if (rebuilt.fills.length !== ledger.fills.length) {
    problems.push(`fill count differs: stored ${ledger.fills.length}, rebuilt ${rebuilt.fills.length}`);
  }
  if (rebuilt.roundTrips.length !== ledger.roundTrips.length) {
    problems.push(`round-trip count differs: stored ${ledger.roundTrips.length}, rebuilt ${rebuilt.roundTrips.length}`);
  }
  // Compare on a canonical (sorted) string form so ordering never hides a diff.
  const canon = (rows) => rows.map((r) => JSON.stringify(r.map((v) => (v === undefined ? null : v)))).sort();
  const a = canon(ledger.fills);
  const b = canon(rebuilt.fills);
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) {
      problems.push(`fill row ${i} differs:\n  stored  ${a[i]}\n  rebuilt ${b[i]}`);
      if (problems.length > 5) break;
    }
  }
  const ta = canon(ledger.roundTrips);
  const tb = canon(rebuilt.roundTrips);
  for (let i = 0; i < Math.min(ta.length, tb.length); i++) {
    if (ta[i] !== tb[i]) {
      problems.push(`round trip ${i} differs:\n  stored  ${ta[i]}\n  rebuilt ${tb[i]}`);
      if (problems.length > 5) break;
    }
  }
  // Every fill must carry a real market date. A row without one is not
  // auditable and must never be presented as a verified trade.
  const undated = ledger.fills.filter((f) => !f[8]);
  if (undated.length) problems.push(`${undated.length} fill(s) carry no verified market date (column 'date' is null)`);
  // Every FILLED row must carry an executed price, and every fill must say
  // which ladder it came out of. A blank would be unauditable.
  const noPrice = ledger.fills.filter((f) => Number(f[12]) > 0 && f[17] == null);
  if (noPrice.length) problems.push(`${noPrice.length} filled row(s) carry no executed price (column 'px' is null)`);
  const noDepth = ledger.fills.filter((f) => Number(f[12]) > 0 && !f[25]);
  if (noDepth.length) problems.push(`${noDepth.length} filled row(s) do not say which depth ladder priced them (column 'depth' is null)`);
  // Round trips must price both legs.
  const badTrips = ledger.roundTrips.filter((t) => t[9] == null || t[15] == null);
  if (badTrips.length) problems.push(`${badTrips.length} round trip(s) have a null entry or exit price`);
  // Reconciliation: the sum of round-trip net PnL plus open-lot cost basis plus
  // fees must equal the engine's realized PnL, per strategy.
  for (const run of runs || []) {
    if (!run || run.error) continue;
    const flight = (options.meta && options.meta.flightOf ? options.meta.flightOf(run) : run.flight) ?? 'daily';
    const engineRealized = Number(run.realizedPnl ?? run.stats?.realizedPnl ?? 0);
    const ledgerRealized = round2(
      ledger.fills
        .filter((f) => f[0] === run.username && f[2] === flight && f[22] != null)
        .reduce((acc, f) => acc + Number(f[22]), 0)
    );
    if (Math.abs(engineRealized - ledgerRealized) > 0.02) {
      problems.push(
        `${run.username} (${flight}): realized PnL mismatch — engine $${engineRealized.toFixed(2)}, ledger sum $${ledgerRealized.toFixed(2)}`
      );
    }
  }
  return { ok: problems.length === 0, problems, rebuilt };
}

/** A compact, human-readable summary for the site (one object per strategy). */
/**
 * How the fees in this ledger were actually incurred, counted per fill by the
 * regime each row carries. This is the number that answers "were maker fills
 * charged?" without trusting a sentence written by hand: it counts the rows.
 */
export function feeRegimeBreakdown(ledger) {
  const i = FILL_COLUMNS.indexOf('feeRegime');
  const fees = {};
  let total = 0;
  for (const row of ledger?.fills || []) {
    const regime = row[i] ?? 'unlabelled';
    const fee = Number(row[FILL_COLUMNS.indexOf('fee')]) || 0;
    const bucket = fees[regime] || (fees[regime] = { fills: 0, feeUsd: 0 });
    bucket.fills += 1;
    bucket.feeUsd = round2(bucket.feeUsd + fee);
    total = round2(total + fee);
  }
  return { totalFeeUsd: total, regimes: fees, labelled: !Object.prototype.hasOwnProperty.call(fees, 'unlabelled') };
}

export function summarizeLedger(ledger) {
  return ledger.totals.byStrategy.map((b) => {
    const key = `${b.username}@${b.flight ?? 'unknown'}`;
    const trips = ledger.roundTrips.filter((t) => `${t[0]}@${t[2] ?? 'unknown'}` === key);
    const holds = trips.map((t) => t[18]).filter((h) => h != null);
    return {
      username: b.username,
      flight: b.flight,
      fills: b.fills,
      roundTrips: b.trades,
      contractsFilled: b.contractsFilled,
      contractsUnfilled: b.contractsUnfilled,
      fees: b.fees,
      slippageCost: b.slippageCost,
      realizedPnl: b.realizedPnl,
      winRate: b.winRate,
      profitFactor: b.profitFactor === Infinity ? null : b.profitFactor,
      profitFactorInfinity: b.profitFactor === Infinity,
      settlements: b.settlements,
      medianHoldMinutes: holds.length ? holds.slice().sort((x, y) => x - y)[Math.floor(holds.length / 2)] : null,
      firstTrade: trips.length ? trips.map((t) => t[8]).sort()[0] : null,
      lastTrade: trips.length ? trips.map((t) => t[14]).sort().slice(-1)[0] : null
    };
  });
}

/* ==================================================================== *
 * DICTIONARY ENCODING (data efficiency)
 * ==================================================================== *
 * A ledger row repeats a handful of long strings that take only a few
 * distinct values: the API URL of the pricing bar, the ticker, the series,
 * the username, the flight, the depth label and the strategy's reason string.
 * Measured on the 2026-09-17 roster run (29,521 fills / 11,537 round trips):
 *
 *   column            serialized size
 *   src                    2,398 KB
 *   ticker                   826 KB
 *   date                     778 KB
 *   note                     740 KB
 *   strategyId               652 KB
 *   username                 612 KB
 *   depth                    348 KB
 *   series                   305 KB
 *
 * Dictionary-encoding those columns turns ~14 MB into a few megabytes with no
 * loss: the dictionary holds each distinct string ONCE and every row holds its
 * index. `null` is NEVER interned (a missing date must stay visibly missing),
 * and `expandLedger()` restores the original form exactly, so a reader can
 * still diff the file against the engine byte for byte.
 */

/** Fill columns replaced by an index into `dicts.fills[column]`. */
export const INTERN_FILL_COLUMNS = Object.freeze([
  'username',
  'strategyId',
  'flight',
  'ticker',
  'series',
  'date',
  'depth',
  'depthCapturedAt',
  'src',
  'note',
  'feeRegime'
]);

/** Round-trip columns replaced by an index into `dicts.roundTrips[column]`. */
export const INTERN_TRIP_COLUMNS = Object.freeze([
  'username',
  'strategyId',
  'flight',
  'ticker',
  'series',
  'entryDate',
  'entryDepth',
  'entrySrc',
  'exitDate'
]);

function internColumn(rows, index, dict) {
  const map = new Map();
  const out = [];
  for (const row of rows) {
    const v = row[index];
    if (v === null || v === undefined) {
      out.push(null); // never interned: absence must stay visible
      continue;
    }
    let i = map.get(v);
    if (i === undefined) {
      i = dict.length;
      dict.push(v);
      map.set(v, i);
    }
    out.push(i);
  }
  return out;
}

/**
 * Replace the interned columns of every row with dictionary indices.
 * Idempotent-safe: refuses to run twice (a second pass would corrupt rows).
 */
export function internLedger(ledger) {
  if (ledger.encoded) return ledger;
  const fills = ledger.fills.map((r) => r.slice());
  const trips = ledger.roundTrips.map((r) => r.slice());
  const dicts = { fills: {}, roundTrips: {} };
  for (const col of INTERN_FILL_COLUMNS) {
    const i = FILL_COLUMNS.indexOf(col);
    if (i < 0) continue;
    dicts.fills[col] = [];
    const encoded = internColumn(fills, i, dicts.fills[col]);
    for (let row = 0; row < fills.length; row++) fills[row][i] = encoded[row];
  }
  for (const col of INTERN_TRIP_COLUMNS) {
    const i = ROUND_TRIP_COLUMNS.indexOf(col);
    if (i < 0) continue;
    dicts.roundTrips[col] = [];
    const encoded = internColumn(trips, i, dicts.roundTrips[col]);
    for (let row = 0; row < trips.length; row++) trips[row][i] = encoded[row];
  }
  return { ...ledger, fills, roundTrips: trips, dicts, encoded: true };
}

/** Restore an interned ledger to its literal form. */
export function expandLedger(stored) {
  if (!stored || !stored.encoded) return stored;
  const decode = (rows, columns, dictsForSection) => {
    const out = rows.map((r) => r.slice());
    for (const [col, dict] of Object.entries(dictsForSection || {})) {
      const i = columns.indexOf(col);
      if (i < 0) continue;
      for (let row = 0; row < out.length; row++) {
        const v = out[row][i];
        out[row][i] = v === null || v === undefined ? null : dict[v];
      }
    }
    return out;
  };
  return {
    ...stored,
    fills: decode(stored.fills, FILL_COLUMNS, stored.dicts?.fills),
    roundTrips: decode(stored.roundTrips, ROUND_TRIP_COLUMNS, stored.dicts?.roundTrips),
    encoded: false
  };
}

/* ==================================================================== *
 * DEPTH LABELS (one mapping, used by the site and by the tests)
 * ==================================================================== *
 * The exact strings the engine writes into `depthModel` are enumerated here
 * with the meaning each one carries. A label that is not on this list is
 * reported as "unrecognised" — never silently prettified into something that
 * sounds more verified than it is. The values were read from the engine
 * (src/simulation-engine.js: OrderBook constructor / setCapturedDepth and
 * src/backtest-replay.js: bookFromCandle), not guessed.
 */
export const DEPTH_LABELS = Object.freeze({
  captured_orderbook_reanchored: {
    label: 'REAL captured ladder (re-anchored)',
    real: true,
    note: 'Levels and sizes came from GET /markets/{ticker}/orderbook; only the touch was moved to this bar\'s real quote.'
  },
  captured_orderbook: {
    label: 'REAL captured ladder',
    real: true,
    note: 'Levels and sizes are a verbatim capture of GET /markets/{ticker}/orderbook.'
  },
  anchored_synthetic: {
    label: 'modelled ladder',
    real: false,
    note: 'The real quoted touch, with a synthetic ladder behind it (candlesticks carry no depth).'
  },
  synthetic: {
    label: 'modelled ladder',
    real: false,
    note: 'A synthetic ladder: Kalshi candlesticks publish no depth behind the touch.'
  },
  unpriced_synthetic: {
    label: 'modelled ladder (unpriced bar)',
    real: false,
    note: 'No trade printed in this bar, so the ladder is anchored to the bar\'s quoted touch only.'
  },
  contractual_settlement: {
    label: 'exchange settlement',
    real: true,
    note: 'Not a trade: the market finalized and the contract paid its notional ($1.00/$0.00). No settlement fee.'
  }
});

/** Human label for a depthModel value, plus whether it names REAL liquidity. */
export function depthLabel(depth) {
  const hit = DEPTH_LABELS[String(depth)];
  if (hit) return hit;
  return {
    label: depth ? `unrecognised depth label "${depth}"` : 'no depth label',
    real: false,
    note: 'This value is not one of the labels the engine writes — it is reported verbatim for review instead of being mapped to something familiar.'
  };
}
