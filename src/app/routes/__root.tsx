import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import type { AuthStore } from '@/features/auth/auth-store'

type RouterContext = {
  auth: AuthStore
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
})
