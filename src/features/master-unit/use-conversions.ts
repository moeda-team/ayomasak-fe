import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import {
  createConversion,
  deleteConversion,
  fetchBahanNames,
  fetchConversionList,
  findDuplicateConversion,
  updateConversion,
} from './mock-unit-api'
import type { Conversion, ConversionFormValues, ConversionListParams } from './unit-types'
import { UNIT_KEY, useInvalidateUnits } from './use-units'

const CONVERSION_KEY = [...UNIT_KEY, 'conversions'] as const

export const useConversionList = (params: ConversionListParams) =>
  useQuery({
    queryKey: [...CONVERSION_KEY, 'list', params],
    queryFn: () => fetchConversionList(params),
    placeholderData: keepPreviousData,
  })

export const useBahanNames = () => useQuery({ queryKey: [...CONVERSION_KEY, 'bahan-names'], queryFn: fetchBahanNames })

type DuplicateCheck = {
  fromId: string
  toId: string
  scope: string
  bahanName: string
  /** The conversion being edited. */
  ignoreId?: string
}

/** Looks for another conversion covering the same pair once both units and the scope are chosen. */
export const useDuplicateConversion = ({ fromId, toId, scope, bahanName, ignoreId }: DuplicateCheck) => {
  const perBahan = scope === 'per-bahan'
  const isReady = fromId !== '' && toId !== '' && fromId !== toId && (scope === 'global' || (perBahan && bahanName !== ''))
  return useQuery({
    queryKey: [...CONVERSION_KEY, 'duplicate', fromId, toId, scope, bahanName, ignoreId ?? null],
    queryFn: () =>
      findDuplicateConversion(
        { fromId, toId, scope: perBahan ? 'per-bahan' : 'global', bahanName: perBahan ? bahanName : null },
        ignoreId,
      ),
    enabled: isReady,
  })
}

const SAVE_FAILED = {
  title: 'Couldn’t save conversion',
  description: 'Something went wrong while saving. Check your connection and try again.',
}

const describe = (conversion: Conversion) => `${conversion.from.symbol} → ${conversion.to.symbol}`

export const useCreateConversion = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (values: ConversionFormValues) => createConversion(values),
    onSuccess: (conversion) => {
      notify.success({ title: 'Conversion saved', description: `${describe(conversion)} was added to Master Unit.` })
      return invalidateUnits()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useUpdateConversion = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ConversionFormValues }) => updateConversion(id, values),
    onSuccess: (conversion) => {
      notify.success({ title: 'Conversion saved', description: `${describe(conversion)} was updated.` })
      return invalidateUnits()
    },
    onError: () => notify.error(SAVE_FAILED),
  })
}

export const useDeleteConversion = () => {
  const invalidateUnits = useInvalidateUnits()
  return useMutation({
    mutationFn: (conversion: Conversion) => deleteConversion(conversion.id),
    onSuccess: (_result, conversion) => {
      notify.success({ title: 'Conversion deleted', description: `${describe(conversion)} was removed.` })
      return invalidateUnits()
    },
    onError: () =>
      notify.error({
        title: 'Couldn’t delete conversion',
        description: 'Something went wrong. Check your connection and try again.',
      }),
  })
}
