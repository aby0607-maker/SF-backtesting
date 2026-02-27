# Sector Rank Deviation Analysis — Score Rank vs Return Rank

> Within each sector, if our V4 scoring works, stocks scored highest should also have the highest returns.
> This report measures how closely score-based rankings match return-based rankings.

## 1. Executive Summary

Analysis covers **71 sectors** with ≥5 stocks (3369 stocks total). 11 tiny sectors (<5 stocks, 27 stocks) excluded from aggregates.

| Bucket | Count | % of Total |
|--------|------:|----------:|
| **Exact Match** (rank identical) | 63 | 1.87% |
| **Within 10%** deviation | 622 | 18.46% |
| **Within 25%** deviation | 858 | 25.47% |
| **Rest** (>25% off) | 1826 | 54.20% |
| **Cumulative ≤25%** | 1543 | 45.80% |

## 2. Aggregate by Sector Size

| Size Group | Sectors | Stocks | Exact % | ≤10% | ≤25% | >25% | Avg Dev % |
|------------|--------:|-------:|--------:|-----:|-----:|-----:|----------:|
| Large (50+) | 22 | 2529 | 0.75% | 19.81% | 44.96% | 55.04% | 32.6% |
| Medium (10–49) | 31 | 709 | 3.95% | 23.70% | 48.94% | 51.06% | 30.8% |
| Small (5–9) | 18 | 131 | 12.21% | 12.21% | 45.04% | 54.96% | 31.7% |

## 3. Top 15 Sectors by Rank Alignment

Sectors where score ranking most closely matches return ranking (sorted by cumulative ≤25% deviation %, then Spearman correlation).

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Fertilizers | 17 | 23.53% | 35.29% | 23.53% | 17.65% | **82.35%** | 11.07% | 0.855 |
| 2 | Printing & Stationery | 12 | 25% | 25% | 25% | 25% | **75%** | 20.83% | 0.490 |
| 3 | Automobile | 19 | 5.26% | 31.58% | 36.84% | 26.32% | **73.68%** | 24.38% | 0.256 |
| 4 | Paints/Varnish | 7 | 14.29% | 0% | 57.14% | 28.57% | **71.43%** | 24.49% | 0.321 |
| 5 | Refineries | 7 | 14.29% | 0% | 57.14% | 28.57% | **71.43%** | 24.49% | 0.321 |
| 6 | Ship Building | 6 | 16.67% | 0% | 50% | 33.33% | **66.67%** | 27.78% | 0.200 |
| 7 | Alcoholic Beverages | 20 | 0% | 35% | 30% | 35% | **65%** | 24% | 0.484 |
| 8 | Power Generation & Distribution | 32 | 6.25% | 28.13% | 28.13% | 37.5% | **62.5%** | 22.66% | 0.476 |
| 9 | Ferro Alloys | 8 | 12.5% | 0% | 50% | 37.5% | **62.5%** | 34.38% | -0.071 |
| 10 | Capital Goods - Electrical Equipment | 57 | 0% | 26.32% | 33.33% | 40.35% | **59.65%** | 26.41% | 0.293 |
| 11 | Non Ferrous Metals | 27 | 0% | 11.11% | 48.15% | 40.74% | **59.26%** | 29.63% | 0.159 |
| 12 | Cables | 17 | 5.88% | 17.65% | 35.29% | 41.18% | **58.82%** | 29.07% | 0.115 |
| 13 | Entertainment | 60 | 0% | 21.67% | 36.67% | 41.67% | **58.33%** | 30% | 0.072 |
| 14 | Plywood Boards/Laminates | 12 | 0% | 50% | 8.33% | 41.67% | **58.33%** | 29.86% | -0.115 |
| 15 | Gas Distribution | 7 | 14.29% | 0% | 42.86% | 42.86% | **57.14%** | 24.49% | 0.464 |

## 4. Bottom 15 Sectors by Rank Alignment

Sectors where score ranking diverges most from return ranking.

| # | Sector | N | Exact | ≤10% | ≤25% | >25% | Cum ≤25% | Avg Dev | Spearman |
|--:|--------|--:|------:|-----:|-----:|-----:|---------:|--------:|---------:|
| 1 | Ceramic Products | 7 | 0% | 0% | 0% | 100% | **0%** | 48.98% | -0.643 |
| 2 | IT - Hardware | 7 | 14.29% | 0% | 0% | 85.71% | **14.29%** | 32.65% | 0.214 |
| 3 | Petrochemicals | 10 | 0% | 10% | 10% | 80% | **20%** | 38% | -0.139 |
| 4 | Crude Oil & Natural Gas | 7 | 14.29% | 0% | 14.29% | 71.43% | **28.57%** | 32.65% | -0.036 |
| 5 | Cement - Products | 7 | 14.29% | 0% | 14.29% | 71.43% | **28.57%** | 32.65% | 0.143 |
| 6 | Healthcare | 58 | 5.17% | 10.34% | 17.24% | 67.24% | **32.76%** | 38.64% | -0.321 |
| 7 | Readymade Garments/ Apparells | 15 | 0% | 20% | 13.33% | 66.67% | **33.33%** | 40% | -0.346 |
| 8 | Telecom-Service | 12 | 0% | 0% | 33.33% | 66.67% | **33.33%** | 43.06% | -0.343 |
| 9 | Telecom Equipment & Infra Services | 12 | 16.67% | 8.33% | 8.33% | 66.67% | **33.33%** | 37.5% | -0.224 |
| 10 | Leather | 19 | 5.26% | 5.26% | 26.32% | 63.16% | **36.84%** | 33.24% | -0.007 |
| 11 | Capital Goods-Non Electrical Equipment | 97 | 0% | 13.4% | 23.71% | 62.89% | **37.11%** | 36.61% | -0.133 |
| 12 | Realty | 147 | 1.36% | 14.97% | 21.09% | 62.59% | **37.41%** | 35.23% | -0.125 |
| 13 | Glass & Glass Products | 8 | 0% | 0% | 37.5% | 62.5% | **37.5%** | 40.63% | -0.214 |
| 14 | E-Commerce/App based Aggregator | 21 | 4.76% | 19.05% | 14.29% | 61.9% | **38.1%** | 37.64% | -0.248 |
| 15 | Sugar | 34 | 5.88% | 17.65% | 14.71% | 61.76% | **38.24%** | 35.29% | -0.125 |

