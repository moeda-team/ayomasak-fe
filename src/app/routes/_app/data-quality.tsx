import { createFileRoute } from '@tanstack/react-router'
import { DataQualityPage } from '@/features/data-quality/data-quality-page'

export const Route = createFileRoute('/_app/data-quality')({
  component: DataQualityPage,
})
