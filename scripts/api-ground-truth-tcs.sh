#!/bin/bash
# API Ground-Truth Test — TCS (co_code=476) as of Jan 2, 2026
# Makes one curl call per endpoint and saves raw JSON for analysis

set -euo pipefail

CMOTS_BASE="https://deltastockzapis.cmots.com/api"
CMOTS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI"

INDIANAPI_BASE="https://stock.indianapi.in"
INDIANAPI_KEY="sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY"

CO_CODE=476
OUTDIR="/tmp/tcs-api-dump"
mkdir -p "$OUTDIR"

cmots_get() {
  local name="$1"
  local path="$2"
  echo "[$name] GET ${CMOTS_BASE}${path}"
  curl -s "${CMOTS_BASE}${path}" \
    -H "Authorization: Bearer ${CMOTS_TOKEN}" \
    -H "Content-Type: application/json" \
    --max-time 30 \
    > "${OUTDIR}/${name}.json" 2>&1
  echo "  → Saved ${OUTDIR}/${name}.json ($(wc -c < "${OUTDIR}/${name}.json") bytes)"
}

echo "=== API Ground-Truth Test: TCS (co_code=${CO_CODE}) ==="
echo "=== Output directory: ${OUTDIR} ==="
echo ""

# 1. TTM Data
cmots_get "ttm" "/TTMData/${CO_CODE}/s"

# 2. FinData
cmots_get "findata" "/FinData/${CO_CODE}/s"

# 3. P&L
cmots_get "pnl" "/ProftandLoss/${CO_CODE}/s"

# 4. Balance Sheet
cmots_get "bs" "/BalanceSheet/${CO_CODE}/s"

# 5. Cash Flow
cmots_get "cf" "/CashFlow/${CO_CODE}/s"

# 6. Quarterly Results
cmots_get "quarterly" "/QuarterlyResults/${CO_CODE}/s"

# 7. Shareholding
cmots_get "shareholding" "/Aggregate-Share-Holding/${CO_CODE}"

# 8. OHLCV (6 years)
cmots_get "ohlcv" "/AdjustedPriceChart/bse/${CO_CODE}/2020-01-01/2026-01-02"

# 9. IndianAPI
echo "[indianapi] GET ${INDIANAPI_BASE}/stock?name=TCS"
curl -s "${INDIANAPI_BASE}/stock?name=TCS" \
  -H "X-Api-Key: ${INDIANAPI_KEY}" \
  --max-time 30 \
  > "${OUTDIR}/indianapi.json" 2>&1
echo "  → Saved ${OUTDIR}/indianapi.json ($(wc -c < "${OUTDIR}/indianapi.json") bytes)"

echo ""
echo "=== All endpoints fetched. Analyzing... ==="
echo ""
