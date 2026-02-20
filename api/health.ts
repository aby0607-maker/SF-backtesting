/**
 * Health-check endpoint — verifies Vercel serverless functions are deploying.
 *
 * Visit /api/health after deployment:
 *   - Returns JSON → functions are working
 *   - Returns HTML or 404 → functions are NOT deploying
 *   - hasToken: false → CMOTS_API_TOKEN env var is missing
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    hasToken: !!process.env.CMOTS_API_TOKEN,
  })
}
