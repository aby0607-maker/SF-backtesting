import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, TrendingUp, TrendingDown, Sparkles, Newspaper, ChevronRight, ChevronDown, ChevronUp, Check, X, AlertCircle, Calendar, LogOut, MessageCircle, GitCompare, UserCheck } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { getNewsForStock, getUpcomingEvents, formatEventDate, getEventIcon, type NewsItem, type UpcomingEvent } from '@/data/news'
import { ScoreGauge, VerdictBadge } from '@/components/ui'
import { SegmentBar } from '@/components/charts'
import type { Stock, StockVerdict } from '@/types'

// Skeleton components for loading state
function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn('bg-dark-600 rounded animate-pulse', className)} />
}

// Generate 16-parameter Red Flag Framework
function generateRedFlagFramework(verdict: StockVerdict) {
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

  const additionalTriggered = triggeredFlags.filter(tf =>
    !allFlags.some(f => f.id === tf.id || f.title === tf.title)
  )

  const finalFlags = [...mergedFlags, ...additionalTriggered]
  const triggered = finalFlags.filter(f => f.isTriggered)

  return {
    triggeredCount: triggered.length,
    totalParameters: 16,
    flags: finalFlags,
    triggeredFlags: triggered,
    byCategory: {
      financial: finalFlags.filter(f => f.category === 'financial'),
      governance: finalFlags.filter(f => f.category === 'governance'),
      quality: finalFlags.filter(f => f.category === 'quality'),
      structural: finalFlags.filter(f => f.category === 'structural'),
      historical: finalFlags.filter(f => f.category === 'historical'),
    }
  }
}

