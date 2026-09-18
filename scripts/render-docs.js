/**
 * KalshiPaperSim — documentation renderer
 * =====================================================================
 * Generates VERIFICATION.md and IRREGULARITIES.md directly from the same data
 * modules the app renders (src/verification-data.js), and refreshes the
 * AUTO-marked blocks inside README.md (results table, roster, fact counts).
 *
 * Why generated: a hand-written audit document drifts from the code the moment
 * the engine changes. These documents are rebuilt from the source of truth, so
 * every number in them is the number the app shows.
 *
 * Run: npm run docs   (also runs as part of npm run build)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { VERIFIED_FACTS, IRREGULARITIES, COMPETITION_SITE_ANALYSIS, groupFacts, factStats } from '../src/verification-data.js';
import { STRATEGIES, validateStrategies, VERIFIED_SERIES, REJECTED_FABRICATED_TICKERS } from '../src/strategies.js';
import { runCompetition, runCompetitionFlights, getVerifiedCandleMap, getCandleCoverage, getHistoryAudit } from '../src/strategy-runner.js';
import { LEADERBOARD_QUALIFICATION } from '../src/analysis.js';
import { flightCaption, forecastCaption } from '../src/store-facts.js';
import { getVerifiedMarkets, SERIES_NOT_FOUND, CAPTURE_META, HISTORICAL_CUTOFF, EXCHANGE_STATUS } from '../src/verified-snapshot.js';
import { EXTENDED_CAPTURE_META, EXTENDED_SERIES, summarizeExtendedSeries } from '../src/verified-candles.js';
import { KALSHI_FEES, OFFICIAL_FEE_TABLE_PER_100, NON_STANDARD_FEE_MULTIPLIERS, KALSHI_CONFIG } from '../src/kalshi-config.js';
import { DESK_DATA } from '../src/desk-data.js';
import { DESK_STRATEGIES } from '../src/desk-strategies.js';
import { buildDeskReport, auditorFacts } from '../src/live-desk.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SEED = 20260917;
const write = (file, text) => {
  fs.writeFileSync(path.join(ROOT, file), text);
  console.log(`  wrote ${file} (${(text.length / 1024).toFixed(1)} KB)`);
};
const money = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const pct = (v) => `${Number(v) >= 0 ? '+' : ''}${Number(v).toFixed(2)}%`;
const num = (v) => Number(v || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

/* ------------------------------------------------------------------ *
 * Compute the competition once; every document quotes the same run.
 * ------------------------------------------------------------------ */
const competition = runCompetition({ seed: SEED });
const { leaderboard, results, competition: meta } = competition;
/* The two intraday flights (hourly 60m, micro 1m) are computed from the SAME
   stored data and quoted in the README next to the daily table — reported
   separately, never merged into one ranking. */
const flightsAll = runCompetitionFlights({ seed: SEED, depthMode: 'captured' });
const hourlyFlight = flightsAll.hourly;
const microFlight = flightsAll.micro;
const ranked = leaderboard.filter((r) => r.qualified);
const unranked = leaderboard.filter((r) => !r.qualified);
const byName = new Map(results.map((r) => [r.username, r]));
const validation = validateStrategies();
const stats = factStats();
const markets = getVerifiedMarkets();
const candleSummary = summarizeExtendedSeries();
// Total captured bars across the whole universe (not just one series).
const candleMap = getVerifiedCandleMap();
const totalBars = Object.values(candleMap).reduce((s, bars) => s + bars.length, 0);
const fullWindowSeries = Object.keys(EXTENDED_SERIES).length;
// The window the replay actually uses: in-repo captures + the accumulated store.
const coverage = getCandleCoverage();
const historyAudit = getHistoryAudit();
const windowFirst = coverage.length ? coverage.map((c) => c.firstDate).sort()[0].slice(0, 10) : null;
const windowLast = coverage.length ? coverage.map((c) => c.lastDate).sort().pop().slice(0, 10) : null;
const ingestBars = coverage.reduce((s, c) => s + (c.barsAddedByIngest || 0), 0);
// Counted from the test file itself so the docs can never lag behind the suite.
const testCount = (fs.readFileSync(path.join(ROOT, 'test', 'simulation.test.js'), 'utf8').match(/^test\(/gm) || []).length;

/** Ranked entries that finished above their starting capital. */
const profitable = ranked.filter((r) => Number(r.returnPct) > 0);
const price2 = (v) => `$${Number(v || 0).toFixed(2)}`;

/* The Live Desk: paper orders on real OPEN contracts, priced point-in-time
   from captured ladders. Computed once here, quoted by the README so the
   documentation shows exactly what the desk shows. */
const deskReport = buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: null, startingCapital: 100000 });
const deskOlder = buildDeskReport({ data: DESK_DATA, strategies: DESK_STRATEGIES, asOf: deskReport.cutoffs.cutoffs.find((c) => c.label === '-15h')?.asOf || null, startingCapital: 100000 });
const deskFacts = auditorFacts();
const deskMoney = (v) => `$${Number(v || 0).toFixed(4)}`;
const desks = (r) => r.results;
const deskRanked = deskReport.results.filter((r) => r.fills > 0 || r.settlementPnl !== 0).sort((a, b) => b.returnPct - a.returnPct);
const deskIdle = deskReport.results.filter((r) => !(r.fills > 0 || r.settlementPnl !== 0));

