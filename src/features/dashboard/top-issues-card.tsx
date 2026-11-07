import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import { RankedProgressList } from '@/components/shared/ranked-progress-list'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS, useRange } from './dashboard-range'
import { useTopDataIssues } from './use-dashboard-queries'

const SKELETON_ROW_COUNT = 6

export const TopIssuesCard = ({ className }: { className?: string }) => {
  const range = useRange()
  const { data, error, isLoading, isPlaceholderData, refetch } = useTopDataIssues(range.months)

  return (
    <Panel
      title="Top Data Issues"
      className={className}
      headerAction={
        <RangeSelect label="Top data issues time range" value={range.value} options={RANGE_OPTIONS} onChange={range.select} />
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="flex flex-col gap-2">
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        }
      >
        {data?.length ? (
          <div className={cn('pt-2 transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <RankedProgressList items={data} />
          </div>
        ) : (
          <EmptyState title="No data issues" description="Nothing needs fixing in the selected range." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
