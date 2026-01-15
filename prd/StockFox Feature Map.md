# StockFox Feature Analysis
## JTBD Mapping, Strategic Alignment & Prioritization Framework

**Version:** 1.0 | **Date:** January 14, 2025 | **Features:** 110 across 15 categories

---

## Executive Summary

This document provides comprehensive analysis of StockFox's 110 features across:
- **Jobs-to-be-Done mapping** (8 functional, 6 emotional, 4 social jobs)
- **Strategic alignment scoring** (5 pillars, 1-5 scale each)
- **Prioritization framework** with dependencies and constraints
- **Recommended phasing** across 5 development phases

---

## 1. User Personas Reference

| Persona | Profile | Core Need | Distribution |
|---------|---------|-----------|--------------|
| **Analytical Ankit** | 27, SW Engineer, ₹12L/yr | Maximum insight, minimum time | 30% |
| **Skeptical Sneha** | 29, Marketing Mgr, ₹15L/yr | Verify everything, trust through evidence | 20% |
| **Transitioning Tanmay** | 25, CA, ₹8L/yr | Learn proper research, validate thinking | 30% |
| **Curious Kavya** | 24, Product Mgr, ₹10L/yr | Master investing skill for life | 10% |
| **Busy Rajesh** | 32, Entrepreneur, ₹18L/yr | Professional-grade decisions fast | 10% |

---

## 2. Jobs-to-be-Done Framework

### Functional Jobs
| ID | Job Statement |
|----|---------------|
| FJ1 | Help me decide if this stock is worth buying |
| FJ2 | Help me understand WHY this stock is good/bad |
| FJ3 | Help me avoid making costly mistakes |
| FJ4 | Help me learn investing without taking a course |
| FJ5 | Help me track and improve my decisions |
| FJ6 | Help me stay updated on my holdings |
| FJ7 | Help me verify tips before acting |
| FJ8 | Help me find new investment opportunities |

### Emotional Jobs
| ID | Job Statement | Shift |
|----|---------------|-------|
| EJ1 | Make me feel confident, not anxious | Anxiety → Confidence |
| EJ2 | Make me feel in control, not dependent | Helplessness → Empowerment |
| EJ3 | Make me feel smart, not foolish | Inadequacy → Competence |
| EJ4 | Remove the feeling of being overwhelmed | Overwhelm → Clarity |
| EJ5 | Remove the fear of missing out | FOMO → Rational calm |
| EJ6 | Make me feel I'm making progress | Stagnation → Growth |

### Social Jobs
| ID | Job Statement |
|----|---------------|
| SJ1 | Help me be seen as a knowledgeable investor |
| SJ2 | Help me belong to a community of serious investors |
| SJ3 | Help me teach others, not just be a follower |
| SJ4 | Help me gain respect from family |

---

## 3. Strategic Alignment Pillars

| Pillar | Code | Definition | Differentiator |
|--------|------|------------|----------------|
| **Comprehensive** | P1 | Covers all 11 segments, 200+ metrics | vs Tickertape (6-8 segments) |
| **Transparent** | P2 | Every claim cited, every score explained | vs Liquide (black-box) |
| **Personalized** | P3 | Tailored to user's context (6 dimensions) | vs generic tools |
| **Fast** | P4 | Seconds/minutes, not hours/days | vs manual research |
| **Educational** | P5 | Learn while doing, build skills | vs tip-dependency |

**Scoring:** 1-5 per pillar. **Tiers:** 21-25 (Tier 1), 18-20 (Tier 2), 15-17 (Tier 3), <15 (Tier 4)

---

## 4. Feature Analysis Summary

### Category A: Stock Analysis & Research Engine (14 features)

