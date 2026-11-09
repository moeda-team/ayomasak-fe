import type { FilterOption } from '@/components/shared/single-select-filter'
import {
  ISSUE_KINDS,
  RECIPE_CATEGORIES,
  type BreakdownKind,
  type DataQualityFilters,
  type DrilldownKey,
  type IssueKind,
  type RecipeCategory,
  type RecipeStatus,
  type UpdatedWindow,
} from './data-quality-types'

export const ISSUE_LABEL: Record<IssueKind, string> = {
  'publish-blocked': 'Publish blocked',
  'stale-nutrition': 'Nutrition stale',
  'unmapped-ingredient': 'Unmapped ingredient',
  'broken-media': 'Broken media',
  'missing-step': 'Missing recipe step',
}

export const CATEGORY_LABEL: Record<RecipeCategory, string> = {
  'rice-noodles': 'Nasi & Mie',
  soup: 'Sup & Soto',
  meat: 'Daging',
  vegetable: 'Sayur',
  seafood: 'Ikan & Seafood',
  sambal: 'Sambal & Bumbu',
}

export const STATUS_LABEL: Record<RecipeStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  'draft-revision': 'Draft Revision',
}

export const UPDATED_LABEL: Record<UpdatedWindow, string> = {
  '7': 'Last 7 days',
  '30': 'Last 30 days',
  '90': 'Last 90 days',
  year: 'Year to date',
}

const ALL: FilterOption<'all'> = { value: 'all', label: 'All' }

export const ISSUE_OPTIONS: FilterOption<IssueKind | 'all'>[] = [
  ALL,
  ...ISSUE_KINDS.map((value) => ({ value, label: ISSUE_LABEL[value] })),
]

export const CATEGORY_OPTIONS: FilterOption<RecipeCategory | 'all'>[] = [
  ALL,
  ...RECIPE_CATEGORIES.map((value) => ({ value, label: CATEGORY_LABEL[value] })),
]

export const STATUS_OPTIONS: FilterOption<RecipeStatus | 'all'>[] = [
  ALL,
  { value: 'published', label: STATUS_LABEL.published },
  { value: 'draft', label: STATUS_LABEL.draft },
  { value: 'draft-revision', label: STATUS_LABEL['draft-revision'] },
]

export const UPDATED_OPTIONS: FilterOption<UpdatedWindow>[] = (['7', '30', '90', 'year'] as const).map((value) => ({
  value,
  label: UPDATED_LABEL[value],
}))

export const DEFAULT_FILTERS: DataQualityFilters = { search: '', issue: 'all', category: 'all', status: 'all', updated: '30' }

type BreakdownEntry = {
  key: string
  label: string
  /** Background utility for the bar and its dot. */
  colorClass: string
  /** Explains the entry in a tooltip. */
  hint?: string
}

type BreakdownConfig = {
  title: string
  /** In display order. */
  entries: BreakdownEntry[]
}

export const BREAKDOWN_CONFIG: Record<BreakdownKind, BreakdownConfig> = {
  eligibility: {
    title: 'Recipe Eligibility',
    entries: [
      { key: 'viewable', label: 'Viewable', colorClass: 'bg-chart-base' },
      { key: 'matchable', label: 'Matchable', colorClass: 'bg-status-success' },
      { key: 'nutrition-searchable', label: 'Nutrition searchable', colorClass: 'bg-status-warning' },
      { key: 'not-ready', label: 'Not ready', colorClass: 'bg-text-disabled' },
    ],
  },
  nutrition: {
    title: 'Nutrition Status',
    entries: [
      { key: 'valid', label: 'Valid', colorClass: 'bg-status-success' },
      { key: 'estimated-valid', label: 'Estimated valid', colorClass: 'bg-chart-base' },
      { key: 'needs-recalculation', label: 'Needs recalculation', colorClass: 'bg-status-warning' },
      {
        key: 'stale',
        label: 'Stale',
        colorClass: 'bg-status-danger',
        hint: 'Nutrition values changed after ingredient quantities were edited. Stale recipes are excluded from nutrition search until recalculated.',
      },
      { key: 'missing', label: 'Missing', colorClass: 'bg-text-disabled' },
    ],
  },
  lifecycle: {
    title: 'Recipe Lifecycle',
    entries: [
      { key: 'published', label: 'Published', colorClass: 'bg-status-success' },
      { key: 'draft-revision', label: 'Draft Revision', colorClass: 'bg-chart-base' },
      { key: 'draft', label: 'Draft', colorClass: 'bg-text-disabled' },
    ],
  },
}

type DrilldownCopy = {
  /** Header sentence for the drawer, given how many recipes are listed. */
  summary: (total: number) => string
}

const recipes = (total: number) => `${total} ${total === 1 ? 'recipe' : 'recipes'}`

export const DRILLDOWN_COPY: Record<DrilldownKey, DrilldownCopy> = {
  'publish-blockers': { summary: (total) => `${recipes(total)} can't be published yet` },
  'stale-nutrition': { summary: (total) => `${recipes(total)} need nutrition recalculation` },
  'broken-media': { summary: (total) => `${recipes(total)} ${total === 1 ? 'has' : 'have'} a broken photo or link` },
  'draft-recipes': { summary: (total) => `${recipes(total)} ${total === 1 ? 'is' : 'are'} not visible to users` },
}
