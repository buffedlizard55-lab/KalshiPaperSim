/**
 * KalshiPaperSim — front-end controller
 * =====================================================================
 * Runs in two modes, detected at boot:
 *
 *   SERVER MODE  `node server.js` — REST + WebSocket relay + shared multiplayer
 *                store. Used for the live preview and local development.
 *   STATIC MODE  GitHub Pages (docs/) — no server exists, so the SAME engine
 *                modules are imported directly in the browser, the competition
 *                is computed locally from the same real captured data, and
 *                memory is kept in localStorage.
 *
 * In both modes every performance number on screen comes from a computed
 * result object. This file contains no hard-coded returns, no mock leaderboards
 * and no placeholder prices.
 */

import {
  esc, money, compact, pct, signedClass, price, priceCents, dateShort, timeShort,
  sourcePill, verdictPill, tag, renderPodium, renderLeaderboardRows, sparkline,
  renderFactors, renderLadder, renderPostMortem, toast, $, $$, setHTML, setText, on, link
} from './ui.js';
import {
  VERIFIED_FACTS, IRREGULARITIES, COMPETITION_SITE_ANALYSIS, groupFacts, factStats
} from './verification-data.js';

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

const state = {
  mode: 'detecting',
  health: null,
  transport: null,
  runtime: null,
  competition: null,
  results: [],
  leaderboard: [],
  unifiedLeaderboard: [],
  markets: [],
  selectedTicker: null,
  selectedStrategy: null,
  books: new Map(),
  memory: null,
  regimes: [],
  feed: null,
  feedStatus: null,
  tape: [],
  options: { seed: 20260917, settleAtEnd: false, regime: 'baseline' }
};

/* ------------------------------------------------------------------ *
 * Runtime adapters
 * ------------------------------------------------------------------ */

async function jfetch(url, opts = {}) {
  const res = await fetch(url, { cache: 'no-store', headers: { 'Content-Type': 'application/json' }, ...opts });
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text.slice(0, 400) }; }
  if (!res.ok) throw new Error(data?.error || data?.msg || `HTTP ${res.status}`);
  return data;
}

/** Server-backed runtime. */
function serverRuntime() {
  return {
    kind: 'server',
    async markets() {
      const d = await jfetch('/api/markets');
      return { markets: d.markets, source: d.source, capturedAt: d.capturedAt, notice: d.notice };
    },
    async competition(opts) {
      const d = await jfetch('/api/run-competition', { method: 'POST', body: JSON.stringify(opts || {}) });
      return { competition: d.competition, results: d.results, leaderboard: d.leaderboard };
    },
    async leaderboard() {
      const d = await jfetch('/api/leaderboard');
      return { competition: d.competition, leaderboard: d.computedLeaderboard, unified: d.leaderboard, provenance: d.provenance };
    },
    async state() { return jfetch('/api/state'); },
    async saveState(memState) { return jfetch('/api/state', { method: 'POST', body: JSON.stringify({ state: memState }) }); },
    async register(payload) { return jfetch('/api/register', { method: 'POST', body: JSON.stringify(payload) }); },
    async trade(payload) { return jfetch('/api/trade', { method: 'POST', body: JSON.stringify(payload) }); },
    async quote(params) { return jfetch(`/api/quote?${new URLSearchParams(params)}`); },
    async advance(weeks) { return jfetch('/api/advance', { method: 'POST', body: JSON.stringify({ weeks }) }); },
    async setRegime(regime) { return jfetch('/api/regime', { method: 'POST', body: JSON.stringify({ regime }) }); },
    async reset(payload) { return jfetch('/api/reset', { method: 'POST', body: JSON.stringify(payload || {}) }); },
    async regimes() { const d = await jfetch('/api/regimes'); return d.regimes; },
    async transport() { return jfetch('/api/transport'); },
    async verified() { return jfetch('/api/verified'); },
    async historyAudit() { return jfetch('/api/history-audit'); },
    async backtest(payload) { return jfetch('/api/backtest', { method: 'POST', body: JSON.stringify(payload) }); },
    exportJsonUrl: '/api/export/json',
    exportCsvUrl: '/api/export/csv',
    wsUrl: '/ws/feed'
  };
}

/** Browser-only runtime: same engine modules, localStorage memory. */
async function staticRuntime() {
  const [runner, memMod, snap, apiMod, simMod, sandbox] = await Promise.all([
    import('./strategy-runner.js'),
    import('./competition-memory.js'),
    import('./verified-snapshot.js'),
    import('./kalshi-api.js'),
    import('./simulation-engine.js'),
    import('./strategy-sandbox.js')
  ]);

  const memory = new memMod.CompetitionMemoryEngine({ tier: 'local' });
  memory.syncStrategyRoster(); // a stored year can outlive the code
  const books = new Map();

  function bookFor(ticker) {
    if (!books.has(ticker)) {
      const raw = snap.getVerifiedMarkets().find((m) => m.ticker === ticker);
      if (!raw) return null;
      const norm = apiMod.normalizeMarket(raw, { source: apiMod.DATA_SOURCE.VERIFIED_SNAPSHOT, source_url: raw._provenance?.url });
      // Real captured order book when we have one; modelled (and labelled) otherwise.
      books.set(ticker, simMod.OrderBook.fromVerifiedCapture(norm, snap.getVerifiedOrderbook(ticker), {
        source: apiMod.DATA_SOURCE.VERIFIED_SNAPSHOT,
        topSize: 2500
      }));
    }
    return books.get(ticker);
  }

  return {
    kind: 'static',
    memory,
    bookFor,
    async markets() {
      const markets = snap.getVerifiedMarkets().map((m) =>
        apiMod.normalizeMarket(m, { source: apiMod.DATA_SOURCE.VERIFIED_SNAPSHOT, source_url: m._provenance?.url, captured_at: m._provenance?.capturedAt })
      );
      return { markets, source: apiMod.DATA_SOURCE.VERIFIED_SNAPSHOT, capturedAt: snap.CAPTURE_META.capturedAt, notice: 'REAL Kalshi market objects captured 2026-09-17 (static mode: computed in your browser).' };
    },
    async competition(opts) {
      const c = runner.runCompetition({ ...opts, regime: memory.state.regime });
      memory.attachComputedResults(c);
      memory.save();
      return { competition: c.competition, results: c.results, leaderboard: c.leaderboard };
    },
    async leaderboard() {
      const c = runner.runCompetition({ regime: memory.state.regime });
      memory.attachComputedResults(c);
      return { competition: c.competition, leaderboard: c.leaderboard, unified: memory.getLeaderboard(), provenance: c.competition.dataProvenance };
    },
    async state() { return { ok: true, storage: memory.storageInfo(), state: memory.state }; },
    async saveState() { memory.save(); return { ok: true }; },
    async register(payload) {
      const check = memMod.validateUsername(String(payload.username || '').trim(), memory.state);
      if (!check.ok) { const e = new Error(`username rejected: ${check.reason}`); e.reason = check.reason; throw e; }
      const r = memory.registerParticipant(check.username, payload);
      memory.save();
      return { ok: true, participant: r.participant, leaderboard: memory.getLeaderboard() };
    },
    async trade(payload) {
      const p = memory.getParticipant(payload.username);
      if (!p) throw new Error('participant_not_found — register first');
      const book = bookFor(payload.ticker);
      if (!book) throw new Error('unknown_ticker');
      const portfolio = p.__portfolio || (p.__portfolio = new simMod.PaperPortfolio(p.username, p.startingCapital ?? memory.state.initialCapital));
      const count = simMod.round2(Number(payload.count));
      const side = String(payload.side || 'YES').toUpperCase();
      const exec = payload.action === 'sell'
        ? portfolio.sellPosition(book, side, count, { strategy: p.username })
        : portfolio.buyPosition(book, side, count, { strategy: p.username });
      const stats = portfolio.updateEquity();
      memory.recordUserTrade(p.username, { ...exec, stats });
      memory.save();
      return { ok: true, execution: exec, stats, participant: memory.getParticipant(p.username), leaderboard: memory.getLeaderboard() };
    },
    async quote(params) {
      const book = bookFor(params.ticker);
      if (!book) throw new Error('unknown_ticker');
      const side = String(params.side || 'YES').toLowerCase();
      const count = simMod.round2(Number(params.count || 100));
      const tiers = side === 'yes' ? book.getYesAskTiers() : book.getNoAskTiers();
      const sim = await import('./simulation-engine.js');
      const feeMod = await import('./kalshi-fees.js');
      let remaining = count, cost = 0; const fills = [];
      for (const t of tiers) {
        if (remaining <= 0.005) break;
        const q = Math.min(remaining, t.count);
        fills.push({ price: t.price, count: q });
        cost += q * t.price;
        remaining = sim.round2(remaining - q);
      }
      const unfilled = remaining > 0.005 ? remaining : 0;
      const filled = sim.round2(count - unfilled);
      const vwap = filled > 0 ? cost / filled : null;
      const feeInfo = feeMod.computeKalshiFee({ count: filled, price: vwap || 0.5, multiplier: book.feeMultiplier, isMaker: false });
      return {
        ticker: book.ticker, side: side.toUpperCase(), count, filled, unfilled,
        bestAsk: tiers[0]?.price ?? null, vwap: vwap === null ? null : Number(vwap.toFixed(6)),
        slippage: vwap !== null && tiers[0] ? Number((vwap - tiers[0].price).toFixed(6)) : null,
        fills, fee: feeInfo.fee, feeFormula: feeInfo.formula, feeMultiplier: feeInfo.multiplier,
        totalCost: Number((cost + feeInfo.fee).toFixed(2)),
        bookSnapshot: book.snapshot(),
        note: unfilled > 0 ? `${unfilled} contract(s) could NOT fill — only real depth executes.` : null
      };
    },
    async advance(weeks) { const r = memory.advanceSimulation(weeks); memory.save(); return { ok: true, ...r, leaderboard: memory.getLeaderboard() }; },
    async setRegime(regime) { const r = memory.setRegime(regime); if (r.ok) memory.save(); return r; },
    async reset(payload) { memory.reset(payload || {}); books.clear(); return { ok: true, state: memory.state }; },
    async regimes() { return memMod.REGIMES; },
    async transport() {
      return {
        credentialsConfigured: false, environment: 'n/a', allowUserCode: false,
        upstreamReachable: false,
        upstream: { url: null, status: null, error: 'static_mode_no_server', data: null },
        verifiedSnapshot: { capturedAt: snap.CAPTURE_META.capturedAt, apiBase: snap.CAPTURE_META.apiBase, exchangeStatus: snap.EXCHANGE_STATUS, historicalCutoff: snap.HISTORICAL_CUTOFF },
        feedMode: 'sim',
        staticMode: true
      };
    },
    async historyAudit() { return runner.getHistoryAudit(); },
    async verified() {
      return {
        captureMeta: snap.CAPTURE_META, exchangeStatus: snap.EXCHANGE_STATUS, historicalCutoff: snap.HISTORICAL_CUTOFF,
        series: snap.SERIES, marketCount: snap.getVerifiedMarkets().length,
        candlestickTickers: Object.keys(runner.getVerifiedCandleMap()),
        replayableMarkets: runner.getReplayableMarkets().map((m) => m.ticker),
        candleCoverage: runner.getCandleCoverage()
      };
    },
    async backtest(payload) {
      const strategy = sandbox.compileUserStrategy(payload.source, { username: payload.username });
      const result = runner.runCustomStrategy(strategy, { settleAtEnd: Boolean(payload.settleAtEnd) });
      return {
        ok: true, username: strategy.username, stats: result.stats, returnPct: result.returnPct,
        finalEquity: result.finalEquity, periods: result.periods, attribution: result.attribution,
        analysis: result.analysis, equityCurve: result.equityCurve, recentTrades: result.recentTrades,
        runtimeErrors: strategy.runtimeErrors, dataProvenance: result.dataProvenance
      };
    },
    exportJsonUrl: null,
    exportCsvUrl: null,
    wsUrl: null,
    lintSource: sandbox.lintSource,
    EXAMPLE: sandbox.EXAMPLE_USER_STRATEGY,
    REGIMES: memMod.REGIMES
  };
}

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

