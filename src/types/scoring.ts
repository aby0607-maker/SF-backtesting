/**
 * Scoring & Backtesting Type Definitions
 *
 * Foundation types for the 7-stage scorecard backtesting pipeline:
 * Stage 1: Build Metrics → Stage 2: Build Scorecard → Stage 3: Score & Rank
 * Stage 4: Select Cohort → Stage 5: Set Date Range → Stage 6: Review & Confirm
 * Stage 7: Performance Report
 */

// ─────────────────────────────────────────────────
// Stage 1: Metric Types
// ─────────────────────────────────────────────────

/** A raw metric sourced from CMOTS APIs */
export interface RawMetric {
  id: string
  name: string
  cmots_source: string    // e.g., 'ttm', 'quarterly', 'balance_sheet'
  cmots_field: string     // e.g., 'RevenueGrowth', 'PE_Ratio'
  unit: 'percent' | 'ratio' | 'currency' | 'number' | 'times'
  description: string
  category?: string       // e.g., 'Profitability', 'Growth', 'Valuation'
}

/** Operators for building composite metric formulas */
export type FormulaOperator =
  | 'add' | 'subtract' | 'multiply' | 'divide'
  | 'average' | 'max' | 'min'

/** A formula combining multiple raw metrics into a derived value */
export interface MetricFormula {
  id: string
  name: string
  inputs: RawMetric[]
  operator: FormulaOperator
  description: string
}

/** A score band maps a raw value range to a normalized score (0-100) */
export interface ScoreBand {
  min: number
  max: number
  score: number           // 0-100
  label: string           // e.g., 'Excellent', 'Good', 'Fair', 'Poor'
  color: string           // Tailwind color class or hex
}

/**
 * Negative value handling rules — per-metric, per-condition.
 * The V2 Expert Model has a comprehensive matrix of what to do
 * when raw metric values are negative (e.g., negative EBITDA).
 */
export type NegativeCondition =
  | 'start_negative'    // Start year/period value is negative
  | 'end_negative'      // End year/period value is negative
  | 'both_negative'     // Both periods negative
  | 'any_negative'      // Any period negative

export type NegativeAction =
  | 'zero'              // Assign score = 0
  | 'exclude'           // Exclude from scoring
  | 'cap'               // Cap at a value
  | 'improvement_check' // Check if negative improved (less negative)
  | 'special_calc'      // Custom calculation (e.g., OCF/EBITDA ratio analysis)
  | 'max_score'         // Assign max score (e.g., negative debt = excellent)
  | 'custom'            // Custom formula

export interface NegativeHandling {
  metricId: string
  condition: NegativeCondition
  action: NegativeAction
  customFormula?: string
  description?: string
}

/**
 * A composite metric — either a raw metric or a formula-derived one.
 * Each has score bands defining how raw values map to 0-100 scores.
 */
export interface CompositeMetric {
  id: string
  name: string
  type: 'raw' | 'formula'
  rawMetric?: RawMetric
  formula?: MetricFormula
  scoreBands: ScoreBand[]
  negativeHandling?: NegativeHandling[]
  description?: string
  weight?: number         // Weight within its segment (0-1)
}

// ─────────────────────────────────────────────────
// Stage 2: Scorecard Types
// ─────────────────────────────────────────────────

/** A segment groups related metrics (e.g., "Financial Score", "Valuation Score") */
export interface ScorecardSegment {
  id: string
  name: string
  metrics: CompositeMetric[]
  segmentWeight: number   // Weight in composite formula (0-1)
  description?: string
  verdictThresholds?: VerdictThreshold[]  // Per-segment verdicts
}

/**
 * Version metadata for scorecard tracking.
 * Supports macro.micro versioning (V1, V2 → V2.1, V2.2, V2.3)
 */
export interface VersionInfo {
  macroVersion: string       // e.g., "V2"
  microVersion: number       // Auto-incrementing: 1, 2, 3...
  displayVersion: string     // e.g., "V2.3"
  name: string               // User-defined, e.g., "Expert Model - Conservative"
  description?: string       // Optional notes
  sourceReference?: string   // e.g., "Based on Vishal Rampuria's SME scorecard"
  sourceLink?: string        // Optional URL to reference document
  createdAt: number          // Timestamp
  parentVersionId?: string   // Which version this was derived from
}

/**
 * Composite formula defining how segment scores combine.
 * Supports base segments (weighted sum) and overlay segments
 * (applied separately, like Technical or Quarterly Momentum).
 *
 * Example V2: (Financial×0.4 + Valuation×0.6) × 0.75 + Technical×0.15 + QMomentum×0.10
 *   baseSegments = [{Financial, 0.4}, {Valuation, 0.6}] with baseWeight = 0.75
 *   overlaySegments = [{Technical, 0.15}, {QMomentum, 0.10}]
 */
