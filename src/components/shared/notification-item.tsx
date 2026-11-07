import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from './tone'

type NotificationItemProps = {
  icon: Icon
  tone: Tone
  title: string
  description: string
  /** Already formatted, e.g. "10 minutes ago". */
  timeLabel: string
  /** ISO timestamp for the `<time>` element. */
  timestamp: string
  unread: boolean
}

export const NotificationItem = ({
  icon: IconComponent,
  tone,
  title,
  description,
  timeLabel,
  timestamp,
  unread,
}: NotificationItemProps) => (
  <li className="flex gap-3 px-5 py-4">
    <span
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full',
        TONE_SURFACE_CLASS[tone],
        TONE_TEXT_CLASS[tone],
      )}
    >
      <IconComponent className="size-5" aria-hidden />
    </span>
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="text-body-strong">{title}</p>
      <p className="text-body-sm text-text-secondary">{description}</p>
      <time dateTime={timestamp} className="text-caption text-text-secondary">
        {timeLabel}
      </time>
    </div>
    {unread && (
      <span className="mt-2 size-2 shrink-0 rounded-full bg-action-primary" role="img" aria-label="Unread" />
    )}
  </li>
)
