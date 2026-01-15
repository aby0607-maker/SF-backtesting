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

---

# TECHNICAL SPECIFICATION

---

## 10. Data Models & Schemas

### 10.1 Core Type Definitions

```typescript
// ============================================
// PERSONA TYPES
// ============================================

type PersonaId = 'ankit' | 'sneha' | 'kavya';

type InvestmentStyle = 'growth' | 'value' | 'dividend' | 'quality' | 'momentum';

type RiskTolerance = 'conservative' | 'moderate' | 'aggressive';

type TimeHorizon = 'short' | 'medium' | 'long' | 'very-long';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

type ExplanationDepth = 'beginner' | 'intermediate' | 'advanced';

type Verdict = 'strong-buy' | 'buy' | 'hold' | 'avoid' | 'strong-avoid';

type SkillLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7;

type SegmentId = 
  | 'profitability'
  | 'growth'
  | 'valuation'
  | 'debt-safety'
  | 'quality'
  | 'momentum-technical'
  | 'ownership'
  | 'broker-ratings'
  | 'financials-income'
  | 'financials-balance'
  | 'fno';
```

### 10.2 Persona Profile Schema

```typescript
// ============================================
// PERSONA PROFILE
// ============================================

interface SixDParameters {
  investmentStyle: InvestmentStyle;
  riskTolerance: RiskTolerance;
  timeHorizon: TimeHorizon;
  experienceLevel: ExperienceLevel;
  sectorPreferences: string[];
  portfolioContext: PortfolioContext;
}

interface PortfolioContext {
  totalInvested: number;          // in INR
  equityAllocation: number;       // percentage (0-100)
  numberOfHoldings: number;
  averageHoldingPeriod: string;   // e.g., "18 months"
}

interface ScoringWeights {
  profitability: number;
  growth: number;
  valuation: number;
  debtSafety: number;
  quality: number;
  momentumTechnical: number;
  // All weights should sum to 100
}

interface UIAdaptations {
  defaultViewMode: 'dfy' | 'diy' | 'hybrid';
  explanationDepth: ExplanationDepth;
  redFlagSensitivity: 'low' | 'medium' | 'high';
  citationVisibility: 'collapsed' | 'expanded' | 'always-expanded';
  autoShowTooltips: boolean;
  showLearningPrompts: boolean;
}

interface PersonaProfile {
  id: PersonaId;
  name: string;
  displayName: string;            // e.g., "ANALYTICAL ANKIT"
  avatar: string;                 // emoji or image URL
  tagline: string;                // e.g., "Growth Investor • Efficiency Seeker"
  shortDescription: string;       // 1-line for dropdown
  whatTheyCareAbout: string;      // 2-3 sentences
  
  // Core parameters
  sixDParams: SixDParameters;
  scoringWeights: ScoringWeights;
  uiAdaptations: UIAdaptations;
  
  // Pre-loaded demo data
  watchlist: WatchlistStock[];
  journalEntries: JournalEntry[];
  detectedPatterns: DetectedPattern[];
  progress: UserProgress;
  alerts: Alert[];
}
```

### 10.3 Watchlist Schema

```typescript
// ============================================
// WATCHLIST
// ============================================

interface WatchlistStock {
  id: string;                     // unique identifier
  ticker: string;                 // e.g., "ZOMATO"
  companyName: string;            // e.g., "Zomato Ltd"
  displayName: string;            // e.g., "Eternal (Zomato)"
  sector: string;
  marketCap: 'large' | 'mid' | 'small';
  
  // Pricing
  currentPrice: number;
  priceChange: number;            // absolute change
  priceChangePercent: number;     // percentage change
  
  // Persona-specific scoring (calculated)
  score: number;                  // 0-10
  verdict: Verdict;
  verdictLabel: string;           // e.g., "STRONG BUY"
  
  // Metadata
  addedAt: string;                // ISO date
  lastAnalyzedAt: string;         // ISO date
  analysisCount: number;          // times analyzed by this persona
}

interface WatchlistState {
  stocks: WatchlistStock[];
  maxStocks: number;              // limit for free tier
  sortOrder: 'added' | 'score' | 'alphabetical' | 'change';
  sortDirection: 'asc' | 'desc';
}
```

### 10.4 Journal Entry Schema

```typescript
// ============================================
// JOURNAL
// ============================================

type JournalDecision = 
  | 'bought'
  | 'sold'
  | 'added-to-watchlist'
  | 'removed-from-watchlist'
  | 'hold'
  | 'avoided'
  | 'analyzing';

type JournalOutcome = 
  | 'profitable'
  | 'loss'
  | 'neutral'
  | 'pending'
  | 'validated'
  | null;

interface SegmentChecked {
  segmentId: SegmentId;
  segmentName: string;
  wasChecked: boolean;
  timeSpent?: number;             // seconds
}

interface JournalEntry {
  id: string;
  personaId: PersonaId;
  
  // Stock info
  stockId: string;
  ticker: string;
  companyName: string;
  
  // Decision details
  decision: JournalDecision;
  decisionLabel: string;          // e.g., "Bought ₹50,000"
  reasoning: string;              // user's thesis
  confidenceLevel: number;        // 1-10
  
  // Analysis details
  scoreAtTime: number;
  verdictAtTime: Verdict;
  segmentsChecked: SegmentChecked[];
  segmentsCoverage: number;       // percentage of segments checked
  
  // Learning (for Kavya persona emphasis)
  learnings?: string;             // what user learned
  questions?: string;             // questions raised
  conceptsLearned?: string[];     // tracked concepts
  
  // Outcome tracking
  outcome: JournalOutcome;
  outcomeDetails?: string;        // e.g., "+4.2% since purchase"
  priceAtDecision?: number;
  currentPrice?: number;
  returnPercent?: number;
  
  // Blind spots (system-detected)
  blindSpots?: string[];          // segments consistently skipped
  
  // Metadata
  createdAt: string;              // ISO date
  updatedAt: string;
  timeSpentAnalyzing: number;     // seconds
}

interface JournalState {
  entries: JournalEntry[];
  totalEntries: number;
  filters: {
    decision?: JournalDecision;
    outcome?: JournalOutcome;
    dateRange?: { start: string; end: string };
    stockId?: string;
  };
  sortOrder: 'newest' | 'oldest' | 'score' | 'outcome';
}
```

### 10.5 Progress & Patterns Schema

```typescript
// ============================================
// PROGRESS & PATTERNS
// ============================================

interface SkillLevelConfig {
  level: SkillLevel;
  name: string;                   // e.g., "Apprentice"
  minStocksAnalyzed: number;
  minJournalEntries: number;
  minConceptsLearned?: number;
  badge?: string;                 // emoji or icon
}

const SKILL_LEVELS: SkillLevelConfig[] = [
  { level: 1, name: 'Novice', minStocksAnalyzed: 0, minJournalEntries: 0, badge: '🌱' },
  { level: 2, name: 'Apprentice', minStocksAnalyzed: 3, minJournalEntries: 2, badge: '📘' },
  { level: 3, name: 'Practitioner', minStocksAnalyzed: 10, minJournalEntries: 5, badge: '📊' },
  { level: 4, name: 'Specialist', minStocksAnalyzed: 25, minJournalEntries: 15, badge: '🎯' },
  { level: 5, name: 'Analyst', minStocksAnalyzed: 50, minJournalEntries: 30, badge: '🔬' },
  { level: 6, name: 'Expert', minStocksAnalyzed: 100, minJournalEntries: 60, badge: '🏆' },
  { level: 7, name: 'Master', minStocksAnalyzed: 200, minJournalEntries: 100, badge: '👑' },
];

interface UserProgress {
  stocksAnalyzed: number;
  journalEntries: number;
  conceptsLearned: number;
  
  currentLevel: SkillLevel;
  currentLevelName: string;
  nextLevelName: string;
  progressToNextLevel: number;    // percentage (0-100)
  
  // Streaks
  currentStreak: number;          // days
  longestStreak: number;
  lastActiveDate: string;
  
  // Time stats
  totalTimeAnalyzing: number;     // seconds
  averageTimePerStock: number;    // seconds
  
  // Achievement badges
  badges: string[];
}

interface DetectedPattern {
  id: string;
  type: 'preference' | 'behavior' | 'blind-spot' | 'strength' | 'suggestion';
  title: string;                  // e.g., "You favor profitable growers"
  description: string;
  confidence: number;             // 0-100
  basedOn: string;                // e.g., "Last 10 analyses"
  actionable?: string;            // suggestion for user
  icon?: string;
}
```

