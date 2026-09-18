# Roadmap — what is done, what is next, and what is blocked

This file is the honest queue for KalshiPaperSim. Every item says what it would
change, what it needs, and how a reader could check it. Nothing here is a
promise; items leave this file only when the work is committed **and** measured.

Last reviewed: 2026-09-18 (the Arena session on branch
`arena/01a0b330-kalshipapersim` — Pass 3 added the nine-city forecast archive
with verified NWS point identities, the `ForecastEdge_MultiCity` forward test,
and the guards that caught a real capture bug, irregularity #40).

## Shipped (with the evidence a reader can rerun)

| # | Item | Evidence |
|---|------|----------|
| 1 | Daily bars accumulated by a GitHub-hosted ingest job (the sandbox cannot reach `*.kalshi.com` — Irregularity #4) | `data/history/*.json`, `data/history/_last-run.log`, workflow `ingest-now.yml` |
| 2 | Store verified against the live API, field-for-field, on every run | `scripts/verify-store-live.mjs` → `data/reports/store-verification.json` |
| 3 | Intraday 60-minute store, bounded by `--max-bars` with every trim recorded | `data/history/intraday/60m/` (52 markets incl. 40 weather brackets), `trims[]` in each store file |
| 4 | Walk-forward split (in-sample vs post-split) in the engine | `src/forward-test.js`, `noTradeBeforeTs` in `src/backtest-replay.js`, `--oos-split` in `scripts/strategy-sweep.mjs` |
| 5 | Family sweeps with every variant published, losers included | `data/reports/strategy-sweep-{1440,60}m-{captured,modelled}.json`, `sweep-summary.json` |
| 6 | Research ledger: every public source, how it was read, what was taken, what cannot be tested | `src/research-sources.js` → Research tab |
| 7 | Liquidity measured from the real captured ladders (no impact model) | `data/reports/liquidity-depth.json`, `src/captured-depth.js` |
| 8 | Four flights (daily, hourly, hourly-error) with promotion rules | `data/reports/flights.json`, `runCompetitionFlights` |
| 9 | **Weather markets (was the #1 next item).** KXHIGHNY brackets ingested at 60-minute resolution INCLUDING settled markets with the exchange's own results (39 of 40 finalized) | `data/history/intraday/60m/KXHIGHNY-*.json`, ingest block `hourly-weather-settled` in `data/history/_ingest-request.json`, VERIFICATION facts V82–V85 |
| 10 | **One-minute candles (was the #4 next item).** KXGOLD15M 15-minute gold markets at 1-minute resolution (8 settled contracts, 128 bars) | `data/history/intraday/1m/`, ingest block `minute-gold-15m-markets`, fact V86 |
| 11 | **Real settlements inside the replay (was the #6 next item, early).** Any captured market that is finalized with a result settles open positions at its real close_time for $1.00/$0.00 — and strategies can never see `market.result` before settlement (redaction + test) | `src/backtest-replay.js` realSettlements; tests 70–72; facts V89, V90-adjacent |
| 12 | **Point-in-time forecast archive.** The official NWS point forecast for Central Park captured ~5×/day, each snapshot time-stamped; queries refuse any snapshot captured after the decision bar | `scripts/archive-forecasts.mjs`, workflow `weather-signals.yml`, `data/forecasts/nyc-central-park.json`, `src/forecast-store.js` (facts V87, V88, V90) |
| 13 | **MasterSite signal-source review.** All 13 projects the owner asked about (CEO … PinePilot) catalogued with links, testability verdicts and flags (CEO missing, GOLD is rings) | `src/signal-sources.js` → Research tab; irregularities #32, #33; test 76 |
| 14 | Third flight: MICRO (period_interval 1) so 15-minute-market strategies are judged at their own granularity | `runCompetitionFlights` micro; `flights.json` |
| 15 | **Nine-city forecast archive (was Next #2/#3).** All nine KXHIGH* cities archived ~5×/day, each store carrying the NWS identity (grid office, grid x/y, zone, time zone) that the live API answered for its coordinates, cross-checked against the configuration on every capture and against the captured forecast URL in the offline audit | `data/forecasts/*.json`, `nwsGrid` in `scripts/archive-forecasts.mjs`, facts V98–V100, irregularity #40, test 90 |
| 16 | **Per-series fee registry, incl. every weather city and KXGOLD15M** (was Next #4). Fee multiplier is now the captured one, not a default | `src/series-fee-registry.js` (47 priceable series), `data/discovered/series-fees.json` (14,154 series) |

## Next, in priority order

1. **Let the forecast archive and the weather bars overlap, then measure.**
   The archive's first capture is 2026-09-18T03:19Z. `ForecastEdge_Weather`
   trades only where a snapshot exists at decision time, so its genuine forward
   window begins with the brackets that were still trading after that instant
   (e.g. KXHIGHNY-26SEP17-B82.5, active at capture). *Needs:* the scheduled
   workflows only — then re-run the reports and read the post-split numbers.
   *Check:* `data/reports/flights.json` → `forecastArchive` + the hourly
   leaderboard.
2. **True forward windows for the original roster.** `designedAt` is
   2026-09-17/18, so bars from 2026-09-19 onward are genuinely out-of-sample
   for every entry. *Check:* `data/reports/forward-test.json` →
   `strictForward.bars`.
3. **A sports or FDA series (the biggest signal-ledger gaps).** The
   signal-source review (Research tab) lists exactly what each project
   (NFL/NBA injury, FDA PDUFA, scoreboards) would need: an ingested Kalshi
   series plus that project's data archived point-in-time. The machinery now
   exists (any period, settled markets, real settlements, signal providers).
4. **Captured depth on every fill.** The ladders are re-anchored from single
   captures; repeated `--with-books` snapshots during the trading day would
   make the touch itself point-in-time. *Needs:* an extra scheduled ingest
   with `with_books=true` mid-day.
5. **Authenticated WebSocket smoke test.** `KALSHI_API_KEY_ID` /
   `KALSHI_API_PRIVATE_KEY` are not configured here, so the private channels
   are documented but untested. *Needs:* an RSA key in the runner environment.
6. **A browser-level UI test.** No headless browser can be installed in this
   environment, so `test/ui-smoke.mjs` exercises `src/app.js` against a DOM
   stub. *Needs:* a runner with network access to a browser download.
7. **Second venue for cross-venue arbitrage.** Every arbitrage source reviewed
   trades two venues; this project holds Kalshi only, deliberately.
   *Needs:* a second venue feed with the same verification standard.

## Known limitations (kept in sync with the README)

- Depth behind the touch is modelled unless a captured ladder exists, and the
  label travels with every number that uses it.
- The weather universe is the top-40 KXHIGHNY brackets by exchange-reported
  lifetime volume plus the 60-minute stores for the other eight cities (2–3
  bands per event each), not the full ~15-band board a live trader could buy —
  measured on a sample, stated on the strategy.
- `ForecastEdge_MultiCity` is a genuine forward test: the archive begins
  2026-09-18 and the ingested bars end the same day, so it reports
  `UNTESTED_ON_THIS_DATASET` (0 fills) rather than a fabricated backtest number.
- The archived point is the NWS forecast grid for the city; Kalshi settles on
  The Weather Company observations (Irregularity #34). The basis is real and
  published on the strategy, never netted out of the numbers.
- The forecast signal (NWS) and the settlement source (The Weather Company)
  are different providers (Irregularity #34) — real noise, published.
- The fee multiplier now comes from the captured Series object for every
  priceable series (irregularity #36 is closed for those). A series absent from
  the registry still falls back to the documented M=1, and the fill records
  which regime it used.
- The gold micro-flight sample is 8 settled contracts so far — the post-mortem
  says so; more settle every day the ingest runs.
- Human participants are paper-only: the store is a single-process JSON file
  (`data/store/`, git-ignored).
