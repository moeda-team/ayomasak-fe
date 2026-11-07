import { createRouter } from '@tanstack/react-router'
import { ErrorState } from '@/components/shared/error-state'
import { authStore } from '@/features/auth/auth-store'
import { routeTree } from './routeTree.gen'

export const router = createRouter({
  routeTree,
  context: { auth: authStore },
  defaultErrorComponent: ({ error, reset }) => (
    <ErrorState description={error instanceof Error ? error.message : undefined} onRetry={reset} />
  ),
  defaultNotFoundComponent: () => (
    <ErrorState title="Page not found" description="The page you are looking for does not exist." />
  ),
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
