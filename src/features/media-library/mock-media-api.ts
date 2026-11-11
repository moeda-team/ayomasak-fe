import { failLoadIfMocked, isMockMode } from '@/lib/mock-load-failure'
import { NO_RECIPE, type MediaItem, type MediaListParams, type MediaListResult, type MediaStatus, type MediaType } from './media-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * A file with "bad" in its name, a type other than JPG, PNG or MP4, or a size over the limit fails to upload, so
 * the error toast can be seen without a broken backend. An uploaded file stays "Processing" for a moment.
 */
const MOCK_LATENCY_MS = 600
export const PROCESSING_MS = 2500
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

type Seed = [name: string, type: MediaType, detail: string, recipe: string | null, status: MediaStatus]

const SEED: Seed[] = [
  ['nasi-goreng-final.jpg', 'photo', '2.4 MB', 'Nasi Goreng Kampung', 'in-use'],
  ['bakso-kuah.jpg', 'photo', '2.7 MB', 'Bakso Sapi', 'in-use'],
  ['IMG_2051.jpg', 'photo', '5.2 MB', null, 'unused'],
  ['youtu.be/nasi-goreng', 'video', 'External link', 'Nasi Goreng Kampung', 'in-use'],
  ['mie-goreng-tutorial.mp4', 'video', '32 MB', 'Mie Goreng Spesial', 'processing'],
  ['sambal-terasi.jpg', 'photo', '1.4 MB', 'Sambal Terasi', 'in-use'],
  ['gado-gado-plating.jpg', 'photo', '2.2 MB', 'Gado-Gado Jakarta', 'in-use'],
  ['IMG_2045.jpg', 'photo', '4.8 MB', null, 'unused'],
  ['wok-api-intro.mp4', 'video', 'Link unavailable', 'Tumis Kangkung Terasi', 'broken'],
  ['rendang-step3.jpg', 'photo', '3.1 MB', 'Rendang Daging Sapi', 'in-use'],
  ['soto-ayam-cover.jpg', 'photo', '1.9 MB', 'Soto Ayam Lamongan', 'in-use'],
  ['tumis-bumbu.mp4', 'video', '18 MB', 'Nasi Goreng Kampung', 'in-use'],
  ['ayam-bakar-taliwang.jpg', 'photo', '2.9 MB', 'Ayam Bakar Taliwang', 'in-use'],
  ['IMG_2102.jpg', 'photo', '3.6 MB', null, 'unused'],
  ['sayur-asem-closeup.jpg', 'photo', '2.0 MB', 'Sayur Asem', 'in-use'],
  ['nasi-kuning-tumpeng.jpg', 'photo', '3.3 MB', 'Nasi Kuning', 'in-use'],
  ['cumi-saus-padang.mp4', 'video', '41 MB', 'Cumi Saus Padang', 'in-use'],
  ['bubur-ayam-topping.jpg', 'photo', '1.7 MB', 'Bubur Ayam', 'in-use'],
  ['youtu.be/rendang-empuk', 'video', 'Link unavailable', 'Rendang Daging Sapi', 'broken'],
  ['IMG_2188.jpg', 'photo', '4.1 MB', null, 'unused'],
  ['sup-buntut-hangat.jpg', 'photo', '2.5 MB', 'Sup Buntut', 'in-use'],
  ['ikan-bakar-jimbaran.jpg', 'photo', '3.0 MB', 'Ikan Bakar Jimbaran', 'in-use'],
  ['pepes-ikan-mas.jpg', 'photo', '2.1 MB', 'Pepes Ikan Mas', 'in-use'],
  ['vimeo.com/sambal-teknik', 'video', 'External link', 'Sambal Terasi', 'in-use'],
]

const mediaDb: MediaItem[] = SEED.map(([name, type, detail, recipe, status], index) => ({
  id: `media-${index + 1}`,
  name,
  type,
  detail,
  recipe,
  status,
}))

const normalize = (text: string) => text.trim().toLowerCase()

const matches = (item: MediaItem, params: MediaListParams) => {
  const needle = normalize(params.search)
  return (
    (needle === '' || [item.name, item.recipe ?? ''].some((text) => normalize(text).includes(needle))) &&
    (params.type === 'all' || item.type === params.type) &&
    (params.status === 'all' || item.status === params.status) &&
    (params.recipe === 'all' || (params.recipe === NO_RECIPE ? item.recipe === null : item.recipe === params.recipe))
  )
}

/** `?mock=empty` shows the library as if nothing had been uploaded yet. */
const visibleMedia = () => (isMockMode('empty') ? [] : mediaDb)

export const fetchMediaList = async (params: MediaListParams): Promise<MediaListResult> => {
  failLoadIfMocked('fetchMediaList')
  await wait()
  const filtered = visibleMedia().filter((item) => matches(item, params))
  const start = (params.page - 1) * params.pageSize
  return { items: filtered.slice(start, start + params.pageSize).map((item) => ({ ...item })), total: filtered.length }
}

/** Recipes that have media, for the Recipe filter. */
export const fetchMediaRecipes = async (): Promise<string[]> => {
  await wait()
  const names = visibleMedia().flatMap((item) => item.recipe ?? [])
  return [...new Set(names)].sort((a, b) => a.localeCompare(b))
}

export type UploadFile = { name: string; type: string; size: number }

const isAcceptable = (file: UploadFile) =>
  !file.name.toLowerCase().includes('bad') &&
  ((['image/jpeg', 'image/png'].includes(file.type) && file.size <= MAX_PHOTO_BYTES) ||
    (file.type === 'video/mp4' && file.size <= MAX_VIDEO_BYTES))

const sizeLabel = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  const megabytes = bytes / (1024 * 1024)
  return megabytes < 10 ? `${megabytes.toFixed(1)} MB` : `${Math.round(megabytes)} MB`
}

/** New files are processed for a moment, then wait as "Unused" until a recipe uses them. */
export const uploadMedia = async (files: UploadFile[]): Promise<MediaItem[]> => {
  await wait()
  if (files.length === 0 || !files.every(isAcceptable)) throw new Error('The server rejected this upload.')
  const added: MediaItem[] = files.map((file) => ({
    id: `media-${crypto.randomUUID()}`,
    name: file.name,
    type: file.type === 'video/mp4' ? 'video' : 'photo',
    detail: sizeLabel(file.size),
    recipe: null,
    status: 'processing',
  }))
  mediaDb.unshift(...added)
  setTimeout(() => {
    for (const item of added) item.status = 'unused'
  }, PROCESSING_MS)
  return added.map((item) => ({ ...item }))
}
