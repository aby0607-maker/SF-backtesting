/**
 * MetricCatalogBrowser — Stage 1: Browse, search, and select metrics
 */

import { useState, useMemo, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { METRIC_CATALOG, getCategories } from '@/data/metricCatalog'
import type { MetricCatalogEntry, CustomMetricDefinition } from '@/types/scoring'
import { useCustomMetricDefinitions } from '@/store/useScoringStore'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { Search, Plus, ArrowUpDown } from 'lucide-react'

/** Convert a CustomMetricDefinition to a MetricCatalogEntry for display */
function toMetricCatalogEntry(def: CustomMetricDefinition): MetricCatalogEntry {
  return {
    id: def.id,
    name: def.name,
    description: def.description,
    cmots_source: def.cmots_source,
    cmots_field: def.cmots_field,
    unit: def.unit,
    category: def.category || 'Custom',
    typicalRange: def.typicalRange,
    higherIsBetter: def.higherIsBetter,
    isCustom: true,
    customDefinition: def,
  }
}

interface MetricCatalogBrowserProps {
  onSelectMetric: (metric: MetricCatalogEntry) => void
  selectedMetricIds?: Set<string>
}

export function MetricCatalogBrowser({ onSelectMetric, selectedMetricIds = new Set() }: MetricCatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const customDefs = useCustomMetricDefinitions()

  // Merge built-in catalog with user-defined custom metrics
  const allMetrics = useMemo(() => {
    const customEntries = customDefs.map(toMetricCatalogEntry)
    // Deduplicate by id (custom overrides built-in if same id)
    const ids = new Set(customEntries.map(e => e.id))
    return [...METRIC_CATALOG.filter(m => !ids.has(m.id)), ...customEntries]
  }, [customDefs])

  const allCategories = useMemo(() => {
    const cats = new Set(getCategories())
    for (const m of allMetrics) cats.add(m.category)
    return cats
  }, [allMetrics])

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(getCategories()))

  // Auto-expand new categories from custom metrics
  useEffect(() => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      for (const cat of allCategories) next.add(cat)
      return next
    })
  }, [allCategories])

  const filteredMetrics = useMemo(() => {
    if (!searchQuery.trim()) return allMetrics
    const q = searchQuery.toLowerCase()
    return allMetrics.filter(m =>
      m.name.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q)
    )
  }, [searchQuery, allMetrics])

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
        {Object.entries(groupedMetrics).map(([category, metrics]) => (
          <CollapsibleSection
            key={category}
            label={category}
            badge={<span className="text-neutral-500">{metrics.length}</span>}
            expanded={expandedCategories.has(category)}
            onToggle={() => toggleCategory(category)}
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
                    <div className="truncate font-medium flex items-center gap-1.5">
                      {metric.name}
                      {metric.isCustom && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 font-normal">Custom</span>
                      )}
                    </div>
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
          </CollapsibleSection>
        ))}
      </div>
    </div>
  )
}
