import { CheckCircleIcon, MagnifyingGlassIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { AvatarRowList } from '@/components/shared/avatar-row-list'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { ISSUE_LABEL } from './data-quality-config'
import type { DataQualityFilters } from './data-quality-types'
import { useIssuesToFix, useRecentlyResolved } from './use-data-quality'

const SKELETON_ROW_COUNT = 5

const ListSkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy>
    {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
      <Skeleton key={index} className="h-12 w-full" />
    ))}
  </div>
)

type IssuesToFixCardProps = {
  filters: DataQualityFilters
  hasActiveFilters: boolean
  onResetFilters: () => void
  /** False while no recipe exists, so an empty list means "nothing yet" rather than "all fixed". */
  hasRecipes: boolean
}

export const IssuesToFixCard = ({ filters, hasActiveFilters, onResetFilters, hasRecipes }: IssuesToFixCardProps) => {
  const { data, error, isLoading, isPlaceholderData, refetch } = useIssuesToFix(filters)

  const renderEmpty = () => {
    if (hasActiveFilters) {
      return (
        <EmptyState
          icon={MagnifyingGlassIcon}
          title="No issues match these filters"
          description="Try a different search, or clear the filters."
          action={
            <Button variant="outline" onClick={onResetFilters}>
              Reset filters
            </Button>
          }
        />
      )
    }
    if (!hasRecipes) {
      return <EmptyState title="No issues yet" description="Issues will be listed here once recipes are checked." />
    }
    return <EmptyState icon={CheckCircleIcon} title="All clear" description="No data issues found. Everything is ready for users." />
  }

  return (
    <Panel
      title="Issues to fix"
      headerAction={
        <Button asChild variant="link" size="sm" className="-mr-2">
          <Link to="/review-queue">View All</Link>
        </Button>
      }
    >
      <QueryBoundary isLoading={isLoading} error={error} onRetry={() => void refetch()} loadingFallback={<ListSkeleton />}>
        {data?.items.length ? (
          <div className={cn('transition-opacity duration-150', isPlaceholderData && 'opacity-60')}>
            <AvatarRowList
              rows={data.items.map((item) => ({
                id: item.id,
                name: item.recipeName,
                detail: ISSUE_LABEL[item.issue],
                at: item.detectedAt,
              }))}
            />
          </div>
        ) : (
          renderEmpty()
        )}
      </QueryBoundary>
    </Panel>
  )
}

export const RecentlyResolvedCard = () => {
  const { data, error, isLoading, refetch } = useRecentlyResolved()

  return (
    <Panel
      title="Recently resolved"
      headerAction={
        <Button asChild variant="link" size="sm" className="-mr-2">
          <Link to="/audit-log">View All</Link>
        </Button>
      }
    >
      <QueryBoundary isLoading={isLoading} error={error} onRetry={() => void refetch()} loadingFallback={<ListSkeleton />}>
        {data?.length ? (
          <AvatarRowList
            rows={data.map((item) => ({ id: item.id, name: item.recipeName, detail: item.detail, at: item.resolvedAt }))}
          />
        ) : (
          <EmptyState title="Nothing resolved yet" description="Resolved issues will show up here." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
