import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import { RankedProgressList } from '@/components/shared/ranked-progress-list'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS } from './analytics-config'
import type { AnalyticsRange } from './analytics-types'
import { useTopNoResultSearches } from './use-analytics'

const SKELETON_ROW_COUNT = 6

type TopNoResultCardProps = {
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  className?: string
}

export const TopNoResultCard = ({ range, onRangeChange, className }: TopNoResultCardProps) => {
  const { data, error, isLoading, isPlaceholderData, refetch } = useTopNoResultSearches(range)

  return (
    <Panel
      title="Top No-result Searches"
      className={className}
      headerAction={
        <RangeSelect label="No-result searches time range" value={range} options={RANGE_OPTIONS} onChange={onRangeChange} />
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="flex flex-col gap-2" aria-busy>
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        }
      >
        {data?.length ? (
          <div className={cn('pt-2 transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <RankedProgressList items={data.map(({ id, query, count }) => ({ id, label: query, count }))} />
          </div>
        ) : (
          <EmptyState title="No missed searches" description="Every search in this range returned results." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
