/**
 * ValuationConditionalsEditor — Configurable valuation conditional thresholds
 *
 * Allows editing the PB-anchored conditional valuation logic:
 * - Enable/disable conditional logic
 * - PE/EV/PB thresholds for weight redistribution
 * - Default and fallback weights
 * - Rule preview showing the cascade
 */

import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { ValuationConditionalConfig } from '@/types/scoring'
import { ShieldAlert } from 'lucide-react'

export function ValuationConditionalsEditor() {
  const scorecard = useActiveScorecard()
  const updateValuationConditionals = useScoringStore(s => s.updateValuationConditionals)

  if (!scorecard) return null

  // Find the valuation segment
  const valSeg = scorecard.segments.find(
    s => s.id.includes('valuation') && s.valuationConditionals
  )
  if (!valSeg?.valuationConditionals) return null

  const config = valSeg.valuationConditionals
  const segId = valSeg.id

  const update = (partial: Partial<ValuationConditionalConfig>) => {
    updateValuationConditionals(segId, { ...config, ...partial })
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-4">
      {/* Header with enable toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Valuation Conditionals</span>
        </div>
        <button
          onClick={() => update({ enabled: !config.enabled })}
          className={cn(
            'relative w-9 h-5 rounded-full transition-colors',
            config.enabled ? 'bg-primary-500' : 'bg-dark-600',
          )}
        >
          <div
            className={cn(
              'absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
              config.enabled ? 'translate-x-4' : 'translate-x-0.5',
            )}
          />
        </button>
      </div>

      {config.enabled && (
        <>
          {/* Thresholds */}
          <div className="space-y-2">
            <div className="text-xs text-neutral-400 font-medium">Thresholds (Historical 5Y Avg)</div>
            <div className="grid grid-cols-3 gap-2">
              <ThresholdInput
                label="PE exclude"
                value={config.peThreshold}
                onChange={v => update({ peThreshold: v })}
                hint={`Hist PE > ${config.peThreshold} → exclude PE`}
              />
              <ThresholdInput
                label="EV exclude"
                value={config.evThreshold}
                onChange={v => update({ evThreshold: v })}
                hint={`Hist EV > ${config.evThreshold} → exclude EV`}
              />
              <ThresholdInput
                label="PB → NA"
                value={config.pbNAThreshold}
                onChange={v => update({ pbNAThreshold: v })}
                hint={`Hist PB > ${config.pbNAThreshold} → valuation NA`}
              />
            </div>
          </div>

          {/* Default weights */}
          <WeightRow
            label="Default weights"
            values={[
              { key: 'PE', value: config.defaultWeights.pe },
              { key: 'PB', value: config.defaultWeights.pb },
              { key: 'EV', value: config.defaultWeights.ev },
            ]}
            onChange={(vals) => update({ defaultWeights: { pe: vals[0], pb: vals[1], ev: vals[2] } })}
          />

          {/* PE-excluded weights */}
          <WeightRow
            label="When PE excluded"
            values={[
              { key: 'PB', value: config.peExcludedWeights.pb },
              { key: 'EV', value: config.peExcludedWeights.ev },
            ]}
            onChange={(vals) => update({ peExcludedWeights: { pb: vals[0], ev: vals[1] } })}
          />

          {/* EV-excluded weights */}
          <WeightRow
            label="When EV excluded"
            values={[
              { key: 'PE', value: config.evExcludedWeights.pe },
              { key: 'PB', value: config.evExcludedWeights.pb },
            ]}
            onChange={(vals) => update({ evExcludedWeights: { pe: vals[0], pb: vals[1] } })}
          />

          {/* Rule preview */}
          <div className="space-y-1">
            <div className="text-xs text-neutral-400 font-medium">Rule Cascade</div>
            <div className="space-y-0.5 text-xs">
              {[
                { n: 1, rule: `PB > ${config.pbNAThreshold} → Valuation NA` },
                { n: 2, rule: `PE > ${config.peThreshold} AND EV > ${config.evThreshold} → PB only` },
                { n: 3, rule: `PE > ${config.peThreshold} → PB ${(config.peExcludedWeights.pb*100).toFixed(0)}% + EV ${(config.peExcludedWeights.ev*100).toFixed(0)}%` },
                { n: 4, rule: `EV > ${config.evThreshold} → PB ${(config.evExcludedWeights.pb*100).toFixed(0)}% + PE ${(config.evExcludedWeights.pe*100).toFixed(0)}%` },
                { n: 5, rule: `Default → PE ${(config.defaultWeights.pe*100).toFixed(0)}%, PB ${(config.defaultWeights.pb*100).toFixed(0)}%, EV ${(config.defaultWeights.ev*100).toFixed(0)}%` },
              ].map(r => (
                <div key={r.n} className="flex items-center gap-2 px-2 py-1 bg-dark-900/30 rounded">
                  <span className="text-neutral-500 w-4">{r.n}.</span>
                  <span className="text-neutral-300">{r.rule}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function ThresholdInput({
  label, value, onChange, hint,
}: {
  label: string; value: number; onChange: (v: number) => void; hint: string
}) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] text-neutral-500">{label}</div>
      <input
        type="number"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        title={hint}
        className="w-full px-2 py-1 bg-dark-800 border border-white/10 rounded text-xs font-mono text-white"
      />
    </div>
  )
}

function WeightRow({
  label, values, onChange,
}: {
  label: string
  values: { key: string; value: number }[]
  onChange: (vals: number[]) => void
}) {
  const total = Math.round(values.reduce((s, v) => s + v.value, 0) * 100)
  const isValid = total >= 99 && total <= 101

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="text-xs text-neutral-400">{label}</div>
        <span className={cn('text-[10px] font-mono', isValid ? 'text-success-400' : 'text-warning-400')}>
          {total}%
        </span>
      </div>
      <div className="flex gap-2">
        {values.map((v, i) => (
          <div key={v.key} className="flex items-center gap-1">
            <span className="text-[10px] text-neutral-500 w-6">{v.key}</span>
            <input
              type="number"
              min={0}
              max={100}
              step={5}
              value={Math.round(v.value * 100)}
              onChange={e => {
                const newVals = values.map(x => x.value)
                newVals[i] = Number(e.target.value) / 100
                onChange(newVals)
              }}
              className="w-12 px-1 py-0.5 bg-dark-800 border border-white/10 rounded text-xs font-mono text-white text-right"
            />
            <span className="text-[10px] text-neutral-500">%</span>
          </div>
        ))}
      </div>
    </div>
  )
}
