import { ToneBadge } from '@/components/shared/tone-badge'
import { ROLE_LABEL, ROLE_TONE } from './user-roles'
import type { RoleId } from './user-types'

export const RoleBadge = ({ roleId }: { roleId: RoleId }) => (
  <ToneBadge tone={ROLE_TONE[roleId]}>{ROLE_LABEL[roleId]}</ToneBadge>
)
