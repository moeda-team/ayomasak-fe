import { useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'

/** True once the page has scrolled further than `threshold` pixels. Re-renders only when that flips. */
export const useScrolledPast = (threshold: number) => {
  const { scrollY } = useScroll()
  const [isPast, setIsPast] = useState(() => scrollY.get() > threshold)

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const next = latest > threshold
    setIsPast((previous) => (previous === next ? previous : next))
  })

  return isPast
}
