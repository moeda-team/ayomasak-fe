import type { Tone } from '@/components/shared/tone'
import type { RoleId } from '@/features/user-management/user-types'

export const AUDIT_ENTITY_TYPES = ['recipe', 'master-bahan', 'nutrition-info', 'master-equipment', 'role', 'config'] as const
export type AuditEntityType = (typeof AUDIT_ENTITY_TYPES)[number]

export type AuditAction = 'published' | 'updated' | 'rejected' | 'approved'
export type AuditStatus = 'success' | 'failed'

export type AuditActor = {
  id: string
  name: string
  email: string
  roleId: RoleId
}

/** One row of the audit log. */
export type AuditLog = {
  id: string
  /** ISO timestamp. */
  occurredAt: string
  actor: AuditActor
  action: AuditAction
  entityType: AuditEntityType
  entityName: string
  status: AuditStatus
}

/** One labelled value in a before/after snapshot; a tone turns the value into a badge. */
export type AuditField = {
  label: string
  value: string
  tone?: Tone
}

export type AuditFailure = {
  reason: string
  blockers: string[]
}

export type AuditDetail = AuditLog & {
  /** Machine id of the affected record, e.g. "RCP-00128". */
  entityId: string
  before: AuditField[]
  /** Only present when the action succeeded. */
  after: AuditField[] | null
  /** Only present when the action failed. */
  failure: AuditFailure | null
}

export type ActionFilter = 'all' | AuditAction
export type StatusFilter = 'all' | AuditStatus

export type AuditListParams = {
  search: string
  entityTypes: AuditEntityType[]
  action: ActionFilter
  status: StatusFilter
  /** Inclusive, "YYYY-MM-DD". */
  from?: string
  to?: string
  /** 1-based. */
  page: number
  pageSize: number
}

export type AuditListResult = {
  items: AuditLog[]
  total: number
}

export type ExportScope = 'filters' | 'all'
