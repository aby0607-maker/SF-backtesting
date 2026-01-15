# StockFox Analysis Segments: Ownership & Stock Deals

**Purpose:** Comprehensive parameter mapping for Segments 8-9 of StockFox's 11-segment analysis framework  
**Source:** Tickertape Knowledge Base - Screener Filters  
**Document Version:** 1.0  
**Last Updated:** January 2025

---

## Executive Summary

This document maps all parameters within the **Ownership** and **Stock Deals** segments, organizing them into logical clusters with interpretation guidelines for StockFox's DFY (Done-For-You) analysis engine.

| Segment | Total Parameters | Clusters | Primary Signal |
|---------|-----------------|----------|----------------|
| **Ownership** | 18 parameters | 5 clusters | Institutional confidence & insider alignment |
| **Stock Deals** | 6 parameters | 2 clusters | Smart money activity & informed trading |

---

# Segment 8: Ownership

## Overview

The Ownership segment reveals **who holds the stock and how their positions are changing**. This is a critical signal of institutional confidence, promoter commitment, and potential future price movements.

**Key Insight for StockFox:** Ownership data answers the question: *"Who believes in this company enough to put their money where their mouth is?"*

---

## Cluster 8.1: Shareholder Base Metrics

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **No. of Shareholders** | Number of unique DEMAT accounts holding at least one share | Breadth of investor base; liquidity indicator |
| **Retail Investor Holding** | Percentage of outstanding shares held by individual retail investors | Retail sentiment; potential volatility indicator |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| High retail + Few shareholders | Concentrated retail ownership | ⚠️ Higher volatility risk; thin liquidity |
| Low retail + Many shareholders | Diversified institutional base | ✅ Stable ownership; better price discovery |
| Rising shareholder count | Growing investor interest | ✅ Building momentum signal |
| Falling shareholder count | Consolidation or exit | ⚠️ Monitor for concentration risk |

---

## Cluster 8.2: Promoter Metrics

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **Promoter Holding** | Shares held by promoters ÷ Total shares outstanding | Skin in the game; management commitment |
| **Promoter Holding Change – 3M** | Difference between current and 3-month-ago promoter % | Short-term promoter conviction |
| **Promoter Holding Change – 6M** | Difference between current and 6-month-ago promoter % | Medium-term promoter conviction |
| **Pledged Promoter Holding** | Percentage of promoter shares pledged as loan collateral | Financial stress indicator; forced selling risk |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| Promoter holding 40-75% | Optimal range | ✅ Strong alignment without excessive control |
| Promoter holding >75% | Very high | ⚠️ Limited float; potential minority shareholder risk |
| Promoter holding <25% | Very low | ⚠️ Weak management commitment |
| Promoter increasing stake (during falling prices) | Confidence signal | ✅ Long-term potential; buying at weakness |
| Promoter decreasing stake (with poor fundamentals) | Lost hope | 🔴 Red flag; exit consideration |
| Pledged shares >20% | High leverage | 🔴 Margin call risk; forced selling in volatile markets |
| Pledged shares <5% | Low/No leverage | ✅ Clean balance sheet; no forced selling risk |
| Marginal dilution to bring strategic partner | Positive endorsement | ✅ Validation from external investor |

### Special Consideration: Pledging Risk

When share price falls significantly:
1. Margin erosion occurs
2. Lender demands additional collateral or partial repayment
3. If promoter cannot comply → Lender sells shares in open market
4. Increased supply → Further price decline → Cascade effect

**StockFox Alert Trigger:** Pledged holding >15% in volatile market conditions

---

## Cluster 8.3: Domestic Institutional Investors (DII) Metrics

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **DII Holding** | Shares held by Indian institutions (MFs, insurance, pension funds) ÷ Total shares | Domestic institutional confidence |
| **DII Holding Change – 3M** | Change in DII % over 3 months | Short-term institutional sentiment shift |
| **DII Holding Change – 6M** | Change in DII % over 6 months | Medium-term institutional sentiment shift |
| **Mutual Fund Holding** | Sum of all equity MF holdings ÷ Total shares | Professional fund manager endorsement |
| **Mutual Fund Holding Change – 3M** | Change in MF % over 3 months | Active fund manager conviction shift |
| **Mutual Fund Holding Change – 6M** | Change in MF % over 6 months | Sustained fund manager conviction |
| **Insurance Firms Holding** | Percentage held by insurance companies | Conservative institutional validation (insurance = lower risk preference) |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| High DII + Rising MF holding | Strong domestic institutional support | ✅ Quality endorsement from sophisticated investors |
| DII increasing >3% in 3M | Significant accumulation | ✅ Strong buy signal from institutions |
| DII decreasing >3% in 3M | Significant distribution | ⚠️ Institutions exiting; investigate fundamentals |
| Insurance firms holding present | Conservative validation | ✅ Lower risk profile (insurance = safety-focused) |
| MF holding >15% | Strong fund presence | ✅ Analyst-vetted; research-backed holding |
| MF holding declining while stock rising | Profit booking | ⚠️ Monitor for potential reversal |

