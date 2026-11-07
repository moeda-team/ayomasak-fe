import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const DataQualityPage = () => (
  <PagePlaceholder title="Data Quality" description="Monitor data quality issues across recipes, ingredients, and nutrition." />
)

export const Route = createFileRoute('/_app/data-quality')({
  component: DataQualityPage,
})
