import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, TrendingUp, TrendingDown, Sparkles, Newspaper, ExternalLink, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { getNewsForStock, type NewsItem } from '@/data/news'
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
  const [news, setNews] = useState<NewsItem[]>([])

  useEffect(() => {
    if (!ticker || !currentProfile) return

    setIsLoading(true)

    // Simulate loading for realistic UX
    const timer = setTimeout(() => {
      const stockData = getStockBySymbol(ticker)
      const verdictData = getVerdictForStock(ticker, currentProfile.id)
      const newsData = getNewsForStock(ticker)

      setStock(stockData || null)
      setVerdict(verdictData || null)
      setNews(newsData.slice(0, 5)) // Top 5 news items
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
        <h2 className="text-h4 mb-2 text-white">11-Segment Analysis</h2>

        {/* Explainer Card - Score & Rank Context */}
        <div className="mb-4 p-3 bg-dark-700/50 rounded-lg border border-white/5">
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Score:</span>
              <span className="text-white font-medium">X.X/10</span>
              <span className="text-neutral-500">= How well this dimension performs</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500">Rank:</span>
              <span className="px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-[10px] font-medium">#X/Y</span>
              <span className="text-neutral-500">= Position vs {stock.peerGroup?.length ? `${stock.peerGroup.length} peers` : 'sector peers'}</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5 flex flex-wrap gap-4 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-success-500" /> Strong (8+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-teal-400" /> Good (6-8)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-warning-400" /> Fair (4-6)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-destructive-500" /> Weak (&lt;4)
            </span>
          </div>
        </div>

        <SegmentBar
          segments={verdict.segments}
          onSegmentClick={(segmentId) => {
            window.location.href = `/segment/${ticker}/${segmentId}`
          }}
          showRanks={true}
          showInsights={true}
        />

        {/* Profile Weight Note */}
        <div className="mt-4 pt-3 border-t border-white/10 text-xs text-neutral-500">
          <span className="text-primary-400">{currentProfile.displayName}</span> weights prioritize {
            currentProfile.investmentThesis === 'growth' ? 'Growth & Profitability segments' :
            currentProfile.investmentThesis === 'value' ? 'Valuation & Financial Health segments' :
            currentProfile.investmentThesis === 'dividend' ? 'Income & Valuation segments' :
            'balanced analysis across all segments'
          }. Click any segment to explore metrics.
        </div>
      </motion.div>

      {/* News & Signals Section */}
      {news.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="card"
        >
          <h2 className="text-h4 mb-4 text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary-400" />
            News & Signals
          </h2>
          <div className="space-y-3">
            {news.map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-3 rounded-lg border-l-4 bg-dark-700/50',
                  item.sentiment === 'positive' && 'border-l-success-500',
                  item.sentiment === 'negative' && 'border-l-destructive-500',
                  item.sentiment === 'neutral' && 'border-l-neutral-500'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {item.sentiment === 'positive' && <TrendingUp className="w-4 h-4 text-success-500" />}
                      {item.sentiment === 'negative' && <TrendingDown className="w-4 h-4 text-destructive-500" />}
                      <h4 className="text-white font-medium text-sm">{item.headline}</h4>
                    </div>
                    <p className="text-neutral-400 text-xs mb-2">{item.summary}</p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-neutral-500 text-xs">{item.source} • {item.timestamp}</span>
                      <span className="text-neutral-600">|</span>
                      <span className="text-xs text-neutral-500">Affects:</span>
                      {item.impactSegments.slice(0, 3).map((segment, i) => (
                        <Link
                          key={i}
                          to={`/segment/${ticker}/${segment.toLowerCase().replace(/\s+/g, '-')}`}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-primary-500/20 text-primary-400 rounded text-xs hover:bg-primary-500/30 transition-colors"
                        >
                          {segment}
                          <ChevronRight className="w-2.5 h-2.5" />
                        </Link>
                      ))}
                    </div>
                  </div>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-500 hover:text-primary-400 transition-colors p-1"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-white/10">
            <Link
              to="/chat"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
            >
              Ask AI about news impact on {stock.symbol}
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Entry Assessment & Position Guidance - Premium styling */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card border border-primary-500/20 bg-gradient-to-br from-primary-500/5 to-transparent"
      >
        {/* Entry Assessment Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-h4 text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-400" />
            Entry Assessment
          </h2>
          {/* Entry Verdict Badge */}
          <span className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-bold uppercase tracking-wide',
            verdict.verdict === 'STRONG BUY' || verdict.verdict === 'BUY'
              ? 'bg-success-500/20 text-success-400 border border-success-500/30'
              : verdict.verdict === 'HOLD' || verdict.verdict === 'STRONG HOLD'
                ? 'bg-warning-500/20 text-warning-400 border border-warning-500/30'
                : 'bg-destructive-500/20 text-destructive-400 border border-destructive-500/30'
          )}>
            {verdict.verdict === 'STRONG BUY' || verdict.verdict === 'BUY' ? 'FAVORABLE' :
             verdict.verdict === 'HOLD' || verdict.verdict === 'STRONG HOLD' ? 'NEUTRAL' : 'WAIT'}
          </span>
        </div>

        {/* Profile Context */}
        <p className="text-sm text-neutral-400 mb-4">
          For your <span className="text-primary-400 font-medium">{currentProfile.investmentThesis.toUpperCase()}</span> profile:
        </p>

        {/* Entry Factor Assessment */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Valuation Entry (35%) */}
          <div className="p-3 bg-dark-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Valuation (35%)</span>
              <span className="text-success-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-white">
              {verdict.entryTiming?.positionInRange || 'Fair value zone'}
            </p>
          </div>

          {/* Technical Entry (25%) */}
          <div className="p-3 bg-dark-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Technical (25%)</span>
              <span className="text-success-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-white">Above 200 DMA</p>
          </div>

          {/* Momentum Entry (20%) */}
          <div className="p-3 bg-dark-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Momentum (20%)</span>
              <span className="text-warning-400 text-xs">~</span>
            </div>
            <p className="text-sm text-white">Mixed FII activity</p>
          </div>

          {/* Fundamental Entry (20%) */}
          <div className="p-3 bg-dark-700/50 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Fundamental (20%)</span>
              <span className="text-success-400 text-xs">✓</span>
            </div>
            <p className="text-sm text-white">Recent results positive</p>
          </div>
        </div>

        {/* Position Sizing */}
        <div className="pt-4 border-t border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white">Position Guidance</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500 block text-xs mb-1">Suggested Allocation</span>
              <span className="text-white font-medium">
                {typeof verdict.positionSizing === 'string'
                  ? verdict.positionSizing
                  : verdict.positionSizing.recommendedAllocation}
              </span>
            </div>
            {verdict.entryTiming?.fairValueRange && (
              <div>
                <span className="text-neutral-500 block text-xs mb-1">Fair Value Range</span>
                <span className="text-white font-medium">{verdict.entryTiming.fairValueRange}</span>
              </div>
            )}
          </div>

          {typeof verdict.positionSizing === 'object' && verdict.positionSizing.entryStrategy && (
            <div className="p-3 bg-primary-500/10 rounded-lg">
              <span className="text-xs text-primary-400 block mb-1">Entry Approach</span>
              <span className="text-sm text-white">{verdict.positionSizing.entryStrategy}</span>
            </div>
          )}

          {typeof verdict.positionSizing === 'object' && verdict.positionSizing.warning && (
            <div className="p-3 bg-warning-500/10 rounded-lg border border-warning-500/20">
              <span className="text-xs text-warning-400 block mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Warning
              </span>
              <span className="text-sm text-warning-300">{verdict.positionSizing.warning}</span>
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
