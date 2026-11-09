import { XCircleIcon, type Icon } from '@phosphor-icons/react'

type RemovableChipProps = {
  label: string
  /** Accessible name of the remove button. */
  removeLabel: string
  onRemove: () => void
  icon?: Icon
}

/** A pill with a button to remove it: applied filters, typed aliases. */
export const RemovableChip = ({ label, removeLabel, onRemove, icon: IconComponent = XCircleIcon }: RemovableChipProps) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-default py-1 pr-1.5 pl-3 text-caption">
    {label}
    <button
      type="button"
      aria-label={removeLabel}
      onClick={onRemove}
      className="rounded-full text-text-secondary outline-none hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
    >
      <IconComponent className="size-4" aria-hidden />
    </button>
  </span>
)
