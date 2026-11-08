import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import type { RoleId } from '@/features/user-management/user-types'
import type { RoleMember } from '@/features/user-management/mock-users-api'
import {
  assignMembers,
  createRole,
  deleteRole,
  fetchAssignableUsers,
  fetchRoleDetail,
  fetchRoleMembers,
  fetchRoles,
  removeMember,
  RoleNameTakenError,
  saveRolePermissions,
  updateRole,
} from './mock-roles-api'
import type { CreateRoleInput, RoleFormValues, RolePermissions } from './role-types'

export const ROLES_KEY = ['roles'] as const

export const useRoles = () => useQuery({ queryKey: [...ROLES_KEY, 'list'], queryFn: fetchRoles })

export const useRoleDetail = (roleId: RoleId) =>
  useQuery({ queryKey: [...ROLES_KEY, 'detail', roleId], queryFn: () => fetchRoleDetail(roleId) })

export const useRoleMembers = (roleId: RoleId) =>
  useQuery({ queryKey: [...ROLES_KEY, 'members', roleId], queryFn: () => fetchRoleMembers(roleId) })

export const useAssignableUsers = (roleId: RoleId, search: string) =>
  useQuery({ queryKey: [...ROLES_KEY, 'assignable', roleId, search], queryFn: () => fetchAssignableUsers(roleId, search) })

/** Roles feed User Management's filters, forms and badges, and member counts come from its users, so both refresh. */
const useInvalidateRoles = () => {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ROLES_KEY }),
      queryClient.invalidateQueries({ queryKey: ['users'] }),
    ])
}

/** A taken name is shown under the field by the form; every other failure becomes a toast. */
export const isNameTakenError = (error: Error | null) => error instanceof RoleNameTakenError

export const useCreateRole = () => {
  const invalidateRoles = useInvalidateRoles()
  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(input),
    onSuccess: (role) => {
      notify.success({ title: 'Role Created Successfully!', description: `The new role ${role.name} has been created.` })
      return invalidateRoles()
    },
    onError: (error) => {
      if (isNameTakenError(error)) return
      notify.error({ title: 'Failed to Create Role', description: 'The new role could not be created. Please try again.' })
    },
  })
}

export const useUpdateRole = () => {
  const invalidateRoles = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, values }: { id: RoleId; values: RoleFormValues }) => updateRole(id, values),
    onSuccess: (role) => {
      notify.success({ title: 'Role Updated Successfully!', description: `The role ${role.name} has been updated.` })
      return invalidateRoles()
    },
    onError: (error) => {
      if (isNameTakenError(error)) return
      notify.error({ title: 'Failed to Update Role', description: 'The role could not be updated. Please try again.' })
    },
  })
}

export const useDeleteRole = () => {
  const invalidateRoles = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ id, moveToId }: { id: RoleId; moveToId?: RoleId; roleName: string; moveToName?: string }) =>
      deleteRole(id, moveToId),
    onSuccess: (_result, { roleName, moveToName }) => {
      notify.success({
        title: 'Role Deleted Successfully!',
        description: moveToName
          ? `${roleName} has been deleted. Its members now have ${moveToName} permissions.`
          : `${roleName} has been deleted.`,
      })
      return invalidateRoles()
    },
    onError: () =>
      notify.error({ title: 'Failed to Delete Role', description: 'The role could not be deleted. Please try again.' }),
  })
}

export const useAssignMembers = () => {
  const invalidateRoles = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ roleId, userIds }: { roleId: RoleId; userIds: string[]; roleName: string }) =>
      assignMembers(roleId, userIds),
    onSuccess: (_result, { userIds, roleName }) => {
      notify.success({
        title: 'Members Assigned Successfully!',
        description: `${userIds.length} ${userIds.length === 1 ? 'user was' : 'users were'} added to ${roleName}.`,
      })
      return invalidateRoles()
    },
    onError: () =>
      notify.error({ title: 'Failed to Assign Members', description: 'The members could not be assigned. Please try again.' }),
  })
}

export const useSaveRolePermissions = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, permissions }: { id: RoleId; permissions: RolePermissions; roleName: string }) =>
      saveRolePermissions(id, permissions),
    onSuccess: (detail, { roleName }) => {
      notify.success({ title: 'Permissions Saved Successfully!', description: `Changes to ${roleName} have been saved.` })
      queryClient.setQueryData([...ROLES_KEY, 'detail', detail.id], detail)
      return queryClient.invalidateQueries({ queryKey: ROLES_KEY })
    },
    onError: () =>
      notify.error({ title: 'Failed to Save Changes', description: 'The permission changes could not be saved. Please try again.' }),
  })
}

export const useRemoveMember = () => {
  const invalidateRoles = useInvalidateRoles()
  return useMutation({
    mutationFn: ({ roleId, member }: { roleId: RoleId; member: RoleMember; roleName: string }) => removeMember(roleId, member),
    onSuccess: (_result, { member, roleName }) => {
      notify.success({ title: 'Member Removed Successfully!', description: `${member.fullName} is no longer in ${roleName}.` })
      return invalidateRoles()
    },
    onError: () =>
      notify.error({ title: 'Failed to Remove Member', description: 'The member could not be removed. Please try again.' }),
  })
}
