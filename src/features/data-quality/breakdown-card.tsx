import type { ReactNode } from 'react'
import { EmptyState } from '@/components/shared/empty-state'
import { Panel } from '@/components/shared/panel'
import { ProgressBreakdown, type BreakdownRow } from '@/components/shared/progress-breakdown'
import { QueryBoundary } from '@/components/shared/query-boundary'
import { Skeleton } from '@/components/ui/skeleton'
import { BREAKDOWN_CONFIG } from './data-quality-config'
import type { BreakdownKind, RecipeBreakdown } from './data-quality-types'
import { useRecipeBreakdown } from './use-data-quality'

const toRows = (kind: BreakdownKind, { total, counts }: RecipeBreakdown): BreakdownRow[] =>
  BREAKDOWN_CONFIG[kind].entries.map(({ key, label, colorClass, hint }) => {
    const count = counts[key] ?? 0
    return { key, label, valueLabel: count.toLocaleString('en'), fraction: total === 0 ? 0 : count / total, colorClass, hint }
  })

const BreakdownSkeleton = ({ rowCount }: { rowCount: number }) => (
  <div className="flex flex-col gap-4" aria-busy>
    {Array.from({ length: rowCount }, (_, index) => (
      <Skeleton key={index} className="h-9 w-full" />
    ))}
  </div>
)

type BreakdownCardProps = {
  kind: BreakdownKind
  /** Sits in the panel header: a count, or a link to the recipes behind the numbers. */
  headerAction?: ReactNode
}

/** One panel that splits the recipes into groups, e.g. by nutrition status. */
export const BreakdownCard = ({ kind, headerAction }: BreakdownCardProps) => {
  const { data, error, isLoading, refetch } = useRecipeBreakdown(kind)
  const { title, entries } = BREAKDOWN_CONFIG[kind]

  return (
    <Panel title={title} headerAction={headerAction} bodyClassName="flex flex-col justify-center">
      <QueryBoundary
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        loadingFallback={<BreakdownSkeleton rowCount={entries.length} />}
      >
        {data && data.total > 0 ? (
          <ProgressBreakdown rows={toRows(kind, data)} showDots />
        ) : (
          <EmptyState title="No recipes yet" description="Data quality checks will appear once recipes are added." />
        )}
      </QueryBoundary>
    </Panel>
  )
}
