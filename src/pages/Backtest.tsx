/**
 * Backtest Page — 3-Stage Scorecard Backtesting Pipeline
 *
 * Pipeline: Build Scorecard → Configure & Run → Results & Iterate
 *
 * Stage 1 merges old Stages 1+2 (metrics + scorecard structure)
 * Stage 2 merges old Stages 3+4 (configure + review/run)
 * Stage 3 is old Stage 5 (results) + iteration tools
 *
 * Supports three UI modes:
 * - Wizard: Step-by-step, one stage at a time
 * - Dashboard: All stages visible as collapsible sections
 * - Hybrid: Sidebar with stage list, main area shows selected stage
 */

import { lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentStage, useUIMode, useActiveScorecard } from '@/store/useScoringStore'
import type { MetricCatalogEntry } from '@/types/scoring'
import type { PipelineStage } from '@/types/scoring'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

// Cross-stage
import { PipelineNav } from '@/components/scoring/PipelineNav'
import { UIModeToggle } from '@/components/scoring/UIModeToggle'
import { ScorecardSelector } from '@/components/scoring/ScorecardSelector'

// Stage 1: Build Scorecard (merged metrics + scorecard structure)
import { MetricCatalogBrowser } from '@/components/scoring/MetricCatalogBrowser'
import { FormulaBuilder } from '@/components/scoring/FormulaBuilder'
import { CustomMetricCreator } from '@/components/scoring/CustomMetricCreator'
import { SelectedMetricsList } from '@/components/scoring/SelectedMetricsList'
import { NegativeHandlingEditor } from '@/components/scoring/NegativeHandlingEditor'
import { CSVUploadParser } from '@/components/scoring/CSVUploadParser'
import { SegmentBuilder } from '@/components/scoring/SegmentBuilder'
import { CompositeFormulaEditor } from '@/components/scoring/CompositeFormulaEditor'
import { NormalizationSelector } from '@/components/scoring/NormalizationSelector'
import { VerdictThresholdEditor } from '@/components/scoring/VerdictThresholdEditor'
import { ValuationConditionalsEditor } from '@/components/scoring/ValuationConditionalsEditor'
import { ScorecardTemplateCard } from '@/components/scoring/ScorecardTemplateCard'

// Stage 2: Configure & Run
import { ConfigureRunPanel } from '@/components/scoring/ConfigureRunPanel'
import { RunCombinedButton } from '@/components/scoring/RunCombinedButton'
import { PipelineReviewPanel } from '@/components/scoring/PipelineReviewPanel'
import { VersionInfoEditor } from '@/components/scoring/VersionInfoEditor'
import { VersionHistoryPanel } from '@/components/scoring/VersionHistoryPanel'

// Stage 3: Results & Iterate (lazy-loaded — heavy with chart libraries)
const ResultsPanel = lazy(() => import('@/components/scoring/ResultsPanel').then(m => ({ default: m.ResultsPanel })))

import { SCORECARD_TEMPLATES } from '@/data/scorecardTemplates'

/** Loading fallback for lazy-loaded stage panels */
function StageSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
      <span className="ml-2 text-sm text-neutral-400">Loading...</span>
    </div>
  )
}

// ─── Template Section (shown when no segments/metrics loaded) ───

