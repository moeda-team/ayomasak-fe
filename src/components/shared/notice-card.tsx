import { InfoIcon, WarningIcon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type NoticeCardProps = {
  tone: 'warning' | 'info'
  title: string
  children: ReactNode
  className?: string
}

const NOTICE_ICON = { warning: WarningIcon, info: InfoIcon } as const
const NOTICE_ICON_CLASS = { warning: 'text-status-warning', info: 'text-status-info' } as const

/** Inline note inside a dialog or panel that explains a consequence. */
export const NoticeCard = ({ tone, title, children, className }: NoticeCardProps) => {
  const IconComponent = NOTICE_ICON[tone]
  return (
    <div role="note" className={cn('surface-card flex items-start gap-3 p-4', className)}>
      <IconComponent aria-hidden className={cn('mt-0.5 size-5 shrink-0', NOTICE_ICON_CLASS[tone])} />
      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-body-strong">{title}</p>
        <p className="text-body-sm text-text-secondary">{children}</p>
      </div>
    </div>
  )
}
