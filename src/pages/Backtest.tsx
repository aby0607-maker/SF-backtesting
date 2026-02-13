/**
 * Backtest Page — 7-Stage Scorecard Backtesting Pipeline
 *
 * Supports three UI modes:
 * - Wizard: Step-by-step, one stage at a time
 * - Dashboard: All stages visible as collapsible sections
 * - Hybrid: Sidebar with stage list, main area shows selected stage
 */

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentStage, useUIMode, useActiveScorecard } from '@/store/useScoringStore'
import type { MetricCatalogEntry } from '@/types/scoring'
import type { PipelineStage } from '@/types/scoring'
import { ChevronLeft, ChevronRight } from 'lucide-react'

// Cross-stage
import { PipelineNav } from '@/components/scoring/PipelineNav'
import { UIModeToggle } from '@/components/scoring/UIModeToggle'
import { ScorecardSelector } from '@/components/scoring/ScorecardSelector'

// Stage 1: Build Metrics
import { MetricCatalogBrowser } from '@/components/scoring/MetricCatalogBrowser'
import { FormulaBuilder } from '@/components/scoring/FormulaBuilder'
import { SelectedMetricsList } from '@/components/scoring/SelectedMetricsList'

// Stage 2: Build Scorecard
import { SegmentBuilder } from '@/components/scoring/SegmentBuilder'
import { CompositeFormulaEditor } from '@/components/scoring/CompositeFormulaEditor'
import { NormalizationSelector } from '@/components/scoring/NormalizationSelector'
import { VerdictThresholdEditor } from '@/components/scoring/VerdictThresholdEditor'
import { ScorecardTemplateCard } from '@/components/scoring/ScorecardTemplateCard'

// Stage 3: Score & Rank
import { UniverseSelector } from '@/components/scoring/UniverseSelector'
import { RunScoringButton } from '@/components/scoring/RunScoringButton'
import { ScoreboardTable } from '@/components/scoring/ScoreboardTable'
import { ScoreDistributionChart } from '@/components/scoring/ScoreDistributionChart'
import { VerdictSummaryCards } from '@/components/scoring/VerdictSummaryCards'

// Stage 4: Select Cohort
import { CohortFilterPanel } from '@/components/scoring/CohortFilterPanel'
import { StockSelectionList } from '@/components/scoring/StockSelectionList'

// Stage 5: Set Date Range
import { DateRangeSelector } from '@/components/scoring/DateRangeSelector'
import { BenchmarkSelector } from '@/components/scoring/BenchmarkSelector'

// Stage 6: Review & Confirm
import { PipelineReviewPanel } from '@/components/scoring/PipelineReviewPanel'
import { ConfirmAndRunButton } from '@/components/scoring/ConfirmAndRunButton'
import { VersionInfoEditor } from '@/components/scoring/VersionInfoEditor'
import { VersionHistoryPanel } from '@/components/scoring/VersionHistoryPanel'

// Stage 7: Performance Report
import { PerformanceChart } from '@/components/scoring/PerformanceChart'
import { CohortComparisonTable } from '@/components/scoring/CohortComparisonTable'
import { SummaryMetricsGrid } from '@/components/scoring/SummaryMetricsGrid'
import { RelativePerformanceChart } from '@/components/scoring/RelativePerformanceChart'
import { QuintileAnalysisChart } from '@/components/scoring/QuintileAnalysisChart'
import { MetricContributionWaterfall } from '@/components/scoring/MetricContributionWaterfall'
import { ScoreTrajectoryChart } from '@/components/scoring/ScoreTrajectoryChart'
import { ExportReportButton } from '@/components/scoring/ExportReportButton'

import { SCORECARD_TEMPLATES } from '@/data/scorecardTemplates'

// ─── Wired component for Stage 2 template section ───

function Stage2TemplateSection() {
  const scorecard = useActiveScorecard()
  const hasSegments = (scorecard?.segments.length ?? 0) > 0

  // If a scorecard is already loaded with segments, collapse templates
  if (hasSegments) {
    return null
  }

  return (
    <div>
      <div className="text-xs text-neutral-500 mb-2">Quick Start Templates</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SCORECARD_TEMPLATES.map(t => (
          <ScorecardTemplateCard key={t.id} template={t} />
        ))}
      </div>
    </div>
  )
}

