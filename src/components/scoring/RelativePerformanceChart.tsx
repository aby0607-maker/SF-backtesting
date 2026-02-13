/**
 * RelativePerformanceChart — Stage 7: Bar chart of each stock's alpha vs cohort avg
 */

import { useMemo } from 'react'
import { useBacktestResult } from '@/store/useScoringStore'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export function RelativePerformanceChart() {
  const result = useBacktestResult()

  const chartData = useMemo(() => {
    if (!result) return []

    return result.comparisons
      .map(comp => ({
        name: comp.targetStockName,
        alpha: Number(comp.outperformancePct.toFixed(2)),
      }))
      .sort((a, b) => b.alpha - a.alpha)
  }, [result])

  if (!result || chartData.length === 0) return null

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="text-sm font-medium text-white mb-3">Relative Performance (Alpha vs Cohort Avg)</div>

      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 30)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#737373' }}
            tickFormatter={v => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: '#a3a3a3' }}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, 'Alpha']}
          />
          <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
          <Bar dataKey="alpha" radius={[0, 4, 4, 0]} barSize={18}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.alpha >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
