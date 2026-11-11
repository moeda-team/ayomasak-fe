import type { DateRange } from 'react-day-picker'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { fromIsoDay, toIsoDay } from '@/lib/iso-day'
import type { ReviewListParams } from './review-types'
import { useReviewCounts } from './use-review'

type FilterChange = Partial<Pick<ReviewListParams, 'sources' | 'from' | 'to'>>

type ReviewFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: ReviewListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

const toDateRange = ({ from, to }: ReviewListParams): DateRange | undefined =>
  from ? { from: fromIsoDay(from), to: to ? fromIsoDay(to) : undefined } : undefined

export const ReviewFilters = ({ searchInput, onSearchInputChange, params, onChange, hasActiveFilters, onReset }: ReviewFiltersProps) => {
  const { data: counts } = useReviewCounts()

  const handleDateRange = (range: DateRange | undefined) =>
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.from ? toIsoDay(range.to ?? range.from) : undefined,
    })

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search item or raw input"
        placeholder="Search item or raw input…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter
        label="Source"
        searchPlaceholder="Search source"
        options={(counts?.bySource ?? []).map((source) => ({ value: source.key, label: source.label, count: source.count }))}
        value={params.sources}
        onApply={(sources) => onChange({ sources })}
      />
      <DateRangeFilter label="Submitted" emptyLabel="Any date" value={toDateRange(params)} onApply={handleDateRange} />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
