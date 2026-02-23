import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { injectSpeedInsights } from '@vercel/speed-insights'
import App from './App'
import './index.css'

// Enable Vercel Speed Insights
injectSpeedInsights()

// Dev-only: expose scoring diagnostic on window for browser console testing
if (import.meta.env.DEV) {
  import('./lib/diagnostics').then(({ runScoringDiagnostic }) => {
    ;(window as unknown as Record<string, unknown>).__runScoringDiagnostic = runScoringDiagnostic
    console.log('[Dev] Scoring diagnostic available: window.__runScoringDiagnostic(coCode, from, to)')
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
