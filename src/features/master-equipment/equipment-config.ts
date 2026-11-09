import type { ComboboxOption } from '@/components/shared/combobox'
import type { FilterOption } from '@/components/shared/single-select-filter'
import { EQUIPMENT_CATEGORIES, type AlternativeFilter, type EquipmentCategory } from './equipment-types'

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  masak: 'Alat masak',
  elektronik: 'Alat elektronik',
  potong: 'Alat potong',
  ukur: 'Alat ukur',
  sajikan: 'Alat sajikan',
}

export const CATEGORY_OPTIONS: ComboboxOption<EquipmentCategory>[] = EQUIPMENT_CATEGORIES.map((value) => ({
  value,
  label: CATEGORY_LABEL[value],
}))

export const ALTERNATIVE_LABEL: Record<AlternativeFilter, string> = {
  any: 'Any',
  has: 'Has alternative',
  none: 'No alternative',
}

export const ALTERNATIVE_FILTER_OPTIONS: FilterOption<AlternativeFilter>[] = (
  ['any', 'has', 'none'] as const
).map((value) => ({ value, label: ALTERNATIVE_LABEL[value] }))
