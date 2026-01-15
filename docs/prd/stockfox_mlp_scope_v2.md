# StockFox MLP Prototype - Consolidated Scope & PRD Preparation

**Version:** 2.0  
**Date:** January 15, 2025  
**Status:** Ready for PRD Development

---

## Part 1: Confirmed Specifications

### Platform & Technical Approach
| Specification | Decision |
|---------------|----------|
| Platform | Web App only |
| Build Approach | Vibe-coded using Claude Code |
| AI Responses | Mock/hardcoded (realistic) |
| Data | Realistic mock data |
| Interactivity | Fully interactive, user-driven flow |
| Deliverable | PRD & Spec → You code |

### Demo Stocks
| Stock | Sector | Why Selected |
|-------|--------|--------------|
| Eternal (Zomato) | New Economy / Food Tech | Volatile, polarizing, growth vs profitability tension |
| Axis Bank | Banking / Financial Services | Traditional, stable, well-understood metrics |
| TCS | IT Services | Blue chip benchmark, quality reference |

### User Profiles for Personalization Demo
| Profile ID | Name | Thesis | Risk | Horizon | Experience | Demo Purpose |
|------------|------|--------|------|---------|------------|--------------|
| Profile A | Analytical Ankit | Growth | Moderate | 3-5 years | Intermediate | Speed + efficiency focus |
| Profile B | Skeptical Sneha | Value | Conservative | 5+ years | Advanced | Evidence + verification focus |
| Profile C | Curious Kavya | Agnostic/Learning | Moderate | 3-5 years | Beginner | Education + understanding focus |

### Demo Data Matrix
**9 Combinations Required:**

| Stock | Profile A (Growth) | Profile B (Value) | Profile C (Beginner) |
|-------|-------------------|-------------------|----------------------|
| Eternal (Zomato) | Verdict + Full Analysis | Verdict + Full Analysis | Verdict + Full Analysis |
| Axis Bank | Verdict + Full Analysis | Verdict + Full Analysis | Verdict + Full Analysis |
| TCS | Verdict + Full Analysis | Verdict + Full Analysis | Verdict + Full Analysis |

### Simulated User History
| Element | Specification |
|---------|---------------|
| History Depth | 6 months |
| Journal Entries | Pre-populated for each profile |
| Pattern Detection | Active ("You favor profitable growers") |
| Portfolio Context | Simulated holdings per profile |
| Blind Spot Data | Tracked across simulated analyses |

### Journey Coverage
| Phase | Coverage Level | What to Show |
|-------|----------------|--------------|
| Phase 1: Discovery | Full | Complete stock analysis flow |
| Phase 2: Confidence Building | Full (Simulated) | Journal, patterns, portfolio alerts |
| Phase 3: Validation | Entry Points Only | Advisor browse, Backtest home screen |

---

## Part 2: Final MLP Feature List

