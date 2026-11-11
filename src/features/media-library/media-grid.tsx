import { MagnifyingGlassMinusIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { PREVIEW_CLASS, STATUS_LABEL, STATUS_TEXT_CLASS, TYPE_LABEL } from './media-config'
import type { MediaItem } from './media-types'

const GRID_CLASS = 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

const MediaCard = ({ item }: { item: MediaItem }) => (
  <li className="surface-card flex min-w-0 flex-col overflow-hidden">
    <div aria-hidden className={cn('h-36 sm:h-40', item.status === 'broken' ? PREVIEW_CLASS.broken : PREVIEW_CLASS[item.type])} />
    <div className="flex min-w-0 flex-col gap-1 p-3">
      <p className="truncate text-body-strong" title={item.name}>
        {item.name}
      </p>
      <p className="line-clamp-2 text-body-sm text-text-secondary">
        {TYPE_LABEL[item.type]} · {item.detail} · {item.recipe ?? 'No recipe linked'}
      </p>
      <p className={cn('text-body-sm', STATUS_TEXT_CLASS[item.status])}>{STATUS_LABEL[item.status]}</p>
    </div>
  </li>
)

const SkeletonCard = () => (
  <li className="surface-card flex flex-col overflow-hidden">
    <Skeleton className="h-36 rounded-none sm:h-40" />
    <div className="flex flex-col gap-2 p-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3.5 w-1/2" />
    </div>
  </li>
)

/** The error and empty states sit in a card about as tall as a few rows of the grid, so the page does not jump. */
const StateCard = ({ children }: { children: ReactNode }) => (
  <div className="surface-card flex min-h-80 items-center justify-center">{children}</div>
)

type MediaGridProps = {
  items: MediaItem[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  hasActiveFilters: boolean
  onResetFilters: () => void
  uploadAction: ReactNode
  /** How many skeleton cards to show while loading; the page size. */
  skeletonCount: number
}

export const MediaGrid = ({
  items,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  hasActiveFilters,
  onResetFilters,
  uploadAction,
  skeletonCount,
}: MediaGridProps) => {
  if (error) {
    return (
      <StateCard>
        <ErrorState
          title="Couldn’t load media"
          description="Something went wrong while loading the library. Check your connection and try again."
          onRetry={onRetry}
        />
      </StateCard>
    )
  }

  if (isLoading) {
    return (
      <ul aria-busy="true" aria-label="Loading media" className={GRID_CLASS}>
        {Array.from({ length: skeletonCount }, (_, index) => (
          <SkeletonCard key={index} />
        ))}
      </ul>
    )
  }

  if (items.length === 0) {
    return (
      <StateCard>
        {hasActiveFilters ? (
          <EmptyState
            icon={MagnifyingGlassMinusIcon}
            title="No media matches your filters"
            description="Try a different filename or clear the Type, Status and Recipe filters."
            action={
              <Button variant="outline" onClick={onResetFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState title="No media yet" description="Photos and videos you add to recipes will appear here." action={uploadAction} />
        )}
      </StateCard>
    )
  }

  return (
    <ul className={cn(GRID_CLASS, 'transition-opacity', isRefreshing && 'opacity-60')}>
      {items.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </ul>
  )
}
