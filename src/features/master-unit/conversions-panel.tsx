import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { ConversionFilters } from './conversion-filters'
import { ConversionTable } from './conversion-table'
import { SCOPE_LABEL, STATUS_LABEL } from './unit-config'
import type { Conversion } from './unit-types'
import { useConversionList } from './use-conversions'
import { PAGE_SIZE_OPTIONS, useConversionListParams } from './use-unit-list-params'
import { useUnitRefs } from './use-units'

type ConversionsPanelProps = {
  onAdd: () => void
  onEdit: (conversion: Conversion) => void
  onDelete: (conversion: Conversion) => void
}

/** The Conversions tab: filters, table and pagination. The drawer and dialog live on the page. */
export const ConversionsPanel = ({ onAdd, onEdit, onDelete }: ConversionsPanelProps) => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useConversionListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useConversionList(params)
  const { data: units = [] } = useUnitRefs()

  const symbolOf = (id: string) => units.find((unit) => unit.id === id)?.symbol ?? id

  const chips: FilterChip[] = [
    ...(params.scope !== 'all'
      ? [{ key: 'scope', label: `Scope: ${SCOPE_LABEL[params.scope]}`, onRemove: () => changeFilters({ scope: 'all' }) }]
      : []),
    ...(params.fromId !== 'all'
      ? [{ key: 'from', label: `From: ${symbolOf(params.fromId)}`, onRemove: () => changeFilters({ fromId: 'all' }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.toId !== 'all'
      ? [{ key: 'to', label: `To: ${symbolOf(params.toId)}`, onRemove: () => changeFilters({ toId: 'all' }) }]
      : []),
  ]

  return (
    <>
      <div className="flex flex-col gap-3">
        <ConversionFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <ConversionTable
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onEdit={onEdit}
        onDelete={onDelete}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={reset}
        onAdd={onAdd}
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
    </>
  )
}
