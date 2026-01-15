# StockFox PRD + Technical Specification
## VAL (Validation Entry) Cluster

**Version:** 1.0  
**Date:** January 15, 2025  
**Status:** Ready for Development  
**Cluster Type:** Entry Points Only (Phase 3 Preview)

---

## Document Overview

This PRD covers the **Validation Entry (VAL) Cluster** - the final cluster in StockFox's MLP prototype. Unlike previous clusters that implement full functionality, VAL features are **entry points only**, designed to:

1. Show users that validation tools exist (building confidence in the platform's completeness)
2. Demonstrate the concept without full implementation
3. Create anticipation for Phase 3 features
4. Provide natural upgrade/upsell touchpoints

**Features Covered (10 total):**

| ID | Feature | Implementation Level |
|----|---------|---------------------|
| H1 | Forward-Testing Simulator | Entry CTA + Concept Screen |
| H2 | Backtesting Engine | Home Screen Only |
| H4 | What-If Scenarios | Concept Mention |
| I1 | Advisor Marketplace | Browse View |
| I2 | 3-Tier Advisor System | Visual Badges |
| I3 | Advisor Specialization Filters | Filter UI |
| I4 | AI + Human Review Concept | Explanatory Content |
| I5 | Verified Credentials & AUM | Verification Badges |
| I6 | Track Record Display | Performance Metrics |
| I8 | Pricing Display | Consultation Costs |

---

## Part 1: Product Requirements Document (PRD)

---

### 1.1 Executive Summary

#### Purpose
The Validation Entry cluster provides users with two pathways to validate their investment decisions before committing capital:

1. **Self-Validation via Simulation** - Test your thesis against historical data
2. **Expert Validation via Advisors** - Get human expert confirmation

For the MLP demo, these are **entry points** that establish credibility and show the complete user journey without requiring full backend implementation.

#### User Journey Context

```
Phase 1: Discovery          Phase 2: Confidence         Phase 3: Validation
(Full Implementation)       (Full Implementation)       (Entry Points Only)
        ↓                           ↓                           ↓
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│ Stock Analysis  │───────▶│ Journal &       │───────▶│ Backtest OR     │
│ Scorecard       │        │ Pattern Learning│        │ Advisor Consult │
└─────────────────┘        └─────────────────┘        └─────────────────┘
                                                              │
                                                              ▼
                                                      ┌─────────────────┐
                                                      │ Deploy Capital  │
                                                      │ (Out of Scope)  │
                                                      └─────────────────┘
```

#### Success Metrics (Demo Context)
- Users understand validation options exist
- Entry points feel natural in the journey flow
- "Coming Soon" messaging builds anticipation, not frustration
- Advisor marketplace demonstrates StockFox's full-stack vision

---

### 1.2 Feature Specifications: Backtesting & Simulation

#### 1.2.1 H1: Forward-Testing Simulator

**User Story:**
> As a user who has completed my analysis, I want to test my investment thesis with virtual money before committing real capital, so I can learn from my decisions without financial risk.

**Demo Implementation:**

| Aspect | Specification |
|--------|---------------|
| Entry Point | CTA button on Stock Analysis screen |
| Destination | Simulator concept landing page |
| Functionality | Static/informational only |
| Status Indicator | "Coming Soon - Q2 2026" badge |

**Entry Point Placement:**
```
┌─────────────────────────────────────────────────────────────┐
│ STOCK ANALYSIS: TCS                                         │
│ Score: 8.7/10 - STRONG BUY                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Primary CTA: Add to Watchlist]                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Want to validate your thesis?                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │ 📊 Test with        │  │ 👤 Consult an       │          │
│  │ Virtual Money       │  │ Expert Advisor      │          │
│  │ [Coming Soon]       │  │ [Browse Advisors]   │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Simulator Concept Page Content:**

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 FORWARD-TESTING SIMULATOR                   Coming Soon  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Test Your Investment Thesis Risk-Free                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Illustration: Virtual Portfolio Dashboard]         │   │
│  │                                                      │   │
│  │  Starting Capital: ₹10,00,000 (Virtual)             │   │
│  │  Current Value: ₹11,45,230                          │   │
│  │  Return: +14.5%                                      │   │
│  │  Benchmark (Nifty): +8.2%                           │   │
│  │  Alpha Generated: +6.3%                             │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  How It Works:                                              │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                           │
│  │ 1  │  │ 2  │  │ 3  │  │ 4  │                           │
│  │Anal│  │"Buy"│  │Track│  │Learn│                         │
│  │yze │─▶│Virt│─▶│Real │─▶│From │                         │
│  │    │  │ual │  │Perf │  │Outco│                         │
│  └────┘  └────┘  └────┘  └────┘                           │
│                                                             │
│  Features Coming:                                           │
│  ✓ Virtual portfolio with ₹10L starting capital            │
│  ✓ Real-time tracking against actual market prices         │
│  ✓ Performance comparison vs Nifty/Sensex                  │
│  ✓ Decision journal integration                            │
│  ✓ Learn from wins AND losses without real risk            │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔔 Notify Me When Available                         │   │
│  │ [Email input field]  [Notify Me]                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  For now, validate your thesis with an Expert Advisor →    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Entry CTA appears on Stock Analysis screen below primary actions
- [ ] Clicking CTA navigates to Simulator concept page
- [ ] Concept page clearly explains the feature
- [ ] "Coming Soon" badge is prominent
- [ ] Email capture for waitlist is functional (stores to mock data)
- [ ] Link to Advisor Marketplace provides alternative path

---

#### 1.2.2 H2: Backtesting Engine

**User Story:**
> As a user considering an investment, I want to see how my thesis would have performed historically, so I can build confidence in my analysis approach.

**Demo Implementation:**

| Aspect | Specification |
|--------|---------------|
| Entry Point | "Backtest This Stock" link on Analysis screen |
| Destination | Backtest home/concept screen |
| Functionality | Static mockup showing concept |
| Status Indicator | "Coming Soon" with sample output |

**Backtest Concept Screen:**

```
┌─────────────────────────────────────────────────────────────┐
│ ⏪ BACKTEST ENGINE                              Coming Soon  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  What If You Had Invested 5 Years Ago?                      │
│                                                             │
│  Sample Analysis: TCS                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  If you invested ₹1,00,000 in Jan 2020:             │   │
│  │                                                      │   │
│  │  📈 Current Value: ₹2,34,500 (+134.5%)              │   │
│  │  📊 Nifty Return: ₹1,62,000 (+62.0%)                │   │
│  │  ✨ Outperformance: +72.5%                          │   │
│  │                                                      │   │
│  │  Journey Highlights:                                 │   │
│  │  ├─ Mar 2020: COVID crash (-35%)                    │   │
│  │  │  └─ Recovery: 8 months                           │   │
│  │  ├─ Oct 2021: All-time high (+89%)                  │   │
│  │  └─ Jan 2025: Current (+134.5%)                     │   │
│  │                                                      │   │
│  │  [Sample chart showing 5-year price movement]       │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ⚠️ This is a sample visualization.                        │
│  Full backtesting with your personalized parameters        │
│  coming in Q2 2026.                                         │
│                                                             │
│  Backtest Will Include:                                     │
│  ✓ Custom entry date selection                             │
│  ✓ Personalized risk tolerance overlay                     │
│  ✓ "Could you have held through the dips?" analysis        │
│  ✓ Dividend reinvestment scenarios                         │
│  ✓ Comparison with alternative stocks                      │
│                                                             │
│  [🔔 Notify Me]  [👤 Talk to Advisor Instead]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Entry link appears in Stock Analysis actions
- [ ] Sample backtest visualization is compelling
- [ ] Key metrics shown: Total return, benchmark comparison, max drawdown
- [ ] Clear "Coming Soon" messaging
- [ ] Alternative path to Advisor Marketplace

---

#### 1.2.3 H4: What-If Scenarios

**User Story:**
> As a user exploring investment options, I want to run "what-if" scenarios (different entry points, position sizes), so I can understand potential outcomes.

**Demo Implementation:**

| Aspect | Specification |
|--------|---------------|
| Implementation | Concept mention only |
| Location | Within Backtest concept page |
| Functionality | Text description, no interaction |

**What-If Section (within Backtest page):**

```
┌─────────────────────────────────────────────────────────────┐
│  Coming Soon: What-If Scenarios                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Explore questions like:                                    │
│                                                             │
│  💭 "What if I had bought at the 52-week low?"             │
│  💭 "What if I invested monthly instead of lump sum?"      │
│  💭 "What if I had a stop-loss at -20%?"                   │
│  💭 "What if I held through the COVID crash?"              │
│                                                             │
│  Run unlimited scenarios to build conviction in your        │
│  investment strategy.                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] What-If section appears within Backtest concept page
- [ ] Clear examples of scenario types
- [ ] No interactive functionality required

---

#### 1.2.4 H5: Historical Drawdown Education

**User Story:**
> As a user assessing risk, I want to see how a stock performed during past market crashes, so I can prepare mentally for volatility.

**Demo Implementation:**

| Aspect | Specification |
|--------|---------------|
| Location | Stock Analysis - Risk section |
| Implementation | Static educational content |
| Data | Pre-populated for demo stocks |

**Drawdown Display (within Stock Analysis):**

```
┌─────────────────────────────────────────────────────────────┐
│  📉 Historical Stress Test                                  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  How TCS performed during major market events:              │
│                                                             │
│  Event              Drop      Recovery Time                 │
│  ─────────────────────────────────────────────────────────  │
│  COVID Crash        -35%      8 months                      │
│  (Mar 2020)                                                 │
│                                                             │
│  IL&FS Crisis       -18%      4 months                      │
│  (Sep 2018)                                                 │
│                                                             │
│  Demonetization     -12%      2 months                      │
│  (Nov 2016)                                                 │
│                                                             │
│  💡 For Your Profile (Moderate Risk):                       │
│  Your stated tolerance: Up to 25-30% drawdown               │
│  TCS worst drawdown: -35%                                   │
│  ⚠️ Slightly exceeds your comfort zone                      │
│                                                             │
│  Consider: Smaller position size (8% vs 12%)               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Mock Data Required:**

| Stock | Event | Drawdown | Recovery |
|-------|-------|----------|----------|
| TCS | COVID Mar 2020 | -35% | 8 months |
| TCS | IL&FS Sep 2018 | -18% | 4 months |
| TCS | Demonetization Nov 2016 | -12% | 2 months |
| Axis Bank | COVID Mar 2020 | -52% | 14 months |
| Axis Bank | Yes Bank Crisis Mar 2020 | -45% | 12 months |
| Axis Bank | IL&FS Sep 2018 | -28% | 6 months |
| Eternal | COVID Mar 2020 | -42% | 6 months |
| Eternal | Tech Selloff 2022 | -65% | 18 months |
| Eternal | Quick Commerce Competition 2023 | -38% | Ongoing |

**Acceptance Criteria:**
- [ ] Drawdown section appears in Stock Analysis
- [ ] Shows 2-3 historical events per stock
- [ ] Includes recovery timeline
- [ ] Personalized note based on user's risk profile
- [ ] Educational framing (not fear-inducing)

---

### 1.3 Feature Specifications: Advisor Marketplace

#### 1.3.1 I1: Advisor Marketplace Browse View

**User Story:**
> As a user who wants expert validation, I want to browse available advisors and their specializations, so I can choose the right expert for my needs.

**Demo Implementation:**

| Aspect | Specification |
|--------|---------------|
| Screen | Full browse view with advisor cards |
| Functionality | Browse, filter, view profiles |
| Booking | CTA shows "Coming Soon" or waitlist |

**Marketplace Home Screen:**

```
┌─────────────────────────────────────────────────────────────┐
│ 👤 ADVISOR MARKETPLACE                                      │
│ Get expert validation for your investment decisions         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ How It Works:                                               │
│ ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐       │
│ │You     │    │AI Pre- │    │Expert  │    │Personal│       │
│ │Analyze │───▶│Analysis│───▶│Reviews │───▶│Verdict │       │
│ │(3 sec) │    │(Auto)  │    │(1 hour)│    │        │       │
│ └────────┘    └────────┘    └────────┘    └────────┘       │
│                                                             │
│ The StockFox 10x Model:                                     │
│ AI does the heavy lifting → Expert adds judgment            │
│ Result: Same-day turnaround at 60% lower cost               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ Filter Advisors:                                            │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│ │ Tier ▼      │ │ Sector ▼    │ │ Price ▼     │            │
│ │ All         │ │ All         │ │ All         │            │
│ └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                             │
│ 12 Advisors Available                          [Sort: Rating]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Advisor Card 1]  [Advisor Card 2]  [Advisor Card 3]       │
│                                                             │
│ [Advisor Card 4]  [Advisor Card 5]  [Advisor Card 6]       │
│                                                             │
│ [Load More Advisors]                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Marketplace accessible from multiple entry points
- [ ] Clear explanation of AI + Human model
- [ ] Filter functionality works
- [ ] Advisor cards display key information
- [ ] Responsive grid layout

---

#### 1.3.2 I2: 3-Tier Advisor System

**User Story:**
> As a user with budget constraints, I want to see advisors segmented by experience/price tier, so I can choose one that fits my needs and budget.

**Tier Definitions:**

| Tier | Badge | Experience | Typical AUM | Price Range | Color |
|------|-------|------------|-------------|-------------|-------|
| Elite | 🏆 | 15+ years | ₹500+ Cr | ₹8,000-15,000 | Gold |
| Expert | ⭐ | 8-15 years | ₹100-500 Cr | ₹3,000-8,000 | Blue |
| Emerging | 🌟 | 3-8 years | ₹20-100 Cr | ₹500-3,000 | Green |

**Tier Badge Display:**

```
┌─────────────────────────────────────────────────────────────┐
│ ADVISOR TIERS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏆 ELITE                                                   │
│  ─────────────────────────────────────────────────────────  │
│  • 15+ years institutional experience                       │
│  • ₹500 Cr+ assets under guidance                          │
│  • Track record: CA-audited 10+ year performance           │
│  • Specialization: Complex portfolios, HNI strategies      │
│  • Price: ₹8,000 - ₹15,000 per consultation                │
│                                                             │
│  ⭐ EXPERT                                                  │
│  ─────────────────────────────────────────────────────────  │
│  • 8-15 years professional experience                       │
│  • ₹100-500 Cr assets under guidance                       │
│  • Track record: Verified 5+ year performance              │
│  • Specialization: Sector expertise, growth strategies     │
│  • Price: ₹3,000 - ₹8,000 per consultation                 │
│                                                             │
│  🌟 EMERGING                                                │
│  ─────────────────────────────────────────────────────────  │
│  • 3-8 years professional experience                        │
│  • ₹20-100 Cr assets under guidance                        │
│  • Track record: Verified 3+ year performance              │
│  • Specialization: Fresh perspectives, accessible pricing  │
│  • Price: ₹500 - ₹3,000 per consultation                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Tier badges visually distinct (color-coded)
- [ ] Tier filter in marketplace works
- [ ] Tier explanation accessible via info icon
- [ ] Each advisor card shows tier badge prominently

---

#### 1.3.3 I3: Advisor Specialization Filters

**User Story:**
> As a user looking for specific expertise, I want to filter advisors by sector and strategy specialization, so I can find the right expert for my stock.

**Filter Options:**

**Sector Filters:**
- All Sectors
- Banking & Finance
- IT & Technology
- Pharma & Healthcare
- FMCG & Consumer
- Auto & Manufacturing
- Infrastructure & Realty
- Energy & Utilities

**Strategy Filters:**
- All Strategies
- Value Investing
- Growth Investing
- Dividend/Income
- Small & Mid Cap
- Large Cap Quality
- Turnarounds
- IPO Analysis

**Filter UI:**

```
┌─────────────────────────────────────────────────────────────┐
│ Filter Advisors                                    [Clear All]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Tier                                                       │
│  ○ All  ○ Elite 🏆  ○ Expert ⭐  ○ Emerging 🌟             │
│                                                             │
│  Sector Expertise                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Select sectors...                              ▼    │   │
│  └─────────────────────────────────────────────────────┘   │
│  Selected: Banking, IT (2)                                  │
│                                                             │
│  Strategy Focus                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Select strategies...                           ▼    │   │
│  └─────────────────────────────────────────────────────┘   │
│  Selected: Value Investing (1)                              │
│                                                             │
│  Price Range                                                │
│  ○ All  ○ Under ₹3K  ○ ₹3K-8K  ○ Above ₹8K                │
│                                                             │
│  [Apply Filters]                      Showing 4 of 12      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Multi-select for sectors and strategies
- [ ] Single-select for tier and price range
- [ ] Filter count updates in real-time
- [ ] "Clear All" resets filters
- [ ] Results update on "Apply Filters"

---

#### 1.3.4 I4: AI + Human Review Concept

**User Story:**
> As a user considering paid consultation, I want to understand how AI and human expertise combine, so I can appreciate the value proposition.

**Concept Explanation Content:**

```
┌─────────────────────────────────────────────────────────────┐
│ THE STOCKFOX 10x MODEL                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  How We Make Expert Advice 10x More Efficient               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  Traditional Advisory:                               │   │
│  │  ────────────────────                               │   │
│  │  You describe stock → Analyst researches (7-10 hrs) │   │
│  │  → Report in 2-3 days → ₹5,000-8,000 per stock     │   │
│  │                                                      │   │
│  │            vs.                                       │   │
│  │                                                      │   │
│  │  StockFox Model:                                    │   │
│  │  ──────────────────                                 │   │
│  │  You analyze (3 sec AI) → Expert reviews (1 hour)  │   │
│  │  → Verdict same day → ₹500-3,000 per stock         │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  What You Get:                                              │
│                                                             │
│  ✓ AI Pre-Analysis (Instant)                               │
│    Complete 11-segment analysis with your StockFox score    │
│    Sent to advisor before consultation                      │
│                                                             │
│  ✓ Expert Review (40-60 minutes)                           │
│    Advisor reviews AI analysis                              │
│    Adds human judgment, catches nuances AI might miss       │
│    Considers market context, recent developments            │
│                                                             │
│  ✓ Personalized Verdict (Same Day)                         │
│    Clear recommendation aligned to YOUR profile             │
│    Written explanation of reasoning                         │
│    Follow-up questions answered                             │
│                                                             │
│  Why This Works:                                            │
│  AI handles breadth (200+ metrics, 11 segments)            │
│  Human adds depth (judgment, experience, context)          │
│  You get both at fraction of traditional cost              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] Explanation appears on Marketplace home
- [ ] Comparison with traditional model is clear
- [ ] Value proposition (speed + cost) is prominent
- [ ] No technical jargon

