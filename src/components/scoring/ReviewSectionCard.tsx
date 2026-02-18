/**
 * ReviewSectionCard — Stage 4: Collapsible card showing a stage's summary
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Pencil } from 'lucide-react'
import type { PipelineStage } from '@/types/scoring'

interface ReviewSectionCardProps {
  stageNumber: PipelineStage
  title: string
  summary: string
  onEdit?: () => void
  children: React.ReactNode
  defaultExpanded?: boolean
}

export function ReviewSectionCard({
  stageNumber,
  title,
  summary,
  onEdit,
  children,
  defaultExpanded = false,
}: ReviewSectionCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-neutral-500 hover:text-neutral-300 transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary-400">{stageNumber}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white">{title}</div>
          <div className="text-[10px] text-neutral-500 truncate">{summary}</div>
        </div>

        {onEdit && stageNumber <= 5 && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] text-neutral-500 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5"
          >
            <div className="px-4 py-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
