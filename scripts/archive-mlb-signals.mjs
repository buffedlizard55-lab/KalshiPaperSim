#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time MLB Game-State Archive (official MLB Stats API)
 * =====================================================================
 * ROADMAP "Next #3" — the SPORTS half of the point-in-time signal archive
 * (the FDA half shipped 2026-09-19). This is the first sports feed, closed
 * with an OFFICIAL, keyless, machine-readable source — the same one the
 * owner's MLB-PBP / MLB-Live-PBP projects (signal ledger S09 / S15) verify
 * against — instead of a screen-scrape or a third-party scoreboard.
 *
 * WHY THIS EXISTS
 *   KXMLBGAME contracts ("<Team> wins") reprice all game long. An in-play
 *   strategy can only be tested honestly if the GAME STATE IT READS is the one
 *   that was observable at decision time. Re-reading a finished game's box
 *   score for a past bar is a lookahead — the schedule feed is re-read, not
 *   re-run. So this job captures the official live linescore many times a day
 *   and appends every CHANGE, time-stamped, to a store the replay can query
 *   point-in-time (src/mlb-signal-store.js enforces the rule).
 *
 * THE SOURCE (official, free, no key)
 *   GET https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=..&endDate=..
 *       &hydrate=linescore,probablePitcher,team&fields=...
 *   — MLB Advanced Media's Stats API: schedule + per-game status
 *   (status.abstractGameState Preview|Live|Final, detailedState), linescore
 *   (currentInning, inningState, teams.home/away.runs), team objects with the
 *   official `abbreviation`, and probable pitchers. Every response carries
 *   MLBAM's copyright notice, which is archived VERBATIM in each store file
 *   (the owner's MLB-PBP project keeps the same notice with every record).
 *   GET https://statsapi.mlb.com/api/v1/teams?sportId=1&season=<yyyy>
 *   — the 30 official team abbreviations (archived as data/mlb-signals/_teams.json).
 *   Response shape verified by hand on 2026-09-20 (VERIFICATION.md V111–V113):
 *   the `fields` filter returns exactly the named keys at any depth; the
 *   parser below fails loudly on a missing key rather than guessing.
 *
 * HOW A KALSHI CONTRACT IS JOINED TO A GAME (evidence, not assumption)
 *   KXMLBGAME tickers read KXMLBGAME-<yyMONdd><HHMM><AWAY><HOME>-<YESTEAM>:
 *   the date+time is the scheduled first pitch in US Eastern time and the
 *   team codes are the official MLB abbreviations. Verified on all 9 finalized
 *   KXMLBGAME contracts in the store (6 distinct games, 2026-09-13 → 09-17):
 *   each ticker's ET instant equals the official gameDate, AWAY/HOME match the
 *   official away/home, and the exchange's result equals the official
 *   isWinner (fact V113). src/mlb-signal-store.js requires ALL THREE to agree
 *   before it returns a game for a ticker; anything else is UNMATCHED (no trade).
 *
 * WHAT IS ARCHIVED (data/mlb-signals/games/<officialDate>.json)
 *   {
 *     date, what,
 *     source: { endpoint, copyright, terms, urls: [every distinct request URL] },
 *     captures: [ISO, ...],                 // every run instant that read this date
 *     games: { <gamePk>: {
 *        gamePk, gameDate (UTC), officialDate, gameType, doubleHeader, gameNumber,
 *        away: { id, abbreviation, name }, home: {...}, venue,
 *        probablePitchers: { away, home },   // newest seen
 *        firstCapturedAt,
 *        states: [ { captured_at, last_seen_at, url_ref (index into source.urls),
 *                    abstractGameState, detailedState, codedGameState,
 *                    inning, inningState, runs: { away, home },
 *                    winner: 'away'|'home'|null } ... ]   // one row per CHANGE
 *     } }
 *   }
 *   A state row is appended only when the fingerprint (status, inning,
 *   inningState, runs, winner) differs from the previous row; otherwise the
 *   previous row's `last_seen_at` advances. The `captures[]` list keeps every
 *   run instant, so "how stale was the newest observation at time T" is
 *   answerable without storing an unchanged row per run.
 *
 * POINT-IN-TIME RULE (enforced by src/mlb-signal-store.js)
 *   The state knowable at time T is the newest row with captured_at <= T, and
 *   the freshest observation instant is the newest captures[] entry <= T.
 *   `last_seen_at` is NEVER used for a past decision (it is updated by later
 *   runs). No row => null => the strategy abstains.
 *
 * BASIS, STATED UP FRONT
 *   The market resolves on the game's official result; this archive holds the
 *   official live linescore, captured at a cadence of minutes. The lag between
 *   a run scoring and this archive seeing it is real, measurable from the
 *   timestamps, and priced by the strategy (entry only below a price cap) —
 *   never netted out of the numbers.
 *
 * USAGE
 *   node scripts/archive-mlb-signals.mjs             # capture now, append store
 *   node scripts/archive-mlb-signals.mjs --verify    # offline audit of the store
 *   node scripts/archive-mlb-signals.mjs --dry-run   # no network, print the plan
 *
 * NOTE ON THE SANDBOX: statsapi.mlb.com is not reachable from the build
 * container (only github.com egress works there). This script runs from the
 * GitHub-hosted workflow (.github/workflows/mlb-signals.yml).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'mlb-signals');
