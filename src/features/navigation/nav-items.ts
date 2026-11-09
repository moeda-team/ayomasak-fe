import {
  ClockCounterClockwiseIcon,
  CookingPotIcon,
  DatabaseIcon,
  FlagIcon,
  GearIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  UsersIcon,
  type Icon,
} from '@phosphor-icons/react'

export type NavPath =
  | '/dashboard'
  | '/master-bahan'
  | '/master-equipment'
  | '/review-queue'
  | '/recipes'
  | '/data-quality'
  | '/analytics'
  | '/moderation-queue'
  | '/user-list'
  | '/user-activity'
  | '/role-permission'
  | '/system-configuration'
  | '/audit-log'

export type NavLink = {
  label: string
  to: NavPath
}

export type NavLeaf = NavLink & {
  icon: Icon
}

/** A top-level entry that expands to reveal links. It has no page of its own. */
export type NavParent = {
  label: string
  icon: Icon
  children: NavLink[]
}

export type NavEntry = NavLeaf | NavParent

export type NavGroup = {
  label?: string
  entries: NavEntry[]
}

export const isNavParent = (entry: NavEntry): entry is NavParent => 'children' in entry

export const NAV_GROUPS: NavGroup[] = [
  {
    entries: [
      {
        label: 'Dashboard',
        icon: SquaresFourIcon,
        children: [
          { label: 'Dashboard User', to: '/dashboard' },
          { label: 'Data Quality', to: '/data-quality' },
          { label: 'Dashboard Analytics', to: '/analytics' },
        ],
      },
    ],
  },
  {
    label: 'Content Ops',
    entries: [
      {
        label: 'Master Data',
        icon: DatabaseIcon,
        children: [
          { label: 'Master Bahan', to: '/master-bahan' },
          { label: 'Master Equipment', to: '/master-equipment' },
          { label: 'Review Queue', to: '/review-queue' },
        ],
      },
      { label: 'Recipes', to: '/recipes', icon: CookingPotIcon },
      { label: 'Moderation Queue', to: '/moderation-queue', icon: FlagIcon },
    ],
  },
  {
    label: 'Administration',
    entries: [
      {
        label: 'User Management',
        icon: UsersIcon,
        children: [
          { label: 'User List', to: '/user-list' },
          { label: 'User Activity', to: '/user-activity' },
        ],
      },
      { label: 'Role and Permission', to: '/role-permission', icon: ShieldCheckIcon },
      { label: 'System Configuration', to: '/system-configuration', icon: GearIcon },
      { label: 'Audit Log', to: '/audit-log', icon: ClockCounterClockwiseIcon },
    ],
  },
]
