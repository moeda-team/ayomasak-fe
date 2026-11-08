import { PlusIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { AssignMembersDialog } from './assign-members-dialog'
import { DeleteRoleDialog } from './delete-role-dialog'
import { RoleCard } from './role-card'
import { RoleFormDialog } from './role-form-dialog'
import type { CreateRoleInput, RoleSummary } from './role-types'
import { isNameTakenError, useAssignMembers, useCreateRole, useDeleteRole, useRoles, useUpdateRole } from './use-roles'

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; role: RoleSummary }
  | { kind: 'delete'; role: RoleSummary }
  | { kind: 'assign'; role: RoleSummary }

const SKELETON_CARD_COUNT = 4

const RoleCardsSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" aria-busy>
    {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
      <Skeleton key={index} className="h-40 w-full rounded-xl" />
    ))}
  </div>
)

export const RoleListPage = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const { data: roles, error, isLoading, refetch } = useRoles()
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()
  const deleteRole = useDeleteRole()
  const assignMembers = useAssignMembers()

  const openDialog = (next: DialogState) => {
    createRole.reset()
    updateRole.reset()
    setDialog(next)
  }
  const closeDialog = () => setDialog(null)

  const handleFormSubmit = (input: CreateRoleInput) => {
    if (dialog?.kind === 'edit') {
      updateRole.mutate({ id: dialog.role.id, values: input }, { onSuccess: closeDialog })
      return
    }
    createRole.mutate(input, { onSuccess: closeDialog })
  }

  const formMutation = dialog?.kind === 'edit' ? updateRole : createRole
  const rejectedName = dialog?.kind === 'edit' ? updateRole.variables?.values.name : createRole.variables?.name
  const takenName =
    isNameTakenError(formMutation.error) && rejectedName !== undefined
      ? { name: rejectedName.trim(), message: formMutation.error.message }
      : undefined

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Role and Permission"
        description="Create a new role and set permissions for each module."
        action={
          <Button onClick={() => openDialog({ kind: 'create' })}>
            <PlusIcon aria-hidden />
            Create Role
          </Button>
        }
      />

      {error ? (
        <ErrorState title="Could not load roles" description={error.message} onRetry={() => void refetch()} />
      ) : isLoading || !roles ? (
        <RoleCardsSkeleton />
      ) : roles.length === 0 ? (
        <EmptyState
          icon={ShieldCheckIcon}
          title="No roles yet"
          description="Create the first role to start giving people access."
          action={<Button onClick={() => openDialog({ kind: 'create' })}>Create Role</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onEdit={() => openDialog({ kind: 'edit', role })}
              onDelete={() => setDialog({ kind: 'delete', role })}
              onAssign={() => setDialog({ kind: 'assign', role })}
            />
          ))}
        </div>
      )}

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <RoleFormDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          role={dialog.kind === 'edit' ? dialog.role : undefined}
          roles={roles ?? []}
          isPending={formMutation.isPending}
          takenName={takenName}
          onSubmit={handleFormSubmit}
        />
      )}

      {dialog?.kind === 'delete' && (
        <DeleteRoleDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          role={dialog.role}
          roles={roles ?? []}
          isPending={deleteRole.isPending}
          onConfirm={(moveTo) =>
            deleteRole.mutate(
              { id: dialog.role.id, moveToId: moveTo?.id, roleName: dialog.role.name, moveToName: moveTo?.name },
              { onSuccess: closeDialog },
            )
          }
        />
      )}

      {dialog?.kind === 'assign' && (
        <AssignMembersDialog
          open
          onOpenChange={(open) => !open && closeDialog()}
          role={dialog.role}
          isPending={assignMembers.isPending}
          onConfirm={(members) =>
            assignMembers.mutate(
              { roleId: dialog.role.id, userIds: members.map((member) => member.id), roleName: dialog.role.name },
              { onSuccess: closeDialog },
            )
          }
        />
      )}
    </div>
  )
}
