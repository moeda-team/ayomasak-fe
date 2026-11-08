import { FormField } from '@/components/shared/form-field'
import { Input } from '@/components/ui/input'

type PercentFieldProps = {
  id: string
  label: string
  hint: string
  /** `null` while the field is empty. */
  value: number | null
  onChange: (value: number | null) => void
  error?: string
  /** Marks the field invalid without its own message, e.g. when a group shares one. */
  isInvalid?: boolean
}

const MAX_DIGITS = 3

/** A whole-number percentage input. Anything but digits is dropped as the user types. */
export const PercentField = ({ id, label, hint, value, onChange, error, isInvalid = false }: PercentFieldProps) => {
  const describedBy = error ? `${id}-error` : `${id}-hint`

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, MAX_DIGITS)
    onChange(digits === '' ? null : Number(digits))
  }

  return (
    <FormField htmlFor={id} label={label} isRequired error={error} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          inputMode="numeric"
          autoComplete="off"
          value={value === null ? '' : String(value)}
          onChange={(event) => handleChange(event.target.value)}
          aria-invalid={Boolean(error) || isInvalid || undefined}
          aria-describedby={describedBy}
          className="pr-9 text-body-sm md:text-body-sm"
        />
        <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-body-sm text-text-secondary">
          %
        </span>
      </div>
    </FormField>
  )
}
