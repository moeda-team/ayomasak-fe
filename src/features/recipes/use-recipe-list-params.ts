import { useEffect, useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { RecipeListParams } from './recipe-types'

export const PAGE_SIZE_OPTIONS = [10, 20, 50]

const SEARCH_DEBOUNCE_MS = 300

const INITIAL_PARAMS: RecipeListParams = {
  search: '',
  categories: [],
  status: 'all',
  difficulty: 'all',
  eligibility: 'all',
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0] ?? 10,
}

type FilterChange = Partial<Omit<RecipeListParams, 'page'>>

/** List query state. `params.search` follows the search box after a pause; any filter change goes back to page 1. */
export const useRecipeListParams = () => {
  const [params, setParams] = useState<RecipeListParams>(INITIAL_PARAMS)
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
    searchInput.trim() !== '' ||
    params.categories.length > 0 ||
    params.status !== 'all' ||
    params.difficulty !== 'all' ||
    params.eligibility !== 'all'

  return { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters }
}
