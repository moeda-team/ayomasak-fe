export const MODULE_IDS = [
  'master-data',
  'recipes',
  'review-queue',
  'data-quality',
  'audit-log',
  'system-configuration',
] as const

export type ModuleId = (typeof MODULE_IDS)[number]

export const MODULE_LABEL: Record<ModuleId, string> = {
  'master-data': 'Master Data',
  recipes: 'Recipe Management',
  'review-queue': 'Review Queue',
  'data-quality': 'Data Quality',
  'audit-log': 'Audit Log',
  'system-configuration': 'System Configuration',
}

export type AccessLevel = 'none' | 'view' | 'full'

export const ACCESS_LEVELS: { value: AccessLevel; label: string }[] = [
  { value: 'none', label: 'No Access' },
  { value: 'view', label: 'View Only' },
  { value: 'full', label: 'Full Access' },
]
