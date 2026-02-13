/**
 * ScoreDistributionChart — Stage 3: Histogram of overall scores by verdict band
 */

import { useMemo } from 'react'
import { useCurrentScores } from '@/store/useScoringStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

const BINS = [
  { min: 0, max: 10, label: '0-10' },
  { min: 10, max: 20, label: '10-20' },
  { min: 20, max: 30, label: '20-30' },
  { min: 30, max: 40, label: '30-40' },
  { min: 40, max: 50, label: '40-50' },
  { min: 50, max: 60, label: '50-60' },
  { min: 60, max: 70, label: '60-70' },
  { min: 70, max: 80, label: '70-80' },
  { min: 80, max: 90, label: '80-90' },
  { min: 90, max: 100, label: '90-100' },
]

function getBinColor(min: number): string {
  if (min >= 80) return 'rgba(34, 197, 94, 0.7)'   // success
  if (min >= 65) return 'rgba(20, 184, 166, 0.6)'   // teal
  if (min >= 50) return 'rgba(245, 158, 11, 0.6)'   // warning
  if (min >= 35) return 'rgba(245, 158, 11, 0.4)'   // warning lighter
  return 'rgba(239, 68, 68, 0.6)'                    // destructive
}

export function ScoreDistributionChart() {
  const currentRun = useCurrentScores()

  const chartData = useMemo(() => {
    if (!currentRun) return []

    return BINS.map(bin => {
      const count = currentRun.stocks.filter(
        s => s.normalizedScore >= bin.min && s.normalizedScore < bin.max
      ).length
      return {
        label: bin.label,
        count,
        min: bin.min,
      }
    })
  }, [currentRun])

  if (!currentRun) return null

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="text-sm font-medium text-white mb-3">Score Distribution</div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: '#737373' }}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#737373' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(value: number) => [value, 'Stocks']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={24}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={getBinColor(entry.min)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
