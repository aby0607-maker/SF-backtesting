/**
 * NegativeHandlingEditor — Manage per-metric negative value handling rules
 *
 * Displays the negative handling matrix for the active scorecard:
 * - Groups rules by metric
 * - Shows condition → action mapping
 * - Allows changing actions via dropdown
 * - Supports adding/removing rules
 *
 * Pre-loaded from V2.2 template with exclude-based philosophy.
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import {
  ShieldAlert,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NegativeHandling, NegativeCondition, NegativeAction } from '@/types/scoring'

// ─── Constants ───

const CONDITION_LABELS: Record<NegativeCondition, string> = {
  start_negative: 'Start Year Negative',
  end_negative: 'End Year Negative',
  both_negative: 'Both Years Negative',
  any_negative: 'Any Year Negative',
}

const ACTION_LABELS: Record<NegativeAction, string> = {
  zero: 'Score = 0',
  exclude: 'Exclude',
  cap: 'Cap Score',
  improvement_check: 'Improvement Check',
  special_calc: 'Special Calc',
  max_score: 'Score = 100',
  custom: 'Custom',
}

const ACTION_COLORS: Record<NegativeAction, string> = {
  zero: 'text-destructive-400 bg-destructive-500/10',
  exclude: 'text-warning-400 bg-warning-500/10',
  cap: 'text-amber-400 bg-amber-500/10',
  improvement_check: 'text-teal-400 bg-teal-500/10',
  special_calc: 'text-primary-400 bg-primary-500/10',
  max_score: 'text-success-400 bg-success-500/10',
  custom: 'text-violet-400 bg-violet-500/10',
}

const ALL_CONDITIONS: NegativeCondition[] = ['start_negative', 'end_negative', 'both_negative', 'any_negative']
const ALL_ACTIONS: NegativeAction[] = ['zero', 'exclude', 'cap', 'improvement_check', 'special_calc', 'max_score', 'custom']

// ─── Component ───

interface NegativeHandlingEditorProps {
  /** If provided, only show rules for this metric (inline mode) */
  metricId?: string
  /** Compact mode for inline display within SelectedMetricsList */
  compact?: boolean
}

