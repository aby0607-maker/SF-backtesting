// User Profile Types
export type InvestmentThesis = 'growth' | 'value' | 'dividend' | 'quality' | 'agnostic'
export type RiskTolerance = 'conservative' | 'moderate' | 'aggressive'
export type TimeHorizon = 'short' | 'medium' | 'long' | 'very-long'
export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'

export interface UserProfile {
  id: string
  name: string
  displayName: string
  avatar: string
  investmentThesis: InvestmentThesis
  riskTolerance: RiskTolerance
  timeHorizon: TimeHorizon
  experienceLevel: ExperienceLevel
  sectorPreferences: string[]
  segmentWeights: Record<string, number>
  portfolio: Holding[]
  patterns: Pattern[]
  blindSpots: BlindSpot[]
  skillLevel: number
  skillBadge: string
}

// Stock Types
export type VerdictType = 'STRONG BUY' | 'BUY' | 'HOLD' | 'AVOID' | 'STRONG HOLD'

export interface Stock {
  id: string
  symbol: string
  name: string
  sector: string
  subSector: string
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  marketCap: number
  high52w: number
  low52w: number
  beta: number
  peerGroup: string[]
}

export interface StockVerdict {
  stockId: string
  profileId: string
  overallScore: number
  verdict: VerdictType
  verdictLabel?: string
  peerRank: number
  peerTotal: number
  peerCategory?: string
  peerGroup?: string
  topSignals: Signal[]
  topConcerns: Signal[]
  verdictRationale: string
  positionSizing: string
  entryGuidance: string
  segments: SegmentScore[]
  redFlags?: RedFlag[]
  riskWarning?: string
  learningPrompt?: string
  blindSpotAlert?: string
}

export interface Signal {
  title: string
  description: string
  metric?: string
  value?: string
  benchmark?: string
  isPositive?: boolean
}

// Segment Types
export interface SegmentScore {
  id: string
  name: string
  score: number
  weight: number
  status: 'positive' | 'neutral' | 'negative'
  interpretation: string
  metrics?: Metric[]
}

export interface Metric {
  id: string
  name: string
  value: string | number
  displayValue: string
  benchmark?: string
  benchmarkLabel?: string
  status: 'positive' | 'neutral' | 'negative'
  trend?: 'up' | 'down' | 'flat'
  tooltip: string
  citation?: Citation
}

export interface Citation {
  source: string
  document: string
  page?: string
  date: string
  url?: string
}

// Red Flag Types
export type RedFlagSeverity = 'critical' | 'high' | 'medium'

export interface RedFlag {
  id: string
  type: string
  title: string
  description: string
  severity: RedFlagSeverity
  action: string
}

// Portfolio Types
export interface Holding {
  symbol: string
  name: string
  quantity: number
  avgPrice: number
  currentPrice: number
  currentValue: number
  pnl: number
  pnlPercent: number
  allocation: number
}

// Journal Types
export type UserVerdict = 'BUY' | 'WATCHLIST' | 'SKIP' | 'AVOID'
export type OutcomeStatus = 'pending' | 'win' | 'loss' | 'neutral'

export interface JournalEntry {
  id: string
  date: string
  stock: {
    symbol: string
    name: string
    sector: string
  }
  scoreAtAnalysis: number
  verdictAtAnalysis: VerdictType
  userVerdict: UserVerdict
  userNotes: string
  priceAtAnalysis: number
  currentPrice: number
  pnlPercent: number
  outcomeStatus: OutcomeStatus
  segmentsChecked: string[]
  timeSpent: number
}

export interface Pattern {
  id: string
  title: string
  description: string
  type: 'strength' | 'preference' | 'behavior'
}

export interface BlindSpot {
  id: string
  segment: string
  checkRate: number
  suggestion: string
}

// Alert Types
export type AlertType = 'score_change' | 'peer_rank' | 'thesis_breaking' | 'news' | 'earnings' | 'concentration'
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  stock?: string
  title: string
  message: string
  timestamp: string
  isRead: boolean
  action?: string
}

// Advisor Types
export type AdvisorTier = 'elite' | 'expert' | 'emerging'

export interface Advisor {
  id: string
  name: string
  avatar: string
  tier: AdvisorTier
  specializations: string[]
  yearsExperience: number
  aum: string
  sebiRegistration: string
  rating: number
  reviewCount: number
  successRate: number
  consultationFee: number
  bio: string
}

// Discovery Types
export interface DiscoveryStock {
  symbol: string
  name: string
  sector: string
  score: number
  verdict: VerdictType
  analysisCount?: number
  scoreChange?: number
  matchReason?: string
}

// News Types
export type NewsSentiment = 'positive' | 'negative' | 'neutral'

export interface NewsItem {
  id: string
  title: string
  source: string
  timestamp: string
  sentiment: NewsSentiment
  relevance: string
  url?: string
}

// Chat Types
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  citations?: Citation[]
}
