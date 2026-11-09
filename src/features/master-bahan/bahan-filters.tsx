import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABEL, FORM_FILTER_OPTIONS, PANTRY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from './bahan-config'
import type { BahanListParams } from './bahan-types'
import { useBahanCategoryCounts } from './use-bahan'

type FilterChange = Partial<Pick<BahanListParams, 'categories' | 'form' | 'status' | 'pantry'>>

type BahanFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: BahanListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const BahanFilters = ({
  searchInput,
  onSearchInputChange,
  params,
  onChange,
  hasActiveFilters,
  onReset,
}: BahanFiltersProps) => {
  const { data: counts = [] } = useBahanCategoryCounts()

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search bahan or alias"
        placeholder="Search bahan or alias…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter
        label="Category"
        searchPlaceholder="Search category"
        options={counts.map(({ category, count }) => ({ value: category, label: CATEGORY_LABEL[category], count }))}
        value={params.categories}
        onApply={(categories) => onChange({ categories })}
      />
      <SingleSelectFilter
        label="Form"
        value={params.form}
        options={FORM_FILTER_OPTIONS}
        allValue="all"
        onChange={(form) => onChange({ form })}
      />
      <SingleSelectFilter
        label="Status"
        value={params.status}
        options={STATUS_FILTER_OPTIONS}
        allValue="all"
        onChange={(status) => onChange({ status })}
      />
      <SingleSelectFilter
        label="Pantry"
        value={params.pantry}
        options={PANTRY_FILTER_OPTIONS}
        allValue="all"
        onChange={(pantry) => onChange({ pantry })}
      />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
