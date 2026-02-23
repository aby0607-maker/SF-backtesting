# CMOTS API Reference

> Complete reference for all CMOTS (deltastockzapis.cmots.com) API endpoints used by StockFox.
> Base URL: `https://deltastockzapis.cmots.com/api`
> Auth: Bearer token via `CMOTS_API_TOKEN` environment variable.
> Proxy: Frontend calls `/api/cmots/*` which is proxied to CMOTS — by the Vite dev server locally, and by the Vercel serverless function (`api/cmots/[...path].ts`) in production.

---

## Table of Contents

1. [Company Information](#1-company-information)
2. [Company Financials](#2-company-financials)
3. [Ownership / Shareholding](#3-ownership--shareholding)
4. [Financial Ratios (EOD)](#4-financial-ratios-eod)
5. [Price Data](#5-price-data)
6. [Corporate Announcements](#6-corporate-announcements)
7. [Calendar](#7-calendar)
8. [5Y Lookback Protocol for Scoring](#5y-lookback-protocol-for-scoring)

---

## 1. Company Information

### 1.1 Company Master

| Property | Value |
|----------|-------|
| **URL** | `/companymaster` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | None |
| **Purpose** | Full list of all BSE/NSE listed companies with codes, sectors, and market cap types |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | CMOTS Company Code |
| bsecode | varchar(50) | BSE Scrip Code |
| nsesymbol | varchar(50) | NSE Symbol |
| companyname | varchar(50) | Company Long Name |
| companyshortname | varchar(50) | Company Short Name |
| categoryname | varchar(50) | Category Name |
| isin | varchar(50) | ISIN |
| bsegroup | varchar(50) | BSE Group |
| mcaptype | varchar(50) | Market Cap Type (Large Cap / Mid Cap / Small Cap) |
| sectorcode | varchar(50) | Sector Code |
| sectorname | varchar(50) | Sector Name |
| industrycode | varchar(50) | Industry Code |
| industryname | varchar(50) | Industry Name |
| bselistedflag | varchar(50) | BSE Listed Flag |
| nselistedflag | varchar(50) | NSE Listed Flag |
| displaytype | varchar(50) | Display Type |
| BSEStatus | varchar(50) | BSE Status |
| NSEStatus | varchar(50) | NSE Status |

### 1.2 Company Profile

| Property | Value |
|----------|-------|
| **URL** | `/CompanyProfile/{co_code}` |
| **Example** | `/CompanyProfile/6` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — CMOTS Company Code |
| **Purpose** | Detailed company profile: addresses, directors, auditor, face value, registrar info |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| lname | varchar(100) | Company Long Name |
| isin | varchar(50) | ISIN |
| hse_s_name | varchar(50) | HSE_S_NAME |
| inc_dt | varchar(50) | Incorporation Date |
| regadd1 | varchar(100) | Registrar Address 1 |
| regadd2 | varchar(50) | Registrar Address 2 |
| regdist | varchar(100) | Registrar District |
| regstate | varchar(50) | Registrar State |
| regpin | varchar(50) | Registrar Pincode |
| tel1 | varchar(50) | Telephone |
| ind_l_name | varchar(100) | Industry Last Name |
| tel2 | varchar(100) | Telephone 2 |
| fax1 | varchar(50) | Fax 1 |
| fax2 | null | Fax 2 |
| auditor | varchar(100) | Auditor |
| fv | Int | Face Value |
| mkt_lot | Int | Market Lot |
| chairman | varchar(50) | Chairman |
| co_sec | varchar(50) | Company Sector |
| co_code | Int | CMOTS Company Code |
| email | varchar(50) | Company Email |
| internet | varchar(50) | Internet |
| dir_name | varchar(50) | Director Name |
| dir_desg | varchar(50) | Director Designation |
| ho_add1 | varchar(50) | Head Office Address 1 |
| ho_add2 | varchar(50) | Head Office Address 2 |
| ho_add3 | varchar(50) | Head Office Address 3 |
| ho_city | varchar(50) | Head Office City |
| ho_stcode | varchar(50) | Head Office State Code |
| ho_statename | varchar(50) | Head Office State Name |
| ho_pin | Int | Head Office Pin Code |
| ho_tel1 | varchar(50) | Head Office Telephone 1 |
| ho_email | varchar(50) | Head Office Email |
| ho_ctry_name | varchar(50) | Head Office Country Name |
| rcode | varchar(50) | Registrar Code |
| reg_name | varchar(100) | Registrar Name |
| reg_add1 | varchar(100) | Registrar Address 1 |
| reg_add2 | varchar(100) | Registrar Address 2 |
| reg_add3 | varchar(100) | Registrar Address 3 |
| reg_add4 | varchar(100) | Registrar Address 4 |
| reg_tel | varchar(100) | Registrar Telephone |
| reg_fax | varchar(100) | Registrar Fax |
| reg_email | varchar(100) | Registrar Email |
| reg_internet | varchar(100) | Registrar Internet |
| flag | varchar(100) | Flag |

### 1.3 Company Background

| Property | Value |
|----------|-------|
| **URL** | `/CompanyBackground/{co_code}` |
| **Example** | `/CompanyBackground/6` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — CMOTS Company Code |
| **Purpose** | Company background text/memo |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| LNAME | varchar(500) | Company Long Name |
| MEMO | ntext | Company Background Memo |

---

## 2. Company Financials

### 2.1 Quarterly Results

| Property | Value |
|----------|-------|
| **URL** | `/QuarterlyResults/{co_code}/{type}` |
| **Example** | `/QuarterlyResults/6/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Quarterly financial results with row-based data and quarter columns |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| COLUMNNAME | varchar(50) | Row/column name |
| RID | Int | Row ID |
| Y202506 | Float | Quarter ending June 2025 |
| Y202503 | Float | Quarter ending March 2025 |
| Y202412 | Float | Quarter ending December 2024 |
| Y202409 | Float | Quarter ending September 2024 |
| Y202406 | Float | Quarter ending June 2024 |
| Y202403 | Float | Quarter ending March 2024 |
| Y202312 | Float | Quarter ending December 2023 |
| Y202309 | Float | Quarter ending September 2023 |
| rowno | Int | Row Number (used for lookup — e.g., 1 = Revenue, 14 = Operating Profit) |

**Notes:** Quarter columns follow pattern `Y{YYYY}{MM}`. Number of columns varies. Columns are newest to oldest.

### 2.2 Profit & Loss Statement

| Property | Value |
|----------|-------|
| **URL** | `/ProftandLoss/{co_code}/{type}` |
| **Example** | `/ProftandLoss/6/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Annual P&L statement rows with ~5 fiscal year columns |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| columnname | varchar(50) | Row description |
| rid | Int | Row ID |
| Y202503 | Float | FY ending March 2025 |
| Y202403 | Float | FY ending March 2024 |
| Y202303 | Float | FY ending March 2023 |
| Y202112 | Float | FY ending December 2021 |
| Y202012 | Float | FY ending December 2020 |
| rowno | Int | Row Number |

**Key Row Numbers (P&L):**

| rowno | Description | Used For |
|-------|-------------|----------|
| 1 | Revenue from Operations | Revenue Growth CAGR |
| 35 | Profit After Tax (PAT) | Earnings Growth CAGR, ROE |
| 44 | Earning Per Share - Basic | PE computation |
| 46 | Operation Profit before Depreciation (EBITDA) | EBITDA Growth, OCF/EBITDA, EV/EBITDA |

**Notes:** Year columns follow pattern `Y{YYYY}{MM}`. Typically ~5 fiscal years returned. Column months vary by company FY end (March = 03, December = 12).

### 2.3 Balance Sheet

| Property | Value |
|----------|-------|
| **URL** | `/BalanceSheet/{co_code}/{type}` |
| **Example** | `/BalanceSheet/6/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Annual balance sheet rows with ~5 fiscal year columns |

**Output Fields:** Same structure as P&L — `columnname`, `rid`, `Y{YYYYMM}` columns, `rowno`.

**Key Row Numbers (Balance Sheet):**

| rowno | Description | Used For |
|-------|-------------|----------|
| 2 | Fixed Assets (Gross Block) | Gross Block Growth |
| 29 | Cash and Cash Equivalents | EV computation |
| 44 | Short Term Borrowings | Debt/EBITDA, EV |
| 58 | Long Term Borrowings | Debt/EBITDA, EV |
| 80 | Total Shareholder's Fund | ROE, PB |
| 91 | Subscribed & Fully Paid Up Shares | Per-share computations |

### 2.4 Cash Flow

| Property | Value |
|----------|-------|
| **URL** | `/CashFlow/{co_code}/{type}` |
| **Example** | `/CashFlow/6/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Annual cash flow statement rows with ~5 fiscal year columns |

**Output Fields:** Same structure as P&L — `columnname`, `rid`, `Y{YYYYMM}` columns, `rowno`.

**Key Row Numbers (Cash Flow):**

| rowno | Description | Used For |
|-------|-------------|----------|
| 68 | Net Cash Generated from (Used In) Operations (OCF) | OCF/EBITDA ratio |

---

## 3. Ownership / Shareholding

### 3.1 Shareholding Pattern Detailed

| Property | Value |
|----------|-------|
| **URL** | `/ShareHoldingPatternDetailed/{co_code}` |
| **Example** | `/ShareHoldingPatternDetailed/476` |
| **Frequency** | EOD, 11:30 PM - 11:55 PM |
| **Input** | `co_code` — CMOTS Company Code |
| **Purpose** | Granular shareholding breakdown — promoters (Indian/Foreign), institutions, public, etc. with pledge data. Multiple quarters returned (YRC descending). |

**Output Fields (key ones):**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | Company Code |
| YRC | Int | Year-Quarter Code (e.g., 202503) |
| TotalPromoter_Shares | Int | Total Promoter Shares |
| TotalPromoter_PerShares | Int | Total Promoter % |
| TotalPromoter_PledgeShares | Int | Total Promoter Pledge Shares |
| TotalPromoter_PerPledgeShares | Int | Total Promoter Pledge % |
| NPIFII | Int | Foreign Institutional Investors - Shares |
| PPIFII | Int | FII - % Holding |
| NPIMF | Int | Mutual Funds / UTI - Shares |
| PPIMF | Int | Mutual Funds - % Holding |
| NPIINS | Int | Insurance Companies - Shares |
| PPIINS | Int | Insurance - % Holding |
| NPINDPUB | Int | Indian Public - Shares |
| PPINDPUB | Int | Indian Public - % Holding |
| TotalNonPromoter_Shares | Int | Total Non-Promoter Shares |
| TotalNonPromoter_PerShares | Int | Total Non-Promoter % |
| NGRTOTAL | Int | Grand Total Shares |
| PGRTOTAL | Int | Grand Total % |
| Total_NoofShareholders | Int | Total Number of Shareholders |

**Notes:** Contains 100+ fields for detailed category breakdown. See full API docs for complete list.

### 3.2 Shareholding More Than 1%

| Property | Value |
|----------|-------|
| **URL** | `/ShareholdingMorethanOnePercent/{co_code}` |
| **Example** | `/ShareholdingMorethanOnePercent/476` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — CMOTS Company Code |
| **Purpose** | List of shareholders holding more than 1% stake |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | Company Code |
| date | Datetime | Date |
| Type | varchar(100) | Shareholder Type |
| Name | varchar(100) | Shareholder Name |
| NOOFshares | Int | Number of Shares |
| perstake | Float | Percentage Stake |

### 3.3 Aggregate Shareholding

| Property | Value |
|----------|-------|
| **URL** | `/Aggregate-Share-Holding/{co_code}` |
| **Example** | `/Aggregate-Share-Holding/476` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — CMOTS Company Code |
| **Purpose** | Simplified aggregate shareholding pattern — used for ownership scoring metrics |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | varchar(50) | Company Code |
| yrc | datetime | Year-Quarter |
| promoters | Float | Promoter Holding % |
| retail | Float | Retail Holding % |
| foreigninstitution | Float | FII Holding % |
| mutualfund | Float | Mutual Fund Holding % |
| otherdomesticinstitution | Float | Other DII Holding % |
| others | Int | Others % |

**StockFox Usage:** This is the primary shareholding endpoint used by the scoring engine. Maps to `promoter_holding`, `fii_holding`, `dii_holding` metrics. Quarter-over-quarter changes computed for `promoter_holding_change_3m` and `fii_holding_change_3m`.

---

## 4. Financial Ratios (EOD)

### 4.1 TTM Data

| Property | Value |
|----------|-------|
| **URL** | `/TTMData/{co_code}/{type}` |
| **Example** | `/TTMData/476/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Current trailing-twelve-month ratios. Used as fallback for current scoring when statement data unavailable. |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | CMOTS Company Code |
| pe_ttm | Int | Price to Earnings (TTM) |
| dividendyield | Int | Dividend Yield |
| roe_ttm | Int | Return on Equity (TTM) |
| roce_ttm | Int | Return on Capital Employed (TTM) |
| mcap | Int | Market Capitalization |
| pb_ttm | Int | Price to Book Value (TTM) |
| eps_ttm | Int | Earnings Per Share (TTM) |
| debttoequity | Int | Debt to Equity |
| ev_ebitda | Int | EV/EBITDA |
| currentratio | Int | Current Ratio |
| returnonassets | Int | Return on Assets |
| operatingprofitmargin | Int | Operating Profit Margin |
| netprofitmargin | Int | Net Profit Margin |
| quickratio | Int | Quick Ratio |
| assetturnover_ttm | Int | Asset Turnover (TTM) |
| pegratio | Int | PEG Ratio |

**Important:** TTM data reflects CURRENT state only. CMOTS does not support historical TTM snapshots. For historical/backtest scoring, the system uses windowed statement data (P&L, BS) instead.

### 4.2 Financial Data (FinData)

| Property | Value |
|----------|-------|
| **URL** | `/FinData/{co_code}/{type}` |
| **Example** | `/FinData/476/s` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `co_code` — Company Code; `type` — `s` (Standalone) or `c` (Consolidated) |
| **Purpose** | Yearly financial metrics (typically 5 years). Used for revenue growth CAGR as primary source. |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | CMOTS Company Code |
| yrc | Int | Year code (YYYYMM format, e.g., 202503) |
| revenue | Int | Revenue |
| totalassets | Int | Total Assets |
| totalliabilities | Int | Total Liabilities |
| workingcapital | Int | Working Capital |
| interestcoverageratio | Int | Interest Coverage Ratio |
| freecashflowpershare | Int | Free Cash Flow Per Share |
| revenue_perc | Float | Revenue Percentage Change |

**Notes:** Returned sorted by `yrc`. The scoring system sorts ascending (oldest first) for growth calculations.

---

## 5. Price Data

### 5.1 BSE Delayed Price Feed (Real-Time)

| Property | Value |
|----------|-------|
| **URL** | `/BSEDelayedPriceFeed` |
| **Frequency** | 5-minute delayed, refreshed every 2 minutes during market hours |
| **Input** | None (returns all BSE stocks) |
| **Purpose** | Bulk real-time/delayed prices for all BSE-listed stocks. Used to supplement historical data with the latest price when the backtest end date is today or recent. |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| sc_code | Int | BSE Scrip Code |
| co_code | Int | CMOTS Company Code |
| CO_NAME | varchar(50) | Company Name |
| lname | varchar(50) | Company Long Name |
| isin | varchar(50) | ISIN |
| price | Int | Current Price |
| Open | Int | Day Open |
| High | Int | Day High |
| Low | Int | Day Low |
| Price_diff | Float | Price Difference |
| change | Int | Change |
| Value | Int | Value |
| Volume | Int | Volume |
| Tr_Date | Datetime | Trade Date |

**StockFox Usage:** The `getDelayedPriceFeed()` function fetches this once and caches for 5 minutes. Individual prices looked up by `co_code`. Converts to `CMOTSOHLCVRecord` format via `delayedToOHLCV()` for seamless integration with historical data.

### 5.2 Adjusted Price Chart (Historical OHLCV)

| Property | Value |
|----------|-------|
| **URL** | `/AdjustedPriceChart/{exchange}/{co_code}/{from}/{to}` |
| **Example** | `/AdjustedPriceChart/bse/6/2025-01-01/2026-01-27` |
| **Frequency** | Historical (on-demand) |
| **Input** | `exchange` — `bse` or `nse`; `co_code` — Company Code; `from` — Start date (YYYY-MM-DD); `to` — End date (YYYY-MM-DD) |
| **Purpose** | Historical adjusted OHLCV price data for a specific date range. Primary source for technical indicators, valuation history, and backtest performance tracking. |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| CO_CODE | Int | CMOTS Company Code |
| companyname | varchar | Company Name |
| Tradedate | Datetime | Trade Date |
| DayOpen | Float | Day Open Price |
| DayHigh | Float | Day High Price |
| Daylow | Float | Day Low Price |
| Dayclose | Float | Day Close Price (adjusted) |
| TotalVolume | Int | Total Volume |
| TotalValue | Float | Total Value |
| DMCAP | Float | Daily Market Cap |

**Notes:**
- API may return records in descending order — the client sorts ascending (oldest first) after fetch.
- The `from` and `to` dates in the URL directly control the returned date range. **There is no other way to get historical price data** — the API does not support "latest N days" or "last 5 years" shortcuts.

---

### 5Y Lookback Protocol for Scoring

> **CRITICAL: This protocol applies to ALL scoring dates — start, every interval, and end.**

Scores are computed at multiple dates during a backtest:
- The **start date** (e.g., 2025-01-01)
- Every **interval date** in between (e.g., 2025-02-01, 2025-03-01, ... for monthly)
- The **end date** (e.g., 2026-01-27)

**Each of these scoring dates requires up to 5-6 years of historical price data** for metrics including:

| Metric | Lookback Required | Reason |
|--------|-------------------|--------|
| PE vs 5Y Average | ~5 years of FY-end prices | Need price at each FY-end to compute historical PE, then average |
| PB vs 5Y Average | ~5 years of FY-end prices | Same as PE — book value at each FY-end |
| EV/EBITDA vs 5Y Avg | ~5 years of FY-end prices | Need MCap (price x shares) at each FY-end |
| Revenue CAGR 5Y | 5 FY columns (from P&L, not price) | Uses P&L statement year columns, not price API |
| EBITDA CAGR 5Y | 5 FY columns (from P&L, not price) | Same as revenue |
| Earnings CAGR 5Y | 5 FY columns (from P&L, not price) | Same as revenue |
| 5Y Average ROE | 5 FY columns (P&L + BS) | PAT / Shareholders Fund across years |
| EMA200 | 200+ trading days (~1 year) | Exponential Moving Average needs 200 data points |
| RSI | 14+ trading days | Relative Strength Index |

**Protocol:**

Since the AdjustedPriceChart API accepts a single `from` and `to` date range, the system must:

```
Price API from date = Scoring Start Date - 6 years
Price API to date   = Scoring End Date (or today if end date is in the future)
```

**Example:** For a backtest from **2025-01-01** to **2026-01-27** with monthly intervals:
- Scores computed at: 2025-01-01, 2025-02-01, ..., 2026-01-27
- Earliest scoring date needing lookback: 2025-01-01
- Required price API call: `/AdjustedPriceChart/bse/{co_code}/2019-01-01/2026-01-27`

**Why 6 years (not 5)?** The 5Y average valuation needs prices at 5 FY-end dates. FY ends are typically in March (Indian companies). To get the FY-end price for March 2020 when scoring at January 2025, we need data from at least early 2020. The extra year provides buffer for:
- Companies with non-March FY ends (December)
- EMA200 computation needing 200 trading days before the first scoring date
- Edge cases around FY-end dates and market holidays

**Without this extension:** The API would only return data from 2025-01-01 onward, making ALL 5Y metrics return `null` at EVERY scoring date — start, intervals, and end.

**Implementation locations:**
- Backtest path: `src/services/scoringService.ts` line 505-507 — `extendedFrom.setFullYear(extendedFrom.getFullYear() - 6)`
- Current scoring path: `src/services/metricResolver.ts` line 809-811 — `Date.now() - 6 * 365 * ...`

**Per-metric configurability (current state):**
- Growth metrics already support configurable lookback via `growthPeriod: 2 | 3 | 5` on each metric definition
- Valuation "vs 5Y Avg" is currently hardcoded to use all available year columns (up to 5)
- The 6Y price fetch extension is hardcoded — does not yet dynamically compute from metric configs
- The backend proxy is fully dynamic (pure passthrough) and needs zero changes for any lookback period

---

## 6. Corporate Announcements

### 6.1 BSE Announcement

| Property | Value |
|----------|-------|
| **URL** | `/BSEAnnouncement` |
| **Frequency** | Delayed, during market hours |
| **Input** | None |
| **Purpose** | BSE corporate announcements (board meetings, results, dividends, etc.) |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | Company Code |
| sc_code | Int | BSE Scrip Code |
| symbol | Int | Symbol |
| lname | Int | Company Long Name |
| caption | varchar(100) | Announcement Caption |
| date | varchar(100) | Announcement Date |
| memo | varchar(100) | Announcement Memo |
| fileurl | varchar(100) | File URL (PDF/attachment) |
| typeofannouncement | varchar(100) | Type of Announcement |
| descriptor | varchar(100) | Descriptor |

### 6.2 NSE Announcement

| Property | Value |
|----------|-------|
| **URL** | `/NSEAnnouncement` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | None |
| **Purpose** | NSE corporate announcements |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| co_code | Int | CMOTS Company Code |
| symbol | Int | Symbol |
| lname | varchar(50) | Company Long Name |
| caption | varchar(50) | Announcement Caption |
| date | datetime | Announcement Date |
| memo | varchar(500) | Announcement Memo |
| fileurl | varchar(100) | File URL |

---

## 7. Calendar

### 7.1 Exchange Holidays

| Property | Value |
|----------|-------|
| **URL** | `/Exchange-Holidays/{exchange}` |
| **Example** | `/Exchange-Holidays/BSE` |
| **Frequency** | EOD, 11:30 PM |
| **Input** | `exchange` — `BSE` or `NSE` |
| **Purpose** | List of exchange holidays for the current year |

**Output Fields:**

| Field | Type | Description |
|-------|------|-------------|
| holidaydate | datetime | Holiday Date |
| purpose | varchar(100) | Holiday Purpose/Reason |
| Day | varchar(50) | Day of Week |

---

## Quick Reference: Endpoints Used by StockFox Scoring

| Endpoint | Used In | Purpose |
|----------|---------|---------|
| `/companymaster` | `companyMaster.ts` | Stock search, co_code resolution |
| `/TTMData/{co}/{type}` | `fundamentals.ts` | Current ratios (fallback) |
| `/FinData/{co}/{type}` | `fundamentals.ts` | Revenue growth CAGR |
| `/ProftandLoss/{co}/{type}` | `fundamentals.ts` | Growth, ROE, valuation |
| `/BalanceSheet/{co}/{type}` | `fundamentals.ts` | Debt, book value, EV |
| `/CashFlow/{co}/{type}` | `fundamentals.ts` | OCF/EBITDA ratio |
| `/QuarterlyResults/{co}/{type}` | `fundamentals.ts` | Quarterly momentum |
| `/Aggregate-Share-Holding/{co}` | `shareholding.ts` | Ownership metrics |
| `/AdjustedPriceChart/{ex}/{co}/{from}/{to}` | `priceData.ts` | Technical indicators, valuation history, backtest prices |
| `/BSEDelayedPriceFeed` | `priceData.ts` | Real-time price supplement |

---

*Last Updated: 2026-02-23*
