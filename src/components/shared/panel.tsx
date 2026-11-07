import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PanelProps = {
  title: string
  headerAction?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}

/** Bordered surface with a titled header, used for dashboard widgets and other grouped content. */
export const Panel = ({ title, headerAction, children, className, bodyClassName }: PanelProps) => (
  <section
    className={cn(
      'flex min-w-0 flex-col overflow-hidden rounded-lg border border-border-default bg-surface-default shadow-raised',
      className,
    )}
  >
    <header className="flex min-h-14 items-center justify-between gap-3 border-b border-border-default px-5 py-2">
      <h2 className="text-heading-3">{title}</h2>
      {headerAction}
    </header>
    <div className={cn('flex-1 p-5', bodyClassName)}>{children}</div>
  </section>
)
