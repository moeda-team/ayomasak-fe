import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { formatDay } from '@/lib/format-date'
import { ModerationFilters } from './moderation-filters'
import { ModerationTable } from './moderation-table'
import { REASON_LABEL, STATUS_LABEL } from './moderation-config'
import { POST_STATUSES, type ModerationAction, type ReportedPost, type StatusFilter } from './moderation-types'
import { useModerationCounts, useModerationList, useModeratePost } from './use-moderation'
import { PAGE_SIZE_OPTIONS, useModerationListParams } from './use-moderation-list-params'

/** Hiding and removing ask first; keeping only dismisses reports, so it runs at once. */
type PendingAction = { post: ReportedPost; action: Exclude<ModerationAction, 'keep'> }

const dateChipLabel = (from: string, to: string | undefined) => {
  const start = formatDay(`${from}T00:00:00Z`)
  return to && to !== from ? `${start} – ${formatDay(`${to}T00:00:00Z`)}` : start
}

export const ModerationQueuePage = () => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useModerationListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useModerationList(params)
  const { data: counts } = useModerationCounts()
  const moderatePost = useModeratePost()

  const [pending, setPending] = useState<PendingAction | null>(null)
  const closePending = () => setPending(null)
  const shownPending = useRetainedValue(pending, DIALOG_EXIT_MS)

  const handleAct = (post: ReportedPost, action: ModerationAction) => {
    if (action === 'keep') moderatePost.mutate({ post, action })
    else setPending({ post, action })
  }

  const chips: FilterChip[] = [
    ...(params.reason !== 'all'
      ? [{ key: 'reason', label: `Reason: ${REASON_LABEL[params.reason]}`, onRemove: () => changeFilters({ reason: 'all' }) }]
      : []),
    ...(params.from
      ? [
          {
            key: 'reported',
            label: `Reported: ${dateChipLabel(params.from, params.to)}`,
            onRemove: () => changeFilters({ from: undefined, to: undefined }),
          },
        ]
      : []),
  ]

  const tabCount = (status: StatusFilter) => {
    if (!counts) return ''
    return ` (${status === 'all' ? counts.all : counts.byStatus[status]})`
  }

  const isHide = shownPending?.action === 'hide'

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Moderation Queue']}
        title="Moderation Queue"
        description="Review reported cooking results and decide whether to keep, hide or remove them."
      />

      <Tabs value={params.status} onValueChange={(status) => changeFilters({ status: status as StatusFilter })}>
        <TabsList aria-label="Moderation Queue sections">
          {POST_STATUSES.map((status) => (
            <TabsTrigger key={status} value={status}>
              {STATUS_LABEL[status]}
              {tabCount(status)}
            </TabsTrigger>
          ))}
          <TabsTrigger value="all">All{tabCount('all')}</TabsTrigger>
        </TabsList>

        <TabsContent value={params.status} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <ModerationFilters
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              params={params}
              onChange={changeFilters}
              hasActiveFilters={hasActiveFilters}
              onReset={reset}
            />
            {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
          </div>

          <ModerationTable
            items={data?.items ?? []}
            tab={params.status}
            isLoading={isLoading}
            isRefreshing={isPlaceholderData}
            error={error}
            onRetry={() => void refetch()}
            onAct={handleAct}
            hasActiveFilters={hasActiveFilters}
            onResetFilters={reset}
          />

          {data && data.total > 0 && (
            <DataTablePagination
              page={params.page}
              pageSize={params.pageSize}
              total={data.total}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              onPageChange={goToPage}
              onPageSizeChange={(pageSize) => changeFilters({ pageSize })}
            />
          )}
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(open) => !open && closePending()}
        title={shownPending ? `${isHide ? 'Hide' : 'Remove'} “${shownPending.post.title}”?` : ''}
        description={
          isHide
            ? 'The post is hidden from other users. You can keep it again later to make it visible.'
            : 'The post is removed for everyone. You can still keep it again later to restore it.'
        }
        confirmLabel={isHide ? 'Hide' : 'Remove'}
        pendingLabel={isHide ? 'Hiding…' : 'Removing…'}
        tone={isHide ? 'primary' : 'danger'}
        isPending={moderatePost.isPending}
        onConfirm={() => pending && moderatePost.mutate(pending, { onSettled: closePending })}
      />
    </div>
  )
}
