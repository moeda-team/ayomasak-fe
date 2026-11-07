/** Accepts only same-origin absolute paths, so `?redirect=` can never leave the app. */
export const toSafeRedirectPath = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const isSameOriginPath = value.startsWith('/') && !value.startsWith('//')
  return isSameOriginPath ? value : undefined
}
