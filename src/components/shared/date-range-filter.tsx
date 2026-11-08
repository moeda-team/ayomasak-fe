import { CalendarBlankIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FilterTrigger } from './filter-trigger'

type DateRangeFilterProps = {
  label: string
  /** Shown while no range is applied. */
  emptyLabel: string
  value: DateRange | undefined
  onApply: (value: DateRange | undefined) => void
}

const DAY_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

const toSummary = (range: DateRange | undefined, emptyLabel: string) => {
  if (!range?.from) return emptyLabel
  if (!range.to) return DAY_FORMAT.format(range.from)
  return `${DAY_FORMAT.format(range.from)} – ${DAY_FORMAT.format(range.to)}`
}

/** Popover with a range calendar. Future dates are not selectable. */
export const DateRangeFilter = ({ label, emptyLabel, value, onApply }: DateRangeFilterProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)

  const handleOpenChange = (open: boolean) => {
    if (open) setDraft(value)
    setIsOpen(open)
  }

  const commit = (next: DateRange | undefined) => {
    onApply(next)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FilterTrigger
          label={label}
          summary={toSummary(value, emptyLabel)}
          isActive={Boolean(value?.from)}
          icon={<CalendarBlankIcon aria-hidden />}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto gap-0 p-0 shadow-overlay">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={1}
          disabled={{ after: new Date() }}
          defaultMonth={draft?.from}
        />
        <div className="flex items-center justify-between border-t border-border-default p-3">
          <Button type="button" variant="link" size="sm" onClick={() => commit(undefined)}>
            Clear
          </Button>
          <Button type="button" size="sm" disabled={!draft?.from} onClick={() => commit(draft)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
