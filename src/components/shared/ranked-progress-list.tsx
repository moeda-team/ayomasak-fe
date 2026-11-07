import { useState, type FocusEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import { ChartHoverMarker } from './chart-hover'

export type RankedItem = {
  id: string
  label: string
  count: number
}

type RankedProgressListProps = {
  items: RankedItem[]
  className?: string
}

/** Darkest for rank 1, fading out down the list. Full class names so Tailwind can see them. */
const RANK_COLOR_CLASSES = [
  'bg-chart-ink',
  'bg-chart-strong',
  'bg-chart-base',
  'bg-chart-mid',
  'bg-chart-soft',
  'bg-chart-faint',
] as const

const toRankColorClass = (index: number) =>
  RANK_COLOR_CLASSES[Math.min(index, RANK_COLOR_CLASSES.length - 1)] ?? 'bg-chart-faint'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

type RankedRowProps = {
  item: RankedItem
  rank: number
  share: number
  /** Width of the filled part relative to the longest bar, 0 to 100. */
  fillPercent: number
}

const RankedRow = ({ item, rank, share, fillPercent }: RankedRowProps) => {
  /** Marker position in px from the left of the track; null while the row is not hovered or focused. */
  const [markerX, setMarkerX] = useState<number | null>(null)

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setMarkerX(clamp(event.clientX - rect.left, 0, (rect.width * fillPercent) / 100))
  }

  const handleFocus = (event: FocusEvent<HTMLLIElement>) => {
    const track = event.currentTarget.querySelector('[data-track]')
    if (track) setMarkerX((track.getBoundingClientRect().width * fillPercent) / 200)
  }

  const clearMarker = () => setMarkerX(null)

  return (
    <li
      tabIndex={0}
      aria-label={`${rank}. ${item.label}: ${share}% (${item.count})`}
      className="grid grid-cols-[1.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2 rounded-md px-3 py-3.5 text-body-sm outline-none focus-visible:shadow-focus-ring @lg:grid-cols-[1.5rem_minmax(0,1.6fr)_minmax(0,1fr)_3rem_3rem]"
      onFocus={handleFocus}
      onBlur={clearMarker}
    >
      <span className="text-text-secondary tabular-nums">{rank}</span>
      <span className="truncate">{item.label}</span>

      <div
        data-track
        className="relative col-span-4 row-start-2 h-2 rounded-full bg-chart-track @lg:col-span-1 @lg:row-start-auto"
        onPointerEnter={handlePointerMove}
        onPointerMove={handlePointerMove}
        onPointerLeave={clearMarker}
      >
        <div
          className={cn(
            'h-full origin-left animate-grow-x rounded-full motion-reduce:animate-none',
            toRankColorClass(rank - 1),
          )}
          style={{ width: `${fillPercent}%`, animationDelay: `${(rank - 1) * 50}ms` }}
        />

        {markerX !== null && (
          <>
            <ChartHoverMarker className="absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2" style={{ left: markerX }} />
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-[calc(50%+0.5rem)] z-10 flex -translate-x-1/2 flex-col items-center"
              style={{ left: markerX }}
            >
              <div className="rounded-lg bg-action-primary px-3 py-1.5 text-left text-caption text-text-inverse tabular-nums">
                <p>{share}%</p>
                <p>({item.count})</p>
              </div>
              <span className="size-0 border-x-4 border-t-4 border-x-transparent border-t-action-primary" />
            </div>
          </>
        )}
      </div>

      <span className="col-start-3 row-start-1 text-right tabular-nums @lg:col-start-auto @lg:row-start-auto">
        {share}%
      </span>
      <span className="col-start-4 row-start-1 text-right tabular-nums @lg:col-start-auto @lg:row-start-auto">
        {item.count}
      </span>
    </li>
  )
}

export const RankedProgressList = ({ items, className }: RankedProgressListProps) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(1, ...items.map((item) => item.count))

  return (
    <ol className={cn('@container divide-y divide-border-default rounded-md border border-border-default', className)}>
      {items.map((item, index) => (
        <RankedRow
          key={item.id}
          item={item}
          rank={index + 1}
          share={total === 0 ? 0 : Math.round((item.count / total) * 100)}
          fillPercent={(item.count / maxCount) * 100}
        />
      ))}
    </ol>
  )
}
