export const MEDIA_TYPES = ['photo', 'video'] as const
export type MediaType = (typeof MEDIA_TYPES)[number]

export const MEDIA_STATUSES = ['in-use', 'unused', 'processing', 'broken'] as const
export type MediaStatus = (typeof MEDIA_STATUSES)[number]

export type MediaItem = {
  id: string
  name: string
  type: MediaType
  /** What the card shows after the type: a file size, or "External link" / "Link unavailable" for linked videos. */
  detail: string
  /** Name of the recipe using it; null while nothing uses it. */
  recipe: string | null
  status: MediaStatus
}

export type TypeFilter = MediaType | 'all'
export type StatusFilter = MediaStatus | 'all'
/** `all`, `none` (not linked to a recipe), or a recipe name. */
export type RecipeFilter = string

export const NO_RECIPE = 'none'

export type MediaListParams = {
  search: string
  type: TypeFilter
  status: StatusFilter
  recipe: RecipeFilter
  /** 1-based. */
  page: number
  pageSize: number
}

export type MediaListResult = {
  items: MediaItem[]
  total: number
}