---

#### 1.3.5 I5 & I6: Verified Credentials, AUM & Track Record

**User Story:**
> As a user choosing an advisor, I want to see verified credentials and historical performance, so I can trust they're qualified.

**Verification Badges:**

| Verification | Badge | Meaning |
|--------------|-------|---------|
| SEBI Registered | ✓ SEBI RA | Registered Investment Advisor |
| AUM Verified | ✓ AUM Audited | Assets under management CA-verified |
| Track Record | ✓ Performance Verified | Returns independently verified |
| Experience | ✓ Background Checked | Employment history verified |

**Advisor Profile with Credentials:**

```
┌─────────────────────────────────────────────────────────────┐
│ ADVISOR PROFILE                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐  Rahul Sharma, CFA                    🏆 ELITE   │
│  │ Photo│  Senior Investment Advisor                        │
│  └──────┘                                                   │
│                                                             │
│  Verifications:                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ✓ SEBI RA    ✓ AUM Audited    ✓ Performance        │   │
│  │   INH00012     ₹850 Cr          Verified            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Track Record (5-Year):                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  Metric              Advisor    Benchmark           │   │
│  │  ─────────────────────────────────────────────────  │   │
│  │  CAGR                18.4%      12.1% (Nifty)      │   │
│  │  Win Rate            72%        -                   │   │
│  │  Avg Holding         14 months  -                   │   │
│  │  Max Drawdown        -22%       -35% (Nifty)       │   │
│  │                                                      │   │
│  │  [Chart: Year-by-year returns vs Nifty]            │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Specializations:                                           │
│  [Banking] [Value Investing] [Large Cap]                   │
│                                                             │
│  Experience:                                                │
│  • 18 years in equity research                             │
│  • Ex-HDFC Securities (VP - Research)                      │
│  • Ex-Motilal Oswal (Senior Analyst)                       │
│  • CFA Charterholder                                        │
│                                                             │
│  Client Reviews (47):                                       │
│  ⭐⭐⭐⭐⭐ 4.8/5                                           │
│  "Rahul's analysis of HDFC Bank was spot-on..."            │
│                                                             │
│  Consultation: ₹12,000                                      │
│  [📅 Request Consultation - Coming Soon]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- [ ] All verification badges visible
- [ ] Hover/tap shows verification details
- [ ] Track record chart is clear
- [ ] Performance metrics explained
- [ ] Client reviews shown (mock data)

---

#### 1.3.6 I8: Pricing Display

**User Story:**
> As a user considering consultation, I want to see clear pricing upfront, so I can budget and decide if it's worth it.

**Pricing Display on Advisor Card:**

```
┌─────────────────────────────────────────────────────────────┐
│ ADVISOR CARD                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────┐  Priya Mehta              ⭐ EXPERT              │
│  │ Photo│  Banking & Finance Specialist                     │
│  └──────┘  12 years experience                              │
│                                                             │
│  ✓ SEBI RA  ✓ AUM: ₹280 Cr  ⭐ 4.6/5 (32 reviews)         │
│                                                             │
│  Specializes in: [Banking] [Value] [Dividends]             │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Per-Stock Consultation                             │   │
│  │  ₹5,500                                             │   │
│  │                                                      │   │
│  │  Includes:                                          │   │
│  │  • AI pre-analysis review                           │   │
│  │  • 45-min expert consultation                       │   │
│  │  • Written verdict & reasoning                      │   │
│  │  • 7-day follow-up support                         │   │
│  │                                                      │   │
│  │  [View Profile]  [Request - Coming Soon]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Pricing Tiers (Mock Data):**

