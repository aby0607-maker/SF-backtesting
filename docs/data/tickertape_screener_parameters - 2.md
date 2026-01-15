# StockFox Stock Analysis Framework
## Segments 5-7: Price & Volume, Technical Indicators, Broker Ratings
**Version:** 1.0  
**Last Updated:** January 2025  
**Status:** Comprehensive Parameter Mapping

---

## SEGMENT 5: PRICE & VOLUME ANALYSIS

### Purpose
Evaluates stock liquidity, price momentum, and trading activity to assess market interest and movement trends.

---

### Cluster 5.1: Historical Price Performance

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **5Y CAGR** | Compound Annual Growth Rate over 5 years | Average annual growth rate if profits reinvested each year | Higher = Stronger long-term appreciation; 15-25% CAGR is healthy |
| **1Y Return** | % change in stock price over previous 52 weeks | Annual price movement | Positive = Uptrend; Negative = Downtrend; Compare with Nifty |
| **6M Return** | % change in stock price over previous 26 weeks | Half-yearly momentum | Shows medium-term trend; Use vs Nifty for relative strength |
| **1M Return** | % change in stock price over previous 4 weeks | Monthly momentum | Short-term trend indicator; High volatility possible |
| **Close Price** | Stock price on last trading day | Current market valuation | Reference point for all price-based calculations |
| **Face Value** | Nominal/Par value of stock | Legal capital per share | Historically ₹1-10; Doesn't reflect market value |

**Investment Signal:** 
- ✅ **Positive Setup:** High 5Y CAGR (15%+) + Positive YTD return + Outperforming Nifty
- ⚠️ **Caution:** Negative returns + Price below 52W average
- ❌ **Avoid:** Declining CAGR + Negative momentum on multiple timeframes

---

### Cluster 5.2: Relative Performance vs Benchmark (Nifty)

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **1M Return vs Nifty** | Stock return minus Nifty return (1 month) | Alpha generation in short-term | Positive = Stock outperformed; Negative = Stock lagged |
| **6M Return vs Nifty** | Stock return minus Nifty return (6 months) | Alpha generation in medium-term | Shows if stock is beating market; Positive is good |
| **1Y Return vs Nifty** | Stock return minus Nifty return (1 year) | Alpha generation in long-term | Core performance metric vs benchmark |
| **Percentage from 52W High** | % distance from 52-week peak | Proximity to recent highs | -30% to 0% = Pullback opportunity; <-50% = Significant correction |
| **Percentage from 52W Low** | % distance from 52-week low | Stock strength from recent lows | Higher % = Strong recovery; New highs favorable |

**Investment Signal:**
- ✅ **Positive Setup:** Consistently positive alpha across 1M, 6M, 1Y periods
- ⚠️ **Momentum Play:** Price near 52W high with positive alpha (trending up)
- ❌ **Avoid:** Negative alpha on all timeframes + Falling from 52W high

---

### Cluster 5.3: Volume & Liquidity Analysis

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Daily Volume** | Total shares traded in single day | Trading activity snapshot | Higher = More liquidity; Easier to buy/sell |
| **1M Avg Daily Volume** | Average daily volume over 1 month | Recent liquidity trend | Compare with holdings needed; Avoid illiquid stocks |
| **3M Avg Daily Volume** | Average daily volume over 3 months | Sustained liquidity pattern | Best indicator of true liquidity |
| **1W % Change in Volume** | % change in volume week-over-week | Volume momentum | Increasing = Rising interest; Decreasing = Fading interest |
| **1D % Change in Volume** | % change in volume day-over-day | Volume spike detection | >100% increase = Alert; Could signal reversal |