export interface CompositeFormula {
  baseSegments: { segmentId: string; weight: number }[]
  baseWeight: number          // Scaling factor for base sum (e.g., 0.75)
  overlaySegments?: { segmentId: string; weight: number }[]
}

/** Normalization method for cross-stock score comparison */
export interface NormalizationConfig {
  method: 'none' | 'z-score' | 'percentile' | 'min-max' | 'custom'
  params?: Record<string, number>
}

/** Verdict display mode — investor-action vs assessment style */
export type VerdictDisplayMode = 'action' | 'assessment'

/** Maps a score range to a verdict label */
export interface VerdictThreshold {
  minScore: number
  maxScore: number
  verdict: string           // e.g., "STRONG BUY" (action) or "Excellent" (assessment)
  altVerdict?: string       // Alternate style label
  color: string             // Tailwind color class
  description?: string      // e.g., "robust growth, high profitability, conservative debt"
}

/** Custom factor applied to final composite score */
export interface CustomFactor {
  id: string
  name: string
  type: 'multiplier' | 'additive' | 'conditional'
  value: number
  appliesTo?: string        // Segment or metric ID; null = applies to composite
}

/** A complete scorecard version — the full configuration for scoring */
export interface ScorecardVersion {
  id: string
  versionInfo: VersionInfo
  segments: ScorecardSegment[]
  compositeFormula: CompositeFormula
  normalization: NormalizationConfig
  verdictThresholds: VerdictThreshold[]
  customFactors: CustomFactor[]
  negativeHandlingRules: NegativeHandling[]
  verdictDisplayMode: VerdictDisplayMode
}

// ─────────────────────────────────────────────────
// Stage 3: Scoring Result Types
// ─────────────────────────────────────────────────

/** Score result for a single metric */
export interface MetricScore {
  metricId: string
  metricName: string
  rawValue: number | null
  normalizedScore: number   // 0-100
  isExcluded: boolean
  excludeReason?: string
}

/** Score result for a segment (group of metrics) */
export interface SegmentResult {
  segmentId: string
  segmentName: string
  metricScores: MetricScore[]
  segmentScore: number      // 0-100
  verdict?: string
  verdictColor?: string
}

/** Complete score result for a single stock */
export interface StockScoreResult {
  stockId: string
  stockName: string
  stockSymbol: string
  sector: string
  marketCap: number
  segmentResults: SegmentResult[]
  rawComposite: number      // Before normalization
  normalizedScore: number   // After normalization (0-100)
  verdict: string
  verdictColor: string
  rank: number
}

/** Result of scoring an entire universe of stocks */
export interface ModelRunResult {
  scorecardId: string
  scorecardVersion: string  // Display version string
  stocks: StockScoreResult[]
  rankedList: string[]      // Stock IDs in rank order
  runTimestamp: number
  universeSize: number
}

// ─────────────────────────────────────────────────
// Stage 4: Cohort Types
// ─────────────────────────────────────────────────

/** Filter types for building a cohort */
export type CohortFilterType =
  | 'sector'
  | 'market_cap'
  | 'score_range'
  | 'verdict'
  | 'custom'

export interface CohortFilter {
  type: CohortFilterType
  value: string | number | [number, number]   // String for sector, range for market_cap/score
  label?: string
}

/** A defined cohort of stocks for backtest comparison */
export interface CohortDefinition {
  id: string
  name: string
  filters: CohortFilter[]
  stockIds: string[]
}

// ─────────────────────────────────────────────────
// Stage 5: Date Range & Backtest Config
// ─────────────────────────────────────────────────

export type BacktestInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export interface BacktestConfig {
  scorecardId: string
  cohortId: string
  dateRange: {
    from: string            // ISO date string
    to: string
  }
  interval: BacktestInterval
  benchmarkIndex?: string   // e.g., 'NIFTY50', 'SENSEX'
}

// ─────────────────────────────────────────────────
// Stage 6: Review & Confirm
// ─────────────────────────────────────────────────

/** Snapshot of the full pipeline config for review before running */
export interface PipelineReviewSnapshot {
  scorecardVersion: ScorecardVersion
  selectedMetricsSummary: {
    totalMetrics: number
    bySegment: { segmentName: string; metricCount: number }[]
  }
  segmentsSummary: {
    totalSegments: number
    segments: { name: string; weight: number; metricCount: number }[]
    compositeFormula: string  // Human-readable formula string
  }
  scoringResultsSummary?: {
    universeSize: number
    scoreDistribution: { band: string; count: number }[]
    topFive: { name: string; score: number; verdict: string }[]
    bottomFive: { name: string; score: number; verdict: string }[]
  }
  cohortSummary?: {
    totalStocks: number
    filters: string[]         // Human-readable filter descriptions
    sectorBreakdown: { sector: string; count: number }[]
  }
  dateConfig?: {
    from: string
    to: string
    interval: BacktestInterval
    benchmark?: string
  }
  confirmedAt?: number        // Timestamp when user confirmed
}

