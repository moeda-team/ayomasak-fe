import { ArrowRightIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { Button } from '@/components/ui/button'
import { formatDayWib, formatTimeWib } from '@/lib/format-date'
import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import { AuditActionBadge, AuditStatusBadge } from './audit-badges'
import { ENTITY_LABEL } from './audit-labels'
import type { AuditLog } from './audit-types'

type AuditTableProps = {
  logs: AuditLog[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onOpenDetails: (log: AuditLog) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export const AuditTable = ({
  logs,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onOpenDetails,
  hasActiveFilters,
  onClearFilters,
}: AuditTableProps) => {
  const columns: DataTableColumn<AuditLog>[] = [
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
      id: 'actor',
      header: 'Actor',
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
      cell: ({ row }) => <AuditActionBadge action={row.original.action} />,
    },
    {
      id: 'entity',
      header: 'Entity',
      cell: ({ row }) => (
        <span className="block min-w-48">
          {ENTITY_LABEL[row.original.entityType]} · {row.original.entityName}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <AuditStatusBadge status={row.original.status} />,
    },
    {
      id: 'open',
      header: () => <span className="sr-only">View details</span>,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`View details: ${ENTITY_LABEL[row.original.entityType]} ${row.original.entityName}`}
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
      data={logs}
      getRowId={(log) => log.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassIcon}
            title="No audit logs found"
            description="No audit log entries match your filters. Try a different entity, action, status, or date range."
            action={<Button onClick={onClearFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState title="No audit logs yet" description="Critical admin actions will show up here as they happen." />
        )
      }
    />
  )
}
