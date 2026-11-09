import { CheckCircleIcon, CookingPotIcon, ThumbsDownIcon, UserFocusIcon, type Icon } from '@phosphor-icons/react'
import type { RangeOption } from '@/components/shared/range-select'
import type { BetterWhen } from '@/components/shared/metric-card'
import type { Tone } from '@/components/shared/tone'
import type { AnalyticsMetricKey, AnalyticsRange } from './analytics-types'

type AnalyticsMetricConfig = {
  label: string
  icon: Icon
  iconTone: Tone
  trendTone: Tone
  /** Whether a rise is good news: bad feedback is the one rate that should go down. */
  betterWhen: BetterWhen
}

export const ANALYTICS_METRIC_CONFIG: Record<AnalyticsMetricKey, AnalyticsMetricConfig> = {
  'recommendation-ctr': { label: 'Recommendation CTR', icon: UserFocusIcon, iconTone: 'brand', trendTone: 'brand', betterWhen: 'higher' },
  'cooking-start-rate': { label: 'Cooking Start Rate', icon: CookingPotIcon, iconTone: 'danger', trendTone: 'danger', betterWhen: 'higher' },
  'completion-rate': { label: 'Completion Rate', icon: CheckCircleIcon, iconTone: 'warning', trendTone: 'warning', betterWhen: 'higher' },
  'bad-rec-feedback': { label: 'Bad Rec Feedback', icon: ThumbsDownIcon, iconTone: 'info', trendTone: 'success', betterWhen: 'lower' },
}

export const DEFAULT_RANGE: AnalyticsRange = '30'

export const RANGE_DAYS: Record<AnalyticsRange, number> = { '7': 7, '30': 30, '90': 90 }

export const RANGE_OPTIONS: RangeOption<AnalyticsRange>[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
]
