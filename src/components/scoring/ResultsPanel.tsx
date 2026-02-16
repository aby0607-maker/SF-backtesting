/**
 * ResultsPanel — Stage 5: Tab switcher for Scores / Performance / Analysis
 *
 * Performance tab (restructured):
 *   ├── ScoreReturnCorrelation      ← Score vs Return scatter + correlation timeline
 *   ├── PriceDeltaTable             ← Expandable rows with sparkline/score history/heatmap
 *   ├── PerformanceChart            ← Equity curves
 *   ├── MetricContributionWaterfall ← Per-stock metric breakdown (moved from Analysis)
 *   └── ScoreTrajectoryChart        ← Score timeline (moved from Analysis)
 *
 * Analysis tab (macro-level):
 *   ├── QuintileAnalysisChart
 *   ├── RelativePerformanceChart
 *   └── CohortComparisonTable
 *
 * Selected stock state lives here, passed to children.
 */

import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useCombinedResult, useBacktestResult } from '@/store/useScoringStore'
import { ScoringResultsTable } from './ScoringResultsTable'
import { StockDetailOverlay } from './StockDetailOverlay'
import { PriceDeltaTable } from './PriceDeltaTable'
import { SummaryMetricsGrid } from './SummaryMetricsGrid'
import { ScoreReturnCorrelation } from './ScoreReturnCorrelation'
import { PerformanceChart } from './PerformanceChart'
import { QuintileAnalysisChart } from './QuintileAnalysisChart'
import { RelativePerformanceChart } from './RelativePerformanceChart'
import { CohortComparisonTable } from './CohortComparisonTable'
import { MetricContributionWaterfall } from './MetricContributionWaterfall'
import { ScoreTrajectoryChart } from './ScoreTrajectoryChart'
import { ExportReportButton } from './ExportReportButton'
import { BarChart3, TrendingUp, Activity, AlertTriangle, ChevronDown } from 'lucide-react'

type ResultsTab = 'scores' | 'performance' | 'analysis'

const TABS: { id: ResultsTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'scores', label: 'Scores', icon: BarChart3 },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'analysis', label: 'Analysis', icon: Activity },
]

export function ResultsPanel() {
  const [activeTab, setActiveTab] = useState<ResultsTab>('scores')
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)
  const [overlayStockId, setOverlayStockId] = useState<string | null>(null)
  const combinedResult = useCombinedResult()
  const backtestResult = useBacktestResult()

  const hasResults = !!combinedResult
  const hasBacktest = !!backtestResult

  if (!hasResults) {
    return (
      <div className="text-center py-12 text-neutral-500 text-sm">
        No results available. Complete the scoring run in Stage 4 first.
      </div>
    )
  }

  // Clear selected stock when switching tabs (avoid stale state)
  const handleTabChange = (tab: ResultsTab) => {
    setActiveTab(tab)
    if (tab !== 'performance') setSelectedStockId(null)
  }

  // Collect warnings from scoring + backtest
  const allWarnings = [
    ...(combinedResult.scoring.warnings ?? []),
    ...(combinedResult.backtest?.warnings ?? []),
  ]

  return (
    <div className="space-y-4">
      {/* API data warnings */}
      {allWarnings.length > 0 && <DataWarningsBanner warnings={allWarnings} />}

      {/* Summary metrics — switches between aggregate and per-stock */}
      <SummaryMetricsGrid selectedStockId={selectedStockId} />

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-px">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 transition-all -mb-px',
              activeTab === id
                ? 'border-primary-500 text-primary-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-300',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}

        {/* Selected stock indicator */}
        {selectedStockId && activeTab === 'performance' && (
          <button
            onClick={() => setSelectedStockId(null)}
            className="ml-2 text-[10px] text-primary-400 bg-primary-500/10 px-2 py-1 rounded-full hover:bg-primary-500/20 transition-colors"
          >
            Clear selection ✕
          </button>
        )}

        {/* Export button on the right */}
        <div className="ml-auto">
          <ExportReportButton />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'scores' && (
        <ScoringResultsTable onSelectStock={setOverlayStockId} />
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          {/* Score vs Return correlation — the key insight chart */}
          <ScoreReturnCorrelation />

          {/* Price delta table with expandable rows */}
          <PriceDeltaTable
            onSelectStock={setSelectedStockId}
            selectedStockId={selectedStockId}
          />

          {/* Equity curves */}
          {hasBacktest && <PerformanceChart />}

          {/* Per-stock deep dive (moved from Analysis) */}
          {hasBacktest && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <MetricContributionWaterfall />
              <ScoreTrajectoryChart />
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {hasBacktest && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <QuintileAnalysisChart />
                <RelativePerformanceChart />
              </div>
              <CohortComparisonTable />
            </>
          )}
          {!hasBacktest && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              Analysis charts require backtest data. This will populate after scoring is complete.
            </div>
          )}
        </div>
      )}
      {/* Stock detail overlay */}
      <AnimatePresence>
        {overlayStockId && (
          <StockDetailOverlay
            stockId={overlayStockId}
            onClose={() => setOverlayStockId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Data Warnings Banner ───

function DataWarningsBanner({ warnings }: { warnings: string[] }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-2.5 text-left hover:bg-amber-500/5 transition-colors"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="text-xs font-medium text-amber-400">
          {warnings.length} data {warnings.length === 1 ? 'warning' : 'warnings'}
        </span>
        <span className="text-[10px] text-neutral-500 ml-1">
          — some stocks had missing API data
        </span>
        <ChevronDown className={cn(
          'w-3.5 h-3.5 text-amber-400/60 ml-auto transition-transform',
          expanded && 'rotate-180',
        )} />
      </button>
      {expanded && (
        <div className="px-4 pb-3 border-t border-amber-500/10">
          <div className="max-h-40 overflow-y-auto space-y-1 pt-2">
            {warnings.map((w, i) => (
              <div key={i} className="text-[11px] text-neutral-400 flex items-start gap-2">
                <span className="text-amber-400/50 shrink-0 mt-0.5">•</span>
                <span>{w}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
