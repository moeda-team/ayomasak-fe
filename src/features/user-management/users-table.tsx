import { PencilSimpleIcon, TrashSimpleIcon } from '@phosphor-icons/react'
import { DataTable, type DataTableColumn } from '@/components/shared/data-table'
import { EmptyState } from '@/components/shared/empty-state'
import { toColorIndex } from '@/components/shared/initials-avatar'
import { PersonCell } from '@/components/shared/person-cell'
import { StatusBadge } from '@/components/shared/status-badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { formatDay } from '@/lib/format-date'
import { formatRelativeTime } from '@/lib/format-relative-time'
import { cn } from '@/lib/utils'
import { RoleBadge } from './role-badge'
import type { User } from './user-types'

type UsersTableProps = {
  users: User[]
  isLoading: boolean
  isRefreshing: boolean
  error: Error | null
  onRetry: () => void
  selectedIds: ReadonlySet<string>
  onSelectedIdsChange: (ids: Set<string>) => void
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  hasActiveFilters: boolean
  onClearFilters: () => void
  onAddUser: () => void
}

export const UsersTable = ({
  users,
  isLoading,
  isRefreshing,
  error,
  onRetry,
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onDelete,
  hasActiveFilters,
  onClearFilters,
  onAddUser,
}: UsersTableProps) => {
  const selectedOnPage = users.filter((user) => selectedIds.has(user.id)).length
  const allSelected = users.length > 0 && selectedOnPage === users.length

  const toggleAll = (isChecked: boolean) => onSelectedIdsChange(new Set(isChecked ? users.map((user) => user.id) : []))

  const toggleOne = (id: string, isChecked: boolean) => {
    const next = new Set(selectedIds)
    if (isChecked) next.add(id)
    else next.delete(id)
    onSelectedIdsChange(next)
  }

  const columns: DataTableColumn<User>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          aria-label="Select all users on this page"
          checked={allSelected ? true : selectedOnPage > 0 ? 'indeterminate' : false}
          disabled={users.length === 0}
          onCheckedChange={(checked) => toggleAll(checked === true)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label={`Select ${row.original.fullName}`}
          checked={selectedIds.has(row.original.id)}
          onCheckedChange={(checked) => toggleOne(row.original.id, checked === true)}
        />
      ),
    },
    {
      id: 'user',
      header: 'User',
      cell: ({ row }) => (
        <PersonCell className="min-w-40" name={row.original.fullName} colorIndex={toColorIndex(row.original.id)} />
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => <span className="break-all">{row.original.email}</span>,
    },
    {
      id: 'role',
      header: 'Role',
      cell: ({ row }) => <RoleBadge roleId={row.original.roleId} />,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'joined',
      header: 'Join Date',
      cell: ({ row }) => <span className="whitespace-nowrap">{formatDay(row.original.joinedAt)}</span>,
    },
    {
      id: 'last-access',
      header: 'Last Access',
      cell: ({ row }) => (
        <div className="flex flex-col whitespace-nowrap">
          <span>{formatDay(row.original.lastAccessAt)}</span>
          <span className="text-text-secondary">{formatRelativeTime(row.original.lastAccessAt)}</span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Edit ${row.original.fullName}`}
            onClick={() => onEdit(row.original)}
          >
            <PencilSimpleIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label={`Delete ${row.original.fullName}`}
            className={cn('border-status-danger text-status-danger hover:bg-status-danger-subtle hover:text-status-danger dark:border-status-danger')}
            onClick={() => onDelete(row.original)}
          >
            <TrashSimpleIcon aria-hidden />
          </Button>
        </div>
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={users}
      getRowId={(user) => user.id}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      error={error}
      onRetry={onRetry}
      rowClassName={(user) => (selectedIds.has(user.id) ? 'bg-surface-brand-subtle' : undefined)}
      emptyState={
        hasActiveFilters ? (
          <EmptyState
            title="No users match your filters"
            description="Try a different search or clear the filters to see everyone."
            action={
              <Button variant="outline" onClick={onClearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No users yet"
            description="Add the first user to give them access to the admin console."
            action={<Button onClick={onAddUser}>Add User</Button>}
          />
        )
      }
    />
  )
}
