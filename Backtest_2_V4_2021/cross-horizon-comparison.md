# Cross-Horizon Comparison — V4 Large Cap Backtest

**Generated:** 2026-03-07

## 1. Predictive Accuracy by Horizon

| Metric | 5Y (2021→2025) | 3Y (2023→2025) | 1Y (2024→2025) |
|--------|---------------|---------------|---------------|
| Pearson r | 0 | -0.168 | 0.126 |
| Winsorized Pearson r | 0 | -0.129 | 0.126 |
| Spearman rho | N/A | -0.007 | 0.137 |
| Q1 Avg Return | 0% | 63.59% | 6.99% |
| Q5 Avg Return | 0% | 76.65% | -4.91% |
| Q1-Q5 Spread | 0pp | -13.06pp | 11.9pp |
| Hit Rate (>0%) | NaN% | 95% | 38.7% |

## 2. Rank Deviation by Horizon

| Bucket | 5Y | 3Y | 1Y |
|--------|----|----|----|
| Exact Match | 0 (0%) | 28 (46.67%) | 31 (50.00%) |
| Within 10% | 0 (0%) | 0 (0.00%) | 0 (0.00%) |
| Within 25% | 0 (0%) | 12 (20.00%) | 11 (17.74%) |
| >25% | 0 (0%) | 20 (33.33%) | 20 (32.26%) |
| **Cumulative ≤25%** | **0%** | **66.67%** | **67.74%** |

## 3. Score Stability Across Dates

How much does the same stock's score change across scoring dates?

| Statistic | Value |
|-----------|-------|
| Stocks scored at all dates | 58 |
| Avg Score StdDev | 5.69 |
| Min StdDev (most stable) | 0.60 |
| Max StdDev (least stable) | 17.55 |

### Most Stable Scores (Top 10)

| Stock | StdDev | Scores |
|-------|--------|--------|
| Dr Reddys Laboratories Ltd (DRREDDY) | 0.60 | 67.0, 67.5, 66.0 |
| LTIMindtree Ltd (LTM) | 0.69 | 69.0, 67.3, 68.1 |
| Hindustan Unilever Ltd (HINDUNILVR) | 1.03 | 59.6, 60.8, 62.1 |
| Titan Company Ltd (TITAN) | 1.44 | 64.5, 67.8, 65.0 |
| Apollo Hospitals Enterprise Ltd (APOLLOHOSP) | 1.55 | 56.8, 54.3, 53.0 |
| Pidilite Industries Ltd (PIDILITIND) | 1.59 | 67.2, 70.9, 68.0 |
| Siemens Ltd (SIEMENS) | 1.65 | 57.4, 60.3, 61.3 |
| Hindustan Aeronautics Ltd (HAL) | 1.78 | 61.4, 58.3, 57.2 |
| Reliance Industries Ltd (RELIANCE) | 1.87 | 60.8, 61.7, 57.4 |
| ITC Ltd (ITC) | 1.96 | 60.3, 63.5, 58.9 |

### Most Volatile Scores (Bottom 10)

| Stock | StdDev | Scores |
|-------|--------|--------|
| Divis Laboratories Ltd (DIVISLAB) | 17.55 | 82.7, 72.0, 41.3 |
| Jindal Steel Ltd (JINDALSTEL) | 11.65 | 66.1, 42.6, 40.3 |
| Vedanta Ltd (VEDL) | 11.22 | 76.1, 65.1, 48.8 |
| Grasim Industries Ltd (GRASIM) | 11.19 | 62.6, 60.4, 37.9 |
| Hitachi Energy India Ltd (POWERINDIA) | 10.65 | 71.0, 52.2, 46.0 |
| Bharat Petroleum Corporation Ltd (BPCL) | 10.05 | 59.1, 42.1, 66.1 |
| Indus Towers Ltd (INDUSTOWER) | 9.38 | 75.4, 53.5, 70.3 |
| Torrent Pharmaceuticals Ltd (TORNTPHARM) | 9.37 | 67.8, 66.8, 47.5 |
| Bajaj Auto Ltd (BAJAJ-AUTO) | 8.90 | 78.2, 63.1, 57.0 |
| Indian Oil Corporation Ltd (IOC) | 8.65 | 59.1, 41.7, 60.9 |

## 4. Top 20 Overlap Across Horizons

Do the same stocks appear in the Top 20 by score across different dates?

| Comparison | Overlap (of 20) |
|------------|----------------|
| 5Y-2021-to-2025 vs 3Y-2023-to-2025 | 0/20 (0%) |
| 5Y-2021-to-2025 vs 1Y-2024-to-2025 | 0/20 (0%) |
| 5Y-2021-to-2025 vs Current-2025-Benchmark | 0/20 (0%) |
| 3Y-2023-to-2025 vs 1Y-2024-to-2025 | 8/20 (40%) |
| 3Y-2023-to-2025 vs Current-2025-Benchmark | 6/20 (30%) |
| 1Y-2024-to-2025 vs Current-2025-Benchmark | 10/20 (50%) |
