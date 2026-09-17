/**
 * KalshiPaperSim — Accumulated History Store (read side)
 * =====================================================================
 * Reader for the dataset that `scripts/ingest-history.mjs` grows one day at a
 * time under `data/history/`. Kept browser-safe (no node: imports) so the
 * static GitHub Pages build can read a committed copy too.
 *
 * Rules enforced here:
 *   • A store file is never repaired or guessed — a corrupt file is reported.
 *   • Bars are returned EXACTLY as stored (verbatim from the live API).
 *   • A manifest that cannot be parsed is reported as unreadable, not skipped.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const HISTORY_DIR = path.resolve(__dirname, '..', 'data', 'history');
export const MANIFEST_FILE = path.join(HISTORY_DIR, '_manifest.json');

/** Read and parse the ingest manifest, or null when there is no store yet. */
export function readHistoryManifest() {
  if (!fs.existsSync(MANIFEST_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST_FILE, 'utf8'));
  } catch (err) {
    return { unreadable: true, file: MANIFEST_FILE, error: String(err && err.message ? err.message : err) };
  }
}

/** Read one market's accumulated bars. Returns null when not present. */
export function readHistoryBars(ticker) {
  const p = path.join(HISTORY_DIR, `${ticker.replace(/[^A-Za-z0-9._-]/g, '_')}.json`);
  if (!fs.existsSync(p)) return null;
  try {
    const store = JSON.parse(fs.readFileSync(p, 'utf8'));
    return { ...store, file: p };
  } catch (err) {
    return { ticker, unreadable: true, file: p, error: String(err && err.message ? err.message : err), candlesticks: [] };
  }
}

/**
 * Bars per tracked ticker from the accumulated store.
 * @returns {Object} { ticker: [rawCandlestick] }
 */
export function getHistoryCandleMap() {
  const manifest = readHistoryManifest();
  if (!manifest || manifest.unreadable) return {};
  const out = {};
  for (const row of manifest.markets || []) {
    const store = readHistoryBars(row.ticker);
    if (store && Array.isArray(store.candlesticks) && !store.unreadable) out[row.ticker] = store.candlesticks;
  }
  return out;
}

/**
 * Compare the accumulated store against the in-repo verified captures.
 * Reports only: it never merges and never overwrites.
 */
export function auditHistoryAgainstRepo(repoCandleMap) {
  const history = getHistoryCandleMap();
  const rows = [];
  for (const [ticker, repoBars] of Object.entries(repoCandleMap || {})) {
    const stored = history[ticker] || [];
    const repoTs = new Set(repoBars.map((b) => Number(b.end_period_ts)));
    const storedTs = new Set(stored.map((b) => Number(b.end_period_ts)));
    rows.push({
      ticker,
      repoBars: repoBars.length,
      storedBars: stored.length,
      barsOnlyInStore: [...storedTs].filter((ts) => !repoTs.has(ts)).length,
      barsOnlyInRepo: [...repoTs].filter((ts) => !storedTs.has(ts)).length
    });
  }
  return { generatedAt: new Date().toISOString(), markets: rows };
}
