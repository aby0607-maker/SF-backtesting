/**
 * Pre-built Scorecard Templates
 *
 * V2 Expert Model: Fully defined by SME (Vishal Rampuria)
 * - 4 segments, 17 metrics, complete score bands, conditional valuation
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
// V2 Expert Model — Score Bands
// ─────────────────────────────────────────────────

const growthBands: ScoreBand[] = [
  { min: 25, max: Infinity, score: 100, label: 'Exceptional', color: 'text-success-400' },
  { min: 20, max: 24.99, score: 80, label: 'Strong', color: 'text-success-400' },
  { min: 15, max: 19.99, score: 65, label: 'Good', color: 'text-teal-400' },
  { min: 10, max: 14.99, score: 50, label: 'Moderate', color: 'text-teal-400' },
  { min: 5, max: 9.99, score: 35, label: 'Below Average', color: 'text-warning-400' },
  { min: 0, max: 4.99, score: 20, label: 'Weak', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 0, label: 'Negative', color: 'text-destructive-400' },
]

const roeBands: ScoreBand[] = [
  { min: 20, max: Infinity, score: 100, label: 'Excellent', color: 'text-success-400' },
  { min: 15, max: 19.99, score: 80, label: 'Strong', color: 'text-success-400' },
  { min: 12, max: 14.99, score: 65, label: 'Good', color: 'text-teal-400' },
  { min: 8, max: 11.99, score: 45, label: 'Average', color: 'text-warning-400' },
  { min: 5, max: 7.99, score: 25, label: 'Below Average', color: 'text-warning-400' },
  { min: -Infinity, max: 4.99, score: 0, label: 'Poor', color: 'text-destructive-400' },
]

const ocfEbitdaBands: ScoreBand[] = [
  { min: 0.9, max: Infinity, score: 100, label: 'Excellent Cash Gen', color: 'text-success-400' },
  { min: 0.7, max: 0.899, score: 80, label: 'Strong', color: 'text-success-400' },
  { min: 0.5, max: 0.699, score: 60, label: 'Good', color: 'text-teal-400' },
  { min: 0.3, max: 0.499, score: 40, label: 'Average', color: 'text-warning-400' },
  { min: 0, max: 0.299, score: 20, label: 'Weak', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 0, label: 'Negative', color: 'text-destructive-400' },
]

const grossBlockBands: ScoreBand[] = [
  { min: 20, max: Infinity, score: 100, label: 'Heavy Investment', color: 'text-success-400' },
  { min: 15, max: 19.99, score: 80, label: 'Strong Investment', color: 'text-success-400' },
  { min: 10, max: 14.99, score: 60, label: 'Moderate', color: 'text-teal-400' },
  { min: 5, max: 9.99, score: 40, label: 'Light', color: 'text-warning-400' },
  { min: 0, max: 4.99, score: 20, label: 'Minimal', color: 'text-warning-400' },
  { min: -Infinity, max: -0.01, score: 0, label: 'Declining', color: 'text-destructive-400' },
]

const debtEbitdaBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Very Low Debt', color: 'text-success-400' },
  { min: 0.5, max: 1.0, score: 85, label: 'Low Debt', color: 'text-success-400' },
  { min: 1.0, max: 2.0, score: 65, label: 'Moderate Debt', color: 'text-teal-400' },
  { min: 2.0, max: 3.0, score: 45, label: 'Elevated Debt', color: 'text-warning-400' },
  { min: 3.0, max: 5.0, score: 25, label: 'High Debt', color: 'text-destructive-400' },
  { min: 5.0, max: Infinity, score: 0, label: 'Dangerous Debt', color: 'text-destructive-400' },
]

// Valuation bands: Lower ratio vs 5Y avg = more undervalued = higher score
const valuationVs5YBands: ScoreBand[] = [
  { min: -Infinity, max: 0.5, score: 100, label: 'Deeply Undervalued', color: 'text-success-400' },
  { min: 0.5, max: 0.7, score: 85, label: 'Significantly Undervalued', color: 'text-success-400' },
  { min: 0.7, max: 0.85, score: 70, label: 'Moderately Undervalued', color: 'text-teal-400' },
  { min: 0.85, max: 1.0, score: 55, label: 'Near Fair Value', color: 'text-teal-400' },
  { min: 1.0, max: 1.15, score: 40, label: 'Slightly Overvalued', color: 'text-warning-400' },
  { min: 1.15, max: 1.5, score: 20, label: 'Overvalued', color: 'text-warning-400' },
  { min: 1.5, max: Infinity, score: 0, label: 'Significantly Overvalued', color: 'text-destructive-400' },
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
// V2 Expert Model — Negative Handling Rules
// ─────────────────────────────────────────────────

const v2NegativeHandlingRules: NegativeHandling[] = [
  // Revenue Growth
  { metricId: 'v2_revenue_growth', condition: 'start_negative', action: 'zero', description: 'Start year negative revenue → score 0' },
  { metricId: 'v2_revenue_growth', condition: 'end_negative', action: 'zero', description: 'End year negative revenue → score 0' },
  { metricId: 'v2_revenue_growth', condition: 'both_negative', action: 'improvement_check', description: 'Both years negative → check if improving' },
  // EBITDA Growth
  { metricId: 'v2_ebitda_growth', condition: 'start_negative', action: 'zero', description: 'Start year negative EBITDA → score 0' },
  { metricId: 'v2_ebitda_growth', condition: 'end_negative', action: 'zero', description: 'End year negative EBITDA → score 0' },
  { metricId: 'v2_ebitda_growth', condition: 'both_negative', action: 'improvement_check', description: 'Both years negative → check if improving' },
  // Earnings Growth
  { metricId: 'v2_earnings_growth', condition: 'start_negative', action: 'zero', description: 'Start year negative earnings → score 0' },
  { metricId: 'v2_earnings_growth', condition: 'end_negative', action: 'zero', description: 'End year negative earnings → score 0' },
  { metricId: 'v2_earnings_growth', condition: 'both_negative', action: 'zero', description: 'Both years negative earnings → score 0' },
  // ROE
  { metricId: 'v2_roe', condition: 'start_negative', action: 'zero', description: 'Negative ROE → score 0' },
  { metricId: 'v2_roe', condition: 'end_negative', action: 'zero', description: 'Negative ROE → score 0' },
  { metricId: 'v2_roe', condition: 'both_negative', action: 'zero', description: 'Negative ROE → score 0' },
  // OCF/EBITDA
  { metricId: 'v2_ocf_ebitda', condition: 'start_negative', action: 'special_calc', description: 'OCF/EBITDA with negative values → ratio analysis' },
  { metricId: 'v2_ocf_ebitda', condition: 'end_negative', action: 'zero', description: 'Negative end → score 0' },
  { metricId: 'v2_ocf_ebitda', condition: 'both_negative', action: 'zero', description: 'Both negative → score 0' },
  { metricId: 'v2_ocf_ebitda', condition: 'any_negative', action: 'special_calc', description: 'Any negative → ratio analysis' },
  // Debt/EBITDA (negative debt = excellent)
  { metricId: 'v2_debt_ebitda', condition: 'start_negative', action: 'max_score', description: 'Negative debt → score 100 (net cash)' },
  { metricId: 'v2_debt_ebitda', condition: 'end_negative', action: 'max_score', description: 'Negative debt → score 100 (net cash)' },
  { metricId: 'v2_debt_ebitda', condition: 'both_negative', action: 'max_score', description: 'Negative debt → score 100 (net cash)' },
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
      id: 'v2_revenue_growth', name: 'Revenue Growth (3Y CAGR)', type: 'raw',
      rawMetric: { id: 'v2_revenue_growth', name: 'Revenue Growth', cmots_source: 'ttm', cmots_field: 'RevenueGrowth3Y', unit: 'percent', description: '3-year revenue CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_ebitda_growth', name: 'EBITDA Growth (3Y CAGR)', type: 'raw',
      rawMetric: { id: 'v2_ebitda_growth', name: 'EBITDA Growth', cmots_source: 'ttm', cmots_field: 'EBITDAGrowth3Y', unit: 'percent', description: '3-year EBITDA CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_earnings_growth', name: 'Earnings Growth (3Y CAGR)', type: 'raw',
      rawMetric: { id: 'v2_earnings_growth', name: 'Earnings Growth', cmots_source: 'ttm', cmots_field: 'EarningsGrowth3Y', unit: 'percent', description: '3-year earnings CAGR' },
      scoreBands: growthBands, weight: 1 / 7,
    },
    {
      id: 'v2_roe', name: 'Return on Equity (ROE)', type: 'raw',
      rawMetric: { id: 'v2_roe', name: 'ROE', cmots_source: 'ttm', cmots_field: 'ROE', unit: 'percent', description: 'Return on equity' },
      scoreBands: roeBands, weight: 1 / 7,
    },
    {
      id: 'v2_ocf_ebitda', name: 'OCF/EBITDA', type: 'formula',
      formula: {
        id: 'v2_ocf_ebitda_formula', name: 'OCF/EBITDA',
        inputs: [
          { id: 'ocf', name: 'Operating Cash Flow', cmots_source: 'ttm', cmots_field: 'OCF', unit: 'currency', description: 'Operating cash flow' },
          { id: 'ebitda', name: 'EBITDA', cmots_source: 'ttm', cmots_field: 'EBITDA', unit: 'currency', description: 'EBITDA' },
        ],
        operator: 'divide', description: 'Operating Cash Flow divided by EBITDA',
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
          { id: 'ebitda', name: 'EBITDA', cmots_source: 'ttm', cmots_field: 'EBITDA', unit: 'currency', description: 'EBITDA' },
        ],
        operator: 'divide', description: 'Total Debt divided by EBITDA',
      },
      scoreBands: debtEbitdaBands, weight: 1 / 7,
    },
  ],
  verdictThresholds: [
    { minScore: 80, maxScore: 100, verdict: 'Strong Financials', altVerdict: 'Excellent', color: 'text-success-400', description: 'Robust growth, high profitability, conservative debt' },
    { minScore: 60, maxScore: 79, verdict: 'Good Financials', altVerdict: 'Good', color: 'text-teal-400', description: 'Solid fundamentals with room for improvement' },
    { minScore: 40, maxScore: 59, verdict: 'Average Financials', altVerdict: 'Fair', color: 'text-warning-400', description: 'Mixed signals, selective strengths' },
    { minScore: 20, maxScore: 39, verdict: 'Weak Financials', altVerdict: 'Weak', color: 'text-warning-400', description: 'Concerning trends in key metrics' },
    { minScore: 0, maxScore: 19, verdict: 'Poor Financials', altVerdict: 'Poor', color: 'text-destructive-400', description: 'Significant deterioration across metrics' },
  ],
}

const v2ValuationSegment: ScorecardSegment = {
  id: 'v2_valuation',
  name: 'Valuation Score',
  segmentWeight: 0.6,
  description: 'Valuation relative to 5-year historical averages with conditional weighting',
  metrics: [
    {
      id: 'v2_pe_vs_5y', name: 'PE vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_pe_vs_5y', name: 'PE vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'PE_vs_5YAvg', unit: 'ratio', description: 'Current PE divided by 5-year average PE' },
      scoreBands: valuationVs5YBands, weight: 0.4,
    },
    {
      id: 'v2_pb_vs_5y', name: 'PB vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_pb_vs_5y', name: 'PB vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'PB_vs_5YAvg', unit: 'ratio', description: 'Current PB divided by 5-year average PB' },
      scoreBands: valuationVs5YBands, weight: 0.3,
    },
    {
      id: 'v2_ev_vs_5y', name: 'EV/EBITDA vs 5Y Average', type: 'raw',
      rawMetric: { id: 'v2_ev_vs_5y', name: 'EV/EBITDA vs 5Y Avg', cmots_source: 'ttm', cmots_field: 'EV_EBITDA_vs_5YAvg', unit: 'ratio', description: 'Current EV/EBITDA divided by 5-year average' },
      scoreBands: valuationVs5YBands, weight: 0.3,
    },
  ],
  verdictThresholds: [
    { minScore: 80, maxScore: 100, verdict: 'Significantly Undervalued', altVerdict: 'Excellent', color: 'text-success-400', description: 'Trading well below historical averages' },
    { minScore: 60, maxScore: 79, verdict: 'Moderately Undervalued', altVerdict: 'Good', color: 'text-teal-400', description: 'Attractive entry point' },
    { minScore: 40, maxScore: 59, verdict: 'Fairly Valued', altVerdict: 'Fair', color: 'text-warning-400', description: 'Near historical average' },
    { minScore: 20, maxScore: 39, verdict: 'Moderately Overvalued', altVerdict: 'Weak', color: 'text-warning-400', description: 'Premium pricing, limited upside' },
    { minScore: 0, maxScore: 19, verdict: 'Significantly Overvalued', altVerdict: 'Poor', color: 'text-destructive-400', description: 'Extreme premium' },
  ],
}

const v2TechnicalSegment: ScorecardSegment = {
  id: 'v2_technical',
  name: 'Technical Score',
  segmentWeight: 0.15,
  description: 'Technical indicators: EMA crossovers, RSI, volume-price trend (each scored 0-10)',
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
  verdictThresholds: [
    { minScore: 80, maxScore: 100, verdict: 'Strong Bullish', altVerdict: 'Excellent', color: 'text-success-400', description: 'All indicators aligned positively' },
    { minScore: 60, maxScore: 79, verdict: 'Moderately Bullish', altVerdict: 'Good', color: 'text-teal-400', description: 'Majority positive' },
    { minScore: 40, maxScore: 59, verdict: 'Neutral', altVerdict: 'Fair', color: 'text-warning-400', description: 'Mixed signals' },
    { minScore: 20, maxScore: 39, verdict: 'Moderately Bearish', altVerdict: 'Weak', color: 'text-warning-400', description: 'Majority negative' },
    { minScore: 0, maxScore: 19, verdict: 'Strong Bearish', altVerdict: 'Poor', color: 'text-destructive-400', description: 'All indicators negative' },
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
  { minScore: 80, maxScore: 100, verdict: 'STRONG BUY', altVerdict: 'Excellent', color: 'text-success-400', description: 'Strong across all dimensions' },
  { minScore: 65, maxScore: 79, verdict: 'BUY', altVerdict: 'Good', color: 'text-teal-400', description: 'Favorable risk-reward' },
  { minScore: 50, maxScore: 64, verdict: 'HOLD', altVerdict: 'Fair', color: 'text-warning-400', description: 'Mixed signals, monitor closely' },
  { minScore: 35, maxScore: 49, verdict: 'REVIEW', altVerdict: 'Weak', color: 'text-warning-400', description: 'Concerns outweigh positives' },
  { minScore: 0, maxScore: 34, verdict: 'SELL', altVerdict: 'Poor', color: 'text-destructive-400', description: 'Significant downside risk' },
]

// ─────────────────────────────────────────────────
// V2 Expert Model — Full Scorecard
// ─────────────────────────────────────────────────

export const V2_EXPERT_SCORECARD: ScorecardVersion = {
  id: 'v2-expert-1',
  versionInfo: {
    macroVersion: 'V2',
    microVersion: 1,
    displayVersion: 'V2.1',
    name: 'Expert Scoring Model',
    description: 'SME-created scoring model with 4 segments, conditional valuation logic, and quarterly momentum overlay',
    sourceReference: 'Vishal Rampuria - StockFox SME',
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
