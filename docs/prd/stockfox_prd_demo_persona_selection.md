# StockFox MLP PRD: Demo Persona Selection (Alternate to Onboarding)

**Version:** 1.0 | **Date:** January 15, 2025 | **Status:** Ready for Development

**Replaces:** Section 3 (Onboarding Flow) in UX & Navigation PRD

---

## Overview

For investor demos and prototype showcases, we replace the full onboarding flow with a streamlined persona selection screen. This allows instant access to pre-configured user profiles that demonstrate StockFox's personalization capabilities.

**Flow:** Welcome Screen → Persona Selection → Dashboard (with pre-loaded data)

---

## 1. Welcome Screen

### 1.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                         🦊                                  │
│                                                             │
│                      StockFox                               │
│                                                             │
│         Personalized AI Stock Research & Advisory           │
│              for Retail Investors                           │
│                                                             │
│                                                             │
│                                                             │
│                                                             │
│                   [Get Started →]                           │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Behavior

- **Animation:** Logo fades in, followed by tagline, then CTA button
- **CTA Action:** Navigates to Persona Selection screen
- **Skip Option:** None (this is the entry point)

---

## 2. Persona Selection Screen

### 2.1 Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              Choose Your Investor Profile                   │
│                                                             │
│    Experience StockFox through different investor lenses    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👨‍💻  ANALYTICAL ANKIT                              │   │
│  │      Growth Investor • Efficiency Seeker            │   │
│  │                                                     │   │
│  │  Risk: Moderate    Horizon: 3-5 Years              │   │
│  │  Experience: Intermediate                           │   │
│  │                                                     │   │
│  │  "Wants quick, comprehensive analysis.              │   │
│  │   Values speed without sacrificing depth.           │   │
│  │   Prioritizes growth metrics & momentum."           │   │
│  │                                                     │   │
│  │                              [Select Ankit →]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👩‍💼  SKEPTICAL SNEHA                                │   │
│  │      Value Investor • Control Freak                 │   │
│  │                                                     │   │
│  │  Risk: Conservative    Horizon: 5+ Years           │   │
│  │  Experience: Advanced                               │   │
│  │                                                     │   │
│  │  "Trusts data, not opinions. Wants to see          │   │
│  │   every citation and verify claims herself.         │   │
│  │   Prioritizes margin of safety & fundamentals."     │   │
│  │                                                     │   │
│  │                              [Select Sneha →]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  👩‍🎓  CURIOUS KAVYA                                  │   │
│  │      Learning Investor • Aspiring Learner           │   │
│  │                                                     │   │
│  │  Risk: Conservative    Horizon: 3-5 Years          │   │
│  │  Experience: Beginner                               │   │
│  │                                                     │   │
│  │  "New to investing, wants to learn properly.        │   │
│  │   Values clear explanations over jargon.            │   │
│  │   Building confidence through understanding."       │   │
│  │                                                     │   │
│  │                              [Select Kavya →]       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Persona Card Specifications

Each card displays:

| Element | Description |
|---------|-------------|
| **Avatar** | Emoji representation (👨‍💻 / 👩‍💼 / 👩‍🎓) |
| **Name** | "ANALYTICAL ANKIT" / "SKEPTICAL SNEHA" / "CURIOUS KAVYA" |
| **Style Tags** | Investment style + Persona archetype |
| **6D Parameters** | Risk Tolerance, Time Horizon, Experience Level |
| **What They Care About** | 2-3 line description of priorities and approach |
| **CTA** | "Select [Name] →" button |

### 2.3 Interaction

- **Tap Card:** Expands slightly (subtle scale animation)
- **Tap CTA:** Sets profile, navigates to Dashboard with toast: "Welcome, [Name]!"
- **Scroll:** Vertical scroll if needed on smaller screens

---

## 3. Complete Persona Definitions

### 3.1 Analytical Ankit

