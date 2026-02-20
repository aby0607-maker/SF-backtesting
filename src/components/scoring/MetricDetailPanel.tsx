/**
 * MetricDetailPanel — Inline-expandable per-metric configuration
 *
 * Co-locates score bands, growth period, scoring method, calculation params,
 * and negative handling rules directly on the metric they configure.
 * Used inside SegmentCard for Step 3 (Review & Tune).
 */

import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { ScoreBandEditor } from './ScoreBandEditor'
import { cn } from '@/lib/utils'
import type { CompositeMetric, NegativeHandling, NegativeCondition, NegativeAction } from '@/types/scoring'
import { ShieldAlert, Plus, Trash2 } from 'lucide-react'

const CONDITION_LABELS: Record<NegativeCondition, string> = {
  start_negative: 'Start Negative',
  end_negative: 'End Negative',
  both_negative: 'Both Negative',
  any_negative: 'Any Negative',
}

const ACTION_LABELS: Record<NegativeAction, string> = {
  zero: 'Score = 0',
  exclude: 'Exclude',
  cap: 'Cap',
  improvement_check: 'Improvement Check',
  special_calc: 'Special Calc',
  max_score: 'Max Score',
  custom: 'Custom',
}

const ACTION_COLORS: Record<NegativeAction, string> = {
  zero: 'text-destructive-400',
  exclude: 'text-warning-400',
  cap: 'text-warning-400',
  improvement_check: 'text-teal-400',
  special_calc: 'text-primary-400',
  max_score: 'text-success-400',
  custom: 'text-neutral-400',
}

interface MetricDetailPanelProps {
  metric: CompositeMetric
  segmentId: string
}

