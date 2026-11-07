import { useSession } from '@/features/auth/auth-store'
import { MetricsSection } from './metrics-section'
import { NeedsAttentionCard } from './needs-attention-card'
import { QualityTrendCard } from './quality-trend-card'
import { QuickActions } from './quick-actions'
import { RecipeEligibilityCard } from './recipe-eligibility-card'
import { TopIssuesCard } from './top-issues-card'

/** 788:500 split from the design, collapsing to one column below xl. */
const WIDE_NARROW_ROW = 'grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,788fr)_minmax(0,500fr)]'

export const DashboardPage = () => {
  const session = useSession()

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-heading-1 text-balance">Welcome back, {session?.name ?? 'there'}!</h1>
        <p className="text-body text-text-secondary">Here’s your data quality overview today.</p>
      </header>

      <QuickActions />
      <MetricsSection />

      <div className={WIDE_NARROW_ROW}>
        <QualityTrendCard />
        <RecipeEligibilityCard />
      </div>
      <div className={WIDE_NARROW_ROW}>
        <TopIssuesCard />
        <NeedsAttentionCard />
      </div>
    </div>
  )
}
