import { NotificationBell } from '@/features/notifications/notification-bell'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { SearchField } from './search-field'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

/** Stays pinned to the top while the page scrolls underneath. */
export const AppTopbar = () => (
  <header className="sticky top-0 z-30 flex h-17 shrink-0 items-center gap-3 border-b border-border-default bg-surface-default px-4">
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
