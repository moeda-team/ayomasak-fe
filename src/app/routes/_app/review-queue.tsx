import { createFileRoute } from '@tanstack/react-router'
import { ReviewQueuePage } from '@/features/review-queue/review-queue-page'

export const Route = createFileRoute('/_app/review-queue')({
  component: ReviewQueuePage,
})
