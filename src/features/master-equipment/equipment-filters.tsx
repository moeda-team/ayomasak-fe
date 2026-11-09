import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { MASTER_STATUS_FILTER_OPTIONS } from '@/features/master-data/master-status'
import { ALTERNATIVE_FILTER_OPTIONS, CATEGORY_LABEL } from './equipment-config'
import type { EquipmentListParams } from './equipment-types'
import { useEquipmentCategoryCounts } from './use-equipment'

type FilterChange = Partial<Pick<EquipmentListParams, 'categories' | 'status' | 'alternative'>>

type EquipmentFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: EquipmentListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const EquipmentFilters = ({
  searchInput,
  onSearchInputChange,
  params,
  onChange,
  hasActiveFilters,
  onReset,
}: EquipmentFiltersProps) => {
  const { data: counts = [] } = useEquipmentCategoryCounts()

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search equipment or alias"
        placeholder="Search equipment or alias…"
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
        label="Status"
        value={params.status}
        options={MASTER_STATUS_FILTER_OPTIONS}
        allValue="all"
        onChange={(status) => onChange({ status })}
      />
      <SingleSelectFilter
        label="Alternative"
        value={params.alternative}
        options={ALTERNATIVE_FILTER_OPTIONS}
        allValue="any"
        onChange={(alternative) => onChange({ alternative })}
      />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
