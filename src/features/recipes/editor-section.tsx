import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type EditorSectionProps = {
  title: string
  description?: string
  /** Button or badge on the right of the heading. */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** The white card that holds one group of editor fields. */
export const EditorSection = ({ title, description, action, children, className }: EditorSectionProps) => (
  <section className={cn('surface-card flex flex-col gap-4 p-5', className)}>
    <header className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <h2 className="text-body-strong">{title}</h2>
        {description && <p className="text-caption text-text-secondary">{description}</p>}
      </div>
      {action}
    </header>
    {children}
  </section>
)
