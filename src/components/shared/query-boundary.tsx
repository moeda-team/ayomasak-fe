import type { ReactNode } from 'react'
import { ErrorState } from './error-state'

type QueryBoundaryProps = {
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  loadingFallback: ReactNode
  children: ReactNode
}

/** Renders the loading and error states of a query so each widget only has to describe its loaded state. */
export const QueryBoundary = ({ isLoading, error, onRetry, loadingFallback, children }: QueryBoundaryProps) => {
  if (error) return <ErrorState description={error.message} onRetry={onRetry} />
  if (isLoading) return loadingFallback
  return children
}
