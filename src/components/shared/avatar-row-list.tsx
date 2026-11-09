import { InitialsAvatar } from './initials-avatar'
import { formatRelativeTime } from '@/lib/format-relative-time'

export type AvatarRow = {
  id: string
  /** Shown next to the avatar; the avatar takes its initials from it. */
  name: string
  detail: string
  /** ISO timestamp, shown as "2 hours ago". */
  at: string
}

type AvatarRowListProps = {
  rows: AvatarRow[]
}

/** Recent items as bordered rows: avatar and name, a short description, and when it happened. */
export const AvatarRowList = ({ rows }: AvatarRowListProps) => (
  <ul className="@container flex flex-col gap-3">
    {rows.map((row, index) => (
      <li
        key={row.id}
        className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-md border border-border-default px-3 py-2 text-body-sm @md:grid-cols-[9.5rem_minmax(0,1fr)_auto]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <InitialsAvatar name={row.name} colorIndex={index} />
          <span className="line-clamp-2">{row.name}</span>
        </span>
        <span className="col-start-1 row-start-2 truncate pl-11 text-text-secondary @md:col-start-auto @md:row-start-auto @md:pl-0 @md:text-text-primary">
          {row.detail}
        </span>
        <time
          dateTime={row.at}
          className="col-start-2 row-start-1 text-right text-text-secondary @md:col-start-auto @md:row-start-auto"
        >
          {formatRelativeTime(row.at)}
        </time>
      </li>
    ))}
  </ul>
)
