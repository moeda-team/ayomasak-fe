import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'

type DetailDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  /** Read by screen readers only. */
  description: string
  children: ReactNode
}

/** Right-hand drawer with a titled header; the body scrolls on its own. */
export const DetailDrawer = ({ open, onOpenChange, title, description, children }: DetailDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-full gap-0 sm:max-w-115">
      <SheetHeader className="border-b border-border-default px-5 py-4">
        <SheetTitle className="text-heading-3">{title}</SheetTitle>
        <SheetDescription className="sr-only">{description}</SheetDescription>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5">{children}</div>
    </SheetContent>
  </Sheet>
)
