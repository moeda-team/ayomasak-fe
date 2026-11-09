import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchAnalyticsSummary,
  fetchBadFeedback,
  fetchRecommendationFunnel,
  fetchSearchTrend,
  fetchTopNoResultSearches,
} from './mock-analytics-api'
import type { AnalyticsRange } from './analytics-types'

export const useAnalyticsSummary = (range: AnalyticsRange) =>
  useQuery({
    queryKey: ['analytics', 'summary', range],
    queryFn: () => fetchAnalyticsSummary(range),
    placeholderData: keepPreviousData,
  })

export const useSearchTrend = (range: AnalyticsRange) =>
  useQuery({
    queryKey: ['analytics', 'search-trend', range],
    queryFn: () => fetchSearchTrend(range),
    placeholderData: keepPreviousData,
  })

export const useRecommendationFunnel = (range: AnalyticsRange) =>
  useQuery({
    queryKey: ['analytics', 'funnel', range],
    queryFn: () => fetchRecommendationFunnel(range),
    placeholderData: keepPreviousData,
  })

export const useTopNoResultSearches = (range: AnalyticsRange) =>
  useQuery({
    queryKey: ['analytics', 'top-no-result', range],
    queryFn: () => fetchTopNoResultSearches(range),
    placeholderData: keepPreviousData,
  })

export const useBadFeedback = () => useQuery({ queryKey: ['analytics', 'bad-feedback'], queryFn: fetchBadFeedback })
