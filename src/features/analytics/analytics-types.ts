export const ANALYTICS_METRIC_KEYS = ['recommendation-ctr', 'cooking-start-rate', 'completion-rate', 'bad-rec-feedback'] as const

export type AnalyticsMetricKey = (typeof ANALYTICS_METRIC_KEYS)[number]

/** How many days back the page looks. */
export type AnalyticsRange = '7' | '30' | '90'

export type AnalyticsMetric = {
  key: AnalyticsMetricKey
  /** A rate, in percent. */
  value: number
  /** Change against the previous period, in percentage points. */
  deltaPoints: number
  trend: number[]
}

export type AnalyticsSummary = {
  /** False until the app has recorded its first event. */
  hasEvents: boolean
  /** False when events exist, but none fall inside the selected range. */
  hasDataInRange: boolean
  metrics: AnalyticsMetric[]
}

export type SearchTrendPoint = {
  id: string
  /** Axis label, e.g. "W1". */
  label: string
  /** Heading of the hover card, e.g. "Week 1". */
  title: string
  withResults: number
  noResult: number
}

export type FunnelStep = {
  id: string
  label: string
  count: number
}

export type NoResultSearch = {
  id: string
  query: string
  count: number
}

export type BadFeedback = {
  id: string
  recipeName: string
  reason: string
  /** ISO timestamp. */
  givenAt: string
}
