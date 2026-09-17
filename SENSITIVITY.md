# Sensitivity sweep

Generated `2026-09-17T23:47:39.324Z` by `scripts/sensitivity-sweep.mjs`.

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
| 1 | **ContrarianKing_100x** | 143.16% | 1369.73% | -93.95% | 430.32% | 15/27 (55.56%) | 1 | 9 | 18% |
| 2 | **VolatilityArb_MM** | 137.66% | 1264.11% | -99.22% | 400.87% | 12/27 (44.44%) | 1 | 11 | 26.04% |
| 3 | **AlphaApex_Momentum** | 112.55% | 1080.18% | -100% | 343.62% | 9/27 (33.33%) | 3 | 11 | 24.19% |
| 4 | **GammaWhale_Squeeze** | 52.59% | 502.23% | -53.95% | 158.41% | 9/27 (33.33%) | 1 | 11 | 18.57% |
| 5 | **EventCatalyst_Max** | 43.67% | 427.65% | -43.09% | 135.43% | 9/27 (33.33%) | 4 | 9 | 10.41% |
| 6 | **TrendRide_FullTilt** | 37.46% | 366.69% | -37.6% | 116.11% | 9/27 (33.33%) | 4 | 9 | 9.58% |
| 7 | **PanicDip_ShockTiming** | 3.49% | 25.44% | 0.18% | 7.78% | 27/27 (100%) | 2 | 7 | 0.51% |
| 8 | **YieldVulture_Arb** | 0% | 0% | 0% | 0% | 0/27 (0%) | — | — | 0% |
| 9 | **FedPivotSniper** | -0.14% | -0.02% | -0.37% | 0.14% | 0/27 (0%) | 5 | 9 | 0.29% |
| 10 | **LongshotFader_FLB** | -0.14% | 0.04% | -1.2% | 0.38% | 3/27 (11.11%) | 4 | 9 | 0.16% |
| 11 | **ThetaHarvest_ShortOTM** | -12.61% | 5.53% | -100% | 31.36% | 15/27 (55.56%) | 2 | 11 | 14.59% |
| 12 | **FeeArb_PremiumBuyer** | -20.17% | 14.66% | -100% | 44.53% | 18/27 (66.67%) | 1 | 11 | 29.95% |

## Returns by settlement scenario

The settlement scenarios dominate the spread, so they are separated out. Both settlement outcomes are **hypothetical**: none of these contracts had resolved when the data was captured on 2026-09-17 (status `active`, `result: ""`).

### Mark to last real quote (observed)

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| ContrarianKing_100x | 2.83% | 9.49% | -0.97% | 6/9 |
| VolatilityArb_MM | -2.77% | 9.25% | -14.42% | 3/9 |
| AlphaApex_Momentum | -5.62% | -2.11% | -10.39% | 0/9 |
| GammaWhale_Squeeze | -10.92% | -2.96% | -16.3% | 0/9 |
| EventCatalyst_Max | -2.34% | -1.4% | -2.98% | 0/9 |
| TrendRide_FullTilt | -2.74% | -0.65% | -5.7% | 0/9 |
| PanicDip_ShockTiming | 0.83% | 1.82% | 0.18% | 9/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -0.16% | -0.02% | -0.37% | 0/9 |
| LongshotFader_FLB | -0.01% | 0% | -0.03% | 0/9 |
| ThetaHarvest_ShortOTM | -0.47% | 0.62% | -2.15% | 6/9 |
| FeeArb_PremiumBuyer | 5.8% | 10.29% | 2.99% | 9/9 |

