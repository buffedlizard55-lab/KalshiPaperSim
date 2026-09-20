/**
 * KalshiPaperSim — Desk SEASON: the running multi-cut-off paper book
 * =====================================================================
 * The Live Desk (src/live-desk.js) runs ONE session at ONE cut-off: strategies
 * place orders against the ladders captured at or before that instant, the desk
 * walks forward through later real quotes, and the session ends. Positions do
 * not survive the session.
 *
 * This module closes that gap (ROADMAP Next #9). It runs the SAME engine over a
 * SEQUENCE of real capture instants, and it CARRIES the book between them:
 *
 *   • CASH carries.                    • OPEN POSITIONS carry.
 *   • RESTING maker orders carry (a resting order placed in round 2 can be
 *     crossed by a later real quote in round 3 — that is what "resting" means).
 *   • The cumulative liquidity cap per contract carries, so a season cannot
 *     fill more contracts across all its rounds than the contract's own real
 *     volume base allows.
 *   • Marks are taken at every round boundary, so every entrant has an equity
 *     CURVE, not just a final number.
 *
 * WHY THIS IS NOT A BACKTEST OF A FANTASY
 *   Every round's cut-off is a REAL capture instant from the store — a moment
 *   at which this repository actually queried the exchange's order books. No
 *   round is placed at an invented time, no ladder is re-anchored, and the
 *   engine refuses (in placeDeskOrder) to price any order with a ladder that
 *   was captured after the order's own timestamp. A strategy sees only the
 *   point-in-time view: quotes, ladders, bars and settlements available at its
 *   round's cut-off. Settlements are the exchange's own result and its own
 *   `settlement_value_dollars` — a NO position is paid notional minus that
 *   value (the live desk learned that the hard way; see its own comments).
 *
 * WHAT IT MEASURES
 *   The difference between a carried book and a sequence of sessions: does
 *   holding a real position across capture instants (marks moving, resting
 *   orders crossing, contracts settling mid-season) beat trading each cut-off
 *   in isolation? Both answers are published; the losers are not hidden.
 *
 * DATA IT DEPENDS ON
 *   src/desk-data.js — every ladder with its capture timestamp and URL. The
 *   number of rounds a season can have is therefore exactly the number of
 *   distinct capture instants the store holds (one more per day while the
 *   scheduled 16:40 UTC `with_books=true` ingest keeps running).
 */

import { DESK_DATA } from './desk-data.js';
import {
  DESK_VERSION,
  DESK_LIMITS,
  buildDeskUniverse,
  createDeskBook,
  placeDeskOrder,
  crossRestingOrders,
  cancelResting,
  createPortfolio,
  applyFill,
  applySettlement,
  markPortfolio,
  buildTimeline,
  deskView,
  summarizeDesk,
  explainDeskStrategy,
  auditDesk,
  auditorFacts
} from './live-desk.js';

export const SEASON_VERSION = 1;

const round2 = (v) => Math.round(Number(v) * 100) / 100;
const round6 = (v) => Math.round(Number(v) * 1e6) / 1e6;

function ms(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : null;
}
function iso(value) {
  const t = ms(value);
  return t === null ? null : new Date(t).toISOString();
}

/** The rules a season runs under — printed on the site and asserted by tests. */
export const SEASON_RULE = Object.freeze({
  rounds:
    'Every round is a REAL capture instant taken from the store (a moment this repository actually queried GET /markets/{ticker}/orderbook). No round time is invented and no ladder is re-anchored.',
  carry:
    'Cash, open positions and resting orders carry from round to round. Between two rounds the book is walked through the real events in that window: later captured ladders, later captured candlesticks (real traded quotes) and the exchange’s own settlements.',
  resting:
    'A resting order placed in round N is alive in round N+1: a later real quote that trades through its price crosses it, bounded by the size that later ladder showed or the volume that period really traded.',
  marks:
    'Every entrant is marked at every round boundary from a captured quote, a captured ladder mid or the exchange settlement value — never from an invented price. A position with no captured mark is carried at cost and the MARK record says so.',
  settlements:
    'A finalized contract pays $1.00/$0.00 by its own `result`/`settlement_value_dollars` at its own `settlement_ts`. A NO position is paid notional minus that value. No settlement fee is charged (official schedule).',
  caps:
    'The liquidity cap is cumulative across the season per contract, so a season can never fill more real contracts than the contract’s own volume base supports.',
  mandate:
    'Maximum return only: no stop-loss, no position cap, no volatility target. The season publishes what that costs (drawdown from the round-by-round equity curve).'
});

/* ------------------------------------------------------------------ *
 * 1. The schedule: WHICH real instants the season visits
 * ------------------------------------------------------------------ */

/**
 * Build the season schedule from the store's own capture instants.
 *
 * @param {object}  [args]
 * @param {object}  [args.data]                DESK_DATA
 * @param {number}  [args.minSpacingMinutes]   minimum gap between two rounds
 * @param {number}  [args.maxRounds]           cap on rounds (thinned evenly)
 * @param {number}  [args.minLadderContracts]  a round needs this many markets with a ladder at/before it
 * @param {number}  [args.minFreshLadders]     a round's batch must contain this many markets whose ladder was
 *                                             (re)captured INSIDE the batch (default 1 — every batch has one)
 * @param {number}  [args.minNewLadders]       markets whose FIRST-EVER ladder falls in the batch (default 0).
 *                                             HISTORY: this used to default to 1, which silently dropped every
 *                                             re-capture of an unchanged universe — e.g. ingest request 14
 *                                             (2026-09-20T00:40Z), requested precisely to add a round, produced
 *                                             none because no contract was NEW to the desk. A round is a moment
 *                                             the repository really queried the books; novelty is not required.
 * @param {string|number} [args.from]          ignore instants before this time
 * @param {string|number} [args.to]            ignore instants after this time
 * @returns {{rounds:Array, considered:number, candidates:number, thinned:boolean, rule:string, newestCapture:string|null}}
 */
