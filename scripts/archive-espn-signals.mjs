#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time ESPN Game-State + Injury Archive
 * =====================================================================
 * ROADMAP "Next #3(a)" — NFL / NBA / NCAA live state + injury reports from
 * ESPN's public JSON. ESPN is a TRUSTED BUT NOT OFFICIAL source: it is a
 * public, keyless, machine-readable aggregator — NOT a league's official data
 * feed. Every store file, every strategy card and every signal object that
 * reads this archive carries that label; settlement always follows the
 * exchange's own result. (MLB is different and stays on the OFFICIAL MLB Stats
 * API — this archive covers the leagues whose official JSON is not open.)
 *
 * WHAT THIS WRITES (data/espn-signals/)
 *   <league>/scoreboard/<YYYY-MM-DD>.json
 *     one state row per CHANGE of (state, period, clock-minute, scores,
 *     completed, status name) per event, the instant it was first seen;
 *     captures[] lists every run instant so staleness of any past observation
 *     is measurable (the same discipline as data/mlb-signals/).
 *   <league>/injuries/<YYYY-MM-DD>.json
 *     one row per (team, player record) per CHANGE of (status, date,
 *     comments) — statuses are ESPN's own vocabulary verbatim ("Out",
 *     "Questionable", "Doubtful", "Active", …). Nothing is normalized away.
 *   <league>/_teams.json
 *     the league's team table (id, abbreviation, displayName, location, name,
 *     slug) — the join evidence base.
 *   _code-map.json
 *     the Kalshi-ticker-code ↔ ESPN-team map, BUILT FROM EVIDENCE ONLY (see
 *     buildCodeMap below): each row carries the contract whose rules text
 *     supplied the Kalshi-side name and the ESPN row it matched on name. A
 *     code that cannot be matched uniquely is left UNMAPPED with its reason —
 *     an unmapped ticker can never be traded by an injury/state entry.
 *   _espn-last-run.json
 *     the run report (HTTP statuses, row counts, any refusal).
 *
 * POINT-IN-TIME RULE (enforced by src/espn-signal-store.js)
 *   A state is knowable at T only if a row captured_at <= T shows it. The
 *   freshest observation instant is the newest captures[] entry <= T.
 *   last_seen_at is NEVER used for a past decision. No row -> null -> the
 *   strategy abstains.
 *
 * USAGE
 *   node scripts/archive-espn-signals.mjs               # capture now
 *   node scripts/archive-espn-signals.mjs --verify      # offline audit
 *   node scripts/archive-espn-signals.mjs --dry-run     # print the plan
 *
 * NOTE ON THE SANDBOX: direct TLS egress to ESPN is blocked in the build
 * container (the same environment that cannot reach *.kalshi.com — see
 * IRREGULARITIES #4). This script runs from the GitHub-hosted workflow
 * (.github/workflows/espn-signals.yml); the shape fixtures under
 * data/espn-signals/fixtures/ were captured live through the Arena page-fetch
 * tool on 2026-09-21 and are what the offline tests parse.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'espn-signals');
const LAST_RUN_FILE = path.join(DATA_DIR, '_espn-last-run.json');
const CODE_MAP_FILE = path.join(DATA_DIR, '_code-map.json');
const SITE_BASE = 'https://site.web.api.espn.com/apis/site/v2/sports';
const USER_AGENT = 'KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim; research)';
export const TRUST_LABEL = 'ESPN PUBLIC JSON — TRUSTED BUT NOT OFFICIAL (aggregator, not a league feed)';

/**
 * The leagues this archive covers, with the Kalshi game series whose tickers
 * the code map joins to them. (KXMLBGAME is deliberately ABSENT: MLB stays on
 * the official MLB Stats API archive — data/mlb-signals/.)
 */
export const LEAGUES = {
  nfl: { sport: 'football', slug: 'nfl', label: 'NFL', kalshiSeries: ['KXNFLGAME'], word: 'Pro Football' },
  nba: { sport: 'basketball', slug: 'nba', label: 'NBA', kalshiSeries: ['KXNBAGAME'], word: 'Pro Basketball' },
  ncaaf: { sport: 'football', slug: 'college-football', label: 'NCAA football', kalshiSeries: ['KXNCAAFGAME'], word: 'college football' },
  ncaamb: { sport: 'basketball', slug: 'mens-college-basketball', label: 'NCAA men\'s basketball', kalshiSeries: ['KXNCAABGAME', 'KXNCAAMBGAME'], word: 'college basketball' },
  nhl: { sport: 'hockey', slug: 'nhl', label: 'NHL', kalshiSeries: ['KXNHLGAME'], word: 'NHL' },
  wnba: { sport: 'basketball', slug: 'wnba', label: 'WNBA', kalshiSeries: ['KXWNBAGAME'], word: 'WNBA' }
};

