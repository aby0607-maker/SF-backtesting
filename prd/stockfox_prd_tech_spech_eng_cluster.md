# StockFox MLP - PRD + Technical Specification
## ENG (Engagement) Cluster

**Version:** 1.0  
**Date:** January 15, 2025  
**Status:** Ready for Implementation  
**Cluster Scope:** Alerts System, Notifications, Discovery Engagement, News Integration

---

## Executive Summary

The Engagement cluster drives user retention and creates the "repeat loop" that brings users back to StockFox. It covers two main areas:
1. **Alerts System** - Proactive notifications about portfolio/watchlist changes
2. **Discovery Engagement** - Social proof and trending content that creates exploration opportunities

**Demo Objective:** Show concepts through functional UI that demonstrates the engagement mechanisms, even with mock data. Users should understand how StockFox keeps them informed without requiring constant checking.

---

## Part 1: PRD - Functional Requirements

---

### 1.1 Feature Overview

| ID | Feature | Priority | Demo Scope |
|----|---------|----------|------------|
| F1 | Smart Alerts (Customizable) | High | Settings UI + sample alerts |
| F2 | Score Drop Alerts | High | Live notification example |
| F3 | Peer Rank Change Alerts | Medium | In alert list |
| F4 | Quarterly Earnings Alerts | Medium | Calendar UI shown |
| F5 | Portfolio Concentration Alerts | High | Contextual warning |
| F6 | Thesis-Breaking Event Alerts | High | Key alert type demo |
| F7 | News & Event Integration | Medium | News feed section |
| J2 | Trending Stocks | Medium | Discovery tab content |
| J3 | Top Rated by Sector | Medium | Leaderboard view |
| J4 | Score Movers | Medium | Score change highlights |
| J9 | Community Signals | Low | Social proof indicators |

---

### 1.2 User Stories

**Primary User Story - Alerts:**
> As a retail investor with limited time, I want to be notified only when something thesis-relevant changes in my watchlist/portfolio, so I can stay informed without constantly checking the app.

**Primary User Story - Discovery:**
> As a user exploring investment opportunities, I want to see what other smart investors are analyzing and what's trending, so I can discover stocks I might have missed.

**Persona-Specific Stories:**

**Analytical Ankit (Efficiency Seeker):**
> "Alert me when score drops significantly or thesis breaks. Don't waste my time with noise."
- Wants: Thesis-breaking events, score drops >1 point
- Doesn't want: Every news article, minor fluctuations

**Skeptical Sneha (Control Freak):**
> "I want to configure exactly what triggers alerts. Show me the reasoning behind each alert."
- Wants: Full control over alert thresholds, evidence trail
- Doesn't want: Generic alerts without context

**Curious Kavya (Beginner):**
> "Help me understand what I should be paying attention to. Guide me on what matters."
- Wants: Educational framing, recommended alert setups
- Doesn't want: Overwhelming configuration options

---

### 1.3 Alerts System Features

#### F1: Smart Alerts (Customizable)

**Concept:** User-controlled alert preferences that filter noise and surface only relevant signals.

**Alert Configuration Screen:**
```
┌─────────────────────────────────────────┐
│  🔔 Alert Preferences                   │
├─────────────────────────────────────────┤
│                                         │
│  SCORE & RANKING                        │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Score drops by more than     │    │
│  │   [▼ 1 point]  on watchlist    │    │
│  │                                 │    │
│  │ ☑ Peer rank changes by more    │    │
│  │   than [▼ 2 positions]         │    │
│  └─────────────────────────────────┘    │
│                                         │
│  PORTFOLIO HEALTH                       │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Concentration exceeds        │    │
│  │   [▼ 40%] in single sector     │    │
│  │                                 │    │
│  │ ☑ Holdings score drops below   │    │
│  │   [▼ 6.0/10]                   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  THESIS-BREAKING EVENTS                 │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Key metrics breach threshold │    │
│  │   (e.g., Debt ratio > 0.5)     │    │
│  │                                 │    │
│  │ ☑ Red flags detected           │    │
│  └─────────────────────────────────┘    │
│                                         │
│  EARNINGS & EVENTS                      │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Quarterly results declared   │    │
│  │   for watchlist stocks         │    │
│  │                                 │    │
│  │ ☐ Major news affecting stocks  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  NOTIFICATION DELIVERY                  │
│  ┌─────────────────────────────────┐    │
│  │ ◉ Push notifications           │    │
│  │ ◯ Email digest (daily)         │    │
│  │ ◯ In-app only                  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [ Save Preferences ]                   │
└─────────────────────────────────────────┘
```

**Profile-Specific Defaults:**

| Setting | Ankit (Growth) | Sneha (Value) | Kavya (Beginner) |
|---------|----------------|---------------|------------------|
| Score drop threshold | 0.5 points | 1.0 points | 1.5 points |
| Rank change threshold | 3 positions | 2 positions | 5 positions |
| Concentration limit | 50% | 30% | 40% |
| News alerts | Off | On | On |
| Earnings alerts | On | On | On |

---

#### F2: Score Drop Alerts

**Trigger:** Watchlist/portfolio stock score decreases by configured threshold.

**Alert Card Design:**
```
┌─────────────────────────────────────────┐
│ 🔻 SCORE DROP                      2h ago│
├─────────────────────────────────────────┤
│                                         │
│  Axis Bank Ltd.                         │
│  Score: 7.8 → 6.9 (-0.9)               │
│                                         │
│  📉 What Changed:                       │
│  • Profitability: 8.2 → 7.5 (-0.7)     │
│  • NPA ratio increased to 2.1%          │
│                                         │
│  ⚠️ This affects your portfolio         │
│  You hold ₹45,000 (12% allocation)      │
│                                         │
│  [View Analysis]  [Dismiss]             │
│                                         │
└─────────────────────────────────────────┘
```

**Alert Variations by Severity:**

