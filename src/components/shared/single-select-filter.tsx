import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { FilterTrigger } from './filter-trigger'

export type FilterOption<TValue extends string> = {
  value: TValue
  label: string
}

type SingleSelectFilterProps<TValue extends string> = {
  label: string
  value: TValue
  options: FilterOption<TValue>[]
  /** The value that means "no filter"; the trigger is only highlighted for others. */
  allValue: TValue
  onChange: (value: TValue) => void
}

export const SingleSelectFilter = <TValue extends string>({
  label,
  value,
  options,
  allValue,
  onChange,
}: SingleSelectFilterProps<TValue>) => {
  const selected = options.find((option) => option.value === value)

  const handleValueChange = (next: string) => {
    const match = options.find((option) => option.value === next)
    if (match) onChange(match.value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <FilterTrigger label={label} summary={selected?.label ?? ''} isActive={value !== allValue} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="shadow-overlay">
        <DropdownMenuRadioGroup value={value} onValueChange={handleValueChange}>
          {options.map((option) => (
            <DropdownMenuRadioItem key={option.value} value={option.value} className="text-body-sm">
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
