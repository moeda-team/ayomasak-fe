import { CaretDownIcon, CheckIcon, type Icon } from '@phosphor-icons/react'
import { useState, type FocusEventHandler } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export type ComboboxOption<TValue extends string> = {
  value: TValue
  label: string
}

type ComboboxProps<TValue extends string> = {
  id?: string
  /** Empty string while nothing is picked. */
  value: TValue | ''
  options: ComboboxOption<TValue>[]
  onChange: (value: TValue) => void
  onBlur?: FocusEventHandler<HTMLButtonElement>
  placeholder: string
  searchPlaceholder?: string
  emptyMessage?: string
  /** Leading icon inside the trigger. */
  icon?: Icon
  isInvalid?: boolean
  'aria-describedby'?: string
  /** Names the trigger when there is no visible label, e.g. a field inside a table-like row. */
  'aria-label'?: string
  disabled?: boolean
  className?: string
}

/**
 * The app's select input: a trigger that opens a searchable list. Use it for every "pick one option" field.
 * Short in-page filters that only switch a view use the lighter filter menus instead.
 */
export const Combobox = <TValue extends string>({
  id,
  value,
  options,
  onChange,
  onBlur,
  placeholder,
  searchPlaceholder = 'Search…',
  emptyMessage = 'No results found',
  icon: IconComponent,
  isInvalid = false,
  'aria-describedby': describedBy,
  'aria-label': ariaLabel,
  disabled = false,
  className,
}: ComboboxProps<TValue>) => {
  const [isOpen, setIsOpen] = useState(false)
  const selected = options.find((option) => option.value === value)

  const handleSelect = (next: TValue) => {
    onChange(next)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-invalid={isInvalid || undefined}
          aria-describedby={describedBy}
          aria-label={ariaLabel}
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-input bg-transparent px-3 text-left text-body-sm shadow-xs outline-none transition-[color,box-shadow] dark:bg-input/30',
            'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          {IconComponent && <IconComponent aria-hidden className="size-4 shrink-0 text-text-primary" />}
          <span className={cn('min-w-0 flex-1 truncate', !selected && 'text-muted-foreground')}>
            {selected?.label ?? placeholder}
          </span>
          <CaretDownIcon aria-hidden className="size-4 shrink-0 text-text-secondary" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--radix-popover-trigger-width) gap-0 p-0 shadow-overlay">
        <Command defaultValue={selected?.label}>
          <CommandInput placeholder={searchPlaceholder} className="text-body-sm focus-visible:shadow-none" />
          {/* Dialogs block wheel events outside themselves; this keeps the list scrollable when opened from one. */}
          <CommandList className="max-h-60 overscroll-contain" onWheel={(event) => event.stopPropagation()}>
            <CommandEmpty className="py-6 text-center text-body-sm text-text-secondary">{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => handleSelect(option.value)}
                  className="text-body-sm"
                >
                  <span className="flex-1">{option.label}</span>
                  {option.value === value && <CheckIcon aria-hidden className="size-4 text-text-brand" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
