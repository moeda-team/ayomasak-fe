import { EyeIcon, EyeSlashIcon, WarningCircleIcon } from '@phosphor-icons/react'
import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLoginForm } from './use-login-form'

type LoginFormProps = {
  redirectTo: string | undefined
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const { form, submit, isSubmitting, submitError } = useLoginForm({ redirectTo })
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const { errors } = form.formState

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {submitError && (
        <Alert variant="destructive" role="alert">
          <WarningCircleIcon />
          <AlertDescription>{submitError.message}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">
          Email <span className="text-text-danger">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="yours@email.com"
          className="pointer-coarse:h-11"
          aria-invalid={Boolean(errors.email)}
          {...form.register('email')}
        />
        {errors.email && <p className="text-caption text-text-danger">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">
          Password <span className="text-text-danger">*</span>
        </Label>
        <div className="relative">
          <Input
            id="password"
            type={isPasswordVisible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            className="pr-12 pointer-coarse:h-11"
            aria-invalid={Boolean(errors.password)}
            {...form.register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute top-1/2 right-1 -translate-y-1/2 pointer-coarse:size-10"
            aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
            onClick={() => setIsPasswordVisible((visible) => !visible)}
          >
            {isPasswordVisible ? <EyeSlashIcon /> : <EyeIcon />}
          </Button>
        </div>
        {errors.password && <p className="text-caption text-text-danger">{errors.password.message}</p>}
      </div>

      <Controller
        control={form.control}
        name="keepSignedIn"
        render={({ field }) => (
          <div className="flex items-center gap-3 py-1">
            <Checkbox
              id="keep-signed-in"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
            <Label htmlFor="keep-signed-in">Keep me logged in</Label>
          </div>
        )}
      />

      <Button type="submit" disabled={isSubmitting} className="w-full pointer-coarse:h-11">
        {isSubmitting ? 'Signing in…' : 'Sign In'}
      </Button>

      <p className="text-center text-caption text-text-secondary">
        Forgot password? Please contact our admin at{' '}
        <a href="mailto:support@masakuy.com" className="text-text-brand underline">
          support@masakuy.com
        </a>
      </p>
    </form>
  )
}