### 10.6 Alert Schema

```typescript
// ============================================
// ALERTS
// ============================================

type AlertType = 
  | 'score-drop'
  | 'score-rise'
  | 'price-target'
  | 'news'
  | 'earnings'
  | 'red-flag'
  | 'learning-prompt'
  | 'pattern-detected';

type AlertPriority = 'low' | 'medium' | 'high' | 'critical';

interface Alert {
  id: string;
  personaId: PersonaId;
  type: AlertType;
  priority: AlertPriority;
  
  // Content
  title: string;
  message: string;
  
  // Related entity
  stockId?: string;
  ticker?: string;
  
  // Score change (for score alerts)
  previousScore?: number;
  newScore?: number;
  
  // Status
  isRead: boolean;
  isDismissed: boolean;
  
  // Metadata
  createdAt: string;
  expiresAt?: string;
  
  // Actions
  primaryAction?: {
    label: string;
    route: string;
  };
  secondaryAction?: {
    label: string;
    route: string;
  };
}
```

---

## 11. State Management

### 11.1 Global App State Structure

```typescript
// ============================================
// GLOBAL STATE
// ============================================

interface AppState {
  // Persona state
  persona: PersonaState;
  
  // Feature states
  watchlist: WatchlistState;
  journal: JournalState;
  alerts: AlertsState;
  discovery: DiscoveryState;
  
  // UI state
  ui: UIState;
  
  // App meta
  app: AppMetaState;
}

interface PersonaState {
  isLoaded: boolean;
  isSelecting: boolean;
  activePersonaId: PersonaId | null;
  profiles: Record<PersonaId, PersonaProfile>;
  lastSwitchedAt: string | null;
}

interface UIState {
  viewMode: 'dfy' | 'diy';
  isLoading: boolean;
  loadingMessage: string | null;
  toast: ToastMessage | null;
  modal: ModalState | null;
  sidePanel: SidePanelState | null;
}

interface AppMetaState {
  isDemo: boolean;
  version: string;
  lastDataRefresh: string;
  sessionStartedAt: string;
}
```

### 11.2 Persona Context Provider

```typescript
// ============================================
// PERSONA CONTEXT
// ============================================

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Context type
interface PersonaContextType {
  state: PersonaState;
  activePersona: PersonaProfile | null;
  
  // Actions
  selectPersona: (id: PersonaId) => void;
  switchPersona: (id: PersonaId) => void;
  getPersonaById: (id: PersonaId) => PersonaProfile;
  
  // Computed
  isPersonaSelected: boolean;
  scoringWeights: ScoringWeights | null;
  uiAdaptations: UIAdaptations | null;
}

// Action types
type PersonaAction =
  | { type: 'LOAD_PERSONAS_START' }
  | { type: 'LOAD_PERSONAS_SUCCESS'; payload: Record<PersonaId, PersonaProfile> }
  | { type: 'LOAD_PERSONAS_ERROR'; payload: string }
  | { type: 'SELECT_PERSONA'; payload: PersonaId }
  | { type: 'SWITCH_PERSONA'; payload: PersonaId }
  | { type: 'UPDATE_PERSONA_DATA'; payload: { id: PersonaId; data: Partial<PersonaProfile> } }
  | { type: 'RESET_PERSONA' };

// Reducer
function personaReducer(state: PersonaState, action: PersonaAction): PersonaState {
  switch (action.type) {
    case 'LOAD_PERSONAS_START':
      return { ...state, isLoaded: false };
      
    case 'LOAD_PERSONAS_SUCCESS':
      return { 
        ...state, 
        isLoaded: true, 
        profiles: action.payload 
      };
      
    case 'SELECT_PERSONA':
    case 'SWITCH_PERSONA':
      return {
        ...state,
        activePersonaId: action.payload,
        lastSwitchedAt: new Date().toISOString(),
      };
      
    case 'UPDATE_PERSONA_DATA':
      return {
        ...state,
        profiles: {
          ...state.profiles,
          [action.payload.id]: {
            ...state.profiles[action.payload.id],
            ...action.payload.data,
          },
        },
      };
      
    case 'RESET_PERSONA':
      return {
        ...state,
        activePersonaId: null,
        lastSwitchedAt: null,
      };
      
    default:
      return state;
  }
}

// Initial state
const initialPersonaState: PersonaState = {
  isLoaded: false,
  isSelecting: false,
  activePersonaId: null,
  profiles: {} as Record<PersonaId, PersonaProfile>,
  lastSwitchedAt: null,
};

// Context creation
const PersonaContext = createContext<PersonaContextType | undefined>(undefined);

// Provider component
export function PersonaProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(personaReducer, initialPersonaState);
  
  const activePersona = state.activePersonaId 
    ? state.profiles[state.activePersonaId] 
    : null;
  
  const value: PersonaContextType = {
    state,
    activePersona,
    
    selectPersona: (id) => dispatch({ type: 'SELECT_PERSONA', payload: id }),
    switchPersona: (id) => dispatch({ type: 'SWITCH_PERSONA', payload: id }),
    getPersonaById: (id) => state.profiles[id],
    
    isPersonaSelected: state.activePersonaId !== null,
    scoringWeights: activePersona?.scoringWeights ?? null,
    uiAdaptations: activePersona?.uiAdaptations ?? null,
  };
  
  return (
    <PersonaContext.Provider value={value}>
      {children}
    </PersonaContext.Provider>
  );
}

// Hook
export function usePersona() {
  const context = useContext(PersonaContext);
  if (!context) {
    throw new Error('usePersona must be used within PersonaProvider');
  }
  return context;
}
```

### 11.3 State Persistence Strategy

```typescript
// ============================================
// PERSISTENCE
// ============================================

const STORAGE_KEYS = {
  ACTIVE_PERSONA: 'stockfox_active_persona',
  SESSION_DATA: 'stockfox_session',
  PREFERENCES: 'stockfox_preferences',
} as const;

interface SessionData {
  personaId: PersonaId;
  startedAt: string;
  lastActiveAt: string;
}

// Persistence utilities
const persistence = {
  // Save active persona to sessionStorage (clears on tab close)
  saveActivePersona(personaId: PersonaId): void {
    sessionStorage.setItem(STORAGE_KEYS.ACTIVE_PERSONA, personaId);
    this.updateSession(personaId);
  },
  
  // Get active persona from session
  getActivePersona(): PersonaId | null {
    return sessionStorage.getItem(STORAGE_KEYS.ACTIVE_PERSONA) as PersonaId | null;
  },
  
  // Update session data
  updateSession(personaId: PersonaId): void {
    const existing = this.getSession();
    const session: SessionData = {
      personaId,
      startedAt: existing?.startedAt ?? new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEYS.SESSION_DATA, JSON.stringify(session));
  },
  
  // Get session data
  getSession(): SessionData | null {
    const data = sessionStorage.getItem(STORAGE_KEYS.SESSION_DATA);
    return data ? JSON.parse(data) : null;
  },
  
  // Clear all session data
  clearSession(): void {
    sessionStorage.removeItem(STORAGE_KEYS.ACTIVE_PERSONA);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION_DATA);
  },
  
  // For demo: option to persist across sessions (localStorage)
  savePreferences(prefs: Record<string, unknown>): void {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  },
  
  getPreferences(): Record<string, unknown> | null {
    const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : null;
  },
};
```

