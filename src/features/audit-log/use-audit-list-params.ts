import { useState } from 'react'
import { PAGE_SIZE_OPTIONS } from '@/features/user-management/use-user-list-params'
import { toIsoDay } from '@/lib/iso-day'
import type { AuditListParams } from './audit-types'

const DAY_MS = 86_400_000

/** The log opens on the last 30 days, so the first screen is recent rather than everything ever logged. */
const createInitialParams = (): AuditListParams => {
  const today = new Date()
  return {
    search: '',
    entityTypes: [],
    action: 'all',
    status: 'all',
    from: toIsoDay(new Date(today.getTime() - 29 * DAY_MS)),
    to: toIsoDay(today),
    page: 1,
    pageSize: PAGE_SIZE_OPTIONS[0] ?? 10,
  }
}

type FilterChange = Partial<Omit<AuditListParams, 'page'>>

/** Audit log query state. Any filter or page-size change sends the user back to page 1. */
export const useAuditListParams = () => {
  const [initial] = useState(createInitialParams)
  const [params, setParams] = useState<AuditListParams>(initial)

  const changeFilters = (change: FilterChange) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))
  const reset = () => setParams(initial)

  /** True once the user has narrowed the list beyond the default view. */
  const hasActiveFilters =
    params.search.trim() !== '' ||
    params.entityTypes.length > 0 ||
    params.action !== 'all' ||
    params.status !== 'all' ||
    params.from !== initial.from ||
    params.to !== initial.to

  return { params, changeFilters, goToPage, reset, hasActiveFilters }
}
