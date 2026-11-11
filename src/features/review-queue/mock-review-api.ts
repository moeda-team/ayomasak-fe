import { toIsoDay } from '@/lib/iso-day'
import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import { sourceGroupLabelOf, sourceKeyOf } from './review-config'
import type {
  MergeTarget,
  ReviewCounts,
  ReviewItem,
  ReviewKind,
  ReviewListParams,
  ReviewListResult,
  ReviewMatch,
  ReviewSource,
} from './review-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Rejecting with a reason that contains {@link FAILING_REASON_MARKER}, or acting on an item whose name contains
 * it, fails on purpose so the error toast can be seen without a broken backend.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_REASON_MARKER = 'fail'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const match = (id: string, name: string, aliases: string[], score: number): ReviewMatch => ({ id, name, aliases, score })

type ItemSeed = Omit<ReviewItem, 'aliases'> & { aliases?: string[] }

const input = (typedCount: number): ReviewSource => ({ kind: 'input-user', typedCount })
const admin = (adminName: string): ReviewSource => ({ kind: 'admin', adminName })

const SEED: ItemSeed[] = [
  {
    id: 'review-1',
    name: 'Kunir',
    kind: 'unmapped',
    source: input(8),
    submittedAt: '2026-11-05T10:14:00+07:00',
    category: null,
    defaultUnit: null,
    matches: [match('bahan-kunyit', 'Kunyit', ['turmeric'], 94), match('bahan-kunci', 'Kunci', ['fingerroot'], 38)],
  },
  {
    id: 'review-2',
    name: 'Jahe Merah',
    kind: 'bahan',
    aliases: ['red ginger'],
    source: admin('Nadia Putri'),
    submittedAt: '2026-11-05T09:40:00+07:00',
    category: 'Bumbu',
    defaultUnit: 'gram',
    matches: [match('bahan-jahe', 'Jahe', ['ginger'], 82), match('bahan-jahe-gajah', 'Jahe Gajah', ['elephant ginger'], 61)],
  },
  {
    id: 'review-3',
    name: 'Wajan Besi',
    kind: 'equipment',
    aliases: ['cast iron pan'],
    source: admin('Rizky Maulana'),
    submittedAt: '2026-11-04T14:05:00+07:00',
    category: 'Alat masak',
    defaultUnit: null,
    matches: [match('equipment-wajan', 'Wajan', ['frying pan'], 77)],
  },
  {
    id: 'review-4',
    name: 'airfrayer',
    kind: 'unmapped',
    source: input(3),
    submittedAt: '2026-11-04T08:30:00+07:00',
    category: null,
    defaultUnit: null,
    matches: [match('equipment-air-fryer', 'Air Fryer', ['air fryer'], 91)],
  },
  {
    id: 'review-5',
    name: 'Daun Jeruk Purut',
    kind: 'bahan',
    aliases: ['kaffir lime leaf'],
    source: admin('Layla Rahma'),
    submittedAt: '2026-11-03T16:20:00+07:00',
    category: 'Bumbu',
    defaultUnit: 'lembar',
    matches: [match('bahan-daun-jeruk', 'Daun Jeruk', ['lime leaf'], 72)],
  },
  {
    id: 'review-6',
    name: 'Panci Presto',
    kind: 'equipment',
    aliases: ['pressure cooker'],
    source: admin('Nadia Putri'),
    submittedAt: '2026-11-03T11:00:00+07:00',
    category: 'Alat masak',
    defaultUnit: null,
    matches: [],
  },
]

const reviewDb: ReviewItem[] = SEED.map((seed) => ({ ...seed, aliases: seed.aliases ?? [] }))

/** MOCK: the master records an item can be merged into. Real data comes from Master Bahan and Master Equipment. */
const MOCK_BAHAN_TARGETS: MergeTarget[] = [
  { id: 'bahan-kunyit', name: 'Kunyit' },
  { id: 'bahan-kunci', name: 'Kunci' },
  { id: 'bahan-jahe', name: 'Jahe' },
  { id: 'bahan-jahe-gajah', name: 'Jahe Gajah' },
  { id: 'bahan-daun-jeruk', name: 'Daun Jeruk' },
  { id: 'bahan-bawang-putih', name: 'Bawang Putih' },
  { id: 'bahan-bawang-merah', name: 'Bawang Merah' },
]
const MOCK_EQUIPMENT_TARGETS: MergeTarget[] = [
  { id: 'equipment-wajan', name: 'Wajan' },
  { id: 'equipment-air-fryer', name: 'Air Fryer' },
  { id: 'equipment-panci', name: 'Panci' },
  { id: 'equipment-rice-cooker', name: 'Rice Cooker' },
]

