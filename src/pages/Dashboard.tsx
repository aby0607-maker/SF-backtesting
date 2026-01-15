import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Bell, BarChart3, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getVerdictBadgeClass } from '@/lib/utils'

// Temporary mock data - will be replaced with full mock data
const watchlistStocks = [
  { symbol: 'ZOMATO', name: 'Eternal (Zomato)', score: 8.2, verdict: 'STRONG BUY', price: 268, change: 2.3 },
  { symbol: 'AXISBANK', name: 'Axis Bank', score: 7.8, verdict: 'BUY', price: 1145, change: 0.8 },
  { symbol: 'TCS', name: 'TCS', score: 8.5, verdict: 'HOLD', price: 3650, change: -0.2 },
]

const recentAlerts = [
  { id: '1', type: 'score', message: 'Score Drop: Axis Bank 8.5 → 8.2', severity: 'high' },
  { id: '2', type: 'news', message: 'News: Zomato Q3 results released', severity: 'medium' },
  { id: '3', type: 'earnings', message: 'Upcoming: TCS earnings Jan 20', severity: 'low' },
]

export function Dashboard() {
  const { currentProfile } = useAppStore()

  if (!currentProfile) return null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-h2">
          Good Morning, {currentProfile.displayName.split(' ')[1]}! 👋
        </h1>
        {currentProfile.patterns[0] && (
          <p className="text-body text-content-secondary mt-1">
            Pattern: {currentProfile.patterns[0].description}
          </p>
        )}
      </div>

      {/* Watchlist */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Your Watchlist
          </h2>
          <button className="btn-ghost text-body-sm flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>

        <div className="space-y-3">
          {watchlistStocks.map(stock => (
            <Link
              key={stock.symbol}
              to={`/stock/${stock.symbol.toLowerCase()}`}
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stock.name}</span>
                  <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                    {stock.score}/10 {stock.verdict}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-body-sm text-content-secondary">
                  <span>{formatCurrency(stock.price)}</span>
                  <span className={stock.change >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid'}>
                    {formatPercent(stock.change)}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Alerts */}
      <section className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            Recent Alerts
          </h2>
          <Link to="/alerts" className="btn-ghost text-body-sm flex items-center gap-1">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="space-y-2">
          {recentAlerts.map(alert => (
            <div
              key={alert.id}
              className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors"
            >
              <span
                className={cn(
                  'w-2 h-2 rounded-full mt-2',
                  alert.severity === 'high' && 'bg-alert-high',
                  alert.severity === 'medium' && 'bg-alert-medium',
                  alert.severity === 'low' && 'bg-alert-low'
                )}
              />
              <span className="text-body-sm">{alert.message}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Progress */}
      <section className="card">
        <h2 className="text-h4 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Your Progress
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-surface-secondary rounded-lg">
            <div className="text-h3 text-primary-600">12</div>
            <div className="text-caption text-content-secondary">Stocks Analyzed</div>
          </div>
          <div className="text-center p-3 bg-surface-secondary rounded-lg">
            <div className="text-h3 text-primary-600">8</div>
            <div className="text-caption text-content-secondary">Journal Entries</div>
          </div>
          <div className="text-center p-3 bg-surface-secondary rounded-lg">
            <div className="text-h3 text-primary-600">{currentProfile.skillBadge}</div>
            <div className="text-caption text-content-secondary">Current Level</div>
          </div>
          <div className="text-center p-3 bg-surface-secondary rounded-lg">
            <div className="text-h3 text-primary-600">Analyst</div>
            <div className="text-caption text-content-secondary">Next Level</div>
          </div>
        </div>
      </section>
    </div>
  )
}
