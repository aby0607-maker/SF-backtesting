import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { X, ChevronRight, ChevronLeft, CheckCircle2, Target, BarChart3, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { StockVerdict, SegmentScore } from '@/types'

interface GuidedAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  verdict: StockVerdict
  stockName: string
}

type UserRating = 'weak' | 'fair' | 'good' | 'great' | null

const ratingOptions: { value: UserRating; label: string; color: string }[] = [
  { value: 'weak', label: 'Weak', color: 'bg-destructive-500 hover:bg-destructive-400' },
  { value: 'fair', label: 'Fair', color: 'bg-warning-500 hover:bg-warning-400' },
  { value: 'good', label: 'Good', color: 'bg-teal-500 hover:bg-teal-400' },
  { value: 'great', label: 'Great', color: 'bg-success-500 hover:bg-success-400' },
]

// Convert score to rating
function scoreToRating(score: number): UserRating {
  if (score >= 8) return 'great'
  if (score >= 6) return 'good'
  if (score >= 4) return 'fair'
  return 'weak'
}

// Get rating label
function getRatingLabel(rating: UserRating): string {
  return rating ? rating.charAt(0).toUpperCase() + rating.slice(1) : ''
}

// Get sample metrics for a segment (mock data for demo)
function getSegmentMetrics(segment: SegmentScore) {
  // Use actual metrics if available, otherwise generate mock
  if (segment.metrics && segment.metrics.length > 0) {
    return segment.metrics.slice(0, 4).map(m => ({
      name: m.name,
      value: m.displayValue || m.value?.toString() || 'N/A',
      sectorAvg: m.sectorAvgDisplay || m.sectorAvg?.toString() || 'N/A',
      trend: m.trend || 'neutral'
    }))
  }

  // Mock metrics based on segment
  const mockMetrics: Record<string, { name: string; value: string; sectorAvg: string; trend: 'up' | 'down' | 'neutral' }[]> = {
    'profitability': [
      { name: 'Net Profit Margin', value: '8.2%', sectorAvg: '6.1%', trend: 'up' },
      { name: 'ROE', value: '18.5%', sectorAvg: '14.2%', trend: 'up' },
      { name: 'ROCE', value: '15.2%', sectorAvg: '12.8%', trend: 'neutral' },
    ],
    'financial-health': [
      { name: 'Debt to Equity', value: '0.0x', sectorAvg: '0.8x', trend: 'up' },
      { name: 'Current Ratio', value: '2.1x', sectorAvg: '1.5x', trend: 'up' },
      { name: 'Interest Coverage', value: '∞', sectorAvg: '5.2x', trend: 'up' },
    ],
    'growth': [
      { name: 'Revenue Growth (3Y)', value: '45%', sectorAvg: '12%', trend: 'up' },
      { name: 'Profit Growth (3Y)', value: '120%', sectorAvg: '8%', trend: 'up' },
      { name: 'Operating Cash Flow Growth', value: '35%', sectorAvg: '10%', trend: 'up' },
    ],
    'valuation': [
      { name: 'P/E Ratio', value: '85x', sectorAvg: '25x', trend: 'down' },
      { name: 'P/B Ratio', value: '12x', sectorAvg: '3x', trend: 'down' },
      { name: 'EV/EBITDA', value: '45x', sectorAvg: '15x', trend: 'down' },
    ],
  }

  return mockMetrics[segment.id] || [
    { name: 'Key Metric 1', value: 'Good', sectorAvg: 'Average', trend: 'up' as const },
    { name: 'Key Metric 2', value: 'Strong', sectorAvg: 'Moderate', trend: 'up' as const },
  ]
}

/**
 * Guided Analysis Modal
 * Step-by-step metric-by-metric analysis flow
 * User rates each segment before seeing actual score
 */
