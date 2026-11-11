import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { archiveRecipe, duplicateRecipe, fetchRecipeCategoryCounts, fetchRecipeList, restoreRecipe } from './mock-recipe-api'
import type { Recipe, RecipeListParams } from './recipe-types'

export const RECIPE_KEY = ['recipes'] as const

export const useRecipeList = (params: RecipeListParams) =>
  useQuery({
    queryKey: [...RECIPE_KEY, 'list', params],
    queryFn: () => fetchRecipeList(params),
    placeholderData: keepPreviousData,
  })

/** Totals shown beside the Category options. */
export const useRecipeCategoryCounts = () =>
  useQuery({ queryKey: [...RECIPE_KEY, 'category-counts'], queryFn: fetchRecipeCategoryCounts })

const useInvalidateRecipes = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: RECIPE_KEY })
}

export const useDuplicateRecipe = () => {
  const invalidateRecipes = useInvalidateRecipes()
  return useMutation({
    mutationFn: (recipe: Recipe) => duplicateRecipe(recipe.id),
    onSuccess: (copy, recipe) => {
      notify.success({ title: 'Draft created', description: `${recipe.name} was duplicated as “${copy.name}”.` })
      return invalidateRecipes()
    },
    onError: (_error, recipe) =>
      notify.error({ title: 'Couldn’t duplicate recipe', description: `${recipe.name} was not duplicated. Try again.` }),
  })
}

export const useArchiveRecipe = () => {
  const invalidateRecipes = useInvalidateRecipes()
  return useMutation({
    mutationFn: (recipe: Recipe) => archiveRecipe(recipe.id),
    onSuccess: (recipe) => {
      notify.success({ title: 'Recipe archived', description: `${recipe.name} is hidden from users. You can restore it later.` })
      return invalidateRecipes()
    },
    onError: (_error, recipe) =>
      notify.error({
        title: 'Couldn’t archive recipe',
        description: `${recipe.name} is still ${recipe.status === 'published' ? 'published' : 'in the list'}. Nothing changed. Try again.`,
      }),
  })
}

export const useRestoreRecipe = () => {
  const invalidateRecipes = useInvalidateRecipes()
  return useMutation({
    mutationFn: (recipe: Recipe) => restoreRecipe(recipe.id),
    onSuccess: (recipe) => {
      notify.success({ title: 'Recipe restored', description: `${recipe.name} is back in the list as a draft.` })
      return invalidateRecipes()
    },
    onError: (_error, recipe) =>
      notify.error({ title: 'Couldn’t restore recipe', description: `${recipe.name} is still archived. Nothing changed. Try again.` }),
  })
}
