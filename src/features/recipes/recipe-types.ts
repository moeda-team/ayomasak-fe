export const RECIPE_CATEGORIES = ['Nasi', 'Lauk', 'Sayur', 'Sup', 'Ikan', 'Saus', 'Dessert'] as const
export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const
export type RecipeDifficulty = (typeof RECIPE_DIFFICULTIES)[number]

export const RECIPE_STATUSES = ['draft', 'published', 'draft-revision', 'archived'] as const
export type RecipeStatus = (typeof RECIPE_STATUSES)[number]

/** `ok` is ready, `warn` is there but incomplete, `off` is not available. */
export type EligibilityState = 'ok' | 'warn' | 'off'

/** What a recipe can be used for: shown to users, matched against ingredients, carrying nutrition. */
export type RecipeEligibility = {
  viewable: EligibilityState
  matchable: EligibilityState
  nutrition: EligibilityState
}

export type Recipe = {
  id: string
  name: string
  aliases: string[]
  category: RecipeCategory
  /** ISO timestamp. */
  updatedAt: string
  difficulty: RecipeDifficulty
  status: RecipeStatus
  eligibility: RecipeEligibility
}

export type StatusFilter = RecipeStatus | 'all'
export type DifficultyFilter = RecipeDifficulty | 'all'
export type EligibilityFilter = 'all' | 'viewable' | 'not-viewable' | 'missing-nutrition'

export type RecipeListParams = {
  search: string
  categories: RecipeCategory[]
  status: StatusFilter
  difficulty: DifficultyFilter
  eligibility: EligibilityFilter
  page: number
  pageSize: number
}

export type RecipeListResult = {
  items: Recipe[]
  total: number
}

export type RecipeCategoryCount = {
  category: RecipeCategory
  count: number
}
