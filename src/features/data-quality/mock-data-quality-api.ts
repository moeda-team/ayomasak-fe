import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import { formatRelativeTime } from '@/lib/format-relative-time'
import type {
  BreakdownKind,
  DataQualityFilters,
  Drilldown,
  DrilldownItem,
  DrilldownKey,
  DrilldownTone,
  IssueKind,
  IssuesToFix,
  IssueToFix,
  QualityMetric,
  QualityMetricKey,
  QualityOverview,
  RecipeBreakdown,
  RecipeCategory,
  RecipeStatus,
  ResolvedIssue,
} from './data-quality-types'

/** MOCK: replace each function with a real request. Signatures are what the hooks depend on. */
const MOCK_LATENCY_MS = 500

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const MINUTE_MS = 60_000
const HOUR_MS = 3_600_000
const DAY_MS = 86_400_000

const ago = (ms: number) => new Date(Date.now() - ms).toISOString()

/** Cards shown on the page, and the issue lists, are empty in these two modes. */
const isHealthy = () => isMockMode('healthy')
const hasNoRecipes = () => isMockMode('empty')

const TOTAL_RECIPES = 64
/** Cards that fail in `partial` mode, together with the nutrition panel. */
const FAILS_IN_PARTIAL_MODE: QualityMetricKey[] = ['stale-nutrition', 'broken-media']

export const fetchQualityOverview = async (): Promise<QualityOverview> => {
  failLoadIfMocked('fetchQualityOverview')
  await wait()
  return { totalRecipes: hasNoRecipes() ? 0 : TOTAL_RECIPES, checkedAt: ago(5 * MINUTE_MS) }
}

const METRICS: Record<QualityMetricKey, Omit<QualityMetric, 'key'>> = {
  'publish-blockers': { value: 7, delta: -4, deltaUnit: 'percent', trend: [10, 14, 9, 16, 8, 13, 7, 12, 9, 15, 8, 11] },
  'stale-nutrition': { value: 5, delta: 2, deltaUnit: 'count', trend: [8, 12, 7, 13, 9, 15, 10, 14, 11, 16, 12, 18] },
  'unmapped-input': { value: 14, delta: 3, deltaUnit: 'count', trend: [9, 11, 8, 13, 10, 15, 12, 17, 14, 19, 16, 22] },
  'broken-media': { value: 3, delta: 0, deltaUnit: 'count', trend: [6, 9, 5, 10, 7, 12, 8, 11, 6, 9, 7, 10] },
}

/** `null` means there is no data to compute it from yet. */
export const fetchQualityMetric = async (key: QualityMetricKey): Promise<QualityMetric | null> => {
  failLoadIfMocked(`fetchQualityMetric:${key}`, { inPartialMode: FAILS_IN_PARTIAL_MODE.includes(key) })
  await wait()
  if (hasNoRecipes()) return null
  const metric = METRICS[key]
  return isHealthy() ? { key, ...metric, value: 0, delta: 0 } : { key, ...metric }
}

const BREAKDOWNS: Record<BreakdownKind, Record<string, number>> = {
  eligibility: { viewable: 52, matchable: 47, 'nutrition-searchable': 38, 'not-ready': 12 },
  nutrition: { valid: 30, 'estimated-valid': 14, 'needs-recalculation': 6, stale: 5, missing: 9 },
  lifecycle: { published: 48, 'draft-revision': 4, draft: 12 },
}

/** What a healthy catalogue looks like: nothing stale, nothing missing, nothing waiting for a recalculation. */
const HEALTHY_NUTRITION = { valid: 50, 'estimated-valid': 14, 'needs-recalculation': 0, stale: 0, missing: 0 }

export const fetchRecipeBreakdown = async (kind: BreakdownKind): Promise<RecipeBreakdown> => {
  failLoadIfMocked(`fetchRecipeBreakdown:${kind}`, { inPartialMode: kind === 'nutrition' })
  await wait()
  if (hasNoRecipes()) return { total: 0, counts: {} }
  const counts = kind === 'nutrition' && isHealthy() ? HEALTHY_NUTRITION : BREAKDOWNS[kind]
  return { total: TOTAL_RECIPES, counts }
}

type IssueRow = {
  id: string
  recipeName: string
  category: RecipeCategory
  status: RecipeStatus
  issue: IssueKind
  ageMs: number
}

