import { useState, type FocusEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import { ChartHoverMarker, ChartTooltip, ChartTooltipRow, HOVER_MARKER_SIZE } from './chart-hover'

export type StackedBarSeries = {
  key: string
  label: string
  /** Background utility for the segment and its legend dot, e.g. `bg-chart-base`. */
  colorClass: string
}

export type StackedBarDatum = {
  id: string
  /** Short axis label, e.g. "Mar". */
  label: string
  /** Heading of the hover card, e.g. "Mar 2026". */
  tooltipTitle: string
  values: Record<string, number>
}

type StackedBarChartProps = {
  data: StackedBarDatum[]
  /** Ordered bottom to top. The hover card lists them top to bottom. */
  series: StackedBarSeries[]
  totalLabel?: string
  className?: string
}

type HoverState = {
  index: number
  /** Marker position, in px from the top of the plot area. */
  y: number
}

const MAX_INTERVALS = 6
const STEP_MULTIPLIERS = [1, 2, 2.5, 5, 10]
/** Distance from the marker to the card, and from the bar top to the top of the highlight (both from the design). */
const TOOLTIP_OFFSET = 12
const HIGHLIGHT_OVERSHOOT = 5
const TOOLTIP_PADDING = 8
const TOOLTIP_ROW_HEIGHT = 32
const KEYBOARD_MARKER_DEPTH = 8

/** Smallest "round" step (1, 2, 2.5, 5 times a power of ten) that covers `max` in at most six intervals. */
const toNiceStep = (max: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(max, 1) / MAX_INTERVALS))
  const step = STEP_MULTIPLIERS.map((multiplier) => multiplier * magnitude).find(
    (candidate) => Math.ceil(max / candidate) <= MAX_INTERVALS,
  )
  return step ?? 10 * magnitude
}

const sumValues = (datum: StackedBarDatum, series: StackedBarSeries[]) =>
  series.reduce((total, { key }) => total + (datum.values[key] ?? 0), 0)

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export const StackedBarChart = ({ data, series, totalLabel = 'Total', className }: StackedBarChartProps) => {
  const [hover, setHover] = useState<HoverState | null>(null)

  const maxTotal = Math.max(0, ...data.map((datum) => sumValues(datum, series)))
  const step = toNiceStep(maxTotal)
  const axisMax = Math.max(Math.ceil(maxTotal / step) * step, step)
  const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, index) => index * step)
  const topToBottom = [...series].reverse()
  const tooltipHeight = (series.length + 2) * TOOLTIP_ROW_HEIGHT + TOOLTIP_PADDING + 4

  const barTopOf = (datum: StackedBarDatum, plotHeight: number) =>
    plotHeight * (1 - sumValues(datum, series) / axisMax)

  const handlePointer = (index: number, datum: StackedBarDatum) => (event: PointerEvent<HTMLLIElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const barTop = barTopOf(datum, rect.height)
    setHover({ index, y: clamp(event.clientY - rect.top, barTop, rect.height) })
  }

  const handleFocus = (index: number, datum: StackedBarDatum) => (event: FocusEvent<HTMLLIElement>) => {
    const barTop = barTopOf(datum, event.currentTarget.getBoundingClientRect().height)
    setHover({ index, y: barTop + KEYBOARD_MARKER_DEPTH })
  }

  const clearHover = () => setHover(null)

  return (
    <div className={cn('flex flex-col gap-2 pl-9', className)}>
      <div className="relative h-52">
        {ticks.map((tick) => (
          <div
            key={tick}
            aria-hidden
            className="absolute inset-x-0 border-t border-dashed border-chart-track"
            style={{ bottom: `${(tick / axisMax) * 100}%` }}
          >
            <span className="absolute right-full mr-3 -translate-y-1/2 text-caption text-text-secondary tabular-nums">
              {tick}
            </span>
          </div>
        ))}

        <ul className="relative flex h-full items-end">
          {data.map((datum, index) => {
            const total = sumValues(datum, series)
            const barHeightPercent = (total / axisMax) * 100
            const isHovered = hover?.index === index
            const isInSecondHalf = index >= data.length / 2
            const summary = `${datum.tooltipTitle}: ${topToBottom
              .map(({ key, label }) => `${label} ${datum.values[key] ?? 0}`)
              .join(', ')}, ${totalLabel} ${total}`

            return (
              <li
                key={datum.id}
                tabIndex={0}
                role="img"
                aria-label={summary}
                className="relative flex h-full flex-1 flex-col items-center justify-end rounded-md outline-none focus-visible:shadow-focus-ring"
                onPointerEnter={handlePointer(index, datum)}
                onPointerMove={handlePointer(index, datum)}
                onPointerLeave={clearHover}
                onFocus={handleFocus(index, datum)}
                onBlur={clearHover}
              >
                {isHovered && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 w-13 rounded-lg bg-surface-brand-subtle"
                    style={{ height: `calc(${barHeightPercent}% + ${HIGHLIGHT_OVERSHOOT}px)` }}
                  />
                )}

                <div
                  aria-hidden
                  className="relative flex w-6 origin-bottom animate-grow-y flex-col-reverse overflow-hidden rounded-t-md motion-reduce:animate-none"
                  style={{ height: `${barHeightPercent}%`, animationDelay: `${index * 40}ms` }}
                >
                  {series.map(({ key, colorClass }) => (
                    <span
                      key={key}
                      className={cn('basis-0', colorClass)}
                      style={{ flexGrow: datum.values[key] ?? 0 }}
                    />
                  ))}
                </div>

                {isHovered && hover && (
                  <>
                    <ChartHoverMarker
                      className="absolute z-10"
                      style={{ top: hover.y - HOVER_MARKER_SIZE / 2, left: `calc(50% - ${HOVER_MARKER_SIZE / 2}px)` }}
                    />
                    <ChartTooltip
                      className="absolute z-10 w-max min-w-52 whitespace-nowrap"
                      style={{
                        top: hover.y - HOVER_MARKER_SIZE / 2,
                        ...(isInSecondHalf
                          ? { right: `calc(50% + ${TOOLTIP_OFFSET}px)` }
                          : { left: `calc(50% + ${TOOLTIP_OFFSET}px)` }),
                        marginTop: -Math.max(0, hover.y - HOVER_MARKER_SIZE / 2 + tooltipHeight - 232),
                      }}
                    >
                      <ChartTooltipRow className="text-body-strong">{datum.tooltipTitle}</ChartTooltipRow>
                      {topToBottom.map(({ key, label, colorClass }) => (
                        <ChartTooltipRow key={key} dotClass={colorClass}>
                          <span>{label}</span>
                          <span className="ml-auto tabular-nums">{datum.values[key] ?? 0}</span>
                        </ChartTooltipRow>
                      ))}
                      <ChartTooltipRow className="text-body-strong">
                        <span>{totalLabel}</span>
                        <span className="ml-auto tabular-nums">{total}</span>
                      </ChartTooltipRow>
                    </ChartTooltip>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <ul aria-hidden className="flex">
        {data.map((datum) => (
          <li key={datum.id} className="flex-1 text-center text-body-sm">
            {datum.label}
          </li>
        ))}
      </ul>
    </div>
  )
}
