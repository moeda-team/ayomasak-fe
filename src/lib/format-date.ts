const DAY_FORMAT = (timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone })

const TIME_FORMAT = (timeZone: string) =>
  new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone })

const UTC_DAY = DAY_FORMAT('UTC')
const JAKARTA_DAY = DAY_FORMAT('Asia/Jakarta')
const JAKARTA_TIME = TIME_FORMAT('Asia/Jakarta')

/** "12 Oct 2026", read in UTC (for dates stored as a calendar day). */
export const formatDay = (isoTimestamp: string) => UTC_DAY.format(new Date(isoTimestamp))

/** "12 Oct 2026" in Western Indonesia Time. */
export const formatDayWib = (isoTimestamp: string) => JAKARTA_DAY.format(new Date(isoTimestamp))

/** "14:35 WIB" */
export const formatTimeWib = (isoTimestamp: string) => `${JAKARTA_TIME.format(new Date(isoTimestamp))} WIB`
