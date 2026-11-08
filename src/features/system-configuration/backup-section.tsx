import { CloudArrowUpIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Combobox } from '@/components/shared/combobox'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ErrorState } from '@/components/shared/error-state'
import { FormField } from '@/components/shared/form-field'
import { NoticeCard } from '@/components/shared/notice-card'
import { SettingsCard } from '@/components/shared/settings-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBackupLabel } from './backup-label'
import { FREQUENCY_OPTIONS, HOUR_OPTIONS, RETENTION_OPTIONS } from './config-options'
import type { BackupEntry, BackupKind, BackupSchedule } from './config-types'
import { useBackups, useCreateBackup, useRestoreBackup } from './use-system-config'

const KIND_LABEL: Record<BackupKind, string> = { scheduled: 'Scheduled backup', manual: 'Manual backup' }

type BackupSectionProps = {
  value: BackupSchedule
  onChange: (value: BackupSchedule) => void
}

const BackupRow = ({ backup, onRestore }: { backup: BackupEntry; onRestore: () => void }) => {
  const label = formatBackupLabel(backup.createdAt)
  return (
    <li className="flex items-center justify-between gap-4 rounded-lg border border-border-default px-4 py-3">
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="text-body-sm-strong">{label}</p>
        <p className="text-caption text-text-secondary">
          {backup.sizeMb.toFixed(1)} MB · {KIND_LABEL[backup.kind]} · Completed
        </p>
      </div>
      <Button variant="outline" size="sm" aria-label={`Restore the backup of ${label}`} onClick={onRestore}>
        Restore
      </Button>
    </li>
  )
}

const HistorySkeleton = () => (
  <div className="flex flex-col gap-3" aria-busy>
    {[0, 1, 2].map((row) => (
      <Skeleton key={row} className="h-16 w-full rounded-lg" />
    ))}
  </div>
)

const BackupHistoryCard = () => {
  const { data: backups, error, isLoading, refetch } = useBackups()
  const restore = useRestoreBackup()
  const [target, setTarget] = useState<BackupEntry | null>(null)

  return (
    <SettingsCard title="Backup history" description="Restore a previous backup. Restoring replaces current data.">
      {error ? (
        <ErrorState title="Could not load backups" description={error.message} onRetry={() => void refetch()} />
      ) : isLoading || !backups ? (
        <HistorySkeleton />
      ) : backups.length === 0 ? (
        <p className="py-6 text-center text-body-sm text-text-secondary">No backups yet. Back up now to create the first one.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {backups.map((backup) => (
            <BackupRow key={backup.id} backup={backup} onRestore={() => setTarget(backup)} />
          ))}
        </ul>
      )}

      {target && (
        <ConfirmDialog
          open
          onOpenChange={(open) => !open && setTarget(null)}
          title="Restore this backup?"
          description="This action cannot be undone."
          confirmLabel="Restore backup"
          pendingLabel="Restoring…"
          isPending={restore.isPending}
          onConfirm={() => restore.mutate(target, { onSuccess: () => setTarget(null) })}
        >
          <NoticeCard tone="warning" title="Current data will be replaced">
            Restoring the backup from {formatBackupLabel(target.createdAt)} replaces current recipes, master data, and
            configuration.
          </NoticeCard>
        </ConfirmDialog>
      )}
    </SettingsCard>
  )
}

export const BackupSection = ({ value, onChange }: BackupSectionProps) => {
  const createBackup = useCreateBackup()

  return (
    <>
      <SettingsCard title="Backup schedule" description="Automatic backups of recipes, master data, and system configuration.">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormField htmlFor="backup-frequency" label="Frequency" isRequired hint="How often backups run">
            <Combobox
              id="backup-frequency"
              value={value.frequency}
              options={FREQUENCY_OPTIONS}
              onChange={(frequency) => onChange({ ...value, frequency })}
              placeholder="Select a frequency"
              searchPlaceholder="Search frequency…"
            />
          </FormField>
          <FormField htmlFor="backup-retention" label="Retention" isRequired hint="Older backups are removed automatically">
            <Combobox
              id="backup-retention"
              value={value.retention}
              options={RETENTION_OPTIONS}
              onChange={(retention) => onChange({ ...value, retention })}
              placeholder="Select a period"
              searchPlaceholder="Search period…"
            />
          </FormField>
          <FormField htmlFor="backup-time" label="Backup time" isRequired hint="Runs during low-traffic hours">
            <Combobox
              id="backup-time"
              value={value.hour}
              options={HOUR_OPTIONS}
              onChange={(hour) => onChange({ ...value, hour })}
              placeholder="Select a time"
              searchPlaceholder="Search time…"
            />
          </FormField>
        </div>
        <Button
          variant="outline"
          className="self-start"
          disabled={createBackup.isPending}
          onClick={() => createBackup.mutate()}
        >
          <CloudArrowUpIcon aria-hidden />
          {createBackup.isPending ? 'Backing up…' : 'Back up now'}
        </Button>
      </SettingsCard>

      <BackupHistoryCard />
    </>
  )
}
