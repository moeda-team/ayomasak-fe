import { ToneBadge } from '@/components/shared/tone-badge'
import { ACTION_LABEL, ACTION_TONE, STATUS_LABEL, STATUS_TONE } from './audit-labels'
import type { AuditAction, AuditStatus } from './audit-types'

export const AuditActionBadge = ({ action }: { action: AuditAction }) => (
  <ToneBadge tone={ACTION_TONE[action]}>{ACTION_LABEL[action]}</ToneBadge>
)

export const AuditStatusBadge = ({ status }: { status: AuditStatus }) => (
  <ToneBadge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</ToneBadge>
)
