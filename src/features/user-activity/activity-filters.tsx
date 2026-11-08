import type { DateRange } from 'react-day-picker'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter, type FilterOption } from '@/components/shared/single-select-filter'
import { listRoleRecords } from '@/features/user-management/role-registry'
import type { RoleId } from '@/features/user-management/user-types'
import { ACTION_OPTIONS } from './action-badge'
import type { ActionFilter, ActivityListParams } from './activity-types'
import { useActivityRoleCounts, useActors } from './use-activity'

const toIsoDay = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const fromIsoDay = (day: string) => {
  const [year, month, date] = day.split('-').map(Number)
  return new Date(year ?? 0, (month ?? 1) - 1, date ?? 1)
}

const toDateRange = ({ from, to }: ActivityListParams): DateRange | undefined =>
  from ? { from: fromIsoDay(from), to: to ? fromIsoDay(to) : undefined } : undefined

const ACTION_FILTER_OPTIONS: FilterOption<ActionFilter>[] = [{ value: 'all', label: 'All' }, ...ACTION_OPTIONS]

type FilterChange = Partial<Pick<ActivityListParams, 'search' | 'roleIds' | 'action' | 'actorId' | 'from' | 'to'>>

type ActivityFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: ActivityListParams
  onChange: (change: FilterChange) => void
}

export const ActivityFilters = ({ searchInput, onSearchInputChange, params, onChange }: ActivityFiltersProps) => {
  const { data: actors = [] } = useActors()
  const { data: roleCounts } = useActivityRoleCounts()

  const actorOptions: FilterOption<string>[] = [
    { value: 'all', label: 'All' },
    ...actors.map((actor) => ({ value: actor.id, label: actor.name })),
  ]

  const handleDateRange = (range: DateRange | undefined) =>
    onChange({
      from: range?.from ? toIsoDay(range.from) : undefined,
      to: range?.from ? toIsoDay(range.to ?? range.from) : undefined,
    })

  return (
    <div
      role="search"
      className="surface-card flex flex-wrap items-center gap-3 p-3"
    >
      <SearchField
        aria-label="Search activity by user or details"
        placeholder="Search user or details…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter<RoleId>
        label="Role"
        searchPlaceholder="Search role"
        options={listRoleRecords().map((role) => ({ value: role.id, label: role.name, count: roleCounts?.[role.id] ?? 0 }))}
        value={params.roleIds}
        onApply={(roleIds) => onChange({ roleIds })}
      />
      <SingleSelectFilter
        label="Action"
        value={params.action}
        options={ACTION_FILTER_OPTIONS}
        allValue="all"
        onChange={(action) => onChange({ action })}
      />
      <SingleSelectFilter
        label="Performed by"
        value={params.actorId}
        options={actorOptions}
        allValue="all"
        onChange={(actorId) => onChange({ actorId })}
      />
      <DateRangeFilter label="Date" emptyLabel="All time" value={toDateRange(params)} onApply={handleDateRange} />
    </div>
  )
}
