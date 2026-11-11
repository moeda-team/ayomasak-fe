import { formatDayWib, formatTimeWib } from '@/lib/format-date'
import { toIsoDay } from '@/lib/iso-day'
import { ACTION_LABEL, ENTITY_LABEL, STATUS_LABEL } from './audit-labels'
import {
  AUDIT_ENTITY_TYPES,
  type AuditActor,
  type AuditDetail,
  type AuditEntityType,
  type AuditField,
  type AuditListParams,
  type AuditListResult,
  type AuditLog,
  type ExportScope,
} from './audit-types'
import { failLoadIfMocked } from '@/lib/mock-load-failure'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Failures on purpose, so every error state can be seen:
 * - opening the details of {@link FAILING_AUDIT_ID} fails;
 * - exporting with the "Current filters" scope fails while the Status filter is "Failed".
 */
const MOCK_LATENCY_MS = 600
export const FAILING_AUDIT_ID = 'audit-13'

const LOG_COUNT = 676
const HOUR_MS = 3_600_000

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const ACTORS: AuditActor[] = [
  { id: 'actor-1', name: 'Nadia Putri', email: 'nadia.putri@masakuy.com', roleId: 'reviewer' },
  { id: 'actor-2', name: 'Super Admin', email: 'superadmin@masakuy.com', roleId: 'super-admin' },
  { id: 'actor-3', name: 'Rizky Maulana', email: 'rizky.maulana@masakuy.com', roleId: 'reviewer' },
  { id: 'actor-4', name: 'Layla Rahma', email: 'layla.rahma@masakuy.com', roleId: 'content-manager' },
  { id: 'actor-5', name: 'Budi Santoso', email: 'budi.santoso@masakuy.com', roleId: 'moderator' },
]

const ENTITIES: Record<AuditEntityType, { prefix: string; names: string[] }> = {
  recipe: { prefix: 'RCP', names: ['Nasi Goreng Kampung', 'Rendang Sapi', 'Soto Ayam', 'Gado-gado', 'Ayam Bakar', 'Sate Lilit'] },
  'master-bahan': { prefix: 'BHN', names: ['Kemiri', 'Santan', 'Kecap Manis', 'Bawang Putih', 'Kunyit'] },
  'nutrition-info': { prefix: 'NTR', names: ['Soto Ayam', 'Nasi Goreng', 'Rendang Sapi', 'Gado-gado'] },
  'master-equipment': { prefix: 'EQP', names: ['Wajan', 'Panci Presto', 'Blender', 'Oven'] },
  role: { prefix: 'ROL', names: ['Content Manager', 'Reviewer', 'Moderator'] },
  config: { prefix: 'CFG', names: ['Matching Threshold', 'Publish Window', 'Max Upload Size'] },
}

/** Weighted so the entity counts feel like a real log: recipes dominate. */
const ENTITY_CYCLE: AuditEntityType[] = [
  'recipe', 'nutrition-info', 'master-bahan', 'master-equipment', 'recipe', 'config',
  'recipe', 'master-bahan', 'role', 'nutrition-info', 'recipe', 'master-equipment',
]
const ACTION_CYCLE = ['published', 'updated', 'rejected', 'approved', 'published', 'updated', 'approved'] as const

const pick = <TItem>(items: readonly TItem[], index: number): TItem => items[index % items.length] as TItem

const BASE_TIME = Date.now()

const buildLog = (index: number): AuditLog => {
  const entityType = pick(ENTITY_CYCLE, index)
  const entity = ENTITIES[entityType]
  return {
    id: `audit-${index + 1}`,
    occurredAt: new Date(BASE_TIME - index * 1.6 * HOUR_MS - (index % 7) * 420_000).toISOString(),
    actor: pick(ACTORS, index * 3 + (index % 2)),
    action: pick(ACTION_CYCLE, index + (index % 3)),
    entityType,
    entityName: pick(entity.names, index * 5 + 1),
    status: index % 9 === 4 ? 'failed' : 'success',
  }
}

const logs: AuditLog[] = Array.from({ length: LOG_COUNT }, (_, index) => buildLog(index))

const matchesSearch = (log: AuditLog, search: string) => {
  const needle = search.trim().toLowerCase()
  return (
    needle === '' ||
    log.actor.name.toLowerCase().includes(needle) ||
    log.actor.email.toLowerCase().includes(needle) ||
    log.entityName.toLowerCase().includes(needle) ||
    ENTITY_LABEL[log.entityType].toLowerCase().includes(needle)
  )
}

const matchesDate = (log: AuditLog, from?: string, to?: string) => {
  const day = toIsoDay(new Date(log.occurredAt))
  return (!from || day >= from) && (!to || day <= to)
}

const matches = (log: AuditLog, params: AuditListParams) =>
  matchesSearch(log, params.search) &&
  (params.entityTypes.length === 0 || params.entityTypes.includes(log.entityType)) &&
  (params.action === 'all' || log.action === params.action) &&
  (params.status === 'all' || log.status === params.status) &&
  matchesDate(log, params.from, params.to)

const toRow = (log: AuditLog): AuditLog => ({ ...log, actor: { ...log.actor } })

