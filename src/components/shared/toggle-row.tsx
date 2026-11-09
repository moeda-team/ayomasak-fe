import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

type ToggleRowProps = {
  /** Id of the switch; the label and description are wired to it. */
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (isOn: boolean) => void
  className?: string
}

/** One on/off setting in a bordered row: label and a line of explanation, with the switch at the end. */
export const ToggleRow = ({ id, label, description, checked, onCheckedChange, className }: ToggleRowProps) => (
  <div className={cn('flex items-center justify-between gap-4 rounded-lg border border-border-default px-4 py-3', className)}>
    <div className="flex min-w-0 flex-col gap-0.5">
      <Label htmlFor={id} className="text-body-sm-strong">
        {label}
      </Label>
      <p id={`${id}-description`} className="text-caption text-text-secondary">
        {description}
      </p>
    </div>
    <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} aria-describedby={`${id}-description`} />
  </div>
)
