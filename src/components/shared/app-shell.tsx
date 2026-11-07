import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'

export const AppShell = () => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <AppTopbar />
      <main className="flex flex-1 flex-col gap-6 p-6">
        <Outlet />
      </main>
    </SidebarInset>
  </SidebarProvider>
)
