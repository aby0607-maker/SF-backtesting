/**
 * UIModeToggle — Switch between Wizard / Dashboard / Hybrid mode
 */

import { cn } from '@/lib/utils'
import { useScoringStore, useUIMode } from '@/store/useScoringStore'
import type { UIMode } from '@/types/scoring'
import { Wand2, LayoutDashboard, Shuffle } from 'lucide-react'

const MODES: { mode: UIMode; label: string; icon: typeof Wand2; description: string }[] = [
  { mode: 'wizard', label: 'Wizard', icon: Wand2, description: 'Step-by-step' },
  { mode: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'All stages' },
  { mode: 'hybrid', label: 'Hybrid', icon: Shuffle, description: 'Jump freely' },
]

export function UIModeToggle() {
  const uiMode = useUIMode()
  const setUIMode = useScoringStore(s => s.setUIMode)

  return (
    <div className="flex items-center gap-0.5 bg-dark-800/60 border border-white/5 rounded-lg p-0.5">
      {MODES.map(({ mode, label, icon: Icon }) => (
        <button
          key={mode}
          onClick={() => setUIMode(mode)}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
            uiMode === mode
              ? 'bg-primary-500/20 text-primary-400'
              : 'text-neutral-500 hover:text-neutral-300 hover:bg-dark-700/60',
          )}
        >
          <Icon className="w-3 h-3" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
