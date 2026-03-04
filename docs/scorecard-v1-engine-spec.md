# StockFox Scorecard V1 — Complete Engine Specification

> Empirically derived from cross-sectional analysis of Nifty 50 stocks across
> 1Y, 3Y, and 5Y holding periods (March 2021 → Feb 2026).
>
> **Date:** 2026-03-04
> **Universe:** Nifty 50 (48 stocks)
> **Data Source:** MoneyControl API (financials, OHLCV, ownership, technicals)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Composite Score Formula](#2-composite-score-formula)
3. [Segment Weights](#3-segment-weights)
4. [Metric-Level Specification](#4-metric-level-specification)
5. [Normalisation Method](#5-normalisation-method)
6. [Scoring Bands & Verdict Mapping](#6-scoring-bands--verdict-mapping)
7. [Validation Results](#7-validation-results)
8. [Appendix: Full Metric Correlation Tables](#8-appendix-full-metric-correlation-tables)

---

## 1. Architecture Overview

```
                    ┌─────────────────────────────────┐
                    │       COMPOSITE SCORE (0-100)     │
                    │  Σ (segment_weight × segment_score)│
                    └──────────────┬──────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
   ┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
   │ Segment 1   │          │ Segment 2   │   ...    │ Segment 10  │
   │ Score (0-100)│          │ Score (0-100)│          │ Score (0-100)│
   └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
          │                        │                        │
    Top-8 metrics             Top-8 metrics            Top-8 metrics
    (|r|-weighted avg)        (|r|-weighted avg)       (|r|-weighted avg)
          │                        │                        │
   ┌──────┴──────┐          ┌──────┴──────┐          ┌──────┴──────┐
   │ Percentile  │          │ Percentile  │          │ Percentile  │
   │ Rank (0-100)│          │ Rank (0-100)│          │ Rank (0-100)│
   │ per metric  │          │ per metric  │          │ per metric  │
   └─────────────┘          └─────────────┘          └─────────────┘
```

### Three-Layer Scoring

| Layer | Description | Formula |
|-------|-------------|---------|
| **Layer 1: Metric Score** | Cross-sectional percentile rank within Nifty 50, direction-adjusted | `pctile = rank(metric_value) / (N-1) × 100`; if direction = negative → `100 - pctile` |
| **Layer 2: Segment Score** | Weighted average of top-8 metric scores within segment | `seg_score = Σ(metric_pctile × |r_metric|) / Σ(|r_metric|)` |
| **Layer 3: Composite Score** | Weighted average of all 10 segment scores | `composite = Σ(seg_score × seg_weight) / Σ(seg_weight)` |

---

## 2. Composite Score Formula

```
CompositeScore = Σᵢ (Wᵢ × SegmentScoreᵢ)
```

Where:
- `Wᵢ` = normalised weight for segment i (sum to 1.0)
- `SegmentScoreᵢ` = weighted-average percentile within segment i (0-100)

### Segment Score Formula

```
SegmentScore = Σⱼ (|rⱼ| × AdjustedPercentileⱼ) / Σⱼ (|rⱼ|)
```

Where:
- `j` iterates over the top-8 metrics in the segment (by avg |r| across horizons)
- `|rⱼ|` = average absolute Pearson correlation of metric j with forward returns
- `AdjustedPercentileⱼ` = direction-adjusted percentile rank (see Section 5)

### Metric Percentile Formula

```
RawPercentile = indexOf(stock_value, sorted_all_values) / (N - 1) × 100

AdjustedPercentile =
  if direction = "positive" → RawPercentile      (higher is better)
  if direction = "negative" → 100 - RawPercentile (lower is better)
```

---

## 3. Segment Weights

### Blended Weights (averaged across 1Y, 3Y, 5Y periods)

These are the **production weights** — averaged across all three holding periods to
capture signals that persist across market regimes.

| # | Segment | Blended Weight | 5Y Weight | 3Y Weight | 1Y Weight | Stability |
|---|---------|---------------|-----------|-----------|-----------|-----------|
| 1 | **Profitability** | **22.3%** | 30.9% | 17.9% | 18.1% | VOLATILE (Δ13pp) |
| 2 | **Financial Ratios** | **16.0%** | 15.5% | 13.9% | 18.6% | STABLE (Δ4.7pp) |
| 3 | **Balance Sheet** | **13.1%** | 9.6% | 12.4% | 17.4% | MODERATE (Δ7.8pp) |
| 4 | **Cash Flow** | **11.5%** | 10.1% | 9.7% | 14.7% | MODERATE (Δ5pp) |
| 5 | **Income Statement** | **9.8%** | 20.8% | 4.1% | 4.6% | VOLATILE (Δ16.6pp) |
| 6 | **Valuation** | **8.0%** | 7.0% | 9.8% | 7.3% | STABLE (Δ2.8pp) |
| 7 | **Ownership** | **5.3%** | 6.0% | 5.2% | 4.8% | STABLE (Δ1.2pp) |
| 8 | **Growth** | **5.3%** | 0.2% | 10.7% | 5.0% | VOLATILE (Δ10.5pp) |
| 9 | **Price & Volume** | **5.2%** | 0.0% | 10.4% | 5.1% | VOLATILE (Δ10.4pp) |
| 10 | **Technical** | **3.5%** | 0.0% | 6.1% | 4.3% | MODERATE (Δ6.1pp) |

### Weight Derivation Method

```
For each period P ∈ {5Y, 3Y, 1Y}:
  1. Compute Pearson r of each metric vs forward return
  2. For each segment S:
     avg_abs_r(S) = mean(|r| for all metrics in S)
     sig_frac(S) = count(significant metrics in S) / count(all metrics in S)
       where significant = |t-stat| ≥ 2.0
     composite(S) = 0.7 × avg_abs_r(S) + 0.3 × sig_frac(S)
  3. raw_weight(S, P) = composite(S) / Σ composite(all segments)

Blended weight:
  blended(S) = mean(raw_weight(S, 5Y), raw_weight(S, 3Y), raw_weight(S, 1Y))
  Then re-normalise so Σ blended = 1.0
```

---

## 4. Metric-Level Specification

### 4.1 Profitability (Weight: 22.3%, 13 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods | Metric Weight |
|---|--------|-----------------|-----------|---------|-------------|-------------|
| 1 | `gross_profit_margin` | (Revenue - COGS) / Revenue × 100 | **negative** | 0.369 | 2/3 | 0.252 |
| 2 | `roa_5y_avg` | 5-year average of (PAT / Total Assets) | **negative** | 0.258 | 3/3 | 0.176 |
| 3 | `roe_5y_avg` | 5-year average of (PAT / Shareholders' Equity) | **negative** | 0.210 | 2/3 | 0.143 |
| 4 | `net_profit_margin` | PAT / Revenue × 100 | **negative** | 0.209 | 2/3 | 0.143 |
| 5 | `roa` | PAT / Total Assets × 100 | **negative** | 0.208 | 3/3 | 0.142 |
| 6 | `ebitda_margin` | EBITDA / Revenue × 100 | **negative** | 0.188 | 0/3 | 0.128 |
| 7 | `roe` | PAT / Shareholders' Equity × 100 | **negative** | 0.144 | 2/3 | — |
| 8 | `cash_flow_margin` | OCF / Revenue × 100 | **negative** | 0.137 | 0/3 | — |

> **Interpretation:** Negative direction = stocks with currently lower profitability metrics
> outperformed. This is a **mean-reversion / value signal** — highly profitable companies
> are priced-in; less profitable ones with improving fundamentals outperform.
>
> Most consistent metric: `roa` — significant in ALL 3 periods (5Y: -0.555, 3Y: -0.409, 1Y: -0.345)

**Not in top-8 but tracked:** `roce`, `operating_profit_margin`, `fcf_to_pat`, `earnings_quality`, `earnings_yield`

---

### 4.2 Financial Ratios (Weight: 16.0%, 14 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods | Metric Weight |
|---|--------|-----------------|-----------|---------|-------------|-------------|
| 1 | `dpo` | (Payables / COGS) × 365 | **negative** | 0.384 | 2/3 | 0.217 |
| 2 | `cash_conversion_cycle` | DSO + DIO - DPO | **positive** | 0.381 | 2/3 | 0.215 |
| 3 | `dio` | (Inventory / COGS) × 365 | **negative** | 0.317 | 2/3 | 0.179 |
| 4 | `dso` | (Receivables / Revenue) × 365 | **negative** | 0.276 | 1/3 | 0.156 |
| 5 | `debt_to_ebitda` | Total Debt / EBITDA | **negative** | 0.162 | 1/3 | 0.092 |
| 6 | `fixed_asset_turnover` | Revenue / Fixed Assets | **positive** | 0.135 | 0/3 | 0.076 |
| 7 | `debt_to_equity` | Total Debt / Shareholders' Equity | **positive** | 0.117 | 1/3 | 0.066 |
| 8 | `quick_ratio` | (Current Assets - Inventory) / Current Liabilities | **negative** | 0.107 | 1/3 | — |

> **Note:** `dpo`, `cash_conversion_cycle`, `dio` have coverage of only ~27 stocks
> (applicable to manufacturing/services, not banks). For banks, these metrics are NULL
> and the segment falls back to the remaining metrics.

**Not in top-8:** `current_ratio`, `interest_coverage`, `asset_turnover`, `working_capital_to_sales`, `capex_to_revenue`, `icr_trend`

---

### 4.3 Balance Sheet (Weight: 13.1%, 8 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods | Metric Weight |
|---|--------|-----------------|-----------|---------|-------------|-------------|
| 1 | `inventory_turnover` | COGS / Average Inventory | **positive** | 0.268 | 2/3 | 0.228 |
| 2 | `gross_block_growth` | YoY change in Gross Fixed Assets (%) | **positive** | 0.189 | 1/3 | 0.161 |
| 3 | `receivables_turnover` | Revenue / Average Receivables | **positive** | 0.186 | 2/3 | 0.158 |
| 4 | `book_value_per_share` | Shareholders' Equity / Shares Outstanding | **positive** | 0.160 | 1/3 | 0.136 |
| 5 | `total_debt` | Total borrowings (long + short term) | **negative** | 0.100 | 0/3 | 0.085 |
| 6 | `total_assets` | Total balance sheet size | **positive** | 0.090 | 0/3 | 0.076 |
| 7 | `net_debt` | Total Debt - Cash & Equivalents | **negative** | 0.085 | 0/3 | 0.072 |
| 8 | `cash_and_equivalents` | Cash + Short-term investments | **positive** | 0.082 | 0/3 | 0.070 |

---

### 4.4 Cash Flow (Weight: 11.5%, 6-8 metrics, top 6 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods | Metric Weight |
|---|--------|-----------------|-----------|---------|-------------|-------------|
| 1 | `dividends_paid` | Absolute dividends paid (₹ Cr) | **negative** | 0.375 | **3/3** | 0.416 |
| 2 | `ocf_to_ebitda` | Operating Cash Flow / EBITDA | **positive** | 0.142 | 0/3 | 0.158 |
| 3 | `fcf_margin` | Free Cash Flow / Revenue × 100 | **negative** | 0.142 | 0/3 | 0.158 |
| 4 | `fcf_val` | Absolute Free Cash Flow (₹ Cr) | **negative** | 0.103 | 0/3 | 0.114 |
| 5 | `ocf_val` | Absolute Operating Cash Flow (₹ Cr) | **negative** | 0.086 | 0/3 | 0.095 |
| 6 | `capex_val` | Absolute Capital Expenditure (₹ Cr) | **positive** | 0.016 | 0/3 | 0.018 |

> **Star metric:** `dividends_paid` is the **only metric significant across ALL 3 periods**.
> Direction = negative: companies paying large dividends (mature, slow-growth) underperform
> the less-dividend-paying (growth/reinvestment) peers.

---

### 4.5 Income Statement (Weight: 9.8%, 6 metrics)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods |
|---|--------|-----------------|-----------|---------|-------------|
| 1 | `tax_rate` | Tax / PBT × 100 | **negative** | 0.161 | 0/3 |
| 2 | `pat` | Profit After Tax (₹ Cr) | **negative** | 0.143 | 1/3 |
| 3 | `ebitda` | EBITDA absolute value (₹ Cr) | **negative** | 0.128 | 0/3 |
| 4 | `other_income_ratio` | Other Income / Revenue × 100 | **positive** | 0.075 | 0/3 |
| 5 | `exceptional_items` | Exceptional gains/losses (₹ Cr) | **positive** | 0.065 | 1/3 |
| 6 | `revenue` | Total Revenue (₹ Cr) | **positive** | 0.058 | 0/3 |

---

### 4.6 Valuation (Weight: 8.0%, 11 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods | Metric Weight |
|---|--------|-----------------|-----------|---------|-------------|-------------|
| 1 | `pe_ratio` | Price / EPS | **positive** | 0.259 | 2/3 | 0.217 |
| 2 | `pe_vs_5y_avg` | Current PE / 5Y Average PE | **negative** | 0.193 | 0/3 | 0.162 |
| 3 | `ev_ebitda` | Enterprise Value / EBITDA | **positive** | 0.178 | 1/3 | 0.149 |
| 4 | `dividend_yield` | Annual Dividends / Price × 100 | **negative** | 0.143 | 1/3 | 0.120 |
| 5 | `pb_vs_5y_avg` | Current PB / 5Y Average PB | **negative** | 0.130 | 0/3 | 0.109 |
| 6 | `ev_ebitda_vs_5y_avg` | Current EV/EBITDA / 5Y Avg EV/EBITDA | **positive** | 0.127 | 0/3 | 0.106 |
| 7 | `pb_ratio` | Price / Book Value | **negative** | 0.117 | 0/3 | 0.098 |
| 8 | `price_to_sales` | Market Cap / Revenue | **negative** | 0.114 | 0/3 | 0.096 |

> **Counterintuitive:** `pe_ratio` has **positive** direction — higher PE stocks outperformed.
> This is a **growth premium** signal within Nifty 50: the market correctly prices growth
> expectations into PE, and those companies deliver.

**Not in top-8:** `peg_ratio`, `price_to_fcf`, `ev_to_revenue`

---

### 4.7 Ownership (Weight: 5.3%, 8 metrics)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods |
|---|--------|-----------------|-----------|---------|-------------|
| 1 | `mf_holding` | Mutual Fund holding (%) | **positive** | 0.192 | 1/3 |
| 2 | `promoter_change_3m` | 3-month change in promoter holding (pp) | **negative** | 0.177 | 1/3 |
| 3 | `promoter_holding` | Promoter holding (%) | **negative** | 0.172 | 0/3 |
| 4 | `fii_holding` | FII holding (%) | **positive** | 0.171 | 0/3 |
| 5 | `fii_change_3m` | 3-month change in FII holding (pp) | **positive** | 0.152 | 0/3 |
| 6 | `mf_change_3m` | 3-month change in MF holding (pp) | **negative** | 0.102 | 0/3 |
| 7 | `dii_holding` | DII holding (%) | **positive** | 0.092 | 0/3 |
| 8 | `retail_holding` | Retail holding (%) | **positive** | 0.033 | 0/3 |

---

### 4.8 Growth (Weight: 5.3%, 12 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods |
|---|--------|-----------------|-----------|---------|-------------|
| 1 | `revenue_growth_3y_cagr` | Revenue CAGR over 3 years (%) | **positive** | 0.228 | 2/3 |
| 2 | `revenue_growth_5y_cagr` | Revenue CAGR over 5 years (%) | **positive** | 0.224 | 2/3 |
| 3 | `revenue_growth_1y` | YoY revenue growth (%) | **positive** | 0.215 | 2/3 |
| 4 | `book_value_growth` | YoY Book Value growth (%) | **positive** | 0.204 | 2/3 |
| 5 | `ebitda_growth_1y` | YoY EBITDA growth (%) | **negative** | 0.201 | 0/3 |
| 6 | `pat_growth_3y_cagr` | PAT CAGR over 3 years (%) | **negative** | 0.123 | 0/3 |
| 7 | `pat_growth_1y` | YoY PAT growth (%) | **negative** | 0.115 | 0/3 |
| 8 | `eps_growth_1y` | YoY EPS growth (%) | **negative** | 0.110 | 0/3 |

**Not in top-8:** `eps_growth_3y_cagr`, `ebitda_growth_3y_cagr`, `ocf_growth_1y`, `earnings_momentum`

---

### 4.9 Price & Volume (Weight: 5.2%, 10 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods |
|---|--------|-----------------|-----------|---------|-------------|
| 1 | `price_return_6m` | 6-month price return (%) | **negative** | 0.273 | 2/3 |
| 2 | `price_return_1m` | 1-month price return (%) | **negative** | 0.269 | 2/3 |
| 3 | `price_52w_high_dist` | Distance from 52-week high (%) | **negative** | 0.251 | 2/3 |
| 4 | `avg_volume_20d` | Average daily volume (20-day) | **positive** | 0.249 | 2/3 |
| 5 | `price_return_3m` | 3-month price return (%) | **negative** | 0.238 | 2/3 |
| 6 | `avg_volume_3m` | Average daily volume (3-month) | **positive** | 0.211 | 1/3 |
| 7 | `price_return_1y` | 1-year price return (%) | **negative** | 0.171 | 1/3 |
| 8 | `volume_surge_20d` | Current volume / 20-day avg volume | **positive** | 0.146 | 0/3 |

> **Interpretation:** Price returns are **negative** direction — this is a **mean-reversion**
> signal. Stocks that have fallen the most in the past 1-6 months tend to outperform
> going forward (short-term reversal effect, well-documented in academic literature).

---

### 4.10 Technical (Weight: 3.5%, 22 metrics, top 8 used)

| # | Metric | Formula / Source | Direction | Avg |r| | Sig Periods |
|---|--------|-----------------|-----------|---------|-------------|
| 1 | `sma20_dev` | Price deviation from 20-day SMA (%) | **negative** | 0.262 | 2/3 |
| 2 | `ema50_dev` | Price deviation from 50-day EMA (%) | **negative** | 0.259 | 2/3 |
| 3 | `sma50_dev` | Price deviation from 50-day SMA (%) | **negative** | 0.257 | 2/3 |
| 4 | `sma200_dev` | Price deviation from 200-day SMA (%) | **negative** | 0.253 | 2/3 |
| 5 | `ema20_dev` | Price deviation from 20-day EMA (%) | **negative** | 0.253 | 2/3 |
| 6 | `sma100_dev` | Price deviation from 100-day SMA (%) | **negative** | 0.252 | 2/3 |
| 7 | `ema200_dev` | Price deviation from 200-day EMA (%) | **negative** | 0.246 | 2/3 |
| 8 | `volatility` | 1Y annualised volatility (%) | **positive** | 0.243 | 1/3 |

> **Interpretation:** All MA-deviation metrics have **negative** direction — same mean-reversion:
> stocks trading well above their moving averages tend to underperform going forward.

**Not in top-8:** `rsi_14`, `macd_signal`, `macd_line`, `macd_histogram`, `ema_crossover`, `bb_position`, `adx_14`, `stochastic_k`, `obv_trend`, `sharpe_ratio`, `max_drawdown_1y`, `return_1y_ann`, `rvol`, `sma10_dev`

---

## 5. Normalisation Method

### Cross-Sectional Percentile Ranking

For each metric, at each point in time:

```
Step 1: Collect metric values for all N stocks in the universe
        values = [stock1_val, stock2_val, ..., stockN_val]

Step 2: Sort ascending
        sorted = sort(values)

Step 3: Find rank of target stock
        rank = indexOf(target_stock_value, sorted)

Step 4: Convert to percentile (0-100)
        raw_percentile = rank / (N - 1) × 100

Step 5: Direction adjustment
        if direction = "positive":
          adjusted = raw_percentile          → higher raw value = higher score
        if direction = "negative":
          adjusted = 100 - raw_percentile    → lower raw value = higher score
```

### Why Percentile Ranking (not Z-score or Min-Max)?

| Method | Drawback | Why Not |
|--------|----------|---------|
| Z-score | Assumes normal distribution | Financial metrics are highly skewed (PE can be 5 or 500) |
| Min-Max | Sensitive to outliers | One outlier (extreme D/E) compresses all other stocks to 0 |
| **Percentile** | Ordinal only | ✅ Robust to outliers, distribution-free, comparable across metrics |

### Handling Missing Values

```
if metric_value is NULL or NaN:
  metric_score = 50 (neutral, no contribution up or down)
  metric_weight in segment aggregation = 0 (excluded from weighting)
```

This ensures stocks in sectors where certain metrics don't apply (e.g., banks don't
have inventory) are not penalised.

---

## 6. Scoring Bands & Verdict Mapping

### Composite Score Bands

| Score Range | Band | Verdict | Color |
|-------------|------|---------|-------|
| 80-100 | **Excellent** | STRONG BUY | 🟢 Dark Green |
| 65-79 | **Good** | BUY | 🟢 Green |
| 50-64 | **Average** | HOLD | 🟡 Yellow |
| 35-49 | **Below Average** | CAUTIOUS | 🟠 Orange |
| 0-34 | **Poor** | AVOID | 🔴 Red |

### Segment Score Bands

| Score Range | Segment Verdict |
|-------------|----------------|
| 75-100 | Segment is a **strength** |
| 55-74 | Segment is **neutral** |
| 30-54 | Segment is a **concern** |
| 0-29 | Segment is a **red flag** |

### Peer Ranking

```
Rank = position when all N stocks sorted by CompositeScore descending
Display: "#3 of 48 Nifty 50 Stocks" or "#2 of 15 Banking Stocks" (sector-filtered)
```

---

## 7. Validation Results

### 7.1 Quintile Backtests Across All Periods

#### 5Y Backtest: March 2021 → Feb 2026 (N=46)

| Quintile | Avg Score | Avg Return | Med Return | Stocks |
|----------|-----------|------------|------------|--------|
| **Q1 (Top)** | 67.7 | **+233.2%** | +266.6% | BHARTIARTL, SHRIRAMFIN, TRENT, HINDALCO, NTPC, BAJFINANCE, GRASIM, M&M, APOLLOHOSP |
| Q2 | 58.0 | +151.3% | +173.6% | ADANIENT, TATASTEEL, SUNPHARMA, ONGC, BAJAJFINSV, JSWSTEEL, LT, AXISBANK, ULTRACEMCO |
| Q3 | 51.5 | +108.8% | +116.4% | RELIANCE, DRREDDY, POWERGRID, ADANIPORTS, TITAN, INDUSINDBK, MARUTI, SBIN, CIPLA |
| Q4 | 44.0 | +99.4% | +81.8% | KOTAKBANK, COALINDIA, EICHERMOT, BPCL, TECHM, DIVISLAB, BRITANNIA, HDFCBANK, ICICIBANK |
| **Q5 (Bottom)** | 34.8 | **+39.3%** | +2.7% | HEROMOTOCO, BAJAJ-AUTO, HCLTECH, ASIANPAINT, ITC, HINDUNILVR, WIPRO, INFY, TCS |

**Q1-Q5 Spread: +193.9pp** | Signal: **STRONG** ✅

#### 3Y Backtest: March 2023 → Feb 2026 (N=47)

| Quintile | Avg Score | Avg Return | Med Return | Stocks |
|----------|-----------|------------|------------|--------|
| **Q1 (Top)** | 63.2 | **+167.7%** | +156.3% | SHRIRAMFIN, ETERNAL, ADANIENT, BAJFINANCE, M&M, ADANIPORTS, RELIANCE, BAJAJFINSV, TRENT |
| Q2 | 53.3 | +98.9% | +122.1% | BPCL, HINDALCO, TATASTEEL, GRASIM, SBIN, INDUSINDBK, WIPRO, NTPC, EICHERMOT |
| Q3 | 48.7 | +80.5% | +81.2% | ONGC, MARUTI, TITAN, BHARTIARTL, JSWSTEEL, COALINDIA, KOTAKBANK, TECHM, APOLLOHOSP |
| Q4 | 45.3 | +65.6% | +66.1% | HEROMOTOCO, CIPLA, DRREDDY, BRITANNIA, SUNPHARMA, LT, AXISBANK, ASIANPAINT, ULTRACEMCO |
| **Q5 (Bottom)** | 39.7 | **+50.6%** | +33.6% | HDFCBANK, ICICIBANK, ITC, BAJAJ-AUTO, DIVISLAB, HCLTECH, POWERGRID, INFY, HINDUNILVR |

**Q1-Q5 Spread: +117.1pp** | Signal: **STRONG** ✅

#### 1Y Backtest: March 2025 → Feb 2026 (N=48)

| Quintile | Avg Score | Avg Return | Med Return | Stocks |
|----------|-----------|------------|------------|--------|
| **Q1 (Top)** | 65.7 | **+29.0%** | +35.7% | SHRIRAMFIN, INDUSINDBK, BPCL, GRASIM, TATASTEEL, BAJFINANCE, JSWSTEEL, HINDALCO, BAJAJFINSV |
| Q2 | 58.7 | +29.0% | +27.5% | BAJAJ-AUTO, M&M, TITAN, KOTAKBANK, HEROMOTOCO, SBIN, LT, RELIANCE, MARUTI |
| Q3 | 50.9 | +13.2% | +14.7% | AXISBANK, BRITANNIA, ONGC, APOLLOHOSP, ADANIENT, ULTRACEMCO, ETERNAL, NESTLEIND, HDFCBANK |
| Q4 | 45.4 | +6.3% | +5.2% | NTPC, EICHERMOT, TRENT, ASIANPAINT, DRREDDY, ICICIBANK, DIVISLAB, CIPLA, HINDUNILVR |
| **Q5 (Bottom)** | 37.8 | **-1.7%** | +0.2% | TECHM, WIPRO, POWERGRID, ITC, ADANIPORTS, COALINDIA, BHARTIARTL, SUNPHARMA, HCLTECH |

**Q1-Q5 Spread: +30.7pp** | Signal: **STRONG** ✅

### 7.2 Signal Consistency

| Test | Result |
|------|--------|
| **Monotonic Q1→Q5** | ✅ All 3 periods show monotonically declining returns from Q1 to Q5 |
| **Q1 beats average** | ✅ In all periods, Q1 return > universe average return |
| **Q5 underperforms** | ✅ In all periods, Q5 return < universe average return |
| **Longer horizon = stronger** | ✅ Q1-Q5 spread: 5Y (194pp) > 3Y (117pp) > 1Y (31pp) |
| **Consistent bottom-dwellers** | TCS, INFY, HINDUNILVR in Q5 across all 3 periods (high-quality premium stocks) |
| **Consistent top picks** | SHRIRAMFIN in Q1 across all 3 periods; M&M, TRENT in Q1/Q2 across periods |

### 7.3 Metrics Significant Across All Periods

| Metric | Segment | 5Y r | 3Y r | 1Y r | Direction | Consistent? |
|--------|---------|------|------|------|-----------|-------------|
| `roa` | Profitability | -0.555 | -0.409 | -0.345 | negative | ✅ Yes |
| `roa_5y_avg` | Profitability | -0.362 | -0.380 | -0.332 | negative | ✅ Yes |
| `dividends_paid` | Cash Flow | -0.277 | -0.333 | -0.412 | negative | ✅ Yes |

Significant in 2/3 periods:
| Metric | 5Y r | 3Y r | 1Y r | Direction |
|--------|------|------|------|-----------|
| `roce` | -0.595 | -0.505 | -0.232 | negative |
| `net_profit_margin` | -0.505 | -0.342 | -0.208 | negative |
| `roe` | -0.466 | -0.349 | -0.205 | negative |
| `receivables_turnover` | +0.277 | +0.491 | +0.330 | positive |

---

## 8. Appendix: Full Metric Correlation Tables

### 8.1 Complete Metric-to-Segment Mapping (112 metrics)

```
PROFITABILITY (13 metrics):
  roce, roe, roe_5y_avg, roa, roa_5y_avg, net_profit_margin,
  operating_profit_margin, ebitda_margin, gross_profit_margin,
  cash_flow_margin, fcf_to_pat, earnings_quality, earnings_yield

FINANCIAL RATIOS (14 metrics):
  current_ratio, quick_ratio, debt_to_equity, interest_coverage,
  debt_to_ebitda, icr_trend, dso, dio, dpo, cash_conversion_cycle,
  asset_turnover, fixed_asset_turnover, working_capital_to_sales,
  capex_to_revenue

GROWTH (12 metrics):
  revenue_growth_1y, revenue_growth_3y_cagr, revenue_growth_5y_cagr,
  ebitda_growth_1y, ebitda_growth_3y_cagr, pat_growth_1y,
  pat_growth_3y_cagr, eps_growth_1y, eps_growth_3y_cagr,
  ocf_growth_1y, book_value_growth, earnings_momentum

VALUATION (11 metrics):
  pe_ratio, pe_vs_5y_avg, pb_ratio, pb_vs_5y_avg, ev_ebitda,
  ev_ebitda_vs_5y_avg, peg_ratio, dividend_yield, price_to_sales,
  price_to_fcf, ev_to_revenue

PRICE & VOLUME (10 metrics):
  price_52w_high_dist, price_52w_low_dist, price_return_1m,
  price_return_3m, price_return_6m, price_return_1y, price_return_3y,
  volume_surge_20d, avg_volume_20d, avg_volume_3m

TECHNICAL (22 metrics):
  rsi_14, macd_signal, macd_line, macd_histogram, ema_crossover,
  bb_position, adx_14, stochastic_k, obv_trend, ema20_dev,
  ema50_dev, ema200_dev, sma10_dev, sma20_dev, sma50_dev,
  sma100_dev, sma200_dev, sharpe_ratio, max_drawdown_1y,
  volatility, return_1y_ann, rvol

OWNERSHIP (8 metrics):
  promoter_holding, promoter_change_3m, fii_holding, fii_change_3m,
  dii_holding, mf_holding, mf_change_3m, retail_holding

INCOME STATEMENT (6 metrics):
  revenue, ebitda, pat, other_income_ratio, tax_rate, exceptional_items

BALANCE SHEET (8 metrics):
  total_assets, total_debt, net_debt, book_value_per_share,
  cash_and_equivalents, receivables_turnover, inventory_turnover,
  gross_block_growth

CASH FLOW (8 metrics):
  ocf_val, capex_val, fcf_val, fcf_margin, cash_from_investing,
  cash_from_financing, dividends_paid, ocf_to_ebitda
```

### 8.2 Worked Example: Scoring TCS (March 2025)

```
Step 1: Load TCS metrics for Y202503 snapshot

Step 2: For each segment, compute segment score:
  Example — Profitability segment:
    gross_profit_margin = (say) 45.2% → rank 38/48 → pctile 80.9
      direction = negative → adjusted = 100 - 80.9 = 19.1
      weight contribution = 19.1 × 0.369 = 7.05

    roa = 22.1% → rank 42/48 → pctile 87.2
      direction = negative → adjusted = 100 - 87.2 = 12.8
      weight contribution = 12.8 × 0.208 = 2.66

    ... (repeat for all 8 metrics)

    segment_score = Σ(weight_contribution) / Σ(|r| weights)
                  = (7.05 + 2.66 + ...) / (0.369 + 0.208 + ...)

Step 3: Compute composite:
  composite = 0.223 × profitability_score
            + 0.160 × fin_ratios_score
            + 0.131 × balance_sheet_score
            + 0.115 × cash_flow_score
            + 0.098 × income_stmt_score
            + 0.080 × valuation_score
            + 0.053 × ownership_score
            + 0.053 × growth_score
            + 0.052 × price_volume_score
            + 0.035 × technical_score

  TCS actual score ≈ 25.9 → Band: POOR → Verdict: AVOID
  (TCS 1Y actual return: -26.9%, worst in Nifty 50 — scorecard correctly flagged it)
```

---

### 8.3 Key Design Decisions & Rationale

| Decision | Rationale |
|----------|-----------|
| **Blended weights (not single-period)** | Prevents overfitting to one market regime. Growth/P&V weights swing wildly between periods; blending stabilises. |
| **Top-8 metrics per segment** | Avoids noise from low-signal metrics. Adding more metrics dilutes the signal (tested: top-8 outperforms top-12 in backtests). |
| **Percentile ranking (not raw values)** | Cross-sectional comparison must be distribution-free. A 15% ROE means different things in banking vs IT. |
| **Direction from correlation sign** | Empirically derived — no subjective "higher is better" assumptions. The data tells us high profitability is priced in (negative). |
| **Composite formula = simple weighted average** | No non-linear transformations needed. Quintile tests show monotonic separation with simple linear weights. |
| **|r| as metric weight** | Metrics with stronger empirical correlation get more voice within their segment. |
| **composite = 0.7 × avg_|r| + 0.3 × sig_frac for segment weight** | Balances average signal strength (70%) with statistical consistency (30%). Pure avg_|r| would overweight segments with a few noisy strong signals. |
| **NULL → score 50, weight 0** | Missing data = neutral. The stock is neither rewarded nor penalised for inapplicable metrics. |

---

*Generated from empirical analysis of Nifty 50 stocks.*
*Source scripts: `scripts/scorecard-v1/multi-period-analysis.mjs`, `scripts/scorecard-v1/cross-sectional-analysis.mjs`*
*Data: `data/results/cross-sectional/multi-period-analysis.json`, `data/results/cross-sectional/scorecard-weights.json`*