const GAMES_DIR = path.join(DATA_DIR, 'games');
const TEAMS_FILE = path.join(DATA_DIR, '_teams.json');
const LAST_RUN_FILE = path.join(DATA_DIR, '_mlb-last-run.json');
const SCHEDULE_ENDPOINT = 'https://statsapi.mlb.com/api/v1/schedule';
const TEAMS_ENDPOINT = 'https://statsapi.mlb.com/api/v1/teams';
const TERMS_URL = 'http://gdx.mlb.com/components/copyright.txt';
const USER_AGENT = 'KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim)';
/** MLB's own "sportId=1" is Major League Baseball. */
const SPORT_ID = 1;
/**
 * The `fields` filter keeps the response to what the archive stores. Each key
 * was verified present in the live response on 2026-09-20 (V111); the parser
 * refuses a game that lacks a required key, so a silently dropped field cannot
 * become a silently wrong archive.
 */
const SCHEDULE_FIELDS = [
  'dates', 'date', 'games', 'gamePk', 'gameDate', 'officialDate', 'gameType', 'doubleHeader', 'gameNumber',
  'status', 'abstractGameState', 'detailedState', 'codedGameState', 'statusCode',
  'teams', 'away', 'home', 'team', 'id', 'abbreviation', 'name', 'score', 'isWinner',
  'probablePitcher', 'fullName',
  'linescore', 'currentInning', 'currentInningOrdinal', 'inningState', 'inningHalf', 'isTopInning', 'scheduledInnings', 'runs',
  'venue', 'copyright'
].join(',');
const ABSTRACT_STATES = ['Preview', 'Live', 'Final'];
/** Bound per-date files: a game rarely changes state more than ~60 times. */
const MAX_STATES_PER_GAME = 400;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * MLB's `officialDate` is the US-Eastern calendar day (a 01:40Z first pitch
 * belongs to the previous ET date). The capture therefore asks for the ET
 * date of "now minus one day" through the ET date of "now", which covers a
 * late West-Coast game that runs past midnight ET as well as today's slate.
 */
export function easternDate(d = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(d); // en-CA yields YYYY-MM-DD
}

export function captureWindow(now = new Date()) {
  const end = easternDate(now);
  const start = easternDate(new Date(now.getTime() - 24 * 3600 * 1000));
  return { startDate: start, endDate: end };
}

export function scheduleUrl({ startDate, endDate }) {
  const p = new URLSearchParams({ sportId: String(SPORT_ID), startDate, endDate, hydrate: 'linescore,probablePitcher,team', fields: SCHEDULE_FIELDS });
  return `${SCHEDULE_ENDPOINT}?${p.toString()}`;
}

export function teamsUrl(season) {
  const p = new URLSearchParams({ sportId: String(SPORT_ID), season: String(season), fields: 'teams,id,name,abbreviation,teamName,locationName,shortName,franchiseName,clubName,copyright' });
  return `${TEAMS_ENDPOINT}?${p.toString()}`;
}

