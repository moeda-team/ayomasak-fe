import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const ModerationQueuePage = () => (
  <PagePlaceholder title="Moderation Queue" description="Review reported content and moderation items." />
)

export const Route = createFileRoute('/_app/moderation-queue')({
  component: ModerationQueuePage,
})
