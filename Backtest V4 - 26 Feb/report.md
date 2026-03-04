# Scorecard V4 — Stock Analysis Report
## Score vs Price Prediction Analysis

**Date Range:** 2024-12-24 to 2026-02-25 (~14 months)
**Scorecard:** V4 Non-Banking Expert Model (F:30% + V:45% + QM:18% + T:7%)
**Universe:** All BSE-listed non-banking stocks
**Generated:** 2026-02-26

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total stocks analyzed | 3396 |
| Valuation N/A (composite NaN) | 0 |
| Banking stocks excluded | 357 |
| Stocks skipped (no data) | 954 |
| Overall Score-Return Correlation (Pearson) | **-0.027** |
| Winsorized Correlation (±200% cap) | **-0.035** |
| Average Return (all stocks) | 22.88% |
| Median Return | -25.73% |
| Positive Return Hit Rate | 24.4% |
| Best Performing Stock | Swan Defence and Heavy Industries Ltd (75842.73%) |
| Worst Performing Stock | Vantage Knowledge Academy Ltd (-98.48%) |
| Highest Score | Shankara Building Products Ltd (87.2) |

**Key Finding:** The overall Pearson correlation between V4 scores and subsequent price returns is **-0.027** (negligible negative). At the aggregate level, V4 scores show limited linear correlation with returns. Quintile analysis below may reveal non-linear patterns.

---

## Quintile Analysis

Stocks ranked by V4 score and split into 5 equal groups. A "staircase" pattern (Q1 > Q2 > ... > Q5 in returns) indicates the score predicts performance.

| Quintile | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) | Best Stock | Worst Stock |
|----------|--------|-----------|-------------|-----------------|----------------|----------------|------------|-------------|
| Q1 (Top 20%) | 680 | 69.86 | -4.86% | -12.7% | -21.32% | 27.35% | Axis Solutions Ltd (4405.54%) | Spright Agro Ltd (-96.22%) |
| Q2 (20-40%) | 680 | 60.35 | -10.36% | -15.37% | -26.64% | 23.68% | Arunis Abode Ltd (2524.04%) | Bharat Global Developers Ltd (-92.07%) |
| Q3 (40-60%) | 680 | 53.98 | 4.19% | -14.4% | -26.85% | 21.47% | Steelco Gujarat Ltd (4354.55%) | Gensol Engineering Ltd (-96.62%) |
| Q4 (60-80%) | 680 | 47.41 | -8.71% | -14.67% | -27.14% | 23.68% | Emrock Corporation Limited (1320.37%) | Vantage Knowledge Academy Ltd (-98.48%) |
| Q5 (Bottom 20%) | 676 | 38.35 | 134.81% | -7.27% | -25.81% | 25.74% | Swan Defence and Heavy Industries Ltd (75842.73%) | Money Masters Leasing & Finance Ltd (-90.45%) |

**Q1 vs Q5 Spread:** -139.67 percentage points
Bottom-scored stocks (Q5) actually outperformed top-scored stocks (Q1). The model may not be predictive in this period.

---

## Verdict Band Analysis

How did each verdict category perform?

| Verdict | Stocks | % Universe | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Hit Rate (>0%) |
|---------|--------|-----------|-----------|-------------|-----------------|----------------|----------------|
| STRONG BUY | 37 | 1.09% | 82.41 | -13.66% | -13.66% | -15.59% | 32.43% |
| BUY | 533 | 15.69% | 70.12 | -1.34% | -11.33% | -20.29% | 27.39% |
| HOLD | 1550 | 45.64% | 57.32 | -5.22% | -15.58% | -26.94% | 22.58% |
| REVIEW | 1133 | 33.36% | 43.64 | 73.8% | -11.04% | -25.92% | 25.24% |
| SELL | 143 | 4.21% | 32.79 | 23.78% | -4.01% | -26.87% | 23.78% |

---

## Segment Contribution — Which Segment Best Predicts Returns?

Pearson correlation between individual segment scores and price returns:

| Segment | Weight in V4 | Correlation with Returns |
|---------|-------------|-------------------------|
| Financial | 30% | -0.04 |
| Valuation | 45% | 0.012 |
| Technical | 7% | -0.023 |
| Quarterly Momentum | 18% | -0.001 |

**Most predictive segment:** Valuation (r=0.012)

---

## Sector Analysis