| ID | Feature | Score | Jobs | Priority |
|----|---------|-------|------|----------|
| A1 | 11-Segment DFY Analysis | 19 | FJ1,FJ2,FJ3,EJ1,EJ4 | High |
| A2 | 200+ Metrics Coverage | 19 | FJ2,EJ2 | High |
| A3 | 3-Layer Scoring Architecture | 19 | FJ2,EJ1,EJ2 | High |
| A4 | Overall Score + Verdict | **21** | FJ1,EJ1,EJ4 | **Tier 1** |
| A5 | Peer Ranking System | 20 | FJ1,FJ8,EJ1,EJ5 | Tier 2 |
| A6 | Sector-Relative Interpretation | **21** | FJ2,EJ3,EJ4 | **Tier 1** |
| A7 | Historical Trajectory | 18 | FJ2,FJ3,EJ1 | Tier 2 |
| A8 | Evidence Citations (94%) | 15 | FJ2,EJ1,EJ2,SJ1 | Tier 3 |
| A9 | 3-Level Evidence Drill-Down | 18 | FJ2,EJ1,EJ2 | Tier 2 |
| A10 | Real-Time Data | 13 | FJ1,FJ6 | Tier 4 |
| A11 | Red Flag Identification | **21** | FJ3,FJ7,EJ1 | **Tier 1** |
| A12 | Stock Comparison | 18 | FJ1,FJ8,EJ4 | Tier 2 |
| A13 | Sector-Specific Frameworks | 19 | FJ1,FJ2,EJ3 | High |
| A14 | Progressive Disclosure | 20 | FJ1,FJ2,EJ4 | Tier 2 |

### Category B: Personalization Engine (11 features)

| ID | Feature | Score | Jobs | Constraints |
|----|---------|-------|------|-------------|
| B1 | 6D Personalization Engine | 20 | FJ1,FJ2,EJ1,EJ2 | Foundation for B2-B11 |
| B2 | Investment Thesis Profiles | 19 | FJ1,EJ2 | Needs B1 |
| B3 | Risk Tolerance Calibration | 20 | FJ3,EJ1 | **Capture 2-3rd analysis** |
| B4 | Time Horizon Alignment | 19 | FJ1,EJ1 | Needs B1 |
| B5 | Experience Level Adaptation | 19 | FJ2,FJ4,EJ3,EJ4 | Needs B1 |
| B6 | Sector Preference Filtering | 15 | FJ8,EJ2 | Needs B1 |
| B7 | Portfolio Context Awareness | **21** | FJ1,FJ3,EJ1 | Needs G1 |
| B8 | Adaptive Complexity Explainers | 20 | FJ2,FJ4,EJ3,EJ4 | Needs B5, High complexity |
| B9 | Learning Pattern Recognition | 19 | FJ4,FJ5,EJ2,EJ6 | **Needs 5-10 analyses** |
| B10 | Position Sizing Guidance | 20 | FJ1,FJ3,EJ1 | Needs B3 |
| B11 | Entry Timing Guidance | 20 | FJ1,EJ1,EJ5 | Needs B2 |

### Category C: Customization & Templates (6 features)

| ID | Feature | Score | Jobs | Notes |
|----|---------|-------|------|-------|
| C1 | Personalization Presets | 17 | FJ1,EJ4 | Quick start |
| C2 | DIY ↔ DFY Toggle | 17 | FJ2,EJ2 | Power users |
| C3 | Custom Scorecard Builder | 19 | FJ2,EJ2 | Advanced |
| C4 | UGC Framework Marketplace | 15 | FJ8,SJ2,SJ3 | **Needs user scale** |
| C5 | Custom Parameter Alerts | 18 | FJ8,EJ5 | |
| C6 | Metric-by-Metric Learning | 19 | FJ4,EJ3,EJ6 | **Toggle TBD (F1)** |

### Category D: AI Assistant & Chat (5 features)

| ID | Feature | Score | Jobs | Complexity |
|----|---------|-------|------|------------|
| D1 | RAG-Based AI Assistant | **21** | FJ2,FJ7,EJ3 | High |
| D2 | Stock-Specific Q&A | **21** | FJ2,FJ7 | Medium |
| D3 | Verified Signal Queries | 20 | FJ6,FJ7,EJ1 | High |
| D4 | No Hallucinations Architecture | 14 | EJ1,EJ2 | High (infra) |
| D5 | Interactive Learning via Chat | 20 | FJ4,EJ3,EJ6 | Medium |

