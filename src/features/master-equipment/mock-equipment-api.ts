import type { MasterStatus } from '@/features/master-data/master-status'
import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import { EQUIPMENT_CATEGORIES } from './equipment-types'
import type {
  Equipment,
  EquipmentCategory,
  EquipmentCategoryCount,
  EquipmentDuplicate,
  EquipmentFormValues,
  EquipmentListParams,
  EquipmentListResult,
  EquipmentRef,
} from './equipment-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Saving an equipment whose name contains {@link FAILING_NAME_MARKER} fails on purpose, so the error toast can
 * be seen without a broken backend. Deactivating such an equipment fails too.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_NAME_MARKER = 'fail'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

/** A record as stored: alternatives are ids, resolved to names when read. */
type StoredEquipment = Omit<Equipment, 'alternatives'> & { alternativeIds: string[] }

type Seed = [name: string, aliases: string[], category: EquipmentCategory, alternatives: string[], status: MasterStatus]

const SEED: Seed[] = [
  ['Wajan', ['frying pan', 'penggorengan'], 'masak', ['Teflon', 'Panci datar'], 'active'],
  ['Panci', ['pot', 'panci rebus'], 'masak', ['Presto', 'Dandang'], 'active'],
  ['Blender', ['juicer', 'penghalus'], 'elektronik', ['Food processor', 'Ulekan'], 'active'],
  ['Pisau Dapur', ['knife', 'pisau chef'], 'potong', ['Gunting dapur'], 'active'],
  ['Oven Listrik', ['oven', 'pemanggang'], 'elektronik', ['Air fryer', 'Oven tangkring'], 'pending-review'],
  ['Kukusan', ['steamer', 'dandang kukus'], 'masak', ['Panci + saringan'], 'inactive'],
  ['Teflon', ['non-stick pan'], 'masak', [], 'active'],
  ['Panci datar', [], 'masak', [], 'active'],
  ['Presto', ['pressure cooker'], 'masak', [], 'active'],
  ['Dandang', [], 'masak', [], 'active'],
  ['Panci + saringan', [], 'masak', [], 'active'],
  ['Sutil', ['spatula'], 'masak', [], 'active'],
  ['Food processor', [], 'elektronik', [], 'active'],
  ['Air fryer', ['penggoreng udara'], 'elektronik', [], 'active'],
  ['Oven tangkring', [], 'masak', [], 'active'],
  ['Rice cooker', ['magic com'], 'elektronik', ['Dandang'], 'active'],
  ['Mixer', ['pengocok'], 'elektronik', ['Whisk'], 'active'],
  ['Whisk', ['pengocok telur'], 'masak', [], 'active'],
  ['Ulekan', ['cobek', 'mortar'], 'potong', [], 'active'],
  ['Gunting dapur', ['kitchen scissors'], 'potong', [], 'active'],
  ['Talenan', ['cutting board'], 'potong', [], 'active'],
  ['Parutan', ['grater'], 'potong', [], 'active'],
  ['Timbangan Dapur', ['kitchen scale'], 'ukur', [], 'active'],
  ['Gelas Ukur', ['measuring cup'], 'ukur', ['Sendok Ukur'], 'active'],
  ['Sendok Ukur', ['measuring spoon'], 'ukur', [], 'active'],
  ['Piring Saji', ['serving plate'], 'sajikan', [], 'active'],
  ['Mangkuk Saji', ['serving bowl'], 'sajikan', [], 'pending-review'],
]

const idOf = (index: number) => `equipment-${index + 1}`

const db: StoredEquipment[] = SEED.map(([name, aliases, category, , status], index) => ({
  id: idOf(index),
  name,
  aliases,
  category,
  alternativeIds: [],
  status,
}))

// Alternatives are named in the seed, so they are linked once every record has its id.
SEED.forEach(([, , , alternatives], index) => {
  const record = db[index]
  if (record) record.alternativeIds = alternatives.flatMap((name) => db.find((other) => other.name === name)?.id ?? [])
})

const normalize = (text: string) => text.trim().toLowerCase()

const toRef = ({ id, name }: StoredEquipment): EquipmentRef => ({ id, name })

const toEquipment = (record: StoredEquipment): Equipment => {
  const { alternativeIds, ...rest } = record
  return {
    ...rest,
    aliases: [...rest.aliases],
    alternatives: alternativeIds.flatMap((id) => db.find((other) => other.id === id) ?? []).map(toRef),
  }
}

const matchesSearch = (record: StoredEquipment, search: string) => {
  const needle = normalize(search)
  return needle === '' || [record.name, ...record.aliases].some((text) => normalize(text).includes(needle))
}

const matches = (record: StoredEquipment, params: EquipmentListParams) =>
  matchesSearch(record, params.search) &&
  (params.categories.length === 0 || params.categories.includes(record.category)) &&
  (params.status === 'all' || record.status === params.status) &&
  (params.alternative === 'any' || (record.alternativeIds.length > 0) === (params.alternative === 'has'))

/** `?mock=empty` shows the page as if no equipment had been added yet. */
const visibleRecords = () => (isMockMode('empty') ? [] : db)

export const fetchEquipmentList = async (params: EquipmentListParams): Promise<EquipmentListResult> => {
  failLoadIfMocked('fetchEquipmentList')
  await wait()
  const filtered = visibleRecords().filter((record) => matches(record, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map(toEquipment), total: filtered.length }
}

export const fetchEquipmentCategoryCounts = async (): Promise<EquipmentCategoryCount[]> => {
  await wait()
  return EQUIPMENT_CATEGORIES.map((category) => ({
    category,
    count: visibleRecords().filter((record) => record.category === category).length,
  }))
}

/** Every equipment that can be picked as an alternative; `ignoreId` leaves out the one being edited. */
export const fetchEquipmentRefs = async (ignoreId?: string): Promise<EquipmentRef[]> => {
  await wait()
  return visibleRecords()
    .filter((record) => record.id !== ignoreId)
    .map(toRef)
}

/** The equipment that already uses `name` as its canonical name or as an alias; `ignoreId` skips the one being edited. */
export const findDuplicateEquipment = async (name: string, ignoreId?: string): Promise<EquipmentDuplicate | null> => {
  await wait()
  const needle = normalize(name)
  for (const record of db) {
    if (record.id === ignoreId) continue
    if (normalize(record.name) === needle) return { equipment: toEquipment(record) }
    const matchedAlias = record.aliases.find((alias) => normalize(alias) === needle)
    if (matchedAlias) return { equipment: toEquipment(record), matchedAlias }
  }
  return null
}

const assertCanSave = (name: string) => {
  if (normalize(name).includes(FAILING_NAME_MARKER)) throw new Error('The server rejected this request.')
}

export const createEquipment = async (values: EquipmentFormValues): Promise<Equipment> => {
  await wait()
  assertCanSave(values.name)
  const record: StoredEquipment = { ...values, id: `equipment-${crypto.randomUUID()}`, status: 'pending-review' }
  db.unshift(record)
  return toEquipment(record)
}

export const updateEquipment = async (id: string, values: EquipmentFormValues): Promise<Equipment> => {
  await wait()
  assertCanSave(values.name)
  const index = db.findIndex((record) => record.id === id)
  if (index === -1) throw new Error('This equipment no longer exists.')
  const updated: StoredEquipment = { ...values, id }
  db[index] = updated
  return toEquipment(updated)
}

export const deactivateEquipment = async (id: string): Promise<void> => {
  await wait()
  const record = db.find((candidate) => candidate.id === id)
  if (!record) throw new Error('This equipment no longer exists.')
  assertCanSave(record.name)
  record.status = 'inactive'
}
