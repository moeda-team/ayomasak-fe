import { BookOpen, ClipboardCheck, CookingPot, History, Salad, Settings, type LucideIcon } from 'lucide-react'

export type NavItem = {
  label: string
  to:
    | '/master-bahan'
    | '/master-equipment'
    | '/recipes'
    | '/review-queue'
    | '/audit-log'
    | '/system-configuration'
  icon: LucideIcon
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Content Ops',
    items: [
      { label: 'Master Bahan', to: '/master-bahan', icon: Salad },
      { label: 'Master Equipment', to: '/master-equipment', icon: CookingPot },
      { label: 'Master Menu/Recipe', to: '/recipes', icon: BookOpen },
      { label: 'Review Queue', to: '/review-queue', icon: ClipboardCheck },
    ],
  },
  {
    label: 'Administration',
    items: [
      { label: 'System Configuration', to: '/system-configuration', icon: Settings },
      { label: 'Audit Log', to: '/audit-log', icon: History },
    ],
  },
]
