import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ModerationListParams } from './moderation-types'

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const SEARCH_DEBOUNCE_MS = 300

const INITIAL_PARAMS: ModerationListParams = {
  search: '',
  status: 'reported',
  reason: 'all',
  from: undefined,
  to: undefined,
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0] ?? 10,
}

type FilterChange = Partial<Omit<ModerationListParams, 'page'>>

/**
 * List query state. `params.search` follows the search box after a pause; any change to a filter or the tab
 * goes back to page 1. `hasActiveFilters` ignores the tab, which is not a filter.
 */
export const useModerationListParams = () => {
  const [params, setParams] = useState<ModerationListParams>(INITIAL_PARAMS)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS).trim()

  const changeFilters = (change: FilterChange) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))

  useEffect(() => {
    setParams((current) => (current.search === debouncedSearch ? current : { ...current, search: debouncedSearch, page: 1 }))
  }, [debouncedSearch])

  const reset = () => {
    setSearchInput('')
    setParams((current) => ({ ...INITIAL_PARAMS, status: current.status, pageSize: current.pageSize }))
  }

  const hasActiveFilters = searchInput.trim() !== '' || params.reason !== 'all' || params.from !== undefined

  return { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters }
}
