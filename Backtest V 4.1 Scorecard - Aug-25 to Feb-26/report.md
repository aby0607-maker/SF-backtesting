# Scorecard V4.1 — 6-Month Backtest Report
## Score vs Price Prediction Analysis

**Date Range:** 2025-08-24 to 2026-02-25 (~6 months)
**Scorecard:** V4 Non-Banking Expert Model (F:30% + V:45% + QM:18% + T:7%)
**Universe:** All BSE-listed non-banking stocks
**Generated:** 2026-02-27

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total stocks analyzed | 3599 |
| Valuation N/A (composite NaN) | 694 |
| Banking stocks excluded | 357 |
| Stocks skipped (no data) | 788 |
| Overall Score-Return Correlation (Pearson) | **-0.038** |
| Winsorized Correlation (±200% cap) | **-0.05** |
| Average Return (all stocks) | -3.66% |
| Median Return | -13.97% |
| Positive Return Hit Rate | 26.3% |
| Best Performing Stock | Steelco Gujarat Ltd (4354.55%) |
| Worst Performing Stock | Worth Investment & Trading Company Ltd (-87.74%) |
| Highest Score | Sona BLW Precision Forgings Ltd (91.5) |

**Key Finding:** The overall Pearson correlation between V4 scores and subsequent price returns is **-0.038** (negligible negative). At the aggregate level, V4 scores show limited linear correlation with returns. Quintile analysis below may reveal non-linear patterns.

---

## Quintile Analysis

Stocks ranked by V4 score and split into 5 equal groups. A "staircase" pattern (Q1 > Q2 > ... > Q5 in returns) indicates the score predicts performance.

| Quintile | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) | Best Stock | Worst Stock |
|----------|--------|-----------|-------------|-----------------|----------------|----------------|------------|-------------|
| Q1 (Top 20%) | 720 | 72.95 | -4.91% | -7.11% | -12.08% | 27.5% | Trade-Wings Ltd (1110.21%) | Yuvraaj Hygiene Products Ltd (-71.35%) |
| Q2 (20-40%) | 720 | 62.54 | -10.35% | -10.81% | -15.99% | 20.97% | Regal Entertainment & Consultants Ltd (431.11%) | Rajeshwari Cans Ltd (-83.77%) |
| Q3 (40-60%) | 720 | 56.06 | -3.93% | -6.89% | -13.66% | 24.72% | Shree Salasar Investments Ltd (1753.57%) | Chothani Foods Ltd (-73.62%) |
| Q4 (60-80%) | 720 | 49.24 | -4.82% | -7.09% | -15.07% | 26.67% | Emrock Corporation Limited (1069.75%) | Elitecon International Ltd (-84.63%) |
| Q5 (Bottom 20%) | 719 | 38.88 | 5.74% | -3.01% | -12.6% | 31.85% | Steelco Gujarat Ltd (4354.55%) | Worth Investment & Trading Company Ltd (-87.74%) |

**Q1 vs Q5 Spread:** -10.65 percentage points
Bottom-scored stocks (Q5) actually outperformed top-scored stocks (Q1). The model may not be predictive in this period.

---

## Verdict Band Analysis

How did each verdict category perform?

| Verdict | Stocks | % Universe | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) |
|---------|--------|-----------|-----------|-------------|-----------------|----------------|----------------|
| STRONG BUY | 73 | 2.03% | 82.9 | -13.85% | -13.85% | -12.63% | 24.66% |
| BUY | 767 | 21.31% | 70.87 | -4.22% | -6.33% | -12.85% | 26.99% |
| HOLD | 1626 | 45.18% | 57.35 | -7.94% | -9.44% | -14.81% | 23.19% |
| REVIEW | 988 | 27.45% | 43.49 | 3.39% | -3.93% | -13.97% | 30.26% |
| SELL | 145 | 4.03% | 32.38 | 4.52% | -0.28% | -10.98% | 32.41% |

---

## Segment Contribution — Which Segment Best Predicts Returns?

Pearson correlation between individual segment scores and price returns:

| Segment | Weight in V4 | Correlation with Returns |
|---------|-------------|-------------------------|
| Financial | 30% | -0.059 |
| Valuation | 45% | -0.014 |
| Technical | 7% | 0.005 |
| Quarterly Momentum | 18% | -0.004 |

**Most predictive segment:** Technical (r=0.005)

---

## Sector Analysis

