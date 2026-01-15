import type { Alert } from '@/types'

// Alerts are personalized per profile based on their holdings and watchlist
export const alerts: Record<string, Alert[]> = {
  // Ankit's alerts - Growth-focused investor
  ankit: [
    {
      id: 'alert-ankit-1',
      type: 'score_change',
      severity: 'high',
      stock: 'ZOMATO',
      title: 'Score Change Alert',
      message: 'Zomato score increased from 7.8 to 8.2 (+0.4) after Q3 results. Blinkit AOV improved 18% QoQ.',
      timestamp: '2024-01-15T09:30:00Z',
      isRead: false,
      action: 'Review updated analysis',
    },
    {
      id: 'alert-ankit-2',
      type: 'peer_rank',
      severity: 'medium',
      stock: 'ZOMATO',
      title: 'Peer Rank Improved',
      message: 'Zomato moved from #2 to #1 in Food Tech peer group, overtaking Swiggy on profitability metrics.',
      timestamp: '2024-01-14T14:15:00Z',
      isRead: false,
      action: 'Compare with peers',
    },
    {
      id: 'alert-ankit-3',
      type: 'earnings',
      severity: 'high',
      stock: 'TCS',
      title: 'Earnings Alert',
      message: 'TCS Q3 results: Revenue growth 4.1% YoY (below estimates). Deal wins at $8.1B. Margin pressure continues.',
      timestamp: '2024-01-12T18:00:00Z',
      isRead: true,
      action: 'View earnings impact',
    },
    {
      id: 'alert-ankit-4',
      type: 'thesis_breaking',
      severity: 'critical',
      stock: 'PAYTM',
      title: 'Thesis Breaking Alert',
      message: 'RBI restrictions on Paytm Payments Bank. This fundamentally changes the investment thesis. Score dropped to 4.2.',
      timestamp: '2024-01-10T11:45:00Z',
      isRead: true,
      action: 'Review position',
    },
    {
      id: 'alert-ankit-5',
      type: 'news',
      severity: 'low',
      stock: 'RELIANCE',
      title: 'News Update',
      message: 'Reliance Jio announces 5G coverage expansion to 500 more cities. Positive for subscriber growth.',
      timestamp: '2024-01-09T16:30:00Z',
      isRead: true,
      action: 'Read full story',
    },
    {
      id: 'alert-ankit-6',
      type: 'concentration',
      severity: 'medium',
      title: 'Portfolio Concentration',
      message: 'Tech sector now represents 45% of your portfolio (threshold: 40%). Consider diversifying.',
      timestamp: '2024-01-08T10:00:00Z',
      isRead: true,
      action: 'View portfolio',
    },
  ],

  // Sneha's alerts - Value-focused investor
  sneha: [
    {
      id: 'alert-sneha-1',
      type: 'score_change',
      severity: 'medium',
      stock: 'AXISBANK',
      title: 'Score Update',
      message: 'Axis Bank score stable at 7.8. Asset quality improved with GNPA at 1.58% vs 1.73% last quarter.',
      timestamp: '2024-01-15T10:15:00Z',
      isRead: false,
      action: 'Review metrics',
    },
    {
      id: 'alert-sneha-2',
      type: 'peer_rank',
      severity: 'low',
      stock: 'AXISBANK',
      title: 'Peer Comparison',
      message: 'Axis Bank maintains #2 position in private bank peer group. Valuation gap with HDFC narrowing.',
      timestamp: '2024-01-14T09:00:00Z',
      isRead: false,
      action: 'Compare valuations',
    },
    {
      id: 'alert-sneha-3',
      type: 'thesis_breaking',
      severity: 'high',
      stock: 'COALINDIA',
      title: 'Dividend Announcement',
      message: 'Coal India announces interim dividend of ₹15/share. Total dividend yield now at 9.2%. Thesis intact.',
      timestamp: '2024-01-13T15:30:00Z',
      isRead: true,
      action: 'View dividend history',
    },
    {
      id: 'alert-sneha-4',
      type: 'news',
      severity: 'medium',
      stock: 'ZOMATO',
      title: 'Valuation Alert',
      message: 'Zomato trading at P/S of 8.5x, significantly above your threshold of 5x. Continue to avoid.',
      timestamp: '2024-01-11T14:00:00Z',
      isRead: true,
      action: 'Set price alert',
    },
    {
      id: 'alert-sneha-5',
      type: 'earnings',
      severity: 'medium',
      stock: 'TCS',
      title: 'Valuation Check',
      message: 'TCS now at 27x P/E after results. Getting closer to your buy threshold of 25x.',
      timestamp: '2024-01-10T19:00:00Z',
      isRead: true,
      action: 'Review analysis',
    },
  ],

  // Kavya's alerts - Beginner investor (simpler, educational alerts)
  kavya: [
    {
      id: 'alert-kavya-1',
      type: 'score_change',
      severity: 'low',
      stock: 'TCS',
      title: 'Your First Stock Update',
      message: 'TCS (your holding) is up 0.6% since you bought it. The company reported quarterly results - tap to learn more.',
      timestamp: '2024-01-15T11:00:00Z',
      isRead: false,
      action: 'Learn about earnings',
    },
    {
      id: 'alert-kavya-2',
      type: 'news',
      severity: 'low',
      stock: 'ZOMATO',
      title: 'Watchlist Update',
      message: 'Zomato (on your watchlist) announced strong results. Want to learn about food delivery unit economics?',
      timestamp: '2024-01-14T16:00:00Z',
      isRead: false,
      action: 'Learn more',
    },
    {
      id: 'alert-kavya-3',
      type: 'news',
      severity: 'low',
      title: 'Learning Tip',
      message: 'You have analyzed 4 stocks this month! Try checking more segments to improve your analysis skills.',
      timestamp: '2024-01-12T09:00:00Z',
      isRead: true,
      action: 'View your progress',
    },
    {
      id: 'alert-kavya-4',
      type: 'news',
      severity: 'low',
      title: 'Beginner Resource',
      message: 'New guide available: "Understanding P/E Ratio" - perfect for your learning journey.',
      timestamp: '2024-01-10T10:30:00Z',
      isRead: true,
      action: 'Read guide',
    },
  ],
}

// Get alerts for a specific profile
export function getAlertsForProfile(profileId: string): Alert[] {
  return alerts[profileId] || []
}

// Get unread count
export function getUnreadAlertCount(profileId: string): number {
  const profileAlerts = getAlertsForProfile(profileId)
  return profileAlerts.filter(a => !a.isRead).length
}

// Get critical alerts
export function getCriticalAlerts(profileId: string): Alert[] {
  const profileAlerts = getAlertsForProfile(profileId)
  return profileAlerts.filter(a => a.severity === 'critical' && !a.isRead)
}
