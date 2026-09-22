/**
 * KalshiPaperSim — Point-in-Time ESPN Game-State + Injury Store (read side)
 * =====================================================================
 * The query layer over the archive that scripts/archive-espn-signals.mjs grows
 * from ESPN's public JSON (site.web.api.espn.com). Browser-safe (no node:
 * imports) so the static GitHub Pages build runs the same point-in-time logic
 * the server and the reports run.
 *
 * TRUST, STATED ON EVERY ANSWER
 *   ESPN public JSON is a TRUSTED BUT NOT OFFICIAL source: a public,
 *   keyless aggregator — NOT a league's official data feed. Every signal this
 *   module returns carries `trust: ESPN_TRUST_LABEL`, every strategy card that
 *   reads it repeats the label, and settlement always follows the exchange's
 *   own result. (MLB deliberately stays on the OFFICIAL MLB Stats API.)
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   A game state / injury row is knowable at time T only if a row CAPTURED at
 *   or before T shows it. Rows captured after T are invisible. The freshness
 *   of the observation is the newest captures[] instant <= T. `last_seen_at`
 *   is never consulted for a past decision. No row => null => abstain.
 *
 * HOW A KALSHI TICKER IS JOINED TO A GAME (evidence, not assumption)
 *   KX<NFL|NBA|NCAAF|NCAAMB|NHL|WNBA>GAME-<yyMONdd><AWAY><HOME>-<YESTEAM>
 *   encodes the scheduled game date in US Eastern time and Kalshi's team
 *   codes. The join requires ALL of: the ET date equals the archived event's
 *   ET date, and AWAY/HOME (after code-map translation) equal the archived
 *   event's away/home teams. The pair segment is split ONLY against the
 *   captured code map (_code-map.json, built from each contract's own rules
 *   text + the captured ESPN team tables); a pair that splits in more than one
 *   way, or holds a code the map does not know, is UNMATCHED with a reason.
 */

import { ESPN_SIGNAL_DATA } from './espn-signal-data.js';

export const ESPN_TRUST_LABEL = 'ESPN PUBLIC JSON — TRUSTED BUT NOT OFFICIAL (aggregator, not a league feed)';

const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };
/** series ticker -> league key in the archive. KXMLBGAME is NOT here (MLB has
 *  its own OFFICIAL archive). */
export const SERIES_LEAGUE = {
  KXNFLGAME: 'nfl',
  KXNBAGAME: 'nba',
  KXNCAAFGAME: 'ncaaf',
  KXNCAABGAME: 'ncaamb',
  KXNCAAMBGAME: 'ncaamb',
  KXNHLGAME: 'nhl',
  KXWNBAGAME: 'wnba'
};

function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** The trust/assumption object every consumer must surface. */
export function espnAssumption() {
  return {
    trust: ESPN_TRUST_LABEL,
    what: 'Game state and injury designations read from ESPN public JSON at capture time.',
    notOfficial: "ESPN is not a league's official data feed. Injury designations are ESPN's aggregation of team reports; game states are ESPN's scoreboard. The exchange settles on its own sources; this archive is a decision-time signal, never a settlement input.",
    knowableFrom: 'the capture instant a row was first seen (captured_at), never last_seen_at'
  };
}

/** True when the archive shipped at least one capture (else: signals dark). */
export function hasEspnArchive() {
  return Boolean(ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.present) &&
    ((ESPN_SIGNAL_DATA.leagues && Object.keys(ESPN_SIGNAL_DATA.leagues).length) || 0) > 0;
}

/** The archived team table for a league ([] when not captured). */
export function espnTeams(league) {
  const l = ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.leagues && ESPN_SIGNAL_DATA.leagues[league];
  return (l && l.teams) || [];
}

