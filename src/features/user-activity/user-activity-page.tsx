import { useEffect, useState } from 'react'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PAGE_SIZE_OPTIONS } from '@/features/user-management/use-user-list-params'
import { ActivityDetailsDrawer } from './activity-details-drawer'
import { ActivityFilters } from './activity-filters'
import { ActivityTable } from './activity-table'
import { useActivities } from './use-activity'
import { useActivityListParams } from './use-activity-list-params'

const SEARCH_DEBOUNCE_MS = 300

export const UserActivityPage = () => {
  const { params, changeFilters, goToPage, reset, hasActiveFilters } = useActivityListParams()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [openActivityId, setOpenActivityId] = useState<string | null>(null)

  const { data, error, isLoading, isPlaceholderData, refetch } = useActivities(params)

  useEffect(() => {
    if (debouncedSearch !== params.search) changeFilters({ search: debouncedSearch })
    // `changeFilters` only wraps a state setter; syncing on the debounced text is the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const resetFilters = () => {
    setSearchInput('')
    reset()
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['User Management', 'User Activity']}
        title="User Activity"
        description="Track user related activities, including account changes, role updates, and permission modifications."
      />

      <ActivityFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        params={params}
        onChange={changeFilters}
      />

      <ActivityTable
        activities={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onOpenDetails={(activity) => setOpenActivityId(activity.id)}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={resetFilters}
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

      <ActivityDetailsDrawer activityId={openActivityId} onClose={() => setOpenActivityId(null)} />
    </div>
  )
}
