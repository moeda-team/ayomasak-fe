import { PlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { MASTER_STATUS_LABEL } from '@/features/master-data/master-status'
import { DIALOG_EXIT_MS, DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { ALTERNATIVE_LABEL, CATEGORY_LABEL } from './equipment-config'
import { EquipmentFilters } from './equipment-filters'
import { EquipmentFormDrawer } from './equipment-form-drawer'
import { EquipmentTable } from './equipment-table'
import type { Equipment, EquipmentFormValues } from './equipment-types'
import { useCreateEquipment, useDeactivateEquipment, useEquipmentList, useUpdateEquipment } from './use-equipment'
import { PAGE_SIZE_OPTIONS, useEquipmentListParams } from './use-equipment-list-params'

type FormState = { kind: 'create' } | { kind: 'edit'; equipment: Equipment }

export const MasterEquipmentPage = () => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useEquipmentListParams()
  const [form, setForm] = useState<FormState | null>(null)
  const [deactivating, setDeactivating] = useState<Equipment | null>(null)

  const { data, error, isLoading, isPlaceholderData, refetch } = useEquipmentList(params)
  const createEquipment = useCreateEquipment()
  const updateEquipment = useUpdateEquipment()
  const deactivateEquipment = useDeactivateEquipment()

  const closeForm = () => setForm(null)
  const closeDeactivate = () => setDeactivating(null)

  const handleSubmit = (values: EquipmentFormValues) => {
    if (form?.kind === 'edit') updateEquipment.mutate({ id: form.equipment.id, values }, { onSuccess: closeForm })
    else createEquipment.mutate(values, { onSuccess: closeForm })
  }

  const handleDeactivate = () => {
    if (!deactivating) return
    deactivateEquipment.mutate(deactivating, { onSettled: closeDeactivate })
  }

  /** What the drawer and dialog show; it outlives its state for the length of their exit animation. */
  const shownForm = useRetainedValue(form, DRAWER_EXIT_MS)
  const shownDeactivating = useRetainedValue(deactivating, DIALOG_EXIT_MS)

  const chips: FilterChip[] = [
    ...(params.categories.length > 0
      ? [
          {
            key: 'category',
            label: `Category: ${params.categories.map((category) => CATEGORY_LABEL[category]).join(', ')}`,
            onRemove: () => changeFilters({ categories: [] }),
          },
        ]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${MASTER_STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.alternative !== 'any'
      ? [
          {
            key: 'alternative',
            label: `Alternative: ${ALTERNATIVE_LABEL[params.alternative]}`,
            onRemove: () => changeFilters({ alternative: 'any' }),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Master Data', 'Master Equipment']}
        title="Master Equipment"
        description="Manage canonical cooking tools, aliases, alternative equipment, and status used across recipes and equipment matching."
        action={
          <Button onClick={() => setForm({ kind: 'create' })}>
            <PlusIcon aria-hidden />
            Add Equipment
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <EquipmentFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <EquipmentTable
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onEdit={(equipment) => setForm({ kind: 'edit', equipment })}
        onDeactivate={setDeactivating}
        hasActiveFilters={hasActiveFilters}
        onResetFilters={reset}
        onAdd={() => setForm({ kind: 'create' })}
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

      <EquipmentFormDrawer
        key={shownForm?.kind === 'edit' ? shownForm.equipment.id : 'create'}
        open={form !== null}
        onOpenChange={(open) => !open && closeForm()}
        equipment={shownForm?.kind === 'edit' ? shownForm.equipment : undefined}
        isPending={createEquipment.isPending || updateEquipment.isPending}
        onSubmit={handleSubmit}
        onViewDuplicate={(equipment) => setForm({ kind: 'edit', equipment })}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && closeDeactivate()}
        title={shownDeactivating ? `Deactivate ${shownDeactivating.name}?` : ''}
        description="It will no longer be selectable for new recipes or as an alternative tool. Existing recipes that use it stay valid."
        confirmLabel="Deactivate"
        pendingLabel="Deactivating…"
        isPending={deactivateEquipment.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  )
}
