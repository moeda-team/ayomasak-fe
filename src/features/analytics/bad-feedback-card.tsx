import { CheckCircleIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { AvatarRowList } from '@/components/shared/avatar-row-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useBadFeedback } from './use-analytics'

const SKELETON_ROW_COUNT = 5

export const BadFeedbackCard = ({ className }: { className?: string }) => {
  const { data, error, isLoading, refetch } = useBadFeedback()

  return (
    <Panel
      title="Recent Bad Feedback"
      className={className}
      headerAction={
        <Button asChild variant="link" size="sm" className="-mr-2">
          <Link to="/moderation-queue">View All</Link>
        </Button>
      }
    >
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={
          <div className="flex flex-col gap-3" aria-busy>
            {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        }
      >
        {data?.length ? (
          <AvatarRowList
            rows={data.map((item) => ({ id: item.id, name: item.recipeName, detail: item.reason, at: item.givenAt }))}
          />
        ) : (
          <EmptyState icon={CheckCircleIcon} title="No bad feedback" description="Nobody has marked a recommendation as bad." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
