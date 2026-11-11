import { CheckCircleIcon, GitBranchIcon, MagnifyingGlassMinusIcon, XCircleIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { formatDayWib } from '@/lib/format-date'
import { itemSubtitleOf, KIND_LABEL, KIND_TONE, sourceLabelOf } from './review-config'
import type { ReviewItem } from './review-types'

type ReviewTableProps = {
  items: ReviewItem[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onOpen: (item: ReviewItem) => void
  onApprove: (item: ReviewItem) => void
  onReject: (item: ReviewItem) => void
  onMerge: (item: ReviewItem) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const ReviewTable = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onOpen,
  onApprove,
  onReject,
  onMerge,
  hasActiveFilters,
  onResetFilters,
}: ReviewTableProps) => {
  const columns: DataTableColumn<ReviewItem>[] = [
    {
      id: 'item',
      header: 'Item',
      cell: ({ row }) => {
        const subtitle = itemSubtitleOf(row.original)
        return (
          <button
            type="button"
            onClick={() => onOpen(row.original)}
            aria-label={`Review ${row.original.name}`}
            className="-mx-2 flex min-w-40 flex-col rounded-md px-2 py-1 text-left outline-none transition-colors hover:bg-surface-subtle focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            <span>{row.original.name}</span>
            {subtitle && <span className="text-caption text-text-secondary">{subtitle}</span>}
          </button>
        )
      },
    },
    {
      id: 'kind',
      header: 'Tipe',
      cell: ({ row }) => <ToneBadge tone={KIND_TONE[row.original.kind]}>{KIND_LABEL[row.original.kind]}</ToneBadge>,
    },
    { id: 'source', header: 'Sumber', cell: ({ row }) => <span className="whitespace-nowrap">{sourceLabelOf(row.original.source)}</span> },
    {
      id: 'submitted',
      header: 'Diajukan',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDayWib(row.original.submittedAt)}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon-sm" aria-label={`Approve ${row.original.name}`} onClick={() => onApprove(row.original)}>
            <CheckCircleIcon aria-hidden />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label={`Reject ${row.original.name}`} onClick={() => onReject(row.original)}>
            <XCircleIcon aria-hidden />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label={`Merge ${row.original.name}`} onClick={() => onMerge(row.original)}>
            <GitBranchIcon aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(item) => item.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No items found"
            description="No review item matches your filters. Try a different type, source, or date."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="Review queue is empty"
            description="Every new item and unmapped input has been reviewed. New submissions will show up here."
          />
        )
      }
    />
  )
}
