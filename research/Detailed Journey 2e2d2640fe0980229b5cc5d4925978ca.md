# Detailed Journey

## Entry Points (How Users Get to Analysis)

**Pathway A: Manual Stock Search (Live Today)**

- User thinks of stock → Searches in app → Proceeds to Phase 1

**Pathway B: Portfolio-Connected Discovery (Phase 2 Roadmap)**

- User connects demat account (2-minute setup)
- System loads holdings → User clicks any holding → Proceeds to Phase 1

---

## The Three-Phase Analysis Loop

### **PHASE 1: DISCOVERY & RED FLAG IDENTIFICATION WITH PERSONALIZATION**

**What happens:**

- User inputs 1 stock (from their watchlist, tip, or idea)
- StockFox analyzes across **ALL 11-20 segments** (200+ metrics) (TBD)
- User discovers red flags they missed:
    - Rising debt ratio (5-year trend)
    - Slowing growth vs. sector
    - Concentration in single product/customer
    - Valuation stretched vs. historical
    - Ownership changes
    - F&O anomalies
    - [and 10-15 more segments]

**Personalization applied (6 dimensions):**

1. **Investment Thesis**: Not applicable for agnostic users;
2. **Risk Tolerance**:
    - System checks: "Can you handle this stock's volatility?"
    - Example: TCS volatility 18% vs user tolerance 25-30% → ✅ Fits
    - Example: Paytm volatility 50% vs user tolerance 25-30% → ❌ Exceeds
3. **Time Horizon**:
    - System checks: "Does this company's growth rate match your horizon?"
    - Example: User 3-5 years → TCS 12% growth → ✅ Compounding works
    - Example: User 3-5 years → Turnaround stock → ❌ Uncertain timeline
4. **Experience Level**:
    - System checks: "Is this stock's complexity appropriate for you?"
    - Example: Beginner → TCS stable IT → ✅ Understandable
    - Example: Beginner → Unprofitable fintech startup → ❌ Too complex
5. **Sector Preference**:
    - System checks: "Do you want exposure to this sector?"
    - Example: User avoids tobacco → Tobacco stock → ❌ Filter out
    - Example: User open to all sectors → Stock okay on this dimension
6. **Portfolio Context**:
    - System checks: "Does adding this stock create concentration?"
    - Example: User 75% tech already → IT stock → ⚠️ Increases concentration
    - Example: User 75% tech already → Banking stock → ✅ Diversifies

**Output: Peer Comparison with Personalized Context**

```
STOCK ANALYSIS: [Company Name]

OVERALL SCORE: [X]/10 - [VERDICT]

PEER RANKING (Stack Rank in Category):
Stock A: 8.7/10 - Best in class
Stock B: 7.2/10 - Average
Stock C: 4.2/10 - Avoid

11-SEGMENT BREAKDOWN:
[Segment 1]: [Score]/10 [Assessment vs peers]
[Segment 2]: [Score]/10 [Assessment vs peers]
... (9 more segments)

PERSONALIZATION FOR YOUR PROFILE:
✓/⚠️/✗ Risk Tolerance: [Assessment vs your tolerance]
✓/⚠️/✗ Time Horizon: [Assessment vs your timeline]
✓/⚠️/✗ Experience Level: [Assessment vs your skill]
✓/⚠️/✗ Sector Preference: [Assessment vs your preferences]
✓/⚠️/✗ Portfolio Impact: [Assessment vs current holdings]
✓/⚠️/✗ Learning Value: [Assessment for skill development]

FINAL PERSONALIZED VERDICT:
[For agnostic investor] [Specific to their 6D profile]
Example: "STRONG BUY - Ideal for your risk tolerance, time horizon,
and portfolio composition. Good learning value for your experience level."

```

**User Outcome:**

