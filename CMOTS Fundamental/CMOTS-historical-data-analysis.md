# CMOTS Historical Data Analysis: What to Ask For

## Context

The V4 Non-Banking Expert Scorecard has a **Quarterly Momentum (QM) segment worth 18% weight** that is currently broken for **99%+ of stocks** in backtesting. The root cause: the CMOTS `/QuarterlyResults` API only serves **~8 rolling quarters** (~2 years). When backtesting at historical dates, most quarters get windowed out, leaving insufficient data (need ≥8 columns with YoY matching).

CMOTS has quoted two pricing options for historical quarterly data (April 2017 – March 2025):
- **Option A — ₹2,50,000**: Quarterly result (Balance Sheet + P&L)
- **Option B — ₹4,50,000**: Quarterly results "full data"

The goal: determine exactly which data from the CMOTS Excel catalog you actually need, so you can negotiate the right package.

---

## What the QM Segment Specifically Needs

The QM calculation (`computeV4Multiplier()` in `src/services/metricResolver.ts:779-818`) uses exactly **2 rows** from the Quarterly P&L:

| What | CMOTS Sheet | Row ID (RID) | Row Name |
|------|-------------|-------------|----------|
| **Quarterly Revenue** | `QuarterlyResult` | RID 1 | "Gross Sales/Income from operations" |
| **Quarterly EBITDA (Operating Profit)** | `QuarterlyResult` | RID 14 | "Profit from operations before other income, finance costs and exceptional items" |

That's it. The QM multiplier formula:
```
Multiplier = Avg(latest 2Q YoY Revenue Growth %) / 5Y Annual Revenue CAGR %
```

It needs **≥8 quarterly columns** to compute YoY growth (current quarter vs same-quarter-last-year), and the annual CAGR comes from the **annual** P&L (already available via current API).

---

## Mapping CMOTS Excel Sheets to StockFox V4 Needs

### SHEETS YOU NEED (for historical backtesting)

| # | Excel Sheet | What It Contains | Why You Need It | Currently Available via API? |
|---|-------------|------------------|-----------------|------------------------------|
| 1 | **QuarterlyResult** | Quarterly P&L (51 rows x quarterly columns) | **QM segment**: Row 1 (Revenue) + Row 14 (Operating Profit) | Only ~8 rolling quarters (insufficient for backtesting) |

### SHEETS YOU ALREADY HAVE (annual data via current API, serves full history)

| # | Excel Sheet | What It Contains | V4 Metrics Using It | Status |
|---|-------------|------------------|---------------------|--------|
| 2 | **P&Loss** | Annual P&L (52 rows) | Revenue/EBITDA/Earnings Growth 5Y CAGR, ROE, EPS (valuation), EBITDA (valuation) | **Already available** — API serves full annual history |
| 3 | **Balance** | Annual Balance Sheet (96 rows) | Gross Block, Debt/EBITDA, Book Value (PB), Shareholders' Fund (ROE), Shares Outstanding | **Already available** |
| 4 | **cashflow** | Annual Cash Flow (142 rows) | OCF/EBITDA ratio (Row 68) | **Already available** |

### SHEETS THAT ARE NICE-TO-HAVE BUT NOT ESSENTIAL

| # | Excel Sheet | What It Contains | Assessment |
|---|-------------|------------------|------------|
| 5 | Resultbalancesheet-Quarterly | Quarterly Balance Sheet | V4 does NOT use quarterly BS data for any metric |
| 6 | Half-Yealy | Half-yearly P&L | Not used in V4 scorecard |
| 7 | Nine-Month | Nine-month P&L | Not used in V4 scorecard |
| 8 | Growth Data Quarterly | Pre-computed PAT & Revenue growth % | You can compute this from raw QuarterlyResult data |
| 9 | Quarterly Trend EBITDA | Pre-computed EBITDA + margins | You can compute this from raw QuarterlyResult data |
| 10 | Quarterly Trend Revenue | Pre-computed Revenue + margins | You can compute this from raw QuarterlyResult data |
| 11 | Quarterly Results Yearwise | Yearly-aggregated view of quarterly data | Different format (summarized) — has fewer line items, may not have Row 14 directly |
| 12 | Latest Fundamental All Scrips | Snapshot ratios (PE, PB, margins) | Useful for validation but not for backtesting |

