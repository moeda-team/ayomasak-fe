import { animate } from 'motion'

/** Strong ease-out from the design tokens (`--ease-out`). */
const EASE_OUT = [0.23, 1, 0.32, 1] satisfies [number, number, number, number]
const MIN_DURATION_SECONDS = 0.35
const MAX_DURATION_SECONDS = 0.8
const SECONDS_PER_PIXEL = 0.0002
const INTERRUPT_EVENTS = ['wheel', 'touchstart', 'keydown'] as const

let activeScroll: ReturnType<typeof animate> | null = null

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Scrolls the page to the top. Longer distances take a little longer, capped so it never feels slow.
 * The user can interrupt it by scrolling, so it never fights their input.
 */
export const scrollToTop = () => {
  activeScroll?.stop()

  const startY = window.scrollY
  if (startY === 0) return

  if (prefersReducedMotion()) {
    window.scrollTo(0, 0)
    return
  }

  const duration = Math.min(MAX_DURATION_SECONDS, Math.max(MIN_DURATION_SECONDS, startY * SECONDS_PER_PIXEL))
  const controls = animate(startY, 0, {
    duration,
    ease: EASE_OUT,
    onUpdate: (latest) => window.scrollTo(0, latest),
  })
  activeScroll = controls

  const stop = () => controls.stop()
  INTERRUPT_EVENTS.forEach((eventName) => window.addEventListener(eventName, stop, { once: true, passive: true }))
  controls.finished.finally(() => {
    INTERRUPT_EVENTS.forEach((eventName) => window.removeEventListener(eventName, stop))
    if (activeScroll === controls) activeScroll = null
  })
}
