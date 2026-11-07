import { createFileRoute, redirect } from '@tanstack/react-router'
import { LoginPage } from '@/features/auth/login-page'
import { toSafeRedirectPath } from '@/features/auth/safe-redirect'

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: toSafeRedirectPath(search.redirect),
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.getSession()) throw redirect({ to: '/' })
  },
  component: LoginPage,
})
