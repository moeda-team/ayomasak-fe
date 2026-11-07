import { DonutChart, type DonutSegment } from '@/components/shared/donut-chart'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS, useRange } from './dashboard-range'
import type { RecipeEligibility } from './dashboard-types'
import { useRecipeEligibility } from './use-dashboard-queries'

const toSegments = ({ viewable, notReady }: RecipeEligibility): DonutSegment[] => [
  { key: 'viewable', label: 'Viewable', value: viewable, colorClass: 'text-chart-base' },
  { key: 'not-ready', label: 'Not ready', value: notReady, colorClass: 'text-chart-soft' },
]

export const RecipeEligibilityCard = ({ className }: { className?: string }) => {
  const range = useRange()
  const { data, error, isLoading, isPlaceholderData, refetch } = useRecipeEligibility(range.months)

  return (
    <Panel
      title="Recipe Eligibility"
      className={className}
      bodyClassName="flex flex-col justify-center"
      headerAction={
        <RangeSelect label="Recipe eligibility time range" value={range.value} options={RANGE_OPTIONS} onChange={range.select} />
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={<Skeleton className="size-50" />}
      >
        {data && data.total > 0 ? (
          <div className={cn('transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <DonutChart segments={toSegments(data)} centerLabel="Total Recipes" />
          </div>
        ) : (
          <EmptyState title="No recipes yet" description="Eligibility appears once recipes exist." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