/** Request to edit a specific pipeline stage from the review panel */
export interface StageEditRequest {
  stageNumber: 1 | 2 | 3 | 4 | 5
  reason?: string
}

// ─────────────────────────────────────────────────
// Stage 7: Backtest Result Types
// ─────────────────────────────────────────────────

/** Snapshot of stock scores at a point in time */
export interface BacktestSnapshot {
  date: string
  stockScores: StockScoreResult[]
}

/** Price performance over a series of periods */
export interface PricePerformance {
  stockId: string
  stockName?: string
  periods: {
    date: string
    price: number
    returnPct: number         // Period return %
    cumulativeReturn: number  // Cumulative return from start
  }[]
}

/** Comparison of a target stock vs its cohort */
export interface CohortComparison {
  targetStockId: string
  targetStockName: string
  targetPerformance: PricePerformance
  cohortAvg: PricePerformance
  cohortMedian: PricePerformance
  cohortStocks: PricePerformance[]
  outperformancePct: number   // Target return minus cohort avg return
}

/** Summary metrics for the entire backtest */
export interface SummaryMetrics {
  hitRate: number             // % of high-scorers that outperformed
  avgAlpha: number            // Average outperformance
  bestPerformer: { stockId: string; name: string; returnPct: number }
  worstPerformer: { stockId: string; name: string; returnPct: number }
  correlationScoreVsReturn: number  // Pearson correlation
}

/** Quintile analysis result (Q1-Q5 by score) */
export interface QuintileResult {
  quintile: string            // 'Q1' through 'Q5'
  label: string               // e.g., 'Top 20%', 'Bottom 20%'
  avgScore: number
  avgReturn: number
  medianReturn: number
  pctBeatBenchmark: number
  stockCount: number
}

/** Per-metric contribution to a stock's final score (for waterfall chart) */
export interface MetricContribution {
  metricId: string
  metricName: string
  segmentName: string
  rawValue: number | null
  score: number               // 0-100
  weight: number              // Effective weight in composite
  contribution: number        // Actual points added to composite score
}

/** Score trajectory point for historical score timeline */
export interface ScoreTrajectoryPoint {
  date: string
  overallScore: number
  verdict: string
  verdictColor: string
  price: number
  segmentScores?: Record<string, number>
}

/** Complete backtest result */
export interface BacktestResult {
  config: BacktestConfig
  reviewSnapshot: PipelineReviewSnapshot
  snapshots: BacktestSnapshot[]
  comparisons: CohortComparison[]
  summaryMetrics: SummaryMetrics
  quintileAnalysis?: QuintileResult[]
  runTimestamp: number
}

// ─────────────────────────────────────────────────
// CMOTS API Types
// ─────────────────────────────────────────────────

export interface CMOTSCompany {
  CO_CODE: number
  CompanyName: string
  NSESYMBOL?: string
  BSESYMBOL?: string
  Sector: string
  Industry: string
  MarketCap: number
}

export interface CMOTSOHLCVRecord {
  CO_CODE: number
  Tradedate: string
  DayOpen: number
  DayHigh: number
  Daylow: number
  Dayclose: number
  TotalVolume: number
  DMCAP?: number
}

export interface CMOTSTTMRecord {
  CO_CODE: number
  [key: string]: number | string  // Dynamic fields from TTM API
}

export interface CMOTSFinancialRecord {
  CO_CODE: number
  YEAR: string
  [key: string]: number | string  // Dynamic P&L / Balance Sheet fields
}

export interface CMOTSShareholding {
  CO_CODE: number
  Quarter: string
  PromoterHolding: number
  FIIHolding: number
  DIIHolding: number
  PublicHolding: number
  [key: string]: number | string
}

// ─────────────────────────────────────────────────
// Store State Types
// ─────────────────────────────────────────────────

export type PipelineStage = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type UIMode = 'wizard' | 'dashboard' | 'hybrid'

export type ScoringStatus = 'idle' | 'scoring' | 'backtesting' | 'error'

/** Saved run for persistence and comparison */
export interface SavedRun {
  id: string
  name: string
  scorecard: ScorecardVersion
  run: ModelRunResult
  backtest?: BacktestResult
  reviewSnapshot: PipelineReviewSnapshot
  savedAt: number
}

// ─────────────────────────────────────────────────
// Metric Catalog Types (for Stage 1 browser)
// ─────────────────────────────────────────────────

/** Entry in the CMOTS metric catalog */
export interface MetricCatalogEntry {
  id: string
  name: string
  description: string
  cmots_source: string
  cmots_field: string
  unit: 'percent' | 'ratio' | 'currency' | 'number' | 'times'
  category: string          // e.g., 'Profitability', 'Growth', 'Valuation'
  subcategory?: string
  typicalRange?: [number, number]
  higherIsBetter?: boolean
}