| Severity | Score Drop | Color | Icon | Action |
|----------|------------|-------|------|--------|
| Minor | 0.3-0.5 | Yellow | ⚡ | Optional review |
| Moderate | 0.5-1.0 | Orange | ⚠️ | Review recommended |
| Significant | >1.0 | Red | 🔻 | Urgent review |

---

#### F3: Peer Rank Change Alerts

**Trigger:** Stock moves significantly in sector ranking.

**Alert Card Design:**
```
┌─────────────────────────────────────────┐
│ 📊 RANK CHANGE                     1d ago│
├─────────────────────────────────────────┤
│                                         │
│  TCS Ltd.                               │
│  Large-Cap IT: #1 → #3 (↓2)            │
│                                         │
│  🏆 New Rankings:                       │
│  1. Infosys (8.9) ↑1                   │
│  2. HCL Tech (8.7) ↑1                  │
│  3. TCS (8.5) ↓2                       │
│                                         │
│  Key Reason: Growth slowdown vs peers   │
│                                         │
│  [Compare Peers]  [View Analysis]       │
│                                         │
└─────────────────────────────────────────┘
```

---

#### F4: Quarterly Earnings Alerts

**Calendar View Component:**
```
┌─────────────────────────────────────────┐
│  📅 Upcoming Earnings                   │
│     January 2025                        │
├─────────────────────────────────────────┤
│  Mo  Tu  We  Th  Fr  Sa  Su            │
│       1   2   3   4   5               │
│   6   7   8   9  10  11  12            │
│  13  14  15  ●16 17  18  19            │
│  20  ●21 22  23  24  25  26            │
│  27  28  29  30  31                    │
├─────────────────────────────────────────┤
│  ● Jan 16: TCS Q3 Results               │
│  ● Jan 21: Axis Bank Q3 Results         │
│                                         │
│  [Set Reminder]  [Add to Calendar]      │
└─────────────────────────────────────────┘
```

**Pre-Earnings Alert (T-1 day):**
```
┌─────────────────────────────────────────┐
│ 📅 EARNINGS TOMORROW               12h ago│
├─────────────────────────────────────────┤
│                                         │
│  TCS Q3 FY25 Results                    │
│  Expected: Jan 16, 2025                 │
│                                         │
│  📊 What to Watch:                      │
│  • Revenue growth (consensus: +8% YoY)  │
│  • Deal wins commentary                 │
│  • Margin guidance                      │
│                                         │
│  Current Score: 8.5/10 | Rank: #3      │
│                                         │
│  [Pre-Earnings Analysis]  [Set Alert]   │
│                                         │
└─────────────────────────────────────────┘
```

---

#### F5: Portfolio Concentration Alerts

**Trigger:** Sector allocation exceeds user-configured threshold.

**Alert Card Design:**
```
┌─────────────────────────────────────────┐
│ ⚖️ CONCENTRATION WARNING          Today │
├─────────────────────────────────────────┤
│                                         │
│  High Banking Exposure Detected         │
│                                         │
│  Your Portfolio:                        │
│  ████████████░░░ 75% Banking           │
│  ███░░░░░░░░░░░░ 15% IT                │
│  ██░░░░░░░░░░░░░ 10% FMCG              │
│                                         │
│  ⚠️ Exceeds your limit of 40%          │
│                                         │
│  Holdings in Banking:                   │
│  • Axis Bank - ₹45,000 (35%)           │
│  • HDFC Bank - ₹52,000 (40%)           │
│                                         │
│  💡 Suggested Action:                   │
│  Consider diversifying into IT or       │
│  Pharma to reduce concentration risk.   │
│                                         │
│  [View Suggestions]  [Adjust Limit]     │
│                                         │
└─────────────────────────────────────────┘
```

**Profile-Specific Messaging:**

| Profile | Threshold | Messaging Tone |
|---------|-----------|----------------|
| Ankit | 50% | "Your growth portfolio is concentrated. Consider adding other growth sectors." |
| Sneha | 30% | "Value investors benefit from diversification. Data shows concentrated portfolios underperform." |
| Kavya | 40% | "Diversification tip: Spreading across sectors reduces risk. Here's why..." |

---

#### F6: Thesis-Breaking Event Alerts

**Trigger:** Key metric breaches the threshold that would invalidate the investment thesis.

**This is the most critical alert type** - it surfaces events that fundamentally change the investment case.

**Alert Card Design:**
```
┌─────────────────────────────────────────┐
│ 🚨 THESIS ALERT                    1h ago│
├─────────────────────────────────────────┤
│                                         │
│  Eternal (Zomato)                       │
│  ⚠️ Profitability Thesis at Risk       │
│                                         │
│  Your Thesis: "Path to profitability"   │
│  What Broke: Operating margin turned    │
│              negative (-2.3% vs +1.1%)  │
│                                         │
│  📉 Key Metric Change:                  │
│  • Operating Margin: +1.1% → -2.3%     │
│  • Burn Rate: ₹150Cr → ₹280Cr/quarter  │
│  • Cash Runway: 18 months → 12 months  │
│                                         │
│  🎯 For YOUR Growth Profile:            │
│  This challenges the growth-to-         │
│  profitability narrative you invested   │
│  on. Score impact: -1.2 points.         │
│                                         │
│  Recommended: Review position           │
│                                         │
│  [Full Analysis]  [Compare Thesis]      │
│                                         │
└─────────────────────────────────────────┘
```

**Thesis-Breaking Events by Investment Style:**

| Profile | Thesis-Breaking Events |
|---------|----------------------|
| Growth (Ankit) | Revenue growth <10%, market share loss, margin compression |
| Value (Sneha) | P/E expansion >20%, dividend cut, debt ratio >0.5 |
| Beginner (Kavya) | Score drops below 6.0, red flag count increases |

---

#### F7: News & Event Integration