function need(obj, key, where) {
  if (!obj || typeof obj !== 'object' || !(key in obj)) throw new Error(`${where}: required key "${key}" missing — response shape changed?`);
  return obj[key];
}

function optNum(v) {
  return Number.isFinite(Number(v)) && v !== null && v !== undefined && v !== '' ? Number(v) : null;
}

/**
 * STRICT PARSER for one schedule game. Refuses a game that lacks the keys the
 * archive relies on (id, abbreviation, status, gameDate), and derives the
 * compact state row. `winner` comes from the official isWinner flags only
 * when the game is Final; it is never inferred from the score.
 */
export function parseGame(g, url, capturedAt) {
  const gamePk = need(g, 'gamePk', 'game');
  const status = need(g, 'status', `game ${gamePk}`);
  const abstractGameState = need(status, 'abstractGameState', `game ${gamePk}.status`);
  if (!ABSTRACT_STATES.includes(abstractGameState)) throw new Error(`game ${gamePk}: unknown abstractGameState "${abstractGameState}"`);
  const teams = need(g, 'teams', `game ${gamePk}`);
  const side = (k) => {
    const t = need(teams, k, `game ${gamePk}.teams`);
    const team = need(t, 'team', `game ${gamePk}.teams.${k}`);
    return {
      meta: {
        id: need(team, 'id', `game ${gamePk}.teams.${k}.team`),
        abbreviation: String(need(team, 'abbreviation', `game ${gamePk}.teams.${k}.team`)),
        name: team.name ?? null
      },
      score: optNum(t.score),
      isWinner: typeof t.isWinner === 'boolean' ? t.isWinner : null,
      probablePitcher: t.probablePitcher && t.probablePitcher.id ? { id: t.probablePitcher.id, fullName: t.probablePitcher.fullName ?? null } : null
    };
  };
  const away = side('away');
  const home = side('home');
  const ls = g.linescore || {};
  const lsTeams = ls.teams || {};
  const runsAway = optNum(lsTeams.away && lsTeams.away.runs);
  const runsHome = optNum(lsTeams.home && lsTeams.home.runs);
  let winner = null;
  if (abstractGameState === 'Final') {
    if (away.isWinner === true && home.isWinner !== true) winner = 'away';
    else if (home.isWinner === true && away.isWinner !== true) winner = 'home';
  }
  return {
    meta: {
      gamePk,
      gameDate: String(need(g, 'gameDate', `game ${gamePk}`)),
      officialDate: String(need(g, 'officialDate', `game ${gamePk}`)),
      gameType: g.gameType ?? null,
      doubleHeader: g.doubleHeader ?? null,
      gameNumber: optNum(g.gameNumber),
      away: away.meta,
      home: home.meta,
      venue: g.venue && g.venue.name ? g.venue.name : null,
      probablePitchers: { away: away.probablePitcher, home: home.probablePitcher }
    },
    state: {
      captured_at: capturedAt,
      last_seen_at: capturedAt,
      url, // replaced by url_ref (index into the date file's source.urls) when stored
      abstractGameState,
      detailedState: status.detailedState ?? null,
      codedGameState: status.codedGameState ?? null,
      inning: optNum(ls.currentInning),
      inningState: ls.inningState ?? null,
      // The schedule's per-team `score` and the linescore `runs` are the same
      // number in every verified response; the linescore is the documented
      // in-play field, the score is kept as the fallback for a Final without
      // a linescore (a postponed/forfeited game).
      runs: { away: runsAway !== null ? runsAway : away.score, home: runsHome !== null ? runsHome : home.score },
      winner
    }
  };
}

/** The change fingerprint: what a strategy would react to. */
export function stateFingerprint(s) {
  return [s.abstractGameState, s.detailedState, s.inning, s.inningState, s.runs && s.runs.away, s.runs && s.runs.home, s.winner].map((v) => (v === null || v === undefined ? '' : String(v))).join('|');
}

