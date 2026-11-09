import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { METRIC_CONFIG } from '@/features/dashboard/metric-config'
import { DRAWER_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import { DRILLDOWN_COPY } from './data-quality-config'
import type { DrilldownItem, DrilldownKey } from './data-quality-types'
import { useDrilldown } from './use-data-quality'

const SKELETON_ROW_COUNT = 5

const DrawerSkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy>
    {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
      <Skeleton key={index} className="h-16 w-full rounded-lg" />
    ))}
  </div>
)

const DrilldownRow = ({ item }: { item: DrilldownItem }) => (
  <li className="surface-card flex items-center justify-between gap-3 px-4 py-3">
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="truncate text-body-sm-strong">{item.recipeName}</p>
      <p className="truncate text-caption text-text-secondary">{item.detail}</p>
    </div>
    <ToneBadge tone={item.badge.tone}>{item.badge.label}</ToneBadge>
  </li>
)

type DrilldownDrawerProps = {
  /** The list to show; the drawer is open while this is set. */
  drilldownKey: DrilldownKey | null
  onClose: () => void
}

export const DrilldownDrawer = ({ drilldownKey, onClose }: DrilldownDrawerProps) => {
  // Keep the list on screen while the drawer slides out, instead of flashing its loading state.
  const shownKey = useRetainedValue(drilldownKey, DRAWER_EXIT_MS)
  const { data, error, isLoading, refetch } = useDrilldown(shownKey)

  const title = shownKey ? METRIC_CONFIG[shownKey].label : ''
  const summary = shownKey && data ? DRILLDOWN_COPY[shownKey].summary(data.total) : 'Recipes behind this number.'

  return (
    <DetailDrawer
      open={drilldownKey !== null}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={summary}
      isDescriptionVisible
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button asChild>
            <Link to="/recipes">Open in Recipes</Link>
          </Button>
        </>
      }
    >
      {error ? (
        <ErrorState title="Could not load recipes" description={error.message} onRetry={() => void refetch()} />
      ) : isLoading || !data ? (
        <DrawerSkeleton />
      ) : data.items.length === 0 ? (
        <EmptyState icon={CheckCircleIcon} title="Nothing to fix" description="No recipe is affected right now." />
      ) : (
        <ul className="flex flex-col gap-3">
          {data.items.map((item) => (
            <DrilldownRow key={item.id} item={item} />
          ))}
        </ul>
      )}
    </DetailDrawer>
  )
}
