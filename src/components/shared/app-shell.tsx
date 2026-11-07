import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { authStore, useSession } from '@/features/auth/auth-store'
import { NAV_GROUPS } from '@/features/navigation/nav-items'

const toInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const AppSidebar = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <img src="/raos-logo.svg" alt="Raos" className="h-8 w-auto self-start" />
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="text-overline tracking-wider text-text-secondary uppercase">
              {group.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map(({ label, to, icon: Icon }) => (
                <SidebarMenuItem key={to}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(to)} className="text-body-sm">
                    <Link to={to}>
                      <Icon aria-hidden />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  )
}

const UserMenu = () => {
  const session = useSession()
  const navigate = useNavigate()
  if (!session) return null

  const handleSignOut = () => {
    authStore.signOut()
    void navigate({ to: '/login', search: { redirect: undefined } })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto gap-3 px-2 py-1">
          <span className="hidden flex-col items-end text-right sm:flex">
            <span className="text-body-sm">{session.name}</span>
            <span className="text-caption text-text-secondary">{session.email}</span>
          </span>
          <Avatar>
            <AvatarFallback className="bg-action-primary text-text-inverse">{toInitials(session.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48 shadow-overlay">
        <DropdownMenuLabel className="text-body-sm">{session.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSignOut}>
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const AppShell = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className="flex h-16 items-center justify-between border-b border-border-default px-4">
        <SidebarTrigger aria-label="Toggle sidebar" />
        <UserMenu />
      </header>
      <main className="flex flex-1 flex-col gap-6 p-6">
        <Outlet />
      </main>
    </SidebarInset>
  </SidebarProvider>
)
