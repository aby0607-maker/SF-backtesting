import { Routes, Route, Navigate } from 'react-router-dom'

// Layout
import { MainLayout } from '@/components/layout/MainLayout'

// Pages
import { ProfileSelection } from '@/pages/ProfileSelection'
import { Dashboard } from '@/pages/Dashboard'
import { StockAnalysis } from '@/pages/StockAnalysis'
import { SegmentDeepDive } from '@/pages/SegmentDeepDive'
import { Chat } from '@/pages/Chat'
import { Compare } from '@/pages/Compare'
import { Journal } from '@/pages/Journal'
import { Portfolio } from '@/pages/Portfolio'
import { Discover } from '@/pages/Discover'
import { Advisors } from '@/pages/Advisors'
import { Backtest } from '@/pages/Backtest'
import { Alerts } from '@/pages/Alerts'
import { Settings } from '@/pages/Settings'

function App() {
  return (
    <Routes>
      {/* Profile Selection - Entry point for demo */}
      <Route path="/" element={<ProfileSelection />} />

      {/* Main app routes with layout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock/:ticker" element={<StockAnalysis />} />
        <Route path="/segment/:ticker/:segmentId" element={<SegmentDeepDive />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/advisors" element={<Advisors />} />
        <Route path="/backtest" element={<Backtest />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Fallback redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
