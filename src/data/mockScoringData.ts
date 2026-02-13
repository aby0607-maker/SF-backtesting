/**
 * Mock Scoring Data — Realistic data for 20 large-cap Indian stocks
 *
 * Includes:
 * - Raw metric values for V2 Expert Model
 * - Company master (sector, market cap)
 * - Quarterly data for Revenue/EBITDA Multipliers
 * - Negative value test cases
 * - 2-year mock OHLCV for demo stocks
 */

// ─────────────────────────────────────────────────
// Company Master
// ─────────────────────────────────────────────────

export interface MockCompany {
  id: string
  name: string
  symbol: string
  sector: string
  marketCap: number  // In crores
}

export const MOCK_COMPANIES: MockCompany[] = [
  { id: 'RELIANCE', name: 'Reliance Industries', symbol: 'RELIANCE', sector: 'Oil & Gas', marketCap: 1750000 },
  { id: 'TCS', name: 'Tata Consultancy Services', symbol: 'TCS', sector: 'IT Services', marketCap: 1550000 },
  { id: 'HDFCBANK', name: 'HDFC Bank', symbol: 'HDFCBANK', sector: 'Banking', marketCap: 1280000 },
  { id: 'INFY', name: 'Infosys', symbol: 'INFY', sector: 'IT Services', marketCap: 720000 },
  { id: 'ICICIBANK', name: 'ICICI Bank', symbol: 'ICICIBANK', sector: 'Banking', marketCap: 890000 },
  { id: 'HINDUNILVR', name: 'Hindustan Unilever', symbol: 'HINDUNILVR', sector: 'FMCG', marketCap: 590000 },
  { id: 'SBIN', name: 'State Bank of India', symbol: 'SBIN', sector: 'Banking', marketCap: 680000 },
  { id: 'BHARTIARTL', name: 'Bharti Airtel', symbol: 'BHARTIARTL', sector: 'Telecom', marketCap: 950000 },
  { id: 'ITC', name: 'ITC Limited', symbol: 'ITC', sector: 'FMCG', marketCap: 580000 },
  { id: 'KOTAKBANK', name: 'Kotak Mahindra Bank', symbol: 'KOTAKBANK', sector: 'Banking', marketCap: 420000 },
  { id: 'LT', name: 'Larsen & Toubro', symbol: 'LT', sector: 'Capital Goods', marketCap: 510000 },
  { id: 'AXISBANK', name: 'Axis Bank', symbol: 'AXISBANK', sector: 'Banking', marketCap: 332000 },
  { id: 'WIPRO', name: 'Wipro', symbol: 'WIPRO', sector: 'IT Services', marketCap: 280000 },
  { id: 'SUNPHARMA', name: 'Sun Pharmaceutical', symbol: 'SUNPHARMA', sector: 'Pharma', marketCap: 380000 },
  { id: 'MARUTI', name: 'Maruti Suzuki', symbol: 'MARUTI', sector: 'Automobiles', marketCap: 410000 },
  { id: 'TATAMOTORS', name: 'Tata Motors', symbol: 'TATAMOTORS', sector: 'Automobiles', marketCap: 270000 },
  { id: 'HCLTECH', name: 'HCL Technologies', symbol: 'HCLTECH', sector: 'IT Services', marketCap: 420000 },
  { id: 'BAJFINANCE', name: 'Bajaj Finance', symbol: 'BAJFINANCE', sector: 'NBFC', marketCap: 480000 },
  { id: 'TITAN', name: 'Titan Company', symbol: 'TITAN', sector: 'Consumer Discretionary', marketCap: 310000 },
  { id: 'ZOMATO', name: 'Eternal (Zomato)', symbol: 'ZOMATO', sector: 'Food Tech', marketCap: 235000 },
]

// ─────────────────────────────────────────────────
// V2 Metric Values (per stock)
// ─────────────────────────────────────────────────

