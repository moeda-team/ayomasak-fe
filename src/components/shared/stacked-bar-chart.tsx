import { cn } from '@/lib/utils'

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

const TICK_COUNT = 5

const toNiceStep = (max: number) => {
  const rawStep = Math.max(max, 1) / TICK_COUNT
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  const multiplier = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10
  return multiplier * magnitude
}

const sumValues = (datum: StackedBarDatum, series: StackedBarSeries[]) =>
  series.reduce((total, { key }) => total + (datum.values[key] ?? 0), 0)

export const StackedBarChart = ({ data, series, totalLabel = 'Total', className }: StackedBarChartProps) => {
  const maxTotal = Math.max(0, ...data.map((datum) => sumValues(datum, series)))
  const step = toNiceStep(maxTotal)
  const axisMax = Math.max(Math.ceil(maxTotal / step) * step, step)
  const ticks = Array.from({ length: Math.round(axisMax / step) + 1 }, (_, index) => index * step)
  const topToBottom = [...series].reverse()

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
                className="group relative flex h-full flex-1 flex-col items-center justify-end rounded-md outline-none focus-visible:shadow-focus-ring"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-10 rounded-md bg-surface-brand-subtle opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100"
                />
                <div
                  aria-hidden
                  className="relative flex w-6 origin-bottom animate-grow-y flex-col-reverse overflow-hidden rounded-t-md motion-reduce:animate-none"
                  style={{ height: `${(total / axisMax) * 100}%`, animationDelay: `${index * 40}ms` }}
                >
                  {series.map(({ key, colorClass }) => (
                    <span
                      key={key}
                      className={cn('basis-0', colorClass)}
                      style={{ flexGrow: datum.values[key] ?? 0 }}
                    />
                  ))}
                </div>

                <div
                  aria-hidden
                  className={cn(
                    'pointer-events-none absolute top-8 z-10 hidden min-w-44 flex-col gap-2 rounded-md border border-border-default bg-surface-default p-3 text-body-sm shadow-overlay group-hover:flex group-focus:flex',
                    isInSecondHalf ? 'right-1/2 mr-6' : 'left-1/2 ml-6',
                  )}
                >
                  <p className="text-body-strong">{datum.tooltipTitle}</p>
                  {topToBottom.map(({ key, label, colorClass }) => (
                    <p key={key} className="flex items-center gap-2">
                      <span className={cn('size-2 rounded-full', colorClass)} />
                      <span>{label}</span>
                      <span className="ml-auto tabular-nums">{datum.values[key] ?? 0}</span>
                    </p>
                  ))}
                  <p className="flex items-center justify-between border-t border-border-default pt-2 text-body-strong">
                    <span>{totalLabel}</span>
                    <span className="tabular-nums">{total}</span>
                  </p>
                </div>
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
