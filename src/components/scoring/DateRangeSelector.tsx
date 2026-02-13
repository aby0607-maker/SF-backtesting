/**
 * DateRangeSelector — Stage 5: Date range and interval selection for backtest
 */

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { useScoringStore } from '@/store/useScoringStore'
import { MOCK_OHLCV } from '@/data/mockScoringData'
import { isMockMode } from '@/services/cmots/client'
import type { BacktestInterval } from '@/types/scoring'
import { Calendar, Clock, Info } from 'lucide-react'

const INTERVAL_OPTIONS: { value: BacktestInterval; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Score snapshots every trading day' },
  { value: 'weekly', label: 'Weekly', description: 'Weekly snapshots (every Friday)' },
  { value: 'monthly', label: 'Monthly', description: 'Month-end snapshots' },
  { value: 'quarterly', label: 'Quarterly', description: 'Quarter-end snapshots' },
  { value: 'yearly', label: 'Yearly', description: 'Year-end snapshots' },
]

const QUICK_PRESETS = [
  { label: '1Y', years: 1 },
  { label: '2Y', years: 2 },
  { label: '3Y', years: 3 },
  { label: '5Y', years: 5 },
]

/** Compute min/max dates available in mock OHLCV data */
function getMockDataRange(): { minDate: string; maxDate: string } {
  let minDate = '9999-12-31'
  let maxDate = '0000-01-01'
  for (const data of Object.values(MOCK_OHLCV)) {
    if (data.length > 0) {
      if (data[0].date < minDate) minDate = data[0].date
      if (data[data.length - 1].date > maxDate) maxDate = data[data.length - 1].date
    }
  }
  return { minDate, maxDate }
}

export function DateRangeSelector() {
  const backtestConfig = useScoringStore(s => s.backtestConfig)
  const setBacktestConfig = useScoringStore(s => s.setBacktestConfig)

  // In mock mode, clamp dates to available data range
  const dataRange = useMemo(() => isMockMode() ? getMockDataRange() : null, [])
  const effectiveMaxDate = dataRange?.maxDate ?? getToday()

  const [fromDate, setFromDate] = useState(backtestConfig?.dateRange.from ?? '')
  const [toDate, setToDate] = useState(backtestConfig?.dateRange.to ?? effectiveMaxDate)
  const [interval, setInterval] = useState<BacktestInterval>(backtestConfig?.interval ?? 'monthly')

  // Sync local state to store
  useEffect(() => {
    if (fromDate && toDate) {
      setBacktestConfig({
        dateRange: { from: fromDate, to: toDate },
        interval,
      })
    }
  }, [fromDate, toDate, interval])

  const applyPreset = (years: number) => {
    const toD = new Date(effectiveMaxDate)
    let fromD = new Date(effectiveMaxDate)
    fromD.setFullYear(fromD.getFullYear() - years)

    // Clamp 'from' to min available date
    if (dataRange && formatDate(fromD) < dataRange.minDate) {
      fromD = new Date(dataRange.minDate)
    }

    setFromDate(formatDate(fromD))
    setToDate(formatDate(toD))
  }

  return (
    <div className="space-y-4">
      {/* Date range */}
      <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Backtest Period</span>
        </div>

        {/* Quick presets */}
        <div className="flex gap-2 mb-3">
          {QUICK_PRESETS.map(preset => (
            <button
              key={preset.label}
              onClick={() => applyPreset(preset.years)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                isPresetActive(fromDate, toDate, preset.years)
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'bg-dark-700/40 text-neutral-500 hover:text-neutral-300',
              )}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-[10px] text-neutral-500 mb-1 block">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              min={dataRange?.minDate}
              max={toDate || effectiveMaxDate}
              className="w-full px-3 py-2 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/30 [color-scheme:dark]"
            />
          </div>
          <span className="text-neutral-500 mt-4">→</span>
          <div className="flex-1">
            <label className="text-[10px] text-neutral-500 mb-1 block">To</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              min={fromDate || dataRange?.minDate}
              max={effectiveMaxDate}
              className="w-full px-3 py-2 bg-dark-700/40 border border-white/5 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500/30 [color-scheme:dark]"
            />
          </div>
        </div>

        {fromDate && toDate && (
          <div className="mt-2 text-[10px] text-neutral-500">
            Period: {daysBetween(fromDate, toDate)} days ({monthsBetween(fromDate, toDate)} months)
          </div>
        )}

        {/* Mock data range info */}
        {dataRange && (
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-neutral-600">
            <Info className="w-3 h-3" />
            <span>Mock data available: {dataRange.minDate} — {dataRange.maxDate}</span>
          </div>
        )}
      </div>

      {/* Interval selector */}
      <div className="rounded-xl bg-dark-800/60 border border-white/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-3.5 h-3.5 text-primary-400" />
          <span className="text-sm font-medium text-white">Snapshot Interval</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {INTERVAL_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setInterval(opt.value)}
              className={cn(
                'flex flex-col items-start px-3 py-2 rounded-lg text-left transition-colors',
                interval === opt.value
                  ? 'bg-primary-500/20 border border-primary-500/30'
                  : 'bg-dark-700/40 border border-white/5 hover:border-white/10',
              )}
            >
              <span className={cn(
                'text-xs font-medium',
                interval === opt.value ? 'text-primary-400' : 'text-neutral-300'
              )}>
                {opt.label}
              </span>
              <span className="text-[9px] text-neutral-500 mt-0.5">{opt.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0]
}

function daysBetween(from: string, to: string): number {
  const diff = new Date(to).getTime() - new Date(from).getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function monthsBetween(from: string, to: string): number {
  const d1 = new Date(from)
  const d2 = new Date(to)
  return (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
}

function isPresetActive(from: string, to: string, years: number): boolean {
  if (!from || !to) return false
  const months = monthsBetween(from, to)
  return Math.abs(months - years * 12) <= 1
}
