/**
 * KalshiPaperSim — Point-in-Time SEC Form 4 Store (read side)
 * =====================================================================
 * The query layer over the archive that scripts/archive-form4-signals.mjs
 * grows from EDGAR itself (sec.gov — official, keyless). Browser-safe (no
 * node: imports) so the static GitHub Pages build runs the SAME point-in-time
 * logic the server, the replay and the desk run.
 *
 * THE ONE RULE THIS MODULE ENFORCES
 *   A filing is knowable at time T only if EDGAR accepted it at or before T.
 *   `filingsAtOrBefore()` walks an issuer's filings NEWEST-accepted first and
 *   keeps only those with `acceptedAt <= T` — EDGAR's own acceptance instant
 *   (the feed entry's <updated>, equal to the submission's ACCEPTANCE-DATETIME
 *   header). A filing accepted after the decision bar is invisible, and a
 *   strategy that receives no filing ABSTAINS.
 *
 *   `first_seen_at` (the instant THIS repository captured the filing) is
 *   reported alongside every answer but is never used to widen what was
 *   knowable — the archive's capture lag is published, not netted out. The
 *   assumption behind using the acceptance instant is printed verbatim in
 *   every store file and in `form4Assumption()`.
 *
 * HOW A KALSHI TICKER IS JOINED TO AN ISSUER
 *   The tracked company-event series are named in each issuer's `kalshiSeries`
 *   list, which the archive took from the market's OWN `rules_primary` text
 *   (quoted verbatim in each store file). The join is by series prefix only —
 *   TESLACEOCHANGE-26 and KXTESLACEOCHANGE-26 both ask about Tesla's CEO, so
 *   both map to TSLA. A ticker whose series is not tracked (e.g.
 *   KXOPENAICEOCHANGE — OpenAI is private and has no Section 16 filers) is
 *   answered with null and the reason is published, never guessed.
 *
 * WHAT A STRATEGY MAY READ
 *   Only the DERIVED facts below: which filings were on EDGAR at T, how many
 *   were by an officer titled CEO, and the NET open-market share flow (SEC
 *   transaction codes P and S only — awards, vestings, gifts and tax
 *   withholdings are archived verbatim but are not an insider's market
 *   opinion, so they never move the number).
 */

import { FORM4_SIGNAL_DATA } from './form4-signal-data.js';

/**
 * SEC transaction codes, from the Form 4 instructions (Table I, column 3
 * "Transaction Code (Instr. 8)") — https://www.sec.gov/files/form4.pdf and the
 * SEC's ownership XML spec. Only the two OPEN-MARKET codes are interpreted;
 * every other code is archived verbatim and left alone.
 */
export const OPEN_MARKET_CODES = Object.freeze({ P: 'open-market purchase', S: 'open-market sale' });

/** ISO → unix seconds, or null. */
function isoToSeconds(iso) {
  if (!iso) return null;
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? Math.floor(ms / 1000) : null;
}

/** Net open-market share flow of one filing (buys positive, sales negative). */
export function filingOpenMarketFlow(filing) {
  let shares = 0;
  let dollars = 0;
  let buys = 0;
  let sells = 0;
  for (const t of (filing && filing.transactions) || []) {
    if (t.table !== 'nonDerivative') continue; // Table II rows are derivatives, not stock flow
    if (!OPEN_MARKET_CODES[t.code]) continue;
    const qty = Number(t.shares) || 0;
    if (t.code === 'P') {
      shares += qty;
      dollars += qty * (Number(t.price) || 0);
      buys += 1;
    } else if (t.code === 'S') {
      shares -= qty;
      dollars -= qty * (Number(t.price) || 0);
      sells += 1;
    }
  }
  return { shares, dollars, buys, sells };
}

/** True when a filing's reporting owner is an officer whose title says CEO. */
export function isCeoFiling(filing) {
  const rel = filing && filing.reportingOwner;
  if (!rel) return false;
  const title = String(rel.officerTitle || '').toLowerCase();
  return rel.isOfficer === true && /chief executive officer|\bceo\b/.test(title);
}