## 5. Full Sector Summary Table (≥5 stocks)

| Sector | N | Exact | Exact% | ≤10% | ≤10%% | ≤25% | ≤25%% | >25% | >25%% | Cum≤25% | AvgDev | Spearman | Size |
|--------|--:|------:|-------:|-----:|------:|-----:|------:|-----:|------:|--------:|-------:|---------:|------|
| Trading | 312 | 0 | 0% | 57 | 18.27% | 74 | 23.72% | 181 | 58.01% | 41.99% | 34.51% | -0.113 | Large |
| Textiles | 228 | 0 | 0% | 48 | 21.05% | 55 | 24.12% | 125 | 54.82% | 45.18% | 32.98% | -0.085 | Large |
| IT - Software | 192 | 0 | 0% | 33 | 17.19% | 47 | 24.48% | 112 | 58.33% | 41.67% | 34.21% | -0.097 | Large |
| Finance | 179 | 2 | 1.12% | 40 | 22.35% | 49 | 27.37% | 88 | 49.16% | 50.84% | 28.46% | 0.168 | Large |
| Pharmaceuticals | 167 | 2 | 1.2% | 28 | 16.77% | 40 | 23.95% | 97 | 58.08% | 41.92% | 33.04% | 0.032 | Large |
| Chemicals | 161 | 0 | 0% | 38 | 23.6% | 37 | 22.98% | 86 | 53.42% | 46.58% | 30.93% | 0.089 | Large |
| Realty | 147 | 2 | 1.36% | 22 | 14.97% | 31 | 21.09% | 92 | 62.59% | 37.41% | 35.23% | -0.125 | Large |
| Miscellaneous | 123 | 1 | 0.81% | 23 | 18.7% | 29 | 23.58% | 70 | 56.91% | 43.09% | 34.5% | -0.100 | Large |
| FMCG | 120 | 0 | 0% | 22 | 18.33% | 34 | 28.33% | 64 | 53.33% | 46.67% | 32.33% | 0.054 | Large |
| Steel | 99 | 3 | 3.03% | 14 | 14.14% | 21 | 21.21% | 61 | 61.62% | 38.38% | 34.45% | -0.033 | Large |
| Capital Goods-Non Electrical Equipment | 97 | 0 | 0% | 13 | 13.4% | 23 | 23.71% | 61 | 62.89% | 37.11% | 36.61% | -0.133 | Large |
| Auto Ancillaries | 96 | 1 | 1.04% | 28 | 29.17% | 25 | 26.04% | 42 | 43.75% | 56.25% | 25.46% | 0.331 | Large |
| Infrastructure Developers & Operators | 84 | 2 | 2.38% | 15 | 17.86% | 22 | 26.19% | 45 | 53.57% | 46.43% | 31.58% | 0.076 | Large |
| Packaging | 65 | 0 | 0% | 15 | 23.08% | 19 | 29.23% | 31 | 47.69% | 52.31% | 29.09% | 0.095 | Large |
| Hotels & Restaurants | 61 | 2 | 3.28% | 14 | 22.95% | 18 | 29.51% | 27 | 44.26% | 55.74% | 30.66% | 0.026 | Large |
| Entertainment | 60 | 0 | 0% | 13 | 21.67% | 22 | 36.67% | 25 | 41.67% | 58.33% | 30% | 0.072 | Large |
| Plastic products | 60 | 0 | 0% | 9 | 15% | 19 | 31.67% | 32 | 53.33% | 46.67% | 32.33% | 0.036 | Large |
| Consumer Durables | 60 | 0 | 0% | 9 | 15% | 14 | 23.33% | 37 | 61.67% | 38.33% | 34.42% | -0.054 | Large |
| Healthcare | 58 | 3 | 5.17% | 6 | 10.34% | 10 | 17.24% | 39 | 67.24% | 32.76% | 38.64% | -0.321 | Large |
| Capital Goods - Electrical Equipment | 57 | 0 | 0% | 15 | 26.32% | 19 | 33.33% | 23 | 40.35% | 59.65% | 26.41% | 0.293 | Large |
| Diamond, Gems and Jewellery | 53 | 1 | 1.89% | 11 | 20.75% | 14 | 26.42% | 27 | 50.94% | 49.06% | 30.9% | 0.109 | Large |
| Retail | 50 | 0 | 0% | 9 | 18% | 14 | 28% | 27 | 54% | 46% | 32.76% | -0.007 | Large |
| Construction | 45 | 1 | 2.22% | 7 | 15.56% | 10 | 22.22% | 27 | 60% | 40% | 35.31% | -0.117 | Medium |
| Castings, Forgings & Fastners | 41 | 0 | 0% | 7 | 17.07% | 12 | 29.27% | 22 | 53.66% | 46.34% | 31.05% | 0.155 | Medium |
| Logistics | 39 | 0 | 0% | 8 | 20.51% | 8 | 20.51% | 23 | 58.97% | 41.03% | 30.51% | 0.207 | Medium |
| Paper | 34 | 0 | 0% | 7 | 20.59% | 9 | 26.47% | 18 | 52.94% | 47.06% | 32.87% | 0.011 | Medium |
| Sugar | 34 | 2 | 5.88% | 6 | 17.65% | 5 | 14.71% | 21 | 61.76% | 38.24% | 35.29% | -0.125 | Medium |
| Stock/ Commodity Brokers | 34 | 2 | 5.88% | 4 | 11.76% | 10 | 29.41% | 18 | 52.94% | 47.06% | 33.56% | -0.039 | Medium |
| Diversified | 32 | 0 | 0% | 6 | 18.75% | 10 | 31.25% | 16 | 50% | 50% | 30.27% | 0.191 | Medium |
| Power Generation & Distribution | 32 | 2 | 6.25% | 9 | 28.13% | 9 | 28.13% | 12 | 37.5% | 62.5% | 22.66% | 0.476 | Medium |
| Plantation & Plantation Products | 31 | 1 | 3.23% | 7 | 22.58% | 5 | 16.13% | 18 | 58.06% | 41.94% | 34.55% | -0.125 | Medium |
| Cement | 30 | 0 | 0% | 9 | 30% | 8 | 26.67% | 13 | 43.33% | 56.67% | 27.22% | 0.285 | Medium |
| Non Ferrous Metals | 27 | 0 | 0% | 3 | 11.11% | 13 | 48.15% | 11 | 40.74% | 59.26% | 29.63% | 0.159 | Medium |
| Aerospace & Defence | 27 | 1 | 3.7% | 1 | 3.7% | 10 | 37.04% | 15 | 55.56% | 44.44% | 31.55% | 0.154 | Medium |
| Agro Chemicals | 24 | 2 | 8.33% | 8 | 33.33% | 1 | 4.17% | 13 | 54.17% | 45.83% | 25.69% | 0.319 | Medium |
| E-Commerce/App based Aggregator | 21 | 1 | 4.76% | 4 | 19.05% | 3 | 14.29% | 13 | 61.9% | 38.1% | 37.64% | -0.248 | Medium |
| Alcoholic Beverages | 20 | 0 | 0% | 7 | 35% | 6 | 30% | 7 | 35% | 65% | 24% | 0.484 | Medium |
| Mining & Mineral products | 20 | 1 | 5% | 4 | 20% | 5 | 25% | 10 | 50% | 50% | 32% | 0.158 | Medium |
| Automobile | 19 | 1 | 5.26% | 6 | 31.58% | 7 | 36.84% | 5 | 26.32% | 73.68% | 24.38% | 0.256 | Medium |
| Leather | 19 | 1 | 5.26% | 1 | 5.26% | 5 | 26.32% | 12 | 63.16% | 36.84% | 33.24% | -0.007 | Medium |
| Fertilizers | 17 | 4 | 23.53% | 6 | 35.29% | 4 | 23.53% | 3 | 17.65% | 82.35% | 11.07% | 0.855 | Medium |
| Education | 17 | 0 | 0% | 2 | 11.76% | 7 | 41.18% | 8 | 47.06% | 52.94% | 29.76% | 0.255 | Medium |
| Cables | 17 | 1 | 5.88% | 3 | 17.65% | 6 | 35.29% | 7 | 41.18% | 58.82% | 29.07% | 0.115 | Medium |
| Edible Oil | 17 | 1 | 5.88% | 4 | 23.53% | 3 | 17.65% | 9 | 52.94% | 47.06% | 35.29% | -0.216 | Medium |
| Media - Print/Television/Radio | 16 | 1 | 6.25% | 2 | 12.5% | 5 | 31.25% | 8 | 50% | 50% | 32.81% | 0.018 | Medium |
| Readymade Garments/ Apparells | 15 | 0 | 0% | 3 | 20% | 2 | 13.33% | 10 | 66.67% | 33.33% | 40% | -0.346 | Medium |
| Engineering | 13 | 0 | 0% | 4 | 30.77% | 3 | 23.08% | 6 | 46.15% | 53.85% | 26.04% | 0.412 | Medium |
| Telecom Equipment & Infra Services | 12 | 2 | 16.67% | 1 | 8.33% | 1 | 8.33% | 8 | 66.67% | 33.33% | 37.5% | -0.224 | Medium |
| Printing & Stationery | 12 | 3 | 25% | 3 | 25% | 3 | 25% | 3 | 25% | 75% | 20.83% | 0.490 | Medium |
| Plywood Boards/Laminates | 12 | 0 | 0% | 6 | 50% | 1 | 8.33% | 5 | 41.67% | 58.33% | 29.86% | -0.115 | Medium |
| Telecom-Service | 12 | 0 | 0% | 0 | 0% | 4 | 33.33% | 8 | 66.67% | 33.33% | 43.06% | -0.343 | Medium |
| Bearings | 10 | 1 | 10% | 1 | 10% | 3 | 30% | 5 | 50% | 50% | 30% | 0.273 | Medium |
| Petrochemicals | 10 | 0 | 0% | 1 | 10% | 1 | 10% | 8 | 80% | 20% | 38% | -0.139 | Medium |
| Electronics | 9 | 1 | 11.11% | 0 | 0% | 4 | 44.44% | 4 | 44.44% | 55.56% | 27.16% | 0.333 | Small |
| Tyres | 9 | 1 | 11.11% | 0 | 0% | 3 | 33.33% | 5 | 55.56% | 44.44% | 27.16% | 0.350 | Small |
| Shipping | 9 | 1 | 11.11% | 0 | 0% | 3 | 33.33% | 5 | 55.56% | 44.44% | 32.1% | 0.067 | Small |
| Glass & Glass Products | 8 | 0 | 0% | 0 | 0% | 3 | 37.5% | 5 | 62.5% | 37.5% | 40.63% | -0.214 | Small |
| Refractories | 8 | 0 | 0% | 0 | 0% | 4 | 50% | 4 | 50% | 50% | 28.13% | 0.452 | Small |
| Ferro Alloys | 8 | 1 | 12.5% | 0 | 0% | 4 | 50% | 3 | 37.5% | 62.5% | 34.38% | -0.071 | Small |
| Paints/Varnish | 7 | 1 | 14.29% | 0 | 0% | 4 | 57.14% | 2 | 28.57% | 71.43% | 24.49% | 0.321 | Small |
| Gas Distribution | 7 | 1 | 14.29% | 0 | 0% | 3 | 42.86% | 3 | 42.86% | 57.14% | 24.49% | 0.464 | Small |
| Refineries | 7 | 1 | 14.29% | 0 | 0% | 4 | 57.14% | 2 | 28.57% | 71.43% | 24.49% | 0.321 | Small |
| IT - Hardware | 7 | 1 | 14.29% | 0 | 0% | 0 | 0% | 6 | 85.71% | 14.29% | 32.65% | 0.214 | Small |
| Quick Service Restaurant | 7 | 2 | 28.57% | 0 | 0% | 1 | 14.29% | 4 | 57.14% | 42.86% | 32.65% | -0.179 | Small |
| Crude Oil & Natural Gas | 7 | 1 | 14.29% | 0 | 0% | 1 | 14.29% | 5 | 71.43% | 28.57% | 32.65% | -0.036 | Small |
| Ceramic Products | 7 | 0 | 0% | 0 | 0% | 0 | 0% | 7 | 100% | 0% | 48.98% | -0.643 | Small |
| Tobacco Products | 7 | 0 | 0% | 0 | 0% | 3 | 42.86% | 4 | 57.14% | 42.86% | 44.9% | -0.679 | Small |
| Cement - Products | 7 | 1 | 14.29% | 0 | 0% | 1 | 14.29% | 5 | 71.43% | 28.57% | 32.65% | 0.143 | Small |
| Ship Building | 6 | 1 | 16.67% | 0 | 0% | 3 | 50% | 2 | 33.33% | 66.67% | 27.78% | 0.200 | Small |
| Computer Education | 6 | 2 | 33.33% | 0 | 0% | 1 | 16.67% | 3 | 50% | 50% | 22.22% | 0.486 | Small |
| Infrastructure Investment Trusts | 5 | 1 | 20% | 0 | 0% | 1 | 20% | 3 | 60% | 40% | 32% | 0.100 | Small |

