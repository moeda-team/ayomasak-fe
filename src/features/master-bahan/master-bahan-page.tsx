import { PlusIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { DIALOG_EXIT_MS, DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { BahanFilters } from './bahan-filters'
import { BahanFormDrawer } from './bahan-form-drawer'
import { BahanTable } from './bahan-table'
import { CATEGORY_LABEL, FORM_LABEL, PANTRY_LABEL, STATUS_LABEL } from './bahan-config'
import type { Bahan, BahanFormValues } from './bahan-types'
import { useBahanListParams, PAGE_SIZE_OPTIONS } from './use-bahan-list-params'
import { useBahanList, useCreateBahan, useDeactivateBahan, useUpdateBahan } from './use-bahan'

type FormState = { kind: 'create' } | { kind: 'edit'; bahan: Bahan }

export const MasterBahanPage = () => {
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useBahanListParams()
  const [form, setForm] = useState<FormState | null>(null)
  const [deactivating, setDeactivating] = useState<Bahan | null>(null)

  const { data, error, isLoading, isPlaceholderData, refetch } = useBahanList(params)
  const createBahan = useCreateBahan()
  const updateBahan = useUpdateBahan()
  const deactivateBahan = useDeactivateBahan()

  const closeForm = () => setForm(null)
  const closeDeactivate = () => setDeactivating(null)

  const handleSubmit = (values: BahanFormValues) => {
    if (form?.kind === 'edit') updateBahan.mutate({ id: form.bahan.id, values }, { onSuccess: closeForm })
    else createBahan.mutate(values, { onSuccess: closeForm })
  }

  const handleDeactivate = () => {
    if (!deactivating) return
    deactivateBahan.mutate(deactivating, { onSettled: closeDeactivate })
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
    ...(params.form !== 'all'
      ? [{ key: 'form', label: `Form: ${FORM_LABEL[params.form]}`, onRemove: () => changeFilters({ form: 'all' }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.pantry !== 'all'
      ? [{ key: 'pantry', label: `Pantry: ${PANTRY_LABEL[params.pantry]}`, onRemove: () => changeFilters({ pantry: 'all' }) }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Master Data', 'Master Bahan']}
        title="Master Bahan"
        description="Manage canonical ingredients, aliases, and status used across recipes and ingredient matching."
        action={
          <Button onClick={() => setForm({ kind: 'create' })}>
            <PlusIcon aria-hidden />
            Add Bahan
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <BahanFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <BahanTable
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onEdit={(bahan) => setForm({ kind: 'edit', bahan })}
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

      <BahanFormDrawer
        key={shownForm?.kind === 'edit' ? shownForm.bahan.id : 'create'}
        open={form !== null}
        onOpenChange={(open) => !open && closeForm()}
        bahan={shownForm?.kind === 'edit' ? shownForm.bahan : undefined}
        isPending={createBahan.isPending || updateBahan.isPending}
        onSubmit={handleSubmit}
        onViewDuplicate={(bahan) => setForm({ kind: 'edit', bahan })}
      />

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && closeDeactivate()}
        title={shownDeactivating ? `Deactivate ${shownDeactivating.name}?` : ''}
        description="It will no longer be selectable for new recipes or user input. Existing recipes that use it stay valid."
        confirmLabel="Deactivate"
        pendingLabel="Deactivating…"
        isPending={deactivateBahan.isPending}
        onConfirm={handleDeactivate}
      />
    </div>
  )
}
