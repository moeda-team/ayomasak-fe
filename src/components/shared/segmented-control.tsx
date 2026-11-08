import { cn } from '@/lib/utils'

export type SegmentedOption<TValue extends string> = {
  value: TValue
  label: string
}

type SegmentedControlProps<TValue extends string> = {
  /** Names the group for assistive tech. */
  label: string
  value: TValue
  options: SegmentedOption<TValue>[]
  onChange: (value: TValue) => void
  disabled?: boolean
  className?: string
}

/** A short single-choice switch, e.g. "From scratch / Duplicate role" or a permission level. */
export const SegmentedControl = <TValue extends string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  className,
}: SegmentedControlProps<TValue>) => (
  <div role="radiogroup" aria-label={label} className={cn('inline-flex rounded-lg bg-surface-subtle p-1', className)}>
    {options.map((option) => {
      const isSelected = option.value === value
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={isSelected}
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-body-sm whitespace-nowrap outline-none transition-[color,background-color,box-shadow]',
            'focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-60',
            isSelected
              ? 'bg-surface-brand-subtle text-text-brand ring-1 ring-border-focus/30'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {option.label}
        </button>
      )
    })}
  </div>
)
