# CLAUDE.md - AI Assistant Guide for StockFox

> This document provides context and guidelines for AI assistants working on the StockFox codebase.

## Project Overview

**StockFox** is India's investment confidence platform - an AI-powered stock research and analysis tool that makes institutional-grade stock analysis accessible to retail investors. The platform analyzes 200+ metrics across 11 segments, provides transparent evidence-backed insights with 94% citation target, and integrates contextual learning to help retail investors make confident, independent investment decisions.

**Repository:** `aby0607-maker/stockfox`
**Status:** Phase 1 Live - AI Research Analyst

### The Doctor Analogy (Core Positioning)
StockFox is the "complete doctor" for your portfolio:
- **Not just a lab** (like Screener) - showing data without interpretation
- **Not a black-box doctor** (like Liquide) - giving recommendations without reasoning
- **A complete doctor** - comprehensive diagnosis + treatment + transparent explanation

### Core Value Proposition
| Aspect | Details |
|--------|---------|
| Analysis Depth | 200+ metrics across 11 segments |
| Transparency | 94% citation target - every claim backed by evidence |
| Pricing | ₹99/year per stock (vs ₹50K/month traditional advisors) |
| Free Tier | 3 stocks free with full feature access |
| Time Savings | 10 minutes vs 45+ minutes manual research |

## Team

- **Vishal Rampuria** (Founding Member): 17 years equity research experience at Julius Baer, CRISIL, HDFC Securities - represents the institutional methodology moat
- **Nitin Pokharna**: CA, 2x founder
- **Abhishek**: Product Lead

## Current Status

| Metric | Value |
|--------|-------|
| Phase | Phase 1 Live - AI Research Analyst |
| Downloads | 3,000+ |
| Community | 6,000+ members (Telegram) |
| SEBI RA License | Application submitted Nov 2024, expected Jan 2026 |
| Fundraising | ₹4.25 crore seed round in progress |

---

## Repository Structure

```
stockfox/
├── CLAUDE.md           # This file - AI assistant guidelines
├── README.md           # Project readme
├── docs/               # All documentation
│   ├── prd/            # Product Requirement Documents
│   ├── specs/          # Technical Specifications
│   ├── research/       # User research, personas, competitive analysis
│   └── data/           # Reference data, screener parameters
├── src/                # Application source code
├── public/             # Static assets
└── [config files]      # package.json, vite.config.ts, etc.
```

### Documentation Files
| Folder | Contents |
|--------|----------|
| `docs/prd/` | PRDs for personalization, feature clusters, MLP scope, product value prop |
| `docs/specs/` | Technical specifications for CVP, learn cluster, UX navigation |
| `docs/research/` | ICP & Personas, user journeys, competitive analysis, presentations |
| `docs/data/` | Mock data, screener parameters reference |

---

## MLP Prototype Specifications

### Technical Approach
| Specification | Decision |
|---------------|----------|
| Platform | Web App only |
| Build Approach | Vibe-coded using Claude Code |
| AI Responses | Mock/hardcoded (realistic) |
| Data | Realistic mock data |
| Interactivity | Fully interactive, user-driven flow |

### Demo Stocks
| Stock | Sector | Why Selected |
|-------|--------|--------------|
| Eternal (Zomato) | New Economy / Food Tech | Volatile, polarizing, growth vs profitability tension |
| Axis Bank | Banking / Financial Services | Traditional, stable, well-understood metrics |
| TCS | IT Services | Blue chip benchmark, quality reference |

### Demo User Profiles
| Profile | Name | Thesis | Risk | Horizon | Experience | Focus |
|---------|------|--------|------|---------|------------|-------|
| A | Analytical Ankit | Growth | Moderate | 3-5 years | Intermediate | Speed + efficiency |
| B | Skeptical Sneha | Value | Conservative | 5+ years | Advanced | Evidence + verification |
| C | Curious Kavya | Agnostic | Moderate | 3-5 years | Beginner | Education + understanding |

---

## Feature Clusters

### CVP (Core Value Prop) - 14 Features
- 11-Segment DFY Analysis with scores
- 200+ Metrics Coverage
- 3-Layer Scoring: Metric → Segment → Overall
- Overall Score + Verdict ("8.2/10 - STRONG BUY")
- Peer Ranking System ("#2 of 15 Banking Stocks")
- Sector-Relative Interpretation
- Historical Trajectory (5-year sparklines)
- Evidence Citations (94% target)
- 3-Level Evidence Drill-Down
- Red Flag Identification
- Stock Comparison (Side-by-Side)
- RAG-Based AI Assistant
- Stock-Specific Q&A
- Verified Signal Queries

