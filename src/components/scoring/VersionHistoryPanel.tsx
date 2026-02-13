/**
 * VersionHistoryPanel — Timeline of micro versions within a macro version
 */

import { cn } from '@/lib/utils'
import { useScoringStore, useActiveScorecard } from '@/store/useScoringStore'
import { Clock, RotateCcw, GitCompare } from 'lucide-react'

export function VersionHistoryPanel() {
  const scorecard = useActiveScorecard()
  const versionHistory = useScoringStore(s => {
    if (!scorecard) return []
    return s.versionHistory[scorecard.versionInfo.macroVersion] ?? []
  })
  const setActiveScorecard = useScoringStore(s => s.setActiveScorecard)
  const revertToVersion = useScoringStore(s => s.revertToVersion)

  if (!scorecard || versionHistory.length === 0) return null

  // Sort by creation date descending (newest first)
  const sorted = [...versionHistory].sort((a, b) => b.versionInfo.createdAt - a.versionInfo.createdAt)

  return (
    <div className="rounded-xl bg-dark-800/60 border border-white/5 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <Clock className="w-3.5 h-3.5 text-primary-400" />
        <span className="text-sm font-medium text-white">Version History</span>
        <span className="text-[10px] text-neutral-500">({scorecard.versionInfo.macroVersion})</span>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {sorted.map((version, i) => {
          const isCurrent = version.id === scorecard.id
          const date = new Date(version.versionInfo.createdAt)

          return (
            <div
              key={version.id}
              className={cn(
                'flex items-start gap-3 px-4 py-2.5 border-b border-white/5 last:border-b-0',
                isCurrent && 'bg-primary-500/5',
              )}
            >
              {/* Timeline dot */}
              <div className="flex flex-col items-center pt-0.5">
                <div className={cn(
                  'w-2.5 h-2.5 rounded-full',
                  isCurrent ? 'bg-primary-500' : 'bg-dark-600',
                )} />
                {i < sorted.length - 1 && (
                  <div className="w-px h-full bg-dark-600 mt-1" />
                )}
              </div>

              {/* Version info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-semibold font-mono',
                    isCurrent ? 'text-primary-400' : 'text-neutral-300',
                  )}>
                    {version.versionInfo.displayVersion}
                  </span>
                  {isCurrent && (
                    <span className="px-1.5 py-0.5 rounded bg-primary-500/20 text-[9px] text-primary-400 font-medium">
                      Current
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-neutral-400">{version.versionInfo.name}</div>
                {version.versionInfo.sourceReference && (
                  <div className="text-[9px] text-neutral-500">{version.versionInfo.sourceReference}</div>
                )}
                <div className="text-[9px] text-neutral-600 mt-0.5">
                  {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Actions */}
              {!isCurrent && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveScorecard(version.id)}
                    title="Switch to this version"
                    className="p-1 rounded text-neutral-600 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                  >
                    <GitCompare className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => revertToVersion(version.id)}
                    title="Revert to this version"
                    className="p-1 rounded text-neutral-600 hover:text-warning-400 hover:bg-warning-500/10 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