| Sector | Stocks | Avg Score | Avg Return % | Winsorized Avg % | Median Return % | Correlation |
|--------|--------|-----------|-------------|-----------------|----------------|-------------|
| Trading | 312 | 50.37 | 29.42% | -7.62% | -28.28% | -0.13 |
| Textiles | 228 | 51.53 | -13.98% | -15.66% | -28.21% | -0.138 |
| IT - Software | 192 | 55.95 | -6.89% | -17.1% | -33.83% | -0.194 |
| Finance | 179 | 43.39 | 21.34% | -8.07% | -25.92% | 0.08 |
| Pharmaceuticals | 167 | 54.65 | -12.55% | -12.84% | -23.22% | 0.041 |
| Chemicals | 161 | 58.45 | -18.88% | -20.14% | -26.81% | 0.063 |
| Realty | 147 | 50.88 | -11.37% | -19.76% | -28.34% | -0.094 |
| Miscellaneous | 123 | 53.26 | -7.07% | -15.04% | -21.44% | 0.048 |
| FMCG | 120 | 57.22 | 1.21% | -3.46% | -15.03% | -0.034 |
| Steel | 99 | 54.64 | 47.29% | 1.6% | -21.27% | -0.036 |
| Capital Goods-Non Electrical Equipment | 97 | 56.45 | 21.94% | -21.42% | -26.9% | 0.14 |
| Auto Ancillaries | 96 | 61.1 | 1.83% | 1.83% | -7.29% | 0.263 |
| Infrastructure Developers & Operators | 84 | 53.75 | -31.27% | -31.59% | -39.12% | 0.077 |
| Packaging | 65 | 55.99 | -23.31% | -23.31% | -24.9% | 0.002 |
| Hotels & Restaurants | 61 | 54.02 | -12.47% | -17.4% | -21.35% | 0.09 |
| Entertainment | 60 | 52.68 | -17.07% | -18.26% | -30.32% | -0.131 |
| Plastic products | 60 | 57.59 | -19.44% | -21.07% | -29.67% | -0.28 |
| Consumer Durables | 60 | 55.41 | 12.14% | -9.62% | -30.87% | -0.282 |
| Healthcare | 58 | 57.2 | 6.37% | 4.19% | -6.55% | -0.449 |
| Capital Goods - Electrical Equipment | 57 | 54.12 | -19.82% | -19.82% | -35.07% | 0.157 |
| Diamond, Gems and Jewellery | 53 | 56.3 | 32.18% | -4.18% | -21.28% | -0.174 |
| Retail | 50 | 54.99 | -11.3% | -15.17% | -32.87% | 0.035 |
| Construction | 45 | 50.46 | -20% | -20% | -16.86% | -0.039 |
| Castings, Forgings & Fastners | 41 | 60.09 | -5.69% | -5.69% | -7.55% | 0.132 |
| Logistics | 39 | 57.97 | -25.83% | -25.83% | -34.3% | 0.219 |
| Paper | 34 | 60.14 | -15.15% | -17.03% | -30.29% | -0.254 |
| Sugar | 34 | 54.63 | 37.57% | -27.02% | -35.23% | -0.446 |
| Stock/ Commodity Brokers | 34 | 44.18 | -22.43% | -23.15% | -36.4% | 0.108 |
| Diversified | 32 | 52.96 | 62.01% | -10.61% | -31.78% | 0.1 |
| Power Generation & Distribution | 32 | 49.84 | -11.59% | -11.59% | -20.13% | 0.458 |
| Plantation & Plantation Products | 31 | 49.63 | -8.29% | -14.01% | -30.05% | -0.145 |
| Cement | 30 | 57.38 | -11.05% | -11.05% | -13.32% | 0.259 |
| Non Ferrous Metals | 27 | 54.65 | 35.47% | 13.22% | -9.3% | -0.12 |
| Aerospace & Defence | 27 | 55.73 | 172.4% | 23.01% | 2.17% | -0.015 |
| Agro Chemicals | 24 | 57.33 | -15.07% | -15.07% | -23.94% | 0.258 |
| E-Commerce/App based Aggregator | 21 | 55.93 | 28.64% | -4.31% | -31.73% | -0.391 |
| Alcoholic Beverages | 20 | 56.84 | -16.85% | -16.85% | -24.12% | 0.437 |
| Mining & Mineral products | 20 | 51.98 | -4.82% | -4.82% | -7.7% | 0.222 |
| Automobile | 19 | 60.54 | 28.78% | 22.74% | 15.06% | 0.081 |
| Leather | 19 | 56.68 | -9.97% | -11.82% | -29.55% | -0.326 |
| Fertilizers | 17 | 53.25 | -3.1% | -3.1% | -8.92% | 0.819 |
| Education | 17 | 48.07 | -27.45% | -27.45% | -42.64% | 0.226 |
| Cables | 17 | 57 | -17.34% | -17.34% | -24.71% | 0.024 |
| Edible Oil | 17 | 49.47 | -15.75% | -15.75% | -27.85% | -0.142 |
| Media - Print/Television/Radio | 16 | 55.59 | -26.84% | -26.84% | -33.13% | 0.116 |
| Readymade Garments/ Apparells | 15 | 55.13 | -29.93% | -29.93% | -39.13% | -0.422 |
| Engineering | 13 | 54.37 | -16.7% | -16.7% | -14.14% | 0.447 |
| Telecom Equipment & Infra Services | 12 | 55.41 | -11.89% | -11.89% | -31.61% | -0.043 |
| Printing & Stationery | 12 | 54.14 | -32.62% | -32.62% | -33.76% | 0.605 |
| Plywood Boards/Laminates | 12 | 58.69 | -23.96% | -23.96% | -24.92% | -0.072 |
| Telecom-Service | 12 | 51.67 | -27.08% | -27.08% | -31.79% | -0.188 |
| Bearings | 10 | 60.61 | -18.63% | -18.63% | -13.94% | 0.356 |
| Petrochemicals | 10 | 56.88 | -29.44% | -29.44% | -34.03% | -0.094 |
| Electronics | 9 | 51.99 | 5.62% | 5.62% | -15.4% | 0.513 |
| Tyres | 9 | 64.11 | -2.58% | -2.58% | -10.16% | 0.606 |
| Shipping | 9 | 47.04 | -25.34% | -25.34% | -32.2% | 0.195 |
| Glass & Glass Products | 8 | 60.17 | -17.62% | -17.62% | -20.59% | -0.096 |
| Refractories | 8 | 57.14 | -12.49% | -12.49% | -14.37% | 0.413 |
| Ferro Alloys | 8 | 47.98 | -14.03% | -14.03% | -14.59% | 0.358 |
| Paints/Varnish | 7 | 74.67 | -10.73% | -10.73% | -11.21% | 0.364 |
| Gas Distribution | 7 | 67.05 | -13.71% | -13.71% | -14.8% | 0.549 |
| Refineries | 7 | 67.03 | 17.54% | 17.54% | 30.55% | 0.372 |
| IT - Hardware | 7 | 55.87 | -23.25% | -23.25% | -25.33% | 0.206 |
| Quick Service Restaurant | 7 | 65.32 | -23.47% | -23.47% | -26.63% | -0.415 |
| Crude Oil & Natural Gas | 7 | 56.63 | 48.63% | 14.6% | -18.31% | -0.724 |
| Ceramic Products | 7 | 59.84 | -20.14% | -20.14% | -15.54% | -0.641 |
| Tobacco Products | 7 | 53.32 | 64.78% | 13.48% | -28.1% | -0.46 |
| Cement - Products | 7 | 51.96 | -33.74% | -33.74% | -39.38% | -0.007 |
| Ship Building | 6 | 47.86 | 12635.32% | 28.2% | -4.69% | -0.258 |
| Computer Education | 6 | 52.2 | -42.08% | -42.08% | -43.07% | 0.146 |
| Infrastructure Investment Trusts | 5 | 59.74 | 6.55% | 6.55% | 5.58% | -0.15 |
| Financial Services | 4 | 60.44 | 1.32% | 1.32% | -27.71% | 0 |
| Air Transport Service | 4 | 50.14 | -38.09% | -38.09% | -38.41% | 0 |
| Credit Rating Agencies | 3 | 66.52 | -2.84% | -2.84% | -8.34% | 0 |
| Real Estate Investment Trusts | 3 | 65.46 | 23.41% | 23.41% | 23.67% | 0 |
| Insurance | 3 | 55.78 | 22.92% | 22.92% | 18.12% | 0 |
| Dry cells | 3 | 51.31 | -30.57% | -30.57% | -36.03% | 0 |
| Oil Drill/Allied | 2 | 51.9 | -25.93% | -25.93% | -25.93% | 0 |
| Marine Port & Services | 2 | 52.04 | 14.16% | 14.16% | 14.16% | 0 |

