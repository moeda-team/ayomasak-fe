import { cn } from '@/lib/utils'

type BrandLogoProps = {
  className?: string
  /** Extra classes for the name, e.g. to hide it while the sidebar is collapsed to its icon. */
  nameClassName?: string
}

/** The Masakuy mark with its name set in the app font, so the brand follows the theme and the type system. */
export const BrandLogo = ({ className, nameClassName }: BrandLogoProps) => (
  <span className={cn('inline-flex items-center gap-2', className)}>
    <img src="/masakuy-mark.svg" alt="" className="size-8 shrink-0 dark:brightness-0 dark:invert" />
    <span className={cn('text-2xl leading-none font-bold tracking-tight text-text-primary', nameClassName)}>Masakuy</span>
  </span>
)
