/**
 * Pre-built Scorecard Templates
 *
 * V2 Expert Model: Fully defined by SME (Vishal Rampuria) — updated from CSV Jan 2026
 * - 4 segments, 17 metrics, complete score bands, conditional valuation
 * - PB-anchored valuation (PE=30%, PB=50%, EV=20%)
 * - Exclude-based negative handling (weight redistributed, not zeroed)
 * - 5Y average growth period
 * V1 Comprehensive: All 11 segments skeleton with equal weights
 */

import type {
  ScorecardVersion,
  ScorecardSegment,
  VerdictThreshold,
  NegativeHandling,
  ScoreBand,
} from '@/types/scoring'

// ─────────────────────────────────────────────────
// V2 Expert Model — Score Bands (updated from SME CSV)
// ─────────────────────────────────────────────────

// Growth bands: Used for Revenue, EBITDA, Earnings (5Y CAGR)
// CSV calibration: 14.5% → 80, 7.8% → 60, 17.23% → 95, -8% → 20
const growthBands: ScoreBand[] = [
  { min: 25, max: Infinity, score: 100, label: 'Exceptional', color: 'text-success-400' },
  { min: 15, max: 24.99, score: 95, label: 'Very Strong', color: 'text-success-400' },
  { min: 10, max: 14.99, score: 80, label: 'Strong', color: 'text-success-400' },
  { min: 5, max: 9.99, score: 60, label: 'Good', color: 'text-teal-400' },
  { min: 0, max: 4.99, score: 35, label: 'Below Average', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 20, label: 'Negative Growth', color: 'text-destructive-400' },
]

// ROE bands: Negative ROE penalized but included (not zeroed)
// CSV calibration: 5.64% → 45, 19.41% → 85, -40% → 10, 2.08% → 35
const roeBands: ScoreBand[] = [
  { min: 25, max: Infinity, score: 100, label: 'Excellent', color: 'text-success-400' },
  { min: 20, max: 24.99, score: 95, label: 'Very Strong', color: 'text-success-400' },
  { min: 15, max: 19.99, score: 85, label: 'Strong', color: 'text-success-400' },
  { min: 10, max: 14.99, score: 65, label: 'Good', color: 'text-teal-400' },
  { min: 5, max: 9.99, score: 45, label: 'Average', color: 'text-warning-400' },
  { min: 2, max: 4.99, score: 35, label: 'Below Average', color: 'text-warning-400' },
  { min: 0, max: 1.99, score: 20, label: 'Weak', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 10, label: 'Negative ROE', color: 'text-destructive-400' },
]

// OCF/EBITDA bands: Ratio stored as percentage (0-100+)
// CSV calibration: 90% → 100, 73% → 100, 58.6% → 100, 20.4% → 25, negative → 10
const ocfEbitdaBands: ScoreBand[] = [
  { min: 50, max: Infinity, score: 100, label: 'Excellent Cash Gen', color: 'text-success-400' },
  { min: 30, max: 49.99, score: 60, label: 'Good', color: 'text-teal-400' },
  { min: 15, max: 29.99, score: 25, label: 'Average', color: 'text-warning-400' },
  { min: 0, max: 14.99, score: 15, label: 'Weak', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 10, label: 'Negative Cash Flow', color: 'text-destructive-400' },
]

// Gross Block bands: Investment rate
// CSV calibration: 2.2% → 45, 8.21% → 70, 11.17% → 80, 47.9% → 100, -17.6% → 20
const grossBlockBands: ScoreBand[] = [
  { min: 20, max: Infinity, score: 100, label: 'Heavy Investment', color: 'text-success-400' },
  { min: 10, max: 19.99, score: 80, label: 'Strong Investment', color: 'text-success-400' },
  { min: 5, max: 9.99, score: 70, label: 'Good Investment', color: 'text-teal-400' },
  { min: 0, max: 4.99, score: 45, label: 'Minimal Investment', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 20, label: 'Declining Assets', color: 'text-destructive-400' },
]

// Debt/EBITDA bands: Lower = better
const debtEbitdaBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Very Low Debt', color: 'text-success-400' },
  { min: 0.5, max: 1.0, score: 85, label: 'Low Debt', color: 'text-success-400' },
  { min: 1.0, max: 2.0, score: 75, label: 'Moderate Debt', color: 'text-teal-400' },
  { min: 2.0, max: 3.0, score: 65, label: 'Elevated Debt', color: 'text-warning-400' },
  { min: 3.0, max: 4.0, score: 50, label: 'High Debt', color: 'text-warning-400' },
  { min: 4.0, max: 5.0, score: 30, label: 'Very High Debt', color: 'text-destructive-400' },
  { min: 5.0, max: Infinity, score: 10, label: 'Dangerous Debt', color: 'text-destructive-400' },
]

