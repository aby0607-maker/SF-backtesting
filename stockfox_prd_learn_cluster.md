# StockFox MLP PRD: Learning & Education (LEARN) Cluster

**Version:** 1.0 | **Date:** January 15, 2025 | **Status:** Ready for Development

---

## Overview

This PRD covers the **Learning & Education (LEARN)** features that make StockFox an "investor confidence builder" rather than a tip-dependency creator. These features demonstrate Phase 2 of the user journey—where users build skills over time.

**Core Principle:** Users become MORE independent over time, not less.

**Features Covered:** E1-E9 (Learning & Education) + D5 (Interactive Learning via Chat)

---

## Strategic Context

### Why LEARN Cluster Matters for Demo

| Investor Objection | How LEARN Features Address It |
|-------------------|------------------------------|
| "Is this just another tip service?" | Journal + patterns show skill-building |
| "Will users become dependent?" | Blind spot detection builds independence |
| "What's the retention hook?" | Progressive skill levels + outcome tracking |
| "How is this different from Liquide?" | Transparency + education vs black-box tips |

### Demo Flow for LEARN Features
1. User sees pre-populated 6-month journal (simulated history)
2. Pattern detection shows "You favor profitable growers"
3. Blind spot alert: "You checked debt only 2/5 times"
4. Contextual tooltips explain metrics during analysis
5. AI chat answers "What does ROE mean?"

---

## F1: Analysis Journal - Core System (E2, E5)

### User Story
As an investor, I want my analysis decisions automatically logged so I can track my research journey and learn from outcomes.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Auto-Logging Trigger** | Every stock analysis completion creates entry |
| **Entry Fields** | Date, Stock, Score, User Verdict, Notes (optional) |
| **User Verdict Options** | BUY / WATCHLIST / SKIP / AVOID |
| **Notes Field** | Free-text, 280 char limit, optional |
| **Timeline View** | Chronological list, newest first |
| **Filter Options** | By verdict, by outcome, by sector |

### Entry States

| State | Display |
|-------|---------|
| **Pending** | Verdict logged, no outcome yet (grey) |
| **Win** | Stock up >10% from analysis date (green ✅) |
| **Loss** | Stock down >10% from analysis date (red ❌) |
| **Neutral** | Stock ±10% range (yellow ~) |

### Data Structure (Per Entry)
```
{
  id: string,
  date: ISO date,
  stock: { symbol, name, sector },
  score_at_analysis: number,
  user_verdict: "BUY" | "WATCHLIST" | "SKIP" | "AVOID",
  user_notes: string | null,
  price_at_analysis: number,
  current_price: number,
  outcome_status: "pending" | "win" | "loss" | "neutral",
  segments_checked: string[], // For blind spot detection
  time_spent: number // seconds
}
```

### Mock Data Reference
See `stockfox_mock_data_filled.md` Section 5 for 6-month journal entries per profile.

---

## F2: System-Prompted Feedback (E3)

### User Story
As an investor, I want prompts after each analysis to capture my thinking so I can reflect on my decision-making process.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Trigger** | After score viewed + 30 sec dwell time |
| **Prompt Modal** | Slides up from bottom (non-blocking) |
| **Dismiss** | Tap outside or "Skip" button |

### Prompt Flow
```
[Modal appears after analysis]

"Quick reflection 📝"

What's your verdict on {Stock}?
[ BUY ] [ WATCHLIST ] [ SKIP ] [ AVOID ]

What stood out to you? (optional)
[__________________________________]

[ Save to Journal ]  [ Skip for now ]
```

### Prompt Variants (Randomized)
1. "What's your verdict on {Stock}?"
2. "Based on your analysis, would you invest?"
3. "Quick note: What was the key factor for you?"
4. "Did this stock meet your criteria?"

### Acceptance Criteria
- [ ] Prompt appears only once per stock per session
- [ ] Dismissed prompts don't reappear for 24 hours
- [ ] Saved responses appear in journal within 2 sec

---

## F3: Outcome Tracking (E6)

### User Story
As an investor, I want to see how my analysis decisions performed so I can learn what works and what doesn't.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Tracking Period** | From analysis date to current |
| **Win Threshold** | >10% gain from analysis price |
| **Loss Threshold** | >10% loss from analysis price |
| **Neutral Range** | ±10% from analysis price |
| **Display Format** | Inline in journal entry |

### Outcome Display
```
[Journal Entry Card]

Jul 15, 2024 | Trent
Score: 7.8/10 | Your verdict: BUY

Outcome: +32% ✅
₹1,450 → ₹1,914 (since analysis)

Your note: "Retail growth plays can work"
```