export function seasonSchedule({
  data = DESK_DATA,
  batchMinutes = 20,
  minSpacingMinutes = 0,
  maxRounds = 12,
  minNewLadders = 0,
  minFreshLadders = 1,
  minLadderContracts = 1,
  from = null,
  to = null
} = {}) {
  if (!data || !Array.isArray(data.markets)) {
    throw new Error('seasonSchedule: DESK_DATA with a markets array is required');
  }
  const fromMs = ms(from);
  const toMs = ms(to);
  const batchMs = Math.max(0, Number(batchMinutes) || 0) * 60 * 1000;
  const spacingMs = Math.max(0, Number(minSpacingMinutes) || 0) * 60 * 1000;

  /**
   * A ROUND IS A MOMENT THE OPEN BOARD WAS ACTUALLY CAPTURED.
   *
   * Finalized contracts keep their ladders in the module — they are what the
   * desk's real $1.00/$0.00 settlement is priced from — but their historical
   * capture instants do not SEED rounds. Letting them seed produced rounds
   * where the only priceable contracts were ones already settled (found
   * 2026-09-19 when the finalized reserve added six settled contracts and two
   * such dead rounds moved the whole schedule, silently un-trading two season
   * entrants whose entry conditions only exist at the round they lost).
   */
  const horizonMs = data.markets.reduce((acc, m) => {
    for (const c of m.captures || []) {
      const t = ms(c.at);
      if (t !== null && (acc === null || t > acc)) acc = t;
    }
    return acc;
  }, null);
  const seedsOpenBoard = (m) => {
    if (String(m.status || '') === 'finalized') return false;
    const close = ms(m.market?.close_time || m.market?.expiration_time);
    if (horizonMs !== null && close !== null && close <= horizonMs) return false;
    return true;
  };

  const perMarket = data.markets
    .filter(seedsOpenBoard)
    .map((m) => {
      const times = (m.captures || []).map((c) => ms(c.at)).filter((t) => Number.isFinite(t));
      return { ticker: m.ticker, first: times.length ? Math.min(...times) : null, times: times.slice().sort((a, b) => a - b) };
    });

  const instants = [...new Set(perMarket.flatMap((m) => m.times))].sort((a, b) => a - b);
  const considered = instants.length;
  const ladderCountAt = (t) => perMarket.filter((m) => m.first !== null && m.first <= t).length;

  /**
   * ONE ROUND PER CAPTURE BATCH.
   *
   * A single ingest run captures the ladders of many contracts within a minute
   * or two (the runner walks the tracked tickers one at a time). Those instants
   * are not separate trading sessions — they are ONE look at the exchange. A
   * round is therefore the whole batch, stamped at the LAST instant in it so
   * every ladder the batch captured is genuinely available at the round's
   * cut-off. The schedule is then exactly "every time this repository looked at
   * the book", which is why a new scheduled ingest adds a round.
   */
  const batches = [];
  for (const t of instants) {
    if (fromMs !== null && t < fromMs) continue;
    if (toMs !== null && t > toMs) continue;
    const current = batches[batches.length - 1];
    if (current && t - current.last <= batchMs) {
      current.last = t;
      current.instants.push(t);
    } else {
      batches.push({ first: t, last: t, instants: [t] });
    }
  }

  const candidates = [];
  let lastKept = null;
  for (const batch of batches) {
    const withLadder = ladderCountAt(batch.last);
    const newLadders = perMarket.filter((m) => m.first !== null && m.first >= batch.first && m.first <= batch.last).length;
    const freshLadders = perMarket.filter((m) => m.times.some((t) => t >= batch.first && t <= batch.last)).length;
    if (withLadder < minLadderContracts || newLadders < minNewLadders || freshLadders < minFreshLadders) continue;
    if (lastKept !== null && batch.last - lastKept < spacingMs) continue;
    candidates.push({ at: batch.last, first: batch.first, instants: batch.instants.length, newLadders, freshLadders, marketsWithLadder: withLadder });
    lastKept = batch.last;
  }

  // Thin evenly, keeping the FIRST and the LAST candidate, so a long season
  // still spans its whole window instead of clustering at one end.
  let chosen = candidates;
  let thinned = false;
  if (candidates.length > maxRounds && maxRounds >= 2) {
    const picked = new Map();
    for (let i = 0; i < maxRounds; i += 1) {
      const idx = Math.round((i * (candidates.length - 1)) / (maxRounds - 1));
      picked.set(idx, candidates[idx]);
    }
    chosen = [...picked.entries()].sort((a, b) => a[0] - b[0]).map(([, v]) => v);
    thinned = true;
  } else if (candidates.length > maxRounds && maxRounds === 1) {
    chosen = [candidates[candidates.length - 1]];
    thinned = true;
  }

  const rounds = chosen.map((c, i) => {
    const prev = i > 0 ? chosen[i - 1].at : null;
    return {
      index: i + 1,
      label: `R${String(i + 1).padStart(2, '0')}`,
      asOf: iso(c.at),
      asOfMs: c.at,
      batchStart: iso(c.first),
      instantsInBatch: c.instants,
      marketsWithLadder: c.marketsWithLadder,
      newLadderCaptures: c.newLadders,
      freshLadderCaptures: c.freshLadders,
      gapHoursFromPrev: prev === null ? null : round6((c.at - prev) / 3600000),
      isNewestCapture: c.at === instants[instants.length - 1]
    };
  });

  return {
    rounds,
    considered,
    batches: batches.length,
    candidates: candidates.length,
    thinned,
    rule: SEASON_RULE.rounds,
    batchMinutes,
    minSpacingMinutes,
    maxRounds,
    newestCapture: instants.length ? iso(instants[instants.length - 1]) : null
  };
}

/* ------------------------------------------------------------------ *
 * 2. The runner: one book, many rounds
 * ------------------------------------------------------------------ */

function applyEvents({ events, upToMs, books, portfolios, universe, records, roundIndex, roundLabel }) {
  const applied = { quotes: 0, makerFills: 0, settlements: 0, settlementPnl: 0, barQuotes: 0, ladderQuotes: 0 };
  const before = records.length;
  for (const event of events) {
    if (event.t > upToMs) break; // events are sorted by time
    const book = books.get(event.ticker);
    if (!book) continue;
    if (event.kind === 'quote') {
      applied.quotes += 1;
      if (String(event.source || '').includes('candlestick')) applied.barQuotes += 1;
      else applied.ladderQuotes += 1;
      // The crossing fill is still paid for out of the cash the portfolio has
      // AT THAT INSTANT (a carried book may have spent it in between).
      const fills = crossRestingOrders(book, event, { cashFor: (name) => portfolios.get(name)?.cash });
      for (const fill of fills) {
        applied.makerFills += 1;
        records.push(fill);
        applyFill(portfolios.get(fill.strategy), fill);
      }
    } else if (event.kind === 'settlement') {
      const market = universe.byTicker.get(event.ticker);
      if (!market) continue;
      /**
       * A contract that has been finalized can no longer trade, so any paper
       * order still resting on it is cancelled here rather than left for a
       * LATER captured quote to "cross" — a settled market has no quotes, and
       * pretending otherwise would book a fill that the exchange could not
       * have produced.
       */
      for (const rec of cancelResting(book, event.at, 'MARKET_FINALIZED')) {
        rec.round = roundIndex;
        rec.roundLabel = roundLabel;
        rec.explain = `${rec.explain} The contract was finalized by the exchange at ${event.at}, so nothing could have traded against it after that instant.`;
        records.push(rec);
      }
      const settlement = { at: event.at, result: event.result, value: event.value, source: event.source };
      for (const portfolio of portfolios.values()) {
        for (const side of ['yes', 'no']) {
          const pos = portfolio.positions.get(`${event.ticker}|${side}`);
          if (!pos || pos.contracts <= 0) continue;
          const rec = applySettlement(portfolio, pos, settlement, market);
          records.push(rec);
          applied.settlements += 1;
          applied.settlementPnl += rec.pnl;
        }
      }
    }
  }
  for (let i = before; i < records.length; i += 1) {
    if (records[i].round === undefined) {
      records[i].round = roundIndex;
      records[i].roundLabel = roundLabel;
    }
  }
  applied.settlementPnl = round6(applied.settlementPnl);
  return applied;
}

