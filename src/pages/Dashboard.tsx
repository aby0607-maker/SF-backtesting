import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, Bell, BarChart3, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { stocks, getAlertsForProfile, getJournalStats, getVerdictForStock } from '@/data'
import { VerdictBadge, AnimatedNumber } from '@/components/ui'
import { Sparkline, generateMockPriceData } from '@/components/charts'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { Stock, Alert } from '@/types'

// Watchlist item combining stock and verdict data
interface WatchlistItem extends Stock {
  score: number
  verdict: string
}

// Skeleton component for loading state
function SkeletonStockRow() {
  return (
    <div className="flex items-center gap-4 p-3 -mx-3">
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-dark-600 rounded shimmer" />
        <div className="h-3 w-24 bg-dark-700 rounded shimmer" />
      </div>
      <div className="w-20 h-8 bg-dark-600 rounded shimmer" />
    </div>
  )
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
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-h2 text-white">
          {getGreeting()}, {firstName}! 👋
        </h1>
        {currentProfile.patterns[0] && (
          <p className="text-body text-gray-400 mt-1">
            {currentProfile.patterns[0].description}
          </p>
        )}
      </motion.div>

      {/* Watchlist */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-h4 text-white">
            <TrendingUp className="w-5 h-5 text-primary-400" />
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
          <StaggerContainer className="space-y-1" staggerDelay={0.08} initialDelay={0.1}>
            {watchlist.map(stock => (
              <StaggerItem key={stock.symbol}>
                <Link
                  to={`/stock/${stock.symbol.toLowerCase()}`}
                  className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-white/5 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-white">{stock.name}</span>
                      <VerdictBadge verdict={stock.verdict} size="sm" animated={false} />
                    </div>
                    <div className="flex items-center gap-3 text-body-sm">
                      <span className="text-gray-400">{formatCurrency(stock.currentPrice)}</span>
                      <span className={stock.changePercent >= 0 ? 'text-success-400' : 'text-destructive-400'}>
                        {formatPercent(stock.changePercent)}
                      </span>
                    </div>
                  </div>

                  {/* Sparkline */}
                  <div className="hidden sm:block mr-4">
                    <Sparkline
                      data={generateMockPriceData(stock.currentPrice, stock.changePercent)}
                      color={stock.changePercent >= 0 ? 'green' : 'red'}
                      width={80}
                      height={32}
                    />
                  </div>

                  <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </motion.section>

      {/* Recent Alerts */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-h4 text-white">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 1.5, repeat: 2 }}
            >
              <Bell className="w-5 h-5 text-primary-400" />
            </motion.div>
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
              <div key={i} className="h-12 bg-dark-600 rounded shimmer" />
            ))}
          </div>
        ) : alerts.length > 0 ? (
          <StaggerContainer className="space-y-1" staggerDelay={0.08} initialDelay={0.2}>
            {alerts.map(alert => (
              <StaggerItem key={alert.id}>
                <div className="flex items-start gap-3 p-3 -mx-3 rounded-lg hover:bg-white/5 transition-colors">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.3 }}
                    className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      alert.severity === 'critical' && 'bg-destructive-500 shadow-[0_0_8px_rgba(246,58,99,0.6)]',
                      alert.severity === 'high' && 'bg-warning-500 shadow-[0_0_8px_rgba(252,98,0,0.5)]',
                      alert.severity === 'medium' && 'bg-warning-400',
                      alert.severity === 'low' && 'bg-info-500'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-body-sm font-medium text-white block">{alert.title}</span>
                    <span className="text-caption text-gray-500 block truncate">
                      {alert.message}
                    </span>
                  </div>
                  {!alert.isRead && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 shadow-glow-purple"
                    />
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <p className="text-body-sm text-gray-500 py-4 text-center">
            No recent alerts
          </p>
        )}
      </motion.section>

      {/* Progress */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="flex items-center gap-2 text-h4 text-white mb-4">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          Your Progress
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-dark-600 rounded-lg shimmer" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Stocks Analyzed', value: journalStats.totalAnalyses },
              { label: 'Winning Picks', value: journalStats.wins },
              { label: 'Accuracy', value: journalStats.accuracy, suffix: '%' },
              { label: 'Current Level', value: currentProfile.skillBadge, isText: true },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center p-4 bg-dark-700/50 rounded-lg border border-white/5"
              >
                <div className="text-h3 text-primary-400 mb-1">
                  {stat.isText ? (
                    stat.value
                  ) : (
                    <AnimatedNumber
                      value={stat.value as number}
                      duration={1200}
                      suffix={stat.suffix}
                    />
                  )}
                </div>
                <div className="text-caption text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
