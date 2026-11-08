import { SettingsCard } from '@/components/shared/settings-card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

type ToggleListCardProps<TId extends string> = {
  title: string
  description: string
  /** Order of the rows. */
  ids: readonly TId[]
  copy: Record<TId, { label: string; description: string }>
  values: Record<TId, boolean>
  onChange: (id: TId, isOn: boolean) => void
}

/** A card of on/off settings, each with a label and a line of explanation. */
export const ToggleListCard = <TId extends string>({
  title,
  description,
  ids,
  copy,
  values,
  onChange,
}: ToggleListCardProps<TId>) => (
  <SettingsCard title={title} description={description}>
    <ul className="flex flex-col gap-3">
      {ids.map((id) => (
        <li
          key={id}
          className="flex items-center justify-between gap-4 rounded-lg border border-border-default px-4 py-3"
        >
          <div className="flex min-w-0 flex-col gap-0.5">
            <Label htmlFor={`toggle-${id}`} className="text-body-sm-strong">
              {copy[id].label}
            </Label>
            <p id={`toggle-${id}-description`} className="text-caption text-text-secondary">
              {copy[id].description}
            </p>
          </div>
          <Switch
            id={`toggle-${id}`}
            checked={values[id]}
            onCheckedChange={(isOn) => onChange(id, isOn)}
            aria-describedby={`toggle-${id}-description`}
          />
        </li>
      ))}
    </ul>
  </SettingsCard>
)
