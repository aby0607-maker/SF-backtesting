/**
 * CSV Scorecard Parser — Auto-detect metrics, segments, weights, bands from Vishal's CSV format
 *
 * CSV Structure (columns: row headers | stock1 | stock2 | ...):
 *   Section headers: "Financial Score", "Valuation Score", etc.
 *   "Input: <metric>" rows: raw metric values across stocks
 *   "Score: <metric>" rows: scored values (0-100) for each stock
 *   Segment score rows: computed segment scores
 *   "OVERALL COMPOSITE SCORE": final composite per stock
 *   Negative handling matrix: condition → action mapping
 *
 * The parser scans row-by-row and builds a partial ScorecardVersion.
 */

import type {
  ScorecardVersion,
  ScorecardSegment,
  CompositeMetric,
  ScoreBand,
  NegativeHandling,
  NegativeCondition,
  NegativeAction,
  VerdictThreshold,
} from '@/types/scoring'

// ─── Types ───

export interface ParsedCSVResult {
  /** Detected scorecard name (from filename or first cell) */
  name: string
  /** Detected segments with metrics, weights, and bands */
  segments: ParsedSegment[]
  /** Detected composite weights (segment → weight) */
  compositeWeights: Map<string, number>
  /** Detected negative handling rules */
  negativeRules: NegativeHandling[]
  /** Stock names found in columns */
  stockNames: string[]
  /** Summary for user preview */
  summary: {
    metricCount: number
    segmentCount: number
    stockCount: number
    negativeRuleCount: number
    hasBands: boolean
  }
}

export interface ParsedSegment {
  name: string
  id: string
  metrics: ParsedMetric[]
  weight?: number
}

export interface ParsedMetric {
  name: string
  id: string
  /** Raw input values per stock (for band derivation); null means no data */
  inputValues: (number | null)[]
  /** Score values per stock (for band validation); null means no data */
  scoreValues: (number | null)[]
  weight?: number
}

// ─── Constants ───

const SEGMENT_HEADERS = [
  'financial score',
  'valuation score',
  'technical score',
  'quarterly momentum',
  'profitability',
  'growth',
]

const COMPOSITE_MARKERS = [
  'overall composite score',
  'composite score',
  'overall score',
  'total score',
]

const NEGATIVE_CONDITION_MAP: Record<string, NegativeCondition> = {
  'start year negative': 'start_negative',
  'start negative': 'start_negative',
  'end year negative': 'end_negative',
  'end negative': 'end_negative',
  'both years negative': 'both_negative',
  'both negative': 'both_negative',
  'any year negative': 'any_negative',
  'any negative': 'any_negative',
}

const NEGATIVE_ACTION_MAP: Record<string, NegativeAction> = {
  'exclude': 'exclude',
  'score = 0': 'zero',
  'zero': 'zero',
  'cap': 'cap',
  'cap score': 'cap',
  'improvement check': 'improvement_check',
  'special calc': 'special_calc',
  'max score': 'max_score',
  'score = 100': 'max_score',
}

// ─── Main Parser ───

