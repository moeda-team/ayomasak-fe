import { cn } from '@/lib/utils'

/** Full class names so Tailwind can see them. */
const AVATAR_COLOR_CLASSES = ['bg-avatar-1', 'bg-avatar-2', 'bg-avatar-3', 'bg-avatar-4', 'bg-avatar-5'] as const

/** Same key, same color on every visit. */
export const toColorIndex = (key: string) => [...key].reduce((sum, character) => sum + character.charCodeAt(0), 0)

/** "Nasi Goreng" and "Gado-gado" use one letter per word; a single word uses its first two letters. */
const toInitials = (name: string) => {
  const words = name.split(/[\s-]+/).filter(Boolean)
  const letters = words.length > 1 ? words.map((word) => word.charAt(0)).join('') : (words[0] ?? '')
  return letters.slice(0, 2).toUpperCase()
}

type InitialsAvatarProps = {
  name: string
  /** Picks a color from the palette; wraps around after the fifth. */
  colorIndex?: number
  className?: string
}

export const InitialsAvatar = ({ name, colorIndex = 0, className }: InitialsAvatarProps) => (
  <span
    aria-hidden
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-md text-caption text-text-inverse',
      AVATAR_COLOR_CLASSES[colorIndex % AVATAR_COLOR_CLASSES.length],
      className,
    )}
  >
    {toInitials(name)}
  </span>
)
