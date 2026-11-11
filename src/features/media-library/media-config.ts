import type { FilterOption } from '@/components/shared/single-select-filter'
import { MEDIA_STATUSES, MEDIA_TYPES, NO_RECIPE, type MediaStatus, type MediaType, type StatusFilter, type TypeFilter } from './media-types'

export const TYPE_LABEL: Record<MediaType, string> = { photo: 'Photo', video: 'Video' }

export const STATUS_LABEL: Record<MediaStatus, string> = {
  'in-use': 'In use',
  unused: 'Unused',
  processing: 'Processing',
  broken: 'Broken',
}

/** Text color of the status line on a card. */
export const STATUS_TEXT_CLASS: Record<MediaStatus, string> = {
  'in-use': 'text-status-success',
  unused: 'text-status-warning',
  processing: 'text-text-brand',
  broken: 'text-status-danger',
}

/** Background of the preview area; a broken file is tinted so it stands out in the grid. */
export const PREVIEW_CLASS = {
  photo: 'bg-surface-subtle',
  video: 'bg-surface-brand-subtle',
  broken: 'bg-status-danger-subtle',
} as const

export const TYPE_FILTER_OPTIONS: FilterOption<TypeFilter>[] = [
  { value: 'all', label: 'All' },
  ...MEDIA_TYPES.map((value) => ({ value, label: TYPE_LABEL[value] })),
]

export const STATUS_FILTER_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  ...MEDIA_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
]

export const recipeFilterOptions = (recipes: string[]): FilterOption<string>[] => [
  { value: 'all', label: 'All' },
  { value: NO_RECIPE, label: 'No recipe linked' },
  ...recipes.map((name) => ({ value: name, label: name })),
]
