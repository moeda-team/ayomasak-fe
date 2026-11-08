import { cva, type VariantProps } from 'class-variance-authority'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusBadgeVariants = cva('border-transparent text-caption', {
  variants: {
    status: {
      draft: 'bg-status-warning-subtle text-text-warning',
      published: 'bg-status-info-subtle text-status-info',
      verified: 'bg-status-success-subtle text-text-success',
      inactive: 'bg-surface-subtle text-text-secondary',
      active: 'bg-status-success-subtle text-text-success',
      'non-active': 'bg-status-danger-subtle text-text-danger',
    },
  },
})

export type RecordStatus = NonNullable<VariantProps<typeof statusBadgeVariants>['status']>

const STATUS_LABELS: Record<RecordStatus, string> = {
  draft: 'Draft',
  published: 'Published',
  verified: 'Verified',
  inactive: 'Inactive',
  active: 'Active',
  'non-active': 'Non Active',
}

type StatusBadgeProps = {
  status: RecordStatus
  className?: string
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => (
  <Badge variant="outline" className={cn(statusBadgeVariants({ status }), className)}>
    {STATUS_LABELS[status]}
  </Badge>
)
