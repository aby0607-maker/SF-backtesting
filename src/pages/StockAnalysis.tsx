import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, TrendingUp, TrendingDown, Sparkles, Newspaper, ExternalLink, ChevronRight, ChevronDown, ChevronUp, User, Scale, Calendar, LogOut, MessageCircle, GitCompare, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { getNewsForStock, getThesisImpact, getUpcomingEvents, formatEventDate, getEventIcon, type NewsItem, type UpcomingEvent } from '@/data/news'
import { ScoreGauge, VerdictBadge } from '@/components/ui'
import { SegmentBar } from '@/components/charts'
import { StaggerContainer, StaggerItem } from '@/components/motion'
import type { Stock, StockVerdict } from '@/types'

// Skeleton components for loading state
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('bg-dark-600 rounded shimmer', className)} />
}

// Generate 16-parameter Red Flag Framework
function generateRedFlagFramework(verdict: StockVerdict, _stock: Stock) {
  const allFlags = [
    // Financial (5 parameters)
    { id: 'rf-de', category: 'financial' as const, title: 'Debt/Equity Ratio', threshold: '>2.0', currentValue: '0.0', isTriggered: false, severity: 'critical' as const, description: 'Debt-free company', action: 'No action needed' },
    { id: 'rf-icr', category: 'financial' as const, title: 'Interest Coverage', threshold: '<1.5', currentValue: '∞', isTriggered: false, severity: 'critical' as const, description: 'No debt, no interest', action: 'No action needed' },
    { id: 'rf-ocf', category: 'financial' as const, title: 'Negative OCF', threshold: '<0', currentValue: 'Positive', isTriggered: false, severity: 'high' as const, description: 'Operating cash flow positive', action: 'Monitor quarterly' },
    { id: 'rf-cr', category: 'financial' as const, title: 'Current Ratio', threshold: '<1.0', currentValue: '4.2', isTriggered: false, severity: 'high' as const, description: 'Strong liquidity position', action: 'No action needed' },
    { id: 'rf-quickratio', category: 'financial' as const, title: 'Quick Ratio', threshold: '<0.5', currentValue: '3.8', isTriggered: false, severity: 'medium' as const, description: 'Excellent quick ratio', action: 'No action needed' },

    // Governance (4 parameters)
    { id: 'rf-pledge', category: 'governance' as const, title: 'Promoter Pledge', threshold: '>20%', currentValue: '0%', isTriggered: false, severity: 'critical' as const, description: 'No promoter pledging', action: 'No action needed' },
    { id: 'rf-rpt', category: 'governance' as const, title: 'Related Party Transactions', threshold: '>10%', currentValue: '3%', isTriggered: false, severity: 'high' as const, description: 'RPT within acceptable limits', action: 'Monitor annually' },
    { id: 'rf-audit', category: 'governance' as const, title: 'Audit Qualification', threshold: 'Any', currentValue: 'None', isTriggered: false, severity: 'critical' as const, description: 'Clean audit report', action: 'No action needed' },
    { id: 'rf-board', category: 'governance' as const, title: 'Board Changes', threshold: '>2/year', currentValue: '0', isTriggered: false, severity: 'medium' as const, description: 'Stable board composition', action: 'No action needed' },

    // Quality (3 parameters)
    { id: 'rf-rev-profit', category: 'quality' as const, title: 'Revenue-Profit Divergence', threshold: '>30%', currentValue: '5%', isTriggered: false, severity: 'high' as const, description: 'Revenue and profit aligned', action: 'No action needed' },
    { id: 'rf-recv', category: 'quality' as const, title: 'Receivables Spike', threshold: '>50% YoY', currentValue: '12%', isTriggered: false, severity: 'medium' as const, description: 'Normal receivables growth', action: 'Monitor quarterly' },
    { id: 'rf-inv', category: 'quality' as const, title: 'Inventory Bloat', threshold: '>60% YoY', currentValue: 'N/A', isTriggered: false, severity: 'medium' as const, description: 'Not applicable - service company', action: 'No action needed' },

    // Structural (2 parameters)
    { id: 'rf-client', category: 'structural' as const, title: 'Single Client', threshold: '>30% revenue', currentValue: '8%', isTriggered: false, severity: 'high' as const, description: 'Diversified customer base', action: 'No action needed' },
    { id: 'rf-geo', category: 'structural' as const, title: 'Geographic Concentration', threshold: '>70%', currentValue: '85%', isTriggered: true, severity: 'medium' as const, description: 'India-focused business (85%)', action: 'Monitor international expansion' },

    // Historical (2 parameters)
    { id: 'rf-miss', category: 'historical' as const, title: 'Guidance Misses', threshold: '>2 consecutive', currentValue: '0', isTriggered: false, severity: 'high' as const, description: 'Meeting guidance consistently', action: 'No action needed' },
    { id: 'rf-cfo', category: 'historical' as const, title: 'CFO Changes', threshold: '>1 in 2 years', currentValue: '0', isTriggered: false, severity: 'medium' as const, description: 'Stable management', action: 'No action needed' },
  ]

  // Override with actual red flags from verdict if present
  const triggeredFlags = verdict.redFlags?.map(f => ({
    ...f,
    category: (f as any).category || 'financial' as const,
    isTriggered: true,
    currentValue: (f as any).currentValue || 'Triggered',
    threshold: (f as any).threshold || 'Exceeded'
  })) || []

  // Merge triggered flags with framework
  const mergedFlags = allFlags.map(flag => {
    const override = triggeredFlags.find(tf => tf.id === flag.id || tf.title === flag.title)
    return override || flag
  })

  // Add any additional triggered flags not in the base framework
  const additionalTriggered = triggeredFlags.filter(tf =>
    !allFlags.some(f => f.id === tf.id || f.title === tf.title)
  )

  const finalFlags = [...mergedFlags, ...additionalTriggered]
  const triggered = finalFlags.filter(f => f.isTriggered)

  return {
    triggeredCount: triggered.length,
    totalParameters: 16,
    flags: finalFlags,
    byCategory: {
      financial: finalFlags.filter(f => f.category === 'financial'),
      governance: finalFlags.filter(f => f.category === 'governance'),
      quality: finalFlags.filter(f => f.category === 'quality'),
      structural: finalFlags.filter(f => f.category === 'structural'),
      historical: finalFlags.filter(f => f.category === 'historical'),
    }
  }
}