/** Every archived event of a league, flattened across date files. */
export function espnEvents(league) {
  const l = ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.leagues && ESPN_SIGNAL_DATA.leagues[league];
  const dates = (l && l.dates) || {};
  const out = [];
  for (const [date, store] of Object.entries(dates)) {
    for (const e of Object.values((store && store.events) || {})) {
      out.push({ ...e, date, captures: (store && store.captures) || [], source: (store && store.source) || null });
    }
  }
  return out;
}

/** Every archived injury team block of a league, flattened across date files. */
export function espnInjuryTeams(league) {
  const l = ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.leagues && ESPN_SIGNAL_DATA.leagues[league];
  const dates = (l && l.dates) || {};
  const out = [];
  for (const [date, store] of Object.entries(dates)) {
    for (const t of Object.values((store && store.teams) || {})) {
      out.push({ ...t, date, captures: (store && store.captures) || [] });
    }
  }
  return out;
}

/** The captured code map rows ([] when none). */
export function espnCodeMapRows() {
  return (ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.codeMap && ESPN_SIGNAL_DATA.codeMap.rows) || [];
}

/**
 * Parse a game-family ticker: KX<NFL|…>GAME-<yyMONdd><AWAY><HOME>-<YESCODE>.
 * The pair+yes segment shape differs from KXMLBGAME (no HHMM) — verified on
 * the tracked contracts (KXNFLGAME-26SEP13DALNYG-DAL, KXNBAGAME-26OCT20PHINYK-NYK,
 * KXNCAAFGAME-26SEP26CARKFSU-FSU, KXNHLGAME-26SEP19CHIMIN-CHI).
 */
export function parseEspnGameTicker(ticker) {
  const s = String(ticker || '');
  const m = /^(KX[A-Z]+GAME)-(\d{2})([A-Z]{3})(\d{2})([A-Z]+)-([A-Z0-9]+)$/.exec(s);
  if (!m) return null;
  const league = SERIES_LEAGUE[m[1]];
  if (!league) return null;
  const month = MONTHS[m[3]];
  if (!month) return null;
  return { series: m[1], league, eventDate: `20${m[2]}-${month}-${m[4]}`, pair: m[5], yesCode: m[6] };
}

/**
 * Split the AWAYHOME pair using ONLY the captured code map for the league.
 * Exactly one split (both codes mapped) is required.
 */
export function splitEspnPair(pair, yesCode, league, rows = espnCodeMapRows()) {
  const codes = new Set(rows.filter((r) => r.league === league && r.espn).map((r) => r.kalshiCode));
  const all = new Set(rows.filter((r) => r.league === league).map((r) => r.kalshiCode));
  if (!all.size) return { ok: false, reason: 'NO_CODE_MAP_YET' };
  const splits = [];
  for (let i = 2; i <= pair.length - 2; i++) {
    const a = pair.slice(0, i);
    const h = pair.slice(i);
    if (codes.has(a) && codes.has(h)) splits.push({ away: a, home: h });
  }
  if (splits.length === 0) {
    // Distinguish "codes known but un-mapped to ESPN" from "codes unknown".
    const anySplit = [];
    for (let i = 2; i <= pair.length - 2; i++) {
      const a = pair.slice(0, i);
      const h = pair.slice(i);
      if (all.has(a) && all.has(h)) anySplit.push({ away: a, home: h });
    }
    return { ok: false, reason: anySplit.length === 1 ? 'CODE_UNMAPPED_TO_ESPN' : anySplit.length ? 'AMBIGUOUS_TEAM_PAIR' : 'TEAM_CODE_NOT_IN_MAP' };
  }
  if (splits.length !== 1) return { ok: false, reason: 'AMBIGUOUS_TEAM_PAIR', splits };
  const { away, home } = splits[0];
  if (yesCode !== away && yesCode !== home) return { ok: false, reason: 'YES_CODE_NOT_IN_PAIR', away, home };
  return { ok: true, away, home, yesIsHome: yesCode === home };
}

function espnTeamOf(league, kalshiCode, rows = espnCodeMapRows()) {
  const row = rows.find((r) => r.league === league && r.kalshiCode === kalshiCode && r.espn);
  return row ? row.espn : null;
}

