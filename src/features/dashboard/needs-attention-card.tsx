import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { InitialsAvatar } from '@/components/shared/initials-avatar'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { useNeedsAttention } from './use-dashboard-queries'

const SKELETON_ROW_COUNT = 5

export const NeedsAttentionCard = ({ className }: { className?: string }) => {
  const { data, error, isLoading, refetch } = useNeedsAttention()

  return (
    <Panel
      title="Needs Attention"
      className={className}
      headerAction={
        <Button asChild variant="link" size="sm" className="-mr-2">
          <Link to="/review-queue">View All</Link>
        </Button>
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="flex flex-col gap-3">
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        }
      >
        {data?.length ? (
          <ul className="@container flex flex-col gap-3">
            {data.map((item, index) => (
              <li
                key={item.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md border border-border-default px-3 py-2 text-body-sm @md:grid-cols-[9.5rem_minmax(0,1fr)_auto]"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <InitialsAvatar name={item.recipeName} colorIndex={index} />
                  <span className="truncate">{item.recipeName}</span>
                </span>
                <span className="col-start-1 row-start-2 truncate pl-11 text-text-secondary @md:col-start-auto @md:row-start-auto @md:pl-0 @md:text-text-primary">
                  {item.issue}
                </span>
                <time
                  dateTime={item.detectedAt}
                  className="col-start-2 row-start-1 text-right text-text-secondary @md:col-start-auto @md:row-start-auto"
                >
                  {formatRelativeTime(item.detectedAt)}
                </time>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={CheckCircleIcon}
            title="All clear"
            description="No recipe needs attention right now."
          />
        )}
      </QueryBoundary>
    </Panel>
  )
}
