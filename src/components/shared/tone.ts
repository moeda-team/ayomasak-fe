export type Tone = 'brand' | 'danger' | 'warning' | 'success' | 'info' | 'neutral'

/** Soft background for an icon chip or pill. */
export const TONE_SURFACE_CLASS: Record<Tone, string> = {
  brand: 'bg-surface-brand-subtle',
  danger: 'bg-status-danger-subtle',
  warning: 'bg-status-warning-subtle',
  success: 'bg-status-success-subtle',
  info: 'bg-status-info-subtle',
  neutral: 'bg-surface-subtle',
}

/** Foreground color. SVG marks use `currentColor`, so this also colors strokes and fills. */
export const TONE_TEXT_CLASS: Record<Tone, string> = {
  brand: 'text-text-brand',
  danger: 'text-status-danger',
  warning: 'text-status-warning',
  success: 'text-status-success',
  info: 'text-status-info',
  neutral: 'text-text-secondary',
}
