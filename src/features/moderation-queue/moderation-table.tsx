import { CheckCircleIcon, MagnifyingGlassMinusIcon, TrashIcon, XCircleIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { formatDayWib } from '@/lib/format-date'
import { REASON_LABEL, REASON_TONE, STATUS_LABEL, STATUS_TONE } from './moderation-config'
import type { ModerationAction, ReportedPost, StatusFilter } from './moderation-types'

const EMPTY_COPY: Record<StatusFilter, { title: string; description: string }> = {
  reported: { title: 'No reported posts', description: 'Posts that users report will show up here.' },
  hidden: { title: 'No hidden posts', description: 'Posts you hide will show up here.' },
  removed: { title: 'No removed posts', description: 'Posts you remove will show up here.' },
  all: { title: 'Moderation queue is empty', description: 'No post has been reported yet. Reports will show up here.' },
}

type ModerationTableProps = {
  items: ReportedPost[]
  /** The open tab; the All tab also shows each post's status. */
  tab: StatusFilter
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onAct: (post: ReportedPost, action: ModerationAction) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const ModerationTable = ({
  items,
  tab,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onAct,
  hasActiveFilters,
  onResetFilters,
}: ModerationTableProps) => {
  const statusColumn: DataTableColumn<ReportedPost>[] =
    tab === 'all'
      ? [
          {
            id: 'status',
            header: 'Status',
            cell: ({ row }) => <ToneBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</ToneBadge>,
          },
        ]
      : []

  const columns: DataTableColumn<ReportedPost>[] = [
    {
      id: 'post',
      header: 'Post',
      cell: ({ row }) => (
        <div className="flex min-w-48 flex-col">
          <span>{row.original.title}</span>
          <span className="text-caption text-text-secondary">
            by {row.original.authorName} · {row.original.recipeTitle}
          </span>
        </div>
      ),
    },
    {
      id: 'reason',
      header: 'Reason',
      cell: ({ row }) => <ToneBadge tone={REASON_TONE[row.original.reason]}>{REASON_LABEL[row.original.reason]}</ToneBadge>,
    },
    ...statusColumn,
    {
      id: 'reports',
      header: 'Reports',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {row.original.reportCount} {row.original.reportCount === 1 ? 'report' : 'reports'}
        </span>
      ),
    },
    {
      id: 'lastReported',
      header: 'Last reported',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDayWib(row.original.lastReportedAt)}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="icon-sm" aria-label={`Keep ${row.original.title}`} onClick={() => onAct(row.original, 'keep')}>
            <CheckCircleIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Hide ${row.original.title}`}
            disabled={row.original.status !== 'reported'}
            onClick={() => onAct(row.original, 'hide')}
          >
            <XCircleIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Remove ${row.original.title}`}
            disabled={row.original.status === 'removed'}
            onClick={() => onAct(row.original, 'remove')}
          >
            <TrashIcon aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(post) => post.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No posts found"
            description="No post matches your filters. Try a different reason or date."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState icon={MagnifyingGlassMinusIcon} {...EMPTY_COPY[tab]} />
        )
      }
    />
  )
}
