import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

type DetailDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Read by screen readers only, unless `isDescriptionVisible` is set. */
  description: string
  isDescriptionVisible?: boolean
  /** Pinned under the scrolling body, e.g. the Close and primary action buttons. */
  footer?: ReactNode
  children: ReactNode
}

/** Right-hand drawer with a titled header; the body scrolls on its own. */
export const DetailDrawer = ({
  open,
  onOpenChange,
  title,
  description,
  isDescriptionVisible = false,
  footer,
  children,
}: DetailDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full gap-0 sm:max-w-115">
      <SheetHeader className="border-b border-border-default px-5 py-4">
        <SheetTitle className="text-heading-3">{title}</SheetTitle>
        <SheetDescription className={cn(isDescriptionVisible ? 'text-body-sm text-text-secondary' : 'sr-only')}>
          {description}
        </SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5">{children}</div>
      {footer && <footer className="flex justify-end gap-3 border-t border-border-default px-5 py-4">{footer}</footer>}
    </SheetContent>
  </Sheet>
)
