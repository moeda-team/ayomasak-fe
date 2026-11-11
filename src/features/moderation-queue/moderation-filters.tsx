import type { DateRange } from 'react-day-picker'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { fromIsoDay, toIsoDay } from '@/lib/iso-day'
import { REASON_FILTER_OPTIONS } from './moderation-config'
import type { ModerationListParams } from './moderation-types'

type FilterChange = Partial<Pick<ModerationListParams, 'reason' | 'from' | 'to'>>

type ModerationFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: ModerationListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

const toDateRange = ({ from, to }: ModerationListParams): DateRange | undefined =>
  from ? { from: fromIsoDay(from), to: to ? fromIsoDay(to) : undefined } : undefined

export const ModerationFilters = ({
  searchInput,
  onSearchInputChange,
  params,
  onChange,
  hasActiveFilters,
  onReset,
}: ModerationFiltersProps) => {
  const handleDateRange = (range: DateRange | undefined) =>
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.from ? toIsoDay(range.to ?? range.from) : undefined,
    })

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search post, caption or user"
        placeholder="Search post, caption or user…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <SingleSelectFilter
        label="Reason"
        value={params.reason}
        options={REASON_FILTER_OPTIONS}
        allValue="all"
        onChange={(reason) => onChange({ reason })}
      />
      <DateRangeFilter label="Reported" emptyLabel="Any date" value={toDateRange(params)} onApply={handleDateRange} />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
