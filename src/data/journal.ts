import type { JournalEntry } from '@/types'

// Journal entries showing user's analysis history
// Each profile would have different journal entries based on their investment style
export const journalEntries: Record<string, JournalEntry[]> = {
  // Ankit's journal - Growth-focused, thorough analysis
  ankit: [
    {
      id: 'j-ankit-1',
      date: '2024-01-15',
      stock: {
        symbol: 'ZOMATO',
        name: 'Eternal (Zomato)',
        sector: 'Food Tech',
      },
      scoreAtAnalysis: 8.2,
      verdictAtAnalysis: 'STRONG BUY',
      userVerdict: 'BUY',
      userNotes: 'Strong growth trajectory aligns with my thesis. Blinkit scaling faster than expected. Will add on any 5% dip.',
      priceAtAnalysis: 245,
      currentPrice: 268,
      pnlPercent: 9.4,
      outcomeStatus: 'win',
      segmentsChecked: ['growth-trajectory', 'unit-economics', 'competitive-position', 'management-quality', 'capital-structure'],
      timeSpent: 42,
    },
    {
      id: 'j-ankit-2',
      date: '2024-01-12',
      stock: {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        sector: 'IT Services',
      },
      scoreAtAnalysis: 6.8,
      verdictAtAnalysis: 'HOLD',
      userVerdict: 'WATCHLIST',
      userNotes: 'Solid company but growth is slowing. AI disruption concerns are valid. Will wait for better entry or catalyst.',
      priceAtAnalysis: 4050,
      currentPrice: 4125,
      pnlPercent: 1.9,
      outcomeStatus: 'neutral',
      segmentsChecked: ['growth-trajectory', 'profitability', 'competitive-position', 'risk-factors'],
      timeSpent: 35,
    },
    {
      id: 'j-ankit-3',
      date: '2024-01-08',
      stock: {
        symbol: 'AXISBANK',
        name: 'Axis Bank',
        sector: 'Banking',
      },
      scoreAtAnalysis: 7.5,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'SKIP',
      userNotes: 'Good metrics but not exciting enough for my growth focus. NIM compression concerns me. Will revisit if credit growth accelerates.',
      priceAtAnalysis: 1080,
      currentPrice: 1142,
      pnlPercent: 5.7,
      outcomeStatus: 'neutral',
      segmentsChecked: ['profitability', 'growth-trajectory', 'valuation', 'risk-factors'],
      timeSpent: 28,
    },
    {
      id: 'j-ankit-4',
      date: '2024-01-05',
      stock: {
        symbol: 'PAYTM',
        name: 'One97 Communications',
        sector: 'Fintech',
      },
      scoreAtAnalysis: 4.2,
      verdictAtAnalysis: 'AVOID',
      userVerdict: 'AVOID',
      userNotes: 'Regulatory overhang too severe. Path to profitability unclear. Growth story broken.',
      priceAtAnalysis: 520,
      currentPrice: 380,
      pnlPercent: -26.9,
      outcomeStatus: 'win',
      segmentsChecked: ['growth-trajectory', 'profitability', 'risk-factors', 'management-quality', 'regulatory-environment'],
      timeSpent: 45,
    },
    {
      id: 'j-ankit-5',
      date: '2023-12-28',
      stock: {
        symbol: 'RELIANCE',
        name: 'Reliance Industries',
        sector: 'Conglomerate',
      },
      scoreAtAnalysis: 7.0,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'Jio and Retail momentum strong. New energy business optionality. Core O2C stabilizing.',
      priceAtAnalysis: 2420,
      currentPrice: 2580,
      pnlPercent: 6.6,
      outcomeStatus: 'win',
      segmentsChecked: ['growth-trajectory', 'profitability', 'capital-structure', 'management-quality'],
      timeSpent: 38,
    },
  ],

  // Sneha's journal - Value-focused, skeptical approach
  sneha: [
    {
      id: 'j-sneha-1',
      date: '2024-01-14',
      stock: {
        symbol: 'AXISBANK',
        name: 'Axis Bank',
        sector: 'Banking',
      },
      scoreAtAnalysis: 7.8,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'Fair valuation with improving asset quality. ROE trajectory positive. Good margin of safety at current levels.',
      priceAtAnalysis: 1095,
      currentPrice: 1142,
      pnlPercent: 4.3,
      outcomeStatus: 'win',
      segmentsChecked: ['valuation', 'profitability', 'risk-factors', 'capital-structure', 'shareholder-returns'],
      timeSpent: 52,
    },
    {
      id: 'j-sneha-2',
      date: '2024-01-11',
      stock: {
        symbol: 'ZOMATO',
        name: 'Eternal (Zomato)',
        sector: 'Food Tech',
      },
      scoreAtAnalysis: 4.8,
      verdictAtAnalysis: 'AVOID',
      userVerdict: 'AVOID',
      userNotes: 'Extreme valuation with no earnings. Cash burn still high despite improvements. Will revisit when P/S < 5x.',
      priceAtAnalysis: 258,
      currentPrice: 268,
      pnlPercent: 3.9,
      outcomeStatus: 'loss',
      segmentsChecked: ['valuation', 'profitability', 'capital-structure', 'shareholder-returns', 'risk-factors'],
      timeSpent: 48,
    },
    {
      id: 'j-sneha-3',
      date: '2024-01-09',
      stock: {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        sector: 'IT Services',
      },
      scoreAtAnalysis: 7.2,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'WATCHLIST',
      userNotes: 'Quality company but slightly overvalued at 28x earnings. Will buy below 25x P/E. Dividend yield attractive.',
      priceAtAnalysis: 4080,
      currentPrice: 4125,
      pnlPercent: 1.1,
      outcomeStatus: 'neutral',
      segmentsChecked: ['valuation', 'profitability', 'shareholder-returns', 'competitive-position'],
      timeSpent: 40,
    },
    {
      id: 'j-sneha-4',
      date: '2024-01-04',
      stock: {
        symbol: 'COALINDIA',
        name: 'Coal India Ltd',
        sector: 'Mining',
      },
      scoreAtAnalysis: 7.5,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'Deep value play. 8% dividend yield with potential special dividend. ESG concerns priced in.',
      priceAtAnalysis: 380,
      currentPrice: 425,
      pnlPercent: 11.8,
      outcomeStatus: 'win',
      segmentsChecked: ['valuation', 'shareholder-returns', 'profitability', 'risk-factors'],
      timeSpent: 35,
    },
    {
      id: 'j-sneha-5',
      date: '2023-12-22',
      stock: {
        symbol: 'HDFC',
        name: 'HDFC Bank',
        sector: 'Banking',
      },
      scoreAtAnalysis: 6.8,
      verdictAtAnalysis: 'HOLD',
      userVerdict: 'WATCHLIST',
      userNotes: 'Post-merger integration ongoing. Valuation fair but not cheap. Will wait for clarity on NIM trajectory.',
      priceAtAnalysis: 1650,
      currentPrice: 1720,
      pnlPercent: 4.2,
      outcomeStatus: 'neutral',
      segmentsChecked: ['valuation', 'profitability', 'risk-factors', 'management-quality'],
      timeSpent: 45,
    },
  ],

  // Kavya's journal - Learning-focused, beginner approach
  kavya: [
    {
      id: 'j-kavya-1',
      date: '2024-01-16',
      stock: {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        sector: 'IT Services',
      },
      scoreAtAnalysis: 7.8,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'BUY',
      userNotes: 'First stock purchase! Chose TCS because it is a well-known brand. App explained the metrics clearly.',
      priceAtAnalysis: 4100,
      currentPrice: 4125,
      pnlPercent: 0.6,
      outcomeStatus: 'neutral',
      segmentsChecked: ['profitability', 'valuation'],
      timeSpent: 18,
    },
    {
      id: 'j-kavya-2',
      date: '2024-01-13',
      stock: {
        symbol: 'ZOMATO',
        name: 'Eternal (Zomato)',
        sector: 'Food Tech',
      },
      scoreAtAnalysis: 6.5,
      verdictAtAnalysis: 'HOLD',
      userVerdict: 'WATCHLIST',
      userNotes: 'Use Zomato daily! Interesting to learn about unit economics. Will research more before deciding.',
      priceAtAnalysis: 260,
      currentPrice: 268,
      pnlPercent: 3.1,
      outcomeStatus: 'neutral',
      segmentsChecked: ['growth-trajectory', 'profitability'],
      timeSpent: 15,
    },
    {
      id: 'j-kavya-3',
      date: '2024-01-10',
      stock: {
        symbol: 'AXISBANK',
        name: 'Axis Bank',
        sector: 'Banking',
      },
      scoreAtAnalysis: 7.2,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'SKIP',
      userNotes: 'Banking metrics are confusing. Need to learn more about NPA, NIM before investing in banks.',
      priceAtAnalysis: 1100,
      currentPrice: 1142,
      pnlPercent: 3.8,
      outcomeStatus: 'neutral',
      segmentsChecked: ['profitability'],
      timeSpent: 12,
    },
    {
      id: 'j-kavya-4',
      date: '2024-01-06',
      stock: {
        symbol: 'INFY',
        name: 'Infosys Ltd',
        sector: 'IT Services',
      },
      scoreAtAnalysis: 7.0,
      verdictAtAnalysis: 'BUY',
      userVerdict: 'WATCHLIST',
      userNotes: 'Similar to TCS but slightly lower score. The app explanation helped me understand why.',
      priceAtAnalysis: 1520,
      currentPrice: 1580,
      pnlPercent: 3.9,
      outcomeStatus: 'neutral',
      segmentsChecked: ['profitability', 'growth-trajectory'],
      timeSpent: 14,
    },
  ],
}

