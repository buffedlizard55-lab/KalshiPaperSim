/**
 * KalshiPaperSim — Point-in-Time SEC Form 4 Archive (GENERATED — do not edit)
 * =====================================================================
 * Compiled by scripts/generate-history-module.mjs from
 * data/form4-signals/companies/, which scripts/archive-form4-signals.mjs grows
 * from EDGAR itself (sec.gov — official, keyless) on the form4-signals workflow
 * schedule.
 *
 * Each filing is what the archive parsed out of the SEC's own ownership XML,
 * keyed by accession number, carrying EDGAR's OWN acceptance instant
 * (acceptedAt) — the instant from which it was knowable. Read it only through
 * src/form4-signal-store.js, which refuses any filing accepted AFTER the
 * decision time (the anti-lookahead rule).
 *
 * NO ARCHIVE YET — no filings have been captured; every Form-4-signal-dependent strategy abstains until the archive exists. · generated 2026-09-23T01:32:19.319Z
 */

export const FORM4_SIGNAL_DATA = {
 "generatedAt": "2026-09-23T01:32:19.319Z",
 "present": false,
 "endpoint": "https://www.sec.gov/cgi-bin/browse-edgar",
 "archives": "https://www.sec.gov/Archives/edgar/data",
 "terms": "https://www.sec.gov/os/accessing-edgar-data",
 "spec": "https://www.sec.gov/info/edgar/ownershipxmltechspec-v3.pdf",
 "assumption": null,
 "companies": {}
};
