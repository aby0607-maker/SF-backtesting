import type { StockVerdict } from '@/types'

// 9 Stock × Profile verdict combinations
export const verdicts: StockVerdict[] = [
  // ==================== ZOMATO ====================
  // Zomato × Ankit (Growth) = STRONG BUY
  {
    stockId: 'zomato',
    profileId: 'ankit',
    overallScore: 8.2,
    verdict: 'STRONG BUY',
    peerRank: 1,
    peerTotal: 6,
    peerGroup: 'New Economy/Internet',
    topSignals: [
      {
        title: 'Revenue Growth 70%+ YoY',
        description: "Blinkit's quick commerce driving hypergrowth; market leader in emerging category with massive TAM",
        isPositive: true,
      },
      {
        title: 'Path to Profitability Clear',
        description: 'First profitable quarter achieved (Q2 FY25); contribution margins improving sequentially',
        isPositive: true,
      },
      {
        title: 'Market Share Dominance',
        description: '#1 in food delivery (55%+ share), #1 in quick commerce; network effects strengthening',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Premium Valuation',
        description: 'P/S ratio of 12x vs sector avg 6x; growth must continue to justify',
        isPositive: false,
      },
      {
        title: 'Competitive Intensity',
        description: 'Swiggy, Amazon, BigBasket competing aggressively in quick commerce',
        isPositive: false,
      },
      {
        title: 'Execution Risk',
        description: 'Scaling dark stores capital-intensive; unit economics unproven at scale',
        isPositive: false,
      },
    ],
    verdictRationale: "For your growth-focused thesis, Eternal represents the best pure-play on India's food economy digitization. Revenue growth of 70%+ significantly exceeds your 20% threshold. The company has achieved profitability faster than expected, validating the business model. While valuation is premium (P/S 12x), this is justified by TAM expansion into quick commerce (estimated $60B market by 2030). Your 3-5 year horizon aligns well with their growth trajectory.",
    positionSizing: 'Based on your moderate risk tolerance and current 20% cash position, consider 8-10% allocation (₹80K-1L of ₹10L portfolio). This maintains diversification while capturing growth opportunity.',
    entryGuidance: 'Stock is 12% below 52W high. Current levels offer reasonable entry. Consider SIP approach - 50% now, 50% on any 10% correction.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.5, weight: 10, status: 'neutral', interpretation: 'Recently turned profitable; margins improving' },
      { id: 'financials', name: 'Financial Ratios', score: 8.5, weight: 8, status: 'positive', interpretation: 'Zero debt, ₹12,000 Cr cash; fortress balance sheet' },
      { id: 'growth', name: 'Growth', score: 9.5, weight: 20, status: 'positive', interpretation: '70%+ revenue growth; exceptional for your thesis' },
      { id: 'valuation', name: 'Valuation', score: 5.0, weight: 10, status: 'negative', interpretation: 'P/S 12x is premium; priced for perfection' },
      { id: 'price', name: 'Price & Volume', score: 7.8, weight: 8, status: 'positive', interpretation: '115% return in 12 months; strong momentum' },
      { id: 'technical', name: 'Technical', score: 7.5, weight: 8, status: 'positive', interpretation: 'Above all moving averages; bullish setup' },
      { id: 'broker', name: 'Broker Ratings', score: 8.0, weight: 6, status: 'positive', interpretation: '75% Buy ratings; avg target ₹310' },
      { id: 'ownership', name: 'Ownership', score: 7.5, weight: 8, status: 'positive', interpretation: 'FIIs increasing stake; smart money accumulating' },
      { id: 'fno', name: 'Futures & Options', score: 6.8, weight: 5, status: 'neutral', interpretation: 'Moderate OI buildup; neutral sentiment' },
      { id: 'income', name: 'Income Statement', score: 8.0, weight: 8, status: 'positive', interpretation: 'Revenue scaling; operating leverage kicking in' },
      { id: 'balance', name: 'Balance Sheet', score: 8.5, weight: 9, status: 'positive', interpretation: 'Cash-rich, debt-free; financial strength' },
    ],
  },

  // Zomato × Sneha (Value) = AVOID
  {
    stockId: 'zomato',
    profileId: 'sneha',
    overallScore: 4.8,
    verdict: 'AVOID',
    peerRank: 5,
    peerTotal: 6,
    peerGroup: 'New Economy/Internet',
    topSignals: [
      {
        title: 'Turned Profitable',
        description: 'Finally showing positive PAT; removes "will it ever make money?" concern',
        isPositive: true,
      },
      {
        title: 'Cash Rich Balance Sheet',
        description: '₹12,000 Cr cash; no debt; zero financial distress risk',
        isPositive: true,
      },
      {
        title: 'Market Leadership',
        description: 'Dominant position provides some moat against competition',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'No Margin of Safety',
        description: "P/S 12x, P/E 180x (on trailing earnings); price assumes perfection for 10+ years",
        isPositive: false,
      },
      {
        title: 'No Dividend, No Buyback',
        description: 'Zero capital return to shareholders; all reinvested',
        isPositive: false,
      },
      {
        title: 'Unproven Long-term Unit Economics',
        description: 'Gross margins improving but unclear if 20%+ sustainable net margins achievable',
        isPositive: false,
      },
    ],
    verdictRationale: "For your value-focused thesis, Eternal fails multiple tests. P/E of 180x means you're paying for earnings that may materialize in 2030+. No dividend yield (your minimum 1% threshold not met). Even with strong execution, there's no margin of safety at current prices. Your conservative risk tolerance (15-20% max drawdown) is incompatible with this stock's 1.8 beta and 60% drawdown history in 2022. This is a speculation, not an investment.",
    positionSizing: 'Not recommended for your portfolio. If you must have exposure, limit to <2% as a speculative position.',
    entryGuidance: 'No safe entry point exists for value investors. Would need 50%+ correction to offer margin of safety.',
    riskWarning: "⚠️ VOLATILITY MISMATCH: This stock's historical max drawdown (65%) significantly exceeds your 15-20% tolerance. Even a normal market correction could test your conviction.",
    segments: [
      { id: 'profitability', name: 'Profitability', score: 5.5, weight: 15, status: 'neutral', interpretation: 'Recently profitable but margins thin' },
      { id: 'financials', name: 'Financial Ratios', score: 7.0, weight: 15, status: 'positive', interpretation: 'Strong balance sheet; only positive' },
      { id: 'growth', name: 'Growth', score: 6.0, weight: 8, status: 'neutral', interpretation: 'High growth but not your priority' },
      { id: 'valuation', name: 'Valuation', score: 2.0, weight: 20, status: 'negative', interpretation: 'P/E 180x, P/B 8.5x - fails all value tests' },
      { id: 'price', name: 'Price & Volume', score: 5.5, weight: 5, status: 'neutral', interpretation: 'Volatile; unsuitable for conservative' },
      { id: 'technical', name: 'Technical', score: 6.0, weight: 5, status: 'neutral', interpretation: 'Strong but you weight this low' },
      { id: 'broker', name: 'Broker Ratings', score: 6.5, weight: 5, status: 'neutral', interpretation: 'Mixed ratings; not consensus' },
      { id: 'ownership', name: 'Ownership', score: 6.0, weight: 12, status: 'neutral', interpretation: 'Softbank reducing stake (expected)' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Not applicable for your profile' },
      { id: 'income', name: 'Income Statement', score: 5.0, weight: 8, status: 'neutral', interpretation: 'Revenue scaling but path to high margins unclear' },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, weight: 12, status: 'positive', interpretation: 'Cash-rich but no return to shareholders' },
    ],
  },

  // Zomato × Kavya (Beginner) = HOLD/LEARN
  {
    stockId: 'zomato',
    profileId: 'kavya',
    overallScore: 6.5,
    verdict: 'HOLD',
    peerRank: 2,
    peerTotal: 6,
    peerGroup: 'New Economy/Internet',
    topSignals: [
      {
        title: 'You Probably Use It',
        description: 'Zomato and Blinkit are brands you interact with; easier to understand the business',
        isPositive: true,
      },
      {
        title: 'Growing Fast',
        description: 'Revenue growing 70% per year means the company is getting much bigger quickly',
        isPositive: true,
      },
      {
        title: 'Finally Making Money',
        description: 'After years of losses, the company just turned profitable - a positive turning point',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Very Expensive Stock',
        description: "If the company earns ₹1, you're paying ₹180 for it (P/E 180x). That's a lot of faith in the future",
        isPositive: false,
      },
      {
        title: 'Stock Price Swings A Lot',
        description: 'This stock went from ₹165 to ₹45 and back to ₹268 in 3 years. Can you handle that?',
        isPositive: false,
      },
      {
        title: 'Competition Is Intense',
        description: 'Amazon, Swiggy, BigBasket all want to win this market. Winner unclear',
        isPositive: false,
      },
    ],
    verdictRationale: "Eternal is an interesting company to STUDY, but not necessarily to BUY right now for your portfolio. Here's why: It's growing really fast (good!), but it's also priced like everything will go perfectly (risky). Since you already own TCS which is stable, adding Zomato would make your portfolio much more volatile. For now, keep it on your watchlist and learn how to analyze 'growth stocks' using this as a case study. If you decide to buy, keep it small (5% of your portfolio max).",
    positionSizing: 'If you decide to buy, limit to 5% of your portfolio (₹8,300). Your portfolio is too concentrated already.',
    entryGuidance: 'Not recommended as next purchase. Diversify with a stable stock first (like Axis Bank).',
    learningPrompt: "💡 Zomato is a perfect example of a 'Growth Stock' - a company that investors buy for future potential, not current profits. Key concepts to learn: P/S Ratio (Price-to-Sales), TAM (Total Addressable Market), Unit Economics.",
    blindSpotAlert: "You haven't checked the Ownership segment for this stock yet. Interesting insight: FIIs have been increasing stake for 3 quarters - that's often a sign sophisticated investors believe in the story.",
    segments: [
      { id: 'profitability', name: 'Profitability', score: 6.0, weight: 15, status: 'neutral', interpretation: 'Just turned profitable - good sign!' },
      { id: 'financials', name: 'Financial Ratios', score: 7.5, weight: 12, status: 'positive', interpretation: 'No debt, lots of cash - financially safe' },
      { id: 'growth', name: 'Growth', score: 8.5, weight: 12, status: 'positive', interpretation: 'Growing very fast - 70% per year!' },
      { id: 'valuation', name: 'Valuation', score: 4.5, weight: 12, status: 'negative', interpretation: 'Expensive - P/E of 180x is very high' },
      { id: 'price', name: 'Price & Volume', score: 7.0, weight: 8, status: 'positive', interpretation: 'Stock price has gone up a lot recently' },
      { id: 'technical', name: 'Technical', score: 6.5, weight: 5, status: 'neutral', interpretation: 'Chart looks okay (learning concept!)' },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, weight: 8, status: 'positive', interpretation: 'Most analysts say Buy' },
      { id: 'ownership', name: 'Ownership', score: 7.0, weight: 10, status: 'positive', interpretation: 'Big investors buying more shares' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Skip this for now - advanced topic' },
      { id: 'income', name: 'Income Statement', score: 6.5, weight: 10, status: 'neutral', interpretation: 'Revenue growing, profits just starting' },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, weight: 8, status: 'positive', interpretation: 'Healthy finances - no debt!' },
    ],
  },

  // ==================== AXIS BANK ====================
  // Axis Bank × Ankit (Growth) = HOLD
  {
    stockId: 'axisbank',
    profileId: 'ankit',
    overallScore: 6.8,
    verdict: 'HOLD',
    peerRank: 3,
    peerTotal: 5,
    peerGroup: 'Private Banks',
    topSignals: [
      {
        title: 'Loan Book Growth 15% YoY',
        description: "Healthy credit growth; riding India's credit penetration story",
        isPositive: true,
      },
      {
        title: 'Retail Mix Improving',
        description: 'Higher-margin retail loans now 60% of book vs 50% 3 years ago',
        isPositive: true,
      },
      {
        title: 'Digital Leadership',
        description: 'Strong digital adoption; positioned for future banking trends',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Growth Lagging ICICI',
        description: 'Peer ICICI growing faster with better ROE; why settle for #3?',
        isPositive: false,
      },
      {
        title: 'NIM Compression Risk',
        description: 'Rising deposit costs squeezing margins; growth may come at profitability cost',
        isPositive: false,
      },
      {
        title: 'Management Transition',
        description: 'New CEO still proving strategy; execution uncertainty',
        isPositive: false,
      },
    ],
    verdictRationale: "For your growth thesis, Axis Bank is acceptable but not exciting. 15% loan growth is decent but ICICI is delivering 18% with better ROE. At your 3-5 year horizon, the question is: why own #3 when #1 and #2 are available at similar valuations? HOLD if you own, but don't ADD. Your growth capital is better deployed in higher-growth opportunities.",
    positionSizing: 'You already have 25% in Banking. Adding Axis increases concentration to 35%+ in one sector. Consider: Is this the best use of marginal capital?',
    entryGuidance: 'If you must buy, wait for a 10% correction from current levels for better risk-reward.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.5, weight: 10, status: 'positive', interpretation: 'ROE 16.5%, ROA 1.7% - healthy' },
      { id: 'financials', name: 'Financial Ratios', score: 7.0, weight: 8, status: 'positive', interpretation: 'GNPA 1.5%, clean book' },
      { id: 'growth', name: 'Growth', score: 6.5, weight: 20, status: 'neutral', interpretation: '15% loan growth - meets but doesnt exceed' },
      { id: 'valuation', name: 'Valuation', score: 7.5, weight: 10, status: 'positive', interpretation: 'P/B 2.1x reasonable for quality' },
      { id: 'price', name: 'Price & Volume', score: 6.0, weight: 8, status: 'neutral', interpretation: 'Underperforming peers in 12M' },
      { id: 'technical', name: 'Technical', score: 6.0, weight: 8, status: 'neutral', interpretation: 'Range-bound; no clear direction' },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, weight: 6, status: 'positive', interpretation: '65% Buy; avg target ₹1,250' },
      { id: 'ownership', name: 'Ownership', score: 7.0, weight: 8, status: 'positive', interpretation: 'Stable FII holding' },
      { id: 'fno', name: 'Futures & Options', score: 6.5, weight: 5, status: 'neutral', interpretation: 'Neutral OI; no strong signal' },
      { id: 'income', name: 'Income Statement', score: 7.0, weight: 8, status: 'positive', interpretation: 'NII growing but NIM under pressure' },
      { id: 'balance', name: 'Balance Sheet', score: 7.5, weight: 9, status: 'positive', interpretation: 'Well-capitalized; CRAR 18%' },
    ],
  },

  // Axis Bank × Sneha (Value) = BUY
  {
    stockId: 'axisbank',
    profileId: 'sneha',
    overallScore: 7.8,
    verdict: 'BUY',
    peerRank: 2,
    peerTotal: 5,
    peerGroup: 'Private Banks',
    topSignals: [
      {
        title: 'P/B 2.1x vs HDFC 3.8x',
        description: '45% discount to market leader for similar ROE profile; clear margin of safety',
        isPositive: true,
      },
      {
        title: 'Dividend Yield 1.2%',
        description: 'Consistent dividend payer; meets your 1% minimum threshold',
        isPositive: true,
      },
      {
        title: 'Clean Book After Transformation',
        description: 'NPA ratio improved from 5.5% (2020) to 1.5% (2024); worst is behind',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Not the Leader',
        description: 'HDFC Bank has better brand, deeper relationships; Axis is #3 for a reason',
        isPositive: false,
      },
      {
        title: 'Citibank Integration Risk',
        description: "Acquired Citi's India retail; integration execution to be proven",
        isPositive: false,
      },
      {
        title: 'Deposit Franchise Weaker',
        description: "CASA ratio 42% vs HDFC's 48%; funding cost disadvantage",
        isPositive: false,
      },
    ],
    verdictRationale: "For your value thesis, Axis Bank offers what you seek: quality franchise at reasonable price. P/B of 2.1x represents 45% discount to HDFC Bank with comparable ROE (16.5% vs 17%). Clean balance sheet (GNPA 1.5%), consistent dividends (12 years unbroken), and conservative management. The Citi acquisition adds growth optionality. At 5+ year horizon, you're buying ₹1 of book value for ₹2.1 in a business that generates 16%+ returns on that book annually. This is value investing.",
    positionSizing: 'Based on your conservative risk profile and existing 35% Banking exposure, limit additional allocation to 5-7%. This maintains your sectoral discipline while adding quality at reasonable price.',
    entryGuidance: 'Current price offers fair value. Can accumulate at current levels or set limit orders 5% below for better entry.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 8.0, weight: 15, status: 'positive', interpretation: 'ROE 16.5% consistent; quality earnings' },
      { id: 'financials', name: 'Financial Ratios', score: 8.5, weight: 15, status: 'positive', interpretation: 'GNPA 1.5%, provision coverage 70%+' },
      { id: 'growth', name: 'Growth', score: 6.5, weight: 8, status: 'neutral', interpretation: '15% growth - steady, not explosive' },
      { id: 'valuation', name: 'Valuation', score: 8.5, weight: 20, status: 'positive', interpretation: 'P/E 13.5x, P/B 2.1x - margin of safety' },
      { id: 'price', name: 'Price & Volume', score: 6.0, weight: 5, status: 'neutral', interpretation: 'Range-bound; accumulation zone' },
      { id: 'technical', name: 'Technical', score: 6.0, weight: 5, status: 'neutral', interpretation: 'Neutral but you dont weight this' },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, weight: 5, status: 'positive', interpretation: 'Consensus positive' },
      { id: 'ownership', name: 'Ownership', score: 7.5, weight: 12, status: 'positive', interpretation: 'Stable institutional ownership' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Not applicable for your profile' },
      { id: 'income', name: 'Income Statement', score: 7.5, weight: 8, status: 'positive', interpretation: 'Stable NII growth; quality revenue' },
      { id: 'balance', name: 'Balance Sheet', score: 8.5, weight: 12, status: 'positive', interpretation: 'Well-capitalized; conservative provisions' },
    ],
  },

  // Axis Bank × Kavya (Beginner) = BUY
  {
    stockId: 'axisbank',
    profileId: 'kavya',
    overallScore: 7.5,
    verdict: 'BUY',
    peerRank: 3,
    peerTotal: 5,
    peerGroup: 'Private Banks',
    topSignals: [
      {
        title: 'You Know This Brand',
        description: 'You probably have an Axis Bank account or credit card; easier to understand',
        isPositive: true,
      },
      {
        title: 'Stable and Profitable',
        description: 'Making money consistently for 10+ years; not a startup experiment',
        isPositive: true,
      },
      {
        title: 'Diversifies Your Portfolio',
        description: 'You only own TCS (IT). Banking is a different sector with different drivers',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Not the Best Bank',
        description: 'HDFC Bank and ICICI are generally considered better; Axis is #3',
        isPositive: false,
      },
      {
        title: 'Bank Stocks Can Fall in Crises',
        description: 'In 2020 COVID, bank stocks fell 40-50%; more volatile than TCS',
        isPositive: false,
      },
      {
        title: 'Complex Business',
        description: 'Understanding banks requires learning NPA, NIM, CASA - new concepts for you',
        isPositive: false,
      },
    ],
    verdictRationale: "Axis Bank is a GOOD CHOICE for you right now, and here's why: (1) Your portfolio is 100% in IT/TCS - adding a bank gives you diversification, which reduces risk. (2) Axis is a well-known brand you can track in real life. (3) It's not too expensive and pays dividends. Think of it as your first 'value stock' - a solid company at a fair price. Suggested allocation: 15-20% of your portfolio.",
    positionSizing: 'Recommended: 15-20% of your portfolio (₹25,000-33,000). This gives you meaningful exposure while keeping TCS as your core holding.',
    entryGuidance: 'Good time to start. Consider buying in 2-3 parts over 2 months to average your entry price.',
    learningPrompt: "💡 Banks are valued differently than tech companies! Key banking metrics to learn: P/B Ratio (Price to Book - most important for banks), NPA (bad loans), NIM (Net Interest Margin - their profit margin), CASA (cheap deposits).",
    segments: [
      { id: 'profitability', name: 'Profitability', score: 7.5, weight: 15, status: 'positive', interpretation: 'Making good profits consistently' },
      { id: 'financials', name: 'Financial Ratios', score: 8.0, weight: 12, status: 'positive', interpretation: 'Low bad loans (NPA) - healthy bank' },
      { id: 'growth', name: 'Growth', score: 7.0, weight: 12, status: 'positive', interpretation: 'Growing steadily at 15% per year' },
      { id: 'valuation', name: 'Valuation', score: 7.5, weight: 12, status: 'positive', interpretation: 'Reasonably priced - not expensive' },
      { id: 'price', name: 'Price & Volume', score: 6.5, weight: 8, status: 'neutral', interpretation: 'Stock price stable, not volatile' },
      { id: 'technical', name: 'Technical', score: 6.0, weight: 5, status: 'neutral', interpretation: 'Chart looks stable (new concept!)' },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, weight: 8, status: 'positive', interpretation: 'Analysts like this stock' },
      { id: 'ownership', name: 'Ownership', score: 7.0, weight: 10, status: 'positive', interpretation: 'Big investors hold significant stakes' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Skip this - too advanced for now' },
      { id: 'income', name: 'Income Statement', score: 7.5, weight: 10, status: 'positive', interpretation: 'Revenue and profits growing' },
      { id: 'balance', name: 'Balance Sheet', score: 8.0, weight: 8, status: 'positive', interpretation: 'Strong financial position' },
    ],
  },

  // ==================== TCS ====================
  // TCS × Ankit (Growth) = HOLD
  {
    stockId: 'tcs',
    profileId: 'ankit',
    overallScore: 6.5,
    verdict: 'HOLD',
    peerRank: 2,
    peerTotal: 5,
    peerGroup: 'Large Cap IT',
    topSignals: [
      {
        title: 'Best-in-Class Execution',
        description: 'Consistent delivery, lowest attrition, highest client satisfaction',
        isPositive: true,
      },
      {
        title: 'Cash Generation Machine',
        description: 'FCF conversion 100%+; can fund any growth initiative',
        isPositive: true,
      },
      {
        title: 'AI/Cloud Positioning',
        description: 'Early investments in GenAI practice; positioned for next wave',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Revenue Growth 7% YoY',
        description: 'Below your 15% threshold; this is a mature business',
        isPositive: false,
      },
      {
        title: 'Tech Spending Slowdown',
        description: 'US/Europe clients reducing IT budgets; headwind for 12-18 months',
        isPositive: false,
      },
      {
        title: 'Premium Valuation for Slow Growth',
        description: 'P/E 28x for 7% growth; can find better growth/value elsewhere',
        isPositive: false,
      },
    ],
    verdictRationale: "For your growth thesis, TCS is a quality compounder but not a growth stock. Revenue growth of 7% is well below your 15% threshold. The business is mature, the market is cyclically weak, and you're paying P/E 28x for what is essentially a 10-12% earnings grower. This is a 'hold for stability' not a 'buy for growth.' Your growth capital should target companies with 20%+ revenue growth potential.",
    positionSizing: 'You have 40% in IT already. TCS adds concentration, not diversification. If you want IT exposure, consider: Is HCL Tech (faster growth, lower valuation) a better pick?',
    entryGuidance: "Not the right time to add. Wait for either: (1) Price correction to P/E <24x, or (2) Evidence of growth reacceleration above 12%.",
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.5, weight: 10, status: 'positive', interpretation: 'ROE 52% - exceptional quality' },
      { id: 'financials', name: 'Financial Ratios', score: 9.0, weight: 8, status: 'positive', interpretation: 'Zero debt, cash-rich' },
      { id: 'growth', name: 'Growth', score: 5.0, weight: 20, status: 'negative', interpretation: '7% growth - far below your 15% threshold' },
      { id: 'valuation', name: 'Valuation', score: 5.5, weight: 10, status: 'neutral', interpretation: 'P/E 28x premium for low growth' },
      { id: 'price', name: 'Price & Volume', score: 6.0, weight: 8, status: 'neutral', interpretation: 'Underperforming Nifty in 12M' },
      { id: 'technical', name: 'Technical', score: 5.5, weight: 8, status: 'neutral', interpretation: 'Below 200 DMA; weak setup' },
      { id: 'broker', name: 'Broker Ratings', score: 6.5, weight: 6, status: 'neutral', interpretation: 'Mixed; target prices near CMP' },
      { id: 'ownership', name: 'Ownership', score: 8.0, weight: 8, status: 'positive', interpretation: 'Stable Tata holding; FIIs steady' },
      { id: 'fno', name: 'Futures & Options', score: 5.5, weight: 5, status: 'neutral', interpretation: 'Neutral sentiment' },
      { id: 'income', name: 'Income Statement', score: 7.0, weight: 8, status: 'positive', interpretation: 'Stable margins; quality earnings' },
      { id: 'balance', name: 'Balance Sheet', score: 9.0, weight: 9, status: 'positive', interpretation: 'Fortress balance sheet' },
    ],
  },

  // TCS × Sneha (Value) = HOLD
  {
    stockId: 'tcs',
    profileId: 'sneha',
    overallScore: 7.2,
    verdict: 'HOLD',
    peerRank: 3,
    peerTotal: 5,
    peerGroup: 'Large Cap IT',
    topSignals: [
      {
        title: 'Dividend Aristocrat',
        description: '22 years of consecutive dividends; payout ratio 55%+',
        isPositive: true,
      },
      {
        title: 'Zero Debt, Cash Rich',
        description: '₹60,000 Cr cash; fortress balance sheet',
        isPositive: true,
      },
      {
        title: 'Highest Quality in Sector',
        description: 'Best margins, lowest attrition, most stable earnings',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'No Margin of Safety',
        description: 'P/E 28x vs Infosys 23x, HCL 22x; paying 20% premium for quality',
        isPositive: false,
      },
      {
        title: 'Growth Slower than Peers',
        description: 'Infosys and HCL growing faster; premium not justified on growth',
        isPositive: false,
      },
      {
        title: 'Yield Below Threshold',
        description: 'Dividend yield 1.8% decent but FCF yield only 3.5%',
        isPositive: false,
      },
    ],
    verdictRationale: "For your value thesis, TCS is the quality benchmark but not the best value. P/E 28x represents a 20% premium to Infosys (23x) and 25% premium to HCL (22x). While TCS deserves some premium for superior execution, at your 5+ year horizon, the question is: does that 20% premium translate to 20% better returns? Historically, no. HOLD if you own (it's quality), but don't ADD at these prices. Better value exists in Infosys or HCL.",
    positionSizing: 'If you own TCS, hold it for dividend income. Do not add at current prices. Redeploy new capital to better value opportunities.',
    entryGuidance: 'For value entry, wait for P/E to compress to <24x (price around ₹3,500). Current premium reflects no margin of safety.',
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.5, weight: 15, status: 'positive', interpretation: 'ROE 52% - best in class' },
      { id: 'financials', name: 'Financial Ratios', score: 9.0, weight: 15, status: 'positive', interpretation: 'Zero debt, huge cash reserves' },
      { id: 'growth', name: 'Growth', score: 5.5, weight: 8, status: 'neutral', interpretation: '7% growth - stable but slow' },
      { id: 'valuation', name: 'Valuation', score: 5.5, weight: 20, status: 'neutral', interpretation: 'P/E 28x above your 25x threshold' },
      { id: 'price', name: 'Price & Volume', score: 5.5, weight: 5, status: 'neutral', interpretation: 'Range-bound price action' },
      { id: 'technical', name: 'Technical', score: 5.5, weight: 5, status: 'neutral', interpretation: 'Neutral but low weight for you' },
      { id: 'broker', name: 'Broker Ratings', score: 6.5, weight: 5, status: 'neutral', interpretation: 'Hold ratings dominate' },
      { id: 'ownership', name: 'Ownership', score: 8.5, weight: 12, status: 'positive', interpretation: 'Tata promoter stable; institutional quality' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Not applicable for your profile' },
      { id: 'income', name: 'Income Statement', score: 8.0, weight: 8, status: 'positive', interpretation: 'Stable high-quality earnings' },
      { id: 'balance', name: 'Balance Sheet', score: 9.0, weight: 12, status: 'positive', interpretation: 'Best balance sheet in IT' },
    ],
  },

  // TCS × Kavya (Beginner) = STRONG HOLD
  {
    stockId: 'tcs',
    profileId: 'kavya',
    overallScore: 8.0,
    verdict: 'STRONG HOLD',
    peerRank: 1,
    peerTotal: 5,
    peerGroup: 'Large Cap IT',
    topSignals: [
      {
        title: "India's Most Respected Company",
        description: 'Part of Tata Group; excellent corporate governance; safe hands',
        isPositive: true,
      },
      {
        title: 'Pays Regular Dividends',
        description: "You'll receive cash every year (about ₹75 per share) just for holding",
        isPositive: true,
      },
      {
        title: 'Your First Stock is a Winner',
        description: 'TCS is exactly what a "blue chip" means: quality, stability, trust',
        isPositive: true,
      },
    ],
    topConcerns: [
      {
        title: 'Not Growing Fast',
        description: "The company is huge (₹15 lakh crore!); hard to grow fast when you're already big",
        isPositive: false,
      },
      {
        title: 'IT Sector Has Cycles',
        description: 'Sometimes companies reduce IT spending; TCS earnings can be flat for 1-2 years',
        isPositive: false,
      },
      {
        title: "You're Too Concentrated",
        description: 'Having 50% in one stock is risky; even great stocks can fall 30-40%',
        isPositive: false,
      },
    ],
    verdictRationale: "You made a GREAT choice with TCS as your first stock! It's like buying a Toyota - reliable, well-built, holds value. Here's your action plan: KEEP your TCS (don't sell), but DON'T buy more right now. Why? (1) You already have 50% in TCS - that's too much in one stock. (2) It's a bit expensive right now. (3) You need to diversify. Your next step: Add a different sector (like Banking with Axis Bank) to reduce risk.",
    positionSizing: "Do not add more TCS. You already have 100% in this stock. Your next ₹50,000 should go to a different sector.",
    entryGuidance: 'No action needed on TCS. Focus on diversifying into Banking or FMCG sectors next.',
    learningPrompt: "💡 TCS is a perfect example of a 'Blue Chip Quality Stock' - a large, stable, well-managed company. Key concepts you're learning: Dividend Yield (cash you receive), ROE (how efficiently they use shareholder money - TCS is 52%, which is exceptional!).",
    segments: [
      { id: 'profitability', name: 'Profitability', score: 9.0, weight: 15, status: 'positive', interpretation: 'Very profitable - makes lots of money!' },
      { id: 'financials', name: 'Financial Ratios', score: 9.0, weight: 12, status: 'positive', interpretation: 'No debt, lots of cash - super safe' },
      { id: 'growth', name: 'Growth', score: 6.0, weight: 12, status: 'neutral', interpretation: 'Growing slowly - 7% per year' },
      { id: 'valuation', name: 'Valuation', score: 6.5, weight: 12, status: 'neutral', interpretation: 'A bit expensive but quality costs' },
      { id: 'price', name: 'Price & Volume', score: 7.0, weight: 8, status: 'positive', interpretation: "Your stock is up 14% since you bought!" },
      { id: 'technical', name: 'Technical', score: 6.0, weight: 5, status: 'neutral', interpretation: 'Price is stable - not too volatile' },
      { id: 'broker', name: 'Broker Ratings', score: 7.0, weight: 8, status: 'positive', interpretation: 'Analysts think its a good company' },
      { id: 'ownership', name: 'Ownership', score: 8.5, weight: 10, status: 'positive', interpretation: 'Tata Group owns majority - trusted' },
      { id: 'fno', name: 'Futures & Options', score: 0, weight: 0, status: 'neutral', interpretation: 'Skip - too advanced for now' },
      { id: 'income', name: 'Income Statement', score: 8.5, weight: 10, status: 'positive', interpretation: 'Makes money every quarter' },
      { id: 'balance', name: 'Balance Sheet', score: 9.0, weight: 8, status: 'positive', interpretation: 'Strongest finances in IT sector' },
    ],
  },
]

export const getVerdict = (stockId: string, profileId: string): StockVerdict | undefined => {
  return verdicts.find(v => v.stockId === stockId && v.profileId === profileId)
}

export const getVerdictsByProfile = (profileId: string): StockVerdict[] => {
  return verdicts.filter(v => v.profileId === profileId)
}

export const getVerdictsByStock = (stockId: string): StockVerdict[] => {
  return verdicts.filter(v => v.stockId === stockId)
}