export function parseCSVToScorecard(csvText: string, filename?: string): ParsedCSVResult {
  const rows = parseCSVRows(csvText)
  if (rows.length < 3) {
    return emptyResult(filename)
  }

  // Detect stock names from header row (columns after the first)
  const headerRow = rows[0]
  const stockNames = headerRow.slice(1).filter(h => h.trim().length > 0)

  const result: ParsedCSVResult = {
    name: filename?.replace(/\.csv$/i, '') || 'Uploaded Scorecard',
    segments: [],
    compositeWeights: new Map(),
    negativeRules: [],
    stockNames,
    summary: { metricCount: 0, segmentCount: 0, stockCount: stockNames.length, negativeRuleCount: 0, hasBands: false },
  }

  let currentSegment: ParsedSegment | null = null
  let lastInputMetric: ParsedMetric | null = null

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const label = (row[0] || '').trim()
    const labelLower = label.toLowerCase()

    if (!label) continue

    // Detect segment headers
    if (isSegmentHeader(labelLower)) {
      // Check if this row has score values (it's a segment score row, not a header)
      const values = extractNumericValues(row.slice(1))
      if (values.some(v => v !== null)) {
        // This is the segment score row — try to detect weight from label
        // e.g., "Financial Score (32.5%)" or just "Financial Score"
        const weightMatch = label.match(/\((\d+(?:\.\d+)?)\s*%?\)/)
        if (weightMatch && currentSegment) {
          currentSegment.weight = parseFloat(weightMatch[1]) / 100
        }
      } else {
        // Pure header row — start new segment
        if (currentSegment) {
          result.segments.push(currentSegment)
        }
        currentSegment = {
          name: cleanSegmentName(label),
          id: toId(cleanSegmentName(label)),
          metrics: [],
        }
      }
      continue
    }

    // Detect composite score row
    if (COMPOSITE_MARKERS.some(m => labelLower.includes(m))) {
      // Save current segment
      if (currentSegment) {
        result.segments.push(currentSegment)
        currentSegment = null
      }
      continue
    }

    // Detect "Input: <metric>" rows
    if (labelLower.startsWith('input:')) {
      const metricName = label.replace(/^input:\s*/i, '').trim()
      const values = extractNumericValues(row.slice(1))
      lastInputMetric = {
        name: metricName,
        id: toId(metricName),
        inputValues: values,
        scoreValues: [],
      }
      // Add to current segment or create a default one
      if (!currentSegment) {
        currentSegment = { name: 'Uncategorized', id: 'uncategorized', metrics: [] }
      }
      currentSegment.metrics.push(lastInputMetric)
      continue
    }

    // Detect "Score: <metric>" rows
    if (labelLower.startsWith('score:')) {
      const values = extractNumericValues(row.slice(1))
      if (lastInputMetric) {
        lastInputMetric.scoreValues = values
      }
      continue
    }

    // Detect weight rows like "Weight: 0.20" or "20%"
    if (labelLower.startsWith('weight:') || labelLower.includes('weight')) {
      const weightMatch = label.match(/(\d+(?:\.\d+)?)\s*%?/)
      if (weightMatch && lastInputMetric) {
        const w = parseFloat(weightMatch[1])
        lastInputMetric.weight = w > 1 ? w / 100 : w
      }
      continue
    }

    // Detect negative handling section
    if (labelLower.includes('negative') && labelLower.includes('handling')) {
      // Parse negative handling matrix from subsequent rows
      const negRules = parseNegativeHandlingSection(rows, i + 1)
      result.negativeRules.push(...negRules)
      break // Negative handling is typically at the end
    }
  }

  // Push last segment
  if (currentSegment) {
    result.segments.push(currentSegment)
  }

  // Build summary
  result.summary.segmentCount = result.segments.length
  result.summary.metricCount = result.segments.reduce((sum, s) => sum + s.metrics.length, 0)
  result.summary.negativeRuleCount = result.negativeRules.length
  result.summary.hasBands = result.segments.some(s =>
    s.metrics.some(m => m.inputValues.length > 0 && m.scoreValues.length > 0)
  )

  return result
}

/**
 * Convert parsed CSV result into a ScorecardVersion ready for the store.
 * Score bands are derived from input→score pairs using clustering.
 */
export function parsedResultToScorecard(parsed: ParsedCSVResult): ScorecardVersion {
  const segments: ScorecardSegment[] = parsed.segments.map(ps => {
    const metrics: CompositeMetric[] = ps.metrics.map(pm => ({
      id: pm.id,
      name: pm.name,
      type: 'raw' as const,
      rawMetric: {
        id: pm.id,
        name: pm.name,
        cmots_source: 'ttm',
        cmots_field: pm.id,
        unit: 'number' as const,
        description: `Parsed from CSV: ${pm.name}`,
      },
      scoreBands: deriveBands(pm.inputValues, pm.scoreValues),
      weight: pm.weight,
    }))

    // If no individual weights, distribute equally
    if (metrics.every(m => !m.weight)) {
      const equalWeight = 1 / metrics.length
      metrics.forEach(m => { m.weight = equalWeight })
    }

    return {
      id: ps.id,
      name: ps.name,
      metrics,
      segmentWeight: ps.weight || 1 / parsed.segments.length,
      description: `Parsed from CSV with ${metrics.length} metrics`,
    }
  })

  const compositeFormula = {
    baseSegments: segments.map(s => ({
      segmentId: s.id,
      weight: s.segmentWeight,
    })),
    baseWeight: 1.0,
  }

  // Default verdict thresholds
  const verdictThresholds: VerdictThreshold[] = [
    { minScore: 80, maxScore: 100, verdict: 'Strong Buy', altVerdict: 'Excellent', color: 'text-success-400' },
    { minScore: 65, maxScore: 79, verdict: 'Buy', altVerdict: 'Good', color: 'text-success-400' },
    { minScore: 50, maxScore: 64, verdict: 'Hold', altVerdict: 'Average', color: 'text-warning-400' },
    { minScore: 35, maxScore: 49, verdict: 'Sell', altVerdict: 'Below Average', color: 'text-warning-400' },
    { minScore: 0, maxScore: 34, verdict: 'Strong Sell', altVerdict: 'Poor', color: 'text-destructive-400' },
  ]

  return {
    id: `csv-upload-${Date.now()}`,
    versionInfo: {
      macroVersion: 'CSV',
      microVersion: 1,
      displayVersion: 'CSV.1',
      name: parsed.name,
      description: `Auto-parsed from CSV: ${parsed.summary.metricCount} metrics, ${parsed.summary.segmentCount} segments`,
      sourceReference: 'CSV Upload',
      createdAt: Date.now(),
    },
    segments,
    compositeFormula,
    normalization: { method: 'none' },
    verdictThresholds,
    customFactors: [],
    negativeHandlingRules: parsed.negativeRules,
    verdictDisplayMode: 'action',
  }
}

