/**
 * ScoreTrajectoryChart — Stage 7: Stock score over time with verdict zone backgrounds
 */

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useBacktestResult, useCurrentScores } from '@/store/useScoringStore'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts'

export function ScoreTrajectoryChart() {
  const result = useBacktestResult()
  const currentRun = useCurrentScores()
  const [selectedStockId, setSelectedStockId] = useState<string | null>(null)

  const stocks = currentRun?.stocks ?? []
  const selectedStock = stocks.find(s => s.stockId === selectedStockId) ?? stocks[0]

  const trajectoryData = useMemo(() => {
    if (!result || !selectedStock) return []

    // Build score trajectory from snapshots
    return result.snapshots.map(snapshot => {
      const stockScore = snapshot.stockScores.find(s => s.stockId === selectedStock.stockId)
      // Get price from comparisons
      const comp = result.comparisons.find(c => c.targetStockId === selectedStock.stockId)
      const pricePeriod = comp?.targetPerformance.periods.find(p => p.date === snapshot.date)

      return {
        date: snapshot.date,
        score: stockScore?.normalizedScore ?? 0,
        verdict: stockScore?.verdict ?? '',
        price: pricePeriod?.price ?? 0,
      }
    })
  }, [result, selectedStock])

  if (!result || trajectoryData.length === 0) return null

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm font-medium text-white">Score Trajectory</div>
          <div className="text-[10px] text-neutral-500">Score over time with verdict zones</div>
        </div>

        <select
          value={selectedStock?.stockId ?? ''}
          onChange={e => setSelectedStockId(e.target.value)}
          className="px-2 py-1 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30"
        >
          {stocks.slice(0, 20).map(s => (
            <option key={s.stockId} value={s.stockId}>
              {s.stockName}
            </option>
          ))}
        </select>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={trajectoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          {/* Verdict zone backgrounds */}
          <ReferenceArea y1={80} y2={100} fill="rgba(34, 197, 94, 0.08)" />
          <ReferenceArea y1={65} y2={80} fill="rgba(20, 184, 166, 0.06)" />
          <ReferenceArea y1={50} y2={65} fill="rgba(245, 158, 11, 0.05)" />
          <ReferenceArea y1={35} y2={50} fill="rgba(245, 158, 11, 0.03)" />
          <ReferenceArea y1={0} y2={35} fill="rgba(239, 68, 68, 0.05)" />

          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#737373' }}
            tickFormatter={d => d.slice(5)}
          />
          <YAxis
            yAxisId="score"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: '#737373' }}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: '#737373' } }}
          />
          <YAxis
            yAxisId="price"
            orientation="right"
            tick={{ fontSize: 10, fill: '#737373' }}
            label={{ value: 'Price', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: '#737373' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1a1a2e',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              fontSize: '11px',
            }}
            formatter={(value: number, name: string) => [
              name === 'score' ? value.toFixed(1) : `₹${value.toFixed(0)}`,
              name === 'score' ? 'Score' : 'Price',
            ]}
          />

          {/* Score line */}
          <Line
            yAxisId="score"
            type="monotone"
            dataKey="score"
            stroke="#06b6d4"
            strokeWidth={2}
            dot={false}
          />

          {/* Price overlay */}
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="price"
            stroke="rgba(255,255,255,0.3)"
            strokeDasharray="3 3"
            strokeWidth={1}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Verdict zone legend */}
      <div className="flex items-center justify-center gap-3 mt-2">
        {[
          { label: 'Strong Buy', color: 'bg-success-500/30' },
          { label: 'Buy', color: 'bg-teal-500/20' },
          { label: 'Hold', color: 'bg-warning-500/15' },
          { label: 'Review', color: 'bg-warning-500/10' },
          { label: 'Sell', color: 'bg-destructive-500/15' },
        ].map(zone => (
          <div key={zone.label} className="flex items-center gap-1">
            <div className={cn('w-3 h-2 rounded-sm', zone.color)} />
            <span className="text-[9px] text-neutral-500">{zone.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