---

## Cluster 8.4: Foreign Institutional Investors (FII) Metrics

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **FII Holding** | Shares held by foreign institutions ÷ Total shares | Global investor confidence; quality benchmark |
| **FII Holding Change – 3M** | Change in FII % over 3 months | Short-term foreign sentiment |
| **FII Holding Change – 6M** | Change in FII % over 6 months | Sustained foreign interest |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| High FII (>20%) | Strong foreign interest | ✅ Global quality validation |
| FII from sovereign wealth funds | Long-term institutional backing | ✅ Premium quality signal |
| FII increasing in Indian equities | Global risk-on sentiment | ✅ Favorable macro backdrop |
| FII decreasing (global risk-off) | Capital flight | ⚠️ Context: Global factors, not necessarily company-specific |
| FII increasing while DII stable | Foreign-led rally | ⚠️ Higher volatility; currency risk |

**Note:** FII excludes Non-Resident Indian (NRI) investments per SEBI regulations.

---

## Cluster 8.5: Cumulative Activity Indicators

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **Bulk Deals – 1M Cumulative** | Cumulative bulk deal shares (1 month) as % of outstanding | Recent large transaction activity |
| **Bulk Deals – 3M Cumulative** | Cumulative bulk deal shares (3 months) as % of outstanding | Short-term smart money activity |
| **Bulk Deals – 6M Cumulative** | Cumulative bulk deal shares (6 months) as % of outstanding | Medium-term accumulation/distribution |
| **Insider Trades – 1M Cumulative** | Cumulative insider trades (1 month) as % of outstanding | Very recent insider activity |
| **Insider Trades – 3M Cumulative** | Cumulative insider trades (3 months) as % of outstanding | Short-term insider conviction |
| **Insider Trades – 6M Cumulative** | Cumulative insider trades (6 months) as % of outstanding | Medium-term insider trend |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| High bulk deal activity (buying) | Institutional accumulation | ✅ Smart money building position |
| High bulk deal activity (selling) | Institutional distribution | ⚠️ Smart money exiting |
| Insider buying (especially at market purchases) | Management conviction | ✅ Strong buy signal |
| Insider selling | Context-dependent | ⚠️ Check if systematic (planned) vs opportunistic |
| Bulk + Insider buying together | Convergent signal | ✅✅ Very strong conviction signal |

---

## Ownership Segment: Master Summary Table

| Cluster | Parameters | Key Question Answered | StockFox Weight |
|---------|------------|----------------------|-----------------|
| **Shareholder Base** | 2 | Who owns this stock? | 10% |
| **Promoter Metrics** | 4 | Does management have skin in the game? | 30% |
| **DII Metrics** | 7 | Do Indian institutions believe in this? | 25% |
| **FII Metrics** | 3 | Do global investors validate this? | 20% |
| **Activity Indicators** | 6 | What are informed investors doing NOW? | 15% |

---

# Segment 9: Stock Deals

## Overview

The Stock Deals segment tracks **large, disclosed transactions that signal institutional and insider intent**. These are SEBI-mandated disclosures that reveal what informed investors are actually doing with their money.

**Key Insight for StockFox:** Stock deals answer the question: *"What are the most informed investors actually buying or selling?"*

---

## Cluster 9.1: Insider Trading Activity

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **Insider Trades** | Buy/sell transactions by directors, management, employees, or anyone with material non-public information | Insider conviction about company's future |

### Types of Insider Trading

| Type | Description | Legality |
|------|-------------|----------|
| **Legal** | Insider buys/sells within company policy and SEBI regulations; disclosed to exchange | ✅ Permitted |
| **Illegal** | Trading on unpublished price-sensitive information (UPSI) for personal gain | 🔴 Prohibited |

