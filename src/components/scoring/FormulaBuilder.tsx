/**
 * FormulaBuilder — Stage 1: Visual formula creator for composite metrics
 *
 * Uses searchable combobox (typeahead) for metric selection instead of
 * basic <select> dropdowns, to handle the 200+ metric catalog.
 */

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { FormulaOperator, RawMetric, ScoreBand, MetricCatalogEntry } from '@/types/scoring'
import { METRIC_CATALOG } from '@/data/metricCatalog'
import { Plus, Search, X } from 'lucide-react'

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

// ─── Searchable Metric Combobox ───

function MetricCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (metricId: string) => void
  placeholder: string
}) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = METRIC_CATALOG.find(m => m.id === value)

  // Filter catalog based on query
  const filtered = query.trim()
    ? METRIC_CATALOG.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.category.toLowerCase().includes(query.toLowerCase()) ||
        m.cmots_field.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 20)
    : METRIC_CATALOG.slice(0, 20)

  // Group by category
  const grouped = filtered.reduce<Record<string, MetricCatalogEntry[]>>((acc, m) => {
    const cat = m.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {})

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (metricId: string) => {
    onChange(metricId)
    setQuery('')
    setIsOpen(false)
  }

  const handleClear = () => {
    onChange('')
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <div className="flex items-center gap-1 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg focus-within:border-primary-500/30">
        <Search className="w-3 h-3 text-neutral-500 shrink-0" />
        {selected && !isOpen ? (
          <button
            onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
            className="flex-1 text-left text-xs text-white truncate"
          >
            {selected.name}
          </button>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => { setQuery(e.target.value); setIsOpen(true) }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-xs text-white placeholder:text-neutral-600 focus:outline-none"
          />
        )}
        {(selected || query) && (
          <button onClick={handleClear} className="text-neutral-500 hover:text-neutral-300">
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 z-50 max-h-48 overflow-y-auto bg-dark-800 border border-white/10 rounded-lg shadow-2xl">
          {Object.entries(grouped).map(([category, metrics]) => (
            <div key={category}>
              <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-neutral-500 bg-dark-900/50 sticky top-0">
                {category}
              </div>
              {metrics.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleSelect(m.id)}
                  className={cn(
                    'w-full text-left px-3 py-1.5 text-xs hover:bg-dark-700/60 transition-colors',
                    m.id === value ? 'text-primary-400 bg-primary-500/10' : 'text-neutral-300',
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-neutral-500 text-center">No metrics found</div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main FormulaBuilder ───

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
        {/* Input A — searchable combobox */}
        <MetricCombobox
          value={inputA}
          onChange={setInputA}
          placeholder="Search Metric A..."
        />

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

        {/* Input B — searchable combobox */}
        <MetricCombobox
          value={inputB}
          onChange={setInputB}
          placeholder="Search Metric B..."
        />
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
