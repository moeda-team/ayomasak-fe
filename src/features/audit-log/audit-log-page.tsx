import { DownloadSimpleIcon } from '@phosphor-icons/react'
import { useEffect, useState } from 'react'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { PAGE_SIZE_OPTIONS } from '@/features/user-management/use-user-list-params'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { AuditDetailsDrawer } from './audit-details-drawer'
import { AuditFilters } from './audit-filters'
import { ACTION_LABEL, ENTITY_LABEL, STATUS_LABEL } from './audit-labels'
import { AuditTable } from './audit-table'
import { ExportDialog } from './export-dialog'
import { useAuditLogs } from './use-audit-log'
import { useAuditListParams } from './use-audit-list-params'

const SEARCH_DEBOUNCE_MS = 300

export const AuditLogPage = () => {
  const { params, changeFilters, goToPage, reset, hasActiveFilters } = useAuditListParams()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [openLogId, setOpenLogId] = useState<string | null>(null)
  const [isExportOpen, setIsExportOpen] = useState(false)
  /** Stays mounted while the dialog plays its exit animation, and is unmounted after so it opens fresh next time. */
  const isExportMounted = useRetainedValue(isExportOpen || null, DIALOG_EXIT_MS) !== null

  const { data, error, isLoading, isPlaceholderData, refetch } = useAuditLogs(params)

  useEffect(() => {
    if (debouncedSearch !== params.search) changeFilters({ search: debouncedSearch })
    // `changeFilters` only wraps a state setter; syncing on the debounced text is the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const resetFilters = () => {
    setSearchInput('')
    reset()
  }

  const chips: FilterChip[] = [
    ...params.entityTypes.map((type) => ({
      key: `entity-${type}`,
      label: `Entity: ${ENTITY_LABEL[type]}`,
      onRemove: () => changeFilters({ entityTypes: params.entityTypes.filter((selected) => selected !== type) }),
    })),
    ...(params.action !== 'all'
      ? [{ key: 'action', label: `Action: ${ACTION_LABEL[params.action]}`, onRemove: () => changeFilters({ action: 'all' }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Audit Log']}
        title="Audit Log"
        description="Review critical admin actions across recipes, master data, nutrition, roles, and system configuration."
        action={
          <Button variant="outline" onClick={() => setIsExportOpen(true)}>
            <DownloadSimpleIcon aria-hidden />
            Export
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <AuditFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
        {chips.length > 0 && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <AuditTable
        logs={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onOpenDetails={(log) => setOpenLogId(log.id)}
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

      <AuditDetailsDrawer logId={openLogId} onClose={() => setOpenLogId(null)} />
      {isExportMounted && <ExportDialog open={isExportOpen} onOpenChange={setIsExportOpen} params={params} />}
    </div>
  )
}
