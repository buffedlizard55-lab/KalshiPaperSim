# Sensitivity sweep

Generated `2026-09-17T22:05:59.410Z` by `scripts/sensitivity-sweep.mjs`.

The previous session suggested a **regime sweep** (strategies × market regimes). Implemented literally that would
re-price the real captured candlesticks into synthetic bull/bear/volatile paths — inventing history, which this
repository's honesty contract forbids. This sweep instead varies only what is legitimately ours to vary:
the **seed** (the modelled depth behind the touch), the **market universe**, the **settlement scenario** and the
**exhaustion policy**. The candles are byte-identical in every cell.

Matrix: 12 strategies × 3 seed(s) × 3 universe(s) × 3 scenario(s) = **27 competitions / 324 strategy runs**.

> ⚠️ **Read the per-scenario tables before quoting any number from the table below.** The mean column averages
across all three settlement scenarios, and two of them are **hypothetical** — every contract forced to resolve
YES, or forced to resolve NO. A strategy that buys YES convexity therefore prints a four-figure mean that is
purely an artefact of the "resolves YES" cell. The only **observed** row is
[Mark to last real quote](#mark-to-last-real-quote-observed), where every position is valued at the last real
captured price because none of these contracts had resolved when the data was captured.

| # | Username | Mean return (mixes hypothetical scenarios) | Best | Worst | σ | Profitable cells | Best rank | Worst rank | Mean max DD |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | **PanicDip_ShockTiming** | 868.61% | 3776.19% | -99.35% | 1503.33% | 21/27 (77.78%) | 1 | 10 | 62.33% |
| 2 | **ContrarianKing_100x** | 151.06% | 1027.97% | -99.36% | 368.13% | 9/27 (33.33%) | 2 | 11 | 52.67% |
| 3 | **AlphaApex_Momentum** | 64.69% | 435.14% | -100% | 209.65% | 9/27 (33.33%) | 1 | 11 | 86.08% |
| 4 | **GammaWhale_Squeeze** | 49.54% | 332.46% | -100% | 162.84% | 9/27 (33.33%) | 1 | 11 | 71.87% |
| 5 | **EventCatalyst_Max** | 30.49% | 356.07% | -97.19% | 120.49% | 9/27 (33.33%) | 2 | 10 | 47.16% |
| 6 | **TrendRide_FullTilt** | 21.17% | 225.99% | -37.34% | 68.78% | 9/27 (33.33%) | 5 | 8 | 19.01% |
| 7 | **VolatilityArb_MM** | 17.29% | 67.3% | -8.53% | 30.42% | 12/27 (44.44%) | 4 | 7 | 13.02% |
| 8 | **YieldVulture_Arb** | 0% | 0% | 0% | 0% | 0/27 (0%) | — | — | 0% |
| 9 | **FedPivotSniper** | -7.94% | 2.38% | -13.89% | 4.77% | 2/27 (7.41%) | 5 | 8 | 10.65% |
| 10 | **LongshotFader_FLB** | -11.32% | 11.64% | -82.95% | 26.32% | 12/27 (44.44%) | 3 | 9 | 17.43% |
| 11 | **FeeArb_PremiumBuyer** | -25.46% | 23.29% | -100% | 53.01% | 18/27 (66.67%) | 1 | 10 | 42.12% |
| 12 | **ThetaHarvest_ShortOTM** | -27.05% | 20.77% | -100% | 51.9% | 18/27 (66.67%) | 1 | 11 | 44.63% |

## Returns by settlement scenario

The settlement scenarios dominate the spread, so they are separated out. Both settlement outcomes are **hypothetical**: none of these contracts had resolved when the data was captured on 2026-09-17 (status `active`, `result: ""`).

### Mark to last real quote (observed)

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| PanicDip_ShockTiming | 80.95% | 213.52% | 14.55% | 9/9 |
| ContrarianKing_100x | -42.47% | -0.31% | -70.05% | 0/9 |
| AlphaApex_Momentum | -60.46% | -55.89% | -63.21% | 0/9 |
| GammaWhale_Squeeze | -40.52% | -12.07% | -58.34% | 0/9 |
| EventCatalyst_Max | -30.59% | -16.61% | -57.41% | 0/9 |
| TrendRide_FullTilt | -14.13% | -7.11% | -26.73% | 0/9 |
| VolatilityArb_MM | -1.45% | 0.33% | -4.38% | 3/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -10.47% | -5.02% | -13.44% | 0/9 |
| LongshotFader_FLB | -0.04% | 0.74% | -0.49% | 3/9 |
| FeeArb_PremiumBuyer | 5.48% | 8.49% | 2.6% | 9/9 |
| ThetaHarvest_ShortOTM | 2.87% | 6.28% | 1% | 9/9 |

### Hypothetical: every contract resolves YES _(hypothetical)_

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| PanicDip_ShockTiming | 2518.49% | 3776.19% | 213.52% | 9/9 |
| ContrarianKing_100x | 558.03% | 1027.97% | 14.36% | 9/9 |
| AlphaApex_Momentum | 354.08% | 435.14% | 250.88% | 9/9 |
| GammaWhale_Squeeze | 273.19% | 332.46% | 143.41% | 9/9 |
| EventCatalyst_Max | 176.19% | 356.07% | 80.46% | 9/9 |
| TrendRide_FullTilt | 98.3% | 225.99% | 23.18% | 9/9 |
| VolatilityArb_MM | 59.19% | 67.3% | 43.34% | 9/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -2.33% | 2.38% | -4.97% | 2/9 |
| LongshotFader_FLB | -38.73% | -12.81% | -82.95% | 0/9 |
| FeeArb_PremiumBuyer | -100% | -100% | -100% | 0/9 |
| ThetaHarvest_ShortOTM | -100% | -100% | -100% | 0/9 |

### Hypothetical: every contract resolves NO _(hypothetical)_

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| PanicDip_ShockTiming | 6.38% | 213.52% | -99.35% | 3/9 |
| ContrarianKing_100x | -62.38% | -2.31% | -99.36% | 0/9 |
| AlphaApex_Momentum | -99.56% | -98.99% | -100% | 0/9 |
| GammaWhale_Squeeze | -84.06% | -44.93% | -100% | 0/9 |
| EventCatalyst_Max | -54.13% | -32.3% | -97.19% | 0/9 |
| TrendRide_FullTilt | -20.65% | -11.4% | -37.34% | 0/9 |
| VolatilityArb_MM | -5.86% | -4.21% | -8.53% | 0/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -11.01% | -5.43% | -13.89% | 0/9 |
| LongshotFader_FLB | 4.82% | 11.64% | 1.28% | 9/9 |
| FeeArb_PremiumBuyer | 18.13% | 23.29% | 12.2% | 9/9 |
| ThetaHarvest_ShortOTM | 15.99% | 20.77% | 13.23% | 9/9 |


- **0** strategies profitable in ≥80% of tested configurations: none.
- **10** conditional: PanicDip_ShockTiming, ContrarianKing_100x, AlphaApex_Momentum, GammaWhale_Squeeze, EventCatalyst_Max, TrendRide_FullTilt, VolatilityArb_MM, LongshotFader_FLB, FeeArb_PremiumBuyer, ThetaHarvest_ShortOTM.
- **2** unprofitable in every tested configuration: YieldVulture_Arb, FedPivotSniper.

This measures robustness **within one 61-period window of real data**. It is not a forecast, and a different
window could reorder every row — which is precisely why `scripts/ingest-history.mjs` exists to lengthen the window.

## Stress test: how much the depth model matters

| Username | Return (partial, honest) | Return (penalty, invented fills) | Difference |
| --- | --- | --- | --- |
| PanicDip_ShockTiming | 14.55% | 14.55% | 0% |
| LongshotFader_FLB | 0.73% | 0.36% | -0.37% |
| VolatilityArb_MM | 0.33% | 0.33% | 0% |
| ThetaHarvest_ShortOTM | 1.4% | -4.9% | -6.3% |
| FeeArb_PremiumBuyer | 2.6% | -4.96% | -7.56% |
| AlphaApex_Momentum | -63.21% | -70.15% | -6.94% |
| GammaWhale_Squeeze | -34.4% | -82.53% | -48.13% |
| EventCatalyst_Max | -57.41% | -83.34% | -25.93% |
| FedPivotSniper | -13.44% | -84.96% | -71.52% |
| TrendRide_FullTilt | -26.73% | -85.98% | -59.25% |
| ContrarianKing_100x | -70.05% | -87.54% | -17.49% |
| YieldVulture_Arb | 0% | 0% | 0% |

_Penalty mode executes the unfilled remainder at a price invented by the model; it is a stress diagnostic, never a result._

## Reproduce

```bash
node scripts/sensitivity-sweep.mjs            # full sweep
node scripts/sensitivity-sweep.mjs --quick    # one seed, mark-to-market only
```