/**
 * Join a game-family ticker to an archived ESPN event. ALL identity facts must
 * agree: ET date + translated away team + translated home team.
 */
export function matchEspnGame(ticker, { events = null, rows = espnCodeMapRows() } = {}) {
  const parsed = parseEspnGameTicker(ticker);
  if (!parsed) return { ok: false, reason: 'NOT_A_SUPPORTED_GAME_TICKER' };
  const split = splitEspnPair(parsed.pair, parsed.yesCode, parsed.league, rows);
  if (!split.ok) return { ok: false, reason: split.reason, parsed };
  const awayTeam = espnTeamOf(parsed.league, split.away, rows);
  const homeTeam = espnTeamOf(parsed.league, split.home, rows);
  if (!awayTeam || !homeTeam) return { ok: false, reason: 'CODE_UNMAPPED_TO_ESPN', parsed };
  const list = events || espnEvents(parsed.league);
  const candidates = list.filter((e) =>
    e.awayTeamId === awayTeam.teamId && e.homeTeamId === homeTeam.teamId);
  const exact = candidates.filter((e) => e.easternDate === parsed.eventDate);
  if (exact.length === 1) {
    return {
      ok: true, event: exact[0], parsed,
      yesIsHome: split.yesIsHome,
      yesTeam: split.yesIsHome ? homeTeam : awayTeam,
      oppTeam: split.yesIsHome ? awayTeam : homeTeam,
      matchedBy: 'eastern-date+away+home'
    };
  }
  if (exact.length > 1) return { ok: false, reason: 'MULTIPLE_EVENTS_SAME_DAY', parsed };
  if (candidates.length) return { ok: false, reason: 'TEAMS_MATCH_BUT_DATE_DIFFERS', parsed, archivedDates: candidates.map((e) => e.easternDate) };
  return { ok: false, reason: 'NO_ARCHIVED_EVENT', parsed };
}

/**
 * The newest state row of an event captured at or before `tsSeconds`, plus the
 * freshest capture instant <= tsSeconds (observation staleness).
 */
export function gameStateAtOrBefore(event, tsSeconds) {
  if (!event || !Array.isArray(event.states) || !event.states.length || !Number.isFinite(tsSeconds)) return null;
  const ordered = [...event.states].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
  let row = null;
  for (const s of ordered) {
    const t = isoToSeconds(s.captured_at);
    if (t === null || t > tsSeconds) continue;
    row = s;
    break;
  }
  if (!row) return null;
  let observedAt = null;
  for (const c of event.captures || []) {
    const t = isoToSeconds(c);
    if (t !== null && t <= tsSeconds && (observedAt === null || t > observedAt)) observedAt = t;
  }
  const rowTs = isoToSeconds(row.captured_at);
  if (observedAt === null || observedAt < rowTs) observedAt = rowTs;
  return {
    state: row.state,
    statusName: row.statusName,
    completed: row.completed,
    period: row.period,
    clock: row.clock,
    displayClock: row.displayClock,
    scores: row.scores,
    recordsOverall: row.recordsOverall,
    capturedAt: row.captured_at,
    observedAt: new Date(observedAt * 1000).toISOString(),
    staleSeconds: Math.max(0, tsSeconds - observedAt),
    source: (event.source && Array.isArray(event.source.urls) && event.source.urls[row.url_ref]) || null
  };
}

/**
 * The newest injury picture for one team block at `tsSeconds`: per-player
 * status counts using only rows captured at or before T. Statuses keep ESPN's
 * own vocabulary; the returned `byStatus` maps status -> count verbatim, and
 * `out` is the count of records whose status is exactly "Out".
 */
