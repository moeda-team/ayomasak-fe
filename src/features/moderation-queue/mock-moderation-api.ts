import { toIsoDay } from '@/lib/iso-day'
import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import type {
  ModerationAction,
  ModerationCounts,
  ModerationListParams,
  ModerationListResult,
  PostStatus,
  ReportedPost,
  ReportReason,
} from './moderation-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Acting on a post whose title contains {@link FAILING_TITLE_MARKER} fails on purpose so the error toast can be
 * seen without a broken backend. One of the seeded posts already does.
 */
const MOCK_LATENCY_MS = 600
export const FAILING_TITLE_MARKER = 'gagal'

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

type PostSeed = [
  title: string,
  authorName: string,
  recipeTitle: string,
  reason: ReportReason,
  reportCount: number,
  lastReportedAt: string,
  status: PostStatus,
]

const SEED: PostSeed[] = [
  ['Nasi goreng pertama saya', 'Rina Maulida', 'Nasi Goreng Kampung', 'spam', 12, '2026-11-08T10:20:00+07:00', 'reported'],
  ['Soto ayam versi hemat', 'Dewi Sari', 'Soto Ayam Lamongan', 'inappropriate', 7, '2026-11-08T08:05:00+07:00', 'reported'],
  ['Rendang 4 jam, gagal!', 'Budi Hartono', 'Rendang Padang', 'misleading', 5, '2026-11-07T19:40:00+07:00', 'reported'],
  ['Jual resep rahasia, DM saya', 'promo_masak99', 'Gado-Gado Betawi', 'spam', 9, '2026-11-07T13:15:00+07:00', 'reported'],
  ['Bakso homemade', 'Agus Pratama', 'Bakso Sapi', 'off-topic', 3, '2026-11-06T17:30:00+07:00', 'reported'],
  ['Mie goreng pedas banget', 'Lia Rahma', 'Mie Goreng Spesial', 'misleading', 2, '2026-11-06T09:10:00+07:00', 'reported'],
  ['Es teh gula aren viral', 'Citra Dewi', 'Es Teh Gula Aren', 'misleading', 4, '2026-11-05T15:00:00+07:00', 'hidden'],
  ['Resep diet 3 hari turun 10 kg', 'Fajar Nugraha', 'Salad Ayam', 'misleading', 6, '2026-11-04T11:45:00+07:00', 'hidden'],
  ['Gratis resep, klik link bio', 'akun_resep_promo', 'Ayam Geprek', 'spam', 8, '2026-11-04T07:50:00+07:00', 'hidden'],
  ['Kontes makan ekstrem', 'Rudi Hartanto', 'Mie Level 10', 'inappropriate', 11, '2026-11-03T20:25:00+07:00', 'removed'],
  ['Beli bumbu murah di sini', 'toko_bumbu_77', 'Bumbu Dasar Kuning', 'spam', 14, '2026-11-02T12:00:00+07:00', 'removed'],
]

/** A post that was kept leaves the queue, so it is dropped from the list. */
const postDb: ReportedPost[] = SEED.map(([title, authorName, recipeTitle, reason, reportCount, lastReportedAt, status], index) => ({
  id: `post-${index + 1}`,
  title,
  authorName,
  recipeTitle,
  reason,
  reportCount,
  lastReportedAt,
  status,
}))

const normalize = (text: string) => text.trim().toLowerCase()

const visiblePosts = () => (isMockMode('empty') ? [] : postDb)

const matchesPost = (post: ReportedPost, params: ModerationListParams) => {
  const needle = normalize(params.search)
  const day = toIsoDay(new Date(post.lastReportedAt))
  return (
    (needle === '' || [post.title, post.authorName, post.recipeTitle].some((text) => normalize(text).includes(needle))) &&
    (params.status === 'all' || post.status === params.status) &&
    (params.reason === 'all' || post.reason === params.reason) &&
    (params.from === undefined || day >= params.from) &&
    (params.to === undefined || day <= params.to)
  )
}

const byLatestReport = (a: ReportedPost, b: ReportedPost) => b.lastReportedAt.localeCompare(a.lastReportedAt)

export const fetchModerationList = async (params: ModerationListParams): Promise<ModerationListResult> => {
  failLoadIfMocked('fetchModerationList')
  await wait()
  const filtered = visiblePosts()
    .filter((post) => matchesPost(post, params))
    .sort(byLatestReport)
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize), total: filtered.length }
}

export const fetchModerationCounts = async (): Promise<ModerationCounts> => {
  await wait()
  const posts = visiblePosts()
  const countOf = (status: PostStatus) => posts.filter((post) => post.status === status).length
  return {
    all: posts.length,
    byStatus: { reported: countOf('reported'), hidden: countOf('hidden'), removed: countOf('removed') },
  }
}

export const moderatePost = async (id: string, action: ModerationAction): Promise<ReportedPost> => {
  await wait()
  const index = postDb.findIndex((post) => post.id === id)
  const post = postDb[index]
  if (!post) throw new Error('This post was already handled.')
  if (normalize(post.title).includes(FAILING_TITLE_MARKER)) throw new Error('The server rejected this request.')
  if (action === 'keep') postDb.splice(index, 1)
  else post.status = action === 'hide' ? 'hidden' : 'removed'
  return { ...post }
}
