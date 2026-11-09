import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import type {
  AnalyticsMetric,
  AnalyticsRange,
  AnalyticsSummary,
  BadFeedback,
  FunnelStep,
  NoResultSearch,
  SearchTrendPoint,
} from './analytics-types'

/** MOCK: replace each function with a real request. Signatures are what the hooks depend on. */
const MOCK_LATENCY_MS = 500

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const HOUR_MS = 3_600_000

/** Counts grow with the length of the range. */
const RANGE_SCALE: Record<AnalyticsRange, number> = { '7': 0.25, '30': 1, '90': 2.8 }

const scaled = (count: number, range: AnalyticsRange) => Math.max(1, Math.round(count * RANGE_SCALE[range]))

const METRICS: AnalyticsMetric[] = [
  { key: 'recommendation-ctr', value: 34, deltaPoints: 3, trend: [14, 16, 12, 15, 11, 17, 13, 18, 15, 20, 17, 22] },
  { key: 'cooking-start-rate', value: 22, deltaPoints: 2, trend: [10, 14, 9, 16, 8, 13, 7, 12, 9, 15, 8, 11] },
  { key: 'completion-rate', value: 37, deltaPoints: -2, trend: [8, 12, 7, 13, 9, 15, 10, 14, 11, 16, 12, 18] },
  { key: 'bad-rec-feedback', value: 7, deltaPoints: -1, trend: [9, 11, 8, 13, 10, 15, 12, 17, 14, 19, 16, 22] },
]

/** The 7-day range has no events in the mock, so the "no data in this range" state can be reached from the page. */
export const fetchAnalyticsSummary = async (range: AnalyticsRange): Promise<AnalyticsSummary> => {
  failLoadIfMocked('fetchAnalyticsSummary')
  await wait()
  if (isMockMode('empty')) return { hasEvents: false, hasDataInRange: false, metrics: [] }
  return { hasEvents: true, hasDataInRange: range !== '7', metrics: METRICS }
}

const WEEKLY_SEARCHES: { noResult: number; withResults: number }[] = [
  { noResult: 52, withResults: 46 },
  { noResult: 55, withResults: 46 },
  { noResult: 47, withResults: 53 },
  { noResult: 28, withResults: 71 },
  { noResult: 51, withResults: 42 },
  { noResult: 34, withResults: 60 },
]

export const fetchSearchTrend = async (range: AnalyticsRange): Promise<SearchTrendPoint[]> => {
  failLoadIfMocked('fetchSearchTrend')
  await wait()
  return WEEKLY_SEARCHES.map(({ noResult, withResults }, index) => ({
    id: `w${index + 1}`,
    label: `W${index + 1}`,
    title: `Week ${index + 1}`,
    noResult: scaled(noResult, range),
    withResults: scaled(withResults, range),
  }))
}

const FUNNEL: Omit<FunnelStep, 'id'>[] = [
  { label: 'Input sessions', count: 1284 },
  { label: 'Recommendations shown', count: 1040 },
  { label: 'Clicked a recommendation', count: 354 },
  { label: 'Cooking started', count: 229 },
  { label: 'Cooking completed', count: 85 },
]

/** The funnel card fails on its own in `partial` mode, to show a single failing widget. */
export const fetchRecommendationFunnel = async (range: AnalyticsRange): Promise<FunnelStep[]> => {
  failLoadIfMocked('fetchRecommendationFunnel', { inPartialMode: true })
  await wait()
  return FUNNEL.map((step, index) => ({ ...step, id: `step-${index + 1}`, count: scaled(step.count, range) }))
}

const NO_RESULT_SEARCHES: Omit<NoResultSearch, 'id'>[] = [
  { query: 'nasi bakar', count: 41 },
  { query: 'tempe mendoan', count: 31 },
  { query: 'sayur asem', count: 23 },
  { query: 'bubur ayam', count: 15 },
  { query: 'mie kocok', count: 10 },
  { query: 'pepes ikan', count: 8 },
]

export const fetchTopNoResultSearches = async (range: AnalyticsRange): Promise<NoResultSearch[]> => {
  failLoadIfMocked('fetchTopNoResultSearches')
  await wait()
  return NO_RESULT_SEARCHES.map((search) => ({ ...search, id: search.query, count: scaled(search.count, range) }))
}

export const fetchBadFeedback = async (): Promise<BadFeedback[]> => {
  failLoadIfMocked('fetchBadFeedback')
  await wait()
  const now = Date.now()
  const hoursAgo = (hours: number) => new Date(now - hours * HOUR_MS).toISOString()
  return [
    { id: 'f1', recipeName: 'Nasi Goreng', reason: 'Missing: terasi', givenAt: hoursAgo(2) },
    { id: 'f2', recipeName: 'Soto Ayam', reason: 'Too many steps', givenAt: hoursAgo(3) },
    { id: 'f3', recipeName: 'Rendang', reason: 'Needs oven', givenAt: hoursAgo(5) },
    { id: 'f4', recipeName: 'Gado-gado', reason: 'Calories too high', givenAt: hoursAgo(8) },
    { id: 'f5', recipeName: 'Ayam Bakar', reason: 'Not what I searched', givenAt: hoursAgo(26) },
  ]
}
