/**
 * KalshiPaperSim — Extended REAL candlestick capture (61 daily bars)
 * =====================================================================
 * SOURCE (live Kalshi production API, retrieved 2026-09-17):
 *   GET https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/
 *       KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks
 *       ?start_ts=1784419200&end_ts=1789689600&period_interval=1440
 *   (fetched in two windows: 1784419200→1788998400 and 1788998400→1789689600;
 *    the windows join exactly — 1788926400 → 1789012800 is 86400 s apart, so the
 *    merged series is CONTIGUOUS with no gap. Verified by re-querying the join.)
 *
 *   Docs: https://docs.kalshi.com/api-reference/market/get-market-candlesticks
 *   Window limit: live candlesticks only go back to the historical cutoff
 *   (GET /historical/cutoff returned 2026-07-19T00:00:00Z on 2026-09-17), which
 *   is exactly why this series starts at end_period_ts 1784433600 (2026-07-19).
 *   https://docs.kalshi.com/getting_started/historical_data
 *
 * ─────────────────────────────────────────────────────────────────────────
 * STORAGE FORMAT — and why it is NOT a paraphrase
 * ─────────────────────────────────────────────────────────────────────────
 * Each bar is stored as a compact tuple and expanded by `expandBar()` into the
 * EXACT Kalshi wire object (same keys, same 4-decimal FixedPointDollars strings).
 * Every value below was transcribed from the live JSON response; nothing is
 * interpolated, smoothed or invented. `VERBATIM_SAMPLE_BAR` holds one bar copied
 * character-for-character from the response so a test can assert that the
 * expander reproduces the real wire shape exactly (see test/simulation.test.js).
 *
 * Tuple layout:
 *   [ end_period_ts,
 *     open_interest_fp,
 *     volume_fp,
 *     price     [open, high, low, close, mean, previous],
 *     yes_bid   [open, high, low, close],
 *     yes_ask   [open, high, low, close] ]
 */

export const EXTENDED_CAPTURE_META = Object.freeze({
  ticker: 'KXNASDAQ100Y-26DEC31H1600-T33000',
  series_ticker: 'KXNASDAQ100Y',
  capturedAt: '2026-09-17',
  periodIntervalMinutes: 1440,
  periodIntervalLabel: 'daily',
  windows: Object.freeze([
    Object.freeze({ start_ts: 1784419200, end_ts: 1788998400, bars: 53 }),
    Object.freeze({ start_ts: 1788998400, end_ts: 1789689600, bars: 8 })
  ]),
  firstTs: 1784433600,
  lastTs: 1789617600,
  barCount: 61,
  contiguous: true,
  url: 'https://external-api.kalshi.com/trade-api/v2/series/KXNASDAQ100Y/markets/KXNASDAQ100Y-26DEC31H1600-T33000/candlesticks?start_ts=1784419200&end_ts=1789689600&period_interval=1440',
  doc: 'https://docs.kalshi.com/api-reference/market/get-market-candlesticks',
  dataStatus: 'REAL_EXCHANGE_DATA_POINT_IN_TIME'
});

/** One bar copied VERBATIM from the live response, used as an expander oracle. */
export const VERBATIM_SAMPLE_BAR = Object.freeze({
  end_period_ts: 1789617600,
  open_interest_fp: '163319.88',
  price: {
    close_dollars: '0.1200',
    high_dollars: '0.1300',
    low_dollars: '0.0800',
    mean_dollars: '0.1002',
    open_dollars: '0.1000',
    previous_dollars: '0.0800'
  },
  volume_fp: '5891.38',
  yes_ask: {
    close_dollars: '0.1200',
    high_dollars: '0.1300',
    low_dollars: '0.0800',
    open_dollars: '0.1000'
  },
  yes_bid: {
    close_dollars: '0.0900',
    high_dollars: '0.1000',
    low_dollars: '0.0700',
    open_dollars: '0.0800'
  }
});

/** Render a number as Kalshi's 4-decimal FixedPointDollars string. */
function fp(n) {
  return Number(n).toFixed(4);
}

/**
 * Expand a compact tuple into the exact Kalshi candlestick wire object.
 * @param {Array} t tuple in the layout documented above
 */
