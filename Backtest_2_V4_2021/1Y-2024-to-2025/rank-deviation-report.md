# Rank Deviation Analysis — 1Y Horizon

> Score rank vs return rank within each sector. If V4 works, highest-scored stocks should have highest returns.

## 1. Executive Summary

**8 sectors** with ≥3 stocks (34 stocks). 24 tiny sectors excluded.

| Bucket | Count | % |
|--------|------:|--:|
| **Exact Match** | 7 | 20.59% |
| **Within 10%** | 0 | 0.00% |
| **Within 25%** | 11 | 32.35% |
| **Rest (>25%)** | 16 | 47.06% |
| **Cumulative ≤25%** | 18 | 52.94% |

## 2. Top Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Refineries | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |
| 2 | Pharmaceuticals | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 3 | FMCG | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 4 | Automobile | 7 | 14.29% | 0% | 42.86% | 42.86% | **57.14%** | 24.49% | 0.464 |
| 5 | Power Generation & Distribution | 4 | 25% | 0% | 25% | 50% | **50%** | 37.5% | -0.400 |
| 6 | IT - Software | 5 | 0% | 0% | 40% | 60% | **40%** | 40% | -0.300 |
| 7 | Capital Goods - Electrical Equipment | 4 | 0% | 0% | 25% | 75% | **25%** | 50% | -0.800 |
| 8 | Steel | 3 | 0% | 0% | 0% | 100% | **0%** | 44.44% | -0.500 |

## 3. Bottom Sectors by Rank Alignment

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Steel | 3 | 0% | 0% | 0% | 100% | **0%** | 44.44% | -0.500 |
| 2 | Capital Goods - Electrical Equipment | 4 | 0% | 0% | 25% | 75% | **25%** | 50% | -0.800 |
| 3 | IT - Software | 5 | 0% | 0% | 40% | 60% | **40%** | 40% | -0.300 |
| 4 | Power Generation & Distribution | 4 | 25% | 0% | 25% | 50% | **50%** | 37.5% | -0.400 |
| 5 | Automobile | 7 | 14.29% | 0% | 42.86% | 42.86% | **57.14%** | 24.49% | 0.464 |
| 6 | Pharmaceuticals | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 7 | FMCG | 4 | 25% | 0% | 50% | 25% | **75%** | 25% | 0.400 |
| 8 | Refineries | 3 | 100% | 0% | 0% | 0% | **100%** | 0% | 1.000 |

## 4. Full Sector Table (≥3 stocks)

| Sector | N | Exact% | ≤10%% | ≤25%% | >25%% | Cum≤25% | AvgDev | Spearman |
|--------|--:|-------:|------:|------:|------:|--------:|-------:|---------:|
| Automobile | 7 | 14.29% | 0% | 42.86% | 42.86% | 57.14% | 24.49% | 0.464 |
| IT - Software | 5 | 0% | 0% | 40% | 60% | 40% | 40% | -0.300 |
| Pharmaceuticals | 4 | 25% | 0% | 50% | 25% | 75% | 25% | 0.400 |
| Power Generation & Distribution | 4 | 25% | 0% | 25% | 50% | 50% | 37.5% | -0.400 |
| FMCG | 4 | 25% | 0% | 50% | 25% | 75% | 25% | 0.400 |
| Capital Goods - Electrical Equipment | 4 | 0% | 0% | 25% | 75% | 25% | 50% | -0.800 |
| Refineries | 3 | 100% | 0% | 0% | 0% | 100% | 0% | 1.000 |
| Steel | 3 | 0% | 0% | 0% | 100% | 0% | 44.44% | -0.500 |