```yaml
Profile:
  Name: Analytical Ankit
  Avatar: 👨‍💻
  Tagline: "Growth Investor • Efficiency Seeker"

6D Parameters:
  Investment Style: Growth
  Risk Tolerance: Moderate (±20-30% volatility acceptable)
  Time Horizon: Medium-Long (3-5 years)
  Experience Level: Intermediate
  Sector Preference: Technology, Consumer, Healthcare
  Portfolio Context: ₹5L invested, 60% in equity

What They Care About: |
  Wants quick, comprehensive analysis without spending hours on research.
  Values speed without sacrificing depth. Checks profitability and growth
  first. Tolerates volatility if growth thesis is intact.

Scoring Weights (influences verdict):
  Growth Metrics: 25% (emphasized)
  Profitability: 20%
  Momentum/Technical: 15%
  Valuation: 15%
  Quality: 15%
  Debt/Safety: 10%

UI Adaptations:
  - Default view: DFY mode (show interpretations)
  - Explanation depth: Intermediate (standard financial terms)
  - Red flag sensitivity: Medium (flag major issues only)
```

### 3.2 Skeptical Sneha

```yaml
Profile:
  Name: Skeptical Sneha
  Avatar: 👩‍💼
  Tagline: "Value Investor • Control Freak"

6D Parameters:
  Investment Style: Value
  Risk Tolerance: Conservative (±10-15% volatility preferred)
  Time Horizon: Long (5+ years)
  Experience Level: Advanced
  Sector Preference: Banking, FMCG, Infrastructure
  Portfolio Context: ₹12L invested, 70% in equity

What They Care About: |
  Trusts data, not opinions. Wants to see every citation and verify
  claims herself. Looks for margin of safety in valuations. Won't
  invest without understanding the complete picture. Skeptical of
  high-growth narratives without profitability.

Scoring Weights (influences verdict):
  Valuation: 25% (emphasized)
  Quality/Fundamentals: 20%
  Debt/Safety: 20%
  Profitability: 15%
  Growth Metrics: 10%
  Momentum/Technical: 10%

UI Adaptations:
  - Default view: Hybrid (DFY with easy toggle to DIY data)
  - Explanation depth: Advanced (show formulas, detailed breakdowns)
  - Red flag sensitivity: High (flag all concerns, even minor)
  - Citation visibility: Always expanded
```

### 3.3 Curious Kavya

```yaml
Profile:
  Name: Curious Kavya
  Avatar: 👩‍🎓
  Tagline: "Learning Investor • Aspiring Learner"

6D Parameters:
  Investment Style: Quality (stable, understandable businesses)
  Risk Tolerance: Conservative (±10-15% volatility)
  Time Horizon: Medium-Long (3-5 years)
  Experience Level: Beginner
  Sector Preference: No strong preference (learning all sectors)
  Portfolio Context: ₹80K invested, first year of investing

What They Care About: |
  New to investing, wants to learn properly. Values clear explanations
  over jargon. Prefers stable, profitable companies she can understand.
  Building confidence through understanding, not tips. Wants to know
  "why" behind every metric.

Scoring Weights (influences verdict):
  Quality/Fundamentals: 25% (emphasized)
  Profitability: 20%
  Debt/Safety: 20%
  Growth Metrics: 15%
  Valuation: 15%
  Momentum/Technical: 5%

UI Adaptations:
  - Default view: DFY mode with enhanced explanations
  - Explanation depth: Beginner (analogies, simple language, no jargon)
  - Red flag sensitivity: Medium (explain why something is a red flag)
  - Tooltips: Auto-show on first encounter of any term
  - Learning prompts: Enabled (contextual "Learn more" nudges)
```

---

## 4. Pre-loaded Demo Data

Each persona comes with pre-populated data to demonstrate the product in action.

### 4.1 Ankit's Pre-loaded Data

**Watchlist (5 stocks):**

| Stock | Score | Verdict | Price | Change |
|-------|-------|---------|-------|--------|
| Zomato (Eternal) | 7.2/10 | BUY | ₹265 | +2.3% |
| Tata Motors | 7.8/10 | BUY | ₹785 | +1.1% |
| HDFC Bank | 8.2/10 | HOLD | ₹1,680 | -0.3% |
| Infosys | 7.5/10 | HOLD | ₹1,890 | +0.5% |
| Dixon Tech | 8.1/10 | BUY | ₹15,200 | +3.2% |

