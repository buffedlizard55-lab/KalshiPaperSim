#!/usr/bin/env node
/**
 * KalshiPaperSim — Point-in-Time FDA (Drugs@FDA) Signal Archive
 * =====================================================================
 * ROADMAP item "a point-in-time signal archive for a sports or FDA project":
 * this is the FDA half, closed with an OFFICIAL, keyless, machine-readable
 * source instead of a screen-scrape.
 *
 * WHY THIS EXISTS
 *   The FDA markets this repository tracks (KXFDAAPPROVALDATECMPS,
 *   KXFDARETATRUTIDE, KXFDAAPPROVE-*) resolve on whether the FDA approves a
 *   named drug by a date. An honest strategy on them needs to know WHAT WAS
 *   KNOWABLE about the approval state at decision time. Re-reading today's
 *   Drugs@FDA state for a past decision is a lookahead — the database is
 *   re-read, not re-run. So this job captures the official state several
 *   times a day and appends each capture, time-stamped, to a store the replay
 *   can query point-in-time (src/fda-signal-store.js enforces the rule).
 *
 * THE SOURCE (official, free, no key)
 *   GET https://api.open.fda.gov/drug/drugsfda.json?search=<query>&limit=1000
 *   — openFDA's Drugs@FDA endpoint: FDA's own database of drug applications,
 *   with products[] (brand_name, marketing_status, active_ingredients) and
 *   submissions[] (submission_type, submission_status, submission_status_date).
 *   Response shape verified against openFDA's published API documentation and
 *   two independent integrations of it on 2026-09-19 (VERIFICATION.md); the
 *   parser below fails loudly on an unexpected shape and records the raw
 *   counts so a human can re-check the URL.
 *
 * WHAT IS ARCHIVED PER SNAPSHOT (data/fda-signals/<slug>.json)
 *   { captured_at, url, http_status,
 *     meta: { disclaimer, last_updated, total },     // verbatim from openFDA
 *     state: 'NO_RECORD' | 'RECORD_NO_APPROVED_PRODUCT' | 'APPROVED',
 *     approved,                                       // the derived boolean
 *     marketingStatuses,                              // verbatim distinct strings
 *     applications, newestSubmissionStatusDate }
 *
 * THE DERIVED `approved` (stated, not implied): any product's verbatim
 * marketing_status is exactly 'Prescription' or 'Over-the-counter' — the two
 * APPROVED-MARKETED states in the official Drugs@FDA vocabulary (glossary of
 * terms, fda.gov; the Orange Book preface calls them the "Active Section").
 * 'Discontinued' (approved but not marketed, incl. withdrawn approvals) and
 * 'None' (tentatively approved) do NOT count. The verbatim strings are
 * archived alongside so a human can re-check the derivation against the
 * source. "Approved" here means the DATABASE lists an approved marketed
 * product — the same fact a Drugs@FDA user would look up.
 *
 * SUBJECTS: one per FDA series this repository actually tracks, with the
 * search query taken from THE MARKET'S OWN RULES TEXT (quoted in each
 * subject's ruleQuote). Two tracked FDA series are deliberately EXCLUDED:
 * KXFDAANNOUNCE (BPC-157 Bulk Drug Substances reclassification — an FDA
 * announcement, not a Drugs@FDA record) and KXFDAAPPROVALPSYCHEDELIC (a
 * composite "any psychedelic" — the union of several applications). Both
 * exclusions are recorded in the EXCLUDED block below with their reasons.
 *
 * BASIS MISMATCH, STATED UP FRONT
 *   Drugs@FDA is updated by FDA staff after a decision; a record flip can lag
 *   the announcement the market resolves on. The lag is a real property of
 *   this signal — the strategy publishes it, and the archive timestamps every
 *   snapshot so the lag is measurable after the fact.
 *
 * USAGE
 *   node scripts/archive-fda-signals.mjs             # capture now, append store
 *   node scripts/archive-fda-signals.mjs --verify   # offline audit of the store
 *   node scripts/archive-fda-signals.mjs --dry-run  # no network, print the plan
 *
 * NOTE ON THE SANDBOX: api.open.fda.gov is not reachable from the build
 * container (only github.com egress works there). This script runs from the
 * GitHub-hosted workflow (.github/workflows/fda-signals.yml).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data', 'fda-signals');
const ENDPOINT = 'https://api.open.fda.gov/drug/drugsfda.json';
const USER_AGENT = 'KalshiPaperSim/1.0 (https://github.com/buffedlizard55-lab/KalshiPaperSim)';
/** Keep the newest N snapshots per subject (4/day x 365 days ≈ 1460; headroom). */
const MAX_SNAPSHOTS = 2000;
/** Unauthenticated openFDA allows a small request rate; stay far inside it. */
const INTER_REQUEST_SLEEP_MS = 13_000;

