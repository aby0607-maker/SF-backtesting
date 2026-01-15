import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Bell, BarChart3, Plus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getVerdictBadgeClass } from '@/lib/utils'
import { stocks, getAlertsForProfile, getJournalStats, getVerdictForStock } from '@/data'
import { SkeletonStockRow } from '@/components/ui'
import type { Stock, Alert } from '@/types'

// Watchlist item combining stock and verdict data
interface WatchlistItem extends Stock {
  score: number
  verdict: string
}

export function Dashboard() {
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [journalStats, setJournalStats] = useState({ totalAnalyses: 0, wins: 0, accuracy: 0 })

  useEffect(() => {
    if (!currentProfile) return

    // Simulate loading for realistic UX
    const timer = setTimeout(() => {
      // Get stocks with their verdicts for this profile
      const watchlistData = stocks.map(stock => {
        const verdict = getVerdictForStock(stock.symbol, currentProfile.id)
        return {
          ...stock,
          score: verdict?.overallScore || 7.0,
          verdict: verdict?.verdict || 'HOLD',
        }
      })
      setWatchlist(watchlistData)

      // Get alerts for this profile
      const profileAlerts = getAlertsForProfile(currentProfile.id)
      setAlerts(profileAlerts.slice(0, 3)) // Show top 3

      // Get journal stats
      const stats = getJournalStats(currentProfile.id)
      setJournalStats(stats)

      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [currentProfile])

  if (!currentProfile) return null

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const firstName = currentProfile.displayName.split(' ')[1] || currentProfile.name

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <h1 className="text-h2">
          {getGreeting()}, {firstName}!
        </h1>
        {currentProfile.patterns[0] && (
          <p className="text-body text-content-secondary mt-1">
            {currentProfile.patterns[0].description}
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

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonStockRow />
            <SkeletonStockRow />
            <SkeletonStockRow />
          </div>
        ) : (
          <div className="space-y-3">
            {watchlist.map((stock, index) => (
              <Link
                key={stock.symbol}
                to={`/stock/${stock.symbol.toLowerCase()}`}
                className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{stock.name}</span>
                    <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                      {stock.score}/10 {stock.verdict}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-body-sm text-content-secondary">
                    <span>{formatCurrency(stock.currentPrice)}</span>
                    <span className={stock.changePercent >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid'}>
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
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

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-neutral-100 rounded animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                    alert.severity === 'critical' && 'bg-alert-critical',
                    alert.severity === 'high' && 'bg-alert-high',
                    alert.severity === 'medium' && 'bg-alert-medium',
                    alert.severity === 'low' && 'bg-alert-low'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-body-sm font-medium block">{alert.title}</span>
                  <span className="text-caption text-content-secondary block truncate">
                    {alert.message}
                  </span>
                </div>
                {!alert.isRead && (
                  <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-body-sm text-content-secondary py-4 text-center">
            No recent alerts
          </p>
        )}
      </section>

      {/* Progress */}
      <section className="card">
        <h2 className="text-h4 flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          Your Progress
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-neutral-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-surface-secondary rounded-lg animate-fade-in">
              <div className="text-h3 text-primary-600">{journalStats.totalAnalyses}</div>
              <div className="text-caption text-content-secondary">Stocks Analyzed</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-lg animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="text-h3 text-primary-600">{journalStats.wins}</div>
              <div className="text-caption text-content-secondary">Winning Picks</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-lg animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="text-h3 text-primary-600">{journalStats.accuracy}%</div>
              <div className="text-caption text-content-secondary">Accuracy</div>
            </div>
            <div className="text-center p-3 bg-surface-secondary rounded-lg animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="text-h3 text-primary-600">{currentProfile.skillBadge}</div>
              <div className="text-caption text-content-secondary">Current Level</div>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
