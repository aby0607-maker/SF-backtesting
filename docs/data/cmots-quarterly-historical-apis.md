# CMOTS Quarterly Historical APIs

> New endpoints providing deeper historical quarterly data (back to Mar 2018).
> These complement the existing `/api/QuarterlyResults/{cocode}/s` endpoint which only returns ~8 recent quarters.

---

## 1. Quarterly Profit & Loss

| Field | Details |
|-------|---------|
| **Endpoint** | `https://deltastockzapis.cmots.com/api/QuarterlyProfitandLoss/{cocode}/S` |
| **Method** | GET |
| **Auth** | Bearer token in `Authorization` header |
| **Update Frequency** | EOD 11:30 PM, once on trading day |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cocode` | Path | CMOTS Company Code (e.g., 476 for TCS) |
| `type` | Path | `S` = Standalone, `C` = Consolidated |

### Response Columns

| Column | Type | Description |
|--------|------|-------------|
| `COLUMNNAME` | Varchar(100) | Row label |
| `RID` | Int | Row ID |
| `rowno` | Int | Row number (use for metric matching) |
| `Y{YYYY}{MM}` | Int | Value for that quarter |

### Year Columns (25 quarters, Mar 2018 → Mar 2024)

```
Y202403, Y202312, Y202309, Y202306, Y202303,
Y202212, Y202209, Y202206, Y202203,
Y202112, Y202109, Y202106, Y202103,
Y202012, Y202009, Y202006, Y202003,
Y201912, Y201909, Y201906, Y201903,
Y201812, Y201809, Y201806, Y201803
```

### Key Row Numbers (for V4 Scorecard)

| Row | Metric |
|-----|--------|
| 1 | Gross Sales / Income from Operations (Revenue) |
| 14 | Profit from Operations (Operating Profit / EBITDA proxy) |

---

## 2. Quarterly Balance Sheet

| Field | Details |
|-------|---------|
| **Endpoint** | `https://deltastockzapis.cmots.com/api/Quarterlybalancesheet/{cocode}/S` |
| **Method** | GET |
| **Auth** | Bearer token in `Authorization` header |
| **Update Frequency** | EOD 11:30 PM, once on trading day |

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cocode` | Path | CMOTS Company Code |
| `type` | Path | `S` = Standalone, `C` = Consolidated |

### Response Columns

Same structure as Quarterly P&L.

### Year Columns (13 periods, semi-annual, Mar 2018 → Mar 2024)

```
Y202403, Y202309, Y202303,
Y202209, Y202203,
Y202109, Y202103,
Y202009, Y202003,
Y201909, Y201903,
Y201809, Y201803
```

---

## Comparison with Existing Quarterly Endpoints

| Endpoint | Depth | Columns | Use Case |
|----------|-------|---------|----------|
| `/api/QuarterlyResults/{cocode}/s` | ~8 recent quarters | 8 | Current scoring only |
| **`/api/QuarterlyProfitandLoss/{cocode}/S`** | **Mar 2018 → Mar 2024** | **25** | **Historical backtesting** |
| **`/api/Quarterlybalancesheet/{cocode}/S`** | **Mar 2018 → Mar 2024** | **13** | **Historical backtesting** |

## Impact on V4 Backtest Depth

With 25 quarterly P&L columns, the Quarterly Momentum (QM) segment (18% weight) can now be scored from ~mid 2019 onward (need 8 quarters with YoY pairs). This upgrades V4 backtesting from 82% weight (no QM) to **100% weight** starting ~2019.

---

*Added: 2026-03-07*
