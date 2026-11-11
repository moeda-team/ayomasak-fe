import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { SCOPE_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from './unit-config'
import type { ConversionListParams } from './unit-types'
import { useUnitRefs } from './use-units'

type FilterChange = Partial<Pick<ConversionListParams, 'scope' | 'fromId' | 'toId' | 'status'>>

type ConversionFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: ConversionListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const ConversionFilters = ({
  searchInput,
  onSearchInputChange,
  params,
  onChange,
  hasActiveFilters,
  onReset,
}: ConversionFiltersProps) => {
  const { data: units = [] } = useUnitRefs()
  const unitOptions = [{ value: 'all', label: 'All' }, ...units.map((unit) => ({ value: unit.id, label: unit.symbol }))]

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search conversion"
        placeholder="Search conversion…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <SingleSelectFilter label="Scope" value={params.scope} options={SCOPE_FILTER_OPTIONS} allValue="all" onChange={(scope) => onChange({ scope })} />
      <SingleSelectFilter label="From" value={params.fromId} options={unitOptions} allValue="all" onChange={(fromId) => onChange({ fromId })} />
      <SingleSelectFilter label="Status" value={params.status} options={STATUS_FILTER_OPTIONS} allValue="all" onChange={(status) => onChange({ status })} />
      <SingleSelectFilter label="To" value={params.toId} options={unitOptions} allValue="all" onChange={(toId) => onChange({ toId })} />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
