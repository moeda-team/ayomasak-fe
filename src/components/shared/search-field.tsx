import { MagnifyingGlassIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type SearchFieldProps = Omit<ComponentProps<typeof Input>, 'type'>

export const SearchField = ({ className, ...inputProps }: SearchFieldProps) => (
  <div className={cn('relative', className)}>
    <MagnifyingGlassIcon
      className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-primary"
      aria-hidden
    />
    <Input type="search" className="pl-9 pointer-coarse:h-11" {...inputProps} />
  </div>
)