### Win Rate Summary
```
[Profile Stats Card]

Your Decision Track Record (6 months)
═══════════════════════════════════
Wins: 4 | Losses: 1 | Neutral: 1

Win Rate: 67%

Best Call: Trent (+32%)
Worst Call: Asian Paints (-5%)
```

### Acceptance Criteria
- [ ] Outcomes update daily (or on app open)
- [ ] Win rate calculates only from resolved entries (excludes pending)
- [ ] Percentages use analysis-date price as baseline

---

## F4: Blind Spot Detection (E7)

### User Story
As an investor, I want to know which analysis areas I'm neglecting so I can develop comprehensive research habits.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Tracking Scope** | Last 10 analyses (rolling window) |
| **Segments Tracked** | All 11 segments from CVP cluster |
| **Alert Threshold** | Segment checked <40% of analyses |
| **Display Location** | Journal dashboard + inline alerts |

### Detection Logic
```python
# Pseudo-logic
for segment in 11_segments:
    check_rate = times_checked / total_analyses
    if check_rate < 0.4:
        trigger_blind_spot_alert(segment)
```

### Alert Display

**Dashboard Card:**
```
[Blind Spot Alert Card] ⚠️

Analysis Pattern (Last 10 stocks)
═══════════════════════════════════
Profitability:  ██████████ 100%
Growth:         ██████████ 100%
Valuation:      █████░░░░░ 55%
Debt:           ████░░░░░░ 40%
Ownership:      ██░░░░░░░░ 20% ⚠️

"You've been skipping Ownership analysis.
This shows institutional confidence in
management. Consider checking it next time."

[ Got it ] [ Learn about Ownership → ]
```

**Inline Alert (During Analysis):**
```
💡 Tip: You haven't checked Ownership in
   your last 5 analyses. Tap to explore.
```

### Profile-Specific Blind Spots (from Mock Data)

| Profile | Strong Areas | Blind Spots |
|---------|--------------|-------------|
| Ankit (Growth) | Profitability 100%, Growth 100% | Valuation 55%, Ownership 40% |
| Sneha (Value) | Valuation 100%, Debt 100% | Growth 35% |
| Kavya (Beginner) | Profitability 80% | Ownership 20%, Technical 10% |

### Acceptance Criteria
- [ ] Blind spot detection runs on each new analysis completion
- [ ] Alerts are dismissable but return after 3 more analyses if pattern continues
- [ ] "Learn about X" links to contextual education module

---

## F5: Pattern Recognition Feedback (E9)

### User Story
As an investor, I want StockFox to identify patterns in my analysis behavior so I can understand my investing style.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Minimum Data** | 5+ analyses required to detect patterns |
| **Pattern Categories** | Style preference, sector bias, metric focus |
| **Display Location** | Journal dashboard, Profile page |
| **Tone** | Encouraging, not judgmental |

### Pattern Detection Rules

| Pattern Type | Detection Logic | Message Template |
|--------------|-----------------|------------------|
| **Style Preference** | 60%+ stocks match thesis type | "You favor {growth/value/dividend} stocks" |
| **Sector Bias** | 40%+ stocks in same sector | "You've been focusing on {sector}" |
| **Quality Focus** | ROE >15% in 70%+ picks | "You gravitate toward high-quality businesses" |
| **Valuation Sensitivity** | P/E mentioned in 80%+ notes | "Valuation is clearly important to you" |

### Display Format

**Journal Dashboard:**
```
[Your Investing Patterns] 📊

Based on 12 analyses over 6 months:

"You favor profitable growers"
───────────────────────────────
80% of your picks have:
• Revenue growth >15%
• Positive net margins
• ROE above sector average

This is characteristic of a GARP
(Growth at Reasonable Price) approach.

[ Learn more about GARP investing → ]
```

**Profile Summary:**
```
Your Research DNA 🧬
═══════════════════════════════════
Style: Growth-oriented
Sectors: IT (40%), Banking (30%), Mixed (30%)
Key metric: Revenue Growth
Comfort zone: 15-25% volatility
Win rate: 67%
```

### Profile Pattern Messages (from Mock Data)

| Profile | Pattern Message |
|---------|-----------------|
| Ankit | "You favor profitable growers with strong revenue momentum. Your research focuses on growth metrics and profitability." |
| Sneha | "Your research pattern shows emphasis on FCF yield, debt levels, and dividend history. You avoid stocks where management doesn't have skin in the game." |
| Kavya | "You're building good research habits! You've analyzed stocks across 3 different sectors in 6 months. Your pattern shows methodical approach." |

