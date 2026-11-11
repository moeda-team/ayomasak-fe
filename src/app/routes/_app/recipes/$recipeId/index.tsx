import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const RecipeDetailPage = () => <PagePlaceholder title="Recipe details" description="The recipe detail page is built in a later step." />

export const Route = createFileRoute('/_app/recipes/$recipeId/')({
  component: RecipeDetailPage,
})
