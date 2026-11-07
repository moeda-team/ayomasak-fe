import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const UserActivityPage = () => (
  <PagePlaceholder title="User Activity" description="Track what users did in the admin console." />
)

export const Route = createFileRoute('/_app/user-activity')({
  component: UserActivityPage,
})
