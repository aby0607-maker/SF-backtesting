/**
 * ValuationConditionalsEditor — Configure V2.2 PB-anchored valuation conditions
 *
 * Allows editing:
 * - Enable/disable conditional valuation logic
 * - PE/EV/PB thresholds for condition triggers
 * - Default weights (PE+PB+EV=100%)
 * - PE-excluded weights (PB+EV=100%)
 * - EV-excluded weights (PE+PB=100%)
 */

import { useActiveScorecard, useScoringStore } from '@/store/useScoringStore'
import { cn } from '@/lib/utils'
import type { ValuationConditionalConfig } from '@/types/scoring'

const DEFAULT_VALUATION_CONFIG: ValuationConditionalConfig = {
  enabled: true,
  peThreshold: 75,
  evThreshold: 35,
  pbNAThreshold: 30,
  defaultWeights: { pe: 0.3, pb: 0.5, ev: 0.2 },
  peExcludedWeights: { pb: 0.6, ev: 0.4 },
  evExcludedWeights: { pe: 0.4, pb: 0.6 },
}

export function ValuationConditionalsEditor() {
  const scorecard = useActiveScorecard()
  const updateValuationConditionals = useScoringStore(s => s.updateValuationConditionals)

  if (!scorecard) return null

  // Find valuation segment (look for segment with valuationConditionals or name containing "valuation")
  const valuationSegment = scorecard.segments.find(
    s => s.valuationConditionals || s.name.toLowerCase().includes('valuation')
  )

  if (!valuationSegment) return null

  const config = valuationSegment.valuationConditionals ?? DEFAULT_VALUATION_CONFIG

  const update = (updates: Partial<ValuationConditionalConfig>) => {
    updateValuationConditionals(valuationSegment.id, { ...config, ...updates })
  }

  // Build the condition cascade preview
  const conditions = [
    { label: `PB > ${config.pbNAThreshold}`, result: 'Valuation = NA (unreliable)', color: 'text-destructive-400' },
    { label: `PE > ${config.peThreshold} & EV > ${config.evThreshold}`, result: 'PB only (100%)', color: 'text-warning-400' },
    { label: `PE > ${config.peThreshold}`, result: `PB=${(config.peExcludedWeights.pb * 100).toFixed(0)}% + EV=${(config.peExcludedWeights.ev * 100).toFixed(0)}%`, color: 'text-warning-400' },
    { label: `EV > ${config.evThreshold}`, result: `PB=${(config.evExcludedWeights.pb * 100).toFixed(0)}% + PE=${(config.evExcludedWeights.pe * 100).toFixed(0)}%`, color: 'text-warning-400' },
    { label: 'Default', result: `PE=${(config.defaultWeights.pe * 100).toFixed(0)}% + PB=${(config.defaultWeights.pb * 100).toFixed(0)}% + EV=${(config.defaultWeights.ev * 100).toFixed(0)}%`, color: 'text-primary-400' },
  ]

  // Validate default weights sum to ~100%
  const defaultSum = Math.round((config.defaultWeights.pe + config.defaultWeights.pb + config.defaultWeights.ev) * 100)
  const peExclSum = Math.round((config.peExcludedWeights.pb + config.peExcludedWeights.ev) * 100)
  const evExclSum = Math.round((config.evExcludedWeights.pe + config.evExcludedWeights.pb) * 100)

  return (
    <div className="space-y-3">
      {/* Header + enable toggle */}
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-neutral-400">Valuation Conditionals</span>
        <button
          onClick={() => update({ enabled: !config.enabled })}
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
            config.enabled
              ? 'bg-primary-500/20 text-primary-400'
              : 'bg-dark-700 text-neutral-500',
          )}
        >
          {config.enabled ? 'Enabled' : 'Disabled'}
        </button>
      </div>

      {!config.enabled && (
        <p className="text-[10px] text-neutral-500">
          When disabled, valuation uses standard weighted average without conditional exclusions.
        </p>
      )}

      {config.enabled && (
        <>
          {/* Threshold inputs */}
          <div className="px-3 py-2.5 bg-dark-800/40 rounded-lg space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-1">Thresholds (Historical 5Y Avg)</div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 w-28">PB NA Threshold</span>
              <input
                type="number"
                min={1}
                max={200}
                step={1}
                value={config.pbNAThreshold}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!isNaN(val) && val > 0) update({ pbNAThreshold: val })
                }}
                className="w-16 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
              />
              <span className="text-[10px] text-neutral-500">PB above this → NA</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 w-28">PE Threshold</span>
              <input
                type="number"
                min={1}
                max={500}
                step={1}
                value={config.peThreshold}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!isNaN(val) && val > 0) update({ peThreshold: val })
                }}
                className="w-16 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
              />
              <span className="text-[10px] text-neutral-500">PE above this → exclude PE</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-neutral-400 w-28">EV Threshold</span>
              <input
                type="number"
                min={1}
                max={200}
                step={1}
                value={config.evThreshold}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!isNaN(val) && val > 0) update({ evThreshold: val })
                }}
                className="w-16 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
              />
              <span className="text-[10px] text-neutral-500">EV above this → exclude EV</span>
            </div>
          </div>

          {/* Weight sets */}
          <div className="px-3 py-2.5 bg-dark-800/40 rounded-lg space-y-3">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500">Weight Sets</div>

            {/* Default weights */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-neutral-300">Default</span>
                <span className={cn(
                  'text-[10px] font-mono',
                  defaultSum >= 99 && defaultSum <= 101 ? 'text-success-400' : 'text-warning-400',
                )}>{defaultSum}%</span>
              </div>
              <div className="flex items-center gap-2">
                {(['pe', 'pb', 'ev'] as const).map(key => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase w-6">{key}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={Math.round(config.defaultWeights[key] * 100)}
                      onChange={e => {
                        const val = Number(e.target.value)
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          update({ defaultWeights: { ...config.defaultWeights, [key]: val / 100 } })
                        }
                      }}
                      className="w-12 px-1 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* PE-excluded weights */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-neutral-300">PE Excluded</span>
                <span className={cn(
                  'text-[10px] font-mono',
                  peExclSum >= 99 && peExclSum <= 101 ? 'text-success-400' : 'text-warning-400',
                )}>{peExclSum}%</span>
              </div>
              <div className="flex items-center gap-2">
                {(['pb', 'ev'] as const).map(key => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase w-6">{key}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={Math.round(config.peExcludedWeights[key] * 100)}
                      onChange={e => {
                        const val = Number(e.target.value)
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          update({ peExcludedWeights: { ...config.peExcludedWeights, [key]: val / 100 } })
                        }
                      }}
                      className="w-12 px-1 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* EV-excluded weights */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-neutral-300">EV Excluded</span>
                <span className={cn(
                  'text-[10px] font-mono',
                  evExclSum >= 99 && evExclSum <= 101 ? 'text-success-400' : 'text-warning-400',
                )}>{evExclSum}%</span>
              </div>
              <div className="flex items-center gap-2">
                {(['pe', 'pb'] as const).map(key => (
                  <div key={key} className="flex items-center gap-1">
                    <span className="text-[10px] text-neutral-500 uppercase w-6">{key}</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={5}
                      value={Math.round(config.evExcludedWeights[key] * 100)}
                      onChange={e => {
                        const val = Number(e.target.value)
                        if (!isNaN(val) && val >= 0 && val <= 100) {
                          update({ evExcludedWeights: { ...config.evExcludedWeights, [key]: val / 100 } })
                        }
                      }}
                      className="w-12 px-1 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
                    />
                    <span className="text-[10px] text-neutral-500">%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Condition cascade preview */}
          <div className="px-3 py-2.5 bg-dark-800/80 border border-white/5 rounded-lg">
            <div className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">Condition Cascade</div>
            <div className="space-y-1">
              {conditions.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500 w-4 text-right font-mono">{i + 1}.</span>
                  <span className="text-neutral-400">{c.label}</span>
                  <span className="text-neutral-600">→</span>
                  <span className={cn('font-mono', c.color)}>{c.result}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-neutral-500">
            Conditions use Historical 5Y Average values (not TTM). First matching condition applies.
          </p>
        </>
      )}
    </div>
  )
}
