/**
 * KalshiPaperSim — one rule for "what does the exchange say this contract is?"
 * =========================================================================
 *
 * WHY THIS MODULE EXISTS (session 2026-09-22, irregularity #66)
 *   A capture store (`data/history/<ticker>.json`) records the market object the
 *   exchange returned AT ITS OWN capture instant: `status`, `result`,
 *   `market_captured_at`. The same ticker is stored in MORE THAN ONE file — the
 *   daily store at `data/history/`, the 60-minute store at
 *   `data/history/intraday/60m/` and the 1-minute store at
 *   `data/history/intraday/1m/`. Each file is a point-in-time photograph, so
 *   they legitimately disagree: the 1-minute file for
 *   `KXNHLGAME-26SEP19VGKLA-VGK` says `active` (captured 2026-09-20T03:39Z,
 *   while the game was live) and the daily file for the same ticker says
 *   `finalized` with `result: yes` (captured 2026-09-22T19:56Z).
 *
 *   Code that read ONE file and called its `status` "the status" therefore made
 *   two verifiable mistakes on the committed store:
 *     • `scripts/verify-game-window.mjs` counted 2 settled KXNHLGAME contracts as
 *       OPEN tradeable slots (`openLadderContracts: 2`), and ROADMAP item
 *       "Next #12" repeated the claim ("Two OPEN KXNHLGAME contracts … never
 *       reach the desk");
 *     • `scripts/generate-desk-module.mjs` merged the files in readdir order and
 *       let the LAST file win, so 3 contracts that the exchange had already
 *       settled carried `status: "active"` in `src/desk-data.js` while ALSO
 *       carrying `result: "yes" | "no"` — an internally contradictory record
 *       (2 of them occupied KXNCAAFSPREAD reserve slots the desk should have
 *       given to a tradeable contract).
 *
 *   The rule below is the only one consistent with the evidence in the store and
 *   with how an exchange works:
 *
 *   R1. Every observation is a point-in-time photograph and keeps its own
 *       capture instant. Nothing is thrown away — the disagreements are
 *       PUBLISHED (`conflicts`), never silently resolved in one caller.
 *   R2. SETTLEMENT IS MONOTONE. A contract the exchange has finalized with a
 *       result (`yes`/`no`) never becomes tradeable again. An observation that
 *       says `active` for a ticker that any observation settled is a STALE
 *       photograph, not a reopening. This is why the settled observation wins
 *       the status even when it is not the newest one, and why a caller that
 *       needs "is this tradeable?" must use `settled` and `openForTrading`
 *       rather than the raw string.
 *   R3. Otherwise the NEWEST observation wins (`market_captured_at`; ties broken
 *       by the store file path so the result is deterministic across runs).
 *
 *   No network, no heuristic, no interpolation: the resolver only reads fields
 *   the exchange published.
 */

/** The exchange's own terminal status for a settled contract. */
const FINALIZED_STATUS = 'finalized';
/** Result vocabulary that constitutes an exchange settlement (Kalshi: yes/no). */
const SETTLEMENT_RESULTS = new Set(['yes', 'no']);

export const MARKET_STATUS_RULE = Object.freeze({
  id: 'market-status-v1',
  r1: 'every store file is a point-in-time photograph and is kept; disagreements are published as conflicts',
  r2: 'settlement is monotone: an observation finalized with result yes/no wins over any active/initialized observation, even a newer one, because a settled contract cannot reopen',
  r3: 'otherwise the newest observation by market_captured_at wins; ties are broken by source path so the outcome is deterministic',
  source: 'https://docs.kalshi.com/api-reference/market/get-market (status, result, settlement_value are the exchange\'s own fields)',
  capturedIn: 'data/history/**/*.json → status, result, market_captured_at (written by scripts/ingest-history.mjs)'
});

/**
 * @param {object} observation
 * @param {string} observation.status        verbatim `status` from the store file
 * @param {string|null} [observation.result] verbatim `result` from the store file
 * @param {string|null} [observation.marketCapturedAt] ISO instant the market object was captured
 * @param {string|null} [observation.source] store file path (evidence + tie-break)
 * @returns {{status: string|null, result: string|null, settled: boolean, marketCapturedAt: string|null, capturedAtMs: number|null, source: string|null}}
 */
export function normalizeObservation(observation) {
  const status = observation && observation.status !== undefined && observation.status !== null
    ? String(observation.status)
    : null;
  const rawResult = observation ? observation.result : null;
  const result = rawResult === undefined || rawResult === null || rawResult === '' ? null : String(rawResult);
  const marketCapturedAt = observation && observation.marketCapturedAt ? String(observation.marketCapturedAt) : null;
  const ms = marketCapturedAt ? Date.parse(marketCapturedAt) : NaN;
  return {
    status,
    result,
    settled: status === FINALIZED_STATUS && SETTLEMENT_RESULTS.has(String(result)),
    marketCapturedAt,
    capturedAtMs: Number.isFinite(ms) ? ms : null,
    source: observation && observation.source ? String(observation.source) : null
  };
}