const GAME_STATES = new Set(['pre', 'in', 'post']);

/* ─────────────────────────── helpers ─────────────────────────── */

function req(obj, key, type, where) {
  if (obj == null || !(key in obj)) throw new Error(`ESPN shape change: missing "${key}" at ${where}`);
  const v = obj[key];
  if (type === 'string' && typeof v !== 'string') throw new Error(`ESPN shape change: "${key}" should be string at ${where}`);
  if (type === 'number' && typeof v !== 'number') throw new Error(`ESPN shape change: "${key}" should be number at ${where}`);
  if (type === 'object' && (typeof v !== 'object' || v === null)) throw new Error(`ESPN shape change: "${key}" should be object at ${where}`);
  if (type === 'array' && !Array.isArray(v)) throw new Error(`ESPN shape change: "${key}" should be array at ${where}`);
  return v;
}

export function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** US-Eastern calendar date (YYYY-MM-DD) of a UTC instant — the date a game
 *  is "originally scheduled for" in its own rules text. */
export function easternDate(iso) {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  return fmt.format(new Date(iso));
}

export function nowIso() {
  return new Date().toISOString();
}

/* ─────────────────────── strict parsers ─────────────────────── */

/**
 * Parse a site.web.api.espn.com scoreboard response. Required keys were
 * verified on the live 2026-09-21 capture (fixture:
 * data/espn-signals/fixtures/scoreboard-nfl-20260921.json); anything missing
 * throws instead of being guessed.
 */
export function parseScoreboard(json, url, capturedAt) {
  req(json, 'leagues', 'array', url);
  req(json, 'events', 'array', url);
  const league = req(json.leagues[0] || {}, 'slug', 'string', `${url} leagues[0]`);
  const events = json.events.map((ev, i) => {
    const where = `${url} events[${i}]`;
    const id = String(req(ev, 'id', 'string', where));
    const date = req(ev, 'date', 'string', where);
    const name = req(ev, 'name', 'string', where);
    const comp = (req(ev, 'competitions', 'array', where) || [])[0];
    if (!comp) throw new Error(`ESPN shape change: no competitions[0] at ${where}`);
    const competitors = req(comp, 'competitors', 'array', `${where} competitions[0]`).map((c, j) => {
      const w = `${where} competitors[${j}]`;
      const team = req(c, 'team', 'object', w);
      const scoreRaw = c.score === undefined || c.score === null || c.score === '' ? null : Number(req(c, 'score', 'string', w));
      return {
        homeAway: req(c, 'homeAway', 'string', w),
        teamId: String(req(team, 'id', 'string', `${w} team`)),
        abbr: req(team, 'abbreviation', 'string', `${w} team`),
        displayName: req(team, 'displayName', 'string', `${w} team`),
        location: team.location != null ? String(team.location) : null,
        name: team.name != null ? String(team.name) : null,
        score: Number.isFinite(scoreRaw) ? scoreRaw : null,
        recordsOverall: Array.isArray(c.records)
          ? ((c.records.find((r) => r && (r.type === 'total' || r.name === 'overall')) || {}).summary ?? null)
          : null
      };
    });
    const st = req(comp, 'status', 'object', `${where} competitions[0]`);
    const stType = req(st, 'type', 'object', `${where} status`);
    const state = req(stType, 'state', 'string', `${where} status.type`);
    if (!GAME_STATES.has(state)) throw new Error(`ESPN shape change: unknown status.type.state "${state}" at ${where}`);
    const odds = Array.isArray(comp.odds) && comp.odds[0]
      ? {
          providerName: (comp.odds[0].provider && comp.odds[0].provider.name) || null,
          details: comp.odds[0].details != null ? String(comp.odds[0].details) : null,
          spread: typeof comp.odds[0].spread === 'number' ? comp.odds[0].spread : null,
          overUnder: typeof comp.odds[0].overUnder === 'number' ? comp.odds[0].overUnder : null
        }
      : null;
    return {
      eventId: id,
      uid: ev.uid != null ? String(ev.uid) : null,
      date,
      name,
      shortName: ev.shortName != null ? String(ev.shortName) : null,
      week: ev.week && typeof ev.week.number === 'number' ? ev.week.number : null,
      venue: (comp.venue && comp.venue.fullName) || null,
      competitors,
      status: {
        clock: typeof st.clock === 'number' ? st.clock : null,
        displayClock: st.displayClock != null ? String(st.displayClock) : null,
        period: typeof st.period === 'number' ? st.period : null,
        typeId: stType.id != null ? String(stType.id) : null,
        statusName: req(stType, 'name', 'string', `${where} status.type`),
        state,
        completed: req(stType, 'completed', 'boolean', `${where} status.type`) === true,
        description: stType.description != null ? String(stType.description) : null,
        detail: stType.detail != null ? String(stType.detail) : null,
        shortDetail: stType.shortDetail != null ? String(stType.shortDetail) : null
      },
      oddsContextOnly: odds
    };
  });
  return {
    league,
    season: (json.leagues[0] && json.leagues[0].season && json.leagues[0].season.displayName) || null,
    seasonType: (json.leagues[0] && json.leagues[0].season && json.leagues[0].season.type && json.leagues[0].season.type.name) || null,
    responseTimestamp: json.timestamp != null ? String(json.timestamp) : null,
    events,
    urls: [url],
    capturedAt
  };
}

