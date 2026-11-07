import { createFileRoute } from '@tanstack/react-router'
import { PagePlaceholder } from '@/components/shared/page-placeholder'

const SystemConfigurationPage = () => (
  <PagePlaceholder title="System Configuration" description="Configure system-wide settings." />
)

export const Route = createFileRoute('/_app/system-configuration')({
  component: SystemConfigurationPage,
})