/** Strict parser for the whole schedule response. */
export function parseSchedule(json, url, capturedAt) {
  if (!json || typeof json !== 'object') throw new Error('schedule response is not a JSON object');
  const copyright = typeof json.copyright === 'string' ? json.copyright : null;
  const dates = Array.isArray(json.dates) ? json.dates : [];
  const byDate = new Map();
  for (const d of dates) {
    const date = need(d, 'date', 'dates[]');
    const games = Array.isArray(d.games) ? d.games : [];
    const parsed = games.map((g) => parseGame(g, url, capturedAt));
    byDate.set(String(date), parsed);
  }
  return { copyright, byDate };
}

async function fetchJson(url, what) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    } catch (err) {
      const cause = err && err.cause ? ` (cause=${err.cause.code || err.cause.message || err.cause})` : '';
      lastError = `network: ${err && err.message ? err.message : String(err)}${cause}`;
      if (attempt < 3) {
        await sleep(10_000 * attempt);
        continue;
      }
      throw new Error(`${what}: ${lastError}`);
    }
    const text = await res.text();
    if (!res.ok) {
      lastError = `HTTP ${res.status} — body head: ${text.slice(0, 200)}`;
      if ((res.status === 429 || res.status >= 500) && attempt < 3) {
        await sleep(10_000 * attempt);
        continue;
      }
      throw new Error(`${what}: ${lastError}`);
    }
    try {
      return { json: JSON.parse(text), http_status: res.status };
    } catch {
      throw new Error(`${what}: HTTP ${res.status} with a non-JSON body (first 200 chars: ${text.slice(0, 200)})`);
    }
  }
  throw new Error(`${what}: exhausted retries — ${lastError}`);
}

function gamesFile(date) {
  return path.join(GAMES_DIR, `${date}.json`);
}

/**
 * Append one capture of one date into its store file. Pure on its inputs so
 * the unit tests can exercise the change-collapsing without a network.
 * @returns {{store: object, appended: number, seen: number}}
 */
export function mergeCapture(store, { date, games, url, capturedAt, copyright }) {
  const out = store && typeof store === 'object' && store.games ? store : {
    date,
    what:
      'Point-in-time official MLB game state for this US-Eastern calendar date: one state row per CHANGE of (status, inning, inning state, runs, winner), each with the capture instant it was first seen; captures[] lists every run that read this date so staleness at any past time is measurable. Team codes are the official MLB abbreviations. Read only through src/mlb-signal-store.js (no row after the decision time is ever returned).',
    source: { endpoint: SCHEDULE_ENDPOINT, copyright: copyright || null, terms: TERMS_URL, urls: [] },
    captures: [],
    games: {}
  };
  if (copyright && !out.source.copyright) out.source.copyright = copyright;
  if (!Array.isArray(out.source.urls)) out.source.urls = [];
  // One copy of each distinct request URL per date file; rows point at it by
  // index (a 550-character URL repeated on every state row would be most of
  // the store's bytes while carrying no extra provenance).
  let urlRef = out.source.urls.indexOf(url);
  if (urlRef < 0) {
    out.source.urls.push(url);
    urlRef = out.source.urls.length - 1;
  }
  if (!out.captures.includes(capturedAt)) out.captures.push(capturedAt);
  let appended = 0;
  for (const { meta, state: raw } of games) {
    const { url: _url, ...rest } = raw;
    const state = { ...rest, url_ref: urlRef };
    const key = String(meta.gamePk);
    const g = out.games[key] || { ...meta, firstCapturedAt: capturedAt, states: [] };
    // Static facts are re-asserted from the newest response (a probable
    // pitcher is announced late; a venue never changes).
    g.probablePitchers = meta.probablePitchers;
    g.gameDate = meta.gameDate;
    g.officialDate = meta.officialDate;
    const prior = g.states[g.states.length - 1] || null;
    if (prior && stateFingerprint(prior) === stateFingerprint(state)) {
      prior.last_seen_at = capturedAt;
    } else {
      g.states.push(state);
      appended += 1;
      if (g.states.length > MAX_STATES_PER_GAME) {
        g.trims = g.trims || [];
        g.trims.push({ at: capturedAt, droppedOldest: g.states.length - MAX_STATES_PER_GAME });
        g.states = g.states.slice(-MAX_STATES_PER_GAME);
      }
    }
    out.games[key] = g;
  }
  return { store: out, appended, seen: games.length };
}

