/**
 * CMOTS Metric Catalog — Complete list of available metrics
 *
 * Used by the MetricCatalogBrowser (Stage 1) to let users browse,
 * search, and select metrics for their scorecard.
 *
 * Organized by category matching the 11 analysis segments.
 */

import type { MetricCatalogEntry } from '@/types/scoring'

export const METRIC_CATALOG: MetricCatalogEntry[] = [
  // ─── Profitability ───
  { id: 'roe', name: 'Return on Equity (ROE)', description: 'Net income as percentage of shareholder equity', cmots_source: 'ttm', cmots_field: 'ROE', unit: 'percent', category: 'Profitability', typicalRange: [-10, 50], higherIsBetter: true },
  { id: 'roa', name: 'Return on Assets (ROA)', description: 'Net income as percentage of total assets', cmots_source: 'ttm', cmots_field: 'ROA', unit: 'percent', category: 'Profitability', typicalRange: [0, 25], higherIsBetter: true },
  { id: 'roce', name: 'Return on Capital Employed', description: 'EBIT as percentage of capital employed', cmots_source: 'ttm', cmots_field: 'ROCE', unit: 'percent', category: 'Profitability', typicalRange: [0, 40], higherIsBetter: true },
  { id: 'net_margin', name: 'Net Profit Margin', description: 'Net income as percentage of revenue', cmots_source: 'ttm', cmots_field: 'NetMargin', unit: 'percent', category: 'Profitability', typicalRange: [-20, 40], higherIsBetter: true },
  { id: 'operating_margin', name: 'Operating Margin', description: 'Operating income as percentage of revenue', cmots_source: 'ttm', cmots_field: 'OperatingMargin', unit: 'percent', category: 'Profitability', typicalRange: [-10, 50], higherIsBetter: true },
  { id: 'ebitda_margin', name: 'EBITDA Margin', description: 'EBITDA as percentage of revenue', cmots_source: 'ttm', cmots_field: 'EBITDAMargin', unit: 'percent', category: 'Profitability', typicalRange: [0, 60], higherIsBetter: true },
  { id: 'gross_margin', name: 'Gross Profit Margin', description: 'Gross profit as percentage of revenue', cmots_source: 'ttm', cmots_field: 'GrossMargin', unit: 'percent', category: 'Profitability', typicalRange: [10, 80], higherIsBetter: true },

  // ─── Financial Ratios ───
  { id: 'current_ratio', name: 'Current Ratio', description: 'Current assets divided by current liabilities', cmots_source: 'balance_sheet', cmots_field: 'CurrentRatio', unit: 'ratio', category: 'Financial Ratios', typicalRange: [0.5, 5], higherIsBetter: true },
  { id: 'quick_ratio', name: 'Quick Ratio', description: 'Liquid assets divided by current liabilities', cmots_source: 'balance_sheet', cmots_field: 'QuickRatio', unit: 'ratio', category: 'Financial Ratios', typicalRange: [0.3, 3], higherIsBetter: true },
  { id: 'debt_equity', name: 'Debt to Equity', description: 'Total debt divided by shareholder equity', cmots_source: 'balance_sheet', cmots_field: 'DebtEquity', unit: 'ratio', category: 'Financial Ratios', typicalRange: [0, 5] },
  { id: 'interest_coverage', name: 'Interest Coverage', description: 'EBIT divided by interest expense', cmots_source: 'ttm', cmots_field: 'InterestCoverage', unit: 'times', category: 'Financial Ratios', typicalRange: [0, 50], higherIsBetter: true },
  { id: 'debt_ebitda', name: 'Debt/EBITDA', description: 'Total debt divided by EBITDA', cmots_source: 'ttm', cmots_field: 'DebtEBITDA', unit: 'times', category: 'Financial Ratios', typicalRange: [0, 10] },

  // ─── Growth ───
  { id: 'revenue_growth_1y', name: 'Revenue Growth (1Y)', description: 'Year-over-year revenue growth', cmots_source: 'ttm', cmots_field: 'RevenueGrowth1Y', unit: 'percent', category: 'Growth', typicalRange: [-20, 50], higherIsBetter: true },
  { id: 'revenue_growth_3y', name: 'Revenue Growth (3Y CAGR)', description: '3-year compound annual revenue growth', cmots_source: 'ttm', cmots_field: 'RevenueGrowth3Y', unit: 'percent', category: 'Growth', typicalRange: [-10, 40], higherIsBetter: true },
  { id: 'ebitda_growth_3y', name: 'EBITDA Growth (3Y CAGR)', description: '3-year compound annual EBITDA growth', cmots_source: 'ttm', cmots_field: 'EBITDAGrowth3Y', unit: 'percent', category: 'Growth', typicalRange: [-15, 50], higherIsBetter: true },
  { id: 'earnings_growth_3y', name: 'Earnings Growth (3Y CAGR)', description: '3-year compound annual earnings growth', cmots_source: 'ttm', cmots_field: 'EarningsGrowth3Y', unit: 'percent', category: 'Growth', typicalRange: [-20, 60], higherIsBetter: true },
  { id: 'eps_growth', name: 'EPS Growth', description: 'Earnings per share year-over-year growth', cmots_source: 'ttm', cmots_field: 'EPSGrowth', unit: 'percent', category: 'Growth', typicalRange: [-30, 80], higherIsBetter: true },
  { id: 'book_value_growth', name: 'Book Value Growth', description: 'Book value per share growth', cmots_source: 'balance_sheet', cmots_field: 'BookValueGrowth', unit: 'percent', category: 'Growth', typicalRange: [-5, 30], higherIsBetter: true },

  // ─── Valuation ───
  { id: 'pe_ratio', name: 'PE Ratio', description: 'Price to earnings ratio', cmots_source: 'ttm', cmots_field: 'PE', unit: 'ratio', category: 'Valuation', typicalRange: [5, 100] },
  { id: 'pb_ratio', name: 'PB Ratio', description: 'Price to book value ratio', cmots_source: 'ttm', cmots_field: 'PB', unit: 'ratio', category: 'Valuation', typicalRange: [0.5, 30] },
  { id: 'ev_ebitda', name: 'EV/EBITDA', description: 'Enterprise value divided by EBITDA', cmots_source: 'ttm', cmots_field: 'EV_EBITDA', unit: 'ratio', category: 'Valuation', typicalRange: [3, 50] },
  { id: 'peg_ratio', name: 'PEG Ratio', description: 'PE ratio divided by earnings growth rate', cmots_source: 'ttm', cmots_field: 'PEG', unit: 'ratio', category: 'Valuation', typicalRange: [0.2, 5] },
  { id: 'dividend_yield', name: 'Dividend Yield', description: 'Annual dividend per share divided by price', cmots_source: 'ttm', cmots_field: 'DividendYield', unit: 'percent', category: 'Valuation', typicalRange: [0, 8], higherIsBetter: true },
  { id: 'pe_vs_5y', name: 'PE vs 5Y Average', description: 'Current PE divided by 5-year average PE', cmots_source: 'ttm', cmots_field: 'PE_vs_5YAvg', unit: 'ratio', category: 'Valuation', typicalRange: [0.3, 3] },
  { id: 'pb_vs_5y', name: 'PB vs 5Y Average', description: 'Current PB divided by 5-year average PB', cmots_source: 'ttm', cmots_field: 'PB_vs_5YAvg', unit: 'ratio', category: 'Valuation', typicalRange: [0.3, 3] },
  { id: 'ev_vs_5y', name: 'EV/EBITDA vs 5Y Average', description: 'Current EV/EBITDA divided by 5-year average', cmots_source: 'ttm', cmots_field: 'EV_EBITDA_vs_5YAvg', unit: 'ratio', category: 'Valuation', typicalRange: [0.3, 3] },

  // ─── Technical ───
  { id: 'rsi_14', name: 'RSI (14)', description: 'Relative Strength Index over 14 periods', cmots_source: 'ohlcv', cmots_field: 'RSI14', unit: 'number', category: 'Technical', typicalRange: [0, 100] },
  { id: 'price_vs_ema20', name: 'Price vs 20D EMA', description: 'Price deviation from 20-day exponential moving average', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA20', unit: 'percent', category: 'Technical', typicalRange: [-20, 20] },
  { id: 'price_vs_ema50', name: 'Price vs 50D EMA', description: 'Price deviation from 50-day exponential moving average', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA50', unit: 'percent', category: 'Technical', typicalRange: [-30, 30] },
  { id: 'price_vs_ema200', name: 'Price vs 200D EMA', description: 'Price deviation from 200-day exponential moving average', cmots_source: 'ohlcv', cmots_field: 'PriceVsEMA200', unit: 'percent', category: 'Technical', typicalRange: [-50, 50] },
  { id: 'vpt', name: 'Volume-Price Trend', description: 'Volume-weighted price momentum indicator', cmots_source: 'ohlcv', cmots_field: 'VPT', unit: 'number', category: 'Technical', typicalRange: [-100, 100] },

  // ─── Ownership ───
  { id: 'promoter_holding', name: 'Promoter Holding', description: 'Percentage of shares held by promoters', cmots_source: 'shareholding', cmots_field: 'PromoterHolding', unit: 'percent', category: 'Ownership', typicalRange: [0, 85], higherIsBetter: true },
  { id: 'fii_holding', name: 'FII Holding', description: 'Percentage held by Foreign Institutional Investors', cmots_source: 'shareholding', cmots_field: 'FIIHolding', unit: 'percent', category: 'Ownership', typicalRange: [0, 50] },
  { id: 'dii_holding', name: 'DII Holding', description: 'Percentage held by Domestic Institutional Investors', cmots_source: 'shareholding', cmots_field: 'DIIHolding', unit: 'percent', category: 'Ownership', typicalRange: [0, 50] },
  { id: 'promoter_pledge', name: 'Promoter Pledge', description: 'Percentage of promoter shares pledged', cmots_source: 'shareholding', cmots_field: 'PromoterPledge', unit: 'percent', category: 'Ownership', typicalRange: [0, 100] },

  // ─── Cash Flow ───
  { id: 'ocf', name: 'Operating Cash Flow', description: 'Cash generated from operations', cmots_source: 'ttm', cmots_field: 'OCF', unit: 'currency', category: 'Cash Flow', typicalRange: [-10000, 100000], higherIsBetter: true },
  { id: 'fcf', name: 'Free Cash Flow', description: 'Operating cash flow minus capital expenditures', cmots_source: 'ttm', cmots_field: 'FCF', unit: 'currency', category: 'Cash Flow', typicalRange: [-10000, 80000], higherIsBetter: true },
  { id: 'ocf_ebitda', name: 'OCF/EBITDA', description: 'Operating cash flow as ratio of EBITDA', cmots_source: 'ttm', cmots_field: 'OCF_EBITDA', unit: 'ratio', category: 'Cash Flow', typicalRange: [-1, 2], higherIsBetter: true },
  { id: 'capex', name: 'Capital Expenditure', description: 'Investment in property, plant, and equipment', cmots_source: 'ttm', cmots_field: 'CapEx', unit: 'currency', category: 'Cash Flow', typicalRange: [0, 50000] },

  // ─── Income Statement ───
  { id: 'revenue', name: 'Total Revenue', description: 'Total income from selling goods/services', cmots_source: 'ttm', cmots_field: 'Revenue', unit: 'currency', category: 'Income Statement', typicalRange: [100, 500000] },
  { id: 'ebitda', name: 'EBITDA', description: 'Earnings before interest, taxes, depreciation, amortization', cmots_source: 'ttm', cmots_field: 'EBITDA', unit: 'currency', category: 'Income Statement', typicalRange: [-5000, 200000] },
  { id: 'net_income', name: 'Net Income', description: 'Final profit after all expenses', cmots_source: 'ttm', cmots_field: 'NetIncome', unit: 'currency', category: 'Income Statement', typicalRange: [-10000, 150000] },
  { id: 'eps', name: 'Earnings Per Share', description: 'Net income divided by shares outstanding', cmots_source: 'ttm', cmots_field: 'EPS', unit: 'currency', category: 'Income Statement', typicalRange: [-50, 500], higherIsBetter: true },

  // ─── Balance Sheet ───
  { id: 'total_assets', name: 'Total Assets', description: 'Sum of all company assets', cmots_source: 'balance_sheet', cmots_field: 'TotalAssets', unit: 'currency', category: 'Balance Sheet', typicalRange: [100, 10000000] },
  { id: 'total_debt', name: 'Total Debt', description: 'Short-term plus long-term debt', cmots_source: 'balance_sheet', cmots_field: 'TotalDebt', unit: 'currency', category: 'Balance Sheet', typicalRange: [0, 500000] },
  { id: 'book_value', name: 'Book Value Per Share', description: 'Net asset value per share', cmots_source: 'balance_sheet', cmots_field: 'BookValue', unit: 'currency', category: 'Balance Sheet', typicalRange: [10, 5000], higherIsBetter: true },
  { id: 'gross_block_growth', name: 'Gross Block Growth', description: 'Growth in fixed assets (PP&E investment)', cmots_source: 'balance_sheet', cmots_field: 'GrossBlockGrowth', unit: 'percent', category: 'Balance Sheet', typicalRange: [-5, 40], higherIsBetter: true },

  // ─── Quarterly Momentum ───
  { id: 'revenue_multiplier', name: 'Revenue Multiplier', description: 'Current Q revenue / Same Q last year revenue', cmots_source: 'quarterly', cmots_field: 'RevenueMultiplier', unit: 'times', category: 'Quarterly Momentum', typicalRange: [0.5, 2.5], higherIsBetter: true },
  { id: 'ebitda_multiplier', name: 'EBITDA Multiplier', description: 'Current Q EBITDA / Same Q last year EBITDA', cmots_source: 'quarterly', cmots_field: 'EBITDAMultiplier', unit: 'times', category: 'Quarterly Momentum', typicalRange: [0.3, 3], higherIsBetter: true },
]

/** Get all unique categories in the catalog */
export function getCategories(): string[] {
  return [...new Set(METRIC_CATALOG.map(m => m.category))]
}

/** Get metrics by category */
export function getMetricsByCategory(category: string): MetricCatalogEntry[] {
  return METRIC_CATALOG.filter(m => m.category === category)
}

/** Search metrics by name or description */
export function searchMetrics(query: string): MetricCatalogEntry[] {
  const q = query.toLowerCase()
  return METRIC_CATALOG.filter(
    m => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)
  )
}
