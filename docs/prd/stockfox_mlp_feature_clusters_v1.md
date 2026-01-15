# StockFox MLP Prototype - Feature Clustering & Analysis

**Version:** 1.0  
**Date:** January 15, 2025  
**Purpose:** Map 110 features to build clusters for functional prototype demo

---

## Demo Specifications (Confirmed)

### User Profiles for Demo
| Profile | Persona Base | Investment Style | Risk | Horizon | Key Differentiator |
|---------|--------------|------------------|------|---------|-------------------|
| **Profile A** | Analytical Ankit | Growth | Moderate | 3-5 years | Speed + Efficiency focus |
| **Profile B** | Skeptical Sneha | Value | Conservative | 5+ years | Evidence + Verification focus |
| **Profile C** | Curious Kavya | Learning/Agnostic | Moderate | 3-5 years | Education + Understanding focus |

### Demo Stocks
1. **Eternal (Zomato)** - New economy, volatile, polarizing opinions
2. **Axis Bank** - Traditional sector, stable, well-understood
3. **TCS** - Blue chip IT, benchmark quality

### Simulated History
- **Depth:** 6 months of pre-populated user activity
- **Includes:** Journal entries, pattern detection, portfolio context

### Phase 3 Scope
- **Advisor Marketplace:** Browse view (not full flow)
- **Backtesting:** Home screen only (entry point)

### Competitive Approach
- No explicit comparison - experience demonstrates differentiation

---

## Cluster Definitions

| Cluster | Code | Description | Demo Priority |
|---------|------|-------------|---------------|
| **Core Value Prop** | CVP | Features that directly demonstrate 5 pillars | MUST HAVE |
| **UX/UI Layer** | UX | Presentation & interface elements | MUST HAVE |
| **Infrastructure** | INFRA | Backend/data enabling features | BUILD (hidden) |
| **Personalization** | PERS | User profile-dependent features | MUST HAVE |
| **Learning Loop** | LEARN | Education & skill development | SHOULD HAVE |
| **Engagement Hooks** | ENG | Alerts, discovery, retention | SHOW CONCEPT |
| **Validation Entry** | VAL | Phase 3 entry points | ENTRY ONLY |
| **Out of Scope** | OOS | Not needed for MLP demo | DEFER |

---

## Feature-by-Feature Cluster Mapping

### Category A: Stock Analysis & Research Engine (14 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| A1 | 11-Segment DFY Analysis | CVP | ✅ YES | Core differentiator - must show all 11 segments |
| A2 | 200+ Metrics Coverage | CVP | ✅ YES | Show depth within segments |
| A3 | 3-Layer Scoring Architecture | CVP | ✅ YES | Metric → Segment → Verdict flow visible |
| A4 | Overall Score + Verdict | CVP | ✅ YES | Hero output - "8.2/10 - STRONG BUY" |
| A5 | Peer Ranking System | CVP | ✅ YES | "#2 of 15 Banking Stocks" |
| A6 | Sector-Relative Interpretation | CVP | ✅ YES | "ROE 18% vs Sector Avg 14%" |
| A7 | Historical Trajectory | CVP | ✅ YES | 5-year trend lines in progressive disclosure |
| A8 | Evidence Citations (94%) | CVP | ✅ YES | Every claim shows source |
| A9 | 3-Level Evidence Drill-Down | UX | ✅ YES | Click-through to see citation chain |
| A10 | Real-Time Data Integration | INFRA | 🔸 MOCK | Use static mock data, label "5-min delay" |
| A11 | Red Flag Identification | CVP | ✅ YES | Critical - show warnings prominently |
| A12 | Stock Comparison (Side-by-Side) | CVP | ✅ YES | Compare Axis vs HDFC Bank |
| A13 | Sector-Specific Frameworks | INFRA | 🔸 IMPLICIT | Different weights for Banking vs IT - not shown explicitly |
| A14 | Progressive Disclosure Scorecard | UX | ✅ YES | Expand/collapse UI pattern |

**Category A Summary:**
- CVP: 10 features (all essential for demo)
- UX: 2 features (essential)
- INFRA: 2 features (mock/implicit)

---

### Category B: Personalization Engine (11 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| B1 | 6D Personalization Engine | PERS | ✅ YES | Core - powers different verdicts |
| B2 | Investment Thesis Profiles | PERS | ✅ YES | Growth vs Value vs Agnostic shown |
| B3 | Risk Tolerance Calibration | PERS | ✅ YES | Conservative vs Moderate impact on verdict |
| B4 | Time Horizon Alignment | PERS | ✅ YES | 3-5yr vs 5+yr changes recommendations |
| B5 | Experience Level Adaptation | PERS | ✅ YES | Beginner gets simpler explanations |
| B6 | Sector Preference Filtering | PERS | 🔸 OPTIONAL | Could show but not critical |
| B7 | Portfolio Context Awareness | PERS | ✅ YES | "You're 40% in Banking already" |
| B8 | Adaptive Complexity Explainers | UX | ✅ YES | Same metric, different explanation depth |
| B9 | Learning Pattern Recognition | LEARN | ✅ YES | "You favor profitable growers" - show after 6mo history |
| B10 | Position Sizing Guidance | PERS | ✅ YES | "Suggest 8-10% allocation" |
| B11 | Entry Timing Guidance | PERS | 🔸 OPTIONAL | Could include, not critical |

