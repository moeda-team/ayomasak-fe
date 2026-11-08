import { useEffect, useState } from 'react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { DataTablePagination } from '@/components/shared/data-table-pagination'
import { PageHeader } from '@/components/shared/page-header'
import { SelectionBar } from '@/components/shared/selection-bar'
import { Button } from '@/components/ui/button'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { PAGE_SIZE_OPTIONS, useUserListParams } from './use-user-list-params'
import { useCreateUser, useDeleteUsers, useUpdateUser, useUsers } from './use-users'
import { UserFilters } from './user-filters'
import { UserFormDialog } from './user-form-dialog'
import { UserMetricsSection } from './user-metrics-section'
import type { User } from './user-types'
import { UsersTable } from './users-table'

const SEARCH_DEBOUNCE_MS = 300

type DialogState =
  | { kind: 'create' }
  | { kind: 'edit'; user: User }
  | { kind: 'delete'; users: User[] }

const toDeleteCopy = (users: User[]) =>
  users.length === 1
    ? { title: 'Delete user?', description: `${users[0]?.fullName} will lose access to the admin console. This cannot be undone.` }
    : { title: `Delete ${users.length} users?`, description: 'These users will lose access to the admin console. This cannot be undone.' }

export const UserListPage = () => {
  const { params, changeFilters, goToPage, reset, hasActiveFilters } = useUserListParams()
  const [searchInput, setSearchInput] = useState('')
  const debouncedSearch = useDebouncedValue(searchInput, SEARCH_DEBOUNCE_MS)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [dialog, setDialog] = useState<DialogState | null>(null)

  const { data, error, isLoading, isPlaceholderData, refetch } = useUsers(params)
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUsers = useDeleteUsers()

  const users = data?.items ?? []
  const selectedUsers = users.filter((user) => selectedIds.has(user.id))

  useEffect(() => {
    if (debouncedSearch !== params.search) changeFilters({ search: debouncedSearch })
    // `changeFilters` only wraps a state setter; syncing on the debounced text is the whole point.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  /** Selection belongs to the page it was made on, so any list change clears it. */
  const withClearedSelection =
    <TArgs extends unknown[]>(action: (...args: TArgs) => void) =>
    (...args: TArgs) => {
      setSelectedIds(new Set())
      action(...args)
    }

  const clearFilters = () => {
    setSearchInput('')
    setSelectedIds(new Set())
    reset()
  }

  const closeDialog = () => setDialog(null)

  const handleFormSubmit = (values: Parameters<typeof createUser.mutate>[0]) => {
    if (dialog?.kind === 'edit') updateUser.mutate({ id: dialog.user.id, values }, { onSuccess: closeDialog })
    else createUser.mutate(values, { onSuccess: closeDialog })
  }

  const handleDeleteConfirm = () => {
    if (dialog?.kind !== 'delete') return
    const ids = dialog.users.map((user) => user.id)
    deleteUsers.mutate(ids, {
      onSuccess: () => {
        setSelectedIds((current) => new Set([...current].filter((id) => !ids.includes(id))))
        closeDialog()
      },
      onError: closeDialog,
    })
  }

  const isFormOpen = dialog?.kind === 'create' || dialog?.kind === 'edit'
  const deleteCopy = dialog?.kind === 'delete' ? toDeleteCopy(dialog.users) : null

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        breadcrumb={['User Management', 'User List']}
        title="User List"
        description="Manage user accounts, roles and access permissions."
        action={<Button onClick={() => setDialog({ kind: 'create' })}>Add User</Button>}
      />

      <UserMetricsSection />

      <UserFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        params={params}
        onChange={withClearedSelection(changeFilters)}
      />

      {selectedUsers.length > 0 && (
        <SelectionBar
          message={`${selectedUsers.length} ${selectedUsers.length === 1 ? 'User' : 'Users'} selected`}
          action={
            <Button
              size="sm"
              className="bg-status-danger text-text-inverse hover:bg-status-danger/90"
              onClick={() => setDialog({ kind: 'delete', users: selectedUsers })}
            >
              Delete
            </Button>
          }
        />
      )}

      <UsersTable
        users={users}
        isLoading={isLoading}
        isRefreshing={isPlaceholderData}
        error={error}
        onRetry={() => void refetch()}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onEdit={(user) => setDialog({ kind: 'edit', user })}
        onDelete={(user) => setDialog({ kind: 'delete', users: [user] })}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onAddUser={() => setDialog({ kind: 'create' })}
      />

      {data && data.total > 0 && (
        <DataTablePagination
          page={params.page}
          pageSize={params.pageSize}
          total={data.total}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={withClearedSelection(goToPage)}
          onPageSizeChange={withClearedSelection((pageSize: number) => changeFilters({ pageSize }))}
        />
      )}

      <UserFormDialog
        key={dialog?.kind === 'edit' ? dialog.user.id : 'create'}
        open={isFormOpen}
        onOpenChange={(open) => !open && closeDialog()}
        user={dialog?.kind === 'edit' ? dialog.user : undefined}
        isPending={createUser.isPending || updateUser.isPending}
        onSubmit={handleFormSubmit}
      />

      <ConfirmDialog
        open={dialog?.kind === 'delete'}
        onOpenChange={(open) => !open && closeDialog()}
        title={deleteCopy?.title ?? ''}
        description={deleteCopy?.description ?? ''}
        confirmLabel="Delete"
        pendingLabel="Deleting…"
        isPending={deleteUsers.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