// ─── Helpers ───

function parseCSVRows(text: string): string[][] {
  const lines = text.split(/\r?\n/)
  return lines.map(line => {
    // Handle quoted fields with commas inside
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        fields.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    fields.push(current.trim())
    return fields
  })
}

function extractNumericValues(cells: string[]): (number | null)[] {
  return cells.map(cell => {
    const cleaned = cell.replace(/[,%]/g, '').trim()
    if (!cleaned || cleaned.toLowerCase() === 'nm' || cleaned.toLowerCase() === 'na' || cleaned === '-') {
      return null
    }
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  })
}

function isSegmentHeader(label: string): boolean {
  return SEGMENT_HEADERS.some(h => label.includes(h))
}

function cleanSegmentName(label: string): string {
  return label
    .replace(/\([\d.]+%?\)/g, '')  // Remove weight annotations
    .replace(/score$/i, 'Score')    // Normalize casing
    .trim()
}

function toId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

/**
 * Derive score bands from input→score pairs.
 * Groups similar scores and finds input thresholds.
 */
function deriveBands(inputs: (number | null)[], scores: (number | null)[]): ScoreBand[] {
  if (inputs.length === 0 || scores.length === 0 || inputs.length !== scores.length) {
    return []
  }

  // Pair and sort by input value; filter out null pairs (missing data)
  const pairs = inputs
    .map((input, i) => ({ input, score: scores[i] }))
    .filter((p): p is { input: number; score: number } =>
      p.input != null && p.score != null
    )
    .sort((a, b) => a.input - b.input)

  if (pairs.length === 0) return []

  // Group by score value
  const scoreGroups = new Map<number, number[]>()
  for (const p of pairs) {
    const rounded = Math.round(p.score / 5) * 5  // Round to nearest 5
    const existing = scoreGroups.get(rounded) || []
    existing.push(p.input)
    scoreGroups.set(rounded, existing)
  }

  // Build bands from groups
  const bands: ScoreBand[] = []
  const sortedScores = [...scoreGroups.entries()].sort((a, b) => b[0] - a[0])

  for (let i = 0; i < sortedScores.length; i++) {
    const [score, inputsInGroup] = sortedScores[i]
    const minInput = Math.min(...inputsInGroup)
    const maxInput = Math.max(...inputsInGroup)

    bands.push({
      min: i === sortedScores.length - 1 ? -Infinity : minInput,
      max: i === 0 ? Infinity : maxInput,
      score,
      label: scoreToBandLabel(score),
      color: scoreToBandColor(score),
    })
  }

  return bands
}

function scoreToBandLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Above Average'
  if (score >= 45) return 'Average'
  if (score >= 30) return 'Below Average'
  return 'Poor'
}

function scoreToBandColor(score: number): string {
  if (score >= 75) return 'text-success-400'
  if (score >= 55) return 'text-teal-400'
  if (score >= 40) return 'text-warning-400'
  return 'text-destructive-400'
}

function parseNegativeHandlingSection(rows: string[][], startIndex: number): NegativeHandling[] {
  const rules: NegativeHandling[] = []

  for (let i = startIndex; i < rows.length; i++) {
    const row = rows[i]
    if (!row[0]?.trim()) continue

    const label = row[0].trim().toLowerCase()

    // Look for rows with metric name + condition + action
    // Format: "MetricName | Start Year Negative | Exclude"
    if (row.length >= 3) {
      const metricName = row[0].trim()
      const conditionStr = row[1]?.trim().toLowerCase()
      const actionStr = row[2]?.trim().toLowerCase()

      const condition = NEGATIVE_CONDITION_MAP[conditionStr]
      const action = NEGATIVE_ACTION_MAP[actionStr]

      if (condition && action) {
        rules.push({
          metricId: toId(metricName),
          condition,
          action,
          description: `${metricName}: ${conditionStr} → ${actionStr}`,
        })
      }
    }

    // Stop if we hit an empty section
    if (label === '' && i > startIndex + 2) break
  }

  return rules
}

function emptyResult(filename?: string): ParsedCSVResult {
  return {
    name: filename?.replace(/\.csv$/i, '') || 'Empty',
    segments: [],
    compositeWeights: new Map(),
    negativeRules: [],
    stockNames: [],
    summary: { metricCount: 0, segmentCount: 0, stockCount: 0, negativeRuleCount: 0, hasBands: false },
  }
}
