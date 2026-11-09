import { MagnifyingGlassMinusIcon, PencilSimpleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { CATEGORY_LABEL, FORM_LABEL } from './bahan-config'
import type { Bahan } from './bahan-types'

type BahanTableProps = {
  items: Bahan[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onEdit: (bahan: Bahan) => void
  onDeactivate: (bahan: Bahan) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  onAdd: () => void
}

export const BahanTable = ({
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
}: BahanTableProps) => {
  const columns: DataTableColumn<Bahan>[] = [
    {
      id: 'bahan',
      header: 'Bahan',
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
    { id: 'form', header: 'Bentuk', cell: ({ row }) => FORM_LABEL[row.original.form] },
    {
      id: 'default-unit',
      header: 'Unit Default',
      cell: ({ row }) => <span className="text-text-secondary">{row.original.defaultUnit}</span>,
    },
    {
      id: 'pantry',
      header: 'Pantry',
      cell: ({ row }) =>
        row.original.isPantry ? <ToneBadge tone="info">Pantry</ToneBadge> : <ToneBadge tone="neutral">Non-pantry</ToneBadge>,
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
      getRowId={(bahan) => bahan.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No bahan found"
            description="No ingredient matches your filters. Try a different category, form, or status."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            title="No bahan yet"
            description="Add the first ingredient so recipes and matching can use it."
            action={<Button onClick={onAdd}>Add Bahan</Button>}
          />
        )
      }
    />
  )
}
