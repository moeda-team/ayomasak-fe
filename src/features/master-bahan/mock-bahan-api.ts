import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import type {
  Bahan,
  BahanCategory,
  BahanCategoryCount,
  BahanDuplicate,
  BahanForm,
  BahanFormValues,
  BahanListParams,
  BahanListResult,
  BahanStatus,
} from './bahan-types'
import { BAHAN_CATEGORIES } from './bahan-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Saving a bahan whose name contains {@link FAILING_NAME_MARKER} fails on purpose, so the error toast can be
 * seen without a broken backend. Deactivating such a bahan fails too.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_NAME_MARKER = 'fail'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

type Seed = [
  name: string,
  aliases: string[],
  category: BahanCategory,
  form: BahanForm,
  defaultUnit: string,
  isPantry: boolean,
  status: BahanStatus,
]

const SEED: Seed[] = [
  ['Kemiri', ['candlenut', 'kemiri sangrai'], 'bumbu', 'biji', 'gram', true, 'active'],
  ['Bawang Putih', ['garlic', 'bawang putih cincang'], 'bumbu', 'segar', 'siung', true, 'active'],
  ['Dada Ayam Fillet', ['chicken breast', 'fillet ayam'], 'protein', 'segar', 'gram', false, 'active'],
  ['Kecap Manis', ['sweet soy sauce'], 'saus', 'cair', 'ml', true, 'active'],
  ['Tempe', ['tempeh'], 'protein', 'padat', 'gram', false, 'pending-review'],
  ['Terasi Udang', ['shrimp paste', 'belacan'], 'bumbu', 'pasta', 'gram', true, 'inactive'],
  ['Bawang Merah', ['shallot', 'bawang merah iris'], 'bumbu', 'segar', 'siung', true, 'active'],
  ['Cabai Merah Keriting', ['red chili'], 'bumbu', 'segar', 'gram', false, 'active'],
  ['Jahe', ['ginger'], 'bumbu', 'segar', 'gram', true, 'active'],
  ['Lengkuas', ['galangal', 'laos'], 'bumbu', 'segar', 'gram', true, 'active'],
  ['Serai', ['lemongrass'], 'bumbu', 'segar', 'batang', false, 'active'],
  ['Daun Salam', ['bay leaf'], 'bumbu', 'segar', 'lembar', true, 'active'],
  ['Ketumbar', ['coriander'], 'bumbu', 'bubuk', 'gram', true, 'active'],
  ['Merica', ['pepper', 'lada'], 'bumbu', 'bubuk', 'sdt', true, 'active'],
  ['Garam', ['salt'], 'bumbu', 'bubuk', 'sdt', true, 'active'],
  ['Gula Pasir', ['sugar'], 'bumbu', 'bubuk', 'sdm', true, 'active'],
  ['Telur Ayam', ['egg'], 'protein', 'segar', 'butir', false, 'active'],
  ['Daging Sapi', ['beef'], 'protein', 'segar', 'gram', false, 'active'],
  ['Ikan Nila', ['tilapia'], 'protein', 'segar', 'gram', false, 'active'],
  ['Udang', ['shrimp', 'udang segar'], 'protein', 'segar', 'gram', false, 'active'],
  ['Tahu', ['tofu'], 'protein', 'padat', 'buah', false, 'active'],
  ['Bayam', ['spinach'], 'sayur', 'segar', 'ikat', false, 'active'],
  ['Kangkung', ['water spinach'], 'sayur', 'segar', 'ikat', false, 'active'],
  ['Wortel', ['carrot'], 'sayur', 'segar', 'gram', false, 'active'],
  ['Tomat', ['tomato'], 'sayur', 'segar', 'buah', false, 'active'],
  ['Kentang', ['potato'], 'karbohidrat', 'segar', 'gram', false, 'active'],
  ['Nasi Putih', ['steamed rice', 'nasi'], 'karbohidrat', 'padat', 'gram', false, 'pending-review'],
  ['Mie Telur', ['egg noodles'], 'karbohidrat', 'padat', 'gram', false, 'active'],
  ['Pisang', ['banana'], 'buah', 'segar', 'buah', false, 'active'],
  ['Jeruk Nipis', ['lime'], 'buah', 'segar', 'buah', false, 'active'],
  ['Saus Tiram', ['oyster sauce'], 'saus', 'cair', 'ml', true, 'active'],
  ['Saus Sambal', ['chili sauce'], 'saus', 'cair', 'ml', false, 'pending-review'],
  ['Minyak Goreng', ['cooking oil'], 'bumbu', 'cair', 'ml', true, 'active'],
  ['Santan', ['coconut milk'], 'saus', 'cair', 'ml', false, 'active'],
  ['Kecap Asin', ['soy sauce', 'salty soy sauce'], 'saus', 'cair', 'ml', true, 'inactive'],
]