| Sector | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Correlation |
|--------|--------|-----------|-------------|-----------------|----------------|-------------|
| Trading | 328 | 53.07 | -2.63% | -2.99% | -12% | -0.165 |
| Textiles | 236 | 52.65 | -5.31% | -6.36% | -13.02% | -0.156 |
| IT - Software | 207 | 58.76 | -6.36% | -10.35% | -19.91% | -0.068 |
| Finance | 178 | 43.2 | 14.6% | -0.95% | -9.31% | 0.156 |
| Pharmaceuticals | 174 | 58.43 | -5.47% | -5.5% | -12.77% | -0.125 |
| Chemicals | 162 | 60.84 | -14.88% | -14.88% | -17.38% | 0.067 |
| Realty | 152 | 51.68 | -5.48% | -11.21% | -15.24% | -0.029 |
| Miscellaneous | 139 | 56.7 | 1.1% | -5.45% | -11.83% | 0.077 |
| FMCG | 130 | 58.1 | -2.81% | -3.02% | -11.15% | 0.005 |
| Steel | 105 | 55.67 | 45.02% | 3.46% | -9.29% | -0.13 |
| Capital Goods-Non Electrical Equipment | 100 | 59.38 | -8.47% | -12.47% | -20.56% | -0.07 |
| Auto Ancillaries | 98 | 63.14 | 0.97% | 0.97% | -6.36% | 0.123 |
| Infrastructure Developers & Operators | 94 | 56.89 | -21.13% | -21.13% | -23.89% | 0.051 |
| Packaging | 70 | 56.19 | -12.67% | -12.67% | -16.25% | -0.08 |
| Hotels & Restaurants | 66 | 55.23 | -12.68% | -13.4% | -18.49% | -0.129 |
| Healthcare | 66 | 60.86 | 0.87% | -0.6% | -9.73% | -0.161 |
| Plastic products | 65 | 59.8 | -7.05% | -9.37% | -14.87% | -0.274 |
| Consumer Durables | 64 | 57.53 | 2.56% | -4.77% | -18.27% | -0.198 |
| Entertainment | 63 | 52.26 | -9.86% | -9.86% | -8.35% | 0.069 |
| Capital Goods - Electrical Equipment | 62 | 56.72 | -12.05% | -12.05% | -21.42% | 0.164 |
| Diamond, Gems and Jewellery | 61 | 58.2 | -0.25% | -0.25% | -4.55% | 0.124 |
| Retail | 55 | 58.44 | -6.64% | -7.44% | -23.57% | -0.118 |
| Construction | 47 | 50.67 | -7.13% | -7.13% | -8.99% | -0.066 |
| Castings, Forgings & Fastners | 46 | 63.94 | 10.79% | 4.47% | -4.78% | 0.214 |
| Logistics | 45 | 58.49 | -10.44% | -10.44% | -15.77% | 0.207 |
| Stock/ Commodity Brokers | 36 | 42.62 | -14.45% | -14.45% | -18.03% | 0.063 |
| Sugar | 35 | 53.48 | -13.9% | -13.9% | -22.94% | -0.362 |
| Paper | 33 | 59.1 | -3.37% | -4.14% | -12.45% | -0.22 |
| Diversified | 33 | 54.4 | -10.77% | -13.33% | -19.68% | -0.18 |
| Power Generation & Distribution | 32 | 50.64 | -4.94% | -4.94% | -10.66% | 0.206 |
| Plantation & Plantation Products | 31 | 53.91 | -2.11% | -2.11% | -14.79% | -0.132 |
| Aerospace & Defence | 30 | 60.75 | 1.96% | 1.96% | -9.71% | 0.154 |
| Non Ferrous Metals | 30 | 58.88 | 23.35% | 20.25% | 0.75% | -0.038 |
| Cement | 30 | 53.63 | -13.91% | -13.91% | -16.58% | 0.243 |
| E-Commerce/App based Aggregator | 25 | 59 | -1.09% | -1.09% | -13.09% | -0.376 |
| Agro Chemicals | 24 | 58.92 | -26.12% | -26.12% | -29.66% | 0.047 |
| Cables | 20 | 58.98 | -6.05% | -6.05% | -7.18% | -0.039 |
| Alcoholic Beverages | 20 | 54.72 | -12.97% | -12.97% | -12.37% | 0.56 |
| Mining & Mineral products | 20 | 55.56 | 6.14% | 6.14% | -7.25% | 0.253 |
| Automobile | 19 | 64.94 | -0.82% | -0.82% | 4.94% | 0.285 |
| Leather | 19 | 58.85 | -6.33% | -6.33% | -13.08% | -0.022 |
| Fertilizers | 19 | 55.96 | -24.3% | -24.3% | -20.42% | 0.066 |
| Education | 19 | 49.9 | -13.54% | -13.54% | -8.36% | -0.01 |
| Edible Oil | 18 | 52.98 | -6.73% | -6.73% | -7.74% | -0.287 |
| Engineering | 16 | 57.94 | -9.14% | -9.14% | -5.71% | -0.021 |
| Printing & Stationery | 15 | 57.57 | -18.16% | -18.16% | -15.53% | 0.288 |
| Media - Print/Television/Radio | 15 | 53.46 | -15.87% | -15.87% | -14.53% | -0.194 |
| Readymade Garments/ Apparells | 14 | 57.06 | -15.14% | -15.14% | -13.67% | -0.373 |
| Telecom Equipment & Infra Services | 13 | 59.17 | -9.16% | -9.16% | -17.24% | -0.087 |
| Telecom-Service | 12 | 56.01 | -10.25% | -10.25% | -13.88% | 0.064 |
| Plywood Boards/Laminates | 12 | 56.23 | -11.55% | -11.55% | -18.91% | 0.546 |
| Electronics | 11 | 59.07 | -3.41% | -3.41% | -1.98% | -0.712 |
| Bearings | 10 | 65.13 | -11.25% | -11.25% | -10.37% | 0.476 |
| Petrochemicals | 10 | 53.76 | -22.32% | -22.32% | -19.39% | -0.034 |
| IT - Hardware | 9 | 63.04 | -5.77% | -5.77% | -11.98% | 0.299 |
| Ceramic Products | 9 | 57.36 | -13.7% | -13.7% | -18.46% | -0.653 |
| Tyres | 9 | 59.23 | 7.1% | 7.1% | 0.11% | -0.079 |
| Shipping | 9 | 50.29 | -7.62% | -7.62% | -5.71% | 0.084 |
| Glass & Glass Products | 8 | 64.03 | -9.42% | -9.42% | -16.99% | -0.318 |
| Paints/Varnish | 8 | 71.06 | -13.87% | -13.87% | -13.53% | 0.178 |
| Gas Distribution | 8 | 64.62 | -4.8% | -4.8% | -4.9% | -0.178 |
| Refractories | 8 | 59.36 | -10.93% | -10.93% | -9.45% | 0.139 |
| Crude Oil & Natural Gas | 8 | 61.91 | -4.38% | -4.38% | -5.77% | -0.495 |
| Computer Education | 8 | 57.66 | -29.3% | -29.3% | -30.78% | 0.221 |
| Refineries | 8 | 56.2 | 15.9% | 15.9% | 16.11% | -0.724 |
| Ferro Alloys | 8 | 56.96 | 1.86% | 1.86% | -3.79% | -0.285 |
| Infrastructure Investment Trusts | 7 | 61.45 | 3.27% | 3.27% | 3.28% | -0.33 |
| Quick Service Restaurant | 7 | 59.31 | -22.87% | -22.87% | -23.05% | 0.558 |
| Tobacco Products | 7 | 54.83 | -32.99% | -32.99% | -22.34% | 0.081 |
| Cement - Products | 7 | 50.56 | -19.56% | -19.56% | -20.38% | 0.09 |
| Ship Building | 6 | 51.96 | 54.02% | 30.53% | -10.03% | -0.443 |
| Financial Services | 4 | 69.62 | 5.7% | 5.7% | -9.92% | 0 |
| Marine Port & Services | 4 | 61.51 | 2.11% | 2.11% | 5.51% | 0 |
| Real Estate Investment Trusts | 4 | 59.88 | 9.69% | 9.69% | 8.87% | 0 |
| Air Transport Service | 4 | 50.85 | -32.22% | -32.22% | -29.59% | 0 |
| Credit Rating Agencies | 3 | 71.17 | -8.22% | -8.22% | -9.21% | 0 |
| Oil Drill/Allied | 3 | 50.98 | -10.48% | -10.48% | -9.56% | 0 |
| Dry cells | 3 | 55.87 | -22.31% | -22.31% | -25.43% | 0 |
| Insurance | 2 | 44.53 | 2.38% | 2.38% | 2.38% | 0 |

