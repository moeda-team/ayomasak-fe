import { SettingsCard } from '@/components/shared/settings-card'
import { ToggleRow } from '@/components/shared/toggle-row'

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
        <li key={id}>
          <ToggleRow
            id={`toggle-${id}`}
            label={copy[id].label}
            description={copy[id].description}
            checked={values[id]}
            onCheckedChange={(isOn) => onChange(id, isOn)}
          />
        </li>
      ))}
    </ul>
  </SettingsCard>
)
