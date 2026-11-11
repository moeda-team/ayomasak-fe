export const REVIEW_KINDS = ['bahan', 'equipment', 'unmapped'] as const
export type ReviewKind = (typeof REVIEW_KINDS)[number]

export type KindFilter = ReviewKind | 'all'

/** Where an item came from: a user typed it (and how often), or an admin added it. */
export type ReviewSource = { kind: 'input-user'; typedCount: number } | { kind: 'admin'; adminName: string }

/** An existing master record that looks like the pending item. `score` is a percentage. */
export type ReviewMatch = {
  id: string
  name: string
  aliases: string[]
  score: number
}

export type ReviewItem = {
  id: string
  name: string
  kind: ReviewKind
  aliases: string[]
  source: ReviewSource
  /** ISO timestamp. */
  submittedAt: string
  category: string | null
  defaultUnit: string | null
  matches: ReviewMatch[]
}

/** A master record the item can be merged into. */
export type MergeTarget = {
  id: string
  name: string
}

export type ReviewListParams = {
  search: string
  kind: KindFilter
  /** Source keys, see `sourceKeyOf`. Empty means every source. */
  sources: string[]
  /** "YYYY-MM-DD", both set together or both undefined. */
  from: string | undefined
  to: string | undefined
  page: number
  pageSize: number
}

export type ReviewListResult = {
  items: ReviewItem[]
  total: number
}

export type ReviewCounts = {
  all: number
  byKind: Record<ReviewKind, number>
  /** Pending items per source key. */
  bySource: { key: string; label: string; count: number }[]
}
