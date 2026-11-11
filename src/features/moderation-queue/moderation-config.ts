import type { FilterOption } from '@/components/shared/single-select-filter'
import type { Tone } from '@/components/shared/tone'
import { REPORT_REASONS, type PostStatus, type ReasonFilter, type ReportReason } from './moderation-types'

export const REASON_LABEL: Record<ReportReason, string> = {
  spam: 'Spam',
  inappropriate: 'Inappropriate',
  misleading: 'Misleading',
  'off-topic': 'Off-topic',
}

export const REASON_TONE: Record<ReportReason, Tone> = {
  spam: 'warning',
  inappropriate: 'info',
  misleading: 'brand',
  'off-topic': 'brand',
}

export const REASON_FILTER_OPTIONS: FilterOption<ReasonFilter>[] = [
  { value: 'all', label: 'All' },
  ...REPORT_REASONS.map((value) => ({ value, label: REASON_LABEL[value] })),
]

export const STATUS_LABEL: Record<PostStatus, string> = {
  reported: 'Reported',
  hidden: 'Hidden',
  removed: 'Removed',
}

export const STATUS_TONE: Record<PostStatus, Tone> = {
  reported: 'warning',
  hidden: 'neutral',
  removed: 'danger',
}
