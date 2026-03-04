/**
 * InfoTooltip — Hover-to-reveal explainer icon.
 *
 * Renders a small HelpCircle that shows a plain-English tooltip on hover.
 * Follows the same CSS-only hover pattern as NaExplainer (group/na),
 * using a named group (group/info) to avoid conflicts.
 */

import { HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface InfoTooltipProps {
  /** The explainer text shown on hover */
  text: string
  /** Tooltip placement relative to the icon. Defaults to 'top'. */
  position?: TooltipPosition
  /** Icon size as Tailwind classes. Defaults to 'w-3 h-3'. */
  iconSize?: string
  /** Extra Tailwind classes on the outer wrapper */
  className?: string
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export function InfoTooltip({
  text,
  position = 'top',
  iconSize = 'w-3 h-3',
  className = '',
}: InfoTooltipProps) {
  return (
    <span className={cn('relative group/info inline-flex cursor-help', className)}>
      <HelpCircle
        className={cn(
          iconSize,
          'text-neutral-500 group-hover/info:text-neutral-300 transition-colors',
        )}
      />
      <span
        className={cn(
          'absolute px-2.5 py-1.5 text-[10px] leading-snug',
          'bg-dark-900 border border-white/10 rounded-lg',
          'text-neutral-300 max-w-[220px] w-max',
          'opacity-0 group-hover/info:opacity-100',
          'pointer-events-none transition-opacity duration-150',
          'z-50 shadow-lg',
          positionClasses[position],
        )}
      >
        {text}
      </span>
    </span>
  )
}
