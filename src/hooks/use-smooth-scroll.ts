import { useEffect } from 'react'
import { startSmoothScroll } from '@/lib/smooth-scroll'

/** Enables smooth wheel scrolling for as long as the calling component is mounted. */
export const useSmoothScroll = () => {
  useEffect(() => startSmoothScroll(), [])
}