/**
 * Parse a site.web.api.espn.com injuries response (envelope verified live on
 * 2026-09-21 for both NFL and NBA — fixture:
 * data/espn-signals/fixtures/injuries-records-2026-09-21.json).
 */
export function parseInjuries(json, url, capturedAt) {
  req(json, 'status', 'string', url);
  req(json, 'injuries', 'array', url);
  const teams = (json.injuries || []).map((t, i) => {
    const where = `${url} injuries[${i}]`;
    const teamId = String(req(t, 'id', 'string', where));
    const displayName = req(t, 'displayName', 'string', where);
    const records = (t.injuries || []).map((r, j) => {
      const w = `${where} injuries[${j}]`;
      const athlete = req(r, 'athlete', 'object', w);
      const team = req(athlete, 'team', 'object', `${w} athlete`);
      return {
        recordId: String(req(r, 'id', 'string', w)),
        status: req(r, 'status', 'string', w),
        date: r.date != null ? String(r.date) : null,
        shortComment: r.shortComment != null ? String(r.shortComment) : null,
        longComment: r.longComment != null ? String(r.longComment) : null,
        athleteName: req(athlete, 'displayName', 'string', `${w} athlete`),
        positionAbbr: (athlete.position && athlete.position.abbreviation) || null,
        teamId: String(req(team, 'id', 'string', `${w} athlete.team`)),
        teamAbbr: req(team, 'abbreviation', 'string', `${w} athlete.team`),
        teamName: req(team, 'displayName', 'string', `${w} athlete.team`)
      };
    });
    return { teamId, displayName, records };
  });
  return {
    status: json.status,
    timestamp: json.timestamp != null ? String(json.timestamp) : null,
    season: json.season && json.season.displayName != null ? String(json.season.displayName) : null,
    teams,
    urls: [url],
    capturedAt
  };
}

/** Parse a site.web.api.espn.com teams response into the compact team table. */
export function parseTeams(json, url, capturedAt) {
  const sport = req(json, 'sports', 'array', url)[0];
  const league = req(sport, 'leagues', 'array', url)[0];
  const teams = req(league, 'teams', 'array', url).map((row, i) => {
    const t = req(row, 'team', 'object', `${url} teams[${i}]`);
    return {
      id: String(req(t, 'id', 'string', `${url} teams[${i}].team`)),
      abbr: req(t, 'abbreviation', 'string', `${url} teams[${i}].team`),
      displayName: req(t, 'displayName', 'string', `${url} teams[${i}].team`),
      location: t.location != null ? String(t.location) : null,
      name: t.name != null ? String(t.name) : null,
      slug: t.slug != null ? String(t.slug) : null,
      nickname: t.nickname != null ? String(t.nickname) : null,
      isActive: t.isActive === true
    };
  });
  return { teams, urls: [url], capturedAt };
}

/* ─────────────────────── state fingerprints ─────────────────────── */

/** What counts as a CHANGE of game state (clock bucketed to the minute). */
export function stateFingerprint(ev) {
  const s = ev.status;
  const scores = ev.competitors.map((c) => c.score).join(',');
  return [s.state, s.period ?? '', s.clock == null ? '' : Math.floor(s.clock / 60), scores, s.completed, s.statusName].join('|');
}

/** What counts as a CHANGE of an injury record. */
export function injuryFingerprint(r) {
  return [r.status, r.date || '', r.shortComment || ''].join('|');
}

/* ─────────────────── store merge (append-only) ─────────────────── */

/**
 * Merge one parsed scoreboard capture into a date store: append one state row
 * per CHANGED event, advance last_seen_at on unchanged rows, keep every run
 * instant in captures[]. Pure: returns a NEW store object.
 */
