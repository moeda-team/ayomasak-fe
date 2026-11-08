import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type DetailSectionProps = {
  title: string
  children: ReactNode
  className?: string
}

/** Titled block inside a drawer. */
export const DetailSection = ({ title, children, className }: DetailSectionProps) => (
  <section className={cn('flex flex-col gap-2', className)}>
    <h3 className="text-body-strong">{title}</h3>
    {children}
  </section>
)

/** Soft bordered surface that holds rows or a person. */
export const DetailCard = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn('rounded-lg border border-border-default bg-surface-subtle p-4', className)}>{children}</div>
)

type DetailListProps = {
  children: ReactNode
}

/** Label / value rows, aligned in two columns. */
export const DetailList = ({ children }: DetailListProps) => (
  <dl className="grid grid-cols-[6.5rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-3 px-1 text-body-sm">{children}</dl>
)

export const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <dt className="text-text-secondary">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </>
)
