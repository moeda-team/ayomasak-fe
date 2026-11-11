import { DetailCard } from '@/components/shared/detail-card'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { formatRelativeTime } from '@/lib/format-relative-time'
import type { RecipeEditorRecord } from './recipe-editor-types'

type VersionEntry = {
  key: string
  title: string
  detail: string
}

/**
 * MOCK: replace with the real version list. Until the backend sends one, the history is derived from the
 * recipe's status and version, with sample people as authors.
 */
const versionsOf = (record: RecipeEditorRecord): VersionEntry[] => {
  const entries: VersionEntry[] = []
  if (record.status === 'draft-revision') {
    entries.push({
      key: 'revision',
      title: `v${record.version + 1} · Draft revision (current draft)`,
      detail: `Super Admin · Edited ${formatRelativeTime(record.savedAt)} · Not visible to users`,
    })
  }
  for (let version = record.version; version >= 1; version -= 1) {
    const isLive = version === record.version && (record.status === 'published' || record.status === 'draft-revision')
    entries.push({
      key: `v${version}`,
      title: `v${version} · Published${isLive ? ' (live)' : ''}`,
      detail: `Reviewer Rina · Published ${version === record.version ? '2 days ago' : '5 days ago'}${isLive ? ' · Visible to users' : ''}`,
    })
  }
  entries.push({
    key: 'v0',
    title: record.version === 0 && record.status === 'draft' ? 'v0 · Initial draft (current draft)' : 'v0 · Initial draft',
    detail: `Content Manager Dito · Created 5 days ago`,
  })
  return entries
}

type VersionHistoryDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: RecipeEditorRecord
  recipeName: string
}

export const VersionHistoryDrawer = ({ open, onOpenChange, record, recipeName }: VersionHistoryDrawerProps) => {
  const versions = versionsOf(record)
  return (
    <DetailDrawer
      open={open}
      onOpenChange={onOpenChange}
      title="Version history"
      description={`${recipeName} · ${versions.length} versions`}
      isDescriptionVisible
    >
      <ol className="flex flex-col gap-3">
        {versions.map((version) => (
          <li key={version.key}>
            <DetailCard className="flex flex-col gap-1 bg-surface-default">
              <p className="text-body-sm">{version.title}</p>
              <p className="text-caption text-text-secondary">{version.detail}</p>
            </DetailCard>
          </li>
        ))}
      </ol>
    </DetailDrawer>
  )
}
