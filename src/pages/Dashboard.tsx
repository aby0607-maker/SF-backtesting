import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Bell, Plus, Search, Flame, Sparkles, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { stocks, getAlertsForProfile, getVerdictForStock } from '@/data'
import { VerdictBadge } from '@/components/ui'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { Stock, Alert, StockVerdict } from '@/types'

// Watchlist item combining stock and verdict data
interface WatchlistItem extends Stock {
  score: number
  verdict: string
  quickInsight?: string
}

// Discovery stock (trending or similar)
interface DiscoveryStock {
  symbol: string
  name: string
  shortName: string
  score: number
  verdict: string
  change: number
  reason: string
}

// Get score color
function getScoreColor(score: number): string {
  if (score >= 8) return 'text-success-400'
  if (score >= 6) return 'text-teal-400'
  if (score >= 4) return 'text-warning-400'
  return 'text-destructive-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 8) return 'bg-success-500'
  if (score >= 6) return 'bg-teal-500'
  if (score >= 4) return 'bg-warning-500'
  return 'bg-destructive-500'
}

// Skeleton component for loading state
function SkeletonStockCard() {
  return (
    <div className="p-4 bg-dark-700/30 rounded-xl border border-white/5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 w-28 bg-dark-600 rounded" />
        <div className="h-6 w-12 bg-dark-600 rounded" />
      </div>
      <div className="h-4 w-20 bg-dark-600 rounded mb-2" />
      <div className="h-3 w-full bg-dark-600 rounded" />
    </div>
  )
}