**News Feed Component:**
```
┌─────────────────────────────────────────┐
│  📰 News for Your Watchlist             │
│  [All] [Earnings] [Management] [Sector] │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🏦 Axis Bank                    │    │
│  │ "Board approves ₹2,000 Cr QIP"  │    │
│  │ Impact: Neutral | 3h ago        │    │
│  │ [Read More]                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 💻 TCS                          │    │
│  │ "Wins $500M deal with US bank"  │    │
│  │ Impact: Positive | 1d ago       │    │
│  │ [Read More]                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🍔 Eternal (Zomato)             │    │
│  │ "Quick commerce losses widen"   │    │
│  │ Impact: Negative | 2d ago       │    │
│  │ [Read More]                     │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Load More News]                       │
│                                         │
└─────────────────────────────────────────┘
```

**News Impact Classification:**
| Impact | Color | Description |
|--------|-------|-------------|
| Positive | Green | Likely to improve fundamentals |
| Neutral | Gray | No material impact expected |
| Negative | Red | May affect fundamentals negatively |
| Under Review | Yellow | Analyzing impact |

---

### 1.4 Discovery Engagement Features

#### J2: Trending Stocks

**Component Design:**
```
┌─────────────────────────────────────────┐
│  🔥 Trending This Week                  │
│  Most analyzed by StockFox users        │
├─────────────────────────────────────────┤
│                                         │
│  1. Eternal (Zomato)     📈 +340%      │
│     8,247 analyses | Score: 6.8        │
│     "Everyone's debating profitability" │
│                                         │
│  2. Tata Motors          📈 +180%      │
│     5,123 analyses | Score: 7.9        │
│     "EV transition driving interest"    │
│                                         │
│  3. HDFC Bank            📈 +95%       │
│     4,891 analyses | Score: 8.2        │
│     "Merger integration update"         │
│                                         │
│  [View All Trending]                    │
│                                         │
└─────────────────────────────────────────┘
```

**Trending Calculation (Mock Logic):**
- Analysis count increase week-over-week
- Weighted by unique users
- Excludes stocks with <100 total analyses

---

#### J3: Top Rated by Sector

**Leaderboard Component:**
```
┌─────────────────────────────────────────┐
│  🏆 Top Rated Stocks                    │
│  [Banking] [IT] [Pharma] [FMCG] [Auto]  │
├─────────────────────────────────────────┤
│                                         │
│  BANKING SECTOR LEADERS                 │
│                                         │
│  🥇 HDFC Bank                          │
│     Score: 8.4/10 | Rank: #1 of 15     │
│     ✅ Strong ROE | ✅ Low NPA         │
│                                         │
│  🥈 ICICI Bank                         │
│     Score: 8.2/10 | Rank: #2 of 15     │
│     ✅ Growth | ⚠️ Concentration      │
│                                         │
│  🥉 Axis Bank                          │
│     Score: 7.8/10 | Rank: #3 of 15     │
│     ✅ Valuation | ⚠️ NPA trend       │
│                                         │
│  [View Full Sector Rankings]            │
│                                         │
└─────────────────────────────────────────┘
```

---

#### J4: Score Movers

**Component Design:**
```
┌─────────────────────────────────────────┐
│  📊 Biggest Score Changes               │
│  [Week] [Month] [Quarter]               │
├─────────────────────────────────────────┤
│                                         │
│  IMPROVERS ↑                           │
│  ┌─────────────────────────────────┐    │
│  │ Tata Power    7.2 → 8.1 (+0.9) │    │
│  │ Reason: Renewable capacity up   │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Sun Pharma    7.5 → 8.2 (+0.7) │    │
│  │ Reason: US FDA clearances       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  DECLINERS ↓                           │
│  ┌─────────────────────────────────┐    │
│  │ Paytm         5.8 → 4.9 (-0.9) │    │
│  │ Reason: Regulatory concerns     │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ Adani Green   6.5 → 5.8 (-0.7) │    │
│  │ Reason: Debt servicing concerns │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [View All Movers]                      │
│                                         │
└─────────────────────────────────────────┘
```

---

#### J9: Community Signals

**Social Proof Indicators:**
```
┌─────────────────────────────────────────┐
│  👥 Community Activity                  │
├─────────────────────────────────────────┤
│                                         │
│  On Axis Bank:                          │
│  • 1,247 users analyzed this stock      │
│  • 72% added to watchlist               │
│  • Average decision: HOLD (45%)         │
│                                         │
│  Common Observations:                   │
│  📊 "Strong retail franchise" (68%)     │
│  ⚠️ "NPA concerns" (45%)               │
│  💡 "Attractive valuation" (52%)        │
│                                         │
│  [Show after completing your analysis]  │
│                                         │
└─────────────────────────────────────────┘
```

**Important:** Community signals shown AFTER user completes their analysis to avoid herding behavior.

---

### 1.5 Alerts Center Screen

**Full Alerts Center Design:**
```
┌─────────────────────────────────────────┐
│  🔔 Alerts                    ⚙️ Settings│
│  [All] [Scores] [Portfolio] [Earnings]  │
├─────────────────────────────────────────┤
│                                         │
│  TODAY                                  │
│  ┌─────────────────────────────────┐    │
│  │ 🚨 Thesis Alert - Eternal      │    │
│  │ Profitability thesis at risk    │    │
│  │ 1h ago                          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ 🔻 Score Drop - Axis Bank      │    │
│  │ 7.8 → 6.9 (-0.9)               │    │
│  │ 2h ago                          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  YESTERDAY                              │
│  ┌─────────────────────────────────┐    │
│  │ 📊 Rank Change - TCS           │    │
│  │ Large-Cap IT: #1 → #3          │    │
│  │ 1d ago                          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ ⚖️ Concentration Warning       │    │
│  │ 75% Banking exceeds 40% limit  │    │
│  │ 1d ago                          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  THIS WEEK                              │
│  ┌─────────────────────────────────┐    │
│  │ 📅 Earnings - TCS Q3           │    │
│  │ Results expected Jan 16         │    │
│  │ 3d ago                          │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [Load More]                            │
│                                         │
└─────────────────────────────────────────┘
```

---

## Part 2: Technical Specification

---

### 2.1 Data Structures