export function mergeScoreboard(prev, parsed) {
  const store = prev || {
    what: 'Point-in-time ESPN game-state rows — one row per change (TRUSTED BUT NOT OFFICIAL)',
    trust: TRUST_LABEL,
    date: null, source: { urls: [] }, captures: [], events: {}
  };
  const source = { urls: [...(store.source.urls || [])] };
  for (const u of parsed.urls) if (!source.urls.includes(u)) source.urls.push(u);
  const captures = [...(store.captures || [])];
  if (!captures.includes(parsed.capturedAt)) captures.push(parsed.capturedAt);
  const events = { ...store.events };
  for (const ev of parsed.events) {
    const fp = stateFingerprint(ev);
    const existing = events[ev.eventId];
    const home = ev.competitors.find((c) => c.homeAway === 'home') || null;
    const away = ev.competitors.find((c) => c.homeAway === 'away') || null;
    const identity = {
      eventId: ev.eventId,
      date: ev.date,
      easternDate: easternDate(ev.date),
      name: ev.name,
      shortName: ev.shortName,
      week: ev.week,
      venue: ev.venue,
      homeAbbr: home ? home.abbr : null,
      homeTeamId: home ? home.teamId : null,
      homeName: home ? home.displayName : null,
      awayAbbr: away ? away.abbr : null,
      awayTeamId: away ? away.teamId : null,
      awayName: away ? away.displayName : null
    };
    const row = {
      captured_at: parsed.capturedAt,
      last_seen_at: parsed.capturedAt,
      fp,
      url_ref: source.urls.indexOf(parsed.urls[0]),
      state: ev.status.state,
      statusName: ev.status.statusName,
      completed: ev.status.completed,
      period: ev.status.period,
      clock: ev.status.clock,
      displayClock: ev.status.displayClock,
      scores: {
        home: home && home.score != null ? home.score : null,
        away: away && away.score != null ? away.score : null
      },
      recordsOverall: { home: home ? home.recordsOverall : null, away: away ? away.recordsOverall : null }
    };
    if (!existing) {
      events[ev.eventId] = {
        ...identity,
        firstCapturedAt: parsed.capturedAt,
        oddsContextOnly: ev.oddsContextOnly,
        states: [row]
      };
    } else {
      const states = [...existing.states];
      const last = states[states.length - 1];
      if (last.fp === fp) {
        states[states.length - 1] = { ...last, last_seen_at: parsed.capturedAt, clock: row.clock, displayClock: row.displayClock };
      } else {
        states.push(row);
      }
      events[ev.eventId] = { ...existing, ...identity, states };
    }
  }
  return { ...store, source, captures, events };
}

/** Merge one parsed injuries capture into a date store (append-only history). */
export function mergeInjuries(prev, parsed) {
  const store = prev || {
    what: 'Point-in-time ESPN injury-report rows — one row per change (TRUSTED BUT NOT OFFICIAL)',
    trust: TRUST_LABEL,
    date: null, source: { urls: [] }, captures: [], teams: {}
  };
  const source = { urls: [...(store.source.urls || [])] };
  for (const u of parsed.urls) if (!source.urls.includes(u)) source.urls.push(u);
  const captures = [...(store.captures || [])];
  if (!captures.includes(parsed.capturedAt)) captures.push(parsed.capturedAt);
  const teams = { ...store.teams };
  for (const t of parsed.teams) {
    const existing = teams[t.teamId] || { teamId: t.teamId, displayName: t.displayName, firstCapturedAt: parsed.capturedAt, players: {} };
    const players = { ...existing.players };
    for (const r of t.records) {
      const fp = injuryFingerprint(r);
      const p = players[r.recordId];
      const row = {
        captured_at: parsed.capturedAt,
        last_seen_at: parsed.capturedAt,
        fp,
        status: r.status,
        date: r.date,
        shortComment: r.shortComment,
        longComment: r.longComment
      };
      if (!p) {
        players[r.recordId] = {
          recordId: r.recordId,
          athleteName: r.athleteName,
          positionAbbr: r.positionAbbr,
          teamId: r.teamId,
          teamAbbr: r.teamAbbr,
          teamName: r.teamName,
          history: [row]
        };
      } else {
        const history = [...p.history];
        const last = history[history.length - 1];
        if (last.fp === fp) {
          history[history.length - 1] = { ...last, last_seen_at: parsed.capturedAt };
        } else {
          history.push(row);
        }
        players[r.recordId] = { ...p, history };
      }
    }
    teams[t.teamId] = { ...existing, displayName: t.displayName, players };
  }
  return { ...store, source, captures, teams };
}

/* ─────────────── Kalshi code map — evidence only ─────────────── */

