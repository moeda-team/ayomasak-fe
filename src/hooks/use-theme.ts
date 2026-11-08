import { useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'raos.theme'
const listeners = new Set<() => void>()

const readStoredTheme = (): Theme | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : null
  } catch {
    return null
  }
}

const DEFAULT_THEME: Theme = 'dark'

const getTheme = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

/** Applies the saved theme, or dark when the user has not chosen one. Called once at startup; index.html does the same earlier to avoid a flash. */
export const initTheme = () => applyTheme(readStoredTheme() ?? DEFAULT_THEME)

const setTheme = (theme: Theme) => {
  applyTheme(theme)
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Storage can be blocked (private mode); the theme still applies for this session.
  }
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useTheme = () => {
  const theme = useSyncExternalStore(subscribe, getTheme)
  return { theme, setTheme }
}