export const fetchAuditLogs = async (params: AuditListParams): Promise<AuditListResult> => {
  failLoadIfMocked('fetchAuditLogs')
  await wait()
  const filtered = logs.filter((log) => matches(log, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map(toRow), total: filtered.length }
}

/** How many logs each entity type has overall, for the Entity filter's counts. */
export const fetchAuditEntityCounts = async (): Promise<Record<AuditEntityType, number>> => {
  await wait()
  const counts = Object.fromEntries(AUDIT_ENTITY_TYPES.map((type) => [type, 0])) as Record<AuditEntityType, number>
  logs.forEach((log) => (counts[log.entityType] += 1))
  return counts
}

const RECIPE_BEFORE: AuditField[] = [
  { label: 'Active version', value: 'v2' },
  { label: 'Steps', value: '8 steps' },
  { label: 'Publish status', value: 'Draft Revision', tone: 'warning' },
  { label: 'Nutrition', value: 'Stale', tone: 'warning' },
  { label: 'Blockers', value: '2 open' },
]

const RECIPE_AFTER: AuditField[] = [
  { label: 'Active version', value: 'v3' },
  { label: 'Steps', value: '9 steps' },
  { label: 'Publish status', value: 'Published', tone: 'success' },
  { label: 'Nutrition', value: 'Valid', tone: 'success' },
  { label: 'Blockers', value: 'None' },
]

const SNAPSHOTS: Record<AuditEntityType, { before: AuditField[]; after: AuditField[] }> = {
  recipe: { before: RECIPE_BEFORE, after: RECIPE_AFTER },
  'nutrition-info': {
    before: [
      { label: 'Calories', value: '312 kcal' },
      { label: 'Protein', value: '14 g' },
      { label: 'Nutrition', value: 'Stale', tone: 'warning' },
    ],
    after: [
      { label: 'Calories', value: '298 kcal' },
      { label: 'Protein', value: '16 g' },
      { label: 'Nutrition', value: 'Valid', tone: 'success' },
    ],
  },
  'master-bahan': {
    before: [
      { label: 'Unit', value: 'gram' },
      { label: 'Category', value: 'Spice' },
      { label: 'Status', value: 'Draft', tone: 'warning' },
    ],
    after: [
      { label: 'Unit', value: 'gram' },
      { label: 'Category', value: 'Spice' },
      { label: 'Status', value: 'Verified', tone: 'success' },
    ],
  },
  'master-equipment': {
    before: [
      { label: 'Capacity', value: '3 L' },
      { label: 'Status', value: 'Draft', tone: 'warning' },
    ],
    after: [
      { label: 'Capacity', value: '3.5 L' },
      { label: 'Status', value: 'Verified', tone: 'success' },
    ],
  },
  role: {
    before: [
      { label: 'Members', value: '5' },
      { label: 'Publish recipes', value: 'Not allowed' },
    ],
    after: [
      { label: 'Members', value: '5' },
      { label: 'Publish recipes', value: 'Allowed', tone: 'success' },
    ],
  },
  config: {
    before: [{ label: 'Value', value: '0.82' }],
    after: [{ label: 'Value', value: '0.85' }],
  },
}

const FAILURES: Record<AuditEntityType, { reason: string; blockers: string[] }> = {
  recipe: { reason: 'Publish validation failed', blockers: ['Missing quantity: Santan', 'No required equipment set'] },
  'nutrition-info': { reason: 'Nutrition could not be recalculated', blockers: ['Ingredient has no nutrition data'] },
  'master-bahan': { reason: 'Verification rejected', blockers: ['Duplicate of an existing ingredient'] },
  'master-equipment': { reason: 'Update rejected', blockers: ['Equipment is used by published recipes'] },
  role: { reason: 'Permission change rejected', blockers: ['Role is locked'] },
  config: { reason: 'Value out of range', blockers: ['Must be between 0 and 1'] },
}

export const fetchAuditDetail = async (id: string): Promise<AuditDetail> => {
  await wait()
  if (id === FAILING_AUDIT_ID) throw new Error('The server could not load this entry.')
  const index = logs.findIndex((log) => log.id === id)
  const log = logs[index]
  if (!log) throw new Error('This log entry no longer exists.')
  const snapshot = SNAPSHOTS[log.entityType]
  const isFailed = log.status === 'failed'
  return {
    ...toRow(log),
    entityId: `${ENTITIES[log.entityType].prefix}-${String(128 + index).padStart(5, '0')}`,
    before: snapshot.before,
    after: isFailed ? null : snapshot.after,
    failure: isFailed ? FAILURES[log.entityType] : null,
  }
}

const EXPORT_COLUMNS = ['Date', 'Time', 'Actor', 'Email', 'Action', 'Entity', 'Entity name', 'Status']

const toCsvCell = (value: string) => `"${value.replace(/"/g, '""')}"`

const toCsv = (rows: AuditLog[]) =>
  [
    EXPORT_COLUMNS.map(toCsvCell).join(','),
    ...rows.map((log) =>
      [
        formatDayWib(log.occurredAt),
        formatTimeWib(log.occurredAt),
        log.actor.name,
        log.actor.email,
        ACTION_LABEL[log.action],
        ENTITY_LABEL[log.entityType],
        log.entityName,
        STATUS_LABEL[log.status],
      ]
        .map(toCsvCell)
        .join(','),
    ),
  ].join('\n')

const rowsForScope = (scope: ExportScope, params: AuditListParams) =>
  scope === 'all' ? logs : logs.filter((log) => matches(log, params))

export const fetchExportCount = async (scope: ExportScope, params: AuditListParams): Promise<number> => {
  await wait()
  return rowsForScope(scope, params).length
}

export type AuditExport = {
  filename: string
  csv: string
  count: number
}

export const exportAuditLog = async (scope: ExportScope, params: AuditListParams): Promise<AuditExport> => {
  await wait()
  if (scope === 'filters' && params.status === 'failed') throw new Error('The server rejected this request.')
  const rows = rowsForScope(scope, params)
  return { filename: `audit-log-${toIsoDay(new Date())}.csv`, csv: toCsv(rows), count: rows.length }
}

