import { zodResolver } from '@hookform/resolvers/zod'
import { IdentificationBadgeIcon, PhoneIcon, EnvelopeSimpleIcon, ShieldCheckIcon, UserIcon } from '@phosphor-icons/react'
import { Controller, useForm } from 'react-hook-form'
import { Combobox } from '@/components/shared/combobox'
import { FormField, IconInput } from '@/components/shared/form-field'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useRoleOptions } from './use-users'
import { EMPTY_USER_FORM, userFormSchema, type UserFormInput } from './user-schema'
import type { RoleId, User, UserFormValues } from './user-types'

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present when editing; the form starts from this user. */
  user?: User
  isPending: boolean
  onSubmit: (values: UserFormValues) => void
}

const toFormInput = (user: User | undefined): UserFormInput =>
  user
    ? {
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        phone: user.phone,
        roleId: user.roleId,
        notes: user.notes,
      }
    : EMPTY_USER_FORM

type UserFormProps = Pick<UserFormDialogProps, 'user' | 'isPending' | 'onSubmit'> & {
  onCancel: () => void
}

const UserForm = ({ user, isPending, onSubmit, onCancel }: UserFormProps) => {
  const isEditing = Boolean(user)
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: toFormInput(user),
  })

  const { data: roles = [] } = useRoleOptions()
  const roleOptions = roles.map((role) => ({ value: role.id, label: role.label }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 p-6 sm:grid-cols-2">
        <FormField htmlFor="user-full-name" label="Full Name" isRequired error={errors.fullName?.message}>
          <IconInput
            id="user-full-name"
            icon={UserIcon}
            placeholder="Enter full name"
            autoComplete="off"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'user-full-name-error' : undefined}
            {...register('fullName')}
          />
        </FormField>

        <FormField htmlFor="user-email" label="Email Address" isRequired error={errors.email?.message}>
          <IconInput
            id="user-email"
            icon={EnvelopeSimpleIcon}
            type="email"
            placeholder="Enter email address"
            autoComplete="off"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'user-email-error' : undefined}
            {...register('email')}
          />
        </FormField>

        <FormField htmlFor="user-username" label="Username" isRequired error={errors.username?.message}>
          <IconInput
            id="user-username"
            icon={IdentificationBadgeIcon}
            placeholder="Enter username"
            autoComplete="off"
            autoCapitalize="none"
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'user-username-error' : undefined}
            {...register('username')}
          />
        </FormField>

        <FormField htmlFor="user-role" label="Role" isRequired error={errors.roleId?.message}>
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <Combobox
                id="user-role"
                icon={ShieldCheckIcon}
                value={field.value as RoleId | ''}
                options={roleOptions}
                onChange={field.onChange}
                onBlur={field.onBlur}
                placeholder="Select role"
                searchPlaceholder="Search role"
                emptyMessage="No role found"
                isInvalid={Boolean(errors.roleId)}
                aria-describedby={errors.roleId ? 'user-role-error' : undefined}
              />
            )}
          />
        </FormField>

        <FormField htmlFor="user-phone" label="Phone Number" isRequired error={errors.phone?.message}>
          <IconInput
            id="user-phone"
            icon={PhoneIcon}
            type="tel"
            placeholder="+62"
            autoComplete="off"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'user-phone-error' : undefined}
            {...register('phone')}
          />
        </FormField>

        <FormField htmlFor="user-notes" label="Notes" error={errors.notes?.message}>
          <Textarea
            id="user-notes"
            rows={3}
            placeholder="Add notes about this user (Optional)"
            className="min-h-20 resize-none text-body-sm md:text-body-sm"
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? 'user-notes-error' : undefined}
            {...register('notes')}
          />
        </FormField>
      </div>

      <DialogFooter className="flex-row justify-end gap-3 px-6 pb-6">
        <Button type="button" variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (isEditing ? 'Saving…' : 'Adding…') : isEditing ? 'Save' : 'Add'}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Add and edit share one dialog; `user` switches it to editing. The form remounts on every open, so it never shows stale input. */
export const UserFormDialog = ({ open, onOpenChange, user, isPending, onSubmit }: UserFormDialogProps) => (
  <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
    <DialogContent className="gap-0 p-0 sm:max-w-2xl">
      <DialogHeader className="gap-1 border-b border-border-default p-6 pb-4 text-left">
        <DialogTitle className="text-heading-3">{user ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogDescription className="text-body-sm text-text-secondary">
          {user ? 'Update user details, role.' : 'Create a new user account and assign role.'}
        </DialogDescription>
      </DialogHeader>
      <UserForm user={user} isPending={isPending} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
    </DialogContent>
  </Dialog>
)