| Tier | Price Range | What's Included |
|------|-------------|-----------------|
| Elite | ₹8,000-15,000 | 60-min consultation, portfolio review option, 14-day follow-up |
| Expert | ₹3,000-8,000 | 45-min consultation, written verdict, 7-day follow-up |
| Emerging | ₹500-3,000 | 30-min consultation, written verdict, 3-day follow-up |

**Acceptance Criteria:**
- [ ] Price prominently displayed on each card
- [ ] "Includes" list clarifies value
- [ ] Price filter works correctly
- [ ] No hidden fees messaging

---

### 1.4 Mock Advisor Data

**12 Mock Advisors for Demo:**

| Name | Tier | Specialization | Experience | AUM | Price | Rating |
|------|------|----------------|------------|-----|-------|--------|
| Rahul Sharma | Elite | Banking, Value | 18 yrs | ₹850 Cr | ₹12,000 | 4.8 |
| Anita Desai | Elite | IT, Growth | 16 yrs | ₹620 Cr | ₹10,000 | 4.9 |
| Vikram Patel | Elite | Pharma, Quality | 20 yrs | ₹1,100 Cr | ₹15,000 | 4.7 |
| Priya Mehta | Expert | Banking, Dividends | 12 yrs | ₹280 Cr | ₹5,500 | 4.6 |
| Suresh Kumar | Expert | FMCG, Value | 10 yrs | ₹180 Cr | ₹4,000 | 4.5 |
| Neha Agarwal | Expert | IT, Mid-cap | 9 yrs | ₹150 Cr | ₹3,500 | 4.7 |
| Amit Singh | Expert | Auto, Turnarounds | 11 yrs | ₹220 Cr | ₹6,000 | 4.4 |
| Kavita Rao | Emerging | Banking, Growth | 6 yrs | ₹65 Cr | ₹2,000 | 4.3 |
| Deepak Joshi | Emerging | IT, Small-cap | 5 yrs | ₹45 Cr | ₹1,500 | 4.5 |
| Meera Sharma | Emerging | Pharma, Value | 4 yrs | ₹35 Cr | ₹1,000 | 4.2 |
| Rajesh Nair | Emerging | FMCG, Growth | 7 yrs | ₹80 Cr | ₹2,500 | 4.6 |
| Sunita Verma | Emerging | Multi-sector | 3 yrs | ₹22 Cr | ₹500 | 4.1 |