## 6. Detailed Deep-Dives — Top 5 Largest Sectors

### Trading (312 stocks)

Spearman correlation: **-0.113** | Avg deviation: **34.51%** | Cumulative ≤25%: **41.99%**

| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |
|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|
| 1 | Halder Venture Ltd | 80.4 | 4.58% | 82 | 81 | 25.96% | Rest |
| 2 | Eyantra Ventures Ltd | 78.51 | -1.01% | 91 | 89 | 28.53% | Rest |
| 3 | Adani Enterprises Ltd | 76.51 | -2.97% | 95 | 92 | 29.49% | Rest |
| 4 | Times Green Energy India Ltd | 76.34 | 16.77% | 67 | 63 | 20.19% | Within 25% |
| 5 | Khemani Distributors & Marketing... | 75.9 | 49.19% | 43 | 38 | 12.18% | Within 25% |
| 6 | Redington Ltd | 75.52 | 16.21% | 70 | 64 | 20.51% | Within 25% |
| 7 | Reetech International Ltd | 73.86 | -31.93% | 168 | 161 | 51.6% | Rest |
| 8 | Parshva Enterprises Ltd | 73.37 | 16.43% | 68 | 60 | 19.23% | Within 25% |
| 9 | Safa Systems & Technologies Ltd | 72.56 | 21.77% | 62 | 53 | 16.99% | Within 25% |
| 10 | Simplex Papers Ltd | 71.34 | -44.15% | 219 | 209 | 66.99% | Rest |
| 11 | Dhyaani Tradeventtures Ltd | 71.13 | -49.23% | 233 | 222 | 71.15% | Rest |
| 12 | Shine Fashions (India) Ltd | 70.38 | -48.09% | 230 | 218 | 69.87% | Rest |
| 13 | Sellwin Traders Ltd | 70.33 | 41.75% | 45 | 32 | 10.26% | Within 25% |
| 14 | Lesha Industries Ltd | 68.82 | -52.2% | 244 | 230 | 73.72% | Rest |
| 15 | Ganon Products Ltd | 67.49 | 66.82% | 37 | 22 | 7.05% | Within 10% |
| 16 | Sattva Sukun Lifecare Ltd | 67.23 | -32.41% | 169 | 153 | 49.04% | Rest |
| 17 | M K Exim (India) Ltd | 67.21 | -38.85% | 193 | 176 | 56.41% | Rest |
| 18 | Anand Rayons Ltd | 67.02 | -10.21% | 107 | 89 | 28.53% | Rest |
| 19 | Pearl Green Clubs and Resorts Ltd | 66.46 | -23.44% | 138 | 119 | 38.14% | Rest |
| 20 | Solid Stone Company Ltd | 66.45 | -21.52% | 134 | 114 | 36.54% | Rest |
| ... | *272 stocks omitted* | ... | ... | ... | ... | ... | ... |
| 279 | Nouveau Global Ventures Ltd | 34.55 | -26.87% | 146 | 133 | 42.63% | Rest |
| 280 | Innovative Ideals and Services I... | 34.5 | -46.71% | 226 | 54 | 17.31% | Within 25% |
| 281 | Mukta Agriculture Ltd | 33.78 | -50.73% | 239 | 42 | 13.46% | Within 25% |
| 282 | Kridhan Infra Ltd | 33.73 | -40.89% | 206 | 76 | 24.36% | Within 25% |
| 283 | IGC Industries Ltd | 33.67 | -81.47% | 298 | 15 | 4.81% | Within 10% |
| 284 | Sarthak Global Ltd | 33.1 | 113.59% | 25 | 259 | 83.01% | Rest |
| 284 | Pact Industries Ltd | 33.1 | 0% | 87 | 197 | 63.14% | Rest |
| 284 | Jyotirgamya Enterprises Ltd | 33.1 | 30.82% | 54 | 230 | 73.72% | Rest |
| 285 | Millennium Online Solutions (Ind... | 32.99 | -35.48% | 183 | 102 | 32.69% | Rest |
| 285 | Beeyu Overseas Ltd | 32.99 | -44.62% | 220 | 65 | 20.83% | Within 25% |
| 286 | Ahmedabad Steelcraft Ltd | 32.48 | -33.26% | 172 | 114 | 36.54% | Rest |
| 287 | Chambal Breweries & Distilleries... | 32.43 | 247.35% | 12 | 275 | 88.14% | Rest |
| 288 | Risa International Ltd | 32.12 | -55.56% | 251 | 37 | 11.86% | Within 25% |
| 289 | Skyline Ventures India Ltd | 31 | -4.04% | 98 | 191 | 61.22% | Rest |
| 289 | Shashank Traders Ltd | 31 | 27.59% | 57 | 232 | 74.36% | Rest |
| 290 | Classic Filaments Ltd | 30.66 | 45.19% | 44 | 246 | 78.85% | Rest |
| 291 | Real Eco-Energy Ltd | 30.58 | -41.33% | 210 | 81 | 25.96% | Rest |
| 292 | Ashnisha Industries Ltd | 30.38 | 1.52% | 86 | 206 | 66.03% | Rest |
| 293 | T. Spiritual World Ltd | 30.17 | -1.23% | 92 | 201 | 64.42% | Rest |
| 294 | Oriental Trimex Ltd | 28.01 | -28.31% | 154 | 140 | 44.87% | Rest |

### Textiles (228 stocks)

Spearman correlation: **-0.085** | Avg deviation: **32.98%** | Cumulative ≤25%: **45.18%**

| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |
|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|
| 1 | Shri Dinesh Mills Ltd | 85.19 | -41.24% | 163 | 162 | 71.05% | Rest |
| 2 | Vinny Overseas Ltd | 75.26 | -42.42% | 167 | 165 | 72.37% | Rest |
| 3 | Sri Ramakrishna Mills (Coimbator... | 75.05 | -40.88% | 160 | 157 | 68.86% | Rest |
| 4 | Jagjanani Textiles Ltd | 72.03 | -67.42% | 220 | 216 | 94.74% | Rest |
| 5 | Go Fashion (India) Ltd | 71.91 | -65.37% | 219 | 214 | 93.86% | Rest |
| 6 | Sunrakshakk Industries India Ltd | 67.86 | 79.12% | 14 | 8 | 3.51% | Within 10% |
| 7 | Shubham Polyspin Ltd | 66.82 | 130.21% | 10 | 3 | 1.32% | Within 10% |
| 8 | Filatex Fashions Ltd | 66.66 | -72.62% | 223 | 215 | 94.3% | Rest |
| 9 | Betex India Ltd | 66.2 | -6.03% | 55 | 46 | 20.18% | Within 25% |
| 10 | Omnitex Industries (India) Ltd | 66.18 | 134.11% | 8 | 2 | 0.88% | Within 10% |
| 11 | Tuni Textile Mills Ltd | 66.01 | -25.76% | 102 | 91 | 39.91% | Rest |
| 12 | Celebrity Fashions Ltd | 65.74 | -53.1% | 200 | 188 | 82.46% | Rest |
| 13 | Billwin Industries Ltd | 65.5 | -33.16% | 135 | 122 | 53.51% | Rest |
| 14 | Faze Three Ltd | 65.09 | 5.75% | 35 | 21 | 9.21% | Within 10% |
| 15 | Ruby Mills Ltd | 65.06 | -29.07% | 120 | 105 | 46.05% | Rest |
| 15 | York Exports Ltd | 65.06 | 22.27% | 25 | 10 | 4.39% | Within 10% |
| 16 | Swasti Vinayaka Synthetics Ltd | 64.98 | -45.2% | 176 | 160 | 70.18% | Rest |
| 17 | Rajapalayam Mills Ltd | 64.87 | -28.22% | 113 | 96 | 42.11% | Rest |
| 18 | Garware Technical Fibres Ltd | 64.55 | -24.59% | 95 | 77 | 33.77% | Rest |
| 19 | Nandan Denim Ltd | 63.71 | -45.11% | 174 | 155 | 67.98% | Rest |
| ... | *188 stocks omitted* | ... | ... | ... | ... | ... | ... |
| 199 | Oswal Yarns Ltd | 37.22 | -70.68% | 222 | 23 | 10.09% | Within 25% |
| 200 | Gravity (India) Ltd | 37.1 | 141.34% | 7 | 193 | 84.65% | Rest |
| 201 | Varvee Global Ltd | 36.21 | 23.92% | 24 | 177 | 77.63% | Rest |
| 202 | Yarn Syndicate Ltd | 35.66 | -57.37% | 209 | 7 | 3.07% | Within 10% |
| 203 | Prag Bosimi Synthetics Ltd | 35.55 | -39.27% | 153 | 50 | 21.93% | Within 25% |
| 204 | Indian Acrylics Ltd | 35.52 | -48.09% | 185 | 19 | 8.33% | Within 10% |
| 205 | Kandagiri Spinning Mills Ltd | 35.43 | 33.82% | 22 | 183 | 80.26% | Rest |
| 206 | Suryavanshi Spinning Mills Ltd | 34.8 | -17.84% | 79 | 127 | 55.7% | Rest |
| 207 | K G Denim Ltd | 34.74 | -34.33% | 137 | 70 | 30.7% | Rest |
| 208 | Dhanlaxmi Fabrics Ltd | 34.12 | -1.81% | 46 | 162 | 71.05% | Rest |
| 209 | Alka India Ltd | 33.8 | 331.85% | 2 | 207 | 90.79% | Rest |
| 210 | Alok Industries Ltd | 33.6 | -32.76% | 132 | 78 | 34.21% | Rest |
| 211 | Paras Petrofils Ltd | 33.37 | -25.25% | 99 | 112 | 49.12% | Rest |
| 212 | Advance Syntex Ltd | 33.34 | -23.22% | 91 | 121 | 53.07% | Rest |
| 213 | S K International Export Ltd | 32.2 | 98.83% | 13 | 200 | 87.72% | Rest |
| 214 | Sybly Industries Ltd | 32.09 | -74.2% | 225 | 11 | 4.82% | Within 10% |
| 215 | Digjam Ltd | 32.04 | -32.8% | 133 | 82 | 35.96% | Rest |
| 216 | Source Industries (India) Ltd | 31.6 | 53.03% | 19 | 197 | 86.4% | Rest |
| 217 | Patspin India Ltd | 30.66 | -41.66% | 165 | 52 | 22.81% | Within 25% |
| 217 | GTN Textiles Ltd | 30.66 | -17.67% | 78 | 139 | 60.96% | Rest |

### IT - Software (192 stocks)

Spearman correlation: **-0.097** | Avg deviation: **34.21%** | Cumulative ≤25%: **41.67%**

| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |
|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|
| 1 | Riddhi Corporate Services Ltd | 84.64 | -5.58% | 42 | 41 | 21.35% | Within 25% |
| 2 | Onward Technologies Ltd | 80.63 | -20.4% | 58 | 56 | 29.17% | Rest |
| 3 | Happiest Minds Technologies Ltd | 80.53 | -48.68% | 139 | 136 | 70.83% | Rest |
| 4 | Niks Technology Ltd | 80.51 | -15.59% | 49 | 45 | 23.44% | Within 25% |
| 5 | Jonjua Overseas Ltd | 80.34 | -63.33% | 172 | 167 | 86.98% | Rest |
| 6 | Athena Global Technologies Ltd | 80.23 | -24.5% | 67 | 61 | 31.77% | Rest |
| 7 | Tata Elxsi Ltd | 79.54 | -33.25% | 91 | 84 | 43.75% | Rest |
| 8 | LTIMindtree Ltd | 79.42 | -20.28% | 57 | 49 | 25.52% | Rest |
| 9 | Ram Info Ltd | 79.32 | -46.07% | 131 | 122 | 63.54% | Rest |
| 10 | Infronics Systems Ltd | 78.65 | -57.94% | 161 | 151 | 78.65% | Rest |
| 11 | Route Mobile Ltd | 77.27 | -64.52% | 175 | 164 | 85.42% | Rest |
| 12 | Mastek Ltd | 76.92 | -45.32% | 129 | 117 | 60.94% | Rest |
| 13 | Accelya Solutions India Ltd | 76.87 | -20.85% | 60 | 47 | 24.48% | Within 25% |
| 14 | L&T Technology Services Ltd | 76.46 | -30.83% | 84 | 70 | 36.46% | Rest |
| 15 | Quint Digital Ltd | 76.45 | -48.25% | 137 | 122 | 63.54% | Rest |
| 16 | Affle 3i Ltd | 76.27 | -22.88% | 65 | 49 | 25.52% | Rest |
| 17 | Xchanging Solutions Ltd | 75.57 | -42.76% | 121 | 104 | 54.17% | Rest |
| 18 | C.E. Info Systems Ltd | 75.45 | -35.32% | 99 | 81 | 42.19% | Rest |
| 19 | Latent View Analytics Ltd | 74.05 | -27.75% | 78 | 59 | 30.73% | Rest |
| 20 | R Systems International Ltd | 73.92 | -37.7% | 110 | 90 | 46.88% | Rest |
| ... | *152 stocks omitted* | ... | ... | ... | ... | ... | ... |
| 167 | Edvenswa Enterprises Ltd | 40.32 | -62.71% | 169 | 2 | 1.04% | Within 10% |
| 168 | Tera Software Ltd | 39.66 | 96.94% | 13 | 155 | 80.73% | Rest |
| 169 | Omni Axs Software Ltd | 39.48 | 36.29% | 24 | 145 | 75.52% | Rest |
| 170 | CLIO Infotech Ltd | 38.74 | 9.04% | 32 | 138 | 71.88% | Rest |
| 171 | Aurum Proptech Ltd | 38.66 | -16.67% | 50 | 121 | 63.02% | Rest |
| 172 | 3i Infotech Ltd | 38.54 | -48.37% | 138 | 34 | 17.71% | Within 25% |
| 173 | Hypersoft Technologies Ltd | 38.03 | 287.64% | 7 | 166 | 86.46% | Rest |
| 174 | COSYN Ltd | 37.91 | -51.69% | 146 | 28 | 14.58% | Within 25% |
| 175 | Ramco Systems Ltd | 37.84 | 5.67% | 34 | 141 | 73.44% | Rest |
| 176 | Capricorn Systems Global Solutio... | 37.1 | 13.06% | 30 | 146 | 76.04% | Rest |
| 177 | USG Tech Solutions Ltd | 36.29 | -64.33% | 174 | 3 | 1.56% | Within 10% |
| 178 | GTT Data Solutions Ltd | 35.73 | -33.63% | 92 | 86 | 44.79% | Rest |
| 179 | Interworld Digital Ltd | 34.82 | -48% | 136 | 43 | 22.4% | Within 25% |
| 180 | PFL Infotech Ltd | 34.3 | -20.2% | 56 | 124 | 64.58% | Rest |
| 181 | I Power Solutions India Ltd | 33.1 | 54.79% | 21 | 160 | 83.33% | Rest |
| 181 | Bharatiya Global Infomedia Ltd | 33.1 | -34.34% | 98 | 83 | 43.23% | Rest |
| 182 | Bartronics India Ltd | 32.91 | -40.77% | 118 | 64 | 33.33% | Rest |
| 183 | Spice Lounge Food Works Ltd | 30.4 | 313.36% | 6 | 177 | 92.19% | Rest |
| 183 | Mobavenue AI Tech Ltd | 30.4 | 119.82% | 9 | 174 | 90.63% | Rest |
| 184 | N2N Technologies Ltd | 29.3 | 65.22% | 19 | 165 | 85.94% | Rest |

### Finance (179 stocks)

Spearman correlation: **0.168** | Avg deviation: **28.46%** | Cumulative ≤25%: **50.84%**

| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |
|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|
| 1 | Enbee Trade & Finance Ltd | 78.41 | -72.14% | 162 | 161 | 89.94% | Rest |
| 2 | GCM Commodity & Derivatives Ltd | 70.12 | -29.7% | 87 | 85 | 47.49% | Rest |
| 3 | Inditrade Capital Ltd | 60.9 | -62.69% | 153 | 150 | 83.8% | Rest |
| 4 | Srestha Finvest Ltd | 60.2 | -67.07% | 157 | 153 | 85.47% | Rest |
| 5 | Nicco Uco Alliance Credit Ltd | 58.6 | 0% | 46 | 41 | 22.91% | Within 25% |
| 6 | MAS Financial Services Ltd | 57.29 | 25.62% | 34 | 28 | 15.64% | Within 25% |
| 7 | Jatalia Global Ventures Ltd | 57.2 | 0% | 46 | 39 | 21.79% | Within 25% |
| 7 | Kanungo Financiers Ltd | 57.2 | 50.53% | 23 | 16 | 8.94% | Within 10% |
| 8 | Satin Creditcare Network Ltd | 56.79 | 4.89% | 44 | 36 | 20.11% | Within 25% |
| 9 | India Home Loans Ltd | 56.58 | -1.08% | 48 | 39 | 21.79% | Within 25% |
| 10 | Delphi World Money Ltd | 56.51 | 4.87% | 45 | 35 | 19.55% | Within 25% |
| 11 | P. H. Capital Ltd | 55.96 | 57.39% | 21 | 10 | 5.59% | Within 10% |
| 12 | Interactive Financial Services Ltd | 55.59 | -63.24% | 156 | 144 | 80.45% | Rest |
| 13 | Blueblood Ventures Ltd | 55.3 | 0% | 46 | 33 | 18.44% | Within 25% |
| 14 | Banas Finance Ltd | 55.2 | -37.81% | 102 | 88 | 49.16% | Rest |
| 15 | Shree Salasar Investments Ltd | 55 | 1845.64% | 2 | 13 | 7.26% | Within 10% |
| 16 | Silicon Valley Infotech Ltd | 54.4 | 0% | 46 | 30 | 16.76% | Within 25% |
| 17 | McDowell Holdings Ltd | 54.26 | 0% | 46 | 29 | 16.2% | Within 25% |
| 18 | Hi-Klass Trading & Investment Ltd | 54.1 | 546.84% | 4 | 14 | 7.82% | Within 10% |
| 19 | Golkonda Aluminium Extrusions Ltd | 53.99 | -34.96% | 97 | 78 | 43.58% | Rest |
| ... | *139 stocks omitted* | ... | ... | ... | ... | ... | ... |
| 152 | Shivansh Finserve Ltd | 34.09 | 58.95% | 20 | 132 | 73.74% | Rest |
| 153 | Madhusudan Securities Ltd | 34.02 | -26.11% | 82 | 71 | 39.66% | Rest |
| 154 | Peoples Investment Ltd | 34 | -14.38% | 63 | 91 | 50.84% | Rest |
| 155 | Gajanan Securities Services Ltd | 33.95 | -62.01% | 152 | 3 | 1.68% | Within 10% |
| 156 | Maha Rashtra Apex Corporation Ltd | 33.91 | -40.34% | 106 | 50 | 27.93% | Rest |
| 157 | Palash Securities Ltd | 33.86 | -44.56% | 120 | 37 | 20.67% | Within 25% |
| 158 | Tourism Finance Corporation of I... | 33.81 | 138.28% | 10 | 148 | 82.68% | Rest |
| 159 | Innovassynth Technologies (India... | 33.78 | -23.75% | 79 | 80 | 44.69% | Rest |
| 160 | Biogen Pharmachem Industries Ltd | 33.77 | -41.88% | 110 | 50 | 27.93% | Rest |
| 161 | Sai Capital Ltd | 33.56 | -61.62% | 149 | 12 | 6.7% | Within 10% |
| 162 | Money Masters Leasing & Finance Ltd | 33.46 | -90.45% | 170 | 8 | 4.47% | Within 10% |
| 163 | R R Securities Ltd | 33.1 | -17.03% | 67 | 96 | 53.63% | Rest |
| 164 | Gujarat State Financial Corporation | 32.88 | -48.15% | 125 | 39 | 21.79% | Within 25% |
| 165 | SW Investments Ltd | 32.66 | 41.97% | 26 | 139 | 77.65% | Rest |
| 166 | Seven Hill Industries Ltd | 32.63 | -61.54% | 148 | 18 | 10.06% | Within 25% |
| 167 | IFCI Ltd | 32.15 | -4.05% | 55 | 112 | 62.57% | Rest |
| 168 | Pan India Corporation Ltd | 31.77 | -50% | 129 | 39 | 21.79% | Within 25% |
| 169 | Galactico Corporate Services Ltd | 30.86 | -47.88% | 124 | 45 | 25.14% | Rest |
| 170 | Eraaya Lifespaces Ltd | 30.75 | -79.25% | 167 | 3 | 1.68% | Within 10% |
| 171 | Jindal Leasefin Ltd | 29.42 | -2.67% | 50 | 121 | 67.6% | Rest |

### Pharmaceuticals (167 stocks)

Spearman correlation: **0.032** | Avg deviation: **33.04%** | Cumulative ≤25%: **41.92%**

| Score Rank | Stock | Score | Return% | Return Rank | Rank Diff | Dev% | Bucket |
|-----------:|-------|------:|--------:|------------:|----------:|-----:|--------|
| 1 | Fredun Pharmaceuticals Ltd | 80.46 | 123.34% | 3 | 2 | 1.2% | Within 10% |
| 2 | Natco Pharma Ltd | 78.16 | -28.69% | 95 | 93 | 55.69% | Rest |
| 3 | Dipna Pharmachem Ltd | 78.09 | 10.19% | 34 | 31 | 18.56% | Within 25% |
| 4 | Gland Pharma Ltd | 75.15 | 3.69% | 42 | 38 | 22.75% | Within 25% |
| 5 | Shree Ganesh Remedies Ltd | 74.37 | -22.89% | 83 | 78 | 46.71% | Rest |
| 6 | Indoco Remedies Ltd | 74.2 | -38.61% | 119 | 113 | 67.66% | Rest |
| 7 | Dr Reddys Laboratories Ltd | 73.52 | -3.3% | 50 | 43 | 25.75% | Rest |
| 8 | Abbott India Ltd | 73.13 | -7.2% | 65 | 57 | 34.13% | Rest |
| 9 | Vasundhara Rasayans Ltd | 69.37 | -55.98% | 151 | 142 | 85.03% | Rest |
| 10 | Cipla Ltd | 69.19 | -8.82% | 68 | 58 | 34.73% | Rest |
| 11 | Bafna Pharmaceuticals Ltd | 68.85 | 30% | 20 | 9 | 5.39% | Within 10% |
| 12 | Astal Laboratories Ltd | 67.72 | -6.01% | 60 | 48 | 28.74% | Rest |
| 13 | Denis Chem Lab Ltd | 67.53 | -57.68% | 152 | 139 | 83.23% | Rest |
| 14 | Aarti Drugs Ltd | 67.12 | -21.52% | 79 | 65 | 38.92% | Rest |
| 15 | Fabino Enterprises Ltd | 67.03 | -57.81% | 153 | 138 | 82.63% | Rest |
| 16 | Lupin Ltd | 66.81 | 5.73% | 38 | 22 | 13.17% | Within 25% |
| 17 | Procter & Gamble Health Ltd | 66.3 | -3.55% | 51 | 34 | 20.36% | Within 25% |
| 18 | J B Chemicals & Pharmaceuticals Ltd | 66.27 | 11.83% | 32 | 14 | 8.38% | Within 10% |
| 19 | Ind-Swift Laboratories Ltd | 65.6 | 35.06% | 19 | 0 | 0% | Exact |
| 20 | Trident Lifeline Ltd | 65.58 | -2.27% | 48 | 28 | 16.77% | Within 25% |
| ... | *127 stocks omitted* | ... | ... | ... | ... | ... | ... |
| 146 | Welcure Drugs & Pharmaceuticals Ltd | 41.7 | -74.62% | 165 | 19 | 11.38% | Within 25% |
| 147 | Source Natural Foods & Herbal Su... | 41.27 | -29.63% | 98 | 49 | 29.34% | Rest |
| 148 | Strides Pharma Science Ltd | 40.9 | 25.39% | 24 | 124 | 74.25% | Rest |
| 149 | Jubilant Pharmova Ltd | 40.46 | -18.6% | 77 | 72 | 43.11% | Rest |
| 150 | Bacil Pharma Ltd | 40.12 | -15.55% | 73 | 77 | 46.11% | Rest |
| 151 | Unichem Laboratories Ltd | 39.77 | -50.28% | 146 | 5 | 2.99% | Within 10% |
| 152 | Kimia Biosciences Ltd | 39.54 | -28.57% | 94 | 58 | 34.73% | Rest |
| 153 | Hindustan Bio Sciences Ltd | 39.46 | -22.6% | 81 | 72 | 43.11% | Rest |
| 154 | SMS Pharmaceuticals Ltd | 39.04 | 62% | 12 | 142 | 85.03% | Rest |
| 155 | Pharmaids Pharmaceuticals Ltd | 38.76 | -39.45% | 122 | 33 | 19.76% | Within 25% |
| 156 | Wockhardt Ltd | 38.44 | -7.74% | 66 | 90 | 53.89% | Rest |
| 157 | Brawn Biotech Ltd | 36.63 | -17.05% | 74 | 83 | 49.7% | Rest |
| 158 | Aarey Drugs & Pharmaceuticals Ltd | 36.54 | 25.62% | 23 | 135 | 80.84% | Rest |
| 159 | Vivimed Labs Ltd | 36.33 | 57.14% | 14 | 145 | 86.83% | Rest |
| 160 | Ambalal Sarabhai Enterprises Ltd | 36.27 | -54.18% | 149 | 11 | 6.59% | Within 10% |
| 161 | Solara Active Pharma Sciences Ltd | 34.98 | -28.78% | 97 | 64 | 38.32% | Rest |
| 162 | Parmax Pharma Ltd | 34.32 | -26.49% | 88 | 74 | 44.31% | Rest |
| 163 | Ortin Global Ltd | 32.05 | -6.16% | 61 | 102 | 61.08% | Rest |
| 164 | Sun Pharma Advanced Research Com... | 31.45 | -35.11% | 106 | 58 | 34.73% | Rest |
| 165 | MPS Pharmaa Ltd | 31 | -61.54% | 157 | 8 | 4.79% | Within 10% |

## 7. Methodology

### Ranking
- **Dense ranking** used: tied values get the same rank, next distinct value gets rank + 1
- Stocks ranked independently by `overall_score` (descending) and `return_pct` (descending) within each sector

### Deviation Formula
```
rank_diff     = |score_rank - return_rank|
deviation_pct = rank_diff / N × 100   (N = total stocks in sector)
```

### Bucket Definitions
| Bucket | Condition |
|--------|-----------|
| Exact | deviation_pct = 0% |
| Within 10% | 0% < deviation_pct ≤ 10% |
| Within 25% | 10% < deviation_pct ≤ 25% |
| Rest | deviation_pct > 25% |

### Minimum Sector Size
Sectors with fewer than 5 stocks are excluded from aggregate statistics and rankings but included in the detail CSV.

### Data Source
- Input: `stock-scores-and-returns.csv` from V4 Backtest (Dec 24, 2024 → Feb 25, 2026)
- 3,396 BSE non-banking stocks across 83 sectors
