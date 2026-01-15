# StockFox MLP - Consolidated PRD Summary
## Ready for Development Review

**Version:** 1.0
**Date:** January 15, 2025
**Purpose:** Investor Demo Prototype
**Build Approach:** Vibe-coded Web App (Vite + React + TypeScript + Tailwind)

---

## Executive Summary

### What is StockFox?
An AI-powered stock research platform that delivers **personalized, transparent, institutional-grade analysis** in plain English. The core differentiator: **"Same Stock, Different Verdict"** based on who YOU are as an investor.

### Demo Objective
Show investors in <10 minutes that:
1. The product vision is complete and differentiated
2. Personalization actually works (not just marketing)
3. The moat is defensible (transparency + education)
4. Revenue model is viable (₹99/year + advisor marketplace)

---

## Part 1: Demo Specifications (CONFIRMED)

### Platform & Approach
| Spec | Decision |
|------|----------|
| Platform | Web App only |
| Data | Hardcoded JSON (realistic mock data) |
| AI Chat | Pre-scripted responses (looks like AI) |
| Interactivity | Fully functional navigation |
| Backend | None (frontend only) |

### Demo Stocks (3)
| Stock | Sector | Why Selected |
|-------|--------|--------------|
| Eternal (Zomato) | Food Tech | Polarizing - growth vs profitability tension |
| Axis Bank | Banking | Traditional, stable, well-understood |
| TCS | IT Services | Blue chip benchmark, quality reference |

### Demo Personas (3)
| Profile | Name | Thesis | Risk | Verdict on Zomato |
|---------|------|--------|------|-------------------|
| A | Analytical Ankit | Growth | Moderate | **8.2/10 STRONG BUY** |
| B | Skeptical Sneha | Value | Conservative | **4.8/10 AVOID** |
| C | Curious Kavya | Learning | Moderate | **6.5/10 HOLD** |

### Simulated History
- 6 months of pre-populated journal entries per profile
- Pattern detection active ("You favor profitable growers")
- Blind spots tracked per profile
- Portfolio context with concentration warnings

---

## Part 2: Feature Clusters (68 Features for Demo)

### Cluster 1: Core Value Prop (CVP) - 14 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| A1 | 11-Segment DFY Analysis | Full - all segments shown |
| A2 | 200+ Metrics Coverage | Full - metrics per segment |
| A3 | 3-Layer Scoring | Full - Metric → Segment → Verdict |
| A4 | Overall Score + Verdict | Full - "8.2/10 STRONG BUY" |
| A5 | Peer Ranking | Full - "#2 of 15 Banking Stocks" |
| A6 | Sector-Relative Interpretation | Full - "ROE 18% vs Sector 14%" |
| A7 | Historical Trajectory | Full - 5-year sparklines |
| A8 | Evidence Citations | Full - 94% target, sources shown |
| A9 | 3-Level Drill-Down | Full - click through to citations |
| A10 | Real-Time Data | Mock - static with "5-min delay" label |
| A11 | Red Flags | Full - warnings prominently shown |
| A12 | Stock Comparison | Full - side-by-side view |
| A13 | Quick Analysis Mode | Full - 2-3 min summary |
| A14 | Full Analysis Mode | Full - all 11 segments expanded |

### Cluster 2: Personalization (PERS) - 11 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| B1 | 6D Personalization Engine | Full - powers different verdicts |
| B2 | Investment Thesis Profiles | Full - Growth/Value/Agnostic |
| B3 | Risk Tolerance | Full - impacts verdict |
| B4 | Time Horizon | Full - 3-5yr vs 5+yr |
| B5 | Experience Level | Full - simpler explanations for beginners |
| B6 | Sector Preference | Optional - filter in profile |
| B7 | Portfolio Context | Full - "40% in Banking already" |
| B8 | Adaptive Explainers | Full - same metric, different depth |
| B9 | Learning Patterns | Full - "You favor profitable growers" |
| B10 | Position Sizing | Full - "8-10% allocation" |
| B11 | Entry/Exit Guidance | Full - timing suggestions |

### Cluster 3: Learning & Education (LEARN) - 14 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| E1 | Contextual Learning (Hover) | Full - tooltips on metrics |
| E2 | Analysis Journal | Full - auto-logged entries |
| E3 | System-Prompted Feedback | Full - "What's your verdict?" |
| E4 | Highlight-to-Note | Optional - long-press note |
| E5 | Decision Logging | Full - BUY/WATCHLIST/SKIP/AVOID |
| E6 | Outcome Tracking | Full - "Bought ₹120, now ₹145" |
| E7 | Blind Spot Detection | Full - "Debt checked 2/5 times" |
| E8 | Skill Development | Full - level badges |
| E9 | Pattern Recognition | Full - emerging thesis detection |
| C6 | Metric-by-Metric Mode | Full - guided analysis |
| D1 | RAG AI Assistant | Mock - pre-scripted responses |
| D2 | Stock Q&A | Mock - "Why is profitability low?" |
| D3 | Verified Signals | Mock - news queries |
| D5 | Interactive Learning | Mock - "Explain ROE simply" |

