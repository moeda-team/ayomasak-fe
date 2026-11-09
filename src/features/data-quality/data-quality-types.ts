import type { MetricKey } from '@/features/dashboard/dashboard-types'

export const QUALITY_METRIC_KEYS = ['publish-blockers', 'stale-nutrition', 'unmapped-input', 'broken-media'] as const satisfies readonly MetricKey[]

export type QualityMetricKey = (typeof QUALITY_METRIC_KEYS)[number]

export type QualityMetric = {
  key: QualityMetricKey
  value: number
  /** Change against the previous period. */
  delta: number
  deltaUnit: 'percent' | 'count'
  trend: number[]
}

export type QualityOverview = {
  /** Zero means no recipe exists yet, so there is nothing to check. */
  totalRecipes: number
  /** ISO timestamp of the last quality check. */
  checkedAt: string
}

export type BreakdownKind = 'eligibility' | 'nutrition' | 'lifecycle'

export type RecipeBreakdown = {
  total: number
  /** Recipe count per entry key; the keys come from `BREAKDOWN_CONFIG`. */
  counts: Record<string, number>
}

/** The lists that can be opened from a card or panel. */
export type DrilldownKey = 'publish-blockers' | 'stale-nutrition' | 'broken-media' | 'draft-recipes'

export type DrilldownTone = 'danger' | 'warning' | 'neutral'

export type DrilldownItem = {
  id: string
  recipeName: string
  /** Why it is listed and when, e.g. "Photo link returns 404 · 5 hours ago". */
  detail: string
  badge: { label: string; tone: DrilldownTone }
}

export type Drilldown = {
  total: number
  items: DrilldownItem[]
}

export const ISSUE_KINDS = ['publish-blocked', 'stale-nutrition', 'unmapped-ingredient', 'broken-media', 'missing-step'] as const

export type IssueKind = (typeof ISSUE_KINDS)[number]

export const RECIPE_CATEGORIES = ['rice-noodles', 'soup', 'meat', 'vegetable', 'seafood', 'sambal'] as const

export type RecipeCategory = (typeof RECIPE_CATEGORIES)[number]

export type RecipeStatus = 'published' | 'draft' | 'draft-revision'

export type UpdatedWindow = '7' | '30' | '90' | 'year'

export type DataQualityFilters = {
  search: string
  issue: IssueKind | 'all'
  category: RecipeCategory | 'all'
  status: RecipeStatus | 'all'
  updated: UpdatedWindow
}

export type IssueToFix = {
  id: string
  recipeName: string
  issue: IssueKind
  /** ISO timestamp of when the issue was detected. */
  detectedAt: string
}

export type IssuesToFix = {
  /** Every issue that matches the filters. */
  total: number
  /** The first few, for the card. */
  items: IssueToFix[]
}

export type ResolvedIssue = {
  id: string
  recipeName: string
  /** What was done and by whom, e.g. "Nutrition recalculated · Rina". */
  detail: string
  resolvedAt: string
}
