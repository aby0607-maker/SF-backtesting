import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Check, X } from 'lucide-react'
import type { StockVerdict } from '@/types'

interface ProsConsProps {
  verdict: StockVerdict
}

export function ProsCons({ verdict }: ProsConsProps) {
  const pros = verdict.topSignals.filter(s => s.isPositive !== false)
  const cons = verdict.topConcerns?.filter(c => c.isPositive === false) || []

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 gap-3"
    >
      {/* Pros */}
      <div className="rounded-2xl border border-success-500/20 bg-success-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-success-500/20 flex items-center justify-center">
            <TrendingUp className="w-3.5 h-3.5 text-success-400" />
          </div>
          <span className="font-semibold text-white text-sm">Strengths</span>
        </div>
        <div className="space-y-2">
          {pros.slice(0, 4).map((signal, i) => (
            <div key={i} className="flex items-start gap-2">
              <Check className="w-4 h-4 text-success-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">{signal.title}</p>
                {signal.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{signal.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cons */}
      <div className="rounded-2xl border border-warning-500/20 bg-warning-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-warning-500/20 flex items-center justify-center">
            <AlertTriangle className="w-3.5 h-3.5 text-warning-400" />
          </div>
          <span className="font-semibold text-white text-sm">Weaknesses</span>
        </div>
        <div className="space-y-2">
          {cons.length > 0 ? cons.slice(0, 4).map((concern, i) => (
            <div key={i} className="flex items-start gap-2">
              <X className="w-4 h-4 text-warning-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white font-medium">{concern.title}</p>
                {concern.description && (
                  <p className="text-xs text-neutral-400 mt-0.5">{concern.description}</p>
                )}
              </div>
            </div>
          )) : (
            <p className="text-sm text-neutral-500">No significant concerns</p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
