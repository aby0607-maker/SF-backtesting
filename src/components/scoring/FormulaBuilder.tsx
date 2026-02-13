/**
 * FormulaBuilder — Stage 1: Visual formula creator for composite metrics
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { FormulaOperator, RawMetric, ScoreBand } from '@/types/scoring'
import { METRIC_CATALOG } from '@/data/metricCatalog'
import { Plus } from 'lucide-react'

const OPERATORS: { value: FormulaOperator; label: string; symbol: string }[] = [
  { value: 'divide', label: 'Divide', symbol: '/' },
  { value: 'multiply', label: 'Multiply', symbol: '×' },
  { value: 'add', label: 'Add', symbol: '+' },
  { value: 'subtract', label: 'Subtract', symbol: '−' },
  { value: 'average', label: 'Average', symbol: 'avg' },
  { value: 'max', label: 'Maximum', symbol: 'max' },
  { value: 'min', label: 'Minimum', symbol: 'min' },
]

const DEFAULT_BANDS: ScoreBand[] = [
  { min: 0, max: 20, score: 10, label: 'Poor', color: 'text-destructive-400' },
  { min: 20, max: 40, score: 30, label: 'Weak', color: 'text-warning-400' },
  { min: 40, max: 60, score: 50, label: 'Fair', color: 'text-warning-400' },
  { min: 60, max: 80, score: 70, label: 'Good', color: 'text-teal-400' },
  { min: 80, max: 100, score: 90, label: 'Excellent', color: 'text-success-400' },
]

export function FormulaBuilder() {
  const scorecard = useActiveScorecard()
  const createFormula = useScoringStore(s => s.createFormula)

  const [name, setName] = useState('')
  const [inputA, setInputA] = useState<string>('')
  const [inputB, setInputB] = useState<string>('')
  const [operator, setOperator] = useState<FormulaOperator>('divide')
  const [targetSegmentId, setTargetSegmentId] = useState<string>('')

  if (!scorecard) return null

  const metricA = METRIC_CATALOG.find(m => m.id === inputA)
  const metricB = METRIC_CATALOG.find(m => m.id === inputB)

  const canCreate = name.trim() && inputA && inputB && targetSegmentId
  const formulaPreview = metricA && metricB
    ? describeFormula(metricA.name, metricB.name, operator)
    : 'Select two metrics and an operator'

  const handleCreate = () => {
    if (!canCreate || !metricA || !metricB) return

    const rawA: RawMetric = {
      id: metricA.id,
      name: metricA.name,
      cmots_source: metricA.cmots_source,
      cmots_field: metricA.cmots_field,
      unit: metricA.unit,
      description: metricA.description,
    }
    const rawB: RawMetric = {
      id: metricB.id,
      name: metricB.name,
      cmots_source: metricB.cmots_source,
      cmots_field: metricB.cmots_field,
      unit: metricB.unit,
      description: metricB.description,
    }

    createFormula(
      targetSegmentId,
      {
        id: `formula_${Date.now()}`,
        name: name.trim(),
        inputs: [rawA, rawB],
        operator,
        description: formulaPreview,
      },
      DEFAULT_BANDS,
    )

    // Reset
    setName('')
    setInputA('')
    setInputB('')
  }

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      <div className="text-sm font-medium text-white">Create Formula Metric</div>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Formula name (e.g., OCF/EBITDA Ratio)"
        className="w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30"
      />

      {/* Formula builder: A [op] B */}
      <div className="flex items-center gap-2">
        {/* Input A */}
        <select
          value={inputA}
          onChange={e => setInputA(e.target.value)}
          className="flex-1 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30"
        >
          <option value="">Metric A</option>
          {METRIC_CATALOG.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        {/* Operator */}
        <select
          value={operator}
          onChange={e => setOperator(e.target.value as FormulaOperator)}
          className="w-20 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white text-center focus:outline-none focus:border-primary-500/30"
        >
          {OPERATORS.map(op => (
            <option key={op.value} value={op.value}>{op.symbol} {op.label}</option>
          ))}
        </select>

        {/* Input B */}
        <select
          value={inputB}
          onChange={e => setInputB(e.target.value)}
          className="flex-1 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30"
        >
          <option value="">Metric B</option>
          {METRIC_CATALOG.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

      {/* Formula preview */}
      <div className="px-3 py-2 rounded-lg bg-dark-700/40 text-xs font-mono text-neutral-400">
        {formulaPreview}
      </div>

      {/* Target segment */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500">Add to segment:</span>
        <select
          value={targetSegmentId}
          onChange={e => setTargetSegmentId(e.target.value)}
          className="flex-1 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30"
        >
          <option value="">Select segment</option>
          {scorecard.segments.map(seg => (
            <option key={seg.id} value={seg.id}>{seg.name}</option>
          ))}
        </select>
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!canCreate}
        className={cn(
          'flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors',
          canCreate
            ? 'bg-primary-500/20 text-primary-400 hover:bg-primary-500/30'
            : 'bg-dark-700/60 text-neutral-600 cursor-not-allowed',
        )}
      >
        <Plus className="w-3 h-3" />
        Create Formula Metric
      </button>
    </div>
  )
}

function describeFormula(a: string, b: string, op: FormulaOperator): string {
  switch (op) {
    case 'divide': return `${a} / ${b}`
    case 'multiply': return `${a} × ${b}`
    case 'add': return `${a} + ${b}`
    case 'subtract': return `${a} − ${b}`
    case 'average': return `avg(${a}, ${b})`
    case 'max': return `max(${a}, ${b})`
    case 'min': return `min(${a}, ${b})`
  }
}
