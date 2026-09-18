#!/usr/bin/env node
/**
 * KalshiPaperSim — Universe Discovery (official API only)
 * =====================================================================
 * WHY THIS SCRIPT EXISTS
 * ----------------------
 * Every strategy in this repository must trade markets that REALLY exist,
 * on series whose REAL fee configuration is known, with the exchange's own
 * result available for settlement. Until now the universe was a hand-picked
 * list (KXBTCY / KXINXY / KXNASDAQ100Y / KXHIGHNY / KXGOLD15M) and the fee
 * multiplier for the two newest series was NOT captured (IRREGULARITIES #36).
 *
 * This script asks the exchange itself what exists, and records the answers
 * with the URL and the capture time. It invents nothing:
 *   • every field written here comes from a documented Kalshi endpoint;
 *   • every request that fails is recorded as an error, with the HTTP status;
 *   • nothing is renamed, summarised into a guess, or filled in from memory.
 *
 * OFFICIAL ENDPOINTS USED (all documented, all GET, all public):
 *   GET /exchange/status
 *       https://docs.kalshi.com/api-reference/exchange/get-exchange-status
 *   GET /series?include_volume=true[&category=]
 *       "Get Series List" — returns each series' real `fee_type`,
 *       `fee_multiplier`, `settlement_sources`, `contract_url`,
 *       `contract_terms_url`, `category`/`categories`, `tags` and (with
 *       include_volume) `volume_fp`.
 *       https://docs.kalshi.com/api-reference/market/get-series-list
 *   GET /markets?series_ticker=&status=&limit=200
 *       "Get Markets" — real market objects (status enum, result, strike,
 *       price_level_structure, volume_fp, open_interest_fp, close_time).
 *       https://docs.kalshi.com/api-reference/market/get-markets
 *   GET /series/{series_ticker}
 *       "Get Series" — the single series object.
 *       https://docs.kalshi.com/api-reference/market/get-series
 *
 * OUTPUTS (all under data/discovered/, all committed so a reader can audit):
 *   series-list.json      every series the exchange returned, with provenance
 *   series-fees.json      the FEE CONFIG of every tracked series (closes #36)
 *   matches.json          which requested keyword matched which real series
 *   markets/<SERIES>.json the real markets of a matched series, ranked by the
 *                         exchange's own reported lifetime volume
 *   _last-run.json        the request log: url, http status, bytes, timestamp
 *   docs/data/discovered.json  a browser-safe summary for the GitHub Pages tab
 *
 * USAGE
 *   node scripts/discover-universe.mjs                 # full discovery
 *   node scripts/discover-universe.mjs --dry-run       # print the plan, no network
 *   node scripts/discover-universe.mjs --keywords=NFL,NBA --top-markets=8
 *
 * The GitHub-hosted runner has egress to *.kalshi.com; the build sandbox does
 * not (IRREGULARITIES #4), so this script is exercised through
 * .github/workflows/ingest-now.yml (trigger: .github/triggers/ingest.json
 * "discover": true).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KALSHI_ENDPOINTS, KALSHI_PATHS, RATE_LIMITS } from '../src/kalshi-config.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'data', 'discovered');
const DOCS_OUT = path.join(ROOT, 'docs', 'data', 'discovered.json');
const BASE = KALSHI_ENDPOINTS.rest.production;

/**
 * The keyword list is DATA, not code: it mirrors the owner's request (the
 * MasterSite project list) plus the market classes the roadmap names as gaps
 * (sports, FDA, crypto, macro). A keyword only ever SELECTS a real series that
 * the exchange returned; it can never create one.
 */
