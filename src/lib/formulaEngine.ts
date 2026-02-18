/**
 * Formula Engine — Evaluates composite metric formulas
 *
 * Handles formulas like "OCF / EBITDA", "Revenue - COGS",
 * "average(ROE, ROCE, ROA)" with null-safe evaluation.
 */

import type { MetricFormula, FormulaOperator } from '@/types/scoring'

/**
 * Evaluate a formula given raw data values.
 * Returns null if any required input is missing.
 */
export function evaluateFormula(
  formula: MetricFormula,
  rawData: Record<string, number | null>
): number | null {
  // Resolve all input values
  const values: number[] = []
  for (const input of formula.inputs) {
    const val = rawData[input.id]
    if (val == null) return null  // Null-safe: any missing input → null result
    values.push(val)
  }

  if (values.length === 0) return null

  return applyOperator(formula.operator, values)
}

/**
 * Apply an operator to an array of values.
 *
 * Multi-input semantics (3+ inputs):
 *   add:      a + b + c          (commutative sum)
 *   subtract: a - b - c          (left-to-right, e.g. [10, 3, 2] → 5)
 *   multiply: a × b × c          (commutative product)
 *   divide:   a / (b × c)        (first input divided by product of rest, e.g. [10, 2, 5] → 1)
 *   average:  (a + b + c) / 3    (arithmetic mean)
 *   max/min:  standard max/min
 */
function applyOperator(operator: FormulaOperator, values: number[]): number | null {
  if (values.length === 0) return null

  switch (operator) {
    case 'add':
      return values.reduce((a, b) => a + b, 0)

    case 'subtract':
      // Left-to-right: [a, b, c] → ((a - b) - c)
      return values.reduce((a, b) => a - b)

    case 'multiply':
      return values.reduce((a, b) => a * b, 1)

    case 'divide': {
      // First input / product of remaining: [a, b, c] → a / (b × c)
      if (values.length < 2) return null
      const [numerator, ...denominators] = values
      const denominator = denominators.reduce((a, b) => a * b, 1)
      if (denominator === 0) return null  // Guard division by zero
      return numerator / denominator
    }

    case 'average': {
      const sum = values.reduce((a, b) => a + b, 0)
      return sum / values.length
    }

    case 'max':
      return Math.max(...values)

    case 'min':
      return Math.min(...values)

    default:
      console.warn(`[FormulaEngine] Unknown operator '${operator}' — returning null`)
      return null
  }
}

/**
 * Validate a formula definition.
 * Returns validation result with errors if any.
 */
export function validateFormula(
  formula: MetricFormula
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!formula.id) errors.push('Formula must have an ID')
  if (!formula.name) errors.push('Formula must have a name')
  if (!formula.inputs || formula.inputs.length === 0) {
    errors.push('Formula must have at least one input metric')
  }

  // Operator-specific validation
  switch (formula.operator) {
    case 'divide':
      if (formula.inputs.length < 2) {
        errors.push('Divide requires at least 2 inputs (numerator and denominator)')
      }
      break
    case 'subtract':
      if (formula.inputs.length < 2) {
        errors.push('Subtract requires at least 2 inputs')
      }
      break
  }

  return { valid: errors.length === 0, errors }
}

/**
 * Generate a human-readable description of a formula.
 * e.g., "OCF / EBITDA" or "average(ROE, ROCE, ROA)"
 */
export function describeFormula(formula: MetricFormula): string {
  const inputNames = formula.inputs.map(i => i.name)

  switch (formula.operator) {
    case 'add':
      return inputNames.join(' + ')
    case 'subtract':
      return inputNames.join(' - ')
    case 'multiply':
      return inputNames.join(' × ')
    case 'divide':
      return inputNames.join(' / ')
    case 'average':
      return `average(${inputNames.join(', ')})`
    case 'max':
      return `max(${inputNames.join(', ')})`
    case 'min':
      return `min(${inputNames.join(', ')})`
    default:
      return inputNames.join(` ${formula.operator} `)
  }
}
