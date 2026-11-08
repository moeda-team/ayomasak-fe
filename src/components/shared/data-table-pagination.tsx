import { ArrowLeftIcon, ArrowRightIcon } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { CaretDownIcon } from '@phosphor-icons/react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toPageItems } from '@/lib/page-range'
import { cn } from '@/lib/utils'

type DataTablePaginationProps = {
  /** 1-based. */
  page: number
  pageSize: number
  total: number
  pageSizeOptions: number[]
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const DataTablePagination = ({
  page,
  pageSize,
  total,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1
  const last = Math.min(page * pageSize, total)

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 text-body-sm">
      <p className="text-text-secondary tabular-nums">
        Showing {first.toLocaleString('en')}–{last.toLocaleString('en')} of {total.toLocaleString('en')}
      </p>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2 text-text-secondary">
          <span id="rows-per-page">Rows per page:</span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" aria-labelledby="rows-per-page rows-per-page-value" className="w-18 justify-between text-body-sm font-normal text-text-primary">
                <span id="rows-per-page-value">{pageSize}</span>
                <CaretDownIcon aria-hidden />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-18 shadow-overlay">
              <DropdownMenuRadioGroup value={String(pageSize)} onValueChange={(value) => onPageSizeChange(Number(value))}>
                {pageSizeOptions.map((option) => (
                  <DropdownMenuRadioItem key={option} value={String(option)} className="text-body-sm">
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <nav aria-label="Pagination" className="flex items-center gap-1">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
            <ArrowLeftIcon aria-hidden />
            Previous
          </Button>
          {toPageItems(page, pageCount).map((item, index) =>
            item === 'ellipsis' ? (
              <span key={`gap-${index}`} aria-hidden className="w-8 text-center text-text-secondary">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? 'default' : 'ghost'}
                size="icon-sm"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                className={cn('tabular-nums', item !== page && 'text-text-primary')}
                onClick={() => onPageChange(item)}
              >
                {item}
              </Button>
            ),
          )}
          <Button variant="ghost" size="sm" disabled={page >= pageCount} onClick={() => onPageChange(page + 1)}>
            Next
            <ArrowRightIcon aria-hidden />
          </Button>
        </nav>
      </div>
    </div>
  )
}
