import type { DateRange } from 'react-day-picker'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter, type FilterOption } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { fromIsoDay, toIsoDay } from '@/lib/iso-day'
import { ACTION_OPTIONS, ENTITY_LABEL, STATUS_OPTIONS } from './audit-labels'
import { AUDIT_ENTITY_TYPES, type ActionFilter, type AuditEntityType, type AuditListParams, type StatusFilter } from './audit-types'
import { useAuditEntityCounts } from './use-audit-log'

const ACTION_FILTER_OPTIONS: FilterOption<ActionFilter>[] = [{ value: 'all', label: 'All' }, ...ACTION_OPTIONS]
const STATUS_FILTER_OPTIONS: FilterOption<StatusFilter>[] = [{ value: 'all', label: 'All' }, ...STATUS_OPTIONS]

const toDateRange = ({ from, to }: AuditListParams): DateRange | undefined =>
  from ? { from: fromIsoDay(from), to: to ? fromIsoDay(to) : undefined } : undefined

type FilterChange = Partial<Pick<AuditListParams, 'search' | 'entityTypes' | 'action' | 'status' | 'from' | 'to'>>

type AuditFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: AuditListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const AuditFilters = ({
  searchInput,
  onSearchInputChange,
  params,
  onChange,
  hasActiveFilters,
  onReset,
}: AuditFiltersProps) => {
  const { data: entityCounts } = useAuditEntityCounts()

  const handleDateRange = (range: DateRange | undefined) =>
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.from ? toIsoDay(range.to ?? range.from) : undefined,
    })

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search audit log by actor or entity"
        placeholder="Search actor or entity…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter<AuditEntityType>
        label="Entity"
        searchPlaceholder="Search entity"
        options={AUDIT_ENTITY_TYPES.map((type) => ({ value: type, label: ENTITY_LABEL[type], count: entityCounts?.[type] }))}
        value={params.entityTypes}
        onApply={(entityTypes) => onChange({ entityTypes })}
      />
      <SingleSelectFilter
        label="Action"
        value={params.action}
        options={ACTION_FILTER_OPTIONS}
        allValue="all"
        onChange={(action) => onChange({ action })}
      />
      <SingleSelectFilter
        label="Status"
        value={params.status}
        options={STATUS_FILTER_OPTIONS}
        allValue="all"
        onChange={(status) => onChange({ status })}
      />
      <DateRangeFilter label="Date" emptyLabel="All time" value={toDateRange(params)} onApply={handleDateRange} />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
