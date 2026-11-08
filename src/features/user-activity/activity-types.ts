import type { RoleId, UserStatus } from '@/features/user-management/user-types'

export type ActivityAction = 'created' | 'updated' | 'deleted'

export type ActivityActor = {
  id: string
  name: string
  email: string
  roleId: RoleId
}

/** One row of the activity log. */
export type Activity = {
  id: string
  /** ISO timestamp. */
  occurredAt: string
  actor: ActivityActor
  action: ActivityAction
  target: { name: string; email: string }
  details: string
}

/** A user's state before or after a change. */
export type UserSnapshot = {
  name: string
  email: string
  roleId: RoleId
  status: UserStatus
  permissions: string[]
}

export type ActivityDetail = {
  id: string
  actor: ActivityActor
  target: { name: string; email: string; roleId: RoleId }
  /** Absent when the user did not exist yet (created). */
  before: UserSnapshot | null
  /** Absent when the user no longer exists (deleted). */
  after: UserSnapshot | null
}

export type ActionFilter = 'all' | ActivityAction

export type ActivityListParams = {
  search: string
  /** Role of the person who performed the action. */
  roleIds: RoleId[]
  action: ActionFilter
  /** "all" or an actor id. */
  actorId: string
  /** Inclusive, "YYYY-MM-DD". */
  from?: string
  to?: string
  /** 1-based. */
  page: number
  pageSize: number
}

export type ActivityListResult = {
  items: Activity[]
  total: number
}
