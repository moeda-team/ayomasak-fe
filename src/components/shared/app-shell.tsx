import { Outlet } from '@tanstack/react-router'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './app-sidebar'
import { AppTopbar } from './app-topbar'
import { BackToTop } from './back-to-top'

export const AppShell = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <AppTopbar />
        <main className="flex flex-1 flex-col gap-6 p-6">
          <Outlet />
        </main>
        <BackToTop />
      </SidebarInset>
    </SidebarProvider>
  )
}
