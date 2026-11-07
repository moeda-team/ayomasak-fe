import { getRouteApi } from '@tanstack/react-router'
import { LoginForm } from './login-form'

const loginRoute = getRouteApi('/login')

const HERO_SRCSET = '/login-hero.jpg 825w, /login-hero@2x.jpg 1650w'
const HERO_SIZES = '(min-width: 64rem) 60vw, 100vw'

/**
 * The hero adapts to the viewport instead of disappearing:
 * - below lg: a banner between logo and form, whose height follows the viewport (clamped);
 *   dropped on short landscape screens so the form keeps the space
 * - lg and up: a full-height panel pinned beside the form, cropped with object-cover
 */
const LoginHero = () => (
  <aside className="max-lg:short:hidden lg:sticky lg:top-0 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:h-svh lg:p-3">
    <img
      src="/login-hero.jpg"
      srcSet={HERO_SRCSET}
      sizes={HERO_SIZES}
      width={825}
      height={1000}
      alt=""
      fetchPriority="high"
      decoding="async"
      className="h-[clamp(8rem,24svh,18rem)] w-full rounded-2xl object-cover sm:h-[clamp(12rem,30svh,22rem)] lg:h-full"
    />
  </aside>
)

export const LoginPage = () => {
  const { redirect } = loginRoute.useSearch()

  return (
    <main className="grid min-h-svh grid-cols-1 max-lg:content-start gap-6 bg-surface-default p-4 sm:p-8 lg:grid-cols-[minmax(26rem,2fr)_minmax(0,3fr)] lg:grid-rows-[auto_1fr] lg:gap-x-0 lg:gap-y-0 lg:p-0">
      <img
        src="/raos-logo.svg"
        alt="Raos"
        className="h-8 w-auto self-start sm:h-9 lg:col-start-1 lg:row-start-1 lg:m-8"
      />
      <LoginHero />
      <section className="mx-auto flex w-full max-w-100 flex-col gap-8 pb-4 lg:col-start-1 lg:row-start-2 lg:justify-center lg:px-8 lg:pb-24">
        <header className="flex flex-col gap-1">
          <h1 className="text-heading-1 text-balance">Sign in</h1>
          <p className="text-body text-text-secondary">Please login to continue to your account.</p>
        </header>
        <LoginForm redirectTo={redirect} />
      </section>
    </main>
  )
}