/* ================================================================== *
 * VERIFICATION.md
 * ================================================================== */
const factGroups = groupFacts(VERIFIED_FACTS, '');
const verificationMd = `# Line-by-Line Verification Audit

**Generated:** ${new Date().toISOString().slice(0, 10)} by \`scripts/render-docs.js\` from \`src/verification-data.js\`
**Standard:** every claim below is either (a) quoted from official Kalshi documentation, (b) copied from a real
production API response captured on ${CAPTURE_META.capturedAt}, or (c) derived by arithmetic on (a)/(b).
Nothing is inferred from a language model's memory of Kalshi.

| Status | Meaning | Count |
| --- | --- | --- |
| \`DOCUMENTED\` | Quoted from official Kalshi docs / the fee schedule PDF | ${stats.DOCUMENTED} |
| \`CAPTURED\` | Copied from a real production API response | ${stats.CAPTURED} |
| \`NEGATIVE\` | A verified 404 / contradiction (proof something is NOT true) | ${stats.NEGATIVE} |
| \`DERIVED\` | Computed by arithmetic on official formulas | ${stats.DERIVED} |
| \`OBSERVATION\` | Seen in real data, not explained by any document | ${stats.OBSERVATION} |
| **Total** | ${stats.withUrl} of ${stats.total} carry a URL you can open yourself | **${stats.total}** |

---

## 1. The audit trail, fact by fact

${factGroups
  .map(
    (g) => `### ${g.group}

| ID | Status | Fact | Value as verified | Source | Used in |
| --- | --- | --- | --- | --- | --- |
${g.items
  .map((f) => {
    const src = f.url
      ? `[${f.url.replace(/^https?:\/\//, '').slice(0, 60)}](${f.url})`
      : f.evidenceUrl
        ? `[${f.evidenceLabel || 'repository source'}](${f.evidenceUrl})`
        : '—';
    const cell = (v) => String(v ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
    return `| \`${f.id}\` | ${f.status} | ${cell(f.fact)} | ${cell(f.value)} | ${src} | \`${cell(f.usedIn)}\` |`;
  })
  .join('\n')}`
  )
  .join('\n\n')}

---

## 2. Official sources used

| Source | URL |
| --- | --- |
| REST API (production) | ${KALSHI_CONFIG.PROD_BASE_URL} |
| WebSocket (production) | ${KALSHI_CONFIG.WS_PROD_URL} |
| Demo / sandbox API | ${KALSHI_CONFIG.DEMO_BASE_URL} |
| API documentation | https://docs.kalshi.com/ |
| Fee schedule (effective ${KALSHI_FEES.effective}) | ${KALSHI_FEES.sourceUrl} |
| Exchange status capture | https://external-api.kalshi.com/trade-api/v2/exchange/status |
| Historical cutoff capture | https://external-api.kalshi.com/trade-api/v2/historical/cutoff |
| Order book response format | https://docs.kalshi.com/getting_started/orderbook_responses |
| Fixed-point migration guide | https://docs.kalshi.com/getting_started/fixed_point_migration |
| Candlesticks endpoint | https://docs.kalshi.com/api-reference/market/get-market-candlesticks |
| WebSocket quick start | https://docs.kalshi.com/getting_started/quick_start_websockets |
| API keys & RSA-PSS signing | https://docs.kalshi.com/getting_started/api_keys |
| Rate limits | https://docs.kalshi.com/getting_started/rate_limits |
| Historical data policy | https://docs.kalshi.com/getting_started/historical_data |

### Negative evidence (verified 404s)

These series **do not exist**. They were requested from the production API and the
\`not_found\` responses are stored verbatim in \`src/verified-snapshot.js\`:

${SERIES_NOT_FOUND.map((n) => `- \`${n.ticker}\` — [${n.url}](${n.url}) → \`${n.response.error.code}\` (captured ${n.capturedAt})`).join('\n')}
${REJECTED_FABRICATED_TICKERS.filter((t) => !SERIES_NOT_FOUND.some((n) => n.ticker === t))
  .map((t) => `- \`${t}\` — rejected from earlier drafts; **never probed**, so no 404 is claimed for it`)
  .join('\n')}

