# Rank Deviation Analysis — 5Y Horizon

> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.

## 1. Executive Summary

**6 sectors** with ≥3 stocks (27 stocks). 20 tiny sectors excluded.

| Bucket | Count | % |
|--------|------:|--:|
| **Exact Match** | 6 | 22.22% |
| **Within 10%** | 0 | 0.00% |
| **Within 25%** | 5 | 18.52% |
| **Rest (>25%)** | 16 | 59.26% |
| **Cumulative ≤25%** | 11 | 40.74% |

## 2. Top Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |
| 2 | Power Generation & Distribution | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 3 | Finance | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 4 | Automobile | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 33.33% | 0.143 |
| 5 | FMCG | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |
| 6 | IT - Software | 6 | 16.67% | 0% | 0% | 83.33% | **16.67%** | 38.89% | -0.200 |

## 3. Bottom Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | IT - Software | 6 | 16.67% | 0% | 0% | 83.33% | **16.67%** | 38.89% | -0.200 |
| 2 | FMCG | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |
| 3 | Automobile | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 33.33% | 0.143 |
| 4 | Finance | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 5 | Power Generation & Distribution | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 6 | Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |

## 4. Full Sector Table (≥3 stocks)

| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |
|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|
| Automobile | 6 | 0% | 0% | 33.33% | 66.67% | 33.33% | 33.33% | 0.143 |
| IT - Software | 6 | 16.67% | 0% | 0% | 83.33% | 16.67% | 38.89% | -0.200 |
| FMCG | 5 | 0% | 0% | 20% | 80% | 20% | 48% | -0.600 |
| Power Generation & Distribution | 4 | 25% | 0% | 50% | 25% | 75% | 25% | 0.400 |
| Finance | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.500 |
| Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | 100% | 0% | 1.000 |