### 11.4 State Transitions on Persona Switch

```typescript
// ============================================
// SWITCH PERSONA FLOW
// ============================================

interface PersonaSwitchContext {
  fromPersona: PersonaId | null;
  toPersona: PersonaId;
  currentRoute: string;
  currentStockId?: string;
}

async function handlePersonaSwitch(
  context: PersonaSwitchContext,
  dispatch: React.Dispatch<AppAction>
): Promise<void> {
  const { fromPersona, toPersona, currentRoute, currentStockId } = context;
  
  // 1. Start loading state
  dispatch({ type: 'UI_SET_LOADING', payload: { isLoading: true, message: 'Switching profile...' } });
  
  try {
    // 2. Load new persona data if not already loaded
    const personaData = await loadPersonaData(toPersona);
    
    // 3. Update persona state
    dispatch({ type: 'SWITCH_PERSONA', payload: toPersona });
    
    // 4. Update dependent states based on current route
    switch (getRouteType(currentRoute)) {
      case 'stock-analysis':
        // Recalculate verdict with new persona's weights
        if (currentStockId) {
          const newVerdict = calculateVerdictForPersona(currentStockId, toPersona);
          dispatch({ type: 'UPDATE_STOCK_VERDICT', payload: newVerdict });
        }
        break;
        
      case 'dashboard':
        // Load new persona's watchlist and alerts
        dispatch({ type: 'LOAD_WATCHLIST', payload: personaData.watchlist });
        dispatch({ type: 'LOAD_ALERTS', payload: personaData.alerts });
        break;
        
      case 'journal':
        // Load new persona's journal entries
        dispatch({ type: 'LOAD_JOURNAL', payload: personaData.journalEntries });
        break;
        
      case 'discovery':
        // Refresh "For You" recommendations
        dispatch({ type: 'REFRESH_RECOMMENDATIONS', payload: toPersona });
        break;
    }
    
    // 5. Update UI adaptations
    dispatch({ type: 'SET_UI_ADAPTATIONS', payload: personaData.uiAdaptations });
    
    // 6. Persist selection
    persistence.saveActivePersona(toPersona);
    
    // 7. Show success toast
    dispatch({ 
      type: 'SHOW_TOAST', 
      payload: {
        type: 'success',
        message: `Switched to ${personaData.name}'s view`,
        duration: 3000,
      }
    });
    
  } catch (error) {
    dispatch({ 
      type: 'SHOW_TOAST', 
      payload: {
        type: 'error',
        message: 'Failed to switch profile. Please try again.',
        duration: 5000,
      }
    });
  } finally {
    // 8. End loading state
    dispatch({ type: 'UI_SET_LOADING', payload: { isLoading: false, message: null } });
  }
}
```

---

## 12. Component Specifications

### 12.1 Welcome Screen Component

```typescript
// ============================================
// WELCOME SCREEN
// ============================================

// File: components/screens/WelcomeScreen.tsx

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

/**
 * WelcomeScreen Component
 * 
 * Entry point of the app. Shows logo, tagline, and CTA.
 * Animates in on mount.
 * 
 * @route /
 */
export function WelcomeScreen({ onGetStarted }: WelcomeScreenProps): JSX.Element;

// Animation sequence (using framer-motion or CSS)
const animationSequence = {
  logo: { delay: 0, duration: 600, type: 'fadeIn' },
  title: { delay: 300, duration: 400, type: 'fadeInUp' },
  tagline: { delay: 500, duration: 400, type: 'fadeInUp' },
  cta: { delay: 800, duration: 400, type: 'fadeInUp' },
};

// Styling requirements
const styles = {
  container: 'full-screen, centered, gradient-background',
  logo: 'size-80px, margin-bottom-24px',
  title: 'font-32px, font-bold, color-white',
  tagline: 'font-16px, color-gray-300, margin-bottom-48px',
  cta: 'primary-button, min-width-200px',
};
```

### 12.2 Persona Selection Screen Component

```typescript
// ============================================
// PERSONA SELECTION SCREEN
// ============================================

// File: components/screens/PersonaSelectionScreen.tsx

interface PersonaSelectionScreenProps {
  personas: PersonaProfile[];
  onSelectPersona: (personaId: PersonaId) => void;
  isLoading?: boolean;
}

/**
 * PersonaSelectionScreen Component
 * 
 * Displays 3 persona cards for user selection.
 * Each card shows 6D params and "what they care about".
 * 
 * @route /select-persona
 */
export function PersonaSelectionScreen({
  personas,
  onSelectPersona,
  isLoading,
}: PersonaSelectionScreenProps): JSX.Element;

