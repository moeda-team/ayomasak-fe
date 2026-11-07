import { cn } from '@/lib/utils'

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

export const RankedProgressList = ({ items, className }: RankedProgressListProps) => {
  const total = items.reduce((sum, item) => sum + item.count, 0)
  const maxCount = Math.max(1, ...items.map((item) => item.count))

  return (
    <ol className={cn('@container divide-y divide-border-default rounded-md border border-border-default', className)}>
      {items.map((item, index) => {
        const share = total === 0 ? 0 : Math.round((item.count / total) * 100)
        const fillPercent = (item.count / maxCount) * 100

        return (
          <li
            key={item.id}
            tabIndex={0}
            aria-label={`${index + 1}. ${item.label}: ${share}% (${item.count})`}
            className="group grid grid-cols-[1.5rem_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2 rounded-md px-3 py-3.5 text-body-sm outline-none focus-visible:shadow-focus-ring @lg:grid-cols-[1.5rem_minmax(0,1.6fr)_minmax(0,1fr)_3rem_3rem]"
          >
            <span className="text-text-secondary tabular-nums">{index + 1}</span>
            <span className="truncate">{item.label}</span>

            <div className="relative col-span-4 row-start-2 h-2 rounded-full bg-chart-track @lg:col-span-1 @lg:row-start-auto">
              <div
                className={cn(
                  'h-full origin-left animate-grow-x rounded-full motion-reduce:animate-none',
                  toRankColorClass(index),
                )}
                style={{ width: `${fillPercent}%`, animationDelay: `${index * 50}ms` }}
              />
              <div
                aria-hidden
                className="pointer-events-none absolute bottom-full z-10 mb-3 hidden -translate-x-1/2 flex-col items-center rounded-md bg-action-primary px-2 py-1 text-caption text-text-inverse tabular-nums group-hover:flex group-focus:flex"
                style={{ left: `${fillPercent / 2}%` }}
              >
                <span>{share}%</span>
                <span>({item.count})</span>
                <span className="absolute top-full size-2 -translate-y-1 rotate-45 bg-action-primary" />
              </div>
            </div>

            <span className="col-start-3 row-start-1 text-right tabular-nums @lg:col-start-auto @lg:row-start-auto">
              {share}%
            </span>
            <span className="col-start-4 row-start-1 text-right tabular-nums @lg:col-start-auto @lg:row-start-auto">
              {item.count}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
