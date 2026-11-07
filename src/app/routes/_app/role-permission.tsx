import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const RolePermissionPage = () => (
  <PagePlaceholder title="Role and Permission" description="Manage roles and what each role can do." />
)

export const Route = createFileRoute('/_app/role-permission')({
  component: RolePermissionPage,
})