export function GuidedAnalysisModal({
  isOpen,
  onClose,
  verdict,
  stockName,
}: GuidedAnalysisModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>({})
  const [showReveal, setShowReveal] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const segments = verdict.segments
  const currentSegment = segments[currentStep]
  const totalSteps = segments.length

  const handleRating = (rating: UserRating) => {
    if (!currentSegment) return

    setUserRatings(prev => ({
      ...prev,
      [currentSegment.id]: rating
    }))
    setShowReveal(true)
  }

  const handleNext = () => {
    setShowReveal(false)
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsComplete(true)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setShowReveal(false)
      setCurrentStep(currentStep - 1)
    }
  }

  const handleRestart = () => {
    setCurrentStep(0)
    setUserRatings({})
    setShowReveal(false)
    setIsComplete(false)
  }

  // Calculate accuracy
  const calculateAccuracy = () => {
    let correct = 0
    let total = 0
    segments.forEach(segment => {
      const userRating = userRatings[segment.id]
      if (userRating) {
        total++
        const actualRating = scoreToRating(segment.score)
        if (userRating === actualRating) correct++
      }
    })
    return total > 0 ? Math.round((correct / total) * 100) : 0
  }

  if (!isOpen) return null

  const metrics = currentSegment ? getSegmentMetrics(currentSegment) : []
  const userRating = currentSegment ? userRatings[currentSegment.id] : null
  const actualRating = currentSegment ? scoreToRating(currentSegment.score) : null
  const isCorrect = userRating === actualRating

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-x-4 top-[5%] bottom-[5%] z-50 mx-auto max-w-lg bg-dark-800 rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Target className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Guided Analysis</h3>
                  <p className="text-xs text-neutral-500">{stockName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-4 pt-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-500">
                  Step {currentStep + 1} of {totalSteps}
                </span>
                <span className="text-xs text-neutral-500">
                  {Math.round(((currentStep + (showReveal ? 1 : 0)) / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStep + (showReveal ? 1 : 0)) / totalSteps) * 100}%` }}
                  className="h-full bg-teal-500 rounded-full"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {!isComplete ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    {/* Segment Header */}
                    <div className="text-center mb-4">
                      <h4 className="text-lg font-semibold text-white">{currentSegment?.name}</h4>
                      <p className="text-sm text-neutral-400 mt-1">
                        Review the metrics below and rate this segment
                      </p>
                    </div>

                    {/* Metrics Display */}
                    <div className="bg-dark-700/50 rounded-xl p-4 border border-white/5">
                      <div className="flex items-center gap-2 mb-3">
                        <BarChart3 className="w-4 h-4 text-neutral-400" />
                        <span className="text-xs font-medium text-neutral-400">Key Metrics</span>
                      </div>
                      <div className="space-y-3">
                        {metrics.map((metric, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-neutral-300">{metric.name}</span>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <span className="text-sm font-medium text-white">{metric.value}</span>
                                <span className="text-xs text-neutral-500 ml-2">
                                  vs {metric.sectorAvg}
                                </span>
                              </div>
                              {metric.trend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-success-400" />}
                              {metric.trend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-destructive-400" />}
                              {metric.trend === 'neutral' && <Minus className="w-3.5 h-3.5 text-neutral-500" />}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Rating Section */}
                    {!showReveal ? (
                      <div className="space-y-3">
                        <p className="text-center text-sm text-neutral-400">
                          How would you rate this segment?
                        </p>
                        <div className="grid grid-cols-4 gap-2">
                          {ratingOptions.map(option => (
                            <button
                              key={option.value}
                              onClick={() => handleRating(option.value)}
                              className={cn(
                                'py-3 px-2 rounded-xl text-sm font-medium text-white transition-all',
                                option.color
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Reveal Section */
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className={cn(
                          'p-4 rounded-xl border',
                          isCorrect
                            ? 'bg-success-500/10 border-success-500/30'
                            : 'bg-warning-500/10 border-warning-500/30'
                        )}>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <span className="text-xs text-neutral-400 block">Your Rating</span>
                              <span className={cn(
                                'text-lg font-semibold',
                                userRating === 'great' && 'text-success-400',
                                userRating === 'good' && 'text-teal-400',
                                userRating === 'fair' && 'text-warning-400',
                                userRating === 'weak' && 'text-destructive-400',
                              )}>
                                {getRatingLabel(userRating)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs text-neutral-400 block">Actual Score</span>
                              <span className={cn(
                                'text-lg font-semibold',
                                actualRating === 'great' && 'text-success-400',
                                actualRating === 'good' && 'text-teal-400',
                                actualRating === 'fair' && 'text-warning-400',
                                actualRating === 'weak' && 'text-destructive-400',
                              )}>
                                {getRatingLabel(actualRating)} ({currentSegment?.score.toFixed(1)}/10)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className={cn(
                              'w-5 h-5',
                              isCorrect ? 'text-success-400' : 'text-warning-400'
                            )} />
                            <span className="text-sm text-white">
                              {isCorrect ? 'You got it right!' : 'Close! Keep practicing.'}
                            </span>
                          </div>
                        </div>

                        {/* Insight */}
                        {currentSegment?.quickInsight && (
                          <div className="p-3 bg-dark-700/50 rounded-xl">
                            <span className="text-xs text-neutral-400 block mb-1">Key Insight</span>
                            <p className="text-sm text-neutral-300">{currentSegment.quickInsight}</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                /* Completion Screen */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-400" />
                  </div>
                  <h4 className="text-xl font-semibold text-white mb-2">Analysis Complete!</h4>
                  <p className="text-neutral-400 mb-6">
                    You've reviewed all 11 segments of {stockName}
                  </p>

                  <div className="bg-dark-700/50 rounded-xl p-4 mb-6">
                    <span className="text-sm text-neutral-400">Your Accuracy</span>
                    <div className="text-3xl font-bold text-teal-400 mt-1">
                      {calculateAccuracy()}%
                    </div>
                    <span className="text-xs text-neutral-500">
                      {Object.keys(userRatings).length} segments rated
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleRestart}
                      className="flex-1 py-3 px-4 bg-dark-700 hover:bg-dark-600 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 py-3 px-4 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer Navigation */}
            {!isComplete && (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors',
                      currentStep === 0
                        ? 'text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-400 hover:text-white hover:bg-white/5'
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  {showReveal && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-2 bg-teal-500 hover:bg-teal-400 text-white rounded-xl text-sm font-medium transition-colors"
                    >
                      {currentStep < totalSteps - 1 ? 'Next Segment' : 'See Results'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
