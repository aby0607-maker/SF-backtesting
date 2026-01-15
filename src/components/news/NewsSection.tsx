import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle, CheckCircle, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getLatestNews, formatNewsTime, getCategoryLabel, type NewsItem } from '@/data/news'

interface NewsSectionProps {
  stockId: string
  stockName?: string
  limit?: number
  showSegmentLinks?: boolean
  compact?: boolean
}

export function NewsSection({
  stockId,
  stockName = 'Stock',
  limit = 5,
  showSegmentLinks = true,
  compact = false,
}: NewsSectionProps) {
  const [expandedNewsId, setExpandedNewsId] = useState<string | null>(null)
  const news = getLatestNews(stockId, limit)

  if (news.length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Newspaper className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Latest News</h3>
        </div>
        <p className="text-neutral-500 text-center py-6">No recent news available for {stockName}</p>
      </div>
    )
  }

  const getSentimentIcon = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-success-400" />
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-destructive-400" />
      default:
        return <Minus className="w-4 h-4 text-neutral-400" />
    }
  }

  const getSentimentBadgeClass = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case 'negative':
        return 'bg-destructive-500/20 text-destructive-400 border-destructive-500/30'
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  const getImportanceIcon = (importance: NewsItem['importance']) => {
    switch (importance) {
      case 'high':
        return <AlertTriangle className="w-3 h-3 text-warning-400" />
      case 'medium':
        return <CheckCircle className="w-3 h-3 text-primary-400" />
      default:
        return null
    }
  }

  const getCategoryColor = (category: NewsItem['category']) => {
    const colors: Record<NewsItem['category'], string> = {
      earnings: 'text-success-400',
      management: 'text-info-400',
      sector: 'text-warning-400',
      regulatory: 'text-destructive-400',
      product: 'text-primary-400',
      market: 'text-neutral-400',
    }
    return colors[category]
  }

  // Map segment IDs to display names and routes
  const getSegmentInfo = (segmentId: string) => {
    const segmentMap: Record<string, { name: string; id: string }> = {
      profitability: { name: 'Profitability', id: 'profitability' },
      financial_ratios: { name: 'Financial Ratios', id: 'financial-ratios' },
      growth: { name: 'Growth', id: 'growth' },
      valuation: { name: 'Valuation', id: 'valuation' },
      price_volume: { name: 'Price & Volume', id: 'price-volume' },
      technical: { name: 'Technical', id: 'technical' },
      broker_ratings: { name: 'Broker Ratings', id: 'broker-ratings' },
      ownership: { name: 'Ownership', id: 'ownership' },
      stock_deals: { name: 'Stock Deals', id: 'stock-deals' },
      income_statement: { name: 'Income Statement', id: 'income-statement' },
      balance_sheet: { name: 'Balance Sheet', id: 'balance-sheet' },
    }
    return segmentMap[segmentId] || { name: segmentId, id: segmentId }
  }

  return (
    <div className={cn('card', compact && 'p-4')}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Newspaper className="w-5 h-5 text-primary-400" />
          <h3 className="text-lg font-semibold text-white">Latest News & Signals</h3>
        </div>
        <span className="text-xs text-neutral-500">{news.length} items</span>
      </div>

      <div className="space-y-3">
        {news.map((item) => (
          <div
            key={item.id}
            className={cn(
              'rounded-xl border border-white/10 overflow-hidden transition-all',
              expandedNewsId === item.id ? 'bg-dark-700/50' : 'bg-dark-800/50 hover:border-white/20'
            )}
          >
            {/* News Header */}
            <button
              onClick={() => setExpandedNewsId(expandedNewsId === item.id ? null : item.id)}
              className="w-full p-4 text-left"
            >
              <div className="flex items-start gap-3">
                {/* Sentiment Indicator */}
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                  item.sentiment === 'positive' && 'bg-success-500/20',
                  item.sentiment === 'negative' && 'bg-destructive-500/20',
                  item.sentiment === 'neutral' && 'bg-neutral-500/20',
                )}>
                  {getSentimentIcon(item.sentiment)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-medium', getCategoryColor(item.category))}>
                      {getCategoryLabel(item.category)}
                    </span>
                    {item.importance === 'high' && (
                      <span className="flex items-center gap-1 text-[10px] text-warning-400 bg-warning-500/20 px-1.5 py-0.5 rounded">
                        {getImportanceIcon(item.importance)}
                        Important
                      </span>
                    )}
                  </div>

                  <h4 className="text-white font-medium text-sm leading-snug line-clamp-2">
                    {item.headline}
                  </h4>

                  <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
                    <span>{item.source}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatNewsTime(item.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Sentiment Badge */}
                <span className={cn(
                  'px-2 py-1 rounded text-[10px] font-medium uppercase border flex-shrink-0',
                  getSentimentBadgeClass(item.sentiment)
                )}>
                  {item.sentiment}
                </span>
              </div>
            </button>

            {/* Expanded Content */}
            {expandedNewsId === item.id && (
              <div className="px-4 pb-4 animate-fade-in">
                <div className="border-t border-white/10 pt-4">
                  {/* Summary */}
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                    {item.summary}
                  </p>

                  {/* Affected Segments */}
                  {showSegmentLinks && item.impactSegments.length > 0 && (
                    <div className="mb-4">
                      <span className="text-xs text-neutral-500 uppercase tracking-wider block mb-2">
                        Impacts Analysis
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {item.impactSegments.map((segmentId) => {
                          const segment = getSegmentInfo(segmentId)
                          return (
                            <Link
                              key={segmentId}
                              to={`/segment/${stockId}/${segment.id}`}
                              className="px-3 py-1.5 bg-primary-500/20 text-primary-400 rounded-lg text-xs hover:bg-primary-500/30 transition-colors"
                            >
                              {segment.name} →
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* External Link */}
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-dark-600 hover:bg-dark-500 text-white rounded-lg text-sm transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Read Full Article
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// Compact news card for dashboard/sidebar
interface NewsCardProps {
  item: NewsItem
  stockId?: string // Optional - used for linking to stock page if needed
}

export function NewsCard({ item }: NewsCardProps) {
  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'border-l-success-500'
      case 'negative':
        return 'border-l-destructive-500'
      default:
        return 'border-l-neutral-500'
    }
  }

  return (
    <div className={cn(
      'p-3 bg-dark-800/50 rounded-lg border-l-2',
      getSentimentColor(item.sentiment)
    )}>
      <div className="flex items-center gap-2 mb-1 text-xs">
        <span className="text-primary-400 font-medium">{getCategoryLabel(item.category)}</span>
        <span className="text-neutral-500">•</span>
        <span className="text-neutral-500">{formatNewsTime(item.timestamp)}</span>
      </div>
      <p className="text-white text-sm line-clamp-2">{item.headline}</p>
    </div>
  )
}
