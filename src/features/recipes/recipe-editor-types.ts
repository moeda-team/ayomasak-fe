import type { RecipeCategory, RecipeDifficulty, RecipeStatus } from './recipe-types'

export const INGREDIENT_NECESSITIES = ['required', 'optional'] as const
export type IngredientNecessity = (typeof INGREDIENT_NECESSITIES)[number]

export type IngredientRow = {
  id: string
  /** Empty until a bahan is picked. */
  bahanId: string
  /** Text while typing; checked on publish, not on save. */
  quantity: string
  unit: string
  necessity: IngredientNecessity
  note: string
}

export type EquipmentRow = {
  id: string
  equipmentId: string
  quantity: string
  note: string
}

export type StepRow = {
  id: string
  instruction: string
  /** Minutes as text; empty means no timer. */
  timerMinutes: string
}

export type NutritionValues = {
  calories: string
  protein: string
  carbs: string
  fat: string
  fiber: string
  sodium: string
}

export type PhotoStatus = 'uploaded' | 'uploading' | 'failed'

export type PhotoItem = {
  id: string
  name: string
  status: PhotoStatus
  /** 0–100, only meaningful while uploading. */
  progress: number
}

export type VideoStatus = 'uploaded' | 'uploading' | 'broken'

export type VideoItem = {
  id: string
  name: string
  source: 'file' | 'link'
  status: VideoStatus
  progress: number
  /** "0:42"; only known for uploaded files. */
  duration?: string
}

/** Everything the editor form holds. Numbers stay as text until they are checked. */
export type RecipeEditorValues = {
  name: string
  slug: string
  /** Empty until picked. */
  category: RecipeCategory | ''
  difficulty: RecipeDifficulty | ''
  servings: string
  cookTime: string
  description: string
  ingredients: IngredientRow[]
  equipment: EquipmentRow[]
  steps: StepRow[]
  nutrition: NutritionValues
  photos: PhotoItem[]
  videos: VideoItem[]
  /** Fallback when a photo upload fails. */
  imageUrl: string
}

/** A saved recipe as the editor loads it. */
export type RecipeEditorRecord = {
  id: string
  status: RecipeStatus
  /** Published versions so far; 0 while the recipe has never been published. */
  version: number
  /** ISO timestamp of the last save. */
  savedAt: string
  /** The nutrition values were calculated from ingredients, not measured. */
  nutritionEstimated: boolean
  values: RecipeEditorValues
}

export const NUTRITION_FIELDS = [
  { key: 'calories', label: 'Calories (kcal)', placeholder: 'e.g. 520' },
  { key: 'protein', label: 'Protein (g)', placeholder: 'e.g. 14' },
  { key: 'carbs', label: 'Carbohydrate (g)', placeholder: 'e.g. 68' },
  { key: 'fat', label: 'Fat (g)', placeholder: 'e.g. 20' },
  { key: 'fiber', label: 'Fiber (g)', placeholder: 'e.g. 3' },
  { key: 'sodium', label: 'Sodium (mg)', placeholder: 'e.g. 840' },
] as const satisfies readonly { key: keyof NutritionValues; label: string; placeholder: string }[]

export const MAX_PHOTOS = 8
export const MAX_VIDEOS = 3

export const EMPTY_EDITOR_VALUES: RecipeEditorValues = {
  name: '',
  slug: '',
  category: '',
  difficulty: '',
  servings: '',
  cookTime: '',
  description: '',
  ingredients: [],
  equipment: [],
  steps: [],
  nutrition: { calories: '', protein: '', carbs: '', fat: '', fiber: '', sodium: '' },
  photos: [],
  videos: [],
  imageUrl: '',
}
