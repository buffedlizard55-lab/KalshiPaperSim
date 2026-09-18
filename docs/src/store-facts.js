/**
 * KalshiPaperSim — Store Facts (computed, never remembered)
 * =====================================================================
 * WHY THIS FILE EXISTS
 * --------------------
 * Several strategy write-ups state a fact ABOUT THE STORED DATA — how many
 * markets are in the weather store, how many of them the exchange had already
 * finalized, the price range the replay universe actually spans. Written as
 * literals those sentences drift the moment the ingest job adds a bar, and a
 * drifted sentence is a false claim (IRREGULARITY #31 is exactly that: a
 * caption asserting "no contract above 28c" when the store contained 47 of
 * them).
 *
 * Every function here DERIVES its answer from the store that is loaded in this
 * build, so the text and the data can never disagree. If the store is empty the
 * functions say so — they never fall back to a remembered number.
 *
 * SOURCE OF TRUTH: src/accumulated-history.js (generated from data/history/*)
 * for daily and intraday bars, and the store files themselves for status/result.
 * Tuple layout (see scripts/generate-history-module.mjs):
 *   [end_period_ts, open_interest, volume, [open,high,low,close,mean,previous],
 *    [bidOpen,bidHigh,bidLow,bidClose], [askOpen,askHigh,askLow,askClose]]
 * with prices in ten-thousandths of a dollar.
 */

import { ACCUMULATED_HISTORY, ACCUMULATED_INTRADAY } from './accumulated-history.js';

/**
 * The generated intraday store: { "60": { markets: { ticker: store } }, "1": {...} }.
 * It is a SEPARATE export from the daily store (ACCUMULATED_HISTORY), which is
 * why every intraday fact below reads ACCUMULATED_INTRADAY — reading the daily
 * one for an intraday question is how a caption ends up saying "0 markets".
 */
export const INTRADAY = ACCUMULATED_INTRADAY;

/**
 * The period map of the generated intraday store. Its real shape (verified by
 * reading the generated module, not assumed) is:
 *   { generatedAt, present, periods: { "1": {...}, "60": {...} } }
 */
function intradayPeriods(intraday) {
  return intraday && intraday.periods ? intraday.periods : {};
}

const PRICE_SCALE = 10000;
const EMPTY = Object.freeze({ present: false, markets: 0, bars: 0 });

/** One intraday period's slice of the generated store. */
function periodSlice(intraday, period) {
  return intradayPeriods(intraday)[String(period)] || null;
}

/** Every market of one intraday period: { ticker: store } . */
function marketsOf(intraday, period) {
  const slice = periodSlice(intraday, period);
  return slice && slice.markets ? slice.markets : {};
}

/** Series ticker of a market ticker (KXHIGHNY-26SEP07-B77.5 → KXHIGHNY). */
export function seriesOf(ticker) {
  return String(ticker || '').split('-')[0] || null;
}

/**
 * Facts about the daily replay universe's stored closes, computed from the
 * tuples. `above28ByMarket` lets a caption name WHICH market holds the high
 * closes instead of asserting it from memory.
 */
export function universePriceRange(history = ACCUMULATED_HISTORY) {
  const markets = Object.keys(history?.markets || {});
  let closes = 0;
  let min = 1;
  let max = 0;
  let above28 = 0;
  let above50 = 0;
  const above28ByMarket = {};
  for (const [ticker, market] of Object.entries(history?.markets || {})) {
    for (const t of market.tuples || []) {
      const raw = Array.isArray(t[3]) ? t[3][3] : null; // close, ten-thousandths
      if (typeof raw !== 'number') continue;
      const close = raw / PRICE_SCALE;
      closes += 1;
      if (close < min) min = close;
      if (close > max) max = close;
      if (close > 0.28) {
        above28 += 1;
        const entry = above28ByMarket[ticker] || (above28ByMarket[ticker] = { count: 0, high: 0 });
        entry.count += 1;
        if (close > entry.high) entry.high = close;
      }
      if (close > 0.5) above50 += 1;
    }
  }
  return {
    present: markets.length > 0,
    markets: markets.length,
    closes,
    min: markets.length ? min : null,
    max: markets.length ? max : null,
    above28,
    above50,
    above28ByMarket
  };
}