### Acceptance Criteria
- [ ] Patterns update after each new analysis
- [ ] No patterns shown until 5+ analyses completed
- [ ] Pattern messages use profile-appropriate language

---

## F6: Progressive Skill Development (E8)

### User Story
As an investor, I want to see my progress as I learn more about investing so I feel motivated to continue.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Skill Levels** | 7 levels (see below) |
| **Level-Up Trigger** | Combination of analyses + metrics learned |
| **Display** | Badge in profile, journal header |
| **Gamification** | Minimal (badge only, no points) |

### Skill Level Definitions

| Level | Name | Requirements | Badge |
|-------|------|--------------|-------|
| 1 | Newcomer | Account created | 🌱 |
| 2 | Explorer | 3+ analyses | 🔍 |
| 3 | Learner | 10+ analyses, 3+ metrics learned | 📚 |
| 4 | Researcher | 20+ analyses, 6+ metrics, 1+ sector deep-dive | 🔬 |
| 5 | Analyst | 35+ analyses, 9+ metrics, 50%+ win rate | 📊 |
| 6 | Strategist | 50+ analyses, all 11 metrics, pattern identified | 🎯 |
| 7 | Expert | 75+ analyses, consistent blind spot coverage, 65%+ win rate | 🏆 |

### Profile Level Display (from Mock Data)

| Profile | Level | Badge | Message |
|---------|-------|-------|---------|
| Ankit | 5 - Analyst | 📊 | "Strong analytical foundation" |
| Sneha | 5 - Analyst | 📊 | "Disciplined value approach" |
| Kavya | 2 - Explorer | 🔍 | "Great progress! Learning the fundamentals" |

### Level-Up Notification
```
[Modal - Celebration]

🎉 Level Up!

You're now a RESEARCHER 🔬

You've analyzed 20+ stocks and learned
6 key metrics. Keep going!

Your next milestone:
Analyze 15 more stocks and learn 3 more
metrics to become an Analyst 📊

[ Continue ]
```

### Acceptance Criteria
- [ ] Level badge visible in profile and journal header
- [ ] Level-up triggers celebratory modal
- [ ] Progress toward next level shown in profile

---

## F7: Contextual Learning - Tooltips (E1)

### User Story
As an investor, I want to understand unfamiliar metrics without leaving my analysis flow so I can learn while doing.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Trigger** | Tap/hover on metric name or ℹ️ icon |
| **Display** | Bottom sheet (mobile) or popover (web) |
| **Content** | Plain English definition + "Why it matters" |
| **Dismiss** | Tap outside, swipe down, or X button |
| **Depth Levels** | Simple → Detailed (expandable) |

### Tooltip Content Structure
```
[Tooltip - ROE]

Return on Equity (ROE) 📈
════════════════════════════════════

In simple terms:
How much profit a company makes for every
₹100 of shareholder money invested.

Why it matters:
Higher ROE = management using your money
efficiently. Compare within same sector.

For {Stock}: 18.3%
Sector average: 14.2%
Verdict: ✅ Above average

[ Got it ] [ Learn more → ]
```

### Adaptive Complexity (Based on Skill Level)

| Skill Level | Tooltip Depth |
|-------------|---------------|
| 1-2 (Newcomer/Explorer) | Simple definition only |
| 3-4 (Learner/Researcher) | Definition + context |
| 5-7 (Analyst+) | Definition + context + advanced interpretation |

### Example - ROE by Level

**Level 1-2:**
> "ROE shows how well a company uses investor money. Higher is generally better."

**Level 3-4:**
> "ROE of 18.3% means the company generates ₹18.30 profit for every ₹100 invested. Compare to sector average (14.2%) - this company is more efficient."

**Level 5-7:**
> "ROE of 18.3% (vs sector 14.2%) driven by strong net margins (12%) and reasonable leverage (1.5x). DuPont decomposition: Net Margin × Asset Turnover × Equity Multiplier. Watch for ROE inflated by high debt."

### Acceptance Criteria
- [ ] All metrics in 11 segments have tooltips
- [ ] Tooltips load in <500ms
- [ ] "Learn more" tracks as metric learned for skill progression

---

## F8: Interactive Learning via Chat (D5)

