import { XCircleIcon } from '@phosphor-icons/react'

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
      <span
        key={chip.key}
        className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-default py-1 pr-1.5 pl-3 text-caption"
      >
        {chip.label}
        <button
          type="button"
          aria-label={`Remove filter ${chip.label}`}
          onClick={chip.onRemove}
          className="rounded-full text-text-secondary outline-none hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <XCircleIcon className="size-4" aria-hidden />
        </button>
      </span>
    ))}
  </div>
)
