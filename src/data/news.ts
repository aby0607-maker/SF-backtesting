/**
 * StockFox News & Signal Data
 * Mock news items for demo stocks with segment linkage
 */

export interface NewsItem {
  id: string
  stockId: string
  headline: string
  summary: string
  source: string
  timestamp: string
  category: 'earnings' | 'management' | 'sector' | 'regulatory' | 'product' | 'market'
  sentiment: 'positive' | 'negative' | 'neutral'
  impactSegments: string[] // Which analysis segments this news affects
  importance: 'high' | 'medium' | 'low'
  url?: string
}

// Zomato News
export const zomatoNews: NewsItem[] = [
  {
    id: 'zomato-1',
    stockId: 'ZOMATO',
    headline: 'Zomato Reports First-Ever Annual Profit in FY24',
    summary: 'Zomato reported its maiden annual profit of ₹351 crore in FY24, driven by improved unit economics and cost optimization across food delivery and quick commerce segments.',
    source: 'Economic Times',
    timestamp: '2024-01-15T09:30:00Z',
    category: 'earnings',
    sentiment: 'positive',
    impactSegments: ['profitability', 'income_statement', 'growth'],
    importance: 'high',
    url: 'https://economictimes.com'
  },
  {
    id: 'zomato-2',
    stockId: 'ZOMATO',
    headline: 'Blinkit Expands to 30 New Cities, Aims for 1000 Dark Stores',
    summary: 'Zomato\'s quick commerce arm Blinkit announced aggressive expansion plans with 30 new cities and target of 1000 dark stores by end of FY25.',
    source: 'Mint',
    timestamp: '2024-01-10T14:15:00Z',
    category: 'product',
    sentiment: 'positive',
    impactSegments: ['growth', 'balance_sheet'],
    importance: 'high'
  },
  {
    id: 'zomato-3',
    stockId: 'ZOMATO',
    headline: 'FII Holding in Zomato Increases to 52% in Q3',
    summary: 'Foreign institutional investors increased their stake in Zomato to 52%, signaling strong global confidence in the company\'s growth trajectory.',
    source: 'Business Standard',
    timestamp: '2024-01-08T11:00:00Z',
    category: 'market',
    sentiment: 'positive',
    impactSegments: ['ownership'],
    importance: 'medium'
  },
  {
    id: 'zomato-4',
    stockId: 'ZOMATO',
    headline: 'Competition Intensifies: Swiggy IPO Filing Expected Soon',
    summary: 'Swiggy is expected to file for IPO soon, which could intensify competition in the food delivery space and pressure margins.',
    source: 'Reuters',
    timestamp: '2024-01-05T16:45:00Z',
    category: 'sector',
    sentiment: 'neutral',
    impactSegments: ['valuation', 'profitability'],
    importance: 'medium'
  },
  {
    id: 'zomato-5',
    stockId: 'ZOMATO',
    headline: 'Zomato Launches AI-Powered Delivery Route Optimization',
    summary: 'New AI system expected to reduce delivery times by 15% and improve delivery partner earnings by optimizing routes.',
    source: 'TechCrunch India',
    timestamp: '2024-01-02T10:30:00Z',
    category: 'product',
    sentiment: 'positive',
    impactSegments: ['financial_ratios', 'growth'],
    importance: 'low'
  }
]

