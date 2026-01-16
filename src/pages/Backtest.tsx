import { useState } from 'react'
import { BarChart3, Clock, ArrowRight, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export function Backtest() {
  const [email, setEmail] = useState('')
  const [notifySuccess, setNotifySuccess] = useState(false)

  const handleNotify = () => {
    if (email) {
      setNotifySuccess(true)
      setTimeout(() => setNotifySuccess(false), 3000)
      setEmail('')
    }
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-500" />
          Backtesting & Simulation
        </h1>
        <p className="text-neutral-400 mt-1">
          Test your investment thesis before deploying capital
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="bg-gradient-to-br from-primary-500/20 to-dark-800 rounded-2xl border border-primary-500/30 p-6">
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/20 rounded-full text-primary-400 font-medium mb-4">
            <Clock className="w-4 h-4" />
            Coming Soon
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Forward-Testing Simulator</h2>
          <p className="text-neutral-400 max-w-md mx-auto">
            Test your investment thesis with virtual money before committing real capital.
            Track performance against benchmarks and learn from your decisions.
          </p>
        </div>
      </div>

      {/* Preview Features */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">What's Coming</h3>
        <div className="space-y-3">
          {[
            {
              icon: '💰',
              title: 'Virtual Portfolio',
              description: 'Start with ₹10L virtual capital to test strategies risk-free',
            },
            {
              icon: '📊',
              title: 'Real-Time Tracking',
              description: 'Track virtual investments against actual market prices',
            },
            {
              icon: '📈',
              title: 'Benchmark Comparison',
              description: 'Compare your performance vs Nifty/Sensex and your profile peers',
            },
            {
              icon: '📓',
              title: 'Journal Integration',
              description: 'All virtual trades automatically logged to your analysis journal',
            },
          ].map((feature, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-dark-700/50 rounded-xl border border-white/5">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <div className="font-medium text-white">{feature.title}</div>
                <div className="text-sm text-neutral-400">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mockup Preview */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5">
        <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
        <div className="p-6 bg-dark-700/50 rounded-xl border border-white/5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-neutral-500">Starting Capital</div>
              <div className="text-2xl font-bold text-white">₹10,00,000</div>
            </div>
            <ArrowRight className="w-6 h-6 text-neutral-600" />
            <div>
              <div className="text-sm text-neutral-500">Current Value</div>
              <div className="text-2xl font-bold text-success-400">₹11,45,230</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center pt-4 border-t border-white/5">
            <div>
              <div className="text-xl font-bold text-success-400">+14.5%</div>
              <div className="text-xs text-neutral-500">Your Return</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">+8.2%</div>
              <div className="text-xs text-neutral-500">Nifty</div>
            </div>
            <div>
              <div className="text-xl font-bold text-primary-400">+6.3%</div>
              <div className="text-xs text-neutral-500">Alpha</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notify CTA */}
      <div className="bg-dark-800 rounded-2xl border border-white/5 p-5 text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Want to be notified when this launches?</h3>
        <p className="text-sm text-neutral-400 mb-4">
          We'll let you know as soon as backtesting is available.
        </p>
        {notifySuccess ? (
          <div className="flex items-center justify-center gap-2 text-success-400 py-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">You'll be notified!</span>
          </div>
        ) : (
          <div className="flex gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-dark-700 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50"
            />
            <button
              onClick={handleNotify}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              Notify Me
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}
