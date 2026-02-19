/**
 * CollapsibleSection — Reusable expand/collapse panel with animated content.
 *
 * Used across MetricCatalogBrowser, SegmentBuilder, ResultsPanel, etc.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface CollapsibleSectionProps {
  /** Section label displayed in the header */
  label: React.ReactNode
  /** Optional badge/count displayed right of the label */
  badge?: React.ReactNode
  /** Whether the section is expanded (controlled mode) */
  expanded?: boolean
  /** Callback when toggle is clicked (controlled mode) */
  onToggle?: () => void
  /** Default expanded state (uncontrolled mode) */
  defaultExpanded?: boolean
  /** Duration of the expand/collapse animation in seconds */
  duration?: number
  /** Additional className for the header button */
  headerClassName?: string
  /** Additional className for the content wrapper */
  contentClassName?: string
  children: React.ReactNode
}

export function CollapsibleSection({
  label,
  badge,
  expanded: controlledExpanded,
  onToggle,
  defaultExpanded = false,
  duration = 0.15,
  headerClassName,
  contentClassName,
  children,
}: CollapsibleSectionProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)

  // Support both controlled and uncontrolled modes
  const isControlled = controlledExpanded !== undefined
  const isExpanded = isControlled ? controlledExpanded : internalExpanded

  const handleToggle = () => {
    if (isControlled) {
      onToggle?.()
    } else {
      setInternalExpanded(prev => !prev)
    }
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        className={cn(
          'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold text-neutral-400 hover:bg-dark-700/60 transition-colors',
          headerClassName,
        )}
      >
        <span className="uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          {badge}
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration }}
            className={cn('overflow-hidden', contentClassName)}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