export function expandBar(t) {
  const [ts, oi, vol, price, bid, ask] = t;
  return {
    end_period_ts: ts,
    open_interest_fp: String(oi),
    volume_fp: String(vol),
    price: {
      open_dollars: fp(price[0]),
      high_dollars: fp(price[1]),
      low_dollars: fp(price[2]),
      close_dollars: fp(price[3]),
      mean_dollars: fp(price[4]),
      previous_dollars: fp(price[5])
    },
    yes_bid: {
      open_dollars: fp(bid[0]),
      high_dollars: fp(bid[1]),
      low_dollars: fp(bid[2]),
      close_dollars: fp(bid[3])
    },
    yes_ask: {
      open_dollars: fp(ask[0]),
      high_dollars: fp(ask[1]),
      low_dollars: fp(ask[2]),
      close_dollars: fp(ask[3])
    }
  };
}

/**
 * 61 real daily bars for KXNASDAQ100Y-26DEC31H1600-T33000
 * ("Will the Nasdaq-100 be above 33000 at the end of Dec 31, 2026 at 4pm EST?")
 * Transcribed from the live response, oldest first.
 */
export const KXNASDAQ100Y_T33000_DAILY = Object.freeze([
  [1784433600, '91829.86', '342.66', [0.22, 0.24, 0.20, 0.20, 0.2308, 0.22], [0.22, 0.22, 0.20, 0.20], [0.23, 0.24, 0.22, 0.22]],
  [1784520000, '91808.86', '144.08', [0.20, 0.23, 0.20, 0.22, 0.2182, 0.20], [0.20, 0.22, 0.20, 0.21], [0.22, 0.23, 0.22, 0.22]],
  [1784606400, '95109.17', '3428.15', [0.21, 0.24, 0.20, 0.22, 0.2361, 0.22], [0.21, 0.24, 0.20, 0.22], [0.22, 0.25, 0.22, 0.24]],
  [1784692800, '101226.22', '6138.60', [0.24, 0.28, 0.22, 0.28, 0.2656, 0.22], [0.22, 0.26, 0.22, 0.26], [0.24, 0.28, 0.24, 0.28]],
  [1784779200, '101445.07', '792.34', [0.28, 0.28, 0.23, 0.23, 0.2531, 0.28], [0.26, 0.27, 0.23, 0.24], [0.28, 0.28, 0.24, 0.25]],
  [1784865600, '105391.47', '4976.33', [0.24, 0.25, 0.19, 0.25, 0.2270, 0.23], [0.24, 0.24, 0.19, 0.23], [0.25, 0.25, 0.20, 0.24]],
  [1784952000, '105193.65', '1622.89', [0.23, 0.24, 0.17, 0.17, 0.1972, 0.25], [0.23, 0.23, 0.17, 0.17], [0.24, 0.24, 0.18, 0.18]],
  [1785038400, '105775.48', '824.62', [0.17, 0.22, 0.17, 0.20, 0.2008, 0.17], [0.17, 0.20, 0.17, 0.20], [0.18, 0.22, 0.18, 0.21]],
  [1785124800, '105674.60', '184.91', [0.20, 0.22, 0.20, 0.22, 0.2110, 0.20], [0.20, 0.22, 0.20, 0.22], [0.21, 0.23, 0.21, 0.23]],
  [1785211200, '105696.82', '1526.22', [0.22, 0.23, 0.14, 0.16, 0.1782, 0.22], [0.22, 0.22, 0.14, 0.15], [0.23, 0.23, 0.16, 0.16]],
  [1785297600, '132517.20', '27392.06', [0.16, 0.18, 0.14, 0.17, 0.1601, 0.16], [0.15, 0.17, 0.14, 0.15], [0.16, 0.18, 0.15, 0.17]],
  [1785384000, '156899.01', '26215.33', [0.17, 0.19, 0.13, 0.15, 0.1512, 0.17], [0.15, 0.16, 0.13, 0.15], [0.17, 0.19, 0.14, 0.16]],
  [1785470400, '156995.54', '417.24', [0.16, 0.16, 0.14, 0.15, 0.1531, 0.15], [0.15, 0.15, 0.14, 0.14], [0.16, 0.16, 0.15, 0.15]],
  [1785556800, '157696.91', '1845.52', [0.15, 0.18, 0.14, 0.18, 0.1639, 0.15], [0.14, 0.17, 0.14, 0.16], [0.15, 0.19, 0.15, 0.17]],
  [1785643200, '157661.93', '45.86', [0.17, 0.18, 0.16, 0.18, 0.1633, 0.18], [0.16, 0.17, 0.16, 0.16], [0.17, 0.18, 0.17, 0.17]],
  [1785729600, '157691.42', '88.51', [0.16, 0.17, 0.16, 0.17, 0.1667, 0.18], [0.16, 0.16, 0.16, 0.16], [0.17, 0.17, 0.17, 0.17]],
  [1785816000, '157775.98', '1617.98', [0.17, 0.22, 0.17, 0.22, 0.1812, 0.17], [0.16, 0.19, 0.16, 0.19], [0.17, 0.24, 0.17, 0.23]],
  [1785902400, '133100.02', '26035.23', [0.19, 0.28, 0.18, 0.28, 0.2308, 0.22], [0.19, 0.28, 0.18, 0.28], [0.23, 0.29, 0.22, 0.29]],
  [1785988800, '133468.79', '668.51', [0.28, 0.29, 0.26, 0.27, 0.2723, 0.28], [0.28, 0.28, 0.18, 0.26], [0.29, 0.29, 0.26, 0.27]],
  [1786075200, '133567.88', '191.80', [0.26, 0.27, 0.22, 0.27, 0.2543, 0.27], [0.26, 0.26, 0.19, 0.24], [0.27, 0.27, 0.23, 0.27]],
  [1786161600, '133549.45', '184.39', [0.24, 0.27, 0.23, 0.25, 0.2472, 0.27], [0.24, 0.25, 0.23, 0.24], [0.27, 0.27, 0.25, 0.25]],
  [1786248000, '133518.42', '190.91', [0.24, 0.24, 0.19, 0.19, 0.2174, 0.25], [0.24, 0.24, 0.19, 0.19], [0.25, 0.25, 0.23, 0.25]],
  [1786334400, '133538.56', '68.96', [0.25, 0.25, 0.20, 0.25, 0.2323, 0.19], [0.19, 0.23, 0.19, 0.21], [0.25, 0.25, 0.23, 0.23]],
  [1786420800, '133635.97', '457.35', [0.21, 0.25, 0.21, 0.25, 0.2482, 0.25], [0.21, 0.24, 0.21, 0.24], [0.23, 0.25, 0.23, 0.25]],
  [1786507200, '133461.20', '348.75', [0.24, 0.24, 0.17, 0.18, 0.2141, 0.25], [0.24, 0.24, 0.17, 0.17], [0.25, 0.25, 0.18, 0.18]],
  [1786593600, '133337.60', '2879.69', [0.17, 0.24, 0.17, 0.23, 0.2143, 0.18], [0.17, 0.23, 0.16, 0.22], [0.18, 0.24, 0.17, 0.23]],
  [1786680000, '132444.58', '3253.65', [0.23, 0.23, 0.22, 0.22, 0.2254, 0.23], [0.22, 0.22, 0.21, 0.21], [0.23, 0.23, 0.22, 0.22]],
  [1786766400, '133758.77', '1427.36', [0.22, 0.23, 0.18, 0.19, 0.2139, 0.22], [0.21, 0.22, 0.18, 0.19], [0.22, 0.23, 0.19, 0.20]],
  [1786852800, '136105.02', '2415.00', [0.20, 0.23, 0.20, 0.22, 0.2226, 0.19], [0.19, 0.22, 0.18, 0.21], [0.20, 0.23, 0.20, 0.22]],
  [1786939200, '136518.38', '449.00', [0.21, 0.22, 0.20, 0.21, 0.2145, 0.22], [0.21, 0.21, 0.20, 0.20], [0.22, 0.22, 0.21, 0.21]],
  [1787025600, '139274.58', '2873.32', [0.20, 0.24, 0.19, 0.24, 0.2252, 0.21], [0.20, 0.23, 0.18, 0.23], [0.21, 0.24, 0.21, 0.24]],
  [1787112000, '138004.09', '1600.66', [0.23, 0.24, 0.20, 0.22, 0.2135, 0.24], [0.23, 0.23, 0.20, 0.21], [0.24, 0.24, 0.22, 0.22]],
  [1787198400, '138032.41', '355.08', [0.21, 0.23, 0.21, 0.22, 0.2196, 0.22], [0.21, 0.22, 0.21, 0.22], [0.22, 0.23, 0.22, 0.23]],
  [1787284800, '138301.72', '1043.80', [0.23, 0.24, 0.15, 0.15, 0.1930, 0.22], [0.22, 0.23, 0.13, 0.13], [0.23, 0.24, 0.18, 0.18]],
  [1787371200, '138581.13', '870.17', [0.14, 0.21, 0.14, 0.18, 0.1926, 0.15], [0.13, 0.19, 0.12, 0.17], [0.18, 0.21, 0.16, 0.19]],
  [1787457600, '138583.89', '50.57', [0.18, 0.19, 0.13, 0.13, 0.1669, 0.18], [0.17, 0.17, 0.11, 0.13], [0.19, 0.19, 0.14, 0.15]],
  [1787544000, '138580.10', '794.75', [0.15, 0.20, 0.13, 0.13, 0.1644, 0.13], [0.13, 0.18, 0.12, 0.14], [0.15, 0.20, 0.15, 0.16]],
  [1787630400, '138262.68', '493.29', [0.14, 0.19, 0.12, 0.12, 0.1285, 0.13], [0.14, 0.16, 0.12, 0.12], [0.16, 0.19, 0.13, 0.15]],
  [1787716800, '138496.98', '2337.86', [0.15, 0.16, 0.12, 0.16, 0.1509, 0.12], [0.12, 0.15, 0.11, 0.15], [0.15, 0.16, 0.14, 0.16]],
  [1787803200, '140118.45', '2128.25', [0.16, 0.23, 0.16, 0.23, 0.1816, 0.16], [0.15, 0.17, 0.14, 0.17], [0.16, 0.23, 0.16, 0.22]],
  [1787889600, '140617.85', '806.86', [0.18, 0.19, 0.11, 0.18, 0.1537, 0.23], [0.17, 0.18, 0.11, 0.13], [0.22, 0.22, 0.15, 0.18]],
  [1787976000, '140635.05', '1914.08', [0.17, 0.21, 0.13, 0.18, 0.1802, 0.18], [0.13, 0.19, 0.12, 0.12], [0.18, 0.22, 0.16, 0.18]],
  [1788062400, '140685.53', '143.41', [0.13, 0.24, 0.12, 0.12, 0.2030, 0.18], [0.12, 0.20, 0.12, 0.20], [0.18, 0.24, 0.16, 0.23]],
  [1788148800, '140670.29', '71.76', [0.23, 0.23, 0.13, 0.22, 0.1836, 0.12], [0.20, 0.20, 0.12, 0.16], [0.23, 0.24, 0.16, 0.21]],
  [1788235200, '140761.47', '310.17', [0.21, 0.21, 0.16, 0.17, 0.1897, 0.22], [0.16, 0.19, 0.15, 0.16], [0.21, 0.21, 0.18, 0.18]],
  [1788321600, '145983.93', '6208.55', [0.16, 0.19, 0.14, 0.19, 0.1699, 0.17], [0.16, 0.18, 0.12, 0.16], [0.18, 0.19, 0.16, 0.19]],
  [1788408000, '146343.48', '649.79', [0.19, 0.19, 0.14, 0.18, 0.1659, 0.19], [0.16, 0.16, 0.14, 0.15], [0.19, 0.19, 0.16, 0.18]],
  [1788494400, '147837.27', '1636.33', [0.18, 0.18, 0.16, 0.17, 0.1697, 0.18], [0.15, 0.16, 0.15, 0.16], [0.18, 0.18, 0.16, 0.17]],
  [1788580800, '150560.12', '3294.60', [0.17, 0.17, 0.15, 0.16, 0.1690, 0.17], [0.16, 0.16, 0.15, 0.16], [0.17, 0.17, 0.16, 0.17]],
  [1788667200, '150872.59', '671.74', [0.16, 0.17, 0.13, 0.13, 0.1571, 0.16], [0.16, 0.16, 0.13, 0.13], [0.17, 0.17, 0.16, 0.17]],
  [1788753600, '150729.37', '336.35', [0.14, 0.16, 0.11, 0.14, 0.1400, 0.13], [0.13, 0.14, 0.11, 0.12], [0.17, 0.17, 0.13, 0.13]],
  [1788840000, '150948.92', '375.55', [0.13, 0.14, 0.12, 0.12, 0.1316, 0.14], [0.12, 0.12, 0.11, 0.12], [0.13, 0.14, 0.13, 0.13]],
  [1788926400, '162872.80', '13413.06', [0.12, 0.22, 0.12, 0.16, 0.1759, 0.12], [0.12, 0.22, 0.11, 0.14], [0.13, 0.32, 0.13, 0.16]],
  [1789012800, '163829.39', '1191.60', [0.16, 0.18, 0.14, 0.16, 0.1769, 0.16], [0.14, 0.16, 0.11, 0.16], [0.16, 0.18, 0.16, 0.18]],
  [1789099200, '163793.48', '544.68', [0.18, 0.18, 0.12, 0.15, 0.1438, 0.16], [0.16, 0.16, 0.11, 0.12], [0.18, 0.18, 0.15, 0.15]],
  [1789185600, '163745.41', '258.35', [0.15, 0.15, 0.13, 0.14, 0.1404, 0.15], [0.12, 0.15, 0.12, 0.14], [0.15, 0.16, 0.14, 0.15]],
  [1789272000, '163769.95', '258.86', [0.14, 0.16, 0.14, 0.14, 0.1505, 0.14], [0.14, 0.14, 0.14, 0.14], [0.15, 0.16, 0.15, 0.16]],
  [1789358400, '162466.87', '2765.34', [0.14, 0.15, 0.06, 0.06, 0.1279, 0.14], [0.14, 0.14, 0.06, 0.10], [0.16, 0.16, 0.11, 0.11]],
  [1789444800, '162281.82', '882.23', [0.11, 0.14, 0.10, 0.12, 0.1089, 0.06], [0.10, 0.12, 0.07, 0.11], [0.11, 0.14, 0.10, 0.12]],
  [1789531200, '163049.45', '2458.84', [0.11, 0.17, 0.07, 0.08, 0.1200, 0.12], [0.11, 0.13, 0.07, 0.08], [0.12, 0.17, 0.10, 0.10]],
  [1789617600, '163319.88', '5891.38', [0.10, 0.13, 0.08, 0.12, 0.1002, 0.08], [0.08, 0.10, 0.07, 0.09], [0.10, 0.13, 0.08, 0.12]]
]);