// Layout specifications
const layout = {
  header: {
    title: 'Choose Your Investor Profile',
    subtitle: 'Experience StockFox through different investor lenses',
    alignment: 'center',
    paddingTop: '48px',
    paddingBottom: '32px',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '0 16px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  scrollBehavior: 'vertical-scroll',
};
```

### 12.3 Persona Card Component

```typescript
// ============================================
// PERSONA CARD
// ============================================

// File: components/persona/PersonaCard.tsx

interface PersonaCardProps {
  persona: PersonaProfile;
  onSelect: (personaId: PersonaId) => void;
  isSelected?: boolean;
  isCompact?: boolean;  // for dropdown vs full card
}

/**
 * PersonaCard Component
 * 
 * Displays persona information in card format.
 * Used in selection screen and profile switcher dropdown.
 */
export function PersonaCard({
  persona,
  onSelect,
  isSelected,
  isCompact,
}: PersonaCardProps): JSX.Element;

// Card structure (full mode)
const cardStructure = {
  header: {
    avatar: '48px emoji/image',
    name: 'font-18px, font-bold, uppercase',
    tagline: 'font-14px, color-gray-400',
  },
  parameters: {
    layout: 'grid 2-column',
    items: [
      { label: 'Risk', value: 'persona.sixDParams.riskTolerance' },
      { label: 'Horizon', value: 'persona.sixDParams.timeHorizon' },
      { label: 'Experience', value: 'persona.sixDParams.experienceLevel' },
    ],
    style: 'font-12px, label-color-gray-500, value-color-white',
  },
  description: {
    content: 'persona.whatTheyCareAbout',
    style: 'font-14px, color-gray-300, line-height-1.5, italic',
    maxLines: 4,
  },
  cta: {
    label: 'Select {name} →',
    style: 'secondary-button, full-width, margin-top-16px',
    hoverStyle: 'primary-button',
  },
};

// Card structure (compact mode - for dropdown)
const compactCardStructure = {
  layout: 'horizontal, padding-12px',
  avatar: '32px',
  content: {
    name: 'font-14px, font-medium',
    tagline: 'font-12px, color-gray-400',
  },
  indicator: 'checkmark if selected',
};
```

### 12.4 Profile Switcher Dropdown Component

```typescript
// ============================================
// PROFILE SWITCHER DROPDOWN
// ============================================

// File: components/navigation/ProfileSwitcher.tsx

interface ProfileSwitcherProps {
  currentPersonaId: PersonaId;
  personas: PersonaProfile[];
  onSwitch: (personaId: PersonaId) => void;
  disabled?: boolean;
}

/**
 * ProfileSwitcher Component
 * 
 * Header dropdown for switching between personas.
 * Shows current persona with avatar, expands to show all options.
 */
export function ProfileSwitcher({
  currentPersonaId,
  personas,
  onSwitch,
  disabled,
}: ProfileSwitcherProps): JSX.Element;

// Dropdown specifications
const dropdownSpec = {
  trigger: {
    layout: 'horizontal, gap-8px',
    avatar: '28px',
    name: 'font-14px, font-medium, color-white',
    chevron: 'rotate on open',
    padding: '8px 12px',
    borderRadius: '8px',
    hoverBackground: 'rgba(255,255,255,0.1)',
  },
  menu: {
    position: 'absolute, right-aligned, top-100%',
    marginTop: '4px',
    minWidth: '280px',
    background: 'surface-elevated',
    borderRadius: '12px',
    boxShadow: 'large',
    padding: '8px',
    zIndex: 1000,
  },
  menuItem: {
    padding: '12px',
    borderRadius: '8px',
    hoverBackground: 'surface-hover',
    cursor: 'pointer',
    transition: 'background 150ms ease',
  },
  activeIndicator: {
    type: 'checkmark',
    color: 'primary',
    position: 'right',
  },
  divider: {
    height: '1px',
    background: 'border-subtle',
    margin: '8px 0',
  },
};

// Accessibility
const a11y = {
  role: 'menu',
  triggerAriaLabel: 'Switch investor profile',
  triggerAriaExpanded: 'boolean based on open state',
  menuItemRole: 'menuitem',
  keyboardNav: 'Arrow keys to navigate, Enter to select, Escape to close',
};
```

### 12.5 Toast Notification Component

```typescript
// ============================================
// TOAST NOTIFICATION
// ============================================

// File: components/feedback/Toast.tsx

interface ToastProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;        // ms, default 3000
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Toast Component
 * 
 * Displays temporary notification messages.
 * Used for persona switch confirmation, errors, etc.
 */
export function Toast({
  type,
  message,
  duration = 3000,
  onDismiss,
  action,
}: ToastProps): JSX.Element;

// Toast specifications
const toastSpec = {
  position: 'fixed, bottom-24px, left-50%, transform-translateX(-50%)',
  maxWidth: '400px',
  minWidth: '280px',
  padding: '12px 16px',
  borderRadius: '8px',
  display: 'flex, align-center, gap-12px',
  animation: 'slideUp on enter, slideDown on exit',
  variants: {
    success: { background: 'green-900', icon: '✓', iconColor: 'green-400' },
    error: { background: 'red-900', icon: '✕', iconColor: 'red-400' },
    info: { background: 'blue-900', icon: 'ℹ', iconColor: 'blue-400' },
    warning: { background: 'yellow-900', icon: '⚠', iconColor: 'yellow-400' },
  },
  autoHide: 'setTimeout based on duration prop',
  dismissButton: 'optional X button on right',
};
```

---

## 13. Navigation & Routing

### 13.1 Route Configuration

```typescript
// ============================================
// ROUTE CONFIG
// ============================================

// File: config/routes.ts

interface RouteConfig {
  path: string;
  component: React.ComponentType;
  requiresPersona: boolean;
  title: string;
  showInNav?: boolean;
  navIcon?: string;
  navOrder?: number;
}

const routes: RouteConfig[] = [
  // Public routes (no persona required)
  {
    path: '/',
    component: WelcomeScreen,
    requiresPersona: false,
    title: 'Welcome',
  },
  {
    path: '/select-persona',
    component: PersonaSelectionScreen,
    requiresPersona: false,
    title: 'Select Profile',
  },
  
  // Protected routes (persona required)
  {
    path: '/dashboard',
    component: DashboardScreen,
    requiresPersona: true,
    title: 'Home',
    showInNav: true,
    navIcon: '🏠',
    navOrder: 1,
  },
  {
    path: '/discover',
    component: DiscoveryScreen,
    requiresPersona: true,
    title: 'Discover',
    showInNav: true,
    navIcon: '🔍',
    navOrder: 2,
  },
  {
    path: '/portfolio',
    component: PortfolioScreen,
    requiresPersona: true,
    title: 'Portfolio',
    showInNav: true,
    navIcon: '💼',
    navOrder: 3,
  },
  {
    path: '/journal',
    component: JournalScreen,
    requiresPersona: true,
    title: 'Journal',
    showInNav: true,
    navIcon: '📓',
    navOrder: 4,
  },
  {
    path: '/chat',
    component: ChatScreen,
    requiresPersona: true,
    title: 'Chat',
    showInNav: true,
    navIcon: '💬',
    navOrder: 5,
  },
  {
    path: '/stock/:ticker',
    component: StockAnalysisScreen,
    requiresPersona: true,
    title: 'Stock Analysis',
  },
  {
    path: '/segment/:ticker/:segmentId',
    component: SegmentDeepDiveScreen,
    requiresPersona: true,
    title: 'Segment Details',
  },
  {
    path: '/compare',
    component: CompareScreen,
    requiresPersona: true,
    title: 'Compare Stocks',
  },
  {
    path: '/alerts',
    component: AlertsScreen,
    requiresPersona: true,
    title: 'Alerts',
  },
  {
    path: '/profile',
    component: ProfileSettingsScreen,
    requiresPersona: true,
    title: 'Settings',
  },
];
```

### 13.2 Route Guard Implementation

```typescript
// ============================================
// ROUTE GUARD
// ============================================

// File: components/routing/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresPersona?: boolean;
}

/**
 * ProtectedRoute Component
 * 
 * Guards routes that require persona selection.
 * Redirects to persona selection if not selected.
 */
export function ProtectedRoute({
  children,
  requiresPersona = true,
}: ProtectedRouteProps): JSX.Element {
  const { isPersonaSelected, state } = usePersona();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (requiresPersona && !isPersonaSelected && state.isLoaded) {
      // Save intended destination for redirect after selection
      sessionStorage.setItem('stockfox_redirect_after_select', location.pathname);
      navigate('/select-persona', { replace: true });
    }
  }, [isPersonaSelected, requiresPersona, state.isLoaded, navigate, location]);
  
  // Show loading while checking persona state
  if (!state.isLoaded) {
    return <LoadingScreen message="Loading..." />;
  }
  
  // Redirect happening
  if (requiresPersona && !isPersonaSelected) {
    return <LoadingScreen message="Redirecting..." />;
  }
  
  return <>{children}</>;
}

// After persona selection, redirect to intended destination
function handlePostSelectionRedirect(navigate: NavigateFunction): void {
  const redirectPath = sessionStorage.getItem('stockfox_redirect_after_select');
  sessionStorage.removeItem('stockfox_redirect_after_select');
  navigate(redirectPath || '/dashboard', { replace: true });
}
```

### 13.3 Navigation Hook

```typescript
// ============================================
// NAVIGATION HOOK
// ============================================

// File: hooks/useAppNavigation.ts

interface UseAppNavigationReturn {
  // Navigation actions
  goToStock: (ticker: string) => void;
  goToSegment: (ticker: string, segmentId: SegmentId) => void;
  goToDashboard: () => void;
  goToJournal: () => void;
  goToDiscover: () => void;
  goBack: () => void;
  
  // State
  currentRoute: string;
  canGoBack: boolean;
  isOnStockAnalysis: boolean;
  currentStockTicker: string | null;
  
  // Bottom nav
  bottomNavItems: NavItem[];
  activeNavItem: string;
}

interface NavItem {
  id: string;
  path: string;
  icon: string;
  label: string;
  isActive: boolean;
}