/** True when the archive shipped at least one issuer with filings. */
export function hasForm4Archive() {
  return Boolean(FORM4_SIGNAL_DATA && FORM4_SIGNAL_DATA.present) && form4Issuers().length > 0;
}

/** The point-in-time assumption published with every answer. */
export function form4Assumption() {
  return (FORM4_SIGNAL_DATA && FORM4_SIGNAL_DATA.assumption) || null;
}

/** Every archived issuer with its filings flattened to an array. */
export function form4Issuers() {
  const companies = (FORM4_SIGNAL_DATA && FORM4_SIGNAL_DATA.companies) || {};
  const out = [];
  for (const [symbol, store] of Object.entries(companies)) {
    const filings = Object.values((store && store.filings) || {});
    if (!filings.length) continue;
    out.push({
      symbol,
      cik: (store && store.cik) || null,
      issuerName: (store && store.issuerName) || null,
      kalshiSeries: (store && store.kalshiSeries) || [],
      rulesQuote: (store && store.rulesQuote) || null,
      assumption: (store && store.assumption) || null,
      source: (store && store.source) || null,
      captures: (store && store.captures) || [],
      filings: filings.slice().sort((a, b) => String(a.acceptedAt).localeCompare(String(b.acceptedAt)))
    });
  }
  return out;
}

/** Series prefixes this archive covers (e.g. ['TESLACEOCHANGE','KXTESLACEOCHANGE',…]). */
export function form4Series() {
  return [...new Set(form4Issuers().flatMap((i) => i.kalshiSeries || []))].sort();
}

/**
 * The issuer a Kalshi ticker speaks about, or null with a reason.
 * @returns {{ok:boolean, reason?:string, issuer?:object}}
 */
export function issuerForTicker(ticker, { issuers = form4Issuers() } = {}) {
  const series = String(ticker || '').split('-')[0];
  if (!series) return { ok: false, reason: 'NOT_A_TICKER' };
  const hit = issuers.find((i) => (i.kalshiSeries || []).includes(series));
  if (hit) return { ok: true, issuer: hit };
  const anyIssuer = issuers.length > 0;
  return { ok: false, reason: anyIssuer ? 'SERIES_NOT_TRACKED_BY_FORM4_ARCHIVE' : 'NO_FORM4_ARCHIVE' };
}

/** Every filing of `issuer` accepted at or before `tsSeconds` (newest first). */
export function filingsAtOrBefore(issuer, tsSeconds) {
  if (!issuer || !Array.isArray(issuer.filings) || !Number.isFinite(tsSeconds)) return [];
  return issuer.filings
    .filter((f) => {
      const t = isoToSeconds(f.acceptedAt);
      return t !== null && t <= tsSeconds;
    })
    .sort((a, b) => String(b.acceptedAt).localeCompare(String(a.acceptedAt)));
}

/**
 * The insider picture knowable at `tsSeconds`: every filing accepted by then,
 * restricted to a rolling window for the "recent activity" facts. Returns null
 * when the issuer has NO filing accepted by T — a strategy that receives null
 * ABSTAINS rather than assuming silence means anything.
 */
