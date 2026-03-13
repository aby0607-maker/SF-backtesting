# Rank Deviation Analysis — 1Y Horizon

> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.

## 1. Executive Summary

**9 sectors** with ≥3 stocks (42 stocks). 25 tiny sectors excluded.

| Bucket | Count | % |
|--------|------:|--:|
| **Exact Match** | 10 | 23.81% |
| **Within 10%** | 0 | 0.00% |
| **Within 25%** | 11 | 26.19% |
| **Rest (>25%)** | 21 | 50.00% |
| **Cumulative ≤25%** | 21 | 50.00% |

## 2. Top Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | FMCG | 4 | 50% | 0% | 50% | 0% | **100%** | 12.5% | 0.800 |
| 2 | Automobile | 8 | 37.5% | 0% | 50% | 12.5% | **87.5%** | 12.5% | 0.810 |
| 3 | Capital Goods - Electrical Equipment | 4 | 25% | 0% | 25% | 50% | **50%** | 37.5% | -0.400 |
| 4 | Aerospace & Defence | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 5 | Steel | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 6 | Refineries | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 7 | IT - Software | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 27.78% | 0.486 |
| 8 | Pharmaceuticals | 6 | 16.67% | 0% | 16.67% | 66.67% | **33.33%** | 33.33% | 0.029 |
| 9 | Power Generation & Distribution | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |

## 3. Bottom Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Power Generation & Distribution | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |
| 2 | Pharmaceuticals | 6 | 16.67% | 0% | 16.67% | 66.67% | **33.33%** | 33.33% | 0.029 |
| 3 | IT - Software | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 27.78% | 0.486 |
| 4 | Aerospace & Defence | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 5 | Steel | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 6 | Refineries | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 7 | Capital Goods - Electrical Equipment | 4 | 25% | 0% | 25% | 50% | **50%** | 37.5% | -0.400 |
| 8 | Automobile | 8 | 37.5% | 0% | 50% | 12.5% | **87.5%** | 12.5% | 0.810 |
| 9 | FMCG | 4 | 50% | 0% | 50% | 0% | **100%** | 12.5% | 0.800 |

## 4. Full Sector Table (≥3 stocks)

| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |
|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|
| Automobile | 8 | 37.5% | 0% | 50% | 12.5% | 87.5% | 12.5% | 0.810 |
| Pharmaceuticals | 6 | 16.67% | 0% | 16.67% | 66.67% | 33.33% | 33.33% | 0.029 |
| IT - Software | 6 | 0% | 0% | 33.33% | 66.67% | 33.33% | 27.78% | 0.486 |
| Power Generation & Distribution | 5 | 0% | 0% | 20% | 80% | 20% | 48% | -0.600 |
| FMCG | 4 | 50% | 0% | 50% | 0% | 100% | 12.5% | 0.800 |
| Capital Goods - Electrical Equipment | 4 | 25% | 0% | 25% | 50% | 50% | 37.5% | -0.400 |
| Aerospace & Defence | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.500 |
| Steel | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.500 |
| Refineries | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.500 |
