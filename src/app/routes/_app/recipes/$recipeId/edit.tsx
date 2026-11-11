import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const EditRecipePage = () => <PagePlaceholder title="Edit Recipe" description="The recipe editor is built in the next step." />

export const Route = createFileRoute('/_app/recipes/$recipeId/edit')({
  component: EditRecipePage,
})
