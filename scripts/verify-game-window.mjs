#!/usr/bin/env node
/**
 * scripts/verify-game-window.mjs — the OFFLINE game-window audit.
 *
 * ROADMAP "Next #1" asked for a check of the first game-window captures: did a
 * `with_books` run ever store a NON-EMPTY order book for a game-series contract
 * WHILE THE GAME WAS BEING PLAYED? Irregularity #60 records that every game
 * ladder stored before 2026-09-21 was captured after settlement, where the
 * official API returns an empty book — so the desk's in-play game reserves
 * (KXMLBGAME 6 slots, KXNFLGAME 4, KXNHLGAME 4 …) all kept 0.
 *
 * This script answers that question from the committed tree alone. NO NETWORK.
 * It reads:
 *   data/history/**            every stored ladder + each contract's own market object
 *   data/mlb-signals/**        the OFFICIAL MLB archive (statsapi.mlb.com) via src/mlb-signal-store.js
 *   data/espn-signals/**       the ESPN archive (TRUSTED BUT NOT OFFICIAL) via src/espn-signal-store.js
 *   src/desk-data.js           the desk module, to explain each per-series reserve by name
 * and writes:
 *   data/reports/game-window-captures.json          canonical, pretty-printed for review
 *   docs/data/reports/game-window-captures.json     compact copy the GitHub Pages site links
 *
 * ---------------------------------------------------------------------------
 * THE TWO RULES THAT MAKE THIS HONEST
 * ---------------------------------------------------------------------------
 * 1. The TRADEABLE window comes from the market object's own `open_time` and
 *    `close_time` — the exchange's words. It is NEVER derived from
 *    `occurrence_datetime` or `expected_expiration_time`: on every game contract
 *    audited here those two are EQUAL to each other and neither is the moment
 *    the game starts (a game market stays tradeable after the scheduled start,
 *    until the exchange closes it). Using min(close_time,
 *    expected_expiration_time) as the in-game bound collapses the window to
 *    zero and would report every real in-play ladder as "post-close". The
 *    script counts that equality per run and publishes the count as evidence.
 *
 * 2. The EVENT window is never parsed out of a ticker string and never guessed.
 *    It is what the archives can tell you AT THE INSTANT THE LADDER WAS
 *    CAPTURED (point-in-time, the same discipline the replay engine uses):
 *      • MLB — OFFICIAL: `gameDate` is the league's scheduled first pitch, and
 *        the archive's own state rows say when the game was observed Final.
 *      • ESPN — TRUSTED BUT NOT OFFICIAL, and it publishes NO start time: only
 *        observed state transitions (`pre` / `in` / `post`, `completed`). So an
 *        ESPN-joined ladder can only be called in-play when the archive had
 *        ALREADY OBSERVED the game in progress at or before that instant, and
 *        the label travels with every row.
 *    A ladder inside the tradeable window whose event window cannot be joined
 *    — or which the archive had not yet observed — is reported as
 *    TRADEABLE_EVENT_UNVERIFIED. It is NEVER reported as in-play, and it is
 *    never silently dropped: the count is published beside the in-play count.
 *
 * Phases (every ladder lands in exactly one):
 *   PRE_OPEN                     captured before market.open_time
 *   TRADEABLE_PRE_EVENT          tradeable, and the event had not started (official start, or observed `pre`)
 *   IN_PLAY                      tradeable, event started and not yet observed final
 *   TRADEABLE_POST_EVENT         tradeable, but the archive had already observed the event final
 *   TRADEABLE_EVENT_UNVERIFIED   tradeable, event window not joined / not yet observed
 *   POST_CLOSE                   captured after market.close_time (the official API returns an empty book here — #60)
 *   UNKNOWN                      no market object in the store: no window is invented
 *
 * CLI:
 *   node scripts/verify-game-window.mjs                 audit + write both reports
 *   node scripts/verify-game-window.mjs --strict        exit 1 if no IN_PLAY ladder exists
 *   node scripts/verify-game-window.mjs --json          print the report to stdout, write nothing
 *   node scripts/verify-game-window.mjs --out=PATH --docs-out=PATH|--docs-out=false --quiet
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { hasMlbSignalArchive, matchMlbGame } from '../src/mlb-signal-store.js';
import { ESPN_TRUST_LABEL, SERIES_LEAGUE, hasEspnArchive, matchEspnGame } from '../src/espn-signal-store.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const HISTORY_DIR = path.join(ROOT, 'data', 'history');
const DEFAULT_OUT = path.join(ROOT, 'data', 'reports', 'game-window-captures.json');
// The GitHub Pages site links its raw reports from docs/data/reports/ (see
// renderResearchReports in src/app.js). The canonical file stays pretty-printed
// for review; the Pages copy is written compact because a browser fetches it.
const DEFAULT_DOCS_OUT = path.join(ROOT, 'docs', 'data', 'reports', 'game-window-captures.json');

/** A store belongs to this audit when the exchange's own series ticker says it is a game market. */
export function isGameSeries(seriesTicker) {
  return typeof seriesTicker === 'string' && seriesTicker.endsWith('GAME');
}