const normalize = (text: string) => text.trim().toLowerCase()

const visibleItems = () => (isMockMode('empty') ? [] : reviewDb)

const dayOf = (item: ReviewItem) => toIsoDay(new Date(item.submittedAt))

const matchesItem = (item: ReviewItem, params: ReviewListParams) => {
  const needle = normalize(params.search)
  const day = dayOf(item)
  return (
    (needle === '' || [item.name, ...item.aliases].some((text) => normalize(text).includes(needle))) &&
    (params.kind === 'all' || item.kind === params.kind) &&
    (params.sources.length === 0 || params.sources.includes(sourceKeyOf(item.source))) &&
    (params.from === undefined || day >= params.from) &&
    (params.to === undefined || day <= params.to)
  )
}

const byNewest = (a: ReviewItem, b: ReviewItem) => b.submittedAt.localeCompare(a.submittedAt)

export const fetchReviewList = async (params: ReviewListParams): Promise<ReviewListResult> => {
  failLoadIfMocked('fetchReviewList')
  await wait()
  const filtered = visibleItems()
    .filter((item) => matchesItem(item, params))
    .sort(byNewest)
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize), total: filtered.length }
}

export const fetchReviewCounts = async (): Promise<ReviewCounts> => {
  await wait()
  const items = visibleItems()
  const countOf = (kind: ReviewKind) => items.filter((item) => item.kind === kind).length
  const groups = new Map<string, { label: string; count: number }>()
  items.forEach((item) => {
    const key = sourceKeyOf(item.source)
    const group = groups.get(key) ?? { label: sourceGroupLabelOf(item.source), count: 0 }
    groups.set(key, { ...group, count: group.count + 1 })
  })
  return {
    all: items.length,
    byKind: { bahan: countOf('bahan'), equipment: countOf('equipment'), unmapped: countOf('unmapped') },
    bySource: [...groups].map(([key, group]) => ({ key, ...group })),
  }
}

/** Master records for the "Merge into" picker: bahan items merge into bahan, equipment into equipment, unmapped input into either. */
export const fetchMergeTargets = async (kind: ReviewKind): Promise<MergeTarget[]> => {
  await wait()
  if (kind === 'bahan') return MOCK_BAHAN_TARGETS
  if (kind === 'equipment') return MOCK_EQUIPMENT_TARGETS
  return [...MOCK_BAHAN_TARGETS, ...MOCK_EQUIPMENT_TARGETS]
}

const takeItem = (id: string) => {
  const index = reviewDb.findIndex((item) => item.id === id)
  const item = reviewDb[index]
  if (!item) throw new Error('This item was already reviewed.')
  if (normalize(item.name).includes(FAILING_REASON_MARKER)) throw new Error('The server rejected this request.')
  return { item, remove: () => reviewDb.splice(index, 1) }
}

export const approveItem = async (id: string): Promise<ReviewItem> => {
  await wait()
  const { item, remove } = takeItem(id)
  remove()
  return item
}

export const rejectItem = async (id: string, reason: string): Promise<ReviewItem> => {
  await wait()
  const { item, remove } = takeItem(id)
  if (normalize(reason).includes(FAILING_REASON_MARKER)) throw new Error('The server rejected this request.')
  remove()
  return item
}

export const mergeItem = async (id: string, targetId: string): Promise<{ item: ReviewItem; target: MergeTarget }> => {
  await wait()
  const target = [...MOCK_BAHAN_TARGETS, ...MOCK_EQUIPMENT_TARGETS].find((candidate) => candidate.id === targetId)
  if (!target) throw new Error('This master item no longer exists.')
  const { item, remove } = takeItem(id)
  remove()
  return { item, target }
}