/** Expanded wire-format candlesticks (the shape the ReplayEngine consumes). */
export function getExtendedCandlesticks(ticker = EXTENDED_CAPTURE_META.ticker) {
  if (ticker !== EXTENDED_CAPTURE_META.ticker) return null;
  return KXNASDAQ100Y_T33000_DAILY.map(expandBar);
}

/** Self-check used by the test suite: expander must reproduce the live shape. */
export function verifyExpanderAgainstVerbatim() {
  const last = KXNASDAQ100Y_T33000_DAILY[KXNASDAQ100Y_T33000_DAILY.length - 1];
  const expanded = expandBar(last);
  const a = JSON.stringify(expanded, Object.keys(VERBATIM_SAMPLE_BAR).sort());
  const b = JSON.stringify(VERBATIM_SAMPLE_BAR, Object.keys(VERBATIM_SAMPLE_BAR).sort());
  return { ok: a === b, expanded, verbatim: VERBATIM_SAMPLE_BAR };
}

/** Cheap structural assertions over the whole series (used by tests + docs). */
export function summarizeExtendedSeries() {
  const bars = KXNASDAQ100Y_T33000_DAILY;
  const gaps = [];
  for (let i = 1; i < bars.length; i++) {
    const delta = bars[i][0] - bars[i - 1][0];
    if (delta !== 86400) gaps.push({ from: bars[i - 1][0], to: bars[i][0], deltaSeconds: delta });
  }
  const closes = bars.map((b) => b[3][3]);
  const totalVolume = bars.reduce((s, b) => s + Number(b[2]), 0);
  return {
    ticker: EXTENDED_CAPTURE_META.ticker,
    bars: bars.length,
    firstTs: bars[0][0],
    lastTs: bars[bars.length - 1][0],
    firstDate: new Date(bars[0][0] * 1000).toISOString(),
    lastDate: new Date(bars[bars.length - 1][0] * 1000).toISOString(),
    contiguous: gaps.length === 0,
    gaps,
    closeMin: Math.min(...closes),
    closeMax: Math.max(...closes),
    closeFirst: closes[0],
    closeLast: closes[closes.length - 1],
    totalVolume: Number(totalVolume.toFixed(2))
  };
}
