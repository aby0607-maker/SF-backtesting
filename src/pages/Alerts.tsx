import { Bell, Settings, Check, Trash2 } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

// Placeholder data
const alerts = [
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

const severityColors = {
  critical: 'bg-alert-critical',
  high: 'bg-alert-high',
  medium: 'bg-alert-medium',
  low: 'bg-alert-low',
}

const typeIcons = {
  score_change: '📉',
  thesis_breaking: '⚡',
  news: '📰',
  concentration: '⚠️',
  peer_rank: '🏆',
  earnings: '📊',
}

export function Alerts() {
  const unreadCount = alerts.filter(a => !a.isRead).length

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h2 flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary-600" />
            Alerts
          </h1>
          <p className="text-body text-content-secondary mt-1">
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All caught up!'}
          </p>
        </div>
        <button className="btn-ghost flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Settings
        </button>
      </div>

      {/* Quick Actions */}
      {unreadCount > 0 && (
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2">
            <Check className="w-4 h-4" />
            Mark All Read
          </button>
        </div>
      )}

      {/* Alert List */}
      <div className="space-y-3">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={cn(
              'card transition-colors',
              !alert.isRead && 'bg-primary-50 border-primary-100'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div
                  className={cn(
                    'w-2 h-2 rounded-full mt-2',
                    severityColors[alert.severity as keyof typeof severityColors]
                  )}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span>{typeIcons[alert.type as keyof typeof typeIcons]}</span>
                    <span className="font-medium">{alert.title}</span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </div>
                  <span className="text-caption text-content-tertiary flex-shrink-0">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </div>

                <p className="text-body-sm text-content-secondary mb-3">
                  {alert.message}
                </p>

                <div className="flex items-center gap-3">
                  <button className="text-body-sm text-primary-600 font-medium hover:text-primary-700">
                    {alert.action}
                  </button>
                  <button className="text-body-sm text-content-tertiary hover:text-content-secondary">
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Settings Preview */}
      <div className="card">
        <h3 className="text-h4 mb-4">Alert Preferences</h3>
        <div className="space-y-3">
          {[
            { label: 'Score changes', description: 'When a watchlist stock score changes by 0.5+', enabled: true },
            { label: 'Thesis-breaking events', description: 'Critical changes that may invalidate your thesis', enabled: true },
            { label: 'Earnings announcements', description: '24h before quarterly results', enabled: true },
            { label: 'Peer rank changes', description: 'When stocks move in sector rankings', enabled: false },
          ].map((pref, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-surface-secondary rounded-lg">
              <div>
                <div className="font-medium">{pref.label}</div>
                <div className="text-body-sm text-content-secondary">{pref.description}</div>
              </div>
              <button
                className={cn(
                  'w-12 h-7 rounded-full transition-colors relative',
                  pref.enabled ? 'bg-primary-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    pref.enabled ? 'right-1' : 'left-1'
                  )}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
