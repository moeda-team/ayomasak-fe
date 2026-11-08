import { ToneBadge } from '@/components/shared/tone-badge'
import { getRoleName, getRoleTone } from './role-registry'
import type { RoleId } from './user-types'

export const RoleBadge = ({ roleId }: { roleId: RoleId }) => (
  <ToneBadge tone={getRoleTone(roleId)}>{getRoleName(roleId)}</ToneBadge>
)
