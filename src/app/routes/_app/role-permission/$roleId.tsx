import { createFileRoute } from '@tanstack/react-router'
import { RoleDetailPage } from '@/features/role-permission/role-detail-page'

const RoleDetailRoute = () => {
  const { roleId } = Route.useParams()
  return <RoleDetailPage roleId={roleId} />
}

export const Route = createFileRoute('/_app/role-permission/$roleId')({
  component: RoleDetailRoute,
})
