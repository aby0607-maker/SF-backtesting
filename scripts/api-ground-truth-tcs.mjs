/**
 * API Ground-Truth Test — TCS as of Jan 2, 2026
 *
 * Makes one call per CMOTS endpoint + IndianAPI to dump actual
 * response structures. Used to determine which of the 196 Tickertape
 * metrics can actually be computed from available data.
 *
 * Usage: node scripts/api-ground-truth-tcs.mjs
 */

const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api';
const CMOTS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6ImRlbHRhc3RvY2t6bGVhcm5pbmdhcGlzIiwicm9sZSI6IkFkbWluIiwibmJmIjoxNzYxOTkyMzE1LCJleHAiOjE3OTQyMTk1MTUsImlhdCI6MTc2MTk5MjMxNSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo1MDE5MSIsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3Q6NTAxOTEifQ.zhW-Z9-sx8u_fyrM7iFH8LM4w-U0vjOiOQrY2M5nztI';

const INDIANAPI_BASE = 'https://stock.indianapi.in';
const INDIANAPI_KEY = 'sk-live-D8pA1iJejpIi5hL83YoRXj0pa9JNoRCDNWHzk8wY';

// TCS CMOTS co_code (confirmed from existing scripts)
const TCS_CO_CODE = 476;

async function cmotsFetch(path) {
  const url = `${CMOTS_BASE}${path}`;
  console.log(`  → GET ${url}`);
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CMOTS_TOKEN}`,
    },
  });
  if (!res.ok) throw new Error(`CMOTS ${path}: HTTP ${res.status} ${res.statusText}`);
  const json = await res.json();
  // Normalize envelope vs raw array
  if (json && typeof json === 'object' && !Array.isArray(json) && 'data' in json) {
    return json.data;
  }
  return json;
}

async function indianapiFetch(path) {
  const url = `${INDIANAPI_BASE}${path}`;
  console.log(`  → GET ${url}`);
  const res = await fetch(url, {
    headers: { 'X-Api-Key': INDIANAPI_KEY },
  });
  if (!res.ok) throw new Error(`IndianAPI ${path}: HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

function printSeparator(title) {
  console.log('\n' + '═'.repeat(70));
  console.log(`  ${title}`);
  console.log('═'.repeat(70));
}

function printStatementRows(data, label) {
  if (!Array.isArray(data) || data.length === 0) {
    console.log(`  [EMPTY or not array]`);
    return;
  }
  // Get year columns
  const sample = data[0];
  const yearCols = Object.keys(sample).filter(k => /^Y\d{6}$/.test(k)).sort();
  console.log(`  Year columns (${yearCols.length}): ${yearCols.join(', ')}`);
  console.log(`  Total rows: ${data.length}`);
  console.log('  ─'.repeat(35));
  console.log(`  ${'Row#'.padEnd(6)} ${'Description'.padEnd(55)} Latest Value`);
  console.log('  ─'.repeat(35));
  for (const row of data) {
    const rowno = row.rowno ?? row.RowNo ?? '?';
    const desc = (row.rowdesc ?? row.RowDesc ?? row.description ?? '').substring(0, 54);
    const latestCol = yearCols[yearCols.length - 1];
    const val = latestCol ? row[latestCol] : '—';
    console.log(`  ${String(rowno).padEnd(6)} ${desc.padEnd(55)} ${val}`);
  }
}

