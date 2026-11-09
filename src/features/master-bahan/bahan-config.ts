import type { ComboboxOption } from '@/components/shared/combobox'
import type { FilterOption } from '@/components/shared/single-select-filter'
import {
  MASTER_STATUS_FILTER_OPTIONS,
  MASTER_STATUS_LABEL,
  MASTER_STATUS_OPTIONS,
} from '@/features/master-data/master-status'
import type { BahanCategory, BahanForm, PantryFilter } from './bahan-types'
import { BAHAN_FORMS } from './bahan-types'

export const CATEGORY_LABEL: Record<BahanCategory, string> = {
  bumbu: 'Bumbu',
  protein: 'Protein',
  sayur: 'Sayur',
  buah: 'Buah',
  karbohidrat: 'Karbohidrat',
  saus: 'Saus',
}

export const FORM_LABEL: Record<BahanForm, string> = {
  segar: 'Segar',
  biji: 'Biji',
  cair: 'Cair',
  padat: 'Padat',
  pasta: 'Pasta',
  bubuk: 'Bubuk',
}

export const STATUS_LABEL = MASTER_STATUS_LABEL

export const PANTRY_LABEL: Record<PantryFilter, string> = {
  all: 'All',
  pantry: 'Pantry',
  'non-pantry': 'Non-pantry',
}

export const FORM_FILTER_OPTIONS: FilterOption<BahanForm | 'all'>[] = [
  { value: 'all', label: 'All' },
  ...BAHAN_FORMS.map((value) => ({ value, label: FORM_LABEL[value] })),
]

export const STATUS_FILTER_OPTIONS = MASTER_STATUS_FILTER_OPTIONS

export const PANTRY_FILTER_OPTIONS: FilterOption<PantryFilter>[] = [
  { value: 'all', label: PANTRY_LABEL.all },
  { value: 'pantry', label: PANTRY_LABEL.pantry },
  { value: 'non-pantry', label: PANTRY_LABEL['non-pantry'] },
]

export const FORM_OPTIONS: ComboboxOption<BahanForm>[] = BAHAN_FORMS.map((value) => ({ value, label: FORM_LABEL[value] }))

export const STATUS_OPTIONS = MASTER_STATUS_OPTIONS

/** MOCK: replace with the units from Master Unit once that module exists. */
export const UNIT_OPTIONS: ComboboxOption<string>[] = [
  'gram',
  'kg',
  'ml',
  'liter',
  'siung',
  'butir',
  'buah',
  'lembar',
  'batang',
  'ikat',
  'sdm',
  'sdt',
].map((unit) => ({ value: unit, label: unit }))