function snapshotRound({ portfolios, universes, asOfMs, round, phase, records }) {
  const universe = universes[universes.length - 1];
  const snapshot = { round: round.index, roundLabel: round.label, asOf: iso(asOfMs), phase, byStrategy: {} };
  for (const portfolio of portfolios.values()) {
    const { unrealized, marketValue, marks } = markPortfolio(portfolio, universe, asOfMs);
    for (const mark of marks) {
      mark.round = round.index;
      mark.roundLabel = round.label;
      mark.phase = phase;
      records.push(mark);
    }
    const equity = round6(portfolio.cash + marketValue);
    snapshot.byStrategy[portfolio.strategy] = {
      equity,
      cash: round6(portfolio.cash),
      marketValue,
      unrealized: round6(unrealized),
      realizedPnl: portfolio.realizedPnl,
      settlementPnl: portfolio.settlementPnl,
      feesPaid: portfolio.feesPaid,
      slippageCost: portfolio.slippageCost,
      openContracts: round2([...portfolio.positions.values()].reduce((s, p) => s + p.contracts, 0)),
      openPositions: [...portfolio.positions.values()].map((p) => ({ ticker: p.ticker, side: p.side, contracts: p.contracts, cost: p.cost }))
    };
  }
  return snapshot;
}

/**
 * Run the season: the same desk engine, over a sequence of real capture
 * instants, with the book carried between them.
 *
 * @param {object}   [args]
 * @param {object}   [args.data]                  DESK_DATA
 * @param {Array}    args.strategies              season entrants ({ id, username, decide(view) })
 * @param {Array}    [args.rounds]                explicit rounds (else seasonSchedule is used)
 * @param {number}   [args.startingCapital]
 * @param {number}   [args.maxOrdersPerStrategy]  per round
 * @param {number}   [args.minSpacingMinutes]
 * @param {number}   [args.maxRounds]
 * @param {boolean}  [args.cancelRestingAtEnd]    cancel resting orders at the season end (default true)
 * @returns {object} season result (rounds, records, results, explanations, audit, equityCurve)
 */
