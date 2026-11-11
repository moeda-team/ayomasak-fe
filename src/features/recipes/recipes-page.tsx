import { PlusIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { DashboardAccessDenied } from '@/features/dashboard/dashboard-access-denied'
import { hasDashboardPermission } from '@/features/dashboard/dashboard-access'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { DIFFICULTY_LABEL, ELIGIBILITY_LABEL, STATUS_LABEL } from './recipe-config'
import { RecipeFilters } from './recipe-filters'
import { RecipeTable } from './recipe-table'
import type { Recipe } from './recipe-types'
import { PAGE_SIZE_OPTIONS, useRecipeListParams } from './use-recipe-list-params'
import { useArchiveRecipe, useDuplicateRecipe, useRecipeList, useRestoreRecipe } from './use-recipes'

export const RecipesPage = () => {
  const canView = hasDashboardPermission('recipes.view')
  const { params, searchInput, setSearchInput, changeFilters, goToPage, reset, hasActiveFilters } = useRecipeListParams()
  const { data, error, isLoading, isPlaceholderData, refetch } = useRecipeList(params)

  const [archiving, setArchiving] = useState<Recipe | null>(null)
  const [restoring, setRestoring] = useState<Recipe | null>(null)
  const duplicateRecipe = useDuplicateRecipe()
  const archiveRecipe = useArchiveRecipe()
  const restoreRecipe = useRestoreRecipe()

  const closeArchive = () => setArchiving(null)
  const closeRestore = () => setRestoring(null)
  const shownArchiving = useRetainedValue(archiving, DIALOG_EXIT_MS)
  const shownRestoring = useRetainedValue(restoring, DIALOG_EXIT_MS)

  if (!canView) {
    return (
      <DashboardAccessDenied
        title="Access denied"
        description="You don’t have permission to view recipes. Contact a Super Admin to request Content Manager or Reviewer access."
      />
    )
  }

  const chips: FilterChip[] = [
    ...(params.categories.length > 0
      ? [{ key: 'category', label: `Category: ${params.categories.join(', ')}`, onRemove: () => changeFilters({ categories: [] }) }]
      : []),
    ...(params.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[params.status]}`, onRemove: () => changeFilters({ status: 'all' }) }]
      : []),
    ...(params.difficulty !== 'all'
      ? [
          {
            key: 'difficulty',
            label: `Difficulty: ${DIFFICULTY_LABEL[params.difficulty]}`,
            onRemove: () => changeFilters({ difficulty: 'all' }),
          },
        ]
      : []),
    ...(params.eligibility !== 'all'
      ? [
          {
            key: 'eligibility',
            label: `Eligibility: ${ELIGIBILITY_LABEL[params.eligibility]}`,
            onRemove: () => changeFilters({ eligibility: 'all' }),
          },
        ]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['Recipes']}
        title="Recipes"
        description="Manage recipes, publishing status, nutrition and ingredient-matching eligibility."
        action={
          <Button asChild>
            <Link to="/recipes/new">
              <PlusIcon aria-hidden />
              New Recipe
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3">
        <RecipeFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          params={params}
          onChange={changeFilters}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={data?.total} chips={chips} />}
      </div>

      <RecipeTable
        items={data?.items ?? []}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        onDuplicate={(recipe) => duplicateRecipe.mutate(recipe)}
        onArchive={setArchiving}
        onRestore={setRestoring}
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

      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && closeArchive()}
        title={shownArchiving ? `Archive ${shownArchiving.name}?` : ''}
        description="Archived recipes are hidden from users. Nothing is deleted; you can restore it later."
        confirmLabel="Archive"
        pendingLabel="Archiving…"
        isPending={archiveRecipe.isPending}
        onConfirm={() => archiving && archiveRecipe.mutate(archiving, { onSettled: closeArchive })}
      />

      <ConfirmDialog
        open={restoring !== null}
        onOpenChange={(open) => !open && closeRestore()}
        title={shownRestoring ? `Restore ${shownRestoring.name}?` : ''}
        description="The recipe will return to the list as a draft. Review it before publishing."
        confirmLabel="Restore"
        pendingLabel="Restoring…"
        tone="primary"
        isPending={restoreRecipe.isPending}
        onConfirm={() => restoring && restoreRecipe.mutate(restoring, { onSettled: closeRestore })}
      />
    </div>
  )
}
