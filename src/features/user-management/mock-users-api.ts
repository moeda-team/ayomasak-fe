import { type RoleOption, type User, type UserFormValues, type UserListParams, type UserListResult, type UserMetric } from './user-types'
import { listRoleRecords } from './role-registry'
import { failLoadIfMocked } from '@/lib/mock-load-failure'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Writes fail on purpose for any user whose email ends in {@link FAILING_EMAIL_DOMAIN}, so the error toasts
 * can be seen without a broken backend. Creating or editing a user to that domain fails; deleting one fails.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_EMAIL_DOMAIN = '@fail.test'

const DAY_MS = 86_400_000

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS).toISOString()

/** Join dates are stored at UTC midnight so a "YYYY-MM-DD" filter compares cleanly. */
const joinedDaysAgo = (days: number) => `${daysAgo(days).slice(0, 10)}T00:00:00.000Z`

const SEED: Pick<User, 'fullName' | 'roleId' | 'status'>[] = [
  { fullName: 'Charlie Gouse', roleId: 'super-admin', status: 'active' },
  { fullName: 'Justin Donin', roleId: 'reviewer', status: 'active' },
  { fullName: 'Wilson Westervelt', roleId: 'moderator', status: 'active' },
  { fullName: 'Jaxson Vetrovs', roleId: 'content-manager', status: 'active' },
  { fullName: 'Kadin Curtis', roleId: 'reviewer', status: 'active' },
  { fullName: 'Davis Passaquindici Arcand', roleId: 'ops-lead', status: 'non-active' },
  { fullName: 'Nadia Putri', roleId: 'reviewer', status: 'active' },
  { fullName: 'Rizky Pratama', roleId: 'content-manager', status: 'active' },
  { fullName: 'Sari Wulandari', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Budi Santoso', roleId: 'moderator', status: 'non-active' },
  { fullName: 'Ayu Lestari', roleId: 'content-manager', status: 'active' },
  { fullName: 'Dimas Anggara', roleId: 'reviewer', status: 'active' },
  { fullName: 'Intan Permata', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Fajar Nugroho', roleId: 'ops-lead', status: 'active' },
  { fullName: 'Maya Kusuma', roleId: 'content-manager', status: 'non-active' },
  { fullName: 'Hendra Wijaya', roleId: 'moderator', status: 'active' },
  { fullName: 'Putri Rahayu', roleId: 'reviewer', status: 'active' },
  { fullName: 'Agus Salim', roleId: 'content-manager', status: 'active' },
  { fullName: 'Lina Marlina', roleId: 'nutrition-specialist', status: 'non-active' },
  { fullName: 'Tomi Hidayat', roleId: 'reviewer', status: 'active' },
  { fullName: 'Rani Oktavia', roleId: 'content-manager', status: 'active' },
  { fullName: 'Yoga Firmansyah', roleId: 'moderator', status: 'active' },
  { fullName: 'Citra Dewi', roleId: 'reviewer', status: 'non-active' },
  { fullName: 'Bayu Setiawan', roleId: 'super-admin', status: 'active' },
  { fullName: 'Eka Saputri', roleId: 'content-manager', status: 'active' },
  { fullName: 'Galih Prakoso', roleId: 'ops-lead', status: 'active' },
  { fullName: 'Nina Anggraini', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Okta Ramadhan', roleId: 'reviewer', status: 'active' },
  { fullName: 'Vina Melati', roleId: 'content-manager', status: 'non-active' },
  { fullName: 'Wahyu Hidayah', roleId: 'moderator', status: 'active' },
  { fullName: 'Zahra Amalia', roleId: 'reviewer', status: 'active' },
  { fullName: 'Arif Rahman', roleId: 'content-manager', status: 'active' },
  { fullName: 'Dewi Sartika', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Ilham Maulana', roleId: 'reviewer', status: 'non-active' },
  { fullName: 'Kirana Larasati', roleId: 'content-manager', status: 'active' },
  { fullName: 'Lukman Hakim', roleId: 'moderator', status: 'active' },
  { fullName: 'Mega Safitri', roleId: 'reviewer', status: 'active' },
  { fullName: 'Nando Pradipta', roleId: 'ops-lead', status: 'active' },
  { fullName: 'Oki Setiana', roleId: 'content-manager', status: 'active' },
  { fullName: 'Prita Handayani', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Qori Sandioriva', roleId: 'reviewer', status: 'active' },
  { fullName: 'Raka Aditya', roleId: 'content-manager', status: 'non-active' },
  { fullName: 'Sinta Maharani', roleId: 'moderator', status: 'active' },
  { fullName: 'Taufik Hidayat', roleId: 'reviewer', status: 'active' },
  { fullName: 'Umi Kalsum', roleId: 'content-manager', status: 'active' },
  { fullName: 'Vero Aprilia', roleId: 'nutrition-specialist', status: 'active' },
  { fullName: 'Wulan Guritno', roleId: 'reviewer', status: 'active' },
  { fullName: 'Xavier Pratama', roleId: 'ops-lead', status: 'non-active' },
  { fullName: 'Yuni Shara', roleId: 'content-manager', status: 'active' },
]

const toUsername = (fullName: string) => fullName.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).slice(0, 2).join('')

const toEmailLocal = (fullName: string) => fullName.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/)[0] ?? 'user'

const db: User[] = SEED.map((seed, index) => ({
  ...seed,
  id: `user-${index + 1}`,
  email: `${toEmailLocal(seed.fullName)}@mail.com`,
  username: toUsername(seed.fullName),
  phone: `+62 8${11 + (index % 8)} ${1000 + index * 37} ${2000 + index * 53}`,
  joinedAt: joinedDaysAgo(10 + index * 3),
  lastAccessAt: daysAgo(2 + (index % 9)),
  notes: '',
}))

const matchesSearch = (user: User, search: string) => {
  const needle = search.trim().toLowerCase()
  return needle === '' || user.fullName.toLowerCase().includes(needle) || user.email.toLowerCase().includes(needle)
}

const matchesJoinDate = (user: User, from?: string, to?: string) => {
  const joinedOn = user.joinedAt.slice(0, 10)
  return (!from || joinedOn >= from) && (!to || joinedOn <= to)
}

const matches = (user: User, params: UserListParams) =>
  matchesSearch(user, params.search) &&
  (params.roleIds.length === 0 || params.roleIds.includes(user.roleId)) &&
  (params.status === 'all' || user.status === params.status) &&
  matchesJoinDate(user, params.joinedFrom, params.joinedTo)

export const fetchUsers = async (params: UserListParams): Promise<UserListResult> => {
  failLoadIfMocked('fetchUsers')
  await wait()
  const filtered = db.filter((user) => matches(user, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map((user) => ({ ...user })), total: filtered.length }
}

export const fetchRoleOptions = async (): Promise<RoleOption[]> => {
  await wait()
  return listRoleRecords().map((role) => ({ id: role.id, label: role.name, userCount: db.filter((user) => user.roleId === role.id).length }))
}

const TREND = {
  total: [12, 18, 14, 22, 19, 27, 24, 31, 28],
  active: [10, 13, 12, 17, 15, 21, 19, 24, 26],
  nonActive: [8, 6, 9, 7, 10, 8, 11, 9, 10],
  uninstalled: [6, 9, 7, 12, 8, 14, 9, 11, 7],
}

export const fetchUserMetrics = async (): Promise<UserMetric[]> => {
  failLoadIfMocked('fetchUserMetrics')
  await wait()
  const active = db.filter((user) => user.status === 'active').length
  const total = db.length
  return [
    { key: 'total', value: total, deltaPercent: 4, comparisonPeriod: 'month', trend: TREND.total },
    { key: 'active', value: active, deltaPercent: 3, comparisonPeriod: 'month', trend: TREND.active },
    { key: 'non-active', value: total - active, deltaPercent: 12, comparisonPeriod: 'month', trend: TREND.nonActive },
    { key: 'uninstalled', value: Math.round(total * 0.4), deltaPercent: -5, comparisonPeriod: 'month', trend: TREND.uninstalled },
  ]
}

const assertCanWrite = (email: string) => {
  if (email.toLowerCase().endsWith(FAILING_EMAIL_DOMAIN)) throw new Error('The server rejected this request.')
}

export const createUser = async (values: UserFormValues): Promise<User> => {
  await wait()
  assertCanWrite(values.email)
  const user: User = {
    ...values,
    id: `user-${crypto.randomUUID()}`,
    status: 'active',
    joinedAt: joinedDaysAgo(0),
    lastAccessAt: new Date().toISOString(),
  }
  db.unshift(user)
  return { ...user }
}

export const updateUser = async (id: string, values: UserFormValues): Promise<User> => {
  await wait()
  assertCanWrite(values.email)
  const index = db.findIndex((user) => user.id === id)
  const existing = db[index]
  if (!existing) throw new Error('This user no longer exists.')
  const updated: User = { ...existing, ...values }
  db[index] = updated
  return { ...updated }
}

export const deleteUsers = async (ids: string[]): Promise<void> => {
  await wait()
  const targets = db.filter((user) => ids.includes(user.id))
  targets.forEach((user) => assertCanWrite(user.email))
  targets.forEach((user) => db.splice(db.indexOf(user), 1))
}

/** Member lookups and moves used by Role and Permission; they share the user table above. */
export type RoleMember = Pick<User, 'id' | 'fullName' | 'email' | 'roleId'>

const toMember = ({ id, fullName, email, roleId }: User): RoleMember => ({ id, fullName, email, roleId })

export const countUsersInRole = (roleId: string) => db.filter((user) => user.roleId === roleId).length

export const listRoleMembers = (roleId: string): RoleMember[] => db.filter((user) => user.roleId === roleId).map(toMember)

/** Everyone who is not in `roleId` yet, optionally narrowed by name or email. */
export const listUsersOutsideRole = (roleId: string, search: string): RoleMember[] =>
  db.filter((user) => user.roleId !== roleId && matchesSearch(user, search)).map(toMember)

export const moveRoleMembers = (fromRoleId: string, toRoleId: string) => {
  db.forEach((user) => {
    if (user.roleId === fromRoleId) user.roleId = toRoleId
  })
}

export const setUsersRole = (userIds: string[], roleId: string) => {
  db.forEach((user) => {
    if (userIds.includes(user.id)) user.roleId = roleId
  })
}


export const removeUserFromRole = (userId: string) => setUsersRole([userId], '')
