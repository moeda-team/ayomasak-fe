import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from './tone'

export type DeltaSentiment = 'good' | 'bad' | 'neutral'

/** Whether a rise or a drop in the metric is the good news. */
export type BetterWhen = 'higher' | 'lower'

export const toDeltaSentiment = (delta: number, betterWhen: BetterWhen): DeltaSentiment => {
  if (delta === 0) return 'neutral'
  return (delta > 0) === (betterWhen === 'higher') ? 'good' : 'bad'
}

/** "+3%", "-4%", "0". Pass `suffix` as '' for plain counts. */
export const toDeltaLabel = (delta: number, suffix = '%') => (delta === 0 ? '0' : `${delta > 0 ? '+' : ''}${delta}${suffix}`)

const DELTA_CLASS: Record<DeltaSentiment, string> = {
  good: 'bg-status-success-subtle text-text-success',
  bad: 'bg-status-danger-subtle text-text-danger',
  neutral: 'bg-surface-subtle text-text-secondary',
}

type MetricCardHeaderProps = {
  label: string
  icon: Icon
  iconTone: Tone
  action?: ReactNode
}

type MetricCardReadyProps = {
  status?: 'ready'
  value: string
  deltaLabel: string
  deltaSentiment: DeltaSentiment
  comparisonLabel: string
  /** Leave empty when there is nothing to draw, e.g. while no data exists yet. */
  trend: number[]
  trendTone: Tone
}

type MetricCardBodyProps = MetricCardReadyProps | { status: 'loading' } | { status: 'error'; onRetry: () => void }

type MetricCardProps = MetricCardHeaderProps & MetricCardBodyProps

const MetricCardBody = (props: MetricCardBodyProps) => {
  if (props.status === 'loading') {
    return (
      <div className="flex flex-col gap-3 px-4 py-3" aria-busy>
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-5 w-full" />
      </div>
    )
  }

  if (props.status === 'error') {
    return (
      <div role="alert" className="flex flex-col gap-2 px-4 py-3">
        <p className="text-heading-2 text-text-disabled">—</p>
        <p className="text-caption text-text-danger">
          Couldn’t load ·{' '}
          <button type="button" onClick={props.onRetry} className="rounded-sm underline underline-offset-2 outline-none focus-visible:shadow-focus-ring">
            Retry
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-3">
      <p className="text-heading-2 tabular-nums">{props.value}</p>
      <div className="flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-caption tabular-nums', DELTA_CLASS[props.deltaSentiment])}>
          {props.deltaLabel}
        </span>
        <span className="truncate text-caption text-text-secondary">{props.comparisonLabel}</span>
        <Sparkline values={props.trend} className={cn('ml-auto', TONE_TEXT_CLASS[props.trendTone])} />
      </div>
    </div>
  )
}

export const MetricCard = ({ label, icon: IconComponent, iconTone, action, ...body }: MetricCardProps) => (
  <article className="surface-card flex min-w-0 flex-col overflow-hidden">
    <header className="flex items-center justify-between gap-3 border-b border-border-default px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-md',
            TONE_SURFACE_CLASS[iconTone],
            TONE_TEXT_CLASS[iconTone],
          )}
        >
          <IconComponent className="size-5" aria-hidden />
        </span>
        <h3 className="truncate text-body-sm">{label}</h3>
      </div>
      {action}
    </header>
    <MetricCardBody {...body} />
  </article>
)
