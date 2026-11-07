import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const RecipesPage = () => (
  <PagePlaceholder title="Master Menu/Recipe" description="Manage recipes, drafts, and publishing." />
)

export const Route = createFileRoute('/_app/recipes')({
  component: RecipesPage,
})
