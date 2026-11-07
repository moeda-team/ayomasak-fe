import type {
  DashboardMetric,
  NeedsAttentionItem,
  QualityTrendPoint,
  RangeMonths,
  RecipeEligibility,
  TopDataIssue,
} from './dashboard-types'

/** MOCK: replace each function with a real request. Signatures are what the hooks depend on. */
const MOCK_LATENCY_MS = 500

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const HOUR_MS = 3_600_000

const MONTHLY_ISSUES: { open: number; resolved: number }[] = [
  { open: 58, resolved: 31 },
  { open: 64, resolved: 38 },
  { open: 49, resolved: 44 },
  { open: 71, resolved: 29 },
  { open: 66, resolved: 40 },
  { open: 84, resolved: 36 },
  { open: 48, resolved: 47 },
  { open: 64, resolved: 47 },
  { open: 73, resolved: 36 },
  { open: 84, resolved: 27 },
  { open: 63, resolved: 48 },
  { open: 78, resolved: 33 },
]

const toMonthStart = (monthsAgo: number, now: Date) => {
  const date = new Date(Date.UTC(now.getFullYear(), now.getMonth() - monthsAgo, 1))
  return date.toISOString().slice(0, 10)
}

export const fetchDashboardMetrics = async (): Promise<DashboardMetric[]> => {
  await wait()
  return [
    {
      key: 'draft-recipes',
      value: 128,
      deltaPercent: -8,
      comparisonPeriod: 'month',
      trend: [14, 16, 12, 15, 11, 17, 13, 18, 15, 20, 17, 22],
    },
    {
      key: 'publish-blockers',
      value: 17,
      deltaPercent: -4,
      comparisonPeriod: 'week',
      trend: [10, 14, 9, 16, 8, 13, 7, 12, 9, 15, 8, 11],
    },
    {
      key: 'stale-nutrition',
      value: 23,
      deltaPercent: 5,
      comparisonPeriod: 'week',
      trend: [8, 12, 7, 13, 9, 15, 10, 14, 11, 16, 12, 18],
    },
    {
      key: 'unmapped-input',
      value: 41,
      deltaPercent: -12,
      comparisonPeriod: 'week',
      trend: [9, 11, 8, 13, 10, 15, 12, 17, 14, 19, 16, 22],
    },
  ]
}

export const fetchQualityTrend = async (months: RangeMonths): Promise<QualityTrendPoint[]> => {
  await wait()
  const now = new Date()
  return MONTHLY_ISSUES.slice(-months).map((counts, index, window) => ({
    month: toMonthStart(window.length - 1 - index, now),
    ...counts,
  }))
}

const ELIGIBILITY_BY_RANGE: Record<RangeMonths, RecipeEligibility> = {
  3: { total: 212, viewable: 171, notReady: 41 },
  6: { total: 384, viewable: 312, notReady: 72 },
  12: { total: 702, viewable: 566, notReady: 136 },
}

export const fetchRecipeEligibility = async (months: RangeMonths): Promise<RecipeEligibility> => {
  await wait()
  return ELIGIBILITY_BY_RANGE[months]
}

const TOP_ISSUES: TopDataIssue[] = [
  { id: 'unmapped-ingredient-input', label: 'Unmapped ingredient input', count: 41 },
  { id: 'broken-media', label: 'Broken media', count: 31 },
  { id: 'stale-nutrition', label: 'Stale nutrition', count: 23 },
  { id: 'missing-recipe-steps', label: 'Missing recipe steps', count: 15 },
  { id: 'missing-required-ingredient', label: 'Missing required ingredient', count: 10 },
  { id: 'missing-equipment', label: 'Missing equipment', count: 8 },
]

const TOP_ISSUES_SCALE: Record<RangeMonths, number> = { 3: 0.5, 6: 1, 12: 1.9 }

export const fetchTopDataIssues = async (months: RangeMonths): Promise<TopDataIssue[]> => {
  await wait()
  const scale = TOP_ISSUES_SCALE[months]
  return TOP_ISSUES.map((issue) => ({ ...issue, count: Math.max(1, Math.round(issue.count * scale)) }))
}

export const fetchNeedsAttention = async (): Promise<NeedsAttentionItem[]> => {
  await wait()
  const now = Date.now()
  const hoursAgo = (hours: number) => new Date(now - hours * HOUR_MS).toISOString()
  return [
    { id: 'nasi-goreng', recipeName: 'Nasi Goreng', issue: 'Nutrition stale', detectedAt: hoursAgo(2) },
    { id: 'soto-ayam', recipeName: 'Soto Ayam', issue: 'Missing recipe step', detectedAt: hoursAgo(3) },
    { id: 'rendang', recipeName: 'Rendang', issue: 'Broken media', detectedAt: hoursAgo(5) },
    { id: 'gado-gado', recipeName: 'Gado-gado', issue: 'Unmapped input', detectedAt: hoursAgo(8) },
    { id: 'ayam-bakar', recipeName: 'Ayam Bakar', issue: 'Publish blocked', detectedAt: hoursAgo(26) },
  ]
}
