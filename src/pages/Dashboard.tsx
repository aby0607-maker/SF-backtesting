import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, TrendingDown, Bell, BarChart3, Plus, ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getVerdictBadgeClass } from '@/lib/utils'
import { stocks, getAlertsForProfile, getJournalStats, getVerdictForStock } from '@/data'
import { SkeletonStockRow } from '@/components/ui'
import { ScoreRing } from '@/components/charts'
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
    <div className="space-y-8 animate-fade-in">
      {/* Greeting Header */}
      <div className="pt-2">
        <h1 className="text-h1 text-neutral-900">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-body text-neutral-500 mt-2">
          {currentProfile.patterns[0]
            ? currentProfile.patterns[0].description
            : `Personalized analysis based on your ${currentProfile.investmentThesis} investment style`}
        </p>
      </div>

      {/* Watchlist */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4 flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            Your Watchlist
          </h2>
          <button className="btn-ghost text-body-sm">
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
          <div className="space-y-2">
            {watchlist.map((stock, index) => (
              <Link
                key={stock.symbol}
                to={`/stock/${stock.symbol.toLowerCase()}`}
                className="flex items-center gap-4 p-4 -mx-2 rounded-xl hover:bg-neutral-50 transition-all duration-250 group animate-fade-up border border-transparent hover:border-neutral-200"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Mini Score Ring */}
                <div className="flex-shrink-0">
                  <ScoreRing score={stock.score} size="sm" showLabel={false} />
                </div>

                {/* Stock Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-neutral-900">{stock.name}</span>
                    <span className={cn('badge', getVerdictBadgeClass(stock.verdict))}>
                      {stock.verdict}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-body-sm text-neutral-500">{stock.symbol}</span>
                    <span className="text-body-sm font-medium text-neutral-700">
                      {formatCurrency(stock.currentPrice)}
                    </span>
                    <span className={cn(
                      'text-body-sm font-medium flex items-center gap-1',
                      stock.changePercent >= 0 ? 'text-success-600' : 'text-destructive-500'
                    )}>
                      {stock.changePercent >= 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Alerts */}
      <section className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4 flex items-center gap-3">
            <div className="p-2 bg-warning-100 rounded-xl">
              <Bell className="w-5 h-5 text-warning-600" />
            </div>
            Recent Alerts
          </h2>
          <Link to="/alerts" className="btn-ghost text-body-sm">
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 rounded-xl bg-neutral-50 hover:bg-neutral-100 transition-colors animate-fade-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span
                  className={cn(
                    'w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ring-4',
                    alert.severity === 'critical' && 'bg-destructive-500 ring-destructive-100',
                    alert.severity === 'high' && 'bg-warning-500 ring-warning-100',
                    alert.severity === 'medium' && 'bg-warning-400 ring-warning-50',
                    alert.severity === 'low' && 'bg-info-500 ring-info-100'
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-neutral-900">{alert.title}</span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-body-sm text-neutral-500 mt-1 line-clamp-1">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <Bell className="w-6 h-6 text-neutral-400" />
            </div>
            <p className="text-body-sm text-neutral-500">No recent alerts</p>
            <p className="text-caption text-neutral-400 mt-1">Your portfolio is in good shape</p>
          </div>
        )}
      </section>

      {/* Progress Stats */}
      <section className="card">
        <h2 className="text-h4 flex items-center gap-3 mb-6">
          <div className="p-2 bg-success-100 rounded-xl">
            <BarChart3 className="w-5 h-5 text-success-600" />
          </div>
          Your Progress
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-neutral-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="stat-card animate-fade-up">
              <div className="stat-value text-primary-600">{journalStats.totalAnalyses}</div>
              <div className="stat-label">Stocks Analyzed</div>
            </div>
            <div className="stat-card animate-fade-up stagger-1">
              <div className="stat-value text-success-600">{journalStats.wins}</div>
              <div className="stat-label">Winning Picks</div>
            </div>
            <div className="stat-card animate-fade-up stagger-2">
              <div className={cn('stat-value', journalStats.accuracy >= 60 ? 'text-success-600' : 'text-warning-600')}>
                {journalStats.accuracy}%
              </div>
              <div className="stat-label">Accuracy Rate</div>
            </div>
            <div className="stat-card animate-fade-up stagger-3">
              <div className="stat-value text-primary-600">{currentProfile.skillBadge}</div>
              <div className="stat-label">Current Level</div>
            </div>
          </div>
        )}
      </section>

      {/* Quick Actions */}
      <div className="flex gap-4">
        <Link to="/discover" className="btn-primary flex-1 justify-center">
          Discover Stocks
        </Link>
        <Link to="/chat" className="btn-secondary flex-1 justify-center">
          Ask AI Assistant
        </Link>
      </div>
    </div>
  )
}
