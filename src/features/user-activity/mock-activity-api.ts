import { ROLE_IDS, type RoleId } from '@/features/user-management/user-types'
import { ROLE_LABEL } from '@/features/user-management/user-roles'
import type {
  Activity,
  ActivityAction,
  ActivityActor,
  ActivityDetail,
  ActivityListParams,
  ActivityListResult,
  UserSnapshot,
} from './activity-types'

/** MOCK: replace each function with a real request. The signatures are what the hooks depend on. */
const MOCK_LATENCY_MS = 600

/** Opening the detail of the activity with this id fails, so the drawer's error state can be seen. */
export const FAILING_ACTIVITY_ID = 'activity-13'

const HOUR_MS = 3_600_000

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const ACTORS: ActivityActor[] = [
  { id: 'actor-1', name: 'Super Admin', email: 'superadmin@raos.com', roleId: 'super-admin' },
  { id: 'actor-2', name: 'Admin User', email: 'adminuser@raos.com', roleId: 'content-manager' },
  { id: 'actor-3', name: 'Manager', email: 'manager@raos.com', roleId: 'ops-lead' },
]

const TARGETS = [
  { name: 'Andi Pratama', email: 'andi.pratama@gmail.com' },
  { name: 'Layla Rahma', email: 'layla.rahma@mail.com' },
  { name: 'Budi Santoso', email: 'budi@mail.com' },
  { name: 'Dewi Lestari', email: 'dewi.lestari@mail.com' },
  { name: 'Rizky Maulana', email: 'rizky.maulana@mail.com' },
  { name: 'Nadia Putri', email: 'nadia.putri@mail.com' },
  { name: 'Hendra Wijaya', email: 'hendra@mail.com' },
  { name: 'Sari Wulandari', email: 'sari@mail.com' },
]

const ROLE_PERMISSIONS: Record<RoleId, string[]> = {
  'super-admin': ['Full access'],
  'content-manager': ['View Dashboard', 'Manage Recipes', 'Manage Master Data', 'View Data Quality'],
  reviewer: ['View Dashboard', 'Review Recipes', 'View Data Quality'],
  moderator: ['View Dashboard', 'Moderate Content'],
  'nutrition-specialist': ['View Dashboard', 'Manage Nutrition Data'],
  'ops-lead': ['View Dashboard', 'Manage Recipes', 'View Audit Log'],
}

const ACTION_CYCLE: ActivityAction[] = ['created', 'updated', 'deleted', 'created', 'created', 'updated']

const ACTIVITY_COUNT = 130

type Seed = { activity: Activity; before: UserSnapshot | null; after: UserSnapshot | null; targetRole: RoleId }

const snapshot = (target: { name: string; email: string }, roleId: RoleId): UserSnapshot => ({
  ...target,
  roleId,
  status: 'active',
  permissions: ROLE_PERMISSIONS[roleId],
})

const pick = <TItem>(items: TItem[], index: number): TItem => items[index % items.length] as TItem

const buildSeed = (index: number): Seed => {
  const actor = pick(ACTORS, index * 7 + (index % 3))
  const target = pick(TARGETS, index * 3 + 1)
  const action = pick(ACTION_CYCLE, index)
  const fromRole = pick([...ROLE_IDS], index + 2)
  const toRole = pick([...ROLE_IDS], index + 3)
  const details = {
    created: 'Created a new user account',
    updated: `Updated role from ${ROLE_LABEL[fromRole]} to ${ROLE_LABEL[toRole]}`,
    deleted: 'Deleted user account',
  }[action]

  return {
    activity: {
      id: `activity-${index + 1}`,
      occurredAt: new Date(Date.now() - (index * 11 + 3) * HOUR_MS).toISOString(),
      actor,
      action,
      target,
      details,
    },
    before: action === 'created' ? null : snapshot(target, fromRole),
    after: action === 'deleted' ? null : snapshot(target, toRole),
    targetRole: action === 'updated' ? toRole : fromRole,
  }
}

const seeds: Seed[] = Array.from({ length: ACTIVITY_COUNT }, (_, index) => buildSeed(index))

const dayOf = (isoTimestamp: string) => {
  // Filters are calendar days in the viewer's zone, so compare in local time.
  const date = new Date(isoTimestamp)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const matches = ({ activity }: Seed, params: ActivityListParams) => {
  const needle = params.search.trim().toLowerCase()
  const day = dayOf(activity.occurredAt)
  return (
    (needle === '' ||
      activity.details.toLowerCase().includes(needle) ||
      activity.target.name.toLowerCase().includes(needle) ||
      activity.actor.name.toLowerCase().includes(needle)) &&
    (params.roleIds.length === 0 || params.roleIds.includes(activity.actor.roleId)) &&
    (params.action === 'all' || activity.action === params.action) &&
    (params.actorId === 'all' || activity.actor.id === params.actorId) &&
    (!params.from || day >= params.from) &&
    (!params.to || day <= params.to)
  )
}

export const fetchActivities = async (params: ActivityListParams): Promise<ActivityListResult> => {
  await wait()
  const filtered = seeds.filter((seed) => matches(seed, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map((seed) => seed.activity), total: filtered.length }
}

export const fetchActors = async (): Promise<ActivityActor[]> => {
  await wait()
  return ACTORS
}

/** How many logged activities each role performed, for the Role filter's counts. */
export const fetchActivityRoleCounts = async (): Promise<Record<RoleId, number>> => {
  await wait()
  const counts = Object.fromEntries(ROLE_IDS.map((id) => [id, 0])) as Record<RoleId, number>
  seeds.forEach(({ activity }) => (counts[activity.actor.roleId] += 1))
  return counts
}

export const fetchActivityDetail = async (id: string): Promise<ActivityDetail> => {
  await wait()
  if (id === FAILING_ACTIVITY_ID) throw new Error('The server could not load this activity.')
  const seed = seeds.find(({ activity }) => activity.id === id)
  if (!seed) throw new Error('This activity no longer exists.')
  return {
    id,
    actor: seed.activity.actor,
    target: { ...seed.activity.target, roleId: seed.targetRole },
    before: seed.before,
    after: seed.after,
  }
}