/** "KXNASDAQ100Y-...T33000, 45 bars up to $0.45; ..." — highest first. */
function describeMarkets(above28ByMarket) {
  return Object.entries(above28ByMarket)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([ticker, e]) => `${ticker}, ${e.count} bar${e.count === 1 ? '' : 's'} up to $${e.high.toFixed(2)}`)
    .join('; ');
}

function fmtInt(n) {
  return Number(n).toLocaleString('en-US');
}

/**
 * The sentence LongshotFader_FLB publishes about the universe's price range.
 * The retraction of the earlier wrong claim is part of the generated text, so
 * the correction can never be edited away while the claim lives on.
 */
export function universeRangeCaption(history = ACCUMULATED_HISTORY) {
  const r = universePriceRange(history);
  if (!r.present) {
    return 'the stored universe is empty in this build, so no price-range claim is made at all';
  }
  const detail = r.above28 > 0 ? describeMarkets(r.above28ByMarket) : '';
  return (
    `across all ${r.markets} stored markets (${fmtInt(r.closes)} numeric closes, ` +
    `$${r.min.toFixed(2)}–$${r.max.toFixed(2)}) ${r.above50 > 0 ? `${r.above50} close(s) reach above 0.50` : 'NO close reaches even 0.50'}, ` +
    'so that leg cannot fire here. A first draft of this note said the universe "contains NO contract above 28c"; ' +
    `that was WRONG and is corrected in place — ${r.above28} closes sit above 28c` +
    (detail ? `, all of them in ${detail}` : '') +
    '. The rule is unaffected, the published reason for it was not.'
  );
}

/**
 * Facts about one intraday period's store, grouped by series.
 * `settled` counts markets whose captured object carries the exchange's own
 * result (status finalized + result yes/no) — the only markets this replay may
 * settle. `finalized` counts status=finalized regardless of result.
 */
export function intradayFacts(intraday = INTRADAY, period = 60) {
  const markets = marketsOf(intraday, period);
  const tickers = Object.keys(markets);
  const bySeries = {};
  let bars = 0;
  let settled = 0;
  let finalized = 0;
  let withResult = 0;
  let closes = 0;
  let min = 1;
  let max = 0;
  for (const [ticker, m] of Object.entries(markets)) {
    const series = m.series_ticker || seriesOf(ticker);
    const row = bySeries[series] || (bySeries[series] = { markets: 0, bars: 0, settled: 0, finalized: 0 });
    row.markets += 1;
    const n = Number(m.bar_count ?? (m.tuples || []).length ?? 0);
    row.bars += n;
    bars += n;
    // Intraday bars can carry a null close (thin minutes), so the range counts
    // only numeric closes — a null is "no trade printed", not a price of 0.
    for (const t of m.tuples || []) {
      const raw = Array.isArray(t[3]) ? t[3][3] : null;
      if (typeof raw !== 'number') continue;
      const close = raw / PRICE_SCALE;
      closes += 1;
      if (close < min) min = close;
      if (close > max) max = close;
    }
    const status = String(m.status ?? '');
    const result = String(m.result ?? '');
    if (status === 'finalized') {
      row.finalized += 1;
      finalized += 1;
      if (result === 'yes' || result === 'no') {
        row.settled += 1;
        settled += 1;
      }
    }
    if (result === 'yes' || result === 'no') withResult += 1;
  }
  return {
    present: tickers.length > 0,
    period,
    markets: tickers.length,
    bars,
    settled,
    finalized,
    withResult,
    closes,
    min: closes ? min : null,
    max: closes ? max : null,
    bySeries
  };
}

/**
 * The paragraph the README publishes about one intraday flight, DERIVED from
 * the store: how many markets, how many the exchange has already finalized with
 * its own result, which series dominate, and how wide the traded range is.
 * A remembered version of this sentence is what made the README say "40 real
 * KXHIGHNY weather brackets" after the store had grown past that.
 */