### Category E: Learning & Education (9 features)

| ID | Feature | Score | Jobs | Constraints |
|----|---------|-------|------|-------------|
| E1 | Contextual Learning (Hover) | 20 | FJ2,FJ4,EJ3,EJ4 | |
| E2 | Analysis Journal Auto-Logging | **21** | FJ5,EJ6 | **Foundation for E3-E9** |
| E3 | Journal System-Prompted Feedback | 20 | FJ5,EJ6 | Needs E2 |
| E4 | Highlight-to-Note | **21** | FJ5,EJ2 | Needs E2 |
| E5 | Decision Logging | **21** | FJ5,EJ2,SJ1 | **Feeds J9** |
| E6 | Outcome Tracking | **22** | FJ5,EJ6 | Needs E5 + prices |
| E7 | Blind Spot Detection | **21** | FJ4,FJ5,EJ6 | **Needs 5+ analyses** |
| E8 | Gamification | 18 | FJ4,EJ6 | **Triggers TBD (F4)** |
| E9 | Pattern Recognition Feedback | **21** | FJ5,EJ2,EJ6 | **Needs 5-10 analyses** |

### Category F: Alerts & Monitoring (8 features)

| ID | Feature | Score | Jobs | Dependencies |
|----|---------|-------|------|--------------|
| F1 | Smart Alerts (Customizable) | 19 | FJ6,EJ1 | A4, G7 |
| F2 | Score Drop Alerts | **22** | FJ3,FJ6,EJ1 | A4, G7 |
| F3 | Peer Rank Change Alerts | **22** | FJ3,FJ6 | A5, G7 |
| F4 | Quarterly Earnings Alerts | 18 | FJ6 | Calendar |
| F5 | Portfolio Concentration Alerts | **22** | FJ3,EJ1 | G1 |
| F6 | Thesis-Breaking Event Alerts | **23** | FJ3,FJ6,EJ1 | B1, B2 |
| F7 | News & Event Integration | 19 | FJ6,FJ7 | News feed |
| F8 | WhatsApp Alerts | 13 | FJ6 | WhatsApp API |

### Category G: Portfolio Features (8 features)

| ID | Feature | Score | Jobs | Dependencies |
|----|---------|-------|------|--------------|
| G1 | Portfolio Sync | 19 | FJ6,EJ2 | **Broker APIs** |
| G2 | Portfolio Health Check | **23** | FJ3,FJ5,EJ1 | G1 |
| G3 | Concentration Risk Analysis | **23** | FJ3,EJ1 | G1 |
| G4 | Rebalancing Recommendations | **22** | FJ3,EJ2 | G1,G2,G3 |
| G5 | Position Tracking | **21** | FJ5,FJ6 | G1 or manual |
| G6 | Bulk Analysis | 20 | FJ6,EJ4 | A1,A4,G1 |
| G7 | Watchlist Management | 16 | FJ8,EJ5 | None |
| G8 | Portfolio-Aware Suggestions | 20 | FJ8,EJ4 | G1, J |

### Category H: Validation & Simulation (5 features)

| ID | Feature | Score | Jobs | Dependencies |
|----|---------|-------|------|--------------|
| H1 | Forward-Testing Simulator | **21** | FJ4,EJ3,EJ6 | Price data |
| H2 | Backtesting Engine | **23** | FJ4,EJ1,EJ3 | Historical data |
| H3 | Personalized Backtest Results | **22** | FJ3,EJ1 | H2, B3 |
| H4 | What-If Scenarios | 20 | FJ2,EJ1 | Historical data |
| H5 | Historical Drawdown Education | **21** | FJ3,EJ1 | **TBD (F2)** |

### Category I: Human Advisory Marketplace (10 features)

*All require SEBI RA License (expected Jan 2026)*

