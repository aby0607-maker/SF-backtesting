/**
 * ScoreBandEditor — Stage 1: Define scoring thresholds for a metric
 *
 * Visual color-coded bar showing bands with editable thresholds.
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ScoreBand } from '@/types/scoring'

interface ScoreBandEditorProps {
  bands: ScoreBand[]
  onChange: (bands: ScoreBand[]) => void
  metricName?: string
  scoringMethod?: 'band_lookup' | 'conditional_vpt'
}

const VPT_RULES = [
  { condition: 'price ≤ -3% AND vol < 1×', score: 0, label: 'Bearish, below-avg volume' },
  { condition: 'price ≤ -3% AND vol ≥ 1×', score: 10, label: 'Distribution (vol-confirmed decline)' },
  { condition: 'price < 0% AND vol ≥ 1×', score: 10, label: 'Mild distribution' },
  { condition: 'price < 0% AND vol < 1×', score: 30, label: 'Light selling, low conviction' },
  { condition: 'price > 5% AND vol < 1×', score: 20, label: 'Hollow rally (unconfirmed)' },
  { condition: '0% < price < 2% AND vol ≥ 1×', score: 80, label: 'Strong accumulation' },
  { condition: 'price ≥ 2% AND vol ≥ 1×', score: 30, label: 'Rally, vol/price mismatch' },
  { condition: 'price > 0% AND vol < 1×', score: 30, label: 'Light buying' },
  { condition: 'Fallback (flat)', score: 30, label: 'Near-zero / neutral' },
]

const BAND_COLORS = [
  { score: 100, label: 'Excellent', color: 'bg-success-500', textColor: 'text-success-400' },
  { score: 80, label: 'Strong', color: 'bg-success-500/70', textColor: 'text-success-400' },
  { score: 65, label: 'Good', color: 'bg-teal-500', textColor: 'text-teal-400' },
  { score: 50, label: 'Average', color: 'bg-warning-500', textColor: 'text-warning-400' },
  { score: 35, label: 'Below Avg', color: 'bg-warning-500/70', textColor: 'text-warning-400' },
  { score: 20, label: 'Weak', color: 'bg-destructive-500/70', textColor: 'text-destructive-400' },
  { score: 0, label: 'Poor', color: 'bg-destructive-500', textColor: 'text-destructive-400' },
  { score: -Infinity, label: 'Negative', color: 'bg-destructive-600', textColor: 'text-destructive-400' },
]

export function ScoreBandEditor({ bands, onChange, metricName, scoringMethod }: ScoreBandEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // VPT uses two-input conditional scoring, not band lookup
  if (scoringMethod === 'conditional_vpt') {
    return (
      <div className="space-y-3">
        {metricName && (
          <div className="text-xs font-medium text-neutral-400">
            Score rules for <span className="text-white">{metricName}</span>
          </div>
        )}
        <div className="text-xs text-neutral-500 mb-1">
          VPT uses two-input conditional scoring (volume change ratio + price change %)
        </div>
        <div className="space-y-0.5">
          {VPT_RULES.map((rule, i) => {
            const colorInfo = BAND_COLORS.find(c => c.score <= rule.score) ?? BAND_COLORS[BAND_COLORS.length - 1]
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-dark-900/30 rounded text-xs">
                <div className={cn('w-2 h-2 rounded-full shrink-0', colorInfo.color)} />
                <span className="text-neutral-300 flex-1">{rule.condition}</span>
                <span className={cn('font-mono font-medium', colorInfo.textColor)}>→ {rule.score}</span>
                <span className="text-neutral-500 text-[10px] hidden sm:inline">{rule.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const updateBand = (index: number, field: keyof ScoreBand, value: string | number) => {
    const updated = [...bands]
    updated[index] = { ...updated[index], [field]: value }
    onChange(updated)
  }

  // Visual band bar — handle negative scores using absolute range
  const scores = bands.map(b => b.score)
  const minScore = Math.min(...scores, 0)
  const maxScoreVal = Math.max(...scores, 100)
  const range = maxScoreVal - minScore || 1

  return (
    <div className="space-y-3">
      {metricName && (
        <div className="text-xs font-medium text-neutral-400">
          Score bands for <span className="text-white">{metricName}</span>
        </div>
      )}

      {/* Visual bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {bands.map((band, i) => {
          const width = ((band.score - minScore) / range) * 100
          const colorInfo = BAND_COLORS.find(c => c.score <= band.score) ?? BAND_COLORS[BAND_COLORS.length - 1]
          return (
            <div
              key={i}
              className={cn('h-full transition-all', colorInfo.color)}
              style={{ width: `${Math.max(width, 5)}%` }}
            />
          )
        })}
      </div>

      {/* Band rows */}
      <div className="space-y-1">
        {bands.map((band, i) => {
          const colorInfo = BAND_COLORS.find(c => c.score <= band.score) ?? BAND_COLORS[BAND_COLORS.length - 1]
          const isEditing = editingIndex === i

          return (
            <div
              key={i}
              onClick={() => setEditingIndex(isEditing ? null : i)}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors',
                isEditing ? 'bg-dark-700/80 border border-white/10' : 'hover:bg-dark-700/40',
              )}
            >
              {/* Color dot */}
              <div className={cn('w-2 h-2 rounded-full shrink-0', colorInfo.color)} />

              {/* Range inputs */}
              {isEditing ? (
                <>
                  <input
                    type="number"
                    value={band.min === -Infinity ? '' : band.min}
                    onChange={e => updateBand(i, 'min', e.target.value ? Number(e.target.value) : -Infinity)}
                    placeholder="Min"
                    className="w-16 px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded text-xs text-white"
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-neutral-500">to</span>
                  <input
                    type="number"
                    value={band.max === Infinity ? '' : band.max}
                    onChange={e => updateBand(i, 'max', e.target.value ? Number(e.target.value) : Infinity)}
                    placeholder="Max"
                    className="w-16 px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded text-xs text-white"
                    onClick={e => e.stopPropagation()}
                  />
                  <span className="text-neutral-500">→</span>
                  <input
                    type="number"
                    value={band.score}
                    onChange={e => updateBand(i, 'score', Number(e.target.value))}
                    className="w-12 px-1.5 py-0.5 bg-dark-800 border border-white/10 rounded text-xs text-white"
                    onClick={e => e.stopPropagation()}
                  />
                </>
              ) : (
                <>
                  <span className="text-neutral-400 w-24 truncate">
                    {band.min === -Infinity ? '< ' : `${band.min} – `}
                    {band.max === Infinity ? '∞' : band.max}
                  </span>
                  <span className="text-neutral-500">→</span>
                  <span className={cn('font-mono font-medium', colorInfo.textColor)}>{band.score}</span>
                  <span className="text-neutral-500 ml-auto">{band.label}</span>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
