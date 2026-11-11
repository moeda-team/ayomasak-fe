import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { fetchModerationCounts, fetchModerationList, moderatePost } from './mock-moderation-api'
import type { ModerationAction, ModerationListParams, ReportedPost } from './moderation-types'

export const MODERATION_KEY = ['moderation-queue'] as const

export const useModerationList = (params: ModerationListParams) =>
  useQuery({
    queryKey: [...MODERATION_KEY, 'list', params],
    queryFn: () => fetchModerationList(params),
    placeholderData: keepPreviousData,
  })

/** Totals shown on the tabs. */
export const useModerationCounts = () => useQuery({ queryKey: [...MODERATION_KEY, 'counts'], queryFn: fetchModerationCounts })

const SUCCESS_COPY: Record<ModerationAction, (post: ReportedPost) => { title: string; description: string }> = {
  keep: (post) => ({ title: 'Post kept', description: `Reports on “${post.title}” were dismissed. The post stays visible.` }),
  hide: (post) => ({ title: 'Post hidden', description: `“${post.title}” is now hidden from other users.` }),
  remove: (post) => ({ title: 'Post removed', description: `“${post.title}” was removed.` }),
}

export const useModeratePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ post, action }: { post: ReportedPost; action: ModerationAction }) => moderatePost(post.id, action),
    onSuccess: (post, { action }) => {
      notify.success(SUCCESS_COPY[action](post))
      return queryClient.invalidateQueries({ queryKey: MODERATION_KEY })
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t complete action',
        description: 'Something went wrong. Check your connection and try again.',
      }),
  })
}
