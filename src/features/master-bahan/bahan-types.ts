import { MASTER_STATUSES, type MasterStatus } from '@/features/master-data/master-status'

export const BAHAN_CATEGORIES = ['bumbu', 'protein', 'sayur', 'buah', 'karbohidrat', 'saus'] as const
export type BahanCategory = (typeof BAHAN_CATEGORIES)[number]

export const BAHAN_FORMS = ['segar', 'biji', 'cair', 'padat', 'pasta', 'bubuk'] as const
export type BahanForm = (typeof BAHAN_FORMS)[number]

export const BAHAN_STATUSES = MASTER_STATUSES
export type BahanStatus = MasterStatus

export type Bahan = {
  id: string
  /** The one name recipes and matching use. */
  name: string
  /** Other names or spellings users may type. */
  aliases: string[]
  category: BahanCategory
  form: BahanForm
  defaultUnit: string
  /** Assumed to be in a typical kitchen, so matching does not require it. */
  isPantry: boolean
  status: BahanStatus
}

export type PantryFilter = 'all' | 'pantry' | 'non-pantry'

export type BahanListParams = {
  search: string
  categories: BahanCategory[]
  form: BahanForm | 'all'
  status: BahanStatus | 'all'
  pantry: PantryFilter
  /** 1-based. */
  page: number
  pageSize: number
}

export type BahanListResult = {
  items: Bahan[]
  total: number
}

export type BahanCategoryCount = {
  category: BahanCategory
  count: number
}

/** What the add and edit form submits. A new bahan always starts as pending review, whatever `status` says. */
export type BahanFormValues = Omit<Bahan, 'id'>

/** An existing bahan whose name or alias is the one being typed. */
export type BahanDuplicate = {
  bahan: Bahan
  /** Set when the typed name matched an alias rather than the canonical name. */
  matchedAlias?: string
}
