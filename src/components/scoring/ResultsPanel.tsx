/**
 * ResultsPanel — Stage 5: Tab switcher for Scores / Performance
 *
 * Tab 1: ScoringResultsTable — 3-level progressive disclosure
 * Tab 2: PriceDeltaTable — interval-column price delta grid
 * Below tabs: Existing analysis charts (equity curves, quintile, waterfall, etc.)
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useCombinedResult, useBacktestResult } from '@/store/useScoringStore'
import { ScoringResultsTable } from './ScoringResultsTable'
import { PriceDeltaTable } from './PriceDeltaTable'
import { SummaryMetricsGrid } from './SummaryMetricsGrid'
import { PerformanceChart } from './PerformanceChart'
import { QuintileAnalysisChart } from './QuintileAnalysisChart'
import { RelativePerformanceChart } from './RelativePerformanceChart'
import { CohortComparisonTable } from './CohortComparisonTable'
import { MetricContributionWaterfall } from './MetricContributionWaterfall'
import { ScoreTrajectoryChart } from './ScoreTrajectoryChart'
import { ExportReportButton } from './ExportReportButton'
import { BarChart3, TrendingUp, Activity } from 'lucide-react'

type ResultsTab = 'scores' | 'performance' | 'analysis'

const TABS: { id: ResultsTab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'scores', label: 'Scores', icon: BarChart3 },
  { id: 'performance', label: 'Performance', icon: TrendingUp },
  { id: 'analysis', label: 'Analysis', icon: Activity },
]

export function ResultsPanel() {
  const [activeTab, setActiveTab] = useState<ResultsTab>('scores')
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

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <SummaryMetricsGrid />

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-white/5 pb-px">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
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

        {/* Export button on the right */}
        <div className="ml-auto">
          <ExportReportButton />
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'scores' && (
        <ScoringResultsTable />
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <PriceDeltaTable />
          {hasBacktest && <PerformanceChart />}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <MetricContributionWaterfall />
                <ScoreTrajectoryChart />
              </div>
            </>
          )}
          {!hasBacktest && (
            <div className="text-center py-8 text-neutral-500 text-sm">
              Analysis charts require backtest data. This will populate after scoring is complete.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
