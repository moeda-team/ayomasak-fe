import { MagnifyingGlassMinusIcon, PencilSimpleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { TYPE_LABEL } from './unit-config'
import type { Unit } from './unit-types'

type UnitTableProps = {
  items: Unit[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onEdit: (unit: Unit) => void
  onDeactivate: (unit: Unit) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  onAdd: () => void
}

export const UnitTable = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onEdit,
  onDeactivate,
  hasActiveFilters,
  onResetFilters,
  onAdd,
}: UnitTableProps) => {
  const columns: DataTableColumn<Unit>[] = [
    {
      id: 'unit',
      header: 'Unit',
      cell: ({ row }) => (
        <div className="flex min-w-40 flex-col">
          <span>{row.original.name}</span>
          {row.original.aliases.length > 0 && (
            <span className="text-caption text-text-secondary">Alias: {row.original.aliases.join(', ')}</span>
          )}
        </div>
      ),
    },
    { id: 'type', header: 'Tipe', cell: ({ row }) => TYPE_LABEL[row.original.type] },
    { id: 'symbol', header: 'Simbol', cell: ({ row }) => row.original.symbol },
    {
      id: 'rules',
      header: 'Konversi',
      cell: ({ row }) => <span className="text-text-secondary">{row.original.ruleCount} aturan</span>,
    },
    {
      id: 'basis',
      header: 'Basis',
      cell: ({ row }) =>
        row.original.isBase ? <ToneBadge tone="info">Base</ToneBadge> : <ToneBadge tone="neutral">Derived</ToneBadge>,
    },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon-sm" aria-label={`Edit ${row.original.name}`} onClick={() => onEdit(row.original)}>
            <PencilSimpleIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Deactivate ${row.original.name}`}
            disabled={row.original.status === 'inactive'}
            onClick={() => onDeactivate(row.original)}
          >
            <ProhibitIcon aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(unit) => unit.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No units found"
            description="No unit matches your filters. Try a different type, basis, or status."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            title="No units yet"
            description="Add the first measurement unit so recipes and ingredient quantities can use it."
            action={<Button onClick={onAdd}>Add Unit</Button>}
          />
        )
      }
    />
  )
}
