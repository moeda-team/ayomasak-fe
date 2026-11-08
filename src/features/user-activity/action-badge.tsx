import { ToneBadge } from '@/components/shared/tone-badge'
import type { Tone } from '@/components/shared/tone'
import type { ActivityAction } from './activity-types'

const ACTION_LABEL: Record<ActivityAction, string> = {
  created: 'Created',
  updated: 'Updated',
  deleted: 'Deleted',
}

const ACTION_TONE: Record<ActivityAction, Tone> = {
  created: 'success',
  updated: 'info',
  deleted: 'danger',
}

export const ACTION_OPTIONS = (Object.keys(ACTION_LABEL) as ActivityAction[]).map((value) => ({
  value,
  label: ACTION_LABEL[value],
}))

export const ActionBadge = ({ action }: { action: ActivityAction }) => (
  <ToneBadge tone={ACTION_TONE[action]}>{ACTION_LABEL[action]}</ToneBadge>
)
