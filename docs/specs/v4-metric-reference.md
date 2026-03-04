# StockFox V4.1 — Complete Metric Reference (Post-Implementation Audit)

Engine: V4 Non-Banking Expert Model (V4.1)
Source: `src/services/metricResolver.ts`, `src/data/scorecardTemplates.ts`, `src/lib/`
Audit Date: 2026-02-26 — All 5 SME-approved fixes implemented and verified.

---

## A. FINANCIAL SEGMENT (Weight in Composite: 30%)

### 1. Revenue Growth (5Y CAGR) — Weight: 15%

| Item | Detail |
|------|--------|
| **Formula** | `CAGR = (Latest Revenue / Oldest Revenue)^(1/years) − 1 × 100` |
| **Data Source** | Primary: CMOTS FinData `.revenue` field. Fallback: P&L row 1 ("Revenue from Operations") |
| **Method** | `computeRevenueGrowth5Y()` → [metricResolver.ts:870–893](src/services/metricResolver.ts#L870) |
| **Period** | Up to 5 fiscal years, windowed to ≤ asOfDate. Min 2 years required. |
| **Edge Cases** | Base year = 0 → null. Mixed signs → falls back to P&L row. FinData < 2 records → falls back to P&L row. |
| **Score Bands** | ≥20%→100, 15–20%→95, 12–15%→80, 8–12%→70, 4–8%→60, 2–4%→50, 0–2%→40, -5–0%→30, -10–-5%→20, <-10%→10 |
| **Engine Status** | **Implemented as specified** |

---

### 2. EBITDA Growth (5Y CAGR) — Weight: 15%

| Item | Detail |
|------|--------|
| **Formula** | `CAGR = (Latest EBITDA / Oldest EBITDA)^(1/years) − 1 × 100` |
| **Data Source** | P&L row 46 ("Operation Profit before Depreciation") |
| **Method** | `computeRowGrowth5Y()` → [metricResolver.ts:900–920](src/services/metricResolver.ts#L900) |
| **Period** | Up to 5 fiscal years, windowed to ≤ asOfDate. Min 2 years required. |
| **Edge Cases** | Base = 0 → null. Mixed signs (one positive, one negative) → null. Both negative → CAGR on absolute values. |
| **Score Bands** | Same as Revenue Growth |
| **Engine Status** | **Implemented as specified** |

---

### 3. Earnings Growth — PBT minus Other Income (5Y CAGR) — Weight: 20%

| Item | Detail |
|------|--------|
| **Formula** | `Core Earnings = PBT − Other Income` per year, then `CAGR = (Latest CE / Oldest CE)^(1/years) − 1 × 100` |
| **Data Source** | PBT: P&L row 28 ("Profit Before Tax"). Other Income: P&L row 9 ("Other Income") |
| **Method** | `computePBTMinusOICagr()` → [metricResolver.ts:702–735](src/services/metricResolver.ts#L702) |
| **Period** | Up to 5 fiscal years. Min 2 years required. |
| **Edge Cases** | PBT−OI ≤ 0 in **either** anchor year → null (CAGR undefined). Missing OI row → OI treated as 0. |
| **Score Bands** | Same as Revenue Growth |
| **Engine Status** | **Implemented as specified** |

---

### 4. Return on Equity — ROE (5Y Average) — Weight: 15%

| Item | Detail |
|------|--------|
| **Formula** | For each FY: `ROE = (PAT / Avg Equity) × 100`, then **arithmetic mean across positive-PAT years only** |
| **Avg Equity** | `(Shareholders Fund current FY + Shareholders Fund prior FY) / 2`. Falls back to single-year equity if prior year unavailable. |
| **Data Source** | PAT: P&L row 35 ("Profit After Tax"). Equity: BS row 80 ("Total Shareholder's Fund") |
| **Method** | `computeAvgROEv4()` → [metricResolver.ts:618–661](src/services/metricResolver.ts#L618) |
| **Period** | Up to 5 fiscal years. Uses averaged equity (V4 method). |
| **Edge Cases** | Avg Equity = 0 → skip that year. **PAT ≤ 0 → skip that year** (negative-PAT years excluded from average per SME). No positive-PAT years → null. |
| **Score Bands** | ≥25%→100, 20–25%→95, 15–20%→85, 12–15%→75, 10–12%→65, 7–10%→55, 5–7%→45, 0–5%→35, -5–0%→25, -10–-5%→20, <-10%→10 |
| **Engine Status** | **Implemented as specified** — negative-PAT years excluded per SME confirmation |

---

### 5. OCF/EBITDA (5Y CAGR) — Weight: 15%

| Item | Detail |
|------|--------|
| **Formula** | Compute `OCF/EBITDA ratio` per year, then `CAGR = (Latest Ratio / Oldest Ratio)^(1/years) − 1 × 100` |
| **Data Source** | OCF: Cash Flow row 68 ("Net Cash Generated from Operations"). EBITDA: P&L row 46 ("Operation Profit before Depreciation"). |
| **Method** | `computeOCFEBITDACagr()` → [metricResolver.ts:743–771](src/services/metricResolver.ts#L743) |
| **Period** | Up to 5 fiscal years (common years between Cash Flow and P&L). Min 2 common years required. |
| **Edge Cases** | EBITDA ≤ 0 in either anchor year → null. Ratio ≤ 0 in either anchor year → null. |
| **Score Bands** | Same as Revenue Growth (v4GrowthBands) |
| **Engine Status** | **Implemented as specified** |
| **Note** | This is CAGR of the **ratio** (OCF/EBITDA), not separate CAGRs of OCF and EBITDA. |

---

### 6. Gross Block Growth (YoY) — Weight: 10%

| Item | Detail |
|------|--------|
| **Formula** | `YoY Growth = (Latest Gross Block − Prior Year) / |Prior Year| × 100` |
| **Data Source** | Balance Sheet row 2 ("Fixed Assets" / Gross Block). **No fallback.** |
| **Method** | `computeStatementYoYGrowth()` → [metricResolver.ts:844–859](src/services/metricResolver.ts#L844) |
| **Note** | V4 uses **YoY** (2 most recent years), not CAGR. No FinData fallback — if BS is empty, returns null. |
| **Edge Cases** | Prior year = 0 → null. No balance sheet → null (metric excluded, weight redistributed). |
| **Score Bands** | ≥25%→100, 20–25%→95, 15–20%→90, 12–15%→85, 10–12%→80, 8–10%→70, 5–8%→60, 0–5%→45, -5–0%→35, <-5%→20 |
| **Engine Status** | **Implemented as specified** — FinData fallback removed per SME |

---

### 7. Debt/EBITDA (Latest Year) — Weight: 10%

| Item | Detail |
|------|--------|
| **Formula** | `Net Debt / EBITDA` |
| **Net Debt** | `(LT Borrowings + ST Borrowings + Lease Current + Lease NC) − (Cash + Bank Balances + Current Investments)` |
| **Data Source** | LT Borrowings: BS row 58. ST Borrowings: BS row 44. Lease Current: BS row 45. Lease NC: BS row 62. Cash: BS row 29. Bank Balances: BS row 30. Current Investments: BS row 27. EBITDA: P&L row 46. |
| **Method** | `computeHistoricalDebtEBITDA()` → [metricResolver.ts:663–691](src/services/metricResolver.ts#L663) |
| **Edge Cases** | EBITDA = 0 → null. EBITDA ≤ 0 → hard floor score of 10 (via `ebitdaFloor` param). Net Debt < 0 → negative ratio, score 100 (net cash). Any missing BS row → treated as 0. |
| **Score Bands** | <0→100, 0–1.0→95, 1.0–1.5→80, 1.5–2.0→75, 2.0–2.5→65, 2.5–3.0→55, 3.0–3.5→50, 3.5–4.0→40, 4.0–6.0→35, 6.0–10→25, ≥10→10 |
| **Engine Status** | **Implemented as specified** — leases + expanded cash included per SME |

### Financial Score Formula
```
Financial Score = Σ(metric_score × metric_weight) / Σ(active_weights)
              = RevGrowth×0.15 + EBITDAGrowth×0.15 + Earnings×0.20 + ROE×0.15
                + OCF/EBITDA×0.15 + GrossBlock×0.10 + Debt/EBITDA×0.10
```
**NA handling**: Zero-NA — excluded metrics contribute 0 to numerator, their weight stays in denominator (score drags down rather than redistributing weight).

### Financial Score Verdict Thresholds
| Score | Verdict |
|-------|---------|
| 85–100 | Very Strong Financials |
| 70–84 | Strong Financials |
| 55–69 | Average Financials |
| 40–54 | Weak Financials |
| 0–39 | Poor Financials |

---

## B. VALUATION SEGMENT (Weight in Composite: 45%)

### 8. PE vs 5Y Average — Default Weight: 30%

| Item | Detail |
|------|--------|
| **Formula** | `(TTM PE / 5Y Avg PE) × 100` — result is a percentage of historical average |
| **TTM PE** | `Price at asOfDate / EPS`. EPS from P&L row 44 ("Earning Per Share — Basic"). Only when EPS > 0. |
| **5Y Avg PE** | **Harmonic mean** of PE at each FY-end. `H = n / Σ(1/PE_i)`. Excludes years with EPS ≤ 0. Requires ≥ 2 positive-PE years, else null. |
| **FY-end PE** | For each FY column: parse FY-end date (e.g., Y202503 → 2025-03-31), find closest OHLCV price on or before that date, compute `Price / EPS`. |
| **Data Source** | P&L row 44 (EPS), CMOTS OHLCV (prices at FY-end dates) |
| **Method** | TTM: `computeHistoricalValuation()` → [metricResolver.ts:391–470](src/services/metricResolver.ts#L391). 5Y Avg: `compute5YAvgValuation()` → [metricResolver.ts:487–580](src/services/metricResolver.ts#L487) |
| **Edge Cases** | EPS ≤ 0 → PE null for that year (excluded from harmonic mean). < 2 positive-PE years → avg null → metric excluded. No price at FY-end → year skipped. |
| **Engine Status** | **Implemented as specified** — harmonic mean, ≥2 years |

---

### 9. PB vs 5Y Average — Default Weight: 50% (Anchor)

| Item | Detail |
|------|--------|
| **Formula** | `(TTM PB / 5Y Avg PB) × 100` |
| **TTM PB** | `Price / Book Value per Share`. BV per share = `(Shareholders Fund in Cr × 10^7) / Shares Outstanding`. |
| **5Y Avg PB** | **Harmonic mean** of PB at each FY-end. `H = n / Σ(1/PB_i)`. Excludes years with BV ≤ 0. Requires ≥ 2 positive-PB years, else null. |
| **FY-end PB** | For each FY column: parse FY-end date, find closest OHLCV price, compute `Price / BV per share` using that year's BS data. |
| **Data Source** | BS row 80 (Shareholders Fund, in Cr), BS row 91 (Shares Outstanding, absolute count), CMOTS OHLCV |
| **Method** | Same functions as PE. PB path at [metricResolver.ts:535–545](src/services/metricResolver.ts#L535) |
| **Edge Cases** | BV ≤ 0 → PB null for that year. Shares = 0 → null. < 2 positive-PB years → avg null → metric excluded. |
| **Engine Status** | **Implemented as specified** — harmonic mean, ≥2 years |

---

### 10. EV/EBITDA vs 5Y Average — Default Weight: 20%

| Item | Detail |
|------|--------|
| **Formula** | `(TTM EV/EBITDA / 5Y Avg EV/EBITDA) × 100` |
| **Enterprise Value (EV)** | `MCap + LT Borrowings + ST Borrowings + Lease Current + Lease NC − (Cash + Bank Balances + Current Investments)` (all in crores). MCap = `(Price × Shares Outstanding) / 10^7`. |
| **5Y Avg EV/EBITDA** | **Harmonic mean** of EV/EBITDA at each FY-end. Excludes years with EBITDA ≤ 0 or EV ≤ 0. Requires ≥ 2 positive-EV/EBITDA years, else null. |
| **Data Source — EV Components** | LT Borrowings: BS row 58. ST Borrowings: BS row 44. Lease Current: BS row 45. Lease NC: BS row 62. Cash: BS row 29. Bank Balances: BS row 30. Current Investments: BS row 27. Shares: BS row 91. EBITDA: P&L row 46. |
| **Method** | TTM EV: [metricResolver.ts:425–466](src/services/metricResolver.ts#L425). 5Y Avg EV: [metricResolver.ts:547–565](src/services/metricResolver.ts#L547). Harmonic mean: [metricResolver.ts:569–573](src/services/metricResolver.ts#L569) |
| **Edge Cases** | EBITDA ≤ 0 → EV/EBITDA null for that year. EV ≤ 0 → skipped. Shares = 0 → null. < 2 years → avg null → metric excluded. Missing BS row → treated as 0. |
| **Engine Status** | **Implemented as specified** — leases + expanded cash in EV, harmonic mean, ≥2 years |

### Valuation Score Bands (shared by all 3 metrics)
| % of 5Y Avg | Score | Label |
|-------------|-------|-------|
| < 70% | 100 | Deeply Undervalued |
| 70–80% | 90 | Undervalued |
| 80–95% | 85 | Attractive |
| 95–110% | 80 | Near Fair Value |
| 110–125% | 75 | Slightly Overvalued |
| 125–135% | 70 | Moderately Overvalued |
| 135–145% | 65 | Overvalued |
| 145–160% | 60 | Expensive |
| ≥ 160% | 50 | Very Expensive |

### Conditional Weighting (PB-Anchored)
Thresholds checked against **Historical 5Y Averages** (not TTM):

| Condition | Result |
|-----------|--------|
| Hist 5Y Avg PB > 30 | Entire valuation segment = N/A |
| Hist 5Y Avg PE > 75 **AND** Hist 5Y Avg EV > 35 | PB only (100%) |
| Hist 5Y Avg PE > 75 | PB=60% + EV=40% (PE excluded) |
| Hist 5Y Avg EV > 35 | PE=40% + PB=60% (EV excluded) |
| Default (all below thresholds) | **PE=30% + PB=50% + EV=20%** |

Implementation: `computeValuationScore()` in [conditionalValuation.ts:54–149](src/lib/conditionalValuation.ts#L54)

### Valuation Score Verdict Thresholds
| Score | Verdict |
|-------|---------|
| 85–100 | Undervalued |
| 75–84 | Attractive |
| 65–74 | Fairly Valued |
| 55–64 | Moderately Expensive |
| 0–54 | Expensive |

---

## C. QUARTERLY MOMENTUM SEGMENT (Weight in Composite: 18%)

### 11. Revenue Growth Multiplier — Weight: 50%

| Item | Detail |
|------|--------|
| **Formula** | `Multiplier = Avg(latest 2Q YoY Revenue Growth %) / 5Y Revenue CAGR %` |
| **Step 1** | Find the 2 most recent quarterly columns (windowed to ≤ asOfDate) |
| **Step 2** | For each, find the same-quarter-last-year column (exact month matching, e.g., Q ending Dec 2025 matches Q ending Dec 2024) |
| **Step 3** | Compute YoY growth: `((Q_current − Q_prior) / |Q_prior|) × 100` |
| **Step 4** | Average the 2 YoY growth rates (or use 1 if only 1 valid) |
| **Step 5** | Divide by the 5Y **annual** Revenue CAGR (metric `v4_revenue_growth`). This CAGR is computed from annual P&L/FinData only — it does NOT include quarterly data, so the latest quarter is NOT double-counted. |
| **Data Source** | Quarterly P&L row 1 ("Gross Sales/Income from operations"). Annual CAGR from metric #1 above. |
| **Method** | `computeV4Multiplier()` → [metricResolver.ts:779–818](src/services/metricResolver.ts#L779) |
| **Edge Cases** | Annual CAGR ≤ 0 → null. < 8 quarter columns available → null. Prior quarter value = 0 → skip that quarter. No valid YoY growths → null. |
| **Engine Status** | **Implemented as specified** |

---

### 12. EBITDA Growth Multiplier — Weight: 50%

| Item | Detail |
|------|--------|
| **Formula** | Same as Revenue Multiplier, using EBITDA data |
| **Data Source** | Quarterly P&L row 14 ("Profit from operations before other income, finance costs and exceptional items"). Annual CAGR from metric #2 above. |
| **Method** | Same `computeV4Multiplier()` with row 14 |
| **Edge Cases** | Same as Revenue Multiplier |
| **Engine Status** | **Implemented as specified** |

### Multiplier Score Bands (shared)
| Multiplier | Score | Label |
|-----------|-------|-------|
| ≥ 1.50 | 100 | Explosive |
| 1.30–1.49 | 90 | Exceptional |
| 1.20–1.29 | 80 | Very Strong |
| 1.10–1.19 | 70 | Strong |
| 0.95–1.09 | 65 | Near Trend |
| 0.75–0.94 | 60 | Above Average |
| 0.50–0.74 | 50 | Average |
| 0.40–0.49 | 40 | Below Average |
| 0.30–0.39 | 30 | Low |
| 0.20–0.29 | 20 | Very Low |
| 0–0.19 | 10 | Near-Zero |
| < 0 | 10 | Negative |

### Quarterly Momentum Score Formula
```
QM Score = (Revenue Multiplier Score × 0.50) + (EBITDA Multiplier Score × 0.50)
```
**NA handling** = `exclude`: if one multiplier is null, uses only the valid one at 100% weight.

### QM Verdict Thresholds
| Score | Verdict |
|-------|---------|
| 80–100 | Strong Acceleration |
| 65–79 | Improving Trend |
| 50–64 | Stable / Mild Slowdown |
| 10–49 | Growth Deterioration |

---

## D. TECHNICAL SEGMENT (Weight in Composite: 7%)

### 13. Price vs 20-Day EMA — Weight: 20%

| Item | Detail |
|------|--------|
| **Formula** | `Deviation (%) = ((Close Price − EMA₂₀) / EMA₂₀) × 100` |
| **EMA Calc** | `EMA = Price × k + Prev EMA × (1−k)` where `k = 2/(20+1) = 0.0952`. Initialized with SMA of first 20 days. |
| **Data Source** | CMOTS OHLCV `Dayclose` prices, windowed to ≤ asOfDate |
| **Method** | `ema()` + `priceVsEMA()` → [technicalCalc.ts:23–117](src/lib/technicalCalc.ts#L23) |
| **Engine Status** | **Implemented as specified** |

### 14. Price vs 50-Day EMA — Weight: 15%
Same formula with `k = 2/(50+1) = 0.0392`. Requires ≥ 50 data points. **Implemented as specified.**

### 15. Price vs 200-Day EMA — Weight: 35%
Same formula with `k = 2/(200+1) = 0.00995`. Requires ≥ 200 data points. **Implemented as specified.**

### EMA Deviation Score Bands (shared by all 3)
| Deviation | Score | Label |
|-----------|-------|-------|
| > +5% | 100 | Strongly Above EMA |
| +1% to +5% | 70 | Above EMA |
| -1% to +1% | 30 | Near EMA |
| -5% to -1% | 20 | Below EMA |
| < -5% | -10 | Deeply Below EMA |

---

### 16. RSI (14-day) — Weight: 10%

| Item | Detail |
|------|--------|
| **Formula** | Wilder's smoothed RSI: `RSI = 100 − 100/(1 + RS)` where `RS = Avg Gain / Avg Loss` |
| **Step 1** | Compute daily price changes from OHLCV close prices |
| **Step 2** | Initial avg gain/loss: arithmetic mean over first 14 days |
| **Step 3** | Wilder's smoothing: `avgGain = (prevAvgGain × 13 + currentGain) / 14` (same for loss) |
| **Step 4** | Final: `RS = avgGain / avgLoss`, then RSI formula. Rounded to 2 decimals. |
| **Data Source** | CMOTS OHLCV `Dayclose` prices. Requires ≥ 15 data points. |
| **Method** | `rsi()` → [technicalCalc.ts:54–82](src/lib/technicalCalc.ts#L54) |
| **Edge Cases** | Both avgGain and avgLoss = 0 → RSI = 50. avgLoss = 0 → RSI = 100. |
| **Engine Status** | **Implemented as specified** |

### RSI Score Bands (V4)
| RSI Range | Score | Label |
|-----------|-------|-------|
| 50–65 | 100 | Optimal Momentum |
| 40–50 or 65–70 | 70 | Healthy / Bullish Extended |
| 30–40 or 70–80 | 30 | Weak / Overbought Zone |
| 20–30 or 80+ | 20 | Oversold / Strongly Overbought |
| < 20 | 10 | Extreme Oversold |

---

### 17. Volume-Price Trend — Weight: 20%

| Item | Detail |
|------|--------|
| **Method** | **Conditional scoring** (not band lookup). Two inputs scored together. |
| **Input 1: Volume Ratio** | `Avg(5-day volume) / Avg(50-day volume)`. Values > 1 = above-average volume. |
| **Input 2: Price Change** | 5-day price change (%) |
| **Data Source** | CMOTS OHLCV `Volume` and `Dayclose` |
| **Method** | `scoreVPTV4()` → [scoringEngine.ts:64–72](src/lib/scoringEngine.ts#L64) |
| **Engine Status** | **Implemented as specified** |

### VPT V4 Conditional Rules (evaluated in priority order)
| # | Condition | Score | Label |
|---|-----------|-------|-------|
| 1 | Vol > 1.5 AND Price < -2% | 0 | Heavy Selling |
| 2 | Vol > 1.5 AND Price > +2% | 100 | Strong Accumulation |
| 3 | Vol > 1.0 AND Price < -1% | 10 | Distribution |
| 4 | Vol 1.2–1.5 AND Price 0–2% | 80 | Quiet Accumulation |
| 5 | Vol 0.5–0.8 AND Price > 0% | 20 | Light Buying |
| 6 | Vol 0.8–1.2 | 30 | Neutral |
| 7 | Fallback | 30 | Neutral |

### Technical Score Formula
```
Technical Score = (20DMA_score × 0.20) + (50DMA_score × 0.15) + (200DMA_score × 0.35)
               + (RSI_score × 0.10) + (VPT_score × 0.20)
```

### Technical Score Verdict Thresholds
| Score | Verdict |
|-------|---------|
| 75–100 | Bullish |
| 60–74 | Mild Bullish |
| 50–59 | Neutral |
| 40–49 | Mild Bearish |
| 0–39 | Bearish |

---

## E. OVERALL COMPOSITE SCORE

### Formula (Flat Composite)
```
Composite = Financial × 0.30 + Valuation × 0.45 + Quarterly Momentum × 0.18 + Technical × 0.07
```
All segments in flat structure with `baseWeight = 1.0` (no nested base/overlay).

Implementation: V4 composite in [scorecardTemplates.ts:1212–1222](src/data/scorecardTemplates.ts#L1212)

### NA Handling
- **Zero-NA** mode: If a segment is N/A (e.g., valuation not meaningful), it contributes 0 to the score but its weight remains in the denominator. This drags the composite down rather than redistributing weight.
- Exception: QM uses **exclude** mode for individual multipliers (if one is null, the other gets 100% weight within QM).

### Overall Verdict Thresholds
| Score | Verdict | Interpretation |
|-------|---------|----------------|
| 80–100 | **STRONG BUY** | Strong fundamentals + attractive valuation + supportive technicals |
| 65–79 | **BUY** | Good fundamentals, valuation, and supportive technicals |
| 50–64 | **HOLD** | Mixed signals, wait-and-watch |
| 35–49 | **REVIEW** | Average fundamentals, stretched valuation, downside risk |
| 0–34 | **SELL** | Weak fundamentals + extreme valuation at CMP |

---

## F. CMOTS ROW NUMBER REFERENCE

### Balance Sheet Rows Used
| Constant | Row # | Description |
|----------|-------|-------------|
| `BS_ROW_FIXED_ASSETS` | 2 | Fixed Assets (Gross Block) |
| `BS_ROW_CURRENT_INVESTMENTS` | 27 | Current Investments |
| `BS_ROW_CASH` | 29 | Cash and Cash Equivalents |
| `BS_ROW_BANK_BALANCES` | 30 | Bank Balances Other Than Cash and Cash Equivalents |
| `BS_ROW_ST_BORROWINGS` | 44 | Short term Borrowings |
| `BS_ROW_LEASE_CURRENT` | 45 | Lease Liabilities (Current) |
| `BS_ROW_LT_BORROWINGS` | 58 | Long term Borrowings |
| `BS_ROW_LEASE_NC` | 62 | Lease Liabilities (Non Current) |
| `BS_ROW_SHAREHOLDERS_FUND` | 80 | Total Shareholder's Fund |
| `BS_ROW_SHARES_OUTSTANDING` | 91 | Subscribed & fully Paid up Shares |

### P&L Rows Used
| Constant | Row # | Description |
|----------|-------|-------------|
| `PNL_ROW_REVENUE` | 1 | Revenue from Operations |
| `PNL_ROW_OTHER_INCOME` | 9 | Other Income |
| `PNL_ROW_PBT` | 28 | Profit Before Tax |
| `PNL_ROW_PAT` | 35 | Profit After Tax |
| `PNL_ROW_EPS` | 44 | Earning Per Share — Basic |
| `PNL_ROW_EBITDA` | 46 | Operation Profit before Depreciation |

### Cash Flow Rows Used
| Constant | Row # | Description |
|----------|-------|-------------|
| `CF_ROW_OCF` | 68 | Net Cash Generated from (Used In) Operations |

### Quarterly P&L Rows Used
| Constant | Row # | Description |
|----------|-------|-------------|
| `QR_ROW_REVENUE` | 1 | Gross Sales/Income from operations |
| `QR_ROW_OP_PROFIT` | 14 | Profit from operations before other income, finance costs and exceptional items |

---

## G. IMPLEMENTATION AUDIT — 5 SME-Approved Fixes (All Complete)

| # | Metric | What Changed | Code Location | Status |
|---|--------|-------------|---------------|--------|
| 1 | Debt/EBITDA | Added BS rows 30 (Bank Balances) + 27 (Current Investments) to cash deduction. Added BS rows 45 + 62 (lease liabilities) to debt. | [metricResolver.ts:683–689](src/services/metricResolver.ts#L683) | **Done** |
| 2 | EV (TTM) | Added lease liabilities (rows 45, 62) to totalDebt. Added bank balances (30) + current investments (27) to cash. | [metricResolver.ts:438–464](src/services/metricResolver.ts#L438) | **Done** |
| 2b | EV (5Y Avg) | Same lease + expanded cash additions per FY year in the 5Y average loop. | [metricResolver.ts:547–560](src/services/metricResolver.ts#L547) | **Done** |
| 3 | PB 5Y Avg | Switched from `arithmetic mean (≥1 obs)` to `harmonic mean (≥2 obs)`. | [metricResolver.ts:577](src/services/metricResolver.ts#L577) | **Done** |
| 4 | EV/EBITDA 5Y Avg | Switched from `arithmetic mean (≥1 obs)` to `harmonic mean (≥2 obs)`. | [metricResolver.ts:578](src/services/metricResolver.ts#L578) | **Done** |
| 5 | Gross Block | Removed FinData CAGR fallback → returns `null` if no balance sheet data. | [metricResolver.ts:327](src/services/metricResolver.ts#L327) | **Done** |
| 6 | ROE | Exclude negative-PAT years from the ROE average. Added `if (pat <= 0) continue` before pushing ROE value. | [metricResolver.ts:655](src/services/metricResolver.ts#L655) | **Done** |

---

## H. ITEMS FOR SME REVIEW / FUTURE CONSIDERATION

### H1. OCF/EBITDA — CAGR of Ratio vs Separate CAGRs

**Current behavior**: Computes the OCF/EBITDA ratio per year, then takes the CAGR of that ratio series.

**Example (Bharti Airtel)**:
- Oldest ratio (FY21): 34,392/30,372 = 1.1324
- Latest ratio (FY25): 62,336/62,124 = 1.0034
- CAGR: (1.0034/1.1324)^(1/4) − 1 = -2.98%

The ratio was already ~1.0× (good cash conversion) in both anchor years — the metric is measuring whether cash conversion is improving/deteriorating over time. A declining ratio (even from 1.13 to 1.00) still indicates healthy OCF coverage.

**SME to confirm**: Is "CAGR of the ratio" the intended formula? An alternative approach could be absolute OCF CAGR minus absolute EBITDA CAGR, or a simple average of the 5-year ratios.

### H2. Harmonic Mean Behavior with Outliers

**Current behavior**: Harmonic mean is used for all 5Y valuation averages (PE, PB, EV/EBITDA). Harmonic mean is resistant to outlier highs — a very high PE in one year pulls the average down less than arithmetic mean would.

**Example (Bharti Airtel PE)**:
- PE values: [42.63, 140.62] (only 2 positive-EPS years)
- Harmonic mean: 2 / (1/42.63 + 1/140.62) = **65.46**
- Arithmetic mean would be: (42.63 + 140.62) / 2 = **91.63**

This is working as intended — the harmonic mean appropriately dampens the impact of the FY24 outlier PE of 140.62.
