import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layout/MainLayout'
import { ErrorBoundary } from '@/components/ui'

// Eagerly loaded pages (critical path)
import { ProfileSelection } from '@/pages/ProfileSelection'
import { Dashboard } from '@/pages/Dashboard'

// Lazy loaded pages
const StockAnalysis = lazy(() => import('@/pages/StockAnalysis').then(m => ({ default: m.StockAnalysis })))
const SegmentDeepDive = lazy(() => import('@/pages/SegmentDeepDive').then(m => ({ default: m.SegmentDeepDive })))
const Chat = lazy(() => import('@/pages/Chat').then(m => ({ default: m.Chat })))
const Compare = lazy(() => import('@/pages/Compare').then(m => ({ default: m.Compare })))
const Journal = lazy(() => import('@/pages/Journal').then(m => ({ default: m.Journal })))
const Portfolio = lazy(() => import('@/pages/Portfolio').then(m => ({ default: m.Portfolio })))
const Discover = lazy(() => import('@/pages/Discover').then(m => ({ default: m.Discover })))
const Advisors = lazy(() => import('@/pages/Advisors').then(m => ({ default: m.Advisors })))
const Backtest = lazy(() => import('@/pages/Backtest').then(m => ({ default: m.Backtest })))
const Alerts = lazy(() => import('@/pages/Alerts').then(m => ({ default: m.Alerts })))
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })))

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-neutral-400">Loading...</span>
      </div>
    </div>
  )
}

// Wrapper for lazy components with error boundary
function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      {/* ── Backtesting — Primary experience (standalone, no demo chrome) ── */}
      <Route
        path="/"
        element={
          <LazyPage>
            <Backtest />
          </LazyPage>
        }
      />
      <Route
        path="/backtest"
        element={
          <LazyPage>
            <Backtest />
          </LazyPage>
        }
      />

      {/* ── Demo app routes (preserved but not primary) ── */}
      <Route path="/demo" element={<ProfileSelection />} />
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock/:ticker" element={<LazyPage><StockAnalysis /></LazyPage>} />
        <Route path="/segment/:ticker/:segmentId" element={<LazyPage><SegmentDeepDive /></LazyPage>} />
        <Route path="/chat" element={<LazyPage><Chat /></LazyPage>} />
        <Route path="/compare" element={<LazyPage><Compare /></LazyPage>} />
        <Route path="/journal" element={<LazyPage><Journal /></LazyPage>} />
        <Route path="/portfolio" element={<LazyPage><Portfolio /></LazyPage>} />
        <Route path="/discover" element={<LazyPage><Discover /></LazyPage>} />
        <Route path="/advisors" element={<LazyPage><Advisors /></LazyPage>} />
        <Route path="/alerts" element={<LazyPage><Alerts /></LazyPage>} />
        <Route path="/settings" element={<LazyPage><Settings /></LazyPage>} />
      </Route>

      {/* Fallback → backtest */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