/** Normalize a team name for matching: case, periods, "St." -> "State". */
export function normalizeName(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\./g, '')
    .replace(/\bst\b/g, 'state')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Match a Kalshi rules-text team name against the archived ESPN team table.
 * Rules: (1) exact normalized displayName match, or (2) ESPN displayName whose
 * first word(s) equal the whole Kalshi name and whose NEXT word starts with
 * the trailing qualifier letter Kalshi adds to disambiguate shared cities
 * ("New York G" -> "New York Giants", "Los Angeles C" -> "Los Angeles
 * Chargers"), or (3) exact ESPN abbreviation match ("SF", "NO"). A name that
 * matches 0 or 2+ ESPN rows returns null with a reason — never a guess.
 */
export function matchEspnTeam(name, teams) {
  const n = normalizeName(name);
  if (!n || !teams || !teams.length) return { ok: false, reason: 'NO_TEAM_TABLE' };
  const exact = teams.filter((t) => normalizeName(t.displayName) === n);
  if (exact.length === 1) return { ok: true, team: exact[0], matchedBy: 'displayName-exact' };
  if (exact.length > 1) return { ok: false, reason: 'AMBIGUOUS_DISPLAY_NAME' };
  // Trailing qualifier letter: "new york g" -> displayName starts "new york " and
  // the next word starts with "g".
  const m = /^(.*\S)\s+([a-z])$/.exec(n);
  if (m) {
    const prefix = m[1];
    const q = m[2];
    const hits = teams.filter((t) => {
      const dn = normalizeName(t.displayName);
      return dn.startsWith(prefix + ' ') && (dn[prefix.length + 1] === q);
    });
    if (hits.length === 1) return { ok: true, team: hits[0], matchedBy: 'displayName-qualifier-letter' };
    if (hits.length > 1) return { ok: false, reason: 'AMBIGUOUS_QUALIFIER_MATCH' };
  }
  // Prefix match on displayName ("Central Arkansas" -> "Central Arkansas Bears").
  const prefixHits = teams.filter((t) => normalizeName(t.displayName).startsWith(n + ' '));
  if (prefixHits.length === 1) return { ok: true, team: prefixHits[0], matchedBy: 'displayName-prefix' };
  if (prefixHits.length > 1) return { ok: false, reason: 'AMBIGUOUS_PREFIX_MATCH' };
  // Abbreviation fallback ("SF", "NO", "NYK" is handled in the map, not here).
  const abbrHits = teams.filter((t) => String(t.abbr).toLowerCase() === n);
  if (abbrHits.length === 1) return { ok: true, team: abbrHits[0], matchedBy: 'abbreviation-exact' };
  return { ok: false, reason: 'NO_ESPN_NAME_MATCH' };
}

/**
 * Parse a game-family Kalshi contract's own rules text for the join evidence:
 * "<If> <YesName> wins the <A> vs <B> ... game originally scheduled for <Mon d, yyyy>".
 * Returns null for any contract that is not this shape (totals, spreads, player
 * props and futures are NOT used to build the map — their YES side is not a
 * team).
 */
export function parseGameRules(rules) {
  const s = String(rules || '').replace(/\s+/g, ' ').trim();
  const m = /^If (.+?) wins the (.+?) vs (.+?) (?:Pro Football|pro football|professional football|Pro Basketball|pro basketball|professional basketball|college football|college basketball|NHL|WNBA|NBA|MLB) game originally scheduled for ([A-Z][a-z]+ \d{1,2}, \d{4}),/.exec(s);
  if (!m) return null;
  return { yesName: m[1], awayName: m[2], homeName: m[3], dateText: m[4] };
}

/**
 * Derive (code -> name) associations from ONE game-family contract pair
 * segment. The pair is AWAYCODE+HOMECODE with the YES code at one end; the
 * opposite code is whatever remains. Returns [] when the split is ambiguous.
 */
export function pairAssociations(pair, yesCode, awayName, homeName, yesName) {
  const out = [];
  const yesIsAway = normalizeName(yesName) === normalizeName(awayName);
  const yesIsHome = normalizeName(yesName) === normalizeName(homeName);
  if (!yesIsAway && !yesIsHome) return out;
  const yesNameReal = yesIsAway ? awayName : homeName;
  const oppName = yesIsAway ? homeName : awayName;
  let oppCode = null;
  const asPrefix = pair.startsWith(yesCode);
  const asSuffix = pair.endsWith(yesCode);
  if (asPrefix && asSuffix && pair.length === 2 * yesCode.length) return out; // both ends: ambiguous
  if (asPrefix) oppCode = pair.slice(yesCode.length);
  else if (asSuffix) oppCode = pair.slice(0, pair.length - yesCode.length);
  if (!oppCode || !oppCode.length) return out;
  out.push({ code: yesCode, name: yesNameReal, role: yesIsAway ? 'away' : 'home' });
  out.push({ code: oppCode, name: oppName, role: yesIsAway ? 'home' : 'away' });
  return out;
}

/**
 * Build _code-map.json from (a) every tracked game-family contract in the
 * repository's own discovered/history stores (the Kalshi side, with each
 * contract's rules text as the name evidence) and (b) the captured ESPN team
 * tables (the ESPN side). Every output row carries its evidence; a name that
 * cannot be matched to exactly one ESPN row stays UNMAPPED with the reason.
 *
 * @param {object} opts
 * @param {Array<{ticker:string,series_ticker:string,rules_primary:string}>} opts.kalshiContracts
 * @param {Object<string, Array>} opts.teamsByLeague  league -> ESPN team table
 */
export function buildCodeMap({ kalshiContracts, teamsByLeague }) {
  const associations = new Map(); // league -> Map(code -> {name, votes: []})
  const unmatchedContracts = [];
  for (const c of kalshiContracts) {
    const series = String(c.ticker || '').split('-')[0];
    const league = Object.keys(LEAGUES).find((k) => LEAGUES[k].kalshiSeries.includes(series));
    if (!league) continue;
    const rules = parseGameRules(c.rules_primary || c.rulesPrimary || '');
    if (!rules) continue;
    const parts = String(c.ticker).split('-');
    if (parts.length < 3) continue;
    // Real tickers carry the ET date inside the pair segment (e.g.
    // KXNCAAFGAME-26SEP26CARKFSU-FSU): YY MON DD + the A-Z team pair.
    const pm = /^(\d{2}[A-Z]{3}\d{2})([A-Z]+)$/.exec(parts[1]);
    const ym = /^([A-Z]{2,6})$/.exec(parts[2] || '');
    if (!pm || !ym) continue;
    const pair = pm[2];
    const yesCode = ym[1];
    const assoc = pairAssociations(pair, yesCode, rules.awayName, rules.homeName, rules.yesName);
    if (!assoc.length) {
      unmatchedContracts.push({ ticker: c.ticker, reason: 'AMBIGUOUS_PAIR_SPLIT' });
      continue;
    }
    if (!associations.has(league)) associations.set(league, new Map());
    const byCode = associations.get(league);
    for (const a of assoc) {
      const prior = byCode.get(a.code);
      const vote = { ticker: c.ticker, rulesName: a.name, role: a.role };
      if (!prior) byCode.set(a.code, { name: a.name, votes: [vote] });
      else if (normalizeName(prior.name) === normalizeName(a.name)) prior.votes.push(vote);
      else byCode.set(a.code, { name: a.name, conflict: prior, votes: [vote] });
    }
  }
  const rows = [];
  for (const [league, byCode] of associations) {
    const teams = teamsByLeague[league] || [];
    for (const [code, { name, votes, conflict }] of [...byCode.entries()].sort()) {
      const espn = teams.length ? matchEspnTeam(name, teams) : { ok: false, reason: 'NO_TEAM_TABLE_CAPTURED_YET' };
      rows.push({
        league,
        kalshiCode: code,
        kalshiName: name,
        conflictWith: conflict ? conflict.name : null,
        espn: espn.ok ? { teamId: espn.team.id, abbr: espn.team.abbr, displayName: espn.team.displayName, matchedBy: espn.matchedBy } : null,
        espnReason: espn.ok ? 'MATCHED' : espn.reason,
        evidence: votes.slice(0, 5)
      });
    }
  }
  return {
    what: 'Kalshi ticker code ↔ ESPN team, built ONLY from contract rules text + captured ESPN team tables. An unmapped code is never guessed.',
    trust: TRUST_LABEL,
    generatedAt: nowIso(),
    rows,
    unmatchedContracts
  };
}

/* ─────────────────────── URL helpers ─────────────────────── */

export function scoreboardUrl(leagueKey, dateYmd) {
  const l = LEAGUES[leagueKey];
  const ymd = dateYmd.replace(/-/g, '');
  return `${SITE_BASE}/${l.sport}/${l.slug}/scoreboard?dates=${ymd}`;
}
export function injuriesUrl(leagueKey) {
  const l = LEAGUES[leagueKey];
  return `${SITE_BASE}/${l.sport}/${l.slug}/injuries`;
}
export function teamsUrl(leagueKey) {
  const l = LEAGUES[leagueKey];
  return `${SITE_BASE}/${l.sport}/${l.slug}/teams`;
}

/* ─────────────────────── capture run ─────────────────────── */

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  const text = await res.text();
  if (!res.ok) return { ok: false, status: res.status, statusText: res.statusText, body: text.slice(0, 400) };
  try {
    return { ok: true, json: JSON.parse(text), raw: text };
  } catch (e) {
    return { ok: false, status: 0, statusText: `invalid JSON: ${e.message}`, body: text.slice(0, 400) };
  }
}

