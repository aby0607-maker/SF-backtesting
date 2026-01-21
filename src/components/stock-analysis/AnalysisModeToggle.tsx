import { motion } from 'framer-motion'
import { Wand2, Compass } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

export function AnalysisModeToggle() {
  const { analysisMode, toggleAnalysisMode } = useAppStore()

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-center gap-1 p-1 rounded-xl bg-dark-700/50 border border-white/10"
    >
      <button
        onClick={() => analysisMode === 'diy' && toggleAnalysisMode()}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          analysisMode === 'dfy'
            ? 'bg-primary-500 text-white shadow-lg'
            : 'text-neutral-400 hover:text-white hover:bg-white/5'
        )}
      >
        <Wand2 className="w-4 h-4" />
        <span>DFY</span>
        <span className="text-[10px] opacity-70">Interpreted</span>
      </button>
      <button
        onClick={() => analysisMode === 'dfy' && toggleAnalysisMode()}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          analysisMode === 'diy'
            ? 'bg-teal-500 text-white shadow-lg'
            : 'text-neutral-400 hover:text-white hover:bg-white/5'
        )}
      >
        <Compass className="w-4 h-4" />
        <span>DIY</span>
        <span className="text-[10px] opacity-70">Raw Data</span>
      </button>
    </motion.div>
  )
}