**Investment Signal:**
- ✅ **Positive Setup:** High 3M avg volume + Increasing volume trend + Positive price movement
- ⚠️ **Volume Spike:** 1D volume >100% normal + Investigate news/catalyst
- ❌ **Avoid:** Very low volume (can't exit positions easily) + Declining volume trend

---

## SEGMENT 6: TECHNICAL INDICATORS ANALYSIS

### Purpose
Identifies price momentum, trends, volatility, and overbought/oversold conditions using mathematical price/volume analysis.

---

### Cluster 6.1: Momentum & Trend Indicators

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **MACD Line 1** | Difference between 12-day & 26-day EMA | Trend direction & strength | Positive = Uptrend; Negative = Downtrend; Magnitude = Strength |
| **MACD Line 2** | MACD - Signal line (9D EMA of MACD) | Trend confirmation signal | Positive MACD2 + Positive MACD1 = Strong uptrend |
| **ADX Rating (14D)** | Average Directional Index (0-100) | Trend strength (not direction) | >25 = Strong trend (up or down); <20 = No clear trend |
| **Super Trend** | Trend-following indicator | Buy/Sell signal from trend | Close above SAR = Bullish; Close below SAR = Bearish |
| **% Price Above 1M SMA** | Price vs 20-day simple moving avg | Short-term momentum | Positive = Above average (bullish); Negative = Below average |
| **% Price Above 12M SMA** | Price vs 250-day simple moving avg | Long-term momentum | Positive = Above long-term trend; Negative = Below trend |
| **% Price Above 1M EMA** | Price vs 20-day exponential moving avg | Recent price trend (weighted) | EMA more responsive than SMA; Shows trend shift faster |

**Investment Signal:**
- ✅ **Positive Setup:** MACD1 positive + ADX >25 + Price above both SMAs + Super Trend bullish
- ⚠️ **Momentum Fade:** Positive MACD1 but MACD2 turning negative = Trend weakening
- ❌ **Avoid:** ADX <20 (sideways market) + MACD negative + Price below both SMAs

---

### Cluster 6.2: Volatility & Price Range Indicators

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Volatility** | Annualized standard deviation of daily price change | Stock price risk/swings | High vol (>30%) = Risky but opportunity; Low vol (<15%) = Stable |
| **Volatility vs Nifty** | Stock volatility minus Nifty volatility | Relative risk to market | Positive = More volatile than market; Negative = Less volatile |
| **1Y Max Loss** | Maximum drawdown in past year | Worst-case scenario | If bought at peak, worst loss possible; Shows downside risk |
| **Beta** | Stock price sensitivity vs market (0-2+) | Systematic risk | Beta >1 = More volatile than market; Beta <1 = Less volatile |
| **% from Upper Bollinger Band** | Price distance from upper volatility band | Overbought condition | Positive % = Above upper band (overbought); Consider profit-taking |
| **% from Lower Bollinger Band** | Price distance from lower volatility band | Oversold condition | Negative % = Below lower band (oversold); Consider buying |
| **% from Parabolic SAR** | Price distance from SAR support/resistance | Breakout potential | Positive = Above SAR (uptrend); Negative = Below SAR (downtrend) |

**Investment Signal:**
- ✅ **Positive Setup:** Low volatility + Beta <1.5 + Price >1M SMA + Not overbought
- ⚠️ **Risk Alert:** High volatility (>40%) + Negative 1Y max loss >50% = High risk
- ❌ **Avoid:** Price above upper Bollinger band (overbought) + Falling ADX (trend weakening)

---

### Cluster 6.3: Oscillator Indicators (Overbought/Oversold)

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **RSI - 14D** | Relative Strength Index (0-100) | Momentum speed & direction | >80 = Overbought (sell signal); <20 = Oversold (buy signal) |
| **RSI Exponential - 14D** | RSI using exponential weighting | RSI more sensitive to recent price | More responsive than simple RSI; Same interpretation |
| **William %R (14D)** | Price position in high-low range (-100 to 0) | Momentum within range | 0 to -20 = Overbought; -80 to -100 = Oversold |
| **Stochastic %K & %D** | Price position relative to recent range | Momentum in different timeframes | K above 80 = Overbought; K below 20 = Oversold |
| **1W Change in OBV** | On-Balance Volume change weekly | Volume-based momentum | Increasing OBV + Price up = Strong uptrend confirmation |
| **1W Change in A/D Line** | Accumulation/Distribution line weekly | Money flow into/out of stock | Positive A/D + Price up = Strong buying; Negative A/D = Selling |

**Investment Signal:**
- ✅ **Positive Setup:** RSI 40-60 (neutral-bullish) + OBV increasing + A/D line positive
- ⚠️ **Reversal Warning:** RSI >80 (overbought) + Price at resistance = Sell pressure likely
- ❌ **Avoid:** RSI <20 + Price still falling = Further downside possible

---

### Cluster 6.4: Moving Average Alignment

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **10D SMA** | 10-day simple moving average | Very short-term trend | Quickest to change; Used for scalpers |
| **50D SMA** | 50-day simple moving average | Medium-term trend | Golden Cross (50D cross above 200D) = Bullish |
| **100D SMA** | 100-day simple moving average | Intermediate trend | Support/resistance level |
| **200D SMA** | 200-day simple moving average | Long-term trend | Major support/resistance; Crosses important |
| **10D EMA** | 10-day exponential moving average | Very short-term (weighted) | More responsive to recent changes |
| **50D EMA** | 50-day exponential moving average | Medium-term (weighted) | Used in trend confirmation |
| **100D EMA** | 100-day exponential moving average | Intermediate (weighted) | Acts as dynamic support |
| **200D EMA** | 200-day exponential moving average | Long-term (weighted) | Major trend indicator |
| **VWAP** | Volume Weighted Average Price | Fair value based on volume | Good to buy below VWAP; Sell above VWAP |

**Investment Signal:**
- ✅ **Positive Setup:** Price > 50D EMA > 200D EMA (all aligned uptrend)
- ⚠️ **Trend Weakness:** Price crossing below 50D EMA from above = Momentum loss
- ❌ **Avoid:** Price below 200D EMA (long-term downtrend) without strong catalyst

---

### Cluster 6.5: Risk-Adjusted Returns

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Alpha** | Excess return vs benchmark (%) | Risk-adjusted outperformance | Positive = Beating market; Negative = Underperforming |
| **Sharpe Ratio** | Excess return per unit of risk | Risk-adjusted performance | Higher = Better risk-adjusted returns; >1 is good |
| **Relative Volume (RVOL)** | 10D avg volume / 90D avg volume | Demand shift | >2 = High demand spike; <0.5 = Low interest |

**Investment Signal:**
- ✅ **Positive Setup:** Positive alpha + Sharpe >1 + RVOL >1.5
- ❌ **Avoid:** Negative alpha + Sharpe <0.5 + RVOL declining

---

## SEGMENT 7: BROKER RATINGS ANALYSIS

### Purpose
Aggregates professional analyst recommendations and price targets to gauge institutional confidence and upside potential.

---

### Cluster 7.1: Analyst Sentiment & Consensus

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Number of Analysts with Buy** | Count of analysts recommending BUY | Breadth of bullish sentiment | Higher = More consensus; 5+ analysts bullish is meaningful |
| **% Buy Recommendations** | Buy/Strong Buy as % of total recommendations | Analyst consensus strength | >60% = Strong buy consensus; 40-60% = Mixed; <40% = Bearish |
| **% Sell Recommendations** | Sell/Strong Sell as % of total recommendations | Bearish sentiment level | >20% = Significant bearish view; Watch for reasons |
| **% Hold Recommendations** | Hold as % of total recommendations | Neutral/Wait-and-see | High % = Analysts uncertain; Look for catalysts |

**Investment Signal:**
- ✅ **Positive Setup:** >60% buy + <10% sell + Analyst coverage increasing
- ⚠️ **Caution:** %Buy declining month-over-month = Sentiment weakening
- ❌ **Avoid:** >30% sell + Buy % declining + Recent downgrades

---

### Cluster 7.2: Price Target & Upside Analysis

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Target Price** | Average analyst price target (6-12 month) | Consensus fair value estimate | Compare to current price for upside/downside |
| **% Upside** | (Target - Current Price) / Current Price | Implied upside from consensus | >15% = Material upside; <5% = Limited upside |
| **% Downside** | (Current Price - Downside Target) / Current Price | Implied downside risk | Shows risk/reward; Negative upside = Value trap |

**Investment Signal:**
- ✅ **Positive Setup:** 15-30% upside + Strong buy consensus + Recent upgrades
- ⚠️ **Caution:** High upside (>30%) but uncertain = Speculative
- ❌ **Avoid:** Negative upside (downside target <current price) + Analysts cutting targets

---

### Cluster 7.3: Analyst Coverage & Credibility

**Parameters in this cluster:**

| Parameter | Definition | What It Means | Interpretation |
|-----------|-----------|---------------|-----------------|
| **Number of Analysts Covering** | Total count of analyst recommendations | Coverage breadth | 10+ = Liquid, well-researched; <3 = Limited coverage (riskier) |
| **Rating Consensus Change** | Trend in analyst sentiment | Direction of conviction shift | Improving = Positive catalyst ahead; Declining = Problems emerging |
| **Target Price Revision Trend** | Direction of target price adjustments | Analyst conviction in thesis | Increasing targets = Bullish shift; Decreasing = Bearish |

**Investment Signal:**
- ✅ **Positive Setup:** 10+ analysts + Targets increasing + Buy consensus above 60%
- ⚠️ **Neutral:** 3-5 analysts + Mixed ratings + No clear trend
- ❌ **Avoid:** <3 analysts covering + Downgrades + Targets falling

---

## INTEGRATED ANALYSIS: SEGMENTS 5-7 FRAMEWORK

### Combined Scoring Model

**How to synthesize all three segments:**

```
BULLISH SIGNAL (Buy Setup):
✓ Price & Volume: 5Y CAGR >15% + Positive alpha + Rising volume
✓ Technical: Price >50D/200D EMA + RSI 40-70 + MACD positive
✓ Broker Ratings: >60% buy + 15%+ upside + Analyst upgrades
→ Action: STRONG BUY

NEUTRAL SIGNAL (Hold/Watch):
~ Price & Volume: Mixed returns + Average volume
~ Technical: Price sideways + ADX <20 + RSI 45-55
~ Broker Ratings: Mixed ratings + 0-10% upside
→ Action: HOLD or WAIT FOR CATALYST

BEARISH SIGNAL (Sell/Avoid):
✗ Price & Volume: Negative CAGR + Declining volume + Below 52W avg
✗ Technical: Price <50D/200D EMA + RSI <30 + MACD negative
✗ Broker Ratings: <40% buy + Negative upside + Downgrades
→ Action: SELL or AVOID
```

---

## SUMMARY INTERPRETATION TABLE

| Aspect | Positive Signal | Neutral/Caution | Negative Signal |
|--------|-----------------|-----------------|-----------------|
| **Price Momentum** | Positive YTD + Beating Nifty | Flat returns + Tracking Nifty | Negative returns + Lagging Nifty |
| **Volume Trend** | Rising volume + High liquidity | Average volume + Stable | Declining volume + Illiquid |
| **Technical Setup** | Above all major SMAs + MACD+ | Crossing SMAs + Mixed signals | Below SMAs + MACD negative |
| **Volatility Risk** | Beta <1.5 + Max loss <40% | Beta 1.5-2 + Max loss 40-60% | High beta + Max loss >60% |
| **Analyst View** | >60% buy + >15% upside | 40-60% buy + 0-15% upside | <40% buy + Negative upside |
| **RSI Condition** | 40-70 (room to rally) | 45-55 (neutral) | <20 or >80 (extreme) |
| **Volume-Price** | OBV rising + Price up | OBV flat + Price flat | OBV declining + Price down |

---

## PRACTICAL APPLICATION

### For Value Investor
- Focus: Price & Volume (Valuation clusters) + Analyst targets (upside potential)
- Key Metrics: CAGR >15%, Upside >20%, Max Loss <30%, Buy %  >50%

### For Growth Investor
- Focus: Momentum (Technical) + Volume trends + Analyst upgrades
- Key Metrics: MACD positive, Price above 200D EMA, Rising volume, Upside >25%

### For Momentum Trader
- Focus: Technical indicators + Volume + Short-term alpha
- Key Metrics: RSI 40-70, MACD positive, Volume spiking, RVOL >1.5

### For Conservative Investor
- Focus: Volatility risk + Long-term trends + Analyst consensus
- Key Metrics: Beta <1, Max loss <25%, >60% buy consensus, Downside risk <10%

---

## KEY TAKEAWAYS

1. **Price & Volume (Segment 5):** Foundation for understanding market interest and price stability
2. **Technical Indicators (Segment 6):** Identify entry/exit points and trend confirmation
3. **Broker Ratings (Segment 7):** External validation and professional consensus check

**Never rely on any single segment alone** - combine all three for comprehensive analysis.

**Best Practice:** 
- ✅ Use segments in priority order: Fundamentals → Technical → Analyst ratings
- ✅ Confirm signals across multiple clusters within each segment
- ✅ Look for alignment between price action, technical setup, and analyst sentiment
- ✅ Use volatility metrics to size positions appropriately

---

**This framework ensures StockFox delivers on its core promise: Institutional-depth analysis (200+ metrics), Transparent reasoning (clear parameter meanings), and Confident decisions (integrated signal framework).**