#### Alert Types Enum
```typescript
enum AlertType {
  SCORE_DROP = 'score_drop',
  RANK_CHANGE = 'rank_change',
  THESIS_BREAKING = 'thesis_breaking',
  CONCENTRATION = 'concentration',
  EARNINGS = 'earnings',
  NEWS = 'news'
}

enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum AlertStatus {
  UNREAD = 'unread',
  READ = 'read',
  DISMISSED = 'dismissed',
  ACTIONED = 'actioned'
}
```

#### Alert Interface
```typescript
interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  timestamp: Date;
  stockSymbol?: string;
  stockName?: string;
  title: string;
  summary: string;
  details: AlertDetails;
  actions: AlertAction[];
  profileRelevance: ProfileRelevance;
}

interface AlertDetails {
  // For Score Drop
  previousScore?: number;
  currentScore?: number;
  changeAmount?: number;
  affectedSegments?: SegmentChange[];
  
  // For Rank Change
  previousRank?: number;
  currentRank?: number;
  totalInCategory?: number;
  categoryName?: string;
  newRankings?: RankEntry[];
  
  // For Thesis Breaking
  thesisType?: string;
  brokenMetric?: string;
  previousValue?: string;
  currentValue?: string;
  impactDescription?: string;
  
  // For Concentration
  sectorName?: string;
  currentAllocation?: number;
  threshold?: number;
  holdings?: HoldingEntry[];
  suggestions?: string[];
  
  // For Earnings
  expectedDate?: Date;
  quarterLabel?: string;
  keyMetricsToWatch?: string[];
}

interface SegmentChange {
  segmentName: string;
  previousScore: number;
  currentScore: number;
  keyReason: string;
}

interface AlertAction {
  label: string;
  actionType: 'navigate' | 'dismiss' | 'snooze' | 'external';
  destination?: string;
}

interface ProfileRelevance {
  profileId: string;
  relevanceScore: number; // 0-100
  personalizedMessage: string;
}
```

#### Alert Preferences Interface
```typescript
interface AlertPreferences {
  profileId: string;
  
  // Score & Ranking
  scoreDropEnabled: boolean;
  scoreDropThreshold: number; // e.g., 0.5, 1.0
  rankChangeEnabled: boolean;
  rankChangeThreshold: number; // e.g., 2, 3
  
  // Portfolio Health
  concentrationEnabled: boolean;
  concentrationThreshold: number; // percentage, e.g., 40
  holdingScoreEnabled: boolean;
  holdingScoreThreshold: number; // e.g., 6.0
  
  // Thesis Breaking
  thesisBreakingEnabled: boolean;
  redFlagEnabled: boolean;
  
  // Earnings & Events
  earningsEnabled: boolean;
  newsEnabled: boolean;
  
  // Delivery
  deliveryMethod: 'push' | 'email_daily' | 'in_app_only';
  quietHoursStart?: string; // e.g., "22:00"
  quietHoursEnd?: string; // e.g., "08:00"
}
```

#### Discovery Data Interfaces
```typescript
interface TrendingStock {
  symbol: string;
  name: string;
  analysisCount: number;
  weekOverWeekChange: number; // percentage
  currentScore: number;
  trendingReason: string;
}

interface SectorLeaderboard {
  sectorName: string;
  stocks: LeaderboardEntry[];
}

interface LeaderboardEntry {
  rank: number;
  symbol: string;
  name: string;
  score: number;
  highlights: string[];
  warnings: string[];
}

interface ScoreMover {
  symbol: string;
  name: string;
  previousScore: number;
  currentScore: number;
  change: number;
  reason: string;
  timeframe: 'week' | 'month' | 'quarter';
  direction: 'up' | 'down';
}

interface CommunitySignal {
  stockSymbol: string;
  totalAnalyses: number;
  watchlistAddRate: number; // percentage
  decisionDistribution: {
    buy: number;
    hold: number;
    avoid: number;
  };
  commonObservations: {
    text: string;
    percentage: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}
```

---

### 2.2 Mock Data

#### Sample Alerts by Profile

**Ankit's Alerts (Growth Investor):**
```typescript
const ankitAlerts: Alert[] = [
  {
    id: 'alert-001',
    type: AlertType.THESIS_BREAKING,
    severity: AlertSeverity.CRITICAL,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-15T09:30:00'),
    stockSymbol: 'ETERNAL',
    stockName: 'Eternal (Zomato)',
    title: 'Profitability Thesis at Risk',
    summary: 'Operating margin turned negative, challenging growth-to-profitability narrative',
    details: {
      thesisType: 'Growth to Profitability',
      brokenMetric: 'Operating Margin',
      previousValue: '+1.1%',
      currentValue: '-2.3%',
      impactDescription: 'Path to profitability delayed by 2-3 quarters'
    },
    actions: [
      { label: 'Full Analysis', actionType: 'navigate', destination: '/analysis/ETERNAL' },
      { label: 'Compare Thesis', actionType: 'navigate', destination: '/journal/ETERNAL' }
    ],
    profileRelevance: {
      profileId: 'ankit',
      relevanceScore: 95,
      personalizedMessage: 'As a growth investor, this directly impacts your investment thesis.'
    }
  },
  {
    id: 'alert-002',
    type: AlertType.SCORE_DROP,
    severity: AlertSeverity.MEDIUM,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-15T07:15:00'),
    stockSymbol: 'AXISBANK',
    stockName: 'Axis Bank',
    title: 'Score Dropped by 0.9 Points',
    summary: 'Profitability segment weakened due to NPA increase',
    details: {
      previousScore: 7.8,
      currentScore: 6.9,
      changeAmount: -0.9,
      affectedSegments: [
        {
          segmentName: 'Profitability',
          previousScore: 8.2,
          currentScore: 7.5,
          keyReason: 'NPA ratio increased to 2.1%'
        }
      ]
    },
    actions: [
      { label: 'View Analysis', actionType: 'navigate', destination: '/analysis/AXISBANK' },
      { label: 'Dismiss', actionType: 'dismiss' }
    ],
    profileRelevance: {
      profileId: 'ankit',
      relevanceScore: 75,
      personalizedMessage: 'This holding represents 12% of your portfolio.'
    }
  },
  {
    id: 'alert-003',
    type: AlertType.RANK_CHANGE,
    severity: AlertSeverity.LOW,
    status: AlertStatus.READ,
    timestamp: new Date('2025-01-14T14:00:00'),
    stockSymbol: 'TCS',
    stockName: 'TCS',
    title: 'Rank Dropped in Large-Cap IT',
    summary: 'TCS moved from #1 to #3 in sector rankings',
    details: {
      previousRank: 1,
      currentRank: 3,
      totalInCategory: 12,
      categoryName: 'Large-Cap IT',
      newRankings: [
        { rank: 1, symbol: 'INFY', name: 'Infosys', score: 8.9 },
        { rank: 2, symbol: 'HCLTECH', name: 'HCL Tech', score: 8.7 },
        { rank: 3, symbol: 'TCS', name: 'TCS', score: 8.5 }
      ]
    },
    actions: [
      { label: 'Compare Peers', actionType: 'navigate', destination: '/compare/TCS/INFY' },
      { label: 'View Analysis', actionType: 'navigate', destination: '/analysis/TCS' }
    ],
    profileRelevance: {
      profileId: 'ankit',
      relevanceScore: 60,
      personalizedMessage: 'Growth slowdown relative to peers may impact returns.'
    }
  }
];
```

