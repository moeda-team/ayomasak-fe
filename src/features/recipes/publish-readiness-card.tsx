import { CheckCircleIcon, WarningCircleIcon, WarningIcon } from '@phosphor-icons/react'
import { ToneBadge } from '@/components/shared/tone-badge'
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS } from '@/components/shared/tone'
import { cn } from '@/lib/utils'
import type { ReadinessCheck, ReadinessTone } from './recipe-readiness'
import { STATUS_LABEL, STATUS_TONE } from './recipe-config'
import type { RecipeStatus } from './recipe-types'

const TONE_ICON = { success: CheckCircleIcon, danger: WarningCircleIcon, warning: WarningIcon } as const satisfies Record<ReadinessTone, unknown>

type PublishReadinessCardProps = {
  status: RecipeStatus
  checks: ReadinessCheck[]
}

/** The checklist beside the editor: what is done and what still blocks publishing. */
export const PublishReadinessCard = ({ status, checks }: PublishReadinessCardProps) => (
  <aside aria-label="Publish readiness" className="surface-card flex flex-col gap-3 p-4">
    <div className="flex items-center justify-between gap-2">
      <h2 className="text-body-strong">Publish readiness</h2>
      <ToneBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</ToneBadge>
    </div>
    <ul className="flex flex-col gap-3">
      {checks.map((check) => {
        const IconComponent = TONE_ICON[check.tone]
        return (
          <li key={check.key} className={cn('flex items-start gap-3 rounded-lg p-3', TONE_SURFACE_CLASS[check.tone])}>
            <IconComponent aria-hidden className={cn('mt-0.5 size-5 shrink-0', TONE_TEXT_CLASS[check.tone])} />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className={cn('text-body-sm', TONE_TEXT_CLASS[check.tone])}>{check.title}</p>
              <p className="text-caption text-text-secondary">{check.description}</p>
            </div>
          </li>
        )
      })}
    </ul>
  </aside>
)