### User Story
As an investor, I want to ask questions in natural language and get plain English explanations so I can learn at my own pace.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Trigger** | AI chat accessible from any analysis screen |
| **Input** | Free-text question |
| **Response** | Plain English, contextual to current stock |
| **Scope** | Educational queries only (not general chat) |

### Supported Query Types

| Category | Example Query | Response Type |
|----------|---------------|---------------|
| **Metric Explainer** | "What does P/E ratio mean?" | Definition + stock's value + context |
| **Comparison** | "Is this ROE good?" | Relative to sector, history |
| **Concept** | "What is a GARP investor?" | Definition + how to apply |
| **Stock-Specific** | "Why is debt ratio a concern here?" | Contextual explanation |
| **Strategy** | "How do value investors use P/B?" | Framework explanation |

### Example Exchanges

**Query 1: Metric Explanation**
```
User: "What is Quick Ratio?"

AI: "Quick Ratio shows if a company can pay
its short-term bills using only its most
liquid assets (cash + receivables).

For Zomato: 2.8
Rule of thumb: Above 1.0 is healthy
Verdict: ✅ Strong liquidity position

This means Zomato has ₹2.80 in liquid assets
for every ₹1 of short-term debt."
```

**Query 2: Why Question**
```
User: "Why is this stock showing high risk?"

AI: "I've flagged 3 risk factors for Zomato:

1. High volatility (Beta 1.8)
   Your tolerance is 25-30% drawdown,
   this stock can swing 40%+

2. Cash burn history
   Only recently profitable, may need
   capital in economic downturn

3. Regulatory uncertainty
   Quick commerce regulations pending

For your Growth profile, factors 2-3 are
acceptable trade-offs. Factor 1 depends on
your conviction level."
```

**Query 3: Learning Request**
```
User: "Explain ROE in simple terms with
a real example"

AI: "ROE = Return on Equity

Think of it like this:
If you gave ₹100 to a company, ROE tells
you how much profit they made with it.

Real example with TCS:
• Shareholders have invested ₹1,00,000 Cr
• TCS made ₹46,800 Cr profit last year
• ROE = 46,800/1,00,000 = 46.8%

Meaning: For every ₹100 shareholders own,
TCS generates ₹46.80 in profit annually.

Is 46.8% good?
Yes! IT sector average is 25-30%.
TCS is exceptional at generating returns."
```

### Acceptance Criteria
- [ ] Chat responds within 3 seconds
- [ ] Responses contextualized to current stock when relevant
- [ ] "I don't know" response for out-of-scope questions
- [ ] Response length adapts to skill level (shorter for beginners)

---

## F9: Learning Progress Tracking (E4 - Optional)

### User Story
As an investor, I want to track which metrics I've learned so I can see my knowledge growing.

### Requirements

| Component | Specification |
|-----------|--------------|
| **Tracking Trigger** | Tooltip "Learn more" clicked |
| **Progress Display** | Profile page, "My Learning" section |
| **Completion** | All metrics in a segment = segment badge |

### Learning Progress Display
```
[My Learning Journey] 📚

Metrics Mastered: 12/45

By Segment:
═══════════════════════════════════
Profitability     ████████░░ 4/5
Financial Ratios  ██████░░░░ 3/5
Growth            ██████████ 5/5 ✅
Valuation         ████░░░░░░ 2/5
[... remaining segments ...]

Next to learn:
• Debt-to-Equity Ratio (Financial Ratios)
• Price-to-Book (Valuation)
```

### Profile Learning Status (from Mock Data)

| Profile | Metrics Learned | Message |
|---------|-----------------|---------|
| Ankit | 12/45 | "Revenue Growth, Net Profit Margin, P/E Ratio..." |
| Sneha | 15/45 | "FCF Yield, Debt levels, Dividend history..." |
| Kavya | 6/45 | "Mastered: Revenue Growth, Net Margin, P/E. Next: ROE, D/E, Cash Flow" |

### Acceptance Criteria
- [ ] Learning tracked per profile
- [ ] Segment badge awarded when all metrics in segment learned
- [ ] Progress contributes to skill level progression

---

## Screen Specifications

### Journal Dashboard Screen

