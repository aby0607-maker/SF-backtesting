/**
 * Backtest Page — 5-Step Scorecard Backtesting Pipeline
 *
 * Pipeline: Start → Metrics & Segments → Review & Tune → Select Stocks & Run → Results & Iterate
 *
 * Single unified navigation: StepperNav with direct-click to completed steps.
 * Progressive disclosure within each step via segments and micro-segments.
 */

import { lazy, Suspense, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useCurrentStage } from '@/store/useScoringStore'
import type { PipelineStage } from '@/types/scoring'
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'

// Cross-step
import { StepperNav } from '@/components/scoring/StepperNav'
import { ScorecardSelector } from '@/components/scoring/ScorecardSelector'

// Step 1: Start
import { StartingPointStep } from '@/components/scoring/StartingPointStep'

// Step 2: Metrics & Segments
import { MetricsBuilderStep } from '@/components/scoring/MetricsBuilderStep'

// Step 3: Review & Tune
import { ReviewTuneStep } from '@/components/scoring/ReviewTuneStep'

// Step 4: Select Stocks & Run
import { ConfigureRunPanel } from '@/components/scoring/ConfigureRunPanel'
import { RunCombinedButton } from '@/components/scoring/RunCombinedButton'
import { PipelineReviewPanel } from '@/components/scoring/PipelineReviewPanel'
import { VersionInfoEditor } from '@/components/scoring/VersionInfoEditor'
import { VersionHistoryPanel } from '@/components/scoring/VersionHistoryPanel'

// Step 5: Results & Iterate (lazy-loaded — heavy with chart libraries)
const ResultsPanel = lazy(() => import('@/components/scoring/ResultsPanel').then(m => ({ default: m.ResultsPanel })))

/** Loading fallback for lazy-loaded panels */
function StepSkeleton() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-5 h-5 animate-spin text-primary-400" />
      <span className="ml-2 text-sm text-neutral-400">Loading...</span>
    </div>
  )
}

// ─── Collapsible Section (reusable utility) ───

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

// ─── Step Configuration ───

interface StepConfig {
  title: string
  description: string
  render: () => React.ReactNode
}

const STEP_CONFIGS: Record<PipelineStage, StepConfig> = {
  1: {
    title: 'Choose Your Starting Point',
    description: 'Pick a template, import CSV, or start from scratch',
    render: () => <StartingPointStep />,
  },
  2: {
    title: 'Metrics & Segments',
    description: 'Select metrics and organize them into segments',
    render: () => <MetricsBuilderStep />,
  },
  3: {
    title: 'Review & Tune',
    description: 'Adjust weights, configure score bands, and set verdicts',
    render: () => <ReviewTuneStep />,
  },
  4: {
    title: 'Select Stocks & Run',
    description: 'Choose universe, set date range, and execute backtest',
    render: () => (
      <div className="space-y-4">
        {/* Segment A: Stock selection + date range + benchmark */}
        <ConfigureRunPanel />

        {/* Segment C: Run button with readiness checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RunCombinedButton />
          </div>
          <div className="space-y-4">
            <VersionInfoEditor />
            <VersionHistoryPanel />
          </div>
        </div>

        {/* Micro: Full config review (collapsed) */}
        <CollapsibleSection title="Review Full Configuration" defaultOpen={false}>
          <PipelineReviewPanel />
        </CollapsibleSection>
      </div>
    ),
  },
  5: {
    title: 'Results & Iterate',
    description: 'Analyze results, export reports, re-run with tweaks',
    render: () => (
      <Suspense fallback={<StepSkeleton />}>
        <ResultsPanel />
      </Suspense>
    ),
  },
}

// ─── Main Page Component ───

export function Backtest() {
  const currentStage = useCurrentStage()
  const nextStage = useScoringStore(s => s.nextStage)
  const prevStage = useScoringStore(s => s.prevStage)
  const config = STEP_CONFIGS[currentStage]

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
        <ScorecardSelector />
      </div>

      {/* Pipeline Navigation — 5-step stepper */}
      <StepperNav />

      {/* Step header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Step {currentStage}: {config.title}
          </h2>
          <p className="text-xs text-neutral-500">{config.description}</p>
        </div>
      </div>

      {/* Step content with animation */}
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
          onClick={prevStage}
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

        {currentStage < 5 && (
          <button
            onClick={nextStage}
            className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}
