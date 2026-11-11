import { createFileRoute } from '@tanstack/react-router'
import { MasterUnitPage } from '@/features/master-unit/master-unit-page'

export const Route = createFileRoute('/_app/master-unit')({
  component: MasterUnitPage,
})
