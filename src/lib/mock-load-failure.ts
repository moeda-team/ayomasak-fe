/**
 * MOCK: delete this file together with the mock APIs.
 *
 * Opening the app with `?mock=error` (for example `/system-configuration?mock=error`) makes the first load of
 * every list and detail fail, so the error states can be seen. Pressing "Try again" then succeeds.
 *
 * The switch is read once when the app starts, because navigating inside the app drops the query string.
 * Reload without it to go back to normal.
 */
const IS_LOAD_FAILURE_MOCKED = new URLSearchParams(window.location.search).get('mock') === 'error'

/** The first attempt plus the one automatic retry configured in `query-client.ts`; only then does the error show. */
const FAILED_ATTEMPTS_PER_LOAD = 2

const failedAttempts = new Map<string, number>()

/** Call at the top of a mock fetcher, with a name that is unique to it. */
export const failLoadIfMocked = (name: string) => {
  if (!IS_LOAD_FAILURE_MOCKED) return
  const attempts = failedAttempts.get(name) ?? 0
  if (attempts >= FAILED_ATTEMPTS_PER_LOAD) return
  failedAttempts.set(name, attempts + 1)
  throw new Error('The server could not be reached.')
}
