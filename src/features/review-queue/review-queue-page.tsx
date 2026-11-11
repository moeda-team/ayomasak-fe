import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DIALOG_EXIT_MS, DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { formatDay } from '@/lib/format-date'
import { MergeDialog, RejectDialog } from './review-dialogs'
import { ReviewFilters } from './review-filters'
import { ReviewItemDrawer } from './review-item-drawer'
import { ReviewTable } from './review-table'
import { KIND_TAB_LABEL } from './review-config'
import { REVIEW_KINDS, type KindFilter, type ReviewItem } from './review-types'
import { PAGE_SIZE_OPTIONS, useReviewListParams } from './use-review-list-params'
import { useApproveItem, useMergeItem, useRejectItem, useReviewCounts, useReviewList } from './use-review'

/** Each open gets a fresh `token`, so the dialog's typed input starts empty every time. */
type RejectState = { item: ReviewItem; token: string }
type MergeState = { item: ReviewItem; token: string; targetId?: string }

const newToken = () => crypto.randomUUID()

const dateChipLabel = (from: string, to: string | undefined) => {
  const start = formatDay(`${from}T00:00:00Z`)
  return to && to !== from ? `${start} – ${formatDay(`${to}T00:00:00Z`)}` : start
}

export const ReviewQueuePage = () => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useReviewListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useReviewList(params)
  const { data: counts } = useReviewCounts()

  const [opened, setOpened] = useState<ReviewItem | null>(null)
  const [approving, setApproving] = useState<ReviewItem | null>(null)
  const [rejecting, setRejecting] = useState<RejectState | null>(null)
  const [merging, setMerging] = useState<MergeState | null>(null)

  const approveItem = useApproveItem()
  const rejectItem = useRejectItem()
  const mergeItem = useMergeItem()

  const closeApprove = () => setApproving(null)
  const closeReject = () => setRejecting(null)
  const closeMerge = () => setMerging(null)

  /** What the drawer and dialogs show; each outlives its state for the length of its exit animation. */
  const shownOpened = useRetainedValue(opened, DRAWER_EXIT_MS)
  const shownApproving = useRetainedValue(approving, DIALOG_EXIT_MS)
  const shownRejecting = useRetainedValue(rejecting, DIALOG_EXIT_MS)
  const shownMerging = useRetainedValue(merging, DIALOG_EXIT_MS)

  // A dialog opened from the drawer replaces it.
  const startApprove = (item: ReviewItem) => {
    setOpened(null)
    setApproving(item)
  }
  const startReject = (item: ReviewItem) => {
    setOpened(null)
    setRejecting({ item, token: newToken() })
  }
  const startMerge = (item: ReviewItem, targetId?: string) => {
    setOpened(null)
    setMerging({ item, token: newToken(), targetId })
  }

  const chips: FilterChip[] = [
    ...(params.sources.length > 0
      ? [
          {
            key: 'sources',
            label: `Source: ${params.sources
              .map((key) => counts?.bySource.find((source) => source.key === key)?.label ?? key)
              .join(', ')}`,
            onRemove: () => changeFilters({ sources: [] }),
          },
        ]
      : []),
    ...(params.from
      ? [
          {
            key: 'submitted',
            label: `Submitted: ${dateChipLabel(params.from, params.to)}`,
            onRemove: () => changeFilters({ from: undefined, to: undefined }),
          },
        ]
      : []),
  ]

  const tabCount = (kind: KindFilter) => {
    if (!counts) return ''
    return ` (${kind === 'all' ? counts.all : counts.byKind[kind]})`
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Master Data', 'Review Queue']}
        title="Review Queue"
        description="Verify new ingredients, equipment, and unmapped user input before they can be used in recipes and matching."
      />

      <Tabs value={params.kind} onValueChange={(kind) => changeFilters({ kind: kind as KindFilter })}>
        <TabsList aria-label="Review Queue sections">
          <TabsTrigger value="all">All{tabCount('all')}</TabsTrigger>
          {REVIEW_KINDS.map((kind) => (
            <TabsTrigger key={kind} value={kind}>
              {KIND_TAB_LABEL[kind]}
              {tabCount(kind)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={params.kind} className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <ReviewFilters
              searchInput={searchInput}
              onSearchInputChange={setSearchInput}
              params={params}
              onChange={changeFilters}
              hasActiveFilters={hasActiveFilters}
              onReset={reset}
            />
            {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
          </div>

          <ReviewTable
            items={data?.items ?? []}
            isLoading={isLoading}
            isRefreshing={isPlaceholderData}
            error={error}
            onRetry={() => void refetch()}
            onOpen={setOpened}
            onApprove={setApproving}
            onReject={startReject}
            onMerge={startMerge}
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

      <ReviewItemDrawer
        open={opened !== null}
        onOpenChange={(open) => !open && setOpened(null)}
        item={shownOpened ?? undefined}
        onApprove={startApprove}
        onReject={startReject}
        onMerge={startMerge}
      />

      <ConfirmDialog
        open={approving !== null}
        onOpenChange={(open) => !open && closeApprove()}
        title={shownApproving ? `Approve ${shownApproving.name}?` : ''}
        description="It will be marked verified and can be selected in recipes and matching."
        confirmLabel="Approve"
        pendingLabel="Approving…"
        tone="primary"
        isPending={approveItem.isPending}
        onConfirm={() => approving && approveItem.mutate(approving, { onSettled: closeApprove })}
      />

      <RejectDialog
        key={shownRejecting?.token ?? 'reject'}
        open={rejecting !== null}
        onOpenChange={(open) => !open && closeReject()}
        item={shownRejecting?.item}
        isPending={rejectItem.isPending}
        onSubmit={(reason) => rejecting && rejectItem.mutate({ item: rejecting.item, reason }, { onSettled: closeReject })}
      />

      <MergeDialog
        key={shownMerging?.token ?? 'merge'}
        open={merging !== null}
        onOpenChange={(open) => !open && closeMerge()}
        item={shownMerging?.item}
        initialTargetId={shownMerging?.targetId}
        isPending={mergeItem.isPending}
        onSubmit={(targetId) => merging && mergeItem.mutate({ item: merging.item, targetId }, { onSettled: closeMerge })}
      />
    </div>
  )
}
