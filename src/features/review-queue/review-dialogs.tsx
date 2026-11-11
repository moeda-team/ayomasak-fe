import { useState } from 'react'
import { Combobox } from '@/components/shared/combobox'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { FormField } from '@/components/shared/form-field'
import { Textarea } from '@/components/ui/textarea'
import type { ReviewItem } from './review-types'
import { useMergeTargets } from './use-review'

type RejectDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ReviewItem | undefined
  isPending: boolean
  onSubmit: (reason: string) => void
}

/** Reject needs a reason, which is saved in the audit log. The caller remounts it (`key`) for each open. */
export const RejectDialog = ({ open, onOpenChange, item, isPending, onSubmit }: RejectDialogProps) => {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()

  const handleConfirm = () => {
    const trimmed = reason.trim()
    if (trimmed === '') return setError('A reason is required to reject an item.')
    onSubmit(trimmed)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? `Reject ${item.name}?` : ''}
      description="The item becomes unavailable. A reason is required and is saved in the audit log."
      confirmLabel="Reject"
      pendingLabel="Rejecting…"
      isPending={isPending}
      onConfirm={handleConfirm}
    >
      <FormField htmlFor="reject-reason" label="Reason" isRequired error={error}>
        <Textarea
          id="reject-reason"
          rows={3}
          value={reason}
          placeholder="Explain why this item is rejected"
          className="min-h-20 resize-none text-body-sm md:text-body-sm"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'reject-reason-error' : undefined}
          onChange={(event) => {
            setReason(event.target.value)
            setError(undefined)
          }}
        />
      </FormField>
    </ConfirmDialog>
  )
}

type MergeDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: ReviewItem | undefined
  /** A possible match to start with. */
  initialTargetId: string | undefined
  isPending: boolean
  onSubmit: (targetId: string) => void
}

/** Pick the master record to merge an item into. The caller remounts it (`key`) for each open. */
export const MergeDialog = ({ open, onOpenChange, item, initialTargetId, isPending, onSubmit }: MergeDialogProps) => {
  const [targetId, setTargetId] = useState(initialTargetId ?? '')
  const [error, setError] = useState<string>()
  const { data: targets = [] } = useMergeTargets(item?.kind)

  const bestMatch = item?.matches[0]

  const handleConfirm = () => {
    if (targetId === '') return setError('Choose the item to merge into.')
    onSubmit(targetId)
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? `Merge ${item.name} into…` : ''}
      description={
        item?.kind === 'unmapped'
          ? `Future input of “${item.name.toLowerCase()}” will be recognised as the item you pick.`
          : 'This item will be combined into the item you pick.'
      }
      confirmLabel="Merge"
      pendingLabel="Merging…"
      tone="primary"
      isPending={isPending}
      onConfirm={handleConfirm}
    >
      <FormField
        htmlFor="merge-target"
        label="Merge into"
        isRequired
        error={error}
        hint={bestMatch ? `Suggested: ${bestMatch.name} (${bestMatch.score}% match)` : undefined}
      >
        <Combobox
          id="merge-target"
          value={targetId}
          options={targets.map((target) => ({ value: target.id, label: target.name }))}
          placeholder="Search master items…"
          searchPlaceholder="Search master items…"
          emptyMessage="No master item found"
          isInvalid={Boolean(error)}
          aria-describedby={error ? 'merge-target-error' : undefined}
          onChange={(value) => {
            setTargetId(value)
            setError(undefined)
          }}
        />
      </FormField>
    </ConfirmDialog>
  )
}
