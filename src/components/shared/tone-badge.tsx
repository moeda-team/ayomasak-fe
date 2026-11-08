import type { ReactNode } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TONE_SURFACE_CLASS, TONE_TEXT_CLASS, type Tone } from './tone'

type ToneBadgeProps = {
  tone: Tone
  children: ReactNode
  className?: string
}

/** Small colored pill for labels such as roles and actions. */
export const ToneBadge = ({ tone, children, className }: ToneBadgeProps) => (
  <Badge
    variant="outline"
    className={cn('border-transparent text-caption whitespace-nowrap', TONE_SURFACE_CLASS[tone], TONE_TEXT_CLASS[tone], className)}
  >
    {children}
  </Badge>
)
