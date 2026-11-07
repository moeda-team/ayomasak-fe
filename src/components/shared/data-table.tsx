import { tableFeatures, useTable, type ColumnDef, type RowData } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { EmptyState } from './empty-state'
import { ErrorState } from './error-state'

/** Core features only for now; add sorting/filtering/pagination features here when pages need them. */
const features = tableFeatures({})

export type DataTableColumn<TData extends RowData> = ColumnDef<typeof features, TData>

const SKELETON_ROW_COUNT = 5

type DataTableProps<TData extends RowData> = {
  columns: DataTableColumn<TData>[]
  data: TData[]
  isLoading?: boolean
  error?: Error | null
  onRetry?: () => void
  emptyState?: ReactNode
}

export const DataTable = <TData extends RowData>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyState = <EmptyState title="No data yet" description="There is nothing to show here." />,
}: DataTableProps<TData>) => {
  const table = useTable({ features, columns, data })

  if (error) return <ErrorState description={error.message} onRetry={onRetry} />
  if (!isLoading && data.length === 0) return emptyState

  return (
    <div className="overflow-hidden rounded-lg border border-border-default bg-surface-default shadow-raised">
      <Table>
        <TableHeader className="bg-surface-subtle">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-body-sm text-text-primary">
                  {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((_, columnIndex) => (
                    <TableCell key={columnIndex}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getAllCells().map((cell) => (
                    <TableCell key={cell.id} className="text-body-sm">
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  )
}
