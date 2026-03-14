# Cross-Horizon Comparison — V4 Large Cap Backtest

**Generated:** 2026-03-13

## 1. Predictive Accuracy by Horizon

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---------------|---------------|---------------|
| Pearson r | 0.109 | -0.156 | 0.212 |
| Winsorized Pearson r | 0.073 | -0.108 | 0.212 |
| Spearman rho | 0.094 | -0.005 | 0.270 |
| Q1 Avg Return | 142.84% | 61.82% | 8.16% |
| Q5 Avg Return | 106.48% | 110.03% | -10.61% |
| Q1-Q5 Spread | 36.35pp | -48.21pp | 18.77pp |
| Hit Rate (>0%) | 92.2% | 93% | 40.3% |

## 2. Rank Deviation by Horizon

| Bucket | 5Y | 3Y | 1Y |
|--------|----|----|----|
| Exact Match | 25 (49.02%) | 31 (43.66%) | 39 (54.17%) |
| Within 10% | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) |
| Within 25% | 8 (15.69%) | 16 (22.54%) | 10 (13.89%) |
| >25% | 18 (35.29%) | 24 (33.80%) | 23 (31.94%) |
| **Cumulative ≤25%** | **64.71%** | **66.20%** | **68.06%** |

## 3. Score Stability Across Dates

How much does the same stock's score change across scoring dates?

| Statistic | Value |
|-----------|-------|
| Stocks scored at all dates | 70 |
| Avg Score StdDev | 6.64 |
| Min StdDev (most stable) | 0.60 |
| Max StdDev (least stable) | 17.55 |

### Most Stable Scores (Top 10)

| Stock | StdDev | Scores |
|-------|--------|--------|
| Dr Reddys Laboratories Ltd (DRREDDY) | 0.60 | 67.0, 67.5, 66.0 |
| Apollo Hospitals Enterprise Ltd (APOLLOHOSP) | 1.55 | 56.8, 54.3, 53.0 |
| Siemens Ltd (SIEMENS) | 1.69 | 52.9, 48.5, 51.8, 51.9 |
| LTIMindtree Ltd (LTM) | 1.78 | 69.9, 65.6, 65.9, 66.0 |
| Avenue Supermarts Ltd (DMART) | 1.84 | 72.6, 73.7, 72.9, 68.9 |
| HCL Technologies Ltd (HCLTECH) | 2.16 | 61.8, 61.9, 57.8, 57.3 |
| Tata Motors Passenger Vehicles Ltd (TMPV) | 2.74 | 51.0, 44.3, 48.1 |
| ABB India Ltd (ABB) | 2.80 | 65.8, 59.0, 63.1 |
| Hindalco Industries Ltd (HINDALCO) | 3.11 | 68.2, 66.1, 60.8 |
| Hindustan Unilever Ltd (HINDUNILVR) | 3.15 | 68.6, 60.3, 62.0, 62.3 |

### Most Volatile Scores (Bottom 10)

| Stock | StdDev | Scores |
|-------|--------|--------|
| Divis Laboratories Ltd (DIVISLAB) | 17.55 | 82.7, 72.0, 41.3 |
| Coal India Ltd (COALINDIA) | 15.68 | 87.5, 68.2, 43.7, 61.3 |
| ITC Ltd (ITC) | 12.93 | 87.8, 56.5, 61.4, 57.0 |
| Sun Pharmaceutical Industries Ltd (SUNPHARMA) | 11.89 | 72.0, 48.2, 44.2, 42.4 |
| Jindal Steel Ltd (JINDALSTEL) | 11.65 | 66.1, 42.6, 40.3 |
| Vedanta Ltd (VEDL) | 11.48 | 69.2, 61.9, 42.0 |
| NTPC Ltd (NTPC) | 11.14 | 78.9, 60.9, 49.6, 54.1 |
| Tech Mahindra Ltd (TECHM) | 11.04 | 66.0, 72.1, 66.3, 43.3 |
| Cholamandalam Investment & Finance Company Ltd (CHOLAFIN) | 10.69 | 68.3, 53.8, 42.2 |
| Solar Industries India Ltd (SOLARINDS) | 10.67 | 79.3, 59.6, 62.7, 49.6 |

## 4. Top 20 Overlap Across Horizons

Do the same stocks appear in the Top 20 by score across different dates?

