import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  title?: string
  description?: string
  onRetry?: () => void
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We could not load this content. Please try again.',
  onRetry,
}: ErrorStateProps) => (
  <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <span className="flex size-12 items-center justify-center rounded-full bg-status-danger-subtle text-status-danger">
      <TriangleAlert className="size-6" aria-hidden />
    </span>
    <h2 className="text-heading-3">{title}</h2>
    <p className="max-w-md text-body text-text-secondary">{description}</p>
    {onRetry && (
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
)