// Valuation bands: % of 5Y average (e.g. 44 means 44% of 5Y avg = deeply undervalued)
// CSV uses percentage, code stores as ratio. Input is ratio (0.44, 0.91, 1.68, etc.)
// CSV calibration: 0.44 → 100, 0.72 → 90, 0.91 → 85, 1.69 → 50
const peVs5YBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Deeply Undervalued', color: 'text-success-400' },
  { min: 0.5, max: 0.7, score: 95, label: 'Significantly Undervalued', color: 'text-success-400' },
  { min: 0.7, max: 0.8, score: 90, label: 'Undervalued', color: 'text-success-400' },
  { min: 0.8, max: 0.95, score: 85, label: 'Attractive', color: 'text-teal-400' },
  { min: 0.95, max: 1.1, score: 70, label: 'Near Fair Value', color: 'text-teal-400' },
  { min: 1.1, max: 1.3, score: 55, label: 'Slightly Overvalued', color: 'text-warning-400' },
  { min: 1.3, max: 1.5, score: 50, label: 'Moderately Overvalued', color: 'text-warning-400' },
  { min: 1.5, max: Infinity, score: 40, label: 'Overvalued', color: 'text-destructive-400' },
]

// PB vs 5Y Avg: PB is the anchor metric (most weight)
// CSV calibration: 0.997 → 80, 1.066 → 80, 1.41 → 65, 1.58 → 60
const pbVs5YBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Deeply Undervalued', color: 'text-success-400' },
  { min: 0.5, max: 0.7, score: 95, label: 'Significantly Undervalued', color: 'text-success-400' },
  { min: 0.7, max: 0.85, score: 90, label: 'Undervalued', color: 'text-success-400' },
  { min: 0.85, max: 1.05, score: 80, label: 'Attractive', color: 'text-teal-400' },
  { min: 1.05, max: 1.15, score: 75, label: 'Near Fair Value', color: 'text-teal-400' },
  { min: 1.15, max: 1.4, score: 65, label: 'Slightly Overvalued', color: 'text-warning-400' },
  { min: 1.4, max: 1.6, score: 60, label: 'Moderately Overvalued', color: 'text-warning-400' },
  { min: 1.6, max: Infinity, score: 50, label: 'Overvalued', color: 'text-destructive-400' },
]

// EV/EBITDA vs 5Y Avg
// CSV calibration: 0.69 → 100, 0.79 → 90, 0.89 → 85, 1.09 → 80, 1.27 → 70
const evVs5YBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Deeply Undervalued', color: 'text-success-400' },
  { min: 0.5, max: 0.7, score: 100, label: 'Significantly Undervalued', color: 'text-success-400' },
  { min: 0.7, max: 0.8, score: 90, label: 'Undervalued', color: 'text-success-400' },
  { min: 0.8, max: 0.95, score: 85, label: 'Attractive', color: 'text-teal-400' },
  { min: 0.95, max: 1.1, score: 80, label: 'Near Fair Value', color: 'text-teal-400' },
  { min: 1.1, max: 1.3, score: 70, label: 'Slightly Overvalued', color: 'text-warning-400' },
  { min: 1.3, max: 1.5, score: 55, label: 'Moderately Overvalued', color: 'text-warning-400' },
  { min: 1.5, max: Infinity, score: 40, label: 'Overvalued', color: 'text-destructive-400' },
]

// Technical bands: Price vs EMA deviation (%) — positive = above EMA = bullish
const priceVsEmaBands: ScoreBand[] = [
  { min: 10, max: Infinity, score: 100, label: 'Strongly Above EMA', color: 'text-success-400' },
  { min: 5, max: 9.99, score: 80, label: 'Above EMA', color: 'text-success-400' },
  { min: 2, max: 4.99, score: 65, label: 'Slightly Above', color: 'text-teal-400' },
  { min: -2, max: 1.99, score: 50, label: 'Near EMA', color: 'text-warning-400' },
  { min: -5, max: -2.01, score: 30, label: 'Below EMA', color: 'text-warning-400' },
  { min: -10, max: -5.01, score: 15, label: 'Well Below EMA', color: 'text-destructive-400' },
  { min: -Infinity, max: -10.01, score: 0, label: 'Deeply Below EMA', color: 'text-destructive-400' },
]

