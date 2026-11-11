import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { ConversionListParams, UnitListParams } from './unit-types'

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const SEARCH_DEBOUNCE_MS = 300
const DEFAULT_PAGE_SIZE = PAGE_SIZE_OPTIONS[0] ?? 10

const INITIAL_UNIT_PARAMS: UnitListParams = {
  search: '',
  types: [],
  basis: 'all',
  status: 'all',
  rules: 'all',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

const INITIAL_CONVERSION_PARAMS: ConversionListParams = {
  search: '',
  scope: 'all',
  fromId: 'all',
  toId: 'all',
  status: 'all',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
}

type ListParams = { search: string; page: number }

/**
 * List query state shared by both tabs. `params.search` follows the search box after a pause; any filter
 * change goes back to page 1. `isFiltered` says whether a filter other than the search is set.
 */
const useListParams = <TParams extends ListParams>(initial: TParams, isFiltered: (params: TParams) => boolean) => {
  const [params, setParams] = useState<TParams>(initial)
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS).trim()

  const changeFilters = (change: Partial<Omit<TParams, 'page'>>) => setParams((current) => ({ ...current, ...change, page: 1 }))
  const goToPage = (page: number) => setParams((current) => ({ ...current, page }))

  useEffect(() => {
    setParams((current) => (current.search === debouncedSearch ? current : { ...current, search: debouncedSearch, page: 1 }))
  }, [debouncedSearch])

  const reset = () => {
    setSearchInput('')
    setParams(initial)
  }

  const hasActiveFilters = searchInput.trim() !== '' || isFiltered(params)

  return { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters }
}

export const useUnitListParams = () =>
  useListParams(
    INITIAL_UNIT_PARAMS,
    (params) => params.types.length > 0 || params.basis !== 'all' || params.status !== 'all' || params.rules !== 'all',
  )

export const useConversionListParams = () =>
  useListParams(
    INITIAL_CONVERSION_PARAMS,
    (params) => params.scope !== 'all' || params.fromId !== 'all' || params.toId !== 'all' || params.status !== 'all',
  )
