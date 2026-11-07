import {
  ClockCounterClockwiseIcon,
  FlagIcon,
  InfoIcon,
  ListChecksIcon,
  WarningCircleIcon,
  type Icon,
} from '@phosphor-icons/react'
import type { Tone } from '@/components/shared/tone'
import type { NotificationKind } from './notification-types'

export const NOTIFICATION_VISUALS: Record<NotificationKind, { icon: Icon; tone: Tone }> = {
  'publish-blocked': { icon: WarningCircleIcon, tone: 'danger' },
  'stale-nutrition': { icon: ClockCounterClockwiseIcon, tone: 'warning' },
  'review-queue': { icon: ListChecksIcon, tone: 'brand' },
  'reported-content': { icon: FlagIcon, tone: 'warning' },
  'broken-media': { icon: InfoIcon, tone: 'neutral' },
}
