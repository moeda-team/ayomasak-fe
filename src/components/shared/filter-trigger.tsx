import { CaretDownIcon } from '@phosphor-icons/react'
import type { ComponentProps, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type FilterTriggerProps = Omit<ComponentProps<typeof Button>, 'children'> & {
  /** "Role", "Status"… */
  label: string
  /** Current value shown after the label ("All", "2 selected"). */
  summary: string
  icon?: ReactNode
  /** Highlights the trigger when the filter narrows the list. */
  isActive?: boolean
}

/** The "Label: Value ▾" pill shared by every list filter. */
export const FilterTrigger = ({ label, summary, icon, isActive = false, className, ...buttonProps }: FilterTriggerProps) => (
  <Button
    type="button"
    variant="outline"
    className={cn(
      'h-10 gap-1.5 px-3 text-body-sm font-normal text-text-secondary',
      isActive && 'border-border-focus bg-surface-brand-subtle',
      className,
    )}
    {...buttonProps}
  >
    {icon}
    <span>{label}:</span>
    <span className="text-text-primary">{summary}</span>
    <CaretDownIcon aria-hidden className="ml-1" />
  </Button>
)
