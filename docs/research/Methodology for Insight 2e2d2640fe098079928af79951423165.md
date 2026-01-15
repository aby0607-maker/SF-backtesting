# Methodology for Insight

```jsx
3-LAYER RAG-BASED ARCHITECTURE (AI + Institutional Methodology)

CURRENT MECHANISM (Live Today):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

LAYER 1: RAG (Retrieval-Augmented Generation)
- Trained on Vishal's 17 years Julius Baer equity research methodology
- NOT generic AI - institutional logic baked into model
- Retrieves relevant analysis frameworks based on stock/sector/metric
- Example: "For IT services ROE analysis, apply Julius Baer's profitability framework"

Why RAG vs Generic AI:
  ✓ No hallucinations (retrieves from verified methodology corpus)
  ✓ Consistent quality (same institutional standards every time)
  ✓ Sector-specific logic (IT analyzed differently than Banking/Pharma)
  ✓ Lower cost + higher accuracy than pure LLM

LAYER 2: RULES-BASED AGGREGATION (Segment Scoring)
- Individual metrics → Segment scores using proven decision logic
- Example aggregation:
  - Profitability segment = f(ROE, Net Margin, Cash Conversion, EBITDA)
  - Each metric weighted based on importance (ROE 35%, Margin 30%, etc.)
  - Peer comparison: "ROE 46.8% vs sector avg 18.3%"
- Segment score → Overall verdict (weighted combination of all 11 segments)

Why Rules-Based:
  ✓ Transparent (users can see "how" score calculated)
  ✓ Auditable (backtested on historical data)
  ✓ Adjustable (can fine-tune weights based on sector)

LAYER 3: EVIDENCE CITATIONS & TEMPLATING
- Every insight linked to specific data source
- Citation format: [Metric] + [Source] + [Peer Comparison] + [Historical Trend]
- Example output:
  "ROE: 46.8% [Q4FY24 Annual Report, Page 87]
   vs Sector avg: 18.3% ✅ (+28.5pp outperformance)
   vs 5Y avg: 44.2% ✅ (improving trend)"

Why Citations:
  ✓ Build trust (users verify claims)
  ✓ Educational (learn where data comes from)
  ✓ Differentiation (vs black-box competitors)

QUALITY ASSURANCE (Current):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Vishal (SME) reviews algorithm outputs regularly
- Backtesting on historical stocks validates accuracy
- User feedback loop: "Was this insight helpful?"
- Continuous refinement based on edge cases

Current Coverage:
  ✓ 4-5 segments: Full DFY interpretation (RAG-generated insights)
  ✓ 6-7 segments: Raw data + basic scoring (users DIY analysis)

FUTURE MECHANISM (6-12 Months Post-Funding):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ENHANCEMENT 1: COMPLETE 11-SEGMENT DFY (Priority 1)
- Expand RAG corpus to cover ALL 11 segments
- Train on sector-specific frameworks (IT vs Banking vs Pharma)
- Timeline: Months 1-6

ENHANCEMENT 2: PERSONALIZED INSIGHT GENERATION (Priority 2)
- Layer user profile into RAG retrieval
- Example: Same stock, different insights:
  - For growth investor: "Revenue growth 12.4% below your 15% threshold"
  - For value investor: "P/E 28x represents 6% discount to 5Y avg"
- Timeline: Months 6-12

ENHANCEMENT 3: HUMAN-IN-LOOP QA (Phase 2 - Advisory)
- AI generates analysis → Advisor validates/modifies
- Advisor overrides tracked: "AI said BUY, Expert said HOLD because [X]"
- Feedback loop improves AI over time
- Timeline: Month 12+ (post-SEBI RA license)

ENHANCEMENT 4: REAL-TIME NEWS INTEGRATION
- Connect news/events to metric changes
- Example: "Debt ratio spiked due to acquisition announced on [Date]"
- Contextualize data movements with events
- Timeline: Months 9-12

ACCURACY METRICS (Target):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current (estimated):
  • Red flag detection: [X]% accuracy on historical stocks
  • Stock quality scoring: [X]% correlation with 3Y forward returns
  • Segment scoring: [X]% alignment with expert manual analysis

Target (12 months):
  • Red flag detection: 85%+ accuracy
  • Stock quality scoring: 75%+ correlation with forward returns
  • Segment scoring: 90%+ alignment with expert analysis
  • Citation coverage: 94%+ of claims backed by sources

COMPETITIVE ADVANTAGE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
vs Generic AI (ChatGPT/Perplexity):
  ✓ Domain-specific RAG (17 years institutional methodology)
  ✓ No hallucinations (retrieval-based, not generative)
  ✓ Sector-aware logic (IT ≠ Banking ≠ Pharma)

vs Liquide (AI Black Box):
  ✓ Full transparency (show reasoning, not just verdict)
  ✓ Citations (94% vs their 0%)
  ✓ Rules-based aggregation (auditable vs arbitrary)

vs Screener (No AI):
  ✓ DFY interpretation (vs raw data dump)
  ✓ Peer comparison automated (vs manual)
  ✓ Plain English insights (vs jargon metrics)

MOAT: Vishal's 17-year methodology + RAG training corpus = 18-24 months to replicate
```