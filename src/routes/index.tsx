import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ui'

const Backtest = lazy(() => import('@/pages/Backtest').then(m => ({ default: m.Backtest })))

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
      <Route path="/" element={<LazyPage><Backtest /></LazyPage>} />
      <Route path="/backtest" element={<LazyPage><Backtest /></LazyPage>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
