export const SECTION_IDS = ['matching', 'general', 'features', 'notifications', 'backup'] as const
export type SectionId = (typeof SECTION_IDS)[number]

/** Percentages. `null` while the field is empty, so the form can say "required" instead of reading it as 0. */
export type MatchingConfig = {
  exact: number | null
  near: number | null
  weak: number | null
  ingredientWeight: number | null
  equipmentWeight: number | null
  nutritionWeight: number | null
}

export type LanguageId = 'id' | 'en'
export type TimeZoneId = 'Asia/Jakarta' | 'Asia/Makassar' | 'Asia/Jayapura'
export type DateFormatId = 'dd-mmm-yyyy' | 'dd/mm/yyyy' | 'yyyy-mm-dd'
export type PantryMode = 'available' | 'required' | 'ignored'
export type ResultsPerPage = '10' | '20' | '50'

export type GeneralConfig = {
  language: LanguageId
  timeZone: TimeZoneId
  dateFormat: DateFormatId
  pantryItems: PantryMode
  resultsPerPage: ResultsPerPage
}

export const FEATURE_IDS = ['cookingSharing', 'nutrition', 'mediaUploads', 'bookmarks', 'analytics'] as const
export type FeatureId = (typeof FEATURE_IDS)[number]

export const NOTIFICATION_IDS = ['recipesAwaitingReview', 'reportedPosts', 'staleNutrition', 'unmappedInput'] as const
export type NotificationId = (typeof NOTIFICATION_IDS)[number]

export type BackupFrequency = 'daily' | 'weekly' | 'monthly'
export type BackupRetention = '7' | '14' | '30' | '90'
/** Hour of day, "00" to "23". */
export type BackupHour = string

export type BackupSchedule = {
  frequency: BackupFrequency
  retention: BackupRetention
  hour: BackupHour
}

export type SystemConfig = {
  matching: MatchingConfig
  general: GeneralConfig
  features: Record<FeatureId, boolean>
  notifications: Record<NotificationId, boolean>
  backup: BackupSchedule
}

export type BackupKind = 'scheduled' | 'manual'

export type BackupEntry = {
  id: string
  /** ISO timestamp. */
  createdAt: string
  sizeMb: number
  kind: BackupKind
}
