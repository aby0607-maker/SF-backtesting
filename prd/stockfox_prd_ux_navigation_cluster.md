# StockFox MLP PRD: UX & Navigation Cluster

**Version:** 1.0 | **Date:** January 15, 2025 | **Status:** Ready for Development

---

## Overview

This PRD covers the **UX & Navigation** features that tie the StockFox app together—screen architecture, navigation patterns, onboarding, discovery, and sharing capabilities.

**Features Covered:** A14, C1, C2, J1, K1, K2, N2, N4, N5, G7, O1, O2 + Profile Switcher (demo-specific)

---

## 1. Screen Inventory & Routing

### 1.1 Route Architecture

| Route | Screen | Purpose | Priority |
|-------|--------|---------|----------|
| `/` | Profile Selection | Demo entry - pick Ankit/Sneha/Kavya | Demo-only |
| `/dashboard` | Home/Dashboard | Watchlist, alerts preview, quick actions | P0 |
| `/stock/[ticker]` | Stock Analysis | Core product - scorecard | P0 |
| `/segment/[ticker]/[segment]` | Segment Deep-dive | Expanded segment view | P0 |
| `/chat` | AI Chat | Chat interface | P0 |
| `/compare` | Stock Comparison | Side-by-side analysis | P1 |
| `/journal` | Analysis Journal | History, patterns, blind spots | P0 |
| `/portfolio` | Portfolio View | Holdings overview | P1 |
| `/discover` | Discovery Hub | Find new stocks | P1 |
| `/advisors` | Advisor Marketplace | Browse advisors (entry point) | P2 |
| `/backtest` | Backtest Home | Simulator (entry point) | P2 |
| `/alerts` | Alerts Center | Notification management | P1 |
| `/profile` | Profile/Settings | User preferences | P2 |

### 1.2 Navigation Structure

**Bottom Navigation (5 items - always visible):**
```
[🏠 Home]  [🔍 Discover]  [💼 Portfolio]  [📓 Journal]  [💬 Chat]
```

**Header Elements:**
- Logo (links to Dashboard)
- Search bar (stock search)
- Notification bell (unread count badge)
- Profile switcher (demo: Ankit/Sneha/Kavya dropdown)

**Secondary Navigation (via menu/header):**
- Advisors, Backtest, Alerts, Profile/Settings

---

## 2. Profile Switcher (Demo-Specific)

### 2.1 Purpose
Demonstrates "same stock, different verdict" by allowing instant profile switching.

### 2.2 Behavior

**Location:** Header, persistent across all screens

**UI:** Dropdown with avatar
```
[👤 Ankit ▼]
├── 👨‍💻 Analytical Ankit (Growth)
├── 👩‍💼 Skeptical Sneha (Value)  
└── 👩‍🎓 Curious Kavya (Beginner)
```

**On Switch:**
1. Update global profile state
2. If on Stock Analysis → Re-render with new profile's verdict/weights
3. If on Journal → Show that profile's journal entries
4. If on Dashboard → Show that profile's watchlist/alerts
5. Toast notification: "Switched to Sneha's view"

### 2.3 Demo Script Moment
```
Investor sees: Zomato shows "7.2/10 - BUY" for Ankit
Switch to Sneha → Same stock shows "5.8/10 - AVOID"
Key insight: Same data, different interpretation based on investment style
```

---

## 3. Onboarding Flow (N5)

### 3.1 Purpose
Collect 6D profile parameters to enable personalization. For demo, show the flow but allow "Quick Start" presets.

### 3.2 Flow Screens

**Screen 1: Welcome**
```
Welcome to StockFox 🦊
Your AI-powered stock research assistant

[Get Started →]
[I'm an investor, show me the demo]
```

**Screen 2: Investment Style**
```
What's your investment approach?

○ Growth - I seek high-growth companies
○ Value - I look for undervalued stocks  
○ Dividend - I prioritize income
○ Quality - I want stable, profitable companies
○ Not sure yet - Help me discover
```

**Screen 3: Risk Tolerance**
```
How do you handle volatility?

○ Conservative - I prefer stability (±10-15%)
○ Moderate - I can handle some swings (±20-30%)
○ Aggressive - I'm okay with high volatility (±40%+)

[Slider visualization showing volatility range]
```

**Screen 4: Time Horizon**
```
How long do you typically hold investments?

○ Short-term (<1 year)
○ Medium-term (1-3 years)
○ Long-term (3-5 years)
○ Very long-term (5+ years)
```

**Screen 5: Experience Level**
```
How would you describe your investing experience?

○ Beginner - Just getting started
○ Intermediate - 2-5 years experience
○ Advanced - 5+ years, understand financials well
```

**Screen 6: Ready!**
```
Your profile is set! 🎉

Based on your inputs:
• Investment Style: Growth
• Risk Tolerance: Moderate  
• Time Horizon: 3-5 years
• Experience: Intermediate

[Start Analyzing →]
[Adjust Settings]
```