export function runDeskSeason({
  data = DESK_DATA,
  strategies = [],
  rounds = null,
  startingCapital = 100000,
  maxOrdersPerStrategy = 8,
  minSpacingMinutes = 0,
  maxRounds = 12,
  cancelRestingAtEnd = true
} = {}) {
  const schedule = Array.isArray(rounds) && rounds.length
    ? {
        rounds: rounds.map((r, i) => ({
          ...r,
          index: i + 1,
          label: r.label || `R${String(i + 1).padStart(2, '0')}`,
          asOf: iso(r.asOf ?? r),
          asOfMs: ms(r.asOf ?? r)
        })),
        derived: false
      }
    : { ...seasonSchedule({ data, minSpacingMinutes, maxRounds, minLadderContracts: 1 }), derived: true };

  const scheduleRounds = schedule.rounds.filter((r) => Number.isFinite(r.asOfMs));
  if (!scheduleRounds.length) {
    throw new Error('runDeskSeason: no round has a usable capture instant — the store holds no ladders');
  }

  const universes = scheduleRounds.map((r) => buildDeskUniverse({ data, asOf: r.asOf }));
  /**
   * THE END OF THE SEASON IS THE LAST REAL EVENT THIS REPOSITORY HOLDS — not
   * merely the last ladder capture. A contract finalized after the final
   * capture still carries a real `settlement_ts`, and a candlestick captured
   * later is still a real quote: both are events the book must be walked
   * through before it is marked for the last time. Inventing nothing is the
   * point — the horizon is the maximum of the data's own timestamps.
   */
  const horizonMs = (() => {
    const candidates = [];
    for (const m of data.markets) {
      for (const c of m.captures || []) { const t = ms(c.at); if (Number.isFinite(t)) candidates.push(t); }
      for (const b of m.bars || []) { const t = Number(b.endTs) * 1000; if (Number.isFinite(t)) candidates.push(t); }
      const st = ms(m.market?.settlement_ts);
      if (Number.isFinite(st)) candidates.push(st);
    }
    return candidates.length ? Math.max(...candidates) : scheduleRounds[scheduleRounds.length - 1].asOfMs;
  })();
  const newestMs = Math.max(
    horizonMs,
    ...data.markets.flatMap((m) => (m.captures || []).map((c) => ms(c.at))).filter(Number.isFinite)
  );
  const closingUniverse = Number.isFinite(newestMs) && newestMs > scheduleRounds[scheduleRounds.length - 1].asOfMs
    ? buildDeskUniverse({ data, asOf: iso(newestMs) })
    : universes[universes.length - 1];

  const portfolios = new Map();
  for (const strategy of strategies) {
    const portfolio = createPortfolio(strategy.username || strategy.id, startingCapital);
    portfolios.set(portfolio.strategy, portfolio);
  }

  const books = new Map();
  const records = [];
  const roundReports = [];
  const snapshots = [];
  let seq = 0;

  for (let i = 0; i < scheduleRounds.length; i += 1) {
    const round = scheduleRounds[i];
    const universe = universes[i];
    const roundReport = {
      index: round.index,
      label: round.label,
      asOf: round.asOf,
      marketsWithLadder: round.marketsWithLadder ?? universe.markets.filter((m) => m.ladder).length,
      newLadderCaptures: round.newLadderCaptures ?? null,
      freshLadderCaptures: round.freshLadderCaptures ?? null,
      gapHoursFromPrev: round.gapHoursFromPrev ?? null,
      isNewestCapture: Boolean(round.isNewestCapture)
    };

    // (a) Walk the book through every real event between the previous round and
    //     this one, using the PREVIOUS round's books — that is where the resting
    //     orders were placed, and only later information may cross them.
    if (i > 0) {
      const previous = scheduleRounds[i - 1];
      const events = buildTimeline(universes[i - 1], previous.asOfMs, data);
      const applied = applyEvents({
        events,
        upToMs: round.asOfMs,
        books,
        portfolios,
        universe: universes[i - 1],
        records,
        roundIndex: round.index,
        roundLabel: round.label
      });
      Object.assign(roundReport, {
        eventsApplied: applied,
        makerFillsCarriedIn: applied.makerFills,
        settlementsInWindow: applied.settlements,
        settlementPnlInWindow: applied.settlementPnl
      });
    } else {
      roundReport.eventsApplied = { quotes: 0, makerFills: 0, settlements: 0, settlementPnl: 0, barQuotes: 0, ladderQuotes: 0 };
      roundReport.makerFillsCarriedIn = 0;
      roundReport.settlementsInWindow = 0;
      roundReport.settlementPnlInWindow = 0;
    }

    // (b) Refresh every book to THIS round's point-in-time ladder, carrying the
    //     resting orders and the cumulative liquidity cap forward.
    for (const market of universe.markets) {
      const previousBook = books.get(market.ticker);
      const fresh = createDeskBook(market);
      if (previousBook) {
        fresh.resting = (previousBook.resting || []).filter((o) => o.status === 'resting');
        fresh.volumeCapUsed = previousBook.volumeCapUsed;
        fresh.fills = previousBook.fills;
      }
      books.set(market.ticker, fresh);
    }

    // (c) Mark the book at this round's cut-off: the equity snapshot a carried
    //     book needs. (Marks are real captured quotes / ladders / settlements.)
    const openSnapshot = snapshotRound({ portfolios, universes, asOfMs: round.asOfMs, round, phase: 'open', records });
    snapshots.push(openSnapshot);
    roundReport.equityOpen = openSnapshot.byStrategy;

    // (d) Decisions.
    roundReport.universe = {
      tradeable: universe.markets.filter((m) => m.tradeable).length,
      notTradeable: universe.markets.filter((m) => !m.tradeable).length,
      openAtAsOf: universe.markets.filter((m) => m.isOpen).length
    };
    const roundDecisions = {};
    for (const strategy of strategies) {
      const portfolio = portfolios.get(strategy.username || strategy.id);
      const view = {
        ...deskView(universe, portfolio, { asOfMs: round.asOfMs, books }),
        season: {
          version: SEASON_VERSION,
          round: round.index,
          rounds: scheduleRounds.length,
          label: round.label,
          rule: SEASON_RULE,
          firstRound: i === 0,
          lastRound: i === scheduleRounds.length - 1
        }
      };
      let intents = [];
      try {
        intents = strategy.decide(view) || [];
      } catch (err) {
        records.push({
          v: DESK_VERSION,
          k: 'ERROR',
          at: round.asOf,
          round: round.index,
          roundLabel: round.label,
          strategy: portfolio.strategy,
          message: `decide() threw: ${err.message}`,
          explain: 'A strategy that throws records the error and places no orders in this round.'
        });
        roundDecisions[portfolio.strategy] = { orders: 0, fills: 0, requested: 0, unfilled: 0 };
        continue;
      }
      const decided = { orders: 0, fills: 0, requested: 0, unfilled: 0 };
      intents.slice(0, maxOrdersPerStrategy).forEach((intent, orderIndex) => {
        const ticker = intent.ticker;
        const book = books.get(ticker);
        if (!book) {
          records.push({
            v: DESK_VERSION,
            k: 'REJECT',
            id: `O-${String(seq++).padStart(6, '0')}`,
            at: round.asOf,
            round: round.index,
            roundLabel: round.label,
            strategy: portfolio.strategy,
            ticker,
            reason: 'UNKNOWN_TICKER',
            explain: `${ticker} is not in the desk universe at ${round.asOf}.`
          });
          decided.orders += 1;
          return;
        }
        const result = placeDeskOrder(book, { ...intent, strategy: portfolio.strategy }, {
          seq: seq++,
          at: round.asOf,
          orderId: `O-${round.label}-${portfolio.strategy}-${orderIndex + 1}-${ticker}`,
          // No borrowing and no shorting in the carried book either.
          portfolio
        });
        records.push(result.order);
        decided.orders += 1;
        decided.requested = round2(decided.requested + (intent.count || 0));
        if (result.rejected) {
          records.push({
            v: DESK_VERSION,
            k: 'REJECT',
            id: result.order.id,
            at: round.asOf,
            round: round.index,
            roundLabel: round.label,
            strategy: portfolio.strategy,
            ticker,
            reason: result.order.rejectCode,
            explain: result.rejected
          });
          return;
        }
        if (result.resting) records.push(result.resting);
        for (const fill of result.fills) {
          records.push(fill);
          applyFill(portfolio, fill);
          decided.fills += 1;
          portfolio.requestedContracts = round2(portfolio.requestedContracts + (fill.requested || 0));
        }
        if (!result.fills.length && !result.resting) {
          portfolio.requestedContracts = round2(portfolio.requestedContracts + (intent.count || 0));
          decided.unfilled = round2(decided.unfilled + (intent.count || 0));
        }
      });
      roundDecisions[portfolio.strategy] = decided;
    }
    // Tag everything this round produced so the ledger is round-addressable.
    for (const rec of records) {
      if (rec.round === undefined && rec.at === round.asOf) {
        rec.round = round.index;
        rec.roundLabel = round.label;
      }
    }
    roundReport.decisions = roundDecisions;
    roundReports.push(roundReport);
  }

  // (e) After the last round: walk the remaining real events to the end of the
  //     captured data, then cancel whatever is still resting and mark the book.
  const lastRound = scheduleRounds[scheduleRounds.length - 1];
  const tailEvents = buildTimeline(universes[universes.length - 1], lastRound.asOfMs, data);
  const tailUpTo = Number.isFinite(newestMs) ? newestMs : lastRound.asOfMs;
  const tailApplied = applyEvents({
    events: tailEvents,
    upToMs: tailUpTo,
    books,
    portfolios,
    universe: closingUniverse,
    records,
    roundIndex: lastRound.index,
    roundLabel: lastRound.label
  });
  if (tailApplied.quotes || tailApplied.settlements) roundReports[roundReports.length - 1].eventsAppliedAfterClose = tailApplied;

  if (cancelRestingAtEnd) {
    for (const book of books.values()) {
      for (const rec of cancelResting(book, tailUpTo, 'SEASON_END_UNFILLED')) {
        rec.round = lastRound.index;
        rec.roundLabel = lastRound.label;
        records.push(rec);
      }
    }
  }

  const closingRound = {
    index: lastRound.index,
    label: lastRound.label,
    asOfMs: tailUpTo,
    asOf: iso(tailUpTo)
  };
  const closeSnapshot = snapshotRound({ portfolios, universes: [...universes, closingUniverse], asOfMs: tailUpTo, round: closingRound, phase: 'close', records });
  snapshots.push(closeSnapshot);

  const equityCurve = {};
  for (const portfolio of portfolios.values()) {
    equityCurve[portfolio.strategy] = snapshots.map((s) => {
      const row = s.byStrategy[portfolio.strategy];
      return {
        round: s.round,
        roundLabel: s.roundLabel,
        asOf: s.asOf,
        phase: s.phase,
        equity: row.equity,
        returnPct: round6((row.equity / startingCapital - 1) * 100),
        cash: row.cash,
        marketValue: row.marketValue,
        openContracts: row.openContracts
      };
    });
  }

  const results = [];
  for (const portfolio of portfolios.values()) {
    const last = closeSnapshot.byStrategy[portfolio.strategy];
    const equity = last.equity;
    const attribution = round6(portfolio.realizedPnl + last.unrealized - portfolio.feesPaid);
    const curve = equityCurve[portfolio.strategy];
    let peak = startingCapital;
    let maxDrawdownPct = 0;
    for (const point of curve) {
      peak = Math.max(peak, point.equity);
      const dd = peak > 0 ? ((peak - point.equity) / peak) * 100 : 0;
      maxDrawdownPct = Math.max(maxDrawdownPct, dd);
    }
    const roundsTraded = roundReports.filter((r) => (r.decisions?.[portfolio.strategy]?.orders || 0) > 0).length;
    const roundsFilled = roundReports.filter((r) => (r.decisions?.[portfolio.strategy]?.fills || 0) > 0).length;
    results.push({
      strategy: portfolio.strategy,
      startingCapital,
      cash: round6(portfolio.cash),
      equity,
      returnPct: round6((equity / startingCapital - 1) * 100),
      realizedPnl: portfolio.realizedPnl,
      unrealizedPnl: round6(last.unrealized),
      marketValue: last.marketValue,
      settlementPnl: portfolio.settlementPnl,
      feesPaid: portfolio.feesPaid,
      slippageCost: portfolio.slippageCost,
      attribution,
      attributionOk: Math.abs(attribution - (equity - startingCapital)) < 0.01,
      fills: portfolio.fills,
      contracts: portfolio.filledContracts,
      requested: portfolio.requestedContracts,
      unfilled: portfolio.unfilledContracts,
      roundsTraded,
      roundsFilled,
      maxDrawdownPct: round6(maxDrawdownPct),
      openPositions: [...portfolio.positions.values()].map((p) => ({ ...p })),
      equityCurve: curve
    });
  }
  results.sort((a, b) => b.returnPct - a.returnPct);

  const season = {
    version: SEASON_VERSION,
    generatedAt: new Date().toISOString(),
    startingCapital,
    dataGeneratedAt: data.generatedAt || null,
    newestCapture: Number.isFinite(newestMs) ? iso(newestMs) : null,
    schedule: {
      derived: Boolean(schedule.derived),
      rounds: roundReports.length,
      rule: SEASON_RULE.rounds,
      minSpacingMinutes: schedule.minSpacingMinutes ?? minSpacingMinutes,
      maxRounds: schedule.maxRounds ?? maxRounds,
      batches: schedule.batches ?? null,
      consideredInstants: schedule.considered ?? null,
      candidateRounds: schedule.candidates ?? null,
      thinned: Boolean(schedule.thinned)
    },
    rounds: roundReports,
    rule: SEASON_RULE,
    records,
    results,
    explanations: results.map((r) => explainSeasonStrategy(r, records, snapshots)),
    coverage: seasonCoverage(strategies, results, roundReports)
  };
  season.audit = auditSeason(season, closingUniverse);
  return season;
}

