import { CaretDownIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type RangeOption<TValue extends string> = {
  value: TValue
  label: string
}

type RangeSelectProps<TValue extends string> = {
  label: string
  value: TValue
  options: RangeOption<TValue>[]
  onChange: (value: TValue) => void
}

export const RangeSelect = <TValue extends string>({ label, value, options, onChange }: RangeSelectProps<TValue>) => {
  const selected = options.find((option) => option.value === value)

  const handleValueChange = (nextValue: string) => {
    const match = options.find((option) => option.value === nextValue)
    if (match) onChange(match.value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label={label} className="text-body-sm text-text-secondary">
          {selected?.label}
          <CaretDownIcon aria-hidden />
        </Button>
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