export function MetricDetailPanel({ metric, segmentId }: MetricDetailPanelProps) {
  const scorecard = useActiveScorecard()
  const updateMetric = useScoringStore(s => s.updateMetric)
  const updateScoreBands = useScoringStore(s => s.updateScoreBands)
  const updateScorecard = useScoringStore(s => s.updateScorecard)

  if (!scorecard) return null

  const isGrowth = metric.name.toLowerCase().includes('growth') || metric.name.toLowerCase().includes('cagr')
  const isVPT = metric.scoringMethod === 'conditional_vpt'
  const negativeRules = (scorecard.negativeHandlingRules || []).filter(r => r.metricId === metric.id)

  const handleAddNegativeRule = () => {
    const newRule: NegativeHandling = {
      metricId: metric.id,
      condition: 'any_negative',
      action: 'exclude',
    }
    updateScorecard(scorecard.id, {
      negativeHandlingRules: [...(scorecard.negativeHandlingRules || []), newRule],
    })
  }

  const handleRemoveNegativeRule = (index: number) => {
    const allRules = scorecard.negativeHandlingRules || []
    // Find the nth rule for this metric
    let count = 0
    const globalIndex = allRules.findIndex(r => {
      if (r.metricId === metric.id) {
        if (count === index) return true
        count++
      }
      return false
    })
    if (globalIndex >= 0) {
      const updated = [...allRules]
      updated.splice(globalIndex, 1)
      updateScorecard(scorecard.id, { negativeHandlingRules: updated })
    }
  }

  const handleUpdateNegativeRule = (index: number, field: 'condition' | 'action', value: string) => {
    const allRules = scorecard.negativeHandlingRules || []
    let count = 0
    const globalIndex = allRules.findIndex(r => {
      if (r.metricId === metric.id) {
        if (count === index) return true
        count++
      }
      return false
    })
    if (globalIndex >= 0) {
      const updated = [...allRules]
      updated[globalIndex] = { ...updated[globalIndex], [field]: value }
      updateScorecard(scorecard.id, { negativeHandlingRules: updated })
    }
  }

  return (
    <div className="px-3 pb-3 pt-2 border-t border-white/5 space-y-4">
      {/* Score Bands */}
      <ScoreBandEditor
        bands={metric.scoreBands}
        onChange={bands => updateScoreBands(segmentId, metric.id, bands)}
        metricName={metric.name}
        scoringMethod={metric.scoringMethod}
      />

      {/* Growth Period (only for growth metrics) */}
      {isGrowth && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 w-20">Growth Period</span>
          <div className="flex gap-0.5 bg-dark-800/60 border border-white/5 rounded-lg p-0.5">
            {([2, 3, 5] as const).map(period => (
              <button
                key={period}
                onClick={() => updateMetric(segmentId, metric.id, { growthPeriod: period })}
                className={cn(
                  'px-2 py-0.5 rounded-md text-xs font-medium transition-all',
                  (metric.growthPeriod ?? 5) === period
                    ? 'bg-primary-500/20 text-primary-400'
                    : 'text-neutral-500 hover:text-neutral-300',
                )}
              >
                {period}Y
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scoring Method badge */}
      {metric.scoringMethod && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neutral-500 w-20">Method</span>
          <span className={cn(
            'text-[10px] px-1.5 py-0.5 rounded font-mono',
            isVPT ? 'bg-teal-500/10 text-teal-400' : 'bg-primary-500/10 text-primary-400',
          )}>
            {isVPT ? 'conditional_vpt' : 'band_lookup'}
          </span>
        </div>
      )}

      {/* VPT Calculation Params */}
      {isVPT && (
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase tracking-wider text-neutral-500">VPT Parameters</div>
          {[
            { key: 'vptVolNumeratorDays', label: 'Vol Numerator', default: 5, suffix: 'D' },
            { key: 'vptVolDenominatorDays', label: 'Vol Denominator', default: 50, suffix: 'D' },
            { key: 'vptPriceChangeDays', label: 'Price Period', default: 5, suffix: 'D' },
          ].map(param => (
            <div key={param.key} className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 w-24">{param.label}</span>
              <input
                type="number"
                min={1}
                max={200}
                value={Number(metric.calculationParams?.[param.key] ?? param.default)}
                onChange={e => {
                  const val = Number(e.target.value)
                  if (!isNaN(val) && val > 0) {
                    updateMetric(segmentId, metric.id, {
                      calculationParams: { ...metric.calculationParams, [param.key]: val },
                    })
                  }
                }}
                className="w-14 px-1.5 py-0.5 bg-dark-700 border border-white/10 rounded text-xs font-mono text-white text-right focus:outline-none focus:border-primary-500/40"
              />
              <span className="text-[10px] text-neutral-500">{param.suffix}</span>
            </div>
          ))}
        </div>
      )}

      {/* Negative Handling (compact inline) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] text-neutral-500">
            <ShieldAlert className="w-3 h-3" />
            Negative Handling ({negativeRules.length} rules)
          </div>
          <button
            onClick={handleAddNegativeRule}
            className="flex items-center gap-0.5 text-[10px] text-neutral-500 hover:text-primary-400 transition-colors"
          >
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {negativeRules.length > 0 ? (
          <div className="space-y-1">
            {negativeRules.map((rule, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1 rounded bg-dark-900/30 text-xs">
                <select
                  value={rule.condition}
                  onChange={e => handleUpdateNegativeRule(i, 'condition', e.target.value)}
                  className="px-1.5 py-0.5 bg-dark-700 text-neutral-300 border-0 rounded text-[10px] cursor-pointer focus:outline-none"
                >
                  {Object.entries(CONDITION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <span className="text-neutral-600">→</span>
                <select
                  value={rule.action}
                  onChange={e => handleUpdateNegativeRule(i, 'action', e.target.value)}
                  className={cn(
                    'px-1.5 py-0.5 bg-dark-700 border-0 rounded text-[10px] cursor-pointer focus:outline-none',
                    ACTION_COLORS[rule.action],
                  )}
                >
                  {Object.entries(ACTION_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <button
                  onClick={() => handleRemoveNegativeRule(i)}
                  className="ml-auto p-0.5 text-neutral-600 hover:text-destructive-400 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-[10px] text-neutral-600 px-2">No negative handling rules</div>
        )}
      </div>
    </div>
  )
}
