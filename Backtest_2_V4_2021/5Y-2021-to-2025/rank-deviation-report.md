# Rank Deviation Analysis — 5Y Horizon

> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.

## 1. Executive Summary

**6 sectors** with ≥3 stocks (27 stocks). 19 tiny sectors excluded.

| Bucket | Count | % |
|--------|------:|--:|
| **Exact Match** | 5 | 18.52% |
| **Within 10%** | 0 | 0.00% |
| **Within 25%** | 8 | 29.63% |
| **Rest (>25%)** | 14 | 51.85% |
| **Cumulative ≤25%** | 13 | 48.15% |

## 2. Top Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |
| 2 | Finance | 4 | 0% | 0% | 100% | 0% | **100%** | 25% | 0.600 |
| 3 | Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 4 | Automobile | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 33.33% | 0.143 |
| 5 | IT - Software | 6 | 16.67% | 0% | 16.67% | 66.67% | **33.33%** | 38.89% | -0.314 |
| 6 | FMCG | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |

## 3. Bottom Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | FMCG | 5 | 0% | 0% | 20% | 80% | **20%** | 48% | -0.600 |
| 2 | IT - Software | 6 | 16.67% | 0% | 16.67% | 66.67% | **33.33%** | 38.89% | -0.314 |
| 3 | Automobile | 6 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 33.33% | 0.143 |
| 4 | Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | **33.33%** | 22.22% | 0.500 |
| 5 | Finance | 4 | 0% | 0% | 100% | 0% | **100%** | 25% | 0.600 |
| 6 | Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |

## 4. Full Sector Table (≥3 stocks)

| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |
|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|
| Automobile | 6 | 0% | 0% | 33.33% | 66.67% | 33.33% | 33.33% | 0.143 |
| IT - Software | 6 | 16.67% | 0% | 16.67% | 66.67% | 33.33% | 38.89% | -0.314 |
| FMCG | 5 | 0% | 0% | 20% | 80% | 20% | 48% | -0.600 |
| Finance | 4 | 0% | 0% | 100% | 0% | 100% | 25% | 0.600 |
| Power Generation & Distribution | 3 | 33.33% | 0% | 0% | 66.67% | 33.33% | 22.22% | 0.500 |
| Pharmaceuticals | 3 | 100% | 0% | 0% | 0% | 100% | 0% | 1.000 |