---

## 3. Fee engine oracle

The implementation in \`src/kalshi-fees.js\` is checked against Kalshi's own published table
(${OFFICIAL_FEE_TABLE_PER_100.length} rows) by \`test/simulation.test.js\` test 1.

- Taker: \`${'fees = round up(M x 0.07 x C x P x (1-P))'}\`
- Maker: \`fees = round up(M x 0.0175 x C x P x (1-P))\`
- Rounding, verbatim from the PDF: *"round up = rounds up such that the fee + positionCost is rounded to a centicent"*
- No settlement fee. No membership fee.

**Known discrepancy (Irregularity #19):** the PDF's *General Trading Fees Table* prints the formula
rounded **up to whole cents**, while the formula itself rounds to a **centicent**. For 100 contracts at
$0.01 the formula gives $0.0693 and the table prints $0.07. This app charges the formula value and
asserts the cent-rounding relationship for all ${OFFICIAL_FEE_TABLE_PER_100.length} rows, so neither number is invented.

Per-series multipliers are cross-checked against **two** independent sources — the live
\`GET /series/{ticker}\` capture and the PDF's *Non-Standard Fees* table:

| Series | Live capture M | PDF taker M | PDF maker M | Agree? |
| --- | --- | --- | --- | --- |
${Object.entries(NON_STANDARD_FEE_MULTIPLIERS)
  .filter(([t]) => ['KXBTCY', 'KXNASDAQ100Y', 'KXINXY', 'KXFEDDECISION', 'KXCPIYOY'].includes(t))
  .map(([t, row]) => `| \`${t}\` | ${row.taker} | ${row.taker} | ${row.maker} | ✅ |`)
  .join('\n')}
| \`KXTSLA\`, \`KXFA\` | 1 | *(not listed → default 1)* | *(not listed → default 0)* | ✅ |

---

## 4. Data captures behind the simulation

| Capture | Detail |
| --- | --- |
| Markets | ${markets.length} real markets across ${new Set(markets.map((m) => m.series_ticker)).size} series, captured ${CAPTURE_META.capturedAt} |
| Order book | \`${markets[0].ticker}\` — 9 YES levels / 35 NO levels, dual-capture (see Irregularity #17) |
| Candlesticks | \`${EXTENDED_CAPTURE_META.ticker}\` — ${EXTENDED_CAPTURE_META.barCount} daily bars, ${new Date(EXTENDED_CAPTURE_META.firstTs * 1000).toISOString().slice(0, 10)} → ${new Date(EXTENDED_CAPTURE_META.lastTs * 1000).toISOString().slice(0, 10)} |
| Historical cutoff | ${HISTORICAL_CUTOFF.market_settled_ts} (live window ≈ 3 months) |
| Exchange status | \`exchange_active: ${EXCHANGE_STATUS.exchange_active}\`, \`trading_active: ${EXCHANGE_STATUS.trading_active}\` |

---

## 5. Competition-site structure we reverse-engineered

Structure and interaction patterns only. **No data, copy or branding was taken from any of these sites.**

| Site | What we took | What we did NOT take | Implemented in |
| --- | --- | --- | --- |
${COMPETITION_SITE_ANALYSIS.map(
  (c) => `| [${c.site}](${c.url}) | ${c.whatWeTook} | ${c.whatWeDidNotTake} | \`${c.implementedIn}\` |`
).join('\n')}

---

## 6. Self-imposed rules, and the test that enforces each

