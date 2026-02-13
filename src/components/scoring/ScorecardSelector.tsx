/**
 * ScorecardSelector — Dropdown to pick active scorecard + template loading
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { SCORECARD_TEMPLATES } from '@/data/scorecardTemplates'
import { ChevronDown, Plus, Copy, FileText } from 'lucide-react'

export function ScorecardSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const activeScorecard = useActiveScorecard()
  const scorecards = useScoringStore(s => s.scorecards)
  const setActiveScorecard = useScoringStore(s => s.setActiveScorecard)
  const loadTemplate = useScoringStore(s => s.loadTemplate)
  const duplicateScorecard = useScoringStore(s => s.duplicateScorecard)
  const createScorecard = useScoringStore(s => s.createScorecard)

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all',
          'bg-dark-800/60 border-white/10 hover:border-white/20',
        )}
      >
        <FileText className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-white font-medium max-w-[180px] truncate">
          {activeScorecard?.versionInfo.name ?? 'Select Scorecard'}
        </span>
        {activeScorecard && (
          <span className="text-xs text-neutral-500">
            {activeScorecard.versionInfo.displayVersion}
          </span>
        )}
        <ChevronDown className={cn('w-3.5 h-3.5 text-neutral-500 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-1 left-0 w-72 z-50 bg-dark-800 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Saved scorecards */}
            {scorecards.length > 0 && (
              <div className="p-2">
                <div className="text-[10px] uppercase tracking-wider text-neutral-500 px-2 mb-1">
                  Your Scorecards
                </div>
                {scorecards.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => { setActiveScorecard(sc.id); setIsOpen(false) }}
                    className={cn(
                      'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-sm transition-colors',
                      sc.id === activeScorecard?.id
                        ? 'bg-primary-500/15 text-primary-400'
                        : 'text-neutral-300 hover:bg-dark-700/80',
                    )}
                  >
                    <span className="truncate">{sc.versionInfo.name}</span>
                    <span className="text-xs text-neutral-500 ml-2">{sc.versionInfo.displayVersion}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {scorecards.length > 0 && <div className="border-t border-white/5" />}

            {/* Templates */}
            <div className="p-2">
              <div className="text-[10px] uppercase tracking-wider text-neutral-500 px-2 mb-1">
                Templates
              </div>
              {SCORECARD_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { loadTemplate(t.id); setIsOpen(false) }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm text-neutral-300 hover:bg-dark-700/80 transition-colors text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-teal-400" />
                  <div>
                    <div>{t.versionInfo.name}</div>
                    <div className="text-[10px] text-neutral-500">
                      {t.segments.length} segments, {t.segments.reduce((s, seg) => s + seg.metrics.length, 0)} metrics
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-white/5 p-2 flex gap-1">
              <button
                onClick={() => { createScorecard('New Scorecard', 'V3'); setIsOpen(false) }}
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-dark-700/80 transition-colors"
              >
                <Plus className="w-3 h-3" /> New
              </button>
              {activeScorecard && (
                <button
                  onClick={() => { duplicateScorecard(activeScorecard.id); setIsOpen(false) }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-neutral-400 hover:bg-dark-700/80 transition-colors"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
