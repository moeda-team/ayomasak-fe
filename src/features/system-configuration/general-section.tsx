import { Combobox } from '@/components/shared/combobox'
import { FormField } from '@/components/shared/form-field'
import { SettingsCard } from '@/components/shared/settings-card'
import {
  DATE_FORMAT_EXAMPLE,
  DATE_FORMAT_OPTIONS,
  LANGUAGE_OPTIONS,
  PANTRY_OPTIONS,
  RESULTS_PER_PAGE_OPTIONS,
  TIME_ZONE_OPTIONS,
} from './config-options'
import type { GeneralConfig } from './config-types'

type GeneralSectionProps = {
  value: GeneralConfig
  onChange: (value: GeneralConfig) => void
}

export const GeneralSection = ({ value, onChange }: GeneralSectionProps) => (
  <>
    <SettingsCard title="Localization" description="Language, time zone, and date format used across the console and the user app.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField htmlFor="general-language" label="Default language" isRequired hint="Primary language for the MVP">
          <Combobox
            id="general-language"
            value={value.language}
            options={LANGUAGE_OPTIONS}
            onChange={(language) => onChange({ ...value, language })}
            placeholder="Select a language"
            searchPlaceholder="Search language…"
          />
        </FormField>
        <FormField htmlFor="general-time-zone" label="Time zone" isRequired hint="Used for timestamps and scheduled jobs">
          <Combobox
            id="general-time-zone"
            value={value.timeZone}
            options={TIME_ZONE_OPTIONS}
            onChange={(timeZone) => onChange({ ...value, timeZone })}
            placeholder="Select a time zone"
            searchPlaceholder="Search time zone…"
          />
        </FormField>
        <FormField
          htmlFor="general-date-format"
          label="Date format"
          isRequired
          hint={`Example: ${DATE_FORMAT_EXAMPLE[value.dateFormat]}`}
        >
          <Combobox
            id="general-date-format"
            value={value.dateFormat}
            options={DATE_FORMAT_OPTIONS}
            onChange={(dateFormat) => onChange({ ...value, dateFormat })}
            placeholder="Select a format"
            searchPlaceholder="Search format…"
          />
        </FormField>
      </div>
    </SettingsCard>

    <SettingsCard title="Recommendation defaults" description="Default behavior for ingredient and equipment recommendations.">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField
          htmlFor="general-pantry"
          label="Pantry items"
          isRequired
          hint="Salt, oil, water, and other pantry-flagged ingredients"
        >
          <Combobox
            id="general-pantry"
            value={value.pantryItems}
            options={PANTRY_OPTIONS}
            onChange={(pantryItems) => onChange({ ...value, pantryItems })}
            placeholder="Select a behavior"
            searchPlaceholder="Search behavior…"
          />
        </FormField>
        <FormField
          htmlFor="general-results"
          label="Results per page"
          isRequired
          hint="Applies to search and recommendation results"
        >
          <Combobox
            id="general-results"
            value={value.resultsPerPage}
            options={RESULTS_PER_PAGE_OPTIONS}
            onChange={(resultsPerPage) => onChange({ ...value, resultsPerPage })}
            placeholder="Select a number"
            searchPlaceholder="Search…"
          />
        </FormField>
      </div>
    </SettingsCard>
  </>
)
