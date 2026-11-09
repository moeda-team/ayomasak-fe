import type { ComboboxOption } from '@/components/shared/combobox'
import type { FilterOption } from '@/components/shared/single-select-filter'

/** The lifecycle every master record shares (bahan, equipment): new ones wait in the Review Queue until verified. */
export const MASTER_STATUSES = ['active', 'pending-review', 'inactive'] as const
export type MasterStatus = (typeof MASTER_STATUSES)[number]

export const MASTER_STATUS_LABEL: Record<MasterStatus, string> = {
  active: 'Active',
  'pending-review': 'Pending review',
  inactive: 'Inactive',
}

export const MASTER_STATUS_FILTER_OPTIONS: FilterOption<MasterStatus | 'all'>[] = [
  { value: 'all', label: 'All' },
  ...MASTER_STATUSES.map((value) => ({ value, label: MASTER_STATUS_LABEL[value] })),
]

export const MASTER_STATUS_OPTIONS: ComboboxOption<MasterStatus>[] = MASTER_STATUSES.map((value) => ({
  value,
  label: MASTER_STATUS_LABEL[value],
}))
