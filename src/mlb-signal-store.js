/**
 * KalshiPaperSim — Point-in-Time MLB Game-State Store (read side)
 * =====================================================================
 * The query layer over the archive that scripts/archive-mlb-signals.mjs grows
 * from the official MLB Stats API (statsapi.mlb.com). Browser-safe (no node:
 * imports) so the static GitHub Pages build runs the same point-in-time logic
 * the server and the reports run.
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   A game state is knowable at time T only if a state row CAPTURED at or
 *   before T shows it. `gameStateAtOrBefore()` walks a game's rows NEWEST to
 *   OLDEST and stops at the first one with captured_at <= T. If none exists it
 *   returns null — and a strategy that receives null ABSTAINS. `last_seen_at`
 *   is never consulted for a past decision (later runs advance it); the
 *   freshness of the observation is instead the newest captures[] instant
 *   <= T, which is exactly when the archive last looked.
 *
 * HOW A KALSHI TICKER IS JOINED TO A GAME
 *   KXMLBGAME-<yyMONdd><HHMM><AWAY><HOME>-<YES> encodes the first pitch in US
 *   Eastern time and the official MLB team abbreviations (verified on all 9
 *   finalized KXMLBGAME contracts in the store — fact V113). The join requires
 *   ALL of: the ET instant converted to UTC equals the official gameDate to the
 *   minute, AWAY equals the official away code, HOME equals the official home
 *   code. The team-pair segment is split using the archived official team
 *   table (data/mlb-signals/_teams.json) — never by guessing a code length —
 *   and a pair that splits in more than one way, or a code absent from the
 *   table, is UNMATCHED (no trade, reason returned).
 */

import { MLB_SIGNAL_DATA } from './mlb-signal-data.js';

const MONTHS = { JAN: '01', FEB: '02', MAR: '03', APR: '04', MAY: '05', JUN: '06', JUL: '07', AUG: '08', SEP: '09', OCT: '10', NOV: '11', DEC: '12' };

/** ISO -> unix seconds, or null. */
function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** True when the archive shipped at least one game (else: signal dark). */
export function hasMlbSignalArchive() {
  return Boolean(MLB_SIGNAL_DATA && MLB_SIGNAL_DATA.present) && mlbGames().length > 0;
}

/** The archived official team table (30 rows), or []. */
export function mlbTeams() {
  const t = MLB_SIGNAL_DATA && MLB_SIGNAL_DATA.teams;
  return t && Array.isArray(t.teams) ? t.teams : [];
}

/** Every archived game, flattened across date files. */
export function mlbGames() {
  const dates = (MLB_SIGNAL_DATA && MLB_SIGNAL_DATA.dates) || {};
  const out = [];
  for (const [date, store] of Object.entries(dates)) {
    for (const g of Object.values((store && store.games) || {})) {
      out.push({ ...g, date, captures: (store && store.captures) || [], source: (store && store.source) || null });
    }
  }
  return out;
}

/**
 * Parse a KXMLBGAME ticker. Returns null for anything else.
 * @returns {{eventDate:string, etHour:number, etMinute:number, pair:string, yesCode:string}|null}
 */
export function parseMlbGameTicker(ticker) {
  const m = /^KXMLBGAME-(\d{2})([A-Z]{3})(\d{2})(\d{2})(\d{2})([A-Z]+)-([A-Z]+)$/.exec(String(ticker || ''));
  if (!m) return null;
  const month = MONTHS[m[2]];
  if (!month) return null;
  return { eventDate: `20${m[1]}-${month}-${m[3]}`, etHour: Number(m[4]), etMinute: Number(m[5]), pair: m[6], yesCode: m[7] };
}

/**
 * Split the AWAYHOME segment using the official team table only. Exactly one
 * valid split is required; the YES code must be one of the two.
 */
export function splitTeamPair(pair, yesCode, teams = mlbTeams()) {
  const codes = new Set(teams.map((t) => String(t.abbreviation)));
  if (!codes.size) return { ok: false, reason: 'NO_TEAM_TABLE' };
  const splits = [];
  for (let i = 2; i <= pair.length - 2; i++) {
    const a = pair.slice(0, i);
    const h = pair.slice(i);
    if (codes.has(a) && codes.has(h)) splits.push({ away: a, home: h });
  }
  if (splits.length !== 1) return { ok: false, reason: splits.length === 0 ? 'TEAM_CODE_NOT_IN_OFFICIAL_TABLE' : 'AMBIGUOUS_TEAM_PAIR', splits };
  const { away, home } = splits[0];
  if (yesCode !== away && yesCode !== home) return { ok: false, reason: 'YES_CODE_NOT_IN_PAIR', away, home };
  return { ok: true, away, home, yesIsHome: yesCode === home };
}

/**
 * The UTC instant of an ET wall-clock time on a calendar date, honouring US
 * daylight-saving rules through Intl (no hard-coded −4/−5).
 */
