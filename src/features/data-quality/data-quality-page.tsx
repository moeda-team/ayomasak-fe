import { useState } from 'react'
import { FilterSummary, type FilterChip } from '@/components/shared/filter-summary'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardAccessDenied } from '@/features/dashboard/dashboard-access-denied'
import { hasDashboardPermission } from '@/features/dashboard/dashboard-access'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { BreakdownCard } from './breakdown-card'
import { CATEGORY_LABEL, DEFAULT_FILTERS, ISSUE_LABEL, STATUS_LABEL, UPDATED_LABEL } from './data-quality-config'
import { DataQualityFilters } from './data-quality-filters'
import type { DrilldownKey } from './data-quality-types'
import { DrilldownDrawer } from './drilldown-drawer'
import { IssuesToFixCard, RecentlyResolvedCard } from './issue-lists'
import { QualityMetricsSection } from './quality-metrics-section'
import { useDataQualityFilters } from './use-data-quality-filters'
import { useIssuesToFix, useQualityOverview } from './use-data-quality'

const TRIPLE_ROW = 'grid grid-cols-1 gap-6 lg:grid-cols-3'
const PAIR_ROW = 'grid grid-cols-1 gap-6 xl:grid-cols-2'

const OverviewHeading = () => {
  const { data } = useQualityOverview()

  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-heading-2">Data quality overview</h2>
      {data ? (
        <p className="text-body-sm text-text-secondary">
          {data.totalRecipes.toLocaleString('en')} {data.totalRecipes === 1 ? 'recipe' : 'recipes'}
          {data.totalRecipes > 0 && ` · last checked ${formatRelativeTime(data.checkedAt)}`}
        </p>
      ) : (
        <Skeleton className="h-5 w-56" />
      )}
    </div>
  )
}

const DataQualityContent = () => {
  const { filters, searchInput, setSearchInput, change, reset, hasActiveFilters } = useDataQualityFilters()
  const [drilldownKey, setDrilldownKey] = useState<DrilldownKey | null>(null)
  const { data: overview } = useQualityOverview()
  const { data: issues } = useIssuesToFix(filters)

  const chips: FilterChip[] = [
    ...(filters.issue !== 'all'
      ? [{ key: 'issue', label: `Issue type: ${ISSUE_LABEL[filters.issue]}`, onRemove: () => change({ issue: 'all' }) }]
      : []),
    ...(filters.category !== 'all'
      ? [{ key: 'category', label: `Category: ${CATEGORY_LABEL[filters.category]}`, onRemove: () => change({ category: 'all' }) }]
      : []),
    ...(filters.status !== 'all'
      ? [{ key: 'status', label: `Status: ${STATUS_LABEL[filters.status]}`, onRemove: () => change({ status: 'all' }) }]
      : []),
    ...(filters.updated !== DEFAULT_FILTERS.updated
      ? [{ key: 'updated', label: `Updated: ${UPDATED_LABEL[filters.updated]}`, onRemove: () => change({ updated: DEFAULT_FILTERS.updated }) }]
      : []),
  ]

  const totalRecipes = overview?.totalRecipes ?? 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Data Quality"
        description="Find and fix incomplete recipes, stale nutrition, broken media and unmapped input."
      />

      <div className="flex flex-col gap-3">
        <DataQualityFilters
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          filters={filters}
          onChange={change}
          hasActiveFilters={hasActiveFilters}
          onReset={reset}
        />
        {hasActiveFilters && <FilterSummary resultCount={issues?.total} chips={chips} />}
      </div>

      <OverviewHeading />
      <QualityMetricsSection onOpenDrilldown={setDrilldownKey} />

      <div className={TRIPLE_ROW}>
        <BreakdownCard
          kind="eligibility"
          headerAction={
            overview && <span className="text-body-sm text-text-secondary">{totalRecipes.toLocaleString('en')} recipes</span>
          }
        />
        <BreakdownCard
          kind="nutrition"
          headerAction={
            <Button variant="link" size="sm" className="-mr-2" onClick={() => setDrilldownKey('stale-nutrition')}>
              View Stale
            </Button>
          }
        />
        <BreakdownCard
          kind="lifecycle"
          headerAction={
            <Button variant="link" size="sm" className="-mr-2" onClick={() => setDrilldownKey('draft-recipes')}>
              View Recipes
            </Button>
          }
        />
      </div>

      <div className={PAIR_ROW}>
        <IssuesToFixCard filters={filters} hasActiveFilters={hasActiveFilters} onResetFilters={reset} hasRecipes={totalRecipes > 0} />
        <RecentlyResolvedCard />
      </div>

      <DrilldownDrawer drilldownKey={drilldownKey} onClose={() => setDrilldownKey(null)} />
    </div>
  )
}

export const DataQualityPage = () =>
  hasDashboardPermission('data-quality.view') ? (
    <DataQualityContent />
  ) : (
    <DashboardAccessDenied
      title="You don’t have access to Data Quality"
      description="Your role can’t view data quality metrics. Ask a Super Admin to grant the View Data Quality permission."
    />
  )
