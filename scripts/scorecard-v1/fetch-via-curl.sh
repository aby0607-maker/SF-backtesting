#!/bin/bash
# Fetch all CMOTS + IndianAPI data for a stock using curl
# Usage: bash scripts/scorecard-v1/fetch-via-curl.sh <co_code> <nse_symbol> <statement_type>

CO_CODE="${1:-5400}"
SYMBOL="${2:-TCS}"
STMT="${3:-c}"  # c=consolidated, s=standalone

CMOTS_BASE="https://deltastockzapis.cmots.com/api"
CMOTS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI"

INDIANAPI_BASE="https://stock.indianapi.in"
INDIANAPI_KEY="sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY"

CACHE_DIR="data/api-cache/${CO_CODE}"
mkdir -p "$CACHE_DIR"

echo "═══════════════════════════════════════════════════"
echo "  Fetching data: co_code=${CO_CODE} symbol=${SYMBOL} type=${STMT}"
echo "═══════════════════════════════════════════════════"

fetch_cmots() {
  local name="$1"
  local path="$2"
  echo -n "  ${name}... "
  local url="${CMOTS_BASE}${path}"
  local http_code
  http_code=$(curl -s -w "%{http_code}" --connect-timeout 20 --max-time 120 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${CMOTS_TOKEN}" \
    -o "${CACHE_DIR}/${name}.json" \
    "$url")
  if [ "$http_code" = "200" ]; then
    local size=$(wc -c < "${CACHE_DIR}/${name}.json")
    echo "OK (${size} bytes)"
  else
    echo "FAILED (HTTP ${http_code})"
  fi
  sleep 1  # rate limit
}

# CMOTS endpoints
fetch_cmots "ttm" "/TTMData/${CO_CODE}/${STMT}"
fetch_cmots "findata" "/FinData/${CO_CODE}/${STMT}"
fetch_cmots "pnl" "/ProftandLoss/${CO_CODE}/${STMT}"
fetch_cmots "bs" "/BalanceSheet/${CO_CODE}/${STMT}"
fetch_cmots "cf" "/CashFlow/${CO_CODE}/${STMT}"
fetch_cmots "quarterly" "/QuarterlyResults/${CO_CODE}/${STMT}"
fetch_cmots "shareholding" "/Aggregate-Share-Holding/${CO_CODE}"
fetch_cmots "ohlcv" "/AdjustedPriceChart/bse/${CO_CODE}/2020-01-01/2026-03-04"

# IndianAPI
echo -n "  indianapi... "
http_code=$(curl -s -w "%{http_code}" --connect-timeout 20 --max-time 60 \
  -H "X-Api-Key: ${INDIANAPI_KEY}" \
  -o "${CACHE_DIR}/indianapi.json" \
  "${INDIANAPI_BASE}/stock?name=${SYMBOL}")
if [ "$http_code" = "200" ]; then
  size=$(wc -c < "${CACHE_DIR}/indianapi.json")
  echo "OK (${size} bytes)"
else
  echo "FAILED (HTTP ${http_code})"
fi

# Save company record
if [ -f /tmp/tcs-company.json ]; then
  cp /tmp/tcs-company.json "${CACHE_DIR}/company.json"
fi

# Save meta
cat > "${CACHE_DIR}/meta.json" << METAEOF
{
  "co_code": ${CO_CODE},
  "symbol": "${SYMBOL}",
  "companyName": "Tata Consultancy Services Ltd",
  "bseCode": "532540",
  "statementType": "$([ "$STMT" = "c" ] && echo "consolidated" || echo "standalone")",
  "fetchDate": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "endpointsFetched": 9
}
METAEOF

echo ""
echo "  Cache dir: ${CACHE_DIR}"
echo "  Files:"
ls -lh "${CACHE_DIR}/"
echo "═══════════════════════════════════════════════════"
echo "  DONE"
echo "═══════════════════════════════════════════════════"
