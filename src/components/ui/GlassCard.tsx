import { motion, HTMLMotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { forwardRef, ReactNode } from 'react'

type CardVariant = 'default' | 'highlight' | 'interactive' | 'elevated'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  variant?: CardVariant
  children: ReactNode
  className?: string
  noPadding?: boolean
  hoverGlow?: 'purple' | 'green' | 'none'
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-dark-800/80 border-white/5',
  highlight: 'bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/30',
  interactive: 'bg-dark-800/80 border-white/5 cursor-pointer hover:bg-dark-700/80 hover:border-white/10',
  elevated: 'bg-dark-700/90 border-white/10 shadow-glass',
}

const hoverGlowStyles = {
  purple: 'hover:shadow-glow-purple hover:border-primary-500/30',
  green: 'hover:shadow-glow-green hover:border-success-500/30',
  none: '',
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ variant = 'default', children, className, noPadding = false, hoverGlow = 'none', ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-card backdrop-blur-xl border',
          !noPadding && 'p-4',
          variantStyles[variant],
          hoverGlow !== 'none' && [
            'transition-all duration-300',
            'hover:scale-[1.02]',
            hoverGlowStyles[hoverGlow],
          ],
          className
        )}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={variant === 'interactive' ? { scale: 1.02 } : undefined}
        whileTap={variant === 'interactive' ? { scale: 0.98 } : undefined}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

GlassCard.displayName = 'GlassCard'

// Convenience wrapper for highlighted cards with purple accent
export function HighlightCard({
  children,
  className,
  ...props
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard
      variant="highlight"
      className={cn('relative overflow-hidden', className)}
      {...props}
    >
      {/* Purple accent bar */}
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary-400 to-primary-600" />
      <div className="pl-3">{children}</div>
    </GlassCard>
  )
}

// Card for interactive list items
export function InteractiveCard({
  children,
  className,
  ...props
}: Omit<GlassCardProps, 'variant'>) {
  return (
    <GlassCard
      variant="interactive"
      hoverGlow="purple"
      className={className}
      {...props}
    >
      {children}
    </GlassCard>
  )
}
