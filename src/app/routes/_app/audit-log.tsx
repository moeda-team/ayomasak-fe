import { createFileRoute } from '@tanstack/react-router'
import { AuditLogPage } from '@/features/audit-log/audit-log-page'

export const Route = createFileRoute('/_app/audit-log')({
  component: AuditLogPage,
})
