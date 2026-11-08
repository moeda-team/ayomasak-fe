import { CalendarBlankIcon, DownloadSimpleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { SegmentedControl, type SegmentedOption } from '@/components/shared/segmented-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDay } from '@/lib/format-date'
import type { AuditListParams, ExportScope } from './audit-types'
import { useExportAuditLog, useExportCount } from './use-audit-log'

const SCOPE_OPTIONS: SegmentedOption<ExportScope>[] = [
  { value: 'filters', label: 'Current filters' },
  { value: 'all', label: 'All logs' },
]

const toDayLabel = (isoDay: string) => formatDay(`${isoDay}T00:00:00.000Z`)

const toRangeLabel = (scope: ExportScope, { from, to }: AuditListParams) => {
  if (scope === 'all' || !from) return 'All time'
  return to && to !== from ? `${toDayLabel(from)} – ${toDayLabel(to)}` : toDayLabel(from)
}

type ExportDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** What the table is filtered by right now. */
  params: AuditListParams
}

type ExportBodyProps = Omit<ExportDialogProps, 'open' | 'onOpenChange'> & { onClose: () => void }

const ExportBody = ({ params, onClose }: ExportBodyProps) => {
  const [scope, setScope] = useState<ExportScope>('filters')
  const exportLog = useExportAuditLog()
  const { data: count, isLoading: isCounting } = useExportCount(scope, params)

  return (
    <>
      <div className="flex flex-col gap-4 px-6 pb-2">
        <div className="flex flex-col gap-2">
          <span className="text-body-sm">Scope</span>
          <SegmentedControl label="Scope" value={scope} options={SCOPE_OPTIONS} onChange={setScope} className="self-start" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-body-sm">Date range</span>
          <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-body-sm dark:bg-input/30">
            <CalendarBlankIcon aria-hidden className="size-4 shrink-0 text-text-primary" />
            <span>{toRangeLabel(scope, params)}</span>
          </div>
          {isCounting || count === undefined ? (
            <Skeleton className="h-4 w-40" />
          ) : (
            <p className="text-caption text-text-secondary" aria-live="polite">
              {count.toLocaleString('en-US')} {count === 1 ? 'record' : 'records'} will be exported
            </p>
          )}
        </div>
      </div>

      <DialogFooter className="flex-row justify-end gap-3 px-6 pt-4 pb-6">
        <Button variant="outline" disabled={exportLog.isPending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          disabled={exportLog.isPending || count === 0}
          onClick={() => exportLog.mutate({ scope, params }, { onSuccess: onClose })}
        >
          <DownloadSimpleIcon aria-hidden />
          {exportLog.isPending ? 'Exporting…' : 'Export CSV'}
        </Button>
      </DialogFooter>
    </>
  )
}

/** Downloads the log as CSV: either what the table shows now, or everything. */
export const ExportDialog = ({ open, onOpenChange, params }: ExportDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="gap-0 p-0 sm:max-w-lg">
      <DialogHeader className="gap-1 p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">Export Audit Log</DialogTitle>
        <DialogDescription className="text-body-sm text-text-secondary">Download audit log entries as a CSV file.</DialogDescription>
      </DialogHeader>
      <ExportBody params={params} onClose={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)
