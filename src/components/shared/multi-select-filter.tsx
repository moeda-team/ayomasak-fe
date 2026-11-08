import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FilterTrigger } from './filter-trigger'

export type MultiSelectOption<TValue extends string> = {
  value: TValue
  label: string
  /** Optional trailing number, such as how many records match. */
  count?: number
}

type MultiSelectFilterProps<TValue extends string> = {
  label: string
  options: MultiSelectOption<TValue>[]
  value: TValue[]
  searchPlaceholder: string
  onApply: (value: TValue[]) => void
}

const toSummary = <TValue extends string>(value: TValue[], options: MultiSelectOption<TValue>[]) => {
  if (value.length === 0) return 'All'
  if (value.length === 1) return options.find((option) => option.value === value[0])?.label ?? '1 selected'
  return `${value.length} selected`
}

/** Popover with a searchable checklist. Changes are drafted until Apply; Clear applies "all" at once. */
export const MultiSelectFilter = <TValue extends string>({
  label,
  options,
  value,
  searchPlaceholder,
  onApply,
}: MultiSelectFilterProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false)
  const [draft, setDraft] = useState<TValue[]>(value)
  const [query, setQuery] = useState('')

  const visibleOptions = options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))

  const handleOpenChange = (open: boolean) => {
    if (open) {
      setDraft(value)
      setQuery('')
    }
    setIsOpen(open)
  }

  const toggle = (optionValue: TValue, isChecked: boolean) =>
    setDraft((current) => (isChecked ? [...current, optionValue] : current.filter((item) => item !== optionValue)))

  const commit = (next: TValue[]) => {
    onApply(next)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <FilterTrigger label={label} summary={toSummary(value, options)} isActive={value.length > 0} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-0 p-0 shadow-overlay">
        <div className="p-2">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-9 text-body-sm"
          />
        </div>
        <ul className="flex max-h-60 flex-col overflow-y-auto overscroll-contain px-1 pb-1">
          {visibleOptions.length === 0 && (
            <li className="px-3 py-4 text-center text-body-sm text-text-secondary">No matches</li>
          )}
          {visibleOptions.map((option) => {
            const id = `${label}-${option.value}`
            return (
              <li key={option.value}>
                <label
                  htmlFor={id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-body-sm hover:bg-surface-subtle"
                >
                  <Checkbox
                    id={id}
                    checked={draft.includes(option.value)}
                    onCheckedChange={(checked) => toggle(option.value, checked === true)}
                  />
                  <span className="flex-1">{option.label}</span>
                  {option.count !== undefined && (
                    <span className="text-caption text-text-secondary tabular-nums">{option.count}</span>
                  )}
                </label>
              </li>
            )
          })}
        </ul>
        <div className="flex items-center justify-between border-t border-border-default p-3">
          <Button type="button" variant="link" size="sm" className="px-0 text-text-brand" onClick={() => commit([])}>
            Clear
          </Button>
          <Button type="button" size="sm" onClick={() => commit(draft)}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
