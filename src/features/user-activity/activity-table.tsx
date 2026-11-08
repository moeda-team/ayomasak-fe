import { ArrowRightIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { Button } from '@/components/ui/button'
import { formatDayWib, formatTimeWib } from '@/lib/format-date'
import { ActionBadge } from './action-badge'
import type { Activity } from './activity-types'

type ActivityTableProps = {
  activities: Activity[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onOpenDetails: (activity: Activity) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export const ActivityTable = ({
  activities,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onOpenDetails,
  hasActiveFilters,
  onClearFilters,
}: ActivityTableProps) => {
  const columns: DataTableColumn<Activity>[] = [
    {
      id: 'when',
      header: 'Date & Time',
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap text-text-secondary">
          <span>{formatDayWib(row.original.occurredAt)}</span>
          <span>{formatTimeWib(row.original.occurredAt)}</span>
        </div>
      ),
    },
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => (
        <PersonCell
          className="min-w-44"
          name={row.original.actor.name}
          email={row.original.actor.email}
          colorIndex={toColorIndex(row.original.actor.id)}
        />
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => <ActionBadge action={row.original.action} />,
    },
    {
      id: 'target',
      header: 'Target User',
      cell: ({ row }) => (
        <PersonCell className="min-w-40" name={row.original.target.name} colorIndex={toColorIndex(row.original.target.email)} />
      ),
    },
    {
      id: 'details',
      header: 'Details',
      cell: ({ row }) => <span className="block min-w-48">{row.original.details}</span>,
    },
    {
      id: 'open',
      header: () => <span className="sr-only">View details</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`View details: ${row.original.details}, ${row.original.target.name}`}
            onClick={() => onOpenDetails(row.original)}
          >
            <ArrowRightIcon aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={activities}
      getRowId={(activity) => activity.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            title="No activity matches your filters"
            description="Try a different search or widen the date range."
            action={
              <Button variant="outline" onClick={onClearFilters}>
                Reset filters
              </Button>
            }
          />
        ) : (
          <EmptyState title="No activity yet" description="Account changes will show up here as they happen." />
        )
      }
    />
  )
}
