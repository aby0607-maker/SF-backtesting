import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageCircle, Lightbulb, Target, TrendingUp, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReflectionPromptModalProps {
  isOpen: boolean
  onClose: () => void
  stockName: string
  verdict: string
  score: number
  onSubmit?: (reflection: ReflectionData) => void
}

export interface ReflectionData {
  keyInsight: string
  confirmOrChallenge: 'confirmed' | 'challenged' | 'mixed'
  lessonLearned: string
  confidenceLevel: number
  nextAction: 'buy' | 'watchlist' | 'skip' | 'research_more'
}

const reflectionQuestions = [
  {
    id: 'insight',
    icon: Lightbulb,
    question: 'What was your key insight from this analysis?',
    hint: 'e.g., Strong moat but stretched valuations',
  },
  {
    id: 'thesis',
    icon: Target,
    question: 'Did the analysis confirm or challenge your initial thesis?',
    options: [
      { value: 'confirmed', label: 'Confirmed my thesis' },
      { value: 'challenged', label: 'Challenged my view' },
      { value: 'mixed', label: 'Mixed signals' },
    ],
  },
  {
    id: 'lesson',
    icon: MessageCircle,
    question: 'What would you remember for future analyses?',
    hint: 'e.g., Always check promoter pledging in infra stocks',
  },
]

/**
 * Reflection Prompt Modal
 * Post-analysis feedback to help users learn from their research process
 */
export function ReflectionPromptModal({
  isOpen,
  onClose,
  stockName,
  verdict,
  score,
  onSubmit,
}: ReflectionPromptModalProps) {
  const [step, setStep] = useState(0)
  const [reflection, setReflection] = useState<Partial<ReflectionData>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1)
    } else {
      // Submit reflection
      setIsSubmitted(true)
      if (onSubmit && reflection.keyInsight && reflection.confirmOrChallenge && reflection.lessonLearned) {
        onSubmit({
          keyInsight: reflection.keyInsight,
          confirmOrChallenge: reflection.confirmOrChallenge,
          lessonLearned: reflection.lessonLearned,
          confidenceLevel: reflection.confidenceLevel || 3,
          nextAction: reflection.nextAction || 'watchlist',
        })
      }
    }
  }

  const canProceed = () => {
    if (step === 0) return reflection.keyInsight && reflection.keyInsight.length > 5
    if (step === 1) return reflection.confirmOrChallenge
    if (step === 2) return reflection.lessonLearned && reflection.lessonLearned.length > 5
    return false
  }

  const handleClose = () => {
    setStep(0)
    setReflection({})
    setIsSubmitted(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-dark-800 border border-white/10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-primary-500/10 to-teal-500/10 border-b border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-white">Quick Reflection</h2>
                    <p className="text-xs text-neutral-400">
                      {stockName} • {verdict} • Score {score.toFixed(1)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 rounded-full bg-success-500/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-success-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">Reflection Saved!</h3>
                  <p className="text-sm text-neutral-400 mb-6">
                    Your insights will help track your learning progress
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-colors"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Progress Indicators */}
                  <div className="flex gap-2 mb-6">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          i <= step ? 'bg-primary-500' : 'bg-dark-600'
                        )}
                      />
                    ))}
                  </div>

                  {/* Question */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {step === 0 && <Lightbulb className="w-5 h-5 text-warning-400" />}
                        {step === 1 && <Target className="w-5 h-5 text-primary-400" />}
                        {step === 2 && <TrendingUp className="w-5 h-5 text-success-400" />}
                        <span className="font-medium text-white">
                          {reflectionQuestions[step].question}
                        </span>
                      </div>

                      {step === 0 && (
                        <div>
                          <textarea
                            value={reflection.keyInsight || ''}
                            onChange={(e) => setReflection({ ...reflection, keyInsight: e.target.value })}
                            placeholder={reflectionQuestions[0].hint}
                            className="w-full h-24 p-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:border-primary-500/50"
                          />
                        </div>
                      )}

                      {step === 1 && (
                        <div className="space-y-2">
                          {reflectionQuestions[1].options?.map((option) => (
                            <button
                              key={option.value}
                              onClick={() => setReflection({ ...reflection, confirmOrChallenge: option.value as ReflectionData['confirmOrChallenge'] })}
                              className={cn(
                                'w-full p-3 rounded-xl border text-left transition-all',
                                reflection.confirmOrChallenge === option.value
                                  ? 'border-primary-500 bg-primary-500/10 text-white'
                                  : 'border-white/10 bg-dark-700 text-neutral-300 hover:border-white/20'
                              )}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}

                      {step === 2 && (
                        <div>
                          <textarea
                            value={reflection.lessonLearned || ''}
                            onChange={(e) => setReflection({ ...reflection, lessonLearned: e.target.value })}
                            placeholder={reflectionQuestions[2].hint}
                            className="w-full h-24 p-3 rounded-xl bg-dark-700 border border-white/10 text-white placeholder:text-neutral-500 resize-none focus:outline-none focus:border-primary-500/50"
                          />
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation */}
                  <div className="flex justify-between mt-6">
                    <button
                      onClick={() => step > 0 && setStep(step - 1)}
                      className={cn(
                        'px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors',
                        step === 0 && 'invisible'
                      )}
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className={cn(
                        'px-6 py-2.5 rounded-xl font-medium transition-colors',
                        canProceed()
                          ? 'bg-primary-500 hover:bg-primary-600 text-white'
                          : 'bg-dark-600 text-neutral-500 cursor-not-allowed'
                      )}
                    >
                      {step === 2 ? 'Save Reflection' : 'Next'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer hint */}
            {!isSubmitted && (
              <div className="px-6 py-3 bg-dark-700/30 border-t border-white/5">
                <p className="text-[10px] text-neutral-500 text-center">
                  Reflections help build your Research DNA over time
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
