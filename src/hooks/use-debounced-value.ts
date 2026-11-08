import { useEffect, useState } from 'react'

/** Follows `value` after it has stopped changing for `delayMs`. */
export const useDebouncedValue = <TValue>(value: TValue, delayMs: number) => {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