---

### 1.5 Entry Points & Navigation

**Entry Points to Validation Features:**

| From | To | Trigger |
|------|-----|---------|
| Stock Analysis (bottom) | Simulator/Advisor choice | "Validate Your Thesis" section |
| Stock Analysis (verdict) | Backtest concept | "How would this have performed?" link |
| Journal (after logging decision) | Simulator | "Test your decision risk-free" CTA |
| Discovery (high-conviction stock) | Advisor | "Get expert opinion" CTA |
| Alerts (thesis-breaking) | Advisor | "Consult an expert" suggestion |
| Dashboard (global nav) | Marketplace | "Advisors" nav item |
| Profile/Settings | Marketplace | "Get Expert Help" option |

**Navigation Flow:**

```
                    ┌─────────────────┐
                    │   Dashboard     │
                    │   (Nav: Advisors)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│Stock Analysis │   │   Journal     │   │   Discovery   │
│               │   │               │   │               │
│ "Validate"    │   │ "Test risk-   │   │ "Get expert   │
│ section       │   │ free" CTA     │   │ opinion" CTA  │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
               ┌────────────────────────┐
               │  Validation Choice     │
               │  ┌──────┐  ┌────────┐  │
               │  │Simul-│  │Advisor │  │
               │  │ator  │  │Market- │  │
               │  │      │  │place   │  │
               │  └──────┘  └────────┘  │
               └────────────────────────┘
                      │           │
                      ▼           ▼
            ┌──────────────┐ ┌──────────────┐
            │  Simulator   │ │  Marketplace │
            │  Concept     │ │  Browse      │
            │  (Coming     │ │  (Functional)│
            │  Soon)       │ │              │
            └──────────────┘ └──────────────┘
                                    │
                                    ▼
                            ┌──────────────┐
                            │   Advisor    │
                            │   Profile    │
                            │              │
                            │ [Request -   │
                            │ Coming Soon] │
                            └──────────────┘
```