**Journal Entries (4 entries):**

```
Entry 1: Zomato Analysis (3 days ago)
- Decision: Added to watchlist
- Reasoning: "Strong revenue growth 25%+, improving unit economics,
  food delivery moat. Quick commerce is a growth kicker."
- Segments Checked: Growth ✓, Profitability ✓, Valuation ✓
- Blind Spots Detected: Didn't check competitive positioning

Entry 2: Tata Motors Analysis (1 week ago)
- Decision: Bought ₹50,000
- Reasoning: "EV transition story, JLR recovery, domestic market share gains"
- Segments Checked: Growth ✓, Valuation ✓, Technical ✓
- Outcome: +4.2% since purchase ✓

Entry 3: Paytm Analysis (2 weeks ago)
- Decision: Avoided
- Reasoning: "Regulatory uncertainty, path to profitability unclear"
- Segments Checked: All 11 ✓
- Validation: Stock down 8% since - good call ✓

Entry 4: Dixon Tech Analysis (2 weeks ago)
- Decision: Added to watchlist
- Reasoning: "PLI beneficiary, strong order book, Apple exposure"
- Segments Checked: Growth ✓, Profitability ✓
```

**Detected Patterns:**
- "You favor profitable growth companies"
- "Average time on analysis: 8 minutes"
- "Blind spot: You often skip debt analysis (checked in 2/4 analyses)"

**Progress:**
- Stocks Analyzed: 12
- Journal Entries: 8
- Level: Practitioner (Level 3/7)

---

### 4.2 Sneha's Pre-loaded Data

**Watchlist (5 stocks):**

| Stock | Score | Verdict | Price | Change |
|-------|-------|---------|-------|--------|
| HDFC Bank | 8.5/10 | STRONG BUY | ₹1,680 | -0.3% |
| ITC | 8.3/10 | BUY | ₹465 | +0.8% |
| Axis Bank | 7.8/10 | BUY | ₹1,145 | +0.2% |
| Coal India | 7.2/10 | HOLD | ₹485 | -0.5% |
| Hindustan Unilever | 6.8/10 | HOLD | ₹2,580 | +0.1% |

**Journal Entries (5 entries):**

```
Entry 1: HDFC Bank Deep Analysis (2 days ago)
- Decision: Core holding - maintain
- Reasoning: "Best-in-class asset quality, consistent ROE 16%+,
  reasonable valuation at 2.8x book vs historical 3.2x.
  Verified NPA data from RBI filings."
- Segments Checked: All 11 ✓
- Citations Verified: 8/8 ✓

Entry 2: Zomato Analysis (1 week ago)
- Decision: AVOID
- Reasoning: "Unprofitable, cash burn concerning, valuation
  assumes perfect execution. No margin of safety."
- Segments Checked: All 11 ✓
- Key Red Flags: Negative FCF, high competition, regulatory risk

Entry 3: ITC Analysis (1 week ago)
- Decision: Bought ₹75,000
- Reasoning: "Cigarette moat, FMCG growing well, 3.5% dividend yield,
  P/E 24x vs sector 35x. Strong balance sheet."
- Segments Checked: All 11 ✓
- Outcome: +2.1% since purchase ✓

Entry 4: Coal India Analysis (2 weeks ago)
- Decision: Hold existing position
- Reasoning: "High dividend yield 6%+, but energy transition risk.
  Position sizing already appropriate at 8% of portfolio."
- Risk Flag: Long-term structural headwinds noted

Entry 5: Yes Bank Analysis (3 weeks ago)
- Decision: AVOID
- Reasoning: "Governance history concerns, capital adequacy
  rebuilding, better options available in banking sector."
- Key Red Flags: Historical NPA issues, dilution risk
```