```
┌─────────────────────────────────────┐
│ ← Analysis Journal                  │
├─────────────────────────────────────┤
│ [Profile Badge] Analyst 📊          │
│ Win Rate: 67% | 12 analyses         │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ Your Patterns 📊                │ │
│ │ "You favor profitable growers"  │ │
│ │ [See full analysis →]           │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ⚠️ Blind Spot Alert             │ │
│ │ Ownership checked: 20%          │ │
│ │ [Learn why this matters →]      │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Recent Analyses                     │
│ ┌─────────────────────────────────┐ │
│ │ Nov 15 | ICICI Pru              │ │
│ │ 6.5/10 | SKIP | Neutral ~       │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Oct 5 | Asian Paints            │ │
│ │ 7.0/10 | BUY | -5% ❌           │ │
│ │ "Lesson: Check demand slowdown" │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ Sep 10 | HDFC Life              │ │
│ │ 6.8/10 | SKIP | -8% ✅          │ │
│ │ "Correctly avoided"             │ │
│ └─────────────────────────────────┘ │
│ [Load more...]                      │
└─────────────────────────────────────┘
```

### Learning Progress Screen (Profile Sub-Page)

```
┌─────────────────────────────────────┐
│ ← My Learning                       │
├─────────────────────────────────────┤
│ [Level Badge: Explorer 🔍]          │
│ ───────────────────────             │
│ Progress to Learner: 70%            │
│ ▓▓▓▓▓▓▓░░░                          │
│ Need: 4 more analyses, 2 metrics    │
├─────────────────────────────────────┤
│ Metrics Mastered: 6/45              │
│                                     │
│ ✅ Revenue Growth                   │
│ ✅ Net Profit Margin                │
│ ✅ P/E Ratio                        │
│ ✅ EPS Growth                       │
│ ✅ Market Cap                       │
│ ✅ 52-Week Range                    │
│                                     │
│ 📖 Recommended Next:                │
│ • ROE (Profitability)               │
│ • Debt-to-Equity (Financial)        │
│ • Cash Flow (Balance Sheet)         │
├─────────────────────────────────────┤
│ Segment Progress                    │
│                                     │
│ Profitability     ██░░░ 2/5         │
│ Financial Ratios  █░░░░ 1/5         │
│ Growth            ███░░ 3/5         │
│ Valuation         █░░░░ 1/5         │
│ [... more segments ...]             │
└─────────────────────────────────────┘
```

---

## Demo Scenario

### LEARN Cluster Demo Script

**Setup:** User is Kavya (Beginner), has 6 months of simulated journal history

**Demo Steps:**

1. **Open Journal Dashboard**
   - See 6-month history pre-populated
   - Win rate: 50% (learning phase)
   - Blind spot alert: "Ownership checked 20%"

2. **View Pattern Detection**
   - Message: "You're building good research habits!"
   - Shows: 3 sectors analyzed, methodical approach

3. **Tap a Journal Entry**
   - See outcome tracking: "TCS +14% ✅"
   - See original note: "First stock! Nervous but excited"

4. **Start New Analysis (Zomato)**
   - Tap on ROE metric
   - Tooltip appears with Level 2 explanation
   - Tap "Learn more" → metric marked as learned

5. **Open AI Chat**
   - Ask: "Is this P/E ratio good for Zomato?"
   - Get contextual response comparing to sector

6. **Complete Analysis**
   - Reflection prompt appears
   - Log verdict: "WATCHLIST"
   - Note: "High growth but expensive for me"

7. **Return to Journal**
   - New entry appears at top
   - Progress: "7 analyses complete"
   - Level-up notification: "You're now a Learner! 📚"

---

## Dependencies

| Dependency | Status | Notes |
|------------|--------|-------|
| Mock data file | ✅ Complete | Journal entries in Section 5 |
| Profile definitions | ✅ Complete | Skill levels defined |
| Segment list | ✅ Complete | 11 segments from CVP cluster |
| Metric definitions | 🔸 Pending | Need tooltip content per metric |
| AI chat backend | 🔸 Mock | Scripted responses for demo |

---

## Acceptance Criteria Summary

| Feature | Key Criteria |
|---------|--------------|
| F1: Journal Core | Auto-logs, shows outcomes, filterable |
| F2: Prompts | Appears once, dismissable, saves correctly |
| F3: Outcomes | Updates daily, win/loss thresholds correct |
| F4: Blind Spots | Detects <40% coverage, shows actionable alert |
| F5: Patterns | 5+ analyses required, encouraging tone |
| F6: Skill Levels | Badge displays, level-up works |
| F7: Tooltips | All metrics covered, adaptive to level |
| F8: AI Chat | Responds <3s, contextual, appropriate depth |
| F9: Learning Track | Progress tracked, contributes to level |

---

## Next PRD: UX & Navigation Cluster
Covers: Screen flows, navigation patterns, onboarding, discovery hub

---

*PRD v1.0 - Ready for spec development and vibe-coding*
