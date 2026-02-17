/**
 * MetricCatalogBrowser — Stage 1: Browse, search, and select metrics
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { METRIC_CATALOG, getCategories, searchMetrics } from '@/data/metricCatalog'
import type { MetricCatalogEntry } from '@/types/scoring'
import { Search, Plus, ChevronDown, ChevronRight, ArrowUpDown } from 'lucide-react'

interface MetricCatalogBrowserProps {
  onSelectMetric: (metric: MetricCatalogEntry) => void
  selectedMetricIds?: Set<string>
}

export function MetricCatalogBrowser({ onSelectMetric, selectedMetricIds = new Set() }: MetricCatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(getCategories()))

  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return METRIC_CATALOG
    return searchMetrics(searchQuery)
  }, [searchQuery])

  const groupedMetrics = useMemo(() => {
    const groups: Record<string, MetricCatalogEntry[]> = {}
    for (const metric of filteredMetrics) {
      if (!groups[metric.category]) groups[metric.category] = []
      groups[metric.category].push(metric)
    }
    return groups
  }, [filteredMetrics])

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search metrics..."
          className="w-full pl-9 pr-3 py-2 bg-dark-800/60 border border-white/10 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/40"
        />
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {Object.entries(groupedMetrics).map(([category, metrics]) => {
          const isExpanded = expandedCategories.has(category)
          return (
            <div key={category}>
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-dark-700/60 transition-colors"
              >
                <span className="uppercase tracking-wider">{category}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-neutral-500">{metrics.length}</span>
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    {metrics.map(metric => {
                      const isSelected = selectedMetricIds.has(metric.id)
                      return (
                        <button
                          key={metric.id}
                          onClick={() => !isSelected && onSelectMetric(metric)}
                          disabled={isSelected}
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors',
                            isSelected
                              ? 'bg-primary-500/10 text-primary-400/60 cursor-default'
                              : 'text-neutral-300 hover:bg-dark-700/60 cursor-pointer',
                          )}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-medium">{metric.name}</div>
                            <div className="text-xs text-neutral-400 truncate">{metric.description}</div>
                          </div>
                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <span className="text-xs text-neutral-500 uppercase">{metric.unit}</span>
                            {metric.higherIsBetter != null && (
                              <ArrowUpDown className="w-3 h-3 text-neutral-500" />
                            )}
                            {!isSelected && <Plus className="w-3.5 h-3.5 text-neutral-400" />}
                            {isSelected && <span className="text-xs text-primary-400">Added</span>}
                          </div>
                        </button>
                      )
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