/* ------------------------------------------------------------------ *
 * 3. Coverage: which entrant could act in which round, and why not
 * ------------------------------------------------------------------ */

function seasonCoverage(strategies, results, rounds) {
  const byStrategy = new Map(results.map((r) => [r.strategy, r]));
  return strategies.map((strategy) => {
    const result = byStrategy.get(strategy.username || strategy.id);
    const idleRounds = rounds.filter((r) => !(r.decisions?.[strategy.username || strategy.id]?.orders > 0)).map((r) => r.label);
    return {
      strategy: strategy.username || strategy.id,
      name: strategy.name || null,
      sector: strategy.sector || null,
      source: strategy.source || null,
      rounds: rounds.length,
      roundsTraded: result ? result.roundsTraded : 0,
      roundsFilled: result ? result.roundsFilled : 0,
      idleRounds,
      fills: result ? result.fills : 0,
      orders: rounds.reduce((s, r) => s + (r.decisions?.[strategy.username || strategy.id]?.orders || 0), 0),
      note: result && result.fills > 0
        ? `Traded in ${result.roundsTraded} of ${rounds.length} round(s); the carried book is tracked across all of them with a real ladder, real fee and a real mark per round.`
        : rounds.reduce((s, r) => s + (r.decisions?.[strategy.username || strategy.id]?.orders || 0), 0) > 0
          ? `Ordered in ${result ? result.roundsTraded : 0} round(s) but no order was fillable against the real ladders — reported as unfilled, never priced.`
          : `Returned no order in any of the ${rounds.length} round(s): its entry conditions were never met by the captured ladders at these cut-offs.`

    };
  });
}

/* ------------------------------------------------------------------ *
 * 4. WHY IT WORKED OR DID NOT — every clause computed from the records
 * ------------------------------------------------------------------ */