const db: Bahan[] = SEED.map(([name, aliases, category, form, defaultUnit, isPantry, status], index) => ({
  id: `bahan-${index + 1}`,
  name,
  aliases,
  category,
  form,
  defaultUnit,
  isPantry,
  status,
}))

const normalize = (text: string) => text.trim().toLowerCase()

const matchesSearch = (bahan: Bahan, search: string) => {
  const needle = normalize(search)
  return needle === '' || [bahan.name, ...bahan.aliases].some((text) => normalize(text).includes(needle))
}

const matches = (bahan: Bahan, params: BahanListParams) =>
  matchesSearch(bahan, params.search) &&
  (params.categories.length === 0 || params.categories.includes(bahan.category)) &&
  (params.form === 'all' || bahan.form === params.form) &&
  (params.status === 'all' || bahan.status === params.status) &&
  (params.pantry === 'all' || bahan.isPantry === (params.pantry === 'pantry'))

const copy = (bahan: Bahan): Bahan => ({ ...bahan, aliases: [...bahan.aliases] })

/** `?mock=empty` shows the page as if no bahan had been added yet. */
const visibleRecords = () => (isMockMode('empty') ? [] : db)

export const fetchBahanList = async (params: BahanListParams): Promise<BahanListResult> => {
  failLoadIfMocked('fetchBahanList')
  await wait()
  const filtered = visibleRecords().filter((bahan) => matches(bahan, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map(copy), total: filtered.length }
}

export const fetchBahanCategoryCounts = async (): Promise<BahanCategoryCount[]> => {
  await wait()
  return BAHAN_CATEGORIES.map((category) => ({
    category,
    count: visibleRecords().filter((bahan) => bahan.category === category).length,
  }))
}

/** The bahan that already uses `name` as its canonical name or as an alias; `ignoreId` skips the one being edited. */
export const findDuplicateBahan = async (name: string, ignoreId?: string): Promise<BahanDuplicate | null> => {
  await wait()
  const needle = normalize(name)
  for (const bahan of db) {
    if (bahan.id === ignoreId) continue
    if (normalize(bahan.name) === needle) return { bahan: copy(bahan) }
    const matchedAlias = bahan.aliases.find((alias) => normalize(alias) === needle)
    if (matchedAlias) return { bahan: copy(bahan), matchedAlias }
  }
  return null
}

const assertCanSave = (name: string) => {
  if (normalize(name).includes(FAILING_NAME_MARKER)) throw new Error('The server rejected this request.')
}

export const createBahan = async (values: BahanFormValues): Promise<Bahan> => {
  await wait()
  assertCanSave(values.name)
  const bahan: Bahan = { ...values, id: `bahan-${crypto.randomUUID()}`, status: 'pending-review' }
  db.unshift(bahan)
  return copy(bahan)
}

export const updateBahan = async (id: string, values: BahanFormValues): Promise<Bahan> => {
  await wait()
  assertCanSave(values.name)
  const index = db.findIndex((bahan) => bahan.id === id)
  if (index === -1) throw new Error('This bahan no longer exists.')
  const updated: Bahan = { ...values, id }
  db[index] = updated
  return copy(updated)
}

export const deactivateBahan = async (id: string): Promise<void> => {
  await wait()
  const bahan = db.find((record) => record.id === id)
  if (!bahan) throw new Error('This bahan no longer exists.')
  assertCanSave(bahan.name)
  bahan.status = 'inactive'
}
