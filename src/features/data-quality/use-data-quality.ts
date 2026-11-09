import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  fetchDrilldown,
  fetchIssuesToFix,
  fetchQualityMetric,
  fetchQualityOverview,
  fetchRecentlyResolved,
  fetchRecipeBreakdown,
} from './mock-data-quality-api'
import type { BreakdownKind, DataQualityFilters, DrilldownKey, QualityMetricKey } from './data-quality-types'

export const useQualityOverview = () => useQuery({ queryKey: ['data-quality', 'overview'], queryFn: fetchQualityOverview })

export const useQualityMetric = (key: QualityMetricKey) =>
  useQuery({ queryKey: ['data-quality', 'metric', key], queryFn: () => fetchQualityMetric(key) })

export const useRecipeBreakdown = (kind: BreakdownKind) =>
  useQuery({ queryKey: ['data-quality', 'breakdown', kind], queryFn: () => fetchRecipeBreakdown(kind) })

export const useIssuesToFix = (filters: DataQualityFilters) =>
  useQuery({
    queryKey: ['data-quality', 'issues-to-fix', filters],
    queryFn: () => fetchIssuesToFix(filters),
    placeholderData: keepPreviousData,
  })

export const useRecentlyResolved = () =>
  useQuery({ queryKey: ['data-quality', 'recently-resolved'], queryFn: fetchRecentlyResolved })

/** Loads the list behind a card; waits until one is picked. */
export const useDrilldown = (key: DrilldownKey | null) =>
  useQuery({
    queryKey: ['data-quality', 'drilldown', key],
    queryFn: () => (key ? fetchDrilldown(key) : Promise.reject(new Error('No list selected'))),
    enabled: key !== null,
  })