const DEFAULT_KEYWORDS = [
  // The owner's project list, as market classes.
  'WEATHER', 'HIGH', 'GOLD', 'FDA', 'POTUS', 'CEO',
  'NFL', 'NBA', 'MLB', 'NHL', 'NCAA', 'NCAAB', 'NCAAF', 'SOCCER', 'UFC',
  // Roadmap "next" item #5: sports + FDA were the biggest signal-ledger gaps.
  'GAME', 'SPREAD', 'TOTAL', 'SERIES', 'CHAMPION',
  // Macro / index / crypto classes already partly tracked.
  'CPI', 'FED', 'GDP', 'JOBS', 'UNEMPLOY', 'INX', 'NASDAQ', 'BTC', 'ETH', 'SOL', 'OIL'
];

/** Categories to sweep when --categories is not given (GET /series?category=). */
const DEFAULT_CATEGORIES = [
  'Sports', 'Weather', 'Climate', 'Economics', 'Financials', 'Crypto',
  'Politics', 'Health', 'Science and Technology', 'Companies', 'World', 'Entertainment'
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function parseArgs(argv) {
  const args = {
    dryRun: false,
    write: true,
    keywords: DEFAULT_KEYWORDS,
    categories: DEFAULT_CATEGORIES,
    series: [], // explicit series to deep-capture even if no keyword matches
    topMarkets: 6,
    status: 'all',
    minVolume: 0,
    maxMarketsPerSeries: 6,
    maxSeries: 60,
    minIntervalMs: 250,
    timeoutMs: 20000,
    includeVolume: true
  };
  for (const a of argv.slice(2)) {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    const list = () => v.split(',').map((s) => s.trim()).filter(Boolean);
    if (k === 'keywords') args.keywords = list();
    else if (k === 'categories') args.categories = list();
    else if (k === 'series') args.series = list();
    else if (k === 'top-markets') args.topMarkets = Number(v);
    else if (k === 'max-markets-per-series') args.maxMarketsPerSeries = Number(v);
    else if (k === 'min-volume') args.minVolume = Number(v);
    else if (k === 'max-series') args.maxSeries = Number(v);
    else if (k === 'status') args.status = String(v).toLowerCase();
    else if (k === 'min-interval-ms') args.minIntervalMs = Number(v);
    else if (k === 'timeout-ms') args.timeoutMs = Number(v);
    else if (k === 'include-volume') args.includeVolume = v !== 'false';
    else if (k === 'dry-run') args.dryRun = v !== 'false';
    else if (k === 'write') args.write = v !== 'false';
    else if (k === 'help' || k === 'h') args.help = true;
  }
  return args;
}

/** The request log: every URL, its HTTP status, and when it was fetched. */
const REQUEST_LOG = [];

async function getJson(url, { timeoutMs = 20000, retries = 3 } = {}) {
  let lastErr = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const startedAt = new Date().toISOString();
    try {
      const res = await fetch(url, { method: 'GET', headers: { Accept: 'application/json' }, signal: controller.signal });
      clearTimeout(timer);
      if (res.status === RATE_LIMITS.throttledStatus) {
        // Verified: 429 carries no Retry-After header → back off ourselves.
        lastErr = new Error('rate_limited (429, no Retry-After header)');
        REQUEST_LOG.push({ url, status: 429, at: startedAt, note: 'rate limited, backing off' });
        await sleep(500 * 2 ** attempt);
        continue;
      }
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        REQUEST_LOG.push({ url, status: res.status, at: startedAt, error: text.slice(0, 300) || `http_${res.status}` });
        return { ok: false, status: res.status, error: text.slice(0, 300) || `http_${res.status}` };
      }
      const json = await res.json();
      REQUEST_LOG.push({ url, status: res.status, at: startedAt, ok: true });
      return { ok: true, status: res.status, json, url };
    } catch (err) {
      clearTimeout(timer);
      lastErr = err;
      if (attempt < retries) await sleep(400 * 2 ** attempt);
    }
  }
  REQUEST_LOG.push({ url, status: 0, at: new Date().toISOString(), error: String(lastErr?.message || lastErr) });
  return { ok: false, status: 0, error: String(lastErr?.message || lastErr) };
}