### PERS (Personalization) - 11 Features
- 6D Personalization Engine
- Investment Thesis Profiles (Growth/Value/Agnostic)
- Risk Tolerance Calibration
- Time Horizon Alignment
- Experience Level Adaptation
- Sector Preference Filtering
- Portfolio Context Awareness
- Adaptive Complexity Explainers
- Position Sizing Guidance
- Entry Timing Guidance
- For You Discovery + Portfolio-Aware Suggestions

### LEARN (Learning & Education) - 14 Features
- Metric-by-Metric Learning Mode
- Contextual Learning (Hover tooltips)
- Analysis Journal (Auto-logging)
- Journal System-Prompted Feedback
- Highlight-to-Note
- Decision Logging (Buy/Hold/Avoid)
- Outcome Tracking
- Blind Spot Detection
- Progressive Skill Development
- Pattern Recognition Feedback
- Interactive Learning via Chat
- Historical Drawdown Education
- Position Tracking

### UX (Interface) - 12 Features
- Progressive Disclosure Scorecard
- DIY ↔ DFY Toggle
- Unified Discovery Section
- Watchlist Management
- Plain English Explanations
- Guided Onboarding
- Personalization Presets
- Analysis Sharing & Export
- Free Tier Indicator & Pricing UI
- Profile Switcher (demo-specific)

### ENG (Engagement) - 11 Features
- Smart Alerts (Customizable)
- Score Drop/Peer Rank Change Alerts
- Quarterly Earnings Alerts
- Portfolio Concentration Alerts
- Thesis-Breaking Event Alerts
- News & Event Integration
- Trending Stocks
- Top Rated by Sector
- Score Movers
- Community Signals

### VAL (Validation Entry) - 8 Features
- Forward-Testing Simulator (entry CTA)
- Backtesting Engine (home screen)
- Advisor Marketplace (browse view)
- 3-Tier Advisor System
- Verified Credentials & Track Record

---

## 11 Analysis Segments

1. **Profitability** - ROE, ROA, ROCE, margins
2. **Financial Ratios** - Liquidity, efficiency ratios
3. **Growth** - Revenue, profit, EPS growth trends
4. **Valuation** - P/E, P/B, EV/EBITDA, PEG
5. **Price & Volume** - Price action, volume trends
6. **Technical Indicators** - RSI, MACD, moving averages
7. **Broker Ratings** - Analyst consensus, target prices
8. **Ownership** - Promoter, FII, DII holdings
9. **F&O** - Futures & options data
10. **Income Statement** - Revenue, expenses, profit breakdown
11. **Balance Sheet/Cash Flow** - Assets, liabilities, cash flows

---

## Product Roadmap

### Phase 1 (Current): AI Research Analyst
- Comprehensive stock analysis (4-5 DFY segments, others DIY)
- Evidence citations
- Contextual learning
- Analysis journal

### Phase 2 (2027): Advisory & Personalization
- Personalized Buy/Hold/Sell verdicts
- Position sizing & entry timing
- Human advisory marketplace (50+ SEBI-registered advisors)
- Forward & backward testing
- DIY screener

### Phase 3 (2028-2030): Full-Stack Platform
- Transaction execution (broker integration)
- Mutual funds analysis
- Vernacular support (Hindi, Tamil, Telugu, etc.)
- Community consensus features

---

## Target Audience

### Primary ICP
- **Age**: 22-35 years (sweet spot: 22-30)
- **Income**: ₹5L - ₹15L+ annually
- **Location**: Pan-India (Tier 1 and Tier 2/3 cities)
- **Profile**: Salaried professionals (IT, engineering, consulting), entrepreneurs
- **Portfolio**: ₹1L - ₹15L, adding ₹10K-50K monthly
- **Experience**: Beginners (<2 years) to Intermediate (2-5 years)

### User Segments
| Segment | % | Description |
|---------|---|-------------|
| Efficiency Seekers | 30% | Want good decisions fast, don't want to become experts |
| Control Freaks | 30% | Don't trust tips, want to verify everything themselves |
| Validation Seekers | 30% | Research on their own but need expert confirmation |
| Aspiring Learners | 10% | Want to learn investing properly, willing to invest time |

