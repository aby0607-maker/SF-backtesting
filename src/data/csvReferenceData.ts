/**
 * CSV Reference Data — SME-scored stock data for pipeline validation & live preview
 *
 * Source: Vishal Rampuria's scoring CSV (Jan 2026)
 * Purpose:
 * 1. Unit test fixture — validates scoring engine against SME's manual scores
 * 2. Live preview data — shows how scorecard tweaks affect known stocks
 *
 * Each stock includes:
 * - rawMetrics: Input values as consumed by the scoring engine
 * - expectedScores: SME's expected segment + overall scores
 * - technicalInputs: Raw technical data (EMA %, RSI, volume/price for VPT)
 *
 * Note: Debt/EBITDA scores in the CSV are internally inconsistent (same value
 * 1.84 → 95 for Adani Power, 75 for Aptus). The code's band-based scoring
 * standardizes this. Expect minor Financial Score deviations (~0.25-2.64 pts).
 */

export interface CSVReferenceStock {
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number
  rawMetrics: Record<string, number | null>
  /** Per-metric expected scores from the CSV (for diagnostics) */
  expectedMetricScores?: Record<string, number | null>
  expectedScores: {
    financial: number | null
    valuation: number | null
    technical: number | null
    /** QM was included in overall composite but not shown separately in CSV */
    quarterlyMomentum?: number | null
    overall: number | null
    verdict: string
  }
  /** Valuation condition that should trigger for this stock */
  expectedValuationCondition?: string
}

/**
 * All 8 stocks from the SME scoring CSV, plus 5 additional stocks
 * with technical-only data (Ambuja, ONGC, Hindalco, ICICI, GAEL).
 */