export function useAppNavigation(): UseAppNavigationReturn {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const goToStock = useCallback((ticker: string) => {
    navigate(`/stock/${ticker}`);
  }, [navigate]);
  
  const goToSegment = useCallback((ticker: string, segmentId: SegmentId) => {
    navigate(`/segment/${ticker}/${segmentId}`);
  }, [navigate]);
  
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/dashboard');
    }
  }, [navigate]);
  
  const bottomNavItems: NavItem[] = useMemo(() => 
    routes
      .filter(r => r.showInNav)
      .sort((a, b) => (a.navOrder ?? 0) - (b.navOrder ?? 0))
      .map(r => ({
        id: r.path,
        path: r.path,
        icon: r.navIcon ?? '',
        label: r.title,
        isActive: location.pathname === r.path,
      })),
    [location.pathname]
  );
  
  return {
    goToStock,
    goToSegment,
    goToDashboard: () => navigate('/dashboard'),
    goToJournal: () => navigate('/journal'),
    goToDiscover: () => navigate('/discover'),
    goBack,
    currentRoute: location.pathname,
    canGoBack: window.history.length > 1,
    isOnStockAnalysis: location.pathname.startsWith('/stock/'),
    currentStockTicker: params.ticker ?? null,
    bottomNavItems,
    activeNavItem: bottomNavItems.find(item => item.isActive)?.id ?? '',
  };
}
```

### 13.4 Deep Linking Behavior

```typescript
// ============================================
// DEEP LINKING
// ============================================

// File: utils/deepLinking.ts

/**
 * Deep linking strategy for demo:
 * 
 * 1. Direct stock links: /stock/TCS
 *    - If no persona selected → Show persona selection, then redirect to stock
 *    - If persona selected → Show stock with that persona's verdict
 * 
 * 2. Shared links include persona: /stock/TCS?persona=ankit
 *    - Auto-select Ankit, show stock
 *    - Allow switching after load
 * 
 * 3. Journal entry links: /journal/entry/abc123
 *    - Show specific journal entry
 *    - Requires matching persona
 */

interface DeepLinkParams {
  ticker?: string;
  persona?: PersonaId;
  segment?: SegmentId;
  entryId?: string;
}

function parseDeepLink(url: string): DeepLinkParams {
  const urlObj = new URL(url);
  const searchParams = urlObj.searchParams;
  const pathParts = urlObj.pathname.split('/').filter(Boolean);
  
  const params: DeepLinkParams = {};
  
  // Parse path
  if (pathParts[0] === 'stock' && pathParts[1]) {
    params.ticker = pathParts[1].toUpperCase();
  }
  if (pathParts[0] === 'segment' && pathParts[1] && pathParts[2]) {
    params.ticker = pathParts[1].toUpperCase();
    params.segment = pathParts[2] as SegmentId;
  }
  
  // Parse query params
  if (searchParams.has('persona')) {
    params.persona = searchParams.get('persona') as PersonaId;
  }
  
  return params;
}

function handleDeepLink(
  params: DeepLinkParams,
  context: { selectPersona: (id: PersonaId) => void; navigate: NavigateFunction }
): void {
  const { selectPersona, navigate } = context;
  
  // If persona specified in URL, select it first
  if (params.persona) {
    selectPersona(params.persona);
  }
  
  // Navigate to destination
  if (params.ticker && params.segment) {
    navigate(`/segment/${params.ticker}/${params.segment}`);
  } else if (params.ticker) {
    navigate(`/stock/${params.ticker}`);
  }
}
```

---

## 14. API & Data Layer

### 14.1 Mock Data Loading Strategy

```typescript
// ============================================
// DATA LOADING
// ============================================

// File: data/loader.ts

/**
 * Data loading strategy for demo:
 * 
 * 1. All persona data loaded from static JSON files
 * 2. No actual API calls in demo mode
 * 3. Simulated loading delays for realistic UX
 * 4. Data transformation applied based on active persona
 */

// Data file structure
// /public/data/
// ├── personas/
// │   ├── ankit.json
// │   ├── sneha.json
// │   └── kavya.json
// ├── stocks/
// │   ├── index.json (list of all stocks)
// │   ├── ZOMATO.json
// │   ├── TCS.json
// │   └── ... (one file per stock)
// └── segments/
//     └── [per-stock segment data]

interface DataLoader {
  loadPersona(id: PersonaId): Promise<PersonaProfile>;
  loadAllPersonas(): Promise<Record<PersonaId, PersonaProfile>>;
  loadStock(ticker: string): Promise<StockData>;
  loadStockList(): Promise<StockListItem[]>;
}

const dataLoader: DataLoader = {
  async loadPersona(id: PersonaId): Promise<PersonaProfile> {
    // Simulate network delay
    await simulateDelay(300);
    
    const response = await fetch(`/data/personas/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load persona: ${id}`);
    }
    return response.json();
  },
  
  async loadAllPersonas(): Promise<Record<PersonaId, PersonaProfile>> {
    const [ankit, sneha, kavya] = await Promise.all([
      this.loadPersona('ankit'),
      this.loadPersona('sneha'),
      this.loadPersona('kavya'),
    ]);
    return { ankit, sneha, kavya };
  },
  
  async loadStock(ticker: string): Promise<StockData> {
    await simulateDelay(200);
    const response = await fetch(`/data/stocks/${ticker}.json`);
    if (!response.ok) {
      throw new Error(`Failed to load stock: ${ticker}`);
    }
    return response.json();
  },
  
  async loadStockList(): Promise<StockListItem[]> {
    const response = await fetch('/data/stocks/index.json');
    return response.json();
  },
};

function simulateDelay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

### 14.2 Verdict Calculation Logic

