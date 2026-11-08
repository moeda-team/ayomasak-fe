import type { Tone } from '@/components/shared/tone'
import type { RoleId } from './user-types'

export const ROLE_LABEL: Record<RoleId, string> = {
  'super-admin': 'Super Admin',
  'content-manager': 'Content Manager',
  reviewer: 'Reviewer',
  moderator: 'Moderator',
  'nutrition-specialist': 'Nutrition Specialist',
  'ops-lead': 'Ops Lead',
}

export const ROLE_TONE: Record<RoleId, Tone> = {
  'super-admin': 'brand',
  'content-manager': 'info',
  reviewer: 'danger',
  moderator: 'warning',
  'nutrition-specialist': 'success',
  'ops-lead': 'neutral',
}
