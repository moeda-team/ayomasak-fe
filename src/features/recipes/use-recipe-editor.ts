import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBahanList } from '@/features/master-bahan/mock-bahan-api'
import { fetchEquipmentList } from '@/features/master-equipment/mock-equipment-api'
import { notify } from '@/lib/notify'
import { fetchRecipeRecord, publishRecipe, RecipeNotFoundError, saveRecipeDraft, type SaveDraftRequest } from './mock-recipe-editor-api'
import { RECIPE_KEY } from './use-recipes'

/** A missing recipe will not appear on a retry, so only real failures are retried. */
export const useRecipeRecord = (id: string | undefined) =>
  useQuery({
    queryKey: [...RECIPE_KEY, 'record', id],
    queryFn: () => fetchRecipeRecord(id as string),
    enabled: id !== undefined,
    retry: (failureCount, error) => !(error instanceof RecipeNotFoundError) && failureCount < 1,
    staleTime: Infinity,
  })

export const isRecipeNotFound = (error: Error | null) => error instanceof RecipeNotFoundError

/** Everything the ingredient picker can offer, inactive ones included so existing rows can still name them. */
export const useBahanOptions = () =>
  useQuery({
    queryKey: ['recipe-editor', 'bahan-options'],
    queryFn: async () =>
      (await fetchBahanList({ search: '', categories: [], form: 'all', status: 'all', pantry: 'all', page: 1, pageSize: 200 })).items,
    staleTime: Infinity,
  })

export const useEquipmentOptions = () =>
  useQuery({
    queryKey: ['recipe-editor', 'equipment-options'],
    queryFn: async () =>
      (await fetchEquipmentList({ search: '', categories: [], status: 'all', alternative: 'any', page: 1, pageSize: 200 })).items,
    staleTime: Infinity,
  })

export const useSaveRecipeDraft = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SaveDraftRequest) => saveRecipeDraft(request),
    onSuccess: (record) => {
      queryClient.setQueryData([...RECIPE_KEY, 'record', record.id], record)
      void queryClient.invalidateQueries({ queryKey: [...RECIPE_KEY, 'list'] })
      void queryClient.invalidateQueries({ queryKey: [...RECIPE_KEY, 'category-counts'] })
      notify.success({
        title: 'Draft saved',
        description: `${record.values.name} was saved as a draft. It stays hidden from users until published.`,
      })
    },
    onError: (_error, request) =>
      notify.error({
        title: 'Couldn’t save draft',
        description: `${request.values.name} was not saved. Your changes are still on this page. Try again.`,
      }),
  })
}

export const usePublishRecipe = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: SaveDraftRequest) => publishRecipe(request),
    onSuccess: (record) => {
      queryClient.setQueryData([...RECIPE_KEY, 'record', record.id], record)
      void queryClient.invalidateQueries({ queryKey: [...RECIPE_KEY, 'list'] })
      notify.success({ title: 'Recipe published', description: `${record.values.name} is now visible to users.` })
    },
    onError: (_error, request) =>
      notify.error({
        title: 'Couldn’t publish recipe',
        description: `${request.values.name} is still a draft. Nothing changed for users. Try again.`,
      }),
  })
}
