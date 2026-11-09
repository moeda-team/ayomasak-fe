import { createFileRoute } from '@tanstack/react-router'
import { MasterBahanPage } from '@/features/master-bahan/master-bahan-page'

export const Route = createFileRoute('/_app/master-bahan')({
  component: MasterBahanPage,
})
