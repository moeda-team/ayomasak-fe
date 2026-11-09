import type { MasterStatus } from '@/features/master-data/master-status'

export const EQUIPMENT_CATEGORIES = ['masak', 'elektronik', 'potong', 'ukur', 'sajikan'] as const
export type EquipmentCategory = (typeof EQUIPMENT_CATEGORIES)[number]

/** A piece of equipment named by another; enough to show it without loading the whole record. */
export type EquipmentRef = {
  id: string
  name: string
}

export type Equipment = {
  id: string
  /** The one name recipes and matching use. */
  name: string
  /** Other names or spellings users may type. */
  aliases: string[]
  category: EquipmentCategory
  /** Tools that can stand in when this one is not available. */
  alternatives: EquipmentRef[]
  status: MasterStatus
}

export type AlternativeFilter = 'any' | 'has' | 'none'

export type EquipmentListParams = {
  search: string
  categories: EquipmentCategory[]
  status: MasterStatus | 'all'
  alternative: AlternativeFilter
  /** 1-based. */
  page: number
  pageSize: number
}

export type EquipmentListResult = {
  items: Equipment[]
  total: number
}

export type EquipmentCategoryCount = {
  category: EquipmentCategory
  count: number
}

/** What the add and edit form submits. A new equipment always starts as pending review, whatever `status` says. */
export type EquipmentFormValues = {
  name: string
  aliases: string[]
  category: EquipmentCategory
  alternativeIds: string[]
  status: MasterStatus
}

/** An existing equipment whose name or alias is the one being typed. */
export type EquipmentDuplicate = {
  equipment: Equipment
  /** Set when the typed name matched an alias rather than the canonical name. */
  matchedAlias?: string
}
