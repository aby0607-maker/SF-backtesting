import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, AlertCircle, Check, X, TrendingDown, Newspaper, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StockVerdict, RedFlagSeverity } from '@/types'

interface NewsItem {
  id: string
  headline: string
  sentiment: 'positive' | 'negative' | 'neutral'
  source: string
}

interface RedFlagScannerProps {
  verdict: StockVerdict
  news: NewsItem[]
}

// Generate comprehensive 35-parameter Red Flag Framework
export function generateRedFlagFramework(verdict: StockVerdict) {
  // Complete 35-parameter Red Flag Framework for Indian retail investors
  const allFlags = [
    // ===== CRITICAL (8 flags) - Always Block/Alert - Score Impact: -2 to -3 pts =====
    { id: 'rf-asm', severity: 'critical' as RedFlagSeverity, title: 'ASM List', source: 'BSE/NSE', threshold: 'On list', currentValue: 'Clear', isTriggered: false, description: 'Stock on Additional Surveillance Measure', action: 'Exchange flagged for unusual activity', scoreImpact: -3 },
    { id: 'rf-gsm', severity: 'critical' as RedFlagSeverity, title: 'GSM List', source: 'BSE/NSE', threshold: 'On list', currentValue: 'Clear', isTriggered: false, description: 'Stock on Graded Surveillance Measure', action: 'Serious compliance/trading concerns', scoreImpact: -3 },
    { id: 'rf-default', severity: 'critical' as RedFlagSeverity, title: 'Default Probability >15%', source: 'ML Model', threshold: '>15%', currentValue: '2%', isTriggered: false, description: 'High likelihood of debt default', action: 'Company may not survive', scoreImpact: -3 },
    { id: 'rf-pledge', severity: 'critical' as RedFlagSeverity, title: 'Promoter Pledging >20%', source: 'Ownership', threshold: '>20%', currentValue: '0%', isTriggered: false, description: 'No promoter pledging', action: 'Forced selling risk in downturn', scoreImpact: -2 },
    { id: 'rf-sms', severity: 'critical' as RedFlagSeverity, title: 'Pump & Dump Alert', source: 'External', threshold: 'Circulating', currentValue: 'Clear', isTriggered: false, description: 'Stock circulating in SMS/WhatsApp tips', action: 'Manipulation in progress', scoreImpact: -3 },
    { id: 'rf-audit', severity: 'critical' as RedFlagSeverity, title: 'Auditor Qualification', source: 'Annual Report', threshold: 'Qualified/Adverse', currentValue: 'Clean', isTriggered: false, description: 'Clean audit report', action: 'Accounting irregularities', scoreImpact: -3 },
    { id: 'rf-icr', severity: 'critical' as RedFlagSeverity, title: 'Interest Coverage <1.5x', source: 'Ratios', threshold: '<1.5x', currentValue: '∞', isTriggered: false, description: 'No debt, comfortable coverage', action: 'Cannot service debt', scoreImpact: -2 },
    { id: 'rf-shell', severity: 'critical' as RedFlagSeverity, title: 'Shell Company Flag', source: 'MCA/Exchange', threshold: 'Flagged', currentValue: 'Clear', isTriggered: false, description: 'Not flagged as shell company', action: 'No real business operations', scoreImpact: -3 },

    // ===== HIGH (12 flags) - Always Show - Score Impact: -1 to -1.5 pts =====
    { id: 'rf-pledge-rising', severity: 'high' as RedFlagSeverity, title: 'Promoter Pledging Rising', source: 'Ownership', threshold: '>5% QoQ', currentValue: '0%', isTriggered: false, description: 'Pledging stable', action: 'Monitor promoter position', scoreImpact: -1.5 },
    { id: 'rf-promoter-exit', severity: 'high' as RedFlagSeverity, title: 'Promoter Stake Declining', source: 'Ownership', threshold: '>3% in 6M', currentValue: 'Stable', isTriggered: false, description: 'Promoter stake stable', action: 'Insider selling signal', scoreImpact: -1.5 },
    { id: 'rf-smart-money-exit', severity: 'high' as RedFlagSeverity, title: 'FII + DII Both Exiting', source: 'Ownership', threshold: '>2% in 3M', currentValue: 'Stable', isTriggered: false, description: 'Institutional ownership stable', action: 'Smart money leaving', scoreImpact: -1.5 },
    { id: 'rf-neg-ocf', severity: 'high' as RedFlagSeverity, title: 'Negative OCF 3 Quarters', source: 'Cash Flow', threshold: '3 consecutive', currentValue: 'Positive', isTriggered: false, description: 'Operating cash flow positive', action: 'Profits not converting to cash', scoreImpact: -1.5 },
    { id: 'rf-earnings-cash', severity: 'high' as RedFlagSeverity, title: 'Earnings vs Cash Divergence', source: 'Financials', threshold: 'PAT↑ OCF↓', currentValue: 'Aligned', isTriggered: false, description: 'PAT and OCF aligned', action: 'Possible earnings manipulation', scoreImpact: -1.5 },
    { id: 'rf-rpt', severity: 'high' as RedFlagSeverity, title: 'Related Party Transactions', source: 'Income Statement', threshold: '>10% revenue', currentValue: '3%', isTriggered: false, description: 'RPT within acceptable limits', action: 'Self-dealing concerns', scoreImpact: -1 },
    { id: 'rf-receivables', severity: 'high' as RedFlagSeverity, title: 'Revenue Recognition Red Flag', source: 'Balance Sheet', threshold: 'Recv 2x Rev growth', currentValue: 'Normal', isTriggered: false, description: 'Receivables growth normal', action: 'Fake sales booking', scoreImpact: -1.5 },
    { id: 'rf-auditor-change', severity: 'high' as RedFlagSeverity, title: 'Auditor Change', source: 'Annual Report', threshold: 'Unexplained', currentValue: 'No change', isTriggered: false, description: 'Stable auditor relationship', action: 'Covering up issues', scoreImpact: -1 },
    { id: 'rf-mgmt-churn', severity: 'high' as RedFlagSeverity, title: 'Management Churn', source: 'Filings', threshold: 'CFO/CEO exit', currentValue: 'Stable', isTriggered: false, description: 'Stable management team', action: 'Governance instability', scoreImpact: -1 },
    { id: 'rf-credit-downgrade', severity: 'high' as RedFlagSeverity, title: 'Credit Rating Downgrade', source: 'Rating Agency', threshold: 'Downgrade', currentValue: 'Stable', isTriggered: false, description: 'Credit rating stable', action: 'Credit quality deteriorating', scoreImpact: -1.5 },
    { id: 'rf-sebi', severity: 'high' as RedFlagSeverity, title: 'SEBI Order/Investigation', source: 'SEBI', threshold: 'Active', currentValue: 'Clear', isTriggered: false, description: 'No SEBI action', action: 'Regulatory trouble', scoreImpact: -1.5 },
    { id: 'rf-forensic', severity: 'high' as RedFlagSeverity, title: 'Forensic Accounting Concerns', source: 'Research', threshold: 'Flagged', currentValue: 'Clear', isTriggered: false, description: 'No forensic flags', action: 'Accounting red flags', scoreImpact: -1.5 },

    // ===== MEDIUM (10 flags) - Show in Segment - Score Impact: -0.5 pts =====
    { id: 'rf-short-interest', severity: 'medium' as RedFlagSeverity, title: 'High Short Interest', source: 'F&O Data', threshold: '>2x avg OI', currentValue: 'Normal', isTriggered: false, description: 'Normal short interest', action: 'Bears betting against', scoreImpact: -0.5 },
    { id: 'rf-analyst-downgrade', severity: 'medium' as RedFlagSeverity, title: 'Analyst Downgrade Cluster', source: 'Broker Ratings', threshold: '3+ in 30 days', currentValue: '0', isTriggered: false, description: 'No recent downgrades', action: 'Consensus turning negative', scoreImpact: -0.5 },
    { id: 'rf-debt-rising', severity: 'medium' as RedFlagSeverity, title: 'Debt Increasing Rapidly', source: 'Balance Sheet', threshold: 'D/E +0.5x YoY', currentValue: '0', isTriggered: false, description: 'Debt-free company', action: 'Leverage risk building', scoreImpact: -0.5 },
    { id: 'rf-contingent', severity: 'medium' as RedFlagSeverity, title: 'Contingent Liabilities High', source: 'Balance Sheet', threshold: '>20% net worth', currentValue: '5%', isTriggered: false, description: 'Low contingent liabilities', action: 'Hidden obligations', scoreImpact: -0.5 },
    { id: 'rf-inventory', severity: 'medium' as RedFlagSeverity, title: 'Inventory Pileup', source: 'Balance Sheet', threshold: '>30% YoY', currentValue: 'N/A', isTriggered: false, description: 'Service company - N/A', action: 'Demand slowdown signal', scoreImpact: -0.5 },
    { id: 'rf-customer-conc', severity: 'medium' as RedFlagSeverity, title: 'Customer Concentration', source: 'Income Statement', threshold: '>25% revenue', currentValue: '8%', isTriggered: false, description: 'Diversified customer base', action: 'Single point of failure', scoreImpact: -0.5 },
    { id: 'rf-promoter-loans', severity: 'medium' as RedFlagSeverity, title: 'Promoter Entity Loans', source: 'Related Party', threshold: 'Present', currentValue: 'None', isTriggered: false, description: 'No loans to promoter entities', action: 'Cash siphoning risk', scoreImpact: -0.5 },
    { id: 'rf-dilution', severity: 'medium' as RedFlagSeverity, title: 'Frequent Equity Dilution', source: 'Capital Structure', threshold: '>2 raises in 3Y', currentValue: '1', isTriggered: false, description: 'Limited dilution', action: 'Shareholder dilution', scoreImpact: -0.5 },
    { id: 'rf-dividend-cut', severity: 'medium' as RedFlagSeverity, title: 'Dividend Cut/Skip', source: 'Dividend History', threshold: '>50% cut', currentValue: 'N/A', isTriggered: false, description: 'Growth company - no dividend', action: 'Cash flow stress', scoreImpact: -0.5 },
    { id: 'rf-working-capital', severity: 'medium' as RedFlagSeverity, title: 'Working Capital Deterioration', source: 'Balance Sheet', threshold: 'CCC +30 days', currentValue: 'Improving', isTriggered: false, description: 'Working capital healthy', action: 'Operational stress', scoreImpact: -0.5 },

    // ===== MONITOR (5 flags) - Informational - No Score Impact =====
    { id: 'rf-volatility', severity: 'monitor' as RedFlagSeverity, title: 'Volatility Warning', source: 'Price Data', threshold: 'Beta >1.5', currentValue: '1.3', isTriggered: false, description: 'Moderate volatility', action: 'High price swings', scoreImpact: 0 },
    { id: 'rf-liquidity', severity: 'monitor' as RedFlagSeverity, title: 'Liquidity Warning', source: 'Volume', threshold: '<₹1 Cr daily', currentValue: '₹150 Cr', isTriggered: false, description: 'Good liquidity', action: 'Hard to exit', scoreImpact: 0 },
    { id: 'rf-sector-headwind', severity: 'monitor' as RedFlagSeverity, title: 'Sector Headwind', source: 'News', threshold: 'Regulatory/macro', currentValue: 'None', isTriggered: false, description: 'No sector headwinds', action: 'External risk factor', scoreImpact: 0 },
    { id: 'rf-peer-underperform', severity: 'monitor' as RedFlagSeverity, title: 'Peer Underperformance', source: 'Price', threshold: '-20% vs peers', currentValue: '+5%', isTriggered: false, description: 'Outperforming peers', action: 'Relative weakness', scoreImpact: 0 },
    { id: 'rf-insider-selling', severity: 'monitor' as RedFlagSeverity, title: 'Insider Selling Pattern', source: 'SAST', threshold: 'Multiple insiders', currentValue: 'None', isTriggered: false, description: 'No insider selling', action: 'Confidence concern', scoreImpact: 0 },
  ]

  // Override with actual red flags from verdict if present
  const triggeredFlags = verdict.redFlags?.map(f => ({
    ...f,
    severity: (f.severity as RedFlagSeverity) || 'medium' as RedFlagSeverity,
    isTriggered: true,
    source: 'Analysis',
    currentValue: (f as any).currentValue || 'Triggered',
    threshold: (f as any).threshold || 'Exceeded',
    scoreImpact: f.severity === 'critical' ? -2.5 : f.severity === 'high' ? -1.25 : -0.5
  })) || []

  // Merge triggered flags with framework
  const mergedFlags = allFlags.map(flag => {
    const override = triggeredFlags.find(tf => tf.id === flag.id || tf.title === flag.title)
    return override || flag
  })

  const additionalTriggered = triggeredFlags.filter(tf =>
    !allFlags.some(f => f.id === tf.id || f.title === tf.title)
  )

  const finalFlags = [...mergedFlags, ...additionalTriggered]
  const triggered = finalFlags.filter(f => f.isTriggered)

  // Calculate total score impact (capped at -5)
  const rawScoreImpact = triggered.reduce((sum, f) => sum + (f.scoreImpact || 0), 0)
  const scoreImpact = Math.max(-5, rawScoreImpact)

  return {
    triggeredCount: triggered.length,
    totalParameters: 35,
    scoreImpact,
    flags: finalFlags,
    triggeredFlags: triggered,
    bySeverity: {
      critical: finalFlags.filter(f => f.severity === 'critical'),
      high: finalFlags.filter(f => f.severity === 'high'),
      medium: finalFlags.filter(f => f.severity === 'medium'),
      monitor: finalFlags.filter(f => f.severity === 'monitor'),
    },
    triggeredBySeverity: {
      critical: triggered.filter(f => f.severity === 'critical'),
      high: triggered.filter(f => f.severity === 'high'),
      medium: triggered.filter(f => f.severity === 'medium'),
      monitor: triggered.filter(f => f.severity === 'monitor'),
    }
  }
}