**Detected Patterns:**
- "You thoroughly verify all citations (98% verification rate)"
- "You prioritize valuation and margin of safety"
- "Average analysis time: 22 minutes (detailed approach)"
- "You check all 11 segments in 90% of analyses"

**Progress:**
- Stocks Analyzed: 18
- Journal Entries: 15
- Level: Analyst (Level 5/7)

---

### 4.3 Kavya's Pre-loaded Data

**Watchlist (4 stocks):**

| Stock | Score | Verdict | Price | Change |
|-------|-------|---------|-------|--------|
| TCS | 8.5/10 | BUY | ₹3,650 | -0.2% |
| Asian Paints | 7.8/10 | HOLD | ₹2,890 | +0.4% |
| Nestle India | 8.0/10 | HOLD | ₹2,450 | +0.6% |
| Pidilite | 7.6/10 | HOLD | ₹2,980 | +0.3% |

**Journal Entries (3 entries):**

```
Entry 1: TCS Analysis (4 days ago)
- Decision: First stock purchase! Bought ₹25,000
- Reasoning: "Consistent company, understand IT services business,
  good dividends. Teacher recommended for beginners."
- Segments Checked: Profitability ✓, Growth ✓
- Learning: "Learned about ROE - measures how well company
  uses shareholder money. TCS ROE 45% is excellent!"
- Feeling: Confident about first investment ✓

Entry 2: Asian Paints Analysis (1 week ago)
- Decision: Added to watchlist for later
- Reasoning: "Market leader in paints, brand I recognize.
  Want to learn more about how to value consumer companies."
- Segments Checked: Profitability ✓, Growth ✓, Valuation (learning)
- Learning: "P/E ratio = price you pay for each rupee of earnings.
  Asian Paints P/E 65x is expensive, need to understand why."
- Questions: "Is high P/E always bad? When is premium justified?"

Entry 3: Nestle India Analysis (2 weeks ago)
- Decision: Added to watchlist
- Reasoning: "Brands I use daily - Maggi, Nescafe. Want to
  understand how to analyze FMCG companies."
- Segments Checked: Profitability ✓
- Learning: "FMCG companies have pricing power - can raise
  prices without losing customers. This protects margins."
```

**Detected Patterns:**
- "You're building foundational knowledge"
- "You prefer companies with recognizable brands"
- "Focus area suggestion: Learn valuation metrics next"
- "Great progress! You've learned 12 new concepts this month"

**Progress:**
- Stocks Analyzed: 6
- Journal Entries: 5
- Level: Apprentice (Level 2/7)
- Concepts Learned: 12
- Next Milestone: "Analyze 10 stocks to reach Practitioner level"

---

## 5. Persona Selection → Dashboard Transition

### 5.1 On Persona Select

1. Store selected persona in app state
2. Load persona-specific data (watchlist, journal, patterns)
3. Apply persona-specific UI adaptations
4. Navigate to Dashboard
5. Show toast: "Welcome, [Name]! 👋"

### 5.2 Dashboard Personalization by Persona

**Ankit's Dashboard:**
```
Good morning, Ankit! 👋
Pattern: You favor profitable growth companies

[Watchlist shows growth-oriented stocks with momentum indicators]
[Alerts emphasize price movements and growth metrics changes]
[Quick action: "Analyze a growth stock"]
```

**Sneha's Dashboard:**
```
Good morning, Sneha! 👋
Pattern: You thoroughly verify all data points

[Watchlist shows value stocks with P/E and dividend info prominent]
[Alerts emphasize fundamental changes and red flags]
[Quick action: "Review citations for recent analyses"]
```

**Kavya's Dashboard:**
```
Good morning, Kavya! 👋
Great progress! You've learned 12 new concepts this month 🎉

[Watchlist shows simple, stable companies]
[Alerts include learning prompts and encouragement]
[Quick action: "Continue learning about valuation"]
[Progress card more prominent]
```

---

## 6. Profile Switcher (Header)

### 6.1 Location & Design

Persistent in header across all screens (as defined in main PRD Section 2).