export function isoToMs(iso) {
  if (typeof iso !== 'string' || !iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}

/** How many price levels a captured ladder actually carries (0 = an empty book). */
export function ladderLevels(book) {
  const fp = book && book.orderbook && book.orderbook.orderbook_fp;
  const yes = fp && Array.isArray(fp.yes_dollars) ? fp.yes_dollars.length : 0;
  const no = fp && Array.isArray(fp.no_dollars) ? fp.no_dollars.length : 0;
  return { yes, no, levels: yes + no };
}

/**
 * The tradeable window, from the market object's OWN times.
 * `occurrence_datetime` is deliberately not used as an end bound — see rule 1.
 * @returns {{openTs:number|null, closeTs:number|null, openIso:string|null, closeIso:string|null,
 *            source:string|null, reason:string|null, occurrenceEqualsExpiration:boolean|null}}
 */
export function tradeableWindow(market) {
  if (!market || typeof market !== 'object') {
    return {
      openTs: null, closeTs: null, openIso: null, closeIso: null,
      source: null, reason: 'NO_MARKET_OBJECT — no window is invented for this store',
      occurrenceEqualsExpiration: null, occurrenceEqualsCloseTime: null
    };
  }
  const openIso = typeof market.open_time === 'string' ? market.open_time : null;
  const closeIso = typeof market.close_time === 'string' ? market.close_time : null;
  const openTs = isoToMs(openIso);
  const closeTs = isoToMs(closeIso);
  const occ = isoToMs(market.occurrence_datetime);
  const exp = isoToMs(market.expected_expiration_time);
  const occurrenceEqualsExpiration = occ !== null && exp !== null ? occ === exp : null;
  const occurrenceEqualsCloseTime = occ !== null && closeTs !== null ? occ === closeTs : null;
  if (openTs === null && closeTs === null) {
    return {
      openTs: null, closeTs: null, openIso, closeIso, source: null,
      reason: 'MARKET_OBJECT_HAS_NO_open_time_OR_close_time', occurrenceEqualsExpiration, occurrenceEqualsCloseTime
    };
  }
  return {
    openTs, closeTs, openIso, closeIso,
    source: 'market.open_time → market.close_time (the exchange\'s own fields)',
    reason: null,
    occurrenceEqualsExpiration,
    occurrenceEqualsCloseTime
  };
}

/**
 * What the archives can tell you about this contract's event, AS OF `tsMs`.
 * Point-in-time: a state row captured after `tsMs` is invisible, exactly as in
 * the replay engine. Returns `verified: true` only for the official MLB join.
 */
export function eventKnowledge(seriesTicker, ticker, tsMs, { mlbOk = true, espnOk = true } = {}) {
  const out = {
    source: 'UNVERIFIED', verified: false, trust: null, joinKey: null, matchedBy: null,
    officialStartTs: null, officialStartIso: null, startKind: null,
    observedState: null, observedStateAt: null, observedFinalAt: null,
    reason: null, detail: null
  };

  if (seriesTicker === 'KXMLBGAME') {
    if (!mlbOk || !hasMlbSignalArchive()) {
      out.reason = 'NO_OFFICIAL_MLB_ARCHIVE';
      out.detail = 'data/mlb-signals/ is absent — no official event window is available, so nothing is claimed.';
      return out;
    }
    const m = matchMlbGame(ticker);
    // matchMlbGame returns {ok:false,reason} on a miss — NOT null. Testing
    // truthiness alone reports joins that never happened.
    const game = m && m.ok ? m.game : null;
    if (!game) {
      out.source = 'UNVERIFIED';
      out.reason = (m && m.reason) || 'NO_OFFICIAL_JOIN';
      out.detail = 'the official MLB archive has no game matching this contract\'s own ticker/date.';
      return out;
    }
    out.source = 'OFFICIAL_MLB_SCHEDULE';
    out.verified = true;
    out.trust = 'OFFICIAL — statsapi.mlb.com schedule (MLB Advanced Media)';
    out.joinKey = `gamePk ${game.gamePk}`;
    out.matchedBy = m.matchedBy || null;
    out.officialStartIso = game.gameDate || null;
    out.officialStartTs = isoToMs(game.gameDate);
    out.startKind = 'official scheduled first pitch (statsapi.mlb.com gameDate)';
    const rows = Array.isArray(game.states) ? [...game.states].sort((a, b) => (a.captured_at < b.captured_at ? -1 : 1)) : [];
    for (const row of rows) {
      const at = isoToMs(row.captured_at);
      if (at === null || at > tsMs) continue; // captured after this ladder: not knowable then
      const final = String(row.abstractGameState || '').toLowerCase() === 'final' || row.codedGameState === 'F';
      out.observedState = final ? 'final' : String(row.abstractGameState || row.detailedState || '').toLowerCase() || null;
      out.observedStateAt = row.captured_at;
      if (final && out.observedFinalAt === null) out.observedFinalAt = row.captured_at;
    }
    out.detail = out.observedFinalAt
      ? `the archive had already observed this game Final at ${out.observedFinalAt}`
      : 'the archive had not observed this game Final at the ladder instant';
    return out;
  }

  const league = SERIES_LEAGUE[seriesTicker];
  if (!league) {
    out.reason = 'NO_EVENT_SOURCE_FOR_SERIES';
    out.detail = `neither the official MLB archive nor the ESPN archive covers ${seriesTicker}; no event window is invented.`;
    return out;
  }
  if (!espnOk || !hasEspnArchive()) {
    out.reason = 'NO_ESPN_ARCHIVE';
    out.detail = 'data/espn-signals/ is absent — no observed event window is available, so nothing is claimed.';
    return out;
  }
  const m = matchEspnGame(ticker);
  const event = m && m.ok ? m.event : null;
  if (!event) {
    out.reason = (m && m.reason) || 'NO_ESPN_JOIN';
    out.detail = 'the ESPN archive has no event matching this contract\'s own ticker/date.';
    return out;
  }
  out.source = 'ESPN_OBSERVED';
  out.verified = false; // an observed window is not an official one
  out.trust = ESPN_TRUST_LABEL;
  out.joinKey = `eventId ${event.eventId} (${event.shortName || event.name || ''})`.trim();
  out.matchedBy = m.matchedBy || null;
  out.startKind = 'NO PUBLISHED START TIME — ESPN gives a date only; the window is the archive\'s own observed state transitions';
  const rows = Array.isArray(event.states) ? [...event.states].sort((a, b) => (a.captured_at < b.captured_at ? -1 : 1)) : [];
  for (const row of rows) {
    const at = isoToMs(row.captured_at);
    if (at === null || at > tsMs) continue; // captured after this ladder: not knowable then
    const st = String(row.state || '').toLowerCase();
    const done = row.completed === true || st === 'post';
    out.observedState = done ? 'post' : st || null;
    out.observedStateAt = row.captured_at;
    if (done && out.observedFinalAt === null) out.observedFinalAt = row.captured_at;
  }
  out.detail = out.observedState
    ? `the archive had observed "${out.observedState}" at ${out.observedStateAt}`
    : 'the archive had observed nothing about this event at the ladder instant';
  return out;
}

/**
 * One ladder → exactly one phase.
 * @param {{captured_at:string}} book
 * @param {ReturnType<typeof tradeableWindow>} win
 * @param {ReturnType<typeof eventKnowledge>} ev
 */
export function classifyCapture(book, win, ev) {
  const at = isoToMs(book && book.captured_at);
  const lv = ladderLevels(book);
  const base = { at, capturedAt: book && book.captured_at, yesLevels: lv.yes, noLevels: lv.no, levels: lv.levels, url: book && book.url };
  if (at === null) return { ...base, phase: 'UNKNOWN', why: 'the ladder has no parsable captured_at' };
  if (!win || win.openTs === null || win.closeTs === null) {
    return { ...base, phase: 'UNKNOWN', why: (win && win.reason) || 'no tradeable window' };
  }
  if (at < win.openTs) return { ...base, phase: 'PRE_OPEN', why: `captured before market.open_time (${win.openIso})` };
  if (at > win.closeTs) return { ...base, phase: 'POST_CLOSE', why: `captured after market.close_time (${win.closeIso}) — the official API returns an empty book there (#60)` };

  // Inside the tradeable window: what did the archives know at this instant?
  if (!ev || ev.source === 'UNVERIFIED') {
    return { ...base, phase: 'TRADEABLE_EVENT_UNVERIFIED', why: ev && ev.reason ? `event window not joined: ${ev.reason}` : 'event window not joined' };
  }
  if (ev.source === 'OFFICIAL_MLB_SCHEDULE') {
    if (ev.officialStartTs === null) return { ...base, phase: 'TRADEABLE_EVENT_UNVERIFIED', why: 'the official archive row has no gameDate' };
    if (at < ev.officialStartTs) return { ...base, phase: 'TRADEABLE_PRE_EVENT', why: `before the official first pitch (${ev.officialStartIso})` };
    if (ev.observedFinalAt) return { ...base, phase: 'TRADEABLE_POST_EVENT', why: `the archive had already observed Final at ${ev.observedFinalAt}` };
    return { ...base, phase: 'IN_PLAY', why: `official first pitch ${ev.officialStartIso} had passed and the archive had not observed Final — ${ev.joinKey}` };
  }
  // ESPN_OBSERVED: no published start time, so only the archive's own observations classify.
  const st = ev.observedState;
  if (!st) return { ...base, phase: 'TRADEABLE_EVENT_UNVERIFIED', why: 'ESPN had observed nothing about this event yet (it publishes no start time)' };
  if (st === 'pre') return { ...base, phase: 'TRADEABLE_PRE_EVENT', why: `ESPN observed "pre" at ${ev.observedStateAt} (NOT OFFICIAL)` };
  if (st === 'post') return { ...base, phase: 'TRADEABLE_POST_EVENT', why: `ESPN observed the event completed at ${ev.observedFinalAt} (NOT OFFICIAL)` };
  return { ...base, phase: 'IN_PLAY', why: `ESPN had observed the event in progress ("${st}" at ${ev.observedStateAt}) — ${ev.trust}` };
}

const PHASES = ['PRE_OPEN', 'TRADEABLE_PRE_EVENT', 'IN_PLAY', 'TRADEABLE_POST_EVENT', 'TRADEABLE_EVENT_UNVERIFIED', 'POST_CLOSE', 'UNKNOWN'];

function zeroedPhases() {
  const o = {};
  for (const p of PHASES) o[p] = 0;
  return o;
}

/** Every store file under data/history/ (top-level daily + intraday buckets), skipping manifests. */
export function walkStoreFiles(dir = HISTORY_DIR) {
  const out = [];
  const walk = (d) => {
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!e.name.endsWith('.json') || e.name.startsWith('_')) continue;
      out.push(p);
    }
  };
  walk(dir);
  return out.sort();
}

