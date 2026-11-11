import { ConfirmDialog } from '@/components/shared/confirm-dialog'

export type LifecycleDialog = 'publish' | 'revision' | 'unpublish' | 'archive' | 'restore'

type RecipeLifecycleDialogsProps = {
  /** Which dialog is open, or null. */
  open: LifecycleDialog | null
  onClose: () => void
  name: string
  /** Live version: the one users see, or the one a revision is based on. */
  version: number
  isRevision: boolean
  /** True while the action behind the open dialog runs. */
  isPending: boolean
  onConfirm: (dialog: LifecycleDialog) => void
}

/** Confirmations for every step in a recipe's lifecycle. Only one is open at a time. */
export const RecipeLifecycleDialogs = ({ open, onClose, name, version, isRevision, isPending, onConfirm }: RecipeLifecycleDialogsProps) => {
  const change = (dialog: LifecycleDialog) => ({
    open: open === dialog,
    onOpenChange: (next: boolean) => !next && onClose(),
    isPending: open === dialog && isPending,
    onConfirm: () => onConfirm(dialog),
  })

  return (
    <>
      <ConfirmDialog
        {...change('publish')}
        title={isRevision ? `Publish revision of ${name}?` : `Publish ${name}?`}
        description={
          isRevision
            ? `Users switch from v${version} to v${version + 1}. This action is recorded in the audit log.`
            : 'It becomes visible to users and eligible for ingredient matching. This action is recorded in the audit log.'
        }
        confirmLabel={isRevision ? 'Publish revision' : 'Publish'}
        pendingLabel="Publishing…"
        tone="primary"
      />
      <ConfirmDialog
        {...change('revision')}
        title="Create draft revision?"
        description={`A copy of v${version} will be created as a draft. Users keep seeing v${version} until you publish the revision.`}
        confirmLabel="Create draft revision"
        pendingLabel="Creating…"
        tone="primary"
      />
      <ConfirmDialog
        {...change('unpublish')}
        title={`Unpublish ${name}?`}
        description="The recipe will be hidden from users immediately. It returns to draft and can be published again."
        confirmLabel="Unpublish"
        pendingLabel="Unpublishing…"
      />
      <ConfirmDialog
        {...change('archive')}
        title={`Archive ${name}?`}
        description="Archived recipes are hidden from users and the recipe list by default. Nothing is deleted; you can restore it later."
        confirmLabel="Archive"
        pendingLabel="Archiving…"
      />
      <ConfirmDialog
        {...change('restore')}
        title={`Restore ${name}?`}
        description="The recipe will return to the list as a draft. Review it before publishing."
        confirmLabel="Restore"
        pendingLabel="Restoring…"
        tone="primary"
      />
    </>
  )
}