---

## Top 20 Stocks by Score

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Shankara Building Products Ltd | Retail | 87.2 | STRONG BUY | -34.67% |
| 2 | Asian Paints Ltd | Paints/Varnish | 87.0 | STRONG BUY | 5.76% |
| 3 | Satia Industries Ltd | Paper | 86.3 | STRONG BUY | -30.93% |
| 4 | Shri Dinesh Mills Ltd | Textiles | 85.2 | STRONG BUY | -41.24% |
| 5 | Riddhi Corporate Services Ltd | IT - Software | 84.6 | STRONG BUY | -5.58% |
| 6 | Indraprastha Gas Ltd | Gas Distribution | 84.6 | STRONG BUY | -14.8% |
| 7 | Vistar Amar Ltd | FMCG | 84.5 | STRONG BUY | 49.5% |
| 8 | Starlineps Enterprises Ltd | Diamond, Gems and Jewellery | 84.1 | STRONG BUY | 65.65% |
| 9 | PNC Infratech Ltd | Infrastructure Developers & Operators | 83.9 | STRONG BUY | -31.13% |
| 10 | Varroc Engineering Ltd | Auto Ancillaries | 83.8 | STRONG BUY | -7.85% |
| 11 | Goel Food Products Ltd | Hotels & Restaurants | 83.6 | STRONG BUY | -38.06% |
| 12 | Automotive Axles Ltd | Auto Ancillaries | 83.3 | STRONG BUY | 14.16% |
| 13 | Deep Polymers Ltd | Chemicals | 83.2 | STRONG BUY | -49.39% |
| 14 | TCI Express Ltd | Logistics | 82.9 | STRONG BUY | -34.84% |
| 15 | Jamna Auto Industries Ltd | Auto Ancillaries | 82.8 | STRONG BUY | 49.58% |
| 16 | Delta Corp Ltd | Miscellaneous | 82.4 | STRONG BUY | -44.84% |
| 17 | Berger Paints India Ltd | Paints/Varnish | 82.1 | STRONG BUY | 2.67% |
| 18 | Paushak Ltd | Chemicals | 81.9 | STRONG BUY | -25.75% |
| 19 | Sheetal Cool Products Ltd | FMCG | 81.9 | STRONG BUY | 2.59% |
| 20 | Fine Organic Industries Ltd | Chemicals | 81.8 | STRONG BUY | 4.99% |