export function easternToUtcSeconds(dateYmd, hour, minute) {
  const [y, mo, d] = dateYmd.split('-').map(Number);
  // First guess: treat the wall time as UTC, then correct by the zone offset
  // Intl reports for that instant (one refinement pass handles the DST edge).
  let guess = Date.UTC(y, mo - 1, d, hour, minute);
  for (let i = 0; i < 2; i++) {
    const offsetMin = easternOffsetMinutes(new Date(guess));
    const corrected = Date.UTC(y, mo - 1, d, hour, minute) - offsetMin * 60_000;
    if (corrected === guess) break;
    guess = corrected;
  }
  return Math.floor(guess / 1000);
}

/** Offset of America/New_York from UTC at `date`, in minutes (EDT = −240). */
export function easternOffsetMinutes(date) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York', hourCycle: 'h23',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]));
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

/**
 * Join a KXMLBGAME ticker to an archived official game. Every returned match
 * has ALL THREE identity facts equal (UTC minute, away code, home code).
 * @returns {{ok:boolean, reason?:string, game?:object, yesIsHome?:boolean, away?:string, home?:string, scheduledUtc?:number}}
 */
export function matchMlbGame(ticker, { games = mlbGames(), teams = mlbTeams() } = {}) {
  const parsed = parseMlbGameTicker(ticker);
  if (!parsed) return { ok: false, reason: 'NOT_A_KXMLBGAME_TICKER' };
  const split = splitTeamPair(parsed.pair, parsed.yesCode, teams);
  if (!split.ok) return { ok: false, reason: split.reason, parsed };
  const scheduledUtc = easternToUtcSeconds(parsed.eventDate, parsed.etHour, parsed.etMinute);
  const candidates = games.filter((g) => g.away && g.home && g.away.abbreviation === split.away && g.home.abbreviation === split.home);
  const exact = candidates.filter((g) => isoToSeconds(g.gameDate) === scheduledUtc);
  if (exact.length === 1) return { ok: true, game: exact[0], yesIsHome: split.yesIsHome, away: split.away, home: split.home, scheduledUtc, matchedBy: 'utc-minute+away+home' };
  if (exact.length > 1) return { ok: false, reason: 'MULTIPLE_GAMES_SAME_INSTANT', parsed, scheduledUtc };
  if (candidates.length) return { ok: false, reason: 'TEAMS_MATCH_BUT_TIME_DIFFERS', parsed, scheduledUtc, archivedGameDates: candidates.map((g) => g.gameDate) };
  return { ok: false, reason: 'NO_ARCHIVED_GAME', parsed, scheduledUtc };
}

/**
 * The newest state row of `game` captured at or before `tsSeconds`, plus the
 * freshest capture instant <= tsSeconds (how stale the observation was).
 * @returns {object|null}
 */
export function gameStateAtOrBefore(game, tsSeconds) {
  if (!game || !Array.isArray(game.states) || !game.states.length || !Number.isFinite(tsSeconds)) return null;
  const ordered = [...game.states].sort((a, b) => (a.captured_at < b.captured_at ? 1 : -1));
  let row = null;
  for (const s of ordered) {
    const t = isoToSeconds(s.captured_at);
    if (t === null || t > tsSeconds) continue; // captured after the decision: not knowable
    row = s;
    break;
  }
  if (!row) return null;
  let observedAt = null;
  for (const c of game.captures || []) {
    const t = isoToSeconds(c);
    if (t !== null && t <= tsSeconds && (observedAt === null || t > observedAt)) observedAt = t;
  }
  const rowTs = isoToSeconds(row.captured_at);
  if (observedAt === null || observedAt < rowTs) observedAt = rowTs;
  return {
    abstractGameState: row.abstractGameState,
    detailedState: row.detailedState,
    inning: row.inning,
    inningState: row.inningState,
    runs: row.runs,
    winner: row.winner || null,
    capturedAt: row.captured_at,
    observedAt: new Date(observedAt * 1000).toISOString(),
    staleSeconds: Math.max(0, tsSeconds - observedAt),
    source: (game.source && Array.isArray(game.source.urls) && game.source.urls[row.url_ref]) || row.url || null
  };
}

/** Coverage summary for the UI / reports (never typed by hand). */
export function mlbCoverage() {
  const games = mlbGames();
  const dates = [...new Set(games.map((g) => g.date))].sort();
  const rows = games.reduce((a, g) => a + (g.states || []).length, 0);
  const captures = new Set();
  for (const g of games) for (const c of g.captures || []) captures.add(c);
  const live = games.filter((g) => (g.states || []).some((s) => s.abstractGameState === 'Live')).length;
  const finals = games.filter((g) => (g.states || []).some((s) => s.abstractGameState === 'Final')).length;
  const sorted = [...captures].sort();
  return {
    present: hasMlbSignalArchive(),
    dates: dates.length,
    firstDate: dates[0] || null,
    lastDate: dates[dates.length - 1] || null,
    games: games.length,
    gamesWithLiveRows: live,
    gamesWithFinalRows: finals,
    stateRows: rows,
    captures: sorted.length,
    firstCapturedAt: sorted[0] || null,
    lastCapturedAt: sorted[sorted.length - 1] || null,
    teams: mlbTeams().length,
    endpoint: (MLB_SIGNAL_DATA && MLB_SIGNAL_DATA.endpoint) || null
  };
}
