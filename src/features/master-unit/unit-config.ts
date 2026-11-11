import type { ComboboxOption } from '@/components/shared/combobox'
import type { FilterOption } from '@/components/shared/single-select-filter'
import type {
  BasisFilter,
  ConversionScope,
  RulesFilter,
  UnitStatus,
  UnitType,
} from './unit-types'
import { CONVERSION_SCOPES, UNIT_STATUSES, UNIT_TYPES } from './unit-types'

export const TYPE_LABEL: Record<UnitType, string> = {
  berat: 'Berat',
  volume: 'Volume',
  hitungan: 'Hitungan',
}

export const TYPE_FILTER_OPTIONS: FilterOption<UnitType>[] = UNIT_TYPES.map((value) => ({ value, label: TYPE_LABEL[value] }))
export const TYPE_OPTIONS: ComboboxOption<UnitType>[] = TYPE_FILTER_OPTIONS

export const STATUS_LABEL: Record<UnitStatus, string> = { active: 'Active', inactive: 'Inactive' }

export const STATUS_FILTER_OPTIONS: FilterOption<UnitStatus | 'all'>[] = [
  { value: 'all', label: 'All' },
  ...UNIT_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] })),
]
export const STATUS_OPTIONS: ComboboxOption<UnitStatus>[] = UNIT_STATUSES.map((value) => ({ value, label: STATUS_LABEL[value] }))

export const BASIS_LABEL: Record<Exclude<BasisFilter, 'all'>, string> = { base: 'Base', derived: 'Derived' }
export const BASIS_FILTER_OPTIONS: FilterOption<BasisFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'base', label: BASIS_LABEL.base },
  { value: 'derived', label: BASIS_LABEL.derived },
]

export const RULES_LABEL: Record<Exclude<RulesFilter, 'all'>, string> = { 'has-rules': 'Has rules', 'no-rules': 'No rules' }
export const RULES_FILTER_OPTIONS: FilterOption<RulesFilter>[] = [
  { value: 'all', label: 'All' },
  { value: 'has-rules', label: RULES_LABEL['has-rules'] },
  { value: 'no-rules', label: RULES_LABEL['no-rules'] },
]

export const SCOPE_LABEL: Record<ConversionScope, string> = { global: 'Global', 'per-bahan': 'Per bahan' }
export const SCOPE_FILTER_OPTIONS: FilterOption<ConversionScope | 'all'>[] = [
  { value: 'all', label: 'All' },
  ...CONVERSION_SCOPES.map((value) => ({ value, label: SCOPE_LABEL[value] })),
]
export const SCOPE_OPTIONS: ComboboxOption<ConversionScope>[] = CONVERSION_SCOPES.map((value) => ({
  value,
  label: SCOPE_LABEL[value],
}))