---

## Part 2: Technical Specification

---

### 2.1 Data Structures

#### 2.1.1 Backtest Data Structure

```typescript
interface BacktestSample {
  stockId: string;
  stockName: string;
  
  // Sample backtest results (pre-calculated, static)
  backtest: {
    startDate: string;         // "2020-01-15"
    startPrice: number;        // 2150
    currentPrice: number;      // 4280
    totalReturn: number;       // 99.1 (percentage)
    benchmarkReturn: number;   // 62.0 (Nifty)
    alpha: number;             // 37.1
    
    // Historical events
    events: HistoricalEvent[];
  };
  
  // Drawdown education data
  drawdowns: DrawdownEvent[];
}

interface HistoricalEvent {
  date: string;
  event: string;              // "COVID Crash"
  priceChange: number;        // -35 (percentage)
  recoveryMonths: number;     // 8
}

interface DrawdownEvent {
  eventName: string;
  date: string;
  maxDrawdown: number;        // -35 (percentage)
  recoveryMonths: number;
  description: string;
}
```

#### 2.1.2 Advisor Data Structure

```typescript
interface Advisor {
  id: string;
  
  // Basic info
  name: string;
  photo: string;              // URL or placeholder
  title: string;              // "Senior Investment Advisor"
  
  // Tier
  tier: 'elite' | 'expert' | 'emerging';
  tierBadge: string;          // "🏆" | "⭐" | "🌟"
  
  // Verifications
  verifications: {
    sebiRegistered: boolean;
    sebiNumber: string;       // "INH00012"
    aumVerified: boolean;
    aumAmount: number;        // In crores
    performanceVerified: boolean;
    backgroundChecked: boolean;
  };
  
  // Experience
  experience: {
    years: number;
    previousRoles: string[];  // ["Ex-HDFC Securities (VP)", ...]
    certifications: string[]; // ["CFA", "CA", ...]
  };
  
  // Specializations
  specializations: {
    sectors: string[];        // ["Banking", "IT"]
    strategies: string[];     // ["Value", "Growth"]
  };
  
  // Track Record
  trackRecord: {
    cagr: number;             // 18.4
    winRate: number;          // 72
    avgHoldingMonths: number; // 14
    maxDrawdown: number;      // -22
    benchmarkCagr: number;    // 12.1
  };
  
  // Reviews
  reviews: {
    averageRating: number;    // 4.8
    totalReviews: number;     // 47
    sampleReviews: Review[];
  };
  
  // Pricing
  pricing: {
    perConsultation: number;  // 12000
    includes: string[];       // ["60-min consultation", ...]
    followUpDays: number;     // 14
  };
}

interface Review {
  reviewerName: string;       // First name only for privacy
  rating: number;
  comment: string;
  date: string;
}
```

#### 2.1.3 Filter State Structure

```typescript
interface AdvisorFilters {
  tier: 'all' | 'elite' | 'expert' | 'emerging';
  sectors: string[];          // Multi-select
  strategies: string[];       // Multi-select
  priceRange: 'all' | 'under3k' | '3k-8k' | 'above8k';
  sortBy: 'rating' | 'price-low' | 'price-high' | 'experience';
}
```

---

### 2.2 Component Architecture

#### 2.2.1 Validation Entry Components

```
/src/components/validation/
├── BacktestEntry/
│   ├── BacktestEntry.tsx          # Entry CTA component
│   ├── BacktestConceptPage.tsx    # Full concept landing
│   ├── BacktestSample.tsx         # Sample visualization
│   ├── WhatIfSection.tsx          # What-if scenarios text
│   └── DrawdownEducation.tsx      # Historical stress test
│
├── SimulatorEntry/
│   ├── SimulatorEntry.tsx         # Entry CTA component
│   ├── SimulatorConceptPage.tsx   # Full concept landing
│   ├── SimulatorMockup.tsx        # Visual mockup
│   └── WaitlistCapture.tsx        # Email capture form
│
└── ValidationChoice/
    └── ValidationChoice.tsx        # Choice between Sim/Advisor
```

#### 2.2.2 Advisor Marketplace Components

```
/src/components/advisors/
├── Marketplace/
│   ├── MarketplaceHome.tsx        # Main browse page
│   ├── AdvisorGrid.tsx            # Grid of advisor cards
│   ├── AdvisorFilters.tsx         # Filter panel
│   └── TenXModelExplainer.tsx     # AI+Human explanation
│
├── AdvisorCard/
│   ├── AdvisorCard.tsx            # Individual card
│   ├── TierBadge.tsx              # Elite/Expert/Emerging
│   ├── VerificationBadges.tsx     # Verification icons
│   ├── PricingDisplay.tsx         # Price + includes
│   └── QuickStats.tsx             # Rating, reviews, sectors
│
├── AdvisorProfile/
│   ├── AdvisorProfile.tsx         # Full profile page
│   ├── TrackRecordChart.tsx       # Performance visualization
│   ├── ExperienceTimeline.tsx     # Career history
│   ├── ReviewsList.tsx            # Client reviews
│   └── ConsultationCTA.tsx        # Coming Soon button
│
└── shared/
    ├── SectorTag.tsx              # Sector pill
    ├── StrategyTag.tsx            # Strategy pill
    └── RatingStars.tsx            # Star rating display
```

---

### 2.3 Screen Specifications

#### 2.3.1 Backtest Home Screen

