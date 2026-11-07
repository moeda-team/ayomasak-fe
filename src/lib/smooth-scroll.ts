import { animate, motionValue } from 'motion'

/**
 * Smooth wheel scrolling for the page, driven by a Motion spring.
 *
 * Each mouse-wheel notch moves a target position; the page chases it with a critically damped spring,
 * so rapid notches build up momentum and the page glides to a stop without overshooting.
 *
 * It deliberately stays out of the way of:
 * - trackpads (they already scroll smoothly), touch, keyboard, scrollbar drags and pinch-zoom
 * - scrollable regions inside the page (popover lists, tables with their own scroll)
 * - open modal dialogs and menus (body scroll lock)
 * - `prefers-reduced-motion: reduce`
 */

const SPRING = { type: 'spring', stiffness: 70, damping: 18, mass: 1, restDelta: 0.5 } as const
const LINE_HEIGHT_PX = 16
const DOM_DELTA_LINE = 1
const DOM_DELTA_PAGE = 2
/** Trackpads and high-resolution wheels report small deltas and smooth themselves; notched wheels report ~100. */
const MIN_WHEEL_NOTCH_PX = 40
/** Distance between our own writes and the real position above which we assume something else scrolled. */
const EXTERNAL_SCROLL_TOLERANCE_PX = 1.5

const maxScrollY = () => document.documentElement.scrollHeight - window.innerHeight

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const toPixels = (event: WheelEvent) => {
  if (event.deltaMode === DOM_DELTA_LINE) return event.deltaY * LINE_HEIGHT_PX
  if (event.deltaMode === DOM_DELTA_PAGE) return event.deltaY * window.innerHeight
  return event.deltaY
}

/** True when the wheel is over an element that can still scroll in that direction on its own. */
const hasScrollableAncestor = (start: EventTarget | null, deltaY: number) => {
  let element = start instanceof Element ? start : null
  while (element && element !== document.body && element !== document.documentElement) {
    const { overflowY } = getComputedStyle(element)
    const isScrollable = (overflowY === 'auto' || overflowY === 'scroll') && element.scrollHeight > element.clientHeight
    if (isScrollable) {
      const isAtTop = element.scrollTop <= 0
      const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
      if ((deltaY < 0 && !isAtTop) || (deltaY > 0 && !isAtBottom)) return true
    }
    element = element.parentElement
  }
  return false
}

const isFineGrained = (event: WheelEvent) => event.deltaMode === 0 && Math.abs(event.deltaY) < MIN_WHEEL_NOTCH_PX

const shouldIgnore = (event: WheelEvent, deltaY: number) =>
  event.defaultPrevented ||
  event.ctrlKey ||
  Math.abs(event.deltaX) > Math.abs(deltaY) ||
  isFineGrained(event) ||
  document.body.hasAttribute('data-scroll-locked') ||
  hasScrollableAncestor(event.target, deltaY)

/** Starts smooth scrolling and returns a function that stops it. */
export const startSmoothScroll = () => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const position = motionValue(window.scrollY)
  let controls: ReturnType<typeof animate> | null = null
  let target = window.scrollY
  let lastWritten = window.scrollY

  const stopAnimation = () => {
    controls?.stop()
    controls = null
  }

  const unsubscribe = position.on('change', (latest) => {
    lastWritten = latest
    window.scrollTo(0, latest)
  })

  const handleWheel = (event: WheelEvent) => {
    if (reducedMotion.matches) return
    const deltaY = toPixels(event)
    if (shouldIgnore(event, deltaY)) return

    const isAnimating = controls !== null
    const base = isAnimating ? target : window.scrollY
    const next = clamp(base + deltaY, 0, maxScrollY())
    if (next === base) return

    event.preventDefault()
    if (!isAnimating) position.jump(window.scrollY)
    target = next
    controls = animate(position, next, {
      ...SPRING,
      onComplete: () => {
        controls = null
      },
    })
  }

  /** Keyboard, scrollbar drag, touch and links also scroll the page; follow them instead of fighting them. */
  const handleScroll = () => {
    if (Math.abs(window.scrollY - lastWritten) <= EXTERNAL_SCROLL_TOLERANCE_PX) return
    stopAnimation()
    position.jump(window.scrollY)
    target = window.scrollY
    lastWritten = window.scrollY
  }

  window.addEventListener('wheel', handleWheel, { passive: false })
  window.addEventListener('scroll', handleScroll, { passive: true })

  return () => {
    window.removeEventListener('wheel', handleWheel)
    window.removeEventListener('scroll', handleScroll)
    stopAnimation()
    unsubscribe()
  }
}
