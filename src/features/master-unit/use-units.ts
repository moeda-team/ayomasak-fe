import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { notify } from '@/lib/notify'
import {
  createUnit,
  deactivateUnit,
  fetchBaseUnits,
  fetchUnitCounts,
  fetchUnitList,
  fetchUnitRefs,
  findDuplicateUnitSymbol,
  updateUnit,
} from './mock-unit-api'
import type { Unit, UnitFormValues, UnitListParams } from './unit-types'

/** Units and conversions share this root: a conversion changes a unit's rule count, so one invalidation refreshes both tabs. */
export const UNIT_KEY = ['units'] as const

const DUPLICATE_CHECK_DEBOUNCE_MS = 400

export const useUnitList = (params: UnitListParams) =>
  useQuery({
    queryKey: [...UNIT_KEY, 'list', params],
    queryFn: () => fetchUnitList(params),
    placeholderData: keepPreviousData,
  })

/** Totals shown on the tabs. */
export const useUnitCounts = () => useQuery({ queryKey: [...UNIT_KEY, 'counts'], queryFn: fetchUnitCounts })

/** Every unit, for pickers and filters. */
export const useUnitRefs = () => useQuery({ queryKey: [...UNIT_KEY, 'refs'], queryFn: fetchUnitRefs })

export const useBaseUnits = (ignoreId?: string) =>
  useQuery({ queryKey: [...UNIT_KEY, 'base-units', ignoreId ?? null], queryFn: () => fetchBaseUnits(ignoreId) })

/** Looks for another unit using `symbol` once typing pauses. `ignoreId` is the unit being edited. */
export const useDuplicateUnitSymbol = (symbol: string, ignoreId?: string) => {
  const typedSymbol = useDebouncedValue(symbol.trim(), DUPLICATE_CHECK_DEBOUNCE_MS)
  return useQuery({
    queryKey: [...UNIT_KEY, 'duplicate-symbol', typedSymbol, ignoreId ?? null],
    queryFn: () => findDuplicateUnitSymbol(typedSymbol, ignoreId),
    enabled: typedSymbol.length > 0,
  })
}

export const useInvalidateUnits = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: UNIT_KEY })
}

const SAVE_FAILED = {
  title: 'Couldn’t save unit',
  description: 'Something went wrong while saving. Check your connection and try again.',
}

export const useCreateUnit = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (values: UnitFormValues) => createUnit(values),
    onSuccess: (unit) => {
      notify.success({ title: 'Unit saved', description: `${unit.name} was added to Master Unit.` })
      return invalidateUnits()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useUpdateUnit = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UnitFormValues }) => updateUnit(id, values),
    onSuccess: (unit) => {
      notify.success({ title: 'Unit saved', description: `${unit.name} was updated.` })
      return invalidateUnits()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useDeactivateUnit = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (unit: Unit) => deactivateUnit(unit.id),
    onSuccess: (_result, unit) => {
      notify.success({ title: 'Unit deactivated', description: `${unit.name} can no longer be selected for new recipes.` })
      return invalidateUnits()
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t deactivate unit',
        description: 'Something went wrong. Check your connection and try again.',
      }),
  })
}
