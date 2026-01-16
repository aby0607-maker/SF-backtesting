import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface SparklineProps {
  data: number[]
  color?: 'green' | 'red' | 'purple' | 'auto'
  width?: number
  height?: number
  className?: string
  showGlow?: boolean
}

// Generate mock price data for demo
export function generateMockPriceData(
  currentPrice: number,
  change: number,
  points: number = 20
): number[] {
  const data: number[] = []
  const volatility = currentPrice * 0.02 // 2% volatility
  let price = currentPrice / (1 + change / 100) // Starting price

  for (let i = 0; i < points; i++) {
    const noise = (Math.random() - 0.5) * volatility
    // Trend towards current price
    const trend = ((currentPrice - price) / (points - i)) * 0.5
    price = price + trend + noise
    data.push(price)
  }

  // Ensure last point is close to current
  data[data.length - 1] = currentPrice

  return data
}

export function Sparkline({
  data,
  color = 'auto',
  width = 80,
  height = 30,
  className,
  showGlow = true,
}: SparklineProps) {
  // Determine color based on trend if auto
  let strokeColor: string
  let glowColor: string

  if (color === 'auto') {
    const isPositive = data[data.length - 1] >= data[0]
    strokeColor = isPositive ? '#00C489' : '#F63A63'
    glowColor = isPositive
      ? 'drop-shadow-[0_0_6px_rgba(0,196,137,0.6)]'
      : 'drop-shadow-[0_0_6px_rgba(246,58,99,0.6)]'
  } else {
    const colors = {
      green: { stroke: '#00C489', glow: 'drop-shadow-[0_0_6px_rgba(0,196,137,0.6)]' },
      red: { stroke: '#F63A63', glow: 'drop-shadow-[0_0_6px_rgba(246,58,99,0.6)]' },
      purple: { stroke: '#7E5FF7', glow: 'drop-shadow-[0_0_6px_rgba(126,95,247,0.6)]' },
    }
    strokeColor = colors[color].stroke
    glowColor = colors[color].glow
  }

  const chartData = data.map((value, index) => ({ value, index }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className={cn(showGlow && glowColor, className)}
      style={{ width, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <YAxis domain={['dataMin', 'dataMax']} hide />
          <Line
            type="monotone"
            dataKey="value"
            stroke={strokeColor}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
