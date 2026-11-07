import { useState } from 'react'
import { cn } from '@/lib/utils'

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

const SIZE = 200
const STROKE = 30
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

const toPercent = (value: number, total: number) => (total === 0 ? 0 : Math.round((value / total) * 100))

export const DonutChart = ({ segments, centerLabel, className }: DonutChartProps) => {
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const total = segments.reduce((sum, segment) => sum + segment.value, 0)
  const active = segments.find((segment) => segment.key === activeKey)

  const arcs = segments.reduce<{ segment: DonutSegment; length: number; offset: number }[]>((placed, segment) => {
    const previous = placed.at(-1)
    const offset = previous ? previous.offset + previous.length : 0
    const length = total === 0 ? 0 : (segment.value / total) * CIRCUMFERENCE
    return [...placed, { segment, length, offset }]
  }, [])

  const activate = (key: string) => () => setActiveKey(key)
  const deactivate = () => setActiveKey(null)

  return (
    <div className={cn('flex flex-wrap items-center justify-center gap-x-6 gap-y-6', className)}>
      <div className="relative size-44 shrink-0">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full" role="img" aria-label={`${total} ${centerLabel}`}>
          <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} fill="none">
            {arcs.map(({ segment, length, offset }) => (
              <circle
                key={segment.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE}
                stroke="currentColor"
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
                tabIndex={0}
                aria-label={`${segment.label}: ${segment.value} (${toPercent(segment.value, total)}%)`}
                className={cn(
                  'cursor-default outline-none transition-opacity duration-150',
                  segment.colorClass,
                  activeKey && activeKey !== segment.key && 'opacity-40',
                )}
                onMouseEnter={activate(segment.key)}
                onMouseLeave={deactivate}
                onFocus={activate(segment.key)}
                onBlur={deactivate}
              />
            ))}
          </g>
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-heading-3 tabular-nums">{total}</span>
          <span className="text-caption text-text-secondary">{centerLabel}</span>
        </div>

        {active && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-2 left-3/4 z-10 flex min-w-32 flex-col gap-1 rounded-md border border-border-default bg-surface-default px-3 py-2 text-body-sm shadow-overlay"
          >
            <span className="flex items-center gap-2">
              <span className={cn('size-2 rounded-full bg-current', active.colorClass)} />
              {active.label}
            </span>
            <span className="text-body-strong tabular-nums">
              {active.value} ({toPercent(active.value, total)}%)
            </span>
          </div>
        )}
      </div>

      <ul className="flex min-w-40 flex-1 flex-col gap-3">
        {segments.map((segment) => (
          <li
            key={segment.key}
            className="flex items-center gap-3 text-body-sm"
            onMouseEnter={activate(segment.key)}
            onMouseLeave={deactivate}
          >
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
