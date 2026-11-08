import type { Icon } from '@phosphor-icons/react'
import type { ComponentProps, ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type FormFieldProps = {
  /** Id of the control inside, so the label and error are wired to it. */
  htmlFor: string
  label: string
  isRequired?: boolean
  error?: string
  /** Help text under the control; the error replaces it. */
  hint?: string
  children: ReactNode
  className?: string
}

export const FormField = ({ htmlFor, label, isRequired = false, error, hint, children, className }: FormFieldProps) => (
  <div className={cn('flex flex-col gap-2', className)}>
    <Label htmlFor={htmlFor} className="text-body-sm">
      {label}
      {isRequired && (
        <span aria-hidden className="text-status-danger">
          *
        </span>
      )}
    </Label>
    {children}
    {error && (
      <p id={`${htmlFor}-error`} role="alert" className="text-caption text-text-danger">
        {error}
      </p>
    )}
    {!error && hint && (
      <p id={`${htmlFor}-hint`} className="text-caption text-text-secondary">
        {hint}
      </p>
    )}
  </div>
)

type IconInputProps = ComponentProps<typeof Input> & {
  icon: Icon
}

/** Text input with a leading icon. Pass `aria-invalid` for the error style. */
export const IconInput = ({ icon: IconComponent, className, ...inputProps }: IconInputProps) => (
  <div className="relative">
    <IconComponent
      aria-hidden
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-primary"
    />
    <Input className={cn('pl-9 text-body-sm md:text-body-sm', className)} {...inputProps} />
  </div>
)
