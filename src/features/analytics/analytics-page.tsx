import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { hasDashboardPermission } from '@/features/dashboard/dashboard-access'
import { DashboardAccessDenied } from '@/features/dashboard/dashboard-access-denied'
import { WIDE_NARROW_ROW } from '@/features/dashboard/dashboard-layout'
import { DEFAULT_RANGE, RANGE_DAYS } from './analytics-config'
import { AnalyticsMetricsSection } from './analytics-metrics-section'
import type { AnalyticsRange } from './analytics-types'
import { BadFeedbackCard } from './bad-feedback-card'
import { FunnelCard } from './funnel-card'
import { SearchTrendCard } from './search-trend-card'
import { TopNoResultCard } from './top-no-result-card'
import { useAnalyticsSummary } from './use-analytics'

const PageIntro = () => (
  <PageHeader title="Analytics" description="Search, recommendation and cooking behavior across the AyoMasak app." />
)

const AnalyticsContent = () => {
  const [range, setRange] = useState<AnalyticsRange>(DEFAULT_RANGE)
  const { data, error, refetch } = useAnalyticsSummary(range)

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <PageIntro />
        <div className="surface-card">
          <ErrorState
            title="Couldn’t load analytics"
            description="Something went wrong while loading the dashboard. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        </div>
      </div>
    )
  }

  if (data && !data.hasEvents) {
    return (
      <div className="flex flex-col gap-6">
        <PageIntro />
        <div className="surface-card">
          <EmptyState
            title="No analytics data yet"
            description="Events appear here once users start searching, getting recommendations and cooking."
            action={
              <Button asChild variant="outline">
                <Link to="/audit-log">View tracked events</Link>
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  const rangeDays = RANGE_DAYS[range]

  return (
    <div className="flex flex-col gap-6">
      <PageIntro />
      <AnalyticsMetricsSection metrics={data?.metrics} hasData={data?.hasDataInRange ?? false} rangeDays={rangeDays} />

      {data && !data.hasDataInRange ? (
        <div className="surface-card">
          <EmptyState
            title="No data for this date range"
            description={`No search, recommendation or cooking events were recorded in the last ${rangeDays} days.`}
            action={<Button onClick={() => setRange(DEFAULT_RANGE)}>Reset to last {RANGE_DAYS[DEFAULT_RANGE]} days</Button>}
          />
        </div>
      ) : (
        <>
          <div className={WIDE_NARROW_ROW}>
            <SearchTrendCard range={range} onRangeChange={setRange} />
            <FunnelCard range={range} onRangeChange={setRange} />
          </div>
          <div className={WIDE_NARROW_ROW}>
            <TopNoResultCard range={range} onRangeChange={setRange} />
            <BadFeedbackCard />
          </div>
        </>
      )}
    </div>
  )
}

export const AnalyticsPage = () =>
  hasDashboardPermission('analytics.view') ? (
    <AnalyticsContent />
  ) : (
    <div className="flex flex-col gap-6">
      <PageIntro />
      <DashboardAccessDenied
        title="You don’t have access to Analytics"
        description="Your role doesn’t include the analytics.view permission. Ask a Super Admin to update your role."
      />
    </div>
  )
