import { ArrowLeftIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ErrorState } from '@/components/shared/error-state'
import { NoticeCard } from '@/components/shared/notice-card'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { DIALOG_EXIT_MS, useRetainedValue } from '@/hooks/use-retained-value'
import type { RoleMember } from '@/features/user-management/mock-users-api'
import type { AccessLevel, ModuleId } from '@/features/user-management/role-permissions'
import type { RoleId } from '@/features/user-management/user-types'
import { AssignMembersDialog } from './assign-members-dialog'
import { PermissionsCard } from './permissions-card'
import { RoleMembersCard } from './role-members-card'
import type { RoleDetail, RolePermissions } from './role-types'
import { useAssignMembers, useRemoveMember, useRoleDetail, useSaveRolePermissions } from './use-roles'

type DialogState = { kind: 'assign' } | { kind: 'remove'; member: RoleMember }

const toPermissions = ({ modules, canPublishRecipes }: RoleDetail): RolePermissions => ({ modules, canPublishRecipes })

const isSamePermissions = (a: RolePermissions, b: RolePermissions) =>
  a.canPublishRecipes === b.canPublishRecipes &&
  (Object.keys(a.modules) as ModuleId[]).every((moduleId) => a.modules[moduleId] === b.modules[moduleId])

const DetailSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" aria-busy>
    <div className="flex flex-col gap-6">
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
    <Skeleton className="h-[40rem] w-full rounded-xl" />
  </div>
)

const BackLink = () => (
  <Button asChild variant="ghost" size="sm" className="-ml-2 my-1 self-start">
    <Link to="/role-permission">
      <ArrowLeftIcon aria-hidden />
      Back
    </Link>
  </Button>
)

type RoleDetailContentProps = { role: RoleDetail }

const RoleDetailContent = ({ role }: RoleDetailContentProps) => {
  const [draft, setDraft] = useState<RolePermissions | null>(null)
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const savePermissions = useSaveRolePermissions()
  const assignMembers = useAssignMembers()
  const removeMember = useRemoveMember()

  const saved = toPermissions(role)
  const permissions = draft ?? saved
  const isDirty = draft !== null && !isSamePermissions(draft, saved)
  const closeDialog = () => setDialog(null)
  /** What the dialogs show; it outlives `dialog` for the length of their exit animation. */
  const shownDialog = useRetainedValue(dialog, DIALOG_EXIT_MS)

  const handleModuleChange = (moduleId: ModuleId, level: AccessLevel) =>
    setDraft({ ...permissions, modules: { ...permissions.modules, [moduleId]: level } })

  const handleSave = () =>
    savePermissions.mutate(
      { id: role.id, permissions, roleName: role.name },
      { onSuccess: () => setDraft(null) },
    )

  return (
    <>
      <PageHeader
        breadcrumb={['Role and Permission', 'Role Detail']}
        back={<BackLink />}
        title="Role Detail"
        description="Set access levels for each module for this role."
        action={
          <div className="flex flex-wrap items-center gap-3">
            {isDirty && <span className="text-body-sm text-status-warning">You have unsaved changes</span>}
            <Button variant="outline" disabled={!isDirty || savePermissions.isPending} onClick={() => setDraft(null)}>
              Reset
            </Button>
            <Button disabled={!isDirty || savePermissions.isPending} onClick={handleSave}>
              {savePermissions.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col gap-6">
          <section className="surface-card flex items-start gap-4 p-6">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-text-inverse">
              <ShieldCheckIcon className="size-5" aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-1">
              <h2 className="text-heading-3 break-words">{role.name}</h2>
              <p className="text-body text-text-secondary">{role.description || 'No description yet.'}</p>
            </div>
          </section>

          <RoleMembersCard
            roleId={role.id}
            onAssign={() => setDialog({ kind: 'assign' })}
            onRemove={(member) => setDialog({ kind: 'remove', member })}
          />
        </div>

        <PermissionsCard
          permissions={permissions}
          isLocked={role.isLocked}
          roleName={role.name}
          onModuleChange={handleModuleChange}
          onPublishChange={(canPublishRecipes) => setDraft({ ...permissions, canPublishRecipes })}
        />
      </div>

      {shownDialog?.kind === 'assign' && (
        <AssignMembersDialog
          open={dialog !== null}
          onOpenChange={(open) => !open && closeDialog()}
          role={role}
          isPending={assignMembers.isPending}
          onConfirm={(members) =>
            assignMembers.mutate(
              { roleId: role.id, userIds: members.map((member) => member.id), roleName: role.name },
              { onSuccess: closeDialog },
            )
          }
        />
      )}

      {shownDialog?.kind === 'remove' && (
        <ConfirmDialog
          open={dialog !== null}
          onOpenChange={(open) => !open && closeDialog()}
          title="Remove Member"
          description={`Remove ${shownDialog.member.fullName} from ${role.name}?`}
          confirmLabel="Remove Member"
          pendingLabel="Removing…"
          isPending={removeMember.isPending}
          onConfirm={() =>
            removeMember.mutate({ roleId: role.id, member: shownDialog.member, roleName: role.name }, { onSuccess: closeDialog })
          }
        >
          <NoticeCard tone="warning" title={`${shownDialog.member.fullName} will have no role`}>
            {shownDialog.member.fullName} loses all access until they are assigned to another role.
          </NoticeCard>
        </ConfirmDialog>
      )}
    </>
  )
}

export const RoleDetailPage = ({ roleId }: { roleId: RoleId }) => {
  const { data: role, error, isLoading, refetch } = useRoleDetail(roleId)

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <>
          <BackLink />
          <ErrorState title="Could not load this role" description={error.message} onRetry={() => void refetch()} />
        </>
      ) : isLoading || !role ? (
        <>
          <BackLink />
          <DetailSkeleton />
        </>
      ) : (
        <RoleDetailContent key={role.id} role={role} />
      )}
    </div>
  )
}