export function Dashboard() {
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [trendingStocks, setTrendingStocks] = useState<DiscoveryStock[]>([])
  const [similarStocks, setSimilarStocks] = useState<DiscoveryStock[]>([])

  useEffect(() => {
    if (!currentProfile) return

    const timer = setTimeout(() => {
      // Get stocks with their verdicts for this profile
      const watchlistData = stocks.map(stock => {
        const verdict = getVerdictForStock(stock.symbol, currentProfile.id)
        return {
          ...stock,
          score: verdict?.overallScore || 7.0,
          verdict: verdict?.verdict || 'HOLD',
          quickInsight: verdict?.topSignals?.[0]?.title || getDefaultInsight(stock, verdict || null),
        }
      })
      setWatchlist(watchlistData)

      // Get alerts for this profile
      const profileAlerts = getAlertsForProfile(currentProfile.id)
      setAlerts(profileAlerts.slice(0, 3))

      // Mock trending stocks (would come from API)
      setTrendingStocks([
        { symbol: 'SWIGGY', name: 'Swiggy', shortName: 'Swiggy', score: 7.8, verdict: 'BUY', change: 4.2, reason: 'IPO momentum continues' },
        { symbol: 'PAYTM', name: 'One97 Communications', shortName: 'Paytm', score: 6.2, verdict: 'HOLD', change: -1.8, reason: 'Profitability improving' },
        { symbol: 'NYKAA', name: 'FSN E-Commerce', shortName: 'Nykaa', score: 5.8, verdict: 'HOLD', change: 2.1, reason: 'Beauty segment strong' },
      ])

      // Mock similar stocks based on user's watchlist
      setSimilarStocks([
        { symbol: 'DMART', name: 'Avenue Supermarts', shortName: 'DMart', score: 8.1, verdict: 'BUY', change: 1.5, reason: 'Similar to your growth picks' },
        { symbol: 'INFY', name: 'Infosys', shortName: 'Infosys', score: 7.2, verdict: 'BUY', change: 0.8, reason: 'IT sector like TCS' },
      ])

      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [currentProfile])

  if (!currentProfile) return null

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  const firstName = currentProfile.displayName.split(' ')[1] || currentProfile.name
  const unreadAlerts = alerts.filter(a => !a.isRead).length

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {firstName}! 👋
        </h1>
        {currentProfile.patterns[0] && (
          <p className="text-sm text-neutral-400 mt-1">
            {currentProfile.patterns[0].description}
          </p>
        )}
      </motion.div>

      {/* ============== WATCHLIST ============== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-dark-800 border border-white/5 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            Your Watchlist
          </h2>
          <button className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Stock
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <SkeletonStockCard />
            <SkeletonStockCard />
            <SkeletonStockCard />
          </div>
        ) : (
          <StaggerContainer className="space-y-3" staggerDelay={0.05} initialDelay={0.1}>
            {watchlist.map(stock => (
              <StaggerItem key={stock.symbol}>
                <Link
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="block p-4 bg-dark-700/30 rounded-xl border border-white/5 hover:border-white/10 hover:bg-dark-700/50 transition-all group"
                >
                  {/* Top row: Name, Verdict, Score */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{stock.name}</span>
                      <VerdictBadge verdict={stock.verdict} size="sm" animated={false} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xl font-bold', getScoreColor(stock.score))}>
                        {stock.score.toFixed(1)}
                      </span>
                      <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-neutral-400">{formatCurrency(stock.currentPrice)}</span>
                    <span className={cn(
                      'text-sm font-medium',
                      stock.changePercent >= 0 ? 'text-success-400' : 'text-destructive-400'
                    )}>
                      {stock.changePercent >= 0 ? '+' : ''}{formatPercent(stock.changePercent)}
                    </span>
                    {/* Score bar */}
                    <div className="flex-1 h-1 bg-dark-600 rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className={cn('h-full rounded-full', getScoreBgColor(stock.score))}
                        style={{ width: `${(stock.score / 10) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Insight row */}
                  {stock.quickInsight && (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-primary-400 flex-shrink-0" />
                      <span className="text-xs text-neutral-500 truncate">{stock.quickInsight}</span>
                    </div>
                  )}
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </motion.section>

      {/* ============== DISCOVER MORE ============== */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-dark-800 border border-white/5 p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-base font-semibold text-white">
            <Search className="w-4 h-4 text-primary-400" />
            Discover More
          </h2>
          <Link
            to="/discover"
            className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            Explore All
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Trending This Week */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Flame className="w-3.5 h-3.5 text-warning-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Trending This Week</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {isLoading ? (
              <>
                <div className="w-32 h-20 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
                <div className="w-32 h-20 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
                <div className="w-32 h-20 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
              </>
            ) : (
              trendingStocks.map(stock => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex-shrink-0 w-32 p-3 bg-dark-700/50 rounded-xl border border-white/5 hover:border-white/10 hover:bg-dark-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate">{stock.shortName}</span>
                    <span className={cn('text-sm font-bold', getScoreColor(stock.score))}>
                      {stock.score.toFixed(1)}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs',
                    stock.change >= 0 ? 'text-success-400' : 'text-destructive-400'
                  )}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{stock.reason}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Similar to Your Picks */}
        <div>
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Similar to Your Picks</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {isLoading ? (
              <>
                <div className="w-32 h-20 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
                <div className="w-32 h-20 bg-dark-700 rounded-lg animate-pulse flex-shrink-0" />
              </>
            ) : (
              similarStocks.map(stock => (
                <Link
                  key={stock.symbol}
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex-shrink-0 w-32 p-3 bg-dark-700/50 rounded-xl border border-white/5 hover:border-white/10 hover:bg-dark-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-white truncate">{stock.shortName}</span>
                    <span className={cn('text-sm font-bold', getScoreColor(stock.score))}>
                      {stock.score.toFixed(1)}
                    </span>
                  </div>
                  <span className={cn(
                    'text-xs',
                    stock.change >= 0 ? 'text-success-400' : 'text-destructive-400'
                  )}>
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(1)}%
                  </span>
                  <p className="text-[10px] text-neutral-500 mt-1 line-clamp-1">{stock.reason}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.section>

      {/* ============== ALERTS (Compact) ============== */}
      {alerts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-dark-800 border border-white/5 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bell className="w-4 h-4 text-primary-400" />
              Alerts
              {unreadAlerts > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-primary-500 text-white rounded">
                  {unreadAlerts} new
                </span>
              )}
            </h2>
            <Link
              to="/alerts"
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              View All
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {alerts.slice(0, 2).map(alert => (
              <div
                key={alert.id}
                className="flex items-start gap-2 py-2 border-b border-white/5 last:border-0"
              >
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0',
                  alert.severity === 'critical' && 'bg-destructive-500',
                  alert.severity === 'high' && 'bg-warning-500',
                  alert.severity === 'medium' && 'bg-warning-400',
                  alert.severity === 'low' && 'bg-neutral-500'
                )} />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-white">{alert.title}</span>
                  <p className="text-[11px] text-neutral-500 truncate">{alert.message}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
  )
}

// Helper to get default insight based on stock data
function getDefaultInsight(stock: Stock, verdict: StockVerdict | null): string {
  if (verdict?.topSignals?.[0]?.title) {
    return verdict.topSignals[0].title
  }
  if (stock.changePercent > 2) {
    return 'Strong momentum today'
  }
  if (stock.changePercent < -2) {
    return 'Under pressure today'
  }
  return 'Stable performance'
}