// RSI bands (0-100 range): 50 is neutral
const rsiBands: ScoreBand[] = [
  { min: 60, max: 70, score: 100, label: 'Strong Momentum', color: 'text-success-400' },
  { min: 50, max: 59.99, score: 80, label: 'Positive Momentum', color: 'text-success-400' },
  { min: 70.01, max: 80, score: 65, label: 'Overbought (Mild)', color: 'text-teal-400' },
  { min: 40, max: 49.99, score: 50, label: 'Neutral', color: 'text-warning-400' },
  { min: 30, max: 39.99, score: 30, label: 'Weak Momentum', color: 'text-warning-400' },
  { min: 80.01, max: Infinity, score: 20, label: 'Overbought', color: 'text-destructive-400' },
  { min: -Infinity, max: 29.99, score: 10, label: 'Oversold', color: 'text-destructive-400' },
]

// Volume-Price Trend (VPT): positive = accumulation, negative = distribution
const vptBands: ScoreBand[] = [
  { min: 25, max: Infinity, score: 100, label: 'Strong Accumulation', color: 'text-success-400' },
  { min: 15, max: 24.99, score: 80, label: 'Accumulation', color: 'text-success-400' },
  { min: 5, max: 14.99, score: 60, label: 'Mild Accumulation', color: 'text-teal-400' },
  { min: -5, max: 4.99, score: 40, label: 'Neutral', color: 'text-warning-400' },
  { min: -15, max: -5.01, score: 20, label: 'Distribution', color: 'text-warning-400' },
  { min: -Infinity, max: -15.01, score: 0, label: 'Strong Distribution', color: 'text-destructive-400' },
]

// ─────────────────────────────────────────────────
// V2 Expert Model — Negative Handling Rules (updated from SME CSV)
//
// Philosophy change: Most negatives → EXCLUDE (weight redistributed)
// instead of ZERO (weight counted, drags score down).
// Exceptions: Revenue Growth & ROE allow negative values through
// and penalize via score bands (e.g., negative ROE → 10, not 0).
// ─────────────────────────────────────────────────