// Axis Bank News
export const axisBankNews: NewsItem[] = [
  {
    id: 'axis-1',
    stockId: 'AXISBANK',
    headline: 'Axis Bank Q3 Net Profit Rises 4% to ₹6,071 Crore',
    summary: 'Axis Bank reported a 4% year-on-year increase in net profit to ₹6,071 crore for Q3 FY24, with NIM stable at 4.01%.',
    source: 'CNBC TV18',
    timestamp: '2024-01-18T10:00:00Z',
    category: 'earnings',
    sentiment: 'positive',
    impactSegments: ['profitability', 'income_statement'],
    importance: 'high',
    url: 'https://cnbctv18.com'
  },
  {
    id: 'axis-2',
    stockId: 'AXISBANK',
    headline: 'Gross NPA Ratio Improves to 1.58% in Q3',
    summary: 'Asset quality continues to improve with Gross NPA ratio declining to 1.58% from 1.73% in the previous quarter.',
    source: 'Moneycontrol',
    timestamp: '2024-01-18T11:30:00Z',
    category: 'earnings',
    sentiment: 'positive',
    impactSegments: ['financial_ratios', 'balance_sheet'],
    importance: 'high'
  },
  {
    id: 'axis-3',
    stockId: 'AXISBANK',
    headline: 'RBI Flags Concerns Over Unsecured Lending Growth',
    summary: 'RBI has raised concerns about rapid growth in unsecured loans across banking sector, which could impact Axis Bank\'s retail lending strategy.',
    source: 'Economic Times',
    timestamp: '2024-01-12T09:15:00Z',
    category: 'regulatory',
    sentiment: 'negative',
    impactSegments: ['growth', 'financial_ratios'],
    importance: 'high'
  },
  {
    id: 'axis-4',
    stockId: 'AXISBANK',
    headline: 'Axis Bank Launches Digital Lending Platform for MSMEs',
    summary: 'New digital platform aims to disburse ₹10,000 crore loans to MSMEs in FY25 with faster approval times.',
    source: 'Business Today',
    timestamp: '2024-01-08T14:00:00Z',
    category: 'product',
    sentiment: 'positive',
    impactSegments: ['growth', 'income_statement'],
    importance: 'medium'
  },
  {
    id: 'axis-5',
    stockId: 'AXISBANK',
    headline: 'Promoter Stake Remains Unchanged at 8.22%',
    summary: 'Quarterly shareholding pattern shows promoter holding stable, with DIIs increasing stake by 0.3%.',
    source: 'BSE Filing',
    timestamp: '2024-01-05T18:00:00Z',
    category: 'market',
    sentiment: 'neutral',
    impactSegments: ['ownership'],
    importance: 'low'
  }
]

// TCS News
export const tcsNews: NewsItem[] = [
  {
    id: 'tcs-1',
    stockId: 'TCS',
    headline: 'TCS Q3 Revenue Grows 4% YoY to ₹60,583 Crore',
    summary: 'TCS reported sequential growth with revenue of ₹60,583 crore. Deal wins at $8.1 billion signal strong pipeline.',
    source: 'NDTV Profit',
    timestamp: '2024-01-11T16:30:00Z',
    category: 'earnings',
    sentiment: 'positive',
    impactSegments: ['growth', 'income_statement'],
    importance: 'high',
    url: 'https://ndtvprofit.com'
  },
  {
    id: 'tcs-2',
    stockId: 'TCS',
    headline: 'TCS Announces Interim Dividend of ₹27 Per Share',
    summary: 'Board approved interim dividend of ₹27 per share with record date of January 18, 2024.',
    source: 'BSE Filing',
    timestamp: '2024-01-11T17:00:00Z',
    category: 'earnings',
    sentiment: 'positive',
    impactSegments: ['income_statement', 'valuation'],
    importance: 'medium'
  },
  {
    id: 'tcs-3',
    stockId: 'TCS',
    headline: 'Attrition Falls to 13.3%, Lowest in 2 Years',
    summary: 'Employee attrition continues to decline, reaching 13.3% in Q3 - the lowest in 8 quarters, signaling improved talent retention.',
    source: 'Mint',
    timestamp: '2024-01-11T18:30:00Z',
    category: 'management',
    sentiment: 'positive',
    impactSegments: ['financial_ratios', 'profitability'],
    importance: 'medium'
  },
  {
    id: 'tcs-4',
    stockId: 'TCS',
    headline: 'BFSI Vertical Shows Signs of Recovery in North America',
    summary: 'Banking and financial services vertical, TCS\'s largest, shows early signs of recovery in discretionary spending.',
    source: 'Reuters',
    timestamp: '2024-01-09T12:00:00Z',
    category: 'sector',
    sentiment: 'positive',
    impactSegments: ['growth', 'broker_ratings'],
    importance: 'medium'
  },
  {
    id: 'tcs-5',
    stockId: 'TCS',
    headline: 'TCS Wins $500 Million Deal from European Bank',
    summary: 'Multi-year digital transformation deal with major European bank expected to ramp up in H2 FY25.',
    source: 'Economic Times',
    timestamp: '2024-01-03T09:45:00Z',
    category: 'product',
    sentiment: 'positive',
    impactSegments: ['growth', 'income_statement'],
    importance: 'high'
  }
]

