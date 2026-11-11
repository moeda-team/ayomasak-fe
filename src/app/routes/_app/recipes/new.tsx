import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const NewRecipePage = () => <PagePlaceholder title="New Recipe" description="The recipe editor is built in the next step." />

export const Route = createFileRoute('/_app/recipes/new')({
  component: NewRecipePage,
})