const ISSUE_ROWS: IssueRow[] = [
  { id: 'nasi-goreng', recipeName: 'Nasi Goreng Kampung', category: 'rice-noodles', status: 'published', issue: 'stale-nutrition', ageMs: 2 * HOUR_MS },
  { id: 'soto-ayam', recipeName: 'Soto Ayam Lamongan', category: 'soup', status: 'published', issue: 'missing-step', ageMs: 3 * HOUR_MS },
  { id: 'rendang', recipeName: 'Rendang Daging Sapi', category: 'meat', status: 'published', issue: 'broken-media', ageMs: 5 * HOUR_MS },
  { id: 'gado-gado', recipeName: 'Gado-Gado Jakarta', category: 'vegetable', status: 'draft', issue: 'unmapped-ingredient', ageMs: 8 * HOUR_MS },
  { id: 'tumis-kangkung', recipeName: 'Tumis Kangkung Terasi', category: 'vegetable', status: 'draft', issue: 'publish-blocked', ageMs: 26 * HOUR_MS },
  { id: 'bakso-malang', recipeName: 'Bakso Malang', category: 'soup', status: 'published', issue: 'broken-media', ageMs: 30 * HOUR_MS },
  { id: 'pepes-ikan', recipeName: 'Pepes Ikan Mas', category: 'seafood', status: 'draft-revision', issue: 'broken-media', ageMs: 2 * DAY_MS },
  { id: 'sambal-matah', recipeName: 'Sambal Matah', category: 'sambal', status: 'draft', issue: 'publish-blocked', ageMs: 2 * DAY_MS + 4 * HOUR_MS },
  { id: 'sate-ayam', recipeName: 'Sate Ayam Madura', category: 'meat', status: 'published', issue: 'stale-nutrition', ageMs: 5 * DAY_MS },
  { id: 'mie-goreng', recipeName: 'Mie Goreng Jawa', category: 'rice-noodles', status: 'published', issue: 'unmapped-ingredient', ageMs: 45 * DAY_MS },
  { id: 'opor-ayam', recipeName: 'Opor Ayam', category: 'soup', status: 'draft', issue: 'missing-step', ageMs: 70 * DAY_MS },
  { id: 'ikan-bakar', recipeName: 'Ikan Bakar Jimbaran', category: 'seafood', status: 'published', issue: 'stale-nutrition', ageMs: 150 * DAY_MS },
]

const ISSUES_SHOWN = 5

