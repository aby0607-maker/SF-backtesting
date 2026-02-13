/**
 * Scoring Components — Barrel Export
 *
 * 7-stage pipeline + cross-stage components for the scorecard backtester.
 */

// ─── Cross-Stage ───
export { PipelineNav } from './PipelineNav'
export { UIModeToggle } from './UIModeToggle'
export { ScorecardSelector } from './ScorecardSelector'

// ─── Stage 1: Build Metrics ───
export { MetricCatalogBrowser } from './MetricCatalogBrowser'
export { FormulaBuilder } from './FormulaBuilder'
export { ScoreBandEditor } from './ScoreBandEditor'
export { SelectedMetricsList } from './SelectedMetricsList'

// ─── Stage 2: Build Scorecard ───
export { SegmentBuilder } from './SegmentBuilder'
export { CompositeFormulaEditor } from './CompositeFormulaEditor'
export { NormalizationSelector } from './NormalizationSelector'
export { VerdictThresholdEditor } from './VerdictThresholdEditor'
export { ScorecardTemplateCard } from './ScorecardTemplateCard'

// ─── Stage 3: Score & Rank ───
export { RunScoringButton } from './RunScoringButton'
export { ScoreboardTable } from './ScoreboardTable'
export { ScoreDistributionChart } from './ScoreDistributionChart'
export { VerdictSummaryCards } from './VerdictSummaryCards'

// ─── Stage 4: Select Cohort ───
export { CohortFilterPanel } from './CohortFilterPanel'
export { StockSelectionList } from './StockSelectionList'

// ─── Stage 5: Set Date Range ───
export { DateRangeSelector } from './DateRangeSelector'
export { BenchmarkSelector } from './BenchmarkSelector'

// ─── Stage 6: Review & Confirm ───
export { PipelineReviewPanel } from './PipelineReviewPanel'
export { ReviewSectionCard } from './ReviewSectionCard'
export { ConfirmAndRunButton } from './ConfirmAndRunButton'
export { VersionInfoEditor } from './VersionInfoEditor'
export { VersionHistoryPanel } from './VersionHistoryPanel'
export { VersionDiffView } from './VersionDiffView'

// ─── Stage 7: Performance Report ───
export { PerformanceChart } from './PerformanceChart'
export { CohortComparisonTable } from './CohortComparisonTable'
export { SummaryMetricsGrid } from './SummaryMetricsGrid'
export { RelativePerformanceChart } from './RelativePerformanceChart'
export { QuintileAnalysisChart } from './QuintileAnalysisChart'
export { MetricContributionWaterfall } from './MetricContributionWaterfall'
export { ScoreTrajectoryChart } from './ScoreTrajectoryChart'
export { ExportReportButton } from './ExportReportButton'