**Screen ID:** `S11_BACKTEST_HOME`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]              BACKTEST                Coming Soon   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HERO SECTION (40%)                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  "What If You Had Invested 5 Years Ago?"            │   │
│  │  [Sample backtest visualization for current stock]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  FEATURES PREVIEW (30%)                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Features Coming:                                    │   │
│  │  • Custom entry date                                 │   │
│  │  • Risk tolerance overlay                           │   │
│  │  • Dividend reinvestment                            │   │
│  │  • Stock comparison                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  WHAT-IF SCENARIOS (15%)                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Example questions you can explore...               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  CTA SECTION (15%)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [🔔 Notify Me]    [👤 Talk to Advisor]            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Responsive Behavior:**
- Mobile: Single column, hero image scales
- Desktop: Two-column layout possible

---

#### 2.3.2 Advisor Marketplace Screen

**Screen ID:** `S10_ADVISOR_MARKETPLACE`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back]         ADVISOR MARKETPLACE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  10X MODEL EXPLAINER (Collapsible)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  How It Works: AI (3 sec) → Expert (1 hr) → Verdict │   │
│  │  [Learn More ▼]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  FILTERS                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Tier ▼] [Sector ▼] [Strategy ▼] [Price ▼] [Sort ▼]│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  RESULTS: 12 Advisors                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  [Card 1]    [Card 2]    [Card 3]                   │   │
│  │                                                      │   │
│  │  [Card 4]    [Card 5]    [Card 6]                   │   │
│  │                                                      │   │
│  │  [Card 7]    [Card 8]    [Card 9]                   │   │
│  │                                                      │   │
│  │  [Card 10]   [Card 11]   [Card 12]                  │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Grid Specifications:**
- Desktop: 3 columns
- Tablet: 2 columns
- Mobile: 1 column (full-width cards)

---

#### 2.3.3 Advisor Profile Screen

**Screen ID:** `S10B_ADVISOR_PROFILE`

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [← Back to Marketplace]                                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  HEADER                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Photo]  Name, Title                    [Tier Badge]│   │
│  │          Verifications row                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  TRACK RECORD                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Performance Chart]                                 │   │
│  │  Key Metrics: CAGR | Win Rate | Drawdown           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  SPECIALIZATIONS                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Sectors: [Tag] [Tag]                               │   │
│  │  Strategies: [Tag] [Tag]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  EXPERIENCE                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Timeline of previous roles                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  REVIEWS                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Review 1] [Review 2] [Review 3]                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  STICKY CTA                                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ₹12,000 per consultation                           │   │
│  │  [📅 Request Consultation - Coming Soon]           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 2.4 State Management

#### 2.4.1 Validation State

```typescript
interface ValidationState {
  // Simulator waitlist
  simulator: {
    waitlistEmail: string | null;
    waitlistSubmitted: boolean;
  };
  
  // Backtest viewed stocks
  backtest: {
    viewedStocks: string[];    // Stock IDs
    lastViewed: string | null;
  };
  
  // Current context (which stock triggered entry)
  context: {
    fromStock: string | null;
    fromScreen: string | null;
  };
}
```

#### 2.4.2 Advisor State

```typescript
interface AdvisorState {
  // All advisors (mock data)
  advisors: Advisor[];
  
  // Current filters
  filters: AdvisorFilters;
  
  // Filtered results
  filteredAdvisors: Advisor[];
  
  // Selected advisor (for profile view)
  selectedAdvisorId: string | null;
  
  // UI state
  ui: {
    filterPanelOpen: boolean;
    tenXExplainerExpanded: boolean;
    sortDropdownOpen: boolean;
  };
}
```

#### 2.4.3 Actions

```typescript
// Validation Actions
type ValidationAction =
  | { type: 'SET_WAITLIST_EMAIL'; email: string }
  | { type: 'SUBMIT_WAITLIST' }
  | { type: 'VIEW_BACKTEST'; stockId: string }
  | { type: 'SET_CONTEXT'; stock: string; screen: string };

// Advisor Actions  
type AdvisorAction =
  | { type: 'SET_FILTER'; filter: Partial<AdvisorFilters> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SELECT_ADVISOR'; advisorId: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_FILTER_PANEL' }
  | { type: 'TOGGLE_TENX_EXPLAINER' };
```

---

### 2.5 Mock Data Files

#### 2.5.1 Backtest Mock Data

```typescript
// /src/data/backtest/backtestData.ts

export const backtestSamples: Record<string, BacktestSample> = {
  'tcs': {
    stockId: 'tcs',
    stockName: 'TCS',
    backtest: {
      startDate: '2020-01-15',
      startPrice: 2150,
      currentPrice: 4280,
      totalReturn: 99.1,
      benchmarkReturn: 62.0,
      alpha: 37.1,
      events: [
        {
          date: '2020-03-23',
          event: 'COVID Crash Low',
          priceChange: -35,
          recoveryMonths: 8
        },
        {
          date: '2021-10-18',
          event: 'All-Time High',
          priceChange: 89,
          recoveryMonths: 0
        }
      ]
    },
    drawdowns: [
      {
        eventName: 'COVID Crash',
        date: 'Mar 2020',
        maxDrawdown: -35,
        recoveryMonths: 8,
        description: 'Global pandemic selloff'
      },
      {
        eventName: 'IL&FS Crisis',
        date: 'Sep 2018',
        maxDrawdown: -18,
        recoveryMonths: 4,
        description: 'Domestic financial sector stress'
      },
      {
        eventName: 'Demonetization',
        date: 'Nov 2016',
        maxDrawdown: -12,
        recoveryMonths: 2,
        description: 'Currency reform uncertainty'
      }
    ]
  },
  
  'axis-bank': {
    stockId: 'axis-bank',
    stockName: 'Axis Bank',
    backtest: {
      startDate: '2020-01-15',
      startPrice: 745,
      currentPrice: 1180,
      totalReturn: 58.4,
      benchmarkReturn: 62.0,
      alpha: -3.6,
      events: [
        {
          date: '2020-03-23',
          event: 'COVID + Yes Bank Crisis',
          priceChange: -52,
          recoveryMonths: 14
        }
      ]
    },
    drawdowns: [
      {
        eventName: 'COVID + Yes Bank',
        date: 'Mar 2020',
        maxDrawdown: -52,
        recoveryMonths: 14,
        description: 'Double whammy: pandemic + banking sector fears'
      },
      {
        eventName: 'IL&FS Crisis',
        date: 'Sep 2018',
        maxDrawdown: -28,
        recoveryMonths: 6,
        description: 'NBFC sector stress spillover'
      }
    ]
  },
  
  'eternal': {
    stockId: 'eternal',
    stockName: 'Eternal (Zomato)',
    backtest: {
      startDate: '2021-07-23',  // IPO date
      startPrice: 116,
      currentPrice: 245,
      totalReturn: 111.2,
      benchmarkReturn: 28.0,
      alpha: 83.2,
      events: [
        {
          date: '2022-07-15',
          event: 'Tech Selloff Low',
          priceChange: -65,
          recoveryMonths: 18
        },
        {
          date: '2024-01-15',
          event: 'Profitability Milestone',
          priceChange: 45,
          recoveryMonths: 0
        }
      ]
    },
    drawdowns: [
      {
        eventName: 'Tech Selloff 2022',
        date: 'Jul 2022',
        maxDrawdown: -65,
        recoveryMonths: 18,
        description: 'Global tech valuation reset'
      },
      {
        eventName: 'Quick Commerce Wars',
        date: 'Oct 2023',
        maxDrawdown: -38,
        recoveryMonths: 6,
        description: 'Competition concerns from Blinkit rivals'
      }
    ]
  }
};
```

