import { z } from 'zod'
import { CONVERSION_SCOPES, UNIT_STATUSES, UNIT_TYPES } from './unit-types'

/** The select fields start empty, so they are checked as text first and narrowed to the real options after. */
export const unitFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Unit name is required.').max(40, 'Keep the name under 40 characters.'),
    aliases: z.array(z.string()),
    type: z.string().min(1, 'Type is required.').pipe(z.enum(UNIT_TYPES)),
    symbol: z.string().trim().min(1, 'Symbol is required.').max(10, 'Keep the symbol under 10 characters.'),
    isBase: z.boolean(),
    baseUnitId: z.string(),
    status: z.enum(UNIT_STATUSES),
  })
  .superRefine((values, context) => {
    if (!values.isBase && values.baseUnitId === '') {
      context.addIssue({ code: 'custom', path: ['baseUnitId'], message: 'Converts to is required.' })
    }
  })
  .transform((values) => ({ ...values, baseUnitId: values.isBase ? null : values.baseUnitId }))

/** Raw field values while typing: the selects are empty until one is picked. */
export type UnitFormInput = z.input<typeof unitFormSchema>

export const EMPTY_UNIT_FORM: UnitFormInput = {
  name: '',
  aliases: [],
  type: '',
  symbol: '',
  isBase: false,
  baseUnitId: '',
  status: 'active',
}

export const conversionFormSchema = z
  .object({
    fromId: z.string().min(1, 'From unit is required.'),
    toId: z.string().min(1, 'To unit is required.'),
    factor: z
      .string()
      .trim()
      .min(1, 'Factor is required.')
      .transform(Number)
      .pipe(z.number('Factor must be a number.').positive('Factor must be greater than 0.')),
    scope: z.string().min(1, 'Scope is required.').pipe(z.enum(CONVERSION_SCOPES)),
    bahanName: z.string(),
    status: z.enum(UNIT_STATUSES),
  })
  .superRefine((values, context) => {
    if (values.fromId !== '' && values.fromId === values.toId) {
      context.addIssue({ code: 'custom', path: ['toId'], message: 'Choose a different unit than From unit.' })
    }
    if (values.scope === 'per-bahan' && values.bahanName === '') {
      context.addIssue({ code: 'custom', path: ['bahanName'], message: 'Bahan is required for a per-bahan conversion.' })
    }
  })
  .transform((values) => ({ ...values, bahanName: values.scope === 'per-bahan' ? values.bahanName : null }))

export type ConversionFormInput = z.input<typeof conversionFormSchema>

export const EMPTY_CONVERSION_FORM: ConversionFormInput = {
  fromId: '',
  toId: '',
  factor: '',
  scope: '',
  bahanName: '',
  status: 'active',
}
