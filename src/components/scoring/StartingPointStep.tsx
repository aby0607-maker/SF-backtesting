/**
 * StartingPointStep — Step 1: Choose Your Starting Point
 *
 * Template gallery (primary), CSV upload + Start from Scratch (secondary),
 * and Load Previous scorecard (collapsed).
 */

import { useState } from 'react'
import { useScoringStore } from '@/store/useScoringStore'
import { ScorecardTemplateCard } from './ScorecardTemplateCard'
import { CSVUploadParser } from './CSVUploadParser'
import { ScorecardSelector } from './ScorecardSelector'
import { SCORECARD_TEMPLATES } from '@/data/scorecardTemplates'
import type { PipelineStage } from '@/types/scoring'
import { Plus, FolderOpen, ChevronDown, ChevronUp } from 'lucide-react'

export function StartingPointStep() {
  const createScorecard = useScoringStore(s => s.createScorecard)
  const setStage = useScoringStore(s => s.setStage)
  const scorecards = useScoringStore(s => s.scorecards)
  const [showPrevious, setShowPrevious] = useState(false)

  return (
    <div className="space-y-6">
      {/* Segment A: Template Gallery */}
      <div>
        <h3 className="text-sm font-medium text-neutral-300 mb-3">Quick Start Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {SCORECARD_TEMPLATES.map(t => (
            <ScorecardTemplateCard key={t.id} template={t} />
          ))}
        </div>
      </div>

      {/* Segment B: Alternative Starts */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/5">
        <CSVUploadParser />

        <button
          onClick={() => {
            createScorecard('New Scorecard', 'V1')
            setStage(2 as PipelineStage)
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800/60 border border-white/5 text-sm text-neutral-300 hover:bg-dark-700/60 hover:border-white/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Start from Scratch
        </button>
      </div>

      {/* Segment C: Load Previous (collapsed) */}
      {scorecards.length > 0 && (
        <div className="rounded-xl bg-dark-800/30 border border-white/5 overflow-hidden">
          <button
            onClick={() => setShowPrevious(!showPrevious)}
            className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-dark-700/20 transition-colors"
          >
            <span className="flex items-center gap-2 text-xs text-neutral-400">
              <FolderOpen className="w-3.5 h-3.5" />
              Load Previous Scorecard ({scorecards.length})
            </span>
            {showPrevious ? (
              <ChevronUp className="w-4 h-4 text-neutral-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-neutral-500" />
            )}
          </button>
          {showPrevious && (
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <ScorecardSelector />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
