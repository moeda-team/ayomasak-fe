/**
 * MOCK: replace with a real upload that reports progress. The callbacks are what the media tab depends on.
 *
 * A photo fails when it is not a JPG or PNG, is over 5 MB, or has "bad" in its name, so the failed state can be
 * seen without a broken backend. A video fails the same way when it is over 100 MB or has "bad" in its name.
 */
const TICK_MS = 140
const STEP_PERCENT = 14
const FAIL_AT_PERCENT = 45

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024

export const PHOTO_ACCEPT = 'image/jpeg,image/png'
export const VIDEO_ACCEPT = 'video/mp4'

export const photoWillFail = (file: File) =>
  !['image/jpeg', 'image/png'].includes(file.type) || file.size > MAX_PHOTO_BYTES || file.name.toLowerCase().includes('bad')

export const videoWillFail = (file: File) => file.type !== 'video/mp4' || file.size > MAX_VIDEO_BYTES || file.name.toLowerCase().includes('bad')

type UploadCallbacks = {
  onProgress: (percent: number) => void
  onDone: () => void
  onFail: () => void
}

export const simulateUpload = (shouldFail: boolean, { onProgress, onDone, onFail }: UploadCallbacks) => {
  let percent = 0
  const tick = () => {
    percent = Math.min(100, percent + STEP_PERCENT)
    if (shouldFail && percent >= FAIL_AT_PERCENT) return onFail()
    if (percent >= 100) return onDone()
    onProgress(percent)
    setTimeout(tick, TICK_MS)
  }
  setTimeout(tick, TICK_MS)
}

export const isSupportedVideoLink = (link: string) => {
  try {
    const { hostname, protocol } = new URL(link.trim())
    if (protocol !== 'https:' && protocol !== 'http:') return false
    return ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'vimeo.com', 'www.vimeo.com'].includes(hostname.toLowerCase())
  } catch {
    return false
  }
}

/** "youtu.be/nasi-goreng": a short readable name for a pasted link. */
export const labelOfVideoLink = (link: string) => {
  const { hostname, pathname, searchParams } = new URL(link.trim())
  const tail = searchParams.get('v') ?? pathname.replace(/^\/+|\/+$/g, '')
  return `${hostname.replace(/^www\./, '')}/${tail}`.replace(/\/$/, '')
}