| ID | Feature | Score | Notes |
|----|---------|-------|-------|
| I1 | 50+ Advisor Marketplace | 20 | Foundation |
| I2 | 3-Tier Advisor System | 17 | Elite/Expert/Emerging |
| I3 | Advisor Specialization Filters | 19 | By sector/strategy |
| I4 | AI Pre-Analysis + Human Review | **22** | 10x efficiency model |
| I5 | Verified Credentials & AUM | 15 | Auditor required |
| I6 | Track Record Display | 17 | CA certification |
| I7 | AI vs Human Variance | 20 | Learning feedback |
| I8 | Pay-Per-Consultation | 18 | ₹500-15K |
| I9 | Advisory Bundles | 16 | 5-stock bundles |
| I10 | Monthly Advisory Subscription | 17 | ₹4K-15K/mo |

### Category J: Discovery (9 features)

| ID | Feature | Score | Dependencies |
|----|---------|-------|--------------|
| J1 | Unified Discovery Section | 20 | J2-J9 |
| J2 | Trending Stocks | 18 | User activity |
| J3 | Top Rated by Sector | 19 | A4, A5 |
| J4 | Score Movers | 20 | Continuous scoring |
| J5 | For You (Personalized) | 20 | **B9 (5-10 analyses)** |
| J6 | DIY Screener | 20 | A2 |
| J7 | Custom Screener Templates | 19 | J6 |
| J8 | IPO Analysis | 18 | IPO data |
| J9 | Community Signals | 20 | **E5 + user volume (F3)** |

### Categories K-O: Supporting Features

| Category | Features | Avg Score | Status |
|----------|----------|-----------|--------|
| K: Social & Sharing | K1-K3 | 15 | K1 Live |
| L: Transaction | L1-L7 | 12 | Future (Phase 5) |
| M: Mutual Funds | M1-M4 | 18 | Future |
| N: Platform & UX | N1-N5 | 16 | N1,N5 Live |
| O: Monetization | O1-O6 | 14 | O1-O2 Live |

---

## 5. Top 25 Features by Score

| Rank | ID | Feature | Score | Phase |
|------|----|---------| ------|-------|
| 1 | F6 | Thesis-Breaking Event Alerts | **23** | 3 |
| 2 | G2 | Portfolio Health Check | **23** | 3 |
| 3 | G3 | Concentration Risk Analysis | **23** | 3 |
| 4 | H2 | Backtesting Engine | **23** | 4 |
| 5 | F2 | Score Drop Alerts | **22** | 1 |
| 6 | F3 | Peer Rank Change Alerts | **22** | 1 |
| 7 | F5 | Portfolio Concentration Alerts | **22** | 3 |
| 8 | E6 | Outcome Tracking | **22** | 2 |
| 9 | G4 | Rebalancing Recommendations | **22** | 3 |
| 10 | H3 | Personalized Backtest | **22** | 4 |
| 11 | I4 | AI + Human Review | **22** | 4 |
| 12 | A4 | Overall Score + Verdict | **21** | 1 |
| 13 | A6 | Sector-Relative Interpretation | **21** | 1 |
| 14 | A11 | Red Flag Identification | **21** | 1 |
| 15 | D1 | RAG-Based AI Assistant | **21** | 1 |
| 16 | D2 | Stock-Specific Q&A | **21** | 1 |
| 17 | E2 | Analysis Journal Auto-Logging | **21** | 1 |
| 18 | E4 | Highlight-to-Note | **21** | 1 |
| 19 | E5 | Decision Logging | **21** | 1 |
| 20 | E7 | Blind Spot Detection | **21** | 2 |
| 21 | E9 | Pattern Recognition Feedback | **21** | 2 |
| 22 | B7 | Portfolio Context Awareness | **21** | 2 |
| 23 | G5 | Position Tracking | **21** | 3 |
| 24 | H1 | Forward-Testing Simulator | **21** | 2 |
| 25 | H5 | Historical Drawdown Education | **21** | 2 |

---

## 6. Critical Dependencies Map