const v2NegativeHandlingRules: NegativeHandling[] = [
  // ── Revenue Growth ──
  // CSV: Start/End negative → Exclude (CAGR undefined), Any/All negative → Include (penalize via bands)
  // "Revenue decline is economically meaningful" — negative growth scores via bands (→ 20)
  { metricId: 'v2_revenue_growth', condition: 'start_negative', action: 'exclude', description: 'Start year negative revenue → exclude (CAGR undefined)' },
  { metricId: 'v2_revenue_growth', condition: 'end_negative', action: 'exclude', description: 'End year negative revenue → exclude (CAGR undefined)' },
  // Note: both_negative is intentionally NOT listed — if the computed growth value
  // is negative (which can happen with non-CAGR methods), it flows through to bands and scores 20.

  // ── EBITDA Growth ──
  // CSV: All scenarios → Exclude. "Negative EBITDA breaks CAGR logic"
  { metricId: 'v2_ebitda_growth', condition: 'start_negative', action: 'exclude', description: 'Start year negative EBITDA → exclude (CAGR undefined)' },
  { metricId: 'v2_ebitda_growth', condition: 'end_negative', action: 'exclude', description: 'End year negative EBITDA → exclude (CAGR undefined)' },
  { metricId: 'v2_ebitda_growth', condition: 'both_negative', action: 'exclude', description: 'Both years negative EBITDA → exclude' },
  { metricId: 'v2_ebitda_growth', condition: 'any_negative', action: 'exclude', description: 'Any year negative EBITDA → exclude' },

  // ── Earnings Growth ──
  // CSV: All scenarios → Exclude. "Losses invalidate earnings CAGR"
  { metricId: 'v2_earnings_growth', condition: 'start_negative', action: 'exclude', description: 'Start year negative earnings → exclude (CAGR undefined)' },
  { metricId: 'v2_earnings_growth', condition: 'end_negative', action: 'exclude', description: 'End year negative earnings → exclude (CAGR undefined)' },
  { metricId: 'v2_earnings_growth', condition: 'both_negative', action: 'exclude', description: 'Both years negative earnings → exclude' },
  { metricId: 'v2_earnings_growth', condition: 'any_negative', action: 'exclude', description: 'Any year negative earnings → exclude' },

  // ── ROE ──
  // CSV: Start/End negative → Exclude, Any/All negative → Include (penalize via bands)
  // "Negative ROE indicates value destruction" — scores via bands (→ 10)
  { metricId: 'v2_roe', condition: 'start_negative', action: 'exclude', description: 'Negative ROE in start year → exclude' },
  { metricId: 'v2_roe', condition: 'end_negative', action: 'exclude', description: 'Negative ROE in end year → exclude' },
  // Note: any_negative is NOT listed — negative ROE flows through to bands and scores 10.
  // This matches CSV: SpiceJet ROE = -40% → Score 10 (included in weighted average)

  // ── OCF/EBITDA ──
  // CSV: "Exclude if EBITDA ≤ 0" — ratio meaningless when denominator is 0 or negative
  { metricId: 'v2_ocf_ebitda', condition: 'start_negative', action: 'exclude', description: 'EBITDA ≤ 0 → ratio meaningless, exclude' },
  { metricId: 'v2_ocf_ebitda', condition: 'end_negative', action: 'exclude', description: 'EBITDA ≤ 0 → ratio meaningless, exclude' },
  { metricId: 'v2_ocf_ebitda', condition: 'both_negative', action: 'exclude', description: 'EBITDA ≤ 0 → ratio meaningless, exclude' },
  { metricId: 'v2_ocf_ebitda', condition: 'any_negative', action: 'exclude', description: 'EBITDA ≤ 0 → ratio meaningless, exclude' },

  // ── Gross Block ──
  // CSV: All → Exclude. "Negative implies asset write-offs"
  { metricId: 'v2_gross_block', condition: 'start_negative', action: 'exclude', description: 'Negative gross block → exclude (asset write-off)' },
  { metricId: 'v2_gross_block', condition: 'end_negative', action: 'exclude', description: 'Negative gross block → exclude (asset write-off)' },
  { metricId: 'v2_gross_block', condition: 'both_negative', action: 'exclude', description: 'Negative gross block → exclude (asset write-off)' },
  { metricId: 'v2_gross_block', condition: 'any_negative', action: 'exclude', description: 'Negative gross block → exclude (asset write-off)' },

  // ── Debt/EBITDA ──
  // CSV: All → Exclude. "No meaningful denominator"
  // Note: This overrides the previous max_score for negative debt.
  // Negative debt/EBITDA could mean negative debt (good) or negative EBITDA (bad).
  // Since we can't distinguish, exclude is safer.
  { metricId: 'v2_debt_ebitda', condition: 'start_negative', action: 'exclude', description: 'Negative debt/EBITDA → exclude' },
  { metricId: 'v2_debt_ebitda', condition: 'end_negative', action: 'exclude', description: 'Negative debt/EBITDA → exclude' },
  { metricId: 'v2_debt_ebitda', condition: 'both_negative', action: 'exclude', description: 'Negative debt/EBITDA → exclude' },
  { metricId: 'v2_debt_ebitda', condition: 'any_negative', action: 'exclude', description: 'Negative debt/EBITDA → exclude' },

  // ── Valuation metrics ──
  // CSV: All valuation metrics with negative inputs → Exclude ("Mark valuation not meaningful")
  { metricId: 'v2_pe_vs_5y', condition: 'any_negative', action: 'exclude', description: 'Negative PE → valuation not meaningful, exclude' },
  { metricId: 'v2_pb_vs_5y', condition: 'any_negative', action: 'exclude', description: 'Negative PB → valuation not meaningful, exclude' },
  { metricId: 'v2_ev_vs_5y', condition: 'any_negative', action: 'exclude', description: 'Negative EV/EBITDA → valuation not meaningful, exclude' },
]

// ─────────────────────────────────────────────────
// V2 Expert Model — Segment Definitions
// ─────────────────────────────────────────────────