### 3.3 Quick Start Presets (C1)

Skip onboarding with preset profiles:
```
Quick Start Options:
├── 📈 Growth Investor (Ankit profile)
├── 💎 Value Investor (Sneha profile)
├── 📚 Learning Mode (Kavya profile)
└── ⚙️ Custom Setup
```

---

## 4. Dashboard / Home Screen

### 4.1 Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│ 🦊 StockFox    [🔍]    [🔔 3]    [👤 Ankit ▼]         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Good Morning, Ankit! 👋                                │
│ Pattern: You favor profitable growers                  │
│                                                         │
│ ┌─ Your Watchlist ──────────────────────────────────┐  │
│ │ Eternal (Zomato)  7.2/10 BUY    ₹265 (+2.3%) [→] │  │
│ │ Axis Bank         8.2/10 BUY    ₹1,145 (+0.8%)[→]│  │
│ │ TCS               8.5/10 HOLD   ₹3,650 (-0.2%)[→]│  │
│ │ [+ Add Stock]                                     │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Recent Alerts ───────────────────────────────────┐  │
│ │ 🔴 Score Drop: Axis Bank 8.5 → 8.2              │  │
│ │ 📰 News: Zomato Q3 results released             │  │
│ │ 📅 Upcoming: TCS earnings Jan 20                │  │
│ │ [View All →]                                     │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
│ ┌─ Your Progress ───────────────────────────────────┐  │
│ │ 📊 12 stocks analyzed  📓 8 journal entries     │  │
│ │ 🎯 Level: Apprentice   📈 Next: Practitioner    │  │
│ └───────────────────────────────────────────────────┘  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ [🏠 Home] [🔍 Discover] [💼 Portfolio] [📓 Journal] [💬]│
└─────────────────────────────────────────────────────────┘
```

### 4.2 Watchlist Management (G7)

**Add Stock:**
- Search modal with autocomplete
- Max 10 stocks in free tier (show upgrade prompt at limit)

**Remove Stock:**
- Swipe left to reveal delete
- Or long-press → "Remove from Watchlist"

**Watchlist Card Actions:**
- Tap → Navigate to Stock Analysis
- Tap score badge → Quick score breakdown tooltip

---

## 5. Discovery Hub (J1)

### 5.1 Tab Structure

```
┌─────────────────────────────────────────────────────────┐
│ Discover Stocks                                         │
├─────────────────────────────────────────────────────────┤
│ [🔥 Trending] [⭐ Top Rated] [✨ For You] [📊 Sectors] │
├─────────────────────────────────────────────────────────┤
```

**Tab: Trending**
- Most analyzed stocks this week
- Shows analysis count: "1,247 analyses"
- Sorted by popularity

**Tab: Top Rated**
- Highest scoring stocks by segment
- Filter by: Overall, Profitability, Growth, Value
- Shows: Score, verdict, sector

**Tab: For You (Personalized)**
- Based on user's detected patterns
- "You favor profitable growers. Try:"
- Shows stocks matching user's emerging thesis

**Tab: Sectors**
- Browse by sector (Banking, IT, Pharma, FMCG, etc.)
- Each sector shows top 3-5 stocks
- Sector health indicator

### 5.2 Stock Card (Discovery)

```
┌─────────────────────────────────────────────┐
│ Eternal (Zomato)              7.2/10  BUY  │
│ Food Tech • Large Cap                       │
│ "Strong growth, improving unit economics"   │
│ 1,247 analyses this week                   │
└─────────────────────────────────────────────┘
```

---

## 6. Progressive Disclosure (A14)

### 6.1 Pattern
Information revealed in layers—overview first, details on demand.

### 6.2 Application Points

**Stock Analysis Screen:**
```
Level 1 (Default): Score + Verdict + Key Highlights
    ↓ [Expand]
Level 2: 11-Segment Cards (collapsed)
    ↓ [Tap Segment]
Level 3: Segment Deep-dive with all metrics
    ↓ [Tap Metric]
Level 4: Metric detail with citations
```

**Segment Card States:**
```
Collapsed:
┌─────────────────────────────────────────────┐
│ 📊 Profitability    8.5/10    [▼ Expand]   │
└─────────────────────────────────────────────┘

