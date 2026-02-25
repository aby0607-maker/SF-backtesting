/**
 * QuintileAnalysisChart — Stage 7: Grouped bar chart showing avg return per score quintile
 *
 * The "staircase" pattern (Q1 > Q2 > ... > Q5) is the gold standard proof
 * that a scorecard actually predicts future performance.
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
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { InfoTooltip } from '@/components/ui/InfoTooltip'

const QUINTILE_COLORS = [
  '#22c55e', // Q1 — green
  '#06b6d4', // Q2 — cyan
  '#f59e0b', // Q3 — amber
  '#f97316', // Q4 — orange
  '#ef4444', // Q5 — red
]

export function QuintileAnalysisChart() {
  const result = useBacktestResult()

  const quintiles = useMemo(() => {
    if (!result?.quintileAnalysis) return []
    return result.quintileAnalysis
  }, [result])

  if (quintiles.length === 0) {
    return null
  }

  const chartData = quintiles.map(q => ({
    quintile: `${q.quintile}\n${q.label}`,
    avgReturn: Number(q.avgReturn.toFixed(2)),
    medianReturn: Number(q.medianReturn.toFixed(2)),
    avgScore: Number(q.avgScore.toFixed(1)),
    stockCount: q.stockCount,
    pctBeatBenchmark: Number(q.pctBeatBenchmark.toFixed(0)),
  }))

  // Check for staircase pattern
  const isStaircase = quintiles.every((q, i) =>
    i === 0 || q.avgReturn <= quintiles[i - 1].avgReturn
  )

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-white">Quintile Analysis</div>
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            Average return by score quintile (Q1 = top 20% scorers)
            <InfoTooltip text="Stocks sorted into 5 buckets by score. Q1 = top 20%. Descending staircase (Q1 > Q2 > ... > Q5) = scorecard predicts returns" position="bottom" />
          </div>
        </div>
        {isStaircase && (
          <span className="px-2 py-1 rounded-lg bg-success-500/15 text-success-400 text-[10px] font-medium">
            Staircase Pattern Confirmed
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="quintile"
            tick={{ fontSize: 9, fill: '#737373' }}
            interval={0}
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
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`,
              name === 'avgReturn' ? 'Avg Return' : 'Median Return',
            ]}
          />
          <Bar dataKey="avgReturn" name="avgReturn" radius={[4, 4, 0, 0]} barSize={32}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={QUINTILE_COLORS[i]} fillOpacity={0.7} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Quintile detail cards */}
      <div className="grid grid-cols-5 gap-2 mt-3">
        {quintiles.map((q, i) => (
          <div key={q.quintile} className="text-center">
            <div className="text-[10px] font-semibold" style={{ color: QUINTILE_COLORS[i] }}>
              {q.quintile}
            </div>
            <div className="text-[9px] text-neutral-500">{q.stockCount} stocks</div>
            <div className="text-[9px] text-neutral-500">Avg: {q.avgScore.toFixed(0)}</div>
            <div className="text-[9px] text-neutral-500">{q.pctBeatBenchmark.toFixed(0)}% beat BM</div>
          </div>
        ))}
      </div>
    </div>
  )
}
