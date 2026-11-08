import { z } from 'zod'

const PHONE_SEPARATORS = /[\s-]/g
const INDONESIAN_PHONE = /^\+62\d{9,13}$/

export const userFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter the full name'),
  email: z.email('Enter a valid email address'),
  username: z
    .string()
    .trim()
    .regex(/^[a-z0-9._]{3,30}$/, 'Use 3–30 lowercase letters, numbers, dots or underscores'),
  phone: z
    .string()
    .trim()
    .refine((value) => INDONESIAN_PHONE.test(value.replace(PHONE_SEPARATORS, '')), 'Enter a number like +62 812 3456 7890'),
  roleId: z.string().min(1, 'Select a role'),
  notes: z.string().trim().max(280, 'Keep notes under 280 characters'),
})

/** Raw field values while typing: the role is empty until one is picked. */
export type UserFormInput = z.input<typeof userFormSchema>

export const EMPTY_USER_FORM: UserFormInput = {
  fullName: '',
  email: '',
  username: '',
  phone: '',
  roleId: '',
  notes: '',
}

