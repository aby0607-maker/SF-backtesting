import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScoreGaugeProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  className?: string
}

const sizeConfig = {
  sm: { width: 60, strokeWidth: 4, fontSize: 'text-lg', labelSize: 'text-xs' },
  md: { width: 100, strokeWidth: 6, fontSize: 'text-2xl', labelSize: 'text-sm' },
  lg: { width: 160, strokeWidth: 8, fontSize: 'text-4xl', labelSize: 'text-base' },
}

function getScoreColor(score: number): string {
  if (score >= 8) return '#00C489' // Excellent - green
  if (score >= 6) return '#69E2B0' // High - teal
  if (score >= 4) return '#FC6200' // Medium - orange
  return '#F63A63' // Low - red
}

function getGlowClass(score: number): string {
  if (score >= 8) return 'drop-shadow-[0_0_12px_rgba(0,196,137,0.6)]'
  if (score >= 6) return 'drop-shadow-[0_0_12px_rgba(105,226,176,0.5)]'
  if (score >= 4) return 'drop-shadow-[0_0_10px_rgba(252,98,0,0.5)]'
  return 'drop-shadow-[0_0_12px_rgba(246,58,99,0.6)]'
}

export function ScoreGauge({
  score,
  size = 'md',
  showLabel = false,
  label,
  className
}: ScoreGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(score / 10, 1)
  const strokeDashoffset = circumference * (1 - progress)
  const color = getScoreColor(score)
  const glowClass = getGlowClass(score)

  // Animate the score number
  useEffect(() => {
    const duration = 1200
    const steps = 60
    const increment = score / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div className={cn('relative inline-flex flex-col items-center', className)}>
      <motion.svg
        width={config.width}
        height={config.width}
        viewBox={`0 0 ${config.width} ${config.width}`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className={glowClass}
      >
        {/* Background track */}
        <circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke="#252532"
          strokeWidth={config.strokeWidth}
        />

        {/* Animated progress arc */}
        <motion.circle
          cx={config.width / 2}
          cy={config.width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
          }}
        />
      </motion.svg>

      {/* Score number in center */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <span
          className={cn(config.fontSize, 'font-bold')}
          style={{ color }}
        >
          {displayScore.toFixed(1)}
        </span>
        <span className="text-gray-500 text-xs">/10</span>
      </motion.div>

      {/* Optional label below */}
      {showLabel && label && (
        <motion.span
          className={cn(config.labelSize, 'text-gray-400 mt-2')}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {label}
        </motion.span>
      )}
    </div>
  )
}
