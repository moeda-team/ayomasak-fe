import { z } from 'zod'
import { BAHAN_CATEGORIES, BAHAN_FORMS, BAHAN_STATUSES } from './bahan-types'

/** The select fields start empty, so they are checked as text first and narrowed to the real options after. */
export const bahanFormSchema = z.object({
  name: z.string().trim().min(1, 'Canonical name is required.').max(60, 'Keep the name under 60 characters.'),
  aliases: z.array(z.string()),
  category: z.string().min(1, 'Category is required.').pipe(z.enum(BAHAN_CATEGORIES)),
  form: z.string().min(1, 'Form is required.').pipe(z.enum(BAHAN_FORMS)),
  defaultUnit: z.string().min(1, 'Default unit is required.'),
  isPantry: z.boolean(),
  status: z.enum(BAHAN_STATUSES),
})

/** Raw field values while typing: the selects are empty until one is picked. */
export type BahanFormInput = z.input<typeof bahanFormSchema>

export const EMPTY_BAHAN_FORM: BahanFormInput = {
  name: '',
  aliases: [],
  category: '',
  form: '',
  defaultUnit: '',
  isPantry: false,
  status: 'pending-review',
}
