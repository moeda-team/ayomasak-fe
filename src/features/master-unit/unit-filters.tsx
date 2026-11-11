import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { BASIS_FILTER_OPTIONS, RULES_FILTER_OPTIONS, STATUS_FILTER_OPTIONS, TYPE_LABEL } from './unit-config'
import { UNIT_TYPES, type UnitListParams } from './unit-types'
import { useUnitCounts } from './use-units'

type FilterChange = Partial<Pick<UnitListParams, 'types' | 'basis' | 'status' | 'rules'>>

type UnitFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: UnitListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const UnitFilters = ({ searchInput, onSearchInputChange, params, onChange, hasActiveFilters, onReset }: UnitFiltersProps) => {
  const { data: counts } = useUnitCounts()

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search unit or alias"
        placeholder="Search unit or alias…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter
        label="Tipe"
        searchPlaceholder="Search type"
        options={UNIT_TYPES.map((type) => ({ value: type, label: TYPE_LABEL[type], count: counts?.byType[type] }))}
        value={params.types}
        onApply={(types) => onChange({ types })}
      />
      <SingleSelectFilter label="Basis" value={params.basis} options={BASIS_FILTER_OPTIONS} allValue="all" onChange={(basis) => onChange({ basis })} />
      <SingleSelectFilter label="Status" value={params.status} options={STATUS_FILTER_OPTIONS} allValue="all" onChange={(status) => onChange({ status })} />
      <SingleSelectFilter label="Konversi" value={params.rules} options={RULES_FILTER_OPTIONS} allValue="all" onChange={(rules) => onChange({ rules })} />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
