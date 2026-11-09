/**
 * MOCK: delete this file together with the mock APIs.
 *
 * Opening the app with `?mock=<mode>` (for example `/data-quality?mock=error`) makes the mock APIs return a
 * state that is otherwise hard to reach:
 *
 * - `error`   the first load of every list and detail fails. Pressing "Try again" then succeeds.
 * - `partial` only a few widgets fail (the ones that opt in), the rest of the page loads.
 * - `denied`  the dashboard pages show "no access".
 * - `healthy` Data Quality has nothing left to fix.
 * - `empty`   Data Quality and Analytics have no data yet.
 *
 * The switch is read once when the app starts, because navigating inside the app drops the query string.
 * Reload without it to go back to normal.
 */
const MOCK_MODES = ['error', 'partial', 'denied', 'healthy', 'empty'] as const

type MockMode = (typeof MOCK_MODES)[number]

const readMockMode = (): MockMode | null => {
  const requested = new URLSearchParams(window.location.search).get('mock')
  return MOCK_MODES.find((mode) => mode === requested) ?? null
}

const ACTIVE_MODE = readMockMode()

export const isMockMode = (mode: MockMode) => ACTIVE_MODE === mode

/** The first attempt plus the one automatic retry configured in `query-client.ts`; only then does the error show. */
const FAILED_ATTEMPTS_PER_LOAD = 2

const failedAttempts = new Map<string, number>()

type FailOptions = {
  /** Also fails in `partial` mode. */
  inPartialMode?: boolean
}

/** Call at the top of a mock fetcher, with a name that is unique to it. */
export const failLoadIfMocked = (name: string, { inPartialMode = false }: FailOptions = {}) => {
  const shouldFail = ACTIVE_MODE === 'error' || (ACTIVE_MODE === 'partial' && inPartialMode)
  if (!shouldFail) return
  const attempts = failedAttempts.get(name) ?? 0
  if (attempts >= FAILED_ATTEMPTS_PER_LOAD) return
  failedAttempts.set(name, attempts + 1)
  throw new Error('The server could not be reached.')
}
