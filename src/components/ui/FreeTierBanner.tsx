import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Check, Crown, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FreeTierBannerProps {
  analysesUsed?: number
  analysesLimit?: number
  variant?: 'banner' | 'card' | 'compact'
  onUpgradeClick?: () => void
  dismissible?: boolean
  className?: string
}

const freeFeatures = [
  '5 stock analyses per month',
  'Basic 11-segment scorecard',
  'DIY analysis mode',
  'Journal tracking',
]

const proFeatures = [
  'Unlimited analyses',
  'AI-powered insights',
  'Portfolio tracking',
  'Advanced alerts',
  'Export reports',
  'Priority support',
]

/**
 * Free Tier Banner
 * Shows current plan usage and upgrade CTA
 */
export function FreeTierBanner({
  analysesUsed = 3,
  analysesLimit = 5,
  variant = 'banner',
  onUpgradeClick,
  dismissible = true,
  className,
}: FreeTierBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const usagePercent = (analysesUsed / analysesLimit) * 100
  const isNearLimit = usagePercent >= 80

  if (isDismissed) return null

  // Compact inline banner
  if (variant === 'compact') {
    return (
      <div className={cn(
        'flex items-center justify-between px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500/10 to-teal-500/10 border border-primary-500/20',
        className
      )}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary-400" />
          <span className="text-sm text-neutral-300">
            <span className="font-medium text-white">{analysesUsed}/{analysesLimit}</span> analyses used
          </span>
        </div>
        <button
          onClick={onUpgradeClick}
          className="text-xs font-medium text-primary-400 hover:text-primary-300 transition-colors"
        >
          Upgrade
        </button>
      </div>
    )
  }

  // Card variant - more detailed
  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'rounded-2xl bg-dark-800 border border-white/5 overflow-hidden',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-teal-500/10 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Free Plan</h3>
                <p className="text-xs text-neutral-400">
                  {analysesUsed} of {analysesLimit} analyses used this month
                </p>
              </div>
            </div>
            {dismissible && (
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1.5 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            )}
          </div>
        </div>

        {/* Usage Bar */}
        <div className="px-4 pt-4">
          <div className="h-2 bg-dark-600 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${usagePercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                isNearLimit ? 'bg-warning-500' : 'bg-primary-500'
              )}
            />
          </div>
          {isNearLimit && (
            <p className="text-xs text-warning-400 mt-2">
              You&apos;re running low on free analyses!
            </p>
          )}
        </div>

        {/* Features Comparison */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* Free */}
          <div>
            <div className="text-xs text-neutral-500 uppercase tracking-wide mb-2">Free</div>
            <ul className="space-y-1.5">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-neutral-400">
                  <Check className="w-3 h-3 text-success-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div>
            <div className="text-xs text-primary-400 uppercase tracking-wide mb-2 flex items-center gap-1">
              <Crown className="w-3 h-3" /> Pro
            </div>
            <ul className="space-y-1.5">
              {proFeatures.slice(0, 4).map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-neutral-400">
                  <Check className="w-3 h-3 text-primary-400" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={onUpgradeClick}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 text-white font-medium hover:from-primary-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Upgrade to Pro
          </button>
          <p className="text-[10px] text-neutral-500 text-center mt-2">
            Starting at ₹499/month • Cancel anytime
          </p>
        </div>
      </motion.div>
    )
  }

  // Default banner variant
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={cn(
          'rounded-2xl bg-gradient-to-r from-primary-500/10 via-teal-500/10 to-primary-500/10 border border-primary-500/20 p-4',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">
                {analysesUsed >= analysesLimit ? 'Free limit reached!' : `${analysesLimit - analysesUsed} analyses remaining`}
              </h3>
              <p className="text-sm text-neutral-400 mt-0.5">
                {analysesUsed >= analysesLimit
                  ? 'Upgrade to Pro for unlimited stock analyses and premium features.'
                  : 'Upgrade to Pro for unlimited analyses, AI insights, and more.'}
              </p>
              <button
                onClick={onUpgradeClick}
                className="mt-3 px-4 py-2 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Upgrade to Pro
              </button>
            </div>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-neutral-500" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
