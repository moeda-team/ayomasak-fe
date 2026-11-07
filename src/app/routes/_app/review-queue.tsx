import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const ReviewQueuePage = () => (
  <PagePlaceholder title="Review Queue" description="Review pending master data and moderation items." />
)

export const Route = createFileRoute('/_app/review-queue')({
  component: ReviewQueuePage,
})
