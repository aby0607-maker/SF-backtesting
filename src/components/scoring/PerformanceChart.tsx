/**
 * PerformanceChart — Stage 7: Equity curve showing stock(s) vs cohort avg vs benchmark
 */

import { useMemo } from 'react'
import { useBacktestResult } from '@/store/useScoringStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

const STOCK_COLORS = [
  '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981',
  '#ec4899', '#6366f1', '#14b8a6',
]

export function PerformanceChart() {
  const result = useBacktestResult()

  const chartData = useMemo(() => {
    if (!result || result.comparisons.length === 0) return []

    // Use the first comparison's cohort avg as the baseline
    const firstComp = result.comparisons[0]
    const periods = firstComp.cohortAvg.periods

    return periods.map((period, i) => {
      const point: Record<string, string | number> = {
        date: period.date,
        'Cohort Avg': Number(period.cumulativeReturn.toFixed(2)),
      }

      // Add each target stock
      for (const comp of result.comparisons) {
        const stockPeriod = comp.targetPerformance.periods[i]
        if (stockPeriod) {
          point[comp.targetStockName] = Number(stockPeriod.cumulativeReturn.toFixed(2))
        }
      }

      return point
    })
  }, [result])

  if (!result || chartData.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500 text-sm">
        No performance data available.
      </div>
    )
  }

  const stockNames = result.comparisons.map(c => c.targetStockName)

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center gap-1.5 text-sm font-medium text-white mb-3">
        Cumulative Returns
        <InfoTooltip text="Each line tracks a stock's total return from day one. Dashed line = cohort average benchmark" position="right" />
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#737373' }}
            tickFormatter={d => d.slice(5)}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#737373' }}
            tickFormatter={v => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(value: number) => [`${value.toFixed(2)}%`, undefined]}
          />
          <Legend wrapperStyle={{ fontSize: '10px' }} />

          {/* Cohort average line (dashed) */}
          <Line
            type="monotone"
            dataKey="Cohort Avg"
            stroke="#6b7280"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
          />

          {/* Stock lines */}
          {stockNames.map((name, i) => (
            <Line
              key={name}
              type="monotone"
              dataKey={name}
              stroke={STOCK_COLORS[i % STOCK_COLORS.length]}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
