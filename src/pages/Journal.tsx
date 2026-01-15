import { BookOpen, TrendingUp, TrendingDown, Eye, AlertCircle, Clock, Award } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAppStore } from '@/store/useAppStore'
import { cn, formatDate, formatPercent } from '@/lib/utils'
import { VerdictBadge } from '@/components/ui'

// Placeholder data - will be replaced with full mock data
const journalEntries = [
  {
    id: '1',
    date: '2025-01-10',
    stock: { symbol: 'ZOMATO', name: 'Eternal (Zomato)', sector: 'Food Tech' },
    scoreAtAnalysis: 8.2,
    verdictAtAnalysis: 'STRONG BUY',
    userVerdict: 'BUY',
    priceAtAnalysis: 252,
    currentPrice: 268,
    pnlPercent: 6.35,
    outcomeStatus: 'win',
    timeSpent: 12,
  },
  {
    id: '2',
    date: '2025-01-05',
    stock: { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Banking' },
    scoreAtAnalysis: 7.8,
    verdictAtAnalysis: 'BUY',
    userVerdict: 'WATCHLIST',
    priceAtAnalysis: 1120,
    currentPrice: 1145,
    pnlPercent: 2.23,
    outcomeStatus: 'pending',
    timeSpent: 8,
  },
  {
    id: '3',
    date: '2024-12-20',
    stock: { symbol: 'PAYTM', name: 'One 97 Communications', sector: 'Fintech' },
    scoreAtAnalysis: 4.5,
    verdictAtAnalysis: 'AVOID',
    userVerdict: 'SKIP',
    priceAtAnalysis: 850,
    currentPrice: 780,
    pnlPercent: -8.24,
    outcomeStatus: 'neutral',
    timeSpent: 15,
  },
]

function getScoreColor(score: number): string {
  if (score >= 8) return 'text-success-400'
  if (score >= 6.5) return 'text-teal-400'
  if (score >= 5) return 'text-warning-400'
  return 'text-destructive-400'
}

export function Journal() {
  const { currentProfile } = useAppStore()

  if (!currentProfile) return null

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-400" />
          </div>
          Analysis Journal
        </h1>
        <p className="text-sm text-neutral-400 mt-1 ml-[52px]">
          Track your research journey and learn from outcomes
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        <div className="rounded-xl bg-dark-800 border border-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-white">12</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Total Analyses</div>
        </div>
        <div className="rounded-xl bg-dark-800 border border-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-success-400">67%</div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Win Rate</div>
        </div>
        <div className="rounded-xl bg-dark-800 border border-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
            <Clock className="w-5 h-5 text-neutral-500" />
            11m
          </div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Avg. Time</div>
        </div>
        <div className="rounded-xl bg-dark-800 border border-white/5 p-4 text-center">
          <div className="text-2xl font-bold text-primary-400 flex items-center justify-center gap-1">
            <Award className="w-5 h-5" />
            {currentProfile.skillBadge}
          </div>
          <div className="text-xs text-neutral-500 uppercase tracking-wide mt-1">Level</div>
        </div>
      </motion.div>

      {/* Patterns & Blind Spots */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-dark-800 border border-white/5 p-5"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success-400" />
            Your Patterns
          </h2>
          <div className="space-y-2">
            {currentProfile.patterns.map(pattern => (
              <div
                key={pattern.id}
                className="p-3 bg-success-500/10 rounded-xl border border-success-500/20"
              >
                <div className="font-medium text-success-400 text-sm">{pattern.title}</div>
                <div className="text-xs text-neutral-400 mt-1">{pattern.description}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Blind Spots */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl bg-dark-800 border border-white/5 p-5"
        >
          <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-warning-400" />
            Blind Spots
          </h2>
          <div className="space-y-2">
            {currentProfile.blindSpots.map(spot => (
              <div
                key={spot.id}
                className="p-3 bg-warning-500/10 rounded-xl border border-warning-500/20"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-warning-400 text-sm">{spot.segment}</span>
                  <span className="text-xs text-neutral-500">Checked {spot.checkRate}%</span>
                </div>
                <div className="text-xs text-neutral-400">{spot.suggestion}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Journal Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl bg-dark-800 border border-white/5 p-5"
      >
        <h2 className="text-lg font-semibold text-white mb-4">Recent Entries</h2>
        <div className="space-y-3">
          {journalEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="p-4 bg-dark-700/50 rounded-xl border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{entry.stock.name}</span>
                    <VerdictBadge verdict={entry.verdictAtAnalysis} size="sm" />
                  </div>
                  <div className="text-xs text-neutral-500 mt-0.5">
                    {entry.stock.sector} • {formatDate(entry.date)}
                  </div>
                </div>
                <span className={cn('text-lg font-bold', getScoreColor(entry.scoreAtAnalysis))}>
                  {entry.scoreAtAnalysis.toFixed(1)}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Eye className="w-4 h-4 text-neutral-500" />
                  <span>Your call: <span className="text-white">{entry.userVerdict}</span></span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.pnlPercent >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-success-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive-400" />
                  )}
                  <span className={entry.pnlPercent >= 0 ? 'text-success-400' : 'text-destructive-400'}>
                    {formatPercent(entry.pnlPercent)}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-neutral-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{entry.timeSpent}m</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