async function boot() {
  wireTabs();
  let runtime;
  try {
    const h = await jfetch('/api/health');
    if (h && h.service === 'KalshiPaperSim') {
      state.mode = 'server';
      state.health = h;
      runtime = serverRuntime();
    } else throw new Error('unexpected health payload');
  } catch {
    state.mode = 'static';
    runtime = await staticRuntime();
  }
  state.runtime = runtime;

  try {
    const s = await runtime.state();
    state.memory = s.state;
    state.options.regime = s.state?.regime || 'baseline';
  } catch (err) {
    toast(`Could not load competition memory: ${err.message}`, 'warn');
  }

  renderHeader();
  await Promise.all([loadRegimes(), loadMarkets(), loadCompetition(), loadHistoryAudit()]);
  renderVerification();
  renderIrregularities();
  renderMemory();
  initLab();
  wireGlobalEvents();
  renderTransport();
}

async function loadHistoryAudit() {
  try {
    state.historyAudit = await state.runtime.historyAudit();
  } catch (err) {
    state.historyAudit = { error: String(err && err.message ? err.message : err) };
  }
}

/* ------------------------------------------------------------------ *
 * Header / provenance
 * ------------------------------------------------------------------ */

function renderHeader() {
  const modePill = $('#pillMode');
  const dataPill = $('#pillData');
  const feedPill = $('#pillFeed');

  if (state.mode === 'server') {
    modePill.className = 'pill pill-live';
    modePill.innerHTML = '<span class="dot"></span>SERVER MODE · multiplayer store';
  } else {
    modePill.className = 'pill pill-sim';
    modePill.innerHTML = '<span class="dot"></span>STATIC MODE · computed in your browser';
  }
  dataPill.className = 'pill pill-snap';
  dataPill.innerHTML = '<span class="dot"></span>REAL KALSHI CAPTURE 2026-09-17';
  feedPill.className = 'pill pill-muted';
  feedPill.innerHTML = '<span class="dot"></span>FEED: checking…';
}

async function renderTransport() {
  let t;
  try { t = await state.runtime.transport(); } catch (err) { t = { error: err.message }; }
  state.transport = t;
  const pill = $('#pillFeed');
  if (t?.feedMode === 'upstream' && t?.feedStatus?.connected) {
    pill.className = 'pill pill-live';
    pill.innerHTML = '<span class="dot"></span>FEED: LIVE KALSHI WS';
  } else {
    pill.className = 'pill pill-sim';
    pill.innerHTML = '<span class="dot"></span>FEED: SIMULATED (no API key)';
  }

  const cap = t?.verifiedSnapshot || {};
  const cutoff = cap.historicalCutoff?.market_settled_ts || cap.historicalCutoff?.trades_created_ts || null;
  setHTML('#provenanceText', `
    Prices, quotes, order books and candlesticks are <strong>real Kalshi production responses captured
    ${esc(cap.capturedAt || '2026-09-17')}</strong> from <code>${esc(cap.apiBase || 'https://external-api.kalshi.com/trade-api/v2')}</code>
    — point-in-time, <strong>not live quotes</strong>${cutoff ? ` (historical cutoff ${esc(cutoff)})` : ''}.
    Depth behind the captured touch is <span class="pill pill-sim">SIMULATED</span> and labelled.
    Upstream reachable from this host: <strong>${t?.upstreamReachable ? 'YES' : 'NO'}</strong>${t?.upstream?.error ? ` — <code>${esc(t.upstream.error)}</code>` : ''}.
    API credentials: <strong>${t?.credentialsConfigured ? 'configured' : 'not configured'}</strong>.
  `);
}

/* ------------------------------------------------------------------ *
 * Tabs
 * ------------------------------------------------------------------ */

function wireTabs() {
  $$('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('.tab').forEach((b) => b.classList.toggle('is-active', b === btn));
      const id = btn.dataset.tab;
      $$('.panel').forEach((p) => p.classList.toggle('is-active', p.id === `panel-${id}`));
      if (id === 'markets' && state.selectedTicker) selectMarket(state.selectedTicker);
    });
  });
}

/* ------------------------------------------------------------------ *
 * Leaderboard
 * ------------------------------------------------------------------ */

async function loadRegimes() {
  try {
    state.regimes = await state.runtime.regimes();
  } catch { state.regimes = []; }
  const sel = $('#ctlRegime');
  sel.innerHTML = state.regimes.map((r) => `<option value="${esc(r.id)}"${r.id === state.options.regime ? ' selected' : ''}>${esc(r.label)}</option>`).join('');
  renderRegimeList();
}

