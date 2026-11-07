import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const MasterEquipmentPage = () => (
  <PagePlaceholder title="Master Equipment" description="Manage canonical cooking equipment used across recipes and tool matching." />
)

export const Route = createFileRoute('/_app/master-equipment')({
  component: MasterEquipmentPage,
})
