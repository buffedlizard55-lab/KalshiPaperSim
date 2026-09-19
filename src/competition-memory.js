/**
 * KalshiPaperSim — Competition Memory Engine (1-Year, Multi-User)
 * =====================================================================
 * Owns the persistent "memory" of a competition:
 *   - a 52-week (1-year) calendar with explicit start/end dates
 *   - every participant (human paper traders AND algorithmic strategies)
 *   - every trade, settlement and equity snapshot
 *   - market regime labels used for stress testing
 *   - JSON / CSV export + import for later analysis and re-testing
 *
 * STORAGE TIERS
 *   1. Server-backed multiplayer store (POST/GET /api/state) when running under
 *      `npm start` — shared across browsers, file-backed, survives restarts.
 *   2. Browser localStorage when running as a static page (GitHub Pages).
 *   3. In-memory fallback (Node tests, private browsing).
 * The tier in use is always reported via `storageInfo()` so the UI can be honest
 * about whether data is shared or local-only.
 *
 * INTEGRITY: performance numbers stored here are always COPIES of results
 * computed by ReplayEngine (src/strategy-runner.js). This module never invents
 * a return figure.
 */

import { STRATEGIES } from './strategies.js';
import { getVerifiedMarkets, CAPTURE_META } from './verified-snapshot.js';
import { normalizeMarket, DATA_SOURCE } from './kalshi-api.js';
import { round2 } from './simulation-engine.js';
import { LEADERBOARD_QUALIFICATION } from './analysis.js';

/**
 * Desk usernames that a human paper trader must never take: the Live Desk
 * roster (one session per cut-off) AND the Season roster (the carried book that
 * runs across every real capture batch).
 *
 * Kept here (not imported from src/desk-strategies.js or
 * src/desk-season-strategies.js) so the one-year memory module does not pull
 * the 1 MB desk-data capture into every page load. Test 104 asserts this list
 * equals the union of DESK_STRATEGIES.map(s => s.username) and
 * SEASON_STRATEGIES.map(s => s.username) field-for-field, so a new entrant that
 * is not reserved fails the build.
 */
export const DESK_RESERVED_USERNAMES = Object.freeze([
  'LiveFavourite_Settle',
  'LiveTailPremium_NO',
  'LiveLongshot_Convexity',
  'LiveCheapBracket_Ladder',
  'LiveDepthSweep_Taker',
  'LiveMakerTouch',
  'LiveMomentum_Bars',
  'LiveMeanRev_Spike',
  'LiveExpiryHarvest',
  'LiveFDA_DecisionPremium',
  'LiveNCAA_GameFavourite',
  'LiveNBA_GameFavourite',
  'LiveCEO_ChangeFav',
  // Season entrants (src/desk-season-strategies.js) — the carried-book roster.
  'SeasonWeather_Carry',
  'SeasonIndex_CarryHold',
  'SeasonMaker_RestCarry',
  'SeasonBoardSum_Ladder',
  'SeasonExpiry_LastRound',
  'SeasonControl_NoTrade'
]);

export const STORAGE_KEY = 'KALSHI_COMPETITION_MEMORY_V2';
export const WEEKS_PER_YEAR = 52;

/** Default competition window: one calendar year starting on a Monday. */
export const DEFAULT_COMPETITION = Object.freeze({
  year: '2026-2027',
  startDate: '2026-09-21', // Monday
  endDate: '2027-09-20',   // 52 weeks later (inclusive of start)
  totalWeeks: WEEKS_PER_YEAR,
  initialCapital: 100000
});

