import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notify } from '@/lib/notify'
import { SECTION_SAVED_COPY } from './config-options'
import type { BackupEntry, SectionId, SystemConfig } from './config-types'
import { createBackup, fetchBackups, fetchSystemConfig, restoreBackup, saveConfigSection } from './mock-config-api'
import { formatBackupLabel } from './backup-label'

const CONFIG_KEY = ['system-config'] as const
const BACKUPS_KEY = ['system-config', 'backups'] as const

export const useSystemConfig = () => useQuery({ queryKey: CONFIG_KEY, queryFn: fetchSystemConfig })

export const useBackups = () => useQuery({ queryKey: BACKUPS_KEY, queryFn: fetchBackups })

const withSection = <TSection extends SectionId>(
  current: SystemConfig,
  section: TSection,
  value: SystemConfig[TSection],
): SystemConfig => {
  const next = { ...current }
  next[section] = value
  return next
}

/** Both fields are loose on purpose: the page holds the draft of whichever tab is open. */
type SaveSectionInput = { section: SectionId; value: SystemConfig[SectionId] }

export const useSaveSection = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ section, value }: SaveSectionInput) => saveConfigSection(section, value),
    onSuccess: (value, { section }) => {
      queryClient.setQueryData<SystemConfig>(CONFIG_KEY, (current) => current && withSection(current, section, value))
      notify.success({ title: 'Configuration Saved Successfully!', description: SECTION_SAVED_COPY[section] })
    },
    onError: () =>
      notify.error({
        title: 'Failed to Save Configuration',
        description: 'The configuration could not be saved. Please try again.',
      }),
  })
}

export const useCreateBackup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBackup,
    onSuccess: (entry) => {
      queryClient.setQueryData<BackupEntry[]>(BACKUPS_KEY, (current) => [entry, ...(current ?? [])])
      notify.success({ title: 'Backup Created', description: 'A manual backup of your data is ready to restore.' })
    },
    onError: () =>
      notify.error({ title: 'Failed to Create Backup', description: 'The backup could not be created. Please try again.' }),
  })
}

export const useRestoreBackup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (backup: BackupEntry) => restoreBackup(backup.id),
    onSuccess: (backup) => {
      // Restoring replaces the stored configuration too, so reload it.
      void queryClient.invalidateQueries({ queryKey: CONFIG_KEY })
      notify.success({
        title: 'Backup Restored',
        description: `Data was restored from the backup of ${formatBackupLabel(backup.createdAt)}.`,
      })
    },
    onError: () =>
      notify.error({ title: 'Failed to Restore Backup', description: 'The backup could not be restored. Please try again.' }),
  })
}
