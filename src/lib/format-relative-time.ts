const FORMATTER = new Intl.RelativeTimeFormat('en', { numeric: 'always' })

const UNITS: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
  { unit: 'day', seconds: 86_400 },
  { unit: 'hour', seconds: 3_600 },
  { unit: 'minute', seconds: 60 },
]

/** "2 hours ago", "yesterday", "just now". Past timestamps only. */
export const formatRelativeTime = (isoTimestamp: string, now: Date = new Date()): string => {
  const elapsedSeconds = Math.max(0, Math.round((now.getTime() - new Date(isoTimestamp).getTime()) / 1000))
  const match = UNITS.find(({ seconds }) => elapsedSeconds >= seconds)
  if (!match) return 'just now'
  return FORMATTER.format(-Math.floor(elapsedSeconds / match.seconds), match.unit)
}
