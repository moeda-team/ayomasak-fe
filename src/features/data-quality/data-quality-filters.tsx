import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { CATEGORY_OPTIONS, ISSUE_OPTIONS, STATUS_OPTIONS, UPDATED_OPTIONS } from './data-quality-config'
import type { DataQualityFilters as Filters } from './data-quality-types'

type FilterChange = Partial<Omit<Filters, 'search'>>

type DataQualityFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  filters: Filters
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const DataQualityFilters = ({
  searchInput,
  onSearchInputChange,
  filters,
  onChange,
  hasActiveFilters,
  onReset,
}: DataQualityFiltersProps) => (
  <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
    <SearchField
      aria-label="Search recipes with issues"
      placeholder="Search recipe…"
      value={searchInput}
      onChange={(event) => onSearchInputChange(event.target.value)}
      className="min-w-56 flex-1"
    />
    <SingleSelectFilter
      label="Issue type"
      value={filters.issue}
      options={ISSUE_OPTIONS}
      allValue="all"
      onChange={(issue) => onChange({ issue })}
    />
    <SingleSelectFilter
      label="Category"
      value={filters.category}
      options={CATEGORY_OPTIONS}
      allValue="all"
      onChange={(category) => onChange({ category })}
    />
    <SingleSelectFilter
      label="Status"
      value={filters.status}
      options={STATUS_OPTIONS}
      allValue="all"
      onChange={(status) => onChange({ status })}
    />
    <SingleSelectFilter
      label="Updated"
      value={filters.updated}
      options={UPDATED_OPTIONS}
      allValue="30"
      onChange={(updated) => onChange({ updated })}
    />
    {hasActiveFilters && (
      <Button variant="link" size="sm" onClick={onReset}>
        Reset
      </Button>
    )}
  </div>
)
