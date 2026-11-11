import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { approveItem, fetchMergeTargets, fetchReviewCounts, fetchReviewList, mergeItem, rejectItem } from './mock-review-api'
import type { ReviewItem, ReviewKind, ReviewListParams } from './review-types'

export const REVIEW_KEY = ['review-queue'] as const

export const useReviewList = (params: ReviewListParams) =>
  useQuery({
    queryKey: [...REVIEW_KEY, 'list', params],
    queryFn: () => fetchReviewList(params),
    placeholderData: keepPreviousData,
  })

/** Totals shown on the tabs and beside the Source options. */
export const useReviewCounts = () => useQuery({ queryKey: [...REVIEW_KEY, 'counts'], queryFn: fetchReviewCounts })

export const useMergeTargets = (kind: ReviewKind | undefined) =>
  useQuery({
    queryKey: [...REVIEW_KEY, 'merge-targets', kind],
    queryFn: () => fetchMergeTargets(kind ?? 'unmapped'),
    enabled: kind !== undefined,
  })

const useInvalidateReview = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: REVIEW_KEY })
}

const ACTION_FAILED = {
  title: 'Couldn’t complete action',
  description: 'Something went wrong. Check your connection and try again.',
}

export const useApproveItem = () => {
  const invalidateReview = useInvalidateReview()
  return useMutation({
    mutationFn: (item: ReviewItem) => approveItem(item.id),
    onSuccess: (item) => {
      notify.success({ title: 'Item approved', description: `${item.name} is now verified and can be used in recipes and matching.` })
      return invalidateReview()
    },
    onError: () => notify.error(ACTION_FAILED),
  })
}

export const useRejectItem = () => {
  const invalidateReview = useInvalidateReview()
  return useMutation({
    mutationFn: ({ item, reason }: { item: ReviewItem; reason: string }) => rejectItem(item.id, reason),
    onSuccess: (item) => {
      notify.success({ title: 'Item rejected', description: `${item.name} was rejected and the reason was saved in the audit log.` })
      return invalidateReview()
    },
    onError: () => notify.error(ACTION_FAILED),
  })
}

export const useMergeItem = () => {
  const invalidateReview = useInvalidateReview()
  return useMutation({
    mutationFn: ({ item, targetId }: { item: ReviewItem; targetId: string }) => mergeItem(item.id, targetId),
    onSuccess: ({ item, target }) => {
      notify.success({ title: 'Item merged', description: `${item.name} is now recognised as ${target.name}.` })
      return invalidateReview()
    },
    onError: () => notify.error(ACTION_FAILED),
  })
}
