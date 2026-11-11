import type { FilterOption } from '@/components/shared/single-select-filter'
import type { Tone } from '@/components/shared/tone'
import {
  RECIPE_DIFFICULTIES,
  RECIPE_STATUSES,
  type DifficultyFilter,
  type EligibilityFilter,
  type EligibilityState,
  type RecipeDifficulty,
  type RecipeStatus,
  type StatusFilter,
} from './recipe-types'

export const STATUS_LABEL: Record<RecipeStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  'draft-revision': 'Draft revision',
  archived: 'Archived',
}

export const STATUS_TONE: Record<RecipeStatus, Tone> = {
  draft: 'neutral',
  published: 'success',
  'draft-revision': 'warning',
  archived: 'neutral',
}

export const STATUS_FILTER_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  ...RECIPE_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
]

export const DIFFICULTY_LABEL: Record<RecipeDifficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
}

export const DIFFICULTY_FILTER_OPTIONS: FilterOption<DifficultyFilter>[] = [
  { value: 'all', label: 'All' },
  ...RECIPE_DIFFICULTIES.map((value) => ({ value, label: DIFFICULTY_LABEL[value] })),
]

export const ELIGIBILITY_LABEL: Record<EligibilityFilter, string> = {
  all: 'All',
  viewable: 'Viewable',
  'not-viewable': 'Not viewable',
  'missing-nutrition': 'Missing nutrition',
}

export const ELIGIBILITY_FILTER_OPTIONS: FilterOption<EligibilityFilter>[] = (
  ['all', 'viewable', 'not-viewable', 'missing-nutrition'] as const
).map((value) => ({ value, label: ELIGIBILITY_LABEL[value] }))

export const ELIGIBILITY_TONE: Record<EligibilityState, Tone> = {
  ok: 'success',
  warn: 'warning',
  off: 'neutral',
}