```
FOUNDATION (Phase 1)
├── A1 (11-Segment) ──────► A2-A14, all analysis features
├── A4 (Overall Score) ───► B1, F1-F3, personalized verdicts
└── E2 (Journal) ─────────► E3-E9, B9, learning features

PERSONALIZATION (Phase 2)
├── B1 (6D Engine) ───────► B2-B11
├── B3 (Risk)* ───────────► B10, H3, F6
└── B9 (Patterns)** ──────► J5, E9

PORTFOLIO (Phase 3)
└── G1 (Sync) ────────────► B7, G2-G8, F5

ADVISORY (Phase 4)
└── I1 (Marketplace)*** ──► I2-I10

* Capture during 2-3rd analysis (trust-first)
** Requires 5-10 user analyses
*** Requires SEBI RA license
```

---

## 7. Recommended Phasing

### Phase 1: Foundation Complete (0-3 months)
**Focus:** Core analysis engine, journal, alerts

| Priority | Features | Outcome |
|----------|----------|---------|
| Week 1-4 | A4, A6, A11, E2, E5, A5 | Complete scorecard + journal |
| Week 5-8 | D1, D2, F2, F3, E3 | AI assistant + alerts |
| Week 9-12 | E4, A12, A8, F4 | Deep features |

### Phase 2: Personalization & Learning (3-6 months)
**Focus:** Build personalization engine, learning feedback

| Priority | Features | Outcome |
|----------|----------|---------|
| Month 3-4 | B1, B2, B4, B5, C1 | Personalization foundation |
| Month 4-5 | B3*, B8, E7** | Risk + adaptive explainers |
| Month 5-6 | B9**, E9**, H1, H5, B10, B11, J5** | Patterns + validation |

### Phase 3: Portfolio & Discovery (6-9 months)
**Focus:** Portfolio features, discovery infrastructure

| Priority | Features | Outcome |
|----------|----------|---------|
| Month 6-7 | G1, G7 | Portfolio sync foundation |
| Month 7-8 | G2, G3, F5, F6, G5 | Portfolio analysis + alerts |
| Month 8-9 | J1, J6, G4, G6, G8 | Discovery + rebalancing |

### Phase 4: Advisory & Advanced (9-12 months)
**Focus:** Human advisory marketplace (post SEBI license)

| Priority | Features | Outcome |
|----------|----------|---------|
| Month 9-10 | I1, I4 | Marketplace launch |
| Month 10-11 | I2-I3, H2, H3 | Tiers + backtesting |
| Month 11-12 | I5-I7, J9***, C3 | Verification + community |

### Phase 5: Scale & Ecosystem (12+ months)
- L1-L7: Transaction execution
- M1-M4: Mutual funds module
- N3: Vernacular support
- C4: UGC marketplace

---

## 8. Future Decision Items

| ID | Item | Approach | Status |
|----|------|----------|--------|
| F1 | Metric-by-Metric Toggle | Guided first analysis with skip option | TBD |
| F2 | Risk Tolerance Discovery | Educational framing during 2-3rd analysis | TBD |
| F3 | Community Signals | Signals/observations, not verdicts | TBD |
| F4 | Gamification Triggers | Based on analyses, decisions, outcomes | TBD |

---

## Appendix: Scoring Details

### Score Calculation Example: F6 (Thesis-Breaking Alerts) = 23/25

| Pillar | Score | Rationale |
|--------|-------|-----------|
| P1 Comprehensive | 4 | Monitors relevant dimensions |
| P2 Transparent | 5 | Shows exactly what triggered |
| P3 Personalized | 5 | Based on USER'S thesis |
| P4 Fast | 5 | Real-time detection |
| P5 Educational | 4 | Teaches what matters |
| **Total** | **23** | |

### Score Calculation Example: A4 (Overall Score + Verdict) = 21/25

| Pillar | Score | Rationale |
|--------|-------|-----------|
| P1 Comprehensive | 4 | Synthesizes all segments |
| P2 Transparent | 4 | Shows how calculated |
| P3 Personalized | 5 | Tailored to user profile |
| P4 Fast | 5 | Instant result |
| P5 Educational | 3 | Summary vs deep learning |
| **Total** | **21** | |

---

*Document Version 1.0 | January 14, 2025 | StockFox Product Team*
