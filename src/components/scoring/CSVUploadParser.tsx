/**
 * CSVUploadParser — Upload a CSV file and auto-populate a scorecard
 *
 * Flow: Upload → Parse → Preview → Confirm → Load into store
 */

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { parseCSVToScorecard, parsedResultToScorecard, extractCustomDefsFromParsed } from '@/lib/csvScorecardParser'
import type { ParsedCSVResult } from '@/lib/csvScorecardParser'
import { Upload, FileSpreadsheet, Check, X, AlertTriangle } from 'lucide-react'

export function CSVUploadParser() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const loadScorecard = useScoringStore(s => s.loadScorecard)
  const addCustomMetricDefinition = useScoringStore(s => s.addCustomMetricDefinition)
  const [parsed, setParsed] = useState<ParsedCSVResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setIsLoading(true)

    try {
      const text = await file.text()
      const result = parseCSVToScorecard(text, file.name)

      if (result.summary.metricCount === 0) {
        setError('No metrics detected in CSV. Ensure rows follow "Input: <metric>" format.')
        setParsed(null)
      } else {
        setParsed(result)
      }
    } catch (err) {
      setError(`Failed to parse CSV: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setParsed(null)
    } finally {
      setIsLoading(false)
      // Reset input so same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleConfirm = () => {
    if (!parsed) return
    const scorecard = parsedResultToScorecard(parsed)
    loadScorecard(scorecard)

    // Auto-register any custom CMOTS metric definitions from CSV mapping rows
    const customDefs = extractCustomDefsFromParsed(parsed)
    for (const def of customDefs) {
      addCustomMetricDefinition(def)
    }

    setParsed(null)
  }

  const handleCancel = () => {
    setParsed(null)
    setError(null)
  }

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload button */}
      {!parsed && (
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors',
            isLoading
              ? 'bg-dark-700/40 text-neutral-500 cursor-wait'
              : 'bg-dark-800/60 border border-white/10 text-neutral-300 hover:border-primary-500/30 hover:text-primary-400',
          )}
        >
          <Upload className="w-3.5 h-3.5" />
          {isLoading ? 'Parsing...' : 'Upload CSV'}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-lg bg-destructive-500/10 border border-destructive-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive-400 mt-0.5 shrink-0" />
          <span className="text-xs text-destructive-400">{error}</span>
        </div>
      )}

      {/* Preview */}
      <AnimatePresence>
        {parsed && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-3 rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <FileSpreadsheet className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-white">{parsed.name}</span>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <SummaryItem label="Metrics" value={parsed.summary.metricCount} />
                <SummaryItem label="Segments" value={parsed.summary.segmentCount} />
                <SummaryItem label="Stocks (columns)" value={parsed.summary.stockCount} />
                <SummaryItem label="Neg. Rules" value={parsed.summary.negativeRuleCount} />
              </div>

              {/* Segments breakdown */}
              {parsed.segments.length > 0 && (
                <div className="mt-3 space-y-1">
                  <span className="text-xs text-neutral-400">Detected Segments:</span>
                  {parsed.segments.map(seg => (
                    <div key={seg.id} className="flex items-center justify-between px-2 py-1.5 rounded bg-dark-900/30">
                      <span className="text-xs text-neutral-300">{seg.name}</span>
                      <span className="text-xs text-neutral-400">
                        {seg.metrics.length} metrics
                        {seg.weight != null && ` · ${(seg.weight * 100).toFixed(1)}%`}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stock names */}
              {parsed.stockNames.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-neutral-400">Stocks: </span>
                  <span className="text-xs text-neutral-300">{parsed.stockNames.join(', ')}</span>
                </div>
              )}

              {parsed.summary.hasBands && (
                <div className="flex items-center gap-1.5 mt-2">
                  <Check className="w-3 h-3 text-success-400" />
                  <span className="text-xs text-success-400">Score bands auto-derived from input/score pairs</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-white/5 bg-dark-900/20">
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Load Scorecard
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs text-neutral-400 hover:text-neutral-300 hover:bg-dark-700/40 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between px-2 py-1 rounded bg-dark-900/30">
      <span className="text-xs text-neutral-400">{label}</span>
      <span className="text-sm font-mono text-white">{value}</span>
    </div>
  )
}