**Sneha's Alerts (Value Investor):**
```typescript
const snehaAlerts: Alert[] = [
  {
    id: 'alert-101',
    type: AlertType.CONCENTRATION,
    severity: AlertSeverity.HIGH,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-15T10:00:00'),
    title: 'High Banking Sector Concentration',
    summary: 'Portfolio allocation to Banking exceeds your 30% limit',
    details: {
      sectorName: 'Banking',
      currentAllocation: 65,
      threshold: 30,
      holdings: [
        { symbol: 'AXISBANK', name: 'Axis Bank', allocation: 35 },
        { symbol: 'HDFCBANK', name: 'HDFC Bank', allocation: 30 }
      ],
      suggestions: [
        'Consider trimming banking positions',
        'Explore IT or Pharma for diversification',
        'Review sector correlation risk'
      ]
    },
    actions: [
      { label: 'View Suggestions', actionType: 'navigate', destination: '/discovery?filter=diversify' },
      { label: 'Adjust Limit', actionType: 'navigate', destination: '/settings/alerts' }
    ],
    profileRelevance: {
      profileId: 'sneha',
      relevanceScore: 90,
      personalizedMessage: 'As a value investor, diversification protects against sector-specific risks.'
    }
  },
  {
    id: 'alert-102',
    type: AlertType.EARNINGS,
    severity: AlertSeverity.LOW,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-14T08:00:00'),
    stockSymbol: 'TCS',
    stockName: 'TCS',
    title: 'TCS Q3 Results Tomorrow',
    summary: 'Quarterly results expected January 16, 2025',
    details: {
      expectedDate: new Date('2025-01-16'),
      quarterLabel: 'Q3 FY25',
      keyMetricsToWatch: [
        'Revenue growth (consensus: +8% YoY)',
        'Deal wins commentary',
        'Margin guidance'
      ]
    },
    actions: [
      { label: 'Pre-Earnings Analysis', actionType: 'navigate', destination: '/analysis/TCS' },
      { label: 'Set Reminder', actionType: 'snooze' }
    ],
    profileRelevance: {
      profileId: 'sneha',
      relevanceScore: 70,
      personalizedMessage: 'Focus on dividend payout ratio and cash generation metrics.'
    }
  }
];
```

**Kavya's Alerts (Beginner):**
```typescript
const kavyaAlerts: Alert[] = [
  {
    id: 'alert-201',
    type: AlertType.SCORE_DROP,
    severity: AlertSeverity.HIGH,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-15T08:00:00'),
    stockSymbol: 'ETERNAL',
    stockName: 'Eternal (Zomato)',
    title: 'Stock Score Dropped Significantly',
    summary: 'Score dropped from 7.2 to 5.9 - below the healthy threshold',
    details: {
      previousScore: 7.2,
      currentScore: 5.9,
      changeAmount: -1.3,
      affectedSegments: [
        {
          segmentName: 'Profitability',
          previousScore: 6.5,
          currentScore: 4.8,
          keyReason: 'Company is now losing money each quarter'
        }
      ]
    },
    actions: [
      { label: 'Understand Why', actionType: 'navigate', destination: '/analysis/ETERNAL?explain=true' },
      { label: 'Dismiss', actionType: 'dismiss' }
    ],
    profileRelevance: {
      profileId: 'kavya',
      relevanceScore: 85,
      personalizedMessage: '💡 Learning tip: Score drops often indicate fundamental changes. Click to learn what changed.'
    }
  },
  {
    id: 'alert-202',
    type: AlertType.NEWS,
    severity: AlertSeverity.LOW,
    status: AlertStatus.UNREAD,
    timestamp: new Date('2025-01-14T16:00:00'),
    stockSymbol: 'AXISBANK',
    stockName: 'Axis Bank',
    title: 'Important News Update',
    summary: 'Board approves ₹2,000 Cr QIP - what this means for the stock',
    details: {
      // News-specific details would go here
    },
    actions: [
      { label: 'Read & Learn', actionType: 'navigate', destination: '/news/AXISBANK/123' },
      { label: 'Dismiss', actionType: 'dismiss' }
    ],
    profileRelevance: {
      profileId: 'kavya',
      relevanceScore: 65,
      personalizedMessage: '📚 Learning opportunity: QIP is a way companies raise money. Tap to learn more.'
    }
  }
];
```