export interface MockStockMetrics {
  stockId: string
  // Financial metrics
  v2_revenue_growth: number | null
  v2_ebitda_growth: number | null
  v2_earnings_growth: number | null
  v2_roe: number | null
  v2_ocf_ebitda: number | null
  v2_gross_block: number | null
  v2_debt_ebitda: number | null
  // Valuation metrics (ratio vs 5Y avg)
  v2_pe_vs_5y: number | null
  v2_pb_vs_5y: number | null
  v2_ev_vs_5y: number | null
  // Raw valuation values (for conditional logic)
  raw_pe: number | null
  raw_pb: number | null
  raw_ev: number | null
  // Technical metrics (raw values)
  v2_price_ema20: number | null  // Deviation %
  v2_price_ema50: number | null
  v2_price_ema200: number | null
  v2_rsi: number | null
  v2_vpt: number | null
  // Quarterly Momentum
  v2_revenue_multiplier: number | null
  v2_ebitda_multiplier: number | null
  // Context for negative handling
  startYearRevenue?: number
  endYearRevenue?: number
  startYearEbitda?: number
  endYearEbitda?: number
}

export const MOCK_STOCK_METRICS: MockStockMetrics[] = [
  {
    stockId: 'RELIANCE',
    v2_revenue_growth: 12.5, v2_ebitda_growth: 15.2, v2_earnings_growth: 18.3,
    v2_roe: 12.8, v2_ocf_ebitda: 0.72, v2_gross_block: 18.5, v2_debt_ebitda: 1.8,
    v2_pe_vs_5y: 0.92, v2_pb_vs_5y: 1.05, v2_ev_vs_5y: 0.88,
    raw_pe: 28, raw_pb: 2.4, raw_ev: 14.5,
    v2_price_ema20: 2.1, v2_price_ema50: 4.5, v2_price_ema200: 12.3, v2_rsi: 58, v2_vpt: 15,
    v2_revenue_multiplier: 1.12, v2_ebitda_multiplier: 1.18,
  },
  {
    stockId: 'TCS',
    v2_revenue_growth: 10.2, v2_ebitda_growth: 9.8, v2_earnings_growth: 11.5,
    v2_roe: 42.5, v2_ocf_ebitda: 0.95, v2_gross_block: 8.2, v2_debt_ebitda: 0.1,
    v2_pe_vs_5y: 1.15, v2_pb_vs_5y: 1.08, v2_ev_vs_5y: 1.12,
    raw_pe: 32, raw_pb: 14, raw_ev: 22,
    v2_price_ema20: -1.2, v2_price_ema50: 1.8, v2_price_ema200: 8.5, v2_rsi: 52, v2_vpt: 8,
    v2_revenue_multiplier: 1.08, v2_ebitda_multiplier: 1.05,
  },
  {
    stockId: 'HDFCBANK',
    v2_revenue_growth: 18.5, v2_ebitda_growth: 20.1, v2_earnings_growth: 22.3,
    v2_roe: 16.8, v2_ocf_ebitda: 0.85, v2_gross_block: 12.0, v2_debt_ebitda: 0.3,
    v2_pe_vs_5y: 0.85, v2_pb_vs_5y: 0.78, v2_ev_vs_5y: 0.82,
    raw_pe: 20, raw_pb: 3.2, raw_ev: 12,
    v2_price_ema20: 3.5, v2_price_ema50: 6.2, v2_price_ema200: 15.8, v2_rsi: 62, v2_vpt: 22,
    v2_revenue_multiplier: 1.22, v2_ebitda_multiplier: 1.25,
  },
  {
    stockId: 'INFY',
    v2_revenue_growth: 8.5, v2_ebitda_growth: 7.2, v2_earnings_growth: 9.1,
    v2_roe: 32.0, v2_ocf_ebitda: 0.88, v2_gross_block: 6.5, v2_debt_ebitda: 0.05,
    v2_pe_vs_5y: 0.95, v2_pb_vs_5y: 1.02, v2_ev_vs_5y: 0.98,
    raw_pe: 26, raw_pb: 8.5, raw_ev: 18,
    v2_price_ema20: -0.5, v2_price_ema50: 2.1, v2_price_ema200: 5.8, v2_rsi: 48, v2_vpt: 5,
    v2_revenue_multiplier: 1.06, v2_ebitda_multiplier: 1.03,
  },
  {
    stockId: 'ICICIBANK',
    v2_revenue_growth: 22.1, v2_ebitda_growth: 25.3, v2_earnings_growth: 28.5,
    v2_roe: 17.5, v2_ocf_ebitda: 0.78, v2_gross_block: 15.2, v2_debt_ebitda: 0.4,
    v2_pe_vs_5y: 0.75, v2_pb_vs_5y: 0.72, v2_ev_vs_5y: 0.70,
    raw_pe: 18, raw_pb: 3.0, raw_ev: 10,
    v2_price_ema20: 4.2, v2_price_ema50: 7.8, v2_price_ema200: 22.5, v2_rsi: 65, v2_vpt: 28,
    v2_revenue_multiplier: 1.28, v2_ebitda_multiplier: 1.32,
  },
  {
    stockId: 'HINDUNILVR',
    v2_revenue_growth: 6.2, v2_ebitda_growth: 5.8, v2_earnings_growth: 6.5,
    v2_roe: 28.0, v2_ocf_ebitda: 0.92, v2_gross_block: 5.0, v2_debt_ebitda: 0.2,
    v2_pe_vs_5y: 1.35, v2_pb_vs_5y: 1.28, v2_ev_vs_5y: 1.30,
    raw_pe: 65, raw_pb: 12, raw_ev: 45,
    v2_price_ema20: -2.8, v2_price_ema50: -1.5, v2_price_ema200: 2.1, v2_rsi: 42, v2_vpt: -5,
    v2_revenue_multiplier: 1.04, v2_ebitda_multiplier: 1.02,
  },
  {
    stockId: 'SBIN',
    v2_revenue_growth: 15.8, v2_ebitda_growth: 18.5, v2_earnings_growth: 20.1,
    v2_roe: 14.2, v2_ocf_ebitda: 0.65, v2_gross_block: 10.5, v2_debt_ebitda: 0.8,
    v2_pe_vs_5y: 0.80, v2_pb_vs_5y: 0.85, v2_ev_vs_5y: 0.78,
    raw_pe: 12, raw_pb: 1.8, raw_ev: 8,
    v2_price_ema20: 1.5, v2_price_ema50: 3.8, v2_price_ema200: 18.2, v2_rsi: 55, v2_vpt: 18,
    v2_revenue_multiplier: 1.18, v2_ebitda_multiplier: 1.22,
  },
  {
    stockId: 'BHARTIARTL',
    v2_revenue_growth: 20.5, v2_ebitda_growth: 22.8, v2_earnings_growth: 35.2,
    v2_roe: 15.5, v2_ocf_ebitda: 0.82, v2_gross_block: 25.0, v2_debt_ebitda: 2.5,
    v2_pe_vs_5y: 0.70, v2_pb_vs_5y: 0.68, v2_ev_vs_5y: 0.65,
    raw_pe: 35, raw_pb: 8.5, raw_ev: 12,
    v2_price_ema20: 5.2, v2_price_ema50: 8.5, v2_price_ema200: 25.0, v2_rsi: 68, v2_vpt: 32,
    v2_revenue_multiplier: 1.25, v2_ebitda_multiplier: 1.30,
  },
  {
    stockId: 'ITC',
    v2_revenue_growth: 5.5, v2_ebitda_growth: 7.2, v2_earnings_growth: 8.0,
    v2_roe: 25.5, v2_ocf_ebitda: 0.90, v2_gross_block: 4.5, v2_debt_ebitda: 0.0,
    v2_pe_vs_5y: 1.10, v2_pb_vs_5y: 1.15, v2_ev_vs_5y: 1.05,
    raw_pe: 28, raw_pb: 7.5, raw_ev: 16,
    v2_price_ema20: 0.8, v2_price_ema50: 2.5, v2_price_ema200: 8.0, v2_rsi: 50, v2_vpt: 10,
    v2_revenue_multiplier: 1.05, v2_ebitda_multiplier: 1.08,
  },
  {
    stockId: 'KOTAKBANK',
    v2_revenue_growth: 14.2, v2_ebitda_growth: 16.5, v2_earnings_growth: 15.8,
    v2_roe: 13.5, v2_ocf_ebitda: 0.70, v2_gross_block: 8.0, v2_debt_ebitda: 0.5,
    v2_pe_vs_5y: 0.90, v2_pb_vs_5y: 0.88, v2_ev_vs_5y: 0.85,
    raw_pe: 22, raw_pb: 3.5, raw_ev: 14,
    v2_price_ema20: 2.0, v2_price_ema50: 4.0, v2_price_ema200: 10.5, v2_rsi: 56, v2_vpt: 12,
    v2_revenue_multiplier: 1.15, v2_ebitda_multiplier: 1.18,
  },
  {
    stockId: 'LT',
    v2_revenue_growth: 16.8, v2_ebitda_growth: 14.5, v2_earnings_growth: 18.2,
    v2_roe: 15.0, v2_ocf_ebitda: 0.55, v2_gross_block: 20.0, v2_debt_ebitda: 1.5,
    v2_pe_vs_5y: 0.95, v2_pb_vs_5y: 0.92, v2_ev_vs_5y: 0.90,
    raw_pe: 32, raw_pb: 5.5, raw_ev: 18,
    v2_price_ema20: 1.8, v2_price_ema50: 5.2, v2_price_ema200: 14.0, v2_rsi: 54, v2_vpt: 14,
    v2_revenue_multiplier: 1.20, v2_ebitda_multiplier: 1.15,
  },
  {
    stockId: 'AXISBANK',
    v2_revenue_growth: 19.5, v2_ebitda_growth: 21.0, v2_earnings_growth: 24.5,
    v2_roe: 15.8, v2_ocf_ebitda: 0.75, v2_gross_block: 11.0, v2_debt_ebitda: 0.6,
    v2_pe_vs_5y: 0.78, v2_pb_vs_5y: 0.75, v2_ev_vs_5y: 0.72,
    raw_pe: 15, raw_pb: 2.2, raw_ev: 9,
    v2_price_ema20: 3.0, v2_price_ema50: 5.5, v2_price_ema200: 16.5, v2_rsi: 60, v2_vpt: 20,
    v2_revenue_multiplier: 1.22, v2_ebitda_multiplier: 1.25,
  },
  {
    stockId: 'WIPRO',
    v2_revenue_growth: 3.2, v2_ebitda_growth: 2.5, v2_earnings_growth: 4.0,
    v2_roe: 18.5, v2_ocf_ebitda: 0.85, v2_gross_block: 5.5, v2_debt_ebitda: 0.3,
    v2_pe_vs_5y: 1.05, v2_pb_vs_5y: 1.10, v2_ev_vs_5y: 1.08,
    raw_pe: 22, raw_pb: 4.0, raw_ev: 14,
    v2_price_ema20: -1.8, v2_price_ema50: -0.5, v2_price_ema200: 3.0, v2_rsi: 45, v2_vpt: 2,
    v2_revenue_multiplier: 1.02, v2_ebitda_multiplier: 0.98,
  },
  {
    stockId: 'SUNPHARMA',
    v2_revenue_growth: 14.0, v2_ebitda_growth: 18.0, v2_earnings_growth: 22.0,
    v2_roe: 16.0, v2_ocf_ebitda: 0.80, v2_gross_block: 12.0, v2_debt_ebitda: 0.8,
    v2_pe_vs_5y: 0.82, v2_pb_vs_5y: 0.80, v2_ev_vs_5y: 0.78,
    raw_pe: 30, raw_pb: 4.8, raw_ev: 18,
    v2_price_ema20: 2.5, v2_price_ema50: 5.0, v2_price_ema200: 15.0, v2_rsi: 58, v2_vpt: 16,
    v2_revenue_multiplier: 1.15, v2_ebitda_multiplier: 1.20,
  },
  {
    stockId: 'MARUTI',
    v2_revenue_growth: 15.5, v2_ebitda_growth: 20.0, v2_earnings_growth: 25.0,
    v2_roe: 14.5, v2_ocf_ebitda: 0.68, v2_gross_block: 15.0, v2_debt_ebitda: 0.0,
    v2_pe_vs_5y: 0.88, v2_pb_vs_5y: 0.85, v2_ev_vs_5y: 0.82,
    raw_pe: 28, raw_pb: 4.2, raw_ev: 16,
    v2_price_ema20: 3.2, v2_price_ema50: 6.0, v2_price_ema200: 18.0, v2_rsi: 60, v2_vpt: 20,
    v2_revenue_multiplier: 1.18, v2_ebitda_multiplier: 1.25,
  },
  // Negative test cases
  {
    stockId: 'TATAMOTORS',
    v2_revenue_growth: 8.0, v2_ebitda_growth: -5.2, v2_earnings_growth: -12.0,
    v2_roe: -3.5, v2_ocf_ebitda: -0.15, v2_gross_block: 22.0, v2_debt_ebitda: 4.5,
    v2_pe_vs_5y: 0.65, v2_pb_vs_5y: 0.55, v2_ev_vs_5y: 0.60,
    raw_pe: 45, raw_pb: 2.8, raw_ev: 12,
    v2_price_ema20: -3.5, v2_price_ema50: -5.0, v2_price_ema200: -2.0, v2_rsi: 38, v2_vpt: -8,
    v2_revenue_multiplier: 0.92, v2_ebitda_multiplier: 0.78,
    startYearEbitda: -1200, endYearEbitda: 800,
  },
  {
    stockId: 'HCLTECH',
    v2_revenue_growth: 9.8, v2_ebitda_growth: 8.5, v2_earnings_growth: 10.2,
    v2_roe: 24.5, v2_ocf_ebitda: 0.88, v2_gross_block: 7.0, v2_debt_ebitda: 0.2,
    v2_pe_vs_5y: 0.98, v2_pb_vs_5y: 1.05, v2_ev_vs_5y: 1.00,
    raw_pe: 24, raw_pb: 6.0, raw_ev: 16,
    v2_price_ema20: 0.5, v2_price_ema50: 2.8, v2_price_ema200: 9.5, v2_rsi: 52, v2_vpt: 8,
    v2_revenue_multiplier: 1.08, v2_ebitda_multiplier: 1.06,
  },
  {
    stockId: 'BAJFINANCE',
    v2_revenue_growth: 25.0, v2_ebitda_growth: 28.0, v2_earnings_growth: 30.0,
    v2_roe: 22.0, v2_ocf_ebitda: 0.60, v2_gross_block: 8.0, v2_debt_ebitda: 3.2,
    v2_pe_vs_5y: 0.72, v2_pb_vs_5y: 0.68, v2_ev_vs_5y: 0.70,
    raw_pe: 35, raw_pb: 7.5, raw_ev: 20,
    v2_price_ema20: 4.5, v2_price_ema50: 8.0, v2_price_ema200: 25.0, v2_rsi: 66, v2_vpt: 30,
    v2_revenue_multiplier: 1.30, v2_ebitda_multiplier: 1.35,
  },
  {
    stockId: 'TITAN',
    v2_revenue_growth: 22.0, v2_ebitda_growth: 18.0, v2_earnings_growth: 20.0,
    v2_roe: 28.5, v2_ocf_ebitda: 0.55, v2_gross_block: 18.0, v2_debt_ebitda: 0.5,
    v2_pe_vs_5y: 1.20, v2_pb_vs_5y: 1.15, v2_ev_vs_5y: 1.18,
    raw_pe: 72, raw_pb: 18, raw_ev: 48,
    v2_price_ema20: 1.0, v2_price_ema50: 3.5, v2_price_ema200: 12.0, v2_rsi: 55, v2_vpt: 12,
    v2_revenue_multiplier: 1.20, v2_ebitda_multiplier: 1.15,
  },
  // Negative test: ZOMATO with negative EBITDA history
  {
    stockId: 'ZOMATO',
    v2_revenue_growth: 45.0, v2_ebitda_growth: null, v2_earnings_growth: null,
    v2_roe: -8.5, v2_ocf_ebitda: null, v2_gross_block: 30.0, v2_debt_ebitda: -0.5,
    v2_pe_vs_5y: null, v2_pb_vs_5y: 0.55, v2_ev_vs_5y: null,
    raw_pe: null, raw_pb: 8.0, raw_ev: null,
    v2_price_ema20: 6.0, v2_price_ema50: 10.0, v2_price_ema200: 35.0, v2_rsi: 72, v2_vpt: 40,
    v2_revenue_multiplier: 1.50, v2_ebitda_multiplier: null,
    startYearEbitda: -500, endYearEbitda: -200,
  },
]

