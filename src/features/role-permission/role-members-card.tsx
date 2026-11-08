import { TrashIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { SearchField } from '@/components/shared/search-field'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { RoleMember } from '@/features/user-management/mock-users-api'
import { useRoleMembers } from './use-roles'
import type { RoleId } from '@/features/user-management/user-types'

type RoleMembersCardProps = {
  roleId: RoleId
  onAssign: () => void
  onRemove: (member: RoleMember) => void
}

const matchesSearch = (member: RoleMember, search: string) => {
  const needle = search.trim().toLowerCase()
  return needle === '' || member.fullName.toLowerCase().includes(needle) || member.email.toLowerCase().includes(needle)
}

export const RoleMembersCard = ({ roleId, onAssign, onRemove }: RoleMembersCardProps) => {
  const [search, setSearch] = useState('')
  const { data: members, error, isLoading, refetch } = useRoleMembers(roleId)
  const visible = (members ?? []).filter((member) => matchesSearch(member, search))

  return (
    <section className="surface-card flex flex-col gap-4 p-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-heading-3">User in This Role</h2>
          {members && (
            <ToneBadge tone="brand">
              {members.length} {members.length === 1 ? 'Member' : 'Members'}
            </ToneBadge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onAssign}>
          Assign Member
        </Button>
      </header>

      <SearchField
        aria-label="Search users in this role"
        placeholder="Search users…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {error ? (
        <ErrorState title="Could not load members" description={error.message} onRetry={() => void refetch()} />
      ) : isLoading || !members ? (
        <div className="flex flex-col gap-2" aria-busy>
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <EmptyState title="No members yet" description="Assign users to give them this role." />
      ) : visible.length === 0 ? (
        <EmptyState title="No users match your search" description="Try a different name or email." />
      ) : (
        <ul className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto overscroll-contain">
          {visible.map((member) => (
            <li key={member.id} className="flex items-center gap-3 rounded-lg border border-border-default p-2 pr-3">
              <PersonCell name={member.fullName} email={member.email} colorIndex={toColorIndex(member.email)} className="flex-1" />
              <Button
                variant="outline"
                size="icon"
                aria-label={`Remove ${member.fullName} from this role`}
                className="size-8 shrink-0 text-status-danger hover:text-status-danger pointer-coarse:size-11 dark:border-status-danger/40"
                onClick={() => onRemove(member)}
              >
                <TrashIcon aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
