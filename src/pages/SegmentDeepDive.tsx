import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Info } from 'lucide-react'
import { cn, getScoreColor } from '@/lib/utils'

export function SegmentDeepDive() {
  const { ticker, segmentId } = useParams<{ ticker: string; segmentId: string }>()

  // Placeholder data - will be replaced with full mock data
  const segment = {
    id: segmentId,
    name: segmentId === 'profitability' ? 'Profitability' : segmentId === 'growth' ? 'Growth' : 'Valuation',
    score: 7.8,
    interpretation: 'Strong operational efficiency with improving margins quarter-over-quarter.',
    metrics: [
      { name: 'ROE', value: '18.3%', benchmark: '14.2%', benchmarkLabel: 'Sector Avg', status: 'positive', tooltip: 'Return on Equity measures profit generated per rupee of shareholder investment' },
      { name: 'Net Margin', value: '12.4%', benchmark: '10.5%', benchmarkLabel: 'Sector Avg', status: 'positive', tooltip: 'Net Profit Margin shows rupees earned per ₹100 of revenue' },
      { name: 'ROCE', value: '16.8%', benchmark: '15.0%', benchmarkLabel: 'Sector Avg', status: 'positive', tooltip: 'Return on Capital Employed measures efficiency of capital utilization' },
      { name: 'Operating Margin', value: '15.2%', benchmark: '14.0%', benchmarkLabel: 'Sector Avg', status: 'neutral', tooltip: 'Operating Profit Margin shows core business profitability' },
    ],
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <Link
        to={`/stock/${ticker}`}
        className="inline-flex items-center gap-2 text-body-sm text-content-secondary hover:text-content transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {ticker?.toUpperCase()} Analysis
      </Link>

      {/* Segment Header */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-h2">{segment.name}</h1>
          <div className="flex items-baseline gap-2">
            <span className={cn('text-h1', getScoreColor(segment.score))}>{segment.score}</span>
            <span className="text-h4 text-content-secondary">/10</span>
          </div>
        </div>
        <p className="text-body text-content-secondary">{segment.interpretation}</p>
      </div>

      {/* Metrics */}
      <div className="card">
        <h2 className="text-h4 mb-4">Metrics</h2>
        <div className="space-y-4">
          {segment.metrics.map((metric, i) => (
            <div key={i} className="p-4 bg-surface-secondary rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{metric.name}</span>
                  <button className="text-content-tertiary hover:text-content transition-colors" title={metric.tooltip}>
                    <Info className="w-4 h-4" />
                  </button>
                </div>
                <span
                  className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    metric.status === 'positive' && 'bg-segment-positive',
                    metric.status === 'neutral' && 'bg-segment-neutral',
                    metric.status === 'negative' && 'bg-segment-negative'
                  )}
                />
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-h3">{metric.value}</span>
                <span className="text-body-sm text-content-secondary">
                  vs {metric.benchmark} ({metric.benchmarkLabel})
                </span>
              </div>

              {/* Citation placeholder */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <button className="text-body-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  View Source: Annual Report FY24
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plain English Explanation */}
      <div className="card bg-primary-50 border-primary-100">
        <h3 className="text-h4 text-primary-800 mb-2">💡 What This Means</h3>
        <p className="text-body text-primary-700">
          This company is generating healthy profits relative to its peers. An ROE of 18.3% means for every ₹100 you invest as a shareholder, the company generates ₹18.30 in profit. This is above the sector average, indicating good management efficiency.
        </p>
      </div>
    </div>
  )
}
