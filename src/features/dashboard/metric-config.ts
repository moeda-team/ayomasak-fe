import { ClockCountdownIcon, LinkBreakIcon, NotePencilIcon, WarningOctagonIcon, type Icon } from '@phosphor-icons/react'
import type { Tone } from '@/components/shared/tone'
import type { NavPath } from '@/features/navigation/nav-items'
import type { MetricKey } from './dashboard-types'

type MetricConfig = {
  label: string
  icon: Icon
  iconTone: Tone
  trendTone: Tone
  /** Where the card's "View" button goes. */
  destination: NavPath
}

/** All four metrics are problems to burn down, so a drop is good news. */
export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  'draft-recipes': {
    label: 'Draft Recipes',
    icon: NotePencilIcon,
    iconTone: 'brand',
    trendTone: 'brand',
    destination: '/recipes',
  },
  'publish-blockers': {
    label: 'Publish Blockers',
    icon: WarningOctagonIcon,
    iconTone: 'danger',
    trendTone: 'danger',
    destination: '/review-queue',
  },
  'stale-nutrition': {
    label: 'Stale Nutrition',
    icon: ClockCountdownIcon,
    iconTone: 'warning',
    trendTone: 'warning',
    destination: '/review-queue',
  },
  'unmapped-input': {
    label: 'Unmapped Input',
    icon: LinkBreakIcon,
    iconTone: 'info',
    trendTone: 'success',
    destination: '/master-bahan',
  },
}