const daysSinceYearStart = () => {
  const now = new Date()
  return (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / DAY_MS
}

const windowInDays = (updated: DataQualityFilters['updated']) => (updated === 'year' ? daysSinceYearStart() : Number(updated))

const matchesFilters = (row: IssueRow, { search, issue, category, status, updated }: DataQualityFilters) =>
  row.recipeName.toLowerCase().includes(search.trim().toLowerCase()) &&
  (issue === 'all' || row.issue === issue) &&
  (category === 'all' || row.category === category) &&
  (status === 'all' || row.status === status) &&
  row.ageMs <= windowInDays(updated) * DAY_MS

export const fetchIssuesToFix = async (filters: DataQualityFilters): Promise<IssuesToFix> => {
  failLoadIfMocked('fetchIssuesToFix')
  await wait()
  if (hasNoRecipes() || isHealthy()) return { total: 0, items: [] }
  const matches = ISSUE_ROWS.filter((row) => matchesFilters(row, filters))
  const items = matches
    .slice(0, ISSUES_SHOWN)
    .map(({ id, recipeName, issue, ageMs }): IssueToFix => ({ id, recipeName, issue, detectedAt: ago(ageMs) }))
  return { total: matches.length, items }
}

export const fetchRecentlyResolved = async (): Promise<ResolvedIssue[]> => {
  failLoadIfMocked('fetchRecentlyResolved')
  await wait()
  if (hasNoRecipes()) return []
  return [
    { id: 'r1', recipeName: 'Nasi Goreng Kampung', detail: 'Nutrition recalculated · Rina', resolvedAt: ago(10 * MINUTE_MS) },
    { id: 'r2', recipeName: 'Soto Ayam Lamongan', detail: 'Step added · Dito', resolvedAt: ago(HOUR_MS) },
    { id: 'r3', recipeName: 'Rendang Daging Sapi', detail: 'Media replaced · Rina', resolvedAt: ago(3 * HOUR_MS) },
    { id: 'r4', recipeName: 'Tumis Kangkung Terasi', detail: 'Ingredient mapped · Dito', resolvedAt: ago(5 * HOUR_MS) },
    { id: 'r5', recipeName: 'Pepes Ikan Mas', detail: 'Blocker cleared · Super Admin', resolvedAt: ago(26 * HOUR_MS) },
  ]
}

type DrilldownRow = { id: string; recipeName: string; reason: string; ageMs: number }

type DrilldownGroup = { rows: DrilldownRow[]; badge: { label: string; tone: DrilldownTone }; joiner?: string }

const toItems = ({ rows, badge, joiner = ' · ' }: DrilldownGroup): DrilldownItem[] =>
  rows.map(({ id, recipeName, reason, ageMs }) => ({
    id,
    recipeName,
    detail: `${reason}${joiner}${formatRelativeTime(ago(ageMs))}`,
    badge,
  }))

const DRAFT_NAMES = [
  'Nasi Uduk Betawi',
  'Ayam Betutu',
  'Sayur Asem',
  'Opor Ayam',
  'Bubur Ayam',
  'Pecel Lele',
  'Karedok',
  'Semur Jengkol',
  'Lontong Sayur',
  'Es Cendol',
  'Mie Aceh',
  'Kerak Telor',
]
const DRAFT_AGES_DAYS = [2, 3, 4, 7, 7, 9, 10, 12, 14, 15, 20, 21]

const DRILLDOWN_ROWS: Record<DrilldownKey, DrilldownGroup> = {
  'publish-blockers': {
    badge: { label: 'Blocked', tone: 'danger' },
    rows: [
      { id: 'b1', recipeName: 'Tumis Kangkung Terasi', reason: 'Missing ingredient quantity', ageMs: DAY_MS },
      { id: 'b2', recipeName: 'Soto Ayam Lamongan', reason: 'No cooking steps', ageMs: 3 * HOUR_MS },
      { id: 'b3', recipeName: 'Sambal Matah', reason: 'Equipment not set', ageMs: 2 * DAY_MS },
      { id: 'b4', recipeName: 'Gado-Gado Jakarta', reason: 'Base servings missing', ageMs: 4 * DAY_MS },
      { id: 'b5', recipeName: 'Pepes Ikan Mas', reason: 'Invalid unit', ageMs: 5 * DAY_MS },
      { id: 'b6', recipeName: 'Bakso Malang', reason: 'No cooking steps', ageMs: 6 * DAY_MS },
      { id: 'b7', recipeName: 'Mie Goreng Jawa', reason: 'Missing ingredient quantity', ageMs: 8 * DAY_MS },
    ],
  },
  'stale-nutrition': {
    badge: { label: 'Stale', tone: 'warning' },
    rows: [
      { id: 's1', recipeName: 'Nasi Goreng Kampung', reason: 'Ingredient quantity changed', ageMs: 2 * HOUR_MS },
      { id: 's2', recipeName: 'Sate Ayam Madura', reason: 'Quantity unit changed', ageMs: 5 * DAY_MS },
      { id: 's3', recipeName: 'Gado-Gado Jakarta', reason: 'Ingredient replaced', ageMs: 3 * DAY_MS },
      { id: 's4', recipeName: 'Soto Ayam Lamongan', reason: 'Ingredient quantity changed', ageMs: 2 * DAY_MS },
      { id: 's5', recipeName: 'Rendang Daging Sapi', reason: 'Serving size changed', ageMs: DAY_MS },
    ],
  },
  'broken-media': {
    badge: { label: 'Broken', tone: 'danger' },
    rows: [
      { id: 'm1', recipeName: 'Rendang Daging Sapi', reason: 'Photo link returns 404', ageMs: 5 * HOUR_MS },
      { id: 'm2', recipeName: 'Bakso Malang', reason: 'Video link unreachable', ageMs: DAY_MS },
      { id: 'm3', recipeName: 'Pepes Ikan Mas', reason: 'Image failed to load', ageMs: 2 * DAY_MS },
    ],
  },
  'draft-recipes': {
    badge: { label: 'Draft', tone: 'neutral' },
    joiner: ' ',
    rows: DRAFT_NAMES.map((recipeName, index) => ({
      id: `d${index + 1}`,
      recipeName,
      reason: 'Draft · updated',
      ageMs: (DRAFT_AGES_DAYS[index] ?? 30) * DAY_MS,
    })),
  },
}

export const fetchDrilldown = async (key: DrilldownKey): Promise<Drilldown> => {
  failLoadIfMocked(`fetchDrilldown:${key}`)
  await wait()
  if (hasNoRecipes() || (isHealthy() && key !== 'draft-recipes')) return { total: 0, items: [] }
  const group = DRILLDOWN_ROWS[key]
  return { total: group.rows.length, items: toItems(group) }
}
