import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown, TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react'
import type { StockVerdict } from '@/types'

interface KeyMetricsCardProps {
  verdict: StockVerdict
  className?: string
}

// Key metrics categories for DIY analysis
const metricCategories = [
  {
    key: 'governance',
    label: 'Governance & Compliance',
    description: 'Regulatory and management indicators',
    metrics: [
      { id: 'asm', label: 'ASM/GSM Status', benchmark: 'Not on list' },
      { id: 'pledge', label: 'Promoter Pledging', benchmark: '<20%' },
      { id: 'audit', label: 'Audit Opinion', benchmark: 'Unqualified' },
      { id: 'sebi', label: 'SEBI Orders', benchmark: 'None active' },
    ]
  },
  {
    key: 'financial',
    label: 'Financial Health',
    description: 'Debt and cash flow indicators',
    metrics: [
      { id: 'icr', label: 'Interest Coverage Ratio', benchmark: '>1.5x' },
      { id: 'debt-equity', label: 'Debt to Equity', benchmark: '<1.0x' },
      { id: 'ocf', label: 'Operating Cash Flow', benchmark: 'Positive' },
      { id: 'working-cap', label: 'Working Capital', benchmark: 'Positive' },
    ]
  },
  {
    key: 'ownership',
    label: 'Ownership Patterns',
    description: 'Shareholding and institutional activity',
    metrics: [
      { id: 'promoter-stake', label: 'Promoter Stake Change (6M)', benchmark: 'Stable or ↑' },
      { id: 'fii-dii', label: 'FII + DII Change (3M)', benchmark: 'Stable or ↑' },
      { id: 'insider-txn', label: 'Insider Transactions', benchmark: 'No selling' },
    ]
  },
  {
    key: 'quality',
    label: 'Earnings Quality',
    description: 'Revenue and profit indicators',
    metrics: [
      { id: 'rpt', label: 'Related Party Transactions', benchmark: '<10% revenue' },
      { id: 'receivables', label: 'Receivables vs Revenue Growth', benchmark: 'Aligned' },
      { id: 'contingent', label: 'Contingent Liabilities', benchmark: '<20% net worth' },
    ]
  },
]

// Generate mock current values based on verdict
function getCurrentValues(_verdict: StockVerdict) {
  // In real app, these would come from actual data
  // For demo, we generate realistic values based on verdict data

  return {
    'asm': { value: 'Clear', trend: 'neutral' as const },
    'pledge': { value: '0%', trend: 'positive' as const },
    'audit': { value: 'Unqualified', trend: 'positive' as const },
    'sebi': { value: 'None', trend: 'positive' as const },
    'icr': { value: '∞ (No debt)', trend: 'positive' as const },
    'debt-equity': { value: '0.0x', trend: 'positive' as const },
    'ocf': { value: '₹2,450 Cr', trend: 'positive' as const },
    'working-cap': { value: '₹1,200 Cr', trend: 'positive' as const },
    'promoter-stake': { value: 'Stable', trend: 'neutral' as const },
    'fii-dii': { value: '+0.8%', trend: 'positive' as const },
    'insider-txn': { value: 'None', trend: 'neutral' as const },
    'rpt': { value: '3%', trend: 'positive' as const },
    'receivables': { value: 'Aligned', trend: 'positive' as const },
    'contingent': { value: '5%', trend: 'positive' as const },
  }
}

/**
 * Key Metrics Card (DIY Mode)
 * Shows raw metrics with sector benchmarks - NO interpretation or "red flag" labeling
 * User decides what's important based on the data
 */
export function KeyMetricsCard({ verdict, className }: KeyMetricsCardProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const currentValues = getCurrentValues(verdict)

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const getTrendIcon = (trend: 'positive' | 'negative' | 'neutral') => {
    switch (trend) {
      case 'positive':
        return <TrendingUp className="w-3 h-3 text-teal-400" />
      case 'negative':
        return <TrendingDown className="w-3 h-3 text-orange-400" />
      default:
        return <Minus className="w-3 h-3 text-neutral-500" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-dark-800 overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neutral-400" />
          <h3 className="font-semibold text-white">Key Metrics to Watch</h3>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          Raw data with sector benchmarks • Form your own conclusions
        </p>
      </div>

      {/* Categories */}
      <div className="p-2">
        {metricCategories.map(category => {
          const isExpanded = expandedCategories[category.key]

          return (
            <div key={category.key} className="mb-2 last:mb-0">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.key)}
                className="w-full p-3 flex items-center justify-between rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors"
              >
                <div className="text-left">
                  <span className="font-medium text-sm text-white">{category.label}</span>
                  <span className="text-[10px] text-neutral-500 block">{category.description}</span>
                </div>
                <ChevronDown className={cn(
                  'w-4 h-4 text-neutral-500 transition-transform',
                  isExpanded && 'rotate-180'
                )} />
              </button>

              {/* Expanded Metrics */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 space-y-2">
                      {category.metrics.map(metric => {
                        const current = currentValues[metric.id as keyof typeof currentValues]

                        return (
                          <div
                            key={metric.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg bg-dark-700/20"
                          >
                            <div className="flex-1">
                              <span className="text-sm text-neutral-300">{metric.label}</span>
                              <div className="text-[10px] text-neutral-500 mt-0.5">
                                Benchmark: {metric.benchmark}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {current?.value || 'N/A'}
                              </span>
                              {current && getTrendIcon(current.trend)}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-3 bg-dark-700/30 border-t border-white/5">
        <p className="text-[10px] text-neutral-500 text-center">
          Compare values against benchmarks to identify areas requiring deeper analysis
        </p>
      </div>
    </motion.div>
  )
}
