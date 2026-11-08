import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { exportAuditLog, fetchAuditDetail, fetchAuditEntityCounts, fetchAuditLogs, fetchExportCount } from './mock-audit-api'
import type { AuditListParams, ExportScope } from './audit-types'

const AUDIT_KEY = ['audit-log'] as const

export const useAuditLogs = (params: AuditListParams) =>
  useQuery({
    queryKey: [...AUDIT_KEY, 'list', params],
    queryFn: () => fetchAuditLogs(params),
    placeholderData: keepPreviousData,
  })

export const useAuditEntityCounts = () =>
  useQuery({ queryKey: [...AUDIT_KEY, 'entity-counts'], queryFn: fetchAuditEntityCounts, staleTime: 5 * 60_000 })

/** Loads the before/after detail for the open drawer; idle while no entry is selected. */
export const useAuditDetail = (logId: string | null) =>
  useQuery({
    queryKey: [...AUDIT_KEY, 'detail', logId],
    queryFn: () => fetchAuditDetail(logId ?? ''),
    enabled: logId !== null,
    retry: false,
  })

export const useExportCount = (scope: ExportScope, params: AuditListParams) =>
  useQuery({ queryKey: [...AUDIT_KEY, 'export-count', scope, params], queryFn: () => fetchExportCount(scope, params) })

/** Hands the CSV to the browser as a download. */
const downloadCsv = (filename: string, csv: string) => {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export const useExportAuditLog = () =>
  useMutation({
    mutationFn: ({ scope, params }: { scope: ExportScope; params: AuditListParams }) => exportAuditLog(scope, params),
    onSuccess: ({ filename, csv }) => {
      downloadCsv(filename, csv)
      notify.success({ title: 'Export Ready', description: `${filename} has been downloaded.` })
    },
    onError: () =>
      notify.error({ title: 'Failed to Export Audit Log', description: 'The export could not be created. Please try again.' }),
  })
