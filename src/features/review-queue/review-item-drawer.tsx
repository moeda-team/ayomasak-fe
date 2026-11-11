import { DetailCard, DetailList, DetailRow, DetailSection } from '@/components/shared/detail-card'
import { DetailDrawer } from '@/components/shared/detail-drawer'
import { ToneBadge } from '@/components/shared/tone-badge'
import { Button } from '@/components/ui/button'
import { formatDayWib, formatTimeWib } from '@/lib/format-date'
import { itemSubtitleOf, KIND_LABEL, KIND_TONE, sourceLabelOf } from './review-config'
import type { ReviewItem } from './review-types'

/** A match this close is likely the same thing; weaker ones are shown as plain context. */
const STRONG_MATCH_SCORE = 80

const KIND_VALUE_LABEL: Record<ReviewItem['kind'], string> = {
  bahan: 'Bahan',
  equipment: 'Equipment',
  unmapped: 'Unmapped input',
}

type ReviewItemDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Kept by the caller through the exit animation, so it can be undefined only before the first open. */
  item: ReviewItem | undefined
  onApprove: (item: ReviewItem) => void
  onReject: (item: ReviewItem) => void
  /** Open the merge dialog; `targetId` preselects a possible match. */
  onMerge: (item: ReviewItem, targetId?: string) => void
}

export const ReviewItemDrawer = ({ open, onOpenChange, item, onApprove, onReject, onMerge }: ReviewItemDrawerProps) => (
  <DetailDrawer
    open={open}
    onOpenChange={onOpenChange}
    title="Review item"
    description="Check the details and possible matches, then approve, reject, or merge this item."
    footer={
      item && (
        <>
          <Button variant="outline" onClick={() => onReject(item)}>
            Reject
          </Button>
          <Button variant="outline" onClick={() => onMerge(item)}>
            Merge into…
          </Button>
          <Button onClick={() => onApprove(item)}>Approve</Button>
        </>
      )
    }
  >
    {item && <DrawerBody item={item} onMerge={onMerge} />}
  </DetailDrawer>
)

const DrawerBody = ({ item, onMerge }: { item: ReviewItem; onMerge: ReviewItemDrawerProps['onMerge'] }) => {
  const subtitle = itemSubtitleOf(item)
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-heading-3 break-words">{item.name}</h3>
          {subtitle && <p className="text-body-sm text-text-secondary">{subtitle}</p>}
        </div>
        <ToneBadge tone={KIND_TONE[item.kind]}>{KIND_LABEL[item.kind]}</ToneBadge>
      </div>

      <DetailCard>
        <DetailList>
          <DetailRow label="Type">{KIND_VALUE_LABEL[item.kind]}</DetailRow>
          <DetailRow label="Source">{sourceLabelOf(item.source)}</DetailRow>
          <DetailRow label="Submitted">
            {formatDayWib(item.submittedAt)}, {formatTimeWib(item.submittedAt)}
          </DetailRow>
          <DetailRow label="Category">{item.category ?? 'Not set'}</DetailRow>
          <DetailRow label="Default unit">{item.defaultUnit ?? 'Not set'}</DetailRow>
        </DetailList>
      </DetailCard>

      <DetailSection title="Possible matches">
        {item.matches.length === 0 ? (
          <p className="text-body-sm text-text-secondary">No similar items found in master data.</p>
        ) : (
          <>
            <p className="text-body-sm text-text-secondary">
              {item.kind === 'unmapped'
                ? 'Existing master items that look similar. Merge to map this input to one of them.'
                : 'Existing master items that look similar. Merge to combine this item into one of them.'}
            </p>
            <ul className="surface-card divide-y divide-border-default">
              {item.matches.map((candidate) => (
                <li key={candidate.id} className="flex items-center gap-3 p-3">
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-body-sm">{candidate.name}</span>
                    {candidate.aliases.length > 0 && (
                      <span className="text-caption text-text-secondary">Alias: {candidate.aliases.join(', ')}</span>
                    )}
                  </div>
                  <ToneBadge tone={candidate.score >= STRONG_MATCH_SCORE ? 'success' : 'neutral'}>{candidate.score}% match</ToneBadge>
                  <Button variant="outline" size="sm" onClick={() => onMerge(item, candidate.id)}>
                    Merge
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </DetailSection>
    </>
  )
}
