/**
 * Vercel Serverless Function — DhanHQ API Proxy
 *
 * Proxies POST requests from /api/dhan/* to https://api.dhan.co/v2/*
 * Adds access-token header from environment variable.
 *
 * This replaces the Vite dev proxy for production deployments.
 * The frontend client always calls /api/dhan/... — in dev the Vite proxy
 * handles it, in production this serverless function does.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

const DHAN_BASE = 'https://api.dhan.co/v2'

// Allowed origins for CORS (same as CMOTS proxy)
const ALLOWED_ORIGINS = [
  'https://stockfox.vercel.app',
  'https://sf-backtesting.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
]

/** Check if an origin is allowed */
function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  if (/^https:\/\/sf-backtesting[a-z0-9-]*\.vercel\.app$/.test(origin)) return true
  return false
}

// Allowed DhanHQ endpoint prefixes (whitelist for security)
const ALLOWED_PREFIXES = [
  '/charts/historical',
  '/charts/intraday',
  '/marketfeed/ltp',
]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // DhanHQ uses POST for chart endpoints
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed — DhanHQ endpoints require POST' })
  }

  const token = process.env.DHAN_ACCESS_TOKEN
  if (!token) {
    console.error('[DhanHQ Proxy] DHAN_ACCESS_TOKEN not configured')
    return res.status(500).json({ error: 'DhanHQ API not configured' })
  }

  // Extract the path after /api/dhan/
  const { path } = req.query
  const dhanPath = Array.isArray(path) ? `/${path.join('/')}` : `/${path}`

  // Security: reject path traversal attempts
  if (dhanPath.includes('..') || dhanPath.includes('//')) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  // Whitelist check
  const isAllowed = ALLOWED_PREFIXES.some(prefix => dhanPath.startsWith(prefix))
  if (!isAllowed) {
    return res.status(403).json({ error: 'Endpoint not allowed' })
  }

  const targetUrl = `${DHAN_BASE}${dhanPath}`

  try {
    console.log(`[DhanHQ Proxy] ${dhanPath} → fetching`)
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'access-token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    console.log(`[DhanHQ Proxy] ${dhanPath} → ${upstream.status}`)

    const contentType = upstream.headers.get('content-type') || 'application/json'
    const body = await upstream.text()

    // CORS: restrict to allowed origins only
    const origin = req.headers?.origin ?? ''
    if (isAllowedOrigin(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
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
    console.error(`[DhanHQ Proxy] Failed to fetch ${dhanPath}:`, error)
    return res.status(502).json({ error: 'Upstream API error' })
  }
}