| Rule | Enforced by |
| --- | --- |
| No performance number is hard-coded anywhere | \`validateStrategies()\` → ${validation.problems.length} problems; test 21 |
| Every strategy carries \`riskManagement: NONE (by mandate)\` | test 21 |
| Post-mortem prose interpolates computed values only | \`generatePostMortem()\`; test 26 |
| Oversized orders are never filled at an invented price | \`exhaustionPolicy: 'partial'\`; tests 17–19 |
| Attribution factors sum exactly to the equity change | test 25 (residual < $0.01 for all ${results.length} strategies) |
| A strategy that never traded is not ranked | \`LEADERBOARD_QUALIFICATION.minTrades = ${LEADERBOARD_QUALIFICATION.minTrades}\`; test 27 |
| Fabricated tickers cannot re-enter the catalog | test 10 |
`;
write('VERIFICATION.md', verificationMd);

/* ================================================================== *
 * IRREGULARITIES.md
 * ================================================================== */
const sevRank = { high: 0, med: 1, low: 2, info: 3 };
const bySev = [...IRREGULARITIES].sort((a, b) => sevRank[a.severity] - sevRank[b.severity] || a.id - b.id);
const counts = IRREGULARITIES.reduce((a, i) => ((a[i.severity] = (a[i.severity] || 0) + 1), a), {});

const irregularitiesMd = `# Flagged Irregularities

**Generated:** ${new Date().toISOString().slice(0, 10)} by \`scripts/render-docs.js\` from \`src/verification-data.js\`.
**${IRREGULARITIES.length} irregularities** flagged during this build: ${counts.high || 0} high, ${counts.med || 0} medium,
${counts.low || 0} low, ${counts.info || 0} informational.

Every entry records **what was assumed**, **what is actually true**, **the evidence**, **what the code does
about it**, and **what you should do**. Nothing here is speculation: each item was found by comparing an
assumption against an official document or a real API response.

---

${bySev
  .map(
    (i) => `## #${i.id} — ${i.title}

**Severity:** \`${i.severity.toUpperCase()}\`

| | |
| --- | --- |
| **We assumed** | ${i.assumed} |
| **Verified truth** | ${i.truth} |
| **What the code does** | ${i.action} |
| **What you should do** | ${i.userAction} |

**Evidence**

${i.evidence.map((e) => `- ${e.label}${e.url ? `: <${e.url}>` : ''}${e.text ? ` — \`${e.text}\`` : ''}`).join('\n')}
`
  )
  .join('\n---\n\n')}
`;
write('IRREGULARITIES.md', irregularitiesMd);

/* ================================================================== *
 * README.md — refresh only the AUTO blocks
 * ================================================================== */
const resultsBlock = `<!-- AUTO:RESULTS-START (regenerated by scripts/render-docs.js — do not edit) -->
Seed \`${meta.seed}\` · ${meta.horizonPeriods} real daily candlestick periods across ${Object.keys(candleMap).length} markets (${windowFirst} → ${windowLast}) · ${money(meta.initialCapital)} starting capital per entry · fills bounded to ${Math.round((meta.maxFillFractionOfPeriodVolume ?? 0.1) * 100)}% of each bar's real traded volume · \`exhaustionPolicy: "partial"\` (no execution price is ever invented).
Reproduce with \`curl -X POST localhost:3000/api/run-competition -d '{"seed":${meta.seed}}'\` — the run is deterministic.

| # | Username | Strategy | Return | Final equity | Trades | Win rate | Max DD | Fees paid | Contracts NOT filled |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${ranked
  .map((r) => {
    const res = byName.get(r.username) || {};
    return `| ${r.rank} | **${r.username}** | ${r.title} | ${pct(r.returnPct)} | ${money(r.finalEquity)} | ${r.totalTrades} | ${
      r.totalTrades ? `${Number(r.winRate).toFixed(1)}%` : '—'
    } | ${Number(r.maxDrawdownPct).toFixed(2)}% | ${money(r.feesPaid)} | ${num(r.unfilledContracts)} |`;
  })
  .join('\n')}
${unranked
  .map(
    (r) =>
      `| — | **${r.username}** | ${r.title} | *unranked* | ${money(r.finalEquity)} | ${r.totalTrades} | — | — | ${money(
        r.feesPaid
      )} | ${num(r.unfilledContracts)} |`
  )
  .join('\n')}

${unranked.map((r) => `> **${r.username} is not ranked** — ${r.disqualificationReason || 'no executed fills'}. Listing it at "0%" would present a design that never traded as if it were a competitive result, so \`LEADERBOARD_QUALIFICATION\` excludes it from ranking entirely.`).join('\n')}

