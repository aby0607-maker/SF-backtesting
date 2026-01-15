import type { DiscoveryStock, Advisor } from '@/types'

// Trending stocks based on analysis activity
export const trendingStocks: DiscoveryStock[] = [
  {
    symbol: 'ZOMATO',
    name: 'Eternal (Zomato)',
    sector: 'Food Tech',
    score: 7.5,
    verdict: 'BUY',
    analysisCount: 12453,
    scoreChange: 0.4,
    matchReason: 'High momentum in quick commerce',
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank',
    sector: 'Banking',
    score: 7.2,
    verdict: 'BUY',
    analysisCount: 8921,
    scoreChange: 0.2,
    matchReason: 'Improving asset quality',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'IT Services',
    score: 7.0,
    verdict: 'HOLD',
    analysisCount: 15234,
    scoreChange: -0.3,
    matchReason: 'Steady dividend payer',
  },
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries',
    sector: 'Conglomerate',
    score: 7.2,
    verdict: 'BUY',
    analysisCount: 18567,
    scoreChange: 0.1,
    matchReason: 'Jio + Retail growth story',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank',
    sector: 'Banking',
    score: 6.8,
    verdict: 'HOLD',
    analysisCount: 21345,
    scoreChange: -0.2,
    matchReason: 'Post-merger integration',
  },
]

// Stocks matching user profile (personalized recommendations)
export const profileMatchedStocks: Record<string, DiscoveryStock[]> = {
  // For Ankit (Growth investor)
  ankit: [
    {
      symbol: 'DMART',
      name: 'Avenue Supermarts',
      sector: 'Retail',
      score: 7.8,
      verdict: 'BUY',
      matchReason: 'Strong unit economics, 25% CAGR growth',
    },
    {
      symbol: 'BHARTIARTL',
      name: 'Bharti Airtel',
      sector: 'Telecom',
      score: 7.5,
      verdict: 'BUY',
      matchReason: 'ARPU expansion + 5G monetization',
    },
    {
      symbol: 'LICI',
      name: 'LIC of India',
      sector: 'Insurance',
      score: 6.5,
      verdict: 'HOLD',
      matchReason: 'Turnaround story, digital transformation',
    },
    {
      symbol: 'TITAN',
      name: 'Titan Company',
      sector: 'Consumer',
      score: 7.6,
      verdict: 'BUY',
      matchReason: 'Premium consumption + jewelry growth',
    },
  ],

  // For Sneha (Value investor)
  sneha: [
    {
      symbol: 'COALINDIA',
      name: 'Coal India',
      sector: 'Mining',
      score: 7.5,
      verdict: 'BUY',
      matchReason: '8% dividend yield, P/E of 6x',
    },
    {
      symbol: 'ONGC',
      name: 'Oil & Natural Gas Corp',
      sector: 'Oil & Gas',
      score: 7.2,
      verdict: 'BUY',
      matchReason: 'Trading below book value, 5% yield',
    },
    {
      symbol: 'ITC',
      name: 'ITC Limited',
      sector: 'FMCG',
      score: 7.4,
      verdict: 'BUY',
      matchReason: 'Hotel + FMCG demerger value unlock',
    },
    {
      symbol: 'NTPC',
      name: 'NTPC Ltd',
      sector: 'Power',
      score: 7.0,
      verdict: 'BUY',
      matchReason: 'Green energy pivot, 4% yield',
    },
  ],

  // For Kavya (Beginner - well-known, lower volatility stocks)
  kavya: [
    {
      symbol: 'HDFCBANK',
      name: 'HDFC Bank',
      sector: 'Banking',
      score: 7.8,
      verdict: 'BUY',
      matchReason: 'India\'s largest private bank, stable',
    },
    {
      symbol: 'INFY',
      name: 'Infosys',
      sector: 'IT Services',
      score: 7.2,
      verdict: 'BUY',
      matchReason: 'Well-known IT company, good for beginners',
    },
    {
      symbol: 'ASIANPAINT',
      name: 'Asian Paints',
      sector: 'Consumer',
      score: 7.0,
      verdict: 'HOLD',
      matchReason: 'Market leader, easy to understand',
    },
    {
      symbol: 'NESTLEIND',
      name: 'Nestle India',
      sector: 'FMCG',
      score: 7.3,
      verdict: 'BUY',
      matchReason: 'Consumer staple, low volatility',
    },
  ],
}

