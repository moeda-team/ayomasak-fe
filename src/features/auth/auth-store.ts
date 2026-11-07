import { useSyncExternalStore } from 'react'
import type { Session } from './mock-auth-api'

const STORAGE_KEY = 'raos.session'

export type AuthStore = {
  getSession: () => Session | null
  signIn: (session: Session, options: { persist: boolean }) => void
  signOut: () => void
  subscribe: (listener: () => void) => () => void
}

const isSession = (value: unknown): value is Session =>
  typeof value === 'object' &&
  value !== null &&
  'email' in value &&
  typeof value.email === 'string' &&
  'name' in value &&
  typeof value.name === 'string'

const readStoredSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    return isSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

const createAuthStore = (): AuthStore => {
  let session = readStoredSession()
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((listener) => listener())

  return {
    getSession: () => session,
    signIn: (nextSession, { persist }) => {
      session = nextSession
      const storage = persist ? localStorage : sessionStorage
      storage.setItem(STORAGE_KEY, JSON.stringify(nextSession))
      notify()
    },
    signOut: () => {
      session = null
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      notify()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

export const authStore = createAuthStore()

export const useSession = (): Session | null =>
  useSyncExternalStore(authStore.subscribe, authStore.getSession)
