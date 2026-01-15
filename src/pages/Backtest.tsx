import { BarChart3, Clock, TrendingUp, ArrowRight } from 'lucide-react'

export function Backtest() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-h2 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary-600" />
          Backtesting & Simulation
        </h1>
        <p className="text-body text-content-secondary mt-1">
          Test your investment thesis before deploying capital
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="card bg-gradient-to-br from-primary-50 to-white border-primary-100">
        <div className="text-center py-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 rounded-full text-primary-700 font-medium mb-4">
            <Clock className="w-4 h-4" />
            Coming Soon - Q2 2026
          </div>
          <h2 className="text-h3 mb-2">Forward-Testing Simulator</h2>
          <p className="text-body text-content-secondary max-w-md mx-auto">
            Test your investment thesis with virtual money before committing real capital.
            Track performance against benchmarks and learn from your decisions.
          </p>
        </div>
      </div>

      {/* Preview Features */}
      <div className="card">
        <h3 className="text-h4 mb-4">What's Coming</h3>
        <div className="space-y-4">
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
            <div key={i} className="flex items-start gap-3 p-3 bg-surface-secondary rounded-lg">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <div className="font-medium">{feature.title}</div>
                <div className="text-body-sm text-content-secondary">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mockup Preview */}
      <div className="card">
        <h3 className="text-h4 mb-4">Preview</h3>
        <div className="p-6 bg-surface-secondary rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-body-sm text-content-secondary">Starting Capital</div>
              <div className="text-h3">₹10,00,000</div>
            </div>
            <ArrowRight className="w-6 h-6 text-content-tertiary" />
            <div>
              <div className="text-body-sm text-content-secondary">Current Value</div>
              <div className="text-h3 text-verdict-buy">₹11,45,230</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-h4 text-verdict-buy">+14.5%</div>
              <div className="text-caption text-content-secondary">Your Return</div>
            </div>
            <div>
              <div className="text-h4">+8.2%</div>
              <div className="text-caption text-content-secondary">Nifty</div>
            </div>
            <div>
              <div className="text-h4 text-primary-600">+6.3%</div>
              <div className="text-caption text-content-secondary">Alpha</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notify CTA */}
      <div className="card text-center">
        <h3 className="text-h4 mb-2">Want to be notified when this launches?</h3>
        <p className="text-body-sm text-content-secondary mb-4">
          We'll let you know as soon as backtesting is available.
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="your@email.com"
            className="input flex-1"
          />
          <button className="btn-primary">Notify Me</button>
        </div>
      </div>
    </div>
  )
}
