/**
 * ReviewAndRunPanel — Stage 4: Review all config + run combined scoring+backtest
 *
 * Composes PipelineReviewPanel (read-only config summary) + RunCombinedButton.
 */

import { PipelineReviewPanel } from './PipelineReviewPanel'
import { RunCombinedButton } from './RunCombinedButton'
import { VersionInfoEditor } from './VersionInfoEditor'
import { VersionHistoryPanel } from './VersionHistoryPanel'

export function ReviewAndRunPanel() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PipelineReviewPanel />
        </div>
        <div className="space-y-4">
          <VersionInfoEditor />
          <VersionHistoryPanel />
          <RunCombinedButton />
        </div>
      </div>
    </div>
  )
}