```typescript
// ============================================
// VERDICT CALCULATION
// ============================================

// File: utils/verdictCalculator.ts

/**
 * Calculates stock verdict based on:
 * 1. Raw stock metrics
 * 2. Persona's scoring weights
 * 3. Persona's risk tolerance
 */

interface StockMetrics {
  profitability: SegmentMetrics;
  growth: SegmentMetrics;
  valuation: SegmentMetrics;
  debtSafety: SegmentMetrics;
  quality: SegmentMetrics;
  momentumTechnical: SegmentMetrics;
  // ... other segments
}

interface SegmentMetrics {
  score: number;          // 0-10 raw score
  signals: Signal[];
  redFlags: RedFlag[];
}

interface VerdictResult {
  overallScore: number;   // 0-10
  verdict: Verdict;
  verdictLabel: string;
  confidence: number;     // 0-100
  keyFactors: KeyFactor[];
  redFlags: RedFlag[];
  segmentScores: Record<SegmentId, number>;
}

function calculateVerdictForPersona(
  stockMetrics: StockMetrics,
  persona: PersonaProfile
): VerdictResult {
  const { scoringWeights, sixDParams } = persona;
  
  // 1. Calculate weighted segment scores
  const segmentScores: Record<string, number> = {};
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const [segment, weight] of Object.entries(scoringWeights)) {
    const metrics = stockMetrics[segment as keyof StockMetrics];
    if (metrics) {
      segmentScores[segment] = metrics.score;
      weightedSum += metrics.score * weight;
      totalWeight += weight;
    }
  }
  
  // 2. Calculate overall score
  const overallScore = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // 3. Apply risk adjustment
  const riskAdjustedScore = applyRiskAdjustment(
    overallScore,
    stockMetrics,
    sixDParams.riskTolerance
  );
  
  // 4. Determine verdict
  const verdict = scoreToVerdict(riskAdjustedScore, sixDParams);
  
  // 5. Collect red flags (sensitivity based on persona)
  const redFlags = collectRedFlags(stockMetrics, persona.uiAdaptations.redFlagSensitivity);
  
  // 6. Identify key factors
  const keyFactors = identifyKeyFactors(stockMetrics, scoringWeights);
  
  return {
    overallScore: Math.round(riskAdjustedScore * 10) / 10,
    verdict: verdict.type,
    verdictLabel: verdict.label,
    confidence: calculateConfidence(stockMetrics, scoringWeights),
    keyFactors,
    redFlags,
    segmentScores: segmentScores as Record<SegmentId, number>,
  };
}

function scoreToVerdict(
  score: number,
  params: SixDParameters
): { type: Verdict; label: string } {
  // Thresholds vary slightly by experience level
  const thresholds = getVerdictThresholds(params.experienceLevel);
  
  if (score >= thresholds.strongBuy) return { type: 'strong-buy', label: 'STRONG BUY' };
  if (score >= thresholds.buy) return { type: 'buy', label: 'BUY' };
  if (score >= thresholds.hold) return { type: 'hold', label: 'HOLD' };
  if (score >= thresholds.avoid) return { type: 'avoid', label: 'AVOID' };
  return { type: 'strong-avoid', label: 'STRONG AVOID' };
}

function getVerdictThresholds(experience: ExperienceLevel) {
  // Beginners get more conservative thresholds
  switch (experience) {
    case 'beginner':
      return { strongBuy: 8.5, buy: 7.5, hold: 6.0, avoid: 4.5 };
    case 'intermediate':
      return { strongBuy: 8.0, buy: 7.0, hold: 5.5, avoid: 4.0 };
    case 'advanced':
      return { strongBuy: 8.0, buy: 6.5, hold: 5.0, avoid: 3.5 };
  }
}

function applyRiskAdjustment(
  score: number,
  metrics: StockMetrics,
  riskTolerance: RiskTolerance
): number {
  const volatility = metrics.momentumTechnical?.volatility ?? 0;
  
  // Penalize high volatility for conservative investors
  switch (riskTolerance) {
    case 'conservative':
      if (volatility > 25) return score * 0.85;
      if (volatility > 15) return score * 0.95;
      break;
    case 'moderate':
      if (volatility > 40) return score * 0.9;
      break;
    case 'aggressive':
      // No penalty, might even boost for momentum
      break;
  }
  
  return score;
}
```

### 14.3 Data Transformation Pipeline

```typescript
// ============================================
// DATA TRANSFORMATION
// ============================================

// File: utils/dataTransformer.ts

/**
 * Transforms raw data based on active persona.
 * Applied when:
 * 1. Loading stock data
 * 2. Switching personas
 * 3. Generating recommendations
 */

interface TransformContext {
  persona: PersonaProfile;
  rawData: any;
  transformType: 'stock' | 'watchlist' | 'discovery' | 'journal';
}

interface TransformResult<T> {
  data: T;
  personaId: PersonaId;
  transformedAt: string;
}

const transformer = {
  // Transform stock data for display
  transformStock(
    rawStock: RawStockData,
    persona: PersonaProfile
  ): TransformResult<DisplayStockData> {
    const verdict = calculateVerdictForPersona(rawStock.metrics, persona);
    
    return {
      data: {
        ...rawStock,
        score: verdict.overallScore,
        verdict: verdict.verdict,
        verdictLabel: verdict.verdictLabel,
        segmentScores: verdict.segmentScores,
        keyFactors: verdict.keyFactors,
        redFlags: verdict.redFlags,
        explanationDepth: persona.uiAdaptations.explanationDepth,
        // Add persona-specific insights
        personalizedInsights: generatePersonalizedInsights(rawStock, persona),
      },
      personaId: persona.id,
      transformedAt: new Date().toISOString(),
    };
  },
  
  // Transform watchlist with persona's verdicts
  transformWatchlist(
    stocks: RawStockData[],
    persona: PersonaProfile
  ): TransformResult<WatchlistStock[]> {
    const transformed = stocks.map(stock => {
      const verdict = calculateVerdictForPersona(stock.metrics, persona);
      return {
        id: stock.id,
        ticker: stock.ticker,
        companyName: stock.companyName,
        displayName: stock.displayName,
        sector: stock.sector,
        marketCap: stock.marketCap,
        currentPrice: stock.currentPrice,
        priceChange: stock.priceChange,
        priceChangePercent: stock.priceChangePercent,
        score: verdict.overallScore,
        verdict: verdict.verdict,
        verdictLabel: verdict.verdictLabel,
        addedAt: stock.addedAt,
        lastAnalyzedAt: stock.lastAnalyzedAt,
        analysisCount: stock.analysisCount,
      };
    });
    
    return {
      data: transformed,
      personaId: persona.id,
      transformedAt: new Date().toISOString(),
    };
  },
  
  // Generate "For You" recommendations
  generateRecommendations(
    allStocks: RawStockData[],
    persona: PersonaProfile,
    limit: number = 10
  ): TransformResult<RecommendedStock[]> {
    // Score all stocks for this persona
    const scored = allStocks.map(stock => ({
      stock,
      verdict: calculateVerdictForPersona(stock.metrics, persona),
    }));
    
    // Filter and sort based on persona preferences
    const filtered = scored
      .filter(({ verdict }) => verdict.overallScore >= 6.5)
      .filter(({ verdict }) => verdict.redFlags.length < 3)
      .sort((a, b) => b.verdict.overallScore - a.verdict.overallScore)
      .slice(0, limit);
    
    return {
      data: filtered.map(({ stock, verdict }) => ({
        ...stock,
        score: verdict.overallScore,
        verdict: verdict.verdict,
        matchReason: generateMatchReason(stock, persona),
      })),
      personaId: persona.id,
      transformedAt: new Date().toISOString(),
    };
  },
};

function generatePersonalizedInsights(
  stock: RawStockData,
  persona: PersonaProfile
): string[] {
  const insights: string[] = [];
  const { sixDParams, scoringWeights } = persona;
  
  // Growth-focused insights for growth investors
  if (sixDParams.investmentStyle === 'growth') {
    if (stock.metrics.growth.score >= 8) {
      insights.push('Strong revenue growth aligns with your growth focus');
    }
  }
  
  // Value-focused insights for value investors
  if (sixDParams.investmentStyle === 'value') {
    if (stock.metrics.valuation.score >= 7) {
      insights.push('Attractive valuation with margin of safety');
    }
  }
  
  // Beginner-friendly insights
  if (sixDParams.experienceLevel === 'beginner') {
    if (stock.metrics.quality.score >= 8) {
      insights.push('Stable, well-established company - good for learning');
    }
  }
  
  return insights;
}

function generateMatchReason(
  stock: RawStockData,
  persona: PersonaProfile
): string {
  const { sixDParams } = persona;
  
  switch (sixDParams.investmentStyle) {
    case 'growth':
      return `High growth rate matches your preference for growth stocks`;
    case 'value':
      return `Trading below intrinsic value with margin of safety`;
    case 'quality':
      return `Strong fundamentals and consistent profitability`;
    case 'dividend':
      return `Attractive dividend yield with sustainable payout`;
    default:
      return `Matches your investment criteria`;
  }
}
```

---

## 15. Performance Considerations

### 15.1 Preloading Strategy