#### Alert Preferences by Profile
```typescript
const alertPreferences: Record<string, AlertPreferences> = {
  ankit: {
    profileId: 'ankit',
    scoreDropEnabled: true,
    scoreDropThreshold: 0.5,
    rankChangeEnabled: true,
    rankChangeThreshold: 3,
    concentrationEnabled: true,
    concentrationThreshold: 50,
    holdingScoreEnabled: true,
    holdingScoreThreshold: 6.0,
    thesisBreakingEnabled: true,
    redFlagEnabled: true,
    earningsEnabled: true,
    newsEnabled: false, // Efficiency seeker - less noise
    deliveryMethod: 'push'
  },
  sneha: {
    profileId: 'sneha',
    scoreDropEnabled: true,
    scoreDropThreshold: 1.0, // Higher threshold - more conservative
    rankChangeEnabled: true,
    rankChangeThreshold: 2,
    concentrationEnabled: true,
    concentrationThreshold: 30, // Stricter diversification
    holdingScoreEnabled: true,
    holdingScoreThreshold: 6.5,
    thesisBreakingEnabled: true,
    redFlagEnabled: true,
    earningsEnabled: true,
    newsEnabled: true, // Wants full evidence
    deliveryMethod: 'push'
  },
  kavya: {
    profileId: 'kavya',
    scoreDropEnabled: true,
    scoreDropThreshold: 1.5, // Higher threshold - less overwhelming
    rankChangeEnabled: false, // Too advanced for beginner
    concentrationEnabled: true,
    concentrationThreshold: 40,
    holdingScoreEnabled: true,
    holdingScoreThreshold: 6.0,
    thesisBreakingEnabled: false, // Simplified alerts
    redFlagEnabled: true,
    earningsEnabled: true,
    newsEnabled: true, // Learning opportunity
    deliveryMethod: 'in_app_only' // Less intrusive for beginner
  }
};
```

#### Discovery Mock Data
```typescript
const trendingStocks: TrendingStock[] = [
  {
    symbol: 'ETERNAL',
    name: 'Eternal (Zomato)',
    analysisCount: 8247,
    weekOverWeekChange: 340,
    currentScore: 6.8,
    trendingReason: "Everyone's debating profitability path"
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors',
    analysisCount: 5123,
    weekOverWeekChange: 180,
    currentScore: 7.9,
    trendingReason: 'EV transition driving interest'
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    analysisCount: 4891,
    weekOverWeekChange: 95,
    currentScore: 8.2,
    trendingReason: 'Merger integration update'
  }
];

const bankingLeaderboard: SectorLeaderboard = {
  sectorName: 'Banking',
  stocks: [
    {
      rank: 1,
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      score: 8.4,
      highlights: ['Strong ROE', 'Low NPA'],
      warnings: []
    },
    {
      rank: 2,
      symbol: 'ICICIBANK',
      name: 'ICICI Bank',
      score: 8.2,
      highlights: ['Strong growth'],
      warnings: ['Concentration risk']
    },
    {
      rank: 3,
      symbol: 'AXISBANK',
      name: 'Axis Bank',
      score: 7.8,
      highlights: ['Attractive valuation'],
      warnings: ['NPA trend']
    }
  ]
};

const scoreMovers: ScoreMover[] = [
  {
    symbol: 'TATAPOWER',
    name: 'Tata Power',
    previousScore: 7.2,
    currentScore: 8.1,
    change: 0.9,
    reason: 'Renewable capacity expansion',
    timeframe: 'week',
    direction: 'up'
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharma',
    previousScore: 7.5,
    currentScore: 8.2,
    change: 0.7,
    reason: 'US FDA clearances',
    timeframe: 'week',
    direction: 'up'
  },
  {
    symbol: 'PAYTM',
    name: 'Paytm',
    previousScore: 5.8,
    currentScore: 4.9,
    change: -0.9,
    reason: 'Regulatory concerns',
    timeframe: 'week',
    direction: 'down'
  }
];

const communitySignals: Record<string, CommunitySignal> = {
  AXISBANK: {
    stockSymbol: 'AXISBANK',
    totalAnalyses: 1247,
    watchlistAddRate: 72,
    decisionDistribution: {
      buy: 28,
      hold: 45,
      avoid: 27
    },
    commonObservations: [
      { text: 'Strong retail franchise', percentage: 68, sentiment: 'positive' },
      { text: 'NPA concerns', percentage: 45, sentiment: 'negative' },
      { text: 'Attractive valuation', percentage: 52, sentiment: 'positive' }
    ]
  }
};
```

---

### 2.3 Component Architecture

```
src/
├── features/
│   └── engagement/
│       ├── components/
│       │   ├── AlertCard.tsx
│       │   ├── AlertsList.tsx
│       │   ├── AlertSettings.tsx
│       │   ├── AlertBadge.tsx
│       │   ├── ScoreDropAlert.tsx
│       │   ├── RankChangeAlert.tsx
│       │   ├── ThesisBreakingAlert.tsx
│       │   ├── ConcentrationAlert.tsx
│       │   ├── EarningsAlert.tsx
│       │   ├── NewsAlert.tsx
│       │   ├── EarningsCalendar.tsx
│       │   ├── NewsFeed.tsx
│       │   ├── TrendingStocks.tsx
│       │   ├── SectorLeaderboard.tsx
│       │   ├── ScoreMovers.tsx
│       │   └── CommunitySignals.tsx
│       ├── hooks/
│       │   ├── useAlerts.ts
│       │   ├── useAlertPreferences.ts
│       │   ├── useTrending.ts
│       │   └── useDiscovery.ts
│       ├── store/
│       │   ├── alertsSlice.ts
│       │   └── discoverySlice.ts
│       ├── data/
│       │   ├── mockAlerts.ts
│       │   ├── mockPreferences.ts
│       │   └── mockDiscovery.ts
│       └── types/
│           └── engagement.types.ts
├── screens/
│   └── AlertsCenter.tsx
└── ...
```

---

### 2.4 State Management

