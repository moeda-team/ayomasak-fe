import { useRef, useState, type FocusEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import { ChartHoverMarker, ChartTooltip, ChartTooltipRow, HOVER_MARKER_SIZE } from './chart-hover'

export type DonutSegment = {
  key: string
  label: string
  value: number
  /** Text color utility for the arc and legend dot (drawn with `currentColor`), e.g. `text-chart-base`. */
  colorClass: string
}

type DonutChartProps = {
  segments: DonutSegment[]
  centerLabel: string
  className?: string
}

type HoverState = {
  key: string
  /** Marker center, in px from the top-left of the chart. */
  x: number
  y: number
}

const SIZE = 200
const STROKE = 30
const RADIUS = (SIZE - STROKE) / 2
const CENTER = SIZE / 2
const FULL_TURN = Math.PI * 2
const TOOLTIP_OFFSET = 12

/** Point on the ring's centerline at `angle` (radians, clockwise from 12 o'clock). */
const pointOnRing = (angle: number) => ({
  x: CENTER + Math.sin(angle) * RADIUS,
  y: CENTER - Math.cos(angle) * RADIUS,
})

/** Arc path from `start` over `sweep` radians; stroked with butt caps, its ends are exactly radial. */
const arcPath = (start: number, sweep: number) => {
  const from = pointOnRing(start)
  const to = pointOnRing(start + sweep)
  return `M ${from.x} ${from.y} A ${RADIUS} ${RADIUS} 0 ${sweep > Math.PI ? 1 : 0} 1 ${to.x} ${to.y}`
}

const toPercent = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100))

export const DonutChart = ({ segments, centerLabel, className }: DonutChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<HoverState | null>(null)
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const hovered = segments.find((segment) => segment.key === hover?.key)

  const arcs = segments.reduce<{ segment: DonutSegment; start: number; sweep: number }[]>((placed, segment) => {
    const previous = placed.at(-1)
    const start = previous ? previous.start + previous.sweep : 0
    const sweep = total === 0 ? 0 : Math.min((segment.value / total) * FULL_TURN, FULL_TURN - 0.0001)
    return [...placed, { segment, start, sweep }]
  }, [])

  /** Places the marker on the middle of the ring at `angle` (radians, clockwise from 12 o'clock). */
  const markerAt = (key: string, angle: number, pixelSize: number): HoverState => {
    const scale = pixelSize / SIZE
    return {
      key,
      x: pixelSize / 2 + Math.sin(angle) * RADIUS * scale,
      y: pixelSize / 2 - Math.cos(angle) * RADIUS * scale,
    }
  }

  const findSegmentAt = (fraction: number) => {
    let cumulative = 0
    return segments.find((segment) => {
      cumulative += total === 0 ? 0 : segment.value / total
      return fraction < cumulative
    })
  }

  const handlePointerMove = (event: PointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const scale = rect.width / SIZE
    const dx = event.clientX - (rect.left + rect.width / 2)
    const dy = event.clientY - (rect.top + rect.height / 2)
    const isOnRing = Math.abs(Math.hypot(dx, dy) - RADIUS * scale) <= (STROKE / 2) * scale
    const angle = (Math.atan2(dx, -dy) + FULL_TURN) % FULL_TURN
    const segment = isOnRing ? findSegmentAt(angle / FULL_TURN) : undefined
    setHover(segment ? markerAt(segment.key, angle, rect.width) : null)
  }

  const handleSegmentFocus = (key: string, arcMiddle: number) => (event: FocusEvent<SVGPathElement>) => {
    const pixelSize = chartRef.current?.getBoundingClientRect().width ?? event.currentTarget.getBoundingClientRect().width
    setHover(markerAt(key, arcMiddle, pixelSize))
  }

  const clearHover = () => setHover(null)

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-6 gap-y-6', className)}>
      <div ref={chartRef} className="relative size-52 shrink-0">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="size-full"
          role="img"
          aria-label={`${total} ${centerLabel}`}
          onPointerMove={handlePointerMove}
          onPointerLeave={clearHover}
        >
          <g fill="none">
            {arcs.map(({ segment, start, sweep }) => (
              <path
                key={segment.key}
                d={arcPath(start, sweep)}
                strokeWidth={STROKE}
                stroke="currentColor"
                tabIndex={0}
                aria-label={`${segment.label}: ${segment.value} (${toPercent(segment.value, total)}%)`}
                className={cn('outline-none', segment.colorClass)}
                onFocus={handleSegmentFocus(segment.key, start + sweep / 2)}
                onBlur={clearHover}
              />
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-heading-2 tabular-nums">{total}</span>
          <span className="text-body text-text-secondary">{centerLabel}</span>
        </div>

        {hover && hovered && (
          <>
            <ChartHoverMarker
              className="absolute z-10"
              style={{ left: hover.x - HOVER_MARKER_SIZE / 2, top: hover.y - HOVER_MARKER_SIZE / 2 }}
            />
            <ChartTooltip
              className="absolute z-10"
              style={{ left: hover.x + TOOLTIP_OFFSET, top: hover.y - HOVER_MARKER_SIZE / 2 }}
            >
              <ChartTooltipRow dotClass={cn('bg-current', hovered.colorClass)}>{hovered.label}</ChartTooltipRow>
              <ChartTooltipRow large className="tabular-nums">
                {hovered.value} ({toPercent(hovered.value, total)}%)
              </ChartTooltipRow>
            </ChartTooltip>
          </>
        )}
      </div>

      <ul className="flex min-w-40 flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-3 text-body-sm">
            <span className={cn('size-2.5 shrink-0 rounded-full bg-current', segment.colorClass)} />
            <span className="text-body-strong">{segment.label}</span>
            <span className="ml-auto tabular-nums">{segment.value}</span>
            <span className="w-10 text-right text-text-secondary tabular-nums">
              {toPercent(segment.value, total)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