/** Market-regime presets used to stress-test strategies (simulation control). */
export const REGIMES = Object.freeze([
  { id: 'baseline', label: 'Baseline (real captured quotes)', drift: 0, volatility: 1.0, note: 'Replays the real captured candlestick window unmodified.' },
  { id: 'bull_momentum', label: 'Bull Momentum', drift: 0.004, volatility: 1.1, note: 'Positive drift per period; favours momentum and trend pyramiding.' },
  { id: 'high_volatility', label: 'High Volatility', drift: 0, volatility: 2.4, note: 'Wider per-period ranges; favours market makers and longshot convexity.' },
  { id: 'macro_shock', label: 'Macro Shock', drift: -0.012, volatility: 2.0, note: 'Strong negative drift; punishes unhedged long YES books.' },
  { id: 'sideways_chop', label: 'Sideways Chop', drift: 0, volatility: 0.45, note: 'Mean-reverting, low range; spread capture dominates.' },
  { id: 'liquidity_drought', label: 'Liquidity Drought', drift: 0, volatility: 1.0, depthScale: 0.12, note: 'Depth scaled to 12% — exposes slippage and book-exhaustion penalties.' }
]);

export class CompetitionMemoryEngine {
  /**
   * @param {object} [options]
   * @param {'server'|'local'|'memory'} [options.tier]
   * @param {string} [options.stateUrl]      server endpoint, default '/api/state'
   * @param {object} [options.initialState]  pre-loaded state (tests / SSR)
   */
  constructor(options = {}) {
    this.tier = options.tier || 'auto';
    this.stateUrl = options.stateUrl || '/api/state';
    this.storage = options.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);
    this.state = options.initialState || this.loadInitialState();
  }

  /* ---------------- construction ---------------- */

  createDefaultCompetitionState(year = DEFAULT_COMPETITION.year) {
    const cfg = { ...DEFAULT_COMPETITION, year };
    return {
      schemaVersion: 2,
      competitionId: `KALSHI-PAPER-CHAMPIONSHIP-${year}`,
      title: `Kalshi Annual Paper Trading Championship (${year})`,
      year,
      startDate: cfg.startDate,
      endDate: cfg.endDate,
      totalWeeks: cfg.totalWeeks,
      currentWeek: 0,
      currentDate: cfg.startDate,
      initialCapital: cfg.initialCapital,
      regime: 'baseline',
      markets: getVerifiedMarkets().map((m) => normalizeMarket(m, {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        source_url: m._provenance?.url,
        captured_at: m._provenance?.capturedAt
      })),
      /** Algorithmic participants — results are COMPUTED and stored verbatim. */
      strategies: STRATEGIES.map((s) => ({
        id: s.id,
        username: s.username,
        handle: s.handle,
        avatar: s.avatar,
        title: s.title,
        category: s.category,
        tagline: s.tagline,
        thesis: s.thesis,
        rules: s.rules,
        universe: s.universe || null,
        sizingPct: s.sizingPct,
        kind: 'algorithmic',
        startingCapital: cfg.initialCapital,
        result: null // filled by attachComputedResults()
      })),
      /** Human participants registered through the multiplayer API. */
      participants: [],
      /** Computed competition results (leaderboard + per-strategy detail). */
      computedResults: null,
      /** Compact Live Desk session (one cut-off). Fills also live in tradeLog with kind: 'desk'. */
      deskMemory: null,
      tradeLog: [],
      weeklySnapshots: [],
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      dataProvenance: {
        apiBase: CAPTURE_META.apiBase,
        capturedAt: CAPTURE_META.capturedAt,
        note: 'Market objects and candlestick quotes are REAL captured Kalshi data. Simulated depth is labelled.'
      }
    };
  }

  loadInitialState() {
    // Tier 1: server (handled asynchronously by hydrate()); start from local.
    try {
      if (this.storage) {
        const saved = this.storage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.schemaVersion === 2 && parsed.strategies) return parsed;
        }
      }
    } catch {
      /* fall through to a fresh state */
    }
    return this.createDefaultCompetitionState();
  }

  /** Pull shared state from the multiplayer server (no-op when unavailable). */
  async hydrate() {
    if (typeof fetch !== 'function') return { ok: false, reason: 'fetch_unavailable' };
    try {
      const res = await fetch(this.stateUrl, { headers: { Accept: 'application/json' } });
      if (!res.ok) return { ok: false, reason: `http_${res.status}` };
      const payload = await res.json();
      if (payload && payload.state && payload.state.schemaVersion === 2) {
        this.state = payload.state;
        this.tier = 'server';
        return { ok: true, tier: 'server', participants: (payload.state.participants || []).length };
      }
      return { ok: false, reason: 'schema_mismatch' };
    } catch (err) {
      return { ok: false, reason: String(err && err.message ? err.message : err) };
    }
  }

  /** Persist to the active tier. */
  save() {
    this.state.lastUpdated = new Date().toISOString();
    try {
      if (this.storage) this.storage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch {
      /* quota exceeded / unavailable — state stays in memory */
    }
    return this.state;
  }

  /** Push state to the multiplayer server (fire-and-forget, awaited by caller). */
  async persistToServer() {
    if (typeof fetch !== 'function') return { ok: false, reason: 'fetch_unavailable' };
    try {
      const res = await fetch(this.stateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: this.save() })
      });
      return { ok: res.ok, status: res.status };
    } catch (err) {
      return { ok: false, reason: String(err && err.message ? err.message : err) };
    }
  }

  storageInfo() {
    return {
      tier: this.tier === 'auto' ? (this.storage ? 'local' : 'memory') : this.tier,
      localStorageAvailable: Boolean(this.storage),
      serverEndpoint: this.stateUrl,
      shared: this.tier === 'server',
      key: STORAGE_KEY,
      lastUpdated: this.state.lastUpdated
    };
  }

  /* ---------------- participants ---------------- */

  /**
   * Register a human paper trader with a UNIQUE username.
   * Username rules mirror competition platforms: 3-24 chars, letters/digits/
   * underscore/dot, must not collide with an algorithmic strategy handle.
   */
  registerParticipant(username, meta = {}) {
    const clean = String(username || '').trim();
    const validation = validateUsername(clean, this.state);
    if (!validation.ok) return { ok: false, ...validation };

    const participant = {
      id: `user_${clean.toLowerCase()}`,
      username: clean,
      handle: `@${clean}`,
      kind: 'human',
      avatar: meta.avatar || '👤',
      strategyNote: meta.strategyNote || 'Discretionary paper trader',
      startingCapital: meta.startingCapital ?? this.state.initialCapital,
      cash: meta.startingCapital ?? this.state.initialCapital,
      equity: meta.startingCapital ?? this.state.initialCapital,
      realizedPnl: 0,
      returnPct: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      feesPaid: 0,
      maxDrawdownPct: 0,
      positions: [],
      trades: [],
      equityCurve: [{ week: 0, date: this.state.currentDate, equity: meta.startingCapital ?? this.state.initialCapital, returnPct: 0 }],
      registeredAt: new Date().toISOString()
    };
    this.state.participants.push(participant);
    this.save();
    return { ok: true, participant };
  }

  getParticipant(username) {
    const q = String(username || '').toLowerCase();
    return this.state.participants.find((p) => p.username.toLowerCase() === q) || null;
  }

  /** Record a fill for a human participant and refresh their metrics. */
  recordUserTrade(username, execution) {
    const p = this.getParticipant(username);
    if (!p) return { ok: false, reason: 'participant_not_found' };
    const stats = execution.stats || null;
    p.trades.push({
      timestamp: execution.timestamp || new Date().toISOString(),
      week: this.state.currentWeek,
      ticker: execution.ticker,
      action: execution.action,
      side: execution.side,
      contracts: execution.contracts,
      price: execution.vwap ?? execution.fillPrice ?? null,
      fee: execution.fee ?? 0,
      realizedPnl: execution.realizedPnl ?? null,
      slippage: execution.slippage ?? null,
      maker: Boolean(execution.maker),
      bookSource: execution.bookSource || null
    });
    p.totalTrades += 1;
    if (stats) {
      p.cash = stats.cash;
      p.equity = stats.equity;
      p.realizedPnl = stats.realizedPnl;
      p.returnPct = stats.returnPct;
      p.feesPaid = stats.feesPaid;
      p.maxDrawdownPct = stats.maxDrawdownPct;
      p.winningTrades = stats.winningTrades;
      p.losingTrades = stats.losingTrades;
      p.positions = stats.openPositions ?? p.positions;
    } else {
      // No portfolio snapshot supplied (e.g. a hand-recorded execution). Still
      // accumulate the fee and any realized P&L so the participant's totals do
      // not silently under-report. Cash/equity are left untouched: without a
      // portfolio we cannot recompute them, and inventing them would be worse.
      p.feesPaid = round2((p.feesPaid || 0) + (Number(execution.fee) || 0));
      if (typeof execution.realizedPnl === 'number') {
        p.realizedPnl = round2((p.realizedPnl || 0) + execution.realizedPnl);
      }
    }
    this.state.tradeLog.push({
      competitionId: this.state.competitionId,
      participant: p.username,
      kind: 'human',
      ...p.trades[p.trades.length - 1]
    });
    if (this.state.tradeLog.length > 5000) this.state.tradeLog.splice(0, this.state.tradeLog.length - 5000);
    this.save();
    return { ok: true, participant: p };
  }

  /* ---------------- competition lifecycle ---------------- */

  /**
   * Store a Live Desk session as competition memory (ROADMAP Next #9, partial).
   *
   * The desk is one deterministic session per cut-off, not a multi-day
   * portfolio: this copies the measured fills, fees, settlements and
   * explanations into the one-year store so they survive export/import and
   * sit next to the replay results. Positions are NOT carried into the next
   * cut-off — that remaining gap is stated on the README.
   *
   * Compact on purpose: the full desk report (universe + every ladder) is
   * regenerated from src/desk-data.js; memory keeps the *results* and the
   * fill log, which is what future analysis needs.
   */
  attachDeskSession(report) {
    if (!report || typeof report !== 'object') return null;
    const fills = (report.records || []).filter((r) => r.k === 'FILL' || r.k === 'SETTLE');
    const asOf = report.asOf || null;
    this.state.deskMemory = {
      attachedAt: new Date().toISOString(),
      asOf,
      version: report.version || 1,
      auditOk: Boolean(report.audit?.ok),
      coverage: report.coverage || null,
      fillCount: fills.filter((r) => r.k === 'FILL').length,
      settlementCount: fills.filter((r) => r.k === 'SETTLE').length,
      results: (report.results || []).map((r) => ({
        strategy: r.strategy,
        returnPct: r.returnPct,
        equity: r.equity,
        cash: r.cash,
        fills: r.fills,
        contracts: r.contracts,
        unfilled: r.unfilled,
        feesPaid: r.feesPaid,
        slippageCost: r.slippageCost,
        settlementPnl: r.settlementPnl,
        startingCapital: r.startingCapital
      })),
      explanations: (report.explanations || []).map((e) => ({
        strategy: e.strategy,
        verdict: e.verdict,
        headline: e.headline,
        worked: e.worked,
        hurt: e.hurt
      }))
    };
    // Replace any previous desk rows for this cut-off so re-running the desk
    // does not duplicate the year. Other kinds (human / algorithmic) stay.
    this.state.tradeLog = (this.state.tradeLog || []).filter((t) => !(t.kind === 'desk' && t.asOf === asOf));
    for (const f of fills) {
      this.state.tradeLog.push({
        competitionId: this.state.competitionId,
        participant: f.strategy,
        kind: 'desk',
        asOf,
        timestamp: f.at || f.settledAt || null,
        ticker: f.ticker,
        action: f.k === 'SETTLE' ? 'SETTLE' : (f.action || 'buy'),
        side: f.side || null,
        contracts: f.count ?? null,
        price: f.price ?? f.payoffPerContract ?? null,
        fee: f.fee ?? 0,
        slippage: f.slippage ?? null,
        maker: Boolean(f.maker),
        bookSource: f.ladderUrl || f.marketUrl || null,
        reason: f.explain || null
      });
    }
    if (this.state.tradeLog.length > 5000) this.state.tradeLog.splice(0, this.state.tradeLog.length - 5000);
    this.save();
    return this.state.deskMemory;
  }

  /**
   * Store a Desk SEASON (the carried multi-round book) as competition memory.
   *
   * A season is already a multi-round portfolio, so what memory needs from it is
   * the ROUND-BY-ROUND record: the equity curve each entrant actually produced,
   * the real events each round walked through (later quotes, settlements), and
   * one trade-log row per fill/settlement with its ladder URL and capture time.
   * Positions are carried inside the season run itself; this method stores the
   * measurements so future analysis (and the export) does not have to re-run the
   * engine — and re-running it would rebuild the same numbers anyway, because
   * the season is deterministic.
   *
   * Compact on purpose: the full season report is regenerated from
   * src/desk-data.js; memory keeps the rounds, the curves and the fill log.
   */
  attachDeskSeason(report) {
    if (!report || typeof report !== 'object') return null;
    const records = report.records || [];
    const fills = records.filter((r) => r.k === 'FILL' || r.k === 'SETTLE');
    const snapshot = report.seasonSnapshot || report;
    this.state.deskSeasonMemory = {
      attachedAt: new Date().toISOString(),
      version: snapshot.version || snapshot.seasonVersion || 1,
      rounds: (snapshot.rounds || []).map((r) => ({
        index: r.index,
        label: r.label,
        asOf: r.asOf,
        tradeable: r.universe?.tradeable ?? null,
        newLadderCaptures: r.newLadderCaptures ?? null,
        quotes: r.eventsApplied?.quotes ?? 0,
        settlements: r.eventsApplied?.settlements ?? 0,
        makerFillsCarriedIn: r.makerFillsCarriedIn ?? 0
      })),
      auditOk: Boolean(snapshot.audit?.ok),
      totals: snapshot.audit?.totals || null,
      results: (snapshot.results || []).map((r) => ({
        strategy: r.strategy,
        returnPct: r.returnPct,
        equity: r.equity,
        cash: r.cash,
        fills: r.fills,
        contracts: r.contracts,
        unfilled: r.unfilled,
        feesPaid: r.feesPaid,
        slippageCost: r.slippageCost,
        settlementPnl: r.settlementPnl,
        unrealizedPnl: r.unrealizedPnl,
        maxDrawdownPct: r.maxDrawdownPct,
        roundsTraded: r.roundsTraded,
        roundsFilled: r.roundsFilled,
        startingCapital: r.startingCapital,
        openContracts: (r.openPositions || []).reduce((sum, p) => sum + (p.contracts || 0), 0),
        equityCurve: (r.equityCurve || []).map((c) => ({
          round: c.round,
          roundLabel: c.roundLabel,
          asOf: c.asOf,
          phase: c.phase,
          equity: c.equity,
          returnPct: c.returnPct,
          cash: c.cash,
          marketValue: c.marketValue,
          openContracts: c.openContracts
        }))
      })),
      explanations: (snapshot.explanations || []).map((e) => ({
        strategy: e.strategy,
        verdict: e.verdict,
        headline: e.headline,
        worked: e.worked,
        hurt: e.hurt
      }))
    };
    // Replace any previous season rows so re-running does not duplicate the year.
    this.state.tradeLog = (this.state.tradeLog || []).filter((t) => t.kind !== 'desk-season');
    for (const f of fills) {
      this.state.tradeLog.push({
        competitionId: this.state.competitionId,
        participant: f.strategy,
        kind: 'desk-season',
        round: f.round ?? null,
        timestamp: f.at || f.settledAt || null,
        ticker: f.ticker,
        action: f.k === 'SETTLE' ? 'SETTLE' : (f.action || 'buy'),
        side: f.side || null,
        contracts: f.count ?? null,
        price: f.price ?? f.payoffPerContract ?? null,
        fee: f.fee ?? 0,
        slippage: f.slippage ?? null,
        maker: Boolean(f.maker),
        bookSource: f.ladderUrl || f.marketUrl || null,
        reason: f.explain || null
      });
    }
    if (this.state.tradeLog.length > 5000) this.state.tradeLog.splice(0, this.state.tradeLog.length - 5000);
    this.save();
    return this.state.deskSeasonMemory;
  }

  /** Store results computed by ReplayEngine (never invents numbers). */
  attachComputedResults(competitionResult) {
    this.state.computedResults = {
      generatedAt: competitionResult.competition.generatedAt,
      seed: competitionResult.competition.seed,
      horizonPeriods: competitionResult.competition.horizonPeriods,
      dataProvenance: competitionResult.competition.dataProvenance,
      leaderboard: competitionResult.leaderboard,
      perStrategy: competitionResult.results.map((r) => ({
        strategyId: r.strategyId,
        username: r.username,
        returnPct: r.returnPct,
        finalEquity: r.finalEquity,
        stats: r.stats,
        attribution: r.attribution,
        analysis: r.analysis,
        curveAnalysis: r.curveAnalysis,
        equityCurve: r.equityCurve,
        recentTrades: r.recentTrades,
        actionLogCount: (r.actionLog || []).length
      }))
    };
    for (const s of this.state.strategies) {
      const row = competitionResult.leaderboard.find((l) => l.username === s.username);
      if (row) s.result = { ...row, computed: true };
    }
    this.save();
    return this.state.computedResults;
  }

  /**
   * Re-sync the stored roster with the CURRENT strategy definitions.
   *
   * A persisted year can outlive the code: strategies get added or retired
   * between sessions. Rather than silently showing a stale roster (or silently
   * deleting history), this keeps any computed result for strategies that still
   * exist, adds new ones, and records retired ones under `retiredStrategies`.
   */
  syncStrategyRoster() {
    const previous = this.state.strategies || [];
    const byId = new Map(previous.map((s) => [s.id, s]));
    const byName = new Map(previous.map((s) => [s.username, s]));
    const currentIds = new Set(STRATEGIES.map((s) => s.id));

    this.state.strategies = STRATEGIES.map((s) => {
      const old = byId.get(s.id) || byName.get(s.username);
      return {
        id: s.id,
        username: s.username,
        handle: s.handle,
        avatar: s.avatar,
        title: s.title,
        category: s.category,
        tagline: s.tagline,
        thesis: s.thesis,
        rules: s.rules,
        universe: s.universe || null,
        sizingPct: s.sizingPct,
        kind: 'algorithmic',
        startingCapital: old?.startingCapital ?? this.state.initialCapital,
        result: old?.result ?? null
      };
    });

    const retired = previous.filter((s) => s.kind === 'algorithmic' && !currentIds.has(s.id));
    if (retired.length) {
      this.state.retiredStrategies = [
        ...(this.state.retiredStrategies || []),
        ...retired.map((s) => ({ id: s.id, username: s.username, result: s.result || null, retiredAt: new Date().toISOString() }))
      ];
    }

    // Refresh market metadata from the verified captures too (fee configs and
    // quotes may have been re-captured since the store was written).
    this.state.markets = getVerifiedMarkets().map((m) =>
      normalizeMarket(m, {
        source: DATA_SOURCE.VERIFIED_SNAPSHOT,
        source_url: m._provenance?.url,
        captured_at: m._provenance?.capturedAt
      })
    );

    this.state.lastUpdated = new Date().toISOString();
    this.save();
    return {
      total: this.state.strategies.length,
      added: this.state.strategies.filter((s) => !byId.has(s.id)).map((s) => s.username),
      retired: retired.map((s) => s.username)
    };
  }

  /** Advance the 1-year calendar. Returns {currentWeek, completed, date}. */
  advanceSimulation(weeks = 1) {
    const n = Math.max(1, Math.floor(Number(weeks) || 1));
    const before = this.state.currentWeek;
    this.state.currentWeek = Math.min(this.state.totalWeeks, before + n);
    this.state.currentDate = addWeeks(this.state.startDate, this.state.currentWeek);

    // Weekly equity snapshots for every participant.
    for (const p of this.state.participants) {
      p.equityCurve.push({
        week: this.state.currentWeek,
        date: this.state.currentDate,
        equity: p.equity,
        returnPct: p.returnPct
      });
    }
    this.state.weeklySnapshots.push({
      week: this.state.currentWeek,
      date: this.state.currentDate,
      regime: this.state.regime,
      participants: this.state.participants.length,
      leaderboardTop: (this.getLeaderboard()[0] || {}).username || null
    });

    const completed = this.state.currentWeek >= this.state.totalWeeks;
    this.save();
    return { previousWeek: before, currentWeek: this.state.currentWeek, completed, date: this.state.currentDate };
  }

  setRegime(regimeId) {
    const regime = REGIMES.find((r) => r.id === regimeId);
    if (!regime) return { ok: false, reason: `unknown regime '${regimeId}'`, allowed: REGIMES.map((r) => r.id) };
    this.state.regime = regime.id;
    this.save();
    return { ok: true, regime };
  }

  getRegime() {
    return REGIMES.find((r) => r.id === this.state.regime) || REGIMES[0];
  }

  reset(options = {}) {
    this.state = this.createDefaultCompetitionState(options.year || this.state.year);
    if (options.regime) this.setRegime(options.regime);
    this.save();
    return this.state;
  }

  /* ---------------- leaderboard ---------------- */

  /**
   * Unified leaderboard: COMPUTED algorithmic results plus live human
   * participants, ranked strictly by return % (highest first), per the
   * highest-returns mandate.
   */
  getLeaderboard() {
    const rows = [];

    for (const s of this.state.strategies) {
      const r = s.result;
      rows.push({
        rank: 0,
        username: s.username,
        handle: s.handle || `@${s.username}`,
        avatar: s.avatar,
        kind: 'algorithmic',
        title: s.title,
        category: s.category,
        returnPct: r ? r.returnPct : 0,
        finalEquity: r ? r.finalEquity : s.startingCapital,
        realizedPnl: r ? r.realizedPnl : 0,
        totalTrades: r ? r.totalTrades : 0,
        winRate: r ? r.winRate : 0,
        profitFactor: r ? r.profitFactor : null,
        maxDrawdownPct: r ? r.maxDrawdownPct : 0,
        feesPaid: r ? r.feesPaid : 0,
        unfilledContracts: r ? r.unfilledContracts ?? 0 : 0,
        unfilledOrders: r ? r.unfilledOrders ?? 0 : 0,
        periods: r ? r.periods : null,
        verdict: r ? r.verdict : 'NOT_YET_COMPUTED',
        computed: Boolean(r)
      });
    }

    for (const p of this.state.participants) {
      rows.push({
        rank: 0,
        username: p.username,
        handle: p.handle,
        avatar: p.avatar,
        kind: 'human',
        title: p.strategyNote,
        category: 'Discretionary / Manual',
        returnPct: p.returnPct || 0,
        finalEquity: p.equity,
        realizedPnl: p.realizedPnl,
        totalTrades: p.totalTrades,
        winRate: p.totalTrades > 0 ? round2((p.winningTrades / Math.max(1, p.winningTrades + p.losingTrades)) * 100) : 0,
        profitFactor: null,
        maxDrawdownPct: p.maxDrawdownPct || 0,
        feesPaid: p.feesPaid || 0,
        verdict: p.totalTrades > 0 ? 'LIVE_PAPER_TRADING' : 'NO_TRADES_YET',
        computed: false
      });
    }

    // Qualification: the same rule the computed leaderboard uses. An entry that
    // never produced a fill has no measured performance; ranking it "0%" would
    // present an untested design as a competitive result.
    const minTrades = LEADERBOARD_QUALIFICATION.minTrades;
    const byReturn = (a, b) =>
      b.returnPct - a.returnPct || b.finalEquity - a.finalEquity || a.username.localeCompare(b.username);
    const qualified = rows.filter((r) => (r.totalTrades || 0) >= minTrades).sort(byReturn);
    const unqualified = rows
      .filter((r) => (r.totalTrades || 0) < minTrades)
      .sort((a, b) => a.username.localeCompare(b.username));

    return [
      ...qualified.map((row, i) => ({ ...row, rank: i + 1, qualified: true })),
      ...unqualified.map((row) => ({
        ...row,
        rank: null,
        qualified: false,
        unrankedReason:
          (row.totalTrades || 0) === 0
            ? 'No executed fills: nothing was measured, so this entry is not ranked.'
            : `Fewer than ${minTrades} executed fill(s).`
      }))
    ];
  }

  /* ---------------- export / import ---------------- */

  /** Full memory dump as pretty JSON (for future testing, analysis, evaluation). */
  exportMemoryJSON(indent = 2) {
    return JSON.stringify({ ...this.state, exportedAt: new Date().toISOString() }, null, indent);
  }

  /** Flat CSV of every recorded trade (algorithmic + human). */
  exportTradesCSV() {
    const header = [
      'CompetitionId', 'Participant', 'Kind', 'Week', 'Timestamp', 'Ticker', 'Action',
      'Side', 'Contracts', 'Price', 'Fee', 'RealizedPnl', 'Slippage', 'Maker', 'BookSource', 'StrategyId', 'Reason'
    ];
    const lines = [header.join(',')];

    const esc = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    for (const t of this.state.tradeLog) {
      lines.push([
        this.state.competitionId, t.participant, t.kind, t.week ?? '', t.timestamp ?? '', t.ticker ?? '',
        t.action ?? '', t.side ?? '', t.contracts ?? '', t.price ?? '', t.fee ?? '', t.realizedPnl ?? '',
        t.slippage ?? '', t.maker ? 'true' : 'false', t.bookSource ?? '', t.strategyId ?? '', t.reason ?? ''
      ].map(esc).join(','));
    }

    // Algorithmic fills from the computed replay results.
    const per = this.state.computedResults?.perStrategy || [];
    for (const s of per) {
      for (const t of s.recentTrades || []) {
        lines.push([
          this.state.competitionId, s.username, 'algorithmic', '', t.timestamp ?? '', t.ticker ?? '',
          t.action ?? '', t.side ?? '', t.contracts ?? '', t.vwap ?? t.fillPrice ?? '', t.fee ?? '',
          t.realizedPnl ?? '', t.slippage ?? '', t.maker ? 'true' : 'false', t.bookSource ?? '', s.strategyId, ''
        ].map(esc).join(','));
      }
    }
    return lines.join('\n');
  }

  /** Import a previously exported memory dump. */
  importMemoryJSON(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    if (!parsed || parsed.schemaVersion !== 2 || !Array.isArray(parsed.strategies)) {
      throw new Error('Invalid memory dump: expected schemaVersion 2 with a strategies array');
    }
    this.state = parsed;
    this.save();
    return { ok: true, participants: (parsed.participants || []).length, strategies: parsed.strategies.length };
  }
}

