import { DotsSixVerticalIcon, TrashIcon } from '@phosphor-icons/react'
import { Reorder, useDragControls } from 'motion/react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type EditorRowProps<TItem extends { id: string }> = {
  item: TItem
  /** Content between the drag handle and the delete button. */
  children: ReactNode
  removeLabel: string
  onRemove: () => void
  /** Shown before the content, after the drag handle (e.g. the step number). */
  leading?: ReactNode
}

const EditorRow = <TItem extends { id: string }>({ item, children, removeLabel, onRemove, leading }: EditorRowProps<TItem>) => {
  const dragControls = useDragControls()
  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="relative flex items-start gap-2 bg-surface-default"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        onPointerDown={(event) => dragControls.start(event)}
        className="mt-1.5 flex size-6 shrink-0 cursor-grab touch-none items-center justify-center rounded text-text-secondary outline-none hover:text-text-primary focus-visible:ring-[3px] focus-visible:ring-ring/50 active:cursor-grabbing"
      >
        <DotsSixVerticalIcon aria-hidden className="size-5" />
      </button>
      {leading}
      <div className="flex min-w-0 flex-1 flex-wrap items-start gap-2">{children}</div>
      <Button type="button" variant="outline" size="icon-sm" aria-label={removeLabel} onClick={onRemove} className="mt-0.5">
        <TrashIcon aria-hidden />
      </Button>
    </Reorder.Item>
  )
}

type EditorRowListProps<TItem extends { id: string }> = {
  items: TItem[]
  onReorder: (items: TItem[]) => void
  label: string
  renderRow: (item: TItem, index: number) => ReactNode
  removeLabel: (item: TItem, index: number) => string
  onRemove: (item: TItem) => void
  renderLeading?: (item: TItem, index: number) => ReactNode
}

/** A vertical list whose rows can be dragged into a new order by their handle and deleted. */
export const EditorRowList = <TItem extends { id: string }>({
  items,
  onReorder,
  label,
  renderRow,
  removeLabel,
  onRemove,
  renderLeading,
}: EditorRowListProps<TItem>) => (
  <Reorder.Group axis="y" values={items} onReorder={onReorder} aria-label={label} className="flex flex-col gap-3">
    {items.map((item, index) => (
      <EditorRow
        key={item.id}
        item={item}
        removeLabel={removeLabel(item, index)}
        onRemove={() => onRemove(item)}
        leading={renderLeading?.(item, index)}
      >
        {renderRow(item, index)}
      </EditorRow>
    ))}
  </Reorder.Group>
)
