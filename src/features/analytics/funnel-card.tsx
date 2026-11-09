import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { ProgressBreakdown, type BreakdownRow } from '@/components/shared/progress-breakdown'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { RangeSelect } from '@/components/shared/range-select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RANGE_OPTIONS } from './analytics-config'
import type { AnalyticsRange, FunnelStep } from './analytics-types'
import { useRecommendationFunnel } from './use-analytics'

/** Darkest for the widest step, fading out as the funnel narrows. */
const STEP_COLOR_CLASSES = ['bg-chart-ink', 'bg-chart-base', 'bg-chart-mid', 'bg-chart-soft', 'bg-chart-faint'] as const

const SKELETON_ROW_COUNT = 5

const toRows = (steps: FunnelStep[]): BreakdownRow[] => {
  const entered = steps[0]?.count ?? 0

  return steps.map((step, index) => {
    const fraction = entered === 0 ? 0 : step.count / entered
    return {
      key: step.id,
      label: step.label,
      valueLabel: `${step.count.toLocaleString('en')} · ${Math.round(fraction * 100)}%`,
      fraction,
      colorClass: STEP_COLOR_CLASSES[Math.min(index, STEP_COLOR_CLASSES.length - 1)] ?? 'bg-chart-faint',
    }
  })
}

type FunnelCardProps = {
  range: AnalyticsRange
  onRangeChange: (range: AnalyticsRange) => void
  className?: string
}

export const FunnelCard = ({ range, onRangeChange, className }: FunnelCardProps) => {
  const { data, error, isLoading, isPlaceholderData, refetch } = useRecommendationFunnel(range)

  return (
    <Panel
      title="Recommendation Funnel"
      className={className}
      headerAction={
        <RangeSelect label="Funnel time range" value={range} options={RANGE_OPTIONS} onChange={onRangeChange} />
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="flex flex-col gap-4" aria-busy>
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-9 w-full" />
            ))}
          </div>
        }
      >
        {data?.length ? (
          <div className={cn('transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <ProgressBreakdown rows={toRows(data)} />
          </div>
        ) : (
          <EmptyState title="No sessions in this period" description="The funnel fills in once people use recommendations." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