function writeStore(date, store) {
  fs.mkdirSync(GAMES_DIR, { recursive: true });
  fs.writeFileSync(gamesFile(date), `${JSON.stringify(store, null, 1)}\n`);
}

/** Offline audit of the store: order, vocabulary, provenance. */
export function verify({ log = console.log, error = console.error, dir = GAMES_DIR } = {}) {
  if (!fs.existsSync(dir)) {
    log('verify: no data/mlb-signals/games directory yet — nothing to audit (the first scheduled run creates it).');
    return 0;
  }
  let files = 0;
  let games = 0;
  let rows = 0;
  let problems = 0;
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue;
    const store = readJsonSafe(path.join(dir, file));
    if (!store || !store.games || !Array.isArray(store.captures)) {
      error(`verify: ${file} is not a readable store — FAIL`);
      problems += 1;
      continue;
    }
    files += 1;
    if (!store.source || store.source.endpoint !== SCHEDULE_ENDPOINT) {
      error(`verify: ${file} does not name the official endpoint — FAIL`);
      problems += 1;
    }
    let lastCapture = null;
    for (const c of store.captures) {
      const t = Date.parse(c);
      if (!Number.isFinite(t) || (lastCapture !== null && t < lastCapture)) {
        error(`verify: ${file} captures[] not a valid time-ordered list at ${c} — FAIL`);
        problems += 1;
      }
      lastCapture = t;
    }
    for (const [key, g] of Object.entries(store.games)) {
      games += 1;
      if (String(g.gamePk) !== key || !g.away?.abbreviation || !g.home?.abbreviation || !Number.isFinite(Date.parse(g.gameDate))) {
        error(`verify: ${file} game ${key} lacks identity (gamePk / team codes / gameDate) — FAIL`);
        problems += 1;
      }
      let last = null;
      for (const s of g.states || []) {
        rows += 1;
        const t = Date.parse(s.captured_at);
        if (!Number.isFinite(t)) {
          error(`verify: ${file} game ${key} state without a valid captured_at — FAIL`);
          problems += 1;
        }
        if (last !== null && t < last) {
          error(`verify: ${file} game ${key} states not in time order at ${s.captured_at} — FAIL`);
          problems += 1;
        }
        last = t;
        if (!ABSTRACT_STATES.includes(s.abstractGameState)) {
          error(`verify: ${file} game ${key} state ${s.captured_at} has unknown abstractGameState "${s.abstractGameState}" — FAIL`);
          problems += 1;
        }
        const refUrl = store.source && Array.isArray(store.source.urls) ? store.source.urls[s.url_ref] : null;
        if (!refUrl || !refUrl.startsWith(SCHEDULE_ENDPOINT)) {
          error(`verify: ${file} game ${key} state ${s.captured_at} does not reference an official request URL — FAIL`);
          problems += 1;
        }
        if (Date.parse(s.last_seen_at) < t) {
          error(`verify: ${file} game ${key} state ${s.captured_at} last_seen_at precedes captured_at — FAIL`);
          problems += 1;
        }
        if (s.winner && s.abstractGameState !== 'Final') {
          error(`verify: ${file} game ${key} state ${s.captured_at} names a winner before Final — FAIL`);
          problems += 1;
        }
      }
    }
    log(`verify: ${file} — ${Object.keys(store.games).length} game(s), ${store.captures.length} capture(s)`);
  }
  log(`verify: ${files} date file(s), ${games} game(s), ${rows} state row(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--verify')) return verify();
  const window = captureWindow(new Date());
  if (args.includes('--dry-run')) {
    console.log(`dry-run: would GET ${scheduleUrl(window)}`);
    console.log(`dry-run: would GET ${teamsUrl(new Date().getUTCFullYear())}`);
    console.log(`dry-run: appends to ${path.relative(ROOT, GAMES_DIR)}/<officialDate>.json (one row per state CHANGE) and writes ${path.relative(ROOT, TEAMS_FILE)}.`);
    return 0;
  }

  const lastRun = { startedAt: new Date().toISOString(), finishedAt: null, window, requests: [], dates: [], failures: 0, workflow: '.github/workflows/mlb-signals.yml' };
  let failures = 0;

  // 1. The official team table (30 abbreviations) — reference data for the
  //    ticker join, re-captured every run and overwritten only when it changes.
  try {
    const season = Number(window.endDate.slice(0, 4));
    const url = teamsUrl(season);
    const { json, http_status } = await fetchJson(url, 'teams');
    const teams = (Array.isArray(json.teams) ? json.teams : []).map((t) => ({
      id: need(t, 'id', 'teams[]'), abbreviation: String(need(t, 'abbreviation', 'teams[]')), name: t.name ?? null, teamName: t.teamName ?? null,
      locationName: t.locationName ?? null, shortName: t.shortName ?? null, franchiseName: t.franchiseName ?? null, clubName: t.clubName ?? null
    })).sort((a, b) => a.id - b.id);
    if (teams.length !== 30) throw new Error(`teams: expected 30 MLB clubs, got ${teams.length}`);
    lastRun.requests.push({ url, http_status, teams: teams.length });
    const prior = readJsonSafe(TEAMS_FILE);
    const capturedAt = new Date().toISOString();
    const same = prior && JSON.stringify(prior.teams) === JSON.stringify(teams);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(TEAMS_FILE, `${JSON.stringify({
      what: 'The 30 official MLB team abbreviations (statsapi.mlb.com/api/v1/teams?sportId=1). KXMLBGAME tickers use these exact codes (fact V113); the join in src/mlb-signal-store.js is refused for any code not in this table.',
      url, season, captured_at: same ? prior.captured_at : capturedAt, last_confirmed_at: capturedAt,
      copyright: typeof json.copyright === 'string' ? json.copyright : null, teams
    }, null, 1)}\n`);
    console.log(`teams: ${teams.length} official clubs${same ? ' (unchanged)' : ' (table updated)'}`);
  } catch (err) {
    failures += 1;
    lastRun.requests.push({ url: teamsUrl(Number(window.endDate.slice(0, 4))), error: String(err && err.message ? err.message : err).slice(0, 500) });
    console.error(`✗ ${err.message}`);
  }

  // 2. The schedule window (yesterday ET → today ET), one request.
  try {
    const url = scheduleUrl(window);
    const capturedAt = new Date().toISOString();
    const { json, http_status } = await fetchJson(url, 'schedule');
    const { copyright, byDate } = parseSchedule(json, url, capturedAt);
    lastRun.requests.push({ url, http_status, dates: [...byDate.keys()], games: [...byDate.values()].reduce((a, g) => a + g.length, 0) });
    for (const [date, games] of byDate) {
      const existing = readJsonSafe(gamesFile(date));
      const { store, appended, seen } = mergeCapture(existing, { date, games, url, capturedAt, copyright });
      writeStore(date, store);
      const live = games.filter((g) => g.state.abstractGameState === 'Live').length;
      const final = games.filter((g) => g.state.abstractGameState === 'Final').length;
      lastRun.dates.push({ date, games: seen, live, final, appendedStateRows: appended });
      console.log(`${date}: ${seen} game(s) — ${live} live, ${final} final, ${seen - live - final} preview — ${appended} state row(s) appended`);
    }
    if (byDate.size === 0) console.log(`schedule: no games listed for ${window.startDate}..${window.endDate} (off-day) — captures[] not extended`);
  } catch (err) {
    failures += 1;
    lastRun.requests.push({ url: scheduleUrl(window), error: String(err && err.message ? err.message : err).slice(0, 500) });
    console.error(`✗ ${err.message}`);
  }

  lastRun.finishedAt = new Date().toISOString();
  lastRun.failures = failures;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(LAST_RUN_FILE, `${JSON.stringify(lastRun, null, 2)}\n`);
  } catch (err) {
    console.error(`could not write the run report: ${err.message}`);
  }
  if (failures > 0) {
    console.error(`${failures} request(s) failed — the store keeps whatever succeeded; the next scheduled run re-reads the same window.`);
    return 1;
  }
  return 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then((code) => process.exit(code))
    .catch((err) => {
      console.error(err && err.stack ? err.stack : err);
      process.exit(1);
    });
}

export { SCHEDULE_ENDPOINT, TEAMS_ENDPOINT, TERMS_URL, SCHEDULE_FIELDS, ABSTRACT_STATES, MAX_STATES_PER_GAME };
