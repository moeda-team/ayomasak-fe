import { useState } from 'react'
import { Combobox } from '@/components/shared/combobox'
import { FormField } from '@/components/shared/form-field'
import { NoticeCard } from '@/components/shared/notice-card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { RoleId } from '@/features/user-management/user-types'
import type { RoleSummary } from './role-types'

type DeleteRoleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: RoleSummary
  /** Every role, to pick where the members go. */
  roles: RoleSummary[]
  isPending: boolean
  onConfirm: (moveTo: RoleSummary | undefined) => void
}

type DeleteRoleBodyProps = Omit<DeleteRoleDialogProps, 'open' | 'onOpenChange'> & { onCancel: () => void }

const DeleteRoleBody = ({ role, roles, isPending, onConfirm, onCancel }: DeleteRoleBodyProps) => {
  const [moveToId, setMoveToId] = useState<RoleId | ''>('')
  const [hasTriedToSubmit, setHasTriedToSubmit] = useState(false)
  const hasMembers = role.memberCount > 0
  const targets = roles.filter((candidate) => candidate.id !== role.id)
  const needsTarget = hasMembers && moveToId === ''

  const handleConfirm = () => {
    if (needsTarget) {
      setHasTriedToSubmit(true)
      return
    }
    onConfirm(targets.find((candidate) => candidate.id === moveToId))
  }

  return (
    <>
      <div className="flex flex-col gap-4 px-6 pb-2">
        {hasMembers ? (
          <>
            <NoticeCard tone="warning" title={`${role.memberCount} ${role.memberCount === 1 ? 'member' : 'members'} will be moved`}>
              Everyone in {role.name} will take the permissions of the role you choose below.
            </NoticeCard>
            <FormField
              htmlFor="delete-role-move-to"
              label="Move members to"
              isRequired
              error={hasTriedToSubmit && needsTarget ? 'Select a role for the members' : undefined}
            >
              <Combobox
                id="delete-role-move-to"
                value={moveToId}
                options={targets.map((target) => ({ value: target.id, label: target.name }))}
                onChange={setMoveToId}
                placeholder="Select a role"
                searchPlaceholder="Search role"
                emptyMessage="No role found"
                isInvalid={hasTriedToSubmit && needsTarget}
                aria-describedby={hasTriedToSubmit && needsTarget ? 'delete-role-move-to-error' : undefined}
              />
            </FormField>
          </>
        ) : (
          <p className="text-body text-text-secondary">{role.name} has no members, so nobody is affected.</p>
        )}
      </div>
      <DialogFooter className="flex-row justify-end gap-3 px-6 pt-4 pb-6">
        <Button variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button
          disabled={isPending}
          onClick={handleConfirm}
          className="bg-status-danger text-text-inverse hover:bg-status-danger/90"
        >
          {isPending ? 'Deleting…' : 'Delete Role'}
        </Button>
      </DialogFooter>
    </>
  )
}

/** Members have to land somewhere, so a role that still has members asks for the role they move to. */
export const DeleteRoleDialog = ({ open, onOpenChange, ...bodyProps }: DeleteRoleDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !bodyProps.isPending && onOpenChange(next)}>
    <DialogContent className="gap-0 p-0 sm:max-w-lg">
      <DialogHeader className="gap-1 p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">Delete Role</DialogTitle>
        <DialogDescription className="text-body-sm text-text-secondary">This action cannot be undone.</DialogDescription>
      </DialogHeader>
      <DeleteRoleBody {...bodyProps} onCancel={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)
