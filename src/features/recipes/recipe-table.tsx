import { MagnifyingGlassMinusIcon, PencilSimpleIcon, ProhibitIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDayWib } from '@/lib/format-date'
import { DIFFICULTY_LABEL, ELIGIBILITY_TONE, STATUS_LABEL, STATUS_TONE } from './recipe-config'
import type { EligibilityState, Recipe } from './recipe-types'

const ELIGIBILITY_ITEMS = [
  { key: 'viewable', label: 'Viewable' },
  { key: 'matchable', label: 'Matchable' },
  { key: 'nutrition', label: 'Nutrition' },
] as const

const EligibilityBadge = ({ label, state }: { label: string; state: EligibilityState }) => (
  <ToneBadge tone={ELIGIBILITY_TONE[state]} className="gap-1.5">
    <span aria-hidden className="size-1.5 rounded-full bg-current" />
    {label}
    <span className="sr-only">{state === 'ok' ? ': ready' : state === 'warn' ? ': incomplete' : ': not available'}</span>
  </ToneBadge>
)

type RecipeTableProps = {
  items: Recipe[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  onDuplicate: (recipe: Recipe) => void
  onArchive: (recipe: Recipe) => void
  onRestore: (recipe: Recipe) => void
  hasActiveFilters: boolean
  onResetFilters: () => void
}

export const RecipeTable = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  onDuplicate,
  onArchive,
  onRestore,
  hasActiveFilters,
  onResetFilters,
}: RecipeTableProps) => {
  const columns: DataTableColumn<Recipe>[] = [
    {
      id: 'recipe',
      header: 'Recipe',
      cell: ({ row }) => (
        <div className="flex min-w-48 flex-col">
          <span>{row.original.name}</span>
          {row.original.aliases.length > 0 && (
            <span className="text-caption text-text-secondary">Alias: {row.original.aliases.join(', ')}</span>
          )}
        </div>
      ),
    },
    { id: 'category', header: 'Category', cell: ({ row }) => row.original.category },
    {
      id: 'updated',
      header: 'Updated',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDayWib(row.original.updatedAt)}</span>,
    },
    {
      id: 'difficulty',
      header: 'Difficulty',
      cell: ({ row }) => <span className="text-text-secondary">{DIFFICULTY_LABEL[row.original.difficulty]}</span>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <ToneBadge tone={STATUS_TONE[row.original.status]}>{STATUS_LABEL[row.original.status]}</ToneBadge>,
    },
    {
      id: 'eligibility',
      header: 'Eligibility',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          {ELIGIBILITY_ITEMS.map(({ key, label }) => (
            <EligibilityBadge key={key} label={label} state={row.original.eligibility[key]} />
          ))}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => {
        const recipe = row.original
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="icon-sm" asChild>
              <Link to="/recipes/$recipeId/edit" params={{ recipeId: recipe.id }} aria-label={`Edit ${recipe.name}`}>
                <PencilSimpleIcon aria-hidden />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon-sm" aria-label={`More actions for ${recipe.name}`}>
                  <ProhibitIcon aria-hidden />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48 shadow-overlay">
                <DropdownMenuItem asChild>
                  <Link to="/recipes/$recipeId" params={{ recipeId: recipe.id }}>
                    View details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/recipes/$recipeId/edit" params={{ recipeId: recipe.id }}>
                    Edit recipe
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDuplicate(recipe)}>Duplicate as draft</DropdownMenuItem>
                <DropdownMenuSeparator />
                {recipe.status === 'archived' ? (
                  <DropdownMenuItem onSelect={() => onRestore(recipe)}>Restore recipe</DropdownMenuItem>
                ) : (
                  <DropdownMenuItem variant="destructive" onSelect={() => onArchive(recipe)}>
                    Archive recipe
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={items}
      getRowId={(recipe) => recipe.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No recipes found"
            description="No recipe matches your filters. Try a different category, status, or eligibility."
            action={<Button onClick={onResetFilters}>Reset filters</Button>}
          />
        ) : (
          <EmptyState
            title="No recipes yet"
            description="Create your first recipe to get started. Drafts stay hidden from users until they are published."
            action={
              <Button asChild>
                <Link to="/recipes/new">New Recipe</Link>
              </Button>
            }
          />
        )
      }
    />
  )
}
