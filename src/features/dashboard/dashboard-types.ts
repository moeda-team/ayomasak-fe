export type RangeMonths = 3 | 6 | 12

export type MetricKey = 'draft-recipes' | 'publish-blockers' | 'stale-nutrition' | 'unmapped-input' | 'broken-media'

export type DashboardMetric = {
  key: MetricKey
  value: number
  /** Change against the comparison period, in percent. Negative means it went down. */
  deltaPercent: number
  comparisonPeriod: 'week' | 'month'
  trend: number[]
}

export type QualityTrendPoint = {
  /** First day of the month, ISO date. */
  month: string
  open: number
  resolved: number
}

export type RecipeEligibility = {
  total: number
  viewable: number
  notReady: number
}

export type TopDataIssue = {
  id: string
  label: string
  count: number
}

export type NeedsAttentionItem = {
  id: string
  recipeName: string
  issue: string
  /** ISO timestamp of when the issue was detected. */
  detectedAt: string
}
