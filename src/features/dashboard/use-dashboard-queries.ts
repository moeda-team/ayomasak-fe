import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchDashboardMetrics,
  fetchNeedsAttention,
  fetchQualityTrend,
  fetchRecipeEligibility,
  fetchTopDataIssues,
} from './mock-dashboard-api'
import type { RangeMonths } from './dashboard-types'

export const useDashboardMetrics = () =>
  useQuery({ queryKey: ['dashboard', 'metrics'], queryFn: fetchDashboardMetrics })

export const useQualityTrend = (months: RangeMonths) =>
  useQuery({
    queryKey: ['dashboard', 'quality-trend', months],
    queryFn: () => fetchQualityTrend(months),
    placeholderData: keepPreviousData,
  })

export const useRecipeEligibility = (months: RangeMonths) =>
  useQuery({
    queryKey: ['dashboard', 'recipe-eligibility', months],
    queryFn: () => fetchRecipeEligibility(months),
    placeholderData: keepPreviousData,
  })

export const useTopDataIssues = (months: RangeMonths) =>
  useQuery({
    queryKey: ['dashboard', 'top-issues', months],
    queryFn: () => fetchTopDataIssues(months),
    placeholderData: keepPreviousData,
  })

export const useNeedsAttention = () =>
  useQuery({ queryKey: ['dashboard', 'needs-attention'], queryFn: fetchNeedsAttention })
