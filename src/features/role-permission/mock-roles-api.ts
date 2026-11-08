import {
  addRoleRecord,
  findRoleRecord,
  listRoleRecords,
  removeRoleRecord,
  replaceRoleRecord,
  type RoleRecord,
} from '@/features/user-management/role-registry'
import {
  countUsersInRole,
  listRoleMembers,
  listUsersOutsideRole,
  moveRoleMembers,
  removeUserFromRole,
  setUsersRole,
  type RoleMember,
} from '@/features/user-management/mock-users-api'
import { FAILING_EMAIL_DOMAIN } from '@/features/user-management/mock-users-api'
import { MODULE_IDS } from '@/features/user-management/role-permissions'
import type { RoleId } from '@/features/user-management/user-types'
import type { CreateRoleInput, RoleDetail, RoleFormValues, RolePermissions, RoleSummary } from './role-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Writes fail on purpose so every error toast can be seen:
 * - creating or renaming a role to a name containing {@link FAILING_ROLE_NAME};
 * - deleting "Ops Lead";
 * - assigning members to "Nutrition Specialist";
 * - saving permissions for "Moderator";
 * - removing a member whose email ends in {@link FAILING_EMAIL_DOMAIN}.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_ROLE_NAME = 'fail.test'
const UNDELETABLE_ROLE_ID: RoleId = 'ops-lead'
const UNASSIGNABLE_ROLE_ID: RoleId = 'nutrition-specialist'
const UNSAVABLE_ROLE_ID: RoleId = 'moderator'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

/** Thrown when a role name is already taken, so the form can show it under the field. */
export class RoleNameTakenError extends Error {
  constructor() {
    super('A role with this name already exists.')
  }
}

const toSummary = ({ id, name, description, isLocked }: RoleRecord): RoleSummary => ({
  id,
  name,
  description,
  isLocked,
  memberCount: countUsersInRole(id),
})

const normalize = (name: string) => name.trim().toLowerCase()

const assertNameAvailable = (name: string, ownId?: RoleId) => {
  const isTaken = listRoleRecords().some((role) => role.id !== ownId && normalize(role.name) === normalize(name))
  if (isTaken) throw new RoleNameTakenError()
}

const assertCanWriteName = (name: string) => {
  if (normalize(name).includes(FAILING_ROLE_NAME)) throw new Error('The server rejected this request.')
}

const toRoleId = (name: string) => `${normalize(name).replace(/[^a-z0-9]+/g, '-')}-${crypto.randomUUID().slice(0, 6)}`

const requireRole = (id: RoleId): RoleRecord => {
  const role = findRoleRecord(id)
  if (!role) throw new Error('This role no longer exists.')
  return role
}

const NO_ACCESS = Object.fromEntries(MODULE_IDS.map((id) => [id, 'none'])) as RoleRecord['modules']

export const fetchRoles = async (): Promise<RoleSummary[]> => {
  await wait()
  return listRoleRecords().map(toSummary)
}

export const createRole = async ({ name, description, duplicateFromId }: CreateRoleInput): Promise<RoleSummary> => {
  await wait()
  assertNameAvailable(name)
  assertCanWriteName(name)
  const source = duplicateFromId ? requireRole(duplicateFromId) : undefined
  const role: RoleRecord = {
    id: toRoleId(name),
    name: name.trim(),
    description: description.trim(),
    isLocked: false,
    modules: source?.modules ?? { ...NO_ACCESS },
    canPublishRecipes: source?.canPublishRecipes ?? false,
  }
  addRoleRecord(role)
  return toSummary(role)
}

export const updateRole = async (id: RoleId, { name, description }: RoleFormValues): Promise<RoleSummary> => {
  await wait()
  const existing = requireRole(id)
  if (existing.isLocked) throw new Error('This role is locked.')
  assertNameAvailable(name, id)
  assertCanWriteName(name)
  const updated: RoleRecord = { ...existing, name: name.trim(), description: description.trim() }
  replaceRoleRecord(updated)
  return toSummary(updated)
}

/** Members of the deleted role take over `moveToId`; it is required whenever the role still has members. */
export const deleteRole = async (id: RoleId, moveToId?: RoleId): Promise<void> => {
  await wait()
  const role = requireRole(id)
  if (role.isLocked || id === UNDELETABLE_ROLE_ID) throw new Error('This role cannot be deleted.')
  if (countUsersInRole(id) > 0) {
    if (!moveToId) throw new Error('Choose a role to move the members to.')
    requireRole(moveToId)
    moveRoleMembers(id, moveToId)
  }
  removeRoleRecord(id)
}

export const fetchAssignableUsers = async (roleId: RoleId, search: string): Promise<RoleMember[]> => {
  await wait()
  return listUsersOutsideRole(roleId, search)
}

export const fetchRoleMembers = async (roleId: RoleId): Promise<RoleMember[]> => {
  await wait()
  return listRoleMembers(roleId)
}

export const assignMembers = async (roleId: RoleId, userIds: string[]): Promise<void> => {
  await wait()
  requireRole(roleId)
  if (roleId === UNASSIGNABLE_ROLE_ID) throw new Error('The server rejected this request.')
  setUsersRole(userIds, roleId)
}

export const fetchRoleDetail = async (id: RoleId): Promise<RoleDetail> => {
  await wait()
  const role = requireRole(id)
  return { ...toSummary(role), modules: role.modules, canPublishRecipes: role.canPublishRecipes }
}

export const saveRolePermissions = async (id: RoleId, permissions: RolePermissions): Promise<RoleDetail> => {
  await wait()
  const existing = requireRole(id)
  if (existing.isLocked) throw new Error('This role is locked.')
  if (id === UNSAVABLE_ROLE_ID) throw new Error('The server rejected this request.')
  const updated: RoleRecord = { ...existing, modules: { ...permissions.modules }, canPublishRecipes: permissions.canPublishRecipes }
  replaceRoleRecord(updated)
  return { ...toSummary(updated), modules: updated.modules, canPublishRecipes: updated.canPublishRecipes }
}

export const removeMember = async (roleId: RoleId, member: RoleMember): Promise<void> => {
  await wait()
  requireRole(roleId)
  if (member.email.toLowerCase().endsWith(FAILING_EMAIL_DOMAIN)) throw new Error('The server rejected this request.')
  removeUserFromRole(member.id)
}
