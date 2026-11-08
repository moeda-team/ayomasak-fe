import { z } from 'zod'

export const roleFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter a role name').max(40, 'Keep the name under 40 characters'),
    description: z.string().trim().max(120, 'Keep the description under 120 characters'),
    startFrom: z.enum(['scratch', 'duplicate']),
    duplicateFromId: z.string(),
  })
  .refine((values) => values.startFrom === 'scratch' || values.duplicateFromId !== '', {
    path: ['duplicateFromId'],
    message: 'Select a role to duplicate',
  })

export type RoleFormInput = z.input<typeof roleFormSchema>
export type RoleFormOutput = z.output<typeof roleFormSchema>

export const EMPTY_ROLE_FORM: RoleFormInput = {
  name: '',
  description: '',
  startFrom: 'scratch',
  duplicateFromId: '',
}