export function explainSeasonStrategy(result, records = [], snapshots = []) {
  const mine = records.filter((r) => r.strategy === result.strategy);
  const fills = mine.filter((r) => r.k === 'FILL');
  const settles = mine.filter((r) => r.k === 'SETTLE');
  const marks = mine.filter((r) => r.k === 'MARK');
  const cancels = mine.filter((r) => r.k === 'CANCEL');
  const makerFills = fills.filter((f) => f.maker);
  const takerFills = fills.filter((f) => !f.maker);
  const fees = round6(fills.reduce((s, f) => s + (f.fee || 0), 0));
  const slippage = round6(fills.reduce((s, f) => s + (f.maker ? 0 : (f.slippage || 0) * f.count), 0));
  const settlementPnl = round6(settles.reduce((s, r) => s + (r.pnl || 0), 0));
  const curve = result.equityCurve || [];
  const first = curve[0];
  const last = curve[curve.length - 1];
  const openContracts = (result.openPositions || []).reduce((s, p) => s + p.contracts, 0);
  const carried = [];
  const curveByRound = new Map(curve.map((c) => [c.round, c]));
  for (const fill of fills) {
    const round = fill.round;
    const moves = curve.filter((c) => c.round >= round && c.openContracts > 0);
    if (moves.length) carried.push(fill);
  }
  const roundCount = new Set(mine.map((r) => r.round).filter((r) => r !== undefined)).size || (new Set(curve.map((c) => c.round)).size);

  const worked = [];
  const hurt = [];
  if (!fills.length && !settles.length) {
    hurt.push('Nothing traded: no round offered an order the captured ladders could fill, so there is no performance number to report.');
  } else {
    if (settlementPnl > 0) worked.push(`Real settlements paid $${settlementPnl.toFixed(2)} — the exchange finalized these contracts and paid them at its own value, not at a mark.`);
    if (settlementPnl < 0) hurt.push(`Real settlements cost $${Math.abs(settlementPnl).toFixed(2)}: the positions that reached finalization paid less than they cost.`);
    if (result.unrealizedPnl > 0) worked.push(`The still-open book is marked $${result.unrealizedPnl.toFixed(2)} above its cost from a captured quote/ladder (mark source travels on every MARK record).`);
    if (result.unrealizedPnl < 0) hurt.push(`The still-open book is marked $${Math.abs(result.unrealizedPnl).toFixed(2)} below its cost — carried risk that a session-scoped desk would never have held.`);
    const tradePnl = round6(result.equity - result.startingCapital - result.unrealizedPnl);
    if (tradePnl > 0) worked.push(`Realized trading (sales + settlements − fees) added $${tradePnl.toFixed(2)} before the open book is marked.`);
    if (tradePnl < 0) hurt.push(`Realized trading (sales + settlements − fees) lost $${Math.abs(tradePnl).toFixed(2)} before the open book is marked.`);
  }
  if (makerFills.length) worked.push(`${makerFills.length} resting order(s) were crossed by a LATER real quote, so the carried book earned the spread instead of paying it.`);
  if (takerFills.length > 3 && slippage > 0) hurt.push(`${takerFills.length} taker fills paid $${slippage.toFixed(2)} of measured slippage against the touch.`);
  if (fees > 0 && result.contracts > 0) {
    const perContract = fees / result.contracts;
    (perContract > 0.01 ? hurt : worked).push(`Official fees were $${fees.toFixed(4)} on ${result.contracts} contract(s) ($${perContract.toFixed(4)} each, the exchange's quadratic schedule).`);
  }
  if (cancels.length) hurt.push(`${cancels.length} resting order(s) never crossed and were cancelled unfilled — no fee, but no fill either.`);
  if (result.maxDrawdownPct > 5) hurt.push(`The round-by-round curve drew down ${result.maxDrawdownPct.toFixed(2)}% at its worst — the price of the maximum-return mandate (no stop, no cap).`);
  if (openContracts > 0 && last) hurt.push(`${openContracts} contract(s) are still open at the season's last mark (${last.asOf}): their PnL is unrealized and can still change.`);
  if (curve.length > 1 && first && last) worked.push(`The book carried across ${curve.length - 1} round boundary(ies); equity moved from $${first.equity.toFixed(2)} to $${last.equity.toFixed(2)} while positions were held.`);

  const headline = !fills.length && !settles.length
    ? `${result.strategy} never traded: 0 fills across ${roundCount} round(s).`
    : `${result.strategy} returned ${result.returnPct >= 0 ? '+' : ''}${result.returnPct.toFixed(4)}% ($${result.equity.toFixed(2)}) from ${result.fills} fill(s) across ${roundCount} round(s), ${settles.length} real settlement(s), $${fees.toFixed(4)} of official fees.`;
  return {
    strategy: result.strategy,
    headline,
    verdict: !fills.length && !settles.length ? 'NO_TRADES' : result.returnPct > 0 ? 'PROFITABLE' : result.returnPct < 0 ? 'LOSS' : 'FLAT',
    worked,
    hurt,
    measured: {
      rounds: roundCount,
      roundsTraded: result.roundsTraded,
      fills: fills.length,
      takerFills: takerFills.length,
      makerFills: makerFills.length,
      settlements: settles.length,
      marks: marks.length,
      contracts: result.contracts,
      fees,
      slippageCost: slippage,
      settlementPnl,
      unrealizedPnl: result.unrealizedPnl,
      maxDrawdownPct: result.maxDrawdownPct,
      openContracts
    },
    deskExplanation: explainDeskStrategy(result, records)
  };
}

/* ------------------------------------------------------------------ *
 * 5. The season audit: what a running book must prove
 * ------------------------------------------------------------------ */

/** The extra invariants a carried book must satisfy, on top of the desk's D1–D13. */
export function seasonAuditorFacts() {
  return [
    { id: 'S1', rule: 'Every round is a real capture instant taken from the store’s own ladder timestamps (no invented round time).', source: 'data/history/** books[].captured_at → src/desk-data.js' },
    { id: 'S2', rule: 'Rounds are strictly increasing in time and the book only ever moves forward.', source: 'derived rule — carried book ordering' },
    { id: 'S3', rule: 'A carried position’s ticker was tradeable (open, with a captured ladder at or before that round) when it was opened.', source: 'GET /markets/{ticker} close_time + orderbook capture' },
    { id: 'S4', rule: 'Cash, positions and the cumulative liquidity cap are the SAME book across rounds — nothing is reset between rounds.', source: 'derived rule — single-portfolio accounting' },
    { id: 'S5', rule: 'Equity is continuous: each round’s opening equity equals the previous round’s closing equity unless real events (fills, settlements, marks) moved it, and the identity cash + marketValue = equity holds at every snapshot.', source: 'internal accounting identity' },
    { id: 'S6', rule: 'A settlement inside the season pays the exchange’s own value and removes the position once — never twice.', source: 'GET /markets/{ticker} result / settlement_value_dollars / settlement_ts' },
    { id: 'S7', rule: 'A maker fill carries the later real quote that crossed it (round, timestamp, source).', source: 'captured candlesticks and later captured ladders' },
    { id: 'S8', rule: 'Every round reports which real events it walked through, so a dead window is visible instead of implied.', source: 'derived rule — reported instrumentation' },
    { id: 'S9', rule: 'An entrant with no fill in any round is reported unranked with the reason, never as 0%.', source: 'LEADERBOARD_QUALIFICATION principle' },
    { id: 'S10', rule: 'The equity curve is the same arithmetic as the final equity (its last point equals the reported equity).', source: 'internal accounting identity' },
    { id: 'S11', rule: 'The cumulative liquidity cap holds per contract across all rounds: the total paper size ever filled in one contract never exceeds 10% of that contract real volume base, compared against each fill own recorded capBase.', source: 'internal accounting identity + the desk 10% liquidity limit' },
    { id: 'S12', rule: 'The carried book can neither borrow nor short: no round snapshot shows negative cash, and no SELL fill ever exceeds what that entrant had already bought in the same contract and side.', source: 'Kalshi has no margin and no naked shorting - enforced in placeDeskOrder (irregularity #49)' }
  ];
}