const v2FinancialSegment: ScorecardSegment = {
  id: 'v2_financial',
  name: 'Financial Score',
  segmentWeight: 0.4,
  description: 'Fundamental financial health: growth, profitability, cash generation, debt management',
  metrics: [
    {
      id: 'v2_revenue_growth', name: 'Revenue Growth (5Y Avg)', type: 'raw',
      rawMetric: { id: 'v2_revenue_growth', name: 'Revenue Growth', cmots_source: 'pnl', cmots_field: 'RevenueGrowth5Y', unit: 'percent', description: '5-year average revenue CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_ebitda_growth', name: 'EBITDA Growth (5Y Avg)', type: 'raw',
      rawMetric: { id: 'v2_ebitda_growth', name: 'EBITDA Growth', cmots_source: 'pnl', cmots_field: 'EBITDAGrowth5Y', unit: 'percent', description: '5-year average EBITDA CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_earnings_growth', name: 'Earnings Growth (5Y Avg)', type: 'raw',
      rawMetric: { id: 'v2_earnings_growth', name: 'Earnings Growth', cmots_source: 'pnl', cmots_field: 'EarningsGrowth5Y', unit: 'percent', description: '5-year average earnings CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_roe', name: 'Return on Equity (ROE)', type: 'raw',
      rawMetric: { id: 'v2_roe', name: 'ROE', cmots_source: 'ttm', cmots_field: 'ROE', unit: 'percent', description: 'Return on equity (avg 5Y)' },
      scoreBands: roeBands, weight: 1 / 7,
    },
    {
      id: 'v2_ocf_ebitda', name: 'OCF/EBITDA', type: 'formula',
      formula: {
        id: 'v2_ocf_ebitda_formula', name: 'OCF/EBITDA',
        inputs: [
          { id: 'ocf', name: 'Operating Cash Flow', cmots_source: 'cash_flow', cmots_field: 'OCF', unit: 'currency', description: 'Operating cash flow' },
          { id: 'ebitda', name: 'EBITDA', cmots_source: 'pnl', cmots_field: 'EBITDA', unit: 'currency', description: 'EBITDA' },
        ],
        operator: 'divide', description: 'Operating Cash Flow / EBITDA (latest year, %)',
      },
      scoreBands: ocfEbitdaBands, weight: 1 / 7,
    },
    {
      id: 'v2_gross_block', name: 'Gross Block Growth', type: 'raw',
      rawMetric: { id: 'v2_gross_block', name: 'Gross Block Growth', cmots_source: 'balance_sheet', cmots_field: 'GrossBlockGrowth', unit: 'percent', description: 'Growth in gross block (PP&E investment)' },
      scoreBands: grossBlockBands, weight: 1 / 7,
    },
    {
      id: 'v2_debt_ebitda', name: 'Debt/EBITDA', type: 'formula',
      formula: {
        id: 'v2_debt_ebitda_formula', name: 'Debt/EBITDA',
        inputs: [
          { id: 'total_debt', name: 'Total Debt', cmots_source: 'balance_sheet', cmots_field: 'TotalDebt', unit: 'currency', description: 'Total debt' },
          { id: 'ebitda', name: 'EBITDA', cmots_source: 'pnl', cmots_field: 'EBITDA', unit: 'currency', description: 'EBITDA' },
        ],
        operator: 'divide', description: 'Total Debt / EBITDA (latest year)',
      },
      scoreBands: debtEbitdaBands, weight: 1 / 7,
    },
  ],
  // CSV Financial Score Thresholds (shifted up from previous version)
  verdictThresholds: [
    { minScore: 85, maxScore: 100, verdict: 'Very Strong Financials', altVerdict: 'Excellent', color: 'text-success-400', description: 'Best-in-class profitability, growth, balance sheet' },
    { minScore: 70, maxScore: 84, verdict: 'Strong Financials', altVerdict: 'Strong', color: 'text-success-400', description: 'Above average on most financial metrics' },
    { minScore: 55, maxScore: 69, verdict: 'Average Financials', altVerdict: 'Average', color: 'text-warning-400', description: 'Mixed performance; some strengths, some weakness' },
    { minScore: 40, maxScore: 54, verdict: 'Weak Financials', altVerdict: 'Weak', color: 'text-warning-400', description: 'Red flags in efficiency, growth or balance sheet' },
    { minScore: 0, maxScore: 39, verdict: 'Poor Financials', altVerdict: 'Poor', color: 'text-destructive-400', description: 'Structurally weak fundamentals' },
  ],
}

const v2ValuationSegment: ScorecardSegment = {
  id: 'v2_valuation',
  name: 'Valuation Score',
  segmentWeight: 0.6,
  description: 'Valuation relative to 5-year historical averages. PB-anchored: PE=30%, PB=50%, EV/EBITDA=20% (conditional)',
  metrics: [
    {
      id: 'v2_pe_vs_5y', name: 'PE vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_pe_vs_5y', name: 'PE vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'PE_vs_5YAvg', unit: 'ratio', description: 'Current PE / 5-year average PE' },
      scoreBands: peVs5YBands, weight: 0.3,   // was 0.4
    },
    {
      id: 'v2_pb_vs_5y', name: 'PB vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_pb_vs_5y', name: 'PB vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'PB_vs_5YAvg', unit: 'ratio', description: 'Current PB / 5-year average PB' },
      scoreBands: pbVs5YBands, weight: 0.5,   // was 0.3 — PB is now anchor
    },
    {
      id: 'v2_ev_vs_5y', name: 'EV/EBITDA vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_ev_vs_5y', name: 'EV/EBITDA vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'EV_EBITDA_vs_5YAvg', unit: 'ratio', description: 'Current EV/EBITDA / 5-year average' },
      scoreBands: evVs5YBands, weight: 0.2,   // was 0.3
    },
  ],
  // CSV Valuation Score Thresholds (tighter, with new "Attractive" band)
  verdictThresholds: [
    { minScore: 85, maxScore: 100, verdict: 'Undervalued', altVerdict: 'Excellent', color: 'text-success-400', description: 'Cheap compared to historical averages' },
    { minScore: 75, maxScore: 84, verdict: 'Attractive', altVerdict: 'Good', color: 'text-teal-400', description: 'Attractively priced at CMP' },
    { minScore: 65, maxScore: 74, verdict: 'Fairly Valued', altVerdict: 'Fair', color: 'text-warning-400', description: 'Priced near long-term averages' },
    { minScore: 55, maxScore: 64, verdict: 'Moderately Expensive', altVerdict: 'Caution', color: 'text-warning-400', description: 'Limited upside from valuation' },
    { minScore: 0, maxScore: 54, verdict: 'Expensive', altVerdict: 'Expensive', color: 'text-destructive-400', description: 'Valuation risk at CMP' },
  ],
}

const v2TechnicalSegment: ScorecardSegment = {
  id: 'v2_technical',
  name: 'Technical Score',
  segmentWeight: 0.15,
  description: 'Technical indicators: EMA crossovers, RSI, volume-price trend',
  metrics: [
    {
      id: 'v2_price_ema20', name: 'Price vs 20D EMA', type: 'raw',
      rawMetric: { id: 'v2_price_ema20', name: 'Price vs 20D EMA', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA20', unit: 'percent', description: 'Price deviation from 20-day EMA' },
      scoreBands: priceVsEmaBands, weight: 0.15,
    },
    {
      id: 'v2_price_ema50', name: 'Price vs 50D EMA', type: 'raw',
      rawMetric: { id: 'v2_price_ema50', name: 'Price vs 50D EMA', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA50', unit: 'percent', description: 'Price deviation from 50-day EMA' },
      scoreBands: priceVsEmaBands, weight: 0.20,
    },
    {
      id: 'v2_price_ema200', name: 'Price vs 200D EMA', type: 'raw',
      rawMetric: { id: 'v2_price_ema200', name: 'Price vs 200D EMA', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA200', unit: 'percent', description: 'Price deviation from 200-day EMA' },
      scoreBands: priceVsEmaBands, weight: 0.25,
    },
    {
      id: 'v2_rsi', name: 'RSI (14)', type: 'raw',
      rawMetric: { id: 'v2_rsi', name: 'RSI', cmots_source: 'ohlcv', cmots_field: 'RSI14', unit: 'number', description: 'Relative Strength Index (14-period)' },
      scoreBands: rsiBands, weight: 0.20,
    },
    {
      id: 'v2_vpt', name: 'Volume-Price Trend', type: 'raw',
      rawMetric: { id: 'v2_vpt', name: 'VPT', cmots_source: 'ohlcv', cmots_field: 'VPT', unit: 'number', description: 'Volume-Price Trend indicator' },
      scoreBands: vptBands, weight: 0.20,
    },
  ],
  // CSV Technical Score Thresholds (new Mild Bearish band, lower Bullish threshold)
  verdictThresholds: [
    { minScore: 75, maxScore: 100, verdict: 'Bullish', altVerdict: 'Bullish', color: 'text-success-400', description: 'Strong uptrend with clear momentum and trend support' },
    { minScore: 60, maxScore: 74, verdict: 'Mild Bullish', altVerdict: 'Positive', color: 'text-teal-400', description: 'Positive bias; trend improving but not fully confirmed' },
    { minScore: 50, maxScore: 59, verdict: 'Neutral', altVerdict: 'Neutral', color: 'text-warning-400', description: 'Sideways movement; no strong trend or momentum edge' },
    { minScore: 40, maxScore: 49, verdict: 'Mild Bearish', altVerdict: 'Weak', color: 'text-warning-400', description: 'Weak structure; downside risk unless trend improves' },
    { minScore: 0, maxScore: 39, verdict: 'Bearish', altVerdict: 'Bearish', color: 'text-destructive-400', description: 'Clear downtrend with poor momentum and weak support' },
  ],
}

const v2QuarterlyMomentumSegment: ScorecardSegment = {
  id: 'v2_quarterly_momentum',
  name: 'Quarterly Momentum',
  segmentWeight: 0.10,
  description: 'Quarter-over-quarter acceleration: Revenue and EBITDA Multipliers vs same quarter last year',
  metrics: [
    {
      id: 'v2_revenue_multiplier', name: 'Revenue Multiplier', type: 'raw',
      rawMetric: { id: 'v2_revenue_multiplier', name: 'Revenue Multiplier', cmots_source: 'quarterly', cmots_field: 'RevenueMultiplier', unit: 'times', description: 'Current Q revenue / Same Q last year revenue' },
      scoreBands: [
        { min: 1.5, max: Infinity, score: 100, label: 'Exceptional Growth', color: 'text-success-400' },
        { min: 1.3, max: 1.499, score: 85, label: 'Strong Growth', color: 'text-success-400' },
        { min: 1.15, max: 1.299, score: 70, label: 'Healthy Growth', color: 'text-teal-400' },
        { min: 1.05, max: 1.149, score: 55, label: 'Moderate Growth', color: 'text-teal-400' },
        { min: 0.95, max: 1.049, score: 40, label: 'Flat', color: 'text-warning-400' },
        { min: 0.85, max: 0.949, score: 25, label: 'Mild Contraction', color: 'text-warning-400' },
        { min: 0.7, max: 0.849, score: 10, label: 'Contraction', color: 'text-destructive-400' },
        { min: -Infinity, max: 0.699, score: 0, label: 'Severe Contraction', color: 'text-destructive-400' },
      ],
      weight: 0.5,
    },
    {
      id: 'v2_ebitda_multiplier', name: 'EBITDA Multiplier', type: 'raw',
      rawMetric: { id: 'v2_ebitda_multiplier', name: 'EBITDA Multiplier', cmots_source: 'quarterly', cmots_field: 'EBITDAMultiplier', unit: 'times', description: 'Current Q EBITDA / Same Q last year EBITDA' },
      scoreBands: [
        { min: 1.5, max: Infinity, score: 100, label: 'Exceptional Growth', color: 'text-success-400' },
        { min: 1.3, max: 1.499, score: 85, label: 'Strong Growth', color: 'text-success-400' },
        { min: 1.15, max: 1.299, score: 70, label: 'Healthy Growth', color: 'text-teal-400' },
        { min: 1.05, max: 1.149, score: 55, label: 'Moderate Growth', color: 'text-teal-400' },
        { min: 0.95, max: 1.049, score: 40, label: 'Flat', color: 'text-warning-400' },
        { min: 0.85, max: 0.949, score: 25, label: 'Mild Contraction', color: 'text-warning-400' },
        { min: 0.7, max: 0.849, score: 10, label: 'Contraction', color: 'text-destructive-400' },
        { min: -Infinity, max: 0.699, score: 0, label: 'Severe Contraction', color: 'text-destructive-400' },
      ],
      weight: 0.5,
    },
  ],
}

// ─────────────────────────────────────────────────
// V2 Expert Model — Overall Verdict Thresholds
// ─────────────────────────────────────────────────

const v2OverallVerdicts: VerdictThreshold[] = [
  { minScore: 80, maxScore: 100, verdict: 'STRONG BUY', altVerdict: 'Top Pick', color: 'text-success-400', description: 'Strong fundamentals and very attractive valuation supported by trend indicators' },
  { minScore: 65, maxScore: 79, verdict: 'BUY', altVerdict: 'Smart Opportunity', color: 'text-teal-400', description: 'Good fundamentals, valuation and supportive technicals' },
  { minScore: 50, maxScore: 64, verdict: 'HOLD', altVerdict: 'Balanced Play', color: 'text-warning-400', description: 'Mixed signals suggesting a wait-and-watch approach' },
  { minScore: 35, maxScore: 49, verdict: 'REVIEW', altVerdict: 'Caution Zone', color: 'text-warning-400', description: 'Average fundamentals with stretched valuation signal downside risk' },
  { minScore: 0, maxScore: 34, verdict: 'SELL', altVerdict: 'Exit Risk', color: 'text-destructive-400', description: 'Weak fundamentals and extreme valuation at CMP' },
]

// ─────────────────────────────────────────────────
// V2 Expert Model — Full Scorecard
// ─────────────────────────────────────────────────

export const V2_EXPERT_SCORECARD: ScorecardVersion = {
  id: 'v2-expert-1',
  versionInfo: {
    macroVersion: 'V2',
    microVersion: 2,
    displayVersion: 'V2.2',
    name: 'Expert Scoring Model',
    description: 'SME-created scoring model with 4 segments, PB-anchored conditional valuation, exclude-based negative handling, and quarterly momentum overlay',
    sourceReference: 'Vishal Rampuria - StockFox SME (CSV Jan 2026)',
    createdAt: Date.now(),
  },
  segments: [
    v2FinancialSegment,
    v2ValuationSegment,
    v2TechnicalSegment,
    v2QuarterlyMomentumSegment,
  ],
  compositeFormula: {
    baseSegments: [
      { segmentId: 'v2_financial', weight: 0.4 },
      { segmentId: 'v2_valuation', weight: 0.6 },
    ],
    baseWeight: 0.75,
    overlaySegments: [
      { segmentId: 'v2_technical', weight: 0.15 },
      { segmentId: 'v2_quarterly_momentum', weight: 0.10 },
    ],
  },
  normalization: { method: 'none' },
  verdictThresholds: v2OverallVerdicts,
  customFactors: [],
  negativeHandlingRules: v2NegativeHandlingRules,
  verdictDisplayMode: 'action',
}

// ─────────────────────────────────────────────────
// V1 Comprehensive Model — Skeleton
// ─────────────────────────────────────────────────

function createSkeletonSegment(id: string, name: string, metricNames: string[]): ScorecardSegment {
  return {
    id,
    name,
    segmentWeight: 1 / 11,  // Equal weight across 11 segments
    metrics: metricNames.map(metricName => ({
      id: `v1_${id}_${metricName.toLowerCase().replace(/\s+/g, '_')}`,
      name: metricName,
      type: 'raw' as const,
      rawMetric: {
        id: `v1_${id}_${metricName.toLowerCase().replace(/\s+/g, '_')}`,
        name: metricName,
        cmots_source: 'ttm',
        cmots_field: metricName.replace(/\s+/g, ''),
        unit: 'number' as const,
        description: metricName,
      },
      scoreBands: [],  // User needs to define
      weight: 1 / metricNames.length,
    })),
  }
}

export const V1_COMPREHENSIVE_SCORECARD: ScorecardVersion = {
  id: 'v1-comprehensive-1',
  versionInfo: {
    macroVersion: 'V1',
    microVersion: 1,
    displayVersion: 'V1.1',
    name: 'Comprehensive Model (All Segments)',
    description: 'All 11 analysis segments with equal weights. Customize metrics and weights to build your own model.',
    createdAt: Date.now(),
  },
  segments: [
    createSkeletonSegment('profitability', 'Profitability', ['ROE', 'ROA', 'ROCE', 'Net Margin', 'Operating Margin', 'EBITDA Margin']),
    createSkeletonSegment('financial_ratios', 'Financial Ratios', ['Current Ratio', 'Quick Ratio', 'Debt to Equity', 'Interest Coverage']),
    createSkeletonSegment('growth', 'Growth', ['Revenue Growth', 'Profit Growth', 'EPS Growth', 'Book Value Growth']),
    createSkeletonSegment('valuation', 'Valuation', ['PE Ratio', 'PB Ratio', 'EV/EBITDA', 'PEG Ratio', 'Dividend Yield']),
    createSkeletonSegment('price_volume', 'Price & Volume', ['52W High Proximity', '52W Low Proximity', 'Avg Volume', 'Beta']),
    createSkeletonSegment('technical', 'Technical', ['RSI', 'MACD', 'Moving Averages', 'Bollinger Bands']),
    createSkeletonSegment('broker_ratings', 'Broker Ratings', ['Consensus Rating', 'Target Price Upside', 'Coverage Count']),
    createSkeletonSegment('ownership', 'Ownership', ['Promoter Holding', 'FII Holding', 'DII Holding', 'Promoter Pledge']),
    createSkeletonSegment('fno', 'F&O Data', ['OI Change', 'Put Call Ratio', 'Max Pain', 'Delivery %']),
    createSkeletonSegment('income_statement', 'Income Statement', ['Revenue', 'EBITDA', 'Net Income', 'EPS', 'Payout Ratio']),
    createSkeletonSegment('balance_sheet', 'Balance Sheet & Cash Flow', ['Total Assets', 'Total Debt', 'Free Cash Flow', 'Working Capital']),
  ],
  compositeFormula: {
    baseSegments: [
      { segmentId: 'profitability', weight: 1 / 11 },
      { segmentId: 'financial_ratios', weight: 1 / 11 },
      { segmentId: 'growth', weight: 1 / 11 },
      { segmentId: 'valuation', weight: 1 / 11 },
      { segmentId: 'price_volume', weight: 1 / 11 },
      { segmentId: 'technical', weight: 1 / 11 },
      { segmentId: 'broker_ratings', weight: 1 / 11 },
      { segmentId: 'ownership', weight: 1 / 11 },
      { segmentId: 'fno', weight: 1 / 11 },
      { segmentId: 'income_statement', weight: 1 / 11 },
      { segmentId: 'balance_sheet', weight: 1 / 11 },
    ],
    baseWeight: 1.0,
  },
  normalization: { method: 'none' },
  verdictThresholds: v2OverallVerdicts,
  customFactors: [],
  negativeHandlingRules: [],
  verdictDisplayMode: 'action',
}

/** All available scorecard templates */
export const SCORECARD_TEMPLATES: ScorecardVersion[] = [
  V2_EXPERT_SCORECARD,
  V1_COMPREHENSIVE_SCORECARD,
]
