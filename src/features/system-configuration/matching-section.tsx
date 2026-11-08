import { SettingsCard } from '@/components/shared/settings-card'
import type { MatchingConfig } from './config-types'
import type { MatchingErrors } from './matching-validation'
import { PercentField } from './percent-field'

type MatchingSectionProps = {
  value: MatchingConfig
  errors: MatchingErrors
  onChange: (value: MatchingConfig) => void
}

const FIELD_GRID = 'grid grid-cols-1 gap-4 md:grid-cols-3'

export const MatchingSection = ({ value, errors, onChange }: MatchingSectionProps) => {
  const setField = (field: keyof MatchingConfig) => (next: number | null) => onChange({ ...value, [field]: next })
  const hasWeightsError = Boolean(errors.weights)

  return (
    <>
      <SettingsCard
        title="Match thresholds"
        description="Minimum match score (%) for a recipe to be labeled as an exact, near, or weak match."
      >
        <div className={FIELD_GRID}>
          <PercentField
            id="match-exact"
            label="Exact match"
            hint="Minimum score for an exact match"
            value={value.exact}
            onChange={setField('exact')}
            error={errors.exact}
          />
          <PercentField
            id="match-near"
            label="Near match"
            hint="Minimum score for a near match"
            value={value.near}
            onChange={setField('near')}
            error={errors.near}
          />
          <PercentField
            id="match-weak"
            label="Weak match"
            hint="Minimum score for a weak match"
            value={value.weak}
            onChange={setField('weak')}
            error={errors.weak}
          />
        </div>
      </SettingsCard>

      <SettingsCard
        title="Scoring weights"
        description="Relative weight of each factor in the recommendation score. Weights must total 100%."
      >
        <div className={FIELD_GRID}>
          <PercentField
            id="weight-ingredient"
            label="Ingredient match"
            hint="Required and optional ingredients"
            value={value.ingredientWeight}
            onChange={setField('ingredientWeight')}
            error={errors.ingredientWeight}
            isInvalid={hasWeightsError}
          />
          <PercentField
            id="weight-equipment"
            label="Equipment match"
            hint="Required and alternative equipment"
            value={value.equipmentWeight}
            onChange={setField('equipmentWeight')}
            error={errors.equipmentWeight}
            isInvalid={hasWeightsError}
          />
          <PercentField
            id="weight-nutrition"
            label="Nutrition fit"
            hint="Calories and protein deviation"
            value={value.nutritionWeight}
            onChange={setField('nutritionWeight')}
            error={errors.nutritionWeight}
            isInvalid={hasWeightsError}
          />
        </div>
        {errors.weights && (
          <p role="alert" className="text-caption text-text-danger">
            {errors.weights}
          </p>
        )}
      </SettingsCard>
    </>
  )
}