function renderRegimeList() {
  const active = state.memory?.regime || state.options.regime;
  setHTML('#regimeList', state.regimes.map((r) => `
    <div class="regime ${r.id === active ? 'is-active' : ''}" data-regime="${esc(r.id)}">
      <div>
        <div class="regime-name">${esc(r.label)} ${r.id === active ? tag('ACTIVE') : ''}</div>
        <div class="regime-note">${esc(r.note || '')}</div>
        <div class="regime-note">drift ${esc(r.drift ?? 0)} · volatility ×${esc(r.volatility ?? 1)}${r.depthScale ? ` · depth ×${esc(r.depthScale)}` : ''}</div>
      </div>
    </div>`).join(''));
  $$('#regimeList .regime').forEach((el) => {
    el.addEventListener('click', async () => {
      try {
        const r = await state.runtime.setRegime(el.dataset.regime);
        if (r && r.ok === false) throw new Error(r.error || 'regime rejected');
        state.memory = (await state.runtime.state()).state;
        renderRegimeList();
        renderMemory();
        toast(`Regime set to ${el.dataset.regime}. Live feed + weekly simulation updated; the replay leaderboard still uses the real captured candles.`, 'ok');
      } catch (err) { toast(`Regime change failed: ${err.message}`, 'err'); }
    });
  });
}

async function loadCompetition() {
  setText('#competitionLede', 'Computing the competition from real captured candlesticks…');
  try {
    const d = await state.runtime.competition(state.options);
    state.competition = d.competition;
    state.results = d.results || [];
    state.leaderboard = d.leaderboard || [];
    state.marketStats = d.marketStats || null;
    renderUniverse();
    renderLeaderboard();
  } catch (err) {
    setHTML('#competitionLede', `<span class="neg">Competition run failed: ${esc(err.message)}</span>`);
    toast(`Competition run failed: ${err.message}`, 'err');
  }
  renderStrategies();
}