/* ---------------- helpers ---------------- */

export function validateUsername(username, state) {
  // Always reserve the CURRENT roster and the CURRENT desk, not only whatever
  // a stale store happens to remember. A human taking LiveFavourite_Settle
  // because the stored year predated the desk is the hole this closes.
  const reserved = new Set();
  for (const s of STRATEGIES) reserved.add(String(s.username).toLowerCase());
  for (const name of DESK_RESERVED_USERNAMES) reserved.add(String(name).toLowerCase());
  for (const s of state?.strategies || []) {
    if (s?.username) reserved.add(String(s.username).toLowerCase());
  }
  for (const s of state?.deskMemory?.results || []) {
    if (s?.strategy) reserved.add(String(s.strategy).toLowerCase());
  }
  const taken = new Set((state?.participants || []).map((p) => String(p.username).toLowerCase()));
  if (!username) return { ok: false, reason: 'username_required' };
  if (username.length < 3 || username.length > 24) return { ok: false, reason: 'username_length_3_to_24' };
  if (!/^[A-Za-z0-9_.]+$/.test(username)) return { ok: false, reason: 'username_invalid_characters' };
  if (reserved.has(username.toLowerCase())) return { ok: false, reason: 'username_reserved_by_algorithmic_strategy' };
  if (taken.has(username.toLowerCase())) return { ok: false, reason: 'username_already_taken' };
  return { ok: true, username };
}

export function addWeeks(isoDate, weeks) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + Math.round(weeks) * 7);
  return d.toISOString().slice(0, 10);
}

/** Calendar helper: 52 week boundaries for the competition year. */
export function competitionCalendar(startDate = DEFAULT_COMPETITION.startDate, totalWeeks = WEEKS_PER_YEAR) {
  return Array.from({ length: totalWeeks + 1 }, (_, w) => ({ week: w, date: addWeeks(startDate, w) }));
}