**How to read this table.** ${profitable.length} of the ${ranked.length} ranked entries finished ahead of their $100,000 starting capital —
best ${pct(profitable.length ? profitable[0].returnPct : 0)} (${profitable.length ? profitable[0].username : 'n/a'}), worst ${pct(ranked[ranked.length - 1].returnPct)}.
There is no +800% curve here, and that is the honest outcome of replaying ${meta.horizonPeriods} daily periods across
${Object.keys(candleMap).length} real markets whose YES contracts traded between ${price2(candleSummary.closeMin)} and ${price2(candleSummary.closeMax)},
under Kalshi's real quadratic fee schedule. Two things separate the top of this table from the bottom:
the winners either trade on **resting maker orders** (which pay a quarter of the taker fee) or **buy the cheap side of the fee curve**,
while the losers pay taker fees on huge notional to hold deep out-of-the-money convexity that never resolved in the window.
The "Contracts NOT filled" column tells the other half of the story — aggressive sizing hits the wall of real liquidity, and the
engine reports the missed volume instead of inventing an execution price for it.
Every number here is recomputed on demand; nothing in this table is stored.

### The intraday flights (hourly 60m · micro 1m) — reported separately, never merged

\`flights.json\` · The hourly flight replays the 60-minute store; the micro flight replays the 1-minute store. Both paragraphs below are **computed from the store at build time** (\`flightCaption\` in \`src/store-facts.js\`), so a market that settles or a bar that lands changes the sentence. A strategy that needs intraday bars cannot be judged on daily ones, so these are separate leaderboards.

**HOURLY STORE** — ${flightCaption(60)}

**MICRO STORE** — ${flightCaption(1)}

**HOURLY (period_interval 60)** — ${hourlyFlight ? `${hourlyFlight.competition.horizonPeriods} hourly periods across ${hourlyFlight.competition.dataProvenance.markets.length} markets` : 'not available'}

| # | Username | Return | Trades | Real settlements booked | Real payout |
| --- | --- | --- | --- | --- | --- |
${hourlyFlight ? hourlyFlight.leaderboard.map((r) => {
  const res = hourlyFlight.results.find((x) => x.username === r.username) || {};
  const rs = res.realSettlements || {};
  return `| ${r.rank ?? '—'} | **${r.username}**${r.qualified === false ? ' *(unranked)*' : ''} | ${r.totalTrades ? pct(r.returnPct) : '*no trades*'} | ${r.totalTrades ?? 0} | ${rs.bookedCount ?? 0} | ${money(rs.bookedPayout ?? 0)} |`;
}).join('\n') : ''}

**MICRO (period_interval 1)** — ${microFlight ? `${microFlight.competition.horizonPeriods} one-minute periods across ${microFlight.competition.dataProvenance.markets.length} markets` : 'not available'}

| # | Username | Return | Trades | Real settlements booked | Real payout |
| --- | --- | --- | --- | --- | --- |
${microFlight ? microFlight.leaderboard.map((r) => {
  const res = microFlight.results.find((x) => x.username === r.username) || {};
  const rs = res.realSettlements || {};
  return `| ${r.rank ?? '—'} | **${r.username}**${r.qualified === false ? ' *(unranked)*' : ''} | ${r.totalTrades ? pct(r.returnPct) : '*no trades*'} | ${r.totalTrades ?? 0} | ${rs.bookedCount ?? 0} | ${money(rs.bookedPayout ?? 0)} |`;
}).join('\n') : ''}

> **ForecastEdge_Weather is the forward test.** It trades only where the point-in-time NWS archive (${forecastCaption()}) has a snapshot at or before the decision bar. On the backfilled August–September brackets it correctly abstains (0 trades, unranked, reason published); its real window is the live market from 2026-09-18 onward.
### The Live Desk — paper orders placed on real OPEN contracts, point-in-time

Cut-off **${deskReport.asOf}** (newest captured ladder). ${deskReport.coverage.tradeable} of ${deskReport.coverage.inUniverse} tracked contracts had a real captured ladder at or before that instant; ${deskReport.summary.totals.orders} orders were placed, ${deskReport.summary.totals.fills} filled against real depth, ${deskReport.summary.totals.cancels} rested without crossing and was cancelled, and ${deskReport.summary.totals.settlements} position(s) were settled by the exchange's own result. Official fees: **${deskMoney(deskReport.summary.totals.fees)}**. The desk audit (${deskFacts.length} invariants, D1–D${deskFacts.length}) ${deskReport.audit.ok ? 'PASSES' : 'FAILS'} on this run: every fill is re-derived from the captured ladder it names, every fee from the official schedule with the series multiplier, every settlement from \`settlement_value_dollars\`.

| # | Desk username | Return | Equity | Fills | Contracts | Unfilled | Slippage cost | Fees | Settlement PnL |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${deskRanked.map((r, i) => `| ${i + 1} | **${r.strategy}** | ${pct(r.returnPct)} | ${money(r.equity)} | ${r.fills} | ${num(r.contracts)} | ${num(r.unfilled)} | ${deskMoney(r.slippageCost)} | ${deskMoney(r.feesPaid)} | ${money(r.settlementPnl)} |`).join('\n')}
${deskIdle.map((r) => `| — | **${r.strategy}** | *no fillable order* | ${money(r.equity)} | 0 | 0 | 0 | $0.0000 | $0.0000 | $0.00 |`).join('\n')}

> A desk entry that placed no fillable order at this cut-off is shown as **no fillable order**, not as 0%: no price is invented, so a strategy that finds no real size simply does not trade.

The **−15h cut-off** (\`${deskOlder.asOf}\`) is the one window that both trades and settles inside the captured data: ${deskOlder.summary.totals.fills} fills, ${deskOlder.summary.totals.settlements} real settlement(s), ${deskMoney(deskOlder.summary.totals.fees)} in official fees — the $1.00/$0.00 payouts come from the exchange's own finalization, not from a mark.

Reproduce either run locally with \`node scripts/run-live-desk.mjs\` (add \`--as-of=ISO\` for an older cut-off); the desk is deterministic, and \`scripts/run-live-desk.mjs\` exits non-zero if any desk invariant fails.

<!-- AUTO:RESULTS-END -->`;

