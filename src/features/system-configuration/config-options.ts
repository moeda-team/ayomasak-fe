import type { ComboboxOption } from '@/components/shared/combobox'
import type {
  BackupFrequency,
  BackupHour,
  BackupRetention,
  DateFormatId,
  FeatureId,
  LanguageId,
  NotificationId,
  PantryMode,
  ResultsPerPage,
  SectionId,
  SystemConfig,
  TimeZoneId,
} from './config-types'

export const SECTION_LABEL: Record<SectionId, string> = {
  matching: 'Matching & Scoring',
  general: 'General',
  features: 'Feature Toggles',
  notifications: 'Notifications',
  backup: 'Backup & Restore',
}

/** What a section is called inside a sentence ("Your edits to the … will be lost"). */
export const SECTION_NOUN: Record<SectionId, string> = {
  matching: 'matching thresholds and scoring weights',
  general: 'general settings',
  features: 'feature toggles',
  notifications: 'notification settings',
  backup: 'backup schedule',
}

export const SECTION_SAVED_COPY: Record<SectionId, string> = {
  matching: 'Matching thresholds and scoring weights have been updated.',
  general: 'General settings have been updated.',
  features: 'Feature toggles have been updated.',
  notifications: 'Notification settings have been updated.',
  backup: 'The backup schedule has been updated.',
}

export const SECTION_RESET_COPY: Record<SectionId, string> = {
  matching: 'Matching thresholds and scoring weights will return to their defaults.',
  general: 'Localization and recommendation settings will return to their defaults.',
  features: 'Every feature toggle will return to its default.',
  notifications: 'Every notification toggle will return to its default.',
  backup: 'The backup schedule will return to its defaults.',
}

export const LANGUAGE_OPTIONS: ComboboxOption<LanguageId>[] = [
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'en', label: 'English' },
]

export const TIME_ZONE_OPTIONS: ComboboxOption<TimeZoneId>[] = [
  { value: 'Asia/Jakarta', label: 'Asia/Jakarta (WIB)' },
  { value: 'Asia/Makassar', label: 'Asia/Makassar (WITA)' },
  { value: 'Asia/Jayapura', label: 'Asia/Jayapura (WIT)' },
]

export const DATE_FORMAT_OPTIONS: ComboboxOption<DateFormatId>[] = [
  { value: 'dd-mmm-yyyy', label: 'DD MMM YYYY' },
  { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
  { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
]

/** 5 November 2026, shown as the example under the date-format field. */
export const DATE_FORMAT_EXAMPLE: Record<DateFormatId, string> = {
  'dd-mmm-yyyy': '05 Nov 2026',
  'dd/mm/yyyy': '05/11/2026',
  'yyyy-mm-dd': '2026-11-05',
}

export const PANTRY_OPTIONS: ComboboxOption<PantryMode>[] = [
  { value: 'available', label: 'Treat as available' },
  { value: 'required', label: 'Treat as required' },
  { value: 'ignored', label: 'Ignore in matching' },
]

export const RESULTS_PER_PAGE_OPTIONS: ComboboxOption<ResultsPerPage>[] = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '50', label: '50' },
]

export const FREQUENCY_OPTIONS: ComboboxOption<BackupFrequency>[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
]

export const RETENTION_OPTIONS: ComboboxOption<BackupRetention>[] = [
  { value: '7', label: '7 days' },
  { value: '14', label: '14 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
]

export const HOUR_OPTIONS: ComboboxOption<BackupHour>[] = Array.from({ length: 24 }, (_, hour) => {
  const value = String(hour).padStart(2, '0')
  return { value, label: `${value}:00 WIB` }
})

export const FEATURE_COPY: Record<FeatureId, { label: string; description: string }> = {
  cookingSharing: {
    label: 'Cooking result sharing',
    description: 'Let registered users share cooking results. Public posts follow moderation rules.',
  },
  nutrition: {
    label: 'Nutrition recommendation',
    description: 'Enable nutrition target search and the non-medical disclaimer for users.',
  },
  mediaUploads: { label: 'Recipe media uploads', description: 'Allow photo uploads and external video links on recipes.' },
  bookmarks: { label: 'Bookmarks', description: 'Let registered users save their favorite recipes.' },
  analytics: { label: 'Product analytics', description: 'Track search, recommendation, and cooking events.' },
}

export const NOTIFICATION_COPY: Record<NotificationId, { label: string; description: string }> = {
  recipesAwaitingReview: {
    label: 'Recipes awaiting review',
    description: 'Notify reviewers when a draft or revision is ready to publish.',
  },
  reportedPosts: {
    label: 'Reported posts',
    description: 'Notify moderators when a public cooking result is reported.',
  },
  staleNutrition: {
    label: 'Stale nutrition detected',
    description: 'Alert content managers when a recipe needs its nutrition recalculated.',
  },
  unmappedInput: {
    label: 'New unmapped input',
    description: 'Notify reviewers when users enter an ingredient or equipment not in master data.',
  },
}

export const DEFAULT_CONFIG: SystemConfig = {
  matching: { exact: 90, near: 60, weak: 30, ingredientWeight: 50, equipmentWeight: 30, nutritionWeight: 20 },
  general: {
    language: 'id',
    timeZone: 'Asia/Jakarta',
    dateFormat: 'dd-mmm-yyyy',
    pantryItems: 'available',
    resultsPerPage: '10',
  },
  features: { cookingSharing: false, nutrition: true, mediaUploads: true, bookmarks: true, analytics: true },
  notifications: { recipesAwaitingReview: true, reportedPosts: true, staleNutrition: true, unmappedInput: false },
  backup: { frequency: 'daily', retention: '30', hour: '02' },
}
