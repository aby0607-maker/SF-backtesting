// Feature Spotlight Data for Investor Demo Mode
// Each spotlight highlights a feature with its JTBD, principle, competitive advantage, and user outcome

export type ProductPrinciple =
  | 'comprehensive'
  | 'personalization'
  | 'transparent'
  | 'fast'
  | 'educational'
  | 'simplicity'

export interface FeatureSpotlight {
  id: string
  featureName: string
  jtbd: string // Job To Be Done - what problem it solves
  principle: ProductPrinciple
  competitiveAdvantage: string // How it's better vs competition
  userOutcome: string // What the user gets
  location: string // Where in the UI this feature appears
  targetElement?: string // CSS selector or element ID for positioning
}

// Product Principle display info
export const principleInfo: Record<ProductPrinciple, { label: string; emoji: string; color: string; bgColor: string }> = {
  comprehensive: {
    label: 'Comprehensive',
    emoji: '360',
    color: 'text-primary-400',
    bgColor: 'bg-primary-500/20',
  },
  personalization: {
    label: '6D Personalization',
    emoji: '6D',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
  },
  transparent: {
    label: 'Transparent',
    emoji: 'T',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/20',
  },
  fast: {
    label: 'Fast & Automatic',
    emoji: 'F',
    color: 'text-warning-400',
    bgColor: 'bg-warning-500/20',
  },
  educational: {
    label: 'Educational',
    emoji: 'E',
    color: 'text-info-400',
    bgColor: 'bg-info-500/20',
  },
  simplicity: {
    label: 'Simplicity',
    emoji: 'S',
    color: 'text-success-400',
    bgColor: 'bg-success-500/20',
  },
}