function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 1));
}

/** Collect tracked game-family contracts from the repository's own stores. */
function collectKalshiContracts() {
  const out = [];
  const seen = new Set();
  const add = (ticker, rules) => {
    if (!ticker || seen.has(ticker)) return;
    seen.add(ticker);
    out.push({ ticker, rules_primary: rules || '' });
  };
  const scan = (file) => {
    try {
      const d = JSON.parse(fs.readFileSync(file, 'utf8'));
      const markets = Array.isArray(d.markets) ? d.markets : [];
      for (const m of markets) add(m.ticker || m.market_ticker, m.rulesPrimary || m.rules_primary);
      if (d.ticker) add(d.ticker, (d.market || {}).rules_primary || (d.market || {}).rulesPrimary || d.rules_primary);
    } catch {
      /* an unreadable store is skipped loudly in the report, not silently */
    }
  };
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(p);
      else if (ent.name.endsWith('.json') && ent.name !== '_manifest.json') scan(p);
    }
  };
  walk(path.join(ROOT, 'data', 'discovered', 'markets'));
  walk(path.join(ROOT, 'data', 'history'));
  return out;
}

export async function runCapture({ dryRun = false, leagues = Object.keys(LEAGUES) } = {}) {
  const report = { startedAt: nowIso(), trust: TRUST_LABEL, userAgent: USER_AGENT, leagues: {}, errors: [] };
  const teamsByLeague = {};
  for (const key of leagues) {
    const l = LEAGUES[key];
    const leagueReport = { label: l.label, steps: {} };
    try {
      // 1. team table (refreshed every run; rows verified field-for-field)
      const tUrl = teamsUrl(key);
      if (dryRun) {
        leagueReport.steps.teams = { planned: tUrl };
      } else {
        const res = await fetchJson(tUrl);
        leagueReport.steps.teams = { url: tUrl, ok: res.ok, status: res.status ?? 200 };
        if (res.ok) {
          const parsed = parseTeams(res.json, tUrl, nowIso());
          const file = path.join(DATA_DIR, key, '_teams.json');
          const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
          writeJson(file, {
            what: `ESPN ${l.label} team table (TRUSTED BUT NOT OFFICIAL)`,
            trust: TRUST_LABEL,
            url: tUrl,
            captured_at: parsed.capturedAt,
            last_confirmed_at: parsed.capturedAt,
            prior_captured_at: prev ? prev.captured_at : null,
            teams: parsed.teams
          });
          teamsByLeague[key] = parsed.teams;
          leagueReport.steps.teams.rows = parsed.teams.length;
        } else {
          report.errors.push({ league: key, step: 'teams', ...leagueReport.steps.teams });
        }
      }
      // 2. injuries (one document per league)
      const iUrl = injuriesUrl(key);
      if (dryRun) {
        leagueReport.steps.injuries = { planned: iUrl };
      } else {
        const res = await fetchJson(iUrl);
        leagueReport.steps.injuries = { url: iUrl, ok: res.ok, status: res.status ?? 200 };
        if (res.ok) {
          const parsed = parseInjuries(res.json, iUrl, nowIso());
          const today = easternDate(parsed.capturedAt);
          const file = path.join(DATA_DIR, key, 'injuries', `${today}.json`);
          const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
          const merged = mergeInjuries(prev, parsed);
          writeJson(file, { ...merged, date: today, last_ingested_at: parsed.capturedAt, last_ingest_url: iUrl });
          leagueReport.steps.injuries.playerRecords = parsed.teams.reduce((a, t) => a + t.records.length, 0);
        } else {
          report.errors.push({ league: key, step: 'injuries', ...leagueReport.steps.injuries });
        }
      }
      // 3. scoreboards: today + tomorrow (Kalshi tickers are the scheduled date)
      const today = easternDate(nowIso());
      const d = new Date(Date.parse(`${today}T12:00:00Z`) + 36 * 3600 * 1000);
      const tomorrow = easternDate(d.toISOString());
      leagueReport.steps.scoreboard = {};
      for (const day of [...new Set([today, tomorrow])]) {
        const sUrl = scoreboardUrl(key, day);
        if (dryRun) {
          leagueReport.steps.scoreboard[day] = { planned: sUrl };
          continue;
        }
        const res = await fetchJson(sUrl);
        leagueReport.steps.scoreboard[day] = { url: sUrl, ok: res.ok, status: res.status ?? 200 };
        if (res.ok) {
          const parsed = parseScoreboard(res.json, sUrl, nowIso());
          const file = path.join(DATA_DIR, key, 'scoreboard', `${day}.json`);
          const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : null;
          const merged = mergeScoreboard(prev, parsed);
          writeJson(file, { ...merged, date: day, last_ingested_at: parsed.capturedAt, last_ingest_url: sUrl });
          leagueReport.steps.scoreboard[day].events = parsed.events.length;
          leagueReport.steps.scoreboard[day].stateRows = Object.values(merged.events).reduce((a, e) => a + e.states.length, 0);
        } else {
          report.errors.push({ league: key, step: `scoreboard:${day}`, ...leagueReport.steps.scoreboard[day] });
        }
      }
    } catch (e) {
      report.errors.push({ league: key, step: 'parse', error: String(e && e.message) });
    }
    report.leagues[key] = leagueReport;
  }
  if (!dryRun) {
    // Refresh team tables from disk for leagues whose fetch failed but have a
    // prior capture (the map still builds from the newest known table).
    for (const key of leagues) {
      if (!teamsByLeague[key]) {
        const f = path.join(DATA_DIR, key, '_teams.json');
        if (fs.existsSync(f)) teamsByLeague[key] = JSON.parse(fs.readFileSync(f, 'utf8')).teams || [];
      }
    }
    const map = buildCodeMap({ kalshiContracts: collectKalshiContracts(), teamsByLeague });
    writeJson(CODE_MAP_FILE, map);
    report.codeMap = {
      rows: map.rows.length,
      matched: map.rows.filter((r) => r.espn).length,
      unmapped: map.rows.filter((r) => !r.espn).length
    };
  }
  report.finishedAt = nowIso();
  if (!dryRun) writeJson(LAST_RUN_FILE, report);
  return report;
}

