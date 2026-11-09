import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { AvatarRowList } from '@/components/shared/avatar-row-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
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
          <AvatarRowList
            rows={data.map((item) => ({ id: item.id, name: item.recipeName, detail: item.issue, at: item.detectedAt }))}
          />
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