// ─── Wired component for MetricCatalogBrowser ───

function MetricCatalogBrowserWired() {
  const scorecard = useActiveScorecard()
  const addMetric = useScoringStore(s => s.addMetric)

  const selectedIds = new Set(
    scorecard?.segments.flatMap(seg => seg.metrics.map(m => m.id)) ?? []
  )

  const handleSelect = (metric: MetricCatalogEntry) => {
    if (!scorecard || scorecard.segments.length === 0) return
    // Add to first segment by default
    const targetSegment = scorecard.segments[0]
    addMetric(targetSegment.id, {
      id: metric.id,
      name: metric.name,
      type: 'raw',
      rawMetric: {
        id: metric.id,
        name: metric.name,
        cmots_source: metric.cmots_source,
        cmots_field: metric.cmots_field,
        unit: metric.unit,
        description: metric.description,
      },
      scoreBands: [],
      description: metric.description,
    })
  }

  return <MetricCatalogBrowser onSelectMetric={handleSelect} selectedMetricIds={selectedIds} />
}

// ─── Stage Configuration ───

interface StageConfig {
  title: string
  description: string
  render: () => React.ReactNode
}

const STAGE_CONFIGS: Record<PipelineStage, StageConfig> = {
  1: {
    title: 'Build Metrics',
    description: 'Select raw metrics or create composite formulas',
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricCatalogBrowserWired />
          <div className="space-y-4">
            <SelectedMetricsList />
            <FormulaBuilder />
          </div>
        </div>
      </div>
    ),
  },
  2: {
    title: 'Build Scorecard',
    description: 'Group metrics into segments, assign weights, set verdict thresholds',
    render: () => (
      <div className="space-y-4">
        {/* Templates — only shown when no scorecard is loaded */}
        <Stage2TemplateSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <SegmentBuilder />
            <CompositeFormulaEditor />
          </div>
          <div className="space-y-4">
            <VerdictThresholdEditor />
            <NormalizationSelector />
          </div>
        </div>
      </div>
    ),
  },
  3: {
    title: 'Score & Rank',
    description: 'Select universe, apply scorecard, view scores and verdicts',
    render: () => (
      <div className="space-y-4">
        <UniverseSelector />
        <div className="flex items-center justify-between">
          <RunScoringButton />
        </div>
        <VerdictSummaryCards />
        <ScoreDistributionChart />
        <ScoreboardTable />
      </div>
    ),
  },
  4: {
    title: 'Select Cohort',
    description: 'Pick stocks by sector, market cap, score range, or verdict',
    render: () => (
      <div className="space-y-4">
        <CohortFilterPanel />
        <StockSelectionList />
      </div>
    ),
  },
  5: {
    title: 'Set Date Range',
    description: 'Choose backtest period, interval, and optional benchmark',
    render: () => (
      <div className="space-y-4">
        <DateRangeSelector />
        <BenchmarkSelector />
      </div>
    ),
  },
  6: {
    title: 'Review & Confirm',
    description: 'Review all configuration, edit any stage, then confirm',
    render: () => (
      <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <PipelineReviewPanel />
          </div>
          <div className="space-y-4">
            <VersionInfoEditor />
            <VersionHistoryPanel />
            <ConfirmAndRunButton />
          </div>
        </div>
      </div>
    ),
  },
  7: {
    title: 'Performance Report',
    description: 'See how selections performed vs cohort over time',
    render: () => (
      <div className="space-y-4">
        <SummaryMetricsGrid />
        <PerformanceChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <QuintileAnalysisChart />
          <RelativePerformanceChart />
        </div>
        <CohortComparisonTable />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MetricContributionWaterfall />
          <ScoreTrajectoryChart />
        </div>
        <div className="flex justify-end">
          <ExportReportButton />
        </div>
      </div>
    ),
  },
}

// ─── Main Page Component ───

