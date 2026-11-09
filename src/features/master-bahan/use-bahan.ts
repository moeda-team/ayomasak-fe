import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { notify } from '@/lib/notify'
import { createBahan, deactivateBahan, fetchBahanCategoryCounts, fetchBahanList, findDuplicateBahan, updateBahan } from './mock-bahan-api'
import type { Bahan, BahanFormValues, BahanListParams } from './bahan-types'

const BAHAN_KEY = ['bahan'] as const

const DUPLICATE_CHECK_DEBOUNCE_MS = 400
const MIN_DUPLICATE_CHECK_LENGTH = 2

export const useBahanList = (params: BahanListParams) =>
  useQuery({
    queryKey: [...BAHAN_KEY, 'list', params],
    queryFn: () => fetchBahanList(params),
    placeholderData: keepPreviousData,
  })

export const useBahanCategoryCounts = () =>
  useQuery({ queryKey: [...BAHAN_KEY, 'category-counts'], queryFn: fetchBahanCategoryCounts })

/** Looks for another bahan using `name` once typing pauses. `ignoreId` is the bahan being edited. */
export const useDuplicateBahan = (name: string, ignoreId?: string) => {
  const typedName = useDebouncedValue(name.trim(), DUPLICATE_CHECK_DEBOUNCE_MS)
  return useQuery({
    queryKey: [...BAHAN_KEY, 'duplicate', typedName, ignoreId ?? null],
    queryFn: () => findDuplicateBahan(typedName, ignoreId),
    enabled: typedName.length >= MIN_DUPLICATE_CHECK_LENGTH,
  })
}

const useInvalidateBahan = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: BAHAN_KEY })
}

const SAVE_FAILED = {
  title: 'Couldn’t save Bahan',
  description: 'Something went wrong while saving. Check your connection and try again.',
}

export const useCreateBahan = () => {
  const invalidateBahan = useInvalidateBahan()
  return useMutation({
    mutationFn: (values: BahanFormValues) => createBahan(values),
    onSuccess: (bahan) => {
      notify.success({ title: 'Bahan saved', description: `${bahan.name} was added to Master Bahan and sent to the Review Queue.` })
      return invalidateBahan()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useUpdateBahan = () => {
  const invalidateBahan = useInvalidateBahan()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: BahanFormValues }) => updateBahan(id, values),
    onSuccess: (bahan) => {
      notify.success({ title: 'Bahan saved', description: `${bahan.name} was updated.` })
      return invalidateBahan()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useDeactivateBahan = () => {
  const invalidateBahan = useInvalidateBahan()
  return useMutation({
    mutationFn: (bahan: Bahan) => deactivateBahan(bahan.id),
    onSuccess: (_result, bahan) => {
      notify.success({ title: 'Bahan deactivated', description: `${bahan.name} can no longer be selected for new recipes.` })
      return invalidateBahan()
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t deactivate Bahan',
        description: 'Something went wrong. Check your connection and try again.',
      }),
  })
}
