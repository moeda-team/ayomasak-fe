import { useFormContext, useWatch } from 'react-hook-form'
import { FormField } from '@/components/shared/form-field'
import type { Tone } from '@/components/shared/tone'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Input } from '@/components/ui/input'
import { EditorSection } from './editor-section'
import { NUTRITION_FIELDS, type RecipeEditorValues } from './recipe-editor-types'
import type { NutritionState } from './recipe-readiness'

const STATE_BADGE: Record<NutritionState, { label: string; tone: Tone } | null> = {
  missing: { label: 'Missing', tone: 'neutral' },
  invalid: { label: 'Invalid', tone: 'danger' },
  estimated: { label: 'Estimated', tone: 'warning' },
  complete: { label: 'Complete', tone: 'success' },
}

const DESCRIPTION: Record<NutritionState, string> = {
  missing: 'Required to publish. Enter values for one serving.',
  invalid: 'Used for nutrition matching. Leave blank if unknown.',
  estimated: 'Used for nutrition matching. Leave blank if unknown.',
  complete: 'Used for nutrition matching. Leave blank if unknown.',
}

const FOOTNOTE: Record<NutritionState, string> = {
  missing: 'Without nutrition, this recipe stays hidden from nutrition matching.',
  invalid: 'Fix the highlighted fields before saving.',
  estimated: 'Values are estimated from ingredients. Replace with measured values when available.',
  complete: 'Values are measured per serving.',
}

type NutritionTabProps = {
  state: NutritionState
}

export const NutritionTab = ({ state }: NutritionTabProps) => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<RecipeEditorValues>()
  const values = useWatch({ control, name: 'nutrition' })
  const badge = STATE_BADGE[state]

  return (
    <EditorSection
      title="Nutrition per serving"
      description={DESCRIPTION[state]}
      action={badge && <ToneBadge tone={badge.tone}>{badge.label}</ToneBadge>}
    >
      <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {NUTRITION_FIELDS.map(({ key, label, placeholder }) => {
          const error = errors.nutrition?.[key]?.message
          const id = `nutrition-${key}`
          return (
            <FormField key={key} htmlFor={id} label={label} isRequired={state === 'missing' && values[key].trim() === ''} error={error}>
              <Input
                id={id}
                inputMode="decimal"
                placeholder={placeholder}
                autoComplete="off"
                className="text-body-sm md:text-body-sm"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
                {...register(`nutrition.${key}`)}
              />
            </FormField>
          )
        })}
      </div>
      <p className="text-caption text-text-secondary">{FOOTNOTE[state]}</p>
    </EditorSection>
  )
}