| Comparison | Overlap (of 20) |
|------------|----------------|
| 5Y-2021-to-2025 vs 3Y-2023-to-2025 | 7/20 (35%) |
| 5Y-2021-to-2025 vs 1Y-2024-to-2025 | 6/20 (30%) |
| 5Y-2021-to-2025 vs Current-2025-Benchmark | 7/20 (35%) |
| 3Y-2023-to-2025 vs 1Y-2024-to-2025 | 8/20 (40%) |
| 3Y-2023-to-2025 vs Current-2025-Benchmark | 5/20 (25%) |
| 1Y-2024-to-2025 vs Current-2025-Benchmark | 8/20 (40%) |

## 5. Sector-by-Sector Cross-Horizon Breakdown

Score rank vs return rank alignment by sector across all horizons.
Only sectors with ≥3 stocks in at least 2 horizons are shown.


### Refineries (5Y: 2 | 3Y: 3 | 1Y: 3)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | — | 3 | 3 |
| Exact Match | — | 100% | 100% |
| Within 10% | — | 0% | 0% |
| Within 25% | — | 0% | 0% |
| **Cumulative ≤25%** | — | **100%** | **100%** |
| >25% | — | 0% | 0% |
| Avg Deviation | — | 0% | 0% |
| Spearman rho | — | 1 | 1 |
| Pearson r (score↔return) | — | 0.968 | 0.784 |
| Avg Score | — | 62.9 | 55 |
| Avg Return | — | 34.54% | -25.9% |

### Automobile (5Y: 6 | 3Y: 8 | 1Y: 8)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | 6 | 8 | 8 |
| Exact Match | 0% | 12.5% | 37.5% |
| Within 10% | 0% | 0% | 0% |
| Within 25% | 33.33% | 87.5% | 50% |
| **Cumulative ≤25%** | **33.33%** | **100%** | **87.5%** |
| >25% | 66.67% | 0% | 12.5% |
| Avg Deviation | 33.33% | 15.63% | 12.5% |
| Spearman rho | 0.143 | 0.81 | 0.81 |
| Pearson r (score↔return) | 0.12 | 0.735 | 0.724 |
| Avg Score | 71.9 | 62.4 | 61.9 |
| Avg Return | 96.42% | 69.54% | 2.82% |

### FMCG (5Y: 5 | 3Y: 5 | 1Y: 4)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | 5 | 5 | 4 |
| Exact Match | 0% | 0% | 50% |
| Within 10% | 0% | 0% | 0% |
| Within 25% | 20% | 80% | 50% |
| **Cumulative ≤25%** | **20%** | **80%** | **100%** |
| >25% | 80% | 20% | 0% |
| Avg Deviation | 48% | 24% | 12.5% |
| Spearman rho | -0.6 | 0.6 | 0.8 |
| Pearson r (score↔return) | -0.41 | 0.245 | 0.805 |
| Avg Score | 69.8 | 62.1 | 58.1 |
| Avg Return | 94.92% | 16.11% | -17.7% |

### Capital Goods - Electrical Equipment (5Y: — | 3Y: 4 | 1Y: 4)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | — | 4 | 4 |
| Exact Match | — | 25% | 25% |
| Within 10% | — | 0% | 0% |
| Within 25% | — | 50% | 25% |
| **Cumulative ≤25%** | — | **75%** | **50%** |
| >25% | — | 25% | 50% |
| Avg Deviation | — | 25% | 37.5% |
| Spearman rho | — | 0.4 | -0.4 |
| Pearson r (score↔return) | — | 0.408 | -0.412 |
| Avg Score | — | 57.8 | 56 |
| Avg Return | — | 105.67% | 23.15% |

### Pharmaceuticals (5Y: 3 | 3Y: 6 | 1Y: 6)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | 3 | 6 | 6 |
| Exact Match | 100% | 16.67% | 16.67% |
| Within 10% | 0% | 0% | 0% |
| Within 25% | 0% | 0% | 16.67% |
| **Cumulative ≤25%** | **100%** | **16.67%** | **33.33%** |
| >25% | 0% | 83.33% | 66.67% |
| Avg Deviation | 0% | 33.33% | 33.33% |
| Spearman rho | 1 | 0.086 | 0.029 |
| Pearson r (score↔return) | 0.76 | 0.124 | 0.345 |
| Avg Score | 61.7 | 67 | 62.2 |
| Avg Return | 121.51% | 87.96% | 11.58% |