// Sector-wise top picks
export const sectorTopPicks: Record<string, DiscoveryStock[]> = {
  'Banking': [
    { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking', score: 7.8, verdict: 'BUY' },
    { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Banking', score: 7.5, verdict: 'BUY' },
    { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Banking', score: 6.8, verdict: 'HOLD' },
  ],
  'IT Services': [
    { symbol: 'TCS', name: 'TCS', sector: 'IT Services', score: 7.0, verdict: 'HOLD' },
    { symbol: 'INFY', name: 'Infosys', sector: 'IT Services', score: 7.2, verdict: 'BUY' },
    { symbol: 'WIPRO', name: 'Wipro', sector: 'IT Services', score: 6.5, verdict: 'HOLD' },
  ],
  'Consumer': [
    { symbol: 'TITAN', name: 'Titan', sector: 'Consumer', score: 7.6, verdict: 'BUY' },
    { symbol: 'DMART', name: 'DMart', sector: 'Consumer', score: 7.8, verdict: 'BUY' },
    { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer', score: 7.0, verdict: 'HOLD' },
  ],
  'Food Tech': [
    { symbol: 'ZOMATO', name: 'Zomato', sector: 'Food Tech', score: 7.5, verdict: 'BUY' },
    { symbol: 'SWIGGY', name: 'Swiggy', sector: 'Food Tech', score: 6.2, verdict: 'HOLD' },
    { symbol: 'NYKAA', name: 'Nykaa', sector: 'Food Tech', score: 5.8, verdict: 'HOLD' },
  ],
}

// Recently analyzed by community
export const recentlyAnalyzed: DiscoveryStock[] = [
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Auto', score: 7.4, verdict: 'BUY', analysisCount: 234 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Auto', score: 6.8, verdict: 'HOLD', analysisCount: 189 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'NBFC', score: 7.2, verdict: 'BUY', analysisCount: 156 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', sector: 'Pharma', score: 7.0, verdict: 'HOLD', analysisCount: 145 },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Conglomerate', score: 5.5, verdict: 'AVOID', analysisCount: 312 },
]

// Advisors data
export const advisors: Advisor[] = [
  {
    id: 'advisor-1',
    name: 'Rajeev Sharma',
    avatar: '/avatars/advisor1.jpg',
    tier: 'elite',
    specializations: ['Growth Investing', 'Tech Stocks', 'IPO Analysis'],
    yearsExperience: 18,
    aum: '₹850 Cr',
    sebiRegistration: 'INH000001234',
    rating: 4.9,
    reviewCount: 1247,
    successRate: 78,
    consultationFee: 4999,
    bio: 'Former fund manager at HDFC AMC with expertise in identifying multi-bagger growth stocks. Specializes in tech and consumer sectors.',
  },
  {
    id: 'advisor-2',
    name: 'Priya Mehta',
    avatar: '/avatars/advisor2.jpg',
    tier: 'elite',
    specializations: ['Value Investing', 'Banking', 'PSU Stocks'],
    yearsExperience: 15,
    aum: '₹620 Cr',
    sebiRegistration: 'INH000002345',
    rating: 4.8,
    reviewCount: 892,
    successRate: 82,
    consultationFee: 3999,
    bio: 'CFA charterholder with deep expertise in banking sector analysis. Known for identifying undervalued quality businesses.',
  },
  {
    id: 'advisor-3',
    name: 'Amit Patel',
    avatar: '/avatars/advisor3.jpg',
    tier: 'expert',
    specializations: ['Small Caps', 'Manufacturing', 'Export Themes'],
    yearsExperience: 12,
    aum: '₹180 Cr',
    sebiRegistration: 'INH000003456',
    rating: 4.7,
    reviewCount: 534,
    successRate: 71,
    consultationFee: 2499,
    bio: 'Specialist in discovering hidden gems in small and mid-cap space. Focus on manufacturing and China+1 beneficiaries.',
  },
  {
    id: 'advisor-4',
    name: 'Neha Gupta',
    avatar: '/avatars/advisor4.jpg',
    tier: 'expert',
    specializations: ['Dividend Investing', 'Retirement Planning', 'REITs'],
    yearsExperience: 10,
    aum: '₹95 Cr',
    sebiRegistration: 'INH000004567',
    rating: 4.6,
    reviewCount: 423,
    successRate: 75,
    consultationFee: 1999,
    bio: 'Income-focused investment advisor helping retirees and conservative investors build stable dividend portfolios.',
  },
  {
    id: 'advisor-5',
    name: 'Vikram Singh',
    avatar: '/avatars/advisor5.jpg',
    tier: 'emerging',
    specializations: ['New-Age Tech', 'Crypto', 'Global Markets'],
    yearsExperience: 5,
    aum: '₹25 Cr',
    sebiRegistration: 'INH000005678',
    rating: 4.4,
    reviewCount: 187,
    successRate: 68,
    consultationFee: 999,
    bio: 'Young advisor specializing in new-age tech stocks and emerging investment themes. Active on social media with 50K+ followers.',
  },
]

// Get stocks matched to profile
export function getMatchedStocks(profileId: string): DiscoveryStock[] {
  return profileMatchedStocks[profileId] || trendingStocks
}

// Get advisor by tier
export function getAdvisorsByTier(tier?: string): Advisor[] {
  if (!tier) return advisors
  return advisors.filter(a => a.tier === tier)
}