// All feature spotlights organized by page/section
// IMPORTANT: Order follows natural user flow (top to bottom on page)
export const featureSpotlights: FeatureSpotlight[] = [
  // ===== STOCK ANALYSIS PAGE - Ordered by page flow =====

  // 1. Mode Toggle (top right header)
  {
    id: 'dfy-diy-toggle',
    featureName: 'DFY / DIY Analysis Modes',
    jtbd: 'Get guidance when needed, but explore raw data when ready',
    principle: 'educational',
    competitiveAdvantage: 'Liquide/StockGro only show their AI picks. Screener only shows raw data. StockFox offers BOTH: DFY (Done For You) with interpretations, DIY (Do It Yourself) with raw metrics + benchmarks',
    userOutcome: 'Learn by doing - compare your analysis with the system, improve over time',
    location: 'stock-analysis',
    targetElement: 'mode-toggle',
  },

  // 2. Overall Score (hero card)
  {
    id: 'overall-score',
    featureName: 'AI-Powered Overall Score',
    jtbd: 'Get a single, actionable number to make quick investment decisions',
    principle: 'simplicity',
    competitiveAdvantage: 'Unlike Screener/Tickertape which show raw data without interpretation, StockFox synthesizes 100+ metrics into one score personalized to YOUR investment style',
    userOutcome: 'Make confident decisions in 30 seconds instead of hours of research',
    location: 'stock-analysis',
    targetElement: 'overall-score',
  },

  // 3. Verdict Badge
  {
    id: 'verdict-badge',
    featureName: 'Personalized Verdict',
    jtbd: 'Know if this stock is right for MY specific goals and risk tolerance',
    principle: 'personalization',
    competitiveAdvantage: 'Traditional SRAs give one-size-fits-all recommendations. StockFox tailors the verdict to your 6D profile: Risk Tolerance, Time Horizon, Experience, Investment Thesis, Sector Preference, and Portfolio Context',
    userOutcome: 'See "STRONG BUY for Growth Investors" vs generic "BUY" - because a stock great for Meera may not suit Dinesh',
    location: 'stock-analysis',
    targetElement: 'verdict-badge',
  },

  // 4. Evidence Chain (how we arrived at score)
  {
    id: 'evidence-chain',
    featureName: '3-Layer Evidence Chain',
    jtbd: 'Trust the score by understanding exactly how it was calculated',
    principle: 'transparent',
    competitiveAdvantage: 'Other platforms show scores as black boxes. StockFox traces every score to: L1 (Raw Data Source) -> L2 (Calculation Method) -> L3 (Score Contribution)',
    userOutcome: 'Never blindly trust a number - verify every claim with audited sources',
    location: 'stock-analysis',
    targetElement: 'evidence-chain',
  },

  // 5. Ask AI CTA
  {
    id: 'ask-ai',
    featureName: 'Ask AI (Instant Q&A)',
    jtbd: 'Get instant answers to any question about this stock',
    principle: 'fast',
    competitiveAdvantage: 'Traditional SRAs require booking calls. Forum research takes hours. StockFox AI answers any question instantly with sourced data',
    userOutcome: 'Ask "Is Zomato profitable?" and get a sourced answer in 3 seconds',
    location: 'stock-analysis',
    targetElement: 'ask-ai-cta',
  },

  // 5b. Consult Expert CTA
  {
    id: 'consult-expert',
    featureName: 'SEBI-Registered Expert Access',
    jtbd: 'Get human validation for high-stakes decisions',
    principle: 'comprehensive',
    competitiveAdvantage: 'Unlike YouTube gurus or Telegram tipsters, StockFox connects you with verified SEBI-registered advisors for fiduciary advice',
    userOutcome: 'Validate your thesis with a real expert before investing lakhs',
    location: 'stock-analysis',
    targetElement: 'consult-expert',
  },

  // 6. Pros & Cons (Strengths/Weaknesses)
  {
    id: 'pros-cons',
    featureName: 'Strengths & Weaknesses Summary',
    jtbd: 'Quickly understand the bull and bear case',
    principle: 'simplicity',
    competitiveAdvantage: 'Raw data requires mental processing. StockFox distills key signals into plain English pros/cons with explanations',
    userOutcome: 'Explain to anyone why you bought a stock in 30 seconds',
    location: 'stock-analysis',
    targetElement: 'pros-cons',
  },

  // 7. Red Flag Scanner
  {
    id: 'red-flag-scanner',
    featureName: '35-Parameter Red Flag Scanner',
    jtbd: 'Protect myself from frauds, defaults, and manipulation',
    principle: 'comprehensive',
    competitiveAdvantage: 'Screener has no red flag alerts. Tickertape shows 3-4. StockFox scans ALL 35 parameters: ASM/GSM lists, promoter pledging, auditor qualifications, SEBI orders, forensic flags, and more',
    userOutcome: 'Sleep peacefully knowing your money is protected from the next Satyam/DHFL',
    location: 'stock-analysis',
    targetElement: 'red-flag-scanner',
  },

  // 8. Full 11-Segment Analysis
  {
    id: 'full-segment-analysis',
    featureName: '11-Segment Deep Analysis',
    jtbd: 'Understand the complete picture across all dimensions that matter',
    principle: 'comprehensive',
    competitiveAdvantage: 'Most platforms show 4-5 metrics. StockFox analyzes 11 comprehensive segments: Financials, Valuations, Momentum, Management Quality, Shareholding, Technicals, and more',
    userOutcome: 'Never miss a critical factor - see the full 360° view before investing',
    location: 'stock-analysis',
    targetElement: 'segments-section',
  },

  // 9. Metric-by-Metric Learning
  {
    id: 'guided-tour',
    featureName: 'Metric-by-Metric Guided Tour',
    jtbd: 'Learn how to analyze stocks properly, step by step',
    principle: 'educational',
    competitiveAdvantage: 'No other platform teaches while you research. StockFox lets you rate metrics yourself BEFORE seeing the system score - building real analysis skills',
    userOutcome: 'Graduate from blindly following tips to making your own informed decisions',
    location: 'stock-analysis',
    targetElement: 'guided-tour',
  },

  // 9. News Section (appears after learning actions in UI)
  {
    id: 'news-section',
    featureName: 'Sentiment-Tagged News Feed',
    jtbd: 'Stay updated on material news without information overload',
    principle: 'fast',
    competitiveAdvantage: 'Economic Times has 50 articles a day. StockFox curates 5-7 material updates with sentiment tags (positive/negative/neutral) so you know what matters',
    userOutcome: 'Never miss a red flag news event that could tank your stock',
    location: 'stock-analysis',
    targetElement: 'news-section',
  },

  // 10. Upcoming Events
  {
    id: 'upcoming-events',
    featureName: 'Earnings Calendar & Events',
    jtbd: 'Know when key catalysts are coming so I can time my decisions',
    principle: 'fast',
    competitiveAdvantage: 'No need to manually track earnings dates. StockFox shows upcoming results, AGMs, dividends, and bonus announcements in one place',
    userOutcome: 'Never be surprised by a quarterly result again',
    location: 'stock-analysis',
    targetElement: 'upcoming-events',
  },

  // 11. Entry Assessment / Position Sizing
  {
    id: 'position-sizing',
    featureName: 'Smart Position Sizing',
    jtbd: 'Know exactly how much of my portfolio to allocate',
    principle: 'personalization',
    competitiveAdvantage: 'Other platforms say "Buy" without sizing guidance. StockFox recommends specific allocation % based on your risk profile and existing portfolio',
    userOutcome: 'Avoid the common mistake of putting too much in one stock',
    location: 'stock-analysis',
    targetElement: 'entry-assessment',
  },

  // 12. Compare Peers (in More Actions section)
  {
    id: 'compare-peers-cta',
    featureName: 'Side-by-Side Peer Comparison',
    jtbd: 'Quickly see how this stock stacks up against competitors',
    principle: 'comprehensive',
    competitiveAdvantage: 'Tickertape comparison is manual. Screener shows raw numbers. StockFox auto-identifies relevant peers and compares all 11 segments with visual indicators',
    userOutcome: 'Decide between Zomato and Swiggy in 2 minutes instead of 2 hours',
    location: 'stock-analysis',
    targetElement: 'compare-peers',
  },

  // 13. Back-Test / Historical Validation (in More Actions section)
  {
    id: 'back-test',
    featureName: 'Back-Test Historical Returns',
    jtbd: 'Validate if this scoring model would have worked historically',
    principle: 'transparent',
    competitiveAdvantage: 'Most platforms show forward-looking predictions. StockFox shows what returns you would have earned if you followed our system historically',
    userOutcome: 'Trust the model because you can verify it worked in the past',
    location: 'stock-analysis',
    targetElement: 'back-test',
  },

  // ===== DASHBOARD PAGE =====

  // Personalized Greeting
  {
    id: 'personalized-greeting',
    featureName: 'Personalized Dashboard',
    jtbd: 'Feel like the app knows ME and my investment journey',
    principle: 'personalization',
    competitiveAdvantage: 'Screener shows the same page to everyone. StockFox greets you by name and shows insights tailored to YOUR patterns and goals',
    userOutcome: 'Start each session knowing exactly what needs your attention',
    location: 'dashboard',
    targetElement: 'personalized-greeting',
  },

  // Watchlist with Scores
  {
    id: 'watchlist-scores',
    featureName: 'Scored Watchlist',
    jtbd: 'Quickly see which of my tracked stocks need attention',
    principle: 'fast',
    competitiveAdvantage: 'Other watchlists just show prices. StockFox shows personalized scores, sector ranks, and top signals so you can prioritize at a glance',
    userOutcome: 'Identify your best and worst performers in 5 seconds',
    location: 'dashboard',
    targetElement: 'watchlist',
  },

  // Trending Stocks
  {
    id: 'trending-stocks',
    featureName: 'Trending This Week',
    jtbd: 'Stay on top of what the market is excited about',
    principle: 'fast',
    competitiveAdvantage: 'Instead of scouring Twitter and forums, StockFox surfaces trending stocks with context on WHY they are trending and if they match YOUR profile',
    userOutcome: 'Never miss a market opportunity because you were not paying attention',
    location: 'dashboard',
    targetElement: 'trending-stocks',
  },

  // AI Recommendations
  {
    id: 'similar-picks',
    featureName: 'AI-Powered Recommendations',
    jtbd: 'Discover new stocks that match my investment style',
    principle: 'personalization',
    competitiveAdvantage: 'Generic screeners show the same results to everyone. StockFox recommends stocks similar to YOUR picks based on YOUR 6D profile',
    userOutcome: 'Find your next multi-bagger without hours of research',
    location: 'dashboard',
    targetElement: 'similar-picks',
  },

  // Alerts
  {
    id: 'smart-alerts',
    featureName: 'Smart Price & Event Alerts',
    jtbd: 'Get notified when something important happens to my stocks',
    principle: 'fast',
    competitiveAdvantage: 'Generic price alerts are noisy. StockFox alerts are contextual - red flags, earnings beats, promoter changes - filtered by what matters to YOUR profile',
    userOutcome: 'Never be caught off guard by a material event in your portfolio',
    location: 'dashboard',
    targetElement: 'alerts-section',
  },

  // Free Tier Banner (Monetization)
  {
    id: 'freemium-model',
    featureName: 'Freemium with Value',
    jtbd: 'Try the product before paying',
    principle: 'transparent',
    competitiveAdvantage: 'Unlike platforms that hide features behind paywalls, StockFox gives you 5 free analyses per month to experience the full value before upgrading',
    userOutcome: 'Make an informed purchase decision based on real usage',
    location: 'dashboard',
    targetElement: 'free-tier-banner',
  },

  // ===== SEGMENT DEEP DIVE PAGE - Ordered top to bottom =====

  // 1. Sector Anchoring (Rank, Average, vs Sector) - TOP
  {
    id: 'metric-benchmarks',
    featureName: 'Sector Benchmarks & Ranking',
    jtbd: 'Know if a metric is good or bad relative to peers',
    principle: 'comprehensive',
    competitiveAdvantage: 'Raw PE ratio means nothing without context. StockFox shows sector rank, sector average, and outperformance metrics at a glance',
    userOutcome: 'Instantly see you are #2 of 6 in Profitability, outperforming sector by +2.3',
    location: 'segment-deep-dive',
    targetElement: 'metric-benchmark',
  },

  // 2. Segment Header (Score, Name, Status, Interpretation)
  {
    id: 'segment-header',
    featureName: 'Segment Score Summary',
    jtbd: 'Get a quick verdict on this specific dimension',
    principle: 'simplicity',
    competitiveAdvantage: 'Other platforms show raw numbers. StockFox gives you a score out of 10, a clear status (Positive/Neutral/Negative), and a one-line interpretation',
    userOutcome: 'Understand if this segment is a strength or weakness in 3 seconds',
    location: 'segment-deep-dive',
    targetElement: 'segment-header',
  },

  // 3. Evidence Panel (How We Scored This Segment)
  {
    id: 'segment-justification',
    featureName: 'Score Justification & Evidence',
    jtbd: 'Understand WHY a segment scored what it did',
    principle: 'transparent',
    competitiveAdvantage: 'Competitors show scores without explanation. StockFox traces every score through 3 layers: Data Sources → Methodology → Contribution to final score',
    userOutcome: 'Never wonder "but why?" - verify every claim with audited evidence',
    location: 'segment-deep-dive',
    targetElement: 'score-justification',
  },

  // 4. Key Metrics (Expandable metric cards with grounding)
  {
    id: 'key-metrics',
    featureName: 'Grounded Key Metrics',
    jtbd: 'See the actual numbers behind the score',
    principle: 'transparent',
    competitiveAdvantage: 'Other platforms show metrics in isolation. StockFox shows each metric with: value, status, benchmark comparison, trend intelligence, and source citations',
    userOutcome: 'Drill into ROE of 3.2% and see it is GOOD for food delivery, with links to the source filing',
    location: 'segment-deep-dive',
    targetElement: 'key-metrics',
  },

  // 5. What This Means For You (Personalized explanation)
  {
    id: 'simple-explainers',
    featureName: 'Personalized Explainer',
    jtbd: 'Understand what this means for MY investment decision',
    principle: 'educational',
    competitiveAdvantage: 'Screener assumes you know what ROCE means. StockFox explains in plain English tailored to your experience level and investment thesis',
    userOutcome: 'A beginner sees "the company is good at making money" while an expert sees "strong operational efficiency with competitive advantage"',
    location: 'segment-deep-dive',
    targetElement: 'metric-explainer',
  },

  // ===== PROFILE/PERSONALIZATION =====

  // 6D Profiling
  {
    id: 'six-d-profile',
    featureName: '6D Investor Profiling',
    jtbd: 'Get recommendations that match MY unique situation',
    principle: 'personalization',
    competitiveAdvantage: 'Traditional platforms ask 3 questions. StockFox profiles across 6 dimensions: Risk Tolerance, Time Horizon, Experience Level, Investment Thesis, Sector Preferences, and Current Portfolio',
    userOutcome: 'See analysis tuned to YOU - not a generic "retail investor"',
    location: 'profile',
    targetElement: 'profile-section',
  },

  // Dynamic Weights
  {
    id: 'dynamic-weights',
    featureName: 'Dynamic Segment Weights',
    jtbd: 'Weight metrics by what matters to ME',
    principle: 'personalization',
    competitiveAdvantage: 'Fixed scoring models penalize growth stocks on valuation. StockFox adjusts weights based on your thesis - growth investors see momentum weighted higher, value investors see margins weighted higher',
    userOutcome: 'Zomato scores differently for Momentum Meera vs Skeptical Sneha - as it should',
    location: 'profile',
    targetElement: 'segment-weights',
  },

  // ===== COMPARISON =====

  // Peer Comparison
  {
    id: 'peer-comparison',
    featureName: 'Side-by-Side Peer Comparison',
    jtbd: 'Compare this stock against its direct competitors',
    principle: 'comprehensive',
    competitiveAdvantage: 'Tickertape comparison is manual and limited. StockFox auto-suggests relevant peers and compares all 11 segments side by side',
    userOutcome: 'See exactly where Zomato beats Swiggy and where it lags',
    location: 'compare',
    targetElement: 'compare-table',
  },
]

// Get spotlights for a specific page/location
export function getSpotlightsForLocation(location: string): FeatureSpotlight[] {
  return featureSpotlights.filter(s => s.location === location)
}

// Get spotlight by ID
export function getSpotlightById(id: string): FeatureSpotlight | undefined {
  return featureSpotlights.find(s => s.id === id)
}

// Get all unique principles used
export function getUsedPrinciples(): ProductPrinciple[] {
  const principles = new Set(featureSpotlights.map(s => s.principle))
  return Array.from(principles) as ProductPrinciple[]
}
