import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import { StackedBarChart, type StackedBarDatum, type StackedBarSeries } from '@/components/shared/stacked-bar-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS } from './analytics-config'
import type { AnalyticsRange, SearchTrendPoint } from './analytics-types'
import { useSearchTrend } from './use-analytics'

/** Bottom to top, matching the bars. */
const SERIES: StackedBarSeries[] = [
  { key: 'noResult', label: 'No-result searches', colorClass: 'bg-chart-base' },
  { key: 'withResults', label: 'Searches with results', colorClass: 'bg-chart-deep' },
]

const toDatum = ({ id, label, title, noResult, withResults }: SearchTrendPoint): StackedBarDatum => ({
  id,
  label,
  tooltipTitle: title,
  values: { noResult, withResults },
})

type SearchTrendCardProps = {
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  className?: string
}

export const SearchTrendCard = ({ range, onRangeChange, className }: SearchTrendCardProps) => {
  const { data, error, isLoading, isPlaceholderData, refetch } = useSearchTrend(range)

  return (
    <Panel
      title="Searches vs No-result Searches"
      className={className}
      bodyClassName="flex flex-col justify-center"
      headerAction={
        <RangeSelect label="Searches time range" value={range} options={RANGE_OPTIONS} onChange={onRangeChange} />
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={<Skeleton className="h-60 w-full" />}
      >
        {data?.length ? (
          <div className={cn('transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <StackedBarChart data={data.map(toDatum)} series={SERIES} totalLabel="Total searches" />
          </div>
        ) : (
          <EmptyState title="No searches in this period" description="Nothing was searched in the selected range." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