---

## Top 20 Stocks by Score

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Sona BLW Precision Forgings Ltd | Auto Ancillaries | 91.5 | STRONG BUY | 20.5% |
| 2 | Riddhi Corporate Services Ltd | IT - Software | 90.7 | STRONG BUY | -11.21% |
| 3 | Jamna Auto Industries Ltd | Auto Ancillaries | 89.1 | STRONG BUY | 40.83% |
| 4 | Aether Industries Ltd | Chemicals | 88.4 | STRONG BUY | 25.82% |
| 5 | AWL Agri Business Ltd | FMCG | 87.4 | STRONG BUY | -26.17% |
| 6 | Crestchem Ltd | Chemicals | 87.2 | STRONG BUY | -26.68% |
| 7 | Natco Pharma Ltd | Pharmaceuticals | 86.9 | STRONG BUY | 10.86% |
| 8 | Eyantra Ventures Ltd | Trading | 86.9 | STRONG BUY | 0.97% |
| 9 | Quest Flow Controls Ltd | Capital Goods-Non Electrical Equipment | 86.4 | STRONG BUY | -38.41% |
| 10 | Navneet Education Ltd | Printing & Stationery | 86.1 | STRONG BUY | -6.37% |
| 11 | Goel Food Products Ltd | Hotels & Restaurants | 85.5 | STRONG BUY | -29.14% |
| 12 | Avenue Supermarts Ltd | Retail | 85.0 | STRONG BUY | -17.28% |
| 13 | Silicon Rental Solutions Ltd | Miscellaneous | 84.7 | STRONG BUY | -51.95% |
| 14 | Adani Enterprises Ltd | Trading | 84.6 | STRONG BUY | -0.97% |
| 15 | Tube Investments of India Ltd | Capital Goods-Non Electrical Equipment | 84.5 | STRONG BUY | -14.76% |
| 16 | Modis Navnirman Ltd | Construction | 84.4 | STRONG BUY | 13.42% |
| 17 | Rolex Rings Ltd | Castings, Forgings & Fastners | 84.3 | STRONG BUY | 1.54% |
| 18 | Ashnoor Textile Mills Ltd | Textiles | 84.3 | STRONG BUY | -11.04% |
| 19 | Cello World Ltd | Trading | 84.2 | STRONG BUY | -23.33% |
| 20 | Welcure Drugs & Pharmaceuticals Ltd | Pharmaceuticals | 84.1 | STRONG BUY | -69.44% |