// Export all news
export const allNews: NewsItem[] = [
  ...zomatoNews,
  ...axisBankNews,
  ...tcsNews,
]

// Helper functions
export function getNewsForStock(stockId: string): NewsItem[] {
  return allNews.filter(n => n.stockId === stockId.toUpperCase())
}

export function getLatestNews(stockId: string, limit: number = 5): NewsItem[] {
  return getNewsForStock(stockId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}

export function getNewsBySegment(stockId: string, segmentId: string): NewsItem[] {
  return getNewsForStock(stockId).filter(n => n.impactSegments.includes(segmentId))
}

export function getNewsBySentiment(stockId: string, sentiment: NewsItem['sentiment']): NewsItem[] {
  return getNewsForStock(stockId).filter(n => n.sentiment === sentiment)
}

export function getHighImportanceNews(stockId: string): NewsItem[] {
  return getNewsForStock(stockId).filter(n => n.importance === 'high')
}

// Format timestamp for display
export function formatNewsTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// Get category label
export function getCategoryLabel(category: NewsItem['category']): string {
  const labels: Record<NewsItem['category'], string> = {
    earnings: 'Earnings',
    management: 'Management',
    sector: 'Sector News',
    regulatory: 'Regulatory',
    product: 'Business Update',
    market: 'Market Activity'
  }
  return labels[category]
}

// Thesis Impact Analysis
export interface ThesisImpact {
  thesis: 'growth' | 'value' | 'dividend' | 'quality' | 'agnostic'
  impact: 'positive' | 'negative' | 'neutral'
  scoreChange: string
  reason: string
}

// Calculate thesis impact for a news item
export function getThesisImpact(news: NewsItem, thesis: string): ThesisImpact {
  const thesisType = thesis as ThesisImpact['thesis']

  // Map segments to thesis relevance
  const thesisSegmentWeights: Record<string, Record<string, number>> = {
    growth: { growth: 3, profitability: 2, income_statement: 2, product: 2, financial_ratios: 1 },
    value: { valuation: 3, profitability: 2, balance_sheet: 2, financial_ratios: 2, ownership: 1 },
    dividend: { income_statement: 3, valuation: 2, profitability: 2, balance_sheet: 1, ownership: 1 },
    quality: { profitability: 3, financial_ratios: 2, balance_sheet: 2, growth: 1, management: 2 },
    agnostic: { growth: 1, profitability: 1, valuation: 1, balance_sheet: 1, financial_ratios: 1 },
  }

  const weights = thesisSegmentWeights[thesisType] || thesisSegmentWeights.agnostic
  let relevanceScore = 0

  news.impactSegments.forEach(segment => {
    const normalizedSegment = segment.toLowerCase().replace(/\s+/g, '_')
    relevanceScore += weights[normalizedSegment] || 0.5
  })

  // Calculate impact
  const baseImpact = news.sentiment === 'positive' ? 0.1 : news.sentiment === 'negative' ? -0.1 : 0
  const scoreChange = (baseImpact * relevanceScore * (news.importance === 'high' ? 1.5 : news.importance === 'medium' ? 1 : 0.5)).toFixed(1)

  // Generate reason based on thesis
  let reason = ''
  switch (thesisType) {
    case 'growth':
      reason = news.sentiment === 'positive'
        ? `Supports growth trajectory${news.impactSegments.includes('growth') ? ' - directly impacts growth metrics' : ''}`
        : news.sentiment === 'negative'
          ? `May slow growth momentum${news.impactSegments.includes('growth') ? ' - affects key growth drivers' : ''}`
          : 'Monitor for growth implications'
      break
    case 'value':
      reason = news.sentiment === 'positive'
        ? `Strengthens value proposition${news.impactSegments.includes('valuation') ? ' - may improve valuation metrics' : ''}`
        : news.sentiment === 'negative'
          ? `Potential margin of safety concern${news.impactSegments.includes('valuation') ? ' - watch for valuation impact' : ''}`
          : 'Limited impact on value thesis'
      break
    case 'dividend':
      reason = news.sentiment === 'positive'
        ? `Supports income stability${news.impactSegments.includes('income_statement') ? ' - positive for dividend capacity' : ''}`
        : news.sentiment === 'negative'
          ? `Monitor dividend sustainability${news.impactSegments.includes('income_statement') ? ' - could affect payout' : ''}`
          : 'Neutral for dividend outlook'
      break
    case 'quality':
      reason = news.sentiment === 'positive'
        ? `Reinforces quality attributes${news.impactSegments.includes('profitability') ? ' - strengthens earnings quality' : ''}`
        : news.sentiment === 'negative'
          ? `Quality concern${news.impactSegments.includes('profitability') ? ' - may affect profitability metrics' : ''}`
          : 'Monitor for quality signals'
      break
    default:
      reason = news.sentiment === 'positive' ? 'Generally positive development' : news.sentiment === 'negative' ? 'Area of concern' : 'Neutral impact'
  }

  return {
    thesis: thesisType,
    impact: news.sentiment,
    scoreChange: Number(scoreChange) > 0 ? `+${scoreChange}` : scoreChange,
    reason
  }
}

// Upcoming Events
export interface UpcomingEvent {
  id: string
  stockId: string
  type: 'earnings' | 'agm' | 'dividend' | 'board_meeting' | 'result'
  title: string
  date: string
  description: string
  importance: 'high' | 'medium' | 'low'
}

// Mock upcoming events
const upcomingEvents: UpcomingEvent[] = [
  // Zomato events
  { id: 'zom-ev-1', stockId: 'ZOMATO', type: 'earnings', title: 'Q4 FY25 Results', date: '2025-04-28', description: 'Quarterly earnings announcement', importance: 'high' },
  { id: 'zom-ev-2', stockId: 'ZOMATO', type: 'agm', title: 'Annual General Meeting', date: '2025-07-15', description: 'FY25 AGM', importance: 'medium' },
  { id: 'zom-ev-3', stockId: 'ZOMATO', type: 'board_meeting', title: 'Board Meeting', date: '2025-02-10', description: 'Strategic review meeting', importance: 'low' },

  // Axis Bank events
  { id: 'axis-ev-1', stockId: 'AXISBANK', type: 'earnings', title: 'Q4 FY25 Results', date: '2025-04-25', description: 'Quarterly earnings announcement', importance: 'high' },
  { id: 'axis-ev-2', stockId: 'AXISBANK', type: 'dividend', title: 'Dividend Ex-Date', date: '2025-05-10', description: 'Interim dividend ex-date', importance: 'medium' },
  { id: 'axis-ev-3', stockId: 'AXISBANK', type: 'agm', title: 'Annual General Meeting', date: '2025-07-20', description: 'FY25 AGM', importance: 'medium' },

  // TCS events
  { id: 'tcs-ev-1', stockId: 'TCS', type: 'earnings', title: 'Q4 FY25 Results', date: '2025-04-10', description: 'Quarterly earnings announcement', importance: 'high' },
  { id: 'tcs-ev-2', stockId: 'TCS', type: 'dividend', title: 'Final Dividend Ex-Date', date: '2025-05-25', description: 'Final dividend for FY25', importance: 'high' },
  { id: 'tcs-ev-3', stockId: 'TCS', type: 'agm', title: 'Annual General Meeting', date: '2025-06-15', description: 'FY25 AGM', importance: 'medium' },
  { id: 'tcs-ev-4', stockId: 'TCS', type: 'result', title: 'Q1 FY26 Results', date: '2025-07-10', description: 'Q1 FY26 earnings preview', importance: 'high' },
]

export function getUpcomingEvents(stockId: string): UpcomingEvent[] {
  return upcomingEvents
    .filter(e => e.stockId === stockId.toUpperCase())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Passed'
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `In ${diffDays} days`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function getEventIcon(type: UpcomingEvent['type']): string {
  const icons: Record<UpcomingEvent['type'], string> = {
    earnings: '📊',
    agm: '🏛️',
    dividend: '💰',
    board_meeting: '👥',
    result: '📈'
  }
  return icons[type]
}
