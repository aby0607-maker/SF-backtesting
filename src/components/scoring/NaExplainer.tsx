/**
 * NaExplainer — Inline N/A indicator with hover tooltip.
 *
 * Renders a dotted-underlined label that reveals an explanation on hover.
 * Used wherever metrics or segments display N/A, "—", or "Excl." to
 * tell the user *why* something couldn't be scored.
 */

interface NaExplainerProps {
  /** Display text — e.g. "N/A", "—", "Excl." */
  label: string
  /** Why this value is N/A. If omitted, renders plain text without tooltip. */
  reason?: string
  /** Extra Tailwind classes on the outer span */
  className?: string
}

export function NaExplainer({ label, reason, className = '' }: NaExplainerProps) {
  if (!reason) {
    return <span className={className}>{label}</span>
  }

  return (
    <span className={`relative group/na cursor-help ${className}`}>
      <span className="border-b border-dotted border-neutral-500">{label}</span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 text-[9px] leading-tight bg-dark-900 border border-white/10 rounded text-neutral-300 whitespace-nowrap opacity-0 group-hover/na:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-lg">
        {reason}
      </span>
    </span>
  )
}
