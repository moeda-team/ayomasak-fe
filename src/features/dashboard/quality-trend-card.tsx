import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import {
  StackedBarChart,
  type StackedBarDatum,
  type StackedBarSeries,
} from '@/components/shared/stacked-bar-chart'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS, useRange } from './dashboard-range'
import type { QualityTrendPoint } from './dashboard-types'
import { useQualityTrend } from './use-dashboard-queries'

/** Bottom to top, matching the bars. */
const SERIES: StackedBarSeries[] = [
  { key: 'resolved', label: 'Resolved', colorClass: 'bg-chart-base' },
  { key: 'open', label: 'Open issues', colorClass: 'bg-chart-deep' },
]

const SHORT_MONTH = new Intl.DateTimeFormat('en', { month: 'short', timeZone: 'UTC' })
const LONG_MONTH = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' })

const toDatum = ({ month, open, resolved }: QualityTrendPoint): StackedBarDatum => {
  const date = new Date(month)
  return {
    id: month,
    label: SHORT_MONTH.format(date),
    tooltipTitle: LONG_MONTH.format(date),
    values: { open, resolved },
  }
}

export const QualityTrendCard = ({ className }: { className?: string }) => {
  const range = useRange()
  const { data, error, isLoading, isPlaceholderData, refetch } = useQualityTrend(range.months)

  return (
    <Panel
      title="Data Quality Issues"
      className={className}
      bodyClassName="flex flex-col justify-center"
      headerAction={
        <RangeSelect label="Data quality time range" value={range.value} options={RANGE_OPTIONS} onChange={range.select} />
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
            <StackedBarChart data={data.map(toDatum)} series={SERIES} />
          </div>
        ) : (
          <EmptyState title="No issues in this period" description="Nothing was reported for the selected range." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