/**
 * Audit ONE store file.
 * `knowledge` is a test seam: a function (series, ticker, atMs) returning the
 * same shape as eventKnowledge(), so the IN_PLAY path can be exercised without
 * inventing an archive. Production callers leave it null and read the real
 * archives only.
 * @returns {object|null} null when the file is not a game-series store
 */
export function auditStore(store, filePath, { mlbOk = true, espnOk = true, knowledge = null } = {}) {
  if (!store || !isGameSeries(store.series_ticker)) return null;
  const win = tradeableWindow(store.market);
  const books = Array.isArray(store.books) ? store.books : [];
  const phases = zeroedPhases();
  const nonEmptyByPhase = zeroedPhases();
  const examples = [];
  let laddersNonEmpty = 0;
  let firstCapture = null;
  let lastCapture = null;
  let evSample = null;

  for (const book of books) {
    const at = isoToMs(book && book.captured_at);
    if (at !== null) {
      if (firstCapture === null || at < firstCapture) firstCapture = at;
      if (lastCapture === null || at > lastCapture) lastCapture = at;
    }
    // The event window is evaluated AT the ladder's own instant (point-in-time).
    const atMs = at === null ? Number.POSITIVE_INFINITY : at;
    const ev = knowledge ? knowledge(store.series_ticker, store.ticker, atMs) : eventKnowledge(store.series_ticker, store.ticker, atMs, { mlbOk, espnOk });
    if (!evSample) evSample = ev;
    const row = classifyCapture(book, win, ev);
    phases[row.phase] += 1;
    if (row.levels > 0) { nonEmptyByPhase[row.phase] += 1; laddersNonEmpty += 1; }
    if (examples.length < 4) {
      examples.push({
        captured_at: row.capturedAt, phase: row.phase, yesLevels: row.yesLevels, noLevels: row.noLevels,
        why: row.why, url: row.url,
        eventSource: ev.source, eventJoinKey: ev.joinKey, eventReason: ev.reason, eventDetail: ev.detail
      });
    }
  }

  const tradeableNonEmpty = nonEmptyByPhase.TRADEABLE_PRE_EVENT + nonEmptyByPhase.IN_PLAY +
    nonEmptyByPhase.TRADEABLE_POST_EVENT + nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED;

  let verdict;
  let verdictWhy;
  if (!books.length) {
    verdict = 'NO_LADDERS';
    verdictWhy = 'this store holds no order-book capture at all';
  } else if (phases.IN_PLAY > 0) {
    verdict = 'IN_PLAY_LADDER';
    verdictWhy = `${phases.IN_PLAY} ladder(s) captured while the event was under way (${nonEmptyByPhase.IN_PLAY} of them non-empty)`;
  } else if (phases.POST_CLOSE === books.length) {
    verdict = 'POST_CLOSE_ONLY';
    verdictWhy = `every ladder was captured after this contract's own close_time (${win.closeIso}), where the official API returns an empty book — irregularity #60; ${laddersNonEmpty} non-empty`;
  } else if (phases.PRE_OPEN === books.length) {
    verdict = 'PRE_OPEN_ONLY';
    verdictWhy = `every ladder was captured before this contract's open_time (${win.openIso})`;
  } else if (tradeableNonEmpty > 0 && nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED === tradeableNonEmpty) {
    verdict = 'TRADEABLE_LADDER_EVENT_UNVERIFIED';
    verdictWhy = `${tradeableNonEmpty} non-empty ladder(s) sit inside the tradeable window (open_time → close_time) but no event window could be joined at those instants (${evSample && evSample.reason ? evSample.reason : 'no join'}), so they are NOT claimed as in-play`;
  } else if (tradeableNonEmpty > 0) {
    verdict = 'TRADEABLE_LADDER_NO_IN_PLAY';
    verdictWhy = `${tradeableNonEmpty} non-empty ladder(s) inside the tradeable window, classified ${JSON.stringify(nonEmptyByPhase)} — none in-play`;
  } else {
    verdict = 'EMPTY_LADDERS_ONLY';
    verdictWhy = `${books.length} ladder(s) inside the tradeable window, all of them empty (0 price levels)`;
  }

  return {
    ticker: store.ticker,
    series: store.series_ticker,
    store: filePath ? path.relative(ROOT, filePath) : null,
    periodMinutes: store.period_interval === 1440 ? 1440 : store.period_interval === 60 ? 60 : store.period_interval === 1 ? 1 : store.period_interval,
    status: store.status || null,
    result: store.result || null,
    marketCapturedAt: store.market_captured_at || null,
    tradeableWindow: {
      openIso: win.openIso, closeIso: win.closeIso, source: win.source, reason: win.reason,
      occurrenceEqualsExpiration: win.occurrenceEqualsExpiration,
      occurrenceEqualsCloseTime: win.occurrenceEqualsCloseTime
    },
    eventWindow: evSample ? {
      source: evSample.source, verified: evSample.verified, trust: evSample.trust,
      joinKey: evSample.joinKey, matchedBy: evSample.matchedBy,
      officialStartIso: evSample.officialStartIso, startKind: evSample.startKind,
      reason: evSample.reason, detail: evSample.detail
    } : null,
    bars: Array.isArray(store.candlesticks) ? store.candlesticks.length : 0,
    ladders: books.length,
    laddersNonEmpty,
    laddersEmpty: books.length - laddersNonEmpty,
    tradeableNonEmpty,
    phases,
    nonEmptyByPhase,
    firstCapture: firstCapture === null ? null : new Date(firstCapture).toISOString(),
    lastCapture: lastCapture === null ? null : new Date(lastCapture).toISOString(),
    verdict,
    verdictWhy,
    examples,
    orderbookUrl: `https://external-api.kalshi.com/trade-api/v2/markets/${store.ticker}/orderbook`,
    marketUrl: store.market_url || `https://external-api.kalshi.com/trade-api/v2/markets/${store.ticker}`
  };
}

