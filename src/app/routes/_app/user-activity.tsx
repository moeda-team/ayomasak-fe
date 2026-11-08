import { createFileRoute } from '@tanstack/react-router'
import { UserActivityPage } from '@/features/user-activity/user-activity-page'

export const Route = createFileRoute('/_app/user-activity')({
  component: UserActivityPage,
})