export function injuryStateAtOrBefore(teamBlock, tsSeconds) {
  if (!teamBlock || !teamBlock.players || !Number.isFinite(tsSeconds)) return null;
  const byStatus = {};
  let out = 0;
  let observedAt = null;
  let newestChange = null;
  for (const p of Object.values(teamBlock.players)) {
    const ordered = [...(p.history || [])].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
    for (const h of ordered) {
      const t = isoToSeconds(h.captured_at);
      if (t === null || t > tsSeconds) continue;
      const st = String(h.status || 'Unknown');
      byStatus[st] = (byStatus[st] || 0) + 1;
      if (st === 'Out') out += 1;
      if (observedAt === null || t > observedAt) observedAt = t;
      if (!newestChange || h.captured_at > newestChange) newestChange = h.captured_at;
      break;
    }
  }
  if (observedAt === null) return null;
  return {
    byStatus,
    out,
    total: Object.values(byStatus).reduce((a, b) => a + b, 0),
    observedAt: new Date(observedAt * 1000).toISOString(),
    newestChangeAt: newestChange,
    staleSeconds: Math.max(0, tsSeconds - observedAt),
    teamName: teamBlock.displayName || null,
    teamAbbr: (Object.values(teamBlock.players)[0] || {}).teamAbbr || null
  };
}

/** Injury picture for a list of ESPN team ids, at T (each row point-in-time). */
export function injuryCountsForTeams(league, teamIds, tsSeconds) {
  const blocks = espnInjuryTeams(league);
  const out = {};
  for (const id of teamIds) {
    // Newest block containing that team id at/before T wins per player rows —
    // the store flattens by date file; pick the block whose rows answer at T.
    const candidates = blocks.filter((b) => b.teamId === String(id));
    let best = null;
    for (const b of candidates) {
      const st = injuryStateAtOrBefore(b, tsSeconds);
      if (st && (!best || st.observedAt > best.observedAt)) best = st;
    }
    out[String(id)] = best;
  }
  return out;
}

/**
 * Per-ticker join status of every supported game contract in the replay
 * universe against the archive — the published answer to "why did the ESPN
 * entries not trade this contract?". Computed, never typed.
 */
export function espnJoinReport(tickers = []) {
  return tickers
    .filter((t) => parseEspnGameTicker(t))
    .map((ticker) => {
      const m = matchEspnGame(ticker);
      return {
        ticker,
        league: (parseEspnGameTicker(ticker) || {}).league || null,
        ok: m.ok,
        reason: m.ok ? 'MATCHED' : m.reason,
        eventId: m.ok ? m.event.eventId : null,
        easternDate: m.ok ? m.event.easternDate : (m.parsed ? m.parsed.eventDate : null),
        yesIsHome: m.ok ? m.yesIsHome : null,
        stateRows: m.ok ? (m.event.states || []).length : 0
      };
    });
}

/** Coverage summary for the UI / reports (computed, never typed). */
export function espnCoverage() {
  const leagues = (ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.leagues) || {};
  const rows = [];
  let eventCount = 0;
  let stateRows = 0;
  let injuryTeams = 0;
  for (const [key, l] of Object.entries(leagues)) {
    const evs = espnEvents(key);
    const inj = espnInjuryTeams(key);
    eventCount += evs.length;
    injuryTeams += inj.length;
    stateRows = evs.reduce((a, e) => a + (e.states || []).length, 0) + stateRows;
    rows.push({
      league: key,
      label: l.label || key,
      dates: Object.keys(l.dates || {}).filter((d) => (l.dates[d] && l.dates[d].events) || (l.dates[d] && l.dates[d].teams)).length,
      events: evs.length,
      injuryTeamBlocks: inj.length,
      teams: (l.teams || []).length
    });
  }
  const map = ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.codeMap;
  return {
    present: hasEspnArchive(),
    trust: ESPN_TRUST_LABEL,
    leagues: rows,
    events: eventCount,
    stateRows,
    injuryTeamBlocks: injuryTeams,
    codeMapRows: (map && map.rows || []).length,
    codeMapMatched: (map && map.rows || []).filter((r) => r.espn).length,
    generatedAt: (ESPN_SIGNAL_DATA && ESPN_SIGNAL_DATA.generatedAt) || null
  };
}