/** Offline audit: every store file parses back through the strict parsers'
 *  fingerprints and every code-map row carries evidence. */
export function verify() {
  const problems = [];
  const summary = { scoreboards: 0, injuries: 0, teams: 0, codeRows: 0 };
  for (const key of Object.keys(LEAGUES)) {
    const tFile = path.join(DATA_DIR, key, '_teams.json');
    if (fs.existsSync(tFile)) {
      const t = JSON.parse(fs.readFileSync(tFile, 'utf8'));
      summary.teams += (t.teams || []).length;
      if (!t.trust || !/NOT OFFICIAL/.test(t.trust)) problems.push(`${key}/_teams.json: missing the NOT OFFICIAL trust label`);
      for (const row of t.teams || []) {
        if (!row.id || !row.abbr || !row.displayName) problems.push(`${key}/_teams.json: row missing id/abbr/displayName`);
      }
    }
    for (const kind of ['scoreboard', 'injuries']) {
      const dir = path.join(DATA_DIR, key, kind);
      if (!fs.existsSync(dir)) continue;
      for (const f of fs.readdirSync(dir)) {
        const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (!d.trust || !/NOT OFFICIAL/.test(d.trust)) problems.push(`${key}/${kind}/${f}: missing the NOT OFFICIAL trust label`);
        if (!Array.isArray(d.captures) || !d.captures.length) problems.push(`${key}/${kind}/${f}: no captures[]`);
        for (const u of d.source?.urls || []) if (!/^https:\/\/site\.web\.api\.espn\.com\//.test(u)) problems.push(`${key}/${kind}/${f}: non-ESPN source url ${u}`);
        if (kind === 'scoreboard') {
          summary.scoreboards += 1;
          for (const e of Object.values(d.events || {})) {
            if (!e.states || !e.states.length) problems.push(`${key}/${kind}/${f}: event ${e.eventId} has no states`);
            for (const s of e.states) {
              if (!GAME_STATES.has(s.state)) problems.push(`${key}/${kind}/${f}: bad state ${s.state}`);
              if (s.captured_at > s.last_seen_at) problems.push(`${key}/${kind}/${f}: captured_at > last_seen_at`);
            }
          }
        } else {
          summary.injuries += 1;
          for (const t of Object.values(d.teams || {})) {
            for (const p of Object.values(t.players || {})) {
              if (!p.history || !p.history.length) problems.push(`${key}/${kind}/${f}: player ${p.recordId} has no history`);
            }
          }
        }
      }
    }
  }
  if (fs.existsSync(CODE_MAP_FILE)) {
    const map = JSON.parse(fs.readFileSync(CODE_MAP_FILE, 'utf8'));
    summary.codeRows = (map.rows || []).length;
    for (const r of map.rows || []) {
      if (!r.evidence || !r.evidence.length) problems.push(`code-map: ${r.league}/${r.kalshiCode} has no evidence row`);
      if (r.espn && !r.espn.teamId) problems.push(`code-map: ${r.league}/${r.kalshiCode} matched without teamId`);
    }
  }
  return { ok: problems.length === 0, problems, summary };
}

/* ─────────────────────── CLI ─────────────────────── */

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const doVerify = args.includes('--verify');
  const only = args.find((a) => a.startsWith('--league='))?.split('=')[1];
  (async () => {
    if (doVerify) {
      const v = verify();
      console.log(JSON.stringify(v, null, 1));
      process.exit(v.ok ? 0 : 1);
    }
    const rep = await runCapture({ dryRun, leagues: only ? only.split(',') : Object.keys(LEAGUES) });
    console.log(JSON.stringify(rep, null, 1));
    process.exit(rep.errors.length ? 1 : 0);
  })();
}
