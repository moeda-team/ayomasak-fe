import { z } from 'zod'
import { MASTER_STATUSES } from '@/features/master-data/master-status'
import { EQUIPMENT_CATEGORIES } from './equipment-types'

/** The category starts empty, so it is checked as text first and narrowed to the real options after. */
export const equipmentFormSchema = z.object({
  name: z.string().trim().min(1, 'Canonical name is required.').max(60, 'Keep the name under 60 characters.'),
  aliases: z.array(z.string()),
  category: z.string().min(1, 'Category is required.').pipe(z.enum(EQUIPMENT_CATEGORIES)),
  alternativeIds: z.array(z.string()),
  status: z.enum(MASTER_STATUSES),
})

/** Raw field values while typing: the category is empty until one is picked. */
export type EquipmentFormInput = z.input<typeof equipmentFormSchema>

export const EMPTY_EQUIPMENT_FORM: EquipmentFormInput = {
  name: '',
  aliases: [],
  category: '',
  alternativeIds: [],
  status: 'pending-review',
}