export function Backtest() {
  const currentStage = useCurrentStage()
  const uiMode = useUIMode()
  const nextStage = useScoringStore(s => s.nextStage)
  const prevStage = useScoringStore(s => s.prevStage)
  const setStage = useScoringStore(s => s.setStage)

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-white">Scorecard Backtester</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Build, score, and validate investment methodologies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <UIModeToggle />
          <ScorecardSelector />
        </div>
      </div>

      {/* Pipeline Navigation */}
      <PipelineNav />

      {/* Stage Content — mode-dependent rendering */}
      {uiMode === 'wizard' && (
        <WizardMode
          currentStage={currentStage}
          onNext={nextStage}
          onPrev={prevStage}
        />
      )}

      {uiMode === 'dashboard' && (
        <DashboardMode currentStage={currentStage} onStageClick={setStage} />
      )}

      {uiMode === 'hybrid' && (
        <HybridMode currentStage={currentStage} onStageClick={setStage} />
      )}
    </motion.div>
  )
}

// ─── Wizard Mode ───

function WizardMode({
  currentStage,
  onNext,
  onPrev,
}: {
  currentStage: PipelineStage
  onNext: () => void
  onPrev: () => void
}) {
  const config = STAGE_CONFIGS[currentStage]

  return (
    <div className="space-y-4">
      {/* Stage header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Stage {currentStage}: {config.title}
          </h2>
          <p className="text-xs text-neutral-500">{config.description}</p>
        </div>
      </div>

      {/* Stage content with animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {config.render()}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <button
          onClick={onPrev}
          disabled={currentStage === 1}
          className={cn(
            'flex items-center gap-1 px-4 py-2 rounded-lg text-sm transition-colors',
            currentStage > 1
              ? 'text-neutral-300 hover:text-white hover:bg-dark-700/60'
              : 'text-neutral-600 cursor-not-allowed',
          )}
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </button>

        {currentStage < 7 && (
          <button
            onClick={onNext}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Dashboard Mode ───

function DashboardMode({
  currentStage,
  onStageClick,
}: {
  currentStage: PipelineStage
  onStageClick: (stage: PipelineStage) => void
}) {
  return (
    <div className="space-y-3">
      {(Object.entries(STAGE_CONFIGS) as [string, StageConfig][]).map(([stageStr, config]) => {
        const stage = Number(stageStr) as PipelineStage
        const isActive = stage === currentStage

        return (
          <div key={stage} className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
            <button
              onClick={() => onStageClick(stage)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
                isActive ? 'bg-primary-500/5' : 'hover:bg-dark-700/30',
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                isActive ? 'bg-primary-500 text-white' : 'bg-dark-600 text-neutral-500',
              )}>
                {stage}
              </div>
              <div className="flex-1">
                <span className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-neutral-400')}>
                  {config.title}
                </span>
                <span className="text-[10px] text-neutral-600 ml-2">{config.description}</span>
              </div>
            </button>

            {isActive && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="px-4 pb-4 border-t border-white/5"
              >
                <div className="pt-3">
                  {config.render()}
                </div>
              </motion.div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Hybrid Mode ───

function HybridMode({
  currentStage,
  onStageClick,
}: {
  currentStage: PipelineStage
  onStageClick: (stage: PipelineStage) => void
}) {
  const config = STAGE_CONFIGS[currentStage]

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="w-48 shrink-0 space-y-1">
        {(Object.entries(STAGE_CONFIGS) as [string, StageConfig][]).map(([stageStr, cfg]) => {
          const stage = Number(stageStr) as PipelineStage
          const isActive = stage === currentStage

          return (
            <button
              key={stage}
              onClick={() => onStageClick(stage)}
              className={cn(
                'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors',
                isActive
                  ? 'bg-primary-500/15 text-primary-400'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-dark-700/30',
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold',
                isActive ? 'bg-primary-500 text-white' : 'bg-dark-700 text-neutral-500',
              )}>
                {stage}
              </span>
              <span className="truncate">{cfg.title}</span>
            </button>
          )
        })}
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-white">
            Stage {currentStage}: {config.title}
          </h2>
          <p className="text-xs text-neutral-500">{config.description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {config.render()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
