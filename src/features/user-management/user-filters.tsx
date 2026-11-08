import type { DateRange } from 'react-day-picker'
import { DateRangeFilter } from '@/components/shared/date-range-filter'
import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { fromIsoDay, toIsoDay } from '@/lib/iso-day'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter, type FilterOption } from '@/components/shared/single-select-filter'
import { useRoleOptions } from './use-users'
import type { RoleId, StatusFilter, UserListParams } from './user-types'

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'non-active', label: 'Non Active' },
]

const toDateRange = ({ joinedFrom, joinedTo }: UserListParams): DateRange | undefined =>
  joinedFrom ? { from: fromIsoDay(joinedFrom), to: joinedTo ? fromIsoDay(joinedTo) : undefined } : undefined

type FilterChange = Partial<Pick<UserListParams, 'search' | 'roleIds' | 'status' | 'joinedFrom' | 'joinedTo'>>

type UserFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: UserListParams
  onChange: (change: FilterChange) => void
}

export const UserFilters = ({ searchInput, onSearchInputChange, params, onChange }: UserFiltersProps) => {
  const { data: roles = [] } = useRoleOptions()

  const handleDateRange = (range: DateRange | undefined) =>
    onChange({
      joinedFrom: range?.from ? toIsoDay(range.from) : undefined,
      joinedTo: range?.from ? toIsoDay(range.to ?? range.from) : undefined,
    })

  return (
    <div
      role="search"
      className="surface-card flex flex-wrap items-center gap-3 p-3"
    >
      <SearchField
        aria-label="Search users by name or email"
        placeholder="Search name or email…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter<RoleId>
        label="Role"
        searchPlaceholder="Search role"
        options={roles.map((role) => ({ value: role.id, label: role.label, count: role.userCount }))}
        value={params.roleIds}
        onApply={(roleIds) => onChange({ roleIds })}
      />
      <SingleSelectFilter
        label="Status"
        value={params.status}
        options={STATUS_OPTIONS}
        allValue="all"
        onChange={(status) => onChange({ status })}
      />
      <DateRangeFilter label="Join date" emptyLabel="All time" value={toDateRange(params)} onApply={handleDateRange} />
    </div>
  )
}
