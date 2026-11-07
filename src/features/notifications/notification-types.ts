export type NotificationKind = 'publish-blocked' | 'stale-nutrition' | 'review-queue' | 'reported-content' | 'broken-media'

export type AppNotification = {
  id: string
  kind: NotificationKind
  title: string
  description: string
  /** ISO timestamp. */
  createdAt: string
  unread: boolean
}