export const CSV_REFERENCE_STOCKS: CSVReferenceStock[] = [
  // ─────────────────────────────────────────────────
  // BHARTI AIRTEL — PE excluded (hist avg PE 82.75 > 75)
  // ─────────────────────────────────────────────────
  {
    id: 'bharti-airtel',
    name: 'Bharti Airtel',
    symbol: 'BHARTIARTL',
    sector: 'Telecom',
    marketCap: 900000,
    rawMetrics: {
      // Financial inputs
      v2_revenue_growth: 14.5,
      v2_ebitda_growth: 19.8,
      v2_earnings_growth: 45.5,
      v2_roe: 5.64,
      v2_ocf_ebitda: 90,
      v2_gross_block: 2.2,
      v2_debt_ebitda: 1.17,
      // Valuation inputs (ratio: 0.44 = 44% of 5Y avg)
      v2_pe_vs_5y: 0.44,
      v2_pb_vs_5y: 1.41,
      v2_ev_vs_5y: 1.27,
      // Historical averages (for conditional thresholds)
      hist_avg_pe: 82.75,
      hist_avg_pb: 6.58,
      hist_avg_ev: 12.46,
      // Absolute TTM (for display, not scoring)
      abs_pe_ttm: 39.3,
      abs_pb_ttm: 8.24,
      abs_ev_ebitda_ttm: 12.9,
      // Technical inputs
      v2_price_ema20: -0.57,
      v2_price_ema50: -1.22,
      v2_price_ema200: 1.98,
      v2_rsi: 36.3,
      v2_volume_change: 0.33,
      v2_price_change: 0.01,
      v2_vpt: null, // VPT uses conditional scoring, not band lookup
    },
    expectedMetricScores: {
      v2_revenue_growth: 80,
      v2_ebitda_growth: 95,
      v2_earnings_growth: 100,
      v2_roe: 45,
      v2_ocf_ebitda: 100,
      v2_gross_block: 45,
      v2_debt_ebitda: 80,  // CSV manual score (code gives 75)
      v2_pe_vs_5y: 100,
      v2_pb_vs_5y: 65,
      v2_ev_vs_5y: 70,
    },
    expectedScores: {
      financial: 80.5,   // CSV calc (code may differ by ~2.64 due to Debt/EBITDA band)
      valuation: 67,     // PE excluded: PB=60% + EV=40% → 65×0.6 + 70×0.4 = 67
      technical: 42.5,
      quarterlyMomentum: 73.75,  // Back-solved from composite
      overall: 68.05,
      verdict: 'BUY',
    },
    expectedValuationCondition: 'PE > 75 → excluded',
  },

  // ─────────────────────────────────────────────────
  // HUL — EV excluded (hist avg EV/EBITDA 41.44 > 35)
  // ─────────────────────────────────────────────────
  {
    id: 'hul',
    name: 'Hindustan Unilever',
    symbol: 'HINDUNILVR',
    sector: 'FMCG',
    marketCap: 560000,
    rawMetrics: {
      v2_revenue_growth: 7.8,
      v2_ebitda_growth: 7.21,
      v2_earnings_growth: 7.19,
      v2_roe: 19.41,
      v2_ocf_ebitda: 73.14,
      v2_gross_block: 1.79,
      v2_debt_ebitda: 0,
      v2_pe_vs_5y: 0.913,
      v2_pb_vs_5y: 1.066,
      v2_ev_vs_5y: 0.89,
      hist_avg_pe: 57.3,
      hist_avg_pb: 10.98,
      hist_avg_ev: 41.44,
      abs_pe_ttm: 52,
      abs_pb_ttm: 11.08,
      abs_ev_ebitda_ttm: 35,
      v2_price_ema20: 1.48,
      v2_price_ema50: 1.90,
      v2_price_ema200: 3.20,
      v2_rsi: 54.9,
      v2_volume_change: 0.59,
      v2_price_change: 5.91,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 60,
      v2_ebitda_growth: 60,
      v2_earnings_growth: 60,
      v2_roe: 85,
      v2_ocf_ebitda: 100,
      v2_gross_block: 45,
      v2_debt_ebitda: 80,  // CSV manual (code gives 100 for 0 debt)
      v2_pe_vs_5y: 85,
      v2_pb_vs_5y: 80,
      v2_ev_vs_5y: 85,
    },
    expectedScores: {
      financial: 70.25,
      valuation: 82,  // EV excluded: PB=60% + PE=40% → 80×0.6 + 85×0.4 = 82
      technical: 63,
      quarterlyMomentum: 76.15,
      overall: 75.04,
      verdict: 'BUY',
    },
    expectedValuationCondition: 'EV > 35 → excluded',
  },

  // ─────────────────────────────────────────────────
  // SUZLON — EV excluded (hist avg EV/EBITDA 44 > 35)
  // ─────────────────────────────────────────────────
  {
    id: 'suzlon',
    name: 'Suzlon Energy',
    symbol: 'SUZLON',
    sector: 'Renewable Energy',
    marketCap: 55000,
    rawMetrics: {
      v2_revenue_growth: 35.5,
      v2_ebitda_growth: 41.12,
      v2_earnings_growth: 110.4,
      v2_roe: 41,
      v2_ocf_ebitda: 58.6,
      v2_gross_block: 8.21,
      v2_debt_ebitda: 0,
      v2_pe_vs_5y: 0.722,
      v2_pb_vs_5y: 1.439,
      v2_ev_vs_5y: 0.693,
      hist_avg_pe: 32.29,
      hist_avg_pb: 6.49,
      hist_avg_ev: 44,
      abs_pe_ttm: 22.2,
      abs_pb_ttm: 11.62,
      abs_ev_ebitda_ttm: 26.6,
      v2_price_ema20: -3.70,
      v2_price_ema50: -9.87,
      v2_price_ema200: -18.39,
      v2_rsi: 45.41,
      v2_volume_change: 1.12,
      v2_price_change: -7,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 100,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 100,
      v2_roe: 100,
      v2_ocf_ebitda: 100,
      v2_gross_block: 70,
      v2_debt_ebitda: 95,  // CSV manual (code gives 100 for 0 debt)
      v2_pe_vs_5y: 90,
      v2_pb_vs_5y: 65,
      v2_ev_vs_5y: 100,
    },
    expectedScores: {
      financial: 96.5,
      valuation: 75,  // EV excluded: PB=60% + PE=40% → 65×0.6 + 90×0.4 = 75
      technical: 8,
      quarterlyMomentum: 85.8,
      overall: 72.48,
      verdict: 'BUY',
    },
    expectedValuationCondition: 'EV > 35 → excluded',
  },

  // ─────────────────────────────────────────────────
  // ADANI POWER — Default weights (all valid)
  // ─────────────────────────────────────────────────
  {
    id: 'adani-power',
    name: 'Adani Power',
    symbol: 'ADANIPOWER',
    sector: 'Power',
    marketCap: 180000,
    rawMetrics: {
      v2_revenue_growth: 17.23,
      v2_ebitda_growth: 33.04,
      v2_earnings_growth: 218.45,
      v2_roe: 20.4,
      v2_ocf_ebitda: 100.38,
      v2_gross_block: 11.17,
      v2_debt_ebitda: 1.84,
      v2_pe_vs_5y: 1.687,
      v2_pb_vs_5y: 1.578,
      v2_ev_vs_5y: 1.09,
      hist_avg_pe: 14.46,
      hist_avg_pb: 3.41,
      hist_avg_ev: 14.2,
      abs_pe_ttm: 23,
      abs_pb_ttm: 4.8,
      abs_ev_ebitda_ttm: 13.4,
      v2_price_ema20: 0.82,
      v2_price_ema50: 0.87,
      v2_price_ema200: -4.65,
      v2_rsi: 30,
      v2_volume_change: 0.81,
      v2_price_change: 2,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 95,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 100,
      v2_roe: 95,
      v2_ocf_ebitda: 100,
      v2_gross_block: 80,
      v2_debt_ebitda: 95,  // CSV manual (code gives 75)
      v2_pe_vs_5y: 50,    // CSV 50 (code now gives 50 after fix)
      v2_pb_vs_5y: 60,
      v2_ev_vs_5y: 80,
    },
    expectedScores: {
      financial: 96,
      valuation: 61,  // Default: PE=30% + PB=50% + EV=20% → 50×0.3+60×0.5+80×0.2 = 61
      technical: 26.5,
      quarterlyMomentum: 82.3,
      overall: 68.08,
      verdict: 'BUY',
    },
    expectedValuationCondition: 'Default PB-anchored',
  },

  // ─────────────────────────────────────────────────
  // APTUS — Default weights (all valid)
  // ─────────────────────────────────────────────────
  {
    id: 'aptus',
    name: 'Aptus Value Housing',
    symbol: 'APTUS',
    sector: 'NBFC',
    marketCap: 18000,
    rawMetrics: {
      v2_revenue_growth: 28.92,
      v2_ebitda_growth: 29.46,
      v2_earnings_growth: 33.55,
      v2_roe: 17.6,
      v2_ocf_ebitda: -95,
      v2_gross_block: 0.88,
      v2_debt_ebitda: 1.84,
      v2_pe_vs_5y: 0.752,
      v2_pb_vs_5y: 0.997,
      v2_ev_vs_5y: 0.786,
      hist_avg_pe: 22.91,
      hist_avg_pb: 3.39,
      hist_avg_ev: 13.93,
      abs_pe_ttm: 16.7,
      abs_pb_ttm: 3.27,
      abs_ev_ebitda_ttm: 12.1,
      v2_price_ema20: -3.75,
      v2_price_ema50: -7.71,
      v2_price_ema200: -14.11,
      v2_rsi: 38.6,
      v2_volume_change: 0.68,
      v2_price_change: -4.51,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 100,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 100,
      v2_roe: 85,
      v2_ocf_ebitda: 10,
      v2_gross_block: 45,
      v2_debt_ebitda: 75,
      v2_pe_vs_5y: 90,
      v2_pb_vs_5y: 80,
      v2_ev_vs_5y: 90,
    },
    expectedScores: {
      financial: 76.25,
      valuation: 85,  // Default: 90×0.3 + 80×0.5 + 90×0.2 = 27+40+18 = 85
      technical: 2,
      quarterlyMomentum: 73.4,
      overall: 69.49,
      verdict: 'BUY',
    },
    expectedValuationCondition: 'Default PB-anchored',
  },

  // ─────────────────────────────────────────────────
  // SPICEJET — Valuation not meaningful (all neg)
  // ─────────────────────────────────────────────────
  {
    id: 'spicejet',
    name: 'SpiceJet',
    symbol: 'SPICEJET',
    sector: 'Aviation',
    marketCap: 5000,
    rawMetrics: {
      v2_revenue_growth: -8,
      v2_ebitda_growth: 512,      // Likely turnaround from negative
      v2_earnings_growth: 12,
      v2_roe: -40,
      v2_ocf_ebitda: -64,
      v2_gross_block: -17.6,
      v2_debt_ebitda: -162,
      v2_pe_vs_5y: -0.10,        // Negative PE → excluded
      v2_pb_vs_5y: -0.10,        // Negative PB → excluded
      v2_ev_vs_5y: 0.26,
      hist_avg_pe: null,
      hist_avg_pb: null,
      hist_avg_ev: 26.14,
      abs_pe_ttm: null,
      abs_pb_ttm: -2.26,
      abs_ev_ebitda_ttm: 22.9,
      v2_price_ema20: -12.40,
      v2_price_ema50: -22.31,
      v2_price_ema200: -36.89,
      v2_rsi: 28.47,
      v2_volume_change: 0.76,
      v2_price_change: -11.64,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 20,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 80,
      v2_roe: 10,
      v2_ocf_ebitda: 10,
      v2_gross_block: 20,
      v2_debt_ebitda: 75,   // CSV manual
      v2_pe_vs_5y: null,    // Excluded
      v2_pb_vs_5y: null,    // Excluded
      v2_ev_vs_5y: 100,
    },
    expectedScores: {
      financial: 46.5,
      valuation: null,      // "Valuation not meaningful"
      technical: -5,        // Extreme bearish (negative score possible)
      overall: null,        // "Score not applicable"
      verdict: 'Verdict Not Applicable',
    },
    expectedValuationCondition: 'Valuation not meaningful',
  },

  // ─────────────────────────────────────────────────
  // BILLION BRAINS — Valuation not meaningful (no PE/PB)
  // ─────────────────────────────────────────────────
  {
    id: 'billion-brains',
    name: 'Billion Brains Surgiscience',
    symbol: 'BILLBRAINS',
    sector: 'Healthcare',
    marketCap: 1000,
    rawMetrics: {
      v2_revenue_growth: 119,
      v2_ebitda_growth: 2530,
      v2_earnings_growth: 1824,
      v2_roe: 50,
      v2_ocf_ebitda: -38,
      v2_gross_block: 1.52,
      v2_debt_ebitda: 0.15,
      v2_pe_vs_5y: null,       // Not available
      v2_pb_vs_5y: null,       // Not available
      v2_ev_vs_5y: null,
      hist_avg_pe: 53.67,
      hist_avg_pb: 14.6,
      hist_avg_ev: 8.7,
      abs_pe_ttm: 49.8,
      abs_pb_ttm: 19.22,
      abs_ev_ebitda_ttm: 35.2,
      v2_price_ema20: 3.76,
      v2_price_ema50: 3.43,
      v2_price_ema200: 2.00,
      v2_rsi: 56.1,
      v2_volume_change: 0.89,
      v2_price_change: 4.66,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 100,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 100,
      v2_roe: 100,
      v2_ocf_ebitda: 10,
      v2_gross_block: 45,
      v2_debt_ebitda: 100,
      v2_pe_vs_5y: null,     // NA
      v2_pb_vs_5y: null,     // NA
      v2_ev_vs_5y: null,     // NA
    },
    expectedScores: {
      financial: 81,
      valuation: null,       // "Valuation not meaningful"
      technical: 65,
      overall: null,         // "Score not applicable"
      verdict: 'Verdict Not Applicable',
    },
    expectedValuationCondition: 'Valuation not meaningful',
  },

  // ─────────────────────────────────────────────────
  // ZOMATO — EV excluded (hist avg EV/EBITDA 40.82 > 35)
  // ─────────────────────────────────────────────────
  {
    id: 'zomato',
    name: 'Zomato (Eternal)',
    symbol: 'ZOMATO',
    sector: 'Food Tech',
    marketCap: 220000,
    rawMetrics: {
      v2_revenue_growth: 69,
      v2_ebitda_growth: 648,
      v2_earnings_growth: 527,
      v2_roe: 2.08,
      v2_ocf_ebitda: 20.4,
      v2_gross_block: 47.9,
      v2_debt_ebitda: 3.15,
      v2_pe_vs_5y: 0.0497,
      v2_pb_vs_5y: 0.0183,
      v2_ev_vs_5y: 0.26,
      hist_avg_pe: 58.94,
      hist_avg_pb: 4.94,
      hist_avg_ev: 40.82,
      abs_pe_ttm: 1502,
      abs_pb_ttm: 8.78,
      abs_ev_ebitda_ttm: 149,
      v2_price_ema20: -2.40,
      v2_price_ema50: -7.51,
      v2_price_ema200: -4.81,
      v2_rsi: 45.6,
      v2_volume_change: 4.6,
      v2_price_change: -1.08,
      v2_vpt: null,
    },
    expectedMetricScores: {
      v2_revenue_growth: 100,
      v2_ebitda_growth: 100,
      v2_earnings_growth: 100,
      v2_roe: 35,
      v2_ocf_ebitda: 25,
      v2_gross_block: 100,
      v2_debt_ebitda: 95,   // CSV manual (code gives ~60)
      v2_pe_vs_5y: 100,
      v2_pb_vs_5y: 100,
      v2_ev_vs_5y: 100,
    },
    expectedScores: {
      financial: 78.5,
      valuation: 100,  // EV excluded: PB=60% + PE=40% → 100×0.6 + 100×0.4 = 100
      technical: 18.5,
      quarterlyMomentum: 84.5,
      overall: 80.25,
      verdict: 'STRONG BUY',
    },
    expectedValuationCondition: 'EV > 35 → excluded',
  },
]

/**
 * Quick-access map for looking up a reference stock by ID.
 */
export function getReferenceStock(id: string): CSVReferenceStock | undefined {
  return CSV_REFERENCE_STOCKS.find(s => s.id === id)
}

/**
 * Get stocks that have complete scoring data (exclude SpiceJet/BillionBrains where overall is NA).
 */
export function getScoredReferenceStocks(): CSVReferenceStock[] {
  return CSV_REFERENCE_STOCKS.filter(s => s.expectedScores.overall != null)
}