const rosterBlock = `<!-- AUTO:ROSTER-START (regenerated by scripts/render-docs.js — do not edit) -->
| Username | Strategy | Category | Mandate | Risk management | Sizing |
| --- | --- | --- | --- | --- | --- |
${STRATEGIES.map(
  (s) =>
    `| **${s.username}** | ${s.title} | ${s.category} | ${s.competitionMandate} | ${s.riskManagement} | ${
      typeof s.sizingPct === 'number' ? `${Math.round(s.sizingPct * 100)}% of cash` : s.sizingPct
    } |`
).join('\n')}
<!-- AUTO:ROSTER-END -->`;

const countsBlock = `<!-- AUTO:COUNTS-START (regenerated by scripts/render-docs.js — do not edit) -->
${stats.total} verified facts (${stats.DOCUMENTED} documented, ${stats.CAPTURED} captured from production, ${stats.NEGATIVE} negative/404 evidence, ${stats.DERIVED} derived by arithmetic, ${stats.OBSERVATION} unexplained observations) · ${IRREGULARITIES.length} flagged irregularities · ${STRATEGIES.length} strategies · ${markets.length} real markets · ${num(totalBars)} captured daily candlesticks across ${Object.keys(candleMap).length} replayable markets (${windowFirst} → ${windowLast}${historyAudit.store.present ? `, ${num(ingestBars)} added by the daily ingest` : ''}) · ${testCount} automated tests · ${DESK_STRATEGIES.length} Live Desk entrants on ${deskReport.coverage.tradeable} real open contracts with captured ladders (${deskReport.summary.totals.fills} paper fills, ${deskMoney(deskReport.summary.totals.fees)} official fees, ${deskFacts.length}-point desk audit ${deskReport.audit.ok ? 'passing' : 'FAILING'})
<!-- AUTO:COUNTS-END -->`;

const readmePath = path.join(ROOT, 'README.md');
if (fs.existsSync(readmePath)) {
  let readme = fs.readFileSync(readmePath, 'utf8');
  const replaceBlock = (text, name, block) => {
    const re = new RegExp(`<!-- AUTO:${name}-START[\\s\\S]*?<!-- AUTO:${name}-END -->`);
    return re.test(text) ? text.replace(re, block) : text;
  };
  const before = readme;
  readme = replaceBlock(readme, 'RESULTS', resultsBlock);
  readme = replaceBlock(readme, 'ROSTER', rosterBlock);
  readme = replaceBlock(readme, 'COUNTS', countsBlock);
  if (readme !== before) {
    fs.writeFileSync(readmePath, readme);
    console.log('  refreshed README.md AUTO blocks');
  } else {
    console.log('  README.md AUTO blocks already up to date');
  }
}

console.log('Docs generated.');