### Cluster: CORE VALUE PROP (CVP) - 14 Features ✅ ALL ESSENTIAL

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| A1 | 11-Segment DFY Analysis | Show all 11 segments with scores |
| A2 | 200+ Metrics Coverage | Metrics within each segment (you'll provide list) |
| A3 | 3-Layer Scoring Architecture | Visible: Metric → Segment → Overall |
| A4 | Overall Score + Verdict | Hero element: "8.2/10 - STRONG BUY" |
| A5 | Peer Ranking System | "#2 of 15 Banking Stocks" |
| A6 | Sector-Relative Interpretation | "ROE 18% vs Sector Avg 14% ✅" |
| A7 | Historical Trajectory | 5-year trend sparklines |
| A8 | Evidence Citations (94%) | Every claim shows [Source] link |
| A9 | 3-Level Evidence Drill-Down | Click to expand citation chain |
| A11 | Red Flag Identification | Warning badges prominently shown |
| A12 | Stock Comparison (Side-by-Side) | Compare any 2 stocks |
| D1 | RAG-Based AI Assistant | Chat interface with stock Q&A |
| D2 | Stock-Specific Q&A | "Why is profitability score low?" |
| D3 | Verified Signal Queries | "Latest news on Zomato?" |

### Cluster: PERSONALIZATION (PERS) - 11 Features ✅ ALL ESSENTIAL

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| B1 | 6D Personalization Engine | Powers different verdicts per profile |
| B2 | Investment Thesis Profiles | Growth / Value / Agnostic selection |
| B3 | Risk Tolerance Calibration | Conservative / Moderate / Aggressive |
| B4 | Time Horizon Alignment | Short / Medium / Long impact on verdict |
| B5 | Experience Level Adaptation | Beginner gets simpler explanations |
| B6 | Sector Preference Filtering | Optional filter in profile |
| B7 | Portfolio Context Awareness | "You're 40% in Banking already" |
| B8 | Adaptive Complexity Explainers | Same metric, different depth per profile |
| B10 | Position Sizing Guidance | "Suggest 8-10% allocation" |
| B11 | Entry Timing Guidance | "Current P/E vs historical suggests..." |
| J5 | For You (Personalized Discovery) | "Stocks matching YOUR patterns" |
| G8 | Portfolio-Aware Suggestions | "Top IT stocks to diversify" |

### Cluster: LEARNING & EDUCATION (LEARN) - 14 Features ✅ ALL ESSENTIAL

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| C6 | Metric-by-Metric Learning Mode | Guided step-by-step analysis option |
| E1 | Contextual Learning (Hover) | Tooltips on every metric |
| E2 | Analysis Journal - Auto-Logging | Timestamped analysis history |
| E3 | Journal System-Prompted Feedback | Post-analysis "What's your takeaway?" |
| E4 | Highlight-to-Note | Long-press to add note |
| E5 | Decision Logging | User records: Buy/Hold/Avoid |
| E6 | Outcome Tracking | "Bought at ₹120, now ₹145 (+21%)" |
| E7 | Blind Spot Detection | "Profitability 5/5, Debt 2/5" |
| E8 | Progressive Skill Development | Level badge shown |
| E9 | Pattern Recognition Feedback | "You favor profitable growers" |
| B9 | Learning Pattern Recognition | Emerging thesis detection |
| D5 | Interactive Learning via Chat | "Explain ROE simply" |
| H5 | Historical Drawdown Education | "Worst crash: -35% in COVID" |
| G5 | Position Tracking | Entry price, current value, P&L |

### Cluster: UX/INTERFACE (UX) - 12 Features ✅ ESSENTIAL

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| A14 | Progressive Disclosure Scorecard | Expand/collapse UI |
| C2 | DIY ↔ DFY Toggle | User choice toggle |
| J1 | Unified Discovery Section | Tab-based discovery hub |
| G7 | Watchlist Management | Add/remove from watchlist |
| N2 | Web Platform | Primary demo platform |
| N4 | Plain English Explanations | No jargon throughout |
| N5 | Guided Onboarding | Profile setup flow |
| C1 | Personalization Presets | "Quick Start: Value Investor" |
| K1 | Analysis Sharing | Share button (functional UI) |
| K2 | Export Reports | PDF export button |
| O1 | Free Tier Indicator | "3 free stocks" messaging |
| O2 | Pricing UI | Upgrade prompts |

**+ Profile Switcher (Demo-Specific)**
- Toggle between Ankit / Sneha / Kavya
- Real-time verdict/analysis update

### Cluster: ENGAGEMENT HOOKS (ENG) - 9 Features ✅ SHOW CONCEPTS

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| F1 | Smart Alerts (Customizable) | Settings UI shown |
| F2 | Score Drop Alerts | Notification example |
| F3 | Peer Rank Change Alerts | In alert list |
| F4 | Quarterly Earnings Alerts | Calendar UI shown |
| F5 | Portfolio Concentration Alerts | "75% Banking - Diversify?" |
| F6 | Thesis-Breaking Event Alerts | Key alert type |
| F7 | News & Event Integration | News feed section |
| J2 | Trending Stocks | "Most analyzed this week" |
| J3 | Top Rated by Sector | Leaderboard view |
| J4 | Score Movers | "Biggest score changes" |
| J9 | Community Signals | "1,247 users analyzed..." |

### Cluster: VALIDATION ENTRY (VAL) - 8 Features ✅ ENTRY POINTS

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| H1 | Forward-Testing Simulator | Entry CTA + concept |
| H2 | Backtesting Engine | Home screen only |
| H4 | What-If Scenarios | Concept mention |
| I1 | Advisor Marketplace | Browse view |
| I2 | 3-Tier Advisor System | Elite/Expert/Emerging badges |
| I3 | Advisor Specialization Filters | Filter UI |
| I5 | Verified Credentials & AUM | Verification badges |
| I6 | Track Record Display | Performance metrics |
| I4 | AI + Human Review Concept | Explanation of 10x model |
| I8 | Pricing Display | Consultation costs shown |

### Cluster: INFRASTRUCTURE (INFRA) - 4 Features 🔸 MOCK/IMPLICIT

| ID | Feature | Demo Requirement |
|----|---------|------------------|
| A10 | Real-Time Data Integration | Static mock, "5-min delay" label |
| A13 | Sector-Specific Frameworks | Different weights (implicit) |
| D4 | No Hallucinations Architecture | Marketing claim (not shown) |
| G1 | Portfolio Sync | Simulated connected state |

### Cluster: OUT OF SCOPE (OOS) - 31 Features ❌ DEFER

**Transaction Layer (L1-L7):** One-click buy, broker integration, MF distribution, baskets, ETF, gold, loans

**Mutual Funds (M1-M4):** MF analysis, fund scoring, portfolio construction, MF screener

**Advanced Features:** Custom scorecard builder (C3), UGC marketplace (C4), DIY screener (J6-J7), bulk analysis (G6), WhatsApp alerts (F8), vernacular (N3)

**Pricing Variants (O3-O6):** Subscription tiers, bundles, advisory credits

**Advisory Deep Features (I7, I9, I10):** Variance tracking, bundles, subscriptions

---

## Part 3: Screen Inventory

### Primary Screens Required

| Screen | Purpose | Key Features Demonstrated |
|--------|---------|---------------------------|
| ~~1. Landing/Login~~ | ~~Entry point~~ | **SKIPPED FOR DEMO** |
| ~~2. Onboarding Flow~~ | ~~Profile setup~~ | **SKIPPED FOR DEMO** |
| **1. Profile Context Card** | Context builder | Shows current user's 6D profile as demo context |
| **2. Home/Dashboard** | Central hub | Watchlist, alerts, discovery tabs |
| **3. Stock Analysis (Main)** | Core product | Scorecard, 11 segments, verdict |
| **4. Segment Deep-Dive** | Detail view | Metrics, citations, trajectory |
| **5. AI Chat** | Assistant | Stock Q&A, learning |
| **6. Stock Comparison** | Side-by-side | 2-stock comparison |
| **7. Analysis Journal** | History | Past analyses, notes, outcomes |
| **8. Portfolio View** | Holdings | Health check, concentration, P&L |
| **9. Discovery Hub** | Find stocks | Trending, top rated, for you |
| **10. Advisor Marketplace** | Phase 3 entry | Browse advisors |
| **11. Backtest Home** | Phase 3 entry | Simulator concept |
| **12. Profile/Settings** | Configuration | Profile switcher, preferences |
| **13. Alerts Center** | Notifications | Alert types, settings |

**Note:** Login & Onboarding screens skipped for demo. Demo starts with Profile Context Card showing the active user's profile, then proceeds to Dashboard.

### Demo-Specific Components

| Component | Purpose |
|-----------|---------|
| Profile Switcher | Toggle Ankit/Sneha/Kavya, see verdict change |
| Metric-by-Metric Mode Toggle | Switch between instant and guided |
| 6-Month History Simulation | Pre-populated journal, patterns |

---

## Part 4: PRD Development Checklist

### Inputs Needed From You

| Input | Status | Notes |
|-------|--------|-------|
| Metric list per segment | ⏳ Pending | You'll provide complete list |
| Scoring logic per profile | ⏳ Pending | How Growth vs Value weights differ |
| Mock verdicts for 9 combinations | ⏳ Pending | What verdict does each profile get |
| Sample journal entries | ⏳ Pending | Pre-populated history content |
| Sample pattern detection text | ⏳ Pending | "You favor..." messages |
| Advisor profiles for marketplace | ⏳ Pending | Mock advisor data |
| Visual/brand guidelines | ⏳ Pending | Colors, fonts, style |

### PRD Structure (Proposed)

```
For each feature cluster:
├── Overview & User Story
├── Functional Requirements
│   ├── User flows
│   ├── UI components
│   ├── States & variations
│   └── Edge cases
├── Data Requirements
│   ├── Mock data needed
│   └── Data structure
├── Acceptance Criteria
└── Dependencies
```

---

## Part 5: Recommended Next Steps

### Immediate (This Session)
1. ✅ Confirm this scope document
2. Review screen inventory - anything missing?
3. Prioritize which PRD cluster to write first

### Before PRD Writing
4. You provide: Metric list per segment
5. You provide: Scoring logic/verdict differences per profile
6. You provide: Sample mock data for 1 stock (template)

### PRD Development Sequence (Proposed)
| Order | Cluster | Rationale |
|-------|---------|-----------|
| 1 | Stock Analysis (CVP) | Core product, most complex |
| 2 | Personalization (PERS) | Powers differentiation demo |
| 3 | Learning (LEARN) | Phase 2 simulation |
| 4 | UX/Navigation | Ties everything together |
| 5 | Engagement + Validation | Supporting features |

---

## Open Items for Discussion

1. **Screen Inventory:** Are the 14 screens comprehensive? Anything to add/remove?

2. **PRD Sequence:** Do you agree with starting from Stock Analysis core, or prefer different order?

3. **Mock Data Template:** Should I create a template for you to fill in the 9 stock×profile combinations?

4. **Onboarding Flow:** How detailed should profile setup be? All 6 dimensions, or simplified for demo?

---

*Ready to proceed with PRD development upon your confirmation*
