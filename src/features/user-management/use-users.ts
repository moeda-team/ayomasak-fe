import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { createUser, deleteUsers, fetchRoleOptions, fetchUserMetrics, fetchUsers, updateUser } from './mock-users-api'
import type { UserFormValues, UserListParams } from './user-types'

const USERS_KEY = ['users'] as const

export const useUsers = (params: UserListParams) =>
  useQuery({
    queryKey: [...USERS_KEY, 'list', params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  })

export const useUserMetrics = () => useQuery({ queryKey: [...USERS_KEY, 'metrics'], queryFn: fetchUserMetrics })

export const useRoleOptions = () =>
  useQuery({ queryKey: [...USERS_KEY, 'roles'], queryFn: fetchRoleOptions, staleTime: 5 * 60_000 })

const useInvalidateUsers = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: USERS_KEY })
}

export const useCreateUser = () => {
  const invalidateUsers = useInvalidateUsers()
  return useMutation({
    mutationFn: (values: UserFormValues) => createUser(values),
    onSuccess: () => {
      notify.success({ title: 'User Added Successfully!', description: 'The new user account has been created successfully.' })
      return invalidateUsers()
    },
    onError: () =>
      notify.error({ title: 'Failed to Add User', description: 'The new user account could not be created. Please try again.' }),
  })
}

export const useUpdateUser = () => {
  const invalidateUsers = useInvalidateUsers()
  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: UserFormValues }) => updateUser(id, values),
    onSuccess: () => {
      notify.success({ title: 'User Updated Successfully!', description: 'The user account has been updated successfully.' })
      return invalidateUsers()
    },
    onError: () =>
      notify.error({ title: 'Failed to Update User', description: 'The user account could not be updated. Please try again.' }),
  })
}

export const useDeleteUsers = () => {
  const invalidateUsers = useInvalidateUsers()
  return useMutation({
    mutationFn: (ids: string[]) => deleteUsers(ids),
    onSuccess: (_result, ids) => {
      notify.success({
        title: ids.length > 1 ? 'Users Deleted Successfully!' : 'User Deleted Successfully!',
        description: ids.length > 1 ? 'The user accounts have been deleted successfully.' : 'The user account has been deleted successfully.',
      })
      return invalidateUsers()
    },
    onError: (_error, ids) =>
      notify.error({
        title: ids.length > 1 ? 'Failed to Delete Users' : 'Failed to Delete User',
        description: ids.length > 1 ? 'The user accounts could not be deleted. Please try again.' : 'The user account could not be deleted. Please try again.',
      }),
  })
}
