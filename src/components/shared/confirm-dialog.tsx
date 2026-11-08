import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  /** Label while the action runs, e.g. "Deleting…". */
  pendingLabel: string
  isPending: boolean
  onConfirm: () => void
  /** Extra content under the description, e.g. a note about the consequence. */
  children?: ReactNode
}

/** Confirmation for a destructive action. It cannot be dismissed while the action is running. */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  children,
}: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
    <DialogContent className="gap-0 p-0 sm:max-w-md" showCloseButton={false}>
      <DialogHeader className="gap-1 p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">{title}</DialogTitle>
        <DialogDescription className="text-body text-text-secondary">{description}</DialogDescription>
      </DialogHeader>
      {children && <div className="px-6 pb-2">{children}</div>}
      <DialogFooter className="flex-row justify-end gap-3 px-6 pt-2 pb-6">
        <Button variant="outline" disabled={isPending} onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button
          disabled={isPending}
          onClick={onConfirm}
          className="bg-status-danger text-text-inverse hover:bg-status-danger/90"
        >
          {isPending ? pendingLabel : confirmLabel}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
