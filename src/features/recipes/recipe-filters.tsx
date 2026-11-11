import { MultiSelectFilter } from '@/components/shared/multi-select-filter'
import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { Button } from '@/components/ui/button'
import { DIFFICULTY_FILTER_OPTIONS, ELIGIBILITY_FILTER_OPTIONS, STATUS_FILTER_OPTIONS } from './recipe-config'
import { RECIPE_CATEGORIES, type RecipeListParams } from './recipe-types'
import { useRecipeCategoryCounts } from './use-recipes'

type FilterChange = Partial<Pick<RecipeListParams, 'categories' | 'status' | 'difficulty' | 'eligibility'>>

type RecipeFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: RecipeListParams
  onChange: (change: FilterChange) => void
  hasActiveFilters: boolean
  onReset: () => void
}

export const RecipeFilters = ({ searchInput, onSearchInputChange, params, onChange, hasActiveFilters, onReset }: RecipeFiltersProps) => {
  const { data: counts } = useRecipeCategoryCounts()

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search recipe name"
        placeholder="Search recipe name…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <MultiSelectFilter
        label="Category"
        searchPlaceholder="Search category"
        options={RECIPE_CATEGORIES.map((category) => ({
          value: category,
          label: category,
          count: counts?.find((item) => item.category === category)?.count,
        }))}
        value={params.categories}
        onApply={(categories) => onChange({ categories })}
      />
      <SingleSelectFilter label="Status" value={params.status} options={STATUS_FILTER_OPTIONS} allValue="all" onChange={(status) => onChange({ status })} />
      <SingleSelectFilter
        label="Difficulty"
        value={params.difficulty}
        options={DIFFICULTY_FILTER_OPTIONS}
        allValue="all"
        onChange={(difficulty) => onChange({ difficulty })}
      />
      <SingleSelectFilter
        label="Eligibility"
        value={params.eligibility}
        options={ELIGIBILITY_FILTER_OPTIONS}
        allValue="all"
        onChange={(eligibility) => onChange({ eligibility })}
      />
      {hasActiveFilters && (
        <Button variant="link" size="sm" onClick={onReset}>
          Reset
        </Button>
      )}
    </div>
  )
}