### Legal Insider Trade Examples
- CEO buys 2,000 shares of own company (reported to SEBI)
- Employee exercises stock options and buys 500 shares
- Director purchases shares at market price (disclosed)

### SEBI Regulation (January 2019)
- Promoters held responsible for insider trading violations if they possess UPSI without legitimate purpose
- "Legitimate purpose" includes sharing with partners, lenders, advisors in ordinary course of business

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| Multiple insiders buying | Collective confidence | ✅✅ Very strong buy signal |
| CEO/CFO buying personally | Top management conviction | ✅ Strong signal |
| Large cluster of insider buying at depressed prices | Undervaluation signal | ✅ Potential buying opportunity |
| Insiders selling systematically (pre-planned) | Diversification, not negative | ⚠️ Neutral; context matters |
| Sudden insider selling (unplanned) | Potential concern | 🔴 Investigate further |
| No insider activity | Neutral | ⚪ No signal either way |

**StockFox Special Logic:** Large companies may have hundreds of insiders; pattern recognition is more valuable than individual trades.

---

## Cluster 9.2: Bulk & Block Deals

| Parameter | Definition | What It Signals |
|-----------|------------|-----------------|
| **Bulk Deals** | Trade where quantity >0.5% of shares outstanding; executed through normal trading window | Large institutional activity; smart money movement |
| **Block Deals** | Trade ≥5 lakh shares OR ≥₹5 crore value; executed in special 35-minute window | Very large pre-negotiated transactions |

### Key Differences

| Aspect | Bulk Deal | Block Deal |
|--------|-----------|------------|
| **Threshold** | >0.5% of outstanding shares | ≥5 lakh shares OR ≥₹5 Cr value |
| **Trading Window** | Normal trading hours | Special 35-minute morning window |
| **Price Range** | Market-driven | +1% to -1% of previous close or CMP |
| **Visibility** | Visible to all traders | Not visible in normal trading window |
| **Disclosure** | End of day if multiple trades; immediate if single trade | Same day after market hours |

### Interpretation Framework

| Scenario | Signal | StockFox Verdict Logic |
|----------|--------|------------------------|
| Bulk buy by FII/DII | Institutional accumulation | ✅ Smart money entering |
| Block deal buy by strategic investor | Long-term commitment | ✅ Anchor investor building stake |
| Bulk sell by promoter | Context-critical | ⚠️ Check if for strategic partner or distress |
| Multiple bulk buys in short period | Aggressive accumulation | ✅✅ Strong institutional interest |
| Block deal at premium to market | Willing to pay more | ✅ Buyer sees value |
| Block deal at discount to market | Negotiated exit | ⚠️ Investigate seller motivation |
| Bulk deal volume spike | Sudden institutional interest | ✅ Potential catalyst discovery |

### SEBI Disclosure Requirements

**Bulk Deals:**
- Single trade: Broker notifies exchange immediately
- Multiple trades: Broker notifies exchange within 1 hour of market close

**Block Deals:**
- Exchange discloses to public same day after market hours
- Information includes: scrip name, client name, shares traded, price

---

## Stock Deals Segment: Master Summary Table

| Cluster | Parameters | Key Question Answered | StockFox Weight |
|---------|------------|----------------------|-----------------|
| **Insider Trading** | Insider Trades (1M, 3M, 6M cumulative) | What do insiders know that we don't? | 40% |
| **Bulk & Block Deals** | Bulk Deals, Block Deals (1M, 3M, 6M cumulative) | What are large institutions doing? | 60% |

---

# Combined Analysis: Ownership + Stock Deals

## Integration Logic for StockFox

When both segments show convergent signals, conviction increases significantly:

### Bullish Convergence Patterns

| Ownership Signal | Stock Deals Signal | Combined Interpretation | Confidence |
|-----------------|-------------------|------------------------|------------|
| Promoter increasing stake | Bulk buying by MFs | Strong alignment across stakeholders | 🟢 Very High |
| FII increasing + DII stable | Block deal buy at premium | Global + domestic validation | 🟢 Very High |
| Low pledged shares | Insider buying | Clean capital structure + management conviction | 🟢 High |
| MF accumulation | No major insider selling | Professional managers bullish, insiders not exiting | 🟢 High |