### Hypothetical: every contract resolves YES _(hypothetical)_

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| ContrarianKing_100x | 458.29% | 1369.73% | 2.58% | 9/9 |
| VolatilityArb_MM | 456.66% | 1264.11% | 16.11% | 9/9 |
| AlphaApex_Momentum | 382.57% | 1080.18% | 13.64% | 9/9 |
| GammaWhale_Squeeze | 195.17% | 502.23% | 18.35% | 9/9 |
| EventCatalyst_Max | 150.07% | 427.65% | 8.09% | 9/9 |
| TrendRide_FullTilt | 130.34% | 366.69% | 4.71% | 9/9 |
| PanicDip_ShockTiming | 9.09% | 25.44% | 0.18% | 9/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -0.12% | -0.02% | -0.26% | 0/9 |
| LongshotFader_FLB | -0.43% | -0.02% | -1.2% | 0/9 |
| ThetaHarvest_ShortOTM | -40.02% | -5.44% | -100% | 0/9 |
| FeeArb_PremiumBuyer | -77.2% | -31.61% | -100% | 0/9 |

### Hypothetical: every contract resolves NO _(hypothetical)_

| Username | Mean return | Best | Worst | Profitable cells |
| --- | --- | --- | --- | --- |
| ContrarianKing_100x | -31.64% | -0.26% | -93.95% | 0/9 |
| VolatilityArb_MM | -40.92% | -4.82% | -99.22% | 0/9 |
| AlphaApex_Momentum | -39.29% | -4.25% | -100% | 0/9 |
| GammaWhale_Squeeze | -26.48% | -5.86% | -53.95% | 0/9 |
| EventCatalyst_Max | -16.72% | -2.69% | -43.09% | 0/9 |
| TrendRide_FullTilt | -15.21% | -1.38% | -37.6% | 0/9 |
| PanicDip_ShockTiming | 0.54% | 0.99% | 0.18% | 9/9 |
| YieldVulture_Arb | 0% | 0% | 0% | 0/9 |
| FedPivotSniper | -0.16% | -0.02% | -0.37% | 0/9 |
| LongshotFader_FLB | 0.01% | 0.04% | 0% | 3/9 |
| ThetaHarvest_ShortOTM | 2.68% | 5.53% | 0.84% | 9/9 |
| FeeArb_PremiumBuyer | 10.91% | 14.66% | 7.63% | 9/9 |


- **1** strategy profitable in ≥80% of tested configurations: PanicDip_ShockTiming.
- **8** conditional: ContrarianKing_100x, VolatilityArb_MM, AlphaApex_Momentum, GammaWhale_Squeeze, EventCatalyst_Max, TrendRide_FullTilt, ThetaHarvest_ShortOTM, FeeArb_PremiumBuyer.
- **3** unprofitable in every tested configuration: YieldVulture_Arb, FedPivotSniper, LongshotFader_FLB.

This measures robustness **within one 61-period window of real data**. It is not a forecast, and a different
window could reorder every row — which is precisely why `scripts/ingest-history.mjs` exists to lengthen the window.

## Stress test: how much the depth model matters

| Username | Return (partial, honest) | Return (penalty, invented fills) | Difference |
| --- | --- | --- | --- |
| VolatilityArb_MM | 9.25% | 9.25% | 0% |
| ContrarianKing_100x | 9.08% | 9.09% | 0.01% |
| FeeArb_PremiumBuyer | 3.37% | 3.37% | 0% |
| PanicDip_ShockTiming | 1.82% | 1.82% | 0% |
| LongshotFader_FLB | -0.03% | -0.03% | 0% |
| FedPivotSniper | -0.37% | -0.37% | 0% |
| TrendRide_FullTilt | -1.78% | -1.11% | 0.67% |
| ThetaHarvest_ShortOTM | -2.12% | -2.15% | -0.03% |
| EventCatalyst_Max | -2.93% | -2.5% | 0.43% |
| AlphaApex_Momentum | -4.75% | -5.13% | -0.38% |
| GammaWhale_Squeeze | -16.3% | -16.52% | -0.22% |
| YieldVulture_Arb | 0% | 0% | 0% |

_Penalty mode executes the unfilled remainder at a price invented by the model; it is a stress diagnostic, never a result._

## Reproduce

```bash
node scripts/sensitivity-sweep.mjs            # full sweep
node scripts/sensitivity-sweep.mjs --quick    # one seed, mark-to-market only
```
