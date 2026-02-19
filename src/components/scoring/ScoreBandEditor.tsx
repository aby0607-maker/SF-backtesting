/**
 * ScoreBandEditor — Stage 1: Define scoring thresholds for a metric
 *
 * Visual color-coded bar showing bands with editable thresholds.
 * Also handles VPT conditional rules display when scoringMethod === 'conditional_vpt'.
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

const BAND_COLORS = [
  { score: 100, label: 'Excellent', color: 'bg-success-500', textColor: 'text-success-400' },
  { score: 80, label: 'Strong', color: 'bg-success-500/70', textColor: 'text-success-400' },
  { score: 65, label: 'Good', color: 'bg-teal-500', textColor: 'text-teal-400' },
  { score: 50, label: 'Average', color: 'bg-warning-500', textColor: 'text-warning-400' },
  { score: 35, label: 'Below Avg', color: 'bg-warning-500/70', textColor: 'text-warning-400' },
  { score: 20, label: 'Weak', color: 'bg-destructive-500/70', textColor: 'text-destructive-400' },
  { score: 0, label: 'Poor', color: 'bg-destructive-500', textColor: 'text-destructive-400' },
  { score: -Infinity, label: 'Negative', color: 'bg-destructive-500', textColor: 'text-destructive-400' },
]

// VPT conditional rules matching backend scoreVPT() function
const VPT_RULES = [
  { condition: 'Price ≤ -3% AND Vol < 1×', score: 0, label: 'Bearish, below-avg volume' },
  { condition: 'Price ≤ -3% AND Vol ≥ 1×', score: 10, label: 'Distribution (vol-confirmed decline)' },
  { condition: 'Price < 0% AND Vol ≥ 1×', score: 10, label: 'Mild distribution' },
  { condition: 'Price < 0% AND Vol < 1×', score: 30, label: 'Light selling, low conviction' },
  { condition: 'Price > 5% AND Vol < 1×', score: 20, label: 'Hollow rally' },
  { condition: 'Price > 0% AND Vol < 1×', score: 30, label: 'Light buying' },
  { condition: '0% < Price < 2% AND Vol ≥ 1×', score: 80, label: 'Strong accumulation' },
  { condition: 'Price ≥ 2% AND Vol ≥ 1×', score: 30, label: 'Rally, volume/price mismatch' },
  { condition: 'Fallback (flat)', score: 30, label: 'Near-zero/flat' },
]

export function ScoreBandEditor({ bands, onChange, metricName, scoringMethod }: ScoreBandEditorProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  // VPT conditional display mode
  if (scoringMethod === 'conditional_vpt') {
    return (
      <div className="space-y-3">
        {metricName && (
          <div className="text-xs font-medium text-neutral-400">
            Scoring rules for <span className="text-white">{metricName}</span>
          </div>
        )}
        <div className="text-[10px] text-neutral-500 px-2">
          VPT uses two-input conditional scoring (volume change ratio + price change %)
        </div>
        <div className="space-y-1">
          {VPT_RULES.map((rule, i) => {
            const colorInfo = BAND_COLORS.find(c => c.score <= rule.score) ?? BAND_COLORS[BAND_COLORS.length - 1]
            return (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 bg-dark-900/30 rounded-lg text-xs">
                <div className={cn('w-2 h-2 rounded-full shrink-0', colorInfo.color)} />
                <span className="text-neutral-300 flex-1">{rule.condition}</span>
                <span className={cn('font-mono font-medium', colorInfo.textColor)}>→ {rule.score}</span>
                <span className="text-neutral-500 text-[10px] ml-1 hidden sm:block">{rule.label}</span>
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

  // Visual band bar — use range-based width to support negative scores
  const minScore = Math.min(...bands.map(b => b.score))
  const maxScore = Math.max(...bands.map(b => b.score), 100)
  const range = maxScore - minScore || 1

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
