/**
 * Scoring Components — Barrel Export
 *
 * 5-stage pipeline + cross-stage components for the scorecard backtester.
 *
 * Pipeline: Metrics → Scorecard → Configure → Review & Run → Results
 */

// ─── Cross-Stage ───
export { PipelineNav } from './PipelineNav'
export { UIModeToggle } from './UIModeToggle'
export { ScorecardSelector } from './ScorecardSelector'

// ─── Stage 1: Build Metrics ───
export { MetricCatalogBrowser } from './MetricCatalogBrowser'
export { FormulaBuilder } from './FormulaBuilder'
export { ScoreBandEditor } from './ScoreBandEditor'
export { NegativeHandlingEditor } from './NegativeHandlingEditor'
export { SelectedMetricsList } from './SelectedMetricsList'

// ─── Stage 2: Build Scorecard ───
export { SegmentBuilder } from './SegmentBuilder'
export { CompositeFormulaEditor } from './CompositeFormulaEditor'
export { NormalizationSelector } from './NormalizationSelector'
export { VerdictThresholdEditor } from './VerdictThresholdEditor'
export { ScorecardTemplateCard } from './ScorecardTemplateCard'

// ─── Stage 3: Configure Run ───
export { ConfigureRunPanel } from './ConfigureRunPanel'
export { UniverseSelector } from './UniverseSelector'
export { DateRangeSelector } from './DateRangeSelector'
export { BenchmarkSelector } from './BenchmarkSelector'

// ─── Stage 4: Review & Run ───
export { ReviewAndRunPanel } from './ReviewAndRunPanel'
export { RunCombinedButton } from './RunCombinedButton'
export { PipelineReviewPanel } from './PipelineReviewPanel'
export { ReviewSectionCard } from './ReviewSectionCard'
export { VersionInfoEditor } from './VersionInfoEditor'
export { VersionHistoryPanel } from './VersionHistoryPanel'
export { VersionDiffView } from './VersionDiffView'

// ─── Stage 5: Results ───
export { ResultsPanel } from './ResultsPanel'
export { ScoringResultsTable } from './ScoringResultsTable'
export { PriceDeltaTable } from './PriceDeltaTable'
export { PerformanceChart } from './PerformanceChart'
export { CohortComparisonTable } from './CohortComparisonTable'
export { SummaryMetricsGrid } from './SummaryMetricsGrid'
export { RelativePerformanceChart } from './RelativePerformanceChart'
export { QuintileAnalysisChart } from './QuintileAnalysisChart'
export { MetricContributionWaterfall } from './MetricContributionWaterfall'
export { ScoreTrajectoryChart } from './ScoreTrajectoryChart'
export { ScoreReturnCorrelation } from './ScoreReturnCorrelation'
export { ExportReportButton } from './ExportReportButton'
export { StockDetailOverlay } from './StockDetailOverlay'

// ─── Legacy (not used in 5-stage pipeline) ───
// RunScoringButton, ScoreboardTable, ScoreDistributionChart, VerdictSummaryCards,
// CohortFilterPanel, StockSelectionList, ConfirmAndRunButton
// These components reference removed store members (useCohort, setCohort, applyCohortFilter).
// They are kept in the codebase but not exported. Import directly if needed after updating.
