import { SidebarTrigger } from '@/components/ui/sidebar'
import { NotificationBell } from '@/features/notifications/notification-bell'
import { useScrolledPast } from '@/hooks/use-scrolled-past'
import { cn } from '@/lib/utils'
import { SearchField } from './search-field'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

const SCROLL_SHADOW_AFTER_PX = 4

/** Stays pinned to the top while the page scrolls underneath. A soft shadow appears once content slides beneath it. */
export const AppTopbar = () => {
  const isScrolled = useScrolledPast(SCROLL_SHADOW_AFTER_PX)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-17 shrink-0 items-center gap-3 border-b border-border-default bg-surface-canvas/85 px-4 backdrop-blur-md transition-shadow duration-200 ease-out',
        isScrolled && 'shadow-overlay',
      )}
    >
      <SidebarTrigger aria-label="Toggle sidebar" />
      <SearchField
        aria-label="Search"
        placeholder="Search users, roles or anything…"
        className="min-w-0 max-w-2xl flex-1"
      />
      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <ThemeToggle />
        <NotificationBell />
        <span aria-hidden className="hidden h-8 w-px bg-border-default sm:block" />
        <UserMenu />
      </div>
    </header>
  )
}
