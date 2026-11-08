import type { ReactNode } from 'react'

type SelectionBarProps = {
  /** "3 Users selected" */
  message: string
  action: ReactNode
}

/** Appears above a table while rows are selected. */
export const SelectionBar = ({ message, action }: SelectionBarProps) => (
  <div
    role="status"
    className="flex items-center justify-between gap-3 rounded-lg bg-status-danger-subtle px-4 py-3 text-body-sm"
  >
    <span>{message}</span>
    {action}
  </div>
)
