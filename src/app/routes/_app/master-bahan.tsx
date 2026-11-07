import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const MasterBahanPage = () => (
  <PagePlaceholder title="Master Bahan" description="Manage canonical ingredients, aliases, and status used across recipes and ingredient matching." />
)

export const Route = createFileRoute('/_app/master-bahan')({
  component: MasterBahanPage,
})
