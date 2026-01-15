import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, ChevronRight, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getScoreColor, getVerdictBadgeClass } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { SkeletonScoreRing, Skeleton } from '@/components/ui'
import { ScoreRing, RankingBadge, SegmentRadar } from '@/components/charts'
import type { Stock, StockVerdict } from '@/types'

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
      <div className="space-y-6 animate-fade-in">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <Skeleton className="w-48 h-8" />
              <Skeleton className="w-32 h-4" />
            </div>
          </div>
          <Skeleton className="w-24 h-10 mb-6" />
          <div className="p-6 bg-neutral-50 rounded-xl flex justify-center">
            <SkeletonScoreRing />
          </div>
        </div>

        <div className="card">
          <Skeleton className="w-32 h-6 mb-4" />
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="w-full h-16 mb-2" variant="rectangular" />
          ))}
        </div>
      </div>
    )
  }

  // Stock not found
  if (!stock || !verdict) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="card text-center py-12">
          <h2 className="text-h3 mb-2">Stock Not Found</h2>
          <p className="text-neutral-500">
            We couldn't find analysis for "{ticker.toUpperCase()}"
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-body-sm text-neutral-500 hover:text-neutral-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Stock Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-h2 text-neutral-900">{stock.name}</h1>
            <p className="text-body text-neutral-500 mt-1">
              {stock.sector} • {stock.symbol}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-icon" aria-label="Share">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="btn-icon" aria-label="Save">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3 mb-8">
          <span className="text-display text-neutral-900">{formatCurrency(stock.currentPrice)}</span>
          <span className={cn(
            'text-body-lg font-medium flex items-center gap-1',
            stock.changePercent >= 0 ? 'text-success-600' : 'text-destructive-500'
          )}>
            {stock.changePercent >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {formatPercent(stock.changePercent)}
          </span>
        </div>

        {/* Verdict Hero - Visual Score Display */}
        <div className="p-6 bg-gradient-to-br from-neutral-50 to-neutral-100/50 rounded-2xl animate-scale-in">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Score Ring */}
            <div className="flex-shrink-0">
              <ScoreRing
                score={verdict.overallScore}
                size={160}
                showLabel
                label="Overall Score"
              />
            </div>

            {/* Verdict Details */}
            <div className="flex-1 text-center md:text-left">
              <span className={cn('badge text-body-sm mb-4 inline-block', getVerdictBadgeClass(verdict.verdict))}>
                {verdict.verdict}
              </span>

              {/* Rankings */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                <RankingBadge
                  rank={verdict.peerRank}
                  total={verdict.peerTotal}
                  label={verdict.peerCategory || verdict.peerGroup || 'Peer Group'}
                />
                {verdict.sectorRank && verdict.sectorTotal && (
                  <RankingBadge
                    rank={verdict.sectorRank}
                    total={verdict.sectorTotal}
                    label={stock.sector}
                  />
                )}
              </div>

              {/* Sector Average Comparison */}
              {verdict.sectorAvgScore && (
                <div className="flex items-center justify-center md:justify-start gap-2 text-body-sm mb-4">
                  <span className="text-neutral-500">Sector Avg:</span>
                  <span className={cn('font-semibold', getScoreColor(verdict.sectorAvgScore))}>
                    {verdict.sectorAvgScore}/10
                  </span>
                  <span className={cn(
                    'flex items-center gap-0.5 font-medium',
                    verdict.overallScore > verdict.sectorAvgScore ? 'text-success-600' : 'text-destructive-500'
                  )}>
                    {verdict.overallScore > verdict.sectorAvgScore ? (
                      <>
                        <ArrowUpRight className="w-4 h-4" />
                        +{(verdict.overallScore - verdict.sectorAvgScore).toFixed(1)}
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-4 h-4" />
                        {(verdict.overallScore - verdict.sectorAvgScore).toFixed(1)}
                      </>
                    )}
                  </span>
                </div>
              )}

              <p className="text-body text-neutral-600 leading-relaxed">
                {verdict.verdictRationale}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Red Flags */}
      {verdict.redFlags && verdict.redFlags.length > 0 && (
        <div className="card border-2 border-warning-200 bg-gradient-to-br from-warning-50 to-white animate-slide-up">
          <h2 className="text-h4 flex items-center gap-2 text-warning-700 mb-4">
            <AlertTriangle className="w-5 h-5" />
            Risk Alerts ({verdict.redFlags.length})
          </h2>
          <div className="space-y-3">
            {verdict.redFlags.map((flag) => (
              <div key={flag.id} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-xs">
                <span
                  className={cn(
                    'px-2 py-0.5 text-caption font-semibold rounded-md',
                    flag.severity === 'critical' && 'bg-destructive-500 text-white',
                    flag.severity === 'high' && 'bg-warning-500 text-white',
                    flag.severity === 'medium' && 'bg-warning-200 text-warning-800'
                  )}
                >
                  {flag.severity.toUpperCase()}
                </span>
                <div className="flex-1">
                  <span className="font-medium text-neutral-900">{flag.title}</span>
                  <p className="text-body-sm text-neutral-500 mt-0.5">{flag.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Signals & Concerns Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Signals */}
        <div className="card">
          <h2 className="text-h4 mb-4 text-success-600 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Signals
          </h2>
          <div className="space-y-3">
            {verdict.topSignals.map((signal, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-success-50/50 rounded-xl animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="w-7 h-7 rounded-full bg-success-100 text-success-700 flex items-center justify-center font-semibold text-body-sm flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-neutral-900">{signal.title}</div>
                  <div className="text-body-sm text-neutral-500 mt-0.5">{signal.description}</div>
                  {signal.metric && signal.value && (
                    <div className="flex items-center gap-2 text-caption text-success-600 mt-2 bg-success-100 px-2 py-1 rounded-md w-fit">
                      <span className="font-medium">{signal.metric}:</span>
                      <span>{signal.value}</span>
                      {signal.benchmark && (
                        <span className="text-neutral-500">(vs {signal.benchmark})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Concerns */}
        {verdict.topConcerns && verdict.topConcerns.length > 0 && (
          <div className="card">
            <h2 className="text-h4 mb-4 text-destructive-500 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Key Concerns
            </h2>
            <div className="space-y-3">
              {verdict.topConcerns.map((concern, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 bg-destructive-50/50 rounded-xl animate-fade-up"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className="w-7 h-7 rounded-full bg-destructive-100 text-destructive-700 flex items-center justify-center font-semibold text-body-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-neutral-900">{concern.title}</div>
                    <div className="text-body-sm text-neutral-500 mt-0.5">{concern.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Segment Analysis with Radar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h4">11-Segment Analysis</h2>
          <span className="text-caption text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
            Personalized for {currentProfile.investmentThesis} investor
          </span>
        </div>

        {/* Radar Chart */}
        <div className="mb-6 p-4 bg-neutral-50 rounded-2xl">
          <SegmentRadar segments={verdict.segments} size={280} />
        </div>

        {/* Segment List */}
        <div className="space-y-2">
          {verdict.segments.map((segment, index) => (
            <Link
              key={segment.id}
              to={`/segment/${ticker}/${segment.id}`}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-all duration-250 group animate-fade-up border border-transparent hover:border-neutral-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'w-3 h-3 rounded-full',
                    segment.status === 'positive' && 'bg-success-500',
                    segment.status === 'neutral' && 'bg-neutral-400',
                    segment.status === 'negative' && 'bg-destructive-500'
                  )}
                />
                <div>
                  <span className="font-medium text-neutral-900">{segment.name}</span>
                  {segment.quickInsight && (
                    <p className="text-caption text-neutral-500 mt-0.5">{segment.quickInsight}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Score with Sector Comparison */}
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={cn('text-h5 font-semibold', getScoreColor(segment.score))}>
                      {segment.score}
                    </span>
                    <span className="text-body-sm text-neutral-400">/10</span>
                  </div>
                  {segment.sectorAvg && (
                    <div className="flex items-center gap-1 text-caption mt-0.5">
                      <span className="text-neutral-400">Sector: {segment.sectorAvg}</span>
                      {segment.score > segment.sectorAvg ? (
                        <ArrowUpRight className="w-3 h-3 text-success-500" />
                      ) : segment.score < segment.sectorAvg ? (
                        <ArrowDownRight className="w-3 h-3 text-destructive-500" />
                      ) : (
                        <Minus className="w-3 h-3 text-neutral-400" />
                      )}
                    </div>
                  )}
                </div>

                {/* Sector Rank Badge */}
                {segment.sectorRank && segment.sectorTotal && (
                  <div className="hidden md:flex flex-col items-center px-3 py-1 bg-neutral-100 rounded-lg">
                    <span className="text-caption font-semibold text-neutral-700">
                      #{segment.sectorRank}
                    </span>
                    <span className="text-caption text-neutral-400">of {segment.sectorTotal}</span>
                  </div>
                )}

                {/* Weight indicator */}
                <div className="hidden md:flex items-center gap-2 min-w-16">
                  <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full"
                      style={{ width: `${segment.weight * 100}%` }}
                    />
                  </div>
                  <span className="text-caption text-neutral-400 w-8">
                    {Math.round(segment.weight * 100)}%
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-neutral-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Position Guidance */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border border-primary-100">
        <h2 className="text-h4 mb-4 text-primary-700">Position Guidance</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-white rounded-xl shadow-xs">
            <span className="text-overline text-neutral-500 uppercase tracking-wider">Position Size</span>
            <p className="text-body font-medium text-neutral-900 mt-2">{verdict.positionSizing}</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-xs">
            <span className="text-overline text-neutral-500 uppercase tracking-wider">Entry Strategy</span>
            <p className="text-body font-medium text-neutral-900 mt-2">{verdict.entryGuidance}</p>
          </div>
        </div>
      </div>

      {/* Learning Prompt */}
      {verdict.learningPrompt && (
        <div className="card bg-gradient-to-br from-info-50 to-white border border-info-100">
          <h2 className="text-h5 mb-2 text-info-700">Learning Opportunity</h2>
          <p className="text-body text-neutral-600">{verdict.learningPrompt}</p>
        </div>
      )}

      {/* CTA */}
      <div className="flex gap-4">
        <button className="btn-primary flex-1">Add to Watchlist</button>
        <Link to="/chat" className="btn-secondary flex-1 text-center">
          Ask AI about {stock.symbol}
        </Link>
      </div>
    </div>
  )
}