```typescript
// alertsSlice.ts
interface AlertsState {
  alerts: Alert[];
  preferences: AlertPreferences;
  unreadCount: number;
  loading: boolean;
  error: string | null;
  filters: {
    type: AlertType | 'all';
    status: AlertStatus | 'all';
    timeframe: 'today' | 'week' | 'month' | 'all';
  };
}

const initialState: AlertsState = {
  alerts: [],
  preferences: defaultPreferences,
  unreadCount: 0,
  loading: false,
  error: null,
  filters: {
    type: 'all',
    status: 'all',
    timeframe: 'all'
  }
};

// Actions
const alertsSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    setAlerts: (state, action: PayloadAction<Alert[]>) => {
      state.alerts = action.payload;
      state.unreadCount = action.payload.filter(a => a.status === AlertStatus.UNREAD).length;
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.status = AlertStatus.READ;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    dismissAlert: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find(a => a.id === action.payload);
      if (alert) {
        alert.status = AlertStatus.DISMISSED;
      }
    },
    updatePreferences: (state, action: PayloadAction<Partial<AlertPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setFilters: (state, action: PayloadAction<Partial<AlertsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    }
  }
});

// discoverySlice.ts
interface DiscoveryState {
  trending: TrendingStock[];
  leaderboards: Record<string, SectorLeaderboard>;
  scoreMovers: ScoreMover[];
  communitySignals: Record<string, CommunitySignal>;
  activeTab: 'trending' | 'top-rated' | 'movers' | 'for-you';
  loading: boolean;
}
```

---

### 2.5 Key Components

