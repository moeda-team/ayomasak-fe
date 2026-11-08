import { z } from 'zod'
import type { MatchingConfig } from './config-types'

export type MatchingErrors = Partial<Record<keyof MatchingConfig | 'weights', string>>

const percentSchema = z
  .number({ error: 'Enter a percentage' })
  .int('Use a whole number')
  .min(0, 'Enter a value from 0 to 100')
  .max(100, 'Enter a value from 0 to 100')

const FIELDS = ['exact', 'near', 'weak', 'ingredientWeight', 'equipmentWeight', 'nutritionWeight'] as const

/**
 * Each field must be a whole percentage. Only once the fields themselves are valid are they compared:
 * thresholds must descend (exact > near > weak) and the weights must total 100.
 */
export const validateMatching = (values: MatchingConfig): MatchingErrors => {
  const errors: MatchingErrors = {}
  for (const field of FIELDS) {
    const result = percentSchema.safeParse(values[field])
    if (!result.success) errors[field] = result.error.issues[0]?.message
  }

  const { exact, near, weak, ingredientWeight, equipmentWeight, nutritionWeight } = values

  if (exact !== null && !errors.exact) {
    if (near !== null && !errors.near && near >= exact) errors.near = 'Near match must be lower than exact match'
    if (weak !== null && !errors.weak && weak >= exact) errors.weak = 'Weak match must be lower than exact match'
  }
  if (near !== null && weak !== null && !errors.near && !errors.weak && weak >= near) {
    errors.weak = 'Weak match must be lower than near match'
  }

  const weights = [ingredientWeight, equipmentWeight, nutritionWeight]
  const hasAllWeights = !errors.ingredientWeight && !errors.equipmentWeight && !errors.nutritionWeight
  if (hasAllWeights) {
    const total = weights.reduce<number>((sum, weight) => sum + (weight ?? 0), 0)
    if (total !== 100) errors.weights = `Weights must total 100% (currently ${total}%).`
  }

  return errors
}

/** Field ids, in page order, used to move focus to the first problem. */
export const MATCHING_FIELD_ORDER = FIELDS
