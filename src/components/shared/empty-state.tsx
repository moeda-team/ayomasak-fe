import { TrayIcon, type Icon } from '@phosphor-icons/react'
import type { ReactNode } from 'react'

type EmptyStateProps = {
  title: string
  description?: string
  icon?: Icon
  action?: ReactNode
}

export const EmptyState = ({ title, description, icon: IconComponent = TrayIcon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-surface-brand-subtle text-text-brand">
      <IconComponent className="size-6" aria-hidden />
    </span>
    <h2 className="text-heading-3">{title}</h2>
    {description && <p className="max-w-md text-body text-text-secondary">{description}</p>}
    {action}
  </div>
)
