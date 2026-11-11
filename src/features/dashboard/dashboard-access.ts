import { isMockMode } from '@/lib/mock-load-failure'

export type DashboardPermission = 'data-quality.view' | 'analytics.view' | 'recipes.view'

/** MOCK: replace with a check against the signed-in user's role once permissions come from the backend. */
export const hasDashboardPermission = (_permission: DashboardPermission) => !isMockMode('denied')