### IT - Software (5Y: 6 | 3Y: 6 | 1Y: 6)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | 6 | 6 | 6 |
| Exact Match | 16.67% | 16.67% | 0% |
| Within 10% | 0% | 0% | 0% |
| Within 25% | 16.67% | 33.33% | 33.33% |
| **Cumulative ≤25%** | **33.33%** | **50%** | **33.33%** |
| >25% | 66.67% | 50% | 66.67% |
| Avg Deviation | 38.89% | 27.78% | 27.78% |
| Spearman rho | -0.314 | 0.257 | 0.486 |
| Pearson r (score↔return) | -0.264 | 0.428 | 0.333 |
| Avg Score | 64.5 | 67.4 | 63.7 |
| Avg Return | 33.65% | 22.91% | -1.06% |

### Power Generation & Distribution (5Y: 3 | 3Y: 4 | 1Y: 5)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | 3 | 4 | 5 |
| Exact Match | 33.33% | 25% | 20% |
| Within 10% | 0% | 0% | 0% |
| Within 25% | 0% | 25% | 0% |
| **Cumulative ≤25%** | **33.33%** | **50%** | **20%** |
| >25% | 66.67% | 50% | 80% |
| Avg Deviation | 22.22% | 37.5% | 48% |
| Spearman rho | 0.5 | -0.4 | -0.8 |
| Pearson r (score↔return) | 0.446 | -0.645 | -0.48 |
| Avg Score | 55.6 | 53.5 | 50.8 |
| Avg Return | 125.75% | 94.3% | -17.11% |

### Aerospace & Defence (5Y: 2 | 3Y: 3 | 1Y: 3)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | — | 3 | 3 |
| Exact Match | — | 33.33% | 33.33% |
| Within 10% | — | 0% | 0% |
| Within 25% | — | 0% | 0% |
| **Cumulative ≤25%** | — | **33.33%** | **33.33%** |
| >25% | — | 66.67% | 66.67% |
| Avg Deviation | — | 22.22% | 22.22% |
| Spearman rho | — | 0.5 | 0.5 |
| Pearson r (score↔return) | — | -0.237 | 0.708 |
| Avg Score | — | 62.8 | 62.7 |
| Avg Return | — | 138.48% | 14.71% |

### Steel (5Y: 2 | 3Y: 3 | 1Y: 3)

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---|---|---|
| Stocks scored | — | 3 | 3 |
| Exact Match | — | 33.33% | 33.33% |
| Within 10% | — | 0% | 0% |
| Within 25% | — | 0% | 0% |
| **Cumulative ≤25%** | — | **33.33%** | **33.33%** |
| >25% | — | 66.67% | 66.67% |
| Avg Deviation | — | 22.22% | 22.22% |
| Spearman rho | — | 0.5 | 0.5 |
| Pearson r (score↔return) | — | 0.831 | 0.237 |
| Avg Score | — | 64.7 | 55.6 |
| Avg Return | — | 37.63% | 1% |

### Summary: All Sectors × Horizons

| Sector | N(5Y) | N(3Y) | N(1Y) | ≤25%(5Y) | ≤25%(3Y) | ≤25%(1Y) | Pearson(5Y) | Pearson(3Y) | Pearson(1Y) |
|--------|---|---|---|---|---|---|---|---|---|
| Refineries | — | 3 | 3 | — | 100% | 100% | — | 0.968 | 0.784 |
| Automobile | 6 | 8 | 8 | 33.33% | 100% | 87.5% | 0.12 | 0.735 | 0.724 |
| FMCG | 5 | 5 | 4 | 20% | 80% | 100% | -0.41 | 0.245 | 0.805 |
| Capital Goods - Electrical Equipment | — | 4 | 4 | — | 75% | 50% | — | 0.408 | -0.412 |
| Pharmaceuticals | 3 | 6 | 6 | 100% | 16.67% | 33.33% | 0.76 | 0.124 | 0.345 |
| IT - Software | 6 | 6 | 6 | 33.33% | 50% | 33.33% | -0.264 | 0.428 | 0.333 |
| Power Generation & Distribution | 3 | 4 | 5 | 33.33% | 50% | 20% | 0.446 | -0.645 | -0.48 |
| Aerospace & Defence | — | 3 | 3 | — | 33.33% | 33.33% | — | -0.237 | 0.708 |
| Steel | — | 3 | 3 | — | 33.33% | 33.33% | — | 0.831 | 0.237 |
