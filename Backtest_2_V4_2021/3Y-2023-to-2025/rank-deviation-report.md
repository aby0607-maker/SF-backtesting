# Rank Deviation Analysis — 3Y Horizon

> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.

## 1. Executive Summary

**8 sectors** with ≥3 stocks (34 stocks). 22 tiny sectors excluded.

| Bucket | Count | % |
|--------|------:|--:|
| **Exact Match** | 6 | 17.65% |
| **Within 10%** | 0 | 0.00% |
| **Within 25%** | 12 | 35.29% |
| **Rest (>25%)** | 16 | 47.06% |
| **Cumulative ≤25%** | 18 | 52.94% |

## 2. Top Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Pharmaceuticals | 4 | 0% | 0% | 100% | 0% | **100%** | 25% | 0.600 |
| 2 | Capital Goods - Electrical Equipment | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 3 | Automobile | 7 | 14.29% | 0% | 57.14% | 28.57% | **71.43%** | 16.33% | 0.786 |
| 4 | FMCG | 5 | 20% | 0% | 40% | 40% | **60%** | 24% | 0.500 |
| 5 | Steel | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.866 |
| 6 | Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 44.44% | -1.000 |
| 7 | IT - Software | 5 | 20% | 0% | 0% | 80% | **20%** | 32% | 0.200 |
| 8 | Refineries | 3 | 0% | 0% | 0% | 100% | **0%** | 44.44% | -0.500 |

## 3. Bottom Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Refineries | 3 | 0% | 0% | 0% | 100% | **0%** | 44.44% | -0.500 |
| 2 | IT - Software | 5 | 20% | 0% | 0% | 80% | **20%** | 32% | 0.200 |
| 3 | Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 44.44% | -1.000 |
| 4 | Steel | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.866 |
| 5 | FMCG | 5 | 20% | 0% | 40% | 40% | **60%** | 24% | 0.500 |
| 6 | Automobile | 7 | 14.29% | 0% | 57.14% | 28.57% | **71.43%** | 16.33% | 0.786 |
| 7 | Capital Goods - Electrical Equipment | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 8 | Pharmaceuticals | 4 | 0% | 0% | 100% | 0% | **100%** | 25% | 0.600 |

## 4. Full Sector Table (≥3 stocks)

| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |
|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|
| Automobile | 7 | 14.29% | 0% | 57.14% | 28.57% | 71.43% | 16.33% | 0.786 |
| IT - Software | 5 | 20% | 0% | 0% | 80% | 20% | 32% | 0.200 |
| FMCG | 5 | 20% | 0% | 40% | 40% | 60% | 24% | 0.500 |
| Pharmaceuticals | 4 | 0% | 0% | 100% | 0% | 100% | 25% | 0.600 |
| Capital Goods - Electrical Equipment | 4 | 25% | 0% | 50% | 25% | 75% | 25% | 0.400 |
| Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 44.44% | -1.000 |
| Steel | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.866 |
| Refineries | 3 | 0% | 0% | 0% | 100% | 0% | 44.44% | -0.500 |