/** Kalshi fixed-point strings ("10.00") → number. Never guesses. */
function fp(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function url(pathname) {
  return `${BASE}${pathname}`;
}

/**
 * Fetch the full series list. `include_volume=true` is documented to include
 * "the total volume traded across all events in each series" — the only
 * exchange-reported popularity measure available at series level.
 */
async function fetchSeriesList(args) {
  const q = args.includeVolume ? '?include_volume=true' : '';
  const res = await getJson(url(`${KALSHI_PATHS.seriesList}${q}`), { timeoutMs: args.timeoutMs });
  if (!res.ok) return { ok: false, error: res.error, status: res.status, series: [] };
  const list = Array.isArray(res.json?.series) ? res.json.series : [];
  return { ok: true, url: res.url, series: list };
}

/** Fetch the real markets of one series, ranked by reported lifetime volume. */
async function fetchSeriesMarkets(seriesTicker, args) {
  const status = args.status;
  const u = url(
    `${KALSHI_PATHS.markets}?series_ticker=${encodeURIComponent(seriesTicker)}` +
      (status && status !== 'all' ? `&status=${status}` : '') +
      '&limit=200'
  );
  const res = await getJson(u, { timeoutMs: args.timeoutMs });
  if (!res.ok) return { ok: false, error: res.error, status: res.status, markets: [], url: u };
  return { ok: true, markets: Array.isArray(res.json?.markets) ? res.json.markets : [], url: u };
}

/**
 * A compact, auditable record of one market. Fields are copied VERBATIM from
 * the exchange response (fixed-point strings preserved) so a reader can diff
 * this file against the API by hand.
 */
function compactMarket(m) {
  return {
    ticker: m.ticker,
    event_ticker: m.event_ticker ?? null,
    series_ticker: m.series_ticker ?? null,
    title: m.title ?? null,
    status: m.status ?? null,
    result: m.result ?? null,
    volume_fp: m.volume_fp ?? null,
    volume_24h_fp: m.volume_24h_fp ?? null,
    open_interest_fp: m.open_interest_fp ?? null,
    liquidity_dollars: m.liquidity_dollars ?? null,
    yes_bid_dollars: m.yes_bid_dollars ?? null,
    yes_ask_dollars: m.yes_ask_dollars ?? null,
    last_price_dollars: m.last_price_dollars ?? null,
    open_time: m.open_time ?? null,
    close_time: m.close_time ?? null,
    settlement_ts: m.settlement_ts ?? null,
    settlement_value_dollars: m.settlement_value_dollars ?? null,
    expiration_value: m.expiration_value ?? null,
    strike_type: m.strike_type ?? null,
    floor_strike: m.floor_strike ?? null,
    cap_strike: m.cap_strike ?? null,
    price_level_structure: m.price_level_structure ?? null,
    rules_primary: m.rules_primary ?? null
  };
}

function compactSeries(s) {
  return {
    ticker: s.ticker,
    title: s.title ?? null,
    category: s.category ?? null,
    categories: Array.isArray(s.categories) ? s.categories : null,
    tags: Array.isArray(s.tags) ? s.tags : null,
    frequency: s.frequency ?? null,
    fee_type: s.fee_type ?? null,
    fee_multiplier: s.fee_multiplier ?? null,
    volume_fp: s.volume_fp ?? null,
    settlement_sources: Array.isArray(s.settlement_sources)
      ? s.settlement_sources.map((x) => ({ name: x?.name ?? null, url: x?.url ?? null }))
      : null,
    contract_url: s.contract_url ?? null,
    contract_terms_url: s.contract_terms_url ?? null,
    last_updated_ts: s.last_updated_ts ?? null
  };
}

/**
 * Which keyword matched this series? Matching is done on the ticker, the
 * title and the tags, all upper-cased, and the matching keyword is recorded
 * verbatim so the selection is auditable. A series can match several.
 */
function matchKeywords(series, keywords) {
  const hay = [series.ticker, series.title, ...(Array.isArray(series.tags) ? series.tags : [])]
    .filter(Boolean)
    .join(' ')
    .toUpperCase();
  return keywords.filter((k) => hay.includes(String(k).toUpperCase()));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, obj) {
  ensureDir(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(obj, null, 1)}\n`);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log('node scripts/discover-universe.mjs [--dry-run] [--keywords=A,B] [--top-markets=N]');
    return 0;
  }
  const startedAt = new Date().toISOString();
  console.log(`Kalshi universe discovery → ${BASE}`);
  console.log(`  keywords : ${args.keywords.join(', ')}`);
  console.log(`  series   : ${args.series.length ? args.series.join(', ') : '(none explicit)'}`);
  console.log(`  dry-run  : ${args.dryRun}`);

  if (args.dryRun) {
    console.log(`[dry-run] GET ${url(`${KALSHI_PATHS.seriesList}?include_volume=true`)}`);
    for (const c of args.categories) console.log(`[dry-run] GET ${url(`${KALSHI_PATHS.seriesList}?category=${encodeURIComponent(c)}&include_volume=true`)}`);
    console.log(`[dry-run] then GET ${url(`${KALSHI_PATHS.markets}?series_ticker=<matched>&status=${args.status}&limit=200`)} for the top ${args.maxSeries} matched series`);
    return 0;
  }

  const status = await getJson(url(KALSHI_PATHS.exchangeStatus), { timeoutMs: args.timeoutMs });
  const exchangeStatus = status.ok ? status.json : { error: status.error };

  // 1. The full list.
  const full = await fetchSeriesList(args);
  if (!full.ok) {
    console.error(`✗ GET /series failed (status ${full.status}): ${full.error}`);
    console.error('  Refusing to write a discovery file that claims otherwise.');
    return 1;
  }
  console.log(`• GET /series → ${full.series.length} series`);
  const byTicker = new Map();
  for (const s of full.series) if (s && s.ticker) byTicker.set(s.ticker, s);

  // 2. Category sweeps (documented query param). These are redundant with the
  //    full list but they PROVE the category filter works and record the
  //    exchange's own view of category membership.
  const categoryCounts = {};
  const categoryMembers = {};
  for (const c of args.categories) {
    const res = await getJson(url(`${KALSHI_PATHS.seriesList}?category=${encodeURIComponent(c)}&include_volume=${args.includeVolume ? 'true' : 'false'}`), {
      timeoutMs: args.timeoutMs
    });
    if (!res.ok) {
      categoryCounts[c] = { error: `http_${res.status}`, count: null };
      console.log(`  ✗ category ${c}: http_${res.status}`);
      continue;
    }
    const list = Array.isArray(res.json?.series) ? res.json.series : [];
    categoryCounts[c] = { count: list.length };
    categoryMembers[c] = list.map((s) => s.ticker);
    for (const s of list) if (s && s.ticker && !byTicker.has(s.ticker)) byTicker.set(s.ticker, s);
    console.log(`  ✓ category ${c}: ${list.length} series`);
    await sleep(args.minIntervalMs);
  }

  // 3. Keyword matching against the REAL list.
  const matched = [];
  for (const s of byTicker.values()) {
    const hits = matchKeywords(s, args.keywords);
    if (hits.length) matched.push({ ...compactSeries(s), matched_keywords: hits });
  }
  for (const t of args.series) {
    if (!matched.some((m) => m.ticker === t)) {
      const s = byTicker.get(t);
      if (s) matched.push({ ...compactSeries(s), matched_keywords: ['explicit'] });
      else matched.push({ ticker: t, matched_keywords: ['explicit'], error: 'not_returned_by_GET_/series' });
    }
  }
  matched.sort((a, b) => (fp(b.volume_fp) ?? 0) - (fp(a.volume_fp) ?? 0));
  console.log(`• keyword matches: ${matched.length} series (showing the top 25 by reported volume)`);
  for (const m of matched.slice(0, 25)) {
    console.log(`    ${m.ticker.padEnd(24)} vol=${String(m.volume_fp ?? '?').padStart(12)}  fee_mult=${m.fee_multiplier ?? '?'}  [${(m.matched_keywords || []).join(',')}]`);
  }

  // 4. Fee configuration of every series we can see — this is what closes
  //    IRREGULARITY #36 (KXHIGHNY / KXGOLD15M multipliers were uncaptured).
  const feeConfig = {};
  for (const s of byTicker.values()) {
    const c = compactSeries(s);
    if (!c.ticker) continue;
    feeConfig[c.ticker] = {
      fee_type: c.fee_type,
      fee_multiplier: c.fee_multiplier,
      category: c.category,
      volume_fp: c.volume_fp,
      title: c.title
    };
  }

  // 5. Real markets for the matched series, ranked by the exchange's own
  //    reported lifetime volume. Bounded by --max-series.
  const marketFiles = {};
  const selected = matched.slice(0, args.maxSeries);
  for (const m of selected) {
    if (!m.ticker || m.error) continue;
    const res = await fetchSeriesMarkets(m.ticker, args);
    if (!res.ok) {
      marketFiles[m.ticker] = { error: `http_${res.status}`, detail: res.error, url: res.url };
      console.log(`  ✗ markets ${m.ticker}: http_${res.status}`);
      await sleep(args.minIntervalMs);
      continue;
    }
    const ranked = res.markets
      .map((mk) => ({ mk, vol: fp(mk.volume_fp) ?? 0 }))
      .sort((a, b) => b.vol - a.vol)
      .filter((x) => x.vol >= args.minVolume)
      .slice(0, args.maxMarketsPerSeries)
      .map((x) => compactMarket(x.mk));
    const settled = ranked.filter((mk) => mk.status === 'finalized' && (mk.result === 'yes' || mk.result === 'no')).length;
    const payload = {
      _provenance: {
        endpoint: 'GET /markets?series_ticker=&status=&limit=',
        url: res.url,
        capturedAt: new Date().toISOString(),
        docs: 'https://docs.kalshi.com/api-reference/market/get-markets',
        note:
          'Markets are ranked by the exchange-reported lifetime volume_fp and capped at ' +
          `${args.maxMarketsPerSeries}. Fields are copied verbatim (fixed-point strings preserved).`
      },
      series_ticker: m.ticker,
      series_title: m.title ?? null,
      markets_returned: res.markets.length,
      kept: ranked.length,
      settled_kept: settled,
      markets: ranked
    };
    marketFiles[m.ticker] = { kept: ranked.length, settled, returned: res.markets.length };
    writeJson(path.join(OUT_DIR, 'markets', `${m.ticker}.json`), payload);
    console.log(`  ✓ markets ${m.ticker}: ${ranked.length} kept of ${res.markets.length} (${settled} finalized)`);
    await sleep(args.minIntervalMs);
  }

  const capturedAt = new Date().toISOString();
  const seriesListFile = {
    _provenance: {
      endpoint: 'GET /series?include_volume=true',
      url: url(`${KALSHI_PATHS.seriesList}?include_volume=true`),
      docs: 'https://docs.kalshi.com/api-reference/market/get-series-list',
      capturedAt,
      note:
        'Every series the exchange returned, copied field by field. fee_multiplier / fee_type are the ' +
        'series-level fee configuration; settlement_sources are the exchange-published settlement providers.'
    },
    exchange_status: exchangeStatus,
    series_count: byTicker.size,
    category_counts: categoryCounts,
    series: [...byTicker.values()].map(compactSeries).filter((s) => s.ticker)
  };
  writeJson(path.join(OUT_DIR, 'series-list.json'), seriesListFile);

  writeJson(path.join(OUT_DIR, 'series-fees.json'), {
    _provenance: {
      endpoint: 'GET /series?include_volume=true',
      docs: 'https://docs.kalshi.com/api-reference/market/get-series-list',
      capturedAt,
      note:
        'The fee configuration of every series visible to the exchange. This is the file that closes ' +
        'IRREGULARITY #36: seed fees from the REAL series object instead of the documented default M=1.'
    },
    fees: feeConfig
  });

  writeJson(path.join(OUT_DIR, 'matches.json'), {
    _provenance: {
      capturedAt,
      keywords: args.keywords,
      note: 'A series appears here because one of its own fields (ticker, title, tag) contains a keyword. The matching keyword is recorded; nothing is inferred.'
    },
    matched_count: matched.length,
    matched
  });

  const summary = {
    _provenance: {
      capturedAt,
      startedAt,
      apiBase: BASE,
      docs: {
        seriesList: 'https://docs.kalshi.com/api-reference/market/get-series-list',
        markets: 'https://docs.kalshi.com/api-reference/market/get-markets',
        exchangeStatus: 'https://docs.kalshi.com/api-reference/exchange/get-exchange-status'
      }
    },
    exchange_status: exchangeStatus,
    series_count: byTicker.size,
    category_counts: categoryCounts,
    matched_series: matched.map((m) => ({
      ticker: m.ticker,
      title: m.title ?? null,
      category: m.category ?? null,
      fee_type: m.fee_type ?? null,
      fee_multiplier: m.fee_multiplier ?? null,
      volume_fp: m.volume_fp ?? null,
      matched_keywords: m.matched_keywords,
      markets: marketFiles[m.ticker] ?? null
    })),
    requests: REQUEST_LOG.length,
    failed_requests: REQUEST_LOG.filter((r) => !r.ok).length
  };
  writeJson(path.join(OUT_DIR, '_last-run.json'), { ...summary, request_log: REQUEST_LOG });
  writeJson(DOCS_OUT, summary);

  console.log(`\nWrote ${path.relative(ROOT, OUT_DIR)}/ ...`);
  console.log(`  series-list.json : ${byTicker.size} series`);
  console.log(`  series-fees.json : ${Object.keys(feeConfig).length} fee configs`);
  console.log(`  matches.json     : ${matched.length} matched series`);
  console.log(`  markets/         : ${Object.keys(marketFiles).length} series market files`);
  console.log(`  requests         : ${REQUEST_LOG.length} (${summary.failed_requests} failed)`);
  console.log(`\nSuggested ingest blocks (paste into data/history/_ingest-request.json):`);
  console.log(JSON.stringify(suggestIngestBlocks(matched, marketFiles), null, 1));
  return 0;
}

/**
 * Build ingest blocks for series that (a) exist, (b) have finalized markets
 * with a real result, i.e. the only series an honest backtest can settle on.
 */
export function suggestIngestBlocks(matched, marketFiles) {
  const blocks = [];
  for (const m of matched) {
    const info = marketFiles[m.ticker];
    if (!info || !info.settled || info.settled < 1) continue;
    blocks.push({
      name: `discovered-${String(m.ticker).toLowerCase()}`,
      period: 60,
      status: 'all',
      series: [m.ticker],
      days: 0,
      max_backfill_days: 60,
      max_bars: 200,
      min_volume: 1000,
      max_markets: 40,
      with_books: true,
      with_market: true,
      min_interval_ms: 300,
      _why_this: `discovered by scripts/discover-universe.mjs: ${info.settled} finalized market(s) with an exchange result out of ${info.kept} kept.`
    });
  }
  return blocks.length ? blocks : [{ note: 'no matched series had a finalized market in this capture' }];
}

main()
  .then((code) => process.exit(code))
  .catch((err) => {
    console.error(`✗ discovery crashed: ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
