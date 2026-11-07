import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const AuditLogPage = () => (
  <PagePlaceholder title="Audit Log" description="Track critical actions performed in the admin console." />
)

export const Route = createFileRoute('/_app/audit-log')({
  component: AuditLogPage,
})
