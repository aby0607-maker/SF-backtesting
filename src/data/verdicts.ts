import type { StockVerdict, Citation } from '@/types'

// Helper to create citations with proper structure per tech spec
const createCitation = (
  source: string,
  document: string,
  date: string,
  page?: string,
  exactQuote?: string,
  section?: string
): Citation => ({
  source,
  document,
  page,
  date,
  section: section || 'Financial Statements',
  exactQuote: exactQuote || `Data sourced from ${document}`,
  url: `https://www.bseindia.com/stock-share-price/${source.toLowerCase().replace(/\s+/g, '-')}/`,
})

// 9 Stock × Profile verdict combinations with FULL metrics
export const verdicts: StockVerdict[] = [
  // ==================== ZOMATO × ANKIT (Growth) ====================
  {
    stockId: 'zomato',
    profileId: 'ankit',
    overallScore: 8.2,
    sectorAvgScore: 6.1,
    sectorRank: 1,
    sectorTotal: 6,
    verdict: 'STRONG BUY',
    verdictColor: 'green',
    summary: "Exceptional growth story with improving profitability. Best pure-play on India's food economy digitization.",
    peerRank: 1,
    peerTotal: 6,
    peerGroup: 'New Economy',
    peerRanking: {
      rank: 1,
      category: 'New Economy / Food Tech',
      total: 6,
      above: [],
      below: ['Swiggy', 'BigBasket', 'Jubilant FoodWorks', 'Devyani International', 'Westlife Foodworld'],
      commentary: 'Top-ranked in food tech on growth metrics, despite premium valuation',
    },
    topSignals: [
      {
        title: 'Revenue Growth 70%+ YoY',
        description: "Blinkit's quick commerce driving hypergrowth",
        metric: 'Revenue CAGR',
        value: '70%',
        benchmark: 'Sector avg 25%',
        isPositive: true,
        whyMatters: 'Key for growth investors - demonstrates market expansion and demand strength',
        scoreContribution: '+1.8',
      },
      {
        title: 'Path to Profitability Clear',
        description: 'First profitable quarter achieved (Q2 FY25)',
        metric: 'Net Margin',
        value: '2.1%',
        benchmark: 'Previous: -8%',
        isPositive: true,
        whyMatters: 'Proves unit economics work at scale - path to sustained profitability visible',
        scoreContribution: '+1.2',
      },
      {
        title: 'Market Share Dominance',
        description: '#1 in food delivery (55%+ share), #1 in quick commerce',
        isPositive: true,
        whyMatters: 'Network effects create moat - harder for competitors to displace',
        scoreContribution: '+0.8',
      },
    ],
    topConcerns: [
      { title: 'Premium Valuation', description: 'P/S ratio of 12x vs sector avg 6x', isPositive: false, whyMatters: 'High expectations baked into price - limited margin for error' },
      { title: 'Competitive Intensity', description: 'Swiggy, Amazon, BigBasket competing aggressively', isPositive: false, whyMatters: 'May need to sustain high marketing spend, compressing margins' },
    ],
    verdictRationale: "For your growth-focused thesis, Eternal represents the best pure-play on India's food economy digitization. Revenue growth of 70%+ significantly exceeds your 20% threshold.",
    positionSizing: {
      recommendedAllocation: '8-10%',
      reasoning: 'Your moderate risk tolerance accepts this volatility (35% historical). Current portfolio: 0% in Food Tech - good diversification add.',
      maxAllocation: '12%',
      warning: 'Do not exceed 15% given still-thin margins',
      entryStrategy: 'Start with 5%, add remaining on 10%+ dips',
    },
    entryGuidance: 'Stock 12% below 52W high. Consider SIP - 50% now, 50% on 10% correction.',
    entryTiming: {
      currentPrice: '₹265',
      fairValueRange: '₹240 - ₹300',
      suggestion: 'Current price in fair value zone. Moderate entry appropriate.',
      positionInRange: '55th percentile',
      assessment: 'MODERATE ENTRY',
    },
    exitTriggers: [
      { id: 'et-1', metric: 'P/S Ratio', condition: '>', threshold: '15x', currentValue: '12x', status: 'safe', rationale: 'Growth premium becoming excessive' },
      { id: 'et-2', metric: 'Revenue Growth', condition: '<', threshold: '30%', currentValue: '70%', status: 'safe', rationale: 'Growth thesis broken if slowing significantly' },
      { id: 'et-3', metric: 'Market Share', condition: '<', threshold: '45%', currentValue: '55%', status: 'safe', rationale: 'Competitive moat weakening' },
      { id: 'et-4', metric: 'FII Holding', condition: '<', threshold: '40%', currentValue: '52%', status: 'safe', rationale: 'Smart money exodus signal' },
    ],
    portfolioFit: {
      thesisFit: true,
      riskFit: true,
      diversificationFit: true,
      suggestionText: 'Good fit: Matches growth thesis, adds Food Tech exposure (0% currently), acceptable volatility for your risk profile.',
    },
    segments: [
      {
        id: 'profitability', name: 'Profitability', score: 6.5, scoreBand: 'yellow', sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.10, status: 'neutral',
        interpretation: 'Recently turned profitable; margins improving', quickInsight: 'First profitable quarter in Q2 FY25',
        summaryByProfile: {
          growth: 'Profitability improving rapidly - key milestone for growth validation',
          value: 'Thin margins not suitable for value investing yet',
          beginner: 'Company just started making money - good sign!',
        },
        metrics: [
          { id: 'roe', name: 'Return on Equity', value: 3.2, displayValue: '3.2%', unit: '%', sectorAvg: -5.1, sectorAvgDisplay: '-5.1%', comparison: 'above', percentile: 72, status: 'good', trend: 'improving', trend5Y: [-45, -32, -18, -5, 3.2], tooltipSimple: 'How much profit the company makes from shareholder money', tooltipAdvanced: 'ROE of 3.2% shows first positive returns after years of losses. For growth stocks, trajectory matters more than absolute value.', citation: createCitation('Eternal Ltd', 'Annual Report FY24', '2024-04-15', '45', 'Return on Equity improved to 3.2% from -5.1% in FY23, reflecting operational leverage gains.', 'Standalone Financial Results') },
          { id: 'npm', name: 'Net Profit Margin', value: 2.1, displayValue: '2.1%', unit: '%', sectorAvg: -8.5, sectorAvgDisplay: '-8.5%', comparison: 'above', percentile: 85, status: 'good', trend: 'improving', trend5Y: [-25, -18, -12, -3, 2.1], tooltipSimple: 'Profit kept from each ₹100 of revenue', tooltipAdvanced: 'Net Margin of 2.1% is the first positive reading in company history. Food delivery contribution margins now positive.', citation: createCitation('Eternal Ltd', 'Q3 Results FY25', '2025-01-14', '12', 'Net Profit Margin of 2.1% achieved through improved take rates and reduced delivery costs.', 'Management Discussion') },
          { id: 'roce', name: 'Return on Capital', value: 4.8, displayValue: '4.8%', unit: '%', sectorAvg: -2.3, sectorAvgDisplay: '-2.3%', comparison: 'above', percentile: 78, status: 'good', trend: 'improving', trend5Y: [-38, -22, -8, 2, 4.8], tooltipSimple: 'How efficiently the company uses all its capital', tooltipAdvanced: 'ROCE of 4.8% demonstrates improving capital efficiency. Should exceed 10% within 2-3 years if current trajectory holds.', citation: createCitation('Eternal Ltd', 'Annual Report FY24', '2024-04-15', '52', 'Capital employed efficiency improved with ROCE turning positive at 4.8%.', 'Financial Highlights') },
          { id: 'opm', name: 'Operating Margin', value: 5.2, displayValue: '5.2%', unit: '%', sectorAvg: -4.2, sectorAvgDisplay: '-4.2%', comparison: 'above', percentile: 82, status: 'good', trend: 'improving', trend5Y: [-20, -15, -8, 1, 5.2], tooltipSimple: 'Profit from core business operations', tooltipAdvanced: 'Operating Margin of 5.2% shows food delivery unit economics have turned positive. Blinkit still at lower margins but improving.', citation: createCitation('Eternal Ltd', 'Investor Presentation Q3 FY25', '2025-01-14', '18', 'Adjusted EBITDA margin improved to 5.2% driven by food delivery and going-out segments.', 'Segment Performance') },
        ],
      },
      {
        id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.08, status: 'positive',
        interpretation: 'Zero debt, ₹12,000 Cr cash; fortress balance sheet', quickInsight: 'Cash-rich with zero debt',
        metrics: [
          { id: 'de', name: 'Debt to Equity', value: 0, displayValue: '0.0x', sectorAvg: 0.8, sectorAvgDisplay: '0.8x', comparison: 'above', percentile: 100, status: 'excellent', trend: 'stable', trend5Y: [0.1, 0.05, 0.02, 0, 0], tooltipSimple: 'How much the company owes vs owns' },
          { id: 'current', name: 'Current Ratio', value: 4.2, displayValue: '4.2x', sectorAvg: 1.8, sectorAvgDisplay: '1.8x', comparison: 'above', percentile: 95, status: 'excellent', trend: 'stable', trend5Y: [3.5, 3.8, 4.0, 4.1, 4.2], tooltipSimple: 'Ability to pay short-term bills' },
          { id: 'cash', name: 'Cash & Equivalents', value: 12000, displayValue: '₹12,000 Cr', sectorAvg: 2500, sectorAvgDisplay: '₹2,500 Cr', comparison: 'above', percentile: 98, status: 'excellent', trend: 'improving', trend5Y: [8000, 9500, 10200, 11000, 12000], tooltipSimple: 'Cash available for growth or emergencies' },
        ],
      },
      {
        id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.20, status: 'positive',
        interpretation: '70%+ revenue growth; exceptional for your thesis', quickInsight: 'Blinkit driving 70%+ growth',
        metrics: [
          { id: 'rev_growth', name: 'Revenue Growth (YoY)', value: 70, displayValue: '70%', unit: '%', sectorAvg: 25, sectorAvgDisplay: '25%', comparison: 'above', percentile: 98, status: 'excellent', trend: 'improving', trend5Y: [45, 52, 58, 65, 70], tooltipSimple: 'How fast sales are growing year over year' },
          { id: 'rev_cagr', name: 'Revenue CAGR (5Y)', value: 58, displayValue: '58%', unit: '%', sectorAvg: 22, sectorAvgDisplay: '22%', comparison: 'above', percentile: 95, status: 'excellent', trend: 'stable', tooltipSimple: 'Average annual growth rate over 5 years' },
          { id: 'gov_growth', name: 'GOV Growth (QoQ)', value: 25, displayValue: '25%', unit: '%', sectorAvg: 12, sectorAvgDisplay: '12%', comparison: 'above', percentile: 90, status: 'excellent', trend: 'improving', trend5Y: [18, 20, 22, 24, 25], tooltipSimple: 'Gross Order Value - total value of all orders' },
        ],
      },
      {
        id: 'valuation', name: 'Valuation', score: 5.0, sectorAvg: 6.5, sectorRank: 5, sectorTotal: 6, weight: 0.10, status: 'negative',
        interpretation: 'P/S 12x is premium; priced for perfection', quickInsight: 'Expensive but growth justifies premium',
        metrics: [
          { id: 'ps', name: 'Price to Sales', value: 12, displayValue: '12x', sectorAvg: 6, sectorAvgDisplay: '6x', comparison: 'below', percentile: 15, status: 'poor', trend: 'improving', trend5Y: [25, 20, 16, 14, 12], tooltipSimple: 'Price paid per rupee of sales (lower is cheaper)' },
          { id: 'pe', name: 'Price to Earnings', value: 180, displayValue: '180x', sectorAvg: 45, sectorAvgDisplay: '45x', comparison: 'below', percentile: 10, status: 'poor', trend: 'improving', trend5Y: [0, 0, 0, 0, 180], tooltipSimple: 'Years of earnings to pay back investment' },
        ],
      },
      {
        id: 'price', name: 'Price & Volume', score: 7.8, sectorAvg: 6.0, sectorRank: 2, sectorTotal: 6, weight: 0.08, status: 'positive',
        interpretation: '115% return in 12 months; strong momentum', quickInsight: 'Strong price momentum',
        metrics: [
          { id: 'ret_1y', name: '1-Year Return', value: 115, displayValue: '+115%', unit: '%', sectorAvg: 45, sectorAvgDisplay: '+45%', comparison: 'above', percentile: 92, status: 'excellent', trend: 'improving', trend5Y: [25, 45, 60, 85, 115], tooltipSimple: 'Stock price change in last 12 months' },
          { id: 'from_52h', name: 'From 52W High', value: -12, displayValue: '-12%', unit: '%', sectorAvg: -18, sectorAvgDisplay: '-18%', comparison: 'above', percentile: 65, status: 'good', tooltipSimple: 'Distance from highest price in year' },
        ],
      },
      {
        id: 'technical', name: 'Technical', score: 7.5, sectorAvg: 5.5, sectorRank: 2, sectorTotal: 6, weight: 0.08, status: 'positive',
        interpretation: 'Above all moving averages; bullish setup', quickInsight: 'Bullish technical indicators',
        metrics: [
          { id: 'rsi', name: 'RSI (14-day)', value: 62, displayValue: '62', sectorAvg: 52, sectorAvgDisplay: '52', comparison: 'above', percentile: 72, status: 'good', tooltipSimple: 'Momentum indicator (30-70 is neutral)' },
          { id: 'beta', name: 'Beta', value: 1.8, displayValue: '1.8', sectorAvg: 1.2, sectorAvgDisplay: '1.2', comparison: 'below', percentile: 25, status: 'fair', tooltipSimple: 'Stock volatility vs market (1 = same as market)' },
        ],
      },
      {
        id: 'broker', name: 'Broker Ratings', score: 8.0, sectorAvg: 6.5, sectorRank: 1, sectorTotal: 6, weight: 0.06, status: 'positive',
        interpretation: '75% Buy ratings; avg target ₹310', quickInsight: 'Analysts bullish with ₹310 target',
        metrics: [
          { id: 'buy_pct', name: '% Buy Ratings', value: 75, displayValue: '75%', unit: '%', sectorAvg: 55, sectorAvgDisplay: '55%', comparison: 'above', percentile: 85, status: 'excellent', tooltipSimple: 'Analysts recommending buy' },
          { id: 'upside', name: 'Target Upside', value: 16, displayValue: '+16%', unit: '%', sectorAvg: 12, sectorAvgDisplay: '+12%', comparison: 'above', percentile: 75, status: 'good', tooltipSimple: 'Expected gain based on targets' },
        ],
      },
      {
        id: 'ownership', name: 'Ownership', score: 7.5, sectorAvg: 6.0, sectorRank: 2, sectorTotal: 6, weight: 0.08, status: 'positive',
        interpretation: 'FIIs increasing stake; smart money accumulating', quickInsight: 'Institutional buying continues',
        metrics: [
          { id: 'fii', name: 'FII Holding', value: 52, displayValue: '52%', unit: '%', sectorAvg: 35, sectorAvgDisplay: '35%', comparison: 'above', percentile: 88, status: 'excellent', trend: 'improving', trend5Y: [38, 42, 45, 48, 52], tooltipSimple: 'Foreign institutional investor ownership' },
          { id: 'dii', name: 'DII Holding', value: 18, displayValue: '18%', unit: '%', sectorAvg: 15, sectorAvgDisplay: '15%', comparison: 'above', percentile: 65, status: 'good', trend: 'improving', trend5Y: [12, 14, 15, 17, 18], tooltipSimple: 'Domestic institutional investor ownership' },
        ],
      },
      {
        id: 'fno', name: 'F&O Activity', score: 6.8, scoreBand: 'yellow', sectorAvg: 5.5, sectorRank: 2, sectorTotal: 6, weight: 0.05, status: 'neutral',
        interpretation: 'Moderate OI buildup; neutral sentiment', quickInsight: 'Balanced F&O positioning',
        summaryByProfile: {
          growth: 'F&O data shows institutional interest - positive for liquidity',
          value: 'Not a primary factor for value investing',
          beginner: 'This is advanced trading data - you can skip for now',
        },
        metrics: [
          { id: 'oi_change', name: 'Open Interest Change', value: 8.5, displayValue: '+8.5%', unit: '%', sectorAvg: 5.2, sectorAvgDisplay: '+5.2%', comparison: 'above', percentile: 68, status: 'good', trend: 'improving', tooltipSimple: 'Shows how many new futures/options contracts are being opened', tooltipAdvanced: 'Rising OI with rising price indicates fresh long positions being built - bullish signal.', citation: createCitation('NSE', 'F&O Data', '2025-01-14', undefined, 'Open Interest in ZOMATO futures increased by 8.5% in the last trading session.', 'Derivatives Market') },
          { id: 'pcr', name: 'Put-Call Ratio', value: 0.85, displayValue: '0.85', sectorAvg: 1.1, sectorAvgDisplay: '1.1', comparison: 'above', percentile: 72, status: 'good', trend: 'stable', tooltipSimple: 'Ratio of put options to call options - lower means more bullish bets', tooltipAdvanced: 'PCR of 0.85 indicates more call buying than put buying, suggesting bullish sentiment among options traders.', citation: createCitation('NSE', 'Options Chain Data', '2025-01-14', undefined, 'Put-Call ratio for ZOMATO stands at 0.85, below neutral level of 1.0.', 'Options Market') },
          { id: 'max_pain', name: 'Max Pain', value: 260, displayValue: '₹260', sectorAvg: 0, sectorAvgDisplay: 'N/A', comparison: 'inline', percentile: 50, status: 'fair', trend: 'stable', tooltipSimple: 'Price where options writers have least losses - often acts as magnet', tooltipAdvanced: 'Max Pain at ₹260 vs CMP of ₹265 suggests stock is slightly above the level where most options expire worthless.', citation: createCitation('NSE', 'Options Expiry Analysis', '2025-01-14', undefined, 'Maximum Pain point for monthly expiry calculated at ₹260.', 'Derivatives Analytics') },
        ],
      },
      {
        id: 'income', name: 'Income Statement', score: 8.0, sectorAvg: 5.5, sectorRank: 1, sectorTotal: 6, weight: 0.08, status: 'positive',
        interpretation: 'Revenue scaling; operating leverage kicking in', quickInsight: 'Revenue and profits both growing',
        metrics: [
          { id: 'revenue', name: 'Revenue (TTM)', value: 14500, displayValue: '₹14,500 Cr', sectorAvg: 5500, sectorAvgDisplay: '₹5,500 Cr', comparison: 'above', percentile: 92, status: 'excellent', trend: 'improving', trend5Y: [4500, 6800, 9200, 11800, 14500], tooltipSimple: 'Total sales in last 12 months' },
          { id: 'pat', name: 'Net Profit (TTM)', value: 305, displayValue: '₹305 Cr', sectorAvg: -450, sectorAvgDisplay: '-₹450 Cr', comparison: 'above', percentile: 95, status: 'excellent', trend: 'improving', trend5Y: [-1200, -800, -400, -50, 305], tooltipSimple: 'Final profit after all expenses and taxes' },
        ],
      },
      {
        id: 'balance', name: 'Balance Sheet', score: 8.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.09, status: 'positive',
        interpretation: 'Cash-rich, debt-free; financial strength', quickInsight: '₹12,000 Cr cash, zero debt',
        metrics: [
          { id: 'total_assets', name: 'Total Assets', value: 22000, displayValue: '₹22,000 Cr', sectorAvg: 8500, sectorAvgDisplay: '₹8,500 Cr', comparison: 'above', percentile: 92, status: 'excellent', trend: 'improving', trend5Y: [12000, 15000, 17500, 20000, 22000], tooltipSimple: 'Total value of everything the company owns' },
          { id: 'fcf', name: 'Free Cash Flow', value: 850, displayValue: '₹850 Cr', sectorAvg: -200, sectorAvgDisplay: '-₹200 Cr', comparison: 'above', percentile: 90, status: 'excellent', trend: 'improving', trend5Y: [-600, -300, 100, 500, 850], tooltipSimple: 'Cash left after all spending' },
        ],
      },
    ],
    redFlags: [{ id: 'rf1', type: 'valuation', category: 'quality', title: 'Premium Valuation', description: 'P/S ratio 12x vs sector avg 6x. Priced for perfection.', severity: 'medium', action: 'Monitor for any execution miss', isTriggered: true, currentValue: '12x', threshold: '<6x' }],
  },

  // ==================== ZOMATO × SNEHA (Value) ====================
  {
    stockId: 'zomato', profileId: 'sneha', overallScore: 4.8, sectorAvgScore: 6.1, sectorRank: 5, sectorTotal: 6, verdict: 'AVOID', peerRank: 5, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [
      { title: 'Turned Profitable', description: 'Finally showing positive PAT', isPositive: true },
      { title: 'Cash Rich', description: '₹12,000 Cr cash; no debt', isPositive: true },
    ],
    topConcerns: [
      { title: 'No Margin of Safety', description: 'P/S 12x, P/E 180x; price assumes perfection', isPositive: false },
      { title: 'No Dividend', description: 'Zero shareholder returns', isPositive: false },
    ],
    verdictRationale: "For your value-focused thesis requiring margin of safety, this stock fails. P/E 180x, P/S 12x offers no safety cushion.",
    positionSizing: '0% - Does not meet value criteria', entryGuidance: 'Consider only below P/S 5x (₹120 level).',
    riskWarning: 'High valuation risk - any miss will cause sharp correction',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 4.5, sectorAvg: 4.2, sectorRank: 3, sectorTotal: 6, weight: 0.15, status: 'negative', interpretation: 'Barely profitable; margins too thin', quickInsight: 'Thin margins, unproven sustainability', metrics: [{ id: 'roe', name: 'Return on Equity', value: 3.2, displayValue: '3.2%', unit: '%', sectorAvg: -5.1, sectorAvgDisplay: '-5.1%', comparison: 'above', percentile: 72, status: 'fair', trend: 'improving', trend5Y: [-45, -32, -18, -5, 3.2], tooltipSimple: 'Profit on shareholder investment - very low', tooltipAdvanced: 'ROE of 3.2% is below FD rates. For value investing, seek >15%.' }] },
      { id: 'valuation', name: 'Valuation', score: 2.0, sectorAvg: 6.5, sectorRank: 6, sectorTotal: 6, weight: 0.20, status: 'negative', interpretation: 'Extremely expensive; no margin of safety', quickInsight: '⚠️ 180x P/E - no safety cushion', metrics: [{ id: 'pe', name: 'P/E Ratio', value: 180, displayValue: '180x', sectorAvg: 45, sectorAvgDisplay: '45x', comparison: 'below', percentile: 5, status: 'poor', tooltipSimple: 'Would take 180 years of profits to pay back', tooltipAdvanced: 'For value, seek P/E under 20x. This is 9x your threshold.' }, { id: 'div_yield', name: 'Dividend Yield', value: 0, displayValue: '0%', sectorAvg: 0.5, sectorAvgDisplay: '0.5%', comparison: 'below', percentile: 0, status: 'poor', tooltipSimple: 'No income for shareholders' }] },
      { id: 'growth', name: 'Growth', score: 9.0, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.08, status: 'positive', interpretation: 'High growth but already priced in', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.15, status: 'positive', interpretation: 'Zero debt is positive; but no dividends', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 6, weight: 0.12, status: 'neutral', interpretation: 'No promoter; early investors selling', quickInsight: '⚠️ Softbank reduced stake', metrics: [] },
      { id: 'price', name: 'Price & Volume', score: 6.5, sectorAvg: 6.0, sectorRank: 3, sectorTotal: 6, weight: 0.05, status: 'neutral', interpretation: 'Recent run-up makes it expensive entry', metrics: [] },
      { id: 'technical', name: 'Technical', score: 6.0, sectorAvg: 5.5, sectorRank: 3, sectorTotal: 6, weight: 0.03, status: 'neutral', interpretation: 'Not oversold enough for value entry', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, sectorAvg: 6.5, sectorRank: 2, sectorTotal: 6, weight: 0.05, status: 'positive', interpretation: 'Analysts bullish but limited upside', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 5.0, sectorAvg: 5.5, sectorRank: 4, sectorTotal: 6, weight: 0.02, status: 'neutral', interpretation: 'Not applicable for value', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 5.5, sectorAvg: 5.5, sectorRank: 3, sectorTotal: 6, weight: 0.10, status: 'neutral', interpretation: 'Revenue good but margins thin', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 8.0, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.15, status: 'positive', interpretation: 'Strong balance sheet only positive', metrics: [] },
    ],
    redFlags: [
      { id: 'rf1', type: 'valuation', category: 'quality', title: 'Extreme Overvaluation', description: 'P/E 180x is 9x your max threshold of 20x', severity: 'critical', action: 'Wait for significant correction', isTriggered: true, currentValue: '180x', threshold: '<20x' },
      { id: 'rf2', type: 'dividend', category: 'financial', title: 'Zero Shareholder Returns', description: 'No dividend, no buyback', severity: 'high', action: 'Not suitable for dividend portfolio', isTriggered: true, currentValue: '0%', threshold: '>0%' },
    ],
  },

  // ==================== ZOMATO × KAVYA (Beginner) ====================
  {
    stockId: 'zomato', profileId: 'kavya', overallScore: 6.5, sectorAvgScore: 6.1, sectorRank: 2, sectorTotal: 6, verdict: 'HOLD', peerRank: 2, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'Brand You Know', description: 'You use Zomato - easy to understand', isPositive: true }, { title: 'Growing Fast', description: '70% revenue growth', isPositive: true }],
    topConcerns: [{ title: 'Expensive Stock', description: 'High price vs earnings', isPositive: false }, { title: 'High Volatility', description: 'Price swings a lot', isPositive: false }],
    verdictRationale: "Interesting company you probably use. But might be too volatile for beginners. Watch while building experience.",
    positionSizing: '5% max if interested', entryGuidance: 'Learn more about new-age company evaluation first.',
    learningPrompt: '📚 P/E Ratio: Zomato has 180x. Compare with TCS (28x) to understand "expensive" stocks.',
    blindSpotAlert: 'You haven\'t checked Valuation in last 3 analyses!',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.0, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.15, status: 'neutral', interpretation: 'Just became profitable', quickInsight: '✅ Making money now!', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.0, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.12, status: 'positive', interpretation: 'Growing 70% per year!', quickInsight: '🚀 Sales growing fast', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 4.0, sectorAvg: 6.5, sectorRank: 5, sectorTotal: 6, weight: 0.12, status: 'negative', interpretation: 'Stock is expensive', quickInsight: '⚠️ Paying a lot for growth', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.12, status: 'positive', interpretation: 'Lots of cash, no debt', quickInsight: '✅ ₹12,000 Cr cash, zero loans', metrics: [] },
      { id: 'price', name: 'Price Movement', score: 7.0, sectorAvg: 6.0, sectorRank: 2, sectorTotal: 6, weight: 0.05, status: 'positive', interpretation: 'Up a lot this year', quickInsight: '📈 Up 115%', metrics: [] },
      { id: 'technical', name: 'Technical', score: 6.5, sectorAvg: 5.5, sectorRank: 2, sectorTotal: 6, weight: 0.05, status: 'neutral', interpretation: 'Charts look okay', metrics: [] },
      { id: 'broker', name: 'Analyst Opinion', score: 7.5, sectorAvg: 6.5, sectorRank: 2, sectorTotal: 6, weight: 0.08, status: 'positive', interpretation: 'Most say Buy', quickInsight: '75% recommend buying', metrics: [] },
      { id: 'ownership', name: 'Who Owns It', score: 7.0, sectorAvg: 6.0, sectorRank: 2, sectorTotal: 6, weight: 0.10, status: 'positive', interpretation: 'Big investors own it', metrics: [] },
      { id: 'fno', name: 'F&O', score: 0, sectorAvg: 5.5, sectorRank: 6, sectorTotal: 6, weight: 0.00, status: 'neutral', interpretation: 'Skip - for advanced traders', quickInsight: '⏭️ Learn later', metrics: [] },
      { id: 'income', name: 'Income', score: 7.0, sectorAvg: 5.5, sectorRank: 2, sectorTotal: 6, weight: 0.10, status: 'positive', interpretation: 'Revenue growing fast', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 8.0, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.10, status: 'positive', interpretation: 'Strong foundation', metrics: [] },
    ],
  },

  // ==================== AXIS BANK × ANKIT (Growth) ====================
  {
    stockId: 'axisbank', profileId: 'ankit', overallScore: 7.5, sectorAvgScore: 7.2, sectorRank: 2, sectorTotal: 8, verdict: 'BUY', peerRank: 2, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Strong Loan Growth', description: '18% YoY, above industry', metric: 'Loan Growth', value: '18%', benchmark: 'Industry 14%', isPositive: true }, { title: 'Improving Asset Quality', description: 'GNPA down to 1.58%', isPositive: true }],
    topConcerns: [{ title: 'NIM Compression', description: 'Net Interest Margin under pressure', isPositive: false }],
    verdictRationale: "Solid growth bank. Loan growth 18% exceeds your threshold. Asset quality transformation impressive.",
    positionSizing: '6-8% allocation', entryGuidance: 'Accumulate on dips near ₹1,050.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'ROE 17.2% is good', quickInsight: 'Strong returns', metrics: [{ id: 'roe', name: 'ROE', value: 17.2, displayValue: '17.2%', unit: '%', sectorAvg: 15.8, sectorAvgDisplay: '15.8%', comparison: 'above', percentile: 72, status: 'good', trend: 'improving', trend5Y: [8, 10, 13, 15, 17.2], tooltipSimple: 'Profit on shareholder money' }, { id: 'nim', name: 'Net Interest Margin', value: 4.1, displayValue: '4.1%', unit: '%', sectorAvg: 3.8, sectorAvgDisplay: '3.8%', comparison: 'above', percentile: 68, status: 'good', trend: 'declining', trend5Y: [3.5, 3.8, 4.3, 4.2, 4.1], tooltipSimple: 'Lending profit margin' }] },
      { id: 'growth', name: 'Growth', score: 8.2, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.20, status: 'positive', interpretation: 'Loan growth 18% beats threshold', quickInsight: 'Above-average growth', metrics: [{ id: 'loan_growth', name: 'Loan Growth', value: 18, displayValue: '18%', unit: '%', sectorAvg: 14, sectorAvgDisplay: '14%', comparison: 'above', percentile: 78, status: 'good', trend: 'stable', trend5Y: [12, 14, 16, 17, 18], tooltipSimple: 'Bank loan growth rate' }] },
      { id: 'valuation', name: 'Valuation', score: 7.0, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Fair P/B 2.1x', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 7.5, sectorAvg: 7.2, sectorRank: 3, sectorTotal: 8, weight: 0.08, status: 'positive', interpretation: 'Strong CAR, clean book', quickInsight: 'GNPA 1.58%', metrics: [{ id: 'gnpa', name: 'Gross NPA', value: 1.58, displayValue: '1.58%', unit: '%', sectorAvg: 2.1, sectorAvgDisplay: '2.1%', comparison: 'above', percentile: 75, status: 'good', trend: 'improving', trend5Y: [5.2, 4.1, 2.8, 2.0, 1.58], tooltipSimple: 'Bad loans % (lower better)' }] },
      { id: 'price', name: 'Price & Volume', score: 6.8, sectorAvg: 6.5, sectorRank: 3, sectorTotal: 8, weight: 0.08, status: 'neutral', interpretation: 'Moderate returns', metrics: [] },
      { id: 'technical', name: 'Technical', score: 6.5, sectorAvg: 6.2, sectorRank: 4, sectorTotal: 8, weight: 0.08, status: 'neutral', interpretation: 'Consolidating', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.06, status: 'positive', interpretation: '68% Buy, ₹1,280 target', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 7.2, sectorAvg: 7.0, sectorRank: 4, sectorTotal: 8, weight: 0.08, status: 'positive', interpretation: 'FII 52%, stable', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 6.5, sectorAvg: 6.2, sectorRank: 3, sectorTotal: 8, weight: 0.05, status: 'neutral', interpretation: 'Normal activity', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 7.8, sectorAvg: 7.2, sectorRank: 2, sectorTotal: 8, weight: 0.08, status: 'positive', interpretation: 'NII +15%, PAT +20%', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.09, status: 'positive', interpretation: 'Strong CASA ratio', metrics: [] },
    ],
  },

  // ==================== AXIS BANK × SNEHA (Value) ====================
  {
    stockId: 'axisbank', profileId: 'sneha', overallScore: 7.8, sectorAvgScore: 7.2, sectorRank: 1, sectorTotal: 8, verdict: 'BUY', peerRank: 1, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Fair Valuation', description: 'P/B 2.1x vs historical 2.5x', isPositive: true }, { title: 'Asset Turnaround', description: 'GNPA improved from 5.2% to 1.58%', isPositive: true }, { title: 'ROE Trajectory', description: 'ROE from 8% to 17.2%', isPositive: true }],
    topConcerns: [{ title: 'NIM Pressure', description: 'Rising deposit costs', isPositive: false }],
    verdictRationale: "Meets value criteria: P/B below historical, improving ROE, clean balance sheet.",
    positionSizing: '10-12% allocation', entryGuidance: 'Good entry. Accumulate up to ₹1,100.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 8.0, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'ROE 17.2% meets threshold', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 8.5, sectorAvg: 6.8, sectorRank: 1, sectorTotal: 8, weight: 0.20, status: 'positive', interpretation: 'P/B 2.1x below historical 2.5x', quickInsight: '✅ Value opportunity', metrics: [{ id: 'pb', name: 'P/B Ratio', value: 2.1, displayValue: '2.1x', sectorAvg: 2.4, sectorAvgDisplay: '2.4x', comparison: 'above', percentile: 68, status: 'good', tooltipSimple: 'Below historical average - undervalued', tooltipAdvanced: 'Historical avg 2.5x. Current 2.1x offers 16% margin of safety.' }] },
      { id: 'financials', name: 'Financial Health', score: 8.2, sectorAvg: 7.2, sectorRank: 1, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'GNPA 1.58% - turnaround complete', quickInsight: 'GNPA from 5.2% to 1.58%', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.0, sectorAvg: 7.0, sectorRank: 4, sectorTotal: 8, weight: 0.08, status: 'neutral', interpretation: 'Moderate; focus on quality', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Stable ownership', metrics: [] },
      { id: 'price', name: 'Price & Volume', score: 6.5, sectorAvg: 6.5, sectorRank: 4, sectorTotal: 8, weight: 0.05, status: 'neutral', interpretation: 'Catch-up potential', metrics: [] },
      { id: 'technical', name: 'Technical', score: 6.0, sectorAvg: 6.2, sectorRank: 5, sectorTotal: 8, weight: 0.03, status: 'neutral', interpretation: 'Not oversold, not expensive', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.05, status: 'positive', interpretation: '15% upside', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 5.0, sectorAvg: 6.2, sectorRank: 6, sectorTotal: 8, weight: 0.02, status: 'neutral', interpretation: 'Not relevant', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 7.8, sectorAvg: 7.2, sectorRank: 2, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Steady income growth', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 8.0, sectorAvg: 7.0, sectorRank: 1, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Strong CASA, clean book', metrics: [] },
    ],
  },

  // ==================== AXIS BANK × KAVYA (Beginner) ====================
  {
    stockId: 'axisbank', profileId: 'kavya', overallScore: 7.2, sectorAvgScore: 7.2, sectorRank: 3, sectorTotal: 8, verdict: 'BUY', peerRank: 3, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Well-Known Bank', description: 'Large private bank with branches everywhere', isPositive: true }, { title: 'Stable Business', description: 'Banks are essential', isPositive: true }],
    topConcerns: [{ title: 'Complex Metrics', description: 'NPA, NIM can be confusing', isPositive: false }],
    verdictRationale: "Solid large bank, good to learn banking sector. Less volatile than tech.",
    positionSizing: '15-20% - Good diversifier from IT', entryGuidance: 'Good for learning bank stocks.',
    learningPrompt: '📚 Bank metrics: NPA (bad loans), NIM (loan profit margin), CASA (cheap deposits).',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.5, sectorAvg: 7.5, sectorRank: 4, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Good profits', quickInsight: '✅ 17% ROE', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Growing well', quickInsight: '18% loan growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 7.0, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Fair price', quickInsight: 'Not too expensive', metrics: [] },
      { id: 'financials', name: 'Safety', score: 7.8, sectorAvg: 7.2, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Cleaned up bad loans', quickInsight: '✅ Bad loans at 1.6%', metrics: [] },
      { id: 'price', name: 'Price Movement', score: 6.5, sectorAvg: 6.5, sectorRank: 4, sectorTotal: 8, weight: 0.05, status: 'neutral', interpretation: 'Steady price', metrics: [] },
      { id: 'technical', name: 'Charts', score: 6.0, sectorAvg: 6.2, sectorRank: 5, sectorTotal: 8, weight: 0.05, status: 'neutral', interpretation: 'Learn later', quickInsight: '⏭️ Skip', metrics: [] },
      { id: 'broker', name: 'Expert Opinion', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.08, status: 'positive', interpretation: 'Analysts recommend', quickInsight: '68% say Buy', metrics: [] },
      { id: 'ownership', name: 'Owners', score: 7.2, sectorAvg: 7.0, sectorRank: 4, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Big investors trust it', metrics: [] },
      { id: 'fno', name: 'F&O', score: 0, sectorAvg: 6.2, sectorRank: 8, sectorTotal: 8, weight: 0.00, status: 'neutral', interpretation: 'Too advanced', quickInsight: '⏭️ Learn later', metrics: [] },
      { id: 'income', name: 'Income', score: 7.5, sectorAvg: 7.2, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Good income from loans', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Strong foundation', metrics: [] },
    ],
  },

  // ==================== TCS × ANKIT (Growth) ====================
  {
    stockId: 'tcs', profileId: 'ankit', overallScore: 6.8, sectorAvgScore: 6.5, sectorRank: 2, sectorTotal: 5, verdict: 'HOLD', peerRank: 2, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Quality Business', description: 'Consistent margins, strong cash flows', isPositive: true }, { title: 'AI Investments', description: 'Well positioned for GenAI', isPositive: true }],
    topConcerns: [{ title: 'Growth Slowing', description: '7% vs your 20% threshold', isPositive: false }, { title: 'Tech Spending Cuts', description: 'US/Europe reducing IT budgets', isPositive: false }],
    verdictRationale: "Quality company but growth 7% is below your 20% threshold. Better for dividend/value investors.",
    positionSizing: 'Hold existing. Don\'t add.', entryGuidance: 'Wait for growth re-acceleration or below ₹3,800.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.10, status: 'positive', interpretation: 'Best-in-class margins', quickInsight: '24% margins, 52% ROE', metrics: [{ id: 'roe', name: 'ROE', value: 52, displayValue: '52%', unit: '%', sectorAvg: 28, sectorAvgDisplay: '28%', comparison: 'above', percentile: 98, status: 'excellent', trend: 'stable', trend5Y: [48, 49, 50, 51, 52], tooltipSimple: 'Exceptional - ₹52 profit per ₹100 invested' }] },
      { id: 'growth', name: 'Growth', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.20, status: 'negative', interpretation: '7% growth below threshold', quickInsight: '⚠️ Growth slowing', metrics: [{ id: 'rev_growth', name: 'Revenue Growth', value: 7, displayValue: '7%', unit: '%', sectorAvg: 9, sectorAvgDisplay: '9%', comparison: 'below', percentile: 35, status: 'fair', trend: 'declining', trend5Y: [15, 12, 10, 8, 7], tooltipSimple: 'Growth slowing - below your 20% threshold' }] },
      { id: 'valuation', name: 'Valuation', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.10, status: 'neutral', interpretation: 'Premium not justified by growth', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.08, status: 'positive', interpretation: 'Fortress balance sheet', metrics: [] },
      { id: 'price', name: 'Price & Volume', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.08, status: 'neutral', interpretation: 'Underperforming Nifty', metrics: [] },
      { id: 'technical', name: 'Technical', score: 5.5, sectorAvg: 5.8, sectorRank: 3, sectorTotal: 5, weight: 0.08, status: 'neutral', interpretation: 'No clear direction', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.06, status: 'neutral', interpretation: '55% Hold ratings', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 8.5, sectorAvg: 7.5, sectorRank: 1, sectorTotal: 5, weight: 0.08, status: 'positive', interpretation: 'Tata Sons 72%', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 6.0, sectorAvg: 6.2, sectorRank: 3, sectorTotal: 5, weight: 0.05, status: 'neutral', interpretation: 'Normal activity', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 5, weight: 0.08, status: 'positive', interpretation: 'Stable revenues', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.09, status: 'positive', interpretation: 'Cash-rich, zero debt', metrics: [] },
    ],
  },

  // ==================== TCS × SNEHA (Value) ====================
  {
    stockId: 'tcs', profileId: 'sneha', overallScore: 7.2, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Dividend Champion', description: '4.2% yield, consistent payouts', isPositive: true }, { title: 'Quality Franchise', description: 'ROE 52%, zero debt', isPositive: true }, { title: 'Promoter Stability', description: 'Tata Sons 72%', isPositive: true }],
    topConcerns: [{ title: 'Growth Slowdown', description: '7% but dividend compensates', isPositive: false }],
    verdictRationale: "Quality dividend stock: 4.2% yield, ROE 52%, zero debt. P/E 28x is premium but quality justifies.",
    positionSizing: '8-10% allocation. Core dividend holding.', entryGuidance: 'Good income stock. Reinvest dividends.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.5, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'ROE 52% is exceptional', quickInsight: '✅ ROE 52%', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.20, status: 'neutral', interpretation: 'Premium but quality justifies', quickInsight: '4.2% dividend yield', metrics: [{ id: 'div_yield', name: 'Dividend Yield', value: 4.2, displayValue: '4.2%', sectorAvg: 2.5, sectorAvgDisplay: '2.5%', comparison: 'above', percentile: 92, status: 'excellent', tooltipSimple: 'High dividend - beats FD rates' }] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Zero debt, ₹50,000 Cr cash', quickInsight: '✅ Fortress balance sheet', metrics: [] },
      { id: 'growth', name: 'Growth', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.08, status: 'neutral', interpretation: 'Slow but dividend compensates', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 9.0, sectorAvg: 7.5, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Tata Sons 72% - aligned', metrics: [] },
      { id: 'price', name: 'Price & Volume', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.05, status: 'neutral', interpretation: 'Entry opportunity', metrics: [] },
      { id: 'technical', name: 'Technical', score: 5.0, sectorAvg: 5.8, sectorRank: 4, sectorTotal: 5, weight: 0.03, status: 'neutral', interpretation: 'Not relevant for dividends', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.05, status: 'neutral', interpretation: 'Dividend reliability key', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 5.0, sectorAvg: 6.2, sectorRank: 5, sectorTotal: 5, weight: 0.02, status: 'neutral', interpretation: 'Not relevant', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 8.0, sectorAvg: 7.0, sectorRank: 1, sectorTotal: 5, weight: 0.10, status: 'positive', interpretation: 'Stable, excellent margins', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Best in sector', metrics: [] },
    ],
  },

  // ==================== TCS × KAVYA (Beginner) ====================
  {
    stockId: 'tcs', profileId: 'kavya', overallScore: 7.8, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Safe Blue Chip', description: '50+ year track record', isPositive: true }, { title: 'Easy to Understand', description: 'IT services company', isPositive: true }, { title: 'Pays Dividends', description: '₹170/share yearly', isPositive: true }],
    topConcerns: [{ title: 'Slower Growth', description: 'Not growing as fast', isPositive: false }],
    verdictRationale: "Perfect first stock! Safe, profitable, pays dividends. Great for learning.",
    positionSizing: 'Already 100%! Don\'t buy more - diversify first.', entryGuidance: 'Great choice! Now focus on diversifying.',
    learningPrompt: '📚 You own TCS! Track price, watch quarterly results.',
    blindSpotAlert: '⚠️ 100% in one stock is risky! Learn about diversification.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Very profitable', quickInsight: '✅ ₹24 profit per ₹100 sales', metrics: [] },
      { id: 'growth', name: 'Growth', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.12, status: 'neutral', interpretation: 'Growing slowly', quickInsight: '7% yearly - slow but stable', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.12, status: 'neutral', interpretation: 'Quality costs more', quickInsight: 'Fair price for great company', metrics: [] },
      { id: 'financials', name: 'Safety', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'One of safest in India', quickInsight: '✅ No debt, lots of cash', metrics: [] },
      { id: 'price', name: 'Price Movement', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.05, status: 'neutral', interpretation: 'Price flat recently', metrics: [] },
      { id: 'technical', name: 'Charts', score: 5.0, sectorAvg: 5.8, sectorRank: 4, sectorTotal: 5, weight: 0.05, status: 'neutral', interpretation: 'Learn later', quickInsight: '⏭️ Skip', metrics: [] },
      { id: 'broker', name: 'Expert Opinion', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.08, status: 'neutral', interpretation: 'Mixed views', quickInsight: '55% say Hold', metrics: [] },
      { id: 'ownership', name: 'Owners', score: 9.0, sectorAvg: 7.5, sectorRank: 1, sectorTotal: 5, weight: 0.10, status: 'positive', interpretation: 'Tata Group owns 72%', quickInsight: '✅ Trusted Tata Group', metrics: [] },
      { id: 'fno', name: 'F&O', score: 0, sectorAvg: 6.2, sectorRank: 5, sectorTotal: 5, weight: 0.00, status: 'neutral', interpretation: 'Too advanced', quickInsight: '⏭️ Learn later', metrics: [] },
      { id: 'income', name: 'Income', score: 8.0, sectorAvg: 7.0, sectorRank: 1, sectorTotal: 5, weight: 0.10, status: 'positive', interpretation: 'Steady income', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.10, status: 'positive', interpretation: 'Very strong', quickInsight: '✅ ₹50,000 Cr cash', metrics: [] },
    ],
  },

  // ==================== PRIYA (Practical/Balanced - wants simple verdicts) ====================
  // Zomato × Priya
  {
    stockId: 'zomato', profileId: 'priya', overallScore: 7.2, sectorAvgScore: 6.1, sectorRank: 2, sectorTotal: 6, verdict: 'BUY', peerRank: 2, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'Growth Leader', description: '70% revenue growth', isPositive: true }, { title: 'Just Turned Profitable', description: 'Finally making money', isPositive: true }],
    topConcerns: [{ title: 'Expensive Valuation', description: 'Premium priced', isPositive: false }],
    verdictRationale: "Strong growth story that's finally profitable. Worth considering for growth exposure.",
    positionSizing: '5-8% of portfolio', entryGuidance: 'Can buy at current levels.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.10, status: 'neutral', interpretation: 'Recently profitable', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.15, status: 'positive', interpretation: 'Exceptional growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 5.0, sectorAvg: 6.5, sectorRank: 5, sectorTotal: 6, weight: 0.10, status: 'negative', interpretation: 'Premium valuation', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.12, status: 'positive', interpretation: 'Strong balance sheet', metrics: [] },
    ],
  },
  // Axis Bank × Priya
  {
    stockId: 'axisbank', profileId: 'priya', overallScore: 7.4, sectorAvgScore: 7.2, sectorRank: 2, sectorTotal: 8, verdict: 'BUY', peerRank: 2, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Solid Bank', description: 'Top 3 private bank', isPositive: true }, { title: 'Good Growth', description: '18% loan growth', isPositive: true }],
    topConcerns: [{ title: 'NIM Pressure', description: 'Margins under pressure', isPositive: false }],
    verdictRationale: "Well-run private bank with good growth. Solid addition to any portfolio.",
    positionSizing: '8-10% of portfolio', entryGuidance: 'Good entry point.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Good profitability', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Strong growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 7.0, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Fair valuation', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 7.5, sectorAvg: 7.2, sectorRank: 3, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Healthy balance sheet', metrics: [] },
    ],
  },
  // TCS × Priya
  {
    stockId: 'tcs', profileId: 'priya', overallScore: 7.0, sectorAvgScore: 6.5, sectorRank: 2, sectorTotal: 5, verdict: 'HOLD', peerRank: 2, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Quality Business', description: 'Best-in-class IT company', isPositive: true }, { title: 'Pays Dividends', description: '1.5% yield', isPositive: true }],
    topConcerns: [{ title: 'Slow Growth', description: 'Only 7% growth', isPositive: false }],
    verdictRationale: "Rock-solid company but expensive. Hold if you own, wait for dip to buy.",
    positionSizing: '5-8% of portfolio', entryGuidance: 'Wait for 5-10% correction.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Excellent margins', metrics: [] },
      { id: 'growth', name: 'Growth', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.10, status: 'neutral', interpretation: 'Moderate growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 6.0, sectorAvg: 6.8, sectorRank: 4, sectorTotal: 5, weight: 0.12, status: 'neutral', interpretation: 'Slightly expensive', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Fortress balance sheet', metrics: [] },
    ],
  },

  // ==================== FATIMA (FIRE - Long-term compounder focus) ====================
  // Zomato × Fatima
  {
    stockId: 'zomato', profileId: 'fatima', overallScore: 7.8, sectorAvgScore: 6.1, sectorRank: 1, sectorTotal: 6, verdict: 'BUY', peerRank: 1, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'Long Runway', description: '15+ years of growth ahead', isPositive: true }, { title: 'Market Leader', description: 'Dominant in food delivery', isPositive: true }, { title: 'SIP Worthy', description: 'Good for systematic investment', isPositive: true }],
    topConcerns: [{ title: 'Volatility', description: 'Price swings can be large', isPositive: false }],
    verdictRationale: "Perfect for long-term wealth building. India's food delivery leader with decades of runway.",
    positionSizing: '8-10% via SIP', entryGuidance: 'Start SIP immediately, ignore short-term volatility.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.12, status: 'neutral', interpretation: 'Improving rapidly', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.18, status: 'positive', interpretation: 'Exceptional for compounding', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 6.0, sectorAvg: 6.5, sectorRank: 4, sectorTotal: 6, weight: 0.08, status: 'neutral', interpretation: 'Premium but justified', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.15, status: 'positive', interpretation: 'Strong for long hold', metrics: [] },
    ],
  },
  // Axis Bank × Fatima
  {
    stockId: 'axisbank', profileId: 'fatima', overallScore: 7.5, sectorAvgScore: 7.2, sectorRank: 2, sectorTotal: 8, verdict: 'BUY', peerRank: 2, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Compounding Machine', description: '15%+ ROE sustainable', isPositive: true }, { title: 'Banking Tailwind', description: 'Credit growth story intact', isPositive: true }],
    topConcerns: [{ title: 'Cyclical Risk', description: 'Banks can be cyclical', isPositive: false }],
    verdictRationale: "Quality bank that can compound wealth over decades. Core holding for FIRE portfolio.",
    positionSizing: '10-12% of portfolio', entryGuidance: 'Add via SIP, accumulate on dips.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Consistent profitability', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Steady growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 7.0, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 8, weight: 0.08, status: 'positive', interpretation: 'Reasonable for quality', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 7.5, sectorAvg: 7.2, sectorRank: 3, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Clean book', metrics: [] },
    ],
  },
  // TCS × Fatima
  {
    stockId: 'tcs', profileId: 'fatima', overallScore: 7.2, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Dividend Compounder', description: 'Growing dividends for 20+ years', isPositive: true }, { title: 'Recession Resistant', description: 'Essential IT services', isPositive: true }],
    topConcerns: [{ title: 'Growth Slowing', description: 'Mature business', isPositive: false }],
    verdictRationale: "Dividend aristocrat with consistent returns. Core holding for steady compounding.",
    positionSizing: '8-10% of portfolio', entryGuidance: 'Good for lump sum + DRIPs.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Best-in-class margins', metrics: [] },
      { id: 'growth', name: 'Growth', score: 5.5, sectorAvg: 6.0, sectorRank: 4, sectorTotal: 5, weight: 0.10, status: 'neutral', interpretation: 'Slow but steady', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 6.5, sectorAvg: 6.8, sectorRank: 3, sectorTotal: 5, weight: 0.10, status: 'neutral', interpretation: 'Fair for quality', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Rock solid', metrics: [] },
    ],
  },

  // ==================== NIKHIL (NRI - Remote investing, liquidity focus) ====================
  // Zomato × Nikhil
  {
    stockId: 'zomato', profileId: 'nikhil', overallScore: 6.8, sectorAvgScore: 6.1, sectorRank: 2, sectorTotal: 6, verdict: 'HOLD', peerRank: 2, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'High Liquidity', description: 'Easy to buy/sell', isPositive: true }, { title: 'India Story', description: 'Pure play on India consumption', isPositive: true }],
    topConcerns: [{ title: 'Volatility Risk', description: 'Sharp swings when abroad', isPositive: false }, { title: 'No Dividends', description: 'No regular income', isPositive: false }],
    verdictRationale: "Liquid but volatile. Better suited for India-based investors who can monitor closely.",
    positionSizing: '3-5% max', entryGuidance: 'Small position only.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.10, status: 'neutral', interpretation: 'Improving', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.12, status: 'positive', interpretation: 'Strong growth', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 5.0, sectorAvg: 6.5, sectorRank: 5, sectorTotal: 6, weight: 0.10, status: 'negative', interpretation: 'Expensive', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 7.5, sectorAvg: 6.0, sectorRank: 2, sectorTotal: 6, weight: 0.12, status: 'positive', interpretation: 'FII friendly', metrics: [] },
    ],
  },
  // Axis Bank × Nikhil
  {
    stockId: 'axisbank', profileId: 'nikhil', overallScore: 7.8, sectorAvgScore: 7.2, sectorRank: 1, sectorTotal: 8, verdict: 'BUY', peerRank: 1, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'NRI Friendly', description: 'Easy NRE/NRO accounts', isPositive: true }, { title: 'High Liquidity', description: 'Nifty 50 constituent', isPositive: true }, { title: 'Repatriation Easy', description: 'Dividend in USD possible', isPositive: true }],
    topConcerns: [{ title: 'Currency Risk', description: 'INR depreciation', isPositive: false }],
    verdictRationale: "Ideal for NRI investors. Liquid, established, easy to manage from abroad.",
    positionSizing: '10-12% of portfolio', entryGuidance: 'Good core holding.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Consistent', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Steady', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 8.0, sectorAvg: 7.0, sectorRank: 1, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'FII 52% - liquid', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Well covered', metrics: [] },
    ],
  },
  // TCS × Nikhil
  {
    stockId: 'tcs', profileId: 'nikhil', overallScore: 8.0, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Perfect for NRIs', description: 'Global business, INR earnings', isPositive: true }, { title: 'Dividend Income', description: 'Regular cash flow', isPositive: true }, { title: 'Most Liquid', description: 'Easy entry/exit', isPositive: true }],
    topConcerns: [{ title: 'Premium Valuation', description: 'Quality premium', isPositive: false }],
    verdictRationale: "Best large-cap for NRI investors. Liquid, safe, pays dividends. Ideal core holding.",
    positionSizing: '12-15% of portfolio', entryGuidance: 'Core holding, buy on any dips.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Best margins', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 9.0, sectorAvg: 7.5, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'High FII, liquid', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, sectorAvg: 6.8, sectorRank: 2, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Global coverage', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Impeccable', metrics: [] },
    ],
  },

  // ==================== MEERA (Momentum - Technical/breakout focus) ====================
  // Zomato × Meera
  {
    stockId: 'zomato', profileId: 'meera', overallScore: 8.5, sectorAvgScore: 6.1, sectorRank: 1, sectorTotal: 6, verdict: 'STRONG BUY', peerRank: 1, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'Strong Momentum', description: '+115% in 12 months', isPositive: true }, { title: 'Volume Breakout', description: 'Institutional accumulation', isPositive: true }, { title: 'Above All MAs', description: 'Bullish structure', isPositive: true }],
    topConcerns: [{ title: 'Overbought RSI', description: 'May consolidate', isPositive: false }],
    verdictRationale: "Momentum darling! Strong technicals, institutional buying. Ride the trend with stops.",
    positionSizing: '8-10% with strict stop loss', entryGuidance: 'Buy above ₹260 with SL at ₹230.',
    segments: [
      { id: 'price', name: 'Price & Volume', score: 9.5, sectorAvg: 6.0, sectorRank: 1, sectorTotal: 6, weight: 0.25, status: 'positive', interpretation: 'Strong breakout', metrics: [] },
      { id: 'technical', name: 'Technical', score: 9.0, sectorAvg: 5.5, sectorRank: 1, sectorTotal: 6, weight: 0.25, status: 'positive', interpretation: 'Bullish setup', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 8.0, sectorAvg: 5.5, sectorRank: 1, sectorTotal: 6, weight: 0.15, status: 'positive', interpretation: 'Long buildup', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.10, status: 'positive', interpretation: 'Supports momentum', metrics: [] },
    ],
  },
  // Axis Bank × Meera
  {
    stockId: 'axisbank', profileId: 'meera', overallScore: 6.5, sectorAvgScore: 7.2, sectorRank: 5, sectorTotal: 8, verdict: 'HOLD', peerRank: 5, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Consolidating', description: 'Range-bound for now', isPositive: false }],
    topConcerns: [{ title: 'No Momentum', description: 'Sideways action', isPositive: false }, { title: 'Underperforming Sector', description: 'Banking lagging', isPositive: false }],
    verdictRationale: "No clear momentum. Wait for breakout above ₹1,150 before entering.",
    positionSizing: 'No position', entryGuidance: 'Add to watchlist, wait for breakout.',
    segments: [
      { id: 'price', name: 'Price & Volume', score: 5.5, sectorAvg: 6.5, sectorRank: 6, sectorTotal: 8, weight: 0.25, status: 'neutral', interpretation: 'Sideways', metrics: [] },
      { id: 'technical', name: 'Technical', score: 5.0, sectorAvg: 6.2, sectorRank: 6, sectorTotal: 8, weight: 0.25, status: 'neutral', interpretation: 'No signal', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 6.0, sectorAvg: 6.2, sectorRank: 4, sectorTotal: 8, weight: 0.15, status: 'neutral', interpretation: 'Mixed signals', metrics: [] },
      { id: 'growth', name: 'Growth', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.05, status: 'positive', interpretation: 'Decent fundamentals', metrics: [] },
    ],
  },
  // TCS × Meera
  {
    stockId: 'tcs', profileId: 'meera', overallScore: 5.2, sectorAvgScore: 6.5, sectorRank: 4, sectorTotal: 5, verdict: 'AVOID', peerRank: 4, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Weak Momentum', description: 'IT sector underperforming', isPositive: false }],
    topConcerns: [{ title: 'Downtrend', description: 'Below 50-DMA', isPositive: false }, { title: 'No Catalyst', description: 'Boring price action', isPositive: false }],
    verdictRationale: "No momentum, no trade. IT sector weak. Look elsewhere for momentum plays.",
    positionSizing: 'No position', entryGuidance: 'Not a momentum candidate.',
    segments: [
      { id: 'price', name: 'Price & Volume', score: 4.5, sectorAvg: 6.0, sectorRank: 5, sectorTotal: 5, weight: 0.25, status: 'negative', interpretation: 'Weak', metrics: [] },
      { id: 'technical', name: 'Technical', score: 4.0, sectorAvg: 5.8, sectorRank: 5, sectorTotal: 5, weight: 0.25, status: 'negative', interpretation: 'Bearish', metrics: [] },
      { id: 'fno', name: 'F&O Activity', score: 5.0, sectorAvg: 6.2, sectorRank: 4, sectorTotal: 5, weight: 0.15, status: 'neutral', interpretation: 'No conviction', metrics: [] },
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.05, status: 'positive', interpretation: 'Great but irrelevant', metrics: [] },
    ],
  },

  // ==================== DINESH (Dividend - Income focus) ====================
  // Zomato × Dinesh
  {
    stockId: 'zomato', profileId: 'dinesh', overallScore: 3.5, sectorAvgScore: 6.1, sectorRank: 6, sectorTotal: 6, verdict: 'AVOID', peerRank: 6, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'None', description: 'Not suitable for income', isPositive: false }],
    topConcerns: [{ title: 'Zero Dividends', description: 'No income generation', isPositive: false }, { title: 'No Payout History', description: 'Never paid dividends', isPositive: false }],
    verdictRationale: "Zero dividends, not for income investors. Look at ITC, Coal India instead.",
    positionSizing: 'No position', entryGuidance: 'Not suitable for your goals.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.20, status: 'neutral', interpretation: 'Just profitable', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 2.0, sectorAvg: 6.5, sectorRank: 6, sectorTotal: 6, weight: 0.15, status: 'negative', interpretation: 'No yield', metrics: [] },
      { id: 'growth', name: 'Growth', score: 9.5, sectorAvg: 6.2, sectorRank: 1, sectorTotal: 6, weight: 0.05, status: 'positive', interpretation: 'Irrelevant for income', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 5.0, sectorAvg: 5.5, sectorRank: 4, sectorTotal: 6, weight: 0.15, status: 'neutral', interpretation: 'No dividend capacity', metrics: [] },
    ],
  },
  // Axis Bank × Dinesh
  {
    stockId: 'axisbank', profileId: 'dinesh', overallScore: 6.8, sectorAvgScore: 7.2, sectorRank: 4, sectorTotal: 8, verdict: 'HOLD', peerRank: 4, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Dividend Growth', description: 'Increasing payouts', isPositive: true }],
    topConcerns: [{ title: 'Low Yield', description: 'Only 0.8% yield', isPositive: false }, { title: 'Growth Focus', description: 'Retains earnings', isPositive: false }],
    verdictRationale: "Growing dividends but low yield. Better options exist for income. Hold if you have.",
    positionSizing: '5% max', entryGuidance: 'Consider HDFC Bank for better yield.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.20, status: 'positive', interpretation: 'Can pay more', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 5.5, sectorAvg: 6.8, sectorRank: 6, sectorTotal: 8, weight: 0.15, status: 'neutral', interpretation: 'Low yield', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 7.5, sectorAvg: 7.2, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Dividend capacity', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.12, status: 'positive', interpretation: 'Sustainable', metrics: [] },
    ],
  },
  // TCS × Dinesh
  {
    stockId: 'tcs', profileId: 'dinesh', overallScore: 8.2, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Dividend Champion', description: '1.5% yield + special dividends', isPositive: true }, { title: '20+ Year Track Record', description: 'Never cut dividends', isPositive: true }, { title: 'Buybacks Too', description: 'Returns cash regularly', isPositive: true }],
    topConcerns: [{ title: 'Yield Not Highest', description: 'ITC/Coal India pay more', isPositive: false }],
    verdictRationale: "Best dividend stock in IT. Consistent payouts, occasional special dividends. Core income holding.",
    positionSizing: '10-12% of portfolio', entryGuidance: 'Buy for dividend income stream.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.20, status: 'positive', interpretation: 'Funds dividends', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 7.5, sectorAvg: 6.8, sectorRank: 2, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Good yield for quality', metrics: [] },
      { id: 'income', name: 'Income Statement', score: 8.5, sectorAvg: 7.0, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Strong cash generation', metrics: [] },
      { id: 'balance', name: 'Balance Sheet', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Can sustain payouts', metrics: [] },
    ],
  },

  // ==================== RAJAN (Retirement - Capital preservation) ====================
  // Zomato × Rajan
  {
    stockId: 'zomato', profileId: 'rajan', overallScore: 2.8, sectorAvgScore: 6.1, sectorRank: 6, sectorTotal: 6, verdict: 'AVOID', peerRank: 6, peerTotal: 6, peerGroup: 'New Economy',
    topSignals: [{ title: 'None', description: 'Too risky for retirement', isPositive: false }],
    topConcerns: [{ title: 'High Volatility', description: 'Can drop 30%+ quickly', isPositive: false }, { title: 'No Track Record', description: 'Young company', isPositive: false }, { title: 'No Dividends', description: 'No income', isPositive: false }],
    verdictRationale: "NOT for retirement corpus. Too volatile, no dividends, no track record. Stick to blue chips.",
    positionSizing: 'Zero', entryGuidance: 'Avoid completely.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, sectorAvg: 4.2, sectorRank: 2, sectorTotal: 6, weight: 0.15, status: 'neutral', interpretation: 'Just profitable', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 8.5, sectorAvg: 5.8, sectorRank: 1, sectorTotal: 6, weight: 0.18, status: 'positive', interpretation: 'Only positive', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 2.0, sectorAvg: 6.5, sectorRank: 6, sectorTotal: 6, weight: 0.15, status: 'negative', interpretation: 'Very expensive', metrics: [] },
      { id: 'price', name: 'Price Stability', score: 2.0, sectorAvg: 6.0, sectorRank: 6, sectorTotal: 6, weight: 0.15, status: 'negative', interpretation: 'Very volatile', metrics: [] },
    ],
  },
  // Axis Bank × Rajan
  {
    stockId: 'axisbank', profileId: 'rajan', overallScore: 7.5, sectorAvgScore: 7.2, sectorRank: 2, sectorTotal: 8, verdict: 'BUY', peerRank: 2, peerTotal: 8, peerGroup: 'Private Banks',
    topSignals: [{ title: 'Blue Chip Bank', description: 'Top 3 private bank', isPositive: true }, { title: 'Stable Dividends', description: 'Regular payouts', isPositive: true }],
    topConcerns: [{ title: 'Some Volatility', description: 'Banks can swing', isPositive: false }],
    verdictRationale: "Suitable for retirement with caution. Blue chip bank, established track record.",
    positionSizing: '8-10% max', entryGuidance: 'Can buy for stability.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.8, sectorAvg: 7.5, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Consistent', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 7.5, sectorAvg: 7.2, sectorRank: 3, sectorTotal: 8, weight: 0.18, status: 'positive', interpretation: 'Sound', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 7.5, sectorAvg: 7.0, sectorRank: 2, sectorTotal: 8, weight: 0.15, status: 'positive', interpretation: 'Well governed', metrics: [] },
      { id: 'broker', name: 'Broker Ratings', score: 7.5, sectorAvg: 7.0, sectorRank: 3, sectorTotal: 8, weight: 0.10, status: 'positive', interpretation: 'Positive outlook', metrics: [] },
    ],
  },
  // TCS × Rajan
  {
    stockId: 'tcs', profileId: 'rajan', overallScore: 9.0, sectorAvgScore: 6.5, sectorRank: 1, sectorTotal: 5, verdict: 'STRONG BUY', peerRank: 1, peerTotal: 5, peerGroup: 'IT Services',
    topSignals: [{ title: 'Perfect for Retirement', description: 'Safe, stable, dividend paying', isPositive: true }, { title: 'Tata Pedigree', description: '50+ year track record', isPositive: true }, { title: 'Low Volatility', description: 'Steady performer', isPositive: true }],
    topConcerns: [{ title: 'Slower Growth', description: 'But that means stability', isPositive: false }],
    verdictRationale: "Ideal retirement stock. Safe as it gets in equities. Pays dividends, minimal volatility, Tata governance.",
    positionSizing: '15-20% of portfolio', entryGuidance: 'Core holding, buy and hold forever.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, sectorAvg: 8.2, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Excellent', metrics: [] },
      { id: 'financials', name: 'Financial Health', score: 9.5, sectorAvg: 8.0, sectorRank: 1, sectorTotal: 5, weight: 0.18, status: 'positive', interpretation: 'Fortress', metrics: [] },
      { id: 'ownership', name: 'Ownership', score: 9.0, sectorAvg: 7.5, sectorRank: 1, sectorTotal: 5, weight: 0.15, status: 'positive', interpretation: 'Tata governance', metrics: [] },
      { id: 'valuation', name: 'Valuation', score: 7.0, sectorAvg: 6.8, sectorRank: 2, sectorTotal: 5, weight: 0.12, status: 'positive', interpretation: 'Quality premium OK', metrics: [] },
    ],
  },
]

// Helper functions
export const getVerdict = (stockId: string, profileId: string): StockVerdict | undefined => {
  return verdicts.find(v => v.stockId === stockId && v.profileId === profileId)
}

export const getVerdictsByProfile = (profileId: string): StockVerdict[] => {
  return verdicts.filter(v => v.profileId === profileId)
}

export const getVerdictsByStock = (stockId: string): StockVerdict[] => {
  return verdicts.filter(v => v.stockId === stockId)
}