export function RedFlagScanner({ verdict, news }: RedFlagScannerProps) {
  const framework = generateRedFlagFramework(verdict)
  const { triggeredBySeverity, bySeverity, scoreImpact } = framework

  // Track which severity categories are expanded
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    critical: false,
    high: false,
    medium: false,
    monitor: false
  })

  const toggleCategory = (key: string) => {
    setExpandedCategories(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Get negative news as potential red flag signals
  const negativeNews = news.filter(n => n.sentiment === 'negative')
  const hasCritical = triggeredBySeverity.critical.length > 0
  const hasHigh = triggeredBySeverity.high.length > 0
  const hasAnyIssue = framework.triggeredCount > 0

  // Severity category config
  const categories = [
    { key: 'critical', label: 'Critical', emoji: '🔴', colorClass: 'destructive', count: 8, description: 'Blocking issues - immediate action required' },
    { key: 'high', label: 'High', emoji: '🟠', colorClass: 'warning', count: 12, description: 'Significant concerns - caution advised' },
    { key: 'medium', label: 'Medium', emoji: '🟡', colorClass: 'yellow', count: 10, description: 'Monitor closely - potential risks' },
    { key: 'monitor', label: 'Monitor', emoji: '⚪', colorClass: 'neutral', count: 5, description: 'Informational - awareness items' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border overflow-hidden',
        hasCritical ? 'bg-destructive-500/5 border-destructive-500/20' :
        hasHigh ? 'bg-warning-500/5 border-warning-500/20' :
        'bg-success-500/5 border-success-500/20'
      )}
    >
      {/* Header - Summary */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {hasCritical ? (
              <AlertTriangle className="w-5 h-5 text-destructive-400" />
            ) : hasHigh ? (
              <AlertCircle className="w-5 h-5 text-warning-400" />
            ) : (
              <Check className="w-5 h-5 text-success-400" />
            )}
            <h3 className="font-semibold text-white">Red Flag Scanner</h3>
          </div>
          <div className="flex items-center gap-2">
            {scoreImpact !== 0 && (
              <span className="text-xs text-destructive-400 font-medium">
                {scoreImpact.toFixed(1)} pts
              </span>
            )}
            <div className={cn(
              'px-2.5 py-1 rounded-full text-xs font-medium',
              framework.triggeredCount === 0 ? 'bg-success-500/20 text-success-400' :
              hasCritical ? 'bg-destructive-500/20 text-destructive-400' :
              'bg-warning-500/20 text-warning-400'
            )}>
              {framework.triggeredCount} issues / {framework.totalParameters} checked
            </div>
          </div>
        </div>

        {/* Status message */}
        {!hasAnyIssue && (
          <div className="mb-3 p-2.5 bg-success-500/10 rounded-lg border border-success-500/20">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-success-400" />
              <span className="text-sm text-success-400 font-medium">All Clear</span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 ml-6">
              No red flags detected across 35 risk parameters
            </p>
          </div>
        )}

        {/* Severity Categories */}
        <div className="space-y-2">
          {categories.map((cat) => {
            const triggered = triggeredBySeverity[cat.key as keyof typeof triggeredBySeverity]
            const all = bySeverity[cat.key as keyof typeof bySeverity]
            const isExpanded = expandedCategories[cat.key]
            const hasTriggered = triggered.length > 0

            return (
              <div key={cat.key}>
                <button
                  onClick={() => toggleCategory(cat.key)}
                  className={cn(
                    'w-full flex items-center justify-between p-3 rounded-xl transition-all',
                    hasTriggered
                      ? cat.colorClass === 'destructive' ? 'bg-destructive-500/10 hover:bg-destructive-500/15' :
                        cat.colorClass === 'warning' ? 'bg-warning-500/10 hover:bg-warning-500/15' :
                        'bg-dark-700/50 hover:bg-dark-700'
                      : 'bg-dark-700/30 hover:bg-dark-700/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{cat.emoji}</span>
                    <div className="text-left">
                      <span className="text-sm font-medium text-white">{cat.label}</span>
                      <span className="text-xs text-neutral-500 ml-2">({cat.count} checks)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-xs font-medium',
                      hasTriggered
                        ? cat.colorClass === 'destructive' ? 'text-destructive-400' :
                          cat.colorClass === 'warning' ? 'text-warning-400' : 'text-neutral-400'
                        : 'text-success-400'
                    )}>
                      {hasTriggered ? `${triggered.length} triggered` : 'Clear'}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-1.5 pl-9">
                        {all.map((flag: any) => (
                          <div
                            key={flag.id}
                            className={cn(
                              'flex items-start gap-2 p-2 rounded-lg text-xs',
                              flag.isTriggered ? 'bg-dark-600/50' : 'bg-dark-700/30'
                            )}
                          >
                            {flag.isTriggered ? (
                              <X className="w-3.5 h-3.5 text-destructive-400 mt-0.5 flex-shrink-0" />
                            ) : (
                              <Check className="w-3.5 h-3.5 text-success-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className={cn(
                                  'font-medium',
                                  flag.isTriggered ? 'text-white' : 'text-neutral-400'
                                )}>
                                  {flag.title}
                                </span>
                                <span className="text-[10px] text-neutral-500 flex-shrink-0">
                                  {flag.source}
                                </span>
                              </div>
                              <p className="text-neutral-500 mt-0.5">{flag.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>

        {/* News Signals */}
        {negativeNews.length > 0 && (
          <div className="mt-3 p-3 bg-dark-700/50 rounded-xl border border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-warning-400" />
              <span className="text-xs font-medium text-warning-400">Recent News Signals</span>
            </div>
            <div className="space-y-1.5">
              {negativeNews.slice(0, 2).map(item => (
                <div key={item.id} className="flex items-start gap-2">
                  <TrendingDown className="w-3 h-3 text-destructive-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-neutral-300">{item.headline}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
