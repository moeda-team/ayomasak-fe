export const REPORT_REASONS = ['spam', 'inappropriate', 'misleading', 'off-topic'] as const
export type ReportReason = (typeof REPORT_REASONS)[number]

/** Where a reported post stands. A post that was kept leaves the queue, so it has no status here. */
export const POST_STATUSES = ['reported', 'hidden', 'removed'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export type StatusFilter = PostStatus | 'all'
export type ReasonFilter = ReportReason | 'all'

export type ReportedPost = {
  id: string
  title: string
  authorName: string
  recipeTitle: string
  reason: ReportReason
  reportCount: number
  /** ISO timestamp. */
  lastReportedAt: string
  status: PostStatus
}

export type ModerationListParams = {
  search: string
  status: StatusFilter
  reason: ReasonFilter
  /** "YYYY-MM-DD", both set together or both undefined. */
  from: string | undefined
  to: string | undefined
  page: number
  pageSize: number
}

export type ModerationListResult = {
  items: ReportedPost[]
  total: number
}

export type ModerationCounts = {
  all: number
  byStatus: Record<PostStatus, number>
}

/** What a moderator can do with a post. */
export type ModerationAction = 'keep' | 'hide' | 'remove'