- Confidence level: "Did I check everything important?" → "Yes, all 11 segments + personalized context"
- Understands why verdict applies to THEIR situation, not generic
- **Exit:**
    - Rejects stock (red flag found, or doesn't fit profile)
    - OR Proceeds to Phase 2 (thesis looks good for their situation)

---

### **PHASE 2: CONFIDENCE BUILDING & PERSONALIZED VERDICTS (Multiple Sessions)**

**What happens:**

- User analyzes multiple stocks (varies by behavior: 1-5 stocks in session, or 3-5 over days)
- Each analysis is personalized on 6 dimensions
- User journals each analysis: reasoning, thesis, key risks to monitor
- User begins to see patterns:
    - "This stock fits my profile"
    - "This one doesn't fit my risk tolerance"
    - "I'm learning this sector well"
    - "I should diversify into different sector"

**Personalization deepens:**

1. **Investment Thesis**:
    - Agnostic users: No change (no thesis bias)
    - Pattern recognition: "You're naturally drawn to profitable, growing companies" (emerging bias)
2. **Risk Tolerance**:
    - Refined: User sees which stocks fit, which exceed tolerance
    - Learning: "Stocks in 15-25% volatility range fit you; above 30% makes you uncomfortable"
3. **Time Horizon**:
    - Refined: User sees which growth rates are "boring" vs "exciting" for their timeline
    - Learning: "For 3-5 years, 8% growth feels slow; 12%+ feels right"
4. **Experience Level**:
    - Progressive: "You're getting better at understanding financial statements"
    - Adapted explanations: "Last month we explained this simply; now we're adding complexity"
5. **Sector Preference**:
    - Emerging: "You analyzed IT, banking, and pharma. You seem most confident in IT"
    - Recommendation: "Try analyzing more banking/pharma for balanced knowledge"
6. **Portfolio Context**:
    - Dynamic: "After this analysis, your portfolio would be 80% tech. Consider diversifying next"
    - Forward-looking: "Stocks that complement your existing positions are higher priority"

**Learning loops integrated:**

- User journals each analysis: "I analyzed Stock X because [reason]. I learned [concept]. Key risk to monitor: [metric]"
- Analysis journal tracks: blind spots ("You checked profitability in 5/5 stocks, but only debt in 2/5")
- Progressive skill building: "Level up: You now understand growth analysis. Next: Learn debt analysis"

**User Outcome:**

- Confidence building: 6/10 (paralyzed by data) → 7/10 (starting to see patterns) → 8.2/10 (clear-headed)
- Portfolio forming: "I have 2-3 conviction stocks identified"
- Emerging style: "I naturally gravitate toward profitable growth companies"
- Skill growing: Understands 3-4 key metrics deeply, learning more
- **Exit:**
    - Ready to validate thesis via simulator
    - OR Ready to consult advisor for complex decision
    - OR Enough conviction to deploy capital

---

### **PHASE 3: VALIDATION & PERSONALIZED ACTION (1-3 Sessions)**

**What happens:**

*Option A: Risk-free thesis testing*

- User tests thesis on **Investment Simulator** (backtest on 5-year historical)
- Simulator question: "If I'd bought this at today's price 5 years ago, would my thesis survive crashes?"
- **Personalized backtest results:**
    - For moderate-risk user: "Worst crash was -35%. Your tolerance is 25-30%. This is at the edge."
    - For 3-5 year horizon: "Thesis proved through multiple crash cycles in this timeframe"
    - For beginner experience: "Even if you bought at the worst time, you made +50%. This shows quality matters more than timing"
- Conviction increases: "I understand this can be volatile, but thesis is intact for my situation"

*Option B: Expert validation (for complex decisions)*

- User consults **Advisor Marketplace** (Phase 2 feature)
    - 50+ SEBI-registered advisors
    - Choose by specialization (sector, strategy, track record)
    - Process: AI pre-analysis (3 sec) + Expert review (40-60 min) + Personalized verdict
    - Cost: Pay-per-consultation (₹500-15K, no lock-in)
    - Personalization: "Based on your risk tolerance and time horizon, here's my recommendation"

*Option C: Deploy capital*

- User invests in validated position(s)
- App records: Investment thesis, entry price, position size, expected holding period
- Confidence: 8.5+/10 (thesis validated, risks understood, decision made)

**Personalization in execution:**

1. **Position sizing**: "Your risk tolerance suggests 10-15% allocation to this stock"
2. **Entry patience**: "For your risk profile, wait for 5% dip before deploying"
3. **Exit triggers**: "For your time horizon, hold through 20% dip. Exit if profitability breaks"
4. **Monitoring alerts**: Personalized to not send noise, only thesis-breaking events

**User Outcome:**

- Thesis validated (simulated or advised)
- Capital deployed
- Clear monitoring rules set
- Confidence: High (8.5+/10)

---

## The Repeat Loop (Ongoing Behavior - Time-Agnostic)

After initial action, users cycle through patterns based on their behavior:

**Trigger Points for Re-Entry:**

1. **Quarterly Earnings Announcement**
    - Market crash → Is thesis still intact?
    - Earnings beat/miss → Does it change thesis?
    - Guidance update → Should I hold/trim/add?
2. **Analyzing New Opportunities**
    - Market shift creates new idea
    - Stock recommendation from network
    - Sector rotation thesis
3. **Portfolio Rebalancing** (Phase 2 with portfolio connection)
    - "Am I still aligned to my target allocation?"
    - "Should I trim winner or add to loser?"
    - "Am I overconcentrated in sector X?"
4. **Sector/Market News**
    - Regulatory change
    - Competitor emergence
    - Industry disruption
5. **Personal Situation Changes**
    - Change in risk tolerance ("I need capital in 2 years now, not 5")
    - Change in time horizon ("Promotion = new savings rate")
    - Change in income ("Should I invest differently now?")

**Each Re-Entry Updates Personalization:**

When user returns to analyze same stock or new stocks:

- Risk tolerance: "Your comfort with volatility unchanged? Or has it changed?"
- Time horizon: "Still 3-5 years, or has your timeline shifted?"
- Experience level: "You've learned about profitability. Now ready for debt analysis?"
- Portfolio context: "After buying TCS, you're 80% tech. Next pick should diversify"
- Sector knowledge: "You're expert in IT now. Try learning new sector"

---

## User Behavior Patterns (Non-Linear, Not Time-Based)

StockFox accommodates all patterns:

| User Pattern | Sessions | Timeline | Monetization |
| --- | --- | --- | --- |
| **Speed-focused** | 1-2 per stock | Same day or next | ₹99/stock × 2-3 = ₹200-300 |
| **Thoughtful** | 3-5 per stock | Over days | ₹199/month all-access (after 2-3 stocks) |
| **Active manager** | 2-3x/week recurring | Ongoing | Subscription + advisor marketplace |
| **Casual** | 1 per month | Monthly check | Free-to-paid conversion opportunity |
| **Hybrid** | Variable | Project-based | Mix of transactions + subscription |

**All patterns drive value:**

- **Speed user**: Gets decision confidence fast, deploys capital, moves on
- **Thoughtful user**: Builds conviction, develops skill, becomes loyal
- **Active user**: Monetizes advisor marketplace, subscription, ecosystem
- **Casual user**: Retention through quarterly check-ins, free value
- **Hybrid user**: Multiple monetization touchpoints

---

## Key Differentiators in This Journey

| Dimension | StockFox | Competitors |
| --- | --- | --- |
| **Coverage** | All 11 segments analyzed | 6-8 segments (partial) |
| **Transparency** | 94% citations, evidence trail | Black-box or scattered data |
| **Peer Ranking** | Stack-rank against competitors | No comparison (Screener) or black-box (Liquide) |
| **Personalization** | 6-dimensional (even agnostic) | Generic one-size-fits-all or none |
| **Speed** | 10-15 min full analysis | 45+ min manual (Screener) |
| **Learning** | Integrated (learn while analyzing) | Separate (education ≠ tool) |
| **Validation** | Simulator + advisor marketplace | No validation tools |
| **Portfolio Context** | Phase 2 roadmap (diversification aware) | Not available |
| **Verdict Language** | Clear (Strong Buy/Neutral/Avoid) | Confusing or generic |

---

## Summary: Why This Journey Works for All Users

**For Agnostic Investors:**

- Don't need to define thresholds (StockFox methodology provides them)
- Trust peer ranking + 11-segment breakdown
- Personalization helps even without investment thesis bias
- Confidence comes from: "This stock is best-in-class AND fits my profile"

**For Thoughtful Investors:**

- Can take time to analyze multiple stocks
- See patterns emerge in their preferences
- Journal tracks their decision-making evolution
- Skill progresses with each analysis

**For Active Managers:**

- Recurring monitoring with intelligent alerts
- Advisor marketplace for complex decisions
- Portfolio awareness (Phase 2) enables rebalancing
- Repeating loop supports ongoing portfolio management

**For Speed-Focused Investors:**

- 10-15 min analysis complete
- Simulator validation quick
- Deploy capital confidently
- Move to next opportunity

**For Learners:**

- Contextual education integrated
- Skill tracking (7-level system)
- Each stock teaches 1-2 concepts
- Progress visualized over time

---

## Monetization Opportunity at Each Phase

**Phase 1: Discovery**

- Free: 3 stocks
- Paid: ₹99/stock thereafter

**Phase 2: Confidence Building**

- Micro-transactions: ₹99/stock × 4-5 stocks = ₹400-500
- OR: ₹199/month all-access (user realizes value, converts)

**Phase 3: Validation & Action**

- Simulator: Free (bundled)
- Advisor: ₹500-15K per consultation (Phase 2)

**Repeat Loop:**

- Subscription: ₹199-499/month (ongoing)
- Advisor marketplace: ₹500-15K/consultation (recurring)
- Premium features: [Not defined yet]

**Lifetime Value Path:**

- Agnostic user who finds value → ₹200-300 micro-transactions → ₹199/month subscription → ₹5-10K advisor consulting = ₹2,000-5,000 lifetime

---

## Critical Insight for Investors

**StockFox's journey works because:**

1. **Not time-constrained**: User can analyze 1 stock in 1 session or 5 stocks over days
2. **Not thesis-required**: Agnostic investors trust methodology + peer ranking + personalization
3. **Repeating loop**: Quarterly earnings, new ideas, portfolio rebalancing keep users engaged
4. **Personalization at scale**: Even without user-defined thresholds, 6D personalization delivers contextual recommendations
5. **Natural monetization**: Value delivered at each phase translates to willingness to pay

**Competitive advantage:**

- **vs Screener**: Automated insights + personalization (Screener is pure DIY)
- **vs Tickertape**: Clear verdict + peer ranking + personalization (Tickertape shows data, not guidance)
- **vs Liquide**: Transparent reasoning + 50+ advisor choice + agnostic-friendly (Liquide is black-box)
- **vs Traditional SRAs**: 10x faster, 60% cheaper, transparent methodology, no human bias

**The moat:**

- Institutional methodology (Vishal's 17 years) ensures quality
- 6D personalization ensures relevance
- Peer ranking ensures clarity
- Portfolio context (Phase 2) ensures depth
- These together create defensible competitive advantage for 5-7 years