### Cluster 4: UX & Navigation (UX) - 12 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| N2 | Web Platform | Full - primary demo |
| N4 | Plain English | Full - no jargon |
| N5 | Guided Onboarding | Concept - presets available |
| A14 | Progressive Disclosure | Full - expand/collapse |
| C1 | Personalization Presets | Full - Quick Start options |
| C2 | DIY ↔ DFY Toggle | Full - user choice |
| J1 | Discovery Hub | Full - tabbed interface |
| G7 | Watchlist Management | Full - add/remove |
| K1 | Analysis Sharing | Concept - share button UI |
| K2 | Export Reports | Concept - PDF button |
| O1 | Free Tier Indicator | Concept - "3 free stocks" |
| O2 | Pricing UI | Concept - upgrade prompts |
| - | Profile Switcher | Full - demo-specific toggle |

### Cluster 5: Engagement (ENG) - 9 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| F1 | Smart Alerts Config | Full - settings UI |
| F2 | Score Drop Alerts | Full - notification example |
| F3 | Peer Rank Alerts | Concept - in alert list |
| F4 | Earnings Alerts | Concept - calendar UI |
| F5 | Concentration Alerts | Full - portfolio warning |
| F6 | Thesis-Breaking Alerts | Full - key differentiator |
| F7 | News Integration | Concept - feed section |
| J2 | Trending Stocks | Full - "Most analyzed" |
| J3 | Top Rated by Sector | Full - leaderboard |

### Cluster 6: Validation Entry (VAL) - 8 Features ✅

| ID | Feature | Demo Status |
|----|---------|-------------|
| H1 | Forward-Testing | Entry - concept page |
| H2 | Backtesting Engine | Entry - home screen only |
| H4 | What-If Scenarios | Entry - concept mention |
| I1 | Advisor Marketplace | Browse - advisor cards |
| I2 | 3-Tier Advisor System | Full - badges |
| I3 | Advisor Filters | Full - filter UI |
| I5 | Verified Credentials | Full - badges |
| I6 | Track Record | Full - metrics shown |

---

## Part 3: Screen Architecture (13 Screens)

### Navigation Structure
```
Bottom Nav (always visible):
[🏠 Home] [🔍 Discover] [💼 Portfolio] [📓 Journal] [💬 Chat]

Header:
[Logo] [Search] [🔔 Alerts] [👤 Profile Switcher]
```

### Screen Inventory

| # | Screen | Route | Priority | Key Demo Moment |
|---|--------|-------|----------|-----------------|
| 1 | Profile Selection | `/` | P0 | Entry - pick persona |
| 2 | Dashboard | `/dashboard` | P0 | Watchlist + alerts |
| 3 | Stock Analysis | `/stock/[ticker]` | P0 | **Hero screen** - score + verdict |
| 4 | Segment Deep-dive | `/segment/[ticker]/[id]` | P0 | 11 segments + metrics |
| 5 | AI Chat | `/chat` | P0 | Q&A interface |
| 6 | Stock Comparison | `/compare` | P1 | Side-by-side |
| 7 | Analysis Journal | `/journal` | P0 | 6-month history |
| 8 | Portfolio View | `/portfolio` | P1 | Holdings + P&L |
| 9 | Discovery Hub | `/discover` | P1 | Trending + For You |
| 10 | Advisor Marketplace | `/advisors` | P2 | Browse advisors |
| 11 | Backtest Home | `/backtest` | P2 | Coming Soon entry |
| 12 | Alerts Center | `/alerts` | P1 | Notifications |
| 13 | Settings | `/settings` | P2 | Profile preferences |

---

## Part 4: The 11 Segments (Complete)

### Segment Overview

| # | Segment | Metrics | Default Weight |
|---|---------|---------|----------------|
| 1 | Profitability | ROE, ROCE, Net Margin, Operating Margin, ROA | 12% |
| 2 | Financial Ratios | D/E, Current Ratio, Interest Coverage, CCC | 10% |
| 3 | Growth | Revenue CAGR, EPS CAGR, EBITDA Growth | 15% |
| 4 | Valuation | P/E, P/B, EV/EBITDA, P/S | 15% |
| 5 | Price & Volume | 1Y Return, vs Nifty, Volume Trends | 5% |
| 6 | Technical | RSI, MACD, Moving Averages, Beta | 5% |
| 7 | Broker Ratings | % Buy, Target Price, Upside | 5% |
| 8 | Ownership | Promoter %, FII/DII %, Pledging | 10% |
| 9 | Futures & Options | OI, PCR, IV | 3% |
| 10 | Income Statement | Revenue, EBITDA, PAT Trends | 10% |
| 11 | Balance Sheet | Cash, Debt, FCF, Working Capital | 10% |

### Profile-Specific Weightings

