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
 * 6 subject(s) · 692 shipped snapshot(s) · generated 2026-10-27T02:09:08.064Z
 */

export const FDA_SIGNAL_DATA = {
 "generatedAt": "2026-10-27T02:09:08.064Z",
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
   "snapshotCount": 116,
   "shippedSnapshots": 116,
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
    },
    {
     "captured_at": "2026-09-24T23:11:12.718Z",
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
     "captured_at": "2026-09-25T04:46:24.384Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-25T17:04:21.786Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-25T23:15:49.463Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T04:47:49.490Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T16:17:31.175Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T22:41:10.456Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T05:10:30.790Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T16:53:46.971Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T22:58:20.731Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-28T05:13:28.534Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-28T19:37:07.172Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-29T00:20:49.838Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-29T18:02:51.220Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-28",
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
     "captured_at": "2026-09-29T23:39:17.254Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T05:24:04.419Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T17:58:48.697Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T23:41:51.950Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T05:40:10.334Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T18:23:44.220Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T23:52:03.160Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-02T05:25:23.708Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-30",
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
     "captured_at": "2026-10-02T17:50:05.299Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-01",
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
     "captured_at": "2026-10-02T23:43:52.154Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T05:08:45.287Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T16:10:15.709Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T19:12:13.897Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T22:50:24.262Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T05:42:01.229Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T16:49:00.388Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T23:01:15.288Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-05T05:25:48.363Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-05T20:42:52.072Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-06T06:10:29.285Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-05",
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
     "captured_at": "2026-10-06T18:18:28.872Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-06T23:45:56.863Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-07T05:45:36.808Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-07T18:51:35.765Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-08T00:09:37.313Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-08T05:54:59.506Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-08T18:48:49.388Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T00:16:33.346Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T18:19:27.699Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T23:59:22.968Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T05:40:49.510Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T17:18:43.075Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T23:28:08.211Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T05:36:14.842Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T17:40:27.143Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T23:37:29.723Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-12T05:46:34.537Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-12T21:14:20.389Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-13T06:41:16.701Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-13T19:13:07.946Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-13T23:43:31.378Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T04:44:04.277Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T17:03:25.143Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T23:09:46.693Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T04:26:11.490Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T16:52:12.078Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T23:01:11.384Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T04:21:31.775Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T16:33:16.232Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T22:46:31.686Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T04:13:36.277Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T15:27:31.892Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T18:25:12.554Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T22:14:17.051Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T04:19:37.051Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T15:47:47.321Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T18:36:01.460Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T22:26:43.318Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T04:29:25.575Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T18:42:25.168Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T23:34:06.889Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T04:39:45.740Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T16:51:04.213Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T23:08:38.655Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T04:32:37.457Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T17:07:21.483Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T23:12:54.048Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-22T04:31:17.184Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-22T17:04:59.419Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-21",
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
     "captured_at": "2026-10-22T23:16:06.083Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-21",
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
     "captured_at": "2026-10-23T04:36:37.780Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-22",
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
     "captured_at": "2026-10-23T16:58:52.307Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-22",
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
     "captured_at": "2026-10-23T23:04:39.182Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T04:26:10.675Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T15:51:12.824Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T18:45:46.504Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T22:25:51.150Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T04:31:33.408Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T16:02:43.616Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T19:04:25.426Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T22:29:36.265Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T04:33:54.001Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T18:39:33.900Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T23:47:00.226Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22camizestrant%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-26",
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
   "snapshotCount": 115,
   "shippedSnapshots": 115,
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
    },
    {
     "captured_at": "2026-09-24T23:10:45.867Z",
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
     "captured_at": "2026-09-25T04:45:57.568Z",
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
     "captured_at": "2026-09-25T17:03:54.935Z",
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
     "captured_at": "2026-09-25T23:15:22.547Z",
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
     "captured_at": "2026-09-26T04:47:23.065Z",
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
     "captured_at": "2026-09-26T16:17:04.782Z",
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
     "captured_at": "2026-09-26T22:40:43.813Z",
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
     "captured_at": "2026-09-27T05:10:03.997Z",
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
     "captured_at": "2026-09-27T16:53:20.019Z",
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
     "captured_at": "2026-09-27T22:57:54.079Z",
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
     "captured_at": "2026-09-28T05:13:02.195Z",
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
     "captured_at": "2026-09-28T19:36:40.685Z",
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
     "captured_at": "2026-09-29T00:20:22.977Z",
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
     "captured_at": "2026-09-29T18:02:24.950Z",
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
     "captured_at": "2026-09-29T23:38:50.399Z",
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
     "captured_at": "2026-09-30T05:23:37.738Z",
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
     "captured_at": "2026-09-30T17:58:21.886Z",
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
     "captured_at": "2026-09-30T23:41:25.480Z",
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
     "captured_at": "2026-10-01T05:39:43.627Z",
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
     "captured_at": "2026-10-01T18:23:17.619Z",
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
     "captured_at": "2026-10-01T23:51:36.688Z",
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
     "captured_at": "2026-10-02T05:24:57.372Z",
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
     "captured_at": "2026-10-02T17:49:38.962Z",
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
     "captured_at": "2026-10-02T23:43:24.715Z",
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
     "captured_at": "2026-10-03T05:08:18.290Z",
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
     "captured_at": "2026-10-03T16:09:49.024Z",
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
     "captured_at": "2026-10-03T19:11:47.422Z",
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
     "captured_at": "2026-10-03T22:49:57.671Z",
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
     "captured_at": "2026-10-04T05:41:34.561Z",
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
     "captured_at": "2026-10-04T16:48:33.576Z",
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
     "captured_at": "2026-10-04T23:00:48.613Z",
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
     "captured_at": "2026-10-05T05:25:22.026Z",
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
     "captured_at": "2026-10-05T20:42:25.741Z",
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
     "captured_at": "2026-10-06T06:10:02.662Z",
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
     "captured_at": "2026-10-06T18:18:02.415Z",
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
     "captured_at": "2026-10-06T23:45:30.527Z",
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
     "captured_at": "2026-10-07T05:45:10.182Z",
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
     "captured_at": "2026-10-07T18:51:09.271Z",
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
     "captured_at": "2026-10-08T00:08:58.999Z",
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
     "captured_at": "2026-10-08T05:54:32.817Z",
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
     "captured_at": "2026-10-08T18:48:23.047Z",
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
     "captured_at": "2026-10-09T00:16:06.522Z",
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
     "captured_at": "2026-10-09T18:19:01.071Z",
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
     "captured_at": "2026-10-09T23:58:56.281Z",
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
     "captured_at": "2026-10-10T05:40:22.685Z",
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
     "captured_at": "2026-10-10T17:18:16.588Z",
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
     "captured_at": "2026-10-10T23:27:41.393Z",
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
     "captured_at": "2026-10-11T05:35:48.043Z",
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
     "captured_at": "2026-10-11T17:40:00.550Z",
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
     "captured_at": "2026-10-11T23:37:03.251Z",
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
     "captured_at": "2026-10-12T05:46:08.250Z",
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
     "captured_at": "2026-10-12T21:13:53.781Z",
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
     "captured_at": "2026-10-13T06:40:49.996Z",
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
     "captured_at": "2026-10-13T19:12:41.343Z",
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
     "captured_at": "2026-10-13T23:43:04.573Z",
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
     "captured_at": "2026-10-14T04:43:37.925Z",
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
     "captured_at": "2026-10-14T17:02:58.358Z",
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
     "captured_at": "2026-10-14T23:09:19.834Z",
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
     "captured_at": "2026-10-15T04:25:44.812Z",
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
     "captured_at": "2026-10-15T16:51:45.139Z",
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
     "captured_at": "2026-10-15T23:00:44.591Z",
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
     "captured_at": "2026-10-16T04:21:05.156Z",
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
     "captured_at": "2026-10-16T16:32:49.699Z",
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
     "captured_at": "2026-10-16T22:46:05.096Z",
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
     "captured_at": "2026-10-17T04:13:09.668Z",
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
     "captured_at": "2026-10-17T15:27:05.243Z",
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
     "captured_at": "2026-10-17T18:24:46.222Z",
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
     "captured_at": "2026-10-17T22:13:50.256Z",
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
     "captured_at": "2026-10-18T04:19:10.462Z",
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
     "captured_at": "2026-10-18T15:47:21.032Z",
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
     "captured_at": "2026-10-18T18:35:35.005Z",
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
     "captured_at": "2026-10-18T22:26:16.588Z",
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
     "captured_at": "2026-10-19T04:28:58.766Z",
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
     "captured_at": "2026-10-19T18:41:58.555Z",
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
     "captured_at": "2026-10-19T23:33:40.089Z",
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
     "captured_at": "2026-10-20T04:39:19.127Z",
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
     "captured_at": "2026-10-20T16:50:37.621Z",
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
     "captured_at": "2026-10-20T23:08:12.047Z",
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
     "captured_at": "2026-10-21T04:32:10.984Z",
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
     "captured_at": "2026-10-21T17:06:17.232Z",
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
     "captured_at": "2026-10-21T23:12:27.448Z",
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
     "captured_at": "2026-10-22T04:30:50.795Z",
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
     "captured_at": "2026-10-22T17:04:33.072Z",
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
     "captured_at": "2026-10-22T23:15:39.266Z",
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
     "captured_at": "2026-10-23T04:36:10.953Z",
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
     "captured_at": "2026-10-23T16:58:25.657Z",
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
     "captured_at": "2026-10-23T23:04:12.575Z",
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
     "captured_at": "2026-10-24T04:25:43.777Z",
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
     "captured_at": "2026-10-24T15:50:45.848Z",
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
     "captured_at": "2026-10-24T18:45:20.050Z",
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
     "captured_at": "2026-10-24T22:25:24.359Z",
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
     "captured_at": "2026-10-25T04:31:06.284Z",
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
     "captured_at": "2026-10-25T16:02:16.812Z",
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
     "captured_at": "2026-10-25T19:03:58.941Z",
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
     "captured_at": "2026-10-25T22:29:08.512Z",
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
     "captured_at": "2026-10-26T04:33:27.315Z",
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
     "captured_at": "2026-10-26T18:39:07.411Z",
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
     "captured_at": "2026-10-26T23:46:33.730Z",
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
   "snapshotCount": 115,
   "shippedSnapshots": 115,
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
    },
    {
     "captured_at": "2026-09-24T23:11:26.117Z",
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
     "captured_at": "2026-09-25T04:46:37.783Z",
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
     "captured_at": "2026-09-25T17:04:35.188Z",
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
     "captured_at": "2026-09-25T23:16:02.930Z",
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
     "captured_at": "2026-09-26T04:48:02.660Z",
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
     "captured_at": "2026-09-26T16:17:44.347Z",
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
     "captured_at": "2026-09-26T22:41:23.753Z",
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
     "captured_at": "2026-09-27T05:10:44.194Z",
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
     "captured_at": "2026-09-27T16:54:00.625Z",
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
     "captured_at": "2026-09-27T22:58:33.966Z",
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
     "captured_at": "2026-09-28T05:13:41.706Z",
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
     "captured_at": "2026-09-28T19:37:20.420Z",
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
     "captured_at": "2026-09-29T00:21:03.374Z",
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
     "captured_at": "2026-09-29T18:03:04.389Z",
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
     "captured_at": "2026-09-29T23:39:30.675Z",
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
     "captured_at": "2026-09-30T05:24:17.727Z",
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
     "captured_at": "2026-09-30T17:59:02.137Z",
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
     "captured_at": "2026-09-30T23:42:05.205Z",
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
     "captured_at": "2026-10-01T05:40:23.664Z",
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
     "captured_at": "2026-10-01T18:23:57.530Z",
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
     "captured_at": "2026-10-01T23:52:16.407Z",
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
     "captured_at": "2026-10-02T05:25:37.651Z",
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
     "captured_at": "2026-10-02T17:50:18.471Z",
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
     "captured_at": "2026-10-02T23:44:05.476Z",
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
     "captured_at": "2026-10-03T05:08:58.686Z",
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
     "captured_at": "2026-10-03T16:10:29.055Z",
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
     "captured_at": "2026-10-03T19:12:27.144Z",
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
     "captured_at": "2026-10-03T22:50:37.582Z",
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
     "captured_at": "2026-10-04T05:42:14.563Z",
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
     "captured_at": "2026-10-04T16:49:14.108Z",
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
     "captured_at": "2026-10-04T23:01:28.630Z",
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
     "captured_at": "2026-10-05T05:26:01.527Z",
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
     "captured_at": "2026-10-05T20:43:05.286Z",
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
     "captured_at": "2026-10-06T06:10:42.600Z",
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
     "captured_at": "2026-10-06T18:18:42.110Z",
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
     "captured_at": "2026-10-06T23:46:10.046Z",
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
     "captured_at": "2026-10-07T05:45:50.109Z",
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
     "captured_at": "2026-10-07T18:51:49.009Z",
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
     "captured_at": "2026-10-08T00:09:50.717Z",
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
     "captured_at": "2026-10-08T05:55:36.797Z",
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
     "captured_at": "2026-10-08T18:49:02.559Z",
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
     "captured_at": "2026-10-09T00:16:46.754Z",
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
     "captured_at": "2026-10-09T18:19:40.986Z",
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
     "captured_at": "2026-10-09T23:59:36.272Z",
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
     "captured_at": "2026-10-10T05:41:02.919Z",
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
     "captured_at": "2026-10-10T17:18:56.314Z",
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
     "captured_at": "2026-10-10T23:28:21.613Z",
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
     "captured_at": "2026-10-11T05:36:28.242Z",
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
     "captured_at": "2026-10-11T17:40:40.433Z",
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
     "captured_at": "2026-10-11T23:37:42.870Z",
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
     "captured_at": "2026-10-12T05:46:47.694Z",
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
     "captured_at": "2026-10-12T21:14:33.688Z",
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
     "captured_at": "2026-10-13T06:41:30.053Z",
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
     "captured_at": "2026-10-13T19:13:21.238Z",
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
     "captured_at": "2026-10-13T23:43:44.806Z",
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
     "captured_at": "2026-10-14T04:44:17.447Z",
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
     "captured_at": "2026-10-14T17:03:38.552Z",
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
     "captured_at": "2026-10-14T23:10:00.094Z",
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
     "captured_at": "2026-10-15T04:26:24.831Z",
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
     "captured_at": "2026-10-15T16:52:25.561Z",
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
     "captured_at": "2026-10-15T23:01:24.773Z",
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
     "captured_at": "2026-10-16T04:21:45.073Z",
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
     "captured_at": "2026-10-16T16:33:29.839Z",
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
     "captured_at": "2026-10-16T22:46:44.987Z",
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
     "captured_at": "2026-10-17T04:13:49.584Z",
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
     "captured_at": "2026-10-17T15:27:45.190Z",
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
     "captured_at": "2026-10-17T18:25:25.719Z",
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
     "captured_at": "2026-10-17T22:14:30.541Z",
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
     "captured_at": "2026-10-18T04:19:50.356Z",
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
     "captured_at": "2026-10-18T15:48:00.450Z",
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
     "captured_at": "2026-10-18T18:36:14.689Z",
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
     "captured_at": "2026-10-18T22:26:56.681Z",
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
     "captured_at": "2026-10-19T04:29:38.989Z",
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
     "captured_at": "2026-10-19T18:42:38.474Z",
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
     "captured_at": "2026-10-19T23:34:20.289Z",
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
     "captured_at": "2026-10-20T04:39:59.041Z",
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
     "captured_at": "2026-10-20T16:51:17.449Z",
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
     "captured_at": "2026-10-20T23:08:51.967Z",
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
     "captured_at": "2026-10-21T04:32:50.686Z",
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
     "captured_at": "2026-10-21T17:07:34.862Z",
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
     "captured_at": "2026-10-21T23:13:07.352Z",
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
     "captured_at": "2026-10-22T04:31:30.365Z",
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
     "captured_at": "2026-10-22T17:05:13.039Z",
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
     "captured_at": "2026-10-22T23:16:19.253Z",
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
     "captured_at": "2026-10-23T04:36:51.184Z",
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
     "captured_at": "2026-10-23T16:59:05.665Z",
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
     "captured_at": "2026-10-23T23:04:52.495Z",
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
     "captured_at": "2026-10-24T04:26:24.061Z",
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
     "captured_at": "2026-10-24T15:51:27.760Z",
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
     "captured_at": "2026-10-24T18:45:59.930Z",
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
     "captured_at": "2026-10-24T22:26:04.552Z",
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
     "captured_at": "2026-10-25T04:31:46.644Z",
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
     "captured_at": "2026-10-25T16:02:57.012Z",
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
     "captured_at": "2026-10-25T19:04:38.659Z",
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
     "captured_at": "2026-10-25T22:29:49.450Z",
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
     "captured_at": "2026-10-26T04:34:07.340Z",
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
     "captured_at": "2026-10-26T18:39:47.129Z",
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
     "captured_at": "2026-10-26T23:47:13.474Z",
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
   "snapshotCount": 116,
   "shippedSnapshots": 116,
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
    },
    {
     "captured_at": "2026-09-24T23:11:39.520Z",
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
     "captured_at": "2026-09-25T04:46:51.183Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-25T17:04:48.587Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-25T23:16:16.371Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T04:48:15.849Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T16:17:57.514Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-26T22:41:37.052Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T05:10:57.597Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T16:54:14.021Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-27T22:58:47.193Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-28T05:13:54.885Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-28T19:37:33.673Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-29T00:21:16.799Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-24",
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
     "captured_at": "2026-09-29T18:03:17.614Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-28",
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
     "captured_at": "2026-09-29T23:39:44.166Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T05:24:31.030Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T17:59:15.540Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-09-30T23:42:18.447Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T05:40:36.986Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T18:24:10.826Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-01T23:52:29.626Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-29",
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
     "captured_at": "2026-10-02T05:25:50.824Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-09-30",
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
     "captured_at": "2026-10-02T17:50:31.692Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-01",
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
     "captured_at": "2026-10-02T23:44:18.771Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T05:09:12.126Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T16:10:42.427Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T19:12:40.368Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-03T22:50:50.884Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T05:42:27.885Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T16:49:27.505Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-04T23:01:41.965Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-05T05:26:14.756Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-05T20:43:18.456Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-02",
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
     "captured_at": "2026-10-06T06:10:55.919Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-05",
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
     "captured_at": "2026-10-06T18:18:55.343Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-06T23:46:23.215Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-07T05:46:03.400Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-06",
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
     "captured_at": "2026-10-07T18:52:02.949Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-08T00:11:15.677Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-08T05:56:59.762Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-08T18:49:15.732Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T00:17:00.176Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T18:19:54.286Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-07",
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
     "captured_at": "2026-10-09T23:59:49.580Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T05:41:16.328Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T17:19:09.553Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-10T23:28:35.023Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T05:36:41.638Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T17:40:53.728Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-11T23:37:56.395Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-12T05:47:00.830Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-12T21:14:46.986Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-13T06:41:43.405Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-09",
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
     "captured_at": "2026-10-13T19:13:34.535Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-13T23:43:58.205Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T04:44:30.623Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T17:03:51.960Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-13",
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
     "captured_at": "2026-10-14T23:10:13.489Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T04:26:38.162Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T16:52:39.018Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-15T23:01:38.175Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T04:21:58.383Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T16:33:43.007Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-14",
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
     "captured_at": "2026-10-16T22:46:58.295Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T04:14:02.882Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T15:27:58.486Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T18:25:38.883Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-17T22:14:44.022Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T04:20:03.666Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T15:48:13.590Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T18:36:28.198Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-18T22:27:10.012Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T04:29:52.405Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T18:42:51.948Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-19T23:34:33.693Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T04:40:12.345Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T16:51:30.724Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-16",
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
     "captured_at": "2026-10-20T23:09:05.264Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T04:33:03.926Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T17:07:48.305Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-21T23:13:20.661Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-22T04:31:43.534Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-20",
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
     "captured_at": "2026-10-22T17:05:26.214Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-21",
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
     "captured_at": "2026-10-22T23:16:32.419Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-21",
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
     "captured_at": "2026-10-23T04:37:04.587Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-22",
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
     "captured_at": "2026-10-23T16:59:18.998Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-22",
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
     "captured_at": "2026-10-23T23:05:05.809Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T04:26:37.368Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T15:51:41.164Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T18:46:13.157Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-24T22:26:17.950Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T04:31:59.870Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T16:03:10.409Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T19:04:51.895Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-25T22:30:03.168Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T04:34:20.668Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T18:40:00.377Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-23",
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
     "captured_at": "2026-10-26T23:47:26.714Z",
     "url": "https://api.fda.gov/drug/drugsfda.json?search=products.active_ingredients.name%3A%22gedatolisib%22&limit=99",
     "http_status": 200,
     "meta": {
      "disclaimer": "Do not rely on openFDA to make decisions regarding medical care. While we make every effort to ensure that data is accurate, you should assume all results are unvalidated. We may limit or otherwise restrict your access to the API in line with our Terms of Service.",
      "last_updated": "2026-10-26",
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
   "snapshotCount": 115,
   "shippedSnapshots": 115,
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
    },
    {
     "captured_at": "2026-09-24T23:11:52.970Z",
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
     "captured_at": "2026-09-25T04:47:04.646Z",
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
     "captured_at": "2026-09-25T17:05:02.728Z",
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
     "captured_at": "2026-09-25T23:16:29.908Z",
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
     "captured_at": "2026-09-26T04:48:29.036Z",
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
     "captured_at": "2026-09-26T16:18:10.733Z",
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
     "captured_at": "2026-09-26T22:41:50.438Z",
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
     "captured_at": "2026-09-27T05:11:11.047Z",
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
     "captured_at": "2026-09-27T16:54:27.520Z",
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
     "captured_at": "2026-09-27T22:59:00.467Z",
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
     "captured_at": "2026-09-28T05:14:08.078Z",
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
     "captured_at": "2026-09-28T19:37:47.266Z",
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
     "captured_at": "2026-09-29T00:21:30.289Z",
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
     "captured_at": "2026-09-29T18:03:30.854Z",
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
     "captured_at": "2026-09-29T23:39:57.703Z",
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
     "captured_at": "2026-09-30T05:24:44.452Z",
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
     "captured_at": "2026-09-30T17:59:29.056Z",
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
     "captured_at": "2026-09-30T23:42:31.785Z",
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
     "captured_at": "2026-10-01T05:40:50.384Z",
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
     "captured_at": "2026-10-01T18:24:24.256Z",
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
     "captured_at": "2026-10-01T23:52:42.921Z",
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
     "captured_at": "2026-10-02T05:26:04.667Z",
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
     "captured_at": "2026-10-02T17:50:44.885Z",
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
     "captured_at": "2026-10-02T23:44:32.351Z",
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
     "captured_at": "2026-10-03T05:09:25.659Z",
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
     "captured_at": "2026-10-03T16:10:55.929Z",
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
     "captured_at": "2026-10-03T19:12:53.729Z",
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
     "captured_at": "2026-10-03T22:51:04.238Z",
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
     "captured_at": "2026-10-04T05:42:41.331Z",
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
     "captured_at": "2026-10-04T16:49:41.008Z",
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
     "captured_at": "2026-10-04T23:01:55.390Z",
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
     "captured_at": "2026-10-05T05:26:27.948Z",
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
     "captured_at": "2026-10-05T20:43:31.658Z",
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
     "captured_at": "2026-10-06T06:11:09.314Z",
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
     "captured_at": "2026-10-06T18:19:08.705Z",
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
     "captured_at": "2026-10-06T23:46:36.426Z",
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
     "captured_at": "2026-10-07T05:46:16.832Z",
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
     "captured_at": "2026-10-07T18:52:16.282Z",
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
     "captured_at": "2026-10-08T00:11:33.643Z",
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
     "captured_at": "2026-10-08T05:57:13.077Z",
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
     "captured_at": "2026-10-08T18:49:28.965Z",
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
     "captured_at": "2026-10-09T00:17:13.621Z",
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
     "captured_at": "2026-10-09T18:20:07.706Z",
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
     "captured_at": "2026-10-10T00:00:04.933Z",
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
     "captured_at": "2026-10-10T05:41:29.749Z",
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
     "captured_at": "2026-10-10T17:19:22.830Z",
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
     "captured_at": "2026-10-10T23:28:48.620Z",
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
     "captured_at": "2026-10-11T05:36:55.109Z",
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
     "captured_at": "2026-10-11T17:41:07.149Z",
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
     "captured_at": "2026-10-11T23:38:09.727Z",
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
     "captured_at": "2026-10-12T05:47:14.128Z",
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
     "captured_at": "2026-10-12T21:15:00.338Z",
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
     "captured_at": "2026-10-13T06:41:56.795Z",
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
     "captured_at": "2026-10-13T19:13:47.991Z",
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
     "captured_at": "2026-10-13T23:44:11.651Z",
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
     "captured_at": "2026-10-14T04:44:43.829Z",
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
     "captured_at": "2026-10-14T17:04:05.538Z",
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
     "captured_at": "2026-10-14T23:10:26.963Z",
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
     "captured_at": "2026-10-15T04:26:51.617Z",
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
     "captured_at": "2026-10-15T16:52:52.348Z",
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
     "captured_at": "2026-10-15T23:01:51.612Z",
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
     "captured_at": "2026-10-16T04:22:11.760Z",
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
     "captured_at": "2026-10-16T16:33:56.239Z",
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
     "captured_at": "2026-10-16T22:47:11.689Z",
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
     "captured_at": "2026-10-17T04:14:16.332Z",
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
     "captured_at": "2026-10-17T15:28:11.996Z",
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
     "captured_at": "2026-10-17T18:25:52.066Z",
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
     "captured_at": "2026-10-17T22:14:57.460Z",
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
     "captured_at": "2026-10-18T04:20:17.262Z",
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
     "captured_at": "2026-10-18T15:48:26.809Z",
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
     "captured_at": "2026-10-18T18:36:41.496Z",
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
     "captured_at": "2026-10-18T22:27:23.515Z",
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
     "captured_at": "2026-10-19T04:30:06.413Z",
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
     "captured_at": "2026-10-19T18:43:05.416Z",
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
     "captured_at": "2026-10-19T23:34:47.135Z",
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
     "captured_at": "2026-10-20T04:40:25.726Z",
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
     "captured_at": "2026-10-20T16:51:44.170Z",
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
     "captured_at": "2026-10-20T23:09:18.635Z",
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
     "captured_at": "2026-10-21T04:33:17.249Z",
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
     "captured_at": "2026-10-21T17:08:01.774Z",
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
     "captured_at": "2026-10-21T23:13:34.047Z",
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
     "captured_at": "2026-10-22T04:31:56.736Z",
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
     "captured_at": "2026-10-22T17:05:39.540Z",
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
     "captured_at": "2026-10-22T23:16:45.606Z",
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
     "captured_at": "2026-10-23T04:37:18.082Z",
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
     "captured_at": "2026-10-23T16:59:32.455Z",
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
     "captured_at": "2026-10-23T23:05:19.212Z",
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
     "captured_at": "2026-10-24T04:26:50.770Z",
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
     "captured_at": "2026-10-24T15:51:54.696Z",
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
     "captured_at": "2026-10-24T18:46:26.499Z",
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
     "captured_at": "2026-10-24T22:26:31.652Z",
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
     "captured_at": "2026-10-25T04:32:13.196Z",
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
     "captured_at": "2026-10-25T16:03:23.879Z",
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
     "captured_at": "2026-10-25T19:05:05.587Z",
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
     "captured_at": "2026-10-25T22:30:16.370Z",
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
     "captured_at": "2026-10-26T04:34:34.081Z",
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
     "captured_at": "2026-10-26T18:40:13.692Z",
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
     "captured_at": "2026-10-26T23:47:40.181Z",
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
   "snapshotCount": 115,
   "shippedSnapshots": 115,
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
    },
    {
     "captured_at": "2026-09-24T23:10:59.307Z",
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
     "captured_at": "2026-09-25T04:46:10.970Z",
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
     "captured_at": "2026-09-25T17:04:08.388Z",
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
     "captured_at": "2026-09-25T23:15:36.003Z",
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
     "captured_at": "2026-09-26T04:47:36.321Z",
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
     "captured_at": "2026-09-26T16:17:17.949Z",
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
     "captured_at": "2026-09-26T22:40:57.163Z",
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
     "captured_at": "2026-09-27T05:10:17.391Z",
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
     "captured_at": "2026-09-27T16:53:33.561Z",
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
     "captured_at": "2026-09-27T22:58:07.391Z",
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
     "captured_at": "2026-09-28T05:13:15.364Z",
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
     "captured_at": "2026-09-28T19:36:53.929Z",
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
     "captured_at": "2026-09-29T00:20:36.396Z",
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
     "captured_at": "2026-09-29T18:02:38.085Z",
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
     "captured_at": "2026-09-29T23:39:03.800Z",
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
     "captured_at": "2026-09-30T05:23:51.040Z",
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
     "captured_at": "2026-09-30T17:58:35.281Z",
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
     "captured_at": "2026-09-30T23:41:38.709Z",
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
     "captured_at": "2026-10-01T05:39:56.947Z",
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
     "captured_at": "2026-10-01T18:23:30.917Z",
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
     "captured_at": "2026-10-01T23:51:49.920Z",
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
     "captured_at": "2026-10-02T05:25:10.540Z",
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
     "captured_at": "2026-10-02T17:49:52.130Z",
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
     "captured_at": "2026-10-02T23:43:38.850Z",
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
     "captured_at": "2026-10-03T05:08:31.881Z",
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
     "captured_at": "2026-10-03T16:10:02.354Z",
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
     "captured_at": "2026-10-03T19:12:00.649Z",
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
     "captured_at": "2026-10-03T22:50:10.969Z",
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
     "captured_at": "2026-10-04T05:41:47.888Z",
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
     "captured_at": "2026-10-04T16:48:46.981Z",
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
     "captured_at": "2026-10-04T23:01:01.949Z",
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
     "captured_at": "2026-10-05T05:25:35.196Z",
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
     "captured_at": "2026-10-05T20:42:38.905Z",
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
     "captured_at": "2026-10-06T06:10:15.975Z",
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
     "captured_at": "2026-10-06T18:18:15.640Z",
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
     "captured_at": "2026-10-06T23:45:43.693Z",
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
     "captured_at": "2026-10-07T05:45:23.499Z",
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
     "captured_at": "2026-10-07T18:51:22.521Z",
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
     "captured_at": "2026-10-08T00:09:23.807Z",
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
     "captured_at": "2026-10-08T05:54:46.104Z",
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
     "captured_at": "2026-10-08T18:48:36.215Z",
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
     "captured_at": "2026-10-09T00:16:19.935Z",
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
     "captured_at": "2026-10-09T18:19:14.352Z",
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
     "captured_at": "2026-10-09T23:59:09.577Z",
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
     "captured_at": "2026-10-10T05:40:36.100Z",
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
     "captured_at": "2026-10-10T17:18:29.827Z",
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
     "captured_at": "2026-10-10T23:27:54.793Z",
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
     "captured_at": "2026-10-11T05:36:01.442Z",
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
     "captured_at": "2026-10-11T17:40:13.847Z",
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
     "captured_at": "2026-10-11T23:37:16.412Z",
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
     "captured_at": "2026-10-12T05:46:21.392Z",
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
     "captured_at": "2026-10-12T21:14:07.088Z",
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
     "captured_at": "2026-10-13T06:41:03.345Z",
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
     "captured_at": "2026-10-13T19:12:54.641Z",
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
     "captured_at": "2026-10-13T23:43:17.970Z",
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
     "captured_at": "2026-10-14T04:43:51.098Z",
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
     "captured_at": "2026-10-14T17:03:11.749Z",
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
     "captured_at": "2026-10-14T23:09:33.301Z",
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
     "captured_at": "2026-10-15T04:25:58.152Z",
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
     "captured_at": "2026-10-15T16:51:58.746Z",
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
     "captured_at": "2026-10-15T23:00:57.978Z",
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
     "captured_at": "2026-10-16T04:21:18.459Z",
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
     "captured_at": "2026-10-16T16:33:02.875Z",
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
     "captured_at": "2026-10-16T22:46:18.389Z",
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
     "captured_at": "2026-10-17T04:13:22.969Z",
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
     "captured_at": "2026-10-17T15:27:18.539Z",
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
     "captured_at": "2026-10-17T18:24:59.384Z",
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
     "captured_at": "2026-10-17T22:14:03.661Z",
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
     "captured_at": "2026-10-18T04:19:23.758Z",
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
     "captured_at": "2026-10-18T15:47:34.181Z",
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
     "captured_at": "2026-10-18T18:35:48.234Z",
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
     "captured_at": "2026-10-18T22:26:29.966Z",
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
     "captured_at": "2026-10-19T04:29:12.175Z",
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
     "captured_at": "2026-10-19T18:42:11.863Z",
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
     "captured_at": "2026-10-19T23:33:53.487Z",
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
     "captured_at": "2026-10-20T04:39:32.434Z",
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
     "captured_at": "2026-10-20T16:50:50.857Z",
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
     "captured_at": "2026-10-20T23:08:25.355Z",
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
     "captured_at": "2026-10-21T04:32:24.221Z",
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
     "captured_at": "2026-10-21T17:06:38.013Z",
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
     "captured_at": "2026-10-21T23:12:40.747Z",
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
     "captured_at": "2026-10-22T04:31:04.010Z",
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
     "captured_at": "2026-10-22T17:04:46.245Z",
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
     "captured_at": "2026-10-22T23:15:52.438Z",
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
     "captured_at": "2026-10-23T04:36:24.367Z",
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
     "captured_at": "2026-10-23T16:58:38.987Z",
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
     "captured_at": "2026-10-23T23:04:25.876Z",
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
     "captured_at": "2026-10-24T04:25:57.367Z",
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
     "captured_at": "2026-10-24T15:50:59.253Z",
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
     "captured_at": "2026-10-24T18:45:33.274Z",
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
     "captured_at": "2026-10-24T22:25:37.759Z",
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
     "captured_at": "2026-10-25T04:31:20.175Z",
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
     "captured_at": "2026-10-25T16:02:30.207Z",
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
     "captured_at": "2026-10-25T19:04:12.197Z",
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
     "captured_at": "2026-10-25T22:29:21.675Z",
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
     "captured_at": "2026-10-26T04:33:40.648Z",
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
     "captured_at": "2026-10-26T18:39:20.658Z",
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
     "captured_at": "2026-10-26T23:46:46.977Z",
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