---

## Recommendation: What to Ask CMOTS For

### You ONLY need: **Quarterly P&L (QuarterlyResult)** — April 2017 to March 2025

Specifically, historical quarterly P&L data with these rows for all BSE-listed companies:
- **Row 1**: Gross Sales/Income from operations (Revenue)
- **Row 14**: Profit from operations before other income, finance costs and exceptional items (Operating Profit / EBITDA proxy)

You do **NOT** need:
- Quarterly Balance Sheet (not used in V4 QM calculation)
- Any pre-computed growth/trend data (you compute it yourself)
- Half-yearly or Nine-month results

### Pricing Implication

| Option | Price | What You Get | What You Need From It |
|--------|-------|--------------|----------------------|
| **Option A — ₹2,50,000** | BS + P&L quarterly | **Contains the Quarterly P&L you need** + Quarterly BS you don't need | This is sufficient |
| **Option B — ₹4,50,000** | "Full data" quarterly | Everything in A + pre-computed trends, growth data, half-yearly, etc. | Overkill — the extra ₹2L buys computed metrics you can derive yourself |

### Verdict: **Option A (₹2,50,000) is sufficient for the QM backtesting gap.**

The Quarterly Balance Sheet in Option A is a bonus (could be useful for future segments) but the critical piece is the **Quarterly P&L with Row 1 and Row 14** going back to April 2017.

---

## What to Specifically Ask the CMOTS Team

> "We need historical **Quarterly P&L results** (`/QuarterlyResults/{co_code}/s` format) for **all BSE-listed companies** from **April 2017 to March 2025**, with all quarterly columns preserved (not just the latest 8 rolling quarters). The data should include the full row structure (RID 1 through 46+) with quarterly period columns (e.g., Y201706, Y201709, Y201712, Y201803, ..., Y202503).
>
> We understand Option A (₹2,50,000) includes Quarterly Balance Sheet + P&L. Can you confirm the Quarterly P&L portion includes the complete row structure matching the `/QuarterlyResults` API format?"

### Key Clarification Questions for CMOTS:
1. **Format**: Will the data be delivered as a bulk CSV/Excel dump, or as an API with extended lookback?
2. **Coverage**: Is it all ~4,000+ BSE companies, or a subset?
3. **Standalone vs Consolidated**: Does the price cover both, or just one?
4. **Delivery**: One-time dump, or ongoing API access with historical depth?
5. **Update frequency**: If API, will it continue to serve only 8 rolling quarters going forward, or will historical data persist?

---

## Impact if QM Data is Obtained

| Metric | Before (current) | After (with historical quarterly data) |
|--------|-------------------|----------------------------------------|
| QM Coverage | 0.4-0.9% of stocks | ~80-90%+ of stocks (those with ≥2 years quarterly history) |
| Effective scoring formula | F:36.6% + V:54.9% + T:8.5% (QM redistributed) | F:30% + V:45% + QM:18% + T:7% (as designed) |
| Backtest validity | QM segment entirely missing | Full 4-segment model testable |
| Score-return correlation | -0.027 (negligible/negative) | To be determined — QM may improve or not |

---

## Files Referenced
- `src/services/metricResolver.ts:779-818` — `computeV4Multiplier()` QM implementation
- `docs/specs/v4-metric-reference.md:209-267` — QM segment specification
- `docs/data/cmots-api-reference.md:138-146` — QuarterlyResults API endpoint
- `CMOTS Fundamental/Company Fundamentals (EOD).xlsx` — Sheet "QuarterlyResult" (Row 1 + Row 14)
- `Backtest V4 - 26 Feb/report.md:252-260` — QM coverage gap analysis
- `Backtest V 4.1 Scorecard - Aug-25 to Feb-26/report.md:374-382` — Extended QM gap analysis
