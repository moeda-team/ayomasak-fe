import type { Tone } from '@/components/shared/tone'
import type { AuditAction, AuditEntityType, AuditStatus } from './audit-types'

export const ENTITY_LABEL: Record<AuditEntityType, string> = {
  recipe: 'Recipe',
  'master-bahan': 'Master Bahan',
  'nutrition-info': 'NutritionInfo',
  'master-equipment': 'Master Equipment',
  role: 'Role',
  config: 'Config',
}

export const ACTION_LABEL: Record<AuditAction, string> = {
  published: 'Published',
  updated: 'Updated',
  rejected: 'Rejected',
  approved: 'Approved',
}

export const ACTION_TONE: Record<AuditAction, Tone> = {
  published: 'success',
  updated: 'info',
  rejected: 'danger',
  approved: 'success',
}

export const STATUS_LABEL: Record<AuditStatus, string> = {
  success: 'Success',
  failed: 'Failed',
}

export const STATUS_TONE: Record<AuditStatus, Tone> = {
  success: 'success',
  failed: 'danger',
}

export const ACTION_OPTIONS = (Object.keys(ACTION_LABEL) as AuditAction[]).map((value) => ({ value, label: ACTION_LABEL[value] }))
export const STATUS_OPTIONS = (Object.keys(STATUS_LABEL) as AuditStatus[]).map((value) => ({ value, label: STATUS_LABEL[value] }))
