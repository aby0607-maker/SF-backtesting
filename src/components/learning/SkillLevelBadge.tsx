import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// Skill level definitions
const skillLevels: { level: number; name: string; badge: string; requirement: number }[] = [
  { level: 1, name: 'Newcomer', badge: '🌱', requirement: 0 },
  { level: 2, name: 'Explorer', badge: '🔍', requirement: 3 },
  { level: 3, name: 'Learner', badge: '📚', requirement: 10 },
  { level: 4, name: 'Researcher', badge: '🔬', requirement: 20 },
  { level: 5, name: 'Analyst', badge: '📊', requirement: 35 },
  { level: 6, name: 'Strategist', badge: '🎯', requirement: 50 },
  { level: 7, name: 'Expert', badge: '🏆', requirement: 75 },
]

interface SkillLevelBadgeProps {
  level: number
  analysisCount?: number
  className?: string
  showProgress?: boolean
}

/**
 * Skill Level Badge
 * Shows current skill level with badge and optional progress to next level
 */
export function SkillLevelBadge({
  level,
  analysisCount = 12,
  className,
  showProgress = true,
}: SkillLevelBadgeProps) {
  const currentLevel = skillLevels.find(l => l.level === level) || skillLevels[0]
  const nextLevel = skillLevels.find(l => l.level === level + 1)

  const progress = nextLevel
    ? ((analysisCount - currentLevel.requirement) / (nextLevel.requirement - currentLevel.requirement)) * 100
    : 100

  return (
    <div className={cn('', className)}>
      {/* Main badge */}
      <div className="flex items-center gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center text-2xl"
        >
          {currentLevel.badge}
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{currentLevel.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
              Level {level}
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            {analysisCount} analyses completed
          </p>
        </div>
      </div>

      {/* Progress to next level */}
      {showProgress && nextLevel && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-500">Progress to {nextLevel.name}</span>
            <span className="text-neutral-400">{Math.min(100, Math.round(progress))}%</span>
          </div>
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, progress)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary-500 to-teal-500 rounded-full"
            />
          </div>
          <p className="text-[10px] text-neutral-500 mt-1.5">
            {nextLevel.requirement - analysisCount} more analyses to reach {nextLevel.badge} {nextLevel.name}
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Compact skill badge for inline use
 */
export function CompactSkillBadge({ level, className }: { level: number; className?: string }) {
  const currentLevel = skillLevels.find(l => l.level === level) || skillLevels[0]

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-400 text-sm font-medium',
      className
    )}>
      <span>{currentLevel.badge}</span>
      <span>{currentLevel.name}</span>
    </span>
  )
}
