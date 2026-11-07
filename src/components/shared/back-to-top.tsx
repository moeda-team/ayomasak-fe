import { ArrowUpIcon } from '@phosphor-icons/react'
import { AnimatePresence, motion } from 'motion/react'
import { Button } from '@/components/ui/button'
import { useScrolledPast } from '@/hooks/use-scrolled-past'
import { scrollToTop } from '@/lib/scroll-to-top'

const SHOW_AFTER_PX = 480

/** Strong ease-out from the design tokens (`--ease-out`). */
const EASE_OUT = [0.23, 1, 0.32, 1] satisfies [number, number, number, number]

export const BackToTop = () => {
  const isVisible = useScrolledPast(SHOW_AFTER_PX)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="back-to-top"
          className="fixed right-6 bottom-6 z-30"
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.18, ease: EASE_OUT }}
        >
          <Button
            variant="outline"
            size="icon"
            aria-label="Back to top"
            className="size-10 rounded-full bg-surface-default shadow-overlay active:scale-95 pointer-coarse:size-11"
            onClick={scrollToTop}
          >
            <ArrowUpIcon className="size-5" aria-hidden />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
