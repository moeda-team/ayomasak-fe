import { MetricCard, toDeltaLabel, toDeltaSentiment } from '@/components/shared/metric-card'
import { ANALYTICS_METRIC_CONFIG } from './analytics-config'
import { ANALYTICS_METRIC_KEYS, type AnalyticsMetric, type AnalyticsMetricKey } from './analytics-types'

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'

type AnalyticsMetricsSectionProps = {
  /** Undefined while the first load is running. */
  metrics: AnalyticsMetric[] | undefined
  /** False when no events fall inside the range: the cards then show "n/a" instead of numbers. */
  hasData: boolean
  rangeDays: number
}

export const AnalyticsMetricsSection = ({ metrics, hasData, rangeDays }: AnalyticsMetricsSectionProps) => {
  const metricByKey = new Map<AnalyticsMetricKey, AnalyticsMetric>(metrics?.map((metric) => [metric.key, metric]))

  return (
    <div className={GRID_CLASS}>
      {ANALYTICS_METRIC_KEYS.map((key) => {
        const config = ANALYTICS_METRIC_CONFIG[key]
        const header = { label: config.label, icon: config.icon, iconTone: config.iconTone }
        const metric = metricByKey.get(key)

        if (!metrics) return <MetricCard key={key} {...header} status="loading" />
        if (!hasData || !metric) {
          return (
            <MetricCard
              key={key}
              {...header}
              value="—"
              deltaLabel="n/a"
              deltaSentiment="neutral"
              comparisonLabel="No data"
              trend={[]}
              trendTone={config.trendTone}
            />
          )
        }

        return (
          <MetricCard
            key={key}
            {...header}
            value={`${metric.value}%`}
            deltaLabel={toDeltaLabel(metric.deltaPoints)}
            deltaSentiment={toDeltaSentiment(metric.deltaPoints, config.betterWhen)}
            comparisonLabel={`vs prev. ${rangeDays} days`}
            trend={metric.trend}
            trendTone={config.trendTone}
          />
        )
      })}
    </div>
  )
}
