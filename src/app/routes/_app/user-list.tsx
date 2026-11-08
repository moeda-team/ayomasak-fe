import { createFileRoute } from '@tanstack/react-router'
import { UserListPage } from '@/features/user-management/user-list-page'

export const Route = createFileRoute('/_app/user-list')({
  component: UserListPage,
})
