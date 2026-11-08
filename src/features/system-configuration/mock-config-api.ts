import { DEFAULT_CONFIG } from './config-options'
import type { BackupEntry, SectionId, SystemConfig } from './config-types'

/**
 * MOCK: replace each function with a real request. The signatures are what the hooks depend on.
 *
 * Failures on purpose, so every error state can be seen:
 * - Matching & Scoring: saving with a Nutrition fit weight of 15 fails;
 * - General: saving the time zone Asia/Jayapura fails;
 * - Feature Toggles: saving with Bookmarks switched off fails;
 * - Notifications: saving with Reported posts switched off fails;
 * - Backup & Restore: saving a retention of 90 days fails, and restoring the 02 Nov 2026 backup fails.
 */
const MOCK_LATENCY_MS = 600
const MOCK_BACKUP_LATENCY_MS = 1200

export const FAILING_BACKUP_ID = 'backup-3'

const wait = (ms: number = MOCK_LATENCY_MS) => new Promise((resolve) => setTimeout(resolve, ms))

let config: SystemConfig = structuredClone(DEFAULT_CONFIG)

let backups: BackupEntry[] = [
  { id: 'backup-1', createdAt: '2026-11-03T19:00:00.000Z', sizeMb: 12.4, kind: 'scheduled' },
  { id: 'backup-2', createdAt: '2026-11-02T19:00:00.000Z', sizeMb: 12.3, kind: 'scheduled' },
  { id: FAILING_BACKUP_ID, createdAt: '2026-11-02T07:20:00.000Z', sizeMb: 12.3, kind: 'manual' },
]

const WOULD_FAIL: { [K in SectionId]: (value: SystemConfig[K]) => boolean } = {
  matching: (value) => value.nutritionWeight === 15,
  general: (value) => value.timeZone === 'Asia/Jayapura',
  features: (value) => !value.bookmarks,
  notifications: (value) => !value.reportedPosts,
  backup: (value) => value.retention === '90',
}

export const fetchSystemConfig = async (): Promise<SystemConfig> => {
  await wait()
  return structuredClone(config)
}

export const saveConfigSection = async <TSection extends SectionId>(
  section: TSection,
  value: SystemConfig[TSection],
): Promise<SystemConfig[TSection]> => {
  await wait()
  if (WOULD_FAIL[section](value)) throw new Error('Could not save the configuration.')
  config[section] = structuredClone(value)
  return structuredClone(value)
}

export const fetchBackups = async (): Promise<BackupEntry[]> => {
  await wait()
  return structuredClone(backups)
}

export const createBackup = async (): Promise<BackupEntry> => {
  await wait(MOCK_BACKUP_LATENCY_MS)
  const entry: BackupEntry = {
    id: `backup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    sizeMb: 12.5,
    kind: 'manual',
  }
  backups = [entry, ...backups]
  return structuredClone(entry)
}

export const restoreBackup = async (id: string): Promise<BackupEntry> => {
  await wait(MOCK_BACKUP_LATENCY_MS)
  const entry = backups.find((backup) => backup.id === id)
  if (!entry || entry.id === FAILING_BACKUP_ID) throw new Error('Could not restore the backup.')
  return structuredClone(entry)
}
