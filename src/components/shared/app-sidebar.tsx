import { CaretLeftIcon } from '@phosphor-icons/react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useState, type MouseEvent } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { NAV_GROUPS, isNavParent, type NavLeaf, type NavParent } from '@/features/navigation/nav-items'
import { cn } from '@/lib/utils'

const ACTIVE_CLASS =
  'data-[active=true]:bg-surface-brand-subtle data-[active=true]:text-text-brand data-[active=true]:ring-1 data-[active=true]:ring-border-focus/30 data-[active=true]:hover:bg-surface-brand-subtle data-[active=true]:hover:text-text-brand'

/** Icon rail buttons are wider and taller than shadcn's default 32px square. */
const BUTTON_CLASS = cn(
  'text-body-sm [&>svg]:size-5 group-data-[collapsible=icon]:h-10! group-data-[collapsible=icon]:w-14! group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:[&>span]:hidden',
  ACTIVE_CLASS,
)

const isActivePath = (pathname: string, to: string) => pathname === to || pathname.startsWith(`${to}/`)

const NavLeafItem = ({ entry, pathname }: { entry: NavLeaf; pathname: string }) => (
  <SidebarMenuItem>
    <SidebarMenuButton asChild tooltip={entry.label} isActive={isActivePath(pathname, entry.to)} className={BUTTON_CLASS}>
      <Link to={entry.to}>
        <entry.icon aria-hidden />
        <span>{entry.label}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
)

const NavParentItem = ({ entry, pathname }: { entry: NavParent; pathname: string }) => {
  const { state, isMobile, setOpen } = useSidebar()
  const hasActiveChild = entry.children.some((child) => isActivePath(pathname, child.to))
  const isRail = state === 'collapsed' && !isMobile
  const [isOpen, setIsOpen] = useState(hasActiveChild)

  /** On the icon rail there is no room for sub-links, so a click expands the sidebar to show them. */
  const handleTriggerClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (!isRail) return
    event.preventDefault()
    setOpen(true)
    setIsOpen(true)
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible" asChild>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            tooltip={entry.label}
            isActive={hasActiveChild && isRail}
            className={BUTTON_CLASS}
            onClick={handleTriggerClick}
          >
            <entry.icon aria-hidden />
            <span>{entry.label}</span>
            <CaretLeftIcon
              aria-hidden
              className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:-rotate-90"
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {entry.children.map((child) => (
              <SidebarMenuSubItem key={child.to}>
                <SidebarMenuSubButton asChild isActive={isActivePath(pathname, child.to)} className={cn('text-body-sm', ACTIVE_CLASS)}>
                  <Link to={child.to}>
                    <span>{child.label}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export const AppSidebar = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <img
          src="/raos-logo.svg"
          alt="Raos"
          className="h-8 w-auto self-start group-data-[collapsible=icon]:hidden dark:brightness-0 dark:invert"
        />
        <img
          src="/raos-mark.svg"
          alt="Raos"
          className="hidden size-8 group-data-[collapsible=icon]:block dark:brightness-0 dark:invert"
        />
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label ?? 'primary'}>
            {group.label && (
              <SidebarGroupLabel className="text-overline tracking-wider text-text-secondary uppercase">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarMenu>
              {group.entries.map((entry) =>
                isNavParent(entry) ? (
                  <NavParentItem key={entry.label} entry={entry} pathname={pathname} />
                ) : (
                  <NavLeafItem key={entry.to} entry={entry} pathname={pathname} />
                ),
              )}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}