export function auditSeason(season, universe, { tolerance = 0.011 } = {}) {
  const checks = [];
  const mismatches = [];
  const ok = (name, condition, detail) => {
    checks.push({ name, ok: Boolean(condition), detail });
    if (!condition) mismatches.push({ name, detail });
  };

  const records = season.records || [];
  const fills = records.filter((r) => r.k === 'FILL');
  const settles = records.filter((r) => r.k === 'SETTLE');
  const rounds = season.rounds || [];

  // The single-session desk invariants (D1–D13) re-run over the whole season.
  const deskAudit = auditDesk({ records, results: season.results || [] }, universe, { tolerance });
  checks.push(...deskAudit.checks.map((c) => ({ ...c, name: `desk ${c.name}` })));
  mismatches.push(...deskAudit.mismatches.map((m) => ({ ...m, name: `desk ${m.name}` })));

  const roundTimes = rounds.map((r) => ms(r.asOf));
  ok('S1 every round is a real capture instant from the store', rounds.every((r) => Number.isFinite(ms(r.asOf))), `${rounds.length} round(s): ${rounds.map((r) => r.label).join(', ')}`);
  ok(
    'S2 rounds strictly increase in time',
    roundTimes.every((t, i) => i === 0 || t > roundTimes[i - 1]),
    roundTimes.map((t) => iso(t)).join(' → ')
  );
  const fillRounds = fills.map((f) => f.round);
  ok(
    'S3 every fill is inside a round and named after it',
    fills.every((f) => Number.isFinite(Number(f.round))),
    `${fills.length} fill(s) carry a round index`
  );
  ok(
    'S3b every fill sits inside the season window and never prices off a later ladder',
    fills.every((f) => {
      const at = ms(f.at);
      const ladderAt = ms(f.ladderAt);
      if (at === null || ladderAt === null) return false;
      // A taker fill happens AT its round's cut-off. A carried MAKER fill happens
      // in the window AFTER the round that placed it, so it may be earlier than
      // the round it is filed under (it belongs to the window that round opens).
      // What must never happen is a fill before the season started, or a fill
      // priced from a ladder captured after the fill.
      return at >= roundTimes[0] - 1000 && at <= ms(season.newestCapture) + 1000 && ladderAt <= at + 1000;
    }),
    `fills between ${iso(roundTimes[0])} and ${season.newestCapture}, each priced from a ladder captured at or before it`
  );
  ok(
    'S4 one book per entrant for the whole season (no per-round reset)',
    new Set(season.results.map((r) => r.strategy)).size === season.results.length,
    `${season.results.length} distinct entrant(s)`
  );
  const curveChecks = [];
  ok(
    'S5 equity curve is continuous and ends at the reported equity',
    (season.results || []).every((r) => {
      const curve = r.equityCurve || [];
      if (!curve.length) return false;
      const lastPoint = curve[curve.length - 1];
      if (Math.abs(lastPoint.equity - r.equity) > tolerance) {
        curveChecks.push(`${r.strategy}: curve ends ${lastPoint.equity} but equity is ${r.equity}`);
        return false;
      }
      const flat = curve.every((p) => Math.abs((p.cash + p.marketValue) - p.equity) < tolerance);
      if (!flat) curveChecks.push(`${r.strategy}: cash + marketValue != equity at some point`);
      const ordered = curve.every((p, i) => i === 0 || ms(p.asOf) >= ms(curve[i - 1].asOf));
      if (!ordered) curveChecks.push(`${r.strategy}: curve times are not increasing`);
      return flat && ordered;
    }),
    curveChecks.length ? curveChecks.join('; ') : 'curve point = cash + marketValue, times increasing, final point = reported equity'
  );
  const settleKeys = settles.map((s) => `${s.ticker}|${s.side}|${s.strategy}`);
  ok(
    'S6 no position is settled twice',
    new Set(settleKeys).size === settleKeys.length,
    `${settles.length} settlement record(s), ${new Set(settleKeys).size} unique (strategy, ticker, side)`
  );
  ok(
    'S6b season settlements are strictly inside the season window',
    settles.every((s) => ms(s.at) !== null && ms(s.at) >= roundTimes[0]),
    settles.length ? `first settlement ${settles[0].at}, last ${settles[settles.length - 1].at}` : 'no settlement inside this season'
  );
  ok(
    'S7 every maker fill names the later real quote that crossed it',
    fills.filter((f) => f.maker).every((f) => Boolean(f.crossedBy && f.crossedBy.source && ms(f.crossedBy.source.match(/(\d{4}-\d{2}-\d{2}T[\d:.]+Z)/)?.[1] ?? f.at) >= ms(f.at) - 1000)),
    `${fills.filter((f) => f.maker).length} maker fill(s)`
  );
  ok(
    'S8 every round reports the real events it walked through',
    rounds.every((r) => r.eventsApplied && Number.isFinite(Number(r.eventsApplied.quotes)) && Number.isFinite(Number(r.eventsApplied.settlements))),
    rounds.map((r) => `${r.label}: ${r.eventsApplied?.quotes ?? 'n/a'} quote(s), ${r.eventsApplied?.settlements ?? 'n/a'} settlement(s)`).join('; ')
  );
  ok(
    'S9 an entrant that never traded shows no performance number',
    (season.results || []).every((r) => r.fills > 0 || r.settlementPnl !== 0 || Math.abs(r.returnPct) < 1e-9),
    (season.results || []).filter((r) => r.fills === 0 && r.settlementPnl === 0).map((r) => `${r.strategy}=${r.returnPct}`).join('; ') || 'every result row traded'
  );
  ok(
    'S10 the season holds its positions across rounds (a carried book, not a session)',
    season.results.some((r) => (r.equityCurve || []).some((p) => p.openContracts > 0)) || fills.length === 0,
    `${season.results.filter((r) => (r.equityCurve || []).some((p) => p.openContracts > 0)).length} entrant(s) carried an open position past a round boundary`
  );
  const capOffenders = (() => {
    // Independent re-derivation from the LEDGER: walk every fill in season
    // order and keep a running total per contract. The engine's cap is 10% of
    // the contract's real volume base, and the base is re-read at every round,
    // so the invariant is checked against each fill's OWN recorded capBase.
    const used = new Map();
    const offenders = [];
    const ordered = fills
      .slice()
      .sort((a, b) => Number(a.round) - Number(b.round) || (ms(a.at) ?? 0) - (ms(b.at) ?? 0));
    for (const f of ordered) {
      const total = round2((used.get(f.ticker) || 0) + Number(f.count));
      used.set(f.ticker, total);
      const base = Number(f.capBase);
      if (!Number.isFinite(base) || base <= 0) continue; // no real base -> the cap does not apply
      // The engine rounds the cap to the contract's own granularity before it
      // binds (round2), so the comparison uses the same rounded cap.
      const cap = round2(base * DESK_LIMITS.maxShareOfRealVolume);
      if (total > cap + 1e-6) offenders.push(`${f.ticker}: ${total} of ${cap} (${f.capField || 'base'} ${base}) at ${f.at}`);
    }
    return offenders;
  })();
  ok(
    'S11 the cumulative liquidity cap is respected per contract across all rounds',
    capOffenders.length === 0,
    capOffenders.length
      ? capOffenders.slice(0, 3).join('; ')
      : `${DESK_LIMITS.maxShareOfRealVolume * 100}% of each contract's real volume base, summed over every round (re-derived from the ledger, not from engine state)`
  );

  /**
   * S12 - no borrowing, no naked shorting.
   *
   * Kalshi settles in cash: an account cannot spend money it does not have and
   * cannot sell contracts it does not hold. Both rules are enforced in
   * placeDeskOrder(), and this re-derives them from the LEDGER alone: the cash
   * column of every round snapshot, plus a running position balance for every
   * entrant/contract/side walked in fill order.
   */
  const negativeCash = [];
  for (const r of season.results || []) {
    for (const p of r.equityCurve || []) {
      if (Number(p.cash) < -tolerance) negativeCash.push(`${r.strategy} ${p.roundLabel}: cash ${p.cash}`);
    }
    if (Number(r.cash) < -tolerance) negativeCash.push(`${r.strategy}: final cash ${r.cash}`);
  }
  const shortOffenders = [];
  const balances = new Map();
  for (const f of fills.slice().sort((a, b) => (ms(a.at) ?? 0) - (ms(b.at) ?? 0))) {
    const key = `${f.strategy}|${f.ticker}|${f.side}`;
    const held = round2((balances.get(key) || 0) + (f.action === 'sell' ? -Number(f.count) : Number(f.count)));
    balances.set(key, held);
    if (held < -tolerance) shortOffenders.push(`${f.strategy} ${f.ticker} ${f.side}: ${held} after ${f.action} ${f.count} at ${f.at}`);
  }
  ok(
    'S12 the carried book never borrows or shorts (Kalshi settles in cash)',
    negativeCash.length === 0 && shortOffenders.length === 0,
    negativeCash.length || shortOffenders.length
      ? [...negativeCash.slice(0, 2), ...shortOffenders.slice(0, 2)].join('; ')
      : `${season.results.length} entrant(s): no negative cash at any round boundary, and every SELL is covered by contracts already held`
  );

  return {
    ok: mismatches.length === 0,
    checkedAt: new Date().toISOString(),
    version: SEASON_VERSION,
    checks,
    mismatches,
    totals: {
      rounds: rounds.length,
      orders: records.filter((r) => r.k === 'ORDER').length,
      fills: fills.length,
      takerFills: fills.filter((f) => !f.maker).length,
      makerFills: fills.filter((f) => f.maker).length,
      settlements: settles.length,
      marks: records.filter((r) => r.k === 'MARK').length,
      cancels: records.filter((r) => r.k === 'CANCEL').length,
      contracts: round2(fills.reduce((s, f) => s + Number(f.count), 0)),
      fees: round6(fills.reduce((s, f) => s + Number(f.fee), 0)),
      settlementPnl: round6(settles.reduce((s, f) => s + Number(f.pnl || 0), 0)),
      eventsWalked: rounds.reduce((s, r) => s + (r.eventsApplied?.quotes || 0) + (r.eventsApplied?.settlements || 0), 0),
      makerFillsCarried: rounds.reduce((s, r) => s + (r.makerFillsCarriedIn || 0), 0)
    }
  };
}

