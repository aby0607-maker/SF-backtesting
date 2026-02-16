/**
 * ScoreReturnCorrelation — Score vs Return scatter plot + correlation timeline
 *
 * Left:  Scatter plot — X=Score, Y=Return at selected interval. Regression line.
 * Right: Correlation timeline — Pearson r at each interval.
 */

import { useState, useMemo } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { cn } from '@/lib/utils'
import { useCombinedResult } from '@/store/useScoringStore'
import { TrendingUp, Activity } from 'lucide-react'

export function ScoreReturnCorrelation() {
  const combinedResult = useCombinedResult()
  const rows = combinedResult?.priceDeltaTable

  if (!rows || rows.length === 0) return null

  // Get available intervals
  const intervals = useMemo(() => {
    const cols = new Set<string>()
    for (const row of rows) {
      for (const key of Object.keys(row.deltas)) cols.add(key)
    }
    return [...cols].sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '')) || 0
      const numB = parseInt(b.replace(/\D/g, '')) || 0
      return numA - numB
    })
  }, [rows])

  const [selectedInterval, setSelectedInterval] = useState(
    // Default to last interval (total period return)
    intervals[intervals.length - 1] ?? intervals[0]
  )

  // Scatter data: { score, return, name } for selected interval
  const scatterData = useMemo(() =>
    rows
      .filter(r => r.deltas[selectedInterval] != null)
      .map(r => ({
        score: r.score,
        returnPct: r.deltas[selectedInterval],
        name: r.stockSymbol,
      })),
    [rows, selectedInterval]
  )

  // Correlation at each interval
  const correlationTimeline = useMemo(() => {
    return intervals.map(interval => {
      const pairs = rows
        .filter(r => r.deltas[interval] != null)
        .map(r => ({ x: r.score, y: r.deltas[interval] }))
      const r = pearsonCorrelation(pairs)
      return { interval, correlation: r, label: interval }
    })
  }, [rows, intervals])

  // Current interval's correlation
  const currentCorr = correlationTimeline.find(c => c.interval === selectedInterval)?.correlation ?? 0

  // Simple linear regression for the regression line
  const regressionLine = useMemo(() => {
    if (scatterData.length < 2) return null
    const n = scatterData.length
    const sumX = scatterData.reduce((s, d) => s + d.score, 0)
    const sumY = scatterData.reduce((s, d) => s + d.returnPct, 0)
    const sumXY = scatterData.reduce((s, d) => s + d.score * d.returnPct, 0)
    const sumX2 = scatterData.reduce((s, d) => s + d.score * d.score, 0)
    const denom = n * sumX2 - sumX * sumX
    if (denom === 0) return null
    const slope = (n * sumXY - sumX * sumY) / denom
    const intercept = (sumY - slope * sumX) / n
    const minScore = Math.min(...scatterData.map(d => d.score))
    const maxScore = Math.max(...scatterData.map(d => d.score))
    return [
      { score: minScore, returnPct: slope * minScore + intercept },
      { score: maxScore, returnPct: slope * maxScore + intercept },
    ]
  }, [scatterData])

  return (
    <div className="rounded-xl bg-dark-800/40 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-400" />
          <span className="text-sm font-medium text-white">Score vs Return Correlation</span>
          <span className={cn(
            'text-xs font-mono font-semibold px-2 py-0.5 rounded',
            currentCorr > 0.3 ? 'bg-success-500/15 text-success-400'
              : currentCorr > 0 ? 'bg-warning-500/15 text-warning-400'
              : 'bg-red-500/15 text-red-400',
          )}>
            r = {currentCorr.toFixed(2)}
          </span>
        </div>
        {/* Interval selector */}
        <select
          value={selectedInterval}
          onChange={e => setSelectedInterval(e.target.value)}
          className="text-xs bg-dark-700/60 border border-white/10 text-white rounded-lg px-2 py-1 focus:outline-none focus:border-primary-500/30"
        >
          {intervals.map(i => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x lg:divide-white/5">
        {/* Left: Scatter plot */}
        <div className="p-4">
          <div className="text-[10px] text-neutral-500 mb-2">Score → Return at {selectedInterval}</div>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="score"
                type="number"
                name="Score"
                domain={[0, 100]}
                tick={{ fill: '#737373', fontSize: 10 }}
                label={{ value: 'Score', position: 'bottom', fill: '#737373', fontSize: 10, offset: 5 }}
              />
              <YAxis
                dataKey="returnPct"
                type="number"
                name="Return %"
                tick={{ fill: '#737373', fontSize: 10 }}
                label={{ value: 'Return %', angle: -90, position: 'insideLeft', fill: '#737373', fontSize: 10 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <div className="font-semibold text-white">{d.name}</div>
                      <div className="text-neutral-400">Score: <span className="text-white">{d.score.toFixed(1)}</span></div>
                      <div className="text-neutral-400">Return: <span className={d.returnPct >= 0 ? 'text-success-400' : 'text-red-400'}>
                        {d.returnPct >= 0 ? '+' : ''}{d.returnPct.toFixed(1)}%
                      </span></div>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <Scatter data={scatterData} fill="#a78bfa" fillOpacity={0.7} r={5} />
              {/* Regression line */}
              {regressionLine && (
                <Scatter data={regressionLine} fill="none" line={{ stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '6 3' }} r={0} />
              )}
            </ScatterChart>
          </ResponsiveContainer>
          <div className="text-[9px] text-neutral-600 mt-1 text-center">
            Each dot = stock · Dashed line = regression · Purple = data points
          </div>
        </div>

        {/* Right: Correlation timeline */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 mb-2">
            <Activity className="w-3 h-3" />
            Correlation over time — does scoring predict better over longer periods?
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={correlationTimeline} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="label"
                tick={{ fill: '#737373', fontSize: 9 }}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                domain={[-1, 1]}
                tick={{ fill: '#737373', fontSize: 10 }}
                label={{ value: 'Pearson r', angle: -90, position: 'insideLeft', fill: '#737373', fontSize: 10 }}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null
                  const d = payload[0].payload
                  return (
                    <div className="bg-dark-800 border border-white/10 rounded-lg px-3 py-2 text-xs">
                      <div className="font-semibold text-white">{d.interval}</div>
                      <div className="text-neutral-400">Correlation: <span className={cn(
                        'font-mono font-semibold',
                        d.correlation > 0.3 ? 'text-success-400' : d.correlation > 0 ? 'text-warning-400' : 'text-red-400',
                      )}>{d.correlation.toFixed(3)}</span></div>
                    </div>
                  )
                }}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <ReferenceLine y={0.3} stroke="rgba(34,197,94,0.2)" strokeDasharray="4 4" />
              <ReferenceLine y={-0.3} stroke="rgba(239,68,68,0.2)" strokeDasharray="4 4" />
              <Line
                type="monotone"
                dataKey="correlation"
                stroke="#a78bfa"
                strokeWidth={2}
                dot={{ fill: '#a78bfa', r: 3 }}
                activeDot={{ r: 5, fill: '#c4b5fd' }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center gap-4 text-[9px] text-neutral-600 mt-1">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-success-400/40 inline-block" /> r &gt; 0.3 (good)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-red-400/40 inline-block" /> r &lt; -0.3 (inverse)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Compute Pearson correlation for an array of {x, y} pairs */
function pearsonCorrelation(pairs: { x: number; y: number }[]): number {
  const n = pairs.length
  if (n < 3) return 0
  const sumX = pairs.reduce((s, p) => s + p.x, 0)
  const sumY = pairs.reduce((s, p) => s + p.y, 0)
  const sumXY = pairs.reduce((s, p) => s + p.x * p.y, 0)
  const sumX2 = pairs.reduce((s, p) => s + p.x * p.x, 0)
  const sumY2 = pairs.reduce((s, p) => s + p.y * p.y, 0)
  const num = n * sumXY - sumX * sumY
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (den === 0) return 0
  return num / den
}
