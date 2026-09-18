/**
 * KalshiPaperSim — Series Fee Registry (GENERATED — do not edit by hand)
 * =====================================================================
 * Source: data/discovered/series-fees.json — the capture written by
 * scripts/discover-universe.mjs from the OFFICIAL endpoint
 *   GET /series?include_volume=true
 *   https://docs.kalshi.com/api-reference/market/get-series-list
 * capturedAt: 2026-09-18T06:42:31.141Z
 *
 * Regenerate with: node scripts/generate-fee-registry.mjs
 *
 * SCOPE: only the series this build can actually price a fill for — every
 * series in the accumulated store (daily + intraday), every series named by a
 * strategy, the snapshot series, and the PDF non-standard table. A series that
 * is missing here was NOT captured; callers fall back to the documented
 * default and label it as an assumption (see seriesFeeConfig in
 * src/verified-snapshot.js).
 *
 * WHY fee_type MATTERS AS MUCH AS fee_multiplier
 * ----------------------------------------------
 * The official schedule charges NOTHING for a resting (maker) order unless the
 * series is in the Maker Fees section:
 *   "Trading fees are only charged for orders that are immediately matched
 *    with orders sitting on the orderbook. Trading fees are not charged for
 *    orders placed that are not immediately matched and are instead left as
 *    resting orders on the orderbook unless they are included in our 'Maker
 *    Fees' section."
 *   https://kalshi.com/docs/kalshi-fee-schedule.pdf
 * The live Series object marks exactly those series with
 * fee_type = "quadratic_with_maker_fees"; everything else is plain "quadratic"
 * and pays the maker coefficient ONLY when that flag is set.
 */

export const FEE_REGISTRY_PROVENANCE = Object.freeze({"generatedFrom":"data/discovered/series-fees.json","endpoint":"GET /series?include_volume=true","docs":"https://docs.kalshi.com/api-reference/market/get-series-list","seriesDocs":"https://docs.kalshi.com/api-reference/market/get-series","capturedAt":"2026-09-18T06:42:31.141Z","present":true,"note":"The fee configuration of every series visible to the exchange. This is the file that closes IRREGULARITY #36: seed fees from the REAL series object instead of the documented default M=1."});