Expanded:
┌─────────────────────────────────────────────┐
│ 📊 Profitability    8.5/10    [▲ Collapse] │
├─────────────────────────────────────────────┤
│ ROE: 18.3% vs Sector 14.2%  ✅ Above       │
│ Net Margin: 12.4%           ✅ Healthy     │
│ ROCE: 16.8%                 ✅ Strong      │
│ [View All 8 Metrics →]                     │
└─────────────────────────────────────────────┘
```

---

## 7. DIY ↔ DFY Toggle (C2)

### 7.1 Purpose
Let users choose between:
- **DFY (Default):** AI-interpreted insights with verdicts
- **DIY:** Raw data view for power users

### 7.2 Location
Stock Analysis screen header, next to stock name

### 7.3 Behavior

```
┌─────────────────────────────────────────────┐
│ Eternal (Zomato)    [DFY ○───● DIY]        │
└─────────────────────────────────────────────┘
```

**DFY Mode (Default):**
- Overall score + verdict prominent
- AI-generated insights for each segment
- "Why this matters for you" explanations
- Entry/exit signals with recommendations

**DIY Mode:**
- Raw metrics displayed (no interpretation)
- No verdict shown
- Full data tables
- Export-friendly format
- "For advanced users who want raw data"

**Toggle Animation:**
- Smooth transition between modes
- Toast: "Switched to DIY mode - showing raw data"

---

## 8. Search Experience

### 8.1 Global Search

**Location:** Header search icon → Expands to search bar

**Behavior:**
```
[🔍 Search stocks...]

As user types "Zom":
┌─────────────────────────────────────────────┐
│ 🔍 Zom                                      │
├─────────────────────────────────────────────┤
│ 📈 Eternal (Zomato) - Food Tech            │
│ 📈 Zomato Ltd - NSE:ZOMATO                 │
└─────────────────────────────────────────────┘
```

**Search Results:**
- Autocomplete after 2 characters
- Show ticker, company name, sector
- Recent searches (last 5)
- Tap result → Navigate to Stock Analysis

### 8.2 Sector/Filter Search (Discovery)

- Filter by sector
- Filter by market cap (Large/Mid/Small)
- Filter by score range (7+, 8+, etc.)

---

## 9. Sharing & Export (K1, K2)

### 9.1 Share Analysis (K1)

**Location:** Stock Analysis screen → Share button

**Share Options:**
```
Share Analysis
├── 📋 Copy Link
├── 📱 WhatsApp
├── 🐦 Twitter/X
├── 💼 LinkedIn
└── 📧 Email
```

**Shared Content:**
- Stock name + score + verdict
- Key highlights (3 bullets)
- Link to full analysis (if recipient has app)
- StockFox branding

**Share Preview:**
```
🦊 StockFox Analysis

Eternal (Zomato): 7.2/10 - BUY

✅ Strong revenue growth (45% YoY)
✅ Improving unit economics
⚠️ Not yet profitable

See full analysis: [link]
```

### 9.2 Export Report (K2)

**Location:** Stock Analysis screen → Export button

**Export Options:**
```
Export Report
├── 📄 PDF Report
├── 📊 Excel Data
└── 📋 Copy Summary
```

**PDF Report Contents:**
- Cover page with stock + score + date
- Executive summary (verdict + key points)
- 11-segment breakdown with scores
- Key metrics table
- Red flags section
- Citations/sources list
- Disclaimer

---

## 10. Free Tier & Pricing UI (O1, O2)

### 10.1 Free Tier Indicator (O1)

**Dashboard Display:**
```
┌─────────────────────────────────────────────┐
│ Free Plan: 3/3 stocks analyzed             │
│ [Upgrade for unlimited →]                   │
└─────────────────────────────────────────────┘
```

**When Limit Reached:**
```
┌─────────────────────────────────────────────┐
│ 🔒 Stock Limit Reached                     │
│                                             │
│ You've used your 3 free stock analyses.    │
│                                             │
│ Upgrade to Pro for:                        │
│ ✓ Unlimited stock analyses                 │
│ ✓ Advanced alerts                          │
│ ✓ Export reports                           │
│                                             │
│ [Upgrade - ₹99/year per stock]             │
│ [Maybe Later]                               │
└─────────────────────────────────────────────┘
```

### 10.2 Pricing Display (O2)

**Pricing Options (for demo):**
```
┌─────────────────────────────────────────────┐
│ Choose Your Plan                            │
├─────────────────────────────────────────────┤
│                                             │
│ FREE           PRO              UNLIMITED   │
│ ₹0             ₹99/stock/yr     ₹999/yr    │
│                                             │
│ 3 stocks       Per stock        Unlimited   │
│ Basic alerts   All alerts       All alerts  │
│ No export      PDF export       All exports │
│                                             │
│ [Current]      [Buy]            [Buy]       │
└─────────────────────────────────────────────┘
```

---

## 11. Plain English Design (N4)

### 11.1 Principle
No jargon without explanation. Every financial term has a tooltip.

### 11.2 Implementation

**Hover/Tap Tooltips:**
```
ROE: 18.3% ℹ️

