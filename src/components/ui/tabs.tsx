import * as React from "react"
import { Tabs as TabsPrimitive } from "radix-ui"
import { cn } from "@/lib/utils"

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col gap-6", className)} {...props} />
}

/** Underline tabs. The list scrolls sideways on narrow screens instead of wrapping. */
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex items-center gap-1 overflow-x-auto border-b border-border-default", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "-mb-px shrink-0 border-b-2 border-transparent px-3 py-2.5 text-body-sm whitespace-nowrap text-text-secondary outline-none transition-colors",
        "hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50",
        "data-[state=active]:border-border-focus data-[state=active]:text-text-brand",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content data-slot="tabs-content" className={cn("flex flex-col gap-6 outline-none", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
