import { SearchField } from '@/components/shared/search-field'
import { SingleSelectFilter } from '@/components/shared/single-select-filter'
import { recipeFilterOptions, STATUS_FILTER_OPTIONS, TYPE_FILTER_OPTIONS } from './media-config'
import type { MediaListParams } from './media-types'
import { useMediaRecipes } from './use-media'

type FilterChange = Partial<Pick<MediaListParams, 'type' | 'status' | 'recipe'>>

type MediaFiltersProps = {
  /** Text in the search box; debouncing is the caller's job. */
  searchInput: string
  onSearchInputChange: (value: string) => void
  params: MediaListParams
  onChange: (change: FilterChange) => void
}

export const MediaFilters = ({ searchInput, onSearchInputChange, params, onChange }: MediaFiltersProps) => {
  const { data: recipes = [] } = useMediaRecipes()

  return (
    <div role="search" className="surface-card flex flex-wrap items-center gap-3 p-3">
      <SearchField
        aria-label="Search filename or recipe"
        placeholder="Search filename or recipe…"
        value={searchInput}
        onChange={(event) => onSearchInputChange(event.target.value)}
        className="min-w-56 flex-1"
      />
      <SingleSelectFilter label="Type" value={params.type} options={TYPE_FILTER_OPTIONS} allValue="all" onChange={(type) => onChange({ type })} />
      <SingleSelectFilter
        label="Status"
        value={params.status}
        options={STATUS_FILTER_OPTIONS}
        allValue="all"
        onChange={(status) => onChange({ status })}
      />
      <SingleSelectFilter
        label="Recipe"
        value={params.recipe}
        options={recipeFilterOptions(recipes)}
        allValue="all"
        onChange={(recipe) => onChange({ recipe })}
      />
    </div>
  )
}
