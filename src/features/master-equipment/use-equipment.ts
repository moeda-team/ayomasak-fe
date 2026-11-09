import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { notify } from '@/lib/notify'
import {
  createEquipment,
  deactivateEquipment,
  fetchEquipmentCategoryCounts,
  fetchEquipmentList,
  fetchEquipmentRefs,
  findDuplicateEquipment,
  updateEquipment,
} from './mock-equipment-api'
import type { Equipment, EquipmentFormValues, EquipmentListParams } from './equipment-types'

const EQUIPMENT_KEY = ['equipment'] as const

const DUPLICATE_CHECK_DEBOUNCE_MS = 400
const MIN_DUPLICATE_CHECK_LENGTH = 2

export const useEquipmentList = (params: EquipmentListParams) =>
  useQuery({
    queryKey: [...EQUIPMENT_KEY, 'list', params],
    queryFn: () => fetchEquipmentList(params),
    placeholderData: keepPreviousData,
  })

export const useEquipmentCategoryCounts = () =>
  useQuery({ queryKey: [...EQUIPMENT_KEY, 'category-counts'], queryFn: fetchEquipmentCategoryCounts })

/** Everything that can be chosen as an alternative to the equipment `ignoreId`. */
export const useEquipmentRefs = (ignoreId?: string) =>
  useQuery({ queryKey: [...EQUIPMENT_KEY, 'refs', ignoreId ?? null], queryFn: () => fetchEquipmentRefs(ignoreId) })

/** Looks for another equipment using `name` once typing pauses. `ignoreId` is the equipment being edited. */
export const useDuplicateEquipment = (name: string, ignoreId?: string) => {
  const typedName = useDebouncedValue(name.trim(), DUPLICATE_CHECK_DEBOUNCE_MS)
  return useQuery({
    queryKey: [...EQUIPMENT_KEY, 'duplicate', typedName, ignoreId ?? null],
    queryFn: () => findDuplicateEquipment(typedName, ignoreId),
    enabled: typedName.length >= MIN_DUPLICATE_CHECK_LENGTH,
  })
}

const useInvalidateEquipment = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: EQUIPMENT_KEY })
}

const SAVE_FAILED = {
  title: 'Couldn’t save equipment',
  description: 'Something went wrong while saving. Check your connection and try again.',
}

export const useCreateEquipment = () => {
  const invalidateEquipment = useInvalidateEquipment()
  return useMutation({
    mutationFn: (values: EquipmentFormValues) => createEquipment(values),
    onSuccess: (equipment) => {
      notify.success({
        title: 'Equipment saved',
        description: `${equipment.name} was added to Master Equipment and sent to the Review Queue.`,
      })
      return invalidateEquipment()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useUpdateEquipment = () => {
  const invalidateEquipment = useInvalidateEquipment()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: EquipmentFormValues }) => updateEquipment(id, values),
    onSuccess: (equipment) => {
      notify.success({ title: 'Equipment saved', description: `${equipment.name} was updated.` })
      return invalidateEquipment()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useDeactivateEquipment = () => {
  const invalidateEquipment = useInvalidateEquipment()
  return useMutation({
    mutationFn: (equipment: Equipment) => deactivateEquipment(equipment.id),
    onSuccess: (_result, equipment) => {
      notify.success({
        title: 'Equipment deactivated',
        description: `${equipment.name} can no longer be selected for new recipes.`,
      })
      return invalidateEquipment()
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t deactivate equipment',
        description: 'Something went wrong. Check your connection and try again.',
      }),
  })
}
