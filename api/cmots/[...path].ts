/**
 * Vercel Serverless Function — CMOTS API Proxy
 *
 * Proxies requests from /api/cmots/* to https://deltastockzapis.cmots.com/api/*
 * Adds Bearer auth token from environment variable.
 *
 * This replaces the Vite dev proxy for production deployments.
 * The frontend client always calls /api/cmots/... — in dev the Vite proxy
 * handles it, in production this serverless function does.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const CMOTS_BASE = 'https://deltastockzapis.cmots.com/api'

// Allowed origins for CORS (restrict API proxy access)
const ALLOWED_ORIGINS = [
  'https://stockfox.vercel.app',
  'https://sf-backtesting.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

// Allowed CMOTS endpoint prefixes (whitelist for security)
const ALLOWED_PREFIXES = [
  '/companymaster',
  '/CompanyProfile',
  '/CompanyBackground',
  '/TTMData',
  '/FinData',
  '/ProftandLoss',
  '/BalanceSheet',
  '/CashFlow',
  '/QuarterlyResults',
  '/AdjustedPriceChart',
  '/Aggregate-Share-Holding',
  '/ShareHoldingPatternDetailed',
  '/ShareholdingMorethanOnePercent',
  '/BSEDelayedPriceFeed',
  '/BSEAnnouncement',
  '/NSEAnnouncement',
  '/Exchange-Holidays',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const token = process.env.CMOTS_API_TOKEN
  if (!token) {
    console.error('[CMOTS Proxy] CMOTS_API_TOKEN not configured')
    return res.status(500).json({ error: 'API not configured' })
  }

  // Extract the path after /api/cmots/
  const { path } = req.query
  const cmotPath = Array.isArray(path) ? `/${path.join('/')}` : `/${path}`

  // Security: reject path traversal attempts
  if (cmotPath.includes('..') || cmotPath.includes('//')) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  // Whitelist check
  const isAllowed = ALLOWED_PREFIXES.some(prefix => cmotPath.startsWith(prefix))
  if (!isAllowed) {
    return res.status(403).json({ error: 'Endpoint not allowed' })
  }

  const targetUrl = `${CMOTS_BASE}${cmotPath}`

  try {
    console.log(`[CMOTS Proxy] ${cmotPath} → fetching`)
    const upstream = await fetch(targetUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log(`[CMOTS Proxy] ${cmotPath} → ${upstream.status}`)

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const body = await upstream.text()

    // CORS: restrict to allowed origins only
    const origin = req.headers?.origin ?? ''
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET')
    res.setHeader('Content-Type', contentType)

    // Security headers
    res.setHeader('X-Frame-Options', 'SAMEORIGIN')
    res.setHeader('X-Content-Type-Options', 'nosniff')

    // Cache successful responses for 5 minutes at CDN level
    if (upstream.ok) {
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    }

    return res.status(upstream.status).send(body)
  } catch (error) {
    console.error(`[CMOTS Proxy] Failed to fetch ${cmotPath}:`, error)
    return res.status(502).json({ error: 'Upstream API error' })
  }
}