**Category B Summary:**
- PERS: 8 features (essential for "same stock, different verdict")
- UX: 1 feature (essential)
- LEARN: 1 feature (essential for Phase 2)
- OPTIONAL: 2 features

---

### Category C: Customization & Templates (6 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| C1 | Personalization Presets | UX | 🔸 OPTIONAL | "Quick Start: Value Investor" - nice to have |
| C2 | DIY ↔ DFY Toggle | UX | ✅ YES | Shows user control |
| C3 | Custom Scorecard Builder | OOS | ❌ NO | Advanced feature, defer |
| C4 | UGC Framework Marketplace | OOS | ❌ NO | Requires user scale |
| C5 | Custom Parameter Alerts | ENG | 🔸 CONCEPT | Show UI, not functional |
| C6 | Metric-by-Metric Learning Mode | LEARN | ✅ YES | Differentiator - guided analysis flow |

**Category C Summary:**
- UX: 1-2 features
- LEARN: 1 feature (differentiator)
- OOS: 2 features
- OPTIONAL/CONCEPT: 2 features

---

### Category D: AI Assistant & Chat (5 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| D1 | RAG-Based AI Assistant | CVP | ✅ YES | Chat interface - key demo moment |
| D2 | Stock-Specific Q&A | CVP | ✅ YES | "Why is Zomato's profitability score low?" |
| D3 | Verified Signal Queries | CVP | ✅ YES | "What's the latest on Zomato earnings?" |
| D4 | No Hallucinations Architecture | INFRA | 🔸 IMPLICIT | Claim in marketing, not shown |
| D5 | Interactive Learning via Chat | LEARN | ✅ YES | "Explain ROE in simple terms" |

**Category D Summary:**
- CVP: 3 features (essential)
- LEARN: 1 feature (essential)
- INFRA: 1 feature (implicit)

---

### Category E: Learning & Education (9 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| E1 | Contextual Learning (Hover) | LEARN | ✅ YES | Tooltips on every metric |
| E2 | Analysis Journal - Auto-Logging | LEARN | ✅ YES | Core Phase 2 feature |
| E3 | Journal System-Prompted Feedback | LEARN | ✅ YES | Post-analysis "What's your takeaway?" |
| E4 | Highlight-to-Note | LEARN | 🔸 OPTIONAL | Nice UX, not critical |
| E5 | Decision Logging | LEARN | ✅ YES | User records their verdict |
| E6 | Outcome Tracking | LEARN | ✅ YES | "You bought at ₹120, now ₹145" |
| E7 | Blind Spot Detection | LEARN | ✅ YES | "You checked profitability 5/5, debt only 2/5" |
| E8 | Progressive Skill Development | LEARN | 🔸 CONCEPT | Show level badge, not full gamification |
| E9 | Pattern Recognition Feedback | LEARN | ✅ YES | "You favor profitable growers" |

**Category E Summary:**
- LEARN: 9 features (7 essential, 2 optional/concept)
- This is Phase 2 core - all should be represented

---

### Category F: Alerts & Monitoring (8 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| F1 | Smart Alerts (Customizable) | ENG | 🔸 CONCEPT | Show alert settings UI |
| F2 | Score Drop Alerts | ENG | ✅ YES | Show notification example |
| F3 | Peer Rank Change Alerts | ENG | 🔸 CONCEPT | Mention in alert list |
| F4 | Quarterly Earnings Alerts | ENG | 🔸 CONCEPT | Calendar-based, show UI |
| F5 | Portfolio Concentration Alerts | ENG | ✅ YES | "75% in Banking - Consider diversifying" |
| F6 | Thesis-Breaking Event Alerts | ENG | ✅ YES | Key differentiator alert |
| F7 | News & Event Integration | ENG | 🔸 CONCEPT | Show news feed section |
| F8 | WhatsApp Alerts | OOS | ❌ NO | Channel feature, defer |

**Category F Summary:**
- ENG: 7 features (3 essential, 4 concept-level)
- OOS: 1 feature
- Show alert concepts, don't need full functionality

---