```typescript
// ============================================
// PRELOADING
// ============================================

// File: utils/preloader.ts

/**
 * Preloading strategy:
 * 
 * 1. On app start: Load all persona profiles (small JSON)
 * 2. On persona select: Preload that persona's watchlist stocks
 * 3. On dashboard: Preload discovery/trending stocks
 * 4. On stock hover: Preload stock details
 */

interface PreloadConfig {
  personas: boolean;
  watchlistStocks: boolean;
  discoveryStocks: boolean;
}

const preloader = {
  // Preload all persona data on app init
  async preloadPersonas(): Promise<void> {
    const cache = await caches.open('stockfox-personas');
    
    await Promise.all([
      cache.add('/data/personas/ankit.json'),
      cache.add('/data/personas/sneha.json'),
      cache.add('/data/personas/kavya.json'),
    ]);
  },
  
  // Preload watchlist stocks when persona is selected
  async preloadWatchlistStocks(persona: PersonaProfile): Promise<void> {
    const cache = await caches.open('stockfox-stocks');
    
    const stockUrls = persona.watchlist.map(
      stock => `/data/stocks/${stock.ticker}.json`
    );
    
    await Promise.all(stockUrls.map(url => cache.add(url)));
  },
  
  // Preload on hover (for instant navigation)
  preloadStockOnHover(ticker: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/data/stocks/${ticker}.json`;
    document.head.appendChild(link);
  },
  
  // Preload critical images
  preloadImages(urls: string[]): void {
    urls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  },
};

// Initialize preloading on app start
export async function initializePreloading(): Promise<void> {
  // Check if service worker is available
  if ('caches' in window) {
    await preloader.preloadPersonas();
  }
}
```

### 15.2 Re-render Optimization

```typescript
// ============================================
// RENDER OPTIMIZATION
// ============================================

// File: utils/optimization.ts

/**
 * Optimization strategies for persona switch:
 * 
 * 1. Memoize verdict calculations
 * 2. Use React.memo for pure components
 * 3. Virtualize long lists
 * 4. Debounce rapid switches
 */

import { useMemo, memo, useCallback } from 'react';
import { debounce } from 'lodash';

// Memoized verdict calculation
const verdictCache = new Map<string, VerdictResult>();

function getCacheKey(stockId: string, personaId: PersonaId): string {
  return `${stockId}:${personaId}`;
}

export function getCachedVerdict(
  stockId: string,
  personaId: PersonaId,
  calculator: () => VerdictResult
): VerdictResult {
  const key = getCacheKey(stockId, personaId);
  
  if (!verdictCache.has(key)) {
    verdictCache.set(key, calculator());
  }
  
  return verdictCache.get(key)!;
}

export function invalidateVerdictCache(stockId?: string, personaId?: PersonaId): void {
  if (stockId && personaId) {
    verdictCache.delete(getCacheKey(stockId, personaId));
  } else if (personaId) {
    // Invalidate all for persona
    for (const key of verdictCache.keys()) {
      if (key.endsWith(`:${personaId}`)) {
        verdictCache.delete(key);
      }
    }
  } else {
    verdictCache.clear();
  }
}

// Debounced persona switch (prevent rapid switching issues)
export function useDebouncedPersonaSwitch(
  onSwitch: (id: PersonaId) => void,
  delay: number = 300
) {
  return useCallback(
    debounce((id: PersonaId) => {
      onSwitch(id);
    }, delay, { leading: true, trailing: false }),
    [onSwitch, delay]
  );
}

// Memoized stock card component
export const MemoizedStockCard = memo(
  StockCard,
  (prev, next) => {
    return (
      prev.stock.id === next.stock.id &&
      prev.stock.score === next.stock.score &&
      prev.stock.currentPrice === next.stock.currentPrice
    );
  }
);

// Virtual list for large stock lists
import { FixedSizeList } from 'react-window';

interface VirtualStockListProps {
  stocks: WatchlistStock[];
  onStockClick: (ticker: string) => void;
  height: number;
}

