/**
 * Scoring Components — Barrel Export
 *
 * 5-step pipeline + cross-step components for the scorecard backtester.
 *
 * Pipeline: Start → Metrics & Segments → Review & Tune → Select Stocks & Run → Results
 */

// ─── Cross-Step ───
export { StepperNav } from './StepperNav'
export { ScorecardSelector } from './ScorecardSelector'

// ─── Step 1: Start ───
export { StartingPointStep } from './StartingPointStep'
export { ScorecardTemplateCard } from './ScorecardTemplateCard'
export { CSVUploadParser } from './CSVUploadParser'

// ─── Step 2: Metrics & Segments ───
export { MetricsBuilderStep } from './MetricsBuilderStep'
export { MetricCatalogBrowser } from './MetricCatalogBrowser'
export { FormulaBuilder } from './FormulaBuilder'
export { CustomMetricCreator } from './CustomMetricCreator'
export { ScoreBandEditor } from './ScoreBandEditor'
export { NegativeHandlingEditor } from './NegativeHandlingEditor'
export { SelectedMetricsList } from './SelectedMetricsList'

// ─── Step 3: Review & Tune ───
export { ReviewTuneStep } from './ReviewTuneStep'
export { ScorecardSummaryHeader } from './ScorecardSummaryHeader'
export { SegmentCard } from './SegmentCard'
export { MetricDetailPanel } from './MetricDetailPanel'
export { SegmentBuilder } from './SegmentBuilder'
export { CompositeFormulaEditor } from './CompositeFormulaEditor'
export { NormalizationSelector } from './NormalizationSelector'
export { VerdictThresholdEditor } from './VerdictThresholdEditor'
export { ValuationConditionalsEditor } from './ValuationConditionalsEditor'

// ─── Step 4: Select Stocks & Run ───
export { ConfigureRunPanel } from './ConfigureRunPanel'
export { UniverseSelector } from './UniverseSelector'
export { DateRangeSelector } from './DateRangeSelector'
export { BenchmarkSelector } from './BenchmarkSelector'
export { RunCombinedButton } from './RunCombinedButton'
export { PipelineReviewPanel } from './PipelineReviewPanel'
export { ReviewSectionCard } from './ReviewSectionCard'
export { VersionInfoEditor } from './VersionInfoEditor'
export { VersionHistoryPanel } from './VersionHistoryPanel'
export { VersionDiffView } from './VersionDiffView'

// ─── Step 5: Results ───
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

// ─── Legacy (kept for backward compatibility) ───
export { PipelineNav } from './PipelineNav'
export { UIModeToggle } from './UIModeToggle'
export { ReviewAndRunPanel } from './ReviewAndRunPanel'
