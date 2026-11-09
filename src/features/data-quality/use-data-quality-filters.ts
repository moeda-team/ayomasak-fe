import { useState } from 'react'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DEFAULT_FILTERS } from './data-quality-config'
import type { DataQualityFilters } from './data-quality-types'

const SEARCH_DEBOUNCE_MS = 300

type FilterChange = Partial<Omit<DataQualityFilters, 'search'>>

/** Filter state for the Data Quality page. `filters` is what the queries use: its search text is debounced. */
export const useDataQualityFilters = () => {
  const [selected, setSelected] = useState<Omit<DataQualityFilters, 'search'>>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS).trim()

  const filters: DataQualityFilters = { ...selected, search }

  const change = (next: FilterChange) => setSelected((current) => ({ ...current, ...next }))

  const reset = () => {
    setSelected(DEFAULT_FILTERS)
    setSearchInput('')
  }

  /** True once the list is narrower than the default view (all issues from the last 30 days). */
  const hasActiveFilters =
    searchInput.trim() !== '' ||
    selected.issue !== DEFAULT_FILTERS.issue ||
    selected.category !== DEFAULT_FILTERS.category ||
    selected.status !== DEFAULT_FILTERS.status ||
    selected.updated !== DEFAULT_FILTERS.updated

  return { filters, searchInput, setSearchInput, change, reset, hasActiveFilters }
}
