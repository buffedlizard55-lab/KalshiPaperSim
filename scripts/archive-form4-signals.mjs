#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time SEC Form 4 (Insider Transaction) Archive
 * =====================================================================
 * ROADMAP "Next #3(b)" — the insider half of the point-in-time signal archive
 * (weather #3 shipped 2026-09-18, FDA #3 2026-09-19, MLB #3 2026-09-20). This
 * closes the gap that made the S02 Insider-trades entries price-only:
 * "no point-in-time SEC Form 4 archive exists here" (src/signal-sources.js
 * S02.blockedBy, and the cards of InsiderFiling_Drift / LiveInsider_FilingFader).
 *
 * WHY THIS EXISTS
 *   Kalshi lists company-event contracts about executives (TESLACEOCHANGE-26,
 *   KXTESLACEOCHANGE-26, JPMCEOCHANGE-27, KXAAPLCEOCHANGE-26,
 *   KXOPENAICEOCHANGE-26 — all five are tracked in data/history/ with real
 *   candlesticks and captured ladders). Section 16 filings are the only
 *   OFFICIAL, machine-readable, timestamped record of what a company's own
 *   officers and directors did with its stock. Archiving them point-in-time
 *   turns those entries from a price-only fade into a rule that can say
 *   "a filing existed at this instant" instead of guessing.
 *
 * THE SOURCE (official, keyless, machine-readable — sec.gov itself)
 *   1. GET https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany
 *          &CIK=<symbol|cik>&type=4&dateb=&owner=include&count=40&output=atom
 *      EDGAR's Atom feed of a filer's recent filings. Each <entry> carries the
 *      accession number in its <id> (urn:tag:sec.gov,2008:accession-number=…),
 *      the form type at the head of its <title>, the filing date and the
 *      acceptance instant in <updated>.
 *      ⚠ THE `type=4` FILTER IS NOT TRUSTED. Verified 2026-09-21: the SAME
 *      query for CIK 0000019617 (JPMorgan Chase) returned 424B2 prospectus
 *      entries, while CIK 0001318605 (Tesla) returned only form 4. The feed
 *      therefore is treated as an unfiltered list: every entry's form type is
 *      parsed and only the entries whose form is exactly "4" are kept, and the
 *      run report counts every form the feed returned (`formsSeen`) so a
 *      silently-ignored filter is visible instead of silent.
 *   2. GET https://www.sec.gov/Archives/edgar/data/<cik>/<accNoNoDashes>/index.json
 *      The filing's own directory listing (official). Used to find the primary
 *      ownership XML document instead of guessing a file name.
 *   3. GET https://www.sec.gov/Archives/edgar/data/<cik>/<accNoNoDashes>/<doc>.xml
 *      The Form 4 ownership document. Element names are the ones in the SEC's
 *      own EDGAR Ownership XML Technical Specification
 *      (https://www.sec.gov/info/edgar/ownershipxmltechspec-v3.pdf) and were
 *      verified against a live filing on 2026-09-21:
 *      accession 0001104659-26-106432 (Tesla, Inc. / TSLA, officer Vaibhav
 *      Taneja, CFO) — schemaVersion X0609, documentType 4,
 *      periodOfReport 2026-09-05, ACCEPTANCE-DATETIME 20260909190010,
 *      nonDerivativeTable/nonDerivativeTransaction (codes M then S at
 *      $360.134), a nonDerivativeHolding row, and a derivativeTable RSU row.
 *      That filing is archived VERBATIM as the parser's fixture:
 *      data/form4-signals/fixtures/0001104659-26-106432.xml
 *
 * POINT-IN-TIME RULE — AND WHY THIS ARCHIVE CAN BACKTEST
 *   A filing's knowable-from instant is EDGAR's OWN acceptance instant
 *   (`acceptedAt`, the <updated> of the feed entry, equal to the filing's
 *   ACCEPTANCE-DATETIME header). Unlike a forecast or a game state, a filing
 *   does not decay: a Form 4 accepted 2026-04-23T20:08:52Z was on EDGAR from
 *   that instant onward, so the archive can be read for a past bar with the
 *   same discipline as a fresh capture. The archive still records
 *   `first_seen_at` (the instant THIS repository captured it) so the difference
 *   between "EDGAR published it" and "we saw it" is measurable and never
 *   hidden. src/form4-signal-store.js returns a filing for time T only when
 *   acceptedAt <= T.
 *   STATED ASSUMPTION: knowability is taken from EDGAR's acceptance instant,
 *   not from this archive's first capture instant. That is the exchange's
 *   publisher's own timestamp; it is an assumption about publication latency
 *   (published `assumption` in every store file), not a measured quantity.
 *
 * WHAT IS ARCHIVED (data/form4-signals/companies/<SYMBOL>.json)
 *   {
 *     symbol, edgarQuery, cik, issuerName, what,
 *     kalshiSeries: [the tracked Kalshi series this issuer's filings speak to],
 *     assumption, source: { endpoint, terms, fairAccess, urls: [...] },
 *     captures: [ISO, ...],
 *     filings: { <accessionNumber>: {
 *        accessionNumber, form, filingDate, acceptedAt, first_seen_at,
 *        periodOfReport, documentType, schemaVersion, notSubjectToSection16,
 *        url (XML), indexUrl, primaryDoc,
 *        issuer: { cik, name, tradingSymbol },
 *        reportingOwner: { cik, name, isDirector, isOfficer, isTenPercentOwner,
 *                          isOther, officerTitle, otherText },
 *        aff10b5One,
 *        transactions: [ { table, securityTitle, transactionDate, formType,
 *                          code, adCode, shares, price, sharesOwnedAfter,
 *                          directOrIndirect, timeliness } ],
 *        holdings: [ { table, securityTitle, sharesOwned, directOrIndirect } ]
 *     } }
 *   }
 *   A filing is appended once, keyed by accession number; re-captures refresh
 *   nothing but `last_seen_at` on the store. Numbers are stored as numbers and
 *   a blank optional element as null — never as 0.
 *
 * WHO IS TRACKED, AND WHO CANNOT BE
 *   The tracked issuers are derived from the repository's own company-event
 *   series (their `rules_primary` names the company). EDGAR identity is never
 *   hard-coded: the feed is queried by TICKER SYMBOL and the parsed Form 4's
 *   own <issuerTradingSymbol> must equal the expected symbol, so a wrong
 *   resolution fails loudly instead of archiving another company's insiders.
 *   KXOPENAICEOCHANGE is deliberately NOT covered and the reason is published:
 *   OpenAI is a private company, so it has no Section 16 filers at all and that
 *   contract can never receive this signal (IRREGULARITIES.md #57).
 *
 * USAGE
 *   node scripts/archive-form4-signals.mjs            # capture now, append
 *   node scripts/archive-form4-signals.mjs --verify   # offline audit
 *   node scripts/archive-form4-signals.mjs --dry-run  # print the plan, no net
 *
 * NOTE ON THE SANDBOX: sec.gov is not reachable from the build container
 * (irregularity #4), so this script runs from the GitHub-hosted workflow
 * (.github/workflows/form4-signals.yml) exactly like the other archives.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// The DERIVED-signal rules live in the browser-safe store module so the
// archive, the replay, the desk and the static site can never disagree about
// what counts as an open-market trade or a CEO filing.
import { OPEN_MARKET_CODES, filingOpenMarketFlow, isCeoFiling } from '../src/form4-signal-store.js';
export { OPEN_MARKET_CODES, filingOpenMarketFlow, isCeoFiling };

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'form4-signals');
const COMPANIES_DIR = path.join(DATA_DIR, 'companies');
const LAST_RUN_FILE = path.join(DATA_DIR, '_form4-last-run.json');
const BROWSE_ENDPOINT = 'https://www.sec.gov/cgi-bin/browse-edgar';
const ARCHIVES_BASE = 'https://www.sec.gov/Archives/edgar/data';
const TERMS_URL = 'https://www.sec.gov/os/accessing-edgar-data';
const SPEC_URL = 'https://www.sec.gov/info/edgar/ownershipxmltechspec-v3.pdf';
/**
 * SEC fair-access: a declared User-Agent with contact information, and no more
 * than 10 requests/second (https://www.sec.gov/os/accessing-edgar-data). This
 * job makes a handful of requests a day and sleeps between every one.
 */
const USER_AGENT = 'KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim; research contact: buffedlizard55-lab@users.noreply.github.com)';
const REQUEST_PAUSE_MS = 250;
/** Feed page size. 40 covers months of Section 16 activity for one issuer. */
const FEED_COUNT = 40;

/**
 * Tracked issuers. `kalshiSeries` is the evidence link: each series' own
 * `rules_primary` in data/history/ names the company (quoted below verbatim),
 * and the Form 4's own <issuerTradingSymbol> must equal `symbol`.
 */
export const TRACKED_ISSUERS = Object.freeze([
  {
    symbol: 'TSLA',
    kalshiSeries: ['TESLACEOCHANGE', 'KXTESLACEOCHANGE'],
    rulesQuote: 'If Elon Musk is no longer CEO of Tesla by Dec 31, 2026, then the market resolves to Yes. (TESLACEOCHANGE-26 and KXTESLACEOCHANGE-26, data/history/)'
  },
  {
    symbol: 'JPM',
    kalshiSeries: ['JPMCEOCHANGE'],
    rulesQuote: 'If Jamie Dimon is no longer CEO of JPMorgan Chase by Jan 1, 2027, then the market resolves to Yes. (JPMCEOCHANGE-27, data/history/)'
  },
  {
    symbol: 'AAPL',
    kalshiSeries: ['KXAAPLCEOCHANGE'],
    rulesQuote: 'If Tim Cook is no longer CEO of Apple before Jan 1, 2027, then the market resolves to Yes. (KXAAPLCEOCHANGE-26, data/history/ — finalized with the exchange\'s own result "yes")'
  }
]);

/** Published with every store file: what the point-in-time rule assumes. */
export const POINT_IN_TIME_ASSUMPTION =
  'A filing is treated as knowable from EDGAR\'s own acceptance instant (the feed entry\'s <updated>, equal to the filing\'s ACCEPTANCE-DATETIME header). That instant is the publisher\'s timestamp, not a measurement of publication latency made by this repository; `first_seen_at` records when THIS archive captured the filing so the two are never conflated.';

/** Companies deliberately NOT archived, with the reason published. */
export const EXCLUDED_ISSUERS = Object.freeze([
  {
    kalshiSeries: ['KXOPENAICEOCHANGE'],
    reason:
      'OpenAI is a private company: it has no Section 16 reporting persons, so EDGAR holds no Form 4 for it and KXOPENAICEOCHANGE-26 can never receive this signal. Recorded so the absence is a decision, not a gap (IRREGULARITIES.md #57).'
  }
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * TINY XML READER
 * EDGAR's ownership documents are small, flat, namespace-free XML. A
 * dependency-free reader is used deliberately: it must refuse a document it
 * cannot parse rather than guess, so every accessor distinguishes "absent"
 * (null) from "present but empty" ('').
 * ------------------------------------------------------------------ */

/** Every `<tag>…</tag>` block of `xml`, in document order (inner XML). */
export function xmlBlocks(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'g');
  let m;
  while ((m = re.exec(String(xml || ''))) !== null) out.push(m[1]);
  return out;
}

/** Inner text of the first `<tag>`, or null when the element is absent. */
export function xmlText(xml, tag) {
  const re = new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`);
  const m = re.exec(String(xml || ''));
  if (!m) return null;
  return decodeXml(m[1]).trim();
}

/** `<tag><value>X</value></tag>` → 'X'; null when the element is absent. */
export function xmlValue(xml, tag) {
  const blocks = xmlBlocks(xml, tag);
  if (!blocks.length) return null;
  const v = xmlText(blocks[0], 'value');
  return v === null ? null : v;
}

/** The `id` attribute of the first `<footnoteId id="…"/>` inside `xml`. */
export function xmlFootnoteIds(xml) {
  const ids = [];
  const re = /<footnoteId\s+id="([^"]+)"/g;
  let m;
  while ((m = re.exec(String(xml || ''))) !== null) ids.push(m[1]);
  return ids;
}

function decodeXml(s) {
  return String(s)
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&amp;/g, '&');
}

/** '065390.0' → 65390; '' / null / non-numeric → null (never 0). */
export function numOrNull(v) {
  if (v === null || v === undefined || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

/** '0'/'1'/'false'/'true' → boolean; anything else null. */
export function flagOrNull(v) {
  const s = String(v ?? '').trim().toLowerCase();
  if (s === '1' || s === 'true') return true;
  if (s === '0' || s === 'false') return false;
  return null;
}

/* ------------------------------------------------------------------ *
 * ATOM FEED (step 1)
 * ------------------------------------------------------------------ */

export function browseUrl(symbol) {
  const p = new URLSearchParams({
    action: 'getcompany',
    CIK: symbol,
    type: '4',
    dateb: '',
    owner: 'include',
    count: String(FEED_COUNT),
    output: 'atom'
  });
  return `${BROWSE_ENDPOINT}?${p.toString()}`;
}

/**
 * Parse the EDGAR Atom feed. STRICT about what it needs (accession, form,
 * acceptance instant) and deliberately keeps EVERY entry's form type so the
 * caller can prove the `type=4` filter behaved.
 * @returns {{entries: Array, formsSeen: Record<string, number>, companyName: string|null}}
 */
export function parseAtomFeed(xml, url) {
  const entries = [];
  const formsSeen = {};
  for (const block of xmlBlocks(xml, 'entry')) {
    const id = xmlText(block, 'id') || '';
    const accMatch = /accession-number=([0-9]{10}-[0-9]{2}-[0-9]{6})/.exec(id);
    const title = xmlText(block, 'title') || '';
    // "4 - Statement of changes in beneficial ownership of securities"
    const form = String(title.split(' - ')[0] || '').trim();
    formsSeen[form || '(none)'] = (formsSeen[form || '(none)'] || 0) + 1;
    const link = /<link[^>]*href="([^"]+)"/.exec(block);
    const entry = {
      accessionNumber: accMatch ? accMatch[1] : null,
      form: form || null,
      title,
      // <updated> is EDGAR's acceptance instant, e.g. 2026-09-09T19:00:10-04:00
      updated: xmlText(block, 'updated'),
      filingDate: xmlText(block, 'filing-date'),
      indexUrl: link ? decodeXml(link[1]) : null,
      sourceUrl: url
    };
    if (!entry.accessionNumber) throw new Error(`feed ${url}: an <entry> has no accession number in its <id> — feed shape changed?`);
    if (!entry.updated) throw new Error(`feed ${url}: entry ${entry.accessionNumber} has no <updated> (acceptance instant) — feed shape changed?`);
    entries.push(entry);
  }
  const companyName = xmlText(xml, 'company-info>conformed-name') || xmlText(xml, 'conformed-name');
  return { entries, formsSeen, companyName };
}

/* ------------------------------------------------------------------ *
 * FILING DIRECTORY (step 2)
 * ------------------------------------------------------------------ */

export function accessionDir(cik, accessionNumber) {
  return String(accessionNumber).replace(/-/g, '');
}

export function indexJsonUrl(cik, accessionNumber) {
  return `${ARCHIVES_BASE}/${Number(cik)}/${accessionDir(cik, accessionNumber)}/index.json`;
}

/** The primary ownership XML document name from EDGAR's own index.json. */
export function primaryXmlFromIndex(indexJson) {
  const items = (((indexJson || {}).directory || {}).item) || [];
  if (!Array.isArray(items)) throw new Error('index.json: directory.item is not an array — response shape changed?');
  const xmls = items.filter((i) => /\.xml$/i.test(String(i.name || '')));
  if (!xmls.length) throw new Error(`index.json: no .xml document in the filing (${items.map((i) => i.name).join(', ') || 'empty directory'})`);
  // A Form 4 holds exactly one ownership document; if more than one XML is
  // present, prefer a name that looks like the primary document and say so.
  const preferred = xmls.find((i) => /(^|[_-])(form|xsl)?4/i.test(String(i.name))) || xmls[0];
  return { name: preferred.name, alternatives: xmls.map((i) => i.name) };
}

/* ------------------------------------------------------------------ *
 * OWNERSHIP DOCUMENT (step 3)
 * ------------------------------------------------------------------ */

/** One Table I / Table II row → the compact record the store keeps. */
function parseTransactionRow(block, table) {
  const coding = xmlBlocks(block, 'transactionCoding')[0] || '';
  const amounts = xmlBlocks(block, 'transactionAmounts')[0] || '';
  const post = xmlBlocks(block, 'postTransactionAmounts')[0] || '';
  const nature = xmlBlocks(block, 'ownershipNature')[0] || '';
  const code = xmlText(coding, 'transactionCode');
  if (!code) throw new Error(`${table} row: <transactionCode> missing — document shape changed?`);
  return {
    table,
    securityTitle: xmlValue(block, 'securityTitle'),
    transactionDate: xmlValue(block, 'transactionDate'),
    formType: xmlText(coding, 'transactionFormType'),
    code,
    adCode: xmlValue(amounts, 'transactionAcquiredDisposedCode'),
    shares: numOrNull(xmlValue(amounts, 'transactionShares')),
    price: numOrNull(xmlValue(amounts, 'transactionPricePerShare')),
    conversionOrExercisePrice: table === 'derivative' ? numOrNull(xmlValue(block, 'conversionOrExercisePrice')) : null,
    sharesOwnedAfter: numOrNull(xmlValue(post, 'sharesOwnedFollowingTransaction')),
    directOrIndirect: xmlValue(nature, 'directOrIndirectOwnership'),
    natureOfOwnership: xmlValue(nature, 'natureOfOwnership'),
    timeliness: xmlText(block, 'transactionTimeliness') || null,
    equitySwapInvolved: flagOrNull(xmlText(coding, 'equitySwapInvolved')),
    footnoteIds: xmlFootnoteIds(block)
  };
}

function parseHoldingRow(block, table) {
  const post = xmlBlocks(block, 'postTransactionAmounts')[0] || '';
  const nature = xmlBlocks(block, 'ownershipNature')[0] || '';
  return {
    table,
    securityTitle: xmlValue(block, 'securityTitle'),
    sharesOwned: numOrNull(xmlValue(post, 'sharesOwnedFollowingTransaction')),
    directOrIndirect: xmlValue(nature, 'directOrIndirectOwnership'),
    natureOfOwnership: xmlValue(nature, 'natureOfOwnership')
  };
}

/**
 * STRICT parse of one Form 4 ownership document. Refuses a document whose
 * identity fields are missing (documentType, issuer trading symbol, reporting
 * owner, acceptance instant) rather than archiving a half-read filing.
 */
export function parseOwnershipDocument(xml, { accessionNumber, acceptedAt, firstSeenAt, filingDate, indexUrl, primaryDoc, url, expectedSymbol }) {
  const doc = xmlBlocks(xml, 'ownershipDocument')[0];
  if (!doc) throw new Error(`${accessionNumber}: no <ownershipDocument> in the response`);
  const documentType = xmlText(doc, 'documentType');
  if (documentType !== '4') throw new Error(`${accessionNumber}: <documentType> is "${documentType}", not 4 — refusing to archive a different form`);
  const issuer = xmlBlocks(doc, 'issuer')[0] || '';
  const issuerCik = xmlText(issuer, 'issuerCik');
  const issuerName = xmlText(issuer, 'issuerName');
  const tradingSymbol = xmlText(issuer, 'issuerTradingSymbol');
  if (!issuerCik || !tradingSymbol) throw new Error(`${accessionNumber}: <issuer> is missing issuerCik/issuerTradingSymbol — document shape changed?`);
  if (expectedSymbol && tradingSymbol.toUpperCase() !== String(expectedSymbol).toUpperCase()) {
    throw new Error(`${accessionNumber}: issuer trading symbol is "${tradingSymbol}" but this store tracks "${expectedSymbol}" — refusing to mix issuers`);
  }
  const owner = xmlBlocks(doc, 'reportingOwner')[0] || '';
  const ownerId = xmlBlocks(owner, 'reportingOwnerId')[0] || '';
  const rel = xmlBlocks(owner, 'reportingOwnerRelationship')[0] || '';
  const rptOwnerCik = xmlText(ownerId, 'rptOwnerCik');
  if (!rptOwnerCik) throw new Error(`${accessionNumber}: <rptOwnerCik> missing — document shape changed?`);

  const transactions = [
    ...xmlBlocks(xmlBlocks(doc, 'nonDerivativeTable')[0] || '', 'nonDerivativeTransaction').map((b) => parseTransactionRow(b, 'nonDerivative')),
    ...xmlBlocks(xmlBlocks(doc, 'derivativeTable')[0] || '', 'derivativeTransaction').map((b) => parseTransactionRow(b, 'derivative'))
  ];
  const holdings = [
    ...xmlBlocks(xmlBlocks(doc, 'nonDerivativeTable')[0] || '', 'nonDerivativeHolding').map((b) => parseHoldingRow(b, 'nonDerivative')),
    ...xmlBlocks(xmlBlocks(doc, 'derivativeTable')[0] || '', 'derivativeHolding').map((b) => parseHoldingRow(b, 'derivative'))
  ];

  return {
    accessionNumber,
    form: '4',
    filingDate: filingDate || null,
    acceptedAt,
    first_seen_at: firstSeenAt,
    last_seen_at: firstSeenAt,
    periodOfReport: xmlText(doc, 'periodOfReport'),
    documentType,
    schemaVersion: xmlText(doc, 'schemaVersion'),
    notSubjectToSection16: flagOrNull(xmlText(doc, 'notSubjectToSection16')),
    aff10b5One: flagOrNull(xmlText(doc, 'aff10b5One')),
    url,
    indexUrl,
    primaryDoc,
    issuer: { cik: String(issuerCik).replace(/^0+/, '') || String(issuerCik), name: issuerName, tradingSymbol },
    reportingOwner: {
      cik: String(rptOwnerCik).replace(/^0+/, '') || String(rptOwnerCik),
      name: xmlText(ownerId, 'rptOwnerName'),
      isDirector: flagOrNull(xmlText(rel, 'isDirector')),
      isOfficer: flagOrNull(xmlText(rel, 'isOfficer')),
      isTenPercentOwner: flagOrNull(xmlText(rel, 'isTenPercentOwner')),
      isOther: flagOrNull(xmlText(rel, 'isOther')),
      officerTitle: xmlText(rel, 'officerTitle'),
      otherText: xmlText(rel, 'otherText')
    },
    transactions,
    holdings
  };
}

/* ------------------------------------------------------------------ *
 * DERIVED SIGNAL FACTS (the numbers a strategy is allowed to read)
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * DERIVED SIGNAL FACTS
 * `OPEN_MARKET_CODES`, `filingOpenMarketFlow()` and `isCeoFiling()` are
 * imported from src/form4-signal-store.js (single implementation, re-exported
 * above) so the writer and the reader can never drift apart.
 * ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ *
 * STORE MERGE (pure — unit-tested without a network)
 * ------------------------------------------------------------------ */

export function emptyStore({ symbol, kalshiSeries, rulesQuote }) {
  return {
    symbol,
    edgarQuery: symbol,
    cik: null,
    issuerName: null,
    what: 'Point-in-time archive of SEC Form 4 (Section 16 insider transaction) filings for one issuer, captured from EDGAR itself',
    kalshiSeries: kalshiSeries || [],
    rulesQuote: rulesQuote || null,
    assumption: POINT_IN_TIME_ASSUMPTION,
    source: {
      endpoint: BROWSE_ENDPOINT,
      archives: ARCHIVES_BASE,
      terms: TERMS_URL,
      spec: SPEC_URL,
      fairAccess: 'Declared User-Agent with contact information; <= 10 requests/second; one request per issuer per run plus one per new filing',
      userAgent: USER_AGENT,
      urls: []
    },
    captures: [],
    filings: {}
  };
}

/**
 * Append one run's filings into a store. Pure on its inputs so the unit tests
 * exercise the merge without a network.
 * @returns {{store:object, added:number, refreshed:number}}
 */
export function mergeFilings(store, { symbol, kalshiSeries, rulesQuote, cik, issuerName, filings, urls, capturedAt }) {
  const next = store && store.filings ? structuredClone(store) : emptyStore({ symbol, kalshiSeries, rulesQuote });
  next.symbol = symbol;
  next.kalshiSeries = kalshiSeries || next.kalshiSeries || [];
  next.rulesQuote = rulesQuote || next.rulesQuote || null;
  next.cik = cik || next.cik || null;
  next.issuerName = issuerName || next.issuerName || null;
  next.captures = Array.isArray(next.captures) ? next.captures : [];
  if (capturedAt && next.captures[next.captures.length - 1] !== capturedAt) next.captures.push(capturedAt);
  next.filings = next.filings || {};
  let added = 0;
  let refreshed = 0;
  for (const f of filings || []) {
    const key = f.accessionNumber;
    if (next.filings[key]) {
      next.filings[key].last_seen_at = capturedAt;
      refreshed += 1;
    } else {
      next.filings[key] = f;
      added += 1;
    }
  }
  const urlSet = new Set(next.source.urls || []);
  for (const u of urls || []) if (u && !urlSet.has(u)) next.source.urls.push(u);
  return { store: next, added, refreshed };
}

/* ------------------------------------------------------------------ *
 * NETWORK
 * ------------------------------------------------------------------ */

async function fetchText(url, what, accept) {
  let lastError = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    let res;
    try {
      res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: accept || '*/*' }, signal: AbortSignal.timeout(30_000) });
    } catch (err) {
      const cause = err && err.cause ? ` (cause=${err.cause.code || err.cause.message || err.cause})` : '';
      lastError = `network: ${err && err.message ? err.message : String(err)}${cause}`;
      if (attempt < 3) {
        await sleep(5_000 * attempt);
        continue;
      }
      throw new Error(`${what}: ${lastError}`);
    }
    const text = await res.text();
    if (!res.ok) {
      lastError = `HTTP ${res.status} — body head: ${text.slice(0, 160)}`;
      if ((res.status === 403 || res.status === 429 || res.status >= 500) && attempt < 3) {
        await sleep(5_000 * attempt);
        continue;
      }
      throw new Error(`${what}: ${lastError}`);
    }
    return { text, http_status: res.status };
  }
  throw new Error(`${what}: exhausted retries — ${lastError}`);
}

/* ------------------------------------------------------------------ *
 * CLI
 * ------------------------------------------------------------------ */

export async function captureNow({ issuers = TRACKED_ISSUERS, now = new Date(), log = console.log } = {}) {
  const capturedAt = now.toISOString();
  const requests = [];
  const out = { capturedAt, issuers: [], failures: 0, requests };

  for (const issuer of issuers) {
    const row = { symbol: issuer.symbol, kalshiSeries: issuer.kalshiSeries, filingsAdded: 0, filingsSeen: 0, formsSeen: {}, errors: [] };
    out.issuers.push(row);
    const file = path.join(COMPANIES_DIR, `${issuer.symbol}.json`);
    const existing = readJsonSafe(file);
    const known = new Set(Object.keys((existing && existing.filings) || {}));
    let store = existing || emptyStore(issuer);

    let feed;
    try {
      const url = browseUrl(issuer.symbol);
      requests.push({ url, what: 'atom-feed' });
      const { text } = await fetchText(url, `EDGAR atom feed for ${issuer.symbol}`, 'application/atom+xml');
      feed = parseAtomFeed(text, url);
      row.formsSeen = feed.formsSeen;
      row.companyName = feed.companyName;
      await sleep(REQUEST_PAUSE_MS);
    } catch (err) {
      row.errors.push(String(err && err.message ? err.message : err));
      out.failures += 1;
      continue;
    }

    // The feed is treated as UNFILTERED (the type=4 filter is not trusted —
    // see the header). Only form 4 entries are archived.
    const fourEntries = feed.entries.filter((e) => e.form === '4');
    row.filingsSeen = fourEntries.length;
    row.feedEntries = feed.entries.length;
    const fresh = fourEntries.filter((e) => !known.has(e.accessionNumber));
    log(`• ${issuer.symbol}: ${feed.entries.length} feed entries, ${fourEntries.length} form 4, ${fresh.length} new`);

    const parsed = [];
    const urls = [browseUrl(issuer.symbol)];
    for (const entry of fresh) {
      try {
        const iUrl = indexJsonUrl(entry.accessionNumber.match(/^(\d+)-/) ? Number(entry.accessionNumber.split('-')[0]) : 0, entry.accessionNumber);
        requests.push({ url: iUrl, what: 'filing-index' });
        const idx = await fetchText(iUrl, `index.json for ${entry.accessionNumber}`, 'application/json');
        const indexJson = JSON.parse(idx.text);
        const primary = primaryXmlFromIndex(indexJson);
        const cikPath = String(iUrl).split('/data/')[1].split('/')[0];
        const xUrl = `${ARCHIVES_BASE}/${cikPath}/${accessionDir(cikPath, entry.accessionNumber)}/${primary.name}`;
        requests.push({ url: xUrl, what: 'ownership-document' });
        await sleep(REQUEST_PAUSE_MS);
        const docRes = await fetchText(xUrl, `ownership document ${entry.accessionNumber}`, 'application/xml,text/xml');
        const rec = parseOwnershipDocument(docRes.text, {
          accessionNumber: entry.accessionNumber,
          acceptedAt: entry.updated,
          firstSeenAt: capturedAt,
          filingDate: entry.filingDate,
          indexUrl: entry.indexUrl,
          primaryDoc: primary.name,
          url: xUrl,
          expectedSymbol: issuer.symbol
        });
        parsed.push(rec);
        urls.push(xUrl);
        await sleep(REQUEST_PAUSE_MS);
      } catch (err) {
        row.errors.push(`${entry.accessionNumber}: ${err && err.message ? err.message : err}`);
        out.failures += 1;
      }
    }

    const merged = mergeFilings(store, {
      symbol: issuer.symbol,
      kalshiSeries: issuer.kalshiSeries,
      rulesQuote: issuer.rulesQuote,
      cik: parsed.length ? parsed[0].issuer.cik : null,
      issuerName: parsed.length ? parsed[0].issuer.name : feed.companyName,
      filings: parsed,
      urls,
      capturedAt
    });
    row.filingsAdded = merged.added;
    row.filingsRefreshed = merged.refreshed;
    store = merged.store;
    fs.mkdirSync(COMPANIES_DIR, { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(store, null, 1)}\n`);
    log(`  → ${path.relative(ROOT, file)}: +${merged.added} filing(s), ${Object.keys(store.filings).length} total, ${store.captures.length} capture(s)`);
  }

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(LAST_RUN_FILE, `${JSON.stringify(out, null, 1)}\n`);
  log(`run report → ${path.relative(ROOT, LAST_RUN_FILE)} (${out.failures} failure(s))`);
  return out;
}

/** Offline audit of the archive. Exits non-zero when a row is not honest. */
export function verifyStore({ dir = COMPANIES_DIR, log = console.log } = {}) {
  const problems = [];
  const rows = [];
  if (!fs.existsSync(dir)) {
    log('no Form 4 archive yet — nothing to audit (the workflow has not run)');
    return { ok: true, problems, rows };
  }
  for (const file of fs.readdirSync(dir).sort()) {
    if (!file.endsWith('.json')) continue;
    const store = readJsonSafe(path.join(dir, file));
    if (!store) {
      problems.push(`${file}: unreadable JSON`);
      continue;
    }
    const filings = Object.values(store.filings || {});
    let badOrder = 0;
    let missingAccepted = 0;
    let wrongSymbol = 0;
    let ceoFilings = 0;
    let openMarket = 0;
    for (const f of filings) {
      if (!f.acceptedAt) missingAccepted += 1;
      else if (f.first_seen_at && Date.parse(f.first_seen_at) + 1000 < Date.parse(f.acceptedAt)) badOrder += 1; // captured before it existed
      if (f.issuer && store.symbol && String(f.issuer.tradingSymbol).toUpperCase() !== String(store.symbol).toUpperCase()) wrongSymbol += 1;
      if (isCeoFiling(f)) ceoFilings += 1;
      const flow = filingOpenMarketFlow(f);
      if (flow.buys || flow.sells) openMarket += 1;
    }
    if (missingAccepted) problems.push(`${file}: ${missingAccepted} filing(s) without an acceptance instant`);
    if (badOrder) problems.push(`${file}: ${badOrder} filing(s) captured before their own acceptance instant`);
    if (wrongSymbol) problems.push(`${file}: ${wrongSymbol} filing(s) whose issuer trading symbol is not ${store.symbol}`);
    rows.push({
      file,
      symbol: store.symbol,
      cik: store.cik,
      issuerName: store.issuerName,
      kalshiSeries: store.kalshiSeries,
      filings: filings.length,
      ceoFilings,
      filingsWithOpenMarketTrades: openMarket,
      captures: (store.captures || []).length,
      firstCapture: (store.captures || [])[0] || null,
      lastCapture: (store.captures || []).slice(-1)[0] || null,
      oldestFiling: filings.map((f) => f.acceptedAt).filter(Boolean).sort()[0] || null,
      newestFiling: filings.map((f) => f.acceptedAt).filter(Boolean).sort().slice(-1)[0] || null
    });
    log(`• ${file}: ${filings.length} filing(s), ${ceoFilings} by a CEO-titled officer, ${openMarket} with open-market P/S trades, ${store.captures?.length || 0} capture(s)`);
  }
  if (!rows.length) log('archive directory exists but holds no company store');
  for (const p of problems) log(`✗ ${p}`);
  return { ok: problems.length === 0, problems, rows };
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  if (args.includes('--dry-run')) {
    console.log('Form 4 archive plan (no network):');
    for (const i of TRACKED_ISSUERS) console.log(`  • ${i.symbol} ← ${browseUrl(i.symbol)}  → data/form4-signals/companies/${i.symbol}.json  (Kalshi: ${i.kalshiSeries.join(', ')})`);
    for (const e of EXCLUDED_ISSUERS) console.log(`  ✗ NOT ARCHIVED ${e.kalshiSeries.join(', ')} — ${e.reason}`);
    console.log(`  point-in-time assumption: ${POINT_IN_TIME_ASSUMPTION}`);
  } else if (args.includes('--verify')) {
    const v = verifyStore();
    process.exit(v.ok ? 0 : 1);
  } else {
    const out = await captureNow();
    process.exit(out.failures ? 1 : 0);
  }
}
