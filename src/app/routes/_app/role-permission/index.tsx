import { createFileRoute } from '@tanstack/react-router'
import { RoleListPage } from '@/features/role-permission/role-list-page'

export const Route = createFileRoute('/_app/role-permission/')({
  component: RoleListPage,
})
