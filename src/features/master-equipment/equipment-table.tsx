import { MagnifyingGlassMinusIcon, PencilSimpleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABEL } from './equipment-config'
import type { Equipment } from './equipment-types'

type EquipmentTableProps = {
  items: Equipment[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onEdit: (equipment: Equipment) => void
  onDeactivate: (equipment: Equipment) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  onAdd: () => void
}

export const EquipmentTable = ({
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
}: EquipmentTableProps) => {
  const columns: DataTableColumn<Equipment>[] = [
    {
      id: 'equipment',
      header: 'Equipment',
      cell: ({ row }) => (
        <div className="flex min-w-40 flex-col">
          <span>{row.original.name}</span>
          {row.original.aliases.length > 0 && (
            <span className="text-caption text-text-secondary">Alias: {row.original.aliases.join(', ')}</span>
          )}
        </div>
      ),
    },
    { id: 'category', header: 'Kategori', cell: ({ row }) => CATEGORY_LABEL[row.original.category] },
    {
      id: 'alternatives',
      header: 'Alat alternatif',
      cell: ({ row }) =>
        row.original.alternatives.length > 0 ? (
          row.original.alternatives.map((alternative) => alternative.name).join(', ')
        ) : (
          <span className="text-text-secondary">—</span>
        ),
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
      getRowId={(equipment) => equipment.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No equipment found"
            description="No equipment matches your filters. Try a different category or status."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            title="No equipment yet"
            description="Add the first cooking tool so recipes and matching can use it."
            action={<Button onClick={onAdd}>Add Equipment</Button>}
          />
        )
      }
    />
  )
}