/**
 * THE SUBJECTS. `ruleQuote` is verbatim from the tracked market's own
 * rules_primary (data/history/<ticker>.json, captured from
 * GET /markets/{ticker}) — the archive is configured from what the exchange
 * says it settles on, never from an outside summary.
 */
const SUBJECTS = [
  {
    slug: 'comp360-psilocybin',
    label: 'COMP360 psilocybin (Compass Pathways) — treatment-resistant depression',
    query: 'sponsor_name:"compass pathways"',
    markets: ['KXFDAAPPROVALDATECMPS-360-27JAN01', 'KXFDAAPPROVALDATECMPS-360-27MAR01', 'KXFDAAPPROVALDATECMPS-360-27JUL01', 'KXFDAAPPROVALDATECMPS-360-27OCT01', 'KXFDAAPPROVALDATECMPS-360-28JAN01'],
    ruleQuote:
      'KXFDAAPPROVALDATECMPS-360-*: "If the FDA approves COMP360 Psilocybin for Treatment-Resistant Depression for marketing before <date>, then the market resolves to Yes."'
  },
  {
    slug: 'retatrutide',
    label: 'Retatrutide (LY3437943, Eli Lilly)',
    query: 'products.active_ingredients.name:"retatrutide"',
    markets: ['KXFDARETATRUTIDE-RET-27JAN01', 'KXFDARETATRUTIDE-RET-27JUL01', 'KXFDARETATRUTIDE-RET-28JAN01', 'KXFDARETATRUTIDE-RET-28JUL01', 'KXFDARETATRUTIDE-RET-29JAN01'],
    ruleQuote:
      'KXFDARETATRUTIDE-RET-*: "If the FDA approves retatrutide (LY3437943) for marketing before <date>, then the market resolves to Yes."'
  },
  {
    slug: 'camizestrant',
    label: 'Camizestrant (HR+/HER2- advanced breast cancer, ESR1 mutation)',
    query: 'products.active_ingredients.name:"camizestrant"',
    markets: ['KXFDAAPPROVE-CAM-26OCT01', 'KXFDAAPPROVE-CAM-27JAN01'],
    ruleQuote:
      'KXFDAAPPROVE-CAM-*: "If the FDA approves camizestrant for HR+/HER2- advanced breast cancer with ESR1 mutation for marketing before <date>, then the market resolves to Yes." (Both tracked brackets are already finalized yes — the archive still records the database state, which is what future dated brackets would trade on.)'
  },
  {
    slug: 'cytisinicline',
    label: 'Cytisinicline (smoking cessation)',
    query: 'products.active_ingredients.name:"cytisinicline"',
    markets: ['KXFDAAPPROVE-CYT-26OCT01'],
    ruleQuote:
      'KXFDAAPPROVE-CYT-26OCT01: "If the FDA approves cytisinicline for smoking cessation for marketing before Oct 1, 2026, then the market resolves to Yes."'
  },
  {
    slug: 'gedatolisib',
    label: 'Gedatolisib (HR+/HER2-, PIK3CA wild-type advanced breast cancer)',
    query: 'products.active_ingredients.name:"gedatolisib"',
    markets: ['KXFDAAPPROVE-GED-26AUG01'],
    ruleQuote:
      'KXFDAAPPROVE-GED-26AUG01: "If the FDA approves gedatolisib for HR+/HER2-, PIK3CA wild-type advanced breast cancer for marketing before Aug 1, 2026, then the market resolves to Yes." (Finalized yes; archived for the record.)'
  },
  {
    slug: 'midomafetamine-mdma',
    label: 'Midomafetamine / MDMA (PTSD)',
    query: 'products.active_ingredients.name:"midomafetamine"',
    markets: ['KXFDAAPPROVE-MDMA-30JAN01'],
    ruleQuote:
      'KXFDAAPPROVE-MDMA-30JAN01: "If the FDA approves midomafetamine / MDMA for PTSD for marketing before Jan 1, 2030, then the market resolves to Yes."'
  }
];

