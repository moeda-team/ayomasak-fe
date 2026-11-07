import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const UserListPage = () => (
  <PagePlaceholder title="User List" description="Manage admin console users." />
)

export const Route = createFileRoute('/_app/user-list')({
  component: UserListPage,
})
