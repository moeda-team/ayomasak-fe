import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { fetchActivities, fetchActivityDetail, fetchActivityRoleCounts, fetchActors } from './mock-activity-api'
import type { ActivityListParams } from './activity-types'

const ACTIVITY_KEY = ['user-activity'] as const

export const useActivities = (params: ActivityListParams) =>
  useQuery({
    queryKey: [...ACTIVITY_KEY, 'list', params],
    queryFn: () => fetchActivities(params),
    placeholderData: keepPreviousData,
  })

export const useActors = () =>
  useQuery({ queryKey: [...ACTIVITY_KEY, 'actors'], queryFn: fetchActors, staleTime: 5 * 60_000 })

export const useActivityRoleCounts = () =>
  useQuery({ queryKey: [...ACTIVITY_KEY, 'role-counts'], queryFn: fetchActivityRoleCounts, staleTime: 5 * 60_000 })

/** Loads the before/after detail for the open drawer; idle while no activity is selected. */
export const useActivityDetail = (activityId: string | null) =>
  useQuery({
    queryKey: [...ACTIVITY_KEY, 'detail', activityId],
    queryFn: () => fetchActivityDetail(activityId ?? ''),
    enabled: activityId !== null,
    retry: false,
  })
