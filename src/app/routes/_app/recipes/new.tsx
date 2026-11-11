import { createFileRoute } from '@tanstack/react-router'
import { RecipeEditorPage } from '@/features/recipes/recipe-editor-page'

export const Route = createFileRoute('/_app/recipes/new')({
  component: () => <RecipeEditorPage />,
})
