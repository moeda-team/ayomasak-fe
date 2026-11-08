import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SettingsCardProps = {
  title: string
  description: string
  children: ReactNode
  className?: string
}

/** A titled group of settings: heading and one-line explanation above the controls. */
export const SettingsCard = ({ title, description, children, className }: SettingsCardProps) => (
  <section className={cn('surface-card flex flex-col gap-5 p-6', className)}>
    <header className="flex flex-col gap-1">
      <h2 className="text-heading-3">{title}</h2>
      <p className="text-body-sm text-text-secondary">{description}</p>
    </header>
    {children}
  </section>
)
