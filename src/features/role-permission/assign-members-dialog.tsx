import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { NoticeCard } from '@/components/shared/notice-card'
import { PersonCell } from '@/components/shared/person-cell'
import { SearchField } from '@/components/shared/search-field'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import type { RoleMember } from '@/features/user-management/mock-users-api'
import { RoleBadge } from '@/features/user-management/role-badge'
import { cn } from '@/lib/utils'
import type { RoleSummary } from './role-types'
import { useAssignableUsers } from './use-roles'

const SEARCH_DEBOUNCE_MS = 250

type AssignMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleSummary
  isPending: boolean
  onConfirm: (members: RoleMember[]) => void
}

type AssignMembersBodyProps = Omit<AssignMembersDialogProps, 'open' | 'onOpenChange'> & { onCancel: () => void }

const joinNames = (names: string[]) =>
  names.length <= 2 ? names.join(' and ') : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`

const MemberListSkeleton = () => (
  <div className="flex flex-col gap-2" aria-busy>
    {[0, 1, 2, 3].map((row) => (
      <Skeleton key={row} className="h-16 w-full rounded-lg" />
    ))}
  </div>
)

const AssignMembersBody = ({ role, isPending, onConfirm, onCancel }: AssignMembersBodyProps) => {
  const [searchInput, setSearchInput] = useState('')
  const [selected, setSelected] = useState<Map<string, RoleMember>>(new Map())
  const search = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const { data: users, error, isLoading, refetch } = useAssignableUsers(role.id, search)

  const selectedMembers = [...selected.values()]
  const count = selectedMembers.length

  const toggle = (member: RoleMember) =>
    setSelected((previous) => {
      const next = new Map(previous)
      if (next.has(member.id)) next.delete(member.id)
      else next.set(member.id, member)
      return next
    })

  return (
    <>
      <div className="flex flex-col gap-3 px-6 pb-2">
        <SearchField
          aria-label="Search users by name or email"
          placeholder="Search users by name or email…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />

        {/* Dialogs block wheel events outside themselves; this keeps the list scrollable. */}
        <div className="max-h-72 overflow-y-auto overscroll-contain" onWheel={(event) => event.stopPropagation()}>
          {error ? (
            <ErrorState title="Could not load users" description={error.message} onRetry={() => void refetch()} />
          ) : isLoading || !users ? (
            <MemberListSkeleton />
          ) : users.length === 0 ? (
            <EmptyState
              title={search ? 'No users match your search' : 'Everyone is already in this role'}
              description={search ? 'Try a different name or email.' : undefined}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {users.map((member) => {
                const isChecked = selected.has(member.id)
                return (
                  <li key={member.id}>
                    <label
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-lg border border-border-default p-3 transition-colors hover:bg-surface-subtle',
                        isChecked && 'border-border-focus/50 bg-surface-brand-subtle hover:bg-surface-brand-subtle',
                      )}
                    >
                      <Checkbox checked={isChecked} onCheckedChange={() => toggle(member)} aria-label={`Select ${member.fullName}`} />
                      <PersonCell
                        name={member.fullName}
                        email={member.email}
                        colorIndex={toColorIndex(member.email)}
                        trailing={<RoleBadge roleId={member.roleId} />}
                        className="flex-1"
                      />
                    </label>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {count > 0 && (
          <NoticeCard tone="warning" title={`${count} ${count === 1 ? 'user' : 'users'} will change role`}>
            {joinNames(selectedMembers.map((member) => member.fullName))} will leave their current role and join {role.name}.
          </NoticeCard>
        )}
      </div>

      <DialogFooter className="flex-row justify-end gap-3 px-6 pt-4 pb-6">
        <Button variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={isPending || count === 0} onClick={() => onConfirm(selectedMembers)}>
          {isPending ? 'Assigning…' : count > 0 ? `Assign ${count} ${count === 1 ? 'User' : 'Users'}` : 'Assign Users'}
        </Button>
      </DialogFooter>
    </>
  )
}

/** Pick users to move into a role. Each user has one role, so the dialog says who will be taken out of theirs. */
export const AssignMembersDialog = ({ open, onOpenChange, ...bodyProps }: AssignMembersDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !bodyProps.isPending && onOpenChange(next)}>
    <DialogContent className="gap-0 p-0 sm:max-w-lg">
      <DialogHeader className="gap-1 p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">Assign New Member</DialogTitle>
        <DialogDescription className="text-body-sm text-text-secondary">
          Choose users to add to {bodyProps.role.name}. Each user can only have one role.
        </DialogDescription>
      </DialogHeader>
      <AssignMembersBody {...bodyProps} onCancel={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)
