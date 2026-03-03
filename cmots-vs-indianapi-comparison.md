
── ANNUAL P&L COMPARISON ──
Metric                    FY                  CMOTS    IndianAPI   Diff %
----------------------------------------------------------------------
Revenue/Sales             Mar 2021           135963       164177   -17.2%
Revenue/Sales             Mar 2022           160341       191754   -16.4%
Revenue/Sales             Mar 2023           190354       225458   -15.6%
Revenue/Sales             Mar 2024           202359       240893   -16.0%
Revenue/Sales             Mar 2025           214853       255324   -15.9%

Operating Profit          Mar 2021            45710        46546    -1.8%
Operating Profit          Mar 2022            53731        53057     1.3%
Operating Profit          Mar 2023            56325        59259    -5.0%
Operating Profit          Mar 2024            63120        64296    -1.8%
Operating Profit          Mar 2025            67571        67407     0.2%

Other Income              Mar 2021             5400         1916   181.8%
Other Income              Mar 2022             7486         4018    86.3%
Other Income              Mar 2023             5328         3449    54.5%
Other Income              Mar 2024             7273         3464   110.0%
Other Income              Mar 2025             9642         3962   143.4%

PBT                       Mar 2021            40902        43760    -6.5%
PBT                       Mar 2022            49723        51687    -3.8%
PBT                       Mar 2023            51690        56907    -9.2%
PBT                       Mar 2024            57602        61997    -7.1%
PBT                       Mar 2025            62648        65331    -4.1%

PAT/Net Profit            Mar 2021            30960        32562    -4.9%
PAT/Net Profit            Mar 2022            38187        38449    -0.7%
PAT/Net Profit            Mar 2023            39106        42303    -7.6%
PAT/Net Profit            Mar 2024            43559        46099    -5.5%
PAT/Net Profit            Mar 2025            48057        48797    -1.5%

EPS Basic                 Mar 2021            82.78        87.67    -5.6%
EPS Basic                 Mar 2022           103.24       104.75    -1.4%
EPS Basic                 Mar 2023           106.87       115.19    -7.2%
EPS Basic                 Mar 2024           119.44       126.88    -5.9%
EPS Basic                 Mar 2025           132.83        134.2    -1.0%


── BALANCE SHEET COMPARISON ──
Metric                    FY                  CMOTS    IndianAPI   Diff %
----------------------------------------------------------------------
Fixed Assets              Mar 2021            16059        21021   -23.6%
Fixed Assets              Mar 2022            16524        21298   -22.4%
Fixed Assets              Mar 2023            15690        20515   -23.5%
Fixed Assets              Mar 2024            14953        19604   -23.7%
Fixed Assets              Mar 2025            16825        23053   -27.0%

Total Shareholders Fund   Mar 2021            74794        86433   -13.5%
Total Shareholders Fund   Mar 2022            77173        89139   -13.4%
Total Shareholders Fund   Mar 2023            74538        90424   -17.6%
Total Shareholders Fund   Mar 2024            72120        90489   -20.3%
Total Shareholders Fund   Mar 2025            75617        94756   -20.2%

LT Borrowings             Mar 2021             5077         7795   -34.9%
LT Borrowings             Mar 2022                0         7818  -100.0%
LT Borrowings             Mar 2023                0         7688  -100.0%
LT Borrowings             Mar 2024                0         8021  -100.0%
LT Borrowings             Mar 2025                0         9392  -100.0%


── CASH FLOW COMPARISON ──
Metric                    FY                  CMOTS    IndianAPI   Diff %
----------------------------------------------------------------------
OCF                       Mar 2021            33822        38802   -12.8%
OCF                       Mar 2022            36127        39949    -9.6%
OCF                       Mar 2023            37029        41965   -11.8%
OCF                       Mar 2024            39142        44338   -11.7%
OCF                       Mar 2025            40816        48908   -16.5%

================================================================================
  DATA DEPTH COMPARISON
================================================================================

  CMOTS Annual Data:
    P&L years: 5 (Y202103, Y202203, Y202303, Y202403, Y202503)
    FinData years: 5
    Quarterly: 8 quarters (Y202403 to Y202512)
    Price: NOT checked (known issue: no historical data before ~2022)

  IndianAPI Annual Data:
    P&L years: 12 (Mar 2014 to Mar 2025)
    BS years: 13 (Mar 2014 to Sep 2025)
    CashFlow years: 12 (Mar 2014 to Mar 2025)
    Quarterly: 13 quarters (Dec 2022 to Dec 2025)
    Price history: weekly, up to 20+ years (max period covers from 2005)
    Historical PE/PB/EV: weekly, 10+ years

================================================================================
  KEY FINDINGS
================================================================================

  1. STANDALONE vs CONSOLIDATED:
     - CMOTS serves STANDALONE financial statements
     - IndianAPI serves CONSOLIDATED financial statements
     - Revenue gap: ~16-17% (standalone < consolidated)
     - PAT gap: ~2-7%, EPS gap: ~1-7%
     - For equity analysis, CONSOLIDATED is the standard (SEBI mandated)

  2. DATA DEPTH:
     - CMOTS: ~5 most recent fiscal years only (rolling window)
     - IndianAPI: 12+ fiscal years (back to Mar 2014)
     - CMOTS quarterly: 8 most recent quarters only
     - IndianAPI quarterly: 13+ quarters
     - CMOTS historical prices: UNAVAILABLE before ~2022
     - IndianAPI historical prices: weekly from 2005 (20+ years)
     - IndianAPI historical PE/PB/EV: weekly from 2016 (10 years)

  3. RELIABILITY:
     - Both APIs return internally consistent numbers
     - The differences are due to standalone vs consolidated, not errors
     - IndianAPI data source appears to be Screener.in / MoneyControl
     - CMOTS data source is CMOTS/CapitalMarket database

  4. V4 SCORECARD BACKTESTING IMPLICATIONS:
     - IndianAPI has sufficient data depth for 2021 backtesting
       (12+ years of annual data, 20+ years of prices)
     - CMOTS does NOT have sufficient data for 2021 backtesting
       (only 5 recent years, no historical prices)
     - IndianAPI provides pre-computed PE/PB/EV time series
       (eliminates need to manually compute from EPS + price)