## Top 20 Stocks by Return

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Swan Defence and Heavy Industries Ltd | Ship Building | 40.8 | REVIEW | 75842.73% |
| 2 | Axis Solutions Ltd | Capital Goods-Non Electrical Equipment | 71.2 | BUY | 4405.54% |
| 3 | Steelco Gujarat Ltd | Steel | 52.0 | HOLD | 4354.55% |
| 4 | RRP Defense Ltd | Aerospace & Defence | 54.1 | HOLD | 4233.59% |
| 5 | Swadeshi Industries & Leasing Ltd | Trading | 39.8 | REVIEW | 4122.6% |
| 6 | Omansh Enterprises Ltd | Trading | 35.0 | REVIEW | 4120.4% |
| 7 | Arunis Abode Ltd | Diversified | 58.1 | HOLD | 2524.04% |
| 8 | Oswal Overseas Ltd | Sugar | 34.3 | SELL | 2396.11% |
| 9 | Stellant Securities (India) Ltd | Finance | 38.5 | REVIEW | 2311.22% |
| 10 | Vega Jewellers Ltd | Diamond, Gems and Jewellery | 37.3 | REVIEW | 2127.18% |
| 11 | Shree Salasar Investments Ltd | Finance | 55.0 | HOLD | 1845.64% |
| 12 | Glittek Granites Ltd | Consumer Durables | 34.8 | SELL | 1364.19% |
| 13 | Emrock Corporation Limited | Realty | 44.1 | REVIEW | 1320.37% |
| 14 | Mardia Samyoung Capillary Tubes Company Ltd | Trading | 37.1 | REVIEW | 1162.87% |
| 15 | Amit Securities Ltd | Trading | 55.9 | HOLD | 1135.75% |
| 16 | Trade-Wings Ltd | Miscellaneous | 69.9 | BUY | 1110.21% |
| 17 | Colab Platforms Ltd | IT - Software | 46.9 | REVIEW | 922.25% |
| 18 | Citizen Infoline Ltd | E-Commerce/App based Aggregator | 38.6 | REVIEW | 891.93% |
| 19 | Synthiko Foils Ltd | Non Ferrous Metals | 47.5 | REVIEW | 800.82% |
| 20 | Osiajee Texfab Ltd | Trading | 40.4 | REVIEW | 785.4% |

## Bottom 20 Stocks by Return

