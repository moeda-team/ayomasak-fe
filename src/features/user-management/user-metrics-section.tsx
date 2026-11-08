import { Link } from '@tanstack/react-router'
import {
  type Icon,
  TrashSimpleIcon,
  UserCheckIcon,
  UserMinusIcon,
  UsersThreeIcon,
} from '@phosphor-icons/react'
import { ErrorState } from '@/components/shared/error-state'
import { MetricCard, type DeltaSentiment } from '@/components/shared/metric-card'
import type { Tone } from '@/components/shared/tone'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUserMetrics } from './use-users'
import type { UserMetric, UserMetricKey } from './user-types'

type MetricConfig = {
  label: string
  icon: Icon
  tone: Tone
  /** Which direction of change is good news for this number. */
  goodDirection: 'up' | 'down'
}

const METRIC_CONFIG: Record<UserMetricKey, MetricConfig> = {
  total: { label: 'Total Users', icon: UsersThreeIcon, tone: 'brand', goodDirection: 'up' },
  active: { label: 'Active Users', icon: UserCheckIcon, tone: 'success', goodDirection: 'up' },
  'non-active': { label: 'Non Active Users', icon: UserMinusIcon, tone: 'warning', goodDirection: 'down' },
  uninstalled: { label: 'Total Users Uninstall', icon: TrashSimpleIcon, tone: 'danger', goodDirection: 'down' },
}

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'
const SKELETON_COUNT = 4

const toSentiment = (deltaPercent: number, goodDirection: MetricConfig['goodDirection']): DeltaSentiment => {
  if (deltaPercent === 0) return 'neutral'
  return deltaPercent > 0 === (goodDirection === 'up') ? 'good' : 'bad'
}

const MetricCardFor = ({ metric }: { metric: UserMetric }) => {
  const config = METRIC_CONFIG[metric.key]

  return (
    <MetricCard
      label={config.label}
      icon={config.icon}
      iconTone={config.tone}
      value={metric.value.toLocaleString('en')}
      deltaLabel={`${metric.deltaPercent > 0 ? '+' : ''}${metric.deltaPercent}%`}
      deltaSentiment={toSentiment(metric.deltaPercent, config.goodDirection)}
      comparisonLabel={`vs last ${metric.comparisonPeriod}`}
      trend={metric.trend}
      trendTone={config.tone}
      action={
        metric.key === 'uninstalled' ? (
          <Button asChild variant="outline" size="sm" className="h-7 text-body-sm">
            <Link to="/user-activity" aria-label={`View ${config.label}`}>
              View
            </Link>
          </Button>
        ) : undefined
      }
    />
  )
}

export const UserMetricsSection = () => {
  const { data, error, isLoading, refetch } = useUserMetrics()

  if (error) return <ErrorState description={error.message} onRetry={() => void refetch()} />
  if (isLoading || !data) {
    return (
      <div className={GRID_CLASS} aria-busy>
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <Skeleton key={index} className="h-36 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className={GRID_CLASS}>
      {data.map((metric) => (
        <MetricCardFor key={metric.key} metric={metric} />
      ))}
    </div>
  )
}
