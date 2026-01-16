import { useState } from 'react'
import { Bell, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn, formatRelativeTime } from '@/lib/utils'

// Placeholder data
const alertsData = [
  {
    id: '1',
    type: 'score_change',
    severity: 'high',
    title: 'Score Drop Alert',
    message: 'Axis Bank score dropped from 8.5 to 8.2 due to declining asset quality metrics.',
    timestamp: '2025-01-15T10:30:00',
    isRead: false,
    action: 'Review Analysis',
  },
  {
    id: '2',
    type: 'thesis_breaking',
    severity: 'critical',
    title: 'Thesis-Breaking Event',
    message: 'Zomato turned profitable for the first time. This may change your value thesis.',
    timestamp: '2025-01-14T15:45:00',
    isRead: false,
    action: 'Re-evaluate',
  },
  {
    id: '3',
    type: 'news',
    severity: 'medium',
    title: 'Earnings Release',
    message: 'TCS Q3 FY25 results released. Revenue up 5.5% YoY, margins stable.',
    timestamp: '2025-01-13T09:00:00',
    isRead: true,
    action: 'View Details',
  },
  {
    id: '4',
    type: 'concentration',
    severity: 'medium',
    title: 'Portfolio Concentration',
    message: 'Your portfolio is 65% concentrated in IT sector. Consider diversifying.',
    timestamp: '2025-01-12T14:00:00',
    isRead: true,
    action: 'View Portfolio',
  },
  {
    id: '5',
    type: 'peer_rank',
    severity: 'low',
    title: 'Peer Rank Change',
    message: 'HDFC Bank moved from #2 to #1 in Banking sector rankings.',
    timestamp: '2025-01-11T11:30:00',
    isRead: true,
    action: 'Compare',
  },
]

const typeIcons: Record<string, string> = {
  score_change: '📉',
  thesis_breaking: '⚡',
  news: '📰',
  concentration: '⚠️',
  peer_rank: '🏆',
  earnings: '📊',
}

const severityConfig: Record<string, { dot: string; unreadBg: string; unreadBorder: string }> = {
  critical: {
    dot: 'bg-destructive-500',
    unreadBg: 'bg-destructive-500/10',
    unreadBorder: 'border-destructive-500/30'
  },
  high: {
    dot: 'bg-warning-500',
    unreadBg: 'bg-warning-500/10',
    unreadBorder: 'border-warning-500/30'
  },
  medium: {
    dot: 'bg-warning-400',
    unreadBg: 'bg-dark-700/50',
    unreadBorder: 'border-white/10'
  },
  low: {
    dot: 'bg-neutral-500',
    unreadBg: 'bg-dark-700/50',
    unreadBorder: 'border-white/10'
  },
}

export function Alerts() {
  const [alerts, setAlerts] = useState(alertsData)
  const unreadCount = alerts.filter(a => !a.isRead).length

  const markAllRead = () => {
    setAlerts(alerts.map(a => ({ ...a, isRead: true })))
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary-400" />
            </div>
            Alerts
          </h1>
          <p className="text-sm text-neutral-400 mt-1 ml-[52px]">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 border border-white/10 rounded-xl text-sm text-neutral-300 transition-colors"
          >
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        </motion.div>
      )}

      {/* Alert List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-3"
      >
        {alerts.map((alert, index) => {
          const config = severityConfig[alert.severity] || severityConfig.low
          const isUnread = !alert.isRead

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className={cn(
                'rounded-xl border p-4 transition-all',
                isUnread
                  ? `${config.unreadBg} ${config.unreadBorder}`
                  : 'bg-dark-800 border-white/5 hover:border-white/10'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Severity dot */}
                <div className="flex-shrink-0 pt-1.5">
                  <div className={cn('w-2 h-2 rounded-full', config.dot)} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{typeIcons[alert.type] || '📋'}</span>
                      <span className="font-medium text-white">{alert.title}</span>
                      {isUnread && (
                        <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-500 flex-shrink-0">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="text-sm text-neutral-400 mb-3 leading-relaxed">
                    {alert.message}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button className="text-sm text-primary-400 font-medium hover:text-primary-300 transition-colors">
                      {alert.action}
                    </button>
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Alert Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-dark-800 border border-white/5 p-5"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Alert Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Score changes', description: 'When a watchlist stock score changes by 0.5+', enabled: true },
            { label: 'Thesis-breaking events', description: 'Critical changes that may invalidate your thesis', enabled: true },
            { label: 'Earnings announcements', description: '24h before quarterly results', enabled: true },
            { label: 'Peer rank changes', description: 'When stocks move in sector rankings', enabled: false },
          ].map((pref, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-dark-700/50 rounded-xl border border-white/5"
            >
              <div>
                <div className="font-medium text-white text-sm">{pref.label}</div>
                <div className="text-xs text-neutral-500 mt-0.5">{pref.description}</div>
              </div>
              <button
                className={cn(
                  'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                  pref.enabled ? 'bg-primary-500' : 'bg-dark-600'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all',
                    pref.enabled ? 'right-1' : 'left-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Empty state hint */}
      {alerts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-success-500/10 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
          <p className="text-sm text-neutral-400">No new alerts. We'll notify you when something important happens.</p>
        </motion.div>
      )}
    </div>
  )
}
