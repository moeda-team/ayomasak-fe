import { CheckCircleIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ToastKind = 'success' | 'error'

type ToastCardProps = {
  kind: ToastKind
  title: string
  description: string
  onDismiss: () => void
}

const KIND_ICON = { success: CheckCircleIcon, error: WarningCircleIcon } as const
const KIND_ICON_CLASS = { success: 'text-status-success', error: 'text-status-danger' } as const

/** Card used for every toast (see `notify`). */
export const ToastCard = ({ kind, title, description, onDismiss }: ToastCardProps) => {
  const IconComponent = KIND_ICON[kind]

  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className="relative flex w-[min(22rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-border-default bg-surface-default p-4 shadow-overlay"
    >
      <IconComponent weight="regular" aria-hidden className={cn('mt-0.5 size-5 shrink-0', KIND_ICON_CLASS[kind])} />
      <div className="flex min-w-0 flex-1 flex-col gap-1 pr-6">
        <p className="text-body-strong">{title}</p>
        <p className="text-body-sm text-text-secondary">{description}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-fit rounded-sm text-body-sm text-text-disabled hover:text-text-secondary"
        >
          Dismiss
        </button>
      </div>
      <button
        type="button"
        aria-label="Close notification"
        onClick={onDismiss}
        className="absolute top-3 right-3 rounded-sm p-1 text-text-primary hover:bg-surface-subtle"
      >
        <XIcon className="size-4" aria-hidden />
      </button>
    </div>
  )
}