### Bearish Convergence Patterns

| Ownership Signal | Stock Deals Signal | Combined Interpretation | Confidence |
|-----------------|-------------------|------------------------|------------|
| Promoter decreasing stake | Bulk selling by institutions | Aligned exit by informed investors | 🔴 Very High |
| High pledged shares | Insider selling | Financial stress + insider exit | 🔴 Very High |
| FII + DII both decreasing | Block deal sells at discount | Institutional consensus exit | 🔴 High |
| Rising retail % | Bulk selling by FII | Smart money exiting to retail | 🔴 High |

### Divergent Patterns (Require Investigation)

| Ownership Signal | Stock Deals Signal | What to Investigate |
|-----------------|-------------------|---------------------|
| FII buying | DII selling | Global vs domestic view divergence |
| Promoter buying | Bulk sells by MF | Short-term vs long-term thesis difference |
| Insider buying | Bulk institutional selling | Timing difference; check fundamentals |

---

# Appendix: Parameter Quick Reference

## Segment 8: Ownership - All 18 Parameters

| # | Parameter | Cluster | Type |
|---|-----------|---------|------|
| 1 | No. of Shareholders | Shareholder Base | Static |
| 2 | Retail Investor Holding | Shareholder Base | % |
| 3 | Promoter Holding | Promoter | % |
| 4 | Promoter Holding Change – 3M | Promoter | Change % |
| 5 | Promoter Holding Change – 6M | Promoter | Change % |
| 6 | Pledged Promoter Holding | Promoter | % |
| 7 | DII Holding | DII | % |
| 8 | DII Holding Change – 3M | DII | Change % |
| 9 | DII Holding Change – 6M | DII | Change % |
| 10 | Mutual Fund Holding | DII | % |
| 11 | Mutual Fund Holding Change – 3M | DII | Change % |
| 12 | Mutual Fund Holding Change – 6M | DII | Change % |
| 13 | Insurance Firms Holding | DII | % |
| 14 | FII Holding | FII | % |
| 15 | FII Holding Change – 3M | FII | Change % |
| 16 | FII Holding Change – 6M | FII | Change % |
| 17 | Bulk Deals Cumulative (1M, 3M, 6M) | Activity | % of Outstanding |
| 18 | Insider Trades Cumulative (1M, 3M, 6M) | Activity | % of Outstanding |

## Segment 9: Stock Deals - All 6 Parameters

| # | Parameter | Cluster | Type |
|---|-----------|---------|------|
| 1 | Insider Trades – 1M Cumulative | Insider Activity | % of Outstanding |
| 2 | Insider Trades – 3M Cumulative | Insider Activity | % of Outstanding |
| 3 | Insider Trades – 6M Cumulative | Insider Activity | % of Outstanding |
| 4 | Bulk Deals – 1M Cumulative | Bulk/Block | % of Outstanding |
| 5 | Bulk Deals – 3M Cumulative | Bulk/Block | % of Outstanding |
| 6 | Bulk Deals – 6M Cumulative | Bulk/Block | % of Outstanding |

---

# StockFox Integration Notes

## Red Flag Triggers (Automatic Alerts)

| Trigger | Threshold | Alert Level |
|---------|-----------|-------------|
| Pledged shares spike | >15% or increase >5% in 3M | 🔴 High |
| Promoter stake drop | >5% in 3M | 🔴 High |
| DII + FII both decreasing | >3% each in 3M | 🔴 High |
| Bulk sell by top holder | >2% of outstanding | ⚠️ Medium |
| Insider selling cluster | Multiple insiders in 1M | ⚠️ Medium |

## Positive Signal Triggers (Opportunity Alerts)

| Trigger | Threshold | Signal Level |
|---------|-----------|--------------|
| Promoter buying at market | Any meaningful purchase | 🟢 High |
| MF holding increase | >3% in 3M | 🟢 High |
| FII fresh entry | 0 to >2% in 3M | 🟢 High |
| Bulk buy at premium | Premium to 52W high | 🟢 High |
| Insider cluster buying | Multiple insiders in 1M | 🟢 Very High |

---

**Document End**

*This parameter mapping serves as the foundation for StockFox's DFY interpretation engine for Segments 8-9. The clustering logic and interpretation frameworks should be validated with Vishal's institutional methodology before production implementation.*
