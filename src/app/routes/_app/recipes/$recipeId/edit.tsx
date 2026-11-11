import { createFileRoute } from '@tanstack/react-router'
import { RecipeEditorPage } from '@/features/recipes/recipe-editor-page'

const EditRecipeRoute = () => {
  const { recipeId } = Route.useParams()
  return <RecipeEditorPage recipeId={recipeId} />
}

export const Route = createFileRoute('/_app/recipes/$recipeId/edit')({
  component: EditRecipeRoute,
})