async function main() {
  console.log('API Ground-Truth Test: TCS | As-of Date: Jan 2, 2026');
  console.log('─'.repeat(70));

  // ── 1. Company Master (find TCS) ──
  printSeparator('1. COMPANY MASTER — Confirm TCS co_code');
  try {
    const master = await cmotsFetch('/companymaster');
    const tcs = Array.isArray(master)
      ? master.find(c => (c.nsesymbol || c.NSESymbol || '').toUpperCase() === 'TCS')
      : null;
    if (tcs) {
      console.log(`  Found TCS:`);
      console.log(`    co_code: ${tcs.co_code ?? tcs.CO_CODE}`);
      console.log(`    BSE Code: ${tcs.bsecode ?? tcs.BSECode}`);
      console.log(`    NSE Symbol: ${tcs.nsesymbol ?? tcs.NSESymbol}`);
      console.log(`    Company: ${tcs.companyname ?? tcs.CompanyName}`);
      console.log(`    ISIN: ${tcs.isin ?? tcs.ISIN}`);
      console.log(`    All fields: ${Object.keys(tcs).join(', ')}`);
    } else {
      console.log(`  TCS not found in companymaster. Total records: ${Array.isArray(master) ? master.length : 'N/A'}`);
      // Try searching by name
      if (Array.isArray(master)) {
        const maybe = master.filter(c => JSON.stringify(c).toUpperCase().includes('TCS'));
        console.log(`  Partial matches containing "TCS": ${maybe.length}`);
        if (maybe.length > 0) console.log(`  First match keys: ${Object.keys(maybe[0]).join(', ')}`);
        if (maybe.length > 0) console.log(`  First match: ${JSON.stringify(maybe[0]).substring(0, 300)}`);
      }
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 2. TTM Data ──
  printSeparator('2. TTM DATA — Trailing Twelve Month Ratios');
  try {
    const ttm = await cmotsFetch(`/TTMData/${TCS_CO_CODE}/s`);
    const record = Array.isArray(ttm) ? ttm[0] : ttm;
    if (record) {
      const fields = Object.keys(record);
      console.log(`  Total fields: ${fields.length}`);
      console.log(`  All fields: ${fields.join(', ')}`);
      console.log('  ─'.repeat(35));
      console.log('  Key field values:');
      for (const [k, v] of Object.entries(record)) {
        if (v !== null && v !== undefined && v !== '' && v !== 0) {
          console.log(`    ${k}: ${v}`);
        }
      }
    } else {
      console.log('  [No data returned]');
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 3. FinData (Yearly) ──
  printSeparator('3. FINDATA — Yearly Financial Metrics');
  try {
    const fin = await cmotsFetch(`/FinData/${TCS_CO_CODE}/s`);
    if (Array.isArray(fin) && fin.length > 0) {
      console.log(`  Total records (years): ${fin.length}`);
      console.log(`  Fields: ${Object.keys(fin[0]).join(', ')}`);
      console.log('  ─'.repeat(35));
      for (const row of fin) {
        console.log(`  Year ${row.yrc ?? row.YRC ?? '?'}: ${JSON.stringify(row).substring(0, 200)}`);
      }
    } else {
      console.log('  [No data or not array]');
      console.log(`  Raw: ${JSON.stringify(fin).substring(0, 500)}`);
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 4. P&L Statement ──
  printSeparator('4. P&L STATEMENT — All Rows');
  try {
    const pnl = await cmotsFetch(`/ProftandLoss/${TCS_CO_CODE}/s`);
    printStatementRows(pnl, 'P&L');
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 5. Balance Sheet ──
  printSeparator('5. BALANCE SHEET — All Rows');
  try {
    const bs = await cmotsFetch(`/BalanceSheet/${TCS_CO_CODE}/s`);
    printStatementRows(bs, 'Balance Sheet');
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 6. Cash Flow ──
  printSeparator('6. CASH FLOW — All Rows');
  try {
    const cf = await cmotsFetch(`/CashFlow/${TCS_CO_CODE}/s`);
    printStatementRows(cf, 'Cash Flow');
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 7. Quarterly Results ──
  printSeparator('7. QUARTERLY RESULTS — All Rows');
  try {
    const qr = await cmotsFetch(`/QuarterlyResults/${TCS_CO_CODE}/s`);
    printStatementRows(qr, 'Quarterly');
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 8. Shareholding ──
  printSeparator('8. SHAREHOLDING — All Quarters');
  try {
    const sh = await cmotsFetch(`/Aggregate-Share-Holding/${TCS_CO_CODE}`);
    if (Array.isArray(sh) && sh.length > 0) {
      console.log(`  Total quarters: ${sh.length}`);
      console.log(`  Fields: ${Object.keys(sh[0]).join(', ')}`);
      console.log('  ─'.repeat(35));
      // Show all quarters
      for (const q of sh) {
        console.log(`  Quarter ${q.YRC ?? q.yrc ?? '?'}: ${JSON.stringify(q).substring(0, 300)}`);
      }
    } else {
      console.log('  [No data or not array]');
      console.log(`  Raw: ${JSON.stringify(sh).substring(0, 500)}`);
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 9. OHLCV Price Data (6 years for 5Y averages + technicals) ──
  printSeparator('9. OHLCV PRICE DATA — 6Y History');
  try {
    const ohlcv = await cmotsFetch(`/AdjustedPriceChart/bse/${TCS_CO_CODE}/2020-01-01/2026-01-02`);
    if (Array.isArray(ohlcv) && ohlcv.length > 0) {
      console.log(`  Total data points: ${ohlcv.length}`);
      console.log(`  Fields: ${Object.keys(ohlcv[0]).join(', ')}`);
      console.log(`  Date range: ${ohlcv[0].Tradedate ?? ohlcv[0].tradedate} → ${ohlcv[ohlcv.length - 1].Tradedate ?? ohlcv[ohlcv.length - 1].tradedate}`);
      console.log('  Sample record (first):');
      console.log(`    ${JSON.stringify(ohlcv[0])}`);
      console.log('  Sample record (last):');
      console.log(`    ${JSON.stringify(ohlcv[ohlcv.length - 1])}`);
      // Check for volume field
      const hasVolume = 'TotalVolume' in ohlcv[0] || 'Volume' in ohlcv[0] || 'volume' in ohlcv[0];
      console.log(`  Has volume data: ${hasVolume}`);
    } else {
      console.log('  [No data or not array]');
      console.log(`  Raw (first 500 chars): ${JSON.stringify(ohlcv).substring(0, 500)}`);
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  // ── 10. IndianAPI Fallback ──
  printSeparator('10. INDIANAPI — Fundamental Data Fallback');
  try {
    const ia = await indianapiFetch('/stock?name=TCS');
    if (ia && typeof ia === 'object') {
      const topKeys = Object.keys(ia);
      console.log(`  Top-level keys (${topKeys.length}): ${topKeys.join(', ')}`);
      console.log('  ─'.repeat(35));
      for (const key of topKeys) {
        const val = ia[key];
        if (Array.isArray(val)) {
          console.log(`  ${key}: Array[${val.length}]`);
          if (val.length > 0 && typeof val[0] === 'object') {
            console.log(`    Fields: ${Object.keys(val[0]).join(', ')}`);
            console.log(`    Sample: ${JSON.stringify(val[0]).substring(0, 200)}`);
          }
        } else if (val && typeof val === 'object') {
          const subKeys = Object.keys(val);
          console.log(`  ${key}: Object with ${subKeys.length} keys: ${subKeys.slice(0, 15).join(', ')}${subKeys.length > 15 ? '...' : ''}`);
          // If it has sub-objects, show first few
          for (const sk of subKeys.slice(0, 3)) {
            const sv = val[sk];
            if (typeof sv === 'object' && sv !== null) {
              console.log(`    ${sk}: ${JSON.stringify(sv).substring(0, 150)}`);
            } else {
              console.log(`    ${sk}: ${sv}`);
            }
          }
        } else {
          console.log(`  ${key}: ${JSON.stringify(val).substring(0, 100)}`);
        }
      }
    }
  } catch (e) {
    console.log(`  ERROR: ${e.message}`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('  DONE — All endpoints tested');
  console.log('═'.repeat(70));
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
