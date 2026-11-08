import { formatDayWib, formatTimeWib } from '@/lib/format-date'

const DAY_LABEL_LENGTH = 'dd Mmm yyyy'.length

/** "04 Nov 2026, 02:00 WIB" */
export const formatBackupLabel = (isoTimestamp: string) =>
  `${formatDayWib(isoTimestamp).padStart(DAY_LABEL_LENGTH, '0')}, ${formatTimeWib(isoTimestamp)}`
