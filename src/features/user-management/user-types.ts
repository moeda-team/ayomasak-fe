export const ROLE_IDS = [
  'super-admin',
  'content-manager',
  'reviewer',
  'moderator',
  'nutrition-specialist',
  'ops-lead',
] as const

export type RoleId = (typeof ROLE_IDS)[number]

export type UserStatus = 'active' | 'non-active'

export type User = {
  id: string
  fullName: string
  email: string
  username: string
  phone: string
  roleId: RoleId
  status: UserStatus
  /** ISO timestamp. */
  joinedAt: string
  /** ISO timestamp. */
  lastAccessAt: string
  notes: string
}

/** What the add/edit form collects. */
export type UserFormValues = {
  fullName: string
  email: string
  username: string
  phone: string
  roleId: RoleId
  notes: string
}

export type StatusFilter = 'all' | UserStatus

export type UserListParams = {
  search: string
  roleIds: RoleId[]
  status: StatusFilter
  /** Inclusive, "YYYY-MM-DD". */
  joinedFrom?: string
  joinedTo?: string
  /** 1-based. */
  page: number
  pageSize: number
}

export type UserListResult = {
  items: User[]
  total: number
}

export type RoleOption = {
  id: RoleId
  label: string
  userCount: number
}

export type UserMetricKey = 'total' | 'active' | 'non-active' | 'uninstalled'

export type UserMetric = {
  key: UserMetricKey
  value: number
  /** Change versus the comparison period, in percent. */
  deltaPercent: number
  comparisonPeriod: 'month'
  trend: number[]
}