export function insiderStateAtOrBefore(issuer, tsSeconds, { windowDays = 90 } = {}) {
  if (!issuer || !Number.isFinite(tsSeconds)) return null;
  const all = filingsAtOrBefore(issuer, tsSeconds);
  if (!all.length) return null;
  const fromTs = tsSeconds - windowDays * 86_400;
  const window = all.filter((f) => {
    const t = isoToSeconds(f.acceptedAt);
    return t !== null && t >= fromTs;
  });
  const flow = { shares: 0, dollars: 0, buys: 0, sells: 0 };
  let ceoFilings = 0;
  const ceoRows = [];
  for (const f of window) {
    const fl = filingOpenMarketFlow(f);
    flow.shares += fl.shares;
    flow.dollars += fl.dollars;
    flow.buys += fl.buys;
    flow.sells += fl.sells;
    if (isCeoFiling(f)) {
      ceoFilings += 1;
      ceoRows.push({
        accessionNumber: f.accessionNumber,
        acceptedAt: f.acceptedAt,
        officerTitle: f.reportingOwner.officerTitle,
        name: f.reportingOwner.name,
        transactions: (f.transactions || []).length,
        url: f.url || null
      });
    }
  }
  // The freshest observation this archive had AT that instant: the newest
  // capture at or before T (how stale the archive itself was).
  let observedAt = null;
  for (const c of issuer.captures || []) {
    const t = isoToSeconds(c);
    if (t !== null && t <= tsSeconds && (observedAt === null || t > observedAt)) observedAt = t;
  }
  return {
    kind: 'sec-form4-flow',
    symbol: issuer.symbol,
    cik: issuer.cik,
    issuerName: issuer.issuerName,
    windowDays,
    filingsEver: all.length,
    filingsInWindow: window.length,
    newestAcceptedAt: all[0].acceptedAt,
    oldestAcceptedAt: all[all.length - 1].acceptedAt,
    windowNewestAcceptedAt: window.length ? window[0].acceptedAt : null,
    ceoFilings,
    ceoFilingsDetail: ceoRows,
    openMarket: flow,
    transactionsInWindow: window.reduce((a, f) => a + ((f.transactions || []).length), 0),
    codesInWindow: [...new Set(window.flatMap((f) => (f.transactions || []).map((t) => t.code)))].sort(),
    assumption: issuer.assumption || form4Assumption(),
    observedAt: observedAt === null ? null : new Date(observedAt * 1000).toISOString(),
    archiveStaleSeconds: observedAt === null ? null : Math.max(0, tsSeconds - observedAt),
    source: (issuer.source && Array.isArray(issuer.source.urls) && issuer.source.urls[0]) || (issuer.source && issuer.source.endpoint) || null,
    filings: window.map((f) => ({
      accessionNumber: f.accessionNumber,
      acceptedAt: f.acceptedAt,
      firstSeenAt: f.first_seen_at || null,
      filingDate: f.filingDate || null,
      periodOfReport: f.periodOfReport || null,
      officerTitle: (f.reportingOwner && f.reportingOwner.officerTitle) || null,
      name: (f.reportingOwner && f.reportingOwner.name) || null,
      isOfficer: f.reportingOwner ? f.reportingOwner.isOfficer : null,
      isDirector: f.reportingOwner ? f.reportingOwner.isDirector : null,
      isTenPercentOwner: f.reportingOwner ? f.reportingOwner.isTenPercentOwner : null,
      codes: (f.transactions || []).map((t) => t.code),
      openMarket: filingOpenMarketFlow(f),
      url: f.url || null
    }))
  };
}

/** Coverage summary for the UI / reports (never typed by hand). */
export function form4Coverage() {
  const issuers = form4Issuers();
  const filings = issuers.flatMap((i) => i.filings);
  const accepted = filings.map((f) => f.acceptedAt).filter(Boolean).sort();
  const captures = [...new Set(issuers.flatMap((i) => i.captures))].sort();
  return {
    present: hasForm4Archive(),
    issuers: issuers.length,
    symbols: issuers.map((i) => i.symbol),
    series: form4Series(),
    filings: filings.length,
    ceoFilings: filings.filter(isCeoFiling).length,
    filingsWithOpenMarketTrades: filings.filter((f) => {
      const fl = filingOpenMarketFlow(f);
      return fl.buys > 0 || fl.sells > 0;
    }).length,
    oldestAcceptedAt: accepted[0] || null,
    newestAcceptedAt: accepted[accepted.length - 1] || null,
    captures: captures.length,
    firstCapturedAt: captures[0] || null,
    lastCapturedAt: captures[captures.length - 1] || null,
    endpoint: (FORM4_SIGNAL_DATA && FORM4_SIGNAL_DATA.endpoint) || null,
    assumption: form4Assumption()
  };
}