| Segment | Ankit (Growth) | Sneha (Value) | Kavya (Beginner) |
|---------|----------------|---------------|------------------|
| Profitability | 10% | 15% | 15% |
| Growth | **20%** | 8% | 12% |
| Valuation | 10% | **20%** | 12% |
| Financial Ratios | 8% | 15% | 12% |
| Ownership | 8% | 12% | 10% |
| F&O | 5% | 0% | **0%** |
| Technical | 8% | 5% | 5% |

---

## Part 5: Mock Data Status (Complete)

### What's Ready

| Data Type | Status | Location |
|-----------|--------|----------|
| 3 User Profiles | ✅ Complete | `stockfox_mock_data_filled.md` |
| 9 Stock × Profile Verdicts | ✅ Complete | `stockfox_mock_data_filled.md` |
| 11 Segment Scores per stock | ✅ Complete | `stockfox_mock_data_filled.md` |
| 6-month Journal Entries | ✅ Complete | `stockfox_mock_data_filled.md` |
| Pattern Detection Messages | ✅ Complete | `stockfox_mock_data_filled.md` |
| Blind Spot Data | ✅ Complete | `stockfox_mock_data_filled.md` |
| 6 Advisor Profiles | ✅ Complete | `stockfox_mock_data_filled.md` |
| Discovery Data | ✅ Complete | `stockfox_mock_data_filled.md` |
| Red Flags per Stock | ✅ Complete | `stockfox_mock_data_filled.md` |
| News Items | ✅ Complete | `stockfox_mock_data_filled.md` |
| Alert Examples | ✅ Complete | PRD specs |

### 200+ Metrics Reference
| File | Segments Covered |
|------|------------------|
| `tickertape_screener_parameters - 1.md` | Profitability, Financial Ratios, Growth, Valuation |
| `tickertape_screener_parameters - 2.md` | Price & Volume, Technical |
| `tickertape_screener_parameters - 3.md` | Broker Ratings, Ownership |
| `tickertape_screener_parameters - 4.md` | F&O, Income Statement, Balance Sheet |

---

## Part 6: Key Demo Moments

### The "Magic Moments" to Demonstrate

| # | Moment | What Happens | Why It Matters |
|---|--------|--------------|----------------|
| 1 | **Profile Switch** | Same stock, verdict changes instantly | Proves personalization is real |
| 2 | **Citation Drill-down** | Claim → Source → Primary doc | Builds trust through transparency |
| 3 | **Blind Spot Alert** | "You checked debt only 2/5 times" | Shows education loop |
| 4 | **Thesis-Breaking Alert** | "Zomato turned profitable - review thesis" | Personalized monitoring |
| 5 | **Quick → Full Analysis** | 2-min scan expands to 15-min deep dive | Speed + depth combo |
| 6 | **Journal Patterns** | "You favor profitable growers" | Users become independent |

### Demo Script Flow (Suggested)
```
1. Start as Ankit (Growth) → Show Zomato 8.2/10 STRONG BUY
2. Drill into segments → Show evidence citations
3. Switch to Sneha (Value) → Same stock shows 4.8/10 AVOID
4. Show Journal → 6-month history with patterns
5. Show Alerts → Thesis-breaking example
6. Show Advisor Marketplace → Browse entry point
7. End with Dashboard → Complete product vision
```

---

## Part 7: Identified Gaps (None Critical)

### Minor Gaps (Can proceed without)

| Gap | Severity | Resolution |
|-----|----------|------------|
| Some metrics not filled in mock data | Low | Use placeholder values |
| AI chat responses limited | Low | Pre-script 10-15 common Q&As |
| Historical charts need 5Y data points | Low | Generate synthetic trend data |
| Some alert types are concepts only | Low | Show UI, mark as concept |

### Not Needed for Demo
- Backend API
- Authentication
- Database
- Payment processing
- Real-time data feeds
- Email/push notifications

---

## Part 8: Tech Stack (Finalized for Demo)

```
Framework:     Vite + React 18
Language:      TypeScript
Styling:       Tailwind CSS
Components:    shadcn/ui (Radix primitives)
State:         Zustand
Charts:        Recharts
Animations:    Framer Motion
Icons:         Lucide React
Forms:         React Hook Form + Zod
Routing:       React Router v6
```

---

## Part 9: Open Items (For Your Decision)

### Before Build Starts

| Item | Options | Your Decision |
|------|---------|---------------|
| Design System | Waiting for your Figma upload | Pending |
| Color Palette | Your design OR auto-generate | Pending |
| Typography | Your fonts OR Inter/system | Pending |
| Mobile Responsive | Full responsive OR desktop-first | Recommend: Desktop-first |
| Animations | Subtle OR prominent | Recommend: Subtle polish |

---

## Approval Checklist

Please confirm the following before we proceed:

- [ ] Feature scope is correct (68 features across 6 clusters)
- [ ] 13 screens are comprehensive
- [ ] 3 demo personas are correct
- [ ] 3 demo stocks are correct
- [ ] Tech stack is approved (Vite + React)
- [ ] Mock data approach is acceptable
- [ ] Demo flow makes sense

---

**Ready for your review. Once approved + Figma uploaded, we begin building.**
