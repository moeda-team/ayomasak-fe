import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { InitialsAvatar } from './initials-avatar'

type PersonCellProps = {
  name: string
  /** Shown under the name when present. */
  email?: string
  colorIndex?: number
  /** Content pushed to the far end, such as a role badge. */
  trailing?: ReactNode
  className?: string
}

/** Avatar with a name and optional email, for table cells and cards. */
export const PersonCell = ({ name, email, colorIndex, trailing, className }: PersonCellProps) => (
  <div className={cn('flex min-w-0 items-center gap-3', className)}>
    <InitialsAvatar name={name} colorIndex={colorIndex} />
    <div className="flex min-w-0 flex-col">
      <span className="truncate text-body-sm">{name}</span>
      {email && <span className="truncate text-caption text-text-secondary">{email}</span>}
    </div>
    {trailing && <div className="ml-auto pl-2">{trailing}</div>}
  </div>
)
