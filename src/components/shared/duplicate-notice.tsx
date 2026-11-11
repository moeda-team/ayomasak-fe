import { Button } from '@/components/ui/button'
import { NoticeCard } from './notice-card'

type DuplicateNoticeProps = {
  /** Canonical name of the record that already uses the typed name. */
  existingName: string
  /** Set when the typed name matched an alias rather than the canonical name. */
  matchedAlias?: string
  onView: () => void
  /** Replaces the default heading, e.g. "Symbol already in use". */
  title?: string
  /** Replaces the default alias-oriented sentence, for clashes that are not about a name. */
  message?: string
  /** Replaces the default "View {existingName}" link text. */
  viewLabel?: string
}

/** Warning under a field: another record already uses this value. Saving anyway stays possible. */
export const DuplicateNotice = ({
  existingName,
  matchedAlias,
  onView,
  title = 'Possible duplicate found',
  message,
  viewLabel,
}: DuplicateNoticeProps) => (
  <NoticeCard tone="warning" title={title}>
    {message ??
      (matchedAlias
        ? `“${existingName}” already exists with the alias “${matchedAlias}”. Add this name as an alias instead, or save anyway.`
        : `“${existingName}” already exists. Add this name as an alias instead, or save anyway.`)}
    <Button variant="link" size="sm" className="mt-1 block h-auto p-0" onClick={onView}>
      {viewLabel ?? `View ${existingName}`}
    </Button>
  </NoticeCard>
)
