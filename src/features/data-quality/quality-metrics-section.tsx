import { Link } from '@tanstack/react-router'
import { MetricCard, toDeltaLabel, toDeltaSentiment } from '@/components/shared/metric-card'
import { Button } from '@/components/ui/button'
import { METRIC_CONFIG } from '@/features/dashboard/metric-config'
import { QUALITY_METRIC_KEYS, type DrilldownKey, type QualityMetricKey } from './data-quality-types'
import { useQualityMetric } from './use-data-quality'

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'

/** Cards that open a list in the drawer. The others send the reader to the page that fixes them. */
const DRILLDOWN_BY_METRIC: Partial<Record<QualityMetricKey, DrilldownKey>> = {
  'publish-blockers': 'publish-blockers',
  'stale-nutrition': 'stale-nutrition',
  'broken-media': 'broken-media',
}

type QualityMetricCardProps = {
  metricKey: QualityMetricKey
  onOpenDrilldown: (key: DrilldownKey) => void
}

const QualityMetricCard = ({ metricKey, onOpenDrilldown }: QualityMetricCardProps) => {
  const { data, error, isLoading, refetch } = useQualityMetric(metricKey)
  const config = METRIC_CONFIG[metricKey]
  const header = { label: config.label, icon: config.icon, iconTone: config.iconTone }

  if (error) return <MetricCard {...header} status="error" onRetry={() => void refetch()} />
  if (isLoading) return <MetricCard {...header} status="loading" />
  if (!data) {
    return (
      <MetricCard
        {...header}
        value="—"
        deltaLabel="n/a"
        deltaSentiment="neutral"
        comparisonLabel="No data yet"
        trend={[]}
        trendTone={config.trendTone}
      />
    )
  }

  const drilldown = DRILLDOWN_BY_METRIC[metricKey]

  return (
    <MetricCard
      {...header}
      value={data.value.toLocaleString('en')}
      deltaLabel={toDeltaLabel(data.delta, data.deltaUnit === 'percent' ? '%' : '')}
      deltaSentiment={toDeltaSentiment(data.delta, 'lower')}
      comparisonLabel="vs prev."
      trend={data.trend}
      trendTone={config.trendTone}
      action={
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-body-sm"
          aria-label={`View ${config.label}`}
          asChild={drilldown === undefined}
          onClick={drilldown ? () => onOpenDrilldown(drilldown) : undefined}
        >
          {drilldown ? 'View' : <Link to={config.destination}>View</Link>}
        </Button>
      }
    />
  )
}

type QualityMetricsSectionProps = {
  onOpenDrilldown: (key: DrilldownKey) => void
}

export const QualityMetricsSection = ({ onOpenDrilldown }: QualityMetricsSectionProps) => (
  <div className={GRID_CLASS}>
    {QUALITY_METRIC_KEYS.map((key) => (
      <QualityMetricCard key={key} metricKey={key} onOpenDrilldown={onOpenDrilldown} />
    ))}
  </div>
)