// Red Flag Section Component with 16-parameter framework
function RedFlagSection({ verdict }: { verdict: StockVerdict }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // For now, generate framework without stock data (we can enhance later)
  const framework = generateRedFlagFramework(verdict, {} as Stock)
  const triggeredFlags = framework.flags.filter(f => f.isTriggered)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    )
  }

  const categoryLabels: Record<string, { label: string; icon: string }> = {
    financial: { label: 'Financial Health', icon: '💰' },
    governance: { label: 'Governance', icon: '🏛️' },
    quality: { label: 'Earnings Quality', icon: '📊' },
    structural: { label: 'Business Structure', icon: '🏢' },
    historical: { label: 'Track Record', icon: '📜' },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className={cn(
        'card border',
        triggeredFlags.length > 0
          ? 'border-destructive-500/30 bg-destructive-500/5'
          : 'border-success-500/30 bg-success-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className={cn(
          'text-h4 flex items-center gap-2',
          triggeredFlags.length > 0 ? 'text-destructive-400' : 'text-success-400'
        )}>
          {triggeredFlags.length > 0 ? (
            <motion.div animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 0.5, repeat: 3 }}>
              <AlertTriangle className="w-5 h-5" />
            </motion.div>
          ) : (
            <span className="text-success-400">✓</span>
          )}
          Red Flag Scanner
        </h2>
        <div className="flex items-center gap-3">
          <span className={cn(
            'px-2 py-1 rounded-lg text-xs font-bold',
            triggeredFlags.length === 0 ? 'bg-success-500/20 text-success-400' :
            triggeredFlags.length <= 2 ? 'bg-warning-500/20 text-warning-400' :
            'bg-destructive-500/20 text-destructive-400'
          )}>
            {triggeredFlags.length}/{framework.totalParameters} Triggered
          </span>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-neutral-400 mb-4">
        {triggeredFlags.length === 0 ? (
          'All 16 risk parameters passed. No red flags detected.'
        ) : (
          `${triggeredFlags.length} of 16 risk parameters triggered. Review below.`
        )}
      </p>

      {/* Triggered Flags - Always visible */}
      {triggeredFlags.length > 0 && (
        <div className="space-y-2 mb-4">
          {triggeredFlags.map((flag) => (
            <div key={flag.id} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-lg">
              <span className={cn(
                'px-2 py-0.5 text-[10px] font-bold rounded flex-shrink-0 uppercase',
                flag.severity === 'critical' && 'bg-destructive-500 text-white',
                flag.severity === 'high' && 'bg-warning-500 text-white',
                flag.severity === 'medium' && 'bg-warning-500/30 text-warning-400'
              )}>
                {flag.severity}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-white">{flag.title}</span>
                  {flag.currentValue && flag.threshold && (
                    <span className="text-xs text-destructive-400">
                      {flag.currentValue} (threshold: {flag.threshold})
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">{flag.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expandable - View All 16 Parameters */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Full Scan
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View All 16 Parameters
          </>
        )}
      </button>

      {/* Expanded View - All Parameters by Category */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-white/10 space-y-3">
              {Object.entries(framework.byCategory).map(([category, flags]) => {
                const categoryInfo = categoryLabels[category]
                const categoryTriggered = flags.filter(f => f.isTriggered).length
                const isOpen = expandedCategories.includes(category)

                return (
                  <div key={category} className="bg-dark-700/30 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-dark-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span>{categoryInfo.icon}</span>
                        <span className="font-medium text-white">{categoryInfo.label}</span>
                        <span className="text-xs text-neutral-500">({flags.length} params)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {categoryTriggered > 0 ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-destructive-500/20 text-destructive-400 rounded">
                            {categoryTriggered} triggered
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-success-500/20 text-success-400 rounded">
                            All clear
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                      </div>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-3 space-y-2">
                            {flags.map(flag => (
                              <div
                                key={flag.id}
                                className={cn(
                                  'flex items-center justify-between py-2 px-3 rounded text-sm',
                                  flag.isTriggered ? 'bg-destructive-500/10' : 'bg-dark-600/50'
                                )}
                              >
                                <div className="flex items-center gap-2">
                                  <span className={flag.isTriggered ? 'text-destructive-400' : 'text-success-400'}>
                                    {flag.isTriggered ? '⚠️' : '✓'}
                                  </span>
                                  <span className={flag.isTriggered ? 'text-white' : 'text-neutral-400'}>
                                    {flag.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                  <span className="text-neutral-500">
                                    {flag.currentValue} / {flag.threshold}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>()
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stock, setStock] = useState<Stock | null>(null)
  const [verdict, setVerdict] = useState<StockVerdict | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])

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
      setUpcomingEvents(getUpcomingEvents(ticker))
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
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-h2 text-white">{stock.name}</h1>
              {/* Profile Badge */}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide',
                currentProfile.investmentThesis === 'growth' && 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
                currentProfile.investmentThesis === 'value' && 'bg-success-500/20 text-success-400 border border-success-500/30',
                currentProfile.investmentThesis === 'dividend' && 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
                currentProfile.investmentThesis === 'quality' && 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
                currentProfile.investmentThesis === 'agnostic' && 'bg-neutral-500/20 text-neutral-400 border border-neutral-500/30'
              )}>
                {currentProfile.investmentThesis} Profile
              </span>
            </div>
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

        {/* Price & Key Stats Row */}
        <div className="flex flex-wrap items-center gap-6 mb-4">
          {/* Current Price */}
          <div>
            <span className="text-h1 text-white">{formatCurrency(stock.currentPrice)}</span>
            <span className={cn(
              'ml-3 text-body-lg font-medium inline-flex items-center gap-1',
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
        </div>

        {/* Market Cap & 52W Range */}
        <div className="flex flex-wrap gap-6 mb-6 text-sm">
          {/* Market Cap */}
          <div className="flex items-center gap-2">
            <span className="text-neutral-500">Market Cap:</span>
            <span className="text-white font-medium">
              {stock.marketCap >= 100000
                ? `₹${(stock.marketCap / 100000).toFixed(1)}L Cr`
                : stock.marketCap >= 1000
                  ? `₹${(stock.marketCap / 1000).toFixed(0)}K Cr`
                  : `₹${stock.marketCap} Cr`}
            </span>
          </div>

          {/* 52-Week Range with Position Indicator */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <span className="text-neutral-500">52W:</span>
            <span className="text-neutral-400 text-xs">{formatCurrency(stock.low52w)}</span>
            <div className="flex-1 max-w-[120px] h-1.5 bg-dark-600 rounded-full relative">
              {/* Range bar */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-destructive-500 via-warning-500 to-success-500"
                />
              </div>
              {/* Position marker */}
              <motion.div
                initial={{ left: '0%' }}
                animate={{
                  left: `${Math.min(100, Math.max(0, ((stock.currentPrice - stock.low52w) / (stock.high52w - stock.low52w)) * 100))}%`
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-lg border-2 border-primary-500 -ml-1"
              />
            </div>
            <span className="text-neutral-400 text-xs">{formatCurrency(stock.high52w)}</span>
            <span className="text-xs text-neutral-500">
              ({Math.round(((stock.currentPrice - stock.low52w) / (stock.high52w - stock.low52w)) * 100)}%)
            </span>
          </div>
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

      {/* WHY THIS VERDICT FOR YOU - Verdict Explainer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card bg-gradient-to-br from-primary-500/5 to-transparent border border-primary-500/10"
      >
        <h2 className="text-h4 text-white mb-4 flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary-400" />
          Why This Verdict For You
        </h2>

        {/* Profile Context */}
        <div className="mb-4 p-3 bg-primary-500/10 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-white">
              {currentProfile.displayName} ({currentProfile.investmentThesis.toUpperCase()} Profile)
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Your profile prioritizes {
              currentProfile.investmentThesis === 'growth' ? 'high-growth companies with revenue acceleration, even at premium valuations' :
              currentProfile.investmentThesis === 'value' ? 'undervalued stocks with margin of safety and strong fundamentals' :
              currentProfile.investmentThesis === 'dividend' ? 'stable income-generating stocks with consistent dividend payouts' :
              currentProfile.investmentThesis === 'quality' ? 'companies with superior profitability, strong moats, and consistent performance' :
              'a balanced approach across all investment factors'
            }.
          </p>
        </div>

        {/* Key Score Drivers */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Key Score Drivers</h3>
          <div className="grid grid-cols-2 gap-2">
            {/* Top Positive Contributors */}
            <div className="p-3 bg-success-500/5 border border-success-500/20 rounded-lg">
              <span className="text-xs text-success-400 font-medium block mb-2">+ Positive Impact</span>
              {verdict.segments
                .filter(s => s.status === 'positive')
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 3)
                .map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-300">{segment.name}</span>
                    <span className="text-success-400 font-medium">+{(segment.score * segment.weight * 10).toFixed(1)}</span>
                  </div>
                ))}
            </div>
            {/* Negative Contributors */}
            <div className="p-3 bg-destructive-500/5 border border-destructive-500/20 rounded-lg">
              <span className="text-xs text-destructive-400 font-medium block mb-2">- Negative Impact</span>
              {verdict.segments
                .filter(s => s.status === 'negative')
                .sort((a, b) => b.weight - a.weight)
                .slice(0, 3)
                .map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between text-xs mb-1">
                    <span className="text-neutral-300">{segment.name}</span>
                    <span className="text-destructive-400 font-medium">-{((10 - segment.score) * segment.weight * 10).toFixed(1)}</span>
                  </div>
                ))}
              {verdict.segments.filter(s => s.status === 'negative').length === 0 && (
                <span className="text-neutral-500 text-xs">No significant negatives</span>
              )}
            </div>
          </div>
        </div>

        {/* Weight Breakdown for Profile */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-white mb-2">Your Profile Weight Distribution</h3>
          <div className="flex flex-wrap gap-2">
            {verdict.segments
              .sort((a, b) => b.weight - a.weight)
              .slice(0, 5)
              .map((segment) => (
                <div
                  key={segment.id}
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    segment.status === 'positive' ? 'bg-success-500/20 text-success-400' :
                    segment.status === 'negative' ? 'bg-destructive-500/20 text-destructive-400' :
                    'bg-neutral-500/20 text-neutral-400'
                  )}
                >
                  {segment.name}: {(segment.weight * 100).toFixed(0)}%
                </div>
              ))}
          </div>
        </div>

        {/* What Would Change the Verdict */}
        <div className="p-3 bg-dark-700/50 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">What Would Change This Verdict?</h3>
          <ul className="space-y-1.5 text-xs text-neutral-400">
            {verdict.verdict === 'STRONG BUY' || verdict.verdict === 'BUY' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-warning-400 mt-0.5">↓</span>
                  <span>
                    Downgrade to HOLD if: {
                      currentProfile.investmentThesis === 'growth' ? 'revenue growth falls below 30% for 2 consecutive quarters' :
                      currentProfile.investmentThesis === 'value' ? 'P/E exceeds 25x or margin of safety erodes' :
                      currentProfile.investmentThesis === 'dividend' ? 'dividend yield falls below 2% or payout ratio exceeds 80%' :
                      'core metrics deteriorate significantly'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive-400 mt-0.5">↓</span>
                  <span>Downgrade to AVOID if: {verdict.redFlags?.length ? `Red flags trigger (${verdict.redFlags.length} currently monitored)` : 'Multiple critical red flags appear'}</span>
                </li>
              </>
            ) : verdict.verdict === 'HOLD' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-success-400 mt-0.5">↑</span>
                  <span>
                    Upgrade to BUY if: {
                      currentProfile.investmentThesis === 'growth' ? 'growth re-accelerates above 40% with improving margins' :
                      currentProfile.investmentThesis === 'value' ? 'valuation drops 20%+ creating clear margin of safety' :
                      currentProfile.investmentThesis === 'dividend' ? 'dividend yield increases while payout remains sustainable' :
                      'key metrics show sustained improvement'
                    }
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive-400 mt-0.5">↓</span>
                  <span>Downgrade to AVOID if: Core thesis breaks or critical red flags appear</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-success-400 mt-0.5">↑</span>
                  <span>
                    Upgrade to HOLD if: {
                      currentProfile.investmentThesis === 'growth' ? 'growth trajectory stabilizes and path to profitability clears' :
                      currentProfile.investmentThesis === 'value' ? 'valuation corrects 30%+ bringing P/E to reasonable levels' :
                      currentProfile.investmentThesis === 'dividend' ? 'company initiates or increases dividend with sustainable payout' :
                      'fundamental concerns are addressed'
                    }
                  </span>
                </li>
              </>
            )}
          </ul>
        </div>
      </motion.div>

      {/* Red Flags - 16-Parameter Framework */}
      <RedFlagSection verdict={verdict} />

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

      {/* News & Events Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="card"
      >
        <h2 className="text-h4 mb-4 text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary-400" />
          News & Events
        </h2>

        {/* Upcoming Events Calendar */}
        {upcomingEvents.length > 0 && (
          <div className="mb-4 p-3 bg-primary-500/5 border border-primary-500/20 rounded-lg">
            <h3 className="text-sm font-semibold text-primary-400 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Upcoming Events
            </h3>
            <div className="flex flex-wrap gap-2">
              {upcomingEvents.slice(0, 4).map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                    event.importance === 'high' ? 'bg-primary-500/20 text-primary-400' :
                    event.importance === 'medium' ? 'bg-dark-600 text-neutral-300' :
                    'bg-dark-700 text-neutral-400'
                  )}
                >
                  <span>{getEventIcon(event.type)}</span>
                  <span className="font-medium">{event.title}</span>
                  <span className="text-neutral-500">•</span>
                  <span className={event.importance === 'high' ? 'text-primary-300' : 'text-neutral-500'}>
                    {formatEventDate(event.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* News with Thesis Impact */}
        {news.length > 0 ? (
          <div className="space-y-3">
            {news.map((item) => {
              const thesisImpact = getThesisImpact(item, currentProfile.investmentThesis)

              return (
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

                      {/* Thesis Impact Badge */}
                      <div className={cn(
                        'inline-flex items-center gap-2 px-2 py-1 rounded text-xs mb-2',
                        thesisImpact.impact === 'positive' ? 'bg-success-500/10 text-success-400' :
                        thesisImpact.impact === 'negative' ? 'bg-destructive-500/10 text-destructive-400' :
                        'bg-neutral-500/10 text-neutral-400'
                      )}>
                        <User className="w-3 h-3" />
                        <span className="font-medium uppercase">{currentProfile.investmentThesis}</span>
                        <span>Impact:</span>
                        <span className="font-bold">{thesisImpact.scoreChange}</span>
                        <span className="text-neutral-500">•</span>
                        <span className="truncate max-w-[200px]">{thesisImpact.reason}</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-neutral-500 text-xs">{item.source}</span>
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
              )
            })}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm">No recent news for this stock.</p>
        )}

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

        {/* Exit Triggers Table */}
        {verdict.exitTriggers && verdict.exitTriggers.length > 0 && (
          <div className="pt-4 mt-4 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <LogOut className="w-4 h-4 text-destructive-400" />
              Exit Triggers
            </h3>
            <p className="text-xs text-neutral-500 mb-3">
              Consider exiting or reducing position if any of these conditions are met:
            </p>
            <div className="space-y-2">
              {verdict.exitTriggers.map((trigger) => (
                <div
                  key={trigger.id}
                  className={cn(
                    'flex items-center justify-between p-2.5 rounded-lg text-sm',
                    trigger.status === 'safe' && 'bg-dark-700/50',
                    trigger.status === 'warning' && 'bg-warning-500/10 border border-warning-500/20',
                    trigger.status === 'danger' && 'bg-destructive-500/10 border border-destructive-500/20'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      trigger.status === 'safe' && 'bg-success-500',
                      trigger.status === 'warning' && 'bg-warning-500',
                      trigger.status === 'danger' && 'bg-destructive-500'
                    )} />
                    <div>
                      <span className="text-white font-medium">{trigger.metric}</span>
                      <span className="text-neutral-400 mx-1">{trigger.condition}</span>
                      <span className="text-destructive-400 font-medium">{trigger.threshold}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-neutral-500 block">Current</span>
                      <span className={cn(
                        'font-medium',
                        trigger.status === 'safe' && 'text-success-400',
                        trigger.status === 'warning' && 'text-warning-400',
                        trigger.status === 'danger' && 'text-destructive-400'
                      )}>
                        {trigger.currentValue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-neutral-600 mt-2">
              * Exit triggers are personalized based on your {currentProfile.investmentThesis} investment thesis
            </p>
          </div>
        )}
      </motion.div>

      {/* Actions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <h2 className="text-h4 text-white mb-4">Actions</h2>

        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="btn-primary flex items-center justify-center gap-2">
            <BookmarkPlus className="w-4 h-4" />
            Add to Watchlist
          </button>
          <Link
            to="/journal"
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Add to Journal
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Link
            to={`/compare?add=${stock.symbol}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
          >
            <GitCompare className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Compare</span>
          </Link>
          <Link
            to="/advisors"
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
          >
            <UserCheck className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Ask Advisor</span>
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${stock.name} Analysis`,
                  text: `Check out the StockFox analysis for ${stock.symbol}: Score ${verdict.overallScore}/10 - ${verdict.verdict}`,
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
                // Could add toast notification here
              }
            }}
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors group"
          >
            <Share2 className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Share</span>
          </button>
        </div>

        {/* Ask AI CTA */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <Link
            to="/chat"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-500/30 rounded-lg text-primary-400 hover:from-primary-500/30 hover:to-primary-600/30 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Ask AI about {stock.symbol}
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