export function flightCaption(period, intraday = INTRADAY) {
  const f = intradayFacts(intraday, period);
  if (!f.present) return `the ${period}-minute store holds no market in this build`;
  const top = Object.entries(f.bySeries)
    .sort((a, b) => b[1].markets - a[1].markets || b[1].bars - a[1].bars)
    .slice(0, 3)
    .map(([series, row]) => `${series} (${row.markets} market${row.markets === 1 ? '' : 's'}${row.settled ? `, ${row.settled} settled` : ''}, ${fmtInt(row.bars)} bars)`)
    .join('; ');
  const range = f.closes
    ? `${fmtInt(f.closes)} numeric closes spanning $${f.min.toFixed(2)}–$${f.max.toFixed(2)}`
    : 'no numeric close in the store yet';
  return (
    `${fmtInt(f.markets)} market(s) across ${Object.keys(f.bySeries).length} series, ` +
    `${f.settled} of them finalized with the exchange's own result (${range}); ` +
    `largest: ${top}`
  );
}

/**
 * Facts about the daily store (period 1440 lives in `markets`, not `intraday`).
 *
 * It reports the same settled/finalized fields as intradayFacts so the shared
 * caption helper (classSampleCaption) can describe a daily market class too —
 * a caption that says "undefined-minute store, NaN settled" is exactly the kind
 * of unverified sentence this module exists to prevent.
 */
export function dailyFacts(history = ACCUMULATED_HISTORY) {
  const markets = history?.markets || {};
  const tickers = Object.keys(markets);
  let bars = 0;
  let settled = 0;
  let finalized = 0;
  let withResult = 0;
  const bySeries = {};
  for (const [ticker, m] of Object.entries(markets)) {
    const series = m.series_ticker || seriesOf(ticker);
    const row = bySeries[series] || (bySeries[series] = { markets: 0, bars: 0, settled: 0, finalized: 0 });
    const n = Number(m.bar_count ?? (m.tuples || []).length ?? 0);
    row.markets += 1;
    row.bars += n;
    bars += n;
    const status = String(m.status ?? '');
    const result = String(m.result ?? '');
    if (status === 'finalized') {
      row.finalized += 1;
      finalized += 1;
      if (result === 'yes' || result === 'no') {
        row.settled += 1;
        settled += 1;
      }
    }
    if (result === 'yes' || result === 'no') withResult += 1;
  }
  return {
    present: tickers.length > 0,
    // The label the caption prints. The daily store IS the 1440-minute store.
    period: 1440,
    markets: tickers.length,
    bars,
    settled,
    finalized,
    withResult,
    bySeries
  };
}

/** "KXHIGHNY 40 markets (39 finalized with an exchange result)" — computed. */
export function seriesSummary(facts, series) {
  const row = facts.bySeries?.[series];
  if (!row) return `${series}: no market in the store`;
  return (
    `${series} ${row.markets} market${row.markets === 1 ? '' : 's'} ` +
    `(${row.finalized} finalized${row.settled ? `, ${row.settled} with an exchange result` : ''}, ${fmtInt(row.bars)} bars)`
  );
}

/**
 * A one-line, computed description of a market class in the store, e.g.
 * "8 settled KXGOLD15M contracts (128 one-minute bars)". Used by the
 * strategy texts so a sample-size claim follows the data.
 */
export function classSampleCaption(facts, seriesList) {
  const list = Array.isArray(seriesList) ? seriesList : [seriesList];
  let markets = 0;
  let settled = 0;
  let bars = 0;
  for (const s of list) {
    const row = facts.bySeries?.[s];
    if (!row) continue;
    markets += row.markets;
    settled += row.settled;
    bars += row.bars;
  }
  if (markets === 0) return `no ${list.join(' / ')} market has been ingested yet`;
  return `${markets} ${list.join(' / ')} market(s) in the ${facts.period}-minute store, ${settled} with the exchange's own result (${fmtInt(bars)} bars)`;
}

/**
 * HOW MANY CLOSES IN THE DAILY STORE PRESSED A GIVEN PRICE BAND — computed.
 *
 * The ShockTiming_ModerateFav control is defined by a precondition ("the
 * 5-period mean close is between 0.76 and 0.85") and its published premise used
 * to be the remembered sentence "every captured strike in this universe trades
 * below ~0.28". That sentence was true of the 30-market index/crypto universe of
 * 2026-09-17 and became FALSE the next day when the FDA and CEO-succession
 * markets landed in the daily store and traded up to $0.99. A control whose
 * premise is stale stops being a control, so the premise is now measured here.
 *
 * @returns {{lo:number, hi:number, closes:number, inBand:number, markets:string[], min:number|null, max:number|null}}
 */
