# Roadmap — what is done, what is next, and what is blocked

This file is the honest queue for KalshiPaperSim. Every item says what it would
change, what it needs, and how a reader could check it. Nothing here is a
promise; items leave this file only when the work is committed **and** measured.

Last reviewed: 2026-09-18 (pass 2 of the Arena session on branch
`arena/01a0b1cd-kalshipapersim`).

## Shipped (with the evidence a reader can rerun)

| # | Item | Evidence |
|---|------|----------|
| 1 | Daily bars accumulated by a GitHub-hosted ingest job (the sandbox cannot reach `*.kalshi.com` — Irregularity #4) | `data/history/*.json`, `data/history/_last-run.log`, workflow `ingest-now.yml` |
| 2 | Store verified against the live API, field-for-field, on every run | `scripts/verify-store-live.mjs` → `data/reports/store-verification.json` (last run: 192/192 bars identical) |
| 3 | Intraday 60-minute store, bounded by `--max-bars` with every trim recorded | `data/history/intraday/60m/` (12 markets, 4,032 bars), `trims[]` in each store file |
| 4 | Walk-forward split (in-sample vs post-split) in the engine | `src/forward-test.js`, `noTradeBeforeTs` in `src/backtest-replay.js`, `--oos-split` in `scripts/strategy-sweep.mjs` |
| 5 | Family sweeps with every variant published, losers included | `data/reports/strategy-sweep-{1440,60}m-{captured,modelled}.json`, `sweep-summary.json` |
| 6 | Research ledger: every public source, how it was read, what was taken, what cannot be tested | `src/research-sources.js` → Research tab |
| 7 | Liquidity measured from the real captured ladders (no impact model) | `data/reports/liquidity-depth.json`, `src/captured-depth.js` |
| 8 | Four flights (daily, hourly, hourly-error) with promotion rules | `data/reports/flights.json`, `runCompetitionFlights` |

## Next, in priority order

1. **Let the store grow, then re-measure.** The daily window is 268 periods
   (2025-12-24 → 2026-09-18). Re-running the sweep after a few months of new
   bars is the cheapest real test of every family here.
   *Needs:* nothing but time and the scheduled workflow.
2. **True forward windows.** `designedAt` is 2026-09-17/18 for every roster
   entry, so the strict forward window is still empty by construction. The
   competition starts producing genuine out-of-sample bars on 2026-09-19.
   *Check:* `data/reports/forward-test.json` → `strictForward.bars`.
3. **Weather markets.** The most-reported retail edge in the sources (R06) and
   the one missing series class. *Needs:* a liquid daily-high series ingested
   plus an archived point-in-time forecast (no archive = no honest test).
4. **One-minute candles for one or two markets.** The R01 source traded
   15-minute markets; 60-minute bars cannot represent that. *Needs:* a bounded
   `--period=1` request in `data/history/_ingest-request.json`.
5. **Captured depth on every fill.** `src/captured-depth.js` covers 30 markets
   but the ladders are re-anchored from a single capture; streaming captures
   would make the touch itself point-in-time. *Needs:* repeated `--with-books`
   snapshots during the trading day.
6. **Real settlements.** Every tracked market resolves on or after 2026-12-31.
   Until one does, every open position is marked to the last real quote and the
   site says so. *Needs:* nothing — `scripts/track-settlements.mjs` polls daily.
7. **Authenticated WebSocket smoke test.** `KALSHI_API_KEY_ID` /
   `KALSHI_API_PRIVATE_KEY` are not configured here, so the private channels are
   documented but untested. *Needs:* an RSA key in the runner environment.
8. **A browser-level UI test.** No headless browser can be installed in this
   environment (Playwright download is unreachable), so `test/ui-smoke.mjs`
   exercises `src/app.js` against a DOM stub. *Needs:* a runner with network
   access to a browser download.
9. **Second venue for cross-venue arbitrage.** Every arbitrage source reviewed
   trades two venues; this project holds Kalshi only, deliberately.
   *Needs:* a second venue feed with the same verification standard.

## Known limitations (kept in sync with the README)

- Depth behind the touch is modelled unless a captured ladder exists, and the
  label travels with every number that uses it.
- 352 of 7,189 stored bars (4.9%) printed no trade at all.
- The daily window is ~9 months; a year-long competition needs a year of bars.
- Human participants are paper-only: the store is a single-process JSON file
  (`data/store/`, git-ignored).