#### 2.5.2 Advisor Mock Data

```typescript
// /src/data/advisors/advisorData.ts

export const advisors: Advisor[] = [
  {
    id: 'adv-001',
    name: 'Rahul Sharma',
    photo: '/advisors/rahul-sharma.jpg',
    title: 'Senior Investment Advisor',
    tier: 'elite',
    tierBadge: '🏆',
    verifications: {
      sebiRegistered: true,
      sebiNumber: 'INH000001234',
      aumVerified: true,
      aumAmount: 850,
      performanceVerified: true,
      backgroundChecked: true
    },
    experience: {
      years: 18,
      previousRoles: [
        'VP - Research, HDFC Securities (2015-2022)',
        'Senior Analyst, Motilal Oswal (2010-2015)',
        'Research Associate, ICICI Direct (2006-2010)'
      ],
      certifications: ['CFA', 'FRM']
    },
    specializations: {
      sectors: ['Banking & Finance', 'Infrastructure'],
      strategies: ['Value Investing', 'Large Cap Quality']
    },
    trackRecord: {
      cagr: 18.4,
      winRate: 72,
      avgHoldingMonths: 14,
      maxDrawdown: -22,
      benchmarkCagr: 12.1
    },
    reviews: {
      averageRating: 4.8,
      totalReviews: 47,
      sampleReviews: [
        {
          reviewerName: 'Amit',
          rating: 5,
          comment: 'Rahul\'s analysis of HDFC Bank was incredibly thorough. He identified risks I had completely missed.',
          date: '2024-11-15'
        },
        {
          reviewerName: 'Priya',
          rating: 5,
          comment: 'Very patient in explaining complex concepts. Worth every rupee.',
          date: '2024-10-22'
        },
        {
          reviewerName: 'Vikram',
          rating: 4,
          comment: 'Great insights on banking sector. Would recommend for financial stocks.',
          date: '2024-09-18'
        }
      ]
    },
    pricing: {
      perConsultation: 12000,
      includes: [
        'AI pre-analysis review',
        '60-minute expert consultation',
        'Written verdict & detailed reasoning',
        '14-day follow-up support'
      ],
      followUpDays: 14
    }
  },
  
  // ... (11 more advisors with similar structure)
  // Abbreviated for document length - full data in implementation
  
  {
    id: 'adv-012',
    name: 'Sunita Verma',
    photo: '/advisors/sunita-verma.jpg',
    title: 'Investment Advisor',
    tier: 'emerging',
    tierBadge: '🌟',
    verifications: {
      sebiRegistered: true,
      sebiNumber: 'INH000009876',
      aumVerified: true,
      aumAmount: 22,
      performanceVerified: true,
      backgroundChecked: true
    },
    experience: {
      years: 3,
      previousRoles: [
        'Research Analyst, Angel One (2021-2024)',
        'Equity Research Intern, Kotak (2020-2021)'
      ],
      certifications: ['NISM Series VIII']
    },
    specializations: {
      sectors: ['Multi-sector', 'Consumer'],
      strategies: ['Growth Investing', 'Small & Mid Cap']
    },
    trackRecord: {
      cagr: 15.2,
      winRate: 64,
      avgHoldingMonths: 8,
      maxDrawdown: -28,
      benchmarkCagr: 12.1
    },
    reviews: {
      averageRating: 4.1,
      totalReviews: 12,
      sampleReviews: [
        {
          reviewerName: 'Karan',
          rating: 4,
          comment: 'Good for beginners. Explains things clearly at an affordable price.',
          date: '2024-12-01'
        }
      ]
    },
    pricing: {
      perConsultation: 500,
      includes: [
        'AI pre-analysis review',
        '30-minute consultation',
        'Written verdict',
        '3-day follow-up support'
      ],
      followUpDays: 3
    }
  }
];
```

---

### 2.6 Routing Configuration

```typescript
// /src/routes/validationRoutes.ts

export const validationRoutes = [
  {
    path: '/backtest',
    component: 'BacktestConceptPage',
    title: 'Backtest Engine',
    params: {
      stockId: 'optional'  // If coming from specific stock
    }
  },
  {
    path: '/simulator',
    component: 'SimulatorConceptPage',
    title: 'Forward-Testing Simulator'
  },
  {
    path: '/advisors',
    component: 'MarketplaceHome',
    title: 'Advisor Marketplace'
  },
  {
    path: '/advisors/:advisorId',
    component: 'AdvisorProfile',
    title: 'Advisor Profile',
    params: {
      advisorId: 'required'
    }
  }
];
```

---

### 2.7 Integration Points

#### 2.7.1 Entry Points from Other Screens

**Stock Analysis Screen Integration:**

```typescript
// In StockAnalysis.tsx

// Add validation section at bottom of analysis
<ValidationEntrySection 
  stockId={currentStock.id}
  stockName={currentStock.name}
  userProfile={currentProfile}
/>

// ValidationEntrySection.tsx
const ValidationEntrySection: React.FC<Props> = ({ stockId, stockName, userProfile }) => {
  return (
    <div className="validation-entry-section">
      <h3>Want to validate your thesis?</h3>
      <div className="validation-options">
        <Link to={`/simulator?stock=${stockId}`} className="validation-card coming-soon">
          <Icon name="chart-line" />
          <span>Test with Virtual Money</span>
          <Badge>Coming Soon</Badge>
        </Link>
        <Link to="/advisors" className="validation-card">
          <Icon name="user-expert" />
          <span>Consult an Expert</span>
          <Badge variant="active">Browse Advisors</Badge>
        </Link>
      </div>
    </div>
  );
};
```

