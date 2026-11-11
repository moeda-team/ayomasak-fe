import { useMutation, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { createDraftRevision, unpublishRecipe } from './mock-recipe-editor-api'
import type { RecipeEditorRecord } from './recipe-editor-types'
import { RECIPE_KEY } from './use-recipes'

/** After a lifecycle step the list and the opened record both show the new status. */
const useRefreshRecipe = () => {
  const queryClient = useQueryClient()
  return (record: RecipeEditorRecord) => {
    queryClient.setQueryData([...RECIPE_KEY, 'record', record.id], record)
    void queryClient.invalidateQueries({ queryKey: [...RECIPE_KEY, 'list'] })
    void queryClient.invalidateQueries({ queryKey: [...RECIPE_KEY, 'category-counts'] })
  }
}

type RecipeNamed = { id: string; name: string; version: number }

export const useCreateDraftRevision = () => {
  const refresh = useRefreshRecipe()
  return useMutation({
    mutationFn: (recipe: RecipeNamed) => createDraftRevision(recipe.id),
    onSuccess: (record, recipe) => {
      refresh(record)
      notify.success({
        title: 'Draft revision created',
        description: `${recipe.name} v${recipe.version + 1} is a draft. Users still see v${recipe.version}.`,
      })
    },
    onError: (_error, recipe) =>
      notify.error({ title: 'Couldn’t create draft revision', description: `${recipe.name} was not changed. Try again.` }),
  })
}

export const useUnpublishRecipe = () => {
  const refresh = useRefreshRecipe()
  return useMutation({
    mutationFn: (recipe: RecipeNamed) => unpublishRecipe(recipe.id),
    onSuccess: (record, recipe) => {
      refresh(record)
      notify.success({ title: 'Recipe unpublished', description: `${recipe.name} is hidden from users and back to draft.` })
    },
    onError: (_error, recipe) =>
      notify.error({
        title: 'Couldn’t unpublish recipe',
        description: `${recipe.name} is still published. Nothing changed. Try again.`,
      }),
  })
}
