import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNotifications, markAllNotificationsRead } from './mock-notifications-api'

const NOTIFICATIONS_KEY = ['notifications'] as const

export const useNotifications = () => {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: NOTIFICATIONS_KEY, queryFn: fetchNotifications })

  const markAllRead = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: (updated) => queryClient.setQueryData(NOTIFICATIONS_KEY, updated),
  })

  const unreadCount = query.data?.filter((notification) => notification.unread).length ?? 0

  return { ...query, unreadCount, markAllRead: () => markAllRead.mutate() }
}