/**
 * The whole audit: every game-series store in data/history/, rolled up per
 * series, cross-checked against the desk module's per-series reserves.
 */
export function auditGameWindow({ deskCoverage = null, deskMarketTickers = null, deskRule = null, historyDir = HISTORY_DIR } = {}) {
  // The module states its own cap in DESK_DATA.rule.cap - quoted, never recomputed.
  const moduleCap = deskRule && Number.isFinite(deskRule.cap) ? deskRule.cap : 'its own cap';
  const files = walkStoreFiles(historyDir);
  let storesRead = 0;
  const stores = [];
  for (const f of files) {
    let j;
    try { j = JSON.parse(fs.readFileSync(f, 'utf8')); } catch { continue; }
    storesRead += 1;
    const row = auditStore(j, f);
    if (row) stores.push(row);
  }

  const totals = {
    stores: stores.length,
    ladders: stores.reduce((a, s) => a + s.ladders, 0),
    laddersNonEmpty: stores.reduce((a, s) => a + s.laddersNonEmpty, 0),
    phases: zeroedPhases(),
    nonEmptyByPhase: zeroedPhases(),
    occurrenceEqualsExpectedExpiration: 0,
    occurrenceDiffersFromExpectedExpiration: 0,
    occurrenceNotComparable: 0,
    occurrenceEqualsCloseTime: 0,
    storesWithMarketObject: 0,
    distinctTickers: new Set(stores.map((s) => s.ticker)).size
  };
  for (const s of stores) {
    for (const p of PHASES) {
      totals.phases[p] += s.phases[p];
      totals.nonEmptyByPhase[p] += s.nonEmptyByPhase[p];
    }
    if (s.tradeableWindow.openIso || s.tradeableWindow.closeIso) totals.storesWithMarketObject += 1;
    if (s.tradeableWindow.occurrenceEqualsExpiration === true) totals.occurrenceEqualsExpectedExpiration += 1;
    else if (s.tradeableWindow.occurrenceEqualsExpiration === false) totals.occurrenceDiffersFromExpectedExpiration += 1;
    else totals.occurrenceNotComparable += 1;
    if (s.tradeableWindow.occurrenceEqualsCloseTime === true) totals.occurrenceEqualsCloseTime += 1;
  }
  totals.tradeableNonEmpty = totals.nonEmptyByPhase.TRADEABLE_PRE_EVENT + totals.nonEmptyByPhase.IN_PLAY +
    totals.nonEmptyByPhase.TRADEABLE_POST_EVENT + totals.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED;

  // ---- per-series roll-up -------------------------------------------------
  const bySeries = new Map();
  for (const s of stores) {
    if (!bySeries.has(s.series)) {
      bySeries.set(s.series, {
        series: s.series, stores: 0, openStores: 0, settledStores: 0, distinctTickers: new Set(),
        ladders: 0, laddersNonEmpty: 0, phases: zeroedPhases(), nonEmptyByPhase: zeroedPhases(),
        joinSources: {}, joinReasons: {}, verdicts: {}, tickers: new Set()
      });
    }
    const r = bySeries.get(s.series);
    r.stores += 1;
    if (String(s.status).toLowerCase() === 'finalized') r.settledStores += 1; else r.openStores += 1;
    r.distinctTickers.add(s.ticker);
    r.ladders += s.ladders;
    r.laddersNonEmpty += s.laddersNonEmpty;
    for (const p of PHASES) { r.phases[p] += s.phases[p]; r.nonEmptyByPhase[p] += s.nonEmptyByPhase[p]; }
    const src = (s.eventWindow && s.eventWindow.source) || 'UNVERIFIED';
    r.joinSources[src] = (r.joinSources[src] || 0) + 1;
    const reason = s.eventWindow && s.eventWindow.reason;
    if (reason) r.joinReasons[reason] = (r.joinReasons[reason] || 0) + 1;
    r.verdicts[s.verdict] = (r.verdicts[s.verdict] || 0) + 1;
  }
  const series = [...bySeries.values()].sort((a, b) => a.series.localeCompare(b.series)).map((r) => {
    const inPlay = r.nonEmptyByPhase.IN_PLAY;
    const tradeable = r.nonEmptyByPhase.TRADEABLE_PRE_EVENT + inPlay +
      r.nonEmptyByPhase.TRADEABLE_POST_EVENT + r.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED;
    return {
      series: r.series,
      stores: r.stores,
      openStores: r.openStores,
      settledStores: r.settledStores,
      distinctTickers: r.distinctTickers.size,
      ladders: r.ladders,
      laddersNonEmpty: r.laddersNonEmpty,
      joinSources: r.joinSources,
      joinReasons: r.joinReasons,
      verdicts: r.verdicts,
      preOpenCaptures: r.phases.PRE_OPEN,
      preEventCaptures: r.phases.TRADEABLE_PRE_EVENT,
      inPlayCaptures: r.phases.IN_PLAY,
      postEventCaptures: r.phases.TRADEABLE_POST_EVENT,
      unverifiedEventCaptures: r.phases.TRADEABLE_EVENT_UNVERIFIED,
      postCloseCaptures: r.phases.POST_CLOSE,
      preEventNonEmpty: r.nonEmptyByPhase.TRADEABLE_PRE_EVENT,
      inPlayNonEmpty: inPlay,
      postEventNonEmpty: r.nonEmptyByPhase.TRADEABLE_POST_EVENT,
      unverifiedEventNonEmpty: r.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED,
      postCloseNonEmpty: r.nonEmptyByPhase.POST_CLOSE,
      tradeableNonEmpty: tradeable,
      summary: inPlay > 0
        ? `${inPlay} NON-EMPTY in-play ladder(s) — a real in-play window exists for this series`
        : tradeable > 0
          ? `0 in-play ladders, but ${tradeable} non-empty ladder(s) inside the tradeable window whose event window is ${r.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED === tradeable ? 'UNVERIFIED (not claimed as in-play)' : 'partly verified'}`
          : r.nonEmptyByPhase.POST_CLOSE > 0 || r.laddersNonEmpty === 0
            ? `0 usable ladders: ${r.phases.POST_CLOSE} capture(s) after close_time (${r.nonEmptyByPhase.POST_CLOSE} of those non-empty) — irregularity #60`
            : '0 ladders'
    };
  });

  // ---- desk reserve cross-check ------------------------------------------
  const moduleTickers = new Set(Array.isArray(deskMarketTickers) ? deskMarketTickers : []);
  const reserved = (deskCoverage && Array.isArray(deskCoverage.reservedBySeries)) ? deskCoverage.reservedBySeries : [];
  const usableLaddersByTicker = new Map();
  for (const s of stores) {
    const usable = s.nonEmptyByPhase.IN_PLAY + s.nonEmptyByPhase.TRADEABLE_PRE_EVENT +
      s.nonEmptyByPhase.TRADEABLE_POST_EVENT + s.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED;
    if (!usable) continue;
    const open = String(s.status).toLowerCase() !== 'finalized';
    if (!open) continue; // a settled contract is measurement data, not a tradeable slot
    const prev = usableLaddersByTicker.get(s.ticker) || { usable: 0, inPlay: 0, stores: 0 };
    prev.usable += usable;
    prev.inPlay += s.nonEmptyByPhase.IN_PLAY;
    prev.stores += 1;
    usableLaddersByTicker.set(s.ticker, prev);
  }

  const deskReserves = reserved
    .filter((r) => isGameSeries(r.prefix))
    .map((r) => {
      const seriesRows = stores.filter((s) => s.series === r.prefix);
      const openRows = seriesRows.filter((s) => String(s.status).toLowerCase() !== 'finalized');
      const openLadderContracts = [...usableLaddersByTicker.entries()]
        .filter(([t]) => t.startsWith(`${r.prefix}-`))
        .map(([t, v]) => ({ ticker: t, usableLadders: v.usable, inPlayLadders: v.inPlay, stores: v.stores, inDeskModule: moduleTickers.size ? moduleTickers.has(t) : null }))
        .sort((a, b) => b.usableLadders - a.usableLadders || a.ticker.localeCompare(b.ticker));
      const inModule = openLadderContracts.filter((c) => c.inDeskModule === true);
      const notInModule = openLadderContracts.filter((c) => c.inDeskModule === false);
      const inPlayNonEmpty = seriesRows.reduce((a, s) => a + s.nonEmptyByPhase.IN_PLAY, 0);
      const tradeableNonEmpty = seriesRows.reduce((a, s) => a + s.tradeableNonEmpty, 0);

      let explains;
      if (r.kept > 0) {
        explains = `the desk kept ${r.kept} of ${r.slots} slot(s) and the audit found ${tradeableNonEmpty} non-empty ladder(s) inside the tradeable window for this series (${inPlayNonEmpty} of them in-play) — consistent`;
      } else if (!openRows.length) {
        explains = `the desk kept 0 of ${r.slots} slot(s) because EVERY ${r.prefix} contract in this store is already finalized by the exchange; the audit's ladders for them (${inPlayNonEmpty} in-play, ${tradeableNonEmpty} tradeable-window non-empty) belong to settled contracts and are historical measurement data, not tradeable slots`;
      } else if (notInModule.length) {
        explains = `the desk kept 0 of ${r.slots} slot(s) even though ${openLadderContracts.length} OPEN ${r.prefix} contract(s) carry non-empty tradeable ladders in the store, of which ${inModule.length} are in the desk module (${notInModule.length} are absent from src/desk-data.js — the module's own rule caps open contracts at ${moduleCap} by real lifetime volume, and its series reserve for ${r.prefix} then found nothing to keep). Contract(s): ${notInModule.map((c) => `${c.ticker} [NOT in module, ${c.usableLadders} usable ladder(s)]`).join('; ')}`;
      } else if (openLadderContracts.length) {
        explains = `the desk kept 0 of ${r.slots} slot(s) although ${openLadderContracts.length} OPEN ${r.prefix} contract(s) hold usable ladders that ARE in the desk module — the reserve's own entry conditions decided, not the data`;
      } else {
        explains = `the desk kept 0 of ${r.slots} slot(s): ${openRows.length} OPEN ${r.prefix} contract(s) exist in the store but none of them has a non-empty ladder inside its tradeable window`;
      }

      return {
        series: r.prefix,
        deskSlots: r.slots,
        deskKept: r.kept,
        deskAvailable: r.available,
        deskReason: r.reason,
        deskTickersKept: r.tickers || [],
        openLadderContracts: openLadderContracts.length,
        openContractsWithUsableLadder: openLadderContracts.length,
        ofThoseInDeskModule: inModule.length,
        openLadderContractsNotInModule: notInModule.map((c) => c.ticker),
        contracts: openLadderContracts,
        auditStores: seriesRows.length,
        auditOpenStores: openRows.length,
        auditSettledStores: seriesRows.length - openRows.length,
        auditLadders: seriesRows.reduce((a, s) => a + s.ladders, 0),
        auditInPlayNonEmpty: inPlayNonEmpty,
        auditTradeableNonEmpty: tradeableNonEmpty,
        explainsDeskReserve: explains
      };
    });

  // ---- what is still missing, per series ---------------------------------
  const stillMissing = series
    .filter((r) => r.inPlayNonEmpty === 0)
    .map((r) => ({
      series: r.series,
      what: `${r.ladders} captured ladder(s): ${r.inPlayNonEmpty} usable in-play, ${r.tradeableNonEmpty} non-empty inside the tradeable window, ${r.postCloseCaptures} taken after the exchange's own close_time (${r.postCloseNonEmpty} of those non-empty)`,
      settledOnly: r.openStores === 0,
      eventSources: r.joinSources,
      joinReasons: r.joinReasons,
      unblocker: r.openStores === 0
        ? `every ${r.series} contract in this store is already finalized by the exchange, so no future capture can add an in-play ladder for THEM — the unblocker is a with_books capture of the NEXT ${r.series} slate while it is in play (the 00:30/02:30 UTC game-window passes in .github/workflows/daily-history.yml)`
        : `${r.stores} ${r.series} store(s) are still OPEN but no ladder was captured inside a verified/observed event window (${Object.entries(r.joinReasons).map(([k, v]) => `${k}:${v}`).join(', ') || 'no join reason recorded'}) — the unblocker is a with_books capture during the game plus an event window the archives can join`
    }));

  const seriesWithInPlayLadder = series.filter((r) => r.inPlayNonEmpty > 0).map((r) => r.series);
  const seriesWithoutInPlayLadder = series.filter((r) => r.inPlayNonEmpty === 0).map((r) => r.series);
  const unverified = totals.nonEmptyByPhase.TRADEABLE_EVENT_UNVERIFIED;

  const honestNote = totals.nonEmptyByPhase.IN_PLAY === 0
    ? `No game-series contract in this store has a non-empty ladder captured inside a verified/observed event window. ${unverified} non-empty ladder(s) sit inside the exchange's tradeable window with an UNVERIFIED event window and are not claimed as in-play. Every in-play game-series desk reserve therefore stays at 0 and every in-play entrant abstains with its reason published — a capture-timing fact, not a code defect (irregularity #60).`
    : `${totals.nonEmptyByPhase.IN_PLAY} non-empty ladder(s) were captured inside a verified/observed event window across ${seriesWithInPlayLadder.length} series (${seriesWithInPlayLadder.join(', ')}). ${unverified} further non-empty ladder(s) sit inside the tradeable window with an UNVERIFIED event window and are NOT counted as in-play.`;

  return {
    generatedAt: new Date().toISOString(),
    audit: 'game-window-captures',
    version: 2,
    offline: true,
    rule: 'Tradeable window = the market object\'s own open_time → close_time. Event window = point-in-time knowledge from data/mlb-signals/ (OFFICIAL statsapi.mlb.com: scheduled first pitch + observed Final) or data/espn-signals/ (TRUSTED BUT NOT OFFICIAL: observed pre/in/post transitions; ESPN publishes NO start time). occurrence_datetime is never used as an event bound — no game time is ever parsed out of a ticker string.',
    sources: {
      stores: storesRead,
      storesRead,
      historyDir: path.relative(ROOT, historyDir),
      mlbArchivePresent: hasMlbSignalArchive(),
      espnArchivePresent: hasEspnArchive(),
      espnTrust: ESPN_TRUST_LABEL,
      orderbookEndpoint: 'GET /markets/{ticker}/orderbook — https://docs.kalshi.com/getting_started/orderbook_responses',
      marketEndpoint: 'GET /markets/{ticker} — https://docs.kalshi.com/api-reference/markets/getmarket',
      mlbEndpoint: 'https://statsapi.mlb.com/api/v1/schedule (official)',
      espnEndpoint: 'site.web.api.espn.com public JSON (aggregator, not a league feed)'
    },
    totals,
    seriesWithInPlayLadder,
    seriesWithoutInPlayLadder,
    series,
    deskReserves,
    stores,
    stillMissing,
    honestNote
  };
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

function parseArgs(argv) {
  const args = { strict: false, json: false, out: DEFAULT_OUT, docsOut: DEFAULT_DOCS_OUT, quiet: false };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'strict') args.strict = v !== 'false';
    else if (k === 'json') args.json = v !== 'false';
    else if (k === 'out') args.out = path.resolve(v);
    else if (k === 'docs-out') args.docsOut = v === 'false' ? null : path.resolve(v);
    else if (k === 'quiet') args.quiet = v !== 'false';
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);
  let deskCoverage = null;
  let deskMarketTickers = null;
  let deskRule = null;
  try {
    const mod = await import('../src/desk-data.js');
    deskCoverage = (mod.DESK_DATA && mod.DESK_DATA.coverage) || null;
    deskMarketTickers = ((mod.DESK_DATA && mod.DESK_DATA.markets) || []).map((m) => m.ticker);
    deskRule = (mod.DESK_DATA && mod.DESK_DATA.rule) || null;
  } catch (err) {
    if (!args.quiet) console.log(`game-window audit: src/desk-data.js not readable (${err && err.message}) — the desk-reserve cross-check is skipped, not guessed`);
  }

  const report = auditGameWindow({ deskCoverage, deskMarketTickers, deskRule });
  const ne = report.totals.nonEmptyByPhase;
  const ph = report.totals.phases;

  if (args.json) {
    process.stdout.write(JSON.stringify(report, null, 1) + '\n');
  } else {
    console.log(`game-window audit · ${report.totals.stores} game-series stores (${report.totals.distinctTickers} distinct contracts) · ${report.totals.ladders} captured ladders (${report.totals.laddersNonEmpty} non-empty)`);
    console.log(`  IN-PLAY (verified/observed event window): ${String(ph.IN_PLAY).padStart(4)} capture(s), ${String(ne.IN_PLAY).padStart(4)} non-empty`);
    console.log(`  PRE-EVENT (tradeable, before the start):  ${String(ph.TRADEABLE_PRE_EVENT).padStart(4)} capture(s), ${String(ne.TRADEABLE_PRE_EVENT).padStart(4)} non-empty`);
    console.log(`  POST-EVENT (tradeable, after the end):    ${String(ph.TRADEABLE_POST_EVENT).padStart(4)} capture(s), ${String(ne.TRADEABLE_POST_EVENT).padStart(4)} non-empty`);
    console.log(`  EVENT WINDOW UNVERIFIED (tradeable):      ${String(ph.TRADEABLE_EVENT_UNVERIFIED).padStart(4)} capture(s), ${String(ne.TRADEABLE_EVENT_UNVERIFIED).padStart(4)} non-empty`);
    console.log(`  POST-CLOSE (after market.close_time):     ${String(ph.POST_CLOSE).padStart(4)} capture(s), ${String(ne.POST_CLOSE).padStart(4)} non-empty — the official API returns an empty book there (#60)`);
    console.log(`  occurrence_datetime == expected_expiration_time on ${report.totals.occurrenceEqualsExpectedExpiration} store(s), differs on ${report.totals.occurrenceDiffersFromExpectedExpiration}, not comparable on ${report.totals.occurrenceNotComparable}; == close_time on ${report.totals.occurrenceEqualsCloseTime} — which is why neither is used as an event bound`);
    for (const s of report.series) {
      const srcs = Object.entries(s.joinSources).map(([k, v]) => `${k}:${v}`).join(' ');
      const reasons = Object.entries(s.joinReasons || {}).map(([k, v]) => `${k}:${v}`).join(' ');
      console.log(`  ${s.series.padEnd(20)} stores=${String(s.stores).padStart(3)} (${s.distinctTickers} distinct tickers, ${s.openStores} open / ${s.settledStores} settled) ladders=${String(s.ladders).padStart(4)} inPlay=${String(s.inPlayNonEmpty).padStart(3)} tradeable=${String(s.tradeableNonEmpty).padStart(3)} postClose=${String(s.postCloseCaptures).padStart(3)} [${srcs}] → ${s.summary}`);
      if (reasons) console.log(`  ${''.padEnd(20)}   event-window join reasons: ${reasons}`);
    }
    for (const r of report.deskReserves) {
      console.log(`  desk reserve ${r.series.padEnd(18)} kept=${r.deskKept}/${r.deskSlots} available=${r.deskAvailable} — ${r.explainsDeskReserve}`);
    }
    console.log(`  ${report.honestNote}`);
  }

  if (!args.json) {
    fs.mkdirSync(path.dirname(args.out), { recursive: true });
    fs.writeFileSync(args.out, JSON.stringify(report, null, 1));
    if (!args.quiet) console.log(`wrote ${path.relative(ROOT, args.out)}`);
    if (args.docsOut) {
      fs.mkdirSync(path.dirname(args.docsOut), { recursive: true });
      fs.writeFileSync(args.docsOut, JSON.stringify(report));
      if (!args.quiet) console.log(`wrote ${path.relative(ROOT, args.docsOut)} (compact copy for GitHub Pages)`);
    }
  }

  if (process.env.GITHUB_ACTIONS === 'true') {
    const level = ne.IN_PLAY > 0 ? 'notice' : 'warning';
    console.log(`::${level}::game-window audit: ${ne.IN_PLAY} non-empty IN-PLAY ladder(s) across ${report.seriesWithInPlayLadder.length} series (${report.seriesWithInPlayLadder.join(', ') || 'none'}); ${ne.TRADEABLE_EVENT_UNVERIFIED} tradeable-window ladder(s) with an unverified event window; ${report.seriesWithoutInPlayLadder.length} series have no in-play ladder (${report.seriesWithoutInPlayLadder.join(', ') || 'none'})`);
  }

  if (args.strict && ne.IN_PLAY === 0) {
    console.error('::error::--strict: no game-series ladder was captured inside a verified/observed event window');
    process.exit(1);
  }
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  main().catch((err) => {
    console.error(`game-window audit failed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}
