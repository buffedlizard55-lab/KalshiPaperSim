/**
 * KalshiPaperSim — Point-in-Time FDA Signal Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from data/fda-signals/*.json,
 * which scripts/archive-fda-signals.mjs grows from the official openFDA
 * Drugs@FDA API (api.fda.gov/drug/drugsfda.json — FDA's own database) on
 * the fda-signals workflow schedule.
 *
 * Each snapshot is VERBATIM what the archive derived from the official
 * response at captured_at — the point-in-time record an FDA strategy is
 * allowed to read. Read it only through src/fda-signal-store.js, which
 * refuses any snapshot captured AFTER the decision time (the anti-lookahead
 * rule).
 *
 * 6 subject(s) · 26 shipped snapshot(s) · generated 2026-09-20T16:38:15.554Z
 */

export const FDA_SIGNAL_DATA = {
 "generatedAt": "2026-09-20T16:38:15.554Z",
 "present": true,
 "subjects": {
  "camizestrant": {
   "subject": {
    "label": "Camizestrant (HR+/HER2- advanced breast cancer, ESR1 mutation)",
    "query": "products.active_ingredients.name:\"camizestrant\"",
    "markets": [
     "KXFDAAPPROVE-CAM-26OCT01",
     "KXFDAAPPROVE-CAM-27JAN01"
    ],
    "ruleQuote": "KXFDAAPPROVE-CAM-*: \"If the FDA approves camizestrant for HR+/HER2- advanced breast cancer with ESR1 mutation for marketing before <date>, then the market resolves to Yes.\" (Both tracked brackets are already finalized yes — the archive still records the database state, which is what future dated brackets would trade on.)"
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 5,
   "shippedSnapshots": 5,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:54:55.650Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA220359"
     ],
     "newestSubmissionStatusDate": "20260904"
    },
    {
     "captured_at": "2026-09-19T20:58:17.353Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA220359"
     ],
     "newestSubmissionStatusDate": "20260904"
    },
    {
     "captured_at": "2026-09-19T21:10:41.347Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA220359"
     ],
     "newestSubmissionStatusDate": "20260904"
    },
    {
     "captured_at": "2026-09-20T04:45:38.269Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA220359"
     ],
     "newestSubmissionStatusDate": "20260904"
    },
    {
     "captured_at": "2026-09-20T15:58:30.287Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA220359"
     ],
     "newestSubmissionStatusDate": "20260904"
    }
   ]
  },
  "comp360-psilocybin": {
   "subject": {
    "label": "COMP360 psilocybin (Compass Pathways) — treatment-resistant depression",
    "query": "sponsor_name:\"compass pathways\"",
    "markets": [
     "KXFDAAPPROVALDATECMPS-360-27JAN01",
     "KXFDAAPPROVALDATECMPS-360-27MAR01",
     "KXFDAAPPROVALDATECMPS-360-27JUL01",
     "KXFDAAPPROVALDATECMPS-360-27OCT01",
     "KXFDAAPPROVALDATECMPS-360-28JAN01"
    ],
    "ruleQuote": "KXFDAAPPROVALDATECMPS-360-*: \"If the FDA approves COMP360 Psilocybin for Treatment-Resistant Depression for marketing before <date>, then the market resolves to Yes.\""
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:57:50.327Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=sponsor_name%3A%22compass%20pathways%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-19T21:10:14.537Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=sponsor_name%3A%22compass%20pathways%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T04:45:09.054Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=sponsor_name%3A%22compass%20pathways%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T15:58:03.992Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=sponsor_name%3A%22compass%20pathways%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    }
   ]
  },
  "cytisinicline": {
   "subject": {
    "label": "Cytisinicline (smoking cessation)",
    "query": "products.active_ingredients.name:\"cytisinicline\"",
    "markets": [
     "KXFDAAPPROVE-CYT-26OCT01"
    ],
    "ruleQuote": "KXFDAAPPROVE-CYT-26OCT01: \"If the FDA approves cytisinicline for smoking cessation for marketing before Oct 1, 2026, then the market resolves to Yes.\""
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:58:30.697Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22cytisinicline%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-19T21:10:54.745Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22cytisinicline%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T04:45:51.563Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22cytisinicline%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T15:58:43.550Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22cytisinicline%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    }
   ]
  },
  "gedatolisib": {
   "subject": {
    "label": "Gedatolisib (HR+/HER2-, PIK3CA wild-type advanced breast cancer)",
    "query": "products.active_ingredients.name:\"gedatolisib\"",
    "markets": [
     "KXFDAAPPROVE-GED-26AUG01"
    ],
    "ruleQuote": "KXFDAAPPROVE-GED-26AUG01: \"If the FDA approves gedatolisib for HR+/HER2-, PIK3CA wild-type advanced breast cancer for marketing before Aug 1, 2026, then the market resolves to Yes.\" (Finalized yes; archived for the record.)"
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 5,
   "shippedSnapshots": 5,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:55:22.135Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA219908"
     ],
     "newestSubmissionStatusDate": "20260714"
    },
    {
     "captured_at": "2026-09-19T20:58:44.046Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA219908"
     ],
     "newestSubmissionStatusDate": "20260714"
    },
    {
     "captured_at": "2026-09-19T21:11:08.213Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA219908"
     ],
     "newestSubmissionStatusDate": "20260714"
    },
    {
     "captured_at": "2026-09-20T04:46:04.923Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA219908"
     ],
     "newestSubmissionStatusDate": "20260714"
    },
    {
     "captured_at": "2026-09-20T15:58:56.763Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-16",
      "total": 1
     },
     "state": "APPROVED",
     "approved": true,
     "marketingStatuses": [
      "Prescription"
     ],
     "applications": 1,
     "applicationNumbers": [
      "NDA219908"
     ],
     "newestSubmissionStatusDate": "20260714"
    }
   ]
  },
  "midomafetamine-mdma": {
   "subject": {
    "label": "Midomafetamine / MDMA (PTSD)",
    "query": "products.active_ingredients.name:\"midomafetamine\"",
    "markets": [
     "KXFDAAPPROVE-MDMA-30JAN01"
    ],
    "ruleQuote": "KXFDAAPPROVE-MDMA-30JAN01: \"If the FDA approves midomafetamine / MDMA for PTSD for marketing before Jan 1, 2030, then the market resolves to Yes.\""
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:58:57.506Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22midomafetamine%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-19T21:11:21.706Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22midomafetamine%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T04:46:18.303Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22midomafetamine%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T15:59:10.079Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22midomafetamine%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    }
   ]
  },
  "retatrutide": {
   "subject": {
    "label": "Retatrutide (LY3437943, Eli Lilly)",
    "query": "products.active_ingredients.name:\"retatrutide\"",
    "markets": [
     "KXFDARETATRUTIDE-RET-27JAN01",
     "KXFDARETATRUTIDE-RET-27JUL01",
     "KXFDARETATRUTIDE-RET-28JAN01",
     "KXFDARETATRUTIDE-RET-28JUL01",
     "KXFDARETATRUTIDE-RET-29JAN01"
    ],
    "ruleQuote": "KXFDARETATRUTIDE-RET-*: \"If the FDA approves retatrutide (LY3437943) for marketing before <date>, then the market resolves to Yes.\""
   },
   "what": "Point-in-time Drugs@FDA state for this subject: one snapshot per archive run. `approved` is derived from the verbatim marketing_status strings (a documented English-string test); every other field is verbatim from the official response.",
   "endpoint": "https://api.fda.gov/drug/drugsfda.json",
   "snapshotCount": 4,
   "shippedSnapshots": 4,
   "droppedOldestSnapshots": 0,
   "snapshots": [
    {
     "captured_at": "2026-09-19T20:58:04.002Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22retatrutide%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-19T21:10:27.941Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22retatrutide%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T04:45:22.419Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22retatrutide%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    },
    {
     "captured_at": "2026-09-20T15:58:17.135Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22retatrutide%22&limit=99",
     "http_status": 404,
     "meta": {
      "disclaimer": null,
      "last_updated": null,
      "total": 0
     },
     "state": "NO_RECORD",
     "approved": false,
     "marketingStatuses": [],
     "applications": 0,
     "applicationNumbers": [],
     "newestSubmissionStatusDate": null,
     "notFoundError": "openFDA 404 NOT_FOUND \"No matches found!\" — the documented empty-result response, archived as NO_RECORD"
    }
   ]
  }
 }
};
