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
  /** Dims the rows while a new page or filter is loading over the old data. */
  isRefreshing?: boolean
  /** Stable id per row, so row state survives re-sorting and paging. */
  getRowId?: (row: TData) => string
  rowClassName?: (row: TData) => string | undefined
}

export const DataTable = <TData extends RowData>({
  columns,
  data,
  isLoading = false,
  error = null,
  onRetry,
  emptyState = <EmptyState title="No data yet" description="There is nothing to show here." />,
  isRefreshing = false,
  getRowId,
  rowClassName,
}: DataTableProps<TData>) => {
  const table = useTable({ features, columns, data, getRowId })

  if (error) return <ErrorState description={error.message} onRetry={onRetry} />
  if (!isLoading && data.length === 0) return emptyState

  return (
    <div className="surface-card overflow-hidden">
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
        <TableBody className={isRefreshing ? "opacity-60 transition-opacity" : "transition-opacity"}>
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
                <TableRow key={row.id} className={rowClassName?.(row.original)}>
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
