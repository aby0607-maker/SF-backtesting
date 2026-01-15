import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  colorByValue?: boolean // If true, applies score-based coloring
}

function getValueColor(value: number): string {
  if (value >= 8) return 'text-success-400'
  if (value >= 6) return 'text-teal-400'
  if (value >= 4) return 'text-warning-400'
  return 'text-destructive-400'
}

export function AnimatedNumber({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  colorByValue = false,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, duration])

  const formattedValue = displayValue.toFixed(decimals)

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        colorByValue && getValueColor(value),
        className
      )}
    >
      {prefix}
      {formattedValue}
      {suffix}
    </motion.span>
  )
}

// Specialized component for currency with Indian formatting
interface AnimatedCurrencyProps {
  value: number
  duration?: number
  className?: string
}

export function AnimatedCurrency({
  value,
  duration = 1000,
  className,
}: AnimatedCurrencyProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 60
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, duration])

  // Indian number formatting
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(displayValue)

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {formatted}
    </motion.span>
  )
}

// Specialized component for percentages with color
interface AnimatedPercentProps {
  value: number
  duration?: number
  className?: string
  showSign?: boolean
}

export function AnimatedPercent({
  value,
  duration = 800,
  className,
  showSign = true,
}: AnimatedPercentProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const steps = 40
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if ((value >= 0 && current >= value) || (value < 0 && current <= value)) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value, duration])

  const isPositive = value >= 0
  const sign = showSign ? (isPositive ? '+' : '') : ''
  const colorClass = isPositive ? 'text-success-400' : 'text-destructive-400'

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(colorClass, className)}
    >
      {sign}
      {displayValue.toFixed(2)}%
    </motion.span>
  )
}
