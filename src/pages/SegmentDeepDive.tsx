import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { ScoreRing, RankingBadge } from '@/components/charts'
import { EnhancedMetricCard } from '@/components/analysis'
import { Skeleton } from '@/components/ui'
import type { SegmentScore, Metric } from '@/types'

// Get score color for dark mode
function getScoreColorClass(score: number): string {
  if (score >= 8) return 'text-success-400'
  if (score >= 6) return 'text-teal-400'
  if (score >= 4) return 'text-warning-400'
  return 'text-destructive-400'
}

// Get status colors for dark mode badges
function getStatusBadgeColors(status: string) {
  switch (status) {
    case 'positive':
      return 'bg-success-500/15 text-success-400 border-success-500/20'
    case 'negative':
      return 'bg-destructive-500/15 text-destructive-400 border-destructive-500/20'
    default:
      return 'bg-neutral-500/15 text-neutral-300 border-neutral-500/20'
  }
}

export function SegmentDeepDive() {
  const { ticker, segmentId } = useParams<{ ticker: string; segmentId: string }>()
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [segment, setSegment] = useState<SegmentScore | null>(null)
  const [stockName, setStockName] = useState('')

  useEffect(() => {
    if (!ticker || !segmentId || !currentProfile) return

    setIsLoading(true)

    const timer = setTimeout(() => {
      const stock = getStockBySymbol(ticker)
      const verdict = getVerdictForStock(ticker, currentProfile.id)

      if (stock && verdict) {
        setStockName(stock.name)
        const foundSegment = verdict.segments.find(s => s.id === segmentId)
        setSegment(foundSegment || null)
      }

      setIsLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [ticker, segmentId, currentProfile])

  if (!ticker || !segmentId || !currentProfile) return null

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link
          to={`/stock/${ticker}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {ticker.toUpperCase()} Analysis
        </Link>

        <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-40 h-8 bg-dark-600" />
            <Skeleton className="w-24 h-12 bg-dark-600" />
          </div>
          <Skeleton className="w-full h-20 bg-dark-600" />
        </div>

        <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6">
          <Skeleton className="w-32 h-6 mb-4 bg-dark-600" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-full h-24 mb-3 bg-dark-600" variant="rectangular" />
          ))}
        </div>
      </div>
    )
  }

  // Segment not found
  if (!segment) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link
          to={`/stock/${ticker}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {ticker.toUpperCase()} Analysis
        </Link>
        <div className="bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 text-center py-12">
          <h2 className="text-xl font-semibold text-white mb-2">Segment Not Found</h2>
          <p className="text-neutral-400">
            We couldn't find the "{segmentId}" segment for this stock.
          </p>
        </div>
      </div>
    )
  }

  const scoreDiff = segment.sectorAvg ? segment.score - segment.sectorAvg : 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          to={`/stock/${ticker}`}
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to {ticker.toUpperCase()} Analysis
        </Link>
      </motion.div>

      {/* Segment Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Score Ring */}
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <ScoreRing
              score={segment.score}
              size={140}
              showLabel
              label={segment.name}
            />
          </div>

          {/* Segment Info */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-white">{segment.name}</h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border',
                getStatusBadgeColors(segment.status)
              )}>
                {segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
              </span>
            </div>

            {/* Rankings and Comparisons */}
            <div className="flex flex-wrap gap-3 mb-4">
              {segment.sectorRank && segment.sectorTotal && (
                <RankingBadge
                  rank={segment.sectorRank}
                  total={segment.sectorTotal}
                  label="Sector Rank"
                />
              )}
              {segment.sectorAvg && (
                <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/50 rounded-xl border border-white/5">
                  <span className="text-xs text-neutral-400">Sector Avg:</span>
                  <span className={cn('font-semibold text-sm', getScoreColorClass(segment.sectorAvg))}>
                    {segment.sectorAvg}/10
                  </span>
                  <span className={cn(
                    'flex items-center gap-0.5 text-xs font-medium',
                    scoreDiff > 0 ? 'text-success-400' : scoreDiff < 0 ? 'text-destructive-400' : 'text-neutral-400'
                  )}>
                    {scoreDiff > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3" />
                        +{scoreDiff.toFixed(1)}
                      </>
                    ) : scoreDiff < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3" />
                        {scoreDiff.toFixed(1)}
                      </>
                    ) : (
                      <>
                        <Minus className="w-3 h-3" />
                        On par
                      </>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 bg-dark-700/50 rounded-xl border border-white/5">
                <span className="text-xs text-neutral-400">Weight:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${segment.weight * 100}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full bg-primary-500 rounded-full"
                    />
                  </div>
                  <span className="text-xs font-medium text-white">
                    {Math.round(segment.weight * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <p className="text-sm text-neutral-300 leading-relaxed">{segment.interpretation}</p>

            {/* Quick Insight */}
            {segment.quickInsight && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-4 p-3 bg-primary-500/10 rounded-xl border border-primary-500/20"
              >
                <span className="text-sm text-primary-300">{segment.quickInsight}</span>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Metrics Section - Enhanced with Trend Intelligence */}
      {segment.metrics && segment.metrics.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-dark-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Key Metrics</h2>
          <div className="space-y-4">
            {segment.metrics.map((metric: Metric, index: number) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
              >
                <EnhancedMetricCard
                  metric={metric}
                  stockName={stockName}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Plain English Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-gradient-to-br from-primary-500/10 to-dark-800/60 backdrop-blur-sm rounded-2xl border border-primary-500/20 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-500/20">
            <Info className="w-4 h-4 text-primary-400" />
          </div>
          What This Means for You
        </h3>
        <p className="text-sm text-neutral-300 leading-relaxed">
          {getExplanationForSegment(segment, currentProfile.experienceLevel, stockName)}
        </p>
      </motion.div>

      {/* Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex gap-4"
      >
        <Link
          to={`/stock/${ticker}`}
          className="flex-1 text-center px-4 py-3 bg-dark-700/50 hover:bg-dark-600/50 text-white font-medium rounded-xl border border-white/10 hover:border-white/20 transition-all"
        >
          Back to Overview
        </Link>
        <Link
          to="/chat"
          className="flex-1 text-center px-4 py-3 bg-primary-500 hover:bg-primary-400 text-white font-medium rounded-xl transition-colors"
        >
          Ask AI About {segment.name}
        </Link>
      </motion.div>
    </div>
  )
}

// Helper function to generate contextual explanations
function getExplanationForSegment(segment: SegmentScore, experienceLevel: string, stockName: string): string {
  const isBeginner = experienceLevel === 'beginner'
  const isPositive = segment.status === 'positive'
  const sectorComparison = segment.sectorAvg
    ? segment.score > segment.sectorAvg
      ? 'better than average for its sector'
      : segment.score < segment.sectorAvg
        ? 'below average for its sector'
        : 'in line with sector averages'
    : ''

  const baseExplanation = {
    profitability: isBeginner
      ? `${stockName}'s profitability tells us how well the company turns revenue into actual profit. ${isPositive ? 'This company is good at making money from its operations' : 'The company is struggling to convert sales into profit'}. ${sectorComparison ? `It's ${sectorComparison}.` : ''}`
      : `${stockName} shows ${isPositive ? 'strong' : 'weak'} operational efficiency. ${sectorComparison ? `Performance is ${sectorComparison}, indicating ${isPositive ? 'competitive advantage' : 'potential concerns'} in cost management and pricing power.` : ''}`,

    growth: isBeginner
      ? `Growth shows how fast the company is expanding. ${isPositive ? 'This company is growing faster than most' : 'Growth has been slower than expected'}. ${sectorComparison ? `Compared to similar companies, it's ${sectorComparison}.` : ''}`
      : `Revenue and earnings trajectory ${isPositive ? 'indicates strong expansion' : 'shows deceleration'}. ${sectorComparison ? `${sectorComparison.charAt(0).toUpperCase() + sectorComparison.slice(1)}, suggesting ${isPositive ? 'market share gains' : 'competitive pressure'}.` : ''}`,

    valuation: isBeginner
      ? `Valuation tells us if the stock price is expensive or cheap compared to what the company earns. ${isPositive ? 'The current price looks reasonable for what you get' : 'The stock might be overpriced right now'}. ${sectorComparison ? `It's ${sectorComparison}.` : ''}`
      : `Current multiples ${isPositive ? 'present an attractive entry point' : 'suggest premium pricing'}. ${sectorComparison ? `Trading ${sectorComparison}, ${isPositive ? 'offering margin of safety' : 'limiting upside potential'}.` : ''}`,

    default: isBeginner
      ? `This segment looks at ${segment.name.toLowerCase()} for ${stockName}. ${isPositive ? 'Things look good here' : 'There are some concerns'}. ${sectorComparison ? `Compared to other companies in the same industry, it's ${sectorComparison}.` : ''}`
      : `${segment.name} analysis for ${stockName} indicates ${isPositive ? 'favorable' : 'challenging'} conditions. ${sectorComparison ? `Positioning is ${sectorComparison}.` : ''}`,
  }

  return baseExplanation[segment.id as keyof typeof baseExplanation] || baseExplanation.default
}