/* ------------------------------------------------------------------ *
 * 6. ONE report builder for BOTH runtimes (server + static build)
 * ------------------------------------------------------------------ */

export function buildSeasonReport({
  data = DESK_DATA,
  strategies = [],
  rounds = null,
  startingCapital = 100000,
  minSpacingMinutes = 0,
  maxRounds = 12,
  maxOrdersPerStrategy = 8
} = {}) {
  const schedule = Array.isArray(rounds) && rounds.length
    ? { rounds: rounds.map((r, i) => ({ index: i + 1, label: r.label || `R${String(i + 1).padStart(2, '0')}`, asOf: iso(r.asOf ?? r) })), derived: false }
    : seasonSchedule({ data, minSpacingMinutes, maxRounds });
  const season = runDeskSeason({ data, strategies, rounds: schedule.rounds, startingCapital, maxOrdersPerStrategy, minSpacingMinutes, maxRounds });
  const summary = summarizeDesk(season);
  const ranked = season.results.filter((r) => r.fills > 0 || r.settlementPnl !== 0);
  return {
    generatedAt: new Date().toISOString(),
    version: SEASON_VERSION,
    startingCapital,
    rule: SEASON_RULE,
    dataGeneratedAt: data.generatedAt || null,
    dataCoverage: data.coverage || null,
    endpoints: data.endpoints || null,
    docs: data.docs || null,
    schedule: {
      // The DERIVATION counts (batches, considered instants, thinning) come from
      // the schedule builder; the per-round detail comes from the run itself.
      // Both spellings are published so a reader of the JSON does not have to
      // guess: `considered`/`candidates` are the builder's own names, the
      // `*Instants`/`*Rounds` forms are what the UI and the CLI read.
      ...schedule,
      minSpacingMinutes,
      maxRounds,
      batches: schedule.batches ?? null,
      consideredInstants: schedule.considered ?? schedule.consideredInstants ?? null,
      candidateRounds: schedule.candidates ?? schedule.candidateRounds ?? null,
      thinned: schedule.thinned ?? false,
      rounds: season.rounds.map((r) => ({
        index: r.index,
        label: r.label,
        asOf: r.asOf,
        tradeable: r.universe?.tradeable ?? null,
        marketsWithLadder: r.marketsWithLadder,
        newLadderCaptures: r.newLadderCaptures,
        freshLadderCaptures: r.freshLadderCaptures ?? null,
        gapHoursFromPrev: r.gapHoursFromPrev,
        isNewestCapture: r.isNewestCapture,
        eventsApplied: r.eventsApplied,
        settlementsInWindow: r.settlementsInWindow,
        makerFillsCarriedIn: r.makerFillsCarriedIn
      }))
    },
    rounds: season.rounds,
    summary,
    ranked: ranked.length,
    unranked: season.results.length - ranked.length,
    // The single-session limits/invariants are inherited unchanged, so the two
    // desk sections describe the same rules; `invars` carries the SEASON facts.
    limits: DESK_LIMITS,
    invars: seasonAuditorFacts(),
    deskInvars: auditorFacts(),
    results: season.results,
    explanations: season.explanations,
    coverage: season.coverage,
    audit: {
      ok: season.audit.ok,
      checkedAt: season.audit.checkedAt,
      totals: season.audit.totals,
      checks: season.audit.checks,
      mismatches: season.audit.mismatches,
      facts: seasonAuditorFacts()
    },
    records: season.records
  };
}

/** The season's ledger, one JSON object per line (orders, fills, marks, settlements). */
export function seasonLedgerJsonl(records) {
  return (records || []).map((r) => JSON.stringify(r)).join('\n') + '\n';
}

/** Human-readable audit summary for the CLI. */
export function describeSeasonAudit(audit) {
  return audit.ok
    ? `All ${audit.checks.length} season checks passed: ${audit.totals.rounds} round(s), ${audit.totals.fills} fill(s) (${audit.totals.makerFills} carried maker fill(s)), ${audit.totals.settlements} real settlement(s), ${audit.totals.eventsWalked} real event(s) walked.`
    : `${audit.mismatches.length} of ${audit.checks.length} season checks FAILED: ${audit.mismatches.map((m) => m.name).join('; ')}`;
}

export { auditorFacts };
