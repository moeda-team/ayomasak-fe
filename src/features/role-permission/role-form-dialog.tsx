import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { FormField } from '@/components/shared/form-field'
import { SegmentedControl, type SegmentedOption } from '@/components/shared/segmented-control'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { CreateRoleInput, RoleSummary } from './role-types'
import { EMPTY_ROLE_FORM, roleFormSchema, type RoleFormInput, type RoleFormOutput } from './role-schema'

const START_FROM_OPTIONS: SegmentedOption<RoleFormInput['startFrom']>[] = [
  { value: 'scratch', label: 'From scratch' },
  { value: 'duplicate', label: 'Duplicate role' },
]

type RoleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; absent when creating. */
  role?: RoleSummary
  /** Roles that can be duplicated from while creating. */
  roles: RoleSummary[]
  isPending: boolean
  /** The name the server rejected as taken; the message shows only while the field still holds it. */
  takenName?: { name: string; message: string }
  onSubmit: (input: CreateRoleInput) => void
}

type RoleFormProps = Omit<RoleFormDialogProps, 'open' | 'onOpenChange'> & { onCancel: () => void }

const RoleForm = ({ role, roles, isPending, takenName, onSubmit, onCancel }: RoleFormProps) => {
  const isEditing = Boolean(role)
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormInput, unknown, RoleFormOutput>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: role ? { ...EMPTY_ROLE_FORM, name: role.name, description: role.description } : EMPTY_ROLE_FORM,
  })

  const startFrom = watch('startFrom')
  const isNameStillTaken = takenName !== undefined && watch('name').trim() === takenName.name
  const nameMessage = errors.name?.message ?? (isNameStillTaken ? takenName.message : undefined)
  const duplicateOptions = roles.map((option) => ({ value: option.id, label: option.name }))

  const submit = ({ name, description, startFrom: source, duplicateFromId }: RoleFormOutput) =>
    onSubmit({ name, description, duplicateFromId: source === 'duplicate' ? duplicateFromId : undefined })

  return (
    <form onSubmit={handleSubmit(submit)} noValidate>
      <div className="flex flex-col gap-4 p-6">
        <FormField htmlFor="role-name" label="Role Name" isRequired error={nameMessage}>
          <Input
            id="role-name"
            placeholder="e.g. Nutrition Specialist"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(nameMessage)}
            aria-describedby={nameMessage ? 'role-name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField htmlFor="role-description" label="Description" error={errors.description?.message}>
          <Input
            id="role-description"
            placeholder="Describe what this role is for (optional)"
            autoComplete="off"
            className="text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'role-description-error' : undefined}
            {...register('description')}
          />
        </FormField>

        {!isEditing && (
          <>
            <div className="flex flex-col gap-2">
              <span className="text-body-sm">Start from</span>
              <Controller
                control={control}
                name="startFrom"
                render={({ field }) => (
                  <SegmentedControl
                    label="Start from"
                    value={field.value}
                    options={START_FROM_OPTIONS}
                    onChange={field.onChange}
                    className="self-start"
                  />
                )}
              />
            </div>

            {startFrom === 'duplicate' && (
              <FormField htmlFor="role-duplicate-from" label="Duplicate from" isRequired error={errors.duplicateFromId?.message}>
                <Controller
                  control={control}
                  name="duplicateFromId"
                  render={({ field }) => (
                    <Combobox
                      id="role-duplicate-from"
                      value={field.value}
                      options={duplicateOptions}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Select a role"
                      searchPlaceholder="Search role"
                      emptyMessage="No role found"
                      isInvalid={Boolean(errors.duplicateFromId)}
                      aria-describedby={errors.duplicateFromId ? 'role-duplicate-from-error' : undefined}
                    />
                  )}
                />
              </FormField>
            )}
          </>
        )}
      </div>

      <DialogFooter className="flex-row justify-end gap-3 px-6 pb-6">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEditing ? 'Saving…' : 'Creating…') : isEditing ? 'Save Changes' : 'Create Role'}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Create and edit share one dialog; `role` switches it to editing. The form remounts on every open. */
export const RoleFormDialog = ({ open, onOpenChange, ...formProps }: RoleFormDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !formProps.isPending && onOpenChange(next)}>
    <DialogContent className="gap-0 p-0 sm:max-w-lg">
      <DialogHeader className="gap-1 p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">{formProps.role ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogDescription className="text-body-sm text-text-secondary">
          {formProps.role ? 'Update the role name and description.' : 'Create a new role and choose how to set its permissions.'}
        </DialogDescription>
      </DialogHeader>
      <RoleForm {...formProps} onCancel={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)
