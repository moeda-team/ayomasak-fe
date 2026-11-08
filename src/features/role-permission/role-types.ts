import type { AccessLevel, ModuleId } from '@/features/user-management/role-permissions'
import type { RoleId } from '@/features/user-management/user-types'

export type RoleSummary = {
  id: RoleId
  name: string
  description: string
  isLocked: boolean
  memberCount: number
}

export type RolePermissions = {
  modules: Record<ModuleId, AccessLevel>
  canPublishRecipes: boolean
}

export type RoleDetail = RoleSummary & RolePermissions

export type RoleFormValues = {
  name: string
  description: string
}

export type CreateRoleInput = RoleFormValues & {
  /** Copy this role's permissions; omitted when starting from scratch. */
  duplicateFromId?: RoleId
}