export function VirtualStockList({ 
  stocks, 
  onStockClick, 
  height 
}: VirtualStockListProps) {
  const Row = useCallback(
    ({ index, style }: { index: number; style: React.CSSProperties }) => (
      <div style={style}>
        <MemoizedStockCard
          stock={stocks[index]}
          onClick={() => onStockClick(stocks[index].ticker)}
        />
      </div>
    ),
    [stocks, onStockClick]
  );
  
  return (
    <FixedSizeList
      height={height}
      itemCount={stocks.length}
      itemSize={80}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

### 15.3 Transition Animations

```typescript
// ============================================
// ANIMATIONS
// ============================================

// File: styles/animations.ts

/**
 * Animation configurations for smooth transitions
 */

// Using framer-motion
export const animationVariants = {
  // Page transitions
  pageEnter: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  },
  
  // Persona switch transition
  personaSwitch: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // Card hover
  cardHover: {
    scale: 1.02,
    transition: { duration: 0.15 },
  },
  
  // Score change
  scoreChange: {
    initial: { scale: 1.2, color: 'var(--color-accent)' },
    animate: { scale: 1, color: 'var(--color-text)' },
    transition: { duration: 0.3 },
  },
  
  // Toast notification
  toast: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
    transition: { duration: 0.2 },
  },
  
  // Dropdown menu
  dropdown: {
    initial: { opacity: 0, y: -10, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
    transition: { duration: 0.15 },
  },
  
  // List item stagger
  listStagger: {
    container: {
      animate: { transition: { staggerChildren: 0.05 } },
    },
    item: {
      initial: { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
    },
  },
};

// CSS animations (alternative to framer-motion)
export const cssAnimations = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.3s ease-out forwards;
  }
  
  .animate-slideInRight {
    animation: slideInRight 0.3s ease-out forwards;
  }
  
  .animate-pulse {
    animation: pulse 2s ease-in-out infinite;
  }
  
  .skeleton {
    background: linear-gradient(
      90deg,
      var(--skeleton-base) 0px,
      var(--skeleton-highlight) 40px,
      var(--skeleton-base) 80px
    );
    background-size: 200px 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
`;
```

---

## 16. Testing Specifications

### 16.1 Unit Tests

```typescript
// ============================================
// UNIT TESTS
// ============================================

// File: __tests__/verdictCalculator.test.ts

describe('VerdictCalculator', () => {
  describe('calculateVerdictForPersona', () => {
    const mockStockMetrics: StockMetrics = {
      profitability: { score: 8.0, signals: [], redFlags: [] },
      growth: { score: 7.5, signals: [], redFlags: [] },
      valuation: { score: 6.0, signals: [], redFlags: [] },
      debtSafety: { score: 8.5, signals: [], redFlags: [] },
      quality: { score: 7.0, signals: [], redFlags: [] },
      momentumTechnical: { score: 6.5, signals: [], redFlags: [] },
    };
    
    it('should return higher score for growth investor on high-growth stock', () => {
      const growthPersona = createMockPersona('ankit');
      const valuePersona = createMockPersona('sneha');
      
      const growthResult = calculateVerdictForPersona(mockStockMetrics, growthPersona);
      const valueResult = calculateVerdictForPersona(mockStockMetrics, valuePersona);
      
      // Growth investor weights growth higher
      expect(growthResult.overallScore).toBeGreaterThanOrEqual(valueResult.overallScore);
    });
    
    it('should apply risk adjustment for conservative investors', () => {
      const conservativePersona = createMockPersona('sneha');
      const volatileStock = {
        ...mockStockMetrics,
        momentumTechnical: { score: 6.5, signals: [], redFlags: [], volatility: 40 },
      };
      
      const result = calculateVerdictForPersona(volatileStock, conservativePersona);
      
      // Score should be penalized for high volatility
      expect(result.overallScore).toBeLessThan(7.5);
    });
    
    it('should collect red flags based on sensitivity setting', () => {
      const beginnerPersona = createMockPersona('kavya');
      beginnerPersona.uiAdaptations.redFlagSensitivity = 'medium';
      
      const stockWithMinorIssue = {
        ...mockStockMetrics,
        debtSafety: { 
          score: 6.5, 
          signals: [], 
          redFlags: [{ severity: 'low', message: 'Minor debt increase' }] 
        },
      };
      
      const result = calculateVerdictForPersona(stockWithMinorIssue, beginnerPersona);
      
      // Medium sensitivity should not flag low-severity issues
      expect(result.redFlags.length).toBe(0);
    });
  });
});

// File: __tests__/personaSwitcher.test.ts

describe('PersonaSwitcher', () => {
  it('should update all dependent states on switch', async () => {
    const { result } = renderHook(() => usePersona(), {
      wrapper: PersonaProvider,
    });
    
    // Select initial persona
    act(() => {
      result.current.selectPersona('ankit');
    });
    
    expect(result.current.activePersona?.id).toBe('ankit');
    
    // Switch persona
    act(() => {
      result.current.switchPersona('sneha');
    });
    
    expect(result.current.activePersona?.id).toBe('sneha');
    expect(result.current.scoringWeights?.valuation).toBe(25); // Sneha's weights
  });
});
```

### 16.2 Integration Tests

```typescript
// ============================================
// INTEGRATION TESTS
// ============================================

// File: __tests__/integration/personaFlow.test.tsx

describe('Persona Selection Flow', () => {
  it('should complete welcome → selection → dashboard flow', async () => {
    render(<App />);
    
    // Welcome screen
    expect(screen.getByText('StockFox')).toBeInTheDocument();
    
    // Click Get Started
    fireEvent.click(screen.getByText('Get Started →'));
    
    // Persona selection screen
    await waitFor(() => {
      expect(screen.getByText('Choose Your Investor Profile')).toBeInTheDocument();
    });
    
    // Select Ankit
    fireEvent.click(screen.getByText('Select Ankit →'));
    
    // Should navigate to dashboard
    await waitFor(() => {
      expect(screen.getByText('Good Morning, Ankit!')).toBeInTheDocument();
    });
    
    // Should show Ankit's watchlist
    expect(screen.getByText('Zomato (Eternal)')).toBeInTheDocument();
  });
  
  it('should update stock verdict when switching personas', async () => {
    // Start with Ankit on Zomato stock page
    render(<App initialRoute="/stock/ZOMATO" initialPersona="ankit" />);
    
    await waitFor(() => {
      expect(screen.getByText('7.2/10')).toBeInTheDocument();
      expect(screen.getByText('BUY')).toBeInTheDocument();
    });
    
    // Open profile switcher
    fireEvent.click(screen.getByTestId('profile-switcher'));
    
    // Switch to Sneha
    fireEvent.click(screen.getByText('Skeptical Sneha'));
    
    // Verdict should update
    await waitFor(() => {
      expect(screen.getByText('5.8/10')).toBeInTheDocument();
      expect(screen.getByText('AVOID')).toBeInTheDocument();
    });
  });
});
```

### 16.3 E2E Test Scenarios

```typescript
// ============================================
// E2E TEST SCENARIOS
// ============================================

// File: cypress/e2e/demo-flow.cy.ts

describe('Demo Presentation Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });
  
  it('completes the investor demo script', () => {
    // 1. Welcome screen
    cy.contains('StockFox').should('be.visible');
    cy.contains('Get Started').click();
    
    // 2. Select Ankit
    cy.contains('ANALYTICAL ANKIT').should('be.visible');
    cy.contains('Growth Investor').should('be.visible');
    cy.contains('Select Ankit').click();
    
    // 3. Dashboard loads with Ankit's data
    cy.contains('Good Morning, Ankit').should('be.visible');
    cy.get('[data-testid="watchlist"]').should('contain', 'Zomato');
    
    // 4. Navigate to stock analysis
    cy.contains('Zomato').click();
    cy.url().should('include', '/stock/ZOMATO');
    
    // 5. Verify Ankit's verdict
    cy.get('[data-testid="score"]').should('contain', '7.2');
    cy.get('[data-testid="verdict"]').should('contain', 'BUY');
    
    // 6. Switch to Sneha via header
    cy.get('[data-testid="profile-switcher"]').click();
    cy.contains('Skeptical Sneha').click();
    
    // 7. Verify same stock, different verdict
    cy.get('[data-testid="score"]').should('contain', '5.8');
    cy.get('[data-testid="verdict"]').should('contain', 'AVOID');
    cy.contains("Switched to Sneha's view").should('be.visible');
    
    // 8. Check Sneha's reasoning is shown
    cy.contains('margin of safety').should('be.visible');
    
    // 9. Switch to Kavya
    cy.get('[data-testid="profile-switcher"]').click();
    cy.contains('Curious Kavya').click();
    
    // 10. Verify beginner-friendly explanations
    cy.get('[data-testid="score"]').should('contain', '6.5');
    cy.contains('Learn').should('be.visible'); // Learning prompts
  });
  
  it('persists persona selection during session', () => {
    // Select Sneha
    cy.contains('Get Started').click();
    cy.contains('Select Sneha').click();
    
    // Navigate around
    cy.contains('Discover').click();
    cy.contains('Journal').click();
    cy.contains('Home').click();
    
    // Should still be Sneha
    cy.get('[data-testid="profile-switcher"]').should('contain', 'Sneha');
  });
});
```

---

## 17. File Structure

```
src/
├── components/
│   ├── screens/
│   │   ├── WelcomeScreen.tsx
│   │   ├── PersonaSelectionScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   └── ...
│   ├── persona/
│   │   ├── PersonaCard.tsx
│   │   ├── PersonaCardCompact.tsx
│   │   └── PersonaParameters.tsx
│   ├── navigation/
│   │   ├── ProfileSwitcher.tsx
│   │   ├── BottomNav.tsx
│   │   ├── Header.tsx
│   │   └── ProtectedRoute.tsx
│   ├── feedback/
│   │   ├── Toast.tsx
│   │   ├── LoadingScreen.tsx
│   │   └── Skeleton.tsx
│   └── ...
├── context/
│   ├── PersonaContext.tsx
│   ├── AppContext.tsx
│   └── ...
├── hooks/
│   ├── usePersona.ts
│   ├── useAppNavigation.ts
│   └── ...
├── utils/
│   ├── verdictCalculator.ts
│   ├── dataTransformer.ts
│   ├── persistence.ts
│   ├── preloader.ts
│   └── optimization.ts
├── data/
│   ├── loader.ts
│   └── mockData/
│       ├── personas/
│       │   ├── ankit.json
│       │   ├── sneha.json
│       │   └── kavya.json
│       └── stocks/
│           └── ...
├── config/
│   ├── routes.ts
│   └── constants.ts
├── styles/
│   ├── animations.ts
│   └── theme.ts
├── types/
│   ├── persona.ts
│   ├── stock.ts
│   ├── journal.ts
│   └── ...
└── __tests__/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

## 18. Implementation Checklist

### Phase 1: Core Setup
- [ ] Set up TypeScript types and interfaces
- [ ] Implement PersonaContext and provider
- [ ] Create data loader utility
- [ ] Set up routing with guards

### Phase 2: Screens
- [ ] Build WelcomeScreen with animations
- [ ] Build PersonaSelectionScreen with cards
- [ ] Integrate with Dashboard (from main PRD)

### Phase 3: Persona Switching
- [ ] Implement ProfileSwitcher dropdown
- [ ] Handle state transitions on switch
- [ ] Add toast notifications
- [ ] Implement verdict recalculation

### Phase 4: Data & Logic
- [ ] Create mock data JSON files
- [ ] Implement verdict calculator
- [ ] Implement data transformation pipeline
- [ ] Add caching layer

### Phase 5: Polish
- [ ] Add animations and transitions
- [ ] Implement preloading
- [ ] Performance optimization
- [ ] Testing

---

*This section replaces the Onboarding Flow (Section 3) in the main UX & Navigation PRD for demo/prototype purposes.*
