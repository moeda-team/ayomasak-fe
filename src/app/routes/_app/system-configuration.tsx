import { createFileRoute } from '@tanstack/react-router'
import { SystemConfigurationPage } from '@/features/system-configuration/system-configuration-page'

export const Route = createFileRoute('/_app/system-configuration')({
  component: SystemConfigurationPage,
})
