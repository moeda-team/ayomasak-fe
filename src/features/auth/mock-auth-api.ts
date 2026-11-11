import type { LoginFormValues } from './login-schema'

export type Session = {
  email: string
  name: string
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super('Email or password is incorrect.')
    this.name = 'InvalidCredentialsError'
  }
}

/** MOCK: replace with the real auth endpoint. Credentials: admin@masakuy.com / masakuy123 */
const MOCK_ACCOUNT = { email: 'admin@masakuy.com', password: 'masakuy123', name: 'Super Admin' }
const MOCK_LATENCY_MS = 600

export const signInRequest = async ({ email, password }: LoginFormValues): Promise<Session> => {
  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))
  const isValid = email.toLowerCase() === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password
  if (!isValid) throw new InvalidCredentialsError()
  return { email: MOCK_ACCOUNT.email, name: MOCK_ACCOUNT.name }
}
