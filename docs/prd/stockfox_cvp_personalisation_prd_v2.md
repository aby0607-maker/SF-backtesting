# StockFox MLP Prototype - CVP & Personalisation Cluster PRD

**Version:** 2.0  
**Date:** January 15, 2025  
**Status:** Ready for Development  
**Scope:** Core Value Proposition (CVP) + Personalisation Engine Clusters  
**Build Approach:** Vibe-coded Web App using Claude Code

---

## Document Purpose

This PRD specifies the **Core Value Proposition (CVP)** and **Personalisation Engine** feature clusters for the StockFox MLP prototype. It addresses gaps identified in V1.0, specifically:

| Gap Identified | Feature ID | Score | Resolution in This Doc |
|----------------|------------|-------|------------------------|
| Quick vs Full Analysis modes not explicit | A13/A14 | - | Section 6.1 - Analysis Mode Framework |
| Thesis-Breaking Alerts missing | F6 | 23 | Section 7.3 - Alert Specifications |
| Highlight-to-Note weak spec | E4 | 21 | Section 8.4 - Journal Features |
| Position Sizing Guidance missing from verdict | B10 | 20 | Section 6.3.9 - Position Sizing |
| Peer Rank Change Alerts missing | F3 | 22 | Section 7.2 - Alert Types |
| Personalized Backtest Results only entry point | H3 | 22 | Section 9 - Validation Entry Points |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [CVP Cluster Overview](#2-cvp-cluster-overview)
3. [Personalisation Cluster Overview](#3-personalisation-cluster-overview)
4. [Demo User Profiles](#4-demo-user-profiles)
5. [Demo Stocks & Verdicts](#5-demo-stocks--verdicts)
6. [CVP Feature Specifications (A1-A14)](#6-cvp-feature-specifications-a1-a14)
7. [Alert Features (F1-F6)](#7-alert-features-f1-f6)
8. [Journal & Learning Integration (E1-E9)](#8-journal--learning-integration-e1-e9)
9. [Validation Entry Points (H1-H5)](#9-validation-entry-points-h1-h5)
10. [Personalisation Feature Specifications (B1-B12)](#10-personalisation-feature-specifications-b1-b12)
11. [Screen Requirements](#11-screen-requirements)
12. [Mock Data Requirements](#12-mock-data-requirements)
13. [Acceptance Criteria](#13-acceptance-criteria)

---

## 1. Executive Summary

### Purpose
Build a functional web prototype demonstrating StockFox's unique value proposition: **comprehensive, transparent, personalized stock analysis that builds confident investors**.

### Key Demo Moments (Updated)

| # | Demo Moment | What to Show | Why It Matters |
|---|-------------|--------------|----------------|
| 1 | **Quick Scan to Full Dive** | 2-second Quick Analysis → Full 11-segment deep dive | Shows speed + depth combination |
| 2 | **Same Stock, Different Verdict** | Eternal shows 7.2/10 BUY for Growth vs 4.1/10 AVOID for Value | Proves personalization |
| 3 | **Transparent AI with Citations** | Every claim → source drill-down → primary document | Builds trust through verification |
| 4 | **Position Sizing in Verdict** | "Allocate 8-10% based on your risk profile" | Complete actionable guidance |
| 5 | **Thesis-Breaking Alert** | "⚠️ Zomato's loss trajectory reversed - review thesis" | Personalized monitoring |
| 6 | **Pattern Detection + Blind Spots** | "You favor ROE >15% stocks" + "Missed debt 3/5 times" | Education through practice |

### Success Metrics

- Investor understands differentiation in <5 minutes
- Profile switch shows instant verdict change (no reload)
- Can navigate: Quick Analysis → Full Analysis → Segment → Metric → Citation
- Journal shows 6-month simulated history with patterns
- Alert center shows thesis-breaking and peer rank change examples

---

## 2. CVP Cluster Overview

### Feature Map (14 Features)

| ID | Feature | Priority | Strategic Score | Phase |
|----|---------|----------|-----------------|-------|
| A1 | 11-Segment DFY Analysis | P0 | - | 1 |
| A2 | 200+ Metrics Coverage | P0 | - | 1 |
| A3 | 3-Layer Scoring Architecture | P0 | - | 1 |
| A4 | Overall Score + Verdict | P0 | 21 | 1 |
| A5 | Peer Ranking System | P0 | - | 1 |
| A6 | Sector-Relative Interpretation | P0 | 21 | 1 |
| A7 | Historical Trajectory (5Y) | P1 | - | 1 |
| A8 | Evidence Citations (94%) | P0 | - | 1 |
| A9 | 3-Level Evidence Drill-Down | P0 | - | 1 |
| A10 | Real-Time Data Integration | P2 | - | Mock |
| A11 | Red Flag Identification | P0 | 21 | 1 |
| A12 | Stock Comparison (MTM) | P1 | - | 1 |
| **A13** | **Quick Analysis Mode** | **P0** | **NEW** | **1** |
| **A14** | **Full Analysis Mode** | **P0** | **NEW** | **1** |

### Key Addition: Analysis Mode Framework (A13/A14)

The prototype must explicitly demonstrate **two distinct analysis modes** as part of the user journey:

```
┌─────────────────────────────────────────────────────────────────┐
│                   ANALYSIS MODE FRAMEWORK                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  QUICK ANALYSIS (A13)              FULL ANALYSIS (A14)          │
│  ─────────────────                 ────────────────             │
│  Purpose: Rapid validation         Purpose: Deep conviction     │
│  Time: 2-3 minutes                 Time: 10-15 minutes          │
│  Content:                          Content:                     │
│  • Overall Score + Verdict         • All 11 segments expanded   │
│  • Top 3 Positive Signals          • 200+ metrics accessible    │
│  • Top 3 Red Flags                 • Full citation drill-down   │
│  • Peer Rank position              • Historical trends          │
│  • Portfolio Fit indicator         • Position sizing guidance   │
│                                                                  │
│  User Journey:                                                  │
│  Search → Quick Analysis → [Decide: Deep Dive or Move On]      │
│                 ↓                                                │
│            Full Analysis → Segment → Metric → Citation          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Personalisation Cluster Overview

### Feature Map (12 Features)

| ID | Feature | Priority | Strategic Score | Phase |
|----|---------|----------|-----------------|-------|
| B1 | 6-Dimensional Personalization Engine | P0 | - | 1-2 |
| B2 | Investment Thesis Profiles | P0 | - | 1 |
| B3 | Risk Tolerance Calibration | P0 | - | 2 |
| B4 | Time Horizon Alignment | P0 | - | 1 |
| B5 | Experience Level Adaptation | P0 | - | 1 |
| B6 | Sector Preference Filtering | P1 | - | 2 |
| B7 | Portfolio Context Awareness | P0 | 21 | 2 |
| B8 | Same Stock, Different Verdicts | P0 | - | 1 |
| B9 | Adaptive Complexity Explainers | P0 | - | 1 |
| **B10** | **Learning Pattern Recognition** | **P0** | **21** | **2** |
| **B11** | **Position Sizing Recommendations** | **P0** | **20** | **1** |
| **B12** | **Entry/Exit Timing Guidance** | **P1** | **-** | **2** |

### Critical Gap Addressed: Position Sizing in Verdict Output

The V1 PRD mentioned position sizing but did not integrate it into the verdict output. **This version makes it explicit.**

---

## 4. Demo User Profiles

### Profile A: Analytical Ankit (Efficiency Seeker)

```yaml
name: "Analytical Ankit"
tagline: "I want to make smart decisions fast."
investment_thesis: "Growth"
risk_tolerance: "Moderate (25-30% volatility acceptable)"
time_horizon: "3-5 years"
experience_level: "Intermediate"
sector_preferences: "No exclusions"

simulated_portfolio:
  holdings:
    - stock: "TCS"
      allocation: 20%
      purchased: "4 months ago"
      entry_price: 3650
    - stock: "Axis Bank"
      allocation: 25%
      purchased: "2 months ago"
      entry_price: 1020
    - stock: "Infosys"
      allocation: 15%
      purchased: "5 months ago"
      entry_price: 1480
    - stock: "HDFC Bank"
      allocation: 20%
      purchased: "3 months ago"
      entry_price: 1620
  cash: 20%
  concentration_warning: "45% in Banking sector"

patterns_detected:
  primary: "You favor profitable growers with ROE >15%"
  secondary: "Prefer large-cap stability"
  
blind_spots:
  missed: "Debt analysis (checked 2/5 analyses)"
  strong: "Profitability (5/5), Growth (5/5)"
  
skill_level: 
  level: 4
  title: "Confident Analyst"
  progress_to_next: 65%
```

### Profile B: Skeptical Sneha (Control Freak)

```yaml
name: "Skeptical Sneha"
tagline: "Show me the evidence. I verify everything."
investment_thesis: "Value"
risk_tolerance: "Conservative (<20% volatility preferred)"
time_horizon: "5+ years"
experience_level: "Advanced"
sector_preferences: "Excludes: Tobacco, Gambling"

simulated_portfolio:
  holdings:
    - stock: "HDFC Bank"
      allocation: 30%
      purchased: "6 months ago"
      entry_price: 1550
    - stock: "ITC"
      allocation: 20%
      purchased: "5 months ago"
      entry_price: 420
    - stock: "TCS"
      allocation: 25%
      purchased: "4 months ago"
      entry_price: 3600
    - stock: "SBI"
      allocation: 15%
      purchased: "3 months ago"
      entry_price: 580
  cash: 10%
  concentration_warning: "None - well diversified"

patterns_detected:
  primary: "You favor dividend-paying blue chips with low P/E"
  secondary: "Strong preference for established businesses"
  
blind_spots:
  missed: "Technical analysis (checked 1/5 analyses)"
  strong: "Valuation (5/5), Debt Analysis (5/5)"
  
skill_level:
  level: 6
  title: "Expert Analyst"
  progress_to_next: 40%
```

### Profile C: Curious Kavya (Aspiring Learner)

```yaml
name: "Curious Kavya"
tagline: "Help me understand why, not just what."
investment_thesis: "Agnostic/Learning"
risk_tolerance: "Moderate (still calibrating)"
time_horizon: "3-5 years"
experience_level: "Beginner"
sector_preferences: "Open to all"

simulated_portfolio:
  holdings:
    - stock: "Reliance"
      allocation: 35%
      purchased: "2 months ago"
      entry_price: 2400
    - stock: "Tata Motors"
      allocation: 30%
      purchased: "1 month ago"
      entry_price: 780
    - stock: "HDFC Bank"
      allocation: 25%
      purchased: "3 months ago"
      entry_price: 1580
  cash: 10%
  concentration_warning: "35% in single stock (Reliance)"

patterns_detected:
  primary: "You're building a diversified portfolio - keep learning!"
  secondary: "Drawn to household brand names"
  
blind_spots:
  missed: "F&O analysis (never explored)"
  strong: "Profitability (3/3), easy to understand metrics"
  suggestion: "Great on understanding profitability, explore valuation metrics next"
  
skill_level:
  level: 3
  title: "Growing Analyst"
  progress_to_next: 60%
```

---

## 5. Demo Stocks & Verdicts

### Stock 1: Eternal (Zomato) - New Economy Growth Stock

**Selection Rationale:** Polarizing, demonstrates how different investment philosophies reach different conclusions.

#### Base Metrics (Objective Data)

| Segment | Score | Key Metrics |
|---------|-------|-------------|
| Profitability | 4.2/10 | ROE: -12.4%, Net Margin: -8.2%, EBITDA: -4% |
| Growth | 9.1/10 | Revenue CAGR: 65%, GMV Growth: 45% |
| Valuation | 3.5/10 | P/S: 8.2x (vs sector 3.5x), No P/E (loss-making) |
| Financial Health | 6.8/10 | Cash: ₹12,000 Cr, Debt: ₹0, Current Ratio: 3.2x |
| Technical | 5.5/10 | RSI: 52, Above 50-day MA, Below 200-day MA |
| Ownership | 7.2/10 | Promoter: 0% (founder-led), FII: 45%, DII: 18% |
| Broker Ratings | 6.5/10 | 12 Buy, 8 Hold, 3 Sell, Avg Target: ₹295 |

#### Personalized Verdicts (Critical Demo Element)

**Profile A - Ankit (Growth Investor):**
```yaml
overall_score: 7.2
verdict: "BUY"
verdict_color: "green"

summary: |
  Strong growth justifies premium valuation for your 3-5 year horizon. 
  Loss trajectory is improving (-45% → -8%), with path to profitability by H2 FY26.

position_sizing:  # NEW - GAP ADDRESSED
  recommended_allocation: "8-10%"
  reasoning: |
    - Your moderate risk tolerance accepts this volatility (35% historical)
    - Current portfolio: 0% in Food Tech - good diversification add
    - Suggestion: Start with 5%, add remaining on 10%+ dips
  max_allocation: "12%"
  warning: "Do not exceed 15% given loss-making status"

entry_timing:
  current_price: "₹265"
  fair_value_range: "₹240 - ₹300"
  suggestion: "Current price is in fair value zone. Moderate entry appropriate."

top_3_positives:
  - signal: "Exceptional Revenue Growth"
    detail: "65% CAGR vs sector 25%"
    why_matters: "Key for growth investors - market expansion intact"
  - signal: "Zero Debt, Strong Cash"
    detail: "₹12,000 Cr cash runway"
    why_matters: "Can sustain losses while scaling"
  - signal: "Improving Unit Economics"
    detail: "Contribution margin turned positive"
    why_matters: "Path to profitability visible"

red_flags:
  - flag: "Still Loss-Making"
    severity: "Medium"
    detail: "Net margin -8.2%, though improving"
    why_acceptable_for_you: "Growth thesis prioritizes market capture over current profits"
  - flag: "Premium Valuation"
    severity: "Low"
    detail: "P/S 8.2x vs sector 3.5x"
    why_acceptable_for_you: "Growth rate 2x+ higher justifies premium for your horizon"

peer_ranking:
  rank: 3
  category: "Food Tech & Delivery"
  total: 8
  above: ["Swiggy (if listed)", "Quick Commerce pure-plays"]
  below: ["Jubilant FoodWorks (profitable)", "Devyani International"]
```

**Profile B - Sneha (Value Investor):**
```yaml
overall_score: 4.1
verdict: "AVOID"
verdict_color: "red"

summary: |
  Unprofitable with stretched valuation. Does not meet value investing criteria.
  No margin of safety at current prices for conservative portfolios.

position_sizing:  # NEW - GAP ADDRESSED
  recommended_allocation: "0%"
  reasoning: |
    - No earnings = no P/E ratio = no traditional value metrics
    - Your conservative risk tolerance rejects 35% volatility stocks
    - Does not pay dividends - conflicts with your typical holdings
  max_allocation: "0%"
  warning: "This stock is not suitable for your investment style"

entry_timing:
  current_price: "₹265"
  fair_value_range: "Cannot calculate (loss-making)"
  suggestion: "Wait for 2 consecutive profitable quarters before consideration"

top_3_positives:
  - signal: "Zero Debt"
    detail: "Clean balance sheet"
    why_matters: "Financial flexibility, but doesn't compensate for losses"

red_flags:
  - flag: "No Earnings"
    severity: "Critical"
    detail: "Cannot apply value metrics (P/E, Earnings Yield)"
    why_problematic_for_you: "Your investment thesis requires earnings visibility"
  - flag: "Extreme Valuation Premium"
    severity: "High"
    detail: "P/S 8.2x with no profits"
    why_problematic_for_you: "No margin of safety - core value principle violated"
  - flag: "High Volatility"
    severity: "High"
    detail: "35% annual volatility"
    why_problematic_for_you: "Exceeds your <20% comfort zone significantly"

peer_ranking:
  rank: 7
  category: "Food Tech & Delivery"
  total: 8
  commentary: "Ranked low due to profitability weighting in value framework"
```

**Profile C - Kavya (Beginner/Learning):**
```yaml
overall_score: 5.8
verdict: "HOLD/LEARN"
verdict_color: "yellow"

summary: |
  This is a great learning opportunity! Zomato shows the classic trade-off between 
  growth and profitability. Study how some companies prioritize market share over 
  immediate profits.

position_sizing:  # NEW - GAP ADDRESSED
  recommended_allocation: "3-5%"
  reasoning: |
    - Small position appropriate for learning
    - Your portfolio has 0% exposure to new-economy stocks
    - Use this to understand growth investing concepts
  max_allocation: "5%"
  warning: "Keep it small while you're learning. Don't go above 5%."
  learning_note: "Track this stock for 3 months to see how growth companies behave"

entry_timing:
  current_price: "₹265"
  suggestion: |
    No rush! Consider paper trading first using our simulator to see how 
    you'd feel about the volatility.

learning_highlights:
  concept_1:
    title: "Growth vs Profitability Trade-off"
    explanation: |
      Some companies choose to grow fast and lose money now, betting they'll 
      make money later. Amazon did this for 20 years!
    why_learn: "Understanding this will help you evaluate all tech stocks"
  concept_2:
    title: "What is P/S Ratio?"
    explanation: |
      Since Zomato doesn't have profits, we can't use P/E ratio. P/S 
      (Price-to-Sales) compares stock price to revenue instead.
    why_learn: "Useful for evaluating all loss-making companies"
  concept_3:
    title: "Reading Unit Economics"
    explanation: |
      Unit economics shows if a company makes money on each order, even 
      if overall they're losing money. Zomato's unit economics are improving!
    why_learn: "Key skill for analyzing new-age companies"

peer_ranking:
  rank: 3
  category: "Food Tech & Delivery"
  total: 8
  learning_note: "Notice how the same stock has different ranks for different investors!"
```

### Stock 2: Axis Bank - Traditional Banking

*(Similar detailed structure for Axis Bank - abbreviated for document length)*

```yaml
profiles:
  ankit_growth:
    score: 6.8
    verdict: "HOLD"
    summary: "Solid but not exciting growth. Consider faster growers for new capital."
    position_sizing:
      recommended: "Current 25% is appropriate"
      action: "Hold, don't add"
  
  sneha_value:
    score: 8.2
    verdict: "BUY"
    summary: "Trading below historical P/B with improving fundamentals. Classic value play."
    position_sizing:
      recommended: "12-15%"
      action: "Add 5% on next 5% dip"
  
  kavya_beginner:
    score: 7.5
    verdict: "BUY"
    summary: "Well-balanced stock. Perfect for learning how to analyze banks."
    position_sizing:
      recommended: "8-10%"
      learning_note: "Banks are foundational - understanding them helps everywhere"
```

### Stock 3: TCS - Blue Chip Quality

*(Similar detailed structure - abbreviated for document length)*

```yaml
profiles:
  ankit_growth:
    score: 7.8
    verdict: "HOLD"
    summary: "Quality but growth slowing. Good core holding, not for fresh capital."
    position_sizing:
      recommended: "Current 20% is appropriate"
      action: "Hold, don't add"
  
  sneha_value:
    score: 8.5
    verdict: "BUY"
    summary: "Premium justified by quality. Add on market dips."
    position_sizing:
      recommended: "Can go up to 15%"
      action: "Add 3-5% on any 10%+ correction"
  
  kavya_beginner:
    score: 8.8
    verdict: "STRONG BUY"
    summary: "Perfect learning stock. Study what quality looks like."
    position_sizing:
      recommended: "10-12%"
      learning_note: "Use TCS as your benchmark for quality"
```

---

## 6. CVP Feature Specifications (A1-A14)

### 6.1 Analysis Mode Framework (A13 + A14) - NEW

**Critical Addition:** The prototype must clearly demonstrate two distinct analysis modes.

#### A13: Quick Analysis Mode

**Purpose:** Rapid 2-3 minute validation for tip verification or watchlist scanning.

**When Used:**
- User receives stock tip → wants quick validation
- Scanning watchlist for interesting opportunities  
- Already familiar with stock, checking for changes

**Display Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ETERNAL (ZOMATO)                          [View Full Analysis] │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  QUICK SCAN RESULTS                                             │
│  ════════════════════                                           │
│                                                                  │
│       7.2 / 10                                                  │
│       ████████░░                                                │
│       BUY                                                       │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ✅ TOP 3 SIGNALS                                               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Exceptional Growth (9.1/10)                          │   │
│  │    Revenue growing 65% annually - best in category      │   │
│  │                                                          │   │
│  │ 2. Zero Debt (Strong Balance Sheet)                     │   │
│  │    ₹12,000 Cr cash, no borrowings                       │   │
│  │                                                          │   │
│  │ 3. Improving Unit Economics                             │   │
│  │    Path to profitability visible by H2 FY26            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ⚠️ KEY CONCERNS (2)                                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. Still Loss-Making (Medium Risk)                      │   │
│  │    Net margin -8.2%, improving from -15%                │   │
│  │                                                          │   │
│  │ 2. Premium Valuation (Low Risk for Growth)              │   │
│  │    P/S 8.2x vs sector 3.5x                              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  📊 PEER RANK: #3 of 8 Food Tech Stocks                        │
│                                                                  │
│  👤 FOR YOUR PORTFOLIO:                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✅ Fits your Growth thesis                              │   │
│  │ ✅ Within your risk tolerance (35% vol vs 30% limit)   │   │
│  │ ✅ Good diversification (0% current Food Tech)          │   │
│  │ 💡 Suggested allocation: 8-10%                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  [🔍 Deep Dive - Full Analysis] [📝 Add to Journal] [+ Watchlist]│
└─────────────────────────────────────────────────────────────────┘
```

**Mock Data Required per Stock:**
- Overall score + verdict (personalized)
- Top 3 positive signals with 1-line explanations
- Top 2-3 red flags with severity
- Peer rank
- Portfolio fit indicators (4 dimensions)
- Suggested allocation

**Interaction:**
- "Deep Dive" button → transitions to Full Analysis Mode (A14)
- "Add to Journal" → logs this quick scan with timestamp
- "+ Watchlist" → adds to watchlist with alert defaults

---

#### A14: Full Analysis Mode

**Purpose:** Complete 10-15 minute deep-dive for building conviction before capital deployment.

**When Used:**
- Building conviction for significant position
- Learning how to analyze (Beginner users)
- Quarterly review of existing holding
- Understanding why AI gave certain verdict

**Display Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ETERNAL (ZOMATO) - FULL ANALYSIS              [← Quick View]  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  VERDICT: 7.2/10 - BUY                                    │ │
│  │  ████████░░                                                │ │
│  │                                                            │ │
│  │  "Strong growth justifies premium for your 3-5yr horizon. │ │
│  │   Monitor profitability trajectory."                      │ │
│  │                                                            │ │
│  │  [For your GROWTH profile] [⚙️ Change Profile]            │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  💰 POSITION GUIDANCE                                      │ │
│  │  ─────────────────────                                    │ │
│  │  Suggested Allocation: 8-10% of portfolio                 │ │
│  │  Entry Strategy: Start 5%, add 3-5% on 10% dip           │ │
│  │  Max Position: 12% (given loss-making status)            │ │
│  │                                                            │ │
│  │  Based on: Moderate risk tolerance, 0% current Food Tech, │ │
│  │  35% stock volatility vs your 30% tolerance limit         │ │
│  │                                                            │ │
│  │  [📊 See Position Calculator]                              │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                  │
│  📊 PEER RANKING: #3 of 8 Food Tech Stocks                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 1. Jubilant FoodWorks  8.2/10  (Profitable)                ││
│  │ 2. Devyani Int'l       7.8/10  (Growing+Profitable)        ││
│  │ 3. Eternal (Zomato)    7.2/10  ← You're viewing            ││
│  │ 4. Westlife Dev        6.5/10                              ││
│  │ [See all 8 stocks →]                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  11 SEGMENT ANALYSIS                          [Expand All]      │
│  ═══════════════════                                            │
│                                                                  │
│  ▼ Profitability     4.2/10  🔴  Still loss-making, improving  │
│    ├─ ROE            -12.4%      vs Sector +8.2%  [📖] [📎]    │
│    ├─ Net Margin     -8.2%       vs Sector +6.5%  [📖] [📎]    │
│    ├─ EBITDA Margin  -4.0%       Improving from -12%  [📖]     │
│    └─ [Show 12 more metrics]                                   │
│                                                                  │
│  ▶ Growth            9.1/10  🟢  Exceptional expansion          │
│  ▶ Valuation         3.5/10  🔴  Premium pricing               │
│  ▶ Financial Health  6.8/10  🟡  Strong cash, no debt          │
│  ▶ Technical         5.5/10  🟡  Range-bound                   │
│  ▶ Broker Ratings    6.5/10  🟡  Mixed opinions                │
│  ▶ Ownership         7.2/10  🟢  Strong institutional          │
│  ▶ F&O               5.8/10  🟡  Moderate activity             │
│  ▶ Income Statement  4.5/10  🔴  Loss-making                   │
│  ▶ Balance Sheet     7.8/10  🟢  Clean and strong              │
│  ▶ Cash Flow         5.2/10  🟡  Burning cash, controlled      │
│                                                                  │
│  [📝 Log Analysis] [📤 Share] [🔔 Set Alerts] [💬 Ask AI]      │
└─────────────────────────────────────────────────────────────────┘
```

**Toggle Behavior:**
- Default view: All segments collapsed (shows summary only)
- Click segment → Expands to show key metrics
- Click metric → Shows citation + historical trend
- "Expand All" → Opens all segments
- "← Quick View" → Returns to Quick Analysis view

---

### 6.2 Segment Specifications (A1-A2)

#### Complete Segment Structure

Each of the 11 segments follows this structure:

```yaml
segment:
  name: "Profitability"
  score: 4.2
  score_band: "red"  # green (>7), yellow (5-7), red (<5)
  quick_insight: "Still loss-making, but trajectory improving"
  
  metrics:
    - name: "ROE (Return on Equity)"
      value: "-12.4%"
      sector_avg: "8.2%"
      comparison: "below"
      delta: "-20.6pp"
      trend: "improving"
      trend_5y: [-25%, -20%, -18%, -15%, -12.4%]
      tooltip_simple: "For every ₹100 invested, company loses ₹12.40"
      tooltip_advanced: "DuPont: Negative margin × 0.8x turnover × 1.2x leverage"
      citation:
        source: "Q3 FY25 Earnings Report"
        document: "BSE Filing"
        date: "2025-01-15"
        page: "12"
        exact_quote: "Return on equity stood at -12.4% for the quarter"
      
    - name: "Net Profit Margin"
      value: "-8.2%"
      # ... similar structure
      
  segment_summary:
    for_growth_investor: "Acceptable - trajectory matters more than current state"
    for_value_investor: "Unacceptable - no earnings visibility"
    for_beginner: "This is normal for growth companies - learn why"
```

#### All 11 Segments (Complete List)

| # | Segment | Metric Count | Key Metrics |
|---|---------|--------------|-------------|
| 1 | Profitability | 15 | ROE, ROA, Net Margin, EBITDA Margin, Operating Margin, Gross Margin, Cash Conversion |
| 2 | Financial Ratios | 18 | D/E, Current Ratio, Quick Ratio, Interest Coverage, Asset Turnover |
| 3 | Growth | 20 | Revenue CAGR (3Y, 5Y), EPS Growth, Book Value CAGR, Operating Profit Growth |
| 4 | Valuation | 25 | P/E, P/B, P/S, EV/EBITDA, PEG, Dividend Yield, Earnings Yield |
| 5 | Price & Volume | 18 | 1M/3M/6M/1Y Returns, Volume MA, 52W High/Low, Beta |
| 6 | Technical | 22 | RSI, MACD, EMA 20/50/200, Support/Resistance, Bollinger Bands |
| 7 | Broker Ratings | 12 | Buy/Hold/Sell counts, Average Target, Upside %, Coverage changes |
| 8 | Ownership | 20 | Promoter %, FII %, DII %, Pledge %, QoQ changes |
| 9 | F&O | 15 | OI Change, Put/Call Ratio, IV, Rollover %, Max Pain |
| 10 | Income Statement | 18 | Revenue, COGS, EBITDA, PAT, EPS, YoY/QoQ changes |
| 11 | Balance Sheet/CF | 22 | Total Assets, Debt, Cash, Working Capital, FCF, CFO |

---

### 6.3 Core CVP Features (A3-A12)

#### A3: 3-Layer Scoring Architecture

**Display:** Visual representation of how scores aggregate.

```
┌─────────────────────────────────────────────────────────────────┐
│  HOW YOUR SCORE IS CALCULATED                                   │
│  ─────────────────────────────                                  │
│                                                                  │
│  LAYER 1: 200+ Individual Metrics                               │
│     │                                                           │
│     │  Weighted by metric importance within segment             │
│     ▼                                                           │
│  LAYER 2: 11 Segment Scores                                     │
│     │                                                           │
│     │  Weighted by YOUR investment thesis:                      │
│     │  ┌────────────────────────────────────────────┐          │
│     │  │ For GROWTH thesis:                        │          │
│     │  │ • Growth: 25% weight (high)               │          │
│     │  │ • Profitability: 15% weight               │          │
│     │  │ • Valuation: 10% weight (low - accept     │          │
│     │  │   premium for growth)                     │          │
│     │  │ • Others: distributed across remaining    │          │
│     │  └────────────────────────────────────────────┘          │
│     ▼                                                           │
│  LAYER 3: Overall Score + Verdict                               │
│     │                                                           │
│     │  Adjusted for:                                            │
│     │  • Your risk tolerance                                    │
│     │  • Your time horizon                                      │
│     │  • Your portfolio context                                 │
│     ▼                                                           │
│  FINAL: 7.2/10 - BUY                                           │
│                                                                  │
│  [Show different thesis weightings]                             │
└─────────────────────────────────────────────────────────────────┘
```

---

#### A4: Overall Score + Verdict

**Verdict Scale:**

| Score Range | Verdict | Color | Action Guidance |
|-------------|---------|-------|-----------------|
| 8.5 - 10.0 | STRONG BUY | Dark Green | High conviction, can overweight |
| 7.0 - 8.4 | BUY | Green | Add to portfolio at suggested size |
| 5.5 - 6.9 | HOLD | Yellow | Existing positions: hold. New: wait |
| 4.0 - 5.4 | AVOID | Orange | Not suitable for your profile now |
| 0.0 - 3.9 | STRONG AVOID | Red | Significant risks, stay away |

**Special Verdict for Beginners:**
- HOLD/LEARN - Study opportunity, small position for learning

---

#### A5: Peer Ranking System

**Display:**

```
┌─────────────────────────────────────────────────────────────────┐
│  PEER RANKING                                                   │
│  ═════════════                                                  │
│                                                                  │
│  Axis Bank ranks #3 of 12 Private Banking Stocks                │
│  (for your VALUE investment profile)                            │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ # │ Stock         │ Score │ Key Differentiator            │ ││
│  ├───┼───────────────┼───────┼───────────────────────────────┤ ││
│  │ 1 │ HDFC Bank     │ 8.8   │ Best-in-class ROE + NIM      │ ││
│  │ 2 │ ICICI Bank    │ 8.4   │ Strong growth trajectory     │ ││
│  │ 3 │ Axis Bank     │ 8.2   │ ← You're viewing             │ ││
│  │ 4 │ Kotak Bank    │ 7.9   │ Premium valuation concern    │ ││
│  │ 5 │ IndusInd      │ 7.2   │ Asset quality questions      │ ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Compare with HDFC Bank] [See all 12 banks]                    │
│                                                                  │
│  💡 Note: Rankings change based on your investment thesis.      │
│     A growth investor might rank these differently!             │
└─────────────────────────────────────────────────────────────────┘
```

---

#### A6: Sector-Relative Interpretation

Every metric shows sector context:

```
ROE: 17.2%
├── vs Sector Avg: 14.8%  ✅ +2.4pp (Above average)
├── vs Top Quartile: 20.5%  ⚠️ Below top performers  
├── vs Your Threshold: 15%  ✅ Meets your minimum
└── 5Y Trend: Improving (CAGR +3.2%)
```

---

#### A7: Historical Trajectory

```
┌─────────────────────────────────────────────────────────────────┐
│  ROE TREND (5 Years)                                            │
│                                                                  │
│  20% ┤                                          ╱               │
│  18% ┤                                    ╱────                 │
│  16% ┤                              ╱────                       │
│  14% ┤                        ╱────                             │
│  12% ┤──────────────────╱────                                   │
│      └────┬────┬────┬────┬────┬────                             │
│          FY20 FY21 FY22 FY23 FY24                               │
│                                                                  │
│  Trend: ↑ Improving (CAGR +7.2%)                               │
│  Current: 17.2% | 5Y High: 17.2% | 5Y Low: 12.1%               │
└─────────────────────────────────────────────────────────────────┘
```

---

#### A8 + A9: Evidence Citations & 3-Level Drill-Down

**Level 1 (Default):**
```
ROE: 17.2% [Q3FY25 · BSE Filing]
```

**Level 2 (Click to expand):**
```
ROE: 17.2%
Source: Quarterly Results - Q3 FY2024-25
Document: BSE Corporate Filing
Filed: January 15, 2025
Relevance: Direct financial metric disclosure
[View Level 3 →]
```

**Level 3 (Full citation):**
```
ROE: 17.2%

Exact Source Quote:
"Return on Equity for the quarter ended December 31, 2024 
stood at 17.2% compared to 16.8% in the corresponding 
quarter of the previous year."

Document: Axis Bank Limited - Quarterly Results Q3 FY2024-25
Page: 12, Section: Key Financial Ratios
BSE Scrip Code: 532215
Filing Date: January 15, 2025

[View Original Document ↗] [Copy Citation]
```

---

#### A10: Real-Time Data Integration

**For Demo:** Mock with realistic timestamps

```
Data as of: January 15, 2025 - 3:30 PM IST
Market Status: 🟢 Open

Price: ₹1,145.50 (+1.2%)
Volume: 2.3M (vs avg 1.8M)

⟳ Data refreshes every 5 minutes during market hours
```

---

#### A11: Red Flag Identification

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ RED FLAGS DETECTED (2)                                      │
│  ═════════════════════════                                      │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ MEDIUM: Promoter Pledge Increase                         ││
│  │ ────────────────────────────────────                        ││
│  │ Current: 15% of holdings pledged (was 8% last quarter)      ││
│  │                                                              ││
│  │ Why it matters:                                              ││
│  │ High pledge means promoters have borrowed against their     ││
│  │ shares. If stock price falls, they may be forced to sell,   ││
│  │ creating more selling pressure.                             ││
│  │                                                              ││
│  │ For YOUR profile (Value Investor):                          ││
│  │ This is concerning. Pledge above 10% is a yellow flag.      ││
│  │                                                              ││
│  │ [Learn More About Promoter Pledging →]                      ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⚠️ LOW: Rising Debt Levels                                   ││
│  │ ────────────────────────────                                ││
│  │ D/E Ratio: 1.2x (was 0.8x last year)                        ││
│  │                                                              ││
│  │ Why it matters:                                              ││
│  │ Increasing leverage adds financial risk and interest burden ││
│  │                                                              ││
│  │ For YOUR profile (Value Investor):                          ││
│  │ Monitor but not critical yet. Threshold is 1.5x.           ││
│  │                                                              ││
│  │ [See Debt Analysis →]                                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

#### A12: Stock Comparison (MTM)

```
┌─────────────────────────────────────────────────────────────────┐
│  COMPARE: Axis Bank vs ICICI Bank                               │
│  ════════════════════════════════                               │
│                                                                  │
│  ┌──────────────────────┬─────────────┬─────────────┬─────────┐│
│  │ Metric               │ Axis Bank   │ ICICI Bank  │ Winner  ││
│  ├──────────────────────┼─────────────┼─────────────┼─────────┤│
│  │ Overall Score        │ 8.2/10      │ 8.4/10      │ ICICI   ││
│  │ ROE                  │ 17.2%       │ 18.5%       │ ICICI   ││
│  │ P/B Ratio            │ 1.8x        │ 2.4x        │ Axis    ││
│  │ Dividend Yield       │ 1.2%        │ 0.8%        │ Axis    ││
│  │ NIM                  │ 4.2%        │ 4.5%        │ ICICI   ││
│  │ GNPA                 │ 1.8%        │ 2.1%        │ Axis    ││
│  │ Loan Growth          │ 14%         │ 18%         │ ICICI   ││
│  └──────────────────────┴─────────────┴─────────────┴─────────┘│
│                                                                  │
│  SUMMARY FOR YOUR VALUE PROFILE:                                │
│  Axis Bank offers better value (lower P/B, higher dividend)    │
│  ICICI offers better growth (higher ROE, loan growth)          │
│                                                                  │
│  Your Verdict: Both are suitable, Axis slightly better value   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Alert Features (F1-F6)

### 7.1 Alert System Overview

The prototype must demonstrate **personalized, thesis-aware alerts** - not generic price notifications.

### 7.2 Alert Types (Including Gaps Addressed)

#### F2: Score Drop Alerts

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 SCORE DROP ALERT                                            │
│  ════════════════════                                           │
│                                                                  │
│  Axis Bank: 8.2 → 7.5 (-0.7)                                   │
│  ──────────────────────────                                     │
│                                                                  │
│  What changed:                                                  │
│  • GNPA increased: 1.8% → 2.4% (Profitability impact)          │
│  • Q3 results missed estimates by 5%                           │
│                                                                  │
│  Impact on YOUR thesis:                                         │
│  As a Value investor, GNPA increase is concerning.             │
│  Still meets your criteria, but monitor closely.               │
│                                                                  │
│  Suggested Action: HOLD (no change)                            │
│                                                                  │
│  [View Full Analysis] [Dismiss] [Set Follow-up Reminder]       │
└─────────────────────────────────────────────────────────────────┘
```

---

#### F3: Peer Rank Change Alerts - **NEW (GAP ADDRESSED)**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 PEER RANK CHANGE                                            │
│  ═══════════════════                                            │
│                                                                  │
│  TCS dropped: #2 → #5 in Large-Cap IT                          │
│  ────────────────────────────────────                          │
│                                                                  │
│  New Rankings (for your GROWTH profile):                        │
│  1. Infosys      8.4/10  (↑ from #3)                          │
│  2. HCL Tech     8.2/10  (↑ from #4)                          │
│  3. Tech M       7.9/10  (↑ from #6)                          │
│  4. Wipro        7.8/10  (unchanged)                           │
│  5. TCS          7.6/10  (↓ from #2) ← Your holding           │
│                                                                  │
│  Why TCS dropped:                                               │
│  • Revenue growth slowed to 5% (was 8%)                        │
│  • Competitors showing stronger deal wins                       │
│                                                                  │
│  For YOUR Growth thesis:                                        │
│  TCS's slower growth is pulling down its rank among peers.     │
│  Consider if growth thesis still applies.                       │
│                                                                  │
│  Suggested Action: Review position                              │
│                                                                  │
│  [Compare TCS vs Top Rankers] [View Analysis] [Dismiss]        │
└─────────────────────────────────────────────────────────────────┘
```

---

#### F4: Quarterly Earnings Alerts

```
┌─────────────────────────────────────────────────────────────────┐
│  📅 EARNINGS ALERT                                              │
│  ═════════════════                                              │
│                                                                  │
│  Axis Bank Q3 FY25 Results Released                            │
│  ─────────────────────────────────────                          │
│                                                                  │
│  Key Highlights:                                                │
│  • PAT: ₹6,071 Cr (+8% YoY) - Beat estimates                  │
│  • NIM: 4.2% (stable)                                          │
│  • GNPA: 1.83% (improved from 1.96%)                           │
│                                                                  │
│  Score Impact:                                                  │
│  Previous: 8.0/10 → Updated: 8.2/10 (+0.2)                     │
│                                                                  │
│  Your Thesis Check:                                             │
│  ✅ Value criteria still met                                    │
│  ✅ Below historical P/B (1.8x vs 2.1x avg)                     │
│  ✅ Dividend maintained                                         │
│                                                                  │
│  [View Updated Analysis] [Add to Journal]                      │
└─────────────────────────────────────────────────────────────────┘
```

---

#### F5: Portfolio Concentration Alerts

```
┌─────────────────────────────────────────────────────────────────┐
│  ⚠️ CONCENTRATION ALERT                                         │
│  ══════════════════════                                         │
│                                                                  │
│  You're 45% in Banking sector                                  │
│  ─────────────────────────────                                  │
│                                                                  │
│  Your Holdings:                                                 │
│  • Axis Bank: 25%                                              │
│  • HDFC Bank: 20%                                              │
│  • Total Banking: 45%                                          │
│                                                                  │
│  Risk Assessment:                                               │
│  For your MODERATE risk tolerance, we recommend:               │
│  • Max 35% in single sector                                    │
│  • Current: 45% (exceeds by 10%)                               │
│                                                                  │
│  Suggested Action:                                              │
│  Consider diversifying into Pharma or IT on your next          │
│  investment. See suggestions below.                            │
│                                                                  │
│  Diversification Options (matching your profile):              │
│  🏥 Sun Pharma - 8.2/10                                        │
│  💻 Infosys - 7.8/10                                           │
│  🛒 HUL - 7.5/10                                               │
│                                                                  │
│  [View Diversification Analysis] [Dismiss for 30 days]         │
└─────────────────────────────────────────────────────────────────┘
```

---

#### F6: Thesis-Breaking Alerts - **NEW (GAP ADDRESSED - HIGHEST PRIORITY)**

**Strategic Score: 23/25 - Highest scoring feature that was completely missing**

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 THESIS-BREAKING ALERT                                       │
│  ════════════════════════                                       │
│                                                                  │
│  URGENT: Zomato - Review Required                              │
│  ─────────────────────────────────                              │
│                                                                  │
│  YOUR THESIS: Growth + Path to Profitability                   │
│                                                                  │
│  ⚠️ THESIS AT RISK:                                             │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Loss trajectory REVERSED                                    ││
│  │                                                              ││
│  │ Previous quarter: Loss narrowing (-8% margin)               ││
│  │ This quarter: Loss widening (-12% margin)                   ││
│  │                                                              ││
│  │ Management cited: "Increased investment in quick commerce"  ││
│  │                                                              ││
│  │ This DIRECTLY IMPACTS your buy thesis which assumed         ││
│  │ continued improvement toward profitability.                 ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ANALYSIS:                                                      │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ What this means:                                            ││
│  │ • Profitability timeline pushed back (H2 FY26 → FY27?)     ││
│  │ • Cash burn accelerating                                    ││
│  │ • Growth vs Profit trade-off shifted                        ││
│  │                                                              ││
│  │ For YOUR Growth profile:                                    ││
│  │ This is a yellow flag, not red. Quick commerce is a        ││
│  │ growth bet. BUT - monitor if losses continue widening.     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  UPDATED VERDICT: 7.2/10 → 6.5/10 (BUY → HOLD)                │
│                                                                  │
│  OPTIONS:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [Hold - Monitor Next Quarter]                               ││
│  │    Keep position but watch for further deterioration        ││
│  │                                                              ││
│  │ [Trim - Reduce Position]                                    ││
│  │    Take some profits, reduce from 8% to 5%                  ││
│  │                                                              ││
│  │ [Exit - Sell Position]                                      ││
│  │    If you believe thesis is broken, exit entirely           ││
│  │                                                              ││
│  │ [Re-analyze - Update Thesis]                                ││
│  │    Maybe your thesis should change to "longer-term growth" ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [View Full Updated Analysis] [Log Decision to Journal]        │
└─────────────────────────────────────────────────────────────────┘
```

**Why This Alert is Critical (Score Breakdown):**

| Pillar | Score | Rationale |
|--------|-------|-----------|
| P1 Comprehensive | 4/5 | Monitors all dimensions relevant to user's thesis |
| P2 Transparent | 5/5 | Shows exactly what changed and why it matters |
| P3 Personalized | 5/5 | Triggered only for YOUR specific thesis, not generic |
| P4 Fast | 5/5 | Real-time detection of thesis-breaking events |
| P5 Educational | 4/5 | Teaches what to monitor and why |
| **Total** | **23/25** | Highest scoring alert feature |

---

### 7.3 Alert Settings Screen

```
┌─────────────────────────────────────────────────────────────────┐
│  🔔 ALERT SETTINGS                                              │
│  ════════════════                                               │
│                                                                  │
│  ALERT TYPES                              Enabled  Frequency    │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  🚨 Thesis-Breaking Events               [✓]     Immediate     │
│     Critical changes to your buy/hold thesis                    │
│                                                                  │
│  📉 Score Drop Alerts                    [✓]     > 0.5 drop    │
│     When a stock's score drops significantly                    │
│                                                                  │
│  📊 Peer Rank Changes                    [✓]     > 2 positions │
│     When stock moves significantly in peer rankings             │
│                                                                  │
│  📅 Quarterly Earnings                   [✓]     When released │
│     Results for your watchlist and holdings                     │
│                                                                  │
│  ⚖️ Portfolio Concentration              [✓]     Weekly check  │
│     When sector exposure exceeds your limits                    │
│                                                                  │
│  📰 News & Events                        [○]     Daily digest  │
│     Relevant news for your stocks                               │
│                                                                  │
│  💰 Price Alerts                         [○]     Custom        │
│     Basic price movement notifications                          │
│                                                                  │
│  [Save Preferences]                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Journal & Learning Integration (E1-E9)

### 8.1 Journal System Overview

The Analysis Journal is a **core differentiator** - it transforms StockFox from a research tool into a learning platform.

### 8.2 Journal Entry Structure (E2 - Auto-Logging)

```yaml
journal_entry:
  id: "JE-2025-01-15-001"
  timestamp: "2025-01-15 10:30 AM"
  
  stock_context:
    stock: "Eternal (Zomato)"
    ticker: "ZOMATO"
    ai_score: 7.2
    ai_verdict: "BUY"
    peer_rank: "#3 of 8 Food Tech"
  
  user_profile_at_time:
    thesis: "Growth"
    risk_tolerance: "Moderate"
    horizon: "3-5 years"
  
  analysis_depth:
    mode_used: "Full Analysis"
    time_spent: "12 minutes"
    segments_viewed:
      - name: "Profitability"
        viewed: true
        time_on_segment: "3 min"
        metrics_expanded: ["ROE", "Net Margin", "EBITDA Margin"]
      - name: "Growth"
        viewed: true
        time_on_segment: "4 min"
        metrics_expanded: ["Revenue CAGR", "GMV Growth"]
      - name: "Valuation"
        viewed: true
        time_on_segment: "2 min"
        metrics_expanded: ["P/S Ratio"]
      - name: "Technical"
        viewed: false
      # ... all 11 segments
    
    citations_clicked: 3
    ai_questions_asked: 2
  
  user_decision:
    verdict: "BUY"
    matches_ai: true
    conviction_level: 7  # 1-10 scale
    entry_price: null  # Not yet purchased
    planned_allocation: "8%"
  
  user_notes:
    - text: "Growth is strong but valuation concerns me"
      highlighted_from: null  # Typed manually
      timestamp: "10:35 AM"
    - text: "Revenue growing 65% annually - best in category"
      highlighted_from: "Growth segment, Quick Insight"
      timestamp: "10:38 AM"
  
  outcome:
    status: "pending"  # pending, profitable, loss, sold
    current_return: null
    days_held: null
```

---

### 8.3 Journal Display

```
┌─────────────────────────────────────────────────────────────────┐
│  📝 ANALYSIS JOURNAL                                            │
│  ═══════════════════                                            │
│                                                                  │
│  FILTERS: [All] [Decisions] [Notes] [Profitable] [Learning]    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  JAN 15, 2025 - 10:30 AM                                    ││
│  │  ───────────────────────                                    ││
│  │  📈 Eternal (Zomato)                                        ││
│  │                                                              ││
│  │  AI Score: 7.2/10 - BUY                                     ││
│  │  Your Decision: BUY (Matches AI) ✓                          ││
│  │  Conviction: ███████░░░ 7/10                                ││
│  │                                                              ││
│  │  Segments Explored:                                         ││
│  │  ✅ Profitability  ✅ Growth  ✅ Valuation                  ││
│  │  ⬜ Technical  ⬜ F&O  ⬜ Ownership                         ││
│  │                                                              ││
│  │  Your Notes:                                                ││
│  │  • "Growth is strong but valuation concerns me"            ││
│  │  • 📌 "Revenue growing 65% annually - best in category"    ││
│  │                                                              ││
│  │  Status: 🟡 Pending (Not yet purchased)                     ││
│  │                                                              ││
│  │  [View Full Entry] [Add Follow-up Note] [Mark as Purchased] ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  JAN 10, 2025 - 2:15 PM                                     ││
│  │  ───────────────────────                                    ││
│  │  🏦 Axis Bank                                               ││
│  │                                                              ││
│  │  AI Score: 8.2/10 - BUY                                     ││
│  │  Your Decision: BUY (Matches AI) ✓                          ││
│  │  Entry: ₹1,020 | Current: ₹1,145 | Return: +12.3% ✅       ││
│  │                                                              ││
│  │  Your Thesis: "Value play on improving NIMs"               ││
│  │                                                              ││
│  │  [View Full Entry] [Update Outcome]                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Load More Entries]                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.4 Highlight-to-Note Feature (E4) - **GAP ADDRESSED**

**Interaction Flow:**

```
USER ACTION: Long-press or select text anywhere in analysis

┌─────────────────────────────────────────────────────────────────┐
│  Selected Text:                                                 │
│  "Revenue growing 65% annually - best in category"              │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  📌 ADD TO JOURNAL                                          ││
│  │  ─────────────────────                                      ││
│  │                                                              ││
│  │  Source: Growth Segment - Quick Insight                     ││
│  │  Stock: Eternal (Zomato)                                    ││
│  │  Time: Jan 15, 2025 - 10:38 AM                             ││
│  │                                                              ││
│  │  Add your thought (optional):                               ││
│  │  ┌───────────────────────────────────────────────────────┐  ││
│  │  │ This is the key reason I'm interested...              │  ││
│  │  └───────────────────────────────────────────────────────┘  ││
│  │                                                              ││
│  │  [Save to Journal] [Cancel]                                 ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

**Saved Note Appears as:**
```
📌 Highlighted: "Revenue growing 65% annually - best in category"
   Source: Growth Segment
   Your thought: "This is the key reason I'm interested..."
   Saved: Jan 15, 2025 - 10:38 AM
```

---

### 8.5 Blind Spot Detection (E5/E7)

```
┌─────────────────────────────────────────────────────────────────┐
│  🔍 YOUR ANALYSIS PATTERNS (Last 6 Months)                      │
│  ════════════════════════════════════════                       │
│                                                                  │
│  ✅ STRENGTHS (You consistently check these):                   │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Segment             │ Check Rate │ Understanding            ││
│  ├─────────────────────┼────────────┼─────────────────────────┤││
│  │ Profitability       │ 5/5 (100%) │ Strong                   ││
│  │ Growth              │ 5/5 (100%) │ Strong                   ││
│  │ Valuation           │ 4/5 (80%)  │ Good                     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ⚠️ BLIND SPOTS (You often miss these):                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Segment             │ Check Rate │ Impact                   ││
│  ├─────────────────────┼────────────┼─────────────────────────┤││
│  │ Debt Analysis       │ 2/5 (40%)  │ Medium - Can catch      ││
│  │                     │            │ leverage risks           ││
│  │ Technical           │ 1/5 (20%)  │ Low - Entry timing      ││
│  │ F&O Data            │ 0/5 (0%)   │ Low - Advanced metric   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  💡 SUGGESTION:                                                  │
│  "On your next analysis, try checking the Financial Health     │
│   segment - it would have flagged the debt increase in         │
│   Company X that you missed last month."                       │
│                                                                  │
│  [Start Analysis with Debt Focus] [Learn About Debt Ratios]    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 8.6 Pattern Recognition (E8/B10)

```
┌─────────────────────────────────────────────────────────────────┐
│  🧠 YOUR EMERGING INVESTMENT STYLE                              │
│  ════════════════════════════════                               │
│                                                                  │
│  Based on your last 10 analyses, you consistently favor:        │
│                                                                  │
│  PRIMARY PATTERN:                                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ "Quality Growth" Investor                                   ││
│  │                                                              ││
│  │ You prioritize:                                             ││
│  │ • ROE above 15% (checked in 9/10 analyses)                 ││
│  │ • Positive revenue growth (10/10)                          ││
│  │ • Manageable debt D/E < 1 (7/10 when checked)             ││
│  │ • Large-cap stability (8/10 stocks were large-cap)         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SECONDARY PATTERNS:                                            │
│  • You're comfortable with moderate volatility (25-30%)        │
│  • You prefer household brand names                            │
│  • You avoid tobacco and gambling sectors                      │
│                                                                  │
│  MATCHES PROFILE:                                               │
│  Your detected style aligns 85% with your stated "Growth"      │
│  profile. You might actually be a "Quality Growth" investor!   │
│                                                                  │
│  [Learn About Quality Growth Investing]                         │
│  [Discover Stocks Matching Your Pattern]                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Validation Entry Points (H1-H5)

### 9.1 Validation Features Overview

The prototype shows **entry points** for validation features with **sample results** to demonstrate the concept.

### 9.2 Forward-Testing Simulator (H1) - Entry Point

```
┌─────────────────────────────────────────────────────────────────┐
│  🎮 PAPER TRADING SIMULATOR                                     │
│  ══════════════════════════                                     │
│                                                                  │
│  Test your analysis skills without risking real money!          │
│                                                                  │
│  HOW IT WORKS:                                                  │
│  1. "Buy" stocks using virtual ₹10,00,000                      │
│  2. Track performance in real market conditions                 │
│  3. Compare your decisions vs. AI recommendations               │
│  4. Learn from wins and losses                                  │
│                                                                  │
│  YOUR VIRTUAL PORTFOLIO:                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Starting Capital: ₹10,00,000                                ││
│  │ Current Value: ₹10,45,230                                   ││
│  │ Total Return: +4.5% (vs Nifty +3.2%)                       ││
│  │                                                              ││
│  │ Holdings:                                                   ││
│  │ • Axis Bank (25%) - +8.2%                                  ││
│  │ • TCS (20%) - +2.1%                                        ││
│  │ • Cash (55%) - Ready to deploy                             ││
│  │                                                              ││
│  │ [View Full Portfolio] [Make Virtual Trade]                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  [Start Paper Trading] [Learn More]                             │
│                                                                  │
│  🔒 Premium Feature - Available in Full Version                │
└─────────────────────────────────────────────────────────────────┘
```

---

### 9.3 Backtesting (H2) with Personalized Results (H3) - **GAP ADDRESSED**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 BACKTEST YOUR THESIS                                        │
│  ═══════════════════════                                        │
│                                                                  │
│  See how your investment approach would have performed          │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  BACKTEST SETUP                                             ││
│  │  ─────────────────                                          ││
│  │                                                              ││
│  │  Stock: Axis Bank                                           ││
│  │  Period: Last 5 years (Jan 2020 - Jan 2025)                ││
│  │  Your Profile: Value Investor, Moderate Risk               ││
│  │                                                              ││
│  │  [Run Backtest]                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  📈 SAMPLE BACKTEST RESULT (For Demo)                          │
│  ════════════════════════════════════                          │
│                                                                  │
│  PERSONALIZED FOR YOUR MODERATE RISK PROFILE:                  │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │  If you bought Axis Bank 5 years ago:                       ││
│  │                                                              ││
│  │  Entry Price: ₹650 (Jan 2020)                              ││
│  │  Current Price: ₹1,145                                      ││
│  │  Total Return: +76.2% (CAGR: 11.9%)                        ││
│  │  vs Nifty: +68.5% → Outperformed by 7.7%                   ││
│  │                                                              ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │                                                              ││
│  │  ⚠️ STRESS TEST (For YOUR Risk Tolerance):                  ││
│  │                                                              ││
│  │  Worst Drawdown: -52% (COVID crash, Mar 2020)              ││
│  │  Your Tolerance: 25-30%                                     ││
│  │                                                              ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ ⚠️ WARNING: This stock's worst crash (-52%)         │   ││
│  │  │ EXCEEDED your stated tolerance (25-30%)            │   ││
│  │  │                                                     │   ││
│  │  │ Could you have held through a 52% drop?            │   ││
│  │  │ [Yes, I understand] [Show me lower-volatility stocks]│   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                              ││
│  │  Recovery Time: 14 months to new highs                      ││
│  │                                                              ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │                                                              ││
│  │  DIVIDEND HISTORY (For Value Investors):                    ││
│  │  • Total dividends received: ₹48 per share                 ││
│  │  • Dividend CAGR: 12%                                       ││
│  │  • Current yield: 1.2%                                      ││
│  │                                                              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  💡 LEARNING:                                                    │
│  This backtest shows that Axis Bank rewarded patient Value      │
│  investors, BUT required stomach for significant drawdowns.     │
│  Your moderate risk tolerance might prefer banks with lower     │
│  volatility like HDFC Bank.                                     │
│                                                                  │
│  [Compare with HDFC Bank Backtest] [Add to Journal]            │
│                                                                  │
│  🔒 Full Backtesting - Available in Premium                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Personalisation Feature Specifications (B1-B12)

### 10.1 6D Personalisation Engine (B1)

**Core Architecture:**

```yaml
personalisation_engine:
  dimensions:
    D1_investment_thesis:
      options: ["Growth", "Value", "Dividend", "Quality", "Momentum", "GARP", "Agnostic"]
      impact: "Changes segment weights in scoring"
      
    D2_risk_tolerance:
      options: ["Conservative (<20% vol)", "Moderate (20-35% vol)", "Aggressive (>35% vol)"]
      impact: "Adjusts for volatility, adds warnings"
      
    D3_time_horizon:
      options: ["Short (<1 year)", "Medium (1-5 years)", "Long (5+ years)"]
      impact: "Affects growth rate thresholds"
      
    D4_experience_level:
      options: ["Beginner", "Intermediate", "Advanced"]
      impact: "Explanation depth, warnings, guidance level"
      
    D5_sector_preferences:
      options: ["Include all", "Exclude list", "Focus list"]
      impact: "Filters recommendations"
      
    D6_portfolio_context:
      options: ["Connected portfolio", "Manual input", "None"]
      impact: "Concentration warnings, diversification suggestions"
  
  weight_matrices:
    growth_investor:
      growth: 0.25
      profitability: 0.15
      valuation: 0.10
      financial_health: 0.15
      technical: 0.10
      ownership: 0.08
      broker_ratings: 0.07
      other: 0.10
      
    value_investor:
      valuation: 0.25
      profitability: 0.20
      financial_health: 0.15
      growth: 0.10
      dividends: 0.10
      other: 0.20
```

---

### 10.2 Same Stock, Different Verdicts Demo (B8)

**Profile Switcher Behavior:**

```
┌─────────────────────────────────────────────────────────────────┐
│  [🔄 Ankit (Growth)] [Sneha (Value)] [Kavya (Beginner)]        │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  Current: Ankit (Growth Investor)                              │
│                                                                  │
│  INSTANT UPDATE (No page reload):                               │
│  • Overall Score: 7.2 → Changes to 4.1 (Sneha) or 5.8 (Kavya) │
│  • Verdict: BUY → AVOID (Sneha) or HOLD/LEARN (Kavya)         │
│  • Position Guidance: Changes based on profile                 │
│  • Explanations: Adjust for experience level                   │
│  • Peer Ranking: May change based on thesis weights            │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10.3 Adaptive Complexity Explainers (B9)

**Example: ROE Explanation at Three Levels**

**Beginner (Kavya):**
```
┌─────────────────────────────────────────────────────────────────┐
│  📖 ROE (Return on Equity): 17.2%                              │
│  ═══════════════════════════════                               │
│                                                                  │
│  SIMPLE EXPLANATION:                                            │
│  Think of this as a grade for how well the company uses your   │
│  money as a shareholder.                                        │
│                                                                  │
│  If you invested ₹100, the company earns ₹17.20 profit.        │
│  That's pretty good! (Above 15% is considered good)            │
│                                                                  │
│  🎯 Quick Guide:                                                │
│  • Below 10% = Poor                                             │
│  • 10-15% = Average                                             │
│  • 15-20% = Good ✓ (Axis Bank is here)                        │
│  • Above 20% = Excellent                                        │
│                                                                  │
│  [🎓 Learn More About ROE]                                      │
└─────────────────────────────────────────────────────────────────┘
```

**Intermediate (Ankit):**
```
┌─────────────────────────────────────────────────────────────────┐
│  📊 ROE (Return on Equity): 17.2%                              │
│  ═══════════════════════════════                               │
│                                                                  │
│  Formula: Net Income ÷ Shareholder Equity                      │
│                                                                  │
│  Context:                                                       │
│  • Sector Average: 14.8%  → Axis is +2.4pp above average       │
│  • 5-Year Trend: Improving (from 12.1% to 17.2%)               │
│  • Peer Comparison: #3 among private banks                     │
│                                                                  │
│  For YOUR Growth Profile:                                       │
│  • Meets your 15% minimum threshold ✓                          │
│  • Quality indicator - sustainable profitability               │
│                                                                  │
│  [View DuPont Breakdown]                                        │
└─────────────────────────────────────────────────────────────────┘
```

**Advanced (Sneha):**
```
┌─────────────────────────────────────────────────────────────────┐
│  📈 ROE (Return on Equity): 17.2%                              │
│  ═══════════════════════════════                               │
│                                                                  │
│  DuPont Decomposition:                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ROE = Net Margin × Asset Turnover × Financial Leverage     ││
│  │ 17.2% = 12.4% × 0.85x × 1.63x                              ││
│  │                                                              ││
│  │ Component Analysis:                                         ││
│  │ • Net Margin (12.4%): Above sector avg (10.2%) ✓          ││
│  │ • Asset Turnover (0.85x): In line with peers               ││
│  │ • Leverage (1.63x): Conservative for banking               ││
│  │                                                              ││
│  │ Quality Assessment:                                         ││
│  │ ROE is MARGIN-DRIVEN, not leverage-driven ✓                ││
│  │ Sustainable ROE (ex-leverage): 10.5%                       ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  Historical Trend:                                              │
│  FY20: 12.1% → FY21: 13.5% → FY22: 15.2% → FY23: 16.8% → FY24: 17.2% │
│  CAGR: +9.2% (consistent improvement)                          │
│                                                                  │
│  Peer Benchmark:                                                │
│  HDFC Bank: 18.5% | ICICI: 18.2% | Axis: 17.2% | Kotak: 16.8% │
│                                                                  │
│  [Export Analysis] [View Historical Deep Dive]                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10.4 Position Sizing Recommendations (B11) - **GAP ADDRESSED**

**Always Shown in Verdict Output:**

```
┌─────────────────────────────────────────────────────────────────┐
│  💰 POSITION GUIDANCE                                           │
│  ═══════════════════                                            │
│                                                                  │
│  RECOMMENDED ALLOCATION: 8-10% of portfolio                    │
│                                                                  │
│  HOW WE CALCULATED THIS:                                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                                                              ││
│  │ Factor              │ Your Input      │ Impact              ││
│  ├─────────────────────┼─────────────────┼─────────────────────┤││
│  │ Risk Tolerance      │ Moderate (30%)  │ Base: 10%          ││
│  │ Stock Volatility    │ 25% annual      │ Within limits ✓    ││
│  │ Current Exposure    │ 0% Food Tech    │ Good diversify add ││
│  │ Conviction Level    │ Score 7.2/10    │ Moderate position  ││
│  │ Portfolio Size      │ ₹10L           │ ₹80K-1L suggested   ││
│  │                                                              ││
│  │ Result: 8-10% allocation appropriate                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  ENTRY STRATEGY:                                                │
│  • Start: 5% position (₹50,000)                                │
│  • Add: 3-5% on 10%+ price drop                                │
│  • Max: 12% (given loss-making status)                         │
│                                                                  │
│  ⚠️ WARNINGS FOR YOUR PROFILE:                                  │
│  • Stock is more volatile than your typical picks              │
│  • No dividends (your portfolio currently yields 1.8%)         │
│                                                                  │
│  [📊 Position Calculator] [Adjust for Different Amount]        │
└─────────────────────────────────────────────────────────────────┘
```

---

### 10.5 Entry/Exit Timing Guidance (B12)

```
┌─────────────────────────────────────────────────────────────────┐
│  ⏰ TIMING GUIDANCE                                             │
│  ═════════════════                                              │
│                                                                  │
│  ENTRY ANALYSIS:                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Current Price: ₹265                                         ││
│  │ Fair Value Range: ₹240 - ₹300 (for Growth investors)       ││
│  │ Position in Range: Middle (55th percentile)                 ││
│  │                                                              ││
│  │ Assessment: MODERATE ENTRY                                   ││
│  │ Not expensive, not cheap. Reasonable to start position.    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  FOR YOUR 3-5 YEAR HORIZON:                                    │
│  • Timing matters less - focus on fundamentals                 │
│  • Consider rupee-cost averaging over 3 tranches              │
│                                                                  │
│  TECHNICAL LEVELS (if you want to optimize entry):             │
│  • Support: ₹245 (good entry point)                           │
│  • Resistance: ₹290 (wait for breakout confirmation)          │
│  • 200-day MA: ₹255 (below current price)                     │
│                                                                  │
│  EXIT TRIGGERS TO MONITOR:                                      │
│  ⚠️ Consider exiting if:                                        │
│  • Losses widen for 3 consecutive quarters                     │
│  • Quick commerce investment exceeds ₹5,000 Cr                │
│  • Key management departure                                     │
│                                                                  │
│  [Set Alert for ₹245 Entry] [Set Thesis-Breaking Alert]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 11. Screen Requirements

### 11.1 Screen Map (Updated for CVP + Personalisation)

```
┌─────────────────────────────────────────────────────────────────┐
│                     SCREEN HIERARCHY                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ENTRY                                                          │
│  └── Profile Selection/Switcher (Persistent)                   │
│                                                                  │
│  PRIMARY FLOW                                                   │
│  ├── Dashboard/Home                                             │
│  │   ├── Watchlist (with Quick Scan scores)                    │
│  │   ├── Alert Summary                                          │
│  │   └── Portfolio Snapshot                                     │
│  │                                                              │
│  ├── Stock Analysis (A13 + A14)                                │
│  │   ├── Quick Analysis Mode (Default)                         │
│  │   │   ├── Score + Verdict                                   │
│  │   │   ├── Top Signals (3)                                   │
│  │   │   ├── Red Flags                                         │
│  │   │   ├── Peer Rank                                         │
│  │   │   ├── Portfolio Fit                                     │
│  │   │   └── Position Sizing Summary                           │
│  │   │                                                          │
│  │   └── Full Analysis Mode (Expand)                           │
│  │       ├── All 11 Segments                                   │
│  │       ├── 200+ Metrics (drill-down)                        │
│  │       ├── Citations (3-level)                               │
│  │       ├── Detailed Position Guidance                        │
│  │       └── Entry/Exit Timing                                 │
│  │                                                              │
│  ├── Segment Deep-Dive                                         │
│  │   ├── Metric Details                                        │
│  │   ├── Historical Trends                                     │
│  │   └── Citation Drill-Down                                   │
│  │                                                              │
│  └── AI Chat                                                    │
│      └── Stock Q&A                                              │
│                                                                  │
│  SUPPORTING                                                     │
│  ├── Analysis Journal                                           │
│  │   ├── Entry List                                            │
│  │   ├── Entry Detail                                          │
│  │   ├── Blind Spot Analysis                                   │
│  │   └── Pattern Recognition                                   │
│  │                                                              │
│  ├── Alert Center                                               │
│  │   ├── Alert List                                            │
│  │   ├── Alert Detail (incl. Thesis-Breaking)                 │
│  │   └── Alert Settings                                        │
│  │                                                              │
│  ├── Portfolio View                                             │
│  │   ├── Holdings                                              │
│  │   └── Concentration Analysis                                │
│  │                                                              │
│  ├── Stock Comparison                                           │
│  │                                                              │
│  └── Discovery Hub                                              │
│      ├── Trending                                               │
│      ├── Top Rated                                              │
│      └── For You (Personalized)                                │
│                                                                  │
│  ENTRY POINTS (Show Concept + Sample)                          │
│  ├── Backtest Home (with Sample Result)                        │
│  ├── Simulator Home                                             │
│  └── Advisor Marketplace                                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Mock Data Requirements

### 12.1 Data Files Required

| File | Contents | Priority |
|------|----------|----------|
| `stocks.json` | 3 stocks × 3 profiles = 9 complete analyses | MUST |
| `segments.json` | 11 segments × 200+ metrics per stock | MUST |
| `citations.json` | Citation data for all metrics (mock) | MUST |
| `profiles.json` | 3 user profiles with portfolios | MUST |
| `journal.json` | 6 months simulated history per profile | MUST |
| `alerts.json` | Sample alerts including thesis-breaking | MUST |
| `patterns.json` | Pattern detection data per profile | SHOULD |
| `peer_ranks.json` | Peer ranking data | SHOULD |

### 12.2 Stock Analysis Data Template

```yaml
stock:
  name: "Eternal (Zomato)"
  ticker: "ZOMATO"
  sector: "Food Tech"
  current_price: 265
  
  profiles:
    ankit:
      overall_score: 7.2
      verdict: "BUY"
      verdict_summary: "Strong growth justifies premium for your 3-5yr horizon"
      
      position_sizing:
        recommended: "8-10%"
        start: "5%"
        add_on_dip: "3-5% on 10%+ drop"
        max: "12%"
        warning: "Given loss-making status"
        
      entry_timing:
        assessment: "Moderate entry"
        current_vs_fair: "Middle of range"
        suggestion: "Start position now, add on dips"
        
      top_signals:
        - signal: "Exceptional Revenue Growth"
          detail: "65% CAGR vs sector 25%"
          score_contribution: "+1.8"
        - signal: "Zero Debt, Strong Cash"
          detail: "₹12,000 Cr runway"
          score_contribution: "+0.8"
        - signal: "Improving Unit Economics"
          detail: "Contribution margin positive"
          score_contribution: "+0.5"
          
      red_flags:
        - flag: "Still Loss-Making"
          severity: "Medium"
          detail: "Net margin -8.2%"
          your_context: "Acceptable for growth thesis"
        - flag: "Premium Valuation"
          severity: "Low"
          detail: "P/S 8.2x vs 3.5x"
          your_context: "Growth rate justifies"
          
      peer_ranking:
        rank: 3
        category: "Food Tech"
        total: 8
        
      segments:
        profitability:
          score: 4.2
          band: "red"
          quick_insight: "Loss-making but improving"
          metrics:
            # ... full metric list
```

---

## 13. Acceptance Criteria

### 13.1 Critical Path (MUST Work Flawlessly)

| # | Test Case | Expected Behavior |
|---|-----------|-------------------|
| 1 | Profile Switch | Switching profiles instantly updates: score, verdict, position sizing, explanations |
| 2 | Quick → Full Analysis | "Deep Dive" button smoothly expands to full analysis mode |
| 3 | Same Stock Different Verdict | Zomato shows: 7.2 BUY (Ankit), 4.1 AVOID (Sneha), 5.8 HOLD (Kavya) |
| 4 | Position Sizing in Verdict | Every verdict includes allocation guidance |
| 5 | Citation Drill-Down | Click metric → source → exact quote (3 levels) |
| 6 | Segment Expansion | All 11 segments expandable with metrics visible |
| 7 | Journal History | 6 months of entries visible with pattern detection |
| 8 | Alert Examples | At least one thesis-breaking alert shown |

### 13.2 Should Work (Important)

| # | Test Case | Expected Behavior |
|---|-----------|-------------------|
| 9 | Peer Ranking | Shows rank and top 5 competitors |
| 10 | Blind Spot Detection | Shows analysis patterns and gaps |
| 11 | Adaptive Explanations | Kavya gets simpler explanations than Sneha |
| 12 | Stock Comparison | Side-by-side works for any 2 stocks |
| 13 | Backtest Sample | Shows sample personalized backtest result |

### 13.3 Nice to Have (If Time Permits)

| # | Test Case | Expected Behavior |
|---|-----------|-------------------|
| 14 | Highlight-to-Note | Text selection adds to journal |
| 15 | AI Chat Context | Chat understands current stock context |
| 16 | Discovery Personalization | "For You" tab shows profile-relevant stocks |

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 15, 2025 | Product Team | Initial PRD |
| 2.0 | Jan 15, 2025 | Product Team | Gap analysis integration - Added A13/A14 modes, F6 alerts, B11 position sizing, H3 backtest results |

---

*End of CVP + Personalisation Cluster PRD v2.0*
