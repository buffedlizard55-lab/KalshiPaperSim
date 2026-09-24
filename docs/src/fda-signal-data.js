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
 * 6 subject(s) · 104 shipped snapshot(s) · generated 2026-09-24T18:48:06.678Z
 */

export const FDA_SIGNAL_DATA = {
 "generatedAt": "2026-09-24T18:48:06.678Z",
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
   "snapshotCount": 18,
   "shippedSnapshots": 18,
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
    },
    {
     "captured_at": "2026-09-20T18:42:51.448Z",
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
     "captured_at": "2026-09-20T22:23:09.944Z",
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
     "captured_at": "2026-09-21T04:45:30.016Z",
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
     "captured_at": "2026-09-21T18:11:41.521Z",
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
     "captured_at": "2026-09-21T23:13:05.134Z",
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
     "captured_at": "2026-09-22T04:42:55.085Z",
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
     "captured_at": "2026-09-22T16:50:06.131Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-22T22:54:05.664Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-23T04:36:59.843Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-23T16:47:52.779Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-23T22:54:58.552Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-24T04:35:54.287Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-24T17:03:13.335Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
   "snapshotCount": 17,
   "shippedSnapshots": 17,
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
    },
    {
     "captured_at": "2026-09-20T18:42:25.101Z",
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
     "captured_at": "2026-09-20T22:22:43.465Z",
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
     "captured_at": "2026-09-21T04:45:03.216Z",
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
     "captured_at": "2026-09-21T18:11:15.180Z",
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
     "captured_at": "2026-09-21T23:12:38.174Z",
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
     "captured_at": "2026-09-22T04:42:28.754Z",
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
     "captured_at": "2026-09-22T16:49:39.494Z",
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
     "captured_at": "2026-09-22T22:53:38.846Z",
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
     "captured_at": "2026-09-23T04:36:33.051Z",
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
     "captured_at": "2026-09-23T16:47:26.295Z",
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
     "captured_at": "2026-09-23T22:54:31.756Z",
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
     "captured_at": "2026-09-24T04:35:27.481Z",
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
     "captured_at": "2026-09-24T17:02:46.370Z",
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
   "snapshotCount": 17,
   "shippedSnapshots": 17,
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
    },
    {
     "captured_at": "2026-09-20T18:43:04.614Z",
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
     "captured_at": "2026-09-20T22:23:23.187Z",
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
     "captured_at": "2026-09-21T04:45:43.410Z",
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
     "captured_at": "2026-09-21T18:11:54.692Z",
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
     "captured_at": "2026-09-21T23:13:18.365Z",
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
     "captured_at": "2026-09-22T04:43:08.252Z",
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
     "captured_at": "2026-09-22T16:50:19.617Z",
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
     "captured_at": "2026-09-22T22:54:19.059Z",
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
     "captured_at": "2026-09-23T04:37:13.335Z",
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
     "captured_at": "2026-09-23T16:48:06.292Z",
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
     "captured_at": "2026-09-23T22:55:12.021Z",
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
     "captured_at": "2026-09-24T04:36:07.687Z",
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
     "captured_at": "2026-09-24T17:03:26.735Z",
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
   "snapshotCount": 18,
   "shippedSnapshots": 18,
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
    },
    {
     "captured_at": "2026-09-20T18:43:17.785Z",
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
     "captured_at": "2026-09-20T22:23:36.418Z",
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
     "captured_at": "2026-09-21T04:45:56.803Z",
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
     "captured_at": "2026-09-21T18:12:07.863Z",
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
     "captured_at": "2026-09-21T23:13:31.754Z",
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
     "captured_at": "2026-09-22T04:43:21.419Z",
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
     "captured_at": "2026-09-22T16:50:33.268Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-22T22:54:32.463Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-23T04:37:26.740Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-21",
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
     "captured_at": "2026-09-23T16:48:19.528Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-23T22:55:25.424Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-24T04:36:21.089Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
     "captured_at": "2026-09-24T17:03:40.132Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-22",
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
   "snapshotCount": 17,
   "shippedSnapshots": 17,
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
    },
    {
     "captured_at": "2026-09-20T18:43:30.991Z",
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
     "captured_at": "2026-09-20T22:23:49.747Z",
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
     "captured_at": "2026-09-21T04:46:10.419Z",
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
     "captured_at": "2026-09-21T18:12:21.062Z",
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
     "captured_at": "2026-09-21T23:13:45.102Z",
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
     "captured_at": "2026-09-22T04:43:34.653Z",
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
     "captured_at": "2026-09-22T16:50:47.291Z",
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
     "captured_at": "2026-09-22T22:54:45.961Z",
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
     "captured_at": "2026-09-23T04:37:40.156Z",
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
     "captured_at": "2026-09-23T16:48:32.920Z",
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
     "captured_at": "2026-09-23T22:55:38.890Z",
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
     "captured_at": "2026-09-24T04:36:34.571Z",
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
     "captured_at": "2026-09-24T17:03:53.566Z",
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
   "snapshotCount": 17,
   "shippedSnapshots": 17,
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
    },
    {
     "captured_at": "2026-09-20T18:42:38.275Z",
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
     "captured_at": "2026-09-20T22:22:56.709Z",
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
     "captured_at": "2026-09-21T04:45:16.620Z",
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
     "captured_at": "2026-09-21T18:11:28.349Z",
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
     "captured_at": "2026-09-21T23:12:51.401Z",
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
     "captured_at": "2026-09-22T04:42:41.919Z",
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
     "captured_at": "2026-09-22T16:49:52.787Z",
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
     "captured_at": "2026-09-22T22:53:52.251Z",
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
     "captured_at": "2026-09-23T04:36:46.448Z",
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
     "captured_at": "2026-09-23T16:47:39.541Z",
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
     "captured_at": "2026-09-23T22:54:45.159Z",
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
     "captured_at": "2026-09-24T04:35:40.883Z",
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
     "captured_at": "2026-09-24T17:02:59.933Z",
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
