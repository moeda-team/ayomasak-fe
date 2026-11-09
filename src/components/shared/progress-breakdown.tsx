import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export type BreakdownRow = {
  key: string
  label: string
  /** Text at the right end of the row, e.g. "52" or "1,284 · 100%". */
  valueLabel: string
  /** How much of the track is filled, 0 to 1. */
  fraction: number
  /** Background utility for the bar and the dot, e.g. `bg-chart-base`. */
  colorClass: string
  /** Explains the row; shown in a tooltip on hover and focus. */
  hint?: string
}

type ProgressBreakdownProps = {
  rows: BreakdownRow[]
  /** Puts a dot in the row's color before the label. */
  showDots?: boolean
  className?: string
}

const clampFraction = (fraction: number) => Math.min(Math.max(fraction, 0), 1)

const RowLabel = ({ row, showDot }: { row: BreakdownRow; showDot: boolean }) => {
  const label = (
    <span className="flex min-w-0 items-center gap-2">
      {showDot && <span aria-hidden className={cn('size-2 shrink-0 rounded-full', row.colorClass)} />}
      <span className="truncate">{row.label}</span>
    </span>
  )
  if (!row.hint) return label

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className="w-fit min-w-0 cursor-help rounded-sm underline decoration-dotted decoration-text-disabled underline-offset-4 outline-none focus-visible:shadow-focus-ring"
        >
          {label}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 text-caption">
        {row.hint}
      </TooltipContent>
    </Tooltip>
  )
}

/** Labelled rows, each with a value and a bar under it. Used for breakdowns and funnels. */
export const ProgressBreakdown = ({ rows, showDots = false, className }: ProgressBreakdownProps) => (
  <ul className={cn('flex flex-col gap-4', className)}>
    {rows.map((row, index) => (
      <li key={row.key} className="flex flex-col gap-2 text-body-sm">
        <div className="flex items-center justify-between gap-3">
          <RowLabel row={row} showDot={showDots} />
          <span className="shrink-0 tabular-nums">{row.valueLabel}</span>
        </div>
        <div aria-hidden className="h-1.5 overflow-hidden rounded-full bg-chart-track">
          <div
            className={cn('h-full origin-left animate-grow-x rounded-full motion-reduce:animate-none', row.colorClass)}
            style={{ width: `${clampFraction(row.fraction) * 100}%`, animationDelay: `${index * 50}ms` }}
          />
        </div>
      </li>
    ))}
  </ul>
)
