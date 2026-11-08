import { useState } from 'react'
import { PAGE_SIZE_OPTIONS } from '@/features/user-management/use-user-list-params'
import type { ActivityListParams } from './activity-types'

const DAY_MS = 86_400_000

const toIsoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

/** The log opens on the last 30 days, so the first screen is recent rather than everything ever logged. */
const createInitialParams = (): ActivityListParams => {
  const today = new Date()
  return {
    search: '',
    roleIds: [],
    action: 'all',
    actorId: 'all',
    from: toIsoDay(new Date(today.getTime() - 29 * DAY_MS)),
    to: toIsoDay(today),
    page: 1,
    pageSize: PAGE_SIZE_OPTIONS[0] ?? 10,
  }
}

type FilterChange = Partial<Omit<ActivityListParams, 'page'>>

/** Activity list query state. Any filter or page-size change sends the user back to page 1. */
export const useActivityListParams = () => {
  const [initial] = useState(createInitialParams)
  const [params, setParams] = useState<ActivityListParams>(initial)

  const changeFilters = (change: FilterChange) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))
  const reset = () => setParams(initial)

  /** True once the user has narrowed the list beyond the default view. */
  const hasActiveFilters =
    params.search.trim() !== '' ||
    params.roleIds.length > 0 ||
    params.action !== 'all' ||
    params.actorId !== 'all' ||
    params.from !== initial.from ||
    params.to !== initial.to

  return { params, changeFilters, goToPage, reset, hasActiveFilters }
}