## Top 20 Stocks by Return

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Steelco Gujarat Ltd | Steel | 43.6 | REVIEW | 4354.55% |
| 2 | Shree Salasar Investments Ltd | Finance | 53.2 | HOLD | 1753.57% |
| 3 | Trade-Wings Ltd | Miscellaneous | 75.2 | BUY | 1110.21% |
| 4 | Emrock Corporation Limited | Realty | 48.5 | REVIEW | 1069.75% |
| 5 | SMT Engineering Ltd | Finance | 44.5 | REVIEW | 986.39% |
| 6 | Glittek Granites Ltd | Consumer Durables | 45.9 | REVIEW | 669.24% |
| 7 | Covidh Technologies Ltd | IT - Software | 31.6 | SELL | 613.89% |
| 8 | Axis Solutions Ltd | Capital Goods-Non Electrical Equipment | 55.7 | HOLD | 600.47% |
| 9 | Carnation Industries Ltd | Castings, Forgings & Fastners | 72.4 | BUY | 490.46% |
| 10 | Omega Interactive Technologies Ltd | IT - Software | 66.9 | BUY | 435.32% |
| 11 | Regal Entertainment & Consultants Ltd | Finance | 62.2 | HOLD | 431.11% |
| 12 | Jauss Polymers Ltd | Plastic products | 33.4 | SELL | 350.37% |
| 13 | TeleCanor Global Ltd | IT - Software | 68.3 | BUY | 349.24% |
| 14 | Swan Defence and Heavy Industries Ltd | Ship Building | 37.2 | REVIEW | 340.95% |
| 15 | Stellant Securities (India) Ltd | Finance | 43.1 | REVIEW | 333.9% |
| 16 | Alka India Ltd | Textiles | 33.8 | SELL | 331.85% |
| 17 | Riddhi Steel & Tube Ltd | Steel | 57.2 | HOLD | 331.7% |
| 18 | CLC Industries Ltd | Textiles | 41.7 | REVIEW | 316.48% |
| 19 | Take Solutions Ltd | Healthcare | 48.2 | REVIEW | 296.75% |
| 20 | Synthiko Foils Ltd | Non Ferrous Metals | 49.2 | REVIEW | 293.15% |