// ============== RED FLAG SCANNER COMPONENT ==============
function RedFlagScanner({
  verdict,
  news,
  isExpanded,
  onToggle
}: {
  verdict: StockVerdict
  news: NewsItem[]
  isExpanded: boolean
  onToggle: () => void
}) {
  const framework = generateRedFlagFramework(verdict)
  const criticalFlags = framework.triggeredFlags.filter(f => f.severity === 'critical')
  const highFlags = framework.triggeredFlags.filter(f => f.severity === 'high')
  const otherFlags = framework.triggeredFlags.filter(f => f.severity !== 'critical' && f.severity !== 'high')

  // Get negative news as potential red flag signals
  const negativeNews = news.filter(n => n.sentiment === 'negative')
  const hasCritical = criticalFlags.length > 0
  const hasIssues = framework.triggeredCount > 0 || negativeNews.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border overflow-hidden',
        hasCritical ? 'bg-destructive-500/5 border-destructive-500/20' :
        hasIssues ? 'bg-warning-500/5 border-warning-500/20' :
        'bg-success-500/5 border-success-500/20'
      )}
    >
      {/* Header - Always visible */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {hasCritical ? (
              <AlertTriangle className="w-5 h-5 text-destructive-400" />
            ) : hasIssues ? (
              <AlertCircle className="w-5 h-5 text-warning-400" />
            ) : (
              <Check className="w-5 h-5 text-success-400" />
            )}
            <h3 className="font-semibold text-white">Red Flag Scanner</h3>
          </div>
          <div className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            framework.triggeredCount === 0 ? 'bg-success-500/20 text-success-400' :
            hasCritical ? 'bg-destructive-500/20 text-destructive-400' :
            'bg-warning-500/20 text-warning-400'
          )}>
            {framework.triggeredCount}/{framework.totalParameters}
          </div>
        </div>

        {/* Critical Flags - Always show prominently if present */}
        {criticalFlags.length > 0 && (
          <div className="mt-3 space-y-2">
            {criticalFlags.map(flag => (
              <div key={flag.id} className="flex items-start gap-3 p-3 bg-destructive-500/10 rounded-xl border border-destructive-500/20">
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-destructive-500 text-white rounded uppercase">
                  Critical
                </span>
                <div className="flex-1">
                  <span className="font-medium text-white text-sm">{flag.title}</span>
                  <p className="text-xs text-neutral-400 mt-0.5">{flag.description}</p>
                  {flag.currentValue && flag.threshold && (
                    <p className="text-xs text-destructive-400 mt-1">
                      Current: {flag.currentValue} • Threshold: {flag.threshold}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* High severity flags shown upfront */}
        {highFlags.length > 0 && (
          <div className="mt-3 space-y-2">
            {highFlags.slice(0, 2).map(flag => (
              <div key={flag.id} className="flex items-start gap-3 p-3 bg-warning-500/10 rounded-xl border border-warning-500/20">
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-warning-500 text-white rounded uppercase">
                  High
                </span>
                <div className="flex-1">
                  <span className="font-medium text-white text-sm">{flag.title}</span>
                  <p className="text-xs text-neutral-400 mt-0.5">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Negative News as Red Flag Signals */}
        {negativeNews.length > 0 && (
          <div className="mt-3 p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-warning-400" />
              <span className="text-xs font-medium text-warning-400">Recent News Signals</span>
            </div>
            <div className="space-y-1.5">
              {negativeNews.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-start gap-2">
                  <TrendingDown className="w-3 h-3 text-destructive-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-300">{item.headline}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No issues summary */}
        {!hasIssues && (
          <p className="text-sm text-neutral-400 mt-2">
            All 16 risk parameters passed. No critical issues detected.
          </p>
        )}
      </div>

      {/* Expandable section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
              {/* Other triggered flags */}
              {otherFlags.length > 0 && (
                <div className="space-y-2 mb-3">
                  <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Other Flags</span>
                  {otherFlags.map(flag => (
                    <div key={flag.id} className="flex items-center justify-between py-2 px-3 bg-dark-700/50 rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-warning-400" />
                        <span className="text-neutral-300">{flag.title}</span>
                      </div>
                      <span className="text-xs text-neutral-500">{flag.currentValue}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Full scan status */}
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(framework.byCategory).map(([cat, flags]) => {
                  const triggered = flags.filter(f => f.isTriggered).length
                  return (
                    <div key={cat} className="text-center p-2 bg-dark-700/30 rounded-lg">
                      <div className={cn(
                        'text-lg font-bold',
                        triggered === 0 ? 'text-success-400' : 'text-warning-400'
                      )}>
                        {triggered}/{flags.length}
                      </div>
                      <div className="text-[10px] text-neutral-500 capitalize">{cat}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="w-full py-2.5 text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-1 border-t border-white/5 transition-colors"
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Details
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View All Parameters
          </>
        )}
      </button>
    </motion.div>
  )
}

// ============== PROS/CONS COMPONENT ==============
function ProsCons({ verdict }: { verdict: StockVerdict }) {
  const pros = verdict.topSignals.filter(s => s.isPositive !== false)
  const cons = verdict.topConcerns?.filter(c => c.isPositive === false) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Pros */}
      <div className="rounded-2xl border border-success-500/20 bg-success-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-success-400" />
          </div>
          <span className="font-semibold text-white text-sm">Strengths</span>
        </div>
        <div className="space-y-2">
          {pros.slice(0, 4).map((signal, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">{signal.title}</p>
                {signal.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{signal.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cons */}
      <div className="rounded-2xl border border-warning-500/20 bg-warning-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-warning-500/20 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-warning-400" />
          </div>
          <span className="font-semibold text-white text-sm">Weaknesses</span>
        </div>
        <div className="space-y-2">
          {cons.length > 0 ? cons.slice(0, 4).map((concern, i) => (
            <div key={i} className="flex items-start gap-2">
              <X className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">{concern.title}</p>
                {concern.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{concern.description}</p>
                )}
              </div>
            </div>
          )) : (
            <p className="text-sm text-neutral-500">No significant concerns</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ============== MAIN COMPONENT ==============
export function StockAnalysis() {
  const { ticker } = useParams<{ ticker: string }>()
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [stock, setStock] = useState<Stock | null>(null)
  const [verdict, setVerdict] = useState<StockVerdict | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([])

  // Progressive disclosure state
  const [isFullView, setIsFullView] = useState(false)
  const [isRedFlagExpanded, setIsRedFlagExpanded] = useState(false)

  useEffect(() => {
    if (!ticker || !currentProfile) return

    setIsLoading(true)
    const timer = setTimeout(() => {
      const stockData = getStockBySymbol(ticker)
      const verdictData = getVerdictForStock(ticker, currentProfile.id)
      const newsData = getNewsForStock(ticker)

      setStock(stockData || null)
      setVerdict(verdictData || null)
      setNews(newsData.slice(0, 5))
      setUpcomingEvents(getUpcomingEvents(ticker))
      setIsLoading(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [ticker, currentProfile])

  if (!ticker || !currentProfile) return null

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <ArrowLeft className="w-4 h-4" />
          Back
        </div>
        <div className="rounded-2xl bg-dark-800 border border-white/5 p-6">
          <SkeletonBlock className="w-48 h-8 mb-2" />
          <SkeletonBlock className="w-32 h-4 mb-6" />
          <div className="flex justify-center">
            <SkeletonBlock className="w-32 h-32 rounded-full" />
          </div>
        </div>
        <SkeletonBlock className="w-full h-32 rounded-2xl" />
      </div>
    )
  }

  // Stock not found
  if (!stock || !verdict) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="rounded-2xl bg-dark-800 border border-white/5 text-center py-12 px-6">
          <h2 className="text-xl font-semibold text-white mb-2">Stock Not Found</h2>
          <p className="text-neutral-400">
            We couldn't find analysis for "{ticker.toUpperCase()}"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* ============== HERO CARD ============== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-dark-800 border border-white/5 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{stock.name}</h1>
              <p className="text-sm text-neutral-400 mt-0.5">
                {stock.sector} • {stock.symbol}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" aria-label="Share">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 text-neutral-400 hover:text-white transition-colors" aria-label="Save">
                <BookmarkPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-white">{formatCurrency(stock.currentPrice)}</span>
            <span className={cn(
              'text-sm font-medium flex items-center gap-1',
              stock.changePercent >= 0 ? 'text-success-400' : 'text-destructive-400'
            )}>
              {stock.changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {formatPercent(stock.changePercent)}
            </span>
          </div>

          {/* 52W Range - minimal */}
          <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
            <span>52W: {formatCurrency(stock.low52w)}</span>
            <div className="flex-1 max-w-24 h-1 bg-dark-600 rounded-full relative">
              <motion.div
                initial={{ left: '0%' }}
                animate={{
                  left: `${Math.min(100, Math.max(0, ((stock.currentPrice - stock.low52w) / (stock.high52w - stock.low52w)) * 100))}%`
                }}
                transition={{ duration: 0.5 }}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-primary-400 rounded-full -ml-1"
              />
            </div>
            <span>{formatCurrency(stock.high52w)}</span>
          </div>
        </div>

        {/* HERO: Score + Verdict */}
        <div className="p-5 pt-0">
          <div className="rounded-2xl bg-dark-700/50 p-5">
            <div className="flex items-center gap-5">
              {/* Score Gauge */}
              <ScoreGauge score={verdict.overallScore} size="lg" />

              {/* Verdict Info */}
              <div className="flex-1">
                <VerdictBadge verdict={verdict.verdict} size="lg" />
                <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
                  {verdict.verdictRationale}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                  <span className="px-2 py-0.5 rounded-full bg-primary-500/10 text-primary-400 font-medium">
                    {currentProfile.investmentThesis.toUpperCase()} Profile
                  </span>
                  <span>•</span>
                  <span>#{verdict.peerRank} of {verdict.peerTotal} in {verdict.peerGroup || 'Peers'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ============== PROS/CONS (Quick View) ============== */}
      <ProsCons verdict={verdict} />

      {/* ============== RED FLAG SCANNER ============== */}
      <RedFlagScanner
        verdict={verdict}
        news={news}
        isExpanded={isRedFlagExpanded}
        onToggle={() => setIsRedFlagExpanded(!isRedFlagExpanded)}
      />

      {/* ============== UPCOMING EVENTS (if any) ============== */}
      {upcomingEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-dark-800 border border-white/5 p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-primary-400" />
            <span className="font-semibold text-white text-sm">Upcoming Events</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {upcomingEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
                  event.importance === 'high' ? 'bg-primary-500/10 text-primary-300' : 'bg-dark-700 text-neutral-400'
                )}
              >
                <span>{getEventIcon(event.type)}</span>
                <span className="font-medium">{event.title}</span>
                <span className="text-neutral-500">•</span>
                <span>{formatEventDate(event.date)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ============== ENTRY ASSESSMENT ============== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-2xl bg-dark-800 border border-white/5 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <h3 className="font-semibold text-white">Entry Assessment</h3>
          </div>
          <span className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium',
            verdict.verdict === 'STRONG BUY' || verdict.verdict === 'BUY'
              ? 'bg-success-500/20 text-success-400'
              : verdict.verdict === 'HOLD' || verdict.verdict === 'STRONG HOLD'
                ? 'bg-warning-500/20 text-warning-400'
                : 'bg-destructive-500/20 text-destructive-400'
          )}>
            {verdict.verdict === 'STRONG BUY' || verdict.verdict === 'BUY' ? 'FAVORABLE' :
             verdict.verdict === 'HOLD' || verdict.verdict === 'STRONG HOLD' ? 'NEUTRAL' : 'WAIT'}
          </span>
        </div>

        {/* Position Sizing */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 bg-dark-700/50 rounded-xl">
            <span className="text-xs text-neutral-500 block mb-1">Suggested Allocation</span>
            <span className="text-white font-medium text-sm">
              {typeof verdict.positionSizing === 'string'
                ? verdict.positionSizing
                : verdict.positionSizing.recommendedAllocation}
            </span>
          </div>
          {verdict.entryTiming?.fairValueRange && (
            <div className="p-3 bg-dark-700/50 rounded-xl">
              <span className="text-xs text-neutral-500 block mb-1">Fair Value Range</span>
              <span className="text-white font-medium text-sm">{verdict.entryTiming.fairValueRange}</span>
            </div>
          )}
        </div>

        {/* Exit Triggers (collapsed in quick view) */}
        {verdict.exitTriggers && verdict.exitTriggers.length > 0 && (
          <div className="pt-3 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-400">Exit Triggers</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {verdict.exitTriggers.slice(0, 3).map((trigger) => (
                <span
                  key={trigger.id}
                  className={cn(
                    'px-2 py-1 rounded text-xs',
                    trigger.status === 'safe' ? 'bg-dark-700 text-neutral-400' :
                    trigger.status === 'warning' ? 'bg-warning-500/10 text-warning-400' :
                    'bg-destructive-500/10 text-destructive-400'
                  )}
                >
                  {trigger.metric} {trigger.condition} {trigger.threshold}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* ============== EXPAND TOGGLE ============== */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        onClick={() => setIsFullView(!isFullView)}
        className={cn(
          'w-full py-3 rounded-2xl border text-sm font-medium flex items-center justify-center gap-2 transition-all',
          isFullView
            ? 'bg-primary-500/10 border-primary-500/30 text-primary-400'
            : 'bg-dark-800 border-white/10 text-white hover:border-white/20'
        )}
      >
        {isFullView ? (
          <>
            <ChevronUp className="w-4 h-4" />
            Hide Full Analysis
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            View Full Analysis (11 Segments)
          </>
        )}
      </motion.button>

      {/* ============== FULL VIEW: 11 SEGMENTS ============== */}
      <AnimatePresence>
        {isFullView && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            {/* 11-Segment Analysis */}
            <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
              <h3 className="font-semibold text-white mb-4">11-Segment Analysis</h3>

              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4 text-[10px] text-neutral-500">
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

              <SegmentBar
                segments={verdict.segments}
                onSegmentClick={(segmentId) => {
                  window.location.href = `/segment/${ticker}/${segmentId}`
                }}
                showRanks={true}
                showInsights={true}
              />

              <div className="mt-4 pt-3 border-t border-white/5 text-xs text-neutral-500">
                <span className="text-primary-400">{currentProfile.displayName}</span> profile weights applied.
                Click any segment for deep dive.
              </div>
            </div>

            {/* News Section in Full View */}
            {news.length > 0 && (
              <div className="rounded-2xl bg-dark-800 border border-white/5 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-4 h-4 text-primary-400" />
                  <h3 className="font-semibold text-white">Recent News</h3>
                </div>
                <div className="space-y-3">
                  {news.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        'p-3 rounded-xl bg-dark-700/50 border-l-2',
                        item.sentiment === 'positive' && 'border-l-success-500',
                        item.sentiment === 'negative' && 'border-l-destructive-500',
                        item.sentiment === 'neutral' && 'border-l-neutral-500'
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.sentiment === 'positive' && <TrendingUp className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />}
                        {item.sentiment === 'negative' && <TrendingDown className="w-4 h-4 text-destructive-400 mt-0.5 flex-shrink-0" />}
                        <div>
                          <p className="text-sm font-medium text-white">{item.headline}</p>
                          <p className="text-xs text-neutral-400 mt-1">{item.summary}</p>
                          <p className="text-xs text-neutral-500 mt-1">{item.source}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============== ACTIONS ============== */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-dark-800 border border-white/5 p-5"
      >
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button className="py-2.5 px-4 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors">
            <BookmarkPlus className="w-4 h-4" />
            Add to Watchlist
          </button>
          <Link
            to="/journal"
            className="py-2.5 px-4 bg-dark-700 hover:bg-dark-600 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 border border-white/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Add to Journal
          </Link>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <Link
            to={`/compare?add=${stock.symbol}`}
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors group"
          >
            <GitCompare className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Compare</span>
          </Link>
          <Link
            to="/advisors"
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors group"
          >
            <UserCheck className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Ask Advisor</span>
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${stock.name} Analysis`,
                  text: `StockFox: ${stock.symbol} Score ${verdict.overallScore}/10 - ${verdict.verdict}`,
                  url: window.location.href,
                })
              } else {
                navigator.clipboard.writeText(window.location.href)
              }
            }}
            className="flex flex-col items-center gap-1.5 p-3 bg-dark-700/50 rounded-xl hover:bg-dark-700 transition-colors group"
          >
            <Share2 className="w-5 h-5 text-neutral-400 group-hover:text-primary-400 transition-colors" />
            <span className="text-xs text-neutral-400 group-hover:text-white transition-colors">Share</span>
          </button>
        </div>

        {/* AI CTA */}
        <Link
          to="/chat"
          className="flex items-center justify-center gap-2 w-full py-3 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 hover:bg-primary-500/20 transition-colors text-sm font-medium"
        >
          <Sparkles className="w-4 h-4" />
          Ask AI about {stock.symbol}
          <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  )
}
