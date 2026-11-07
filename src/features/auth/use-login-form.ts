import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { authStore } from './auth-store'
import { loginSchema, type LoginFormValues } from './login-schema'
import { signInRequest } from './mock-auth-api'

type UseLoginFormOptions = {
  redirectTo: string | undefined
}

export const useLoginForm = ({ redirectTo }: UseLoginFormOptions) => {
  const router = useRouter()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', keepSignedIn: false },
  })

  const signIn = useMutation({
    mutationFn: signInRequest,
    onSuccess: (session, values) => {
      authStore.signIn(session, { persist: values.keepSignedIn })
      router.history.push(redirectTo ?? '/')
    },
  })

  return {
    form,
    submit: form.handleSubmit((values) => signIn.mutate(values)),
    isSubmitting: signIn.isPending,
    submitError: signIn.error,
  }
}
