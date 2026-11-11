import { isMockMode } from '@/lib/mock-load-failure'

export type DashboardPermission = 'data-quality.view' | 'analytics.view' | 'recipes.view' | 'recipes.publish'

/** MOCK: replace with a check against the signed-in user's role once permissions come from the backend. */
export const hasDashboardPermission = (permission: DashboardPermission) => {
  if (isMockMode('denied')) return false
  return !(permission === 'recipes.publish' && isMockMode('no-publish'))
}