**Dashboard Navigation Integration:**

```typescript
// In Navigation.tsx

const navigationItems = [
  { path: '/dashboard', label: 'Home', icon: 'home' },
  { path: '/discover', label: 'Discover', icon: 'compass' },
  { path: '/journal', label: 'Journal', icon: 'book' },
  { path: '/portfolio', label: 'Portfolio', icon: 'briefcase' },
  { path: '/advisors', label: 'Advisors', icon: 'users' },  // NEW
  { path: '/alerts', label: 'Alerts', icon: 'bell' },
  { path: '/profile', label: 'Profile', icon: 'user' }
];
```

---

### 2.8 Acceptance Criteria Summary

#### Backtest & Simulation Features

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| H1 | Forward-Testing Simulator | Entry CTA visible on Stock Analysis; Concept page loads; "Coming Soon" badge shown; Email capture functional |
| H2 | Backtesting Engine | Entry link in Analysis actions; Sample visualization renders; Stock-specific data shown; Alternative path to Advisors |
| H4 | What-If Scenarios | Text section visible on Backtest page; Example scenarios listed; No interaction required |
| H5 | Historical Drawdown | Drawdown section in Stock Analysis; 2-3 events per stock; Recovery timeline shown; Profile-aware note |

#### Advisor Marketplace Features

| ID | Feature | Acceptance Criteria |
|----|---------|---------------------|
| I1 | Marketplace Browse | Page loads with all 12 advisors; Grid layout responsive; Cards display key info |
| I2 | 3-Tier System | Tier badges color-coded; Filter by tier works; Tier explanation accessible |
| I3 | Specialization Filters | Multi-select for sectors/strategies; Filter count updates; Clear All works |
| I4 | AI+Human Concept | Explanation on Marketplace home; Comparison clear; Value prop prominent |
| I5 | Verified Credentials | Badges visible on cards; Verification details on hover/tap |
| I6 | Track Record | Performance metrics on profile; Chart renders; Benchmark comparison shown |
| I8 | Pricing Display | Price on every card; "Includes" list visible; Price filter works |

---

### 2.9 Testing Scenarios

#### 2.9.1 Backtest Flow

```
Test Case: BT-001 - Backtest Entry from Stock Analysis
Given: User is on TCS Stock Analysis screen
When: User clicks "How would this have performed?" link
Then: Backtest concept page loads
And: TCS-specific sample data is shown
And: "Coming Soon" badge is visible
And: "Notify Me" and "Talk to Advisor" CTAs are functional
```

```
Test Case: BT-002 - Drawdown Education Display
Given: User is viewing TCS Stock Analysis
When: User scrolls to Historical Stress Test section
Then: COVID, IL&FS, Demonetization events are shown
And: Each event shows drawdown % and recovery months
And: Profile-aware note shows risk tolerance comparison
```

#### 2.9.2 Advisor Marketplace Flow

```
Test Case: ADV-001 - Browse All Advisors
Given: User navigates to Advisor Marketplace
When: Page loads
Then: 12 advisor cards are displayed
And: Grid layout is 3-column on desktop
And: 10x Model explainer is visible
And: All filter dropdowns are functional
```

```
Test Case: ADV-002 - Filter by Tier
Given: User is on Advisor Marketplace
When: User selects "Elite" tier filter
Then: Only 3 Elite advisors are shown
And: Result count updates to "3 Advisors"
And: All visible cards show 🏆 Elite badge
```

```
Test Case: ADV-003 - View Advisor Profile
Given: User is on Advisor Marketplace
When: User clicks "View Profile" on Rahul Sharma card
Then: Full profile page loads
And: All verifications are displayed
And: Track record chart renders
And: Reviews section shows 3 sample reviews
And: Sticky CTA shows "₹12,000" and "Coming Soon" button
```

```
Test Case: ADV-004 - Multi-Filter Combination
Given: User is on Advisor Marketplace
When: User selects Tier: Expert AND Sector: Banking AND Price: ₹3K-8K
Then: Filtered results show matching advisors only
And: Active filter tags are visible
And: "Clear All" button appears
```

---

## Part 3: Implementation Notes

### 3.1 Development Priority

| Priority | Component | Rationale |
|----------|-----------|-----------|
| P1 | Advisor Marketplace Browse | Primary validation path for demo |
| P1 | Advisor Cards + Profile | Core marketplace functionality |
| P2 | Backtest Concept Page | Secondary validation path |
| P2 | Drawdown Education | Integrated in Stock Analysis |
| P3 | Simulator Concept Page | Tertiary, Coming Soon focus |
| P3 | Filter System | Enhancement for marketplace |

### 3.2 Demo Script Considerations

**Recommended Demo Flow for Validation:**

1. Complete stock analysis (Phase 1)
2. Show "Validate Your Thesis" section at bottom
3. Click "Consult an Expert" → Marketplace
4. Browse advisors, show tier badges
5. Click into Rahul Sharma profile (Elite)
6. Show verification badges, track record
7. Note "Coming Soon" on consultation CTA
8. Return via "Test with Virtual Money" → Simulator concept
9. Show backtest sample, "Notify Me" capture

### 3.3 Future Implementation Notes

When implementing full functionality post-MLP:

1. **Simulator**: Integrate with real-time price feeds, build paper trading engine
2. **Backtest**: Calculate actual historical returns with dividends, splits adjusted
3. **Advisor Booking**: Calendly integration or custom scheduling
4. **Payments**: Razorpay/Stripe for consultation fees
5. **Video Calls**: Zoom/Google Meet integration for consultations

---

## Appendices

### Appendix A: Advisor Photo Placeholders

For demo, use professional headshot placeholders from:
- UI Faces (uifaces.co)
- Generated Photos (generated.photos)
- Ensure diversity in age, gender representation

### Appendix B: Track Record Chart Specification

Simple bar chart comparing:
- Advisor yearly returns (green bars)
- Nifty yearly returns (grey bars)
- 5-year view: 2020, 2021, 2022, 2023, 2024

Use Recharts or similar for implementation.

### Appendix C: Coming Soon Badge Styling

```css
.badge-coming-soon {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

**Document Version:** 1.0  
**Last Updated:** January 15, 2025  
**Status:** Ready for Development  
**Cluster:** VAL (Validation Entry) - Final Cluster

---

*This completes the PRD + Technical Specification for all 7 clusters of the StockFox MLP Prototype.*