// ─────────────────────────────────────────────────
// Mock OHLCV Data (2-year for 3 demo stocks)
// ─────────────────────────────────────────────────

function generateMockOHLCV(
  basePrice: number,
  annualReturn: number,
  volatility: number,
  days: number = 650  // ~2.6 years of trading days (covers through mid-2026)
): { date: string; price: number }[] {
  const data: { date: string; price: number }[] = []
  let price = basePrice
  const dailyReturn = annualReturn / 252
  const dailyVol = volatility / Math.sqrt(252)

  const startDate = new Date('2024-01-02')

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + Math.floor(i * 1.4))  // Skip weekends roughly

    // Simple random walk with drift
    const randomReturn = dailyReturn + dailyVol * (Math.random() * 2 - 1)
    price *= (1 + randomReturn)
    price = Math.round(price * 100) / 100

    data.push({
      date: date.toISOString().split('T')[0],
      price,
    })
  }

  return data
}

export const MOCK_OHLCV: Record<string, { date: string; price: number }[]> = {
  RELIANCE: generateMockOHLCV(2500, 0.15, 0.25),
  TCS: generateMockOHLCV(3800, 0.10, 0.20),
  HDFCBANK: generateMockOHLCV(1600, 0.18, 0.22),
  INFY: generateMockOHLCV(1500, 0.08, 0.22),
  ICICIBANK: generateMockOHLCV(1000, 0.22, 0.25),
  HINDUNILVR: generateMockOHLCV(2500, 0.05, 0.18),
  SBIN: generateMockOHLCV(600, 0.20, 0.28),
  BHARTIARTL: generateMockOHLCV(1200, 0.25, 0.22),
  ITC: generateMockOHLCV(460, 0.08, 0.18),
  KOTAKBANK: generateMockOHLCV(1800, 0.12, 0.20),
  LT: generateMockOHLCV(3500, 0.15, 0.22),
  AXISBANK: generateMockOHLCV(1080, 0.20, 0.25),
  WIPRO: generateMockOHLCV(480, 0.05, 0.22),
  SUNPHARMA: generateMockOHLCV(1500, 0.18, 0.22),
  MARUTI: generateMockOHLCV(11000, 0.15, 0.20),
  TATAMOTORS: generateMockOHLCV(700, 0.10, 0.35),
  HCLTECH: generateMockOHLCV(1600, 0.12, 0.20),
  BAJFINANCE: generateMockOHLCV(7000, 0.22, 0.28),
  TITAN: generateMockOHLCV(3200, 0.18, 0.22),
  ZOMATO: generateMockOHLCV(265, 0.30, 0.40),
}