| Rank | Stock | Sector | Score | Verdict | Return % |
|------|-------|--------|-------|---------|----------|
| 1 | Vantage Knowledge Academy Ltd | Education | 46.3 | REVIEW | -98.48% |
| 2 | Gensol Engineering Ltd | Infrastructure Developers & Operators | 56.8 | HOLD | -96.62% |
| 3 | Spright Agro Ltd | Trading | 65.6 | BUY | -96.22% |
| 4 | AGS Transact Technologies Ltd | Miscellaneous | 49.5 | REVIEW | -94.59% |
| 5 | Rajeshwari Cans Ltd | Packaging | 67.7 | BUY | -92.93% |
| 6 | Pulsar International Ltd | Trading | 53.7 | HOLD | -92.18% |
| 7 | K&R Rail Engineering Ltd | Infrastructure Developers & Operators | 50.0 | HOLD | -92.16% |
| 8 | Bharat Global Developers Ltd | Trading | 58.5 | HOLD | -92.07% |
| 9 | Money Masters Leasing & Finance Ltd | Finance | 33.5 | SELL | -90.45% |
| 10 | Mehai Technology Ltd | Trading | 60.4 | HOLD | -90.4% |
| 11 | Getalong Enterprise Ltd | Miscellaneous | 54.6 | HOLD | -89.98% |
| 12 | New Light Industries Ltd | Trading | 53.6 | HOLD | -88.85% |
| 13 | Worth Investment & Trading Company Ltd | Finance | 46.7 | REVIEW | -88.44% |
| 14 | Polo Queen Industrial and Fintech Ltd | Trading | 56.2 | HOLD | -88.04% |
| 15 | Harshil Agrotech Ltd | Trading | 42.8 | REVIEW | -86.6% |
| 16 | KBS India Ltd | Stock/ Commodity Brokers | 33.5 | SELL | -86.36% |
| 17 | Containe Technologies Ltd | Auto Ancillaries | 65.9 | BUY | -85.73% |
| 18 | Zodiac Ventures Ltd | Realty | 66.1 | BUY | -84.66% |
| 19 | A F Enterprises Ltd | Trading | 43.7 | REVIEW | -84.55% |
| 20 | Alliance Integrated Metaliks Ltd | Steel | 65.0 | BUY | -84.5% |

---

## Data Completeness & Segment Coverage

### Segment Data Availability

| Segment | Weight (V4) | Stocks with Data | % Coverage | Notes |
|---------|------------|-----------------|------------|-------|
| Financial | 30% | 3396 | 100.0% | Revenue growth, EBITDA, ROE, etc. |
| Valuation | 45% | 3396 (+ 0 N/A excluded) | 100.0% of scored | PE/PB/EV vs 5Y averages |
| Quarterly Momentum | 18% | 14 | 0.4% | Revenue & EBITDA multipliers |
| Technical | 7% | 3140 | 92.5% | 20/50/200 DMA, RSI, VPT |

### QM Segment Limitation

**99.6% of stocks** have QM segment = N/A (both Revenue and EBITDA Multipliers excluded).

**Root cause:** The CMOTS `/QuarterlyResults` API serves only the latest ~8 rolling quarters. For scoring date 2024-12-24 (14 months ago), only 3 of 8 quarterly columns survive windowing (quarters ending after the scoring date are excluded as future data). The `computeV4Multiplier()` function requires ≥8 quarterly columns and YoY matching, which cannot be satisfied.

**Formula implementation is correct** — verified against spec. This is a data availability limitation, not a code issue.

**Effect on scoring:** V4 adaptive re-normalization (existing engine rule) redistributes QM's 18% weight to active segments. Effective formula for 99.6% of stocks: **F:36.6% + V:54.9% + T:8.5%**.

### Valuation N/A Stocks (0)

**0 stocks** completed scoring but had Valuation segment = N/A (all PE/PB/EV vs 5Y metrics null), causing the V4 engine to return NaN for the composite score. These are excluded from the analysis above.

**Common causes:**
- Persistently loss-making (negative EPS → PE undefined, negative EBITDA → EV undefined)
- Recently listed with < 2 fiscal years of data (harmonic mean requires ≥2 years)
- Negative book value (accumulated losses eroding equity → PB undefined)
- Sparse financial data (P&L/BS rows missing specific line items)

**V4 engine rule:** Valuation carries 45% weight. If valuation is entirely N/A, the overall score is considered meaningless → composite returns NaN.

### Winsorized Averages

Raw averages are heavily distorted by extreme outliers (e.g., Swan Defence +75,843%). **Winsorized averages** cap returns at ±200% before averaging, providing a more robust measure of central tendency. Compare "Avg Return %" (raw) vs "Winsorized Avg %" in the tables above.

---

## Data Quality Notes

- Banking stocks excluded: 357 (sectors: Finance, Banks)
- Stocks skipped due to insufficient data: 954
- Valuation N/A (composite NaN): 0
- Stocks successfully scored and analyzed: 3396
