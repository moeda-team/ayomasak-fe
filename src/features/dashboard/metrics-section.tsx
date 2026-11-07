import { Link } from '@tanstack/react-router'
import { MetricCard, type DeltaSentiment } from '@/components/shared/metric-card'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { DashboardMetric } from './dashboard-types'
import { METRIC_CONFIG } from './metric-config'
import { useDashboardMetrics } from './use-dashboard-queries'

const METRIC_SKELETON_COUNT = 4

const toDeltaSentiment = (deltaPercent: number): DeltaSentiment => {
  if (deltaPercent < 0) return 'good'
  if (deltaPercent > 0) return 'bad'
  return 'neutral'
}

const toDeltaLabel = (deltaPercent: number) => `${deltaPercent > 0 ? '+' : ''}${deltaPercent}%`

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'

const MetricsSkeleton = () => (
  <div className={GRID_CLASS} aria-busy>
    {Array.from({ length: METRIC_SKELETON_COUNT }, (_, index) => (
      <Skeleton key={index} className="h-36 rounded-lg" />
    ))}
  </div>
)

const MetricCardFor = ({ metric }: { metric: DashboardMetric }) => {
  const config = METRIC_CONFIG[metric.key]

  return (
    <MetricCard
      label={config.label}
      icon={config.icon}
      iconTone={config.iconTone}
      value={metric.value.toLocaleString('en')}
      deltaLabel={toDeltaLabel(metric.deltaPercent)}
      deltaSentiment={toDeltaSentiment(metric.deltaPercent)}
      comparisonLabel={`vs last ${metric.comparisonPeriod}`}
      trend={metric.trend}
      trendTone={config.trendTone}
      action={
        <Button asChild variant="outline" size="sm" className="h-7 text-body-sm">
          <Link to={config.destination} aria-label={`View ${config.label}`}>
            View
          </Link>
        </Button>
      }
    />
  )
}

export const MetricsSection = () => {
  const { data, error, isLoading, refetch } = useDashboardMetrics()

  if (error) return <ErrorState description={error.message} onRetry={() => void refetch()} />
  if (isLoading || !data) return <MetricsSkeleton />

  return (
    <div className={GRID_CLASS}>
      {data.map((metric) => (
        <MetricCardFor key={metric.key} metric={metric} />
      ))}
    </div>
  )
}
