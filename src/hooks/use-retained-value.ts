import { useEffect, useState } from 'react'

/** Slightly longer than the 200ms exit animation of `Dialog`. */
export const DIALOG_EXIT_MS = 250
/** Slightly longer than the 300ms exit animation of `Sheet`. */
export const DRAWER_EXIT_MS = 350

/**
 * Follows `value`, but after it becomes `null` keeps returning the last non-null value for `exitMs`.
 *
 * A dialog or drawer that is driven by "what to show" state needs this: the moment that state is cleared the
 * content would disappear, so the exit animation would play over an empty or changed panel.
 */
export const useRetainedValue = <TValue>(value: TValue | null, exitMs: number): TValue | null => {
  const [retained, setRetained] = useState(value)

  // Remembering the latest value while rendering is the documented way to derive state from a prop.
  if (value !== null && value !== retained) setRetained(value)

  useEffect(() => {
    if (value !== null) return
    const timer = setTimeout(() => setRetained(null), exitMs)
    return () => clearTimeout(timer)
  }, [value, exitMs])

  return value ?? retained
}
