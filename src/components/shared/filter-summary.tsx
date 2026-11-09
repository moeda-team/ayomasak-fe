import { RemovableChip } from './removable-chip'

export type FilterChip = {
  /** Unique within the list. */
  key: string
  label: string
  onRemove: () => void
}

type FilterSummaryProps = {
  /** "N results" text; leave out while the count is still loading. */
  resultCount?: number
  chips: FilterChip[]
}

/** Result count plus one removable chip per applied filter, shown under the filter bar. */
export const FilterSummary = ({ resultCount, chips }: FilterSummaryProps) => (
  <div className="flex flex-wrap items-center gap-2" aria-live="polite">
    {resultCount !== undefined && (
      <span className="text-body-sm text-text-secondary">
        {resultCount.toLocaleString('en-US')} {resultCount === 1 ? 'result' : 'results'}
      </span>
    )}
    {chips.map((chip) => (
      <RemovableChip key={chip.key} label={chip.label} removeLabel={`Remove filter ${chip.label}`} onRemove={chip.onRemove} />
    ))}
  </div>
)