/** Newest first; undated observations last; ties by source path (deterministic). */
function byNewest(a, b) {
  if (a.capturedAtMs === null && b.capturedAtMs === null) return String(a.source || '').localeCompare(String(b.source || ''));
  if (a.capturedAtMs === null) return 1;
  if (b.capturedAtMs === null) return -1;
  if (b.capturedAtMs !== a.capturedAtMs) return b.capturedAtMs - a.capturedAtMs;
  return String(a.source || '').localeCompare(String(b.source || ''));
}

/**
 * Resolve one ticker from every observation the store holds for it.
 *
 * @param {Array<object>} observations raw observations (see normalizeObservation)
 * @returns {{
 *   ticker: string|null, status: string|null, result: string|null, settled: boolean,
 *   openForTrading: boolean, marketCapturedAt: string|null, source: string|null,
 *   observations: number, settledObservations: number, conflict: boolean,
 *   conflictDetail: object|null, rule: string, why: string
 * }}
 */
export function resolveMarketStatus(observations, options = {}) {
  const list = (Array.isArray(observations) ? observations : [])
    .map(normalizeObservation)
    .sort(byNewest);

  if (!list.length) {
    return {
      ticker: options.ticker || null,
      status: null,
      result: null,
      settled: false,
      openForTrading: false,
      marketCapturedAt: null,
      source: null,
      observations: 0,
      settledObservations: 0,
      conflict: false,
      conflictDetail: null,
      rule: MARKET_STATUS_RULE.id,
      why: 'no store file carries this ticker, so nothing is claimed about its status'
    };
  }

  const newest = list[0];
  const settledObs = list.filter((o) => o.settled);
  // R2 — the newest settled photograph is the settlement of record; if the
  // newest observation overall disagrees, the conflict is published.
  const settlement = settledObs[0] || null;
  const chosen = settlement || newest;
  const distinctStatuses = [...new Set(list.map((o) => o.status))];
  const conflict = settledObs.length > 0 && !newest.settled;
  const conflictDetail = conflict
    ? {
        resolution: 'settled (R2: settlement is monotone)',
        settled: { status: settlement.status, result: settlement.result, marketCapturedAt: settlement.marketCapturedAt, source: settlement.source },
        newest: { status: newest.status, result: newest.result, marketCapturedAt: newest.marketCapturedAt, source: newest.source },
        distinctStatuses,
        note: 'the newer observation does not carry a settlement result, so it is a stale tradeability photograph of a contract the exchange already settled — the contract is NOT tradeable'
      }
    : null;

  const settled = Boolean(settlement);
  return {
    ticker: options.ticker || null,
    status: chosen.status,
    result: settled ? settlement.result : (newest.result ?? null),
    settled,
    openForTrading: !settled && (newest.status === 'active' || newest.status === 'initialized'),
    marketCapturedAt: chosen.marketCapturedAt,
    source: chosen.source,
    observations: list.length,
    settledObservations: settledObs.length,
    conflict,
    conflictDetail,
    rule: MARKET_STATUS_RULE.id,
    why: settled
      ? `${settledObs.length} of ${list.length} store file(s) carry the exchange's settlement (result ${settlement.result}); settlement is monotone, so this contract is settled${conflict ? ' even though a newer file says ' + JSON.stringify(newest.status) : ''}`
      : `no store file carries a settlement; the newest observation (${newest.marketCapturedAt || 'undated'} in ${newest.source || 'unknown source'}) says ${JSON.stringify(newest.status)}`
  };
}

/**
 * Convenience for callers that hold a list of parsed store files.
 * @param {Array<{ticker: string, status?: string, result?: string|null, market_captured_at?: string, source?: string, file?: string}>} stores
 * @returns {Map<string, ReturnType<typeof resolveMarketStatus>>}
 */
export function resolveStoreStatuses(stores) {
  const byTicker = new Map();
  for (const store of Array.isArray(stores) ? stores : []) {
    if (!store || !store.ticker) continue;
    const ticker = String(store.ticker);
    if (!byTicker.has(ticker)) byTicker.set(ticker, []);
    byTicker.get(ticker).push({
      status: store.status,
      result: store.result,
      marketCapturedAt: store.market_captured_at || store.marketCapturedAt || null,
      source: store.file || store.source || null
    });
  }
  const out = new Map();
  for (const [ticker, observations] of byTicker) out.set(ticker, resolveMarketStatus(observations, { ticker }));
  return out;
}
