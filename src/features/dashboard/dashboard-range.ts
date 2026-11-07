import { useState } from 'react'
import type { RangeOption } from '@/components/shared/range-select'
import type { RangeMonths } from './dashboard-types'

const RANGE_BY_VALUE: Record<string, RangeMonths> = { '3': 3, '6': 6, '12': 12 }

export const RANGE_OPTIONS: RangeOption<string>[] = [
  { value: '3', label: 'Last 3 months' },
  { value: '6', label: 'Last 6 months' },
  { value: '12', label: 'Last 12 months' },
]

const DEFAULT_RANGE: RangeMonths = 6

/** Range state for one widget. `select` receives the dropdown's string value and ignores unknown ones. */
export const useRange = () => {
  const [months, setMonths] = useState<RangeMonths>(DEFAULT_RANGE)

  const select = (value: string) => {
    const next = RANGE_BY_VALUE[value]
    if (next) setMonths(next)
  }

  return { months, value: String(months), select }
}
