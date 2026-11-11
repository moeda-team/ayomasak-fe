import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { BASIS_LABEL, RULES_LABEL, STATUS_LABEL, TYPE_LABEL } from './unit-config'
import { UnitFilters } from './unit-filters'
import { UnitTable } from './unit-table'
import type { Unit } from './unit-types'
import { PAGE_SIZE_OPTIONS, useUnitListParams } from './use-unit-list-params'
import { useUnitList } from './use-units'

type UnitsPanelProps = {
  onAdd: () => void
  onEdit: (unit: Unit) => void
  onDeactivate: (unit: Unit) => void
}

/** The Units tab: filters, table and pagination. The drawer and dialog live on the page. */
export const UnitsPanel = ({ onAdd, onEdit, onDeactivate }: UnitsPanelProps) => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useUnitListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useUnitList(params)

  const chips: FilterChip[] = [
    ...(params.types.length > 0
      ? [
          {
            key: 'type',
            label: `Tipe: ${params.types.map((type) => TYPE_LABEL[type]).join(', ')}`,
            onRemove: () => changeFilters({ types: [] }),
          },
        ]
      : []),
    ...(params.basis !== 'all'
      ? [{ key: 'basis', label: `Basis: ${BASIS_LABEL[params.basis]}`, onRemove: () => changeFilters({ basis: 'all' }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.rules !== 'all'
      ? [{ key: 'rules', label: `Konversi: ${RULES_LABEL[params.rules]}`, onRemove: () => changeFilters({ rules: 'all' }) }]
      : []),
  ]

  return (
    <>
      <div className="flex flex-col gap-3">
        <UnitFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <UnitTable
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onEdit={onEdit}
        onDeactivate={onDeactivate}
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
