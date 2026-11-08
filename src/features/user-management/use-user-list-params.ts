import { useState } from 'react'
import type { UserListParams } from './user-types'

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const INITIAL_PARAMS: UserListParams = {
  search: '',
  roleIds: [],
  status: 'all',
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0] ?? 10,
}

type FilterChange = Partial<Pick<UserListParams, 'search' | 'roleIds' | 'status' | 'joinedFrom' | 'joinedTo' | 'pageSize'>>

/** List query state. Any filter or page-size change sends the user back to page 1. */
export const useUserListParams = () => {
  const [params, setParams] = useState<UserListParams>(INITIAL_PARAMS)

  const changeFilters = (change: FilterChange) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))
  const reset = () => setParams(INITIAL_PARAMS)

  const hasActiveFilters =
    params.search.trim() !== '' || params.roleIds.length > 0 || params.status !== 'all' || Boolean(params.joinedFrom)

  return { params, changeFilters, goToPage, reset, hasActiveFilters }
}