/**
 * Tracked FDA series this archive deliberately does NOT cover, with the
 * reason. Published so an absence is never mistaken for an oversight.
 */
const EXCLUDED = [
  {
    series: 'KXFDAANNOUNCE',
    markets: ['KXFDAANNOUNCE-BPC-26SEP01', 'KXFDAANNOUNCE-BPC-26NOV01', 'KXFDAANNOUNCE-BPC-27JAN01'],
    reason:
      'Resolves on an FDA ANNOUNCEMENT ("Reclassification of BPC-157 to Category 1 of the Bulk Drug Substances List"), not on a Drugs@FDA application record. The official machine-readable source for that list is the FDA Bulk Drug Substances page (a human-curated page, not a documented API), so no honest query exists here yet.'
  },
  {
    series: 'KXFDAAPPROVALPSYCHEDELIC',
    markets: ['KXFDAAPPROVALPSYCHEDELIC-27-ANYPSYCH'],
    reason:
      'A composite ("any psychedelic substance") — the union of several independent applications. The honest composite signal would be the union of per-subject archives; until more psychedelic subjects are tracked individually, the composite would silently depend on this configuration rather than on data.'
  }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function readJsonSafe(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * THE DERIVED `approved` FLAG — from the OFFICIAL vocabulary, not a guess.
 * The Drugs@FDA Glossary of Terms (fda.gov) defines Marketing Status exactly:
 * "Drug products in Drugs@FDA are identified as: Prescription,
 * Over-the-counter, Discontinued, None (tentatively approved)". The Orange
 * Book preface calls Prescription + OTC the "Active Section" — the approved,
 * marketed products. So `approved` is an exact, case-insensitive match of a
 * verbatim status against those two APPROVED-MARKETED states:
 *   'Prescription' / 'Over-the-counter' → approved
 *   'Discontinued'  → an approved product NOT currently marketed (which per
 *                     the same glossary also covers withdrawn approvals), so
 *                     NOT counted as approved-for-marketing here
 *   'None'          → tentatively approved only — NOT approved
 * The verbatim strings are archived next to the flag so a human can re-check
 * the derivation against the source at any time.
 */
const APPROVED_MARKETING_STATUSES = ['prescription', 'over-the-counter'];
const MARKETING_STATUS_GLOSSARY = 'https://www.fda.gov/drugs/drug-approvals-and-databases/drugsfda-glossary-terms';

function deriveApproved(products) {
  const statuses = new Set();
  for (const p of products || []) {
    const s = p && p.marketing_status;
    if (typeof s === 'string' && s.trim()) statuses.add(s.trim());
  }
  const list = [...statuses];
  return {
    marketingStatuses: list,
    approved: list.some((s) => APPROVED_MARKETING_STATUSES.includes(s.toLowerCase()))
  };
}

/** Strict parser: refuse an unexpected shape rather than guess. */
function parseResponse(json) {
  if (!json || typeof json !== 'object') throw new Error('response is not a JSON object');
  const meta = json.meta || {};
  const results = Array.isArray(json.results) ? json.results : [];
  const total = meta?.results?.total;
  if (!Number.isFinite(Number(total))) throw new Error('meta.results.total missing — shape changed?');
  const applications = [];
  const marketingStatuses = new Set();
  let approved = false;
  let newestSubmissionStatusDate = null;
  for (const r of results) {
    const app = {
      application_number: r.application_number ?? null,
      sponsor_name: r.sponsor_name ?? null
    };
    const { marketingStatuses: ms, approved: a } = deriveApproved(r.products);
    for (const s of ms) marketingStatuses.add(s);
    if (a) approved = true;
    for (const sub of r.submissions || []) {
      const d = sub && sub.submission_status_date;
      if (typeof d === 'string' && (!newestSubmissionStatusDate || d > newestSubmissionStatusDate)) newestSubmissionStatusDate = d;
    }
    applications.push(app);
  }
  const distinct = [...marketingStatuses];
  return {
    disclaimer: meta.disclaimer ?? null,
    lastUpdated: meta.last_updated ?? null,
    total: Number(total),
    applications,
    marketingStatuses: distinct,
    approved,
    newestSubmissionStatusDate,
    state: Number(total) === 0 ? 'NO_RECORD' : approved ? 'APPROVED' : 'RECORD_NO_APPROVED_PRODUCT'
  };
}

async function capture(subject) {
  const url = `${ENDPOINT}?search=${encodeURIComponent(subject.query)}&limit=1000`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  const bodyText = await res.text();
  let json = null;
  try {
    json = JSON.parse(bodyText);
  } catch {
    throw new Error(`subject ${subject.slug}: HTTP ${res.status} with a non-JSON body (first 200 chars: ${bodyText.slice(0, 200)})`);
  }
  if (!res.ok) {
    // openFDA returns JSON errors (e.g. rate limit) — record and fail loudly.
    const msg = json?.error?.message ? ` — ${String(json.error.message).slice(0, 200)}` : '';
    throw new Error(`subject ${subject.slug}: HTTP ${res.status}${msg}`);
  }
  const parsed = parseResponse(json);
  return {
    captured_at: new Date().toISOString(),
    url,
    http_status: res.status,
    meta: { disclaimer: parsed.disclaimer, last_updated: parsed.lastUpdated, total: parsed.total },
    state: parsed.state,
    approved: parsed.approved,
    marketingStatuses: parsed.marketingStatuses,
    applications: parsed.applications.length,
    applicationNumbers: parsed.applications.map((a) => a.application_number).filter(Boolean).slice(0, 20),
    newestSubmissionStatusDate: parsed.newestSubmissionStatusDate
  };
}

function storePath(slug) {
  return path.join(DATA_DIR, `${slug}.json`);
}

function appendSnapshot(subject, snapshot) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = storePath(subject.slug);
  const store = readJsonSafe(p) || {
    slug: subject.slug,
    subject: {
      label: subject.label,
      query: subject.query,
      markets: subject.markets,
      ruleQuote: subject.ruleQuote
    },
    what:
      'Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.',
    endpoint: ENDPOINT,
    snapshots: [],
    trims: []
  };
  const prior = store.snapshots[store.snapshots.length - 1] || null;
  const changed =
    !prior || prior.state !== snapshot.state || prior.meta?.total !== snapshot.meta?.total || prior.newestSubmissionStatusDate !== snapshot.newestSubmissionStatusDate;
  store.snapshots.push(snapshot);
  const dropped = Math.max(0, store.snapshots.length - MAX_SNAPSHOTS);
  if (dropped > 0) {
    store.trims.push({ at: snapshot.captured_at, droppedOldest: dropped });
    store.snapshots = store.snapshots.slice(-MAX_SNAPSHOTS);
  }
  fs.writeFileSync(p, `${JSON.stringify(store, null, 2)}\n`);
  return { changed, priorState: prior?.state ?? null, snapshots: store.snapshots.length };
}

function verify() {
  if (!fs.existsSync(DATA_DIR)) {
    console.log('verify: no data/fda-signals directory yet — nothing to audit (the first scheduled run creates it).');
    return 0;
  }
  let subjects = 0;
  let snapshots = 0;
  let problems = 0;
  for (const file of fs.readdirSync(DATA_DIR).sort()) {
    if (!file.endsWith('.json') || file.startsWith('_')) continue;
    const store = readJsonSafe(path.join(DATA_DIR, file));
    if (!store || !Array.isArray(store.snapshots)) {
      console.error(`verify: ${file} is not a readable store — FAIL`);
      problems += 1;
      continue;
    }
    subjects += 1;
    let last = null;
    for (const s of store.snapshots) {
      snapshots += 1;
      const t = Date.parse(s.captured_at);
      if (!Number.isFinite(t)) {
        console.error(`verify: ${file} snapshot without a valid captured_at — FAIL`);
        problems += 1;
      }
      if (last !== null && t < last) {
        console.error(`verify: ${file} snapshots are not in time order at ${s.captured_at} — FAIL`);
        problems += 1;
      }
      last = t;
      if (!['NO_RECORD', 'RECORD_NO_APPROVED_PRODUCT', 'APPROVED'].includes(s.state)) {
        console.error(`verify: ${file} snapshot ${s.captured_at} has unknown state "${s.state}" — FAIL`);
        problems += 1;
      }
      if (typeof s.approved !== 'boolean') {
        console.error(`verify: ${file} snapshot ${s.captured_at} has no boolean approved flag — FAIL`);
        problems += 1;
      }
      if (!s.url || !s.url.startsWith(ENDPOINT)) {
        console.error(`verify: ${file} snapshot ${s.captured_at} does not carry the official endpoint URL — FAIL`);
        problems += 1;
      }
    }
    console.log(`verify: ${file} — ${store.snapshots.length} snapshot(s), state ${store.snapshots.length ? store.snapshots[store.snapshots.length - 1].state : 'n/a'}`);
  }
  console.log(`verify: ${subjects} subject(s), ${snapshots} snapshot(s), ${problems} problem(s)`);
  return problems === 0 ? 0 : 1;
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--verify')) return verify();
  if (args.includes('--dry-run')) {
    console.log(`dry-run: would query ${ENDPOINT} for ${SUBJECTS.length} subject(s):`);
    for (const s of SUBJECTS) console.log(`  ${s.slug} ← search=${s.query}`);
    for (const e of EXCLUDED) console.log(`  (excluded: ${e.series} — ${e.reason.slice(0, 90)}...)`);
    console.log(`dry-run: appends to ${path.relative(ROOT, DATA_DIR)}/<slug>.json; sleeps ${INTER_REQUEST_SLEEP_MS}ms between queries.`);
    return 0;
  }

  let failures = 0;
  for (let i = 0; i < SUBJECTS.length; i++) {
    const subject = SUBJECTS[i];
    try {
      const snapshot = await capture(subject);
      const { changed, priorState, snapshots } = appendSnapshot(subject, snapshot);
      console.log(
        `${subject.slug}: ${snapshot.state} (total=${snapshot.meta.total}, approved=${snapshot.approved})` +
          `${changed ? ' CHANGED' : ''}${priorState && priorState !== snapshot.state ? ` [was ${priorState}]` : ''} — ${snapshots} snapshot(s) archived`
      );
    } catch (err) {
      failures += 1;
      console.error(`✗ ${err.message}`);
    }
    if (i < SUBJECTS.length - 1) await sleep(INTER_REQUEST_SLEEP_MS);
  }
  if (failures > 0) {
    console.error(`${failures} subject capture(s) failed — the store keeps whatever succeeded; re-run the workflow for the rest.`);
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

export { SUBJECTS, EXCLUDED, parseResponse, deriveApproved, ENDPOINT, APPROVED_MARKETING_STATUSES, MARKETING_STATUS_GLOSSARY };
