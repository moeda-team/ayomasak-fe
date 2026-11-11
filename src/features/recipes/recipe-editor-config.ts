import type { ComboboxOption } from '@/components/shared/combobox'
import { INGREDIENT_NECESSITIES, type IngredientNecessity } from './recipe-editor-types'
import { RECIPE_CATEGORIES, RECIPE_DIFFICULTIES, type RecipeCategory, type RecipeDifficulty } from './recipe-types'
import { DIFFICULTY_LABEL } from './recipe-config'

export const CATEGORY_OPTIONS: ComboboxOption<RecipeCategory>[] = RECIPE_CATEGORIES.map((value) => ({ value, label: value }))

export const DIFFICULTY_OPTIONS: ComboboxOption<RecipeDifficulty>[] = RECIPE_DIFFICULTIES.map((value) => ({
  value,
  label: DIFFICULTY_LABEL[value],
}))

const NECESSITY_LABEL: Record<IngredientNecessity, string> = { required: 'Required', optional: 'Optional' }

export const NECESSITY_OPTIONS: ComboboxOption<IngredientNecessity>[] = INGREDIENT_NECESSITIES.map((value) => ({
  value,
  label: NECESSITY_LABEL[value],
}))

/** MOCK: replace with the active units from Master Unit once the two are wired together. */
export const UNIT_OPTIONS: ComboboxOption<string>[] = [
  'gram',
  'kg',
  'ml',
  'liter',
  'sdm',
  'sdt',
  'siung',
  'butir',
  'buah',
  'batang',
  'lembar',
  'ikat',
  'porsi',
].map((value) => ({ value, label: value }))

export const newRowId = () => crypto.randomUUID()