## Bottom 20 Stocks by Return

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Worth Investment & Trading Company Ltd | Finance | 43.6 | REVIEW | -87.74% |
| 2 | Elitecon International Ltd | Tobacco Products | 52.2 | HOLD | -84.63% |
| 3 | Mehai Technology Ltd | Trading | 50.9 | HOLD | -83.86% |
| 4 | Rajeshwari Cans Ltd | Packaging | 62.6 | HOLD | -83.77% |
| 5 | Shree Krishna Infrastructure Ltd | Infrastructure Developers & Operators | 50.9 | HOLD | -80.39% |
| 6 | IKOMA Technologies Limited | Infrastructure Developers & Operators | 46.6 | REVIEW | -80.1% |
| 7 | Humming Bird Education Ltd | Education | 51.6 | HOLD | -79.47% |
| 8 | Zodiac Ventures Ltd | Realty | 60.9 | HOLD | -77.59% |
| 9 | Healthy Life Agritec Ltd | Trading | 59.8 | HOLD | -74.57% |
| 10 | Chothani Foods Ltd | Trading | 53.8 | HOLD | -73.62% |
| 11 | Cura Technologies Ltd | IT - Software | 31.0 | SELL | -73.55% |
| 12 | Vantage Knowledge Academy Ltd | Education | 42.9 | REVIEW | -73.23% |
| 13 | Padam Cotton Yarns Ltd | Textiles | 53.4 | HOLD | -72.84% |
| 14 | Astron Paper & Board Mill Ltd | Paper | 48.0 | REVIEW | -71.37% |
| 15 | Yuvraaj Hygiene Products Ltd | Plastic products | 72.1 | BUY | -71.35% |
| 16 | Magellanic Cloud Ltd | IT - Software | 56.2 | HOLD | -70.47% |
| 17 | Daikaffil Chemicals India Ltd | Chemicals | 37.3 | REVIEW | -70.42% |
| 18 | Alstone Textiles (India) Ltd | Trading | 41.5 | REVIEW | -70.37% |
| 19 | Vishnu Prakash R Punglia Ltd | Infrastructure Developers & Operators | 68.9 | BUY | -69.59% |
| 20 | Desh Rakshak Aushdhalaya Ltd | Pharmaceuticals | 41.9 | REVIEW | -69.57% |

---

## Data Completeness & Segment Coverage

### Segment Data Availability

| Segment | Weight (V4) | Stocks with Data | % Coverage | Notes |
|---------|------------|-----------------|------------|-------|
| Financial | 30% | 3599 | 100.0% | Revenue growth, EBITDA, ROE, etc. |
| Valuation | 45% | 3599 (+ 694 N/A excluded) | 83.8% of scored | PE/PB/EV vs 5Y averages |
| Quarterly Momentum | 18% | 32 | 0.9% | Revenue & EBITDA multipliers |
| Technical | 7% | 3338 | 92.7% | 20/50/200 DMA, RSI, VPT |

### QM Segment Limitation

**99.1% of stocks** have QM segment = N/A (both Revenue and EBITDA Multipliers excluded).

**Root cause:** The CMOTS `/QuarterlyResults` API serves only the latest ~8 rolling quarters. For scoring date 2025-08-24 (~6 months before end date), quarterly columns after the scoring date are excluded as future data. The `computeV4Multiplier()` function requires ≥8 quarterly columns and YoY matching.

**Formula implementation is correct** — verified against spec. This is a data availability limitation, not a code issue.

**Effect on scoring:** For stocks where QM is N/A, V4 adaptive re-normalization (existing engine rule) redistributes QM's 18% weight to active segments. Effective formula: **F:36.6% + V:54.9% + T:8.5%** (applies to 99.1% of stocks).

### Valuation N/A Stocks (694)

**694 stocks** completed scoring but had Valuation segment = N/A (all PE/PB/EV vs 5Y metrics null), causing the V4 engine to return NaN for the composite score. These are excluded from the analysis above.

**Common causes:**
- Persistently loss-making (negative EPS → PE undefined, negative EBITDA → EV undefined)
- Recently listed with < 2 fiscal years of data (harmonic mean requires ≥2 years)
- Negative book value (accumulated losses eroding equity → PB undefined)
- Sparse financial data (P&L/BS rows missing specific line items)

**V4 engine rule:** Valuation carries 45% weight. If valuation is entirely N/A, the overall score is considered meaningless → composite returns NaN.

**Valuation N/A return comparison** (not included in main analysis):
- Count: 694 stocks
- Average return: 6.15%
- Median return: -10.39%
- Positive return rate: 28.1%
- See `valuation-na-stocks.csv` for full list.

### Winsorized Averages

Raw averages are heavily distorted by extreme outliers (e.g., Swan Defence +75,843%). **Winsorized averages** cap returns at ±200% before averaging, providing a more robust measure of central tendency. Compare "Avg Return %" (raw) vs "Winsorized Avg %" in the tables above.

---

## Data Quality Notes

- Banking stocks excluded: 357 (sectors: Finance, Banks)
- Stocks skipped due to insufficient data: 788
- Valuation N/A (composite NaN): 694
- Stocks successfully scored and analyzed: 3599
