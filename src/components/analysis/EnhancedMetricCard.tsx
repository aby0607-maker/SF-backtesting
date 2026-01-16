import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink, TrendingUp, TrendingDown, Minus, Info, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SparklineChart } from '@/components/charts'
import { TrendIntelligenceModal } from './TrendIntelligenceModal'
import { EvidenceChainPanel } from './EvidenceChainPanel'
import type { Metric, EnhancedMetric, TrendIntelligence, GroundingSource } from '@/types'

interface EnhancedMetricCardProps {
  metric: Metric | EnhancedMetric
  stockName?: string
  hideStatus?: boolean // Hide status badges for DIY mode
}

export function EnhancedMetricCard({ metric, stockName = 'Stock', hideStatus = false }: EnhancedMetricCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTrendModal, setShowTrendModal] = useState(false)

  const enhancedMetric = metric as EnhancedMetric

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case 'good':
      case 'positive':
        return 'bg-success-500/20 text-success-400 border-success-500/30'
      case 'fair':
      case 'neutral':
        return 'bg-warning-500/20 text-warning-400 border-warning-500/30'
      case 'poor':
      case 'negative':
        return 'bg-destructive-500/20 text-destructive-400 border-destructive-500/30'
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
    }
  }

  const getTrendIcon = (trend?: string) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-success-400" />
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-destructive-400" />
    return <Minus className="w-4 h-4 text-neutral-500" />
  }

  // Generate mock trend intelligence if not present but has trend5Y data
  const trendIntelligence: TrendIntelligence | undefined = enhancedMetric.trendIntelligence || (
    metric.trend5Y && metric.trend5Y.length > 0 ? {
      currentValue: metric.value,
      displayValue: metric.displayValue,
      status: metric.status as 'excellent' | 'good' | 'fair' | 'poor',
      peerBenchmark: metric.sectorAvg || 0,
      peerBenchmarkDisplay: metric.sectorAvgDisplay || String(metric.sectorAvg),
      sectorPercentile: metric.percentile || 50,
      trajectory: metric.trend === 'improving' ? 'up' : metric.trend === 'declining' ? 'down' : 'neutral',
      trajectoryPeriods: 5,
      verificationStatus: 'active',
      historicalData: metric.trend5Y.map((val, idx) => ({
        period: `Y${idx + 1}`,
        value: typeof val === 'number' ? val : parseFloat(String(val)) || 0,
        displayValue: String(val)
      }))
    } : undefined
  )

  // Generate mock grounding sources if not present but has citation
  const groundingSources: GroundingSource[] = enhancedMetric.groundingSources || (
    metric.citation ? [{
      name: metric.citation.source || 'Company Filings',
      url: metric.citation.url || '#',
      type: 'primary' as const
    }] : []
  )

  return (
    <>
      <div className="rounded-xl border border-white/10 overflow-hidden bg-dark-800/50 hover:border-white/20 transition-all">
        {/* Header Row - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 text-left"
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left: Metric name and info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h4 className="text-white font-semibold uppercase tracking-wide text-sm">
                  {metric.name}
                </h4>
                <Info className="w-4 h-4 text-neutral-500" />
                {enhancedMetric.liveAdjustEnabled && (
                  <span className="px-2 py-0.5 bg-primary-500/20 text-primary-400 text-[10px] font-medium rounded border border-primary-500/30">
                    LIVE ADJUST
                  </span>
                )}
              </div>
            </div>

            {/* Right: Value and status */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">{metric.displayValue}</span>
              {!hideStatus && (
                <span className={cn(
                  'px-2.5 py-1 rounded text-xs font-semibold uppercase border',
                  getStatusBadgeClass(metric.status)
                )}>
                  {metric.status}
                </span>
              )}
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-neutral-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-neutral-500" />
              )}
            </div>
          </div>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4 animate-fade-in">
            {/* Contextual Explanation */}
            {(enhancedMetric.contextualExplanation || metric.tooltipSimple) && (
              <div className="text-neutral-300 text-sm leading-relaxed italic">
                "{enhancedMetric.contextualExplanation || metric.tooltipSimple}"
              </div>
            )}

            {/* Grounding Sources */}
            {groundingSources.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-neutral-500">
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Grounding Sources
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {groundingSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 rounded-lg text-primary-400 text-sm transition-colors border border-white/10"
                    >
                      {source.name}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Benchmark and Trend Intelligence Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Benchmark Card */}
              <div className="bg-dark-700/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider block">
                      Benchmark
                    </span>
                    <span className="text-2xl font-bold text-white mt-1 block">
                      {metric.sectorAvgDisplay || metric.sectorAvg || 'N/A'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-neutral-500 uppercase tracking-wider block">
                      Sector Rank
                    </span>
                    <span className="text-primary-400 font-bold mt-1 block">
                      {metric.percentile ? `${metric.percentile}TH` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Trend Intelligence Card */}
              <div className="bg-dark-700/50 rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-primary-400 text-xs font-semibold uppercase tracking-wider block">
                      Trend Intelligence
                    </span>
                    <span className="text-neutral-400 text-xs mt-1 block">
                      Launch History
                    </span>
                  </div>
                  {metric.trend5Y && metric.trend5Y.length > 0 && (
                    <div className="flex items-center gap-3">
                      {/* Mini bar chart */}
                      <div className="flex items-end gap-0.5 h-8">
                        {(metric.trend5Y || []).slice(-5).map((val, i) => {
                          const numVal = typeof val === 'number' ? val : parseFloat(String(val)) || 0
                          const trendArr = metric.trend5Y || []
                          const maxVal = Math.max(...trendArr.map(v => typeof v === 'number' ? v : parseFloat(String(v)) || 0))
                          const height = maxVal > 0 ? (numVal / maxVal) * 100 : 50
                          return (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-primary-600 to-primary-400 rounded-t"
                              style={{ height: `${Math.max(height, 20)}%` }}
                            />
                          )
                        })}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setShowTrendModal(true)
                        }}
                        className="text-primary-400 text-sm hover:text-primary-300 transition-colors"
                      >
                        View →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 5-Year Trend Sparkline */}
            {metric.trend5Y && metric.trend5Y.length > 0 && (
              <div className="bg-dark-700/30 rounded-xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-neutral-400">5-Year Trend</span>
                  <span className={cn(
                    'text-xs font-medium flex items-center gap-1',
                    metric.trend === 'improving' ? 'text-success-400' : metric.trend === 'declining' ? 'text-destructive-400' : 'text-neutral-400'
                  )}>
                    {getTrendIcon(metric.trend)}
                    {metric.trend ? metric.trend.charAt(0).toUpperCase() + metric.trend.slice(1) : 'Stable'}
                  </span>
                </div>
                <SparklineChart
                  data={metric.trend5Y.map(v => typeof v === 'number' ? v : parseFloat(String(v)) || 0)}
                  width={280}
                  height={60}
                  showArea
                  showDots
                />
                <div className="flex justify-between mt-2 text-[10px] text-neutral-500">
                  <span>5Y Ago</span>
                  <span>Current</span>
                </div>
              </div>
            )}

            {/* 3-Level Evidence Chain (A9) */}
            {(metric.citation || enhancedMetric.evidenceChain) && (
              <EvidenceChainPanel
                evidenceChain={enhancedMetric.evidenceChain}
                citation={metric.citation}
                metricName={metric.name}
              />
            )}
          </div>
        )}
      </div>

      {/* Trend Intelligence Modal */}
      {trendIntelligence && (
        <TrendIntelligenceModal
          isOpen={showTrendModal}
          onClose={() => setShowTrendModal(false)}
          metricName={metric.name}
          stockName={stockName}
          trendData={trendIntelligence}
        />
      )}
    </>
  )
}