```
┌─────────────────────────────────────────────────────────────┐
│ 🦊 StockFox    [🔍 Search]    [🔔 3]    [👨‍💻 Ankit ▼]      │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Dropdown Options

```
[👨‍💻 Ankit ▼]
├─────────────────────────────────────
│ 👨‍💻  Analytical Ankit
│     Growth • Moderate Risk
│     ✓ Currently Active
├─────────────────────────────────────
│ 👩‍💼  Skeptical Sneha
│     Value • Conservative
├─────────────────────────────────────
│ 👩‍🎓  Curious Kavya
│     Quality • Beginner
└─────────────────────────────────────
```

### 6.3 Switch Behavior

**On Profile Switch:**

1. Update global profile state
2. Re-render current screen with new profile's context:
   - **Stock Analysis:** New verdict, weights, explanation depth
   - **Dashboard:** New watchlist, alerts, patterns
   - **Journal:** New entries, detected patterns
   - **Discovery "For You":** New personalized recommendations
3. Show toast: "Switched to [Name]'s view"
4. Maintain current route (don't navigate away)

### 6.4 Demo Script Moment

```
Presenter: "Let me show you how the same stock looks different
           for different investor types."

[On Zomato Stock Analysis as Ankit]
"Ankit sees 7.2/10 BUY - growth metrics are strong, 
 valuation is acceptable for growth investor."

[Switch to Sneha via header dropdown]
"Same stock, but Sneha sees 5.8/10 AVOID - 
 unprofitable, no margin of safety, too expensive."

[Switch to Kavya]
"Kavya sees 6.5/10 NEUTRAL with learning prompts -
 'This company isn't profitable yet. Learn why some
 investors accept this for high-growth companies.'"

Key insight: Same data, personalized interpretation.
```

---

## 7. Acceptance Criteria

### Welcome Screen
- [ ] Logo and tagline animate in smoothly
- [ ] "Get Started" navigates to Persona Selection
- [ ] Screen renders correctly on all device sizes

### Persona Selection
- [ ] All 3 persona cards display correctly
- [ ] 6D parameters visible on each card
- [ ] "What they care about" description readable
- [ ] Selecting any persona navigates to Dashboard
- [ ] Selected persona state persists in app

### Pre-loaded Data
- [ ] Each persona loads with correct watchlist
- [ ] Journal entries display with all fields populated
- [ ] Detected patterns show correctly on Dashboard
- [ ] Progress/level displays accurately

### Profile Switcher
- [ ] Dropdown shows all 3 personas with current marked
- [ ] Switching updates all screens instantly
- [ ] Toast notification confirms switch
- [ ] Stock Analysis re-renders with new verdict on switch

### Personalization
- [ ] Verdicts differ between personas for same stock
- [ ] UI adaptations apply (explanation depth, tooltips)
- [ ] Dashboard greeting reflects persona patterns

---

## 8. Technical Notes

### State Management

```typescript
interface PersonaState {
  activePersona: 'ankit' | 'sneha' | 'kavya';
  profiles: {
    ankit: PersonaProfile;
    sneha: PersonaProfile;
    kavya: PersonaProfile;
  };
}

interface PersonaProfile {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  sixDParams: SixDParameters;
  whatTheyCareAbout: string;
  scoringWeights: Record<string, number>;
  uiAdaptations: UIAdaptations;
  watchlist: Stock[];
  journalEntries: JournalEntry[];
  detectedPatterns: string[];
  progress: ProgressData;
}
```

### Data Files

Pre-loaded data should be stored in:
```
/data/personas/
├── ankit.json
├── sneha.json
└── kavya.json
```

Each file contains complete persona profile + demo data.

---

## 9. Dependencies

| Dependency | Required For | Status |
|------------|--------------|--------|
| Mock stock data | Watchlist rendering | Pending |
| Verdict calculation logic | Different verdicts per persona | Pending |
| Journal component | Pre-loaded entries display | See LEARN PRD |
| Dashboard component | Persona-specific rendering | See main UX PRD |

---

*This section replaces the Onboarding Flow (Section 3) in the main UX & Navigation PRD for demo/prototype purposes.*
