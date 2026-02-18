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
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
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

/** Lightweight fallback for chart rendering errors */
const ChartErrorFallback = (
  <div className="rounded-xl bg-dark-800/40 border border-white/5 p-6 text-center">
    <AlertTriangle className="w-5 h-5 text-amber-400 mx-auto mb-2" />
    <p className="text-xs text-neutral-400">Chart failed to render. Try refreshing the page.</p>
  </div>
)

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

  // Separate coverage warnings (start with ⚠) from per-stock warnings
  const coverageWarnings = allWarnings.filter(w => w.startsWith('⚠'))
  const stockWarnings = allWarnings.filter(w => !w.startsWith('⚠'))

  return (
    <div className="space-y-4">
      {/* Data coverage warning — prominent, always visible */}
      {coverageWarnings.length > 0 && <DataCoverageBanner warnings={coverageWarnings} />}

      {/* Per-stock API data warnings — collapsible */}
      {stockWarnings.length > 0 && <DataWarningsBanner warnings={stockWarnings} />}

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
          <ErrorBoundary fallback={ChartErrorFallback}>
            <ScoreReturnCorrelation />
          </ErrorBoundary>

          {/* Price delta table with expandable rows */}
          <ErrorBoundary fallback={ChartErrorFallback}>
            <PriceDeltaTable
              onSelectStock={setSelectedStockId}
              selectedStockId={selectedStockId}
            />
          </ErrorBoundary>

          {/* Equity curves */}
          {hasBacktest && (
            <ErrorBoundary fallback={ChartErrorFallback}>
              <PerformanceChart />
            </ErrorBoundary>
          )}

          {/* Per-stock deep dive (moved from Analysis) */}
          {hasBacktest && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <ErrorBoundary fallback={ChartErrorFallback}>
                <MetricContributionWaterfall />
              </ErrorBoundary>
              <ErrorBoundary fallback={ChartErrorFallback}>
                <ScoreTrajectoryChart />
              </ErrorBoundary>
            </div>
          )}
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {hasBacktest && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ErrorBoundary fallback={ChartErrorFallback}>
                  <QuintileAnalysisChart />
                </ErrorBoundary>
                <ErrorBoundary fallback={ChartErrorFallback}>
                  <RelativePerformanceChart />
                </ErrorBoundary>
              </div>
              <ErrorBoundary fallback={ChartErrorFallback}>
                <CohortComparisonTable />
              </ErrorBoundary>
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

// ─── Data Coverage Banner (prominent, always visible) ───

interface CoverageThreshold {
  category: string
  metrics: string
  availableFrom: string
  reason: string
}

interface CoverageData {
  fromDate: string
  recommendedDate: string
  thresholds: CoverageThreshold[]
}

function parseCoverageWarning(raw: string): CoverageData | null {
  try {
    const json = raw.replace(/^⚠\s*Data coverage:\s*/, '')
    return JSON.parse(json)
  } catch {
    return null
  }
}

function DataCoverageBanner({ warnings }: { warnings: string[] }) {
  const parsed = warnings.map(parseCoverageWarning).filter(Boolean) as CoverageData[]
  if (parsed.length === 0) return null

  const data = parsed[0]

  return (
    <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
        <div className="flex-1 space-y-3">
          <div>
            <div className="text-xs font-semibold text-amber-300">Limited Data Coverage</div>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Your start date ({data.fromDate}) is before some CMOTS data thresholds.
              Scores at early intervals will be N/A for the affected categories.
            </p>
          </div>

          {/* Per-category table */}
          <div className="rounded-lg bg-dark-800/60 border border-white/5 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-white/5 text-neutral-500">
                  <th className="text-left px-3 py-1.5 font-medium">Category</th>
                  <th className="text-left px-3 py-1.5 font-medium">Available From</th>
                  <th className="text-left px-3 py-1.5 font-medium">Reason</th>
                </tr>
              </thead>
              <tbody>
                {data.thresholds.map((t, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-3 py-2 text-amber-300 font-medium whitespace-nowrap">{t.category}</td>
                    <td className="px-3 py-2 text-white font-mono whitespace-nowrap">{t.availableFrom}</td>
                    <td className="px-3 py-2 text-neutral-400">{t.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Affected metrics list */}
          <div className="text-[10px] text-neutral-500">
            <span className="text-neutral-400 font-medium">Affected metrics: </span>
            {data.thresholds.map(t => t.metrics).join(', ')}
          </div>

          {/* Recommended date */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-neutral-500">Recommended start date:</span>
            <span className="text-primary-400 font-semibold font-mono">{data.recommendedDate}</span>
            <span className="text-neutral-600">— all segments will have complete data from this date.</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Data Warnings Banner (per-stock, collapsible) ───

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
