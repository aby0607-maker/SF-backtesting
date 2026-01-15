import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Info, ArrowUpRight, ArrowDownRight, Minus, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, getScoreColor } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { ScoreRing, RankingBadge, SparklineChart, MetricBar } from '@/components/charts'
import { Skeleton } from '@/components/ui'
import type { SegmentScore, Metric } from '@/types'

export function SegmentDeepDive() {
  const { ticker, segmentId } = useParams<{ ticker: string; segmentId: string }>()
  const { currentProfile } = useAppStore()
  const [isLoading, setIsLoading] = useState(true)
  const [segment, setSegment] = useState<SegmentScore | null>(null)
  const [stockName, setStockName] = useState('')
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null)

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
          className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {ticker.toUpperCase()} Analysis
        </Link>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="w-40 h-8" />
            <Skeleton className="w-24 h-12" />
          </div>
          <Skeleton className="w-full h-20" />
        </div>

        <div className="card">
          <Skeleton className="w-32 h-6 mb-4" />
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="w-full h-24 mb-3" variant="rectangular" />
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
          className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {ticker.toUpperCase()} Analysis
        </Link>
        <div className="card text-center py-12">
          <h2 className="text-h3 mb-2">Segment Not Found</h2>
          <p className="text-neutral-500">
            We couldn't find the "{segmentId}" segment for this stock.
          </p>
        </div>
      </div>
    )
  }

  const toggleMetric = (metricId: string) => {
    setExpandedMetric(expandedMetric === metricId ? null : metricId)
  }

  const getComparisonIcon = (comparison?: string) => {
    if (comparison === 'above') return <ArrowUpRight className="w-4 h-4 text-success-500" />
    if (comparison === 'below') return <ArrowDownRight className="w-4 h-4 text-destructive-500" />
    return <Minus className="w-4 h-4 text-neutral-400" />
  }

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-success-500" />
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-destructive-500" />
    return <Minus className="w-4 h-4 text-neutral-400" />
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to={`/stock/${ticker}`}
        className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {ticker.toUpperCase()} Analysis
      </Link>

      {/* Segment Header */}
      <div className="card">
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
              <h1 className="text-h2 text-neutral-900">{segment.name}</h1>
              <span className={cn(
                'px-3 py-1 rounded-full text-caption font-medium',
                segment.status === 'positive' && 'bg-success-100 text-success-700',
                segment.status === 'neutral' && 'bg-neutral-100 text-neutral-700',
                segment.status === 'negative' && 'bg-destructive-100 text-destructive-700'
              )}>
                {segment.status.charAt(0).toUpperCase() + segment.status.slice(1)}
              </span>
            </div>

            {/* Rankings and Comparisons */}
            <div className="flex flex-wrap gap-4 mb-4">
              {segment.sectorRank && segment.sectorTotal && (
                <RankingBadge
                  rank={segment.sectorRank}
                  total={segment.sectorTotal}
                  label="Sector Rank"
                />
              )}
              {segment.sectorAvg && (
                <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-xl">
                  <span className="text-caption text-neutral-500">Sector Avg:</span>
                  <span className={cn('font-semibold', getScoreColor(segment.sectorAvg))}>
                    {segment.sectorAvg}/10
                  </span>
                  <span className={cn(
                    'flex items-center gap-0.5 text-caption font-medium',
                    segment.score > segment.sectorAvg ? 'text-success-600' : segment.score < segment.sectorAvg ? 'text-destructive-500' : 'text-neutral-500'
                  )}>
                    {segment.score > segment.sectorAvg ? (
                      <>
                        <ArrowUpRight className="w-3 h-3" />
                        +{(segment.score - segment.sectorAvg).toFixed(1)}
                      </>
                    ) : segment.score < segment.sectorAvg ? (
                      <>
                        <ArrowDownRight className="w-3 h-3" />
                        {(segment.score - segment.sectorAvg).toFixed(1)}
                      </>
                    ) : (
                      <span>On par</span>
                    )}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-xl">
                <span className="text-caption text-neutral-500">Weight:</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${segment.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-caption font-medium text-neutral-700">
                    {Math.round(segment.weight * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interpretation */}
            <p className="text-body text-neutral-600 leading-relaxed">{segment.interpretation}</p>

            {/* Quick Insight */}
            {segment.quickInsight && (
              <div className="mt-4 p-3 bg-primary-50 rounded-xl border border-primary-100">
                <span className="text-body-sm text-primary-700">{segment.quickInsight}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Section */}
      {segment.metrics && segment.metrics.length > 0 && (
        <div className="card">
          <h2 className="text-h4 mb-6">Key Metrics</h2>
          <div className="space-y-4">
            {segment.metrics.map((metric: Metric) => (
              <div
                key={metric.id}
                className="rounded-xl border border-neutral-200 overflow-hidden transition-all duration-250 hover:border-neutral-300"
              >
                {/* Metric Header - Always visible */}
                <button
                  onClick={() => toggleMetric(metric.id)}
                  className="w-full p-4 flex items-center gap-4 bg-white hover:bg-neutral-50 transition-colors"
                >
                  {/* Status indicator */}
                  <span className={cn(
                    'w-3 h-3 rounded-full flex-shrink-0',
                    metric.status === 'excellent' && 'bg-success-500',
                    metric.status === 'good' && 'bg-success-400',
                    (metric.status === 'positive') && 'bg-success-400',
                    (metric.status === 'fair' || metric.status === 'neutral') && 'bg-neutral-400',
                    (metric.status === 'poor' || metric.status === 'negative') && 'bg-destructive-500'
                  )} />

                  {/* Metric name and value */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-900">{metric.name}</span>
                      {metric.trend && getTrendIcon(metric.trend)}
                    </div>
                    {metric.tooltipSimple && (
                      <p className="text-caption text-neutral-500 mt-0.5">{metric.tooltipSimple}</p>
                    )}
                  </div>

                  {/* Value display */}
                  <div className="flex items-center gap-4">
                    {/* Mini sparkline if trend data exists */}
                    {metric.trend5Y && metric.trend5Y.length > 0 && (
                      <div className="hidden md:block">
                        <SparklineChart
                          data={metric.trend5Y}
                          width={64}
                          height={24}
                          showArea
                        />
                      </div>
                    )}

                    {/* Value and comparison */}
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-h5 font-semibold text-neutral-900">{metric.displayValue}</span>
                        {metric.comparison && getComparisonIcon(metric.comparison)}
                      </div>
                      {metric.sectorAvgDisplay && (
                        <span className="text-caption text-neutral-500">
                          Sector: {metric.sectorAvgDisplay}
                        </span>
                      )}
                    </div>

                    {/* Percentile badge */}
                    {metric.percentile && (
                      <div className={cn(
                        'hidden md:flex px-2 py-1 rounded-lg text-caption font-medium',
                        metric.percentile >= 75 && 'bg-success-100 text-success-700',
                        metric.percentile >= 50 && metric.percentile < 75 && 'bg-success-50 text-success-600',
                        metric.percentile >= 25 && metric.percentile < 50 && 'bg-warning-100 text-warning-700',
                        metric.percentile < 25 && 'bg-destructive-100 text-destructive-700'
                      )}>
                        P{metric.percentile}
                      </div>
                    )}

                    {/* Expand/collapse icon */}
                    {expandedMetric === metric.id ? (
                      <ChevronUp className="w-5 h-5 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {expandedMetric === metric.id && (
                  <div className="px-4 pb-4 bg-neutral-50 animate-fade-in">
                    <div className="pt-4 border-t border-neutral-200">
                      {/* Visual comparison bar */}
                      {typeof metric.value === 'number' && typeof metric.sectorAvg === 'number' && (
                        <div className="mb-4">
                          <MetricBar
                            value={metric.value}
                            sectorAvg={metric.sectorAvg}
                            label={metric.name}
                            unit={metric.unit}
                          />
                        </div>
                      )}

                      {/* 5-Year Trend Chart */}
                      {metric.trend5Y && metric.trend5Y.length > 0 && (
                        <div className="mb-4 p-4 bg-white rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-body-sm font-medium text-neutral-700">5-Year Trend</span>
                            <span className={cn(
                              'text-caption font-medium flex items-center gap-1',
                              metric.trend === 'improving' ? 'text-success-600' : metric.trend === 'declining' ? 'text-destructive-500' : 'text-neutral-500'
                            )}>
                              {metric.trend === 'improving' && <><TrendingUp className="w-3 h-3" /> Improving</>}
                              {metric.trend === 'declining' && <><TrendingDown className="w-3 h-3" /> Declining</>}
                              {metric.trend === 'stable' && 'Stable'}
                            </span>
                          </div>
                          <SparklineChart
                            data={metric.trend5Y}
                            width={280}
                            height={60}
                            showArea
                            showDots
                          />
                          <div className="flex justify-between mt-2 text-caption text-neutral-400">
                            <span>5Y Ago</span>
                            <span>Current</span>
                          </div>
                        </div>
                      )}

                      {/* Advanced tooltip explanation */}
                      {metric.tooltipAdvanced && (
                        <div className="mb-4 p-3 bg-white rounded-xl">
                          <span className="text-caption font-medium text-neutral-500 uppercase tracking-wider">Deep Dive</span>
                          <p className="text-body-sm text-neutral-700 mt-1">{metric.tooltipAdvanced}</p>
                        </div>
                      )}

                      {/* Citation */}
                      {metric.citation && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl">
                          <div className="flex-1">
                            <span className="text-caption font-medium text-neutral-500 uppercase tracking-wider">Source</span>
                            <p className="text-body-sm text-neutral-700 mt-1">
                              {metric.citation.document}
                              {metric.citation.page && `, Page ${metric.citation.page}`}
                            </p>
                            <p className="text-caption text-neutral-500">{metric.citation.date}</p>
                          </div>
                          {metric.citation.url && (
                            <a
                              href={metric.citation.url}
                              className="btn-ghost text-body-sm flex items-center gap-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plain English Explanation */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border border-primary-100">
        <h3 className="text-h4 text-primary-800 mb-3 flex items-center gap-2">
          <Info className="w-5 h-5" />
          What This Means for You
        </h3>
        <p className="text-body text-primary-700 leading-relaxed">
          {getExplanationForSegment(segment, currentProfile.experienceLevel, stockName)}
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-4">
        <Link to={`/stock/${ticker}`} className="btn-secondary flex-1 text-center">
          Back to Overview
        </Link>
        <Link to="/chat" className="btn-primary flex-1 text-center">
          Ask AI About {segment.name}
        </Link>
      </div>
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
