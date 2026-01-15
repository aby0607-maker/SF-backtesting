import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Share2, BookmarkPlus, AlertTriangle, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatCurrency, formatPercent, getScoreColor, getVerdictBadgeClass } from '@/lib/utils'
import { getStockBySymbol, getVerdictForStock } from '@/data'
import { SkeletonScoreRing, Skeleton } from '@/components/ui'
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
          className="inline-flex items-center gap-2 text-body-sm text-content-secondary hover:text-content transition-colors"
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
          <div className="p-6 bg-surface-secondary rounded-card flex justify-center">
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
          className="inline-flex items-center gap-2 text-body-sm text-content-secondary hover:text-content transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="card text-center py-12">
          <h2 className="text-h3 mb-2">Stock Not Found</h2>
          <p className="text-content-secondary">
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
        className="inline-flex items-center gap-2 text-body-sm text-content-secondary hover:text-content transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Stock Header */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-h2">{stock.name}</h1>
            <p className="text-body text-content-secondary">
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
          <span className="text-h1">{formatCurrency(stock.currentPrice)}</span>
          <span className={cn(
            'text-body-lg font-medium flex items-center gap-1',
            stock.changePercent >= 0 ? 'text-verdict-buy' : 'text-verdict-avoid'
          )}>
            {stock.changePercent >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {formatPercent(stock.changePercent)}
          </span>
        </div>

        {/* Verdict Hero */}
        <div className="p-6 bg-surface-secondary rounded-card animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-3">
                <span className={cn('text-display', getScoreColor(verdict.overallScore))}>
                  {verdict.overallScore}
                </span>
                <span className="text-h3 text-content-secondary">/10</span>
              </div>
              <span className={cn('badge text-body mt-2 inline-block', getVerdictBadgeClass(verdict.verdict))}>
                {verdict.verdict}
              </span>
            </div>
            <div className="text-right">
              <div className="text-h4">#{verdict.peerRank} of {verdict.peerTotal}</div>
              <div className="text-body-sm text-content-secondary">in {verdict.peerCategory || verdict.peerGroup || 'Peer Group'}</div>
            </div>
          </div>

          <p className="text-body text-content-secondary">
            {verdict.verdictRationale}
          </p>
        </div>
      </div>

      {/* Red Flags */}
      {verdict.redFlags && verdict.redFlags.length > 0 && (
        <div className="card border-2 border-alert-medium bg-amber-50 animate-slide-up">
          <h2 className="text-h4 flex items-center gap-2 text-alert-high mb-3">
            <AlertTriangle className="w-5 h-5" />
            Red Flags ({verdict.redFlags.length})
          </h2>
          <div className="space-y-3">
            {verdict.redFlags.map((flag) => (
              <div key={flag.id} className="flex items-start gap-2">
                <span
                  className={cn(
                    'px-2 py-0.5 text-caption font-medium rounded',
                    flag.severity === 'critical' && 'bg-destructive-500 text-white',
                    flag.severity === 'high' && 'bg-warning-500 text-white',
                    flag.severity === 'medium' && 'bg-warning-300 text-warning-900'
                  )}
                >
                  {flag.severity.toUpperCase()}
                </span>
                <div>
                  <span className="font-medium">{flag.title}</span>
                  <span className="text-content-secondary"> - {flag.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Signals */}
      <div className="card">
        <h2 className="text-h4 mb-4 text-verdict-buy">Top Signals</h2>
        <div className="space-y-3">
          {verdict.topSignals.map((signal, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-verdict-buy/5 rounded-lg animate-slide-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span className="text-verdict-buy font-bold text-lg">{i + 1}</span>
              <div>
                <div className="font-medium">{signal.title}</div>
                <div className="text-body-sm text-content-secondary">{signal.description}</div>
                {signal.metric && signal.value && (
                  <div className="text-caption text-primary-600 mt-1">
                    {signal.metric}: {signal.value}
                    {signal.benchmark && ` (vs ${signal.benchmark})`}
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
          <h2 className="text-h4 mb-4 text-verdict-avoid">Key Concerns</h2>
          <div className="space-y-3">
            {verdict.topConcerns.map((concern, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-verdict-avoid/5 rounded-lg animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <span className="text-verdict-avoid font-bold text-lg">{i + 1}</span>
                <div>
                  <div className="font-medium">{concern.title}</div>
                  <div className="text-body-sm text-content-secondary">{concern.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11 Segments */}
      <div className="card">
        <h2 className="text-h4 mb-4">11-Segment Analysis</h2>
        <div className="space-y-2">
          {verdict.segments.map((segment, index) => (
            <Link
              key={segment.id}
              to={`/segment/${ticker}/${segment.id}`}
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-surface-secondary transition-colors group animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    segment.status === 'positive' && 'bg-segment-positive',
                    segment.status === 'neutral' && 'bg-segment-neutral',
                    segment.status === 'negative' && 'bg-segment-negative'
                  )}
                />
                <span className="font-medium">{segment.name}</span>
                <span className="text-caption text-content-tertiary">
                  ({Math.round(segment.weight * 100)}% weight)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn('font-medium', getScoreColor(segment.score))}>
                  {segment.score}/10
                </span>
                <ChevronRight className="w-5 h-5 text-content-tertiary group-hover:text-primary-600 transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Position Guidance */}
      <div className="card bg-primary-50">
        <h2 className="text-h4 mb-3">Position Guidance</h2>
        <div className="space-y-2 text-body-sm">
          <p><strong>Position Size:</strong> {verdict.positionSizing}</p>
          <p><strong>Entry Strategy:</strong> {verdict.entryGuidance}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3">
        <button className="btn-primary flex-1">Add to Watchlist</button>
        <Link to="/chat" className="btn-secondary flex-1 text-center">
          Ask AI about {stock.symbol}
        </Link>
      </div>
    </div>
  )
}