export function bandScan(lo, hi, history = ACCUMULATED_HISTORY) {
  let closes = 0;
  let inBand = 0;
  let min = 1;
  let max = 0;
  const markets = new Set();
  for (const [ticker, market] of Object.entries(history?.markets || {})) {
    for (const t of market.tuples || []) {
      const raw = Array.isArray(t[3]) ? t[3][3] : null;
      if (typeof raw !== 'number') continue;
      const close = raw / PRICE_SCALE;
      closes += 1;
      if (close < min) min = close;
      if (close > max) max = close;
      if (close >= lo && close <= hi) {
        inBand += 1;
        markets.add(ticker);
      }
    }
  }
  return {
    lo,
    hi,
    closes,
    inBand,
    markets: [...markets].sort(),
    min: closes ? min : null,
    max: closes ? max : null
  };
}

/**
 * The ShockTiming_ModerateFav premise, DERIVED from the daily store.
 * It reports the band count either way — including when the earlier statement
 * has been overtaken by the data, which is the case that matters.
 */
export function moderateFavPremiseCaption(history = ACCUMULATED_HISTORY) {
  const scan = bandScan(0.6, 0.9, history);
  if (!scan.closes) return 'the daily store holds no numeric close in this build, so the control premise cannot be measured';
  if (scan.inBand === 0) {
    return (
      `MEASURED ON THIS BUILD: no close in the daily store sits in the 0.60-0.90 band the control needs ` +
      `(${fmtInt(scan.closes)} closes, range $${scan.min.toFixed(2)}-$${scan.max.toFixed(2)}), so the filter cannot fire.`
    );
  }
  return (
    `MEASURED ON THIS BUILD: the 0.60-0.90 band the control needs is NOT empty — ${fmtInt(scan.inBand)} of ` +
    `${fmtInt(scan.closes)} closes sit in it (range $${scan.min.toFixed(2)}-$${scan.max.toFixed(2)}), in ` +
    `${scan.markets.slice(0, 4).join(', ')}${scan.markets.length > 4 ? ` and ${scan.markets.length - 4} more market(s)` : ''}. ` +
    'The original premise ("every captured strike trades below ~0.28") held for the 30-market index/crypto universe captured 2026-09-17 and was ' +
    'overtaken on 2026-09-18 when the FDA and CEO-succession markets were ingested, so the control is now read as a filter study rather than a null.'
  );
}

export { EMPTY };


/* ------------------------------------------------------------------ *
 * FORECAST ARCHIVE FACTS (point-in-time weather signal)
 * ------------------------------------------------------------------ */

import { FORECAST_DATA } from './forecast-data.js';

/**
 * What the point-in-time NWS forecast archive actually holds, per location.
 * The archive is the ONLY evidence a weather strategy may read; if it is empty
 * the honest statement is "no snapshot existed", which is what this returns.
 */
export function forecastFacts(data = FORECAST_DATA) {
  const locations = Object.values(data?.locations || {}).map((l) => {
    const snaps = l.snapshots || [];
    return {
      key: l.location?.key ?? null,
      city: l.location?.city ?? null,
      series: l.location?.series ?? null,
      snapshots: snaps.length,
      firstCapturedAt: snaps.length ? snaps[0].captured_at ?? null : null,
      lastCapturedAt: snaps.length ? snaps[snaps.length - 1].captured_at ?? null : null,
      days: snaps.length ? (snaps[snaps.length - 1].days || []).length : 0
    };
  });
  return { present: locations.some((l) => l.snapshots > 0), locations };
}

/** A sentence that follows the archive: "N snapshots, first capturedAt …". */
export function forecastCaption(data = FORECAST_DATA) {
  const facts = forecastFacts(data);
  if (!facts.present) return 'the point-in-time forecast archive holds no snapshot yet';
  return facts.locations
    .map((l) => `${l.city ?? l.key}: ${l.snapshots} snapshot(s)${l.firstCapturedAt ? `, first ${l.firstCapturedAt}` : ''}`)
    .join('; ');
}
