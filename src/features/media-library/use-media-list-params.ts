import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { MediaListParams } from './media-types'

/** Twelve fills the four-column grid in three full rows. */
export const PAGE_SIZE_OPTIONS = [12, 24, 48]

const SEARCH_DEBOUNCE_MS = 300

const INITIAL_PARAMS: MediaListParams = {
  search: '',
  type: 'all',
  status: 'all',
  recipe: 'all',
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0] ?? 12,
}

type FilterChange = Partial<Omit<MediaListParams, 'page'>>

/** List query state. `params.search` follows the search box after a pause; any filter change goes back to page 1. */
export const useMediaListParams = () => {
  const [params, setParams] = useState<MediaListParams>(INITIAL_PARAMS)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS).trim()

  const changeFilters = (change: FilterChange) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))

  useEffect(() => {
    setParams((current) => (current.search === debouncedSearch ? current : { ...current, search: debouncedSearch, page: 1 }))
  }, [debouncedSearch])

  const reset = () => {
    setSearchInput('')
    setParams((current) => ({ ...INITIAL_PARAMS, pageSize: current.pageSize }))
  }

  const hasActiveFilters =
    searchInput.trim() !== '' || params.type !== 'all' || params.status !== 'all' || params.recipe !== 'all'

  return { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters }
}