[Tooltip on ℹ️:]
Return on Equity measures how efficiently 
a company uses shareholder money to generate 
profits. Higher is generally better.
18.3% means the company made ₹18.30 profit 
for every ₹100 of shareholder equity.
```

**Adaptive Complexity:**
- Beginner: Simple analogies, avoid technical terms
- Intermediate: Standard financial language
- Advanced: Technical details, formulas available

---

## 12. Error & Empty States

### 12.1 Empty States

**Empty Watchlist:**
```
┌─────────────────────────────────────────────┐
│         📊                                  │
│   No stocks in your watchlist yet          │
│                                             │
│   Add stocks to track their scores         │
│   and get personalized alerts.             │
│                                             │
│   [+ Add Your First Stock]                 │
│   [Explore Trending Stocks]                │
└─────────────────────────────────────────────┘
```

**Empty Journal:**
```
┌─────────────────────────────────────────────┐
│         📓                                  │
│   Your analysis journal is empty           │
│                                             │
│   Analyze a stock to automatically         │
│   start building your investment journal.  │
│                                             │
│   [Analyze a Stock]                        │
└─────────────────────────────────────────────┘
```

**No Search Results:**
```
┌─────────────────────────────────────────────┐
│   No stocks found for "xyz"                │
│                                             │
│   Try searching for:                       │
│   • Company name (e.g., "Reliance")       │
│   • Ticker symbol (e.g., "TCS")           │
│   • Sector (e.g., "Banking")              │
└─────────────────────────────────────────────┘
```

### 12.2 Error States

**Network Error:**
```
┌─────────────────────────────────────────────┐
│   ⚠️ Connection Issue                      │
│                                             │
│   Unable to load stock data.               │
│   Please check your internet connection.   │
│                                             │
│   [Retry]                                  │
└─────────────────────────────────────────────┘
```

**Stock Not Found:**
```
┌─────────────────────────────────────────────┐
│   🔍 Stock Not Available                   │
│                                             │
│   We don't have data for this stock yet.   │
│   We're adding new stocks regularly.       │
│                                             │
│   [Request This Stock]                     │
│   [Browse Available Stocks]                │
└─────────────────────────────────────────────┘
```

---

## 13. Loading States

### 13.1 Skeleton Screens

**Stock Analysis Loading:**
```
┌─────────────────────────────────────────────┐
│ ████████████████           [████]          │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░          │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ████████  ░░░░░░   [░░░░]              │ │
│ │ ░░░░░░░░░░░░░░░░░░░░░░░░               │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ ████████  ░░░░░░   [░░░░]              │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### 13.2 Loading Messages

Rotate through contextual messages:
- "Analyzing 200+ metrics..."
- "Checking profitability indicators..."
- "Comparing with sector peers..."
- "Generating personalized insights..."

---

## 14. Responsive Design Notes

### 14.1 Breakpoints

| Breakpoint | Target | Layout |
|------------|--------|--------|
| < 640px | Mobile | Single column, bottom nav |
| 640-1024px | Tablet | Two column where appropriate |
| > 1024px | Desktop | Full layout, side nav option |

### 14.2 Mobile-First Priorities
- Bottom navigation always visible
- Touch targets minimum 44px
- Swipe gestures for common actions
- Pull-to-refresh on lists

---

## 15. Acceptance Criteria

### Navigation
- [ ] All 5 bottom nav items functional and navigate correctly
- [ ] Profile switcher updates all screens instantly
- [ ] Search returns results within 300ms of typing stop
- [ ] Back navigation works correctly from all screens

### Onboarding
- [ ] Complete flow collects all 6D parameters
- [ ] Quick Start presets skip to dashboard with profile set
- [ ] Profile can be edited later from Settings

### Discovery
- [ ] All 4 tabs load appropriate content
- [ ] "For You" shows personalized recommendations
- [ ] Stock cards navigate to Stock Analysis on tap

### Progressive Disclosure
- [ ] Segments expand/collapse smoothly
- [ ] State persists during session
- [ ] "Expand All" / "Collapse All" option available

### DIY ↔ DFY Toggle
- [ ] Toggle switches view mode instantly
- [ ] DFY shows interpretations, DIY shows raw data
- [ ] User preference persists across sessions

### Sharing & Export
- [ ] Share generates correct preview for each platform
- [ ] PDF export includes all required sections
- [ ] Copy summary works on all devices

### Free Tier
- [ ] Counter shows remaining free analyses
- [ ] Upgrade modal appears at limit
- [ ] Demo mode bypasses limits (flag in settings)

---

## Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| CVP + PERS PRD | Stock Analysis screen content | ✅ Complete |
| LEARN PRD | Journal screen content | ✅ Complete |
| Mock Data | All screens | ✅ Complete |
| Design System | All UI components | Pending |

---

## Next PRD: Engagement (ENG) Cluster
Covers: Smart Alerts, Score Drop, Thesis-Breaking Events, Notifications, Alert Settings

---

*PRD v1.0 - Ready for spec development and vibe-coding*
