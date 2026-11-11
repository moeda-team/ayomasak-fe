import { z } from 'zod'
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTIES } from './recipe-types'

/** Blank is fine (unknown); anything else must be a number that is 0 or higher. */
const nutritionField = z.string().superRefine((text, context) => {
  const trimmed = text.trim()
  if (trimmed === '') return
  const value = Number(trimmed)
  if (Number.isNaN(value)) context.addIssue({ code: 'custom', message: 'Enter a number.' })
  else if (value < 0) context.addIssue({ code: 'custom', message: 'Must be 0 or higher.' })
})

/**
 * What blocks "Save draft". Missing ingredients, steps and nutrition only block publishing, so they are not
 * checked here. The selects start empty, so they are checked as text first.
 */
export const recipeEditorSchema = z.object({
  name: z.string().trim().min(1, 'Recipe name is required').max(80, 'Keep the name under 80 characters'),
  slug: z.string(),
  category: z.string().min(1, 'Select a category').pipe(z.enum(RECIPE_CATEGORIES)),
  difficulty: z.string().min(1, 'Select a difficulty').pipe(z.enum(RECIPE_DIFFICULTIES)),
  servings: z.string().superRefine((text, context) => {
    const value = Number(text.trim())
    if (text.trim() === '' || Number.isNaN(value) || value < 1) {
      context.addIssue({ code: 'custom', message: 'Enter servings (minimum 1)' })
    }
  }),
  cookTime: z.string().superRefine((text, context) => {
    const trimmed = text.trim()
    if (trimmed === '') return
    if (Number.isNaN(Number(trimmed)) || Number(trimmed) < 0) context.addIssue({ code: 'custom', message: 'Enter minutes (0 or more)' })
  }),
  description: z.string(),
  nutrition: z.object({
    calories: nutritionField,
    protein: nutritionField,
    carbs: nutritionField,
    fat: nutritionField,
    fiber: nutritionField,
    sodium: nutritionField,
  }),
})

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
