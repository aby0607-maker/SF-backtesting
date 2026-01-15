import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { ScoreGauge, VerdictBadge } from '@/components/ui'
import { SegmentBar } from '@/components/charts'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { Stock, StockVerdict } from '@/types'

// Skeleton components for loading state
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('bg-dark-600 rounded shimmer', className)} />
}

export function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>()
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stock, setStock] = useState<Stock | null>(null)
  const [verdict, setVerdict] = useState<StockVerdict | null>(null)

  useEffect(() => {
    if (!ticker || !currentProfile) return

    setIsLoading(true)

    // Simulate loading for realistic UX
    const timer = setTimeout(() => {
      const stockData = getStockBySymbol(ticker)
      const verdictData = getVerdictForStock(ticker, currentProfile.id)

      setStock(stockData || null)
      setVerdict(verdictData || null)
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [ticker, currentProfile])

  if (!ticker || !currentProfile) return null

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <SkeletonBlock className="w-48 h-8" />
              <SkeletonBlock className="w-32 h-4" />
            </div>
          </div>
          <SkeletonBlock className="w-24 h-10 mb-6" />
          <div className="p-6 bg-dark-700/50 rounded-card flex justify-center">
            <SkeletonBlock className="w-32 h-32 rounded-full" />
          </div>
        </div>

        <div className="card">
          <SkeletonBlock className="w-32 h-6 mb-4" />
          {[1, 2, 3].map(i => (
            <SkeletonBlock key={i} className="w-full h-16 mb-2" />
          ))}
        </div>
      </div>
    )
  }

  // Stock not found
  if (!stock || !verdict) {
    return (
      <div className="space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="card text-center py-12">
          <h2 className="text-h3 text-white mb-2">Stock Not Found</h2>
          <p className="text-gray-400">
            We couldn't find analysis for "{ticker.toUpperCase()}"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Stock Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2 text-white">{stock.name}</h1>
            <p className="text-body text-gray-400">
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
          <span className="text-h1 text-white">{formatCurrency(stock.currentPrice)}</span>
          <span className={cn(
            'text-body-lg font-medium flex items-center gap-1',
            stock.changePercent >= 0 ? 'text-success-400' : 'text-destructive-400'
          )}>
            {stock.changePercent >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {formatPercent(stock.changePercent)}
          </span>
        </div>

        {/* Verdict Hero - Premium styling */}
        <div className="p-6 bg-dark-700/50 rounded-card border border-white/5">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Animated Score Gauge */}
            <ScoreGauge score={verdict.overallScore} size="lg" />

            {/* Verdict info */}
            <div className="flex-1 text-center sm:text-left">
              <VerdictBadge verdict={verdict.verdict} size="lg" />

              <div className="mt-4 flex items-center justify-center sm:justify-start gap-4">
                <div>
                  <div className="text-h4 text-white">#{verdict.peerRank} of {verdict.peerTotal}</div>
                  <div className="text-body-sm text-gray-500">
                    in {verdict.peerCategory || verdict.peerGroup || 'Peer Group'}
                  </div>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-body text-gray-400 mt-4"
              >
                {verdict.verdictRationale}
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Red Flags - High visibility warning */}
      {verdict.redFlags && verdict.redFlags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card border border-destructive-500/30 bg-destructive-500/5"
        >
          <h2 className="text-h4 flex items-center gap-2 text-destructive-400 mb-3">
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5, repeat: 3 }}
            >
              <AlertTriangle className="w-5 h-5" />
            </motion.div>
            Red Flags ({verdict.redFlags.length})
          </h2>
          <StaggerContainer className="space-y-3" staggerDelay={0.1}>
            {verdict.redFlags.map((flag) => (
              <StaggerItem key={flag.id}>
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'px-2 py-0.5 text-caption font-semibold rounded',
                      flag.severity === 'critical' && 'bg-destructive-500 text-white shadow-glow-red',
                      flag.severity === 'high' && 'bg-warning-500 text-white',
                      flag.severity === 'medium' && 'bg-warning-500/20 text-warning-400'
                    )}
                  >
                    {flag.severity.toUpperCase()}
                  </span>
                  <div>
                    <span className="font-medium text-white">{flag.title}</span>
                    <span className="text-gray-400"> - {flag.description}</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>
      )}

      {/* Top Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <h2 className="text-h4 mb-4 text-success-400 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Signals
        </h2>
        <StaggerContainer className="space-y-3" staggerDelay={0.1}>
          {verdict.topSignals.map((signal, i) => (
            <StaggerItem key={i}>
              <div className="flex items-start gap-3 p-4 bg-success-500/5 border border-success-500/20 rounded-lg">
                <span className="w-8 h-8 rounded-full bg-success-500/20 text-success-400 font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="font-medium text-white">{signal.title}</div>
                  <div className="text-body-sm text-gray-400">{signal.description}</div>
                  {signal.metric && signal.value && (
                    <div className="text-caption text-primary-400 mt-1">
                      {signal.metric}: {signal.value}
                      {signal.benchmark && ` (vs ${signal.benchmark})`}
                    </div>
                  )}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </motion.div>

      {/* Top Concerns */}
      {verdict.topConcerns && verdict.topConcerns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h2 className="text-h4 mb-4 text-warning-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Key Concerns
          </h2>
          <StaggerContainer className="space-y-3" staggerDelay={0.1}>
            {verdict.topConcerns.map((concern, i) => (
              <StaggerItem key={i}>
                <div className="flex items-start gap-3 p-4 bg-warning-500/5 border border-warning-500/20 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-warning-500/20 text-warning-400 font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-white">{concern.title}</div>
                    <div className="text-body-sm text-gray-400">{concern.description}</div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>
      )}

      {/* 11 Segments - Using SegmentBar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h2 className="text-h4 mb-4 text-white">11-Segment Analysis</h2>
        <SegmentBar
          segments={verdict.segments}
          onSegmentClick={(segmentId) => {
            window.location.href = `/segment/${ticker}/${segmentId}`
          }}
        />
      </motion.div>

      {/* Position Guidance - Premium styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card border border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-transparent"
      >
        <h2 className="text-h4 mb-3 text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary-400" />
          Position Guidance
        </h2>
        <div className="space-y-3 text-body">
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-28 flex-shrink-0">Position Size:</span>
            <span className="text-gray-300">
              {typeof verdict.positionSizing === 'string'
                ? verdict.positionSizing
                : verdict.positionSizing.recommendedAllocation}
            </span>
          </div>
          {typeof verdict.positionSizing === 'object' && verdict.positionSizing.reasoning && (
            <div className="flex items-start gap-2">
              <span className="text-gray-500 w-28 flex-shrink-0">Reasoning:</span>
              <span className="text-gray-300">{verdict.positionSizing.reasoning}</span>
            </div>
          )}
          <div className="flex items-start gap-2">
            <span className="text-gray-500 w-28 flex-shrink-0">Entry Strategy:</span>
            <span className="text-gray-300">{verdict.entryGuidance}</span>
          </div>
          {typeof verdict.positionSizing === 'object' && verdict.positionSizing.warning && (
            <div className="flex items-start gap-2 text-warning-400">
              <span className="w-28 flex-shrink-0">Warning:</span>
              <span>{verdict.positionSizing.warning}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="flex gap-3"
      >
        <button className="btn-primary flex-1">Add to Watchlist</button>
        <Link to="/chat" className="btn-secondary flex-1 text-center">
          Ask AI about {stock.symbol}
        </Link>
      </motion.div>
    </div>
  )
}
