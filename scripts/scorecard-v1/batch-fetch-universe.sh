#!/bin/bash
# Batch-fetch CMOTS + IndianAPI data for all stocks in the universe
# Usage: bash scripts/scorecard-v1/batch-fetch-universe.sh [--skip-existing] [--parallel N]
#
# Reads data/nifty50-universe.json, fetches 9 endpoints per stock.
# Saves to data/api-cache/{co_code}/

set -uo pipefail
# Note: not using -e since some endpoints may return empty/error and we want to continue

CMOTS_BASE="https://deltastockzapis.cmots.com/api"
CMOTS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI"

INDIANAPI_BASE="https://stock.indianapi.in"
INDIANAPI_KEY="sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY"

UNIVERSE_FILE="data/nifty50-universe.json"
STMT="c"  # consolidated
SKIP_EXISTING=false
DATE_FROM="2020-01-01"
DATE_TO="2026-03-04"

for arg in "$@"; do
  case $arg in
    --skip-existing) SKIP_EXISTING=true ;;
  esac
done

if [ ! -f "$UNIVERSE_FILE" ]; then
  echo "ERROR: Universe file not found: $UNIVERSE_FILE"
  exit 1
fi

TOTAL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$UNIVERSE_FILE','utf8')).stocks.length)")
echo "═══════════════════════════════════════════════════════════"
echo "  BATCH FETCH — ${TOTAL} stocks, consolidated statements"
echo "═══════════════════════════════════════════════════════════"

fetch_cmots() {
  local co_code="$1"
  local name="$2"
  local path="$3"
  local outfile="$4"

  local http_code
  http_code=$(curl -s -w "%{http_code}" --connect-timeout 20 --max-time 120 \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${CMOTS_TOKEN}" \
    -o "$outfile" \
    "${CMOTS_BASE}${path}" 2>/dev/null)

  if [ "$http_code" = "200" ]; then
    local size=$(wc -c < "$outfile" 2>/dev/null || echo 0)
    if [ "$size" -lt 50 ]; then
      echo "    ${name}: EMPTY (${size}b)"
      return 1
    fi
    return 0
  else
    echo "    ${name}: FAILED (HTTP ${http_code})"
    return 1
  fi
}

fetch_stock() {
  local co_code="$1"
  local symbol="$2"
  local company_name="$3"
  local idx="$4"

  local cache_dir="data/api-cache/${co_code}"

  if [ "$SKIP_EXISTING" = true ] && [ -f "${cache_dir}/meta.json" ]; then
    echo "  [${idx}/${TOTAL}] ${symbol} (${co_code}) — SKIPPED (cached)"
    return 0
  fi

  mkdir -p "$cache_dir"
  echo -n "  [${idx}/${TOTAL}] ${symbol} (${co_code})..."

  local ok=0
  local fail=0

  # CMOTS endpoints (8)
  for ep in "ttm|/TTMData/${co_code}/${STMT}" \
            "findata|/FinData/${co_code}/${STMT}" \
            "pnl|/ProftandLoss/${co_code}/${STMT}" \
            "bs|/BalanceSheet/${co_code}/${STMT}" \
            "cf|/CashFlow/${co_code}/${STMT}" \
            "quarterly|/QuarterlyResults/${co_code}/${STMT}" \
            "shareholding|/Aggregate-Share-Holding/${co_code}" \
            "ohlcv|/AdjustedPriceChart/bse/${co_code}/${DATE_FROM}/${DATE_TO}"; do
    IFS='|' read -r name path <<< "$ep"
    if fetch_cmots "$co_code" "$name" "$path" "${cache_dir}/${name}.json"; then
      ok=$((ok + 1))
    else
      fail=$((fail + 1))
    fi
    sleep 0.5  # rate limit
  done

  # IndianAPI
  local ia_code
  ia_code=$(curl -s -w "%{http_code}" --connect-timeout 20 --max-time 60 \
    -H "X-Api-Key: ${INDIANAPI_KEY}" \
    -o "${cache_dir}/indianapi.json" \
    "${INDIANAPI_BASE}/stock?name=${symbol}" 2>/dev/null)
  if [ "$ia_code" = "200" ]; then
    ok=$((ok + 1))
  else
    fail=$((fail + 1))
  fi

  # Save meta
  cat > "${cache_dir}/meta.json" << METAEOF
{
  "co_code": ${co_code},
  "symbol": "${symbol}",
  "companyName": "${company_name}",
  "statementType": "consolidated",
  "fetchDate": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "endpointsFetched": ${ok},
  "endpointsFailed": ${fail}
}
METAEOF

  echo " OK (${ok}/9 endpoints)"
}

# Parse universe and fetch each stock
node -e "
const u = JSON.parse(require('fs').readFileSync('$UNIVERSE_FILE','utf8'))
u.stocks.forEach((s, i) => {
  // Escape single quotes in company names
  const name = (s.name || '').replace(/'/g, '')
  console.log(s.co_code + '|' + s.symbol + '|' + name + '|' + (i+1))
})
" | while IFS='|' read -r co_code symbol name idx; do
  fetch_stock "$co_code" "$symbol" "$name" "$idx"
done

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "  BATCH FETCH COMPLETE"
echo "  Cache: data/api-cache/"
echo "═══════════════════════════════════════════════════════════"