### Category G: Portfolio Features (8 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| G1 | Portfolio Sync (Demat Connection) | INFRA | 🔸 MOCK | Simulate connected portfolio |
| G2 | Portfolio Health Check | CVP | ✅ YES | Overall portfolio scorecard |
| G3 | Concentration Risk Analysis | CVP | ✅ YES | Sector allocation pie chart |
| G4 | Rebalancing Recommendations | CVP | 🔸 OPTIONAL | "Consider adding IT exposure" |
| G5 | Position Tracking | LEARN | ✅ YES | Entry price, current value, P&L |
| G6 | Bulk Analysis | OOS | ❌ NO | Power feature, defer |
| G7 | Watchlist Management | UX | ✅ YES | Core navigation element |
| G8 | Portfolio-Aware Suggestions | PERS | ✅ YES | "Top IT stocks to diversify from Banking" |

**Category G Summary:**
- CVP: 2-3 features (essential)
- PERS: 1 feature (essential)
- UX: 1 feature (essential)
- LEARN: 1 feature (essential)
- INFRA: 1 feature (mock)
- OOS: 1 feature

---

### Category H: Validation & Simulation (5 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| H1 | Forward-Testing Simulator | VAL | 🔸 ENTRY | Show concept, not full simulator |
| H2 | Backtesting Engine | VAL | 🔸 ENTRY | Home screen only per spec |
| H3 | Personalized Backtest Results | VAL | ❌ NO | Part of full backtest flow |
| H4 | What-If Scenarios | VAL | 🔸 ENTRY | Could show as backtest variant |
| H5 | Historical Drawdown Education | LEARN | 🔸 OPTIONAL | "Worst crash: -35% in COVID" |

**Category H Summary:**
- VAL: 4 features (entry points only)
- LEARN: 1 feature (optional)
- Per spec: Just show entry points, not full flows

---

### Category I: Human Advisory Marketplace (10 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| I1 | SEBI-Registered Advisor Marketplace | VAL | ✅ YES | Browse view per spec |
| I2 | 3-Tier Advisor System | VAL | ✅ YES | Show Elite/Expert/Emerging badges |
| I3 | Advisor Specialization Filters | VAL | ✅ YES | Filter by sector, strategy |
| I4 | AI Pre-Analysis + Human Review | VAL | 🔸 CONCEPT | Explain the 10x efficiency model |
| I5 | Verified Credentials & AUM | VAL | ✅ YES | Show verification badges |
| I6 | Track Record Display | VAL | ✅ YES | Performance metrics visible |
| I7 | AI vs Human Variance Tracking | OOS | ❌ NO | Requires historical data |
| I8 | Pay-Per-Consultation | VAL | 🔸 CONCEPT | Show pricing, no checkout |
| I9 | Consultation Bundles | OOS | ❌ NO | Pricing variant, defer |
| I10 | Subscription Options | OOS | ❌ NO | Pricing variant, defer |

**Category I Summary:**
- VAL: 6 features (browse marketplace)
- OOS: 3 features
- Per spec: Browse view with advisor cards, filters, no purchase flow

---

### Category J: Discovery (9 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| J1 | Unified Discovery Section | UX | ✅ YES | Tab-based discovery hub |
| J2 | Trending Stocks | ENG | ✅ YES | "Most analyzed this week" |
| J3 | Top Rated by Sector | ENG | ✅ YES | Leaderboard view |
| J4 | Score Movers | ENG | 🔸 OPTIONAL | "Biggest score changes" |
| J5 | For You (Personalized) | PERS | ✅ YES | Pattern-based suggestions |
| J6 | DIY Screener | OOS | ❌ NO | Power feature, defer |
| J7 | Custom Screener Templates | OOS | ❌ NO | Power feature, defer |
| J8 | IPO Analysis | ENG | 🔸 OPTIONAL | If timing aligns with demo |
| J9 | Community Signals | ENG | 🔸 CONCEPT | "1,247 users analyzed, 78% highlighted profitability" |

**Category J Summary:**
- UX: 1 feature (essential)
- ENG: 5 features (3 essential, 2 optional/concept)
- PERS: 1 feature (essential)
- OOS: 2 features

---

### Category K: Social & Sharing (3 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| K1 | Analysis Sharing | UX | 🔸 OPTIONAL | Share button, not critical |
| K2 | Export Reports | UX | 🔸 OPTIONAL | PDF export, nice to have |
| K3 | Telegram Community Integration | OOS | ❌ NO | External integration |

**Category K Summary:**
- UX: 2 features (optional)
- OOS: 1 feature

---

