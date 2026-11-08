import type { Tone } from '@/components/shared/tone'
import { MODULE_IDS, type AccessLevel, type ModuleId } from './role-permissions'
import type { RoleId } from './user-types'

/**
 * MOCK: the in-memory source of truth for roles, shared by Role and Permission and by User Management
 * (filters, forms, badges). Swap for real requests; keep the shape the readers below depend on.
 */
export type RoleRecord = {
  id: RoleId
  name: string
  description: string
  /** Locked roles cannot be edited, deleted or have their permissions changed. */
  isLocked: boolean
  modules: Record<ModuleId, AccessLevel>
  canPublishRecipes: boolean
}

const modulesOf = (level: AccessLevel, overrides: Partial<Record<ModuleId, AccessLevel>> = {}) =>
  Object.fromEntries(MODULE_IDS.map((id) => [id, overrides[id] ?? level])) as Record<ModuleId, AccessLevel>

const roles: RoleRecord[] = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full access to all features, settings, and user management.',
    isLocked: true,
    modules: modulesOf('full'),
    canPublishRecipes: true,
  },
  {
    id: 'content-manager',
    name: 'Content Manager',
    description: 'Create and edit recipes and master data. Publishing needs a separate permission.',
    isLocked: false,
    modules: modulesOf('view', { 'master-data': 'full', recipes: 'full', 'review-queue': 'full', 'system-configuration': 'none' }),
    canPublishRecipes: false,
  },
  {
    id: 'reviewer',
    name: 'Reviewer',
    description: 'Review, approve, and publish recipes.',
    isLocked: false,
    modules: modulesOf('view', { 'review-queue': 'full', recipes: 'full', 'system-configuration': 'none' }),
    canPublishRecipes: true,
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Review and act on reported cooking results.',
    isLocked: false,
    modules: modulesOf('none', { 'review-queue': 'full', recipes: 'view', 'data-quality': 'view' }),
    canPublishRecipes: false,
  },
  {
    id: 'nutrition-specialist',
    name: 'Nutrition Specialist',
    description: 'Manages nutrition data and reviews.',
    isLocked: false,
    modules: modulesOf('none', { 'master-data': 'full', recipes: 'view', 'data-quality': 'full' }),
    canPublishRecipes: false,
  },
  {
    id: 'ops-lead',
    name: 'Ops Lead',
    description: 'Runs day-to-day operations and keeps an eye on the audit trail.',
    isLocked: false,
    modules: modulesOf('view', { recipes: 'full', 'audit-log': 'full' }),
    canPublishRecipes: false,
  },
]

const copy = (role: RoleRecord): RoleRecord => ({ ...role, modules: { ...role.modules } })

export const listRoleRecords = (): RoleRecord[] => roles.map(copy)

export const findRoleRecord = (id: RoleId): RoleRecord | undefined => {
  const role = roles.find((candidate) => candidate.id === id)
  return role && copy(role)
}

export const addRoleRecord = (role: RoleRecord) => {
  roles.push(copy(role))
}

export const replaceRoleRecord = (role: RoleRecord) => {
  const index = roles.findIndex((candidate) => candidate.id === role.id)
  if (index !== -1) roles[index] = copy(role)
}

export const removeRoleRecord = (id: RoleId) => {
  const index = roles.findIndex((candidate) => candidate.id === id)
  if (index !== -1) roles.splice(index, 1)
}

/** A user whose role was removed has an empty role id. */
export const NO_ROLE_ID: RoleId = ''

export const getRoleName = (id: RoleId) =>
  id === NO_ROLE_ID ? 'No role' : (roles.find((role) => role.id === id)?.name ?? 'Unknown role')

const SEED_TONE: Record<string, Tone> = {
  'super-admin': 'brand',
  'content-manager': 'info',
  reviewer: 'danger',
  moderator: 'warning',
  'nutrition-specialist': 'success',
  'ops-lead': 'neutral',
}

const CYCLE_TONES: Tone[] = ['info', 'success', 'warning', 'danger', 'neutral', 'brand']

/** Seed roles keep their color; roles created later get a stable one derived from their id. */
export const getRoleTone = (id: RoleId): Tone => {
  if (id === NO_ROLE_ID) return 'neutral'
  const seeded = SEED_TONE[id]
  if (seeded) return seeded
  const hash = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return CYCLE_TONES[hash % CYCLE_TONES.length] ?? 'neutral'
}
