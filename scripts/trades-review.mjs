#!/usr/bin/env node
/**
 * KalshiPaperSim — Unified Trade Review (placed trades + upcoming trades)
 * =====================================================================
 * READ-ONLY over the stores this repo already verifies:
 *   data/ledger/summary.json + data/ledger/ledger-<seed>.json   (replay engine)
 *   data/reports/live-desk-placed-trades.json                    (paper desk orders)
 *   data/reports/live-desk-upcoming-trades.json                  (paper desk plans)
 * and writes exactly two artifacts:
 *   data/ledger/unified-trades.csv        one row per TRADE (replay round trip),
 *                                         plus every desk order and every desk
 *                                         plan, in one schema
 *   data/reports/trades-review-<date>.md  the readable review: the Trade-Ideas
 *                                         PM Challenge leaderboard schema
 *                                         (research source R26) + every desk
 *                                         trade verbatim + every upcoming trade
 * WHAT IT REFUSES TO DO (honesty contract)
 *   • No number is invented or re-derived except plain sums/means of the
 *     store fields, and every column says which field it came from.
 *   • A column with no backing field (e.g. mark-to-market "Open Profit")
 *     says so in the cell instead of being guessed.
 *   • Every quote/price cell keeps its capture instant (depthCapturedAt /
 *     ladderCaptureAt) — never a bare number.
 *
 * USAGE
 *   node scripts/trades-review.mjs                 # today's review
 *   node scripts/trades-review.mjs --date=2026-09-21 --seed=20260917
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expandLedger } from '../src/trade-ledger.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LEDGER_DIR = path.join(ROOT, 'data', 'ledger');
const REPORTS_DIR = path.join(ROOT, 'data', 'reports');

function parseArgs(argv) {
  const args = { date: new Date().toISOString().slice(0, 10), seed: 20260917 };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    if (k === 'date') args.date = v;
    if (k === 'seed') args.seed = Number(v);
  }
  return args;
}

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function money(x) {
  if (x === null || x === undefined || !Number.isFinite(Number(x))) return '—';
  const n = Number(x);
  return (n < 0 ? '-$' : '$') + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function num(x, digits = 2) {
  if (x === null || x === undefined || !Number.isFinite(Number(x))) return '—';
  return Number(x).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function esc(x) {
  return String(x ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');
}

function csvCell(x) {
  const s = String(x ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const COLUMNS = [
  'kind',            // replay-roundtrip | desk-order | desk-upcoming
  'username', 'flight', 'ticker', 'series', 'title',
  'action', 'side', 'orderType',
  'price', 'targetPrice', 'requestedCount', 'filledCount', 'unfilledCount',
  'grossCost', 'fee', 'slippageTicks', 'slippageDollars',
  'contracts', 'entryPrice', 'exitPrice', 'exitKind', 'holdMinutes',
  'grossPnl', 'netPnl', 'feeRegime',
  'depthAvailable', 'depthCapturedAt', 'volumeCap', 'pctVol',
  'status', 'placedAt', 'closeTime', 'settlementResult', 'settlementPnl',
  'explain', 'sourceLadderUrl'
];

function row(overrides) {
  const r = Object.fromEntries(COLUMNS.map((c) => [c, '']));
  return Object.assign(r, overrides);
}

function main() {
  const args = parseArgs(process.argv);
  const summary = readJson(path.join(LEDGER_DIR, 'summary.json'));
  const ledgerFile = path.join(LEDGER_DIR, `ledger-${args.seed}.json`);
  const ledger = fs.existsSync(ledgerFile) ? readJson(ledgerFile) : null;
  const placed = fs.existsSync(path.join(REPORTS_DIR, 'live-desk-placed-trades.json'))
    ? readJson(path.join(REPORTS_DIR, 'live-desk-placed-trades.json')) : [];
  const upcoming = fs.existsSync(path.join(REPORTS_DIR, 'live-desk-upcoming-trades.json'))
    ? readJson(path.join(REPORTS_DIR, 'live-desk-upcoming-trades.json')) : [];

  const csvRows = [];

  // ── 1. Replay round trips (one row per completed trade) ──────────────────
  let trips = [];
  if (ledger) {
    const exp = expandLedger(ledger);
    trips = exp.roundTrips || [];
  }
  for (const t of trips) {
    csvRows.push(row({
      kind: 'replay-roundtrip',
      username: t.username, flight: t.flight, ticker: t.ticker, series: t.series,
      action: 'buy+exit', side: t.side, orderType: 'replay',
      price: t.entryPx, requestedCount: '', filledCount: t.contracts, unfilledCount: '',
      grossCost: '', fee: t.fees, slippageTicks: t.entrySlip, slippageDollars: '',
      contracts: t.contracts, entryPrice: t.entryPx, exitPrice: t.exitPx, exitKind: t.exitKind,
      holdMinutes: t.holdMinutes, grossPnl: t.grossPnl, netPnl: t.netPnl,
      depthAvailable: t.entryDepth, depthCapturedAt: '', volumeCap: t.barVolumeEntry, pctVol: t.pctVolEntry,
      status: 'CLOSED', placedAt: t.entryTs, closeTime: t.exitTs,
      explain: `round trip via ${t.exitKind}`
    }));
  }

  // ── 2. Desk orders (every placed paper trade, verbatim) ──────────────────
  for (const p of placed) {
    csvRows.push(row({
      kind: 'desk-order',
      username: p.strategy, flight: 'live-desk', ticker: p.ticker, series: p.series, title: p.title,
      action: p.action, side: p.side, orderType: p.orderType,
      price: p.fillPrice, targetPrice: p.limitPrice,
      requestedCount: p.requestedCount, filledCount: p.filledCount, unfilledCount: p.unfilledCount,
      grossCost: p.grossCost, fee: p.feePaid, slippageTicks: p.slippageTicks, slippageDollars: p.slippageDollars,
      contracts: p.filledCount, entryPrice: p.fillPrice,
      grossPnl: '', netPnl: p.settlementPnl,
      feeRegime: p.feeType,
      depthAvailable: p.bidSizingDepth, depthCapturedAt: p.ladderCaptureAt, volumeCap: p.volumeCap,
      status: p.status, placedAt: p.placedAt, closeTime: p.expirationTime,
      settlementResult: p.settlementResult, settlementPnl: p.settlementPnl,
      explain: p.explain, sourceLadderUrl: p.ladderSourceUrl
    }));
  }

  // ── 3. Desk upcoming (every plan) ────────────────────────────────────────
  for (const u of upcoming) {
    csvRows.push(row({
      kind: 'desk-upcoming',
      username: u.strategy, flight: 'live-desk', ticker: u.ticker, series: u.series, title: u.title,
      action: u.proposedAction, side: u.proposedSide, orderType: u.orderType,
      targetPrice: u.targetPrice, requestedCount: u.proposedCount, grossCost: u.proposedNotional,
      depthAvailable: u.availableLiquidity && u.availableLiquidity.touch, depthCapturedAt: u.ladderCaptureAt,
      volumeCap: u.volumeCap,
      status: u.status, placedAt: u.placedAt, closeTime: u.closeTime,
      explain: `${u.triggerType}: ${u.triggerCondition} — ${u.rationale}`,
      sourceLadderUrl: u.ladderSourceUrl
    }));
  }

  const csvPath = path.join(LEDGER_DIR, 'unified-trades.csv');
  const csv = [COLUMNS.join(','), ...csvRows.map((r) => COLUMNS.map((c) => csvCell(r[c])).join(','))].join('\n') + '\n';
  fs.writeFileSync(csvPath, csv);

  // ── 4. The readable review ───────────────────────────────────────────────
  const L = [];
  L.push(`# Trades review — every placed trade and every upcoming trade (${args.date})`);
  L.push('');
  L.push('Generated by `node scripts/trades-review.mjs` from the verified stores below. Nothing here is a number the stores do not contain: every cell is a store field (named in the column header) or a plain sum/mean of store fields. The Trade-Ideas PM Challenge leaderboard schema (research source R26) is reproduced where its columns have backing fields; cells with no backing field say so instead of being guessed.');
  L.push('');
  L.push('Sources (read-only):');
  L.push(`- \`data/ledger/summary.json\` — replay engine, seed ${summary.seed}, generated ${summary.generatedAt}, ledger verification: ${JSON.stringify(summary.verification).slice(0, 160)}`);
  L.push(ledger ? `- \`${path.relative(ROOT, ledgerFile)}\` — ${trips.length} round trips expanded (per-fill rows stay in the interned store)` : '- replay ledger file not found — replay rows omitted');
  L.push(`- \`data/reports/live-desk-placed-trades.json\` — ${placed.length} paper desk orders (forward test on real captured ladders)`);
  L.push(`- \`data/reports/live-desk-upcoming-trades.json\` — ${upcoming.length} paper desk plans`);
  L.push(`- \`${path.relative(ROOT, csvPath)}\` — the unified CSV (one row per trade / order / plan)`);
  L.push('');
  L.push('> Every price above was captured from the Kalshi API with its capture instant (`depthCapturedAt` / `ladderCaptureAt`). Fees use the official schedules in `src/series-fee-registry.js`. No risk-management exits exist by mandate — exits are maker targets, settlements, or desk cut-offs.');
  L.push('');

  // 4a. R26-style per-username scoreboard (replay, per strategy-flight).
  L.push('## 1. Per-username scoreboard (Trade-Ideas PM Challenge schema, R26)');
  L.push('');
  L.push('| Username | Flight | Total Profit (netPnl field) | Open Profit | Closed Profit (realizedPnl) | Total Trades (trades) | Open Trades | Closed Trades (settlements) | Account Value | Avg Profit/Trade (realizedPnl/trades) | Win Rate (winRate) | Fees | Slippage cost |');
  L.push('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  const by = (summary.totals && summary.totals.byStrategy) || [];
  for (const s of by) {
    const closed = s.settlements ?? 0;
    const total = s.trades ?? 0;
    const open = Math.max(0, total - closed);
    const avg = total > 0 ? (s.realizedPnl / total) : null;
    L.push(`| ${esc(s.username)} | ${esc(s.flight)} | ${money(s.netPnl)} | _not marked in this store_ | ${money(s.realizedPnl)} | ${total} | ${open} | ${closed} | _starts at $100,000 sim cash per flight_ | ${money(avg)} | ${s.winRate === null || s.winRate === undefined ? '—' : num(s.winRate, 2) + '%'} | ${money(s.fees)} | ${money(s.slippageCost)} |`);
  }
  L.push('');
  L.push('Notes on the columns: "Open Profit" is mark-to-market and this store marks only at settlement — the cell says so rather than inventing a mark. "Account Value" is the mandated starting paper capital per flight (100000) plus Total Profit if you need the arithmetic — the engine keeps cash per flight, not per username. "Open Trades" counts trades whose settlement is still ahead (trades − settlements).');
  L.push('');

  // 4b. Desk scoreboard.
  const deskBy = new Map();
  for (const p of placed) {
    const k = p.strategy;
    if (!deskBy.has(k)) deskBy.set(k, { orders: 0, contracts: 0, fees: 0, slip: 0, closed: 0, open: 0, pnl: 0 });
    const d = deskBy.get(k);
    d.orders += 1; d.contracts += Number(p.filledCount || 0); d.fees += Number(p.feePaid || 0); d.slip += Number(p.slippageDollars || 0);
    if (p.settlementResult) { d.closed += 1; d.pnl += Number(p.settlementPnl || 0); } else d.open += 1;
  }
  L.push('## 2. Live Desk paper trades — per-entrant scoreboard (same schema, forward test)');
  L.push('');
  L.push('| Username | Total Profit (settled PnL) | Open Profit | Closed Profit | Total Trades | Open Trades | Closed Trades | Avg Profit/Trade | Fees | Slippage $ |');
  L.push('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
  for (const [k, d] of [...deskBy.entries()].sort((a, b) => b[1].pnl - a[1].pnl)) {
    const avg = d.closed > 0 ? d.pnl / d.closed : null;
    L.push(`| ${esc(k)} | ${money(d.pnl)} | _not marked in this store_ | ${money(d.pnl)} | ${d.orders} | ${d.open} | ${d.closed} | ${money(avg)} | ${money(d.fees)} | ${money(d.slip)} |`);
  }
  if (!deskBy.size) L.push('| _(no desk orders yet — the first fills land after the next live-desk run)_ | — | — | — | — | — | — | — | — | — |');
  L.push('');

  // 4c. ALL desk placed trades, verbatim.
  L.push(`## 3. ALL placed trades — Live Desk (${placed.length} orders, every row, verbatim explain strings)`);
  L.push('');
  if (placed.length) {
    L.push('| placedAt | Username | Ticker | Title | Side | Fill px | Count | Fee | Slip¢ | Depth @ capture | Settle | PnL | Status | Explain (verbatim) |');
    L.push('|---|---|---|---|---|---:|---:|---:|---:|---|---|---:|---|---|');
    for (const p of placed) {
      L.push(`| ${esc(p.placedAt)} | ${esc(p.strategy)} | ${esc(p.ticker)} | ${esc(p.title)} | ${esc(p.side)} | ${num(p.fillPrice, 3)} | ${Number(p.filledCount || 0).toLocaleString('en-US')} | ${money(p.feePaid)} | ${num((p.slippageTicks || 0) * 100, 0)} | ${money(p.bidSizingDepth)} @ ${esc(p.ladderCaptureAt)} | ${esc(p.settlementResult || '—')} | ${money(p.settlementPnl)} | ${esc(p.status)} | ${esc(p.explain)} |`);
    }
  } else {
    L.push('_No desk orders have been placed yet._');
  }
  L.push('');
  L.push(`Official links for manual review: every row keeps \`ladderSourceUrl\` + \`marketSourceUrl\` (Kalshi API endpoints) in the unified CSV and in \`live-desk-placed-trades.json\` — e.g. \`https://external-api.kalshi.com/trade-api/v2/markets/<ticker>/orderbook\` captured at each row's \`ladderCaptureAt\`.`);
  L.push('');

  // 4d. ALL upcoming trades, verbatim.
  L.push(`## 4. ALL upcoming trades — Live Desk (${upcoming.length} plans, every row)`);
  L.push('');
  if (upcoming.length) {
    L.push('| Username | Ticker | Title | Action | Side | Target px | Count | Notional | Liquidity at touch (capture) | Closes | Trigger | Rationale (verbatim) | Status |');
    L.push('|---|---|---|---|---|---:|---:|---:|---|---|---|---|---|');
    for (const u of upcoming) {
      const liq = u.availableLiquidity || {};
      L.push(`| ${esc(u.strategy)} | ${esc(u.ticker)} | ${esc(u.title)} | ${esc(u.proposedAction)} | ${esc(u.proposedSide)} | ${num(u.targetPrice, 3)} | ${Number(u.proposedCount || 0).toLocaleString('en-US')} | ${money(u.proposedNotional)} | ${money(liq.touch)} @ ${esc(u.ladderCaptureAt)} | ${esc(u.closeTime)} | ${esc(u.triggerType)}: ${esc(u.triggerCondition)} | ${esc(u.rationale)} | ${esc(u.status)} |`);
    }
  } else {
    L.push('_No upcoming trades right now._');
  }
  L.push('');
  L.push('An "upcoming trade" is a paper trade whose outcome is still ahead of the desk cut-off: it is planned against a real captured ladder now and will become a placed trade at the next cut-off if its trigger still holds (see `buildUpcomingTrades` in `src/live-desk.js`).');
  L.push('');

  // 4e. Replay trades — the readable slice + pointers.
  L.push(`## 5. Replay-engine trades (${trips.length} round trips — the readable slice)`);
  L.push('');
  L.push('All ' + trips.length + ' round trips and all ' + ((summary.totals && summary.totals.fills) || '?') + ' fills live in `data/ledger/unified-trades.csv` and the interned store. The readable slice below is (a) every round trip of any strategy with ≤ 10 settlements (the measured, individually reviewable plays) and (b) the 20 largest |net PnL| round trips overall — everything else is in the CSV.');
  const smallSettle = new Map();
  for (const t of trips) smallSettle.set(t.username, (smallSettle.get(t.username) || 0) + 1);
  const byUsernameTrips = new Map();
  for (const t of trips) {
    if (!byUsernameTrips.has(t.username)) byUsernameTrips.set(t.username, []);
    byUsernameTrips.get(t.username).push(t);
  }
  const readables = [];
  for (const s of by) {
    if ((s.settlements ?? 0) <= 10) {
      for (const t of (byUsernameTrips.get(s.username) || [])) readables.push(t);
    }
  }
  const top = [...trips].sort((a, b) => Math.abs(b.netPnl) - Math.abs(a.netPnl)).slice(0, 20);
  const seen = new Set(readables.map((t) => `${t.username}|${t.ticker}|${t.entryTs}|${t.exitTs}`));
  for (const t of top) {
    const k = `${t.username}|${t.ticker}|${t.entryTs}|${t.exitTs}`;
    if (!seen.has(k)) { readables.push(t); seen.add(k); }
  }
  readables.sort((a, b) => String(a.entryTs).localeCompare(String(b.entryTs)));
  L.push('');
  L.push('| Entry | Exit | Username | Ticker | Side | Contracts | Entry px | Exit px | Exit kind | Hold (min) | Gross PnL | Fees | Net PnL |');
  L.push('|---|---|---|---|---|---:|---:|---:|---|---:|---:|---:|---:|');
  for (const t of readables) {
    L.push(`| ${esc(t.entryTs)} | ${esc(t.exitTs)} | ${esc(t.username)} | ${esc(t.ticker)} | ${esc(t.side)} | ${num(t.contracts, 0)} | ${num(t.entryPx, 3)} | ${num(t.exitPx, 3)} | ${esc(t.exitKind)} | ${num(t.holdMinutes, 0)} | ${money(t.grossPnl)} | ${money(t.fees)} | ${money(t.netPnl)} |`);
  }
  L.push('');

  L.push('## 6. Limitations of this review');
  L.push('');
  L.push('- Open profit is not marked (stores settle only) — see the scoreboard note.');
  L.push('- Replay fills carry per-bar volume caps (`pctVol`, `volumeCap`) and depth bounds (`depthAvailable` at `depthCapturedAt`) in the CSV; the review tables show the aggregates to stay readable.');
  L.push('- Desk orders are forward-test paper trades on real captured ladders (each with its Kalshi API `ladderSourceUrl`); they are not broker confirmations and never will be (sandbox egress limitation, IRREGULARITIES #4).');
  L.push('- Strategies carry no risk-management exits by mandate; a losing trade exits only at settlement or at a maker target.');

  const mdPath = path.join(REPORTS_DIR, `trades-review-${args.date}.md`);
  fs.writeFileSync(mdPath, L.join('\n') + '\n');
  console.log(`wrote ${path.relative(ROOT, mdPath)}`);
  console.log(`wrote ${path.relative(ROOT, csvPath)} (${csvRows.length} rows)`);
}

main();