#### AlertCard Component
```tsx
interface AlertCardProps {
  alert: Alert;
  onAction: (action: AlertAction) => void;
  onDismiss: () => void;
  compact?: boolean;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onAction, onDismiss, compact }) => {
  const getIcon = () => {
    switch (alert.type) {
      case AlertType.SCORE_DROP: return <TrendingDown className="text-orange-500" />;
      case AlertType.RANK_CHANGE: return <BarChart className="text-blue-500" />;
      case AlertType.THESIS_BREAKING: return <AlertTriangle className="text-red-500" />;
      case AlertType.CONCENTRATION: return <PieChart className="text-yellow-500" />;
      case AlertType.EARNINGS: return <Calendar className="text-purple-500" />;
      case AlertType.NEWS: return <Newspaper className="text-gray-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case AlertSeverity.CRITICAL: return 'border-l-red-500 bg-red-50';
      case AlertSeverity.HIGH: return 'border-l-orange-500 bg-orange-50';
      case AlertSeverity.MEDIUM: return 'border-l-yellow-500 bg-yellow-50';
      case AlertSeverity.LOW: return 'border-l-gray-300 bg-gray-50';
    }
  };

  return (
    <div className={`border-l-4 rounded-lg p-4 ${getSeverityColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getIcon()}
          <div>
            <h4 className="font-semibold">{alert.title}</h4>
            {alert.stockName && (
              <span className="text-sm text-gray-600">{alert.stockName}</span>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-500">
          {formatRelativeTime(alert.timestamp)}
        </span>
      </div>
      
      <p className="mt-2 text-sm text-gray-700">{alert.summary}</p>
      
      {!compact && alert.profileRelevance && (
        <div className="mt-2 p-2 bg-white rounded text-sm">
          💡 {alert.profileRelevance.personalizedMessage}
        </div>
      )}
      
      <div className="mt-3 flex gap-2">
        {alert.actions.map((action, idx) => (
          <button
            key={idx}
            onClick={() => onAction(action)}
            className={idx === 0 ? 'btn-primary' : 'btn-secondary'}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};
```

#### AlertSettings Component
```tsx
const AlertSettings: React.FC = () => {
  const { preferences, updatePreferences } = useAlertPreferences();
  const { currentProfile } = useProfile();

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-semibold mb-3">Score & Ranking</h3>
        <div className="space-y-3">
          <ToggleWithThreshold
            label="Score drops by more than"
            enabled={preferences.scoreDropEnabled}
            value={preferences.scoreDropThreshold}
            options={[0.3, 0.5, 1.0, 1.5]}
            onToggle={(enabled) => updatePreferences({ scoreDropEnabled: enabled })}
            onValueChange={(value) => updatePreferences({ scoreDropThreshold: value })}
          />
          <ToggleWithThreshold
            label="Peer rank changes by more than"
            enabled={preferences.rankChangeEnabled}
            value={preferences.rankChangeThreshold}
            options={[1, 2, 3, 5]}
            suffix="positions"
            onToggle={(enabled) => updatePreferences({ rankChangeEnabled: enabled })}
            onValueChange={(value) => updatePreferences({ rankChangeThreshold: value })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Portfolio Health</h3>
        <div className="space-y-3">
          <ToggleWithThreshold
            label="Concentration exceeds"
            enabled={preferences.concentrationEnabled}
            value={preferences.concentrationThreshold}
            options={[30, 40, 50, 60]}
            suffix="% in single sector"
            onToggle={(enabled) => updatePreferences({ concentrationEnabled: enabled })}
            onValueChange={(value) => updatePreferences({ concentrationThreshold: value })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Thesis-Breaking Events</h3>
        <div className="space-y-3">
          <Toggle
            label="Key metrics breach threshold"
            enabled={preferences.thesisBreakingEnabled}
            onToggle={(enabled) => updatePreferences({ thesisBreakingEnabled: enabled })}
          />
          <Toggle
            label="Red flags detected"
            enabled={preferences.redFlagEnabled}
            onToggle={(enabled) => updatePreferences({ redFlagEnabled: enabled })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Earnings & Events</h3>
        <div className="space-y-3">
          <Toggle
            label="Quarterly results for watchlist"
            enabled={preferences.earningsEnabled}
            onToggle={(enabled) => updatePreferences({ earningsEnabled: enabled })}
          />
          <Toggle
            label="Major news affecting stocks"
            enabled={preferences.newsEnabled}
            onToggle={(enabled) => updatePreferences({ newsEnabled: enabled })}
          />
        </div>
      </section>

      <section>
        <h3 className="font-semibold mb-3">Notification Delivery</h3>
        <RadioGroup
          value={preferences.deliveryMethod}
          options={[
            { value: 'push', label: 'Push notifications' },
            { value: 'email_daily', label: 'Email digest (daily)' },
            { value: 'in_app_only', label: 'In-app only' }
          ]}
          onChange={(value) => updatePreferences({ deliveryMethod: value })}
        />
      </section>
    </div>
  );
};
```

---

### 2.6 Screen: Alerts Center

```tsx
const AlertsCenter: React.FC = () => {
  const { alerts, unreadCount, filters, setFilters, markAsRead, dismissAlert } = useAlerts();
  const navigate = useNavigate();

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (filters.type !== 'all' && alert.type !== filters.type) return false;
      if (filters.status !== 'all' && alert.status !== filters.status) return false;
      // Add timeframe filtering logic
      return true;
    });
  }, [alerts, filters]);

  const groupedAlerts = useMemo(() => {
    const groups: Record<string, Alert[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: []
    };
    
    filteredAlerts.forEach(alert => {
      const group = getTimeGroup(alert.timestamp);
      groups[group].push(alert);
    });
    
    return groups;
  }, [filteredAlerts]);

  const handleAction = (action: AlertAction) => {
    if (action.actionType === 'navigate' && action.destination) {
      navigate(action.destination);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6" />
          <h1 className="text-xl font-semibold">Alerts</h1>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button onClick={() => navigate('/settings/alerts')}>
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </header>

      {/* Filter Tabs */}
      <div className="bg-white border-b px-4 py-2 flex gap-2 overflow-x-auto">
        {['all', 'score_drop', 'thesis_breaking', 'concentration', 'earnings'].map(type => (
          <button
            key={type}
            onClick={() => setFilters({ type: type as AlertType | 'all' })}
            className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
              filters.type === type 
                ? 'bg-purple-100 text-purple-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {formatAlertType(type)}
          </button>
        ))}
      </div>

      {/* Alert Groups */}
      <div className="p-4 space-y-6">
        {groupedAlerts.today.length > 0 && (
          <AlertGroup 
            title="Today" 
            alerts={groupedAlerts.today}
            onAction={handleAction}
            onDismiss={dismissAlert}
            onRead={markAsRead}
          />
        )}
        
        {groupedAlerts.yesterday.length > 0 && (
          <AlertGroup 
            title="Yesterday" 
            alerts={groupedAlerts.yesterday}
            onAction={handleAction}
            onDismiss={dismissAlert}
            onRead={markAsRead}
          />
        )}
        
        {groupedAlerts.thisWeek.length > 0 && (
          <AlertGroup 
            title="This Week" 
            alerts={groupedAlerts.thisWeek}
            onAction={handleAction}
            onDismiss={dismissAlert}
            onRead={markAsRead}
          />
        )}

        {filteredAlerts.length === 0 && (
          <EmptyState
            icon={<BellOff />}
            title="No alerts"
            description="You're all caught up! We'll notify you when something important happens."
          />
        )}
      </div>
    </div>
  );
};
```

---

### 2.7 Integration Points

| Component | Integrates With | Data Flow |
|-----------|-----------------|-----------|
| AlertCard | Stock Analysis | Click → Navigate to analysis |
| ConcentrationAlert | Portfolio View | Uses portfolio holdings data |
| ThesisBreakingAlert | Journal | Links to logged thesis |
| EarningsAlert | AI Chat | Pre-earnings analysis queries |
| TrendingStocks | Discovery Hub | Part of discovery tabs |
| CommunitySignals | Stock Analysis | Shown after analysis complete |
| AlertBadge | Header/Nav | Unread count in navigation |

---

### 2.8 Acceptance Criteria

#### Alerts System
- [ ] All 6 alert types render correctly
- [ ] Alert cards show severity-appropriate styling
- [ ] Profile-specific messages display correctly
- [ ] Settings screen saves preferences
- [ ] Filter tabs work correctly
- [ ] Time grouping (Today/Yesterday/Week) works
- [ ] Mark as read updates unread count
- [ ] Dismiss removes alert from main list
- [ ] Navigation actions work correctly
- [ ] Badge in header shows unread count

#### Discovery Features
- [ ] Trending stocks load with mock data
- [ ] Sector leaderboard tabs switch correctly
- [ ] Score movers show improvers and decliners
- [ ] Community signals appear after analysis
- [ ] All cards navigate to correct screens

#### Profile-Specific Behavior
- [ ] Ankit sees efficiency-focused alerts
- [ ] Sneha sees evidence-heavy alerts with full details
- [ ] Kavya sees learning-framed alerts
- [ ] Default preferences match profile

---

### 2.9 Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| CVP + PERS Spec | Score data, stock analysis links | ✅ Complete |
| LEARN Spec | Journal integration for thesis alerts | ✅ Complete |
| UX Spec | Navigation, header badge integration | ✅ Complete |
| Mock Data Files | All alert content | ✅ Defined in spec |

---

## Appendix A: Alert Icon Reference

| Alert Type | Icon | Color | Use |
|------------|------|-------|-----|
| Score Drop | TrendingDown | Orange | Score decrease |
| Rank Change | BarChart | Blue | Ranking movement |
| Thesis Breaking | AlertTriangle | Red | Critical thesis event |
| Concentration | PieChart | Yellow | Portfolio warning |
| Earnings | Calendar | Purple | Upcoming event |
| News | Newspaper | Gray | News item |

---

## Appendix B: Severity Matrix

| Severity | Score Drop | Rank Change | When to Use |
|----------|------------|-------------|-------------|
| Critical | >1.5 | N/A | Thesis breaking events only |
| High | 1.0-1.5 | >5 | Requires immediate attention |
| Medium | 0.5-1.0 | 3-5 | Review recommended |
| Low | 0.3-0.5 | 1-2 | Informational |

---

*Technical Specification v1.0 - ENG Cluster - Ready for Implementation*

**Next Cluster: VAL (Validation)** - Covers Advisor Marketplace entry points and Backtest Simulator concepts.
