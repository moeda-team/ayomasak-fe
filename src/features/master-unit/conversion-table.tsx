import { MagnifyingGlassMinusIcon, PencilSimpleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { StatusBadge } from '@/components/shared/status-badge'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { SCOPE_LABEL } from './unit-config'
import type { Conversion } from './unit-types'

type ConversionTableProps = {
  items: Conversion[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onEdit: (conversion: Conversion) => void
  onDelete: (conversion: Conversion) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  onAdd: () => void
}

export const ConversionTable = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onEdit,
  onDelete,
  hasActiveFilters,
  onResetFilters,
  onAdd,
}: ConversionTableProps) => {
  const columns: DataTableColumn<Conversion>[] = [
    {
      id: 'conversion',
      header: 'Konversi',
      cell: ({ row }) => (
        <div className="flex min-w-48 flex-col">
          <span>
            {row.original.from.name} → {row.original.to.name}
          </span>
          <span className="text-caption text-text-secondary">
            {row.original.bahanName ? `Bahan: ${row.original.bahanName}` : 'Berlaku untuk semua bahan'}
          </span>
        </div>
      ),
    },
    { id: 'from', header: 'Dari', cell: ({ row }) => row.original.from.symbol },
    { id: 'to', header: 'Ke', cell: ({ row }) => row.original.to.symbol },
    {
      id: 'factor',
      header: 'Faktor',
      cell: ({ row }) => <span className="text-text-secondary">× {row.original.factor}</span>,
    },
    {
      id: 'scope',
      header: 'Cakupan',
      cell: ({ row }) => (
        <ToneBadge tone={row.original.scope === 'global' ? 'info' : 'neutral'}>{SCOPE_LABEL[row.original.scope]}</ToneBadge>
      ),
    },
    { id: 'status', header: 'Status', cell: ({ row }) => <StatusBadge status={row.original.status} /> },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const label = `${row.original.from.symbol} → ${row.original.to.symbol}`
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="icon-sm" aria-label={`Edit ${label}`} onClick={() => onEdit(row.original)}>
              <PencilSimpleIcon aria-hidden />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label={`Delete ${label}`} onClick={() => onDelete(row.original)}>
              <ProhibitIcon aria-hidden />
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(conversion) => conversion.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No conversions found"
            description="No conversion matches your filters. Try a different scope, unit, or status."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            title="No conversions yet"
            description="Add the first conversion so recipes can switch between units."
            action={<Button onClick={onAdd}>Add Conversion</Button>}
          />
        )
      }
    />
  )
}
