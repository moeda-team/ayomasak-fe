import { BellIcon } from '@phosphor-icons/react'
import { EmptyState } from '@/components/shared/empty-state'
import { NotificationItem } from '@/components/shared/notification-item'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { NOTIFICATION_VISUALS } from './notification-visuals'
import { useNotifications } from './use-notifications'

const SKELETON_ROW_COUNT = 3

export const NotificationBell = () => {
  const { data, error, isLoading, refetch, unreadCount, markAllRead } = useNotifications()
  const label = unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={label} className="relative size-10 pointer-coarse:size-11">
          <BellIcon className="size-5" aria-hidden />
          {unreadCount > 0 && (
            <span aria-hidden className="absolute top-1.5 right-1.5 size-2.5 rounded-full border-2 border-surface-default bg-status-danger" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 gap-0 p-0 shadow-overlay sm:w-95">
        <header className="flex items-center justify-between border-b border-border-default px-5 py-4">
          <h2 className="text-heading-3">Notifications</h2>
          <Button
            variant="link"
            size="sm"
            className="-mr-2 text-body-sm"
            disabled={unreadCount === 0}
            onClick={markAllRead}
          >
            Mark all as read
          </Button>
        </header>

        <div className="max-h-96 overflow-y-auto overscroll-contain">
          <QueryBoundary
            isLoading={isLoading}
            error={error}
            onRetry={() => void refetch()}
            loadingFallback={
              <div className="flex flex-col gap-4 p-5">
                {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
                  <Skeleton key={index} className="h-14 w-full" />
                ))}
              </div>
            }
          >
            {data?.length ? (
              <ul className="divide-y divide-border-default">
                {data.map((notification) => {
                  const { icon, tone } = NOTIFICATION_VISUALS[notification.kind]
                  return (
                    <NotificationItem
                      key={notification.id}
                      icon={icon}
                      tone={tone}
                      title={notification.title}
                      description={notification.description}
                      timestamp={notification.createdAt}
                      timeLabel={formatRelativeTime(notification.createdAt)}
                      unread={notification.unread}
                    />
                  )
                })}
              </ul>
            ) : (
              <EmptyState icon={BellIcon} title="You're all caught up" description="New notifications will show up here." />
            )}
          </QueryBoundary>
        </div>

        <footer className="flex justify-center border-t border-border-default px-5 py-3">
          {/* No notifications page yet. */}
          <Button variant="outline" size="sm" disabled>
            View all notifications
          </Button>
        </footer>
      </PopoverContent>
    </Popover>
  )
}