/** ticker -> captured fee configuration (official GET /series). */
export const SERIES_FEE_REGISTRY = Object.freeze({
  KXABNBA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Airbnb Annual KPI","volume_fp":"1272.00"},
  KXBTC15M: {"fee_type":"quadratic","fee_multiplier":1,"category":"Crypto","title":"Bitcoin price up down","volume_fp":"18155844389.00"},
  KXBTCY: {"fee_type":"quadratic","fee_multiplier":0,"category":"Crypto","title":"BTC price range EOY","volume_fp":"36435966.00"},
  KXCITRINI: {"fee_type":"quadratic","fee_multiplier":0,"category":"Economics","title":"Will the Citrini scenario materialize?","volume_fp":"25926879.00"},
  KXCPI: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"CPI","volume_fp":"24081922.00"},
  KXCPIYOY: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Inflation","volume_fp":"36140966.00"},
  KXDOED: {"fee_type":"quadratic","fee_multiplier":0,"category":"Politics","title":"DOE eliminated","volume_fp":"4068442.00"},
  KXELECTIRAN: {"fee_type":"quadratic","fee_multiplier":0,"category":"Elections","title":"Will Iran hold a presidential election?","volume_fp":"121122.00"},
  KXETH15M: {"fee_type":"quadratic","fee_multiplier":1,"category":"Crypto","title":"ETH 15M price up down","volume_fp":"972280379.00"},
  KXETHY: {"fee_type":"quadratic","fee_multiplier":0,"category":"Crypto","title":"ETH price EOY ","volume_fp":"12099815.00"},
  KXFA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Companies","title":"Ford Annual KPI","volume_fp":"55342.00"},
  KXFED: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Fed funds rate","volume_fp":"59340262.00"},
  KXFEDDECISION: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Fed meeting","volume_fp":"611700268.00"},
  KXGAMBLINGREPEAL: {"fee_type":"quadratic","fee_multiplier":0,"category":"Politics","title":"Gambling Repeal","volume_fp":"3158264.00"},
  KXGDP: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"US GDP growth","volume_fp":"14855426.00"},
  KXGOLD15M: {"fee_type":"quadratic","fee_multiplier":1,"category":"Commodities","title":"Gold 15-minute","volume_fp":"483977123.00"},
  KXGRAB: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Grab Holdings KPI","volume_fp":"38120.00"},
  KXGREENLAND: {"fee_type":"quadratic","fee_multiplier":0,"category":"Politics","title":"Greenland purchase","volume_fp":"7542740.00"},
  KXHIGHAUS: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Austin","volume_fp":"77184130.00"},
  KXHIGHCHI: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Chicago","volume_fp":"110129364.00"},
  KXHIGHDEN: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Denver","volume_fp":"50835199.00"},
  KXHIGHLAX: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Los Angeles","volume_fp":"166217944.00"},
  KXHIGHMIA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Miami","volume_fp":"98547685.00"},
  KXHIGHNY: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in NYC","volume_fp":"144576265.00"},
  KXHIGHPHIL: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Highest temperature in Philadelphia","volume_fp":"41451797.00"},
  KXHIGHTPHX: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Phoenix High Temperature Daily","volume_fp":"16777011.00"},
  KXHIGHTSEA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Climate and Weather","title":"Seattle Maximum Temperature Daily","volume_fp":"16499475.00"},
  KXINXY: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Financials","title":"S&P 500 yearly range","volume_fp":"56715923.00"},
  KXIRANDEMOCRACY: {"fee_type":"quadratic","fee_multiplier":0,"category":"Politics","title":"Will Iran become a democracy in 2026?","volume_fp":"305817.00"},
  KXKLAR: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Klarna KPI","volume_fp":"85586.00"},
  KXLAYOFFSYINFO: {"fee_type":"quadratic","fee_multiplier":0,"category":"Economics","title":"Tech layoffs","volume_fp":"31978219.00"},
  KXMLBGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":0.5,"category":"Sports","title":"Professional Baseball Game","volume_fp":"9801998040.00"},
  KXNASDAQ100Y: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Financials","title":"Nasdaq yearly range","volume_fp":"35838452.00"},
  KXNBAGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Sports","title":"NBA Game","volume_fp":"11676027344.00"},
  KXNCAAFGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Sports","title":"College Football Game","volume_fp":"4775926187.00"},
  KXNFLGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Sports","title":"Professional Football Game","volume_fp":"6010908990.00"},
  KXNHLGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Sports","title":"NHL Game","volume_fp":"1567230249.00"},
  KXPAHLAVIHEAD: {"fee_type":"quadratic","fee_multiplier":0,"category":"Financials","title":"Will Pahlavi lead Iran?","volume_fp":"1851217.00"},
  KXPAYROLLS: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Jobs numbers","volume_fp":"19070913.00"},
  KXRATECUTCOUNT: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Number of rate cuts","volume_fp":"36987842.00"},
  KXRELYA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Remitly annual kpi","volume_fp":"2836.00"},
  KXSOL15M: {"fee_type":"quadratic","fee_multiplier":1,"category":"Crypto","title":"Solana 15 minutes","volume_fp":"346896983.00"},
  KXTOLA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Toll Brothers Annual KPI","volume_fp":"3730.00"},
  KXTSLA: {"fee_type":"quadratic","fee_multiplier":1,"category":"Financials","title":"Tesla KPI","volume_fp":"1271506.00"},
  KXU3: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Economics","title":"Unemployment","volume_fp":"11231950.00"},
  KXUFCFIGHT: {"fee_type":"quadratic","fee_multiplier":1,"category":"Sports","title":"UFC Fight","volume_fp":"1281832441.00"},
  KXWNBAGAME: {"fee_type":"quadratic_with_maker_fees","fee_multiplier":1,"category":"Sports","title":"Women's Pro Basketball Game","volume_fp":"1084084299.00"},
});

/** What was asked for, what was captured, what is missing — computed, not stored. */
export const FEE_REGISTRY_COVERAGE = Object.freeze({"requested":52,"captured":47,"missing":[],"capturedSeries":["KXABNBA","KXBTC15M","KXBTCY","KXCITRINI","KXCPI","KXCPIYOY","KXDOED","KXELECTIRAN","KXETH15M","KXETHY","KXFA","KXFED","KXFEDDECISION","KXGAMBLINGREPEAL","KXGDP","KXGOLD15M","KXGRAB","KXGREENLAND","KXHIGHAUS","KXHIGHCHI","KXHIGHDEN","KXHIGHLAX","KXHIGHMIA","KXHIGHNY","KXHIGHPHIL","KXHIGHTPHX","KXHIGHTSEA","KXINXY","KXIRANDEMOCRACY","KXKLAR","KXLAYOFFSYINFO","KXMLBGAME","KXNASDAQ100Y","KXNBAGAME","KXNCAAFGAME","KXNFLGAME","KXNHLGAME","KXPAHLAVIHEAD","KXPAYROLLS","KXRATECUTCOUNT","KXRELYA","KXSOL15M","KXTOLA","KXTSLA","KXU3","KXUFCFIGHT","KXWNBAGAME"],"missingDetail":[],"prefixPatterns":[{"ticker":"KXAAPL","why":"referenced by src/strategies.js","example":"KXAAPLUSDC"},{"ticker":"KXHIGH","why":"referenced by src/strategies.js","example":"KXHIGHTEDDF"},{"ticker":"KXNDX","why":"referenced by src/strategies.js","example":"KXNDXREMOVEQ"},{"ticker":"KXNVDA","why":"referenced by src/strategies.js","example":"KXNVDAA"},{"ticker":"KXSP500","why":"referenced by src/strategies.js","example":"KXSP500ADDQ"}]});

export default SERIES_FEE_REGISTRY;