### Category L: Transaction & Execution (7 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| L1 | One-Click Buy/Sell | OOS | ❌ NO | Future phase |
| L2 | Broker Integration | OOS | ❌ NO | Future phase |
| L3 | MF Distribution | OOS | ❌ NO | Future phase |
| L4 | Basket Investments | OOS | ❌ NO | Future phase |
| L5 | ETF Investments | OOS | ❌ NO | Future phase |
| L6 | Gold Investments | OOS | ❌ NO | Future phase |
| L7 | Loans Against MF/Gold | OOS | ❌ NO | Future phase |

**Category L Summary:**
- OOS: All 7 features
- Transaction layer is Phase 3+, not needed for MLP demo

---

### Category M: Mutual Funds Module (4 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| M1 | MF Analysis | OOS | ❌ NO | Asset class expansion |
| M2 | Fund Health Scoring | OOS | ❌ NO | Asset class expansion |
| M3 | Portfolio Construction Guidance | OOS | ❌ NO | Asset class expansion |
| M4 | MF Screener | OOS | ❌ NO | Asset class expansion |

**Category M Summary:**
- OOS: All 4 features
- MF is future scope, equity focus for MLP

---

### Category N: Platform & UX (5 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| N1 | Mobile App (iOS + Android) | UX | ✅ YES | Primary demo platform |
| N2 | Web Platform | UX | 🔸 OPTIONAL | Could demo either |
| N3 | Vernacular Support | OOS | ❌ NO | Localization is future |
| N4 | Plain English Explanations | UX | ✅ YES | Core UX principle throughout |
| N5 | Guided Onboarding | UX | ✅ YES | Profile setup flow |

**Category N Summary:**
- UX: 4 features (3 essential, 1 optional)
- OOS: 1 feature

---

### Category O: Monetization & Pricing (6 features)

| ID | Feature | Cluster | MLP Essential? | Demo Notes |
|----|---------|---------|----------------|------------|
| O1 | Free Tier (3 Stocks) | UX | 🔸 CONCEPT | Mention in onboarding |
| O2 | Per-Stock Pricing | UX | 🔸 CONCEPT | Show pricing UI |
| O3 | Monthly Subscription | OOS | ❌ NO | Business model, not demo |
| O4 | Annual Subscription | OOS | ❌ NO | Business model, not demo |
| O5 | Stock Bundles | OOS | ❌ NO | Business model, not demo |
| O6 | Advisory Credits | OOS | ❌ NO | Business model, not demo |

**Category O Summary:**
- UX: 2 features (concept level)
- OOS: 4 features
- Monetization is business layer, not UX demo focus

---

## Cluster Summary

### MLP Essential Features by Cluster

| Cluster | Essential Count | Total in Cluster | Key Features |
|---------|-----------------|------------------|--------------|
| **CVP (Core Value Prop)** | 14 | 14 | Scorecard, 11 segments, citations, peer ranking, AI chat |
| **PERS (Personalization)** | 10 | 11 | 6D engine, thesis profiles, risk calibration, portfolio awareness |
| **LEARN (Learning)** | 12 | 14 | Journal, pattern detection, blind spots, contextual learning |
| **UX (Interface)** | 10 | 15 | Progressive disclosure, onboarding, discovery hub |
| **ENG (Engagement)** | 6 | 12 | Key alerts, discovery tabs (concept level) |
| **VAL (Validation)** | 6 | 8 | Advisor browse, backtest entry |
| **INFRA (Backend)** | 3 | 5 | Mock data, sector frameworks |
| **OOS (Out of Scope)** | 0 | 31 | Transaction, MF, vernacular, pricing |

### Total Feature Count for MLP

| Category | Essential | Optional/Concept | Out of Scope |
|----------|-----------|------------------|--------------|
| Must Build | **52** | - | - |
| Should Show | - | **18** | - |
| Defer | - | - | **31** |
| **TOTAL** | 52 | 18 | 31 |

---

## Next Steps

1. **Validate Clustering** - Review and adjust feature assignments
2. **Define Demo Screens** - Map essential features to specific screens/flows
3. **Create User Journey Flow** - Sequence for investor demo walkthrough
4. **Identify Dependencies** - What must be built first
5. **Draft PRD** - Feature specifications for prototype development

---

## Open Questions for Discussion

### Clustering Refinements
1. Should C6 (Metric-by-Metric Learning Mode) be in MLP or deferred?
2. Is E7 (Blind Spot Detection) critical for 6-month simulated history?
3. Should we show G4 (Rebalancing Recommendations) or keep portfolio simpler?

### Demo Flow Questions
1. What's the ideal sequence for showing 3 different user profiles?
2. Should each profile analyze the same stock or different stocks?
3. How do we transition between Phase 1 → Phase 2 in the demo narrative?

### Technical Questions
1. Is vibe-coding the UI sufficient, or do we need actual AI responses?
2. Should mock data be fully realistic or can it be simplified?
3. What's the fidelity level needed - pixel-perfect or functional wireframe?

---

*Document ready for review and iteration*
