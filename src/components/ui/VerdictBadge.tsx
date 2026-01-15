import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface VerdictBadgeProps {
  verdict: string
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

const sizeConfig = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
}

function getVerdictConfig(verdict: string): {
  bg: string
  text: string
  glow: string
  pulse: boolean
} {
  const v = verdict.toUpperCase()

  if (v.includes('STRONG') && v.includes('BUY')) {
    return {
      bg: 'bg-gradient-to-r from-success-500 to-success-600',
      text: 'text-white',
      glow: 'shadow-glow-green',
      pulse: true,
    }
  }

  if (v.includes('BUY')) {
    return {
      bg: 'bg-success-500/20 border border-success-500/40',
      text: 'text-success-400',
      glow: '',
      pulse: false,
    }
  }

  if (v.includes('HOLD')) {
    return {
      bg: 'bg-warning-500/20 border border-warning-500/40',
      text: 'text-warning-400',
      glow: '',
      pulse: false,
    }
  }

  if (v.includes('STRONG') && v.includes('AVOID')) {
    return {
      bg: 'bg-gradient-to-r from-destructive-500 to-destructive-600',
      text: 'text-white',
      glow: 'shadow-glow-red',
      pulse: true,
    }
  }

  if (v.includes('AVOID')) {
    return {
      bg: 'bg-destructive-500/20 border border-destructive-500/40',
      text: 'text-destructive-400',
      glow: '',
      pulse: false,
    }
  }

  // Default
  return {
    bg: 'bg-gray-500/20 border border-gray-500/40',
    text: 'text-gray-400',
    glow: '',
    pulse: false,
  }
}

export function VerdictBadge({
  verdict,
  size = 'md',
  animated = true,
  className,
}: VerdictBadgeProps) {
  const config = getVerdictConfig(verdict)

  const badge = (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full',
        sizeConfig[size],
        config.bg,
        config.text,
        config.glow,
        className
      )}
    >
      {verdict}
    </span>
  )

  if (!animated) return badge

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="inline-block"
    >
      {config.pulse ? (
        <motion.span
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-block"
        >
          {badge}
        </motion.span>
      ) : (
        badge
      )}
    </motion.span>
  )
}