// ─────────────────────────────────────────────────
// Helper: Convert MockStockMetrics to scoring engine format
// ─────────────────────────────────────────────────

/**
 * Convert mock data to the format expected by scoreStock().
 */
export function getStockDataForScoring(stockId: string): {
  data: Record<string, number | null>
  info: { id: string; name: string; symbol: string; sector: string; marketCap: number }
  context?: Record<string, { startValue?: number; endValue?: number }>
} | null {
  const metrics = MOCK_STOCK_METRICS.find(m => m.stockId === stockId)
  const company = MOCK_COMPANIES.find(c => c.id === stockId)
  if (!metrics || !company) return null

  const data: Record<string, number | null> = {
    v2_revenue_growth: metrics.v2_revenue_growth,
    v2_ebitda_growth: metrics.v2_ebitda_growth,
    v2_earnings_growth: metrics.v2_earnings_growth,
    v2_roe: metrics.v2_roe,
    v2_ocf_ebitda: metrics.v2_ocf_ebitda,
    v2_gross_block: metrics.v2_gross_block,
    v2_debt_ebitda: metrics.v2_debt_ebitda,
    v2_pe_vs_5y: metrics.v2_pe_vs_5y,
    v2_pb_vs_5y: metrics.v2_pb_vs_5y,
    v2_ev_vs_5y: metrics.v2_ev_vs_5y,
    v2_price_ema20: metrics.v2_price_ema20,
    v2_price_ema50: metrics.v2_price_ema50,
    v2_price_ema200: metrics.v2_price_ema200,
    v2_rsi: metrics.v2_rsi,
    v2_vpt: metrics.v2_vpt,
    v2_revenue_multiplier: metrics.v2_revenue_multiplier,
    v2_ebitda_multiplier: metrics.v2_ebitda_multiplier,
  }

  const context: Record<string, { startValue?: number; endValue?: number }> = {}
  if (metrics.startYearEbitda != null || metrics.endYearEbitda != null) {
    context.v2_ebitda_growth = {
      startValue: metrics.startYearEbitda,
      endValue: metrics.endYearEbitda,
    }
  }

  return {
    data,
    info: { id: company.id, name: company.name, symbol: company.symbol, sector: company.sector, marketCap: company.marketCap },
    context: Object.keys(context).length > 0 ? context : undefined,
  }
}

/**
 * Get all stocks formatted for the scoring engine.
 */
export function getAllStocksForScoring() {
  return MOCK_COMPANIES
    .map(c => getStockDataForScoring(c.id))
    .filter((s): s is NonNullable<typeof s> => s !== null)
}
