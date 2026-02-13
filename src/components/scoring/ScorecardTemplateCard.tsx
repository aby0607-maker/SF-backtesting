/**
 * ScorecardTemplateCard — Stage 2: Pre-built scorecard template card
 */

import { motion } from 'framer-motion'
import { useScoringStore } from '@/store/useScoringStore'
import type { ScorecardVersion } from '@/types/scoring'
import { FileText, Layers, BarChart3, Zap } from 'lucide-react'

interface ScorecardTemplateCardProps {
  template: ScorecardVersion
}

export function ScorecardTemplateCard({ template }: ScorecardTemplateCardProps) {
  const loadTemplate = useScoringStore(s => s.loadTemplate)

  const totalMetrics = template.segments.reduce((sum, seg) => sum + seg.metrics.length, 0)
  const hasOverlays = (template.compositeFormula.overlaySegments?.length ?? 0) > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-dark-800/60 border border-white/5 p-4 hover:border-primary-500/20 transition-all group"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 rounded-lg bg-primary-500/10">
          <FileText className="w-4 h-4 text-primary-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white">{template.versionInfo.name}</h3>
          <p className="text-[10px] text-neutral-500 mt-0.5">
            {template.versionInfo.displayVersion}
            {template.versionInfo.sourceReference && ` • ${template.versionInfo.sourceReference}`}
          </p>
        </div>
      </div>

      {template.versionInfo.description && (
        <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{template.versionInfo.description}</p>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-3 mb-3 text-[10px] text-neutral-500">
        <div className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          <span>{template.segments.length} segments</span>
        </div>
        <div className="flex items-center gap-1">
          <BarChart3 className="w-3 h-3" />
          <span>{totalMetrics} metrics</span>
        </div>
        {hasOverlays && (
          <div className="flex items-center gap-1 text-warning-400/70">
            <Zap className="w-3 h-3" />
            <span>Overlays</span>
          </div>
        )}
      </div>

      {/* Segments preview */}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.segments.map(seg => (
          <span
            key={seg.id}
            className="px-2 py-0.5 rounded-full bg-dark-700/80 text-[10px] text-neutral-400 border border-white/5"
          >
            {seg.name} ({seg.metrics.length})
          </span>
        ))}
      </div>

      <button
        onClick={() => loadTemplate(template.id)}
        className="w-full py-2 rounded-lg bg-primary-500/15 text-primary-400 text-xs font-medium hover:bg-primary-500/25 transition-colors"
      >
        Use Template
      </button>
    </motion.div>
  )
}
