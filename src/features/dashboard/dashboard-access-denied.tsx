import { LockKeyIcon } from '@phosphor-icons/react'
import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { Button } from '@/components/ui/button'

type DashboardAccessDeniedProps = {
  title: string
  description: string
}

/** Shown in place of a dashboard page when the signed-in role lacks the permission to view it. */
export const DashboardAccessDenied = ({ title, description }: DashboardAccessDeniedProps) => (
  <div className="surface-card">
    <EmptyState
      icon={LockKeyIcon}
      title={title}
      description={description}
      action={
        <Button asChild>
          <Link to="/dashboard">Back to Dashboard</Link>
        </Button>
      }
    />
  </div>
)
