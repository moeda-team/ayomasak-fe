import type { AppNotification } from './notification-types'

/** MOCK: replace with real requests. Read state lives in memory, so it resets on reload. */
const MOCK_LATENCY_MS = 400
const MINUTE_MS = 60_000

const wait = () => new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

const buildSeed = (): AppNotification[] => {
  const now = Date.now()
  const minutesAgo = (minutes: number) => new Date(now - minutes * MINUTE_MS).toISOString()
  return [
    {
      id: 'n-1',
      kind: 'publish-blocked',
      title: 'Publish blocked: Ayam Bakar',
      description: 'Missing required ingredient quantity. Fix it before publishing.',
      createdAt: minutesAgo(10),
      unread: true,
    },
    {
      id: 'n-2',
      kind: 'stale-nutrition',
      title: 'Stale nutrition: Nasi Goreng',
      description: 'Ingredient quantity changed. Nutrition needs recalculation.',
      createdAt: minutesAgo(120),
      unread: true,
    },
    {
      id: 'n-3',
      kind: 'review-queue',
      title: 'New items in Review Queue',
      description: '3 unmapped inputs are waiting for review.',
      createdAt: minutesAgo(180),
      unread: true,
    },
    {
      id: 'n-4',
      kind: 'reported-content',
      title: 'Cooking result reported',
      description: 'Soto Ayam photo was reported by 2 users.',
      createdAt: minutesAgo(300),
      unread: false,
    },
    {
      id: 'n-5',
      kind: 'broken-media',
      title: 'Broken media: Rendang',
      description: 'Photo link returns an error.',
      createdAt: minutesAgo(480),
      unread: false,
    },
  ]
}

let store = buildSeed()

export const fetchNotifications = async (): Promise<AppNotification[]> => {
  await wait()
  return store
}

export const markAllNotificationsRead = async (): Promise<AppNotification[]> => {
  await wait()
  store = store.map((notification) => ({ ...notification, unread: false }))
  return store
}