export function NegativeHandlingEditor({ metricId, compact = false }: NegativeHandlingEditorProps) {
  const scorecard = useActiveScorecard()
  const updateScorecard = useScoringStore(s => s.updateScorecard)
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set())
  const [addingFor, setAddingFor] = useState<string | null>(null)

  if (!scorecard) return null

  const rules = scorecard.negativeHandlingRules || []

  // Get all metric names from segments for display
  const metricNameMap = new Map<string, string>()
  for (const seg of scorecard.segments) {
    for (const m of seg.metrics) {
      metricNameMap.set(m.id, m.name)
    }
  }

  // Filter rules if metricId is provided
  const filteredRules = metricId ? rules.filter(r => r.metricId === metricId) : rules

  // Group rules by metric
  const grouped = new Map<string, NegativeHandling[]>()
  for (const rule of filteredRules) {
    const existing = grouped.get(rule.metricId) || []
    existing.push(rule)
    grouped.set(rule.metricId, existing)
  }

  // Sort by metric name
  const sortedMetricIds = [...grouped.keys()].sort((a, b) => {
    const nameA = metricNameMap.get(a) || a
    const nameB = metricNameMap.get(b) || b
    return nameA.localeCompare(nameB)
  })

  const toggleExpand = (id: string) => {
    const next = new Set(expandedMetrics)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setExpandedMetrics(next)
  }

  const updateRule = (metricId: string, condition: NegativeCondition, updates: Partial<NegativeHandling>) => {
    const updated = rules.map(r => {
      if (r.metricId === metricId && r.condition === condition) {
        return { ...r, ...updates }
      }
      return r
    })
    updateScorecard(scorecard.id, { negativeHandlingRules: updated })
  }

  const removeRule = (metricId: string, condition: NegativeCondition) => {
    const updated = rules.filter(r => !(r.metricId === metricId && r.condition === condition))
    updateScorecard(scorecard.id, { negativeHandlingRules: updated })
  }

  const addRule = (metricId: string, condition: NegativeCondition, action: NegativeAction) => {
    const exists = rules.some(r => r.metricId === metricId && r.condition === condition)
    if (exists) return // Don't add duplicates

    const metricName = metricNameMap.get(metricId) || metricId
    const updated = [
      ...rules,
      {
        metricId,
        condition,
        action,
        description: `${CONDITION_LABELS[condition]} → ${ACTION_LABELS[action]} for ${metricName}`,
      },
    ]
    updateScorecard(scorecard.id, { negativeHandlingRules: updated })
    setAddingFor(null)
  }

  // For "add new rule" — find conditions not yet defined for a metric
  const getAvailableConditions = (metricId: string): NegativeCondition[] => {
    const existing = new Set(rules.filter(r => r.metricId === metricId).map(r => r.condition))
    return ALL_CONDITIONS.filter(c => !existing.has(c))
  }

  // For "add rule to new metric" — find metrics without any rules
  const getMetricsWithoutRules = (): { id: string; name: string }[] => {
    const metricsWithRules = new Set(rules.map(r => r.metricId))
    const result: { id: string; name: string }[] = []
    for (const seg of scorecard.segments) {
      for (const m of seg.metrics) {
        if (!metricsWithRules.has(m.id)) {
          result.push({ id: m.id, name: m.name })
        }
      }
    }
    return result
  }

  if (compact && metricId) {
    return <CompactRulesList rules={filteredRules} metricId={metricId} onRemove={removeRule} />
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-warning-400" />
          <span className="text-sm font-medium text-white">Negative Value Handling</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-warning-500/10 text-warning-400 font-medium">
            {rules.length} rules
          </span>
        </div>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-dark-800/60 border border-white/5">
        <Info className="w-3.5 h-3.5 text-neutral-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-neutral-400 leading-relaxed">
          When a metric has a negative raw value (e.g., negative EBITDA), these rules decide how to
          handle it. <strong className="text-neutral-300">Exclude</strong> redistributes weight to
          remaining metrics. <strong className="text-neutral-300">Score = 0</strong> penalizes directly.
        </p>
      </div>

      {/* Rules grouped by metric */}
      <div className="space-y-1">
        {sortedMetricIds.map(mId => {
          const metricRules = grouped.get(mId) || []
          const metricName = metricNameMap.get(mId) || mId
          const isExpanded = expandedMetrics.has(mId)
          const availableConditions = getAvailableConditions(mId)

          return (
            <div key={mId} className="rounded-lg border border-white/5 overflow-hidden">
              {/* Metric header */}
              <button
                onClick={() => toggleExpand(mId)}
                className="w-full flex items-center gap-2 px-3 py-2 bg-dark-800/40 hover:bg-dark-800/60 transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-neutral-500" />
                )}
                <span className="text-xs font-medium text-white truncate">{metricName}</span>
                <span className="text-[10px] text-neutral-500 ml-auto">
                  {metricRules.length} rule{metricRules.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Expanded rules */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="px-3 py-2 space-y-1.5 bg-dark-900/30">
                      {metricRules.map(rule => (
                        <RuleRow
                          key={`${rule.metricId}-${rule.condition}`}
                          rule={rule}
                          onUpdateAction={(action) => updateRule(rule.metricId, rule.condition, { action })}
                          onRemove={() => removeRule(rule.metricId, rule.condition)}
                        />
                      ))}

                      {/* Add new condition */}
                      {availableConditions.length > 0 && (
                        <AddRuleRow
                          metricId={mId}
                          availableConditions={availableConditions}
                          isOpen={addingFor === mId}
                          onToggle={() => setAddingFor(addingFor === mId ? null : mId)}
                          onAdd={addRule}
                        />
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Add rules for a new metric */}
      {!metricId && (
        <AddNewMetricRules
          metrics={getMetricsWithoutRules()}
          onAdd={(mId) => {
            addRule(mId, 'any_negative', 'exclude')
            setExpandedMetrics(prev => new Set([...prev, mId]))
          }}
        />
      )}
    </div>
  )
}

// ─── Sub-Components ───

function RuleRow({
  rule,
  onUpdateAction,
  onRemove,
}: {
  rule: NegativeHandling
  onUpdateAction: (action: NegativeAction) => void
  onRemove: () => void
}) {
  return (
    <div className="flex items-center gap-2 group">
      {/* Condition badge */}
      <span className="text-[10px] px-2 py-0.5 rounded bg-dark-700 text-neutral-300 font-medium whitespace-nowrap">
        {CONDITION_LABELS[rule.condition]}
      </span>

      <span className="text-neutral-600 text-[10px]">→</span>

      {/* Action dropdown */}
      <select
        value={rule.action}
        onChange={e => onUpdateAction(e.target.value as NegativeAction)}
        className={cn(
          'text-[10px] px-2 py-0.5 rounded font-medium border-0 cursor-pointer',
          'focus:outline-none focus:ring-1 focus:ring-primary-500/30',
          ACTION_COLORS[rule.action],
        )}
      >
        {ALL_ACTIONS.map(action => (
          <option key={action} value={action}>
            {ACTION_LABELS[action]}
          </option>
        ))}
      </select>

      {/* Description (tooltip on hover) */}
      {rule.description && (
        <span className="text-[10px] text-neutral-600 truncate flex-1 hidden lg:block" title={rule.description}>
          {rule.description}
        </span>
      )}

      {/* Remove button */}
      <button
        onClick={onRemove}
        className="p-0.5 rounded text-neutral-600 hover:text-destructive-400 hover:bg-destructive-500/10 transition-colors opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  )
}

function CompactRulesList({
  rules,
  metricId,
  onRemove,
}: {
  rules: NegativeHandling[]
  metricId: string
  onRemove: (metricId: string, condition: NegativeCondition) => void
}) {
  if (rules.length === 0) {
    return (
      <div className="text-[10px] text-neutral-600 px-2 py-1">
        No negative handling rules
      </div>
    )
  }

  return (
    <div className="space-y-1 px-2 py-1">
      {rules.map(rule => (
        <div key={`${rule.metricId}-${rule.condition}`} className="flex items-center gap-1.5 group">
          <span className="text-[10px] text-neutral-500 whitespace-nowrap">
            {CONDITION_LABELS[rule.condition]}
          </span>
          <span className="text-neutral-700 text-[10px]">→</span>
          <span className={cn('text-[10px] px-1 py-px rounded font-medium', ACTION_COLORS[rule.action])}>
            {ACTION_LABELS[rule.action]}
          </span>
          <button
            onClick={() => onRemove(metricId, rule.condition)}
            className="p-0.5 text-neutral-700 hover:text-destructive-400 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

function AddRuleRow({
  metricId,
  availableConditions,
  isOpen,
  onToggle,
  onAdd,
}: {
  metricId: string
  availableConditions: NegativeCondition[]
  isOpen: boolean
  onToggle: () => void
  onAdd: (metricId: string, condition: NegativeCondition, action: NegativeAction) => void
}) {
  const [selectedCondition, setSelectedCondition] = useState<NegativeCondition>(availableConditions[0])
  const [selectedAction, setSelectedAction] = useState<NegativeAction>('exclude')

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-[10px] text-neutral-500 hover:text-primary-400 transition-colors py-0.5"
      >
        <Plus className="w-2.5 h-2.5" />
        Add condition
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 py-1 border-t border-white/5">
      <select
        value={selectedCondition}
        onChange={e => setSelectedCondition(e.target.value as NegativeCondition)}
        className="text-[10px] px-1.5 py-0.5 rounded bg-dark-700 text-neutral-300 border-0 cursor-pointer"
      >
        {availableConditions.map(c => (
          <option key={c} value={c}>{CONDITION_LABELS[c]}</option>
        ))}
      </select>
      <span className="text-neutral-600 text-[10px]">→</span>
      <select
        value={selectedAction}
        onChange={e => setSelectedAction(e.target.value as NegativeAction)}
        className={cn(
          'text-[10px] px-1.5 py-0.5 rounded font-medium border-0 cursor-pointer',
          ACTION_COLORS[selectedAction],
        )}
      >
        {ALL_ACTIONS.map(a => (
          <option key={a} value={a}>{ACTION_LABELS[a]}</option>
        ))}
      </select>
      <button
        onClick={() => onAdd(metricId, selectedCondition, selectedAction)}
        className="text-[10px] px-2 py-0.5 rounded bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
      >
        Add
      </button>
      <button
        onClick={onToggle}
        className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
      >
        Cancel
      </button>
    </div>
  )
}

function AddNewMetricRules({
  metrics,
  onAdd,
}: {
  metrics: { id: string; name: string }[]
  onAdd: (metricId: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (metrics.length === 0) return null

  return (
    <div className="pt-2 border-t border-white/5">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-primary-400 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add rules for another metric
        </button>
      ) : (
        <div className="space-y-1">
          <div className="text-[10px] text-neutral-500 mb-1">Select a metric to add negative handling rules:</div>
          <div className="flex flex-wrap gap-1">
            {metrics.slice(0, 10).map(m => (
              <button
                key={m.id}
                onClick={() => { onAdd(m.id); setIsOpen(false) }}
                className="text-[10px] px-2 py-0.5 rounded bg-dark-700 text-neutral-300 hover:bg-dark-600 hover:text-white transition-colors"
              >
                {m.name}
              </button>
            ))}
          </div>
          {metrics.length > 10 && (
            <div className="text-[10px] text-neutral-600">+{metrics.length - 10} more metrics</div>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="text-[10px] text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}