function TemplateSection() {
  const scorecard = useActiveScorecard()
  const totalMetrics = scorecard?.segments.reduce((sum, seg) => sum + seg.metrics.length, 0) ?? 0

  // Show templates only when scorecard has no real metrics
  if (totalMetrics > 0) return null

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

// ─── Wired MetricCatalogBrowser with target segment selector ───

function MetricCatalogBrowserWired() {
  const scorecard = useActiveScorecard()
  const addMetric = useScoringStore(s => s.addMetric)
  const [targetSegmentId, setTargetSegmentId] = useState<string>('')

  const segments = scorecard?.segments ?? []
  const effectiveTargetId = targetSegmentId || segments[0]?.id || ''

  const selectedIds = new Set(
    segments.flatMap(seg => seg.metrics.map(m => m.id))
  )

  const handleSelect = (metric: MetricCatalogEntry) => {
    if (!scorecard || segments.length === 0 || !effectiveTargetId) return
    addMetric(effectiveTargetId, {
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

  return (
    <div className="flex flex-col h-full">
      {/* Target segment selector */}
      {segments.length > 1 && (
        <div className="flex items-center gap-2 mb-2 px-1">
          <span className="text-[10px] text-neutral-500">Add to:</span>
          <select
            value={effectiveTargetId}
            onChange={e => setTargetSegmentId(e.target.value)}
            className="flex-1 px-2 py-1 bg-dark-700/60 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-primary-500/30"
          >
            {segments.map(seg => (
              <option key={seg.id} value={seg.id}>{seg.name} ({seg.metrics.length})</option>
            ))}
          </select>
        </div>
      )}
      <MetricCatalogBrowser onSelectMetric={handleSelect} selectedMetricIds={selectedIds} />
    </div>
  )
}

// ─── Collapsible Section ───

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700/20 transition-colors"
      >
        <span className="text-sm font-medium text-neutral-300">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Stage Configuration ───

interface StageConfig {
  title: string
  description: string
  render: () => React.ReactNode
}

const STAGE_CONFIGS: Record<PipelineStage, StageConfig> = {
  1: {
    title: 'Build Scorecard',
    description: 'Select metrics, create segments, assign weights, set verdicts',
    render: () => (
      <div className="space-y-4">
        {/* Templates + CSV Upload */}
        <div className="flex items-center gap-3">
          <CSVUploadParser />
        </div>
        <TemplateSection />

        {/* Segments & Weights */}
        <CollapsibleSection title="Segments & Weights">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SegmentBuilder />
            <CompositeFormulaEditor />
          </div>
          <ValuationConditionalsEditor />
        </CollapsibleSection>

        {/* Metric Selection */}
        <CollapsibleSection title="Metric Catalog & Selection">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricCatalogBrowserWired />
            <div className="space-y-4">
              <SelectedMetricsList />
              <FormulaBuilder />
              <CustomMetricCreator />
            </div>
          </div>
        </CollapsibleSection>

        {/* Verdict & Normalization */}
        <CollapsibleSection title="Verdict Thresholds & Normalization" defaultOpen={false}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <VerdictThresholdEditor />
            <NormalizationSelector />
          </div>
        </CollapsibleSection>

        {/* Negative handling */}
        <CollapsibleSection title="Negative Value Handling" defaultOpen={false}>
          <NegativeHandlingEditor />
        </CollapsibleSection>
      </div>
    ),
  },
  2: {
    title: 'Configure & Run',
    description: 'Select stocks, set date range, review config, and run backtest',
    render: () => (
      <div className="space-y-4">
        {/* Stock selection + date range + benchmark */}
        <ConfigureRunPanel />

        {/* Collapsible review summary */}
        <CollapsibleSection title="Review Configuration" defaultOpen={false}>
          <PipelineReviewPanel />
        </CollapsibleSection>

        {/* Version info + history + run button */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RunCombinedButton />
          </div>
          <div className="space-y-4">
            <VersionInfoEditor />
            <VersionHistoryPanel />
          </div>
        </div>
      </div>
    ),
  },
  3: {
    title: 'Results & Iterate',
    description: 'Analyze results, export reports, re-run with tweaks',
    render: () => (
      <Suspense fallback={<StageSkeleton />}>
        <ResultsPanel />
      </Suspense>
    ),
  },
  // Stages 4-5 exist for backward compat with 5-stage store logic (StepperNav).
  // PipelineNav only shows 3 stages, but prepareReRun can set currentStage=4.
  4: {
    title: 'Run',
    description: 'Configure and execute backtest run',
    render: () => (
      <div className="space-y-4">
        <ConfigureRunPanel />
        <CollapsibleSection title="Review Configuration" defaultOpen={false}>
          <PipelineReviewPanel />
        </CollapsibleSection>
        <RunCombinedButton />
      </div>
    ),
  },
  5: {
    title: 'Results',
    description: 'View backtest results and performance report',
    render: () => (
      <Suspense fallback={<StageSkeleton />}>
        <ResultsPanel />
      </Suspense>
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

        {currentStage < 3 && (
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
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                isActive ? 'bg-primary-500 text-white' : 'bg-dark-600 text-neutral-500',
              )}>
                {stage}
              </div>
              <div className="flex-1">
                <span className={cn('text-sm font-medium', isActive ? 'text-white' : 'text-neutral-400')}>
                  {config.title}
                </span>
                <span className="text-xs text-neutral-400 ml-2">{config.description}</span>
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
                'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold',
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
