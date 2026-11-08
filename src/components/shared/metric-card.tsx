import type { Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Sparkline } from './sparkline'
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from './tone'

export type DeltaSentiment = 'good' | 'bad' | 'neutral'

const DELTA_CLASS: Record<DeltaSentiment, string> = {
  good: 'bg-status-success-subtle text-text-success',
  bad: 'bg-status-danger-subtle text-text-danger',
  neutral: 'bg-surface-subtle text-text-secondary',
}

type MetricCardProps = {
  label: string
  icon: Icon
  iconTone: Tone
  value: string
  deltaLabel: string
  deltaSentiment: DeltaSentiment
  comparisonLabel: string
  trend: number[]
  trendTone: Tone
  action?: ReactNode
}

export const MetricCard = ({
  label,
  icon: IconComponent,
  iconTone,
  value,
  deltaLabel,
  deltaSentiment,
  comparisonLabel,
  trend,
  trendTone,
  action,
}: MetricCardProps) => (
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
    <div className="flex flex-col gap-2 px-4 py-3">
      <p className="text-heading-2 tabular-nums">{value}</p>
      <div className="flex items-center gap-2">
        <span className={cn('rounded-full px-2 py-0.5 text-caption tabular-nums', DELTA_CLASS[deltaSentiment])}>
          {deltaLabel}
        </span>
        <span className="truncate text-caption text-text-secondary">{comparisonLabel}</span>
        <Sparkline values={trend} className={cn('ml-auto', TONE_TEXT_CLASS[trendTone])} />
      </div>
    </div>
  </article>
)
