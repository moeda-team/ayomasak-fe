import { createFileRoute } from '@tanstack/react-router'
import { MasterEquipmentPage } from '@/features/master-equipment/master-equipment-page'

export const Route = createFileRoute('/_app/master-equipment')({
  component: MasterEquipmentPage,
})
