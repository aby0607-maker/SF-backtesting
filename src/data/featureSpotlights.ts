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
export const featureSpotlights: FeatureSpotlight[] = [
  // ===== STOCK ANALYSIS PAGE =====

  // Overall Score & Verdict
  {
    id: 'overall-score',
    featureName: 'AI-Powered Overall Score',
    jtbd: 'Get a single, actionable number to make quick investment decisions',
    principle: 'simplicity',
    competitiveAdvantage: 'Unlike Screener/Tickertape which show raw data without interpretation, StockFox synthesizes 100+ metrics into one score personalized to YOUR investment style',
    userOutcome: 'Make confident decisions in 30 seconds instead of hours of research',
    location: 'stock-analysis',
    targetElement: 'score-gauge',
  },

  // Verdict Badge
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

  // 11-Segment Analysis
  {
    id: 'eleven-segments',
    featureName: '11-Segment Deep Analysis',
    jtbd: 'Understand every angle of a stock before committing capital',
    principle: 'comprehensive',
    competitiveAdvantage: 'Screener shows 5-6 metrics. Tickertape shows 20. StockFox analyzes ALL 11 segments: Profitability, Growth, Valuation, Financial Health, Technical, Price Action, Broker Ratings, Ownership, F&O, Income Statement, Balance Sheet',
    userOutcome: 'Never miss a critical angle - catch red flags that others miss',
    location: 'stock-analysis',
    targetElement: 'segments-section',
  },

  // Evidence Chain
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

  // Red Flag Scanner
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

  // Pros & Cons
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

  // DFY/DIY Mode Toggle
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

  // Metric-by-Metric Learning
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

  // Ask AI
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

  // Position Sizing
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

  // ===== SEGMENT DEEP DIVE PAGE =====

  // Segment Score Justification
  {
    id: 'segment-justification',
    featureName: 'Score Justification Explainers',
    jtbd: 'Understand WHY a segment scored what it did',
    principle: 'transparent',
    competitiveAdvantage: 'Competitors show scores without explanation. StockFox provides 2-3 line justifications for every score, rank, and verdict',
    userOutcome: 'Never wonder "but why?" - every number has a plain English explanation',
    location: 'segment-deep-dive',
    targetElement: 'score-justification',
  },

  // Metric Benchmarks
  {
    id: 'metric-benchmarks',
    featureName: 'Sector Benchmarks',
    jtbd: 'Know if a metric is good or bad relative to peers',
    principle: 'comprehensive',
    competitiveAdvantage: 'Raw PE ratio means nothing without context. StockFox shows every metric against sector average, sector best, and historical trends',
    userOutcome: 'Instantly know if 25% ROE is great (for banks) or average (for IT)',
    location: 'segment-deep-dive',
    targetElement: 'metric-benchmark',
  },

  // Simple Explainers
  {
    id: 'simple-explainers',
    featureName: 'Beginner-Friendly Explainers',
    jtbd: 'Understand financial jargon without a finance degree',
    principle: 'simplicity',
    competitiveAdvantage: 'Screener assumes you know what ROCE means. StockFox has one-tap explainers for every metric in plain English',
    userOutcome: 'Learn financial literacy naturally while researching stocks',
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

  // ===== SPEED =====

  // Instant Analysis
  {
    id: 'instant-analysis',
    featureName: 'Real-Time Analysis',
    jtbd: 'Get comprehensive analysis without waiting',
    principle: 'fast',
    competitiveAdvantage: 'Traditional SRA reports take 3-5 days. StockFox generates comprehensive 11-segment analysis in under 2 seconds',
    userOutcome: 'Research 10 stocks in the time it takes to read one SRA report',
    location: 'stock-analysis',
    targetElement: 'hero-card',
  },

  // Auto Updates
  {
    id: 'auto-updates',
    featureName: 'Automatic Data Updates',
    jtbd: 'Always have current data without manual refresh',
    principle: 'fast',
    competitiveAdvantage: 'Screener data can be 1-2 quarters old. StockFox syncs with latest filings automatically',
    userOutcome: 'Make decisions on Q3 data, not Q1 data',
    location: 'stock-analysis',
    targetElement: 'data-source',
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
