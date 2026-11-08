import { LockSimpleIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RoleSummary } from './role-types'

type RoleCardProps = {
  role: RoleSummary
  onEdit: () => void
  onDelete: () => void
  onAssign: () => void
}

const ICON_BUTTON_CLASS = 'size-8 shrink-0 pointer-coarse:size-11'

export const RoleCard = ({ role, onEdit, onDelete, onAssign }: RoleCardProps) => (
  <article className="surface-card flex flex-col gap-3 p-6">
    <div className="flex items-start justify-between gap-3">
      <h2 className="min-w-0 text-heading-3 break-words">{role.name}</h2>
      <div className="flex shrink-0 items-center gap-2">
        <ToneBadge tone="brand">
          {role.memberCount} {role.memberCount === 1 ? 'Member' : 'Members'}
        </ToneBadge>
        {role.isLocked ? (
          <span role="img" aria-label={`${role.name} is locked`} className="flex size-8 items-center justify-center text-text-secondary">
            <LockSimpleIcon className="size-4" aria-hidden />
          </span>
        ) : (
          <>
            <Button variant="outline" size="icon" aria-label={`Edit ${role.name}`} className={ICON_BUTTON_CLASS} onClick={onEdit}>
              <PencilSimpleIcon aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={`Delete ${role.name}`}
              className={cn(ICON_BUTTON_CLASS, 'text-status-danger hover:text-status-danger dark:border-status-danger/40')}
              onClick={onDelete}
            >
              <TrashIcon aria-hidden />
            </Button>
          </>
        )}
      </div>
    </div>

    <p className="text-body text-text-secondary">{role.description || 'No description yet.'}</p>

    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
      <Button asChild>
        <Link to="/role-permission/$roleId" params={{ roleId: role.id }}>
          View Member
        </Link>
      </Button>
      <Button variant="outline" onClick={onAssign}>
        Assign New Member
      </Button>
    </div>
  </article>
)
