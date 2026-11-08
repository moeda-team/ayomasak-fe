import { CaretRightIcon } from '@phosphor-icons/react'
import { Fragment, type ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  /** Trail above the title; the last item is the current page. */
  breadcrumb?: string[]
  action?: ReactNode
  /** Sits between the breadcrumb and the title, e.g. a Back link. */
  back?: ReactNode
}

export const PageHeader = ({ title, description, breadcrumb, action, back }: PageHeaderProps) => (
  <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
    <div className="flex min-w-0 flex-col gap-1">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-body-sm text-text-secondary">
            {breadcrumb.map((label, index) => {
              const isCurrent = index === breadcrumb.length - 1
              return (
                <Fragment key={label}>
                  {index > 0 && <CaretRightIcon className="size-3" aria-hidden />}
                  <li aria-current={isCurrent ? 'page' : undefined} className={isCurrent ? 'text-text-primary' : undefined}>
                    {label}
                  </li>
                </Fragment>
              )
            })}
          </ol>
        </nav>
      )}
      {back}
      <h1 className="text-heading-1 text-balance">{title}</h1>
      {description && <p className="text-body text-text-secondary">{description}</p>}
    </div>
    {action}
  </header>
)
