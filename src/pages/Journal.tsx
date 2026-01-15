import { BookOpen, TrendingUp, TrendingDown, Eye, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatDate, formatPercent, getVerdictBadgeClass } from '@/lib/utils'

// Placeholder data - will be replaced with full mock data
const journalEntries = [
  {
    id: '1',
    date: '2025-01-10',
    stock: { symbol: 'ZOMATO', name: 'Eternal (Zomato)', sector: 'Food Tech' },
    scoreAtAnalysis: 8.2,
    verdictAtAnalysis: 'STRONG BUY',
    userVerdict: 'BUY',
    priceAtAnalysis: 252,
    currentPrice: 268,
    pnlPercent: 6.35,
    outcomeStatus: 'win',
    timeSpent: 12,
  },
  {
    id: '2',
    date: '2025-01-05',
    stock: { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking' },
    scoreAtAnalysis: 7.8,
    verdictAtAnalysis: 'BUY',
    userVerdict: 'WATCHLIST',
    priceAtAnalysis: 1120,
    currentPrice: 1145,
    pnlPercent: 2.23,
    outcomeStatus: 'pending',
    timeSpent: 8,
  },
  {
    id: '3',
    date: '2024-12-20',
    stock: { symbol: 'PAYTM', name: 'One 97 Communications', sector: 'Fintech' },
    scoreAtAnalysis: 4.5,
    verdictAtAnalysis: 'AVOID',
    userVerdict: 'SKIP',
    priceAtAnalysis: 850,
    currentPrice: 780,
    pnlPercent: -8.24,
    outcomeStatus: 'neutral',
    timeSpent: 15,
  },
]

export function Journal() {
  const { currentProfile } = useAppStore()

  if (!currentProfile) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <BookOpen className="w-7 h-7 text-primary-600" />
          Analysis Journal
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Track your research journey and learn from outcomes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-h3 text-primary-600">12</div>
          <div className="text-caption text-content-secondary">Total Analyses</div>
        </div>
        <div className="card text-center">
          <div className="text-h3 text-verdict-buy">67%</div>
          <div className="text-caption text-content-secondary">Win Rate</div>
        </div>
        <div className="card text-center">
          <div className="text-h3">11m</div>
          <div className="text-caption text-content-secondary">Avg. Time</div>
        </div>
        <div className="card text-center">
          <div className="text-h3">{currentProfile.skillBadge}</div>
          <div className="text-caption text-content-secondary">Level</div>
        </div>
      </div>

      {/* Patterns & Blind Spots */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Patterns */}
        <div className="card">
          <h2 className="text-h4 flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-verdict-buy" />
            Your Patterns
          </h2>
          {currentProfile.patterns.map(pattern => (
            <div key={pattern.id} className="p-3 bg-verdict-buy/5 rounded-lg mb-2">
              <div className="font-medium text-verdict-buy">{pattern.title}</div>
              <div className="text-body-sm text-content-secondary">{pattern.description}</div>
            </div>
          ))}
        </div>

        {/* Blind Spots */}
        <div className="card">
          <h2 className="text-h4 flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-alert-medium" />
            Blind Spots
          </h2>
          {currentProfile.blindSpots.map(spot => (
            <div key={spot.id} className="p-3 bg-alert-medium/5 rounded-lg mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-alert-high">{spot.segment}</span>
                <span className="text-body-sm text-content-secondary">Checked {spot.checkRate}%</span>
              </div>
              <div className="text-body-sm text-content-secondary">{spot.suggestion}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Journal Entries */}
      <div className="card">
        <h2 className="text-h4 mb-4">Recent Entries</h2>
        <div className="space-y-3">
          {journalEntries.map(entry => (
            <div
              key={entry.id}
              className="p-4 bg-surface-secondary rounded-lg hover:bg-surface-tertiary transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium">{entry.stock.name}</div>
                  <div className="text-body-sm text-content-secondary">
                    {entry.stock.sector} • {formatDate(entry.date)}
                  </div>
                </div>
                <span className={cn('badge', getVerdictBadgeClass(entry.verdictAtAnalysis))}>
                  {entry.scoreAtAnalysis}/10
                </span>
              </div>

              <div className="flex items-center gap-4 text-body-sm">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-content-tertiary" />
                  <span>Your call: {entry.userVerdict}</span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.pnlPercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-verdict-buy" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-verdict-avoid" />
                  )}
                  <span className={entry.pnlPercent >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid'}>
                    {formatPercent(entry.pnlPercent)}
                  </span>
                </div>
                <div className="text-content-tertiary">{entry.timeSpent}m spent</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
