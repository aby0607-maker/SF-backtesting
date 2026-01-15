import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, ChevronRight, ExternalLink } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getScoreColor, getVerdictBadgeClass } from '@/lib/utils'

// Placeholder - will be replaced with full mock data
const getStockData = (ticker: string, profileId: string) => ({
  symbol: ticker.toUpperCase(),
  name: ticker === 'zomato' ? 'Eternal (Zomato)' : ticker === 'axisbank' ? 'Axis Bank' : 'TCS',
  sector: ticker === 'zomato' ? 'Food Tech' : ticker === 'axisbank' ? 'Banking' : 'IT Services',
  price: ticker === 'zomato' ? 268 : ticker === 'axisbank' ? 1145 : 3650,
  change: ticker === 'zomato' ? 2.3 : ticker === 'axisbank' ? 0.8 : -0.2,
  score: profileId === 'ankit' ? 8.2 : profileId === 'sneha' ? 4.8 : 6.5,
  verdict: profileId === 'ankit' ? 'STRONG BUY' : profileId === 'sneha' ? 'AVOID' : 'HOLD',
  peerRank: profileId === 'ankit' ? 1 : profileId === 'sneha' ? 5 : 2,
  peerTotal: 6,
  topSignals: [
    { title: 'Revenue Growth 70%+ YoY', description: 'Blinkit driving hypergrowth' },
    { title: 'Path to Profitability', description: 'First profitable quarter achieved' },
    { title: 'Market Leadership', description: '#1 in food delivery & quick commerce' },
  ],
  segments: [
    { id: 'profitability', name: 'Profitability', score: 7.2, status: 'positive' },
    { id: 'financials', name: 'Financial Ratios', score: 8.1, status: 'positive' },
    { id: 'growth', name: 'Growth', score: 9.2, status: 'positive' },
    { id: 'valuation', name: 'Valuation', score: 5.5, status: 'negative' },
    { id: 'price', name: 'Price & Volume', score: 7.8, status: 'positive' },
    { id: 'technical', name: 'Technical', score: 6.5, status: 'neutral' },
    { id: 'broker', name: 'Broker Ratings', score: 8.0, status: 'positive' },
    { id: 'ownership', name: 'Ownership', score: 7.5, status: 'positive' },
    { id: 'fno', name: 'Futures & Options', score: 6.8, status: 'neutral' },
    { id: 'income', name: 'Income Statement', score: 7.0, status: 'positive' },
    { id: 'balance', name: 'Balance Sheet', score: 8.5, status: 'positive' },
  ],
  redFlags: ticker === 'zomato' ? [
    { severity: 'medium', title: 'High Valuation', description: 'P/S ratio 12x vs sector avg 6x' },
  ] : [],
})

export function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>()
  const { currentProfile } = useAppStore()

  if (!ticker || !currentProfile) return null

  const stock = getStockData(ticker, currentProfile.id)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-body-sm text-content-secondary hover:text-content transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Stock Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2">{stock.name}</h1>
            <p className="text-body text-content-secondary">
              {stock.sector} • {stock.symbol}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-ghost p-2" aria-label="Share">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="btn-ghost p-2" aria-label="Save">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-h1">{formatCurrency(stock.price)}</span>
          <span className={cn('text-body-lg font-medium', stock.change >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid')}>
            {formatPercent(stock.change)}
          </span>
        </div>

        {/* Verdict Hero */}
        <div className="p-6 bg-surface-secondary rounded-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className={cn('text-display', getScoreColor(stock.score))}>{stock.score}</span>
                <span className="text-h3 text-content-secondary">/10</span>
              </div>
              <span className={cn('badge text-body', getVerdictBadgeClass(stock.verdict))}>
                {stock.verdict}
              </span>
            </div>
            <div className="text-right">
              <div className="text-h4">#{stock.peerRank} of {stock.peerTotal}</div>
              <div className="text-body-sm text-content-secondary">in New Economy</div>
            </div>
          </div>

          <p className="text-body text-content-secondary">
            Based on your <strong>{currentProfile.investmentThesis}</strong> investment style,{' '}
            <strong>{currentProfile.riskTolerance}</strong> risk tolerance, and{' '}
            <strong>{currentProfile.timeHorizon === 'very-long' ? '5+ year' : '3-5 year'}</strong> horizon.
          </p>
        </div>
      </div>

      {/* Red Flags */}
      {stock.redFlags.length > 0 && (
        <div className="card border-2 border-alert-medium bg-amber-50">
          <h2 className="text-h4 flex items-center gap-2 text-alert-high mb-3">
            <AlertTriangle className="w-5 h-5" />
            Red Flags ({stock.redFlags.length})
          </h2>
          <div className="space-y-2">
            {stock.redFlags.map((flag, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-alert-medium">⚠️</span>
                <div>
                  <span className="font-medium">{flag.title}</span>
                  <span className="text-content-secondary"> - {flag.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Signals */}
      <div className="card">
        <h2 className="text-h4 mb-4">Top 3 Signals</h2>
        <div className="space-y-3">
          {stock.topSignals.map((signal, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-verdict-buy/5 rounded-lg">
              <span className="text-verdict-buy font-bold">{i + 1}</span>
              <div>
                <div className="font-medium">{signal.title}</div>
                <div className="text-body-sm text-content-secondary">{signal.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 11 Segments */}
      <div className="card">
        <h2 className="text-h4 mb-4">11-Segment Analysis</h2>
        <div className="space-y-2">
          {stock.segments.map(segment => (
            <Link
              key={segment.id}
              to={`/segment/${ticker}/${segment.id}`}
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group"
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    segment.status === 'positive' && 'bg-segment-positive',
                    segment.status === 'neutral' && 'bg-segment-neutral',
                    segment.status === 'negative' && 'bg-segment-negative'
                  )}
                />
                <span className="font-medium">{segment.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('font-medium', getScoreColor(segment.score))}>
                  {segment.score}/10
                </span>
                <ChevronRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button className="btn-primary flex-1">Add to Watchlist</button>
        <Link to="/chat" className="btn-secondary flex-1 text-center">
          Ask AI about {stock.symbol}
        </Link>
      </div>
    </div>
  )
}