function renderLeaderboard() {
  const c = state.competition;
  if (!c) return;
  const prov = c.dataProvenance || {};
  setText('#competitionLede', '');
  setHTML('#competitionLede', `
    <strong>${esc(c.id)}</strong> · ${esc(c.horizonPeriods)} real daily periods across
    ${esc((prov.markets || []).length)} market(s) · seed <code>${esc(c.seed)}</code> ·
    starting capital ${esc(money(c.initialCapital, 0))} · generated ${esc(new Date(c.generatedAt || Date.now()).toISOString().slice(0, 19).replace('T', ' '))}Z.
    ${sourcePill('VERIFIED_SNAPSHOT')} <span class="pill pill-muted" title="${esc(prov.depthModelNote || '')}">depth behind touch: SIMULATED</span>
    ${c.maxFillFractionOfPeriodVolume === null
      ? '<span class="pill pill-sim" title="Fills are NOT bounded by the period\'s real traded volume — stress mode.">VOLUME BOUND: OFF</span>'
      : `<span class="pill pill-live" title="No order may fill more than this share of the contracts that really traded in that daily bar.">fills &le; ${esc(Math.round((c.maxFillFractionOfPeriodVolume ?? 0.1) * 100))}% of each bar\'s real volume</span>`}
    ${c.maxNotionalPerMarketPct ? `<span class="pill pill-muted">cap ${esc(Math.round(c.maxNotionalPerMarketPct * 100))}% of equity per market</span>` : ''}
    ${c.settleAtEnd ? '<span class="pill pill-sim">SETTLEMENT: HYPOTHETICAL</span>' : '<span class="pill pill-muted">positions marked at last real quote</span>'}
  `);

  setHTML('#podium', renderPodium(state.leaderboard.map((r) => enrichRow(r))));
  const qualified = state.leaderboard.filter((r) => r.qualified);
  const unqualified = state.leaderboard.filter((r) => !r.qualified);
  setHTML('#leaderboardTable tbody', renderLeaderboardRows(qualified.map(enrichRow)));

  const ub = $('#unrankedBlock');
  if (unqualified.length) {
    ub.hidden = false;
    setHTML('#unrankedList', unqualified.map((r) => `
      <div class="s-card" style="cursor:default">
        <div class="s-card-head">
          <span class="avatar">${esc(r.avatar || '🤖')}</span>
          <div>
            <div class="s-card-title">${esc(r.username)}</div>
            <div class="s-card-cat">${esc(r.title || '')}</div>
          </div>
        </div>
        <div class="muted" style="font-size:.82rem">${esc(r.analysis?.whyItFailed || 'Entry conditions were never satisfied by the captured data.')}</div>
      </div>`).join(''));
  } else ub.hidden = true;

  renderHumanBoard();
}

function enrichRow(row) {
  const res = state.results.find((r) => r.username === row.username);
  const strat = res?.strategy || {};
  return { ...row, avatar: strat.avatar || row.avatar, title: row.title || strat.title, category: row.category || strat.category, kind: strat.kind || 'algorithmic', analysis: res?.analysis };
}

function renderHumanBoard() {
  const unified = state.memory?.participants || [];
  setText('#humanCount', String(unified.length));
  if (!unified.length) {
    setHTML('#humanLeaderboard', `<p class="muted">No human participants yet. Register in the <strong>Competition Memory</strong> tab, then paper-trade from the <strong>Markets &amp; Depth</strong> tab.</p>`);
    return;
  }
  const rows = unified.map((p) => ({
    username: p.username, handle: `@${p.username}`, avatar: p.avatar || '🧑‍💻', title: p.strategyNote || 'Human paper trader',
    category: 'Human', returnPct: p.returnPct ?? 0, finalEquity: p.equity ?? p.startingCapital, totalTrades: p.trades ?? 0,
    winRate: p.winRate ?? 0, maxDrawdownPct: p.maxDrawdownPct ?? 0, feesPaid: p.feesPaid ?? 0, unfilledContracts: 0,
    verdict: (p.trades ?? 0) > 0 ? 'HUMAN_PAPER_TRADER' : 'NO_TRADES_YET', qualified: (p.trades ?? 0) > 0, kind: 'human'
  }));
  setHTML('#humanLeaderboard', `<div class="table-wrap"><table class="grid"><thead><tr>
    <th>Trader</th><th class="num">Return</th><th class="num">Equity</th><th class="num">Trades</th><th class="num">Fees</th><th>Status</th>
    </tr></thead><tbody>${rows.map((r) => `
      <tr><td><div class="cell-trader"><span class="avatar">${esc(r.avatar)}</span><span>${esc(r.username)}<span class="cell-sub">${esc(r.title)}</span></span></div></td>
      <td class="num ${signedClass(r.returnPct)}">${esc(pct(r.returnPct))}</td>
      <td class="num">${esc(money(r.finalEquity))}</td>
      <td class="num">${esc(r.totalTrades)}</td>
      <td class="num">${esc(money(r.feesPaid))}</td>
      <td>${verdictPill(r.verdict)}</td></tr>`).join('')}</tbody></table></div>`);
}

/* ------------------------------------------------------------------ *
 * Strategies
 * ------------------------------------------------------------------ */

function renderUniverse() {
  const ms = state.marketStats;
  const coverage = state.competition?.dataProvenance?.candleCoverage || [];
  const box = $('#universeBlock');
  if (!box) return;

  const ORIGIN_LABEL = {
    repo_capture: 'in-repo capture',
    accumulated_store: 'capture + daily ingest',
    accumulated_store_only: 'daily ingest only',
    repo_capture_store_conflict: 'capture (store conflict)'
  };
  const coverageRows = coverage.map((c) => `<tr>
      <td style="font-family:var(--mono);font-size:.72rem">${esc(c.ticker)}</td>
      <td class="num">${esc(c.bars)}${c.barsAddedByIngest ? ` <span class="pos" title="bars added by the daily ingest job">+${esc(c.barsAddedByIngest)}</span>` : ''}</td>
      <td class="num">${esc(dateShort(c.firstDate))}</td>
      <td class="num">${esc(dateShort(c.lastDate))}</td>
      <td class="num">${esc(c.noTradeBars ?? 0)}</td>
      <td>${esc(ORIGIN_LABEL[c.origin] || c.source || 'capture')}</td>
      <td><a href="${esc(c.url || '#')}" target="_blank" rel="noopener">endpoint</a></td>
    </tr>`).join('');

  const audit = state.historyAudit || {};
  const excludedRows = (audit.markets || []).filter((m) => !m.replayable).map((m) => `<tr>
      <td style="font-family:var(--mono);font-size:.72rem">${esc(m.ticker)}</td>
      <td class="num">${esc(m.bars)}</td>
      <td class="muted" style="font-size:.74rem">${esc(m.excludedReason || m.reason || '')}</td>
    </tr>`).join('');
  const ingestNote = audit.store?.present
    ? `<p class="muted fineprint">The daily ingest job has stored <strong>${esc(audit.store.barCount)} daily bars</strong> across
       <strong>${esc(audit.store.marketCount)} market(s)</strong> (last manifest ${esc((audit.store.lastManifest || '').slice(0, 19).replace('T', ' '))}Z,
       ${esc(audit.summary?.conflicts ?? 0)} conflicts). A stored series only replaces a capture when every bar they share matches
       field-for-field and the stored one is longer — so the dataset can grow, never rewrite itself.</p>`
    : `<p class="muted fineprint">No accumulated history yet. <code>node scripts/ingest-history.mjs</code> (or the daily workflow) appends
       one real day at a time; the replay falls back to the in-repo captures until it does.</p>`;

  const corr = ms?.correlation;
  const pairRows = (corr?.pairs || []).map((pr) => `<tr>
      <td style="font-family:var(--mono);font-size:.7rem">${esc(pr.a.slice(-14))} ↔ ${esc(pr.b.slice(-14))}</td>
      <td class="num">${esc(pr.usablePeriods)}</td>
      <td class="num ${pr.correlation === null ? 'muted' : pr.correlation >= 0 ? 'pos' : 'neg'}">${pr.correlation === null ? '—' : esc(pr.correlation.toFixed(3))}</td>
      <td class="muted" style="font-size:.74rem">${esc(pr.note)}</td>
    </tr>`).join('');

  setHTML('#universeBlock', `
    <div class="detail-grid">
      <div>
        <h4>Markets replayed</h4>
        <div class="table-wrap" style="max-height:24rem;overflow:auto"><table class="grid"><thead><tr>
          <th>Market</th><th class="num">Bars</th><th class="num">First</th><th class="num">Last</th>
          <th class="num">No-trade</th><th>Where the bars came from</th><th>Source</th>
        </tr></thead><tbody>${coverageRows || '<tr><td colspan="7" class="muted">No coverage data.</td></tr>'}</tbody></table></div>
        ${ingestNote}
      </div>
      <div>
        <h4>Cross-market correlation <span class="muted" style="font-weight:400">(daily close-to-close changes)</span></h4>
        <div class="table-wrap"><table class="grid"><thead><tr>
          <th>Pair</th><th class="num">Overlap</th><th class="num">ρ</th><th>Note</th>
        </tr></thead><tbody>${pairRows || '<tr><td colspan="4" class="muted">Not computed.</td></tr>'}</tbody></table></div>
        <p class="fineprint muted">${esc(corr?.method || '')} ${corr ? `· minimum overlap ${esc(corr.minOverlap)} periods` : ''}</p>
      </div>
    </div>
    ${excludedRows ? `<div style="margin-top:1rem">
        <h4>Tracked, but not replayed <span class="muted" style="font-weight:400">(${esc(excludedRows.length)})</span></h4>
        <div class="table-wrap"><table class="grid"><thead><tr>
          <th>Market</th><th class="num">Bars</th><th>Why it is excluded</th>
        </tr></thead><tbody>${excludedRows}</tbody></table></div>
        <p class="muted fineprint">Excluded is not an error: a market with no captured market object cannot have a book built for it,
        and one with fewer than ${esc(audit.minBars ?? 10)} bars would produce per-market statistics nobody should act on.</p>
      </div>` : ''}
    <p class="muted fineprint">${esc(ms?.note || 'Multi-market statistics are computed from the replay trade logs and the captured candlesticks.')}</p>
  `);
}

function renderStrategies() {
  const cards = state.results.map((r) => {
    const s = r.strategy || {};
    const lb = state.leaderboard.find((x) => x.username === r.username) || {};
    return `
    <div class="s-card ${state.selectedStrategy === r.username ? 'is-selected' : ''}" data-username="${esc(r.username)}">
      <div class="s-card-head">
        <span class="avatar">${esc(s.avatar || '🤖')}</span>
        <div>
          <div class="s-card-title">${esc(s.username)}</div>
          <div class="s-card-cat">${esc(s.category || '')} · ${esc(lb.qualified ? `rank #${lb.rank}` : 'not ranked')}</div>
        </div>
      </div>
      <div class="s-card-tag">${esc(s.tagline || '')}</div>
      <div class="s-card-stats">
        <div><b class="${signedClass(r.returnPct)}">${esc(pct(r.returnPct))}</b><span>return</span></div>
        <div><b>${esc(money(r.finalEquity, 0))}</b><span>equity</span></div>
        <div><b>${esc(r.totalTrades)}</b><span>fills</span></div>
        <div><b>${esc(Number(r.maxDrawdownPct || 0).toFixed(1))}%</b><span>max dd</span></div>
      </div>
      <div>${verdictPill(lb.verdict || r.analysis?.verdict)}</div>
    </div>`;
  }).join('');
  setHTML('#strategyCards', cards || '<p class="muted">No strategies loaded.</p>');
  $$('#strategyCards .s-card').forEach((el) => el.addEventListener('click', () => selectStrategy(el.dataset.username)));
  if (state.selectedStrategy) renderStrategyDetail(state.selectedStrategy);
}

function selectStrategy(username) {
  state.selectedStrategy = username;
  $$('#strategyCards .s-card').forEach((el) => el.classList.toggle('is-selected', el.dataset.username === username));
  renderStrategyDetail(username);
}

function renderStrategyDetail(username) {
  const r = state.results.find((x) => x.username === username);
  if (!r) return;
  const s = r.strategy || {};
  const st = r.stats || {};
  const a = r.attribution || {};
  const curve = (r.equityCurve || []).map((p) => p.equity);
  const rows = (r.recentTrades || []).slice(-14).reverse();

  setHTML('#strategyDetail', `
  <div class="detail">
    <div class="detail-head">
      <div>
        <h3><span class="avatar">${esc(s.avatar || '🤖')}</span> ${esc(s.username)} <span class="muted">${esc(s.handle || '')}</span></h3>
        <p class="muted" style="max-width:80ch">${esc(s.title || '')} — ${esc(s.tagline || '')}</p>
        <div class="market-facts">
          ${tag(`category: ${s.category || 'n/a'}`)}
          ${tag(`sizing: ${Math.round((s.sizingPct ?? 0) * 100)}% of cash`)}
          ${tag(`risk: ${s.rules?.riskManagement || 'NONE (by mandate)'}`)}
          ${tag(`periods: ${r.periods}`)}
          ${tag(`fills: ${r.totalTrades}`)}
          ${s.universe ? tag(`universe: ${s.universe.join(', ')}`) : tag('universe: all replayable markets')}
        </div>
      </div>
      <div style="text-align:right">
        <div class="podium-ret ${signedClass(r.returnPct)}">${esc(pct(r.returnPct))}</div>
        <div class="muted">${esc(money(r.finalEquity))} final equity</div>
        <div>${verdictPill(r.analysis?.verdict)}</div>
      </div>
    </div>

    ${sparkline(curve, { baseline: r.initialCapital })}
    <p class="muted fineprint">Equity curve — ${esc(curve.length)} points, one per real candlestick period. Dashed line = starting capital ${esc(money(r.initialCapital, 0))}.</p>

    <div class="detail-grid">
      <div>
        <h4>Thesis (design intent)</h4>
        <p style="font-size:.86rem;color:var(--text-dim)">${esc(s.thesis || '')}</p>
        <h4 style="margin-top:.8rem">Rules as coded</h4>
        <ul class="rule-list">
          ${Object.entries(s.rules || {}).map(([k, v]) => `<li><b>${esc(k)}:</b> ${esc(v)}</li>`).join('')}
        </ul>
      </div>
      <div>
        <h4>Computed statistics</h4>
        ${statRow('Return', pct(r.returnPct), signedClass(r.returnPct))}
        ${statRow('Final equity', money(r.finalEquity))}
        ${statRow('Realized P&L', money(st.realizedPnl ?? 0), signedClass(st.realizedPnl))}
        ${statRow('Unrealized P&L', money(st.unrealizedPnl ?? 0), signedClass(st.unrealizedPnl))}
        ${statRow('Fills', r.totalTrades)}
        ${statRow('Win rate', `${Number(st.winRate ?? 0).toFixed(1)}%`)}
        ${statRow('Profit factor', st.profitFactor === Infinity || st.profitFactor === null ? '∞ / n-a' : Number(st.profitFactor ?? 0).toFixed(2))}
        ${statRow('Max drawdown', `${Number(st.maxDrawdownPct ?? 0).toFixed(2)}%`)}
        ${statRow('Fees paid', money(st.feesPaid ?? 0))}
        ${statRow('Unfilled contracts', compact(a.unfilledContracts || 0))}
        ${statRow('Open positions', (r.positionsOpen || []).length)}
      </div>
      <div>
        <h4>What caused the return</h4>
        ${renderFactors(a)}
      </div>
    </div>

    <h4 style="margin-top:1rem">Post-mortem (generated from the computed numbers above)</h4>
    ${renderPostMortem(r.analysis)}

    <div class="detail-grid">
      <div>
        <h4>Per-market breakdown &amp; exposure</h4>
        <div class="table-wrap"><table class="grid"><thead><tr>
          <th>Market</th><th class="num">Fills</th><th class="num">Contracts</th><th class="num">Fees</th>
          <th class="num">Realized</th><th class="num">Open</th><th class="num">At risk</th><th class="num">Share</th>
        </tr></thead>
        <tbody>${(r.marketAnalytics?.markets?.length ? r.marketAnalytics.markets : (a.byTicker || []).map((t) => ({
          ticker: t.ticker, trades: t.trades, contractsTraded: t.contracts, feesUsd: t.fees, realizedPnlUsd: t.pnl,
          openContracts: 0, costBasisAtRisk: 0, shareOfCapitalAtRisk: 0
        }))).map((t) => `<tr>
          <td style="font-family:var(--mono);font-size:.74rem">${esc(t.ticker)}</td>
          <td class="num">${esc(t.trades)}</td><td class="num">${esc(compact(t.contractsTraded ?? t.contracts))}</td>
          <td class="num">${esc(money(t.feesUsd ?? t.fees))}</td>
          <td class="num ${signedClass(t.realizedPnlUsd ?? t.pnl)}">${esc(money(t.realizedPnlUsd ?? t.pnl))}</td>
          <td class="num">${esc(compact(t.openContracts || 0))}</td>
          <td class="num">${esc(money(t.costBasisAtRisk || 0))}</td>
          <td class="num">${t.shareOfCapitalAtRisk ? `${esc(Number(t.shareOfCapitalAtRisk).toFixed(1))}%` : '—'}</td></tr>`).join('') || '<tr><td colspan="8" class="muted">No fills.</td></tr>'}
        </tbody></table></div>
        ${r.marketAnalytics ? `<p class="fineprint muted">${esc(r.marketAnalytics.concentrationNote)}${r.marketAnalytics.hhi ? ` HHI ${esc(r.marketAnalytics.hhi)}.` : ''}</p>` : ''}
      </div>
      <div>
        <h4>Recent fills</h4>
        <div class="table-wrap"><table class="grid"><thead><tr><th>When</th><th>Market</th><th>Side</th><th class="num">Contracts</th><th class="num">VWAP</th><th class="num">Fee</th><th>Role</th></tr></thead>
        <tbody>${rows.map((t) => `<tr>
          <td style="font-family:var(--mono);font-size:.72rem">${esc(timeShort(t.timestamp))}</td>
          <td style="font-family:var(--mono);font-size:.7rem">${esc(String(t.ticker || '').slice(-18))}</td>
          <td class="${t.side === 'YES' ? 'pos' : 'neg'}">${esc(t.side)}</td>
          <td class="num">${esc(compact(t.contracts))}${t.unfilled ? `<span class="cell-sub">${esc(compact(t.unfilled))} unfilled</span>` : ''}</td>
          <td class="num">${t.vwap === null || t.vwap === undefined ? '—' : esc(price(t.vwap))}</td>
          <td class="num">${esc(money(t.fee ?? 0))}</td>
          <td>${esc(t.role || 'taker')}${t.maker ? ' (maker)' : ''}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">No fills.</td></tr>'}
        </tbody></table></div>
      </div>
    </div>

    <div class="notice" style="margin-top:1rem">
      <strong>Data used by this run:</strong>
      ${(r.dataProvenance?.markets || []).map((m) => `<code>${esc(m.ticker)}</code>`).join(' · ')}
      — real captures from ${esc(r.dataProvenance?.apiBase || 'https://external-api.kalshi.com/trade-api/v2')}, captured ${esc(r.dataProvenance?.capturedAt || '2026-09-17')}.
      ${esc(r.dataProvenance?.exhaustionPolicyNote || '')}
    </div>
  </div>`);
}

function statRow(label, value, cls = '') {
  return `<div class="stat-row"><span>${esc(label)}</span><b class="${cls}">${esc(value)}</b></div>`;
}

/* ------------------------------------------------------------------ *
 * Markets & depth
 * ------------------------------------------------------------------ */

async function loadMarkets() {
  try {
    const d = await state.runtime.markets();
    state.markets = d.markets || [];
    if (!state.selectedTicker && state.markets.length) state.selectedTicker = state.markets[0].ticker;
    renderMarketList(d);
    if (state.selectedTicker) await selectMarket(state.selectedTicker);
  } catch (err) {
    setHTML('#marketList', `<div class="notice notice-bad">Could not load markets: ${esc(err.message)}</div>`);
  }
}

function renderMarketList(d) {
  setHTML('#marketList', state.markets.map((m) => `
    <div class="m-item ${m.ticker === state.selectedTicker ? 'is-selected' : ''}" data-ticker="${esc(m.ticker)}">
      <div class="m-item-title">${esc(m.title || m.ticker)}</div>
      <div class="m-item-ticker">${esc(m.ticker)}</div>
      <div class="m-item-prices">
        <span class="chip-yes">YES ${esc(priceCents(m.yes_bid ?? m.last_price))}</span>
        <span class="chip-no">NO ${esc(priceCents(m.no_bid ?? (m.yes_bid !== null && m.yes_bid !== undefined ? 1 - m.yes_bid : null)))}</span>
        <span class="muted">vol ${esc(compact(m.volume ?? 0))}</span>
      </div>
      <div class="m-item-ticker">OI ${esc(compact(m.open_interest ?? 0))} · ${esc(m.price_level_structure || '')} · ${esc(m.status || '')}</div>
    </div>`).join('') + `
    <div class="notice" style="margin-top:.5rem">
      ${sourcePill(d.source)} <span class="muted">${esc(d.notice || '')}</span>
    </div>`);
  $$('#marketList .m-item').forEach((el) => el.addEventListener('click', () => selectMarket(el.dataset.ticker)));
}

async function selectMarket(ticker) {
  state.selectedTicker = ticker;
  $$('#marketList .m-item').forEach((el) => el.classList.toggle('is-selected', el.dataset.ticker === ticker));
  const m = state.markets.find((x) => x.ticker === ticker);
  if (!m) return;

  let bookData = null;
  try {
    if (state.mode === 'server') {
      const d = await jfetch(`/api/orderbook?ticker=${encodeURIComponent(ticker)}`);
      bookData = d;
    } else {
      const book = state.runtime.bookFor(ticker);
      bookData = { ticker, snapshot: book ? book.snapshot() : null, source: book ? book.source : null, parsed: null };
      if (book) bookData.parsed = { yesBids: book.getBidTiers('yes'), noBids: book.getBidTiers('no') };
    }
  } catch (err) {
    toast(`Order book unavailable: ${err.message}`, 'warn');
  }

  const snap = bookData?.snapshot;
  setHTML('#marketHeader', `
    <h3>${esc(m.title || m.ticker)}</h3>
    <div class="muted" style="font-family:var(--mono);font-size:.76rem;word-break:break-all">${esc(m.ticker)}</div>
    <div class="market-facts">
      ${sourcePill(snap?.mutated ? 'simulated_market_maker' : bookData?.source || m.source)}
      ${snap
        ? tag(
            snap.mutated
              ? `SIMULATED depth · ${snap.ticksApplied} modelled tick(s) · seeded from ${snap.seededFrom || 'the real capture'}`
              : snap.depthModel === 'captured_orderbook'
                ? `depth: REAL captured order book (${snap.levels?.yes ?? '?'} YES / ${snap.levels?.no ?? '?'} NO levels)`
                : `depth: MODELLED behind the real quoted touch (${snap.depthModel})`
          )
        : ''}
      ${tag(`series ${m.series_ticker}`)}
      ${tag(`grid ${m.price_level_structure || 'n/a'} · tick ${snap?.tick ?? m.tick_size ?? '?'}`)}
      ${tag(`notional ${m.notional_value ?? 1}`)}
      ${tag(`status ${m.status || 'n/a'}`)}
      ${tag(`closes ${dateShort(m.close_time)}`)}
      ${m.can_close_early ? tag('can close early') : ''}
    </div>
    <div class="kv">
      <div><span>YES bid</span><b class="pos">${esc(price(m.yes_bid))}</b></div>
      <div><span>YES ask</span><b class="neg">${esc(price(m.yes_ask))}</b></div>
      <div><span>NO bid</span><b class="pos">${esc(price(m.no_bid))}</b></div>
      <div><span>NO ask</span><b class="neg">${esc(price(m.no_ask))}</b></div>
      <div><span>Last</span><b>${esc(price(m.last_price))}</b></div>
      <div><span>Volume</span><b>${esc(compact(m.volume))}</b></div>
      <div><span>Open interest</span><b>${esc(compact(m.open_interest))}</b></div>
      <div><span>liquidity_dollars</span><b title="Captured as-is; unexplained by any official document (Irregularity #15)">${esc(m.liquidity_dollars ?? '—')}</b></div>
    </div>
    ${m.source_url ? `<p class="fineprint muted">Captured from ${link(m.source_url, m.source_url)}</p>` : ''}
  `);

  const yesBids = snap?.yesBids || bookData?.parsed?.yesBids || [];
  const noBids = snap?.noBids || bookData?.parsed?.noBids || [];
  setHTML('#ladderYesBid', renderLadder(sortDesc(yesBids), 'bid', { notional: m.notional_value ?? 1 }));
  setHTML('#ladderNoBid', renderLadder(sortDesc(noBids), 'bid', { notional: m.notional_value ?? 1 }));

  $('#tkTrader').value = state.memory?.participants?.[0]?.username || $('#tkTrader').value || '';
  $('#ticketResult').innerHTML = '';
}

function sortDesc(tiers) {
  return [...(tiers || [])].sort((a, b) => Number(b.price) - Number(a.price));
}

async function estimateTicket() {
  const ticker = state.selectedTicker;
  if (!ticker) return;
  const params = { ticker, side: $('#tkSide').value, count: $('#tkCount').value };
  setHTML('#ticketResult', '<p class="muted">Estimating against real captured depth…</p>');
  try {
    const q = await state.runtime.quote(params);
    setHTML('#ticketResult', `
      <div class="kv">
        <div><span>Requested</span><b>${esc(compact(q.count))}</b></div>
        <div><span>Filled</span><b class="pos">${esc(compact(q.filled ?? q.count))}</b></div>
        <div><span>Unfilled</span><b class="${q.unfilled ? 'neg' : 'flat'}">${esc(compact(q.unfilled || 0))}</b></div>
        <div><span>Best ${esc(q.side)} ask</span><b>${esc(price(q.bestAsk))}</b></div>
        <div><span>VWAP</span><b>${q.vwap === null ? '—' : esc(price(q.vwap))}</b></div>
        <div><span>Slippage</span><b class="${q.slippage > 0 ? 'neg' : 'flat'}">${q.slippage === null ? '—' : esc(price(q.slippage))}</b></div>
        <div><span>Fee (official formula)</span><b>${esc(money(q.fee))}</b></div>
        <div><span>Total cost</span><b>${esc(money(q.totalCost))}</b></div>
      </div>
      <p class="fineprint muted" style="margin-top:.4rem">
        <code>${esc(q.feeFormula || '')}</code> with M = ${esc(q.feeMultiplier ?? 1)} from the captured Series object
        ${q.feeMultiplier === 0 ? '— <strong>this series has fee_multiplier 0, so fees are $0.00</strong> (Irregularity #8)' : ''}.
        ${q.note ? `<br><strong>${esc(q.note)}</strong>` : ''}
      </p>`);
  } catch (err) {
    setHTML('#ticketResult', `<div class="notice notice-bad">${esc(err.message)}</div>`);
  }
}

async function submitTrade() {
  const username = ($('#tkTrader').value || '').trim();
  if (!username) { toast('Enter a registered username first (Competition Memory tab).', 'warn'); return; }
  try {
    const r = await state.runtime.trade({
      username,
      ticker: state.selectedTicker,
      side: $('#tkSide').value,
      action: $('#tkAction').value,
      count: Number($('#tkCount').value)
    });
    if (state.mode === 'static') state.memory = (await state.runtime.state()).state;
    toast(`${r.execution?.fillStatus === 'unfilled' ? 'No depth — nothing filled' : 'Paper order recorded'} for @${username}`, r.execution?.fillStatus === 'unfilled' ? 'warn' : 'ok');
    setHTML('#ticketResult', `<div class="notice ${r.execution?.fillStatus === 'unfilled' ? 'notice-warn' : 'notice-good'}">
      <strong>${esc(r.execution?.action || '')} ${esc(r.execution?.side || '')} ${esc(compact(r.execution?.contracts || 0))}</strong>
      ${r.execution?.unfilled ? `· <strong>${esc(compact(r.execution.unfilled))} unfilled</strong> (no invented price)` : ''}
      ${r.execution?.vwap != null ? `· VWAP ${esc(price(r.execution.vwap))}` : ''}
      · fee ${esc(money(r.execution?.fee || 0))}
      · equity ${esc(money(r.stats?.equity))} (${esc(pct(r.stats?.returnPct))})
    </div>`);
    renderHumanBoard();
    renderMemory();
  } catch (err) {
    toast(`Order rejected: ${err.message}`, 'err');
    setHTML('#ticketResult', `<div class="notice notice-bad">${esc(err.message)}</div>`);
  }
}

/* ---------------- feed ---------------- */

function toggleFeed(enabled) {
  if (!enabled) {
    if (state.feed) { state.feed.disconnect(); state.feed = null; }
    setText('#feedTag', 'stopped');
    return;
  }
  if (state.mode !== 'server') {
    setHTML('#tapeBody', `<div class="notice notice-warn">Static mode has no WebSocket relay. Start the Node server (<code>npm start</code>) to stream the simulated feed; Kalshi’s real WebSocket needs signed headers a browser cannot send (Irregularity #3).</div>`);
    setText('#feedTag', 'unavailable');
    return;
  }
  import('./kalshi-ws.js').then(({ RelayFeedClient }) => {
    state.feed = new RelayFeedClient({
      url: state.runtime.wsUrl,
      channels: ['ticker'],
      onEvent: (evt) => pushTape(evt),
      onStatus: (s) => {
        state.feedStatus = s;
        setText('#feedTag', s.mode === 'relay' ? (s.connected ? 'relay connected' : 'connecting…') : 'simulated');
      }
    });
    state.feed.connect();
  });
}

function pushTape(evt) {
  if (evt?.type === 'sim_batch' && Array.isArray(evt.msg?.events)) {
    for (const e of evt.msg.events) state.tape.unshift(e);
  } else state.tape.unshift(evt);
  if (state.tape.length > 60) state.tape.length = 60;
  setHTML('#tapeBody', state.tape.map((e) => `
    <div class="tape-row">
      <span class="t">${esc(timeShort(new Date(e.ts || Date.now()).toISOString()))}</span>
      <span>${esc(String(e.ticker || e.type || '').slice(-22))}</span>
      <span class="pos">bid ${esc(price(e.yesBid))}</span>
      <span class="neg">ask ${esc(price(e.yesAsk))}</span>
      <span class="muted">${esc(e.source || e.type || '')}</span>
    </div>`).join(''));
}

/* ------------------------------------------------------------------ *
 * Competition memory
 * ------------------------------------------------------------------ */

async function renderMemory() {
  try {
    const s = await state.runtime.state();
    state.memory = s.state;
    const info = s.storage || {};
    setHTML('#storageTag', `${esc(info.tier || 'unknown')} storage${info.shared ? ' · shared' : ' · private'}`);
  } catch (err) {
    setHTML('#storageTag', `unavailable (${esc(err.message)})`);
    return;
  }
  const m = state.memory;
  if (!m) return;

  setHTML('#competitionWindow', `
    ${statRow('Competition', m.title || m.competitionId)}
    ${statRow('Window', `${dateShort(m.startDate)} → ${dateShort(m.endDate)}`)}
    ${statRow('Weeks', `${m.currentWeek ?? 0} of ${m.totalWeeks ?? 52}`)}
    ${statRow('Current date', dateShort(m.currentDate))}
    ${statRow('Starting capital', money(m.initialCapital, 0))}
    ${statRow('Regime', m.regime || 'baseline')}
    ${statRow('Participants', (m.participants || []).length)}
    ${statRow('Algorithmic strategies', (m.strategies || []).length)}
    ${statRow('Trade log entries', (m.tradeLog || []).length)}
    ${statRow('Weekly snapshots', (m.weeklySnapshots || []).length)}
    ${statRow('Schema', `v${m.schemaVersion}`)}
    ${statRow('Last updated', new Date(m.lastUpdated || Date.now()).toISOString().slice(0, 19).replace('T', ' '))}
  `);

  const total = m.totalWeeks || 52;
  const cur = m.currentWeek || 0;
  setHTML('#calendarStrip', Array.from({ length: total }, (_, i) => {
    const cls = i < cur ? 'past' : i === cur ? 'current' : 'future';
    return `<div class="week ${cls}" title="Week ${i + 1}${i < cur ? ' (completed)' : i === cur ? ' (current)' : ''}">${i + 1}</div>`;
  }).join(''));

  const log = [...(m.tradeLog || [])].slice(-40).reverse();
  const events = [...(m.weeklySnapshots || [])].slice(-12).reverse().map((w) => ({
    kind: 'event', text: `Week ${w.week} · ${dateShort(w.date)} · regime ${w.regime || 'n/a'} · participants ${w.participants ?? '?'}`
  }));
  const rows = [
    ...log.map((t) => ({ kind: String(t.action || t.type || '').toLowerCase().includes('sell') ? 'sell' : 'buy', text: `${dateShort(t.date || t.timestamp)} @${t.username || t.strategy || '?'} ${t.action || t.type || ''} ${t.side || ''} ${compact(t.count ?? t.contracts ?? 0)} ${String(t.ticker || '').slice(-20)} ${t.fillStatus && t.fillStatus !== 'filled' ? `[${t.fillStatus}]` : ''}` })),
    ...events
  ].slice(0, 60);
  setHTML('#memoryLog', rows.length ? rows.map((r) => `<div class="log-row ${r.kind}">${esc(r.text)}</div>`).join('') : '<p class="muted">No trades recorded yet.</p>');

  $('#btnExportJson').href = state.runtime.exportJsonUrl || '#';
  $('#btnExportCsv').href = state.runtime.exportCsvUrl || '#';
  if (!state.runtime.exportJsonUrl) {
    $('#btnExportJson').textContent = 'Export JSON (local)';
    $('#btnExportCsv').textContent = 'Export CSV (local)';
  }
}

/* ------------------------------------------------------------------ *
 * Strategy Lab
 * ------------------------------------------------------------------ */

async function initLab() {
  const example = state.runtime.EXAMPLE || (await import('./strategy-sandbox.js')).EXAMPLE_USER_STRATEGY;
  const ta = $('#labSource');
  if (!ta.value.trim()) ta.value = example;
  lintLab();
  ta.addEventListener('input', lintLab);
}

async function lintLab() {
  const src = $('#labSource').value;
  let lint;
  if (state.runtime.lintSource) lint = state.runtime.lintSource(src);
  else lint = (await import('./strategy-sandbox.js')).lintSource(src);
  const el = $('#labLint');
  if (lint.ok) {
    el.className = 'lint lint-ok';
    el.textContent = `✓ lint passed · ${src.length} characters · decide() present · no forbidden tokens`;
  } else {
    el.className = 'lint lint-bad';
    el.textContent = `✗ lint failed: ${lint.problems.join(', ')}`;
  }
  return lint;
}

async function runLab() {
  const lint = await lintLab();
  if (!lint.ok) { toast('Fix the lint problems before running.', 'warn'); return; }
  const btn = $('#btnLabRun');
  btn.disabled = true;
  setHTML('#labOutput', '<p class="muted">Running your strategy through the real replay engine…</p>');
  try {
    // The Lab ALWAYS runs client-side, in both modes: it needs no server, and
    // server-side execution of user code stays disabled by default (Irregularity #7).
    const [sandbox, runner] = await Promise.all([import('./strategy-sandbox.js'), import('./strategy-runner.js')]);
    const strategy = sandbox.compileUserStrategy($('#labSource').value, {
      username: ($('#labUsername').value || '').trim() || 'Custom_Challenger'
    });
    const result = runner.runCustomStrategy(strategy, { settleAtEnd: state.options.settleAtEnd });
    const r = {
      ok: true,
      username: strategy.username,
      stats: result.stats,
      returnPct: result.returnPct,
      finalEquity: result.finalEquity,
      periods: result.periods,
      attribution: result.attribution,
      analysis: result.analysis,
      equityCurve: result.equityCurve,
      recentTrades: result.recentTrades,
      runtimeErrors: strategy.runtimeErrors,
      dataProvenance: result.dataProvenance
    };
    if (r.ok === false) throw new Error(r.error || 'rejected');
    const lb = state.leaderboard || [];
    const better = lb.filter((x) => x.qualified && x.returnPct < r.returnPct).length;
    setHTML('#labOutput', `
      <h3>${esc(r.username)} <span class="muted">custom strategy</span></h3>
      <div class="podium-ret ${signedClass(r.returnPct)}">${esc(pct(r.returnPct))}</div>
      <div class="kv">
        <div><span>Final equity</span><b>${esc(money(r.finalEquity))}</b></div>
        <div><span>Periods</span><b>${esc(r.periods)}</b></div>
        <div><span>Fills</span><b>${esc(r.stats?.totalTrades ?? 0)}</b></div>
        <div><span>Fees</span><b>${esc(money(r.stats?.feesPaid ?? 0))}</b></div>
        <div><span>Max DD</span><b>${esc(Number(r.stats?.maxDrawdownPct ?? 0).toFixed(2))}%</b></div>
        <div><span>Beats</span><b>${esc(better)} of ${esc(lb.filter((x) => x.qualified).length)} ranked</b></div>
      </div>
      ${sparkline((r.equityCurve || []).map((p) => p.equity), { baseline: 100000 })}
      <h4 style="margin-top:.8rem">Attribution</h4>
      ${renderFactors(r.attribution)}
      <h4 style="margin-top:.8rem">Generated post-mortem</h4>
      ${renderPostMortem(r.analysis)}
      ${(r.runtimeErrors || []).length ? `<div class="notice notice-warn"><strong>${r.runtimeErrors.length} runtime issue(s) captured:</strong><br><code>${esc(JSON.stringify(r.runtimeErrors.slice(0, 4)))}</code></div>` : ''}
      <div class="notice"><strong>Data:</strong> the same real captured candlesticks as the built-in roster — ${esc((r.dataProvenance?.capturedAt) || '2026-09-17')}, ${esc(r.periods)} periods.</div>
    `);
    toast(`Custom strategy finished at ${pct(r.returnPct)}`, r.returnPct >= 0 ? 'ok' : 'warn');
  } catch (err) {
    setHTML('#labOutput', `<div class="notice notice-bad"><strong>Run rejected:</strong> ${esc(err.message)}${err.code ? ` (<code>${esc(err.code)}</code>)` : ''}</div>
      ${err.detail ? `<p class="muted">${esc(err.detail)}</p>` : ''}
      ${(err.problems || []).length ? `<p class="muted">Problems: <code>${esc(err.problems.join(', '))}</code></p>` : ''}`);
    toast(`Lab run failed: ${err.message}`, 'err');
  } finally {
    btn.disabled = false;
  }
}

/* ------------------------------------------------------------------ *
 * Verification & irregularities
 * ------------------------------------------------------------------ */

function renderVerification(filter = '') {
  const groups = groupFacts(VERIFIED_FACTS, filter);
  const stats = factStats();
  const badge = (s) => {
    const cls = { DOCUMENTED: 'st-verified', CAPTURED: 'st-captured', NEGATIVE: 'st-negative', DERIVED: 'st-derived', OBSERVATION: 'st-negative' }[s] || 'st-derived';
    return `<span class="v-status ${cls}">${esc(s)}</span>`;
  };

  setHTML('#verificationBody', `
    <div class="notice">
      <strong>${stats.total} verified facts</strong> — ${stats.DOCUMENTED} from official documentation,
      ${stats.CAPTURED} from real production API responses, ${stats.NEGATIVE} negative results (404s / contradictions),
      ${stats.DERIVED} derived by arithmetic on official formulas, ${stats.OBSERVATION} unexplained observations.
      ${stats.withUrl} of ${stats.total} carry a URL you can open yourself. Nothing here is inferred from training data.
    </div>
    ${groups.map((g) => `
      <div class="v-group">
        <h3>${esc(g.group)} <span class="tag">${g.items.length}</span></h3>
        <div class="table-wrap"><table class="v-table">
          <thead><tr><th>ID</th><th>Status</th><th>Fact</th><th>Value as verified</th><th>Source</th><th>Used in</th></tr></thead>
          <tbody>${g.items.map((f) => `
            <tr>
              <td class="mono">${esc(f.id)}</td>
              <td>${badge(f.status)}${f.irregularity ? ` <span class="v-status st-negative">${esc(f.irregularity)}</span>` : ''}</td>
              <td>${esc(f.fact)}${f.note ? `<div class="muted" style="font-size:.75rem">${esc(f.note)}</div>` : ''}</td>
              <td class="mono">${esc(f.value)}</td>
              <td>${f.url ? link(f.url, f.url.replace(/^https?:\/\//, '').slice(0, 58)) : (f.evidenceUrl ? `<span class="muted">internal rule — enforced in code:</span> ${link(f.evidenceUrl, esc(f.evidenceLabel || 'repository source'))}` : '<span class="muted">internal rule</span>')}${f.doc ? `<div class="muted" style="font-size:.72rem">spec: ${link(f.doc, f.doc.replace(/^https?:\/\//, '').slice(0, 48))}</div>` : ''}${f.capturedAt ? `<div class="muted" style="font-size:.72rem">captured ${esc(f.capturedAt)}</div>` : ''}</td>
              <td class="mono">${esc(f.usedIn || '')}</td>
            </tr>`).join('')}
          </tbody></table></div>
      </div>`).join('')}

    <div class="v-group">
      <h3>Competition-site structure we reverse-engineered</h3>
      <p class="muted">Structure and interaction patterns only — no data, copy or branding was taken from any of these sites.</p>
      <div class="table-wrap"><table class="v-table">
        <thead><tr><th>Site</th><th>What we took</th><th>What we did not take</th><th>Implemented in</th></tr></thead>
        <tbody>${COMPETITION_SITE_ANALYSIS.map((c) => `
          <tr><td>${link(c.url, c.site)}</td><td>${esc(c.whatWeTook)}</td><td>${esc(c.whatWeDidNotTake)}</td><td class="mono">${esc(c.implementedIn)}</td></tr>`).join('')}
        </tbody></table></div>
    </div>
  `);
}

function renderIrregularities() {
  const counts = IRREGULARITIES.reduce((a, i) => ((a[i.severity] = (a[i.severity] || 0) + 1), a), {});
  setHTML('#irregularityBody', `
    <div class="notice notice-warn">
      <strong>${IRREGULARITIES.length} irregularities flagged</strong> —
      ${counts.high || 0} high, ${counts.med || 0} medium, ${counts.low || 0} low, ${counts.info || 0} informational.
      Each entry states what was assumed, what is actually true, the evidence you can check, and the corrective action taken in code.
    </div>
    ${IRREGULARITIES.map((i) => `
      <article class="irr sev-${esc(i.severity)}">
        <div class="irr-head">
          <span class="irr-id">#${esc(i.id)} · severity ${esc(i.severity.toUpperCase())}</span>
          ${i.userAction ? '<span class="tag">manual check available</span>' : ''}
        </div>
        <h3>${esc(i.title)}</h3>
        <p><span class="label">What was assumed:</span> ${esc(i.assumed)}</p>
        <p><span class="label">What is actually true:</span> ${esc(i.truth)}</p>
        <p><span class="label">Evidence:</span></p>
        <ul>${(i.evidence || []).map((e) => `<li>${e.url ? link(e.url, e.label) : esc(e.label)}${e.text ? ` — <code>${esc(e.text)}</code>` : ''}</li>`).join('')}</ul>
        <p><span class="label">Action taken:</span> ${esc(i.action)}</p>
        ${i.userAction ? `<p><span class="label">How you can verify it:</span> ${esc(i.userAction)}</p>` : ''}
      </article>`).join('')}
  `);
}

/* ------------------------------------------------------------------ *
 * Global events
 * ------------------------------------------------------------------ */

function wireGlobalEvents() {
  on('#btnRerun', 'click', async () => {
    state.options.seed = Number($('#ctlSeed').value) || 20260917;
    state.options.settleAtEnd = $('#ctlSettle').checked;
    state.options.regime = $('#ctlRegime').value;
    if (state.options.settleAtEnd) {
      toast('Settlement outcomes for these contracts are HYPOTHETICAL — they had not settled at capture time (Irregularity #14).', 'warn', 7000);
    }
    await loadCompetition();
    toast('Competition recomputed from the real captured candles.', 'ok');
  });

  on('#ctlRegime', 'change', async () => {
    state.options.regime = $('#ctlRegime').value;
    try { await state.runtime.setRegime(state.options.regime); } catch { /* static mode may reject */ }
    state.memory = (await state.runtime.state()).state;
    renderRegimeList();
    renderMemory();
  });

  on('#btnRefreshBooks', 'click', () => loadMarkets());
  on('#ctlLiveFeed', 'change', (e) => toggleFeed(e.target.checked));
  on('#tkQuote', 'click', estimateTicket);
  on('#tkSubmit', 'click', submitTrade);
  on('#tkCount', 'change', estimateTicket);
  on('#tkSide', 'change', estimateTicket);

  on('#btnRegister', 'click', async () => {
    const payload = {
      username: ($('#regUsername').value || '').trim(),
      avatar: ($('#regAvatar').value || '').trim() || '🧑‍💻',
      startingCapital: Number($('#regCapital').value) || 100000
    };
    try {
      const r = await state.runtime.register(payload);
      state.memory = (await state.runtime.state()).state;
      setHTML('#registerResult', `<div class="notice notice-good">Registered <strong>${esc(r.participant.username)}</strong> with ${esc(money(r.participant.startingCapital, 0))}. Trade from the Markets &amp; Depth tab.</div>`);
      $('#tkTrader').value = r.participant.username;
      renderHumanBoard();
      renderMemory();
      toast(`@${r.participant.username} registered`, 'ok');
    } catch (err) {
      setHTML('#registerResult', `<div class="notice notice-bad">${esc(err.message)}</div>`);
    }
  });

  on('#btnAdvance', 'click', () => advance(1));
  on('#btnAdvance4', 'click', () => advance(4));

  on('#btnReset', 'click', async () => {
    if (!confirm('Reset the whole competition year? All participants, trades and snapshots in this store will be cleared.')) return;
    await state.runtime.reset({});
    state.memory = (await state.runtime.state()).state;
    renderMemory();
    renderHumanBoard();
    toast('Competition year reset.', 'ok');
  });

  on('#btnImport', 'click', async () => {
    const raw = $('#importArea').value.trim();
    if (!raw) { setHTML('#importResult', '<div class="notice notice-warn">Paste a competition JSON first.</div>'); return; }
    try {
      const parsed = JSON.parse(raw);
      await state.runtime.saveState(parsed);
      state.memory = (await state.runtime.state()).state;
      renderMemory();
      renderHumanBoard();
      await loadCompetition();
      setHTML('#importResult', `<div class="notice notice-good">Imported ${(state.memory?.participants || []).length} participant(s), ${(state.memory?.tradeLog || []).length} trade(s).</div>`);
    } catch (err) {
      setHTML('#importResult', `<div class="notice notice-bad">Import failed: ${esc(err.message)}</div>`);
    }
  });

  on('#btnDownloadLocal', 'click', () => {
    if (state.mode === 'server') { toast('In server mode use Export JSON — it downloads from the shared store.', 'info'); return; }
    const mem = state.runtime.memory;
    if (!mem) return;
    const blob = new Blob([mem.exportMemoryJSON()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'kalshi-competition-memory.json';
    a.click();
    URL.revokeObjectURL(a.href);
  });

  on('#btnLabRun', 'click', runLab);
  on('#btnLabExample', 'click', async () => {
    const example = state.runtime.EXAMPLE || (await import('./strategy-sandbox.js')).EXAMPLE_USER_STRATEGY;
    $('#labSource').value = example;
    lintLab();
  });

  on('#verifySearch', 'input', (e) => renderVerification(e.target.value));
}

async function advance(weeks) {
  try {
    const r = await state.runtime.advance(weeks);
    state.memory = (await state.runtime.state()).state;
    renderMemory();
    renderHumanBoard();
    toast(r?.ok === false ? `Advance rejected: ${r.error || 'unknown'}` : `Advanced ${weeks} week(s) → week ${state.memory?.currentWeek}`, r?.ok === false ? 'err' : 'ok');
  } catch (err) {
    toast(`Advance failed: ${err.message}`, 'err');
  }
}

/* ------------------------------------------------------------------ */

boot().catch((err) => {
  console.error('[KalshiPaperSim] boot failed', err);
  setHTML('#provenanceText', `<span class="neg">Boot error: ${esc(err && err.message ? err.message : err)}</span>`);
  toast(`Boot failed: ${err.message}`, 'err', 12000);
});
