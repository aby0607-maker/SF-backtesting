/**
 * CustomMetricCreator — Stage 1: Define custom metrics mapped to CMOTS data
 *
 * Lets users create metrics from any CMOTS source (TTM fields, P&L/BS/CF/Quarterly rows).
 * Saves to store as CustomMetricDefinition, then auto-adds as CompositeMetric to a segment.
 */

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import type { CustomMetricDefinition, MetricDerivation } from '@/types/scoring'
import { Plus, Database } from 'lucide-react'

const CMOTS_SOURCES = [
  { value: 'ttm', label: 'TTM (Trailing Twelve Months)' },
  { value: 'pnl', label: 'P&L Statement' },
  { value: 'balanceSheet', label: 'Balance Sheet' },
  { value: 'cashFlow', label: 'Cash Flow Statement' },
  { value: 'quarterly', label: 'Quarterly Results' },
] as const

const DERIVATION_OPTIONS: { value: MetricDerivation; label: string }[] = [
  { value: 'latest', label: 'Latest Value' },
  { value: 'growth_cagr', label: 'CAGR (Growth Rate)' },
  { value: 'yoy_change', label: 'YoY Change %' },
  { value: 'yoy_ratio', label: 'YoY Ratio' },
]

const UNIT_OPTIONS = [
  { value: 'percent', label: 'Percent (%)' },
  { value: 'ratio', label: 'Ratio' },
  { value: 'currency', label: 'Currency (Rs.)' },
  { value: 'number', label: 'Number' },
  { value: 'times', label: 'Times (x)' },
] as const

type CmotsSource = CustomMetricDefinition['cmots_source']
type MetricUnit = CustomMetricDefinition['unit']

export function CustomMetricCreator() {
  const scorecard = useActiveScorecard()
  const addCustomMetricDefinition = useScoringStore(s => s.addCustomMetricDefinition)
  const addMetric = useScoringStore(s => s.addMetric)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [cmotsSource, setCmotsSource] = useState<CmotsSource>('ttm')
  const [cmotsField, setCmotsField] = useState('')
  const [cmotsRowno, setCmotsRowno] = useState<string>('')
  const [derivation, setDerivation] = useState<MetricDerivation>('latest')
  const [unit, setUnit] = useState<MetricUnit>('number')
  const [category, setCategory] = useState('')
  const [higherIsBetter, setHigherIsBetter] = useState(true)
  const [targetSegmentId, setTargetSegmentId] = useState('')

  if (!scorecard) return null

  const isTTM = cmotsSource === 'ttm'
  const parsedRowno = parseInt(cmotsRowno, 10)
  const canCreate =
    name.trim() !== '' &&
    targetSegmentId !== '' &&
    (isTTM ? cmotsField.trim() !== '' : !isNaN(parsedRowno) && parsedRowno > 0)

  const handleCreate = () => {
    if (!canCreate) return

    const id = `custom_${Date.now()}`

    const definition: CustomMetricDefinition = {
      id,
      name: name.trim(),
      description: description.trim() || `Custom metric: ${name.trim()}`,
      cmots_source: cmotsSource,
      cmots_field: isTTM ? cmotsField.trim() : `row_${parsedRowno}`,
      cmots_rowno: isTTM ? undefined : parsedRowno,
      derivation: isTTM ? 'latest' : derivation,
      unit,
      category: category.trim() || 'Custom',
      higherIsBetter,
      createdAt: Date.now(),
    }

    // Save to store for persistence and pipeline access
    addCustomMetricDefinition(definition)

    // Add as CompositeMetric to the target segment
    addMetric(targetSegmentId, {
      id: definition.id,
      name: definition.name,
      type: 'raw',
      rawMetric: {
        id: definition.id,
        name: definition.name,
        cmots_source: definition.cmots_source,
        cmots_field: definition.cmots_field,
        unit: definition.unit,
        description: definition.description,
        category: definition.category,
      },
      scoreBands: [],
      description: definition.description,
    })

    // Reset form
    setName('')
    setDescription('')
    setCmotsField('')
    setCmotsRowno('')
    setCategory('')
  }

  const inputClass = 'w-full px-3 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary-500/30'
  const selectClass = 'flex-1 px-2 py-1.5 bg-dark-700/40 border border-white/5 rounded-lg text-xs text-white focus:outline-none focus:border-primary-500/30'

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-amber-400" />
        <div className="text-sm font-medium text-white">Custom CMOTS Metric</div>
      </div>

      {/* Name */}
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Metric name (e.g., Asset Turnover)"
        className={inputClass}
      />

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className={inputClass}
      />

      {/* CMOTS Source */}
      <div className="space-y-1">
        <span className="text-[10px] text-neutral-500">CMOTS Data Source</span>
        <select
          value={cmotsSource}
          onChange={e => setCmotsSource(e.target.value as CmotsSource)}
          className={selectClass + ' w-full'}
        >
          {CMOTS_SOURCES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* TTM: Field name */}
      {isTTM && (
        <div className="space-y-1">
          <span className="text-[10px] text-neutral-500">TTM Field Name (e.g., ROE, PE, NetMargin)</span>
          <input
            type="text"
            value={cmotsField}
            onChange={e => setCmotsField(e.target.value)}
            placeholder="CMOTS TTM field name"
            className={inputClass}
          />
        </div>
      )}

      {/* Statement: Row number + Derivation */}
      {!isTTM && (
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-neutral-500">Statement Row Number</span>
            <input
              type="number"
              value={cmotsRowno}
              onChange={e => setCmotsRowno(e.target.value)}
              placeholder="Row #"
              min={1}
              className={inputClass}
            />
          </div>
          <div className="flex-1 space-y-1">
            <span className="text-[10px] text-neutral-500">Derivation Method</span>
            <select
              value={derivation}
              onChange={e => setDerivation(e.target.value as MetricDerivation)}
              className={selectClass + ' w-full'}
            >
              {DERIVATION_OPTIONS.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Unit + Category row */}
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <span className="text-[10px] text-neutral-500">Unit</span>
          <select
            value={unit}
            onChange={e => setUnit(e.target.value as MetricUnit)}
            className={selectClass + ' w-full'}
          >
            {UNIT_OPTIONS.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <span className="text-[10px] text-neutral-500">Category</span>
          <input
            type="text"
            value={category}
            onChange={e => setCategory(e.target.value)}
            placeholder="e.g., Profitability"
            className={inputClass}
          />
        </div>
      </div>

      {/* Higher is better toggle */}
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={higherIsBetter}
          onChange={e => setHigherIsBetter(e.target.checked)}
          className="rounded border-white/10 bg-dark-700/40 text-primary-500 focus:ring-primary-500/30"
        />
        <span className="text-xs text-neutral-400">Higher values are better</span>
      </label>

      {/* Target segment */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-neutral-500">Add to segment:</span>
        <select
          value={targetSegmentId}
          onChange={e => setTargetSegmentId(e.target.value)}
          className={selectClass}
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
            ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
            : 'bg-dark-700/60 text-neutral-600 cursor-not-allowed',
        )}
      >
        <Plus className="w-3 h-3" />
        Create Custom Metric
      </button>
    </div>
  )
}
