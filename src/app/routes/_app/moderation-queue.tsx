import { createFileRoute } from '@tanstack/react-router'
import { ModerationQueuePage } from '@/features/moderation-queue/moderation-queue-page'

export const Route = createFileRoute('/_app/moderation-queue')({
  component: ModerationQueuePage,
})
