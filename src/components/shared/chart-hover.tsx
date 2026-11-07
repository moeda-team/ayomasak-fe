import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Size of the hover marker, used by charts to center it on a point. */
export const HOVER_MARKER_SIZE = 16

type PositionedProps = {
  className?: string
  /** Charts position the marker and card from measured pointer coordinates, which only inline styles can express. */
  style?: CSSProperties
}

/** Dot that follows the pointer on a chart: a 16px halo with a 10px core. */
export const ChartHoverMarker = ({ className, style }: PositionedProps) => (
  <span
    aria-hidden
    style={style}
    className={cn(
      'pointer-events-none grid size-4 place-items-center rounded-full bg-surface-brand-subtle shadow-marker',
      className,
    )}
  >
    <span className="size-2.5 rounded-full bg-chart-faint" />
  </span>
)

/** Floating card listing values for the hovered point. */
export const ChartTooltip = ({ children, className, style }: PositionedProps & { children: ReactNode }) => (
  <div
    aria-hidden
    style={style}
    className={cn(
      'pointer-events-none flex min-w-39 flex-col rounded-lg border border-border-default bg-surface-default p-1 shadow-overlay',
      className,
    )}
  >
    {children}
  </div>
)

type ChartTooltipRowProps = {
  children: ReactNode
  /** Shows a colored dot before the content. Pass a background utility such as `bg-chart-base`. */
  dotClass?: string
  /** Larger row used for the headline value. */
  large?: boolean
  className?: string
}

export const ChartTooltipRow = ({ children, dotClass, large = false, className }: ChartTooltipRowProps) => (
  <div
    className={cn(
      'flex items-center gap-2 rounded-md px-3',
      large ? 'h-9 text-heading-3' : 'h-8 text-body',
      className,
    )}
  >
    {dotClass && <span className={cn('size-2.5 shrink-0 rounded-full', dotClass)} />}
    {children}
  </div>
)
