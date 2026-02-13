/**
 * VersionDiffView — Side-by-side comparison of two scorecard micro versions
 */

import { useMemo } from 'react'
import type { ScorecardVersion } from '@/types/scoring'
import { ArrowLeftRight, Plus, Minus, Edit3 } from 'lucide-react'

interface VersionDiffViewProps {
  versionA: ScorecardVersion
  versionB: ScorecardVersion
}

interface DiffItem {
  label: string
  type: 'added' | 'removed' | 'changed' | 'unchanged'
  oldValue?: string
  newValue?: string
}

export function VersionDiffView({ versionA, versionB }: VersionDiffViewProps) {
  const diffs = useMemo(() => computeDiffs(versionA, versionB), [versionA, versionB])
  const hasChanges = diffs.some(d => d.type !== 'unchanged')

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <ArrowLeftRight className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm font-medium text-white">Version Comparison</span>
      </div>

      {/* Version labels */}
      <div className="grid grid-cols-2 gap-px bg-white/5">
        <div className="bg-dark-800/80 px-4 py-2">
          <div className="text-xs font-semibold text-destructive-400">
            {versionA.versionInfo.displayVersion}
          </div>
          <div className="text-[10px] text-neutral-500">{versionA.versionInfo.name}</div>
        </div>
        <div className="bg-dark-800/80 px-4 py-2">
          <div className="text-xs font-semibold text-success-400">
            {versionB.versionInfo.displayVersion}
          </div>
          <div className="text-[10px] text-neutral-500">{versionB.versionInfo.name}</div>
        </div>
      </div>

      {/* Diff items */}
      {!hasChanges ? (
        <div className="px-4 py-6 text-center text-xs text-neutral-500">
          No differences found between these versions.
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {diffs.filter(d => d.type !== 'unchanged').map((diff, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2">
              <DiffIcon type={diff.type} />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-neutral-300">{diff.label}</div>
                {diff.oldValue && (
                  <div className="text-[10px] text-destructive-400 line-through">{diff.oldValue}</div>
                )}
                {diff.newValue && (
                  <div className="text-[10px] text-success-400">{diff.newValue}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function DiffIcon({ type }: { type: DiffItem['type'] }) {
  switch (type) {
    case 'added':
      return <Plus className="w-3 h-3 text-success-400 mt-0.5" />
    case 'removed':
      return <Minus className="w-3 h-3 text-destructive-400 mt-0.5" />
    case 'changed':
      return <Edit3 className="w-3 h-3 text-warning-400 mt-0.5" />
    default:
      return null
  }
}

function computeDiffs(a: ScorecardVersion, b: ScorecardVersion): DiffItem[] {
  const diffs: DiffItem[] = []

  // Compare segments
  const aSegIds = new Set(a.segments.map(s => s.id))
  const bSegIds = new Set(b.segments.map(s => s.id))

  for (const seg of b.segments) {
    if (!aSegIds.has(seg.id)) {
      diffs.push({
        label: `Segment "${seg.name}"`,
        type: 'added',
        newValue: `${seg.metrics.length} metrics, weight: ${Math.round(seg.segmentWeight * 100)}%`,
      })
    }
  }

  for (const seg of a.segments) {
    if (!bSegIds.has(seg.id)) {
      diffs.push({
        label: `Segment "${seg.name}"`,
        type: 'removed',
        oldValue: `${seg.metrics.length} metrics, weight: ${Math.round(seg.segmentWeight * 100)}%`,
      })
    }
  }

  // Compare matching segments
  for (const aSeg of a.segments) {
    const bSeg = b.segments.find(s => s.id === aSeg.id)
    if (!bSeg) continue

    // Weight change
    if (aSeg.segmentWeight !== bSeg.segmentWeight) {
      diffs.push({
        label: `${aSeg.name} weight`,
        type: 'changed',
        oldValue: `${Math.round(aSeg.segmentWeight * 100)}%`,
        newValue: `${Math.round(bSeg.segmentWeight * 100)}%`,
      })
    }

    // Metric count change
    if (aSeg.metrics.length !== bSeg.metrics.length) {
      diffs.push({
        label: `${aSeg.name} metrics`,
        type: 'changed',
        oldValue: `${aSeg.metrics.length} metrics`,
        newValue: `${bSeg.metrics.length} metrics`,
      })
    }
  }

  // Compare composite formula base weight
  if (a.compositeFormula.baseWeight !== b.compositeFormula.baseWeight) {
    diffs.push({
      label: 'Base weight',
      type: 'changed',
      oldValue: `${a.compositeFormula.baseWeight}`,
      newValue: `${b.compositeFormula.baseWeight}`,
    })
  }

  // Compare normalization
  if (a.normalization.method !== b.normalization.method) {
    diffs.push({
      label: 'Normalization method',
      type: 'changed',
      oldValue: a.normalization.method,
      newValue: b.normalization.method,
    })
  }

  // Compare verdict display mode
  if (a.verdictDisplayMode !== b.verdictDisplayMode) {
    diffs.push({
      label: 'Verdict display mode',
      type: 'changed',
      oldValue: a.verdictDisplayMode,
      newValue: b.verdictDisplayMode,
    })
  }

  return diffs
}
