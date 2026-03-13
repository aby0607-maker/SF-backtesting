# Cross-Horizon Comparison — V4 Large Cap Backtest

**Generated:** 2026-03-13

## 1. Predictive Accuracy by Horizon

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---------------|---------------|---------------|
| Pearson r | 0.097 | -0.186 | 0.195 |
| Winsorized Pearson r | 0.071 | -0.147 | 0.195 |
| Spearman rho | 0.098 | -0.041 | 0.239 |
| Q1 Avg Return | 134.66% | 59.53% | 7.57% |
| Q5 Avg Return | 92.31% | 87.99% | -10.91% |
| Q1-Q5 Spread | 42.35pp | -28.46pp | 18.49pp |
| Hit Rate (>0%) | 90.6% | 93% | 40.3% |

## 2. Rank Deviation by Horizon

| Bucket | 5Y | 3Y | 1Y |
|--------|----|----|----|
| Exact Match | 26 (49.06%) | 32 (45.07%) | 38 (52.78%) |
| Within 10% | 0 (0.00%) | 0 (0.00%) | 0 (0.00%) |
| Within 25% | 5 (9.43%) | 15 (21.13%) | 11 (15.28%) |
| >25% | 22 (41.51%) | 24 (33.80%) | 23 (31.94%) |
| **Cumulative ≤25%** | **58.49%** | **66.20%** | **68.06%** |

## 3. Score Stability Across Dates

How much does the same stock's score change across scoring dates?

| Statistic | Value |
|-----------|-------|
| Stocks scored at all dates | 71 |
| Avg Score StdDev | 6.81 |
| Min StdDev (most stable) | 0.60 |
| Max StdDev (least stable) | 17.55 |

### Most Stable Scores (Top 10)

| Stock | StdDev | Scores |
|-------|--------|--------|
| Dr Reddys Laboratories Ltd (DRREDDY) | 0.60 | 67.0, 67.5, 66.0 |
| Siemens Ltd (SIEMENS) | 1.69 | 52.9, 48.5, 51.8, 51.9 |
| LTIMindtree Ltd (LTM) | 1.78 | 69.9, 65.6, 65.9, 66.0 |
| Avenue Supermarts Ltd (DMART) | 1.84 | 72.6, 73.7, 72.9, 68.9 |
| HCL Technologies Ltd (HCLTECH) | 2.16 | 61.8, 61.9, 57.8, 57.3 |
| Hindustan Unilever Ltd (HINDUNILVR) | 3.15 | 68.6, 60.3, 62.0, 62.3 |
| Pidilite Industries Ltd (PIDILITIND) | 3.31 | 75.6, 68.8, 71.2, 66.7 |
| Tata Consultancy Services Ltd (TCS) | 3.46 | 64.1, 66.1, 61.8, 56.8 |
| Solar Industries India Ltd (SOLARINDS) | 3.68 | 60.9, 60.3, 52.8 |
| Ashok Leyland Ltd (ASHOKLEY) | 3.69 | 61.3, 52.8, 61.7, 56.4 |

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
| Hitachi Energy India Ltd (POWERINDIA) | 10.33 | 63.5, 51.7, 38.2 |

## 4. Top 20 Overlap Across Horizons

Do the same stocks appear in the Top 20 by score across different dates?

| Comparison | Overlap (of 20) |
|------------|----------------|
| 5Y-2021-to-2025 vs 3Y-2023-to-2025 | 6/20 (30%) |
| 5Y-2021-to-2025 vs 1Y-2024-to-2025 | 6/20 (30%) |
| 5Y-2021-to-2025 vs Current-2025-Benchmark | 7/20 (35%) |
| 3Y-2023-to-2025 vs 1Y-2024-to-2025 | 8/20 (40%) |
| 3Y-2023-to-2025 vs Current-2025-Benchmark | 6/20 (30%) |
| 1Y-2024-to-2025 vs Current-2025-Benchmark | 7/20 (35%) |