// Get journal entries for a specific profile
export function getJournalForProfile(profileId: string): JournalEntry[] {
  return journalEntries[profileId] || []
}

// Calculate journal statistics
export function getJournalStats(profileId: string) {
  const entries = getJournalForProfile(profileId)

  const totalAnalyses = entries.length
  const wins = entries.filter(e => e.outcomeStatus === 'win').length
  const losses = entries.filter(e => e.outcomeStatus === 'loss').length
  const avgTimeSpent = entries.reduce((sum, e) => sum + e.timeSpent, 0) / totalAnalyses || 0
  const avgSegmentsChecked = entries.reduce((sum, e) => sum + e.segmentsChecked.length, 0) / totalAnalyses || 0

  // Calculate accuracy (decisions that aligned with outcome)
  const correctDecisions = entries.filter(e => {
    if (e.outcomeStatus === 'win') {
      return e.userVerdict === 'BUY' || e.userVerdict === 'AVOID'
    }
    if (e.outcomeStatus === 'loss') {
      return e.userVerdict === 'SKIP' || e.userVerdict === 'WATCHLIST'
    }
    return true
  }).length

  const accuracy = totalAnalyses > 0 ? (correctDecisions / totalAnalyses) * 100 : 0

  return {
    totalAnalyses,
    wins,
    losses,
    accuracy: Math.round(accuracy),
    avgTimeSpent: Math.round(avgTimeSpent),
    avgSegmentsChecked: Math.round(avgSegmentsChecked * 10) / 10,
  }
}