### Key Pain Points Addressed
- **Analysis Paralysis**: 78% abandon research without deciding
- **Time Constraint**: 45+ minutes to research one stock
- **Information Overload**: Conflicting information, can't separate signal from noise
- **Jargon Barrier**: Financial terms incomprehensible without learning separately
- **No Synthesis**: Tools show data but don't explain "what does this mean?"

### Anti-Personas (Who we don't serve)
- Day traders (intraday focus)
- HNIs with existing advisors (₹50L+ portfolios)
- Pure passive investors (only MF SIPs)
- Hardcoded tip-followers (no interest in understanding)

---

## Screen Inventory (MLP Prototype)

1. Profile Context Card - Shows current user's 6D profile
2. Home/Dashboard - Watchlist, alerts, discovery tabs
3. Stock Analysis (Main) - Scorecard, 11 segments, verdict
4. Segment Deep-Dive - Metrics, citations, trajectory
5. AI Chat - Stock Q&A, learning
6. Stock Comparison - Side-by-side view
7. Analysis Journal - Past analyses, notes, outcomes
8. Portfolio View - Holdings, health check, P&L
9. Discovery Hub - Trending, top rated, for you
10. Advisor Marketplace - Browse advisors (Phase 2 entry)
11. Backtest Home - Simulator concept (Phase 2 entry)
12. Profile/Settings - Profile switcher, preferences
13. Alerts Center - Notification types, settings

---

## Development Guidelines

### Git Workflow

- **Main Branch:** Use for stable, production-ready code
- **Feature Branches:** Create branches prefixed with `feature/` for new features
- **Commit Messages:** Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for code refactoring
  - `test:` for adding tests
  - `chore:` for maintenance tasks

### Code Style Conventions

#### General
- Keep functions small and focused (single responsibility)
- Use descriptive variable and function names
- Add comments for complex logic, not obvious code
- Handle errors appropriately - don't silently fail

#### File Organization
- Group related functionality in modules/directories
- Keep configuration separate from business logic
- Place tests adjacent to or mirroring source structure

### Security Considerations

For a financial data application:
- Never commit API keys or secrets to the repository
- Use environment variables for sensitive configuration
- Validate and sanitize all external data inputs
- Be cautious with financial data accuracy

### Writing Guidelines
- Use ₹ symbol for Indian Rupee currency
- Follow "plain English" principle - avoid unnecessary jargon
- Maintain the "doctor analogy" positioning
- Cite evidence and sources where applicable
- Use active voice and concise sentences

---

## Key Metrics & Terminology

### Key Metrics to Remember
| Metric | Value |
|--------|-------|
| Metrics analyzed | 200+ |
| Analysis segments | 11 |
| Citation target | 94% |
| Per-stock pricing | ₹99/year |
| Free tier | 3 stocks |
| Time savings | 35+ min per stock |

### Important Terminology
| Term | Definition |
|------|------------|
| DFY | Done-for-You - Fully interpreted segments with AI-generated insights |
| DIY | Do-it-Yourself - Data segments for self-analysis |
| RAG | Retrieval-Augmented Generation - AI technology powering insights |
| SEBI RA | Securities and Exchange Board of India - Research Analyst license |
| 6D Personalization | 6-dimension personalization: Thesis, Risk, Horizon, Experience, Sector Pref, Portfolio Context |
| CVP | Core Value Proposition |
| MLP | Minimum Lovable Product (prototype) |
| ICP | Ideal Customer Profile |

### Competitive Positioning
| Competitor | Type | StockFox Differentiator |
|------------|------|------------------------|
| Screener.in | Data tool | We synthesize + interpret, not just show data |
| Tickertape | Data tool | More segments (11 vs 6-8), personalized verdicts |
| Liquide | Advisory | Transparent reasoning, not black-box recommendations |
| Traditional advisors | Human advisory | 500x cheaper (₹99 vs ₹50K/year) |

---

## AI Assistant Instructions

### When Working on This Project

1. **Check Current State First** - The project is evolving; verify what exists before making assumptions
2. **Follow Established Patterns** - Once conventions are set, maintain consistency
3. **Update This Document** - Keep CLAUDE.md current as the project develops
4. **Prioritize Security** - Financial data requires careful handling
5. **Maintain Doctor Analogy** - Keep positioning consistent in all user-facing content

### Things to Avoid

- Don't commit sensitive data (API keys, credentials)
- Don't break existing functionality without discussion
- Don't add unnecessary complexity to a simple solution
- Don't create files unless necessary
- Don't use financial jargon without explanation

---

*Last Updated: 2026-01-15*
*Document Version: 2.0*
