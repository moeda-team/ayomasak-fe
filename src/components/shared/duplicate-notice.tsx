import { Button } from '@/components/ui/button'
import { NoticeCard } from './notice-card'

type DuplicateNoticeProps = {
  /** Canonical name of the record that already uses the typed name. */
  existingName: string
  /** Set when the typed name matched an alias rather than the canonical name. */
  matchedAlias?: string
  onView: () => void
}

/** Warning under a name field: another record already uses this name. Saving anyway stays possible. */
export const DuplicateNotice = ({ existingName, matchedAlias, onView }: DuplicateNoticeProps) => (
  <NoticeCard tone="warning" title="Possible duplicate found">
    {matchedAlias
      ? `“${existingName}” already exists with the alias “${matchedAlias}”. Add this name as an alias instead, or save anyway.`
      : `“${existingName}” already exists. Add this name as an alias instead, or save anyway.`}
    <Button variant="link" size="sm" className="mt-1 block h-auto p-0" onClick={onView}>
      View {existingName}
    </Button>
  </NoticeCard>
)
